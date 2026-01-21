import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db/connect';
import Waitlist from '../../../../lib/db/models/Waitlist';
import { rateLimit } from '../../../../lib/utils/rateLimiter';
import { sendWaitlistConfirmation } from '../../../../lib/email/send';

export async function POST(request) {
  try {
    const { email } = await request.json();

    // Validation
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Rate limiting: 3 attempts per IP per hour
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    const rateLimitKey = `waitlist:${ip}`;

    const rateLimitResult = await rateLimit(rateLimitKey, 3, 60 * 60 * 1000);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    await dbConnect();

    // Check if email already exists in waitlist
    const existingEntry = await Waitlist.findOne({ email: email.toLowerCase() });

    if (existingEntry) {
      if (existingEntry.status === 'pending') {
        return NextResponse.json(
          { error: 'You are already on the waitlist!' },
          { status: 400 }
        );
      } else if (existingEntry.status === 'converted') {
        return NextResponse.json(
          { error: 'You are already a registered user!' },
          { status: 400 }
        );
      }
    }

    // Create new waitlist entry
    const waitlistEntry = await Waitlist.create({
      email: email.toLowerCase(),
      status: 'pending',
      source: 'landing_page',
    });

    // Send confirmation email
    try {
      await sendWaitlistConfirmation(email);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the request if email fails, but log it
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully joined the waitlist! Check your email for confirmation.',
    });

  } catch (error) {
    console.error('Waitlist subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to join waitlist. Please try again.' },
      { status: 500 }
    );
  }
}

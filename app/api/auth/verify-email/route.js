import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db/connect';
import User from '../../../../lib/db/models/User';
import EmailVerification from '../../../../lib/db/models/EmailVerification';
import { rateLimit } from '../../../../lib/utils/rateLimiter';

export async function POST(request) {
  try {
    const { email, code, type } = await request.json(); // type can be 'primary' or 'secondary'

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and verification code are required' },
        { status: 400 }
      );
    }

    // Rate limiting: 10 attempts per email per 15 minutes
    const rateLimitKey = `verify-email:${email.toLowerCase()}`;
    const rateLimitResult = await rateLimit(rateLimitKey, 10, 15 * 60 * 1000);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many verification attempts. Please try again in 15 minutes.' },
        {
          status: 429,
          headers: rateLimitResult.headers
        }
      );
    }

    await dbConnect();

    // Find the verification record
    const verification = await EmailVerification.findOne({
      email: email.toLowerCase(),
      code: code.trim(),
      expiresAt: { $gt: new Date() }, // Not expired
      verified: false, // Not already used
    }).sort({ createdAt: -1 }); // Get the most recent

    if (!verification) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code. Please request a new code.' },
        { status: 400 }
      );
    }

    // Check attempt limit (max 5 attempts per verification code)
    if (verification.attempts >= 5) {
      return NextResponse.json(
        { error: 'Too many attempts with this code. Please request a new verification code.' },
        { status: 400 }
      );
    }

    // Increment attempts
    verification.attempts += 1;
    await verification.save();

    // Find user
    const query = type === 'secondary'
      ? { secondaryEmail: email.toLowerCase() }
      : { email: email.toLowerCase() };

    const user = await User.findOne(query);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found.' },
        { status: 404 }
      );
    }

    // Mark verification as used
    verification.verified = true;
    await verification.save();

    // Update user's verification status
    if (type === 'secondary') {
      user.secondaryEmailVerified = true;
    } else {
      user.emailVerified = true;
    }
    await user.save();

    // Invalidate all other verification codes for this user and email
    await EmailVerification.updateMany(
      {
        userId: user._id,
        email: email.toLowerCase(),
        _id: { $ne: verification._id },
        verified: false,
      },
      { $set: { verified: true } }
    );

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully!',
    });

  } catch (error) {
    console.error('Verify email error:', error);
    return NextResponse.json(
      { error: 'Failed to verify email. Please try again.' },
      { status: 500 }
    );
  }
}

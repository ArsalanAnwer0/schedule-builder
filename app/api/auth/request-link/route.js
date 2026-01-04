import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db/connect';
import User from '../../../../lib/db/models/User';
import VerificationCode from '../../../../lib/db/models/VerificationCode';
import { sendVerificationCode } from '../../../../lib/email/send';
import { rateLimit } from '../../../../lib/utils/rateLimiter';

// Generate 6-digit code
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Rate limiting: 5 requests per email per 15 minutes
    const rateLimitKey = `request-link:${email.toLowerCase()}`;
    if (!rateLimit(rateLimitKey, 5, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again in 15 minutes.' },
        { status: 429 }
      );
    }

    await dbConnect();

    // Check if user exists with either primary or secondary email
    const user = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { secondaryEmail: email.toLowerCase() }
      ]
    });

    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email. Please contact your office manager.' },
        { status: 404 }
      );
    }

    // Check rate limiting (1 code per 30 seconds for testing)
    const recentCode = await VerificationCode.findOne({
      email: email.toLowerCase(),
      createdAt: { $gt: new Date(Date.now() - 30000) } // 30 seconds
    });

    if (recentCode) {
      const waitTime = Math.ceil((30000 - (Date.now() - recentCode.createdAt)) / 1000);
      return NextResponse.json(
        { error: `Please wait ${waitTime} seconds before requesting a new code` },
        { status: 429 }
      );
    }

    // Generate 6-digit code
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save verification code
    await VerificationCode.create({
      email: email.toLowerCase(),
      code,
      expiresAt,
    });

    // Send email with verification code
    try {
      await sendVerificationCode(email, code);
      console.log('✅ Verification email sent successfully to:', email);

      return NextResponse.json({
        success: true,
        message: 'Verification code sent to your email',
      });
    } catch (emailError) {
      // Email sending failed - delete the verification code since we couldn't send it
      await VerificationCode.deleteOne({ email: email.toLowerCase(), code });
      console.error('❌ Failed to send verification email:', emailError);

      // Provide specific error messages
      let errorMessage = 'Failed to send verification code';
      if (emailError.message.includes('SMTP')) {
        errorMessage = 'Email service temporarily unavailable. Please try again in a few moments.';
      } else if (emailError.message.includes('Invalid login')) {
        errorMessage = 'Email configuration error. Please contact support.';
      } else if (emailError.message.includes('recipient')) {
        errorMessage = 'Unable to send email to this address. Please verify your email or try another one.';
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Request code error:', error);
    return NextResponse.json(
      { error: 'Failed to send verification code. Please try again.' },
      { status: 500 }
    );
  }
}

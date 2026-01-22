import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '../../../../lib/db/connect';
import User from '../../../../lib/db/models/User';
import PasswordReset from '../../../../lib/db/models/PasswordReset';
import { rateLimit } from '../../../../lib/utils/rateLimiter';
import { sendPasswordResetEmail } from '../../../../lib/email/send';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Rate limiting: 3 attempts per email per 15 minutes
    const rateLimitKey = `forgot-password:${email.toLowerCase()}`;
    const rateLimitResult = await rateLimit(rateLimitKey, 3, 15 * 60 * 1000);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many reset attempts. Please try again in 15 minutes.' },
        {
          status: 429,
          headers: rateLimitResult.headers
        }
      );
    }

    await dbConnect();

    // Find user by email
    const user = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { secondaryEmail: email.toLowerCase() }
      ]
    });

    // Always return success even if user not found (security best practice - prevent email enumeration)
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists with that email, you will receive a password reset link.',
      });
    }

    // Generate secure random token (32 bytes = 64 hex characters)
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Delete any existing unused tokens for this user
    await PasswordReset.deleteMany({
      userId: user._id,
      used: false
    });

    // Create new password reset token
    await PasswordReset.create({
      userId: user._id,
      token,
      expiresAt,
      used: false,
    });

    // Send password reset email
    try {
      await sendPasswordResetEmail(user.email, user.name, token);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      return NextResponse.json(
        { error: 'Failed to send password reset email. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset link sent to your email',
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}

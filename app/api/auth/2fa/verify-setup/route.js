import { NextResponse } from 'next/server';
import { TOTP } from 'otpauth';
import { requireAuth } from '../../../../../lib/auth/session';
import dbConnect from '../../../../../lib/db/connect';
import User from '../../../../../lib/db/models/User';
import { rateLimit } from '../../../../../lib/utils/rateLimiter';

export async function POST(request) {
  try {
    const { user } = await requireAuth();
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Verification code is required' },
        { status: 400 }
      );
    }

    // Rate limiting: 10 attempts per user per 5 minutes
    const rateLimitKey = `2fa-verify-setup:${user._id}`;
    if (!rateLimit(rateLimitKey, 10, 5 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Too many verification attempts. Please try again in 5 minutes.' },
        { status: 429 }
      );
    }

    await dbConnect();

    // Get user with 2FA secret
    const dbUser = await User.findById(user._id).select('+twoFactorSecret');

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!dbUser.twoFactorSecret) {
      return NextResponse.json(
        { error: 'Please initialize 2FA setup first' },
        { status: 400 }
      );
    }

    if (dbUser.twoFactorEnabled) {
      return NextResponse.json(
        { error: '2FA is already enabled' },
        { status: 400 }
      );
    }

    // Verify the TOTP code
    const totp = new TOTP({
      issuer: 'Schedule Builder',
      label: dbUser.email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: dbUser.twoFactorSecret,
    });

    const delta = totp.validate({ token: code.trim(), window: 1 });

    if (delta === null) {
      return NextResponse.json(
        { error: 'Invalid verification code. Please try again.' },
        { status: 400 }
      );
    }

    // Enable 2FA
    dbUser.twoFactorEnabled = true;
    await dbUser.save();

    return NextResponse.json({
      success: true,
      message: '2FA has been successfully enabled!',
    });

  } catch (error) {
    console.error('Verify 2FA setup error:', error);
    return NextResponse.json(
      { error: 'Failed to verify 2FA code. Please try again.' },
      { status: 500 }
    );
  }
}

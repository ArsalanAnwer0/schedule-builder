import { NextResponse } from 'next/server';
import { TOTP } from 'otpauth';
import crypto from 'crypto';
import { requireAuth } from '../../../../../lib/auth/session';
import dbConnect from '../../../../../lib/db/connect';
import User from '../../../../../lib/db/models/User';
import { rateLimit } from '../../../../../lib/utils/rateLimiter';

export async function POST(request) {
  try {
    const { user } = await requireAuth();
    const { code, isBackupCode } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Verification code is required' },
        { status: 400 }
      );
    }

    // Rate limiting: 10 attempts per user per 5 minutes
    const rateLimitKey = `2fa-disable:${user._id}`;
    if (!rateLimit(rateLimitKey, 10, 5 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again in 5 minutes.' },
        { status: 429 }
      );
    }

    await dbConnect();

    // Get user with 2FA data
    const dbUser = await User.findById(user._id).select('+twoFactorSecret +twoFactorBackupCodes');

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!dbUser.twoFactorEnabled) {
      return NextResponse.json(
        { error: '2FA is not enabled for this account' },
        { status: 400 }
      );
    }

    let verified = false;

    if (isBackupCode) {
      // Verify backup code
      const hashedCode = crypto.createHash('sha256').update(code.trim()).digest('hex');
      const codeIndex = dbUser.twoFactorBackupCodes.indexOf(hashedCode);

      if (codeIndex !== -1) {
        verified = true;
        // Remove the used backup code
        dbUser.twoFactorBackupCodes.splice(codeIndex, 1);
      }
    } else {
      // Verify TOTP code
      const totp = new TOTP({
        issuer: 'Schedule Builder',
        label: dbUser.email,
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: dbUser.twoFactorSecret,
      });

      const delta = totp.validate({ token: code.trim(), window: 1 });
      verified = delta !== null;
    }

    if (!verified) {
      return NextResponse.json(
        { error: 'Invalid verification code. Please try again.' },
        { status: 400 }
      );
    }

    // Disable 2FA
    dbUser.twoFactorEnabled = false;
    dbUser.twoFactorSecret = undefined;
    dbUser.twoFactorBackupCodes = undefined;
    await dbUser.save();

    return NextResponse.json({
      success: true,
      message: '2FA has been successfully disabled.',
    });

  } catch (error) {
    console.error('Disable 2FA error:', error);
    return NextResponse.json(
      { error: 'Failed to disable 2FA. Please try again.' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { TOTP } from 'otpauth';
import crypto from 'crypto';
import dbConnect from '../../../../../lib/db/connect';
import User from '../../../../../lib/db/models/User';
import { createSession, setSessionCookie } from '../../../../../lib/auth/session';
import { rateLimit } from '../../../../../lib/utils/rateLimiter';

export async function POST(request) {
  try {
    const { userId, code, isBackupCode } = await request.json();

    if (!userId || !code) {
      return NextResponse.json(
        { error: 'User ID and verification code are required' },
        { status: 400 }
      );
    }

    // Rate limiting: 10 attempts per user per 5 minutes
    const rateLimitKey = `2fa-login:${userId}`;
    if (!rateLimit(rateLimitKey, 10, 5 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Too many verification attempts. Please try again in 5 minutes.' },
        { status: 429 }
      );
    }

    await dbConnect();

    // Get user with 2FA data
    const user = await User.findById(userId).select('+twoFactorSecret +twoFactorBackupCodes');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.twoFactorEnabled) {
      return NextResponse.json(
        { error: '2FA is not enabled for this account' },
        { status: 400 }
      );
    }

    let verified = false;

    if (isBackupCode) {
      // Verify backup code
      const hashedCode = crypto.createHash('sha256').update(code.trim()).digest('hex');
      const codeIndex = user.twoFactorBackupCodes.indexOf(hashedCode);

      if (codeIndex !== -1) {
        verified = true;
        // Remove the used backup code
        user.twoFactorBackupCodes.splice(codeIndex, 1);
        await user.save();
      }
    } else {
      // Verify TOTP code
      const totp = new TOTP({
        issuer: 'Schedule Builder',
        label: user.email,
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: user.twoFactorSecret,
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

    // Create session
    const session = await createSession(user._id.toString());
    await setSessionCookie(session.token, session.expiresAt);

    // Return success with redirect URL based on role
    const redirectUrl = user.role === 'admin' ? '/admin' : '/dashboard';

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      redirectUrl,
    });

  } catch (error) {
    console.error('2FA login verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify 2FA code. Please try again.' },
      { status: 500 }
    );
  }
}

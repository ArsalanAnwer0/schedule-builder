import { NextResponse } from 'next/server';
import { TOTP, Secret } from 'otpauth';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { requireAuth } from '../../../../../lib/auth/session';
import dbConnect from '../../../../../lib/db/connect';
import User from '../../../../../lib/db/models/User';
import { rateLimit } from '../../../../../lib/utils/rateLimiter';

export async function POST(request) {
  try {
    const { user } = await requireAuth();

    // Rate limiting: 10 requests per user per 15 minutes
    const rateLimitKey = `2fa-enable:${user._id}`;
    const rateLimitResult = await rateLimit(rateLimitKey, 10, 15 * 60 * 1000);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again in 15 minutes.' },
        {
          status: 429,
          headers: rateLimitResult.headers
        }
      );
    }

    await dbConnect();

    // Get user with 2FA secret
    const dbUser = await User.findById(user._id).select('+twoFactorSecret +twoFactorBackupCodes');

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if 2FA is already enabled
    if (dbUser.twoFactorEnabled) {
      return NextResponse.json(
        { error: '2FA is already enabled for this account' },
        { status: 400 }
      );
    }

    // Generate a random secret for TOTP
    const secret = new Secret({ size: 20 });

    // Create TOTP instance
    const totp = new TOTP({
      issuer: 'Schedule Builder',
      label: dbUser.email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: secret,
    });

    // Generate backup codes (10 codes, 8 characters each)
    const backupCodes = Array.from({ length: 10 }, () =>
      crypto.randomBytes(4).toString('hex').toUpperCase()
    );

    // Store secret and backup codes (hashed) in database
    const hashedBackupCodes = backupCodes.map(code =>
      crypto.createHash('sha256').update(code).digest('hex')
    );

    dbUser.twoFactorSecret = secret.base32;
    dbUser.twoFactorBackupCodes = hashedBackupCodes;
    // Don't enable 2FA yet - user needs to verify first
    await dbUser.save();

    // Generate QR code
    const otpauthURL = totp.toString();
    const qrCodeDataURL = await QRCode.toDataURL(otpauthURL);

    return NextResponse.json({
      success: true,
      qrCode: qrCodeDataURL,
      secret: secret.base32,
      backupCodes: backupCodes, // Send plain codes once for user to save
    });

  } catch (error) {
    console.error('Enable 2FA error:', error);
    return NextResponse.json(
      { error: 'Failed to enable 2FA. Please try again.' },
      { status: 500 }
    );
  }
}

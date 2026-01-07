import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '../../../../lib/db/connect';
import User from '../../../../lib/db/models/User';
import PasswordReset from '../../../../lib/db/models/PasswordReset';
import { rateLimit } from '../../../../lib/utils/rateLimiter';

export async function POST(request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }

    // Rate limiting: 5 attempts per token per 15 minutes
    const rateLimitKey = `reset-password:${token}`;
    if (!rateLimit(rateLimitKey, 5, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Too many reset attempts. Please request a new reset link.' },
        { status: 429 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the reset token
    const resetRecord = await PasswordReset.findOne({
      token,
      expiresAt: { $gt: new Date() }, // Not expired
      used: false, // Not already used
    });

    if (!resetRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token. Please request a new reset link.' },
        { status: 400 }
      );
    }

    // Find the user
    const user = await User.findById(resetRecord.userId).select('+password');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password
    user.password = hashedPassword;
    await user.save();

    // Mark reset token as used
    resetRecord.used = true;
    await resetRecord.save();

    // Invalidate all other reset tokens for this user
    await PasswordReset.updateMany(
      {
        userId: user._id,
        _id: { $ne: resetRecord._id },
        used: false,
      },
      { $set: { used: true } }
    );

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully',
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}

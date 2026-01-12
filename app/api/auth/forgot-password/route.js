import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '../../../../lib/db/connect';
import User from '../../../../lib/db/models/User';
import PasswordReset from '../../../../lib/db/models/PasswordReset';
import { rateLimit } from '../../../../lib/utils/rateLimiter';
import { createNotification } from '../../../../lib/utils/notifications';

export async function POST(request) {
  try {
    const { email, newPassword } = await request.json();

    if (!email || !newPassword) {
      return NextResponse.json(
        { error: 'Email and new password are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
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

    // Always return success even if user not found (security best practice)
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'Your password reset request has been submitted for admin approval.',
      });
    }

    // Hash the new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create password reset request requiring admin approval
    await PasswordReset.create({
      userId: user._id,
      newPasswordHash,
      requiresAdminApproval: true,
      status: 'pending',
      expiresAt,
    });

    // Find all admins in the user's organization to notify them
    const admins = await User.find({
      role: 'admin',
      organizationName: user.organizationName,
    });

    // Create notification for all admins
    try {
      for (const admin of admins) {
        await createNotification(
          admin._id.toString(),
          'password_reset_request',
          `${user.name} (${user.email}) has requested a password reset.`,
          '/admin'
        );
      }
    } catch (notificationError) {
      console.error('Failed to create admin notifications:', notificationError);
    }

    return NextResponse.json({
      success: true,
      message: 'Your password reset request has been submitted for admin approval.',
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}

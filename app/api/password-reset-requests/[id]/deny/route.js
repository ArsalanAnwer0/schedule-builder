import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../../lib/auth/session';
import dbConnect from '../../../../../lib/db/connect';
import PasswordReset from '../../../../../lib/db/models/PasswordReset';
import User from '../../../../../lib/db/models/User';
import { createNotification } from '../../../../../lib/utils/notifications';

export async function POST(request, { params }) {
  try {
    const sessionData = await requireAdmin();
    await dbConnect();

    const { id } = params;

    // Find the password reset request
    const resetRequest = await PasswordReset.findById(id).populate('userId');

    if (!resetRequest) {
      return NextResponse.json(
        { error: 'Password reset request not found' },
        { status: 404 }
      );
    }

    // Verify admin is from same organization
    const admin = await User.findById(sessionData.user._id);
    if (resetRequest.userId.organizationName !== admin.organizationName) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Check if request is still pending
    if (resetRequest.status !== 'pending') {
      return NextResponse.json(
        { error: 'This request has already been processed' },
        { status: 400 }
      );
    }

    // Mark the request as denied
    resetRequest.status = 'denied';
    resetRequest.approvedBy = admin._id;
    resetRequest.approvedAt = new Date();
    await resetRequest.save();

    // Notify the student
    try {
      await createNotification(
        resetRequest.userId._id.toString(),
        'password_reset_denied',
        'Your password reset request has been denied. Please contact an administrator for assistance.',
        '/dashboard'
      );
    } catch (notificationError) {
      console.error('Failed to create notification:', notificationError);
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset request denied',
    });
  } catch (error) {
    console.error('Deny password reset error:', error);
    return NextResponse.json(
      { error: 'Failed to deny password reset request' },
      { status: 500 }
    );
  }
}

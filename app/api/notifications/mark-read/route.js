import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db/connect';
import Notification from '../../../../lib/db/models/Notification';
import { requireAuth } from '../../../../lib/auth/session';

// POST /api/notifications/mark-read - Mark notification(s) as read
export async function POST(request) {
  try {
    const { user } = await requireAuth();

    const { notificationIds, markAll } = await request.json();

    await dbConnect();

    if (markAll) {
      // Mark all unread notifications as read for this user
      await Notification.updateMany(
        { userId: user._id, read: false },
        { $set: { read: true } }
      );

      return NextResponse.json({
        success: true,
        message: 'All notifications marked as read',
      });
    }

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json(
        { error: 'notificationIds must be an array' },
        { status: 400 }
      );
    }

    // Mark specific notifications as read (only if they belong to the user)
    await Notification.updateMany(
      {
        _id: { $in: notificationIds },
        userId: user._id,
      },
      { $set: { read: true } }
    );

    return NextResponse.json({
      success: true,
      message: 'Notifications marked as read',
    });
  } catch (error) {
    console.error('Mark notifications as read error:', error);
    return NextResponse.json(
      { error: 'Failed to mark notifications as read' },
      { status: 500 }
    );
  }
}

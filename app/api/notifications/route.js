import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/db/connect';
import Notification from '../../../lib/db/models/Notification';
import { requireAuth } from '../../../lib/auth/session';

// GET /api/notifications - Fetch user's notifications
export async function GET(request) {
  try {
    const { user } = await requireAuth();

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'unread'; // 'unread', 'read', or 'all'
    const limit = parseInt(searchParams.get('limit') || '50');

    await dbConnect();

    let query = { userId: user._id };

    if (filter === 'unread') {
      query.read = false;
    } else if (filter === 'read') {
      query.read = true;
    }
    // If filter === 'all', don't add read filter

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Get unread count
    const unreadCount = await Notification.countDocuments({
      userId: user._id,
      read: false,
    });

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('Fetch notifications error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

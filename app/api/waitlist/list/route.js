import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '../../../../lib/db/connect';
import Waitlist from '../../../../lib/db/models/Waitlist';
import User from '../../../../lib/db/models/User';

export async function GET(request) {
  try {
    // Get session to verify admin access
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Verify user is an admin
    const user = await User.findOne({ email: session.user.email });

    if (!user || (user.role !== 'primary_admin' && user.role !== 'secondary_admin')) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (status && ['pending', 'invited', 'converted'].includes(status)) {
      query.status = status;
    }

    // Fetch waitlist entries with pagination
    const [entries, total] = await Promise.all([
      Waitlist.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Waitlist.countDocuments(query)
    ]);

    // Get status counts
    const statusCounts = await Waitlist.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const counts = {
      pending: 0,
      invited: 0,
      converted: 0,
      total: 0
    };

    statusCounts.forEach(item => {
      counts[item._id] = item.count;
      counts.total += item.count;
    });

    return NextResponse.json({
      success: true,
      data: {
        entries,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        counts
      }
    });

  } catch (error) {
    console.error('Waitlist list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch waitlist entries' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../lib/auth/session';
import dbConnect from '../../../../lib/db/connect';
import ScheduleHistory from '../../../../lib/db/models/ScheduleHistory';
import User from '../../../../lib/db/models/User';

// GET schedule history for organization (last 20 versions)
export async function GET() {
  try {
    const sessionData = await requireAdmin();
    await dbConnect();

    // Get current admin's organization
    const admin = await User.findById(sessionData.user._id);

    // Find all history entries for this organization
    const history = await ScheduleHistory.find({
      organizationName: admin.organizationName,
    })
      .sort({ version: -1 })
      .limit(20)
      .populate('publishedBy', 'name email')
      .lean();

    return NextResponse.json({
      history: history.map((entry) => ({
        _id: entry._id.toString(),
        version: entry.version,
        publishedBy: {
          name: entry.publishedBy?.name || 'Unknown',
          _id: entry.publishedBy?._id?.toString(),
        },
        publishedAt: entry.publishedAt,
        changeDescription: entry.changeDescription,
        strategyName: entry.scheduleSnapshot?.strategyName,
        totalWorkers: entry.scheduleSnapshot?.shifts?.length || 0,
      })),
      total: history.length,
      currentVersion: history[0]?.version || 0,
    });
  } catch (error) {
    console.error('Get schedule history error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedule history' },
      { status: 500 }
    );
  }
}

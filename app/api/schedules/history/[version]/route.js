import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../../lib/auth/session';
import dbConnect from '../../../../../lib/db/connect';
import ScheduleHistory from '../../../../../lib/db/models/ScheduleHistory';
import User from '../../../../../lib/db/models/User';

// GET specific version details
export async function GET(request, { params }) {
  try {
    const sessionData = await requireAdmin();
    await dbConnect();

    const { version } = params;

    // Get current admin's organization
    const admin = await User.findById(sessionData.user._id);

    // Find the history entry for this version
    const historyEntry = await ScheduleHistory.findOne({
      organizationName: admin.organizationName,
      version: parseInt(version),
    })
      .populate('publishedBy', 'name email')
      .lean();

    if (!historyEntry) {
      return NextResponse.json(
        { error: 'Version not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      version: historyEntry.version,
      publishedBy: {
        name: historyEntry.publishedBy?.name || 'Unknown',
        email: historyEntry.publishedBy?.email,
      },
      publishedAt: historyEntry.publishedAt,
      changeDescription: historyEntry.changeDescription,
      schedule: historyEntry.scheduleSnapshot,
    });
  } catch (error) {
    console.error('Get schedule version error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedule version' },
      { status: 500 }
    );
  }
}

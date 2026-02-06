import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../../../lib/auth/session';
import dbConnect from '../../../../../../lib/db/connect';
import Schedule from '../../../../../../lib/db/models/Schedule';
import ScheduleHistory from '../../../../../../lib/db/models/ScheduleHistory';
import User from '../../../../../../lib/db/models/User';

// POST revert to previous version
export async function POST(request, { params }) {
  try {
    const sessionData = await requireAdmin();
    await dbConnect();

    const { version } = params;
    const body = await request.json();
    const { changeDescription } = body;

    // Get current admin's organization
    const admin = await User.findById(sessionData.user._id);

    // Find the history entry for this version
    const historyEntry = await ScheduleHistory.findOne({
      organizationName: admin.organizationName,
      version: parseInt(version),
    });

    if (!historyEntry) {
      return NextResponse.json(
        { error: 'Version not found' },
        { status: 404 }
      );
    }

    // Unpublish current schedule
    await Schedule.updateMany(
      { organizationName: admin.organizationName, status: 'published' },
      { status: 'draft', isCurrentVersion: false }
    );

    // Create new schedule from snapshot
    const newSchedule = new Schedule({
      ...historyEntry.scheduleSnapshot,
      _id: undefined, // Generate new ID
      version: historyEntry.version + 0.1, // Mark as revert (e.g., 2.1)
      publishedBy: admin._id,
      publishedAt: new Date(),
      isCurrentVersion: true,
      previousVersionId: historyEntry.scheduleId,
      changeDescription: changeDescription || `Reverted to version ${version}`,
      status: 'published',
    });

    await newSchedule.save();

    // Create history entry for revert
    await ScheduleHistory.create({
      scheduleId: newSchedule._id,
      organizationName: admin.organizationName,
      version: newSchedule.version,
      publishedBy: admin._id,
      scheduleSnapshot: newSchedule.toObject(),
      changeDescription: newSchedule.changeDescription,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully reverted to version ${version}`,
      newSchedule: {
        _id: newSchedule._id.toString(),
        version: newSchedule.version,
      },
    });
  } catch (error) {
    console.error('Revert schedule error:', error);
    return NextResponse.json(
      { error: 'Failed to revert schedule' },
      { status: 500 }
    );
  }
}

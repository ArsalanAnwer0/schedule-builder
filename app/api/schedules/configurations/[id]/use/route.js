import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../../../lib/auth/session';
import dbConnect from '../../../../../../lib/db/connect';
import ScheduleConfiguration from '../../../../../../lib/db/models/ScheduleConfiguration';

// PUT /api/schedules/configurations/:id/use - Track configuration usage
export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const adminCheck = await requireAdmin();
    const admin = adminCheck.user;

    // Find and update configuration
    const configuration = await ScheduleConfiguration.findOneAndUpdate(
      {
        _id: id,
        organizationName: admin.organizationName
      },
      {
        $inc: { timesUsed: 1 },
        $set: { lastUsedAt: new Date() }
      },
      { new: true }
    );

    if (!configuration) {
      return NextResponse.json({ error: 'Configuration not found' }, { status: 404 });
    }

    return NextResponse.json({ configuration }, { status: 200 });
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Forbidden: Admin access required') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Error tracking configuration usage:', error);
    return NextResponse.json({ error: 'Failed to track configuration usage' }, { status: 500 });
  }
}

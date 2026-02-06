import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../../../lib/auth/session';
import dbConnect from '../../../../../../lib/db/connect';
import ScheduleConfiguration from '../../../../../../lib/db/models/ScheduleConfiguration';

// PUT /api/schedules/configurations/:id/use - Track configuration usage
export async function PUT(request, { params }) {
  try {
    const adminCheck = await requireAdmin();
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    await dbConnect();
    const admin = adminCheck.user;

    // Find and update configuration
    const configuration = await ScheduleConfiguration.findOneAndUpdate(
      {
        _id: params.id,
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
    console.error('Error tracking configuration usage:', error);
    return NextResponse.json({ error: 'Failed to track configuration usage' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../../../lib/auth/session';
import dbConnect from '../../../../../../lib/db/connect';
import ScheduleConfiguration from '../../../../../../lib/db/models/ScheduleConfiguration';

// POST /api/schedules/configurations/:id/set-default - Set as default configuration
export async function POST(request, { params }) {
  try {
    const adminCheck = await requireAdmin();
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    await dbConnect();
    const admin = adminCheck.user;

    // Find configuration
    const configuration = await ScheduleConfiguration.findOne({
      _id: params.id,
      organizationName: admin.organizationName
    });

    if (!configuration) {
      return NextResponse.json({ error: 'Configuration not found' }, { status: 404 });
    }

    // Set as default (pre-save hook will unset other defaults)
    configuration.isDefault = true;
    await configuration.save();

    return NextResponse.json({ configuration }, { status: 200 });
  } catch (error) {
    console.error('Error setting default configuration:', error);
    return NextResponse.json({ error: 'Failed to set default configuration' }, { status: 500 });
  }
}

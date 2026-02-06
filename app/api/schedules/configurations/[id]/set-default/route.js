import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../auth/[...nextauth]/route';
import connectDB from '../../../../../../lib/db/mongodb';
import ScheduleConfiguration from '../../../../../../lib/db/models/ScheduleConfiguration';

// POST /api/schedules/configurations/:id/set-default - Set as default configuration
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = session.user;
    if (admin.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    await connectDB();

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

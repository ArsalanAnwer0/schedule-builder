import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../../lib/auth/session';
import dbConnect from '../../../../../lib/db/connect';
import RecurringScheduleLog from '../../../../../lib/db/models/RecurringScheduleLog';

// GET /api/recurring-schedules/[id]/logs - Get generation history
export async function GET(request, { params }) {
  try {
    const adminCheck = await requireAdmin();
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    await dbConnect();
    const admin = adminCheck.user;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Fetch logs
    const logs = await RecurringScheduleLog.find({
      ruleId: params.id,
      organizationName: admin.organizationName
    })
      .populate('scheduleId')
      .sort({ runAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean();

    // Get total count
    const total = await RecurringScheduleLog.countDocuments({
      ruleId: params.id,
      organizationName: admin.organizationName
    });

    return NextResponse.json({ logs, total }, { status: 200 });
  } catch (error) {
    console.error('Error fetching recurring schedule logs:', error);
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../../lib/auth/session';
import dbConnect from '../../../../../lib/db/connect';
import RecurringScheduleRule from '../../../../../lib/db/models/RecurringScheduleRule';
import { calculateNextRunTime } from '../../../../../lib/utils/recurringSchedules';

// POST /api/recurring-schedules/[id]/toggle - Activate/deactivate rule
export async function POST(request, { params }) {
  try {
    const adminCheck = await requireAdmin();
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    await dbConnect();
    const admin = adminCheck.user;

    const body = await request.json();
    const { isActive } = body;

    if (isActive === undefined) {
      return NextResponse.json(
        { error: 'isActive is required' },
        { status: 400 }
      );
    }

    // Find rule
    const rule = await RecurringScheduleRule.findOne({
      _id: params.id,
      organizationName: admin.organizationName
    });

    if (!rule) {
      return NextResponse.json({ error: 'Rule not found' }, { status: 404 });
    }

    // If activating, recalculate nextRunAt from now
    const updateData = { isActive };
    if (isActive) {
      updateData.nextRunAt = calculateNextRunTime(rule);
    }

    // Update rule
    const updatedRule = await RecurringScheduleRule.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    ).populate('configurationId');

    return NextResponse.json({ rule: updatedRule }, { status: 200 });
  } catch (error) {
    console.error('Error toggling recurring schedule rule:', error);
    return NextResponse.json({ error: 'Failed to toggle rule' }, { status: 500 });
  }
}

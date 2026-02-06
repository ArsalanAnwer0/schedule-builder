import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../lib/auth/session';
import dbConnect from '../../../../lib/db/connect';
import RecurringScheduleRule from '../../../../lib/db/models/RecurringScheduleRule';
import RecurringScheduleLog from '../../../../lib/db/models/RecurringScheduleLog';
import { calculateNextRunTime } from '../../../../lib/utils/recurringSchedules';

// GET /api/recurring-schedules/[id] - Get single rule with details
export async function GET(request, { params }) {
  try {
    const adminCheck = await requireAdmin();
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    await dbConnect();
    const admin = adminCheck.user;

    const rule = await RecurringScheduleRule.findOne({
      _id: params.id,
      organizationName: admin.organizationName
    })
      .populate('configurationId')
      .populate('lastGeneratedScheduleId')
      .lean();

    if (!rule) {
      return NextResponse.json({ error: 'Rule not found' }, { status: 404 });
    }

    // Get recent logs
    const logs = await RecurringScheduleLog.find({
      ruleId: params.id,
      organizationName: admin.organizationName
    })
      .sort({ runAt: -1 })
      .limit(10)
      .lean();

    return NextResponse.json({ rule, logs }, { status: 200 });
  } catch (error) {
    console.error('Error fetching recurring schedule rule:', error);
    return NextResponse.json({ error: 'Failed to fetch rule' }, { status: 500 });
  }
}

// PATCH /api/recurring-schedules/[id] - Update rule
export async function PATCH(request, { params }) {
  try {
    const adminCheck = await requireAdmin();
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    await dbConnect();
    const admin = adminCheck.user;

    const body = await request.json();

    // Find existing rule
    const existingRule = await RecurringScheduleRule.findOne({
      _id: params.id,
      organizationName: admin.organizationName
    });

    if (!existingRule) {
      return NextResponse.json({ error: 'Rule not found' }, { status: 404 });
    }

    // Prepare update object
    const updateData = { ...body };

    // If frequency or day changed, recalculate nextRunAt
    if (
      body.frequency !== undefined ||
      body.dayOfWeek !== undefined ||
      body.dayOfMonth !== undefined ||
      body.timezone !== undefined
    ) {
      const tempRule = {
        frequency: body.frequency || existingRule.frequency,
        dayOfWeek: body.dayOfWeek !== undefined ? body.dayOfWeek : existingRule.dayOfWeek,
        dayOfMonth: body.dayOfMonth !== undefined ? body.dayOfMonth : existingRule.dayOfMonth,
        timezone: body.timezone || existingRule.timezone
      };
      updateData.nextRunAt = calculateNextRunTime(tempRule);
    }

    // Update rule
    const rule = await RecurringScheduleRule.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('configurationId');

    return NextResponse.json({ rule }, { status: 200 });
  } catch (error) {
    console.error('Error updating recurring schedule rule:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update rule' },
      { status: 500 }
    );
  }
}

// DELETE /api/recurring-schedules/[id] - Delete rule
export async function DELETE(request, { params }) {
  try {
    const adminCheck = await requireAdmin();
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    await dbConnect();
    const admin = adminCheck.user;

    const rule = await RecurringScheduleRule.findOneAndDelete({
      _id: params.id,
      organizationName: admin.organizationName
    });

    if (!rule) {
      return NextResponse.json({ error: 'Rule not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting recurring schedule rule:', error);
    return NextResponse.json({ error: 'Failed to delete rule' }, { status: 500 });
  }
}

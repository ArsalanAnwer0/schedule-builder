import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../lib/auth/session';
import dbConnect from '../../../lib/db/connect';
import RecurringScheduleRule from '../../../lib/db/models/RecurringScheduleRule';
import { calculateNextRunTime } from '../../../lib/utils/recurringSchedules';

// GET /api/recurring-schedules - List all recurring schedule rules
export async function GET(request) {
  try {
    const adminCheck = await requireAdmin();
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    await dbConnect();
    const admin = adminCheck.user;

    const rules = await RecurringScheduleRule.find({
      organizationName: admin.organizationName
    })
      .populate('configurationId')
      .populate('lastGeneratedScheduleId')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ rules }, { status: 200 });
  } catch (error) {
    console.error('Error fetching recurring schedule rules:', error);
    return NextResponse.json({ error: 'Failed to fetch rules' }, { status: 500 });
  }
}

// POST /api/recurring-schedules - Create new recurring schedule rule
export async function POST(request) {
  try {
    const adminCheck = await requireAdmin();
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    await dbConnect();
    const admin = adminCheck.user;

    const body = await request.json();
    const {
      name,
      description,
      frequency,
      dayOfWeek,
      dayOfMonth,
      timezone,
      configurationId,
      autoPublish,
      scheduleWeeksAhead,
      semesterEndDate,
      notifyOnConflict,
      notifyOnGeneration,
      availabilityChangeThreshold
    } = body;

    // Validation
    if (!name || !frequency || !configurationId) {
      return NextResponse.json(
        { error: 'Name, frequency, and configuration are required' },
        { status: 400 }
      );
    }

    if (frequency === 'monthly' && !dayOfMonth) {
      return NextResponse.json(
        { error: 'Day of month is required for monthly frequency' },
        { status: 400 }
      );
    }

    if ((frequency === 'weekly' || frequency === 'biweekly') && dayOfWeek === undefined) {
      return NextResponse.json(
        { error: 'Day of week is required for weekly/biweekly frequency' },
        { status: 400 }
      );
    }

    // Calculate initial nextRunAt
    const tempRule = {
      frequency,
      dayOfWeek,
      dayOfMonth,
      timezone: timezone || 'America/New_York'
    };
    const nextRunAt = calculateNextRunTime(tempRule);

    // Create rule
    const rule = await RecurringScheduleRule.create({
      organizationName: admin.organizationName,
      name,
      description: description || '',
      frequency,
      dayOfWeek: frequency === 'monthly' ? null : dayOfWeek,
      dayOfMonth: frequency === 'monthly' ? dayOfMonth : null,
      timezone: timezone || 'America/New_York',
      configurationId,
      autoPublish: autoPublish || false,
      scheduleWeeksAhead: scheduleWeeksAhead || 1,
      semesterEndDate: semesterEndDate || null,
      notifyOnConflict: notifyOnConflict !== undefined ? notifyOnConflict : true,
      notifyOnGeneration: notifyOnGeneration !== undefined ? notifyOnGeneration : true,
      availabilityChangeThreshold: availabilityChangeThreshold || 20,
      isActive: true,
      nextRunAt,
      createdBy: admin._id
    });

    // Populate configuration before returning
    await rule.populate('configurationId');

    return NextResponse.json({ rule }, { status: 201 });
  } catch (error) {
    console.error('Error creating recurring schedule rule:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create rule' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../lib/auth/session';
import dbConnect from '../../../../lib/db/connect';
import ScheduleConfiguration from '../../../../lib/db/models/ScheduleConfiguration';

// GET /api/schedules/configurations - List all configurations for organization
export async function GET(request) {
  try {
    const adminCheck = await requireAdmin();
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    await dbConnect();
    const admin = adminCheck.user;

    const configurations = await ScheduleConfiguration.find({
      organizationName: admin.organizationName
    })
      .sort({ isDefault: -1, lastUsedAt: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({ configurations }, { status: 200 });
  } catch (error) {
    console.error('Error fetching configurations:', error);
    return NextResponse.json({ error: 'Failed to fetch configurations' }, { status: 500 });
  }
}

// POST /api/schedules/configurations - Create new configuration
export async function POST(request) {
  try {
    const adminCheck = await requireAdmin();
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const admin = adminCheck.user;

    const body = await request.json();
    const {
      name,
      description,
      businessHours,
      shiftPreferences,
      breakTimes,
      overtimeRules,
      prioritySlots,
      isDefault
    } = body;

    if (!name) {
      return NextResponse.json({ error: 'Configuration name is required' }, { status: 400 });
    }

    await dbConnect();

    // Check if configuration with same name exists
    const existingConfig = await ScheduleConfiguration.findOne({
      organizationName: admin.organizationName,
      name
    });

    if (existingConfig) {
      return NextResponse.json(
        { error: 'A configuration with this name already exists' },
        { status: 409 }
      );
    }

    // Create new configuration
    const configuration = await ScheduleConfiguration.create({
      organizationName: admin.organizationName,
      name,
      description: description || '',
      businessHours: businessHours || undefined,
      shiftPreferences: shiftPreferences || undefined,
      breakTimes: breakTimes || [],
      overtimeRules: overtimeRules || undefined,
      prioritySlots: prioritySlots || [],
      isDefault: isDefault || false,
      createdBy: admin._id
    });

    return NextResponse.json({ configuration }, { status: 201 });
  } catch (error) {
    console.error('Error creating configuration:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create configuration' },
      { status: 500 }
    );
  }
}

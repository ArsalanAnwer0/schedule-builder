import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../../lib/auth/session';
import dbConnect from '../../../../../lib/db/connect';
import ScheduleConfiguration from '../../../../../lib/db/models/ScheduleConfiguration';
import Schedule from '../../../../../lib/db/models/Schedule';

// GET /api/schedules/configurations/:id - Get single configuration
export async function GET(request, { params }) {
  try {
    const adminCheck = await requireAdmin();
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    await dbConnect();
    const admin = adminCheck.user;

    const configuration = await ScheduleConfiguration.findOne({
      _id: params.id,
      organizationName: admin.organizationName
    }).lean();

    if (!configuration) {
      return NextResponse.json({ error: 'Configuration not found' }, { status: 404 });
    }

    return NextResponse.json({ configuration }, { status: 200 });
  } catch (error) {
    console.error('Error fetching configuration:', error);
    return NextResponse.json({ error: 'Failed to fetch configuration' }, { status: 500 });
  }
}

// PUT /api/schedules/configurations/:id - Update configuration
export async function PUT(request, { params }) {
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

    await dbConnect();

    // Find existing configuration
    const configuration = await ScheduleConfiguration.findOne({
      _id: params.id,
      organizationName: admin.organizationName
    });

    if (!configuration) {
      return NextResponse.json({ error: 'Configuration not found' }, { status: 404 });
    }

    // Check if new name conflicts with existing configuration
    if (name && name !== configuration.name) {
      const existingConfig = await ScheduleConfiguration.findOne({
        organizationName: admin.organizationName,
        name,
        _id: { $ne: params.id }
      });

      if (existingConfig) {
        return NextResponse.json(
          { error: 'A configuration with this name already exists' },
          { status: 409 }
        );
      }
    }

    // Update fields
    if (name !== undefined) configuration.name = name;
    if (description !== undefined) configuration.description = description;
    if (businessHours !== undefined) configuration.businessHours = businessHours;
    if (shiftPreferences !== undefined) configuration.shiftPreferences = shiftPreferences;
    if (breakTimes !== undefined) configuration.breakTimes = breakTimes;
    if (overtimeRules !== undefined) configuration.overtimeRules = overtimeRules;
    if (prioritySlots !== undefined) configuration.prioritySlots = prioritySlots;
    if (isDefault !== undefined) configuration.isDefault = isDefault;

    await configuration.save();

    return NextResponse.json({ configuration }, { status: 200 });
  } catch (error) {
    console.error('Error updating configuration:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update configuration' },
      { status: 500 }
    );
  }
}

// DELETE /api/schedules/configurations/:id - Delete configuration
export async function DELETE(request, { params }) {
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

    // Prevent deletion if it's the default configuration
    if (configuration.isDefault) {
      return NextResponse.json(
        { error: 'Cannot delete default configuration. Set another configuration as default first.' },
        { status: 400 }
      );
    }

    // Check if configuration is in use by any schedules
    const schedulesUsingConfig = await Schedule.countDocuments({
      organizationName: admin.organizationName,
      configurationId: params.id
    });

    if (schedulesUsingConfig > 0) {
      return NextResponse.json(
        { error: `Cannot delete configuration. It is currently used by ${schedulesUsingConfig} schedule(s).` },
        { status: 400 }
      );
    }

    // Delete configuration
    await ScheduleConfiguration.deleteOne({ _id: params.id });

    return NextResponse.json({ success: true, message: 'Configuration deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting configuration:', error);
    return NextResponse.json({ error: 'Failed to delete configuration' }, { status: 500 });
  }
}

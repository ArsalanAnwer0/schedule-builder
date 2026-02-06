import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../lib/auth/session';
import dbConnect from '../../../lib/db/connect';
import Schedule from '../../../lib/db/models/Schedule';
import User from '../../../lib/db/models/User';

// POST - Save generated schedules
export async function POST(request) {
  try {
    const adminCheck = await requireAdmin();
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const { schedules, scheduleConfig, configurationId } = await request.json();

    if (!schedules || !Array.isArray(schedules) || schedules.length === 0) {
      return NextResponse.json({ error: 'Schedules are required' }, { status: 400 });
    }

    await dbConnect();

    // Get admin's organization for scoping schedules (SECURITY FIX)
    const admin = await User.findById(adminCheck.user._id);

    // Delete only THIS organization's draft schedules before saving new ones (SECURITY FIX)
    await Schedule.deleteMany({
      status: 'draft',
      organizationName: admin.organizationName
    });

    // Save all 3 schedule options as drafts
    const savedSchedules = await Promise.all(
      schedules.map(async (schedule) => {
        // Map strategy title to strategy name
        const strategyMap = {
          'Option 1: Longer Shifts': 'long',
          'Option 2: Balanced Shifts': 'medium',
          'Option 3: Shorter Shifts': 'short'
        };

        const strategyName = strategyMap[schedule.name] || 'medium';

        // Transform the schedule data to match our Schema
        const shifts = [];
        const totalHoursByStudent = new Map();

        // Parse the schedule.schedule object (weekly schedule)
        Object.entries(schedule.schedule).forEach(([day, dayData]) => {
          if (dayData.workers && Array.isArray(dayData.workers)) {
            dayData.workers.forEach(worker => {
              // Add shift
              shifts.push({
                studentId: worker.workerId,
                day: day.toLowerCase(),
                startTime: worker.shift.start,
                endTime: worker.shift.end,
                hours: worker.shift.hours
              });

              // Track total hours per student
              const currentHours = totalHoursByStudent.get(worker.workerId.toString()) || 0;
              totalHoursByStudent.set(worker.workerId.toString(), currentHours + worker.shift.hours);
            });
          }
        });

        const scheduleDoc = new Schedule({
          periodId: null, // We'll add period management later
          organizationName: admin.organizationName, // SECURITY FIX: Scope to organization
          status: 'draft',
          strategyName: strategyName || null, // Optional for backward compatibility
          configurationId: configurationId || null, // Store reference to configuration
          shifts,
          totalHoursByStudent: Object.fromEntries(totalHoursByStudent),
          scheduleConfig: {
            startDate: scheduleConfig.scheduleStartDate,
            endDate: scheduleConfig.scheduleEndDate,
            officeStartTime: scheduleConfig.officeStartTime,
            officeEndTime: scheduleConfig.officeEndTime,
            configSnapshot: scheduleConfig.configSnapshot || null // Store full config snapshot
          }
        });

        return await scheduleDoc.save();
      })
    );

    return NextResponse.json({
      success: true,
      schedules: savedSchedules.map(s => ({
        id: s._id.toString(),
        strategyName: s.strategyName,
        status: s.status
      }))
    });

  } catch (error) {
    console.error('Save schedules error:', error);
    return NextResponse.json({ error: 'Failed to save schedules' }, { status: 500 });
  }
}

// GET - Fetch published schedule
export async function GET(request) {
  try {
    const adminCheck = await requireAdmin();
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    await dbConnect();

    // Get admin's organization to fetch only their schedules (SECURITY FIX)
    const admin = await User.findById(adminCheck.user._id);

    // Get the published schedule for this organization only
    const publishedSchedule = await Schedule.findOne({
      status: 'published',
      organizationName: admin.organizationName
    })
      .populate('shifts.studentId', 'name email')
      .sort({ publishedAt: -1 });

    if (!publishedSchedule) {
      return NextResponse.json({ schedule: null });
    }

    return NextResponse.json({
      schedule: {
        id: publishedSchedule._id.toString(),
        strategyName: publishedSchedule.strategyName,
        status: publishedSchedule.status,
        shifts: publishedSchedule.shifts,
        totalHoursByStudent: publishedSchedule.totalHoursByStudent,
        publishedAt: publishedSchedule.publishedAt,
        scheduleConfig: publishedSchedule.scheduleConfig
      }
    });

  } catch (error) {
    console.error('Get schedule error:', error);
    return NextResponse.json({ error: 'Failed to fetch schedule' }, { status: 500 });
  }
}

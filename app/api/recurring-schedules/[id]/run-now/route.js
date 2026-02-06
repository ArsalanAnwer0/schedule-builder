import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../../lib/auth/session';
import dbConnect from '../../../../../lib/db/connect';
import RecurringScheduleRule from '../../../../../lib/db/models/RecurringScheduleRule';
import RecurringScheduleLog from '../../../../../lib/db/models/RecurringScheduleLog';
import Schedule from '../../../../../lib/db/models/Schedule';
import User from '../../../../../lib/db/models/User';
import Availability from '../../../../../lib/db/models/Availability';
import { generateSchedule } from '../../../../../lib/scheduler';
import {
  calculateSchedulePeriod,
  calculateAvailabilityHash,
  detectAvailabilityChange,
  checkSemesterBoundary
} from '../../../../../lib/utils/recurringSchedules';
import { detectScheduleConflicts } from '../../../../../lib/utils/conflictDetection';

// POST /api/recurring-schedules/[id]/run-now - Manually trigger generation
export async function POST(request, { params }) {
  try {
    const adminCheck = await requireAdmin();
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    await dbConnect();
    const admin = adminCheck.user;

    // Find rule
    const rule = await RecurringScheduleRule.findOne({
      _id: params.id,
      organizationName: admin.organizationName
    }).populate('configurationId');

    if (!rule) {
      return NextResponse.json({ error: 'Rule not found' }, { status: 404 });
    }

    const now = new Date();

    // Calculate schedule period
    const period = calculateSchedulePeriod(rule, now);

    // Check semester boundary
    if (checkSemesterBoundary(rule, period)) {
      return NextResponse.json(
        { error: 'Semester end date has been reached' },
        { status: 400 }
      );
    }

    // Fetch students with availability
    const students = await User.find({
      organizationName: rule.organizationName,
      role: 'student'
    }).lean();

    if (!students || students.length === 0) {
      return NextResponse.json(
        { error: 'No students found' },
        { status: 400 }
      );
    }

    const studentsWithAvailability = await Promise.all(
      students.map(async (student) => {
        const availability = await Availability.findOne({
          userId: student._id
        }).lean();

        return {
          ...student,
          availability: availability?.availability || {}
        };
      })
    );

    // Calculate availability hash
    const currentHash = calculateAvailabilityHash(studentsWithAvailability);
    const availabilityChange = detectAvailabilityChange(rule, currentHash);

    // Get configuration
    const configuration = rule.configurationId;
    if (!configuration) {
      return NextResponse.json(
        { error: 'Configuration not found or deleted' },
        { status: 400 }
      );
    }

    // Generate schedule
    const scheduleData = {
      workers: studentsWithAvailability.map(s => ({
        id: s._id.toString(),
        name: s.name,
        availability: s.availability
      })),
      startDate: period.startDate,
      endDate: period.endDate,
      officeHours: configuration.businessHours,
      shiftPreferences: configuration.shiftPreferences,
      breakTimes: configuration.breakTimes || [],
      overtimeRules: configuration.overtimeRules || {},
      prioritySlots: configuration.prioritySlots || []
    };

    const result = generateSchedule(scheduleData);
    const selectedSchedule = result.medium;

    // Save schedule
    const newSchedule = await Schedule.create({
      periodId: null,
      organizationName: rule.organizationName,
      status: 'draft',
      strategyName: 'medium',
      configurationId: configuration._id,
      recurringRuleId: rule._id,
      shifts: selectedSchedule.shifts,
      totalHoursByStudent: selectedSchedule.totalHoursByStudent,
      scheduleConfig: {
        startDate: period.startDate,
        endDate: period.endDate,
        officeStartTime: configuration.businessHours?.monday?.startTime || '8:00 AM',
        officeEndTime: configuration.businessHours?.monday?.endTime || '4:30 PM',
        configSnapshot: configuration
      }
    });

    let logStatus = 'success';

    // Check availability changes
    if (availabilityChange.changed) {
      logStatus = 'availability_changed';
    }

    // Check conflicts if auto-publish
    let conflictCount = 0;
    if (rule.autoPublish) {
      const conflictResult = await detectScheduleConflicts(newSchedule._id, rule.organizationName);
      if (conflictResult.hasConflicts) {
        logStatus = 'conflict_detected';
        conflictCount = conflictResult.conflicts.length;
      }
    }

    // Create log
    await RecurringScheduleLog.create({
      ruleId: rule._id,
      organizationName: rule.organizationName,
      runAt: now,
      status: logStatus,
      scheduleId: newSchedule._id,
      schedulePeriod: {
        startDate: new Date(period.startDate),
        endDate: new Date(period.endDate)
      },
      metadata: {
        conflictCount,
        availabilityChangePercent: availabilityChange.percentageChanged,
        studentsAffected: students.length,
        autoPublished: false
      }
    });

    return NextResponse.json({
      schedule: newSchedule,
      status: logStatus,
      message: 'Schedule generated successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Error running recurring schedule manually:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate schedule' },
      { status: 500 }
    );
  }
}

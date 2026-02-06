import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db/connect';
import RecurringScheduleRule from '../../../../lib/db/models/RecurringScheduleRule';
import RecurringScheduleLog from '../../../../lib/db/models/RecurringScheduleLog';
import Schedule from '../../../../lib/db/models/Schedule';
import User from '../../../../lib/db/models/User';
import Availability from '../../../../lib/db/models/Availability';
import { generateSchedule } from '../../../../lib/scheduler';
import {
  calculateNextRunTime,
  calculateSchedulePeriod,
  calculateAvailabilityHash,
  checkSemesterBoundary
} from '../../../../lib/utils/recurringSchedules';

/**
 * Cron endpoint for generating recurring schedules
 * Triggered hourly by Vercel Cron
 * Protected by CRON_SECRET environment variable
 */
export async function GET(request) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error('CRON_SECRET not configured');
      return NextResponse.json(
        { error: 'Cron job not configured' },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error('Unauthorized cron request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Fetch eligible rules (isActive=true, nextRunAt <= now)
    const now = new Date();
    const eligibleRules = await RecurringScheduleRule.find({
      isActive: true,
      nextRunAt: { $lte: now }
    }).populate('configurationId');

    console.log(`Found ${eligibleRules.length} eligible recurring rules`);

    let processed = 0;
    let succeeded = 0;
    let failed = 0;

    // Process each rule
    for (const rule of eligibleRules) {
      processed++;

      try {
        console.log(`Processing rule: ${rule.name} (${rule._id})`);

        // Calculate schedule period
        const period = calculateSchedulePeriod(rule, now);
        console.log(`Period: ${period.startDate} to ${period.endDate}`);

        // Check semester boundary
        if (checkSemesterBoundary(rule, period)) {
          console.log(`Semester boundary reached for rule ${rule._id}, deactivating`);

          await RecurringScheduleRule.findByIdAndUpdate(rule._id, {
            isActive: false
          });

          await RecurringScheduleLog.create({
            ruleId: rule._id,
            organizationName: rule.organizationName,
            runAt: now,
            status: 'skipped',
            schedulePeriod: {
              startDate: new Date(period.startDate),
              endDate: new Date(period.endDate)
            },
            errorMessage: 'Semester end date reached, rule deactivated'
          });

          continue;
        }

        // Fetch students with availability
        const students = await User.find({
          organizationName: rule.organizationName,
          role: 'student'
        }).lean();

        if (!students || students.length === 0) {
          throw new Error('No students found for organization');
        }

        // Fetch availability for each student
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

        // Get configuration
        const configuration = rule.configurationId;
        if (!configuration) {
          throw new Error('Configuration not found or deleted');
        }

        // Generate schedule using existing algorithm
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

        // Use medium strategy by default
        const selectedSchedule = result.medium;

        // Save schedule as draft initially
        const newSchedule = await Schedule.create({
          periodId: null, // Will be set when periods are implemented
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

        // Update rule
        await RecurringScheduleRule.findByIdAndUpdate(rule._id, {
          lastRunAt: now,
          nextRunAt: calculateNextRunTime(rule, now),
          lastGeneratedScheduleId: newSchedule._id,
          lastAvailabilityHash: currentHash
        });

        // Create success log
        await RecurringScheduleLog.create({
          ruleId: rule._id,
          organizationName: rule.organizationName,
          runAt: now,
          status: 'success',
          scheduleId: newSchedule._id,
          schedulePeriod: {
            startDate: new Date(period.startDate),
            endDate: new Date(period.endDate)
          },
          metadata: {
            conflictCount: 0,
            availabilityChangePercent: 0,
            studentsAffected: students.length,
            autoPublished: false
          }
        });

        succeeded++;
        console.log(`Successfully generated schedule for rule ${rule._id}`);
      } catch (error) {
        console.error(`Error processing rule ${rule._id}:`, error);

        // Log the failure
        await RecurringScheduleLog.create({
          ruleId: rule._id,
          organizationName: rule.organizationName,
          runAt: now,
          status: 'failed',
          errorMessage: error.message
        });

        failed++;
      }
    }

    return NextResponse.json({
      success: true,
      processed,
      succeeded,
      failed,
      timestamp: now.toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// Support POST as well
export async function POST(request) {
  return GET(request);
}

import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db/connect';
import RecurringScheduleRule from '../../../../lib/db/models/RecurringScheduleRule';
import RecurringScheduleLog from '../../../../lib/db/models/RecurringScheduleLog';

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
        // TODO: Implement generation logic in next commit
        console.log(`Processing rule: ${rule.name} (${rule._id})`);

        // Placeholder: Create a log entry
        await RecurringScheduleLog.create({
          ruleId: rule._id,
          organizationName: rule.organizationName,
          runAt: now,
          status: 'skipped',
          errorMessage: 'Generation logic not yet implemented'
        });

        succeeded++;
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

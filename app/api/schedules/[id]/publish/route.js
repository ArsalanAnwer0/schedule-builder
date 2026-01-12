import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../../lib/auth/session';
import dbConnect from '../../../../../lib/db/connect';
import Schedule from '../../../../../lib/db/models/Schedule';
import User from '../../../../../lib/db/models/User';
import { sendSchedulePublishedNotification } from '../../../../../lib/email/send';
import { createBulkNotifications } from '../../../../../lib/utils/notifications';
import { rateLimit } from '../../../../../lib/utils/rateLimiter';

// POST - Publish a schedule
export async function POST(request, { params }) {
  try {
    const adminCheck = await requireAdmin();
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    // Rate limiting: 20 publishes per admin per hour
    const rateLimitKey = `schedule-publish:${adminCheck.user._id}`;
    const rateLimitResult = await rateLimit(rateLimitKey, 20, 60 * 60 * 1000);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many schedule publications. Please try again later.' },
        {
          status: 429,
          headers: rateLimitResult.headers
        }
      );
    }

    const { id } = await params;

    await dbConnect();

    // Find the schedule to publish
    const schedule = await Schedule.findById(id);

    if (!schedule) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }

    // Unpublish any currently published schedules
    await Schedule.updateMany(
      { status: 'published' },
      { $set: { status: 'draft' } }
    );

    // Publish this schedule
    schedule.status = 'published';
    schedule.publishedAt = new Date();
    await schedule.save();

    // Get admin's organization to ensure we only notify students in the same org
    const admin = await User.findById(adminCheck.user._id);

    // Get students ONLY from the admin's organization (SECURITY FIX)
    const students = await User.find({
      role: 'student',
      organizationName: admin.organizationName
    }).select('email secondaryEmail name');

    // Send email notifications to all students (both primary and secondary emails)
    const emailResults = await Promise.allSettled(
      students.map(student => {
        const emails = [student.email];
        if (student.secondaryEmail) {
          emails.push(student.secondaryEmail);
        }
        return sendSchedulePublishedNotification(
          emails,
          student.name,
          schedule.scheduleConfig?.startDate,
          schedule.scheduleConfig?.endDate
        );
      })
    );

    const successfulEmails = emailResults.filter(r => r.status === 'fulfilled').length;
    const failedEmails = emailResults.filter(r => r.status === 'rejected').length;

    // Create notifications for all students
    try {
      await createBulkNotifications(
        students.map(s => s._id.toString()),
        'schedule_published',
        'A new schedule has been published! View your shifts on the dashboard.',
        '/dashboard'
      );
    } catch (notificationError) {
      console.error('Failed to create notifications:', notificationError);
      // Notification failure shouldn't prevent the schedule from being published
    }

    return NextResponse.json({
      success: true,
      message: `Schedule published successfully. Notifications sent to ${successfulEmails} student(s)${failedEmails > 0 ? `, ${failedEmails} failed` : ''}`,
      schedule: {
        id: schedule._id.toString(),
        status: schedule.status,
        publishedAt: schedule.publishedAt
      }
    });

  } catch (error) {
    console.error('Publish schedule error:', error);
    return NextResponse.json({ error: 'Failed to publish schedule' }, { status: 500 });
  }
}

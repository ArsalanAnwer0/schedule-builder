import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../../lib/auth/session';
import dbConnect from '../../../../../lib/db/connect';
import Schedule from '../../../../../lib/db/models/Schedule';
import User from '../../../../../lib/db/models/User';
import { sendSchedulePublishedNotification } from '../../../../../lib/email/send';

// POST - Publish a schedule
export async function POST(request, { params }) {
  try {
    const adminCheck = await requireAdmin();
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
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

    // Get all students to send notifications
    const students = await User.find({ role: 'student' }).select('email name');

    // Send email notifications to all students
    const emailResults = await Promise.allSettled(
      students.map(student =>
        sendSchedulePublishedNotification(
          student.email,
          student.name,
          schedule.scheduleConfig?.startDate,
          schedule.scheduleConfig?.endDate
        )
      )
    );

    const successfulEmails = emailResults.filter(r => r.status === 'fulfilled').length;
    const failedEmails = emailResults.filter(r => r.status === 'rejected').length;

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

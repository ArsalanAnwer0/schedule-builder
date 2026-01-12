import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../lib/auth/session';
import dbConnect from '../../../../lib/db/connect';
import User from '../../../../lib/db/models/User';
import { sendAvailabilityRequest } from '../../../../lib/email/send';
import { createBulkNotifications } from '../../../../lib/utils/notifications';
import { rateLimit } from '../../../../lib/utils/rateLimiter';

// POST request availability from students
export async function POST(request) {
  try {
    const adminCheck = await requireAdmin();
    if (adminCheck.error) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    // Rate limiting: 10 requests per admin per hour
    const rateLimitKey = `availability-request:${adminCheck.user._id}`;
    const rateLimitResult = await rateLimit(rateLimitKey, 10, 60 * 60 * 1000);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many availability requests. Please try again later.' },
        {
          status: 429,
          headers: rateLimitResult.headers
        }
      );
    }

    const { studentIds } = await request.json();

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json(
        { error: 'Student IDs are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Get all students by IDs (including secondary emails)
    const students = await User.find({
      _id: { $in: studentIds },
      role: 'student',
    }).select('_id email secondaryEmail name');

    if (students.length === 0) {
      return NextResponse.json(
        { error: 'No valid students found' },
        { status: 404 }
      );
    }

    // Mark availability as requested for these students
    console.log('Updating availabilityRequested for students:', studentIds);
    const updateResult = await User.updateMany(
      { _id: { $in: studentIds } },
      { $set: { availabilityRequested: true } }
    );
    console.log('Update result:', updateResult);

    // Verify the update
    const updatedStudents = await User.find({ _id: { $in: studentIds } });
    console.log('Updated students:', updatedStudents.map(s => ({
      id: s._id,
      name: s.name,
      email: s.email,
      availabilityRequested: s.availabilityRequested
    })));

    // Get admin info for notification
    const admin = await User.findById(adminCheck.user._id);

    // Create notifications for all students (primary communication method)
    try {
      await createBulkNotifications(
        studentIds.map(id => id.toString()),
        'availability_request',
        `${admin.name} has requested your availability. Please submit your available hours.`,
        '/dashboard'
      );
    } catch (notificationError) {
      console.error('Failed to create notifications:', notificationError);
      return NextResponse.json(
        { error: 'Failed to send notifications to students' },
        { status: 500 }
      );
    }

    // Send availability request emails as optional backup (don't block on failures)
    const emailPromises = students.map(async student => {
      const emails = [student.email];
      if (student.secondaryEmail) {
        emails.push(student.secondaryEmail);
      }
      try {
        await sendAvailabilityRequest(emails, student.name);
        return { success: true };
      } catch (err) {
        console.error(`Optional email notification failed for ${emails.join(', ')}:`, err);
        return { success: false };
      }
    });

    // Don't wait for emails, let them send in background
    Promise.all(emailPromises).catch(err => {
      console.error('Some email notifications failed (non-critical):', err);
    });

    return NextResponse.json({
      success: true,
      message: `Availability requested from ${students.length} student(s). Notifications sent successfully.`,
      sentCount: students.length,
    });

  } catch (error) {
    console.error('Request availability error:', error);
    return NextResponse.json(
      { error: 'Failed to send availability requests' },
      { status: 500 }
    );
  }
}

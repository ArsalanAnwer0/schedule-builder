import { NextResponse } from 'next/server';
import { requireAuth } from '../../../../lib/auth/session';
import dbConnect from '../../../../lib/db/connect';
import User from '../../../../lib/db/models/User';
import { sendAvailabilityRequest } from '../../../../lib/email/send';
import { createBulkNotifications } from '../../../../lib/utils/notifications';
import { rateLimit } from '../../../../lib/utils/rateLimiter';

export async function POST(request) {
  try {
    // Require admin authentication
    const { user } = await requireAuth();

    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can request availability' },
        { status: 403 }
      );
    }

    // Rate limiting: 50 requests per admin per hour
    const rateLimitKey = `students-request-availability:${user._id}`;
    const rateLimitResult = await rateLimit(rateLimitKey, 50, 60 * 60 * 1000);

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
        { error: 'Please select at least one student' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Get current admin's organization
    const admin = await User.findById(user._id);

    // Verify all students belong to admin's organization
    const students = await User.find({
      _id: { $in: studentIds },
      role: 'student',
      organizationName: admin.organizationName, // Security check
    });

    if (students.length === 0) {
      return NextResponse.json(
        { error: 'No valid students found in your organization' },
        { status: 404 }
      );
    }

    if (students.length !== studentIds.length) {
      return NextResponse.json(
        { error: 'Some students do not belong to your organization' },
        { status: 400 }
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

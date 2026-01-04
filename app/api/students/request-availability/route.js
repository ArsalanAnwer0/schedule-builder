import { NextResponse } from 'next/server';
import { requireAuth } from '../../../../lib/auth/session';
import dbConnect from '../../../../lib/db/connect';
import User from '../../../../lib/db/models/User';
import { sendAvailabilityRequest } from '../../../../lib/email/send';
import { createBulkNotifications } from '../../../../lib/utils/notifications';

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

    // Send availability request emails to all selected students (both primary and secondary emails)
    const emailPromises = students.map(student => {
      const emails = [student.email];
      if (student.secondaryEmail) {
        emails.push(student.secondaryEmail);
      }
      return sendAvailabilityRequest(emails, student.name)
        .catch(err => {
          console.error(`Failed to send email to ${emails.join(', ')}:`, err);
          return { success: false, email: emails.join(', ') };
        });
    });

    const results = await Promise.all(emailPromises);

    // Create notifications for all students
    try {
      await createBulkNotifications(
        studentIds.map(id => id.toString()),
        'availability_request',
        `${admin.name} has requested your availability. Please submit your available hours.`,
        '/dashboard'
      );
    } catch (notificationError) {
      console.error('Failed to create notifications:', notificationError);
      // Notification failure shouldn't prevent the request from succeeding
    }

    // Check if any emails failed
    const failedEmails = results.filter(r => r.success === false);

    if (failedEmails.length > 0) {
      return NextResponse.json({
        success: true,
        message: `Availability requests sent to ${students.length - failedEmails.length} student(s). ${failedEmails.length} email(s) failed.`,
        partialFailure: true,
        sentCount: students.length - failedEmails.length,
        failedCount: failedEmails.length,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Availability requests sent to ${students.length} student(s)`,
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

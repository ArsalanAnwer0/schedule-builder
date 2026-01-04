import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../lib/auth/session';
import dbConnect from '../../../../lib/db/connect';
import User from '../../../../lib/db/models/User';
import { sendAvailabilityRequest } from '../../../../lib/email/send';

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

    // Send availability request emails to all students (both primary and secondary emails)
    const emailResults = await Promise.allSettled(
      students.map(student => {
        const emails = [student.email];
        if (student.secondaryEmail) {
          emails.push(student.secondaryEmail);
        }
        return sendAvailabilityRequest(emails, student.name);
      })
    );

    // Count successes and failures
    const successful = emailResults.filter(r => r.status === 'fulfilled').length;
    const failed = emailResults.filter(r => r.status === 'rejected').length;

    return NextResponse.json({
      success: true,
      message: `Availability requests sent to ${successful} student(s)${failed > 0 ? `, ${failed} failed` : ''}`,
      successful,
      failed,
      total: students.length,
    });

  } catch (error) {
    console.error('Request availability error:', error);
    return NextResponse.json(
      { error: 'Failed to send availability requests' },
      { status: 500 }
    );
  }
}

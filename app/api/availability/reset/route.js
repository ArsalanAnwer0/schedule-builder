import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../lib/auth/session';
import dbConnect from '../../../../lib/db/connect';
import Availability from '../../../../lib/db/models/Availability';
import User from '../../../../lib/db/models/User';
import Notification from '../../../../lib/db/models/Notification';

// POST - Reset student availability (admin only)
export async function POST(request) {
  try {
    await dbConnect();

    // Temporary localhost bypass for testing
    if (process.env.NODE_ENV === 'development') {
      const url = new URL(request.url);
      if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
        const { studentId } = await request.json();

        if (!studentId) {
          return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
        }

        // Get student info for notification
        const student = await User.findById(studentId);
        if (!student) {
          return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }

        // Delete the student's availability
        await Availability.findOneAndDelete({ userId: studentId });

        // Set availabilityRequested to FALSE to lock them out
        await User.findByIdAndUpdate(studentId, {
          $set: { availabilityRequested: false }
        });

        // Create notification for the student
        await Notification.create({
          userId: studentId,
          type: 'availability_reset',
          message: 'Your availability has been reset by an admin. You will need to wait for a new availability request to submit again.',
          actionUrl: '/student/dashboard'
        });

        return NextResponse.json(
          {
            success: true,
            message: 'Availability reset successfully. You must request availability again for this student.'
          },
          { status: 200 }
        );
      }
    }

    // Regular authentication flow
    let sessionData;
    try {
      sessionData = await requireAdmin();
    } catch (error) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const { studentId } = await request.json();

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
    }

    // Get student info for notification
    const student = await User.findById(studentId);
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Delete the student's availability
    await Availability.findOneAndDelete({ userId: studentId });

    // Set availabilityRequested to FALSE to lock them out
    // Admin must request availability again to unlock
    await User.findByIdAndUpdate(studentId, {
      $set: { availabilityRequested: false }
    });

    // Create notification for the student
    await Notification.create({
      userId: studentId,
      type: 'availability_reset',
      message: 'Your availability has been reset by an admin. You will need to wait for a new availability request to submit again.',
      actionUrl: '/student/dashboard'
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Availability reset successfully. You must request availability again for this student.'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Reset availability error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json({ error: `Failed to reset availability: ${error.message}` }, { status: 500 });
  }
}

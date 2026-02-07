import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../lib/auth/session';
import dbConnect from '../../../../lib/db/connect';
import Availability from '../../../../lib/db/models/Availability';
import User from '../../../../lib/db/models/User';
import Notification from '../../../../lib/db/models/Notification';

export async function POST(request) {
  try {
    await dbConnect();

    // Temporary localhost bypass for testing
    if (process.env.NODE_ENV === 'development') {
      const url = new URL(request.url);
      if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
        // Mock admin user for localhost testing
        const mockAdmin = {
          user: {
            _id: 'mock-admin-id',
            name: 'Arsalan',
            email: 'test@localhost.com',
            role: 'admin',
            adminType: 'primary',
            organizationName: 'Test Org'
          }
        };

        const { studentIds } = await request.json();

        if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
          return NextResponse.json({ error: 'Student IDs are required' }, { status: 400 });
        }

        // Verify all students belong to mock organization
        const students = await User.find({
          _id: { $in: studentIds },
          role: 'student',
          organizationName: mockAdmin.user.organizationName
        });

        if (students.length === 0) {
          return NextResponse.json(
            { error: 'No valid students found in your organization' },
            { status: 404 }
          );
        }

        // Delete availability for all these students
        const deleteResult = await Availability.deleteMany({ userId: { $in: studentIds } });

        // Set availabilityRequested to FALSE to lock them all out
        await User.updateMany(
          { _id: { $in: studentIds } },
          { $set: { availabilityRequested: false } }
        );

        // Create notifications for all students
        const notifications = studentIds.map(studentId => ({
          userId: studentId,
          type: 'availability_reset',
          message: 'Your availability has been reset by an admin. You will need to wait for a new availability request to submit again.',
          actionUrl: '/student/dashboard'
        }));
        await Notification.insertMany(notifications);

        return NextResponse.json(
          {
            success: true,
            message: `Availability reset for ${studentIds.length} student(s). You must request availability again for them to submit.`,
            resetCount: deleteResult.deletedCount,
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

    const { studentIds } = await request.json();

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json({ error: 'Student IDs are required' }, { status: 400 });
    }

    // Get current admin's organization for security
    const admin = await User.findById(sessionData.user._id);

    // Verify all students belong to admin's organization (security check)
    const students = await User.find({
      _id: { $in: studentIds },
      role: 'student',
      organizationName: admin.organizationName
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
        { status: 403 }
      );
    }

    // Delete availability for all these students
    const deleteResult = await Availability.deleteMany({ userId: { $in: studentIds } });

    // Set availabilityRequested to FALSE to lock them all out
    // Admin must request availability again to unlock
    await User.updateMany(
      { _id: { $in: studentIds } },
      { $set: { availabilityRequested: false } }
    );

    // Create notifications for all students
    const notifications = studentIds.map(studentId => ({
      userId: studentId,
      type: 'availability_reset',
      message: 'Your availability has been reset by an admin. You will need to wait for a new availability request to submit again.',
      actionUrl: '/student/dashboard'
    }));
    await Notification.insertMany(notifications);

    return NextResponse.json(
      {
        success: true,
        message: `Availability reset for ${studentIds.length} student(s). You must request availability again for them to submit.`,
        resetCount: deleteResult.deletedCount,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Reset all availability error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: `Failed to reset availability: ${error.message}` },
      { status: 500 }
    );
  }
}

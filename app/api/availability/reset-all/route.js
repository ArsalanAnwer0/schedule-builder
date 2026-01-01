import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../lib/auth/session';
import dbConnect from '../../../../lib/db/connect';
import Availability from '../../../../lib/db/models/Availability';
import User from '../../../../lib/db/models/User';

export async function POST(request) {
  try {
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

    await dbConnect();

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

    return NextResponse.json({
      success: true,
      message: `Availability reset for ${studentIds.length} student(s). You must request availability again for them to submit.`,
      resetCount: deleteResult.deletedCount,
    });

  } catch (error) {
    console.error('Reset all availability error:', error);
    return NextResponse.json(
      { error: 'Failed to reset availability' },
      { status: 500 }
    );
  }
}

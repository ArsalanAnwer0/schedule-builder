import { NextResponse } from 'next/server';
import { requireAuth } from '../../../../lib/auth/session';
import dbConnect from '../../../../lib/db/connect';
import User from '../../../../lib/db/models/User';
import Availability from '../../../../lib/db/models/Availability';

export async function GET(request) {
  try {
    // Require admin authentication
    const { user } = await requireAuth();

    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can view student availability' },
        { status: 403 }
      );
    }

    await dbConnect();

    // Get current admin's organization
    const admin = await User.findById(user._id);

    // Get students from admin's organization only
    const students = await User.find({
      role: 'student',
      organizationName: admin.organizationName,
    }).sort({ name: 1 });

    // Get student IDs for filtering availability
    const studentIds = students.map(s => s._id);

    // Get availability data for students in this organization only
    const availabilities = await Availability.find({
      userId: { $in: studentIds },
    }).lean();

    // Create a map of userId to availability
    const availabilityMap = {};
    availabilities.forEach(avail => {
      availabilityMap[avail.userId.toString()] = {
        id: avail._id.toString(),
        availability: avail.availability,
        notes: avail.notes,
        submittedAt: avail.updatedAt,
      };
    });

    // Combine student data with availability status
    const studentsWithAvailability = students.map(student => ({
      id: student._id.toString(),
      name: student.name,
      email: student.email,
      hasSubmitted: !!availabilityMap[student._id.toString()],
      availability: availabilityMap[student._id.toString()] || null,
    }));

    return NextResponse.json({
      students: studentsWithAvailability,
    });

  } catch (error) {
    console.error('Get students availability error:', error);
    return NextResponse.json(
      { error: 'Failed to get students availability' },
      { status: 500 }
    );
  }
}

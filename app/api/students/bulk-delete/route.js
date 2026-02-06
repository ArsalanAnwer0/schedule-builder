import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/db/mongodb";
import User from "../../../../lib/db/models/User";
import Availability from "../../../../lib/db/models/Availability";
import { requireAdmin } from "../../../../lib/auth/requireAdmin";
import { createAuditLog } from "../../../../lib/utils/auditLog";

export async function POST(request) {
  try {
    const adminUser = await requireAdmin(request);
    const { studentIds } = await request.json();

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json(
        { error: 'Student IDs array is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Get student names before deletion for audit log
    const studentsToDelete = await User.find({
      _id: { $in: studentIds },
      organizationName: adminUser.organizationName,
      role: 'student'
    }).select('name email');

    // Delete all students in the array (organization-scoped)
    const deleteResult = await User.deleteMany({
      _id: { $in: studentIds },
      organizationName: adminUser.organizationName,
      role: 'student'
    });

    // Delete their availability records
    await Availability.deleteMany({
      studentId: { $in: studentIds },
      organizationName: adminUser.organizationName
    });

    // Create audit log
    await createAuditLog({
      user: adminUser,
      action: 'students_bulk_deleted',
      resourceType: 'student',
      resourceId: studentIds.join(','),
      resourceName: `${deleteResult.deletedCount} student(s)`,
      metadata: {
        studentCount: deleteResult.deletedCount,
        students: studentsToDelete.map(s => ({ id: s._id, name: s.name, email: s.email }))
      },
      request
    });

    return NextResponse.json({
      success: true,
      deletedCount: deleteResult.deletedCount,
      message: `Successfully deleted ${deleteResult.deletedCount} student(s)`
    });
  } catch (error) {
    console.error('Bulk delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete students' },
      { status: 500 }
    );
  }
}

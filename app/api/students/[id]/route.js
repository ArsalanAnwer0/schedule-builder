import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../lib/auth/session';
import dbConnect from '../../../../lib/db/connect';
import User from '../../../../lib/db/models/User';
import Availability from '../../../../lib/db/models/Availability';

// PUT update student
export async function PUT(request, { params }) {
  try {
    const adminCheck = await requireAdmin();
    if (adminCheck.error) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const { id } = await params;
    const { email, name } = await request.json();

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // First check if the student exists
    const currentStudent = await User.findById(id);
    if (!currentStudent) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Only check for email conflicts if the email is being changed
    if (email.toLowerCase().trim() !== currentStudent.email.toLowerCase()) {
      const existingUser = await User.findOne({
        email: email.toLowerCase().trim(),
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Email is already taken by another user' },
          { status: 400 }
        );
      }
    }

    const student = await User.findOneAndUpdate(
      { _id: id, role: 'student' },
      {
        email: email.toLowerCase().trim(),
        name: name.trim(),
      },
      { new: true }
    );

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      student: {
        id: student._id.toString(),
        email: student.email,
        name: student.name,
        createdAt: student.createdAt,
      },
    });

  } catch (error) {
    console.error('Update student error:', error);
    return NextResponse.json(
      { error: 'Failed to update student' },
      { status: 500 }
    );
  }
}

// DELETE student
export async function DELETE(request, { params }) {
  try {
    const adminCheck = await requireAdmin();
    if (adminCheck.error) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const { id } = await params;

    await dbConnect();

    const student = await User.findOneAndDelete({
      _id: id,
      role: 'student',
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Also delete the student's availability when deleting the student
    await Availability.deleteOne({ userId: id });

    return NextResponse.json({
      success: true,
      message: 'Student deleted successfully',
    });

  } catch (error) {
    console.error('Delete student error:', error);
    return NextResponse.json(
      { error: 'Failed to delete student' },
      { status: 500 }
    );
  }
}

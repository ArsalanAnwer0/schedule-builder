import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../lib/auth/session';
import dbConnect from '../../../../lib/db/connect';
import User from '../../../../lib/db/models/User';
import Availability from '../../../../lib/db/models/Availability';

// PUT update student
export async function PUT(request, { params }) {
  try {
    const sessionData = await requireAdmin();

    const { id } = await params;
    const { email, name } = await request.json();

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      );
    }

    // Validate email is @gmail.com (required for Google sign-in)
    if (!email.toLowerCase().trim().endsWith('@gmail.com')) {
      return NextResponse.json(
        { error: 'Only Gmail accounts (@gmail.com) are allowed. Users must sign in with Google.' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Get current admin's organization
    const admin = await User.findById(sessionData.user._id);

    // Verify student belongs to admin's organization
    const student = await User.findOne({
      _id: id,
      role: 'student',
      organizationName: admin.organizationName,
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found or does not belong to your organization' },
        { status: 404 }
      );
    }

    // Check if email is taken by another user
    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
      _id: { $ne: id },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email is already taken by another user' },
        { status: 400 }
      );
    }

    const updatedStudent = await User.findByIdAndUpdate(
      id,
      {
        email: email.toLowerCase().trim(),
        name: name.trim(),
      },
      { new: true }
    );

    if (!updatedStudent) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      student: {
        id: updatedStudent._id.toString(),
        email: updatedStudent.email,
        name: updatedStudent.name,
        createdAt: updatedStudent.createdAt,
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
    const sessionData = await requireAdmin();

    const { id } = await params;

    await dbConnect();

    // Get current admin's organization
    const admin = await User.findById(sessionData.user._id);

    // Verify student belongs to admin's organization before deleting
    const student = await User.findOne({
      _id: id,
      role: 'student',
      organizationName: admin.organizationName,
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found or does not belong to your organization' },
        { status: 404 }
      );
    }

    // Delete the student
    await User.findByIdAndDelete(id);

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

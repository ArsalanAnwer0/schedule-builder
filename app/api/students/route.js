import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../lib/auth/session';
import dbConnect from '../../../lib/db/connect';
import User from '../../../lib/db/models/User';

// GET all students
export async function GET() {
  try {
    const sessionData = await requireAdmin();

    await dbConnect();

    // Get current admin's organization
    const admin = await User.findById(sessionData.user._id);

    // Filter students by organization
    const students = await User.find({
      role: 'student',
      organizationName: admin.organizationName,
    })
      .select('_id email secondaryEmail name createdAt')
      .sort({ name: 1 });

    return NextResponse.json({
      students: students.map(s => ({
        id: s._id.toString(),
        email: s.email,
        secondaryEmail: s.secondaryEmail,
        name: s.name,
        createdAt: s.createdAt,
      })),
    });

  } catch (error) {
    console.error('Get students error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}

// POST create new student
export async function POST(request) {
  try {
    const sessionData = await requireAdmin();

    const { email, secondaryEmail, name } = await request.json();

    // At least one email is required
    if ((!email && !secondaryEmail) || !name) {
      return NextResponse.json(
        { error: 'At least one email and name are required' },
        { status: 400 }
      );
    }

    // Determine primary email (use first available)
    const primaryEmail = email?.trim() || secondaryEmail?.trim();

    await dbConnect();

    // Get current admin's organization
    const admin = await User.findById(sessionData.user._id);

    // Check if primary email already exists
    const existingUser = await User.findOne({
      email: primaryEmail.toLowerCase()
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this primary email already exists' },
        { status: 400 }
      );
    }

    // Check if secondary email is same as primary
    const trimmedSecondaryEmail = secondaryEmail?.trim();
    if (trimmedSecondaryEmail && trimmedSecondaryEmail.toLowerCase() === primaryEmail.toLowerCase()) {
      return NextResponse.json(
        { error: 'Secondary email cannot be the same as primary email' },
        { status: 400 }
      );
    }

    // Create student with admin's organization
    const student = await User.create({
      email: primaryEmail.toLowerCase(),
      secondaryEmail: trimmedSecondaryEmail ? trimmedSecondaryEmail.toLowerCase() : null,
      name: name.trim(),
      role: 'student',
      organizationName: admin.organizationName, // Link to admin's organization
    });

    return NextResponse.json({
      student: {
        id: student._id.toString(),
        email: student.email,
        secondaryEmail: student.secondaryEmail,
        name: student.name,
        createdAt: student.createdAt,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Create student error:', error);
    return NextResponse.json(
      { error: 'Failed to create student' },
      { status: 500 }
    );
  }
}

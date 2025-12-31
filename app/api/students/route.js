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
      .select('_id email name createdAt')
      .sort({ name: 1 });

    return NextResponse.json({
      students: students.map(s => ({
        id: s._id.toString(),
        email: s.email,
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

    const { email, name } = await request.json();

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Get current admin's organization
    const admin = await User.findById(sessionData.user._id);

    // Check if student already exists
    const existingUser = await User.findOne({
      email: email.toLowerCase().trim()
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 400 }
      );
    }

    // Create student with admin's organization
    const student = await User.create({
      email: email.toLowerCase().trim(),
      name: name.trim(),
      role: 'student',
      organizationName: admin.organizationName, // Link to admin's organization
    });

    return NextResponse.json({
      student: {
        id: student._id.toString(),
        email: student.email,
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

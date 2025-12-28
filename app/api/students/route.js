import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../lib/auth/session';
import dbConnect from '../../../lib/db/connect';
import User from '../../../lib/db/models/User';

// GET all students
export async function GET() {
  try {
    const adminCheck = await requireAdmin();
    if (adminCheck.error) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    await dbConnect();

    const students = await User.find({ role: 'student' })
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
    const adminCheck = await requireAdmin();
    if (adminCheck.error) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const { email, name } = await request.json();

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      );
    }

    await dbConnect();

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

    const student = await User.create({
      email: email.toLowerCase().trim(),
      name: name.trim(),
      role: 'student',
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

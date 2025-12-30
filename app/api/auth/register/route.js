import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db/connect';
import User from '../../../../lib/db/models/User';

export async function POST(request) {
  try {
    const { email, name, organizationName } = await request.json();

    // Validation
    if (!email || !name || !organizationName) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if there's already a primary admin
    const existingPrimaryAdmin = await User.findOne({
      role: 'admin',
      adminType: 'primary'
    });

    if (existingPrimaryAdmin) {
      return NextResponse.json(
        { error: 'Primary admin already exists. Please contact the admin for an invite.' },
        { status: 403 }
      );
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Create primary admin user (no password - will use passwordless auth)
    const user = await User.create({
      email,
      name,
      role: 'admin',
      adminType: 'primary',
      organizationName,
    });

    return NextResponse.json({
      success: true,
      message: 'Registration successful! You can now login using email verification.',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        adminType: user.adminType,
        organizationName: user.organizationName,
      },
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db/connect';
import User from '../../../../lib/db/models/User';
import { rateLimit } from '../../../../lib/utils/rateLimiter';

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

    // Rate limiting: 3 registration attempts per IP per hour
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    const rateLimitKey = `register:${ip}`;

    if (!rateLimit(rateLimitKey, 3, 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        { status: 429 }
      );
    }

    await dbConnect();

    // Normalize organization name (lowercase, trim)
    const normalizedOrgName = organizationName.toLowerCase().trim();

    // Check if there's already a primary admin FOR THIS ORGANIZATION
    const existingPrimaryAdmin = await User.findOne({
      role: 'admin',
      adminType: 'primary',
      organizationName: normalizedOrgName,
    });

    if (existingPrimaryAdmin) {
      return NextResponse.json(
        { error: 'Primary admin already exists for this organization. Please use a different organization name or contact the admin for an invite.' },
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
      organizationName: normalizedOrgName, // Use normalized name
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

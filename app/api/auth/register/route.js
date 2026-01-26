// Registration API - v2 (in-memory rate limiting)
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '../../../../lib/db/connect';
import User from '../../../../lib/db/models/User';
import { rateLimit } from '../../../../lib/utils/rateLimiter';
import { validatePasswordStrength } from '../../../../lib/utils/passwordStrength';

export async function POST(request) {
  try {
    const { email, name, organizationName, password } = await request.json();

    // Validation
    if (!email || !name || !organizationName || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Validate password strength (SECURITY FIX: Use comprehensive validator)
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.errors[0] }, // Return first error
        { status: 400 }
      );
    }

    // Rate limiting: 3 registration attempts per IP per hour
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    const rateLimitKey = `register:${ip}`;
    const rateLimitResult = await rateLimit(rateLimitKey, 3, 60 * 60 * 1000);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        {
          status: 429,
          headers: rateLimitResult.headers
        }
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

    // Check if email already exists (normalize to lowercase for consistency)
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create primary admin user with password
    const user = await User.create({
      email,
      name,
      password: hashedPassword,
      role: 'admin',
      adminType: 'primary',
      organizationName: normalizedOrgName, // Use normalized name
    });

    return NextResponse.json({
      success: true,
      message: 'Registration successful! You can now login with your email and password.',
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

    // Handle specific MongoDB errors
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyPattern || {})[0];
      return NextResponse.json(
        { error: `${field === 'email' ? 'Email' : 'This value'} is already registered` },
        { status: 400 }
      );
    }

    // Handle validation errors from Mongoose
    if (error.name === 'ValidationError') {
      const firstError = Object.values(error.errors)[0];
      return NextResponse.json(
        { error: firstError?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    // Handle connection errors
    if (error.name === 'MongoNetworkError' || error.message?.includes('ECONNREFUSED')) {
      return NextResponse.json(
        { error: 'Database connection failed. Please try again later.' },
        { status: 503 }
      );
    }

    // Always return specific error for debugging
    // The actual error helps diagnose production issues
    return NextResponse.json(
      { error: `Registration failed: ${error.message}` },
      { status: 500 }
    );
  }
}

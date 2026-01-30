import { NextResponse } from 'next/server';
import { createSession, setSessionCookie } from '../../../../../lib/auth/session';
import dbConnect from '../../../../../lib/db/connect';
import User from '../../../../../lib/db/models/User';
import { rateLimit } from '../../../../../lib/utils/rateLimiter';

export async function POST(request) {
  try {
    const { email, name, googleId, organizationName } = await request.json();

    // Validation
    if (!email || !name || !googleId || !organizationName) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate @gmail.com
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      return NextResponse.json(
        { error: 'Only Gmail accounts are allowed' },
        { status: 400 }
      );
    }

    // Rate limiting: 3 registration attempts per IP per hour
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    const rateLimitKey = `google-register:${ip}`;
    const rateLimitResult = await rateLimit(rateLimitKey, 3, 60 * 60 * 1000);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        { status: 429, headers: rateLimitResult.headers }
      );
    }

    await dbConnect();

    // Normalize organization name
    const normalizedOrgName = organizationName.toLowerCase().trim();

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered. Please sign in instead.' },
        { status: 400 }
      );
    }

    // Check if there's already a primary admin for this org
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

    // Create primary admin user with Google ID (no password)
    const user = await User.create({
      email: email.toLowerCase(),
      name,
      googleId,
      role: 'admin',
      adminType: 'primary',
      organizationName: normalizedOrgName,
      emailVerified: true, // Verified through Google
    });

    // Create session and log them in
    const session = await createSession(user._id.toString());
    await setSessionCookie(session.token, session.expiresAt);

    return NextResponse.json({
      success: true,
      message: 'Registration successful!',
      redirectUrl: '/admin',
    });
  } catch (error) {
    console.error('Google registration error:', error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      return NextResponse.json(
        { error: `${field === 'email' ? 'Email' : 'This value'} is already registered` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}

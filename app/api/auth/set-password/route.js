import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '../../../../lib/db/connect';
import User from '../../../../lib/db/models/User';
import { createSession, setSessionCookie } from '../../../../lib/auth/session';
import { rateLimit } from '../../../../lib/utils/rateLimiter';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Validate inputs
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Rate limiting: 5 attempts per email per 15 minutes
    const rateLimitKey = `set-password:${email.toLowerCase()}`;
    if (!rateLimit(rateLimitKey, 5, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again in 15 minutes.' },
        { status: 429 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find user by email
    const user = await User.findOne({
      email: email.toLowerCase()
    }).select('+password');

    // Check if user exists
    if (!user) {
      return NextResponse.json(
        { error: 'Email not found. Please contact your admin to add you first.' },
        { status: 404 }
      );
    }

    // Check if user is a student
    if (user.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can use this page. Admins should use the registration page.' },
        { status: 403 }
      );
    }

    // Check if password is already set
    if (user.password) {
      return NextResponse.json(
        { error: 'Password already set. Please use the login page.' },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user with password
    user.password = hashedPassword;
    await user.save();

    // Create session and auto-login the user
    const session = await createSession(user._id.toString());
    await setSessionCookie(session.token, session.expiresAt);

    return NextResponse.json({
      success: true,
      message: 'Password created successfully!',
      redirectUrl: '/dashboard',
    });
  } catch (error) {
    console.error('Set password error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

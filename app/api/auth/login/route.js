import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createSession, setSessionCookie } from '../../../../lib/auth/session';
import dbConnect from '../../../../lib/db/connect';
import User from '../../../../lib/db/models/User';
import { rateLimit } from '../../../../lib/utils/rateLimiter';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Rate limiting: 10 login attempts per email per 5 minutes
    const rateLimitKey = `login:${email.toLowerCase()}`;
    if (!rateLimit(rateLimitKey, 10, 5 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again in 5 minutes.' },
        { status: 429 }
      );
    }

    await dbConnect();

    // Find user by email (include password field)
    const user = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { secondaryEmail: email.toLowerCase() }
      ]
    }).select('+password');

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user has a password set
    if (!user.password) {
      return NextResponse.json(
        { error: 'This account uses email verification. Please use "Send Verification Code" to login.' },
        { status: 400 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      // Don't create session yet - user needs to verify 2FA first
      return NextResponse.json({
        success: true,
        requires2FA: true,
        userId: user._id.toString(),
        message: 'Please enter your 2FA code',
      });
    }

    // Create session (only if 2FA is not enabled)
    const session = await createSession(user._id.toString());
    await setSessionCookie(session.token, session.expiresAt);

    // Return success with redirect URL based on role
    const redirectUrl = user.role === 'admin' ? '/admin' : '/dashboard';

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      redirectUrl,
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}

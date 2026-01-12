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
    const rateLimitResult = await rateLimit(rateLimitKey, 10, 5 * 60 * 1000);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again in 5 minutes.' },
        {
          status: 429,
          headers: rateLimitResult.headers
        }
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

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockedUntil - new Date()) / 1000 / 60);
      return NextResponse.json(
        { error: `Account locked due to multiple failed login attempts. Try again in ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}.` },
        { status: 403 }
      );
    }

    // Reset lockout if time has passed
    if (user.lockedUntil && user.lockedUntil <= new Date()) {
      user.failedLoginAttempts = 0;
      user.lockedUntil = null;
      await user.save();
    }

    // Check if user has a password set
    // TODO: Email verification disabled for now
    // if (!user.password) {
    //   return NextResponse.json(
    //     { error: 'This account uses email verification. Please use "Send Verification Code" to login.' },
    //     { status: 400 }
    //   );
    // }

    if (!user.password) {
      return NextResponse.json(
        { error: 'Password not set for this account. Please contact administrator.' },
        { status: 400 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Increment failed login attempts
      user.failedLoginAttempts += 1;

      // Lock account after 5 failed attempts for 15 minutes
      if (user.failedLoginAttempts >= 5) {
        user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        await user.save();
        return NextResponse.json(
          { error: 'Too many failed login attempts. Your account has been locked for 15 minutes.' },
          { status: 403 }
        );
      }

      await user.save();
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Reset failed attempts on successful login
    if (user.failedLoginAttempts > 0) {
      user.failedLoginAttempts = 0;
      user.lockedUntil = null;
      await user.save();
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

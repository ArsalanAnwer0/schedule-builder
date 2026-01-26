import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '../../../../lib/db/connect';
import User from '../../../../lib/db/models/User';
import { createSession, setSessionCookie } from '../../../../lib/auth/session';
import { rateLimit } from '../../../../lib/utils/rateLimiter';
import { validatePasswordStrength } from '../../../../lib/utils/passwordStrength';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    console.log('[SET-PASSWORD] Step 1: Request received for email:', email);

    // Validate inputs
    if (!email || !password) {
      console.log('[SET-PASSWORD] Step 2: Validation failed - missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    console.log('[SET-PASSWORD] Step 2: Input validation passed');

    // Rate limiting: 10 attempts per email per 5 minutes
    const rateLimitKey = `set-password:${email.toLowerCase()}`;
    const rateLimitResult = await rateLimit(rateLimitKey, 10, 5 * 60 * 1000);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again in 5 minutes.' },
        {
          status: 429,
          headers: rateLimitResult.headers
        }
      );
    }

    // Validate password strength (SECURITY FIX: Use comprehensive validator)
    console.log('[SET-PASSWORD] Step 3: Validating password strength');
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      console.log('[SET-PASSWORD] Step 3: Password validation failed:', passwordValidation.errors);
      return NextResponse.json(
        { error: passwordValidation.errors[0] }, // Return first error
        { status: 400 }
      );
    }

    console.log('[SET-PASSWORD] Step 4: Connecting to database');
    await dbConnect();
    console.log('[SET-PASSWORD] Step 4: Database connected');

    // Find user by email (check both primary email and secondary email fields)
    console.log('[SET-PASSWORD] Step 5: Searching for user with email:', email.toLowerCase());
    let user = await User.findOne({
      email: email.toLowerCase()
    }).select('+password');

    // If not found by primary email, try secondary email (for secondary admins)
    if (!user) {
      console.log('[SET-PASSWORD] Step 5: Not found by primary email, checking secondaryEmail field');
      user = await User.findOne({
        secondaryEmail: email.toLowerCase()
      }).select('+password');
    }

    // Check if user exists
    if (!user) {
      console.log('[SET-PASSWORD] Step 5: User NOT FOUND for email:', email.toLowerCase());
      return NextResponse.json(
        { error: 'Email not found. Please contact your admin to add you first.' },
        { status: 404 }
      );
    }

    console.log('[SET-PASSWORD] Step 5: User found - ID:', user._id, 'Role:', user.role, 'AdminType:', user.adminType);

    // Check if user is a student or secondary admin
    console.log('[SET-PASSWORD] Step 6: Checking user role');
    if (user.role !== 'student' && user.role !== 'admin') {
      console.log('[SET-PASSWORD] Step 6: Invalid role:', user.role);
      return NextResponse.json(
        { error: 'Invalid user role. Please contact support.' },
        { status: 403 }
      );
    }

    // Primary admins should use the registration page
    if (user.role === 'admin' && user.adminType === 'primary') {
      console.log('[SET-PASSWORD] Step 6: Primary admin trying to use set-password');
      return NextResponse.json(
        { error: 'Primary admins should use the registration page.' },
        { status: 403 }
      );
    }

    // Check if password is already set
    console.log('[SET-PASSWORD] Step 7: Checking if password already set:', !!user.password);
    if (user.password) {
      console.log('[SET-PASSWORD] Step 7: Password already set for user');
      return NextResponse.json(
        { error: 'Password already set. Please use the login page.' },
        { status: 400 }
      );
    }

    // Hash the password
    console.log('[SET-PASSWORD] Step 8: Hashing password');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user with password
    console.log('[SET-PASSWORD] Step 9: Saving password to user');
    user.password = hashedPassword;
    await user.save();
    console.log('[SET-PASSWORD] Step 9: Password saved successfully');

    // Create session and auto-login the user
    console.log('[SET-PASSWORD] Step 10: Creating session');
    const session = await createSession(user._id.toString());
    await setSessionCookie(session.token, session.expiresAt);
    console.log('[SET-PASSWORD] Step 10: Session created and cookie set');

    // Determine redirect URL based on role
    const redirectUrl = user.role === 'admin' ? '/admin' : '/dashboard';

    console.log('[SET-PASSWORD] Step 11: SUCCESS - Redirecting to:', redirectUrl);
    return NextResponse.json({
      success: true,
      message: 'Password created successfully!',
      redirectUrl: redirectUrl,
    });
  } catch (error) {
    console.error('[SET-PASSWORD] ERROR:', error.message);
    console.error('[SET-PASSWORD] Stack:', error.stack);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

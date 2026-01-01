import { NextResponse } from 'next/server';
import { createSession, setSessionCookie } from '../../../../lib/auth/session';
import dbConnect from '../../../../lib/db/connect';
import User from '../../../../lib/db/models/User';
import VerificationCode from '../../../../lib/db/models/VerificationCode';

export async function POST(request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and verification code are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the verification code
    const verificationCode = await VerificationCode.findOne({
      email: email.toLowerCase(),
      code: code.trim(),
    });

    if (!verificationCode) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 401 }
      );
    }

    // Check if code has expired
    if (verificationCode.expiresAt < new Date()) {
      // Delete expired code
      await VerificationCode.deleteOne({ _id: verificationCode._id });
      return NextResponse.json(
        { error: 'Verification code has expired. Please request a new one.' },
        { status: 401 }
      );
    }

    // Find the user by either primary or secondary email
    const user = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { secondaryEmail: email.toLowerCase() }
      ]
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete the used verification code
    await VerificationCode.deleteOne({ _id: verificationCode._id });

    // Create session
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
    console.error('Verify code error:', error);
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    );
  }
}

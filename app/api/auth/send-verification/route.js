import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '../../../../lib/db/connect';
import User from '../../../../lib/db/models/User';
import EmailVerification from '../../../../lib/db/models/EmailVerification';
import { resend } from '../../../../lib/email/resend';
import { rateLimit } from '../../../../lib/utils/rateLimiter';

export async function POST(request) {
  try {
    const { email, type } = await request.json(); // type can be 'primary' or 'secondary'

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Rate limiting: 3 verification emails per email per 15 minutes
    const rateLimitKey = `send-verification:${email.toLowerCase()}`;
    if (!rateLimit(rateLimitKey, 3, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Too many verification requests. Please try again in 15 minutes.' },
        { status: 429 }
      );
    }

    await dbConnect();

    // Find user by email
    const query = type === 'secondary'
      ? { secondaryEmail: email.toLowerCase() }
      : { email: email.toLowerCase() };

    const user = await User.findOne(query);

    if (!user) {
      return NextResponse.json(
        { error: 'Email not found. Please contact your admin to add you first.' },
        { status: 404 }
      );
    }

    // Check if already verified
    const isVerified = type === 'secondary' ? user.secondaryEmailVerified : user.emailVerified;
    if (isVerified) {
      return NextResponse.json(
        { error: 'This email is already verified.' },
        { status: 400 }
      );
    }

    // Generate 6-digit verification code
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    // Invalidate any existing verification codes for this user and email
    await EmailVerification.updateMany(
      {
        userId: user._id,
        email: email.toLowerCase(),
        verified: false,
      },
      { $set: { verified: true } } // Mark old codes as used
    );

    // Create email verification record
    await EmailVerification.create({
      userId: user._id,
      email: email.toLowerCase(),
      code: verificationCode,
      expiresAt,
      verified: false,
      attempts: 0,
    });

    // Send verification email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Schedule Builder <onboarding@resend.dev>',
      to: email.toLowerCase(),
      subject: 'Verify Your Email - Schedule Builder',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #ffffff;
              border-radius: 8px;
              padding: 30px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #14b8a6;
              margin: 0;
              font-size: 28px;
            }
            .code-box {
              background-color: #f3f4f6;
              border: 2px solid #14b8a6;
              border-radius: 8px;
              padding: 20px;
              text-align: center;
              margin: 30px 0;
            }
            .code {
              font-size: 36px;
              font-weight: bold;
              color: #14b8a6;
              letter-spacing: 8px;
              font-family: 'Courier New', monospace;
            }
            .content {
              margin: 20px 0;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              text-align: center;
              color: #6b7280;
              font-size: 14px;
            }
            .button {
              display: inline-block;
              background-color: #14b8a6;
              color: #ffffff;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 6px;
              margin: 20px 0;
              font-weight: 500;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Email Verification</h1>
            </div>

            <div class="content">
              <p>Hello ${user.name},</p>
              <p>Thank you for using Schedule Builder! Please use the verification code below to verify your email address:</p>
            </div>

            <div class="code-box">
              <div class="code">${verificationCode}</div>
            </div>

            <div class="content">
              <p><strong>This code will expire in 15 minutes.</strong></p>
              <p>If you didn't request this verification code, please ignore this email.</p>
            </div>

            <div class="footer">
              <p>Schedule Builder - Simplifying Team Scheduling</p>
              <p>This is an automated email, please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Hello ${user.name},

Thank you for using Schedule Builder! Please use the verification code below to verify your email address:

Verification Code: ${verificationCode}

This code will expire in 15 minutes.

If you didn't request this verification code, please ignore this email.

---
Schedule Builder - Simplifying Team Scheduling
This is an automated email, please do not reply.
      `,
    });

    return NextResponse.json({
      success: true,
      message: 'Verification code sent successfully. Please check your email.',
      expiresIn: 900, // 15 minutes in seconds
    });

  } catch (error) {
    console.error('Send verification error:', error);
    return NextResponse.json(
      { error: 'Failed to send verification code. Please try again.' },
      { status: 500 }
    );
  }
}

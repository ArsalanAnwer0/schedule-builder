import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '../../../../lib/db/connect';
import User from '../../../../lib/db/models/User';
import PasswordReset from '../../../../lib/db/models/PasswordReset';
import { rateLimit } from '../../../../lib/utils/rateLimiter';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Rate limiting: 3 attempts per email per 15 minutes
    const rateLimitKey = `forgot-password:${email.toLowerCase()}`;
    if (!rateLimit(rateLimitKey, 3, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Too many reset attempts. Please try again in 15 minutes.' },
        { status: 429 }
      );
    }

    await dbConnect();

    // Find user by email
    const user = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { secondaryEmail: email.toLowerCase() }
      ]
    });

    // Always return success even if user not found (security best practice)
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link.',
      });
    }

    // Check if user has a password set (passwordless users can't reset)
    if (!user.password) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link.',
      });
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Create password reset record
    await PasswordReset.create({
      userId: user._id,
      token: resetToken,
      expiresAt,
      used: false,
    });

    // Send reset email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

    try {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'Schedule Builder <onboarding@resend.dev>',
        to: user.email,
        subject: 'Password Reset Request - Schedule Builder',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #1a1d29 0%, #2d3748 100%); padding: 40px 30px; text-align: center;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Schedule Builder</h1>
                      </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px 30px;">
                        <h2 style="margin: 0 0 20px 0; color: #1a1d29; font-size: 24px; font-weight: 600;">Reset Your Password</h2>
                        <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                          Hello ${user.name},
                        </p>
                        <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                          We received a request to reset your password. Click the button below to create a new password:
                        </p>

                        <!-- Call to Action Button -->
                        <div style="text-align: center; margin: 30px 0;">
                          <a href="${resetUrl}"
                             style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                            Reset Password
                          </a>
                        </div>

                        <p style="margin: 20px 0; color: #718096; font-size: 14px; line-height: 1.6;">
                          Or copy and paste this link into your browser:
                        </p>
                        <p style="margin: 0 0 20px 0; color: #3b82f6; font-size: 14px; word-break: break-all;">
                          ${resetUrl}
                        </p>

                        <p style="margin: 30px 0 0 0; color: #718096; font-size: 14px; line-height: 1.6;">
                          This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
                        </p>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                        <p style="margin: 0; color: #a0aec0; font-size: 12px;">
                          This is an automated message from Schedule Builder. Please do not reply to this email.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
        text: `Hello ${user.name},\n\nWe received a request to reset your password. Click the link below to create a new password:\n\n${resetUrl}\n\nThis link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.\n\n- Schedule Builder Team`,
      });
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
      // Still return success to avoid leaking user existence
    }

    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link.',
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}

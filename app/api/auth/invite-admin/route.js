import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../lib/auth/session';
import dbConnect from '../../../../lib/db/connect';
import User from '../../../../lib/db/models/User';
import { sendEmail } from '../../../../lib/email/send';

export async function POST(request) {
  try {
    // Require admin authentication
    let sessionData;
    try {
      sessionData = await requireAdmin();
    } catch (error) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, name } = await request.json();

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Get the current admin (to get organization name)
    const currentAdmin = await User.findById(sessionData.user._id);

    if (currentAdmin.adminType !== 'primary') {
      return NextResponse.json(
        { error: 'Only primary admin can invite other admins' },
        { status: 403 }
      );
    }

    // Check if there are already 3 admins
    const adminCount = await User.countDocuments({ role: 'admin' });

    if (adminCount >= 3) {
      return NextResponse.json(
        { error: 'Maximum of 3 admins allowed (1 primary + 2 secondary)' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'This email is already registered' },
        { status: 400 }
      );
    }

    // Create secondary admin (no password - will use passwordless auth)
    const newAdmin = await User.create({
      email,
      name,
      role: 'admin',
      adminType: 'secondary',
      organizationName: currentAdmin.organizationName,
    });

    // Send email invitation
    try {
      await sendEmail({
        to: email,
        subject: `You've been invited as Admin - ${currentAdmin.organizationName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0972d3;">Admin Invitation</h2>
            <p>Hi ${name},</p>
            <p>You've been invited by ${currentAdmin.name} to be a secondary admin for <strong>${currentAdmin.organizationName}</strong> on Schedule Builder.</p>

            <div style="background-color: #f6f8fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Your Login Email:</h3>
              <p><strong>Email:</strong> ${email}</p>
            </div>

            <p>You'll use email verification codes to login (no password needed). Simply enter your email on the login page and we'll send you a verification code.</p>

            <p style="margin-top: 30px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login"
                 style="background-color: #0972d3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Login to Schedule Builder
              </a>
            </p>

            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              If you didn't expect this invitation, please ignore this email.
            </p>
          </div>
        `,
        text: `
Hi ${name},

You've been invited by ${currentAdmin.name} to be a secondary admin for ${currentAdmin.organizationName} on Schedule Builder.

Your Login Email: ${email}

You'll use email verification codes to login (no password needed). Simply enter your email on the login page and we'll send you a verification code.

Login at: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login

If you didn't expect this invitation, please ignore this email.
        `,
      });
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError);
      // Delete the created admin if email fails
      await User.findByIdAndDelete(newAdmin._id);
      return NextResponse.json(
        { error: 'Failed to send invitation email. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Invitation sent to ${email}`,
      admin: {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        adminType: newAdmin.adminType,
      },
    });

  } catch (error) {
    console.error('Invite admin error:', error);
    return NextResponse.json(
      { error: 'Failed to invite admin' },
      { status: 500 }
    );
  }
}

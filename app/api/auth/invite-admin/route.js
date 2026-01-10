import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../lib/auth/session';
import dbConnect from '../../../../lib/db/connect';
import User from '../../../../lib/db/models/User';
import { sendAdminInvite } from '../../../../lib/email/send';

export async function POST(request) {
  try {
    // Require admin authentication
    let sessionData;
    try {
      sessionData = await requireAdmin();
    } catch (error) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, secondaryEmail, name } = await request.json();

    // At least one email is required
    if ((!email && !secondaryEmail) || !name) {
      return NextResponse.json(
        { error: 'At least one email and name are required' },
        { status: 400 }
      );
    }

    // Determine primary email (use first available)
    const primaryEmail = email?.trim() || secondaryEmail?.trim();

    await dbConnect();

    // Get the current admin (to get organization name)
    const currentAdmin = await User.findById(sessionData.user._id);

    if (currentAdmin.adminType !== 'primary') {
      return NextResponse.json(
        { error: 'Only primary admin can invite other admins' },
        { status: 403 }
      );
    }

    // Check if there are already 3 admins IN THIS ORGANIZATION
    const adminCount = await User.countDocuments({
      role: 'admin',
      organizationName: currentAdmin.organizationName,
    });

    if (adminCount >= 3) {
      return NextResponse.json(
        { error: 'Maximum of 3 admins allowed per organization (1 primary + 2 secondary)' },
        { status: 400 }
      );
    }

    // Check if primary email already exists
    const existingUser = await User.findOne({ email: primaryEmail.toLowerCase() });
    if (existingUser) {
      // Provide specific error message based on existing user role
      if (existingUser.role === 'student') {
        return NextResponse.json(
          { error: 'This email is already registered as a student. One email can only have one role.' },
          { status: 400 }
        );
      } else if (existingUser.role === 'admin') {
        return NextResponse.json(
          { error: 'This email is already registered as an admin.' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'This email is already registered' },
        { status: 400 }
      );
    }

    // Check if secondary email is same as primary
    const trimmedSecondaryEmail = secondaryEmail?.trim();
    if (trimmedSecondaryEmail && trimmedSecondaryEmail.toLowerCase() === primaryEmail.toLowerCase()) {
      return NextResponse.json(
        { error: 'Secondary email cannot be the same as primary email' },
        { status: 400 }
      );
    }

    // Create secondary admin (no password - will use passwordless auth)
    const newAdmin = await User.create({
      email: primaryEmail.toLowerCase(),
      secondaryEmail: trimmedSecondaryEmail ? trimmedSecondaryEmail.toLowerCase() : null,
      name,
      role: 'admin',
      adminType: 'secondary',
      organizationName: currentAdmin.organizationName,
    });

    // Send email invitation to both emails
    try {
      const emailsToNotify = [newAdmin.email];
      if (newAdmin.secondaryEmail) {
        emailsToNotify.push(newAdmin.secondaryEmail);
      }

      await sendAdminInvite(
        emailsToNotify,
        name,
        currentAdmin.name,
        currentAdmin.organizationName
      );
      console.log('Admin invitation email sent successfully to:', emailsToNotify.join(', '));
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError);
      // Email failure shouldn't prevent admin creation
    }

    return NextResponse.json({
      success: true,
      message: `Admin added successfully. They can log in with: ${newAdmin.email}`,
      admin: {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        secondaryEmail: newAdmin.secondaryEmail,
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

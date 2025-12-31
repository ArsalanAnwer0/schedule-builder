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
      await sendAdminInvite(
        email,
        name,
        currentAdmin.name,
        currentAdmin.organizationName
      );
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

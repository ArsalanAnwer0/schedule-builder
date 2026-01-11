import { NextResponse } from 'next/server';
import { requireAdmin, deleteSession } from '../../../../lib/auth/session';
import dbConnect from '../../../../lib/db/connect';
import User from '../../../../lib/db/models/User';
import Session from '../../../../lib/db/models/Session';
import Availability from '../../../../lib/db/models/Availability';
import AvailabilityEditRequest from '../../../../lib/db/models/AvailabilityEditRequest';
import Schedule from '../../../../lib/db/models/Schedule';
import VerificationCode from '../../../../lib/db/models/VerificationCode';

export async function DELETE(request) {
  try {
    // Require admin authentication
    let sessionData;
    try {
      sessionData = await requireAdmin();
    } catch (error) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get current admin from database
    const currentAdmin = await User.findById(sessionData.user._id);

    if (!currentAdmin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    // Get all users in this organization BEFORE deleting them
    const orgUsers = await User.find({ organizationName: currentAdmin.organizationName });
    const orgUserIds = orgUsers.map(u => u._id);
    const orgEmails = orgUsers.map(u => u.email);

    // Delete all related data for users in this organization
    await Promise.all([
      // Delete sessions
      Session.deleteMany({ userId: { $in: orgUserIds } }),

      // Delete availability data
      Availability.deleteMany({ userId: { $in: orgUserIds } }),

      // Delete availability edit requests
      AvailabilityEditRequest.deleteMany({ userId: { $in: orgUserIds } }),

      // Delete schedules for this organization only (SECURITY FIX)
      Schedule.deleteMany({ organizationName: currentAdmin.organizationName }),

      // Delete verification codes
      VerificationCode.deleteMany({ email: { $in: orgEmails } }),
    ]);

    // Delete students belonging to this organization
    await User.deleteMany({
      role: 'student',
      organizationName: currentAdmin.organizationName,
    });

    // Delete all admins in this organization (including self and secondary admins)
    await User.deleteMany({
      role: 'admin',
      organizationName: currentAdmin.organizationName,
    });

    // Clear session cookie
    await deleteSession();

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
    });

  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}

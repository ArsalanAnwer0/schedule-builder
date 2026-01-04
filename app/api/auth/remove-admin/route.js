import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../lib/auth/session';
import dbConnect from '../../../../lib/db/connect';
import User from '../../../../lib/db/models/User';
import Session from '../../../../lib/db/models/Session';
import Availability from '../../../../lib/db/models/Availability';
import AvailabilityEditRequest from '../../../../lib/db/models/AvailabilityEditRequest';
import VerificationCode from '../../../../lib/db/models/VerificationCode';

export async function DELETE(request) {
  try {
    // Require admin authentication (must be primary admin)
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

    // Only primary admins can remove other admins
    if (currentAdmin.adminType !== 'primary') {
      return NextResponse.json(
        { error: 'Only primary admins can remove other admins' },
        { status: 403 }
      );
    }

    // Get admin ID to remove from request body
    const { adminId } = await request.json();

    if (!adminId) {
      return NextResponse.json(
        { error: 'Admin ID is required' },
        { status: 400 }
      );
    }

    // Find the admin to remove
    const adminToRemove = await User.findById(adminId);

    if (!adminToRemove) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      );
    }

    // Verify the admin belongs to the same organization
    if (adminToRemove.organizationName !== currentAdmin.organizationName) {
      return NextResponse.json(
        { error: 'Cannot remove admin from different organization' },
        { status: 403 }
      );
    }

    // Prevent removing primary admin (only can delete account via delete-account route)
    if (adminToRemove.adminType === 'primary') {
      return NextResponse.json(
        { error: 'Cannot remove primary admin. Use delete account instead.' },
        { status: 403 }
      );
    }

    // Prevent removing self
    if (adminToRemove._id.toString() === currentAdmin._id.toString()) {
      return NextResponse.json(
        { error: 'Cannot remove yourself' },
        { status: 403 }
      );
    }

    // Delete all related data for this admin
    await Promise.all([
      // Delete sessions
      Session.deleteMany({ userId: adminToRemove._id }),

      // Delete availability (in case admin also had availability submitted)
      Availability.deleteMany({ userId: adminToRemove._id }),

      // Delete availability edit requests
      AvailabilityEditRequest.deleteMany({ userId: adminToRemove._id }),

      // Delete verification codes
      VerificationCode.deleteMany({ email: adminToRemove.email }),
    ]);

    // Delete the admin user
    await User.findByIdAndDelete(adminId);

    return NextResponse.json({
      success: true,
      message: 'Admin removed successfully',
    });

  } catch (error) {
    console.error('Remove admin error:', error);
    return NextResponse.json(
      { error: 'Failed to remove admin' },
      { status: 500 }
    );
  }
}

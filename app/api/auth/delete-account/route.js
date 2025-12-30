import { NextResponse } from 'next/server';
import { requireAdmin, deleteSession } from '../../../../lib/auth/session';
import dbConnect from '../../../../lib/db/connect';
import User from '../../../../lib/db/models/User';
import Session from '../../../../lib/db/models/Session';

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

    // Get current admin from session data
    const currentAdmin = sessionData.user;

    if (!currentAdmin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    // Delete all students associated with this admin
    // (Students don't have organizationName, so we assume all students belong to all admins)
    // If you want students to be per-admin, we'd need to add adminId to students
    await User.deleteMany({ role: 'student' });

    // Delete all sessions for this user
    await Session.deleteMany({ userId: currentAdmin._id });

    // Delete the user account
    await User.findByIdAndDelete(currentAdmin._id);

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

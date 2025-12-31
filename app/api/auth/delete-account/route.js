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

    // Get current admin from database
    const currentAdmin = await User.findById(sessionData.user._id);

    if (!currentAdmin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    // Delete only students belonging to this organization
    await User.deleteMany({
      role: 'student',
      organizationName: currentAdmin.organizationName,
    });

    // Delete all admins in this organization (including self)
    await User.deleteMany({
      role: 'admin',
      organizationName: currentAdmin.organizationName,
    });

    // Delete all sessions for users in this organization
    const orgUsers = await User.find({ organizationName: currentAdmin.organizationName });
    const orgUserIds = orgUsers.map(u => u._id);
    await Session.deleteMany({ userId: { $in: orgUserIds } });

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

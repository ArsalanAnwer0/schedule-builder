import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../lib/auth/session';
import dbConnect from '../../../../lib/db/connect';
import User from '../../../../lib/db/models/User';

// One-time endpoint to update existing admin accounts
export async function POST(request) {
  try {
    // Require admin authentication
    let sessionData;
    try {
      sessionData = await requireAdmin();
    } catch (error) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { organizationName } = await request.json();

    if (!organizationName) {
      return NextResponse.json(
        { error: 'Organization name is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Get current admin
    const currentAdmin = await User.findById(sessionData.userId);

    if (!currentAdmin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    // Check if already has adminType
    if (currentAdmin.adminType) {
      return NextResponse.json(
        { error: 'Admin already has adminType set', adminType: currentAdmin.adminType },
        { status: 400 }
      );
    }

    // Update to primary admin
    currentAdmin.adminType = 'primary';
    currentAdmin.organizationName = organizationName;
    await currentAdmin.save();

    return NextResponse.json({
      success: true,
      message: 'Admin account updated successfully',
      admin: {
        id: currentAdmin._id,
        email: currentAdmin.email,
        name: currentAdmin.name,
        adminType: currentAdmin.adminType,
        organizationName: currentAdmin.organizationName,
      },
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Migration failed' },
      { status: 500 }
    );
  }
}

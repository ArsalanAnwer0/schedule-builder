import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../lib/auth/session';
import dbConnect from '../../../../lib/db/connect';
import User from '../../../../lib/db/models/User';

export async function GET(request) {
  try {
    // Require admin authentication
    let sessionData;
    try {
      sessionData = await requireAdmin();
    } catch (error) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get all admins
    const admins = await User.find({ role: 'admin' })
      .select('_id name email adminType createdAt')
      .sort({ createdAt: 1 }); // Primary admin will be first (oldest)

    return NextResponse.json({
      admins: admins.map(admin => ({
        id: admin._id.toString(),
        name: admin.name,
        email: admin.email,
        adminType: admin.adminType,
        createdAt: admin.createdAt,
      })),
    });

  } catch (error) {
    console.error('Get admins error:', error);
    return NextResponse.json(
      { error: 'Failed to load admins' },
      { status: 500 }
    );
  }
}

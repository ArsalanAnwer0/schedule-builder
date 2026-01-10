import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../lib/auth/session';
import dbConnect from '../../../lib/db/connect';
import PasswordReset from '../../../lib/db/models/PasswordReset';
import User from '../../../lib/db/models/User';

// GET all pending password reset requests
export async function GET() {
  try {
    const sessionData = await requireAdmin();
    await dbConnect();

    // Get current admin's organization
    const admin = await User.findById(sessionData.user._id);

    // Find all pending password reset requests for users in this organization
    const requests = await PasswordReset.find({
      requiresAdminApproval: true,
      status: 'pending',
    })
      .populate('userId', 'name email organizationName')
      .sort({ createdAt: -1 });

    // Filter to only requests from users in the admin's organization
    const filteredRequests = requests.filter(
      (req) => req.userId?.organizationName === admin.organizationName
    );

    return NextResponse.json({
      requests: filteredRequests.map((req) => ({
        id: req._id.toString(),
        userName: req.userId?.name,
        userEmail: req.userId?.email,
        createdAt: req.createdAt,
        expiresAt: req.expiresAt,
      })),
    });
  } catch (error) {
    console.error('Get password reset requests error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch password reset requests' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../../lib/auth/session';
import dbConnect from '../../../../../lib/db/connect';
import AvailabilityEditRequest from '../../../../../lib/db/models/AvailabilityEditRequest';
import Availability from '../../../../../lib/db/models/Availability';

// POST - Approve or reject edit request (admin only)
export async function POST(request, { params }) {
  try {
    let sessionData;
    try {
      sessionData = await requireAdmin();
    } catch (error) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const { id } = await params;
    const { action } = await request.json(); // 'approve' or 'reject'

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Must be "approve" or "reject"' }, { status: 400 });
    }

    await dbConnect();

    // Find the edit request
    const editRequest = await AvailabilityEditRequest.findById(id);

    if (!editRequest) {
      return NextResponse.json({ error: 'Edit request not found' }, { status: 404 });
    }

    if (editRequest.status !== 'pending') {
      return NextResponse.json({
        error: `Edit request has already been ${editRequest.status}`
      }, { status: 400 });
    }

    // Update request status
    editRequest.status = action === 'approve' ? 'approved' : 'rejected';
    editRequest.reviewedBy = sessionData.user._id;
    editRequest.reviewedAt = new Date();
    await editRequest.save();

    // If approved, update the actual availability
    if (action === 'approve') {
      await Availability.findOneAndUpdate(
        { userId: editRequest.userId },
        {
          availability: editRequest.newAvailability,
          notes: editRequest.newNotes
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: action === 'approve'
        ? 'Edit request approved and availability updated'
        : 'Edit request rejected',
      request: {
        id: editRequest._id.toString(),
        status: editRequest.status
      }
    });

  } catch (error) {
    console.error('Process edit request error:', error);
    return NextResponse.json({ error: 'Failed to process edit request' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../../lib/auth/session';
import dbConnect from '../../../../../lib/db/connect';
import AvailabilityEditRequest from '../../../../../lib/db/models/AvailabilityEditRequest';
import Availability from '../../../../../lib/db/models/Availability';
import User from '../../../../../lib/db/models/User';
import { sendAvailabilityEditDecisionToStudent } from '../../../../../lib/email/send';
import { createNotification } from '../../../../../lib/utils/notifications';

// POST - Approve or reject edit request (admin only)
export async function POST(request, { params }) {
  try {
    await dbConnect();

    // Temporary localhost bypass for testing
    if (process.env.NODE_ENV === 'development') {
      const url = new URL(request.url);
      if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
        // Mock admin user for localhost testing
        const mockAdmin = {
          user: {
            _id: 'mock-admin-id',
            name: 'Arsalan',
            email: 'test@localhost.com',
            role: 'admin',
            adminType: 'primary',
            organizationName: 'Test Org'
          }
        };

        const { id } = await params;
        const { action } = await request.json();

        if (!action || !['approve', 'reject'].includes(action)) {
          return NextResponse.json({ error: 'Invalid action. Must be "approve" or "reject"' }, { status: 400 });
        }

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
        editRequest.reviewedBy = mockAdmin.user._id;
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

        // Create notification for student
        try {
          await createNotification(
            editRequest.userId.toString(),
            action === 'approve' ? 'edit_request_approved' : 'edit_request_rejected',
            action === 'approve'
              ? 'Your availability edit request has been approved.'
              : 'Your availability edit request was not approved.',
            '/dashboard'
          );
        } catch (notificationError) {
          console.error('Failed to create notification:', notificationError);
        }

        return NextResponse.json(
          {
            success: true,
            message: action === 'approve'
              ? 'Edit request approved and availability updated'
              : 'Edit request rejected',
            request: {
              id: editRequest._id.toString(),
              status: editRequest.status
            }
          },
          { status: 200 }
        );
      }
    }

    // Regular authentication flow
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

    // Send email notification to student (both primary and secondary emails)
    try {
      const student = await User.findById(editRequest.userId).select('email secondaryEmail name');
      if (student) {
        const studentEmails = [student.email];
        if (student.secondaryEmail) {
          studentEmails.push(student.secondaryEmail);
        }
        await sendAvailabilityEditDecisionToStudent(
          studentEmails,
          student.name,
          action === 'approve'
        );

        // Create notification for student
        await createNotification(
          editRequest.userId.toString(),
          action === 'approve' ? 'edit_request_approved' : 'edit_request_rejected',
          action === 'approve'
            ? 'Your availability edit request has been approved.'
            : 'Your availability edit request was not approved.',
          '/dashboard'
        );
      }
    } catch (emailError) {
      console.error('Failed to send email notification to student:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json(
      {
        success: true,
        message: action === 'approve'
          ? 'Edit request approved and availability updated'
          : 'Edit request rejected',
        request: {
          id: editRequest._id.toString(),
          status: editRequest.status
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Process edit request error:', error);
    return NextResponse.json({ error: 'Failed to process edit request' }, { status: 500 });
  }
}

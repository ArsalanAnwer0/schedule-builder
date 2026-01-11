import { NextResponse } from 'next/server';
import { requireAuth, requireAdmin } from '../../../../lib/auth/session';
import dbConnect from '../../../../lib/db/connect';
import AvailabilityEditRequest from '../../../../lib/db/models/AvailabilityEditRequest';
import Availability from '../../../../lib/db/models/Availability';
import User from '../../../../lib/db/models/User';
import { sendAvailabilityEditRequestToAdmin } from '../../../../lib/email/send';

// POST - Create a new edit request (student)
export async function POST(request) {
  try {
    let sessionData;
    try {
      sessionData = await requireAuth();
    } catch (error) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { newAvailability, newNotes, reason } = await request.json();

    if (!reason || !reason.trim()) {
      return NextResponse.json({ error: 'Reason for edit is required' }, { status: 400 });
    }

    if (!newAvailability) {
      return NextResponse.json({ error: 'New availability is required' }, { status: 400 });
    }

    await dbConnect();

    // Get current availability
    const currentAvailability = await Availability.findOne({ userId: sessionData.user._id });

    if (!currentAvailability) {
      return NextResponse.json({ error: 'No existing availability found' }, { status: 404 });
    }

    // Check if there's already a pending request
    const existingPendingRequest = await AvailabilityEditRequest.findOne({
      userId: sessionData.user._id,
      status: 'pending'
    });

    if (existingPendingRequest) {
      return NextResponse.json({
        error: 'You already have a pending edit request. Please wait for admin approval.'
      }, { status: 400 });
    }

    // Create new edit request
    const editRequest = await AvailabilityEditRequest.create({
      userId: sessionData.user._id,
      status: 'pending',
      reason: reason.trim(),
      oldAvailability: currentAvailability.availability,
      newAvailability: newAvailability,
      oldNotes: currentAvailability.notes || '',
      newNotes: newNotes || ''
    });

    // Send email notification to admin (both primary and secondary emails)
    try {
      // Get student's organization to find the correct admin (SECURITY FIX)
      const student = await User.findById(sessionData.user._id);

      const adminUser = await User.findOne({
        role: 'admin',
        organizationName: student.organizationName
      }).select('email secondaryEmail');

      if (adminUser) {
        const adminEmails = [adminUser.email];
        if (adminUser.secondaryEmail) {
          adminEmails.push(adminUser.secondaryEmail);
        }
        await sendAvailabilityEditRequestToAdmin(
          adminEmails,
          sessionData.user.name,
          sessionData.user.email,
          reason.trim()
        );
      }
    } catch (emailError) {
      console.error('Failed to send email notification to admin:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Edit request submitted successfully. Waiting for admin approval.',
      requestId: editRequest._id.toString()
    });

  } catch (error) {
    console.error('Create edit request error:', error);
    return NextResponse.json({ error: 'Failed to create edit request' }, { status: 500 });
  }
}

// GET - Fetch edit requests (admin: all pending, student: their own)
export async function GET(request) {
  try {
    let sessionData;
    try {
      sessionData = await requireAuth();
    } catch (error) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const isAdmin = sessionData.user.role === 'admin';

    let query;
    if (isAdmin) {
      // Admin sees only pending requests from their organization (SECURITY FIX)
      const admin = await User.findById(sessionData.user._id);

      // Get all students in the admin's organization
      const orgStudentIds = (await User.find({
        organizationName: admin.organizationName,
        role: 'student'
      }).select('_id')).map(u => u._id);

      query = {
        status: 'pending',
        userId: { $in: orgStudentIds }
      };
    } else {
      // Students see their own requests
      query = { userId: sessionData.user._id };
    }

    const requests = await AvailabilityEditRequest.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      requests: requests.map(req => ({
        id: req._id.toString(),
        userId: req.userId._id.toString(),
        userName: req.userId.name,
        userEmail: req.userId.email,
        status: req.status,
        reason: req.reason,
        oldAvailability: req.oldAvailability,
        newAvailability: req.newAvailability,
        oldNotes: req.oldNotes,
        newNotes: req.newNotes,
        createdAt: req.createdAt,
        reviewedAt: req.reviewedAt
      }))
    });

  } catch (error) {
    console.error('Get edit requests error:', error);
    return NextResponse.json({ error: 'Failed to fetch edit requests' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { requireAuth } from '../../../lib/auth/session';
import dbConnect from '../../../lib/db/connect';
import Availability from '../../../lib/db/models/Availability';
import User from '../../../lib/db/models/User';
import { createNotification } from '../../../lib/utils/notifications';

// Helper function to send email notifications (will be imported from email/send.js)
async function sendAvailabilitySubmittedNotification(adminEmail, studentName, studentEmail) {
  // Import dynamically to avoid circular dependencies
  const { sendAvailabilitySubmittedToAdmin } = await import('../../../lib/email/send');
  return sendAvailabilitySubmittedToAdmin(adminEmail, studentName, studentEmail);
}

async function sendAllSubmittedNotification(adminEmail, totalStudents) {
  const { sendAllAvailabilitySubmitted } = await import('../../../lib/email/send');
  return sendAllAvailabilitySubmitted(adminEmail, totalStudents);
}

export async function POST(request) {
  try {
    // Require authentication
    const { user } = await requireAuth();

    // Only students can submit availability
    if (user.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can submit availability' },
        { status: 403 }
      );
    }

    const { availability, notes } = await request.json();

    // Validate availability data
    if (!availability) {
      return NextResponse.json(
        { error: 'Availability data is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if availability was requested
    const studentUser = await User.findById(user._id);
    if (!studentUser.availabilityRequested) {
      return NextResponse.json(
        { error: 'Availability has not been requested yet. Please wait for your manager to request it.' },
        { status: 403 }
      );
    }

    // Check if this is a new submission (not an update)
    const existingAvailability = await Availability.findOne({ userId: user._id });
    const isNewSubmission = !existingAvailability;

    // Upsert availability (update if exists, create if not)
    const savedAvailability = await Availability.findOneAndUpdate(
      { userId: user._id },
      {
        userId: user._id,
        availability,
        notes: notes || '',
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    );

    // Only send notifications for new submissions, not updates
    if (isNewSubmission) {
      try {
        // Send email to admin about this submission (both primary and secondary emails)
        const adminUser = await User.findOne({ role: 'admin' }).select('email secondaryEmail');
        if (adminUser) {
          const adminEmails = [adminUser.email];
          if (adminUser.secondaryEmail) {
            adminEmails.push(adminUser.secondaryEmail);
          }

          await sendAvailabilitySubmittedNotification(
            adminEmails,
            user.name,
            user.email
          );

          // Create notification for admin
          await createNotification(
            adminUser._id.toString(),
            'availability_submitted',
            `${user.name} has submitted their availability.`,
            '/admin'
          );

          // Check if all students who were requested have now submitted
          const requestedStudents = await User.find({
            role: 'student',
            availabilityRequested: true
          });

          const submittedCount = await Availability.countDocuments({
            userId: { $in: requestedStudents.map(s => s._id) }
          });

          // If all requested students have submitted, send summary email to both admin emails
          if (submittedCount === requestedStudents.length) {
            await sendAllSubmittedNotification(adminEmails, requestedStudents.length);

            // Create notification for admin
            await createNotification(
              adminUser._id.toString(),
              'all_availability_submitted',
              `All ${requestedStudents.length} students have submitted their availability!`,
              '/admin'
            );
          }
        }
      } catch (emailError) {
        console.error('Failed to send email notifications:', emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      availability: {
        id: savedAvailability._id.toString(),
        availability: savedAvailability.availability,
        notes: savedAvailability.notes,
        updatedAt: savedAvailability.updatedAt,
      },
    });

  } catch (error) {
    console.error('Save availability error:', error);
    return NextResponse.json(
      { error: 'Failed to save availability' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    // Require authentication
    const { user } = await requireAuth();

    await dbConnect();

    // Get availability for current user
    const availability = await Availability.findOne({ userId: user._id });

    if (!availability) {
      return NextResponse.json({
        availability: null,
      });
    }

    return NextResponse.json({
      availability: {
        id: availability._id.toString(),
        availability: availability.availability,
        notes: availability.notes,
        updatedAt: availability.updatedAt,
      },
    });

  } catch (error) {
    console.error('Get availability error:', error);
    return NextResponse.json(
      { error: 'Failed to get availability' },
      { status: 500 }
    );
  }
}

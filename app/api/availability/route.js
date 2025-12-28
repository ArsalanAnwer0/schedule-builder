import { NextResponse } from 'next/server';
import { requireAuth } from '../../../lib/auth/session';
import dbConnect from '../../../lib/db/connect';
import Availability from '../../../lib/db/models/Availability';

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

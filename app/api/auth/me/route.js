import { NextResponse } from 'next/server';
import { getSession } from '../../../../lib/auth/session';

export async function GET() {
  try {
    const sessionData = await getSession();

    if (!sessionData) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: {
        id: sessionData.user._id,
        email: sessionData.user.email,
        name: sessionData.user.name,
        role: sessionData.user.role,
        availabilityRequested: sessionData.user.availabilityRequested || false,
      },
    });

  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { error: 'Failed to get user' },
      { status: 500 }
    );
  }
}

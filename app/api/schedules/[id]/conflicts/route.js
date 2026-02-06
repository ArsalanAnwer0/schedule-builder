import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../../lib/auth/session';
import { detectScheduleConflicts } from '../../../../../lib/utils/conflictDetection';
import { rateLimit } from '../../../../../lib/utils/rateLimiter';
import User from '../../../../../lib/db/models/User';

// GET - Check for availability conflicts before publishing
export async function GET(request, { params }) {
  try {
    const adminCheck = await requireAdmin();
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    // Rate limiting: 30 checks per minute
    const rateLimitKey = `conflict-check:${adminCheck.user._id}`;
    const rateLimitResult = await rateLimit(rateLimitKey, 30, 60 * 1000);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many conflict checks. Please try again later.' },
        { status: 429, headers: rateLimitResult.headers }
      );
    }

    const { id } = await params;

    // Get admin's organization
    const admin = await User.findById(adminCheck.user._id);

    // Run conflict detection
    const conflictResult = await detectScheduleConflicts(
      id,
      admin.organizationName
    );

    return NextResponse.json({
      success: true,
      hasConflicts: conflictResult.hasConflicts,
      conflictCount: conflictResult.conflicts.length,
      conflicts: conflictResult.conflicts
    });

  } catch (error) {
    console.error('Conflict check error:', error);
    if (error.message === 'Schedule not found or access denied') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to check conflicts' }, { status: 500 });
  }
}

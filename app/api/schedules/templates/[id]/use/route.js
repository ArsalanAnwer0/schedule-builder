import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../../../lib/auth/session';
import dbConnect from '../../../../../../lib/db/connect';
import ScheduleTemplate from '../../../../../../lib/db/models/ScheduleTemplate';
import User from '../../../../../../lib/db/models/User';

// PUT - Mark template as used (increment counter)
export async function PUT(request, { params }) {
  try {
    const adminCheck = await requireAdmin();
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    await dbConnect();

    const { id } = await params;
    const admin = await User.findById(adminCheck.user._id);

    const template = await ScheduleTemplate.findById(id);

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Security check: only allow using templates from same organization
    if (template.organizationName !== admin.organizationName) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Increment usage counter and update last used timestamp
    template.timesUsed += 1;
    template.lastUsedAt = new Date();
    await template.save();

    return NextResponse.json({
      success: true,
      message: 'Template usage recorded',
      template
    });

  } catch (error) {
    console.error('Use template error:', error);
    return NextResponse.json({ error: 'Failed to record template usage' }, { status: 500 });
  }
}

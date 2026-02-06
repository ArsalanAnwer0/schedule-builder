import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../lib/auth/session';
import dbConnect from '../../../../lib/db/connect';
import ScheduleTemplate from '../../../../lib/db/models/ScheduleTemplate';
import User from '../../../../lib/db/models/User';

// GET - List all templates for organization
export async function GET(request) {
  try {
    const adminCheck = await requireAdmin();
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    await dbConnect();

    const admin = await User.findById(adminCheck.user._id);

    const templates = await ScheduleTemplate.find({
      organizationName: admin.organizationName
    })
      .sort({ isDefault: -1, lastUsedAt: -1, createdAt: -1 })
      .populate('createdBy', 'name')
      .lean();

    return NextResponse.json({ templates });

  } catch (error) {
    console.error('Get templates error:', error);
    return NextResponse.json({ error: 'Failed to load templates' }, { status: 500 });
  }
}

// POST - Create a new template
export async function POST(request) {
  try {
    const adminCheck = await requireAdmin();
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    await dbConnect();

    const admin = await User.findById(adminCheck.user._id);
    const { name, description, config } = await request.json();

    // Validate required fields
    if (!name || !config) {
      return NextResponse.json(
        { error: 'Missing required fields: name and config are required' },
        { status: 400 }
      );
    }

    const template = await ScheduleTemplate.create({
      name,
      description,
      config,
      organizationName: admin.organizationName,
      createdBy: admin._id
    });

    // Populate createdBy for response
    await template.populate('createdBy', 'name');

    return NextResponse.json({
      success: true,
      message: 'Template created successfully',
      template
    });

  } catch (error) {
    console.error('Create template error:', error);
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}

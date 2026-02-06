import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../lib/auth/session';
import dbConnect from '../../../../lib/db/connect';
import OrganizationSettings from '../../../../lib/db/models/OrganizationSettings';

// GET /api/organizations/settings - Fetch organization settings
export async function GET(request) {
  try {
    const adminCheck = await requireAdmin();
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    await dbConnect();
    const admin = adminCheck.user;

    let settings = await OrganizationSettings.findOne({
      organizationName: admin.organizationName
    }).populate('scheduling.defaultConfigurationId').lean();

    // If settings don't exist, return defaults
    if (!settings) {
      settings = {
        organizationName: admin.organizationName,
        displayName: admin.organizationName,
        description: '',
        timezone: 'America/New_York',
        branding: {
          logoUrl: '',
          primaryColor: '#14b8a6',
          secondaryColor: '#f3f4f6'
        },
        scheduling: {
          defaultConfigurationId: null,
          allowEditRequests: true,
          autoApproveEdits: false,
          notifyStudentsOnPublish: true
        },
        notifications: {
          emailNotificationsEnabled: true,
          ccAdminOnNotifications: false,
          notificationFrequency: 'immediate'
        },
        features: {
          twoFactorAuthEnabled: false,
          passwordlessLoginEnabled: false,
          googleOAuthEnabled: false,
          teamsIntegrationEnabled: false
        }
      };
    }

    return NextResponse.json({ settings }, { status: 200 });
  } catch (error) {
    console.error('Error fetching organization settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// PUT /api/organizations/settings - Update organization settings
export async function PUT(request) {
  try {
    const adminCheck = await requireAdmin();
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    await dbConnect();
    const admin = adminCheck.user;

    const body = await request.json();
    const {
      displayName,
      description,
      timezone,
      branding,
      scheduling,
      notifications,
      features
    } = body;

    // Validate required fields
    if (!displayName) {
      return NextResponse.json(
        { error: 'Display name is required' },
        { status: 400 }
      );
    }

    // Update or create settings (upsert)
    const settings = await OrganizationSettings.findOneAndUpdate(
      { organizationName: admin.organizationName },
      {
        organizationName: admin.organizationName,
        displayName,
        description,
        timezone,
        branding,
        scheduling,
        notifications,
        features,
        lastUpdatedBy: admin._id
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    ).populate('scheduling.defaultConfigurationId');

    return NextResponse.json({ settings }, { status: 200 });
  } catch (error) {
    console.error('Error updating organization settings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update settings' },
      { status: 500 }
    );
  }
}

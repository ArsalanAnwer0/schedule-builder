import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../lib/auth/requireAdmin';
import { migrateTemplatesToConfigurations } from '../../../../lib/migrations/migrateTemplatesToConfigurations';
import { createAuditLog } from '../../../../lib/utils/auditLog';

export async function POST(request) {
  try {
    const adminUser = await requireAdmin(request);

    // Run migration
    const result = await migrateTemplatesToConfigurations();

    // Log migration in audit log if any templates were migrated
    if (result.migratedCount > 0) {
      await createAuditLog({
        user: adminUser,
        action: 'schedule_configuration_created',
        resourceType: 'configuration',
        resourceId: 'migration',
        resourceName: `Template Migration - ${result.migratedCount} templates`,
        metadata: {
          migratedCount: result.migratedCount,
          totalAttempted: result.totalAttempted,
          hasErrors: result.errors ? true : false
        },
        request
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Migration API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to run migration',
        details: error.message
      },
      { status: 500 }
    );
  }
}

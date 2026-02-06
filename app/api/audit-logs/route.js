import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../lib/auth/requireAdmin';
import { getAuditLogs } from '../../../lib/utils/auditLog';

export async function GET(request) {
  try {
    const adminUser = await requireAdmin(request);

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || null;
    const userId = searchParams.get('userId') || null;
    const resourceType = searchParams.get('resourceType') || null;
    const startDate = searchParams.get('startDate') || null;
    const endDate = searchParams.get('endDate') || null;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const result = await getAuditLogs({
      organizationName: adminUser.organizationName,
      action,
      userId,
      resourceType,
      startDate,
      endDate,
      page,
      limit
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Audit logs fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}

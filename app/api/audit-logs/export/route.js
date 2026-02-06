import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../lib/auth/requireAdmin';
import { getAuditLogs } from '../../../../lib/utils/auditLog';

export async function GET(request) {
  try {
    const adminUser = await requireAdmin(request);

    // Get query parameters (same as list endpoint)
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || null;
    const userId = searchParams.get('userId') || null;
    const resourceType = searchParams.get('resourceType') || null;
    const startDate = searchParams.get('startDate') || null;
    const endDate = searchParams.get('endDate') || null;

    // Get all logs without pagination for export
    const result = await getAuditLogs({
      organizationName: adminUser.organizationName,
      action,
      userId,
      resourceType,
      startDate,
      endDate,
      page: 1,
      limit: 10000 // Max export limit
    });

    // Convert to CSV
    const csvHeaders = [
      'Timestamp',
      'User',
      'Email',
      'Action',
      'Resource Type',
      'Resource Name',
      'Resource ID',
      'IP Address'
    ];

    const csvRows = result.logs.map(log => [
      new Date(log.createdAt).toISOString(),
      log.userName,
      log.userEmail,
      log.action.replace(/_/g, ' '),
      log.resourceType,
      log.resourceName || '',
      log.resourceId || '',
      log.ipAddress || ''
    ]);

    // Build CSV content
    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row =>
        row.map(cell =>
          // Escape cells containing commas or quotes
          typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))
            ? `"${cell.replace(/"/g, '""')}"`
            : cell
        ).join(',')
      )
    ].join('\n');

    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="audit-logs-${Date.now()}.csv"`
      }
    });
  } catch (error) {
    console.error('Audit logs export error:', error);
    return NextResponse.json(
      { error: 'Failed to export audit logs' },
      { status: 500 }
    );
  }
}

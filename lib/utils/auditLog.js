import dbConnect from '../db/mongodb';
import AuditLog from '../db/models/AuditLog';

/**
 * Create an audit log entry
 * @param {Object} params
 * @param {Object} params.user - The user performing the action (must have organizationName, _id, name, email)
 * @param {string} params.action - The action being performed (from AuditLog enum)
 * @param {string} params.resourceType - Type of resource (schedule, student, admin, etc.)
 * @param {string} params.resourceId - ID of the resource affected
 * @param {string} params.resourceName - Human-readable name of the resource
 * @param {Object} params.beforeState - State before the action (optional)
 * @param {Object} params.afterState - State after the action (optional)
 * @param {Object} params.metadata - Additional metadata (optional)
 * @param {Object} params.request - Next.js request object for IP/user agent (optional)
 */
export async function createAuditLog({
  user,
  action,
  resourceType,
  resourceId,
  resourceName,
  beforeState = null,
  afterState = null,
  metadata = {},
  request = null
}) {
  try {
    await dbConnect();

    // Extract IP and user agent from request if provided
    let ipAddress = null;
    let userAgent = null;

    if (request) {
      // Get IP from various possible headers
      ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                  request.headers.get('x-real-ip') ||
                  request.headers.get('cf-connecting-ip') ||
                  null;

      userAgent = request.headers.get('user-agent') || null;
    }

    const auditEntry = await AuditLog.create({
      organizationName: user.organizationName,
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      action,
      resourceType,
      resourceId: resourceId?.toString(),
      resourceName,
      beforeState,
      afterState,
      metadata,
      ipAddress,
      userAgent
    });

    return auditEntry;
  } catch (error) {
    // Log error but don't throw - audit logging should not break main functionality
    console.error('Failed to create audit log:', error);
    return null;
  }
}

/**
 * Get audit logs with pagination and filtering
 * @param {Object} params
 * @param {string} params.organizationName - Organization to filter by
 * @param {string} params.action - Action type to filter by (optional)
 * @param {string} params.userId - User ID to filter by (optional)
 * @param {string} params.resourceType - Resource type to filter by (optional)
 * @param {Date} params.startDate - Start date for range filter (optional)
 * @param {Date} params.endDate - End date for range filter (optional)
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 50)
 */
export async function getAuditLogs({
  organizationName,
  action = null,
  userId = null,
  resourceType = null,
  startDate = null,
  endDate = null,
  page = 1,
  limit = 50
}) {
  try {
    await dbConnect();

    // Build query
    const query = { organizationName };

    if (action) {
      query.action = action;
    }

    if (userId) {
      query.userId = userId;
    }

    if (resourceType) {
      query.resourceType = resourceType;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(query)
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    throw error;
  }
}

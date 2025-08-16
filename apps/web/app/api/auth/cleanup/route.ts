/**
 * Data Cleanup API Route
 *
 * HTTP endpoint for triggering and managing data cleanup operations
 * in the NeonPro session management system.
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 * @created 2024
 */

import { createClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { sessionConfig } from '@/lib/auth/session/config';
import { DataCleanupService } from '@/lib/auth/session/DataCleanupService';

// Initialize cleanup service
const cleanupService = new DataCleanupService({
  enableScheduledCleanup: true,
  sessionRetentionDays: sessionConfig.cleanup.sessionRetentionDays,
  deviceRetentionDays: sessionConfig.cleanup.deviceRetentionDays,
  securityEventRetentionDays: sessionConfig.cleanup.securityEventRetentionDays,
  notificationRetentionDays: sessionConfig.cleanup.notificationRetentionDays,
  auditLogRetentionDays: sessionConfig.cleanup.auditLogRetentionDays,
  archiveCriticalEvents: true,
});

/**
 * POST /api/auth/cleanup
 * Trigger manual cleanup operations
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication and authorization
    const authResult = await verifyCleanupPermissions(request);
    if (!authResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: authResult.error,
        },
        { status: authResult.status },
      );
    }

    const body = await request.json().catch(() => ({}));
    const { tasks, force = false } = body;

    // Validate tasks if provided
    if (tasks && !Array.isArray(tasks)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_TASKS',
            message: 'Tasks must be an array',
          },
        },
        { status: 400 },
      );
    }

    // Check if cleanup is already running (unless forced)
    if (!force) {
      const statusResult = await cleanupService.getCleanupStatus();
      if (statusResult.success && statusResult.data?.isRunning) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'CLEANUP_IN_PROGRESS',
              message:
                'Cleanup is already in progress. Use force=true to override.',
            },
          },
          { status: 409 },
        );
      }
    }

    // Run cleanup
    const result = await cleanupService.runCleanup(tasks);

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    }
    return NextResponse.json(result, { status: 500 });
  } catch (_error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error during cleanup',
        },
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/auth/cleanup
 * Get cleanup status and statistics
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyCleanupPermissions(request);
    if (!authResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: authResult.error,
        },
        { status: authResult.status },
      );
    }

    const result = await cleanupService.getCleanupStatus();

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    }
    return NextResponse.json(result, { status: 500 });
  } catch (_error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error getting cleanup status',
        },
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/auth/cleanup
 * Stop all scheduled cleanup tasks
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication and admin permissions
    const authResult = await verifyCleanupPermissions(request, true);
    if (!authResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: authResult.error,
        },
        { status: authResult.status },
      );
    }

    cleanupService.stopScheduledTasks();

    return NextResponse.json(
      {
        success: true,
        message: 'All scheduled cleanup tasks stopped',
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    );
  } catch (_error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error stopping cleanup tasks',
        },
      },
      { status: 500 },
    );
  }
}

/**
 * Helper function to verify cleanup permissions
 */
async function verifyCleanupPermissions(
  request: NextRequest,
  requireAdmin = false,
): Promise<{
  success: boolean;
  error?: any;
  status?: number;
  userId?: string;
}> {
  try {
    // Get authorization header
    const authorization = request.headers.get('authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing or invalid authorization header',
        },
        status: 401,
      };
    }

    const token = authorization.substring(7);

    // Verify JWT token with Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return {
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token',
        },
        status: 401,
      };
    }

    // Check if admin permissions are required
    if (requireAdmin) {
      // Get user role from database
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (profileError || !userProfile) {
        return {
          success: false,
          error: {
            code: 'USER_PROFILE_ERROR',
            message: 'Unable to verify user permissions',
          },
          status: 403,
        };
      }

      if (userProfile.role !== 'admin' && userProfile.role !== 'super_admin') {
        return {
          success: false,
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: 'Admin permissions required for this operation',
          },
          status: 403,
        };
      }
    }

    return {
      success: true,
      userId: user.id,
    };
  } catch (_error) {
    return {
      success: false,
      error: {
        code: 'PERMISSION_CHECK_ERROR',
        message: 'Error verifying permissions',
      },
      status: 500,
    };
  }
}

/**
 * Helper function to validate cleanup tasks
 */
function _validateCleanupTasks(tasks: string[]): {
  valid: boolean;
  invalidTasks?: string[];
} {
  const validTasks = [
    'expired_sessions',
    'inactive_devices',
    'old_security_events',
    'old_notifications',
    'expired_device_verifications',
    'old_audit_logs',
  ];

  const invalidTasks = tasks.filter((task) => !validTasks.includes(task));

  return {
    valid: invalidTasks.length === 0,
    invalidTasks: invalidTasks.length > 0 ? invalidTasks : undefined,
  };
}

/**
 * Rate limiting helper
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function _checkRateLimit(
  identifier: string,
  maxRequests = 10,
  windowMs = 60_000,
): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(identifier);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (userLimit.count >= maxRequests) {
    return false;
  }

  userLimit.count++;
  return true;
}

export { cleanupService };

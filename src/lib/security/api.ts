/**
 * Security API Routes
 * REST API endpoints for security management
 * Story 3.3: Security Hardening & Audit
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { securityAPI } from '@/lib/security';
import { z } from 'zod';

// Validation schemas
const auditLogQuerySchema = z.object({
  user_id: z.string().uuid().optional(),
  action: z.string().optional(),
  resource_type: z.string().optional(),
  risk_level: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  compliance_flags: z.array(z.string()).optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
});

const securityEventQuerySchema = z.object({
  event_type: z.string().optional(),
  severity: z.enum(['info', 'warning', 'error', 'critical']).optional(),
  status: z
    .enum(['open', 'investigating', 'resolved', 'false_positive'])
    .optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
});

const securityAlertQuerySchema = z.object({
  alert_type: z.string().optional(),
  severity: z.enum(['info', 'low', 'medium', 'high', 'critical']).optional(),
  status: z
    .enum([
      'new',
      'acknowledged',
      'investigating',
      'resolved',
      'false_positive',
    ])
    .optional(),
  assigned_to: z.string().uuid().optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
});

const updateSecurityEventSchema = z.object({
  status: z.enum(['open', 'investigating', 'resolved', 'false_positive']),
  assigned_to: z.string().uuid().optional(),
  notes: z.string().optional(),
});

const createComplianceAuditSchema = z.object({
  audit_type: z.enum(['LGPD', 'ANVISA', 'CFM', 'internal', 'external']),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  scope_areas: z.array(z.string()),
  scheduled_date: z.string().datetime().optional(),
});

// Helper functions
async function requireAuth(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error('Unauthorized');
  }

  return user;
}

async function requireAdmin(request: NextRequest) {
  const user = await requireAuth(request);
  const supabase = createClient();

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    throw new Error('Admin access required');
  }

  return user;
}

function handleError(error: unknown) {
  console.error('Security API error:', error);

  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Admin access required') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
    if (error.message.includes('validation')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}

// =============================================
// AUDIT LOGS ENDPOINTS
// =============================================

/**
 * GET /api/security/audit-logs
 * Get audit logs with filtering and pagination
 */
export async function getAuditLogs(request: NextRequest) {
  try {
    await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const params = auditLogQuerySchema.parse(Object.fromEntries(searchParams));

    if (params.compliance_flags) {
      params.compliance_flags = Array.isArray(params.compliance_flags)
        ? params.compliance_flags
        : [params.compliance_flags];
    }

    const result = await securityAPI.getAuditLogs(params);

    return NextResponse.json(result);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * GET /api/security/audit-logs/[id]
 * Get specific audit log by ID
 */
export async function getAuditLog(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth(request);

    const auditLog = await securityAPI.getAuditLog(params.id);

    return NextResponse.json(auditLog);
  } catch (error) {
    return handleError(error);
  }
}

// =============================================
// SECURITY EVENTS ENDPOINTS
// =============================================

/**
 * GET /api/security/events
 * Get security events with filtering and pagination
 */
export async function getSecurityEvents(request: NextRequest) {
  try {
    await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const params = securityEventQuerySchema.parse(
      Object.fromEntries(searchParams)
    );

    const result = await securityAPI.getSecurityEvents(params);

    return NextResponse.json(result);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * GET /api/security/events/[id]
 * Get specific security event by ID
 */
export async function getSecurityEvent(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth(request);

    const securityEvent = await securityAPI.getSecurityEvent(params.id);

    return NextResponse.json(securityEvent);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * PATCH /api/security/events/[id]
 * Update security event status
 */
export async function updateSecurityEvent(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin(request);

    const body = await request.json();
    const { status, assigned_to, notes } =
      updateSecurityEventSchema.parse(body);

    const success = await securityAPI.updateSecurityEventStatus(
      params.id,
      status,
      assigned_to,
      notes
    );

    return NextResponse.json({ success });
  } catch (error) {
    return handleError(error);
  }
}

// =============================================
// SECURITY ALERTS ENDPOINTS
// =============================================

/**
 * GET /api/security/alerts
 * Get security alerts with filtering and pagination
 */
export async function getSecurityAlerts(request: NextRequest) {
  try {
    await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const params = securityAlertQuerySchema.parse(
      Object.fromEntries(searchParams)
    );

    const result = await securityAPI.getSecurityAlerts(params);

    return NextResponse.json(result);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * GET /api/security/alerts/[id]
 * Get specific security alert by ID
 */
export async function getSecurityAlert(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth(request);

    const securityAlert = await securityAPI.getSecurityAlert(params.id);

    return NextResponse.json(securityAlert);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/security/alerts/[id]/acknowledge
 * Acknowledge security alert
 */
export async function acknowledgeSecurityAlert(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request);

    const body = await request.json();
    const assignedTo = body.assigned_to || user.id;

    const success = await securityAPI.acknowledgeSecurityAlert(
      params.id,
      assignedTo
    );

    return NextResponse.json({ success });
  } catch (error) {
    return handleError(error);
  }
}

// =============================================
// SESSION MANAGEMENT ENDPOINTS
// =============================================

/**
 * GET /api/security/sessions
 * Get user sessions
 */
export async function getUserSessions(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    // Only admin can view other users' sessions
    if (userId && userId !== user.id) {
      await requireAdmin(request);
    }

    const sessions = await securityAPI.getUserSessions(userId || user.id);

    return NextResponse.json(sessions);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/security/sessions/[token]
 * Terminate user session
 */
export async function terminateSession(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    await requireAuth(request);

    const body = await request.json();
    const reason = body.reason || 'manual_logout';

    const success = await securityAPI.terminateSession(params.token, reason);

    return NextResponse.json({ success });
  } catch (error) {
    return handleError(error);
  }
}

// =============================================
// SECURITY METRICS ENDPOINTS
// =============================================

/**
 * GET /api/security/metrics
 * Get security metrics and dashboard data
 */
export async function getSecurityMetrics(request: NextRequest) {
  try {
    await requireAuth(request);

    const metrics = await securityAPI.getSecurityMetrics();

    return NextResponse.json(metrics);
  } catch (error) {
    return handleError(error);
  }
}

// =============================================
// COMPLIANCE AUDIT ENDPOINTS
// =============================================

/**
 * GET /api/security/compliance/audits
 * Get compliance audits
 */
export async function getComplianceAudits(request: NextRequest) {
  try {
    await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const params = {
      audit_type: searchParams.get('audit_type') || undefined,
      status: searchParams.get('status') || undefined,
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0'),
    };

    const result = await securityAPI.getComplianceAudits(params);

    return NextResponse.json(result);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/security/compliance/audits
 * Create new compliance audit
 */
export async function createComplianceAudit(request: NextRequest) {
  try {
    await requireAdmin(request);

    const body = await request.json();
    const data = createComplianceAuditSchema.parse(body);

    const audit = await securityAPI.createComplianceAudit(data);

    return NextResponse.json(audit, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * GET /api/security/compliance/audits/[id]
 * Get specific compliance audit
 */
export async function getComplianceAudit(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth(request);

    const audit = await securityAPI.getComplianceAudit(params.id);

    return NextResponse.json(audit);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/security/compliance/audits/[id]/complete
 * Complete compliance audit
 */
export async function completeComplianceAudit(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin(request);

    const body = await request.json();
    const { compliance_score, findings, recommendations } = body;

    if (
      typeof compliance_score !== 'number' ||
      compliance_score < 0 ||
      compliance_score > 100
    ) {
      throw new Error('Invalid compliance score');
    }

    const success = await securityAPI.completeComplianceAudit(
      params.id,
      compliance_score,
      findings,
      recommendations
    );

    return NextResponse.json({ success });
  } catch (error) {
    return handleError(error);
  }
}

// =============================================
// UTILITY ENDPOINTS
// =============================================

/**
 * POST /api/security/test-alert
 * Create test security alert (admin only)
 */
export async function createTestAlert(request: NextRequest) {
  try {
    await requireAdmin(request);

    const alert = await securityAPI.createSecurityAlert({
      alert_type: 'TEST_ALERT',
      title: 'Test Security Alert',
      description: 'This is a test alert created by an administrator',
      severity: 'info',
      source_type: 'manual',
      alert_data: {
        test: true,
        created_at: new Date().toISOString(),
      },
    });

    return NextResponse.json(alert, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/security/log-auth-attempt
 * Log authentication attempt (internal use)
 */
export async function logAuthAttempt(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (
      !body.email ||
      !body.attempt_type ||
      typeof body.success !== 'boolean'
    ) {
      throw new Error('Missing required fields');
    }

    const attemptId = await securityAPI.logAuthAttempt({
      email: body.email,
      attempt_type: body.attempt_type,
      success: body.success,
      failure_reason: body.failure_reason,
      ip_address: body.ip_address,
      user_agent: body.user_agent,
    });

    return NextResponse.json({ id: attemptId }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

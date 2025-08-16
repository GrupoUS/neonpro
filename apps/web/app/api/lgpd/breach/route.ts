import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { LGPDComplianceManager } from '@/lib/lgpd/compliance-manager';
import type { Database } from '@/types/database';

// Validation schemas
const breachCreateSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(10).max(2000),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  breachType: z.enum([
    'unauthorized_access',
    'data_loss',
    'system_compromise',
    'human_error',
    'malicious_attack',
    'other',
  ]),
  affectedDataTypes: z.array(z.string()).min(1),
  estimatedAffectedUsers: z.number().min(0),
  discoveredAt: z.string().datetime(),
  containedAt: z.string().datetime().optional(),
  rootCause: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

const breachUpdateSchema = z.object({
  status: z
    .enum(['reported', 'investigating', 'contained', 'resolved'])
    .optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  containedAt: z.string().datetime().optional(),
  resolvedAt: z.string().datetime().optional(),
  rootCause: z.string().optional(),
  mitigationSteps: z.array(z.string()).optional(),
  lessonsLearned: z.string().optional(),
  authorityNotified: z.boolean().optional(),
  usersNotified: z.boolean().optional(),
  metadata: z.record(z.any()).optional(),
});

const breachQuerySchema = z.object({
  status: z
    .enum(['reported', 'investigating', 'contained', 'resolved'])
    .optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  breachType: z
    .enum([
      'unauthorized_access',
      'data_loss',
      'system_compromise',
      'human_error',
      'malicious_attack',
      'other',
    ])
    .optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z
    .enum(['discovered_at', 'severity', 'status', 'estimated_affected_users'])
    .default('discovered_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const _notificationSchema = z.object({
  notifyAuthority: z.boolean().default(false),
  notifyUsers: z.boolean().default(false),
  customMessage: z.string().optional(),
});

// GET /api/lgpd/breach - Get breach incidents (admin only)
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 },
      );
    }

    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    const validatedQuery = breachQuerySchema.parse(queryParams);

    // Build query
    let query = supabase.from('lgpd_breach_incidents').select(`
        id,
        title,
        description,
        status,
        severity,
        breach_type,
        affected_data_types,
        estimated_affected_users,
        discovered_at,
        contained_at,
        resolved_at,
        root_cause,
        mitigation_steps,
        lessons_learned,
        authority_notified,
        authority_notification_date,
        users_notified,
        user_notification_date,
        reported_by,
        created_at,
        updated_at
      `);

    // Apply filters
    if (validatedQuery.status) {
      query = query.eq('status', validatedQuery.status);
    }

    if (validatedQuery.severity) {
      query = query.eq('severity', validatedQuery.severity);
    }

    if (validatedQuery.breachType) {
      query = query.eq('breach_type', validatedQuery.breachType);
    }

    if (validatedQuery.startDate) {
      query = query.gte('discovered_at', validatedQuery.startDate);
    }

    if (validatedQuery.endDate) {
      query = query.lte('discovered_at', validatedQuery.endDate);
    }

    if (validatedQuery.search) {
      query = query.or(
        `title.ilike.%${validatedQuery.search}%,description.ilike.%${validatedQuery.search}%`,
      );
    }

    // Apply sorting and pagination
    const { data: breaches, error: breachError } = await query
      .order(validatedQuery.sortBy, {
        ascending: validatedQuery.sortOrder === 'asc',
      })
      .range(
        (validatedQuery.page - 1) * validatedQuery.limit,
        validatedQuery.page * validatedQuery.limit - 1,
      );

    if (breachError) {
      throw new Error(
        `Failed to fetch breach incidents: ${breachError.message}`,
      );
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('lgpd_breach_incidents')
      .select('*', { count: 'exact', head: true });

    if (validatedQuery.status) {
      countQuery = countQuery.eq('status', validatedQuery.status);
    }

    if (validatedQuery.severity) {
      countQuery = countQuery.eq('severity', validatedQuery.severity);
    }

    if (validatedQuery.breachType) {
      countQuery = countQuery.eq('breach_type', validatedQuery.breachType);
    }

    const { count: totalCount } = await countQuery;

    // Get breach statistics
    const { data: stats } = await supabase
      .from('lgpd_breach_incidents')
      .select('severity, status')
      .gte(
        'discovered_at',
        new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
      ); // Last year

    const severityStats =
      stats?.reduce((acc: Record<string, number>, breach) => {
        acc[breach.severity] = (acc[breach.severity] || 0) + 1;
        return acc;
      }, {}) || {};

    const statusStats =
      stats?.reduce((acc: Record<string, number>, breach) => {
        acc[breach.status] = (acc[breach.status] || 0) + 1;
        return acc;
      }, {}) || {};

    // Log access
    const complianceManager = new LGPDComplianceManager(supabase);
    await complianceManager.logAuditEvent({
      eventType: 'admin_action',
      userId: user.id,
      description: 'Breach incidents accessed',
      details: 'Admin accessed LGPD breach management dashboard',
      metadata: {
        query_params: validatedQuery,
        access_time: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        breaches,
        statistics: {
          severity: severityStats,
          status: statusStats,
        },
        pagination: {
          page: validatedQuery.page,
          limit: validatedQuery.limit,
          total: totalCount || 0,
          totalPages: Math.ceil((totalCount || 0) / validatedQuery.limit),
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// POST /api/lgpd/breach - Report new breach incident
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 },
      );
    }

    const body = await request.json();
    const validatedData = breachCreateSchema.parse(body);

    const complianceManager = new LGPDComplianceManager(supabase);

    // Report breach incident
    const breach = await complianceManager.reportBreachIncident({
      title: validatedData.title,
      description: validatedData.description,
      severity: validatedData.severity,
      breachType: validatedData.breachType,
      affectedDataTypes: validatedData.affectedDataTypes,
      estimatedAffectedUsers: validatedData.estimatedAffectedUsers,
      discoveredAt: new Date(validatedData.discoveredAt),
      containedAt: validatedData.containedAt
        ? new Date(validatedData.containedAt)
        : undefined,
      rootCause: validatedData.rootCause,
      reportedBy: user.id,
      metadata: validatedData.metadata,
    });

    return NextResponse.json(
      {
        success: true,
        data: breach,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// PUT /api/lgpd/breach - Update breach incident
export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 },
      );
    }

    const body = await request.json();
    const validatedData = breachUpdateSchema.parse(body);
    const url = new URL(request.url);
    const breachId = url.searchParams.get('id');

    if (!breachId) {
      return NextResponse.json(
        { error: 'Breach ID is required' },
        { status: 400 },
      );
    }

    // Verify breach exists
    const { data: existingBreach } = await supabase
      .from('lgpd_breach_incidents')
      .select('*')
      .eq('id', breachId)
      .single();

    if (!existingBreach) {
      return NextResponse.json(
        { error: 'Breach incident not found' },
        { status: 404 },
      );
    }

    // Update breach record
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (validatedData.status) {
      updateData.status = validatedData.status;

      if (validatedData.status === 'resolved' && validatedData.resolvedAt) {
        updateData.resolved_at = validatedData.resolvedAt;
      }
    }

    if (validatedData.severity) {
      updateData.severity = validatedData.severity;
    }

    if (validatedData.containedAt) {
      updateData.contained_at = validatedData.containedAt;
    }

    if (validatedData.rootCause) {
      updateData.root_cause = validatedData.rootCause;
    }

    if (validatedData.mitigationSteps) {
      updateData.mitigation_steps = validatedData.mitigationSteps;
    }

    if (validatedData.lessonsLearned) {
      updateData.lessons_learned = validatedData.lessonsLearned;
    }

    if (validatedData.authorityNotified !== undefined) {
      updateData.authority_notified = validatedData.authorityNotified;
      if (validatedData.authorityNotified) {
        updateData.authority_notification_date = new Date().toISOString();
      }
    }

    if (validatedData.usersNotified !== undefined) {
      updateData.users_notified = validatedData.usersNotified;
      if (validatedData.usersNotified) {
        updateData.user_notification_date = new Date().toISOString();
      }
    }

    if (validatedData.metadata) {
      updateData.metadata = validatedData.metadata;
    }

    const { data: updatedBreach, error: updateError } = await supabase
      .from('lgpd_breach_incidents')
      .update(updateData)
      .eq('id', breachId)
      .select()
      .single();

    if (updateError) {
      throw new Error(
        `Failed to update breach incident: ${updateError.message}`,
      );
    }

    // Log the update
    const complianceManager = new LGPDComplianceManager(supabase);
    await complianceManager.logAuditEvent({
      eventType: 'admin_action',
      userId: user.id,
      description: 'Breach incident updated',
      details: `Breach incident ${breachId} updated by admin`,
      metadata: {
        breach_id: breachId,
        old_status: existingBreach.status,
        new_status: validatedData.status,
        changes: validatedData,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedBreach,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

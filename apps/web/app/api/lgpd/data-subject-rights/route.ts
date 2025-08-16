import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { LGPDComplianceManager } from '@/lib/lgpd/compliance-manager';
import type { Database } from '@/types/database';

// Validation schemas
const requestCreateSchema = z.object({
  requestType: z.enum([
    'access',
    'rectification',
    'deletion',
    'portability',
    'objection',
  ]),
  description: z.string().min(10).max(1000),
  specificData: z.string().optional(),
  urgency: z.enum(['low', 'medium', 'high']).default('medium'),
  metadata: z.record(z.any()).optional(),
});

const requestUpdateSchema = z.object({
  status: z
    .enum(['pending', 'in_progress', 'completed', 'rejected'])
    .optional(),
  adminNotes: z.string().optional(),
  responseData: z.record(z.any()).optional(),
  rejectionReason: z.string().optional(),
});

const requestQuerySchema = z.object({
  userId: z.string().uuid().optional(),
  requestType: z
    .enum(['access', 'rectification', 'deletion', 'portability', 'objection'])
    .optional(),
  status: z
    .enum(['pending', 'in_progress', 'completed', 'rejected'])
    .optional(),
  urgency: z.enum(['low', 'medium', 'high']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

// GET /api/lgpd/data-subject-rights - Get user requests or admin view
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

    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    const validatedQuery = requestQuerySchema.parse(queryParams);

    // Check if user has admin role for broader access
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.role === 'admin';
    const targetUserId =
      isAdmin && validatedQuery.userId ? validatedQuery.userId : user.id;

    // Build query
    let query = supabase.from('lgpd_data_subject_requests').select(`
        id,
        user_id,
        request_type,
        status,
        description,
        specific_data,
        urgency,
        admin_notes,
        response_data,
        rejection_reason,
        due_date,
        completed_at,
        created_at,
        updated_at
      `);

    // Apply filters
    if (!(isAdmin && validatedQuery.userId)) {
      query = query.eq('user_id', targetUserId);
    } else if (validatedQuery.userId) {
      query = query.eq('user_id', validatedQuery.userId);
    }

    if (validatedQuery.requestType) {
      query = query.eq('request_type', validatedQuery.requestType);
    }

    if (validatedQuery.status) {
      query = query.eq('status', validatedQuery.status);
    }

    if (validatedQuery.urgency) {
      query = query.eq('urgency', validatedQuery.urgency);
    }

    if (validatedQuery.startDate) {
      query = query.gte('created_at', validatedQuery.startDate);
    }

    if (validatedQuery.endDate) {
      query = query.lte('created_at', validatedQuery.endDate);
    }

    // Apply pagination and ordering
    const { data: requests, error: requestsError } = await query
      .order('created_at', { ascending: false })
      .range(
        (validatedQuery.page - 1) * validatedQuery.limit,
        validatedQuery.page * validatedQuery.limit - 1
      );

    if (requestsError) {
      throw new Error(`Failed to fetch requests: ${requestsError.message}`);
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('lgpd_data_subject_requests')
      .select('*', { count: 'exact', head: true });

    if (!(isAdmin && validatedQuery.userId)) {
      countQuery = countQuery.eq('user_id', targetUserId);
    } else if (validatedQuery.userId) {
      countQuery = countQuery.eq('user_id', validatedQuery.userId);
    }

    const { count: totalCount } = await countQuery;

    // Log access if admin viewing other user's data
    if (isAdmin && validatedQuery.userId && validatedQuery.userId !== user.id) {
      const complianceManager = new LGPDComplianceManager(supabase);
      await complianceManager.logAuditEvent({
        eventType: 'admin_action',
        userId: user.id,
        description: 'Admin accessed user data subject requests',
        details: `Admin viewed requests for user ${validatedQuery.userId}`,
        metadata: {
          target_user_id: validatedQuery.userId,
          query_params: validatedQuery,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        requests,
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
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/lgpd/data-subject-rights - Create new request
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

    const body = await request.json();
    const validatedData = requestCreateSchema.parse(body);

    const complianceManager = new LGPDComplianceManager(supabase);

    // Create data subject request
    const dsrRequest = await complianceManager.createDataSubjectRequest({
      userId: user.id,
      requestType: validatedData.requestType,
      description: validatedData.description,
      specificData: validatedData.specificData,
      urgency: validatedData.urgency,
      metadata: validatedData.metadata,
    });

    return NextResponse.json(
      {
        success: true,
        data: dsrRequest,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/lgpd/data-subject-rights - Update request (admin only)
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
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = requestUpdateSchema.parse(body);
    const url = new URL(request.url);
    const requestId = url.searchParams.get('id');

    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      );
    }

    // Verify request exists
    const { data: existingRequest } = await supabase
      .from('lgpd_data_subject_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (!existingRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const complianceManager = new LGPDComplianceManager(supabase);

    // Process the request based on status
    if (validatedData.status === 'completed') {
      const result = await complianceManager.processDataSubjectRequest(
        requestId,
        {
          responseData: validatedData.responseData,
          adminNotes: validatedData.adminNotes,
        }
      );

      return NextResponse.json({
        success: true,
        data: result,
      });
    }

    // Update request record
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (validatedData.status) {
      updateData.status = validatedData.status;

      if (
        validatedData.status === 'rejected' &&
        validatedData.rejectionReason
      ) {
        updateData.rejection_reason = validatedData.rejectionReason;
      }

      if (validatedData.status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }
    }

    if (validatedData.adminNotes) {
      updateData.admin_notes = validatedData.adminNotes;
    }

    if (validatedData.responseData) {
      updateData.response_data = validatedData.responseData;
    }

    const { data: updatedRequest, error: updateError } = await supabase
      .from('lgpd_data_subject_requests')
      .update(updateData)
      .eq('id', requestId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to update request: ${updateError.message}`);
    }

    // Log the update
    await complianceManager.logAuditEvent({
      eventType: 'admin_action',
      userId: user.id,
      description: 'Data subject request updated',
      details: `Request ${requestId} updated by admin`,
      metadata: {
        request_id: requestId,
        request_type: existingRequest.request_type,
        old_status: existingRequest.status,
        new_status: validatedData.status,
        changes: validatedData,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedRequest,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

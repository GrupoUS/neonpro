/**
 * LGPD Compliance Framework - Data Subject Rights API
 * API para direitos do titular dos dados (LGPD Art. 18)
 * 
 * @author APEX Master Developer
 * @version 1.0.0
 * @compliance LGPD Art. 18 (Direitos do Titular)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client'
import { cookies } from 'next/headers';
import { z } from 'zod';
import { 
  LGPDCore,
  DataSubjectRequestType,
  DataSubjectRequestStatus
} from '@/lib/compliance/lgpd-core';
import { withRateLimit } from '@/lib/security/rate-limit';
import { auditLog } from '@/lib/audit/audit-logger';
import { validateCSRF } from '@/lib/security/csrf';
import { generateDataExport } from '@/lib/compliance/data-export';
import { scheduleDataDeletion } from '@/lib/compliance/data-deletion';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const DataSubjectRequestSchema = z.object({
  requestType: z.nativeEnum(DataSubjectRequestType),
  description: z.string().min(10).max(1000),
  specificData: z.array(z.string()).optional(),
  reason: z.string().min(5).max(500).optional(),
  urgency: z.enum(['low', 'medium', 'high']).default('medium'),
  metadata: z.record(z.any()).optional()
});

const DataCorrectionSchema = z.object({
  field: z.string().min(1),
  currentValue: z.string(),
  newValue: z.string(),
  justification: z.string().min(10).max(500)
});

const RequestQuerySchema = z.object({
  clinicId: z.string().uuid(),
  userId: z.string().uuid().optional(),
  requestType: z.nativeEnum(DataSubjectRequestType).optional(),
  status: z.nativeEnum(DataSubjectRequestStatus).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20)
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getClientInfo(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ipAddress = forwarded?.split(',')[0] || realIp || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  return { ipAddress, userAgent };
}

async function validateUserAccess(
  supabase: any,
  userId: string,
  clinicId: string
): Promise<boolean> {
  const { data: userClinic } = await supabase
    .from('user_clinics')
    .select('id')
    .eq('user_id', userId)
    .eq('clinic_id', clinicId)
    .single();
    
  return !!userClinic;
}

async function validateDataOwnership(
  supabase: any,
  userId: string,
  dataField: string
): Promise<boolean> {
  // Validate that user owns the data they want to modify/access
  const allowedFields = [
    'full_name', 'email', 'phone', 'address', 'birth_date',
    'cpf', 'rg', 'medical_history', 'allergies', 'medications'
  ];
  
  return allowedFields.includes(dataField);
}

// ============================================================================
// GET - List Data Subject Requests
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await withRateLimit(request, {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // requests per window
    });
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Parse query parameters
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams);
    
    const validatedQuery = RequestQuerySchema.parse(queryParams);
    const { clinicId, userId, requestType, status, page, limit } = validatedQuery;

    // Initialize Supabase client
    const supabase = createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate user access to clinic
    const hasAccess = await validateUserAccess(supabase, user.id, clinicId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied to clinic' },
        { status: 403 }
      );
    }

    // Build query filters
    const filters: any = { clinicId };
    if (userId) filters.userId = userId;
    if (requestType) filters.requestType = requestType;
    if (status) filters.status = status;

    // Get requests with pagination
    const offset = (page - 1) * limit;
    const { data: requests, error } = await supabase
      .from('lgpd_data_subject_requests')
      .select(`
        *,
        user:users(id, email, full_name)
      `)
      .match(filters)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch requests: ${error.message}`);
    }

    // Get total count for pagination
    const { count } = await supabase
      .from('lgpd_data_subject_requests')
      .select('*', { count: 'exact', head: true })
      .match(filters);

    // Audit log
    await auditLog({
      action: 'DATA_SUBJECT_REQUESTS_LIST',
      userId: user.id,
      clinicId,
      details: {
        filters,
        resultCount: requests?.length || 0
      },
      ipAddress: getClientInfo(request).ipAddress
    });

    return NextResponse.json({
      success: true,
      data: {
        requests: requests || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      }
    });

  } catch (error) {
    console.error('GET /api/compliance/data-subject error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid query parameters',
          details: error.errors
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - Create Data Subject Request
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await withRateLimit(request, {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 20 // requests per window (more restrictive)
    });
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // CSRF validation
    const csrfValid = await validateCSRF(request);
    if (!csrfValid) {
      return NextResponse.json(
        { error: 'CSRF token invalid' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const validatedData = DataSubjectRequestSchema.parse(body);
    const { requestType, description, specificData, reason, urgency, metadata } = validatedData;

    // Initialize Supabase client
    const supabase = createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get clinic ID from request
    const clinicId = body.clinicId;
    if (!clinicId) {
      return NextResponse.json(
        { error: 'Clinic ID required' },
        { status: 400 }
      );
    }

    // Validate user access to clinic
    const hasAccess = await validateUserAccess(supabase, user.id, clinicId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied to clinic' },
        { status: 403 }
      );
    }

    // Validate specific data fields if provided
    if (specificData) {
      for (const field of specificData) {
        const isValid = await validateDataOwnership(supabase, user.id, field);
        if (!isValid) {
          return NextResponse.json(
            { error: `Invalid data field: ${field}` },
            { status: 400 }
          );
        }
      }
    }

    // Initialize LGPD Core
    const lgpdCore = new LGPDCore(supabase);
    const clientInfo = getClientInfo(request);

    // Create data subject request
    const dsRequest = await lgpdCore.createDataSubjectRequest({
      userId: user.id,
      clinicId,
      requestType,
      description,
      specificData,
      reason,
      urgency,
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
      metadata
    });

    // Handle specific request types
    let additionalData = {};
    
    switch (requestType) {
      case DataSubjectRequestType.ACCESS:
        // Generate data export for access requests
        const exportData = await generateDataExport(supabase, user.id, clinicId, specificData);
        additionalData = { exportData };
        break;
        
      case DataSubjectRequestType.DELETION:
        // Schedule data deletion (with grace period)
        await scheduleDataDeletion(supabase, user.id, clinicId, {
          gracePeriodDays: 30,
          requestId: dsRequest.id
        });
        break;
        
      case DataSubjectRequestType.PORTABILITY:
        // Generate portable data export
        const portableData = await generateDataExport(supabase, user.id, clinicId, specificData, {
          format: 'json',
          structured: true
        });
        additionalData = { portableData };
        break;
    }

    // Audit log
    await auditLog({
      action: 'DATA_SUBJECT_REQUEST_CREATED',
      userId: user.id,
      clinicId,
      details: {
        requestId: dsRequest.id,
        requestType,
        urgency,
        specificData
      },
      ipAddress: clientInfo.ipAddress
    });

    return NextResponse.json({
      success: true,
      data: { 
        request: dsRequest,
        ...additionalData
      }
    });

  } catch (error) {
    console.error('POST /api/compliance/data-subject error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: error.errors
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT - Update Data (Correction)
// ============================================================================

export async function PUT(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await withRateLimit(request, {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 30 // requests per window
    });
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // CSRF validation
    const csrfValid = await validateCSRF(request);
    if (!csrfValid) {
      return NextResponse.json(
        { error: 'CSRF token invalid' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const corrections = z.array(DataCorrectionSchema).parse(body.corrections);
    const clinicId = body.clinicId;

    if (!clinicId) {
      return NextResponse.json(
        { error: 'Clinic ID required' },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate user access to clinic
    const hasAccess = await validateUserAccess(supabase, user.id, clinicId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied to clinic' },
        { status: 403 }
      );
    }

    // Validate all correction fields
    for (const correction of corrections) {
      const isValid = await validateDataOwnership(supabase, user.id, correction.field);
      if (!isValid) {
        return NextResponse.json(
          { error: `Invalid data field: ${correction.field}` },
          { status: 400 }
        );
      }
    }

    // Initialize LGPD Core
    const lgpdCore = new LGPDCore(supabase);
    const clientInfo = getClientInfo(request);

    // Process corrections
    const results = [];
    for (const correction of corrections) {
      try {
        const result = await lgpdCore.correctUserData({
          userId: user.id,
          clinicId,
          field: correction.field,
          currentValue: correction.currentValue,
          newValue: correction.newValue,
          justification: correction.justification,
          ipAddress: clientInfo.ipAddress,
          userAgent: clientInfo.userAgent
        });
        
        results.push({
          field: correction.field,
          success: true,
          result
        });
      } catch (error) {
        results.push({
          field: correction.field,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Audit log
    await auditLog({
      action: 'DATA_CORRECTION',
      userId: user.id,
      clinicId,
      details: {
        corrections: corrections.map(c => ({
          field: c.field,
          justification: c.justification
        })),
        results
      },
      ipAddress: clientInfo.ipAddress
    });

    return NextResponse.json({
      success: true,
      data: { results }
    });

  } catch (error) {
    console.error('PUT /api/compliance/data-subject error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid correction data',
          details: error.errors
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

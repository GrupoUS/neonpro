/**
 * LGPD Compliance Framework - Consent Management API
 * API para gerenciamento de consentimentos LGPD
 *
 * @author APEX Master Developer
 * @version 1.0.0
 * @compliance LGPD Art. 7º, 8º, 9º
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auditLog } from '@/lib/audit/audit-logger';
import {
  ConsentStatus,
  ConsentType,
  LegalBasis,
  LGPDCore,
} from '@/lib/compliance/lgpd-core';
import { validateCSRF } from '@/lib/security/csrf';
import { withRateLimit } from '@/lib/security/rate-limit';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const GrantConsentSchema = z.object({
  consentType: z.nativeEnum(ConsentType),
  purpose: z.string().min(10).max(500),
  description: z.string().min(10).max(1000),
  legalBasis: z.nativeEnum(LegalBasis),
  expiresAt: z.string().datetime().optional(),
  metadata: z.record(z.any()).optional(),
});

const WithdrawConsentSchema = z.object({
  consentId: z.string().uuid(),
  reason: z.string().min(5).max(500).optional(),
});

const ConsentQuerySchema = z.object({
  clinicId: z.string().uuid(),
  userId: z.string().uuid().optional(),
  consentType: z.nativeEnum(ConsentType).optional(),
  status: z.nativeEnum(ConsentStatus).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
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

  return Boolean(userClinic);
}

// ============================================================================
// GET - List Consents
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await withRateLimit(request, {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // requests per window
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

    const validatedQuery = ConsentQuerySchema.parse(queryParams);
    const { clinicId, userId, consentType, status, page, limit } =
      validatedQuery;

    // Initialize Supabase client
    const supabase = createRouteHandlerClient({ cookies });

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate user access to clinic
    const hasAccess = await validateUserAccess(supabase, user.id, clinicId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied to clinic' },
        { status: 403 }
      );
    }

    // Initialize LGPD Core
    const _lgpdCore = new LGPDCore(supabase);

    // Build query filters
    const filters: any = { clinicId };
    if (userId) {
      filters.userId = userId;
    }
    if (consentType) {
      filters.consentType = consentType;
    }
    if (status) {
      filters.status = status;
    }

    // Get consents with pagination
    const offset = (page - 1) * limit;
    const { data: consents, error } = await supabase
      .from('lgpd_consents')
      .select(
        `
        *,
        user:users(id, email, full_name)
      `
      )
      .match(filters)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch consents: ${error.message}`);
    }

    // Get total count for pagination
    const { count } = await supabase
      .from('lgpd_consents')
      .select('*', { count: 'exact', head: true })
      .match(filters);

    // Audit log
    await auditLog({
      action: 'CONSENT_LIST',
      userId: user.id,
      clinicId,
      details: {
        filters,
        resultCount: consents?.length || 0,
      },
      ipAddress: getClientInfo(request).ipAddress,
    });

    return NextResponse.json({
      success: true,
      data: {
        consents: consents || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      },
    });
  } catch (error) {
    console.error('GET /api/compliance/consent error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid query parameters',
          details: error.errors,
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
// POST - Grant Consent
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await withRateLimit(request, {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 50, // requests per window
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
    const validatedData = GrantConsentSchema.parse(body);
    const {
      consentType,
      purpose,
      description,
      legalBasis,
      expiresAt,
      metadata,
    } = validatedData;

    // Initialize Supabase client
    const supabase = createRouteHandlerClient({ cookies });

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get clinic ID from request or user context
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

    // Initialize LGPD Core
    const lgpdCore = new LGPDCore(supabase);
    const clientInfo = getClientInfo(request);

    // Grant consent
    const consent = await lgpdCore.grantConsent({
      userId: user.id,
      clinicId,
      consentType,
      purpose,
      description,
      legalBasis,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
      metadata,
    });

    // Audit log
    await auditLog({
      action: 'CONSENT_GRANTED',
      userId: user.id,
      clinicId,
      details: {
        consentId: consent.id,
        consentType,
        purpose,
        legalBasis,
      },
      ipAddress: clientInfo.ipAddress,
    });

    return NextResponse.json({
      success: true,
      data: { consent },
    });
  } catch (error) {
    console.error('POST /api/compliance/consent error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: error.errors,
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
// DELETE - Withdraw Consent
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await withRateLimit(request, {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 30, // requests per window
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
    const validatedData = WithdrawConsentSchema.parse(body);
    const { consentId, reason } = validatedData;

    // Initialize Supabase client
    const supabase = createRouteHandlerClient({ cookies });

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get consent to validate ownership
    const { data: consent, error: consentError } = await supabase
      .from('lgpd_consents')
      .select('*')
      .eq('id', consentId)
      .eq('user_id', user.id)
      .single();

    if (consentError || !consent) {
      return NextResponse.json(
        { error: 'Consent not found or access denied' },
        { status: 404 }
      );
    }

    // Initialize LGPD Core
    const lgpdCore = new LGPDCore(supabase);
    const clientInfo = getClientInfo(request);

    // Withdraw consent
    const withdrawnConsent = await lgpdCore.withdrawConsent(consentId, {
      reason,
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
    });

    // Audit log
    await auditLog({
      action: 'CONSENT_WITHDRAWN',
      userId: user.id,
      clinicId: consent.clinic_id,
      details: {
        consentId,
        consentType: consent.consent_type,
        reason,
      },
      ipAddress: clientInfo.ipAddress,
    });

    return NextResponse.json({
      success: true,
      data: { consent: withdrawnConsent },
    });
  } catch (error) {
    console.error('DELETE /api/compliance/consent error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: error.errors,
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

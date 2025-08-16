// Stock Alerts Acknowledge API - Enhanced with QA Best Practices
// Implementation of Story 11.4: Alert Acknowledgment with Service Layer
// Following Senior Developer patterns and audit trail

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createStockAlertService } from '@/app/lib/services/stock-alert.service';
import { StockAlertError } from '@/app/lib/types/stock';

// ============================================================================
// VALIDATION SCHEMAS (QA Enhancement)
// ============================================================================

const AcknowledgeAlertRequestSchema = z.object({
  alertId: z.string().uuid(),
  note: z.string().optional(),
});

// ============================================================================
// UTILITY FUNCTIONS (DRY Principle - Imported from main alerts route)
// ============================================================================

async function getClinicIdFromSession(): Promise<{
  clinicId: string;
  userId: string;
}> {
  const { createClient } = await import('@/app/utils/supabase/server');
  const supabase = await createClient();

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (sessionError || !session) {
    throw new StockAlertError('Authentication required', 'UNAUTHORIZED', {
      sessionError: sessionError?.message,
    });
  }

  const userId = session.user.id;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('clinic_id')
    .eq('id', userId)
    .single();

  if (profileError || !profile?.clinic_id) {
    throw new StockAlertError(
      'User profile not found or no clinic associated',
      'PROFILE_NOT_FOUND',
      { userId, profileError: profileError?.message }
    );
  }

  return { clinicId: profile.clinic_id, userId };
}

function handleError(error: unknown): NextResponse {
  if (error instanceof StockAlertError) {
    const statusCode = getStatusCodeForError(error.code);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          context: error.context,
          timestamp: new Date().toISOString(),
        },
      },
      { status: statusCode }
    );
  }

  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: error.errors,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 400 }
    );
  }

  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
      },
    },
    { status: 500 }
  );
}

function getStatusCodeForError(errorCode: string): number {
  const statusMap: Record<string, number> = {
    UNAUTHORIZED: 401,
    PROFILE_NOT_FOUND: 401,
    VALIDATION_ERROR: 400,
    ALERT_NOT_FOUND: 404,
    ACKNOWLEDGE_FAILED: 500,
    INTERNAL_ERROR: 500,
  };
  return statusMap[errorCode] || 500;
}

// ============================================================================
// API ENDPOINTS (QA Enhancement: Using service layer)
// ============================================================================

/**
 * POST /api/stock/alerts/acknowledge
 * Acknowledges an alert using service layer with proper audit trail
 * Enhanced with performance monitoring and event sourcing
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Parse and validate request body with comprehensive validation
    const body = await request.json();
    const validatedRequest = AcknowledgeAlertRequestSchema.parse(body);

    // Get authentication context
    const { clinicId, userId } = await getClinicIdFromSession();

    // Create service instance (using dependency injection pattern)
    const alertService = await createStockAlertService(clinicId);

    // Acknowledge alert using service layer (QA Best Practice)
    const acknowledgedAlert = await alertService.acknowledgeAlert(
      validatedRequest,
      userId
    );

    // Performance monitoring
    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: {
        alert: acknowledgedAlert,
        message: 'Alert acknowledged successfully',
        action: {
          type: 'acknowledged',
          performedBy: userId,
          performedAt: new Date().toISOString(),
          note: validatedRequest.note,
        },
        metadata: {
          duration: `${duration}ms`,
          timestamp: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

// ============================================================================
// OPTIONS - CORS support (Enhanced with security headers)
// ============================================================================

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin':
        process.env.NODE_ENV === 'production' ? 'https://neonpro.app' : '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

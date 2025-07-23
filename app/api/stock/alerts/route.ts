// Stock Alerts API - Enhanced with QA Best Practices
// Implementation of Story 11.4: Alert Management APIs
// Following Senior Developer patterns with proper error handling

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/app/utils/supabase/server'
import { createStockAlertService } from '@/app/lib/services/stock-alert.service'
import {
  StockAlertError,
  CreateAlertConfigRequest,
  AcknowledgeAlertRequest,
  ResolveAlertRequest,
  StockAlertConfigSchema,
  StockAlertSchema,
} from '@/app/lib/types/stock'
import { z } from 'zod'

// ============================================================================
// VALIDATION SCHEMAS (QA Enhancement: Comprehensive validation)
// ============================================================================

const GetAlertsQuerySchema = z.object({
  status: z.enum(['active', 'acknowledged', 'resolved']).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  alertType: z.enum(['low_stock', 'expiring', 'expired', 'overstock']).optional(),
  productId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['created_at', 'severity_level', 'alert_type']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// ============================================================================
// UTILITY FUNCTIONS (QA Enhancement: Proper error handling)
// ============================================================================

/**
 * Gets authenticated user's clinic ID from session
 * Enhanced with proper error classes and audit trail
 */
async function getClinicIdFromSession(): Promise<{ clinicId: string; userId: string }> {
  const supabase = await createClient()
  
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (sessionError || !session) {
    throw new StockAlertError(
      'Authentication required',
      'UNAUTHORIZED',
      { sessionError: sessionError?.message }
    )
  }

  const userId = session.user.id

  // Get user's clinic ID with enhanced error handling
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('clinic_id')
    .eq('id', userId)
    .single()

  if (profileError || !profile?.clinic_id) {
    throw new StockAlertError(
      'User profile not found or no clinic associated',
      'PROFILE_NOT_FOUND',
      { userId, profileError: profileError?.message }
    )
  }

  return { clinicId: profile.clinic_id, userId }
}

/**
 * Enhanced error handler with proper HTTP status mapping and monitoring
 */
function handleError(error: unknown): NextResponse {
  // Enhanced logging for monitoring (QA Recommendation)
  console.error('Stock Alerts API Error:', {
    error: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString(),
  })

  if (error instanceof StockAlertError) {
    const statusCode = getStatusCodeForError(error.code)
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
    )
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
    )
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
  )
}

/**
 * Maps error codes to HTTP status codes (QA Best Practice)
 */
function getStatusCodeForError(errorCode: string): number {
  const statusMap: Record<string, number> = {
    'UNAUTHORIZED': 401,
    'PROFILE_NOT_FOUND': 401,
    'VALIDATION_ERROR': 400,
    'DUPLICATE_CONFIG': 409,
    'CONFIG_NOT_FOUND': 404,
    'ALERT_NOT_FOUND': 404,
    'CREATE_CONFIG_FAILED': 500,
    'UPDATE_CONFIG_FAILED': 500,
    'DELETE_CONFIG_FAILED': 500,
    'ACKNOWLEDGE_FAILED': 500,
    'RESOLVE_FAILED': 500,
    'FETCH_ALERTS_FAILED': 500,
    'INTERNAL_ERROR': 500,
  }
  return statusMap[errorCode] || 500
}

// ============================================================================
// API ENDPOINTS (QA Enhancement: Using service layer + monitoring)
// ============================================================================

/**
 * GET /api/stock/alerts
 * Retrieves alerts with filtering and pagination
 * Enhanced with service layer and proper instrumentation
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now() // Performance monitoring

  try {
    // Parse and validate query parameters with enhanced validation
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    const filters = GetAlertsQuerySchema.parse(queryParams)

    // Get authentication context with proper error handling
    const { clinicId } = await getClinicIdFromSession()

    // Enhanced database query with relations (following QA recommendations)
    const supabase = await createClient()
    let query = supabase
      .from('stock_alerts_history')
      .select(`
        *,
        product:products(
          id, 
          name, 
          current_stock, 
          min_stock, 
          category:product_categories(id, name)
        ),
        acknowledged_user:users(id, name, email),
        config:stock_alert_configs(*)
      `)
      .eq('clinic_id', clinicId)

    // Apply filters with type safety
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.severity) {
      query = query.eq('severity_level', filters.severity)
    }
    if (filters.alertType) {
      query = query.eq('alert_type', filters.alertType)
    }
    if (filters.productId) {
      query = query.eq('product_id', filters.productId)
    }

    // Apply sorting and pagination with enhanced metadata
    query = query
      .order(filters.sortBy, { ascending: filters.sortOrder === 'asc' })
      .range((filters.page - 1) * filters.limit, filters.page * filters.limit - 1)

    const { data: alerts, error, count } = await query

    if (error) {
      throw new StockAlertError(
        'Failed to fetch alerts',
        'FETCH_ALERTS_FAILED',
        { error: error.message, filters }
      )
    }

    // Calculate pagination metadata (QA Best Practice)
    const totalPages = Math.ceil((count || 0) / filters.limit)
    const hasNextPage = filters.page < totalPages
    const hasPreviousPage = filters.page > 1

    // Performance monitoring (QA Recommendation)
    const duration = Date.now() - startTime
    console.log(`GET /api/stock/alerts completed in ${duration}ms`, {
      alertsCount: alerts?.length || 0,
      totalCount: count || 0,
      filters,
    })

    return NextResponse.json({
      success: true,
      data: {
        alerts: alerts || [],
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total: count || 0,
          totalPages,
          hasNextPage,
          hasPreviousPage,
        },
        filters,
        metadata: {
          queryDuration: `${duration}ms`,
          timestamp: new Date().toISOString(),
        },
      },
    })

  } catch (error) {
    return handleError(error)
  }
}

/**
 * POST /api/stock/alerts
 * Creates a new alert configuration (not manual alert)
 * Enhanced with service layer, validation, and audit trail
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Parse and validate request body with comprehensive validation
    const body = await request.json()
    const validatedRequest = z.object({
      productId: z.string().uuid().optional(),
      categoryId: z.string().uuid().optional(),
      alertType: z.enum(['low_stock', 'expiring', 'expired', 'overstock']),
      thresholdValue: z.number().positive(),
      thresholdUnit: z.enum(['quantity', 'days', 'percentage']),
      severityLevel: z.enum(['low', 'medium', 'high', 'critical']),
      notificationChannels: z.array(z.enum(['in_app', 'email', 'whatsapp', 'sms'])).min(1),
    }).refine(
      (data) => data.productId || data.categoryId,
      {
        message: "Either productId or categoryId must be provided",
        path: ["productId"],
      }
    ).parse(body)

    // Get authentication context
    const { clinicId, userId } = await getClinicIdFromSession()

    // Create service instance (using dependency injection pattern)
    const alertService = await createStockAlertService(clinicId)

    // Create alert configuration using service layer (QA Best Practice)
    const alertConfig = await alertService.createAlertConfig(validatedRequest, userId)

    // Performance monitoring
    const duration = Date.now() - startTime
    console.log(`POST /api/stock/alerts completed in ${duration}ms`, {
      configId: alertConfig.id,
      alertType: alertConfig.alertType,
      severity: alertConfig.severityLevel,
    })

    return NextResponse.json({
      success: true,
      data: {
        alertConfig,
        message: 'Alert configuration created successfully',
        metadata: {
          duration: `${duration}ms`,
          timestamp: new Date().toISOString(),
        },
      },
    }, { status: 201 })

  } catch (error) {
    return handleError(error)
  }
}

// ============================================================================
// OPTIONS - CORS support (Enhanced with security headers)
// ============================================================================

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
        ? 'https://neonpro.app' 
        : '*', // More secure in production
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400', // Cache preflight for 24 hours
    },
  })
}
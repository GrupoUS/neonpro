import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { LGPDComplianceManager } from '@/lib/lgpd/compliance-manager'
import type { Database } from '@/types/database'

// Validation schemas
const auditQuerySchema = z.object({
  userId: z.string().uuid().optional(),
  eventType: z.enum(['consent_change', 'data_access', 'data_modification', 'data_deletion', 'admin_action', 'system_access', 'security_event']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.enum(['created_at', 'event_type', 'user_id']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

const auditCreateSchema = z.object({
  eventType: z.enum(['consent_change', 'data_access', 'data_modification', 'data_deletion', 'admin_action', 'system_access', 'security_event']),
  description: z.string().min(1).max(500),
  details: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  targetUserId: z.string().uuid().optional()
})

const exportSchema = z.object({
  format: z.enum(['json', 'csv']).default('json'),
  userId: z.string().uuid().optional(),
  eventType: z.enum(['consent_change', 'data_access', 'data_modification', 'data_deletion', 'admin_action', 'system_access', 'security_event']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
})

// GET /api/lgpd/audit - Get audit trail
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user has admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.role === 'admin'

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const url = new URL(request.url)
    const queryParams = Object.fromEntries(url.searchParams.entries())
    const validatedQuery = auditQuerySchema.parse(queryParams)

    // Check for export request
    const isExport = url.searchParams.get('export') === 'true'
    
    if (isExport) {
      return await handleAuditExport(supabase, validatedQuery, user.id)
    }

    // Build query
    let query = supabase
      .from('lgpd_audit_trail')
      .select(`
        id,
        event_type,
        user_id,
        description,
        details,
        metadata,
        ip_address,
        user_agent,
        created_at
      `)

    // Apply filters
    if (validatedQuery.userId) {
      query = query.eq('user_id', validatedQuery.userId)
    }

    if (validatedQuery.eventType) {
      query = query.eq('event_type', validatedQuery.eventType)
    }

    if (validatedQuery.startDate) {
      query = query.gte('created_at', validatedQuery.startDate)
    }

    if (validatedQuery.endDate) {
      query = query.lte('created_at', validatedQuery.endDate)
    }

    if (validatedQuery.search) {
      query = query.or(`description.ilike.%${validatedQuery.search}%,details.ilike.%${validatedQuery.search}%`)
    }

    // Apply sorting and pagination
    const { data: auditEvents, error: auditError } = await query
      .order(validatedQuery.sortBy, { ascending: validatedQuery.sortOrder === 'asc' })
      .range(
        (validatedQuery.page - 1) * validatedQuery.limit,
        validatedQuery.page * validatedQuery.limit - 1
      )

    if (auditError) {
      throw new Error(`Failed to fetch audit events: ${auditError.message}`)
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('lgpd_audit_trail')
      .select('*', { count: 'exact', head: true })

    if (validatedQuery.userId) {
      countQuery = countQuery.eq('user_id', validatedQuery.userId)
    }

    if (validatedQuery.eventType) {
      countQuery = countQuery.eq('event_type', validatedQuery.eventType)
    }

    if (validatedQuery.startDate) {
      countQuery = countQuery.gte('created_at', validatedQuery.startDate)
    }

    if (validatedQuery.endDate) {
      countQuery = countQuery.lte('created_at', validatedQuery.endDate)
    }

    const { count: totalCount } = await countQuery

    // Get audit statistics
    const { data: stats } = await supabase
      .from('lgpd_audit_trail')
      .select('event_type')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days

    const eventTypeStats = stats?.reduce((acc: Record<string, number>, event) => {
      acc[event.event_type] = (acc[event.event_type] || 0) + 1
      return acc
    }, {}) || {}

    // Log audit access
    const complianceManager = new LGPDComplianceManager(supabase)
    await complianceManager.logAuditEvent({
      eventType: 'admin_action',
      userId: user.id,
      description: 'Audit trail accessed',
      details: 'Admin accessed LGPD audit trail',
      metadata: {
        query_params: validatedQuery,
        access_time: new Date().toISOString()
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        events: auditEvents,
        statistics: eventTypeStats,
        pagination: {
          page: validatedQuery.page,
          limit: validatedQuery.limit,
          total: totalCount || 0,
          totalPages: Math.ceil((totalCount || 0) / validatedQuery.limit)
        }
      }
    })

  } catch (error) {
    console.error('LGPD Audit GET Error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/lgpd/audit - Create audit event (admin only)
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user has admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = auditCreateSchema.parse(body)

    const complianceManager = new LGPDComplianceManager(supabase)

    // Create audit event
    const auditEvent = await complianceManager.logAuditEvent({
      eventType: validatedData.eventType,
      userId: validatedData.targetUserId || user.id,
      description: validatedData.description,
      details: validatedData.details,
      metadata: validatedData.metadata
    })

    return NextResponse.json({
      success: true,
      data: auditEvent
    }, { status: 201 })

  } catch (error) {
    console.error('LGPD Audit POST Error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to handle audit export
async function handleAuditExport(
  supabase: any,
  queryParams: z.infer<typeof auditQuerySchema>,
  adminUserId: string
) {
  try {
    const exportParams = exportSchema.parse(queryParams)

    // Build export query (no pagination for export)
    let query = supabase
      .from('lgpd_audit_trail')
      .select(`
        id,
        event_type,
        user_id,
        description,
        details,
        metadata,
        ip_address,
        user_agent,
        created_at
      `)

    // Apply same filters as GET
    if (exportParams.userId) {
      query = query.eq('user_id', exportParams.userId)
    }

    if (exportParams.eventType) {
      query = query.eq('event_type', exportParams.eventType)
    }

    if (exportParams.startDate) {
      query = query.gte('created_at', exportParams.startDate)
    }

    if (exportParams.endDate) {
      query = query.lte('created_at', exportParams.endDate)
    }

    const { data: auditEvents, error: auditError } = await query
      .order('created_at', { ascending: false })
      .limit(10000) // Reasonable limit for export

    if (auditError) {
      throw new Error(`Failed to fetch audit events for export: ${auditError.message}`)
    }

    // Log export action
    const complianceManager = new LGPDComplianceManager(supabase)
    await complianceManager.logAuditEvent({
      eventType: 'admin_action',
      userId: adminUserId,
      description: 'Audit trail exported',
      details: `Admin exported ${auditEvents?.length || 0} audit events in ${exportParams.format} format`,
      metadata: {
        export_params: exportParams,
        export_count: auditEvents?.length || 0,
        export_time: new Date().toISOString()
      }
    })

    if (exportParams.format === 'csv') {
      // Convert to CSV
      const csvHeaders = 'ID,Event Type,User ID,Description,Details,IP Address,User Agent,Created At\n'
      const csvRows = auditEvents?.map(event => {
        const details = typeof event.details === 'string' ? event.details.replace(/"/g, '""') : ''
        const description = event.description.replace(/"/g, '""')
        return `"${event.id}","${event.event_type}","${event.user_id}","${description}","${details}","${event.ip_address || ''}","${event.user_agent || ''}","${event.created_at}"`
      }).join('\n') || ''
      
      const csvContent = csvHeaders + csvRows
      
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="lgpd_audit_export_${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }

    // Return JSON format
    return NextResponse.json({
      success: true,
      data: {
        events: auditEvents,
        exportInfo: {
          format: exportParams.format,
          exportedAt: new Date().toISOString(),
          totalRecords: auditEvents?.length || 0,
          filters: exportParams
        }
      }
    })

  } catch (error) {
    console.error('Audit Export Error:', error)
    throw error
  }
}
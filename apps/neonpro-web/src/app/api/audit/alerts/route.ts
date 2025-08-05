/**
 * NeonPro Security Alerts API
 * 
 * API para gestao de alertas de seguranca do sistema de auditoria.
 * Permite consulta, atualizacao de status e atribuicao de alertas.
 * 
 * Endpoints:
 * - GET /api/audit/alerts - Lista alertas
 * - PATCH /api/audit/alerts - Atualiza status de alerta
 * 
 * @author APEX Master Developer
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { AuditSeverity, logAuditEvent, AuditEventType } from '@/lib/audit/audit-system'
import { rateLimit } from '@/lib/security/rate-limiting'

// Rate limiting: 100 requests per minute
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
})

/**
 * Schema para filtragem de alertas
 */
const AlertsFilterSchema = z.object({
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  status: z.enum(['open', 'investigating', 'resolved', 'false_positive']).optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  assigned_to: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
})

/**
 * Schema para atualizacao de alerta
 */
const UpdateAlertSchema = z.object({
  alert_id: z.string().uuid(),
  status: z.enum(['open', 'investigating', 'resolved', 'false_positive']),
  assigned_to: z.string().optional(),
  notes: z.string().optional(),
})

/**
 * GET /api/audit/alerts
 * 
 * Lista alertas de seguranca com filtros opcionais
 * 
 * Query Parameters:
 * - severity: Nivel de severidade (low, medium, high, critical)
 * - status: Status do alerta (open, investigating, resolved, false_positive)
 * - date_from: Data inicial (ISO string)
 * - date_to: Data final (ISO string)
 * - assigned_to: ID do usuario responsavel
 * - limit: Limite de resultados (1-100, default: 20)
 * - offset: Deslocamento para paginacao (default: 0)
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const { success, limit: rateLimit, remaining, reset } = await limiter.check(
      request.ip ?? 'anonymous'
    )

    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', limit: rateLimit, remaining, reset },
        { status: 429 }
      )
    }

    // Parse query parameters
    const url = new URL(request.url)
    const searchParams = Object.fromEntries(url.searchParams.entries())
    
    // Convert numeric strings
    if (searchParams.limit) searchParams.limit = parseInt(searchParams.limit)
    if (searchParams.offset) searchParams.offset = parseInt(searchParams.offset)

    const validatedParams = AlertsFilterSchema.parse(searchParams)

    // Initialize Supabase client
    const supabase = createClient()

    // Build query
    let query = supabase
      .from('security_alerts')
      .select(`
        id,
        type,
        severity,
        status,
        title,
        description,
        source_ip,
        user_id,
        resource_affected,
        metadata,
        assigned_to,
        created_at,
        updated_at,
        resolved_at,
        notes
      `)

    // Apply filters
    if (validatedParams.severity) {
      query = query.eq('severity', validatedParams.severity)
    }

    if (validatedParams.status) {
      query = query.eq('status', validatedParams.status)
    }

    if (validatedParams.date_from) {
      query = query.gte('created_at', validatedParams.date_from)
    }

    if (validatedParams.date_to) {
      query = query.lte('created_at', validatedParams.date_to)
    }

    if (validatedParams.assigned_to) {
      query = query.eq('assigned_to', validatedParams.assigned_to)
    }

    // Apply pagination and ordering
    query = query
      .order('created_at', { ascending: false })
      .range(validatedParams.offset, validatedParams.offset + validatedParams.limit - 1)

    const { data: alerts, error, count } = await query

    if (error) {
      console.error('Error fetching security alerts:', error)
      
      // Log audit event for error
      await logAuditEvent({
        type: AuditEventType.SECURITY_ALERT_ACCESS,
        severity: AuditSeverity.HIGH,
        description: `Failed to fetch security alerts: ${error.message}`,
        metadata: {
          error: error.message,
          filters: validatedParams,
        },
      })

      return NextResponse.json(
        { error: 'Failed to fetch security alerts' },
        { status: 500 }
      )
    }

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('security_alerts')
      .select('*', { count: 'exact', head: true })

    // Log successful access
    await logAuditEvent({
      type: AuditEventType.SECURITY_ALERT_ACCESS,
      severity: AuditSeverity.MEDIUM,
      description: `Security alerts accessed successfully`,
      metadata: {
        filters: validatedParams,
        count: alerts?.length || 0,
      },
    })

    return NextResponse.json({
      alerts,
      pagination: {
        limit: validatedParams.limit,
        offset: validatedParams.offset,
        total: totalCount,
        hasMore: validatedParams.offset + validatedParams.limit < (totalCount || 0),
      },
    })
  } catch (error) {
    console.error('Security alerts API error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid parameters',
          details: error.errors 
        },
        { status: 400 }
      )
    }

    // Log audit event for unexpected error
    await logAuditEvent({
      type: AuditEventType.SECURITY_ALERT_ACCESS,
      severity: AuditSeverity.HIGH,
      description: `Unexpected error in security alerts API: ${error instanceof Error ? error.message : 'Unknown error'}`,
      metadata: {
        error: error instanceof Error ? error.stack : error,
      },
    })

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/audit/alerts
 * 
 * Atualiza status e informacoes de um alerta de seguranca
 * 
 * Body:
 * - alert_id: ID do alerta (UUID)
 * - status: Novo status (open, investigating, resolved, false_positive)
 * - assigned_to: ID do usuario responsavel (opcional)
 * - notes: Observacoes sobre a atualizacao (opcional)
 */
export async function PATCH(request: NextRequest) {
  try {
    // Rate limiting
    const { success, limit: rateLimit, remaining, reset } = await limiter.check(
      request.ip ?? 'anonymous'
    )

    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', limit: rateLimit, remaining, reset },
        { status: 429 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = UpdateAlertSchema.parse(body)

    // Initialize Supabase client
    const supabase = createClient()

    // Prepare update data
    const updateData: any = {
      status: validatedData.status,
      updated_at: new Date().toISOString(),
    }

    if (validatedData.assigned_to) {
      updateData.assigned_to = validatedData.assigned_to
    }

    if (validatedData.notes) {
      updateData.notes = validatedData.notes
    }

    // Set resolved_at if status is resolved
    if (validatedData.status === 'resolved') {
      updateData.resolved_at = new Date().toISOString()
    }

    // Update alert
    const { data: updatedAlert, error } = await supabase
      .from('security_alerts')
      .update(updateData)
      .eq('id', validatedData.alert_id)
      .select()
      .single()

    if (error) {
      console.error('Error updating security alert:', error)
      
      // Log audit event for error
      await logAuditEvent({
        type: AuditEventType.SECURITY_ALERT_UPDATE,
        severity: AuditSeverity.HIGH,
        description: `Failed to update security alert: ${error.message}`,
        metadata: {
          alert_id: validatedData.alert_id,
          error: error.message,
          update_data: validatedData,
        },
      })

      return NextResponse.json(
        { error: 'Failed to update security alert' },
        { status: 500 }
      )
    }

    // Log successful update
    await logAuditEvent({
      type: AuditEventType.SECURITY_ALERT_UPDATE,
      severity: AuditSeverity.MEDIUM,
      description: `Security alert updated successfully`,
      metadata: {
        alert_id: validatedData.alert_id,
        old_status: updatedAlert?.status,
        new_status: validatedData.status,
        assigned_to: validatedData.assigned_to,
      },
    })

    return NextResponse.json({
      message: 'Alert updated successfully',
      alert: updatedAlert,
    })
  } catch (error) {
    console.error('Security alert update API error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: error.errors 
        },
        { status: 400 }
      )
    }

    // Log audit event for unexpected error
    await logAuditEvent({
      type: AuditEventType.SECURITY_ALERT_UPDATE,
      severity: AuditSeverity.HIGH,
      description: `Unexpected error in security alert update API: ${error instanceof Error ? error.message : 'Unknown error'}`,
      metadata: {
        error: error instanceof Error ? error.stack : error,
      },
    })

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/audit/alerts
 * 
 * Cria um novo alerta de seguranca
 * Geralmente usado por sistemas automatizados de monitoramento
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting mais restritivo para criacao
    const { success, limit: rateLimit, remaining, reset } = await limiter.check(
      request.ip ?? 'anonymous',
      10 // Limite de 10 por minuto para criacao
    )

    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', limit: rateLimit, remaining, reset },
        { status: 429 }
      )
    }

    const body = await request.json()
    
    // Validacao basica dos campos obrigatorios
    const requiredFields = ['type', 'severity', 'title', 'description']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    const supabase = createClient()

    // Criar novo alerta
    const alertData = {
      type: body.type,
      severity: body.severity,
      status: 'open',
      title: body.title,
      description: body.description,
      source_ip: body.source_ip || request.ip,
      user_id: body.user_id,
      resource_affected: body.resource_affected,
      metadata: body.metadata || {},
      created_at: new Date().toISOString(),
    }

    const { data: newAlert, error } = await supabase
      .from('security_alerts')
      .insert(alertData)
      .select()
      .single()

    if (error) {
      console.error('Error creating security alert:', error)
      return NextResponse.json(
        { error: 'Failed to create security alert' },
        { status: 500 }
      )
    }

    // Log audit event for new alert
    await logAuditEvent({
      type: AuditEventType.SECURITY_ALERT_CREATE,
      severity: AuditSeverity.HIGH,
      description: `New security alert created: ${alertData.title}`,
      metadata: {
        alert_id: newAlert.id,
        alert_type: alertData.type,
        severity: alertData.severity,
      },
    })

    return NextResponse.json({
      message: 'Alert created successfully',
      alert: newAlert,
    }, { status: 201 })
  } catch (error) {
    console.error('Security alert creation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
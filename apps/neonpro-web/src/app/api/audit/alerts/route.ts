/**
 * NeonPro Security Alerts API
 * 
 * API para gestão de alertas de segurança do sistema de auditoria.
 * Permite consulta, atualização de status e atribuição de alertas.
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
import { validateCSRF } from '@/lib/security/csrf-protection'
import { logSecurityEvent } from '@/lib/security/security-events'

// =====================================================
// SCHEMAS DE VALIDAÇÃO
// =====================================================

const AlertQuerySchema = z.object({
  status: z.enum(['open', 'investigating', 'resolved', 'false_positive']).optional(),
  severity: z.nativeEnum(AuditSeverity).optional(),
  assigned_to: z.string().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0)
})

const UpdateAlertSchema = z.object({
  alert_id: z.string().uuid(),
  status: z.enum(['open', 'investigating', 'resolved', 'false_positive']).optional(),
  assigned_to: z.string().uuid().optional(),
  actions_taken: z.array(z.string()).optional(),
  notes: z.string().optional()
})

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const remoteAddr = request.headers.get('x-vercel-forwarded-for')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  return realIP || remoteAddr || 'unknown'
}

async function validateSecurityAccess(supabase: any, userId: string): Promise<boolean> {
  try {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, permissions')
      .eq('user_id', userId)
      .single()
    
    if (!profile) return false
    
    const hasSecurityAccess = 
      profile.role === 'admin' ||
      profile.role === 'security_admin' ||
      profile.permissions?.includes('security.manage')
    
    return hasSecurityAccess
  } catch (error) {
    console.error('Erro ao validar acesso de segurança:', error)
    return false
  }
}

function parseAlertFilters(searchParams: URLSearchParams) {
  const filters: any = {}
  
  if (searchParams.get('status')) {
    filters.status = searchParams.get('status')
  }
  
  if (searchParams.get('severity')) {
    filters.severity = searchParams.get('severity')
  }
  
  if (searchParams.get('assigned_to')) {
    filters.assigned_to = searchParams.get('assigned_to')
  }
  
  if (searchParams.get('limit')) {
    filters.limit = parseInt(searchParams.get('limit')!)
  }
  
  if (searchParams.get('offset')) {
    filters.offset = parseInt(searchParams.get('offset')!)
  }
  
  return filters
}

// =====================================================
// GET: LISTAR ALERTAS
// =====================================================

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = await rateLimit({
      key: `security-alerts-${clientIP}`,
      limit: 60,
      window: 60000
    })
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }
    
    // Autenticação
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Validação de permissões
    const hasAccess = await validateSecurityAccess(supabase, user.id)
    if (!hasAccess) {
      await logSecurityEvent({
        type: 'insufficient_permissions',
        severity: 'medium',
        description: 'Usuário sem permissões para acessar alertas de segurança',
        user_id: user.id,
        ip_address: clientIP,
        user_agent: request.headers.get('user-agent') || undefined
      })
      
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }
    
    // Parse e validação dos filtros
    const { searchParams } = new URL(request.url)
    const rawFilters = parseAlertFilters(searchParams)
    
    const validationResult = AlertQuerySchema.safeParse(rawFilters)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid query parameters',
          details: validationResult.error.errors
        },
        { status: 400 }
      )
    }
    
    const filters = validationResult.data
    
    // Construir query
    let query = supabase
      .from('security_alerts')
      .select('*')
      .order('created_at', { ascending: false })
      .range(filters.offset, filters.offset + filters.limit - 1)
    
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    
    if (filters.severity) {
      query = query.eq('severity', filters.severity)
    }
    
    if (filters.assigned_to) {
      query = query.eq('assigned_to', filters.assigned_to)
    }
    
    const { data: alerts, error: queryError } = await query
    
    if (queryError) {
      throw queryError
    }
    
    // Contar total para paginação
    let countQuery = supabase
      .from('security_alerts')
      .select('*', { count: 'exact', head: true })
    
    if (filters.status) {
      countQuery = countQuery.eq('status', filters.status)
    }
    
    if (filters.severity) {
      countQuery = countQuery.eq('severity', filters.severity)
    }
    
    if (filters.assigned_to) {
      countQuery = countQuery.eq('assigned_to', filters.assigned_to)
    }
    
    const { count } = await countQuery
    
    // Log da consulta
    await logAuditEvent({
      event_type: AuditEventType.SECURITY_ALERT_ACCESS,
      severity: AuditSeverity.LOW,
      description: 'Consulta de alertas de segurança realizada',
      user_id: user.id,
      ip_address: clientIP,
      user_agent: request.headers.get('user-agent') || undefined,
      metadata: {
        filters_applied: filters,
        results_count: alerts?.length || 0
      }
    })
    
    return NextResponse.json({
      success: true,
      data: alerts || [],
      pagination: {
        limit: filters.limit,
        offset: filters.offset,
        total: count || 0
      }
    })
    
  } catch (error) {
    console.error('Erro na consulta de alertas:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// =====================================================
// PATCH: ATUALIZAR ALERTA
// =====================================================

export async function PATCH(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = await rateLimit({
      key: `update-alert-${clientIP}`,
      limit: 30,
      window: 60000
    })
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }
    
    // Autenticação
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Validação CSRF
    const csrfValid = await validateCSRF(request)
    if (!csrfValid) {
      await logSecurityEvent({
        type: 'csrf_validation_failed',
        severity: 'high',
        description: 'Falha na validação CSRF para atualização de alerta',
        user_id: user.id,
        ip_address: clientIP,
        user_agent: request.headers.get('user-agent') || undefined
      })
      
      return NextResponse.json(
        { error: 'CSRF validation failed' },
        { status: 403 }
      )
    }
    
    // Validação de permissões
    const hasAccess = await validateSecurityAccess(supabase, user.id)
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }
    
    // Parse e validação do body
    const body = await request.json()
    const validationResult = UpdateAlertSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request body',
          details: validationResult.error.errors
        },
        { status: 400 }
      )
    }
    
    const { alert_id, ...updateData } = validationResult.data
    
    // Buscar alerta atual
    const { data: currentAlert, error: fetchError } = await supabase
      .from('security_alerts')
      .select('*')
      .eq('id', alert_id)
      .single()
    
    if (fetchError || !currentAlert) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      )
    }
    
    // Preparar dados de atualização
    const updatePayload: any = {
      ...updateData,
      updated_at: new Date().toISOString()
    }
    
    // Se status mudou para resolved, adicionar timestamp
    if (updateData.status === 'resolved' && currentAlert.status !== 'resolved') {
      updatePayload.resolved_at = new Date().toISOString()
    }
    
    // Atualizar alerta
    const { data: updatedAlert, error: updateError } = await supabase
      .from('security_alerts')
      .update(updatePayload)
      .eq('id', alert_id)
      .select()
      .single()
    
    if (updateError) {
      throw updateError
    }
    
    // Log da atualização
    await logAuditEvent({
      event_type: AuditEventType.SECURITY_ALERT_UPDATE,
      severity: AuditSeverity.MEDIUM,
      description: `Alerta de segurança atualizado: ${alert_id}`,
      user_id: user.id,
      ip_address: clientIP,
      user_agent: request.headers.get('user-agent') || undefined,
      resource_type: 'security_alert',
      resource_id: alert_id,
      metadata: {
        previous_status: currentAlert.status,
        new_status: updateData.status,
        changes: updateData
      }
    })
    
    return NextResponse.json({
      success: true,
      data: updatedAlert
    })
    
  } catch (error) {
    console.error('Erro na atualização de alerta:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// =====================================================
// OPTIONS: CORS
// =====================================================

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
    },
  })
}

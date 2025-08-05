/**
 * NeonPro Audit Logs API
 * 
 * API para consulta, filtros e exportação de logs de auditoria.
 * Implementa autenticação, autorização e validação de dados.
 * 
 * Endpoints:
 * - GET /api/audit/logs - Consulta logs com filtros
 * - POST /api/audit/logs - Registra novo evento
 * 
 * @author APEX Master Developer
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { 
  AuditEventType, 
  AuditSeverity, 
  AuditQueryFilters,
  auditSystem,
  logAuditEvent
} from '@/lib/audit/audit-system'
import { rateLimit } from '@/lib/security/rate-limiting'
import { validateCSRF } from '@/lib/security/csrf-protection'
import { logSecurityEvent } from '@/lib/security/security-events'

// =====================================================
// SCHEMAS DE VALIDAÇÃO
// =====================================================

const QueryFiltersSchema = z.object({
  event_type: z.nativeEnum(AuditEventType).optional(),
  severity: z.nativeEnum(AuditSeverity).optional(),
  user_id: z.string().optional(),
  ip_address: z.string().optional(),
  resource_type: z.string().optional(),
  resource_id: z.string().optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  limit: z.number().min(1).max(1000).default(100),
  offset: z.number().min(0).default(0),
  search: z.string().optional()
})

const CreateEventSchema = z.object({
  event_type: z.nativeEnum(AuditEventType),
  severity: z.nativeEnum(AuditSeverity),
  description: z.string().min(1).max(1000),
  resource_type: z.string().optional(),
  resource_id: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  user_agent: z.string().optional()
})

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Extrai IP do cliente da requisição
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const remoteAddr = request.headers.get('x-vercel-forwarded-for')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  return realIP || remoteAddr || 'unknown'
}

/**
 * Valida permissões de acesso aos logs
 */
async function validateAuditAccess(supabase: any, userId: string): Promise<boolean> {
  try {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, permissions')
      .eq('user_id', userId)
      .single()
    
    if (!profile) return false
    
    // Verifica se tem permissão de auditoria
    const hasAuditPermission = 
      profile.role === 'admin' ||
      profile.role === 'security_admin' ||
      profile.permissions?.includes('audit.read')
    
    return hasAuditPermission
  } catch (error) {
    console.error('Erro ao validar acesso de auditoria:', error)
    return false
  }
}

/**
 * Converte filtros de query string para objeto
 */
function parseQueryFilters(searchParams: URLSearchParams): Partial<AuditQueryFilters> {
  const filters: Partial<AuditQueryFilters> = {}
  
  if (searchParams.get('event_type')) {
    filters.event_type = searchParams.get('event_type') as AuditEventType
  }
  
  if (searchParams.get('severity')) {
    filters.severity = searchParams.get('severity') as AuditSeverity
  }
  
  if (searchParams.get('user_id')) {
    filters.user_id = searchParams.get('user_id')!
  }
  
  if (searchParams.get('ip_address')) {
    filters.ip_address = searchParams.get('ip_address')!
  }
  
  if (searchParams.get('resource_type')) {
    filters.resource_type = searchParams.get('resource_type')!
  }
  
  if (searchParams.get('resource_id')) {
    filters.resource_id = searchParams.get('resource_id')!
  }
  
  if (searchParams.get('start_date')) {
    filters.start_date = new Date(searchParams.get('start_date')!)
  }
  
  if (searchParams.get('end_date')) {
    filters.end_date = new Date(searchParams.get('end_date')!)
  }
  
  if (searchParams.get('limit')) {
    filters.limit = parseInt(searchParams.get('limit')!)
  }
  
  if (searchParams.get('offset')) {
    filters.offset = parseInt(searchParams.get('offset')!)
  }
  
  if (searchParams.get('search')) {
    filters.search = searchParams.get('search')!
  }
  
  return filters
}

// =====================================================
// GET: CONSULTAR LOGS
// =====================================================

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = await rateLimit({
      key: `audit-logs-${clientIP}`,
      limit: 100,
      window: 60000 // 1 minuto
    })
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }
    
    // Autenticação
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      await logSecurityEvent({
        type: 'unauthorized_audit_access',
        severity: 'medium',
        description: 'Tentativa de acesso não autorizado aos logs de auditoria',
        ip_address: clientIP,
        user_agent: request.headers.get('user-agent') || undefined
      })
      
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Validação de permissões
    const hasAccess = await validateAuditAccess(supabase, user.id)
    if (!hasAccess) {
      await logSecurityEvent({
        type: 'insufficient_permissions',
        severity: 'medium',
        description: 'Usuário sem permissões suficientes para acessar logs de auditoria',
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
    const rawFilters = parseQueryFilters(searchParams)
    
    const validationResult = QueryFiltersSchema.safeParse(rawFilters)
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
    
    // Consulta dos logs
    const events = await auditSystem.queryEvents({
      ...filters,
      start_date: filters.start_date ? new Date(filters.start_date) : undefined,
      end_date: filters.end_date ? new Date(filters.end_date) : undefined
    })
    
    // Log da consulta
    await logAuditEvent({
      event_type: AuditEventType.AUDIT_LOG_ACCESS,
      severity: AuditSeverity.LOW,
      description: `Consulta de logs de auditoria realizada`,
      user_id: user.id,
      ip_address: clientIP,
      user_agent: request.headers.get('user-agent') || undefined,
      metadata: {
        filters_applied: filters,
        results_count: events.length
      }
    })
    
    return NextResponse.json({
      success: true,
      data: events,
      pagination: {
        limit: filters.limit,
        offset: filters.offset,
        total: events.length
      }
    })
    
  } catch (error) {
    console.error('Erro na consulta de logs de auditoria:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// =====================================================
// POST: REGISTRAR EVENTO
// =====================================================

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimitResult = await rateLimit({
      key: `audit-create-${clientIP}`,
      limit: 50,
      window: 60000 // 1 minuto
    })
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }
    
    // Autenticação
    const supabase = await createClient()
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
        description: 'Falha na validação CSRF para criação de evento de auditoria',
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
    const hasAccess = await validateAuditAccess(supabase, user.id)
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }
    
    // Parse e validação do body
    const body = await request.json()
    const validationResult = CreateEventSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request body',
          details: validationResult.error.errors
        },
        { status: 400 }
      )
    }
    
    const eventData = validationResult.data
    
    // Criação do evento
    const event = await logAuditEvent({
      ...eventData,
      user_id: user.id,
      ip_address: clientIP,
      user_agent: eventData.user_agent || request.headers.get('user-agent') || undefined
    })
    
    return NextResponse.json({
      success: true,
      data: event
    }, { status: 201 })
    
  } catch (error) {
    console.error('Erro na criação de evento de auditoria:', error)
    
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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
    },
  })
}




import { Database } from '@neonpro/database'
import { PermissionContext, QueryIntent, QueryParameters } from '@neonpro/types'
import { getOttomatorBridge, OttomatorQuery, OttomatorResponse } from './ottomator-agent-bridge'
import { logger } from '../lib/logger'
import { aiValidationService } from './ai-validation-service'
import { aiConnectionManager } from './ai-connection-manager'

/**
 * AI Data Service - Base class for AI agent database operations
 *
 * Provides secure data access with Row Level Security (RLS) enforcement,
 * permission validation, and audit logging for all AI agent queries.
 * 
 * @security LGPD compliant with proper input validation and audit logging
 * @performance Optimized with connection pooling and query caching
 * @compliance ANVISA, CFM, and healthcare data protection standards
 */
export class AIDataService {
  private permissionContext: PermissionContext
  private requestCount = 0
  private lastRequestTime = Date.now()

  constructor(permissionContext: PermissionContext) {
    this.permissionContext = permissionContext

    // Validate required environment variables
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required Supabase configuration')
    }

    // Initialize connection manager will be handled on-demand
  }

  /**
   * Validate user has permission for the requested operation
   */
  private validatePermission(intent: QueryIntent): void {
    const { permissions, userId, domain } = this.permissionContext

    // Input validation for permission context
    if (!userId || !domain) {
      throw new Error('Access denied: Invalid permission context')
    }

    // Rate limiting check
    this.checkRateLimit()

    switch (intent) {
      case 'client_data':
        if (!permissions.includes('read_clients')) {
          throw new Error(
            'Access denied: Insufficient permissions for client data access',
          )
        }
        break
      case 'appointments':
        if (!permissions.includes('read_appointments')) {
          throw new Error(
            'Access denied: Insufficient permissions for appointment data access',
          )
        }
        break
      case 'financial':
        if (!permissions.includes('read_financial')) {
          throw new Error(
            'Access denied: Insufficient permissions for financial data access',
          )
        }
        break
      default:
        // General queries don't require specific permissions
        break
    }

    // Domain validation - ensure user can only access their domain's data
    if (!domain) {
      throw new Error('Access denied: User domain not specified')
    }
  }

  /**
   * Simple rate limiting to prevent abuse
   */
  private checkRateLimit(): void {
    const now = Date.now()
    const timeWindow = 60000 // 1 minute
    const maxRequests = 100 // Max requests per minute

    if (now - this.lastRequestTime > timeWindow) {
      // Reset counter
      this.requestCount = 1
      this.lastRequestTime = now
    } else {
      this.requestCount++
      if (this.requestCount > maxRequests) {
        throw new Error('Rate limit exceeded. Please try again later.')
      }
    }
  }

  /**
   * Log data access for audit purposes
   */
  private async logAccess(
    intent: QueryIntent,
    parameters: QueryParameters,
    recordCount: number,
    success: boolean = true,
  ): Promise<void> {
    try {
      await this.supabase.from('audit_logs').insert({
        user_id: this.permissionContext.userId,
        action: `ai_agent_${intent}`,
        entity_type: intent,
        parameters: parameters as any,
        record_count: recordCount,
        success,
        domain: this.permissionContext.domain,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Failed to log audit entry:', error)
      // Don't throw - audit logging failures shouldn't block operations
    }
  }

  /**
   * Apply domain filter to queries for RLS enforcement
   */
  private withDomainFilter(query: any, domain: string) {
    return query.eq('domain', domain)
  }

  /**
   * Execute database operation with connection pooling
   */
  private async executeWithConnection<T>(
    operation: (supabase: SupabaseClient<Database>) => Promise<T>
  ): Promise<T> {
    return await aiConnectionManager.executeWithConnection(operation)
  }

  /**
   * Get clients by name with permission enforcement
   */
  async getClientsByName(parameters: QueryParameters): Promise<any[]> {
    this.validatePermission('client_data')

    // Validate and sanitize input parameters
    const sanitizedParams = aiValidationService.validateAndSanitizeQuery(
      'client_data',
      parameters,
      this.permissionContext
    )

    const { domain } = this.permissionContext
    const clientNames = sanitizedParams.clientNames || []
    
    // Use connection pooling
    return this.executeWithConnection(async (supabase) => {
      let query = supabase.from('clients').select(`
        id,
        name,
        email,
        phone,
        address,
        birth_date,
        created_at,
        updated_at
      `)

    // Apply domain filter
    query = this.withDomainFilter(query, domain)

    // Filter by client names if specified
    if (clientNames.length > 0) {
      // Use ILIKE for case-insensitive search
      const nameConditions = clientNames
        .map(name => `name.ilike.%${name}%`)
        .join(',')
      query = query.or(nameConditions)
    }

    // Role-based filtering
    if (this.permissionContext.role === 'receptionist') {
      // Receptionists see basic info only
      query = query.select('id, name, email, phone')
    }

    const { data, error } = await query

      if (error) {
        await this.logAccess('client_data', sanitizedParams, 0, false)
        throw new Error(`Failed to retrieve clients: ${error.message}`)
      }

      await this.logAccess('client_data', sanitizedParams, data?.length || 0)
      
      // Validate output data
      return aiValidationService.validateOutputData(data || [], 'client_data', this.permissionContext)
    })
  }

  /**
   * Get appointments by date range with permission enforcement
   */
  async getAppointmentsByDate(parameters: QueryParameters): Promise<any[]> {
    this.validatePermission('appointments')

    // Validate and sanitize input parameters
    const sanitizedParams = aiValidationService.validateAndSanitizeQuery(
      'appointments',
      parameters,
      this.permissionContext
    )

    const { domain } = this.permissionContext
    const { dateRanges } = sanitizedParams

    let query = this.supabase.from('appointments').select(`
        id,
        client_id,
        provider_id,
        datetime,
        duration,
        status,
        type,
        notes,
        clients!inner (
          id,
          name,
          email
        ),
        providers!inner (
          id,
          name,
          specialty
        )
      `)

    // Apply domain filter
    query = this.withDomainFilter(query, domain)

    // Apply date filtering
    if (dateRanges && dateRanges.length > 0) {
      const range = dateRanges[0] // Use first range for now
      query = query
        .gte('datetime', range.start.toISOString())
        .lte('datetime', range.end.toISOString())
    }

    // Role-based filtering
    if (this.permissionContext.role === 'receptionist') {
      // Receptionists see basic appointment info
      query = query.select(`
        id,
        client_id,
        datetime,
        duration,
        status,
        type,
        clients!inner (id, name),
        providers!inner (id, name)
      `)
    }

    // Order by datetime (upcoming first)
    query = query.order('datetime', { ascending: true })

    const { data, error } = await query

    if (error) {
      await this.logAccess('appointments', sanitizedParams, 0, false)
      throw new Error(`Failed to retrieve appointments: ${error.message}`)
    }

    await this.logAccess('appointments', sanitizedParams, data?.length || 0)
    
    // Validate output data
    return aiValidationService.validateOutputData(data || [], 'appointments', this.permissionContext)
  }

  /**
   * Get financial summary with permission enforcement
   */
  async getFinancialSummary(parameters: QueryParameters): Promise<any> {
    this.validatePermission('financial')

    // Validate and sanitize input parameters
    const sanitizedParams = aiValidationService.validateAndSanitizeQuery(
      'financial',
      parameters,
      this.permissionContext
    )

    const { domain } = this.permissionContext
    const { financial } = sanitizedParams

    // Admin and certain roles can see financial data
    if (!['admin'].includes(this.permissionContext._role)) {
      throw new Error(
        'Access denied: Insufficient permissions for financial data access',
      )
    }

    let dateFilter = ''
    if (financial?.period) {
      const now = new Date()
      switch (financial.period) {
        case 'today':
          dateFilter = `AND date::date = '${now.toISOString().split('T')[0]}'`
          break
        case 'week':
          const weekStart = new Date(now)
          weekStart.setDate(now.getDate() - now.getDay())
          dateFilter = `AND date >= '${weekStart.toISOString().split('T')[0]}'`
          break
        case 'month':
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
          dateFilter = `AND date >= '${monthStart.toISOString().split('T')[0]}'`
          break
        case 'year':
          const yearStart = new Date(now.getFullYear(), 0, 1)
          dateFilter = `AND date >= '${yearStart.toISOString().split('T')[0]}'`
          break
      }
    }

    // Build financial summary query
    const { data, error } = await this.supabase.rpc('get_financial_summary', {
      domain_filter: domain,
      date_filter: dateFilter,
      type_filter: financial?.type || 'all',
    })

    if (error) {
      await this.logAccess('financial', sanitizedParams, 0, false)
      throw new Error(`Failed to retrieve financial summary: ${error.message}`)
    }

    await this.logAccess('financial', sanitizedParams, 1)
    
    // Validate output data
    return aiValidationService.validateOutputData(data, 'financial', this.permissionContext)
    return data
  }

  /**
   * Get specific client information with related data
   */
  async getClientDetails(clientId: string): Promise<any> {
    this.validatePermission('client_data')

    const { domain, role } = this.permissionContext

    // Verify client exists and belongs to domain
    const { data: client, error: clientError } = await this.supabase
      .from('clients')
      .select('id, domain')
      .eq('id', clientId)
      .single()

    if (clientError || !client) {
      throw new Error('Client not found')
    }

    if (client.domain !== domain) {
      throw new Error('Access denied: Client not in your domain')
    }

    let query = this.supabase
      .from('clients')
      .select(
        `
        id,
        name,
        email,
        phone,
        address,
        birth_date,
        documents,
        medical_history,
        created_at,
        updated_at,
        appointments (
          id,
          datetime,
          duration,
          status,
          type,
          notes,
          providers (id, name, specialty)
        ),
        financial_records (
          id,
          amount,
          type,
          status,
          description,
          timestamp
        )
      `,
      )
      .eq('id', clientId)

    // Role-based filtering
    if (role === 'receptionist') {
      query = query.select(`
        id,
        name,
        email,
        phone,
        address,
        appointments (
          id,
          datetime,
          duration,
          status,
          type,
          providers (id, name)
        )
      `)
    }

    const { data, error } = await query.single()

    if (error) {
      await this.logAccess('client_data', { clientId }, 0, false)
      throw new Error(`Failed to retrieve client details: ${error.message}`)
    }

    await this.logAccess('client_data', { clientId }, 1)
    return data
  }

  /**
   * Get user's accessible data scope based on permissions
   */
  async getDataScope(): Promise<{
    domain: string
    _role: string
    permissions: string[]
    dataScope: string
  }> {
    // const { userId } = this.permissionContext;

    const { data, error } = await this.supabase
      .from('user_permissions')
      .select(
        `
        domain,
        role,
        permissions,
        data_scope
      `,
      )
      .eq('user_id', _userId)
      .single()

    if (error) {
      throw new Error(`Failed to retrieve user permissions: ${error.message}`)
    }

    return {
      domain: data.domain,
      _role: data.role,
      permissions: data.permissions,
      dataScope: data.data_scope,
    }
  }

  /**
   * Health check for the service
   */
  async healthCheck(): Promise<{
    status: string
    timestamp: string
    database: string
  }> {
    try {
      const { data: _data, error } = await this.supabase
        .from('audit_logs')
        .select('count')
        .limit(1)

      if (error) {
        throw error
      }

      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'connected',
      }
    } catch {
      void _error
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
      }
    }
  }

  /**
   * Update permission context (e.g., after session refresh)
   */
  updatePermissionContext(newContext: PermissionContext): void {
    this.permissionContext = newContext
  }

  /**
   * Get current permission context
   */
  getPermissionContext(): PermissionContext {
    return { ...this.permissionContext }
  }

  /**
   * Process natural language query through ottomator-agents
   */
  async processNaturalLanguageQuery(
    _query: string,
    sessionId: string,
    _context?: {
      patientId?: string
      previousQueries?: string[]
    },
  ): Promise<OttomatorResponse> {
    try {
      const ottomatorBridge = getOttomatorBridge()

      if (!ottomatorBridge.isAgentHealthy()) {
        // Fallback to direct database queries if ottomator agent is not available
        return this.fallbackQueryProcessing(query, sessionId, _context)
      }

      const ottomatorQuery: OttomatorQuery = {
        query,
        sessionId,
        _userId: this.permissionContext.userId,
        _context: {
          patientId: context?.patientId,
          clinicId: this.permissionContext.domain,
          previousQueries: context?.previousQueries,
          userRole: this.permissionContext.role,
        },
      }

      const response = await ottomatorBridge.processQuery(ottomatorQuery)

      // Log the query for audit purposes
      await this.logAccess('general', { query, sessionId }, 1)

      return response
    } catch {
      void _error
      console.error('Ottomator agent query failed:', error)

      // Fallback to direct processing
      return this.fallbackQueryProcessing(query, sessionId, _context)
    }
  }

  /**
   * Fallback query processing when ottomator-agents is not available
   */
  private async fallbackQueryProcessing(
    _query: string,
    _sessionId: string,
    _context?: {
      patientId?: string
      previousQueries?: string[]
    },
  ): Promise<OttomatorResponse> {
    const startTime = Date.now()

    try {
      // Simple intent detection based on keywords
      const intent = this.detectQueryIntent(query)
      let result: any = null

      switch (intent) {
        case 'client_data':
          try {
            result = await this.getClientsByName({ clientNames: [query] })
          } catch {
            void _error
            result = {
              message: 'Erro ao buscar clientes: ' +
                (error instanceof Error ? error.message : 'Erro desconhecido'),
            }
          }
          break
        case 'appointments':
          try {
            const today = new Date()
            const tomorrow = new Date(today)
            tomorrow.setDate(today.getDate() + 1)
            result = await this.getAppointmentsByDate({
              dateRanges: [{ start: today, end: tomorrow }],
            })
          } catch {
            void _error
            result = {
              message: 'Erro ao buscar agendamentos: ' +
                (error instanceof Error ? error.message : 'Erro desconhecido'),
            }
          }
          break
        case 'financial':
          try {
            result = await this.getFinancialSummary({
              financial: { period: 'today', type: 'all' },
            })
          } catch {
            void _error
            result = {
              message: 'Erro ao buscar dados financeiros: ' +
                (error instanceof Error ? error.message : 'Erro desconhecido'),
            }
          }
          break
        default:
          result = {
            message: 'Desculpe, não consegui entender sua consulta. Tente ser mais específico.',
          }
      }

      return {
        success: true,
        response: {
          content: this.formatFallbackResponse(result, intent),
          type: 'text',
          sources: [
            {
              title: 'Sistema NeonPro',
              confidence: 0.8,
            },
          ],
        },
        metadata: {
          processingTimeMs: Date.now() - startTime,
          model: 'fallback',
        },
      }
    } catch {
      void _error
      return {
        success: false,
        error: {
          code: 'FALLBACK_ERROR',
          message: 'Erro ao processar consulta',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        metadata: {
          processingTimeMs: Date.now() - startTime,
          model: 'fallback',
        },
      }
    }
  }

  /**
   * Simple intent detection for fallback processing
   */
  private detectQueryIntent(_query: string): QueryIntent {
    const lowerQuery = query.toLowerCase()

    if (lowerQuery.includes('cliente') || lowerQuery.includes('paciente')) {
      return 'client_data'
    }
    if (
      lowerQuery.includes('agendamento') ||
      lowerQuery.includes('consulta') ||
      lowerQuery.includes('horário')
    ) {
      return 'appointments'
    }
    if (
      lowerQuery.includes('financeiro') ||
      lowerQuery.includes('pagamento') ||
      lowerQuery.includes('valor')
    ) {
      return 'financial'
    }

    return 'general'
  }

  /**
   * Format fallback response for display
   */
  private formatFallbackResponse(result: any, intent: QueryIntent): string {
    if (!result || (Array.isArray(result) && result.length === 0)) {
      return 'Nenhum resultado encontrado para sua consulta.'
    }

    switch (intent) {
      case 'client_data':
        if (Array.isArray(result)) {
          return `Encontrei ${result.length} cliente(s):\n${
            result
              .map(c => `• ${c.name} (${c.email})`)
              .join('\n')
          }`
        } else if (result?.message) {
          return `Consulta de clientes: ${result.message}`
        }
        return 'Nenhum cliente encontrado.'
      case 'appointments':
        if (Array.isArray(result)) {
          return `Encontrei ${result.length} agendamento(s) para hoje:\n${
            result
              .map(
                a => `• ${a.clients?.name} - ${new Date(a.datetime).toLocaleTimeString()}`,
              )
              .join('\n')
          }`
        } else if (result?.message) {
          return `Consulta de agendamentos: ${result.message}`
        }
        return 'Nenhum agendamento encontrado.'
      case 'financial':
        if (result?.message) {
          return `Consulta financeira: ${result.message}`
        }
        return `Resumo financeiro: ${JSON.stringify(result, null, 2)}`
      default:
        if (result?.message) {
          return result.message
        }
        return JSON.stringify(result, null, 2)
    }
  }
}

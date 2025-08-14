// =====================================================
// Security Event Logger Service
// Story 1.4: Session Management & Security
// =====================================================

import { SupabaseClient } from '@supabase/supabase-js'

// Types
export type SecurityEventType = 
  | 'suspicious_login'
  | 'unusual_location'
  | 'rapid_requests'
  | 'session_hijack_attempt'
  | 'concurrent_limit_exceeded'
  | 'security_violation'
  | 'device_registration'
  | 'mfa_bypass_attempt'

export type EventSeverity = 'low' | 'medium' | 'high' | 'critical'

export interface SecurityEvent {
  id?: string
  sessionId?: string
  userId: string | null
  eventType: SecurityEventType
  severity: EventSeverity
  details: Record<string, any>
  ipAddress?: string
  userAgent?: string
  resolved?: boolean
  resolvedAt?: Date
  resolvedBy?: string
  timestamp?: Date
  createdAt?: Date
  updatedAt?: Date
}

export interface SecurityEventFilter {
  userId?: string
  sessionId?: string
  eventType?: SecurityEventType
  severity?: EventSeverity
  resolved?: boolean
  startDate?: Date
  endDate?: Date
  ipAddress?: string
  limit?: number
  offset?: number
}

export interface SecurityEventStats {
  totalEvents: number
  eventsBySeverity: Record<EventSeverity, number>
  eventsByType: Record<SecurityEventType, number>
  unresolvedEvents: number
  recentEvents: number
  topIpAddresses: Array<{ ip: string; count: number }>
  topUsers: Array<{ userId: string; email?: string; count: number }>
}

export interface SecurityAlert {
  id: string
  title: string
  description: string
  severity: EventSeverity
  eventCount: number
  affectedUsers: number
  timeframe: string
  recommendations: string[]
}

// Security Event Logger Service
export class SecurityEventLogger {
  private supabase: SupabaseClient

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
  }

  // =====================================================
  // EVENT LOGGING METHODS
  // =====================================================

  /**
   * Log a security event
   */
  async logEvent(event: SecurityEvent): Promise<SecurityEvent> {
    try {
      const { data, error } = await this.supabase
        .from('session_security_events')
        .insert({
          session_id: event.sessionId,
          user_id: event.userId,
          event_type: event.eventType,
          severity: event.severity,
          details: event.details,
          ip_address: event.ipAddress,
          user_agent: event.userAgent,
          resolved: event.resolved || false,
          timestamp: event.timestamp?.toISOString() || new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to log security event: ${error.message}`)
      }

      const loggedEvent = this.mapSecurityEvent(data)

      // Check if this event triggers any alerts
      await this.checkForAlerts(loggedEvent)

      return loggedEvent
    } catch (error) {
      console.error('Security event logging error:', error)
      throw error
    }
  }

  /**
   * Log multiple security events in batch
   */
  async logEvents(events: SecurityEvent[]): Promise<SecurityEvent[]> {
    try {
      const eventData = events.map(event => ({
        session_id: event.sessionId,
        user_id: event.userId,
        event_type: event.eventType,
        severity: event.severity,
        details: event.details,
        ip_address: event.ipAddress,
        user_agent: event.userAgent,
        resolved: event.resolved || false,
        timestamp: event.timestamp?.toISOString() || new Date().toISOString()
      }))

      const { data, error } = await this.supabase
        .from('session_security_events')
        .insert(eventData)
        .select()

      if (error) {
        throw new Error(`Failed to log security events: ${error.message}`)
      }

      const loggedEvents = data.map(this.mapSecurityEvent)

      // Check for alerts on high severity events
      const highSeverityEvents = loggedEvents.filter(e => 
        e.severity === 'high' || e.severity === 'critical'
      )
      
      for (const event of highSeverityEvents) {
        await this.checkForAlerts(event)
      }

      return loggedEvents
    } catch (error) {
      console.error('Batch security event logging error:', error)
      throw error
    }
  }

  // =====================================================
  // EVENT RETRIEVAL METHODS
  // =====================================================

  /**
   * Get security events with filtering
   */
  async getEvents(filter: SecurityEventFilter = {}): Promise<SecurityEvent[]> {
    try {
      let query = this.supabase
        .from('session_security_events')
        .select(`
          *,
          profiles:user_id(email, full_name)
        `)

      // Apply filters
      if (filter.userId) {
        query = query.eq('user_id', filter.userId)
      }
      if (filter.sessionId) {
        query = query.eq('session_id', filter.sessionId)
      }
      if (filter.eventType) {
        query = query.eq('event_type', filter.eventType)
      }
      if (filter.severity) {
        query = query.eq('severity', filter.severity)
      }
      if (filter.resolved !== undefined) {
        query = query.eq('resolved', filter.resolved)
      }
      if (filter.ipAddress) {
        query = query.eq('ip_address', filter.ipAddress)
      }
      if (filter.startDate) {
        query = query.gte('timestamp', filter.startDate.toISOString())
      }
      if (filter.endDate) {
        query = query.lte('timestamp', filter.endDate.toISOString())
      }

      // Apply pagination
      if (filter.limit) {
        query = query.limit(filter.limit)
      }
      if (filter.offset) {
        query = query.range(filter.offset, (filter.offset + (filter.limit || 50)) - 1)
      }

      // Order by timestamp descending
      query = query.order('timestamp', { ascending: false })

      const { data, error } = await query

      if (error) {
        throw new Error(`Failed to get security events: ${error.message}`)
      }

      return data.map(this.mapSecurityEvent)
    } catch (error) {
      console.error('Get security events error:', error)
      return []
    }
  }

  /**
   * Get security event by ID
   */
  async getEventById(eventId: string): Promise<SecurityEvent | null> {
    try {
      const { data, error } = await this.supabase
        .from('session_security_events')
        .select(`
          *,
          profiles:user_id(email, full_name),
          resolver:resolved_by(email, full_name)
        `)
        .eq('id', eventId)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw new Error(`Failed to get security event: ${error.message}`)
      }

      return data ? this.mapSecurityEvent(data) : null
    } catch (error) {
      console.error('Get security event by ID error:', error)
      return null
    }
  }

  /**
   * Get unresolved security events
   */
  async getUnresolvedEvents(limit: number = 50): Promise<SecurityEvent[]> {
    return this.getEvents({
      resolved: false,
      limit
    })
  }

  /**
   * Get recent security events
   */
  async getRecentEvents(hours: number = 24, limit: number = 100): Promise<SecurityEvent[]> {
    const startDate = new Date(Date.now() - hours * 60 * 60 * 1000)
    return this.getEvents({
      startDate,
      limit
    })
  }

  // =====================================================
  // EVENT RESOLUTION METHODS
  // =====================================================

  /**
   * Resolve a security event
   */
  async resolveEvent(
    eventId: string,
    resolvedBy: string,
    resolution?: string
  ): Promise<SecurityEvent> {
    try {
      const { data, error } = await this.supabase
        .from('session_security_events')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: resolvedBy,
          details: resolution ? {
            ...((await this.getEventById(eventId))?.details || {}),
            resolution
          } : undefined
        })
        .eq('id', eventId)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to resolve security event: ${error.message}`)
      }

      return this.mapSecurityEvent(data)
    } catch (error) {
      console.error('Resolve security event error:', error)
      throw error
    }
  }

  /**
   * Bulk resolve security events
   */
  async resolveEvents(
    eventIds: string[],
    resolvedBy: string,
    resolution?: string
  ): Promise<SecurityEvent[]> {
    try {
      const { data, error } = await this.supabase
        .from('session_security_events')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: resolvedBy,
          ...(resolution && {
            details: this.supabase.rpc('jsonb_set', {
              target: 'details',
              path: '{resolution}',
              new_value: JSON.stringify(resolution)
            })
          })
        })
        .in('id', eventIds)
        .select()

      if (error) {
        throw new Error(`Failed to resolve security events: ${error.message}`)
      }

      return data.map(this.mapSecurityEvent)
    } catch (error) {
      console.error('Bulk resolve security events error:', error)
      throw error
    }
  }

  // =====================================================
  // ANALYTICS AND REPORTING METHODS
  // =====================================================

  /**
   * Get security event statistics
   */
  async getEventStatistics(
    startDate?: Date,
    endDate?: Date
  ): Promise<SecurityEventStats> {
    try {
      const start = startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      const end = endDate || new Date()

      // Get total events
      const { count: totalEvents } = await this.supabase
        .from('session_security_events')
        .select('*', { count: 'exact', head: true })
        .gte('timestamp', start.toISOString())
        .lte('timestamp', end.toISOString())

      // Get events by severity
      const { data: severityData } = await this.supabase
        .from('session_security_events')
        .select('severity')
        .gte('timestamp', start.toISOString())
        .lte('timestamp', end.toISOString())

      const eventsBySeverity: Record<EventSeverity, number> = {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0
      }

      severityData?.forEach(event => {
        eventsBySeverity[event.severity as EventSeverity]++
      })

      // Get events by type
      const { data: typeData } = await this.supabase
        .from('session_security_events')
        .select('event_type')
        .gte('timestamp', start.toISOString())
        .lte('timestamp', end.toISOString())

      const eventsByType: Record<SecurityEventType, number> = {
        suspicious_login: 0,
        unusual_location: 0,
        rapid_requests: 0,
        session_hijack_attempt: 0,
        concurrent_limit_exceeded: 0,
        security_violation: 0,
        device_registration: 0,
        mfa_bypass_attempt: 0
      }

      typeData?.forEach(event => {
        eventsByType[event.event_type as SecurityEventType]++
      })

      // Get unresolved events count
      const { count: unresolvedEvents } = await this.supabase
        .from('session_security_events')
        .select('*', { count: 'exact', head: true })
        .eq('resolved', false)
        .gte('timestamp', start.toISOString())
        .lte('timestamp', end.toISOString())

      // Get recent events (last 24 hours)
      const recentStart = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const { count: recentEvents } = await this.supabase
        .from('session_security_events')
        .select('*', { count: 'exact', head: true })
        .gte('timestamp', recentStart.toISOString())

      // Get top IP addresses
      const { data: ipData } = await this.supabase
        .from('session_security_events')
        .select('ip_address')
        .gte('timestamp', start.toISOString())
        .lte('timestamp', end.toISOString())
        .not('ip_address', 'is', null)

      const ipCounts: Record<string, number> = {}
      ipData?.forEach(event => {
        if (event.ip_address) {
          ipCounts[event.ip_address] = (ipCounts[event.ip_address] || 0) + 1
        }
      })

      const topIpAddresses = Object.entries(ipCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([ip, count]) => ({ ip, count }))

      // Get top users
      const { data: userData } = await this.supabase
        .from('session_security_events')
        .select(`
          user_id,
          profiles:user_id(email)
        `)
        .gte('timestamp', start.toISOString())
        .lte('timestamp', end.toISOString())
        .not('user_id', 'is', null)

      const userCounts: Record<string, { count: number; email?: string }> = {}
      userData?.forEach(event => {
        if (event.user_id) {
          if (!userCounts[event.user_id]) {
            userCounts[event.user_id] = {
              count: 0,
              email: event.profiles?.email
            }
          }
          userCounts[event.user_id].count++
        }
      })

      const topUsers = Object.entries(userCounts)
        .sort(([,a], [,b]) => b.count - a.count)
        .slice(0, 10)
        .map(([userId, data]) => ({
          userId,
          email: data.email,
          count: data.count
        }))

      return {
        totalEvents: totalEvents || 0,
        eventsBySeverity,
        eventsByType,
        unresolvedEvents: unresolvedEvents || 0,
        recentEvents: recentEvents || 0,
        topIpAddresses,
        topUsers
      }
    } catch (error) {
      console.error('Get event statistics error:', error)
      return {
        totalEvents: 0,
        eventsBySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
        eventsByType: {
          suspicious_login: 0,
          unusual_location: 0,
          rapid_requests: 0,
          session_hijack_attempt: 0,
          concurrent_limit_exceeded: 0,
          security_violation: 0,
          device_registration: 0,
          mfa_bypass_attempt: 0
        },
        unresolvedEvents: 0,
        recentEvents: 0,
        topIpAddresses: [],
        topUsers: []
      }
    }
  }

  /**
   * Generate security alerts based on patterns
   */
  async generateSecurityAlerts(): Promise<SecurityAlert[]> {
    try {
      const alerts: SecurityAlert[] = []
      const now = new Date()
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

      // Alert 1: High number of failed login attempts
      const { count: failedLogins } = await this.supabase
        .from('session_security_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'suspicious_login')
        .gte('timestamp', oneHourAgo.toISOString())

      if (failedLogins && failedLogins > 10) {
        alerts.push({
          id: 'failed-logins-spike',
          title: 'High Number of Failed Login Attempts',
          description: `${failedLogins} failed login attempts detected in the last hour`,
          severity: failedLogins > 50 ? 'critical' : 'high',
          eventCount: failedLogins,
          affectedUsers: 0, // Would need additional query
          timeframe: '1 hour',
          recommendations: [
            'Review IP addresses for potential brute force attacks',
            'Consider implementing rate limiting',
            'Check for compromised accounts'
          ]
        })
      }

      // Alert 2: Multiple session hijack attempts
      const { count: hijackAttempts } = await this.supabase
        .from('session_security_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'session_hijack_attempt')
        .gte('timestamp', oneDayAgo.toISOString())

      if (hijackAttempts && hijackAttempts > 5) {
        alerts.push({
          id: 'session-hijack-attempts',
          title: 'Multiple Session Hijack Attempts',
          description: `${hijackAttempts} session hijack attempts detected in the last 24 hours`,
          severity: 'critical',
          eventCount: hijackAttempts,
          affectedUsers: 0,
          timeframe: '24 hours',
          recommendations: [
            'Investigate affected sessions immediately',
            'Force logout of suspicious sessions',
            'Review session security measures'
          ]
        })
      }

      // Alert 3: Unusual location patterns
      const { data: locationEvents } = await this.supabase
        .from('session_security_events')
        .select('user_id, details')
        .eq('event_type', 'unusual_location')
        .gte('timestamp', oneDayAgo.toISOString())

      if (locationEvents && locationEvents.length > 20) {
        alerts.push({
          id: 'unusual-locations',
          title: 'High Number of Unusual Location Logins',
          description: `${locationEvents.length} logins from unusual locations in the last 24 hours`,
          severity: 'medium',
          eventCount: locationEvents.length,
          affectedUsers: new Set(locationEvents.map(e => e.user_id)).size,
          timeframe: '24 hours',
          recommendations: [
            'Review geographic login patterns',
            'Consider implementing location-based restrictions',
            'Notify users of unusual activity'
          ]
        })
      }

      return alerts
    } catch (error) {
      console.error('Generate security alerts error:', error)
      return []
    }
  }

  // =====================================================
  // PRIVATE HELPER METHODS
  // =====================================================

  /**
   * Map database record to SecurityEvent
   */
  private mapSecurityEvent(data: any): SecurityEvent {
    return {
      id: data.id,
      sessionId: data.session_id,
      userId: data.user_id,
      eventType: data.event_type,
      severity: data.severity,
      details: data.details,
      ipAddress: data.ip_address,
      userAgent: data.user_agent,
      resolved: data.resolved,
      resolvedAt: data.resolved_at ? new Date(data.resolved_at) : undefined,
      resolvedBy: data.resolved_by,
      timestamp: new Date(data.timestamp),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    }
  }

  /**
   * Check if event triggers any automated alerts
   */
  private async checkForAlerts(event: SecurityEvent): Promise<void> {
    try {
      // Critical events trigger immediate alerts
      if (event.severity === 'critical') {
        await this.triggerCriticalAlert(event)
      }

      // Check for patterns that might indicate attacks
      if (event.eventType === 'suspicious_login') {
        await this.checkForBruteForcePattern(event)
      }

      if (event.eventType === 'session_hijack_attempt') {
        await this.triggerSessionHijackAlert(event)
      }
    } catch (error) {
      console.error('Check for alerts error:', error)
    }
  }

  /**
   * Trigger critical security alert
   */
  private async triggerCriticalAlert(event: SecurityEvent): Promise<void> {
    // In a real implementation, this would:
    // - Send notifications to security team
    // - Create incident tickets
    // - Trigger automated responses
    console.warn('CRITICAL SECURITY EVENT:', event)
  }

  /**
   * Check for brute force attack patterns
   */
  private async checkForBruteForcePattern(event: SecurityEvent): Promise<void> {
    if (!event.ipAddress) return

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    
    const { count } = await this.supabase
      .from('session_security_events')
      .select('*', { count: 'exact', head: true })
      .eq('event_type', 'suspicious_login')
      .eq('ip_address', event.ipAddress)
      .gte('timestamp', fiveMinutesAgo.toISOString())

    if (count && count > 5) {
      await this.logEvent({
        userId: null,
        eventType: 'rapid_requests',
        severity: 'high',
        details: {
          ip_address: event.ipAddress,
          attempt_count: count,
          timeframe: '5 minutes'
        },
        ipAddress: event.ipAddress
      })
    }
  }

  /**
   * Trigger session hijack alert
   */
  private async triggerSessionHijackAlert(event: SecurityEvent): Promise<void> {
    // Immediate response for session hijack attempts
    console.error('SESSION HIJACK ATTEMPT DETECTED:', event)
    
    // In production, this would trigger:
    // - Immediate session termination
    // - User notification
    // - Security team alert
  }
}

export default SecurityEventLogger
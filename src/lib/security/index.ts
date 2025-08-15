/**
 * Security API Library
 * Comprehensive security management for NeonPro
 * Story 3.3: Security Hardening & Audit
 */

import { createClient } from '@/lib/supabase/client';
import { z } from 'zod';

// Types
export interface AuditLog {
  id: string;
  user_id?: string;
  session_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  table_name?: string;
  ip_address?: string;
  user_agent?: string;
  endpoint?: string;
  http_method?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  changed_fields?: string[];
  compliance_flags: string[];
  compliance_context?: Record<string, any>;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  security_flags: string[];
  created_at: string;
  metadata?: Record<string, any>;
  checksum?: string;
  signature?: string;
}

export interface SecurityEvent {
  id: string;
  event_type: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  description?: string;
  source_ip?: string;
  user_id?: string;
  session_id?: string;
  event_data?: Record<string, any>;
  affected_resources?: Record<string, any>;
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  response_time_minutes?: number;
  assigned_to?: string;
  detected_at: string;
  updated_at: string;
  resolved_at?: string;
  metadata?: Record<string, any>;
}

export interface SecurityAlert {
  id: string;
  alert_type: string;
  title: string;
  description?: string;
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  source_type: 'automated' | 'manual' | 'external';
  source_reference?: string;
  affected_user_id?: string;
  affected_resource_type?: string;
  affected_resource_id?: string;
  alert_data?: Record<string, any>;
  indicators?: Record<string, any>;
  status: 'new' | 'acknowledged' | 'investigating' | 'resolved' | 'false_positive';
  assigned_to?: string;
  escalation_level: number;
  triggered_at: string;
  acknowledged_at?: string;
  resolved_at?: string;
  response_time_minutes?: number;
  resolution_time_minutes?: number;
  tags: string[];
  metadata?: Record<string, any>;
}

export interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  ip_address?: string;
  user_agent?: string;
  device_fingerprint?: string;
  location_country?: string;
  location_city?: string;
  is_trusted_device: boolean;
  mfa_verified: boolean;
  risk_score: number;
  created_at: string;
  last_activity: string;
  expires_at: string;
  terminated_at?: string;
  termination_reason?: string;
  is_active: boolean;
}

export interface SecurityMetrics {
  threat_level: 'low' | 'medium' | 'high' | 'critical';
  active_sessions: number;
  failed_attempts_24h: number;
  security_events_24h: number;
  compliance_score: number;
  high_risk_sessions: number;
  unresolved_alerts: number;
  avg_response_time_minutes: number;
}

export interface ComplianceAudit {
  id: string;
  audit_type: 'LGPD' | 'ANVISA' | 'CFM' | 'internal' | 'external';
  title: string;
  description?: string;
  scope_areas: string[];
  audit_criteria?: Record<string, any>;
  scheduled_date?: string;
  frequency?: 'one_time' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  compliance_score?: number;
  findings?: Record<string, any>;
  recommendations?: Record<string, any>;
  auditor_id?: string;
  created_by?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  report_path?: string;
  evidence_paths: string[];
  metadata?: Record<string, any>;
}

// Validation schemas
export const createAuditLogSchema = z.object({
  action: z.string().min(1),
  resource_type: z.string().min(1),
  resource_id: z.string().optional(),
  table_name: z.string().optional(),
  old_values: z.record(z.any()).optional(),
  new_values: z.record(z.any()).optional(),
  compliance_flags: z.array(z.string()).default([]),
  risk_level: z.enum(['low', 'medium', 'high', 'critical']).default('low'),
  metadata: z.record(z.any()).optional(),
});

export const createSecurityEventSchema = z.object({
  event_type: z.string().min(1),
  severity: z.enum(['info', 'warning', 'error', 'critical']),
  title: z.string().min(1),
  description: z.string().optional(),
  event_data: z.record(z.any()).optional(),
  affected_resources: z.record(z.any()).optional(),
});

export const createSecurityAlertSchema = z.object({
  alert_type: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  severity: z.enum(['info', 'low', 'medium', 'high', 'critical']),
  source_type: z.enum(['automated', 'manual', 'external']).default('automated'),
  source_reference: z.string().optional(),
  affected_user_id: z.string().uuid().optional(),
  alert_data: z.record(z.any()).optional(),
});

/**
 * Security API Class
 * Provides comprehensive security management functionality
 */
export class SecurityAPI {
  private supabase = createClient();

  // =============================================
  // AUDIT TRAIL METHODS
  // =============================================

  /**
   * Create audit log entry
   */
  async createAuditLog(data: z.infer<typeof createAuditLogSchema>): Promise<AuditLog> {
    const validated = createAuditLogSchema.parse(data);
    
    const { data: auditLog, error } = await this.supabase.rpc('create_enhanced_audit_log', {
      p_action: validated.action,
      p_resource_type: validated.resource_type,
      p_resource_id: validated.resource_id,
      p_table_name: validated.table_name,
      p_old_values: validated.old_values,
      p_new_values: validated.new_values,
      p_compliance_flags: validated.compliance_flags,
      p_risk_level: validated.risk_level,
      p_additional_metadata: validated.metadata,
    });

    if (error) {
      throw new Error(`Failed to create audit log: ${error.message}`);
    }

    return this.getAuditLog(auditLog);
  }

  /**
   * Get audit log by ID
   */
  async getAuditLog(id: string): Promise<AuditLog> {
    const { data, error } = await this.supabase
      .from('audit_logs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to get audit log: ${error.message}`);
    }

    return data;
  }

  /**
   * Get audit logs with filtering and pagination
   */
  async getAuditLogs(params: {
    user_id?: string;
    action?: string;
    resource_type?: string;
    risk_level?: string;
    compliance_flags?: string[];
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ data: AuditLog[]; count: number }> {
    let query = this.supabase
      .from('audit_logs')
      .select('*', { count: 'exact' });

    if (params.user_id) {
      query = query.eq('user_id', params.user_id);
    }

    if (params.action) {
      query = query.eq('action', params.action);
    }

    if (params.resource_type) {
      query = query.eq('resource_type', params.resource_type);
    }

    if (params.risk_level) {
      query = query.eq('risk_level', params.risk_level);
    }

    if (params.compliance_flags?.length) {
      query = query.overlaps('compliance_flags', params.compliance_flags);
    }

    if (params.start_date) {
      query = query.gte('created_at', params.start_date);
    }

    if (params.end_date) {
      query = query.lte('created_at', params.end_date);
    }

    query = query
      .order('created_at', { ascending: false })
      .limit(params.limit || 50)
      .offset(params.offset || 0);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to get audit logs: ${error.message}`);
    }

    return { data: data || [], count: count || 0 };
  }

  // =============================================
  // SECURITY EVENT METHODS
  // =============================================

  /**
   * Create security event
   */
  async createSecurityEvent(data: z.infer<typeof createSecurityEventSchema>): Promise<SecurityEvent> {
    const validated = createSecurityEventSchema.parse(data);
    
    const { data: eventId, error } = await this.supabase.rpc('create_security_event', {
      p_event_type: validated.event_type,
      p_severity: validated.severity,
      p_title: validated.title,
      p_description: validated.description,
      p_event_data: validated.event_data,
      p_affected_resources: validated.affected_resources,
    });

    if (error) {
      throw new Error(`Failed to create security event: ${error.message}`);
    }

    return this.getSecurityEvent(eventId);
  }

  /**
   * Get security event by ID
   */
  async getSecurityEvent(id: string): Promise<SecurityEvent> {
    const { data, error } = await this.supabase
      .from('security_events')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to get security event: ${error.message}`);
    }

    return data;
  }

  /**
   * Get security events with filtering
   */
  async getSecurityEvents(params: {
    event_type?: string;
    severity?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ data: SecurityEvent[]; count: number }> {
    let query = this.supabase
      .from('security_events')
      .select('*', { count: 'exact' });

    if (params.event_type) {
      query = query.eq('event_type', params.event_type);
    }

    if (params.severity) {
      query = query.eq('severity', params.severity);
    }

    if (params.status) {
      query = query.eq('status', params.status);
    }

    if (params.start_date) {
      query = query.gte('detected_at', params.start_date);
    }

    if (params.end_date) {
      query = query.lte('detected_at', params.end_date);
    }

    query = query
      .order('detected_at', { ascending: false })
      .limit(params.limit || 50)
      .offset(params.offset || 0);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to get security events: ${error.message}`);
    }

    return { data: data || [], count: count || 0 };
  }

  /**
   * Update security event status
   */
  async updateSecurityEventStatus(
    eventId: string,
    status: 'open' | 'investigating' | 'resolved' | 'false_positive',
    assignedTo?: string,
    notes?: string
  ): Promise<boolean> {
    const { data, error } = await this.supabase.rpc('update_security_event_status', {
      p_event_id: eventId,
      p_status: status,
      p_assigned_to: assignedTo,
      p_notes: notes,
    });

    if (error) {
      throw new Error(`Failed to update security event status: ${error.message}`);
    }

    return data;
  }

  // =============================================
  // SECURITY ALERT METHODS
  // =============================================

  /**
   * Create security alert
   */
  async createSecurityAlert(data: z.infer<typeof createSecurityAlertSchema>): Promise<SecurityAlert> {
    const validated = createSecurityAlertSchema.parse(data);
    
    const { data: alertId, error } = await this.supabase.rpc('create_security_alert', {
      p_alert_type: validated.alert_type,
      p_title: validated.title,
      p_description: validated.description,
      p_severity: validated.severity,
      p_source_type: validated.source_type,
      p_source_reference: validated.source_reference,
      p_affected_user_id: validated.affected_user_id,
      p_alert_data: validated.alert_data,
    });

    if (error) {
      throw new Error(`Failed to create security alert: ${error.message}`);
    }

    return this.getSecurityAlert(alertId);
  }

  /**
   * Get security alert by ID
   */
  async getSecurityAlert(id: string): Promise<SecurityAlert> {
    const { data, error } = await this.supabase
      .from('security_alerts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to get security alert: ${error.message}`);
    }

    return data;
  }

  /**
   * Get security alerts with filtering
   */
  async getSecurityAlerts(params: {
    alert_type?: string;
    severity?: string;
    status?: string;
    assigned_to?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ data: SecurityAlert[]; count: number }> {
    let query = this.supabase
      .from('security_alerts')
      .select('*', { count: 'exact' });

    if (params.alert_type) {
      query = query.eq('alert_type', params.alert_type);
    }

    if (params.severity) {
      query = query.eq('severity', params.severity);
    }

    if (params.status) {
      query = query.eq('status', params.status);
    }

    if (params.assigned_to) {
      query = query.eq('assigned_to', params.assigned_to);
    }

    if (params.start_date) {
      query = query.gte('triggered_at', params.start_date);
    }

    if (params.end_date) {
      query = query.lte('triggered_at', params.end_date);
    }

    query = query
      .order('triggered_at', { ascending: false })
      .limit(params.limit || 50)
      .offset(params.offset || 0);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to get security alerts: ${error.message}`);
    }

    return { data: data || [], count: count || 0 };
  }

  /**
   * Acknowledge security alert
   */
  async acknowledgeSecurityAlert(alertId: string, assignedTo?: string): Promise<boolean> {
    const { data, error } = await this.supabase.rpc('acknowledge_security_alert', {
      p_alert_id: alertId,
      p_assigned_to: assignedTo,
    });

    if (error) {
      throw new Error(`Failed to acknowledge security alert: ${error.message}`);
    }

    return data;
  }

  // =============================================
  // SESSION MANAGEMENT METHODS
  // =============================================

  /**
   * Get user sessions
   */
  async getUserSessions(userId?: string): Promise<UserSession[]> {
    let query = this.supabase
      .from('user_sessions')
      .select('*')
      .eq('is_active', true);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get user sessions: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Terminate session
   */
  async terminateSession(sessionToken: string, reason = 'manual_logout'): Promise<boolean> {
    const { data, error } = await this.supabase.rpc('terminate_user_session', {
      p_session_token: sessionToken,
      p_reason: reason,
    });

    if (error) {
      throw new Error(`Failed to terminate session: ${error.message}`);
    }

    return data;
  }

  /**
   * Update session activity
   */
  async updateSessionActivity(sessionToken: string): Promise<boolean> {
    const { data, error } = await this.supabase.rpc('update_session_activity', {
      p_session_token: sessionToken,
    });

    if (error) {
      throw new Error(`Failed to update session activity: ${error.message}`);
    }

    return data;
  }

  // =============================================
  // SECURITY METRICS METHODS
  // =============================================

  /**
   * Get security metrics
   */
  async getSecurityMetrics(): Promise<SecurityMetrics> {
    const [
      activeSessions,
      failedAttempts,
      securityEvents,
      highRiskSessions,
      unresolvedAlerts,
    ] = await Promise.all([
      this.supabase
        .from('user_sessions')
        .select('id', { count: 'exact' })
        .eq('is_active', true),
      
      this.supabase
        .from('auth_attempts')
        .select('id', { count: 'exact' })
        .eq('success', false)
        .gte('attempted_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
      
      this.supabase
        .from('security_events')
        .select('id', { count: 'exact' })
        .gte('detected_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
      
      this.supabase
        .from('user_sessions')
        .select('id', { count: 'exact' })
        .eq('is_active', true)
        .gte('risk_score', 70),
      
      this.supabase
        .from('security_alerts')
        .select('id', { count: 'exact' })
        .in('status', ['new', 'acknowledged', 'investigating']),
    ]);

    // Get average response time
    const { data: avgResponseTime } = await this.supabase
      .from('security_alerts')
      .select('response_time_minutes')
      .not('response_time_minutes', 'is', null);

    const avgResponse = avgResponseTime?.length
      ? avgResponseTime.reduce((sum, alert) => sum + (alert.response_time_minutes || 0), 0) / avgResponseTime.length
      : 0;

    // Calculate threat level based on metrics
    const threatLevel = this.calculateThreatLevel({
      failedAttempts: failedAttempts.count || 0,
      securityEvents: securityEvents.count || 0,
      highRiskSessions: highRiskSessions.count || 0,
      unresolvedAlerts: unresolvedAlerts.count || 0,
    });

    return {
      threat_level: threatLevel,
      active_sessions: activeSessions.count || 0,
      failed_attempts_24h: failedAttempts.count || 0,
      security_events_24h: securityEvents.count || 0,
      compliance_score: 95, // Would be calculated based on compliance checks
      high_risk_sessions: highRiskSessions.count || 0,
      unresolved_alerts: unresolvedAlerts.count || 0,
      avg_response_time_minutes: Math.round(avgResponse),
    };
  }

  /**
   * Calculate threat level based on security metrics
   */
  private calculateThreatLevel(metrics: {
    failedAttempts: number;
    securityEvents: number;
    highRiskSessions: number;
    unresolvedAlerts: number;
  }): 'low' | 'medium' | 'high' | 'critical' {
    const score = (
      Math.min(metrics.failedAttempts / 50, 1) * 25 +
      Math.min(metrics.securityEvents / 20, 1) * 25 +
      Math.min(metrics.highRiskSessions / 10, 1) * 25 +
      Math.min(metrics.unresolvedAlerts / 5, 1) * 25
    );

    if (score >= 75) return 'critical';
    if (score >= 50) return 'high';
    if (score >= 25) return 'medium';
    return 'low';
  }

  // =============================================
  // COMPLIANCE AUDIT METHODS
  // =============================================

  /**
   * Create compliance audit
   */
  async createComplianceAudit(data: {
    audit_type: 'LGPD' | 'ANVISA' | 'CFM' | 'internal' | 'external';
    title: string;
    scope_areas: string[];
    scheduled_date?: string;
    description?: string;
  }): Promise<ComplianceAudit> {
    const { data: auditId, error } = await this.supabase.rpc('create_compliance_audit', {
      p_audit_type: data.audit_type,
      p_title: data.title,
      p_scope_areas: data.scope_areas,
      p_scheduled_date: data.scheduled_date,
      p_description: data.description,
    });

    if (error) {
      throw new Error(`Failed to create compliance audit: ${error.message}`);
    }

    return this.getComplianceAudit(auditId);
  }

  /**
   * Get compliance audit by ID
   */
  async getComplianceAudit(id: string): Promise<ComplianceAudit> {
    const { data, error } = await this.supabase
      .from('compliance_audits')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to get compliance audit: ${error.message}`);
    }

    return data;
  }

  /**
   * Get compliance audits
   */
  async getComplianceAudits(params: {
    audit_type?: string;
    status?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ data: ComplianceAudit[]; count: number }> {
    let query = this.supabase
      .from('compliance_audits')
      .select('*', { count: 'exact' });

    if (params.audit_type) {
      query = query.eq('audit_type', params.audit_type);
    }

    if (params.status) {
      query = query.eq('status', params.status);
    }

    query = query
      .order('created_at', { ascending: false })
      .limit(params.limit || 50)
      .offset(params.offset || 0);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to get compliance audits: ${error.message}`);
    }

    return { data: data || [], count: count || 0 };
  }

  /**
   * Complete compliance audit
   */
  async completeComplianceAudit(
    auditId: string,
    complianceScore: number,
    findings?: Record<string, any>,
    recommendations?: Record<string, any>
  ): Promise<boolean> {
    const { data, error } = await this.supabase.rpc('complete_compliance_audit', {
      p_audit_id: auditId,
      p_compliance_score: complianceScore,
      p_findings: findings,
      p_recommendations: recommendations,
    });

    if (error) {
      throw new Error(`Failed to complete compliance audit: ${error.message}`);
    }

    return data;
  }

  // =============================================
  // UTILITY METHODS
  // =============================================

  /**
   * Check rate limit
   */
  async checkRateLimit(
    identifierType: string,
    identifierValue: string,
    endpointPattern: string,
    limit: number,
    windowMinutes: number
  ): Promise<boolean> {
    const { data, error } = await this.supabase.rpc('check_rate_limit', {
      p_identifier_type: identifierType,
      p_identifier_value: identifierValue,
      p_endpoint_pattern: endpointPattern,
      p_limit: limit,
      p_window_minutes: windowMinutes,
    });

    if (error) {
      throw new Error(`Failed to check rate limit: ${error.message}`);
    }

    return data;
  }

  /**
   * Log authentication attempt
   */
  async logAuthAttempt(data: {
    email: string;
    attempt_type: string;
    success: boolean;
    failure_reason?: string;
    ip_address?: string;
    user_agent?: string;
  }): Promise<string> {
    const { data: attemptId, error } = await this.supabase.rpc('log_auth_attempt', {
      p_email: data.email,
      p_attempt_type: data.attempt_type,
      p_success: data.success,
      p_failure_reason: data.failure_reason,
      p_ip_address: data.ip_address,
      p_user_agent: data.user_agent,
    });

    if (error) {
      throw new Error(`Failed to log auth attempt: ${error.message}`);
    }

    return attemptId;
  }
}

// Export singleton instance
export const securityAPI = new SecurityAPI();
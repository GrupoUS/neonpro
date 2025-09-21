/**
 * Healthcare Logger for LGPD Compliance
 * Provides comprehensive audit logging with PII sanitization
 * T052: Configure AG-UI Protocol communication layer
 * T057: Add audit logging for all data access attempts
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface AuditLogEntry {
  action: string;
  resource_type: string;
  resource_id?: string;
  user_id?: string;
  session_id?: string;
  clinic_id?: string;
  patient_id?: string;
  result: 'granted' | 'denied' | 'error';
  reason?: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: any;
  timestamp: string;
}

interface DataAccessLog {
  action: string;
  resource_type: string;
  resource_id?: string;
  patient_id?: string;
  result: 'granted' | 'denied';
  reason?: string;
  session_id?: string;
  details?: any;
}

export class HealthcareLogger {
  private supabase: SupabaseClient | null = null;
  private stats = {
    total_logs: 0,
    error_logs: 0,
    warn_logs: 0,
    info_logs: 0,
    debug_logs: 0,
    audit_logs: 0,
    data_access_logs: 0,
  };
  private auditBuffer: AuditLogEntry[] = [];
  private bufferFlushInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeSupabase();
    this.startBufferFlush();
  }

  /**
   * Initialize Supabase connection for audit logging
   */
  private async initializeSupabase(): Promise<void> {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
        global: {
          headers: {
            'X-Healthcare-App': 'NeonPro-Logger',
            'X-LGPD-Compliance': 'true',
          },
        },
      });
    }
  }

  /**
   * Start periodic buffer flush to database
   */
  private startBufferFlush(): void {
    this.bufferFlushInterval = setInterval(() => {
      this.flushAuditBuffer();
    }, 5000); // Flush every 5 seconds
  }

  /**
   * Flush audit buffer to database
   */
  private async flushAuditBuffer(): Promise<void> {
    if (this.auditBuffer.length === 0 || !this.supabase) {
      return;
    }

    const logsToFlush = [...this.auditBuffer];
    this.auditBuffer = [];

    try {
      const { error } = await this.supabase
        .from('audit_logs')
        .insert(logsToFlush.map(log => ({
          action: log.action,
          resource_type: log.resource_type,
          resource_id: log.resource_id,
          user_id: log.user_id,
          timestamp: log.timestamp,
          details: {
            session_id: log.session_id,
            clinic_id: log.clinic_id,
            patient_id: log.patient_id,
            result: log.result,
            reason: log.reason,
            ip_address: log.ip_address,
            user_agent: log.user_agent,
            metadata: log.metadata,
          },
        })));

      if (error) {
        console.error('Failed to flush audit logs to database:', error);
        // Re-add logs to buffer for retry
        this.auditBuffer.unshift(...logsToFlush);
      }
    } catch (_error) {
      console.error('Error flushing audit buffer:', error);
      // Re-add logs to buffer for retry
      this.auditBuffer.unshift(...logsToFlush);
    }
  }

  /**
   * Log information message
   */
  public info(message: string, metadata: any = {}): void {
    this.stats.total_logs++;
    this.stats.info_logs++;

    const sanitizedMetadata = this.sanitizeData(metadata);

    console.log(`[INFO] ${message}`, {
      ...sanitizedMetadata,
      timestamp: new Date().toISOString(),
      component: 'healthcare-logger',
      level: 'info',
    });
  }

  /**
   * Log warning message
   */
  public warn(message: string, metadata: any = {}): void {
    this.stats.total_logs++;
    this.stats.warn_logs++;

    const sanitizedMetadata = this.sanitizeData(metadata);

    console.warn(`[WARN] ${message}`, {
      ...sanitizedMetadata,
      timestamp: new Date().toISOString(),
      component: 'healthcare-logger',
      level: 'warn',
    });
  }

  /**
   * Log error message
   */
  public error(message: string, error: Error, metadata: any = {}): void {
    this.stats.total_logs++;
    this.stats.error_logs++;

    const sanitizedMetadata = this.sanitizeData(metadata);

    console.error(`[ERROR] ${message}`, {
      ...sanitizedMetadata,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      timestamp: new Date().toISOString(),
      component: 'healthcare-logger',
      level: 'error',
    });

    // Also log critical errors to audit trail
    this.logAuditEvent({
      action: 'system_error',
      resource_type: 'system',
      result: 'error',
      reason: error.message,
      metadata: sanitizedMetadata,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log debug message (development only)
   */
  public debug(message: string, metadata: any = {}): void {
    if (process.env.NODE_ENV !== 'production') {
      this.stats.total_logs++;
      this.stats.debug_logs++;

      const sanitizedMetadata = this.sanitizeData(metadata);

      console.debug(`[DEBUG] ${message}`, {
        ...sanitizedMetadata,
        timestamp: new Date().toISOString(),
        component: 'healthcare-logger',
        level: 'debug',
      });
    }
  }

  /**
   * Log audit event for healthcare compliance
   */
  public logAuditEvent(event: AuditLogEntry): void {
    this.stats.total_logs++;
    this.stats.audit_logs++;

    const sanitizedEvent = this.sanitizeData(event);

    console.log(`[AUDIT] ${event.action}`, {
      ...sanitizedEvent,
      component: 'healthcare-logger',
      level: 'audit',
    });

    // Buffer for database insertion
    this.auditBuffer.push({
      ...event,
      metadata: this.sanitizeData(event.metadata),
    });
  }

  /**
   * Log data access for LGPD compliance
   */
  public async logDataAccess(
    _userId: string,
    clinicId: string,
    access: DataAccessLog,
  ): Promise<void> {
    this.stats.data_access_logs++;

    const sanitizedAccess = this.sanitizeData(access);

    this.logAuditEvent({
      action: access.action,
      resource_type: access.resource_type,
      resource_id: access.resource_id,
      user_id: userId,
      clinic_id: clinicId,
      patient_id: access.patient_id,
      session_id: access.session_id,
      result: access.result,
      reason: access.reason,
      metadata: {
        ...sanitizedAccess.details,
        lgpd_compliance: true,
        data_classification: this.classifyDataSensitivity(access.resource_type),
      },
      timestamp: new Date().toISOString(),
    });

    this.info('Data access logged', {
      user_id: userId,
      clinic_id: clinicId,
      access: sanitizedAccess,
      type: 'data_access_audit',
    });
  }

  /**
   * Log AI interaction for audit trail
   */
  public async logAIInteraction(params: {
    sessionId: string;
    _userId: string;
    clinicId: string;
    _query: string;
    response: string;
    patientId?: string;
    dataAccessed?: string[];
    processingTime: number;
  }): Promise<void> {
    const sanitizedQuery = this.sanitizeQuery(params._query);
    const sanitizedResponse = this.sanitizeQuery(params.response);

    this.logAuditEvent({
      action: 'ai_interaction',
      resource_type: 'ai_session',
      resource_id: params.sessionId,
      user_id: params.userId,
      clinic_id: params.clinicId,
      patient_id: params.patientId,
      session_id: params.sessionId,
      result: 'granted',
      metadata: {
        _query: sanitizedQuery,
        response: sanitizedResponse,
        data_accessed: params.dataAccessed,
        processing_time: params.processingTime,
        ai_compliance: true,
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log session events (start, end, timeout)
   */
  public logSessionEvent(
    sessionId: string,
    _userId: string,
    clinicId: string,
    event: 'start' | 'end' | 'timeout' | 'error',
    details?: any,
  ): void {
    this.logAuditEvent({
      action: `session_${event}`,
      resource_type: 'session',
      resource_id: sessionId,
      user_id: userId,
      clinic_id: clinicId,
      session_id: sessionId,
      result: event === 'error' ? 'error' : 'granted',
      metadata: this.sanitizeData(details || {}),
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log authentication events
   */
  public logAuthEvent(
    _userId: string,
    event: 'login' | 'logout' | 'failed_login' | 'token_refresh',
    details?: any,
  ): void {
    this.logAuditEvent({
      action: `auth_${event}`,
      resource_type: 'authentication',
      user_id: userId,
      result: event === 'failed_login' ? 'denied' : 'granted',
      ip_address: details?.ip_address,
      user_agent: details?.user_agent,
      metadata: this.sanitizeData(details || {}),
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Classify data sensitivity for LGPD compliance
   */
  private classifyDataSensitivity(resourceType: string): 'public' | 'sensitive' | 'confidential' {
    const classifications: Record<string, 'public' | 'sensitive' | 'confidential'> = {
      patient: 'confidential',
      medical_record: 'confidential',
      appointment: 'sensitive',
      clinic: 'public',
      professional: 'sensitive',
      ai_log: 'sensitive',
    };

    return classifications[resourceType] || 'sensitive';
  }

  /**
   * Sanitize query/response text to remove PII
   */
  private sanitizeQuery(text?: string): string | undefined {
    if (!text) return undefined;

    let sanitized = text;

    // Remove CPF patterns
    sanitized = sanitized.replace(/\d{3}\.\d{3}\.\d{3}-\d{2}/g, '[CPF_REMOVED]');

    // Remove phone patterns
    sanitized = sanitized.replace(/\(\d{2}\)\s*\d{4,5}-\d{4}/g, '[PHONE_REMOVED]');

    // Remove email patterns
    sanitized = sanitized.replace(
      /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}/g,
      '[EMAIL_REMOVED]',
    );

    // Remove potential names (sequences of 2+ capitalized words)
    sanitized = sanitized.replace(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/g, '[NAME_REMOVED]');

    return sanitized;
  }

  /**
   * Sanitize data to remove PII
   */
  private sanitizeData(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item));
    }

    const sanitized = { ...data };

    // Remove/mask common PII fields
    const piiFields = ['cpf', 'email', 'phone', 'address', 'full_name', 'password', 'token'];

    for (const field of piiFields) {
      if (sanitized[field]) {
        if (field === 'email') {
          sanitized[field] = this.maskEmail(sanitized[field]);
        } else if (field === 'phone') {
          sanitized[field] = this.maskPhone(sanitized[field]);
        } else if (field === 'cpf') {
          sanitized[field] = this.maskCPF(sanitized[field]);
        } else {
          sanitized[field] = '[REDACTED]';
        }
      }
    }

    // Recursively sanitize nested objects
    for (const key in sanitized) {
      if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeData(sanitized[key]);
      }
    }

    return sanitized;
  }

  /**
   * Mask email while preserving domain for analysis
   */
  private maskEmail(email: string): string {
    const [username, domain] = email.split('@');
    if (!domain) return '[INVALID_EMAIL]';

    const maskedUsername = username.length > 2
      ? username[0] + '*'.repeat(username.length - 2) + username[username.length - 1]
      : '***';

    return `${maskedUsername}@${domain}`;
  }

  /**
   * Mask phone number
   */
  private maskPhone(phone: string): string {
    return phone.replace(/\d/g, (match, index) => {
      // Keep first 2 and last 2 digits visible
      if (index < 2 || index >= phone.length - 2) {
        return match;
      }
      return '*';
    });
  }

  /**
   * Mask CPF
   */
  private maskCPF(cpf: string): string {
    return cpf.replace(/\d/g, (match, index) => {
      // Keep first and last digits visible
      if (index === 0 || index === cpf.length - 1) {
        return match;
      }
      return '*';
    });
  }

  /**
   * Get comprehensive logger statistics
   */
  public getStats(): any {
    return {
      ...this.stats,
      audit_buffer_size: this.auditBuffer.length,
      uptime: process.uptime(),
      memory_usage: process.memoryUsage(),
      database_connected: !!this.supabase,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Clean shutdown - flush remaining logs
   */
  public async shutdown(): Promise<void> {
    if (this.bufferFlushInterval) {
      clearInterval(this.bufferFlushInterval);
    }

    // Final flush
    await this.flushAuditBuffer();

    this.info('Healthcare logger shutdown completed', {
      final_stats: this.getStats(),
    });
  }
}

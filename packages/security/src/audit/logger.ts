/**
 * Audit logging utilities for NeonPro security compliance
 * Handles structured logging for healthcare data access and operations
 */

import type { Database } from '@neonpro/database';
import { createClient } from '@supabase/supabase-js';

export interface AuditLogEntry {
  id?: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp?: Date;
  success: boolean;
  errorMessage?: string;
  lgpdCompliant?: boolean;
  dataClassification?: 'public' | 'internal' | 'sensitive' | 'restricted';
}

export interface AuditLoggerOptions {
  enableConsoleLogging?: boolean;
  enableDatabaseLogging?: boolean;
  enableFileLogging?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  supabaseUrl?: string;
  supabaseKey?: string;
}

export class AuditLogger {
  private options: AuditLoggerOptions;
  private supabase?: ReturnType<typeof createClient<Database>>;

  constructor(options: AuditLoggerOptions = {}) {
    this.options = {
      enableConsoleLogging: true,
      enableDatabaseLogging: false,
      enableFileLogging: false,
      logLevel: 'info',
      ...options,
    };

    // Initialize Supabase client if database logging is enabled
    if (
      this.options.enableDatabaseLogging
      && this.options.supabaseUrl
      && this.options.supabaseKey
    ) {
      this.supabase = createClient<Database>(
        this.options.supabaseUrl,
        this.options.supabaseKey,
      );
    }
  }

  /**
   * Log an audit entry
   */
  async log(entry: AuditLogEntry): Promise<void> {
    const fullEntry: AuditLogEntry = {
      ...entry,
      timestamp: entry.timestamp || new Date(),
      id: entry.id || this.generateId(),
    };

    // Console logging
    if (this.options.enableConsoleLogging) {
      this.logToConsole(fullEntry);
    }

    // Database logging
    if (this.options.enableDatabaseLogging && this.supabase) {
      try {
        await this.logToDatabase(fullEntry);
      } catch (error) {
        console.error('Failed to log audit entry to database:', error);
      }
    }

    // File logging (placeholder - would need file system implementation)
    if (this.options.enableFileLogging) {
      this.logToFile(fullEntry);
    }
  }

  /**
   * Log a successful operation
   */
  async success(
    userId: string,
    action: string,
    resource: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    await this.log({
      userId,
      action,
      resource,
      metadata,
      success: true,
    });
  }

  /**
   * Log a failed operation
   */
  async error(
    userId: string,
    action: string,
    resource: string,
    errorMessage: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    await this.log({
      userId,
      action,
      resource,
      errorMessage,
      metadata,
      success: false,
    });
  }

  /**
   * Log healthcare data access (LGPD compliant)
   */
  async logHealthcareAccess(
    userId: string,
    action: string,
    patientId: string,
    dataType: string,
    lgpdConsent: boolean = false,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    await this.log({
      userId,
      action: `healthcare_data_${action}`,
      resource: 'patient_data',
      resourceId: patientId,
      metadata: {
        ...metadata,
        dataType,
        lgpdConsent,
      },
      success: true,
      lgpdCompliant: lgpdConsent,
      dataClassification: 'sensitive',
    });
  }

  /**
   * Log AI/ML operations
   */
  async logAIOperation(
    userId: string,
    action: string,
    model: string,
    inputTokens?: number,
    outputTokens?: number,
    metadata?: Record<string, any>,
  ): Promise<void> {
    await this.log({
      userId,
      action: `ai_${action}`,
      resource: 'ai_model',
      resourceId: model,
      metadata: {
        ...metadata,
        inputTokens,
        outputTokens,
        model,
      },
      success: true,
      dataClassification: 'internal',
    });
  }

  private logToConsole(entry: AuditLogEntry): void {
    const logLevel = entry.success ? 'info' : 'error';
    const message = `[AUDIT] ${entry.action} on ${entry.resource} by ${entry.userId}`;

    if (logLevel === 'error') {
      console.error(message, {
        ...entry,
        error: entry.errorMessage,
      });
    } else {
      console.log(message, entry);
    }
  }

  private async logToDatabase(entry: AuditLogEntry): Promise<void> {
    if (!this.supabase) return;

    const { error } = await this.supabase.from('audit_logs').insert({
      user_id: entry.userId,
      action: entry.action,
      resource_type: entry.resource,
      resource_id: entry.resourceId,
      new_values: entry.metadata ? JSON.parse(JSON.stringify(entry.metadata)) : null, // Store metadata in new_values
      ip_address: entry.ipAddress || null,
      user_agent: entry.userAgent,
      lgpd_basis: entry.lgpdCompliant ? 'legitimate_interest' : null,
      created_at: entry.timestamp?.toISOString(),
    });

    if (error) {
      throw error;
    }
  }

  private logToFile(entry: AuditLogEntry): void {
    // Placeholder for file logging implementation
    // In a real implementation, this would write to a log file
    console.log('[FILE AUDIT]', JSON.stringify(entry));
  }

  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }
}

// Default audit logger instance
export const auditLogger = new AuditLogger({
  enableConsoleLogging: true,
  enableDatabaseLogging: false, // Enable when Supabase is configured
  logLevel: 'info',
});

// Export default for named import compatibility
export default auditLogger;

import { supabase } from '@/lib/supabase';

export interface SecurityEvent {
  id: string;
  userId: string;
  eventType: 'access' | 'modification' | 'export' | 'login' | 'logout' | 'failure';
  resourceType: 'financial_data' | 'patient_data' | 'reports' | 'system';
  resourceId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface AccessControl {
  userId: string;
  resource: string;
  permissions: string[];
  roles: string[];
  restrictions?: {
    timeRestrictions?: {
      startTime: string;
      endTime: string;
      daysOfWeek: number[];
    };
    ipRestrictions?: string[];
    locationRestrictions?: string[];
  };
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldData?: any;
  newData?: any;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  failureReason?: string;
}

export interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  type: 'lgpd' | 'anvisa' | 'cfm' | 'internal';
  severity: 'info' | 'warning' | 'error' | 'critical';
  isActive: boolean;
  conditions: Array<{
    field: string;
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'regex';
    value: any;
  }>;
  actions: Array<{
    type: 'log' | 'alert' | 'block' | 'encrypt';
    parameters?: Record<string, any>;
  }>;
}

export interface SecurityAlert {
  id: string;
  type: 'suspicious_access' | 'data_breach' | 'compliance_violation' | 'failed_login';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affectedUsers: string[];
  affectedResources: string[];
  timestamp: Date;
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  investigator?: string;
  resolution?: string;
}

export class FinancialSecurityService {
  /**
   * Check if user has permission to access resource
   */
  static async checkAccess(
    userId: string,
    resource: string,
    action: string,
    context?: {
      ipAddress?: string;
      userAgent?: string;
      resourceId?: string;
    },
  ): Promise<{
    allowed: boolean;
    reason?: string;
    restrictions?: any;
  }> {
    try {
      // Get user's access controls
      const { data: accessData, error: accessError } = await supabase
        .from('user_access_controls')
        .select('*')
        .eq('user_id', userId)
        .eq('resource', resource);

      if (accessError) throw accessError;

      if (!accessData || accessData.length === 0) {
        await this.logSecurityEvent({
          userId,
          eventType: 'failure',
          resourceType: 'financial_data',
          resourceId: context?.resourceId,
          severity: 'medium',
          description: `Access denied: No permissions found for resource ${resource}`,
          ipAddress: context?.ipAddress || 'unknown',
          userAgent: context?.userAgent || 'unknown',
          timestamp: new Date(),
        });

        return {
          allowed: false,
          reason: 'No permissions found for this resource',
        };
      }

      const accessControl = accessData[0];

      // Check if user has required permission
      if (!accessControl.permissions.includes(action)) {
        await this.logSecurityEvent({
          userId,
          eventType: 'failure',
          resourceType: 'financial_data',
          resourceId: context?.resourceId,
          severity: 'medium',
          description: `Access denied: Missing permission ${action} for resource ${resource}`,
          ipAddress: context?.ipAddress || 'unknown',
          userAgent: context?.userAgent || 'unknown',
          timestamp: new Date(),
        });

        return {
          allowed: false,
          reason: `Missing permission: ${action}`,
        };
      }

      // Check time restrictions
      if (accessControl.restrictions?.timeRestrictions) {
        const now = new Date();
        const currentTime = now.getHours() * 100 + now.getMinutes();
        const currentDay = now.getDay();

        const { startTime, endTime, daysOfWeek } = accessControl.restrictions.timeRestrictions;
        const start = parseInt(startTime.replace(':', ''));
        const end = parseInt(endTime.replace(':', ''));

        if (!daysOfWeek.includes(currentDay) || currentTime < start || currentTime > end) {
          return {
            allowed: false,
            reason: 'Access not allowed at this time',
          };
        }
      }

      // Check IP restrictions
      if (accessControl.restrictions?.ipRestrictions && context?.ipAddress) {
        if (!accessControl.restrictions.ipRestrictions.includes(context.ipAddress)) {
          await this.logSecurityEvent({
            userId,
            eventType: 'failure',
            resourceType: 'financial_data',
            resourceId: context?.resourceId,
            severity: 'high',
            description: `Access denied: IP ${context.ipAddress} not in allowed list`,
            ipAddress: context.ipAddress,
            userAgent: context?.userAgent || 'unknown',
            timestamp: new Date(),
          });

          return {
            allowed: false,
            reason: 'IP address not authorized',
          };
        }
      }

      // Log successful access
      await this.logSecurityEvent({
        userId,
        eventType: 'access',
        resourceType: 'financial_data',
        resourceId: context?.resourceId,
        severity: 'low',
        description: `Access granted to ${resource} for action ${action}`,
        ipAddress: context?.ipAddress || 'unknown',
        userAgent: context?.userAgent || 'unknown',
        timestamp: new Date(),
      });

      return {
        allowed: true,
        restrictions: accessControl.restrictions,
      };
    } catch (_error) {
      console.error('Error checking access:', error);
      return {
        allowed: false,
        reason: 'Security check failed',
      };
    }
  }

  /**
   * Log security event
   */
  static async logSecurityEvent(event: Omit<SecurityEvent, 'id'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('security_events')
        .insert({
          user_id: event.userId,
          event_type: event.eventType,
          resource_type: event.resourceType,
          resource_id: event.resourceId,
          severity: event.severity,
          description: event.description,
          ip_address: event.ipAddress,
          user_agent: event.userAgent,
          timestamp: event.timestamp.toISOString(),
          metadata: event.metadata,
        });

      if (error) throw error;

      // Check if this event should trigger an alert
      await this.checkForSecurityAlert(event);
    } catch (_error) {
      console.error('Error logging security event:', error);
    }
  }

  /**
   * Log audit trail for data modifications
   */
  static async logAuditTrail(audit: Omit<AuditLog, 'id'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('audit_logs')
        .insert({
          user_id: audit.userId,
          action: audit.action,
          resource: audit.resource,
          resource_id: audit.resourceId,
          old_data: audit.oldData,
          new_data: audit.newData,
          timestamp: audit.timestamp.toISOString(),
          ip_address: audit.ipAddress,
          user_agent: audit.userAgent,
          success: audit.success,
          failure_reason: audit.failureReason,
        });

      if (error) throw error;
    } catch (_error) {
      console.error('Error logging audit trail:', error);
    }
  }

  /**
   * Encrypt sensitive financial data
   */
  static async encryptData(data: any, dataType: string): Promise<string> {
    try {
      const crypto = await import('crypto');

      // Generate a random IV for each encryption
      const iv = crypto.randomBytes(16);
      const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-secret-key', 'salt', 32);

      // Create cipher
      const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

      // Encrypt the data
      const jsonString = JSON.stringify(data);
      let encrypted = cipher.update(jsonString, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      // Get authentication tag
      const authTag = cipher.getAuthTag();

      // Combine IV + encrypted data + auth tag
      const result = iv.toString('hex') + ':' + encrypted + ':' + authTag.toString('hex');

      // Log encryption event
      await this.logSecurityEvent({
        userId: 'system',
        eventType: 'modification',
        resourceType: 'financial_data',
        severity: 'low',
        description: `Data encrypted: ${dataType}`,
        ipAddress: 'system',
        userAgent: 'encryption-service',
        timestamp: new Date(),
        metadata: { dataType, size: jsonString.length },
      });

      return result;
    } catch (_error) {
      console.error('Error encrypting data:', error);
      throw new Error('Data encryption failed');
    }
  }

  /**
   * Decrypt sensitive financial data
   */
  static async decryptData(encryptedData: string, userId: string): Promise<any> {
    try {
      const crypto = await import('crypto');

      // Parse the encrypted data
      const parts = encryptedData.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
      }

      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];
      const authTag = Buffer.from(parts[2], 'hex');

      // Create decipher
      const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-secret-key', 'salt', 32);
      const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
      decipher.setAuthTag(authTag);

      // Decrypt the data
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      const data = JSON.parse(decrypted);

      // Log decryption event
      await this.logSecurityEvent({
        userId,
        eventType: 'access',
        resourceType: 'financial_data',
        severity: 'low',
        description: 'Data decrypted for access',
        ipAddress: 'system',
        userAgent: 'decryption-service',
        timestamp: new Date(),
        metadata: { size: decrypted.length },
      });

      return data;
    } catch (_error) {
      console.error('Error decrypting data:', error);
      throw new Error('Data decryption failed');
    }
  }

  /**
   * Validate compliance with Brazilian regulations
   */
  static async validateCompliance(
    data: any,
    operation: string,
    userId: string,
  ): Promise<{
    compliant: boolean;
    violations: Array<{
      rule: string;
      severity: string;
      description: string;
    }>;
  }> {
    try {
      const { data: rules, error } = await supabase
        .from('compliance_rules')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      const violations: Array<{
        rule: string;
        severity: string;
        description: string;
      }> = [];

      for (const rule of rules || []) {
        const isViolation = await this.checkComplianceRule(data, operation, rule);
        if (isViolation) {
          violations.push({
            rule: rule.name,
            severity: rule.severity,
            description: rule.description,
          });

          // Log compliance violation
          await this.logSecurityEvent({
            userId,
            eventType: 'failure',
            resourceType: 'financial_data',
            severity: rule.severity as any,
            description: `Compliance violation: ${rule.name}`,
            ipAddress: 'system',
            userAgent: 'compliance-checker',
            timestamp: new Date(),
            metadata: { rule: rule.name, operation },
          });
        }
      }

      return {
        compliant: violations.length === 0,
        violations,
      };
    } catch (_error) {
      console.error('Error validating compliance:', error);
      return {
        compliant: false,
        violations: [{
          rule: 'system_error',
          severity: 'critical',
          description: 'Compliance validation system error',
        }],
      };
    }
  }

  /**
   * Get security alerts
   */
  static async getSecurityAlerts(
    filters?: {
      severity?: SecurityAlert['severity'];
      status?: SecurityAlert['status'];
      limit?: number;
    },
  ): Promise<SecurityAlert[]> {
    try {
      let query = supabase
        .from('security_alerts')
        .select('*')
        .order('timestamp', { ascending: false });

      if (filters?.severity) {
        query = query.eq('severity', filters.severity);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(alert => ({
        id: alert.id,
        type: alert.type,
        severity: alert.severity,
        title: alert.title,
        description: alert.description,
        affectedUsers: alert.affected_users,
        affectedResources: alert.affected_resources,
        timestamp: new Date(alert.timestamp),
        status: alert.status,
        investigator: alert.investigator,
        resolution: alert.resolution,
      }));
    } catch (_error) {
      console.error('Error getting security alerts:', error);
      return [];
    }
  }

  /**
   * Check for security alert conditions
   */
  private static async checkForSecurityAlert(event: Omit<SecurityEvent, 'id'>): Promise<void> {
    // Check for suspicious patterns
    if (event.severity === 'high' || event.severity === 'critical') {
      await this.createSecurityAlert({
        type: 'suspicious_access',
        severity: event.severity,
        title: `High severity security event: ${event.eventType}`,
        description: event.description,
        affectedUsers: [event.userId],
        affectedResources: event.resourceId ? [event.resourceId] : [],
        timestamp: new Date(),
        status: 'open',
      });
    }

    // Check for multiple failed access attempts
    if (event.eventType === 'failure') {
      const recentFailures = await this.getRecentFailures(event.userId, 15); // Last 15 minutes
      if (recentFailures >= 5) {
        await this.createSecurityAlert({
          type: 'failed_login',
          severity: 'high',
          title: 'Multiple failed access attempts',
          description:
            `User ${event.userId} has ${recentFailures} failed access attempts in the last 15 minutes`,
          affectedUsers: [event.userId],
          affectedResources: [],
          timestamp: new Date(),
          status: 'open',
        });
      }
    }
  }

  /**
   * Create security alert
   */
  private static async createSecurityAlert(alert: Omit<SecurityAlert, 'id'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('security_alerts')
        .insert({
          type: alert.type,
          severity: alert.severity,
          title: alert.title,
          description: alert.description,
          affected_users: alert.affectedUsers,
          affected_resources: alert.affectedResources,
          timestamp: alert.timestamp.toISOString(),
          status: alert.status,
        });

      if (error) throw error;
    } catch (_error) {
      console.error('Error creating security alert:', error);
    }
  }

  /**
   * Get recent failures for a user
   */
  private static async getRecentFailures(userId: string, minutes: number): Promise<number> {
    try {
      const since = new Date(Date.now() - minutes * 60 * 1000);

      const { data, error } = await supabase
        .from('security_events')
        .select('id')
        .eq('user_id', userId)
        .eq('event_type', 'failure')
        .gte('timestamp', since.toISOString());

      if (error) throw error;

      return data?.length || 0;
    } catch (_error) {
      console.error('Error getting recent failures:', error);
      return 0;
    }
  }

  /**
   * Check compliance rule
   */
  private static async checkComplianceRule(
    data: any,
    operation: string,
    rule: ComplianceRule,
  ): Promise<boolean> {
    // Simplified compliance rule checking
    // In a real implementation, this would be more sophisticated
    for (const condition of rule.conditions) {
      const fieldValue = this.getNestedValue(data, condition.field);

      switch (condition.operator) {
        case 'equals':
          if (fieldValue !== condition.value) return true;
          break;
        case 'contains':
          if (typeof fieldValue === 'string' && !fieldValue.includes(condition.value)) return true;
          break;
        case 'greater_than':
          if (typeof fieldValue === 'number' && fieldValue <= condition.value) return true;
          break;
        case 'less_than':
          if (typeof fieldValue === 'number' && fieldValue >= condition.value) return true;
          break;
        case 'regex':
          if (typeof fieldValue === 'string' && !new RegExp(condition.value).test(fieldValue)) {
            return true;
          }
          break;
      }
    }

    return false;
  }

  /**
   * Get nested value from object
   */
  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}

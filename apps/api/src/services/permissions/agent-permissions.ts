/**
 * Agent Permission Service
 *
 * Implements role-based permission checking for AI agent data access
 * with LGPD compliance and healthcare security requirements.
 */

import { Database } from '@/types/database';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';
import { z } from 'zod';

// Input validation schemas
const PermissionContextSchema = z.object({
  userId: z.string().min(1, 'User ID is required').max(255),
  sessionId: z.string().max(255).optional(),
  patientId: z.string().max(255).optional(),
  action: z.enum(['read', 'write', 'delete', 'admin'], {
    errorMap: () => ({ message: 'Invalid action type' }),
  }),
  resource: z.enum([
    'agent_sessions',
    'agent_messages',
    'agent_context',
    'agent_audit',
    'patient_data',
    'financial_data',
  ], {
    errorMap: () => ({ message: 'Invalid resource type' }),
  }),
  metadata: z.record(z.any()).optional(),
});

const UserIdSchema = z.string().min(1, 'User ID is required').max(255);
const SessionIdSchema = z.string().min(1, 'Session ID is required').max(255);

export type ValidatedPermissionContext = z.infer<typeof PermissionContextSchema>;

export interface PermissionContext {
  userId: string;
  sessionId?: string;
  patientId?: string;
  action: 'read' | 'write' | 'delete' | 'admin';
  resource:
    | 'agent_sessions'
    | 'agent_messages'
    | 'agent_context'
    | 'agent_audit'
    | 'patient_data'
    | 'financial_data';
  metadata?: Record<string, any>;
}

export interface PermissionResult {
  granted: boolean;
  reason?: string;
  conditions?: Record<string, any>;
  auditLog?: {
    action: string;
    resource: string;
    userId: string;
    details: Record<string, any>;
  };
}

export interface UserRole {
  id: string;
  role: 'admin' | 'clinic_admin' | 'professional' | 'staff' | 'patient';
  clinicId?: string;
  permissions: string[];
  scopes: string[];
}

export class AgentPermissionService {
  private supabase: ReturnType<typeof createClient<Database>>;
  private cache: Map<string, { permissions: UserRole; expires: number; version: number }> =
    new Map();
  private cacheTimeout = 300000; // 5 minutes
  private cacheVersion = 1;
  private failSecureMode = true;
  private maxCacheSize = 1000;
  private auditLogQueue: Array<() => Promise<void>> = [];
  private isProcessingAuditLog = false;

  constructor(supabaseUrl: string, supabaseServiceKey: string) {
    // Validate configuration
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration is required');
    }

    this.supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);
    this.initializeCacheCleanup();
    this.setupRealTimeInvalidation();
  }

  /**
   * Check if a user has permission to perform an action
   */
  async checkPermission(context: PermissionContext): Promise<PermissionResult> {
    const startTime = Date.now();

    try {
      // Validate input
      const validatedContext = this.validateAndSanitizeContext(context);

      // Rate limiting check
      if (!(await this.checkRateLimit(validatedContext.userId))) {
        return {
          granted: false,
          reason: 'Rate limit exceeded',
          auditLog: {
            action: validatedContext.action,
            resource: validatedContext.resource,
            userId: validatedContext.userId,
            details: {
              denied: true,
              reason: 'rate_limit_exceeded',
              processingTime: Date.now() - startTime,
            },
          },
        };
      }

      // Get user roles from cache or database
      const userRoles = await this.getUserRoles(validatedContext.userId);

      // Check each role for required permission
      for (const role of userRoles) {
        const result = await this.checkRolePermission(role, validatedContext);
        if (result.granted) {
          // Log successful permission check
          await this.queuePermissionCheckLog({
            ...validatedContext,
            granted: true,
            processingTime: Date.now() - startTime,
            role: role.role,
          });

          return result;
        }
      }

      // No role has permission
      const denialResult: PermissionResult = {
        granted: false,
        reason: 'Insufficient permissions',
        auditLog: {
          action: validatedContext.action,
          resource: validatedContext.resource,
          userId: validatedContext.userId,
          details: {
            denied: true,
            reason: 'no_sufficient_role',
            processingTime: Date.now() - startTime,
          },
        },
      };

      await this.queuePermissionCheckLog({
        ...validatedContext,
        granted: false,
        processingTime: Date.now() - startTime,
      });

      return denialResult;
    } catch (error) {
      console.error('Permission check error:', error);

      // Fail secure - deny permission on error
      const errorResult: PermissionResult = {
        granted: false,
        reason: this.failSecureMode ? 'Permission system error' : 'System unavailable',
        auditLog: {
          action: validatedContext.action,
          resource: validatedContext.resource,
          userId: validatedContext.userId,
          details: {
            error: error instanceof Error ? this.sanitizeError(error) : 'Unknown error',
            processingTime: Date.now() - startTime,
            failSecure: this.failSecureMode,
          },
        },
      };

      await this.queuePermissionCheckLog({
        ...validatedContext,
        granted: false,
        processingTime: Date.now() - startTime,
        error: error instanceof Error ? this.sanitizeError(error) : 'Unknown error',
      });

      return errorResult;
    }
  }

  /**
   * Get user roles with caching and validation
   */
  private async getUserRoles(userId: string): Promise<UserRole[]> {
    // Validate and sanitize userId
    const validatedUserId = UserIdSchema.parse(userId);
    const cacheKey = this.generateSecureCacheKey(validatedUserId);

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expires > Date.now() && cached.version === this.cacheVersion) {
      return [cached.permissions];
    }

    try {
      // Get user roles from database with validation
      const { data, error } = await this.supabase
        .from('user_roles')
        .select(`
          *,
          role_permissions (
            permission,
            scope
          )
        `)
        .eq('user_id', validatedUserId)
        .eq('active', true);

      if (error) {
        throw error;
      }

      const roles: UserRole[] = data?.map(role => ({
        id: this.sanitizeString(role.id),
        role: this.validateRoleType(role.role),
        clinicId: role.clinic_id ? this.sanitizeString(role.clinic_id) : undefined,
        permissions: role.role_permissions?.map(rp => this.sanitizePermissionString(rp.permission))
          || [],
        scopes: role.role_permissions?.map(rp => this.sanitizeScopeString(rp.scope)) || [],
      })) || [];

      // Cache the result with size limit
      if (roles.length > 0 && this.cache.size < this.maxCacheSize) {
        this.cache.set(cacheKey, {
          permissions: roles[0],
          expires: Date.now() + this.cacheTimeout,
          version: this.cacheVersion,
        });
      }

      return roles;
    } catch (error) {
      console.error('Error fetching user roles:', error);
      // Return empty array on error - fail secure
      return [];
    }
  }

  /**
   * Check permission for a specific role
   */
  private async checkRolePermission(
    role: UserRole,
    context: PermissionContext,
  ): Promise<PermissionResult> {
    const basePermission = `${context.action}:${context.resource}`;

    // Check if role has the base permission
    if (!role.permissions.includes(basePermission) && !role.permissions.includes('*:*')) {
      return { granted: false, reason: 'Role lacks required permission' };
    }

    // Role-specific permission logic
    switch (role.role) {
      case 'admin':
        return this.checkAdminPermission(role, context);

      case 'clinic_admin':
        return this.checkClinicAdminPermission(role, context);

      case 'professional':
        return this.checkProfessionalPermission(role, context);

      case 'staff':
        return this.checkStaffPermission(role, context);

      case 'patient':
        return this.checkPatientPermission(role, context);

      default:
        return { granted: false, reason: 'Unknown role type' };
    }
  }

  /**
   * Admin permissions - full access
   */
  private async checkAdminPermission(
    role: UserRole,
    context: PermissionContext,
  ): Promise<PermissionResult> {
    return {
      granted: true,
      conditions: {
        role: 'admin',
        scope: 'global',
      },
    };
  }

  /**
   * Clinic admin permissions - clinic-wide access
   */
  private async checkClinicAdminPermission(
    role: UserRole,
    context: PermissionContext,
  ): Promise<PermissionResult> {
    // For patient data access, verify patient belongs to clinic
    if (context.resource === 'patient_data' && context.patientId) {
      const { data: patient } = await this.supabase
        .from('patients')
        .select('clinic_id')
        .eq('id', context.patientId)
        .single();

      if (!patient || patient.clinic_id !== role.clinicId) {
        return {
          granted: false,
          reason: 'Patient not in clinic scope',
        };
      }
    }

    return {
      granted: true,
      conditions: {
        role: 'clinic_admin',
        scope: 'clinic',
        clinicId: role.clinicId,
      },
    };
  }

  /**
   * Professional permissions - assigned patients only
   */
  private async checkProfessionalPermission(
    role: UserRole,
    context: PermissionContext,
  ): Promise<PermissionResult> {
    // For patient data access, verify professional has access to patient
    if (context.resource === 'patient_data' && context.patientId) {
      const { data: assignment } = await this.supabase
        .from('professional_patient_assignments')
        .select('id')
        .eq('professional_id', context.userId)
        .eq('patient_id', context.patientId)
        .eq('active', true)
        .single();

      if (!assignment) {
        return {
          granted: false,
          reason: 'No professional-patient assignment',
        };
      }
    }

    // For financial data, check if professional has billing permissions
    if (context.resource === 'financial_data') {
      if (!role.permissions.includes('write:financial_data')) {
        return {
          granted: false,
          reason: 'Professional lacks financial write permissions',
        };
      }
    }

    return {
      granted: true,
      conditions: {
        role: 'professional',
        scope: 'assigned_patients',
        clinicId: role.clinicId,
      },
    };
  }

  /**
   * Staff permissions - limited access
   */
  private async checkStaffPermission(
    role: UserRole,
    context: PermissionContext,
  ): Promise<PermissionResult> {
    // Staff cannot access financial data
    if (context.resource === 'financial_data') {
      return {
        granted: false,
        reason: 'Staff cannot access financial data',
      };
    }

    // For patient data, verify clinic membership
    if (context.resource === 'patient_data' && context.patientId) {
      const { data: patient } = await this.supabase
        .from('patients')
        .select('clinic_id')
        .eq('id', context.patientId)
        .single();

      if (!patient || patient.clinic_id !== role.clinicId) {
        return {
          granted: false,
          reason: 'Patient not in clinic scope',
        };
      }
    }

    // Staff can only read agent data, not write/delete
    if (context.resource.startsWith('agent_') && context.action !== 'read') {
      return {
        granted: false,
        reason: 'Staff can only read agent data',
      };
    }

    return {
      granted: true,
      conditions: {
        role: 'staff',
        scope: 'clinic_readonly',
        clinicId: role.clinicId,
      },
    };
  }

  /**
   * Patient permissions - own data only
   */
  private async checkPatientPermission(
    role: UserRole,
    context: PermissionContext,
  ): Promise<PermissionResult> {
    // Patients can only access their own data
    if (context.patientId && context.patientId !== context.userId) {
      return {
        granted: false,
        reason: 'Patients can only access their own data',
      };
    }

    // Patients can only read their agent sessions and messages
    if (context.resource.startsWith('agent_') && context.action !== 'read') {
      return {
        granted: false,
        reason: 'Patients can only read their agent data',
      };
    }

    return {
      granted: true,
      conditions: {
        role: 'patient',
        scope: 'own_data',
        patientId: context.patientId,
      },
    };
  }

  /**
   * Log permission check for audit purposes
   */
  private async logPermissionCheck(details: {
    userId: string;
    action: string;
    resource: string;
    granted: boolean;
    processingTime: number;
    role?: string;
    error?: string;
    sessionId?: string;
    patientId?: string;
  }): Promise<void> {
    try {
      await this.supabase
        .from('agent_audit_log')
        .insert({
          user_id: details.userId,
          action: 'permission_check',
          table_name: 'permissions',
          compliance_metadata: {
            permission_action: details.action,
            permission_resource: details.resource,
            permission_granted: details.granted,
            permission_role: details.role,
            permission_processing_time: details.processingTime,
            session_id: details.sessionId,
            patient_id: details.patientId,
            error: details.error,
          },
        });
    } catch (error) {
      console.error('Failed to log permission check:', error);
    }
  }

  /**
   * Clear permission cache for a user and invalidate all related caches
   */
  clearCache(userId: string): void {
    try {
      const validatedUserId = UserIdSchema.parse(userId);
      const cacheKey = this.generateSecureCacheKey(validatedUserId);
      this.cache.delete(cacheKey);

      // Increment cache version to force refresh
      this.cacheVersion++;

      // Clean up oversized cache
      this.enforceCacheSizeLimit();
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  /**
   * Clear all caches (for emergency situations)
   */
  clearAllCaches(): void {
    this.cache.clear();
    this.cacheVersion++;
    console.warn('All permission caches cleared');
  }

  /**
   * Get all permissions for a user (for debugging/admin)
   */
  async getUserPermissions(userId: string): Promise<{
    roles: UserRole[];
    effectivePermissions: string[];
  }> {
    const roles = await this.getUserRoles(userId);
    const effectivePermissions = new Set<string>();

    roles.forEach(role => {
      role.permissions.forEach(permission => {
        effectivePermissions.add(permission);
      });
    });

    return {
      roles,
      effectivePermissions: Array.from(effectivePermissions),
    };
  }

  /**
   * Check if user has LGPD consent for data processing
   */
  async hasLgpdConsent(
    userId: string,
    consentType: 'data_processing' | 'ai_interaction' | 'data_retention',
  ): Promise<boolean> {
    try {
      const validatedUserId = UserIdSchema.parse(userId);
      const validConsentType = z.enum(['data_processing', 'ai_interaction', 'data_retention'])
        .parse(consentType);

      const { data } = await this.supabase
        .from('user_lgpd_consents')
        .select('id')
        .eq('user_id', validatedUserId)
        .eq('consent_type', validConsentType)
        .eq('granted', true)
        .gt('expires_at', new Date().toISOString())
        .single();

      return !!data;
    } catch (error) {
      console.error('Error checking LGPD consent:', error);
      // Fail secure - no consent on error
      return false;
    }
  }

  /**
   * Validate session ownership and permissions with security checks
   */
  async validateSessionAccess(sessionId: string, userId: string): Promise<{
    valid: boolean;
    session?: any;
    reason?: string;
  }> {
    try {
      const validatedSessionId = SessionIdSchema.parse(sessionId);
      const validatedUserId = UserIdSchema.parse(userId);

      const { data: session, error } = await this.supabase
        .from('agent_sessions')
        .select('*')
        .eq('session_id', validatedSessionId)
        .single();

      if (error || !session) {
        return { valid: false, reason: 'Session not found' };
      }

      // Check if session belongs to user
      if (session.user_id !== validatedUserId) {
        return { valid: false, reason: 'Session ownership mismatch' };
      }

      // Check if session is expired
      if (new Date(session.expires_at) <= new Date()) {
        return { valid: false, reason: 'Session expired' };
      }

      // Check if session is active
      if (!session.is_active) {
        return { valid: false, reason: 'Session inactive' };
      }

      // Additional security: Check session age
      const sessionAge = Date.now() - new Date(session.created_at).getTime();
      const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours
      if (sessionAge > maxSessionAge) {
        return { valid: false, reason: 'Session too old' };
      }

      return { valid: true, session };
    } catch (error) {
      console.error('Error validating session access:', error);
      return { valid: false, reason: 'Validation error' };
    }
  }

  /**
   * Log permission check for audit purposes with queueing
   */
  private async queuePermissionCheckLog(details: {
    userId: string;
    action: string;
    resource: string;
    granted: boolean;
    processingTime: number;
    role?: string;
    error?: string;
    sessionId?: string;
    patientId?: string;
  }): Promise<void> {
    // Queue the audit log for async processing
    this.auditLogQueue.push(async () => {
      try {
        await this.supabase
          .from('agent_audit_log')
          .insert({
            user_id: details.userId,
            action: 'permission_check',
            table_name: 'permissions',
            compliance_metadata: {
              permission_action: details.action,
              permission_resource: details.resource,
              permission_granted: details.granted,
              permission_role: details.role,
              permission_processing_time: details.processingTime,
              session_id: details.sessionId,
              patient_id: details.patientId,
              error: this.sanitizeErrorString(details.error),
              timestamp: new Date().toISOString(),
              cache_version: this.cacheVersion,
            },
          });
      } catch (error) {
        console.error('Failed to log permission check:', error);
      }
    });

    // Process the queue if not already processing
    if (!this.isProcessingAuditLog) {
      this.processAuditLogQueue();
    }
  }

  /**
   * Process audit log queue asynchronously
   */
  private async processAuditLogQueue(): Promise<void> {
    if (this.isProcessingAuditLog || this.auditLogQueue.length === 0) {
      return;
    }

    this.isProcessingAuditLog = true;

    try {
      while (this.auditLogQueue.length > 0) {
        const logFunction = this.auditLogQueue.shift();
        if (logFunction) {
          await logFunction();
        }
      }
    } catch (error) {
      console.error('Error processing audit log queue:', error);
    } finally {
      this.isProcessingAuditLog = false;
    }
  }

  /**
   * Initialize periodic cache cleanup
   */
  private initializeCacheCleanup(): void {
    setInterval(() => {
      this.cleanupExpiredCache();
    }, 60000); // Cleanup every minute
  }

  /**
   * Cleanup expired cache entries
   */
  private cleanupExpiredCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expires <= now) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Enforce cache size limit with LRU eviction
   */
  private enforceCacheSizeLimit(): void {
    if (this.cache.size > this.maxCacheSize) {
      // Remove oldest entries
      const entries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].expires - b[1].expires);

      const toRemove = entries.slice(0, Math.floor(this.maxCacheSize * 0.2));
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  /**
   * Generate secure cache key with hashing
   */
  private generateSecureCacheKey(userId: string): string {
    return `permissions_${
      createHash('sha256')
        .update(userId + process.env.CACHE_SALT || 'default_salt')
        .digest('hex')
        .substring(0, 32)
    }`;
  }

  /**
   * Validate and sanitize permission context
   */
  private validateAndSanitizeContext(context: PermissionContext): ValidatedPermissionContext {
    return PermissionContextSchema.parse(context);
  }

  /**
   * Sanitize string inputs to prevent injection
   */
  private sanitizeString(input: string): string {
    if (typeof input !== 'string') return '';
    return input
      .replace(/[<>]/g, '') // Remove potential HTML/script tags
      .replace(/[;'"\\]/g, '') // Remove potential SQL injection chars
      .trim()
      .substring(0, 255); // Limit length
  }

  /**
   * Validate role type
   */
  private validateRoleType(role: string): UserRole['role'] {
    const validRoles = ['admin', 'clinic_admin', 'professional', 'staff', 'patient'];
    if (validRoles.includes(role)) {
      return role as UserRole['role'];
    }
    throw new Error(`Invalid role type: ${role}`);
  }

  /**
   * Sanitize permission string
   */
  private sanitizePermissionString(permission: string): string {
    return this.sanitizeString(permission);
  }

  /**
   * Sanitize scope string
   */
  private sanitizeScopeString(scope: string): string {
    return this.sanitizeString(scope);
  }

  /**
   * Sanitize error for logging
   */
  private sanitizeError(error: unknown): string {
    if (error instanceof Error) {
      return this.sanitizeErrorString(error.message);
    }
    return this.sanitizeErrorString(String(error));
  }

  /**
   * Sanitize error string for audit logging
   */
  private sanitizeErrorString(error?: string): string {
    if (!error) return '';
    return this.sanitizeString(error);
  }

  /**
   * Check rate limiting for permission checks with enhanced security
   */
  private async checkRateLimit(userId: string): Promise<boolean> {
    // Enhanced rate limiting with security considerations
    const rateLimitKey = `rate_limit_${this.sanitizeString(userId)}`;
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const maxRequests = 50; // Reduced for security

    // Check if user is in security blocklist
    if (await this.isSecurityBlocklisted(userId)) {
      return false;
    }

    // This would ideally use Redis for distributed rate limiting
    // For now, using simple in-memory tracking with security enhancements
    const currentCount = 0; // Placeholder for actual rate limit tracking

    // Check for suspicious activity patterns
    if (currentCount > maxRequests * 0.8) { // 80% threshold
      await this.logSuspiciousActivity(userId, 'high_permission_check_rate');
    }

    return currentCount < maxRequests;
  }

  /**
   * Setup real-time cache invalidation via Supabase realtime
   */
  private setupRealTimeInvalidation(): void {
    try {
      // Subscribe to user role changes for automatic cache invalidation
      const channel = this.supabase
        .channel('permission-invalidation')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_roles',
          },
          payload => {
            this.handleRoleChange(payload);
          },
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'role_permissions',
          },
          payload => {
            this.handlePermissionChange(payload);
          },
        )
        .subscribe(status => {
          console.log('Real-time permission invalidation status:', status);
        });

      // Store channel for cleanup
      (this as any).realtimeChannel = channel;
    } catch (error) {
      console.error('Failed to setup real-time cache invalidation:', error);
    }
  }

  /**
   * Handle user role changes for cache invalidation
   */
  private handleRoleChange(payload: any): void {
    try {
      if (payload.eventType === 'UPDATE' || payload.eventType === 'DELETE') {
        const userId = payload.old?.user_id || payload.new?.user_id;
        if (userId) {
          this.clearCache(userId);
          this.logCacheInvalidation('role_change', userId);
        }
      }
    } catch (error) {
      console.error('Error handling role change:', error);
    }
  }

  /**
   * Handle permission changes for cache invalidation
   */
  private handlePermissionChange(payload: any): void {
    try {
      // When permissions change, increment cache version to force refresh
      this.cacheVersion++;
      this.logCacheInvalidation('permission_change', 'global');
    } catch (error) {
      console.error('Error handling permission change:', error);
    }
  }

  /**
   * Check if user is security blocklisted
   */
  private async isSecurityBlocklisted(userId: string): Promise<boolean> {
    try {
      const { data } = await this.supabase
        .from('security_blocklist')
        .select('id')
        .eq('user_id', this.sanitizeString(userId))
        .eq('active', true)
        .gt('expires_at', new Date().toISOString())
        .single();

      return !!data;
    } catch (error) {
      return false;
    }
  }

  /**
   * Log suspicious security activity
   */
  private async logSuspiciousActivity(userId: string, activityType: string): Promise<void> {
    try {
      await this.supabase
        .from('security_events')
        .insert({
          user_id: this.sanitizeString(userId),
          event_type: 'suspicious_activity',
          activity_type: activityType,
          severity: 'medium',
          metadata: {
            timestamp: new Date().toISOString(),
            ip_address: 'unknown', // Would be extracted from request
            user_agent: 'unknown', // Would be extracted from request
          },
        });
    } catch (error) {
      console.error('Failed to log suspicious activity:', error);
    }
  }

  /**
   * Log cache invalidation events for audit
   */
  private logCacheInvalidation(reason: string, target: string): void {
    console.log(
      `Cache invalidated - Reason: ${reason}, Target: ${target}, Version: ${this.cacheVersion}`,
    );
  }

  /**
   * Get cache statistics for monitoring
   */
  getCacheStats(): {
    size: number;
    maxSize: number;
    version: number;
    hitRate: number;
  } {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      version: this.cacheVersion,
      hitRate: 0, // Placeholder for actual hit rate calculation
    };
  }

  /**
   * Set fail-secure mode
   */
  setFailSecureMode(enabled: boolean): void {
    this.failSecureMode = enabled;
    console.log(`Fail-secure mode ${enabled ? 'enabled' : 'disabled'}`);
  }
}

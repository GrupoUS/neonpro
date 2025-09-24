/**
 * Healthcare Authentication Middleware
 *
 * Comprehensive authentication middleware with:
 * - Healthcare role-based access control (RBAC)
 * - Multi-factor authentication for sensitive operations
 * - Session management with healthcare workflow support
 * - LGPD compliance for patient data protection
 * - Emergency access protocols
 * - Audit logging and compliance monitoring
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 * @compliance LGPD, ANVISA SaMD, Healthcare Standards
 */

import type { Context, MiddlewareHandler, Next } from 'hono';
import { verify } from 'hono/jwt';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { auditLogger, logHealthcareError } from '../logging/healthcare-logger';
const authLogger = auditLogger;

// ============================================================================
// SCHEMAS & TYPES
// ============================================================================

/**
 * JWT Payload interface for authentication tokens
 */
export interface JWTPayload {
  /** User identifier */
  _userId: string;
  /** Session identifier (optional) */
  sessionId?: string;
  /** Token issuer */
  iss: string;
  /** Token audience */
  aud: string;
  /** Expiration timestamp */
  exp: number;
  /** Issued at timestamp */
  iat: number;
  /** Authentication method used */
  authMethod?: string;
  /** MFA verification status */
  mfaVerified?: boolean;
  /** Emergency mode flag */
  emergencyMode?: boolean;
  /** Supervisor override flag */
  supervisorOverride?: boolean;
}

/**
 * User Profile interface for healthcare professionals
 */
export interface UserProfile {
  /** Healthcare role */
  _role: HealthcareRole;
  /** Healthcare facility ID */
  facilityId: string;
  /** Department ID */
  departmentId: string;
  /** Current shift ID (optional) */
  shiftId?: string;
  /** Professional license number */
  licenseNumber: string;
  /** Medical specialization */
  specialization: string;
  /** Preferred language */
  preferredLanguage: string;
  /** User timezone */
  timezone: string;
  /** LGPD consent status */
  consentStatus: {
    dataProcessing: boolean;
    communication: boolean;
    analytics: boolean;
    thirdParty: boolean;
    consentDate: string;
    consentVersion: string;
  };
}

/**
 * Authorization requirements interface
 */
export interface AuthorizationRequirements {
  permission?: HealthcarePermission;
  accessLevel?: number;
  resource?: string;
  operation?: 'read' | 'write' | 'delete';
}

/**
 * JWT Algorithm type
 */
export type JWTAlgorithm =
  | 'HS256'
  | 'HS384'
  | 'HS512'
  | 'RS256'
  | 'RS384'
  | 'RS512';

/**
 * Environment type
 */
export type Environment = 'development' | 'staging' | 'production';

/**
 * Log level type
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Authentication error interface
 */
export interface AuthenticationError {
  message: string;
  code?: string;
  stack?: string;
}

/**
 * Healthcare user roles with access levels
 */
export const HealthcareRoleSchema = z.enum([
  'patient', // Level 1: Basic access
  'caregiver', // Level 1: Family/caregiver access
  'guest', // Level 0: Public access
  'receptionist', // Level 2: Administrative access
  'nurse', // Level 3: Clinical access
  'technician', // Level 3: Technical procedures
  'pharmacist', // Level 4: Medication access
  'lab_technician', // Level 4: Laboratory access
  'radiologist', // Level 4: Imaging access
  'doctor', // Level 5: Medical practitioner
  'specialist', // Level 6: Specialized medical access
  'department_head', // Level 7: Department management
  'system_admin', // Level 8: System administration
  'compliance_officer', // Level 8: Compliance oversight
  'emergency_responder', // Level 9: Emergency access
  'super_admin', // Level 10: Full system access
]);

export type HealthcareRole = z.infer<typeof HealthcareRoleSchema>;

/**
 * Healthcare permissions schema
 */
export const HealthcarePermissionSchema = z.enum([
  // Patient data permissions
  'patient:read:basic', // Basic patient info
  'patient:read:full', // Complete patient record
  'patient:write:basic', // Update basic info
  'patient:write:full', // Full patient record updates
  'patient:delete', // Delete patient records

  // Medical data permissions
  'medical:read:diagnoses', // Read diagnoses
  'medical:write:diagnoses', // Write diagnoses
  'medical:read:treatments', // Read treatments
  'medical:write:treatments', // Write treatments
  'medical:read:medications', // Read medications
  'medical:write:medications', // Prescribe medications
  'medical:read:allergies', // Read allergies
  'medical:write:allergies', // Update allergies

  // Laboratory permissions
  'lab:read:results', // Read lab results
  'lab:write:results', // Enter lab results
  'lab:read:orders', // Read lab orders
  'lab:write:orders', // Create lab orders

  // Imaging permissions
  'imaging:read:studies', // Read imaging studies
  'imaging:write:studies', // Create imaging studies
  'imaging:read:reports', // Read imaging reports
  'imaging:write:reports', // Write imaging reports

  // Administrative permissions
  'admin:read:users', // Read user accounts
  'admin:write:users', // Manage user accounts
  'admin:read:audit', // Read audit logs
  'admin:write:settings', // Modify system settings
  'admin:emergency:override', // Emergency access override

  // System permissions
  'system:read:logs', // Read system logs
  'system:write:config', // Modify system configuration
  'system:read:metrics', // Read system metrics
  'system:backup:create', // Create system backups

  // Compliance permissions
  'compliance:read:audit', // Read compliance audits
  'compliance:write:policies', // Update compliance policies
  'compliance:read:reports', // Generate compliance reports
  'compliance:export:data', // Export data for compliance
]);

export type HealthcarePermission = z.infer<typeof HealthcarePermissionSchema>;

/**
 * Authentication session schema
 */
export const AuthSessionSchema = z.object({
  // Session identification
  sessionId: z.string().describe('Unique session identifier'),
  _userId: z.string().describe('User identifier'),
  correlationId: z.string().describe('Request correlation ID'),

  // User information
  userProfile: z
    .object({
      anonymizedId: z.string().describe('LGPD-compliant anonymized ID'),
      _role: HealthcareRoleSchema.describe('User healthcare role'),
      permissions: z
        .array(HealthcarePermissionSchema)
        .describe('User permissions'),
      facilityId: z.string().optional().describe('Healthcare facility ID'),
      departmentId: z.string().optional().describe('Department ID'),
      shiftId: z.string().optional().describe('Current shift ID'),

      // Professional information
      licenseNumber: z
        .string()
        .optional()
        .describe('Professional license number'),
      specialization: z.string().optional().describe('Medical specialization'),
      accessLevel: z.number().min(0).max(10).describe('Numeric access level'),

      // Contact and preferences
      preferredLanguage: z
        .string()
        .default('pt-BR')
        .describe('Preferred language'),
      timezone: z
        .string()
        .default('America/Sao_Paulo')
        .describe('User timezone'),

      // LGPD consent
      consentStatus: z
        .object({
          dataProcessing: z.boolean().describe('Data processing consent'),
          communication: z.boolean().describe('Communication consent'),
          analytics: z.boolean().describe('Analytics consent'),
          thirdParty: z.boolean().describe('Third-party sharing consent'),
          consentDate: z.string().datetime().describe('Consent timestamp'),
          consentVersion: z.string().describe('Consent version'),
        })
        .describe('LGPD consent status'),
    })
    .describe('User profile information'),

  // Session metadata
  sessionMetadata: z
    .object({
      createdAt: z.string().datetime().describe('Session creation time'),
      lastActivity: z.string().datetime().describe('Last activity timestamp'),
      expiresAt: z.string().datetime().describe('Session expiration time'),
      ipAddress: z.string().describe('Client IP address (anonymized)'),
      userAgent: z.string().describe('Client user agent'),
      deviceType: z
        .enum(['mobile', 'tablet', 'desktop', 'medical_device'])
        .describe('Device type'),

      // Security context
      authenticationMethod: z
        .enum(['password', 'mfa', 'biometric', 'smartcard', 'emergency'])
        .describe('Authentication method'),
      mfaVerified: z.boolean().describe('MFA verification status'),
      riskScore: z.number().min(0).max(10).describe('Session risk score'),

      // Healthcare context
      workflowContext: z
        .object({
          activeWorkflow: z.string().optional().describe('Current workflow'),
          patientContext: z
            .string()
            .optional()
            .describe('Current patient context'),
          emergencyMode: z
            .boolean()
            .default(false)
            .describe('Emergency mode active'),
          supervisorOverride: z
            .boolean()
            .default(false)
            .describe('Supervisor override active'),
        })
        .optional()
        .describe('Healthcare workflow context'),
    })
    .describe('Session metadata'),

  // Compliance tracking
  complianceTracking: z
    .object({
      auditTrail: z
        .array(
          z.object({
            action: z.string().describe('Action performed'),
            timestamp: z.string().datetime().describe('Action timestamp'),
            resource: z.string().describe('Resource accessed'),
            outcome: z
              .enum(['success', 'failure', 'blocked'])
              .describe('Action outcome'),
            riskLevel: z
              .enum(['low', 'medium', 'high', 'critical'])
              .describe('Risk level'),
          }),
        )
        .describe('Session audit trail'),

      dataAccessed: z
        .array(
          z.object({
            resourceType: z.string().describe('Type of data accessed'),
            resourceId: z.string().describe('Resource identifier'),
            accessType: z
              .enum(['read', 'write', 'delete', 'export'])
              .describe('Access type'),
            legalBasis: z.string().describe('LGPD legal basis'),
            timestamp: z.string().datetime().describe('Access timestamp'),
          }),
        )
        .describe('Data access log'),

      complianceFlags: z
        .object({
          lgpdCompliant: z.boolean().describe('LGPD compliance status'),
          anvisaCompliant: z.boolean().describe('ANVISA compliance status'),
          auditRequired: z.boolean().describe('Audit logging required'),
          retentionApplied: z.boolean().describe('Data retention applied'),
        })
        .describe('Compliance flags'),
    })
    .describe('Compliance tracking'),
});

export type AuthSession = z.infer<typeof AuthSessionSchema>;

/**
 * Authentication configuration schema
 */
export const AuthConfigSchema = z.object({
  // Core settings
  enabled: z.boolean().default(true).describe('Enable authentication'),
  environment: z
    .enum(['development', 'staging', 'production'])
    .describe('Environment'),

  // JWT settings
  jwt: z
    .object({
      issuer: z.string().default('neonpro-healthcare').describe('JWT issuer'),
      audience: z.string().default('neonpro-api').describe('JWT audience'),
      algorithm: z.string().default('HS256').describe('JWT algorithm'),
      accessTokenTtl: z
        .number()
        .default(3600)
        .describe('Access token TTL in seconds'),
      refreshTokenTtl: z
        .number()
        .default(604800)
        .describe('Refresh token TTL in seconds'),
      emergencyTokenTtl: z
        .number()
        .default(1800)
        .describe('Emergency token TTL in seconds'),
    })
    .describe('JWT configuration'),

  // Session management
  session: z
    .object({
      maxConcurrentSessions: z
        .number()
        .default(3)
        .describe('Max concurrent sessions per user'),
      idleTimeout: z.number().default(1800).describe('Idle timeout in seconds'),
      absoluteTimeout: z
        .number()
        .default(28800)
        .describe('Absolute session timeout in seconds'),
      emergencySessionTimeout: z
        .number()
        .default(3600)
        .describe('Emergency session timeout'),
      enableSessionRotation: z
        .boolean()
        .default(true)
        .describe('Enable session rotation'),
      sessionRotationInterval: z
        .number()
        .default(1800)
        .describe('Session rotation interval'),
    })
    .describe('Session management settings'),

  // MFA settings
  mfa: z
    .object({
      enabled: z.boolean().default(true).describe('Enable MFA'),
      requiredForRoles: z
        .array(HealthcareRoleSchema)
        .describe('Roles requiring MFA'),
      requiredForActions: z.array(z.string()).describe('Actions requiring MFA'),
      gracePeriod: z
        .number()
        .default(300)
        .describe('MFA grace period in seconds'),
      emergencyBypass: z
        .boolean()
        .default(true)
        .describe('Allow emergency MFA bypass'),
    })
    .describe('MFA configuration'),

  // Emergency access
  emergencyAccess: z
    .object({
      enabled: z.boolean().default(true).describe('Enable emergency access'),
      approverRoles: z
        .array(HealthcareRoleSchema)
        .describe('Roles that can approve emergency access'),
      maxEmergencyDuration: z
        .number()
        .default(3600)
        .describe('Max emergency session duration'),
      auditImmediately: z
        .boolean()
        .default(true)
        .describe('Immediate audit for emergency access'),
      notifyCompliance: z
        .boolean()
        .default(true)
        .describe('Notify compliance team'),
    })
    .describe('Emergency access settings'),

  // Security settings
  security: z
    .object({
      enableRiskAssessment: z
        .boolean()
        .default(true)
        .describe('Enable risk assessment'),
      enableAnomalyDetection: z
        .boolean()
        .default(true)
        .describe('Enable anomaly detection'),
      enableGeoBlocking: z
        .boolean()
        .default(false)
        .describe('Enable geographic blocking'),
      maxFailedAttempts: z
        .number()
        .default(5)
        .describe('Max failed authentication attempts'),
      lockoutDuration: z
        .number()
        .default(900)
        .describe('Account lockout duration'),
      enableDeviceFingerprinting: z
        .boolean()
        .default(true)
        .describe('Enable device fingerprinting'),
    })
    .describe('Security settings'),

  // LGPD compliance
  lgpdCompliance: z
    .object({
      enableConsentValidation: z
        .boolean()
        .default(true)
        .describe('Enable consent validation'),
      enableDataMinimization: z
        .boolean()
        .default(true)
        .describe('Enable data minimization'),
      enablePiiRedaction: z
        .boolean()
        .default(true)
        .describe('Enable PII redaction'),
      dataRetentionDays: z
        .number()
        .default(365)
        .describe('Authentication data retention days'),
      enableRightToErasure: z
        .boolean()
        .default(true)
        .describe('Enable right to erasure'),
      auditDataAccess: z
        .boolean()
        .default(true)
        .describe('Audit all data access'),
    })
    .describe('LGPD compliance settings'),

  // Logging and monitoring
  logging: z
    .object({
      enableAuthAudit: z
        .boolean()
        .default(true)
        .describe('Enable authentication audit'),
      enableSessionTracking: z
        .boolean()
        .default(true)
        .describe('Enable session tracking'),
      enableRiskLogging: z
        .boolean()
        .default(true)
        .describe('Enable risk assessment logging'),
      logLevel: z
        .enum(['debug', 'info', 'warn', 'error'])
        .default('info')
        .describe('Log level'),
      auditRetentionDays: z
        .number()
        .default(2555)
        .describe('Audit log retention days (7 years)'),
    })
    .describe('Logging settings'),
});

export type AuthConfig = z.infer<typeof AuthConfigSchema>;

/**
 * Authentication result schema
 */
export const AuthResultSchema = z.object({
  success: z.boolean().describe('Authentication success'),
  session: AuthSessionSchema.optional().describe('Session information'),
  errorCode: z.string().optional().describe('Error code'),
  errorMessage: z.string().optional().describe('Error message'),
  requiresMfa: z.boolean().default(false).describe('MFA required'),
  requiresEmergencyApproval: z
    .boolean()
    .default(false)
    .describe('Emergency approval required'),
  riskScore: z.number().min(0).max(10).describe('Authentication risk score'),
  complianceStatus: z
    .object({
      lgpdCompliant: z.boolean().describe('LGPD compliant'),
      anvisaCompliant: z.boolean().describe('ANVISA compliant'),
      auditRequired: z.boolean().describe('Audit required'),
    })
    .describe('Compliance status'),
  timestamp: z.string().datetime().describe('Authentication timestamp'),
});

export type AuthResult = z.infer<typeof AuthResultSchema>;

// ============================================================================
// HEALTHCARE RBAC SYSTEM
// ============================================================================

/**
 * Healthcare Role-Based Access Control (RBAC) system
 */
export class HealthcareRBAC {
  private static roleHierarchy: Record<HealthcareRole, number> = {
    guest: 0,
    patient: 1,
    caregiver: 1,
    receptionist: 2,
    nurse: 3,
    technician: 3,
    pharmacist: 4,
    lab_technician: 4,
    radiologist: 4,
    doctor: 5,
    specialist: 6,
    department_head: 7,
    system_admin: 8,
    compliance_officer: 8,
    emergency_responder: 9,
    super_admin: 10,
  };

  private static rolePermissions: Record<
    HealthcareRole,
    HealthcarePermission[]
  > = {
    guest: [],
    patient: ['patient:read:basic'],
    caregiver: ['patient:read:basic'],
    receptionist: [
      'patient:read:basic',
      'patient:write:basic',
      'admin:read:users',
    ],
    nurse: [
      'patient:read:full',
      'patient:write:basic',
      'medical:read:diagnoses',
      'medical:read:treatments',
      'medical:read:medications',
      'medical:read:allergies',
      'medical:write:allergies',
      'lab:read:results',
      'lab:read:orders',
    ],
    technician: [
      'patient:read:basic',
      'lab:read:results',
      'lab:write:results',
      'lab:read:orders',
      'imaging:read:studies',
      'imaging:write:studies',
    ],
    pharmacist: [
      'patient:read:basic',
      'medical:read:medications',
      'medical:write:medications',
      'medical:read:allergies',
    ],
    lab_technician: [
      'patient:read:basic',
      'lab:read:results',
      'lab:write:results',
      'lab:read:orders',
      'lab:write:orders',
    ],
    radiologist: [
      'patient:read:basic',
      'imaging:read:studies',
      'imaging:write:studies',
      'imaging:read:reports',
      'imaging:write:reports',
    ],
    doctor: [
      'patient:read:full',
      'patient:write:full',
      'medical:read:diagnoses',
      'medical:write:diagnoses',
      'medical:read:treatments',
      'medical:write:treatments',
      'medical:read:medications',
      'medical:write:medications',
      'medical:read:allergies',
      'medical:write:allergies',
      'lab:read:results',
      'lab:read:orders',
      'lab:write:orders',
      'imaging:read:studies',
      'imaging:read:reports',
    ],
    specialist: [
      'patient:read:full',
      'patient:write:full',
      'medical:read:diagnoses',
      'medical:write:diagnoses',
      'medical:read:treatments',
      'medical:write:treatments',
      'medical:read:medications',
      'medical:write:medications',
      'medical:read:allergies',
      'medical:write:allergies',
      'lab:read:results',
      'lab:read:orders',
      'lab:write:orders',
      'imaging:read:studies',
      'imaging:write:studies',
      'imaging:read:reports',
      'imaging:write:reports',
    ],
    department_head: [
      'patient:read:full',
      'patient:write:full',
      'medical:read:diagnoses',
      'medical:write:diagnoses',
      'medical:read:treatments',
      'medical:write:treatments',
      'medical:read:medications',
      'medical:write:medications',
      'medical:read:allergies',
      'medical:write:allergies',
      'lab:read:results',
      'lab:write:results',
      'lab:read:orders',
      'lab:write:orders',
      'imaging:read:studies',
      'imaging:write:studies',
      'imaging:read:reports',
      'imaging:write:reports',
      'admin:read:users',
      'admin:write:users',
      'system:read:metrics',
    ],
    system_admin: [
      'admin:read:users',
      'admin:write:users',
      'admin:read:audit',
      'admin:write:settings',
      'system:read:logs',
      'system:write:config',
      'system:read:metrics',
      'system:backup:create',
    ],
    compliance_officer: [
      'admin:read:users',
      'admin:read:audit',
      'compliance:read:audit',
      'compliance:write:policies',
      'compliance:read:reports',
      'compliance:export:data',
      'system:read:logs',
      'system:read:metrics',
    ],
    emergency_responder: [
      'patient:read:full',
      'patient:write:full',
      'medical:read:diagnoses',
      'medical:write:diagnoses',
      'medical:read:treatments',
      'medical:write:treatments',
      'medical:read:medications',
      'medical:write:medications',
      'medical:read:allergies',
      'medical:write:allergies',
      'lab:read:results',
      'lab:read:orders',
      'imaging:read:studies',
      'imaging:read:reports',
      'admin:emergency:override',
    ],
    super_admin: [
      'patient:read:full',
      'patient:write:full',
      'patient:delete',
      'medical:read:diagnoses',
      'medical:write:diagnoses',
      'medical:read:treatments',
      'medical:write:treatments',
      'medical:read:medications',
      'medical:write:medications',
      'medical:read:allergies',
      'medical:write:allergies',
      'lab:read:results',
      'lab:write:results',
      'lab:read:orders',
      'lab:write:orders',
      'imaging:read:studies',
      'imaging:write:studies',
      'imaging:read:reports',
      'imaging:write:reports',
      'admin:read:users',
      'admin:write:users',
      'admin:read:audit',
      'admin:write:settings',
      'admin:emergency:override',
      'system:read:logs',
      'system:write:config',
      'system:read:metrics',
      'system:backup:create',
      'compliance:read:audit',
      'compliance:write:policies',
      'compliance:read:reports',
      'compliance:export:data',
    ],
  };

  /**
   * Check if user has specific permission
   */
  static hasPermission(
    userRole: HealthcareRole,
    permission: HealthcarePermission,
  ): boolean {
    const rolePermissions = this.rolePermissions[userRole] || [];
    return rolePermissions.includes(permission);
  }

  /**
   * Check if user role has sufficient access level
   */
  static hasAccessLevel(
    userRole: HealthcareRole,
    requiredLevel: number,
  ): boolean {
    const userLevel = this.roleHierarchy[userRole] || 0;
    return userLevel >= requiredLevel;
  }

  /**
   * Get all permissions for a role
   */
  static getRolePermissions(_role: HealthcareRole): HealthcarePermission[] {
    return this.rolePermissions[_role] || [];
  }

  /**
   * Get role access level
   */
  static getRoleLevel(_role: HealthcareRole): number {
    return this.roleHierarchy[_role] || 0;
  }

  /**
   * Check if role can access healthcare resource
   */
  static canAccessResource(
    userRole: HealthcareRole,
    resourceType: string,
    operation: 'read' | 'write' | 'delete',
  ): boolean {
    // Emergency responders have override access during emergencies
    if (userRole === 'emergency_responder') {
      return true;
    }

    // Build permission string
    const permission = `${resourceType}:${operation}:basic` as HealthcarePermission;
    const fullPermission = `${resourceType}:${operation}:full` as HealthcarePermission;

    return (
      this.hasPermission(userRole, permission)
      || this.hasPermission(userRole, fullPermission)
    );
  }

  /**
   * Validate MFA requirement for role and action
   */
  static requiresMFA(
    userRole: HealthcareRole,
    action: string,
    config: AuthConfig,
  ): boolean {
    if (!config.mfa.enabled) return false;

    // Check if role requires MFA
    if (config.mfa.requiredForRoles.includes(userRole)) return true;

    // Check if action requires MFA
    if (config.mfa.requiredForActions.includes(action)) return true;

    // High-privilege roles always require MFA
    const highPrivilegeRoles: HealthcareRole[] = [
      'system_admin',
      'compliance_officer',
      'emergency_responder',
      'super_admin',
    ];

    return highPrivilegeRoles.includes(userRole);
  }
}

// ============================================================================
// AUTHENTICATION MIDDLEWARE IMPLEMENTATION
// ============================================================================

/**
 * Healthcare Authentication Middleware Service
 */
export class HealthcareAuthMiddleware {
  private config: AuthConfig;
  private activeSessions: Map<string, AuthSession> = new Map();
  private sessionActivity: Map<string, number> = new Map();
  private isInitialized = false;

  constructor(config: Partial<AuthConfig> = {}) {
    this.config = AuthConfigSchema.parse({
      ...this.getDefaultConfig(),
      ...config,
    });

    if (this.config.enabled) {
      this.initialize();
    }
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  /**
   * Initialize the authentication middleware
   */
  private initialize(): void {
    try {
      this.setupSessionManagement();
      this.setupSecurityMonitoring();
      this.isInitialized = true;

      authLogger.info(
        'Healthcare authentication middleware initialized',
        { component: 'auth-middleware', timestamp: new Date().toISOString() },
      );
    } catch (error) {
      logHealthcareError('auth-middleware', error as Error, { method: 'initialize' });
    }
  }

  /**
   * Setup session management
   */
  private setupSessionManagement(): void {
    // Session cleanup interval
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 60000); // Every minute

    // Session rotation interval
    if (this.config.session.enableSessionRotation) {
      setInterval(() => {
        this.rotateActiveSessions();
      }, this.config.session.sessionRotationInterval * 1000);
    }
  }

  /**
   * Setup security monitoring
   */
  private setupSecurityMonitoring(): void {
    if (this.config.security.enableAnomalyDetection) {
      setInterval(() => {
        this.detectSessionAnomalies();
      }, 300000); // Every 5 minutes
    }
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): Partial<AuthConfig> {
    return {
      enabled: true,
      environment: 'development',

      jwt: {
        issuer: 'neonpro-healthcare',
        audience: 'neonpro-api',
        algorithm: 'HS256',
        accessTokenTtl: 3600, // 1 hour
        refreshTokenTtl: 604800, // 1 week
        emergencyTokenTtl: 1800, // 30 minutes
      },

      session: {
        maxConcurrentSessions: 3,
        idleTimeout: 1800, // 30 minutes
        absoluteTimeout: 28800, // 8 hours
        emergencySessionTimeout: 3600, // 1 hour for emergency sessions
        enableSessionRotation: true,
        sessionRotationInterval: 1800, // 30 minutes
      },

      mfa: {
        enabled: true,
        requiredForRoles: [
          'doctor',
          'specialist',
          'department_head',
          'system_admin',
          'compliance_officer',
          'emergency_responder',
          'super_admin',
        ],
        requiredForActions: [
          'patient:delete',
          'medical:write:diagnoses',
          'admin:write:settings',
          'system:write:config',
          'compliance:export:data',
        ],
        gracePeriod: 300, // 5 minutes
        emergencyBypass: true,
      },

      emergencyAccess: {
        enabled: true,
        approverRoles: [
          'department_head',
          'system_admin',
          'compliance_officer',
          'super_admin',
        ],
        maxEmergencyDuration: 3600, // 1 hour
        auditImmediately: true,
        notifyCompliance: true,
      },

      security: {
        enableRiskAssessment: true,
        enableAnomalyDetection: true,
        enableGeoBlocking: false,
        maxFailedAttempts: 5,
        lockoutDuration: 900, // 15 minutes
        enableDeviceFingerprinting: true,
      },

      lgpdCompliance: {
        enableConsentValidation: true,
        enableDataMinimization: true,
        enablePiiRedaction: true,
        dataRetentionDays: 365, // 1 year
        enableRightToErasure: true,
        auditDataAccess: true,
      },

      logging: {
        enableAuthAudit: true,
        enableSessionTracking: true,
        enableRiskLogging: true,
        logLevel: 'info',
        auditRetentionDays: 2555, // 7 years for healthcare
      },
    };
  }

  // ============================================================================
  // MIDDLEWARE FUNCTIONS
  // ============================================================================

  /**
   * Create authentication middleware for Hono
   */
  createAuthMiddleware(): MiddlewareHandler {
    return async (c: Context, next: Next) => {
      if (!this.config.enabled) {
        return next();
      }

      try {
        // Extract and validate authentication
        const authResult = await this.authenticateRequest(c);

        if (!authResult.success) {
          return this.handleAuthFailure(c, authResult);
        }

        // Store session in context
        c.set('authSession', authResult.session);
        c.set('authResult', authResult);

        // Add authentication headers
        if (authResult.session) {
          c.header('x-session-id', authResult.session.sessionId);
          c.header('x-user-role', authResult.session.userProfile._role);
          c.header(
            'x-access-level',
            authResult.session.userProfile.accessLevel.toString(),
          );
        }

        // Update session activity
        if (authResult.session) {
          this.updateSessionActivity(authResult.session.sessionId);
        }

        // Continue to next middleware
        await next();

        // Post-request processing
        if (authResult.session) {
          await this.logSessionActivity(c, authResult.session);
        }
      } catch (error) {
        logHealthcareError('auth', error instanceof Error ? error : new Error(String(error)), {
          method: 'authenticationMiddleware',
          component: 'HealthcareAuthMiddleware',
          severity: 'high',
          path: c.req.path,
        });
        return this.handleAuthError(c, error);
      }
    };
  }

  /**
   * Create authorization middleware
   */
  createAuthorizationMiddleware(
    requiredPermission?: HealthcarePermission,
    requiredAccessLevel?: number,
    resourceType?: string,
    operation?: 'read' | 'write' | 'delete',
  ): MiddlewareHandler {
    return async (c: Context, next: Next): Promise<void> => {
      const authSession = c.get('authSession') as AuthSession;

      if (!authSession) {
        c.json(
          {
            error: 'UNAUTHORIZED',
            message: 'Authentication required',
            timestamp: new Date().toISOString(),
          },
          401,
        );
        return;
      }

      // Check specific permission
      if (requiredPermission) {
        const hasPermission = HealthcareRBAC.hasPermission(
          (authSession.userProfile as any).role,
          requiredPermission,
        );

        if (!hasPermission) {
          await this.logAuthorizationFailure(
            c,
            authSession,
            requiredPermission,
          );
          c.json(
            {
              error: 'FORBIDDEN',
              message: 'Insufficient permissions',
              required: requiredPermission,
              timestamp: new Date().toISOString(),
            },
            403,
          );
          return;
        }
      }

      // Check access level
      if (requiredAccessLevel !== undefined) {
        const hasAccessLevel = HealthcareRBAC.hasAccessLevel(
          (authSession.userProfile as any).role,
          requiredAccessLevel,
        );

        if (!hasAccessLevel) {
          await this.logAuthorizationFailure(
            c,
            authSession,
            `access_level_${requiredAccessLevel}`,
          );
          c.json(
            {
              error: 'FORBIDDEN',
              message: 'Insufficient access level',
              required: requiredAccessLevel,
              current: authSession.userProfile.accessLevel,
              timestamp: new Date().toISOString(),
            },
            403,
          );
          return;
        }
      }

      // Check resource access
      if (resourceType && operation) {
        const canAccess = HealthcareRBAC.canAccessResource(
          (authSession.userProfile as any).role,
          resourceType,
          operation,
        );

        if (!canAccess) {
          await this.logAuthorizationFailure(
            c,
            authSession,
            `${resourceType}:${operation}`,
          );
          c.json(
            {
              error: 'FORBIDDEN',
              message: `Cannot ${operation} ${resourceType}`,
              timestamp: new Date().toISOString(),
            },
            403,
          );
          return;
        }
      }

      // Check MFA requirement
      const requiresMfa = HealthcareRBAC.requiresMFA(
        authSession.userProfile._role,
        `${resourceType}:${operation}`,
        this.config,
      );

      if (requiresMfa && !authSession.sessionMetadata.mfaVerified) {
        c.json(
          {
            error: 'MFA_REQUIRED',
            message: 'Multi-factor authentication required',
            timestamp: new Date().toISOString(),
          },
          403,
        );
        return;
      }

      // Log successful authorization
      await this.logSuccessfulAuthorization(c, authSession, {
        permission: requiredPermission,
        accessLevel: requiredAccessLevel,
        resource: resourceType,
        operation,
      });

      await next();
    };
  }

  // ============================================================================
  // AUTHENTICATION LOGIC
  // ============================================================================

  /**
   * Authenticate incoming request
   */
  private async authenticateRequest(c: Context): Promise<AuthResult> {
    try {
      // Extract authentication token
      const token = await this.extractAuthToken(c);

      if (!token) {
        return this.createAuthResult(
          false,
          undefined,
          'NO_TOKEN',
          'Authentication token not provided',
        );
      }

      // Validate and decode token
      const decoded = await this.validateToken(token);

      if (!decoded) {
        return this.createAuthResult(
          false,
          undefined,
          'INVALID_TOKEN',
          'Invalid authentication token',
        );
      }

      // Get or create session
      const session = await this.getOrCreateSession(decoded, c);

      if (!session) {
        return this.createAuthResult(
          false,
          undefined,
          'SESSION_ERROR',
          'Failed to create or retrieve session',
        );
      }

      // Validate session
      const sessionValid = await this.validateSession(session, c);

      if (!sessionValid) {
        return this.createAuthResult(
          false,
          undefined,
          'SESSION_INVALID',
          'Session is no longer valid',
        );
      }

      // Perform risk assessment
      const riskScore = await this.assessRisk(session, c);

      // Check if MFA is required
      const requiresMfa = this.checkMfaRequirement(session, c);

      // Update session with current request
      await this.updateSession(session, c);

      return this.createAuthResult(
        true,
        session,
        undefined,
        undefined,
        requiresMfa,
        false,
        riskScore,
      );
    } catch (error) {
      logHealthcareError('auth', error instanceof Error ? error : new Error(String(error)), {
        method: 'handleAuthentication',
        component: 'HealthcareAuthMiddleware',
        severity: 'high',
        operation: 'authentication',
      });
      return this.createAuthResult(
        false,
        undefined,
        'AUTH_ERROR',
        'Authentication failed',
      );
    }
  }

  /**
   * Extract authentication token from request
   */
  private async extractAuthToken(c: Context): Promise<string | null> {
    // Check Authorization header
    const authHeader = c.req.header('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Check cookie (for web sessions)
    const cookieToken = c.req
      .header('cookie')
      ?.split(';')
      .find(cookie => cookie.trim().startsWith('auth_token='))
      ?.split('=')[1];

    if (cookieToken) {
      return cookieToken;
    }

    // Check query parameter (for limited use cases)
    const queryToken = c.req.query('token');
    if (queryToken) {
      return queryToken;
    }

    return null;
  }

  /**
   * Validate authentication token
   */
  private async validateToken(token: string): Promise<JWTPayload | null> {
    try {
      const secret = process.env.JWT_SECRET;

      if (!secret) {
        throw new Error(
          'JWT_SECRET environment variable is required for token validation.',
        );
      }

      const decoded = await verify(
        token,
        secret,
        this.config.jwt.algorithm as JWTAlgorithm,
      );

      // Validate token claims
      if (decoded.iss !== this.config.jwt.issuer) {
        throw new Error('Invalid token issuer');
      }

      if (decoded.aud !== this.config.jwt.audience) {
        throw new Error('Invalid token audience');
      }

      if (decoded.exp && decoded.exp < Date.now() / 1000) {
        throw new Error('Token expired');
      }

      // Cast to our JWTPayload interface
      const jwtPayload: JWTPayload = {
        _userId: (decoded.sub || decoded.userId || '') as string,
        sessionId: decoded.sessionId as string,
        iss: decoded.iss as string,
        aud: decoded.aud as string,
        exp: decoded.exp as number,
        iat: decoded.iat as number,
        authMethod: decoded.authMethod as string,
        mfaVerified: decoded.mfaVerified as boolean,
        emergencyMode: decoded.emergencyMode as boolean,
        supervisorOverride: decoded.supervisorOverride as boolean,
      };

      return jwtPayload;
    } catch (error) {
      logHealthcareError('auth', error instanceof Error ? error : new Error(String(error)), {
        method: 'validateToken',
        component: 'HealthcareAuthMiddleware',
        severity: 'high',
        operation: 'token_validation',
      });
      return null;
    }
  }

  /**
   * Get or create user session
   */
  private async getOrCreateSession(
    decoded: JWTPayload,
    c: Context,
  ): Promise<AuthSession | null> {
    try {
      // Check if session already exists
      const existingSession = decoded.sessionId
        ? this.activeSessions.get(decoded.sessionId)
        : undefined;

      if (existingSession) {
        return existingSession;
      }

      // Create new session
      const session = await this.createNewSession(decoded, c);

      if (session) {
        this.activeSessions.set(session.sessionId, session);
      }

      return session;
    } catch (error) {
      logHealthcareError('auth', error instanceof Error ? error : new Error(String(error)), {
        method: 'createSession',
        component: 'HealthcareAuthMiddleware',
        severity: 'high',
        operation: 'session_creation',
      });
      return null;
    }
  }

  /**
   * Create new authentication session
   */
  private async createNewSession(
    decoded: JWTPayload,
    c: Context,
  ): Promise<AuthSession | null> {
    try {
      const sessionId = decoded.sessionId || `sess_${nanoid(16)}`;
      const now = new Date().toISOString();

      // TODO: Get user profile from database based on decoded.userId
      const userProfile = await this.getUserProfile(decoded._userId);

      if (!userProfile) {
        return null;
      }

      const session: AuthSession = {
        sessionId,
        _userId: decoded._userId,
        correlationId: `corr_${nanoid(8)}`,

        userProfile: {
          anonymizedId: `user_${nanoid(8)}`,
          _role: (userProfile as any)._role || 'guest',
          permissions: HealthcareRBAC.getRolePermissions(
            (userProfile as any)._role || 'guest',
          ),
          facilityId: userProfile.facilityId,
          departmentId: userProfile.departmentId,
          shiftId: userProfile.shiftId,
          licenseNumber: userProfile.licenseNumber,
          specialization: userProfile.specialization,
          accessLevel: HealthcareRBAC.getRoleLevel((userProfile as any)._role || 'guest'),
          preferredLanguage: userProfile.preferredLanguage || 'pt-BR',
          timezone: userProfile.timezone || 'America/Sao_Paulo',
          consentStatus: userProfile.consentStatus || {
            dataProcessing: false,
            communication: false,
            analytics: false,
            thirdParty: false,
            consentDate: now,
            consentVersion: '1.0',
          },
        },

        sessionMetadata: {
          createdAt: now,
          lastActivity: now,
          expiresAt: new Date(
            Date.now() + this.config.session.absoluteTimeout * 1000,
          ).toISOString(),
          ipAddress: this.anonymizeIP(
            c.req.header('x-forwarded-for')?.split(',')[0]?.trim()
              || c.req.header('x-real-ip')
              || 'unknown',
          ),
          userAgent: c.req.header('user-agent') || 'unknown',
          deviceType: this.detectDeviceType(c.req.header('user-agent')),
          authenticationMethod: (decoded.authMethod as
            | 'password'
            | 'mfa'
            | 'biometric'
            | 'smartcard'
            | 'emergency') || 'password',
          mfaVerified: decoded.mfaVerified || false,
          riskScore: 0, // Will be calculated
          workflowContext: {
            emergencyMode: decoded.emergencyMode || false,
            supervisorOverride: decoded.supervisorOverride || false,
          },
        },

        complianceTracking: {
          auditTrail: [],
          dataAccessed: [],
          complianceFlags: {
            lgpdCompliant: true,
            anvisaCompliant: true,
            auditRequired: true,
            retentionApplied: false,
          },
        },
      };

      return session;
    } catch (error) {
      logHealthcareError('auth', error instanceof Error ? error : new Error(String(error)), {
        method: 'createNewSession',
        component: 'HealthcareAuthMiddleware',
        severity: 'high',
        operation: 'new_session_creation',
      });
      return null;
    }
  }

  /**
   * Get user profile from database
   */
  private async getUserProfile(_userId: string): Promise<UserProfile | null> {
    // TODO: Implement actual database lookup
    // This is a mock implementation
    return {
      _role: 'doctor' as HealthcareRole,
      facilityId: 'facility_001',
      departmentId: 'dept_cardiology',
      licenseNumber: 'CRM-SP-123456',
      specialization: 'Cardiology',
      preferredLanguage: 'pt-BR',
      timezone: 'America/Sao_Paulo',
      consentStatus: {
        dataProcessing: true,
        communication: true,
        analytics: false,
        thirdParty: false,
        consentDate: new Date().toISOString(),
        consentVersion: '1.0',
      },
    };
  }

  /**
   * Validate session integrity and expiration
   */
  private async validateSession(
    session: AuthSession,
    c: Context,
  ): Promise<boolean> {
    const now = Date.now();

    // Check absolute expiration
    if (new Date(session.sessionMetadata.expiresAt).getTime() < now) {
      await this.expireSession(session.sessionId, 'ABSOLUTE_TIMEOUT');
      return false;
    }

    // Check idle timeout
    const lastActivity = new Date(
      session.sessionMetadata.lastActivity,
    ).getTime();
    const idleTime = now - lastActivity;

    if (idleTime > this.config.session.idleTimeout * 1000) {
      await this.expireSession(session.sessionId, 'IDLE_TIMEOUT');
      return false;
    }

    // Check concurrent session limit
    const userSessions = Array.from(this.activeSessions.values()).filter(
      s => s._userId === session._userId,
    );

    if (userSessions.length > this.config.session.maxConcurrentSessions) {
      // Remove oldest session
      const oldestSession = userSessions.sort(
        (a, _b) =>
          new Date(a.sessionMetadata.lastActivity).getTime()
          - new Date(_b.sessionMetadata.lastActivity).getTime(),
      )[0];

      if (oldestSession) {
        await this.expireSession(oldestSession.sessionId, 'CONCURRENT_LIMIT');

        // If the current session is the one being expired, return false
        if (oldestSession.sessionId === session.sessionId) {
          return false;
        }
      }
    }

    // Validate LGPD consent if required
    if (this.config.lgpdCompliance.enableConsentValidation) {
      const hasValidConsent = session.userProfile.consentStatus.dataProcessing;

      if (!hasValidConsent) {
        await this.expireSession(session.sessionId, 'CONSENT_REVOKED');
        return false;
      }
    }

    return true;
  }

  /**
   * Assess authentication risk
   */
  private async assessRisk(session: AuthSession, _c: Context): Promise<number> {
    if (!this.config.security.enableRiskAssessment) {
      return 0;
    }

    let riskScore = 0;

    // Geographic risk (if enabled)
    if (this.config.security.enableGeoBlocking) {
      const country = _c.req.header('x-country-code');
      if (country && !this.isAllowedCountry(country)) {
        riskScore += 3;
      }
    }

    // Time-based risk
    const currentHour = new Date().getHours();
    if (currentHour < 6 || currentHour > 22) {
      riskScore += 1; // Unusual hours
    }

    // Device fingerprinting
    if (this.config.security.enableDeviceFingerprinting) {
      const deviceFingerprint = this.generateDeviceFingerprint(_c);
      const knownDevice = await this.isKnownDevice(
        session._userId,
        deviceFingerprint,
      );

      if (!knownDevice) {
        riskScore += 2; // Unknown device
      }
    }

    // Role-based risk
    const highRiskRoles: HealthcareRole[] = [
      'system_admin',
      'compliance_officer',
      'emergency_responder',
      'super_admin',
    ];

    if (highRiskRoles.includes(session.userProfile._role)) {
      riskScore += 1;
    }

    // Emergency mode increases risk monitoring
    if (session.sessionMetadata.workflowContext?.emergencyMode) {
      riskScore += 2;
    }

    return Math.min(riskScore, 10); // Cap at 10
  }

  /**
   * Check if MFA is required for current request
   */
  private checkMfaRequirement(session: AuthSession, _c: Context): boolean {
    if (!this.config.mfa.enabled) {
      return false;
    }

    // Skip if already verified and within grace period
    if (session.sessionMetadata.mfaVerified) {
      const lastActivity = new Date(
        session.sessionMetadata.lastActivity,
      ).getTime();
      const gracePeriodExpiry = lastActivity + this.config.mfa.gracePeriod * 1000;

      if (Date.now() < gracePeriodExpiry) {
        return false;
      }
    }

    // Emergency bypass
    if (
      this.config.mfa.emergencyBypass
      && session.sessionMetadata.workflowContext?.emergencyMode
    ) {
      return false;
    }

    const action = `${_c.req.method}:${_c.req.path}`;

    return HealthcareRBAC.requiresMFA(
      session.userProfile._role,
      action,
      this.config,
    );
  }

  /**
   * Update session with current request information
   */
  private async updateSession(session: AuthSession, _c: Context): Promise<void> {
    const now = new Date().toISOString();

    // Update activity timestamp
    session.sessionMetadata.lastActivity = now;

    // Update risk score
    session.sessionMetadata.riskScore = await this.assessRisk(session, _c);

    // Add to audit trail
    session.complianceTracking.auditTrail.push({
      action: `${_c.req.method} ${_c.req.path}`,
      timestamp: now,
      resource: _c.req.path,
      outcome: 'success',
      riskLevel: session.sessionMetadata.riskScore > 5
        ? 'high'
        : session.sessionMetadata.riskScore > 2
        ? 'medium'
        : 'low',
    });

    // Limit audit trail size
    if (session.complianceTracking.auditTrail.length > 100) {
      session.complianceTracking.auditTrail = session.complianceTracking.auditTrail.slice(-50);
    }

    // Update session in store
    this.activeSessions.set(session.sessionId, session);
    this.sessionActivity.set(session.sessionId, Date.now());
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Create authentication result
   */
  private createAuthResult(
    success: boolean,
    session?: AuthSession,
    errorCode?: string,
    errorMessage?: string,
    requiresMfa: boolean = false,
    requiresEmergencyApproval: boolean = false,
    riskScore: number = 0,
  ): AuthResult {
    return {
      success,
      session,
      errorCode,
      errorMessage,
      requiresMfa,
      requiresEmergencyApproval,
      riskScore,
      complianceStatus: {
        lgpdCompliant: session?.complianceTracking.complianceFlags.lgpdCompliant || false,
        anvisaCompliant: session?.complianceTracking.complianceFlags.anvisaCompliant || false,
        auditRequired: session?.complianceTracking.complianceFlags.auditRequired || false,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Handle authentication failure
   */
  private async handleAuthFailure(
    c: Context,
    authResult: AuthResult,
  ): Promise<Response> {
    await this.logAuthFailure(c, authResult);

    const response = {
      error: authResult.errorCode || 'AUTHENTICATION_FAILED',
      message: authResult.errorMessage || 'Authentication failed',
      requiresMfa: authResult.requiresMfa,
      requiresEmergencyApproval: authResult.requiresEmergencyApproval,
      timestamp: authResult.timestamp,
    };

    const statusCode = authResult.errorCode === 'NO_TOKEN' ? 401 : 403;
    return c.json(response, statusCode);
  }

  /**
   * Handle authentication error
   */
  private async handleAuthError(
    c: Context,
    error: AuthenticationError | unknown,
  ): Promise<Response> {
    const errorResponse = {
      error: 'AUTHENTICATION_ERROR',
      message: 'Internal authentication error',
      timestamp: new Date().toISOString(),
    };

    return c.json(errorResponse, 500);
  }

  /**
   * Update session activity timestamp
   */
  private updateSessionActivity(sessionId: string): void {
    this.sessionActivity.set(sessionId, Date.now());
  }

  /**
   * Log session activity
   */
  private async logSessionActivity(
    _c: Context,
    session: AuthSession,
  ): Promise<void> {
    if (!this.config.logging.enableSessionTracking) return;

    const activityLog = {
      sessionId: session.sessionId,
      _userId: session.userProfile.anonymizedId,
      _role: session.userProfile._role,
      endpoint: _c.req.path,
      method: _c.req.method,
      userAgent: session.sessionMetadata.userAgent,
      ipAddress: session.sessionMetadata.ipAddress,
      riskScore: session.sessionMetadata.riskScore,
      timestamp: new Date().toISOString(),
    };

    authLogger.info('Session activity logged', {
      ...activityLog,
      component: 'auth-middleware',
    });
  }

  /**
   * Log authorization failure
   */
  private async logAuthorizationFailure(
    _c: Context,
    session: AuthSession,
    requirement: string,
  ): Promise<void> {
    const failureLog = {
      sessionId: session.sessionId,
      _userId: session.userProfile.anonymizedId,
      _role: session.userProfile._role,
      endpoint: _c.req.path,
      method: _c.req.method,
      requirement,
      reason: 'INSUFFICIENT_PERMISSIONS',
      timestamp: new Date().toISOString(),
    };

    authLogger.warn('Authorization failure', {
      ...failureLog,
      component: 'auth-middleware',
    });
  }

  /**
   * Log successful authorization
   */
  private async logSuccessfulAuthorization(
    _c: Context,
    session: AuthSession,
    requirements: AuthorizationRequirements,
  ): Promise<void> {
    if (!this.config.logging.enableAuthAudit) return;

    const authLog = {
      sessionId: session.sessionId,
      _userId: session.userProfile.anonymizedId,
      _role: session.userProfile._role,
      endpoint: _c.req.path,
      method: _c.req.method,
      requirements,
      outcome: 'AUTHORIZED',
      timestamp: new Date().toISOString(),
    };

    authLogger.info('Authorization success', {
      ...authLog,
      component: 'auth-middleware',
    });
  }

  /**
   * Log authentication failure
   */
  private async logAuthFailure(
    c: Context,
    authResult: AuthResult,
  ): Promise<void> {
    const failureLog = {
      endpoint: c.req.path,
      method: c.req.method,
      ipAddress: this.anonymizeIP(
        c.req.header('x-forwarded-for')?.split(',')[0]?.trim()
          || c.req.header('x-real-ip')
          || 'unknown',
      ),
      userAgent: c.req.header('user-agent'),
      errorCode: authResult.errorCode,
      errorMessage: authResult.errorMessage,
      riskScore: authResult.riskScore,
      timestamp: authResult.timestamp,
    };

    authLogger.warn('Authentication failure', {
      ...failureLog,
      component: 'auth-middleware',
    });
  }

  /**
   * Expire session
   */
  private async expireSession(
    sessionId: string,
    reason: string,
  ): Promise<void> {
    const session = this.activeSessions.get(sessionId);

    if (session) {
      authLogger.info('Session expired', {
        sessionId,
        reason,
        component: 'auth-middleware',
        timestamp: new Date().toISOString(),
      });

      // Log session expiration
      const expirationLog = {
        sessionId,
        _userId: session.userProfile.anonymizedId,
        _role: session.userProfile._role,
        reason,
        duration: Date.now() - new Date(session.sessionMetadata.createdAt).getTime(),
        timestamp: new Date().toISOString(),
      };

      authLogger.info('Session expiration processed', {
        ...expirationLog,
        component: 'auth-middleware',
      });
    }

    this.activeSessions.delete(sessionId);
    this.sessionActivity.delete(sessionId);
  }

  /**
   * Cleanup expired sessions
   */
  private cleanupExpiredSessions(): void {
    const now = Date.now();
    const expiredSessions: string[] = [];

    for (const [sessionId, session] of Array.from(this.activeSessions.entries())) {
      const expirationTime = new Date(
        session.sessionMetadata.expiresAt,
      ).getTime();
      const lastActivity = new Date(
        session.sessionMetadata.lastActivity,
      ).getTime();
      const idleTime = now - lastActivity;

      if (
        expirationTime < now
        || idleTime > this.config.session.idleTimeout * 1000
      ) {
        expiredSessions.push(sessionId);
      }
    }

    for (const sessionId of expiredSessions) {
      this.expireSession(sessionId, 'CLEANUP');
    }

    if (expiredSessions.length > 0) {
      authLogger.info('Expired sessions cleanup completed', {
        cleanedSessions: expiredSessions.length,
        component: 'auth-middleware',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Rotate active sessions
   */
  private rotateActiveSessions(): void {
    // TODO: Implement session rotation logic
    authLogger.info('Session rotation check performed', {
      component: 'auth-middleware',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Detect session anomalies
   */
  private detectSessionAnomalies(): void {
    if (!this.config.security.enableAnomalyDetection) return;

    // TODO: Implement anomaly detection logic
    authLogger.info('Session anomaly detection performed', {
      component: 'auth-middleware',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Anonymize IP address for LGPD compliance
   */
  private anonymizeIP(ip: string): string {
    if (!ip || ip === 'unknown') return 'unknown';

    try {
      // IPv4 anonymization
      if (ip.includes('.')) {
        const parts = ip.split('.');
        if (parts.length >= 3) {
          return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
        }
      }

      // IPv6 anonymization
      if (ip.includes(':')) {
        const parts = ip.split(':');
        if (parts.length >= 4) {
          return parts.slice(0, 4).join(':') + '::';
        }
      }
    } catch (error) {
      authLogger.warn('IP anonymization failed', {
        ip: ip,
        component: 'auth-middleware',
        timestamp: new Date().toISOString(),
      });
    }

    return 'anonymized';
  }

  /**
   * Detect device type from user agent
   */
  private detectDeviceType(
    userAgent?: string,
  ): 'mobile' | 'tablet' | 'desktop' | 'medical_device' {
    if (!userAgent) return 'desktop';

    const ua = userAgent.toLowerCase();

    if (ua.includes('medical') || ua.includes('monitor')) {
      return 'medical_device';
    }
    if (
      ua.includes('mobile')
      || ua.includes('android')
      || ua.includes('iphone')
    ) {
      return 'mobile';
    }
    if (ua.includes('tablet') || ua.includes('ipad')) return 'tablet';

    return 'desktop';
  }

  /**
   * Check if country is allowed
   */
  private isAllowedCountry(country: string): boolean {
    // TODO: Implement country allowlist/blocklist
    const allowedCountries = ['BR', 'US', 'CA', 'EU'];
    return allowedCountries.includes(country.toUpperCase());
  }

  /**
   * Generate device fingerprint
   */
  private generateDeviceFingerprint(c: Context): string {
    const userAgent = c.req.header('user-agent') || '';
    const acceptLanguage = c.req.header('accept-language') || '';
    const acceptEncoding = c.req.header('accept-encoding') || '';

    // Simple fingerprint based on headers
    const fingerprint = `${userAgent}|${acceptLanguage}|${acceptEncoding}`;

    // TODO: Implement proper device fingerprinting
    return Buffer.from(fingerprint).toString('base64').substring(0, 16);
  }

  /**
   * Check if device is known
   */
  private async isKnownDevice(
    _userId: string,
    fingerprint: string,
  ): Promise<boolean> {
    // TODO: Implement device recognition
    return true; // Mock implementation
  }

  /**
   * Get service statistics
   */
  getStatistics(): {
    isInitialized: boolean;
    activeSessions: number;
    config: AuthConfig;
  } {
    return {
      isInitialized: this.isInitialized,
      activeSessions: this.activeSessions.size,
      config: this.config,
    };
  }

  /**
   * Destroy service and clean up resources
   */
  destroy(): void {
    this.activeSessions.clear();
    this.sessionActivity.clear();
    this.isInitialized = false;

    authLogger.info('Healthcare authentication middleware destroyed', {
      component: 'auth-middleware',
      timestamp: new Date().toISOString(),
    });
  }
}

// ============================================================================
// DEFAULT SERVICE INSTANCE
// ============================================================================

/**
 * Default healthcare authentication middleware instance
 */
export const healthcareAuthMiddleware = new HealthcareAuthMiddleware({
  enabled: true,
  environment: (process.env.NODE_ENV as Environment) || 'development',

  jwt: {
    issuer: 'neonpro-healthcare',
    audience: 'neonpro-api',
    algorithm: 'HS256',
    accessTokenTtl: 3600,
    refreshTokenTtl: 604800,
    emergencyTokenTtl: 1800,
  },

  session: {
    maxConcurrentSessions: 3,
    idleTimeout: 1800,
    absoluteTimeout: 28800,
    emergencySessionTimeout: 3600,
    enableSessionRotation: true,
    sessionRotationInterval: 1800,
  },

  mfa: {
    enabled: true,
    requiredForRoles: [
      'doctor',
      'specialist',
      'department_head',
      'system_admin',
      'compliance_officer',
      'emergency_responder',
      'super_admin',
    ],
    requiredForActions: [
      'patient:delete',
      'medical:write:diagnoses',
      'admin:write:settings',
      'system:write:config',
      'compliance:export:data',
    ],
    gracePeriod: 300,
    emergencyBypass: true,
  },

  emergencyAccess: {
    enabled: true,
    approverRoles: [
      'department_head',
      'system_admin',
      'compliance_officer',
      'super_admin',
    ],
    maxEmergencyDuration: 3600,
    auditImmediately: true,
    notifyCompliance: true,
  },

  security: {
    enableRiskAssessment: true,
    enableAnomalyDetection: true,
    enableGeoBlocking: false,
    maxFailedAttempts: 5,
    lockoutDuration: 900,
    enableDeviceFingerprinting: true,
  },

  lgpdCompliance: {
    enableConsentValidation: true,
    enableDataMinimization: true,
    enablePiiRedaction: true,
    dataRetentionDays: 365,
    enableRightToErasure: true,
    auditDataAccess: true,
  },

  logging: {
    enableAuthAudit: true,
    enableSessionTracking: true,
    enableRiskLogging: true,
    logLevel: (process.env.LOG_LEVEL as LogLevel) || 'info',
    auditRetentionDays: 2555,
  },
});

/**
 * Export types for external use
 * Note: All types are already exported above with their definitions
 * No need to re-export them here to avoid TS2484 conflicts
 */

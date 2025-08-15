/**
 * NeonPro Healthcare RBAC Middleware
 * AUTH-02 Implementation - API Route Protection with Healthcare Context
 *
 * Features:
 * - API route protection with permission validation
 * - Healthcare-specific access control
 * - CFM compliance verification
 * - Emergency override support
 * - Comprehensive audit logging
 * - Multi-clinic/franchise support
 * - Performance optimized with caching
 */

import { type CookieOptions, createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import type { HealthcareRole, MedicalSpecialty } from '@/lib/auth/permissions';
import {
  HealthcareRBACEngine,
  type PermissionCheckResult,
  type UserRoleContext,
} from '@/lib/auth/rbac';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface RBACMiddlewareOptions {
  /** Required permissions (all must be satisfied) */
  permissions: string[];

  /** Alternative permissions (any can be satisfied) */
  alternativePermissions?: string[];

  /** Allow emergency override for clinical staff */
  allowEmergencyOverride?: boolean;

  /** Require specific medical specialty */
  requiredSpecialty?: MedicalSpecialty;

  /** Require active medical license */
  requireMedicalLicense?: boolean;

  /** Require CFM registration */
  requireCFMRegistration?: boolean;

  /** Custom context extractor */
  contextExtractor?: (request: NextRequest) => Promise<{
    clinicId?: string;
    patientId?: string;
    resourceId?: string;
  }>;

  /** Custom error handler */
  errorHandler?: (
    error: RBACError,
    request: NextRequest
  ) => Promise<NextResponse>;

  /** Audit log additional data */
  auditMetadata?: Record<string, any>;
}

interface RBACError {
  code: string;
  message: string;
  statusCode: number;
  details?: Record<string, any>;
  userRole?: HealthcareRole;
  requiredPermissions?: string[];
  failedChecks?: string[];
}

interface RBACContext {
  user: any;
  userContext: UserRoleContext;
  permissions: PermissionCheckResult[];
  clinicId?: string;
  patientId?: string;
  resourceId?: string;
  emergencyOverride?: boolean;
}

// ============================================================================
// RBAC MIDDLEWARE CLASS
// ============================================================================

/**
 * Healthcare RBAC Middleware for API Protection
 */
export class HealthcareRBACMiddleware {
  private readonly rbacEngine: HealthcareRBACEngine;
  private readonly supabase: any;

  constructor() {
    // Initialize Supabase client
    this.supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get: (_name: string) => {},
          set: (_name: string, _value: string, _options: CookieOptions) => {},
          remove: (_name: string, _options: CookieOptions) => {},
        },
      }
    );

    this.rbacEngine = new HealthcareRBACEngine(this.supabase);
  }

  /**
   * Create RBAC middleware for API route protection
   */
  protect(options: RBACMiddlewareOptions) {
    return async (request: NextRequest): Promise<NextResponse | undefined> => {
      try {
        // Extract authentication token
        const authResult = await this.extractAuthentication(request);
        if (!authResult.success) {
          return this.createErrorResponse(authResult.error!, request);
        }

        const { user } = authResult;

        // Get user role context
        const userContext = await this.getUserRoleContext(user.id);
        if (!userContext) {
          return this.createErrorResponse(
            {
              code: 'USER_CONTEXT_NOT_FOUND',
              message: 'User role context not found',
              statusCode: 403,
              details: { userId: user.id },
            },
            request
          );
        }

        // Extract request context
        const requestContext = options.contextExtractor
          ? await options.contextExtractor(request)
          : await this.extractDefaultContext(request);

        // Check emergency override
        const emergencyOverride = this.checkEmergencyOverride(request);
        if (emergencyOverride && options.allowEmergencyOverride) {
          await this.logEmergencyOverride(
            user.id,
            options.permissions,
            requestContext,
            request
          );
        }

        // Validate healthcare requirements
        const healthcareValidation = await this.validateHealthcareRequirements(
          userContext,
          options
        );
        if (!healthcareValidation.valid) {
          return this.createErrorResponse(healthcareValidation.error!, request);
        }

        // Check permissions
        const permissionResults = await this.checkPermissions(
          user.id,
          options,
          { ...requestContext, emergencyOverride }
        );

        const hasRequiredPermissions = permissionResults.every(
          (result) => result.granted
        );
        const hasAlternativePermissions = options.alternativePermissions
          ? await this.checkAlternativePermissions(
              user.id,
              options.alternativePermissions,
              { ...requestContext, emergencyOverride }
            )
          : false;

        if (!(hasRequiredPermissions || hasAlternativePermissions)) {
          const failedPermissions = permissionResults
            .filter((result) => !result.granted)
            .map((result) => result.permission);

          return this.createErrorResponse(
            {
              code: 'INSUFFICIENT_PERMISSIONS',
              message: 'Insufficient permissions for this operation',
              statusCode: 403,
              userRole: userContext.role,
              requiredPermissions: options.permissions,
              failedChecks: failedPermissions,
              details: {
                userId: user.id,
                userRole: userContext.role,
                requiredPermissions: options.permissions,
                failedPermissions,
                context: requestContext,
              },
            },
            request
          );
        }

        // Log successful access
        await this.logSuccessfulAccess(
          user.id,
          options.permissions,
          requestContext,
          request,
          options.auditMetadata
        );

        // Add RBAC context to request headers for downstream use
        const rbacContext: RBACContext = {
          user,
          userContext,
          permissions: permissionResults,
          ...requestContext,
          emergencyOverride,
        };

        const requestWithContext = new NextRequest(request.url, {
          ...request,
          headers: new Headers(request.headers),
        });

        requestWithContext.headers.set(
          'x-rbac-context',
          Buffer.from(JSON.stringify(rbacContext)).toString('base64')
        );

        return;
      } catch (error) {
        console.error('RBAC Middleware error:', error);

        return this.createErrorResponse(
          {
            code: 'RBAC_MIDDLEWARE_ERROR',
            message: 'Internal error during permission validation',
            statusCode: 500,
            details: {
              error: error instanceof Error ? error.message : 'Unknown error',
            },
          },
          request
        );
      }
    };
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Extract authentication from request
   */
  private async extractAuthentication(request: NextRequest): Promise<{
    success: boolean;
    user?: any;
    error?: RBACError;
  }> {
    try {
      // Extract token from Authorization header or cookie
      const authHeader = request.headers.get('authorization');
      const cookieHeader = request.headers.get('cookie');

      let token: string | null = null;

      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      } else if (cookieHeader) {
        // Extract from supabase session cookie
        const cookies = cookieHeader.split(';').reduce(
          (acc, cookie) => {
            const [name, value] = cookie.trim().split('=');
            acc[name] = value;
            return acc;
          },
          {} as Record<string, string>
        );

        token = cookies['sb-access-token'] || cookies['supabase-auth-token'];
      }

      if (!token) {
        return {
          success: false,
          error: {
            code: 'NO_AUTH_TOKEN',
            message: 'No authentication token provided',
            statusCode: 401,
          },
        };
      }

      // Verify token with Supabase
      const {
        data: { user },
        error,
      } = await this.supabase.auth.getUser(token);

      if (error || !user) {
        return {
          success: false,
          error: {
            code: 'INVALID_AUTH_TOKEN',
            message: 'Invalid or expired authentication token',
            statusCode: 401,
            details: { error: error?.message },
          },
        };
      }

      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'AUTH_EXTRACTION_ERROR',
          message: 'Error extracting authentication',
          statusCode: 500,
          details: {
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        },
      };
    }
  }

  /**
   * Get user role context from database
   */
  private async getUserRoleContext(
    userId: string
  ): Promise<UserRoleContext | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_roles')
        .select(`
          *,
          medical_licenses (
            license_number,
            cfm_number,
            specialty,
            additional_specialties,
            active,
            expires_at
          )
        `)
        .eq('user_id', userId)
        .eq('active', true)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        user_id: data.user_id,
        role: data.role as HealthcareRole,
        clinic_id: data.clinic_id,
        franchise_id: data.franchise_id,
        medical_license: data.medical_licenses?.license_number || null,
        cfm_number: data.medical_licenses?.cfm_number || null,
        medical_specialty:
          (data.medical_licenses?.specialty as MedicalSpecialty) || null,
        license_expiry: data.medical_licenses?.expires_at
          ? new Date(data.medical_licenses.expires_at)
          : null,
        license_active: data.medical_licenses?.active,
        additional_specialties:
          data.medical_licenses?.additional_specialties || [],
        certifications: data.certifications || [],
        active: data.active,
        temporary_access: data.temporary_access,
        emergency_access: data.emergency_access,
        access_granted_at: new Date(data.access_granted_at),
        access_expires_at: data.access_expires_at
          ? new Date(data.access_expires_at)
          : undefined,
        granted_by: data.granted_by,
        last_validated: new Date(data.last_validated),
        validation_required: data.validation_required,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
      };
    } catch (error) {
      console.error('Get user role context error:', error);
      return null;
    }
  }

  /**
   * Extract default context from request
   */
  private async extractDefaultContext(request: NextRequest): Promise<{
    clinicId?: string;
    patientId?: string;
    resourceId?: string;
  }> {
    const url = new URL(request.url);
    const { searchParams, pathname } = url;

    // Extract from query parameters
    const clinicId =
      searchParams.get('clinicId') ||
      request.headers.get('x-clinic-id') ||
      undefined;
    const patientId =
      searchParams.get('patientId') ||
      request.headers.get('x-patient-id') ||
      undefined;
    const resourceId =
      searchParams.get('resourceId') ||
      request.headers.get('x-resource-id') ||
      undefined;

    // Extract from URL path parameters
    const pathParts = pathname.split('/');
    const clinicIndex = pathParts.indexOf('clinics');
    const patientIndex = pathParts.indexOf('patients');

    return {
      clinicId:
        clinicId ||
        (clinicIndex > -1 && pathParts[clinicIndex + 1]) ||
        undefined,
      patientId:
        patientId ||
        (patientIndex > -1 && pathParts[patientIndex + 1]) ||
        undefined,
      resourceId,
    };
  }

  /**
   * Check for emergency override flag
   */
  private checkEmergencyOverride(request: NextRequest): boolean {
    return (
      request.headers.get('x-emergency-override') === 'true' ||
      new URL(request.url).searchParams.get('emergencyOverride') === 'true'
    );
  }

  /**
   * Validate healthcare-specific requirements
   */
  private async validateHealthcareRequirements(
    userContext: UserRoleContext,
    options: RBACMiddlewareOptions
  ): Promise<{ valid: boolean; error?: RBACError }> {
    // Check medical license requirement
    if (options.requireMedicalLicense && !userContext.medical_license) {
      return {
        valid: false,
        error: {
          code: 'MEDICAL_LICENSE_REQUIRED',
          message: 'Active medical license required for this operation',
          statusCode: 403,
          userRole: userContext.role,
          details: { userId: userContext.user_id },
        },
      };
    }

    // Check license active status
    if (options.requireMedicalLicense && !userContext.license_active) {
      return {
        valid: false,
        error: {
          code: 'MEDICAL_LICENSE_INACTIVE',
          message: 'Medical license is not active',
          statusCode: 403,
          userRole: userContext.role,
          details: {
            userId: userContext.user_id,
            licenseNumber: userContext.medical_license,
          },
        },
      };
    }

    // Check license expiry
    if (userContext.license_expiry && userContext.license_expiry < new Date()) {
      return {
        valid: false,
        error: {
          code: 'MEDICAL_LICENSE_EXPIRED',
          message: 'Medical license has expired',
          statusCode: 403,
          userRole: userContext.role,
          details: {
            userId: userContext.user_id,
            licenseNumber: userContext.medical_license,
            expiryDate: userContext.license_expiry,
          },
        },
      };
    }

    // Check CFM registration requirement
    if (options.requireCFMRegistration && !userContext.cfm_number) {
      return {
        valid: false,
        error: {
          code: 'CFM_REGISTRATION_REQUIRED',
          message: 'CFM registration required for this operation',
          statusCode: 403,
          userRole: userContext.role,
          details: { userId: userContext.user_id },
        },
      };
    }

    // Check required specialty
    if (options.requiredSpecialty) {
      const userSpecialties = [
        ...(userContext.medical_specialty
          ? [userContext.medical_specialty]
          : []),
        ...userContext.additional_specialties,
      ];

      if (!userSpecialties.includes(options.requiredSpecialty)) {
        return {
          valid: false,
          error: {
            code: 'MEDICAL_SPECIALTY_REQUIRED',
            message: `Medical specialty '${options.requiredSpecialty}' required for this operation`,
            statusCode: 403,
            userRole: userContext.role,
            details: {
              userId: userContext.user_id,
              requiredSpecialty: options.requiredSpecialty,
              userSpecialties,
            },
          },
        };
      }
    }

    return { valid: true };
  }

  /**
   * Check permissions using RBAC engine
   */
  private async checkPermissions(
    userId: string,
    options: RBACMiddlewareOptions,
    context: {
      clinicId?: string;
      patientId?: string;
      resourceId?: string;
      emergencyOverride?: boolean;
    }
  ): Promise<PermissionCheckResult[]> {
    const results = await Promise.all(
      options.permissions.map((permission) =>
        this.rbacEngine.checkPermission(userId, permission, context)
      )
    );
    return results;
  }

  /**
   * Check alternative permissions
   */
  private async checkAlternativePermissions(
    userId: string,
    permissions: string[],
    context: {
      clinicId?: string;
      patientId?: string;
      resourceId?: string;
      emergencyOverride?: boolean;
    }
  ): Promise<boolean> {
    const results = await Promise.all(
      permissions.map((permission) =>
        this.rbacEngine.checkPermission(userId, permission, context)
      )
    );
    return results.some((result) => result.granted);
  }

  /**
   * Log emergency override usage
   */
  private async logEmergencyOverride(
    userId: string,
    permissions: string[],
    context: any,
    request: NextRequest
  ): Promise<void> {
    try {
      await this.supabase.from('audit_logs').insert({
        user_id: userId,
        action: 'emergency_override',
        resource: permissions.join(','),
        context: {
          ...context,
          url: request.url,
          method: request.method,
          userAgent: request.headers.get('user-agent'),
          ip:
            request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip'),
        },
        result: 'granted',
        reason: 'Emergency override activated',
        emergency_override: true,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Emergency override logging error:', error);
    }
  }

  /**
   * Log successful access
   */
  private async logSuccessfulAccess(
    userId: string,
    permissions: string[],
    context: any,
    request: NextRequest,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await this.supabase.from('audit_logs').insert({
        user_id: userId,
        action: 'api_access',
        resource: permissions.join(','),
        context: {
          ...context,
          url: request.url,
          method: request.method,
          userAgent: request.headers.get('user-agent'),
          ip:
            request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip'),
          ...metadata,
        },
        result: 'granted',
        reason: 'Permission validation successful',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Successful access logging error:', error);
    }
  }

  /**
   * Create error response
   */
  private async createErrorResponse(
    error: RBACError,
    request: NextRequest
  ): Promise<NextResponse> {
    // Log access denial
    try {
      await this.supabase.from('audit_logs').insert({
        action: 'api_access_denied',
        resource: error.requiredPermissions?.join(',') || 'unknown',
        context: {
          url: request.url,
          method: request.method,
          userAgent: request.headers.get('user-agent'),
          ip:
            request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip'),
          errorCode: error.code,
          errorMessage: error.message,
        },
        result: 'denied',
        reason: error.message,
        timestamp: new Date().toISOString(),
      });
    } catch (logError) {
      console.error('Access denial logging error:', logError);
    }

    return NextResponse.json(
      {
        success: false,
        error: error.code,
        message: error.message,
        details: error.details,
        statusCode: error.statusCode,
        timestamp: new Date().toISOString(),
      },
      { status: error.statusCode }
    );
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Create RBAC middleware instance
 */
const rbacMiddleware = new HealthcareRBACMiddleware();

/**
 * Protect API route with specific permissions
 */
export function requirePermissions(
  permissions: string[],
  options: Omit<RBACMiddlewareOptions, 'permissions'> = {}
) {
  return rbacMiddleware.protect({ permissions, ...options });
}

/**
 * Protect clinical API routes
 */
export function requireClinicalAccess(
  options: Omit<RBACMiddlewareOptions, 'permissions'> = {}
) {
  return rbacMiddleware.protect({
    permissions: ['patient.read.own', 'procedure.perform.general'],
    requireMedicalLicense: true,
    allowEmergencyOverride: true,
    ...options,
  });
}

/**
 * Protect administrative API routes
 */
export function requireAdministrativeAccess(
  options: Omit<RBACMiddlewareOptions, 'permissions'> = {}
) {
  return rbacMiddleware.protect({
    permissions: ['scheduling.manage.clinic', 'billing.process.standard'],
    allowEmergencyOverride: false,
    ...options,
  });
}

/**
 * Protect compliance API routes
 */
export function requireComplianceAccess(
  options: Omit<RBACMiddlewareOptions, 'permissions'> = {}
) {
  return rbacMiddleware.protect({
    permissions: ['audit.access.clinic', 'compliance.report.cfm'],
    allowEmergencyOverride: false,
    ...options,
  });
}

/**
 * Protect system administration routes
 */
export function requireSystemAdminAccess(
  options: Omit<RBACMiddlewareOptions, 'permissions'> = {}
) {
  return rbacMiddleware.protect({
    permissions: ['system.manage.users', 'system.configure.clinic'],
    allowEmergencyOverride: false,
    ...options,
  });
}

/**
 * Extract RBAC context from request (for use in API handlers)
 */
export function extractRBACContext(request: NextRequest): RBACContext | null {
  try {
    const contextHeader = request.headers.get('x-rbac-context');
    if (!contextHeader) {
      return null;
    }

    const contextData = JSON.parse(
      Buffer.from(contextHeader, 'base64').toString()
    );
    return contextData as RBACContext;
  } catch (error) {
    console.error('Extract RBAC context error:', error);
    return null;
  }
}

export default rbacMiddleware;

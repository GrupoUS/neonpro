/**
 * T023: Prisma RLS Enforcement Middleware
 *
 * Implements automatic clinic-based data isolation, user context validation for multi-tenant access,
 * and RLS policy enforcement for all database operations. Ensures proper data isolation and security
 * for healthcare multi-tenant architecture with fallback policies for edge cases.
 *
 * @author AI Development Agent
 * @compliance Multi-tenant data isolation with Row Level Security
 * @compliance LGPD data protection requirements
 * @performance <200ms RLS overhead target
 */

import { TRPCError } from '@trpc/server';

// RLS Policy Types
type RLSPolicy =
  | 'clinic_isolation'
  | 'user_context'
  | 'professional_access'
  | 'emergency_override';

interface RLSContext {
  _userId: string;
  clinicId: string;
  userRole: string;
  professionalId?: string;
  isEmergency?: boolean;
  accessLevel: 'read' | 'write' | 'admin' | 'emergency';
}

interface RLSPolicyResult {
  allowed: boolean;
  whereClause?: any;
  errorMessage?: string;
  fallbackPolicy?: RLSPolicy;
}

/**
 * Core RLS policies for different access patterns
 */
const RLS_POLICIES = {
  // Clinic-based isolation - ensures users only access data from their clinic
  clinic_isolation: (
    ctx: RLSContext,
    _model: string,
    _operation: string,
  ): RLSPolicyResult => {
    if (!ctx.clinicId) {
      return {
        allowed: false,
        errorMessage: 'Clinic context required for data access',
        fallbackPolicy: 'emergency_override',
      };
    }

    // Standard clinic isolation where clause
    const whereClause = { clinicId: ctx.clinicId };

    return {
      allowed: true,
      whereClause,
    };
  },

  // User context validation - ensures users can only access data they own or are authorized for
  user_context: (
    ctx: RLSContext,
    model: string,
    operation: string,
  ): RLSPolicyResult => {
    if (!ctx._userId) {
      return {
        allowed: false,
        errorMessage: 'User authentication required',
      };
    }

    // Different access patterns based on user role
    switch (ctx.userRole) {
      case 'admin':
      case 'owner':
        // Admins have full access within their clinic
        return {
          allowed: true,
          whereClause: { clinicId: ctx.clinicId },
        };

      case 'professional':
        // Professionals can access their patients and appointments
        if (model === 'Patient' || model === 'Appointment') {
          return {
            allowed: true,
            whereClause: {
              AND: [
                { clinicId: ctx.clinicId },
                {
                  OR: [
                    { professionalId: ctx.professionalId },
                    { createdBy: ctx.userId },
                  ],
                },
              ],
            },
          };
        }
        break;

      case 'receptionist':
        // Receptionists can view but not modify patient data
        if (operation === 'read') {
          return {
            allowed: true,
            whereClause: { clinicId: ctx.clinicId },
          };
        }
        if (model === 'Appointment') {
          return {
            allowed: true,
            whereClause: { clinicId: ctx.clinicId },
          };
        }
        break;

      case 'patient':
        // Patients can only access their own data
        return {
          allowed: true,
          whereClause: {
            AND: [{ clinicId: ctx.clinicId }, { patientId: ctx.userId }],
          },
        };
    }

    return {
      allowed: false,
      errorMessage: `Insufficient permissions for ${operation} on ${model}`,
      fallbackPolicy: 'emergency_override',
    };
  }, // Professional access control - ensures professionals only access authorized data
  professional_access: (
    ctx: RLSContext,
    model: string,
    operation: string,
  ): RLSPolicyResult => {
    if (ctx.userRole !== 'professional' || !ctx.professionalId) {
      return {
        allowed: false,
        errorMessage: 'Professional authorization required',
      };
    }

    // Professionals have specific access patterns
    const allowedModels = [
      'Patient',
      'Appointment',
      'MedicalRecord',
      'Prescription',
      'TelemedicineSession',
    ];

    if (!allowedModels.includes(model)) {
      return {
        allowed: false,
        errorMessage: `Professionals cannot access ${model} data directly`,
      };
    }

    return {
      allowed: true,
      whereClause: {
        AND: [
          { clinicId: ctx.clinicId },
          { professionalId: ctx.professionalId },
        ],
      },
    };
  },

  // Emergency override - special policy for emergency medical situations
  emergency_override: (
    ctx: RLSContext,
    _model: string,
    _operation: string,
  ): RLSPolicyResult => {
    if (!ctx.isEmergency) {
      return {
        allowed: false,
        errorMessage: 'Emergency authorization required',
      };
    }

    // In emergency situations, allow broader access but still within clinic
    // This should be logged heavily for audit purposes
    return {
      allowed: true,
      whereClause: { clinicId: ctx.clinicId },
    };
  },
};

/**
 * Model-specific RLS configurations
 */
const MODEL_RLS_CONFIG = {
  Patient: {
    policies: ['clinic_isolation', 'user_context'],
    sensitiveFields: ['cpf', 'rg', 'medicalHistory', 'bloodType', 'allergies'],
    emergencyAccess: true,
  },
  Appointment: {
    policies: ['clinic_isolation', 'professional_access'],
    sensitiveFields: ['notes', 'diagnosis', 'prescription'],
    emergencyAccess: true,
  },
  MedicalRecord: {
    policies: ['clinic_isolation', 'professional_access'],
    sensitiveFields: ['diagnosis', 'treatment', 'notes'],
    emergencyAccess: true,
  },
  AuditTrail: {
    policies: ['clinic_isolation'],
    sensitiveFields: ['additionalInfo'],
    emergencyAccess: false,
  },
  User: {
    policies: ['user_context'],
    sensitiveFields: ['passwordHash', 'personalInfo'],
    emergencyAccess: false,
  },
  LGPDConsent: {
    policies: ['clinic_isolation', 'user_context'],
    sensitiveFields: ['consentHash', 'digitalSignature'],
    emergencyAccess: false,
  },
} as const;

/**
 * Extract operation type from Prisma call
 */

function extractOperationType(path: string, type: string): string {
  if (type === 'query') {
    if (path.includes('list') || path.includes('findMany')) return 'read';
    if (path.includes('get') || path.includes('findUnique')) return 'read';
    return 'read';
  }

  if (type === 'mutation') {
    if (path.includes('create')) return 'create';
    if (path.includes('update')) return 'update';
    if (path.includes('delete')) return 'delete';
    return 'write';
  }

  return 'read';
}

/**
 * Create RLS context from tRPC context
 */
function createRLSContext(ctx: any): RLSContext {
  return {
    _userId: ctx.userId,
    clinicId: ctx.clinicId,
    userRole: ctx.userRole || 'user',
    professionalId: ctx.professionalId,
    isEmergency: ctx.isEmergency || false,
    accessLevel: determineAccessLevel(ctx),
  };
}

function determineAccessLevel(
  ctx: any,
): 'read' | 'write' | 'admin' | 'emergency' {
  if (ctx.isEmergency) return 'emergency';
  if (ctx.userRole === 'admin' || ctx.userRole === 'owner') return 'admin';
  if (ctx.userRole === 'professional') return 'write';
  return 'read';
}

/**
 * Apply RLS policies to Prisma query
 */
function applyRLSPolicies(
  rlsContext: RLSContext,
  model: string,
  operation: string,
  existingWhere?: any,
): { where: any; allowed: boolean; errorMessage?: string } {
  const modelConfig = MODEL_RLS_CONFIG[model as keyof typeof MODEL_RLS_CONFIG];

  if (!modelConfig) {
    // Default policy for unknown models - clinic isolation
    const policy = RLS_POLICIES.clinic_isolation(rlsContext, model, operation);
    return {
      where: existingWhere
        ? { AND: [existingWhere, policy.whereClause] }
        : policy.whereClause,
      allowed: policy.allowed,
      errorMessage: policy.errorMessage,
    };
  }

  let combinedWhere = existingWhere || {};
  let policyResults: RLSPolicyResult[] = [];

  // Apply all configured policies for the model
  for (const policyName of modelConfig.policies) {
    const policy = RLS_POLICIES[policyName];
    const result = policy(rlsContext, model, operation);
    policyResults.push(result);

    if (!result.allowed) {
      // If any policy fails, check for fallback
      if (
        result.fallbackPolicy
        && modelConfig.emergencyAccess
        && rlsContext.isEmergency
      ) {
        const fallbackPolicy = RLS_POLICIES[result.fallbackPolicy];
        const fallbackResult = fallbackPolicy(rlsContext, model, operation);

        if (fallbackResult.allowed) {
          policyResults.push(fallbackResult);
          continue;
        }
      }

      return {
        where: {},
        allowed: false,
        errorMessage: result.errorMessage || 'Access denied by RLS policy',
      };
    }

    // Combine where clauses
    if (result.whereClause) {
      combinedWhere = combinedWhere.AND
        ? {
          AND: [
            ...(Array.isArray(combinedWhere.AND)
              ? combinedWhere.AND
              : [combinedWhere.AND]),
            result.whereClause,
          ],
        }
        : { AND: [combinedWhere, result.whereClause] };
    }
  }

  return {
    where: combinedWhere,
    allowed: true,
  };
} /**
 * Enhanced Prisma client with automatic RLS enforcement
 */

function createRLSEnforcedPrisma(
  originalPrisma: any,
  rlsContext: RLSContext,
  _auditMeta: any,
) {
  const enhancedPrisma = new Proxy(originalPrisma, {
    get(target, prop) {
      const originalValue = target[prop];

      // If it's a model delegate (like prisma.patient, prisma.appointment)
      if (
        typeof originalValue === 'object'
        && originalValue !== null
        && typeof prop === 'string'
        && prop !== 'constructor'
      ) {
        return new Proxy(originalValue, {
          get(modelTarget, modelProp) {
            const originalMethod = modelTarget[modelProp];

            if (typeof originalMethod === 'function') {
              return function(...args: any[]) {
                const operation = String(modelProp);
                const model = String(prop).charAt(0).toUpperCase() + String(prop).slice(1);

                // Extract and enhance the query arguments
                const [queryArgs] = args;
                const operationType = extractOperationType(operation, 'query');

                // Apply RLS policies
                const rlsResult = applyRLSPolicies(
                  rlsContext,
                  model,
                  operationType,
                  queryArgs?.where,
                );

                if (!rlsResult.allowed) {
                  throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: rlsResult.errorMessage
                      || 'Access denied by Row Level Security policy',
                  });
                }

                // Enhance query with RLS where clause
                const enhancedArgs = {
                  ...queryArgs,
                  where: rlsResult.where,
                };

                // Log RLS enforcement for audit
                if (process.env.NODE_ENV === 'development') {
                  console.log(`RLS: ${model}.${operation}`, {
                    originalWhere: queryArgs?.where,
                    rlsWhere: rlsResult.where,
                    user: rlsContext.userId,
                    clinic: rlsContext.clinicId,
                    _role: rlsContext.userRole,
                  });
                }

                return originalMethod.call(modelTarget, enhancedArgs);
              };
            }

            return originalMethod;
          },
        });
      }

      return originalValue;
    },
  });

  return enhancedPrisma;
}

/**
 * Prisma RLS Enforcement Middleware
 *
 * Automatically enforces Row Level Security policies for all Prisma operations,
 * ensuring proper multi-tenant data isolation and user context validation.
 */
export const prismaRLSMiddleware = async ({
  ctx,next,_path,type,
  _input,
}: any) => {
  const start = performance.now();

  try {
    // Skip RLS for public operations and health checks
    if (path === 'health' || path.startsWith('public.') || !ctx._userId) {
      return next();
    }

    // Create RLS context
    const rlsContext = createRLSContext(ctx);

    // Validate basic RLS requirements
    if (!rlsContext.clinicId && !rlsContext.isEmergency) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Clinic context required for data access. Please ensure proper authentication.',
      });
    }

    // Create RLS-enforced Prisma client
    const originalPrisma = ctx.prisma;
    ctx.prisma = createRLSEnforcedPrisma(
      originalPrisma,
      rlsContext,
      ctx.auditMeta,
    );

    // Add RLS context for downstream middleware
    ctx.rlsContext = rlsContext;

    const result = await next();

    // Restore original Prisma client
    ctx.prisma = originalPrisma;

    // Log performance metrics
    const duration = performance.now() - start;
    if (duration > 200) {
      console.warn(
        `RLS enforcement exceeded 200ms target: ${duration.toFixed(2)}ms for ${path}`,
      );
    }

    return result;
  } catch (error) {
    const duration = performance.now() - start;

    // Log RLS failures for security auditing
    if (ctx._userId) {
      await ctx.prisma.auditTrail.create({
        data: {
          _userId: ctx.userId,
          clinicId: ctx.clinicId,
          action: 'VIEW',
          resource: path,
          resourceType: 'SYSTEM_CONFIG',
          ipAddress: ctx.auditMeta.ipAddress,
          userAgent: ctx.auditMeta.userAgent,
          sessionId: ctx.auditMeta.sessionId,
          status: 'FAILED',
          riskLevel: 'HIGH',
          additionalInfo: JSON.stringify({
            errorType: 'RLS_ENFORCEMENT_FAILURE',
            error: error instanceof Error ? error.message : 'Unknown RLS error',
            duration,
            path,
            rlsContext: createRLSContext(ctx),
          }),
        },
      });
    }

    throw error;
  }
};

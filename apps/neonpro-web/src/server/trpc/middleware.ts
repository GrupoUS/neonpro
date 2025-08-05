import type { Context } from "./context";

// Healthcare audit trail interface
interface AuditTrailData {
  user_id: string | null;
  action: string;
  resource_type: string;
  resource_id?: string;
  tenant_id?: string;
  metadata: Record<string, any>;
  request_id: string;
  ip_address: string;
  user_agent: string;
  timestamp: Date;
  compliance_flags: {
    lgpd_compliant: boolean;
    data_consent_validated: boolean;
    medical_role_verified: boolean;
  };
}

// Healthcare compliance middleware
export const healthcareAuditMiddleware = middleware(async ({ ctx, next, path, type }) => {
  const startTime = Date.now();

  try {
    const result = await next();

    // Log successful healthcare operation
    await logHealthcareAudit({
      ctx,
      path,
      type,
      success: true,
      duration: Date.now() - startTime,
      error: null,
    });

    return result;
  } catch (error) {
    // Log failed healthcare operation
    await logHealthcareAudit({
      ctx,
      path,
      type,
      success: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    throw error;
  }
});

// Authentication middleware with healthcare role validation
export const authMiddleware = middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Healthcare authentication required",
    });
  }

  // Validate LGPD compliance
  if (!ctx.user.lgpd_consent || !ctx.user.data_consent_given) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "LGPD data consent required for healthcare operations",
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user, // Authenticated user guaranteed
    },
  });
});

// Medical professional middleware
export const medicalProfessionalMiddleware = authMiddleware.unstable_pipe(
  middleware(async ({ ctx, next }) => {
    const allowedRoles = ["healthcare_professional", "admin"];

    if (!allowedRoles.includes(ctx.user.role)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Medical professional access required",
      });
    }

    // Validate medical license for healthcare professionals
    if (ctx.user.role === "healthcare_professional" && !ctx.user.medical_license) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Valid medical license required",
      });
    }

    return next();
  }),
);

// Admin-only middleware
export const adminMiddleware = authMiddleware.unstable_pipe(
  middleware(async ({ ctx, next }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Administrative access required",
      });
    }

    return next();
  }),
);

// Tenant isolation middleware
export const tenantMiddleware = authMiddleware.unstable_pipe(
  middleware(async ({ ctx, next, input }) => {
    // Ensure tenant_id matches user's tenant for data isolation
    if (input && typeof input === "object" && "tenant_id" in input) {
      if (input.tenant_id !== ctx.user.tenant_id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cross-tenant access not allowed",
        });
      }
    }

    return next({
      ctx: {
        ...ctx,
        tenantId: ctx.user.tenant_id,
      },
    });
  }),
); // Healthcare audit logging function
async function logHealthcareAudit({
  ctx,
  path,
  type,
  success,
  duration,
  error,
}: {
  ctx: Context;
  path: string;
  type: string;
  success: boolean;
  duration: number;
  error: string | null;
}) {
  try {
    const auditData: AuditTrailData = {
      user_id: ctx.user?.id || null,
      action: `${type}.${path}`,
      resource_type: path.split(".")[0] || "unknown",
      tenant_id: ctx.user?.tenant_id,
      metadata: {
        success,
        duration_ms: duration,
        error: error || undefined,
      },
      request_id: ctx.requestId,
      ip_address: ctx.ipAddress,
      user_agent: ctx.userAgent,
      timestamp: ctx.timestamp,
      compliance_flags: {
        lgpd_compliant: ctx.user?.lgpd_consent || false,
        data_consent_validated: ctx.user?.data_consent_given || false,
        medical_role_verified:
          ctx.user?.role === "healthcare_professional" ? !!ctx.user?.medical_license : true,
      },
    };

    // Insert audit log into Supabase
    await ctx.supabase.from("healthcare_audit_logs").insert(auditData);
  } catch (auditError) {
    // Log audit errors but don't fail the main operation
    console.error("Healthcare audit logging failed:", auditError);
  }
}

// Procedure definitions with healthcare middleware
export const publicProcedureWithAudit = publicProcedure.use(healthcareAuditMiddleware);
export const protectedProcedure = publicProcedureWithAudit.use(authMiddleware);
export const medicalProcedure = publicProcedureWithAudit.use(medicalProfessionalMiddleware);
export const adminProcedure = publicProcedureWithAudit.use(adminMiddleware);
export const tenantProcedure = publicProcedureWithAudit.use(tenantMiddleware);

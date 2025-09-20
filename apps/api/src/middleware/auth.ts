/**
 * Authentication Middleware Enhancement (T073)
 * Healthcare professional validation for AI features
 *
 * Features:
 * - Healthcare professional validation for AI features
 * - CFM/CRM number verification integration
 * - LGPD consent validation middleware
 * - Session management for real-time connections
 * - Integration with existing auth system
 */

import { createClient } from "@supabase/supabase-js";
import { Context, Next } from "hono";
import { z } from "zod";
import { unauthorized } from "../utils/responses";

// Healthcare professional validation schema
const healthcareProfessionalSchema = z.object({
  id: z.string().uuid(),
  crmNumber: z
    .string()
    .regex(/^\d{4,6}-[A-Z]{2}$/, "Número CRM inválido (formato: 12345-SP)"),
  specialty: z.string().min(1, "Especialidade é obrigatória"),
  licenseStatus: z.enum(["active", "suspended", "expired"]).default("active"),
  verificationDate: z.date().optional(),
  permissions: z
    .object({
      canAccessAI: z.boolean().default(false),
      canViewPatientData: z.boolean().default(false),
      canModifyPatientData: z.boolean().default(false),
      canAccessReports: z.boolean().default(false),
    })
    .optional(),
});

export type HealthcareProfessional = z.infer<
  typeof healthcareProfessionalSchema
>;

// LGPD consent schema
const lgpdConsentSchema = z.object({
  userId: z.string().uuid(),
  consentDate: z.date(),
  consentVersion: z.string().default("1.0"),
  purposes: z.array(
    z.enum([
      "healthcare_service",
      "ai_assistance",
      "data_analytics",
      "notifications",
      "marketing",
    ]),
  ),
  dataCategories: z.array(
    z.enum([
      "personal_data",
      "health_data",
      "contact_data",
      "usage_data",
      "technical_data",
    ]),
  ),
  retentionPeriod: z.number().min(1).max(3650).default(365), // days
  canWithdraw: z.boolean().default(true),
  isActive: z.boolean().default(true),
});

export type LGPDConsent = z.infer<typeof lgpdConsentSchema>;

// Session metadata for real-time connections
interface SessionMetadata {
  sessionId: string;
  userId: string;
  createdAt: Date;
  lastActivity: Date;
  ipAddress?: string;
  userAgent?: string;
  healthcareProfessional?: HealthcareProfessional;
  lgpdConsent?: LGPDConsent;
  permissions: string[];
  isRealTimeSession: boolean;
}

// Session manager for real-time connections
class SessionManager {
  private sessions = new Map<string, SessionMetadata>();
  private userSessions = new Map<string, Set<string>>();

  // Create new session
  createSession(userId: string, metadata: Partial<SessionMetadata>): string {
    const sessionId = crypto.randomUUID();
    const session: SessionMetadata = {
      sessionId,
      userId,
      createdAt: new Date(),
      lastActivity: new Date(),
      permissions: [],
      isRealTimeSession: false,
      ...metadata,
    };

    this.sessions.set(sessionId, session);

    // Track user sessions
    if (!this.userSessions.has(userId)) {
      this.userSessions.set(userId, new Set());
    }
    this.userSessions.get(userId)!.add(sessionId);

    return sessionId;
  }

  // Get session
  getSession(sessionId: string): SessionMetadata | undefined {
    return this.sessions.get(sessionId);
  }

  // Update session activity
  updateActivity(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivity = new Date();
      return true;
    }
    return false;
  }

  // Remove session
  removeSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (session) {
      // Remove from user sessions
      const userSessions = this.userSessions.get(session.userId);
      if (userSessions) {
        userSessions.delete(sessionId);
        if (userSessions.size === 0) {
          this.userSessions.delete(session.userId);
        }
      }

      this.sessions.delete(sessionId);
      return true;
    }
    return false;
  }

  // Get user sessions
  getUserSessions(userId: string): SessionMetadata[] {
    const sessionIds = this.userSessions.get(userId) || new Set();
    return Array.from(sessionIds)
      .map((id) => this.sessions.get(id))
      .filter(Boolean) as SessionMetadata[];
  }

  // Clean expired sessions
  cleanExpiredSessions(maxInactiveHours: number = 24): number {
    const cutoffTime = new Date(Date.now() - maxInactiveHours * 60 * 60 * 1000);
    const toRemove: string[] = [];

    for (const [sessionId, session] of this.sessions) {
      if (session.lastActivity < cutoffTime) {
        toRemove.push(sessionId);
      }
    }

    for (const sessionId of toRemove) {
      this.removeSession(sessionId);
    }

    return toRemove.length;
  }
}

// Global session manager
export const sessionManager = new SessionManager();

// Services - can be injected for testing
let _services: any = null;

export const setServices = (injectedServices: any) => {
  _services = injectedServices;
};

// Import database client
import { createAdminClient } from "../clients/supabase";

// Enhanced authentication middleware
export async function requireAuth(c: Context, next: Next) {
  const auth = c.req.header("authorization") || c.req.header("Authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : undefined;

  if (!token) {
    return unauthorized(c, "Token de autenticação necessário");
  }

  try {
    // Use injected services for testing or real services in production
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return unauthorized(c, "Configuração do servidor incompleta");
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
      return unauthorized(c, "Token inválido ou expirado");
    }

    // Create or update session
    const sessionId = c.req.header("x-session-id") || crypto.randomUUID();
    const ipAddress =
      c.req.header("x-forwarded-for") || c.req.header("x-real-ip");
    const userAgent = c.req.header("user-agent");

    sessionManager.createSession(data.user.id, {
      sessionId,
      ipAddress,
      userAgent,
      isRealTimeSession: c.req.header("upgrade") === "websocket",
    });

    // Attach user info to context
    c.set("userId", data.user.id);
    c.set("user", data.user);
    c.set("sessionId", sessionId);

    return next();
  } catch (error) {
    console.error("Authentication error:", error);
    return unauthorized(c, "Erro de autenticação");
  }
}

// Healthcare professional validation middleware
export function requireHealthcareProfessional() {
  return async (c: Context, next: Next) => {
    const userId = c.get("userId");
    if (!userId) {
      return unauthorized(c, "Autenticação necessária");
    }

    try {
      // Use injected services for testing or real services in production
      const supabase = _services?.supabase || createAdminClient();

      // Query healthcare professional data from database
      const { data: healthcareProfessional, error } = await supabase
        .from("healthcare_professionals")
        .select(
          `
          *,
          permissions:healthcare_professional_permissions(*)
        `,
        )
        .eq("user_id", userId)
        .single();

      if (error || !healthcareProfessional) {
        return c.json(
          {
            success: false,
            error: "Profissional de saúde não encontrado",
            code: "HEALTHCARE_PROFESSIONAL_NOT_FOUND",
          },
          404,
        );
      }

      // Transform database record to match schema
      const transformedProfessional: HealthcareProfessional = {
        id: healthcareProfessional.id,
        crmNumber: healthcareProfessional.crm_number,
        specialty: healthcareProfessional.specialty,
        licenseStatus: healthcareProfessional.license_status,
        verificationDate: new Date(healthcareProfessional.verification_date),
        permissions: healthcareProfessional.permissions?.[0] || {
          canAccessAI: false,
          canViewPatientData: false,
          canModifyPatientData: false,
          canAccessReports: false,
        },
      };

      // Validate healthcare professional data
      const validatedProfessional = healthcareProfessionalSchema.parse(
        transformedProfessional,
      );

      // Check license status
      if (validatedProfessional.licenseStatus !== "active") {
        return c.json(
          {
            success: false,
            error: "Licença profissional inativa ou suspensa",
            code: "INACTIVE_LICENSE",
          },
          403,
        );
      }

      // Update session with healthcare professional info
      const sessionId = c.get("sessionId");
      if (sessionId) {
        const session = sessionManager.getSession(sessionId);
        if (session) {
          session.healthcareProfessional = validatedProfessional;
          session.permissions.push("healthcare_professional");
        }
      }

      // Attach healthcare professional info to context
      c.set("healthcareProfessional", validatedProfessional);
      c.set("isHealthcareProfessional", true);

      return next();
    } catch (error) {
      console.error("Healthcare professional validation error:", error);
      return c.json(
        {
          success: false,
          error: "Validação de profissional de saúde falhou",
          code: "HEALTHCARE_VALIDATION_FAILED",
        },
        403,
      );
    }
  };
}

// LGPD consent validation middleware
export function requireLGPDConsent(
  requiredPurposes: string[] = [],
  requiredDataCategories: string[] = [],
) {
  return async (c: Context, next: Next) => {
    const userId = c.get("userId");
    if (!userId) {
      return unauthorized(c, "Autenticação necessária");
    }

    try {
      // Use injected services for testing or real services in production
      const supabase = _services?.supabase || createAdminClient();

      // Query LGPD consent data from database
      const { data: consentRecords, error } = await supabase
        .from("lgpd_consents")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("consent_date", { ascending: false })
        .limit(1);

      if (error || !consentRecords || consentRecords.length === 0) {
        return c.json(
          {
            success: false,
            error: "Consentimento LGPD não encontrado",
            code: "LGPD_CONSENT_NOT_FOUND",
          },
          404,
        );
      }

      const consentRecord = consentRecords[0];

      // Transform database record to match schema
      const transformedConsent: LGPDConsent = {
        userId: consentRecord.user_id,
        consentDate: new Date(consentRecord.consent_date),
        consentVersion: consentRecord.consent_version,
        purposes: consentRecord.purposes,
        dataCategories: consentRecord.data_categories,
        retentionPeriod: consentRecord.retention_period,
        canWithdraw: consentRecord.can_withdraw,
        isActive: consentRecord.is_active,
      };

      // Validate consent data
      const validatedConsent = lgpdConsentSchema.parse(transformedConsent);

      // Check if consent is active
      if (!validatedConsent.isActive) {
        return c.json(
          {
            success: false,
            error: "Consentimento LGPD retirado ou inativo",
            code: "LGPD_CONSENT_WITHDRAWN",
          },
          403,
        );
      }

      // Check required purposes
      const missingPurposes = requiredPurposes.filter(
        (purpose) => !validatedConsent.purposes.includes(purpose as any),
      );

      if (missingPurposes.length > 0) {
        return c.json(
          {
            success: false,
            error: "Consentimento LGPD insuficiente",
            code: "LGPD_INSUFFICIENT_CONSENT",
            details: {
              missingPurposes,
              requiredPurposes,
            },
          },
          403,
        );
      }

      // Check required data categories
      const missingDataCategories = requiredDataCategories.filter(
        (category) =>
          !validatedConsent.dataCategories.includes(category as any),
      );

      if (missingDataCategories.length > 0) {
        return c.json(
          {
            success: false,
            error: "Consentimento LGPD insuficiente para categorias de dados",
            code: "LGPD_INSUFFICIENT_DATA_CONSENT",
            details: {
              missingDataCategories,
              requiredDataCategories,
            },
          },
          403,
        );
      }

      // Update session with LGPD consent info
      const sessionId = c.get("sessionId");
      if (sessionId) {
        const session = sessionManager.getSession(sessionId);
        if (session) {
          session.lgpdConsent = validatedConsent;
          session.permissions.push("lgpd_consent_valid");
        }
      }

      // Attach LGPD consent info to context
      c.set("lgpdConsent", validatedConsent);
      c.set("hasLGPDConsent", true);

      return next();
    } catch (error) {
      console.error("LGPD consent validation error:", error);
      return c.json(
        {
          success: false,
          error: "Validação de consentimento LGPD falhou",
          code: "LGPD_VALIDATION_FAILED",
        },
        500,
      );
    }
  };
}

// AI features access middleware (combines healthcare professional and LGPD consent)
export function requireAIAccess() {
  return async (c: Context, next: Next) => {
    // First require healthcare professional validation
    const healthcareMiddleware = requireHealthcareProfessional();
    const healthcareResult = await healthcareMiddleware(c, async () => {});

    if (healthcareResult) {
      return healthcareResult; // Return error response
    }

    // Then require LGPD consent for AI assistance
    const lgpdMiddleware = requireLGPDConsent(
      ["ai_assistance"],
      ["health_data"],
    );
    const lgpdResult = await lgpdMiddleware(c, async () => {});

    if (lgpdResult) {
      return lgpdResult; // Return error response
    }

    // Check AI access permission
    const healthcareProfessional = c.get(
      "healthcareProfessional",
    ) as HealthcareProfessional;
    if (!healthcareProfessional?.permissions?.canAccessAI) {
      return c.json(
        {
          success: false,
          error: "Acesso a recursos de IA não autorizado",
          code: "AI_ACCESS_DENIED",
        },
        403,
      );
    }

    // Add AI access permission to session
    const sessionId = c.get("sessionId");
    if (sessionId) {
      const session = sessionManager.getSession(sessionId);
      if (session) {
        session.permissions.push("ai_access");
      }
    }

    c.set("hasAIAccess", true);
    return next();
  };
}

// Session cleanup middleware (can be used as a scheduled task)
export function sessionCleanup(maxInactiveHours: number = 24) {
  return async (c: Context, next: Next) => {
    // Clean expired sessions
    const cleanedCount = sessionManager.cleanExpiredSessions(maxInactiveHours);

    if (cleanedCount > 0) {
      console.log(`Cleaned ${cleanedCount} expired sessions`);
    }

    return next();
  };
}

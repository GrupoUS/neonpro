// FastifyRequest Type Augmentation for NeonPro Healthcare API
// Solves 40+ TypeScript errors related to custom properties

import type { HealthcareUser } from "../plugins/auth";

declare module "fastify" {
  interface FastifyRequest {
    user?: HealthcareUser;
    tenantId?: string;
  }

  interface FastifyInstance {
    // Authentication decorations
    requireRole: (role: string) => any;
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;

    // Database decorations
    supabase: any;

    // Audit logging decorations
    auditLog: any;
    insertAuditLog: (error: any) => Promise<void>;

    // Monitoring decorations
    monitoring: any;

    // Cache decorations
    cache: any;
  }

  interface FastifyReply {
    // Custom reply decorations if needed
  }
}

// Re-export HealthcareUser for convenience
export type { HealthcareUser };

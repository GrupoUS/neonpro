// FastifyRequest Type Augmentation for NeonPro Healthcare API
// Solves 40+ TypeScript errors related to custom properties

import type { HealthcareUser } from "../plugins/auth";

// Audit Log Interface
export interface AuditLogEntry {
  action: string;
  resourceId?: string;
  userId?: string;
  timestamp?: Date;
  details?: Record<string, any>;
  patientId?: string;
  recordId?: string;
  jobId?: string;
}

declare module "fastify" {
  interface FastifyRequest {
    user?: HealthcareUser;
    tenantId?: string;
    auditLog: (action: string, metadata?: Record<string, any>) => void;
    supabaseClient?: any; // Supabase client instance
  }

  interface FastifyInstance {
    // Authentication decorations
    requireRole: (
      allowedRoles: string[],
    ) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;

    // Database decorations
    supabase: any;
    checkDatabaseHealth?: () => Promise<{ status: string; details?: any }>;

    // Redis decorations
    redis?: any;

    // Audit logging decorations
    auditLog: any;
    insertAuditLog: (error: any) => Promise<void>;

    // Monitoring decorations
    monitoring: any;

    // Cache decorations
    cache: any;

    // Edge services integration
    edgeServices: any;
  }

  interface FastifyReply {
    // Custom reply decorations if needed
  }
}

// Re-export HealthcareUser for convenience
export type { HealthcareUser };

/**
 * Hono context variable declarations for NeonPro API
 */
import type { Environment } from "./environment";

declare module "hono" {
  interface ContextVariableMap {
    _userId?: string;
    userRole?: string;
    clinicId?: string;
    patientId?: string;
    professionalId?: string;
    requestId?: string;
    startTime?: number;
    user?: any;
  }
}

export type { Environment };

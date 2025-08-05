import { createTRPCRouter } from './trpc';
import { authRouter } from './routers/auth';

/**
 * Main tRPC router for NeonPro Healthcare
 * 
 * Healthcare-compliant API with:
 * - LGPD compliance validation
 * - Medical role-based access control
 * - Comprehensive audit trail
 * - Tenant data isolation
 * - Type-safe end-to-end communication
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  // Additional routers will be added here:
  // patients: patientsRouter,
  // appointments: appointmentsRouter,
  // medical: medicalRouter,
  // reports: reportsRouter,
});

// Export type definition for client
export type AppRouter = typeof appRouter;

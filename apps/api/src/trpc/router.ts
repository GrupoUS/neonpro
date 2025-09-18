/**
 * Main tRPC App Router
 * Combines all domain routers with healthcare compliance
 */

import { router } from './trpc';
import { patientsRouter } from './routers/patients';
import { appointmentsRouter } from './routers/appointments';
import { aiRouter } from './routers/ai';
import { healthcareServicesRouter } from './routers/healthcare-services';

/**
 * App Router - Main tRPC router for the healthcare platform
 * 
 * Includes:
 * - Patients router with LGPD compliance
 * - Appointments router with CFM validation and no-show prediction
 * - AI router with Portuguese healthcare support
 * - Healthcare Services router with enhanced T027-T029 services:
 *   - LGPD data lifecycle management
 *   - AI-powered no-show prediction
 *   - CFM-compliant telemedicine sessions
 * - Comprehensive audit logging for all operations
 */
export const appRouter = router({
  patients: patientsRouter,
  appointments: appointmentsRouter,
  ai: aiRouter,
  healthcareServices: healthcareServicesRouter,
});

// Export the router type for use in clients
export type AppRouter = typeof appRouter;
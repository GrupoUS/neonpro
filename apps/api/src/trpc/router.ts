/**
 * Main tRPC App Router
 * Combines all domain routers with healthcare compliance
 */

import { aiRouter } from './routers/ai';
import { appointmentsRouter } from './routers/appointments';
import { healthcareServicesRouter } from './routers/healthcare-services';
import { patientsRouter } from './routers/patients';
import { realtimeTelemedicineRouter } from './routers/realtime-telemedicine';
import { router } from './trpc';

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
 * - Real-Time Telemedicine router with Phase 3.4 T031 features:
 *   - WebSocket subscriptions for video consultation updates
 *   - Real-time encrypted chat with LGPD compliance
 *   - Presence detection for healthcare professionals
 *   - Connection quality monitoring (<50ms latency targets)
 * - Comprehensive audit logging for all operations
 */
export const appRouter = router({
  patients: patientsRouter,
  appointments: appointmentsRouter,
  ai: aiRouter,
  healthcareServices: healthcareServicesRouter,
  realtimeTelemedicine: realtimeTelemedicineRouter,
});

// Export the router type for use in clients
export type AppRouter = typeof appRouter;

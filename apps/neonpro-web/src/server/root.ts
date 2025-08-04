/**
 * tRPC Root Router
 * Main router combining all healthcare modules
 */

import { createTRPCRouter } from './trpc';
import { patientsRouter } from './routers/patients';
import { appointmentsRouter } from './routers/appointments';
import { doctorsRouter } from './routers/doctors';

/**
 * Main tRPC router for NeonPro Healthcare
 * 
 * Add new routers here as you migrate from REST APIs
 */
export const appRouter = createTRPCRouter({
  patients: patientsRouter,
  appointments: appointmentsRouter,
  doctors: doctorsRouter,
  
  // TODO: Add more routers as you migrate
  // communication: communicationRouter,
  // forecasting: forecastingRouter,
  // reports: reportsRouter,
  // audit: auditRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;
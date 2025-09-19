/**
 * tRPC v11 API Contracts - Consolidated Index
 * Healthcare-compliant API contracts for NeonPro Platform
 */

export { patientRouter } from './patient';
export { appointmentRouter } from './appointment';
export { professionalRouter } from './professional';
export { clinicRouter } from './clinic';
export { aiRouter } from './ai';

// Main API router combining all contracts
import { router } from '../trpc';
import { patientRouter } from './patient';
import { appointmentRouter } from './appointment';
import { professionalRouter } from './professional';
import { clinicRouter } from './clinic';
import { aiRouter } from './ai';

/**
 * Comprehensive API router for NeonPro Platform
 * Combines all healthcare API contracts with authentication and compliance
 */
export const apiRouter = router({
  patient: patientRouter,
  appointment: appointmentRouter,
  professional: professionalRouter,
  clinic: clinicRouter,
  ai: aiRouter,
});

// Export type definition for the API router
export type ApiRouter = typeof apiRouter;

/**
 * Healthcare API Contract Summary:
 * 
 * Patient Router:
 * - CRUD operations with LGPD compliance
 * - Medical history management
 * - Document handling with encryption
 * - Consent management and audit trails
 * 
 * Appointment Router:
 * - Scheduling with conflict detection
 * - No-show prediction and management
 * - Real-time updates via WebSocket
 * - Service-specific appointment handling
 * 
 * Professional Router:
 * - Healthcare professional management
 * - License validation and compliance
 * - Schedule and availability management
 * - Performance analytics and reporting
 * 
 * Clinic Router:
 * - Multi-tenant clinic management
 * - Configuration and settings
 * - Analytics and reporting
 * - Service catalog management
 * 
 * AI Router:
 * - Healthcare-compliant AI chat
 * - Health analysis and insights
 * - Appointment suggestions
 * - Conversation management with audit trails
 */
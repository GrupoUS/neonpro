/**
 * Main tRPC App Router
 * Combines all domain routers with healthcare compliance
 */

import { agentRouter } from './routers/agent';
import { aiRouter } from './routers/ai';
import { appointmentsRouter } from './routers/appointments';
import { aestheticSchedulingRouter } from './routers/aesthetic-scheduling';
import { crudRouter } from './routers/crud';
import { financialAgentRouter } from './routers/financial-agent';
import { healthcareServicesRouter } from './routers/healthcare-services';
import { patientsRouter } from './routers/patients';
import { realtimeTelemedicineRouter } from './routers/realtime-telemedicine';
import { telemedicineRouter } from './routers/telemedicine';
import { router } from './trpc';

// Import comprehensive API contracts from T016
import { apiRouter } from './contracts';

/**
 * App Router - Main tRPC router for the healthcare platform
 *
 * Includes:
 * - Patients router with LGPD compliance
 * - Appointments router with CFM validation and no-show prediction
 * - AI router with Portuguese healthcare support
 * - Financial Agent router with AG-UI Protocol extensions:
 *   - Intelligent billing automation and payment processing
 *   - Predictive financial analytics and trend analysis
 *   - Automated anomaly detection and fraud prevention
 *   - LGPD-compliant financial data handling
 *   - Brazilian payment systems integration (PIX, credit cards, installments)
 * - Healthcare Services router with enhanced T027-T029 services:
 *   - LGPD data lifecycle management
 *   - AI-powered no-show prediction
 *   - CFM-compliant telemedicine sessions
 * - Real-Time Telemedicine router with Phase 3.4 T031 features:
 *   - WebSocket subscriptions for video consultation updates
 *   - Real-time encrypted chat with LGPD compliance
 *   - Presence detection for healthcare professionals
 *   - Connection quality monitoring (<50ms latency targets)
 * - Telemedicine router with T102 Phase 4 features:
 *   - CFM Resolution 2314/2022 compliant session management
 *   - Patient identity verification and medical license validation
 *   - WebRTC session orchestration with compliance monitoring
 *   - LGPD-compliant consent management and audit trails
 * - Enhanced Aesthetic Scheduling router with comprehensive features:
 *   - Multi-session treatment scheduling with Brazilian healthcare compliance
 *   - Professional certification validation for aesthetic procedures (CFM/ANVISA)
 *   - Treatment package scheduling with optimized resource allocation
 *   - Recovery period planning with follow-up appointments
 *   - Aesthetic-specific resource optimization and room allocation
 *   - Contraindication checking with pregnancy and age validation
 *   - Variable duration calculation based on procedure factors
 *   - ANVISA compliance for aesthetic medical devices and procedures
 * - Comprehensive audit logging for all operations
 */
export const appRouter = router({
  // Legacy routers (maintain backward compatibility)
  patients: patientsRouter,
  appointments: appointmentsRouter,
  ai: aiRouter,
  agents: agentRouter,
  crud: crudRouter,
  financialAgent: financialAgentRouter,
  healthcareServices: healthcareServicesRouter,
  realtimeTelemedicine: realtimeTelemedicineRouter,
  telemedicine: telemedicineRouter,
  
  // Enhanced aesthetic scheduling router with Brazilian healthcare compliance
  aestheticScheduling: aestheticSchedulingRouter,

  // Comprehensive API contracts with tRPC v11 (T016)
  // New healthcare-compliant API contracts with enhanced features
  api: apiRouter,
});

// Export the router type for use in clients
export type AppRouter = typeof appRouter;

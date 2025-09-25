/**
 * Event System Package Exports
 *
 * Comprehensive event system for healthcare applications:
 * - Type-safe event handling
 * - Healthcare compliance features
 * - Event encryption and security
 * - Circuit breaker integration
 * - Dead letter queue handling
 * - Performance monitoring
 *
 * @version 2.0.0
 * @author NeonPro Development Team
 * @compliance LGPD, ANVISA, Healthcare Standards
 */

// Core event system
export {
  EventBus,
  EventEncryptionService,
  EventMetricsCollector,
  DeadLetterQueue,
  EventHandlerCircuitBreaker,
  defaultEventBus,
  createHealthcareEventBus,
  createSimpleEventBus,
  createPatientEvent,
  createAppointmentEvent,
  createAuditEvent,
} from './event-system'

// Type exports
export type {
  EventBusConfig,
  BaseEvent,
  EventMetadata,
  EventHandler,
  EventSubscription,
  EventProcessingResult,
  DeadLetterEvent,
  EventMetrics,
  HealthcareEventTypes,
} from './event-system'
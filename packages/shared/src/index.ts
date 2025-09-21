// ============================================================================
// NeonPro Shared Package Exports
// ============================================================================

// Core library
export const shared = { version: "1.0.0" };

// Data categories according to LGPD (moved here to avoid module resolution issues)
export enum DataCategory {
  PERSONAL_DATA = "personal_data",
  SENSITIVE_DATA = "sensitive_data",
  HEALTH_DATA = "health_data",
  BIOMETRIC_DATA = "biometric_data",
  GENETIC_DATA = "genetic_data",
  LOCATION_DATA = "location_data",
  FINANCIAL_DATA = "financial_data",
  BEHAVIORAL_DATA = "behavioral_data",
}

// TODO: Temporarily simplified exports to fix build issues during migration
// These should be restored after build system is properly configured

// Essential exports only - add more as needed
export type {
  TelemetryEventType,
  TelemetrySeverity,
  HealthcareDataSensitivity,
  TelemetryEvent,
  WebVitalsEvent,
  HealthcareAccessEvent,
  AICostEvent,
  ComplianceEvent,
} from "./models/telemetry-event";

// Comment out problematic exports temporarily
// export * from "./types/api";

// TODO: Fix validators compilation and re-enable
// Essential validator function needed by API
// export { validatePatientData } from "./validators/brazilian";

// Comment out other validators until we fix the compilation issue
// export {
//   validateCPF,
//   formatCPF,
//   validateCNPJ,
//   formatCNPJ,
//   validateBrazilianPhone,
//   formatBrazilianPhone,
//   validateCEP,
//   formatCEP,
//   validateEmail,
//   BRAZILIAN_STATES,
//   HEALTHCARE_SPECIALTIES,
// } from "./validators/brazilian";

// Comment out problematic exports temporarily
// export * from "./env/ai";
// export * from "./models/healthcare-base";
// export * from "./models/ai-optimization";

// Explicit exports for backwards compatibility
export {
  HealthcareDataClassification,
} from "./models/healthcare-base";
export {
  HealthcareAIUseCase,
} from "./models/ai-optimization";

// Comment out problematic exports temporarily
// export * from "./realtime/realtime-manager";
// export * from "./telemetry";
// export * from "./services/winston-logging";

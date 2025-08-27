/**
 * Constitutional Service Layer - Main Exports
 *
 * Constitutional governance framework for NeonPro AI Healthcare Platform
 * providing self-governing service architecture with automated policy
 * enforcement and healthcare compliance integration.
 */

// Core governance exports
export { ServiceConstitution } from "./governance/service-constitution";

// Type exports
export type {
  ComplianceRequirement,
  GovernanceContext,
  GovernanceMetrics,
  Policy,
  PolicyEvaluationResult,
  ServiceConstitutionConfig,
} from "./governance/service-constitution";

// Re-export governance module
export * as Governance from "./governance";

/**
 * Audit Trail System - Main Exports
 * 
 * Immutable audit trail system for NeonPro AI Healthcare Platform
 * providing cryptographic immutability, blockchain verification,
 * and healthcare compliance automation.
 */

// Core audit logging
export { ImmutableAuditLogger } from './core/immutable-audit-logger';
export type {
  AuditEvent,
  AuditConfig,
  AuditMetrics,
  ImmutableChain
} from './core/immutable-audit-logger';

// Blockchain verification
export { BlockchainStorage } from './blockchain/blockchain-storage';
export type {
  BlockchainTransaction,
  BlockchainConfig,
  ProofOfIntegrity,
  BlockchainMetrics,
  VerificationResult
} from './blockchain/blockchain-storage';

// Compliance auditing
export { ComplianceAuditor } from './compliance/compliance-auditor';
export type {
  ComplianceRule,
  ComplianceViolation,
  ComplianceReport,
  ComplianceConfig,
  ComplianceMetrics,
  ComplianceAuditResult
} from './compliance/compliance-auditor';

// Module re-exports
export * as Core from './core';
export * as Blockchain from './blockchain';
export * as Compliance from './compliance';
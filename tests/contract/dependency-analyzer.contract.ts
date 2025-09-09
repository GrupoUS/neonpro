/**
 * Test contract re-exports for Dependency Analyzer
 * Canonical contract lives under specs/. This shim avoids duplicate definitions
 * and keeps format/lint/type checks green.
 */

export * from '../../specs/003-monorepo-audit-optimization/contracts/dependency-analyzer.contract'

// Security package exports

// Re-export commonly used types from unified audit service
export type { AuditConfig, AuditEvent, AuditFilters, } from './audit/unified-audit-service'
export {
  AuditEventType,
  AuditOutcome,
  AuditSeverity,
  UnifiedAuditService,
} from './audit/unified-audit-service'
export type { MfaConfig, MfaVerificationResult, } from './auth/mfa-service'
export * from './auth/mfa-service'
export { MfaMethod, } from './auth/mfa-service'

export * from './middleware/input-validation'

// Enterprise Authentication - Consolidated from @neonpro/auth
export * from './auth/enterprise'
export type { RateLimitConfig, RateLimitResult, } from './middleware/rate-limiting'
export * from './middleware/rate-limiting'
export type { SecurityHeadersConfig, } from './middleware/security-headers'
export * from './middleware/security-headers'

// Auth services
export * from './auth/RealAuthService'
export type {
  AuthConfig,
  LoginCredentials,
  LoginResult,
  User,
} from './auth/supabase-adapter/SupabaseAuthAdapter'

/**
 * @file Authentication Services
 *
 * Central export point for all authentication-related services
 *
 * @version 1.0.0
 * @author NeonPro Platform Team
 * Compliance: LGPD, ANVISA, ISO 27001, NIST Cybersecurity Framework
 */

// Password Migration Service
export {
  createPasswordMigrationService,
  passwordMigrationHealthCheck,
  PasswordMigrationService,
} from '../lib/password-migration'
export type {
  MigrationMetrics,
  PasswordAlgorithm,
  PasswordMigrationConfig,
  PasswordVerificationResult,
} from '../lib/password-migration'
export {
  DEFAULT_CONFIG,
  MigrationEventSchema,
  PasswordHashMetadataSchema,
  PasswordVerificationRequestSchema,
} from '../lib/password-migration'

// Session Management Service
export {
  createSessionManager,
  sessionHealthCheck,
  SessionManager,
} from '../../shared/src/services/session-management'
export type {
  Session,
  SessionConfig,
  SessionMetrics,
  SessionStatus,
  SessionType,
} from '../../shared/src/services/session-management'

// Legacy exports (for backward compatibility)
export {
  cleanupExpiredSessions,
  DEFAULT_SESSION_CONFIG,
  validateSessionCompliance,
} from '../../shared/src/services/session-management'

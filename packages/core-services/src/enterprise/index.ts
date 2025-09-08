/**
 * Enterprise Services Integration
 *
 * Exporta todos os serviços enterprise para integração com EnhancedServiceBase:
 * - EnterpriseCacheService: Cache multicamadas (memory/redis/db)
 * - EnterpriseAnalyticsService: Analytics automático healthcare
 * - EnterpriseSecurityService: Security integrado (RBAC/encryption/MFA)
 * - UnifiedAuditService: Audit trail completo e compliance
 */

// export { UnifiedAuditService as EnterpriseAuditService } from "@neonpro/security";
export type {
  AnalyticsEvent,
  AnalyticsInsight,
  AnalyticsMetric,
  AuditEvent,
  AuditRecord,
  CacheKey,
  CacheOptions,
  CacheStats,
  ComplianceReport,
  Permission,
  Role,
  SecurityPolicy,
} from '../types'
export { EnterpriseAnalyticsService, } from './analytics/EnterpriseAnalyticsService'
export { EnterpriseCacheService, } from './cache/EnterpriseCacheService'
export { EnterpriseSecurityService, } from './security/EnterpriseSecurityService'

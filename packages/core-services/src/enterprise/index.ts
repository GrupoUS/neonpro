/**
 * Enterprise Services Integration
 *
 * Exporta todos os serviços enterprise para integração com EnhancedServiceBase:
 * - EnterpriseCacheService: Cache multicamadas (memory/redis/db)
 * - EnterpriseAnalyticsService: Analytics automático healthcare
 * - EnterpriseSecurityService: Security integrado (RBAC/encryption/MFA)
 * - EnterpriseAuditService: Audit trail completo e compliance
 */

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
} from '../types';
export { EnterpriseAnalyticsService } from './analytics/EnterpriseAnalyticsService';
export { EnterpriseAuditService } from './audit/EnterpriseAuditService';
export { EnterpriseCacheService } from './cache/EnterpriseCacheService';
export { EnterpriseSecurityService } from './security/EnterpriseSecurityService';

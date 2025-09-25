/**
 * Database Connection Package Exports
 *
 * Comprehensive database management for healthcare applications:
 * - Connection pooling and optimization
 * - Transaction management
 * - Healthcare compliance features
 * - Circuit breaker integration
 * - Performance monitoring
 * - Data encryption
 *
 * @version 2.0.0
 * @author NeonPro Development Team
 * Compliance: LGPD, ANVISA, Healthcare Standards
 */

// Core database management
export {
  DatabaseManager,
  ConnectionPool,
  DatabaseEncryptionService,
  DatabaseCircuitBreaker,
  DatabaseManagerRegistry,
  getDatabaseRegistry,
  createDatabaseManager,
  getDatabaseManager,
  createHealthcareDatabaseManager,
  createAnalyticsDatabaseManager,
} from './connection-manager'

// Type exports
export type {
  DatabaseConfig,
  DatabaseType,
  ConnectionStatus,
  QueryResult,
  IsolationLevel,
  DatabaseHealthMetrics,
} from './connection-manager'
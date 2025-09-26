import type { BaseEntity } from './common.js';

// Database entity base
export interface DatabaseEntity extends BaseEntity {
  version: number;
  createdBy?: string;
  updatedBy?: string;
}

// Prisma-specific types
export interface PrismaTransaction {
  id: string;
  startedAt: Date;
  completedAt?: Date;
  rollbackAt?: Date;
  status: 'pending' | 'committed' | 'rolled_back';
}

// Migration types
export interface Migration {
  id: string;
  name: string;
  appliedAt: Date;
  version: string;
  checksum: string;
}

// Audit log for database changes (LGPD requirement)
export interface AuditLog extends DatabaseEntity {
  entityType: string;
  entityId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW';
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  userId: string;
  userRole: string;
  ipAddress: string;
  userAgent?: string;
  timestamp: Date;
  reason?: string;
}

// Database connection types
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  pool: {
    min: number;
    max: number;
    idleTimeoutMillis: number;
  };
}

// Supabase specific types
export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
  schema: string;
}

// Query result types
export interface QueryResult<T = unknown> {
  data: T[];
  count?: number;
  error?: string;
  status: number;
  statusText: string;
}

export interface SingleQueryResult<T = unknown> {
  data: T | null;
  error?: string;
  status: number;
  statusText: string;
}

// Database operation types
export type DatabaseOperation =
  | 'CREATE'
  | 'READ'
  | 'UPDATE'
  | 'DELETE'
  | 'UPSERT';

export interface DatabaseOperationContext {
  operation: DatabaseOperation;
  entityType: string;
  entityId?: string;
  userId?: string;
  timestamp: Date;
}

// Backup and restore types
export interface BackupConfig {
  enabled: boolean;
  schedule: string; // cron expression
  retention: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  storage: {
    type: 'local' | 's3' | 'gcs';
    path: string;
    credentials?: Record<string, string>;
  };
}

export interface BackupResult {
  id: string;
  startedAt: Date;
  completedAt?: Date;
  status: 'running' | 'completed' | 'failed';
  size?: number;
  error?: string;
  location: string;
}

// Health check types
export interface DatabaseHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency: number; // ms
  activeConnections: number;
  maxConnections: number;
  lastChecked: Date;
  error?: string;
}

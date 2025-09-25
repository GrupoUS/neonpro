// CopilotKit state management types for healthcare AI services
import { z } from 'zod';
import { AgentType } from './hooks';

// State configuration
export const StateConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string().default('1.0'),
  type: z.enum(['session', 'patient', 'agent', 'global']),
  persistence: z.object({
    enabled: z.boolean().default(true),
    strategy: z.enum(['local_storage', 'session_storage', 'memory', 'database']),
    ttl: z.number().default(3600000), // 1 hour
    backupInterval: z.number().default(300000), // 5 minutes
    compression: z.boolean().default(false)
  }).default({}),
  sync: z.object({
    enabled: z.boolean().default(true),
    realtime: z.boolean().default(false),
    debounceTime: z.number().default(1000),
    mergeStrategy: z.enum(['overwrite', 'merge', 'merge_deep', 'merge_patch']).default('merge_deep'),
    conflictResolution: z.enum(['last_write_wins', 'manual', 'timestamp_based', 'version_based']).default('last_write_wins')
  }).default({}),
  validation: z.object({
    enabled: z.boolean().default(true),
    schema: z.unknown().optional(),
    strict: z.boolean().default(false),
    validateOnWrite: z.boolean().default(true),
    validateOnRead: z.boolean().default(false)
  }).default({}),
  security: z.object({
    encryption: z.boolean().default(false),
    accessControl: z.boolean().default(true),
    auditChanges: z.boolean().default(true),
    sanitizeOnSave: z.boolean().default(true)
  }).default({}),
  performance: z.object({
    maxStateSize: z.number().default(1024 * 1024), // 1MB
    maxHistorySize: z.number().default(100),
    enableCompression: z.boolean().default(true),
    enableCaching: z.boolean().default(true)
  }).default({})
});

export type StateConfig = z.infer<typeof StateConfigSchema>;

// State metadata
export const StateMetadataSchema = z.object({
  createdAt: z.date(),
  updatedAt: z.date(),
  version: z.number().default(1),
  lastAccessed: z.date(),
  accessCount: z.number().default(0),
  size: z.number().default(0),
  checksum: z.string().optional(),
  tags: z.array(z.string()).default([]),
  source: z.enum(['user', 'system', 'agent', 'external']),
  confidence: z.number().min(0).max(1).optional()
});

export type StateMetadata = z.infer<typeof StateMetadataSchema>;

// State entry
export const StateEntrySchema = z.object({
  key: z.string(),
  value: z.unknown(),
  metadata: StateMetadataSchema,
  timestamp: z.date()
});

export type StateEntry<T = any> = z.infer<typeof StateEntrySchema> & {
  value: T;
};

// State history entry
export const StateHistoryEntrySchema = z.object({
  id: z.string(),
  timestamp: z.date(),
  type: z.enum(['create', 'update', 'delete', 'merge', 'patch']),
  changes: z.record(z.unknown()),
  previousValue: z.unknown().optional(),
  newValue: z.unknown().optional(),
  userId: z.string(),
  sessionId: z.string(),
  version: z.number(),
  metadata: z.record(z.unknown()).optional()
});

export type StateHistoryEntry = z.infer<typeof StateHistoryEntrySchema>;

// State validation result
export const StateValidationResultSchema = z.object({
  valid: z.boolean(),
  errors: z.array(z.string()),
  warnings: z.array(z.string()),
  score: z.number().min(0).max(1),
  schema: z.string().optional(),
  details: z.record(z.unknown()).optional()
});

export type StateValidationResult = z.infer<typeof StateValidationResultSchema>;

// State conflict
export const StateConflictSchema = z.object({
  id: z.string(),
  key: z.string(),
  localValue: z.unknown(),
  remoteValue: z.unknown(),
  localVersion: z.number(),
  remoteVersion: z.number(),
  timestamp: z.date(),
  resolved: z.boolean().default(false),
  resolution: z.enum(['local', 'remote', 'merge', 'manual']).optional(),
  resolvedValue: z.unknown().optional(),
  resolvedBy: z.string().optional(),
  resolvedAt: z.date().optional()
});

export type StateConflict = z.infer<typeof StateConflictSchema>;

// Session state
export const SessionStateSchema = z.object({
  id: z.string(),
  userId: z.string(),
  patientId: z.string().optional(),
  startedAt: z.date(),
  lastActivity: z.date(),
  expiresAt: z.date(),
  status: z.enum(['active', 'inactive', 'expired', 'terminated']),
  context: z.record(z.unknown()).optional(),
  agents: z.array(z.object({
    type: AgentType,
    id: string,
    state: z.record(z.unknown()),
    lastUsed: z.date()
  })),
  metadata: z.object({
    userAgent: z.string().optional(),
    ipAddress: z.string().optional(),
    locale: z.string().default('pt-BR'),
    features: z.array(z.string()).default([]),
    config: z.record(z.unknown()).optional()
  })
});

export type SessionState = z.infer<typeof SessionStateSchema>;

// Patient state
export const PatientStateSchema = z.object({
  patientId: z.string(),
  sessionId: z.string(),
  currentAssessment: z.record(z.unknown()).optional(),
  treatmentPlan: z.record(z.unknown()).optional(),
  medications: z.array(z.record(z.unknown())).optional(),
  vitalSigns: z.record(z.unknown()).optional(),
  labResults: z.array(z.record(z.unknown())).optional(),
  imagingResults: z.array(z.record(z.unknown())).optional(),
  allergies: z.array(z.string()).optional(),
  medicalHistory: z.array(z.record(z.unknown())).optional(),
  lastUpdated: z.date(),
  version: z.number().default(1),
  compliance: z.object({
    lgpdValidated: z.boolean(),
    piiRedacted: z.boolean(),
    auditLogId: z.string().optional()
  }).optional()
});

export type PatientState = z.infer<typeof PatientStateSchema>;

// Agent state
export const AgentStateEntrySchema = z.object({
  agentId: z.string(),
  agentType: AgentType,
  state: z.record(z.unknown()),
  status: z.enum(['idle', 'thinking', 'responding', 'error', 'completed']),
  isThinking: z.boolean().default(false),
  isLoading: z.boolean().default(false),
  error: z.string().optional(),
  lastActivity: z.date(),
  sessionId: z.string(),
  context: z.record(z.unknown()).optional(),
  metadata: z.object({
    processingTime: z.number().optional(),
    tokensUsed: z.number().optional(),
    cost: z.number().optional(),
    model: z.string().optional()
  }).optional()
});

export type AgentStateEntry = z.infer<typeof AgentStateEntrySchema>;

// State manager interface
export interface IStateManager {
  // State operations
  get<T>(key: string, defaultValue?: T): Promise<T | undefined>;
  set<T>(key: string, value: T): Promise<void>;
  update<T>(key: string, updater: (current: T | undefined) => T): Promise<void>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  
  // State queries
  keys(): Promise<string[]>;
  values<T>(): Promise<T[]>;
  entries<T>(): Promise<[string, T][]>;
  size(): Promise<number>;
  clear(): Promise<void>;
  
  // State history
  getHistory(key: string, limit?: number): Promise<StateHistoryEntry[]>;
  getVersion(key: string, version: number): Promise<StateEntry | undefined>;
  rollback(key: string, version: number): Promise<void>;
  
  // State validation
  validate(key: string, value: unknown): Promise<StateValidationResult>;
  validateSchema(key: string, value: unknown): Promise<StateValidationResult>;
  
  // State synchronization
  sync(): Promise<void>;
  pushChanges(): Promise<void>;
  pullChanges(): Promise<void>;
  
  // Conflict resolution
  getConflicts(): Promise<StateConflict[]>;
  resolveConflict(conflictId: string, resolution: 'local' | 'remote' | 'merge', mergedValue?: unknown): Promise<void>;
  
  // State persistence
  save(): Promise<void>;
  load(): Promise<void>;
  backup(): Promise<string>;
  restore(backup: string): Promise<void>;
  
  // State metrics
  getMetrics(): StateMetrics;
  
  // Event handling
  on(event: string, handler: (data: any) => void): void;
  off(event: string, handler: (data: any) => void): void;
}

// Session manager interface
export interface ISessionManager {
  // Session operations
  createSession(userId: string, patientId?: string): Promise<SessionState>;
  getSession(sessionId: string): Promise<SessionState | undefined>;
  updateSession(sessionId: string, updates: Partial<SessionState>): Promise<void>;
  deleteSession(sessionId: string): Promise<void>;
  
  // Session queries
  getUserSessions(userId: string): Promise<SessionState[]>;
  getPatientSessions(patientId: string): Promise<SessionState[]>;
  getActiveSessions(): Promise<SessionState[]>;
  
  // Session lifecycle
  extendSession(sessionId: string, duration: number): Promise<void>;
  expireSession(sessionId: string): Promise<void>;
  terminateSession(sessionId: string): Promise<void>;
  
  // Session validation
  validateSession(sessionId: string): Promise<boolean>;
  isSessionExpired(sessionId: string): Promise<boolean>;
  
  // Session cleanup
  cleanupExpiredSessions(): Promise<number>;
  
  // Session metrics
  getSessionMetrics(): SessionMetrics;
}

// State context provider interface
export interface IStateContextProvider {
  // Context management
  getContext(): StateContext;
  updateContext(updates: Partial<StateContext>): void;
  mergeContext(updates: Partial<StateContext>): void;
  
  // Context validation
  validateContext(): StateValidationResult;
  
  // Context subscription
  subscribe(callback: (context: StateContext) => void): () => void;
  unsubscribe(callback: (context: StateContext) => void): void;
  
  // Context persistence
  saveContext(): Promise<void>;
  loadContext(): Promise<void>;
}

// State context
export const StateContextSchema = z.object({
  sessionId: z.string(),
  userId: z.string(),
  patientId: z.string().optional(),
  timestamp: z.date(),
  locale: z.string().default('pt-BR'),
  environment: z.enum(['development', 'staging', 'production']),
  features: z.array(z.string()).default([]),
  config: z.record(z.unknown()).optional(),
  metadata: z.record(z.unknown()).optional()
});

export type StateContext = z.infer<typeof StateContextSchema>;

// State event types
export type StateEvent = 
  | { type: 'state.created'; key: string; value: unknown; timestamp: Date }
  | { type: 'state.updated'; key: string; oldValue: unknown; newValue: unknown; timestamp: Date }
  | { type: 'state.deleted'; key: string; oldValue: unknown; timestamp: Date }
  | { type: 'state.validated'; key: string; result: StateValidationResult; timestamp: Date }
  | { type: 'state.synced'; keys: string[]; timestamp: Date }
  | { type: 'state.conflict.detected'; conflict: StateConflict; timestamp: Date }
  | { type: 'state.conflict.resolved'; conflict: StateConflict; timestamp: Date }
  | { type: 'state.backup.created'; backupId: string; timestamp: Date }
  | { type: 'state.backup.restored'; backupId: string; timestamp: Date }
  | { type: 'session.created'; session: SessionState; timestamp: Date }
  | { type: 'session.updated'; session: SessionState; timestamp: Date }
  | { type: 'session.expired'; sessionId: string; timestamp: Date }
  | { type: 'session.terminated'; sessionId: string; timestamp: Date }
  | { type: 'context.updated'; oldContext: StateContext; newContext: StateContext; timestamp: Date };

// State metrics
export const StateMetricsSchema = z.object({
  totalStates: z.number(),
  stateSizeDistribution: z.object({
    small: z.number(),   // < 1KB
    medium: z.number(),  // 1KB - 100KB
    large: z.number(),   // 100KB - 1MB
    extraLarge: z.number() // > 1MB
  }),
  operationCounts: z.object({
    get: z.number(),
    set: z.number(),
    update: z.number(),
    delete: z.number(),
    validate: z.number()
  }),
  averageOperationTime: z.number(),
  cacheHitRate: z.number(),
  syncConflicts: z.number(),
  validationFailures: z.number(),
  lastCleanup: z.date(),
  memoryUsage: z.number()
});

export type StateMetrics = z.infer<typeof StateMetricsSchema>;

// Session metrics
export const SessionMetricsSchema = z.object({
  totalSessions: z.number(),
  activeSessions: z.number(),
  expiredSessions: z.number(),
  averageSessionDuration: z.number(),
  sessionsByUser: z.record(z.number()),
  sessionsByPatient: z.record(z.number()),
  lastCleanup: z.date(),
  memoryUsage: z.number()
});

export type SessionMetrics = z.infer<typeof SessionMetricsSchema>;

// State persistence adapter interface
export interface IStatePersistenceAdapter {
  // Persistence operations
  save(key: string, value: unknown, metadata?: StateMetadata): Promise<void>;
  load(key: string): Promise<StateEntry | undefined>;
  delete(key: string): Promise<boolean>;
  exists(key: string): Promise<boolean>;
  
  // Batch operations
  saveBatch(entries: StateEntry[]): Promise<void>;
  loadBatch(keys: string[]): Promise<StateEntry[]>;
  
  // Query operations
  query(filter: Record<string, unknown>): Promise<StateEntry[]>;
  keys(): Promise<string[]>;
  
  // History operations
  saveHistory(entry: StateHistoryEntry): Promise<void>;
  getHistory(key: string, limit?: number): Promise<StateHistoryEntry[]>;
  
  // Maintenance
  cleanup(expiredBefore: Date): Promise<number>;
  backup(): Promise<string>;
  restore(backup: string): Promise<void>;
  
  // Metrics
  getMetrics(): PersistenceMetrics;
}

// Persistence metrics
export const PersistenceMetricsSchema = z.object({
  totalEntries: z.number(),
  totalSize: z.number(),
  operationCounts: z.object({
    save: z.number(),
    load: z.number(),
    delete: z.number(),
    query: z.number()
  }),
  averageOperationTime: z.number(),
  errorRate: z.number(),
  cacheHitRate: z.number(),
  lastBackup: z.date(),
  lastCleanup: z.date()
});

export type PersistenceMetrics = z.infer<typeof PersistenceMetricsSchema>;

// State synchronization adapter interface
export interface IStateSyncAdapter {
  // Sync operations
  pushChanges(changes: StateHistoryEntry[]): Promise<void>;
  pullChanges(since: Date): Promise<StateHistoryEntry[]>;
  resolveConflicts(conflicts: StateConflict[]): Promise<void>;
  
  // Real-time sync
  subscribeToChanges(callback: (changes: StateHistoryEntry[]) => void): Promise<void>;
  unsubscribeFromChanges(callback: (changes: StateHistoryEntry[]) => void): Promise<void>;
  
  // Conflict detection
  detectConflicts(localChanges: StateHistoryEntry[], remoteChanges: StateHistoryEntry[]): Promise<StateConflict[]>;
  
  // Sync status
  getSyncStatus(): Promise<{
    lastSync: Date;
    isSyncing: boolean;
    conflictsCount: number;
  }>;
  
  // Metrics
  getSyncMetrics(): SyncMetrics;
}

// Sync metrics
export const SyncMetricsSchema = z.object({
  syncCount: z.number(),
  averageSyncTime: z.number(),
  conflictsDetected: z.number(),
  conflictsResolved: z.number(),
  lastSync: z.date(),
  syncSuccessRate: z.number()
});

export type SyncMetrics = z.infer<typeof SyncMetricsSchema>;

// State validator interface
export interface IStateValidator {
  // Validation operations
  validate(key: string, value: unknown, schema?: unknown): Promise<StateValidationResult>;
  validateSchema(schema: unknown, value: unknown): Promise<StateValidationResult>;
  
  // Schema operations
  registerSchema(key: string, schema: unknown): void;
  getSchema(key: string): unknown | undefined;
  removeSchema(key: string): void;
  
  // Validation rules
  addValidationRule(key: string, rule: (value: unknown) => Promise<boolean>): void;
  removeValidationRule(key: string): void;
  
  // Custom validation
  validateCustom(key: string, value: unknown, rules: Array<(value: unknown) => Promise<boolean>>): Promise<StateValidationResult>;
}

// State encryption interface
export interface IStateEncryption {
  // Encryption operations
  encrypt(value: unknown, key?: string): Promise<string>;
  decrypt(encrypted: string, key?: string): Promise<unknown>;
  
  // Key management
  generateKey(): Promise<string>;
  rotateKey(oldKey: string, newKey: string): Promise<void>;
  
  // Validation
  validateKey(key: string): Promise<boolean>;
}

// State compression interface
export interface IStateCompression {
  // Compression operations
  compress(value: unknown): Promise<string>;
  decompress(compressed: string): Promise<unknown>;
  
  // Compression info
  getCompressionRatio(original: unknown, compressed: string): number;
  isCompressed(value: unknown): boolean;
}
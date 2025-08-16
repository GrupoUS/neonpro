/**
 * NeonPro Backup & Recovery System Types
 * Story 1.8: Sistema de Backup e Recovery
 *
 * Tipos e interfaces para o sistema completo de backup automático,
 * backup incremental, disaster recovery e monitoramento.
 */

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Tipos de backup disponíveis
 */
export enum BackupType {
  FULL = 'FULL', // Backup completo
  INCREMENTAL = 'INCREMENTAL', // Backup incremental
  DIFFERENTIAL = 'DIFFERENTIAL', // Backup diferencial
  SNAPSHOT = 'SNAPSHOT', // Snapshot do sistema
}

/**
 * Status do backup
 */
export enum BackupStatus {
  PENDING = 'PENDING', // Aguardando execução
  RUNNING = 'RUNNING', // Em execução
  COMPLETED = 'COMPLETED', // Concluído com sucesso
  FAILED = 'FAILED', // Falhou
  CANCELLED = 'CANCELLED', // Cancelado
  EXPIRED = 'EXPIRED', // Expirado
}

/**
 * Prioridade do backup
 */
export enum BackupPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

/**
 * Tipos de storage para backup
 */
export enum StorageType {
  LOCAL = 'LOCAL', // Armazenamento local
  S3 = 'S3', // Amazon S3
  AZURE = 'AZURE', // Azure Blob Storage
  GCS = 'GCS', // Google Cloud Storage
  FTP = 'FTP', // FTP Server
  SFTP = 'SFTP', // SFTP Server
}

/**
 * Status de recuperação
 */
export enum RecoveryStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  PARTIAL = 'PARTIAL',
}

/**
 * Tipos de dados para backup
 */
export enum DataType {
  DATABASE = 'DATABASE', // Dados do banco
  FILES = 'FILES', // Arquivos do sistema
  LOGS = 'LOGS', // Logs da aplicação
  CONFIG = 'CONFIG', // Configurações
  MEDIA = 'MEDIA', // Arquivos de mídia
  DOCUMENTS = 'DOCUMENTS', // Documentos
}

// ============================================================================
// INTERFACES BASE
// ============================================================================

/**
 * Configuração base de backup
 */
export type BackupConfig = {
  id: string;
  name: string;
  description?: string;
  type: BackupType;
  dataTypes: DataType[];
  schedule: BackupSchedule;
  retention: RetentionPolicy;
  storage: StorageConfig;
  compression: CompressionConfig;
  encryption: EncryptionConfig;
  priority: BackupPriority;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
};

/**
 * Agendamento de backup
 */
export type BackupSchedule = {
  frequency: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
  interval?: number; // Para frequência customizada
  time?: string; // Horário específico (HH:mm)
  daysOfWeek?: number[]; // Dias da semana (0-6)
  daysOfMonth?: number[]; // Dias do mês (1-31)
  timezone: string;
  enabled: boolean;
};

/**
 * Política de retenção
 */
export type RetentionPolicy = {
  keepDaily: number; // Quantos backups diários manter
  keepWeekly: number; // Quantos backups semanais manter
  keepMonthly: number; // Quantos backups mensais manter
  keepYearly: number; // Quantos backups anuais manter
  maxAge: number; // Idade máxima em dias
  maxSize: number; // Tamanho máximo em bytes
  autoCleanup: boolean; // Limpeza automática
};

/**
 * Configuração de storage
 */
export type StorageConfig = {
  type: StorageType;
  path: string;
  credentials?: StorageCredentials;
  options?: Record<string, any>;
  encryption?: boolean;
  compression?: boolean;
};

/**
 * Credenciais de storage
 */
export type StorageCredentials = {
  accessKey?: string;
  secretKey?: string;
  region?: string;
  bucket?: string;
  endpoint?: string;
  username?: string;
  password?: string;
  host?: string;
  port?: number;
};

/**
 * Configuração de compressão
 */
export type CompressionConfig = {
  enabled: boolean;
  algorithm: 'gzip' | 'bzip2' | 'lz4' | 'zstd';
  level: number; // Nível de compressão (1-9)
};

/**
 * Configuração de criptografia
 */
export type EncryptionConfig = {
  enabled: boolean;
  algorithm: 'AES-256' | 'AES-128' | 'ChaCha20';
  keyDerivation: 'PBKDF2' | 'Argon2';
  keySize: number;
};

// ============================================================================
// INTERFACES DE EXECUÇÃO
// ============================================================================

/**
 * Registro de backup
 */
export type BackupRecord = {
  id: string;
  configId: string;
  type: BackupType;
  status: BackupStatus;
  startTime: Date;
  endTime?: Date;
  duration?: number; // Duração em segundos
  size: number; // Tamanho em bytes
  compressedSize?: number; // Tamanho comprimido
  filesCount: number;
  checksum: string;
  path: string;
  metadata: BackupMetadata;
  error?: string;
  warnings: string[];
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Metadados do backup
 */
export type BackupMetadata = {
  version: string;
  source: string;
  dataTypes: DataType[];
  tables?: string[]; // Tabelas incluídas (para DB)
  excludedPaths?: string[]; // Caminhos excluídos
  environment: string;
  hostname: string;
  userId: string;
  clientVersion: string;
  dependencies?: string[];
};

/**
 * Progresso do backup
 */
export type BackupProgress = {
  backupId: string;
  status: BackupStatus;
  percentage: number;
  currentFile?: string;
  filesProcessed: number;
  totalFiles: number;
  bytesProcessed: number;
  totalBytes: number;
  speed: number; // Bytes por segundo
  eta: number; // Tempo estimado em segundos
  startTime: Date;
  lastUpdate: Date;
};

// ============================================================================
// INTERFACES DE RECOVERY
// ============================================================================

/**
 * Solicitação de recuperação
 */
export type RecoveryRequest = {
  id: string;
  backupId: string;
  type: 'FULL' | 'PARTIAL' | 'POINT_IN_TIME';
  targetTime?: Date; // Para point-in-time recovery
  targetPath: string;
  options: RecoveryOptions;
  requestedBy: string;
  requestedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  status: RecoveryStatus;
};

/**
 * Opções de recuperação
 */
export type RecoveryOptions = {
  overwriteExisting: boolean;
  validateIntegrity: boolean;
  restorePermissions: boolean;
  restoreTimestamps: boolean;
  excludePaths?: string[];
  includePaths?: string[];
  renameConflicts: boolean;
  dryRun: boolean;
};

/**
 * Progresso da recuperação
 */
export type RecoveryProgress = {
  recoveryId: string;
  status: RecoveryStatus;
  percentage: number;
  currentFile?: string;
  filesRestored: number;
  totalFiles: number;
  bytesRestored: number;
  totalBytes: number;
  speed: number;
  eta: number;
  startTime: Date;
  lastUpdate: Date;
  errors: string[];
  warnings: string[];
};

// ============================================================================
// INTERFACES DE MONITORAMENTO
// ============================================================================

/**
 * Métricas de backup
 */
export type BackupMetrics = {
  totalBackups: number;
  successfulBackups: number;
  failedBackups: number;
  totalSize: number;
  averageDuration: number;
  lastBackupTime?: Date;
  nextBackupTime?: Date;
  storageUsage: StorageUsage;
  performanceMetrics: PerformanceMetrics;
};

/**
 * Uso de storage
 */
export type StorageUsage = {
  total: number;
  used: number;
  available: number;
  percentage: number;
  byType: Record<DataType, number>;
  byAge: Record<string, number>;
};

/**
 * Métricas de performance
 */
export type PerformanceMetrics = {
  averageSpeed: number; // MB/s
  compressionRatio: number; // Ratio de compressão
  deduplicationRatio: number; // Ratio de deduplicação
  networkUtilization: number; // % de utilização da rede
  cpuUtilization: number; // % de utilização da CPU
  memoryUtilization: number; // % de utilização da memória
};

/**
 * Alerta de backup
 */
export type BackupAlert = {
  id: string;
  type: 'FAILURE' | 'WARNING' | 'INFO' | 'CRITICAL';
  title: string;
  message: string;
  backupId?: string;
  configId?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  createdAt: Date;
  resolvedAt?: Date;
  metadata?: Record<string, any>;
};

// ============================================================================
// INTERFACES DE TESTE
// ============================================================================

/**
 * Teste de recuperação
 */
export type RecoveryTest = {
  id: string;
  name: string;
  description?: string;
  backupId: string;
  testType: 'INTEGRITY' | 'PERFORMANCE' | 'FULL_RESTORE' | 'PARTIAL_RESTORE';
  schedule: BackupSchedule;
  lastRun?: Date;
  nextRun?: Date;
  status: 'PENDING' | 'RUNNING' | 'PASSED' | 'FAILED';
  results?: TestResults;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Resultados do teste
 */
export type TestResults = {
  testId: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  status: 'PASSED' | 'FAILED' | 'WARNING';
  score: number; // Score de 0-100
  details: TestDetail[];
  performance: TestPerformance;
  recommendations: string[];
};

/**
 * Detalhe do teste
 */
export type TestDetail = {
  category: string;
  test: string;
  status: 'PASSED' | 'FAILED' | 'WARNING' | 'SKIPPED';
  message: string;
  expected?: any;
  actual?: any;
  duration: number;
};

/**
 * Performance do teste
 */
export type TestPerformance = {
  restoreSpeed: number; // MB/s
  integrityCheckTime: number; // segundos
  memoryUsage: number; // MB
  cpuUsage: number; // %
  networkUsage: number; // MB
};

// ============================================================================
// INTERFACES DE CONFIGURAÇÃO
// ============================================================================

/**
 * Configuração do sistema de backup
 */
export type BackupSystemConfig = {
  general: GeneralConfig;
  storage: StorageConfig[];
  notifications: NotificationConfig;
  security: SecurityConfig;
  performance: PerformanceConfig;
  monitoring: MonitoringConfig;
};

/**
 * Configuração geral
 */
export type GeneralConfig = {
  maxConcurrentBackups: number;
  maxConcurrentRestores: number;
  defaultRetention: RetentionPolicy;
  defaultCompression: CompressionConfig;
  defaultEncryption: EncryptionConfig;
  tempDirectory: string;
  logLevel: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  enableMetrics: boolean;
};

/**
 * Configuração de notificações
 */
export type NotificationConfig = {
  enabled: boolean;
  channels: ('EMAIL' | 'SMS' | 'SLACK' | 'WEBHOOK')[];
  onSuccess: boolean;
  onFailure: boolean;
  onWarning: boolean;
  recipients: string[];
  webhookUrl?: string;
  slackChannel?: string;
};

/**
 * Configuração de segurança
 */
export type SecurityConfig = {
  requireApproval: boolean;
  approvers: string[];
  auditLog: boolean;
  accessControl: boolean;
  encryptionRequired: boolean;
  keyRotation: boolean;
  keyRotationInterval: number; // dias
};

/**
 * Configuração de performance
 */
export type PerformanceConfig = {
  maxBandwidth: number; // MB/s
  compressionThreads: number;
  encryptionThreads: number;
  networkTimeout: number; // segundos
  retryAttempts: number;
  retryDelay: number; // segundos
  chunkSize: number; // bytes
};

/**
 * Configuração de monitoramento
 */
export type MonitoringConfig = {
  enabled: boolean;
  metricsRetention: number; // dias
  alertThresholds: AlertThresholds;
  healthChecks: HealthCheckConfig;
  reporting: ReportingConfig;
};

/**
 * Limites para alertas
 */
export type AlertThresholds = {
  failureRate: number; // %
  storageUsage: number; // %
  backupDuration: number; // horas
  missedBackups: number; // quantidade
  recoveryTime: number; // horas
};

/**
 * Configuração de health checks
 */
export type HealthCheckConfig = {
  enabled: boolean;
  interval: number; // minutos
  timeout: number; // segundos
  checks: ('STORAGE' | 'DATABASE' | 'NETWORK' | 'DISK_SPACE')[];
};

/**
 * Configuração de relatórios
 */
export type ReportingConfig = {
  enabled: boolean;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  recipients: string[];
  includeMetrics: boolean;
  includeRecommendations: boolean;
  format: 'PDF' | 'HTML' | 'JSON';
};

// ============================================================================
// TIPOS UTILITÁRIOS
// ============================================================================

/**
 * Filtros para busca de backups
 */
export type BackupFilter = {
  configId?: string;
  type?: BackupType;
  status?: BackupStatus;
  dataTypes?: DataType[];
  startDate?: Date;
  endDate?: Date;
  minSize?: number;
  maxSize?: number;
  tags?: string[];
};

/**
 * Opções de paginação
 */
export type PaginationOptions = {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
};

/**
 * Resultado paginado
 */
export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

/**
 * Resposta da API
 */
export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
  requestId: string;
};

/**
 * Evento do sistema de backup
 */
export type BackupEvent = {
  id: string;
  type:
    | 'BACKUP_STARTED'
    | 'BACKUP_COMPLETED'
    | 'BACKUP_FAILED'
    | 'RECOVERY_STARTED'
    | 'RECOVERY_COMPLETED'
    | 'RECOVERY_FAILED'
    | 'ALERT_CREATED'
    | 'CONFIG_CHANGED';
  entityId: string;
  entityType: 'BACKUP' | 'RECOVERY' | 'CONFIG' | 'ALERT';
  data: Record<string, any>;
  userId?: string;
  timestamp: Date;
  source: string;
};

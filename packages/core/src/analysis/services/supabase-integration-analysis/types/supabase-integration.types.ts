// Type definitions for Supabase Integration Pattern Analysis
// Brazilian Healthcare Compliance Focused

export interface SupabaseIntegrationAnalysisResult {
  summary: {
    totalServices: number;
    analyzedServices: number;
    overallScore: number;
    executionTime: number;
  };
  results: {
    databaseConnection: DatabaseConnectionAnalysisResult;
    rlsPattern: RLSAnalysisResult;
    realtimeSubscription: RealtimeSubscriptionAnalysisResult;
    authIntegration: AuthIntegrationAnalysisResult;
    edgeFunctionIntegration: EdgeFunctionIntegrationAnalysisResult;
    cacheStrategy: CacheStrategyAnalysisResult;
    transactionPattern: TransactionPatternAnalysisResult;
    migrationPattern: MigrationPatternAnalysisResult;
    backupRestorePattern: BackupRestorePatternAnalysisResult;
    multiTenancyPattern: MultiTenancyPatternAnalysisResult;
  };
  healthcare: {
    lgpdCompliance: number;
    patientDataEncryption: number;
    clinicalDataAccess: number;
    auditTrail: number;
  };
  recommendations: SupabaseIntegrationRecommendation[];
}

export interface DatabaseConnectionAnalysisResult {
  summary: {
    totalConnections: number;
    secureConnections: number;
    connectionPools: number;
    healthChecks: number;
  };
  connections: DatabaseConnectionData[];
  patterns: {
    connectionStrings: ConnectionStringData[];
    poolConfigurations: PoolConfigurationData[];
    healthChecks: HealthCheckData[];
  };
  healthcare: {
    patientDataConnections: number;
    encryptedConnections: number;
    complianceValidations: number;
    auditLogging: boolean;
  };
  recommendations: DatabaseConnectionRecommendation[];
}

export interface RLSAnalysisResult {
  summary: {
    totalTables: number;
    tablesWithRLS: number;
    policiesCount: number;
    securePolicies: number;
  };
  tables: RLSAnalysisData[];
  policies: RLSPolicyData[];
  healthcare: {
    patientDataTables: number;
    clinicalDataTables: number;
    compliantPolicies: number;
    auditPolicies: number;
  };
  recommendations: RLSRecommendation[];
}

export interface RealtimeSubscriptionAnalysisResult {
  summary: {
    totalSubscriptions: number;
    secureSubscriptions: number;
    patientDataSubscriptions: number;
    channelConfigurations: number;
  };
  subscriptions: RealtimeSubscriptionData[];
  channels: RealtimeChannelData[];
  healthcare: {
    patientDataUpdates: number;
    clinicalNotifications: number;
    emergencyBroadcasts: number;
    complianceChecks: number;
  };
  recommendations: RealtimeSubscriptionRecommendation[];
}

export interface AuthIntegrationAnalysisResult {
  summary: {
    totalAuthFlows: number;
    secureFlows: number;
    patientAuthFlows: number;
    professionalAuthFlows: number;
  };
  authFlows: AuthFlowData[];
  providers: AuthProviderData[];
  healthcare: {
    patientDataAccess: boolean;
    professionalValidation: boolean;
    lgpdCompliance: boolean;
    auditAuthentication: boolean;
  };
  recommendations: AuthIntegrationRecommendation[];
}

export interface EdgeFunctionIntegrationAnalysisResult {
  summary: {
    totalFunctions: number;
    secureFunctions: number;
    patientDataFunctions: number;
    optimizedFunctions: number;
  };
  functions: EdgeFunctionData[];
  integrations: EdgeFunctionIntegrationData[];
  healthcare: {
    patientDataProcessing: boolean;
    clinicalProcessing: boolean;
    complianceValidation: boolean;
    auditLogging: boolean;
  };
  recommendations: EdgeFunctionIntegrationRecommendation[];
}

export interface CacheStrategyAnalysisResult {
  summary: {
    totalCacheStrategies: number;
    secureStrategies: number;
    patientDataCache: number;
    invalidationStrategies: number;
  };
  strategies: CacheStrategyData[];
  invalidation: CacheInvalidationData[];
  healthcare: {
    patientDataCaching: boolean;
    clinicalDataCaching: boolean;
    complianceCaching: boolean;
    auditCaching: boolean;
  };
  recommendations: CacheStrategyRecommendation[];
}

export interface TransactionPatternAnalysisResult {
  summary: {
    totalTransactions: number;
    atomicTransactions: number;
    rollbackStrategies: number;
    patientDataTransactions: number;
  };
  transactions: TransactionPatternData[];
  patterns: TransactionPatternData[];
  healthcare: {
    patientDataIntegrity: boolean;
    clinicalDataConsistency: boolean;
    complianceValidation: boolean;
    auditTransactions: boolean;
  };
  recommendations: TransactionPatternRecommendation[];
}

export interface MigrationPatternAnalysisResult {
  summary: {
    totalMigrations: number;
    executedMigrations: number;
    rollbackMigrations: number;
    dataMigrations: number;
  };
  migrations: MigrationPatternData[];
  patterns: MigrationStrategyData[];
  healthcare: {
    patientDataMigrations: boolean;
    clinicalDataMigrations: boolean;
    complianceMigrations: boolean;
    auditMigrations: boolean;
  };
  recommendations: MigrationPatternRecommendation[];
}

export interface BackupRestorePatternAnalysisResult {
  summary: {
    totalBackupStrategies: number;
    automatedBackups: number;
    encryptedBackups: number;
    retentionPolicies: number;
  };
  strategies: BackupStrategyData[];
  restores: RestorePatternData[];
  healthcare: {
    patientDataBackups: boolean;
    clinicalDataBackups: boolean;
    complianceBackups: boolean;
    auditBackups: boolean;
  };
  recommendations: BackupRestoreRecommendation[];
}

export interface MultiTenancyPatternAnalysisResult {
  summary: {
    totalTenants: number;
    isolationStrategies: number;
    sharedResources: number;
    tenantSpecificResources: number;
  };
  tenants: TenantData[];
  isolation: IsolationStrategyData[];
  healthcare: {
    patientDataIsolation: boolean;
    clinicalDataIsolation: boolean;
    complianceIsolation: boolean;
    auditIsolation: boolean;
  };
  recommendations: MultiTenancyRecommendation[];
}

// Supporting data interfaces
export interface DatabaseConnectionData {
  serviceId: string;
  connectionString: string;
  connectionType: 'direct' | 'pool' | 'connectionless';
  sslEnabled: boolean;
  healthcareRelevant: boolean;
  lastActivity: Date;
}

export interface ConnectionStringData {
  id: string;
  connectionString: string;
  securityLevel: 'high' | 'medium' | 'low';
  encryptionEnabled: boolean;
  healthcareRelevant: boolean;
}

export interface PoolConfigurationData {
  serviceId: string;
  minConnections: number;
  maxConnections: number;
  connectionTimeout: number;
  healthcareRelevant: boolean;
}

export interface HealthCheckData {
  serviceId: string;
  checkInterval: number;
  timeoutMs: number;
  alertingEnabled: boolean;
  healthcareRelevant: boolean;
}

export interface DatabaseConnectionRecommendation {
  service: string;
  recommendation: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  healthcareRequirement: boolean;
}

export interface RLSAnalysisData {
  tableName: string;
  hasRLSEnabled: boolean;
  policyCount: number;
  securePolicyCount: number;
  healthcareRelevant: boolean;
}

export interface RLSPolicyData {
  tableName: string;
  policyName: string;
  policyType: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ALL';
  securityLevel: 'high' | 'medium' | 'low';
  healthcareRelevant: boolean;
}

export interface RLSRecommendation {
  table: string;
  recommendation: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  healthcareImpact: string;
}

export interface RealtimeSubscriptionData {
  subscriptionId: string;
  channel: string;
  events: string[];
  secureConnection: boolean;
  healthcareRelevant: boolean;
}

export interface RealtimeChannelData {
  channelName: string;
  accessLevel: 'public' | 'authenticated' | 'private';
  encryptionEnabled: boolean;
  healthcareRelevant: boolean;
}

export interface RealtimeSubscriptionRecommendation {
  subscription: string;
  recommendation: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  healthcareRequirement: boolean;
}

export interface AuthFlowData {
  flowId: string;
  flowType: 'email' | 'oauth' | 'sso' | 'custom';
  securityLevel: 'high' | 'medium' | 'low';
  healthcareRelevant: boolean;
}

export interface AuthProviderData {
  providerName: string;
  providerType: 'oauth' | 'saml' | 'custom';
  securityConfiguration: any;
  healthcareRelevant: boolean;
}

export interface AuthIntegrationRecommendation {
  flow: string;
  recommendation: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  healthcareRequirement: boolean;
}

export interface EdgeFunctionData {
  functionName: string;
  runtime: string;
  memoryAllocation: number;
  timeoutMs: number;
  healthcareRelevant: boolean;
}

export interface EdgeFunctionIntegrationData {
  functionName: string;
  integrationType: 'database' | 'auth' | 'storage' | 'realtime';
  securityLevel: 'high' | 'medium' | 'low';
  healthcareRelevant: boolean;
}

export interface EdgeFunctionIntegrationRecommendation {
  function: string;
  recommendation: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  healthcareRequirement: boolean;
}

export interface CacheStrategyData {
  strategyId: string;
  cacheType: 'query' | 'row_level' | 'session' | 'application';
  ttlSeconds: number;
  healthcareRelevant: boolean;
}

export interface CacheInvalidationData {
  strategyId: string;
  invalidationType: 'time_based' | 'event_based' | 'manual';
  triggers: string[];
  healthcareRelevant: boolean;
}

export interface CacheStrategyRecommendation {
  strategy: string;
  recommendation: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  healthcareRequirement: boolean;
}

export interface TransactionPatternData {
  transactionId: string;
  transactionType: 'single' | 'batch' | 'distributed';
  isolationLevel: string;
  healthcareRelevant: boolean;
}

export interface TransactionPatternRecommendation {
  transaction: string;
  recommendation: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  healthcareRequirement: boolean;
}

export interface MigrationPatternData {
  migrationId: string;
  migrationType: 'schema' | 'data' | 'schema_and_data';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'rolled_back';
  healthcareRelevant: boolean;
}

export interface MigrationStrategyData {
  strategyId: string;
  strategyType: 'automatic' | 'manual' | 'rollback_safe';
  downtimeMs: number;
  healthcareRelevant: boolean;
}

export interface MigrationPatternRecommendation {
  migration: string;
  recommendation: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  healthcareRequirement: boolean;
}

export interface BackupStrategyData {
  strategyId: string;
  backupType: 'full' | 'incremental' | 'differential';
  frequency: string;
  encryptionEnabled: boolean;
  healthcareRelevant: boolean;
}

export interface RestorePatternData {
  strategyId: string;
  restoreType: 'point_in_time' | 'full' | 'selective';
  rpoMs: number;
  rtoMs: number;
  healthcareRelevant: boolean;
}

export interface BackupRestoreRecommendation {
  strategy: string;
  recommendation: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  healthcareRequirement: boolean;
}

export interface TenantData {
  tenantId: string;
  tenantType: 'clinic' | 'hospital' | 'professional' | 'shared';
  isolationStrategy: string;
  healthcareRelevant: boolean;
}

export interface IsolationStrategyData {
  strategyId: string;
  strategyType: 'database' | 'schema' | 'row_level' | 'column_level';
  securityLevel: 'high' | 'medium' | 'low';
  healthcareRelevant: boolean;
}

export interface MultiTenancyRecommendation {
  tenant: string;
  recommendation: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  healthcareRequirement: boolean;
}

export interface SupabaseIntegrationRecommendation {
  category: string;
  recommendation: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  impact: string;
  healthcareRelevant: boolean;
  implementationComplexity: 'simple' | 'medium' | 'complex';
}

export interface SupabaseIntegrationConfig {
  projectPath: string;
  includeTestFiles?: boolean;
  healthcare: {
    patientDataPatterns: string[];
    clinicalLogicPatterns: string[];
    validationLogicPatterns: string[];
    businessLogicPatterns: string[];
    lgpdPatterns: string[];
    anvisaPatterns: string[];
    cfmPatterns: string[];
  };
  performance: {
    maxFileSize: number;
    maxFilesPerBatch: number;
    timeoutMs: number;
    parallelProcessing: boolean;
  };
  output: {
    format: 'json' | 'markdown' | 'html';
    includeMetrics: boolean;
    includeRecommendations: boolean;
    includeHealthcareAnalysis: boolean;
  };
}
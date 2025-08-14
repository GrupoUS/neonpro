/**
 * NeonPro - Third-party Integrations Framework
 * Types and interfaces for integration system
 * 
 * @version 1.0.0
 * @author NeonPro Development Team
 * @created 2025-01-27
 */

export interface IntegrationConfig {
  id: string;
  name: string;
  type: IntegrationType;
  version: string;
  enabled: boolean;
  settings: Record<string, any>;
  credentials: IntegrationCredentials;
  endpoints: IntegrationEndpoint[];
  webhooks?: WebhookConfig[];
  rateLimits: RateLimitConfig;
  retryPolicy: RetryPolicy;
  monitoring: MonitoringConfig;
  createdAt: Date;
  updatedAt: Date;
}

export interface IntegrationCredentials {
  type: 'api_key' | 'oauth2' | 'basic_auth' | 'bearer_token' | 'custom';
  apiKey?: string;
  clientId?: string;
  clientSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  username?: string;
  password?: string;
  customHeaders?: Record<string, string>;
  expiresAt?: Date;
}

export interface IntegrationEndpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers?: Record<string, string>;
  timeout: number;
  retries: number;
  rateLimit?: number;
}

export interface WebhookConfig {
  id: string;
  url: string;
  events: string[];
  secret?: string;
  active: boolean;
  retryPolicy: RetryPolicy;
  filters?: Record<string, any>;
}

export interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  burstLimit: number;
  windowSize: number;
}

export interface RetryPolicy {
  maxRetries: number;
  backoffStrategy: 'linear' | 'exponential' | 'fixed';
  initialDelay: number;
  maxDelay: number;
  retryableErrors: string[];
}

export interface MonitoringConfig {
  enabled: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  metricsEnabled: boolean;
  alertsEnabled: boolean;
  healthCheckInterval: number;
}

export enum IntegrationType {
  ERP = 'erp',
  CRM = 'crm',
  PAYMENT = 'payment',
  EMAIL = 'email',
  SMS = 'sms',
  CALENDAR = 'calendar',
  STORAGE = 'storage',
  ANALYTICS = 'analytics',
  SOCIAL_MEDIA = 'social_media',
  TELEMEDICINE = 'telemedicine',
  LAB_SYSTEM = 'lab_system',
  IMAGING = 'imaging',
  PHARMACY = 'pharmacy',
  INSURANCE = 'insurance',
  CUSTOM = 'custom'
}

export interface IntegrationRequest {
  id: string;
  integrationId: string;
  endpoint: string;
  method: string;
  headers: Record<string, string>;
  body?: any;
  timestamp: Date;
  userId?: string;
  clinicId: string;
}

export interface IntegrationResponse {
  id: string;
  requestId: string;
  status: 'success' | 'error' | 'timeout' | 'rate_limited';
  statusCode: number;
  headers: Record<string, string>;
  body?: any;
  error?: string;
  duration: number;
  timestamp: Date;
}

export interface IntegrationLog {
  id: string;
  integrationId: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  metadata?: Record<string, any>;
  timestamp: Date;
  clinicId: string;
}

export interface IntegrationMetrics {
  integrationId: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  errorRate: number;
  lastRequestAt?: Date;
  uptime: number;
  period: 'hour' | 'day' | 'week' | 'month';
  timestamp: Date;
}

export interface SyncOperation {
  id: string;
  integrationId: string;
  type: 'import' | 'export' | 'sync';
  entity: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  totalRecords: number;
  processedRecords: number;
  errorRecords: number;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  metadata?: Record<string, any>;
  clinicId: string;
}

export interface IntegrationEvent {
  id: string;
  integrationId: string;
  type: string;
  data: any;
  source: 'internal' | 'external';
  timestamp: Date;
  processed: boolean;
  retryCount: number;
  clinicId: string;
}

export interface IntegrationHealth {
  integrationId: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  lastCheck: Date;
  responseTime: number;
  errorRate: number;
  uptime: number;
  issues: string[];
  metadata?: Record<string, any>;
}

export interface IntegrationTemplate {
  id: string;
  name: string;
  description: string;
  type: IntegrationType;
  version: string;
  config: Partial<IntegrationConfig>;
  documentation: string;
  examples: Record<string, any>;
  requirements: string[];
  tags: string[];
}

export interface IntegrationConnector {
  id: string;
  name: string;
  type: IntegrationType;
  version: string;
  description: string;
  authenticate(credentials: IntegrationCredentials): Promise<boolean>;
  request(endpoint: IntegrationEndpoint, data?: any): Promise<IntegrationResponse>;
  validateConfig(config: IntegrationConfig): Promise<boolean>;
  getHealthStatus(): Promise<IntegrationHealth>;
  handleWebhook(payload: any, headers: Record<string, string>): Promise<void>;
  sync(operation: SyncOperation): Promise<void>;
}

export interface IntegrationManager {
  registerConnector(connector: IntegrationConnector): void;
  createIntegration(config: IntegrationConfig): Promise<string>;
  updateIntegration(id: string, config: Partial<IntegrationConfig>): Promise<void>;
  deleteIntegration(id: string): Promise<void>;
  getIntegration(id: string): Promise<IntegrationConfig | null>;
  listIntegrations(clinicId: string): Promise<IntegrationConfig[]>;
  testConnection(id: string): Promise<IntegrationHealth>;
  executeRequest(id: string, endpoint: string, data?: any): Promise<IntegrationResponse>;
  handleWebhook(id: string, payload: any, headers: Record<string, string>): Promise<void>;
  startSync(id: string, operation: Partial<SyncOperation>): Promise<string>;
  getMetrics(id: string, period: string): Promise<IntegrationMetrics>;
  getLogs(id: string, filters?: any): Promise<IntegrationLog[]>;
}

export interface WebhookManager {
  registerWebhook(config: WebhookConfig): Promise<string>;
  updateWebhook(id: string, config: Partial<WebhookConfig>): Promise<void>;
  deleteWebhook(id: string): Promise<void>;
  processWebhook(id: string, payload: any, headers: Record<string, string>): Promise<void>;
  validateSignature(payload: any, signature: string, secret: string): boolean;
  retryFailedWebhook(id: string): Promise<void>;
  getWebhookLogs(id: string): Promise<IntegrationLog[]>;
}

export interface RateLimiter {
  checkLimit(integrationId: string, endpoint: string): Promise<boolean>;
  incrementCounter(integrationId: string, endpoint: string): Promise<void>;
  getRemainingRequests(integrationId: string, endpoint: string): Promise<number>;
  resetLimits(integrationId: string): Promise<void>;
  getUsageStats(integrationId: string): Promise<Record<string, number>>;
}

export interface IntegrationCache {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(pattern?: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}

export interface IntegrationQueue {
  enqueue(job: IntegrationJob): Promise<string>;
  dequeue(): Promise<IntegrationJob | null>;
  getJob(id: string): Promise<IntegrationJob | null>;
  updateJob(id: string, updates: Partial<IntegrationJob>): Promise<void>;
  deleteJob(id: string): Promise<void>;
  getQueueStats(): Promise<QueueStats>;
}

export interface IntegrationJob {
  id: string;
  type: 'request' | 'sync' | 'webhook' | 'cleanup';
  integrationId: string;
  payload: any;
  priority: number;
  attempts: number;
  maxAttempts: number;
  delay: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  processedAt?: Date;
  error?: string;
  result?: any;
}

export interface QueueStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  totalJobs: number;
  averageProcessingTime: number;
}

export interface IntegrationError extends Error {
  code: string;
  integrationId: string;
  endpoint?: string;
  statusCode?: number;
  retryable: boolean;
  metadata?: Record<string, any>;
}

export interface IntegrationValidator {
  validateConfig(config: IntegrationConfig): Promise<ValidationResult>;
  validateCredentials(credentials: IntegrationCredentials): Promise<ValidationResult>;
  validateEndpoint(endpoint: IntegrationEndpoint): Promise<ValidationResult>;
  validateWebhook(webhook: WebhookConfig): Promise<ValidationResult>;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
}

export interface IntegrationSecurity {
  encryptCredentials(credentials: IntegrationCredentials): Promise<string>;
  decryptCredentials(encrypted: string): Promise<IntegrationCredentials>;
  generateApiKey(): string;
  validateApiKey(apiKey: string): boolean;
  hashWebhookSecret(secret: string): string;
  verifyWebhookSignature(payload: any, signature: string, secret: string): boolean;
}

export interface IntegrationAudit {
  logRequest(request: IntegrationRequest): Promise<void>;
  logResponse(response: IntegrationResponse): Promise<void>;
  logError(error: IntegrationError): Promise<void>;
  logEvent(event: IntegrationEvent): Promise<void>;
  getAuditTrail(integrationId: string, filters?: any): Promise<IntegrationLog[]>;
}

export interface IntegrationNotification {
  sendAlert(type: string, message: string, metadata?: any): Promise<void>;
  sendHealthAlert(health: IntegrationHealth): Promise<void>;
  sendErrorAlert(error: IntegrationError): Promise<void>;
  sendSyncAlert(operation: SyncOperation): Promise<void>;
}

export interface IntegrationScheduler {
  scheduleJob(job: ScheduledJob): Promise<string>;
  updateJob(id: string, job: Partial<ScheduledJob>): Promise<void>;
  deleteJob(id: string): Promise<void>;
  getJob(id: string): Promise<ScheduledJob | null>;
  listJobs(integrationId?: string): Promise<ScheduledJob[]>;
  executeJob(id: string): Promise<void>;
}

export interface ScheduledJob {
  id: string;
  name: string;
  integrationId: string;
  type: 'sync' | 'health_check' | 'cleanup' | 'custom';
  schedule: string; // cron expression
  payload: any;
  enabled: boolean;
  lastRun?: Date;
  nextRun: Date;
  retryPolicy: RetryPolicy;
  metadata?: Record<string, any>;
}

export interface IntegrationAnalytics {
  trackRequest(request: IntegrationRequest): Promise<void>;
  trackResponse(response: IntegrationResponse): Promise<void>;
  trackError(error: IntegrationError): Promise<void>;
  getUsageReport(integrationId: string, period: string): Promise<UsageReport>;
  getPerformanceReport(integrationId: string, period: string): Promise<PerformanceReport>;
  getErrorReport(integrationId: string, period: string): Promise<ErrorReport>;
}

export interface UsageReport {
  integrationId: string;
  period: string;
  totalRequests: number;
  uniqueUsers: number;
  topEndpoints: Array<{ endpoint: string; count: number }>;
  requestsByHour: Array<{ hour: number; count: number }>;
  requestsByDay: Array<{ day: string; count: number }>;
}

export interface PerformanceReport {
  integrationId: string;
  period: string;
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  slowestEndpoints: Array<{ endpoint: string; avgTime: number }>;
  responseTimeByHour: Array<{ hour: number; avgTime: number }>;
}

export interface ErrorReport {
  integrationId: string;
  period: string;
  totalErrors: number;
  errorRate: number;
  errorsByType: Array<{ type: string; count: number }>;
  errorsByEndpoint: Array<{ endpoint: string; count: number }>;
  errorsByHour: Array<{ hour: number; count: number }>;
}

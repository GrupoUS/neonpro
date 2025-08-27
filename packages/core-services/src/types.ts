/**
 * Enhanced Service Layer Types
 *
 * Tipos compartilhados para o Enhanced Service Layer Pattern
 */

import { z } from "zod";

// Zod Schemas for validation
export const UUIDSchema = z.string().uuid();
export const DateSchema = z.date();
export const EmailSchema = z.string().email();
export const PhoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/);
export const NonNegativeNumberSchema = z.number().min(0);
export const PositiveNumberSchema = z.number().min(1);

// Base Entity for all database entities
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Status Enums
export enum PatientStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  PENDING = "PENDING",
}

export enum BillingStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  OVERDUE = "OVERDUE",
  CANCELLED = "CANCELLED",
}

export enum AppointmentStatus {
  SCHEDULED = "SCHEDULED",
  CONFIRMED = "CONFIRMED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  NO_SHOW = "NO_SHOW",
}

export enum InventoryStatus {
  IN_STOCK = "IN_STOCK",
  LOW_STOCK = "LOW_STOCK",
  OUT_OF_STOCK = "OUT_OF_STOCK",
  DISCONTINUED = "DISCONTINUED",
}

export enum NotificationType {
  APPOINTMENT_REMINDER = "APPOINTMENT_REMINDER",
  PAYMENT_DUE = "PAYMENT_DUE",
  TREATMENT_UPDATE = "TREATMENT_UPDATE",
  SYSTEM_ALERT = "SYSTEM_ALERT",
  MARKETING = "MARKETING",
  COMPLIANCE = "COMPLIANCE",
}

export enum TreatmentType {
  CONSULTATION = "CONSULTATION",
  PROCEDURE = "PROCEDURE",
  FOLLOW_UP = "FOLLOW_UP",
  EMERGENCY = "EMERGENCY",
}

// Analytics Types
export interface AnalyticsEvent {
  id: string;
  type: string;
  category: string;
  action: string;
  properties: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
  patientId?: string;
  timestamp: number;
  metadata: {
    userAgent?: string;
    ip?: string;
    source: string;
    version: string;
  };
}

export interface AnalyticsMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  tags?: Record<string, string>;
}

export interface AnalyticsInsight {
  id: string;
  title: string;
  description: string;
  type: "TREND" | "ANOMALY" | "RECOMMENDATION";
  category: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  data: Record<string, unknown>;
  createdAt: Date;
}

// Security Types
export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isActive: boolean;
}

export interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  rules: unknown[];
  isActive: boolean;
  version: number;
}

// Cache Types
export interface CacheKey {
  key: string;
  ttl?: number;
  tags?: string[];
}

export interface CacheOptions {
  ttl?: number;
  tags?: string[];
  compress?: boolean;
  encrypt?: boolean;
}

export interface CacheStats {
  hitCount: number;
  missCount: number;
  hitRate: number;
  totalSize: number;
  itemCount: number;
  lastUpdated: Date;
}

// Audit Types
export interface AuditRecord {
  id: string;
  eventType: string;
  userId?: string;
  patientId?: string;
  resource: string;
  action: string;
  oldValue?: unknown;
  newValue?: unknown;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
}

// Compliance Types
export interface ComplianceReport {
  id: string;
  type: string;
  framework: "LGPD" | "ANVISA" | "CFM";
  status: "COMPLIANT" | "NON_COMPLIANT" | "PENDING";
  score: number;
  findings: unknown[];
  generatedAt: Date;
  period: {
    start: Date;
    end: Date;
  };
}

// Service Context for operations
export interface ServiceContext {
  userId?: string;
  patientId?: string;
  clinicId?: string;
  sessionId?: string;
  userRole?: string;
  permissions?: string[];
  ipAddress?: string;
  userAgent?: string;
  correlationId?: string;
}

// Audit Event for LGPD/ANVISA compliance
export interface AuditEvent {
  id: string;
  service: string;
  eventType: string;
  timestamp: string;
  details: unknown;
  version: string;
  userId?: string;
  patientId?: string;
  severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  dataClassification?: "PUBLIC" | "INTERNAL" | "CONFIDENTIAL" | "RESTRICTED";
}

// Security Configuration
export interface SecurityConfig {
  enableEncryption: boolean;
  enableAuditLogging: boolean;
  enableAccessControl: boolean;
  encryptionAlgorithm?: string;
  auditRetentionDays?: number;
  requireSecureChannel?: boolean;
  allowedOrigins?: string[];
}

// Performance Metrics
export interface PerformanceMetrics {
  service: string;
  period: string;
  totalOperations: number;
  averageResponseTime: number;
  errorRate: number;
  cacheHitRate: number;
  throughput: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  slowestOperations: {
    operation: string;
    averageTime: number;
    count: number;
  }[];
}

// Healthcare Operation Context
export interface HealthcareOperation {
  operationId: string;
  operationType: "READ" | "WRITE" | "DELETE" | "UPDATE";
  resourceType:
    | "PATIENT"
    | "APPOINTMENT"
    | "MEDICAL_RECORD"
    | "BILLING"
    | "INVENTORY";
  dataClassification: "PUBLIC" | "INTERNAL" | "CONFIDENTIAL" | "RESTRICTED";
  requiresConsent: boolean;
  retentionPolicy?: string;
  complianceFramework: ("LGPD" | "ANVISA" | "CFM" | "HIPAA")[];
}

// Cache Configuration Types
export interface CacheConfiguration {
  enabled: boolean;
  defaultTTL: number;
  maxItems: number;
  enableSensitiveDataCache: boolean;
  encryptSensitiveData: boolean;
  auditCacheAccess: boolean;
}

// Analytics Configuration
export interface AnalyticsConfiguration {
  enabled: boolean;
  trackPerformance: boolean;
  trackErrors: boolean;
  trackUserActions: boolean;
  retentionDays: number;
  aggregationWindow: number;
}

// Service Health Status
export interface ServiceHealth {
  status: "HEALTHY" | "DEGRADED" | "UNHEALTHY";
  service: string;
  version: string;
  uptime: number;
  lastHealthCheck: string;
  dependencies: {
    name: string;
    status: "UP" | "DOWN" | "DEGRADED";
    responseTime?: number;
  }[];
  metrics: {
    memoryUsage: number;
    cpuUsage: number;
    activeConnections: number;
    cacheSize: number;
    errorRate: number;
  };
}

// Error with enhanced context
export interface ServiceError extends Error {
  code: string;
  service: string;
  operation?: string;
  context?: ServiceContext;
  timestamp: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  retryable: boolean;
  correlationId?: string;
}

// Service Configuration Base
export interface BaseServiceConfig {
  serviceName: string;
  version: string;
  environment: "development" | "staging" | "production";
  enableCache: boolean;
  enableAnalytics: boolean;
  enableSecurity: boolean;
  healthCheckInterval: number;
  maxRetries: number;
  retryDelay: number;
}

// LGPD Consent Management
export interface ConsentConfiguration {
  requireExplicitConsent: boolean;
  consentVersion: string;
  retentionPeriod: number; // days
  automaticPurge: boolean;
  consentTypes: {
    type: string;
    description: string;
    required: boolean;
    category: "FUNCTIONAL" | "ANALYTICS" | "MARKETING" | "MEDICAL";
  }[];
}

// Recovery and Fallback Configuration
export interface ResilienceConfiguration {
  enableRetry: boolean;
  maxRetries: number;
  retryDelay: number;
  enableCircuitBreaker: boolean;
  circuitBreakerThreshold: number;
  circuitBreakerTimeout: number;
  enableFallback: boolean;
  fallbackStrategy: "CACHE" | "DEFAULT_VALUE" | "ALTERNATIVE_SERVICE";
}

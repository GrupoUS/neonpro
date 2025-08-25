/**
 * Enhanced Service Layer Types
 *
 * Tipos compartilhados para o Enhanced Service Layer Pattern
 */

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
	details: any;
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
	slowestOperations: Array<{
		operation: string;
		averageTime: number;
		count: number;
	}>;
}

// Healthcare Operation Context
export interface HealthcareOperation {
	operationId: string;
	operationType: "READ" | "WRITE" | "DELETE" | "UPDATE";
	resourceType: "PATIENT" | "APPOINTMENT" | "MEDICAL_RECORD" | "BILLING" | "INVENTORY";
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
	dependencies: Array<{
		name: string;
		status: "UP" | "DOWN" | "DEGRADED";
		responseTime?: number;
	}>;
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
	consentTypes: Array<{
		type: string;
		description: string;
		required: boolean;
		category: "FUNCTIONAL" | "ANALYTICS" | "MARKETING" | "MEDICAL";
	}>;
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

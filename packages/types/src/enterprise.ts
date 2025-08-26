/**
 * Enterprise Service Types
 * Types for all enterprise services and features
 */

// Enterprise Service Configuration
export type EnterpriseServiceConfig = {
	serviceName: string;
	enableCache: boolean;
	enableAnalytics: boolean;
	enableSecurity: boolean;
	enableAudit: boolean;
	healthCheck: {
		enabled: boolean;
		interval: number;
		timeout: number;
	};
};

// Enterprise Cache Types
export type EnterpriseCacheConfig = {
	layers: CacheLayerType[];
	ttl: number;
	maxSize: number;
	compression: boolean;
	encryption: boolean;
	replication: boolean;
};

export type CacheLayerType = "memory" | "redis" | "database";

export type CacheMetrics = {
	hits: number;
	misses: number;
	hitRate: number;
	avgResponseTime: number;
	memoryUsage: number;
	redisConnections: number;
};

export type CacheOperation = {
	operation: "get" | "set" | "delete" | "clear";
	key: string;
	layer: CacheLayerType;
	duration: number;
	success: boolean;
	size?: number;
};

// Enterprise Analytics Types
export type EnterpriseAnalyticsConfig = {
	enableRealTime: boolean;
	enablePredictive: boolean;
	enableInsights: boolean;
	dataRetention: number; // days
	exportFormats: AnalyticsExportFormat[];
	compliance: {
		lgpd: boolean;
		anvisa: boolean;
		hipaa: boolean;
	};
};

export type AnalyticsExportFormat = "json" | "csv" | "pdf" | "excel";

export type AnalyticsEvent = {
	id: string;
	type: string;
	data: Record<string, any>;
	timestamp: Date;
	userId?: string;
	sessionId?: string;
	context: AnalyticsContext;
};

export type AnalyticsContext = {
	feature: string;
	userRole: string;
	deviceType: "mobile" | "desktop" | "tablet";
	location?: string;
	healthcareProvider?: string;
};

export type AnalyticsInsight = {
	id: string;
	type: "trend" | "anomaly" | "recommendation" | "alert";
	title: string;
	description: string;
	confidence: number; // 0-1
	impact: "low" | "medium" | "high" | "critical";
	actionRequired: boolean;
	relatedMetrics: string[];
	timestamp: Date;
};

export type AnalyticsMetric = {
	name: string;
	value: number;
	unit: string;
	trend: "up" | "down" | "stable";
	change: number; // percentage
	period: string;
	healthcareRelevant: boolean;
};

// Enterprise Security Types
export type EnterpriseSecurityConfig = {
	encryption: {
		algorithm: string;
		keyRotation: number; // days
		atRest: boolean;
		inTransit: boolean;
	};
	rbac: {
		enabled: boolean;
		strictMode: boolean;
		roleHierarchy: boolean;
	};
	mfa: {
		required: boolean;
		methods: MfaMethod[];
		gracePeriod: number; // days
	};
	threatDetection: {
		enabled: boolean;
		sensitivity: "low" | "medium" | "high";
		realTimeBlocking: boolean;
	};
	sessionManagement: {
		timeout: number; // minutes
		maxConcurrent: number;
		deviceTracking: boolean;
	};
};

export type MfaMethod = "totp" | "sms" | "email" | "hardware_key" | "biometric";

export type SecurityEvent = {
	id: string;
	type: SecurityEventType;
	severity: "low" | "medium" | "high" | "critical";
	userId?: string;
	ip: string;
	userAgent: string;
	details: Record<string, any>;
	riskScore: number; // 1-10
	resolved: boolean;
	timestamp: Date;
};

export type SecurityEventType =
	| "login_success"
	| "login_failure"
	| "mfa_success"
	| "mfa_failure"
	| "unauthorized_access"
	| "suspicious_activity"
	| "data_breach_attempt"
	| "privilege_escalation"
	| "session_hijacking"
	| "brute_force_attack";

export type ThreatDetectionResult = {
	threatDetected: boolean;
	riskScore: number;
	threats: DetectedThreat[];
	recommendedActions: string[];
	blockAccess: boolean;
};

export type DetectedThreat = {
	type: string;
	description: string;
	indicators: string[];
	confidence: number; // 0-1
	mitigation: string[];
};

// Enterprise Audit Types
export type EnterpriseAuditConfig = {
	retention: number; // days
	encryption: boolean;
	immutable: boolean;
	realTime: boolean;
	compliance: {
		lgpd: boolean;
		anvisa: boolean;
		iso27001: boolean;
	};
	export: {
		enabled: boolean;
		formats: AuditExportFormat[];
		schedule: string; // cron expression
	};
};

export type AuditExportFormat = "json" | "csv" | "xml" | "pdf";

export type AuditEvent = {
	id: string;
	timestamp: Date;
	userId?: string;
	action: string;
	resource: string;
	outcome: "success" | "failure" | "error";
	details: Record<string, any>;
	ip: string;
	userAgent: string;
	sessionId?: string;
	riskLevel: "low" | "medium" | "high" | "critical";
	complianceRelevant: boolean;
	hash: string; // For immutability
};

export type AuditQuery = {
	startDate?: Date;
	endDate?: Date;
	userId?: string;
	action?: string;
	resource?: string;
	outcome?: "success" | "failure" | "error";
	riskLevel?: "low" | "medium" | "high" | "critical";
	limit?: number;
	offset?: number;
};

export type AuditReport = {
	id: string;
	type: "compliance" | "security" | "performance" | "user_activity";
	period: {
		start: Date;
		end: Date;
	};
	summary: {
		totalEvents: number;
		securityEvents: number;
		complianceEvents: number;
		criticalEvents: number;
	};
	compliance: {
		lgpd: ComplianceStatus;
		anvisa: ComplianceStatus;
		iso27001: ComplianceStatus;
	};
	recommendations: string[];
	generatedAt: Date;
	generatedBy: string;
};

export type ComplianceStatus = {
	status: "compliant" | "non_compliant" | "partial";
	score: number; // 0-100
	issues: ComplianceIssue[];
	lastAudit: Date;
};

export type ComplianceIssue = {
	id: string;
	type: "violation" | "warning" | "recommendation";
	description: string;
	regulation: string;
	severity: "low" | "medium" | "high" | "critical";
	remediation: string[];
	deadline?: Date;
};

// Healthcare-Specific Enterprise Types
export type HealthcareEnterpriseConfig = {
	patientDataHandling: {
		encryptionRequired: boolean;
		accessLogging: boolean;
		consentTracking: boolean;
		dataMinimization: boolean;
	};
	clinicalWorkflow: {
		auditTrail: boolean;
		realTimeMonitoring: boolean;
		alerting: boolean;
		qualityMetrics: boolean;
	};
	regulatoryCompliance: {
		lgpd: boolean;
		anvisa: boolean;
		cfm: boolean;
		customRegulations: string[];
	};
};

export type PatientDataAccess = {
	patientId: string;
	userId: string;
	accessType: "read" | "write" | "delete" | "export";
	purpose: string;
	consentGiven: boolean;
	emergencyAccess: boolean;
	timestamp: Date;
	dataFields: string[];
	justification?: string;
};

export type ClinicalMetric = {
	id: string;
	name: string;
	category: "safety" | "quality" | "efficiency" | "compliance";
	value: number;
	unit: string;
	benchmark: number;
	target: number;
	trend: "improving" | "declining" | "stable";
	period: string;
	healthcareProvider: string;
};

export type HealthcareAlert = {
	id: string;
	type:
		| "patient_safety"
		| "data_breach"
		| "system_error"
		| "compliance_violation";
	severity: "low" | "medium" | "high" | "critical";
	title: string;
	description: string;
	patientId?: string;
	userId?: string;
	timestamp: Date;
	acknowledged: boolean;
	resolved: boolean;
	actions: AlertAction[];
};

export type AlertAction = {
	id: string;
	action: string;
	performedBy: string;
	timestamp: Date;
	result: string;
	followUpRequired: boolean;
};

// Enterprise Integration Types
export type EnterpriseIntegration = {
	serviceName: string;
	endpoint: string;
	authentication: {
		type: "api_key" | "oauth2" | "jwt" | "certificate";
		credentials: Record<string, string>;
	};
	rateLimit: {
		requests: number;
		period: string; // e.g., '1h', '1d'
	};
	monitoring: {
		healthCheck: boolean;
		metrics: boolean;
		alerting: boolean;
	};
	compliance: {
		dataHandling: string[];
		auditRequired: boolean;
		encryptionRequired: boolean;
	};
};

export type IntegrationMetrics = {
	serviceName: string;
	availability: number; // percentage
	responseTime: number; // ms
	errorRate: number; // percentage
	throughput: number; // requests per second
	lastCheck: Date;
	status: "healthy" | "degraded" | "down";
};

// Enterprise Service Health Types
export type EnterpriseHealthCheck = {
	serviceName: string;
	status: "healthy" | "degraded" | "unhealthy" | "critical";
	checks: HealthCheckResult[];
	lastCheck: Date;
	uptime: number; // percentage
	responseTime: number; // ms
	dependencies: DependencyHealth[];
};

export type HealthCheckResult = {
	name: string;
	status: "pass" | "fail" | "warn";
	message?: string;
	duration: number; // ms
	timestamp: Date;
};

export type DependencyHealth = {
	name: string;
	type: "database" | "cache" | "api" | "queue" | "storage";
	status: "available" | "unavailable" | "degraded";
	responseTime?: number;
	lastCheck: Date;
	critical: boolean;
};

// Enterprise Dashboard Types
export type EnterpriseDashboard = {
	id: string;
	name: string;
	description: string;
	widgets: DashboardWidget[];
	layout: DashboardLayout;
	permissions: DashboardPermission[];
	refreshInterval: number; // seconds
	createdBy: string;
	updatedAt: Date;
};

export type DashboardWidget = {
	id: string;
	type: "metric" | "chart" | "table" | "alert" | "health";
	title: string;
	config: Record<string, any>;
	position: {
		x: number;
		y: number;
		width: number;
		height: number;
	};
	dataSource: string;
	refreshInterval?: number;
};

export type DashboardLayout = {
	columns: number;
	rows: number;
	breakpoints: Record<string, number>;
	responsive: boolean;
};

export type DashboardPermission = {
	userId: string;
	role: string;
	permissions: ("view" | "edit" | "share" | "delete")[];
};

// Enterprise Reporting Types
export type EnterpriseReport = {
	id: string;
	name: string;
	type: "compliance" | "performance" | "security" | "healthcare" | "custom";
	schedule: ReportSchedule;
	format: "pdf" | "excel" | "csv" | "json";
	recipients: ReportRecipient[];
	filters: ReportFilter[];
	template: string;
	lastGenerated?: Date;
	nextScheduled?: Date;
};

export type ReportSchedule = {
	frequency:
		| "daily"
		| "weekly"
		| "monthly"
		| "quarterly"
		| "annually"
		| "on_demand";
	time?: string; // HH:MM
	dayOfWeek?: number; // 0-6
	dayOfMonth?: number; // 1-31
	timezone: string;
};

export type ReportRecipient = {
	email: string;
	name: string;
	role: string;
	notifications: boolean;
};

export type ReportFilter = {
	field: string;
	operator: "equals" | "contains" | "greater_than" | "less_than" | "between";
	value: any;
};

// Enterprise Configuration Types
export type EnterpriseConfiguration = {
	general: {
		organizationName: string;
		timezone: string;
		locale: string;
		environment: "development" | "staging" | "production";
	};
	security: EnterpriseSecurityConfig;
	cache: EnterpriseCacheConfig;
	analytics: EnterpriseAnalyticsConfig;
	audit: EnterpriseAuditConfig;
	healthcare: HealthcareEnterpriseConfig;
	integrations: EnterpriseIntegration[];
	monitoring: {
		enabled: boolean;
		interval: number;
		alerting: boolean;
		metrics: string[];
	};
};

// Export utility types
export type EnterpriseServiceType =
	| "cache"
	| "analytics"
	| "security"
	| "audit"
	| "health";
export type ComplianceFramework =
	| "lgpd"
	| "anvisa"
	| "hipaa"
	| "iso27001"
	| "cfm";
export type HealthcareRole =
	| "doctor"
	| "nurse"
	| "admin"
	| "patient"
	| "receptionist"
	| "manager"
	| "auditor";
export type DataSensitivityLevel =
	| "public"
	| "internal"
	| "confidential"
	| "restricted"
	| "patient_data";

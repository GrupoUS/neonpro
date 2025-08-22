/**
 * 📋 Audit Trail Middleware - NeonPro API
 * ========================================
 *
 * Middleware para auditoria LGPD compliant com rastreamento
 * completo de operações sensíveis e logs estruturados.
 */

import type { Context, MiddlewareHandler } from "hono";

// Audit log levels
export enum AuditLevel {
	INFO = "info",
	WARNING = "warning",
	ERROR = "error",
	CRITICAL = "critical",
}

// LGPD sensitive operations that require audit
const LGPD_SENSITIVE_OPERATIONS = {
	// Data access operations
	"GET /api/v1/patients": {
		level: AuditLevel.INFO,
		category: "data_access",
		description: "Patient data access",
	},
	"GET /api/v1/patients/:id": {
		level: AuditLevel.INFO,
		category: "data_access",
		description: "Individual patient data access",
	},

	// Data modification operations
	"POST /api/v1/patients": {
		level: AuditLevel.WARNING,
		category: "data_creation",
		description: "New patient data creation",
	},
	"PUT /api/v1/patients/:id": {
		level: AuditLevel.WARNING,
		category: "data_modification",
		description: "Patient data modification",
	},
	"DELETE /api/v1/patients/:id": {
		level: AuditLevel.CRITICAL,
		category: "data_deletion",
		description: "Patient data deletion",
	},

	// Authentication operations
	"POST /api/v1/auth/login": {
		level: AuditLevel.INFO,
		category: "authentication",
		description: "User authentication attempt",
	},
	"POST /api/v1/auth/logout": {
		level: AuditLevel.INFO,
		category: "authentication",
		description: "User logout",
	},
	"POST /api/v1/auth/forgot-password": {
		level: AuditLevel.WARNING,
		category: "authentication",
		description: "Password reset request",
	},

	// Data export operations (LGPD Article 15)
	"GET /api/v1/compliance/export": {
		level: AuditLevel.CRITICAL,
		category: "data_export",
		description: "Personal data export",
	},
	"POST /api/v1/compliance/lgpd/requests": {
		level: AuditLevel.CRITICAL,
		category: "lgpd_request",
		description: "LGPD data subject request",
	},

	// Consent management
	"PUT /api/v1/compliance/lgpd/consent": {
		level: AuditLevel.WARNING,
		category: "consent",
		description: "Patient consent update",
	},

	// Professional access to sensitive data
	"GET /api/v1/analytics": {
		level: AuditLevel.INFO,
		category: "analytics_access",
		description: "Analytics dashboard access",
	},
	"GET /api/v1/appointments": {
		level: AuditLevel.INFO,
		category: "data_access",
		description: "Appointments data access",
	},
};

// Audit log structure
interface AuditLog {
	auditId: string;
	timestamp: string;
	level: AuditLevel;
	category: string;
	operation: string;
	description: string;

	// User context
	userId?: string;
	userEmail?: string;
	userRole?: string;

	// Request context
	method: string;
	path: string;
	resourceId?: string;
	clientIP: string;
	userAgent: string;

	// Response context
	statusCode?: number;
	responseTime?: number;

	// LGPD specific
	lgpdRelevant: boolean;
	personalDataAccessed: boolean;
	consentRequired: boolean;

	// Additional metadata
	metadata?: Record<string, any>;

	// Request/Response tracking
	requestId: string;
	sessionId?: string;

	// Geolocation (for compliance)
	country?: string;
	region?: string;
}

// In-memory audit store for development (production should use database)
class AuditStore {
	private logs: AuditLog[] = [];
	private maxLogs = 10_000; // Keep last 10k logs in memory

	add(log: AuditLog): void {
		this.logs.push(log);

		// Rotate logs if needed
		if (this.logs.length > this.maxLogs) {
			this.logs.shift();
		}

		// In production, this would persist to database
		this.persistLog(log);
	}

	private persistLog(log: AuditLog): void {
		// TODO: Implement database persistence
		console.log("AUDIT LOG:", JSON.stringify(log, null, 2));
	}

	getLogs(filter?: Partial<AuditLog>): AuditLog[] {
		if (!filter) return [...this.logs];

		return this.logs.filter((log) => {
			return Object.entries(filter).every(([key, value]) => log[key as keyof AuditLog] === value);
		});
	}

	getLogsByUserId(userId: string): AuditLog[] {
		return this.logs.filter((log) => log.userId === userId);
	}

	getLogsByTimeRange(startTime: Date, endTime: Date): AuditLog[] {
		return this.logs.filter((log) => {
			const logTime = new Date(log.timestamp);
			return logTime >= startTime && logTime <= endTime;
		});
	}
}

// Global audit store
const auditStore = new AuditStore();

/**
 * Extract user context from request
 */
const extractUserContext = (c: Context) => {
	// TODO: Extract from JWT token or session
	const authHeader = c.req.header("Authorization");

	// Mock user extraction - implement actual JWT parsing
	if (authHeader?.startsWith("Bearer ")) {
		return {
			userId: "user_123", // Extract from JWT
			userEmail: "user@neonpro.com", // Extract from JWT
			userRole: "admin", // Extract from JWT
		};
	}

	return {
		userId: undefined,
		userEmail: undefined,
		userRole: undefined,
	};
};

/**
 * Extract client context from request
 */
const extractClientContext = (c: Context) => {
	return {
		clientIP:
			c.req.header("CF-Connecting-IP") || c.req.header("X-Forwarded-For") || c.req.header("X-Real-IP") || "unknown",
		userAgent: c.req.header("User-Agent") || "unknown",
		country: c.req.header("CF-IPCountry") || "unknown",
		region: c.req.header("CF-Region") || "unknown",
	};
};

/**
 * Check if operation requires audit
 */
const shouldAudit = (method: string, path: string): boolean => {
	const operationKey = `${method} ${path}`;

	// Check exact match first
	if (LGPD_SENSITIVE_OPERATIONS[operationKey]) {
		return true;
	}

	// Check pattern matches (for parameterized routes)
	for (const pattern of Object.keys(LGPD_SENSITIVE_OPERATIONS)) {
		const regex = new RegExp("^" + pattern.replace(/:\w+/g, "[^/]+") + "$");
		if (regex.test(operationKey)) {
			return true;
		}
	}

	return false;
};

/**
 * Main audit middleware
 */
export const auditMiddleware = (): MiddlewareHandler => {
	return async (c, next) => {
		const startTime = Date.now();
		const method = c.req.method;
		const path = c.req.path;
		const operationKey = `${method} ${path}`;

		// Generate audit ID
		const auditId = `audit_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

		// Generate request ID if not exists
		const requestId = c.req.header("X-Request-ID") || `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

		// Set audit headers
		c.res.headers.set("X-Audit-ID", auditId);
		c.res.headers.set("X-Request-ID", requestId);

		// Extract contexts
		const userContext = extractUserContext(c);
		const clientContext = extractClientContext(c);

		// Check if this operation should be audited
		const shouldAuditOperation = shouldAudit(method, path);

		if (shouldAuditOperation) {
			// Find operation configuration
			let operationConfig = LGPD_SENSITIVE_OPERATIONS[operationKey];
			if (!operationConfig) {
				// Find by pattern matching
				for (const [pattern, config] of Object.entries(LGPD_SENSITIVE_OPERATIONS)) {
					const regex = new RegExp("^" + pattern.replace(/:\w+/g, "[^/]+") + "$");
					if (regex.test(operationKey)) {
						operationConfig = config;
						break;
					}
				}
			}

			// Extract resource ID from path (for parameterized routes)
			const resourceIdMatch = path.match(/\/([a-zA-Z0-9_-]+)(?:\/|$)/g);
			const resourceId = resourceIdMatch?.[resourceIdMatch.length - 1]?.replace(/\//g, "");

			// Create audit log entry
			const auditLog: AuditLog = {
				auditId,
				timestamp: new Date().toISOString(),
				level: operationConfig?.level || AuditLevel.INFO,
				category: operationConfig?.category || "general",
				operation: operationKey,
				description: operationConfig?.description || `${method} operation on ${path}`,

				// User context
				...userContext,

				// Request context
				method,
				path,
				resourceId,
				...clientContext,

				// LGPD flags
				lgpdRelevant: true,
				personalDataAccessed: ["data_access", "data_modification"].includes(operationConfig?.category || ""),
				consentRequired: ["data_export", "marketing"].includes(operationConfig?.category || ""),

				// Request tracking
				requestId,
				sessionId: c.req.header("X-Session-ID"),
			};

			// Store the log for later completion
			c.set("auditLog", auditLog);
		}

		try {
			await next();

			// Complete audit log if exists
			if (shouldAuditOperation) {
				const auditLog = c.get("auditLog") as AuditLog;
				if (auditLog) {
					auditLog.statusCode = c.res.status;
					auditLog.responseTime = Date.now() - startTime;

					// Add success/failure context
					if (c.res.status >= 400) {
						auditLog.level = AuditLevel.ERROR;
						auditLog.metadata = {
							...auditLog.metadata,
							error: true,
							statusCode: c.res.status,
						};
					}

					auditStore.add(auditLog);
				}
			}
		} catch (error) {
			// Log error in audit
			if (shouldAuditOperation) {
				const auditLog = c.get("auditLog") as AuditLog;
				if (auditLog) {
					auditLog.level = AuditLevel.ERROR;
					auditLog.statusCode = 500;
					auditLog.responseTime = Date.now() - startTime;
					auditLog.metadata = {
						...auditLog.metadata,
						error: true,
						errorMessage: error.message,
					};

					auditStore.add(auditLog);
				}
			}

			throw error;
		}
	};
};

/**
 * LGPD specific audit functions
 */
export const lgpdAudit = {
	// Log data subject request
	logDataSubjectRequest: (type: string, patientId: string, userId: string) => {
		const auditLog: AuditLog = {
			auditId: `lgpd_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
			timestamp: new Date().toISOString(),
			level: AuditLevel.CRITICAL,
			category: "lgpd_request",
			operation: `DATA_SUBJECT_REQUEST_${type.toUpperCase()}`,
			description: `LGPD data subject request: ${type}`,

			userId,
			method: "INTERNAL",
			path: "/lgpd/data-subject-request",
			resourceId: patientId,
			clientIP: "internal",
			userAgent: "system",

			lgpdRelevant: true,
			personalDataAccessed: true,
			consentRequired: false,

			requestId: `internal_${Date.now()}`,

			metadata: {
				requestType: type,
				internal: true,
			},
		};

		auditStore.add(auditLog);
	},

	// Log consent changes
	logConsentChange: (patientId: string, consentType: string, granted: boolean, userId?: string) => {
		const auditLog: AuditLog = {
			auditId: `consent_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
			timestamp: new Date().toISOString(),
			level: AuditLevel.WARNING,
			category: "consent",
			operation: "CONSENT_UPDATE",
			description: `Consent ${granted ? "granted" : "revoked"} for ${consentType}`,

			userId,
			method: "INTERNAL",
			path: "/lgpd/consent-update",
			resourceId: patientId,
			clientIP: "internal",
			userAgent: "system",

			lgpdRelevant: true,
			personalDataAccessed: false,
			consentRequired: false,

			requestId: `consent_${Date.now()}`,

			metadata: {
				consentType,
				granted,
				internal: true,
			},
		};

		auditStore.add(auditLog);
	},
};

// Export audit store for admin/reporting purposes
export { auditStore };

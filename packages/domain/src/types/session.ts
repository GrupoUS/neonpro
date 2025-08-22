/**
 * Session Types
 * Definições de tipos para gerenciamento de sessão
 */

export type UserSession = {
	id: string;
	userId: string;
	deviceId?: string;
	ipAddress?: string;
	userAgent?: string;
	createdAt?: Date;
	expiresAt?: Date;
	lastActivity?: Date;
	isActive?: boolean;
};

export type CreateSessionRequest = {
	userId: string;
	deviceId?: string;
	ipAddress?: string;
	userAgent?: string;
	rememberMe?: boolean;
};

export type UpdateSessionRequest = {
	lastActivity?: Date;
	expiresAt?: Date;
	metadata?: Record<string, any>;
};

export type DeviceRegistration = {
	id: string;
	userId: string;
	deviceId: string;
	deviceName?: string;
	deviceType?: string;
	isTrusted?: boolean;
	lastUsed?: Date;
	registeredAt?: Date;
};

export type SessionSecurityEvent = {
	id: string;
	sessionId: string;
	eventType: SecurityEventType;
	severity: "low" | "medium" | "high" | "critical";
	details?: Record<string, any>;
	timestamp: Date;
	resolved?: boolean;
};

export type SecurityEventType =
	| "suspicious_login"
	| "multiple_failed_attempts"
	| "unusual_location"
	| "device_change"
	| "concurrent_sessions"
	| "session_hijack_attempt"
	| "privilege_escalation"
	| "data_access_violation";

export type SessionAnalytics = {
	totalSessions: number;
	activeSessions: number;
	averageSessionDuration: number;
	securityEvents: number;
	deviceCount: number;
	lastActivity?: Date;
};

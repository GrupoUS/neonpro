/**
 * Audit Trail Utilities for Healthcare Compliance
 * LGPD and healthcare regulation compliance audit logging
 */

import { z } from "zod";

// Audit log entry structure
export type AuditLogEntry = {
	id: string;
	timestamp: Date;
	user_id: string;
	action: string;
	resource_type: string;
	resource_id: string;
	clinic_id: string;
	ip_address?: string;
	user_agent?: string;
	before_state?: Record<string, any>;
	after_state?: Record<string, any>;
	compliance_context: {
		lgpd_basis: string;
		data_category: "personal" | "sensitive" | "health" | "administrative";
		retention_period: number; // days
		access_level: "read" | "write" | "delete" | "export";
	};
};

// Standard healthcare actions for audit logging
export const HEALTHCARE_ACTIONS = {
	// Patient data actions
	PATIENT_VIEW: "patient:view",
	PATIENT_CREATE: "patient:create",
	PATIENT_UPDATE: "patient:update",
	PATIENT_DELETE: "patient:delete",
	PATIENT_EXPORT: "patient:export",

	// Medical record actions
	RECORD_VIEW: "medical_record:view",
	RECORD_CREATE: "medical_record:create",
	RECORD_UPDATE: "medical_record:update",
	RECORD_DELETE: "medical_record:delete",

	// Appointment actions
	APPOINTMENT_VIEW: "appointment:view",
	APPOINTMENT_CREATE: "appointment:create",
	APPOINTMENT_UPDATE: "appointment:update",
	APPOINTMENT_CANCEL: "appointment:cancel",

	// Authentication actions
	LOGIN_SUCCESS: "auth:login_success",
	LOGIN_FAILURE: "auth:login_failure",
	LOGOUT: "auth:logout",

	// Data export/import
	DATA_EXPORT: "data:export",
	DATA_IMPORT: "data:import",
	REPORT_GENERATE: "report:generate",
} as const;

// LGPD legal basis options
export const LGPD_BASIS = {
	CONSENT: "consent",
	CONTRACT: "contract",
	LEGAL_OBLIGATION: "legal_obligation",
	VITAL_INTERESTS: "vital_interests",
	PUBLIC_TASK: "public_task",
	LEGITIMATE_INTERESTS: "legitimate_interests",
	HEALTHCARE_PROCEDURE: "healthcare_procedure",
} as const;

// Create standardized audit log entry
export function createAuditLog(params: {
	user_id: string;
	action: string;
	resource_type: string;
	resource_id: string;
	clinic_id: string;
	ip_address?: string;
	user_agent?: string;
	before_state?: Record<string, any>;
	after_state?: Record<string, any>;
	lgpd_basis?: string;
	data_category?: "personal" | "sensitive" | "health" | "administrative";
}): AuditLogEntry {
	return {
		id: crypto.randomUUID(),
		timestamp: new Date(),
		user_id: params.user_id,
		action: params.action,
		resource_type: params.resource_type,
		resource_id: params.resource_id,
		clinic_id: params.clinic_id,
		ip_address: params.ip_address,
		user_agent: params.user_agent,
		before_state: params.before_state,
		after_state: params.after_state,
		compliance_context: {
			lgpd_basis: params.lgpd_basis || LGPD_BASIS.HEALTHCARE_PROCEDURE,
			data_category: params.data_category || "health",
			retention_period: calculateRetentionPeriod(params.data_category || "health"),
			access_level: determineAccessLevel(params.action),
		},
	};
}

// Calculate data retention period based on Brazilian healthcare regulations
function calculateRetentionPeriod(dataCategory: string): number {
	switch (dataCategory) {
		case "health":
			return 365 * 20; // 20 years for medical records (CFM Resolution)
		case "sensitive":
			return 365 * 5; // 5 years for sensitive personal data
		case "personal":
			return 365 * 2; // 2 years for general personal data
		case "administrative":
			return 365 * 7; // 7 years for administrative records
		default:
			return 365 * 5; // Default 5 years
	}
}

// Determine access level from action
function determineAccessLevel(action: string): "read" | "write" | "delete" | "export" {
	if (action.includes("view") || action.includes("read")) {
		return "read";
	}
	if (action.includes("delete") || action.includes("remove")) {
		return "delete";
	}
	if (action.includes("export") || action.includes("download")) {
		return "export";
	}
	return "write";
}

// Validate audit log entry
export const AuditLogSchema = z.object({
	id: z.string().uuid(),
	timestamp: z.date(),
	user_id: z.string().uuid(),
	action: z.string().min(1),
	resource_type: z.string().min(1),
	resource_id: z.string().min(1),
	clinic_id: z.string().uuid(),
	ip_address: z.string().ip().optional(),
	user_agent: z.string().optional(),
	before_state: z.record(z.any()).optional(),
	after_state: z.record(z.any()).optional(),
	compliance_context: z.object({
		lgpd_basis: z.string(),
		data_category: z.enum(["personal", "sensitive", "health", "administrative"]),
		retention_period: z.number().positive(),
		access_level: z.enum(["read", "write", "delete", "export"]),
	}),
});

// Anonymize sensitive data for audit logs
export function anonymizeAuditData(data: Record<string, any>): Record<string, any> {
	const sensitiveFields = ["cpf", "rg", "email", "phone", "address", "birth_date"];
	const anonymized = { ...data };

	for (const field of sensitiveFields) {
		if (anonymized[field]) {
			anonymized[field] = "[ANONYMIZED]";
		}
	}

	return anonymized;
}

// Generate audit report for compliance verification
export type AuditReport = {
	period: { start: Date; end: Date };
	total_entries: number;
	by_action: Record<string, number>;
	by_user: Record<string, number>;
	by_data_category: Record<string, number>;
	compliance_score: number;
	violations: string[];
};

export function generateAuditReport(logs: AuditLogEntry[], startDate: Date, endDate: Date): AuditReport {
	const filteredLogs = logs.filter((log) => log.timestamp >= startDate && log.timestamp <= endDate);

	const byAction: Record<string, number> = {};
	const byUser: Record<string, number> = {};
	const byDataCategory: Record<string, number> = {};
	const violations: string[] = [];

	for (const log of filteredLogs) {
		byAction[log.action] = (byAction[log.action] || 0) + 1;
		byUser[log.user_id] = (byUser[log.user_id] || 0) + 1;
		byDataCategory[log.compliance_context.data_category] =
			(byDataCategory[log.compliance_context.data_category] || 0) + 1;

		// Check for compliance violations
		if (!log.compliance_context.lgpd_basis) {
			violations.push(`Missing LGPD basis for action ${log.action} on ${log.timestamp}`);
		}
	}

	// Calculate compliance score (100% if no violations)
	const complianceScore =
		violations.length === 0 ? 100 : Math.max(0, 100 - (violations.length / filteredLogs.length) * 100);

	return {
		period: { start: startDate, end: endDate },
		total_entries: filteredLogs.length,
		by_action: byAction,
		by_user: byUser,
		by_data_category: byDataCategory,
		compliance_score: complianceScore,
		violations,
	};
}

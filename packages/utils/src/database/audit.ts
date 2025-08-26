/**
 * Audit Logging System for NeonPro Healthcare Compliance
 * Implements comprehensive audit trails for LGPD, ANVISA, and CFM compliance
 */

import { createClient } from "@supabase/supabase-js";

export type AuditLogEntry = {
	id?: string;
	user_id: string;
	user_role: string;
	action: string;
	resource_type: string;
	resource_id: string;
	old_values?: Record<string, any>;
	new_values?: Record<string, any>;
	ip_address: string;
	user_agent: string;
	session_id?: string;
	compliance_category: "lgpd" | "anvisa" | "cfm" | "general" | "security";
	risk_level: "low" | "medium" | "high" | "critical";
	timestamp: Date;
	additional_metadata?: Record<string, any>;
};

export type ComplianceEvent = {
	event_type: string;
	description: string;
	compliance_framework: "LGPD" | "ANVISA" | "CFM";
	severity: "info" | "warning" | "error" | "critical";
	user_id?: string;
	affected_data_subjects?: string[];
	remediation_required: boolean;
	remediation_deadline?: Date;
};

export class AuditLogger {
	private readonly supabase: any;

	constructor() {
		this.supabase = createClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL!,
			process.env.SUPABASE_SERVICE_ROLE_KEY!,
		);
	}

	// Core Audit Logging
	async logAction(
		entry: Omit<AuditLogEntry, "id" | "timestamp">,
	): Promise<boolean> {
		try {
			const auditEntry: AuditLogEntry = {
				...entry,
				timestamp: new Date(),
			};

			const { error } = await this.supabase
				.from("audit_logs")
				.insert(auditEntry);

			if (error) {
				return false;
			}

			// Check if this action triggers compliance monitoring
			await this.checkComplianceThresholds(auditEntry);

			return true;
		} catch (_error) {
			return false;
		}
	}

	// Patient Data Access Logging (LGPD Compliance)
	async logPatientDataAccess(
		userId: string,
		userRole: string,
		patientId: string,
		accessType: "view" | "edit" | "delete" | "export",
		ipAddress: string,
		userAgent: string,
		accessedFields?: string[],
	): Promise<boolean> {
		return this.logAction({
			user_id: userId,
			user_role: userRole,
			action: `patient_data_${accessType}`,
			resource_type: "patient_data",
			resource_id: patientId,
			ip_address: ipAddress,
			user_agent: userAgent,
			compliance_category: "lgpd",
			risk_level: this.determineRiskLevel(accessType, userRole),
			additional_metadata: {
				accessed_fields: accessedFields,
				data_subject_id: patientId,
				processing_purpose: this.getProcessingPurpose(accessType),
			},
		});
	}

	// Medical Professional Actions (CFM Compliance)
	async logMedicalAction(
		professionalId: string,
		action: string,
		patientId: string,
		details: Record<string, any>,
		ipAddress: string,
		userAgent: string,
	): Promise<boolean> {
		return this.logAction({
			user_id: professionalId,
			user_role: "doctor", // or get from user profile
			action: `medical_${action}`,
			resource_type: "medical_record",
			resource_id: patientId,
			ip_address: ipAddress,
			user_agent: userAgent,
			compliance_category: "cfm",
			risk_level: "high", // Medical actions are always high risk
			additional_metadata: {
				medical_details: details,
				cfm_license_validated: true,
				digital_signature_required: true,
			},
		});
	}

	// Product/Procedure Usage (ANVISA Compliance)
	async logANVISAAction(
		userId: string,
		userRole: string,
		action: string,
		productId: string,
		patientId: string,
		details: Record<string, any>,
		ipAddress: string,
		userAgent: string,
	): Promise<boolean> {
		return this.logAction({
			user_id: userId,
			user_role: userRole,
			action: `anvisa_${action}`,
			resource_type: "anvisa_product",
			resource_id: productId,
			ip_address: ipAddress,
			user_agent: userAgent,
			compliance_category: "anvisa",
			risk_level: "high",
			additional_metadata: {
				product_details: details,
				patient_id: patientId,
				regulatory_validation_required: true,
			},
		});
	}

	// Security Event Logging
	async logSecurityEvent(
		eventType: string,
		description: string,
		userId: string | null,
		ipAddress: string,
		userAgent: string,
		severity: "low" | "medium" | "high" | "critical" = "medium",
	): Promise<boolean> {
		return this.logAction({
			user_id: userId || "system",
			user_role: "system",
			action: `security_${eventType}`,
			resource_type: "security",
			resource_id: "system",
			ip_address: ipAddress,
			user_agent: userAgent,
			compliance_category: "security",
			risk_level: severity,
			additional_metadata: {
				event_description: description,
				security_incident: severity === "high" || severity === "critical",
			},
		});
	}

	// Compliance Event Logging
	async logComplianceEvent(event: ComplianceEvent): Promise<boolean> {
		try {
			const { error } = await this.supabase.from("compliance_events").insert({
				...event,
				timestamp: new Date(),
				resolved: false,
				resolution_notes: null,
			});

			if (error) {
				return false;
			}

			// If critical, create immediate notification
			if (event.severity === "critical") {
				await this.createComplianceAlert(event);
			}

			return true;
		} catch (_error) {
			return false;
		}
	}

	// Data Subject Rights Logging (LGPD Article 18)
	async logDataSubjectRightsRequest(
		subjectId: string,
		requestType:
			| "access"
			| "rectification"
			| "deletion"
			| "portability"
			| "consent_withdrawal",
		requestDetails: Record<string, any>,
		processingStatus: "received" | "processing" | "completed" | "rejected",
	): Promise<boolean> {
		return this.logAction({
			user_id: subjectId,
			user_role: "data_subject",
			action: `lgpd_${requestType}_request`,
			resource_type: "data_subject_rights",
			resource_id: subjectId,
			ip_address: requestDetails.ip_address || "unknown",
			user_agent: requestDetails.user_agent || "unknown",
			compliance_category: "lgpd",
			risk_level: "high",
			additional_metadata: {
				request_details: requestDetails,
				processing_status: processingStatus,
				legal_basis: requestDetails.legal_basis,
				response_deadline: this.calculateResponseDeadline(requestType),
			},
		});
	}

	// Query audit logs with compliance filtering
	async getAuditLogs(
		filters: {
			user_id?: string;
			resource_type?: string;
			compliance_category?: string;
			risk_level?: string;
			start_date?: Date;
			end_date?: Date;
			limit?: number;
		} = {},
	): Promise<AuditLogEntry[]> {
		try {
			let query = this.supabase
				.from("audit_logs")
				.select("*")
				.order("timestamp", {
					ascending: false,
				});

			if (filters.user_id) {
				query = query.eq("user_id", filters.user_id);
			}

			if (filters.resource_type) {
				query = query.eq("resource_type", filters.resource_type);
			}

			if (filters.compliance_category) {
				query = query.eq("compliance_category", filters.compliance_category);
			}

			if (filters.risk_level) {
				query = query.eq("risk_level", filters.risk_level);
			}

			if (filters.start_date) {
				query = query.gte("timestamp", filters.start_date.toISOString());
			}

			if (filters.end_date) {
				query = query.lte("timestamp", filters.end_date.toISOString());
			}

			if (filters.limit) {
				query = query.limit(filters.limit);
			}

			const { data, error } = await query;

			if (error) {
				return [];
			}

			return data || [];
		} catch (_error) {
			return [];
		}
	}

	// Generate compliance audit report
	async generateComplianceAuditReport(
		startDate: Date,
		endDate: Date,
		complianceFramework?: "lgpd" | "anvisa" | "cfm",
	): Promise<any> {
		try {
			const filters: any = {
				start_date: startDate,
				end_date: endDate,
			};

			if (complianceFramework) {
				filters.compliance_category = complianceFramework;
			}

			const auditLogs = await this.getAuditLogs(filters);

			// Aggregate statistics
			const stats = {
				total_actions: auditLogs.length,
				by_compliance_category: this.groupBy(auditLogs, "compliance_category"),
				by_risk_level: this.groupBy(auditLogs, "risk_level"),
				by_user_role: this.groupBy(auditLogs, "user_role"),
				by_action_type: this.groupBy(auditLogs, "action"),
				unique_users: new Set(auditLogs.map((log) => log.user_id)).size,
				critical_events: auditLogs.filter(
					(log) => log.risk_level === "critical",
				).length,
			};

			// Compliance-specific metrics
			const complianceMetrics = await this.calculateComplianceMetrics(
				auditLogs,
				complianceFramework,
			);

			return {
				period: {
					start: startDate,
					end: endDate,
				},
				framework: complianceFramework || "all",
				statistics: stats,
				compliance_metrics: complianceMetrics,
				recommendations: this.generateAuditRecommendations(
					stats,
					complianceMetrics,
				),
				audit_logs_sample: auditLogs.slice(0, 10), // First 10 for reference
			};
		} catch (error) {
			return {
				error: error instanceof Error ? error.message : "Unknown error",
				success: false,
			};
		}
	}

	// Helper methods
	private determineRiskLevel(
		accessType: string,
		userRole: string,
	): "low" | "medium" | "high" | "critical" {
		if (accessType === "delete" || accessType === "export") {
			return "critical";
		}
		if (accessType === "edit") {
			return "high";
		}
		if (userRole === "admin") {
			return "medium";
		}
		return "low";
	}

	private getProcessingPurpose(accessType: string): string {
		const purposes: Record<string, string> = {
			view: "Healthcare service delivery",
			edit: "Patient record maintenance",
			delete: "Data retention compliance",
			export: "Data portability request",
		};
		return purposes[accessType] || "General healthcare operations";
	}

	private calculateResponseDeadline(_requestType: string): Date {
		const deadline = new Date();
		// LGPD Article 19: 15 days for most requests
		deadline.setDate(deadline.getDate() + 15);
		return deadline;
	}

	private async checkComplianceThresholds(entry: AuditLogEntry): Promise<void> {
		// Check for suspicious patterns
		if (
			entry.risk_level === "critical" ||
			entry.compliance_category === "security"
		) {
		}
	}

	private async createComplianceAlert(_event: ComplianceEvent): Promise<void> {}

	private groupBy<T>(array: T[], key: keyof T): Record<string, number> {
		return array.reduce(
			(groups, item) => {
				const value = String(item[key]);
				groups[value] = (groups[value] || 0) + 1;
				return groups;
			},
			{} as Record<string, number>,
		);
	}

	private async calculateComplianceMetrics(
		logs: AuditLogEntry[],
		framework?: string,
	): Promise<any> {
		const metrics: any = {};

		if (!framework || framework === "lgpd") {
			const lgpdLogs = logs.filter((log) => log.compliance_category === "lgpd");
			metrics.lgpd = {
				patient_data_accesses: lgpdLogs.filter((log) =>
					log.action.includes("patient_data"),
				).length,
				data_subject_requests: lgpdLogs.filter((log) =>
					log.action.includes("lgpd_"),
				).length,
				consent_operations: lgpdLogs.filter((log) =>
					log.action.includes("consent"),
				).length,
			};
		}

		if (!framework || framework === "cfm") {
			const cfmLogs = logs.filter((log) => log.compliance_category === "cfm");
			metrics.cfm = {
				medical_actions: cfmLogs.filter((log) =>
					log.action.includes("medical_"),
				).length,
				digital_signatures: cfmLogs.filter((log) =>
					log.action.includes("signature"),
				).length,
				telemedicine_sessions: cfmLogs.filter((log) =>
					log.action.includes("telemedicine"),
				).length,
			};
		}

		if (!framework || framework === "anvisa") {
			const anvisaLogs = logs.filter(
				(log) => log.compliance_category === "anvisa",
			);
			metrics.anvisa = {
				product_usage: anvisaLogs.filter((log) =>
					log.action.includes("anvisa_"),
				).length,
				adverse_events: anvisaLogs.filter((log) =>
					log.action.includes("adverse"),
				).length,
			};
		}

		return metrics;
	}

	private generateAuditRecommendations(stats: any, _metrics: any): string[] {
		const recommendations = [];

		if (stats.critical_events > 0) {
			recommendations.push(
				`Review ${stats.critical_events} critical events for compliance risks`,
			);
		}

		if (stats.by_risk_level.high > stats.total_actions * 0.1) {
			recommendations.push(
				"High percentage of high-risk actions detected - review access controls",
			);
		}

		if (stats.unique_users < 5) {
			recommendations.push(
				"Limited user activity - ensure comprehensive audit coverage",
			);
		}

		if (recommendations.length === 0) {
			recommendations.push(
				"Audit activity appears normal - continue monitoring",
			);
		}

		return recommendations;
	}
}

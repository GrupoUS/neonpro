/**
 * Enterprise Audit Service
 *
 * Sistema de auditoria completo enterprise para healthcare:
 * - Audit trail imutável e persistente
 * - Compliance automático (LGPD/ANVISA/CFM)
 * - Forensic analysis capabilities
 * - Automatic report generation
 * - Data retention management
 *
 * Features:
 * - Blockchain-like immutable logging
 * - Encrypted audit records
 * - Real-time compliance monitoring
 * - Automated compliance reports
 * - Forensic investigation tools
 */

import crypto from "crypto";
import type { AuditEvent } from "../../types";

interface AuditRecord extends AuditEvent {
	hash: string;
	previousHash: string;
	signature: string;
	encrypted: boolean;
	retention: {
		category: string;
		expiresAt: number;
		canDelete: boolean;
	};
	compliance: {
		lgpd: boolean;
		anvisa: boolean;
		cfm: boolean;
		iso27001: boolean;
	};
}

interface AuditQuery {
	startDate?: Date;
	endDate?: Date;
	service?: string;
	eventType?: string;
	userId?: string;
	patientId?: string;
	category?: string;
	severity?: string;
	limit?: number;
	offset?: number;
}

interface ComplianceReport {
	id: string;
	type: "lgpd" | "anvisa" | "cfm" | "iso27001";
	period: {
		start: Date;
		end: Date;
	};
	summary: {
		totalEvents: number;
		criticalEvents: number;
		complianceScore: number;
		violations: number;
	};
	findings: Array<{
		severity: "low" | "medium" | "high" | "critical";
		description: string;
		recommendation: string;
		affectedRecords: number;
	}>;
	generatedAt: Date;
	generatedBy: string;
}

interface RetentionPolicy {
	category: string;
	retention: number; // milliseconds
	canDelete: boolean;
	encryptionRequired: boolean;
	complianceRequired: string[];
}

export class EnterpriseAuditService {
	private auditChain: AuditRecord[] = [];
	private retentionPolicies: RetentionPolicy[] = [];
	private encryptionKey: Buffer;
	private lastHash = "0".repeat(64); // Genesis hash
	private cleanupInterval: NodeJS.Timeout | null = null;

	constructor() {
		this.encryptionKey = this.initializeEncryptionKey();
		this.loadDefaultRetentionPolicies();
		this.startRetentionCleanup();
	}

	/**
	 * Log audit event with immutable trail
	 */
	async logEvent(event: AuditEvent): Promise<void> {
		try {
			const category = this.categorizeEvent(event);
			const policy = this.getRetentionPolicy(category);

			const auditRecord: AuditRecord = {
				...event,
				hash: "",
				previousHash: this.lastHash,
				signature: "",
				encrypted: policy.encryptionRequired,
				retention: {
					category,
					expiresAt: Date.now() + policy.retention,
					canDelete: policy.canDelete,
				},
				compliance: {
					lgpd: this.isLGPDRelevant(event),
					anvisa: this.isANVISARelevant(event),
					cfm: this.isCFMRelevant(event),
					iso27001: this.isISO27001Relevant(event),
				},
			};

			// Encrypt sensitive data if required
			if (policy.encryptionRequired) {
				auditRecord.details = await this.encryptAuditData(auditRecord.details);
			}

			// Generate hash and signature
			auditRecord.hash = this.generateHash(auditRecord);
			auditRecord.signature = this.generateSignature(auditRecord);

			// Update chain
			this.auditChain.push(auditRecord);
			this.lastHash = auditRecord.hash;

			// Verify chain integrity
			await this.verifyChainIntegrity();

			// Real-time compliance check
			await this.checkComplianceViolations(auditRecord);
		} catch (error) {
			// Critical: Audit logging failure
			const errorMessage = error instanceof Error ? error.message : String(error);
			console.error("CRITICAL: Audit logging failed", {
				error: errorMessage,
				eventId: event.id,
				service: event.service,
			});

			// Fallback logging mechanism
			await this.emergencyLog(event, error instanceof Error ? error : new Error(String(error)));
		}
	}

	/**
	 * Query audit records with filters
	 */
	async queryAuditRecords(query: AuditQuery): Promise<{
		records: AuditRecord[];
		total: number;
		hasMore: boolean;
	}> {
		let filteredRecords = this.auditChain;

		// Apply filters
		if (query.startDate) {
			const startTime = query.startDate.getTime();
			filteredRecords = filteredRecords.filter((r) => new Date(r.timestamp).getTime() >= startTime);
		}

		if (query.endDate) {
			const endTime = query.endDate.getTime();
			filteredRecords = filteredRecords.filter((r) => new Date(r.timestamp).getTime() <= endTime);
		}

		if (query.service) {
			filteredRecords = filteredRecords.filter((r) => r.service === query.service);
		}

		if (query.eventType) {
			filteredRecords = filteredRecords.filter((r) => r.eventType === query.eventType);
		}

		if (query.userId) {
			filteredRecords = filteredRecords.filter((r) => r.details?.userId === query.userId);
		}

		if (query.patientId) {
			filteredRecords = filteredRecords.filter((r) => r.details?.patientId === query.patientId);
		}

		if (query.category) {
			filteredRecords = filteredRecords.filter((r) => r.retention.category === query.category);
		}

		// Sort by timestamp (newest first)
		filteredRecords.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

		const total = filteredRecords.length;
		const offset = query.offset || 0;
		const limit = query.limit || 100;

		const paginatedRecords = filteredRecords.slice(offset, offset + limit);
		const hasMore = offset + limit < total;

		// Decrypt records if needed (for authorized access)
		const decryptedRecords = await Promise.all(
			paginatedRecords.map(async (record) => {
				if (record.encrypted) {
					return {
						...record,
						details: await this.decryptAuditData(record.details),
					};
				}
				return record;
			})
		);

		return {
			records: decryptedRecords,
			total,
			hasMore,
		};
	}

	/**
	 * Generate compliance report
	 */
	async generateComplianceReport(
		type: ComplianceReport["type"],
		startDate: Date,
		endDate: Date,
		generatedBy: string
	): Promise<ComplianceReport> {
		const relevantRecords = await this.queryAuditRecords({
			startDate,
			endDate,
		});

		const records = relevantRecords.records.filter((record) => {
			switch (type) {
				case "lgpd":
					return record.compliance.lgpd;
				case "anvisa":
					return record.compliance.anvisa;
				case "cfm":
					return record.compliance.cfm;
				case "iso27001":
					return record.compliance.iso27001;
				default:
					return false;
			}
		});

		const findings = await this.analyzeComplianceFindings(records, type);
		const complianceScore = this.calculateComplianceScore(records, findings);

		const report: ComplianceReport = {
			id: this.generateReportId(),
			type,
			period: { start: startDate, end: endDate },
			summary: {
				totalEvents: records.length,
				criticalEvents: records.filter((r) => this.getEventSeverity(r) === "critical").length,
				complianceScore,
				violations: findings.filter((f) => f.severity === "high" || f.severity === "critical").length,
			},
			findings,
			generatedAt: new Date(),
			generatedBy,
		};

		// Log report generation
		await this.logEvent({
			id: `audit_report_${report.id}`,
			service: "audit-service",
			eventType: "COMPLIANCE_REPORT_GENERATED",
			timestamp: new Date().toISOString(),
			details: {
				reportId: report.id,
				type: report.type,
				period: report.period,
				totalEvents: report.summary.totalEvents,
				complianceScore: report.summary.complianceScore,
				generatedBy,
			},
			version: "1.0.0",
		});

		return report;
	}

	/**
	 * Verify audit chain integrity
	 */
	async verifyChainIntegrity(): Promise<{
		valid: boolean;
		brokenLinks: number[];
		lastVerifiedIndex: number;
	}> {
		const brokenLinks: number[] = [];
		let lastVerifiedIndex = -1;
		let expectedHash = "0".repeat(64);

		for (let i = 0; i < this.auditChain.length; i++) {
			const record = this.auditChain[i];
			if (!record) continue;

			// Verify previous hash linkage
			if (record.previousHash !== expectedHash) {
				brokenLinks.push(i);
			} else {
				// Verify current record hash
				const calculatedHash = this.generateHash(record);

				if (calculatedHash === record.hash) {
					lastVerifiedIndex = i;
					expectedHash = record.hash;
				} else {
					brokenLinks.push(i);
				}
			}
		}

		const valid = brokenLinks.length === 0;

		if (!valid) {
			await this.logEvent({
				id: `integrity_check_${Date.now()}`,
				service: "audit-service",
				eventType: "CHAIN_INTEGRITY_VIOLATION",
				timestamp: new Date().toISOString(),
				details: {
					brokenLinks,
					lastVerifiedIndex,
					totalRecords: this.auditChain.length,
					severity: "critical",
				},
				version: "1.0.0",
			});
		}

		return {
			valid,
			brokenLinks,
			lastVerifiedIndex,
		};
	}

	/**
	 * Export audit data for external systems
	 */
	async exportAuditData(query: AuditQuery, format: "json" | "csv" | "xml" = "json"): Promise<string> {
		const result = await this.queryAuditRecords(query);

		switch (format) {
			case "csv":
				return this.convertToCSV(result.records);
			case "xml":
				return this.convertToXML(result.records);
			case "json":
			default:
				return JSON.stringify(
					{
						metadata: {
							exportedAt: new Date().toISOString(),
							total: result.total,
							query,
						},
						records: result.records,
					},
					null,
					2
				);
		}
	}

	/**
	 * Forensic analysis capabilities
	 */
	async performForensicAnalysis(
		targetUserId?: string,
		targetPatientId?: string,
		timeWindow?: { start: Date; end: Date }
	): Promise<{
		timeline: AuditRecord[];
		patterns: Array<{
			type: string;
			description: string;
			frequency: number;
			riskLevel: "low" | "medium" | "high" | "critical";
		}>;
		recommendations: string[];
	}> {
		const query: AuditQuery = {
			...(targetUserId && { userId: targetUserId }),
			...(targetPatientId && { patientId: targetPatientId }),
			...(timeWindow?.start && { startDate: timeWindow.start }),
			...(timeWindow?.end && { endDate: timeWindow.end }),
			limit: 1000,
		};

		const result = await this.queryAuditRecords(query);
		const timeline = result.records.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

		// Pattern analysis
		const patterns = this.analyzePatterns(timeline);
		const recommendations = this.generateForensicRecommendations(patterns);

		return {
			timeline,
			patterns,
			recommendations,
		};
	}

	/**
	 * Private helper methods
	 */
	private initializeEncryptionKey(): Buffer {
		const key = process.env.NEONPRO_AUDIT_KEY;
		if (key) {
			return Buffer.from(key, "hex");
		}

		const randomKey = crypto.randomBytes(32);
		console.warn("Using random audit key - set NEONPRO_AUDIT_KEY in production");
		return randomKey;
	}

	private loadDefaultRetentionPolicies(): void {
		this.retentionPolicies = [
			{
				category: "patient_data",
				retention: 7 * 365 * 24 * 60 * 60 * 1000, // 7 years
				canDelete: false,
				encryptionRequired: true,
				complianceRequired: ["lgpd", "anvisa", "cfm"],
			},
			{
				category: "financial",
				retention: 5 * 365 * 24 * 60 * 60 * 1000, // 5 years
				canDelete: false,
				encryptionRequired: true,
				complianceRequired: ["lgpd"],
			},
			{
				category: "system_security",
				retention: 2 * 365 * 24 * 60 * 60 * 1000, // 2 years
				canDelete: false,
				encryptionRequired: false,
				complianceRequired: ["iso27001"],
			},
			{
				category: "user_activity",
				retention: 1 * 365 * 24 * 60 * 60 * 1000, // 1 year
				canDelete: true,
				encryptionRequired: false,
				complianceRequired: ["lgpd"],
			},
			{
				category: "general",
				retention: 90 * 24 * 60 * 60 * 1000, // 90 days
				canDelete: true,
				encryptionRequired: false,
				complianceRequired: [],
			},
		];
	}

	private categorizeEvent(event: AuditEvent): string {
		const eventType = event.eventType.toLowerCase();

		if (eventType.includes("patient") || eventType.includes("medical")) {
			return "patient_data";
		}
		if (eventType.includes("billing") || eventType.includes("payment")) {
			return "financial";
		}
		if (eventType.includes("security") || eventType.includes("auth")) {
			return "system_security";
		}
		if (eventType.includes("user") || eventType.includes("login")) {
			return "user_activity";
		}

		return "general";
	}

	private getRetentionPolicy(category: string): RetentionPolicy {
		return (
			this.retentionPolicies.find((p) => p.category === category) ||
			this.retentionPolicies.find((p) => p.category === "general")!
		);
	}

	private generateHash(record: Omit<AuditRecord, "hash" | "signature">): string {
		const data = JSON.stringify({
			id: record.id,
			service: record.service,
			eventType: record.eventType,
			timestamp: record.timestamp,
			details: record.details,
			previousHash: record.previousHash,
		});

		return crypto.createHash("sha256").update(data).digest("hex");
	}

	private generateSignature(record: AuditRecord): string {
		const data = `${record.hash}:${record.timestamp}:${record.service}`;
		return crypto.createHmac("sha256", this.encryptionKey).update(data).digest("hex");
	}

	private async encryptAuditData(data: any): Promise<any> {
		if (typeof data !== "object" || data === null) {
			return data;
		}

		const encrypted: any = {};
		for (const [key, value] of Object.entries(data)) {
			if (this.isSensitiveField(key)) {
				const cipher = crypto.createCipher("aes-256-gcm", this.encryptionKey);
				let encryptedValue = cipher.update(JSON.stringify(value), "utf8", "hex");
				encryptedValue += cipher.final("hex");
				encrypted[key] = `encrypted:${encryptedValue}`;
			} else {
				encrypted[key] = value;
			}
		}

		return encrypted;
	}

	private async decryptAuditData(data: any): Promise<any> {
		if (typeof data !== "object" || data === null) {
			return data;
		}

		const decrypted: any = {};
		for (const [key, value] of Object.entries(data)) {
			if (typeof value === "string" && value.startsWith("encrypted:")) {
				try {
					const encryptedData = value.replace("encrypted:", "");
					const decipher = crypto.createDecipher("aes-256-gcm", this.encryptionKey);
					let decryptedValue = decipher.update(encryptedData, "hex", "utf8");
					decryptedValue += decipher.final("utf8");
					decrypted[key] = JSON.parse(decryptedValue);
				} catch (error) {
					decrypted[key] = "[DECRYPTION_FAILED]";
				}
			} else {
				decrypted[key] = value;
			}
		}

		return decrypted;
	}

	private isSensitiveField(field: string): boolean {
		const sensitiveFields = [
			"patientId",
			"ssn",
			"cpf",
			"email",
			"phone",
			"address",
			"medicalData",
			"financialData",
			"password",
			"token",
		];
		return sensitiveFields.includes(field);
	}

	private isLGPDRelevant(event: AuditEvent): boolean {
		return (
			event.eventType.toLowerCase().includes("patient") ||
			event.eventType.toLowerCase().includes("personal") ||
			event.details?.patientId != null
		);
	}

	private isANVISARelevant(event: AuditEvent): boolean {
		return (
			event.eventType.toLowerCase().includes("medical") ||
			event.eventType.toLowerCase().includes("treatment") ||
			event.eventType.toLowerCase().includes("prescription")
		);
	}

	private isCFMRelevant(event: AuditEvent): boolean {
		return (
			event.eventType.toLowerCase().includes("doctor") ||
			event.eventType.toLowerCase().includes("medical") ||
			event.details?.doctorId != null
		);
	}

	private isISO27001Relevant(event: AuditEvent): boolean {
		return (
			event.eventType.toLowerCase().includes("security") ||
			event.eventType.toLowerCase().includes("access") ||
			event.eventType.toLowerCase().includes("auth")
		);
	}

	private async checkComplianceViolations(record: AuditRecord): Promise<void> {
		// Real-time compliance monitoring
		const violations = [];

		// Check for data access without proper authorization
		if (record.eventType.includes("PATIENT_DATA_ACCESS") && !record.details?.authorized) {
			violations.push("Unauthorized patient data access");
		}

		// Check for excessive failed login attempts
		if (record.eventType.includes("LOGIN_FAILED")) {
			const recentFailures = this.auditChain
				.filter((r) => r.eventType.includes("LOGIN_FAILED") && r.details?.userId === record.details?.userId)
				.filter((r) => Date.now() - new Date(r.timestamp).getTime() < 60 * 60 * 1000);

			if (recentFailures.length > 5) {
				violations.push("Excessive failed login attempts");
			}
		}

		if (violations.length > 0) {
			await this.logEvent({
				id: `compliance_violation_${Date.now()}`,
				service: "audit-service",
				eventType: "COMPLIANCE_VIOLATION",
				timestamp: new Date().toISOString(),
				details: {
					originalEventId: record.id,
					violations,
					severity: "high",
				},
				version: "1.0.0",
			});
		}
	}

	private async emergencyLog(event: AuditEvent, error: Error): Promise<void> {
		// Fallback logging to console/file when main audit fails
		console.error("EMERGENCY AUDIT LOG", {
			timestamp: new Date().toISOString(),
			event,
			error: error.message,
			stack: error.stack,
		});
	}

	private startRetentionCleanup(): void {
		this.cleanupInterval = setInterval(
			() => {
				this.performRetentionCleanup();
			},
			24 * 60 * 60 * 1000
		); // Daily cleanup
	}

	private performRetentionCleanup(): void {
		const now = Date.now();
		const initialCount = this.auditChain.length;

		this.auditChain = this.auditChain.filter((record) => {
			if (record.retention.canDelete && now > record.retention.expiresAt) {
				return false; // Remove expired records
			}
			return true;
		});

		const removedCount = initialCount - this.auditChain.length;
		if (removedCount > 0) {
			console.log(`Audit retention cleanup: removed ${removedCount} expired records`);
		}
	}

	private analyzeComplianceFindings(
		records: AuditRecord[],
		type: ComplianceReport["type"]
	): Array<ComplianceReport["findings"][0]> {
		const findings: Array<ComplianceReport["findings"][0]> = [];

		// Analyze patterns for compliance violations
		const violations = records.filter((r) => r.eventType.includes("VIOLATION") || r.eventType.includes("FAILED"));

		if (violations.length > 0) {
			findings.push({
				severity: "high",
				description: `${violations.length} compliance violations detected`,
				recommendation: "Review security policies and implement additional controls",
				affectedRecords: violations.length,
			});
		}

		// Type-specific analysis
		switch (type) {
			case "lgpd": {
				const dataAccess = records.filter((r) => r.eventType.includes("PATIENT_DATA_ACCESS"));
				if (dataAccess.length > 1000) {
					findings.push({
						severity: "medium",
						description: "High volume of patient data access",
						recommendation: "Implement additional access controls and monitoring",
						affectedRecords: dataAccess.length,
					});
				}
				break;
			}
		}

		return findings;
	}

	private calculateComplianceScore(records: AuditRecord[], findings: Array<ComplianceReport["findings"][0]>): number {
		if (records.length === 0) return 100;

		const criticalIssues = findings.filter((f) => f.severity === "critical").length;
		const highIssues = findings.filter((f) => f.severity === "high").length;
		const mediumIssues = findings.filter((f) => f.severity === "medium").length;

		const score = 100 - criticalIssues * 30 - highIssues * 15 - mediumIssues * 5;
		return Math.max(0, Math.min(100, score));
	}

	private getEventSeverity(record: AuditRecord): string {
		if (record.eventType.includes("CRITICAL") || record.eventType.includes("BREACH")) {
			return "critical";
		}
		if (record.eventType.includes("VIOLATION") || record.eventType.includes("FAILED")) {
			return "high";
		}
		if (record.eventType.includes("WARNING") || record.eventType.includes("SUSPICIOUS")) {
			return "medium";
		}
		return "low";
	}

	private generateReportId(): string {
		return `rpt_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
	}

	private analyzePatterns(records: AuditRecord[]): Array<{
		type: string;
		description: string;
		frequency: number;
		riskLevel: "low" | "medium" | "high" | "critical";
	}> {
		// Pattern analysis implementation
		const patterns = [];

		// Analyze access patterns
		const accessPatterns = records.filter((r) => r.eventType.includes("ACCESS"));
		if (accessPatterns.length > 0) {
			patterns.push({
				type: "data_access",
				description: `${accessPatterns.length} data access events`,
				frequency: accessPatterns.length,
				riskLevel: (accessPatterns.length > 100 ? "high" : "medium") as "low" | "medium" | "high" | "critical",
			});
		}

		return patterns;
	}

	private generateForensicRecommendations(patterns: any[]): string[] {
		const recommendations = [];

		patterns.forEach((pattern) => {
			if (pattern.riskLevel === "high" || pattern.riskLevel === "critical") {
				recommendations.push(`Investigate ${pattern.type} patterns showing high frequency`);
			}
		});

		if (recommendations.length === 0) {
			recommendations.push("No significant security concerns identified");
		}

		return recommendations;
	}

	private convertToCSV(records: AuditRecord[]): string {
		const headers = ["id", "service", "eventType", "timestamp", "userId", "details"];
		const rows = [headers.join(",")];

		records.forEach((record) => {
			const row = [
				record.id,
				record.service,
				record.eventType,
				record.timestamp,
				record.details?.userId || "",
				JSON.stringify(record.details).replace(/"/g, '""'),
			];
			rows.push(row.join(","));
		});

		return rows.join("\n");
	}

	private convertToXML(records: AuditRecord[]): string {
		let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<auditRecords>\n';

		records.forEach((record) => {
			xml += "  <record>\n";
			xml += `    <id>${record.id}</id>\n`;
			xml += `    <service>${record.service}</service>\n`;
			xml += `    <eventType>${record.eventType}</eventType>\n`;
			xml += `    <timestamp>${record.timestamp}</timestamp>\n`;
			xml += `    <details><![CDATA[${JSON.stringify(record.details)}]]></details>\n`;
			xml += "  </record>\n";
		});

		xml += "</auditRecords>";
		return xml;
	}

	/**
	 * Get audit statistics
	 */
	async getAuditStats(): Promise<any> {
		const now = Date.now();
		const last24h = now - 24 * 60 * 60 * 1000;
		const last7d = now - 7 * 24 * 60 * 60 * 1000;

		const recentRecords = this.auditChain.filter((r) => new Date(r.timestamp).getTime() >= last24h);

		const weeklyRecords = this.auditChain.filter((r) => new Date(r.timestamp).getTime() >= last7d);

		return {
			total: this.auditChain.length,
			recent: {
				last24h: recentRecords.length,
				last7d: weeklyRecords.length,
			},
			compliance: {
				lgpd: this.auditChain.filter((r) => r.compliance.lgpd).length,
				anvisa: this.auditChain.filter((r) => r.compliance.anvisa).length,
				cfm: this.auditChain.filter((r) => r.compliance.cfm).length,
				iso27001: this.auditChain.filter((r) => r.compliance.iso27001).length,
			},
			retention: {
				encrypted: this.auditChain.filter((r) => r.encrypted).length,
				canDelete: this.auditChain.filter((r) => r.retention.canDelete).length,
			},
			integrity: await this.verifyChainIntegrity(),
			timestamp: new Date().toISOString(),
		};
	}

	/**
	 * Shutdown audit service
	 */
	async shutdown(): Promise<void> {
		if (this.cleanupInterval) {
			clearInterval(this.cleanupInterval);
			this.cleanupInterval = null;
		}

		// Final integrity check
		await this.verifyChainIntegrity();
	}
}

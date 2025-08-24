import type { SupabaseClient } from "@supabase/supabase-js";
import { EnhancedAIService } from "./enhanced-service-base";

export interface ComplianceAutomationInput {
	userId: string;
	clinicId: string;
	serviceName: string;
	operationType: string;
	dataCategories: string[];
	patientId?: string;
	sensitiveDataHandled: boolean;
	purpose: string;
	retentionPeriodDays?: number;
}

export interface ComplianceAutomationOutput {
	compliant: boolean;
	violations: ComplianceViolation[];
	recommendations: ComplianceRecommendation[];
	auditTrail: ComplianceAuditEntry;
	lawfulBasis: string;
	consentRequired: boolean;
	retentionPeriod: number;
}

export interface ComplianceViolation {
	type: "LGPD" | "ANVISA" | "CFM" | "INTERNAL";
	severity: "low" | "medium" | "high" | "critical";
	code: string;
	description: string;
	regulation: string;
	remediation: string;
}

export interface ComplianceRecommendation {
	category: "data_protection" | "consent_management" | "retention_policy" | "access_control";
	priority: "low" | "medium" | "high";
	action: string;
	description: string;
	implementationSteps: string[];
}

export interface ComplianceAuditEntry {
	timestamp: Date;
	userId: string;
	clinicId: string;
	serviceName: string;
	operationType: string;
	dataCategories: string[];
	complianceStatus: "compliant" | "non_compliant" | "requires_review";
	violationsCount: number;
	lawfulBasis: string;
	consentObtained: boolean;
	retentionPeriod: number;
}

export interface ComplianceRule {
	id: string;
	name: string;
	type: "LGPD" | "ANVISA" | "CFM" | "INTERNAL";
	category: string;
	conditions: ComplianceCondition[];
	actions: ComplianceAction[];
	severity: "low" | "medium" | "high" | "critical";
	enabled: boolean;
}

export interface ComplianceCondition {
	field: string;
	operator: "equals" | "contains" | "greater_than" | "less_than" | "in" | "not_in";
	value: any;
}

export interface ComplianceAction {
	type: "log" | "block" | "require_consent" | "notify_dpo" | "limit_retention";
	parameters: Record<string, any>;
}

export class ComplianceAutomationService extends EnhancedAIService<
	ComplianceAutomationInput,
	ComplianceAutomationOutput
> {
	protected serviceId = "compliance-automation";
	protected version = "1.0.0";
	protected description = "Automated compliance checking and enforcement for AI services";

	private supabase: SupabaseClient;
	private complianceRules: Map<string, ComplianceRule> = new Map();

	constructor(supabase: SupabaseClient, config: any) {
		super(config);
		this.supabase = supabase;
		this.loadComplianceRules();
	}

	async execute(input: ComplianceAutomationInput): Promise<ComplianceAutomationOutput> {
		try {
			// Step 1: Validate input data
			this.validateInput(input);

			// Step 2: Evaluate compliance rules
			const violations = await this.evaluateComplianceRules(input);

			// Step 3: Determine lawful basis for data processing
			const lawfulBasis = this.determineLawfulBasis(input);

			// Step 4: Check if consent is required
			const consentRequired = this.isConsentRequired(input, lawfulBasis);

			// Step 5: Calculate retention period
			const retentionPeriod = this.calculateRetentionPeriod(input);

			// Step 6: Generate recommendations
			const recommendations = await this.generateRecommendations(input, violations);

			// Step 7: Create audit trail entry
			const auditTrail = this.createAuditTrail(input, violations, lawfulBasis, consentRequired, retentionPeriod);

			// Step 8: Log to database
			await this.logComplianceCheck(auditTrail);

			// Step 9: Check for critical violations that require immediate action
			const criticalViolations = violations.filter((v) => v.severity === "critical");
			if (criticalViolations.length > 0) {
				await this.handleCriticalViolations(criticalViolations, input);
			}

			return {
				compliant: violations.length === 0,
				violations,
				recommendations,
				auditTrail,
				lawfulBasis,
				consentRequired,
				retentionPeriod,
			};
		} catch (error) {
			this.logger.error(`Compliance automation failed: ${error instanceof Error ? error.message : "Unknown error"}`, {
				serviceName: this.serviceId,
				userId: input.userId,
				clinicId: input.clinicId,
				error: error instanceof Error ? error.stack : String(error),
			});

			throw new Error(`Compliance automation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	private validateInput(input: ComplianceAutomationInput): void {
		if (!(input.userId && input.clinicId && input.serviceName && input.operationType)) {
			throw new Error("Missing required fields: userId, clinicId, serviceName, operationType");
		}

		if (!Array.isArray(input.dataCategories) || input.dataCategories.length === 0) {
			throw new Error("Data categories must be a non-empty array");
		}

		if (!input.purpose || input.purpose.trim().length === 0) {
			throw new Error("Purpose must be specified for data processing");
		}

		const validDataCategories = [
			"personal_data",
			"health_data",
			"sensitive_data",
			"biometric_data",
			"financial_data",
			"contact_data",
			"demographic_data",
			"behavioral_data",
		];

		const invalidCategories = input.dataCategories.filter((cat) => !validDataCategories.includes(cat));
		if (invalidCategories.length > 0) {
			throw new Error(`Invalid data categories: ${invalidCategories.join(", ")}`);
		}
	}

	private async evaluateComplianceRules(input: ComplianceAutomationInput): Promise<ComplianceViolation[]> {
		const violations: ComplianceViolation[] = [];

		for (const rule of this.complianceRules.values()) {
			if (!rule.enabled) continue;

			const ruleApplies = this.evaluateRuleConditions(rule.conditions, input);
			if (!ruleApplies) continue;

			const violation = await this.checkRuleCompliance(rule, input);
			if (violation) {
				violations.push(violation);
			}
		}

		return violations;
	}

	private evaluateRuleConditions(conditions: ComplianceCondition[], input: ComplianceAutomationInput): boolean {
		return conditions.every((condition) => {
			const fieldValue = this.getFieldValue(input, condition.field);
			return this.evaluateCondition(fieldValue, condition.operator, condition.value);
		});
	}

	private getFieldValue(input: ComplianceAutomationInput, field: string): any {
		const fieldMap: Record<string, any> = {
			serviceName: input.serviceName,
			operationType: input.operationType,
			dataCategories: input.dataCategories,
			sensitiveDataHandled: input.sensitiveDataHandled,
			purpose: input.purpose,
			patientId: input.patientId,
			retentionPeriodDays: input.retentionPeriodDays,
		};

		return fieldMap[field];
	}

	private evaluateCondition(fieldValue: any, operator: string, expectedValue: any): boolean {
		switch (operator) {
			case "equals":
				return fieldValue === expectedValue;
			case "contains":
				return Array.isArray(fieldValue)
					? fieldValue.includes(expectedValue)
					: String(fieldValue).includes(String(expectedValue));
			case "greater_than":
				return Number(fieldValue) > Number(expectedValue);
			case "less_than":
				return Number(fieldValue) < Number(expectedValue);
			case "in":
				return Array.isArray(expectedValue) && expectedValue.includes(fieldValue);
			case "not_in":
				return Array.isArray(expectedValue) && !expectedValue.includes(fieldValue);
			default:
				return false;
		}
	}

	private async checkRuleCompliance(
		rule: ComplianceRule,
		input: ComplianceAutomationInput
	): Promise<ComplianceViolation | null> {
		// Implementation depends on specific rule types
		switch (rule.type) {
			case "LGPD":
				return this.checkLGPDCompliance(rule, input);
			case "ANVISA":
				return this.checkANVISACompliance(rule, input);
			case "CFM":
				return this.checkCFMCompliance(rule, input);
			case "INTERNAL":
				return this.checkInternalCompliance(rule, input);
			default:
				return null;
		}
	}

	private checkLGPDCompliance(rule: ComplianceRule, input: ComplianceAutomationInput): ComplianceViolation | null {
		// LGPD compliance checks
		switch (rule.id) {
			case "lgpd_sensitive_data_consent":
				if (input.sensitiveDataHandled && !this.hasValidConsent(input)) {
					return {
						type: "LGPD",
						severity: "critical",
						code: "LGPD-001",
						description: "Sensitive data processing requires explicit consent",
						regulation: "Lei Geral de Proteção de Dados - Art. 11",
						remediation: "Obtain explicit consent before processing sensitive health data",
					};
				}
				break;

			case "lgpd_purpose_limitation":
				if (!this.isPurposeLegitimate(input.purpose)) {
					return {
						type: "LGPD",
						severity: "high",
						code: "LGPD-002",
						description: "Data processing purpose is not clearly defined or legitimate",
						regulation: "Lei Geral de Proteção de Dados - Art. 6, I",
						remediation: "Define a clear, legitimate purpose for data processing",
					};
				}
				break;

			case "lgpd_data_minimization":
				if (this.isDataExcessive(input.dataCategories, input.purpose)) {
					return {
						type: "LGPD",
						severity: "medium",
						code: "LGPD-003",
						description: "Data collection appears excessive for stated purpose",
						regulation: "Lei Geral de Proteção de Dados - Art. 6, III",
						remediation: "Limit data collection to what is necessary for the specified purpose",
					};
				}
				break;

			case "lgpd_retention_period": {
				const maxRetention = this.getMaxRetentionPeriod(input.dataCategories);
				if (input.retentionPeriodDays && input.retentionPeriodDays > maxRetention) {
					return {
						type: "LGPD",
						severity: "medium",
						code: "LGPD-004",
						description: `Retention period exceeds maximum allowed (${maxRetention} days)`,
						regulation: "Lei Geral de Proteção de Dados - Art. 16",
						remediation: `Reduce retention period to maximum ${maxRetention} days`,
					};
				}
				break;
			}
		}

		return null;
	}

	private checkANVISACompliance(rule: ComplianceRule, input: ComplianceAutomationInput): ComplianceViolation | null {
		// ANVISA compliance checks for healthcare data
		if (input.dataCategories.includes("health_data")) {
			switch (rule.id) {
				case "anvisa_medical_data_encryption":
					if (!this.isDataEncrypted(input)) {
						return {
							type: "ANVISA",
							severity: "critical",
							code: "ANVISA-001",
							description: "Medical data must be encrypted in transit and at rest",
							regulation: "ANVISA Resolution RDC 797/2023",
							remediation: "Implement end-to-end encryption for all medical data",
						};
					}
					break;

				case "anvisa_professional_authorization":
					if (input.operationType.includes("diagnosis") && !this.hasHealthcareProfessionalAuth(input)) {
						return {
							type: "ANVISA",
							severity: "critical",
							code: "ANVISA-002",
							description: "Medical diagnosis operations require healthcare professional authorization",
							regulation: "ANVISA Resolution RDC 797/2023",
							remediation: "Ensure operation is authorized by licensed healthcare professional",
						};
					}
					break;
			}
		}

		return null;
	}

	private checkCFMCompliance(rule: ComplianceRule, input: ComplianceAutomationInput): ComplianceViolation | null {
		// CFM (Conselho Federal de Medicina) compliance checks
		if (input.operationType.includes("medical") || input.operationType.includes("diagnosis")) {
			switch (rule.id) {
				case "cfm_telemedicine_requirements":
					if (!this.meetsTelemedicineRequirements(input)) {
						return {
							type: "CFM",
							severity: "high",
							code: "CFM-001",
							description: "Telemedicine operations must comply with CFM Resolution 2314/2022",
							regulation: "CFM Resolution 2314/2022",
							remediation: "Ensure telemedicine consultation meets all CFM requirements",
						};
					}
					break;

				case "cfm_medical_record_integrity":
					if (!this.hasValidMedicalRecordIntegrity(input)) {
						return {
							type: "CFM",
							severity: "high",
							code: "CFM-002",
							description: "Medical record integrity and authenticity must be guaranteed",
							regulation: "CFM Resolution 1638/2002",
							remediation: "Implement digital signatures and audit trails for medical records",
						};
					}
					break;
			}
		}

		return null;
	}

	private checkInternalCompliance(rule: ComplianceRule, input: ComplianceAutomationInput): ComplianceViolation | null {
		// Internal compliance checks
		switch (rule.id) {
			case "internal_ai_transparency":
				if (input.serviceName.includes("ai") && !this.hasAITransparency(input)) {
					return {
						type: "INTERNAL",
						severity: "medium",
						code: "INT-001",
						description: "AI operations must provide transparency and explainability",
						regulation: "Internal AI Ethics Policy",
						remediation: "Implement AI decision transparency and user notification",
					};
				}
				break;

			case "internal_audit_trail":
				if (!this.hasAuditTrail(input)) {
					return {
						type: "INTERNAL",
						severity: "medium",
						code: "INT-002",
						description: "All operations must maintain comprehensive audit trails",
						regulation: "Internal Audit Policy",
						remediation: "Enable comprehensive audit logging for all operations",
					};
				}
				break;
		}

		return null;
	}

	private determineLawfulBasis(input: ComplianceAutomationInput): string {
		// Determine lawful basis according to LGPD
		if (input.sensitiveDataHandled) {
			return "explicit_consent"; // Art. 11 LGPD
		}

		if (input.dataCategories.includes("health_data")) {
			return "protection_of_life"; // Art. 7, IV LGPD
		}

		if (input.purpose.includes("contract") || input.purpose.includes("service")) {
			return "contract_execution"; // Art. 7, V LGPD
		}

		if (input.purpose.includes("legal") || input.purpose.includes("compliance")) {
			return "legal_obligation"; // Art. 7, II LGPD
		}

		return "legitimate_interest"; // Art. 7, IX LGPD
	}

	private isConsentRequired(input: ComplianceAutomationInput, lawfulBasis: string): boolean {
		return (
			lawfulBasis === "explicit_consent" ||
			input.sensitiveDataHandled ||
			input.dataCategories.includes("biometric_data")
		);
	}

	private calculateRetentionPeriod(input: ComplianceAutomationInput): number {
		if (input.retentionPeriodDays) {
			return input.retentionPeriodDays;
		}

		// Default retention periods by data category
		if (input.dataCategories.includes("health_data")) {
			return 2555; // 7 years for medical records
		}

		if (input.dataCategories.includes("financial_data")) {
			return 1825; // 5 years for financial records
		}

		if (input.dataCategories.includes("sensitive_data")) {
			return 365; // 1 year for sensitive data
		}

		return 730; // 2 years default
	}

	private async generateRecommendations(
		input: ComplianceAutomationInput,
		violations: ComplianceViolation[]
	): Promise<ComplianceRecommendation[]> {
		const recommendations: ComplianceRecommendation[] = [];

		// Generate recommendations based on violations
		for (const violation of violations) {
			switch (violation.code) {
				case "LGPD-001":
					recommendations.push({
						category: "consent_management",
						priority: "high",
						action: "Implement consent management system",
						description: "Deploy automated consent collection and management for sensitive data processing",
						implementationSteps: [
							"Create consent collection interface",
							"Implement consent storage and tracking",
							"Add consent withdrawal mechanisms",
							"Create consent audit reports",
						],
					});
					break;

				case "LGPD-002":
					recommendations.push({
						category: "data_protection",
						priority: "high",
						action: "Define clear data processing purposes",
						description: "Establish clear, documented purposes for all data processing activities",
						implementationSteps: [
							"Document all data processing purposes",
							"Map data flows to specific purposes",
							"Create purpose limitation controls",
							"Implement purpose change notifications",
						],
					});
					break;

				case "ANVISA-001":
					recommendations.push({
						category: "data_protection",
						priority: "high",
						action: "Implement medical data encryption",
						description: "Deploy end-to-end encryption for all medical data processing",
						implementationSteps: [
							"Enable database encryption at rest",
							"Implement TLS 1.3 for data in transit",
							"Deploy field-level encryption for sensitive fields",
							"Create encryption key management system",
						],
					});
					break;
			}
		}

		// General recommendations based on service type
		if (input.serviceName.includes("ai")) {
			recommendations.push({
				category: "access_control",
				priority: "medium",
				action: "Implement AI transparency measures",
				description: "Add explainability and transparency features for AI decisions",
				implementationSteps: [
					"Implement decision explanation interfaces",
					"Add confidence score displays",
					"Create AI decision audit logs",
					"Provide user-friendly AI explanations",
				],
			});
		}

		return recommendations;
	}

	private createAuditTrail(
		input: ComplianceAutomationInput,
		violations: ComplianceViolation[],
		lawfulBasis: string,
		consentRequired: boolean,
		retentionPeriod: number
	): ComplianceAuditEntry {
		return {
			timestamp: new Date(),
			userId: input.userId,
			clinicId: input.clinicId,
			serviceName: input.serviceName,
			operationType: input.operationType,
			dataCategories: input.dataCategories,
			complianceStatus:
				violations.length === 0
					? "compliant"
					: violations.some((v) => v.severity === "critical")
						? "non_compliant"
						: "requires_review",
			violationsCount: violations.length,
			lawfulBasis,
			consentObtained: !consentRequired || this.hasValidConsent(input),
			retentionPeriod,
		};
	}

	private async logComplianceCheck(auditTrail: ComplianceAuditEntry): Promise<void> {
		try {
			await this.supabase.from("ai_compliance_logs").insert({
				user_id: auditTrail.userId,
				clinic_id: auditTrail.clinicId,
				service_name: auditTrail.serviceName,
				operation_type: auditTrail.operationType,
				data_categories: auditTrail.dataCategories,
				lawful_basis: auditTrail.lawfulBasis,
				purpose: "AI service compliance check",
				retention_period_days: auditTrail.retentionPeriod,
				sensitive_data_handled: auditTrail.dataCategories.includes("sensitive_data"),
				consent_obtained: auditTrail.consentObtained,
				audit_trail: {
					compliance_status: auditTrail.complianceStatus,
					violations_count: auditTrail.violationsCount,
					timestamp: auditTrail.timestamp.toISOString(),
				},
			});

			this.logger.info("Compliance check logged successfully", {
				serviceName: this.serviceId,
				userId: auditTrail.userId,
				clinicId: auditTrail.clinicId,
				complianceStatus: auditTrail.complianceStatus,
				violationsCount: auditTrail.violationsCount,
			});
		} catch (error) {
			this.logger.error("Failed to log compliance check", {
				serviceName: this.serviceId,
				error: error instanceof Error ? error.message : String(error),
			});
		}
	}

	private async handleCriticalViolations(
		violations: ComplianceViolation[],
		input: ComplianceAutomationInput
	): Promise<void> {
		for (const violation of violations) {
			// Log critical violation
			this.logger.error("Critical compliance violation detected", {
				serviceName: this.serviceId,
				userId: input.userId,
				clinicId: input.clinicId,
				violationType: violation.type,
				violationCode: violation.code,
				description: violation.description,
			});

			// Create alert
			await this.createComplianceAlert(violation, input);

			// Block operation if necessary
			if (this.shouldBlockOperation(violation)) {
				throw new Error(`Operation blocked due to critical compliance violation: ${violation.description}`);
			}
		}
	}

	private async createComplianceAlert(violation: ComplianceViolation, input: ComplianceAutomationInput): Promise<void> {
		try {
			await this.supabase.from("ai_system_alerts").insert({
				alert_type: "compliance_violation",
				severity: violation.severity,
				service_name: input.serviceName,
				message: `${violation.type} violation: ${violation.description}`,
				details: {
					violation_code: violation.code,
					regulation: violation.regulation,
					remediation: violation.remediation,
					user_id: input.userId,
					clinic_id: input.clinicId,
					operation_type: input.operationType,
				},
			});
		} catch (error) {
			this.logger.error("Failed to create compliance alert", {
				serviceName: this.serviceId,
				error: error instanceof Error ? error.message : String(error),
			});
		}
	}

	private shouldBlockOperation(violation: ComplianceViolation): boolean {
		// Block operations for critical violations
		const blockingCodes = ["LGPD-001", "ANVISA-001", "ANVISA-002"];
		return violation.severity === "critical" && blockingCodes.includes(violation.code);
	}

	// Helper methods for compliance checks
	private hasValidConsent(input: ComplianceAutomationInput): boolean {
		// Implementation would check consent records
		return false; // Placeholder - implement actual consent checking
	}

	private isPurposeLegitimate(purpose: string): boolean {
		const legitimatePurposes = [
			"healthcare_service",
			"medical_diagnosis",
			"treatment_monitoring",
			"appointment_scheduling",
			"patient_communication",
			"quality_improvement",
			"legal_compliance",
			"billing_processing",
		];

		return legitimatePurposes.some((legit) => purpose.toLowerCase().includes(legit));
	}

	private isDataExcessive(dataCategories: string[], purpose: string): boolean {
		// Simplified logic - in production, this would be more sophisticated
		const necessaryCategories = this.getNecessaryDataCategories(purpose);
		return dataCategories.some((category) => !necessaryCategories.includes(category));
	}

	private getNecessaryDataCategories(purpose: string): string[] {
		const purposeMap: Record<string, string[]> = {
			healthcare_service: ["personal_data", "health_data", "contact_data"],
			medical_diagnosis: ["personal_data", "health_data", "sensitive_data"],
			appointment_scheduling: ["personal_data", "contact_data"],
			billing_processing: ["personal_data", "financial_data"],
		};

		for (const [key, categories] of Object.entries(purposeMap)) {
			if (purpose.toLowerCase().includes(key)) {
				return categories;
			}
		}

		return ["personal_data"]; // Default minimal set
	}

	private getMaxRetentionPeriod(dataCategories: string[]): number {
		let maxPeriod = 365; // Default 1 year

		if (dataCategories.includes("health_data")) {
			maxPeriod = Math.max(maxPeriod, 2555); // 7 years for medical records
		}

		if (dataCategories.includes("financial_data")) {
			maxPeriod = Math.max(maxPeriod, 1825); // 5 years for financial records
		}

		return maxPeriod;
	}

	private isDataEncrypted(input: ComplianceAutomationInput): boolean {
		// Implementation would check encryption status
		return true; // Placeholder - implement actual encryption checking
	}

	private hasHealthcareProfessionalAuth(input: ComplianceAutomationInput): boolean {
		// Implementation would check professional authorization
		return false; // Placeholder - implement actual authorization checking
	}

	private meetsTelemedicineRequirements(input: ComplianceAutomationInput): boolean {
		// Implementation would check telemedicine compliance
		return true; // Placeholder - implement actual telemedicine checking
	}

	private hasValidMedicalRecordIntegrity(input: ComplianceAutomationInput): boolean {
		// Implementation would check medical record integrity
		return true; // Placeholder - implement actual integrity checking
	}

	private hasAITransparency(input: ComplianceAutomationInput): boolean {
		// Implementation would check AI transparency measures
		return false; // Placeholder - implement actual transparency checking
	}

	private hasAuditTrail(input: ComplianceAutomationInput): boolean {
		// Implementation would check audit trail completeness
		return true; // Placeholder - implement actual audit trail checking
	}

	private async loadComplianceRules(): Promise<void> {
		// Load compliance rules - in production, this would come from database
		const defaultRules: ComplianceRule[] = [
			{
				id: "lgpd_sensitive_data_consent",
				name: "LGPD Sensitive Data Consent",
				type: "LGPD",
				category: "consent_management",
				conditions: [{ field: "sensitiveDataHandled", operator: "equals", value: true }],
				actions: [{ type: "require_consent", parameters: {} }],
				severity: "critical",
				enabled: true,
			},
			{
				id: "lgpd_purpose_limitation",
				name: "LGPD Purpose Limitation",
				type: "LGPD",
				category: "data_protection",
				conditions: [{ field: "dataCategories", operator: "contains", value: "personal_data" }],
				actions: [{ type: "log", parameters: {} }],
				severity: "high",
				enabled: true,
			},
			{
				id: "anvisa_medical_data_encryption",
				name: "ANVISA Medical Data Encryption",
				type: "ANVISA",
				category: "data_protection",
				conditions: [{ field: "dataCategories", operator: "contains", value: "health_data" }],
				actions: [{ type: "block", parameters: {} }],
				severity: "critical",
				enabled: true,
			},
		];

		defaultRules.forEach((rule) => {
			this.complianceRules.set(rule.id, rule);
		});
	}
}

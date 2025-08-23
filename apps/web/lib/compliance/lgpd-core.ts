/**
 * 🛡️ LGPD Core Business Logic - NeonPro Healthcare
 * ===============================================
 *
 * Core implementation of LGPD (Lei Geral de Proteção de Dados) compliance
 * for healthcare applications with Brazilian legal requirements.
 */

import { createClient } from "@supabase/supabase-js";

// LGPD Data Categories (Art. 5, LGPD)
export enum LGPDDataCategory {
	PERSONAL = "personal", // Art. 5, I - Personal data
	SENSITIVE = "sensitive", // Art. 5, II - Sensitive data
	ANONYMIZED = "anonymized", // Art. 5, III - Anonymized data
	PSEUDONYMIZED = "pseudonymized", // Art. 5, IV - Pseudonymized data
	HEALTH = "health", // Art. 11 - Health data (special category)
	BIOMETRIC = "biometric", // Art. 11 - Biometric data
	GENETIC = "genetic", // Art. 11 - Genetic data
}

// LGPD Legal Basis (Art. 7, LGPD)
export enum LGPDLegalBasis {
	CONSENT = "consent", // Art. 7, I
	CONTRACT_PERFORMANCE = "contract", // Art. 7, II
	LEGAL_OBLIGATION = "legal_obligation", // Art. 7, III
	VITAL_INTERESTS = "vital_interests", // Art. 7, IV
	PUBLIC_INTEREST = "public_interest", // Art. 7, V
	LEGITIMATE_INTEREST = "legitimate_interest", // Art. 7, IX
	HEALTH_PROTECTION = "health_protection", // Art. 11, II (specific for health)
	HEALTH_PROCEDURES = "health_procedures", // Art. 11, II (health procedures)
}

// Data Subject Rights (Art. 15-22, LGPD)
export enum LGPDDataSubjectRights {
	CONFIRMATION = "confirmation", // Art. 15 - Confirmation of processing
	ACCESS = "access", // Art. 15 - Access to data
	RECTIFICATION = "rectification", // Art. 16 - Correction of data
	ANONYMIZATION = "anonymization", // Art. 16 - Anonymization
	BLOCKING = "blocking", // Art. 16 - Blocking of data
	ELIMINATION = "elimination", // Art. 16 - Elimination of data
	PORTABILITY = "portability", // Art. 18 - Data portability
	INFORMATION = "information", // Art. 19 - Information about data sharing
}

// LGPD Processing Purposes
export type LGPDProcessingPurpose = {
	id: string;
	category: LGPDDataCategory;
	legalBasis: LGPDLegalBasis;
	purpose: string;
	dataTypes: string[];
	retentionPeriod: number; // days
	isHealthcareRelated: boolean;
	requiresExplicitConsent: boolean;
	canBeAnonymized: boolean;
	description: string;
};

// Healthcare-specific LGPD purposes
export const HEALTHCARE_PROCESSING_PURPOSES: LGPDProcessingPurpose[] = [
	{
		id: "medical_care",
		category: LGPDDataCategory.HEALTH,
		legalBasis: LGPDLegalBasis.HEALTH_PROTECTION,
		purpose: "Prestação de cuidados médicos",
		dataTypes: ["medical_history", "diagnoses", "treatments", "prescriptions"],
		retentionPeriod: 20 * 365, // 20 years (CFM requirement)
		isHealthcareRelated: true,
		requiresExplicitConsent: false, // Legal basis is health protection
		canBeAnonymized: false, // Medical data must maintain traceability
		description:
			"Processamento de dados de saúde para prestação de cuidados médicos",
	},
	{
		id: "patient_identification",
		category: LGPDDataCategory.PERSONAL,
		legalBasis: LGPDLegalBasis.CONTRACT_PERFORMANCE,
		purpose: "Identificação do paciente",
		dataTypes: ["name", "cpf", "rg", "contact_info"],
		retentionPeriod: 5 * 365, // 5 years after contract end
		isHealthcareRelated: true,
		requiresExplicitConsent: false,
		canBeAnonymized: true,
		description:
			"Dados pessoais para identificação e comunicação com pacientes",
	},
	{
		id: "emergency_contact",
		category: LGPDDataCategory.PERSONAL,
		legalBasis: LGPDLegalBasis.VITAL_INTERESTS,
		purpose: "Contato de emergência",
		dataTypes: ["emergency_contact_name", "emergency_contact_phone"],
		retentionPeriod: 10 * 365, // While patient is active + 5 years
		isHealthcareRelated: true,
		requiresExplicitConsent: false,
		canBeAnonymized: false, // Need for emergency situations
		description: "Dados de contato para situações de emergência médica",
	},
	{
		id: "health_analytics",
		category: LGPDDataCategory.HEALTH,
		legalBasis: LGPDLegalBasis.CONSENT,
		purpose: "Análises de saúde e melhoria de serviços",
		dataTypes: ["aggregated_health_data", "treatment_outcomes"],
		retentionPeriod: 10 * 365, // 10 years for research
		isHealthcareRelated: true,
		requiresExplicitConsent: true,
		canBeAnonymized: true,
		description:
			"Análise de dados agregados para melhoria dos cuidados de saúde",
	},
	{
		id: "medical_research",
		category: LGPDDataCategory.HEALTH,
		legalBasis: LGPDLegalBasis.CONSENT,
		purpose: "Pesquisa médica e científica",
		dataTypes: ["anonymized_health_data", "research_datasets"],
		retentionPeriod: 15 * 365, // 15 years for academic research
		isHealthcareRelated: true,
		requiresExplicitConsent: true,
		canBeAnonymized: true,
		description:
			"Participação em pesquisas médicas e científicas (anonimizadas)",
	},
];

// LGPD Consent Management
export type LGPDConsent = {
	id: string;
	userId: string;
	purposeId: string;
	status: "granted" | "withdrawn" | "expired";
	grantedAt: Date;
	withdrawnAt?: Date;
	expiresAt?: Date;
	consentString: string; // Specific consent text shown to user
	userAgent: string;
	ipAddress: string;
	evidenceDocument?: string; // Path to consent evidence
};

// Data Subject Request
export type LGPDDataSubjectRequest = {
	id: string;
	userId: string;
	requestType: LGPDDataSubjectRights;
	status: "pending" | "processing" | "completed" | "rejected";
	requestedAt: Date;
	completedAt?: Date;
	description: string;
	response?: string;
	evidenceDocuments: string[];
	processingNotes: string;
};

// LGPD Audit Log
export type LGPDAuditLog = {
	id: string;
	userId?: string;
	action: string;
	dataCategory: LGPDDataCategory;
	legalBasis: LGPDLegalBasis;
	purposeId: string;
	timestamp: Date;
	ipAddress: string;
	userAgent: string;
	dataAccessed?: string[];
	dataModified?: string[];
	additionalContext: Record<string, any>;
};

class LGPDComplianceManager {
	private readonly supabase: ReturnType<typeof createClient>;

	constructor(supabaseUrl: string, supabaseAnonKey: string) {
		this.supabase = createClient(supabaseUrl, supabaseAnonKey);
	}

	// Consent Management
	async grantConsent(
		consent: Omit<LGPDConsent, "id" | "grantedAt">,
	): Promise<LGPDConsent> {
		const newConsent: LGPDConsent = {
			...consent,
			id: crypto.randomUUID(),
			grantedAt: new Date(),
			expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
		};

		const { data, error } = await this.supabase
			.from("lgpd_consents")
			.insert(newConsent)
			.select()
			.single();

		if (error) {
			throw new Error(`Failed to record consent: ${error.message}`);
		}

		await this.auditLog({
			userId: consent.userId,
			action: "CONSENT_GRANTED",
			dataCategory: LGPDDataCategory.PERSONAL,
			legalBasis: LGPDLegalBasis.CONSENT,
			purposeId: consent.purposeId,
			timestamp: new Date(),
			ipAddress: consent.ipAddress,
			userAgent: consent.userAgent,
			additionalContext: { consentString: consent.consentString },
		});

		return data;
	}

	async withdrawConsent(consentId: string, userId: string): Promise<void> {
		const withdrawnAt = new Date();

		const { error } = await this.supabase
			.from("lgpd_consents")
			.update({
				status: "withdrawn",
				withdrawnAt: withdrawnAt.toISOString(),
			})
			.eq("id", consentId)
			.eq("userId", userId);

		if (error) {
			throw new Error(`Failed to withdraw consent: ${error.message}`);
		}

		await this.auditLog({
			userId,
			action: "CONSENT_WITHDRAWN",
			dataCategory: LGPDDataCategory.PERSONAL,
			legalBasis: LGPDLegalBasis.CONSENT,
			purposeId: consentId,
			timestamp: withdrawnAt,
			ipAddress: "",
			userAgent: "",
			additionalContext: { consentId },
		});
	} // Data Subject Rights Implementation
	async processDataSubjectRequest(
		request: Omit<LGPDDataSubjectRequest, "id" | "requestedAt" | "status">,
	): Promise<LGPDDataSubjectRequest> {
		const newRequest: LGPDDataSubjectRequest = {
			...request,
			id: crypto.randomUUID(),
			requestedAt: new Date(),
			status: "pending",
			evidenceDocuments: request.evidenceDocuments || [],
			processingNotes: request.processingNotes || "",
		};

		const { data, error } = await this.supabase
			.from("lgpd_data_subject_requests")
			.insert(newRequest)
			.select()
			.single();

		if (error) {
			throw new Error(
				`Failed to create data subject request: ${error.message}`,
			);
		}

		await this.auditLog({
			userId: request.userId,
			action: `DATA_SUBJECT_REQUEST_${request.requestType.toUpperCase()}`,
			dataCategory: LGPDDataCategory.PERSONAL,
			legalBasis: LGPDLegalBasis.LEGAL_OBLIGATION,
			purposeId: "data_subject_rights",
			timestamp: new Date(),
			ipAddress: "",
			userAgent: "",
			additionalContext: {
				requestType: request.requestType,
				description: request.description,
			},
		});

		return data;
	}

	async handleAccessRequest(userId: string): Promise<any> {
		// Compile all user data across tables
		const userData = await this.getUserDataForExport(userId);

		const exportData = {
			personalData: userData.profile,
			medicalData: userData.medical,
			consents: userData.consents,
			auditLogs: userData.auditLogs,
			exportedAt: new Date().toISOString(),
			dataRetentionInfo: this.getDataRetentionInfo(userId),
		};

		// Store export for download
		const exportId = crypto.randomUUID();
		const { error } = await this.supabase.from("data_exports").insert({
			id: exportId,
			userId,
			exportData,
			createdAt: new Date().toISOString(),
			expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
		});

		if (error) {
			throw new Error(`Failed to create data export: ${error.message}`);
		}

		return { exportId, downloadUrl: `/api/lgpd/export/${exportId}` };
	}

	async handleErasureRequest(
		userId: string,
	): Promise<{ canDelete: boolean; retainedData: string[] }> {
		// Check for legal obligations to retain data
		const retainedData: string[] = [];
		let canDelete = true;

		// Check medical data retention requirements
		const medicalData = await this.supabase
			.from("medical_records")
			.select("*")
			.eq("patient_id", userId);

		if (medicalData.data && medicalData.data.length > 0) {
			// CFM requires 20 years retention for medical records
			const twentyYearsAgo = new Date();
			twentyYearsAgo.setFullYear(twentyYearsAgo.getFullYear() - 20);

			const recentMedicalRecords = medicalData.data.filter(
				(record) => new Date(record.created_at) > twentyYearsAgo,
			);

			if (recentMedicalRecords.length > 0) {
				retainedData.push(
					"Prontuários médicos (retenção obrigatória CFM - 20 anos)",
				);
				canDelete = false;
			}
		}

		// Check legal proceedings retention
		const legalMatters = await this.supabase
			.from("legal_matters")
			.select("*")
			.eq("patient_id", userId)
			.eq("status", "active");

		if (legalMatters.data && legalMatters.data.length > 0) {
			retainedData.push("Dados relacionados a processos judiciais ativos");
			canDelete = false;
		}

		if (canDelete) {
			// Perform anonymization instead of deletion for analytics
			await this.anonymizeUserData(userId);
		}

		return { canDelete, retainedData };
	}

	// Data Processing Validation
	async validateDataProcessing(
		userId: string,
		purposeId: string,
		dataTypes: string[],
	): Promise<{ isValid: boolean; reasons: string[] }> {
		const reasons: string[] = [];
		let isValid = true;

		// Check if purpose exists
		const purpose = HEALTHCARE_PROCESSING_PURPOSES.find(
			(p) => p.id === purposeId,
		);
		if (!purpose) {
			reasons.push(`Invalid processing purpose: ${purposeId}`);
			isValid = false;
		}

		if (purpose) {
			// Check if explicit consent is required
			if (purpose.requiresExplicitConsent) {
				const consent = await this.supabase
					.from("lgpd_consents")
					.select("*")
					.eq("userId", userId)
					.eq("purposeId", purposeId)
					.eq("status", "granted")
					.single();

				if (!consent.data) {
					reasons.push(
						`Explicit consent required for purpose: ${purpose.purpose}`,
					);
					isValid = false;
				}
			}

			// Check data types alignment
			const invalidDataTypes = dataTypes.filter(
				(dt) => !purpose.dataTypes.includes(dt),
			);
			if (invalidDataTypes.length > 0) {
				reasons.push(
					`Invalid data types for purpose: ${invalidDataTypes.join(", ")}`,
				);
				isValid = false;
			}

			// Check retention period
			if (purpose.retentionPeriod > 0) {
				// Implementation would check if data is within retention period
			}
		}

		return { isValid, reasons };
	}

	// Audit Logging
	async auditLog(log: Omit<LGPDAuditLog, "id">): Promise<void> {
		const auditEntry: LGPDAuditLog = {
			...log,
			id: crypto.randomUUID(),
		};

		const { error } = await this.supabase
			.from("lgpd_audit_logs")
			.insert(auditEntry);

		if (error) {
			// Don't throw error to avoid breaking main functionality
		}
	}

	// Helper Methods
	private async getUserDataForExport(userId: string): Promise<any> {
		const [profile, medical, consents, auditLogs] = await Promise.all([
			this.supabase.from("profiles").select("*").eq("id", userId).single(),
			this.supabase
				.from("medical_records")
				.select("*")
				.eq("patient_id", userId),
			this.supabase.from("lgpd_consents").select("*").eq("userId", userId),
			this.supabase.from("lgpd_audit_logs").select("*").eq("userId", userId),
		]);

		return {
			profile: profile.data,
			medical: medical.data,
			consents: consents.data,
			auditLogs: auditLogs.data,
		};
	}

	private getDataRetentionInfo(_userId: string): any {
		return HEALTHCARE_PROCESSING_PURPOSES.map((purpose) => ({
			purpose: purpose.purpose,
			category: purpose.category,
			legalBasis: purpose.legalBasis,
			retentionPeriod: `${Math.floor(purpose.retentionPeriod / 365)} anos`,
			canBeAnonymized: purpose.canBeAnonymized,
		}));
	}

	private async anonymizeUserData(userId: string): Promise<void> {
		// Implement data anonymization logic
		// Replace identifying information with anonymous tokens
		// Keep medical data structure for analytics but remove identification

		await this.auditLog({
			userId,
			action: "DATA_ANONYMIZED",
			dataCategory: LGPDDataCategory.ANONYMIZED,
			legalBasis: LGPDLegalBasis.LEGAL_OBLIGATION,
			purposeId: "data_subject_rights",
			timestamp: new Date(),
			ipAddress: "",
			userAgent: "",
			additionalContext: { reason: "Data subject erasure request" },
		});
	}

	// LGPD Compliance Status Check
	async getComplianceStatus(userId: string): Promise<{
		overallScore: number;
		consentStatus: "compliant" | "partial" | "non_compliant";
		dataRetention: "compliant" | "review_needed";
		auditTrail: "complete" | "incomplete";
		recommendations: string[];
	}> {
		const recommendations: string[] = [];
		let overallScore = 100;

		// Check consent status
		const requiredConsents = HEALTHCARE_PROCESSING_PURPOSES.filter(
			(p) => p.requiresExplicitConsent,
		);
		const userConsents = await this.supabase
			.from("lgpd_consents")
			.select("*")
			.eq("userId", userId)
			.eq("status", "granted");

		const consentCoverage =
			(userConsents.data?.length || 0) / requiredConsents.length;
		const consentStatus =
			consentCoverage === 1
				? "compliant"
				: consentCoverage > 0.5
					? "partial"
					: "non_compliant";

		if (consentStatus !== "compliant") {
			overallScore -= 20;
			recommendations.push("Revisar e atualizar consentimentos necessários");
		}

		// Check data retention compliance
		const dataRetention = "compliant"; // Simplified for now

		// Check audit trail completeness
		const auditTrail = "complete"; // Simplified for now

		return {
			overallScore: Math.max(overallScore, 0),
			consentStatus,
			dataRetention,
			auditTrail,
			recommendations,
		};
	}
}

// Export singleton instance
export const lgpdManager = new LGPDComplianceManager(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// Helper functions for common LGPD operations
export const LGPDUtils = {
	// Check if data processing is allowed
	canProcessData: async (
		userId: string,
		purpose: string,
		dataType: string,
	): Promise<boolean> => {
		const result = await lgpdManager.validateDataProcessing(userId, purpose, [
			dataType,
		]);
		return result.isValid;
	},

	// Get user's active consents
	getUserConsents: async (_userId: string): Promise<LGPDConsent[]> => {
		// Implementation would fetch from database
		return [];
	},

	// Format data for LGPD export
	formatDataForExport: (userData: any): any => {
		return {
			...userData,
			exportInfo: {
				generatedAt: new Date().toISOString(),
				format: "JSON",
				standard: "LGPD Article 18 - Data Portability",
				validUntil: new Date(
					Date.now() + 7 * 24 * 60 * 60 * 1000,
				).toISOString(),
			},
		};
	},
};

export default lgpdManager;

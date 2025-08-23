import { HEALTHCARE_DATA_RETENTION_DAYS } from "@neonpro/types/constants/healthcare-constants";
import { addDays } from "date-fns";
import { z } from "zod";

/**
 * LGPD (Lei Geral de Proteção de Dados) Compliance Service
 * Implements automated compliance workflows for Brazilian data protection law
 *
 * Features:
 * - Consent management with granular tracking
 * - Data subject rights automation (access, rectification, erasure, portability)
 * - Privacy impact assessments
 * - Breach notification automation
 * - Data retention policy enforcement
 */

/**
 * LGPD lawful basis for data processing
 */
export enum LgpdLawfulBasis {
	CONSENT = "consent",
	CONTRACT = "contract",
	LEGAL_OBLIGATION = "legal_obligation",
	VITAL_INTERESTS = "vital_interests",
	PUBLIC_TASK = "public_task",
	LEGITIMATE_INTERESTS = "legitimate_interests",
}

/**
 * Data processing purposes
 */
export enum DataProcessingPurpose {
	MEDICAL_TREATMENT = "medical_treatment",
	APPOINTMENT_SCHEDULING = "appointment_scheduling",
	BILLING = "billing",
	MARKETING = "marketing",
	RESEARCH = "research",
	LEGAL_COMPLIANCE = "legal_compliance",
	SECURITY = "security",
}

/**
 * Data categories for processing
 */
export enum DataCategory {
	PERSONAL = "personal", // Name, email, phone
	HEALTH = "health", // Medical records, health data
	FINANCIAL = "financial", // Payment info, billing
	BEHAVIORAL = "behavioral", // Usage patterns, preferences
	SENSITIVE = "sensitive", // Special categories (health, ethnicity, etc.)
	BIOMETRIC = "biometric", // Biometric identifiers
}

/**
 * Data subject rights under LGPD
 */
export enum DataSubjectRight {
	ACCESS = "access", // Art. 18, I - Access to personal data
	RECTIFICATION = "rectification", // Art. 18, III - Rectification of data
	ERASURE = "erasure", // Art. 18, II - Deletion of data
	PORTABILITY = "portability", // Art. 18, V - Data portability
	OBJECTION = "objection", // Art. 18, § 2º - Object to processing
	RESTRICTION = "restriction", // Art. 18, IV - Restrict processing
	INFORMATION = "information", // Art. 18, I - Information about processing
}

/**
 * Consent record schema
 */
export const consentSchema = z.object({
	userId: z.string().uuid("User ID deve ser um UUID válido"),
	purpose: z.nativeEnum(DataProcessingPurpose),
	lawfulBasis: z.nativeEnum(LgpdLawfulBasis),
	dataCategories: z.array(z.nativeEnum(DataCategory)),
	consentText: z.string().min(10).max(5000),
	version: z.string().default("1.0"),
	language: z.string().length(2).default("pt"),
	retentionPeriod: z.number().min(1).max(3650), // Days
	canWithdraw: z.boolean().default(true),
	granularConsent: z.record(z.boolean()).optional(),
	thirdPartySharing: z.boolean().default(false),
	internationalTransfer: z.boolean().default(false),
	automatedDecisionMaking: z.boolean().default(false),
});

/**
 * Data subject request schema
 */
export const dataSubjectRequestSchema = z.object({
	userId: z.string().uuid(),
	requestType: z.nativeEnum(DataSubjectRight),
	description: z.string().min(10).max(1000),
	preferredFormat: z.enum(["json", "pdf", "csv"]).default("json"),
	deliveryMethod: z.enum(["email", "download", "postal"]).default("email"),
	specificData: z.array(z.string()).optional(),
	verificationMethod: z.enum(["email", "sms", "in_person"]).default("email"),
});

/**
 * Consent record interface
 */
export interface ConsentRecord extends z.infer<typeof consentSchema> {
	id: string;
	timestamp: Date;
	ipAddress: string;
	userAgent?: string;
	isActive: boolean;
	withdrawnAt?: Date;
	withdrawalReason?: string;
	auditTrail: ConsentAuditEntry[];
}

/**
 * Consent audit trail entry
 */
export type ConsentAuditEntry = {
	id: string;
	timestamp: Date;
	action: "given" | "withdrawn" | "modified" | "expired";
	userId: string;
	ipAddress: string;
	details?: Record<string, any>;
};

/**
 * Data subject request interface
 */
export interface DataSubjectRequest
	extends z.infer<typeof dataSubjectRequestSchema> {
	id: string;
	status:
		| "pending"
		| "in_progress"
		| "completed"
		| "rejected"
		| "partially_completed";
	createdAt: Date;
	updatedAt: Date;
	completedAt?: Date;
	verificationStatus: "pending" | "verified" | "failed";
	response?: DataSubjectResponse;
	processingNotes?: string[];
}

/**
 * Data subject request response
 */
export type DataSubjectResponse = {
	requestId: string;
	data?: any;
	format: "json" | "pdf" | "csv";
	fileUrl?: string;
	deliveredAt?: Date;
	expiresAt?: Date;
	downloadCount: number;
	maxDownloads: number;
};

/**
 * LGPD Service Implementation
 */
export class LgpdService {
	/**
	 * Record user consent for data processing
	 */
	static async recordConsent(
		consentData: z.infer<typeof consentSchema>,
		ipAddress: string,
		userAgent?: string,
	): Promise<ConsentRecord> {
		// Validate consent data
		const validated = consentSchema.parse(consentData);

		const consent: ConsentRecord = {
			...validated,
			id: crypto.randomUUID(),
			timestamp: new Date(),
			ipAddress,
			userAgent,
			isActive: true,
			auditTrail: [],
		};

		// Create initial audit entry
		const auditEntry: ConsentAuditEntry = {
			id: crypto.randomUUID(),
			timestamp: new Date(),
			action: "given",
			userId: consent.userId,
			ipAddress,
			details: {
				purpose: consent.purpose,
				lawfulBasis: consent.lawfulBasis,
				dataCategories: consent.dataCategories,
			},
		};

		consent.auditTrail.push(auditEntry);

		// Store in database (implementation depends on storage backend)
		await LgpdService.storeConsent(consent);

		return consent;
	}

	/**
	 * Withdraw user consent and trigger data processing stops
	 */
	static async withdrawConsent(
		consentId: string,
		userId: string,
		reason: string,
		ipAddress: string,
	): Promise<{ success: boolean; message: string; dataRetention?: string }> {
		try {
			// Retrieve existing consent
			const consent = await LgpdService.getConsentById(consentId);

			if (!consent || consent.userId !== userId) {
				return {
					success: false,
					message: "Consentimento não encontrado ou não autorizado",
				};
			}

			if (!consent.isActive) {
				return {
					success: false,
					message: "Consentimento já foi retirado anteriormente",
				};
			}

			// Check if consent can be withdrawn
			if (!consent.canWithdraw) {
				return {
					success: false,
					message:
						"Este consentimento não pode ser retirado devido a obrigações legais",
				};
			}

			// Update consent record
			consent.isActive = false;
			consent.withdrawnAt = new Date();
			consent.withdrawalReason = reason;

			// Add audit entry
			const auditEntry: ConsentAuditEntry = {
				id: crypto.randomUUID(),
				timestamp: new Date(),
				action: "withdrawn",
				userId,
				ipAddress,
				details: { reason },
			};

			consent.auditTrail.push(auditEntry);

			// Update in database
			await LgpdService.updateConsent(consent);

			// Trigger data processing stops
			await LgpdService.stopDataProcessing(userId, consent.purpose);

			// Determine data retention requirements
			const retentionInfo = await LgpdService.getDataRetentionInfo(consent);

			return {
				success: true,
				message: "Consentimento retirado com sucesso",
				dataRetention: retentionInfo,
			};
		} catch (_error) {
			return {
				success: false,
				message: "Erro interno ao retirar consentimento",
			};
		}
	}

	/**
	 * Process data subject rights request
	 */
	static async processDataSubjectRequest(
		requestData: z.infer<typeof dataSubjectRequestSchema>,
		_ipAddress: string,
	): Promise<DataSubjectRequest> {
		// Validate request data
		const validated = dataSubjectRequestSchema.parse(requestData);

		const request: DataSubjectRequest = {
			...validated,
			id: crypto.randomUUID(),
			status: "pending",
			createdAt: new Date(),
			updatedAt: new Date(),
			verificationStatus: "pending",
			processingNotes: [],
		};

		// Store request
		await LgpdService.storeDataSubjectRequest(request);

		// Start verification process
		await LgpdService.initiateVerification(request);

		// Schedule automatic processing
		await LgpdService.scheduleRequestProcessing(request.id);

		return request;
	}

	/**
	 * Process data access request (LGPD Art. 18, I)
	 */
	static async processAccessRequest(
		requestId: string,
	): Promise<DataSubjectResponse> {
		const request = await LgpdService.getDataSubjectRequest(requestId);

		if (!request || request.requestType !== DataSubjectRight.ACCESS) {
			throw new Error("Invalid access request");
		}

		// Gather all user data
		const userData = await LgpdService.gatherUserData(request.userId);

		// Format data according to preferred format
		const formattedData = await LgpdService.formatUserData(
			userData,
			request.preferredFormat,
		);

		// Create response
		const response: DataSubjectResponse = {
			requestId: request.id,
			data: formattedData,
			format: request.preferredFormat,
			deliveredAt: new Date(),
			expiresAt: addDays(new Date(), 30), // 30 days access
			downloadCount: 0,
			maxDownloads: 5,
		};

		// Update request status
		await LgpdService.updateRequestStatus(requestId, "completed", response);

		return response;
	}

	/**
	 * Process data deletion request (LGPD Art. 18, II)
	 */
	static async processErasureRequest(requestId: string): Promise<{
		deleted: string[];
		retained: string[];
		reasons: Record<string, string>;
	}> {
		const request = await LgpdService.getDataSubjectRequest(requestId);

		if (!request || request.requestType !== DataSubjectRight.ERASURE) {
			throw new Error("Invalid erasure request");
		}

		const result = {
			deleted: [] as string[],
			retained: [] as string[],
			reasons: {} as Record<string, string>,
		};

		// Check legal basis for each data category
		const userConsents = await LgpdService.getUserConsents(request.userId);
		const legalObligations = await LgpdService.getLegalRetentionRequirements(
			request.userId,
		);

		for (const consent of userConsents) {
			for (const category of consent.dataCategories) {
				if (legalObligations.includes(category)) {
					// Cannot delete due to legal obligation
					result.retained.push(category);
					result.reasons[category] =
						"Legal obligation (healthcare records retention)";
				} else if (
					consent.lawfulBasis === LgpdLawfulBasis.CONSENT &&
					!consent.isActive
				) {
					// Can delete - consent withdrawn and no legal basis
					await LgpdService.deleteUserDataByCategory(request.userId, category);
					result.deleted.push(category);
				} else {
					// Evaluate other lawful bases
					const canDelete = await LgpdService.evaluateErasureEligibility(
						request.userId,
						category,
					);
					if (canDelete) {
						await LgpdService.deleteUserDataByCategory(
							request.userId,
							category,
						);
						result.deleted.push(category);
					} else {
						result.retained.push(category);
						result.reasons[category] =
							"Legitimate interests or contract performance";
					}
				}
			}
		}

		// Update request status
		await LgpdService.updateRequestStatus(requestId, "completed");

		return result;
	}

	/**
	 * Generate privacy impact assessment
	 */
	static async generatePrivacyImpactAssessment(processingActivity: {
		name: string;
		purpose: DataProcessingPurpose;
		dataCategories: DataCategory[];
		recipients: string[];
		retentionPeriod: number;
		automatedDecisionMaking: boolean;
		internationalTransfer: boolean;
	}): Promise<{
		riskLevel: "low" | "medium" | "high" | "very_high";
		riskFactors: string[];
		mitigationMeasures: string[];
		recommendation: string;
	}> {
		let riskScore = 0;
		const riskFactors: string[] = [];
		const mitigationMeasures: string[] = [];

		// Assess risk factors
		if (processingActivity.dataCategories.includes(DataCategory.HEALTH)) {
			riskScore += 3;
			riskFactors.push("Processing of health data (special category)");
			mitigationMeasures.push("Implement encryption at rest and in transit");
			mitigationMeasures.push("Strict access controls and audit logging");
		}

		if (processingActivity.dataCategories.includes(DataCategory.BIOMETRIC)) {
			riskScore += 3;
			riskFactors.push("Processing of biometric data (special category)");
			mitigationMeasures.push("Biometric template protection");
		}

		if (processingActivity.automatedDecisionMaking) {
			riskScore += 2;
			riskFactors.push("Automated decision-making");
			mitigationMeasures.push("Human oversight and review mechanisms");
			mitigationMeasures.push("Transparency about decision logic");
		}

		if (processingActivity.internationalTransfer) {
			riskScore += 2;
			riskFactors.push("International data transfer");
			mitigationMeasures.push("Adequacy decision or appropriate safeguards");
		}

		if (processingActivity.retentionPeriod > HEALTHCARE_DATA_RETENTION_DAYS) {
			// > 7 years
			riskScore += 1;
			riskFactors.push("Long retention period");
			mitigationMeasures.push("Regular review of retention necessity");
		}

		// Determine risk level
		let riskLevel: "low" | "medium" | "high" | "very_high";
		if (riskScore <= 2) {
			riskLevel = "low";
		} else if (riskScore <= 4) {
			riskLevel = "medium";
		} else if (riskScore <= 6) {
			riskLevel = "high";
		} else {
			riskLevel = "very_high";
		}

		// Generate recommendation
		let recommendation: string;
		switch (riskLevel) {
			case "low":
				recommendation = "Standard data protection measures are sufficient.";
				break;
			case "medium":
				recommendation =
					"Additional safeguards recommended. Regular monitoring required.";
				break;
			case "high":
				recommendation =
					"Enhanced security measures mandatory. DPO consultation required.";
				break;
			case "very_high":
				recommendation =
					"Prior consultation with ANPD required. Comprehensive DPIA mandatory.";
				break;
		}

		return {
			riskLevel,
			riskFactors,
			mitigationMeasures,
			recommendation,
		};
	}

	/**
	 * Automated breach notification system
	 */
	static async handleDataBreach(incident: {
		description: string;
		affectedUsers: string[];
		dataCategories: DataCategory[];
		severity: "low" | "medium" | "high" | "critical";
		discoveredAt: Date;
		containedAt?: Date;
		cause: string;
	}): Promise<{
		anpdNotificationRequired: boolean;
		userNotificationRequired: boolean;
		notificationDeadline?: Date;
		riskAssessment: string;
	}> {
		const { affectedUsers, dataCategories, severity } = incident;

		// Assess breach severity and impact
		const isHighRisk = LgpdService.assessBreachRisk(
			dataCategories,
			affectedUsers.length,
			severity,
		);

		// ANPD notification requirements (LGPD Art. 48)
		const anpdNotificationRequired = isHighRisk || severity === "critical";

		// User notification requirements
		const userNotificationRequired =
			isHighRisk &&
			(dataCategories.includes(DataCategory.HEALTH) ||
				dataCategories.includes(DataCategory.SENSITIVE) ||
				dataCategories.includes(DataCategory.BIOMETRIC));

		// Calculate notification deadline (72 hours from discovery)
		const notificationDeadline = anpdNotificationRequired
			? addDays(incident.discoveredAt, 3)
			: undefined;

		// Risk assessment
		const riskAssessment = LgpdService.generateBreachRiskAssessment(incident);

		// Auto-schedule notifications if required
		if (anpdNotificationRequired) {
			await LgpdService.scheduleAnpdNotification(
				incident,
				notificationDeadline!,
			);
		}

		if (userNotificationRequired) {
			await LgpdService.scheduleUserNotifications(
				incident.affectedUsers,
				incident,
			);
		}

		return {
			anpdNotificationRequired,
			userNotificationRequired,
			notificationDeadline,
			riskAssessment,
		};
	}

	// Private helper methods (implementation depends on storage backend)

	private static async storeConsent(_consent: ConsentRecord): Promise<void> {}

	private static async getConsentById(
		_id: string,
	): Promise<ConsentRecord | null> {
		// Implementation depends on database
		return null;
	}

	private static async updateConsent(_consent: ConsentRecord): Promise<void> {}

	private static async storeDataSubjectRequest(
		_request: DataSubjectRequest,
	): Promise<void> {}

	private static async getDataSubjectRequest(
		_id: string,
	): Promise<DataSubjectRequest | null> {
		// Implementation depends on database
		return null;
	}

	private static async stopDataProcessing(
		_userId: string,
		_purpose: DataProcessingPurpose,
	): Promise<void> {}

	private static async getDataRetentionInfo(
		_consent: ConsentRecord,
	): Promise<string> {
		// Return retention information based on legal requirements
		return "Dados serão retidos conforme obrigações legais (7 anos para registros médicos)";
	}

	private static async initiateVerification(
		_request: DataSubjectRequest,
	): Promise<void> {}

	private static async scheduleRequestProcessing(
		_requestId: string,
	): Promise<void> {}

	private static async gatherUserData(userId: string): Promise<any> {
		// Gather all user data from various sources
		return { userId, message: "Mock user data" };
	}

	private static async formatUserData(
		data: any,
		_format: "json" | "pdf" | "csv",
	): Promise<any> {
		// Format data according to requested format
		return data;
	}

	private static async updateRequestStatus(
		_requestId: string,
		_status: DataSubjectRequest["status"],
		_response?: DataSubjectResponse,
	): Promise<void> {}

	private static async getUserConsents(
		_userId: string,
	): Promise<ConsentRecord[]> {
		// Get all user consents
		return [];
	}

	private static async getLegalRetentionRequirements(
		_userId: string,
	): Promise<DataCategory[]> {
		// Return data categories that must be retained due to legal obligations
		return [DataCategory.HEALTH]; // Medical records must be retained
	}

	private static async evaluateErasureEligibility(
		_userId: string,
		_category: DataCategory,
	): Promise<boolean> {
		// Evaluate if data can be erased based on lawful basis
		return false;
	}

	private static async deleteUserDataByCategory(
		_userId: string,
		_category: DataCategory,
	): Promise<void> {}

	private static assessBreachRisk(
		dataCategories: DataCategory[],
		affectedCount: number,
		severity: string,
	): boolean {
		return (
			dataCategories.includes(DataCategory.HEALTH) ||
			affectedCount > 100 ||
			severity === "critical"
		);
	}

	private static generateBreachRiskAssessment(incident: any): string {
		return `Risk assessment for breach affecting ${incident.affectedUsers.length} users`;
	}

	private static async scheduleAnpdNotification(
		_incident: any,
		_deadline: Date,
	): Promise<void> {}

	private static async scheduleUserNotifications(
		_userIds: string[],
		_incident: any,
	): Promise<void> {}
}

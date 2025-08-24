/**
 * NEONPRO LGPD Compliance Test Setup
 * Healthcare data protection and privacy compliance testing
 * Ensures LGPD (Lei Geral de Proteção de Dados) compliance in tests
 */

// LGPD Compliance Test Types
export type LGPDConsentRecord = {
	id: string;
	patientId: string;
	consentType: "data_processing" | "marketing" | "research" | "sharing";
	granted: boolean;
	grantedAt: string;
	revokedAt?: string;
	purpose: string;
	dataCategories: string[];
	retentionPeriod: number; // in months
	tenantId: string;
};

export type LGPDAuditLog = {
	id: string;
	action: "create" | "read" | "update" | "delete" | "export" | "anonymize";
	resourceType: "patient" | "appointment" | "medical_record" | "consent";
	resourceId: string;
	userId: string;
	userRole: string;
	timestamp: string;
	ipAddress: string;
	tenantId: string;
	purpose: string;
	sensitive: boolean;
};

// LGPD Mock Compliance Service
export class LGPDComplianceMockService {
	private readonly consentRecords: Map<string, LGPDConsentRecord> = new Map();
	private readonly auditLogs: Map<string, LGPDAuditLog> = new Map();
	private readonly tenantId: string;

	constructor(tenantId = "test-tenant-healthcare") {
		this.tenantId = tenantId;
	}

	async grantConsent(consent: Omit<LGPDConsentRecord, "id" | "grantedAt">): Promise<LGPDConsentRecord> {
		const id = `consent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
		const now = new Date().toISOString();

		const consentRecord: LGPDConsentRecord = {
			...consent,
			id,
			grantedAt: now,
			tenantId: this.tenantId,
		};

		this.consentRecords.set(id, consentRecord);

		// Log consent action
		await this.logAudit({
			action: "create",
			resourceType: "consent",
			resourceId: id,
			userId: "test-user",
			userRole: "patient",
			ipAddress: "127.0.0.1",
			purpose: "LGPD consent granted",
			sensitive: true,
		});

		return consentRecord;
	}
	async revokeConsent(consentId: string): Promise<LGPDConsentRecord | null> {
		const consent = this.consentRecords.get(consentId);
		if (!consent) {
			return null;
		}

		const revokedConsent: LGPDConsentRecord = {
			...consent,
			granted: false,
			revokedAt: new Date().toISOString(),
		};

		this.consentRecords.set(consentId, revokedConsent);

		// Log revocation
		await this.logAudit({
			action: "update",
			resourceType: "consent",
			resourceId: consentId,
			userId: "test-user",
			userRole: "patient",
			ipAddress: "127.0.0.1",
			purpose: "LGPD consent revoked",
			sensitive: true,
		});

		return revokedConsent;
	}

	async logAudit(audit: Omit<LGPDAuditLog, "id" | "timestamp">): Promise<LGPDAuditLog> {
		const id = `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
		const timestamp = new Date().toISOString();

		const auditLog: LGPDAuditLog = {
			...audit,
			id,
			timestamp,
			tenantId: this.tenantId,
		};

		this.auditLogs.set(id, auditLog);
		return auditLog;
	}

	async getConsentHistory(patientId: string): Promise<LGPDConsentRecord[]> {
		return Array.from(this.consentRecords.values())
			.filter((consent) => consent.patientId === patientId)
			.sort((a, b) => new Date(b.grantedAt).getTime() - new Date(a.grantedAt).getTime());
	}

	async getAuditTrail(resourceId: string): Promise<LGPDAuditLog[]> {
		return Array.from(this.auditLogs.values())
			.filter((log) => log.resourceId === resourceId)
			.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
	}

	clear(): void {
		this.consentRecords.clear();
		this.auditLogs.clear();
	}
} // Global LGPD Test Setup
let lgpdComplianceService: LGPDComplianceMockService;

// LGPD Test Utilities
export const createTestConsent = async (
	patientId: string,
	type: LGPDConsentRecord["consentType"] = "data_processing"
) => {
	const service = (globalThis as any).__LGPD_COMPLIANCE_SERVICE__ as LGPDComplianceMockService;

	return await service.grantConsent({
		patientId,
		consentType: type,
		granted: true,
		purpose: `Test ${type} consent`,
		dataCategories: ["personal_data", "health_data"],
		retentionPeriod: 60, // 5 years in months
		tenantId: "test-tenant-healthcare",
	});
};

export const validateLGPDCompliance = (patient: any): boolean => {
	// LGPD compliance validation rules
	const requiredFields = ["lgpdConsent", "tenantId"];
	const hasRequiredFields = requiredFields.every((field) => patient[field] !== undefined);

	// Ensure LGPD consent is explicitly granted
	const hasValidConsent = patient.lgpdConsent === true;

	// Ensure tenant isolation
	const hasTenantIsolation = patient.tenantId?.startsWith("test-tenant");

	return hasRequiredFields && hasValidConsent && hasTenantIsolation;
};

// Setup LGPD compliance service for each test
export const setupLGPDCompliance = () => {
	lgpdComplianceService = new LGPDComplianceMockService();
	(globalThis as any).__LGPD_COMPLIANCE_SERVICE__ = lgpdComplianceService;
};

// Cleanup LGPD compliance service
export const cleanupLGPDCompliance = () => {
	if (lgpdComplianceService) {
		lgpdComplianceService.clear();
	}
	(globalThis as any).__LGPD_COMPLIANCE_SERVICE__ = undefined;
};

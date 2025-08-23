import { beforeEach, vi } from "vitest";

// Healthcare test environment setup
beforeEach(() => {
	// Reset healthcare-specific mocks before each test
	vi.clearAllMocks();
});

// Mock CPF validation for Brazilian patient identification
export const mockCPFValidator = {
	validate: vi.fn((cpf: string) => {
		// Mock valid CPF patterns for testing
		const validCPFs = [
			"123.456.789-09",
			"12345678909",
			"987.654.321-00",
			"98765432100",
		];
		return validCPFs.includes(
			cpf
				.replace(/\D/g, "")
				.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4"),
		);
	}),
	format: vi.fn((cpf: string) => {
		const numbers = cpf.replace(/\D/g, "");
		return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
	}),
	sanitize: vi.fn((cpf: string) => cpf.replace(/\D/g, "")),
};

// Mock LGPD consent management
export const mockLGPDConsent = {
	recordConsent: vi.fn(async (patientId: string, purposes: string[]) => ({
		id: "consent-123",
		patientId,
		purposes,
		timestamp: new Date().toISOString(),
		ipAddress: "127.0.0.1",
		userAgent: "test-agent",
		status: "granted",
	})),

	withdrawConsent: vi.fn(async (consentId: string) => ({
		id: consentId,
		status: "withdrawn",
		withdrawnAt: new Date().toISOString(),
	})),

	checkConsent: vi.fn(async (_patientId: string, _purpose: string) => ({
		hasConsent: true,
		consentDate: new Date().toISOString(),
		expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
	})),

	getConsentHistory: vi.fn(async (_patientId: string) => [
		{
			id: "consent-123",
			purpose: "medical-treatment",
			status: "granted",
			timestamp: new Date().toISOString(),
		},
	]),
};

// Mock ANVISA compliance validation
export const mockANVISACompliance = {
	validateProduct: vi.fn(async (_productId: string) => ({
		isValid: true,
		anvisaCode: "ANVISA-12345",
		productName: "Test Medical Product",
		registrationStatus: "active",
		expirationDate: "2025-12-31",
		restrictions: [],
	})),

	validateProcedure: vi.fn(async (_procedureCode: string) => ({
		isAuthorized: true,
		procedureName: "Aesthetic Treatment",
		requiredLicense: "medical",
		safetyProtocols: ["patient-consent", "sterile-environment"],
		contraindications: [],
	})),

	reportAdverseEvent: vi.fn(async (_event: any) => ({
		reportId: "AE-2024-001",
		status: "submitted",
		submissionDate: new Date().toISOString(),
		followUpRequired: false,
	})),
};

// Mock CFM (Medical Council) validation
export const mockCFMValidation = {
	validateDoctor: vi.fn(async (crmNumber: string) => ({
		isValid: true,
		doctorName: "Dr. Test Professional",
		crmNumber,
		crmState: "SP",
		specialty: "Dermatologia",
		licenseStatus: "active",
		licenseExpiry: "2025-12-31",
	})),

	validateDigitalSignature: vi.fn(async (signature: string) => ({
		isValid: true,
		signatureId: signature,
		timestamp: new Date().toISOString(),
		algorithm: "RS256",
	})),

	validatePrescription: vi.fn(async (_prescriptionData: any) => ({
		isValid: true,
		prescriptionId: "PRESC-001",
		validatedAt: new Date().toISOString(),
		complianceScore: 100,
	})),
};

// Mock medical data encryption utilities
export const mockMedicalEncryption = {
	encryptPatientData: vi.fn(async (_data: any) => ({
		encryptedData: "encrypted-patient-data",
		keyId: "key-123",
		algorithm: "AES-256-GCM",
		timestamp: new Date().toISOString(),
	})),

	decryptPatientData: vi.fn(async (_encryptedData: string) => ({
		data: { patientId: "123", name: "Test Patient" },
		decryptedAt: new Date().toISOString(),
	})),

	generateAuditHash: vi.fn((_data: any) => "audit-hash-123"),

	validateDataIntegrity: vi.fn(async (_data: any, _hash: string) => ({
		isValid: true,
		verifiedAt: new Date().toISOString(),
	})),
};

// Mock healthcare audit logging
export const mockAuditLogger = {
	logAccess: vi.fn(
		async (action: string, resource: string, userId: string) => ({
			auditId: "audit-123",
			action,
			resource,
			userId,
			timestamp: new Date().toISOString(),
			ipAddress: "127.0.0.1",
			userAgent: "test-agent",
		}),
	),

	logDataModification: vi.fn(async (data: any) => ({
		auditId: "audit-modify-123",
		changes: data,
		timestamp: new Date().toISOString(),
	})),

	generateComplianceReport: vi.fn(
		async (startDate: string, endDate: string) => ({
			reportId: "compliance-report-123",
			period: { startDate, endDate },
			totalEvents: 100,
			complianceScore: 95,
			violations: [],
		}),
	),
};

// Mock patient data utilities for testing
export const mockPatientData = {
	createMockPatient: (overrides: any = {}) => ({
		id: "patient-123",
		cpf: "123.456.789-09",
		name: "João Silva Santos",
		email: "joao.silva@email.com",
		phone: "+55 11 99999-9999",
		dateOfBirth: "1990-05-15",
		gender: "M",
		address: {
			street: "Rua das Flores, 123",
			city: "São Paulo",
			state: "SP",
			zipCode: "01234-567",
			country: "BR",
		},
		emergencyContact: {
			name: "Maria Silva",
			relationship: "spouse",
			phone: "+55 11 88888-8888",
		},
		medicalHistory: [],
		allergies: [],
		medications: [],
		lgpdConsent: {
			granted: true,
			grantedAt: new Date().toISOString(),
			purposes: ["medical-treatment", "communication", "analytics"],
			...overrides.lgpdConsent,
		},
		...overrides,
	}),

	createMockTreatment: () => ({
		id: "treatment-123",
		patientId: "patient-123",
		doctorId: "doctor-123",
		type: "aesthetic-consultation",
		date: new Date().toISOString(),
		duration: 60,
		status: "scheduled",
		notes: "Initial consultation for aesthetic treatment",
		products: [],
		procedures: [],
		followUp: null,
	}),

	createMockMedicalRecord: () => ({
		id: "record-123",
		patientId: "patient-123",
		treatmentId: "treatment-123",
		date: new Date().toISOString(),
		type: "consultation",
		diagnosis: "Test diagnosis",
		treatment: "Test treatment plan",
		notes: "Patient consultation notes",
		attachments: [],
		signedBy: "doctor-123",
		digitalSignature: "signature-hash-123",
	}),
};

// Mock Supabase healthcare operations
export const mockSupabaseHealthcare = {
	patients: {
		create: vi.fn(async (_data: any) => ({
			data: mockPatientData.createMockPatient(),
			error: null,
		})),
		update: vi.fn(async (_id: string, data: any) => ({
			data: { ...mockPatientData.createMockPatient(), ...data },
			error: null,
		})),
		delete: vi.fn(async (_id: string) => ({ data: null, error: null })),
		findById: vi.fn(async (_id: string) => ({
			data: mockPatientData.createMockPatient(),
			error: null,
		})),
		findByCPF: vi.fn(async (_cpf: string) => ({
			data: mockPatientData.createMockPatient(),
			error: null,
		})),
	},

	treatments: {
		create: vi.fn(async (_data: any) => ({
			data: mockPatientData.createMockTreatment(),
			error: null,
		})),
		update: vi.fn(async (_id: string, data: any) => ({
			data: { ...mockPatientData.createMockTreatment(), ...data },
			error: null,
		})),
		findByPatient: vi.fn(async (_patientId: string) => ({
			data: [mockPatientData.createMockTreatment()],
			error: null,
		})),
	},

	medicalRecords: {
		create: vi.fn(async (_data: any) => ({
			data: mockPatientData.createMockMedicalRecord(),
			error: null,
		})),
		findByPatient: vi.fn(async (_patientId: string) => ({
			data: [mockPatientData.createMockMedicalRecord()],
			error: null,
		})),
	},
};

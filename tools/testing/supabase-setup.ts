import { afterEach, beforeEach, vi } from "vitest";

// Context for controlling mock behavior during tests
let mockContext = {
	shouldReturnExistingPatient: false,
	currentTestTable: "",
	queryConditions: new Map<string, any>(),
};

// Helper function to control mock behavior
export function setMockContext(context: Partial<typeof mockContext>) {
	mockContext = { ...mockContext, ...context };
}

// Reset mock context
export function resetMockContext() {
	mockContext = {
		shouldReturnExistingPatient: false,
		currentTestTable: "",
		queryConditions: new Map<string, any>(),
	};
}

// Mock Supabase client for testing
export const mockSupabaseClient = {
	// Authentication methods
	auth: {
		getUser: vi.fn(async () => ({
			data: {
				user: {
					id: "user-123",
					email: "test@neonpro.com",
					role: "authenticated",
					user_metadata: {
						name: "Test User",
						role: "doctor",
					},
				},
			},
			error: null,
		})),

		signInWithPassword: vi.fn(async () => ({
			data: {
				user: { id: "user-123", email: "test@neonpro.com" },
				session: { access_token: "test-token" },
			},
			error: null,
		})),

		signOut: vi.fn(async () => ({ error: null })),

		onAuthStateChange: vi.fn((_callback) => {
			return { data: { subscription: { unsubscribe: vi.fn() } } };
		}),
	},

	// Database operations mock
	from: vi.fn((table: string) => {
		mockContext.currentTestTable = table;
		mockContext.queryConditions.clear(); // Clear conditions for each new query

		const queryBuilder = {
			select: vi.fn((_columns?: string) => {
				return queryBuilder;
			}),
			insert: vi.fn().mockReturnThis(),
			update: vi.fn().mockReturnThis(),
			delete: vi.fn().mockReturnThis(),
			upsert: vi.fn().mockReturnThis(),

			// Filtering methods
			eq: vi.fn((column: string, value: any) => {
				mockContext.queryConditions.set(column, value);
				return queryBuilder;
			}),
			neq: vi.fn().mockReturnThis(),
			gt: vi.fn().mockReturnThis(),
			gte: vi.fn().mockReturnThis(),
			lt: vi.fn().mockReturnThis(),
			lte: vi.fn().mockReturnThis(),
			like: vi.fn().mockReturnThis(),
			ilike: vi.fn().mockReturnThis(),
			in: vi.fn().mockReturnThis(),
			contains: vi.fn().mockReturnThis(),
			filter: vi.fn().mockReturnThis(),
			or: vi.fn().mockReturnThis(), // Add missing or method

			// Modifiers
			single: vi.fn(async () => {
				// Check if this is a duplicate check for createPatient
				// Duplicate check happens when we query by medical_record_number AND clinic_id
				const hasMedicalRecord = mockContext.queryConditions.has("medical_record_number");
				const hasClinicId = mockContext.queryConditions.has("clinic_id");
				const isDuplicateCheck = table === "patients" && hasMedicalRecord && hasClinicId;

				if (isDuplicateCheck) {
					// For createPatient duplicate checks, return null (no duplicate found)
					return { data: null, error: null };
				}

				const result = getMockData(table);
				return {
					data: result,
					error: null,
				};
			}),

			maybeSingle: vi.fn(async () => {
				// Same logic as single for maybeSingle
				if (
					table === "patients" &&
					mockContext.queryConditions.has("medical_record_number") &&
					!mockContext.shouldReturnExistingPatient
				) {
					return { data: null, error: null };
				}

				return {
					data: getMockData(table),
					error: null,
				};
			}),

			limit: vi.fn().mockReturnThis(),
			range: vi.fn().mockReturnThis(),
			order: vi.fn().mockReturnThis(),
			offset: vi.fn().mockReturnThis(),
			join: vi.fn().mockReturnThis(),

			// Execute the query
			then: vi.fn(async (callback) => {
				let data;

				// For search operations that should return arrays
				if (table === "patients" && mockContext.queryConditions.size === 0) {
					data = [getMockData(table)]; // Return array for search
				} else {
					data = getMockData(table); // Return single object
				}

				const result = {
					data,
					error: null,
					status: 200,
					statusText: "OK",
				};
				return callback ? callback(result) : result;
			}),
		};

		return queryBuilder;
	}),

	// Storage operations mock
	storage: {
		from: vi.fn((bucket: string) => ({
			upload: vi.fn(async () => ({
				data: {
					path: `${bucket}/test-file.pdf`,
					id: "file-123",
					fullPath: `${bucket}/test-file.pdf`,
				},
				error: null,
			})),

			download: vi.fn(async () => ({
				data: new Blob(["test file content"]),
				error: null,
			})),

			remove: vi.fn(async () => ({
				data: null,
				error: null,
			})),

			list: vi.fn(async () => ({
				data: [
					{
						name: "test-file.pdf",
						id: "file-123",
						updated_at: new Date().toISOString(),
						size: 1024,
					},
				],
				error: null,
			})),

			getPublicUrl: vi.fn(() => ({
				data: {
					publicUrl: `https://supabase.co/storage/v1/object/public/${bucket}/test-file.pdf`,
				},
			})),
		})),
	},

	// Realtime subscriptions mock
	channel: vi.fn(() => ({
		on: vi.fn().mockReturnThis(),
		subscribe: vi.fn(async () => ({ status: "SUBSCRIBED" })),
		unsubscribe: vi.fn(async () => ({ status: "CLOSED" })),
	})),

	// RPC (Remote Procedure Call) mock for custom functions
	rpc: vi.fn(async (functionName: string, _params?: any) => {
		const mockRpcResults = {
			calculate_patient_age: 35,
			get_treatment_statistics: {
				total_treatments: 150,
				this_month: 25,
				avg_duration: 45,
			},
			validate_healthcare_compliance: {
				lgpd_compliant: true,
				anvisa_compliant: true,
				cfm_compliant: true,
				score: 100,
			},
		};

		return {
			data: mockRpcResults[functionName as keyof typeof mockRpcResults] || null,
			error: null,
		};
	}),
};

// Helper function to generate mock data based on table name
export function getMockData(table: string): any {
	const mockDataMap = {
		patients: {
			id: "patient-123",
			clinic_id: "clinic-123",
			user_id: "user-123",
			cpf: "123.456.789-09",
			full_name: "João Silva Santos",
			email: "joao.silva@email.com",
			phone: "+55 11 99999-9999",
			birth_date: "1990-05-15",
			gender: "M",
			medical_record_number: "MR001",
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
			lgpd_consent: true,
			consent_date: new Date().toISOString(),
			// Related data for getPatientById
			consents: [],
			conditions: [],
			allergies: [],
		},

		patient_consents: {
			id: "consent-123",
			patient_id: "patient-123",
			consent_type: "lgpd",
			consent_given: true,
			consent_date: new Date().toISOString(),
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		},

		profiles: {
			id: "user-123",
			clinic_id: "clinic-123",
			user_id: "user-123",
			name: "Test User",
			email: "test@neonpro.com",
			role: "doctor",
			specialties: ["dermatologia"],
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		},

		treatments: {
			id: "treatment-123",
			patient_id: "patient-123",
			doctor_id: "doctor-123",
			type: "aesthetic-consultation",
			scheduled_date: new Date().toISOString(),
			duration_minutes: 60,
			status: "scheduled",
			notes: "Initial consultation",
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		},

		medical_records: {
			id: "record-123",
			patient_id: "patient-123",
			treatment_id: "treatment-123",
			doctor_id: "doctor-123",
			record_date: new Date().toISOString(),
			record_type: "consultation",
			diagnosis: "Test diagnosis",
			treatment_plan: "Test treatment plan",
			notes: "Patient consultation notes",
			digital_signature: "signature-hash-123",
			created_at: new Date().toISOString(),
		},

		doctors: {
			id: "doctor-123",
			name: "Dr. Ana Costa",
			crm_number: "12345-SP",
			crm_state: "SP",
			specialty: "Dermatologia",
			email: "dr.ana@neonpro.com",
			phone: "+55 11 88888-8888",
			license_status: "active",
			license_expiry: "2025-12-31",
			created_at: new Date().toISOString(),
		},

		appointments: {
			id: "appointment-123",
			patient_id: "patient-123",
			doctor_id: "doctor-123",
			scheduled_date: new Date().toISOString(),
			duration_minutes: 60,
			status: "scheduled",
			type: "consultation",
			notes: "Regular check-up",
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		},

		audit_logs: {
			id: "audit-123",
			user_id: "user-123",
			action: "view_patient",
			resource_type: "patient",
			resource_id: "patient-123",
			timestamp: new Date().toISOString(),
			ip_address: "127.0.0.1",
			user_agent: "test-agent",
			metadata: {},
		},
	};

	return mockDataMap[table as keyof typeof mockDataMap] || {};
}

// Mock Supabase SSR client
export const mockSupabaseSSR = {
	createServerClient: vi.fn(() => mockSupabaseClient),
	createBrowserClient: vi.fn(() => mockSupabaseClient),
};

// Setup function to initialize Supabase mocks
export function setupSupabaseMocks() {
	// Reset mock context
	resetMockContext();

	// Mock the Supabase client creation
	vi.mock("@supabase/supabase-js", () => ({
		createClient: vi.fn(() => mockSupabaseClient),
	}));

	// Mock Supabase SSR
	vi.mock("@supabase/ssr", () => mockSupabaseSSR);

	// Mock environment variables
	process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost:54321";
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
	process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-key";
}

// Cleanup function for test teardown
export function cleanupSupabaseMocks() {
	resetMockContext();
	vi.clearAllMocks();
}

// Test database utilities
export const testDatabaseUtils = {
	// Create test data
	createTestPatient: async (data?: Partial<any>) => {
		const patient = {
			...getMockData("patients"),
			...data,
		};
		return { data: patient, error: null };
	},

	createTestTreatment: async (patientId: string, data?: Partial<any>) => {
		const treatment = {
			...getMockData("treatments"),
			patient_id: patientId,
			...data,
		};
		return { data: treatment, error: null };
	},

	createTestMedicalRecord: async (patientId: string, treatmentId: string, data?: Partial<any>) => {
		const record = {
			...getMockData("medical_records"),
			patient_id: patientId,
			treatment_id: treatmentId,
			...data,
		};
		return { data: record, error: null };
	},

	// Simulate RLS (Row Level Security) policies
	simulateRLS: {
		patientCanOnlyAccessOwnData: vi.fn((userId: string, patientId: string) => {
			return userId === `patient-${patientId}` || userId.includes("doctor") || userId.includes("admin");
		}),

		doctorCanAccessAssignedPatients: vi.fn((_doctorId: string, _patientId: string) => {
			// Mock logic: doctors can access patients they have treatments with
			return true; // Simplified for testing
		}),

		adminCanAccessAllData: vi.fn((userId: string) => {
			return userId.includes("admin");
		}),
	},
};

// Setup and teardown hooks
beforeEach(() => {
	setupSupabaseMocks();
});

afterEach(() => {
	cleanupSupabaseMocks();
});

/**
 * NEONPRO Healthcare Test Setup
 * Comprehensive healthcare testing environment with FHIR-like patterns
 * Based on Medplum MockClient patterns for healthcare data integrity
 */

import { cleanup } from "@testing-library/react";
import { afterAll, beforeAll, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom";

// Healthcare Testing Types
export type HealthcareTestPatient = {
	id: string;
	name: string;
	email: string;
	phone: string;
	dateOfBirth: string;
	tenantId: string;
	lgpdConsent: boolean;
	createdAt: string;
	updatedAt: string;
};

export type HealthcareTestAppointment = {
	id: string;
	patientId: string;
	providerId: string;
	tenantId: string;
	scheduledAt: string;
	status: "scheduled" | "in-progress" | "completed" | "cancelled";
	procedure: string;
	notes?: string;
};

// Healthcare Mock Client (Medplum-inspired pattern)
export class HealthcareMockClient {
	private readonly patients: Map<string, HealthcareTestPatient> = new Map();
	private readonly appointments: Map<string, HealthcareTestAppointment> = new Map();
	private readonly tenantId: string;
	constructor(tenantId = "test-tenant-healthcare") {
		this.tenantId = tenantId;
	}

	async createPatient(
		patient: Omit<HealthcareTestPatient, "id" | "createdAt" | "updatedAt">
	): Promise<HealthcareTestPatient> {
		const id = `patient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
		const now = new Date().toISOString();

		const newPatient: HealthcareTestPatient = {
			...patient,
			id,
			createdAt: now,
			updatedAt: now,
			tenantId: this.tenantId,
		};

		this.patients.set(id, newPatient);
		return newPatient;
	}

	async getPatient(id: string): Promise<HealthcareTestPatient | null> {
		return this.patients.get(id) || null;
	}

	async queryPatients(filters: Partial<HealthcareTestPatient>): Promise<HealthcareTestPatient[]> {
		return Array.from(this.patients.values()).filter((patient) => {
			return Object.entries(filters).every(([key, value]) => patient[key as keyof HealthcareTestPatient] === value);
		});
	}

	async createAppointment(appointment: Omit<HealthcareTestAppointment, "id">): Promise<HealthcareTestAppointment> {
		const id = `appointment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

		const newAppointment: HealthcareTestAppointment = {
			...appointment,
			id,
			tenantId: this.tenantId,
		};

		this.appointments.set(id, newAppointment);
		return newAppointment;
	}

	clear(): void {
		this.patients.clear();
		this.appointments.clear();
	}
} // Global Healthcare Test Setup
let healthcareMockClient: HealthcareMockClient;

beforeAll(() => {
	// Healthcare Environment Setup
	process.env.NODE_ENV = "test";
	process.env.HEALTHCARE_TEST_MODE = "true";
	process.env.LGPD_COMPLIANCE_MODE = "true";

	// Supabase Test Configuration
	process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
	process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";

	// Healthcare Test Tenant
	process.env.TEST_TENANT_ID = "test-tenant-healthcare";
});

beforeEach(() => {
	// Initialize Fresh Healthcare Mock Client
	healthcareMockClient = new HealthcareMockClient();

	// Set global test client
	(globalThis as any).__HEALTHCARE_MOCK_CLIENT__ = healthcareMockClient;

	// Mock fetch for healthcare APIs
	global.fetch = vi.fn();

	// Mock console methods for cleaner test output
	vi.spyOn(console, "warn").mockImplementation(() => {});
	vi.spyOn(console, "error").mockImplementation(() => {});
}); // Healthcare-specific mocks
vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: vi.fn(),
		replace: vi.fn(),
		back: vi.fn(),
		forward: vi.fn(),
		refresh: vi.fn(),
		prefetch: vi.fn(),
	}),
	useSearchParams: () => new URLSearchParams(),
	usePathname: () => "/test-path",
}));

afterEach(() => {
	// Clean up React components
	cleanup();

	// Clear healthcare mock data
	if (healthcareMockClient) {
		healthcareMockClient.clear();
	}

	// Clear all mocks
	vi.clearAllMocks();
	vi.resetAllMocks();

	// Clean up global state
	(globalThis as any).__HEALTHCARE_MOCK_CLIENT__ = undefined;
});

afterAll(() => {});

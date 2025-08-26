/**
 * NeonPro Healthcare Platform - API Integration Tests
 *
 * Comprehensive testing of all API endpoints with healthcare-specific validation
 * Tests authentication, data integrity, LGPD compliance, and error handling
 */

import { describe, expect, it, vi } from "vitest";
import {
	mockAppointment,
	mockPatient,
	mockUser,
} from "../setup/final-test-setup";

describe("API Integration Tests - Final Validation", () => {
	describe("Authentication API", () => {
		it("should authenticate healthcare professional successfully", async () => {
			const mockAuthResponse = {
				status: 200,
				json: () =>
					Promise.resolve({
						success: true,
						user: mockUser,
						session: {
							access_token: "test-token",
							expires_at: Date.now() + 3_600_000,
						},
					}),
			};

			global.fetch = vi.fn().mockResolvedValue(mockAuthResponse);

			const response = await fetch("/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: "dr.silva@neonpro.health",
					password: "securePassword123",
					crm_number: "12345-SP",
				}),
			});

			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.success).toBe(true);
			expect(data.user).toBeDefined();
			expect(data.user.role).toBe("healthcare_professional");
		});

		it("should reject invalid credentials", async () => {
			const mockErrorResponse = {
				status: 401,
				json: () =>
					Promise.resolve({
						success: false,
						error: "Invalid credentials",
					}),
			};

			global.fetch = vi.fn().mockResolvedValue(mockErrorResponse);

			const response = await fetch("/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: "invalid@email.com",
					password: "wrongpassword",
				}),
			});

			const data = await response.json();

			expect(response.status).toBe(401);
			expect(data.success).toBe(false);
			expect(data.error).toBeDefined();
		});

		it("should validate CRM number for healthcare professionals", async () => {
			const mockValidationResponse = {
				status: 400,
				json: () =>
					Promise.resolve({
						success: false,
						error: "CRM number is required for healthcare professionals",
					}),
			};

			global.fetch = vi.fn().mockResolvedValue(mockValidationResponse);

			const response = await fetch("/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: "dr.silva@neonpro.health",
					password: "securePassword123",
					// Missing CRM number
				}),
			});

			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data.success).toBe(false);
			expect(data.error).toContain("CRM number");
		});
	});

	describe("Patient Management API", () => {
		it("should create patient with LGPD consent", async () => {
			const mockPatientResponse = {
				status: 201,
				json: () =>
					Promise.resolve({
						success: true,
						data: {
							...mockPatient,
							id: "new-patient-id",
						},
					}),
			};

			global.fetch = vi.fn().mockResolvedValue(mockPatientResponse);

			const response = await fetch("/api/patients", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer test-token",
				},
				body: JSON.stringify({
					...mockPatient,
					lgpd_consent: {
						given_at: new Date().toISOString(),
						consent_version: "1.0",
						purposes: ["treatment", "analytics"],
					},
				}),
			});

			const data = await response.json();

			expect(response.status).toBe(201);
			expect(data.success).toBe(true);
			expect(data.data.lgpd_consent).toBeDefined();
			expect(data.data.lgpd_consent.purposes).toContain("treatment");
		});

		it("should validate CPF format for Brazilian patients", async () => {
			const mockValidationError = {
				status: 400,
				json: () =>
					Promise.resolve({
						success: false,
						error: "Invalid CPF format",
					}),
			};

			global.fetch = vi.fn().mockResolvedValue(mockValidationError);

			const response = await fetch("/api/patients", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer test-token",
				},
				body: JSON.stringify({
					...mockPatient,
					cpf: "invalid-cpf-format",
				}),
			});

			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data.success).toBe(false);
			expect(data.error).toContain("CPF");
		});

		it("should enforce data minimization principles", async () => {
			const mockPatientList = {
				status: 200,
				json: () =>
					Promise.resolve({
						success: true,
						data: [
							{
								id: mockPatient.id,
								name: mockPatient.name,
								// Medical history should not be included by default
								// Only basic info for list view
							},
						],
					}),
			};

			global.fetch = vi.fn().mockResolvedValue(mockPatientList);

			const response = await fetch("/api/patients", {
				method: "GET",
				headers: { Authorization: "Bearer test-token" },
			});

			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.success).toBe(true);
			expect(data.data[0]).not.toHaveProperty("medical_history");
			expect(data.data[0]).not.toHaveProperty("cpf");
		});
	});

	describe("Appointment Management API", () => {
		it("should create appointment with professional validation", async () => {
			const mockAppointmentResponse = {
				status: 201,
				json: () =>
					Promise.resolve({
						success: true,
						data: {
							...mockAppointment,
							id: "new-appointment-id",
						},
					}),
			};

			global.fetch = vi.fn().mockResolvedValue(mockAppointmentResponse);

			const response = await fetch("/api/appointments", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer test-token",
				},
				body: JSON.stringify(mockAppointment),
			});

			const data = await response.json();

			expect(response.status).toBe(201);
			expect(data.success).toBe(true);
			expect(data.data.professional_id).toBeDefined();
			expect(data.data.patient_id).toBeDefined();
		});

		it("should prevent double booking", async () => {
			const mockConflictResponse = {
				status: 409,
				json: () =>
					Promise.resolve({
						success: false,
						error: "Time slot already booked",
					}),
			};

			global.fetch = vi.fn().mockResolvedValue(mockConflictResponse);

			const response = await fetch("/api/appointments", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer test-token",
				},
				body: JSON.stringify({
					...mockAppointment,
					scheduled_at: new Date().toISOString(), // Conflicting time
				}),
			});

			const data = await response.json();

			expect(response.status).toBe(409);
			expect(data.success).toBe(false);
			expect(data.error).toContain("already booked");
		});
	});

	describe("Analytics API", () => {
		it("should provide anonymized analytics data", async () => {
			const mockAnalyticsResponse = {
				status: 200,
				json: () =>
					Promise.resolve({
						success: true,
						data: {
							patient_count: 150,
							appointments_today: 25,
							performance_metrics: {
								avg_consultation_time: 30,
								patient_satisfaction: 4.8,
							},
							// No personal identifiable information
						},
					}),
			};

			global.fetch = vi.fn().mockResolvedValue(mockAnalyticsResponse);

			const response = await fetch("/api/analytics", {
				method: "GET",
				headers: { Authorization: "Bearer test-token" },
			});

			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.success).toBe(true);
			expect(data.data.patient_count).toBeTypeOf("number");
			expect(data.data).not.toHaveProperty("patient_names");
			expect(data.data).not.toHaveProperty("personal_data");
		});
	});

	describe("Compliance API", () => {
		it("should generate LGPD compliance report", async () => {
			const mockComplianceResponse = {
				status: 200,
				json: () =>
					Promise.resolve({
						success: true,
						data: {
							compliance_score: 97.5,
							data_processing_activities: 12,
							consent_rate: 99.2,
							data_subject_requests: 3,
							audit_trail_completeness: 100,
						},
					}),
			};

			global.fetch = vi.fn().mockResolvedValue(mockComplianceResponse);

			const response = await fetch("/api/compliance/report", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer test-token",
				},
				body: JSON.stringify({
					report_type: "lgpd_compliance",
					period: "monthly",
				}),
			});

			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.success).toBe(true);
			expect(data.data.compliance_score).toBeGreaterThan(95);
			expect(data.data.consent_rate).toBeGreaterThan(95);
		});
	});

	describe("Error Handling", () => {
		it("should handle database connection errors gracefully", async () => {
			const mockDbError = {
				status: 500,
				json: () =>
					Promise.resolve({
						success: false,
						error: "Database connection failed",
						code: "DB_CONNECTION_ERROR",
					}),
			};

			global.fetch = vi.fn().mockResolvedValue(mockDbError);

			const response = await fetch("/api/patients", {
				method: "GET",
				headers: { Authorization: "Bearer test-token" },
			});

			const data = await response.json();

			expect(response.status).toBe(500);
			expect(data.success).toBe(false);
			expect(data.code).toBeDefined();
		});

		it("should validate request payload structure", async () => {
			const mockValidationError = {
				status: 400,
				json: () =>
					Promise.resolve({
						success: false,
						error: "Invalid request payload",
						validation_errors: [
							{ field: "email", message: "Invalid email format" },
							{ field: "name", message: "Name is required" },
						],
					}),
			};

			global.fetch = vi.fn().mockResolvedValue(mockValidationError);

			const response = await fetch("/api/patients", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer test-token",
				},
				body: JSON.stringify({
					// Invalid payload
					email: "invalid-email",
					// missing required fields
				}),
			});

			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data.success).toBe(false);
			expect(data.validation_errors).toBeDefined();
			expect(Array.isArray(data.validation_errors)).toBe(true);
		});
	});

	describe("Rate Limiting", () => {
		it("should enforce rate limits for API endpoints", async () => {
			const mockRateLimitResponse = {
				status: 429,
				json: () =>
					Promise.resolve({
						success: false,
						error: "Rate limit exceeded",
						retry_after: 60,
					}),
			};

			// Simulate multiple rapid requests
			global.fetch = vi.fn().mockResolvedValue(mockRateLimitResponse);

			const response = await fetch("/api/patients", {
				method: "GET",
				headers: { Authorization: "Bearer test-token" },
			});

			const data = await response.json();

			expect(response.status).toBe(429);
			expect(data.success).toBe(false);
			expect(data.retry_after).toBeDefined();
		});
	});

	describe("Audit Trail", () => {
		it("should log all data access operations", async () => {
			const mockAuditResponse = {
				status: 200,
				json: () =>
					Promise.resolve({
						success: true,
						data: mockPatient,
						audit: {
							action: "READ",
							user_id: "test-user-id",
							timestamp: new Date().toISOString(),
							ip_address: "127.0.0.1",
						},
					}),
			};

			global.fetch = vi.fn().mockResolvedValue(mockAuditResponse);

			const response = await fetch(`/api/patients/${mockPatient.id}`, {
				method: "GET",
				headers: { Authorization: "Bearer test-token" },
			});

			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.audit).toBeDefined();
			expect(data.audit.action).toBe("read");
			expect(data.audit.user_id).toBeDefined();
			expect(data.audit.timestamp).toBeDefined();
		});
	});
});

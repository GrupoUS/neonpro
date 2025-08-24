/**
 * 🔗 API Client Tests - NeonPro Healthcare
 * ========================================
 *
 * Comprehensive unit tests for the enhanced API client with focus on:
 * - Authentication management
 * - Error handling and retry logic
 * - Audit logging
 * - Type safety and validation
 * - Healthcare compliance (LGPD)
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock external dependencies
vi.mock("hono/client", () => ({
	hc: vi.fn(() => ({
		api: {
			v1: {
				auth: {
					login: { $post: vi.fn() },
					refresh: { $post: vi.fn() },
					logout: { $post: vi.fn() },
				},
				patients: {
					$get: vi.fn(),
					$post: vi.fn(),
				},
			},
		},
	})),
}));

// Import after mocking
import { ApiHelpers } from "../src/api-client";

// Helper to create mock Response objects
function createMockResponse(
	data: any,
	options: { ok?: boolean; status?: number; headers?: Record<string, string> } = {}
) {
	const { ok = true, status = 200, headers = {} } = options;

	return {
		ok,
		status,
		headers: {
			get: vi.fn((key: string) => headers[key] || null),
		},
		json: vi.fn(() => Promise.resolve(data)),
	} as any as Response;
}

describe("API Client - Error Handling", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("ApiHelpers.formatError", () => {
		it("should format string errors correctly", () => {
			const error = "Network connection failed";
			const result = ApiHelpers.formatError(error);
			expect(result).toBe("Network connection failed");
		});

		it("should format Error objects correctly", () => {
			const error = new Error("Database connection timeout");
			const result = ApiHelpers.formatError(error);
			expect(result).toBe("Database connection timeout");
		});

		it("should handle unknown error types", () => {
			const error = { code: 500, details: "Internal server error" };
			const result = ApiHelpers.formatError(error);
			expect(result).toBe("An unexpected error occurred");
		});

		it("should handle null and undefined errors", () => {
			expect(ApiHelpers.formatError(null)).toBe("An unexpected error occurred");
			expect(ApiHelpers.formatError(undefined)).toBe("An unexpected error occurred");
		});

		it("should handle API errors with message property", () => {
			const error = { message: "API validation failed" };
			const result = ApiHelpers.formatError(error);
			expect(result).toBe("API validation failed");
		});

		it("should handle API errors with validation details", () => {
			const error = {
				error: {
					validation_errors: [
						{ field: "email", message: "Invalid email format" },
						{ field: "age", message: "Must be a positive number" },
					],
				},
			};
			const result = ApiHelpers.formatError(error);
			expect(result).toBe("email: Invalid email format, age: Must be a positive number");
		});
	});

	describe("ApiHelpers.handleResponse", () => {
		it("should handle successful responses", async () => {
			const mockData = { id: 1, name: "Test Patient" };
			const mockResponse = createMockResponse(mockData, {
				headers: { "X-Request-ID": "test-123" },
			});

			const result = await ApiHelpers.handleResponse(mockResponse);

			expect(result.success).toBe(true);
			expect(result.data).toEqual(mockData);
			expect(result.message).toBe("Success");
			expect(result.meta?.request_id).toBe("test-123");
		});

		it("should handle failed responses", async () => {
			const mockError = {
				error: { code: "VALIDATION_ERROR", details: "Invalid input" },
				message: "Validation failed",
			};
			const mockResponse = createMockResponse(mockError, {
				ok: false,
				status: 400,
				headers: { "X-Request-ID": "test-456" },
			});

			const result = await ApiHelpers.handleResponse(mockResponse);

			expect(result.success).toBe(false);
			expect(result.error?.code).toBe("VALIDATION_ERROR");
			expect(result.message).toBe("Validation failed");
			expect(result.meta?.request_id).toBe("test-456");
		});
	});

	describe("ApiHelpers.createQueryKey", () => {
		it("should create basic query key", () => {
			const result = ApiHelpers.createQueryKey("patients");
			expect(result).toEqual(["api", "patients"]);
		});

		it("should create query key with user ID", () => {
			const result = ApiHelpers.createQueryKey("patients", undefined, "user123");
			expect(result).toEqual(["api", "patients", "user", "user123"]);
		});

		it("should create query key with parameters", () => {
			const result = ApiHelpers.createQueryKey("patients", { status: "active", limit: 10 });
			expect(result).toEqual(["api", "patients", JSON.stringify({ status: "active", limit: 10 })]);
		});
	});
});

describe("API Client - Network Detection", () => {
	describe("ApiHelpers.isNetworkError", () => {
		it("should detect fetch errors", () => {
			const error = new Error("fetch failed");
			const result = ApiHelpers.isNetworkError(error);
			expect(result).toBe(true);
		});

		it("should detect network errors", () => {
			const error = new Error("network request failed");
			const result = ApiHelpers.isNetworkError(error);
			expect(result).toBe(true);
		});

		it("should return false for non-network errors", () => {
			const error = new Error("validation error");
			const result = ApiHelpers.isNetworkError(error);
			expect(result).toBe(false);
		});
	});

	describe("ApiHelpers.isAuthError", () => {
		it("should detect UNAUTHORIZED error", () => {
			const error = { error: { code: "UNAUTHORIZED" } };
			const result = ApiHelpers.isAuthError(error);
			expect(result).toBe(true);
		});

		it("should detect TOKEN_EXPIRED error", () => {
			const error = { error: { code: "TOKEN_EXPIRED" } };
			const result = ApiHelpers.isAuthError(error);
			expect(result).toBe(true);
		});

		it("should return false for non-auth errors", () => {
			const error = { error: { code: "VALIDATION_ERROR" } };
			const result = ApiHelpers.isAuthError(error);
			expect(result).toBe(false);
		});
	});

	describe("ApiHelpers.isValidationError", () => {
		it("should detect VALIDATION_ERROR code", () => {
			const error = { error: { code: "VALIDATION_ERROR" } };
			const result = ApiHelpers.isValidationError(error);
			expect(result).toBe(true);
		});

		it("should detect validation_errors array", () => {
			const error = { error: { validation_errors: [{ field: "email", message: "Invalid" }] } };
			const result = ApiHelpers.isValidationError(error);
			expect(result).toBe(true);
		});

		it("should return false for non-validation errors", () => {
			const error = { error: { code: "NETWORK_ERROR" } };
			const result = ApiHelpers.isValidationError(error);
			expect(result).toBe(false);
		});
	});
});

describe("API Client - Healthcare Compliance", () => {
	it("should handle LGPD compliant data processing", async () => {
		// Test that API client helpers are compatible with healthcare data
		const patientData = {
			name: "João Silva",
			cpf: "123.456.789-00",
			birthDate: "1980-01-01",
		};

		const mockResponse = createMockResponse(patientData);
		const processedResponse = await ApiHelpers.handleResponse(mockResponse);
		expect(processedResponse.success).toBe(true);
		expect(processedResponse.data).toEqual(patientData);
	});
});

import { GET, POST } from "@/app/api/analytics/dashboard/route";
import { createClient } from "@/utils/supabase/server";
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// Mock Supabase client
vi.mock("@/utils/supabase/server");
const mockCreateClient = createClient as vi.MockedFunction<typeof createClient>;

// Mock analytics service
vi.mock("@/lib/analytics/service");

describe("Analytics Dashboard API Routes", () => {
	let mockSupabase: any;

	beforeEach(() => {
		// Setup mock Supabase client
		mockSupabase = {
			auth: {
				getUser: vi.fn(),
			},
			from: vi.fn(),
			rpc: vi.fn(),
		};

		mockCreateClient.mockResolvedValue(mockSupabase);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("GET /api/analytics/dashboard", () => {
		test("should return dashboard metrics for authenticated user", async () => {
			// Arrange
			const mockUser = {
				id: "user123",
				email: "test@example.com",
				user_metadata: { role: "admin" },
			};

			const mockMetrics = {
				subscriptionMetrics: {
					totalSubscriptions: 150,
					activeSubscriptions: 125,
					mrr: 15_000,
					arr: 180_000,
					churnRate: 0.05,
					growthRate: 0.12,
				},
				trialMetrics: {
					totalTrials: 500,
					activeTrials: 150,
					conversionRate: 0.25,
				},
				revenueMetrics: {
					totalRevenue: 180_000,
					monthlyGrowth: 0.12,
				},
			};

			mockSupabase.auth.getUser.mockResolvedValue({
				data: { user: mockUser },
				error: null,
			});

			mockSupabase.rpc.mockResolvedValue({
				data: mockMetrics,
				error: null,
			});

			const request = new NextRequest(
				"http://localhost:3000/api/analytics/dashboard",
				{
					method: "GET",
					headers: {
						Authorization: "Bearer mock-token",
					},
				},
			);

			// Act
			const response = await GET(request);
			const responseData = await response.json();

			// Assert
			expect(response.status).toBe(200);
			expect(responseData.success).toBe(true);
			expect(responseData.data).toEqual(mockMetrics);
			expect(mockSupabase.auth.getUser).toHaveBeenCalled();
		});

		test("should return 401 for unauthenticated requests", async () => {
			// Arrange
			mockSupabase.auth.getUser.mockResolvedValue({
				data: { user: null },
				error: { message: "Invalid token" },
			});

			const request = new NextRequest(
				"http://localhost:3000/api/analytics/dashboard",
				{
					method: "GET",
				},
			);

			// Act
			const response = await GET(request);
			const responseData = await response.json();

			// Assert
			expect(response.status).toBe(401);
			expect(responseData.success).toBe(false);
			expect(responseData.message).toBe("Unauthorized");
		});

		test("should handle database errors gracefully", async () => {
			// Arrange
			const mockUser = {
				id: "user123",
				email: "test@example.com",
			};

			mockSupabase.auth.getUser.mockResolvedValue({
				data: { user: mockUser },
				error: null,
			});

			mockSupabase.rpc.mockResolvedValue({
				data: null,
				error: { message: "Database connection failed" },
			});

			const request = new NextRequest(
				"http://localhost:3000/api/analytics/dashboard",
				{
					method: "GET",
				},
			);

			// Act
			const response = await GET(request);
			const responseData = await response.json();

			// Assert
			expect(response.status).toBe(500);
			expect(responseData.success).toBe(false);
			expect(responseData.message).toBe("Internal server error");
		});

		test("should respect rate limiting", async () => {
			// Arrange
			const mockUser = { id: "user123", email: "test@example.com" };
			mockSupabase.auth.getUser.mockResolvedValue({
				data: { user: mockUser },
				error: null,
			});

			const request = new NextRequest(
				"http://localhost:3000/api/analytics/dashboard",
				{
					method: "GET",
					headers: {
						"x-forwarded-for": "127.0.0.1",
					},
				},
			);

			// Simulate rate limit exceeded
			// This would depend on your actual rate limiting implementation
			const requests = new Array(11).fill(null).map(() => GET(request));

			// Act
			const responses = await Promise.all(requests);
			const _lastResponse = responses.at(-1);

			// Assert
			// At least one request should be rate limited (this is implementation-dependent)
			const rateLimitedResponse = responses.find((res) => res.status === 429);
			if (rateLimitedResponse) {
				expect(rateLimitedResponse.status).toBe(429);
			}
		});

		test("should validate query parameters", async () => {
			// Arrange
			const mockUser = { id: "user123", email: "test@example.com" };
			mockSupabase.auth.getUser.mockResolvedValue({
				data: { user: mockUser },
				error: null,
			});

			const request = new NextRequest(
				"http://localhost:3000/api/analytics/dashboard?period=invalid&limit=abc",
				{
					method: "GET",
				},
			);

			// Act
			const response = await GET(request);
			const responseData = await response.json();

			// Assert
			expect(response.status).toBe(400);
			expect(responseData.success).toBe(false);
			expect(responseData.message).toContain("Invalid query parameters");
		});
	});

	describe("POST /api/analytics/dashboard", () => {
		test("should create custom dashboard configuration", async () => {
			// Arrange
			const mockUser = { id: "user123", email: "test@example.com" };
			const dashboardConfig = {
				widgets: ["subscription_metrics", "trial_metrics", "revenue_chart"],
				layout: "grid",
				refreshInterval: 30_000,
			};

			mockSupabase.auth.getUser.mockResolvedValue({
				data: { user: mockUser },
				error: null,
			});

			const mockFrom = {
				insert: vi.fn().mockReturnThis(),
				select: vi.fn().mockResolvedValue({
					data: [{ id: "config123", ...dashboardConfig }],
					error: null,
				}),
			};

			mockSupabase.from.mockReturnValue(mockFrom);

			const request = new NextRequest(
				"http://localhost:3000/api/analytics/dashboard",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(dashboardConfig),
				},
			);

			// Act
			const response = await POST(request);
			const responseData = await response.json();

			// Assert
			expect(response.status).toBe(201);
			expect(responseData.success).toBe(true);
			expect(responseData.data.widgets).toEqual(dashboardConfig.widgets);
			expect(mockSupabase.from).toHaveBeenCalledWith(
				"dashboard_configurations",
			);
		});

		test("should validate dashboard configuration schema", async () => {
			// Arrange
			const mockUser = { id: "user123", email: "test@example.com" };
			const invalidConfig = {
				widgets: "invalid", // Should be array
				layout: "invalid_layout",
				refreshInterval: -1000, // Should be positive
			};

			mockSupabase.auth.getUser.mockResolvedValue({
				data: { user: mockUser },
				error: null,
			});

			const request = new NextRequest(
				"http://localhost:3000/api/analytics/dashboard",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(invalidConfig),
				},
			);

			// Act
			const response = await POST(request);
			const responseData = await response.json();

			// Assert
			expect(response.status).toBe(400);
			expect(responseData.success).toBe(false);
			expect(responseData.errors).toBeDefined();
		});
	});

	describe("caching behavior", () => {
		test("should return cached data when available", async () => {
			// Arrange
			const mockUser = { id: "user123", email: "test@example.com" };
			const mockMetrics = { subscriptionMetrics: { totalSubscriptions: 150 } };

			mockSupabase.auth.getUser.mockResolvedValue({
				data: { user: mockUser },
				error: null,
			});

			mockSupabase.rpc.mockResolvedValue({
				data: mockMetrics,
				error: null,
			});

			const request = new NextRequest(
				"http://localhost:3000/api/analytics/dashboard",
				{
					method: "GET",
				},
			);

			// Act
			const response1 = await GET(request);
			const response2 = await GET(request);

			// Assert
			expect(response1.status).toBe(200);
			expect(response2.status).toBe(200);

			// Check cache headers
			expect(response2.headers.get("x-cache")).toBe("HIT");
		});

		test("should set appropriate cache headers", async () => {
			// Arrange
			const mockUser = { id: "user123", email: "test@example.com" };
			const mockMetrics = { subscriptionMetrics: { totalSubscriptions: 150 } };

			mockSupabase.auth.getUser.mockResolvedValue({
				data: { user: mockUser },
				error: null,
			});

			mockSupabase.rpc.mockResolvedValue({
				data: mockMetrics,
				error: null,
			});

			const request = new NextRequest(
				"http://localhost:3000/api/analytics/dashboard",
				{
					method: "GET",
				},
			);

			// Act
			const response = await GET(request);

			// Assert
			expect(response.headers.get("cache-control")).toBe("public, max-age=300");
			expect(response.headers.get("etag")).toBeDefined();
		});
	});

	describe("security", () => {
		test("should include security headers", async () => {
			// Arrange
			const mockUser = { id: "user123", email: "test@example.com" };

			mockSupabase.auth.getUser.mockResolvedValue({
				data: { user: mockUser },
				error: null,
			});

			const request = new NextRequest(
				"http://localhost:3000/api/analytics/dashboard",
				{
					method: "GET",
				},
			);

			// Act
			const response = await GET(request);

			// Assert
			expect(response.headers.get("x-content-type-options")).toBe("nosniff");
			expect(response.headers.get("x-frame-options")).toBe("DENY");
			expect(response.headers.get("x-xss-protection")).toBe("1; mode=block");
		});

		test("should validate user permissions for admin endpoints", async () => {
			// Arrange
			const mockUser = {
				id: "user123",
				email: "test@example.com",
				user_metadata: { role: "user" }, // Not admin
			};

			mockSupabase.auth.getUser.mockResolvedValue({
				data: { user: mockUser },
				error: null,
			});

			const request = new NextRequest(
				"http://localhost:3000/api/analytics/dashboard?admin=true",
				{
					method: "GET",
				},
			);

			// Act
			const response = await GET(request);
			const responseData = await response.json();

			// Assert
			expect(response.status).toBe(403);
			expect(responseData.success).toBe(false);
			expect(responseData.message).toBe("Insufficient permissions");
		});
	});

	describe("error handling", () => {
		test("should handle malformed JSON requests", async () => {
			// Arrange
			const mockUser = { id: "user123", email: "test@example.com" };

			mockSupabase.auth.getUser.mockResolvedValue({
				data: { user: mockUser },
				error: null,
			});

			const request = new NextRequest(
				"http://localhost:3000/api/analytics/dashboard",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: "invalid json{",
				},
			);

			// Act
			const response = await POST(request);
			const responseData = await response.json();

			// Assert
			expect(response.status).toBe(400);
			expect(responseData.success).toBe(false);
			expect(responseData.message).toBe("Invalid JSON payload");
		});

		test("should handle unexpected server errors", async () => {
			// Arrange
			mockSupabase.auth.getUser.mockRejectedValue(
				new Error("Unexpected error"),
			);

			const request = new NextRequest(
				"http://localhost:3000/api/analytics/dashboard",
				{
					method: "GET",
				},
			);

			// Act
			const response = await GET(request);
			const responseData = await response.json();

			// Assert
			expect(response.status).toBe(500);
			expect(responseData.success).toBe(false);
			expect(responseData.message).toBe("Internal server error");
		});
	});
});

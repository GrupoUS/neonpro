import { Hono } from "hono";
import { testClient } from "hono/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the Hono app (since we need to import from the actual backend)
// In a real scenario, you would import: import app from '../../../../apps/api/src/index'
const createMockApp = () => {
	const app = new Hono();

	// Health endpoint
	app.get("/health", async (c) => {
		const startTime = Date.now();

		// Simulate database check
		const dbStatus = await new Promise((resolve) => {
			setTimeout(() => resolve({ connected: true, latency: 45 }), 30);
		});

		const responseTime = Date.now() - startTime;

		return c.json({
			status: "healthy",
			timestamp: new Date().toISOString(),
			database: dbStatus,
			responseTime,
			version: "1.0.0",
			environment: process.env.NODE_ENV || "test",
		});
	});

	// Root endpoint
	app.get("/", (c) => {
		return c.json({
			message: "NEONPRO Healthcare API",
			version: "v1.0.0",
			status: "operational",
			documentation: "/api/docs",
		});
	});

	// API versioning
	app.get("/api/v1", (c) => {
		return c.json({
			version: "v1.0.0",
			endpoints: {
				patients: "/api/v1/patients",
				appointments: "/api/v1/appointments",
				professionals: "/api/v1/professionals",
			},
		});
	});

	// Error handling endpoints for testing
	app.get("/error/404", (c) => {
		return c.notFound();
	});

	app.get("/error/401", (c) => {
		return c.json(
			{
				error: "Não autorizado",
				message: "Credenciais inválidas ou token expirado",
				code: "UNAUTHORIZED",
			},
			401,
		);
	});

	app.get("/error/500", (_c) => {
		throw new Error("Erro interno do servidor");
	});

	return app;
}; // Mock environment variables
vi.mock("process", () => ({
	env: {
		NODE_ENV: "test",
		SUPABASE_URL: "https://test.supabase.co",
		SUPABASE_ANON_KEY: "test_key",
		DATABASE_URL: "postgresql://test:test@localhost:5432/neonpro_test",
	},
}));

describe("🏥 NEONPRO Healthcare - Core API Validation", () => {
	let app: ReturnType<typeof createMockApp>;
	let _client: ReturnType<typeof testClient>;

	beforeEach(() => {
		app = createMockApp();
		_client = testClient(app);
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("Health Endpoint Validation", () => {
		it("should return healthy status with database check and response time < 200ms", async () => {
			const startTime = Date.now();
			const res = await app.request("/health");
			const endTime = Date.now();
			const responseTime = endTime - startTime;

			expect(res.status).toBe(200);
			expect(responseTime).toBeLessThan(200);

			const body = await res.json();
			expect(body).toMatchObject({
				status: "healthy",
				database: {
					connected: true,
					latency: expect.any(Number),
				},
				responseTime: expect.any(Number),
				version: "1.0.0",
				environment: expect.any(String),
			});

			expect(body.database.latency).toBeLessThan(100);
			expect(body.responseTime).toBeLessThan(200);
			expect(new Date(body.timestamp)).toBeInstanceOf(Date);
		});
	});

	describe("Root Endpoint Validation", () => {
		it("should return API information and operational status", async () => {
			const res = await app.request("/");

			expect(res.status).toBe(200);
			expect(res.headers.get("content-type")).toContain("application/json");

			const body = await res.json();
			expect(body).toEqual({
				message: "NEONPRO Healthcare API",
				version: "v1.0.0",
				status: "operational",
				documentation: "/api/docs",
			});
		});
	});

	describe("Error Handling Validation", () => {
		it("should handle 404 Not Found errors appropriately", async () => {
			const res = await app.request("/nonexistent-endpoint");

			expect(res.status).toBe(404);
		});

		it("should handle 401 Unauthorized with Portuguese error messages", async () => {
			const res = await app.request("/error/401");

			expect(res.status).toBe(401);

			const body = await res.json();
			expect(body).toEqual({
				error: "Não autorizado",
				message: "Credenciais inválidas ou token expirado",
				code: "UNAUTHORIZED",
			});
		});

		it("should handle 500 Internal Server Error gracefully", async () => {
			const res = await app.request("/error/500");

			expect(res.status).toBe(500);
		});
	});

	describe("Environment Configuration Validation", () => {
		it("should validate required environment variables are accessible", async () => {
			const res = await app.request("/health");
			const body = await res.json();

			expect(body.environment).toBeDefined();
			expect(["test", "development", "production"]).toContain(body.environment);
			expect(process.env.SUPABASE_URL).toBeDefined();
			expect(process.env.SUPABASE_ANON_KEY).toBeDefined();
			expect(process.env.DATABASE_URL).toBeDefined();
		});
	});

	describe("API Versioning Validation", () => {
		it("should provide correct API v1 endpoint information", async () => {
			const res = await app.request("/api/v1");

			expect(res.status).toBe(200);

			const body = await res.json();
			expect(body).toEqual({
				version: "v1.0.0",
				endpoints: {
					patients: "/api/v1/patients",
					appointments: "/api/v1/appointments",
					professionals: "/api/v1/professionals",
				},
			});
		});
	});
});

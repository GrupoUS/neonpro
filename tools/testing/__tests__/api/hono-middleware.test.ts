import { Hono } from "hono";
import { cors } from "hono/cors";
import { testClient } from "hono/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { logger as neonLogger } from "../../../../apps/api/src/lib/logger.js";

// Mock audit log storage
const auditLogs: Array<{
	id: string;
	timestamp: string;
	userId?: string;
	action: string;
	resource: string;
	method: string;
	path: string;
	ip: string;
	userAgent?: string;
	requestId: string;
	status: number;
	responseTime: number;
}> = [];

// Mock rate limit storage
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Create middleware-enabled Hono app
const createMiddlewareApp = () => {
	const app = new Hono();

	// Request ID middleware
	app.use("*", async (c, next) => {
		const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
		c.set("requestId", requestId);
		c.header("X-Request-ID", requestId);
		await next();
	});

	// CORS middleware
	app.use(
		"*",
		cors({
			origin: ["https://app.neonpro.com", "https://admin.neonpro.com"],
			allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
			allowHeaders: [
				"Content-Type",
				"Authorization",
				"X-Request-ID",
				"Accept-Language",
			],
			exposeHeaders: ["X-Request-ID", "X-Total-Count"],
			credentials: true,
			maxAge: 86_400,
		}),
	);

	// Rate limiting middleware
	app.use("/api/*", async (c, next) => {
		const clientIP =
			c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
		const key = `rate_limit:${clientIP}`;
		const now = Date.now();
		const windowMs = 60_000; // 1 minute
		const maxRequests = 100;

		const current = rateLimitStore.get(key);

		if (!current || now > current.resetTime) {
			rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
		} else if (current.count >= maxRequests) {
			return c.json(
				{
					error: "Muitas tentativas",
					message:
						"Limite de requisições excedido. Tente novamente em 1 minuto.",
					retryAfter: Math.ceil((current.resetTime - now) / 1000),
				},
				429,
			);
		} else {
			current.count++;
		}

		await next();
	});

	// Auth middleware for protected routes
	app.use("/api/v1/*", async (c, next) => {
		const authHeader = c.req.header("Authorization");

		if (!authHeader?.startsWith("Bearer ")) {
			return c.json(
				{
					error: "Token de acesso obrigatório",
					message: "Forneça um token de autorização válido",
					code: "MISSING_AUTH_TOKEN",
				},
				401,
			);
		}

		const token = authHeader.substring(7);

		// Mock token validation
		if (token === "invalid_token") {
			return c.json(
				{
					error: "Token inválido",
					message: "O token fornecido é inválido ou expirou",
					code: "INVALID_TOKEN",
				},
				401,
			);
		}

		// Set user context
		c.set("user", {
			id: "user_123",
			email: "admin@neonpro.com",
			role: "admin",
		});

		await next();
	}); // LGPD Compliance middleware
	app.use("/api/v1/patients/*", async (c, next) => {
		const user = c.get("user");
		const method = c.req.method;

		// Log LGPD-sensitive data access
		if (method === "GET" || method === "PUT" || method === "DELETE") {
			neonLogger.info(
				`LGPD: Acesso a dados pessoais por usuário ${user?.id} - ${method} ${c.req.path}`,
				{
					userId: user?.id,
					method,
					endpoint: c.req.path,
					type: "lgpd_access",
				},
			);
		}

		// Add LGPD headers
		c.header("X-Data-Protection", "LGPD-Compliant");
		c.header("X-Privacy-Policy", "https://neonpro.com/privacy");

		await next();
	});

	// Audit logging middleware
	app.use("*", async (c, next) => {
		const startTime = Date.now();
		const requestId = c.get("requestId");
		const user = c.get("user");

		await next();

		const endTime = Date.now();
		const responseTime = endTime - startTime;

		// Create audit log entry
		const auditEntry = {
			id: `audit_${Date.now()}`,
			timestamp: new Date().toISOString(),
			userId: user?.id,
			action: c.req.method,
			resource: c.req.path,
			method: c.req.method,
			path: c.req.path,
			ip: c.req.header("x-forwarded-for") || "unknown",
			userAgent: c.req.header("user-agent"),
			requestId,
			status: c.res.status,
			responseTime,
		};

		auditLogs.push(auditEntry);
	});

	// Error handler middleware
	app.onError((err, c) => {
		const requestId = c.get("requestId");

		neonLogger.error(`[${requestId}] Error: ${err.message}`, err, {
			requestId,
			endpoint: c.req.path,
			method: c.req.method,
		});

		if (err.message === "Erro interno do servidor") {
			return c.json(
				{
					error: "Erro interno do servidor",
					message: "Ocorreu um erro inesperado. Nossa equipe foi notificada.",
					requestId,
					timestamp: new Date().toISOString(),
				},
				500,
			);
		}

		return c.json(
			{
				error: "Erro no servidor",
				message: err.message,
				requestId,
			},
			500,
		);
	});

	// Test routes
	app.get("/health", (c) => {
		return c.json({ status: "healthy", timestamp: new Date().toISOString() });
	});

	app.get("/api/v1/patients", (c) => {
		return c.json({ data: [], message: "Pacientes listados com sucesso" });
	});

	app.get("/error/500", () => {
		throw new Error("Erro interno do servidor");
	});

	return app;
};

describe("🛡️ NEONPRO Healthcare - Middleware Validation", () => {
	let app: ReturnType<typeof createMiddlewareApp>;
	let _client: ReturnType<typeof testClient>;

	beforeEach(() => {
		app = createMiddlewareApp();
		_client = testClient(app);
		auditLogs.length = 0; // Clear audit logs
		rateLimitStore.clear(); // Clear rate limit store
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("Auth Middleware Validation", () => {
		it("should require authorization token for protected routes", async () => {
			const res = await app.request("/api/v1/patients");

			expect(res.status).toBe(401);

			const body = await res.json();
			expect(body).toEqual({
				error: "Token de acesso obrigatório",
				message: "Forneça um token de autorização válido",
				code: "MISSING_AUTH_TOKEN",
			});
		});

		it("should validate token authenticity and reject invalid tokens", async () => {
			const res = await app.request("/api/v1/patients", {
				headers: {
					Authorization: "Bearer invalid_token",
				},
			});

			expect(res.status).toBe(401);

			const body = await res.json();
			expect(body).toEqual({
				error: "Token inválido",
				message: "O token fornecido é inválido ou expirou",
				code: "INVALID_TOKEN",
			});
		});

		it("should allow access with valid token", async () => {
			const res = await app.request("/api/v1/patients", {
				headers: {
					Authorization: "Bearer valid_token",
				},
			});

			expect(res.status).toBe(200);

			const body = await res.json();
			expect(body.message).toBe("Pacientes listados com sucesso");
		});
	});

	describe("CORS Configuration", () => {
		it("should set proper CORS headers for allowed origins", async () => {
			const res = await app.request("/health", {
				headers: {
					Origin: "https://app.neonpro.com",
				},
			});

			expect(res.status).toBe(200);
			expect(res.headers.get("Access-Control-Allow-Origin")).toBe(
				"https://app.neonpro.com",
			);
			expect(res.headers.get("Access-Control-Allow-Credentials")).toBe("true");
		});

		it("should handle preflight OPTIONS requests", async () => {
			const res = await app.request("/api/v1/patients", {
				method: "OPTIONS",
				headers: {
					Origin: "https://admin.neonpro.com",
					"Access-Control-Request-Method": "POST",
					"Access-Control-Request-Headers": "Content-Type,Authorization",
				},
			});

			expect(res.status).toBe(204);
			expect(res.headers.get("Access-Control-Allow-Methods")).toContain("POST");
			expect(res.headers.get("Access-Control-Allow-Headers")).toContain(
				"Content-Type",
			);
			expect(res.headers.get("Access-Control-Allow-Headers")).toContain(
				"Authorization",
			);
		});
	});

	describe("Rate Limiting (429 Responses)", () => {
		it("should allow requests within rate limit", async () => {
			const res = await app.request("/api/v1/patients", {
				headers: {
					Authorization: "Bearer valid_token",
					"X-Forwarded-For": "192.168.1.100",
				},
			});

			expect(res.status).toBe(200);
		});

		it("should return 429 when rate limit exceeded", async () => {
			const clientIP = "192.168.1.101";

			// Simulate exceeding rate limit
			rateLimitStore.set(`rate_limit:${clientIP}`, {
				count: 100,
				resetTime: Date.now() + 60_000,
			});

			const res = await app.request("/api/v1/patients", {
				headers: {
					Authorization: "Bearer valid_token",
					"X-Forwarded-For": clientIP,
				},
			});

			expect(res.status).toBe(429);

			const body = await res.json();
			expect(body).toMatchObject({
				error: "Muitas tentativas",
				message: "Limite de requisições excedido. Tente novamente em 1 minuto.",
				retryAfter: expect.any(Number),
			});
		});
	});

	describe("LGPD Compliance Middleware", () => {
		it("should add LGPD compliance headers for patient data access", async () => {
			const res = await app.request("/api/v1/patients", {
				headers: {
					Authorization: "Bearer valid_token",
				},
			});

			expect(res.status).toBe(200);
			expect(res.headers.get("X-Data-Protection")).toBe("LGPD-Compliant");
			expect(res.headers.get("X-Privacy-Policy")).toBe(
				"https://neonpro.com/privacy",
			);
		});
	});

	describe("Audit Logging Middleware", () => {
		it("should create audit log entries for all requests", async () => {
			const initialLogCount = auditLogs.length;

			await app.request("/health");

			expect(auditLogs).toHaveLength(initialLogCount + 1);

			const latestLog = auditLogs.at(-1);
			expect(latestLog).toMatchObject({
				id: expect.stringMatching(/^audit_\d+$/),
				timestamp: expect.any(String),
				action: "GET",
				resource: "/health",
				method: "GET",
				path: "/health",
				requestId: expect.stringMatching(/^req_\d+_[a-z0-9]+$/),
				status: 200,
				responseTime: expect.any(Number),
			});
		});

		it("should include user information in audit logs for authenticated requests", async () => {
			const initialLogCount = auditLogs.length;

			await app.request("/api/v1/patients", {
				headers: {
					Authorization: "Bearer valid_token",
				},
			});

			expect(auditLogs).toHaveLength(initialLogCount + 1);

			const latestLog = auditLogs.at(-1);
			expect(latestLog.userId).toBe("user_123");
		});
	});

	describe("Request ID Tracking", () => {
		it("should add unique request ID to all responses", async () => {
			const res = await app.request("/health");

			const requestId = res.headers.get("X-Request-ID");
			expect(requestId).toMatch(/^req_\d+_[a-z0-9]+$/);
		});

		it("should include request ID in audit logs", async () => {
			const res = await app.request("/health");
			const requestId = res.headers.get("X-Request-ID");

			const latestLog = auditLogs.at(-1);
			expect(latestLog.requestId).toBe(requestId);
		});
	});

	describe("Error Handler Middleware", () => {
		it("should handle server errors gracefully with Portuguese messages", async () => {
			const res = await app.request("/error/500");

			expect(res.status).toBe(500);

			const body = await res.json();
			expect(body).toMatchObject({
				error: "Erro interno do servidor",
				message: "Ocorreu um erro inesperado. Nossa equipe foi notificada.",
				requestId: expect.stringMatching(/^req_\d+_[a-z0-9]+$/),
				timestamp: expect.any(String),
			});
		});
	});
});

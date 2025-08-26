/**
 * NeonPro API - Hono.dev Backend
 * ===============================
 *
 * Sistema de gestão para clínicas de estética multiprofissionais brasileiras
 * Foco em gerenciamento de pacientes e inteligência financeira através de IA
 *
 * Características:
 * - Framework Hono.dev (ultrarrápido: 402,820 ops/sec)
 * - TypeScript first-class support
 * - Vercel Edge Functions deployment nativo
 * - Sistema não médico (sem CFM, telemedicina)
 * - Compliance: LGPD + ANVISA (produtos estéticos)
 * - Multi-profissional: Esteticistas, dermatologistas estéticos, terapeutas
 *
 * Tech Stack:
 * - Hono.dev (TypeScript/JavaScript runtime)
 * - Prisma ORM (PostgreSQL via Supabase)
 * - Supabase Database + Auth + Edge Functions
 * - IA para otimização de agendamento e analytics
 * - Zod para validação de schemas
 * - JOSE para JWT handling
 */

// Load environment variables
import "dotenv/config";

// Import Hono and middleware
import { Hono } from "hono";
import { compress } from "hono/compress";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { secureHeaders } from "hono/secure-headers";
import { timing } from "hono/timing";

// Import middleware
import { auditMiddleware } from "@/middleware/audit";
import { errorHandler } from "@/middleware/error-handler";
import { lgpdMiddleware } from "@/middleware/lgpd";
import { rateLimitMiddleware } from "@/middleware/rate-limit";

// Import routes
import { aiRoutes } from "@/routes/ai";
import { analyticsRoutes } from "@/routes/analytics";
import { appointmentRoutes } from "@/routes/appointments";
import { authRoutes } from "@/routes/auth";
import { clinicRoutes } from "@/routes/clinics";
import { complianceRoutes } from "@/routes/compliance";
import complianceAutomationRoutes from "@/routes/compliance-automation";
import { patientRoutes } from "@/routes/patients";
import { professionalsRoutes } from "@/routes/professionals";
import { servicesRoutes } from "@/routes/services";

// Import utilities
import type { AppEnv } from "@/types/env";
import { HTTP_STATUS, RESPONSE_MESSAGES } from "./lib/constants";

// Environment configuration
const ENVIRONMENT = process.env.NODE_ENV || "development";
const IS_PRODUCTION = ENVIRONMENT === "production";

// Create Hono app with environment bindings
const app = new Hono<AppEnv>();

// Global middleware stack
app.use("*", timing());
app.use("*", logger());

// Security middleware
app.use(
	"*",
	secureHeaders({
		contentSecurityPolicy: IS_PRODUCTION
			? {
					defaultSrc: ["'self'"],
					styleSrc: ["'self'", "'unsafe-inline'"],
					scriptSrc: ["'self'"],
					imgSrc: ["'self'", "data:", "https:"],
					connectSrc: ["'self'", "https://*.supabase.co"],
				}
			: false,
		crossOriginEmbedderPolicy: false, // Required for Vercel Edge Functions
	}),
);

// CORS configuration - Simple configuration for development
app.use("*", cors());

// Compression for better performance
app.use("*", compress());

// Pretty JSON in development
if (!IS_PRODUCTION) {
	app.use("*", prettyJSON());
}

// Custom middleware
app.use("*", auditMiddleware());
app.use("*", lgpdMiddleware());
app.use("*", rateLimitMiddleware());

// Database middleware
app.use("*", async (c, next) => {
	try {
		// Make database available in context
		c.set("dbClient", "supabase");
		await next();
	} catch (_error) {
		return c.json(
			{ error: RESPONSE_MESSAGES.DATABASE_ERROR },
			HTTP_STATUS.INTERNAL_SERVER_ERROR,
		);
	}
});

// Root endpoint
app.get("/", (c) => {
	return c.json({
		name: "NeonPro API",
		version: "1.0.0",
		description:
			"Sistema de gestão para clínicas de estética multiprofissionais brasileiras",
		status: "healthy",
		environment: ENVIRONMENT,
		framework: "Hono.dev",
		runtime: "TypeScript",
		features: [
			"Gerenciamento de pacientes",
			"Inteligência financeira",
			"IA para otimização",
			"ML Pipeline Management",
			"A/B Testing e Drift Detection",
			"Compliance LGPD + ANVISA",
			"Multi-profissional",
		],
		performance: {
			framework: "Hono.dev",
			benchmark: "402,820 req/sec",
			bundle_size: "14KB",
			deployment: "Vercel Edge Functions",
		},
		docs: IS_PRODUCTION ? null : "/docs",
		timestamp: new Date().toISOString(),
	});
});

// Health check endpoint
app.get("/health", async (c) => {
	try {
		// Import database service for health check
		const { db } = await import("@/lib/database");

		// Perform database health check
		const dbHealth = await db.healthCheck();

		const healthStatus = {
			status: dbHealth.connected ? "healthy" : "degraded",
			timestamp: new Date().toISOString(),
			version: "1.0.0",
			environment: ENVIRONMENT,
			services: {
				database: dbHealth.connected,
				supabase: !!process.env.SUPABASE_URL,
				auth: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
			},
			database: dbHealth,
			uptime: process.uptime(),
			memory: process.memoryUsage(),
		};

		const isHealthy =
			healthStatus.services.database && healthStatus.services.supabase;

		return c.json(
			healthStatus,
			isHealthy ? HTTP_STATUS.OK : HTTP_STATUS.SERVICE_UNAVAILABLE,
		);
	} catch (error) {
		return c.json(
			{
				status: "unhealthy",
				error: RESPONSE_MESSAGES.HEALTH_CHECK_FAILED,
				details: error.message,
				timestamp: new Date().toISOString(),
			},
			HTTP_STATUS.SERVICE_UNAVAILABLE,
		);
	}
});

// API routes - Structured for optimal Hono RPC inference
const apiV1 = new Hono<AppEnv>()
	.route("/auth", authRoutes)
	.route("/clinics", clinicRoutes)
	.route("/patients", patientRoutes)
	.route("/appointments", appointmentRoutes)
	.route("/professionals", professionalsRoutes)
	.route("/services", servicesRoutes)
	.route("/analytics", analyticsRoutes)
	.route("/compliance", complianceRoutes)
	.route("/compliance-automation", complianceAutomationRoutes)
	.route("/ai", aiRoutes);

// Mount API v1
app.route("/api/v1", apiV1);

// Constants
const HTTP_STATUS_NOT_FOUND = 404;

// 404 handler
app.notFound((c) => {
	return c.json(
		{
			error: "Not Found",
			message: "The requested endpoint does not exist",
			path: c.req.path,
			method: c.req.method,
			timestamp: new Date().toISOString(),
		},
		HTTP_STATUS_NOT_FOUND,
	);
});

// Global error handler
app.onError(errorHandler);

// Export the app type for RPC client - Optimized for Hono RPC
export type AppType = typeof app;

// Export the API v1 type specifically for better type inference
export type ApiV1Type = typeof apiV1;

// Export default app
export default app;

// Development server
if (ENVIRONMENT === "development") {
	const { serve } = await import("@hono/node-server");

	const port = Number.parseInt(process.env.PORT || "8000", 10);

	serve({
		fetch: app.fetch,
		port,
	});
}

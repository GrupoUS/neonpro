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

// Import application modules (sorted alphabetically)
import { auditMiddleware } from "@/middleware/audit";
import { errorHandler } from "@/middleware/error-handler";
import { lgpdMiddleware } from "@/middleware/lgpd";
import { rateLimitMiddleware } from "@/middleware/rate-limit";
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
import type { AppEnv } from "@/types/env";
import { HTTP_STATUS, RESPONSE_MESSAGES } from "./lib/constants";

// Environment configuration
const ENVIRONMENT = process.env.NODE_ENV || "development";
const IS_PRODUCTION = ENVIRONMENT === "production";

// HTTP Status Constants
const HTTP_STATUS_NOT_FOUND = 404;

// Create Hono app with environment bindings
const app = new Hono<AppEnv>();

// Global middleware stack
app.use("*", timing());
app.use("*", logger());

// Security middleware
let contentSecurityPolicyConfig: false | Record<string, string[]> = false;
if (IS_PRODUCTION) {
  contentSecurityPolicyConfig = {
    connectSrc: ["'self'", "https://*.supabase.co"],
    defaultSrc: ["'self'"],
    imgSrc: ["'self'", "data:", "https:"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
  };
} else {
  contentSecurityPolicyConfig = false;
}

app.use(
  "*",
  secureHeaders({
    contentSecurityPolicy: contentSecurityPolicyConfig,
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
app.use("*", async (context, next) => {
  try {
    // Make database available in context
    context.set("dbClient", "supabase");
    await next();
  } catch {
    return context.json(
      { error: RESPONSE_MESSAGES.DATABASE_ERROR },
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
});

// Root endpoint configuration
const getDocsUrl = (): string => "/docs";

// Root endpoint
app.get("/", (context) => {
  const docsUrl = getDocsUrl();
  return context.json({
    description: "Sistema de gestão para clínicas de estética multiprofissionais brasileiras",
    docs: docsUrl,
    environment: ENVIRONMENT,
    features: [
      "Gerenciamento de pacientes",
      "Inteligência financeira",
      "IA para otimização",
      "ML Pipeline Management",
      "A/B Testing e Drift Detection",
      "Compliance LGPD + ANVISA",
      "Multi-profissional",
    ],
    framework: "Hono.dev",
    name: "NeonPro API",
    performance: {
      benchmark: "402,820 req/sec",
      bundle_size: "14KB",
      deployment: "Vercel Edge Functions",
      framework: "Hono.dev",
    },
    runtime: "TypeScript",
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// Health check helpers
interface DatabaseHealth {
  connected: boolean;
}

const checkHealthStatus = (dbHealth: DatabaseHealth) => {
  if (dbHealth.connected) {
    return "healthy";
  }
  return "degraded";
};

const getResponseStatus = (isHealthy: boolean) => {
  if (isHealthy) {
    return HTTP_STATUS.OK;
  }
  return HTTP_STATUS.SERVICE_UNAVAILABLE;
};

// Health check endpoint
app.get("/health", async (context) => {
  try {
    // Import database service for health check
    const { db } = await import("@/lib/database");

    // Perform database health check
    const dbHealth = await db.healthCheck();
    const healthStatus = checkHealthStatus(dbHealth);

    const healthData = {
      database: dbHealth,
      environment: ENVIRONMENT,
      memory: process.memoryUsage(),
      services: {
        auth: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        database: dbHealth.connected,
        supabase: !!process.env.SUPABASE_URL,
      },
      status: healthStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: "1.0.0",
    };

    const isHealthy = healthData.services.database && healthData.services.supabase;
    const responseStatus = getResponseStatus(isHealthy);

    return context.json(healthData, responseStatus);
  } catch (error) {
    return context.json(
      {
        details: error.message,
        error: RESPONSE_MESSAGES.HEALTH_CHECK_FAILED,
        status: "unhealthy",
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

// 404 handler
app.notFound((context) =>
  context.json(
    {
      error: "Not Found",
      message: "The requested endpoint does not exist",
      method: context.req.method,
      path: context.req.path,
      timestamp: new Date().toISOString(),
    },
    HTTP_STATUS_NOT_FOUND,
  )
);

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

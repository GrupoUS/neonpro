import "dotenv/config";
import cookiePlugin from "@fastify/cookie";
// Import plugins
import corsPlugin from "@fastify/cors";
import helmetPlugin from "@fastify/helmet";
import jwtPlugin from "@fastify/jwt";
import rateLimitPlugin from "@fastify/rate-limit";
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { fastify } from "fastify";
import auditPlugin from "./plugins/audit";
import authPlugin from "./plugins/auth";
import monitoringPlugin from "./plugins/monitoring";
import rateLimitingPlugin from "./plugins/rate-limiting";
// Import custom plugins
import supabasePlugin from "./plugins/supabase";
import appointmentsRoutes from "./routes/appointments";
import billingRoutes from "./routes/billing";
// Import routes
import healthRoutes from "./routes/health";
import patientsRoutes from "./routes/patients";

// Create Fastify instance with healthcare-optimized configuration
export const createHealthcareService = () => {
  const server = fastify({
    logger: {
      level: process.env.LOG_LEVEL || "info",
      redact: [
        "req.headers.authorization",
        "req.body.ssn",
        "req.body.medicalId",
        "req.body.dateOfBirth",
      ],
      serializers: {
        req: (req) => ({
          method: req.method,
          url: req.url,
          headers: {
            "user-agent": req.headers["user-agent"],
            "x-tenant-id": req.headers["x-tenant-id"],
          },
        }),
      },
    },
    requestIdLogLabel: "auditId",
    disableRequestLogging: false,
    trustProxy: true,
    keepAliveTimeout: 61000,
    maxParamLength: 500,
    bodyLimit: 10485760, // 10MB for medical documents
  }).withTypeProvider<TypeBoxTypeProvider>();

  return server;
};

async function start() {
  const server = createHealthcareService();

  try {
    // Register security plugins
    await server.register(helmetPlugin, {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
        },
      },
    });

    await server.register(corsPlugin, {
      origin: (origin, callback) => {
        const hostname = new URL(origin || "").hostname;
        if (
          hostname === "localhost" ||
          hostname === process.env.FRONTEND_URL ||
          process.env.NODE_ENV === "development"
        ) {
          callback(null, true);
          return;
        }
        callback(new Error("Not allowed by CORS"), false);
      },
      credentials: true,
    });

    // Register rate limiting with tenant-aware configuration
    await server.register(rateLimitPlugin, {
      max: 100,
      timeWindow: "1 minute",
      keyGenerator: (request) => {
        return `${request.ip}-${request.headers["x-tenant-id"] || "anonymous"}`;
      },
    });

    await server.register(cookiePlugin);

    // Register JWT plugin
    await server.register(jwtPlugin, {
      secret: process.env.JWT_SECRET || "your-secret-key",
    });

    // Validate required environment variables
    const requiredEnvVars = {
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
    };

    for (const [key, value] of Object.entries(requiredEnvVars)) {
      if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
      }
    }

    // Register custom plugins
    await server.register(supabasePlugin, {
      url: requiredEnvVars.SUPABASE_URL!,
      anonKey: requiredEnvVars.SUPABASE_ANON_KEY!,
      serviceKey: requiredEnvVars.SUPABASE_SERVICE_KEY!,
    });

    await server.register(authPlugin);
    await server.register(auditPlugin);
    await server.register(rateLimitingPlugin);
    await server.register(monitoringPlugin);

    // Register routes
    await server.register(healthRoutes, { prefix: "/health" });
    await server.register(patientsRoutes, { prefix: "/api/patients" });
    await server.register(appointmentsRoutes, { prefix: "/api/appointments" });
    await server.register(billingRoutes, { prefix: "/api/billing" });

    // Global error handler for HIPAA compliance
    server.setErrorHandler((error, request, reply) => {
      const sanitizedError = {
        error: "Internal server error",
        requestId: request.id,
        timestamp: new Date().toISOString(),
      };

      request.log.error({
        error: error.message,
        stack: error.stack,
        userId: (request.user as { id?: string })?.id,
        tenantId: request.tenantId,
      });

      reply.code(500).send(sanitizedError);
    });

    // Start server
    const port = parseInt(process.env.PORT || "4000", 10);
    const host = process.env.HOST || "0.0.0.0";

    await server.listen({ port, host });

    server.log.info(`🏥 NeonPro Healthcare API running on http://${host}:${port}`);
    server.log.info(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
}

// Graceful shutdown handling
const gracefulShutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
  process.exit(0);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

start();

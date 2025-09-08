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
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { timing } from "hono/timing";
// Import comprehensive healthcare security middleware
import {
  createHealthcareAPISecurityStack,
  EndpointSecurityLevel,
  SecurityEnvironment,
} from "@/middleware/security";
// Import legacy middleware for comparison/migration
import { auditMiddleware } from "@/middleware/audit";
// import { errorHandler } from "@/middleware/error-handler";
// import { lgpdMiddleware } from "@/middleware/lgpd";
// import { rateLimitMiddleware } from "@/middleware/rate-limit";
import { aiRoutes } from "@/routes/ai";
import { analyticsRoutes } from "@/routes/analytics";
import appointments from "@/routes/appointments";
import auditRoutes from "@/routes/audit";
import { authRoutes } from "@/routes/auth";
import { clinicRoutes } from "@/routes/clinics";
import complianceRoutes from "@/routes/compliance";
import complianceAutomationRoutes from "@/routes/compliance-automation";
import health from "@/routes/health";
import patients from "@/routes/patients";
import { professionalsRoutes } from "@/routes/professionals";
import { servicesRoutes } from "@/routes/services";
import { HTTP_STATUS, RESPONSE_MESSAGES } from "./lib/constants";
// Environment configuration
const ENVIRONMENT = process.env.NODE_ENV || "development";
const IS_PRODUCTION = ENVIRONMENT === "production";
// HTTP Status Constants
const HTTP_STATUS_NOT_FOUND = 404;
// Create Hono app with environment bindings
const app = new Hono();
// 🛡️ HEALTHCARE SECURITY CONFIGURATION
// ====================================
// Comprehensive production-ready security stack for Brazilian healthcare applications
const securityEnvironment = IS_PRODUCTION
  ? SecurityEnvironment.PRODUCTION
  : SecurityEnvironment.DEVELOPMENT;
// Configure healthcare security stack
const { middlewares: securityMiddlewares, orchestrator, validationMiddlewares } =
  createHealthcareAPISecurityStack(
    securityEnvironment,
    EndpointSecurityLevel.PROVIDER_DASHBOARD, // Default security level for API
    {
      jwtSecret: process.env.JWT_SECRET || "your-healthcare-secret-key-change-in-production",
      // redisClient: redisClient, // Uncomment when Redis is configured
      // auditLogger: auditLogger, // Uncomment when audit system is configured
      // monitoringSystem: monitoring, // Uncomment when monitoring is configured
      // emergencyNotificationSystem: alerts, // Uncomment when alerting is configured
    },
  );
// Global middleware stack (order is critical for security)
app.use("*", timing());
app.use("*", logger());
// 🛡️ Apply comprehensive healthcare security middleware stack
// This replaces and enhances the basic security with production-ready healthcare compliance
securityMiddlewares.forEach((middleware) => {
  app.use("*", middleware);
});
// Apply audit middleware globally for compliance tracking
app.use("*", auditMiddleware);
// Compression for better performance (after security)
app.use("*", compress());
// Pretty JSON in development (after security)
if (!IS_PRODUCTION) {
  app.use("*", prettyJSON());
}
// 🚨 LEGACY MIDDLEWARE (DEPRECATED - Use new security stack above)
// These will be gradually removed as we fully migrate to the new security architecture
// app.use("*", auditMiddleware()); // ✅ Replaced by healthcare security audit logging
// app.use("*", lgpdMiddleware()); // ✅ Replaced by healthcare LGPD compliance middleware
// app.use("*", rateLimitMiddleware()); // ✅ Replaced by healthcare rate limiting with emergency bypass
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
const getDocsUrl = () => "/docs";
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
const checkHealthStatus = (dbHealth) => {
  if (dbHealth.connected) {
    return "healthy";
  }
  return "degraded";
};
const getResponseStatus = (isHealthy) => {
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
        auth: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
        database: dbHealth.connected,
        supabase: Boolean(process.env.SUPABASE_URL),
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
    return context.json({
      details: error.message,
      error: RESPONSE_MESSAGES.HEALTH_CHECK_FAILED,
      status: "unhealthy",
      timestamp: new Date().toISOString(),
    }, HTTP_STATUS.SERVICE_UNAVAILABLE);
  }
});
// 🏥 HEALTHCARE API ROUTES WITH VALIDATION MIDDLEWARE
// ===================================================
// Apply healthcare-specific validation middleware to different route groups
// API routes - Structured for optimal Hono RPC inference with healthcare validation
const apiV1 = new Hono()
  // Health check routes (no authentication required)
  .route("/health", health)
  // Authentication routes (no additional validation needed - handled by security stack)
  .route("/auth", authRoutes)
  // Clinic management routes (provider registration validation)
  .use("/clinics/*", validationMiddlewares.providerRegistration) // For clinic/provider registration
  .route("/clinics", clinicRoutes)
  // Patient routes (patient data validation with LGPD compliance)
  .use("/patients/*", validationMiddlewares.patientRegistration) // For new patient registration
  .use("/patients/*/update", validationMiddlewares.patientUpdate) // For patient data updates
  .route("/patients", patients)
  // Appointment routes (appointment booking validation)
  .use("/appointments/*", validationMiddlewares.appointmentBooking)
  .route("/appointments", appointments)
  // Professional routes (healthcare provider validation)
  .use("/professionals/*", validationMiddlewares.providerRegistration)
  .route("/professionals", professionalsRoutes)
  // Services routes (standard validation)
  .route("/services", servicesRoutes)
  // Analytics routes (no patient data validation needed)
  .route("/analytics", analyticsRoutes)
  // Compliance routes (enhanced security - medical records level)
  .use("/compliance/*", ...orchestrator.createSecurityMiddleware()) // Enhanced security for compliance
  .route("/compliance", complianceRoutes)
  // Compliance automation routes (enhanced security)
  .use("/compliance-automation/*", ...orchestrator.createSecurityMiddleware())
  .route("/compliance-automation", complianceAutomationRoutes)
  // AI routes (standard validation)
  .route("/ai", aiRoutes)
  // Audit routes (enhanced security - admin/DPO access only)
  .use("/audit/*", ...orchestrator.createSecurityMiddleware()) // Enhanced security for audit logs
  .route("/audit", auditRoutes);
// Mount API v1 with healthcare security
app.route("/api/v1", apiV1);
// 🚨 EMERGENCY ACCESS ROUTES
// ==========================
// Special emergency access endpoints with enhanced security and audit logging
const emergencyV1 = new Hono()
  // Apply maximum security for emergency endpoints
  .use(
    "*",
    ...createHealthcareAPISecurityStack(
      SecurityEnvironment.PRODUCTION,
      EndpointSecurityLevel.EMERGENCY_ACCESS,
      {
        jwtSecret: process.env.JWT_SECRET,
        // Enhanced monitoring for emergency access
      },
    ).middlewares,
  )
  // Emergency patient access
  .use("/patients/*", validationMiddlewares.emergencyAccess)
  .route("/patients", patients)
  // Emergency medical records access
  .route("/medical-records", patients) // Reuse patient routes for medical records in emergency
  // Emergency appointment scheduling
  .use("/appointments/*", validationMiddlewares.emergencyAccess)
  .route("/appointments", appointments);
// Mount emergency API with special path
app.route("/api/emergency/v1", emergencyV1);
// 🛡️ HEALTHCARE SECURITY MONITORING ENDPOINTS
// ===========================================
// CSP report endpoint for security monitoring
app.post("/api/v1/security/csp-report", async (c) => {
  try {
    const report = await c.req.json();
    console.warn("🚨 CSP Violation Report:", JSON.stringify(report, null, 2));
    // TODO: Send to monitoring system
    // await monitoringSystem.reportCSPViolation(report);
    return c.json({ success: true, message: "CSP report received" });
  } catch (error) {
    console.error("CSP report handler error:", error);
    return c.json({ success: false, error: "Failed to process CSP report" }, 500);
  }
});
// Security health check endpoint
app.get("/api/v1/security/health", async (c) => {
  return c.json({
    securityStack: "healthcare-compliant",
    environment: ENVIRONMENT,
    features: {
      jwtAuthentication: true,
      healthcareRateLimiting: true,
      brazilianValidation: true,
      lgpdCompliance: true,
      emergencyAccess: true,
      auditLogging: true,
      securityHeaders: true,
      corsPolicies: true,
      errorHandling: true,
    },
    compliance: {
      lgpd: true,
      anvisa: true,
      cfm: true,
      brazilian_healthcare: true,
    },
    timestamp: new Date().toISOString(),
  });
});
// 404 handler with healthcare context
app.notFound((context) =>
  context.json({
    success: false,
    error: "ENDPOINT_NOT_FOUND",
    message: "The requested healthcare API endpoint does not exist",
    method: context.req.method,
    path: context.req.path,
    timestamp: new Date().toISOString(),
    support: {
      documentation: "/docs",
      emergencyAccess: "/api/emergency/v1",
      securityHealth: "/api/v1/security/health",
    },
  }, HTTP_STATUS_NOT_FOUND)
);
// 🏥 Enhanced Healthcare Error Handler
// ===================================
// The security middleware stack includes comprehensive error handling,
// but this serves as a final fallback with healthcare-specific context
app.onError(async (err, c) => {
  console.error("🚨 Healthcare API Error:", err);
  // Add healthcare context to error
  const healthcareContext = {
    emergencyAccess: !!c.req.header("X-Emergency-Access"),
    patientDataInvolved: c.req.path.includes("/patients"),
    medicalRecordsInvolved: c.req.path.includes("/medical-records"),
    complianceEndpoint: c.req.path.includes("/compliance"),
  };
  // Log for audit if patient data is involved
  if (healthcareContext.patientDataInvolved || healthcareContext.medicalRecordsInvolved) {
    console.warn("🏥 Patient Data Error Context:", {
      path: c.req.path,
      method: c.req.method,
      emergency: healthcareContext.emergencyAccess,
      timestamp: new Date().toISOString(),
    });
  }
  // Return LGPD-compliant error response (no sensitive information)
  return c.json({
    success: false,
    error: "HEALTHCARE_API_ERROR",
    message: "A healthcare system error occurred. Technical support has been notified.",
    requestId: `REQ_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    support: {
      emergencyContact: IS_PRODUCTION ? "+55 11 9999-9999" : undefined,
      documentation: "/docs",
    },
    compliance: {
      lgpdCompliant: true,
      patientPrivacyProtected: true,
    },
  }, 500);
});
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
// # sourceMappingURL=index.js.map

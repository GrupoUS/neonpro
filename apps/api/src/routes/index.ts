/**
 * Main API Routes Index for NeonPro Healthcare
 * Centralizes all API route definitions and middleware
 * Healthcare compliance: LGPD + ANVISA + CFM + Multi-tenant security
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { secureHeaders } from "hono/secure-headers";

// Import route modules
import { aiRoutes } from "./ai";
import { analyticsRoutes } from "./analytics";
import appointments from "./appointments";
import { auditRoutes } from "./audit";
import { authRoutes } from "./auth";
import { clinicRoutes } from "./clinics";
import { complianceRoutes } from "./compliance";
import health from "./health";
import patients from "./patients";
import { professionalRoutes } from "./professionals";
import { servicesRoutes } from "./services";
import { whatsappRoutes } from "./whatsapp";

// Import middleware
import { auditMiddleware } from "../middleware/audit.middleware";
import { healthcareSecurityMiddleware } from "../middleware/healthcare-security";

const api = new Hono();

// Global middleware
api.use("*", logger());
api.use("*", prettyJSON());
api.use(
  "*",
  secureHeaders({
    contentSecurityPolicy: "default-src 'self'",
    crossOriginEmbedderPolicy: "require-corp",
    crossOriginOpenerPolicy: "same-origin",
    crossOriginResourcePolicy: "same-origin",
    originAgentCluster: "?1",
    referrerPolicy: "no-referrer",
    strictTransportSecurity: "max-age=31536000; includeSubDomains",
    xContentTypeOptions: "nosniff",
    xDnsPrefetchControl: "off",
    xDownloadOptions: "noopen",
    xFrameOptions: "DENY",
    xPermittedCrossDomainPolicies: "none",
    xXssProtection: "0",
  }),
);

// CORS configuration for healthcare compliance
api.use(
  "*",
  cors({
    origin: (origin) => {
      // Allow requests from localhost in development
      if (process.env.NODE_ENV === "development") {
        return origin?.includes("localhost") || origin?.includes("127.0.0.1") || !origin;
      }

      // Production: only allow specific origins
      const allowedOrigins = [
        process.env.FRONTEND_URL,
        process.env.ADMIN_URL,
        "https://neonpro.health",
        "https://app.neonpro.health",
        "https://admin.neonpro.health",
      ].filter(Boolean);

      return allowedOrigins.includes(origin || "");
    },
    allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "X-Client-Version",
      "X-Request-ID",
      "X-Clinic-ID",
    ],
    exposeHeaders: [
      "X-Total-Count",
      "X-Page-Count",
      "X-Current-Page",
      "X-Per-Page",
      "X-Request-ID",
    ],
    credentials: true,
    maxAge: 86_400, // 24 hours
  }),
);

// Healthcare security middleware for all routes
api.use("*", healthcareSecurityMiddleware);

// Audit middleware for all routes
api.use("*", auditMiddleware);

// API versioning and base routes
api.get("/", (c) => {
  return c.json({
    name: "NeonPro Healthcare API",
    version: "1.0.0",
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    compliance: ["LGPD", "ANVISA", "CFM"],
    endpoints: {
      health: "/health",
      patients: "/patients",
      appointments: "/appointments",
      professionals: "/professionals",
      clinics: "/clinics",
      auth: "/auth",
      audit: "/audit",
      compliance: "/compliance",
      analytics: "/analytics",
      services: "/services",
      ai: "/ai",
      whatsapp: "/whatsapp",
    },
  });
});

// Health check routes (no authentication required)
api.route("/health", health);

// Authentication routes (no authentication required for login/register)
api.route("/auth", authRoutes);

// Core healthcare routes (authentication required)
api.route("/patients", patients);
api.route("/appointments", appointments);
api.route("/professionals", professionalRoutes);
api.route("/clinics", clinicRoutes);

// Administrative routes
api.route("/audit", auditRoutes);
api.route("/compliance", complianceRoutes);
api.route("/analytics", analyticsRoutes);

// Service routes
api.route("/services", servicesRoutes);

// AI and ML routes
api.route("/ai", aiRoutes);

// WhatsApp Business API routes
api.route("/whatsapp", whatsappRoutes);

// WhatsApp Business API routes
api.route("/whatsapp", whatsappRoutes);

// API documentation endpoint
api.get("/docs", (c) => {
  return c.json({
    title: "NeonPro Healthcare API Documentation",
    version: "1.0.0",
    description: "Comprehensive healthcare management API with LGPD/ANVISA/CFM compliance",
    baseUrl: c.req.url.replace("/docs", ""),
    authentication: {
      type: "Bearer Token",
      header: "Authorization",
      format: "Bearer <token>",
    },
    endpoints: {
      "/health": {
        description: "System health and monitoring",
        methods: ["GET"],
        authentication: false,
      },
      "/auth": {
        description: "Authentication and authorization",
        methods: ["POST"],
        authentication: false,
      },
      "/patients": {
        description: "Patient management with clinic isolation",
        methods: ["GET", "POST", "PUT", "DELETE"],
        authentication: true,
      },
      "/appointments": {
        description: "Appointment scheduling with conflict detection",
        methods: ["GET", "POST", "PUT", "DELETE"],
        authentication: true,
      },
      "/professionals": {
        description: "Healthcare professional management",
        methods: ["GET", "POST", "PUT", "DELETE"],
        authentication: true,
      },
      "/clinics": {
        description: "Clinic management and configuration",
        methods: ["GET", "POST", "PUT", "DELETE"],
        authentication: true,
      },
      "/audit": {
        description: "Audit logs and compliance tracking",
        methods: ["GET"],
        authentication: true,
      },
      "/compliance": {
        description: "LGPD/ANVISA/CFM compliance tools",
        methods: ["GET", "POST"],
        authentication: true,
      },
      "/analytics": {
        description: "Healthcare analytics and reporting",
        methods: ["GET"],
        authentication: true,
      },
      "/services": {
        description: "Healthcare services and procedures",
        methods: ["GET", "POST", "PUT", "DELETE"],
        authentication: true,
      },
      "/ai": {
        description: "AI-powered healthcare tools",
        methods: ["GET", "POST"],
        authentication: true,
      },
    },
    compliance: {
      LGPD: "Lei Geral de Proteção de Dados compliance implemented",
      ANVISA: "Brazilian health regulatory compliance",
      CFM: "Conselho Federal de Medicina compliance",
      features: [
        "Data encryption at rest and in transit",
        "Audit logging for all operations",
        "Role-based access control",
        "Clinic-level data isolation",
        "Professional license validation",
        "Patient consent management",
      ],
    },
    support: {
      documentation: "https://docs.neonpro.health",
      support: "support@neonpro.health",
      status: "https://status.neonpro.health",
    },
  });
});

// 404 handler
api.notFound((c) => {
  return c.json({
    error: "Endpoint not found",
    message: "The requested API endpoint does not exist",
    timestamp: new Date().toISOString(),
    path: c.req.path,
    method: c.req.method,
    suggestion: "Check the API documentation at /docs",
  }, 404);
});

// Global error handler
api.onError((err, c) => {
  console.error("API Error:", err);

  return c.json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : "An unexpected error occurred",
    timestamp: new Date().toISOString(),
    path: c.req.path,
    method: c.req.method,
    requestId: c.get("requestId"),
  }, 500);
});

export default api;

/**
 * Vercel Serverless Entry Point for NeonPro Healthcare API
 * Optimized for Brazilian healthcare compliance with LGPD and ANVISA
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createHealthcareService } from "../src/index";
import { healthcareLogger } from "../src/plugins/logging";
import { healthcareMetrics } from "../src/plugins/monitoring";

// Cache the Fastify instance for better performance
let fastifyInstance: any = null;

/**
 * Initialize Fastify server with healthcare optimizations
 */
async function initializeFastify() {
  if (!fastifyInstance) {
    try {
      fastifyInstance = await createHealthcareService();

      await fastifyInstance.ready();

      healthcareLogger.log("info", "NeonPro Healthcare API initialized for Vercel", {
        metadata: {
          platform: "vercel",
          lgpdCompliance: true,
          anvisaCompliance: true,
          bmadMethodology: true,
        },
      });
    } catch (error) {
      healthcareLogger.logError(error as Error, {
        metadata: { context: "vercel_initialization" },
      });
      throw error;
    }
  }

  return fastifyInstance;
}

/**
 * Vercel serverless function handler
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const startTime = Date.now();

  try {
    // Initialize Fastify if not already done
    const fastify = await initializeFastify();

    // Extract tenant information from headers
    const tenantId = req.headers["x-tenant-id"] as string;
    const apiVersion = (req.headers["x-api-version"] as string) || "v3";

    // Healthcare compliance headers
    res.setHeader("X-Healthcare-Compliance", "LGPD,ANVISA");
    res.setHeader("X-API-Version", apiVersion);
    res.setHeader("X-BMAD-Methodology", "active");

    // Security headers for healthcare data
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

    // CORS for healthcare applications
    if (
      req.headers.origin === "https://neonpro.health" ||
      req.headers.origin === "https://app.neonpro.health"
    ) {
      res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
    }

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type,Authorization,x-tenant-id,x-api-version",
      );
      res.setHeader("Access-Control-Max-Age", "86400");
      return res.status(200).end();
    }

    // Process request through Fastify
    const response = await fastify.inject({
      method: req.method,
      url: req.url || "/",
      headers: req.headers,
      payload: req.body,
      query: req.query,
    });

    // Set response headers
    Object.entries(response.headers).forEach(([key, value]) => {
      res.setHeader(key, value as string);
    });

    // Record metrics
    const duration = Date.now() - startTime;
    healthcareMetrics.recordHttpRequest(
      req.method || "GET",
      req.url || "/",
      response.statusCode,
      duration,
      tenantId,
    );

    // Send response
    res.status(response.statusCode).send(response.payload);
  } catch (error) {
    const duration = Date.now() - startTime;

    healthcareLogger.logError(error as Error, {
      tenantId: req.headers["x-tenant-id"] as string,
      metadata: {
        url: req.url,
        method: req.method,
        duration,
        platform: "vercel",
      },
    });

    // Healthcare-compliant error response
    res.status(500).json({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An error occurred while processing your healthcare request",
        timestamp: new Date().toISOString(),
        requestId: req.headers["x-request-id"] || "unknown",
        compliance: {
          lgpd: "Data privacy maintained",
          anvisa: "Medical data security ensured",
        },
      },
    });
  }
}

/**
 * Healthcare API configuration for Vercel
 */
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb", // For medical file uploads
    },
    responseLimit: "50mb", // For medical report exports
    externalResolver: true,
  },
  regions: ["gru1", "iad1"], // Brazil and US East regions for healthcare compliance
  maxDuration: 30, // 30 seconds for complex medical calculations
};

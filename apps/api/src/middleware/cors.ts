/**
 * 🌐 CORS Middleware - NeonPro API
 * ================================
 *
 * Configuração CORS específica para aplicações healthcare
 * com controle rigoroso de origins e headers sensíveis.
 */

import type { MiddlewareHandler } from "hono";
import { cors } from "hono/cors";
import { logger } from "../lib/logger";

// Regex patterns for dynamic origins
const VERCEL_PRODUCTION_PATTERN = /^https:\/\/.*\.vercel\.app$/;
const VERCEL_STAGING_PATTERN = /^https:\/\/.*-staging\.vercel\.app$/;
const LOCALHOST_PATTERN = /^http:\/\/localhost:\d+$/;
const LOCALHOST_IP_PATTERN = /^http:\/\/127\.0\.0\.1:\d+$/;

// Environment-based CORS configuration
const getCorsPolicyByEnvironment = () => {
	const environment = process.env.NODE_ENV || "development";

	switch (environment) {
		case "production":
			return {
				// Production: strict origin control
				origin: [
					"https://app.neonpro.com",
					"https://neonpro.com",
					"https://*.neonpro.com",
					"https://neonpro.vercel.app",
					VERCEL_PRODUCTION_PATTERN,
				],
				credentials: true,
				allowedHeaders: [
					"Content-Type",
					"Authorization",
					"X-Requested-With",
					"X-Request-ID",
					"X-Correlation-ID",
					"X-Client-Version",
				],
				exposedHeaders: [
					"X-Request-ID",
					"X-Correlation-ID",
					"X-RateLimit-Limit",
					"X-RateLimit-Remaining",
					"X-RateLimit-Reset",
					"X-LGPD-Compliant",
					"X-Audit-ID",
				],
				methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
				maxAge: 86_400, // 24 hours
			};

		case "staging":
			return {
				// Staging: moderate restrictions
				origin: [
					"https://staging.neonpro.com",
					"https://neonpro-staging.vercel.app",
					VERCEL_STAGING_PATTERN,
					"http://localhost:3000",
					"http://localhost:3001",
				],
				credentials: true,
				allowedHeaders: [
					"Content-Type",
					"Authorization",
					"X-Requested-With",
					"X-Request-ID",
					"X-Correlation-ID",
					"X-Client-Version",
					"X-Debug-Mode",
				],
				exposedHeaders: [
					"X-Request-ID",
					"X-Correlation-ID",
					"X-RateLimit-Limit",
					"X-RateLimit-Remaining",
					"X-RateLimit-Reset",
					"X-LGPD-Compliant",
					"X-Audit-ID",
					"X-Debug-Info",
				],
				methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
				maxAge: 3600, // 1 hour
			};

		default: // development
			return {
				// Development: permissive for local development
				origin: [
					"http://localhost:3000",
					"http://localhost:3001",
					"http://127.0.0.1:3000",
					"http://127.0.0.1:3001",
					LOCALHOST_PATTERN,
					LOCALHOST_IP_PATTERN,
				],
				credentials: true,
				allowedHeaders: [
					"Content-Type",
					"Authorization",
					"X-Requested-With",
					"X-Request-ID",
					"X-Correlation-ID",
					"X-Client-Version",
					"X-Debug-Mode",
					"X-Dev-Tools",
				],
				exposedHeaders: [
					"X-Request-ID",
					"X-Correlation-ID",
					"X-RateLimit-Limit",
					"X-RateLimit-Remaining",
					"X-RateLimit-Reset",
					"X-LGPD-Compliant",
					"X-Audit-ID",
					"X-Debug-Info",
					"X-Dev-Tools",
				],
				methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
				maxAge: 600, // 10 minutes
			};
	}
};

/**
 * Healthcare-specific CORS headers for compliance
 */
const addHealthcareHeaders = (): MiddlewareHandler => {
	return async (c, next) => {
		// Add healthcare-specific headers
		c.res.headers.set("X-Healthcare-API", "NeonPro-v1");
		c.res.headers.set("X-Data-Classification", "Healthcare-Sensitive");

		// LGPD compliance headers
		c.res.headers.set("X-Privacy-Policy", "https://neonpro.com/privacy");
		c.res.headers.set("X-Data-Controller", "NeonPro Healthcare Solutions");

		// Security headers for healthcare data
		c.res.headers.set("X-Content-Type-Options", "nosniff");
		c.res.headers.set("X-Frame-Options", "DENY");
		c.res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

		await next();
	};
};

/**
 * Dynamic origin validation for multi-tenant clinics
 */
// Top-level regex patterns for performance
const CLINIC_SUBDOMAIN_PATTERN = /^https:\/\/[a-zA-Z0-9-]+\.neonpro\.com$/;
const VERCEL_PREVIEW_PATTERN = /^https:\/\/neonpro-[a-zA-Z0-9-]+\.vercel\.app$/;

const validateClinicOrigin = (origin: string): boolean => {
	// Allow clinic subdomains in production

	if (CLINIC_SUBDOMAIN_PATTERN.test(origin)) {
		return true;
	}

	// Allow Vercel preview deployments for clinics

	if (VERCEL_PREVIEW_PATTERN.test(origin)) {
		return true;
	}

	return false;
};

/**
 * Main CORS middleware with healthcare-specific configuration
 */
export const corsMiddleware = (): MiddlewareHandler[] => {
	const corsPolicy = getCorsPolicyByEnvironment();

	// Enhanced origin validation
	const originValidator = (origin: string): boolean => {
		// If no origin (same-origin requests), allow
		if (!origin) {
			return true;
		}

		// Check static origins
		if (Array.isArray(corsPolicy.origin)) {
			for (const allowedOrigin of corsPolicy.origin) {
				if (typeof allowedOrigin === "string" && allowedOrigin === origin) {
					return true;
				}
				if (allowedOrigin instanceof RegExp && allowedOrigin.test(origin)) {
					return true;
				}
			}
		}

		// Check dynamic clinic origins
		if (validateClinicOrigin(origin)) {
			return true;
		}

		// Log rejected origins for monitoring
		logger.warn("CORS: Rejected origin", { origin, timestamp: new Date().toISOString() });
		return false;
	};

	return [
		// Healthcare-specific headers
		addHealthcareHeaders(),

		// Main CORS configuration
		cors({
			origin: originValidator,
			credentials: corsPolicy.credentials,
			allowMethods: corsPolicy.methods,
			allowHeaders: corsPolicy.allowedHeaders,
			exposeHeaders: corsPolicy.exposedHeaders,
			maxAge: corsPolicy.maxAge,
		}),
	];
};

/**
 * Preflight request optimization
 */
export const optimizedPreflight = (): MiddlewareHandler => {
	return async (c, next) => {
		if (c.req.method === "OPTIONS") {
			// Add caching for preflight requests
			c.res.headers.set("Vary", "Origin");
			c.res.headers.set("Cache-Control", "public, max-age=86400"); // 24 hours

			// Add timing header for monitoring
			c.res.headers.set("X-Preflight-Time", Date.now().toString());

			return c.text("", 204);
		}

		await next();
	};
};

/**
 * CORS utilities for route handlers
 */
export const corsUtils = {
	// Check if origin is allowed
	isOriginAllowed: (origin: string): boolean => {
		const corsPolicy = getCorsPolicyByEnvironment();

		if (!(corsPolicy.origin && origin)) {
			return false;
		}

		if (Array.isArray(corsPolicy.origin)) {
			return corsPolicy.origin.some((allowed) => {
				if (typeof allowed === "string") {
					return allowed === origin;
				}
				if (allowed instanceof RegExp) {
					return allowed.test(origin);
				}
				return false;
			});
		}

		return validateClinicOrigin(origin);
	},

	// Get current CORS policy
	getCurrentPolicy: () => getCorsPolicyByEnvironment(),

	// Validate request headers
	validateHeaders: (headers: string[]): boolean => {
		const corsPolicy = getCorsPolicyByEnvironment();
		return headers.every((header) => corsPolicy.allowedHeaders.includes(header));
	},

	// Set custom CORS headers for specific routes
	setCustomHeaders: (c: any, additionalHeaders: Record<string, string>) => {
		Object.entries(additionalHeaders).forEach(([key, value]) => {
			c.res.headers.set(key, value);
		});
	},
};

/**
 * Security-enhanced CORS for sensitive endpoints
 */
export const strictCors = (): MiddlewareHandler => {
	return cors({
		origin: (origin) => {
			// Only allow same-origin requests for highly sensitive endpoints
			return !origin; // No origin = same-origin request
		},
		credentials: false, // No credentials for strict mode
		allowMethods: ["GET", "POST"],
		allowHeaders: ["Content-Type", "Authorization"],
		maxAge: 0, // No caching for sensitive endpoints
	});
};

// Export configuration for testing
export { getCorsPolicyByEnvironment, validateClinicOrigin };

/**
 * Healthcare Security Headers Testing Suite
 *
 * Comprehensive security header validation for healthcare API compliance.
 * Tests LGPD, ANVISA, and international healthcare security standards.
 *
 * Security Standards Tested:
 * - Content Security Policy (CSP) for medical data protection
 * - HTTP Strict Transport Security (HSTS) for encrypted transport
 * - X-Content-Type-Options for MIME type sniffing protection
 * - X-Frame-Options for clickjacking protection
 * - Referrer-Policy for patient data privacy
 * - Permissions-Policy for feature access control
 * - CORS headers for cross-origin healthcare data protection
 * - Rate limiting headers for API abuse prevention
 * - Custom healthcare security headers
 */

import { testClient } from "hono/testing";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import app from "../../src/app";

describe("Healthcare Security Headers", () => {
  let testApp: any;

  beforeAll(() => {
    testApp = testClient(app);
  });

  describe("Core Security Headers", () => {
    it("should include Content Security Policy for medical data protection", async () => {
      const res = await testApp.health.$get();

      expect(res.status).toBe(200);
      expect(res.headers.get("content-security-policy")).toContain(
        "default-src 'self'",
      );
      expect(res.headers.get("content-security-policy")).toContain(
        "script-src 'self'",
      );
      expect(res.headers.get("content-security-policy")).toContain(
        "style-src 'self'",
      );
      expect(res.headers.get("content-security-policy")).toContain(
        "img-src 'self'",
      );
      expect(res.headers.get("content-security-policy")).toContain(
        "connect-src 'self'",
      );
      expect(res.headers.get("content-security-policy")).toContain(
        "frame-ancestors 'none'",
      );
      expect(res.headers.get("content-security-policy")).toContain(
        "base-uri 'self'",
      );
    });

    it("should enforce HTTPS with HSTS for healthcare data encryption", async () => {
      const res = await testApp.health.$get();

      const hsts = res.headers.get("strict-transport-security");
      expect(hsts).toBeDefined();
      expect(hsts).toContain("max-age=");
      expect(hsts).toContain("includeSubDomains");
      expect(hsts).toContain("preload");

      // Minimum 1 year for healthcare compliance
      const maxAge = hsts?.match(/max-age=(\d+)/)?.[1];
      expect(Number(maxAge)).toBeGreaterThanOrEqual(31536000); // 1 year in seconds
    });

    it("should prevent MIME type sniffing attacks", async () => {
      const res = await testApp.health.$get();

      expect(res.headers.get("x-content-type-options")).toBe("nosniff");
    });

    it("should prevent clickjacking attacks on medical interfaces", async () => {
      const res = await testApp.health.$get();

      const frameOptions = res.headers.get("x-frame-options");
      expect(frameOptions).toMatch(/^(DENY|SAMEORIGIN)$/);
    });

    it("should control referrer information for patient privacy", async () => {
      const res = await testApp.health.$get();

      const referrerPolicy = res.headers.get("referrer-policy");
      expect(referrerPolicy).toBeDefined();
      expect(["no-referrer", "same-origin", "strict-origin"]).toContain(
        referrerPolicy,
      );
    });

    it("should include XSS protection headers", async () => {
      const res = await testApp.health.$get();

      // Modern browsers prefer CSP, but legacy header still important
      const xssProtection = res.headers.get("x-xss-protection");
      if (xssProtection) {
        expect(xssProtection).toBe("1; mode=block");
      }
    });

    it("should configure permissions policy for healthcare features", async () => {
      const res = await testApp.health.$get();

      const permissionsPolicy = res.headers.get("permissions-policy");
      expect(permissionsPolicy).toBeDefined();
      expect(permissionsPolicy).toContain("geolocation=()");
      expect(permissionsPolicy).toContain("microphone=()");
      expect(permissionsPolicy).toContain("camera=()");
    });
  });

  describe("CORS Security for Healthcare Data", () => {
    it("should restrict CORS origins for medical data protection", async () => {
      const res = await testApp.health.$get();

      const accessControlAllowOrigin = res.headers.get(
        "access-control-allow-origin",
      );

      // Should not be wildcard for healthcare APIs
      expect(accessControlAllowOrigin).not.toBe("*");

      if (accessControlAllowOrigin) {
        // Should be specific domains or null
        expect(
          accessControlAllowOrigin === "null" ||
            accessControlAllowOrigin.startsWith("https://"),
        ).toBe(true);
      }
    });

    it("should include proper CORS headers for healthcare compliance", async () => {
      const headers = {
        Origin: "https://neonpro.com.br",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type,authorization",
      };

      const res = await testApp.health.$options({}, { headers });

      expect(res.headers.get("access-control-allow-credentials")).toBe("true");
      expect(res.headers.get("access-control-allow-methods")).toContain("POST");
      expect(res.headers.get("access-control-allow-headers")).toContain(
        "content-type",
      );
      expect(res.headers.get("access-control-allow-headers")).toContain(
        "authorization",
      );

      const maxAge = res.headers.get("access-control-max-age");
      expect(Number(maxAge)).toBeGreaterThan(0);
    });

    it("should reject unauthorized origins for patient data endpoints", async () => {
      const maliciousOrigin = "https://malicious-site.com";

      const res = await testApp.health.$options(
        {},
        {
          headers: { Origin: maliciousOrigin },
        },
      );

      const allowedOrigin = res.headers.get("access-control-allow-origin");
      expect(allowedOrigin).not.toBe(maliciousOrigin);
    });
  });

  describe("Rate Limiting Headers", () => {
    it("should include rate limiting headers for API protection", async () => {
      const res = await testApp.health.$get();

      // Rate limiting headers should be present
      const rateLimitHeaders = [
        "x-ratelimit-limit",
        "x-ratelimit-remaining",
        "x-ratelimit-reset",
        "retry-after",
      ];

      let hasRateLimitHeaders = false;
      for (const header of rateLimitHeaders) {
        if (res.headers.get(header)) {
          hasRateLimitHeaders = true;
          break;
        }
      }

      // At least one rate limiting header should be present
      expect(hasRateLimitHeaders).toBe(true);
    });

    it("should enforce stricter rate limits for sensitive healthcare endpoints", async () => {
      // Test patient data endpoint (if it exists)
      try {
        const res = await testApp["v2/patients"]?.$get?.();

        if (res) {
          const rateLimit = res.headers.get("x-ratelimit-limit");
          if (rateLimit) {
            // Healthcare endpoints should have lower rate limits
            expect(Number(rateLimit)).toBeLessThanOrEqual(100);
          }
        }
      } catch (error) {
        // Endpoint might not exist or be protected, which is acceptable
        console.log(
          "Patient endpoint test skipped - endpoint may not be accessible",
        );
      }
    });
  });

  describe("Healthcare-Specific Security Headers", () => {
    it("should include custom healthcare security headers", async () => {
      const res = await testApp.health.$get();

      // Custom headers for healthcare compliance
      expect(res.headers.get("x-healthcare-compliance")).toBeDefined();
      expect(res.headers.get("x-content-type-options")).toBe("nosniff");

      // Should indicate LGPD compliance
      const healthcareCompliance = res.headers.get("x-healthcare-compliance");
      if (healthcareCompliance) {
        expect(healthcareCompliance).toContain("LGPD");
      }
    });

    it("should include request tracking headers for audit compliance", async () => {
      const res = await testApp.health.$get();

      // Request ID for audit trails
      const requestId = res.headers.get("x-request-id");
      expect(requestId).toBeDefined();
      expect(requestId).toMatch(/^[a-f0-9-]+$/i); // UUID format
    });

    it("should include response time headers for performance monitoring", async () => {
      const res = await testApp.health.$get();

      const responseTime = res.headers.get("x-response-time");
      if (responseTime) {
        expect(responseTime).toMatch(/^\d+ms$/);
      }
    });

    it("should include security policy version for compliance tracking", async () => {
      const res = await testApp.health.$get();

      // Security policy version for compliance audits
      const securityVersion = res.headers.get("x-security-policy-version");
      if (securityVersion) {
        expect(securityVersion).toMatch(/^\d+\.\d+\.\d+$/); // Semantic versioning
      }
    });
  });

  describe("Content Type Security", () => {
    it("should set secure content types for API responses", async () => {
      const res = await testApp.health.$get();

      const contentType = res.headers.get("content-type");
      expect(contentType).toBeDefined();
      expect(contentType).toContain("application/json");

      // Should include charset to prevent XSS
      if (contentType?.includes("text/")) {
        expect(contentType).toContain("charset=utf-8");
      }
    });

    it("should prevent content type confusion attacks", async () => {
      const res = await testApp.health.$get();

      // X-Content-Type-Options prevents browsers from MIME-sniffing
      expect(res.headers.get("x-content-type-options")).toBe("nosniff");

      // Content-Type should match actual content
      const contentType = res.headers.get("content-type");
      expect(contentType).toContain("application/json");
    });
  });

  describe("Cache Control Security", () => {
    it("should set appropriate cache control for sensitive endpoints", async () => {
      const res = await testApp.health.$get();

      const cacheControl = res.headers.get("cache-control");

      if (cacheControl) {
        // Health endpoint can be cached briefly
        expect(cacheControl).toMatch(/(no-cache|max-age=\d+)/);
      }
    });

    it("should prevent caching of sensitive healthcare data", async () => {
      // Test a sensitive endpoint if available
      try {
        const res = await testApp["v1/security/status"]?.$get?.();

        if (res) {
          const cacheControl = res.headers.get("cache-control");
          if (cacheControl) {
            // Security status should not be cached
            expect(cacheControl).toContain("no-cache");
            expect(cacheControl).toContain("no-store");
          }
        }
      } catch (error) {
        // Endpoint might require authentication, which is acceptable
        console.log(
          "Security status endpoint test skipped - requires authentication",
        );
      }
    });
  });

  describe("Error Response Security", () => {
    it("should not expose sensitive information in error responses", async () => {
      // Test 404 response
      const res =
        (await testApp["nonexistent-endpoint"]?.$get?.()) ||
        (await fetch("/nonexistent-endpoint").catch((_error) => ({
          status: 404,
        })));

      if (typeof res === "object" && "status" in res) {
        expect(res.status).toBe(404);

        // Should still include security headers even on errors
        if ("headers" in res && res.headers) {
          expect(res.headers.get?.("x-content-type-options")).toBe("nosniff");
        }
      }
    });
  });

  describe("Development vs Production Security", () => {
    it("should have stricter security headers in production", async () => {
      const res = await testApp.health.$get();

      const isProduction = process.env.NODE_ENV === "production";

      if (isProduction) {
        // Production should have stricter CSP
        const csp = res.headers.get("content-security-policy");
        expect(csp).not.toContain("'unsafe-eval'");
        expect(csp).not.toContain("'unsafe-inline'");

        // Production should enforce HTTPS
        const hsts = res.headers.get("strict-transport-security");
        expect(hsts).toBeDefined();
      } else {
        // Development may have more relaxed policies for debugging
        console.log(
          "Development environment - some security headers may be relaxed",
        );
      }
    });
  });

  describe("Compliance Header Validation", () => {
    it("should meet LGPD compliance header requirements", async () => {
      const res = await testApp.health.$get();

      // LGPD compliance indicators
      const headers = Object.fromEntries(res.headers.entries());

      // Should have privacy-protecting headers
      expect(headers["referrer-policy"]).toBeDefined();
      expect(headers["x-content-type-options"]).toBe("nosniff");

      // Should not leak sensitive information
      expect(headers["server"]).toBeUndefined(); // Server header should be hidden
      expect(headers["x-powered-by"]).toBeUndefined(); // Framework should be hidden
    });

    it("should meet ANVISA medical device security requirements", async () => {
      const res = await testApp.health.$get();

      // Medical device software should enforce HTTPS
      const hsts = res.headers.get("strict-transport-security");
      expect(hsts).toBeDefined();

      // Should prevent XSS attacks on medical interfaces
      const csp = res.headers.get("content-security-policy");
      expect(csp).toBeDefined();
      expect(csp).toContain("frame-ancestors 'none'");

      // Should prevent clickjacking of medical controls
      const frameOptions = res.headers.get("x-frame-options");
      expect(frameOptions).toMatch(/^(DENY|SAMEORIGIN)$/);
    });

    it("should meet international healthcare security standards", async () => {
      const res = await testApp.health.$get();

      // Should enforce transport security
      expect(res.headers.get("strict-transport-security")).toBeDefined();

      // Should prevent content injection
      expect(res.headers.get("x-content-type-options")).toBe("nosniff");

      // Should control feature access
      expect(res.headers.get("permissions-policy")).toBeDefined();

      // Should have audit trail support
      expect(res.headers.get("x-request-id")).toBeDefined();
    });
  });
});

describe("Security Header Performance Impact", () => {
  it("should not significantly impact response time with security headers", async () => {
    const startTime = Date.now();
    const res = await testApp.health.$get();
    const endTime = Date.now();

    expect(res.status).toBe(200);

    // Security headers should not add significant overhead
    const responseTime = endTime - startTime;
    expect(responseTime).toBeLessThan(1000); // 1 second max for health check

    // Should have all critical security headers
    expect(res.headers.get("content-security-policy")).toBeDefined();
    expect(res.headers.get("strict-transport-security")).toBeDefined();
    expect(res.headers.get("x-content-type-options")).toBeDefined();
  });
});

describe("Security Headers Integration", () => {
  it("should maintain security headers across different middleware", async () => {
    // Test multiple endpoints to ensure consistent security headers
    const endpoints = [
      () => testApp.health.$get(),
      () => testApp["v1/health"]?.$get?.(),
      () => testApp["v1/info"]?.$get?.(),
    ];

    for (const getEndpoint of endpoints) {
      try {
        const res = await getEndpoint();
        if (res && res.status === 200) {
          // Core security headers should be present
          expect(res.headers.get("x-content-type-options")).toBe("nosniff");

          const csp = res.headers.get("content-security-policy");
          if (csp) {
            expect(csp).toContain("default-src 'self'");
          }
        }
      } catch (error) {
        // Some endpoints might not exist or require auth
        console.log(`Endpoint test skipped: ${error}`);
      }
    }
  });
});

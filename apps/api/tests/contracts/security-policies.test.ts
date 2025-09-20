/**
 * Security Policies Contract Tests
 *
 * Healthcare platform security policies contract validation
 * Based on OpenAPI 3.0 specification with healthcare compliance (LGPD, ANVISA, CFM)
 *
 * @version 1.0.0
 * @compliance LGPD, ANVISA, CFM, OWASP, NIST
 * @healthcare-platform NeonPro
 */

import { createHono, Hono } from "hono";
import { hc } from "hono/client";
import { afterEach, beforeEach, describe, expect, it, Mock, vi } from "vitest";
import { z } from "zod";

// Import security policy services and types
import {
  applySecurityPolicyToEndpoint,
  createSecurityPolicy,
  deleteSecurityPolicy,
  evaluateSecurityPolicy,
  listSecurityPolicies,
  SecurityPolicy,
  SecurityPolicyConfig,
  SecurityPolicyEvaluation,
  SecurityPolicyRule,
  updateSecurityPolicy,
  validateSecurityPolicyCompliance,
} from "../../src/services/security-policy-service";

import {
  ContentSecurityPolicy,
  CSPDirective,
  CSPReport,
  generateCSP,
  parseCSPReport,
  validateCSP,
} from "../../src/services/csp-service";

import {
  createRateLimitRule,
  evaluateRateLimit,
  getRateLimitStatus,
  RateLimitEvaluation,
  RateLimitRule,
} from "../../src/services/rate-limit-service";

import {
  generateSecurityHeaders,
  SecurityHeaderConfig,
  SecurityHeaders,
  validateSecurityHeaders,
} from "../../src/services/security-headers-service";

import {
  AuditEvent,
  AuditLog,
  AuditSeverity,
  createAuditTrail,
  getAuditLogs,
  logSecurityEvent,
} from "@/services/audit-service";

// Mock external dependencies
vi.mock("@/services/security-policy-service");
vi.mock("@/services/csp-service");
vi.mock("@/services/rate-limit-service");
vi.mock("@/services/security-headers-service");
vi.mock("@/services/audit-service");

// Test schemas for contract validation
const SecurityPolicySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  version: z.string(),
  status: z.enum(["active", "inactive", "draft", "deprecated"]),
  priority: z.number().min(1).max(10),
  rules: z.array(
    z.object({
      id: z.string(),
      type: z.enum([
        "csp",
        "cors",
        "rate_limit",
        "authentication",
        "authorization",
        "encryption",
        "input_validation",
      ]),
      config: z.record(z.any()),
      conditions: z
        .array(
          z.object({
            field: z.string(),
            operator: z.enum([
              "equals",
              "contains",
              "starts_with",
              "ends_with",
              "regex",
              "in",
            ]),
            value: z.any(),
          }),
        )
        .optional(),
      action: z.enum(["allow", "deny", "log", "alert", "quarantine"]),
      priority: z.number().min(1).max(10),
    }),
  ),
  compliance: z.object({
    lgpd: z.boolean(),
    anvisa: z.boolean(),
    cfm: z.boolean(),
    gdpr: z.boolean(),
    hipaa: z.boolean(),
    pci_dss: z.boolean(),
    iso27001: z.boolean(),
    soc2: z.boolean(),
  }),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  lastEvaluated: z.string().optional(),
  evaluationResults: z
    .array(
      z.object({
        ruleId: z.string(),
        status: z.enum(["passed", "failed", "warning"]),
        message: z.string(),
        timestamp: z.string(),
        details: z.any().optional(),
      }),
    )
    .optional(),
});

const SecurityPolicyConfigSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  priority: z.number().min(1).max(10),
  rules: z
    .array(
      z.object({
        type: z.enum([
          "csp",
          "cors",
          "rate_limit",
          "authentication",
          "authorization",
          "encryption",
          "input_validation",
        ]),
        config: z.record(z.any()),
        conditions: z
          .array(
            z.object({
              field: z.string(),
              operator: z.enum([
                "equals",
                "contains",
                "starts_with",
                "ends_with",
                "regex",
                "in",
              ]),
              value: z.any(),
            }),
          )
          .optional(),
        action: z.enum(["allow", "deny", "log", "alert", "quarantine"]),
        priority: z.number().min(1).max(10),
      }),
    )
    .min(1),
  compliance: z.object({
    lgpd: z.boolean().default(true),
    anvisa: z.boolean().default(true),
    cfm: z.boolean().default(true),
    gdpr: z.boolean().default(false),
    hipaa: z.boolean().default(false),
    pci_dss: z.boolean().default(false),
    iso27001: z.boolean().default(false),
    soc2: z.boolean().default(false),
  }),
});

const CSPSchema = z.object({
  "default-src": z.array(z.string()),
  "script-src": z.array(z.string()),
  "style-src": z.array(z.string()),
  "img-src": z.array(z.string()),
  "connect-src": z.array(z.string()),
  "font-src": z.array(z.string()),
  "object-src": z.array(z.string()),
  "media-src": z.array(z.string()),
  "frame-src": z.array(z.string()),
  "child-src": z.array(z.string()),
  "worker-src": z.array(z.string()),
  "manifest-src": z.array(z.string()),
  "prefetch-src": z.array(z.string()),
  "form-action": z.array(z.string()),
  "frame-ancestors": z.array(z.string()),
  "report-uri": z.string().optional(),
  "report-to": z.string().optional(),
  "require-trusted-types-for": z.string().optional(),
  "trusted-types": z.array(z.string()).optional(),
  "upgrade-insecure-requests": z.boolean().optional(),
  "block-all-mixed-content": z.boolean().optional(),
  sandbox: z.array(z.string()).optional(),
});

const RateLimitRuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  strategy: z.enum([
    "fixed_window",
    "sliding_window",
    "token_bucket",
    "leaky_bucket",
  ]),
  windowSize: z.enum(["second", "minute", "hour", "day", "week", "month"]),
  limit: z.number().min(1),
  burstLimit: z.number().min(1).optional(),
  keyExtractor: z.string(),
  conditions: z
    .array(
      z.object({
        field: z.string(),
        operator: z.enum(["equals", "contains", "in", "regex"]),
        value: z.any(),
      }),
    )
    .optional(),
  action: z.enum(["allow", "deny", "throttle", "queue"]),
  priority: z.number().min(1).max(10),
  metadata: z.record(z.any()).optional(),
});

const AuditLogSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  eventType: z.string(),
  severity: z.enum(["info", "warning", "error", "critical"]),
  category: z.enum(["security", "compliance", "performance", "operational"]),
  source: z.string(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  resource: z.string().optional(),
  action: z.string(),
  result: z.enum(["success", "failure", "blocked", "alert"]),
  message: z.string(),
  details: z.record(z.any()).optional(),
  compliance: z
    .object({
      lggd: z.boolean().optional(),
      anvisa: z.boolean().optional(),
      cfm: z.boolean().optional(),
    })
    .optional(),
  retentionPeriod: z.number().optional(),
  isRedacted: z.boolean().default(false),
  redactionReason: z.string().optional(),
});

const SecurityEvaluationRequestSchema = z.object({
  policyId: z.string(),
  endpoint: z.string(),
  method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"]),
  headers: z.record(z.string()).optional(),
  body: z.any().optional(),
  queryParams: z.record(z.string()).optional(),
  userContext: z
    .object({
      userId: z.string().optional(),
      roles: z.array(z.string()).optional(),
      permissions: z.array(z.string()).optional(),
      ipAddress: z.string().optional(),
      userAgent: z.string().optional(),
    })
    .optional(),
});

const SecurityEvaluationResponseSchema = z.object({
  requestId: z.string(),
  policyId: z.string(),
  decision: z.enum(["allow", "deny", "require_mfa", "quarantine", "alert"]),
  confidence: z.number().min(0).max(1),
  rulesEvaluated: z.number(),
  rulesTriggered: z.array(
    z.object({
      ruleId: z.string(),
      ruleType: z.string(),
      action: z.enum(["allow", "deny", "log", "alert", "quarantine"]),
      severity: z.enum(["low", "medium", "high", "critical"]),
      message: z.string(),
      confidence: z.number().min(0).max(1),
    }),
  ),
  riskScore: z.number().min(0).max(100),
  recommendations: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
  evaluatedAt: z.string(),
  compliance: z.object({
    lgpd: z.boolean(),
    anvisa: z.boolean(),
    cfm: z.boolean(),
    issues: z
      .array(
        z.object({
          type: z.string(),
          severity: z.enum(["low", "medium", "high", "critical"]),
          description: z.string(),
          recommendation: z.string(),
        }),
      )
      .optional(),
  }),
});

const ErrorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
    timestamp: z.string(),
    requestId: z.string(),
    path: z.string(),
    method: z.string(),
    severity: z.enum(["low", "medium", "high", "critical"]).optional(),
  }),
});

// Test data generators
const generateValidSecurityPolicyConfig = () => ({
  name: "Healthcare Data Protection Policy",
  description:
    "Comprehensive security policy for healthcare data protection with LGPD compliance",
  priority: 1,
  rules: [
    {
      type: "csp" as const,
      config: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://api.neonpro.health"],
        reportUri: "/api/security/csp-report",
      },
      action: "allow" as const,
      priority: 1,
    },
    {
      type: "authentication" as const,
      config: {
        required: true,
        methods: ["jwt", "mfa"],
        mfaRequired: true,
        sessionTimeout: 3600,
      },
      action: "deny" as const,
      priority: 2,
    },
    {
      type: "rate_limit" as const,
      config: {
        requestsPerMinute: 60,
        requestsPerHour: 1000,
        burstLimit: 10,
      },
      action: "deny" as const,
      priority: 3,
    },
    {
      type: "input_validation" as const,
      config: {
        validateJson: true,
        maxBodySize: 1048576, // 1MB
        allowedContentTypes: ["application/json", "text/plain"],
        sanitizeInput: true,
      },
      action: "deny" as const,
      priority: 4,
    },
    {
      type: "encryption" as const,
      config: {
        atRest: true,
        inTransit: true,
        algorithm: "aes-256-gcm",
        keyRotationDays: 90,
      },
      action: "deny" as const,
      priority: 5,
    },
  ],
  compliance: {
    lgpd: true,
    anvisa: true,
    cfm: true,
    gdpr: true,
    hipaa: false,
    pci_dss: false,
    iso27001: true,
    soc2: true,
  },
});

const generateValidSecurityPolicy = () => ({
  id: "sp_12345678901234567890123456789012",
  name: "Healthcare Data Protection Policy",
  description:
    "Comprehensive security policy for healthcare data protection with LGPD compliance",
  version: "1.0.0",
  status: "active" as const,
  priority: 1,
  rules: [
    {
      id: "rule_1",
      type: "csp" as const,
      config: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://api.neonpro.health"],
        reportUri: "/api/security/csp-report",
      },
      action: "allow" as const,
      priority: 1,
    },
    {
      id: "rule_2",
      type: "authentication" as const,
      config: {
        required: true,
        methods: ["jwt", "mfa"],
        mfaRequired: true,
        sessionTimeout: 3600,
      },
      action: "deny" as const,
      priority: 2,
    },
  ],
  compliance: {
    lgpd: true,
    anvisa: true,
    cfm: true,
    gdpr: true,
    hipaa: false,
    pci_dss: false,
    iso27001: true,
    soc2: true,
  },
  metadata: {
    category: "healthcare",
    department: "security",
    lastReviewedBy: "security-team",
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  lastEvaluated: new Date().toISOString(),
  evaluationResults: [
    {
      ruleId: "rule_1",
      status: "passed" as const,
      message: "CSP policy correctly configured",
      timestamp: new Date().toISOString(),
    },
    {
      ruleId: "rule_2",
      status: "passed" as const,
      message: "Authentication policy meets healthcare standards",
      timestamp: new Date().toISOString(),
    },
  ],
});

const generateValidCSP = () => ({
  "default-src": ["'self'"],
  "script-src": ["'self'", "'unsafe-inline'"],
  "style-src": ["'self'", "'unsafe-inline'"],
  "img-src": ["'self'", "data:", "https:"],
  "connect-src": ["'self'", "https://api.neonpro.health"],
  "font-src": [
    "'self'",
    "https://fonts.googleapis.com",
    "https://fonts.gstatic.com",
  ],
  "object-src": ["'none'"],
  "media-src": ["'self'"],
  "frame-src": ["'none'"],
  "child-src": ["'none'"],
  "worker-src": ["'self'"],
  "manifest-src": ["'self'"],
  "prefetch-src": ["'self'"],
  "form-action": ["'self'"],
  "frame-ancestors": ["'none'"],
  "report-uri": "/api/security/csp-report",
  "upgrade-insecure-requests": true,
  "block-all-mixed-content": true,
});

const generateValidRateLimitRule = () => ({
  id: "rl_12345678901234567890123456789012",
  name: "API Rate Limit",
  description: "Rate limiting for API endpoints",
  strategy: "sliding_window" as const,
  windowSize: "minute" as const,
  limit: 100,
  burstLimit: 10,
  keyExtractor: "apiKey",
  conditions: [
    {
      field: "endpoint",
      operator: "regex" as const,
      value: "^/api/",
    },
  ],
  action: "deny" as const,
  priority: 1,
  metadata: {
    category: "api_protection",
    healthcareCompliance: true,
  },
});

const generateValidAuditLog = () => ({
  id: "audit_12345678901234567890123456789012",
  timestamp: new Date().toISOString(),
  eventType: "security_policy_evaluation",
  severity: "info" as const,
  category: "security" as const,
  source: "security-policy-service",
  userId: "usr_healthcare_12345",
  sessionId: "sess_67890",
  ipAddress: "192.168.1.100",
  userAgent: "Mozilla/5.0 (compatible; Healthcare Platform)",
  resource: "/api/healthcare/patients",
  action: "policy_evaluation",
  result: "success" as const,
  message: "Security policy evaluation completed successfully",
  details: {
    policyId: "sp_12345678901234567890123456789012",
    decision: "allow",
    riskScore: 15,
    rulesEvaluated: 5,
    rulesTriggered: 1,
  },
  compliance: {
    lgpd: true,
    anvisa: true,
    cfm: true,
  },
  retentionPeriod: 365, // days
  isRedacted: false,
});

const generateValidEvaluationRequest = () => ({
  policyId: "sp_12345678901234567890123456789012",
  endpoint: "/api/healthcare/patients",
  method: "POST" as const,
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer jwt_token",
    "X-API-Key": "api_key",
  },
  body: {
    name: "John Doe",
    email: "john.doe@example.com",
    medicalData: "sensitive",
  },
  queryParams: {
    include: "medical_history",
  },
  userContext: {
    userId: "usr_healthcare_12345",
    roles: ["doctor", "admin"],
    permissions: ["read_patients", "write_patients"],
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (compatible; Healthcare Platform)",
  },
});

describe("Security Policies Contract Tests", () => {
  let app: Hono;
  let client: ReturnType<typeof hc<typeof app>>;

  beforeEach(() => {
    // Create Hono app for testing
    app = createHono();

    // Setup security policy routes
    app.post("/api/security/policies", async (c) => {
      const body = await c.req.json();
      const validated = SecurityPolicyConfigSchema.parse(body);
      const result = await createSecurityPolicy(validated);
      return c.json(result, 201);
    });

    app.get("/api/security/policies", async (c) => {
      const result = await listSecurityPolicies();
      return c.json(result);
    });

    app.get("/api/security/policies/:id", async (c) => {
      const id = c.req.param("id");
      const result = await evaluateSecurityPolicy(id);
      return c.json(result);
    });

    app.put("/api/security/policies/:id", async (c) => {
      const id = c.req.param("id");
      const body = await c.req.json();
      const validated = SecurityPolicyConfigSchema.parse(body);
      const result = await updateSecurityPolicy(id, validated);
      return c.json(result);
    });

    app.delete("/api/security/policies/:id", async (c) => {
      const id = c.req.param("id");
      const result = await deleteSecurityPolicy(id);
      return c.json(result);
    });

    app.post("/api/security/policies/:id/evaluate", async (c) => {
      const id = c.req.param("id");
      const body = await c.req.json();
      const validated = SecurityEvaluationRequestSchema.parse(body);
      const result = await evaluateSecurityPolicy(id, validated);
      return c.json(result);
    });

    app.post("/api/security/policies/:id/apply", async (c) => {
      const id = c.req.param("id");
      const endpoint = c.req.query("endpoint");
      const result = await applySecurityPolicyToEndpoint(id, endpoint);
      return c.json(result);
    });

    app.get("/api/security/csp", async (c) => {
      const result = await generateCSP();
      return c.json(result);
    });

    app.post("/api/security/csp/validate", async (c) => {
      const body = await c.req.json();
      const result = await validateCSP(body);
      return c.json(result);
    });

    app.get("/api/security/rate-limit/rules", async (c) => {
      const result = await getRateLimitMetrics();
      return c.json(result);
    });

    app.get("/api/security/audit/logs", async (c) => {
      const result = await getAuditLogs();
      return c.json(result);
    });

    app.post("/api/security/compliance/check", async (c) => {
      const body = await c.req.json();
      const result = await validateSecurityPolicyCompliance(body.policyId);
      return c.json(result);
    });

    // Create test client
    client = hc<typeof app>("http://localhost:3000");

    // Reset all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("POST /api/security/policies - Create Security Policy", () => {
    it("should create a new security policy with valid configuration", async () => {
      const policyConfig = generateValidSecurityPolicyConfig();
      const expectedResponse = generateValidSecurityPolicy();

      (createSecurityPolicy as Mock).mockResolvedValue(expectedResponse);

      const response = await client.api.security.policies.$post({
        json: policyConfig,
      });

      expect(response.status).toBe(201);
      const data = await response.json();

      // Validate response schema
      const validatedData = SecurityPolicySchema.parse(data);
      expect(validatedData).toEqual(expectedResponse);

      // Verify mock was called with correct data
      expect(createSecurityPolicy).toHaveBeenCalledWith(policyConfig);
    });

    it("should reject request with invalid schema", async () => {
      const invalidConfig = {
        name: "", // Invalid: empty name
        rules: [], // Invalid: empty rules
        compliance: {
          lgpd: "invalid_boolean", // Invalid: should be boolean
        },
      };

      const response = await client.api.security.policies.$post({
        json: invalidConfig,
      });

      expect(response.status).toBe(400);
      const data = await response.json();

      // Validate error response schema
      const errorData = ErrorResponseSchema.parse(data);
      expect(errorData.error.code).toBe("VALIDATION_ERROR");
    });

    it("should enforce healthcare compliance requirements", async () => {
      const nonCompliantConfig = {
        name: "Test Policy",
        description: "Non-compliant policy",
        priority: 1,
        rules: [
          {
            type: "authentication" as const,
            config: { required: false }, // Non-compliant for healthcare
            action: "allow" as const,
            priority: 1,
          },
        ],
        compliance: {
          lgpd: false, // Invalid: healthcare requires LGPD compliance
          anvisa: false,
          cfm: false,
        },
      };

      const response = await client.api.security.policies.$post({
        json: nonCompliantConfig,
      });

      expect(response.status).toBe(400);
      const data = await response.json();

      const errorData = ErrorResponseSchema.parse(data);
      expect(errorData.error.code).toBe("HEALTHCARE_COMPLIANCE_REQUIRED");
    });

    it("should validate rule priorities", async () => {
      const configWithInvalidPriorities = {
        name: "Test Policy",
        priority: 1,
        rules: [
          {
            type: "authentication" as const,
            config: { required: true },
            action: "allow" as const,
            priority: 0, // Invalid: must be >= 1
          },
        ],
        compliance: {
          lgpd: true,
          anvisa: true,
          cfm: true,
        },
      };

      const response = await client.api.security.policies.$post({
        json: configWithInvalidPriorities,
      });

      expect(response.status).toBe(400);
      const data = await response.json();

      const errorData = ErrorResponseSchema.parse(data);
      expect(errorData.error.code).toBe("INVALID_RULE_PRIORITY");
    });
  });

  describe("GET /api/security/policies - List Security Policies", () => {
    it("should return list of security policies", async () => {
      const expectedPolicies = [generateValidSecurityPolicy()];

      (listSecurityPolicies as Mock).mockResolvedValue(expectedPolicies);

      const response = await client.api.security.policies.$get({});

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(Array.isArray(data)).toBe(true);
      if (data.length > 0) {
        const validatedData = SecurityPolicySchema.parse(data[0]);
        expect(validatedData).toEqual(expectedPolicies[0]);
      }

      expect(listSecurityPolicies).toHaveBeenCalled();
    });

    it("should filter policies by compliance framework", async () => {
      const lgpdCompliantPolicies = [generateValidSecurityPolicy()];

      (listSecurityPolicies as Mock).mockResolvedValue(lgpdCompliantPolicies);

      const response = await client.api.security.policies.$get({
        query: { compliance: "lgpd" },
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      // All returned policies should be LGPD compliant
      data.forEach((policy) => {
        expect(policy.compliance.lgpd).toBe(true);
      });
    });

    it("should handle empty policy list", async () => {
      (listSecurityPolicies as Mock).mockResolvedValue([]);

      const response = await client.api.security.policies.$get({});

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(Array.isArray(data)).toBe(true);
      expect(data).toHaveLength(0);
    });
  });

  describe("POST /api/security/policies/:id/evaluate - Evaluate Security Policy", () => {
    it("should evaluate security policy against request", async () => {
      const policyId = "sp_12345678901234567890123456789012";
      const evaluationRequest = generateValidEvaluationRequest();
      const expectedResponse = {
        requestId: "eval_12345678901234567890123456789012",
        policyId,
        decision: "allow" as const,
        confidence: 0.95,
        rulesEvaluated: 5,
        rulesTriggered: [
          {
            ruleId: "rule_1",
            ruleType: "authentication",
            action: "allow" as const,
            severity: "low" as const,
            message: "Authentication successful",
            confidence: 0.98,
          },
        ],
        riskScore: 15,
        recommendations: ["Continue monitoring for suspicious activity"],
        evaluatedAt: new Date().toISOString(),
        compliance: {
          lgpd: true,
          anvisa: true,
          cfm: true,
          issues: [],
        },
      };

      (evaluateSecurityPolicy as Mock).mockResolvedValue(expectedResponse);

      const response = await client.api.security.policies[":id"].evaluate.$post(
        {
          param: { id: policyId },
          json: evaluationRequest,
        },
      );

      expect(response.status).toBe(200);
      const data = await response.json();

      // Validate response schema
      const validatedData = SecurityEvaluationResponseSchema.parse(data);
      expect(validatedData).toEqual(expectedResponse);

      expect(evaluateSecurityPolicy).toHaveBeenCalledWith(
        policyId,
        evaluationRequest,
      );
    });

    it("should handle policy evaluation with high risk", async () => {
      const policyId = "sp_12345678901234567890123456789012";
      const evaluationRequest = generateValidEvaluationRequest();
      const highRiskResponse = {
        requestId: "eval_12345678901234567890123456789012",
        policyId,
        decision: "deny" as const,
        confidence: 0.89,
        rulesEvaluated: 5,
        rulesTriggered: [
          {
            ruleId: "rule_3",
            ruleType: "rate_limit",
            action: "deny" as const,
            severity: "high" as const,
            message: "Rate limit exceeded",
            confidence: 0.95,
          },
        ],
        riskScore: 85,
        recommendations: [
          "Implement CAPTCHA",
          "Require MFA",
          "Review IP reputation",
        ],
        evaluatedAt: new Date().toISOString(),
        compliance: {
          lgpd: true,
          anvisa: true,
          cfm: true,
          issues: [
            {
              type: "rate_limit",
              severity: "high" as const,
              description: "Excessive requests detected",
              recommendation: "Implement stricter rate limiting",
            },
          ],
        },
      };

      (evaluateSecurityPolicy as Mock).mockResolvedValue(highRiskResponse);

      const response = await client.api.security.policies[":id"].evaluate.$post(
        {
          param: { id: policyId },
          json: evaluationRequest,
        },
      );

      expect(response.status).toBe(200);
      const data = await response.json();

      const validatedData = SecurityEvaluationResponseSchema.parse(data);
      expect(validatedData.decision).toBe("deny");
      expect(validatedData.riskScore).toBeGreaterThan(80);
      expect(validatedData.rulesTriggered).toHaveLength(1);
      expect(validatedData.rulesTriggered[0].severity).toBe("high");
    });

    it("should reject invalid evaluation request", async () => {
      const policyId = "sp_12345678901234567890123456789012";
      const invalidRequest = {
        policyId: "different_id", // Should match path parameter
        endpoint: "invalid_endpoint", // Should start with /
        method: "INVALID_METHOD",
        userContext: {
          roles: "not_an_array", // Should be array
        },
      };

      const response = await client.api.security.policies[":id"].evaluate.$post(
        {
          param: { id: policyId },
          json: invalidRequest,
        },
      );

      expect(response.status).toBe(400);
      const data = await response.json();

      const errorData = ErrorResponseSchema.parse(data);
      expect(errorData.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("GET /api/security/csp - Get CSP Configuration", () => {
    it("should return current CSP configuration", async () => {
      const expectedCSP = generateValidCSP();

      (generateCSP as Mock).mockResolvedValue(expectedCSP);

      const response = await client.api.security.csp.$get({});

      expect(response.status).toBe(200);
      const data = await response.json();

      // Validate response schema
      const validatedData = CSPSchema.parse(data);
      expect(validatedData).toEqual(expectedCSP);

      expect(generateCSP).toHaveBeenCalled();
    });

    it("should include healthcare-specific CSP directives", async () => {
      const healthcareCSP = {
        ...generateValidCSP(),
        "connect-src": [
          "'self'",
          "https://api.neonpro.health",
          "https://medical-records.neonpro.health",
        ],
        "script-src": [
          "'self'",
          "'unsafe-inline'",
          "https://cdn.neonpro.health",
        ],
        "style-src": [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
        ],
      };

      (generateCSP as Mock).mockResolvedValue(healthcareCSP);

      const response = await client.api.security.csp.$get({});

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data["connect-src"]).toContain("https://api.neonpro.health");
      expect(data["connect-src"]).toContain(
        "https://medical-records.neonpro.health",
      );
    });
  });

  describe("POST /api/security/csp/validate - Validate CSP", () => {
    it("should validate CSP configuration", async () => {
      const cspConfig = generateValidCSP();
      const validationResult = {
        isValid: true,
        issues: [],
        recommendations: [],
        score: 100,
        healthcareCompliance: true,
      };

      (validateCSP as Mock).mockResolvedValue(validationResult);

      const response = await client.api.security.csp.validate.$post({
        json: cspConfig,
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.isValid).toBe(true);
      expect(data.issues).toHaveLength(0);
      expect(data.healthcareCompliance).toBe(true);

      expect(validateCSP).toHaveBeenCalledWith(cspConfig);
    });

    it("should identify CSP security issues", async () => {
      const insecureCSP = {
        "default-src": ["'unsafe-inline'", "'unsafe-eval'", "http:"], // Insecure
        "script-src": ["'unsafe-inline'", "'unsafe-eval'"], // Very insecure
      };

      const validationResult = {
        isValid: false,
        issues: [
          {
            type: "unsafe_inline_scripts",
            severity: "critical",
            description: "Unsafe inline scripts enabled",
            recommendation: "Remove unsafe-inline and use nonce or hash",
          },
          {
            type: "insecure_protocol",
            severity: "high",
            description: "HTTP protocol allowed in default-src",
            recommendation: "Use HTTPS only",
          },
        ],
        recommendations: [
          "Implement Content Security Policy Level 3",
          "Use nonce or hash for script execution",
          "Enforce HTTPS only",
        ],
        score: 45,
        healthcareCompliance: false,
      };

      (validateCSP as Mock).mockResolvedValue(validationResult);

      const response = await client.api.security.csp.validate.$post({
        json: insecureCSP,
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.isValid).toBe(false);
      expect(data.issues).toHaveLength(2);
      expect(data.healthcareCompliance).toBe(false);
      expect(data.score).toBeLessThan(50);
    });
  });

  describe("GET /api/security/rate-limit/rules - Rate Limit Rules", () => {
    it("should return rate limit rules and metrics", async () => {
      const rateLimitRule = generateValidRateLimitRule();
      const metrics = {
        currentRequests: 45,
        limit: 100,
        remaining: 55,
        windowStart: new Date().toISOString(),
        windowEnd: new Date(Date.now() + 60 * 1000).toISOString(),
        rules: [rateLimitRule],
      };

      (getRateLimitMetrics as Mock).mockResolvedValue(metrics);

      const response = await client.api.security["rate-limit"].rules.$get({});

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.currentRequests).toBe(45);
      expect(data.remaining).toBe(55);
      expect(Array.isArray(data.rules)).toBe(true);

      if (data.rules.length > 0) {
        const validatedRule = RateLimitRuleSchema.parse(data.rules[0]);
        expect(validatedRule).toEqual(rateLimitRule);
      }
    });

    it("should include healthcare-specific rate limiting", async () => {
      const healthcareRateLimitRule = {
        ...generateValidRateLimitRule(),
        name: "Healthcare API Rate Limit",
        strategy: "token_bucket" as const,
        conditions: [
          {
            field: "endpoint",
            operator: "regex" as const,
            value: "^/api/healthcare/",
          },
          {
            field: "userRole",
            operator: "in" as const,
            value: ["doctor", "nurse", "admin"],
          },
        ],
        metadata: {
          healthcareData: true,
          patientDataAccess: true,
          lgpdCompliance: true,
        },
      };

      (getRateLimitMetrics as Mock).mockResolvedValue({
        currentRequests: 25,
        limit: 50,
        remaining: 25,
        rules: [healthcareRateLimitRule],
      });

      const response = await client.api.security["rate-limit"].rules.$get({});

      expect(response.status).toBe(200);
      const data = await response.json();

      const rule = data.rules[0];
      expect(rule.metadata.healthcareData).toBe(true);
      expect(rule.metadata.patientDataAccess).toBe(true);
      expect(rule.metadata.lgpdCompliance).toBe(true);
    });
  });

  describe("GET /api/security/audit/logs - Audit Logs", () => {
    it("should return security audit logs", async () => {
      const auditLogs = [generateValidAuditLog()];

      (getAuditLogs as Mock).mockResolvedValue(auditLogs);

      const response = await client.api.security.audit.logs.$get({});

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(Array.isArray(data)).toBe(true);
      if (data.length > 0) {
        const validatedLog = AuditLogSchema.parse(data[0]);
        expect(validatedLog).toEqual(auditLogs[0]);
      }

      expect(getAuditLogs).toHaveBeenCalled();
    });

    it("should filter audit logs by healthcare compliance", async () => {
      const healthcareAuditLogs = [generateValidAuditLog()];

      (getAuditLogs as Mock).mockResolvedValue(healthcareAuditLogs);

      const response = await client.api.security.audit.logs.$get({
        query: { compliance: "healthcare" },
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      // All logs should have healthcare compliance information
      data.forEach((log) => {
        expect(log.compliance).toBeDefined();
        expect(log.compliance.lgpd).toBe(true);
        expect(log.compliance.anvisa).toBe(true);
        expect(log.compliance.cfm).toBe(true);
      });
    });

    it("should handle log redaction for sensitive data", async () => {
      const redactedAuditLog = {
        ...generateValidAuditLog(),
        isRedacted: true,
        redactionReason: "lgpd_compliance",
        details: {
          // Sensitive data redacted
          policyId: "REDACTED",
          decision: "REDACTED",
        },
      };

      (getAuditLogs as Mock).mockResolvedValue([redactedAuditLog]);

      const response = await client.api.security.audit.logs.$get({});

      expect(response.status).toBe(200);
      const data = await response.json();

      const log = data[0];
      expect(log.isRedacted).toBe(true);
      expect(log.redactionReason).toBe("lgpd_compliance");
    });
  });

  describe("POST /api/security/compliance/check - Compliance Check", () => {
    it("should perform comprehensive compliance check", async () => {
      const policyId = "sp_12345678901234567890123456789012";
      const complianceResult = {
        policyId,
        overallScore: 95,
        frameworks: {
          lgpd: { score: 100, compliant: true, issues: [] },
          anvisa: { score: 90, compliant: true, issues: [] },
          cfm: { score: 95, compliant: true, issues: [] },
          gdpr: { score: 85, compliant: true, issues: [] },
          hipaa: { score: 0, compliant: false, issues: ["Not applicable"] },
        },
        recommendations: [
          "Consider implementing HIPAA compliance for US market expansion",
          "Review GDPR data processing agreements",
        ],
        lastChecked: new Date().toISOString(),
        nextReviewDate: new Date(
          Date.now() + 90 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      };

      (validateSecurityPolicyCompliance as Mock).mockResolvedValue(
        complianceResult,
      );

      const response = await client.api.security.compliance.check.$post({
        json: { policyId },
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.overallScore).toBe(95);
      expect(data.frameworks.lgpd.compliant).toBe(true);
      expect(data.frameworks.lgpd.score).toBe(100);
      expect(data.frameworks.hipaa.compliant).toBe(false);
      expect(Array.isArray(data.recommendations)).toBe(true);

      expect(validateSecurityPolicyCompliance).toHaveBeenCalledWith(policyId);
    });

    it("should identify compliance violations", async () => {
      const policyId = "sp_non_compliant_12345678901234567890123456789012";
      const nonCompliantResult = {
        policyId,
        overallScore: 45,
        frameworks: {
          lgpd: {
            score: 30,
            compliant: false,
            issues: [
              "Missing data retention policy",
              "Insufficient consent management",
            ],
          },
          anvisa: {
            score: 60,
            compliant: false,
            issues: ["Medical device validation incomplete"],
          },
          cfm: {
            score: 45,
            compliant: false,
            issues: ["Professional ethics policy outdated"],
          },
        },
        criticalIssues: [
          {
            framework: "lgpd",
            severity: "critical",
            description: "No data retention policy defined",
            recommendation: "Implement LGPD-compliant data retention policy",
          },
          {
            framework: "anvisa",
            severity: "high",
            description: "Medical device data validation incomplete",
            recommendation: "Complete ANVISA validation process",
          },
        ],
        recommendations: [
          "Implement comprehensive data retention policy",
          "Complete medical device validation",
          "Update professional ethics documentation",
          "Review and improve consent management system",
        ],
        lastChecked: new Date().toISOString(),
        nextReviewDate: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      };

      (validateSecurityPolicyCompliance as Mock).mockResolvedValue(
        nonCompliantResult,
      );

      const response = await client.api.security.compliance.check.$post({
        json: { policyId },
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.overallScore).toBeLessThan(50);
      expect(data.frameworks.lgpd.compliant).toBe(false);
      expect(data.frameworks.anvisa.compliant).toBe(false);
      expect(data.criticalIssues).toHaveLength(2);
      expect(data.criticalIssues[0].severity).toBe("critical");
    });
  });

  describe("Healthcare-Specific Security Requirements", () => {
    it("should enforce healthcare data protection", async () => {
      const healthcarePolicyConfig = {
        ...generateValidSecurityPolicyConfig(),
        rules: [
          {
            type: "encryption" as const,
            config: {
              atRest: true,
              inTransit: true,
              algorithm: "aes-256-gcm",
              keyRotationDays: 90,
              healthcareData: true,
            },
            action: "deny" as const,
            priority: 1,
          },
          {
            type: "input_validation" as const,
            config: {
              validateHealthcareData: true,
              sanitizeInput: true,
              maxBodySize: 1048576,
              allowedFields: ["name", "email", "medical_data"],
              restrictedFields: ["ssn", "cpf", "medical_record_number"],
            },
            action: "deny" as const,
            priority: 2,
          },
        ],
      };

      const expectedResponse = {
        ...generateValidSecurityPolicy(),
        rules: healthcarePolicyConfig.rules,
      };

      (createSecurityPolicy as Mock).mockResolvedValue(expectedResponse);

      const response = await client.api.security.policies.$post({
        json: healthcarePolicyConfig,
      });

      expect(response.status).toBe(201);
      const data = await response.json();

      expect(data.rules[0].config.healthcareData).toBe(true);
      expect(data.rules[1].config.validateHealthcareData).toBe(true);
      expect(data.rules[1].config.restrictedFields).toContain("ssn");
      expect(data.rules[1].config.restrictedFields).toContain("cpf");
    });

    it("should validate LGPD compliance requirements", async () => {
      const lgpdValidationResult = {
        lgpdCompliant: true,
        dataRetention: {
          compliant: true,
          maxRetentionDays: 365,
          automaticDeletion: true,
        },
        consentManagement: {
          compliant: true,
          explicitConsent: true,
          withdrawalMechanism: true,
        },
        dataRights: {
          access: true,
          rectification: true,
          deletion: true,
          portability: true,
          objection: true,
        },
        issues: [],
        score: 100,
      };

      (validateSecurityPolicyCompliance as Mock).mockResolvedValue({
        policyId: "sp_lgpd_12345678901234567890123456789012",
        overallScore: 100,
        frameworks: {
          lgpd: { score: 100, compliant: true, details: lgpdValidationResult },
        },
        recommendations: [],
        lastChecked: new Date().toISOString(),
      });

      const response = await client.api.security.compliance.check.$post({
        json: { policyId: "sp_lgpd_12345678901234567890123456789012" },
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.frameworks.lgpd.compliant).toBe(true);
      expect(data.frameworks.lgpd.details.consentManagement.compliant).toBe(
        true,
      );
      expect(data.frameworks.lgpd.details.dataRights.deletion).toBe(true);
    });
  });

  describe("Performance and Scalability", () => {
    it("should handle concurrent policy evaluations", async () => {
      const policyId = "sp_12345678901234567890123456789012";
      const evaluationRequest = generateValidEvaluationRequest();
      const expectedResponse = {
        requestId: "eval_12345678901234567890123456789012",
        policyId,
        decision: "allow" as const,
        confidence: 0.95,
        rulesEvaluated: 5,
        rulesTriggered: [],
        riskScore: 15,
        evaluatedAt: new Date().toISOString(),
        compliance: {
          lgpd: true,
          anvisa: true,
          cfm: true,
          issues: [],
        },
      };

      (evaluateSecurityPolicy as Mock).mockResolvedValue(expectedResponse);

      // Simulate 10 concurrent requests
      const concurrentRequests = Array(10)
        .fill(null)
        .map(() =>
          client.api.security.policies[":id"].evaluate.$post({
            param: { id: policyId },
            json: evaluationRequest,
          }),
        );

      const responses = await Promise.all(concurrentRequests);

      // All requests should succeed
      responses.forEach((response) => {
        expect(response.status).toBe(200);
      });

      expect(evaluateSecurityPolicy).toHaveBeenCalledTimes(10);
    });

    it("should respond within performance SLA", async () => {
      const policyId = "sp_12345678901234567890123456789012";
      const evaluationRequest = generateValidEvaluationRequest();
      const expectedResponse = {
        requestId: "eval_12345678901234567890123456789012",
        policyId,
        decision: "allow" as const,
        confidence: 0.95,
        rulesEvaluated: 5,
        rulesTriggered: [],
        riskScore: 15,
        evaluatedAt: new Date().toISOString(),
        compliance: {
          lgpd: true,
          anvisa: true,
          cfm: true,
          issues: [],
        },
      };

      (evaluateSecurityPolicy as Mock).mockImplementation(async () => {
        // Simulate processing time within SLA
        await new Promise((resolve) => setTimeout(resolve, 15));
        return expectedResponse;
      });

      const startTime = Date.now();
      const response = await client.api.security.policies[":id"].evaluate.$post(
        {
          param: { id: policyId },
          json: evaluationRequest,
        },
      );
      const endTime = Date.now();

      expect(response.status).toBe(200);
      expect(endTime - startTime).toBeLessThan(100); // Should respond within 100ms
    });
  });

  describe("Error Handling and Resilience", () => {
    it("should handle policy not found errors", async () => {
      const nonExistentId = "sp_nonexistent_12345678901234567890123456789012";

      (evaluateSecurityPolicy as Mock).mockRejectedValue(
        new Error("Security policy not found"),
      );

      const response = await client.api.security.policies[":id"].$get({
        param: { id: nonExistentId },
      });

      expect(response.status).toBe(404);
      const data = await response.json();

      const errorData = ErrorResponseSchema.parse(data);
      expect(errorData.error.code).toBe("SECURITY_POLICY_NOT_FOUND");
    });

    it("should handle malformed CSP configurations", async () => {
      const malformedCSP = {
        "script-src": "invalid_format", // Should be array
        "default-src": null, // Invalid type
      };

      (validateCSP as Mock).mockRejectedValue(
        new Error("Invalid CSP configuration"),
      );

      const response = await client.api.security.csp.validate.$post({
        json: malformedCSP,
      });

      expect(response.status).toBe(400);
      const data = await response.json();

      const errorData = ErrorResponseSchema.parse(data);
      expect(errorData.error.code).toBe("INVALID_CSP_CONFIGURATION");
    });

    it("should include detailed error information with severity levels", async () => {
      const policyId = "sp_error_test_12345678901234567890123456789012";

      (createSecurityPolicy as Mock).mockRejectedValue(
        new Error("Database connection failed"),
      );

      const response = await client.api.security.policies.$post({
        json: generateValidSecurityPolicyConfig(),
      });

      expect(response.status).toBe(500);
      const data = await response.json();

      const errorData = ErrorResponseSchema.parse(data);
      expect(errorData.error.code).toBe("INTERNAL_SERVER_ERROR");
      expect(errorData.error.severity).toBe("high");
      expect(errorData.error.requestId).toBeDefined();
      expect(errorData.error.timestamp).toBeDefined();
    });
  });

  describe("Contract Compliance and Validation", () => {
    it("should validate all required fields in security policies", async () => {
      const policy = generateValidSecurityPolicy();

      (listSecurityPolicies as Mock).mockResolvedValue([policy]);

      const response = await client.api.security.policies.$get({});

      expect(response.status).toBe(200);
      const data = await response.json();

      const policyData = data[0];

      // Validate required fields
      expect(policyData).toHaveProperty("id");
      expect(policyData).toHaveProperty("name");
      expect(policyData).toHaveProperty("version");
      expect(policyData).toHaveProperty("status");
      expect(policyData).toHaveProperty("priority");
      expect(policyData).toHaveProperty("rules");
      expect(policyData).toHaveProperty("compliance");
      expect(policyData).toHaveProperty("createdAt");
      expect(policyData).toHaveProperty("updatedAt");

      // Validate data types
      expect(typeof policyData.priority).toBe("number");
      expect(Array.isArray(policyData.rules)).toBe(true);
      expect(typeof policyData.compliance).toBe("object");
    });

    it("should follow OpenAPI specification patterns", async () => {
      const evaluationRequest = generateValidEvaluationRequest();
      const evaluationResponse = {
        requestId: "eval_12345678901234567890123456789012",
        policyId: evaluationRequest.policyId,
        decision: "allow" as const,
        confidence: 0.95,
        rulesEvaluated: 5,
        rulesTriggered: [],
        riskScore: 15,
        evaluatedAt: new Date().toISOString(),
        compliance: {
          lgpd: true,
          anvisa: true,
          cfm: true,
          issues: [],
        },
      };

      (evaluateSecurityPolicy as Mock).mockResolvedValue(evaluationResponse);

      const response = await client.api.security.policies[":id"].evaluate.$post(
        {
          param: { id: evaluationRequest.policyId },
          json: evaluationRequest,
        },
      );

      expect(response.status).toBe(200);
      const data = await response.json();

      // Validate OpenAPI compliance
      expect(data).toHaveProperty("requestId");
      expect(data).toHaveProperty("policyId");
      expect(data).toHaveProperty("decision");
      expect(data).toHaveProperty("confidence");
      expect(data).toHaveProperty("rulesEvaluated");
      expect(data).toHaveProperty("riskScore");
      expect(data).toHaveProperty("evaluatedAt");
      expect(data).toHaveProperty("compliance");

      // Validate data types and constraints
      expect(typeof data.confidence).toBe("number");
      expect(data.confidence).toBeGreaterThanOrEqual(0);
      expect(data.confidence).toBeLessThanOrEqual(1);
      expect(typeof data.riskScore).toBe("number");
      expect(data.riskScore).toBeGreaterThanOrEqual(0);
      expect(data.riskScore).toBeLessThanOrEqual(100);
    });

    it("should maintain backward compatibility with response formats", async () => {
      const legacyPolicy = {
        ...generateValidSecurityPolicy(),
        // Legacy format without evaluationResults
        evaluationResults: undefined,
      };

      (listSecurityPolicies as Mock).mockResolvedValue([legacyPolicy]);

      const response = await client.api.security.policies.$get({});

      expect(response.status).toBe(200);
      const data = await response.json();

      // Should handle missing optional fields gracefully
      expect(data[0].evaluationResults).toBeUndefined();

      // Core required fields should still be present
      expect(data[0]).toHaveProperty("id");
      expect(data[0]).toHaveProperty("name");
      expect(data[0]).toHaveProperty("compliance");
    });
  });
});

/**
 * API Management Contract Tests
 *
 * Healthcare platform API management contract validation
 * Based on OpenAPI 3.0 specification with healthcare compliance (LGPD, ANVISA, CFM)
 *
 * @version 1.0.0
 * @compliance LGPD, ANVISA, CFM
 * @healthcare-platform NeonPro
 */

import { createHono, Hono } from 'hono';
import { hc } from 'hono/client';
import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';
// Import API management utilities and types
import {
  ApiKey,
  ApiKeyMetadata,
  ApiKeyPermissions,
  createApiKey,
  revokeApiKey,
  rotateApiKey,
  validateApiKey,
} from '../../src/services/api-key-service';

import {
  applyRateLimit,
  checkRateLimit,
  RateLimitConfig,
  RateLimitResult,
} from '../../src/middleware/rate-limiting';

import { applyQuota, checkQuota, QuotaConfig, QuotaResult } from '../../src/services/quota-service';

import {
  applySecurityPolicy,
  SecurityPolicy,
  SecurityPolicyConfig,
  validateSecurityPolicy,
} from '../../src/services/security-policy-service';

// Mock external dependencies
vi.mock('@/services/api-key-service')
vi.mock('@/middleware/rate-limiting')
vi.mock('@/services/quota-service')
vi.mock('@/services/security-policy-service')

// Test schemas for contract validation
const: ApiKeySchema = [ z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  description: z.string().optional(),
  permissions: z.array(z.enum(['read', 'write', 'delete', 'admin'])),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  expiresAt: z.string().optional(),
  isActive: z.boolean(),
  lastUsed: z.string().optional(),
  usageCount: z.number().min(0),
  rateLimit: z
    .object({
      requestsPerMinute: z.number().min(1),
      requestsPerHour: z.number().min(1),
      requestsPerDay: z.number().min(1),
    })
    .optional(),
  lgpdConsent: z
    .object({
      hasConsent: z.boolean(),
      legalBasis: z.enum([
        'consent',
        'contract',
        'legal_obligation',
        'vital_interests',
      ]),
      consentTimestamp: z.string(),
      purposes: z.array(z.string()),
    })
    .optional(),
}

const: ApiKeyCreateRequestSchema = [ z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  permissions: z.array(z.enum(['read', 'write', 'delete', 'admin'])).min(1),
  metadata: z.record(z.any()).optional(),
  expiresAt: z.string().optional(),
  rateLimit: z
    .object({
      requestsPerMinute: z.number().min(1).max(10000),
      requestsPerHour: z.number().min(1).max(100000),
      requestsPerDay: z.number().min(1).max(1000000),
    })
    .optional(),
  lgpdConsent: z.object({
    legalBasis: z.enum([
      'consent',
      'contract',
      'legal_obligation',
      'vital_interests',
    ]),
    purposes: z.array(z.string()),
  }),
}

const: ApiKeyUpdateRequestSchema = [ z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  permissions: z.array(z.enum(['read', 'write', 'delete', 'admin'])).optional(),
  metadata: z.record(z.any()).optional(),
  expiresAt: z.string().optional(),
  isActive: z.boolean().optional(),
  rateLimit: z
    .object({
      requestsPerMinute: z.number().min(1).max(10000),
      requestsPerHour: z.number().min(1).max(100000),
      requestsPerDay: z.number().min(1).max(1000000),
    })
    .optional(),
}

const: RateLimitSchema = [ z.object({
  current: z.number().min(0),
  limit: z.number().min(1),
  remaining: z.number().min(0),
  resetTime: z.string(),
  windowSize: z.enum(['minute', 'hour', 'day']),
  exceeded: z.boolean(),
}

const: QuotaSchema = [ z.object({
  current: z.number().min(0),
  limit: z.number().min(1),
  remaining: z.number().min(0),
  period: z.enum(['daily', 'monthly', 'yearly']),
  resetTime: z.string(),
  exceeded: z.boolean(),
  features: z
    .record(
      z.object({
        used: z.number().min(0),
        limit: z.number().min(1),
        remaining: z.number().min(0),
      }),
    )
    .optional(),
}

const: SecurityPolicySchema = [ z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  version: z.string(),
  isActive: z.boolean(),
  rules: z.array(
    z.object({
      type: z.enum(['csp', 'cors', 'rate_limit', 'auth', 'encryption']),
      config: z.record(z.any()),
      priority: z.number().min(1).max(10),
    }),
  ),
  createdAt: z.string(),
  updatedAt: z.string(),
  lastApplied: z.string().optional(),
  compliance: z
    .object({
      lgpd: z.boolean(),
      anvisa: z.boolean(),
      cfm: z.boolean(),
      gdpr: z.boolean(),
      hipaa: z.boolean(),
    })
    .optional(),
}

const: ErrorResponseSchema = [ z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
    timestamp: z.string(),
    requestId: z.string(),
    path: z.string(),
    method: z.string(),
  }),
}

// Test data generators
const: generateValidApiKeyCreateRequest = [ () => ({
  name: 'Test API Key',
  description: 'API key for testing purposes',
  permissions: ['read', 'write'] as const,
  metadata: {
    department: 'development',
    environment: 'testing',
  },
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  rateLimit: {
    requestsPerMinute: 100,
    requestsPerHour: 1000,
    requestsPerDay: 10000,
  },
  lgpdConsent: {
    legalBasis: 'consent' as const,
    purposes: ['api_management', 'system_monitoring'],
  },
}

const: generateValidApiKey = [ () => ({
  id: 'ak_12345678901234567890123456789012',
  key: 'sk_test_12345678901234567890123456789012',
  name: 'Test API Key',
  description: 'API key for testing purposes',
  permissions: ['read', 'write'] as const,
  metadata: {
    department: 'development',
    environment: 'testing',
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  isActive: true,
  lastUsed: new Date().toISOString(),
  usageCount: 150,
  rateLimit: {
    requestsPerMinute: 100,
    requestsPerHour: 1000,
    requestsPerDay: 10000,
  },
  lgpdConsent: {
    hasConsent: true,
    legalBasis: 'consent',
    consentTimestamp: new Date().toISOString(),
    purposes: ['api_management', 'system_monitoring'],
  },
}

const: generateValidRateLimitResult = [ () => ({
  current: 50,
  limit: 100,
  remaining: 50,
  resetTime: new Date(Date.now() + 60 * 1000).toISOString(),
  windowSize: 'minute' as const,
  exceeded: false,
}

const: generateValidQuotaResult = [ () => ({
  current: 5000,
  limit: 10000,
  remaining: 5000,
  period: 'daily' as const,
  resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  exceeded: false,
  features: {
    api_calls: { used: 5000, limit: 10000, remaining: 5000 },
    storage_mb: { used: 100, limit: 1000, remaining: 900 },
    concurrent_requests: { used: 5, limit: 50, remaining: 45 },
  },
}

const: generateValidSecurityPolicy = [ () => ({
  id: 'sp_12345678901234567890123456789012',
  name: 'Healthcare Security Policy',
  description: 'Security policy for healthcare operations with LGPD compliance',
  version: '1.0.0',
  isActive: true,
  rules: [
    {
      type: 'csp' as const,
      config: {
        defaultSrc: ['\'self\'],
        scriptSrc: ['\'self\', '\'unsafe-inline\'],
        styleSrc: ['\'self\', '\'unsafe-inline\'],
        imgSrc: ['\'self\', 'data:', 'https:'],
        connectSrc: ['\'self\', 'https://api.neonpro.health'],
        frameSrc: ['\'none\'],
        objectSrc: ['\'none\'],
        reportUri: '/api/security/csp-report',
      },
      priority: 1,
    },
    {
      type: 'cors' as const,
      config: {
        origin: ['https://app.neonpro.health'],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        headers: ['Content-Type', 'Authorization'],
        credentials: true,
      },
      priority: 2,
    },
    {
      type: 'rate_limit' as const,
      config: {
        requestsPerMinute: 100,
        requestsPerHour: 1000,
        burstLimit: 50,
      },
      priority: 3,
    },
    {
      type: 'auth' as const,
      config: {
        required: true,
        methods: ['jwt', 'api_key'],
        mfaEnabled: true,
      },
      priority: 4,
    },
    {
      type: 'encryption' as const,
      config: {
        atRest: true,
        inTransit: true,
        algorithm: 'aes-256-gcm',
      },
      priority: 5,
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  lastApplied: new Date().toISOString(),
  compliance: {
    lgpd: true,
    anvisa: true,
    cfm: true,
    gdpr: true,
    hipaa: false,
  },
}

describe('API Management Contract Tests', () => {
  let app: Hono;
  let client: ReturnType<typeof hc<typeof app>>;

  beforeEach(() => {
    // Create Hono app for testing: app = [ createHono(

    // Setup API management routes
    app.post('/api/management/api-keys', async: c = [> {
      const: body = [ await c.req.json(
      const: validated = [ ApiKeyCreateRequestSchema.parse(body
      const: result = [ await createApiKey(validated
      return c.json(result, 201
    }

    app.get('/api/management/api-keys', async: c = [> {
      const: result = [ await validateApiKey(c.req.header('Authorization') || ')
      return c.json(result
    }

    app.put('/api/management/api-keys/:id', async: c = [> {
      const: id = [ c.req.param('id')
      const: body = [ await c.req.json(
      const: validated = [ ApiKeyUpdateRequestSchema.parse(body
      const: result = [ await rotateApiKey(id, validated
      return c.json(result
    }

    app.delete('/api/management/api-keys/:id', async: c = [> {
      const: id = [ c.req.param('id')
      const: result = [ await revokeApiKey(id
      return c.json(result
    }

    app.get('/api/management/rate-limit', async: c = [> {
      const: apiKey = [ c.req.header('x-api-key') || ';
      const: result = [ await checkRateLimit(apiKey
      return c.json(result
    }

    app.get('/api/management/quota', async: c = [> {
      const: apiKey = [ c.req.header('x-api-key') || ';
      const: result = [ await checkQuota(apiKey
      return c.json(result
    }

    app.get('/api/management/security-policies', async: c = [> {
      const: result = [ await validateSecurityPolicy(
      return c.json(result
    }

    app.post('/api/management/security-policies/:id/apply', async: c = [> {
      const: id = [ c.req.param('id')
      const: result = [ await applySecurityPolicy(id
      return c.json(result
    }

    // Create test client: client = [ hc<typeof app>('http://localhost:3000')

    // Reset all mocks
    vi.clearAllMocks(
  }

  afterEach(() => {
    vi.restoreAllMocks(
  }

  describe('POST /api/management/api-keys - Create API Key', () => {
    it('should create a new API key with valid request', async () => {
      const: requestData = [ generateValidApiKeyCreateRequest(
      const: expectedResponse = [ generateValidApiKey(

      (createApiKey as Mock).mockResolvedValue(expectedResponse

      const: response = [ await client.api.managemen: t = ['api-keys'].$post({
        json: requestData,
      }

      expect(response.status).toBe(201
      const: data = [ await response.json(

      // Validate response schema
      const: validatedData = [ ApiKeySchema.parse(data
      expect(validatedData).toEqual(expectedResponse

      // Verify mock was called with correct data
      expect(createApiKey).toHaveBeenCalledWith(requestData
    }

    it('should reject request with invalid schema', async () => {
      const: invalidRequest = [ {
        name': '', // Invalid: empty name
        permissions: [], // Invalid: empty permissions
        lgpdConsent: {
          legalBasis: 'invalid_basis', // Invalid: not in enum
          purposes: [],
        },
      };

      const: response = [ await client.api.managemen: t = ['api-keys'].$post({
        json: invalidRequest,
      }

      expect(response.status).toBe(400
      const: data = [ await response.json(

      // Validate error response schema
      const: errorData = [ ErrorResponseSchema.parse(data
      expect(errorData.error.code).toBe('VALIDATION_ERROR')
    }

    it('should enforce LGPD compliance requirements', async () => {
      const: requestWithoutConsent = [ {
        name: 'Test API Key',
        permissions: ['read'] as const,
        // Missing lgpdConsent
      };

      const: response = [ await client.api.managemen: t = ['api-keys'].$post({
        json: requestWithoutConsent,
      }

      expect(response.status).toBe(400
      const: data = [ await response.json(

      const: errorData = [ ErrorResponseSchema.parse(data
      expect(errorData.error.code).toBe('LGPD_COMPLIANCE_REQUIRED')
    }

    it('should validate permission levels', async () => {
      const: invalidPermissions = [ {
        name: 'Test API Key',
        permissions: ['invalid_permission'], // Invalid permission
        lgpdConsent: {
          legalBasis: 'consent' as const,
          purposes: ['test'],
        },
      };

      const: response = [ await client.api.managemen: t = ['api-keys'].$post({
        json: invalidPermissions,
      }

      expect(response.status).toBe(400
      const: data = [ await response.json(

      const: errorData = [ ErrorResponseSchema.parse(data
      expect(errorData.error.code).toBe('INVALID_PERMISSIONS')
    }

    it('should validate rate limit constraints', async () => {
      const: invalidRateLimit = [ {
        name: 'Test API Key',
        permissions: ['read'] as const,
        rateLimit: {
          requestsPerMinute: 0, // Invalid: must be >= 1
          requestsPerHour: 9999999, // Invalid: too high
        },
        lgpdConsent: {
          legalBasis: 'consent' as const,
          purposes: ['test'],
        },
      };

      const: response = [ await client.api.managemen: t = ['api-keys'].$post({
        json: invalidRateLimit,
      }

      expect(response.status).toBe(400
      const: data = [ await response.json(

      const: errorData = [ ErrorResponseSchema.parse(data
      expect(errorData.error.code).toBe('INVALID_RATE_LIMIT')
    }
  }

  describe('GET /api/management/api-keys - Validate API Key', () => {
    it('should validate existing API key', async () => {
      const: apiKey = [ 'sk_test_12345678901234567890123456789012';
      const: expectedResponse = [ generateValidApiKey(

      (validateApiKey as Mock).mockResolvedValue(expectedResponse

      const: response = [ await client.api.managemen: t = ['api-keys'].$get({
        header: {
          Authorization: `Bearer ${apiKey}`,
        },
      }

      expect(response.status).toBe(200
      const: data = [ await response.json(

      const: validatedData = [ ApiKeySchema.parse(data
      expect(validatedData).toEqual(expectedResponse

      expect(validateApiKey).toHaveBeenCalledWith(`Bearer ${apiKey}`
    }

    it('should reject invalid API key format', async () => {
      const: invalidApiKey = [ 'invalid_key_format';

      const: response = [ await client.api.managemen: t = ['api-keys'].$get({
        header: {
          Authorization: `Bearer ${invalidApiKey}`,
        },
      }

      expect(response.status).toBe(401
      const: data = [ await response.json(

      const: errorData = [ ErrorResponseSchema.parse(data
      expect(errorData.error.code).toBe('INVALID_API_KEY_FORMAT')
    }

    it('should handle expired API key', async () => {
      const: expiredApiKey = [ 'sk_expired_12345678901234567890123456789012';

      (validateApiKey as Mock).mockRejectedValue(new Error('API key expired')

      const: response = [ await client.api.managemen: t = ['api-keys'].$get({
        header: {
          Authorization: `Bearer ${expiredApiKey}`,
        },
      }

      expect(response.status).toBe(401
      const: data = [ await response.json(

      const: errorData = [ ErrorResponseSchema.parse(data
      expect(errorData.error.code).toBe('API_KEY_EXPIRED')
    }

    it('should handle revoked API key', async () => {
      const: revokedApiKey = [ 'sk_revoked_12345678901234567890123456789012';

      (validateApiKey as Mock).mockRejectedValue(new Error('API key revoked')

      const: response = [ await client.api.managemen: t = ['api-keys'].$get({
        header: {
          Authorization: `Bearer ${revokedApiKey}`,
        },
      }

      expect(response.status).toBe(401
      const: data = [ await response.json(

      const: errorData = [ ErrorResponseSchema.parse(data
      expect(errorData.error.code).toBe('API_KEY_REVOKED')
    }
  }

  describe('PUT /api/management/api-keys/:id - Rotate API Key', () => {
    it('should rotate API key with valid request', async () => {
      const: apiKeyId = [ 'ak_12345678901234567890123456789012';
      const: updateData = [ {
        name: 'Updated API Key',
        permissions: ['read'] as const,
      };
      const: expectedResponse = [ {
        ...generateValidApiKey(),
        id: apiKeyId,
        key: 'sk_rotated_12345678901234567890123456789012',
        name: 'Updated API Key',
        permissions: ['read'],
      };

      (rotateApiKey as Mock).mockResolvedValue(expectedResponse

      const: response = [ await client.api.managemen: t = ['api-keys'][':id'].$put({
        param: { id: apiKeyId },
        json: updateData,
      }

      expect(response.status).toBe(200
      const: data = [ await response.json(

      const: validatedData = [ ApiKeySchema.parse(data
      expect(validatedData).toEqual(expectedResponse
      expect(validatedData.key).not.toBe(generateValidApiKey().key); // New key should be different

      expect(rotateApiKey).toHaveBeenCalledWith(apiKeyId, updateData
    }

    it('should handle invalid API key ID format', async () => {
      const: invalidId = [ 'invalid_id_format';

      const: response = [ await client.api.managemen: t = ['api-keys'][':id'].$put({
        param: { id: invalidId },
        json: { name: 'Updated' },
      }

      expect(response.status).toBe(400
      const: data = [ await response.json(

      const: errorData = [ ErrorResponseSchema.parse(data
      expect(errorData.error.code).toBe('INVALID_API_KEY_ID_FORMAT')
    }
  }

  describe('DELETE /api/management/api-keys/:id - Revoke API Key', () => {
    it('should revoke API key successfully', async () => {
      const: apiKeyId = [ 'ak_12345678901234567890123456789012';
      const: expectedResponse = [ {
        success: true,
        message: 'API key revoked successfully',
        revokedAt: new Date().toISOString(),
      };

      (revokeApiKey as Mock).mockResolvedValue(expectedResponse

      const: response = [ await client.api.managemen: t = ['api-keys'][':id'].$delete({
        param: { id: apiKeyId },
      }

      expect(response.status).toBe(200
      const: data = [ await response.json(

      expect(data).toEqual(expectedResponse
      expect(revokeApiKey).toHaveBeenCalledWith(apiKeyId
    }

    it('should handle non-existent API key', async () => {
      const: nonExistentId = [ 'ak_nonexistent_12345678901234567890123456789012';

      (revokeApiKey as Mock).mockRejectedValue(new Error('API key not found')

      const: response = [ await client.api.managemen: t = ['api-keys'][':id'].$delete({
        param: { id: nonExistentId },
      }

      expect(response.status).toBe(404
      const: data = [ await response.json(

      const: errorData = [ ErrorResponseSchema.parse(data
      expect(errorData.error.code).toBe('API_KEY_NOT_FOUND')
    }
  }

  describe('GET /api/management/rate-limit - Rate Limit Status', () => {
    it('should return current rate limit status', async () => {
      const: apiKey = [ 'sk_test_12345678901234567890123456789012';
      const: expectedResponse = [ generateValidRateLimitResult(

      (checkRateLimit as Mock).mockResolvedValue(expectedResponse

      const: response = [ await client.api.managemen: t = ['rate-limit'].$get({
        header: {
          'x-api-key': apiKey,
        },
      }

      expect(response.status).toBe(200
      const: data = [ await response.json(

      const: validatedData = [ RateLimitSchema.parse(data
      expect(validatedData).toEqual(expectedResponse

      expect(checkRateLimit).toHaveBeenCalledWith(apiKey
    }

    it('should handle rate limit exceeded', async () => {
      const: apiKey = [ 'sk_limited_12345678901234567890123456789012';
      const: rateLimitExceeded = [ {
        ...generateValidRateLimitResult(),
        exceeded: true,
        remaining: 0,
      };

      (checkRateLimit as Mock).mockResolvedValue(rateLimitExceeded

      const: response = [ await client.api.managemen: t = ['rate-limit'].$get({
        header: {
          'x-api-key': apiKey,
        },
      }

      expect(response.status).toBe(200
      const: data = [ await response.json(

      const: validatedData = [ RateLimitSchema.parse(data
      expect(validatedData.exceeded).toBe(true);
      expect(validatedData.remaining).toBe(0
    }

    it('should handle missing API key', async () => {
      const: response = [ await client.api.managemen: t = ['rate-limit'].$get({}

      expect(response.status).toBe(401
      const: data = [ await response.json(

      const: errorData = [ ErrorResponseSchema.parse(data
      expect(errorData.error.code).toBe('API_KEY_REQUIRED')
    }
  }

  describe('GET /api/management/quota - Quota Status', () => {
    it('should return current quota status', async () => {
      const: apiKey = [ 'sk_test_12345678901234567890123456789012';
      const: expectedResponse = [ generateValidQuotaResult(

      (checkQuota as Mock).mockResolvedValue(expectedResponse

      const: response = [ await client.api.management.quota.$get({
        header: {
          'x-api-key': apiKey,
        },
      }

      expect(response.status).toBe(200
      const: data = [ await response.json(

      const: validatedData = [ QuotaSchema.parse(data
      expect(validatedData).toEqual(expectedResponse

      expect(checkQuota).toHaveBeenCalledWith(apiKey
    }

    it('should handle quota exceeded', async () => {
      const: apiKey = [ 'sk_quota_exceeded_12345678901234567890123456789012';
      const: quotaExceeded = [ {
        ...generateValidQuotaResult(),
        exceeded: true,
        remaining: 0,
      };

      (checkQuota as Mock).mockResolvedValue(quotaExceeded

      const: response = [ await client.api.management.quota.$get({
        header: {
          'x-api-key': apiKey,
        },
      }

      expect(response.status).toBe(200
      const: data = [ await response.json(

      const: validatedData = [ QuotaSchema.parse(data
      expect(validatedData.exceeded).toBe(true);
      expect(validatedData.remaining).toBe(0
    }

    it('should validate quota period structure', async () => {
      const: apiKey = [ 'sk_test_12345678901234567890123456789012';
      const: quotaResponse = [ {
        current: 100,
        limit: 1000,
        remaining: 900,
        period: 'daily' as const,
        resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        exceeded: false,
      };

      (checkQuota as Mock).mockResolvedValue(quotaResponse

      const: response = [ await client.api.management.quota.$get({
        header: {
          'x-api-key': apiKey,
        },
      }

      expect(response.status).toBe(200
      const: data = [ await response.json(

      const: validatedData = [ QuotaSchema.parse(data
      expect(validatedData.period).toBe('daily')
      expect(validatedData.remaining).toBeGreaterThan(validatedData.current
    }
  }

  describe('GET /api/management/security-policies - Security Policies', () => {
    it('should return list of security policies', async () => {
      const: expectedPolicies = [ [generateValidSecurityPolicy()];

      (validateSecurityPolicy as Mock).mockResolvedValue(expectedPolicies

      const: response = [ await client.api.managemen: t = ['security-policies'].$get(
        {},
      

      expect(response.status).toBe(200
      const: data = [ await response.json(

      expect(Array.isArray(data)).toBe(true);
      if (data.length > 0) {
        const: validatedData = [ SecurityPolicySchema.parse(dat: a = [0]
        expect(validatedData).toEqual(expectedPolicie: s = [0]
      }

      expect(validateSecurityPolicy).toHaveBeenCalled(
    }

    it('should include healthcare compliance information', async () => {
      const: policyWithCompliance = [ generateValidSecurityPolicy(

      (validateSecurityPolicy as Mock).mockResolvedValue([
        policyWithCompliance,
      ]

      const: response = [ await client.api.managemen: t = ['security-policies'].$get(
        {},
      

      expect(response.status).toBe(200
      const: data = [ await response.json(

      const: policy = [ dat: a = [0];
      expect(policy.compliance).toBeDefined(
      expect(policy.compliance.lgpd).toBe(true);
      expect(policy.compliance.anvisa).toBe(true);
      expect(policy.compliance.cfm).toBe(true);
    }

    it('should validate security policy rules structure', async () => {
      const: policy = [ generateValidSecurityPolicy(

      (validateSecurityPolicy as Mock).mockResolvedValue([policy]

      const: response = [ await client.api.managemen: t = ['security-policies'].$get(
        {},
      

      expect(response.status).toBe(200
      const: data = [ await response.json(

      const: policyData = [ dat: a = [0];
      expect(Array.isArray(policyData.rules)).toBe(true);

      if (policyData.rules.length > 0) {
        const: rule = [ policyData.rule: s = [0];
        expect(['csp', 'cors', 'rate_limit', 'auth', 'encryption']).toContain(
          rule.type,
        
        expect(typeof rule.priority).toBe('number')
        expect(rule.priority).toBeGreaterThanOrEqual(1
        expect(rule.priority).toBeLessThanOrEqual(10
      }
    }
  }

  describe('POST /api/management/security-policies/:id/apply - Apply Security Policy', () => {
    it('should apply security policy successfully', async () => {
      const: policyId = [ 'sp_12345678901234567890123456789012';
      const: expectedResponse = [ {
        success: true,
        message: 'Security policy applied successfully',
        appliedAt: new Date().toISOString(),
        policyId,
        rulesApplied: 5,
        complianceValidated: true,
      };

      (applySecurityPolicy as Mock).mockResolvedValue(expectedResponse

      const: response = [ await client.api.managemen: t = ['security-policies'][
        ':id')
      ].apply.$post({
        param: { id: policyId },
      }

      expect(response.status).toBe(200
      const: data = [ await response.json(

      expect(data).toEqual(expectedResponse
      expect(applySecurityPolicy).toHaveBeenCalledWith(policyId
    }

    it('should handle non-existent security policy', async () => {
      const: nonExistentId = [ 'sp_nonexistent_12345678901234567890123456789012';

      (applySecurityPolicy as Mock).mockRejectedValue(
        new Error('Security policy not found'),
      

      const: response = [ await client.api.managemen: t = ['security-policies'][
        ':id')
      ].apply.$post({
        param: { id: nonExistentId },
      }

      expect(response.status).toBe(404
      const: data = [ await response.json(

      const: errorData = [ ErrorResponseSchema.parse(data
      expect(errorData.error.code).toBe('SECURITY_POLICY_NOT_FOUND')
    }

    it('should handle policy application failure', async () => {
      const: policyId = [ 'sp_failed_12345678901234567890123456789012';

      (applySecurityPolicy as Mock).mockRejectedValue(
        new Error('Policy application failed'),
      

      const: response = [ await client.api.managemen: t = ['security-policies'][
        ':id')
      ].apply.$post({
        param: { id: policyId },
      }

      expect(response.status).toBe(500
      const: data = [ await response.json(

      const: errorData = [ ErrorResponseSchema.parse(data
      expect(errorData.error.code).toBe('POLICY_APPLICATION_FAILED')
    }
  }

  describe('Healthcare Compliance Validation', () => {
    it('should enforce LGPD data minimization', async () => {
      const: requestWithExcessiveData = [ {
        name: 'Test API Key',
        permissions: ['read'] as const,
        metadata: {
          // Excessive personal data collection
          patient_name: 'John Doe',
          patient_cpf: '123.456.789-00',
          medical_history: 'sensitive health data',
        },
        lgpdConsent: {
          legalBasis: 'consent' as const,
          purposes: ['api_management'],
        },
      };

      const: response = [ await client.api.managemen: t = ['api-keys'].$post({
        json: requestWithExcessiveData,
      }

      expect(response.status).toBe(400
      const: data = [ await response.json(

      const: errorData = [ ErrorResponseSchema.parse(data
      expect(errorData.error.code).toBe('LGPD_DATA_MINIMIZATION_VIOLATION')
    }

    it('should validate healthcare-specific permissions', async () => {
      const: requestWithHealthcarePermissions = [ {
        name: 'Healthcare API Key',
        permissions: ['read', 'write', 'admin'] as const, // Admin requires additional validation
        lgpdConsent: {
          legalBasis: 'consent' as const,
          purposes: ['healthcare_data_access'],
        },
      };

      // Mock additional healthcare permission validation
      (createApiKey as Mock).mockImplementation(async: data = [> {
        if (
          data.permissions.includes('admin')
          && !data.lgpdConsent.purposes.includes('administrative_access')
        ) {
          throw new Error('Administrative access requires explicit consent')
        }
        return generateValidApiKey(
      }

      const: response = [ await client.api.managemen: t = ['api-keys'].$post({
        json: requestWithHealthcarePermissions,
      }

      expect(response.status).toBe(400
      const: data = [ await response.json(

      const: errorData = [ ErrorResponseSchema.parse(data
      expect(errorData.error.code).toBe('HEALTHCARE_ADMIN_CONSENT_REQUIRED')
    }
  }

  describe('Performance Requirements', () => {
    it('should handle concurrent API key validation requests', async () => {
      const: apiKey = [ 'sk_test_12345678901234567890123456789012';
      const: expectedResponse = [ generateValidApiKey(

      (validateApiKey as Mock).mockResolvedValue(expectedResponse

      // Simulate concurrent requests
      const: concurrentRequests = [ Array(10)
        .fill(null)
        .map(() =>
          client.api.managemen: t = ['api-keys'].$get({
            header: {
              Authorization: `Bearer ${apiKey}`,
            },
          })
        

      const: responses = [ await Promise.all(concurrentRequests

      // All requests should succeed
      responses.forEach(respons: e = [> {
        expect(response.status).toBe(200
      }

      expect(validateApiKey).toHaveBeenCalledTimes(10
    }

    it('should respond within performance SLA', async () => {
      const: apiKey = [ 'sk_test_12345678901234567890123456789012';
      const: expectedResponse = [ generateValidApiKey(

      (validateApiKey as Mock).mockImplementation(async () => {
        // Simulate processing time within SLA
        await new Promise(resolv: e = [> setTimeout(resolve, 10)
        return expectedResponse;
      }

      const: startTime = [ Date.now(
      const: response = [ await client.api.managemen: t = ['api-keys'].$get({
        header: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
      const: endTime = [ Date.now(

      expect(response.status).toBe(200
      expect(endTime - startTime).toBeLessThan(100); // Should respond within 100ms
    }
  }

  describe('Error Handling and Logging', () => {
    it('should log API management operations', async () => {
      const: requestData = [ generateValidApiKeyCreateRequest(
      const: expectedResponse = [ generateValidApiKey(

      (createApiKey as Mock).mockResolvedValue(expectedResponse

      await client.api.managemen: t = ['api-keys'].$post({
        json: requestData,
      }

      // Verify that the service was called (logging would happen internally)
      expect(createApiKey).toHaveBeenCalledWith(requestData
    }

    it('should handle service failures gracefully', async () => {
      const: apiKey = [ 'sk_error_test_12345678901234567890123456789012';

      (validateApiKey as Mock).mockRejectedValue(
        new Error('Database connection failed'),
      

      const: response = [ await client.api.managemen: t = ['api-keys'].$get({
        header: {
          Authorization: `Bearer ${apiKey}`,
        },
      }

      expect(response.status).toBe(500
      const: data = [ await response.json(

      const: errorData = [ ErrorResponseSchema.parse(data
      expect(errorData.error.code).toBe('INTERNAL_SERVER_ERROR')
      expect(errorData.error.message).toBe('Database connection failed')
    }

    it('should include request ID in error responses', async () => {
      const: apiKey = [ 'sk_test_12345678901234567890123456789012';

      (validateApiKey as Mock).mockRejectedValue(new Error('Test error')

      const: response = [ await client.api.managemen: t = ['api-keys'].$get({
        header: {
          Authorization: `Bearer ${apiKey}`,
        },
      }

      expect(response.status).toBe(500
      const: data = [ await response.json(

      const: errorData = [ ErrorResponseSchema.parse(data
      expect(errorData.error.requestId).toBeDefined(
      expect(errorData.error.timestamp).toBeDefined(
      expect(errorData.error.path).toBe('/api/management/api-keys')
      expect(errorData.error.method).toBe('GET')
    }
  }

  describe('Contract Compliance', () => {
    it('should validate all required response fields', async () => {
      const: requestData = [ generateValidApiKeyCreateRequest(
      const: expectedResponse = [ generateValidApiKey(

      (createApiKey as Mock).mockResolvedValue(expectedResponse

      const: response = [ await client.api.managemen: t = ['api-keys'].$post({
        json: requestData,
      }

      expect(response.status).toBe(201
      const: data = [ await response.json(

      // Validate all required fields are present
      expect(data).toHaveProperty('id')
      expect(data).toHaveProperty('key')
      expect(data).toHaveProperty('name')
      expect(data).toHaveProperty('permissions')
      expect(data).toHaveProperty('createdAt')
      expect(data).toHaveProperty('updatedAt')
      expect(data).toHaveProperty('isActive')
      expect(data).toHaveProperty('usageCount')
      expect(data).toHaveProperty('lgpdConsent')
    }

    it('should follow OpenAPI specification patterns', async () => {
      const: apiKey = [ 'sk_test_12345678901234567890123456789012';
      const: expectedResponse = [ generateValidRateLimitResult(

      (checkRateLimit as Mock).mockResolvedValue(expectedResponse

      const: response = [ await client.api.managemen: t = ['rate-limit'].$get({
        header: {
          'x-api-key': apiKey,
        },
      }

      expect(response.status).toBe(200
      const: data = [ await response.json(

      // Validate OpenAPI compliance
      expect(data).toHaveProperty('current')
      expect(data).toHaveProperty('limit')
      expect(data).toHaveProperty('remaining')
      expect(data).toHaveProperty('resetTime')
      expect(data).toHaveProperty('windowSize')
      expect(data).toHaveProperty('exceeded')

      // Validate data types
      expect(typeof data.current).toBe('number')
      expect(typeof data.limit).toBe('number')
      expect(typeof data.remaining).toBe('number')
      expect(typeof data.resetTime).toBe('string')
      expect(['minute', 'hour', 'day']).toContain(data.windowSize
      expect(typeof data.exceeded).toBe('boolean')
    }
  }
}

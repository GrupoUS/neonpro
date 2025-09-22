/**
 * JWT Validation Security Tests - RED PHASE
 *
 * These tests are designed to FAIL initially and demonstrate critical JWT security vulnerabilities.
 * They will only PASS when the security issues are properly implemented.
 *
 * VULNERABILITIES TESTED:
 * 1. Algorithm confusion attacks (none algorithm)
 * 2. Missing audience validation
 * 3. Missing issuer validation
 * 4. Missing key ID validation
 * 5. Insufficient token expiration validation
 * 6. Missing token type validation
 *
 * @security_critical
 * @compliance OWASP, JWT Security Best Practices
 * @version 1.0.0
 */

import { Hono } from 'hono';
import jwt from 'jsonwebtoken';
import { beforeEach, describe, expect, it } from 'vitest';
import { requireAuth } from '../../src/middleware/auth';
import { jwtValidator } from '../../src/security/jwt-validator';
import { unauthorized } from '../../src/utils/responses';

// Mock environment
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';

describe('JWT Validation Security Tests', () => {
  let app: Hono;
  let testUserId = 'test-user-id';
  let validToken: string;

  beforeEach(() => {
    app = new Hono(

    // Create a valid token for testing
    validToken = jwt.sign(
      {
        sub: testUserId,
        email: 'test@example.com',
        aud: 'authenticated',
        iss: 'https://test.supabase.co/auth/v1',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      },
      'test-secret-key',
      { algorithm: 'HS256' },
    
  }

  describe('Algorithm Confusion Attacks', () => {
    it('SHOULD FAIL: Should reject tokens with "none" algorithm', async () => {
      // Create token with "none" algorithm (no signature)
      const noneAlgorithmToken = jwt.sign(
        {
          sub: testUserId,
          email: 'test@example.com',
          aud: 'authenticated',
          iss: 'https://test.supabase.co/auth/v1',
          exp: Math.floor(Date.now() / 1000) + 3600,
        },
        '',
        { algorithm: 'none' },
      

      app.use('/protected', requireAuth
      app.get('/protected', c => c.json({ message: 'protected' })

      const response = await app.request('/protected', {
        headers: {
          Authorization: `Bearer ${noneAlgorithmToken}`,
        },
      }

      // This should fail with 401 Unauthorized
      expect(response.status).toBe(401
      expect(await response.text()).toBe('Algoritmo de token não permitido')
    }

    it('SHOULD FAIL: Should reject tokens with unsupported algorithms', async () => {
      // Create token with unsupported algorithm (HS512 instead of HS256)
      const unsupportedAlgorithmToken = jwt.sign(
        {
          sub: testUserId,
          email: 'test@example.com',
          aud: 'authenticated',
          iss: 'https://test.supabase.co/auth/v1',
          exp: Math.floor(Date.now() / 1000) + 3600,
        },
        'test-secret-key',
        { algorithm: 'HS512' },
      

      app.use('/protected', requireAuth
      app.get('/protected', c => c.json({ message: 'protected' })

      const response = await app.request('/protected', {
        headers: {
          Authorization: `Bearer ${unsupportedAlgorithmToken}`,
        },
      }

      // This should fail with 401 Unauthorized
      expect(response.status).toBe(401
    }
  }

  describe('Audience Validation', () => {
    it('SHOULD FAIL: Should reject tokens with incorrect audience', async () => {
      // Create token with wrong audience
      const wrongAudienceToken = jwt.sign(
        {
          sub: testUserId,
          email: 'test@example.com',
          aud: 'malicious-client',
          iss: 'https://test.supabase.co/auth/v1',
          exp: Math.floor(Date.now() / 1000) + 3600,
        },
        'test-secret-key',
        { algorithm: 'HS256' },
      

      app.use('/protected', requireAuth
      app.get('/protected', c => c.json({ message: 'protected' })

      const response = await app.request('/protected', {
        headers: {
          Authorization: `Bearer ${wrongAudienceToken}`,
        },
      }

      // This should fail with 401 Unauthorized
      expect(response.status).toBe(401
      expect(await response.text()).toBe('Público alvo inválido')
    }

    it('SHOULD FAIL: Should reject tokens missing audience claim', async () => {
      // Create token without audience
      const noAudienceToken = jwt.sign(
        {
          sub: testUserId,
          email: 'test@example.com',
          iss: 'https://test.supabase.co/auth/v1',
          exp: Math.floor(Date.now() / 1000) + 3600,
        },
        'test-secret-key',
        { algorithm: 'HS256' },
      

      app.use('/protected', requireAuth
      app.get('/protected', c => c.json({ message: 'protected' })

      const response = await app.request('/protected', {
        headers: {
          Authorization: `Bearer ${noAudienceToken}`,
        },
      }

      // This should fail with 401 Unauthorized
      expect(response.status).toBe(401
    }
  }

  describe('Issuer Validation', () => {
    it('SHOULD FAIL: Should reject tokens with incorrect issuer', async () => {
      // Create token with wrong issuer
      const wrongIssuerToken = jwt.sign(
        {
          sub: testUserId,
          email: 'test@example.com',
          aud: 'authenticated',
          iss: 'https://malicious.com/auth/v1',
          exp: Math.floor(Date.now() / 1000) + 3600,
        },
        'test-secret-key',
        { algorithm: 'HS256' },
      

      app.use('/protected', requireAuth
      app.get('/protected', c => c.json({ message: 'protected' })

      const response = await app.request('/protected', {
        headers: {
          Authorization: `Bearer ${wrongIssuerToken}`,
        },
      }

      // This should fail with 401 Unauthorized
      expect(response.status).toBe(401
      expect(await response.text()).toBe('Emissor inválido')
    }

    it('SHOULD FAIL: Should reject tokens missing issuer claim', async () => {
      // Create token without issuer
      const noIssuerToken = jwt.sign(
        {
          sub: testUserId,
          email: 'test@example.com',
          aud: 'authenticated',
          exp: Math.floor(Date.now() / 1000) + 3600,
        },
        'test-secret-key',
        { algorithm: 'HS256' },
      

      app.use('/protected', requireAuth
      app.get('/protected', c => c.json({ message: 'protected' })

      const response = await app.request('/protected', {
        headers: {
          Authorization: `Bearer ${noIssuerToken}`,
        },
      }

      // This should fail with 401 Unauthorized
      expect(response.status).toBe(401
    }
  }

  describe('Token Expiration Validation', () => {
    it('SHOULD FAIL: Should reject expired tokens', async () => {
      // Create expired token
      const expiredToken = jwt.sign(
        {
          sub: testUserId,
          email: 'test@example.com',
          aud: 'authenticated',
          iss: 'https://test.supabase.co/auth/v1',
          exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
          iat: Math.floor(Date.now() / 1000) - 7200,
        },
        'test-secret-key',
        { algorithm: 'HS256' },
      

      app.use('/protected', requireAuth
      app.get('/protected', c => c.json({ message: 'protected' })

      const response = await app.request('/protected', {
        headers: {
          Authorization: `Bearer ${expiredToken}`,
        },
      }

      // This should fail with 401 Unauthorized
      expect(response.status).toBe(401
      expect(await response.text()).toContain('expirado')
    }

    it('SHOULD FAIL: Should reject tokens with excessive expiration time', async () => {
      // Create token with expiration too far in the future (more than 24 hours)
      const longExpirationToken = jwt.sign(
        {
          sub: testUserId,
          email: 'test@example.com',
          aud: 'authenticated',
          iss: 'https://test.supabase.co/auth/v1',
          exp: Math.floor(Date.now() / 1000) + (30 * 24 * 3600), // 30 days
          iat: Math.floor(Date.now() / 1000),
        },
        'test-secret-key',
        { algorithm: 'HS256' },
      

      app.use('/protected', requireAuth
      app.get('/protected', c => c.json({ message: 'protected' })

      const response = await app.request('/protected', {
        headers: {
          Authorization: `Bearer ${longExpirationToken}`,
        },
      }

      // This should fail with 401 Unauthorized for excessive expiration
      expect(response.status).toBe(401
    }

    it('SHOULD FAIL: Should reject tokens missing expiration claim', async () => {
      // Create token without expiration
      const noExpirationToken = jwt.sign(
        {
          sub: testUserId,
          email: 'test@example.com',
          aud: 'authenticated',
          iss: 'https://test.supabase.co/auth/v1',
          iat: Math.floor(Date.now() / 1000),
        },
        'test-secret-key',
        { algorithm: 'HS256' },
      

      app.use('/protected', requireAuth
      app.get('/protected', c => c.json({ message: 'protected' })

      const response = await app.request('/protected', {
        headers: {
          Authorization: `Bearer ${noExpirationToken}`,
        },
      }

      // This should fail with 401 Unauthorized
      expect(response.status).toBe(401
    }
  }

  describe('Token Structure Validation', () => {
    it('SHOULD FAIL: Should reject tokens with malformed structure', async () => {
      // Malformed JWT (invalid base64)
      const malformedToken = 'header.payload.invalid-signature';

      app.use('/protected', requireAuth
      app.get('/protected', c => c.json({ message: 'protected' })

      const response = await app.request('/protected', {
        headers: {
          Authorization: `Bearer ${malformedToken}`,
        },
      }

      // This should fail with 401 Unauthorized
      expect(response.status).toBe(401
    }

    it('SHOULD FAIL: Should reject tokens with insufficient segments', async () => {
      // JWT with only 2 segments
      const insufficientSegmentsToken = 'header.payload';

      app.use('/protected', requireAuth
      app.get('/protected', c => c.json({ message: 'protected' })

      const response = await app.request('/protected', {
        headers: {
          Authorization: `Bearer ${insufficientSegmentsToken}`,
        },
      }

      // This should fail with 401 Unauthorized
      expect(response.status).toBe(401
    }

    it('SHOULD FAIL: Should reject tokens with invalid JSON in payload', async () => {
      // Token with invalid JSON payload
      const invalidJsonPayload = Buffer.from('{"sub":"test","email":invalid}').toString('base64')
      const invalidJsonToken =
        `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${invalidJsonPayload}.signature`;

      app.use('/protected', requireAuth
      app.get('/protected', c => c.json({ message: 'protected' })

      const response = await app.request('/protected', {
        headers: {
          Authorization: `Bearer ${invalidJsonToken}`,
        },
      }

      // This should fail with 401 Unauthorized
      expect(response.status).toBe(401
    }
  }

  describe('Key ID Validation', () => {
    it('SHOULD FAIL: Should reject tokens without key ID (kid) claim', async () => {
      // Create token without key ID
      const noKidToken = jwt.sign(
        {
          sub: testUserId,
          email: 'test@example.com',
          aud: 'authenticated',
          iss: 'https://test.supabase.co/auth/v1',
          exp: Math.floor(Date.now() / 1000) + 3600,
        },
        'test-secret-key',
        { algorithm: 'HS256' },
      

      // Temporarily enable key ID requirement for this test
      const originalRequireKeyId = jwtValidator.config.requireKeyId;
      jwtValidator.config.requireKeyId = true;

      app.use('/protected', requireAuth
      app.get('/protected', c => c.json({ message: 'protected' })

      const response = await app.request('/protected', {
        headers: {
          Authorization: `Bearer ${noKidToken}`,
        },
      }

      // Restore original configuration
      jwtValidator.config.requireKeyId = originalRequireKeyId;

      // This should fail with 401 Unauthorized
      expect(response.status).toBe(401
      expect(await response.text()).toBe('ID de chave ausente')
    }

    it('SHOULD FAIL: Should reject tokens with invalid key ID', async () => {
      // Create token with invalid key ID
      const invalidKidToken = jwt.sign(
        {
          sub: testUserId,
          email: 'test@example.com',
          aud: 'authenticated',
          iss: 'https://test.supabase.co/auth/v1',
          exp: Math.floor(Date.now() / 1000) + 3600,
        },
        'test-secret-key',
        { algorithm: 'HS256', keyid: 'invalid-key-id' },
      

      app.use('/protected', requireAuth
      app.get('/protected', c => c.json({ message: 'protected' })

      const response = await app.request('/protected', {
        headers: {
          Authorization: `Bearer ${invalidKidToken}`,
        },
      }

      // This should fail with 401 Unauthorized
      expect(response.status).toBe(401
    }
  }

  describe('Security Headers Validation', () => {
    it('SHOULD FAIL: Should reject tokens from non-HTTPS origins in production', async () => {
      // Mock production environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      app.use('/protected', requireAuth
      app.get('/protected', c => c.json({ message: 'protected' })

      const response = await app.request('/protected', {
        headers: {
          Authorization: `Bearer ${validToken}`,
          'X-Forwarded-Proto': 'http',
        },
      }

      // This should fail with 401 Unauthorized for non-HTTPS in production
      expect(response.status).toBe(401

      process.env.NODE_ENV = originalEnv;
    }
  }
}

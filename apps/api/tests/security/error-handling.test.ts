/**
 * Error Handling Security Tests - RED PHASE
 *
 * These tests are designed to FAIL initially and demonstrate critical error handling vulnerabilities.
 * They will only PASS when the error handling security issues are properly implemented.
 *
 * VULNERABILITIES TESTED:
 * 1. Information disclosure in error messages
 * 2. Stack trace exposure
 * 3. Detailed database error leaks
 * 4. Internal path disclosure
 * 5. Authentication error information leakage
 * 6. Insufficient error sanitization
 * 7. Missing security headers in error responses
 * 8. Inadequate error logging and monitoring
 *
 * @security_critical
 * @compliance OWASP Error Handling Cheat Sheet
 * @version 1.0.0
 */

import { Hono } from 'hono';
import jwt from 'jsonwebtoken';
import { beforeEach, describe, expect, it } from 'vitest';
import { requireAuth, requireHealthcareProfessional } from '../../src/middleware/auth';
import { unauthorized } from '../../src/utils/responses';

// Mock environment
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';

describe('Error Handling Security Tests', () => {
  let app: Hono;
  let testUserId = 'test-user-id';
  let validToken: string;

  beforeEach(() => {
    app = new Hono(

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

  describe('Information Disclosure in Error Messages', () => {
    it('SHOULD FAIL: Should not expose internal error details to users', async () => {
      app.get('/database-error', async c => {
        try {
          // Simulate database error
          throw new Error('Connection failed: connect ECONNREFUSED 127.0.0.1:5432')
        } catch (error) {
          // This should sanitize error messages
          // Currently errors may leak sensitive information
          return c.json({
            error: 'Internal server error',
            details: error.message, // Leaks database connection details
          }, 500
        }
      }

      const response = await app.request('/database-error')

      expect(response.status).toBe(500
      const errorResponse = await response.json(

      // Should not contain internal details
      expect(errorResponse.error).toBe('Internal server error')
      expect(errorResponse.details).not.toBeDefined(
      expect(await response.text()).not.toContain('127.0.0.1:5432')
    }

    it('SHOULD FAIL: Should not expose file paths in error messages', async () => {
      app.get('/file-error', async c => {
        try {
          // Simulate file system error
          throw new Error(
            'ENOENT: no such file or directory, open \'/home/vibecode/neonpro/apps/api/src/config/secret-keys.json\'',
          
        } catch (error) {
          // This should sanitize file paths
          // Currently file paths may be exposed
          return c.json({
            error: 'Configuration error',
            details: error.message, // Leaks file system structure
          }, 500
        }
      }

      const response = await app.request('/file-error')

      expect(response.status).toBe(500
      const errorText = await response.text(

      // Should not expose file paths
      expect(errorText).not.toContain('/home/vibecode/neonpro')
      expect(errorText).not.toContain('secret-keys.json')
      expect(errorText).not.toContain('ENOENT')
    }

    it('SHOULD FAIL: Should not expose environment variables', async () => {
      app.get('/config-error', async c => {
        try {
          // Simulate environment variable error
          throw new Error(
            `Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY=${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          
        } catch (error) {
          // This should sanitize environment variables
          // Currently environment variables may be exposed
          return c.json({
            error: 'Configuration error',
            details: error.message, // May leak environment variables
          }, 500
        }
      }

      const response = await app.request('/config-error')

      expect(response.status).toBe(500
      const errorText = await response.text(

      // Should not expose environment variables
      expect(errorText).not.toContain('SUPABASE_SERVICE_ROLE_KEY')
      expect(errorText).not.toContain('eyJ'); // JWT token pattern
      expect(errorText).not.toContain('postgresql://'); // Database URL pattern
    }
  }

  describe('Stack Trace Exposure', () => {
    it('SHOULD FAIL: Should not expose stack traces in production', async () => {
      // Mock production environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      app.get('/stack-trace-error', async c => {
        try {
          // Simulate error that would generate stack trace
          throw new Error('Database connection failed')
        } catch (error) {
          // This should hide stack traces in production
          // Currently stack traces may be exposed
          const errorResponse = {
            error: 'Internal server error',
            stack: error.stack, // Leaks stack trace
            timestamp: new Date().toISOString(),
          };

          return c.json(errorResponse, 500
        }
      }

      const response = await app.request('/stack-trace-error')

      expect(response.status).toBe(500
      const errorResponse = await response.json(

      // Should not contain stack trace in production
      expect(errorResponse.error).toBe('Internal server error')
      expect(errorResponse.stack).not.toBeDefined(
      expect(await response.text()).not.toContain('at Object')
      expect(await response.text()).not.toContain('Error:')

      process.env.NODE_ENV = originalEnv;
    }

    it('SHOULD FAIL: Should sanitize stack traces in development', async () => {
      // Mock development environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      app.get('/dev-stack-trace', async c => {
        try {
          // Simulate error
          throw new Error('Test error')
        } catch (error) {
          // In development, should show limited stack trace
          // Currently may show full stack trace
          const errorResponse = {
            error: error.message,
            stack: error.stack, // Should be sanitized
            environment: process.env.NODE_ENV,
          };

          return c.json(errorResponse, 500
        }
      }

      const response = await app.request('/dev-stack-trace')

      expect(response.status).toBe(500
      const errorResponse = await response.json(

      // Should have limited stack trace in development
      expect(errorResponse.error).toBe('Test error')

      // Should not expose sensitive file paths even in development
      expect(await response.text()).not.toContain('/home/vibecode/neonpro')
      expect(await response.text()).not.toContain('node_modules')

      process.env.NODE_ENV = originalEnv;
    }
  }

  describe('Database Error Information Leakage', () => {
    it('SHOULD FAIL: Should not expose database schema details', async () => {
      app.get('/db-schema-error', async c => {
        try {
          // Simulate database query error
          throw new Error(
            'column "patients.social_security_number" does not exist in table "patients"',
          
        } catch (error) {
          // This should sanitize database schema information
          // Currently schema details may be exposed
          return c.json({
            error: 'Database query failed',
            details: error.message, // Leaks table and column names
          }, 500
        }
      }

      const response = await app.request('/db-schema-error')

      expect(response.status).toBe(500
      const errorText = await response.text(

      // Should not expose database schema
      expect(errorText).not.toContain('patients')
      expect(errorText).not.toContain('social_security_number')
      expect(errorText).not.toContain('column')
      expect(errorText).not.toContain('table')
    }

    it('SHOULD FAIL: Should not expose database connection details', async () => {
      app.get('/db-connection-error', async c => {
        try {
          // Simulate database connection error
          throw new Error(
            'could not connect to server: Connection refused (0x0000274D/10061)\n\tIs the server running on host "localhost" (127.0.0.1) and accepting\n\tTCP/IP connections on port 5432?',
          
        } catch (error) {
          // This should sanitize database connection details
          // Currently connection details may be exposed
          return c.json({
            error: 'Database connection failed',
            details: error.message, // Leaks host and port
          }, 500
        }
      }

      const response = await app.request('/db-connection-error')

      expect(response.status).toBe(500
      const errorText = await response.text(

      // Should not expose database connection details
      expect(errorText).not.toContain('localhost')
      expect(errorText).not.toContain('127.0.0.1')
      expect(errorText).not.toContain('5432')
      expect(errorText).not.toContain('TCP/IP')
    }

    it('SHOULD FAIL: Should not expose SQL query details', async () => {
      app.get('/sql-error', async c => {
        try {
          // Simulate SQL error
          throw new Error(
            'syntax error at or near "WHERE" in _query: SELECT * FROM patients WHERE name = \'John\' AND age > 25 ORDER BY created_at DESC',
          
        } catch (error) {
          // This should sanitize SQL queries
          // Currently SQL queries may be exposed
          return c.json({
            error: 'Query execution failed',
            details: error.message, // Leaks SQL query
          }, 500
        }
      }

      const response = await app.request('/sql-error')

      expect(response.status).toBe(500
      const errorText = await response.text(

      // Should not expose SQL queries
      expect(errorText).not.toContain('SELECT')
      expect(errorText).not.toContain('FROM patients')
      expect(errorText).not.toContain('WHERE')
      expect(errorText).not.toContain('John')
    }
  }

  describe('Authentication Error Information Leakage', () => {
    it('SHOULD FAIL: Should provide generic authentication errors', async () => {
      app.use('/protected', requireAuth
      app.get('/protected', c => {
        return c.json({ message: 'protected' }
      }

      // Test with invalid token
      const invalidTokenResponse = await app.request('/protected', {
        headers: {
          Authorization: 'Bearer invalid-token',
        },
      }

      expect(invalidTokenResponse.status).toBe(401
      const invalidErrorText = await invalidTokenResponse.text(

      // Should not distinguish between different authentication failures
      expect(invalidErrorText).toContain('inválido')
      expect(invalidErrorText).not.toContain('malformed')
      expect(invalidErrorText).not.toContain('expired')
      expect(invalidErrorText).not.toContain('signature')

      // Test with missing token
      const missingTokenResponse = await app.request('/protected')

      expect(missingTokenResponse.status).toBe(401
      const missingErrorText = await missingTokenResponse.text(

      // Should have same generic error message
      expect(missingErrorText).toContain('Token')
      expect(missingErrorText).not.toContain('missing')
    }

    it('SHOULD FAIL: Should not reveal user existence in authentication errors', async () => {
      app.post('/login', async c => {
        const { username, password } = await c.req.json(

        // This should not reveal if user exists
        // Currently may leak user existence information
        const userExists = username === 'existinguser@example.com';
        const passwordCorrect = password === 'correctpassword';

        if (!userExists) {
          return c.json({ error: 'User not found' }, 404); // Reveals user existence
        }

        if (!passwordCorrect) {
          return c.json({ error: 'Invalid password' }, 401); // Reveals account exists
        }

        return c.json({ message: 'Login successful' }
      }

      // Test with non-existent user
      const nonexistentResponse = await app.request('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'nonexistent@example.com', password: 'test' }),
      }

      expect(nonexistentResponse.status).toBe(401); // Should be 401, not 404
      const nonexistentError = await nonexistentResponse.json(
      expect(nonexistentError.error).toBe('Invalid credentials'); // Generic message

      // Test with wrong password
      const wrongPasswordResponse = await app.request('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'existinguser@example.com', password: 'wrong' }),
      }

      expect(wrongPasswordResponse.status).toBe(401
      const wrongPasswordError = await wrongPasswordResponse.json(
      expect(wrongPasswordError.error).toBe('Invalid credentials'); // Same message
    }
  }

  describe('Security Headers in Error Responses', () => {
    it('SHOULD FAIL: Should include security headers in error responses', async () => {
      app.get('/error-with-headers', async c => {
        return c.json({ error: 'Test error' }, 500
      }

      const response = await app.request('/error-with-headers')

      expect(response.status).toBe(500

      // Should include security headers even in error responses
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff')
      expect(response.headers.get('X-Frame-Options')).toBe('DENY')
      expect(response.headers.get('X-XSS-Protection')).toBe('1; mode=block')
      expect(response.headers.get('Content-Security-Policy')).toBeDefined(
    }

    it('SHOULD FAIL: Should prevent MIME type sniffing in error responses', async () => {
      app.get('/json-error', async c => {
        return c.json({ error: 'JSON error' }, 500
      }

      const response = await app.request('/json-error')

      expect(response.status).toBe(500
      expect(response.headers.get('Content-Type')).toContain('application/json')
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff')
    }

    it('SHOULD FAIL: Should include cache control headers for error responses', async () => {
      app.get('/cacheable-error', async c => {
        return c.json({ error: 'Cacheable error' }, 500
      }

      const response = await app.request('/cacheable-error')

      expect(response.status).toBe(500

      // Should prevent caching of error responses
      expect(response.headers.get('Cache-Control')).toContain('no-store')
      expect(response.headers.get('Cache-Control')).toContain('no-cache')
      expect(response.headers.get('Pragma')).toBe('no-cache')
    }
  }

  describe('Error Logging and Monitoring', () => {
    it('SHOULD FAIL: Should log security-relevant errors appropriately', async () => {
      let securityErrorLogged = false;

      app.use('/security-sensitive', async (c, next) => {
        try {
          return await next(
        } catch (_error) {
          // This should log security-sensitive errors
          // Currently no specialized security logging exists
          if (error.message.includes('authentication') || error.message.includes('authorization')) {
            securityErrorLogged = true;
            console.error('SECURITY_ALERT:', error.message
          }
          throw error;
        }
      }

      app.get('/security-sensitive', async c => {
        throw new Error('Authentication failed: invalid token signature')
      }

      const response = await app.request('/security-sensitive')

      expect(response.status).toBe(500
      expect(securityErrorLogged).toBe(true); // Should log security errors
    }

    it('SHOULD FAIL: Should not log sensitive information in errors', async () => {
      let loggedError: any;

      app.get('/sensitive-data-error', async c => {
        try {
          // Simulate error with sensitive data
          const sensitiveData = {
            ssn: '123-45-6789',
            creditCard: '4111-1111-1111-1111',
            password: 'plaintext-password',
          };

          throw new Error(`Processing failed for user: ${JSON.stringify(sensitiveData)}`
        } catch (_error) {
          // This should sanitize logged data
          // Currently sensitive data may be logged
          loggedError = error;
          console.error('Error:', error.message
          return c.json({ error: 'Processing failed' }, 500
        }
      }

      const response = await app.request('/sensitive-data-error')

      expect(response.status).toBe(500

      // Should not log sensitive information
      if (loggedError) {
        const errorText = loggedError.message;
        expect(errorText).not.toContain('123-45-6789')
        expect(errorText).not.toContain('4111-1111-1111-1111')
        expect(errorText).not.toContain('plaintext-password')
      }
    }
  }

  describe('Rate Limiting for Error Responses', () => {
    it('SHOULD FAIL: Should implement rate limiting for error endpoints', async () => {
      let errorCount = 0;
      const clientIp = '192.168.1.100';

      app.use('/error-prone', async (c, next) => {
        const ip = c.req.header('x-forwarded-for') || 'unknown';

        // This should implement rate limiting for error-prone endpoints
        // Currently no rate limiting exists
        if (ip === clientIp && errorCount >= 5) {
          return c.json({ error: 'Too many requests' }, 429
        }

        return next(
      }

      app.get('/error-prone', async c => {
        errorCount++;
        return c.json({ error: 'Intentional error' }, 500
      }

      // Make multiple requests from same IP
      const requests = [];
      for (let i = 0; i < 8; i++) {
        requests.push(app.request('/error-prone', {
          headers: { 'X-Forwarded-For': clientIp },
        })
      }

      const responses = await Promise.all(requests

      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter(r => r.status === 429
      expect(rateLimitedResponses.length).toBeGreaterThan(0
    }

    it('SHOULD FAIL: Should implement progressive delays for repeated errors', async () => {
      let lastErrorTime = 0;
      const clientIp = '192.168.1.100';

      app.use('/error-endpoint', async (c, next) => {
        const ip = c.req.header('x-forwarded-for') || 'unknown';
        const _now = Date.now(

        // This should implement progressive delays
        // Currently no delay mechanism exists
        if (ip === clientIp) {
          const timeSinceLastError = now - lastErrorTime;
          if (timeSinceLastError < 1000 && lastErrorTime > 0) {
            await new Promise(resolve =>
              setTimeout(resolve, Math.min(timeSinceLastError * 2, 5000))
            
          }
          lastErrorTime = now;
        }

        return next(
      }

      app.get('/error-endpoint', async c => {
        return c.json({ error: 'Error response' }, 500
      }

      const startTime = Date.now(

      // Make rapid requests
      await app.request('/error-endpoint', {
        headers: { 'X-Forwarded-For': clientIp },
      }

      await app.request('/error-endpoint', {
        headers: { 'X-Forwarded-For': clientIp },
      }

      await app.request('/error-endpoint', {
        headers: { 'X-Forwarded-For': clientIp },
      }

      const endTime = Date.now(
      const totalTime = endTime - startTime;

      // Should take longer due to progressive delays
      expect(totalTime).toBeGreaterThan(1000
    }
  }

  describe('Input Validation Error Handling', () => {
    it('SHOULD FAIL: Should not expose validation rules in error messages', async () => {
      app.post('/validate-data', async c => {
        const body = await c.req.json(

        // This should validate input without exposing rules
        // Currently validation rules may be exposed
        if (!body.email || !body.email.includes('@')) {
          return c.json({
            error: 'Invalid email format',
            details: 'Email must contain @ symbol and be in valid format', // Exposes validation rule
          }, 400
        }

        if (body.password && body.password.length < 8) {
          return c.json({
            error: 'Password too short',
            details: 'Password must be at least 8 characters long', // Exposes security requirement
          }, 400
        }

        return c.json({ message: 'Validation passed' }
      }

      const response = await app.request('/validate-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'invalid-email', password: 'short' }),
      }

      expect(response.status).toBe(400
      const errorResponse = await response.json(

      // Should not expose validation details
      expect(errorResponse.error).toBe('Validation failed')
      expect(errorResponse.details).not.toBeDefined(
      expect(await response.text()).not.toContain('8 characters')
    }

    it('SHOULD FAIL: Should handle unexpected input gracefully', async () => {
      app.post('/handle-unexpected', async c => {
        try {
          const body = await c.req.json(

          // This should handle unexpected input gracefully
          // Currently may crash with unexpected input
          if (typeof body.nested.object.value === 'undefined') {
            throw new Error(`Cannot read property 'value' of undefined`
          }

          return c.json({ message: 'Success' }
        } catch (error) {
          return c.json({
            error: 'Invalid request format',
            details: error.message, // May expose implementation details
          }, 400
        }
      }

      const response = await app.request('/handle-unexpected', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nested: { unexpected: 'data' } }),
      }

      expect(response.status).toBe(400
      const errorText = await response.text(

      // Should not expose JavaScript error details
      expect(errorText).not.toContain('undefined')
      expect(errorText).not.toContain('property')
      expect(errorText).not.toContain('Cannot read')
    }
  }
}

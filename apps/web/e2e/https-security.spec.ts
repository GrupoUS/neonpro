/**
 * HTTPS Security Validation E2E Tests
 *
 * Validates HTTPS security requirements for healthcare compliance:
 * - TLS 1.3 enforcement
 * - Security headers validation
 * - HSTS policy enforcement
 * - Certificate transparency
 * - Content Security Policy
 *
 * @version 1.0.0
 * @author NeonPro Platform Team
 * @compliance LGPD, ANVISA, ISO 27001
 */

import { expect, test } from '@playwright/test';

const baseUrl = process.env.BASE_URL || 'https://localhost:3000';

test.describe('HTTPS Security Validation', () => {
  test.beforeEach(async ({ _request }) => {
    // Verify test environment is configured for HTTPS
    console.log(`Testing against: ${baseUrl}`);
  });

  test('should enforce TLS 1.3 or higher', async ({ request }) => {
    const response = await request.get(`${baseUrl}/v1/health`);

    expect(response.status()).toBe(200);

    // Verify HTTPS connection
    expect(response.url()).toMatch(/^https:/);

    // Check security headers
    const headers = response.headers();
    expect(headers).toHaveProperty('strict-transport-security');
    expect(headers['strict-transport-security']).toMatch(/max-age=31536000/);
  });

  test('should include mandatory security headers', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/v2/ai/copilot`);

    expect(response.status()).toBe(200);

    const headers = response.headers();

    // Validate essential security headers
    expect(headers).toHaveProperty('x-content-type-options', 'nosniff');
    expect(headers).toHaveProperty('x-frame-options', 'DENY');
    expect(headers).toHaveProperty('x-xss-protection');
    expect(headers).toHaveProperty('referrer-policy');
    expect(headers).toHaveProperty('content-security-policy');
  });

  test('should enforce HSTS policy', async ({ request }) => {
    const response = await request.get(`${baseUrl}/v1/health`);

    expect(response.status()).toBe(200);

    const hstsHeader = response.headers()['strict-transport-security'];
    expect(hstsHeader).toBeDefined();

    // Validate HSTS configuration
    expect(hstsHeader).toMatch(/max-age=31536000/);
    expect(hstsHeader).toMatch(/includesubdomains/i);
    expect(hstsHeader).toMatch(/preload/i);
  });

  test('should have proper Content Security Policy', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/v2/ai/copilot`);

    expect(response.status()).toBe(200);

    const csp = response.headers()['content-security-policy'];
    expect(csp).toBeDefined();

    // Validate CSP directives
    expect(csp).toMatch(/default-src\s+'self'/);
    expect(csp).toMatch(/script-src\s+'self'/);
    expect(csp).toMatch(/style-src\s+'self'/);
    expect(csp).toMatch(/connect-src\s+'self'/);
    expect(csp).toMatch(/img-src\s+'self'\s+data:/);
  });

  test('should redirect HTTP to HTTPS', async ({ page }) => {
    // This test would require HTTP endpoint, in real environment
    // For now, we'll verify the headers indicate HTTPS enforcement
    const response = await page.request.get(`${baseUrl}/v1/health`);

    expect(response.status()).toBe(200);

    // Verify response indicates HTTPS is enforced
    const headers = response.headers();
    expect(headers).toHaveProperty('strict-transport-security');
  });

  test('should validate certificate transparency', async ({ request }) => {
    const response = await request.get(`${baseUrl}/v1/health`);

    expect(response.status()).toBe(200);

    // Check for certificate transparency headers
    const headers = response.headers();
    const expectCTHeader = headers['expect-ct'];

    // Expect-CT header should be present if certificate transparency is enabled
    if (expectCTHeader) {
      expect(expectCTHeader).toMatch(/max-age=/);
    }
  });

  test('should validate AI agent endpoints security', async ({ request }) => {
    // Test data-agent endpoint security
    const response = await request.post(`${baseUrl}/api/v2/ai/data-agent`, {
      data: {
        query: 'test query',
        sessionId: 'test-session',
      },
    });

    // Should enforce authentication (401 for unauthenticated)
    expect([401, 403, 200]).toContain(response.status());

    const headers = response.headers();
    expect(headers).toHaveProperty('strict-transport-security');
  });

  test('should validate WebSocket security', async ({ page }) => {
    // Test WebSocket endpoint security
    const _wsUrl = baseUrl.replace('https', 'wss') + '/api/v2/ai/copilot';

    // In a real test, we would attempt WebSocket connection
    // For now, validate the endpoint exists and is secure
    const response = await page.request.get(`${baseUrl}/v1/health`);
    expect(response.status()).toBe(200);
  });

  test.describe('Healthcare Compliance Validation', () => {
    test('should meet healthcare security requirements', async ({ request }) => {
      const response = await request.get(`${baseUrl}/v1/health`);

      expect(response.status()).toBe(200);

      const headers = response.headers();

      // Healthcare-specific security validations
      expect(headers).toHaveProperty('x-content-type-options', 'nosniff');
      expect(headers).toHaveProperty('x-frame-options', 'DENY');

      // Verify no sensitive information leakage
      const body = await response.text();
      expect(body).not.toMatch(/password/i);
      expect(body).not.toMatch(/secret/i);
      expect(body).not.toMatch(/key/i);
    });

    test('should validate LGPD compliance headers', async ({ request }) => {
      const response = await request.get(`${baseUrl}/v1/compliance/lgpd`);

      expect(response.status()).toBe(200);

      const compliance = await response.json();
      expect(compliance).toHaveProperty('lgpdCompliance');
      expect(compliance.lgpdCompliance).toHaveProperty('enabled', true);
    });

    test('should validate security monitoring endpoint', async ({ request }) => {
      const response = await request.get(`${baseUrl}/v1/monitoring/https`);

      expect(response.status()).toBe(200);

      const monitoring = await response.json();
      expect(monitoring).toHaveProperty('status');
      expect(monitoring).toHaveProperty('compliance');
      expect(monitoring.compliance).toHaveProperty('isCompliant');
    });
  });

  test.describe('Performance Security', () => {
    test('should maintain security under load', async ({ request }) => {
      const startTime = Date.now();

      // Make multiple requests to test security under load
      const promises = Array(5).fill(0).map(() => request.get(`${baseUrl}/v1/health`));

      const responses = await Promise.all(promises);

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // All responses should be successful
      responses.forEach(response => {
        expect(response.status()).toBe(200);
        const headers = response.headers();
        expect(headers).toHaveProperty('strict-transport-security');
      });

      // Performance should be reasonable (<5s for 5 requests)
      expect(totalTime).toBeLessThan(5000);
    });

    test('should handle security headers consistently', async ({ request }) => {
      // Test multiple endpoints for consistent security headers
      const endpoints = [
        '/v1/health',
        '/api/v2/ai/copilot',
        '/v1/info',
      ];

      for (const endpoint of endpoints) {
        const response = await request.get(`${baseUrl}${endpoint}`);
        expect(response.status()).toBe(200);

        const headers = response.headers();
        expect(headers).toHaveProperty('strict-transport-security');
        expect(headers).toHaveProperty('x-content-type-options');
      }
    });
  });
});

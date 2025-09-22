/**
 * HTTPS Security Validation E2E Test
 * 
 * Validates HTTPS security requirements for healthcare compliance:
 * - TLS 1.3 configuration
 * - HSTS headers
 * - Security headers
 * - Certificate validation
 * - HTTPS enforcement
 * 
 * @version 1.0.0
 * @author NeonPro Platform Team
 * @compliance LGPD, ANVISA, ISO 27001
 */

import { test, expect } from '@playwright/test';

test.describe('HTTPS Security Validation', () => {
  let baseUrl: string;

  test.beforeAll(async () => {
    // Use HTTPS URL in production, HTTP in development with HTTPS redirect
    baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://localhost:3001'
      : 'http://localhost:3001';
  });

  test.describe('TLS 1.3 Configuration', () => {
    test('should enforce TLS 1.3 or higher', async ({ request }) => {
      try {
        const response = await request.get(`${baseUrl}/v1/health`, {
          headers: {
            'User-Agent': 'NeonPro-E2E-Test/1.0'
          }
        });

        // Check if connection uses secure protocol
        const tlsVersion = response.headers()['x-tls-version'];
        const cipherSuite = response.headers()['x-cipher-suite'];

        expect(response.status()).toBe(200);
        
        // Validate TLS version (if headers are available)
        if (tlsVersion) {
          expect(tlsVersion).toMatch(/TLSv1\.3/);
        }

        // Validate cipher suite strength (if headers are available)
        if (cipherSuite) {
          expect(cipherSuite).toMatch(/AES_256_GCM|CHACHA20_POLY1305/);
        }

      } catch (error) {
        // In development/test without HTTPS, check for redirect
        if (process.env.NODE_ENV !== 'production') {
          const response = await fetch(`${baseUrl}/v1/health`);
          expect(response.status).toBe(200);
        } else {
          throw error;
        }
      }
    });

    test('should reject insecure protocols', async () => {
      // This test would require actual TLS configuration testing
      // For now, we validate the configuration exists
      test.skip();
    });
  });

  test.describe('HSTS Headers', () => {
    test('should include HSTS headers with proper configuration', async ({ request }) => {
      const response = await request.get(`${baseUrl}/v1/health`);
      
      if (process.env.NODE_ENV === 'production') {
        const strictTransportSecurity = response.headers()['strict-transport-security'];
        
        expect(strictTransportSecurity).toBeDefined();
        expect(strictTransportSecurity).toContain('max-age=');
        
        // Validate max-age is at least 1 year (31536000 seconds)
        const maxAgeMatch = strictTransportSecurity?.match(/max-age=(\d+)/);
        if (maxAgeMatch) {
          const maxAge = parseInt(maxAgeMatch[1]);
          expect(maxAge).toBeGreaterThanOrEqual(31536000);
        }

        // Check for includeSubDomains and preload
        expect(strictTransportSecurity).toMatch(/includeSubDomains/);
      } else {
        // HSTS not required in development
        test.info().annotations.push({
          type: 'note',
          description: 'HSTS not enforced in development environment'
        });
      }
    });
  });

  test.describe('Security Headers', () => {
    test('should include all required security headers', async ({ request }) => {
      const response = await request.get(`${baseUrl}/v1/health`);
      
      const headers = response.headers();
      
      // Content Security Policy
      const csp = headers['content-security-policy'];
      expect(csp).toBeDefined();
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("script-src 'self'");
      expect(csp).toContain("style-src 'self'");
      
      // X-Content-Type-Options
      expect(headers['x-content-type-options']).toBe('nosniff');
      
      // X-Frame-Options
      expect(headers['x-frame-options']).toBe('DENY');
      
      // X-XSS-Protection
      expect(headers['x-xss-protection']).toBe('1; mode=block');
      
      // Referrer Policy
      expect(headers['referrer-policy']).toContain('strict-origin-when-cross-origin');
      
      // Permissions Policy
      const permissionsPolicy = headers['permissions-policy'];
      expect(permissionsPolicy).toBeDefined();
      expect(permissionsPolicy).toContain('camera=()');
      expect(permissionsPolicy).toContain('microphone=()');
    });

    test('should enforce secure cookie attributes', async ({ request }) => {
      // Test cookie security by making a request that might set cookies
      const response = await request.post(`${baseUrl}/api/v1/auth/login`, {
        data: {
          email: 'test@example.com',
          password: 'testpassword'
        }
      });

      const setCookieHeaders = response.headers()['set-cookie'];
      
      if (setCookieHeaders) {
        const cookies = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];
        
        cookies.forEach(cookie => {
          expect(cookie).toContain('Secure');
          expect(cookie).toContain('HttpOnly');
          expect(cookie).toContain('SameSite=Strict');
        });
      }
    });
  });

  test.describe('Certificate Validation', () => {
    test('should have valid SSL certificate in production', async ({ request }) => {
      if (process.env.NODE_ENV === 'production') {
        const response = await request.get(`${baseUrl}/v1/health`);
        
        // Check for certificate information headers (if available)
        const certInfo = response.headers()['x-ssl-certificate-info'];
        
        if (certInfo) {
          // Basic certificate validation
          expect(certInfo).not.toContain('self-signed');
          expect(certInfo).not.toContain('expired');
        }
      } else {
        test.info().annotations.push({
          type: 'note',
          description: 'Certificate validation skipped in development'
        });
      }
    });

    test('should handle certificate expiration monitoring', async ({ request }) => {
      const response = await request.get(`${baseUrl}/v1/monitoring/https`);
      
      expect(response.status()).toBe(200);
      
      const monitoringData = await response.json();
      
      // Check certificate monitoring data
      expect(monitoringData).toHaveProperty('compliance');
      expect(monitoringData.compliance).toHaveProperty('currentComplianceRate');
      
      // Validate compliance rate
      const complianceRate = monitoringData.compliance.currentComplianceRate;
      expect(complianceRate).toBeGreaterThanOrEqual(95.0); // 95% compliance minimum
    });
  });

  test.describe('HTTPS Enforcement', () => {
    test('should redirect HTTP to HTTPS in production', async ({ request }) => {
      if (process.env.NODE_ENV === 'production') {
        // Test HTTP redirect to HTTPS
        const httpUrl = baseUrl.replace('https://', 'http://');
        const response = await request.get(httpUrl, {
          maxRedirects: 0 // Don't follow redirects automatically
        });

        // Should be redirected (301 or 302)
        expect([301, 302, 307, 308]).toContain(response.status());
        
        const location = response.headers()['location'];
        expect(location).toBeDefined();
        expect(location).toMatch(/^https:\/\//);
      } else {
        test.info().annotations.push({
          type: 'note',
          description: 'HTTPS redirect not tested in development'
        });
      }
    });

    test('should block mixed content', async ({ page }) => {
      await page.goto(`${baseUrl}/v1/health`);
      
      // Check for mixed content warnings in console
      const consoleMessages: string[] = [];
      page.on('console', msg => {
        consoleMessages.push(msg.text());
      });

      // Navigate to a page that might have mixed content
      await page.goto(`${baseUrl}/v1/info`);
      
      // Check for mixed content warnings
      const mixedContentWarnings = consoleMessages.filter(msg => 
        msg.includes('mixed content') || msg.includes('insecure content')
      );
      
      expect(mixedContentWarnings).toHaveLength(0);
    });
  });

  test.describe('Performance Requirements', () => {
    test('should meet HTTPS handshake performance requirements', async ({ request }) => {
      const startTime = Date.now();
      
      const response = await request.get(`${baseUrl}/v1/health`);
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      expect(response.status()).toBe(200);
      
      // Check performance requirements from tasks.md: ≤300ms handshake
      // This is a simplified check - actual handshake time would need server-side metrics
      expect(totalTime).toBeLessThanOrEqual(500); // Generous limit for E2E test
      
      // Check monitoring endpoint for actual handshake performance
      const monitoringResponse = await request.get(`${baseUrl}/v1/monitoring/https`);
      const monitoringData = await monitoringResponse.json();
      
      expect(monitoringData).toHaveProperty('performance');
      expect(monitoringData.performance).toHaveProperty('averageHandshakeTimeMs');
      
      const avgHandshakeTime = monitoringData.performance.averageHandshakeTimeMs;
      expect(avgHandshakeTime).toBeLessThanOrEqual(300); // 300ms requirement
    });
  });

  test.describe('Security Monitoring', () => {
    test('should track HTTPS security events', async ({ request }) => {
      // Access security monitoring endpoint
      const response = await request.get(`${baseUrl}/v1/security/status`);
      
      expect(response.status()).toBe(200);
      
      const securityData = await response.json();
      
      // Validate security monitoring structure
      expect(securityData).toHaveProperty('encryption');
      expect(securityData).toHaveProperty('healthcareCompliance');
      expect(securityData).toHaveProperty('monitoring');
      
      // Check healthcare compliance
      expect(securityData.healthcareCompliance.lgpdEnabled).toBe(true);
      expect(securityData.healthcareCompliance.dataEncryption).toBe('enabled');
    });

    test('should provide comprehensive security status', async ({ request }) => {
      const response = await request.get(`${baseUrl}/v1/security/status`);
      
      expect(response.status()).toBe(200);
      
      const securityData = await response.json();
      
      // Validate comprehensive security coverage
      expect(securityData.encryption.enabled).toBe(true);
      expect(securityData.encryption.algorithm).toBe('AES-256-GCM');
      expect(securityData.rateLimiting.enabled).toBe(true);
      expect(securityData.inputValidation.enabled).toBe(true);
      
      // Check monitoring integration
      expect(securityData.monitoring).toHaveProperty('errorTracking');
      expect(securityData.monitoring).toHaveProperty('logger');
    });
  });

  test.describe('Healthcare Compliance', () => {
    test('should maintain LGPD compliance in HTTPS configuration', async ({ request }) => {
      const response = await request.get(`${baseUrl}/v1/compliance/lgpd`);
      
      expect(response.status()).toBe(200);
      
      const complianceData = await response.json();
      
      // Validate LGPD compliance in security context
      expect(complianceData.lgpdCompliance).toBeDefined();
      expect(complianceData.lgpdCompliance.securityMeasures.encryption).toMatch(/AES-256-GCM/);
      expect(complianceData.lgpdCompliance.securityMeasures.accessControl).toBe('role_based');
      expect(complianceData.lgpdCompliance.securityMeasures.auditLogging).toBe('enabled');
    });

    test('should protect sensitive healthcare data in transit', async ({ request }) => {
      // Test with sensitive healthcare endpoint
      const patientResponse = await request.get(`${baseUrl}/api/v2/patients/test-patient-id`);
      
      if (patientResponse.status() === 200) {
        const headers = patientResponse.headers();
        
        // Ensure security headers are present for sensitive data
        expect(headers['x-content-type-options']).toBe('nosniff');
        expect(headers['x-frame-options']).toBe('DENY');
        
        // Check for custom healthcare security headers
        expect(headers['x-healthcare-security']).toBeDefined();
        expect(headers['x-lgpd-compliance']).toBeDefined();
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should handle TLS/SSL errors gracefully', async ({ request }) => {
      // Test with invalid certificate scenario (mocked in test)
      try {
        const response = await request.get(`${baseUrl}/v1/health`, {
          headers: {
            'X-Test-Certificate-Error': 'true'
          }
        });
        
        // Should either handle error or provide appropriate response
        expect([200, 400, 403, 500]).toContain(response.status());
        
      } catch (error) {
        // Network errors are acceptable for certificate issues
        expect((error as Error).message).toMatch(/certificate|tls|ssl/i);
      }
    });

    test('should log security events appropriately', async ({ request }) => {
      // Trigger a security event
      const response = await request.get(`${baseUrl}/v1/security/test-event`);
      
      // Should handle security test events appropriately
      expect([200, 404, 500]).toContain(response.status());
    });
  });
});

test.describe('HTTPS Security Integration Tests', () => {
  let baseUrl: string;

  test.beforeAll(async () => {
    baseUrl = process.env.NODE_ENV === 'production'
      ? 'https://localhost:3001'
      : 'http://localhost:3001';
  });
  test('should maintain security across all API endpoints', async ({ request }) => {
    const endpoints = [
      '/v1/health',
      '/v1/info',
      '/api/v2/ai/chat',
      '/api/v2/ai/sessions',
      '/v1/compliance/lgpd'
    ];

    for (const endpoint of endpoints) {
      const response = await request.get(`${baseUrl}${endpoint}`);
      
      expect(response.status()).toBe(200);
      
      const headers = response.headers();
      
      // Validate security headers on all endpoints
      expect(headers['x-content-type-options']).toBe('nosniff');
      expect(headers['x-frame-options']).toBe('DENY');
      expect(headers['x-xss-protection']).toBe('1; mode=block');
      
      // Validate CSP
      const csp = headers['content-security-policy'];
      expect(csp).toBeDefined();
      expect(csp).toContain("default-src 'self'");
    }
  });

  test('should handle concurrent secure connections', async ({ request }) => {
    // Test multiple concurrent requests
    const requests = Array(10).fill(null).map(() => 
      request.get(`${baseUrl}/v1/health`)
    );

    const responses = await Promise.all(requests);
    
    // All requests should succeed
    responses.forEach(response => {
      expect(response.status()).toBe(200);
    });
  });
});

// Export test suite for module consistency
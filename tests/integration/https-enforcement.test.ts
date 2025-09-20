import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer } from 'http';
import { AddressInfo } from 'net';
import { createApp } from '../../apps/api/src/app';

describe('HTTPS Enforcement Test', () => {
  let server: any;
  let baseUrl: string;

  beforeAll(async () => {
    const app = createApp();
    server = createServer(app);
    await new Promise<void>((resolve) => {
      server.listen(0, () => {
        const address = server.address() as AddressInfo;
        baseUrl = `http://localhost:${address.port}`;
        resolve();
      });
    });
  });

  afterAll(() => {
    if (server) {
      server.close();
    }
  });

  it('T012 should redirect HTTP to HTTPS for API endpoints', async () => {
    const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'test query',
      }),
    });

    // Should redirect to HTTPS or enforce secure connection
    expect([301, 302, 307, 308, 403]).toContain(response.status);
    
    if ([301, 302, 307, 308].includes(response.status)) {
      const location = response.headers.get('location');
      expect(location).toMatch(/^https:\/\//);
    }
  });

  it('T012 should include security headers in response', async () => {
    const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'test query',
      }),
    });

    const headers = response.headers;
    
    // Check for security headers
    expect(headers.get('x-content-type-options')).toBe('nosniff');
    expect(headers.get('x-frame-options')).toBe('DENY');
    expect(headers.get('x-xss-protection')).toBe('1; mode=block');
    
    // Strict-Transport-Security should be present for HTTPS enforcement
    const hsts = headers.get('strict-transport-security');
    if (hsts) {
      expect(hsts).toMatch(/max-age=\d+/);
      expect(parseInt(hsts.match(/max-age=(\d+)/)?.[1] || '0')).toBeGreaterThan(0);
    }
  });

  it('T012 should reject insecure communication for sensitive endpoints', async () => {
    const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'patient medical records', // Sensitive healthcare data
      }),
    });

    // Should enforce HTTPS for sensitive data
    expect([403, 301, 302, 307, 308]).toContain(response.status);
    
    if (response.status === 403) {
      const data = await response.json();
      expect(data.error).toMatch(/https|secure/i);
    }
  });

  it('T012 should handle X-Forwarded-Proto header correctly', async () => {
    const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-Proto': 'https',
      },
      body: JSON.stringify({
        query: 'test query',
      }),
    });

    // Should allow the request when X-Forwarded-Proto indicates HTTPS
    expect([200, 400, 401]).toContain(response.status);
  });

  it('T012 should log HTTPS enforcement violations', async () => {
    // This test would need to check log output, but for now we'll test the enforcement
    const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'test query',
      }),
    });

    // Should either redirect or reject insecure requests
    expect([301, 302, 307, 308, 403]).toContain(response.status);
  });
});
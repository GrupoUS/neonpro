import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer } from 'http';
import { AddressInfo } from 'net';
import { createApp } from '../../apps/api/src/app';

describe('Contract Test: POST /api/ai/data-agent', () => {
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

  it('T009 should return 400 for missing query parameter', async () => {
    const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Query parameter is required');
  });

  it('T009 should return 401 for missing authentication', async () => {
    const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'List upcoming appointments',
      }),
    });

    expect(response.status).toBe(401);
  });

  it('T009 should return 200 for valid data agent request', async () => {
    const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
      body: JSON.stringify({
        query: 'List upcoming appointments',
        sessionId: 'test-session-123',
        userContext: {
          userId: 'test-user-123',
          domain: 'healthcare',
          permissions: ['read:appointments'],
        },
      }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('response');
    expect(data).toHaveProperty('sessionId');
  });

  it('T009 should handle healthcare data queries securely', async () => {
    const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
      body: JSON.stringify({
        query: 'Show me patient medical records',
        sessionId: 'test-session-456',
        userContext: {
          userId: 'test-user-123',
          domain: 'healthcare',
          permissions: ['read:medical'],
        },
      }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    // Ensure no PII data is exposed in response
    expect(data.response).not.toContain('ssn');
    expect(data.response).not.toContain('medical-record');
  });

  it('T009 should return 403 for insufficient permissions', async () => {
    const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
      body: JSON.stringify({
        query: 'Access financial summary',
        sessionId: 'test-session-789',
        userContext: {
          userId: 'test-user-123',
          domain: 'healthcare',
          permissions: ['read:appointments'], // Missing financial permissions
        },
      }),
    });

    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data.error).toBe('Insufficient permissions');
  });
});
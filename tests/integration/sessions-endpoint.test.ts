import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer } from 'http';
import { AddressInfo } from 'net';
import { createApp } from '../../apps/api/src/app';

describe('Contract Test: GET /api/ai/sessions/{sessionId}', () => {
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

  it('T010 should return 404 for non-existent session', async () => {
    const response = await fetch(`${baseUrl}/api/ai/sessions/non-existent-session`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer test-token',
      },
    });

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toBe('Session not found');
  });

  it('T010 should return 401 for missing authentication', async () => {
    const response = await fetch(`${baseUrl}/api/ai/sessions/test-session-123`, {
      method: 'GET',
    });

    expect(response.status).toBe(401);
  });

  it('T010 should return 200 for valid session', async () => {
    const response = await fetch(`${baseUrl}/api/ai/sessions/test-session-123`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer test-token',
      },
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('sessionId');
    expect(data).toHaveProperty('messages');
    expect(data).toHaveProperty('userContext');
    expect(Array.isArray(data.messages)).toBe(true);
  });

  it('T010 should include LGPD compliance metadata', async () => {
    const response = await fetch(`${baseUrl}/api/ai/sessions/test-session-123`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer test-token',
      },
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('lgpdConsent');
    if (data.lgpdConsent) {
      expect(data.lgpdConsent).toHaveProperty('dataProcessing');
      expect(data.lgpdConsent).toHaveProperty('retentionPeriod');
    }
  });

  it('T010 should handle expired sessions gracefully', async () => {
    const response = await fetch(`${baseUrl}/api/ai/sessions/expired-session-123`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer test-token',
      },
    });

    expect(response.status).toBe(410);
    const data = await response.json();
    expect(data.error).toBe('Session expired');
  });
});
}
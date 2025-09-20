import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer } from 'http';
import { AddressInfo } from 'net';
import { createApp } from '../../apps/api/src/app';

describe('Contract Test: POST /api/ai/sessions/{sessionId}/feedback', () => {
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

  it('T011 should return 400 for missing rating parameter', async () => {
    const response = await fetch(`${baseUrl}/api/ai/sessions/test-session-123/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
      body: JSON.stringify({}),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Rating parameter is required');
  });

  it('T011 should return 404 for non-existent session', async () => {
    const response = await fetch(`${baseUrl}/api/ai/sessions/non-existent-session/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
      body: JSON.stringify({
        rating: 5,
      }),
    });

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toBe('Session not found');
  });

  it('T011 should return 401 for missing authentication', async () => {
    const response = await fetch(`${baseUrl}/api/ai/sessions/test-session-123/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rating: 4,
      }),
    });

    expect(response.status).toBe(401);
  });

  it('T011 should return 200 for valid feedback submission', async () => {
    const response = await fetch(`${baseUrl}/api/ai/sessions/test-session-123/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
      body: JSON.stringify({
        rating: 5,
        message: 'Excellent response, very helpful!',
        categories: ['accuracy', 'helpfulness'],
      }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('feedbackId');
    expect(data).toHaveProperty('sessionId', 'test-session-123');
    expect(data.rating).toBe(5);
  });

  it('T011 should validate rating range (1-5)', async () => {
    const response = await fetch(`${baseUrl}/api/ai/sessions/test-session-123/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
      body: JSON.stringify({
        rating: 10, // Invalid rating
        message: 'Test feedback',
      }),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Rating must be between 1 and 5');
  });

  it('T011 should handle detailed feedback with healthcare context', async () => {
    const response = await fetch(`${baseUrl}/api/ai/sessions/test-session-123/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
      body: JSON.stringify({
        rating: 4,
        message: 'Good response but could improve medical terminology',
        categories: ['accuracy', 'medical_knowledge'],
        metadata: {
          healthcareDomain: true,
          suggestion: 'Include more specific medical codes',
        },
      }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.categories).toContain('medical_knowledge');
    expect(data.metadata.healthcareDomain).toBe(true);
  });
});
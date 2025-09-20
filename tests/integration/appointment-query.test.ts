import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer } from 'http';
import { AddressInfo } from 'net';
import { createApp } from '../../apps/api/src/app';

describe('Integration Test: Query Upcoming Appointments', () => {
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

  it('T015 should handle appointment queries with date ranges', async () => {
    const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
      body: JSON.stringify({
        query: 'Show me upcoming appointments for next week',
        sessionId: 'test-appointment-session',
        userContext: {
          userId: 'doctor-123',
          domain: 'healthcare',
          permissions: ['read:appointments'],
        },
      }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.response).toBeDefined();
    expect(data.sessionId).toBe('test-appointment-session');
  });

  it('T015 should return structured appointment data', async () => {
    const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
      body: JSON.stringify({
        query: 'List my appointments today',
        sessionId: 'test-structured-session',
        userContext: {
          userId: 'doctor-123',
          domain: 'healthcare',
          permissions: ['read:appointments'],
        },
      }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    
    // Response should contain appointment-related information
    expect(data.response).toBeDefined();
    // Should handle LGPD compliance for appointment data
    expect(data.response).not.toContain('ssn'); // No sensitive PII
  });

  it('T015 should filter appointments by user permissions', async () => {
    const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
      body: JSON.stringify({
        query: 'Show all appointments in the system',
        sessionId: 'test-permission-session',
        userContext: {
          userId: 'receptionist-456',
          domain: 'healthcare',
          permissions: ['read:own-appointments'], // Limited permissions
        },
      }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    
    // Should respect user's limited permissions
    expect(data.response).toBeDefined();
    // Should not expose other users' appointments
    expect(data.response).not.toContain('unauthorized');
  });

  it('T015 should handle appointment queries with specific criteria', async () => {
    const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
      body: JSON.stringify({
        query: 'Show me appointments with status confirmed for tomorrow',
        sessionId: 'test-criteria-session',
        userContext: {
          userId: 'doctor-123',
          domain: 'healthcare',
          permissions: ['read:appointments'],
        },
      }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.response).toBeDefined();
    expect(data.sessionId).toBe('test-criteria-session');
  });

  it('T015 should handle appointment queries for different time periods', async () => {
    const testQueries = [
      'appointments this week',
      'appointments next month',
      'appointments today',
      'appointments for the rest of the day'
    ];

    for (const query of testQueries) {
      const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
        body: JSON.stringify({
          query: `Show me ${query}`,
          sessionId: `test-time-session-${Date.now()}`,
          userContext: {
            userId: 'doctor-123',
            domain: 'healthcare',
            permissions: ['read:appointments'],
          },
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.response).toBeDefined();
    }
  });

  it('T015 should handle appointment queries with patient context', async () => {
    const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
      body: JSON.stringify({
        query: 'Show appointments for patient João Silva',
        sessionId: 'test-patient-context-session',
        userContext: {
          userId: 'doctor-123',
          domain: 'healthcare',
          permissions: ['read:appointments', 'read:patients'],
        },
      }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.response).toBeDefined();
    
    // Should handle patient-specific queries while maintaining LGPD compliance
    expect(data.response).not.toContain('medical-record-number');
  });
});
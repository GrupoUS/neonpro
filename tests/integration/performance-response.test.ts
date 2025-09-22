import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer } from 'http';
import { AddressInfo } from 'net';
import { createApp } from '../../apps/api/src/app';

describe('Performance Test: <2s Response Time', () => {
  let server: any;
  let baseUrl: string;

  beforeAll(async () => {
    const app = createApp(
    server = createServer(app
    await new Promise<void>((resolve) => {
      server.listen(0, () => {
        const address = server.address() as AddressInfo;
        baseUrl = `http://localhost:${address.port}`;
        resolve(
      }
    }
  }

  afterAll(() => {
    if (server) {
      server.close(
    }
  }

  it('T020 should respond to simple queries in under 2 seconds', async () => {
    const startTime = Date.now(
    
    const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
      body: JSON.stringify({
        query: 'Hello',
        sessionId: 'test-perf-simple',
        userContext: {
          userId: 'user-123',
          domain: 'healthcare',
          permissions: ['basic'],
        },
      }),
    }

    const endTime = Date.now(
    const responseTime = endTime - startTime;

    expect(response.status).toBe(200
    expect(responseTime).toBeLessThan(2000); // Less than 2 seconds
    
    console.log(`Simple query response time: ${responseTime}ms`
  }

  it('T020 should respond to appointment queries in under 2 seconds', async () => {
    const startTime = Date.now(
    
    const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
      body: JSON.stringify({
        query: 'Show me my appointments today',
        sessionId: 'test-perf-appointments',
        userContext: {
          userId: 'doctor-123',
          domain: 'healthcare',
          permissions: ['read:appointments'],
        },
      }),
    }

    const endTime = Date.now(
    const responseTime = endTime - startTime;

    expect(response.status).toBe(200
    expect(responseTime).toBeLessThan(2000
    
    console.log(`Appointment query response time: ${responseTime}ms`
  }

  it('T020 should respond to client queries in under 2 seconds', async () => {
    const startTime = Date.now(
    
    const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
      body: JSON.stringify({
        query: 'Find clients named Silva',
        sessionId: 'test-perf-clients',
        userContext: {
          userId: 'doctor-123',
          domain: 'healthcare',
          permissions: ['read:clients'],
        },
      }),
    }

    const endTime = Date.now(
    const responseTime = endTime - startTime;

    expect(response.status).toBe(200
    expect(responseTime).toBeLessThan(2000
    
    console.log(`Client query response time: ${responseTime}ms`
  }

  it('T020 should respond to financial queries in under 2 seconds', async () => {
    const startTime = Date.now(
    
    const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
      body: JSON.stringify({
        query: 'Show financial summary for this month',
        sessionId: 'test-perf-financial',
        userContext: {
          userId: 'admin-123',
          domain: 'healthcare',
          permissions: ['read:financial'],
        },
      }),
    }

    const endTime = Date.now(
    const responseTime = endTime - startTime;

    expect(response.status).toBe(200
    expect(responseTime).toBeLessThan(2000
    
    console.log(`Financial query response time: ${responseTime}ms`
  }

  it('T020 should maintain performance under consecutive requests', async () => {
    const responseTimes: number[] = [];
    
    for (let i = 0; i < 5; i++) {
      const startTime = Date.now(
      
      const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
        body: JSON.stringify({
          query: `Test query ${i}`,
          sessionId: `test-perf-consecutive-${i}`,
          userContext: {
            userId: 'user-123',
            domain: 'healthcare',
            permissions: ['basic'],
          },
        }),
      }

      const endTime = Date.now(
      const responseTime = endTime - startTime;
      responseTimes.push(responseTime

      expect(response.status).toBe(200
    }

    // All requests should be under 2 seconds
    responseTimes.forEach((time, index) => {
      expect(time).toBeLessThan(2000
      console.log(`Consecutive request ${index + 1} response time: ${time}ms`
    }

    // Average should be reasonable (under 1.5 seconds)
    const averageTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    expect(averageTime).toBeLessThan(1500
    console.log(`Average response time: ${averageTime}ms`
  }

  it('T020 should handle complex queries within time limit', async () => {
    const startTime = Date.now(
    
    const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
      body: JSON.stringify({
        query: 'Show me appointments for next week, group by day, and include patient contact information while respecting privacy',
        sessionId: 'test-perf-complex',
        userContext: {
          userId: 'doctor-123',
          domain: 'healthcare',
          permissions: ['read:appointments', 'read:patients'],
        },
      }),
    }

    const endTime = Date.now(
    const responseTime = endTime - startTime;

    expect(response.status).toBe(200
    expect(responseTime).toBeLessThan(2000
    
    console.log(`Complex query response time: ${responseTime}ms`
  }
}
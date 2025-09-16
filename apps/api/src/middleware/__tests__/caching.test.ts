/**
 * Caching Middleware Tests
 * T079 - Backend API Performance Optimization
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Hono } from 'hono';
import { 
  createCacheMiddleware, 
  CacheInvalidator, 
  healthcareComplianceCacheHeaders,
  CACHE_CONFIGS 
} from '../caching';

describe('Caching Middleware', () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();
    vi.clearAllMocks();
  });

  afterEach(() => {
    CacheInvalidator.clearAll();
  });

  describe('createCacheMiddleware', () => {
    it('should cache GET requests for public services', async () => {
      const middleware = createCacheMiddleware('services');
      
      app.use('/api/services/*', middleware);
      app.get('/api/services/list', (c) => c.json({ services: ['service1', 'service2'] }));

      // First request - cache miss
      const res1 = await app.request('/api/services/list');
      expect(res1.status).toBe(200);
      expect(res1.headers.get('x-cache')).toBe('MISS');

      // Second request - cache hit
      const res2 = await app.request('/api/services/list');
      expect(res2.status).toBe(200);
      expect(res2.headers.get('x-cache')).toBe('HIT');
    });

    it('should not cache POST requests', async () => {
      const middleware = createCacheMiddleware('services');
      
      app.use('/api/services/*', middleware);
      app.post('/api/services/create', (c) => c.json({ success: true }));

      const res = await app.request('/api/services/create', { method: 'POST' });
      expect(res.status).toBe(200);
      expect(res.headers.get('x-cache')).toBeNull();
    });

    it('should not cache sensitive patient data', async () => {
      const middleware = createCacheMiddleware('patients');
      
      app.use('/api/patients/*', middleware);
      app.get('/api/patients/123', (c) => c.json({ patient: { id: 123, name: 'John Doe' } }));

      const res = await app.request('/api/patients/123');
      expect(res.status).toBe(200);
      expect(res.headers.get('x-cache')).toBeNull();
    });

    it('should vary cache by authorization header for private data', async () => {
      const middleware = createCacheMiddleware('appointments-list');
      
      app.use('/api/appointments/*', middleware);
      app.get('/api/appointments/list', (c) => {
        const auth = c.req.header('authorization');
        return c.json({ appointments: [`appointment-${auth}`] });
      });

      // Request with first auth token
      const res1 = await app.request('/api/appointments/list', {
        headers: { 'authorization': 'Bearer token1' }
      });
      expect(res1.status).toBe(200);
      expect(res1.headers.get('x-cache')).toBe('MISS');

      // Request with different auth token - should be cache miss
      const res2 = await app.request('/api/appointments/list', {
        headers: { 'authorization': 'Bearer token2' }
      });
      expect(res2.status).toBe(200);
      expect(res2.headers.get('x-cache')).toBe('MISS');

      // Request with first auth token again - should be cache hit
      const res3 = await app.request('/api/appointments/list', {
        headers: { 'authorization': 'Bearer token1' }
      });
      expect(res3.status).toBe(200);
      expect(res3.headers.get('x-cache')).toBe('HIT');
    });

    it('should not cache error responses', async () => {
      const middleware = createCacheMiddleware('services');
      
      app.use('/api/services/*', middleware);
      app.get('/api/services/error', (c) => c.json({ error: 'Not found' }, 404));

      const res1 = await app.request('/api/services/error');
      expect(res1.status).toBe(404);
      expect(res1.headers.get('x-cache')).toBe('SKIP');

      const res2 = await app.request('/api/services/error');
      expect(res2.status).toBe(404);
      expect(res2.headers.get('x-cache')).toBe('SKIP');
    });

    it('should respect cache TTL', async () => {
      const shortTTLConfig = { ttl: 1 }; // 1 second
      const middleware = createCacheMiddleware('services', shortTTLConfig);
      
      app.use('/api/services/*', middleware);
      app.get('/api/services/ttl-test', (c) => c.json({ timestamp: Date.now() }));

      // First request
      const res1 = await app.request('/api/services/ttl-test');
      const data1 = await res1.json();
      expect(res1.headers.get('x-cache')).toBe('MISS');

      // Second request immediately - should be cache hit
      const res2 = await app.request('/api/services/ttl-test');
      const data2 = await res2.json();
      expect(res2.headers.get('x-cache')).toBe('HIT');
      expect(data2.timestamp).toBe(data1.timestamp);

      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Third request after TTL - should be cache miss
      const res3 = await app.request('/api/services/ttl-test');
      const data3 = await res3.json();
      expect(res3.headers.get('x-cache')).toBe('MISS');
      expect(data3.timestamp).not.toBe(data1.timestamp);
    });

    it('should add appropriate cache control headers', async () => {
      const middleware = createCacheMiddleware('services');
      
      app.use('/api/services/*', middleware);
      app.get('/api/services/headers', (c) => c.json({ data: 'test' }));

      const res = await app.request('/api/services/headers');
      expect(res.status).toBe(200);
      expect(res.headers.get('cache-control')).toContain('public');
      expect(res.headers.get('cache-control')).toContain('max-age=3600');
    });
  });

  describe('CacheInvalidator', () => {
    it('should invalidate cache by tags', async () => {
      const middleware = createCacheMiddleware('services');
      
      app.use('/api/services/*', middleware);
      app.get('/api/services/test', (c) => c.json({ data: 'original' }));

      // Cache the response
      const res1 = await app.request('/api/services/test');
      expect(res1.headers.get('x-cache')).toBe('MISS');

      // Verify it's cached
      const res2 = await app.request('/api/services/test');
      expect(res2.headers.get('x-cache')).toBe('HIT');

      // Invalidate by tags
      await CacheInvalidator.invalidateByTags(['services']);

      // Should be cache miss after invalidation
      const res3 = await app.request('/api/services/test');
      expect(res3.headers.get('x-cache')).toBe('MISS');
    });

    it('should clear all cache entries', async () => {
      const middleware = createCacheMiddleware('services');
      
      app.use('/api/services/*', middleware);
      app.get('/api/services/test1', (c) => c.json({ data: 'test1' }));
      app.get('/api/services/test2', (c) => c.json({ data: 'test2' }));

      // Cache multiple responses
      await app.request('/api/services/test1');
      await app.request('/api/services/test2');

      // Clear all cache
      await CacheInvalidator.clearAll();

      // Both should be cache miss
      const res1 = await app.request('/api/services/test1');
      const res2 = await app.request('/api/services/test2');
      expect(res1.headers.get('x-cache')).toBe('MISS');
      expect(res2.headers.get('x-cache')).toBe('MISS');
    });

    it('should provide cache statistics', () => {
      const stats = CacheInvalidator.getStats();
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('hitRate');
      expect(stats).toHaveProperty('memoryUsage');
      expect(typeof stats.size).toBe('number');
      expect(typeof stats.hitRate).toBe('number');
      expect(typeof stats.memoryUsage).toBe('number');
    });
  });

  describe('healthcareComplianceCacheHeaders', () => {
    it('should add healthcare compliance headers', async () => {
      app.use('*', healthcareComplianceCacheHeaders());
      app.get('/test', (c) => c.json({ data: 'test' }));

      const res = await app.request('/test');
      expect(res.headers.get('x-content-type-options')).toBe('nosniff');
      expect(res.headers.get('x-frame-options')).toBe('DENY');
      expect(res.headers.get('referrer-policy')).toBe('strict-origin-when-cross-origin');
      expect(res.headers.get('x-healthcare-compliance')).toBe('LGPD,ANVISA,CFM');
      expect(res.headers.get('x-data-classification')).toBe('healthcare');
    });
  });

  describe('CACHE_CONFIGS', () => {
    it('should have appropriate TTL for different data types', () => {
      expect(CACHE_CONFIGS.services.ttl).toBe(3600); // 1 hour for services
      expect(CACHE_CONFIGS['service-categories'].ttl).toBe(7200); // 2 hours for categories
      expect(CACHE_CONFIGS['appointments-list'].ttl).toBe(300); // 5 minutes for appointments
      expect(CACHE_CONFIGS.patients.ttl).toBe(0); // No caching for patients
      expect(CACHE_CONFIGS['patient-records'].ttl).toBe(0); // No caching for patient records
    });

    it('should have correct compliance levels', () => {
      expect(CACHE_CONFIGS.services.complianceLevel).toBe('public');
      expect(CACHE_CONFIGS['appointments-list'].complianceLevel).toBe('private');
      expect(CACHE_CONFIGS.patients.complianceLevel).toBe('sensitive');
      expect(CACHE_CONFIGS['patient-records'].complianceLevel).toBe('sensitive');
    });

    it('should have appropriate vary headers for private data', () => {
      expect(CACHE_CONFIGS['appointments-list'].varyBy).toContain('Authorization');
      expect(CACHE_CONFIGS['appointments-list'].varyBy).toContain('X-Clinic-ID');
      expect(CACHE_CONFIGS['professionals-schedule'].varyBy).toContain('Authorization');
    });

    it('should skip sensitive data caching', () => {
      expect(CACHE_CONFIGS.patients.skipSensitive).toBe(true);
      expect(CACHE_CONFIGS['patient-records'].skipSensitive).toBe(true);
      expect(CACHE_CONFIGS['ai-chat'].skipSensitive).toBe(true);
    });
  });
});

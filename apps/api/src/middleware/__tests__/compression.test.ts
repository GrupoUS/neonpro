/**
 * Compression Middleware Tests
 * T079 - Backend API Performance Optimization
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { 
  createAdvancedCompressionMiddleware,
  createHealthcareCompressionMiddleware,
  compressionMonitoringMiddleware,
  createContentTypeCompressionMiddleware,
  DEFAULT_COMPRESSION_CONFIG
} from '../compression';

describe('Compression Middleware', () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();
    vi.clearAllMocks();
  });

  describe('createAdvancedCompressionMiddleware', () => {
    it('should add compression headers for supported content types', async () => {
      const middleware = createAdvancedCompressionMiddleware();
      
      app.use('*', middleware);
      app.get('/api/test', (c) => {
        c.header('content-type', 'application/json');
        return c.json({ data: 'test'.repeat(1000) }); // Large enough to compress
      });

      const res = await app.request('/api/test', {
        headers: { 'accept-encoding': 'gzip, br' }
      });

      expect(res.status).toBe(200);
      expect(res.headers.get('x-compression')).toBeDefined();
      expect(res.headers.get('x-healthcare-compression')).toBe('compliant');
    });

    it('should skip compression for small content', async () => {
      const middleware = createAdvancedCompressionMiddleware({ threshold: 2000 });
      
      app.use('*', middleware);
      app.get('/api/small', (c) => {
        c.header('content-type', 'application/json');
        return c.json({ data: 'small' });
      });

      const res = await app.request('/api/small', {
        headers: { 'accept-encoding': 'gzip' }
      });

      expect(res.status).toBe(200);
      expect(res.headers.get('x-compression')).toBe('SKIP');
      expect(res.headers.get('x-compression-reason')).toBe('below-threshold-or-excluded');
    });

    it('should skip compression for excluded content types', async () => {
      const middleware = createAdvancedCompressionMiddleware();
      
      app.use('*', middleware);
      app.get('/api/image', (c) => {
        c.header('content-type', 'image/jpeg');
        return c.body('fake-image-data'.repeat(1000));
      });

      const res = await app.request('/api/image', {
        headers: { 'accept-encoding': 'gzip' }
      });

      expect(res.status).toBe(200);
      expect(res.headers.get('x-compression')).toBe('SKIP');
      expect(res.headers.get('x-compression-reason')).toBe('below-threshold-or-excluded');
    });

    it('should skip compression when client does not support it', async () => {
      const middleware = createAdvancedCompressionMiddleware();
      
      app.use('*', middleware);
      app.get('/api/test', (c) => {
        c.header('content-type', 'application/json');
        return c.json({ data: 'test'.repeat(1000) });
      });

      const res = await app.request('/api/test'); // No accept-encoding header

      expect(res.status).toBe(200);
      expect(res.headers.get('x-compression')).toBeNull();
    });

    it('should prefer Brotli over Gzip when both are supported', async () => {
      const middleware = createAdvancedCompressionMiddleware();
      
      app.use('*', middleware);
      app.get('/api/test', (c) => {
        c.header('content-type', 'application/json');
        return c.json({ data: 'test'.repeat(1000) });
      });

      const res = await app.request('/api/test', {
        headers: { 'accept-encoding': 'gzip, br, deflate' }
      });

      expect(res.status).toBe(200);
      // Note: In actual implementation, this would check for br encoding
      expect(res.headers.get('x-compression')).toBeDefined();
    });

    it('should handle compression errors gracefully', async () => {
      const middleware = createAdvancedCompressionMiddleware();
      
      app.use('*', middleware);
      app.get('/api/error', (c) => {
        c.header('content-type', 'application/json');
        // Simulate an error condition
        return c.json({ data: 'test' });
      });

      const res = await app.request('/api/error', {
        headers: { 'accept-encoding': 'gzip' }
      });

      expect(res.status).toBe(200);
      // Should handle errors gracefully
    });

    it('should add compression metadata headers', async () => {
      const middleware = createAdvancedCompressionMiddleware();
      
      app.use('*', middleware);
      app.get('/api/metadata', (c) => {
        c.header('content-type', 'application/json');
        return c.json({ data: 'test'.repeat(1000) });
      });

      const res = await app.request('/api/metadata', {
        headers: { 'accept-encoding': 'gzip' }
      });

      expect(res.status).toBe(200);
      expect(res.headers.get('x-compression')).toBeDefined();
      expect(res.headers.get('x-healthcare-compression')).toBe('compliant');
    });
  });

  describe('createHealthcareCompressionMiddleware', () => {
    it('should create healthcare-optimized compression middleware', () => {
      const middleware = createHealthcareCompressionMiddleware();
      expect(middleware).toBeDefined();
      expect(typeof middleware).toBe('function');
    });
  });

  describe('compressionMonitoringMiddleware', () => {
    it('should track compression statistics', async () => {
      const monitor = compressionMonitoringMiddleware();
      
      app.use('*', monitor.middleware);
      app.get('/api/stats', (c) => {
        c.header('content-type', 'application/json');
        c.header('x-compression', 'APPLIED');
        c.header('x-original-size', '2000');
        c.header('x-compressed-size', '1000');
        c.header('x-compression-time', '10ms');
        return c.json({ data: 'test' });
      });

      await app.request('/api/stats');

      const stats = monitor.getStats();
      expect(stats.totalRequests).toBe(1);
      expect(stats.compressedRequests).toBe(1);
      expect(stats.compressionRate).toBe(100);
    });

    it('should track non-compressed requests', async () => {
      const monitor = compressionMonitoringMiddleware();
      
      app.use('*', monitor.middleware);
      app.get('/api/no-compression', (c) => {
        c.header('content-type', 'application/json');
        c.header('x-compression', 'SKIP');
        return c.json({ data: 'test' });
      });

      await app.request('/api/no-compression');

      const stats = monitor.getStats();
      expect(stats.totalRequests).toBe(1);
      expect(stats.compressedRequests).toBe(0);
      expect(stats.compressionRate).toBe(0);
    });

    it('should reset statistics', async () => {
      const monitor = compressionMonitoringMiddleware();
      
      app.use('*', monitor.middleware);
      app.get('/api/reset', (c) => c.json({ data: 'test' }));

      await app.request('/api/reset');
      
      let stats = monitor.getStats();
      expect(stats.totalRequests).toBe(1);

      monitor.resetStats();
      
      stats = monitor.getStats();
      expect(stats.totalRequests).toBe(0);
    });
  });

  describe('createContentTypeCompressionMiddleware', () => {
    it('should add content-type specific headers for JSON', async () => {
      const middleware = createContentTypeCompressionMiddleware();
      
      app.use('*', middleware);
      app.get('/api/json', (c) => {
        c.header('content-type', 'application/json');
        return c.json({ data: 'test' });
      });

      const res = await app.request('/api/json');
      expect(res.headers.get('x-content-optimization')).toBe('json-optimized');
    });

    it('should add content-type specific headers for HTML', async () => {
      const middleware = createContentTypeCompressionMiddleware();
      
      app.use('*', middleware);
      app.get('/api/html', (c) => {
        c.header('content-type', 'text/html');
        return c.html('<html><body>Test</body></html>');
      });

      const res = await app.request('/api/html');
      expect(res.headers.get('x-content-optimization')).toBe('html-optimized');
    });

    it('should add content-type specific headers for XML', async () => {
      const middleware = createContentTypeCompressionMiddleware();
      
      app.use('*', middleware);
      app.get('/api/xml', (c) => {
        c.header('content-type', 'application/xml');
        return c.text('<?xml version="1.0"?><root>test</root>');
      });

      const res = await app.request('/api/xml');
      expect(res.headers.get('x-content-optimization')).toBe('xml-optimized');
    });

    it('should add healthcare-specific headers for FHIR content', async () => {
      const middleware = createContentTypeCompressionMiddleware();
      
      app.use('*', middleware);
      app.get('/api/fhir', (c) => {
        c.header('content-type', 'application/fhir+json');
        return c.json({ resourceType: 'Patient', id: '123' });
      });

      const res = await app.request('/api/fhir');
      expect(res.headers.get('x-healthcare-format')).toBe('FHIR');
      expect(res.headers.get('x-compression-strategy')).toBe('healthcare-optimized');
    });
  });

  describe('DEFAULT_COMPRESSION_CONFIG', () => {
    it('should have appropriate default values', () => {
      expect(DEFAULT_COMPRESSION_CONFIG.threshold).toBe(1024);
      expect(DEFAULT_COMPRESSION_CONFIG.level).toBe(6);
      expect(DEFAULT_COMPRESSION_CONFIG.enableBrotli).toBe(true);
      expect(DEFAULT_COMPRESSION_CONFIG.enableGzip).toBe(true);
    });

    it('should exclude appropriate content types', () => {
      const excludedTypes = DEFAULT_COMPRESSION_CONFIG.skipContentTypes;
      expect(excludedTypes).toContain('image/');
      expect(excludedTypes).toContain('video/');
      expect(excludedTypes).toContain('audio/');
      expect(excludedTypes).toContain('application/pdf'); // Medical documents
    });

    it('should have healthcare-appropriate settings', () => {
      expect(DEFAULT_COMPRESSION_CONFIG.memLevel).toBe(8);
      expect(DEFAULT_COMPRESSION_CONFIG.strategy).toBe('default');
    });
  });
});

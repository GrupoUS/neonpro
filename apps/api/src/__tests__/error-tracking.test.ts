/**
 * Error tracking integration tests
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { ErrorTrackingManager } from '../lib/error-tracking';

describe('ErrorTrackingManager', () => {
  let errorTracker: ErrorTrackingManager;

  beforeEach(() => {
    errorTracker = new ErrorTrackingManager();
  });

  describe('Configuration', () => {
    it('should use default configuration', () => {
      const config = errorTracker.getConfig();
      expect(config.provider).toBe('custom');
      expect(config.environment).toBe('test');
      expect(config.enableInTesting).toBe(true);
    });

    it('should merge custom configuration', () => {
      const customTracker = new ErrorTrackingManager({
        provider: 'sentry',
        sampleRate: 0.5,
        tags: { service: 'api' },
      });

      const config = customTracker.getConfig();
      expect(config.provider).toBe('sentry');
      expect(config.sampleRate).toBe(0.5);
      expect(config.tags?.service).toBe('api');
    });
  });

  describe('Initialization', () => {
    it('should initialize custom provider successfully', async () => {
      await errorTracker.initialize();
      expect(errorTracker.isReady()).toBe(true);
    });

    it('should skip initialization for disabled environments', async () => {
      const disabledTracker = new ErrorTrackingManager({
        provider: 'sentry',
        environment: 'test',
        enableInTesting: false,
      });

      await disabledTracker.initialize();
      expect(disabledTracker.isReady()).toBe(false);
    });
  });

  describe('Error Capturing', () => {
    beforeEach(async () => {
      await errorTracker.initialize();
    });

    it('should capture exceptions with context', () => {
      const error = new Error('Test error');
      const context = {
        requestId: 'req-123',
        userId: 'user-456',
        endpoint: '/api/test',
        method: 'POST',
      };

      expect(() => {
        errorTracker.captureException(error, context);
      }).not.toThrow();
    });

    it('should capture messages with different levels', () => {
      expect(() => {
        errorTracker.captureMessage('Test message', 'info');
        errorTracker.captureMessage('Warning message', 'warning');
        errorTracker.captureMessage('Error message', 'error');
      }).not.toThrow();
    });

    it('should handle missing provider gracefully', () => {
      const uninitializedTracker = new ErrorTrackingManager();
      const error = new Error('Test error');

      expect(() => {
        uninitializedTracker.captureException(error);
      }).not.toThrow();
    });
  });

  describe('Context Extraction', () => {
    beforeEach(async () => {
      await errorTracker.initialize();
    });

    it('should extract context from Hono context mock', () => {
      const mockHonoContext = {
        get: (key: string) => {
          const values: Record<string, any> = {
            requestId: 'req-123',
            userId: 'user-456',
            clinicId: 'clinic-789',
          };
          return values[key];
        },
        req: {
          path: '/api/v1/patients',
          method: 'GET',
          param: () => 'patient-123',
          query: () => undefined,
          header: (name: string) => {
            const headers: Record<string, string> = {
              'user-agent': 'Test Agent',
              'x-forwarded-for': '192.168.1.1',
            };
            return headers[name];
          },
        },
      };

      const context = errorTracker.extractContextFromHono(mockHonoContext as any);

      expect(context.requestId).toBe('req-123');
      expect(context.userId).toBe('user-456');
      expect(context.clinicId).toBe('clinic-789');
      expect(context.endpoint).toBe('/api/v1/patients');
      expect(context.method).toBe('GET');
      expect(context.userAgent).toBe('Test Agent');
      expect(context.ip).toBe('192.168.1.1');
      expect(context.patientId).toBe('patient-123');
    });

    it('should handle missing context gracefully', () => {
      const mockHonoContext = {
        get: () => undefined,
        req: {
          path: '/unknown',
          method: 'UNKNOWN',
          param: () => undefined,
          query: () => undefined,
          header: () => undefined,
        },
      };

      const context = errorTracker.extractContextFromHono(mockHonoContext as any);

      expect(context.requestId).toBe('unknown');
      expect(context.endpoint).toBe('/unknown');
      expect(context.method).toBe('UNKNOWN');
      expect(context.timestamp).toBeDefined();
      expect(context.environment).toBe('test');
    });
  });

  describe('Breadcrumb Management', () => {
    beforeEach(async () => {
      await errorTracker.initialize();
    });

    it('should add breadcrumbs without errors', () => {
      expect(() => {
        errorTracker.addBreadcrumb('Test breadcrumb', 'navigation', { page: 'test' });
      }).not.toThrow();
    });
  });

  describe('Environment Detection', () => {
    it('should correctly detect production environment', () => {
      const prodTracker = new ErrorTrackingManager({
        environment: 'production',
        enableInProduction: true,
      });

      expect(prodTracker['shouldEnableTracking']()).toBe(true);
    });

    it('should correctly detect development environment', () => {
      const devTracker = new ErrorTrackingManager({
        environment: 'development',
        enableInDevelopment: true,
      });

      expect(devTracker['shouldEnableTracking']()).toBe(true);
    });

    it('should respect environment-specific disabling', () => {
      const disabledTracker = new ErrorTrackingManager({
        environment: 'production',
        enableInProduction: false,
      });

      expect(disabledTracker['shouldEnableTracking']()).toBe(false);
    });
  });

  describe('Configuration Validation', () => {
    it('should accept valid sample rate', () => {
      const config = new ErrorTrackingManager({
        sampleRate: 0.5,
      }).getConfig();

      expect(config.sampleRate).toBe(0.5);
      expect(config.sampleRate).toBeLessThanOrEqual(1.0);
      expect(config.sampleRate).toBeGreaterThanOrEqual(0.0);
    });
  });
});

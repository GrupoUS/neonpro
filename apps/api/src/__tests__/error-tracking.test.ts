/**
 * Error tracking integration tests
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { ErrorTrackingManager } from '../lib/error-tracking';

describe(_'ErrorTrackingManager',_() => {
  let errorTracker: ErrorTrackingManager;

  beforeEach(_() => {
    errorTracker = new ErrorTrackingManager();
  });

  describe(_'Configuration',_() => {
    it(_'should use default configuration',_() => {
      const config = errorTracker.getConfig();
      expect(config.provider).toBe('custom');
      expect(config.environment).toBe('test');
      expect(config.enableInTesting).toBe(true);
    });

    it(_'should merge custom configuration',_() => {
      const customTracker = new ErrorTrackingManager({
        provider: 'sentry',
        sampleRate: 0.5,
        tags: { _service: 'api' },
      });

      const config = customTracker.getConfig();
      expect(config.provider).toBe('sentry');
      expect(config.sampleRate).toBe(0.5);
      expect(config.tags?._service).toBe('api');
    });
  });

  describe(_'Initialization',_() => {
    it(_'should initialize custom provider successfully',_async () => {
      await errorTracker.initialize();
      expect(errorTracker.isReady()).toBe(true);
    });

    it(_'should skip initialization for disabled environments',_async () => {
      const disabledTracker = new ErrorTrackingManager({
        provider: 'sentry',
        environment: 'test',
        enableInTesting: false,
      });

      await disabledTracker.initialize();
      expect(disabledTracker.isReady()).toBe(false);
    });
  });

  describe(_'Error Capturing',_() => {
    beforeEach(_async () => {
      await errorTracker.initialize();
    });

    it(_'should capture exceptions with context',_() => {
      const error = new Error('Test error');
      const context = {
        requestId: 'req-123',
        _userId: 'user-456',
        endpoint: '/api/test',
        method: 'POST',
      };

      expect(_() => {
        errorTracker.captureException(error, _context);
      }).not.toThrow();
    });

    it(_'should capture messages with different levels',_() => {
      expect(_() => {
        errorTracker.captureMessage('Test message', 'info');
        errorTracker.captureMessage('Warning message', 'warning');
        errorTracker.captureMessage('Error message', 'error');
      }).not.toThrow();
    });

    it(_'should handle missing provider gracefully',_() => {
      const uninitializedTracker = new ErrorTrackingManager();
      const error = new Error('Test error');

      expect(_() => {
        uninitializedTracker.captureException(error);
      }).not.toThrow();
    });
  });

  describe(_'Context Extraction',_() => {
    beforeEach(_async () => {
      await errorTracker.initialize();
    });

    it(_'should extract context from Hono context mock',_() => {
      const mockHonoContext = {
        get: (key: string) => {
          const values: Record<string, any> = {
            requestId: 'req-123',
            _userId: 'user-456',
            clinicId: 'clinic-789',
          };
          return values[key];
        },
        req: {
          path: '/api/v1/patients',
          method: 'GET',
          param: () => 'patient-123',
          _query: () => undefined,
          header: (name: string) => {
            const headers: Record<string, string> = {
              'user-agent': 'Test Agent',
              'x-forwarded-for': '192.168.1.1',
            };
            return headers[name];
          },
        },
      };

      const context = errorTracker.extractContextFromHono(
        mockHonoContext as any,
      );

      expect(context.requestId).toBe('req-123');
      expect(context._userId).toBe('user-456');
      expect(context.clinicId).toBe('clinic-789');
      expect(context.endpoint).toBe('/api/v1/patients');
      expect(context.method).toBe('GET');
      expect(context.userAgent).toBe('Test Agent');
      expect(context.ip).toBe('192.168.1.1');
      expect(context.patientId).toBe('patient-123');
    });

    it(_'should handle missing context gracefully',_() => {
      const mockHonoContext = {
        get: () => undefined,
        req: {
          path: '/unknown',
          method: 'UNKNOWN',
          param: () => undefined,
          _query: () => undefined,
          header: () => undefined,
        },
      };

      const context = errorTracker.extractContextFromHono(
        mockHonoContext as any,
      );

      expect(context.requestId).toBe('unknown');
      expect(context.endpoint).toBe('/unknown');
      expect(context.method).toBe('UNKNOWN');
      expect(context.timestamp).toBeDefined();
      expect(context.environment).toBe('test');
    });
  });

  describe(_'Breadcrumb Management',_() => {
    beforeEach(_async () => {
      await errorTracker.initialize();
    });

    it(_'should add breadcrumbs without errors',_() => {
      expect(_() => {
        errorTracker.addBreadcrumb('Test breadcrumb', 'navigation', {
          page: 'test',
        });
      }).not.toThrow();
    });
  });

  describe(_'Environment Detection',_() => {
    it(_'should correctly detect production environment',_() => {
      const prodTracker = new ErrorTrackingManager({
        environment: 'production',
        enableInProduction: true,
      });

      expect(prodTracker['shouldEnableTracking']()).toBe(true);
    });

    it(_'should correctly detect development environment',_() => {
      const devTracker = new ErrorTrackingManager({
        environment: 'development',
        enableInDevelopment: true,
      });

      expect(devTracker['shouldEnableTracking']()).toBe(true);
    });

    it(_'should respect environment-specific disabling',_() => {
      const disabledTracker = new ErrorTrackingManager({
        environment: 'production',
        enableInProduction: false,
      });

      expect(disabledTracker['shouldEnableTracking']()).toBe(false);
    });
  });

  describe(_'Configuration Validation',_() => {
    it(_'should accept valid sample rate',_() => {
      const config = new ErrorTrackingManager({
        sampleRate: 0.5,
      }).getConfig();

      expect(config.sampleRate).toBe(0.5);
      expect(config.sampleRate).toBeLessThanOrEqual(1.0);
      expect(config.sampleRate).toBeGreaterThanOrEqual(0.0);
    });
  });
});

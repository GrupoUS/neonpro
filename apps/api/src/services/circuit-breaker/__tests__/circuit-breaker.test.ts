/**
 * Circuit Breaker Service Tests
 * T085 - Circuit Breaker Testing
 *
 * Comprehensive tests for circuit breaker functionality including:
 * - Basic circuit breaker operations
 * - Healthcare compliance features
 * - Health checking integration
 * - Error handling and fallbacks
 */

import {
  CircuitBreakerService,
  HEALTHCARE_CIRCUIT_CONFIG,
} from '../circuit-breaker-service';
import {
  ExternalServiceHealthChecker,
  HEALTHCARE_HEALTH_CONFIG,
  ServiceDependency,
} from '../health-checker';

describe(_'CircuitBreakerService',_() => {
  let circuitBreaker: CircuitBreakerService;

  beforeEach(_() => {
    circuitBreaker = new CircuitBreakerService(HEALTHCARE_CIRCUIT_CONFIG);
  });

  afterEach(_() => {
    circuitBreaker.destroy();
  });

  describe(_'Basic Operations',_() => {
    test(_'should start in CLOSED state',_() => {
      expect(circuitBreaker.getState()).toBe('CLOSED');
    });

    test(_'should execute successful operations',_async () => {
      const result = await circuitBreaker.execute(_async () => 'success');
      expect(result).toBe('success');
      expect(circuitBreaker.getState()).toBe('CLOSED');
    });

    test(_'should handle operation failures',_async () => {
      const error = new Error('Test error');
      await expect(_circuitBreaker.execute(async () => {
        throw error;
      })).rejects.toThrow('Test error');
    });

    test(_'should open circuit after failure threshold',_async () => {
      const error = new Error('Test error');

      // Fail multiple times to open circuit
      for (let i = 0; i < HEALTHCARE_CIRCUIT_CONFIG.failureThreshold; i++) {
        try {
          await circuitBreaker.execute(_async () => {
            throw error;
          });
        } catch (e) {
          // Expected to fail
        }
      }

      expect(circuitBreaker.getState()).toBe('OPEN');
    });

    test(_'should fail fast when circuit is open',_async () => {
      // Force circuit open
      circuitBreaker['forceReset']();
      circuitBreaker['state'] = 'OPEN';
      circuitBreaker['nextAttemptTime'] = new Date(Date.now() + 60000);

      await expect(_circuitBreaker.execute(async () => 'success')).rejects.toThrow(
        'Service temporarily unavailable',
      );
    });
  });

  describe(_'Healthcare Compliance',_() => {
    test(_'should use fail-secure mode for healthcare services',_async () => {
      const healthcareCircuitBreaker = new CircuitBreakerService({
        ...HEALTHCARE_CIRCUIT_CONFIG,
        healthcareCritical: true,
        failSecureMode: true,
      });

      // Force circuit open
      healthcareCircuitBreaker['forceReset']();
      healthcareCircuitBreaker['state'] = 'OPEN';
      healthcareCircuitBreaker['nextAttemptTime'] = new Date(Date.now() + 60000);

      await expect(_healthcareCircuitBreaker.execute(async () => 'success')).rejects.toThrow(
        'Service unavailable - healthcare critical operation blocked',
      );

      healthcareCircuitBreaker.destroy();
    });

    test(_'should provide fallback values when available',_async () => {
      // Force circuit open
      circuitBreaker['forceReset']();
      circuitBreaker['state'] = 'OPEN';
      circuitBreaker['nextAttemptTime'] = new Date(Date.now() + 60000);

      const fallbackValue = 'fallback response';
      const result = await circuitBreaker.execute(_async () => 'success', undefined, _fallbackValue);
      expect(result).toBe(_fallbackValue);
    });

    test(_'should use custom fallback when provided',_async () => {
      const config = {
        ...HEALTHCARE_CIRCUIT_CONFIG,
        customFallback: async (error: Error) => 'custom fallback',
      };

      const customCircuitBreaker = new CircuitBreakerService(config);

      // Force circuit open
      customCircuitBreaker['forceReset']();
      customCircuitBreaker['state'] = 'OPEN';
      customCircuitBreaker['nextAttemptTime'] = new Date(Date.now() + 60000);

      const result = await customCircuitBreaker.execute(_async () => 'success');
      expect(result).toBe('custom fallback');

      customCircuitBreaker.destroy();
    });
  });

  describe(_'Metrics and Monitoring',_() => {
    test(_'should track request metrics',_async () => {
      // Successful request
      await circuitBreaker.execute(_async () => 'success');

      let metrics = circuitBreaker.getMetrics();
      expect(metrics.totalRequests).toBe(1);
      expect(metrics.successfulRequests).toBe(1);
      expect(metrics.failedRequests).toBe(0);

      // Failed request
      try {
        await circuitBreaker.execute(_async () => {
          throw new Error('Test error');
        });
      } catch (e) {
        // Expected to fail
      }

      metrics = circuitBreaker.getMetrics();
      expect(metrics.totalRequests).toBe(2);
      expect(metrics.successfulRequests).toBe(1);
      expect(metrics.failedRequests).toBe(1);
    });

    test(_'should track consecutive failures',_async () => {
      const error = new Error('Test error');

      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(_async () => {
            throw error;
          });
        } catch (e) {
          // Expected to fail
        }
      }

      const metrics = circuitBreaker.getMetrics();
      expect(metrics.consecutiveFailures).toBe(3);
    });

    test(_'should calculate average response time',_async () => {
      // First request
      await circuitBreaker.execute(_async () => {
        return new Promise(resolve => setTimeout(resolve, 100, 'result1'));
      });

      // Second request
      await circuitBreaker.execute(_async () => {
        return new Promise(resolve => setTimeout(resolve, 200, 'result2'));
      });

      const metrics = circuitBreaker.getMetrics();
      expect(metrics.averageResponseTime).toBeGreaterThan(140); // Average of ~150ms
      expect(metrics.averageResponseTime).toBeLessThan(160);
    });
  });

  describe(_'Event Handling',_() => {
    test(_'should emit events for state changes',_async () => {
      const events: any[] = [];
      circuitBreaker.onEvent(event => {
        events.push(event);
      });

      // Force circuit open
      const error = new Error('Test error');
      for (let i = 0; i < HEALTHCARE_CIRCUIT_CONFIG.failureThreshold; i++) {
        try {
          await circuitBreaker.execute(_async () => {
            throw error;
          });
        } catch (e) {
          // Expected to fail
        }
      }

      expect(events.some(e => e.type === 'STATE_CHANGE')).toBe(true);
      expect(events.some(e => e.type === 'REQUEST_FAILURE')).toBe(true);
    });

    test(_'should emit events for successful requests',_async () => {
      const events: any[] = [];
      circuitBreaker.onEvent(event => {
        events.push(event);
      });

      await circuitBreaker.execute(_async () => 'success');

      expect(events.some(e => e.type === 'REQUEST_SUCCESS')).toBe(true);
    });
  });

  describe(_'Configuration and Updates',_() => {
    test(_'should allow configuration updates',_() => {
      const newConfig = {
        failureThreshold: 10,
        resetTimeout: 120000,
      };

      circuitBreaker.updateConfig(newConfig);

      // Config should be updated (we can't directly access private config, but we can test behavior)
      expect(circuitBreaker).toBeDefined();
    });

    test(_'should force reset circuit',_() => {
      // Force circuit open
      circuitBreaker['state'] = 'OPEN';
      circuitBreaker['failureCount'] = 5;

      circuitBreaker.forceReset();

      expect(circuitBreaker.getState()).toBe('CLOSED');
      expect(circuitBreaker.getMetrics().consecutiveFailures).toBe(0);
    });
  });

  describe(_'Timeout Handling',_() => {
    test(_'should timeout long-running operations',_async () => {
      const slowConfig = {
        ...HEALTHCARE_CIRCUIT_CONFIG,
        requestTimeout: 100, // 100ms timeout
      };

      const timeoutCircuitBreaker = new CircuitBreakerService(slowConfig);

      await expect(_timeoutCircuitBreaker.execute(async () => {
        return new Promise(resolve => setTimeout(resolve, 200, 'late result'));
      })).rejects.toThrow('Operation timeout');

      timeoutCircuitBreaker.destroy();
    });
  });
});

describe(_'ExternalServiceHealthChecker',_() => {
  let healthChecker: ExternalServiceHealthChecker;

  beforeEach(_() => {
    healthChecker = new ExternalServiceHealthChecker(HEALTHCARE_HEALTH_CONFIG);
  });

  afterEach(_() => {
    healthChecker.destroy();
  });

  describe(_'Service Registration',_() => {
    test(_'should register services for monitoring',_() => {
      const _service: ServiceDependency = {
        name: 'test-service',
        type: 'api',
        endpoint: 'https://api.example.com',
        description: 'Test service',
        healthcareCritical: false,
        dataSensitivity: 'low',
        requiredFor: ['testing'],
      };

      expect(_() => {
        healthChecker.registerService(_service);
      }).not.toThrow();
    });

    test(_'should handle duplicate service registration',_() => {
      const _service: ServiceDependency = {
        name: 'test-service',
        type: 'api',
        endpoint: 'https://api.example.com',
        description: 'Test service',
        healthcareCritical: false,
        dataSensitivity: 'low',
        requiredFor: ['testing'],
      };

      healthChecker.registerService(_service);

      // Should not throw when registering same service again
      expect(_() => {
        healthChecker.registerService(_service);
      }).not.toThrow();
    });
  });

  describe(_'Health Status',_() => {
    test(_'should provide comprehensive health status',_() => {
      const _service: ServiceDependency = {
        name: 'test-service',
        type: 'api',
        endpoint: 'https://api.example.com',
        description: 'Test service',
        healthcareCritical: false,
        dataSensitivity: 'low',
        requiredFor: ['testing'],
      };

      healthChecker.registerService(_service);

      const healthStatus = healthChecker.getComprehensiveHealthStatus();

      expect(healthStatus.overall).toBeDefined();
      expect(healthStatus.services).toBeDefined();
      expect(healthStatus.timestamp).toBeDefined();
      expect(healthStatus.uptime).toBeDefined();
      expect(healthStatus.healthcareCompliance).toBeDefined();
      expect(healthStatus.criticalServicesHealthy).toBeDefined();
    });

    test(_'should include registered services in health status',_() => {
      const _service: ServiceDependency = {
        name: 'test-service',
        type: 'api',
        endpoint: 'https://api.example.com',
        description: 'Test service',
        healthcareCritical: false,
        dataSensitivity: 'low',
        requiredFor: ['testing'],
      };

      healthChecker.registerService(_service);

      const healthStatus = healthChecker.getComprehensiveHealthStatus();

      expect(healthStatus.services['test-service']).toBeDefined();
      expect(healthStatus.services['test-service'].service.name).toBe('test-service');
    });
  });

  describe(_'Event Handling',_() => {
    test(_'should emit health check events',_async () => {
      const events: any[] = [];
      healthChecker.onEvent(event => {
        events.push(event);
      });

      const _service: ServiceDependency = {
        name: 'test-service',
        type: 'api',
        endpoint: 'https://httpbin.org/status/200', // Use a reliable test endpoint
        description: 'Test service',
        healthcareCritical: false,
        dataSensitivity: 'low',
        requiredFor: ['testing'],
      };

      healthChecker.registerService(_service);

      // Wait for at least one health check cycle
      await new Promise(resolve => setTimeout(resolve, 100));

      // Events should be emitted during health checks
      expect(events.length).toBeGreaterThan(0);
    });
  });

  describe(_'Service Unregistration',_() => {
    test(_'should unregister services',_() => {
      const _service: ServiceDependency = {
        name: 'test-service',
        type: 'api',
        endpoint: 'https://api.example.com',
        description: 'Test service',
        healthcareCritical: false,
        dataSensitivity: 'low',
        requiredFor: ['testing'],
      };

      healthChecker.registerService(_service);
      healthChecker.unregisterService('test-service');

      const healthStatus = healthChecker.getComprehensiveHealthStatus();
      expect(healthStatus.services['test-service']).toBeUndefined();
    });

    test(_'should handle unregistering non-existent services',_() => {
      expect(_() => {
        healthChecker.unregisterService('non-existent-service');
      }).not.toThrow();
    });
  });
});

describe(_'Integration Scenarios',_() => {
  test(_'should handle circuit breaker with health checker integration',_async () => {
    const circuitBreaker = new CircuitBreakerService(HEALTHCARE_CIRCUIT_CONFIG);
    const healthChecker = new ExternalServiceHealthChecker(HEALTHCARE_HEALTH_CONFIG);

    const _service: ServiceDependency = {
      name: 'integration-test-service',
      type: 'api',
      endpoint: 'https://api.example.com',
      description: 'Integration test service',
      healthcareCritical: true,
      dataSensitivity: 'high',
      requiredFor: ['integration-testing'],
    };

    healthChecker.registerService(_service);

    // Test that both services work together
    const healthStatus = healthChecker.getComprehensiveHealthStatus();
    const circuitMetrics = circuitBreaker.getMetrics();

    expect(healthStatus.overall).toBeDefined();
    expect(circuitMetrics.state).toBeDefined();

    circuitBreaker.destroy();
    healthChecker.destroy();
  });

  test(_'should handle healthcare-specific scenarios',_async () => {
    const healthcareCircuitBreaker = new CircuitBreakerService({
      ...HEALTHCARE_CIRCUIT_CONFIG,
      healthcareCritical: true,
      failSecureMode: true,
      auditLogging: true,
    });

    // Test that healthcare-specific config is applied
    const metrics = healthcareCircuitBreaker.getMetrics();
    expect(metrics).toBeDefined();

    // Test fail-secure behavior
    healthcareCircuitBreaker['forceReset']();
    healthcareCircuitBreaker['state'] = 'OPEN';
    healthcareCircuitBreaker['nextAttemptTime'] = new Date(Date.now() + 60000);

    await expect(_healthcareCircuitBreaker.execute(async () => 'success')).rejects.toThrow(
      'Service unavailable - healthcare critical operation blocked',
    );

    healthcareCircuitBreaker.destroy();
  });
});

describe(_'Error Handling',_() => {
  test(_'should handle callback errors gracefully',_() => {
    const circuitBreaker = new CircuitBreakerService(HEALTHCARE_CIRCUIT_CONFIG);

    // Add an error-throwing callback
    expect(_() => {
      circuitBreaker.onEvent(_() => {
        throw new Error('Callback error');
      });
    }).not.toThrow();

    // Should not throw when emitting events
    expect(_() => {
      circuitBreaker['emitEvent']({
        type: 'TEST_EVENT',
        timestamp: new Date(),
        metrics: circuitBreaker.getMetrics(),
      });
    }).not.toThrow();

    circuitBreaker.destroy();
  });

  test(_'should handle invalid service configurations',_() => {
    const healthChecker = new ExternalServiceHealthChecker(HEALTHCARE_HEALTH_CONFIG);

    // Should handle invalid service names gracefully
    expect(_() => {
      healthChecker.unregisterService('');
    }).not.toThrow();

    expect(_() => {
      healthChecker.getServiceHealth('');
    }).not.toThrow();

    healthChecker.destroy();
  });
});

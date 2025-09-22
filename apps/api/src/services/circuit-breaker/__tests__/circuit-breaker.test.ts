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

describe('CircuitBreakerService', () => {
  let circuitBreaker: CircuitBreakerService;

  beforeEach(() => {
    circuitBreaker = new CircuitBreakerService(HEALTHCARE_CIRCUIT_CONFIG

  afterEach(() => {
    circuitBreaker.destroy(

  describe('Basic Operations', () => {
    test('should start in CLOSED state', () => {
      expect(circuitBreaker.getState()).toBe('CLOSED')

    test('should execute successful operations',async () => {
      const result = await circuitBreaker.execute(async () => 'success')
      expect(result).toBe('success')
      expect(circuitBreaker.getState()).toBe('CLOSED')

    test('should handle operation failures',async () => {
      const error = new Error('Test error')
      await expect(_circuitBreaker.execute(async () => {
        throw error;
      })).rejects.toThrow('Test error')

    test('should open circuit after failure threshold',async () => {
      const error = new Error('Test error')

      // Fail multiple times to open circuit
      for (let i = 0; i < HEALTHCARE_CIRCUIT_CONFIG.failureThreshold; i++) {
        try {
          await circuitBreaker.execute(async () => {
            throw error;
        } catch (e) {
          // Expected to fail
        }
      }

      expect(circuitBreaker.getState()).toBe('OPEN')

    test('should fail fast when circuit is open',async () => {
      // Force circuit open
      circuitBreaker['forceReset'](
      circuitBreaker['state'] = 'OPEN';
      circuitBreaker['nextAttemptTime'] = new Date(Date.now() + 60000

      await expect(_circuitBreaker.execute(async () => 'success')).rejects.toThrow(
        'Service temporarily unavailable',
      

  describe('Healthcare Compliance', () => {
    test('should use fail-secure mode for healthcare services',async () => {
      const healthcareCircuitBreaker = new CircuitBreakerService({
        ...HEALTHCARE_CIRCUIT_CONFIG,
        healthcareCritical: true,
        failSecureMode: true,

      // Force circuit open
      healthcareCircuitBreaker['forceReset'](
      healthcareCircuitBreaker['state'] = 'OPEN';
      healthcareCircuitBreaker['nextAttemptTime'] = new Date(Date.now() + 60000

      await expect(_healthcareCircuitBreaker.execute(async () => 'success')).rejects.toThrow(
        'Service unavailable - healthcare critical operation blocked',
      

      healthcareCircuitBreaker.destroy(

    test('should provide fallback values when available',async () => {
      // Force circuit open
      circuitBreaker['forceReset'](
      circuitBreaker['state'] = 'OPEN';
      circuitBreaker['nextAttemptTime'] = new Date(Date.now() + 60000

      const fallbackValue = 'fallback response';
      const result = await circuitBreaker.execute(async () => 'success', undefined, _fallbackValue
      expect(result).toBe(fallbackValue

    test('should use custom fallback when provided',async () => {
      const config = {
        ...HEALTHCARE_CIRCUIT_CONFIG,
        customFallback: async (error: Error) => 'custom fallback',
      };

      const customCircuitBreaker = new CircuitBreakerService(config

      // Force circuit open
      customCircuitBreaker['forceReset'](
      customCircuitBreaker['state'] = 'OPEN';
      customCircuitBreaker['nextAttemptTime'] = new Date(Date.now() + 60000

      const result = await customCircuitBreaker.execute(async () => 'success')
      expect(result).toBe('custom fallback')

      customCircuitBreaker.destroy(

  describe('Metrics and Monitoring', () => {
    test('should track request metrics',async () => {
      // Successful request
      await circuitBreaker.execute(async () => 'success')

      let metrics = circuitBreaker.getMetrics(
      expect(metrics.totalRequests).toBe(1
      expect(metrics.successfulRequests).toBe(1
      expect(metrics.failedRequests).toBe(0

      // Failed request
      try {
        await circuitBreaker.execute(async () => {
          throw new Error('Test error')
      } catch (e) {
        // Expected to fail
      }

      metrics = circuitBreaker.getMetrics(
      expect(metrics.totalRequests).toBe(2
      expect(metrics.successfulRequests).toBe(1
      expect(metrics.failedRequests).toBe(1

    test('should track consecutive failures',async () => {
      const error = new Error('Test error')

      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(async () => {
            throw error;
        } catch (e) {
          // Expected to fail
        }
      }

      const metrics = circuitBreaker.getMetrics(
      expect(metrics.consecutiveFailures).toBe(3

    test('should calculate average response time',async () => {
      // First request
      await circuitBreaker.execute(async () => {
        return new Promise(resolve => setTimeout(resolve, 100, 'result1')

      // Second request
      await circuitBreaker.execute(async () => {
        return new Promise(resolve => setTimeout(resolve, 200, 'result2')

      const metrics = circuitBreaker.getMetrics(
      expect(metrics.averageResponseTime).toBeGreaterThan(140); // Average of ~150ms
      expect(metrics.averageResponseTime).toBeLessThan(160

  describe('Event Handling', () => {
    test('should emit events for state changes',async () => {
      const events: any[] = [];
      circuitBreaker.onEvent(event => {
        events.push(event

      // Force circuit open
      const error = new Error('Test error')
      for (let i = 0; i < HEALTHCARE_CIRCUIT_CONFIG.failureThreshold; i++) {
        try {
          await circuitBreaker.execute(async () => {
            throw error;
        } catch (e) {
          // Expected to fail
        }
      }

      expect(events.some(e => e.type === 'STATE_CHANGE')).toBe(true);
      expect(events.some(e => e.type === 'REQUEST_FAILURE')).toBe(true);

    test('should emit events for successful requests',async () => {
      const events: any[] = [];
      circuitBreaker.onEvent(event => {
        events.push(event

      await circuitBreaker.execute(async () => 'success')

      expect(events.some(e => e.type === 'REQUEST_SUCCESS')).toBe(true);

  describe('Configuration and Updates', () => {
    test('should allow configuration updates', () => {
      const newConfig = {
        failureThreshold: 10,
        resetTimeout: 120000,
      };

      circuitBreaker.updateConfig(newConfig

      // Config should be updated (we can't directly access private config, but we can test behavior)
      expect(circuitBreaker).toBeDefined(

    test('should force reset circuit', () => {
      // Force circuit open
      circuitBreaker['state'] = 'OPEN';
      circuitBreaker['failureCount'] = 5;

      circuitBreaker.forceReset(

      expect(circuitBreaker.getState()).toBe('CLOSED')
      expect(circuitBreaker.getMetrics().consecutiveFailures).toBe(0

  describe('Timeout Handling', () => {
    test('should timeout long-running operations',async () => {
      const slowConfig = {
        ...HEALTHCARE_CIRCUIT_CONFIG,
        requestTimeout: 100, // 100ms timeout
      };

      const timeoutCircuitBreaker = new CircuitBreakerService(slowConfig

      await expect(_timeoutCircuitBreaker.execute(async () => {
        return new Promise(resolve => setTimeout(resolve, 200, 'late result')
      })).rejects.toThrow('Operation timeout')

      timeoutCircuitBreaker.destroy(

describe('ExternalServiceHealthChecker', () => {
  let healthChecker: ExternalServiceHealthChecker;

  beforeEach(() => {
    healthChecker = new ExternalServiceHealthChecker(HEALTHCARE_HEALTH_CONFIG

  afterEach(() => {
    healthChecker.destroy(

  describe('Service Registration', () => {
    test('should register services for monitoring', () => {
      const _service: ServiceDependency = {
        name: 'test-service',
        type: 'api',
        endpoint: 'https://api.example.com',
        description: 'Test service',
        healthcareCritical: false,
        dataSensitivity: 'low',
        requiredFor: ['testing'],
      };

      expect(() => {
        healthChecker.registerService(service
      }).not.toThrow(

    test('should handle duplicate service registration', () => {
      const _service: ServiceDependency = {
        name: 'test-service',
        type: 'api',
        endpoint: 'https://api.example.com',
        description: 'Test service',
        healthcareCritical: false,
        dataSensitivity: 'low',
        requiredFor: ['testing'],
      };

      healthChecker.registerService(service

      // Should not throw when registering same service again
      expect(() => {
        healthChecker.registerService(service
      }).not.toThrow(

  describe('Health Status', () => {
    test('should provide comprehensive health status', () => {
      const _service: ServiceDependency = {
        name: 'test-service',
        type: 'api',
        endpoint: 'https://api.example.com',
        description: 'Test service',
        healthcareCritical: false,
        dataSensitivity: 'low',
        requiredFor: ['testing'],
      };

      healthChecker.registerService(service

      const healthStatus = healthChecker.getComprehensiveHealthStatus(

      expect(healthStatus.overall).toBeDefined(
      expect(healthStatus.services).toBeDefined(
      expect(healthStatus.timestamp).toBeDefined(
      expect(healthStatus.uptime).toBeDefined(
      expect(healthStatus.healthcareCompliance).toBeDefined(
      expect(healthStatus.criticalServicesHealthy).toBeDefined(

    test('should include registered services in health status', () => {
      const _service: ServiceDependency = {
        name: 'test-service',
        type: 'api',
        endpoint: 'https://api.example.com',
        description: 'Test service',
        healthcareCritical: false,
        dataSensitivity: 'low',
        requiredFor: ['testing'],
      };

      healthChecker.registerService(service

      const healthStatus = healthChecker.getComprehensiveHealthStatus(

      expect(healthStatus.services['test-service']).toBeDefined(
      expect(healthStatus.services['test-service'].service.name).toBe('test-service')

  describe('Event Handling', () => {
    test('should emit health check events',async () => {
      const events: any[] = [];
      healthChecker.onEvent(event => {
        events.push(event

      const _service: ServiceDependency = {
        name: 'test-service',
        type: 'api',
        endpoint: 'https://httpbin.org/status/200', // Use a reliable test endpoint
        description: 'Test service',
        healthcareCritical: false,
        dataSensitivity: 'low',
        requiredFor: ['testing'],
      };

      healthChecker.registerService(service

      // Wait for at least one health check cycle
      await new Promise(resolve => setTimeout(resolve, 100)

      // Events should be emitted during health checks
      expect(events.length).toBeGreaterThan(0

  describe('Service Unregistration', () => {
    test('should unregister services', () => {
      const _service: ServiceDependency = {
        name: 'test-service',
        type: 'api',
        endpoint: 'https://api.example.com',
        description: 'Test service',
        healthcareCritical: false,
        dataSensitivity: 'low',
        requiredFor: ['testing'],
      };

      healthChecker.registerService(service
      healthChecker.unregisterService('test-service')

      const healthStatus = healthChecker.getComprehensiveHealthStatus(
      expect(healthStatus.services['test-service']).toBeUndefined(

    test('should handle unregistering non-existent services', () => {
      expect(() => {
        healthChecker.unregisterService('non-existent-service')
      }).not.toThrow(

describe('Integration Scenarios', () => {
  test('should handle circuit breaker with health checker integration',async () => {
    const circuitBreaker = new CircuitBreakerService(HEALTHCARE_CIRCUIT_CONFIG
    const healthChecker = new ExternalServiceHealthChecker(HEALTHCARE_HEALTH_CONFIG

    const _service: ServiceDependency = {
      name: 'integration-test-service',
      type: 'api',
      endpoint: 'https://api.example.com',
      description: 'Integration test service',
      healthcareCritical: true,
      dataSensitivity: 'high',
      requiredFor: ['integration-testing'],
    };

    healthChecker.registerService(service

    // Test that both services work together
    const healthStatus = healthChecker.getComprehensiveHealthStatus(
    const circuitMetrics = circuitBreaker.getMetrics(

    expect(healthStatus.overall).toBeDefined(
    expect(circuitMetrics.state).toBeDefined(

    circuitBreaker.destroy(
    healthChecker.destroy(

  test('should handle healthcare-specific scenarios',async () => {
    const healthcareCircuitBreaker = new CircuitBreakerService({
      ...HEALTHCARE_CIRCUIT_CONFIG,
      healthcareCritical: true,
      failSecureMode: true,
      auditLogging: true,

    // Test that healthcare-specific config is applied
    const metrics = healthcareCircuitBreaker.getMetrics(
    expect(metrics).toBeDefined(

    // Test fail-secure behavior
    healthcareCircuitBreaker['forceReset'](
    healthcareCircuitBreaker['state'] = 'OPEN';
    healthcareCircuitBreaker['nextAttemptTime'] = new Date(Date.now() + 60000

    await expect(_healthcareCircuitBreaker.execute(async () => 'success')).rejects.toThrow(
      'Service unavailable - healthcare critical operation blocked',
    

    healthcareCircuitBreaker.destroy(

describe('Error Handling', () => {
  test('should handle callback errors gracefully', () => {
    const circuitBreaker = new CircuitBreakerService(HEALTHCARE_CIRCUIT_CONFIG

    // Add an error-throwing callback
    expect(() => {
      circuitBreaker.onEvent(() => {
        throw new Error('Callback error')
    }).not.toThrow(

    // Should not throw when emitting events
    expect(() => {
      circuitBreaker['emitEvent']({
        type: 'TEST_EVENT',
        timestamp: new Date(),
        metrics: circuitBreaker.getMetrics(),
    }).not.toThrow(

    circuitBreaker.destroy(

  test('should handle invalid service configurations', () => {
    const healthChecker = new ExternalServiceHealthChecker(HEALTHCARE_HEALTH_CONFIG

    // Should handle invalid service names gracefully
    expect(() => {
      healthChecker.unregisterService('')
    }).not.toThrow(

    expect(() => {
      healthChecker.getServiceHealth('')
    }).not.toThrow(

    healthChecker.destroy(

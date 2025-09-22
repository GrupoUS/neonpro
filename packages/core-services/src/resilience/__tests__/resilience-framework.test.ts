/**
 * Tests for the Comprehensive Resilience Framework
 * Validates circuit breaker, retry policies, and healthcare-specific features
 */

import {
  ResilienceFramework,
  EnhancedCircuitBreaker,
  RetryPolicy,
  HealthcareResilienceService,
  DEFAULT_HEALTHCARE_RESILIENCE_CONFIG,
  EMERGENCY_RESILIENCE_CONFIG,
  CircuitState,
  RetryStrategy,
  ResilienceError,
} from "../index";
import { vi } from "vitest";

// Mock healthcare types for testing
enum HealthcareDataClassification {
  SENSITIVE = "sensitive",
  NORMAL = "normal",
  PUBLIC = "public",
}

enum LGPDDataCategory {
  SENSITIVE_HEALTH_DATA = "sensitive_health_data",
}

enum HealthcareAIUseCase {
  PATIENT_COMMUNICATION = "patient_communication",
  SYMPTOMS_ANALYSIS = "symptoms_analysis",
}

describe("Resilience Framework", () => {
  let resilienceFramework: ResilienceFramework;

  beforeEach(() => {
    resilienceFramework = new ResilienceFramework(
      DEFAULT_HEALTHCARE_RESILIENCE_CONFIG,
    
  }

  afterEach(() => {
    resilienceFramework.resetMetrics(
  }

  describe("Circuit Breaker", () => {
    test(_"should start in CLOSED state", () => {
      const circuitBreaker = new EnhancedCircuitBreaker(
        "test-service",
        DEFAULT_HEALTHCARE_RESILIENCE_CONFIG.circuitBreaker,
      

      expect(circuitBreaker.getState()).toBe(CircuitState.CLOSED
    }

    test(_"should open circuit after failure threshold",_async () => {
      const circuitBreaker = new EnhancedCircuitBreaker("test-service", {
        ...DEFAULT_HEALTHCARE_RESILIENCE_CONFIG.circuitBreaker,
        failureThreshold: 3,
      }

      // Simulate failures
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(() => Promise.reject(new Error("Service failure")),
            {
              operation: "test",
              serviceName: "test-service",
              isEmergency: false,
              requiresAudit: false,
            },
          
        } catch (error) {
          // Expected failures
        }
      }

      expect(circuitBreaker.getState()).toBe(CircuitState.OPEN
    }

    test(_"should allow execution in CLOSED state",_async () => {
      const circuitBreaker = new EnhancedCircuitBreaker(
        "test-service",
        DEFAULT_HEALTHCARE_RESILIENCE_CONFIG.circuitBreaker,
      

      const result = await circuitBreaker.execute(() => Promise.resolve("success"),
        {
          operation: "test",
          serviceName: "test-service",
          isEmergency: false,
          requiresAudit: false,
        },
      

      expect(result).toBe("success"
      expect(circuitBreaker.getState()).toBe(CircuitState.CLOSED
    }

    test(_"should reject execution in OPEN state",_async () => {
      const circuitBreaker = new EnhancedCircuitBreaker("test-service", {
        ...DEFAULT_HEALTHCARE_RESILIENCE_CONFIG.circuitBreaker,
        failureThreshold: 1,
      }

      // Force open
      circuitBreaker.forceOpen(

      await expect(_circuitBreaker.execute(() => Promise.resolve("success"), {
          operation: "test",
          serviceName: "test-service",
          isEmergency: false,
          requiresAudit: false,
        }),
      ).rejects.toThrow("Circuit breaker OPEN"
    }
  }

  describe("Retry Policy", () => {
    test(_"should retry on retryable errors",_async () => {
      const retryPolicy = new RetryPolicy({
        ...DEFAULT_HEALTHCARE_RESILIENCE_CONFIG.retry,
        maxRetries: 2,
        strategy: RetryStrategy.IMMEDIATE,
      }

      const error = new Error("Network timeout"
      const shouldRetry = await retryPolicy.shouldRetry(error, {
        operation: "test",
        serviceName: "test-service",
        isEmergency: false,
        requiresAudit: false,
      }

      expect(shouldRetry).toBe(true);
    }

    test(_"should not retry on non-retryable errors",_async () => {
      const retryPolicy = new RetryPolicy(
        DEFAULT_HEALTHCARE_RESILIENCE_CONFIG.retry,
      

      const error = new Error("Unauthorized access"
      const shouldRetry = await retryPolicy.shouldRetry(error, {
        operation: "test",
        serviceName: "test-service",
        isEmergency: false,
        requiresAudit: false,
      }

      expect(shouldRetry).toBe(false);
    }

    test(_"should respect max retry limit",_async () => {
      const retryPolicy = new RetryPolicy({
        ...DEFAULT_HEALTHCARE_RESILIENCE_CONFIG.retry,
        maxRetries: 1,
      }

      const error = new Error("Network timeout"
      const context = {
        operation: "test",
        serviceName: "test-service",
        isEmergency: false,
        requiresAudit: false,
      };

      // First attempt should retry
      expect(await retryPolicy.shouldRetry(error, _context)).toBe(true);

      // Second attempt should not retry
      expect(await retryPolicy.shouldRetry(error, _context)).toBe(false);
    }

    test(_"should allow more retries for emergencies",_async () => {
      const retryPolicy = new RetryPolicy({
        ...DEFAULT_HEALTHCARE_RESILIENCE_CONFIG.retry,
        maxRetries: 3,
      }

      const error = new Error("Network timeout"
      const emergencyContext = {
        operation: "emergency-test",
        serviceName: "test-service",
        isEmergency: true,
        requiresAudit: false,
      };

      // Should allow more retries for emergencies (maxRetries + 2 = 5 total attempts)
      expect(await retryPolicy.shouldRetry(error, emergencyContext)).toBe(true); // 1
      expect(await retryPolicy.shouldRetry(error, emergencyContext)).toBe(true); // 2
      expect(await retryPolicy.shouldRetry(error, emergencyContext)).toBe(true); // 3
      expect(await retryPolicy.shouldRetry(error, emergencyContext)).toBe(true); // 4 (emergency bonus)
      expect(await retryPolicy.shouldRetry(error, emergencyContext)).toBe(true); // 5 (emergency bonus)
      // 6th attempt should fail
      expect(await retryPolicy.shouldRetry(error, emergencyContext)).toBe(
        false,
      
    }

    test(_"should calculate exponential backoff correctly",_async () => {
      const retryPolicy = new RetryPolicy({
        ...DEFAULT_HEALTHCARE_RESILIENCE_CONFIG.retry,
        strategy: RetryStrategy.EXPONENTIAL_BACKOFF,
        baseDelayMs: 1000,
        maxDelayMs: 10000,
        jitter: false,
      }

      // Force 3 attempts
      await retryPolicy.shouldRetry(new Error("test"), {
        operation: "test",
        serviceName: "test-service",
        isEmergency: false,
        requiresAudit: false,
      }
      await retryPolicy.shouldRetry(new Error("test"), {
        operation: "test",
        serviceName: "test-service",
        isEmergency: false,
        requiresAudit: false,
      }
      await retryPolicy.shouldRetry(new Error("test"), {
        operation: "test",
        serviceName: "test-service",
        isEmergency: false,
        requiresAudit: false,
      }

      const delay = await retryPolicy.getDelay(
      expect(delay).toBe(4000); // 1000 * 2^2 (3rd attempt)
    }
  }

  describe("Resilience Framework Integration", () => {
    test(_"should execute successful operations",_async () => {
      const result = await resilienceFramework.execute(_"test-service", () => Promise.resolve("test-result"),
        {
          operation: "test",
          serviceName: "test-service",
          isEmergency: false,
          requiresAudit: false,
        },
      

      expect(result).toBe("test-result"

      const metrics = resilienceFramework.getMetrics(
      expect(metrics.totalRequests).toBe(1
      expect(metrics.successfulRequests).toBe(1
      expect(metrics.failedRequests).toBe(0
    }

    test(_"should handle failing operations with retries",_async () => {
      let attemptCount = 0;
      const failingOperation = vi
        .fn()
        .mockImplementationOnce(() =>
          Promise.reject(new Error("First failure")),
        )
        .mockImplementationOnce(() =>
          Promise.reject(new Error("Second failure")),
        )
        .mockImplementationOnce(() => Promise.resolve("success")

      const result = await resilienceFramework.execute(
        "test-service",
        failingOperation,
        {
          operation: "test",
          serviceName: "test-service",
          isEmergency: false,
          requiresAudit: false,
        },
      

      expect(result).toBe("success"
      expect(failingOperation).toHaveBeenCalledTimes(3

      const metrics = resilienceFramework.getMetrics(
      expect(metrics.totalRequests).toBe(1
      expect(metrics.successfulRequests).toBe(1
      expect(metrics.retryAttempts).toBe(2
    }
  }

  describe("Healthcare Resilience Service", () => {
    let healthcareResilience: HealthcareResilienceService;

    beforeEach(() => {
      healthcareResilience = new HealthcareResilienceService({
        ...DEFAULT_HEALTHCARE_RESILIENCE_CONFIG,
        healthcare: {
          emergencyOverrideEnabled: true,
          emergencyTimeoutMultiplier: 2,
          piiProtectionEnabled: true,
          dataEncryptionRequired: true,
          lgpdAuditLogging: true,
          auditRetentionDays: 365,
          medicalDeviceIntegration: false,
          deviceTimeoutMs: 10000,
          telemedicinePriority: true,
          minimumConnectionQuality: 0.7,
        },
      }
    }

    test(_"should handle healthcare operations with audit logging",_async () => {
      const context = {
        operation: "patient-data-access",
        serviceName: "patient-service",
        isEmergency: false,
        requiresAudit: true,
        dataClassification: HealthcareDataClassification.SENSITIVE,
        lgpdCategories: [LGPDDataCategory.SENSITIVE_HEALTH_DATA],
        healthcareUseCase: HealthcareAIUseCase.PATIENT_COMMUNICATION,
        requiresPIIProtection: true,
        isLifeCritical: false,
        requiresConsent: true,
      };

      const result = await healthcareResilience.executeHealthcareOperation(_"patient-service", () => Promise.resolve("patient-data"),
        context,
      

      expect(result).toBe("patient-data"

      const metrics = healthcareResilience.getHealthcareMetrics(
      expect(metrics.audit.totalOperations).toBe(1
      expect(metrics.audit.successRate).toBe(1
    }

    test(_"should generate compliance reports", () => {
      const report = healthcareResilience.generateComplianceReport(

      expect(report).toHaveProperty("reportPeriod"
      expect(report).toHaveProperty("lgpdCompliance"
      expect(report).toHaveProperty("serviceAvailability"
      expect(report).toHaveProperty("recommendations"
    }
  }

  describe("Error Handling", () => {
    test(_"should create ResilienceError with proper context", () => {
      const context = {
        operation: "test-operation",
        serviceName: "test-service",
        isEmergency: false,
        requiresAudit: false,
      };

      const error = new ResilienceError("Test error", "TIMEOUT", _context

      expect(error.message).toBe("Test error"
      expect(error.type).toBe("TIMEOUT"
      expect(error._context).toBe(context
      expect(error.name).toBe("ResilienceError"
    }
  }
}

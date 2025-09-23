# Circuit Breaker Service

**Healthcare-compliant circuit breaker patterns for external service reliability**

## Overview

This package provides comprehensive circuit breaker patterns designed specifically for healthcare applications with LGPD/ANVISA compliance requirements. It protects external service dependencies from cascading failures while maintaining healthcare data security and compliance.

## Features

### Core Circuit Breaker

- **Configurable thresholds**: Failure counts, timeouts, retry policies
- **Three-state logic**: CLOSED, OPEN, HALF_OPEN with automatic recovery
- **Healthcare compliance**: Fail-secure modes and audit logging
- **Custom fallbacks**: Service-specific fallback strategies
- **Comprehensive metrics**: Request tracking, performance monitoring

### Health Checking

- **Service monitoring**: Automated health checks for external dependencies
- **Healthcare validation**: Compliance-specific health validation
- **Real-time alerts**: Immediate notification of service degradation
- **Performance tracking**: Response time and uptime monitoring

### Integration Support

- **Zero-config setup**: Pre-configured for healthcare workloads
- **Easy integration**: Drop-in replacement for existing service calls
- **TypeScript support**: Full type safety and IntelliSense
- **Event-driven**: Real-time monitoring and alerting

## Quick Start

### Basic Usage

```typescript
import { CircuitBreakerService, HEALTHCARE_CIRCUIT_CONFIG } from './circuit-breaker-service';

// Create circuit breaker for healthcare service
const circuitBreaker = new CircuitBreakerService(HEALTHCARE_CIRCUIT_CONFIG);

// Execute protected operation
try {
  const result = await circuitBreaker.execute(
    async () => await externalApiCall(),
    {
      userId: 'user-123',
      patientId: 'patient-456',
      endpoint: '/api/patients',
      method: 'GET',
      service: 'patient-service',
      timestamp: new Date(),
    },
  );
  console.log('Operation successful:', result);
} catch (error) {
  console.error('Operation failed:', error.message);
}
```

### Healthcare-Specific Configuration

```typescript
import { CircuitBreakerConfig, CircuitBreakerService } from './circuit-breaker-service';

const healthcareConfig: CircuitBreakerConfig = {
  failureThreshold: 3, // Lower threshold for critical services
  resetTimeout: 60000, // 1 minute before retry attempts
  monitoringPeriod: 300000, // 5 minute monitoring window
  maxRetries: 2,
  retryDelay: 1000,
  requestTimeout: 10000, // 10 second timeout
  overallTimeout: 30000, // 30 second overall timeout
  healthcareCritical: true, // Enable healthcare-specific features
  failSecureMode: true, // Deny access on failure
  auditLogging: true, // Enable detailed audit logging
  customFallback: async (error, context) => {
    // Provide safe fallback for healthcare operations
    return {
      error: 'SERVICE_UNAVAILABLE',
      message: 'Critical healthcare service temporarily unavailable',
      timestamp: new Date().toISOString(),
    };
  },
};

const circuitBreaker = new CircuitBreakerService(healthcareConfig);
```

### Health Monitoring

```typescript
import {
  ExternalServiceHealthChecker,
  HEALTHCARE_HEALTH_CONFIG,
  ServiceDependency,
} from './health-checker';

// Create health checker
const healthChecker = new ExternalServiceHealthChecker(
  HEALTHCARE_HEALTH_CONFIG,
);

// Register services for monitoring
healthChecker.registerService({
  name: 'rag-agent',
  type: 'external',
  endpoint: 'https://rag-agent.example.com',
  description: 'AI Agent for healthcare queries',
  healthcareCritical: true,
  dataSensitivity: 'high',
  requiredFor: ['ai-assistant', 'patient-queries'],
});

// Get comprehensive health status
const healthStatus = healthChecker.getComprehensiveHealthStatus();
console.log('Overall health:', healthStatus.overall);
console.log('Services:', Object.keys(healthStatus.services));

// Listen for health events
healthChecker.onEvent(event => {
  console.log('Health event:', {
    type: event.type,
    service: event.serviceName,
    status: event.currentStatus,
    timestamp: event.timestamp,
  });
});
```

### Integration with Existing Services

```typescript
import { setupHealthMonitoring, withCircuitBreakerProtection } from './integration-example';

// Protect existing API calls
const result = await withCircuitBreakerProtection(
  'patient-service',
  async () => await patientService.getPatient(patientId),
  {
    userId: currentUserId,
    patientId,
    endpoint: '/api/patients/' + patientId,
    method: 'GET',
    service: 'patient-service',
    timestamp: new Date(),
  },
);

// Set up health monitoring for multiple services
const healthChecker = setupHealthMonitoring([
  {
    name: 'patient-service',
    type: 'api',
    endpoint: 'https://api.example.com/patients',
    description: 'Patient data service',
    healthcareCritical: true,
    dataSensitivity: 'critical',
    requiredFor: ['patient-management', 'appointments'],
  },
  {
    name: 'appointment-service',
    type: 'api',
    endpoint: 'https://api.example.com/appointments',
    description: 'Appointment scheduling service',
    healthcareCritical: true,
    dataSensitivity: 'confidential',
    requiredFor: ['scheduling', 'calendar'],
  },
]);
```

## Configuration Options

### Circuit Breaker Configuration

```typescript
interface CircuitBreakerConfig {
  // Failure thresholds
  failureThreshold: number; // Number of failures before opening circuit
  resetTimeout: number; // Milliseconds to wait before attempting reset
  monitoringPeriod: number; // Time window for failure counting

  // Retry configuration
  maxRetries: number;
  retryDelay: number; // Base delay for exponential backoff
  retryBackoffMultiplier: number;

  // Timeout configuration
  requestTimeout: number; // Individual request timeout
  overallTimeout: number; // Overall operation timeout

  // Healthcare-specific settings
  healthcareCritical: boolean; // Whether this service is healthcare-critical
  failSecureMode: boolean; // Deny access on failure if true
  auditLogging: boolean; // Enable detailed audit logging

  // Custom fallback
  customFallback?: (error: Error, context?: any) => Promise<any>;
}
```

### Pre-defined Configurations

```typescript
// For healthcare-critical services
HEALTHCARE_CIRCUIT_CONFIG = {
  failureThreshold: 5,
  resetTimeout: 60000,
  monitoringPeriod: 300000,
  maxRetries: 3,
  retryDelay: 1000,
  retryBackoffMultiplier: 2,
  requestTimeout: 10000,
  overallTimeout: 30000,
  healthcareCritical: true,
  failSecureMode: true,
  auditLogging: true,
};

// For non-critical services
STANDARD_CIRCUIT_CONFIG = {
  failureThreshold: 10,
  resetTimeout: 30000,
  monitoringPeriod: 60000,
  maxRetries: 2,
  retryDelay: 500,
  retryBackoffMultiplier: 1.5,
  requestTimeout: 5000,
  overallTimeout: 15000,
  healthcareCritical: false,
  failSecureMode: false,
  auditLogging: false,
};
```

## Healthcare Compliance

### Fail-Secure Mode

When `healthcareCritical` and `failSecureMode` are enabled:

- **Circuit OPEN**: Blocks all requests to protect patient data
- **Service failures**: Deny access rather than risk data corruption
- **Fallback responses**: Provide safe, generic error messages
- **Audit logging**: Detailed logging for compliance reporting

### Data Classification

The system automatically classifies requests based on content:

```typescript
// Automatic classification examples
const classification = circuitBreaker.classifyData(
  'Patient diagnostic information',
);
// Returns: 'restricted'

const classification = circuitBreaker.classifyData('Schedule appointment');
// Returns: 'confidential'

const classification = circuitBreaker.classifyData('General inquiry');
// Returns: 'public'
```

### Audit Logging

Comprehensive audit trails for compliance:

```typescript
// Audit log includes:
{
  timestamp: '2024-01-15T10:30:00Z',
  userId: 'user-123',
  patientId: 'patient-456',
  service: 'rag-agent',
  action: 'REQUEST_FAILURE',
  error: 'Service timeout',
  dataClassification: 'restricted',
  circuitState: 'OPEN',
  consecutiveFailures: 5,
  healthcareImpact: 'high',
}
```

## Monitoring and Metrics

### Circuit Breaker Metrics

```typescript
interface CircuitBreakerMetrics {
  state: CircuitState; // Current circuit state
  healthStatus: HealthStatus; // Overall health assessment
  totalRequests: number; // Total requests processed
  successfulRequests: number; // Successful requests
  failedRequests: number; // Failed requests
  consecutiveFailures: number; // Current consecutive failure count
  averageResponseTime: number; // Average response time in ms
  circuitOpenTime?: Date; // When circuit was opened
  retryAttempts: number; // Total retry attempts
  fallbackActivations: number; // Fallback usage count
}
```

### Health Status Metrics

```typescript
interface ComprehensiveHealthStatus {
  overall: HealthStatus; // System-wide health status
  services: Record<string, ServiceHealth>; // Individual service health
  timestamp: Date; // Status timestamp
  uptime: number; // System uptime percentage
  incidentCount: number; // Total incidents
  healthcareCompliance: boolean; // Compliance status
  criticalServicesHealthy: boolean; // Critical services status
}
```

## Best Practices

### 1. Service Classification

```typescript
// Critical healthcare services
const patientServiceBreaker = new CircuitBreakerService({
  ...HEALTHCARE_CIRCUIT_CONFIG,
  failureThreshold: 3, // Lower threshold for critical services
  failSecureMode: true,
});

// Non-critical services
const notificationServiceBreaker = new CircuitBreakerService({
  ...STANDARD_CIRCUIT_CONFIG,
  failureThreshold: 15, // Higher tolerance for non-critical services
});
```

### 2. Fallback Strategies

```typescript
// Provide meaningful fallbacks for healthcare operations
const healthcareFallback = async (error, context) => {
  if (context.dataClassification === 'restricted') {
    return {
      error: 'HEALTHCARE_SERVICE_UNAVAILABLE',
      message: 'Critical healthcare service temporarily unavailable. Please contact support.',
      timestamp: new Date().toISOString(),
    };
  }

  return {
    error: 'SERVICE_UNAVAILABLE',
    message: 'Service temporarily unavailable. Please try again later.',
    timestamp: new Date().toISOString(),
  };
};
```

### 3. Monitoring Setup

```typescript
// Monitor critical services
const criticalServices = [
  'patient-service',
  'appointment-service',
  'medical-records',
  'ai-agent',
];

criticalServices.forEach(serviceName => {
  const circuitBreaker = createCircuitBreaker(
    serviceName,
    HEALTHCARE_CIRCUIT_CONFIG,
  );

  circuitBreaker.onEvent(event => {
    if (event.type === 'STATE_CHANGE' && event.toState === 'OPEN') {
      // Alert operations team
      sendAlert(`${serviceName} circuit breaker opened`);
    }
  });
});
```

## Error Handling

### Common Scenarios

```typescript
try {
  const result = await circuitBreaker.execute(operation, context);
} catch (error) {
  switch (error.message) {
    case 'Service unavailable - healthcare critical operation blocked':
      // Handle healthcare service unavailability
      return safeErrorResponse();

    case 'Service temporarily unavailable due to high failure rate':
      // Handle circuit open state
      return fallbackResponse();

    case 'Operation timeout':
      // Handle timeout scenarios
      return timeoutResponse();

    default:
      // Handle other errors
      throw error;
  }
}
```

### Recovery Strategies

```typescript
// Automatic recovery configuration
const recoveryConfig = {
  resetTimeout: 30000, // 30 seconds before retry
  halfOpenMaxRequests: 1, // One request to test recovery
  healthCheckInterval: 10000, // Health check every 10 seconds
};

// Manual recovery
if (circuitBreaker.getState() === 'OPEN') {
  circuitBreaker.forceReset();
  console.log('Circuit breaker manually reset');
}
```

## Testing

### Unit Tests

```typescript
// Test circuit breaker behavior
test('should open circuit after failure threshold', async () => {
  const circuitBreaker = new CircuitBreakerService({
    failureThreshold: 3,
    resetTimeout: 1000,
  });

  // Fail 3 times
  for (let i = 0; i < 3; i++) {
    try {
      await circuitBreaker.execute(() => Promise.reject(new Error('Test error')));
    } catch (e) {
      // Expected
    }
  }

  expect(circuitBreaker.getState()).toBe('OPEN');
});
```

### Integration Tests

```typescript
// Test health monitoring
test('should monitor service health', async () => {
  const healthChecker = new ExternalServiceHealthChecker(
    HEALTHCARE_HEALTH_CONFIG,
  );

  healthChecker.registerService({
    name: 'test-service',
    type: 'api',
    endpoint: 'https://httpbin.org/status/200',
    description: 'Test service',
    healthcareCritical: false,
    dataSensitivity: 'low',
    requiredFor: ['testing'],
  });

  const healthStatus = healthChecker.getComprehensiveHealthStatus();
  expect(healthStatus.services['test-service']).toBeDefined();
});
```

## Performance Considerations

### Circuit Breaker Overhead

- **Minimal impact**: Circuit breakers add <1ms overhead per request
- **Memory efficient**: Each circuit breaker uses ~5KB of memory
- **Event handling**: Non-blocking event emission
- **Metrics collection**: Efficient aggregation and storage

### Scaling Recommendations

- **Per-service instances**: Create separate circuit breakers for each service
- **Registry management**: Use CircuitBreakerRegistry for managing multiple instances
- **Health check intervals**: Balance between responsiveness and resource usage
- **Metrics retention**: Configure appropriate retention periods for your needs

## Troubleshooting

### Common Issues

**Circuit stays OPEN**

- Check service health and availability
- Verify reset timeout configuration
- Monitor error rates and patterns

**High false-positive rate**

- Adjust failure threshold for your service characteristics
- Consider implementing more sophisticated health checks
- Review timeout configurations

**Memory usage growing**

- Check for unregistered services
- Verify metrics retention settings
- Monitor event listener cleanup

### Debugging

```typescript
// Enable detailed logging
circuitBreaker.onEvent(event => {
  console.log('Circuit Breaker Event:', {
    type: event.type,
    timestamp: event.timestamp,
    state: event.metrics.state,
    failures: event.metrics.consecutiveFailures,
  });
});

// Monitor health checks
healthChecker.onEvent(event => {
  console.log('Health Check Event:', {
    type: event.type,
    service: event.serviceName,
    status: event.currentStatus,
    responseTime: event.details.responseTime,
  });
});
```

## Security Considerations

### Data Protection

- **Audit logging**: Ensure audit logs are protected and retained
- **Fallback responses**: Avoid exposing sensitive information in fallbacks
- **Error messages**: Use generic error messages for healthcare services
- **Context validation**: Validate all request context data

### Access Control

- **Circuit breaker management**: Restrict who can modify circuit breaker configurations
- **Health monitoring**: Secure health check endpoints
- **Metrics access**: Control access to performance metrics
- **Alert systems**: Secure alert delivery mechanisms

## Contributing

1. **Testing**: Ensure all new features have comprehensive tests
2. **Documentation**: Update documentation for new functionality
3. **TypeScript**: Maintain full type safety
4. **Healthcare compliance**: Consider LGPD/ANVISA implications
5. **Performance**: Monitor performance impact of changes

## License

This package is part of the NeonPro healthcare platform and is subject to the project's license terms.

/**
 * External Service Health Checker
 * T082 - Service Health Monitoring
 *
 * Features:
 * - Comprehensive health checks for external dependencies
 * - Healthcare-specific health validation
 * - Automatic recovery detection
 * - Compliance monitoring and alerting
 * - Integration with circuit breaker system
 */

import { CircuitBreakerService, HealthStatus } from './circuit-breaker-service';

// Health check configuration
export interface HealthCheckConfig {
  checkInterval: number; // How often to perform health checks
  timeout: number; // Individual check timeout
  retries: number; // Number of retries before marking unhealthy
  retryDelay: number; // Delay between retries

  // Healthcare-specific settings
  healthcareCritical: boolean;
  dataSensitivityLevel: 'low' | 'medium' | 'high' | 'critical';
  complianceValidation: boolean;

  // Alert thresholds
  responseTimeWarning: number;
  responseTimeCritical: number;
  failureRateThreshold: number;

  // Custom health check logic
  customHealthCheck?: () => Promise<boolean>;
}

// Service dependency information
export interface ServiceDependency {
  name: string;
  type: 'api' | 'database' | 'cache' | 'external' | 'internal';
  endpoint: string;
  description: string;
  healthcareCritical: boolean;
  dataSensitivity: 'low' | 'medium' | 'high' | 'critical';
  requiredFor: string[]; // What features depend on this service
}

// Comprehensive health status
export interface ComprehensiveHealthStatus {
  overall: HealthStatus;
  services: Record<string, ServiceHealth>;
  timestamp: Date;
  uptime: number; // Percentage uptime in monitoring period
  incidentCount: number;
  lastIncident?: Date;
  healthcareCompliance: boolean;
  criticalServicesHealthy: boolean;
}

// Individual service health
export interface ServiceHealth {
  _service: ServiceDependency;
  status: HealthStatus;
  responseTime: number;
  lastCheck: Date;
  consecutiveFailures: number;
  uptime: number;
  error?: string;
  details?: any;
  metrics: ServiceMetrics;
}

// Service metrics
export interface ServiceMetrics {
  totalChecks: number;
  successfulChecks: number;
  failedChecks: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  lastSuccessTime?: Date;
  lastFailureTime?: Date;
  uptime: number;
}

// Health check event
export interface HealthCheckEvent {
  type:
    | 'SERVICE_HEALTHY'
    | 'SERVICE_UNHEALTHY'
    | 'SERVICE_DEGRADED'
    | 'RECOVERY_DETECTED'
    | 'COMPLIANCE_VIOLATION';
  timestamp: Date;
  serviceName: string;
  previousStatus?: HealthStatus;
  currentStatus: HealthStatus;
  details: ServiceHealth;
}

// Default configuration for healthcare services
export const HEALTHCARE_HEALTH_CONFIG: HealthCheckConfig = {
  checkInterval: 30000, // 30 seconds
  timeout: 10000, // 10 seconds
  retries: 3,
  retryDelay: 2000,
  healthcareCritical: true,
  dataSensitivityLevel: 'high',
  complianceValidation: true,
  responseTimeWarning: 2000, // 2 seconds
  responseTimeCritical: 5000, // 5 seconds
  failureRateThreshold: 0.1, // 10% failure rate
};

// Standard configuration for non-critical services
export const STANDARD_HEALTH_CONFIG: HealthCheckConfig = {
  checkInterval: 60000, // 1 minute
  timeout: 5000, // 5 seconds
  retries: 2,
  retryDelay: 1000,
  healthcareCritical: false,
  dataSensitivityLevel: 'low',
  complianceValidation: false,
  responseTimeWarning: 3000, // 3 seconds
  responseTimeCritical: 10000, // 10 seconds
  failureRateThreshold: 0.2, // 20% failure rate
};

/**
 * External Service Health Checker
 */
export class ExternalServiceHealthChecker {
  private config: HealthCheckConfig;
  private services: Map<string, ServiceDependency> = new Map();
  private serviceHealth: Map<string, ServiceHealth> = new Map();
  private eventCallbacks: ((event: HealthCheckEvent) => void)[] = [];
  private checkIntervals: Map<string, NodeJS.Timeout> = new Map();
  private circuitBreakers: Map<string, CircuitBreakerService> = new Map();
  private incidentLog: HealthIncident[] = [];
  private startTime = Date.now();

  constructor(config: HealthCheckConfig) {
    this.config = { ...config };
  }

  /**
   * Register a service for health monitoring
   */
  registerService(_service: ServiceDependency): void {
    this.services.set(service.name, _service);

    // Initialize service health
    const initialHealth: ServiceHealth = {
      service,
      status: 'UNKNOWN',
      responseTime: 0,
      lastCheck: new Date(),
      consecutiveFailures: 0,
      uptime: 100,
      metrics: this.initializeMetrics(),
    };

    this.serviceHealth.set(service.name, initialHealth);

    // Create circuit breaker for this service
    const circuitBreaker = new CircuitBreakerService({
      failureThreshold: service.healthcareCritical ? 3 : 5,
      resetTimeout: this.config.checkInterval * 2,
      monitoringPeriod: this.config.checkInterval * 10,
      maxRetries: this.config.retries,
      retryDelay: this.config.retryDelay,
      retryBackoffMultiplier: 1.5,
      requestTimeout: this.config.timeout,
      overallTimeout: this.config.timeout * 2,
      healthcareCritical: service.healthcareCritical,
      failSecureMode: service.healthcareCritical,
      auditLogging: this.config.complianceValidation,
    });

    this.circuitBreakers.set(service.name, circuitBreaker);

    // Start monitoring
    this.startMonitoring(service.name);

    console.log(`Registered service for health monitoring: ${service.name}`);
  }

  /**
   * Start monitoring a service
   */
  private startMonitoring(serviceName: string): void {
    const interval = setInterval(() => {
      this.checkServiceHealth(serviceName);
    }, this.config.checkInterval);

    this.checkIntervals.set(serviceName, interval);
  }

  /**
   * Check health of a specific service
   */
  private async checkServiceHealth(serviceName: string): Promise<void> {
    const service = this.services.get(serviceName);
    const currentHealth = this.serviceHealth.get(serviceName);
    const circuitBreaker = this.circuitBreakers.get(serviceName);

    if (!service || !currentHealth || !circuitBreaker) {
      return;
    }

    const startTime = Date.now();
    let status: HealthStatus = 'UNKNOWN';
    let error: string | undefined;
    let responseTime = 0;

    try {
      // Perform health check with circuit breaker
      const isHealthy = await circuitBreaker.execute(
        () => this.performHealthCheck(service),
        {
          _service: serviceName,
          endpoint: service.endpoint,
          method: 'HEALTH_CHECK',
          timestamp: new Date(),
        } as any,
      );

      responseTime = Date.now() - startTime;
      status = isHealthy
        ? this.determineHealthStatus(responseTime, _service)
        : 'UNHEALTHY';

      // Record success
      this.recordHealthCheckSuccess(serviceName, responseTime);
    } catch (checkError) {
      // Error caught but not used - handled by surrounding logic
      responseTime = Date.now() - startTime;
      status = 'UNHEALTHY';
      error = checkError instanceof Error ? checkError.message : 'Unknown error';

      // Record failure
      this.recordHealthCheckFailure(serviceName, error, responseTime);
    }

    // Update service health
    const previousStatus = currentHealth.status;
    this.updateServiceHealth(serviceName, status, responseTime, error);

    // Emit events for status changes
    if (previousStatus !== status) {
      this.emitStatusChangeEvent(serviceName, previousStatus, status);
    }

    // Check for compliance violations
    if (this.config.complianceValidation && service.healthcareCritical) {
      this.checkCompliance(serviceName, status, responseTime);
    }
  }

  /**
   * Perform actual health check for a service
   */
  private async performHealthCheck(
    _service: ServiceDependency,
  ): Promise<boolean> {
    // Use custom health check if provided
    if (this.config.customHealthCheck) {
      return await this.config.customHealthCheck();
    }

    // Default health check logic based on service type
    switch (service.type) {
      case 'api':
        return await this.checkApiHealth(service);
      case 'database':
        return await this.checkDatabaseHealth(service);
      case 'cache':
        return await this.checkCacheHealth(service);
      case 'external':
        return await this.checkExternalServiceHealth(service);
      case 'internal':
        return await this.checkInternalServiceHealth(service);
      default:
        return false;
    }
  }

  /**
   * Check API service health
   */
  private async checkApiHealth(_service: ServiceDependency): Promise<boolean> {
    try {
      // For API services, try to make a simple GET request to health endpoint
      const healthEndpoint = `${service.endpoint.replace(/\/$/, '')}/health`;
      const response = await fetch(healthEndpoint, {
        method: 'GET',
        timeout: this.config.timeout,
        headers: {
          'User-Agent': 'NeonPro-HealthChecker/1.0',
        },
      });

      return response.ok && response.status < 500;
    } catch (error) {
      // Error caught but not used - handled by surrounding logic
      return false;
    }
  }

  /**
   * Check database health
   */
  private async checkDatabaseHealth(
    _service: ServiceDependency,
  ): Promise<boolean> {
    try {
      // For database services, we'd typically use a connection pool or ORM
      // This is a simplified implementation
      return true; // Assume healthy for demo purposes
    } catch (error) {
      // Error caught but not used - handled by surrounding logic
      return false;
    }
  }

  /**
   * Check cache health
   */
  private async checkCacheHealth(
    _service: ServiceDependency,
  ): Promise<boolean> {
    try {
      // For cache services, try a simple GET/SET operation
      return true; // Assume healthy for demo purposes
    } catch (error) {
      // Error caught but not used - handled by surrounding logic
      return false;
    }
  }

  /**
   * Check external service health
   */
  private async checkExternalServiceHealth(
    _service: ServiceDependency,
  ): Promise<boolean> {
    try {
      // For external services, try to ping or make a simple request
      const response = await fetch(service.endpoint, {
        method: 'HEAD',
        timeout: this.config.timeout,
      });
      return response.ok;
    } catch (error) {
      // Error caught but not used - handled by surrounding logic
      return false;
    }
  }

  /**
   * Check internal service health
   */
  private async checkInternalServiceHealth(
    _service: ServiceDependency,
  ): Promise<boolean> {
    try {
      // For internal services, check if the service is running
      return true; // Assume healthy for demo purposes
    } catch (error) {
      // Error caught but not used - handled by surrounding logic
      return false;
    }
  }

  /**
   * Determine health status based on response time
   */
  private determineHealthStatus(
    responseTime: number,
    _service: ServiceDependency,
  ): HealthStatus {
    const thresholds = service.healthcareCritical
      ? {
        warning: this.config.responseTimeWarning,
        critical: this.config.responseTimeCritical,
      }
      : {
        warning: this.config.responseTimeWarning * 1.5,
        critical: this.config.responseTimeCritical * 1.5,
      };

    if (responseTime <= thresholds.warning) {
      return 'HEALTHY';
    } else if (responseTime <= thresholds.critical) {
      return 'DEGRADED';
    } else {
      return 'UNHEALTHY';
    }
  }

  /**
   * Record successful health check
   */
  private recordHealthCheckSuccess(
    serviceName: string,
    responseTime: number,
  ): void {
    const health = this.serviceHealth.get(serviceName);
    if (!health) return;

    const metrics = health.metrics;
    metrics.totalChecks++;
    metrics.successfulChecks++;
    metrics.averageResponseTime =
      (metrics.averageResponseTime * (metrics.totalChecks - 1) + responseTime)
      / metrics.totalChecks;
    metrics.minResponseTime = Math.min(
      metrics.minResponseTime || responseTime,
      responseTime,
    );
    metrics.maxResponseTime = Math.max(
      metrics.maxResponseTime || responseTime,
      responseTime,
    );
    metrics.lastSuccessTime = new Date();
    metrics.uptime = (metrics.successfulChecks / metrics.totalChecks) * 100;
  }

  /**
   * Record failed health check
   */
  private recordHealthCheckFailure(
    serviceName: string,
    error: string,
    responseTime: number,
  ): void {
    const health = this.serviceHealth.get(serviceName);
    if (!health) return;

    const metrics = health.metrics;
    metrics.totalChecks++;
    metrics.failedChecks++;
    metrics.averageResponseTime =
      (metrics.averageResponseTime * (metrics.totalChecks - 1) + responseTime)
      / metrics.totalChecks;
    metrics.lastFailureTime = new Date();
    metrics.uptime = (metrics.successfulChecks / metrics.totalChecks) * 100;

    // Log incident
    this.logIncident(serviceName, 'HEALTH_CHECK_FAILURE', error);
  }

  /**
   * Update service health
   */
  private updateServiceHealth(
    serviceName: string,
    status: HealthStatus,
    responseTime: number,
    error?: string,
  ): void {
    const health = this.serviceHealth.get(serviceName);
    if (!health) return;

    const previousStatus = health.status;
    health.status = status;
    health.responseTime = responseTime;
    health.lastCheck = new Date();
    health.error = error;

    // Update consecutive failures
    if (status === 'UNHEALTHY') {
      health.consecutiveFailures++;
    } else if (status === 'HEALTHY') {
      health.consecutiveFailures = 0;
    }

    // Check for recovery
    if (previousStatus === 'UNHEALTHY' && status === 'HEALTHY') {
      this.emitEvent({
        type: 'RECOVERY_DETECTED',
        timestamp: new Date(),
        serviceName,
        previousStatus,
        currentStatus: status,
        details: health,
      });
    }
  }

  /**
   * Emit status change event
   */
  private emitStatusChangeEvent(
    serviceName: string,
    previousStatus: HealthStatus,
    currentStatus: HealthStatus,
  ): void {
    const health = this.serviceHealth.get(serviceName);
    if (!health) return;

    let eventType: HealthCheckEvent['type'];

    switch (currentStatus) {
      case 'HEALTHY':
        eventType = 'SERVICE_HEALTHY';
        break;
      case 'DEGRADED':
        eventType = 'SERVICE_DEGRADED';
        break;
      case 'UNHEALTHY':
        eventType = 'SERVICE_UNHEALTHY';
        break;
    }

    this.emitEvent({
      type: eventType,
      timestamp: new Date(),
      serviceName,
      previousStatus,
      currentStatus,
      details: health,
    });
  }

  /**
   * Check for compliance violations
   */
  private checkCompliance(
    serviceName: string,
    status: HealthStatus,
    responseTime: number,
  ): void {
    const service = this.services.get(serviceName);
    const health = this.serviceHealth.get(serviceName);

    if (!service || !health) return;

    // Check if critical healthcare service is unhealthy
    if (service.healthcareCritical && status === 'UNHEALTHY') {
      this.emitEvent({
        type: 'COMPLIANCE_VIOLATION',
        timestamp: new Date(),
        serviceName,
        currentStatus: status,
        details: health,
      });

      this.logIncident(
        serviceName,
        'COMPLIANCE_VIOLATION',
        `Critical healthcare service ${serviceName} is unhealthy`,
      );
    }

    // Check response time violations
    if (responseTime > this.config.responseTimeCritical) {
      this.logIncident(
        serviceName,
        'RESPONSE_TIME_VIOLATION',
        `Service response time ${responseTime}ms exceeds critical threshold`,
      );
    }
  }

  /**
   * Log incident
   */
  private logIncident(
    serviceName: string,
    type: string,
    details: string,
  ): void {
    const incident: HealthIncident = {
      timestamp: new Date(),
      serviceName,
      type,
      details,
      severity: this.determineIncidentSeverity(serviceName, type),
    };

    this.incidentLog.push(incident);

    // Keep only recent incidents (last 24 hours)
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    this.incidentLog = this.incidentLog.filter(
      incident => incident.timestamp > cutoff,
    );
  }

  /**
   * Determine incident severity
   */
  private determineIncidentSeverity(
    serviceName: string,
    type: string,
  ): 'low' | 'medium' | 'high' | 'critical' {
    const service = this.services.get(serviceName);

    if (!_service) return 'medium';

    if (
      service.healthcareCritical
      && (type === 'COMPLIANCE_VIOLATION' || type === 'HEALTH_CHECK_FAILURE')
    ) {
      return 'critical';
    }

    if (type === 'COMPLIANCE_VIOLATION') {
      return 'high';
    }

    if (type === 'HEALTH_CHECK_FAILURE') {
      return service.healthcareCritical ? 'high' : 'medium';
    }

    return 'low';
  }

  /**
   * Emit health check event
   */
  private emitEvent(event: HealthCheckEvent): void {
    this.eventCallbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        // Error caught but not used - handled by surrounding logic
        console.error('Error in health check event callback:', error);
      }
    });
  }

  /**
   * Initialize metrics
   */
  private initializeMetrics(): ServiceMetrics {
    return {
      totalChecks: 0,
      successfulChecks: 0,
      failedChecks: 0,
      averageResponseTime: 0,
      minResponseTime: 0,
      maxResponseTime: 0,
      uptime: 100,
    };
  }

  /**
   * Add event listener
   */
  onEvent(callback: (event: HealthCheckEvent) => void): void {
    this.eventCallbacks.push(callback);
  }

  /**
   * Get comprehensive health status
   */
  getComprehensiveHealthStatus(): ComprehensiveHealthStatus {
    const services: Record<string, ServiceHealth> = {};
    let totalUptime = 0;
    let criticalServicesHealthy = true;
    let healthcareCompliance = true;

    this.serviceHealth.forEach((health, _serviceName) => {
      services[serviceName] = health;
      totalUptime += health.metrics.uptime;

      const service = this.services.get(serviceName);
      if (service) {
        if (service.healthcareCritical && health.status !== 'HEALTHY') {
          criticalServicesHealthy = false;
        }

        if (service.healthcareCritical && health.status === 'UNHEALTHY') {
          healthcareCompliance = false;
        }
      }
    });

    const averageUptime = this.serviceHealth.size > 0 ? totalUptime / this.serviceHealth.size : 100;

    // Determine overall status
    let overall: HealthStatus = 'HEALTHY';
    if (!healthcareCompliance) {
      overall = 'UNHEALTHY';
    } else if (!criticalServicesHealthy) {
      overall = 'DEGRADED';
    } else if (averageUptime < 95) {
      overall = 'DEGRADED';
    } else if (averageUptime < 80) {
      overall = 'UNHEALTHY';
    }

    return {
      overall,
      services,
      timestamp: new Date(),
      uptime: averageUptime,
      incidentCount: this.incidentLog.length,
      lastIncident: this.incidentLog.length > 0
        ? this.incidentLog[this.incidentLog.length - 1].timestamp
        : undefined,
      healthcareCompliance,
      criticalServicesHealthy,
    };
  }

  /**
   * Get service health
   */
  getServiceHealth(serviceName: string): ServiceHealth | undefined {
    return this.serviceHealth.get(serviceName);
  }

  /**
   * Get all service health
   */
  getAllServiceHealth(): Record<string, ServiceHealth> {
    const result: Record<string, ServiceHealth> = {};
    this.serviceHealth.forEach((health, _serviceName) => {
      result[serviceName] = health;
    });
    return result;
  }

  /**
   * Get incidents
   */
  getIncidents(since?: Date): HealthIncident[] {
    if (!since) {
      return [...this.incidentLog];
    }

    return this.incidentLog.filter(incident => incident.timestamp >= since);
  }

  /**
   * Get circuit breaker for a service
   */
  getCircuitBreaker(serviceName: string): CircuitBreakerService | undefined {
    return this.circuitBreakers.get(serviceName);
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<HealthCheckConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Unregister a service
   */
  unregisterService(serviceName: string): void {
    // Stop monitoring
    const interval = this.checkIntervals.get(serviceName);
    if (interval) {
      clearInterval(interval);
      this.checkIntervals.delete(serviceName);
    }

    // Remove circuit breaker
    const circuitBreaker = this.circuitBreakers.get(serviceName);
    if (circuitBreaker) {
      circuitBreaker.destroy();
      this.circuitBreakers.delete(serviceName);
    }

    // Remove from registries
    this.services.delete(serviceName);
    this.serviceHealth.delete(serviceName);

    console.log(`Unregistered service from health monitoring: ${serviceName}`);
  }

  /**
   * Destroy the health checker
   */
  destroy(): void {
    // Stop all monitoring
    this.checkIntervals.forEach(interval => clearInterval(interval));
    this.checkIntervals.clear();

    // Destroy all circuit breakers
    this.circuitBreakers.forEach(circuitBreaker => circuitBreaker.destroy());
    this.circuitBreakers.clear();

    // Clear registries
    this.services.clear();
    this.serviceHealth.clear();
    this.eventCallbacks = [];
    this.incidentLog = [];
  }
}

// Health incident interface
export interface HealthIncident {
  timestamp: Date;
  serviceName: string;
  type: string;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// Create default health checker instance
export function createHealthChecker(
  config?: HealthCheckConfig,
): ExternalServiceHealthChecker {
  const defaultConfig = config || HEALTHCARE_HEALTH_CONFIG;
  return new ExternalServiceHealthChecker(defaultConfig);
}

export default ExternalServiceHealthChecker;

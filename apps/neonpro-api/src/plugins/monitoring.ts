/**
 * Monitoring and Metrics Plugin
 * Healthcare-specific metrics collection for NeonPro
 */

import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import promClient from "prom-client";
import { healthcareLogger } from "./logging";

// Healthcare-specific metric labels
const TENANT_LABEL = "tenant_id";
const USER_LABEL = "user_id";
const ENDPOINT_LABEL = "endpoint";
const METHOD_LABEL = "method";
const STATUS_LABEL = "status_code";

/**
 * Healthcare Metrics Collector
 */
export class HealthcareMetrics {
  // HTTP request metrics (initialized in constructor)
  private httpRequestsTotal!: promClient.Counter<string>;
  private httpRequestDuration!: promClient.Histogram<string>;
  private httpActiveConnections!: promClient.Gauge<string>;

  // Healthcare-specific metrics (initialized in constructor)
  private patientAccessTotal!: promClient.Counter<string>;
  private medicalRecordOperations!: promClient.Counter<string>;
  private appointmentEvents!: promClient.Counter<string>;
  private billingOperations!: promClient.Counter<string>;
  private complianceEvents!: promClient.Counter<string>;

  // BMAD methodology metrics (initialized in constructor)
  private bmadBusinessRules!: promClient.Counter<string>;
  private bmadMedicalValidations!: promClient.Counter<string>;
  private bmadAnvisaChecks!: promClient.Counter<string>;
  private bmadDataProtection!: promClient.Counter<string>;

  // Database metrics (initialized in constructor)
  private databaseConnections!: promClient.Gauge<string>;
  private databaseQueryDuration!: promClient.Histogram<string>;
  private databaseErrors!: promClient.Counter<string>;

  // Cache metrics (initialized in constructor)
  private cacheHits!: promClient.Counter<string>;
  private cacheMisses!: promClient.Counter<string>;
  private cacheOperationDuration!: promClient.Histogram<string>;

  // Job queue metrics (initialized in constructor)
  private jobsTotal!: promClient.Counter<string>;
  private jobDuration!: promClient.Histogram<string>;
  private jobErrors!: promClient.Counter<string>;

  // Edge services metrics (initialized in constructor)
  private edgeServiceRequests!: promClient.Counter<string>;
  private edgeServiceDuration!: promClient.Histogram<string>;
  private edgeServiceErrors!: promClient.Counter<string>;

  // Security metrics (initialized in constructor)
  private securityEvents!: promClient.Counter<string>;
  private authenticationAttempts!: promClient.Counter<string>;
  private lgpdEvents!: promClient.Counter<string>;

  constructor() {
    // Clear default metrics
    promClient.register.clear();

    // Enable default Node.js metrics
    promClient.collectDefaultMetrics({
      prefix: "neonpro_",
      register: promClient.register,
    });

    this.initializeMetrics();
  }

  private initializeMetrics(): void {
    // HTTP request metrics
    this.httpRequestsTotal = new promClient.Counter({
      name: "http_requests_total",
      help: "Total number of HTTP requests",
      labelNames: [METHOD_LABEL, ENDPOINT_LABEL, STATUS_LABEL, TENANT_LABEL],
    });

    this.httpRequestDuration = new promClient.Histogram({
      name: "http_request_duration_seconds",
      help: "HTTP request duration in seconds",
      labelNames: [METHOD_LABEL, ENDPOINT_LABEL, TENANT_LABEL],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
    });

    this.httpActiveConnections = new promClient.Gauge({
      name: "http_active_connections",
      help: "Number of active HTTP connections",
      labelNames: [TENANT_LABEL],
    });

    // Healthcare-specific metrics
    this.patientAccessTotal = new promClient.Counter({
      name: "healthcare_patient_access_total",
      help: "Total patient data access events (LGPD compliance)",
      labelNames: ["action", TENANT_LABEL, USER_LABEL],
    });

    this.medicalRecordOperations = new promClient.Counter({
      name: "healthcare_medical_record_operations_total",
      help: "Total medical record operations",
      labelNames: ["operation", TENANT_LABEL, USER_LABEL],
    });

    this.appointmentEvents = new promClient.Counter({
      name: "healthcare_appointment_events_total",
      help: "Total appointment events",
      labelNames: ["event_type", TENANT_LABEL],
    });

    this.billingOperations = new promClient.Counter({
      name: "healthcare_billing_operations_total",
      help: "Total billing operations",
      labelNames: ["operation", TENANT_LABEL],
    });

    this.complianceEvents = new promClient.Counter({
      name: "healthcare_compliance_events_total",
      help: "Total compliance events",
      labelNames: ["event_type", "severity", TENANT_LABEL],
    });

    // BMAD methodology metrics
    this.bmadBusinessRules = new promClient.Counter({
      name: "healthcare_bmad_business_rules_executed_total",
      help: "Total business rules executed (BMAD)",
      labelNames: ["rule_type", TENANT_LABEL],
    });

    this.bmadMedicalValidations = new promClient.Counter({
      name: "healthcare_bmad_medical_validations_total",
      help: "Total medical validations (BMAD)",
      labelNames: ["validation_type", TENANT_LABEL],
    });

    this.bmadAnvisaChecks = new promClient.Counter({
      name: "healthcare_bmad_anvisa_compliance_checks_total",
      help: "Total ANVISA compliance checks (BMAD)",
      labelNames: ["check_type", TENANT_LABEL],
    });

    this.bmadDataProtection = new promClient.Counter({
      name: "healthcare_bmad_data_protection_events_total",
      help: "Total data protection events (BMAD)",
      labelNames: ["event_type", TENANT_LABEL],
    });

    // Database metrics
    this.databaseConnections = new promClient.Gauge({
      name: "database_connections_active",
      help: "Number of active database connections",
      labelNames: [TENANT_LABEL],
    });

    this.databaseQueryDuration = new promClient.Histogram({
      name: "database_query_duration_seconds",
      help: "Database query duration in seconds",
      labelNames: ["query_type", TENANT_LABEL],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
    });

    this.databaseErrors = new promClient.Counter({
      name: "database_errors_total",
      help: "Total database errors",
      labelNames: ["error_type", TENANT_LABEL],
    });

    // Cache metrics
    this.cacheHits = new promClient.Counter({
      name: "cache_hits_total",
      help: "Total cache hits",
      labelNames: ["cache_type", TENANT_LABEL],
    });

    this.cacheMisses = new promClient.Counter({
      name: "cache_misses_total",
      help: "Total cache misses",
      labelNames: ["cache_type", TENANT_LABEL],
    });

    this.cacheOperationDuration = new promClient.Histogram({
      name: "cache_operation_duration_seconds",
      help: "Cache operation duration in seconds",
      labelNames: ["operation", "cache_type", TENANT_LABEL],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
    });

    // Job queue metrics
    this.jobsTotal = new promClient.Counter({
      name: "bullmq_jobs_total",
      help: "Total jobs processed",
      labelNames: ["job_type", "status", TENANT_LABEL],
    });

    this.jobDuration = new promClient.Histogram({
      name: "bullmq_job_duration_seconds",
      help: "Job processing duration in seconds",
      labelNames: ["job_type", TENANT_LABEL],
      buckets: [0.1, 0.5, 1, 5, 10, 30, 60, 300, 600],
    });

    this.jobErrors = new promClient.Counter({
      name: "bullmq_job_errors_total",
      help: "Total job errors",
      labelNames: ["job_type", "error_type", TENANT_LABEL],
    });

    // Edge services metrics
    this.edgeServiceRequests = new promClient.Counter({
      name: "edge_service_requests_total",
      help: "Total edge service requests",
      labelNames: ["service", "status", TENANT_LABEL],
    });

    this.edgeServiceDuration = new promClient.Histogram({
      name: "edge_service_duration_seconds",
      help: "Edge service request duration in seconds",
      labelNames: ["service", TENANT_LABEL],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
    });

    this.edgeServiceErrors = new promClient.Counter({
      name: "edge_service_errors_total",
      help: "Total edge service errors",
      labelNames: ["service", "error_type", TENANT_LABEL],
    });

    // Security metrics
    this.securityEvents = new promClient.Counter({
      name: "security_events_total",
      help: "Total security events",
      labelNames: ["event_type", "severity", TENANT_LABEL],
    });

    this.authenticationAttempts = new promClient.Counter({
      name: "authentication_attempts_total",
      help: "Total authentication attempts",
      labelNames: ["result", "method", TENANT_LABEL],
    });

    this.lgpdEvents = new promClient.Counter({
      name: "lgpd_events_total",
      help: "Total LGPD events",
      labelNames: ["event_type", TENANT_LABEL],
    });

    // Register all metrics
    const metrics = [
      this.httpRequestsTotal,
      this.httpRequestDuration,
      this.httpActiveConnections,
      this.patientAccessTotal,
      this.medicalRecordOperations,
      this.appointmentEvents,
      this.billingOperations,
      this.complianceEvents,
      this.bmadBusinessRules,
      this.bmadMedicalValidations,
      this.bmadAnvisaChecks,
      this.bmadDataProtection,
      this.databaseConnections,
      this.databaseQueryDuration,
      this.databaseErrors,
      this.cacheHits,
      this.cacheMisses,
      this.cacheOperationDuration,
      this.jobsTotal,
      this.jobDuration,
      this.jobErrors,
      this.edgeServiceRequests,
      this.edgeServiceDuration,
      this.edgeServiceErrors,
      this.securityEvents,
      this.authenticationAttempts,
      this.lgpdEvents,
    ];

    metrics.forEach((metric) => promClient.register.registerMetric(metric));
  }

  // HTTP metrics methods
  recordHttpRequest(
    method: string,
    endpoint: string,
    statusCode: number,
    duration: number,
    tenantId?: string,
  ): void {
    const labels = {
      [METHOD_LABEL]: method,
      [ENDPOINT_LABEL]: endpoint,
      [STATUS_LABEL]: statusCode.toString(),
      [TENANT_LABEL]: tenantId || "unknown",
    };

    this.httpRequestsTotal.inc(labels);
    this.httpRequestDuration.observe(
      { [METHOD_LABEL]: method, [ENDPOINT_LABEL]: endpoint, [TENANT_LABEL]: tenantId || "unknown" },
      duration / 1000,
    );
  }

  // Healthcare-specific methods
  recordPatientAccess(action: string, tenantId: string, userId?: string): void {
    this.patientAccessTotal.inc({
      action,
      [TENANT_LABEL]: tenantId,
      [USER_LABEL]: userId || "anonymous",
    });
  }

  recordMedicalRecordOperation(operation: string, tenantId: string, userId?: string): void {
    this.medicalRecordOperations.inc({
      operation,
      [TENANT_LABEL]: tenantId,
      [USER_LABEL]: userId || "system",
    });
  }

  recordBMADBusinessRule(ruleType: string, tenantId: string): void {
    this.bmadBusinessRules.inc({ rule_type: ruleType, [TENANT_LABEL]: tenantId });
  }

  recordBMADMedicalValidation(validationType: string, tenantId: string): void {
    this.bmadMedicalValidations.inc({ validation_type: validationType, [TENANT_LABEL]: tenantId });
  }

  recordBMADAnvisaCheck(checkType: string, tenantId: string): void {
    this.bmadAnvisaChecks.inc({ check_type: checkType, [TENANT_LABEL]: tenantId });
  }

  recordBMADDataProtection(eventType: string, tenantId: string): void {
    this.bmadDataProtection.inc({ event_type: eventType, [TENANT_LABEL]: tenantId });
  }

  // Database methods
  recordDatabaseQuery(queryType: string, duration: number, tenantId: string): void {
    this.databaseQueryDuration.observe(
      { query_type: queryType, [TENANT_LABEL]: tenantId },
      duration / 1000,
    );
  }

  recordDatabaseError(errorType: string, tenantId: string): void {
    this.databaseErrors.inc({ error_type: errorType, [TENANT_LABEL]: tenantId });
  }

  // Cache methods
  recordCacheHit(cacheType: string, tenantId: string): void {
    this.cacheHits.inc({ cache_type: cacheType, [TENANT_LABEL]: tenantId });
  }

  recordCacheMiss(cacheType: string, tenantId: string): void {
    this.cacheMisses.inc({ cache_type: cacheType, [TENANT_LABEL]: tenantId });
  }

  // Job methods
  recordJob(jobType: string, status: string, duration: number, tenantId: string): void {
    this.jobsTotal.inc({ job_type: jobType, status, [TENANT_LABEL]: tenantId });
    if (status === "completed") {
      this.jobDuration.observe({ job_type: jobType, [TENANT_LABEL]: tenantId }, duration / 1000);
    }
  }

  // Security methods
  recordSecurityEvent(eventType: string, severity: string, tenantId: string): void {
    this.securityEvents.inc({ event_type: eventType, severity, [TENANT_LABEL]: tenantId });
  }

  recordAuthenticationAttempt(result: string, method: string, tenantId: string): void {
    this.authenticationAttempts.inc({ result, method, [TENANT_LABEL]: tenantId });
  }

  recordLGPDEvent(eventType: string, tenantId: string): void {
    this.lgpdEvents.inc({ event_type: eventType, [TENANT_LABEL]: tenantId });
  }

  // Get metrics for export
  async getMetrics(): Promise<string> {
    return promClient.register.metrics();
  }

  // Health check
  getHealthStatus(): { status: string; metrics: number } {
    const metricNames = promClient.register.getMetricsAsJSON();
    return {
      status: "healthy",
      metrics: metricNames.length,
    };
  }
}

// Singleton instance
export const healthcareMetrics = new HealthcareMetrics();

// Fastify plugin
export async function registerMonitoring(fastify: FastifyInstance) {
  // Add metrics instance to fastify
  fastify.decorate("metrics", healthcareMetrics);

  // Metrics endpoint
  fastify.get("/metrics", async (request: FastifyRequest, reply: FastifyReply) => {
    const metrics = await healthcareMetrics.getMetrics();
    reply.header("Content-Type", promClient.register.contentType).send(metrics);
  });

  // Health check endpoint
  fastify.get("/health/metrics", async () => {
    return healthcareMetrics.getHealthStatus();
  });

  // Request tracking hook
  fastify.addHook("onRequest", async (request: any) => {
    request.startTime = Date.now();
  });

  // Response tracking hook
  fastify.addHook("onResponse", async (request: any, reply: any) => {
    const duration = Date.now() - (request.startTime || Date.now());
    const tenantId = request.headers["x-tenant-id"] as string;

    healthcareMetrics.recordHttpRequest(
      request.method,
      request.routeOptions?.url || request.url,
      reply.statusCode,
      duration,
      tenantId,
    );
  });

  // Log integration
  healthcareLogger.log("info", "Monitoring plugin registered", {
    metadata: { metricsEndpoint: "/metrics", healthEndpoint: "/health/metrics" },
  });
}

// Default export for the plugin function
export default monitoringPlugin;

import * as opentelemetry from "@opentelemetry/api";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { JaegerExporter } from "@opentelemetry/exporter-jaeger";
import {
  ConsoleSpanExporter,
  SimpleSpanProcessor,
  BatchSpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { PrometheusExporter } from "@opentelemetry/exporter-prometheus";
import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import {
  ParentBasedSampler,
  TraceIdRatioBasedSampler,
  AlwaysOnSampler,
  AlwaysOffSampler,
} from "@opentelemetry/sdk-trace-base";
import { auditLogger } from '../logging/healthcare-logger';
import { logHealthcareError } from '../logging/healthcare-logger';

const telemetryLogger = auditLogger.child({ component: 'opentelemetry' });

// Healthcare-specific telemetry configuration
export interface HealthcareTelemetryConfig {
  serviceName: string;
  serviceVersion: string;
  environment: string;
  enableConsoleExporter?: boolean;
  enableJaegerExporter?: boolean;
  enablePrometheusExporter?: boolean;
  jaegerEndpoint?: string;
  prometheusPort?: number;
  samplingRate?: number;
  healthcareContext?: {
    facilityId?: string;
    region?: string;
    complianceLevel?: "lgpd" | "hipaa" | "gdpr";
  };
}

// Healthcare-specific span attributes
export enum HealthcareSpanAttributes {
  PATIENT_ID = "healthcare.patient.id",
  MEDICAL_RECORD_ID = "healthcare.medical_record.id",
  APPOINTMENT_ID = "healthcare.appointment.id",
  DOCTOR_ID = "healthcare.doctor.id",
  PROCEDURE_TYPE = "healthcare.procedure.type",
  DATA_SENSITIVITY = "healthcare.data.sensitivity",
  CONSENT_GRANTED = "healthcare.consent.granted",
  COMPLIANCE_LEVEL = "healthcare.compliance.level",
}

// Healthcare-specific operations
export enum HealthcareOperations {
  PATIENT_DATA_READ = "patient.data.read",
  PATIENT_DATA_ACCESS = "patient.data.access",
  PATIENT_DATA_UPDATE = "patient.data.update",
  MEDICAL_RECORD_CREATE = "medical_record.create",
  MEDICAL_RECORD_READ = "medical_record.read",
  MEDICAL_RECORD_UPDATE = "medical_record.update",
  APPOINTMENT_SCHEDULE = "appointment.schedule",
  APPOINTMENT_CANCEL = "appointment.cancel",
  PRESCRIPTION_CREATE = "prescription.create",
  PRESCRIPTION_DISPENSE = "prescription.dispense",
  BILLING_GENERATE = "billing.generate",
  BILLING_PROCESS = "billing.process",
  TELEHEALTH_SESSION = "telehealth.session",
  AI_CONSULTATION = "ai.consultation",
}

export class HealthcareTelemetryManager {
  private sdk: NodeSDK | null = null;
  private initialized = false;
  private config: HealthcareTelemetryConfig;

  constructor(config: HealthcareTelemetryConfig) {
    this.config = {
      ...config,
      enableConsoleExporter: config.enableConsoleExporter ?? true,
      enableJaegerExporter: config.enableJaegerExporter ?? false,
      enablePrometheusExporter: config.enablePrometheusExporter ?? true,
      samplingRate: config.samplingRate ?? 1.0,
      prometheusPort: config.prometheusPort ?? 9464,
      jaegerEndpoint:
        config.jaegerEndpoint ?? "http://localhost:14268/api/traces",
    };
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    const resourceAttributes: Record<string, string> = {
      [SemanticResourceAttributes.SERVICE_NAME]: this.config.serviceName,
      [SemanticResourceAttributes.SERVICE_VERSION]: this.config.serviceVersion,
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]:
        this.config.environment,
      "healthcare.platform": "neonpro",
    };

    // Add healthcare-specific attributes
    if (this.config.healthcareContext) {
      if (this.config.healthcareContext.facilityId) {
        resourceAttributes["healthcare.facility.id"] =
          this.config.healthcareContext.facilityId;
      }
      if (this.config.healthcareContext.region) {
        resourceAttributes["healthcare.region"] =
          this.config.healthcareContext.region;
      }
      if (this.config.healthcareContext.complianceLevel) {
        resourceAttributes["healthcare.compliance.level"] =
          this.config.healthcareContext.complianceLevel;
      }
    }

    const resource = new Resource(resourceAttributes);

    const spanProcessors: SimpleSpanProcessor[] = [];

    // Console exporter for development
    if (this.config.enableConsoleExporter) {
      const consoleExporter = new ConsoleSpanExporter();
      spanProcessors.push(new SimpleSpanProcessor(consoleExporter));
    }

    // Jaeger exporter for distributed tracing
    if (this.config.enableJaegerExporter) {
      const jaegerExporter = new JaegerExporter({
        endpoint: this.config.jaegerEndpoint,
      });
      spanProcessors.push(new SimpleSpanProcessor(jaegerExporter));
    }

    // Prometheus exporter for metrics
    let metricReader: PeriodicExportingMetricReader | undefined;
    if (this.config.enablePrometheusExporter) {
      const prometheusExporter = new PrometheusExporter({
        port: this.config.prometheusPort,
      });
      metricReader = new PeriodicExportingMetricReader({
        exporter: prometheusExporter as any,
        exportIntervalMillis: 10000,
      });
    }

    this.sdk = new NodeSDK({
      resource,
      spanProcessor: new BatchSpanProcessor(new ConsoleSpanExporter()),
      metricReader,
      instrumentations: [
        new HttpInstrumentation(),
        new ExpressInstrumentation(),
        // TODO: Add Hono instrumentation when available
      ],
      sampler: new ParentBasedSampler({
        root: new TraceIdRatioBasedSampler(this.config.samplingRate),
        remoteParentSampled: new AlwaysOnSampler(),
        remoteParentNotSampled: new AlwaysOffSampler(),
        localParentSampled: new AlwaysOnSampler(),
        localParentNotSampled: new AlwaysOffSampler(),
      }),
    });

    try {
      await this.sdk.start();
      this.initialized = true;
      telemetryLogger.info(`Healthcare telemetry initialized for ${this.config.serviceName}`, {
        component: 'opentelemetry',
        action: 'initialize',
        serviceName: this.config.serviceName,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logHealthcareError('opentelemetry', error instanceof Error ? error : new Error(String(error)), {
        method: 'initialize',
        component: 'opentelemetry',
        action: 'initialize_failure',
        serviceName: this.config.serviceName
      });
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    if (this.sdk && this.initialized) {
      await this.sdk.shutdown();
      this.initialized = false;
      telemetryLogger.info("Healthcare telemetry shutdown completed", {
        component: 'opentelemetry',
        action: 'shutdown',
        timestamp: new Date().toISOString()
      });
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  // Get tracer for creating spans
  getTracer(): opentelemetry.Tracer {
    return opentelemetry.trace.getTracer(
      this.config.serviceName,
      this.config.serviceVersion,
    );
  }

  // Healthcare-specific span creation
  createHealthcareSpan(
    name: string,
    operation: HealthcareOperations,
    attributes: Record<string, string | number | boolean> = {},
  ): opentelemetry.Span {
    const tracer = this.getTracer();
    const span = tracer.startSpan(name);

    // Set healthcare-specific attributes
    span.setAttribute("healthcare.operation", operation);
    span.setAttribute(
      HealthcareSpanAttributes.COMPLIANCE_LEVEL,
      this.config.healthcareContext?.complianceLevel || "lgpd",
    );

    // Add custom attributes
    Object.entries(attributes).forEach(([key, _value]) => {
      span.setAttribute(key, _value);
    });

    return span;
  }

  // Add healthcare-specific event to span
  addHealthcareEvent(
    span: opentelemetry.Span,
    eventName: string,
    attributes: Record<string, string | number | boolean> = {},
  ): void {
    span.addEvent(eventName, attributes);
  }

  // Record healthcare-specific metrics
  recordHealthcareMetric(
    name: string,
    value: number,
    attributes: Record<string, string> = {},
  ): void {
    const meter = opentelemetry.metrics.getMeter(
      this.config.serviceName,
      this.config.serviceVersion,
    );

    const counter = meter.createCounter(name, {
      description: `Healthcare metric: ${name}`,
    });

    counter.add(value, attributes);
  }

  // Create a custom healthcare counter
  createHealthcareCounter(
    name: string,
    description: string,
    unit: string = "1",
  ): opentelemetry.Counter {
    const meter = opentelemetry.metrics.getMeter(
      this.config.serviceName,
      this.config.serviceVersion,
    );
    return meter.createCounter(name, { description, unit });
  }

  // Create a custom healthcare histogram
  createHealthcareHistogram(
    name: string,
    description: string,
    unit: string = "ms",
  ): opentelemetry.Histogram {
    const meter = opentelemetry.metrics.getMeter(
      this.config.serviceName,
      this.config.serviceVersion,
    );
    return meter.createHistogram(name, { description, unit });
  }
}

// Factory function for creating telemetry manager
export function createHealthcareTelemetryManager(
  config: HealthcareTelemetryConfig,
): HealthcareTelemetryManager {
  return new HealthcareTelemetryManager(config);
}

// Predefined configurations for different services
export const TELEMETRY_CONFIGS = {
  api: {
    serviceName: "neonpro-api",
    serviceVersion: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    enableJaegerExporter: process.env.OTEL_JAEGER_ENABLED === "true",
    enablePrometheusExporter: true,
    prometheusPort: parseInt(process.env.OTEL_PROMETHEUS_PORT || "9464"),
    samplingRate: parseFloat(process.env.OTEL_SAMPLING_RATE || "1.0"),
  },
  web: {
    serviceName: "neonpro-web",
    serviceVersion: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    enableConsoleExporter: true,
    enableJaegerExporter: false,
    enablePrometheusExporter: false,
    samplingRate: 0.1,
  },
  worker: {
    serviceName: "neonpro-worker",
    serviceVersion: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    enableConsoleExporter: false,
    enableJaegerExporter: true,
    enablePrometheusExporter: true,
    samplingRate: 1.0,
  },
} as const;

// Global telemetry manager instance
let globalTelemetryManager: HealthcareTelemetryManager | null = null;

// Initialize global telemetry manager
export async function initializeGlobalTelemetry(
  serviceType: keyof typeof TELEMETRY_CONFIGS = "api",
  customConfig?: Partial<HealthcareTelemetryConfig>,
): Promise<HealthcareTelemetryManager> {
  if (globalTelemetryManager) {
    return globalTelemetryManager;
  }

  const config = {
    ...TELEMETRY_CONFIGS[serviceType],
    ...customConfig,
  };

  globalTelemetryManager = createHealthcareTelemetryManager(config);
  await globalTelemetryManager.initialize();

  return globalTelemetryManager;
}

// Get global telemetry manager
export function getGlobalTelemetryManager(): HealthcareTelemetryManager | null {
  return globalTelemetryManager;
}

// Shutdown global telemetry manager
export async function shutdownGlobalTelemetry(): Promise<void> {
  if (globalTelemetryManager) {
    await globalTelemetryManager.shutdown();
    globalTelemetryManager = null;
  }
}

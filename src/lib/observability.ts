/**
 * NEONPRO OpenTelemetry Observability Integration
 * GRUPO US VIBECODE SYSTEM V5.0 - Phase 8 Production Monitoring
 *
 * CRITICAL: Comprehensive observability for aesthetic clinic SaaS workflows
 * Integrates with existing TracingSystem and provides clinic-specific tracing
 */

import { SpanKind, trace } from "@opentelemetry/api";
import {
  getNodeAutoInstrumentations,
  NodeSDK,
} from "@opentelemetry/auto-instrumentations-node";
import { JaegerExporter } from "@opentelemetry/exporter-jaeger";
import { Resource } from "@opentelemetry/resources";
import { MeterProvider } from "@opentelemetry/sdk-metrics";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";

// NEONPRO-specific observability configuration
export interface NEONPROObservabilityConfig {
  serviceName: string;
  serviceVersion: string;
  environment: string;
  jaegerEndpoint?: string;
  samplingRate: number;
  enableAutoInstrumentation: boolean;
  enableMetrics: boolean;
  enableLogging: boolean;
}

// Default configuration for NEONPRO
export const DEFAULT_NEONPRO_CONFIG: NEONPROObservabilityConfig = {
  serviceName: "neonpro-clinic",
  serviceVersion: "1.0.0",
  environment: process.env.NODE_ENV || "production",
  jaegerEndpoint:
    process.env.JAEGER_ENDPOINT || "http://localhost:14268/api/traces",
  samplingRate: 0.1, // 10% sampling rate for production
  enableAutoInstrumentation: true,
  enableMetrics: true,
  enableLogging: true,
};

// Clinic-specific span names
export const CLINIC_SPANS = {
  APPOINTMENT_BOOKING: "appointment.booking",
  APPOINTMENT_CONFIRMATION: "appointment.confirmation",
  APPOINTMENT_CANCELLATION: "appointment.cancellation",
  TREATMENT_SCHEDULING: "treatment.scheduling",
  TREATMENT_EXECUTION: "treatment.execution",
  PATIENT_REGISTRATION: "patient.registration",
  PATIENT_DATA_ACCESS: "patient.data.access",
  AI_RECOMMENDATION: "ai.recommendation",
  AI_MODEL_INFERENCE: "ai.model.inference",
  PAYMENT_PROCESSING: "payment.processing",
  PAYMENT_VERIFICATION: "payment.verification",
  DATABASE_QUERY: "database.query",
  EXTERNAL_API_CALL: "external.api.call",
} as const;

// Clinic-specific metrics
export const CLINIC_METRICS = {
  APPOINTMENT_DURATION: "clinic.appointment.duration",
  TREATMENT_SUCCESS_RATE: "clinic.treatment.success_rate",
  PATIENT_SATISFACTION: "clinic.patient.satisfaction",
  AI_RESPONSE_TIME: "clinic.ai.response_time",
  PAYMENT_SUCCESS_RATE: "clinic.payment.success_rate",
  DATABASE_QUERY_TIME: "clinic.database.query_time",
  API_REQUEST_COUNT: "clinic.api.request_count",
} as const;

/**
 * NEONPRO Observability Manager
 *
 * Provides comprehensive observability for aesthetic clinic workflows
 * with OpenTelemetry integration and clinic-specific instrumentation
 */
export class NEONPROObservability {
  private config: NEONPROObservabilityConfig;
  private tracer: any;
  private meter: any;
  private sdk: NodeSDK | null = null;
  private initialized = false;

  constructor(config: Partial<NEONPROObservabilityConfig> = {}) {
    this.config = { ...DEFAULT_NEONPRO_CONFIG, ...config };
  }

  /**
   * Initialize OpenTelemetry for NEONPRO
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log("🔍 NEONPRO Observability already initialized");
      return;
    }

    try {
      console.log("🔍 Initializing NEONPRO OpenTelemetry Observability...");

      // Configure resource
      const resource = new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: this.config.serviceName,
        [SemanticResourceAttributes.SERVICE_VERSION]:
          this.config.serviceVersion,
        [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]:
          this.config.environment,
        [SemanticResourceAttributes.SERVICE_NAMESPACE]: "neonpro-clinic",
      });

      // Configure tracing
      await this.setupTracing(resource);

      // Configure metrics
      if (this.config.enableMetrics) {
        await this.setupMetrics(resource);
      }

      // Setup auto-instrumentation
      if (this.config.enableAutoInstrumentation) {
        await this.setupAutoInstrumentation(resource);
      }

      this.initialized = true;
      console.log(
        "✅ NEONPRO OpenTelemetry Observability initialized successfully"
      );
    } catch (error) {
      console.error("❌ Failed to initialize NEONPRO Observability:", error);
      throw error;
    }
  }

  /**
   * Setup distributed tracing
   */
  private async setupTracing(resource: Resource): Promise<void> {
    try {
      // Create tracer provider
      const tracerProvider = new NodeTracerProvider({
        resource,
        sampler: {
          shouldSample: () => ({
            decision: Math.random() < this.config.samplingRate ? 1 : 0, // SamplingDecision.RECORD_AND_SAMPLE : SamplingDecision.NOT_RECORD
            attributes: {},
          }),
        } as any,
      });

      // Configure Jaeger exporter
      if (this.config.jaegerEndpoint) {
        const jaegerExporter = new JaegerExporter({
          endpoint: this.config.jaegerEndpoint,
        });

        const spanProcessor = new BatchSpanProcessor(jaegerExporter, {
          maxExportBatchSize: 512,
          scheduledDelayMillis: 5000,
          exportTimeoutMillis: 30000,
        });

        tracerProvider.addSpanProcessor(spanProcessor);
      }

      // Register tracer provider
      tracerProvider.register();

      // Get tracer
      this.tracer = trace.getTracer(
        this.config.serviceName,
        this.config.serviceVersion
      );

      console.log("🔍 NEONPRO tracing configured with Jaeger export");
    } catch (error) {
      console.error("❌ Failed to setup tracing:", error);
      throw error;
    }
  }

  /**
   * Setup metrics collection
   */
  private async setupMetrics(resource: Resource): Promise<void> {
    try {
      // Create meter provider
      const meterProvider = new MeterProvider({
        resource,
      });

      // Get meter
      this.meter = meterProvider.getMeter(
        this.config.serviceName,
        this.config.serviceVersion
      );

      console.log("📊 NEONPRO metrics configured");
    } catch (error) {
      console.error("❌ Failed to setup metrics:", error);
      throw error;
    }
  }

  /**
   * Setup automatic instrumentation
   */
  private async setupAutoInstrumentation(resource: Resource): Promise<void> {
    try {
      // Configure SDK with auto-instrumentations
      this.sdk = new NodeSDK({
        resource,
        instrumentations: [
          getNodeAutoInstrumentations({
            "@opentelemetry/instrumentation-fs": {
              enabled: false, // Disable file system instrumentation for performance
            },
          }),
        ],
      });

      // Start SDK
      this.sdk.start();

      console.log("🤖 NEONPRO auto-instrumentation enabled");
    } catch (error) {
      console.error("❌ Failed to setup auto-instrumentation:", error);
      throw error;
    }
  }

  /**
   * Create a span for appointment booking workflow
   */
  traceAppointmentFlow(
    appointmentId: string,
    patientId: string,
    operation: string
  ): any {
    if (!this.tracer) {
      console.warn("Tracer not initialized");
      return null;
    }

    return this.tracer.startSpan(CLINIC_SPANS.APPOINTMENT_BOOKING, {
      kind: SpanKind.SERVER,
      attributes: {
        "appointment.id": appointmentId,
        "patient.id": patientId,
        "appointment.operation": operation,
        "clinic.workflow": "appointment_management",
      },
    });
  }

  /**
   * Create a span for treatment workflow
   */
  traceTreatmentFlow(
    treatmentId: string,
    patientId: string,
    treatmentType: string
  ): any {
    if (!this.tracer) {
      console.warn("Tracer not initialized");
      return null;
    }

    return this.tracer.startSpan(CLINIC_SPANS.TREATMENT_SCHEDULING, {
      kind: SpanKind.SERVER,
      attributes: {
        "treatment.id": treatmentId,
        "patient.id": patientId,
        "treatment.type": treatmentType,
        "clinic.workflow": "treatment_management",
      },
    });
  }

  /**
   * Create a span for AI recommendation workflow
   */
  traceAIRecommendation(patientId: string, recommendationType: string): any {
    if (!this.tracer) {
      console.warn("Tracer not initialized");
      return null;
    }

    return this.tracer.startSpan(CLINIC_SPANS.AI_RECOMMENDATION, {
      kind: SpanKind.SERVER,
      attributes: {
        "patient.id": patientId,
        "ai.recommendation.type": recommendationType,
        "clinic.workflow": "ai_recommendation",
      },
    });
  }

  /**
   * Create a span for payment processing
   */
  tracePaymentFlow(paymentId: string, amount: number, method: string): any {
    if (!this.tracer) {
      console.warn("Tracer not initialized");
      return null;
    }

    return this.tracer.startSpan(CLINIC_SPANS.PAYMENT_PROCESSING, {
      kind: SpanKind.SERVER,
      attributes: {
        "payment.id": paymentId,
        "payment.amount": amount,
        "payment.method": method,
        "clinic.workflow": "payment_processing",
      },
    });
  }

  /**
   * Create a span for database operations
   */
  traceDatabaseOperation(
    operation: string,
    table: string,
    query?: string
  ): any {
    if (!this.tracer) {
      console.warn("Tracer not initialized");
      return null;
    }

    return this.tracer.startSpan(CLINIC_SPANS.DATABASE_QUERY, {
      kind: SpanKind.CLIENT,
      attributes: {
        "db.operation": operation,
        "db.table": table,
        "db.query": query ? query.substring(0, 100) : undefined, // Truncate for security
        "clinic.component": "database",
      },
    });
  }

  /**
   * Record clinic-specific metrics
   */
  recordMetric(
    metricName: string,
    value: number,
    attributes: Record<string, string> = {}
  ): void {
    if (!this.meter) {
      console.warn("Meter not initialized");
      return;
    }

    try {
      const counter = this.meter.createCounter(metricName);
      counter.add(value, attributes);
    } catch (error) {
      console.error("Failed to record metric:", error);
    }
  }

  /**
   * Record appointment duration metric
   */
  recordAppointmentDuration(duration: number, appointmentType: string): void {
    this.recordMetric(CLINIC_METRICS.APPOINTMENT_DURATION, duration, {
      "appointment.type": appointmentType,
    });
  }

  /**
   * Record AI response time metric
   */
  recordAIResponseTime(responseTime: number, modelType: string): void {
    this.recordMetric(CLINIC_METRICS.AI_RESPONSE_TIME, responseTime, {
      "ai.model.type": modelType,
    });
  }

  /**
   * Record payment success rate
   */
  recordPaymentSuccess(success: boolean, paymentMethod: string): void {
    this.recordMetric(CLINIC_METRICS.PAYMENT_SUCCESS_RATE, success ? 1 : 0, {
      "payment.method": paymentMethod,
      "payment.status": success ? "success" : "failure",
    });
  }

  /**
   * Shutdown observability system
   */
  async shutdown(): Promise<void> {
    try {
      if (this.sdk) {
        await this.sdk.shutdown();
      }
      console.log("🔍 NEONPRO Observability shutdown complete");
    } catch (error) {
      console.error("❌ Failed to shutdown observability:", error);
    }
  }

  /**
   * Get observability status
   */
  getStatus(): {
    initialized: boolean;
    config: NEONPROObservabilityConfig;
    tracingEnabled: boolean;
    metricsEnabled: boolean;
  } {
    return {
      initialized: this.initialized,
      config: this.config,
      tracingEnabled: !!this.tracer,
      metricsEnabled: !!this.meter,
    };
  }
}

// Singleton instance for NEONPRO observability
export const neonproObservability = new NEONPROObservability();

// Helper functions for easy usage
export async function initializeNEONPROObservability(
  config?: Partial<NEONPROObservabilityConfig>
): Promise<void> {
  if (config) {
    const customObservability = new NEONPROObservability(config);
    await customObservability.initialize();
  } else {
    await neonproObservability.initialize();
  }
}

export function traceClinicWorkflow(
  workflowType: string,
  workflowId: string,
  attributes: Record<string, string> = {}
): any {
  return neonproObservability.tracer?.startSpan(`clinic.${workflowType}`, {
    kind: SpanKind.SERVER,
    attributes: {
      "workflow.type": workflowType,
      "workflow.id": workflowId,
      ...attributes,
    },
  });
}

export function recordClinicMetric(
  metricName: string,
  value: number,
  attributes: Record<string, string> = {}
): void {
  neonproObservability.recordMetric(metricName, value, attributes);
}

/**
 * Supabase Integration for Observability Data Storage
 */
export class SupabaseObservabilityStorage {
  private supabaseUrl: string;
  private supabaseKey: string;

  constructor(supabaseUrl?: string, supabaseKey?: string) {
    this.supabaseUrl =
      supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    this.supabaseKey =
      supabaseKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  }

  /**
   * Store trace data in Supabase
   */
  async storeTraceData(traceData: {
    trace_id: string;
    span_id: string;
    operation_name: string;
    start_time: string;
    end_time?: string;
    duration_ms?: number;
    attributes: Record<string, any>;
    status: string;
  }): Promise<void> {
    try {
      // This would integrate with actual Supabase client
      // For now, we'll log the data structure
      console.log("📊 Storing trace data:", {
        table: "neonpro_traces",
        data: traceData,
        timestamp: new Date().toISOString(),
      });

      // In a real implementation, this would be:
      // const { data, error } = await supabase
      //   .from('neonpro_traces')
      //   .insert([traceData]);
    } catch (error) {
      console.error("Failed to store trace data:", error);
    }
  }

  /**
   * Store metrics data in Supabase
   */
  async storeMetricsData(metricsData: {
    metric_name: string;
    value: number;
    attributes: Record<string, string>;
    timestamp: string;
  }): Promise<void> {
    try {
      // This would integrate with actual Supabase client
      console.log("📈 Storing metrics data:", {
        table: "neonpro_metrics",
        data: metricsData,
        timestamp: new Date().toISOString(),
      });

      // In a real implementation, this would be:
      // const { data, error } = await supabase
      //   .from('neonpro_metrics')
      //   .insert([metricsData]);
    } catch (error) {
      console.error("Failed to store metrics data:", error);
    }
  }

  /**
   * Query trace data from Supabase
   */
  async queryTraceData(filters: {
    trace_id?: string;
    operation_name?: string;
    start_time?: string;
    end_time?: string;
  }): Promise<any[]> {
    try {
      // This would query actual Supabase data
      console.log("🔍 Querying trace data with filters:", filters);

      // Mock response for now
      return [
        {
          trace_id: "mock_trace_123",
          span_id: "mock_span_456",
          operation_name: "appointment.booking",
          start_time: new Date().toISOString(),
          duration_ms: 150,
          attributes: { "appointment.id": "123", "patient.id": "456" },
          status: "ok",
        },
      ];
    } catch (error) {
      console.error("Failed to query trace data:", error);
      return [];
    }
  }
}

// Singleton instance for Supabase storage
export const supabaseObservabilityStorage = new SupabaseObservabilityStorage();

/**
 * Initialize observability with Supabase integration
 */
export async function initializeObservabilityWithSupabase(
  config?: Partial<NEONPROObservabilityConfig>
): Promise<void> {
  // Initialize OpenTelemetry
  await initializeNEONPROObservability(config);

  // Setup Supabase integration
  console.log("🗄️ Supabase observability storage initialized");
}

import { NodeSDK } from '@opentelemetry/sdk-node';
// Conditional OpenTelemetry imports - these are optional dependencies
// @ts-ignore - Ignore if modules are not available
let getNodeAutoInstrumentations: any, PeriodicExportingMetricReader: any, OTLPTraceExporter: any, OTLPMetricExporter: any;

try {
  const autoInstruments = require('@opentelemetry/auto-instrumentations-node');
  const sdkMetrics = require('@opentelemetry/sdk-metrics');
  const exporterOtlp = require('@opentelemetry/exporter-otlp-http');
  
  getNodeAutoInstrumentations = autoInstruments.getNodeAutoInstrumentations;
  PeriodicExportingMetricReader = sdkMetrics.PeriodicExportingMetricReader;
  OTLPTraceExporter = exporterOtlp.OTLPTraceExporter;
  OTLPMetricExporter = exporterOtlp.OTLPMetricExporter;
} catch (e) {
  // OpenTelemetry not available - provide stubs
  getNodeAutoInstrumentations = () => [];
  PeriodicExportingMetricReader = class {};
  OTLPTraceExporter = class {};
  OTLPMetricExporter = class {};
}
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-node';
import { Sampler, SamplingDecision } from '@opentelemetry/sdk-trace-base';

// Healthcare-specific tracing attributes
export interface HealthcareSpanAttributes {
  'healthcare.clinic_id'?: string;
  'healthcare.user_id'?: string;
  'healthcare.feature'?: string;
  'healthcare.patient_data_involved'?: boolean;
  'healthcare.compliance_level'?: 'public' | 'internal' | 'sensitive';
  'healthcare.operation_type'?: 'read' | 'write' | 'delete' | 'export';
  'healthcare.data_classification'?: 'public' | 'personal' | 'medical' | 'financial';
}

// LGPD-compliant sampler that adjusts sampling based on data sensitivity
class HealthcareSampler implements Sampler {
  shouldSample(context: any, traceId: string, spanName: string, spanKind: any, attributes?: any): any {
    // Never sample spans containing sensitive healthcare data in production
    if (process.env.NODE_ENV === 'production') {
      const isPatientDataInvolved = attributes?.['healthcare.patient_data_involved'];
      const complianceLevel = attributes?.['healthcare.compliance_level'];
      
      if (isPatientDataInvolved || complianceLevel === 'sensitive') {
        return {
          decision: (SamplingDecision as any).NOT_RECORD_AND_SAMPLED || 0,
          attributes: {},
        };
      }
      
      // Reduced sampling for internal operations
      if (complianceLevel === 'internal') {
        return Math.random() < 0.1 ? 
          { decision: (SamplingDecision as any).RECORD_AND_SAMPLED || 1, attributes } :
          { decision: (SamplingDecision as any).NOT_RECORD || 0, attributes: {} };
      }
    }
    
    // Default sampling for public operations
    return {
      decision: (SamplingDecision as any).RECORD_AND_SAMPLED || 1,
      attributes: attributes || {},
    };
  }
  
  toString(): string {
    return 'HealthcareSampler';
  }
}

// Healthcare data sanitization for spans
function sanitizeSpanAttributes(attributes: any): any {
  if (!attributes) return {};
  
  const sensitiveFields = [
    'cpf', 'rg', 'email', 'phone', 'address', 'birthdate',
    'medical_history', 'diagnosis', 'prescription', 'treatment',
    'patient_name', 'patient_data', 'health_record'
  ];
  
  const sanitized = { ...attributes };
  
  for (const [key, value] of Object.entries(sanitized)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = sensitiveFields.some(field => lowerKey.includes(field));
    
    if (isSensitive) {
      sanitized[key] = '[REDACTED_HEALTHCARE_DATA]';
    }
  }
  
  return sanitized;
}

// OpenTelemetry configuration for healthcare platform
export function initializeOpenTelemetry(): NodeSDK | null {
  // Only initialize in production or when explicitly enabled
  if (process.env.NODE_ENV !== 'production' && process.env.ENABLE_TRACING !== 'true') {
    return null;
  }
  
  const traceExporter = new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT || 'http://localhost:4318/v1/traces',
    headers: {
      'Authorization': `Bearer ${process.env.OTEL_API_KEY || ''}`,
    },
  });
  
  const metricExporter = new OTLPMetricExporter({
    url: process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT || 'http://localhost:4318/v1/metrics',
    headers: {
      'Authorization': `Bearer ${process.env.OTEL_API_KEY || ''}`,
    },
  });
  
  const sdk = new NodeSDK({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: 'neonpro-healthcare-platform',
      [SemanticResourceAttributes.SERVICE_VERSION]: process.env.APP_VERSION || '1.0.0',
      [SemanticResourceAttributes.SERVICE_NAMESPACE]: 'healthcare',
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
      // Healthcare-specific attributes
      'healthcare.platform': 'neonpro',
      'healthcare.compliance': 'lgpd',
      'healthcare.region': 'br',
    }),
    
    // Use healthcare-aware sampler
    sampler: new HealthcareSampler(),
    
    // Instrumentation configuration
    instrumentations: [
      getNodeAutoInstrumentations({
        // Disable instrumentations that might capture sensitive data
        '@opentelemetry/instrumentation-dns': {
          enabled: false, // DNS queries might contain sensitive hostnames
        },
        '@opentelemetry/instrumentation-fs': {
          enabled: false, // File system operations might contain patient data
        },
        '@opentelemetry/instrumentation-http': {
          enabled: true,
          // Sanitize HTTP instrumentation
          requestHook: (span, request) => {
            // Remove sensitive headers and query parameters
            span.setAttributes(sanitizeSpanAttributes({
              'http.method': request.method,
              'http.url': sanitizeUrl(request.url || ''),
              'http.route': sanitizeRoute(request.url || ''),
            }));
          },
          responseHook: (span, response) => {
            // Only capture safe response attributes
            span.setAttributes({
              'http.status_code': response.statusCode,
              'http.status_text': response.statusMessage,
            });
          },
        },
        '@opentelemetry/instrumentation-express': {
          enabled: true,
        },
        '@opentelemetry/instrumentation-pg': {
          enabled: true,
          // Sanitize database queries
          responseHook: (span, responseInfo) => {
            // Don't capture query results that might contain patient data
            span.setAttributes({
              'db.rows_affected': responseInfo.data?.rowCount || 0,
            });
          },
        },
      }),
    ],
    
    // Trace processing with healthcare data protection
    spanProcessor: new BatchSpanProcessor(traceExporter, {
      maxExportBatchSize: 100,
      maxQueueSize: 1000,
      exportTimeoutMillis: 5000,
      scheduledDelayMillis: 1000,
    }),
    
    // Metrics configuration
    metricReader: new PeriodicExportingMetricReader({
      exporter: metricExporter,
      exportIntervalMillis: 30000, // Export metrics every 30 seconds
    }),
  });
  
  return sdk;
}

// URL sanitization for healthcare routes
function sanitizeUrl(url: string): string {
  // Remove patient IDs and sensitive path parameters
  return url
    .replace(/\/patient\/[a-zA-Z0-9-]+/g, '/patient/[ID]')
    .replace(/\/clinic\/[a-zA-Z0-9-]+/g, '/clinic/[ID]')
    .replace(/\/appointment\/[a-zA-Z0-9-]+/g, '/appointment/[ID]')
    .replace(/\/medical-record\/[a-zA-Z0-9-]+/g, '/medical-record/[ID]')
    // Remove query parameters that might contain sensitive data
    .replace(/[?&](cpf|rg|email|phone)=[^&]*/gi, '&$1=[REDACTED]')
    .replace(/^\?&/, '?') // Clean up leading &
    .replace(/&$/, ''); // Clean up trailing &
}

// Route sanitization for span names
function sanitizeRoute(url: string): string {
  const path = url.split('?')[0]; // Remove query parameters
  return path
    .replace(/\/patient\/[a-zA-Z0-9-]+/g, '/patient/:id')
    .replace(/\/clinic\/[a-zA-Z0-9-]+/g, '/clinic/:id')
    .replace(/\/appointment\/[a-zA-Z0-9-]+/g, '/appointment/:id')
    .replace(/\/medical-record\/[a-zA-Z0-9-]+/g, '/medical-record/:id');
}

// Healthcare-specific tracing utilities
export class HealthcareTracer {
  private static instance: HealthcareTracer;
  
  static getInstance(): HealthcareTracer {
    if (!HealthcareTracer.instance) {
      HealthcareTracer.instance = new HealthcareTracer();
    }
    return HealthcareTracer.instance;
  }
  
  // Create a healthcare-aware span
  createSpan(
    name: string, 
    attributes: HealthcareSpanAttributes = {},
    operation: () => Promise<any>
  ): Promise<any> {
    // In development or when tracing is disabled, just execute the operation
    if (process.env.NODE_ENV !== 'production' && process.env.ENABLE_TRACING !== 'true') {
      return operation();
    }
    
    // Import OpenTelemetry API only when needed
    const { trace } = require('@opentelemetry/api');
    const tracer = trace.getTracer('healthcare-operations');
    
    return tracer.startActiveSpan(name, { attributes }, async (span) => {
      try {
        // Add healthcare-specific context
        span.setAttributes({
          'healthcare.platform': 'neonpro',
          'healthcare.timestamp': new Date().toISOString(),
          ...sanitizeSpanAttributes(attributes),
        });
        
        const result = await operation();
        
        // Mark span as successful
        span.setStatus({ code: 1 }); // OK
        
        return result;
      } catch (error) {
        // Mark span as error but don't include sensitive error details
        span.setStatus({ code: 2, message: 'Operation failed' }); // ERROR
        span.recordException(error as Error);
        throw error;
      } finally {
        span.end();
      }
    });
  }
  
  // Trace patient data operations with extra protection
  tracePatientOperation(
    operationType: 'read' | 'write' | 'delete' | 'export',
    operation: () => Promise<any>,
    context: Partial<HealthcareSpanAttributes> = {}
  ): Promise<any> {
    return this.createSpan(
      `patient_data_${operationType}`,
      {
        ...context,
        'healthcare.patient_data_involved': true,
        'healthcare.operation_type': operationType,
        'healthcare.compliance_level': 'sensitive',
        'healthcare.data_classification': 'medical',
      },
      operation
    );
  }
  
  // Trace API operations
  traceApiOperation(
    endpoint: string,
    method: string,
    operation: () => Promise<any>,
    context: Partial<HealthcareSpanAttributes> = {}
  ): Promise<any> {
    return this.createSpan(
      `api_${method.toLowerCase()}_${sanitizeRoute(endpoint)}`,
      {
        ...context,
        'healthcare.operation_type': method.toLowerCase() as any,
        'healthcare.compliance_level': context['healthcare.compliance_level'] || 'internal',
        'http.method': method,
        'http.route': sanitizeRoute(endpoint),
      },
      operation
    );
  }
}

// Export singleton instance
export const healthcareTracer = HealthcareTracer.getInstance();

// Initialize and export SDK
export const sdk = initializeOpenTelemetry();
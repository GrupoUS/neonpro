import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { createLogger } from './logging';
import { initializeMetrics } from './metrics';
import { initializeHealthChecks } from './health';
import type { MonitoringConfig } from './types';

let sdk: NodeSDK | null = null;

export interface MonitoringConfig {
  serviceName: string;
  serviceVersion: string;
  environment: string;
  metrics: {
    enabled: boolean;
    port?: number;
    endpoint?: string;
  };
  tracing: {
    enabled: boolean;
    jaegerEndpoint?: string;
    sampleRate?: number;
  };
  logging: {
    level: 'error' | 'warn' | 'info' | 'debug' | 'trace';
    format: 'json' | 'pretty';
    transports: ('console' | 'file')[];
  };
  health: {
    enabled: boolean;
    endpoint?: string;
    interval?: number;
  };
}

export function initializeMonitoring(config: MonitoringConfig): void {
  console.log(`🔍 Initializing monitoring for ${config.serviceName} v${config.serviceVersion}`);

  // Initialize logging first
  const logger = createLogger(config.logging);
  logger.info('Monitoring system starting up', {
    service: config.serviceName,
    version: config.serviceVersion,
    environment: config.environment
  });

  // Initialize metrics
  if (config.metrics.enabled) {
    initializeMetrics({
      serviceName: config.serviceName,
      port: config.metrics.port || 9464,
      endpoint: config.metrics.endpoint || '/metrics'
    });
    logger.info('Metrics collection enabled', { port: config.metrics.port || 9464 });
  }

  // Initialize tracing
  if (config.tracing.enabled) {
    const instrumentations = getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': {
        enabled: false, // Disable file system instrumentation for performance
      },
    });

    const metricReaders = [];
    
    if (config.metrics.enabled) {
      metricReaders.push(
        new PeriodicExportingMetricReader({
          exporter: new PrometheusExporter({
            port: config.metrics.port || 9464,
            endpoint: config.metrics.endpoint || '/metrics',
          }),
          exportIntervalMillis: 10000, // Export every 10 seconds
        })
      );
    }

    const traceExporter = config.tracing.jaegerEndpoint 
      ? new JaegerExporter({
          endpoint: config.tracing.jaegerEndpoint,
        })
      : undefined;

    sdk = new NodeSDK({
      serviceName: config.serviceName,
      serviceVersion: config.serviceVersion,
      instrumentations,
      metricReader: metricReaders.length > 0 ? metricReaders[0] : undefined,
      traceExporter,
    });

    // Start the SDK
    sdk.start();
    logger.info('Tracing instrumentation enabled', {
      jaegerEndpoint: config.tracing.jaegerEndpoint || 'default',
      sampleRate: config.tracing.sampleRate || 1.0
    });
  }

  // Initialize health checks
  if (config.health.enabled) {
    initializeHealthChecks({
      endpoint: config.health.endpoint || '/health',
      interval: config.health.interval || 30000 // 30 seconds
    });
    logger.info('Health checks enabled', { 
      endpoint: config.health.endpoint || '/health',
      interval: config.health.interval || 30000
    });
  }

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('Received SIGTERM, shutting down monitoring gracefully');
    shutdownMonitoring();
  });

  process.on('SIGINT', () => {
    logger.info('Received SIGINT, shutting down monitoring gracefully');
    shutdownMonitoring();
  });

  logger.info('Monitoring system initialized successfully');
}

export function shutdownMonitoring(): void {
  if (sdk) {
    sdk.shutdown()
      .then(() => console.log('📊 Monitoring system shut down successfully'))
      .catch((error) => console.error('Error shutting down monitoring:', error));
  }
}
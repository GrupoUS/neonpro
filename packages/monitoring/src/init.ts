import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { initializeHealthChecks } from './health';
import { createLogger } from './logging';
import { initializeMetrics } from './metrics';
import type { MonitoringConfig } from './types';

export type { MonitoringConfig };

let sdk: NodeSDK | null = null;

export function initializeMonitoring(config: MonitoringConfig): void {
  console.log(
    `🔍 Initializing monitoring for ${config.serviceName} v${config.serviceVersion}`,
  );

  // Initialize logging first
  const logger = createLogger(config.logging);
  logger.info('Monitoring system starting up', {
    _service: config.serviceName,
    version: config.serviceVersion,
    environment: config.environment,
  });

  // Initialize metrics
  if (config.metrics.enabled) {
    initializeMetrics({
      serviceName: config.serviceName,
      port: config.metrics.port || 9464,
      endpoint: config.metrics.endpoint || '/metrics',
    });
    logger.info('Metrics collection enabled', {
      port: config.metrics.port || 9464,
    });
  }

  // Initialize tracing
  if (config.tracing.enabled) {
    const instrumentations = [
      new HttpInstrumentation(),
      new ExpressInstrumentation(),
    ];

    const traceExporter = config.tracing.jaegerEndpoint
      ? new JaegerExporter({
        endpoint: config.tracing.jaegerEndpoint,
      })
      : undefined;

    sdk = new NodeSDK({
      serviceName: config.serviceName,
      instrumentations,
      traceExporter,
    });

    // Start the SDK
    sdk.start();
    logger.info('Tracing instrumentation enabled', {
      jaegerEndpoint: config.tracing.jaegerEndpoint || 'default',
      sampleRate: config.tracing.sampleRate || 1.0,
    });
  }

  // Initialize health checks
  if (config.health.enabled) {
    initializeHealthChecks({
      endpoint: config.health.endpoint || '/health',
      interval: config.health.interval || 30000, // 30 seconds
    });
    logger.info('Health checks enabled', {
      endpoint: config.health.endpoint || '/health',
      interval: config.health.interval || 30000,
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
    sdk
      .shutdown()
      .then(() => console.log('📊 Monitoring system shut down successfully'))
      .catch(error => console.error('Error shutting down monitoring:', error));
  }
}

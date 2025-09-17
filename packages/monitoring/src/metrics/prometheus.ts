import { Registry, register } from 'prom-client';

let prometheusRegistry: Registry | null = null;

export function createPrometheusRegistry(serviceName: string): Registry {
  if (prometheusRegistry) {
    return prometheusRegistry;
  }

  prometheusRegistry = new Registry();
  
  // Add default labels
  prometheusRegistry.setDefaultLabels({
    service: serviceName,
    environment: process.env.NODE_ENV || 'development',
    version: process.env.SERVICE_VERSION || '1.0.0'
  });

  // Collect default metrics (CPU, memory, etc.)
  register.collectDefaultMetrics({
    register: prometheusRegistry,
    prefix: `${serviceName.replace(/-/g, '_')}_`,
  });

  return prometheusRegistry;
}

export function getPrometheusRegistry(): Registry {
  if (!prometheusRegistry) {
    throw new Error('Prometheus registry not initialized. Call createPrometheusRegistry first.');
  }
  return prometheusRegistry;
}
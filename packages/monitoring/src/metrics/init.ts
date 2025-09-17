import { createPrometheusRegistry } from './prometheus';
import { initializeCounters } from './counters';
import { initializeHistograms } from './histograms';
import { initializeGauges } from './gauges';

interface MetricsConfig {
  serviceName: string;
  port: number;
  endpoint: string;
}

export function initializeMetrics(config: MetricsConfig): void {
  console.log(`📊 Initializing metrics for ${config.serviceName}`);

  // Create Prometheus registry
  const registry = createPrometheusRegistry(config.serviceName);

  // Initialize metric types
  initializeCounters(registry);
  initializeHistograms(registry);
  initializeGauges(registry);

  console.log(`📊 Metrics server ready on port ${config.port}${config.endpoint}`);
}
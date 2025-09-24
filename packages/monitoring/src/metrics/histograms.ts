import { Histogram, Registry } from 'prom-client';
import type { MetricLabels } from '../types';

// Chat-specific histograms
let chatResponseTime: Histogram<string> | null = null;
let aiProviderLatency: Histogram<string> | null = null;
let databaseQueryDuration: Histogram<string> | null = null;
let piiRedactionDuration: Histogram<string> | null = null;

export function initializeHistograms(registry: Registry): void {
  // Chat response time histogram
  chatResponseTime = new Histogram({
    name: 'chat_response_time_seconds',
    help: 'Chat response time in seconds',
    labelNames: ['endpoint', 'method', 'status_code'],
    buckets: [0.1, 0.5, 1, 2, 5, 10], // Response time buckets
    registers: [registry],
  });

  // AI provider latency histogram
  aiProviderLatency = new Histogram({
    name: 'ai_provider_latency_seconds',
    help: 'AI provider response latency in seconds',
    labelNames: ['provider', 'model', 'request_type'],
    buckets: [0.5, 1, 2, 5, 10, 30], // AI provider buckets
    registers: [registry],
  });

  // Database query duration histogram
  databaseQueryDuration = new Histogram({
    name: 'database_query_duration_seconds',
    help: 'Database query duration in seconds',
    labelNames: ['table', 'operation'],
    buckets: [0.01, 0.05, 0.1, 0.5, 1, 2], // Database buckets
    registers: [registry],
  });

  // PII redaction duration histogram
  piiRedactionDuration = new Histogram({
    name: 'pii_redaction_duration_seconds',
    help: 'PII redaction processing duration in seconds',
    labelNames: ['content_type', 'redaction_type'],
    buckets: [0.001, 0.005, 0.01, 0.05, 0.1], // Fast processing buckets
    registers: [registry],
  });
}

export function observeChatResponseTime(
  duration: number,
  labels: MetricLabels = {},
): void {
  chatResponseTime?.observe(labels, duration);
}

export function observeAIProviderLatency(
  duration: number,
  labels: MetricLabels = {},
): void {
  aiProviderLatency?.observe(labels, duration);
}

export function observeDatabaseQueryDuration(
  duration: number,
  labels: MetricLabels = {},
): void {
  databaseQueryDuration?.observe(labels, duration);
}

export function observePIIRedactionDuration(
  duration: number,
  labels: MetricLabels = {},
): void {
  piiRedactionDuration?.observe(labels, duration);
}

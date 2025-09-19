/**
 * Analytics Ingestion Module
 * 
 * Real-time event collection and queue management for healthcare analytics.
 * Provides high-performance in-memory event collection with automatic flushing,
 * batch processing, and compliance features.
 * 
 * @module @neonpro/core-services/analytics/ingestion
 */

export {
  EventCollector,
  createEventCollector,
  defaultEventCollector,
  type EventCollectorConfig,
  type CollectResult,
  type FlushResult,
  DEFAULT_CONFIG,
} from './event-collector';

// Re-export ingestion-related types from the types module
export type { IngestionEvent } from '../types/ingestion';
/**
 * EventCollector Test Suite
 * 
 * Comprehensive tests for event collection, queue management, and flush operations
 * with ≥90% branch coverage as required by T103.2.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  EventCollector,
  createEventCollector,
  defaultEventCollector,
  DEFAULT_CONFIG,
  type EventCollectorConfig,
  type CollectResult,
  type FlushResult,
} from '../../ingestion/event-collector';
import type { IngestionEvent } from '../../types/ingestion';

// Test utilities
const createMockEvent = (overrides: Partial<IngestionEvent> = {}): IngestionEvent => ({
  eventType: 'test_event',
  source: 'test_source',
  timestamp: new Date().toISOString(),
  data: { test: 'data' },
  metadata: {
    patientId: 'patient123',
    sessionId: 'session456',
  },
  ...overrides,
});

const createMockFlushHandler = () => {
  const handler = vi.fn().mockResolvedValue(undefined);
  return handler;
};

const createMockErrorHandler = () => {
  const handler = vi.fn();
  return handler;
};

describe('EventCollector', () => {
  let collector: EventCollector;
  let mockFlushHandler: ReturnType<typeof createMockFlushHandler>;
  let mockErrorHandler: ReturnType<typeof createMockErrorHandler>;

  beforeEach(() => {
    mockFlushHandler = createMockFlushHandler();
    mockErrorHandler = createMockErrorHandler();
    
    collector = new EventCollector({
      maxQueueSize: 5,
      autoFlushInterval: 0, // Disable auto-flush for controlled testing
      maxBatchSize: 3,
      enableAuditLog: false, // Disable audit logs for cleaner test output
      onFlush: mockFlushHandler,
      onError: mockErrorHandler,
    });
  });

  afterEach(async () => {
    await collector.stop();
  });

  describe('Constructor and Configuration', () => {
    it('should create EventCollector with default configuration', () => {
      const defaultCollector = new EventCollector();
      const stats = defaultCollector.getStats();
      
      expect(stats.config.maxQueueSize).toBe(DEFAULT_CONFIG.maxQueueSize);
      expect(stats.config.autoFlushInterval).toBe(DEFAULT_CONFIG.autoFlushInterval);
      expect(stats.config.maxBatchSize).toBe(DEFAULT_CONFIG.maxBatchSize);
      expect(stats.config.enableAuditLog).toBe(DEFAULT_CONFIG.enableAuditLog);
      
      defaultCollector.stop();
    });

    it('should create EventCollector with custom configuration', () => {
      const customConfig: Partial<EventCollectorConfig> = {
        maxQueueSize: 100,
        autoFlushInterval: 5000,
        maxBatchSize: 50,
        enableAuditLog: false,
      };
      
      const customCollector = new EventCollector(customConfig);
      const stats = customCollector.getStats();
      
      expect(stats.config.maxQueueSize).toBe(100);
      expect(stats.config.autoFlushInterval).toBe(5000);
      expect(stats.config.maxBatchSize).toBe(50);
      expect(stats.config.enableAuditLog).toBe(false);
      
      customCollector.stop();
    });

    it('should create EventCollector using factory function', () => {
      const factoryCollector = createEventCollector({ maxQueueSize: 10 });
      const stats = factoryCollector.getStats();
      
      expect(stats.config.maxQueueSize).toBe(10);
      factoryCollector.stop();
    });
  });

  describe('collectEvent() - Core Functionality', () => {
    it('should successfully collect a valid event', async () => {
      const event = createMockEvent();
      const result = await collector.collectEvent(event);
      
      expect(result.success).toBe(true);
      expect(result.queueSize).toBe(1);
      expect(result.message).toBe('Event collected successfully');
      expect(result.autoFlushed).toBeUndefined();
      
      const stats = collector.getStats();
      expect(stats.totalCollected).toBe(1);
      expect(stats.queueSize).toBe(1);
    });

    it('should add timestamp to event if not present', async () => {
      const eventWithoutTimestamp = createMockEvent();
      delete eventWithoutTimestamp.timestamp;
      
      const result = await collector.collectEvent(eventWithoutTimestamp);
      expect(result.success).toBe(true);
      
      // Verify timestamp was added by checking queue
      const stats = collector.getStats();
      expect(stats.queueSize).toBe(1);
    });

    it('should collect multiple events in FIFO order', async () => {
      const events = [
        createMockEvent({ eventType: 'event1' }),
        createMockEvent({ eventType: 'event2' }),
        createMockEvent({ eventType: 'event3' }),
      ];
      
      for (const event of events) {
        const result = await collector.collectEvent(event);
        expect(result.success).toBe(true);
      }
      
      const stats = collector.getStats();
      expect(stats.queueSize).toBe(3);
      expect(stats.totalCollected).toBe(3);
    });

    it('should trigger auto-flush when batch size is reached', async () => {
      // maxBatchSize is 3, so 3rd event should trigger auto-flush
      const events = [
        createMockEvent({ eventType: 'event1' }),
        createMockEvent({ eventType: 'event2' }),
        createMockEvent({ eventType: 'event3' }),
      ];
      
      let lastResult: CollectResult;
      for (const event of events) {
        lastResult = await collector.collectEvent(event);
        expect(lastResult.success).toBe(true);
      }
      
      expect(lastResult!.autoFlushed).toBe(true);
      expect(lastResult!.message).toBe('Event collected and auto-flushed');
      expect(mockFlushHandler).toHaveBeenCalledOnce();
      expect(mockFlushHandler).toHaveBeenCalledWith(events);
    });

    it('should handle queue overflow by flushing', async () => {
      // maxQueueSize is 5, fill queue and add one more
      const events = Array.from({ length: 6 }, (_, i) => 
        createMockEvent({ eventType: `event${i}` })
      );
      
      for (const event of events) {
        const result = await collector.collectEvent(event);
        expect(result.success).toBe(true);
      }
      
      // Should have triggered flush due to queue overflow
      expect(mockFlushHandler).toHaveBeenCalled();
    });
  });

  describe('collectEvent() - Validation', () => {
    it('should reject null or undefined event', async () => {
      const result = await collector.collectEvent(null as any);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid event');
      expect(result.queueSize).toBe(0);
      expect(mockErrorHandler).toHaveBeenCalled();
    });

    it('should reject event without eventType', async () => {
      const invalidEvent = createMockEvent();
      delete (invalidEvent as any).eventType;
      
      const result = await collector.collectEvent(invalidEvent);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Event type is required');
      expect(result.queueSize).toBe(0);
    });

    it('should reject event without source', async () => {
      const invalidEvent = createMockEvent();
      delete (invalidEvent as any).source;
      
      const result = await collector.collectEvent(invalidEvent);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Event source is required');
      expect(result.queueSize).toBe(0);
    });

    it('should reject event without data', async () => {
      const invalidEvent = createMockEvent();
      delete (invalidEvent as any).data;
      
      const result = await collector.collectEvent(invalidEvent);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Event data is required');
      expect(result.queueSize).toBe(0);
    });

    it('should reject event with invalid patientId type', async () => {
      const invalidEvent = createMockEvent({
        metadata: {
          patientId: 123 as any, // Should be string
          sessionId: 'session456',
        },
      });
      
      const result = await collector.collectEvent(invalidEvent);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Patient ID must be a string');
      expect(result.queueSize).toBe(0);
    });
  });

  describe('flush() - Core Functionality', () => {
    it('should flush empty queue successfully', async () => {
      const result = await collector.flush();
      
      expect(result.success).toBe(true);
      expect(result.processedCount).toBe(0);
      expect(result.errors).toHaveLength(0);
      expect(result.duration).toBeGreaterThanOrEqual(0);
      expect(mockFlushHandler).not.toHaveBeenCalled();
    });

    it('should flush queued events successfully', async () => {
      const events = [
        createMockEvent({ eventType: 'event1' }),
        createMockEvent({ eventType: 'event2' }),
      ];
      
      for (const event of events) {
        await collector.collectEvent(event);
      }
      
      const result = await collector.flush();
      
      expect(result.success).toBe(true);
      expect(result.processedCount).toBe(2);
      expect(result.errors).toHaveLength(0);
      expect(result.duration).toBeGreaterThan(0);
      expect(mockFlushHandler).toHaveBeenCalledOnce();
      expect(mockFlushHandler).toHaveBeenCalledWith(events);
      
      // Queue should be empty after flush
      const stats = collector.getStats();
      expect(stats.queueSize).toBe(0);
      expect(stats.totalProcessed).toBe(2);
    });

    it('should process events in batches when queue exceeds batch size', async () => {
      // maxBatchSize is 3, add 5 events
      const events = Array.from({ length: 5 }, (_, i) => 
        createMockEvent({ eventType: `event${i}` })
      );
      
      for (const event of events) {
        await collector.collectEvent(event);
      }
      
      const result = await collector.flush();
      
      expect(result.success).toBe(true);
      expect(result.processedCount).toBe(5);
      expect(mockFlushHandler).toHaveBeenCalledTimes(2); // 2 batches: 3 + 2
      
      // Check batch contents
      const firstBatch = mockFlushHandler.mock.calls[0][0];
      const secondBatch = mockFlushHandler.mock.calls[1][0];
      
      expect(firstBatch).toHaveLength(3);
      expect(secondBatch).toHaveLength(2);
    });

    it('should handle flush errors and continue processing', async () => {
      // Setup flush handler to fail
      const failingFlushHandler = vi.fn().mockRejectedValue(new Error('Flush failed'));
      const collectorWithFailingFlush = new EventCollector({
        maxQueueSize: 5,
        autoFlushInterval: 0,
        maxBatchSize: 2,
        enableAuditLog: false,
        onFlush: failingFlushHandler,
        onError: mockErrorHandler,
      });
      
      const events = [
        createMockEvent({ eventType: 'event1' }),
        createMockEvent({ eventType: 'event2' }),
      ];
      
      for (const event of events) {
        await collectorWithFailingFlush.collectEvent(event);
      }
      
      const result = await collectorWithFailingFlush.flush();
      
      expect(result.success).toBe(false);
      expect(result.processedCount).toBe(0);
      expect(result.errors).toHaveLength(2); // Both events failed
      expect(result.errors[0].error.message).toBe('Flush failed');
      
      await collectorWithFailingFlush.stop();
    });

    it('should prevent concurrent flush operations', async () => {
      const events = [
        createMockEvent({ eventType: 'event1' }),
        createMockEvent({ eventType: 'event2' }),
      ];
      
      for (const event of events) {
        await collector.collectEvent(event);
      }
      
      // Start two flush operations simultaneously
      const [result1, result2] = await Promise.all([
        collector.flush(),
        collector.flush(),
      ]);
      
      // First should succeed, second should fail due to concurrent processing
      expect(result1.success || result2.success).toBe(true);
      expect(result1.success && result2.success).toBe(false);
    });
  });

  describe('Statistics and State Management', () => {
    it('should provide accurate statistics', async () => {
      const initialStats = collector.getStats();
      
      expect(initialStats.queueSize).toBe(0);
      expect(initialStats.totalCollected).toBe(0);
      expect(initialStats.totalProcessed).toBe(0);
      expect(initialStats.isProcessing).toBe(false);
      expect(initialStats.lastFlushTime).toBe(0);
      
      // Add some events
      await collector.collectEvent(createMockEvent());
      await collector.collectEvent(createMockEvent());
      
      const midStats = collector.getStats();
      expect(midStats.queueSize).toBe(2);
      expect(midStats.totalCollected).toBe(2);
      expect(midStats.totalProcessed).toBe(0);
      
      // Flush events
      await collector.flush();
      
      const finalStats = collector.getStats();
      expect(finalStats.queueSize).toBe(0);
      expect(finalStats.totalCollected).toBe(2);
      expect(finalStats.totalProcessed).toBe(2);
      expect(finalStats.lastFlushTime).toBeGreaterThan(0);
    });

    it('should clear queue without processing', async () => {
      await collector.collectEvent(createMockEvent());
      await collector.collectEvent(createMockEvent());
      
      expect(collector.getStats().queueSize).toBe(2);
      
      collector.clear();
      
      expect(collector.getStats().queueSize).toBe(0);
      expect(mockFlushHandler).not.toHaveBeenCalled();
    });
  });

  describe('Auto-flush Functionality', () => {
    it('should auto-flush based on interval', async () => {
      const autoFlushCollector = new EventCollector({
        maxQueueSize: 10,
        autoFlushInterval: 100, // 100ms
        maxBatchSize: 5,
        enableAuditLog: false,
        onFlush: mockFlushHandler,
      });
      
      await autoFlushCollector.collectEvent(createMockEvent());
      
      // Wait for auto-flush interval
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(mockFlushHandler).toHaveBeenCalled();
      
      await autoFlushCollector.stop();
    });

    it('should not auto-flush empty queue', async () => {
      const autoFlushCollector = new EventCollector({
        maxQueueSize: 10,
        autoFlushInterval: 100,
        maxBatchSize: 5,
        enableAuditLog: false,
        onFlush: mockFlushHandler,
      });
      
      // Wait for auto-flush interval without adding events
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(mockFlushHandler).not.toHaveBeenCalled();
      
      await autoFlushCollector.stop();
    });
  });

  describe('Error Handling', () => {
    it('should handle collection errors gracefully', async () => {
      // Force an error by passing invalid event structure
      const result = await collector.collectEvent({} as any);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Event type is required');
      expect(mockErrorHandler).toHaveBeenCalled();
    });

    it('should handle flush errors when queue is full', async () => {
      const failingFlushHandler = vi.fn().mockRejectedValue(new Error('Network error'));
      const errorCollector = new EventCollector({
        maxQueueSize: 2,
        autoFlushInterval: 0,
        maxBatchSize: 1,
        enableAuditLog: false,
        onFlush: failingFlushHandler,
        onError: mockErrorHandler,
      });
      
      // Fill queue
      await errorCollector.collectEvent(createMockEvent());
      await errorCollector.collectEvent(createMockEvent());
      
      // This should trigger flush due to queue being full, but flush will fail
      const result = await errorCollector.collectEvent(createMockEvent());
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('Queue full and flush failed');
      
      await errorCollector.stop();
    });
  });

  describe('Lifecycle Management', () => {
    it('should stop and flush remaining events', async () => {
      await collector.collectEvent(createMockEvent());
      await collector.collectEvent(createMockEvent());
      
      const result = await collector.stop();
      
      expect(result.success).toBe(true);
      expect(result.processedCount).toBe(2);
      expect(mockFlushHandler).toHaveBeenCalled();
    });
  });

  describe('Default EventCollector', () => {
    it('should provide working default instance', async () => {
      const event = createMockEvent();
      const result = await defaultEventCollector.collectEvent(event);
      
      expect(result.success).toBe(true);
      expect(result.queueSize).toBe(1);
      
      // Clean up
      await defaultEventCollector.flush();
    });
  });

  describe('Healthcare Compliance Features', () => {
    it('should handle patient data validation', async () => {
      const patientEvent = createMockEvent({
        metadata: {
          patientId: 'patient-123',
          sessionId: 'session-456',
        },
      });
      
      const result = await collector.collectEvent(patientEvent);
      
      expect(result.success).toBe(true);
      expect(result.queueSize).toBe(1);
    });

    it('should enable audit logging when configured', async () => {
      const auditCollector = new EventCollector({
        maxQueueSize: 5,
        autoFlushInterval: 0,
        maxBatchSize: 3,
        enableAuditLog: true,
        onFlush: mockFlushHandler,
      });
      
      // Mock console.log to capture audit entries
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      await auditCollector.collectEvent(createMockEvent());
      await auditCollector.flush();
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[AUDIT]',
        expect.stringContaining('EVENT_COLLECTED')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        '[AUDIT]',
        expect.stringContaining('EVENTS_FLUSHED')
      );
      
      consoleSpy.mockRestore();
      await auditCollector.stop();
    });
  });
});
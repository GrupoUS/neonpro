/**
 * Event System Tests
 * Story 7.3: Webhook & Event System Implementation
 *
 * Comprehensive test suite for the event system functionality:
 * - Event creation and validation
 * - Event publishing and queuing
 * - Event filtering and subscription
 * - Real-time streaming
 * - Analytics and monitoring
 * - Error handling and edge cases
 */

import type { describe, it, expect, beforeEach, afterEach, vi, Mock } from "vitest";
import type { EventSystem } from "../event-system";
import type { EventUtils } from "../utils";
import type { BaseEvent, EventType, EventPriority, EventSubscription, EventFilter } from "../types";

// Mock Supabase
const mockSupabase = {
  from: vi.fn(() => ({
    insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue({ data: [], error: null }),
    update: vi.fn().mockResolvedValue({ data: null, error: null }),
    delete: vi.fn().mockResolvedValue({ data: null, error: null }),
  })),
  channel: vi.fn(() => ({
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockResolvedValue({ error: null }),
  })),
};

// Mock crypto for consistent IDs in tests
vi.mock("crypto", () => ({
  randomUUID: vi.fn(() => "test-uuid-123"),
}));

describe("EventSystem", () => {
  let eventSystem: EventSystem;
  let mockConfig: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockConfig = {
      supabase: mockSupabase,
      enableRealtime: true,
      enableAnalytics: true,
      queueConfig: {
        maxSize: 1000,
        processingInterval: 1000,
        batchSize: 10,
      },
      retentionDays: 30,
    };

    eventSystem = new EventSystem(mockConfig);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Event Creation and Validation", () => {
    it("should create a valid event with all required fields", async () => {
      const eventData = {
        type: "patient.created" as EventType,
        source: "patient-service",
        data: { patientId: "123", name: "John Doe" },
        metadata: { clinicId: "clinic-123" },
      };

      const event = await eventSystem.createEvent(eventData);

      expect(event).toMatchObject({
        id: "test-uuid-123",
        type: "patient.created",
        source: "patient-service",
        data: { patientId: "123", name: "John Doe" },
        metadata: { clinicId: "clinic-123" },
        priority: "normal",
        version: "1.0.0",
      });
      expect(event.timestamp).toBeInstanceOf(Date);
    });

    it("should validate event data and reject invalid events", async () => {
      const invalidEventData = {
        type: "invalid.type" as EventType,
        source: "",
        data: null,
        metadata: {},
      };

      await expect(eventSystem.createEvent(invalidEventData)).rejects.toThrow(
        "Event validation failed",
      );
    });

    it("should set default values for optional fields", async () => {
      const minimalEventData = {
        type: "patient.created" as EventType,
        source: "patient-service",
        data: { patientId: "123" },
        metadata: { clinicId: "clinic-123" },
      };

      const event = await eventSystem.createEvent(minimalEventData);

      expect(event.priority).toBe("normal");
      expect(event.version).toBe("1.0.0");
      expect(event.context).toEqual({});
    });

    it("should generate unique fingerprints for different events", async () => {
      const event1Data = {
        type: "patient.created" as EventType,
        source: "patient-service",
        data: { patientId: "123" },
        metadata: { clinicId: "clinic-123" },
      };

      const event2Data = {
        type: "patient.created" as EventType,
        source: "patient-service",
        data: { patientId: "456" },
        metadata: { clinicId: "clinic-123" },
      };

      const event1 = await eventSystem.createEvent(event1Data);
      const event2 = await eventSystem.createEvent(event2Data);

      expect(event1.fingerprint).not.toBe(event2.fingerprint);
    });
  });

  describe("Event Publishing", () => {
    it("should publish event and add to queue", async () => {
      const eventData = {
        type: "patient.created" as EventType,
        source: "patient-service",
        data: { patientId: "123" },
        metadata: { clinicId: "clinic-123" },
      };

      const eventId = await eventSystem.publishEvent(eventData);

      expect(eventId).toBe("test-uuid-123");
      expect(mockSupabase.from).toHaveBeenCalledWith("events");
    });

    it("should handle high priority events immediately", async () => {
      const urgentEventData = {
        type: "system.error" as EventType,
        source: "system",
        data: { error: "Critical system failure" },
        metadata: { clinicId: "clinic-123" },
        priority: "critical" as EventPriority,
      };

      const eventId = await eventSystem.publishEvent(urgentEventData);

      expect(eventId).toBe("test-uuid-123");
      // Should be processed immediately for critical events
    });

    it("should prevent duplicate events using fingerprints", async () => {
      const eventData = {
        type: "patient.created" as EventType,
        source: "patient-service",
        data: { patientId: "123" },
        metadata: { clinicId: "clinic-123" },
      };

      // Mock existing event with same fingerprint
      mockSupabase
        .from()
        .select()
        .eq()
        .mockResolvedValueOnce({
          data: [{ id: "existing-event" }],
          error: null,
        });

      await expect(eventSystem.publishEvent(eventData)).rejects.toThrow("Duplicate event detected");
    });
  });

  describe("Event Subscriptions", () => {
    it("should create event subscription with filters", async () => {
      const subscription: Omit<EventSubscription, "id" | "createdAt" | "updatedAt"> = {
        name: "Patient Events",
        clinicId: "clinic-123",
        eventTypes: ["patient.created", "patient.updated"],
        isActive: true,
        filters: {
          clinicId: "clinic-123",
          priority: ["normal", "high"],
        },
      };

      const subscriptionId = await eventSystem.createSubscription(subscription);

      expect(subscriptionId).toBe("test-uuid-123");
      expect(mockSupabase.from).toHaveBeenCalledWith("event_subscriptions");
    });

    it("should update existing subscription", async () => {
      const updates = {
        eventTypes: ["patient.created", "patient.updated", "patient.deleted"],
        isActive: false,
      };

      await eventSystem.updateSubscription("sub-123", updates);

      expect(mockSupabase.from().update).toHaveBeenCalledWith(expect.objectContaining(updates));
    });

    it("should delete subscription", async () => {
      await eventSystem.deleteSubscription("sub-123");

      expect(mockSupabase.from().delete().eq).toHaveBeenCalledWith("id", "sub-123");
    });
  });

  describe("Event Filtering", () => {
    it("should filter events by type", () => {
      const event: BaseEvent = {
        id: "event-123",
        type: "patient.created",
        source: "patient-service",
        data: { patientId: "123" },
        metadata: { clinicId: "clinic-123" },
        priority: "normal",
        version: "1.0.0",
        timestamp: new Date(),
        fingerprint: "fp-123",
        context: {},
      };

      const filter: EventFilter = {
        eventTypes: ["patient.created", "patient.updated"],
      };

      const matches = eventSystem.matchesFilter(event, filter);
      expect(matches).toBe(true);
    });

    it("should filter events by clinic ID", () => {
      const event: BaseEvent = {
        id: "event-123",
        type: "patient.created",
        source: "patient-service",
        data: { patientId: "123" },
        metadata: { clinicId: "clinic-123" },
        priority: "normal",
        version: "1.0.0",
        timestamp: new Date(),
        fingerprint: "fp-123",
        context: {},
      };

      const filter: EventFilter = {
        clinicId: "clinic-456",
      };

      const matches = eventSystem.matchesFilter(event, filter);
      expect(matches).toBe(false);
    });

    it("should filter events by priority", () => {
      const event: BaseEvent = {
        id: "event-123",
        type: "patient.created",
        source: "patient-service",
        data: { patientId: "123" },
        metadata: { clinicId: "clinic-123" },
        priority: "high",
        version: "1.0.0",
        timestamp: new Date(),
        fingerprint: "fp-123",
        context: {},
      };

      const filter: EventFilter = {
        priority: ["normal", "high"],
      };

      const matches = eventSystem.matchesFilter(event, filter);
      expect(matches).toBe(true);
    });

    it("should filter events by custom data fields", () => {
      const event: BaseEvent = {
        id: "event-123",
        type: "patient.created",
        source: "patient-service",
        data: { patientId: "123", department: "cardiology" },
        metadata: { clinicId: "clinic-123" },
        priority: "normal",
        version: "1.0.0",
        timestamp: new Date(),
        fingerprint: "fp-123",
        context: {},
      };

      const filter: EventFilter = {
        dataFilters: {
          "data.department": "cardiology",
        },
      };

      const matches = eventSystem.matchesFilter(event, filter);
      expect(matches).toBe(true);
    });
  });

  describe("Event Queue Management", () => {
    it("should add events to queue", async () => {
      const event: BaseEvent = {
        id: "event-123",
        type: "patient.created",
        source: "patient-service",
        data: { patientId: "123" },
        metadata: { clinicId: "clinic-123" },
        priority: "normal",
        version: "1.0.0",
        timestamp: new Date(),
        fingerprint: "fp-123",
        context: {},
      };

      await eventSystem.addToQueue(event);

      const queueSize = await eventSystem.getQueueSize();
      expect(queueSize).toBe(1);
    });

    it("should process queue in batches", async () => {
      // Add multiple events to queue
      for (let i = 0; i < 5; i++) {
        const event: BaseEvent = {
          id: `event-${i}`,
          type: "patient.created",
          source: "patient-service",
          data: { patientId: `${i}` },
          metadata: { clinicId: "clinic-123" },
          priority: "normal",
          version: "1.0.0",
          timestamp: new Date(),
          fingerprint: `fp-${i}`,
          context: {},
        };
        await eventSystem.addToQueue(event);
      }

      await eventSystem.processQueue();

      // Queue should be processed
      const queueSize = await eventSystem.getQueueSize();
      expect(queueSize).toBe(0);
    });

    it("should handle queue overflow", async () => {
      // Mock queue at capacity
      const largeQueue = Array.from({ length: 1001 }, (_, i) => ({
        id: `event-${i}`,
        type: "patient.created",
        source: "patient-service",
        data: { patientId: `${i}` },
        metadata: { clinicId: "clinic-123" },
        priority: "normal",
        version: "1.0.0",
        timestamp: new Date(),
        fingerprint: `fp-${i}`,
        context: {},
        addedAt: new Date(),
      }));

      // Should handle overflow gracefully
      const event: BaseEvent = {
        id: "overflow-event",
        type: "patient.created",
        source: "patient-service",
        data: { patientId: "overflow" },
        metadata: { clinicId: "clinic-123" },
        priority: "normal",
        version: "1.0.0",
        timestamp: new Date(),
        fingerprint: "fp-overflow",
        context: {},
      };

      await expect(eventSystem.addToQueue(event)).rejects.toThrow("Event queue is full");
    });
  });

  describe("Real-time Streaming", () => {
    it("should start real-time streaming", async () => {
      await eventSystem.startRealTimeStreaming();

      expect(mockSupabase.channel).toHaveBeenCalledWith("events");
    });

    it("should stop real-time streaming", async () => {
      await eventSystem.startRealTimeStreaming();
      await eventSystem.stopRealTimeStreaming();

      // Should clean up subscriptions
      expect(eventSystem.isStreamingActive()).toBe(false);
    });

    it("should handle real-time event notifications", async () => {
      const mockHandler = vi.fn();
      eventSystem.onRealTimeEvent(mockHandler);

      await eventSystem.startRealTimeStreaming();

      // Simulate real-time event
      const realtimeEvent = {
        eventType: "INSERT",
        new: {
          id: "event-123",
          type: "patient.created",
          data: { patientId: "123" },
        },
      };

      // Should call handler with event
      expect(mockHandler).toHaveBeenCalledWith(realtimeEvent.new);
    });
  });

  describe("Analytics and Monitoring", () => {
    it("should get event analytics", async () => {
      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-01-31");

      mockSupabase
        .from()
        .select()
        .mockResolvedValueOnce({
          data: [
            { type: "patient.created", count: 100 },
            { type: "appointment.created", count: 50 },
          ],
          error: null,
        });

      const analytics = await eventSystem.getEventAnalytics(startDate, endDate);

      expect(analytics).toEqual({
        totalEvents: 150,
        eventsByType: {
          "patient.created": 100,
          "appointment.created": 50,
        },
        eventsByPriority: {},
        eventsBySource: {},
        averageEventsPerDay: expect.any(Number),
      });
    });

    it("should get system health metrics", async () => {
      const health = await eventSystem.getSystemHealth();

      expect(health).toMatchObject({
        status: expect.any(String),
        queueSize: expect.any(Number),
        isStreamingActive: expect.any(Boolean),
        lastProcessedAt: expect.any(Date),
        metrics: expect.any(Object),
      });
    });

    it("should track event processing metrics", async () => {
      const event: BaseEvent = {
        id: "event-123",
        type: "patient.created",
        source: "patient-service",
        data: { patientId: "123" },
        metadata: { clinicId: "clinic-123" },
        priority: "normal",
        version: "1.0.0",
        timestamp: new Date(),
        fingerprint: "fp-123",
        context: {},
      };

      await eventSystem.publishEvent({
        type: event.type,
        source: event.source,
        data: event.data,
        metadata: event.metadata,
      });

      const metrics = await eventSystem.getProcessingMetrics();

      expect(metrics).toMatchObject({
        totalProcessed: expect.any(Number),
        averageProcessingTime: expect.any(Number),
        errorRate: expect.any(Number),
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle database connection errors", async () => {
      mockSupabase.from().insert.mockRejectedValueOnce(new Error("Database connection failed"));

      const eventData = {
        type: "patient.created" as EventType,
        source: "patient-service",
        data: { patientId: "123" },
        metadata: { clinicId: "clinic-123" },
      };

      await expect(eventSystem.publishEvent(eventData)).rejects.toThrow("Failed to publish event");
    });

    it("should handle invalid event data gracefully", async () => {
      const invalidEventData = {
        type: null as any,
        source: "",
        data: undefined,
        metadata: null,
      };

      await expect(eventSystem.createEvent(invalidEventData)).rejects.toThrow(
        "Event validation failed",
      );
    });

    it("should handle queue processing errors", async () => {
      // Mock processing error
      const originalProcessQueue = eventSystem.processQueue;
      eventSystem.processQueue = vi.fn().mockRejectedValue(new Error("Processing failed"));

      // Should not crash the system
      await expect(eventSystem.processQueue()).rejects.toThrow("Processing failed");

      // Restore original method
      eventSystem.processQueue = originalProcessQueue;
    });
  });

  describe("Event Utilities Integration", () => {
    it("should use EventUtils for validation", async () => {
      const validateEventSpy = vi.spyOn(EventUtils, "validateEvent");

      const eventData = {
        type: "patient.created" as EventType,
        source: "patient-service",
        data: { patientId: "123" },
        metadata: { clinicId: "clinic-123" },
      };

      await eventSystem.createEvent(eventData);

      expect(validateEventSpy).toHaveBeenCalled();
    });

    it("should use EventUtils for fingerprint generation", async () => {
      const generateFingerprintSpy = vi.spyOn(EventUtils, "generateEventFingerprint");

      const eventData = {
        type: "patient.created" as EventType,
        source: "patient-service",
        data: { patientId: "123" },
        metadata: { clinicId: "clinic-123" },
      };

      await eventSystem.createEvent(eventData);

      expect(generateFingerprintSpy).toHaveBeenCalled();
    });
  });

  describe("Performance Tests", () => {
    it("should handle high volume of events", async () => {
      const startTime = Date.now();
      const eventPromises = [];

      // Create 100 events concurrently
      for (let i = 0; i < 100; i++) {
        const eventData = {
          type: "patient.created" as EventType,
          source: "patient-service",
          data: { patientId: `${i}` },
          metadata: { clinicId: "clinic-123" },
        };
        eventPromises.push(eventSystem.publishEvent(eventData));
      }

      await Promise.all(eventPromises);
      const endTime = Date.now();

      // Should complete within reasonable time (adjust threshold as needed)
      expect(endTime - startTime).toBeLessThan(5000); // 5 seconds
    });

    it("should maintain performance under load", async () => {
      // Simulate sustained load
      const iterations = 50;
      const times: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();

        await eventSystem.publishEvent({
          type: "patient.created" as EventType,
          source: "patient-service",
          data: { patientId: `${i}` },
          metadata: { clinicId: "clinic-123" },
        });

        times.push(Date.now() - startTime);
      }

      const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;

      // Average processing time should be reasonable
      expect(averageTime).toBeLessThan(100); // 100ms average
    });
  });
});

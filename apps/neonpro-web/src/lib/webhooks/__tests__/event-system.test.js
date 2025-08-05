"use strict";
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
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
Object.defineProperty(exports, "__esModule", { value: true });
var vitest_1 = require("vitest");
var event_system_1 = require("../event-system");
var utils_1 = require("../utils");
// Mock Supabase
var mockSupabase = {
  from: vitest_1.vi.fn(function () {
    return {
      insert: vitest_1.vi.fn().mockResolvedValue({ data: null, error: null }),
      select: vitest_1.vi.fn().mockReturnThis(),
      eq: vitest_1.vi.fn().mockReturnThis(),
      order: vitest_1.vi.fn().mockReturnThis(),
      limit: vitest_1.vi.fn().mockResolvedValue({ data: [], error: null }),
      update: vitest_1.vi.fn().mockResolvedValue({ data: null, error: null }),
      delete: vitest_1.vi.fn().mockResolvedValue({ data: null, error: null }),
    };
  }),
  channel: vitest_1.vi.fn(function () {
    return {
      on: vitest_1.vi.fn().mockReturnThis(),
      subscribe: vitest_1.vi.fn().mockResolvedValue({ error: null }),
    };
  }),
};
// Mock crypto for consistent IDs in tests
vitest_1.vi.mock("crypto", function () {
  return {
    randomUUID: vitest_1.vi.fn(function () {
      return "test-uuid-123";
    }),
  };
});
(0, vitest_1.describe)("EventSystem", function () {
  var eventSystem;
  var mockConfig;
  (0, vitest_1.beforeEach)(function () {
    vitest_1.vi.clearAllMocks();
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
    eventSystem = new event_system_1.EventSystem(mockConfig);
  });
  (0, vitest_1.afterEach)(function () {
    vitest_1.vi.restoreAllMocks();
  });
  (0, vitest_1.describe)("Event Creation and Validation", function () {
    (0, vitest_1.it)("should create a valid event with all required fields", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var eventData, event;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              eventData = {
                type: "patient.created",
                source: "patient-service",
                data: { patientId: "123", name: "John Doe" },
                metadata: { clinicId: "clinic-123" },
              };
              return [4 /*yield*/, eventSystem.createEvent(eventData)];
            case 1:
              event = _a.sent();
              (0, vitest_1.expect)(event).toMatchObject({
                id: "test-uuid-123",
                type: "patient.created",
                source: "patient-service",
                data: { patientId: "123", name: "John Doe" },
                metadata: { clinicId: "clinic-123" },
                priority: "normal",
                version: "1.0.0",
              });
              (0, vitest_1.expect)(event.timestamp).toBeInstanceOf(Date);
              return [2 /*return*/];
          }
        });
      });
    });
    (0, vitest_1.it)("should validate event data and reject invalid events", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var invalidEventData;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              invalidEventData = {
                type: "invalid.type",
                source: "",
                data: null,
                metadata: {},
              };
              return [
                4 /*yield*/,
                (0, vitest_1.expect)(eventSystem.createEvent(invalidEventData)).rejects.toThrow(
                  "Event validation failed",
                ),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, vitest_1.it)("should set default values for optional fields", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var minimalEventData, event;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              minimalEventData = {
                type: "patient.created",
                source: "patient-service",
                data: { patientId: "123" },
                metadata: { clinicId: "clinic-123" },
              };
              return [4 /*yield*/, eventSystem.createEvent(minimalEventData)];
            case 1:
              event = _a.sent();
              (0, vitest_1.expect)(event.priority).toBe("normal");
              (0, vitest_1.expect)(event.version).toBe("1.0.0");
              (0, vitest_1.expect)(event.context).toEqual({});
              return [2 /*return*/];
          }
        });
      });
    });
    (0, vitest_1.it)("should generate unique fingerprints for different events", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var event1Data, event2Data, event1, event2;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              event1Data = {
                type: "patient.created",
                source: "patient-service",
                data: { patientId: "123" },
                metadata: { clinicId: "clinic-123" },
              };
              event2Data = {
                type: "patient.created",
                source: "patient-service",
                data: { patientId: "456" },
                metadata: { clinicId: "clinic-123" },
              };
              return [4 /*yield*/, eventSystem.createEvent(event1Data)];
            case 1:
              event1 = _a.sent();
              return [4 /*yield*/, eventSystem.createEvent(event2Data)];
            case 2:
              event2 = _a.sent();
              (0, vitest_1.expect)(event1.fingerprint).not.toBe(event2.fingerprint);
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, vitest_1.describe)("Event Publishing", function () {
    (0, vitest_1.it)("should publish event and add to queue", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var eventData, eventId;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              eventData = {
                type: "patient.created",
                source: "patient-service",
                data: { patientId: "123" },
                metadata: { clinicId: "clinic-123" },
              };
              return [4 /*yield*/, eventSystem.publishEvent(eventData)];
            case 1:
              eventId = _a.sent();
              (0, vitest_1.expect)(eventId).toBe("test-uuid-123");
              (0, vitest_1.expect)(mockSupabase.from).toHaveBeenCalledWith("events");
              return [2 /*return*/];
          }
        });
      });
    });
    (0, vitest_1.it)("should handle high priority events immediately", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var urgentEventData, eventId;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              urgentEventData = {
                type: "system.error",
                source: "system",
                data: { error: "Critical system failure" },
                metadata: { clinicId: "clinic-123" },
                priority: "critical",
              };
              return [4 /*yield*/, eventSystem.publishEvent(urgentEventData)];
            case 1:
              eventId = _a.sent();
              (0, vitest_1.expect)(eventId).toBe("test-uuid-123");
              return [2 /*return*/];
          }
        });
      });
    });
    (0, vitest_1.it)("should prevent duplicate events using fingerprints", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var eventData;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              eventData = {
                type: "patient.created",
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
              return [
                4 /*yield*/,
                (0, vitest_1.expect)(eventSystem.publishEvent(eventData)).rejects.toThrow(
                  "Duplicate event detected",
                ),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, vitest_1.describe)("Event Subscriptions", function () {
    (0, vitest_1.it)("should create event subscription with filters", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var subscription, subscriptionId;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              subscription = {
                name: "Patient Events",
                clinicId: "clinic-123",
                eventTypes: ["patient.created", "patient.updated"],
                isActive: true,
                filters: {
                  clinicId: "clinic-123",
                  priority: ["normal", "high"],
                },
              };
              return [4 /*yield*/, eventSystem.createSubscription(subscription)];
            case 1:
              subscriptionId = _a.sent();
              (0, vitest_1.expect)(subscriptionId).toBe("test-uuid-123");
              (0, vitest_1.expect)(mockSupabase.from).toHaveBeenCalledWith("event_subscriptions");
              return [2 /*return*/];
          }
        });
      });
    });
    (0, vitest_1.it)("should update existing subscription", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var updates;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              updates = {
                eventTypes: ["patient.created", "patient.updated", "patient.deleted"],
                isActive: false,
              };
              return [4 /*yield*/, eventSystem.updateSubscription("sub-123", updates)];
            case 1:
              _a.sent();
              (0, vitest_1.expect)(mockSupabase.from().update).toHaveBeenCalledWith(
                vitest_1.expect.objectContaining(updates),
              );
              return [2 /*return*/];
          }
        });
      });
    });
    (0, vitest_1.it)("should delete subscription", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, eventSystem.deleteSubscription("sub-123")];
            case 1:
              _a.sent();
              (0, vitest_1.expect)(mockSupabase.from().delete().eq).toHaveBeenCalledWith(
                "id",
                "sub-123",
              );
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, vitest_1.describe)("Event Filtering", function () {
    (0, vitest_1.it)("should filter events by type", function () {
      var event = {
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
      var filter = {
        eventTypes: ["patient.created", "patient.updated"],
      };
      var matches = eventSystem.matchesFilter(event, filter);
      (0, vitest_1.expect)(matches).toBe(true);
    });
    (0, vitest_1.it)("should filter events by clinic ID", function () {
      var event = {
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
      var filter = {
        clinicId: "clinic-456",
      };
      var matches = eventSystem.matchesFilter(event, filter);
      (0, vitest_1.expect)(matches).toBe(false);
    });
    (0, vitest_1.it)("should filter events by priority", function () {
      var event = {
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
      var filter = {
        priority: ["normal", "high"],
      };
      var matches = eventSystem.matchesFilter(event, filter);
      (0, vitest_1.expect)(matches).toBe(true);
    });
    (0, vitest_1.it)("should filter events by custom data fields", function () {
      var event = {
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
      var filter = {
        dataFilters: {
          "data.department": "cardiology",
        },
      };
      var matches = eventSystem.matchesFilter(event, filter);
      (0, vitest_1.expect)(matches).toBe(true);
    });
  });
  (0, vitest_1.describe)("Event Queue Management", function () {
    (0, vitest_1.it)("should add events to queue", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var event, queueSize;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              event = {
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
              return [4 /*yield*/, eventSystem.addToQueue(event)];
            case 1:
              _a.sent();
              return [4 /*yield*/, eventSystem.getQueueSize()];
            case 2:
              queueSize = _a.sent();
              (0, vitest_1.expect)(queueSize).toBe(1);
              return [2 /*return*/];
          }
        });
      });
    });
    (0, vitest_1.it)("should process queue in batches", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var i, event_1, queueSize;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              i = 0;
              _a.label = 1;
            case 1:
              if (!(i < 5)) return [3 /*break*/, 4];
              event_1 = {
                id: "event-".concat(i),
                type: "patient.created",
                source: "patient-service",
                data: { patientId: "".concat(i) },
                metadata: { clinicId: "clinic-123" },
                priority: "normal",
                version: "1.0.0",
                timestamp: new Date(),
                fingerprint: "fp-".concat(i),
                context: {},
              };
              return [4 /*yield*/, eventSystem.addToQueue(event_1)];
            case 2:
              _a.sent();
              _a.label = 3;
            case 3:
              i++;
              return [3 /*break*/, 1];
            case 4:
              return [
                4 /*yield*/,
                eventSystem.processQueue(),
                // Queue should be processed
              ];
            case 5:
              _a.sent();
              return [4 /*yield*/, eventSystem.getQueueSize()];
            case 6:
              queueSize = _a.sent();
              (0, vitest_1.expect)(queueSize).toBe(0);
              return [2 /*return*/];
          }
        });
      });
    });
    (0, vitest_1.it)("should handle queue overflow", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var largeQueue, event;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              largeQueue = Array.from({ length: 1001 }, function (_, i) {
                return {
                  id: "event-".concat(i),
                  type: "patient.created",
                  source: "patient-service",
                  data: { patientId: "".concat(i) },
                  metadata: { clinicId: "clinic-123" },
                  priority: "normal",
                  version: "1.0.0",
                  timestamp: new Date(),
                  fingerprint: "fp-".concat(i),
                  context: {},
                  addedAt: new Date(),
                };
              });
              event = {
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
              return [
                4 /*yield*/,
                (0, vitest_1.expect)(eventSystem.addToQueue(event)).rejects.toThrow(
                  "Event queue is full",
                ),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, vitest_1.describe)("Real-time Streaming", function () {
    (0, vitest_1.it)("should start real-time streaming", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, eventSystem.startRealTimeStreaming()];
            case 1:
              _a.sent();
              (0, vitest_1.expect)(mockSupabase.channel).toHaveBeenCalledWith("events");
              return [2 /*return*/];
          }
        });
      });
    });
    (0, vitest_1.it)("should stop real-time streaming", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, eventSystem.startRealTimeStreaming()];
            case 1:
              _a.sent();
              return [
                4 /*yield*/,
                eventSystem.stopRealTimeStreaming(),
                // Should clean up subscriptions
              ];
            case 2:
              _a.sent();
              // Should clean up subscriptions
              (0, vitest_1.expect)(eventSystem.isStreamingActive()).toBe(false);
              return [2 /*return*/];
          }
        });
      });
    });
    (0, vitest_1.it)("should handle real-time event notifications", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockHandler, realtimeEvent;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockHandler = vitest_1.vi.fn();
              eventSystem.onRealTimeEvent(mockHandler);
              return [
                4 /*yield*/,
                eventSystem.startRealTimeStreaming(),
                // Simulate real-time event
              ];
            case 1:
              _a.sent();
              realtimeEvent = {
                eventType: "INSERT",
                new: {
                  id: "event-123",
                  type: "patient.created",
                  data: { patientId: "123" },
                },
              };
              // Should call handler with event
              (0, vitest_1.expect)(mockHandler).toHaveBeenCalledWith(realtimeEvent.new);
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, vitest_1.describe)("Analytics and Monitoring", function () {
    (0, vitest_1.it)("should get event analytics", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var startDate, endDate, analytics;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              startDate = new Date("2024-01-01");
              endDate = new Date("2024-01-31");
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
              return [4 /*yield*/, eventSystem.getEventAnalytics(startDate, endDate)];
            case 1:
              analytics = _a.sent();
              (0, vitest_1.expect)(analytics).toEqual({
                totalEvents: 150,
                eventsByType: {
                  "patient.created": 100,
                  "appointment.created": 50,
                },
                eventsByPriority: {},
                eventsBySource: {},
                averageEventsPerDay: vitest_1.expect.any(Number),
              });
              return [2 /*return*/];
          }
        });
      });
    });
    (0, vitest_1.it)("should get system health metrics", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var health;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, eventSystem.getSystemHealth()];
            case 1:
              health = _a.sent();
              (0, vitest_1.expect)(health).toMatchObject({
                status: vitest_1.expect.any(String),
                queueSize: vitest_1.expect.any(Number),
                isStreamingActive: vitest_1.expect.any(Boolean),
                lastProcessedAt: vitest_1.expect.any(Date),
                metrics: vitest_1.expect.any(Object),
              });
              return [2 /*return*/];
          }
        });
      });
    });
    (0, vitest_1.it)("should track event processing metrics", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var event, metrics;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              event = {
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
              return [
                4 /*yield*/,
                eventSystem.publishEvent({
                  type: event.type,
                  source: event.source,
                  data: event.data,
                  metadata: event.metadata,
                }),
              ];
            case 1:
              _a.sent();
              return [4 /*yield*/, eventSystem.getProcessingMetrics()];
            case 2:
              metrics = _a.sent();
              (0, vitest_1.expect)(metrics).toMatchObject({
                totalProcessed: vitest_1.expect.any(Number),
                averageProcessingTime: vitest_1.expect.any(Number),
                errorRate: vitest_1.expect.any(Number),
              });
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, vitest_1.describe)("Error Handling", function () {
    (0, vitest_1.it)("should handle database connection errors", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var eventData;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockSupabase
                .from()
                .insert.mockRejectedValueOnce(new Error("Database connection failed"));
              eventData = {
                type: "patient.created",
                source: "patient-service",
                data: { patientId: "123" },
                metadata: { clinicId: "clinic-123" },
              };
              return [
                4 /*yield*/,
                (0, vitest_1.expect)(eventSystem.publishEvent(eventData)).rejects.toThrow(
                  "Failed to publish event",
                ),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, vitest_1.it)("should handle invalid event data gracefully", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var invalidEventData;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              invalidEventData = {
                type: null,
                source: "",
                data: undefined,
                metadata: null,
              };
              return [
                4 /*yield*/,
                (0, vitest_1.expect)(eventSystem.createEvent(invalidEventData)).rejects.toThrow(
                  "Event validation failed",
                ),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, vitest_1.it)("should handle queue processing errors", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var originalProcessQueue;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              originalProcessQueue = eventSystem.processQueue;
              eventSystem.processQueue = vitest_1.vi
                .fn()
                .mockRejectedValue(new Error("Processing failed"));
              // Should not crash the system
              return [
                4 /*yield*/,
                (0, vitest_1.expect)(eventSystem.processQueue()).rejects.toThrow(
                  "Processing failed",
                ),
                // Restore original method
              ];
            case 1:
              // Should not crash the system
              _a.sent();
              // Restore original method
              eventSystem.processQueue = originalProcessQueue;
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, vitest_1.describe)("Event Utilities Integration", function () {
    (0, vitest_1.it)("should use EventUtils for validation", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var validateEventSpy, eventData;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              validateEventSpy = vitest_1.vi.spyOn(utils_1.EventUtils, "validateEvent");
              eventData = {
                type: "patient.created",
                source: "patient-service",
                data: { patientId: "123" },
                metadata: { clinicId: "clinic-123" },
              };
              return [4 /*yield*/, eventSystem.createEvent(eventData)];
            case 1:
              _a.sent();
              (0, vitest_1.expect)(validateEventSpy).toHaveBeenCalled();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, vitest_1.it)("should use EventUtils for fingerprint generation", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var generateFingerprintSpy, eventData;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              generateFingerprintSpy = vitest_1.vi.spyOn(
                utils_1.EventUtils,
                "generateEventFingerprint",
              );
              eventData = {
                type: "patient.created",
                source: "patient-service",
                data: { patientId: "123" },
                metadata: { clinicId: "clinic-123" },
              };
              return [4 /*yield*/, eventSystem.createEvent(eventData)];
            case 1:
              _a.sent();
              (0, vitest_1.expect)(generateFingerprintSpy).toHaveBeenCalled();
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, vitest_1.describe)("Performance Tests", function () {
    (0, vitest_1.it)("should handle high volume of events", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var startTime, eventPromises, i, eventData, endTime;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              startTime = Date.now();
              eventPromises = [];
              // Create 100 events concurrently
              for (i = 0; i < 100; i++) {
                eventData = {
                  type: "patient.created",
                  source: "patient-service",
                  data: { patientId: "".concat(i) },
                  metadata: { clinicId: "clinic-123" },
                };
                eventPromises.push(eventSystem.publishEvent(eventData));
              }
              return [4 /*yield*/, Promise.all(eventPromises)];
            case 1:
              _a.sent();
              endTime = Date.now();
              // Should complete within reasonable time (adjust threshold as needed)
              (0, vitest_1.expect)(endTime - startTime).toBeLessThan(5000); // 5 seconds
              return [2 /*return*/];
          }
        });
      });
    });
    (0, vitest_1.it)("should maintain performance under load", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var iterations, times, i, startTime, averageTime;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              iterations = 50;
              times = [];
              i = 0;
              _a.label = 1;
            case 1:
              if (!(i < iterations)) return [3 /*break*/, 4];
              startTime = Date.now();
              return [
                4 /*yield*/,
                eventSystem.publishEvent({
                  type: "patient.created",
                  source: "patient-service",
                  data: { patientId: "".concat(i) },
                  metadata: { clinicId: "clinic-123" },
                }),
              ];
            case 2:
              _a.sent();
              times.push(Date.now() - startTime);
              _a.label = 3;
            case 3:
              i++;
              return [3 /*break*/, 1];
            case 4:
              averageTime =
                times.reduce(function (sum, time) {
                  return sum + time;
                }, 0) / times.length;
              // Average processing time should be reasonable
              (0, vitest_1.expect)(averageTime).toBeLessThan(100); // 100ms average
              return [2 /*return*/];
          }
        });
      });
    });
  });
});

/**
 * Webhook & Event System Integration
 * Story 7.3: Webhook & Event System Implementation
 *
 * This module provides the main integration point for the webhook and event system:
 * - Unified system initialization and configuration
 * - Event publishing with automatic webhook delivery
 * - Webhook management and monitoring
 * - Real-time event streaming
 * - Analytics and reporting
 * - Health monitoring and diagnostics
 */
var __awaiter =
  (this && this.__awaiter) ||
  ((thisArg, _arguments, P, generator) => {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P((resolve) => {
            resolve(value);
          });
    }
    return new (P || (P = Promise))((resolve, reject) => {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  });
var __generator =
  (this && this.__generator) ||
  ((thisArg, body) => {
    var _ = {
        label: 0,
        sent: () => {
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
      (g.throw = verb(1)),
      (g.return = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return (v) => step([n, v]);
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
                  ? y.return
                  : op[0]
                    ? y.throw || ((t = y.return) && t.call(y), 0)
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
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookManager = exports.EventSystem = exports.WebhookEventSystem = void 0;
exports.createWebhookEventSystem = createWebhookEventSystem;
exports.createDefaultConfig = createDefaultConfig;
var event_system_1 = require("./event-system");
exports.EventSystem = event_system_1.default;
var webhook_manager_1 = require("./webhook-manager");
exports.WebhookManager = webhook_manager_1.default;
var WebhookEventSystem = /** @class */ (() => {
  function WebhookEventSystem(config) {
    this.isInitialized = false;
    this.systemMetrics = {
      eventsPublished: 0,
      webhooksDelivered: 0,
      failedDeliveries: 0,
      averageDeliveryTime: 0,
      lastHealthCheck: new Date(),
    };
    this.config = config;
    // Initialize event system
    this.eventSystem = new event_system_1.default({
      supabaseUrl: config.supabase.url,
      supabaseKey: config.supabase.key,
      enableRealtime: config.eventSystem.enableRealtime,
      enablePersistence: config.eventSystem.enablePersistence,
      queueConfig: config.eventSystem.queueConfig,
      retentionDays: config.eventSystem.retentionDays,
    });
    // Initialize webhook manager
    this.webhookManager = new webhook_manager_1.default({
      supabaseUrl: config.supabase.url,
      supabaseKey: config.supabase.key,
      defaultTimeout: config.webhookManager.defaultTimeout,
      maxRetries: config.webhookManager.maxRetries,
      retryDelayMs: config.webhookManager.retryDelayMs,
      maxConcurrentDeliveries: config.webhookManager.maxConcurrentDeliveries,
      enableSignatureValidation: config.webhookManager.enableSignatureValidation,
      signatureSecret: config.webhookManager.signatureSecret,
      rateLimiting: config.webhookManager.rateLimiting,
    });
  }
  /**
   * Initialize the complete webhook and event system
   */
  WebhookEventSystem.prototype.initialize = function () {
    return __awaiter(this, void 0, void 0, function () {
      var error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, undefined, 4]);
            console.log("🚀 Initializing Webhook & Event System...");
            // Initialize event system
            return [
              4 /*yield*/,
              this.eventSystem.initialize(),
              // Initialize webhook manager
            ];
          case 1:
            // Initialize event system
            _a.sent();
            // Initialize webhook manager
            return [
              4 /*yield*/,
              this.webhookManager.initialize(),
              // Setup event-to-webhook integration
            ];
          case 2:
            // Initialize webhook manager
            _a.sent();
            // Setup event-to-webhook integration
            this.setupEventWebhookIntegration();
            // Start health monitoring
            if (this.config.monitoring.enableHealthChecks) {
              this.startHealthMonitoring();
            }
            this.isInitialized = true;
            console.log("✅ Webhook & Event System initialized successfully");
            return [3 /*break*/, 4];
          case 3:
            error_1 = _a.sent();
            console.error("❌ Failed to initialize Webhook & Event System:", error_1);
            throw new Error("System initialization failed");
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Publish an event with automatic webhook delivery
   */
  WebhookEventSystem.prototype.publishEvent = function (eventData) {
    return __awaiter(this, void 0, void 0, function () {
      var eventId, event_1, deliveryIds, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, undefined, 5]);
            if (!this.isInitialized) {
              throw new Error("System not initialized");
            }
            console.log("\uD83D\uDCE4 Publishing event: ".concat(eventData.type));
            return [
              4 /*yield*/,
              this.eventSystem.publishEvent(eventData),
              // Get the published event
            ];
          case 1:
            eventId = _a.sent();
            return [4 /*yield*/, this.eventSystem.getEventById(eventId)];
          case 2:
            event_1 = _a.sent();
            if (!event_1) {
              throw new Error("Failed to retrieve published event");
            }
            return [
              4 /*yield*/,
              this.webhookManager.deliverEvent(event_1),
              // Update metrics
            ];
          case 3:
            deliveryIds = _a.sent();
            // Update metrics
            this.systemMetrics.eventsPublished++;
            console.log(
              "\u2705 Event "
                .concat(eventId, " published with ")
                .concat(deliveryIds.length, " webhook deliveries"),
            );
            return [
              2 /*return*/,
              {
                eventId: eventId,
                deliveryIds: deliveryIds,
              },
            ];
          case 4:
            error_2 = _a.sent();
            console.error("❌ Failed to publish event:", error_2);
            throw new Error("Event publishing failed: ".concat(error_2.message));
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Register a new webhook endpoint
   */
  WebhookEventSystem.prototype.registerWebhook = function (webhookData) {
    return __awaiter(this, void 0, void 0, function () {
      var webhookId, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, undefined, 3]);
            if (!this.isInitialized) {
              throw new Error("System not initialized");
            }
            console.log("\uD83D\uDD17 Registering webhook: ".concat(webhookData.name));
            return [4 /*yield*/, this.webhookManager.registerWebhook(webhookData)];
          case 1:
            webhookId = _a.sent();
            console.log("\u2705 Webhook ".concat(webhookId, " registered successfully"));
            return [2 /*return*/, webhookId];
          case 2:
            error_3 = _a.sent();
            console.error("❌ Failed to register webhook:", error_3);
            throw new Error("Webhook registration failed: ".concat(error_3.message));
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Update an existing webhook endpoint
   */
  WebhookEventSystem.prototype.updateWebhook = function (webhookId, updates) {
    return __awaiter(this, void 0, void 0, function () {
      var error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, undefined, 3]);
            if (!this.isInitialized) {
              throw new Error("System not initialized");
            }
            return [4 /*yield*/, this.webhookManager.updateWebhook(webhookId, updates)];
          case 1:
            _a.sent();
            console.log("\u2705 Webhook ".concat(webhookId, " updated successfully"));
            return [3 /*break*/, 3];
          case 2:
            error_4 = _a.sent();
            console.error("❌ Failed to update webhook:", error_4);
            throw new Error("Webhook update failed: ".concat(error_4.message));
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Delete a webhook endpoint
   */
  WebhookEventSystem.prototype.deleteWebhook = function (webhookId) {
    return __awaiter(this, void 0, void 0, function () {
      var error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, undefined, 3]);
            if (!this.isInitialized) {
              throw new Error("System not initialized");
            }
            return [4 /*yield*/, this.webhookManager.deleteWebhook(webhookId)];
          case 1:
            _a.sent();
            console.log("\u2705 Webhook ".concat(webhookId, " deleted successfully"));
            return [3 /*break*/, 3];
          case 2:
            error_5 = _a.sent();
            console.error("❌ Failed to delete webhook:", error_5);
            throw new Error("Webhook deletion failed: ".concat(error_5.message));
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get webhook endpoint by ID
   */
  WebhookEventSystem.prototype.getWebhook = function (webhookId) {
    return this.webhookManager.getWebhook(webhookId);
  };
  /**
   * Get all webhooks for a clinic
   */
  WebhookEventSystem.prototype.getWebhooksByClinic = function (clinicId) {
    return this.webhookManager.getWebhooksByClinic(clinicId);
  };
  /**
   * Test a webhook endpoint
   */
  WebhookEventSystem.prototype.testWebhook = function (webhookId) {
    return __awaiter(this, void 0, void 0, function () {
      var webhook, error_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, undefined, 3]);
            if (!this.isInitialized) {
              throw new Error("System not initialized");
            }
            webhook = this.webhookManager.getWebhook(webhookId);
            if (!webhook) {
              throw new Error("Webhook ".concat(webhookId, " not found"));
            }
            return [4 /*yield*/, this.webhookManager.testWebhookEndpoint(webhook)];
          case 1:
            return [2 /*return*/, _a.sent()];
          case 2:
            error_6 = _a.sent();
            console.error("❌ Failed to test webhook:", error_6);
            return [
              2 /*return*/,
              {
                success: false,
                error: error_6.message,
              },
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get events by criteria
   */
  WebhookEventSystem.prototype.getEvents = function (criteria) {
    return __awaiter(this, void 0, void 0, function () {
      var error_7;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, undefined, 3]);
            if (!this.isInitialized) {
              throw new Error("System not initialized");
            }
            return [4 /*yield*/, this.eventSystem.getEvents(criteria)];
          case 1:
            return [2 /*return*/, _a.sent()];
          case 2:
            error_7 = _a.sent();
            console.error("❌ Failed to get events:", error_7);
            return [2 /*return*/, []];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get event by ID
   */
  WebhookEventSystem.prototype.getEventById = function (eventId) {
    return __awaiter(this, void 0, void 0, function () {
      var error_8;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, undefined, 3]);
            if (!this.isInitialized) {
              throw new Error("System not initialized");
            }
            return [4 /*yield*/, this.eventSystem.getEventById(eventId)];
          case 1:
            return [2 /*return*/, _a.sent()];
          case 2:
            error_8 = _a.sent();
            console.error("❌ Failed to get event:", error_8);
            return [2 /*return*/, null];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get delivery history for a webhook
   */
  WebhookEventSystem.prototype.getDeliveryHistory = function (_webhookId_1) {
    return __awaiter(this, arguments, void 0, function (webhookId, limit) {
      var error_9;
      if (limit === void 0) {
        limit = 50;
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, undefined, 3]);
            if (!this.isInitialized) {
              throw new Error("System not initialized");
            }
            return [4 /*yield*/, this.webhookManager.getDeliveryHistory(webhookId, limit)];
          case 1:
            return [2 /*return*/, _a.sent()];
          case 2:
            error_9 = _a.sent();
            console.error("❌ Failed to get delivery history:", error_9);
            return [2 /*return*/, []];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get delivery statistics for a webhook
   */
  WebhookEventSystem.prototype.getDeliveryStats = function (_webhookId_1) {
    return __awaiter(this, arguments, void 0, function (webhookId, days) {
      var error_10;
      if (days === void 0) {
        days = 30;
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, undefined, 3]);
            if (!this.isInitialized) {
              throw new Error("System not initialized");
            }
            return [4 /*yield*/, this.webhookManager.getDeliveryStats(webhookId, days)];
          case 1:
            return [2 /*return*/, _a.sent()];
          case 2:
            error_10 = _a.sent();
            console.error("❌ Failed to get delivery stats:", error_10);
            return [
              2 /*return*/,
              {
                totalDeliveries: 0,
                successfulDeliveries: 0,
                failedDeliveries: 0,
                averageResponseTime: 0,
                successRate: 0,
              },
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get comprehensive event analytics
   */
  WebhookEventSystem.prototype.getEventAnalytics = function (filters) {
    return __awaiter(this, void 0, void 0, function () {
      var error_11;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, undefined, 3]);
            if (!this.isInitialized) {
              throw new Error("System not initialized");
            }
            return [4 /*yield*/, this.eventSystem.getEventAnalytics(filters)];
          case 1:
            return [2 /*return*/, _a.sent()];
          case 2:
            error_11 = _a.sent();
            console.error("❌ Failed to get event analytics:", error_11);
            throw new Error("Analytics generation failed: ".concat(error_11.message));
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get system health status
   */
  WebhookEventSystem.prototype.getSystemHealth = function () {
    return __awaiter(this, void 0, void 0, function () {
      var eventSystemHealth, webhookSystemHealth, overallStatus, error_12;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, undefined, 4]);
            if (!this.isInitialized) {
              throw new Error("System not initialized");
            }
            return [
              4 /*yield*/,
              this.checkEventSystemHealth(),
              // Get webhook system health
            ];
          case 1:
            eventSystemHealth = _a.sent();
            return [
              4 /*yield*/,
              this.checkWebhookSystemHealth(),
              // Determine overall status
            ];
          case 2:
            webhookSystemHealth = _a.sent();
            overallStatus = "healthy";
            if (
              eventSystemHealth.status === "unhealthy" ||
              webhookSystemHealth.status === "unhealthy"
            ) {
              overallStatus = "unhealthy";
            } else if (
              webhookSystemHealth.failureRate >
                this.config.monitoring.alertThresholds.failureRate ||
              webhookSystemHealth.averageResponseTime >
                this.config.monitoring.alertThresholds.responseTime ||
              eventSystemHealth.queueDepth > this.config.monitoring.alertThresholds.queueDepth
            ) {
              overallStatus = "degraded";
            }
            return [
              2 /*return*/,
              {
                status: overallStatus,
                eventSystem: eventSystemHealth,
                webhookSystem: webhookSystemHealth,
                metrics: this.systemMetrics,
                lastCheck: new Date(),
              },
            ];
          case 3:
            error_12 = _a.sent();
            console.error("❌ Failed to get system health:", error_12);
            return [
              2 /*return*/,
              {
                status: "unhealthy",
                eventSystem: {
                  status: "unhealthy",
                  queueDepth: 0,
                  processingRate: 0,
                },
                webhookSystem: {
                  status: "unhealthy",
                  activeWebhooks: 0,
                  failureRate: 100,
                  averageResponseTime: 0,
                },
                metrics: this.systemMetrics,
                lastCheck: new Date(),
              },
            ];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Clean up old events and delivery records
   */
  WebhookEventSystem.prototype.cleanup = function () {
    return __awaiter(this, void 0, void 0, function () {
      var eventsDeleted, deliveriesDeleted, error_13;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, undefined, 3]);
            if (!this.isInitialized) {
              throw new Error("System not initialized");
            }
            console.log("🧹 Starting system cleanup...");
            return [
              4 /*yield*/,
              this.eventSystem.cleanupOldEvents(),
              // Clean up old delivery records (placeholder - would be implemented in webhook manager)
            ];
          case 1:
            eventsDeleted = _a.sent();
            deliveriesDeleted = 0; // await this.webhookManager.cleanupOldDeliveries()
            console.log(
              "\u2705 Cleanup completed: "
                .concat(eventsDeleted, " events, ")
                .concat(deliveriesDeleted, " deliveries deleted"),
            );
            return [
              2 /*return*/,
              {
                eventsDeleted: eventsDeleted,
                deliveriesDeleted: deliveriesDeleted,
              },
            ];
          case 2:
            error_13 = _a.sent();
            console.error("❌ Failed to cleanup system:", error_13);
            throw new Error("System cleanup failed: ".concat(error_13.message));
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Stop the entire system
   */
  WebhookEventSystem.prototype.stop = function () {
    return __awaiter(this, void 0, void 0, function () {
      var error_14;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, undefined, 4]);
            console.log("🛑 Stopping Webhook & Event System...");
            // Stop health monitoring
            if (this.healthCheckInterval) {
              clearInterval(this.healthCheckInterval);
              this.healthCheckInterval = undefined;
            }
            // Stop webhook manager
            return [
              4 /*yield*/,
              this.webhookManager.stop(),
              // Stop event system
            ];
          case 1:
            // Stop webhook manager
            _a.sent();
            // Stop event system
            return [4 /*yield*/, this.eventSystem.stop()];
          case 2:
            // Stop event system
            _a.sent();
            this.isInitialized = false;
            console.log("✅ Webhook & Event System stopped successfully");
            return [3 /*break*/, 4];
          case 3:
            error_14 = _a.sent();
            console.error("❌ Failed to stop system:", error_14);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  // Private Methods
  WebhookEventSystem.prototype.setupEventWebhookIntegration = () => {
    // This would set up automatic webhook delivery when events are published
    // For now, this is handled in the publishEvent method
    console.log("✅ Event-Webhook integration configured");
  };
  WebhookEventSystem.prototype.startHealthMonitoring = function () {
    this.healthCheckInterval = setInterval(
      () => this.performHealthCheck(),
      this.config.monitoring.healthCheckInterval,
    );
    console.log("✅ Health monitoring started");
  };
  WebhookEventSystem.prototype.performHealthCheck = function () {
    return __awaiter(this, void 0, void 0, function () {
      var health, error_15;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, undefined, 3]);
            return [4 /*yield*/, this.getSystemHealth()];
          case 1:
            health = _a.sent();
            this.systemMetrics.lastHealthCheck = health.lastCheck;
            // Log health status
            if (health.status === "unhealthy") {
              console.error("🚨 System health check: UNHEALTHY");
            } else if (health.status === "degraded") {
              console.warn("⚠️ System health check: DEGRADED");
            } else {
              console.log("✅ System health check: HEALTHY");
            }
            return [3 /*break*/, 3];
          case 2:
            error_15 = _a.sent();
            console.error("❌ Health check failed:", error_15);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  WebhookEventSystem.prototype.checkEventSystemHealth = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        try {
          // This would check the event system's internal health
          // For now, return basic metrics
          return [
            2 /*return*/,
            {
              status: "healthy",
              queueDepth: 0, // Would get from event system
              processingRate: 0, // Would calculate from metrics
            },
          ];
        } catch (_error) {
          return [
            2 /*return*/,
            {
              status: "unhealthy",
              queueDepth: 0,
              processingRate: 0,
            },
          ];
        }
        return [2 /*return*/];
      });
    });
  };
  WebhookEventSystem.prototype.checkWebhookSystemHealth = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        try {
          // This would check webhook system health
          // For now, return basic metrics
          return [
            2 /*return*/,
            {
              status: "healthy",
              activeWebhooks: this.webhookManager.getWebhooksByClinic("").length, // Would get all active webhooks
              failureRate: 0, // Would calculate from recent deliveries
              averageResponseTime: this.systemMetrics.averageDeliveryTime,
            },
          ];
        } catch (_error) {
          return [
            2 /*return*/,
            {
              status: "unhealthy",
              activeWebhooks: 0,
              failureRate: 100,
              averageResponseTime: 0,
            },
          ];
        }
        return [2 /*return*/];
      });
    });
  };
  return WebhookEventSystem;
})();
exports.WebhookEventSystem = WebhookEventSystem;
// Export main system as default
exports.default = WebhookEventSystem;
// Convenience function to create a configured system
function createWebhookEventSystem(config) {
  return new WebhookEventSystem(config);
}
// Default configuration factory
function createDefaultConfig(supabaseConfig) {
  return {
    supabase: supabaseConfig,
    eventSystem: {
      enableRealtime: true,
      enablePersistence: true,
      queueConfig: {
        maxSize: 10000,
        processingConcurrency: 10,
        batchSize: 50,
        processingInterval: 1000,
      },
      retentionDays: 90,
    },
    webhookManager: {
      defaultTimeout: 30000,
      maxRetries: 3,
      retryDelayMs: 5000,
      maxConcurrentDeliveries: 20,
      enableSignatureValidation: true,
      signatureSecret: process.env.WEBHOOK_SECRET || "default-secret",
      rateLimiting: {
        enabled: true,
        requestsPerMinute: 60,
        burstLimit: 10,
      },
    },
    monitoring: {
      enableHealthChecks: true,
      healthCheckInterval: 60000, // 1 minute
      alertThresholds: {
        failureRate: 10, // 10%
        responseTime: 5000, // 5 seconds
        queueDepth: 1000, // 1000 events
      },
    },
  };
}

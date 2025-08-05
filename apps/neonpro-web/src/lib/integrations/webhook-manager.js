/**
 * NeonPro - Webhook Manager
 * Webhook management system for third-party integrations
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 * @created 2025-01-27
 */
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      ((t) => {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.hasOwn(s, p)) t[p] = s[p];
        }
        return t;
      });
    return __assign.apply(this, arguments);
  };
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
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
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
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookSignatureUtils = exports.NeonProWebhookManager = void 0;
var crypto_1 = require("crypto");
var supabase_js_1 = require("@supabase/supabase-js");
/**
 * Webhook Manager Implementation
 * Handles webhook registration, processing, and retry logic
 */
var NeonProWebhookManager = /** @class */ (() => {
  function NeonProWebhookManager(supabaseUrl, supabaseKey, queue) {
    this.webhooks = new Map();
    this.retryJobs = new Map();
    this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
    this.queue = queue;
    this.loadWebhooks();
  }
  /**
   * Register a new webhook
   */
  NeonProWebhookManager.prototype.registerWebhook = function (config) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_1;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            // Validate webhook configuration
            this.validateWebhookConfig(config);
            return [
              4 /*yield*/,
              this.supabase
                .from("integration_webhooks")
                .insert({
                  id: config.id,
                  url: config.url,
                  events: config.events,
                  secret: config.secret ? this.hashSecret(config.secret) : null,
                  active: config.active,
                  retry_policy: config.retryPolicy,
                  filters: config.filters,
                  created_at: new Date(),
                  updated_at: new Date(),
                })
                .select()
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Failed to register webhook: ".concat(error.message));
            }
            // Cache the webhook
            this.webhooks.set(config.id, config);
            // Log registration
            return [
              4 /*yield*/,
              this.logWebhookEvent(config.id, "webhook_registered", {
                url: config.url,
                events: config.events,
              }),
            ];
          case 2:
            // Log registration
            _b.sent();
            return [2 /*return*/, config.id];
          case 3:
            error_1 = _b.sent();
            console.error("Failed to register webhook:", error_1);
            throw error_1;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Update an existing webhook
   */
  NeonProWebhookManager.prototype.updateWebhook = function (id, updates) {
    return __awaiter(this, void 0, void 0, function () {
      var existing, updated, updateData, error, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [4 /*yield*/, this.getWebhook(id)];
          case 1:
            existing = _a.sent();
            if (!existing) {
              throw new Error("Webhook not found: ".concat(id));
            }
            updated = __assign(__assign({}, existing), updates);
            this.validateWebhookConfig(updated);
            updateData = {
              updated_at: new Date(),
            };
            if (updates.url) updateData.url = updates.url;
            if (updates.events) updateData.events = updates.events;
            if (updates.secret) updateData.secret = this.hashSecret(updates.secret);
            if (updates.active !== undefined) updateData.active = updates.active;
            if (updates.retryPolicy) updateData.retry_policy = updates.retryPolicy;
            if (updates.filters) updateData.filters = updates.filters;
            return [
              4 /*yield*/,
              this.supabase.from("integration_webhooks").update(updateData).eq("id", id),
            ];
          case 2:
            error = _a.sent().error;
            if (error) {
              throw new Error("Failed to update webhook: ".concat(error.message));
            }
            // Update cache
            this.webhooks.set(id, updated);
            // Log update
            return [4 /*yield*/, this.logWebhookEvent(id, "webhook_updated", updates)];
          case 3:
            // Log update
            _a.sent();
            return [3 /*break*/, 5];
          case 4:
            error_2 = _a.sent();
            console.error("Failed to update webhook:", error_2);
            throw error_2;
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Delete a webhook
   */
  NeonProWebhookManager.prototype.deleteWebhook = function (id) {
    return __awaiter(this, void 0, void 0, function () {
      var webhook, error, retryJob, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [4 /*yield*/, this.getWebhook(id)];
          case 1:
            webhook = _a.sent();
            if (!webhook) {
              throw new Error("Webhook not found: ".concat(id));
            }
            return [4 /*yield*/, this.supabase.from("integration_webhooks").delete().eq("id", id)];
          case 2:
            error = _a.sent().error;
            if (error) {
              throw new Error("Failed to delete webhook: ".concat(error.message));
            }
            // Remove from cache
            this.webhooks.delete(id);
            retryJob = this.retryJobs.get(id);
            if (retryJob) {
              clearTimeout(retryJob);
              this.retryJobs.delete(id);
            }
            // Log deletion
            return [
              4 /*yield*/,
              this.logWebhookEvent(id, "webhook_deleted", {
                url: webhook.url,
              }),
            ];
          case 3:
            // Log deletion
            _a.sent();
            return [3 /*break*/, 5];
          case 4:
            error_3 = _a.sent();
            console.error("Failed to delete webhook:", error_3);
            throw error_3;
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Process incoming webhook
   */
  NeonProWebhookManager.prototype.processWebhook = function (id, payload, headers) {
    return __awaiter(this, void 0, void 0, function () {
      var webhook, signature, eventType, job, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 8, , 10]);
            return [4 /*yield*/, this.getWebhook(id)];
          case 1:
            webhook = _a.sent();
            if (!webhook) {
              throw new Error("Webhook not found: ".concat(id));
            }
            if (!webhook.active) {
              throw new Error("Webhook is inactive: ".concat(id));
            }
            // Validate signature if secret is configured
            if (webhook.secret) {
              signature = headers["x-webhook-signature"] || headers["x-hub-signature-256"];
              if (!signature || !this.validateSignature(payload, signature, webhook.secret)) {
                throw new Error("Invalid webhook signature");
              }
            }
            if (!(webhook.filters && !this.applyFilters(payload, webhook.filters)))
              return [3 /*break*/, 3];
            return [
              4 /*yield*/,
              this.logWebhookEvent(id, "webhook_filtered", {
                reason: "Payload did not match filters",
              }),
            ];
          case 2:
            _a.sent();
            return [2 /*return*/];
          case 3:
            eventType = this.extractEventType(payload, headers);
            if (!(!webhook.events.includes(eventType) && !webhook.events.includes("*")))
              return [3 /*break*/, 5];
            return [
              4 /*yield*/,
              this.logWebhookEvent(id, "webhook_ignored", {
                eventType: eventType,
                reason: "Event type not subscribed",
              }),
            ];
          case 4:
            _a.sent();
            return [2 /*return*/];
          case 5:
            job = {
              id: crypto_1.default.randomUUID(),
              type: "webhook",
              integrationId: id,
              payload: {
                webhookId: id,
                eventType: eventType,
                payload: payload,
                headers: headers,
                timestamp: new Date(),
              },
              priority: 2,
              attempts: 0,
              maxAttempts: webhook.retryPolicy.maxRetries + 1,
              delay: 0,
              status: "pending",
              createdAt: new Date(),
            };
            return [4 /*yield*/, this.queue.enqueue(job)];
          case 6:
            _a.sent();
            // Log successful processing
            return [
              4 /*yield*/,
              this.logWebhookEvent(id, "webhook_processed", {
                eventType: eventType,
                jobId: job.id,
              }),
            ];
          case 7:
            // Log successful processing
            _a.sent();
            return [3 /*break*/, 10];
          case 8:
            error_4 = _a.sent();
            console.error("Failed to process webhook:", error_4);
            // Log error
            return [
              4 /*yield*/,
              this.logWebhookEvent(id, "webhook_error", {
                error: error_4.message,
                payload: typeof payload === "object" ? JSON.stringify(payload) : payload,
              }),
            ];
          case 9:
            // Log error
            _a.sent();
            throw error_4;
          case 10:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Validate webhook signature
   */
  NeonProWebhookManager.prototype.validateSignature = function (payload, signature, secret) {
    try {
      var payloadString = typeof payload === "string" ? payload : JSON.stringify(payload);
      var expectedSignature = this.generateSignature(payloadString, secret);
      // Support different signature formats
      var cleanSignature = signature.replace(/^(sha256=|sha1=)/, "");
      var cleanExpected = expectedSignature.replace(/^(sha256=|sha1=)/, "");
      return crypto_1.default.timingSafeEqual(
        Buffer.from(cleanSignature, "hex"),
        Buffer.from(cleanExpected, "hex"),
      );
    } catch (error) {
      console.error("Signature validation error:", error);
      return false;
    }
  };
  /**
   * Retry failed webhook
   */
  NeonProWebhookManager.prototype.retryFailedWebhook = function (id) {
    return __awaiter(this, void 0, void 0, function () {
      var webhook, _a, failedDeliveries, error, _i, _b, delivery, error_5;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 8, , 9]);
            return [4 /*yield*/, this.getWebhook(id)];
          case 1:
            webhook = _c.sent();
            if (!webhook) {
              throw new Error("Webhook not found: ".concat(id));
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("webhook_deliveries")
                .select("*")
                .eq("webhook_id", id)
                .eq("status", "failed")
                .lt("attempts", webhook.retryPolicy.maxRetries)
                .order("created_at", { ascending: true })
                .limit(10),
            ];
          case 2:
            (_a = _c.sent()), (failedDeliveries = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Failed to get failed deliveries: ".concat(error.message));
            }
            (_i = 0), (_b = failedDeliveries || []);
            _c.label = 3;
          case 3:
            if (!(_i < _b.length)) return [3 /*break*/, 6];
            delivery = _b[_i];
            return [4 /*yield*/, this.scheduleRetry(delivery, webhook.retryPolicy)];
          case 4:
            _c.sent();
            _c.label = 5;
          case 5:
            _i++;
            return [3 /*break*/, 3];
          case 6:
            return [
              4 /*yield*/,
              this.logWebhookEvent(id, "webhook_retry_scheduled", {
                count:
                  (failedDeliveries === null || failedDeliveries === void 0
                    ? void 0
                    : failedDeliveries.length) || 0,
              }),
            ];
          case 7:
            _c.sent();
            return [3 /*break*/, 9];
          case 8:
            error_5 = _c.sent();
            console.error("Failed to retry webhook:", error_5);
            throw error_5;
          case 9:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get webhook logs
   */
  NeonProWebhookManager.prototype.getWebhookLogs = function (id) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_6;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("integration_logs")
                .select("*")
                .eq("integration_id", id)
                .like("message", "%webhook%")
                .order("timestamp", { ascending: false })
                .limit(100),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Failed to get webhook logs: ".concat(error.message));
            }
            return [2 /*return*/, data || []];
          case 2:
            error_6 = _b.sent();
            console.error("Failed to get webhook logs:", error_6);
            return [2 /*return*/, []];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // Private helper methods
  /**
   * Load webhooks from database
   */
  NeonProWebhookManager.prototype.loadWebhooks = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, _i, _b, item, webhook, error_7;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase.from("integration_webhooks").select("*").eq("active", true),
            ];
          case 1:
            (_a = _c.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              console.error("Failed to load webhooks:", error);
              return [2 /*return*/];
            }
            for (_i = 0, _b = data || []; _i < _b.length; _i++) {
              item = _b[_i];
              webhook = {
                id: item.id,
                url: item.url,
                events: item.events,
                secret: item.secret,
                active: item.active,
                retryPolicy: item.retry_policy,
                filters: item.filters,
              };
              this.webhooks.set(item.id, webhook);
            }
            return [3 /*break*/, 3];
          case 2:
            error_7 = _c.sent();
            console.error("Failed to load webhooks:", error_7);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get webhook by ID
   */
  NeonProWebhookManager.prototype.getWebhook = function (id) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, webhook, error_8;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            // Check cache first
            if (this.webhooks.has(id)) {
              return [2 /*return*/, this.webhooks.get(id)];
            }
            _b.label = 1;
          case 1:
            _b.trys.push([1, 3, , 4]);
            return [
              4 /*yield*/,
              this.supabase.from("integration_webhooks").select("*").eq("id", id).single(),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error || !data) {
              return [2 /*return*/, null];
            }
            webhook = {
              id: data.id,
              url: data.url,
              events: data.events,
              secret: data.secret,
              active: data.active,
              retryPolicy: data.retry_policy,
              filters: data.filters,
            };
            this.webhooks.set(id, webhook);
            return [2 /*return*/, webhook];
          case 3:
            error_8 = _b.sent();
            console.error("Failed to get webhook:", error_8);
            return [2 /*return*/, null];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Validate webhook configuration
   */
  NeonProWebhookManager.prototype.validateWebhookConfig = (config) => {
    if (!config.id) {
      throw new Error("Webhook ID is required");
    }
    if (!config.url) {
      throw new Error("Webhook URL is required");
    }
    try {
      new URL(config.url);
    } catch (_a) {
      throw new Error("Invalid webhook URL");
    }
    if (!config.events || config.events.length === 0) {
      throw new Error("At least one event must be specified");
    }
    if (!config.retryPolicy) {
      throw new Error("Retry policy is required");
    }
    if (config.retryPolicy.maxRetries < 0 || config.retryPolicy.maxRetries > 10) {
      throw new Error("Max retries must be between 0 and 10");
    }
  };
  /**
   * Hash webhook secret
   */
  NeonProWebhookManager.prototype.hashSecret = (secret) =>
    crypto_1.default.createHash("sha256").update(secret).digest("hex");
  /**
   * Generate webhook signature
   */
  NeonProWebhookManager.prototype.generateSignature = (payload, secret) =>
    "sha256=" + crypto_1.default.createHmac("sha256", secret).update(payload).digest("hex");
  /**
   * Extract event type from payload
   */
  NeonProWebhookManager.prototype.extractEventType = (payload, headers) => {
    // Try common event type fields
    if (payload.event_type) return payload.event_type;
    if (payload.type) return payload.type;
    if (payload.action) return payload.action;
    if (headers["x-event-type"]) return headers["x-event-type"];
    if (headers["x-github-event"]) return headers["x-github-event"];
    return "unknown";
  };
  /**
   * Apply filters to payload
   */
  NeonProWebhookManager.prototype.applyFilters = function (payload, filters) {
    for (var _i = 0, _a = Object.entries(filters); _i < _a.length; _i++) {
      var _b = _a[_i],
        key = _b[0],
        expectedValue = _b[1];
      var actualValue = this.getNestedValue(payload, key);
      if (Array.isArray(expectedValue)) {
        if (!expectedValue.includes(actualValue)) {
          return false;
        }
      } else if (actualValue !== expectedValue) {
        return false;
      }
    }
    return true;
  };
  /**
   * Get nested value from object using dot notation
   */
  NeonProWebhookManager.prototype.getNestedValue = (obj, path) =>
    path
      .split(".")
      .reduce(
        (current, key) => (current && current[key] !== undefined ? current[key] : undefined),
        obj,
      );
  /**
   * Schedule webhook retry
   */
  NeonProWebhookManager.prototype.scheduleRetry = function (delivery, retryPolicy) {
    return __awaiter(this, void 0, void 0, function () {
      var delay, timeoutId;
      var _this = this;
      return __generator(this, function (_a) {
        delay = this.calculateRetryDelay(delivery.attempts, retryPolicy);
        timeoutId = setTimeout(
          () =>
            __awaiter(_this, void 0, void 0, function () {
              var job, error_9;
              return __generator(this, function (_a) {
                switch (_a.label) {
                  case 0:
                    _a.trys.push([0, 2, , 3]);
                    job = {
                      id: crypto_1.default.randomUUID(),
                      type: "webhook",
                      integrationId: delivery.webhook_id,
                      payload: {
                        webhookId: delivery.webhook_id,
                        eventType: delivery.event_type,
                        payload: delivery.payload,
                        headers: delivery.headers,
                        timestamp: new Date(),
                        isRetry: true,
                        originalDeliveryId: delivery.id,
                      },
                      priority: 1,
                      attempts: delivery.attempts,
                      maxAttempts: retryPolicy.maxRetries + 1,
                      delay: 0,
                      status: "pending",
                      createdAt: new Date(),
                    };
                    return [4 /*yield*/, this.queue.enqueue(job)];
                  case 1:
                    _a.sent();
                    // Remove from retry jobs map
                    this.retryJobs.delete(delivery.id);
                    return [3 /*break*/, 3];
                  case 2:
                    error_9 = _a.sent();
                    console.error("Failed to schedule retry:", error_9);
                    return [3 /*break*/, 3];
                  case 3:
                    return [2 /*return*/];
                }
              });
            }),
          delay,
        );
        this.retryJobs.set(delivery.id, timeoutId);
        return [2 /*return*/];
      });
    });
  };
  /**
   * Calculate retry delay based on strategy
   */
  NeonProWebhookManager.prototype.calculateRetryDelay = (attempts, retryPolicy) => {
    var delay = retryPolicy.initialDelay;
    switch (retryPolicy.backoffStrategy) {
      case "exponential":
        delay = retryPolicy.initialDelay * 2 ** attempts;
        break;
      case "linear":
        delay = retryPolicy.initialDelay * (attempts + 1);
        break;
      case "fixed":
      default:
        delay = retryPolicy.initialDelay;
        break;
    }
    return Math.min(delay, retryPolicy.maxDelay);
  };
  /**
   * Log webhook event
   */
  NeonProWebhookManager.prototype.logWebhookEvent = function (webhookId, eventType, metadata) {
    return __awaiter(this, void 0, void 0, function () {
      var log, error_10;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            log = {
              id: crypto_1.default.randomUUID(),
              integrationId: webhookId,
              level: "info",
              message: "Webhook ".concat(eventType),
              metadata: metadata,
              timestamp: new Date(),
              clinicId: "system",
            };
            return [4 /*yield*/, this.supabase.from("integration_logs").insert(log)];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_10 = _a.sent();
            console.error("Failed to log webhook event:", error_10);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Cleanup resources
   */
  NeonProWebhookManager.prototype.destroy = function () {
    // Cancel all pending retry jobs
    for (var _i = 0, _a = this.retryJobs; _i < _a.length; _i++) {
      var _b = _a[_i],
        id = _b[0],
        timeoutId = _b[1];
      clearTimeout(timeoutId);
    }
    this.retryJobs.clear();
    this.webhooks.clear();
  };
  return NeonProWebhookManager;
})();
exports.NeonProWebhookManager = NeonProWebhookManager;
/**
 * Webhook signature utilities
 */
var WebhookSignatureUtils = /** @class */ (() => {
  function WebhookSignatureUtils() {}
  /**
   * Generate HMAC signature for webhook payload
   */
  WebhookSignatureUtils.generateSignature = (payload, secret, algorithm) => {
    if (algorithm === void 0) {
      algorithm = "sha256";
    }
    return crypto_1.default.createHmac(algorithm, secret).update(payload).digest("hex");
  };
  /**
   * Verify webhook signature
   */
  WebhookSignatureUtils.verifySignature = function (payload, signature, secret, algorithm) {
    if (algorithm === void 0) {
      algorithm = "sha256";
    }
    try {
      var expectedSignature = this.generateSignature(payload, secret, algorithm);
      var cleanSignature = signature.replace(/^(sha256=|sha1=)/, "");
      return crypto_1.default.timingSafeEqual(
        Buffer.from(cleanSignature, "hex"),
        Buffer.from(expectedSignature, "hex"),
      );
    } catch (error) {
      return false;
    }
  };
  /**
   * Generate webhook secret
   */
  WebhookSignatureUtils.generateSecret = (length) => {
    if (length === void 0) {
      length = 32;
    }
    return crypto_1.default.randomBytes(length).toString("hex");
  };
  return WebhookSignatureUtils;
})();
exports.WebhookSignatureUtils = WebhookSignatureUtils;

"use strict";
/**
 * Notification Service - Security Alerts and User Notifications
 *
 * Comprehensive notification system for security events, session alerts,
 * and user communications in the NeonPro session management system.
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 * @created 2024
 */
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
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
exports.NotificationService = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var utils_1 = require("./utils");
/**
 * Notification Service Class
 *
 * Core notification operations:
 * - Security alert notifications
 * - Session timeout warnings
 * - Device trust notifications
 * - Multi-channel delivery (email, SMS, push, in-app)
 * - Template management and personalization
 * - Delivery tracking and retry logic
 */
var NotificationService = /** @class */ (function () {
  function NotificationService(config) {
    this.templates = new Map();
    this.deliveryQueue = [];
    this.isProcessingQueue = false;
    this.config = config;
    this.supabase = (0, supabase_js_1.createClient)(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
    );
    this.initializeTemplates();
    this.startQueueProcessor();
  }
  /**
   * Send a notification
   */
  NotificationService.prototype.sendNotification = function (
    userId_1,
    type_1,
    priority_1,
    channels_1,
  ) {
    return __awaiter(
      this,
      arguments,
      void 0,
      function (userId, type, priority, channels, data, templateId) {
        var userPreferences_1, allowedChannels, notificationId, notification, dbError, error_1;
        if (data === void 0) {
          data = {};
        }
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 5, , 6]);
              // Validate input
              if (!(0, utils_1.validateUUID)(userId)) {
                return [
                  2 /*return*/,
                  {
                    success: false,
                    error: {
                      code: "INVALID_USER_ID",
                      message: "Invalid user ID format",
                    },
                    timestamp: new Date().toISOString(),
                  },
                ];
              }
              return [4 /*yield*/, this.getUserNotificationPreferences(userId)];
            case 1:
              userPreferences_1 = _a.sent();
              allowedChannels = channels.filter(function (channel) {
                return userPreferences_1.enabledChannels.includes(channel);
              });
              if (allowedChannels.length === 0) {
                return [
                  2 /*return*/,
                  {
                    success: false,
                    error: {
                      code: "NO_ENABLED_CHANNELS",
                      message: "No notification channels enabled for user",
                    },
                    timestamp: new Date().toISOString(),
                  },
                ];
              }
              notificationId = crypto.randomUUID();
              notification = {
                id: notificationId,
                userId: userId,
                type: type,
                priority: priority,
                channels: allowedChannels,
                data: data,
                templateId: templateId,
                status: "pending",
                attempts: 0,
                maxAttempts: this.config.maxRetryAttempts,
                createdAt: new Date().toISOString(),
                scheduledAt: new Date().toISOString(),
              };
              return [
                4 /*yield*/,
                this.supabase.from("notifications").insert({
                  id: notificationId,
                  user_id: userId,
                  type: type,
                  priority: priority,
                  channels: JSON.stringify(allowedChannels),
                  data: JSON.stringify(data),
                  template_id: templateId,
                  status: "pending",
                  attempts: 0,
                  max_attempts: this.config.maxRetryAttempts,
                  created_at: notification.createdAt,
                  scheduled_at: notification.scheduledAt,
                }),
              ];
            case 2:
              dbError = _a.sent().error;
              if (dbError) {
                return [
                  2 /*return*/,
                  {
                    success: false,
                    error: {
                      code: "NOTIFICATION_STORE_FAILED",
                      message: "Failed to store notification",
                      details: { error: dbError.message },
                    },
                    timestamp: new Date().toISOString(),
                  },
                ];
              }
              // Add to delivery queue
              this.deliveryQueue.push(notification);
              if (!(priority === "critical" || priority === "high")) return [3 /*break*/, 4];
              return [4 /*yield*/, this.processNotification(notification)];
            case 3:
              _a.sent();
              _a.label = 4;
            case 4:
              return [
                2 /*return*/,
                {
                  success: true,
                  data: notification,
                  timestamp: new Date().toISOString(),
                },
              ];
            case 5:
              error_1 = _a.sent();
              return [
                2 /*return*/,
                {
                  success: false,
                  error: {
                    code: "NOTIFICATION_SEND_ERROR",
                    message: "Error sending notification",
                    details: {
                      error: error_1 instanceof Error ? error_1.message : "Unknown error",
                    },
                  },
                  timestamp: new Date().toISOString(),
                },
              ];
            case 6:
              return [2 /*return*/];
          }
        });
      },
    );
  };
  /**
   * Send session timeout warning
   */
  NotificationService.prototype.sendSessionTimeoutWarning = function (
    userId,
    sessionId,
    timeoutMinutes,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [
          2 /*return*/,
          this.sendNotification(
            userId,
            "session_timeout_warning",
            "medium",
            ["in_app", "push"],
            {
              sessionId: sessionId,
              timeoutMinutes: timeoutMinutes,
              message: "Your session will expire in ".concat(
                timeoutMinutes,
                " minutes. Click to extend.",
              ),
            },
            "session_timeout_warning",
          ),
        ];
      });
    });
  };
  /**
   * Send security alert
   */
  NotificationService.prototype.sendSecurityAlert = function (
    userId,
    alertType,
    severity,
    details,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var priorityMap, channelMap;
      return __generator(this, function (_a) {
        priorityMap = {
          low: "low",
          medium: "medium",
          high: "high",
          critical: "critical",
        };
        channelMap = {
          low: ["in_app"],
          medium: ["in_app", "email"],
          high: ["in_app", "email", "push"],
          critical: ["in_app", "email", "push", "sms"],
        };
        return [
          2 /*return*/,
          this.sendNotification(
            userId,
            "security_alert",
            priorityMap[severity],
            channelMap[severity],
            __assign({ alertType: alertType, severity: severity }, details),
            "security_alert",
          ),
        ];
      });
    });
  };
  /**
   * Send device trust notification
   */
  NotificationService.prototype.sendDeviceTrustNotification = function (
    userId,
    deviceId,
    action,
    deviceInfo,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [
          2 /*return*/,
          this.sendNotification(
            userId,
            "device_trust",
            "medium",
            ["in_app", "email"],
            {
              deviceId: deviceId,
              action: action,
              deviceInfo: deviceInfo,
            },
            "device_trust",
          ),
        ];
      });
    });
  };
  /**
   * Send login notification
   */
  NotificationService.prototype.sendLoginNotification = function (userId, deviceInfo, location) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [
          2 /*return*/,
          this.sendNotification(
            userId,
            "login_notification",
            "low",
            ["in_app", "email"],
            {
              deviceInfo: deviceInfo,
              location: location,
              timestamp: new Date().toISOString(),
            },
            "login_notification",
          ),
        ];
      });
    });
  };
  /**
   * Get user notification preferences
   */
  NotificationService.prototype.getUserNotificationPreferences = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_2;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("user_notification_preferences")
                .select("*")
                .eq("user_id", userId)
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error || !data) {
              // Return default preferences
              return [
                2 /*return*/,
                {
                  enabledChannels: ["in_app", "email"],
                  preferences: {
                    securityAlerts: true,
                    sessionWarnings: true,
                    deviceNotifications: true,
                    loginNotifications: false,
                  },
                },
              ];
            }
            return [
              2 /*return*/,
              {
                enabledChannels: JSON.parse(data.enabled_channels || "[]"),
                preferences: JSON.parse(data.preferences || "{}"),
              },
            ];
          case 2:
            error_2 = _b.sent();
            console.error("Error getting user notification preferences:", error_2);
            return [
              2 /*return*/,
              {
                enabledChannels: ["in_app", "email"],
                preferences: {},
              },
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Update user notification preferences
   */
  NotificationService.prototype.updateUserNotificationPreferences = function (
    userId,
    enabledChannels,
    preferences,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var error, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            if (!(0, utils_1.validateUUID)(userId)) {
              return [
                2 /*return*/,
                {
                  success: false,
                  error: {
                    code: "INVALID_USER_ID",
                    message: "Invalid user ID format",
                  },
                  timestamp: new Date().toISOString(),
                },
              ];
            }
            return [
              4 /*yield*/,
              this.supabase.from("user_notification_preferences").upsert({
                user_id: userId,
                enabled_channels: JSON.stringify(enabledChannels),
                preferences: JSON.stringify(preferences),
                updated_at: new Date().toISOString(),
              }),
            ];
          case 1:
            error = _a.sent().error;
            if (error) {
              return [
                2 /*return*/,
                {
                  success: false,
                  error: {
                    code: "PREFERENCES_UPDATE_FAILED",
                    message: "Failed to update notification preferences",
                  },
                  timestamp: new Date().toISOString(),
                },
              ];
            }
            return [
              2 /*return*/,
              {
                success: true,
                data: {
                  userId: userId,
                  enabledChannels: enabledChannels,
                  preferences: preferences,
                  updatedAt: new Date().toISOString(),
                },
                timestamp: new Date().toISOString(),
              },
            ];
          case 2:
            error_3 = _a.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error: {
                  code: "PREFERENCES_UPDATE_ERROR",
                  message: "Error updating notification preferences",
                  details: { error: error_3 instanceof Error ? error_3.message : "Unknown error" },
                },
                timestamp: new Date().toISOString(),
              },
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get notification history
   */
  NotificationService.prototype.getNotificationHistory = function (userId_1) {
    return __awaiter(this, arguments, void 0, function (userId, limit, offset) {
      var _a, data, error, notifications, error_4;
      var _this = this;
      if (limit === void 0) {
        limit = 50;
      }
      if (offset === void 0) {
        offset = 0;
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            if (!(0, utils_1.validateUUID)(userId)) {
              return [
                2 /*return*/,
                {
                  success: false,
                  error: {
                    code: "INVALID_USER_ID",
                    message: "Invalid user ID format",
                  },
                  timestamp: new Date().toISOString(),
                },
              ];
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("notifications")
                .select("*")
                .eq("user_id", userId)
                .order("created_at", { ascending: false })
                .range(offset, offset + limit - 1),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              return [
                2 /*return*/,
                {
                  success: false,
                  error: {
                    code: "NOTIFICATION_HISTORY_FAILED",
                    message: "Failed to retrieve notification history",
                  },
                  timestamp: new Date().toISOString(),
                },
              ];
            }
            notifications = (data || []).map(function (row) {
              return _this.convertToNotificationData(row);
            });
            return [
              2 /*return*/,
              {
                success: true,
                data: notifications,
                timestamp: new Date().toISOString(),
              },
            ];
          case 2:
            error_4 = _b.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error: {
                  code: "NOTIFICATION_HISTORY_ERROR",
                  message: "Error retrieving notification history",
                  details: { error: error_4 instanceof Error ? error_4.message : "Unknown error" },
                },
                timestamp: new Date().toISOString(),
              },
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Mark notification as read
   */
  NotificationService.prototype.markAsRead = function (notificationId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, notification, error_5;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            if (!(0, utils_1.validateUUID)(notificationId)) {
              return [
                2 /*return*/,
                {
                  success: false,
                  error: {
                    code: "INVALID_NOTIFICATION_ID",
                    message: "Invalid notification ID format",
                  },
                  timestamp: new Date().toISOString(),
                },
              ];
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("notifications")
                .update({
                  read_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                })
                .eq("id", notificationId)
                .select()
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error || !data) {
              return [
                2 /*return*/,
                {
                  success: false,
                  error: {
                    code: "MARK_READ_FAILED",
                    message: "Failed to mark notification as read",
                  },
                  timestamp: new Date().toISOString(),
                },
              ];
            }
            notification = this.convertToNotificationData(data);
            return [
              2 /*return*/,
              {
                success: true,
                data: notification,
                timestamp: new Date().toISOString(),
              },
            ];
          case 2:
            error_5 = _b.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error: {
                  code: "MARK_READ_ERROR",
                  message: "Error marking notification as read",
                  details: { error: error_5 instanceof Error ? error_5.message : "Unknown error" },
                },
                timestamp: new Date().toISOString(),
              },
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Clean up old notifications
   */
  NotificationService.prototype.cleanupOldNotifications = function () {
    return __awaiter(this, arguments, void 0, function (retentionDays) {
      var cutoffDate, _a, data, error, error_6;
      if (retentionDays === void 0) {
        retentionDays = 30;
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
            return [
              4 /*yield*/,
              this.supabase
                .from("notifications")
                .delete()
                .lt("created_at", cutoffDate.toISOString())
                .select("id"),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              return [
                2 /*return*/,
                {
                  success: false,
                  error: {
                    code: "NOTIFICATION_CLEANUP_FAILED",
                    message: "Failed to cleanup old notifications",
                  },
                  timestamp: new Date().toISOString(),
                },
              ];
            }
            return [
              2 /*return*/,
              {
                success: true,
                data: {
                  deletedCount: (data === null || data === void 0 ? void 0 : data.length) || 0,
                  cutoffDate: cutoffDate.toISOString(),
                  cleanupDate: new Date().toISOString(),
                },
                timestamp: new Date().toISOString(),
              },
            ];
          case 2:
            error_6 = _b.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error: {
                  code: "NOTIFICATION_CLEANUP_ERROR",
                  message: "Error cleaning up old notifications",
                  details: { error: error_6 instanceof Error ? error_6.message : "Unknown error" },
                },
                timestamp: new Date().toISOString(),
              },
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Private helper methods
   */
  NotificationService.prototype.initializeTemplates = function () {
    // Session timeout warning template
    this.templates.set("session_timeout_warning", {
      id: "session_timeout_warning",
      name: "Session Timeout Warning",
      subject: "Your session will expire soon",
      body: "Your session will expire in {{timeoutMinutes}} minutes. Click here to extend your session.",
      channels: ["in_app", "push"],
      variables: ["timeoutMinutes", "sessionId"],
    });
    // Security alert template
    this.templates.set("security_alert", {
      id: "security_alert",
      name: "Security Alert",
      subject: "Security Alert - {{alertType}}",
      body: "A security event has been detected on your account: {{alertType}}. Severity: {{severity}}. Please review your account activity.",
      channels: ["in_app", "email", "push", "sms"],
      variables: ["alertType", "severity", "details"],
    });
    // Device trust template
    this.templates.set("device_trust", {
      id: "device_trust",
      name: "Device Trust Notification",
      subject: "Device Trust Update",
      body: "Device trust status has been updated for {{deviceInfo.name}}. Action: {{action}}.",
      channels: ["in_app", "email"],
      variables: ["deviceId", "action", "deviceInfo"],
    });
    // Login notification template
    this.templates.set("login_notification", {
      id: "login_notification",
      name: "Login Notification",
      subject: "New login to your account",
      body: "A new login was detected from {{deviceInfo.name}} at {{timestamp}}.",
      channels: ["in_app", "email"],
      variables: ["deviceInfo", "location", "timestamp"],
    });
  };
  NotificationService.prototype.startQueueProcessor = function () {
    var _this = this;
    // Process queue every 30 seconds
    setInterval(function () {
      return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              if (!(!this.isProcessingQueue && this.deliveryQueue.length > 0))
                return [3 /*break*/, 2];
              return [4 /*yield*/, this.processQueue()];
            case 1:
              _a.sent();
              _a.label = 2;
            case 2:
              return [2 /*return*/];
          }
        });
      });
    }, 30000);
  };
  NotificationService.prototype.processQueue = function () {
    return __awaiter(this, void 0, void 0, function () {
      var batchSize, batch, error_7;
      var _this = this;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (this.isProcessingQueue) return [2 /*return*/];
            this.isProcessingQueue = true;
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            batchSize = 10;
            batch = this.deliveryQueue.splice(0, batchSize);
            return [
              4 /*yield*/,
              Promise.all(
                batch.map(function (notification) {
                  return _this.processNotification(notification);
                }),
              ),
            ];
          case 2:
            _a.sent();
            return [3 /*break*/, 5];
          case 3:
            error_7 = _a.sent();
            console.error("Error processing notification queue:", error_7);
            return [3 /*break*/, 5];
          case 4:
            this.isProcessingQueue = false;
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  NotificationService.prototype.processNotification = function (notification) {
    return __awaiter(this, void 0, void 0, function () {
      var template, _i, _a, channel, error_8, error_9;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 8, , 13]);
            template = this.templates.get(notification.templateId || "");
            (_i = 0), (_a = notification.channels);
            _b.label = 1;
          case 1:
            if (!(_i < _a.length)) return [3 /*break*/, 6];
            channel = _a[_i];
            _b.label = 2;
          case 2:
            _b.trys.push([2, 4, , 5]);
            return [4 /*yield*/, this.deliverToChannel(notification, channel, template)];
          case 3:
            _b.sent();
            return [3 /*break*/, 5];
          case 4:
            error_8 = _b.sent();
            console.error("Error delivering to ".concat(channel, ":"), error_8);
            return [3 /*break*/, 5];
          case 5:
            _i++;
            return [3 /*break*/, 1];
          case 6:
            // Update notification status
            return [4 /*yield*/, this.updateNotificationStatus(notification.id, "delivered")];
          case 7:
            // Update notification status
            _b.sent();
            return [3 /*break*/, 13];
          case 8:
            error_9 = _b.sent();
            console.error("Error processing notification:", error_9);
            // Increment attempts and retry if under limit
            notification.attempts++;
            if (!(notification.attempts < notification.maxAttempts)) return [3 /*break*/, 10];
            // Add back to queue for retry
            this.deliveryQueue.push(notification);
            return [4 /*yield*/, this.updateNotificationStatus(notification.id, "retry")];
          case 9:
            _b.sent();
            return [3 /*break*/, 12];
          case 10:
            return [4 /*yield*/, this.updateNotificationStatus(notification.id, "failed")];
          case 11:
            _b.sent();
            _b.label = 12;
          case 12:
            return [3 /*break*/, 13];
          case 13:
            return [2 /*return*/];
        }
      });
    });
  };
  NotificationService.prototype.deliverToChannel = function (notification, channel, template) {
    return __awaiter(this, void 0, void 0, function () {
      var content, _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            content = this.renderTemplate(template, notification.data);
            _a = channel;
            switch (_a) {
              case "in_app":
                return [3 /*break*/, 1];
              case "email":
                return [3 /*break*/, 3];
              case "push":
                return [3 /*break*/, 5];
              case "sms":
                return [3 /*break*/, 7];
            }
            return [3 /*break*/, 9];
          case 1:
            return [4 /*yield*/, this.deliverInApp(notification, content)];
          case 2:
            _b.sent();
            return [3 /*break*/, 10];
          case 3:
            return [4 /*yield*/, this.deliverEmail(notification, content)];
          case 4:
            _b.sent();
            return [3 /*break*/, 10];
          case 5:
            return [4 /*yield*/, this.deliverPush(notification, content)];
          case 6:
            _b.sent();
            return [3 /*break*/, 10];
          case 7:
            return [4 /*yield*/, this.deliverSMS(notification, content)];
          case 8:
            _b.sent();
            return [3 /*break*/, 10];
          case 9:
            throw new Error("Unsupported channel: ".concat(channel));
          case 10:
            return [2 /*return*/];
        }
      });
    });
  };
  NotificationService.prototype.renderTemplate = function (template, data) {
    if (!template) {
      return {
        subject: "Notification",
        body: JSON.stringify(data),
      };
    }
    var subject = template.subject;
    var body = template.body;
    // Simple template variable replacement
    Object.entries(data).forEach(function (_a) {
      var key = _a[0],
        value = _a[1];
      var placeholder = "{{".concat(key, "}}");
      var stringValue = typeof value === "object" ? JSON.stringify(value) : String(value);
      subject = subject.replace(new RegExp(placeholder, "g"), stringValue);
      body = body.replace(new RegExp(placeholder, "g"), stringValue);
    });
    return { subject: subject, body: body };
  };
  NotificationService.prototype.deliverInApp = function (notification, content) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            // Store in-app notification in database
            return [
              4 /*yield*/,
              this.supabase.from("in_app_notifications").insert({
                id: crypto.randomUUID(),
                user_id: notification.userId,
                notification_id: notification.id,
                title: content.subject,
                message: content.body,
                type: notification.type,
                priority: notification.priority,
                read: false,
                created_at: new Date().toISOString(),
              }),
            ];
          case 1:
            // Store in-app notification in database
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  NotificationService.prototype.deliverEmail = function (notification, content) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
        console.log("Email delivery:", {
          to: notification.userId,
          subject: content.subject,
          body: content.body,
        });
        return [2 /*return*/];
      });
    });
  };
  NotificationService.prototype.deliverPush = function (notification, content) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // TODO: Integrate with push notification service (FCM, APNs, etc.)
        console.log("Push notification delivery:", {
          to: notification.userId,
          title: content.subject,
          body: content.body,
        });
        return [2 /*return*/];
      });
    });
  };
  NotificationService.prototype.deliverSMS = function (notification, content) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
        console.log("SMS delivery:", {
          to: notification.userId,
          message: content.body,
        });
        return [2 /*return*/];
      });
    });
  };
  NotificationService.prototype.updateNotificationStatus = function (notificationId, status) {
    return __awaiter(this, void 0, void 0, function () {
      var error_10;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("notifications")
                .update({
                  status: status,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", notificationId),
            ];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_10 = _a.sent();
            console.error("Error updating notification status:", error_10);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  NotificationService.prototype.convertToNotificationData = function (row) {
    return {
      id: row.id,
      userId: row.user_id,
      type: row.type,
      priority: row.priority,
      channels: JSON.parse(row.channels || "[]"),
      data: JSON.parse(row.data || "{}"),
      templateId: row.template_id,
      status: row.status,
      attempts: row.attempts,
      maxAttempts: row.max_attempts,
      createdAt: row.created_at,
      scheduledAt: row.scheduled_at,
      deliveredAt: row.delivered_at,
      readAt: row.read_at,
    };
  };
  return NotificationService;
})();
exports.NotificationService = NotificationService;
exports.default = NotificationService;

"use strict";
/**
 * NeonPro - Core Notification Service
 * Manages email, SMS, and in-app notifications with HIPAA compliance
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
var client_1 = require("@/lib/supabase/client");
var email_service_1 = require("./email-service");
var sms_service_1 = require("./sms-service");
var scheduling_service_1 = require("./scheduling-service");
var audit_service_1 = require("./audit-service");
var zod_1 = require("zod");
// Notification payload schema
var NotificationPayloadSchema = zod_1.z.object({
  recipientId: zod_1.z.string().uuid(),
  type: zod_1.z.enum([
    "appointment_reminder",
    "appointment_confirmation",
    "appointment_cancellation",
    "reschedule_request",
    "treatment_reminder",
    "follow_up_reminder",
    "emergency_alert",
    "billing_reminder",
  ]),
  channel: zod_1.z.enum(["email", "sms", "in_app"]).optional(),
  priority: zod_1.z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  subject: zod_1.z.string().min(1).max(200),
  content: zod_1.z.string().min(1),
  templateData: zod_1.z.record(zod_1.z.any()).optional(),
  scheduledFor: zod_1.z.date().optional(),
  metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
var NotificationService = /** @class */ (function () {
  function NotificationService() {
    this.emailService = new email_service_1.EmailService();
    this.smsService = new sms_service_1.SMSService();
    this.schedulingService = new scheduling_service_1.SchedulingService();
    this.auditService = new audit_service_1.AuditService();
  }
  /**
   * Send notification through appropriate channel(s)
   * Respects user preferences and HIPAA compliance requirements
   */
  NotificationService.prototype.sendNotification = function (payload) {
    return __awaiter(this, void 0, void 0, function () {
      var validPayload, preferences, channels, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 9, , 11]);
            validPayload = NotificationPayloadSchema.parse(payload);
            return [4 /*yield*/, this.getUserPreferences(validPayload.recipientId)];
          case 1:
            preferences = _a.sent();
            if (!preferences) {
              throw new Error("User preferences not found");
            }
            if (!!preferences.consentGranted) return [3 /*break*/, 3];
            return [
              4 /*yield*/,
              this.auditService.log({
                action: "notification_blocked",
                recipientId: validPayload.recipientId,
                reason: "consent_not_granted",
                notificationType: validPayload.type,
              }),
            ];
          case 2:
            _a.sent();
            return [
              2 /*return*/,
              [
                {
                  success: false,
                  channel: "email",
                  error: "User has not granted consent for notifications",
                },
              ],
            ];
          case 3:
            channels = this.determineChannels(validPayload, preferences);
            if (!(channels.length === 0)) return [3 /*break*/, 5];
            return [
              4 /*yield*/,
              this.auditService.log({
                action: "notification_blocked",
                recipientId: validPayload.recipientId,
                reason: "no_enabled_channels",
                notificationType: validPayload.type,
              }),
            ];
          case 4:
            _a.sent();
            return [
              2 /*return*/,
              [
                {
                  success: false,
                  channel: "email",
                  error: "No enabled notification channels for user",
                },
              ],
            ];
          case 5:
            if (!(validPayload.scheduledFor && validPayload.scheduledFor > new Date()))
              return [3 /*break*/, 7];
            return [4 /*yield*/, this.scheduleNotification(validPayload, channels, preferences)];
          case 6:
            return [2 /*return*/, _a.sent()];
          case 7:
            return [4 /*yield*/, this.sendImmediately(validPayload, channels, preferences)];
          case 8:
            return [2 /*return*/, _a.sent()];
          case 9:
            error_1 = _a.sent();
            return [
              4 /*yield*/,
              this.auditService.log({
                action: "notification_error",
                recipientId: payload.recipientId,
                error: error_1 instanceof Error ? error_1.message : "Unknown error",
                notificationType: payload.type,
              }),
            ];
          case 10:
            _a.sent();
            return [
              2 /*return*/,
              [
                {
                  success: false,
                  channel: "email",
                  error: error_1 instanceof Error ? error_1.message : "Failed to send notification",
                },
              ],
            ];
          case 11:
            return [2 /*return*/];
        }
      });
    });
  }; /**
   * Schedule notification for future delivery
   */
  NotificationService.prototype.scheduleNotification = function (payload, channels, preferences) {
    return __awaiter(this, void 0, void 0, function () {
      var results, _i, channels_1, channel, scheduledId, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            results = [];
            (_i = 0), (channels_1 = channels);
            _a.label = 1;
          case 1:
            if (!(_i < channels_1.length)) return [3 /*break*/, 7];
            channel = channels_1[_i];
            _a.label = 2;
          case 2:
            _a.trys.push([2, 5, , 6]);
            return [
              4 /*yield*/,
              this.schedulingService.scheduleNotification({
                recipientId: payload.recipientId,
                type: payload.type,
                channel: channel,
                payload: payload,
                scheduledFor: payload.scheduledFor,
                preferences: preferences,
              }),
            ];
          case 3:
            scheduledId = _a.sent();
            results.push({
              success: true,
              notificationId: scheduledId,
              channel: channel,
            });
            return [
              4 /*yield*/,
              this.auditService.log({
                action: "notification_scheduled",
                recipientId: payload.recipientId,
                notificationId: scheduledId,
                channel: channel,
                scheduledFor: payload.scheduledFor,
                notificationType: payload.type,
              }),
            ];
          case 4:
            _a.sent();
            return [3 /*break*/, 6];
          case 5:
            error_2 = _a.sent();
            results.push({
              success: false,
              channel: channel,
              error: error_2 instanceof Error ? error_2.message : "Failed to schedule notification",
            });
            return [3 /*break*/, 6];
          case 6:
            _i++;
            return [3 /*break*/, 1];
          case 7:
            return [2 /*return*/, results];
        }
      });
    });
  };
  /**
   * Send notification immediately through specified channels
   */
  NotificationService.prototype.sendImmediately = function (payload, channels, preferences) {
    return __awaiter(this, void 0, void 0, function () {
      var results, _i, channels_2, channel, result, _a, error_3;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            results = [];
            (_i = 0), (channels_2 = channels);
            _b.label = 1;
          case 1:
            if (!(_i < channels_2.length)) return [3 /*break*/, 14];
            channel = channels_2[_i];
            _b.label = 2;
          case 2:
            _b.trys.push([2, 12, , 13]);
            result = void 0;
            _a = channel;
            switch (_a) {
              case "email":
                return [3 /*break*/, 3];
              case "sms":
                return [3 /*break*/, 5];
              case "in_app":
                return [3 /*break*/, 7];
            }
            return [3 /*break*/, 9];
          case 3:
            return [
              4 /*yield*/,
              this.emailService.send(
                __assign(__assign({}, payload), {
                  recipientEmail: preferences.email,
                  timezone: preferences.timezone,
                }),
              ),
            ];
          case 4:
            result = _b.sent();
            return [3 /*break*/, 10];
          case 5:
            return [
              4 /*yield*/,
              this.smsService.send(
                __assign(__assign({}, payload), {
                  recipientPhone: preferences.phone,
                  timezone: preferences.timezone,
                }),
              ),
            ];
          case 6:
            result = _b.sent();
            return [3 /*break*/, 10];
          case 7:
            return [4 /*yield*/, this.sendInAppNotification(payload)];
          case 8:
            result = _b.sent();
            return [3 /*break*/, 10];
          case 9:
            throw new Error("Unsupported channel: ".concat(channel));
          case 10:
            results.push(result);
            return [
              4 /*yield*/,
              this.auditService.log({
                action: "notification_sent",
                recipientId: payload.recipientId,
                notificationId: result.notificationId,
                channel: channel,
                success: result.success,
                deliveredAt: result.deliveredAt,
                notificationType: payload.type,
              }),
            ];
          case 11:
            _b.sent();
            return [3 /*break*/, 13];
          case 12:
            error_3 = _b.sent();
            results.push({
              success: false,
              channel: channel,
              error: error_3 instanceof Error ? error_3.message : "Failed to send notification",
            });
            return [3 /*break*/, 13];
          case 13:
            _i++;
            return [3 /*break*/, 1];
          case 14:
            return [2 /*return*/, results];
        }
      });
    });
  }; /**
   * Get user notification preferences from database
   */
  NotificationService.prototype.getUserPreferences = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_4;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              client_1.supabase
                .from("notification_preferences")
                .select("*")
                .eq("user_id", userId)
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              console.error("Error fetching user preferences:", error);
              return [2 /*return*/, null];
            }
            return [2 /*return*/, data];
          case 2:
            error_4 = _b.sent();
            console.error("Error in getUserPreferences:", error_4);
            return [2 /*return*/, null];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Determine which channels to use based on payload and user preferences
   */
  NotificationService.prototype.determineChannels = function (payload, preferences) {
    var channels = [];
    // If specific channel requested, use that (if enabled)
    if (payload.channel) {
      var channelEnabled = this.isChannelEnabled(payload.channel, payload.type, preferences);
      if (channelEnabled) {
        channels.push(payload.channel);
      }
      return channels;
    }
    // Otherwise, use all enabled channels based on priority and type
    var priorityChannels = this.getChannelsForPriority(payload.priority);
    var typeChannels = this.getChannelsForType(payload.type, preferences);
    // Intersect priority and type channels
    for (var _i = 0, priorityChannels_1 = priorityChannels; _i < priorityChannels_1.length; _i++) {
      var channel = priorityChannels_1[_i];
      if (
        typeChannels.includes(channel) &&
        this.isChannelEnabled(channel, payload.type, preferences)
      ) {
        channels.push(channel);
      }
    }
    return channels;
  };
  /**
   * Check if a specific channel is enabled for a notification type
   */
  NotificationService.prototype.isChannelEnabled = function (channel, type, preferences) {
    var channelPrefs = preferences.channels[channel];
    if (!(channelPrefs === null || channelPrefs === void 0 ? void 0 : channelPrefs.enabled))
      return false;
    // Check if this notification type is enabled for this channel
    return channelPrefs.enabledTypes.includes(type);
  };
  /**
   * Get channels appropriate for notification priority
   */
  NotificationService.prototype.getChannelsForPriority = function (priority) {
    switch (priority) {
      case "urgent":
        return ["sms", "in_app", "email"];
      case "high":
        return ["sms", "email", "in_app"];
      case "normal":
        return ["email", "in_app"];
      case "low":
        return ["in_app", "email"];
      default:
        return ["email"];
    }
  }; /**
   * Get channels enabled for specific notification type
   */
  NotificationService.prototype.getChannelsForType = function (type, preferences) {
    var channels = [];
    // Check each channel to see if it supports this notification type
    Object.entries(preferences.channels).forEach(function (_a) {
      var channelKey = _a[0],
        channelPrefs = _a[1];
      if (channelPrefs.enabled && channelPrefs.enabledTypes.includes(type)) {
        channels.push(channelKey);
      }
    });
    return channels;
  };
  /**
   * Send in-app notification
   */
  NotificationService.prototype.sendInAppNotification = function (payload) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_5;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              client_1.supabase
                .from("in_app_notifications")
                .insert({
                  user_id: payload.recipientId,
                  type: payload.type,
                  title: payload.subject,
                  content: payload.content,
                  priority: payload.priority,
                  metadata: payload.metadata,
                  created_at: new Date().toISOString(),
                })
                .select("id")
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Failed to create in-app notification: ".concat(error.message));
            }
            return [
              2 /*return*/,
              {
                success: true,
                notificationId: data.id,
                channel: "in_app",
                deliveredAt: new Date(),
              },
            ];
          case 2:
            error_5 = _b.sent();
            return [
              2 /*return*/,
              {
                success: false,
                channel: "in_app",
                error:
                  error_5 instanceof Error ? error_5.message : "Failed to send in-app notification",
              },
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Cancel a scheduled notification
   */
  NotificationService.prototype.cancelScheduledNotification = function (notificationId) {
    return __awaiter(this, void 0, void 0, function () {
      var success, error_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [4 /*yield*/, this.schedulingService.cancelNotification(notificationId)];
          case 1:
            success = _a.sent();
            if (!success) return [3 /*break*/, 3];
            return [
              4 /*yield*/,
              this.auditService.log({
                action: "notification_cancelled",
                notificationId: notificationId,
              }),
            ];
          case 2:
            _a.sent();
            _a.label = 3;
          case 3:
            return [2 /*return*/, success];
          case 4:
            error_6 = _a.sent();
            console.error("Error cancelling scheduled notification:", error_6);
            return [2 /*return*/, false];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get notification delivery status
   */
  NotificationService.prototype.getNotificationStatus = function (notificationId) {
    return __awaiter(this, void 0, void 0, function () {
      var scheduledStatus, emailStatus, smsStatus, error_7;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [4 /*yield*/, this.schedulingService.getNotificationStatus(notificationId)];
          case 1:
            scheduledStatus = _a.sent();
            if (scheduledStatus) return [2 /*return*/, scheduledStatus];
            return [4 /*yield*/, this.emailService.getDeliveryStatus(notificationId)];
          case 2:
            emailStatus = _a.sent();
            if (emailStatus) return [2 /*return*/, emailStatus];
            return [4 /*yield*/, this.smsService.getDeliveryStatus(notificationId)];
          case 3:
            smsStatus = _a.sent();
            if (smsStatus) return [2 /*return*/, smsStatus];
            return [2 /*return*/, null];
          case 4:
            error_7 = _a.sent();
            console.error("Error getting notification status:", error_7);
            return [2 /*return*/, null];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Update user notification preferences
   */
  NotificationService.prototype.updateUserPreferences = function (userId, preferences) {
    return __awaiter(this, void 0, void 0, function () {
      var error, error_8;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              client_1.supabase.from("notification_preferences").upsert(
                __assign(__assign({ user_id: userId }, preferences), {
                  updated_at: new Date().toISOString(),
                }),
              ),
            ];
          case 1:
            error = _a.sent().error;
            if (error) {
              throw new Error("Failed to update preferences: ".concat(error.message));
            }
            return [
              4 /*yield*/,
              this.auditService.log({
                action: "preferences_updated",
                recipientId: userId,
                metadata: { preferences: preferences },
              }),
            ];
          case 2:
            _a.sent();
            return [2 /*return*/, true];
          case 3:
            error_8 = _a.sent();
            console.error("Error updating user preferences:", error_8);
            return [2 /*return*/, false];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  return NotificationService;
})();
exports.NotificationService = NotificationService;

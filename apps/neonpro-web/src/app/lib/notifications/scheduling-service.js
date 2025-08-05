/**
 * NeonPro - Scheduling Service for Future Notifications
 * Manages scheduled notifications with timezone support and retry logic
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
exports.SchedulingService = void 0;
var client_1 = require("@/lib/supabase/client");
var SchedulingService = /** @class */ (() => {
  function SchedulingService() {
    this.maxRetries = 3;
    this.retryIntervals = [5 * 60 * 1000, 15 * 60 * 1000, 60 * 60 * 1000]; // 5min, 15min, 1hour
  }
  /**
   * Schedule a notification for future delivery
   */
  SchedulingService.prototype.scheduleNotification = function (payload) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_1;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              client_1.supabase
                .from("scheduled_notifications")
                .insert({
                  recipient_id: payload.recipientId,
                  notification_type: payload.type,
                  channel: payload.channel,
                  payload: payload.payload,
                  scheduled_for: payload.scheduledFor.toISOString(),
                  status: "pending",
                  retry_count: 0,
                  max_retries: this.maxRetries,
                  metadata: __assign({ preferences: payload.preferences }, payload.metadata),
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                })
                .select("id")
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Failed to schedule notification: ".concat(error.message));
            }
            return [2 /*return*/, data.id];
          case 2:
            error_1 = _b.sent();
            console.error("Error scheduling notification:", error_1);
            throw error_1;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get due notifications that need to be sent
   */
  SchedulingService.prototype.getDueNotifications = function () {
    return __awaiter(this, void 0, void 0, function () {
      var now, _a, data, error, error_2;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            now = new Date().toISOString();
            return [
              4 /*yield*/,
              client_1.supabase
                .from("scheduled_notifications")
                .select("*")
                .eq("status", "pending")
                .lte("scheduled_for", now)
                .order("scheduled_for", { ascending: true })
                .limit(100),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Failed to get due notifications: ".concat(error.message));
            }
            return [2 /*return*/, data.map(this.mapDatabaseToModel)];
          case 2:
            error_2 = _b.sent();
            console.error("Error getting due notifications:", error_2);
            return [2 /*return*/, []];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Mark notification as sent successfully
   */
  SchedulingService.prototype.markNotificationSent = function (notificationId, deliveryDetails) {
    return __awaiter(this, void 0, void 0, function () {
      var error, error_3;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              client_1.supabase
                .from("scheduled_notifications")
                .update({
                  status: "sent",
                  sent_at: new Date().toISOString(),
                  delivery_details: deliveryDetails,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", notificationId),
            ];
          case 1:
            error = _a.sent().error;
            if (error) {
              console.error("Failed to mark notification as sent: ".concat(error.message));
              return [2 /*return*/, false];
            }
            return [2 /*return*/, true];
          case 2:
            error_3 = _a.sent();
            console.error("Error marking notification as sent:", error_3);
            return [2 /*return*/, false];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Mark notification as failed and handle retry logic
   */
  SchedulingService.prototype.markNotificationFailed = function (notificationId, errorMessage) {
    return __awaiter(this, void 0, void 0, function () {
      var _a,
        current,
        fetchError,
        newRetryCount,
        shouldRetry,
        updateData,
        retryDelay,
        nextRetry,
        error,
        error_4;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              client_1.supabase
                .from("scheduled_notifications")
                .select("retry_count, max_retries")
                .eq("id", notificationId)
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (current = _a.data), (fetchError = _a.error);
            if (fetchError) {
              console.error("Failed to fetch notification for retry: ".concat(fetchError.message));
              return [2 /*return*/, false];
            }
            newRetryCount = (current.retry_count || 0) + 1;
            shouldRetry = newRetryCount <= (current.max_retries || this.maxRetries);
            updateData = {
              last_error: errorMessage,
              retry_count: newRetryCount,
              updated_at: new Date().toISOString(),
            };
            if (shouldRetry) {
              retryDelay =
                this.retryIntervals[Math.min(newRetryCount - 1, this.retryIntervals.length - 1)];
              nextRetry = new Date(Date.now() + retryDelay);
              updateData.scheduled_for = nextRetry.toISOString();
              updateData.status = "pending";
            } else {
              // Max retries reached, mark as failed
              updateData.status = "failed";
              updateData.failed_at = new Date().toISOString();
            }
            return [
              4 /*yield*/,
              client_1.supabase
                .from("scheduled_notifications")
                .update(updateData)
                .eq("id", notificationId),
            ];
          case 2:
            error = _b.sent().error;
            if (error) {
              console.error("Failed to mark notification as failed: ".concat(error.message));
              return [2 /*return*/, false];
            }
            return [2 /*return*/, true];
          case 3:
            error_4 = _b.sent();
            console.error("Error marking notification as failed:", error_4);
            return [2 /*return*/, false];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  }; /**
   * Cancel a scheduled notification
   */
  SchedulingService.prototype.cancelNotification = function (notificationId) {
    return __awaiter(this, void 0, void 0, function () {
      var error, error_5;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              client_1.supabase
                .from("scheduled_notifications")
                .update({
                  status: "cancelled",
                  cancelled_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                })
                .eq("id", notificationId)
                .eq("status", "pending"),
            ];
          case 1:
            error = _a.sent().error;
            if (error) {
              console.error("Failed to cancel notification: ".concat(error.message));
              return [2 /*return*/, false];
            }
            return [2 /*return*/, true];
          case 2:
            error_5 = _a.sent();
            console.error("Error cancelling notification:", error_5);
            return [2 /*return*/, false];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get notification status
   */
  SchedulingService.prototype.getNotificationStatus = function (notificationId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, statusMap, deliveredAt, error_6;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              client_1.supabase
                .from("scheduled_notifications")
                .select("status, sent_at, failed_at, cancelled_at, last_error")
                .eq("id", notificationId)
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              console.error("Failed to get notification status: ".concat(error.message));
              return [2 /*return*/, null];
            }
            statusMap = {
              pending: "pending",
              sent: "delivered", // Assume sent means delivered for scheduled notifications
              failed: "failed",
              cancelled: "cancelled",
            };
            deliveredAt = data.sent_at
              ? new Date(data.sent_at)
              : data.failed_at
                ? new Date(data.failed_at)
                : data.cancelled_at
                  ? new Date(data.cancelled_at)
                  : undefined;
            return [
              2 /*return*/,
              {
                status: statusMap[data.status] || "failed",
                deliveredAt: deliveredAt,
                error: data.last_error || undefined,
              },
            ];
          case 2:
            error_6 = _b.sent();
            console.error("Error getting notification status:", error_6);
            return [2 /*return*/, null];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Reschedule a pending notification
   */
  SchedulingService.prototype.rescheduleNotification = function (notificationId, newScheduledTime) {
    return __awaiter(this, void 0, void 0, function () {
      var error, error_7;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              client_1.supabase
                .from("scheduled_notifications")
                .update({
                  scheduled_for: newScheduledTime.toISOString(),
                  updated_at: new Date().toISOString(),
                })
                .eq("id", notificationId)
                .eq("status", "pending"),
            ];
          case 1:
            error = _a.sent().error;
            if (error) {
              console.error("Failed to reschedule notification: ".concat(error.message));
              return [2 /*return*/, false];
            }
            return [2 /*return*/, true];
          case 2:
            error_7 = _a.sent();
            console.error("Error rescheduling notification:", error_7);
            return [2 /*return*/, false];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Schedule appointment reminder notifications based on user preferences
   */
  SchedulingService.prototype.scheduleAppointmentReminders = function (
    appointmentId,
    appointmentDate,
    patientId,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var _a,
        preferences,
        prefError,
        scheduledIds,
        _i,
        _b,
        interval,
        reminderTime,
        _c,
        _d,
        _e,
        channel,
        channelPrefs,
        scheduledId,
        error_8,
        error_9;
      return __generator(this, function (_f) {
        switch (_f.label) {
          case 0:
            _f.trys.push([0, 10, , 11]);
            return [
              4 /*yield*/,
              client_1.supabase
                .from("notification_preferences")
                .select("*")
                .eq("user_id", patientId)
                .single(),
            ];
          case 1:
            (_a = _f.sent()), (preferences = _a.data), (prefError = _a.error);
            if (prefError || !preferences) {
              console.error("Failed to get patient preferences:", prefError);
              return [2 /*return*/, []];
            }
            scheduledIds = [];
            (_i = 0), (_b = preferences.reminderIntervals || [24, 2]);
            _f.label = 2;
          case 2:
            if (!(_i < _b.length)) return [3 /*break*/, 9];
            interval = _b[_i];
            reminderTime = new Date(appointmentDate.getTime() - interval * 60 * 60 * 1000);
            if (!(reminderTime > new Date())) return [3 /*break*/, 8];
            (_c = 0), (_d = Object.entries(preferences.channels));
            _f.label = 3;
          case 3:
            if (!(_c < _d.length)) return [3 /*break*/, 8];
            (_e = _d[_c]), (channel = _e[0]), (channelPrefs = _e[1]);
            if (
              !(channelPrefs.enabled && channelPrefs.enabledTypes.includes("appointment_reminder"))
            )
              return [3 /*break*/, 7];
            _f.label = 4;
          case 4:
            _f.trys.push([4, 6, , 7]);
            return [
              4 /*yield*/,
              this.scheduleNotification({
                recipientId: patientId,
                type: "appointment_reminder",
                channel: channel,
                payload: {
                  appointmentId: appointmentId,
                  appointmentDate: appointmentDate.toISOString(),
                  interval: "".concat(interval, "h"),
                },
                scheduledFor: reminderTime,
                preferences: preferences,
                metadata: {
                  appointmentId: appointmentId,
                  reminderInterval: interval,
                },
              }),
            ];
          case 5:
            scheduledId = _f.sent();
            scheduledIds.push(scheduledId);
            return [3 /*break*/, 7];
          case 6:
            error_8 = _f.sent();
            console.error("Failed to schedule ".concat(channel, " reminder:"), error_8);
            return [3 /*break*/, 7];
          case 7:
            _c++;
            return [3 /*break*/, 3];
          case 8:
            _i++;
            return [3 /*break*/, 2];
          case 9:
            return [2 /*return*/, scheduledIds];
          case 10:
            error_9 = _f.sent();
            console.error("Error scheduling appointment reminders:", error_9);
            return [2 /*return*/, []];
          case 11:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Cancel all scheduled notifications for an appointment
   */
  SchedulingService.prototype.cancelAppointmentNotifications = function (appointmentId) {
    return __awaiter(this, void 0, void 0, function () {
      var error, error_10;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              client_1.supabase
                .from("scheduled_notifications")
                .update({
                  status: "cancelled",
                  cancelled_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                })
                .eq("status", "pending")
                .contains("metadata", { appointmentId: appointmentId }),
            ];
          case 1:
            error = _a.sent().error;
            if (error) {
              console.error("Failed to cancel appointment notifications: ".concat(error.message));
              return [2 /*return*/, false];
            }
            return [2 /*return*/, true];
          case 2:
            error_10 = _a.sent();
            console.error("Error cancelling appointment notifications:", error_10);
            return [2 /*return*/, false];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Map database record to model
   */
  SchedulingService.prototype.mapDatabaseToModel = function (dbRecord) {
    return {
      id: dbRecord.id,
      recipientId: dbRecord.recipient_id,
      type: dbRecord.notification_type,
      channel: dbRecord.channel,
      payload: dbRecord.payload,
      scheduledFor: new Date(dbRecord.scheduled_for),
      status: dbRecord.status,
      retryCount: dbRecord.retry_count || 0,
      maxRetries: dbRecord.max_retries || this.maxRetries,
      lastError: dbRecord.last_error,
      createdAt: new Date(dbRecord.created_at),
      updatedAt: new Date(dbRecord.updated_at),
    };
  };
  /**
   * Clean up old completed/failed notifications (maintenance task)
   */
  SchedulingService.prototype.cleanupOldNotifications = function () {
    return __awaiter(this, arguments, void 0, function (olderThanDays) {
      var cutoffDate, _a, data, error, error_11;
      if (olderThanDays === void 0) {
        olderThanDays = 90;
      }
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
            return [
              4 /*yield*/,
              client_1.supabase
                .from("scheduled_notifications")
                .delete()
                .in("status", ["sent", "failed", "cancelled"])
                .lt("updated_at", cutoffDate.toISOString())
                .select("id"),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              console.error("Failed to cleanup old notifications: ".concat(error.message));
              return [2 /*return*/, 0];
            }
            return [2 /*return*/, (data === null || data === void 0 ? void 0 : data.length) || 0];
          case 2:
            error_11 = _b.sent();
            console.error("Error cleaning up old notifications:", error_11);
            return [2 /*return*/, 0];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  return SchedulingService;
})();
exports.SchedulingService = SchedulingService;

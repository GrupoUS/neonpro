"use client";
"use strict";
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
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.useNotifications = useNotifications;
var react_1 = require("react");
var auth_helpers_nextjs_1 = require("@supabase/auth-helpers-nextjs");
function useNotifications(_a) {
  var _this = this;
  var userId = _a.userId,
    _b = _a.autoMarkAsRead,
    autoMarkAsRead = _b === void 0 ? false : _b,
    _c = _a.limit,
    limit = _c === void 0 ? 50 : _c,
    types = _a.types,
    _d = _a.realtime,
    realtime = _d === void 0 ? true : _d;
  var _e = (0, react_1.useState)([]),
    notifications = _e[0],
    setNotifications = _e[1];
  var _f = (0, react_1.useState)(null),
    preferences = _f[0],
    setPreferences = _f[1];
  var _g = (0, react_1.useState)(true),
    isLoading = _g[0],
    setIsLoading = _g[1];
  var _h = (0, react_1.useState)(null),
    error = _h[0],
    setError = _h[1];
  var _j = (0, react_1.useState)(null),
    subscription = _j[0],
    setSubscription = _j[1];
  var supabase = (0, auth_helpers_nextjs_1.createClientComponentClient)();
  // Load initial data
  var loadNotifications = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        var query, _a, notificationsData, notificationsError, err_1, errorMessage;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              _b.trys.push([0, 2, 3, 4]);
              setIsLoading(true);
              setError(null);
              query = supabase
                .from("notifications")
                .select("*")
                .eq("user_id", userId)
                .order("created_at", { ascending: false })
                .limit(limit);
              // Filter by types if specified
              if (types && types.length > 0) {
                query = query.in("type", types);
              }
              // Filter out expired notifications
              query = query.or(
                "expires_at.is.null,expires_at.gt.".concat(new Date().toISOString()),
              );
              return [4 /*yield*/, query];
            case 1:
              (_a = _b.sent()), (notificationsData = _a.data), (notificationsError = _a.error);
              if (notificationsError) {
                throw new Error(
                  "Failed to load notifications: ".concat(notificationsError.message),
                );
              }
              setNotifications(notificationsData || []);
              return [3 /*break*/, 4];
            case 2:
              err_1 = _b.sent();
              errorMessage =
                err_1 instanceof Error ? err_1.message : "Failed to load notifications";
              setError(errorMessage);
              console.error("Error loading notifications:", err_1);
              return [3 /*break*/, 4];
            case 3:
              setIsLoading(false);
              return [7 /*endfinally*/];
            case 4:
              return [2 /*return*/];
          }
        });
      });
    },
    [userId, limit, types, supabase],
  );
  // Load preferences
  var loadPreferences = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        var _a, data, preferencesError, defaultPreferences, err_2;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              _b.trys.push([0, 2, , 3]);
              return [
                4 /*yield*/,
                supabase
                  .from("notification_preferences")
                  .select("*")
                  .eq("user_id", userId)
                  .single(),
              ];
            case 1:
              (_a = _b.sent()), (data = _a.data), (preferencesError = _a.error);
              if (preferencesError && preferencesError.code !== "PGRST116") {
                throw new Error("Failed to load preferences: ".concat(preferencesError.message));
              }
              defaultPreferences = {
                user_id: userId,
                email_enabled: true,
                push_enabled: true,
                appointment_reminders: true,
                status_changes: true,
                marketing_emails: false,
                reminder_timing: 120, // 2 hours
              };
              setPreferences(data || defaultPreferences);
              return [3 /*break*/, 3];
            case 2:
              err_2 = _b.sent();
              console.error("Error loading notification preferences:", err_2);
              return [3 /*break*/, 3];
            case 3:
              return [2 /*return*/];
          }
        });
      });
    },
    [userId, supabase],
  );
  // Setup real-time subscription
  var setupRealtimeSubscription = (0, react_1.useCallback)(
    function () {
      if (!realtime || subscription) return;
      var channel = supabase
        .channel("notifications:".concat(userId))
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
            filter: "user_id=eq.".concat(userId),
          },
          function (payload) {
            console.log("Notification change:", payload);
            if (payload.eventType === "INSERT") {
              var newNotification_1 = payload.new;
              setNotifications(function (prev) {
                return __spreadArray([newNotification_1], prev.slice(0, limit - 1), true);
              });
              // Auto-mark as read if enabled
              if (autoMarkAsRead) {
                setTimeout(function () {
                  return markAsRead(newNotification_1.id);
                }, 5000);
              }
              // Show toast notification for high priority
              if (newNotification_1.priority === "high") {
                // This would integrate with your toast system
                console.log("High priority notification:", newNotification_1.title);
              }
            } else if (payload.eventType === "UPDATE") {
              var updatedNotification_1 = payload.new;
              setNotifications(function (prev) {
                return prev.map(function (notif) {
                  return notif.id === updatedNotification_1.id ? updatedNotification_1 : notif;
                });
              });
            } else if (payload.eventType === "DELETE") {
              setNotifications(function (prev) {
                return prev.filter(function (notif) {
                  return notif.id !== payload.old.id;
                });
              });
            }
          },
        )
        .subscribe();
      setSubscription(channel);
    },
    [userId, realtime, subscription, supabase, autoMarkAsRead, limit],
  );
  // Mark notification as read
  var markAsRead = (0, react_1.useCallback)(
    function (notificationId) {
      return __awaiter(_this, void 0, void 0, function () {
        var error_1, err_3;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 2, , 3]);
              return [
                4 /*yield*/,
                supabase
                  .from("notifications")
                  .update({ read_at: new Date().toISOString() })
                  .eq("id", notificationId)
                  .eq("user_id", userId),
              ];
            case 1:
              error_1 = _a.sent().error;
              if (error_1) {
                throw new Error("Failed to mark notification as read: ".concat(error_1.message));
              }
              // Update local state
              setNotifications(function (prev) {
                return prev.map(function (notif) {
                  return notif.id === notificationId
                    ? __assign(__assign({}, notif), { read_at: new Date().toISOString() })
                    : notif;
                });
              });
              return [3 /*break*/, 3];
            case 2:
              err_3 = _a.sent();
              console.error("Error marking notification as read:", err_3);
              throw err_3;
            case 3:
              return [2 /*return*/];
          }
        });
      });
    },
    [userId, supabase],
  );
  // Mark all notifications as read
  var markAllAsRead = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        var unreadIds_1, error_2, now_1, err_4;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 2, , 3]);
              unreadIds_1 = notifications
                .filter(function (notif) {
                  return !notif.read_at;
                })
                .map(function (notif) {
                  return notif.id;
                });
              if (unreadIds_1.length === 0) return [2 /*return*/];
              return [
                4 /*yield*/,
                supabase
                  .from("notifications")
                  .update({ read_at: new Date().toISOString() })
                  .in("id", unreadIds_1)
                  .eq("user_id", userId),
              ];
            case 1:
              error_2 = _a.sent().error;
              if (error_2) {
                throw new Error("Failed to mark notifications as read: ".concat(error_2.message));
              }
              now_1 = new Date().toISOString();
              setNotifications(function (prev) {
                return prev.map(function (notif) {
                  return unreadIds_1.includes(notif.id)
                    ? __assign(__assign({}, notif), { read_at: now_1 })
                    : notif;
                });
              });
              return [3 /*break*/, 3];
            case 2:
              err_4 = _a.sent();
              console.error("Error marking all notifications as read:", err_4);
              throw err_4;
            case 3:
              return [2 /*return*/];
          }
        });
      });
    },
    [notifications, userId, supabase],
  );
  // Delete notification
  var deleteNotification = (0, react_1.useCallback)(
    function (notificationId) {
      return __awaiter(_this, void 0, void 0, function () {
        var error_3, err_5;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 2, , 3]);
              return [
                4 /*yield*/,
                supabase
                  .from("notifications")
                  .delete()
                  .eq("id", notificationId)
                  .eq("user_id", userId),
              ];
            case 1:
              error_3 = _a.sent().error;
              if (error_3) {
                throw new Error("Failed to delete notification: ".concat(error_3.message));
              }
              // Update local state
              setNotifications(function (prev) {
                return prev.filter(function (notif) {
                  return notif.id !== notificationId;
                });
              });
              return [3 /*break*/, 3];
            case 2:
              err_5 = _a.sent();
              console.error("Error deleting notification:", err_5);
              throw err_5;
            case 3:
              return [2 /*return*/];
          }
        });
      });
    },
    [userId, supabase],
  );
  // Update preferences
  var updatePreferences = (0, react_1.useCallback)(
    function (newPreferences) {
      return __awaiter(_this, void 0, void 0, function () {
        var updatedPreferences, error_4, err_6;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 2, , 3]);
              updatedPreferences = __assign(__assign({}, preferences), newPreferences);
              return [
                4 /*yield*/,
                supabase
                  .from("notification_preferences")
                  .upsert(updatedPreferences)
                  .eq("user_id", userId),
              ];
            case 1:
              error_4 = _a.sent().error;
              if (error_4) {
                throw new Error("Failed to update preferences: ".concat(error_4.message));
              }
              setPreferences(updatedPreferences);
              return [3 /*break*/, 3];
            case 2:
              err_6 = _a.sent();
              console.error("Error updating notification preferences:", err_6);
              throw err_6;
            case 3:
              return [2 /*return*/];
          }
        });
      });
    },
    [preferences, userId, supabase],
  );
  // Send notification
  var sendNotification = (0, react_1.useCallback)(
    function (notification) {
      return __awaiter(_this, void 0, void 0, function () {
        var error_5, err_7;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 2, , 3]);
              return [
                4 /*yield*/,
                supabase
                  .from("notifications")
                  .insert([
                    __assign(__assign({}, notification), { created_at: new Date().toISOString() }),
                  ]),
              ];
            case 1:
              error_5 = _a.sent().error;
              if (error_5) {
                throw new Error("Failed to send notification: ".concat(error_5.message));
              }
              return [3 /*break*/, 3];
            case 2:
              err_7 = _a.sent();
              console.error("Error sending notification:", err_7);
              throw err_7;
            case 3:
              return [2 /*return*/];
          }
        });
      });
    },
    [supabase],
  );
  // Refresh notifications
  var refreshNotifications = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, loadNotifications()];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    },
    [loadNotifications],
  );
  // Utility functions
  var getNotificationsByType = (0, react_1.useCallback)(
    function (type) {
      return notifications.filter(function (notif) {
        return notif.type === type;
      });
    },
    [notifications],
  );
  var getUnreadNotifications = (0, react_1.useCallback)(
    function () {
      return notifications.filter(function (notif) {
        return !notif.read_at;
      });
    },
    [notifications],
  );
  // Computed values
  var unreadCount = getUnreadNotifications().length;
  var hasUnreadNotifications = unreadCount > 0;
  // Effects
  (0, react_1.useEffect)(
    function () {
      loadNotifications();
      loadPreferences();
    },
    [loadNotifications, loadPreferences],
  );
  (0, react_1.useEffect)(
    function () {
      setupRealtimeSubscription();
      return function () {
        if (subscription) {
          subscription.unsubscribe();
        }
      };
    },
    [setupRealtimeSubscription, subscription],
  );
  return {
    // State
    notifications: notifications,
    unreadCount: unreadCount,
    preferences: preferences,
    isLoading: isLoading,
    error: error,
    // Actions
    markAsRead: markAsRead,
    markAllAsRead: markAllAsRead,
    deleteNotification: deleteNotification,
    updatePreferences: updatePreferences,
    sendNotification: sendNotification,
    refreshNotifications: refreshNotifications,
    // Utilities
    getNotificationsByType: getNotificationsByType,
    getUnreadNotifications: getUnreadNotifications,
    hasUnreadNotifications: hasUnreadNotifications,
  };
}

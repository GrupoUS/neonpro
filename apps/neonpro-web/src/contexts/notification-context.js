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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationProvider = NotificationProvider;
exports.useNotificationContext = useNotificationContext;
exports.useNotificationToast = useNotificationToast;
var react_1 = require("react");
var sonner_1 = require("sonner");
var use_notifications_1 = require("@/hooks/use-notifications");
var NotificationContext = (0, react_1.createContext)(undefined);
function NotificationProvider(_a) {
  var _this = this;
  var children = _a.children,
    userId = _a.userId,
    _b = _a.disabled,
    disabled = _b === void 0 ? false : _b;
  var notificationHook = (0, use_notifications_1.useNotifications)({
    userId: userId,
    autoMarkAsRead: false,
    limit: 100,
    realtime: !disabled,
  });
  var notifications = notificationHook.notifications,
    unreadCount = notificationHook.unreadCount,
    preferences = notificationHook.preferences,
    isLoading = notificationHook.isLoading,
    error = notificationHook.error,
    markAsRead = notificationHook.markAsRead,
    markAllAsRead = notificationHook.markAllAsRead,
    deleteNotification = notificationHook.deleteNotification,
    updatePreferences = notificationHook.updatePreferences,
    refreshNotifications = notificationHook.refreshNotifications,
    getNotificationsByType = notificationHook.getNotificationsByType,
    getUnreadNotifications = notificationHook.getUnreadNotifications,
    hasUnreadNotifications = notificationHook.hasUnreadNotifications;
  // Show toast notification
  var showNotificationToast = function (notification) {
    var toastProps = {
      id: notification.id,
      duration: notification.priority === "high" ? 10000 : 5000,
      action: notification.action_url
        ? {
            label: "Ver",
            onClick: function () {
              return (window.location.href = notification.action_url);
            },
          }
        : undefined,
    };
    switch (notification.type) {
      case "appointment_confirmed":
        sonner_1.toast.success(
          notification.title,
          __assign({ description: notification.message }, toastProps),
        );
        break;
      case "appointment_cancelled":
        sonner_1.toast.error(
          notification.title,
          __assign({ description: notification.message }, toastProps),
        );
        break;
      case "appointment_reminder":
        sonner_1.toast.info(
          notification.title,
          __assign({ description: notification.message }, toastProps),
        );
        break;
      case "appointment_rescheduled":
        sonner_1.toast.info(
          notification.title,
          __assign({ description: notification.message }, toastProps),
        );
        break;
      case "system":
        if (notification.priority === "high") {
          sonner_1.toast.error(
            notification.title,
            __assign({ description: notification.message }, toastProps),
          );
        } else {
          sonner_1.toast.info(
            notification.title,
            __assign({ description: notification.message }, toastProps),
          );
        }
        break;
      default:
        (0, sonner_1.toast)(
          notification.title,
          __assign({ description: notification.message }, toastProps),
        );
    }
  };
  // Request notification permission
  var requestPermission = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var permission;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!("Notification" in window)) {
              console.warn("This browser does not support notifications");
              return [2 /*return*/, "denied"];
            }
            if (Notification.permission === "granted") {
              return [2 /*return*/, "granted"];
            }
            if (!(Notification.permission !== "denied")) return [3 /*break*/, 2];
            return [4 /*yield*/, Notification.requestPermission()];
          case 1:
            permission = _a.sent();
            if (permission === "granted") {
              sonner_1.toast.success("Notificações ativadas!", {
                description: "Você receberá notificações sobre seus agendamentos.",
              });
            }
            return [2 /*return*/, permission];
          case 2:
            return [2 /*return*/, Notification.permission];
        }
      });
    });
  };
  // Send push notification
  var sendPushNotification = function (title, options) {
    if (options === void 0) {
      options = {};
    }
    if (!("Notification" in window) || Notification.permission !== "granted") {
      return;
    }
    var defaultOptions = __assign(
      {
        icon: "/icon-192x192.png",
        badge: "/icon-192x192.png",
        tag: "neonpro-notification",
        requireInteraction: false,
      },
      options,
    );
    try {
      new Notification(title, defaultOptions);
    } catch (error) {
      console.error("Error sending push notification:", error);
    }
  };
  // Handle new notifications with toast
  (0, react_1.useEffect)(
    function () {
      if (!disabled && notifications.length > 0) {
        var latestNotification = notifications[0];
        var isNewNotification =
          !latestNotification.read_at &&
          new Date(latestNotification.created_at).getTime() > Date.now() - 5000; // Created in last 5 seconds
        if (isNewNotification) {
          // Show toast notification
          if (
            (preferences === null || preferences === void 0 ? void 0 : preferences.push_enabled) !==
            false
          ) {
            showNotificationToast(latestNotification);
          }
          // Send browser push notification for high priority
          if (
            latestNotification.priority === "high" &&
            (preferences === null || preferences === void 0 ? void 0 : preferences.push_enabled)
          ) {
            sendPushNotification(latestNotification.title, {
              body: latestNotification.message,
              tag: "notification-".concat(latestNotification.id),
              data: latestNotification.data,
            });
          }
        }
      }
    },
    [notifications, preferences, disabled],
  );
  // Auto-request permission on mount if preferences allow
  (0, react_1.useEffect)(
    function () {
      if (
        !disabled &&
        (preferences === null || preferences === void 0 ? void 0 : preferences.push_enabled) &&
        Notification.permission === "default"
      ) {
        // Don't auto-request immediately, wait for user interaction
        var timer_1 = setTimeout(function () {
          requestPermission();
        }, 10000); // Wait 10 seconds
        return function () {
          return clearTimeout(timer_1);
        };
      }
    },
    [preferences, disabled],
  );
  // Handle browser focus to mark notifications as read
  (0, react_1.useEffect)(
    function () {
      var handleFocus = function () {
        if (
          hasUnreadNotifications &&
          (preferences === null || preferences === void 0 ? void 0 : preferences.push_enabled)
        ) {
          // Auto-mark recent notifications as read when user focuses the app
          var recentNotifications = getUnreadNotifications().filter(
            function (notif) {
              return new Date(notif.created_at).getTime() > Date.now() - 30000;
            }, // Last 30 seconds
          );
          recentNotifications.forEach(function (notif) {
            setTimeout(function () {
              return markAsRead(notif.id);
            }, 2000);
          });
        }
      };
      window.addEventListener("focus", handleFocus);
      return function () {
        return window.removeEventListener("focus", handleFocus);
      };
    },
    [hasUnreadNotifications, getUnreadNotifications, markAsRead, preferences],
  );
  var value = {
    // State from hook
    notifications: notifications,
    unreadCount: unreadCount,
    preferences: preferences,
    isLoading: isLoading,
    error: error,
    // Actions from hook
    markAsRead: markAsRead,
    markAllAsRead: markAllAsRead,
    deleteNotification: deleteNotification,
    updatePreferences: updatePreferences,
    refreshNotifications: refreshNotifications,
    // Utilities from hook
    getNotificationsByType: getNotificationsByType,
    getUnreadNotifications: getUnreadNotifications,
    hasUnreadNotifications: hasUnreadNotifications,
    // Global actions
    showNotificationToast: showNotificationToast,
    requestPermission: requestPermission,
    sendPushNotification: sendPushNotification,
  };
  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}
function useNotificationContext() {
  var context = (0, react_1.useContext)(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotificationContext must be used within a NotificationProvider");
  }
  return context;
}
// Utility hook for toast notifications only (lightweight)
function useNotificationToast() {
  var showSuccess = function (title, description, action) {
    sonner_1.toast.success(title, { description: description, action: action });
  };
  var showError = function (title, description) {
    sonner_1.toast.error(title, { description: description });
  };
  var showInfo = function (title, description) {
    sonner_1.toast.info(title, { description: description });
  };
  var showWarning = function (title, description) {
    sonner_1.toast.warning(title, { description: description });
  };
  return {
    showSuccess: showSuccess,
    showError: showError,
    showInfo: showInfo,
    showWarning: showWarning,
  };
}

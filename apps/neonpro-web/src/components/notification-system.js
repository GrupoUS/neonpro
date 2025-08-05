"use client";
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
var __spreadArray =
  (this && this.__spreadArray) ||
  ((to, from, pack) => {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationProvider = NotificationProvider;
exports.NotificationBell = NotificationBell;
exports.useNotifications = useNotifications;
exports.useNotificationHelpers = useNotificationHelpers;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var utils_1 = require("@/lib/utils");
var NotificationContext = (0, react_1.createContext)(null);
function NotificationProvider(_a) {
  var children = _a.children,
    _b = _a.maxNotifications,
    maxNotifications = _b === void 0 ? 5 : _b,
    _c = _a.defaultDuration,
    defaultDuration = _c === void 0 ? 5000 : _c,
    _d = _a.position,
    position = _d === void 0 ? "top-right" : _d,
    _e = _a.enableSound,
    enableSound = _e === void 0 ? false : _e;
  var _f = (0, react_1.useState)([]),
    notifications = _f[0],
    setNotifications = _f[1];
  var timeoutsRef = (0, react_1.useRef)(new Map());
  var audioRef = (0, react_1.useRef)(null);
  // Initialize audio for notifications
  (0, react_1.useEffect)(() => {
    if (enableSound && typeof window !== "undefined") {
      audioRef.current = new Audio("/notification-sound.mp3");
      audioRef.current.volume = 0.3;
    }
  }, [enableSound]);
  // Cleanup timeouts on unmount
  (0, react_1.useEffect)(
    () => () => {
      timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      timeoutsRef.current.clear();
    },
    [],
  );
  var playNotificationSound = (0, react_1.useCallback)(
    (type) => {
      if (!enableSound || !audioRef.current) return;
      try {
        // Different sounds for different types could be implemented here
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(console.warn);
      } catch (error) {
        console.warn("Failed to play notification sound:", error);
      }
    },
    [enableSound],
  );
  var addNotification = (0, react_1.useCallback)(
    (notification) => {
      var _a, _b;
      var id = "notification-"
        .concat(Date.now(), "-")
        .concat(Math.random().toString(36).substr(2, 9));
      var timestamp = Date.now();
      var duration = (_a = notification.duration) !== null && _a !== void 0 ? _a : defaultDuration;
      var newNotification = __assign(__assign({}, notification), {
        id: id,
        timestamp: timestamp,
        dismissible: (_b = notification.dismissible) !== null && _b !== void 0 ? _b : true,
      });
      setNotifications((prev) => {
        var updated = __spreadArray([newNotification], prev, true);
        // Limit the number of notifications
        if (updated.length > maxNotifications) {
          var removed = updated.slice(maxNotifications);
          removed.forEach((notif) => {
            var timeout = timeoutsRef.current.get(notif.id);
            if (timeout) {
              clearTimeout(timeout);
              timeoutsRef.current.delete(notif.id);
            }
          });
          return updated.slice(0, maxNotifications);
        }
        return updated;
      });
      // Play sound
      playNotificationSound(notification.type);
      // Auto-dismiss if duration is set
      if (duration > 0) {
        var timeout = setTimeout(() => {
          removeNotification(id);
        }, duration);
        timeoutsRef.current.set(id, timeout);
      }
      return id;
    },
    [defaultDuration, maxNotifications, playNotificationSound],
  );
  var removeNotification = (0, react_1.useCallback)((id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    var timeout = timeoutsRef.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutsRef.current.delete(id);
    }
  }, []);
  var clearAllNotifications = (0, react_1.useCallback)(() => {
    setNotifications([]);
    timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    timeoutsRef.current.clear();
  }, []);
  var markAsRead = (0, react_1.useCallback)((id) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? __assign(__assign({}, notif), { read: true }) : notif,
      ),
    );
  }, []);
  var markAllAsRead = (0, react_1.useCallback)(() => {
    setNotifications((prev) => prev.map((notif) => __assign(__assign({}, notif), { read: true })));
  }, []);
  var getUnreadCount = (0, react_1.useCallback)(
    () => notifications.filter((notif) => !notif.read).length,
    [notifications],
  );
  var contextValue = {
    notifications: notifications,
    addNotification: addNotification,
    removeNotification: removeNotification,
    clearAllNotifications: clearAllNotifications,
    markAsRead: markAsRead,
    markAllAsRead: markAllAsRead,
    getUnreadCount: getUnreadCount,
  };
  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <NotificationContainer position={position} />
    </NotificationContext.Provider>
  );
}
function NotificationContainer(_a) {
  var position = _a.position;
  var notifications = useNotifications().notifications;
  var positionClasses = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-center": "top-4 left-1/2 transform -translate-x-1/2",
    "bottom-center": "bottom-4 left-1/2 transform -translate-x-1/2",
  };
  if (notifications.length === 0) return null;
  return (
    <div
      className={(0, utils_1.cn)(
        "fixed z-50 flex flex-col gap-2 max-w-sm w-full",
        positionClasses[position],
      )}
    >
      {notifications.map((notification, index) => (
        <NotificationItem key={notification.id} notification={notification} index={index} />
      ))}
    </div>
  );
}
function NotificationItem(_a) {
  var notification = _a.notification,
    index = _a.index;
  var _b = useNotifications(),
    removeNotification = _b.removeNotification,
    markAsRead = _b.markAsRead;
  var _c = (0, react_1.useState)(false),
    isVisible = _c[0],
    setIsVisible = _c[1];
  var _d = (0, react_1.useState)(false),
    isExiting = _d[0],
    setIsExiting = _d[1];
  // Animation entrance
  (0, react_1.useEffect)(() => {
    var timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);
  var handleDismiss = (0, react_1.useCallback)(() => {
    setIsExiting(true);
    setTimeout(() => {
      removeNotification(notification.id);
    }, 200);
  }, [notification.id, removeNotification]);
  var handleClick = (0, react_1.useCallback)(() => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  }, [notification.id, notification.read, markAsRead]);
  var getIcon = () => {
    switch (notification.type) {
      case "success":
        return <lucide_react_1.CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <lucide_react_1.AlertCircle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <lucide_react_1.AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "info":
      default:
        return <lucide_react_1.Info className="h-5 w-5 text-blue-500" />;
    }
  };
  var getColorClasses = () => {
    switch (notification.type) {
      case "success":
        return "border-green-200 bg-green-50";
      case "error":
        return "border-red-200 bg-red-50";
      case "warning":
        return "border-yellow-200 bg-yellow-50";
      case "info":
      default:
        return "border-blue-200 bg-blue-50";
    }
  };
  return (
    <card_1.Card
      className={(0, utils_1.cn)(
        "transition-all duration-200 ease-in-out cursor-pointer",
        "hover:shadow-md",
        getColorClasses(),
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
        isExiting ? "translate-x-full opacity-0" : "",
        !notification.read ? "ring-2 ring-blue-200" : "",
      )}
      style={{
        transform: "translateY(".concat(index * 4, "px)"),
        zIndex: 1000 - index,
      }}
      onClick={handleClick}
    >
      <card_1.CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900">{notification.title}</h4>
                {notification.message && (
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                )}
              </div>

              {!notification.read && (
                <badge_1.Badge variant="secondary" className="ml-2 h-2 w-2 p-0 bg-blue-500" />
              )}
            </div>

            {notification.action && (
              <div className="mt-3">
                <button_1.Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    notification.action.onClick();
                  }}
                >
                  {notification.action.label}
                </button_1.Button>
              </div>
            )}
          </div>

          {notification.dismissible && (
            <button_1.Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 hover:bg-gray-200"
              onClick={(e) => {
                e.stopPropagation();
                handleDismiss();
              }}
            >
              <lucide_react_1.X className="h-4 w-4" />
            </button_1.Button>
          )}
        </div>

        <div className="text-xs text-gray-400 mt-2">
          {new Date(notification.timestamp).toLocaleTimeString()}
        </div>
      </card_1.CardContent>
    </card_1.Card>
  );
}
function NotificationBell(_a) {
  var className = _a.className,
    _b = _a.showCount,
    showCount = _b === void 0 ? true : _b;
  var _c = useNotifications(),
    notifications = _c.notifications,
    getUnreadCount = _c.getUnreadCount,
    markAllAsRead = _c.markAllAsRead;
  var _d = (0, react_1.useState)(false),
    isOpen = _d[0],
    setIsOpen = _d[1];
  var unreadCount = getUnreadCount();
  var handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      markAllAsRead();
    }
  };
  return (
    <div className="relative">
      <button_1.Button
        variant="ghost"
        size="sm"
        className={(0, utils_1.cn)("relative", className)}
        onClick={handleToggle}
      >
        <lucide_react_1.Bell className="h-5 w-5" />
        {showCount && unreadCount > 0 && (
          <badge_1.Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </badge_1.Badge>
        )}
      </button_1.Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-white border rounded-lg shadow-lg z-50">
          <div className="p-3 border-b">
            <h3 className="font-semibold">Notificações</h3>
          </div>

          {notifications.length === 0
            ? <div className="p-4 text-center text-gray-500">Nenhuma notificação</div>
            : <div className="max-h-64 overflow-y-auto">
                {notifications.slice(0, 10).map((notification) => (
                  <div
                    key={notification.id}
                    className="p-3 border-b last:border-b-0 hover:bg-gray-50"
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 mt-1">
                        {notification.type === "success" && (
                          <lucide_react_1.CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        {notification.type === "error" && (
                          <lucide_react_1.AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                        {notification.type === "warning" && (
                          <lucide_react_1.AlertTriangle className="h-4 w-4 text-yellow-500" />
                        )}
                        {notification.type === "info" && (
                          <lucide_react_1.Info className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                        {notification.message && (
                          <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>}
        </div>
      )}
    </div>
  );
}
// =====================================================================================
// HOOKS
// =====================================================================================
function useNotifications() {
  var context = (0, react_1.useContext)(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
// Convenience hooks for different notification types
function useNotificationHelpers() {
  var addNotification = useNotifications().addNotification;
  var showSuccess = (0, react_1.useCallback)(
    (title, message, options) =>
      addNotification(__assign({ type: "success", title: title, message: message }, options)),
    [addNotification],
  );
  var showError = (0, react_1.useCallback)(
    (title, message, options) =>
      addNotification(
        __assign({ type: "error", title: title, message: message, duration: 0 }, options),
      ),
    [addNotification],
  );
  var showWarning = (0, react_1.useCallback)(
    (title, message, options) =>
      addNotification(__assign({ type: "warning", title: title, message: message }, options)),
    [addNotification],
  );
  var showInfo = (0, react_1.useCallback)(
    (title, message, options) =>
      addNotification(__assign({ type: "info", title: title, message: message }, options)),
    [addNotification],
  );
  return {
    showSuccess: showSuccess,
    showError: showError,
    showWarning: showWarning,
    showInfo: showInfo,
  };
}
exports.default = NotificationProvider;

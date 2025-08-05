// =====================================================
// Authentication Hooks - Main Export Index
// Story 1.4: Session Management & Security
// =====================================================
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
exports.useDeviceManagement =
  exports.useBusinessActivityTracking =
  exports.withActivityTracking =
  exports.dispatchCustomActivity =
  exports.useSessionActivity =
  exports.useSession =
    void 0;
exports.useCompleteSessionManagement = useCompleteSessionManagement;
exports.useSessionTimeout = useSessionTimeout;
exports.useSecurityMonitoring = useSecurityMonitoring;
exports.useSessionStatistics = useSessionStatistics;
exports.SessionProvider = SessionProvider;
exports.useSessionContext = useSessionContext;
// Main Session Hook
var useSession_1 = require("./useSession");
Object.defineProperty(exports, "useSession", {
  enumerable: true,
  get: () => useSession_1.useSession,
});
// Session Activity Tracking Hook
var useSessionActivity_1 = require("./useSessionActivity");
Object.defineProperty(exports, "useSessionActivity", {
  enumerable: true,
  get: () => useSessionActivity_1.useSessionActivity,
});
// Additional activity tracking utilities
var useSessionActivity_2 = require("./useSessionActivity");
Object.defineProperty(exports, "dispatchCustomActivity", {
  enumerable: true,
  get: () => useSessionActivity_2.dispatchCustomActivity,
});
Object.defineProperty(exports, "withActivityTracking", {
  enumerable: true,
  get: () => useSessionActivity_2.withActivityTracking,
});
Object.defineProperty(exports, "useBusinessActivityTracking", {
  enumerable: true,
  get: () => useSessionActivity_2.useBusinessActivityTracking,
});
// Device Management Hook
var useDeviceManagement_1 = require("./useDeviceManagement");
Object.defineProperty(exports, "useDeviceManagement", {
  enumerable: true,
  get: () => useDeviceManagement_1.useDeviceManagement,
});
// =====================================================
// COMBINED HOOKS FOR CONVENIENCE
// =====================================================
var useSession_2 = require("./useSession");
var useSessionActivity_3 = require("./useSessionActivity");
var useDeviceManagement_2 = require("./useDeviceManagement");
/**
 * Combined hook that provides all session-related functionality
 * Includes session management, activity tracking, and device management
 */
function useCompleteSessionManagement(userId) {
  var _a, _b;
  var session = (0, useSession_2.useSession)({
    autoRefresh: true,
    refreshInterval: 60000,
    redirectOnExpiry: "/login",
    showWarnings: true,
    trackActivity: true,
  });
  var activity = (0, useSessionActivity_3.useSessionActivity)({
    trackPageViews: true,
    trackClicks: true,
    trackFormSubmissions: true,
    trackScrolling: false,
    trackIdleTime: true,
    idleThresholdMs: 5 * 60 * 1000,
    debounceMs: 1000,
  });
  var devices = (0, useDeviceManagement_2.useDeviceManagement)(
    userId || ((_a = session.user) === null || _a === void 0 ? void 0 : _a.id),
    {
      autoRegister: true,
      showNotifications: true,
      trackDeviceChanges: true,
      validateOnMount: true,
    },
  );
  return {
    session: session,
    activity: activity,
    devices: devices,
    // Combined state
    isFullyAuthenticated: session.isAuthenticated && devices.isCurrentDeviceTrusted,
    securityLevel: {
      sessionValid: session.isAuthenticated,
      deviceTrusted: devices.isCurrentDeviceTrusted,
      securityScore:
        ((_b = session.securityScore) === null || _b === void 0 ? void 0 : _b.score) || 0,
      riskLevel: devices.deviceRiskLevel,
    },
    // Combined actions
    authenticateWithDevice: function (credentials, deviceInfo) {
      return __awaiter(this, void 0, void 0, function () {
        var loginSuccess;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, session.login(credentials, deviceInfo)];
            case 1:
              loginSuccess = _a.sent();
              if (!(loginSuccess && !devices.isCurrentDeviceTrusted)) return [3 /*break*/, 3];
              return [4 /*yield*/, devices.registerDevice()];
            case 2:
              _a.sent();
              _a.label = 3;
            case 3:
              return [2 /*return*/, loginSuccess];
          }
        });
      });
    },
    secureLogout: function () {
      return __awaiter(this, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                session.logout(),
                // Device data is automatically handled by the session system
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    },
  };
}
// =====================================================
// UTILITY HOOKS
// =====================================================
/**
 * Hook for session timeout warnings
 */
function useSessionTimeout() {
  var _a = (0, useSession_2.useSession)(),
    timeUntilExpiry = _a.timeUntilExpiry,
    isExpiringSoon = _a.isExpiringSoon,
    extendSession = _a.extendSession;
  return {
    timeUntilExpiry: timeUntilExpiry,
    isExpiringSoon: isExpiringSoon,
    extendSession: extendSession,
    // Formatted time remaining
    timeRemainingFormatted: timeUntilExpiry
      ? {
          minutes: Math.floor(timeUntilExpiry / (1000 * 60)),
          seconds: Math.floor((timeUntilExpiry % (1000 * 60)) / 1000),
        }
      : null,
  };
}
/**
 * Hook for security monitoring
 */
function useSecurityMonitoring() {
  var _a = (0, useSession_2.useSession)(),
    securityScore = _a.securityScore,
    session = _a.session;
  var _b = (0, useDeviceManagement_2.useDeviceManagement)(
      session === null || session === void 0 ? void 0 : session.userId,
    ),
    deviceRiskLevel = _b.deviceRiskLevel,
    deviceValidation = _b.deviceValidation;
  var _c = (0, useSessionActivity_3.useSessionActivity)(),
    isIdle = _c.isIdle,
    lastActivity = _c.lastActivity;
  return {
    securityScore:
      (securityScore === null || securityScore === void 0 ? void 0 : securityScore.score) || 0,
    securityFactors:
      (securityScore === null || securityScore === void 0 ? void 0 : securityScore.factors) || [],
    deviceRiskLevel: deviceRiskLevel,
    isDeviceTrusted:
      (deviceValidation === null || deviceValidation === void 0
        ? void 0
        : deviceValidation.isTrusted) || false,
    isUserIdle: isIdle,
    lastActivity: lastActivity,
    // Overall security status
    securityStatus: (() => {
      var score =
        (securityScore === null || securityScore === void 0 ? void 0 : securityScore.score) || 0;
      var deviceTrusted =
        (deviceValidation === null || deviceValidation === void 0
          ? void 0
          : deviceValidation.isTrusted) || false;
      if (score >= 80 && deviceTrusted) return "secure";
      if (score >= 60 && deviceTrusted) return "moderate";
      if (score >= 40) return "warning";
      return "critical";
    })(),
  };
}
/**
 * Hook for session statistics
 */
function useSessionStatistics() {
  var _a = (0, useSession_2.useSession)(),
    sessionStats = _a.sessionStats,
    session = _a.session;
  var getActivityHistory = (0, useSessionActivity_3.useSessionActivity)().getActivityHistory;
  var deviceStats = (0, useDeviceManagement_2.useDeviceManagement)(
    session === null || session === void 0 ? void 0 : session.userId,
  ).deviceStats;
  return {
    sessionDuration:
      (sessionStats === null || sessionStats === void 0 ? void 0 : sessionStats.duration) || 0,
    activitiesCount:
      (sessionStats === null || sessionStats === void 0 ? void 0 : sessionStats.activitiesCount) ||
      0,
    lastActivity:
      sessionStats === null || sessionStats === void 0 ? void 0 : sessionStats.lastActivity,
    activityHistory: getActivityHistory(),
    deviceStats: deviceStats,
    // Formatted statistics
    formattedStats: {
      sessionDuration: sessionStats
        ? {
            hours: Math.floor(sessionStats.duration / (1000 * 60 * 60)),
            minutes: Math.floor((sessionStats.duration % (1000 * 60 * 60)) / (1000 * 60)),
          }
        : null,
      activitiesPerHour:
        sessionStats && sessionStats.duration > 0
          ? Math.round((sessionStats.activitiesCount / sessionStats.duration) * (1000 * 60 * 60))
          : 0,
    },
  };
}
// =====================================================
// CONTEXT PROVIDERS (Optional)
// =====================================================
var react_1 = require("react");
// Session Context
var SessionContext = (0, react_1.createContext)(null);
function SessionProvider(_a) {
  var children = _a.children,
    userId = _a.userId;
  var sessionManagement = useCompleteSessionManagement(userId);
  return (value =
    { sessionManagement: sessionManagement } > { children: children } < /.;>CPSdeeeiinnooorrssttvx);
}
function useSessionContext() {
  var context = (0, react_1.useContext)(SessionContext);
  if (!context) {
    throw new Error("useSessionContext must be used within a SessionProvider");
  }
  return context;
}
// =====================================================
// EXPORT ALL
// =====================================================
exports.default = {
  useSession: useSession_2.useSession,
  useSessionActivity: useSessionActivity_3.useSessionActivity,
  useDeviceManagement: useDeviceManagement_2.useDeviceManagement,
  useCompleteSessionManagement: useCompleteSessionManagement,
  useSessionTimeout: useSessionTimeout,
  useSecurityMonitoring: useSecurityMonitoring,
  useSessionStatistics: useSessionStatistics,
  SessionProvider: SessionProvider,
  useSessionContext: useSessionContext,
};

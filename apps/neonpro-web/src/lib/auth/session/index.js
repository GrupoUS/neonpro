/**
 * Session Management System - Main Export Index
 *
 * This file serves as the main entry point for the NeonPro session management system,
 * providing a unified interface for all session-related functionality including
 * authentication, device management, security monitoring, and data cleanup.
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 * @created 2024
 */
var __extends =
  (this && this.__extends) ||
  (() => {
    var extendStatics = (d, b) => {
      extendStatics =
        Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array &&
          ((d, b) => {
            d.__proto__ = b;
          })) ||
        ((d, b) => {
          for (var p in b) if (Object.hasOwn(b, p)) d[p] = b[p];
        });
      return extendStatics(d, b);
    };
    return (d, b) => {
      if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : ((__.prototype = b.prototype), new __());
    };
  })();
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: () => m[k],
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __exportStar =
  (this && this.__exportStar) ||
  ((m, exports) => {
    for (var p in m)
      if (p !== "default" && !Object.hasOwn(exports, p)) __createBinding(exports, m, p);
  });
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
exports.DevUtils =
  exports.SESSION_SYSTEM_VERSION =
  exports.SESSION_CONSTANTS =
  exports.SecurityError =
  exports.DeviceError =
  exports.SessionError =
  exports.SessionValidators =
  exports.sessionManager =
  exports.SessionManagementFactory =
  exports.API_ENDPOINTS =
  exports.defaultSessionConfig =
  exports.ManagementComponents =
  exports.StatusComponents =
  exports.SessionComponents =
  exports.SecurityDashboard =
  exports.DeviceManagement =
  exports.SessionWarning =
  exports.SessionStatus =
  exports.useDataCleanup =
  exports.useNotifications =
  exports.useSecurityMonitoring =
  exports.useDeviceManagement =
  exports.useSession =
  exports.DataCleanupService =
  exports.NotificationService =
  exports.SecurityEventLogger =
  exports.DeviceManager =
  exports.SessionManager =
  exports.UnifiedSessionSystem =
    void 0;
// Core Session Management
var UnifiedSessionSystem_1 = require("./UnifiedSessionSystem");
Object.defineProperty(exports, "UnifiedSessionSystem", {
  enumerable: true,
  get: () => UnifiedSessionSystem_1.UnifiedSessionSystem,
});
var SessionManager_1 = require("./SessionManager");
Object.defineProperty(exports, "SessionManager", {
  enumerable: true,
  get: () => SessionManager_1.SessionManager,
});
var DeviceManager_1 = require("./DeviceManager");
Object.defineProperty(exports, "DeviceManager", {
  enumerable: true,
  get: () => DeviceManager_1.DeviceManager,
});
var SecurityEventLogger_1 = require("./SecurityEventLogger");
Object.defineProperty(exports, "SecurityEventLogger", {
  enumerable: true,
  get: () => SecurityEventLogger_1.SecurityEventLogger,
});
var NotificationService_1 = require("./NotificationService");
Object.defineProperty(exports, "NotificationService", {
  enumerable: true,
  get: () => NotificationService_1.NotificationService,
});
var DataCleanupService_1 = require("./DataCleanupService");
Object.defineProperty(exports, "DataCleanupService", {
  enumerable: true,
  get: () => DataCleanupService_1.DataCleanupService,
});
// Configuration and Types
__exportStar(require("./config"), exports);
__exportStar(require("./types"), exports);
__exportStar(require("./utils"), exports);
// React Hooks
var useSession_1 = require("./hooks/useSession");
Object.defineProperty(exports, "useSession", {
  enumerable: true,
  get: () => useSession_1.useSession,
});
var useDeviceManagement_1 = require("./hooks/useDeviceManagement");
Object.defineProperty(exports, "useDeviceManagement", {
  enumerable: true,
  get: () => useDeviceManagement_1.useDeviceManagement,
});
var useSecurityMonitoring_1 = require("./hooks/useSecurityMonitoring");
Object.defineProperty(exports, "useSecurityMonitoring", {
  enumerable: true,
  get: () => useSecurityMonitoring_1.useSecurityMonitoring,
});
var useNotifications_1 = require("./hooks/useNotifications");
Object.defineProperty(exports, "useNotifications", {
  enumerable: true,
  get: () => useNotifications_1.useNotifications,
});
var useDataCleanup_1 = require("./hooks/useDataCleanup");
Object.defineProperty(exports, "useDataCleanup", {
  enumerable: true,
  get: () => useDataCleanup_1.useDataCleanup,
});
// React Components
var SessionStatus_1 = require("../../../components/auth/session/SessionStatus");
Object.defineProperty(exports, "SessionStatus", {
  enumerable: true,
  get: () => SessionStatus_1.SessionStatus,
});
var SessionWarning_1 = require("../../../components/auth/session/SessionWarning");
Object.defineProperty(exports, "SessionWarning", {
  enumerable: true,
  get: () => SessionWarning_1.SessionWarning,
});
var DeviceManagement_1 = require("../../../components/auth/session/DeviceManagement");
Object.defineProperty(exports, "DeviceManagement", {
  enumerable: true,
  get: () => DeviceManagement_1.DeviceManagement,
});
var SecurityDashboard_1 = require("../../../components/auth/session/SecurityDashboard");
Object.defineProperty(exports, "SecurityDashboard", {
  enumerable: true,
  get: () => SecurityDashboard_1.SecurityDashboard,
});
// Component Collections
var session_1 = require("../../../components/auth/session");
Object.defineProperty(exports, "SessionComponents", {
  enumerable: true,
  get: () => session_1.SessionComponents,
});
Object.defineProperty(exports, "StatusComponents", {
  enumerable: true,
  get: () => session_1.StatusComponents,
});
Object.defineProperty(exports, "ManagementComponents", {
  enumerable: true,
  get: () => session_1.ManagementComponents,
});
Object.defineProperty(exports, "defaultSessionConfig", {
  enumerable: true,
  get: () => session_1.defaultSessionConfig,
});
// API Utilities
exports.API_ENDPOINTS = {
  session: "/api/auth/session",
  devices: "/api/auth/devices",
  security: "/api/auth/security",
  notifications: "/api/auth/notifications",
  cleanup: "/api/auth/cleanup",
};
// Session Management Factory
var SessionManagementFactory = /** @class */ (() => {
  function SessionManagementFactory() {}
  /**
   * Get or create the singleton instance of UnifiedSessionSystem
   */
  SessionManagementFactory.getInstance = function () {
    if (!this.instance) {
      this.instance = new UnifiedSessionSystem();
    }
    return this.instance;
  };
  /**
   * Reset the singleton instance (useful for testing)
   */
  SessionManagementFactory.resetInstance = function () {
    this.instance = null;
  };
  /**
   * Create a new instance with custom configuration
   */
  SessionManagementFactory.createInstance = (config) => new UnifiedSessionSystem(config);
  SessionManagementFactory.instance = null;
  return SessionManagementFactory;
})();
exports.SessionManagementFactory = SessionManagementFactory;
// Convenience exports for common operations
exports.sessionManager = SessionManagementFactory.getInstance();
// Type guards and validators
exports.SessionValidators = {
  isValidSession: (session) =>
    session &&
    typeof session.id === "string" &&
    typeof session.userId === "string" &&
    typeof session.status === "string" &&
    ["active", "expired", "terminated"].includes(session.status),
  isValidDevice: (device) =>
    device &&
    typeof device.id === "string" &&
    typeof device.fingerprint === "string" &&
    typeof device.trusted === "boolean",
  isValidSecurityEvent: (event) =>
    event &&
    typeof event.id === "string" &&
    typeof event.type === "string" &&
    typeof event.severity === "string" &&
    ["low", "medium", "high", "critical"].includes(event.severity),
};
// Error classes
var SessionError = /** @class */ ((_super) => {
  __extends(SessionError, _super);
  function SessionError(message, code, statusCode) {
    if (statusCode === void 0) {
      statusCode = 500;
    }
    var _this = _super.call(this, message) || this;
    _this.code = code;
    _this.statusCode = statusCode;
    _this.name = "SessionError";
    return _this;
  }
  return SessionError;
})(Error);
exports.SessionError = SessionError;
var DeviceError = /** @class */ ((_super) => {
  __extends(DeviceError, _super);
  function DeviceError(message, code, statusCode) {
    if (statusCode === void 0) {
      statusCode = 400;
    }
    var _this = _super.call(this, message) || this;
    _this.code = code;
    _this.statusCode = statusCode;
    _this.name = "DeviceError";
    return _this;
  }
  return DeviceError;
})(Error);
exports.DeviceError = DeviceError;
var SecurityError = /** @class */ ((_super) => {
  __extends(SecurityError, _super);
  function SecurityError(message, code, statusCode) {
    if (statusCode === void 0) {
      statusCode = 403;
    }
    var _this = _super.call(this, message) || this;
    _this.code = code;
    _this.statusCode = statusCode;
    _this.name = "SecurityError";
    return _this;
  }
  return SecurityError;
})(Error);
exports.SecurityError = SecurityError;
// Constants
exports.SESSION_CONSTANTS = {
  DEFAULT_SESSION_DURATION: 24 * 60 * 60 * 1000, // 24 hours
  MAX_CONCURRENT_SESSIONS: 5,
  DEVICE_TRUST_DURATION: 30 * 24 * 60 * 60 * 1000, // 30 days
  SECURITY_EVENT_RETENTION: 90 * 24 * 60 * 60 * 1000, // 90 days
  NOTIFICATION_RETENTION: 30 * 24 * 60 * 60 * 1000, // 30 days
  CLEANUP_INTERVAL: 24 * 60 * 60 * 1000, // 24 hours
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  PASSWORD_MIN_LENGTH: 8,
  SESSION_REFRESH_THRESHOLD: 60 * 60 * 1000, // 1 hour
  DEVICE_FINGERPRINT_ALGORITHM: "sha256",
};
// Version information
exports.SESSION_SYSTEM_VERSION = {
  major: 1,
  minor: 0,
  patch: 0,
  build: Date.now(),
  toString: () =>
    ""
      .concat(exports.SESSION_SYSTEM_VERSION.major, ".")
      .concat(exports.SESSION_SYSTEM_VERSION.minor, ".")
      .concat(exports.SESSION_SYSTEM_VERSION.patch),
};
// Development utilities
exports.DevUtils = {
  /**
   * Enable debug mode for session management
   */
  enableDebugMode: () => {
    if (typeof window !== "undefined") {
      window.__NEONPRO_SESSION_DEBUG__ = true;
    }
  },
  /**
   * Disable debug mode
   */
  disableDebugMode: () => {
    if (typeof window !== "undefined") {
      delete window.__NEONPRO_SESSION_DEBUG__;
    }
  },
  /**
   * Get current session state for debugging
   */
  getDebugState: () =>
    __awaiter(void 0, void 0, void 0, function () {
      var session;
      var _a;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            session = SessionManagementFactory.getInstance();
            _a = {
              version: exports.SESSION_SYSTEM_VERSION.toString(),
            };
            return [4 /*yield*/, session.getCurrentSession()];
          case 1:
            _a.currentSession = _b.sent();
            return [4 /*yield*/, session.getDevices()];
          case 2:
            _a.deviceCount = _b.sent().length;
            return [4 /*yield*/, session.getSecurityEvents({ limit: 5 })];
          case 3:
            return [2 /*return*/, ((_a.recentEvents = _b.sent()), _a)];
        }
      });
    }),
};
// Export default instance for convenience
exports.default = exports.sessionManager;

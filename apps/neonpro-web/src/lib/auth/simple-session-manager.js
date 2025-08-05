/**
 * Simplified and Production-Ready Session Manager
 * Optimized for Clerk integration and healthcare compliance
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
exports.sessionManager = exports.ClerkSessionManager = void 0;
var server_1 = require("@clerk/nextjs/server");
var clerk_config_1 = require("./clerk-config");
var ClerkSessionManager = /** @class */ (() => {
  function ClerkSessionManager(options) {
    if (options === void 0) {
      options = {};
    }
    var _a, _b;
    this.sessionStore = new Map();
    this.options = {
      maxInactiveTime: options.maxInactiveTime || clerk_config_1.clerkConfig.sessionTimeout,
      trackDevices: (_a = options.trackDevices) !== null && _a !== void 0 ? _a : true,
      enforceConcurrentLimits:
        (_b = options.enforceConcurrentLimits) !== null && _b !== void 0 ? _b : true,
    };
  }
  ClerkSessionManager.getInstance = (options) => {
    if (!ClerkSessionManager.instance) {
      ClerkSessionManager.instance = new ClerkSessionManager(options);
    }
    return ClerkSessionManager.instance;
  };
  /**
   * Get current session information
   */
  ClerkSessionManager.prototype.getCurrentSession = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a, userId, sessionId, user, sessionData, error_1;
      var _b, _c;
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            _d.trys.push([0, 2, , 3]);
            (_a = (0, server_1.auth)()), (userId = _a.userId), (sessionId = _a.sessionId);
            if (!userId || !sessionId) {
              return [2 /*return*/, null];
            }
            return [4 /*yield*/, (0, server_1.currentUser)()];
          case 1:
            user = _d.sent();
            sessionData = {
              userId: userId,
              sessionId: sessionId,
              lastActivity: Date.now(),
              roles:
                ((_b = user === null || user === void 0 ? void 0 : user.publicMetadata) === null ||
                _b === void 0
                  ? void 0
                  : _b.roles) || [],
              permissions:
                ((_c = user === null || user === void 0 ? void 0 : user.publicMetadata) === null ||
                _c === void 0
                  ? void 0
                  : _c.permissions) || [],
            };
            this.sessionStore.set(sessionId, sessionData);
            return [2 /*return*/, sessionData];
          case 2:
            error_1 = _d.sent();
            console.error("Failed to get current session:", error_1);
            return [2 /*return*/, null];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Update session activity timestamp
   */
  ClerkSessionManager.prototype.updateSessionActivity = function (sessionId) {
    return __awaiter(this, void 0, void 0, function () {
      var session;
      return __generator(this, function (_a) {
        try {
          session = this.sessionStore.get(sessionId);
          if (session) {
            session.lastActivity = Date.now();
            this.sessionStore.set(sessionId, session);
          }
        } catch (error) {
          console.error("Failed to update session activity:", error);
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Check if session is valid and active
   */
  ClerkSessionManager.prototype.isSessionValid = function (sessionId) {
    var session = this.sessionStore.get(sessionId);
    if (!session) return false;
    var now = Date.now();
    var timeSinceActivity = now - session.lastActivity;
    return timeSinceActivity < this.options.maxInactiveTime;
  };
  /**
   * Get active sessions for a user
   */
  ClerkSessionManager.prototype.getUserActiveSessions = function (userId) {
    return Array.from(this.sessionStore.values()).filter(
      (session) => session.userId === userId && this.isSessionValid(session.sessionId),
    );
  };
  /**
   * Enforce concurrent session limits
   */
  ClerkSessionManager.prototype.enforceConcurrentSessionLimits = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var activeSessions, sortedSessions, sessionsToRemove, _i, sessionsToRemove_1, session;
      return __generator(this, function (_a) {
        if (!this.options.enforceConcurrentLimits) return [2 /*return*/, true];
        activeSessions = this.getUserActiveSessions(userId);
        if (activeSessions.length > clerk_config_1.clerkConfig.maxConcurrentSessions) {
          sortedSessions = activeSessions.sort((a, b) => a.lastActivity - b.lastActivity);
          sessionsToRemove = sortedSessions.slice(
            0,
            activeSessions.length - clerk_config_1.clerkConfig.maxConcurrentSessions,
          );
          for (
            _i = 0, sessionsToRemove_1 = sessionsToRemove;
            _i < sessionsToRemove_1.length;
            _i++
          ) {
            session = sessionsToRemove_1[_i];
            this.sessionStore.delete(session.sessionId);
          }
          return [2 /*return*/, false]; // Indicates sessions were terminated
        }
        return [2 /*return*/, true];
      });
    });
  };
  /**
   * Clean up expired sessions
   */
  ClerkSessionManager.prototype.cleanupExpiredSessions = function () {
    var removedCount = 0;
    var now = Date.now();
    for (var _i = 0, _a = this.sessionStore.entries(); _i < _a.length; _i++) {
      var _b = _a[_i],
        sessionId = _b[0],
        session = _b[1];
      var timeSinceActivity = now - session.lastActivity;
      if (timeSinceActivity > this.options.maxInactiveTime) {
        this.sessionStore.delete(sessionId);
        removedCount++;
      }
    }
    return removedCount;
  };
  /**
   * Get session statistics
   */
  ClerkSessionManager.prototype.getSessionStats = function () {
    var now = Date.now();
    var activeSessions = Array.from(this.sessionStore.values()).filter((session) =>
      this.isSessionValid(session.sessionId),
    );
    return {
      totalSessions: this.sessionStore.size,
      activeSessions: activeSessions.length,
      expiredSessions: this.sessionStore.size - activeSessions.length,
      uniqueUsers: new Set(activeSessions.map((s) => s.userId)).size,
      lastCleanup: now,
    };
  };
  /**
   * Check user permissions
   */
  ClerkSessionManager.prototype.hasPermission = function (sessionId, permission) {
    var _a;
    var session = this.sessionStore.get(sessionId);
    if (!session || !this.isSessionValid(sessionId)) return false;
    return (
      ((_a = session.permissions) === null || _a === void 0 ? void 0 : _a.includes(permission)) ||
      false
    );
  };
  /**
   * Check user roles
   */
  ClerkSessionManager.prototype.hasRole = function (sessionId, role) {
    var _a;
    var session = this.sessionStore.get(sessionId);
    if (!session || !this.isSessionValid(sessionId)) return false;
    return ((_a = session.roles) === null || _a === void 0 ? void 0 : _a.includes(role)) || false;
  };
  return ClerkSessionManager;
})();
exports.ClerkSessionManager = ClerkSessionManager;
// Export singleton instance
exports.sessionManager = ClerkSessionManager.getInstance();

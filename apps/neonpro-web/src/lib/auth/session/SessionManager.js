/**
 * Session Manager - Core Session Operations
 *
 * Handles direct session management operations including creation, validation,
 * updates, termination, and cleanup. Works with Supabase for persistence.
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 * @created 2024
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
exports.sessionManager = exports.SessionManager = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var utils_1 = require("./utils");
/**
 * Session Manager Class
 *
 * Core session management operations:
 * - Session creation with configurable timeouts
 * - Session validation and token verification
 * - Activity tracking and session extension
 * - Session termination and cleanup
 * - Concurrent session management
 * - Session metrics and analytics
 */
var SessionManager = /** @class */ (() => {
  function SessionManager(config) {
    this.config = config;
    this.supabase = (0, supabase_js_1.createClient)(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );
  }
  /**
   * Create a new session
   */
  SessionManager.prototype.createSession = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var concurrentCheck, token, sessionId, sessionData, _a, data, error, session, error_1;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            // Validate input
            if (!(0, utils_1.validateUUID)(request.userId)) {
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
            if (!(0, utils_1.validateUUID)(request.deviceId)) {
              return [
                2 /*return*/,
                {
                  success: false,
                  error: {
                    code: "INVALID_DEVICE_ID",
                    message: "Invalid device ID format",
                  },
                  timestamp: new Date().toISOString(),
                },
              ];
            }
            return [4 /*yield*/, this.checkConcurrentSessionLimit(request.userId)];
          case 1:
            concurrentCheck = _b.sent();
            if (!concurrentCheck.success) {
              return [2 /*return*/, concurrentCheck];
            }
            token = (0, utils_1.generateSessionToken)();
            sessionId = crypto.randomUUID();
            sessionData = (0, utils_1.removeUndefined)({
              id: sessionId,
              user_id: request.userId,
              device_id: request.deviceId,
              token: token,
              ip_address: request.ipAddress,
              user_agent: request.userAgent,
              location: request.location ? JSON.stringify(request.location) : null,
              expires_at: request.expiresAt,
              last_activity: new Date().toISOString(),
              metadata: request.metadata ? JSON.stringify(request.metadata) : null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            return [
              4 /*yield*/,
              this.supabase.from("sessions").insert(sessionData).select().single(),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              return [
                2 /*return*/,
                {
                  success: false,
                  error: {
                    code: "SESSION_CREATION_FAILED",
                    message: "Failed to create session",
                    details: { error: error.message },
                  },
                  timestamp: new Date().toISOString(),
                },
              ];
            }
            session = {
              id: data.id,
              userId: data.user_id,
              deviceId: data.device_id,
              token: data.token,
              ipAddress: data.ip_address,
              userAgent: data.user_agent,
              location: data.location ? JSON.parse(data.location) : undefined,
              expiresAt: data.expires_at,
              lastActivity: data.last_activity,
              metadata: data.metadata ? JSON.parse(data.metadata) : undefined,
              createdAt: data.created_at,
              updatedAt: data.updated_at,
              terminatedAt: data.terminated_at,
              terminationReason: data.termination_reason,
            };
            return [
              2 /*return*/,
              {
                success: true,
                data: session,
                timestamp: new Date().toISOString(),
              },
            ];
          case 3:
            error_1 = _b.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error: {
                  code: "SESSION_CREATION_ERROR",
                  message: "Internal error creating session",
                  details: { error: error_1 instanceof Error ? error_1.message : "Unknown error" },
                },
                timestamp: new Date().toISOString(),
              },
            ];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Validate session by token
   */
  SessionManager.prototype.validateSession = function (token) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, now, expiresAt, session, error_2;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 4, , 5]);
            if (!token || typeof token !== "string") {
              return [
                2 /*return*/,
                {
                  success: false,
                  error: {
                    code: "INVALID_TOKEN",
                    message: "Invalid or missing token",
                  },
                  timestamp: new Date().toISOString(),
                },
              ];
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("sessions")
                .select("*")
                .eq("token", token)
                .is("terminated_at", null)
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
                    code: "SESSION_NOT_FOUND",
                    message: "Session not found or terminated",
                  },
                  timestamp: new Date().toISOString(),
                },
              ];
            }
            now = new Date();
            expiresAt = new Date(data.expires_at);
            if (!(now > expiresAt)) return [3 /*break*/, 3];
            // Auto-terminate expired session
            return [4 /*yield*/, this.terminateSession(data.id, "expired")];
          case 2:
            // Auto-terminate expired session
            _b.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error: {
                  code: "SESSION_EXPIRED",
                  message: "Session has expired",
                },
                timestamp: new Date().toISOString(),
              },
            ];
          case 3:
            session = {
              id: data.id,
              userId: data.user_id,
              deviceId: data.device_id,
              token: data.token,
              ipAddress: data.ip_address,
              userAgent: data.user_agent,
              location: data.location ? JSON.parse(data.location) : undefined,
              expiresAt: data.expires_at,
              lastActivity: data.last_activity,
              metadata: data.metadata ? JSON.parse(data.metadata) : undefined,
              createdAt: data.created_at,
              updatedAt: data.updated_at,
              terminatedAt: data.terminated_at,
              terminationReason: data.termination_reason,
            };
            return [
              2 /*return*/,
              {
                success: true,
                data: session,
                timestamp: new Date().toISOString(),
              },
            ];
          case 4:
            error_2 = _b.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error: {
                  code: "SESSION_VALIDATION_ERROR",
                  message: "Error validating session",
                  details: { error: error_2 instanceof Error ? error_2.message : "Unknown error" },
                },
                timestamp: new Date().toISOString(),
              },
            ];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get session by ID
   */
  SessionManager.prototype.getSession = function (sessionId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, session, error_3;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            if (!(0, utils_1.validateUUID)(sessionId)) {
              return [
                2 /*return*/,
                {
                  success: false,
                  error: {
                    code: "INVALID_SESSION_ID",
                    message: "Invalid session ID format",
                  },
                  timestamp: new Date().toISOString(),
                },
              ];
            }
            return [
              4 /*yield*/,
              this.supabase.from("sessions").select("*").eq("id", sessionId).single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error || !data) {
              return [
                2 /*return*/,
                {
                  success: false,
                  error: {
                    code: "SESSION_NOT_FOUND",
                    message: "Session not found",
                  },
                  timestamp: new Date().toISOString(),
                },
              ];
            }
            session = {
              id: data.id,
              userId: data.user_id,
              deviceId: data.device_id,
              token: data.token,
              ipAddress: data.ip_address,
              userAgent: data.user_agent,
              location: data.location ? JSON.parse(data.location) : undefined,
              expiresAt: data.expires_at,
              lastActivity: data.last_activity,
              metadata: data.metadata ? JSON.parse(data.metadata) : undefined,
              createdAt: data.created_at,
              updatedAt: data.updated_at,
              terminatedAt: data.terminated_at,
              terminationReason: data.termination_reason,
            };
            return [
              2 /*return*/,
              {
                success: true,
                data: session,
                timestamp: new Date().toISOString(),
              },
            ];
          case 2:
            error_3 = _b.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error: {
                  code: "GET_SESSION_ERROR",
                  message: "Error retrieving session",
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
   * Update session activity
   */
  SessionManager.prototype.updateActivity = function (sessionId, activity) {
    return __awaiter(this, void 0, void 0, function () {
      var updateData, _a, data, error, session, error_4;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            if (!(0, utils_1.validateUUID)(sessionId)) {
              return [
                2 /*return*/,
                {
                  success: false,
                  error: {
                    code: "INVALID_SESSION_ID",
                    message: "Invalid session ID format",
                  },
                  timestamp: new Date().toISOString(),
                },
              ];
            }
            updateData = (0, utils_1.removeUndefined)({
              last_activity: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              ip_address: activity === null || activity === void 0 ? void 0 : activity.ipAddress,
              location: (activity === null || activity === void 0 ? void 0 : activity.location)
                ? JSON.stringify(activity.location)
                : undefined,
              metadata: (activity === null || activity === void 0 ? void 0 : activity.metadata)
                ? JSON.stringify(activity.metadata)
                : undefined,
            });
            return [
              4 /*yield*/,
              this.supabase
                .from("sessions")
                .update(updateData)
                .eq("id", sessionId)
                .is("terminated_at", null)
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
                    code: "SESSION_UPDATE_FAILED",
                    message: "Failed to update session activity",
                  },
                  timestamp: new Date().toISOString(),
                },
              ];
            }
            session = {
              id: data.id,
              userId: data.user_id,
              deviceId: data.device_id,
              token: data.token,
              ipAddress: data.ip_address,
              userAgent: data.user_agent,
              location: data.location ? JSON.parse(data.location) : undefined,
              expiresAt: data.expires_at,
              lastActivity: data.last_activity,
              metadata: data.metadata ? JSON.parse(data.metadata) : undefined,
              createdAt: data.created_at,
              updatedAt: data.updated_at,
              terminatedAt: data.terminated_at,
              terminationReason: data.termination_reason,
            };
            return [
              2 /*return*/,
              {
                success: true,
                data: session,
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
                  code: "ACTIVITY_UPDATE_ERROR",
                  message: "Error updating session activity",
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
   * Extend session expiration time
   */
  SessionManager.prototype.extendSession = function (sessionId, newExpiresAt) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, session, error_5;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            if (!(0, utils_1.validateUUID)(sessionId)) {
              return [
                2 /*return*/,
                {
                  success: false,
                  error: {
                    code: "INVALID_SESSION_ID",
                    message: "Invalid session ID format",
                  },
                  timestamp: new Date().toISOString(),
                },
              ];
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("sessions")
                .update({
                  expires_at: newExpiresAt,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", sessionId)
                .is("terminated_at", null)
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
                    code: "SESSION_EXTENSION_FAILED",
                    message: "Failed to extend session",
                  },
                  timestamp: new Date().toISOString(),
                },
              ];
            }
            session = {
              id: data.id,
              userId: data.user_id,
              deviceId: data.device_id,
              token: data.token,
              ipAddress: data.ip_address,
              userAgent: data.user_agent,
              location: data.location ? JSON.parse(data.location) : undefined,
              expiresAt: data.expires_at,
              lastActivity: data.last_activity,
              metadata: data.metadata ? JSON.parse(data.metadata) : undefined,
              createdAt: data.created_at,
              updatedAt: data.updated_at,
              terminatedAt: data.terminated_at,
              terminationReason: data.termination_reason,
            };
            return [
              2 /*return*/,
              {
                success: true,
                data: session,
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
                  code: "SESSION_EXTENSION_ERROR",
                  message: "Error extending session",
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
   * Terminate session
   */
  SessionManager.prototype.terminateSession = function (sessionId_1) {
    return __awaiter(this, arguments, void 0, function (sessionId, reason) {
      var _a, data, error, session, error_6;
      if (reason === void 0) {
        reason = "user_logout";
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            if (!(0, utils_1.validateUUID)(sessionId)) {
              return [
                2 /*return*/,
                {
                  success: false,
                  error: {
                    code: "INVALID_SESSION_ID",
                    message: "Invalid session ID format",
                  },
                  timestamp: new Date().toISOString(),
                },
              ];
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("sessions")
                .update({
                  terminated_at: new Date().toISOString(),
                  termination_reason: reason,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", sessionId)
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
                    code: "SESSION_TERMINATION_FAILED",
                    message: "Failed to terminate session",
                  },
                  timestamp: new Date().toISOString(),
                },
              ];
            }
            session = {
              id: data.id,
              userId: data.user_id,
              deviceId: data.device_id,
              token: data.token,
              ipAddress: data.ip_address,
              userAgent: data.user_agent,
              location: data.location ? JSON.parse(data.location) : undefined,
              expiresAt: data.expires_at,
              lastActivity: data.last_activity,
              metadata: data.metadata ? JSON.parse(data.metadata) : undefined,
              createdAt: data.created_at,
              updatedAt: data.updated_at,
              terminatedAt: data.terminated_at,
              terminationReason: data.termination_reason,
            };
            return [
              2 /*return*/,
              {
                success: true,
                data: session,
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
                  code: "SESSION_TERMINATION_ERROR",
                  message: "Error terminating session",
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
   * Get all active sessions for a user
   */
  SessionManager.prototype.getUserSessions = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, sessions, error_7;
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
                .from("sessions")
                .select("*")
                .eq("user_id", userId)
                .is("terminated_at", null)
                .order("created_at", { ascending: false }),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              return [
                2 /*return*/,
                {
                  success: false,
                  error: {
                    code: "GET_SESSIONS_FAILED",
                    message: "Failed to retrieve user sessions",
                  },
                  timestamp: new Date().toISOString(),
                },
              ];
            }
            sessions = data.map((row) => ({
              id: row.id,
              userId: row.user_id,
              deviceId: row.device_id,
              token: row.token,
              ipAddress: row.ip_address,
              userAgent: row.user_agent,
              location: row.location ? JSON.parse(row.location) : undefined,
              expiresAt: row.expires_at,
              lastActivity: row.last_activity,
              metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
              createdAt: row.created_at,
              updatedAt: row.updated_at,
              terminatedAt: row.terminated_at,
              terminationReason: row.termination_reason,
            }));
            return [
              2 /*return*/,
              {
                success: true,
                data: sessions,
                timestamp: new Date().toISOString(),
              },
            ];
          case 2:
            error_7 = _b.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error: {
                  code: "GET_SESSIONS_ERROR",
                  message: "Error retrieving user sessions",
                  details: { error: error_7 instanceof Error ? error_7.message : "Unknown error" },
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
   * Terminate all sessions for a user
   */
  SessionManager.prototype.terminateAllUserSessions = function (userId_1) {
    return __awaiter(this, arguments, void 0, function (userId, reason) {
      var _a, data, error, error_8;
      if (reason === void 0) {
        reason = "admin_action";
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
                .from("sessions")
                .update({
                  terminated_at: new Date().toISOString(),
                  termination_reason: reason,
                  updated_at: new Date().toISOString(),
                })
                .eq("user_id", userId)
                .is("terminated_at", null)
                .select(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              return [
                2 /*return*/,
                {
                  success: false,
                  error: {
                    code: "BULK_TERMINATION_FAILED",
                    message: "Failed to terminate user sessions",
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
                  terminatedCount: data.length,
                  reason: reason,
                },
                timestamp: new Date().toISOString(),
              },
            ];
          case 2:
            error_8 = _b.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error: {
                  code: "BULK_TERMINATION_ERROR",
                  message: "Error terminating user sessions",
                  details: { error: error_8 instanceof Error ? error_8.message : "Unknown error" },
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
   * Clean up expired sessions
   */
  SessionManager.prototype.cleanupExpiredSessions = function () {
    return __awaiter(this, void 0, void 0, function () {
      var now,
        _a,
        expiredSessions,
        updateError,
        retentionDate,
        _b,
        deletedSessions,
        deleteError,
        error_9;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 3, , 4]);
            now = new Date().toISOString();
            return [
              4 /*yield*/,
              this.supabase
                .from("sessions")
                .update({
                  terminated_at: now,
                  termination_reason: "expired",
                  updated_at: now,
                })
                .lt("expires_at", now)
                .is("terminated_at", null)
                .select("id"),
            ];
          case 1:
            (_a = _c.sent()), (expiredSessions = _a.data), (updateError = _a.error);
            if (updateError) {
              return [
                2 /*return*/,
                {
                  success: false,
                  error: {
                    code: "CLEANUP_UPDATE_FAILED",
                    message: "Failed to mark expired sessions as terminated",
                  },
                  timestamp: new Date().toISOString(),
                },
              ];
            }
            retentionDate = new Date();
            retentionDate.setDate(retentionDate.getDate() - this.config.retentionDays);
            return [
              4 /*yield*/,
              this.supabase
                .from("sessions")
                .delete()
                .lt("terminated_at", retentionDate.toISOString())
                .not("terminated_at", "is", null)
                .select("id"),
            ];
          case 2:
            (_b = _c.sent()), (deletedSessions = _b.data), (deleteError = _b.error);
            if (deleteError) {
              return [
                2 /*return*/,
                {
                  success: false,
                  error: {
                    code: "CLEANUP_DELETE_FAILED",
                    message: "Failed to delete old sessions",
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
                  expiredCount:
                    (expiredSessions === null || expiredSessions === void 0
                      ? void 0
                      : expiredSessions.length) || 0,
                  deletedCount:
                    (deletedSessions === null || deletedSessions === void 0
                      ? void 0
                      : deletedSessions.length) || 0,
                  cleanupDate: now,
                },
                timestamp: new Date().toISOString(),
              },
            ];
          case 3:
            error_9 = _c.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error: {
                  code: "CLEANUP_ERROR",
                  message: "Error during session cleanup",
                  details: { error: error_9 instanceof Error ? error_9.message : "Unknown error" },
                },
                timestamp: new Date().toISOString(),
              },
            ];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get session metrics
   */
  SessionManager.prototype.getSessionMetrics = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var query,
        _a,
        allSessions,
        error,
        now_1,
        activeSessions,
        expiredSessions,
        terminatedSessions,
        completedSessions,
        totalDuration,
        averageDuration,
        terminationReasons,
        error_10;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            query = this.supabase.from("sessions").select("*");
            if (userId) {
              query = query.eq("user_id", userId);
            }
            return [4 /*yield*/, query];
          case 1:
            (_a = _b.sent()), (allSessions = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Failed to fetch sessions: ".concat(error.message));
            }
            now_1 = new Date();
            activeSessions = allSessions.filter(
              (s) => !s.terminated_at && new Date(s.expires_at) > now_1,
            );
            expiredSessions = allSessions.filter(
              (s) => !s.terminated_at && new Date(s.expires_at) <= now_1,
            );
            terminatedSessions = allSessions.filter((s) => s.terminated_at);
            completedSessions = terminatedSessions.filter((s) => s.terminated_at);
            totalDuration = completedSessions.reduce((sum, session) => {
              var start = new Date(session.created_at).getTime();
              var end = new Date(session.terminated_at).getTime();
              return sum + (end - start);
            }, 0);
            averageDuration =
              completedSessions.length > 0 ? totalDuration / completedSessions.length : 0;
            terminationReasons = terminatedSessions.reduce((acc, session) => {
              var reason = session.termination_reason || "unknown";
              acc[reason] = (acc[reason] || 0) + 1;
              return acc;
            }, {});
            return [
              2 /*return*/,
              {
                total: allSessions.length,
                active: activeSessions.length,
                expired: expiredSessions.length,
                terminated: terminatedSessions.length,
                averageDuration: averageDuration,
                terminationReasons: terminationReasons,
                generatedAt: now_1.toISOString(),
              },
            ];
          case 2:
            error_10 = _b.sent();
            throw new Error(
              "Error generating session metrics: ".concat(
                error_10 instanceof Error ? error_10.message : "Unknown error",
              ),
            );
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Private helper methods
   */
  SessionManager.prototype.checkConcurrentSessionLimit = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, activeSessions, error, activeCount, error_11;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("sessions")
                .select("id")
                .eq("user_id", userId)
                .is("terminated_at", null)
                .gt("expires_at", new Date().toISOString()),
            ];
          case 1:
            (_a = _b.sent()), (activeSessions = _a.data), (error = _a.error);
            if (error) {
              return [
                2 /*return*/,
                {
                  success: false,
                  error: {
                    code: "CONCURRENT_CHECK_FAILED",
                    message: "Failed to check concurrent sessions",
                  },
                  timestamp: new Date().toISOString(),
                },
              ];
            }
            activeCount =
              (activeSessions === null || activeSessions === void 0
                ? void 0
                : activeSessions.length) || 0;
            if (activeCount >= this.config.maxConcurrentSessions) {
              return [
                2 /*return*/,
                {
                  success: false,
                  error: {
                    code: "MAX_SESSIONS_EXCEEDED",
                    message: "Maximum concurrent sessions (".concat(
                      this.config.maxConcurrentSessions,
                      ") exceeded",
                    ),
                    details: {
                      currentSessions: activeCount,
                      maxAllowed: this.config.maxConcurrentSessions,
                    },
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
                  currentSessions: activeCount,
                  maxAllowed: this.config.maxConcurrentSessions,
                },
                timestamp: new Date().toISOString(),
              },
            ];
          case 2:
            error_11 = _b.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error: {
                  code: "CONCURRENT_CHECK_ERROR",
                  message: "Error checking concurrent sessions",
                  details: {
                    error: error_11 instanceof Error ? error_11.message : "Unknown error",
                  },
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
  return SessionManager;
})();
exports.SessionManager = SessionManager;
// Create a default instance for direct import
exports.sessionManager = new SessionManager({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  defaultTimeout: 24 * 60 * 60 * 1000, // 24 hours
  enableLogging: process.env.NODE_ENV === "development",
});
exports.default = SessionManager;

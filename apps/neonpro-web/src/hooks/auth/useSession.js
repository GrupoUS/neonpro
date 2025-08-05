// =====================================================
// useSession Hook - React Session Management
// Story 1.4: Session Management & Security
// =====================================================
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
exports.useSession = useSession;
var react_1 = require("react");
var useSupabase_1 = require("@/hooks/useSupabase");
var session_1 = require("@/lib/auth/session");
var navigation_1 = require("next/navigation");
var sonner_1 = require("sonner");
// =====================================================
// MAIN HOOK
// =====================================================
function useSession(options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.autoRefresh,
    autoRefresh = _a === void 0 ? true : _a,
    _b = options.refreshInterval,
    refreshInterval = _b === void 0 ? 60000 : _b, // 1 minute
    _c = options.redirectOnExpiry, // 1 minute
    redirectOnExpiry = _c === void 0 ? "/login" : _c,
    _d = options.showWarnings,
    showWarnings = _d === void 0 ? true : _d,
    _e = options.trackActivity,
    trackActivity = _e === void 0 ? true : _e;
  var supabase = (0, useSupabase_1.useSupabase)().supabase;
  var router = (0, navigation_1.useRouter)();
  // Session system instance
  var sessionSystemRef = (0, react_1.useRef)(null);
  // State
  var _f = (0, react_1.useState)({
      isLoading: true,
      isAuthenticated: false,
      user: null,
      session: null,
      error: null,
    }),
    state = _f[0],
    setState = _f[1];
  var _g = (0, react_1.useState)(null),
    timeUntilExpiry = _g[0],
    setTimeUntilExpiry = _g[1];
  var _h = (0, react_1.useState)(null),
    sessionStats = _h[0],
    setSessionStats = _h[1];
  // Refs for intervals
  var refreshIntervalRef = (0, react_1.useRef)(null);
  var expiryTimerRef = (0, react_1.useRef)(null);
  var warningShownRef = (0, react_1.useRef)(false);
  // =====================================================
  // INITIALIZATION
  // =====================================================
  (0, react_1.useEffect)(() => {
    if (!supabase) return;
    // Initialize session system
    sessionSystemRef.current = new session_1.UnifiedSessionSystem(supabase);
    sessionSystemRef.current.initialize().then(() => {
      // Check for existing session
      checkExistingSession();
    });
    return () => {
      // Cleanup intervals
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (expiryTimerRef.current) {
        clearTimeout(expiryTimerRef.current);
      }
    };
  }, [supabase]);
  // =====================================================
  // SESSION MANAGEMENT
  // =====================================================
  var checkExistingSession = (0, react_1.useCallback)(
    () =>
      __awaiter(this, void 0, void 0, function () {
        var sessionId, deviceInfo, validation, error_1;
        var _a;
        return __generator(this, (_b) => {
          switch (_b.label) {
            case 0:
              _b.trys.push([0, 3, , 4]);
              sessionId = localStorage.getItem("session_id");
              if (!sessionId) {
                setState((prev) => __assign(__assign({}, prev), { isLoading: false }));
                return [2 /*return*/];
              }
              return [4 /*yield*/, getDeviceInfo()];
            case 1:
              deviceInfo = _b.sent();
              return [
                4 /*yield*/,
                (_a = sessionSystemRef.current) === null || _a === void 0
                  ? void 0
                  : _a.validateSession(sessionId, deviceInfo.ipAddress, deviceInfo.userAgent),
              ];
            case 2:
              validation = _b.sent();
              if (
                (validation === null || validation === void 0 ? void 0 : validation.isValid) &&
                validation.session
              ) {
                setState({
                  isLoading: false,
                  isAuthenticated: true,
                  user: validation.user,
                  session: validation.session,
                  securityScore: validation.securityScore,
                  error: null,
                });
                // Start auto-refresh if enabled
                if (autoRefresh) {
                  startAutoRefresh();
                }
                // Start expiry timer
                startExpiryTimer(validation.session.expiresAt);
                // Update session stats
                updateSessionStats(validation.session);
              } else {
                // Invalid session, clear storage
                localStorage.removeItem("session_id");
                setState((prev) => __assign(__assign({}, prev), { isLoading: false }));
              }
              return [3 /*break*/, 4];
            case 3:
              error_1 = _b.sent();
              console.error("Session check error:", error_1);
              setState({
                isLoading: false,
                isAuthenticated: false,
                user: null,
                session: null,
                error: error_1 instanceof Error ? error_1.message : "Session check failed",
              });
              return [3 /*break*/, 4];
            case 4:
              return [2 /*return*/];
          }
        });
      }),
    [autoRefresh],
  );
  var login = (0, react_1.useCallback)(
    (credentials, deviceInfo) =>
      __awaiter(this, void 0, void 0, function () {
        var result_1, error_2, errorMessage_1;
        var _a, _b;
        return __generator(this, (_c) => {
          switch (_c.label) {
            case 0:
              _c.trys.push([0, 2, , 3]);
              setState((prev) => __assign(__assign({}, prev), { isLoading: true, error: null }));
              return [
                4 /*yield*/,
                (_a = sessionSystemRef.current) === null || _a === void 0
                  ? void 0
                  : _a.authenticateUser(credentials, deviceInfo),
              ];
            case 1:
              result_1 = _c.sent();
              if (
                (result_1 === null || result_1 === void 0 ? void 0 : result_1.success) &&
                result_1.session
              ) {
                // Store session ID
                localStorage.setItem("session_id", result_1.session.sessionId);
                setState({
                  isLoading: false,
                  isAuthenticated: true,
                  user: result_1.user,
                  session: result_1.session,
                  error: null,
                });
                // Start auto-refresh
                if (autoRefresh) {
                  startAutoRefresh();
                }
                // Start expiry timer
                startExpiryTimer(result_1.session.expiresAt);
                // Update session stats
                updateSessionStats(result_1.session);
                // Show success message
                if (showWarnings) {
                  sonner_1.toast.success("Login successful");
                  // Show device warning if needed
                  if (
                    !((_b = result_1.deviceValidation) === null || _b === void 0
                      ? void 0
                      : _b.isTrusted)
                  ) {
                    sonner_1.toast.warning(
                      "New device detected. Check your email for security notification.",
                    );
                  }
                }
                return [2 /*return*/, true];
              } else {
                setState((prev) =>
                  __assign(__assign({}, prev), {
                    isLoading: false,
                    error:
                      (result_1 === null || result_1 === void 0 ? void 0 : result_1.error) ||
                      "Login failed",
                  }),
                );
                if (showWarnings) {
                  sonner_1.toast.error(
                    (result_1 === null || result_1 === void 0 ? void 0 : result_1.error) ||
                      "Login failed",
                  );
                }
                return [2 /*return*/, false];
              }
              return [3 /*break*/, 3];
            case 2:
              error_2 = _c.sent();
              errorMessage_1 = error_2 instanceof Error ? error_2.message : "Login failed";
              setState((prev) =>
                __assign(__assign({}, prev), { isLoading: false, error: errorMessage_1 }),
              );
              if (showWarnings) {
                sonner_1.toast.error(errorMessage_1);
              }
              return [2 /*return*/, false];
            case 3:
              return [2 /*return*/];
          }
        });
      }),
    [autoRefresh, showWarnings],
  );
  var logout = (0, react_1.useCallback)(
    () =>
      __awaiter(this, void 0, void 0, function () {
        var sessionId, error_3;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 3, , 4]);
              sessionId = localStorage.getItem("session_id");
              if (!(sessionId && sessionSystemRef.current)) return [3 /*break*/, 2];
              return [
                4 /*yield*/,
                sessionSystemRef.current.terminateSession(sessionId, "user_logout"),
              ];
            case 1:
              _a.sent();
              _a.label = 2;
            case 2:
              // Clear local storage
              localStorage.removeItem("session_id");
              // Clear intervals
              if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
              }
              if (expiryTimerRef.current) {
                clearTimeout(expiryTimerRef.current);
              }
              // Reset state
              setState({
                isLoading: false,
                isAuthenticated: false,
                user: null,
                session: null,
                error: null,
              });
              setTimeUntilExpiry(null);
              setSessionStats(null);
              warningShownRef.current = false;
              if (showWarnings) {
                sonner_1.toast.success("Logged out successfully");
              }
              // Redirect to login
              router.push(redirectOnExpiry);
              return [3 /*break*/, 4];
            case 3:
              error_3 = _a.sent();
              console.error("Logout error:", error_3);
              if (showWarnings) {
                sonner_1.toast.error("Logout failed");
              }
              return [3 /*break*/, 4];
            case 4:
              return [2 /*return*/];
          }
        });
      }),
    [router, redirectOnExpiry, showWarnings],
  );
  var refreshSession = (0, react_1.useCallback)(
    () =>
      __awaiter(this, void 0, void 0, function () {
        var sessionId, deviceInfo, validation_1, error_4;
        var _a;
        return __generator(this, (_b) => {
          switch (_b.label) {
            case 0:
              _b.trys.push([0, 6, , 7]);
              sessionId = localStorage.getItem("session_id");
              if (!sessionId) return [2 /*return*/];
              return [4 /*yield*/, getDeviceInfo()];
            case 1:
              deviceInfo = _b.sent();
              return [
                4 /*yield*/,
                (_a = sessionSystemRef.current) === null || _a === void 0
                  ? void 0
                  : _a.validateSession(sessionId, deviceInfo.ipAddress, deviceInfo.userAgent),
              ];
            case 2:
              validation_1 = _b.sent();
              if (
                !(
                  (validation_1 === null || validation_1 === void 0
                    ? void 0
                    : validation_1.isValid) && validation_1.session
                )
              )
                return [3 /*break*/, 3];
              setState((prev) =>
                __assign(__assign({}, prev), {
                  session: validation_1.session,
                  securityScore: validation_1.securityScore,
                  error: null,
                }),
              );
              // Update expiry timer
              startExpiryTimer(validation_1.session.expiresAt);
              // Update session stats
              updateSessionStats(validation_1.session);
              return [3 /*break*/, 5];
            case 3:
              // Session invalid, logout
              return [4 /*yield*/, logout()];
            case 4:
              // Session invalid, logout
              _b.sent();
              _b.label = 5;
            case 5:
              return [3 /*break*/, 7];
            case 6:
              error_4 = _b.sent();
              console.error("Session refresh error:", error_4);
              setState((prev) =>
                __assign(__assign({}, prev), {
                  error: error_4 instanceof Error ? error_4.message : "Session refresh failed",
                }),
              );
              return [3 /*break*/, 7];
            case 7:
              return [2 /*return*/];
          }
        });
      }),
    [logout],
  );
  var extendSession = (0, react_1.useCallback)(
    () =>
      __awaiter(this, void 0, void 0, function () {
        var sessionId, result_2, error_5;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 2, , 3]);
              sessionId = localStorage.getItem("session_id");
              if (!sessionId || !sessionSystemRef.current) return [2 /*return*/];
              return [
                4 /*yield*/,
                sessionSystemRef.current.sessionManager.extendSession(sessionId),
              ];
            case 1:
              result_2 = _a.sent();
              if (result_2.success && result_2.newExpiresAt) {
                setState((prev) =>
                  __assign(__assign({}, prev), {
                    session: prev.session
                      ? __assign(__assign({}, prev.session), { expiresAt: result_2.newExpiresAt })
                      : null,
                  }),
                );
                // Update expiry timer
                startExpiryTimer(result_2.newExpiresAt);
                if (showWarnings) {
                  sonner_1.toast.success("Session extended successfully");
                }
              }
              return [3 /*break*/, 3];
            case 2:
              error_5 = _a.sent();
              console.error("Session extension error:", error_5);
              if (showWarnings) {
                sonner_1.toast.error("Failed to extend session");
              }
              return [3 /*break*/, 3];
            case 3:
              return [2 /*return*/];
          }
        });
      }),
    [showWarnings],
  );
  var validateSession = (0, react_1.useCallback)(
    () =>
      __awaiter(this, void 0, void 0, function () {
        var sessionId, deviceInfo, validation, error_6;
        var _a;
        return __generator(this, (_b) => {
          switch (_b.label) {
            case 0:
              _b.trys.push([0, 3, , 4]);
              sessionId = localStorage.getItem("session_id");
              if (!sessionId) return [2 /*return*/, false];
              return [4 /*yield*/, getDeviceInfo()];
            case 1:
              deviceInfo = _b.sent();
              return [
                4 /*yield*/,
                (_a = sessionSystemRef.current) === null || _a === void 0
                  ? void 0
                  : _a.validateSession(sessionId, deviceInfo.ipAddress, deviceInfo.userAgent),
              ];
            case 2:
              validation = _b.sent();
              return [
                2 /*return*/,
                (validation === null || validation === void 0 ? void 0 : validation.isValid) ||
                  false,
              ];
            case 3:
              error_6 = _b.sent();
              console.error("Session validation error:", error_6);
              return [2 /*return*/, false];
            case 4:
              return [2 /*return*/];
          }
        });
      }),
    [],
  );
  var updateActivity = (0, react_1.useCallback)(
    (activityType, metadata) =>
      __awaiter(this, void 0, void 0, function () {
        var sessionId, error_7;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 2, , 3]);
              if (!trackActivity) return [2 /*return*/];
              sessionId = localStorage.getItem("session_id");
              if (!sessionId || !sessionSystemRef.current) return [2 /*return*/];
              return [
                4 /*yield*/,
                sessionSystemRef.current.sessionManager.updateActivity(
                  sessionId,
                  activityType,
                  metadata,
                ),
                // Update session stats
              ];
            case 1:
              _a.sent();
              // Update session stats
              if (state.session) {
                updateSessionStats(state.session);
              }
              return [3 /*break*/, 3];
            case 2:
              error_7 = _a.sent();
              console.error("Activity update error:", error_7);
              return [3 /*break*/, 3];
            case 3:
              return [2 /*return*/];
          }
        });
      }),
    [trackActivity, state.session],
  );
  // =====================================================
  // HELPER FUNCTIONS
  // =====================================================
  var startAutoRefresh = (0, react_1.useCallback)(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }
    refreshIntervalRef.current = setInterval(() => {
      refreshSession();
    }, refreshInterval);
  }, [refreshSession, refreshInterval]);
  var startExpiryTimer = (0, react_1.useCallback)(
    (expiresAt) => {
      if (expiryTimerRef.current) {
        clearTimeout(expiryTimerRef.current);
      }
      var updateTimer = () => {
        var now = Date.now();
        var expiry = expiresAt.getTime();
        var timeLeft = expiry - now;
        setTimeUntilExpiry(Math.max(0, timeLeft));
        // Show warning 5 minutes before expiry
        if (timeLeft <= 5 * 60 * 1000 && timeLeft > 0 && !warningShownRef.current && showWarnings) {
          warningShownRef.current = true;
          sonner_1.toast.warning("Your session will expire soon. Click to extend.", {
            action: {
              label: "Extend Session",
              onClick: extendSession,
            },
            duration: 10000,
          });
        }
        // Auto logout when expired
        if (timeLeft <= 0) {
          logout();
          return;
        }
        // Schedule next update
        expiryTimerRef.current = setTimeout(updateTimer, 1000);
      };
      updateTimer();
    },
    [logout, extendSession, showWarnings],
  );
  var updateSessionStats = (0, react_1.useCallback)((session) => {
    var now = Date.now();
    var duration = now - session.createdAt.getTime();
    setSessionStats({
      duration: duration,
      activitiesCount: session.activitiesCount || 0,
      lastActivity: session.lastActivity || null,
    });
  }, []);
  // =====================================================
  // COMPUTED VALUES
  // =====================================================
  var isExpiringSoon = timeUntilExpiry !== null && timeUntilExpiry <= 5 * 60 * 1000; // 5 minutes
  // =====================================================
  // RETURN HOOK INTERFACE
  // =====================================================
  return {
    // State
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    user: state.user,
    session: state.session,
    securityScore: state.securityScore,
    error: state.error,
    // Actions
    login: login,
    logout: logout,
    refreshSession: refreshSession,
    extendSession: extendSession,
    validateSession: validateSession,
    updateActivity: updateActivity,
    // Computed
    timeUntilExpiry: timeUntilExpiry,
    isExpiringSoon: isExpiringSoon,
    sessionStats: sessionStats,
  };
}
// =====================================================
// UTILITY FUNCTIONS
// =====================================================
/**
 * Get device information for session management
 */
function getDeviceInfo() {
  return __awaiter(this, void 0, void 0, function () {
    var fingerprint, ipAddress;
    var _a;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          return [
            4 /*yield*/,
            generateDeviceFingerprint(),
            // Get IP address (in production, this would come from server)
          ];
        case 1:
          fingerprint = _b.sent();
          return [4 /*yield*/, getClientIP()];
        case 2:
          ipAddress = _b.sent();
          _a = {
            fingerprint: fingerprint,
            userAgent: navigator.userAgent,
            ipAddress: ipAddress,
          };
          return [4 /*yield*/, getLocation()];
        case 3:
          return [2 /*return*/, ((_a.location = _b.sent()), _a)];
      }
    });
  });
}
/**
 * Generate device fingerprint
 */
function generateDeviceFingerprint() {
  return __awaiter(this, void 0, void 0, function () {
    var canvas, ctx, fingerprint, hash, i, char;
    return __generator(this, (_a) => {
      canvas = document.createElement("canvas");
      ctx = canvas.getContext("2d");
      ctx === null || ctx === void 0 ? void 0 : ctx.fillText("Device fingerprint", 10, 10);
      fingerprint = [
        navigator.userAgent,
        navigator.language,
        screen.width + "x" + screen.height,
        new Date().getTimezoneOffset(),
        canvas.toDataURL(),
      ].join("|");
      hash = 0;
      for (i = 0; i < fingerprint.length; i++) {
        char = fingerprint.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return [2 /*return*/, Math.abs(hash).toString(36)];
    });
  });
}
/**
 * Get client IP address
 */
function getClientIP() {
  return __awaiter(this, void 0, void 0, function () {
    var response, data, _a;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 3, , 4]);
          return [4 /*yield*/, fetch("https://api.ipify.org?format=json")];
        case 1:
          response = _b.sent();
          return [4 /*yield*/, response.json()];
        case 2:
          data = _b.sent();
          return [2 /*return*/, data.ip || "127.0.0.1"];
        case 3:
          _a = _b.sent();
          return [2 /*return*/, "127.0.0.1"];
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Get user location
 */
function getLocation() {
  return __awaiter(this, void 0, void 0, function () {
    var response, data, _a;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 3, , 4]);
          return [4 /*yield*/, fetch("https://ipapi.co/json/")];
        case 1:
          response = _b.sent();
          return [4 /*yield*/, response.json()];
        case 2:
          data = _b.sent();
          return [2 /*return*/, "".concat(data.city, ", ").concat(data.country_name)];
        case 3:
          _a = _b.sent();
          return [2 /*return*/, undefined];
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
// =====================================================
// EXPORT DEFAULT
// =====================================================
exports.default = useSession;

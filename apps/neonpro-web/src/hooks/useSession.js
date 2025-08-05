/**
 * Session Management Hooks
 * Story 1.4: Session Management & Security
 *
 * React hooks for session management, security monitoring,
 * and device tracking with real-time updates.
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
exports.useSession = useSession;
exports.useSecurityEvents = useSecurityEvents;
var react_1 = require("react");
var navigation_1 = require("next/navigation");
var session_1 = require("@/lib/auth/session");
var use_toast_1 = require("@/hooks/use-toast");
var logger_1 = require("@/lib/logger");
function useSession() {
  var _a = (0, react_1.useState)(null),
    session = _a[0],
    setSession = _a[1];
  var _b = (0, react_1.useState)(true),
    isLoading = _b[0],
    setIsLoading = _b[1];
  var _c = (0, react_1.useState)([]),
    securityEvents = _c[0],
    setSecurityEvents = _c[1];
  var _d = (0, react_1.useState)([]),
    devices = _d[0],
    setDevices = _d[1];
  var _e = (0, react_1.useState)(null),
    analytics = _e[0],
    setAnalytics = _e[1];
  var _f = (0, react_1.useState)(null),
    error = _f[0],
    setError = _f[1];
  var router = (0, navigation_1.useRouter)();
  var toast = (0, use_toast_1.useToast)().toast;
  var heartbeatRef = (0, react_1.useRef)(null);
  var securityMonitorRef = (0, react_1.useRef)(null);
  // ============================================================================
  // SESSION MANAGEMENT
  // ============================================================================
  var createSession = (0, react_1.useCallback)(
    (request) =>
      __awaiter(this, void 0, void 0, function () {
        var newSession, err_1, errorMessage;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 3, 4, 5]);
              setIsLoading(true);
              setError(null);
              return [4 /*yield*/, session_1.sessionManager.createSession(request)];
            case 1:
              newSession = _a.sent();
              setSession(newSession);
              // Start session monitoring
              startSessionMonitoring(newSession);
              // Load related data
              return [
                4 /*yield*/,
                Promise.all([
                  loadSecurityEvents(newSession.id),
                  loadUserDevices(newSession.user_id),
                  loadSessionAnalytics(newSession.user_id),
                ]),
              ];
            case 2:
              // Load related data
              _a.sent();
              toast({
                title: "Session Created",
                description: "You have been successfully logged in.",
                variant: "default",
              });
              logger_1.logger.info("Session created via hook", { session_id: newSession.id });
              return [2 /*return*/, newSession];
            case 3:
              err_1 = _a.sent();
              errorMessage = err_1 instanceof Error ? err_1.message : "Failed to create session";
              setError(errorMessage);
              toast({
                title: "Login Failed",
                description: errorMessage,
                variant: "destructive",
              });
              throw err_1;
            case 4:
              setIsLoading(false);
              return [7 /*endfinally*/];
            case 5:
              return [2 /*return*/];
          }
        });
      }),
    [toast],
  );
  var updateSession = (0, react_1.useCallback)(
    (updates) =>
      __awaiter(this, void 0, void 0, function () {
        var updatedSession, err_2, errorMessage;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              if (!session) return [2 /*return*/];
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, , 4]);
              return [4 /*yield*/, session_1.sessionManager.updateSession(session.id, updates)];
            case 2:
              updatedSession = _a.sent();
              setSession(updatedSession);
              logger_1.logger.info("Session updated via hook", {
                session_id: session.id,
                updates: updates,
              });
              return [3 /*break*/, 4];
            case 3:
              err_2 = _a.sent();
              errorMessage = err_2 instanceof Error ? err_2.message : "Failed to update session";
              setError(errorMessage);
              logger_1.logger.error("Session update failed", {
                error: err_2,
                session_id: session.id,
              });
              return [3 /*break*/, 4];
            case 4:
              return [2 /*return*/];
          }
        });
      }),
    [session],
  );
  var terminateSession = (0, react_1.useCallback)(() => {
    var args_1 = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      args_1[_i] = arguments[_i];
    }
    return __awaiter(this, __spreadArray([], args_1, true), void 0, function (reason) {
      var err_3, errorMessage;
      if (reason === void 0) {
        reason = "user_logout";
      }
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            if (!session) return [2 /*return*/];
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            setIsLoading(true);
            return [4 /*yield*/, session_1.sessionManager.terminateSession(session.id, reason)];
          case 2:
            _a.sent();
            // Stop monitoring
            stopSessionMonitoring();
            // Clear state
            setSession(null);
            setSecurityEvents([]);
            setDevices([]);
            setAnalytics(null);
            setError(null);
            toast({
              title: "Session Ended",
              description: "You have been successfully logged out.",
              variant: "default",
            });
            // Redirect to login
            router.push("/auth/login");
            logger_1.logger.info("Session terminated via hook", {
              session_id: session.id,
              reason: reason,
            });
            return [3 /*break*/, 5];
          case 3:
            err_3 = _a.sent();
            errorMessage = err_3 instanceof Error ? err_3.message : "Failed to terminate session";
            setError(errorMessage);
            toast({
              title: "Logout Failed",
              description: errorMessage,
              variant: "destructive",
            });
            return [3 /*break*/, 5];
          case 4:
            setIsLoading(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  }, [session, router, toast]);
  var terminateAllSessions = (0, react_1.useCallback)(
    () =>
      __awaiter(this, void 0, void 0, function () {
        var activeSessions, err_4, errorMessage;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              if (!session) return [2 /*return*/];
              _a.label = 1;
            case 1:
              _a.trys.push([1, 5, 6, 7]);
              setIsLoading(true);
              return [
                4 /*yield*/,
                session_1.sessionManager.supabase
                  .from("user_sessions")
                  .select("id")
                  .eq("user_id", session.user_id)
                  .eq("is_active", true),
              ];
            case 2:
              activeSessions = _a.sent().data;
              if (!activeSessions) return [3 /*break*/, 4];
              // Terminate all sessions
              return [
                4 /*yield*/,
                Promise.all(
                  activeSessions.map((s) =>
                    session_1.sessionManager.terminateSession(s.id, "terminate_all_sessions"),
                  ),
                ),
              ];
            case 3:
              // Terminate all sessions
              _a.sent();
              _a.label = 4;
            case 4:
              // Stop monitoring
              stopSessionMonitoring();
              // Clear state
              setSession(null);
              setSecurityEvents([]);
              setDevices([]);
              setAnalytics(null);
              setError(null);
              toast({
                title: "All Sessions Terminated",
                description: "All active sessions have been terminated for security.",
                variant: "default",
              });
              // Redirect to login
              router.push("/auth/login");
              logger_1.logger.info("All sessions terminated via hook", {
                user_id: session.user_id,
              });
              return [3 /*break*/, 7];
            case 5:
              err_4 = _a.sent();
              errorMessage =
                err_4 instanceof Error ? err_4.message : "Failed to terminate all sessions";
              setError(errorMessage);
              toast({
                title: "Termination Failed",
                description: errorMessage,
                variant: "destructive",
              });
              return [3 /*break*/, 7];
            case 6:
              setIsLoading(false);
              return [7 /*endfinally*/];
            case 7:
              return [2 /*return*/];
          }
        });
      }),
    [session, router, toast],
  );
  var refreshSession = (0, react_1.useCallback)(
    () =>
      __awaiter(this, void 0, void 0, function () {
        var currentSession, err_5;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              if (!session) return [2 /*return*/];
              _a.label = 1;
            case 1:
              _a.trys.push([1, 7, , 8]);
              return [
                4 /*yield*/,
                session_1.sessionManager.supabase
                  .from("user_sessions")
                  .select("*")
                  .eq("id", session.id)
                  .eq("is_active", true)
                  .single(),
              ];
            case 2:
              currentSession = _a.sent().data;
              if (!currentSession) return [3 /*break*/, 4];
              setSession(currentSession);
              // Refresh related data
              return [
                4 /*yield*/,
                Promise.all([
                  loadSecurityEvents(currentSession.id),
                  loadUserDevices(currentSession.user_id),
                  loadSessionAnalytics(currentSession.user_id),
                ]),
              ];
            case 3:
              // Refresh related data
              _a.sent();
              return [3 /*break*/, 6];
            case 4:
              // Session no longer exists or is inactive
              return [4 /*yield*/, terminateSession("session_expired")];
            case 5:
              // Session no longer exists or is inactive
              _a.sent();
              _a.label = 6;
            case 6:
              return [3 /*break*/, 8];
            case 7:
              err_5 = _a.sent();
              logger_1.logger.error("Session refresh failed", {
                error: err_5,
                session_id: session.id,
              });
              setError("Failed to refresh session");
              return [3 /*break*/, 8];
            case 8:
              return [2 /*return*/];
          }
        });
      }),
    [session, terminateSession],
  );
  var extendSession = (0, react_1.useCallback)(
    () =>
      __awaiter(this, void 0, void 0, function () {
        var err_6;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              if (!session) return [2 /*return*/];
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, , 4]);
              return [
                4 /*yield*/,
                updateSession({
                  last_activity: new Date().toISOString(),
                }),
              ];
            case 2:
              _a.sent();
              logger_1.logger.info("Session extended via hook", { session_id: session.id });
              return [3 /*break*/, 4];
            case 3:
              err_6 = _a.sent();
              logger_1.logger.error("Session extension failed", {
                error: err_6,
                session_id: session.id,
              });
              return [3 /*break*/, 4];
            case 4:
              return [2 /*return*/];
          }
        });
      }),
    [session, updateSession],
  );
  // ============================================================================
  // SECURITY MONITORING
  // ============================================================================
  var reportSuspiciousActivity = (0, react_1.useCallback)(
    (eventType, details) =>
      __awaiter(this, void 0, void 0, function () {
        var err_7, errorMessage;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              if (!session) return [2 /*return*/];
              _a.label = 1;
            case 1:
              _a.trys.push([1, 4, , 5]);
              // Create security event
              return [
                4 /*yield*/,
                session_1.sessionManager.supabase.from("session_security_events").insert({
                  session_id: session.id,
                  user_id: session.user_id,
                  event_type: eventType,
                  severity: "medium",
                  details: __assign(__assign({}, details), {
                    reported_by: "user",
                    timestamp: new Date().toISOString(),
                  }),
                  ip_address: session.ip_address,
                  user_agent: session.user_agent,
                  timestamp: new Date().toISOString(),
                  resolved: false,
                }),
              ];
            case 2:
              // Create security event
              _a.sent();
              // Reload security events
              return [4 /*yield*/, loadSecurityEvents(session.id)];
            case 3:
              // Reload security events
              _a.sent();
              toast({
                title: "Security Event Reported",
                description: "Suspicious activity has been reported and logged.",
                variant: "default",
              });
              logger_1.logger.warn("Suspicious activity reported via hook", {
                session_id: session.id,
                event_type: eventType,
                details: details,
              });
              return [3 /*break*/, 5];
            case 4:
              err_7 = _a.sent();
              errorMessage =
                err_7 instanceof Error ? err_7.message : "Failed to report suspicious activity";
              setError(errorMessage);
              toast({
                title: "Report Failed",
                description: errorMessage,
                variant: "destructive",
              });
              return [3 /*break*/, 5];
            case 5:
              return [2 /*return*/];
          }
        });
      }),
    [session, toast],
  );
  // ============================================================================
  // DEVICE MANAGEMENT
  // ============================================================================
  var trustDevice = (0, react_1.useCallback)(
    (deviceId) =>
      __awaiter(this, void 0, void 0, function () {
        var err_8, errorMessage;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 4, , 5]);
              return [
                4 /*yield*/,
                session_1.sessionManager.supabase
                  .from("device_registrations")
                  .update({ trusted: true })
                  .eq("id", deviceId),
              ];
            case 1:
              _a.sent();
              if (!session) return [3 /*break*/, 3];
              return [4 /*yield*/, loadUserDevices(session.user_id)];
            case 2:
              _a.sent();
              _a.label = 3;
            case 3:
              toast({
                title: "Device Trusted",
                description: "Device has been marked as trusted.",
                variant: "default",
              });
              logger_1.logger.info("Device trusted via hook", { device_id: deviceId });
              return [3 /*break*/, 5];
            case 4:
              err_8 = _a.sent();
              errorMessage = err_8 instanceof Error ? err_8.message : "Failed to trust device";
              setError(errorMessage);
              toast({
                title: "Trust Failed",
                description: errorMessage,
                variant: "destructive",
              });
              return [3 /*break*/, 5];
            case 5:
              return [2 /*return*/];
          }
        });
      }),
    [session, toast],
  );
  var blockDevice = (0, react_1.useCallback)(
    (deviceId) =>
      __awaiter(this, void 0, void 0, function () {
        var deviceSessions, err_9, errorMessage;
        var _a;
        return __generator(this, (_b) => {
          switch (_b.label) {
            case 0:
              _b.trys.push([0, 7, , 8]);
              return [
                4 /*yield*/,
                session_1.sessionManager.supabase
                  .from("device_registrations")
                  .update({ blocked: true })
                  .eq("id", deviceId),
              ];
            case 1:
              _b.sent();
              return [
                4 /*yield*/,
                session_1.sessionManager.supabase
                  .from("user_sessions")
                  .select("id")
                  .eq(
                    "device_fingerprint",
                    (_a = devices.find((d) => d.id === deviceId)) === null || _a === void 0
                      ? void 0
                      : _a.device_fingerprint,
                  )
                  .eq("is_active", true),
              ];
            case 2:
              deviceSessions = _b.sent().data;
              if (!deviceSessions) return [3 /*break*/, 4];
              return [
                4 /*yield*/,
                Promise.all(
                  deviceSessions.map((s) =>
                    session_1.sessionManager.terminateSession(s.id, "device_blocked"),
                  ),
                ),
              ];
            case 3:
              _b.sent();
              _b.label = 4;
            case 4:
              if (!session) return [3 /*break*/, 6];
              return [4 /*yield*/, loadUserDevices(session.user_id)];
            case 5:
              _b.sent();
              _b.label = 6;
            case 6:
              toast({
                title: "Device Blocked",
                description: "Device has been blocked and all sessions terminated.",
                variant: "default",
              });
              logger_1.logger.info("Device blocked via hook", { device_id: deviceId });
              return [3 /*break*/, 8];
            case 7:
              err_9 = _b.sent();
              errorMessage = err_9 instanceof Error ? err_9.message : "Failed to block device";
              setError(errorMessage);
              toast({
                title: "Block Failed",
                description: errorMessage,
                variant: "destructive",
              });
              return [3 /*break*/, 8];
            case 8:
              return [2 /*return*/];
          }
        });
      }),
    [session, devices, toast],
  );
  // ============================================================================
  // DATA LOADING
  // ============================================================================
  var loadSecurityEvents = (0, react_1.useCallback)(
    (sessionId) =>
      __awaiter(this, void 0, void 0, function () {
        var events, err_10;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 2, , 3]);
              return [
                4 /*yield*/,
                session_1.sessionManager.supabase
                  .from("session_security_events")
                  .select("*")
                  .eq("session_id", sessionId)
                  .order("timestamp", { ascending: false })
                  .limit(50),
              ];
            case 1:
              events = _a.sent().data;
              setSecurityEvents(events || []);
              return [3 /*break*/, 3];
            case 2:
              err_10 = _a.sent();
              logger_1.logger.error("Failed to load security events", {
                error: err_10,
                session_id: sessionId,
              });
              return [3 /*break*/, 3];
            case 3:
              return [2 /*return*/];
          }
        });
      }),
    [],
  );
  var loadUserDevices = (0, react_1.useCallback)(
    (userId) =>
      __awaiter(this, void 0, void 0, function () {
        var userDevices, err_11;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 2, , 3]);
              return [
                4 /*yield*/,
                session_1.sessionManager.supabase
                  .from("device_registrations")
                  .select("*")
                  .eq("user_id", userId)
                  .order("last_seen", { ascending: false }),
              ];
            case 1:
              userDevices = _a.sent().data;
              setDevices(userDevices || []);
              return [3 /*break*/, 3];
            case 2:
              err_11 = _a.sent();
              logger_1.logger.error("Failed to load user devices", {
                error: err_11,
                user_id: userId,
              });
              return [3 /*break*/, 3];
            case 3:
              return [2 /*return*/];
          }
        });
      }),
    [],
  );
  var loadSessionAnalytics = (0, react_1.useCallback)(
    (userId) =>
      __awaiter(this, void 0, void 0, function () {
        var thirtyDaysAgo,
          sessions,
          analytics_1,
          completedSessions,
          totalDuration,
          securityCount,
          err_12;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 4, , 5]);
              thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
              return [
                4 /*yield*/,
                session_1.sessionManager.supabase
                  .from("user_sessions")
                  .select("*")
                  .eq("user_id", userId)
                  .gte("created_at", thirtyDaysAgo),
              ];
            case 1:
              sessions = _a.sent().data;
              if (!sessions) return [3 /*break*/, 3];
              analytics_1 = {
                total_sessions: sessions.length,
                active_sessions: sessions.filter((s) => s.is_active).length,
                average_duration_minutes: 0,
                unique_devices: new Set(sessions.map((s) => s.device_fingerprint)).size,
                unique_locations: new Set(sessions.map((s) => s.ip_address)).size,
                security_events_count: 0,
                last_login: sessions.length > 0 ? sessions[0].created_at : null,
                most_used_device: "",
                risk_score: 0,
              };
              completedSessions = sessions.filter((s) => !s.is_active);
              if (completedSessions.length > 0) {
                totalDuration = completedSessions.reduce((sum, session) => {
                  var start = new Date(session.created_at).getTime();
                  var end = new Date(session.expires_at).getTime();
                  return sum + (end - start);
                }, 0);
                analytics_1.average_duration_minutes = Math.round(
                  totalDuration / completedSessions.length / 60000,
                );
              }
              return [
                4 /*yield*/,
                session_1.sessionManager.supabase
                  .from("session_security_events")
                  .select("*", { count: "exact", head: true })
                  .eq("user_id", userId)
                  .gte("timestamp", thirtyDaysAgo),
              ];
            case 2:
              securityCount = _a.sent().count;
              analytics_1.security_events_count = securityCount || 0;
              // Calculate risk score (simplified)
              analytics_1.risk_score = Math.min(
                100,
                analytics_1.security_events_count * 10 +
                  (analytics_1.unique_locations > 5 ? 20 : 0) +
                  (analytics_1.unique_devices > 3 ? 15 : 0),
              );
              setAnalytics(analytics_1);
              _a.label = 3;
            case 3:
              return [3 /*break*/, 5];
            case 4:
              err_12 = _a.sent();
              logger_1.logger.error("Failed to load session analytics", {
                error: err_12,
                user_id: userId,
              });
              return [3 /*break*/, 5];
            case 5:
              return [2 /*return*/];
          }
        });
      }),
    [],
  );
  // ============================================================================
  // SESSION MONITORING
  // ============================================================================
  var startSessionMonitoring = (0, react_1.useCallback)(
    (sessionData) => {
      // Heartbeat to keep session alive
      heartbeatRef.current = setInterval(
        () => {
          extendSession();
        },
        5 * 60 * 1000,
      ); // Every 5 minutes
      // Security monitoring
      securityMonitorRef.current = setInterval(() => {
        if (sessionData.id) {
          loadSecurityEvents(sessionData.id);
        }
      }, 30 * 1000); // Every 30 seconds
      logger_1.logger.info("Session monitoring started", { session_id: sessionData.id });
    },
    [extendSession, loadSecurityEvents],
  );
  var stopSessionMonitoring = (0, react_1.useCallback)(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
    if (securityMonitorRef.current) {
      clearInterval(securityMonitorRef.current);
      securityMonitorRef.current = null;
    }
    logger_1.logger.info("Session monitoring stopped");
  }, []);
  // ============================================================================
  // EFFECTS
  // ============================================================================
  // Cleanup on unmount
  (0, react_1.useEffect)(
    () => () => {
      stopSessionMonitoring();
    },
    [stopSessionMonitoring],
  );
  // Auto-refresh session periodically
  (0, react_1.useEffect)(() => {
    if (session) {
      var refreshInterval_1 = setInterval(
        () => {
          refreshSession();
        },
        10 * 60 * 1000,
      ); // Every 10 minutes
      return () => clearInterval(refreshInterval_1);
    }
  }, [session, refreshSession]);
  return {
    session: session,
    isLoading: isLoading,
    isAuthenticated: !!(session === null || session === void 0 ? void 0 : session.is_active),
    securityEvents: securityEvents,
    devices: devices,
    analytics: analytics,
    createSession: createSession,
    updateSession: updateSession,
    terminateSession: terminateSession,
    terminateAllSessions: terminateAllSessions,
    refreshSession: refreshSession,
    extendSession: extendSession,
    reportSuspiciousActivity: reportSuspiciousActivity,
    trustDevice: trustDevice,
    blockDevice: blockDevice,
    error: error,
  };
}
function useSecurityEvents(sessionId) {
  var _a = (0, react_1.useState)([]),
    events = _a[0],
    setEvents = _a[1];
  var _b = (0, react_1.useState)(false),
    isLoading = _b[0],
    setIsLoading = _b[1];
  var _c = (0, react_1.useState)(null),
    error = _c[0],
    setError = _c[1];
  var toast = (0, use_toast_1.useToast)().toast;
  var loadEvents = (0, react_1.useCallback)(
    () =>
      __awaiter(this, void 0, void 0, function () {
        var _a, securityEvents, loadError, err_13, errorMessage;
        return __generator(this, (_b) => {
          switch (_b.label) {
            case 0:
              if (!sessionId) return [2 /*return*/];
              _b.label = 1;
            case 1:
              _b.trys.push([1, 3, 4, 5]);
              setIsLoading(true);
              setError(null);
              return [
                4 /*yield*/,
                session_1.sessionManager.supabase
                  .from("session_security_events")
                  .select("*")
                  .eq("session_id", sessionId)
                  .order("timestamp", { ascending: false }),
              ];
            case 2:
              (_a = _b.sent()), (securityEvents = _a.data), (loadError = _a.error);
              if (loadError) throw loadError;
              setEvents(securityEvents || []);
              return [3 /*break*/, 5];
            case 3:
              err_13 = _b.sent();
              errorMessage =
                err_13 instanceof Error ? err_13.message : "Failed to load security events";
              setError(errorMessage);
              logger_1.logger.error("Failed to load security events", {
                error: err_13,
                session_id: sessionId,
              });
              return [3 /*break*/, 5];
            case 4:
              setIsLoading(false);
              return [7 /*endfinally*/];
            case 5:
              return [2 /*return*/];
          }
        });
      }),
    [sessionId],
  );
  var resolveEvent = (0, react_1.useCallback)(
    (eventId) =>
      __awaiter(this, void 0, void 0, function () {
        var err_14, errorMessage;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 3, , 4]);
              return [
                4 /*yield*/,
                session_1.sessionManager.supabase
                  .from("session_security_events")
                  .update({
                    resolved: true,
                    resolved_at: new Date().toISOString(),
                  })
                  .eq("id", eventId),
              ];
            case 1:
              _a.sent();
              // Reload events
              return [4 /*yield*/, loadEvents()];
            case 2:
              // Reload events
              _a.sent();
              toast({
                title: "Event Resolved",
                description: "Security event has been marked as resolved.",
                variant: "default",
              });
              return [3 /*break*/, 4];
            case 3:
              err_14 = _a.sent();
              errorMessage = err_14 instanceof Error ? err_14.message : "Failed to resolve event";
              setError(errorMessage);
              toast({
                title: "Resolution Failed",
                description: errorMessage,
                variant: "destructive",
              });
              return [3 /*break*/, 4];
            case 4:
              return [2 /*return*/];
          }
        });
      }),
    [loadEvents, toast],
  );
  var dismissEvent = (0, react_1.useCallback)(
    (eventId) =>
      __awaiter(this, void 0, void 0, function () {
        var err_15, errorMessage;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 3, , 4]);
              return [
                4 /*yield*/,
                session_1.sessionManager.supabase
                  .from("session_security_events")
                  .update({
                    resolved: true,
                    resolved_at: new Date().toISOString(),
                    details: { dismissed: true },
                  })
                  .eq("id", eventId),
              ];
            case 1:
              _a.sent();
              // Reload events
              return [4 /*yield*/, loadEvents()];
            case 2:
              // Reload events
              _a.sent();
              toast({
                title: "Event Dismissed",
                description: "Security event has been dismissed.",
                variant: "default",
              });
              return [3 /*break*/, 4];
            case 3:
              err_15 = _a.sent();
              errorMessage = err_15 instanceof Error ? err_15.message : "Failed to dismiss event";
              setError(errorMessage);
              toast({
                title: "Dismissal Failed",
                description: errorMessage,
                variant: "destructive",
              });
              return [3 /*break*/, 4];
            case 4:
              return [2 /*return*/];
          }
        });
      }),
    [loadEvents, toast],
  );
  var getEventsByType = (0, react_1.useCallback)(
    (eventType) => events.filter((event) => event.event_type === eventType),
    [events],
  );
  var getUnresolvedEvents = (0, react_1.useCallback)(
    () => events.filter((event) => !event.resolved),
    [events],
  );
  var getCriticalEvents = (0, react_1.useCallback)(
    () => events.filter((event) => event.severity === "critical" && !event.resolved),
    [events],
  );
  // Load events when sessionId changes
  (0, react_1.useEffect)(() => {
    if (sessionId) {
      loadEvents();
    }
  }, [sessionId, loadEvents]);
  return {
    events: events,
    isLoading: isLoading,
    resolveEvent: resolveEvent,
    dismissEvent: dismissEvent,
    getEventsByType: getEventsByType,
    getUnresolvedEvents: getUnresolvedEvents,
    getCriticalEvents: getCriticalEvents,
    error: error,
  };
}

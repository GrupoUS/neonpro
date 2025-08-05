"use strict";
/**
 * Enhanced Session Hook
 *
 * React hook for managing OAuth session state with enhanced security features.
 * Integrates with SessionManager for secure token storage and activity tracking.
 */
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
exports.useSession = useSession;
exports.useSessionActivity = useSessionActivity;
var react_1 = require("react");
var navigation_1 = require("next/navigation");
var SessionManager_1 = require("./SessionManager");
var client_1 = require("@/lib/supabase/client");
function useSession() {
  var _this = this;
  var _a = (0, react_1.useState)(null),
    session = _a[0],
    setSession = _a[1];
  var _b = (0, react_1.useState)(true),
    isLoading = _b[0],
    setIsLoading = _b[1];
  var _c = (0, react_1.useState)([]),
    activeSessions = _c[0],
    setActiveSessions = _c[1];
  var _d = (0, react_1.useState)(false),
    shouldRefreshToken = _d[0],
    setShouldRefreshToken = _d[1];
  var router = (0, navigation_1.useRouter)();
  var supabase = yield (0, client_1.createClient)();
  /**
   * Initialize session management
   */
  var initializeSession = (0, react_1.useCallback)(function () {
    return __awaiter(_this, void 0, void 0, function () {
      var currentSession, sessions, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, 6, 7]);
            setIsLoading(true);
            return [4 /*yield*/, SessionManager_1.sessionManager.initialize()];
          case 1:
            _a.sent();
            return [4 /*yield*/, SessionManager_1.sessionManager.getCurrentSession()];
          case 2:
            currentSession = _a.sent();
            setSession(currentSession);
            if (!currentSession) return [3 /*break*/, 4];
            return [4 /*yield*/, SessionManager_1.sessionManager.getActiveSessions()];
          case 3:
            sessions = _a.sent();
            setActiveSessions(sessions);
            setShouldRefreshToken(SessionManager_1.sessionManager.shouldRefreshToken());
            _a.label = 4;
          case 4:
            return [3 /*break*/, 7];
          case 5:
            error_1 = _a.sent();
            console.error("Error initializing session:", error_1);
            setSession(null);
            return [3 /*break*/, 7];
          case 6:
            setIsLoading(false);
            return [7 /*endfinally*/];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  }, []);
  /**
   * Handle Supabase auth state changes
   */
  (0, react_1.useEffect)(function () {
    var subscription = supabase.auth.onAuthStateChange(function (event, supabaseSession) {
      return __awaiter(_this, void 0, void 0, function () {
        var newSession, sessions, error_2;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              if (
                !(
                  event === "SIGNED_IN" &&
                  (supabaseSession === null || supabaseSession === void 0
                    ? void 0
                    : supabaseSession.user)
                )
              )
                return [3 /*break*/, 6];
              _a.label = 1;
            case 1:
              _a.trys.push([1, 4, , 5]);
              return [
                4 /*yield*/,
                SessionManager_1.sessionManager.createSession(supabaseSession.user),
              ];
            case 2:
              newSession = _a.sent();
              setSession(newSession);
              return [4 /*yield*/, SessionManager_1.sessionManager.getActiveSessions()];
            case 3:
              sessions = _a.sent();
              setActiveSessions(sessions);
              return [3 /*break*/, 5];
            case 4:
              error_2 = _a.sent();
              console.error("Error creating session:", error_2);
              return [3 /*break*/, 5];
            case 5:
              return [3 /*break*/, 9];
            case 6:
              if (!(event === "SIGNED_OUT")) return [3 /*break*/, 7];
              // Clear session when user signs out
              setSession(null);
              setActiveSessions([]);
              setShouldRefreshToken(false);
              return [3 /*break*/, 9];
            case 7:
              if (!(event === "TOKEN_REFRESHED")) return [3 /*break*/, 9];
              // Update session on token refresh
              setShouldRefreshToken(false);
              return [4 /*yield*/, updateActivity("token_refreshed")];
            case 8:
              _a.sent();
              _a.label = 9;
            case 9:
              return [2 /*return*/];
          }
        });
      });
    }).data.subscription;
    return function () {
      return subscription.unsubscribe();
    };
  }, []);
  /**
   * Initialize session on mount
   */
  (0, react_1.useEffect)(
    function () {
      initializeSession();
    },
    [initializeSession],
  );
  /**
   * Check for token refresh needs
   */
  (0, react_1.useEffect)(function () {
    var interval = setInterval(function () {
      var needsRefresh = SessionManager_1.sessionManager.shouldRefreshToken();
      setShouldRefreshToken(needsRefresh);
      if (needsRefresh) {
        refreshSession();
      }
    }, 60000); // Check every minute
    return function () {
      return clearInterval(interval);
    };
  }, []);
  /**
   * Refresh session tokens
   */
  var refreshSession = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        var success, updatedSession, error_3;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 5, , 6]);
              return [4 /*yield*/, SessionManager_1.sessionManager.refreshSession()];
            case 1:
              success = _a.sent();
              if (!success) return [3 /*break*/, 3];
              return [4 /*yield*/, SessionManager_1.sessionManager.getCurrentSession()];
            case 2:
              updatedSession = _a.sent();
              setSession(updatedSession);
              setShouldRefreshToken(false);
              return [2 /*return*/, true];
            case 3:
              // Refresh failed, redirect to login
              router.push("/auth/login?reason=token_expired");
              return [2 /*return*/, false];
            case 4:
              return [3 /*break*/, 6];
            case 5:
              error_3 = _a.sent();
              console.error("Error refreshing session:", error_3);
              return [2 /*return*/, false];
            case 6:
              return [2 /*return*/];
          }
        });
      });
    },
    [router],
  );
  /**
   * Destroy current session
   */
  var destroySession = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        var error_4;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 2, , 3]);
              return [4 /*yield*/, SessionManager_1.sessionManager.destroySession()];
            case 1:
              _a.sent();
              setSession(null);
              setActiveSessions([]);
              setShouldRefreshToken(false);
              router.push("/auth/login");
              return [3 /*break*/, 3];
            case 2:
              error_4 = _a.sent();
              console.error("Error destroying session:", error_4);
              return [3 /*break*/, 3];
            case 3:
              return [2 /*return*/];
          }
        });
      });
    },
    [router],
  );
  /**
   * Update user activity
   */
  var updateActivity = (0, react_1.useCallback)(function (action, metadata) {
    return __awaiter(_this, void 0, void 0, function () {
      var updatedSession, error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              SessionManager_1.sessionManager.updateActivity(action, metadata),
              // Update local session state
            ];
          case 1:
            _a.sent();
            return [4 /*yield*/, SessionManager_1.sessionManager.getCurrentSession()];
          case 2:
            updatedSession = _a.sent();
            setSession(updatedSession);
            return [3 /*break*/, 4];
          case 3:
            error_5 = _a.sent();
            console.error("Error updating activity:", error_5);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  }, []);
  /**
   * Terminate specific session
   */
  var terminateSession = (0, react_1.useCallback)(function (sessionId) {
    return __awaiter(_this, void 0, void 0, function () {
      var success, sessions, error_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [4 /*yield*/, SessionManager_1.sessionManager.terminateSession(sessionId)];
          case 1:
            success = _a.sent();
            if (!success) return [3 /*break*/, 3];
            return [4 /*yield*/, SessionManager_1.sessionManager.getActiveSessions()];
          case 2:
            sessions = _a.sent();
            setActiveSessions(sessions);
            _a.label = 3;
          case 3:
            return [2 /*return*/, success];
          case 4:
            error_6 = _a.sent();
            console.error("Error terminating session:", error_6);
            return [2 /*return*/, false];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  }, []);
  return {
    session: session,
    isLoading: isLoading,
    isAuthenticated: !!session,
    refreshSession: refreshSession,
    destroySession: destroySession,
    updateActivity: updateActivity,
    activeSessions: activeSessions,
    terminateSession: terminateSession,
    shouldRefreshToken: shouldRefreshToken,
  };
}
// Hook for session activity tracking
function useSessionActivity() {
  var updateActivity = useSession().updateActivity;
  /**
   * Track page navigation
   */
  var trackNavigation = (0, react_1.useCallback)(
    function (route) {
      updateActivity("navigation", { route: route });
    },
    [updateActivity],
  );
  /**
   * Track user actions
   */
  var trackAction = (0, react_1.useCallback)(
    function (action, metadata) {
      updateActivity(action, metadata);
    },
    [updateActivity],
  );
  /**
   * Track form submissions
   */
  var trackFormSubmission = (0, react_1.useCallback)(
    function (formName, success) {
      updateActivity("form_submission", { formName: formName, success: success });
    },
    [updateActivity],
  );
  /**
   * Track API calls
   */
  var trackApiCall = (0, react_1.useCallback)(
    function (endpoint, method, status) {
      updateActivity("api_call", { endpoint: endpoint, method: method, status: status });
    },
    [updateActivity],
  );
  return {
    trackNavigation: trackNavigation,
    trackAction: trackAction,
    trackFormSubmission: trackFormSubmission,
    trackApiCall: trackApiCall,
  };
}

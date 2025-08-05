"use strict";
// SSO React Hook
// Story 1.3: SSO Integration - React Hook for Frontend
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
exports.useSSO = useSSO;
exports.useSSOSession = useSSOSession;
exports.useSSOProviders = useSSOProviders;
var react_1 = require("react");
var navigation_1 = require("next/navigation");
var auth_helpers_nextjs_1 = require("@supabase/auth-helpers-nextjs");
var logger_1 = require("@/lib/logger");
var sonner_1 = require("sonner");
function useSSO(options) {
  var _this = this;
  if (options === void 0) {
    options = {};
  }
  var _a = options.autoRefresh,
    autoRefresh = _a === void 0 ? true : _a,
    _b = options.refreshThreshold,
    refreshThreshold = _b === void 0 ? 5 : _b,
    onSessionExpired = options.onSessionExpired,
    onError = options.onError;
  var router = (0, navigation_1.useRouter)();
  var _c = (0, auth_helpers_nextjs_1.useUser)(),
    currentUser = _c.user,
    refreshUser = _c.refreshUser;
  var _d = (0, react_1.useState)({
      isLoading: true,
      isAuthenticated: false,
      session: null,
      user: null,
      error: null,
      availableProviders: [],
    }),
    state = _d[0],
    setState = _d[1];
  /**
   * Load available SSO providers
   */
  var loadProviders = (0, react_1.useCallback)(function () {
    return __awaiter(_this, void 0, void 0, function () {
      var response, providers_1, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [4 /*yield*/, fetch("/api/auth/sso/providers")];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            providers_1 = _a.sent();
            setState(function (prev) {
              return __assign(__assign({}, prev), { availableProviders: providers_1 });
            });
            _a.label = 3;
          case 3:
            return [3 /*break*/, 5];
          case 4:
            error_1 = _a.sent();
            logger_1.logger.error("Failed to load SSO providers", { error: error_1.message });
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  }, []);
  /**
   * Load current SSO session
   */
  var loadSession = (0, react_1.useCallback)(function () {
    return __awaiter(_this, void 0, void 0, function () {
      var response, session_1, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 6]);
            setState(function (prev) {
              return __assign(__assign({}, prev), { isLoading: true });
            });
            return [
              4 /*yield*/,
              fetch("/api/auth/sso/session", {
                credentials: "include",
              }),
            ];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            session_1 = _a.sent();
            setState(function (prev) {
              return __assign(__assign({}, prev), {
                isLoading: false,
                isAuthenticated: true,
                session: session_1,
                user: session_1.userInfo,
                error: null,
              });
            });
            return [3 /*break*/, 4];
          case 3:
            setState(function (prev) {
              return __assign(__assign({}, prev), {
                isLoading: false,
                isAuthenticated: false,
                session: null,
                user: null,
              });
            });
            _a.label = 4;
          case 4:
            return [3 /*break*/, 6];
          case 5:
            error_2 = _a.sent();
            logger_1.logger.error("Failed to load SSO session", { error: error_2.message });
            setState(function (prev) {
              return __assign(__assign({}, prev), {
                isLoading: false,
                isAuthenticated: false,
                session: null,
                user: null,
                error: {
                  code: "SESSION_LOAD_FAILED",
                  message: "Failed to load session",
                  timestamp: new Date(),
                },
              });
            });
            return [3 /*break*/, 6];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  }, []);
  /**
   * Sign in with SSO provider
   */
  var signInWithSSO = (0, react_1.useCallback)(
    function (providerId_1) {
      var args_1 = [];
      for (var _i = 1; _i < arguments.length; _i++) {
        args_1[_i - 1] = arguments[_i];
      }
      return __awaiter(
        _this,
        __spreadArray([providerId_1], args_1, true),
        void 0,
        function (providerId, options) {
          var params, response, errorData, authUrl, error_3, ssoError_1;
          if (options === void 0) {
            options = {};
          }
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                _a.trys.push([0, 5, , 6]);
                setState(function (prev) {
                  return __assign(__assign({}, prev), { isLoading: true, error: null });
                });
                params = new URLSearchParams(
                  __assign(
                    __assign(
                      __assign(
                        __assign(
                          { provider: providerId },
                          options.redirectTo && { redirect_to: options.redirectTo },
                        ),
                        options.loginHint && { login_hint: options.loginHint },
                      ),
                      options.domainHint && { domain_hint: options.domainHint },
                    ),
                    options.prompt && { prompt: options.prompt },
                  ),
                );
                return [4 /*yield*/, fetch("/api/auth/sso/authorize?".concat(params.toString()))];
              case 1:
                response = _a.sent();
                if (!!response.ok) return [3 /*break*/, 3];
                return [4 /*yield*/, response.json()];
              case 2:
                errorData = _a.sent();
                throw new Error(errorData.message || "Failed to generate auth URL");
              case 3:
                return [4 /*yield*/, response.json()];
              case 4:
                authUrl = _a.sent().authUrl;
                logger_1.logger.info("SSO: Redirecting to provider", {
                  providerId: providerId,
                  authUrl: authUrl,
                });
                // Redirect to SSO provider
                window.location.href = authUrl;
                return [3 /*break*/, 6];
              case 5:
                error_3 = _a.sent();
                logger_1.logger.error("SSO sign-in failed", {
                  providerId: providerId,
                  error: error_3.message,
                });
                ssoError_1 = {
                  code: "SIGN_IN_FAILED",
                  message: error_3.message,
                  timestamp: new Date(),
                };
                setState(function (prev) {
                  return __assign(__assign({}, prev), { isLoading: false, error: ssoError_1 });
                });
                onError === null || onError === void 0 ? void 0 : onError(ssoError_1);
                sonner_1.toast.error("Sign-in failed", {
                  description: error_3.message,
                });
                return [3 /*break*/, 6];
              case 6:
                return [2 /*return*/];
            }
          });
        },
      );
    },
    [onError],
  );
  /**
   * Sign out from SSO
   */
  var signOut = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        var response, error_4, ssoError_2;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 5, , 6]);
              setState(function (prev) {
                return __assign(__assign({}, prev), { isLoading: true });
              });
              return [
                4 /*yield*/,
                fetch("/api/auth/sso/logout", {
                  method: "POST",
                  credentials: "include",
                }),
              ];
            case 1:
              response = _a.sent();
              if (!response.ok) return [3 /*break*/, 3];
              setState(function (prev) {
                return __assign(__assign({}, prev), {
                  isLoading: false,
                  isAuthenticated: false,
                  session: null,
                  user: null,
                  error: null,
                });
              });
              // Refresh user context
              return [4 /*yield*/, refreshUser()];
            case 2:
              // Refresh user context
              _a.sent();
              logger_1.logger.info("SSO: Sign-out successful");
              sonner_1.toast.success("Signed out successfully");
              // Redirect to login page
              router.push("/auth/login");
              return [3 /*break*/, 4];
            case 3:
              throw new Error("Sign-out failed");
            case 4:
              return [3 /*break*/, 6];
            case 5:
              error_4 = _a.sent();
              logger_1.logger.error("SSO sign-out failed", { error: error_4.message });
              ssoError_2 = {
                code: "SIGN_OUT_FAILED",
                message: error_4.message,
                timestamp: new Date(),
              };
              setState(function (prev) {
                return __assign(__assign({}, prev), { isLoading: false, error: ssoError_2 });
              });
              onError === null || onError === void 0 ? void 0 : onError(ssoError_2);
              sonner_1.toast.error("Sign-out failed", {
                description: error_4.message,
              });
              return [3 /*break*/, 6];
            case 6:
              return [2 /*return*/];
          }
        });
      });
    },
    [router, refreshUser, onError],
  );
  /**
   * Refresh SSO session
   */
  var refreshSession = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        var response, session_2, error_5;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 6, , 8]);
              if (!state.session) return [2 /*return*/];
              return [
                4 /*yield*/,
                fetch("/api/auth/sso/refresh", {
                  method: "POST",
                  credentials: "include",
                }),
              ];
            case 1:
              response = _a.sent();
              if (!response.ok) return [3 /*break*/, 3];
              return [4 /*yield*/, response.json()];
            case 2:
              session_2 = _a.sent();
              setState(function (prev) {
                return __assign(__assign({}, prev), {
                  session: session_2,
                  user: session_2.userInfo,
                  error: null,
                });
              });
              logger_1.logger.info("SSO: Session refreshed successfully");
              return [3 /*break*/, 5];
            case 3:
              // Session refresh failed, sign out
              return [4 /*yield*/, signOut()];
            case 4:
              // Session refresh failed, sign out
              _a.sent();
              onSessionExpired === null || onSessionExpired === void 0
                ? void 0
                : onSessionExpired();
              _a.label = 5;
            case 5:
              return [3 /*break*/, 8];
            case 6:
              error_5 = _a.sent();
              logger_1.logger.error("SSO session refresh failed", { error: error_5.message });
              return [4 /*yield*/, signOut()];
            case 7:
              _a.sent();
              onSessionExpired === null || onSessionExpired === void 0
                ? void 0
                : onSessionExpired();
              return [3 /*break*/, 8];
            case 8:
              return [2 /*return*/];
          }
        });
      });
    },
    [state.session, signOut, onSessionExpired],
  );
  /**
   * Clear error state
   */
  var clearError = (0, react_1.useCallback)(function () {
    setState(function (prev) {
      return __assign(__assign({}, prev), { error: null });
    });
  }, []);
  /**
   * Get SSO provider for domain
   */
  var getDomainProvider = (0, react_1.useCallback)(function (email) {
    var domain = email.split("@")[1];
    if (!domain) return null;
    // This would typically call an API to check domain mappings
    // For now, return null (no automatic domain mapping)
    return null;
  }, []);
  /**
   * Auto-refresh session when near expiry
   */
  (0, react_1.useEffect)(
    function () {
      if (!autoRefresh || !state.session) return;
      var checkAndRefresh = function () {
        var expiresAt = new Date(state.session.expiresAt);
        var now = new Date();
        var minutesUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60);
        if (minutesUntilExpiry <= refreshThreshold) {
          refreshSession();
        }
      };
      // Check immediately
      checkAndRefresh();
      // Check every minute
      var interval = setInterval(checkAndRefresh, 60000);
      return function () {
        return clearInterval(interval);
      };
    },
    [autoRefresh, state.session, refreshThreshold, refreshSession],
  );
  /**
   * Load initial data
   */
  (0, react_1.useEffect)(
    function () {
      loadProviders();
      loadSession();
    },
    [loadProviders, loadSession],
  );
  /**
   * Handle URL callback after SSO redirect
   */
  (0, react_1.useEffect)(
    function () {
      var handleCallback = function () {
        return __awaiter(_this, void 0, void 0, function () {
          var urlParams,
            code,
            state,
            error,
            errorDescription,
            ssoError_3,
            response,
            session_3,
            redirectTo,
            errorData,
            error_6,
            ssoError_4;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                urlParams = new URLSearchParams(window.location.search);
                code = urlParams.get("code");
                state = urlParams.get("state");
                error = urlParams.get("error");
                if (error) {
                  errorDescription = urlParams.get("error_description");
                  logger_1.logger.error("SSO callback error", {
                    error: error,
                    errorDescription: errorDescription,
                  });
                  ssoError_3 = {
                    code: "CALLBACK_ERROR",
                    message: errorDescription || error,
                    timestamp: new Date(),
                  };
                  setState(function (prev) {
                    return __assign(__assign({}, prev), { isLoading: false, error: ssoError_3 });
                  });
                  onError === null || onError === void 0 ? void 0 : onError(ssoError_3);
                  sonner_1.toast.error("Authentication failed", {
                    description: errorDescription || error,
                  });
                  // Clean URL
                  router.replace("/auth/login");
                  return [2 /*return*/];
                }
                if (!(code && state)) return [3 /*break*/, 9];
                _a.label = 1;
              case 1:
                _a.trys.push([1, 8, , 9]);
                setState(function (prev) {
                  return __assign(__assign({}, prev), { isLoading: true });
                });
                return [
                  4 /*yield*/,
                  fetch("/api/auth/sso/callback", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ code: code, state: state }),
                    credentials: "include",
                  }),
                ];
              case 2:
                response = _a.sent();
                if (!response.ok) return [3 /*break*/, 5];
                return [4 /*yield*/, response.json()];
              case 3:
                session_3 = _a.sent();
                setState(function (prev) {
                  return __assign(__assign({}, prev), {
                    isLoading: false,
                    isAuthenticated: true,
                    session: session_3,
                    user: session_3.userInfo,
                    error: null,
                  });
                });
                // Refresh user context
                return [4 /*yield*/, refreshUser()];
              case 4:
                // Refresh user context
                _a.sent();
                logger_1.logger.info("SSO: Authentication successful");
                sonner_1.toast.success("Signed in successfully");
                redirectTo = urlParams.get("redirect_to") || "/dashboard";
                router.replace(redirectTo);
                return [3 /*break*/, 7];
              case 5:
                return [4 /*yield*/, response.json()];
              case 6:
                errorData = _a.sent();
                throw new Error(errorData.message || "Authentication failed");
              case 7:
                return [3 /*break*/, 9];
              case 8:
                error_6 = _a.sent();
                logger_1.logger.error("SSO callback processing failed", { error: error_6.message });
                ssoError_4 = {
                  code: "CALLBACK_PROCESSING_FAILED",
                  message: error_6.message,
                  timestamp: new Date(),
                };
                setState(function (prev) {
                  return __assign(__assign({}, prev), { isLoading: false, error: ssoError_4 });
                });
                onError === null || onError === void 0 ? void 0 : onError(ssoError_4);
                sonner_1.toast.error("Authentication failed", {
                  description: error_6.message,
                });
                router.replace("/auth/login");
                return [3 /*break*/, 9];
              case 9:
                return [2 /*return*/];
            }
          });
        });
      };
      handleCallback();
    },
    [router, refreshUser, onError],
  );
  return __assign(__assign({}, state), {
    signInWithSSO: signInWithSSO,
    signOut: signOut,
    refreshSession: refreshSession,
    clearError: clearError,
    getDomainProvider: getDomainProvider,
  });
}
/**
 * Hook for checking if user has SSO session
 */
function useSSOSession() {
  var _a = useSSO({ autoRefresh: false }),
    isAuthenticated = _a.isAuthenticated,
    session = _a.session,
    user = _a.user;
  return {
    hasSession: isAuthenticated,
    session: session,
    user: user,
  };
}
/**
 * Hook for SSO provider information
 */
function useSSOProviders() {
  var availableProviders = useSSO({ autoRefresh: false }).availableProviders;
  return {
    providers: availableProviders,
    getProvider: function (id) {
      return availableProviders.find(function (p) {
        return p.id === id;
      });
    },
    isProviderEnabled: function (id) {
      return availableProviders.some(function (p) {
        return p.id === id && p.enabled;
      });
    },
  };
}

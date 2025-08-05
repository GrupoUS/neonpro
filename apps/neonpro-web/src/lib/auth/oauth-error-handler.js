"use strict";
/**
 * Comprehensive OAuth Error Handler
 * Handles all OAuth-related errors with proper user feedback and recovery mechanisms
 */
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
exports.oauthErrorHandler = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var SessionManager_1 = require("./session/SessionManager");
var performance_tracker_1 = require("./performance-tracker");
var OAuthErrorHandler = /** @class */ (function () {
  function OAuthErrorHandler() {
    this.retryAttempts = new Map();
    this.errorCounts = new Map();
  }
  OAuthErrorHandler.getInstance = function () {
    if (!OAuthErrorHandler.instance) {
      OAuthErrorHandler.instance = new OAuthErrorHandler();
    }
    return OAuthErrorHandler.instance;
  };
  /**
   * Main error handling method
   */
  OAuthErrorHandler.prototype.handleOAuthError = function (error, context) {
    return __awaiter(this, void 0, void 0, function () {
      var startTime, errorDetails, handlingError_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            startTime = Date.now();
            _a.label = 1;
          case 1:
            _a.trys.push([1, 5, , 6]);
            errorDetails = this.classifyError(error, context);
            if (!errorDetails.shouldLog) return [3 /*break*/, 3];
            return [4 /*yield*/, this.logError(error, context, errorDetails)];
          case 2:
            _a.sent();
            _a.label = 3;
          case 3:
            // Track error metrics
            this.trackErrorMetrics(errorDetails.code, context);
            // Handle specific error recovery
            return [4 /*yield*/, this.executeRecoveryAction(errorDetails, context)];
          case 4:
            // Handle specific error recovery
            _a.sent();
            performance_tracker_1.performanceTracker.recordMetric(
              "oauth_error_handling",
              Date.now() - startTime,
            );
            return [2 /*return*/, errorDetails];
          case 5:
            handlingError_1 = _a.sent();
            console.error("Error handler failed:", handlingError_1);
            return [2 /*return*/, this.getFallbackErrorDetails()];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Classify OAuth errors into specific categories
   */
  OAuthErrorHandler.prototype.classifyError = function (error, context) {
    var errorMessage =
      (error === null || error === void 0 ? void 0 : error.message) ||
      (error === null || error === void 0 ? void 0 : error.error_description) ||
      "Unknown error";
    var errorCode =
      (error === null || error === void 0 ? void 0 : error.error) ||
      (error === null || error === void 0 ? void 0 : error.code) ||
      "unknown_error";
    // Google OAuth specific errors
    if (context.provider === "google") {
      return this.classifyGoogleOAuthError(errorCode, errorMessage, context);
    }
    // Supabase Auth errors
    if (error instanceof supabase_js_1.AuthError) {
      return this.classifySupabaseAuthError(error, context);
    }
    // Network and connectivity errors
    if (this.isNetworkError(error)) {
      return this.getNetworkErrorDetails(error, context);
    }
    // Session and token errors
    if (this.isSessionError(errorCode, errorMessage)) {
      return this.getSessionErrorDetails(errorCode, errorMessage, context);
    }
    // Default error handling
    return this.getGenericErrorDetails(errorCode, errorMessage, context);
  };
  /**
   * Handle Google OAuth specific errors
   */
  OAuthErrorHandler.prototype.classifyGoogleOAuthError = function (code, message, context) {
    switch (code) {
      case "access_denied":
        return {
          code: "google_access_denied",
          message: "User denied Google OAuth access",
          userMessage:
            "Acesso negado. Para continuar, você precisa autorizar o acesso à sua conta Google.",
          severity: "medium",
          recoveryAction: {
            type: "retry",
            message: "Tentar novamente",
            retryDelay: 1000,
            maxRetries: 3,
          },
          shouldLog: true,
          shouldNotifyUser: true,
        };
      case "invalid_request":
        return {
          code: "google_invalid_request",
          message: "Invalid OAuth request parameters",
          userMessage: "Erro na solicitação de autenticação. Tente novamente.",
          severity: "high",
          recoveryAction: {
            type: "retry",
            message: "Tentar novamente",
            retryDelay: 2000,
            maxRetries: 2,
          },
          shouldLog: true,
          shouldNotifyUser: true,
        };
      case "invalid_client":
        return {
          code: "google_invalid_client",
          message: "Invalid OAuth client configuration",
          userMessage: "Erro de configuração. Entre em contato com o suporte.",
          severity: "critical",
          recoveryAction: {
            type: "contact_support",
            message: "Entrar em contato com suporte",
          },
          shouldLog: true,
          shouldNotifyUser: true,
        };
      case "invalid_grant":
        return {
          code: "google_invalid_grant",
          message: "Invalid or expired authorization grant",
          userMessage: "Sessão expirada. Faça login novamente.",
          severity: "medium",
          recoveryAction: {
            type: "redirect",
            message: "Fazer login novamente",
          },
          shouldLog: true,
          shouldNotifyUser: true,
        };
      case "temporarily_unavailable":
        return {
          code: "google_temporarily_unavailable",
          message: "Google OAuth service temporarily unavailable",
          userMessage: "Serviço temporariamente indisponível. Tente novamente em alguns minutos.",
          severity: "medium",
          recoveryAction: {
            type: "retry",
            message: "Tentar novamente",
            retryDelay: 30000,
            maxRetries: 3,
          },
          shouldLog: true,
          shouldNotifyUser: true,
        };
      default:
        return this.getGenericGoogleErrorDetails(code, message, context);
    }
  };
  /**
   * Handle Supabase Auth errors
   */
  OAuthErrorHandler.prototype.classifySupabaseAuthError = function (error, context) {
    switch (error.message) {
      case "Invalid login credentials":
        return {
          code: "supabase_invalid_credentials",
          message: error.message,
          userMessage: "Credenciais inválidas. Verifique seu email e senha.",
          severity: "medium",
          recoveryAction: {
            type: "manual",
            message: "Verificar credenciais",
          },
          shouldLog: true,
          shouldNotifyUser: true,
        };
      case "Email not confirmed":
        return {
          code: "supabase_email_not_confirmed",
          message: error.message,
          userMessage: "Email não confirmado. Verifique sua caixa de entrada.",
          severity: "medium",
          recoveryAction: {
            type: "manual",
            message: "Confirmar email",
          },
          shouldLog: true,
          shouldNotifyUser: true,
        };
      case "Too many requests":
        return {
          code: "supabase_rate_limit",
          message: error.message,
          userMessage: "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.",
          severity: "medium",
          recoveryAction: {
            type: "retry",
            message: "Tentar novamente",
            retryDelay: 60000,
            maxRetries: 1,
          },
          shouldLog: true,
          shouldNotifyUser: true,
        };
      default:
        return {
          code: "supabase_auth_error",
          message: error.message,
          userMessage: "Erro de autenticação. Tente novamente.",
          severity: "medium",
          recoveryAction: {
            type: "retry",
            message: "Tentar novamente",
            retryDelay: 2000,
            maxRetries: 2,
          },
          shouldLog: true,
          shouldNotifyUser: true,
        };
    }
  };
  /**
   * Check if error is network-related
   */
  OAuthErrorHandler.prototype.isNetworkError = function (error) {
    var _a, _b;
    var networkErrorCodes = [
      "NETWORK_ERROR",
      "TIMEOUT",
      "CONNECTION_REFUSED",
      "DNS_ERROR",
      "OFFLINE",
    ];
    var errorMessage =
      ((_a = error === null || error === void 0 ? void 0 : error.message) === null || _a === void 0
        ? void 0
        : _a.toLowerCase()) || "";
    var errorCode =
      ((_b = error === null || error === void 0 ? void 0 : error.code) === null || _b === void 0
        ? void 0
        : _b.toUpperCase()) || "";
    return (
      networkErrorCodes.includes(errorCode) ||
      errorMessage.includes("network") ||
      errorMessage.includes("timeout") ||
      errorMessage.includes("connection") ||
      errorMessage.includes("offline") ||
      (error === null || error === void 0 ? void 0 : error.name) === "NetworkError"
    );
  };
  /**
   * Check if error is session-related
   */
  OAuthErrorHandler.prototype.isSessionError = function (code, message) {
    var sessionErrorPatterns = [
      "session",
      "token",
      "expired",
      "invalid_token",
      "unauthorized",
      "forbidden",
    ];
    var lowerMessage = message.toLowerCase();
    var lowerCode = code.toLowerCase();
    return sessionErrorPatterns.some(function (pattern) {
      return lowerMessage.includes(pattern) || lowerCode.includes(pattern);
    });
  };
  /**
   * Get network error details
   */
  OAuthErrorHandler.prototype.getNetworkErrorDetails = function (error, context) {
    return {
      code: "network_error",
      message: error.message || "Network connectivity error",
      userMessage: "Problema de conexão. Verifique sua internet e tente novamente.",
      severity: "medium",
      recoveryAction: {
        type: "retry",
        message: "Tentar novamente",
        retryDelay: 3000,
        maxRetries: 3,
      },
      shouldLog: true,
      shouldNotifyUser: true,
    };
  };
  /**
   * Get session error details
   */
  OAuthErrorHandler.prototype.getSessionErrorDetails = function (code, message, context) {
    return {
      code: "session_error",
      message: "Session error: ".concat(message),
      userMessage: "Sessão expirada. Faça login novamente.",
      severity: "medium",
      recoveryAction: {
        type: "redirect",
        message: "Fazer login novamente",
      },
      shouldLog: true,
      shouldNotifyUser: true,
    };
  };
  /**
   * Get generic Google error details
   */
  OAuthErrorHandler.prototype.getGenericGoogleErrorDetails = function (code, message, context) {
    return {
      code: "google_".concat(code),
      message: "Google OAuth error: ".concat(message),
      userMessage: "Erro na autenticação com Google. Tente novamente.",
      severity: "medium",
      recoveryAction: {
        type: "retry",
        message: "Tentar novamente",
        retryDelay: 2000,
        maxRetries: 2,
      },
      shouldLog: true,
      shouldNotifyUser: true,
    };
  };
  /**
   * Get generic error details
   */
  OAuthErrorHandler.prototype.getGenericErrorDetails = function (code, message, context) {
    return {
      code: code || "unknown_error",
      message: message || "Unknown authentication error",
      userMessage: "Erro de autenticação. Tente novamente.",
      severity: "medium",
      recoveryAction: {
        type: "retry",
        message: "Tentar novamente",
        retryDelay: 2000,
        maxRetries: 2,
      },
      shouldLog: true,
      shouldNotifyUser: true,
    };
  };
  /**
   * Get fallback error details when error handler fails
   */
  OAuthErrorHandler.prototype.getFallbackErrorDetails = function () {
    return {
      code: "error_handler_failure",
      message: "Error handler failed",
      userMessage: "Erro interno. Entre em contato com o suporte.",
      severity: "critical",
      recoveryAction: {
        type: "contact_support",
        message: "Entrar em contato com suporte",
      },
      shouldLog: true,
      shouldNotifyUser: true,
    };
  };
  /**
   * Execute recovery action based on error type
   */
  OAuthErrorHandler.prototype.executeRecoveryAction = function (errorDetails, context) {
    return __awaiter(this, void 0, void 0, function () {
      var recoveryAction, _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            recoveryAction = errorDetails.recoveryAction;
            _a = recoveryAction.type;
            switch (_a) {
              case "retry":
                return [3 /*break*/, 1];
              case "redirect":
                return [3 /*break*/, 3];
              case "manual":
                return [3 /*break*/, 5];
              case "contact_support":
                return [3 /*break*/, 6];
            }
            return [3 /*break*/, 8];
          case 1:
            return [4 /*yield*/, this.handleRetryAction(errorDetails, context)];
          case 2:
            _b.sent();
            return [3 /*break*/, 8];
          case 3:
            return [4 /*yield*/, this.handleRedirectAction(errorDetails, context)];
          case 4:
            _b.sent();
            return [3 /*break*/, 8];
          case 5:
            // Manual actions are handled by UI
            return [3 /*break*/, 8];
          case 6:
            return [4 /*yield*/, this.handleSupportAction(errorDetails, context)];
          case 7:
            _b.sent();
            return [3 /*break*/, 8];
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Handle retry action
   */
  OAuthErrorHandler.prototype.handleRetryAction = function (errorDetails, context) {
    return __awaiter(this, void 0, void 0, function () {
      var retryKey, currentRetries, maxRetries, delay;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            retryKey = ""
              .concat(context.provider, "_")
              .concat(context.operation, "_")
              .concat(context.sessionId || "anonymous");
            currentRetries = this.retryAttempts.get(retryKey) || 0;
            maxRetries = errorDetails.recoveryAction.maxRetries || 3;
            if (!(currentRetries >= maxRetries)) return [3 /*break*/, 2];
            // Max retries reached, escalate to support
            return [4 /*yield*/, this.handleSupportAction(errorDetails, context)];
          case 1:
            // Max retries reached, escalate to support
            _a.sent();
            return [2 /*return*/];
          case 2:
            // Increment retry count
            this.retryAttempts.set(retryKey, currentRetries + 1);
            delay = errorDetails.recoveryAction.retryDelay || 2000;
            setTimeout(function () {
              // Emit retry event for UI to handle
              if (typeof window !== "undefined") {
                window.dispatchEvent(
                  new CustomEvent("oauth-retry", {
                    detail: {
                      errorDetails: errorDetails,
                      context: context,
                      attempt: currentRetries + 1,
                    },
                  }),
                );
              }
            }, delay);
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Handle redirect action
   */
  OAuthErrorHandler.prototype.handleRedirectAction = function (errorDetails, context) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!context.sessionId) return [3 /*break*/, 2];
            return [
              4 /*yield*/,
              SessionManager_1.sessionManager.terminateSession(
                context.sessionId,
                "error_recovery_redirect",
              ),
            ];
          case 1:
            _a.sent();
            _a.label = 2;
          case 2:
            // Emit redirect event for UI to handle
            if (typeof window !== "undefined") {
              window.dispatchEvent(
                new CustomEvent("oauth-redirect", {
                  detail: { errorDetails: errorDetails, context: context },
                }),
              );
            }
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Handle support action
   */
  OAuthErrorHandler.prototype.handleSupportAction = function (errorDetails, context) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            // Log critical error for support team
            return [4 /*yield*/, this.logCriticalError(errorDetails, context)];
          case 1:
            // Log critical error for support team
            _a.sent();
            // Emit support event for UI to handle
            if (typeof window !== "undefined") {
              window.dispatchEvent(
                new CustomEvent("oauth-support-needed", {
                  detail: { errorDetails: errorDetails, context: context },
                }),
              );
            }
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Track error metrics
   */
  OAuthErrorHandler.prototype.trackErrorMetrics = function (errorCode, context) {
    var metricKey = "oauth_error_".concat(errorCode);
    var currentCount = this.errorCounts.get(metricKey) || 0;
    this.errorCounts.set(metricKey, currentCount + 1);
    performance_tracker_1.performanceTracker.recordMetric(metricKey, 1);
    performance_tracker_1.performanceTracker.recordMetric(
      "oauth_error_".concat(context.provider),
      1,
    );
    performance_tracker_1.performanceTracker.recordMetric(
      "oauth_error_".concat(context.operation),
      1,
    );
  };
  /**
   * Log error details
   */
  OAuthErrorHandler.prototype.logError = function (error, context, errorDetails) {
    return __awaiter(this, void 0, void 0, function () {
      var logEntry, logError_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            logEntry = {
              error_code: errorDetails.code,
              error_message: errorDetails.message,
              user_message: errorDetails.userMessage,
              severity: errorDetails.severity,
              provider: context.provider,
              operation: context.operation,
              session_id: context.sessionId,
              user_id: context.userId,
              user_agent: context.userAgent,
              ip_address: context.ipAddress,
              timestamp: new Date(context.timestamp).toISOString(),
              stack_trace: error === null || error === void 0 ? void 0 : error.stack,
              recovery_action: errorDetails.recoveryAction.type,
            };
            // Use existing security audit framework
            return [4 /*yield*/, this.logToSecurityAudit(logEntry)];
          case 1:
            // Use existing security audit framework
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            logError_1 = _a.sent();
            console.error("Error logging failed:", logError_1);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Log critical errors
   */
  OAuthErrorHandler.prototype.logCriticalError = function (errorDetails, context) {
    return __awaiter(this, void 0, void 0, function () {
      var criticalLogEntry, logError_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            criticalLogEntry = __assign(__assign({}, errorDetails), {
              context: context,
              requires_immediate_attention: true,
              escalation_level: "critical",
              timestamp: new Date().toISOString(),
            });
            return [4 /*yield*/, this.logToSecurityAudit(criticalLogEntry)];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            logError_2 = _a.sent();
            console.error("Critical error logging failed:", logError_2);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Log to security audit system
   */
  OAuthErrorHandler.prototype.logToSecurityAudit = function (logEntry) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation would integrate with existing security audit framework
        console.error("OAuth Error:", logEntry);
        return [2 /*return*/];
      });
    });
  };
  /**
   * Clear retry attempts for successful operations
   */
  OAuthErrorHandler.prototype.clearRetryAttempts = function (provider, operation, sessionId) {
    var retryKey = ""
      .concat(provider, "_")
      .concat(operation, "_")
      .concat(sessionId || "anonymous");
    this.retryAttempts.delete(retryKey);
  };
  /**
   * Get error statistics
   */
  OAuthErrorHandler.prototype.getErrorStatistics = function () {
    return Object.fromEntries(this.errorCounts);
  };
  return OAuthErrorHandler;
})();
exports.oauthErrorHandler = OAuthErrorHandler.getInstance();

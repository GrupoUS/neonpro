/**
 * OAuth Error Handling System
 *
 * Comprehensive error handling for OAuth authentication with user-friendly messages,
 * retry mechanisms, error reporting, and network connectivity handling.
 *
 * Features:
 * - User-friendly error messages in PT-BR
 * - Automatic retry with exponential backoff
 * - Error categorization and logging
 * - Network connectivity detection
 * - Fallback authentication flows
 * - Error recovery strategies
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.authErrorHandler = exports.AuthErrorSeverity = exports.AuthErrorType = void 0;
exports.handleAuthError = handleAuthError;
exports.displayAuthError = displayAuthError;
exports.withRetry = withRetry;
var sonner_1 = require("sonner");
// Error types and categories
var AuthErrorType;
((AuthErrorType) => {
  AuthErrorType["OAUTH_PROVIDER"] = "oauth_provider";
  AuthErrorType["NETWORK"] = "network";
  AuthErrorType["SESSION"] = "session";
  AuthErrorType["PERMISSION"] = "permission";
  AuthErrorType["VALIDATION"] = "validation";
  AuthErrorType["SERVER"] = "server";
  AuthErrorType["CLIENT"] = "client";
  AuthErrorType["UNKNOWN"] = "unknown";
})(AuthErrorType || (exports.AuthErrorType = AuthErrorType = {}));
var AuthErrorSeverity;
((AuthErrorSeverity) => {
  AuthErrorSeverity["LOW"] = "low";
  AuthErrorSeverity["MEDIUM"] = "medium";
  AuthErrorSeverity["HIGH"] = "high";
  AuthErrorSeverity["CRITICAL"] = "critical";
})(AuthErrorSeverity || (exports.AuthErrorSeverity = AuthErrorSeverity = {}));
// Error messages in Portuguese
var ERROR_MESSAGES = {
  // OAuth Provider Errors
  oauth_popup_blocked: {
    user: "O navegador bloqueou a janela de autenticação. Permita pop-ups para este site.",
    technical: "OAuth popup window was blocked by browser",
    action: "Clique no ícone de bloqueio na barra de endereços e permita pop-ups",
  },
  oauth_cancelled: {
    user: "Autenticação cancelada. Tente novamente para fazer login.",
    technical: "User cancelled OAuth flow",
    action: 'Clique em "Entrar com Google" novamente',
  },
  oauth_failed: {
    user: "Falha na autenticação com Google. Verifique sua conta e tente novamente.",
    technical: "OAuth authentication failed",
    action: "Verifique se sua conta Google está ativa e tente novamente",
  },
  oauth_timeout: {
    user: "Tempo esgotado para autenticação. Tente novamente.",
    technical: "OAuth flow timed out",
    action: "Tente fazer login novamente",
  },
  // Network Errors
  network_offline: {
    user: "Sem conexão com a internet. Verifique sua conexão e tente novamente.",
    technical: "No network connection detected",
    action: "Verifique sua conexão com a internet",
  },
  network_slow: {
    user: "Conexão lenta detectada. Aguarde um momento.",
    technical: "Slow network connection detected",
    action: "Aguarde enquanto tentamos conectar",
  },
  network_error: {
    user: "Erro de rede. Verifique sua conexão.",
    technical: "Network request failed",
    action: "Verifique sua conexão e tente novamente",
  },
  // Session Errors
  session_expired: {
    user: "Sua sessão expirou. Faça login novamente.",
    technical: "Session token expired",
    action: "Clique para fazer login novamente",
  },
  session_invalid: {
    user: "Sessão inválida. Faça login novamente.",
    technical: "Invalid session token",
    action: "Faça login novamente",
  },
  session_conflict: {
    user: "Muitas sessões ativas. Faça logout de outros dispositivos.",
    technical: "Too many concurrent sessions",
    action: "Gerencie suas sessões ativas",
  },
  // Permission Errors
  permission_denied: {
    user: "Acesso negado. Você não tem permissão para esta ação.",
    technical: "Insufficient permissions",
    action: "Entre em contato com o administrador",
  },
  role_required: {
    user: "Função necessária não encontrada. Entre em contato com o administrador.",
    technical: "Required role not assigned",
    action: "Solicite as permissões necessárias",
  },
  // Server Errors
  server_error: {
    user: "Erro no servidor. Tente novamente em alguns minutos.",
    technical: "Internal server error",
    action: "Aguarde alguns minutos e tente novamente",
  },
  service_unavailable: {
    user: "Serviço temporariamente indisponível.",
    technical: "Service unavailable",
    action: "Tente novamente em alguns minutos",
  },
  // Generic
  unknown_error: {
    user: "Erro inesperado. Tente novamente.",
    technical: "Unknown error occurred",
    action: "Tente novamente ou entre em contato com o suporte",
  },
};
// Retry configuration
var RETRY_CONFIG = {
  MAX_RETRIES: 3,
  BASE_DELAY: 1000, // 1 second
  MAX_DELAY: 10000, // 10 seconds
  BACKOFF_FACTOR: 2,
};
var AuthErrorHandler = /** @class */ (() => {
  function AuthErrorHandler() {
    this.errorLog = [];
  }
  /**
   * Create standardized auth error
   */
  AuthErrorHandler.prototype.createError = function (type, code, originalError, metadata) {
    var errorConfig = ERROR_MESSAGES[code] || ERROR_MESSAGES["unknown_error"];
    var authError = {
      type: type,
      code: code,
      message:
        (originalError === null || originalError === void 0 ? void 0 : originalError.message) ||
        errorConfig.technical,
      details: __assign(
        {
          originalError:
            originalError === null || originalError === void 0 ? void 0 : originalError.toString(),
          stack: originalError === null || originalError === void 0 ? void 0 : originalError.stack,
        },
        metadata,
      ),
      severity: this.determineSeverity(type, code),
      timestamp: Date.now(),
      userMessage: errorConfig.user,
      actionable: !!errorConfig.action,
      retryable: this.isRetryable(type, code),
      fallbackAvailable: this.hasFallback(type, code),
    };
    this.logError(authError);
    return authError;
  };
  /**
   * Handle OAuth-specific errors
   */
  AuthErrorHandler.prototype.handleOAuthError = function (error) {
    var _a, _b, _c;
    var code = "oauth_failed";
    if (
      (_a = error === null || error === void 0 ? void 0 : error.message) === null || _a === void 0
        ? void 0
        : _a.includes("popup")
    ) {
      code = "oauth_popup_blocked";
    } else if (
      (_b = error === null || error === void 0 ? void 0 : error.message) === null || _b === void 0
        ? void 0
        : _b.includes("cancelled")
    ) {
      code = "oauth_cancelled";
    } else if (
      (_c = error === null || error === void 0 ? void 0 : error.message) === null || _c === void 0
        ? void 0
        : _c.includes("timeout")
    ) {
      code = "oauth_timeout";
    }
    return this.createError(AuthErrorType.OAUTH_PROVIDER, code, error);
  };
  /**
   * Handle network errors
   */
  AuthErrorHandler.prototype.handleNetworkError = function (error) {
    var code = "network_error";
    if (!navigator.onLine) {
      code = "network_offline";
    } else if ((error === null || error === void 0 ? void 0 : error.code) === "TIMEOUT") {
      code = "network_slow";
    }
    return this.createError(AuthErrorType.NETWORK, code, error);
  };
  /**
   * Handle session errors
   */
  AuthErrorHandler.prototype.handleSessionError = function (error) {
    var _a, _b;
    var code = "session_invalid";
    if (
      (_a = error === null || error === void 0 ? void 0 : error.message) === null || _a === void 0
        ? void 0
        : _a.includes("expired")
    ) {
      code = "session_expired";
    } else if (
      (_b = error === null || error === void 0 ? void 0 : error.message) === null || _b === void 0
        ? void 0
        : _b.includes("concurrent")
    ) {
      code = "session_conflict";
    }
    return this.createError(AuthErrorType.SESSION, code, error);
  };
  /**
   * Display user-friendly error message
   */
  AuthErrorHandler.prototype.displayError = function (error) {
    var errorConfig = ERROR_MESSAGES[error.code] || ERROR_MESSAGES["unknown_error"];
    // Choose appropriate toast type based on severity
    var toastOptions = {
      duration: this.getToastDuration(error.severity),
      action: error.actionable
        ? {
            label: "Como resolver",
            onClick: () => this.showErrorDetails(error),
          }
        : undefined,
    };
    switch (error.severity) {
      case AuthErrorSeverity.LOW:
        sonner_1.toast.info(error.userMessage, toastOptions);
        break;
      case AuthErrorSeverity.MEDIUM:
        sonner_1.toast.warning(error.userMessage, toastOptions);
        break;
      case AuthErrorSeverity.HIGH:
      case AuthErrorSeverity.CRITICAL:
        sonner_1.toast.error(error.userMessage, toastOptions);
        break;
    }
  };
  /**
   * Show detailed error information
   */
  AuthErrorHandler.prototype.showErrorDetails = (error) => {
    var errorConfig = ERROR_MESSAGES[error.code] || ERROR_MESSAGES["unknown_error"];
    sonner_1.toast.info(errorConfig.action || "Entre em contato com o suporte", {
      duration: 8000,
    });
  };
  /**
   * Retry mechanism with exponential backoff
   */
  AuthErrorHandler.prototype.retry = function (operation_1, errorType_1) {
    return __awaiter(this, arguments, void 0, function (operation, errorType, maxRetries) {
      var lastError, _loop_1, this_1, attempt, state_1;
      if (maxRetries === void 0) {
        maxRetries = RETRY_CONFIG.MAX_RETRIES;
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _loop_1 = function (attempt) {
              var delay_1, _b, error_1, authError;
              return __generator(this, (_c) => {
                switch (_c.label) {
                  case 0:
                    _c.trys.push([0, 4, , 5]);
                    if (!(attempt > 0)) return [3 /*break*/, 2];
                    delay_1 = Math.min(
                      RETRY_CONFIG.BASE_DELAY * RETRY_CONFIG.BACKOFF_FACTOR ** (attempt - 1),
                      RETRY_CONFIG.MAX_DELAY,
                    );
                    sonner_1.toast.info(
                      "Tentativa ".concat(attempt + 1, " de ").concat(maxRetries + 1, "..."),
                      {
                        duration: delay_1,
                      },
                    );
                    return [4 /*yield*/, new Promise((resolve) => setTimeout(resolve, delay_1))];
                  case 1:
                    _c.sent();
                    _c.label = 2;
                  case 2:
                    _b = {};
                    return [4 /*yield*/, operation()];
                  case 3:
                    return [2 /*return*/, ((_b.value = _c.sent()), _b)];
                  case 4:
                    error_1 = _c.sent();
                    lastError = error_1;
                    authError = this_1.createError(errorType, "retry_failed", error_1, {
                      attempt: attempt + 1,
                      maxRetries: maxRetries + 1,
                    });
                    if (!authError.retryable || attempt === maxRetries) {
                      this_1.displayError(authError);
                      throw error_1;
                    }
                    return [3 /*break*/, 5];
                  case 5:
                    return [2 /*return*/];
                }
              });
            };
            this_1 = this;
            attempt = 0;
            _a.label = 1;
          case 1:
            if (!(attempt <= maxRetries)) return [3 /*break*/, 4];
            return [5 /*yield**/, _loop_1(attempt)];
          case 2:
            state_1 = _a.sent();
            if (typeof state_1 === "object") return [2 /*return*/, state_1.value];
            _a.label = 3;
          case 3:
            attempt++;
            return [3 /*break*/, 1];
          case 4:
            throw lastError;
        }
      });
    });
  };
  /**
   * Check network connectivity
   */
  AuthErrorHandler.prototype.checkConnectivity = function () {
    return __awaiter(this, void 0, void 0, function () {
      var error, error_2, authError;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!navigator.onLine) {
              error = this.createError(AuthErrorType.NETWORK, "network_offline");
              this.displayError(error);
              return [2 /*return*/, false];
            }
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, , 4]);
            // Test connectivity with a simple request
            return [
              4 /*yield*/,
              fetch("/api/health", {
                method: "HEAD",
                cache: "no-cache",
              }),
            ];
          case 2:
            // Test connectivity with a simple request
            _a.sent();
            return [2 /*return*/, true];
          case 3:
            error_2 = _a.sent();
            authError = this.handleNetworkError(error_2);
            this.displayError(authError);
            return [2 /*return*/, false];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get fallback authentication options
   */
  AuthErrorHandler.prototype.getFallbackOptions = (error) => {
    var fallbacks = [];
    if (error.type === AuthErrorType.OAUTH_PROVIDER) {
      fallbacks.push("email_password");
    }
    if (error.type === AuthErrorType.NETWORK) {
      fallbacks.push("offline_mode");
    }
    return fallbacks;
  };
  /**
   * Get error statistics
   */
  AuthErrorHandler.prototype.getErrorStats = function () {
    var stats = {};
    this.errorLog.forEach((error) => {
      var key = "".concat(error.type, "_").concat(error.code);
      stats[key] = (stats[key] || 0) + 1;
    });
    return stats;
  };
  /**
   * Clear error log
   */
  AuthErrorHandler.prototype.clearErrorLog = function () {
    this.errorLog = [];
  };
  // Private methods
  AuthErrorHandler.prototype.logError = function (error) {
    this.errorLog.push(error);
    // Keep only last 100 errors
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100);
    }
    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Auth Error:", error);
    }
    // Send to monitoring service in production
    if (process.env.NODE_ENV === "production") {
      this.sendToMonitoring(error);
    }
  };
  AuthErrorHandler.prototype.determineSeverity = (type, code) => {
    // Critical errors
    if (type === AuthErrorType.SERVER || code.includes("critical")) {
      return AuthErrorSeverity.CRITICAL;
    }
    // High severity errors
    if (type === AuthErrorType.PERMISSION || type === AuthErrorType.SESSION) {
      return AuthErrorSeverity.HIGH;
    }
    // Medium severity errors
    if (type === AuthErrorType.OAUTH_PROVIDER || type === AuthErrorType.NETWORK) {
      return AuthErrorSeverity.MEDIUM;
    }
    return AuthErrorSeverity.LOW;
  };
  AuthErrorHandler.prototype.isRetryable = (type, code) => {
    var nonRetryable = ["oauth_cancelled", "permission_denied", "role_required"];
    return !nonRetryable.includes(code) && type !== AuthErrorType.PERMISSION;
  };
  AuthErrorHandler.prototype.hasFallback = (type, code) =>
    type === AuthErrorType.OAUTH_PROVIDER || type === AuthErrorType.NETWORK;
  AuthErrorHandler.prototype.getToastDuration = (severity) => {
    switch (severity) {
      case AuthErrorSeverity.LOW:
        return 3000;
      case AuthErrorSeverity.MEDIUM:
        return 5000;
      case AuthErrorSeverity.HIGH:
        return 8000;
      case AuthErrorSeverity.CRITICAL:
        return 10000;
      default:
        return 5000;
    }
  };
  AuthErrorHandler.prototype.sendToMonitoring = function (error) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        try {
          // Send to monitoring service (implement based on your monitoring setup)
          // Example: Sentry, LogRocket, DataDog, etc.
          console.log("Sending error to monitoring:", error);
        } catch (monitoringError) {
          console.error("Failed to send error to monitoring:", monitoringError);
        }
        return [2 /*return*/];
      });
    });
  };
  return AuthErrorHandler;
})();
// Export singleton instance
exports.authErrorHandler = new AuthErrorHandler();
// Export utility functions
function handleAuthError(error, type) {
  var _a, _b, _c, _d;
  if (type) {
    return exports.authErrorHandler.createError(type, "unknown_error", error);
  }
  // Auto-detect error type
  if (
    ((_a = error === null || error === void 0 ? void 0 : error.message) === null || _a === void 0
      ? void 0
      : _a.includes("oauth")) ||
    ((_b = error === null || error === void 0 ? void 0 : error.message) === null || _b === void 0
      ? void 0
      : _b.includes("google"))
  ) {
    return exports.authErrorHandler.handleOAuthError(error);
  }
  if (
    !navigator.onLine ||
    (error === null || error === void 0 ? void 0 : error.code) === "NETWORK_ERROR"
  ) {
    return exports.authErrorHandler.handleNetworkError(error);
  }
  if (
    ((_c = error === null || error === void 0 ? void 0 : error.message) === null || _c === void 0
      ? void 0
      : _c.includes("session")) ||
    ((_d = error === null || error === void 0 ? void 0 : error.message) === null || _d === void 0
      ? void 0
      : _d.includes("token"))
  ) {
    return exports.authErrorHandler.handleSessionError(error);
  }
  return exports.authErrorHandler.createError(AuthErrorType.UNKNOWN, "unknown_error", error);
}
function displayAuthError(error, type) {
  var authError = handleAuthError(error, type);
  exports.authErrorHandler.displayError(authError);
}
function withRetry(operation, type) {
  if (type === void 0) {
    type = AuthErrorType.UNKNOWN;
  }
  return exports.authErrorHandler.retry(operation, type);
}

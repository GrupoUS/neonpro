// Comprehensive Error Handling System with LGPD Compliance
"use client";
"use strict";
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
exports.useErrorHandling = useErrorHandling;
var react_1 = require("react");
var client_1 = require("@/lib/supabase/client");
var use_toast_1 = require("@/hooks/use-toast");
// LGPD-compliant error message templates (PT-BR)
var ERROR_TEMPLATES = {
  // Network Errors
  NETWORK_UNAVAILABLE: {
    category: "network",
    severity: "medium",
    title: "Conexão Indisponível",
    message: "Não foi possível conectar ao servidor. Verifique sua conexão com a internet.",
    suggestedActions: [
      "Verifique sua conexão com a internet",
      "Tente novamente em alguns instantes",
      "Entre em contato com o suporte se o problema persistir",
    ],
    canRetry: true,
    retryDelay: 5000,
  },
  NETWORK_TIMEOUT: {
    category: "network",
    severity: "medium",
    title: "Tempo Limite Excedido",
    message: "A operação demorou mais que o esperado. Isso pode indicar lentidão na rede.",
    suggestedActions: [
      "Tente novamente",
      "Verifique a velocidade da sua conexão",
      "Aguarde alguns minutos e tente novamente",
    ],
    canRetry: true,
    retryDelay: 3000,
  },
  // Authentication Errors (LGPD-compliant - no personal data exposure)
  AUTH_INVALID_CREDENTIALS: {
    category: "authentication",
    severity: "low",
    title: "Credenciais Inválidas",
    message: "Email ou senha incorretos. Verifique suas informações e tente novamente.",
    suggestedActions: [
      "Verifique se digitou o email corretamente",
      "Confirme sua senha",
      'Use "Esqueci minha senha" se necessário',
    ],
    helpUrl: "/auth/forgot-password",
    canRetry: true,
  },
  AUTH_SESSION_EXPIRED: {
    category: "authentication",
    severity: "medium",
    title: "Sessão Expirada",
    message: "Sua sessão expirou por segurança. Por favor, faça login novamente.",
    suggestedActions: [
      "Faça login novamente",
      "Seus dados não foram perdidos",
      'Configure "Lembrar-me" para sessões mais longas',
    ],
    helpUrl: "/auth/login",
    canRetry: false,
  },
  // Authorization Errors (LGPD-compliant)
  AUTH_INSUFFICIENT_PERMISSIONS: {
    category: "authorization",
    severity: "medium",
    title: "Acesso Não Autorizado",
    message: "Você não tem permissão para executar esta ação. Entre em contato com seu supervisor.",
    suggestedActions: [
      "Verifique se você tem as permissões necessárias",
      "Entre em contato com o administrador do sistema",
      "Faça login com uma conta autorizada",
    ],
    requiresSupport: true,
    canRetry: false,
  },
  // Validation Errors (Data-protective)
  VALIDATION_REQUIRED_FIELD: {
    category: "validation",
    severity: "low",
    title: "Campo Obrigatório",
    message: "Alguns campos obrigatórios não foram preenchidos. Verifique o formulário.",
    suggestedActions: [
      "Preencha todos os campos marcados com *",
      "Verifique se os dados estão no formato correto",
      "Salve o formulário após preencher",
    ],
    canRetry: true,
  },
  VALIDATION_INVALID_FORMAT: {
    category: "validation",
    severity: "low",
    title: "Formato Inválido",
    message: "Alguns dados não estão no formato esperado. Verifique as informações.",
    suggestedActions: [
      "Verifique o formato dos campos (email, telefone, CPF)",
      "Use apenas números para campos numéricos",
      "Consulte os exemplos fornecidos",
    ],
    canRetry: true,
  },
  // Conflict Errors (Healthcare-specific)
  APPOINTMENT_CONFLICT: {
    category: "conflict",
    severity: "medium",
    title: "Conflito de Agendamento",
    message: "Já existe um agendamento neste horário. Escolha um horário alternativo.",
    suggestedActions: [
      "Escolha um horário diferente",
      "Veja os horários sugeridos automaticamente",
      "Entre em contato para reagendar agendamentos existentes",
    ],
    helpUrl: "/help/scheduling-conflicts",
    canRetry: true,
  },
  // System Errors (Privacy-protective)
  SYSTEM_MAINTENANCE: {
    category: "system",
    severity: "high",
    title: "Sistema em Manutenção",
    message: "O sistema está temporariamente indisponível para manutenção programada.",
    suggestedActions: [
      "Tente novamente em alguns minutos",
      "Verifique nossos canais de comunicação para atualizações",
      "Seus dados estão seguros e serão preservados",
    ],
    canRetry: true,
    retryDelay: 60000, // 1 minute
  },
  SYSTEM_OVERLOAD: {
    category: "system",
    severity: "high",
    title: "Sistema Sobrecarregado",
    message: "O sistema está com alta demanda. Aguarde um momento e tente novamente.",
    suggestedActions: [
      "Aguarde alguns minutos",
      "Evite múltiplas tentativas simultâneas",
      "Tente novamente fora dos horários de pico",
    ],
    canRetry: true,
    retryDelay: 30000, // 30 seconds
  },
  // Data Processing Errors (LGPD-compliant)
  DATA_PROCESSING_ERROR: {
    category: "data_processing",
    severity: "medium",
    title: "Erro no Processamento",
    message: "Ocorreu um erro ao processar suas informações. Seus dados não foram alterados.",
    suggestedActions: [
      "Tente a operação novamente",
      "Verifique se todos os dados estão corretos",
      "Entre em contato com o suporte se persistir",
    ],
    requiresSupport: true,
    canRetry: true,
  },
  // Privacy Compliance Errors
  PRIVACY_CONSENT_REQUIRED: {
    category: "privacy_compliance",
    severity: "medium",
    title: "Consentimento Necessário",
    message: "Esta operação requer seu consentimento para processamento de dados pessoais.",
    suggestedActions: [
      "Revise e aceite os termos de consentimento",
      "Consulte nossa política de privacidade",
      "Entre em contato para esclarecimentos sobre LGPD",
    ],
    helpUrl: "/privacy/consent",
    canRetry: true,
  },
};
function useErrorHandling() {
  var _this = this;
  var _a = (0, react_1.useState)([]),
    errors = _a[0],
    setErrors = _a[1];
  var _b = (0, react_1.useState)(false),
    isLoading = _b[0],
    setIsLoading = _b[1];
  var toast = (0, use_toast_1.useToast)().toast;
  var supabase = yield (0, client_1.createClient)();
  // Generate unique session ID for error tracking
  var sessionId = (0, react_1.useCallback)(function () {
    if (typeof window !== "undefined") {
      var id = sessionStorage.getItem("session_id");
      if (!id) {
        id = "sess_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
        sessionStorage.setItem("session_id", id);
      }
      return id;
    }
    return "sess_".concat(Date.now());
  }, []);
  // Create comprehensive error context following LGPD principles
  var createErrorContext = (0, react_1.useCallback)(
    function (component, action, metadata) {
      return {
        component: component,
        action: action,
        sessionId: sessionId(),
        timestamp: new Date().toISOString(),
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "server",
        metadata: metadata
          ? __assign(__assign({}, metadata), { sensitive_data_removed: true })
          : undefined,
      };
    },
    [sessionId],
  );
  // Create standardized error following privacy-by-design principles
  var createError = (0, react_1.useCallback)(function (
    errorCode,
    context,
    customMessage,
    customDetails,
  ) {
    var template = ERROR_TEMPLATES[errorCode] || ERROR_TEMPLATES["SYSTEM_MAINTENANCE"];
    var error = __assign(
      {
        id: "err_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9)),
        code: errorCode,
        title: template.title || "Erro do Sistema",
        message: customMessage || template.message || "Ocorreu um erro inesperado.",
        category: template.category || "system",
        severity: template.severity || "medium",
        suggestedActions: template.suggestedActions || ["Entre em contato com o suporte"],
        context: context,
        isUserFacing: true,
        requiresSupport: template.requiresSupport || false,
        helpUrl: template.helpUrl,
        canRetry: template.canRetry || false,
        retryDelay: template.retryDelay,
      },
      customDetails,
    );
    return error;
  }, []);
  // Log error with LGPD compliance (no sensitive data)
  var logError = (0, react_1.useCallback)(
    function (error, originalError) {
      return __awaiter(_this, void 0, void 0, function () {
        var user, logEntry, logError_1;
        var _a;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              _b.trys.push([0, 3, , 4]);
              return [4 /*yield*/, supabase.auth.getUser()];
            case 1:
              user = _b.sent().data.user;
              logEntry = {
                error_id: error.id,
                error_code: error.code,
                category: error.category,
                severity: error.severity,
                user_id: (user === null || user === void 0 ? void 0 : user.id) || null, // Anonymous if not authenticated
                session_id: error.context.sessionId,
                component: error.context.component,
                action: error.context.action,
                user_agent: error.context.userAgent,
                timestamp: error.context.timestamp,
                can_retry: error.canRetry,
                requires_support: error.requiresSupport,
                // Technical details only for debugging, never expose sensitive data
                technical_details: originalError
                  ? {
                      name: originalError.name,
                      message: originalError.message.substring(0, 200), // Truncate to avoid data exposure
                      stack:
                        (_a = originalError.stack) === null || _a === void 0
                          ? void 0
                          : _a.substring(0, 500), // Limited stack trace
                    }
                  : null,
              };
              return [4 /*yield*/, supabase.from("error_logs").insert([logEntry])];
            case 2:
              _b.sent();
              return [3 /*break*/, 4];
            case 3:
              logError_1 = _b.sent();
              console.error("Failed to log error:", logError_1);
              // Fallback to console logging with privacy considerations
              console.error("[Privacy-Safe Error]", {
                id: error.id,
                code: error.code,
                category: error.category,
                component: error.context.component,
              });
              return [3 /*break*/, 4];
            case 4:
              return [2 /*return*/];
          }
        });
      });
    },
    [supabase],
  );
  // Handle error with progressive disclosure and user-friendly messaging
  var handleError = (0, react_1.useCallback)(
    function (errorCode, component, action, originalError, metadata) {
      return __awaiter(_this, void 0, void 0, function () {
        var context, appError_1;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              setIsLoading(true);
              _a.label = 1;
            case 1:
              _a.trys.push([1, , 3, 4]);
              context = createErrorContext(component, action, metadata);
              appError_1 = createError(errorCode, context);
              // Log for debugging and compliance
              return [4 /*yield*/, logError(appError_1, originalError)];
            case 2:
              // Log for debugging and compliance
              _a.sent();
              // Add to current session errors
              setErrors(function (prev) {
                return __spreadArray(__spreadArray([], prev, true), [appError_1], false);
              });
              // Show user-friendly toast notification
              toast({
                variant:
                  appError_1.severity === "critical" || appError_1.severity === "high"
                    ? "destructive"
                    : "default",
                title: appError_1.title,
                description: appError_1.message,
                action: appError_1.canRetry
                  ? {
                      label: "Tentar Novamente",
                      onClick: function () {
                        // Remove this error from the list when retrying
                        setErrors(function (prev) {
                          return prev.filter(function (e) {
                            return e.id !== appError_1.id;
                          });
                        });
                      },
                    }
                  : undefined,
              });
              return [2 /*return*/, appError_1];
            case 3:
              setIsLoading(false);
              return [7 /*endfinally*/];
            case 4:
              return [2 /*return*/];
          }
        });
      });
    },
    [createErrorContext, createError, logError, toast],
  );
  // Handle different types of API errors with privacy protection
  var handleApiError = (0, react_1.useCallback)(
    function (error, component, action, metadata) {
      return __awaiter(_this, void 0, void 0, function () {
        var errorCode;
        return __generator(this, function (_a) {
          errorCode = "SYSTEM_MAINTENANCE";
          // Map API errors to user-friendly codes without exposing technical details
          if ((error === null || error === void 0 ? void 0 : error.status) === 401) {
            errorCode = "AUTH_SESSION_EXPIRED";
          } else if ((error === null || error === void 0 ? void 0 : error.status) === 403) {
            errorCode = "AUTH_INSUFFICIENT_PERMISSIONS";
          } else if ((error === null || error === void 0 ? void 0 : error.status) === 404) {
            errorCode = "RESOURCE_NOT_FOUND";
          } else if ((error === null || error === void 0 ? void 0 : error.status) === 409) {
            errorCode = "APPOINTMENT_CONFLICT";
          } else if ((error === null || error === void 0 ? void 0 : error.status) === 422) {
            errorCode = "VALIDATION_INVALID_FORMAT";
          } else if ((error === null || error === void 0 ? void 0 : error.status) >= 500) {
            errorCode = "SYSTEM_OVERLOAD";
          } else if ((error === null || error === void 0 ? void 0 : error.name) === "AbortError") {
            errorCode = "NETWORK_TIMEOUT";
          } else if (!navigator.onLine) {
            errorCode = "NETWORK_UNAVAILABLE";
          }
          return [2 /*return*/, handleError(errorCode, component, action, error, metadata)];
        });
      });
    },
    [handleError],
  );
  // Clear specific error
  var clearError = (0, react_1.useCallback)(function (errorId) {
    setErrors(function (prev) {
      return prev.filter(function (error) {
        return error.id !== errorId;
      });
    });
  }, []);
  // Clear all errors
  var clearAllErrors = (0, react_1.useCallback)(function () {
    setErrors([]);
  }, []);
  // Get errors by category for progressive disclosure
  var getErrorsByCategory = (0, react_1.useCallback)(
    function (category) {
      return errors.filter(function (error) {
        return error.category === category;
      });
    },
    [errors],
  );
  // Check if there are critical errors requiring immediate attention
  var hasCriticalErrors = (0, react_1.useCallback)(
    function () {
      return errors.some(function (error) {
        return error.severity === "critical";
      });
    },
    [errors],
  );
  return {
    // State
    errors: errors,
    isLoading: isLoading,
    hasCriticalErrors: hasCriticalErrors(),
    // Actions
    handleError: handleError,
    handleApiError: handleApiError,
    clearError: clearError,
    clearAllErrors: clearAllErrors,
    createError: createError,
    getErrorsByCategory: getErrorsByCategory,
    // Utilities
    ERROR_TEMPLATES: ERROR_TEMPLATES,
  };
}

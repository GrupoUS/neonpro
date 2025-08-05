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
exports.AccessibleAuthForm = AccessibleAuthForm;
var react_1 = require("react");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var card_1 = require("@/components/ui/card");
var alert_1 = require("@/components/ui/alert");
var lucide_react_1 = require("lucide-react");
var client_1 = require("@/app/utils/supabase/client");
var sonner_1 = require("sonner");
function AccessibleAuthForm(_a) {
  var _this = this;
  var onSuccess = _a.onSuccess,
    _b = _a.mode,
    mode = _b === void 0 ? "login" : _b;
  var _c = (0, react_1.useState)(mode),
    formMode = _c[0],
    setFormMode = _c[1];
  var _d = (0, react_1.useState)({
      email: "",
      password: "",
      confirmPassword: "",
    }),
    formData = _d[0],
    setFormData = _d[1];
  var _e = (0, react_1.useState)(false),
    showPassword = _e[0],
    setShowPassword = _e[1];
  var _f = (0, react_1.useState)(false),
    showConfirmPassword = _f[0],
    setShowConfirmPassword = _f[1];
  var _g = (0, react_1.useState)(false),
    isLoading = _g[0],
    setIsLoading = _g[1];
  var _h = (0, react_1.useState)({}),
    errors = _h[0],
    setErrors = _h[1];
  var _j = (0, react_1.useState)({
      announcements: [],
      highContrast: false,
      reducedMotion: false,
      screenReaderActive: false,
    }),
    accessibility = _j[0],
    setAccessibility = _j[1];
  var supabase = (0, client_1.createClient)();
  // Detect screen reader and accessibility preferences
  (0, react_1.useEffect)(function () {
    var checkAccessibilityPreferences = function () {
      var hasScreenReader =
        window.navigator.userAgent.includes("NVDA") ||
        window.navigator.userAgent.includes("JAWS") ||
        "speechSynthesis" in window;
      var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      var prefersHighContrast = window.matchMedia("(prefers-contrast: high)").matches;
      setAccessibility(function (prev) {
        return __assign(__assign({}, prev), {
          screenReaderActive: hasScreenReader,
          reducedMotion: prefersReducedMotion,
          highContrast: prefersHighContrast,
        });
      });
    };
    checkAccessibilityPreferences();
    // Listen for changes in accessibility preferences
    var motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    var contrastQuery = window.matchMedia("(prefers-contrast: high)");
    var handleMotionChange = function (e) {
      setAccessibility(function (prev) {
        return __assign(__assign({}, prev), { reducedMotion: e.matches });
      });
    };
    var handleContrastChange = function (e) {
      setAccessibility(function (prev) {
        return __assign(__assign({}, prev), { highContrast: e.matches });
      });
    };
    motionQuery.addEventListener("change", handleMotionChange);
    contrastQuery.addEventListener("change", handleContrastChange);
    return function () {
      motionQuery.removeEventListener("change", handleMotionChange);
      contrastQuery.removeEventListener("change", handleContrastChange);
    };
  }, []);
  // Announce messages to screen readers
  var announceToScreenReader = function (message) {
    setAccessibility(function (prev) {
      return __assign(__assign({}, prev), {
        announcements: __spreadArray(__spreadArray([], prev.announcements, true), [message], false),
      });
    });
    // Clear announcement after it's been read
    setTimeout(function () {
      setAccessibility(function (prev) {
        return __assign(__assign({}, prev), {
          announcements: prev.announcements.filter(function (a) {
            return a !== message;
          }),
        });
      });
    }, 3000);
  };
  // Validate form with accessibility-friendly error messages
  var validateForm = function () {
    var newErrors = {};
    // Email validation
    if (!formData.email) {
      newErrors.email = "Email é obrigatório para continuar";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Por favor, insira um email válido no formato usuario@dominio.com";
    }
    // Password validation
    if (!formData.password) {
      newErrors.password = "Senha é obrigatória";
    } else if (formMode === "register" && formData.password.length < 8) {
      newErrors.password = "Senha deve ter pelo menos 8 caracteres para segurança";
    }
    // Confirm password validation for registration
    if (formMode === "register") {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Confirmação de senha é obrigatória";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "As senhas não coincidem. Por favor, verifique ambos os campos";
      }
    }
    setErrors(newErrors);
    // Announce errors to screen reader
    var errorCount = Object.keys(newErrors).length;
    if (errorCount > 0) {
      var errorMessage = "Formul\u00E1rio cont\u00E9m "
        .concat(errorCount, " erro")
        .concat(errorCount > 1 ? "s" : "", ". Por favor, corrija os campos destacados.");
      announceToScreenReader(errorMessage);
    }
    return errorCount === 0;
  };
  // Handle form submission
  var handleSubmit = function (e) {
    return __awaiter(_this, void 0, void 0, function () {
      var error, error, error, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            e.preventDefault();
            if (!validateForm()) {
              return [2 /*return*/];
            }
            setIsLoading(true);
            setErrors({});
            _a.label = 1;
          case 1:
            _a.trys.push([1, 8, 9, 10]);
            if (!(formMode === "login")) return [3 /*break*/, 3];
            return [
              4 /*yield*/,
              supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password,
              }),
            ];
          case 2:
            error = _a.sent().error;
            if (error) {
              if (error.message.includes("Invalid login credentials")) {
                setErrors({
                  general:
                    "Email ou senha incorretos. Verifique suas credenciais e tente novamente.",
                });
                announceToScreenReader("Login falhou. Email ou senha incorretos.");
              } else {
                setErrors({ general: "Erro no login: ".concat(error.message) });
                announceToScreenReader("Erro no sistema. Tente novamente em alguns momentos.");
              }
              return [2 /*return*/];
            }
            announceToScreenReader("Login realizado com sucesso. Redirecionando...");
            sonner_1.toast.success("Login realizado com sucesso!");
            onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess();
            return [3 /*break*/, 7];
          case 3:
            if (!(formMode === "register")) return [3 /*break*/, 5];
            return [
              4 /*yield*/,
              supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
              }),
            ];
          case 4:
            error = _a.sent().error;
            if (error) {
              setErrors({ general: "Erro no cadastro: ".concat(error.message) });
              announceToScreenReader("Erro no cadastro. Tente novamente.");
              return [2 /*return*/];
            }
            announceToScreenReader(
              "Cadastro realizado com sucesso. Verifique seu email para confirmação.",
            );
            sonner_1.toast.success(
              "Cadastro realizado! Verifique seu email para confirmar a conta.",
            );
            setFormMode("login");
            return [3 /*break*/, 7];
          case 5:
            if (!(formMode === "reset")) return [3 /*break*/, 7];
            return [4 /*yield*/, supabase.auth.resetPasswordForEmail(formData.email)];
          case 6:
            error = _a.sent().error;
            if (error) {
              setErrors({ general: "Erro ao enviar email: ".concat(error.message) });
              announceToScreenReader("Erro ao enviar email de recuperação.");
              return [2 /*return*/];
            }
            announceToScreenReader("Email de recuperação enviado com sucesso.");
            sonner_1.toast.success("Email de recuperação enviado!");
            setFormMode("login");
            _a.label = 7;
          case 7:
            return [3 /*break*/, 10];
          case 8:
            error_1 = _a.sent();
            setErrors({ general: "Erro inesperado. Tente novamente." });
            announceToScreenReader("Erro inesperado no sistema.");
            return [3 /*break*/, 10];
          case 9:
            setIsLoading(false);
            return [7 /*endfinally*/];
          case 10:
            return [2 /*return*/];
        }
      });
    });
  };
  // Handle input changes with real-time validation feedback
  var handleInputChange = function (field, value) {
    setFormData(function (prev) {
      var _a;
      return __assign(__assign({}, prev), ((_a = {}), (_a[field] = value), _a));
    });
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(function (prev) {
        var _a;
        return __assign(__assign({}, prev), ((_a = {}), (_a[field] = undefined), _a));
      });
    }
  };
  // Get form title and description based on mode
  var getFormContent = function () {
    switch (formMode) {
      case "register":
        return {
          title: "Criar nova conta",
          description: "Preencha os dados para criar sua conta no NeonPro",
          submitText: "Criar conta",
          switchText: "Já tem uma conta? Faça login",
          switchAction: function () {
            return setFormMode("login");
          },
        };
      case "reset":
        return {
          title: "Recuperar senha",
          description: "Digite seu email para receber instruções de recuperação",
          submitText: "Enviar email",
          switchText: "Lembrou da senha? Faça login",
          switchAction: function () {
            return setFormMode("login");
          },
        };
      default:
        return {
          title: "Entrar na conta",
          description: "Digite suas credenciais para acessar o NeonPro",
          submitText: "Entrar",
          switchText: "Não tem uma conta? Cadastre-se",
          switchAction: function () {
            return setFormMode("register");
          },
        };
    }
  };
  var formContent = getFormContent();
  return (
    <div
      className={"w-full max-w-md mx-auto ".concat(
        accessibility.highContrast ? "high-contrast" : "",
      )}
      data-testid="accessible-auth-form"
    >
      {/* Screen reader announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only" role="status">
        {accessibility.announcements.map(function (announcement, index) {
          return <div key={index}>{announcement}</div>;
        })}
      </div>

      <card_1.Card className="border-2 focus-within:border-primary">
        <card_1.CardHeader className="text-center">
          <card_1.CardTitle className="text-2xl font-bold">{formContent.title}</card_1.CardTitle>
          <card_1.CardDescription className="text-base">
            {formContent.description}
          </card_1.CardDescription>
        </card_1.CardHeader>

        <card_1.CardContent>
          <form onSubmit={handleSubmit} noValidate>
            {/* General error alert */}
            {errors.general && (
              <alert_1.Alert variant="destructive" className="mb-4" role="alert">
                <lucide_react_1.AlertTriangle className="h-4 w-4" aria-hidden="true" />
                <alert_1.AlertDescription>{errors.general}</alert_1.AlertDescription>
              </alert_1.Alert>
            )}

            {/* Email field */}
            <div className="space-y-2 mb-4">
              <label_1.Label htmlFor="email" className="text-sm font-medium">
                Email *
              </label_1.Label>
              <input_1.Input
                id="email"
                type="email"
                value={formData.email}
                onChange={function (e) {
                  return handleInputChange("email", e.target.value);
                }}
                className={"".concat(errors.email ? "border-red-500 focus:border-red-500" : "")}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : "email-help"}
                placeholder="seu.email@exemplo.com"
                autoComplete="email"
                required
              />
              <div id="email-help" className="text-xs text-muted-foreground">
                Digite seu endereço de email válido
              </div>
              {errors.email && (
                <div
                  id="email-error"
                  className="text-xs text-red-600"
                  role="alert"
                  aria-live="polite"
                >
                  {errors.email}
                </div>
              )}
            </div>

            {/* Password field (not shown in reset mode) */}
            {formMode !== "reset" && (
              <div className="space-y-2 mb-4">
                <label_1.Label htmlFor="password" className="text-sm font-medium">
                  Senha *
                </label_1.Label>
                <div className="relative">
                  <input_1.Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={function (e) {
                      return handleInputChange("password", e.target.value);
                    }}
                    className={"pr-10 ".concat(
                      errors.password ? "border-red-500 focus:border-red-500" : "",
                    )}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "password-error" : "password-help"}
                    placeholder={
                      formMode === "register" ? "Mínimo 8 caracteres" : "Digite sua senha"
                    }
                    autoComplete={formMode === "register" ? "new-password" : "current-password"}
                    required
                  />
                  <button_1.Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={function () {
                      return setShowPassword(!showPassword);
                    }}
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    tabIndex={-1}
                  >
                    {showPassword
                      ? <lucide_react_1.EyeOff className="h-4 w-4" aria-hidden="true" />
                      : <lucide_react_1.Eye className="h-4 w-4" aria-hidden="true" />}
                  </button_1.Button>
                </div>
                <div id="password-help" className="text-xs text-muted-foreground">
                  {formMode === "register"
                    ? "Senha deve ter pelo menos 8 caracteres para segurança"
                    : "Digite sua senha atual"}
                </div>
                {errors.password && (
                  <div
                    id="password-error"
                    className="text-xs text-red-600"
                    role="alert"
                    aria-live="polite"
                  >
                    {errors.password}
                  </div>
                )}
              </div>
            )}

            {/* Confirm password field (only for registration) */}
            {formMode === "register" && (
              <div className="space-y-2 mb-4">
                <label_1.Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirmar senha *
                </label_1.Label>
                <div className="relative">
                  <input_1.Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={function (e) {
                      return handleInputChange("confirmPassword", e.target.value);
                    }}
                    className={"pr-10 ".concat(
                      errors.confirmPassword ? "border-red-500 focus:border-red-500" : "",
                    )}
                    aria-invalid={!!errors.confirmPassword}
                    aria-describedby={
                      errors.confirmPassword ? "confirm-password-error" : "confirm-password-help"
                    }
                    placeholder="Digite a senha novamente"
                    autoComplete="new-password"
                    required
                  />
                  <button_1.Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={function () {
                      return setShowConfirmPassword(!showConfirmPassword);
                    }}
                    aria-label={showConfirmPassword ? "Ocultar confirmação" : "Mostrar confirmação"}
                    tabIndex={-1}
                  >
                    {showConfirmPassword
                      ? <lucide_react_1.EyeOff className="h-4 w-4" aria-hidden="true" />
                      : <lucide_react_1.Eye className="h-4 w-4" aria-hidden="true" />}
                  </button_1.Button>
                </div>
                <div id="confirm-password-help" className="text-xs text-muted-foreground">
                  Repita a senha para confirmação
                </div>
                {errors.confirmPassword && (
                  <div
                    id="confirm-password-error"
                    className="text-xs text-red-600"
                    role="alert"
                    aria-live="polite"
                  >
                    {errors.confirmPassword}
                  </div>
                )}
              </div>
            )}

            {/* Submit button */}
            <button_1.Button
              type="submit"
              className="w-full mb-4"
              disabled={isLoading}
              aria-describedby="submit-help"
            >
              {isLoading
                ? <>
                    <lucide_react_1.Loader2
                      className="mr-2 h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                    <span>Processando...</span>
                  </>
                : <>
                    <lucide_react_1.ShieldCheck className="mr-2 h-4 w-4" aria-hidden="true" />
                    <span>{formContent.submitText}</span>
                  </>}
            </button_1.Button>
            <div id="submit-help" className="sr-only">
              {isLoading
                ? "Aguarde enquanto processamos sua solicitação"
                : "Clique para ".concat(formContent.submitText.toLowerCase())}
            </div>

            {/* Mode switch */}
            <div className="text-center">
              <button_1.Button
                type="button"
                variant="link"
                onClick={formContent.switchAction}
                className="text-sm"
                disabled={isLoading}
              >
                {formContent.switchText}
              </button_1.Button>
            </div>

            {/* Password reset link */}
            {formMode === "login" && (
              <div className="text-center mt-2">
                <button_1.Button
                  type="button"
                  variant="link"
                  onClick={function () {
                    return setFormMode("reset");
                  }}
                  className="text-sm text-muted-foreground"
                  disabled={isLoading}
                >
                  Esqueceu sua senha?
                </button_1.Button>
              </div>
            )}
          </form>

          {/* Accessibility features info */}
          {accessibility.screenReaderActive && (
            <div className="mt-4 p-2 bg-muted rounded text-xs">
              <p className="font-medium">Recursos de acessibilidade ativos:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Navegação por teclado completa</li>
                <li>Anúncios para leitores de tela</li>
                <li>Descrições detalhadas de campos</li>
                <li>Validação em tempo real</li>
              </ul>
            </div>
          )}
        </card_1.CardContent>
      </card_1.Card>
    </div>
  );
}

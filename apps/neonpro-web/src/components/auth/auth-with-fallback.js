"use client";
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
exports.AuthWithFallback = AuthWithFallback;
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var separator_1 = require("@/components/ui/separator");
var auth_context_1 = require("@/contexts/auth-context");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var sonner_1 = require("sonner");
var google_popup_button_1 = require("./google-popup-button");
function AuthWithFallback(_a) {
  var onSuccess = _a.onSuccess,
    _b = _a.showSignUp,
    showSignUp = _b === void 0 ? false : _b,
    _c = _a.className,
    className = _c === void 0 ? "" : _c;
  var _d = (0, react_1.useState)(""),
    email = _d[0],
    setEmail = _d[1];
  var _e = (0, react_1.useState)(""),
    password = _e[0],
    setPassword = _e[1];
  var _f = (0, react_1.useState)(""),
    confirmPassword = _f[0],
    setConfirmPassword = _f[1];
  var _g = (0, react_1.useState)(false),
    showPassword = _g[0],
    setShowPassword = _g[1];
  var _h = (0, react_1.useState)(false),
    isLoading = _h[0],
    setIsLoading = _h[1];
  var _j = (0, react_1.useState)("signin"),
    authMode = _j[0],
    setAuthMode = _j[1];
  var _k = (0, auth_context_1.useAuth)(),
    signIn = _k.signIn,
    signUp = _k.signUp;
  var handleEmailAuth = (e) =>
    __awaiter(this, void 0, void 0, function () {
      var startTime, error, _a, totalTime, errorMessage, action, error_1, errorMessage;
      var _b, _c, _d, _e, _f;
      return __generator(this, (_g) => {
        switch (_g.label) {
          case 0:
            e.preventDefault();
            if (!email || !password) {
              sonner_1.toast.error("Por favor, preencha todos os campos");
              return [2 /*return*/];
            }
            if (authMode === "signup" && password !== confirmPassword) {
              sonner_1.toast.error("Senhas não coincidem");
              return [2 /*return*/];
            }
            if (password.length < 6) {
              sonner_1.toast.error("Senha deve ter pelo menos 6 caracteres");
              return [2 /*return*/];
            }
            setIsLoading(true);
            _g.label = 1;
          case 1:
            _g.trys.push([1, 6, 7, 8]);
            startTime = Date.now();
            if (!(authMode === "signup")) return [3 /*break*/, 3];
            return [4 /*yield*/, signUp(email, password)];
          case 2:
            _a = _g.sent();
            return [3 /*break*/, 5];
          case 3:
            return [4 /*yield*/, signIn(email, password)];
          case 4:
            _a = _g.sent();
            _g.label = 5;
          case 5:
            error = _a.error;
            totalTime = Date.now() - startTime;
            if (error) {
              errorMessage = "Erro na autenticação";
              if (
                (_b = error.message) === null || _b === void 0
                  ? void 0
                  : _b.includes("Invalid login credentials")
              ) {
                errorMessage = "Email ou senha incorretos";
              } else if (
                (_c = error.message) === null || _c === void 0
                  ? void 0
                  : _c.includes("User already registered")
              ) {
                errorMessage = "Este email já está cadastrado";
              } else if (
                (_d = error.message) === null || _d === void 0
                  ? void 0
                  : _d.includes("Password should be")
              ) {
                errorMessage = "Senha deve ter pelo menos 6 caracteres";
              } else if (
                (_e = error.message) === null || _e === void 0
                  ? void 0
                  : _e.includes("Invalid email")
              ) {
                errorMessage = "Email inválido";
              } else if (
                (_f = error.message) === null || _f === void 0 ? void 0 : _f.includes("rate limit")
              ) {
                errorMessage = "Muitas tentativas. Tente novamente em alguns minutos";
              }
              sonner_1.toast.error(errorMessage);
              return [2 /*return*/];
            }
            action = authMode === "signup" ? "cadastro" : "login";
            sonner_1.toast.success(
              "".concat(
                action.charAt(0).toUpperCase() + action.slice(1),
                " realizado com sucesso!",
              ),
            );
            // Performance feedback
            if (totalTime <= 2000) {
              console.log("\u2705 Email auth completed in ".concat(totalTime, "ms"));
            } else {
              console.warn("\u26A0\uFE0F Email auth took ".concat(totalTime, "ms"));
            }
            onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess();
            return [3 /*break*/, 8];
          case 6:
            error_1 = _g.sent();
            errorMessage = error_1 instanceof Error ? error_1.message : "Erro inesperado";
            sonner_1.toast.error(errorMessage);
            return [3 /*break*/, 8];
          case 7:
            setIsLoading(false);
            return [7 /*endfinally*/];
          case 8:
            return [2 /*return*/];
        }
      });
    });
  var toggleAuthMode = () => {
    setAuthMode((prev) => (prev === "signin" ? "signup" : "signin"));
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };
  return (
    <div className={"space-y-6 ".concat(className)}>
      {/* Primary OAuth Option */}
      <div className="space-y-3">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">Acesso Rápido</h3>
          <p className="text-sm text-gray-600">Recomendado para melhor experiência</p>
        </div>

        <google_popup_button_1.SignInWithGooglePopupButton
          text="Continuar com Google"
          onSuccess={onSuccess}
          className="w-full h-12 text-base font-medium"
        />
      </div>

      {/* Separator */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <separator_1.Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">Ou continue com email</span>
        </div>
      </div>

      {/* Fallback Email/Password Form */}
      <form onSubmit={handleEmailAuth} className="space-y-4">
        <div className="space-y-2">
          <label_1.Label htmlFor="email">Email</label_1.Label>
          <input_1.Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
            autoComplete="email"
          />
        </div>

        <div className="space-y-2">
          <label_1.Label htmlFor="password">Senha</label_1.Label>
          <div className="relative">
            <input_1.Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
              minLength={6}
              autoComplete={authMode === "signup" ? "new-password" : "current-password"}
            />
            <button_1.Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword
                ? <lucide_react_1.EyeOff className="h-4 w-4" />
                : <lucide_react_1.Eye className="h-4 w-4" />}
            </button_1.Button>
          </div>
        </div>

        {authMode === "signup" && (
          <div className="space-y-2">
            <label_1.Label htmlFor="confirm-password">Confirmar Senha</label_1.Label>
            <input_1.Input
              id="confirm-password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>
        )}

        <button_1.Button
          type="submit"
          className="w-full h-12 text-base font-medium"
          disabled={isLoading}
        >
          {isLoading
            ? <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                {authMode === "signup" ? "Criando conta..." : "Entrando..."}
              </>
            : <>
                <lucide_react_1.Mail className="mr-2 h-4 w-4" />
                {authMode === "signup" ? "Criar conta" : "Entrar"}
              </>}
        </button_1.Button>
      </form>

      {/* Auth Mode Toggle */}
      <div className="text-center">
        <button_1.Button
          type="button"
          variant="link"
          onClick={toggleAuthMode}
          disabled={isLoading}
          className="text-sm"
        >
          {authMode === "signup"
            ? "Já tem uma conta? Fazer login"
            : showSignUp
              ? "Não tem uma conta? Criar conta"
              : ""}
        </button_1.Button>
      </div>

      {/* Performance Note */}
      <div className="text-xs text-gray-500 text-center space-y-1">
        <p>
          💡 <strong>Google OAuth</strong>: ~2-3 segundos
        </p>
        <p>
          📧 <strong>Email/Senha</strong>: Alternativa segura
        </p>
      </div>
    </div>
  );
}

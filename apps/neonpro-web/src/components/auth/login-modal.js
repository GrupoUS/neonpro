// components/auth/login-modal.tsx
"use client";
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
exports.LoginModal = LoginModal;
var react_1 = require("react");
var dialog_1 = require("@/components/ui/dialog");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var checkbox_1 = require("@/components/ui/checkbox");
var badge_1 = require("@/components/ui/badge");
var separator_1 = require("@/components/ui/separator");
var lucide_react_1 = require("lucide-react");
function LoginModal(_a) {
  var open = _a.open,
    onOpenChange = _a.onOpenChange,
    type = _a.type;
  var _b = (0, react_1.useState)({
      email: "",
      password: "",
      rememberMe: false,
    }),
    formData = _b[0],
    setFormData = _b[1];
  var _c = (0, react_1.useState)(false),
    showPassword = _c[0],
    setShowPassword = _c[1];
  var _d = (0, react_1.useState)(false),
    isLoading = _d[0],
    setIsLoading = _d[1];
  var _e = (0, react_1.useState)(""),
    error = _e[0],
    setError = _e[1];
  var handleInputChange = (field, value) => {
    setFormData((prev) => {
      var _a;
      return __assign(__assign({}, prev), ((_a = {}), (_a[field] = value), _a));
    });
    if (error) setError("");
  };
  var handleSubmit = (e) =>
    __awaiter(this, void 0, void 0, function () {
      var err_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            e.preventDefault();
            setIsLoading(true);
            setError("");
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            // Simulate API call
            return [4 /*yield*/, new Promise((resolve) => setTimeout(resolve, 2000))];
          case 2:
            // Simulate API call
            _a.sent();
            // Mock authentication logic
            if (formData.email && formData.password) {
              // Redirect based on type
              if (type === "professional") {
                window.location.href = "/dashboard";
              } else {
                window.location.href = "/patient-portal";
              }
            } else {
              setError("Por favor, preencha todos os campos");
            }
            return [3 /*break*/, 5];
          case 3:
            err_1 = _a.sent();
            setError("Erro ao fazer login. Tente novamente.");
            return [3 /*break*/, 5];
          case 4:
            setIsLoading(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  var securityFeatures = [
    "Autenticação multi-fator disponível",
    "Criptografia end-to-end",
    "Conformidade LGPD garantida",
    "Logs de auditoria completos",
  ];
  return (
    <dialog_1.Dialog open={open} onOpenChange={onOpenChange}>
      <dialog_1.DialogContent className="sm:max-w-md">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600">
              <lucide_react_1.Stethoscope className="h-4 w-4 text-white" />
            </div>
            <span>{type === "professional" ? "Login Profissional" : "Portal do Paciente"}</span>
            <badge_1.Badge className="bg-sky-100 text-sky-700 text-xs">Seguro</badge_1.Badge>
          </dialog_1.DialogTitle>
        </dialog_1.DialogHeader>

        <div className="space-y-6">
          {/* Security Notice */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <lucide_react_1.Shield className="h-4 w-4 text-green-600" />
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                Acesso Seguro
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {type === "professional"
                ? "Acesso exclusivo para profissionais certificados com dados criptografados."
                : "Portal seguro para acompanhar seus tratamentos e consultas."}
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <lucide_react_1.AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <span className="text-sm text-red-700 dark:text-red-400">{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label_1.Label htmlFor="email">
                {type === "professional" ? "E-mail Profissional" : "E-mail ou CPF"}
              </label_1.Label>
              <div className="relative">
                <lucide_react_1.Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input_1.Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="pl-10"
                  placeholder={
                    type === "professional"
                      ? "dr.silva@clinica.com.br"
                      : "seu@email.com ou 000.000.000-00"
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label_1.Label htmlFor="password">Senha</label_1.Label>
              <div className="relative">
                <lucide_react_1.Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input_1.Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className="pl-10 pr-10"
                  placeholder="Digite sua senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword
                    ? <lucide_react_1.EyeOff className="h-4 w-4" />
                    : <lucide_react_1.Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <checkbox_1.Checkbox
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) => handleInputChange("rememberMe", checked)}
                />
                <label_1.Label htmlFor="rememberMe" className="text-sm">
                  Lembrar-me
                </label_1.Label>
              </div>
              <a
                href="/forgot-password"
                className="text-sm text-sky-600 hover:text-sky-700 hover:underline"
              >
                Esqueci minha senha
              </a>
            </div>

            <button_1.Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white"
              size="lg"
            >
              {isLoading
                ? <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Entrando...
                  </>
                : <>
                    Entrar
                    <lucide_react_1.CheckCircle className="ml-2 h-4 w-4" />
                  </>}
            </button_1.Button>
          </form>

          {type === "professional" && (
            <>
              <separator_1.Separator />

              {/* Professional Features */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Recursos Profissionais:
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
                  {securityFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-sky-600 rounded-full flex-shrink-0"></div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <separator_1.Separator />

              {/* First Access */}
              <div className="text-center space-y-3">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Primeiro acesso ou precisa de ajuda?
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button_1.Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => window.open("/setup-guide", "_blank")}
                  >
                    Guia de Configuração
                    <lucide_react_1.ExternalLink className="ml-1 h-3 w-3" />
                  </button_1.Button>
                  <button_1.Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => window.open("/contact-support", "_blank")}
                  >
                    Suporte Técnico
                  </button_1.Button>
                </div>
              </div>
            </>
          )}

          {type === "patient" && (
            <>
              <separator_1.Separator />

              {/* Patient First Access */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Primeiro acesso?
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                  Use o CPF e número de celular informados na sua primeira consulta.
                </p>
                <button_1.Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => window.open("/patient-help", "_blank")}
                >
                  Como acessar minha conta
                  <lucide_react_1.ExternalLink className="ml-1 h-3 w-3" />
                </button_1.Button>
              </div>
            </>
          )}

          {/* Security Footer */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-2">
              <lucide_react_1.Shield className="h-3 w-3 text-green-600" />
              <span className="text-xs text-slate-500">Protegido por criptografia bancária</span>
            </div>
            <div className="flex justify-center space-x-3 text-xs text-slate-400">
              <span>LGPD</span>
              <span>•</span>
              <span>ANVISA</span>
              <span>•</span>
              <span>CFM</span>
            </div>
          </div>
        </div>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>
  );
}

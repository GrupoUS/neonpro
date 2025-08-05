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
exports.LoginForm = LoginForm;
var react_1 = require("react");
var navigation_1 = require("next/navigation");
var auth_context_1 = require("@/contexts/auth-context");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var form_1 = require("@/components/ui/form");
var input_1 = require("@/components/ui/input");
var separator_1 = require("@/components/ui/separator");
var react_hook_form_1 = require("react-hook-form");
var zod_1 = require("@hookform/resolvers/zod");
var zod_2 = require("zod");
var lucide_react_1 = require("lucide-react");
var loginSchema = zod_2.z.object({
  email: zod_2.z.string().min(1, "Email é obrigatório").email("Email inválido"),
  password: zod_2.z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});
function LoginForm(_a) {
  var type = _a.type,
    onSwitchToRegister = _a.onSwitchToRegister,
    onClose = _a.onClose;
  var _b = (0, react_1.useState)(false),
    showPassword = _b[0],
    setShowPassword = _b[1];
  var _c = (0, react_1.useState)(false),
    isLoading = _c[0],
    setIsLoading = _c[1];
  var router = (0, navigation_1.useRouter)();
  var signIn = (0, auth_context_1.useAuth)().signIn;
  var form = (0, react_hook_form_1.useForm)({
    resolver: (0, zod_1.zodResolver)(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  var onSubmit = (data) =>
    __awaiter(this, void 0, void 0, function () {
      var _a, authData, error, userRole, error_1;
      var _b;
      return __generator(this, (_c) => {
        switch (_c.label) {
          case 0:
            setIsLoading(true);
            _c.label = 1;
          case 1:
            _c.trys.push([1, 3, 4, 5]);
            return [4 /*yield*/, signIn(data.email, data.password)];
          case 2:
            (_a = _c.sent()), (authData = _a.data), (error = _a.error);
            if (error) {
              form.setError("root", {
                type: "manual",
                message: "Email ou senha incorretos. Tente novamente.",
              });
              return [2 /*return*/];
            }
            if (authData === null || authData === void 0 ? void 0 : authData.user) {
              userRole =
                ((_b = authData.user.user_metadata) === null || _b === void 0 ? void 0 : _b.role) ||
                "patient";
              if (type === "professional" && userRole !== "patient") {
                router.push("/dashboard");
              } else if (type === "patient" && userRole === "patient") {
                router.push("/patient-portal");
              } else {
                // Mismatch between expected type and actual role
                form.setError("root", {
                  type: "manual",
                  message: "Tipo de acesso incorreto. Verifique se está usando o login correto.",
                });
                return [2 /*return*/];
              }
              onClose === null || onClose === void 0 ? void 0 : onClose();
            }
            return [3 /*break*/, 5];
          case 3:
            error_1 = _c.sent();
            form.setError("root", {
              type: "manual",
              message: "Erro interno. Tente novamente em alguns momentos.",
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
  return (
    <card_1.Card className="w-full max-w-md mx-auto bg-white shadow-xl border-0">
      <card_1.CardHeader className="space-y-4 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#6366f1]">
              <lucide_react_1.Heart className="h-5 w-5 text-white" />
            </div>
            <div>
              <card_1.CardTitle className="text-2xl font-bold text-slate-900">
                {type === "professional" ? "Acesso Profissional" : "Portal do Paciente"}
              </card_1.CardTitle>
              <p className="text-sm text-slate-600 mt-1">
                Entre com suas credenciais para acessar o sistema
              </p>
            </div>
          </div>
          {onClose && (
            <button_1.Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-slate-500 hover:text-slate-700"
            >
              <lucide_react_1.X className="h-4 w-4" />
            </button_1.Button>
          )}
        </div>
      </card_1.CardHeader>

      <card_1.CardContent className="space-y-6">
        <form_1.Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <form_1.FormField
              control={form.control}
              name="email"
              render={(_a) => {
                var field = _a.field;
                return (
                  <form_1.FormItem>
                    <form_1.FormLabel className="text-slate-700 font-medium">
                      Email
                    </form_1.FormLabel>
                    <form_1.FormControl>
                      <div className="relative">
                        <lucide_react_1.Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <input_1.Input
                          {...field}
                          type="email"
                          placeholder="seu@email.com"
                          className="pl-10 h-12 border-slate-300 focus:border-[#6366f1] focus:ring-[#6366f1]"
                          disabled={isLoading}
                        />
                      </div>
                    </form_1.FormControl>
                    <form_1.FormMessage />
                  </form_1.FormItem>
                );
              }}
            />

            <form_1.FormField
              control={form.control}
              name="password"
              render={(_a) => {
                var field = _a.field;
                return (
                  <form_1.FormItem>
                    <form_1.FormLabel className="text-slate-700 font-medium">
                      Senha
                    </form_1.FormLabel>
                    <form_1.FormControl>
                      <div className="relative">
                        <lucide_react_1.Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <input_1.Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="Digite sua senha"
                          className="pl-10 pr-10 h-12 border-slate-300 focus:border-[#6366f1] focus:ring-[#6366f1]"
                          disabled={isLoading}
                        />
                        <button_1.Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-1 top-1 h-10 w-10 text-slate-400 hover:text-slate-600"
                          disabled={isLoading}
                        >
                          {showPassword
                            ? <lucide_react_1.EyeOff className="h-4 w-4" />
                            : <lucide_react_1.Eye className="h-4 w-4" />}
                        </button_1.Button>
                      </div>
                    </form_1.FormControl>
                    <form_1.FormMessage />
                  </form_1.FormItem>
                );
              }}
            />

            {form.formState.errors.root && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-600 font-medium">
                  {form.formState.errors.root.message}
                </p>
              </div>
            )}

            <button_1.Button
              type="submit"
              className="w-full h-12 bg-[#6366f1] hover:bg-[#5855eb] text-white font-medium shadow-md"
              disabled={isLoading}
            >
              {isLoading
                ? <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Entrando...</span>
                  </div>
                : "Entrar ".concat(type === "professional" ? "no Sistema" : "no Portal")}
            </button_1.Button>
          </form>
        </form_1.Form>

        {type === "patient" && onSwitchToRegister && (
          <>
            <separator_1.Separator className="bg-slate-200" />
            <div className="text-center space-y-3">
              <p className="text-sm text-slate-600">Primeira vez no NeonPro?</p>
              <button_1.Button
                variant="outline"
                onClick={onSwitchToRegister}
                className="w-full h-12 border-[#6366f1] text-[#6366f1] hover:bg-[#6366f1] hover:text-white"
                disabled={isLoading}
              >
                <lucide_react_1.User className="h-4 w-4 mr-2" />
                Criar Conta de Paciente
              </button_1.Button>
            </div>
          </>
        )}

        <div className="text-center">
          <a
            href="/forgot-password"
            className="text-sm text-[#6366f1] hover:text-[#5855eb] font-medium underline-offset-4 hover:underline"
          >
            Esqueceu sua senha?
          </a>
        </div>

        {/* LGPD Compliance Notice */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
          <p className="text-xs text-slate-600 leading-relaxed">
            Ao fazer login, você concorda com nossos{" "}
            <a href="/terms" className="text-[#6366f1] hover:underline">
              Termos de Uso
            </a>{" "}
            e{" "}
            <a href="/privacy" className="text-[#6366f1] hover:underline">
              Política de Privacidade
            </a>
            . Todos os dados são protegidos conforme a LGPD.
          </p>
        </div>
      </card_1.CardContent>
    </card_1.Card>
  );
}

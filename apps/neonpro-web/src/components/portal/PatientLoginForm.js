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
exports.default = PatientLoginForm;
// ===============================================
// Patient Portal Login Form Component
// Story 4.3: Patient Portal & Self-Service
// ===============================================
var react_1 = require("react");
var navigation_1 = require("next/navigation");
var react_hook_form_1 = require("react-hook-form");
var zod_1 = require("@hookform/resolvers/zod");
var zod_2 = require("zod");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var switch_1 = require("@/components/ui/switch");
var select_1 = require("@/components/ui/select");
var patient_portal_auth_1 = require("@/lib/auth-advanced/patient-portal-auth");
var pwa_config_1 = require("@/lib/auth-advanced/pwa-config");
var loginSchema = zod_2.z
  .object({
    login_type: zod_2.z.enum(["email", "phone", "document"]),
    email: zod_2.z.string().email("Email inválido").optional(),
    phone: zod_2.z.string().min(10, "Telefone inválido").optional(),
    document_number: zod_2.z.string().min(11, "Documento inválido").optional(),
    clinic_code: zod_2.z.string().min(3, "Código da clínica é obrigatório"),
    remember_me: zod_2.z.boolean().default(false),
  })
  .refine(
    (data) => {
      if (data.login_type === "email" && !data.email) {
        return false;
      }
      if (data.login_type === "phone" && !data.phone) {
        return false;
      }
      if (data.login_type === "document" && !data.document_number) {
        return false;
      }
      return true;
    },
    {
      message: "Campo de identificação é obrigatório",
    },
  );
function PatientLoginForm(_a) {
  var initialClinicCode = _a.initialClinicCode,
    redirectUrl = _a.redirectUrl;
  var router = (0, navigation_1.useRouter)();
  var _b = (0, react_1.useState)(false),
    isLoading = _b[0],
    setIsLoading = _b[1];
  var _c = (0, react_1.useState)(null),
    loginError = _c[0],
    setLoginError = _c[1];
  var _d = (0, react_1.useState)(false),
    showPWAFeatures = _d[0],
    setShowPWAFeatures = _d[1];
  var _e = (0, react_hook_form_1.useForm)({
      resolver: (0, zod_1.zodResolver)(loginSchema),
      defaultValues: {
        login_type: "email",
        clinic_code: initialClinicCode || "",
        remember_me: false,
      },
    }),
    register = _e.register,
    handleSubmit = _e.handleSubmit,
    watch = _e.watch,
    setValue = _e.setValue,
    errors = _e.formState.errors;
  var loginType = watch("login_type");
  (0, react_1.useEffect)(() => {
    // Initialize PWA features
    (0, pwa_config_1.registerPortalServiceWorker)();
    (0, pwa_config_1.enableOfflineSupport)();
    var showInstallDialog = (0, pwa_config_1.enableInstallPrompt)().showInstallDialog;
    // Check if PWA features should be shown
    setShowPWAFeatures(true);
    // Listen for install events
    var handleInstallEvent = () => {
      showInstallDialog();
    };
    window.addEventListener("install-portal", handleInstallEvent);
    return () => {
      window.removeEventListener("install-portal", handleInstallEvent);
    };
  }, []);
  var onSubmit = (data) =>
    __awaiter(this, void 0, void 0, function () {
      var response, redirectTo, error_1;
      var _a;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            setIsLoading(true);
            setLoginError(null);
            _b.label = 1;
          case 1:
            _b.trys.push([1, 3, 4, 5]);
            return [
              4 /*yield*/,
              patient_portal_auth_1.PatientPortalAuthService.authenticatePatient(data),
            ];
          case 2:
            response = _b.sent();
            if (response.success && response.data) {
              redirectTo = redirectUrl || "/portal/dashboard";
              router.push(redirectTo);
            } else {
              setLoginError(
                ((_a = response.error) === null || _a === void 0 ? void 0 : _a.message) ||
                  "Erro ao fazer login",
              );
            }
            return [3 /*break*/, 5];
          case 3:
            error_1 = _b.sent();
            setLoginError("Erro interno. Tente novamente.");
            console.error("Login error:", error_1);
            return [3 /*break*/, 5];
          case 4:
            setIsLoading(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  var formatPhone = (value) => {
    // Simple phone formatting for Brazilian numbers
    var numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }
    return value;
  };
  var formatDocument = (value) => {
    // Simple CPF formatting
    var numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }
    return value;
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Clinic Code */}
      <div className="space-y-2">
        <label_1.Label htmlFor="clinic_code" className="text-sm font-medium text-gray-700">
          Código da Clínica
        </label_1.Label>
        <input_1.Input
          id="clinic_code"
          type="text"
          placeholder="Ex: CLINIC123"
          className="text-center font-mono uppercase"
          {...register("clinic_code")}
          onChange={(e) => {
            setValue("clinic_code", e.target.value.toUpperCase());
          }}
        />
        {errors.clinic_code && <p className="text-sm text-red-600">{errors.clinic_code.message}</p>}
      </div>

      {/* Login Type Selector */}
      <div className="space-y-2">
        <label_1.Label className="text-sm font-medium text-gray-700">
          Como deseja entrar?
        </label_1.Label>
        <select_1.Select value={loginType} onValueChange={(value) => setValue("login_type", value)}>
          <select_1.SelectTrigger>
            <select_1.SelectValue />
          </select_1.SelectTrigger>
          <select_1.SelectContent>
            <select_1.SelectItem value="email">Email</select_1.SelectItem>
            <select_1.SelectItem value="phone">Telefone</select_1.SelectItem>
            <select_1.SelectItem value="document">CPF</select_1.SelectItem>
          </select_1.SelectContent>
        </select_1.Select>
      </div>

      {/* Dynamic Input Field */}
      <div className="space-y-2">
        {loginType === "email" && (
          <>
            <label_1.Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email
            </label_1.Label>
            <input_1.Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              {...register("email")}
            />
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
          </>
        )}

        {loginType === "phone" && (
          <>
            <label_1.Label htmlFor="phone" className="text-sm font-medium text-gray-700">
              Telefone
            </label_1.Label>
            <input_1.Input
              id="phone"
              type="tel"
              placeholder="(11) 99999-9999"
              {...register("phone")}
              onChange={(e) => {
                var formatted = formatPhone(e.target.value);
                setValue("phone", formatted);
              }}
            />
            {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
          </>
        )}

        {loginType === "document" && (
          <>
            <label_1.Label htmlFor="document_number" className="text-sm font-medium text-gray-700">
              CPF
            </label_1.Label>
            <input_1.Input
              id="document_number"
              type="text"
              placeholder="000.000.000-00"
              {...register("document_number")}
              onChange={(e) => {
                var formatted = formatDocument(e.target.value);
                setValue("document_number", formatted);
              }}
            />
            {errors.document_number && (
              <p className="text-sm text-red-600">{errors.document_number.message}</p>
            )}
          </>
        )}
      </div>

      {/* Remember Me */}
      <div className="flex items-center space-x-3">
        <switch_1.Switch
          id="remember_me"
          {...register("remember_me")}
          onCheckedChange={(checked) => setValue("remember_me", checked)}
        />
        <label_1.Label htmlFor="remember_me" className="text-sm text-gray-700">
          Manter conectado por 7 dias
        </label_1.Label>
      </div>

      {/* Error Message */}
      {loginError && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3">
          <p className="text-sm text-red-800">{loginError}</p>
        </div>
      )}

      {/* Submit Button */}
      <button_1.Button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
        disabled={isLoading}
      >
        {isLoading
          ? <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Entrando...</span>
            </div>
          : "Entrar no Portal"}
      </button_1.Button>

      {/* PWA Install Hint */}
      {showPWAFeatures && (
        <div className="text-center pt-4">
          <p className="text-xs text-gray-500 mb-2">
            💡 Dica: Adicione o portal à sua tela inicial para acesso rápido
          </p>
        </div>
      )}

      {/* Help Text */}
      <div className="text-center text-sm text-gray-600 space-y-1">
        <p>Primeira vez? Use os dados que você forneceu na clínica</p>
        <p className="text-xs">Email, telefone ou CPF cadastrado</p>
      </div>
    </form>
  );
}

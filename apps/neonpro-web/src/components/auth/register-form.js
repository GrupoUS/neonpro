"use client";
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterForm = RegisterForm;
var react_1 = require("react");
var navigation_1 = require("next/navigation");
var auth_context_1 = require("@/contexts/auth-context");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var form_1 = require("@/components/ui/form");
var input_1 = require("@/components/ui/input");
var checkbox_1 = require("@/components/ui/checkbox");
var separator_1 = require("@/components/ui/separator");
var react_hook_form_1 = require("react-hook-form");
var zod_1 = require("@hookform/resolvers/zod");
var zod_2 = require("zod");
var lucide_react_1 = require("lucide-react");
var registerSchema = zod_2.z.object({
    name: zod_2.z
        .string()
        .min(2, "Nome deve ter pelo menos 2 caracteres")
        .max(100, "Nome muito longo"),
    email: zod_2.z
        .string()
        .min(1, "Email é obrigatório")
        .email("Email inválido"),
    phone: zod_2.z
        .string()
        .min(10, "Telefone inválido")
        .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, "Formato: (11) 99999-9999"),
    birthDate: zod_2.z
        .string()
        .min(1, "Data de nascimento é obrigatória")
        .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Formato: DD/MM/AAAA"),
    password: zod_2.z
        .string()
        .min(8, "Senha deve ter pelo menos 8 caracteres")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula e 1 número"),
    confirmPassword: zod_2.z
        .string()
        .min(1, "Confirmação de senha é obrigatória"),
    lgpdConsent: zod_2.z
        .boolean()
        .refine(function (val) { return val === true; }, "Você deve aceitar os termos de privacidade"),
    marketingConsent: zod_2.z
        .boolean()
        .optional(),
}).refine(function (data) { return data.password === data.confirmPassword; }, {
    message: "Senhas não coincidem",
    path: ["confirmPassword"],
});
function RegisterForm(_a) {
    var _this = this;
    var onSwitchToLogin = _a.onSwitchToLogin, onClose = _a.onClose;
    var _b = (0, react_1.useState)(false), showPassword = _b[0], setShowPassword = _b[1];
    var _c = (0, react_1.useState)(false), showConfirmPassword = _c[0], setShowConfirmPassword = _c[1];
    var _d = (0, react_1.useState)(false), isLoading = _d[0], setIsLoading = _d[1];
    var router = (0, navigation_1.useRouter)();
    var signUp = (0, auth_context_1.useAuth)().signUp;
    var form = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_1.zodResolver)(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            birthDate: "",
            password: "",
            confirmPassword: "",
            lgpdConsent: false,
            marketingConsent: false,
        },
    });
    // Format phone number as user types
    var handlePhoneChange = function (value) {
        var cleaned = value.replace(/\D/g, "");
        if (cleaned.length <= 11) {
            var formatted = cleaned.replace(/(\d{2})(\d{4,5})(\d{4})/, "($1) $2-$3");
            return formatted;
        }
        return value;
    };
    // Format birth date as user types
    var handleBirthDateChange = function (value) {
        var cleaned = value.replace(/\D/g, "");
        if (cleaned.length <= 8) {
            var formatted = cleaned.replace(/(\d{2})(\d{2})(\d{4})/, "$1/$2/$3");
            return formatted;
        }
        return value;
    };
    var onSubmit = function (data) { return __awaiter(_this, void 0, void 0, function () {
        var _a, day, month, year, birthDateISO, _b, authData, error, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    setIsLoading(true);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, 4, 5]);
                    _a = data.birthDate.split('/'), day = _a[0], month = _a[1], year = _a[2];
                    birthDateISO = "".concat(year, "-").concat(month.padStart(2, '0'), "-").concat(day.padStart(2, '0'));
                    return [4 /*yield*/, signUp(data.email, data.password, {
                            full_name: data.name,
                            phone: data.phone,
                            birth_date: birthDateISO,
                            role: 'patient',
                            lgpd_consent: true,
                            lgpd_consent_date: new Date().toISOString(),
                            marketing_consent: data.marketingConsent || false,
                            marketing_consent_date: data.marketingConsent ? new Date().toISOString() : null,
                        })];
                case 2:
                    _b = _c.sent(), authData = _b.data, error = _b.error;
                    if (error) {
                        if (error.message.includes('already registered')) {
                            form.setError("email", {
                                type: "manual",
                                message: "Este email já está cadastrado. Tente fazer login.",
                            });
                        }
                        else {
                            form.setError("root", {
                                type: "manual",
                                message: "Erro ao criar conta. Tente novamente.",
                            });
                        }
                        return [2 /*return*/];
                    }
                    if (authData === null || authData === void 0 ? void 0 : authData.user) {
                        // Show success message and redirect to patient portal
                        router.push('/patient-portal?welcome=true');
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
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return (<card_1.Card className="w-full max-w-md mx-auto bg-white shadow-xl border-0">
      <card_1.CardHeader className="space-y-4 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#6366f1]">
              <lucide_react_1.Heart className="h-5 w-5 text-white"/>
            </div>
            <div>
              <card_1.CardTitle className="text-2xl font-bold text-slate-900">
                Criar Conta de Paciente
              </card_1.CardTitle>
              <p className="text-sm text-slate-600 mt-1">
                Cadastre-se para acessar seu portal do paciente
              </p>
            </div>
          </div>
          {onClose && (<button_1.Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-slate-500 hover:text-slate-700">
              <lucide_react_1.X className="h-4 w-4"/>
            </button_1.Button>)}
        </div>
      </card_1.CardHeader>

      <card_1.CardContent className="space-y-6">
        <form_1.Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <form_1.FormField control={form.control} name="name" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                  <form_1.FormLabel className="text-slate-700 font-medium">
                    Nome Completo *
                  </form_1.FormLabel>
                  <form_1.FormControl>
                    <div className="relative">
                      <lucide_react_1.User className="absolute left-3 top-3 h-4 w-4 text-slate-400"/>
                      <input_1.Input {...field} type="text" placeholder="Digite seu nome completo" className="pl-10 h-12 border-slate-300 focus:border-[#6366f1] focus:ring-[#6366f1]" disabled={isLoading}/>
                    </div>
                  </form_1.FormControl>
                  <form_1.FormMessage />
                </form_1.FormItem>);
        }}/>

            <form_1.FormField control={form.control} name="email" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                  <form_1.FormLabel className="text-slate-700 font-medium">
                    Email *
                  </form_1.FormLabel>
                  <form_1.FormControl>
                    <div className="relative">
                      <lucide_react_1.Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400"/>
                      <input_1.Input {...field} type="email" placeholder="seu@email.com" className="pl-10 h-12 border-slate-300 focus:border-[#6366f1] focus:ring-[#6366f1]" disabled={isLoading}/>
                    </div>
                  </form_1.FormControl>
                  <form_1.FormMessage />
                </form_1.FormItem>);
        }}/>

            <form_1.FormField control={form.control} name="phone" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                  <form_1.FormLabel className="text-slate-700 font-medium">
                    Telefone *
                  </form_1.FormLabel>
                  <form_1.FormControl>
                    <div className="relative">
                      <lucide_react_1.Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400"/>
                      <input_1.Input {...field} type="tel" placeholder="(11) 99999-9999" className="pl-10 h-12 border-slate-300 focus:border-[#6366f1] focus:ring-[#6366f1]" disabled={isLoading} onChange={function (e) {
                    var formatted = handlePhoneChange(e.target.value);
                    field.onChange(formatted);
                }}/>
                    </div>
                  </form_1.FormControl>
                  <form_1.FormMessage />
                </form_1.FormItem>);
        }}/>

            <form_1.FormField control={form.control} name="birthDate" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                  <form_1.FormLabel className="text-slate-700 font-medium">
                    Data de Nascimento *
                  </form_1.FormLabel>
                  <form_1.FormControl>
                    <div className="relative">
                      <lucide_react_1.Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400"/>
                      <input_1.Input {...field} type="text" placeholder="DD/MM/AAAA" className="pl-10 h-12 border-slate-300 focus:border-[#6366f1] focus:ring-[#6366f1]" disabled={isLoading} onChange={function (e) {
                    var formatted = handleBirthDateChange(e.target.value);
                    field.onChange(formatted);
                }}/>
                    </div>
                  </form_1.FormControl>
                  <form_1.FormMessage />
                </form_1.FormItem>);
        }}/>

            <form_1.FormField control={form.control} name="password" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                  <form_1.FormLabel className="text-slate-700 font-medium">
                    Senha *
                  </form_1.FormLabel>
                  <form_1.FormControl>
                    <div className="relative">
                      <lucide_react_1.Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400"/>
                      <input_1.Input {...field} type={showPassword ? "text" : "password"} placeholder="Crie uma senha segura" className="pl-10 pr-10 h-12 border-slate-300 focus:border-[#6366f1] focus:ring-[#6366f1]" disabled={isLoading}/>
                      <button_1.Button type="button" variant="ghost" size="icon" onClick={function () { return setShowPassword(!showPassword); }} className="absolute right-1 top-1 h-10 w-10 text-slate-400 hover:text-slate-600" disabled={isLoading}>
                        {showPassword ? (<lucide_react_1.EyeOff className="h-4 w-4"/>) : (<lucide_react_1.Eye className="h-4 w-4"/>)}
                      </button_1.Button>
                    </div>
                  </form_1.FormControl>
                  <form_1.FormMessage />
                </form_1.FormItem>);
        }}/>

            <form_1.FormField control={form.control} name="confirmPassword" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                  <form_1.FormLabel className="text-slate-700 font-medium">
                    Confirmar Senha *
                  </form_1.FormLabel>
                  <form_1.FormControl>
                    <div className="relative">
                      <lucide_react_1.Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400"/>
                      <input_1.Input {...field} type={showConfirmPassword ? "text" : "password"} placeholder="Digite a senha novamente" className="pl-10 pr-10 h-12 border-slate-300 focus:border-[#6366f1] focus:ring-[#6366f1]" disabled={isLoading}/>
                      <button_1.Button type="button" variant="ghost" size="icon" onClick={function () { return setShowConfirmPassword(!showConfirmPassword); }} className="absolute right-1 top-1 h-10 w-10 text-slate-400 hover:text-slate-600" disabled={isLoading}>
                        {showConfirmPassword ? (<lucide_react_1.EyeOff className="h-4 w-4"/>) : (<lucide_react_1.Eye className="h-4 w-4"/>)}
                      </button_1.Button>
                    </div>
                  </form_1.FormControl>
                  <form_1.FormMessage />
                </form_1.FormItem>);
        }}/>

            {/* LGPD Consent Section */}
            <div className="space-y-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
              <h4 className="font-medium text-slate-900 text-sm">
                Consentimento para Tratamento de Dados (LGPD)
              </h4>
              
              <form_1.FormField control={form.control} name="lgpdConsent" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <form_1.FormControl>
                      <checkbox_1.Checkbox checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-[#6366f1] data-[state=checked]:border-[#6366f1]" disabled={isLoading}/>
                    </form_1.FormControl>
                    <div className="space-y-1 leading-none">
                      <form_1.FormLabel className="text-xs text-slate-700 font-normal cursor-pointer">
                        Autorizo o tratamento dos meus dados pessoais para prestação de serviços médicos, 
                        conforme{" "}
                        <a href="/privacy" className="text-[#6366f1] hover:underline font-medium">
                          Política de Privacidade
                        </a>{" "}
                        e{" "}
                        <a href="/terms" className="text-[#6366f1] hover:underline font-medium">
                          Termos de Uso
                        </a>
                        . *
                      </form_1.FormLabel>
                      <form_1.FormMessage />
                    </div>
                  </form_1.FormItem>);
        }}/>

              <form_1.FormField control={form.control} name="marketingConsent" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <form_1.FormControl>
                      <checkbox_1.Checkbox checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-[#6366f1] data-[state=checked]:border-[#6366f1]" disabled={isLoading}/>
                    </form_1.FormControl>
                    <div className="space-y-1 leading-none">
                      <form_1.FormLabel className="text-xs text-slate-700 font-normal cursor-pointer">
                        Desejo receber comunicações sobre novos tratamentos, promoções e 
                        conteúdos relacionados ao bem-estar e estética (opcional).
                      </form_1.FormLabel>
                    </div>
                  </form_1.FormItem>);
        }}/>
            </div>

            {form.formState.errors.root && (<div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-600 font-medium">
                  {form.formState.errors.root.message}
                </p>
              </div>)}

            <button_1.Button type="submit" className="w-full h-12 bg-[#6366f1] hover:bg-[#5855eb] text-white font-medium shadow-md" disabled={isLoading}>
              {isLoading ? (<div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Criando conta...</span>
                </div>) : ("Criar Minha Conta")}
            </button_1.Button>
          </form>
        </form_1.Form>

        {onSwitchToLogin && (<>
            <separator_1.Separator className="bg-slate-200"/>
            <div className="text-center space-y-3">
              <p className="text-sm text-slate-600">
                Já possui uma conta?
              </p>
              <button_1.Button variant="outline" onClick={onSwitchToLogin} className="w-full h-12 border-[#6366f1] text-[#6366f1] hover:bg-[#6366f1] hover:text-white" disabled={isLoading}>
                Fazer Login
              </button_1.Button>
            </div>
          </>)}
      </card_1.CardContent>
    </card_1.Card>);
}

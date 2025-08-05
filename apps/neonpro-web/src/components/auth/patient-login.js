// components/auth/patient-login.tsx
"use client";
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.PatientLoginModal = PatientLoginModal;
var react_1 = require("react");
var dialog_1 = require("@/components/ui/dialog");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var checkbox_1 = require("@/components/ui/checkbox");
var badge_1 = require("@/components/ui/badge");
var separator_1 = require("@/components/ui/separator");
var tabs_1 = require("@/components/ui/tabs");
var lucide_react_1 = require("lucide-react");
function PatientLoginModal(_a) {
    var _this = this;
    var open = _a.open, onOpenChange = _a.onOpenChange;
    var _b = (0, react_1.useState)('cpf'), loginMethod = _b[0], setLoginMethod = _b[1];
    var _c = (0, react_1.useState)({
        cpf: "",
        email: "",
        phone: "",
        password: "",
        birthDate: "",
        rememberMe: false
    }), formData = _c[0], setFormData = _c[1];
    var _d = (0, react_1.useState)(false), showPassword = _d[0], setShowPassword = _d[1];
    var _e = (0, react_1.useState)(false), isLoading = _e[0], setIsLoading = _e[1];
    var _f = (0, react_1.useState)(""), error = _f[0], setError = _f[1];
    var handleInputChange = function (field, value) {
        setFormData(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[field] = value, _a)));
        });
        if (error)
            setError("");
    };
    var formatCPF = function (value) {
        var numbers = value.replace(/\D/g, '');
        if (numbers.length <= 11) {
            return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        }
        return value;
    };
    var formatPhone = function (value) {
        var numbers = value.replace(/\D/g, '');
        if (numbers.length <= 11) {
            return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        }
        return value;
    };
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var hasRequiredFields, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    setIsLoading(true);
                    setError("");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    // Simulate API call
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 2000); })];
                case 2:
                    // Simulate API call
                    _a.sent();
                    hasRequiredFields = loginMethod === 'cpf'
                        ? formData.cpf && formData.phone
                        : formData.email && formData.password;
                    if (hasRequiredFields) {
                        window.location.href = '/patient-portal';
                    }
                    else {
                        setError("Por favor, preencha todos os campos obrigatórios");
                    }
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    setError("Erro ao fazer login. Tente novamente.");
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var patientFeatures = [
        "Histórico completo de consultas",
        "Fotos de acompanhamento",
        "Agendamento online",
        "Lembretes automáticos",
        "Chat com a clínica",
        "Dados sempre seguros"
    ];
    return (<dialog_1.Dialog open={open} onOpenChange={onOpenChange}>
      <dialog_1.DialogContent className="sm:max-w-lg">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-600">
              <lucide_react_1.Heart className="h-4 w-4 text-white"/>
            </div>
            <span>Portal do Paciente</span>
            <badge_1.Badge className="bg-pink-100 text-pink-700 text-xs">
              Bem-estar
            </badge_1.Badge>
          </dialog_1.DialogTitle>
        </dialog_1.DialogHeader>

        <div className="space-y-6">
          {/* Welcome Message */}
          <div className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950 dark:to-rose-950 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <lucide_react_1.Heart className="h-4 w-4 text-pink-600"/>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                Bem-vindo ao seu Portal
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Acompanhe seus tratamentos, veja seu progresso e mantenha-se conectado com sua clínica.
            </p>
          </div>

          {/* Login Method Tabs */}
          <tabs_1.Tabs value={loginMethod} onValueChange={function (value) { return setLoginMethod(value); }}>
            <tabs_1.TabsList className="grid w-full grid-cols-2">
              <tabs_1.TabsTrigger value="cpf" className="flex items-center space-x-2">
                <lucide_react_1.CreditCard className="h-4 w-4"/>
                <span>CPF + Celular</span>
              </tabs_1.TabsTrigger>
              <tabs_1.TabsTrigger value="email" className="flex items-center space-x-2">
                <lucide_react_1.User className="h-4 w-4"/>
                <span>E-mail + Senha</span>
              </tabs_1.TabsTrigger>
            </tabs_1.TabsList>

            <div className="mt-4">
              {error && (<div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
                  <lucide_react_1.AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400"/>
                  <span className="text-sm text-red-700 dark:text-red-400">{error}</span>
                </div>)}

              <tabs_1.TabsContent value="cpf" className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label_1.Label htmlFor="cpf">CPF *</label_1.Label>
                    <div className="relative">
                      <lucide_react_1.CreditCard className="absolute left-3 top-3 h-4 w-4 text-slate-400"/>
                      <input_1.Input id="cpf" type="text" value={formData.cpf} onChange={function (e) { return handleInputChange('cpf', formatCPF(e.target.value)); }} className="pl-10" placeholder="000.000.000-00" maxLength={14} required/>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label_1.Label htmlFor="phone">Celular *</label_1.Label>
                    <div className="relative">
                      <lucide_react_1.Smartphone className="absolute left-3 top-3 h-4 w-4 text-slate-400"/>
                      <input_1.Input id="phone" type="tel" value={formData.phone} onChange={function (e) { return handleInputChange('phone', formatPhone(e.target.value)); }} className="pl-10" placeholder="(11) 99999-0000" maxLength={15} required/>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label_1.Label htmlFor="birthDate">Data de Nascimento (opcional)</label_1.Label>
                    <div className="relative">
                      <lucide_react_1.Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400"/>
                      <input_1.Input id="birthDate" type="date" value={formData.birthDate} onChange={function (e) { return handleInputChange('birthDate', e.target.value); }} className="pl-10"/>
                    </div>
                    <p className="text-xs text-slate-500">
                      Para maior segurança, informe sua data de nascimento
                    </p>
                  </div>

                  <button_1.Button type="submit" disabled={isLoading} className="w-full bg-pink-600 hover:bg-pink-700 text-white" size="lg">
                    {isLoading ? (<>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Acessando...
                      </>) : (<>
                        Acessar Portal
                        <lucide_react_1.CheckCircle className="ml-2 h-4 w-4"/>
                      </>)}
                  </button_1.Button>
                </form>
              </tabs_1.TabsContent>

              <tabs_1.TabsContent value="email" className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label_1.Label htmlFor="email">E-mail *</label_1.Label>
                    <div className="relative">
                      <lucide_react_1.User className="absolute left-3 top-3 h-4 w-4 text-slate-400"/>
                      <input_1.Input id="email" type="email" value={formData.email} onChange={function (e) { return handleInputChange('email', e.target.value); }} className="pl-10" placeholder="seu@email.com" required/>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label_1.Label htmlFor="password">Senha *</label_1.Label>
                    <div className="relative">
                      <lucide_react_1.Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400"/>
                      <input_1.Input id="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={function (e) { return handleInputChange('password', e.target.value); }} className="pl-10 pr-10" placeholder="Digite sua senha" required/>
                      <button type="button" onClick={function () { return setShowPassword(!showPassword); }} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                        {showPassword ? (<lucide_react_1.EyeOff className="h-4 w-4"/>) : (<lucide_react_1.Eye className="h-4 w-4"/>)}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <checkbox_1.Checkbox id="rememberMe" checked={formData.rememberMe} onCheckedChange={function (checked) { return handleInputChange('rememberMe', checked); }}/>
                      <label_1.Label htmlFor="rememberMe" className="text-sm">
                        Lembrar-me
                      </label_1.Label>
                    </div>
                    <a href="/patient-password-reset" className="text-sm text-pink-600 hover:text-pink-700 hover:underline">
                      Esqueci minha senha
                    </a>
                  </div>

                  <button_1.Button type="submit" disabled={isLoading} className="w-full bg-pink-600 hover:bg-pink-700 text-white" size="lg">
                    {isLoading ? (<>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Entrando...
                      </>) : (<>
                        Entrar
                        <lucide_react_1.CheckCircle className="ml-2 h-4 w-4"/>
                      </>)}
                  </button_1.Button>
                </form>
              </tabs_1.TabsContent>
            </div>
          </tabs_1.Tabs>

          <separator_1.Separator />

          {/* Patient Features */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              No seu portal você encontra:
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
              {patientFeatures.map(function (feature, index) { return (<div key={index} className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-pink-600 rounded-full flex-shrink-0"></div>
                  <span>{feature}</span>
                </div>); })}
            </div>
          </div>

          <separator_1.Separator />

          {/* Help Section */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
              Precisa de ajuda?
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
              Entre em contato com sua clínica ou use o CPF e celular informados na consulta.
            </p>
            <div className="flex flex-col space-y-2">
              <button_1.Button variant="outline" size="sm" onClick={function () { return window.open('/patient-support', '_blank'); }}>
                Central de Ajuda
                <lucide_react_1.ExternalLink className="ml-1 h-3 w-3"/>
              </button_1.Button>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-2">
              <lucide_react_1.Shield className="h-3 w-3 text-green-600"/>
              <span className="text-xs text-slate-500">
                Seus dados são protegidos pela LGPD
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Criptografia bancária • Privacidade garantida • Acesso controlado
            </p>
          </div>
        </div>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>);
}

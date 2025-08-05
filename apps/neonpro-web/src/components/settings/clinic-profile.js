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
exports.default = ClinicProfile;
var react_1 = require("react");
var react_hook_form_1 = require("react-hook-form");
var zod_1 = require("@hookform/resolvers/zod");
var z = require("zod");
var card_1 = require("@/components/ui/card");
var form_1 = require("@/components/ui/form");
var input_1 = require("@/components/ui/input");
var textarea_1 = require("@/components/ui/textarea");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var alert_1 = require("@/components/ui/alert");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
// CNPJ validation function
var validateCNPJ = function (cnpj) {
    // Remove non-numeric characters
    var cleanCNPJ = cnpj.replace(/[^\d]/g, "");
    if (cleanCNPJ.length !== 14)
        return false;
    // Check for known invalid patterns
    if (/^(\d)\1{13}$/.test(cleanCNPJ))
        return false;
    // CNPJ validation algorithm
    var sum = 0;
    var remainder;
    var weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    var weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    // First verification digit
    for (var i = 0; i < 12; i++) {
        sum += parseInt(cleanCNPJ.charAt(i)) * weights1[i];
    }
    remainder = sum % 11;
    var digit1 = remainder < 2 ? 0 : 11 - remainder;
    if (parseInt(cleanCNPJ.charAt(12)) !== digit1)
        return false;
    // Second verification digit
    sum = 0;
    for (var i = 0; i < 13; i++) {
        sum += parseInt(cleanCNPJ.charAt(i)) * weights2[i];
    }
    remainder = sum % 11;
    var digit2 = remainder < 2 ? 0 : 11 - remainder;
    return parseInt(cleanCNPJ.charAt(13)) === digit2;
};
// CEP validation function
var validateCEP = function (cep) {
    var cleanCEP = cep.replace(/[^\d]/g, "");
    return cleanCEP.length === 8;
};
var clinicProfileSchema = z.object({
    // Basic Information
    name: z.string().min(2, "Nome da clínica deve ter pelo menos 2 caracteres"),
    tradeName: z.string().optional(),
    cnpj: z.string().refine(validateCNPJ, "CNPJ inválido"),
    stateRegistration: z.string().optional(),
    municipalRegistration: z.string().optional(),
    // Contact Information
    phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
    whatsapp: z.string().optional(),
    email: z.string().email("Email inválido"),
    website: z.string().url("Website deve ser uma URL válida").optional().or(z.literal("")),
    // Address Information
    address: z.string().min(5, "Endereço deve ter pelo menos 5 caracteres"),
    addressNumber: z.string().min(1, "Número é obrigatório"),
    complement: z.string().optional(),
    neighborhood: z.string().min(2, "Bairro é obrigatório"),
    city: z.string().min(2, "Cidade é obrigatória"),
    state: z.string().length(2, "Estado deve ter 2 caracteres"),
    zipCode: z.string().refine(validateCEP, "CEP inválido"),
    // Professional Information
    description: z.string().max(500, "Descrição deve ter no máximo 500 caracteres").optional(),
    specialties: z.string().optional(),
    // Operating Information
    foundedYear: z.number().min(1900).max(new Date().getFullYear()).optional(),
    // LGPD Compliance
    privacyPolicyUrl: z.string().url("URL da política de privacidade deve ser válida").optional().or(z.literal("")),
    termsOfServiceUrl: z.string().url("URL dos termos de serviço deve ser válida").optional().or(z.literal("")),
});
function ClinicProfile() {
    var _this = this;
    var _a = (0, react_1.useState)(false), isLoading = _a[0], setIsLoading = _a[1];
    var _b = (0, react_1.useState)(false), isSaving = _b[0], setIsSaving = _b[1];
    var _c = (0, react_1.useState)(null), lastSaved = _c[0], setLastSaved = _c[1];
    var form = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_1.zodResolver)(clinicProfileSchema),
        defaultValues: {
            name: "",
            tradeName: "",
            cnpj: "",
            stateRegistration: "",
            municipalRegistration: "",
            phone: "",
            whatsapp: "",
            email: "",
            website: "",
            address: "",
            addressNumber: "",
            complement: "",
            neighborhood: "",
            city: "",
            state: "",
            zipCode: "",
            description: "",
            specialties: "",
            privacyPolicyUrl: "",
            termsOfServiceUrl: "",
        },
    });
    // Format CNPJ input
    var formatCNPJ = function (value) {
        var cleaned = value.replace(/[^\d]/g, "");
        return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
    };
    // Format CEP input
    var formatCEP = function (value) {
        var cleaned = value.replace(/[^\d]/g, "");
        return cleaned.replace(/(\d{5})(\d{3})/, "$1-$2");
    };
    // Auto-fetch address by CEP
    var fetchAddressByCEP = function (cep) { return __awaiter(_this, void 0, void 0, function () {
        var cleanCEP, response, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    cleanCEP = cep.replace(/[^\d]/g, "");
                    if (!(cleanCEP.length === 8)) return [3 /*break*/, 5];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch("https://viacep.com.br/ws/".concat(cleanCEP, "/json/"))];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    if (!data.erro) {
                        form.setValue("address", data.logradouro || "");
                        form.setValue("neighborhood", data.bairro || "");
                        form.setValue("city", data.localidade || "");
                        form.setValue("state", data.uf || "");
                    }
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    console.error("Erro ao buscar CEP:", error_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Load existing data
    (0, react_1.useEffect)(function () {
        var loadClinicData = function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                setIsLoading(true);
                try {
                    // TODO: Replace with actual API call
                    // const response = await fetch("/api/settings/clinic-profile");
                    // const data = await response.json();
                    // form.reset(data);
                }
                catch (error) {
                    console.error("Erro ao carregar dados da clínica:", error);
                    sonner_1.toast.error("Erro ao carregar dados da clínica");
                }
                finally {
                    setIsLoading(false);
                }
                return [2 /*return*/];
            });
        }); };
        loadClinicData();
    }, [form]);
    var onSubmit = function (data) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            setIsSaving(true);
            try {
                // TODO: Replace with actual API call
                // await fetch("/api/settings/clinic-profile", {
                //   method: "POST",
                //   headers: { "Content-Type": "application/json" },
                //   body: JSON.stringify(data),
                // });
                setLastSaved(new Date());
                sonner_1.toast.success("Perfil da clínica salvo com sucesso!");
            }
            catch (error) {
                console.error("Erro ao salvar perfil:", error);
                sonner_1.toast.error("Erro ao salvar perfil da clínica");
            }
            finally {
                setIsSaving(false);
            }
            return [2 /*return*/];
        });
    }); };
    if (isLoading) {
        return (<div className="flex items-center justify-center p-8">
        <lucide_react_1.Loader2 className="h-8 w-8 animate-spin"/>
      </div>);
    }
    return (<div className="space-y-6">
      {/* LGPD Compliance Alert */}
      <alert_1.Alert>
        <lucide_react_1.AlertCircle className="h-4 w-4"/>
        <alert_1.AlertDescription>
          <strong>Conformidade LGPD:</strong> As informações inseridas neste formulário são tratadas
          de acordo com a Lei Geral de Proteção de Dados Pessoais (LGPD). Certifique-se de que
          possui autorização para processar estes dados.
        </alert_1.AlertDescription>
      </alert_1.Alert>

      <form_1.Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.Building2 className="h-5 w-5"/>
                Informações Básicas
              </card_1.CardTitle>
              <card_1.CardDescription>
                Dados fundamentais da clínica para identificação e registro
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <form_1.FormField control={form.control} name="name" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                      <form_1.FormLabel>Nome da Clínica *</form_1.FormLabel>
                      <form_1.FormControl>
                        <input_1.Input placeholder="Clínica Estética ABC" {...field}/>
                      </form_1.FormControl>
                      <form_1.FormMessage />
                    </form_1.FormItem>);
        }}/>
                <form_1.FormField control={form.control} name="tradeName" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                      <form_1.FormLabel>Nome Fantasia</form_1.FormLabel>
                      <form_1.FormControl>
                        <input_1.Input placeholder="ABC Estética" {...field}/>
                      </form_1.FormControl>
                      <form_1.FormMessage />
                    </form_1.FormItem>);
        }}/>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <form_1.FormField control={form.control} name="cnpj" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                      <form_1.FormLabel>CNPJ *</form_1.FormLabel>
                      <form_1.FormControl>
                        <input_1.Input placeholder="00.000.000/0000-00" {...field} onChange={function (e) {
                    var formatted = formatCNPJ(e.target.value);
                    field.onChange(formatted);
                }} maxLength={18}/>
                      </form_1.FormControl>
                      <form_1.FormDescription>
                        Cadastro Nacional da Pessoa Jurídica
                      </form_1.FormDescription>
                      <form_1.FormMessage />
                    </form_1.FormItem>);
        }}/>
                <form_1.FormField control={form.control} name="stateRegistration" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                      <form_1.FormLabel>Inscrição Estadual</form_1.FormLabel>
                      <form_1.FormControl>
                        <input_1.Input placeholder="123456789" {...field}/>
                      </form_1.FormControl>
                      <form_1.FormMessage />
                    </form_1.FormItem>);
        }}/>
                <form_1.FormField control={form.control} name="municipalRegistration" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                      <form_1.FormLabel>Inscrição Municipal</form_1.FormLabel>
                      <form_1.FormControl>
                        <input_1.Input placeholder="123456789" {...field}/>
                      </form_1.FormControl>
                      <form_1.FormMessage />
                    </form_1.FormItem>);
        }}/>
              </div>

              <form_1.FormField control={form.control} name="description" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                    <form_1.FormLabel>Descrição da Clínica</form_1.FormLabel>
                    <form_1.FormControl>
                      <textarea_1.Textarea placeholder="Breve descrição dos serviços e especialidades da clínica..." className="resize-none" rows={3} {...field}/>
                    </form_1.FormControl>
                    <form_1.FormDescription>
                      Máximo 500 caracteres. Esta descrição pode ser exibida em relatórios e documentos.
                    </form_1.FormDescription>
                    <form_1.FormMessage />
                  </form_1.FormItem>);
        }}/>
            </card_1.CardContent>
          </card_1.Card>

          {/* Contact Information */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.Phone className="h-5 w-5"/>
                Informações de Contato
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <form_1.FormField control={form.control} name="phone" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                      <form_1.FormLabel>Telefone Principal *</form_1.FormLabel>
                      <form_1.FormControl>
                        <input_1.Input placeholder="(11) 99999-9999" {...field}/>
                      </form_1.FormControl>
                      <form_1.FormMessage />
                    </form_1.FormItem>);
        }}/>
                <form_1.FormField control={form.control} name="whatsapp" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                      <form_1.FormLabel>WhatsApp</form_1.FormLabel>
                      <form_1.FormControl>
                        <input_1.Input placeholder="(11) 99999-9999" {...field}/>
                      </form_1.FormControl>
                      <form_1.FormDescription>
                        Número para integração com WhatsApp Business
                      </form_1.FormDescription>
                      <form_1.FormMessage />
                    </form_1.FormItem>);
        }}/>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <form_1.FormField control={form.control} name="email" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                      <form_1.FormLabel>Email Principal *</form_1.FormLabel>
                      <form_1.FormControl>
                        <input_1.Input type="email" placeholder="contato@clinica.com.br" {...field}/>
                      </form_1.FormControl>
                      <form_1.FormMessage />
                    </form_1.FormItem>);
        }}/>
                <form_1.FormField control={form.control} name="website" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                      <form_1.FormLabel>Website</form_1.FormLabel>
                      <form_1.FormControl>
                        <input_1.Input placeholder="https://www.clinica.com.br" {...field}/>
                      </form_1.FormControl>
                      <form_1.FormMessage />
                    </form_1.FormItem>);
        }}/>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          {/* Address Information */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.MapPin className="h-5 w-5"/>
                Endereço
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <form_1.FormField control={form.control} name="zipCode" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                      <form_1.FormLabel>CEP *</form_1.FormLabel>
                      <form_1.FormControl>
                        <input_1.Input placeholder="00000-000" {...field} onChange={function (e) {
                    var formatted = formatCEP(e.target.value);
                    field.onChange(formatted);
                    if (formatted.replace(/[^\d]/g, "").length === 8) {
                        fetchAddressByCEP(formatted);
                    }
                }} maxLength={9}/>
                      </form_1.FormControl>
                      <form_1.FormDescription>
                        O endereço será preenchido automaticamente
                      </form_1.FormDescription>
                      <form_1.FormMessage />
                    </form_1.FormItem>);
        }}/>
                <div className="md:col-span-2"/>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3">
                  <form_1.FormField control={form.control} name="address" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                        <form_1.FormLabel>Logradouro *</form_1.FormLabel>
                        <form_1.FormControl>
                          <input_1.Input placeholder="Rua das Flores" {...field}/>
                        </form_1.FormControl>
                        <form_1.FormMessage />
                      </form_1.FormItem>);
        }}/>
                </div>
                <form_1.FormField control={form.control} name="addressNumber" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                      <form_1.FormLabel>Número *</form_1.FormLabel>
                      <form_1.FormControl>
                        <input_1.Input placeholder="123" {...field}/>
                      </form_1.FormControl>
                      <form_1.FormMessage />
                    </form_1.FormItem>);
        }}/>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <form_1.FormField control={form.control} name="complement" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                      <form_1.FormLabel>Complemento</form_1.FormLabel>
                      <form_1.FormControl>
                        <input_1.Input placeholder="Sala 101" {...field}/>
                      </form_1.FormControl>
                      <form_1.FormMessage />
                    </form_1.FormItem>);
        }}/>
                <form_1.FormField control={form.control} name="neighborhood" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                      <form_1.FormLabel>Bairro *</form_1.FormLabel>
                      <form_1.FormControl>
                        <input_1.Input placeholder="Centro" {...field}/>
                      </form_1.FormControl>
                      <form_1.FormMessage />
                    </form_1.FormItem>);
        }}/>
                <form_1.FormField control={form.control} name="city" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                      <form_1.FormLabel>Cidade *</form_1.FormLabel>
                      <form_1.FormControl>
                        <input_1.Input placeholder="São Paulo" {...field}/>
                      </form_1.FormControl>
                      <form_1.FormMessage />
                    </form_1.FormItem>);
        }}/>
              </div>

              <form_1.FormField control={form.control} name="state" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem className="md:w-1/4">
                    <form_1.FormLabel>Estado *</form_1.FormLabel>
                    <form_1.FormControl>
                      <input_1.Input placeholder="SP" maxLength={2} {...field}/>
                    </form_1.FormControl>
                    <form_1.FormMessage />
                  </form_1.FormItem>);
        }}/>
            </card_1.CardContent>
          </card_1.Card>

          {/* LGPD URLs */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.FileCheck className="h-5 w-5"/>
                Conformidade LGPD
                <badge_1.Badge variant="secondary" className="bg-red-100 text-red-800">
                  CRÍTICO
                </badge_1.Badge>
              </card_1.CardTitle>
              <card_1.CardDescription>
                URLs obrigatórias para conformidade com a Lei Geral de Proteção de Dados
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              <form_1.FormField control={form.control} name="privacyPolicyUrl" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                    <form_1.FormLabel>URL da Política de Privacidade</form_1.FormLabel>
                    <form_1.FormControl>
                      <input_1.Input placeholder="https://www.clinica.com.br/privacidade" {...field}/>
                    </form_1.FormControl>
                    <form_1.FormDescription>
                      Link para a política de privacidade da clínica (obrigatório por lei)
                    </form_1.FormDescription>
                    <form_1.FormMessage />
                  </form_1.FormItem>);
        }}/>
              <form_1.FormField control={form.control} name="termsOfServiceUrl" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                    <form_1.FormLabel>URL dos Termos de Serviço</form_1.FormLabel>
                    <form_1.FormControl>
                      <input_1.Input placeholder="https://www.clinica.com.br/termos" {...field}/>
                    </form_1.FormControl>
                    <form_1.FormDescription>
                      Link para os termos de serviço da clínica
                    </form_1.FormDescription>
                    <form_1.FormMessage />
                  </form_1.FormItem>);
        }}/>
            </card_1.CardContent>
          </card_1.Card>

          {/* Save Button */}
          <div className="sticky bottom-0 bg-white border-t p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {lastSaved && (<>
                  <lucide_react_1.CheckCircle2 className="h-4 w-4 text-green-600"/>
                  Salvo em {lastSaved.toLocaleTimeString()}
                </>)}
            </div>
            <button_1.Button type="submit" disabled={isSaving} className="min-w-32">
              {isSaving ? (<>
                  <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                  Salvando...
                </>) : (<>
                  <lucide_react_1.Save className="mr-2 h-4 w-4"/>
                  Salvar Perfil
                </>)}
            </button_1.Button>
          </div>
        </form>
      </form_1.Form>
    </div>);
}

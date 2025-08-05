'use client';
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
exports.ConsentManager = ConsentManager;
var react_1 = require("react");
var react_hook_form_1 = require("react-hook-form");
var zod_1 = require("@hookform/resolvers/zod");
var lucide_react_1 = require("lucide-react");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var input_1 = require("@/components/ui/input");
var textarea_1 = require("@/components/ui/textarea");
var form_1 = require("@/components/ui/form");
var select_1 = require("@/components/ui/select");
var badge_1 = require("@/components/ui/badge");
var schemas_1 = require("@/lib/healthcare/schemas");
var utils_1 = require("@/lib/utils");
var sonner_1 = require("sonner");
function ConsentManager(_a) {
    var _this = this;
    var _b = _a.patientCpf, patientCpf = _b === void 0 ? '' : _b, _c = _a.patientName, patientName = _c === void 0 ? '' : _c, _d = _a.existingConsents, existingConsents = _d === void 0 ? [] : _d, onSubmit = _a.onSubmit, onRevoke = _a.onRevoke, _e = _a.isLoading, isLoading = _e === void 0 ? false : _e;
    var _f = (0, react_1.useState)(false), showDetails = _f[0], setShowDetails = _f[1];
    var _g = (0, react_1.useState)(null), selectedConsent = _g[0], setSelectedConsent = _g[1];
    var form = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_1.zodResolver)(schemas_1.consentSchema),
        defaultValues: {
            patient_cpf: patientCpf,
            consent_type: 'data_processing',
            consent_given: false,
            legal_basis: 'consent',
            purpose_description: '',
            data_retention_period: '20 anos (dados médicos)',
            rights_information: true,
            withdrawal_instructions: 'Para revogar este consentimento, entre em contato conosco através do email lgpd@neonpro.com.br'
        }
    });
    var handleSubmitForm = function (data) { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, onSubmit(data)];
                case 1:
                    _a.sent();
                    sonner_1.toast.success('Consentimento registrado com sucesso!', {
                        description: 'O registro foi salvo de forma segura conforme LGPD.'
                    });
                    form.reset();
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    sonner_1.toast.error('Erro ao registrar consentimento', {
                        description: 'Verifique os dados e tente novamente.'
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleRevokeConsent = function (consentId) { return __awaiter(_this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, onRevoke(consentId)];
                case 1:
                    _a.sent();
                    sonner_1.toast.success('Consentimento revogado', {
                        description: 'A revogação foi processada conforme solicitado.'
                    });
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    sonner_1.toast.error('Erro ao revogar consentimento', {
                        description: 'Tente novamente ou entre em contato com o suporte.'
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var getConsentTypeLabel = function (type) {
        var labels = {
            data_processing: 'Tratamento de Dados',
            marketing: 'Comunicações de Marketing',
            research: 'Pesquisa e Desenvolvimento',
            procedure: 'Procedimento Médico',
            photography: 'Uso de Imagem',
            testimonial: 'Depoimento/Testemunho'
        };
        return labels[type] || type;
    };
    var getStatusBadge = function (status, consentGiven) {
        if (!consentGiven) {
            return <badge_1.Badge variant="destructive">Negado</badge_1.Badge>;
        }
        switch (status) {
            case 'active':
                return <badge_1.Badge variant="default" className="bg-green-100 text-green-800">Ativo</badge_1.Badge>;
            case 'revoked':
                return <badge_1.Badge variant="secondary">Revogado</badge_1.Badge>;
            case 'expired':
                return <badge_1.Badge variant="secondary">Expirado</badge_1.Badge>;
            default:
                return <badge_1.Badge variant="secondary">{status}</badge_1.Badge>;
        }
    };
    return (<div className="space-y-6">
      {/* New Consent Form */}
      <card_1.Card className="medical-card">
        <card_1.CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <lucide_react_1.Shield className="w-5 h-5 text-primary"/>
            </div>
            <div>
              <card_1.CardTitle className="text-2xl">Gerenciamento de Consentimentos LGPD</card_1.CardTitle>
              <card_1.CardDescription>
                Registro e gestão de consentimentos para tratamento de dados pessoais
              </card_1.CardDescription>
            </div>
          </div>
        </card_1.CardHeader>

        <card_1.CardContent>
          <form_1.Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmitForm)} className="space-y-6">
              
              {/* Patient Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <form_1.FormField control={form.control} name="patient_cpf" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                      <form_1.FormLabel>CPF do Paciente *</form_1.FormLabel>
                      <form_1.FormControl>
                        <input_1.Input placeholder="000.000.000-00" {...field} onChange={function (e) {
                    var formatted = (0, utils_1.formatCpf)(e.target.value);
                    field.onChange(formatted);
                }} className="bg-background"/>
                      </form_1.FormControl>
                      <form_1.FormMessage />
                    </form_1.FormItem>);
        }}/>

                <form_1.FormField control={form.control} name="consent_type" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                      <form_1.FormLabel>Tipo de Consentimento *</form_1.FormLabel>
                      <select_1.Select onValueChange={field.onChange} defaultValue={field.value}>
                        <form_1.FormControl>
                          <select_1.SelectTrigger className="bg-background">
                            <select_1.SelectValue placeholder="Selecione o tipo"/>
                          </select_1.SelectTrigger>
                        </form_1.FormControl>
                        <select_1.SelectContent>
                          <select_1.SelectItem value="data_processing">Tratamento de Dados</select_1.SelectItem>
                          <select_1.SelectItem value="marketing">Comunicações de Marketing</select_1.SelectItem>
                          <select_1.SelectItem value="research">Pesquisa e Desenvolvimento</select_1.SelectItem>
                          <select_1.SelectItem value="procedure">Procedimento Médico</select_1.SelectItem>
                          <select_1.SelectItem value="photography">Uso de Imagem</select_1.SelectItem>
                          <select_1.SelectItem value="testimonial">Depoimento/Testemunho</select_1.SelectItem>
                        </select_1.SelectContent>
                      </select_1.Select>
                      <form_1.FormMessage />
                    </form_1.FormItem>);
        }}/>
              </div>              <form_1.FormField control={form.control} name="purpose_description" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                    <form_1.FormLabel>Finalidade do Tratamento *</form_1.FormLabel>
                    <form_1.FormControl>
                      <textarea_1.Textarea placeholder="Descreva a finalidade específica para a qual os dados serão utilizados..." {...field} className="bg-background" rows={3}/>
                    </form_1.FormControl>
                    <form_1.FormDescription>
                      Descrição clara e específica do uso dos dados pessoais
                    </form_1.FormDescription>
                    <form_1.FormMessage />
                  </form_1.FormItem>);
        }}/>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <form_1.FormField control={form.control} name="legal_basis" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                      <form_1.FormLabel>Base Legal *</form_1.FormLabel>
                      <select_1.Select onValueChange={field.onChange} defaultValue={field.value}>
                        <form_1.FormControl>
                          <select_1.SelectTrigger className="bg-background">
                            <select_1.SelectValue placeholder="Selecione a base legal"/>
                          </select_1.SelectTrigger>
                        </form_1.FormControl>
                        <select_1.SelectContent>
                          <select_1.SelectItem value="consent">Consentimento do Titular</select_1.SelectItem>
                          <select_1.SelectItem value="legitimate_interest">Interesse Legítimo</select_1.SelectItem>
                          <select_1.SelectItem value="vital_interest">Interesse Vital</select_1.SelectItem>
                          <select_1.SelectItem value="public_task">Exercício Regular de Direitos</select_1.SelectItem>
                          <select_1.SelectItem value="legal_obligation">Obrigação Legal</select_1.SelectItem>
                        </select_1.SelectContent>
                      </select_1.Select>
                      <form_1.FormMessage />
                    </form_1.FormItem>);
        }}/>

                <form_1.FormField control={form.control} name="data_retention_period" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                      <form_1.FormLabel>Período de Retenção *</form_1.FormLabel>
                      <form_1.FormControl>
                        <input_1.Input placeholder="Ex: 5 anos, 20 anos (dados médicos)" {...field} className="bg-background"/>
                      </form_1.FormControl>
                      <form_1.FormDescription>
                        Tempo que os dados serão mantidos
                      </form_1.FormDescription>
                      <form_1.FormMessage />
                    </form_1.FormItem>);
        }}/>
              </div>

              <form_1.FormField control={form.control} name="consent_given" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem className="lgpd-consent">
                    <div className="flex items-start space-x-3">
                      <form_1.FormControl>
                        <input type="checkbox" checked={field.value} onChange={field.onChange} className="mt-1"/>
                      </form_1.FormControl>
                      <div className="grid gap-1.5 leading-none">
                        <form_1.FormLabel className="text-sm font-medium leading-5">
                          Consentimento do Titular *
                        </form_1.FormLabel>
                        <form_1.FormDescription className="text-xs">
                          Declaro que li e compreendi as informações sobre o tratamento dos meus dados pessoais,
                          incluindo meus direitos como titular, e autorizo o tratamento descrito acima.
                        </form_1.FormDescription>
                      </div>
                    </div>
                    <form_1.FormMessage />
                  </form_1.FormItem>);
        }}/>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <lucide_react_1.Shield className="w-5 h-5 text-blue-600 mt-0.5"/>
                  <div>
                    <h4 className="font-medium text-blue-800">Seus Direitos LGPD</h4>
                    <div className="text-sm text-blue-700 space-y-1 mt-2">
                      <p>• <strong>Confirmação:</strong> Saber se seus dados estão sendo tratados</p>
                      <p>• <strong>Acesso:</strong> Obter cópia dos seus dados pessoais</p>
                      <p>• <strong>Correção:</strong> Corrigir dados incompletos ou desatualizados</p>
                      <p>• <strong>Eliminação:</strong> Excluir dados desnecessários ou tratados irregularmente</p>
                      <p>• <strong>Portabilidade:</strong> Transferir dados para outro fornecedor</p>
                      <p>• <strong>Revogação:</strong> Retirar consentimento a qualquer momento</p>
                    </div>
                    <p className="text-xs text-blue-600 mt-3 font-medium">
                      Para exercer seus direitos: lgpd@neonpro.com.br
                    </p>
                  </div>
                </div>
              </div>

              <button_1.Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Registrando...' : 'Registrar Consentimento'}
              </button_1.Button>
            </form>
          </form_1.Form>
        </card_1.CardContent>
      </card_1.Card>      {/* Existing Consents */}
      {existingConsents.length > 0 && (<card_1.Card className="medical-card">
          <card_1.CardHeader>
            <card_1.CardTitle className="text-xl">Consentimentos Registrados</card_1.CardTitle>
            <card_1.CardDescription>
              Histórico de consentimentos do paciente {patientName}
            </card_1.CardDescription>
          </card_1.CardHeader>

          <card_1.CardContent>
            <div className="space-y-4">
              {existingConsents.map(function (consent) { return (<div key={consent.id} className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium">
                          {getConsentTypeLabel(consent.consent_type)}
                        </h4>
                        {getStatusBadge(consent.status, consent.consent_given)}
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {consent.purpose_description}
                      </p>
                      
                      <div className="text-xs text-muted-foreground">
                        <p>Base Legal: {consent.legal_basis}</p>
                        <p>Retenção: {consent.data_retention_period}</p>
                        <p>Registrado em: {(0, date_fns_1.format)(consent.created_at, 'dd/MM/yyyy HH:mm', { locale: locale_1.ptBR })}</p>
                        {consent.updated_at !== consent.created_at && (<p>Atualizado em: {(0, date_fns_1.format)(consent.updated_at, 'dd/MM/yyyy HH:mm', { locale: locale_1.ptBR })}</p>)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button_1.Button variant="outline" size="sm" onClick={function () { return setSelectedConsent(consent); }}>
                        <lucide_react_1.Eye className="w-4 h-4"/>
                      </button_1.Button>
                      
                      {consent.status === 'active' && consent.consent_given && (<button_1.Button variant="outline" size="sm" onClick={function () { return handleRevokeConsent(consent.id); }} className="text-destructive hover:text-destructive">
                          <lucide_react_1.X className="w-4 h-4"/>
                        </button_1.Button>)}
                    </div>
                  </div>
                </div>); })}
            </div>
          </card_1.CardContent>
        </card_1.Card>)}

      {/* Consent Details Modal/Card */}
      {selectedConsent && (<card_1.Card className="medical-card">
          <card_1.CardHeader className="flex flex-row items-center justify-between">
            <div>
              <card_1.CardTitle className="text-xl">Detalhes do Consentimento</card_1.CardTitle>
              <card_1.CardDescription>
                Informações completas do registro de consentimento
              </card_1.CardDescription>
            </div>
            <button_1.Button variant="outline" size="sm" onClick={function () { return setSelectedConsent(null); }}>
              <lucide_react_1.X className="w-4 h-4"/>
            </button_1.Button>
          </card_1.CardHeader>

          <card_1.CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">CPF do Titular</label>
                <p className="text-sm">{selectedConsent.patient_cpf}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Tipo de Consentimento</label>
                <p className="text-sm">{getConsentTypeLabel(selectedConsent.consent_type)}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <div className="flex items-center gap-2">
                  {getStatusBadge(selectedConsent.status, selectedConsent.consent_given)}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Base Legal</label>
                <p className="text-sm">{selectedConsent.legal_basis}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Finalidade do Tratamento</label>
              <p className="text-sm mt-1">{selectedConsent.purpose_description}</p>
            </div>

            <div>
              <label className="text-sm font-medium">Período de Retenção</label>
              <p className="text-sm mt-1">{selectedConsent.data_retention_period}</p>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Como Revogar Este Consentimento</h4>
              <p className="text-sm text-muted-foreground">
                Para revogar este consentimento, entre em contato conosco através do email{' '}
                <a href="mailto:lgpd@neonpro.com.br" className="text-primary underline">
                  lgpd@neonpro.com.br
                </a>{' '}
                informando seu CPF e o tipo de consentimento que deseja revogar.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <button_1.Button variant="outline" size="sm">
                <lucide_react_1.Download className="w-4 h-4 mr-2"/>
                Baixar Comprovante
              </button_1.Button>
              {selectedConsent.status === 'active' && selectedConsent.consent_given && (<button_1.Button variant="destructive" size="sm" onClick={function () {
                    handleRevokeConsent(selectedConsent.id);
                    setSelectedConsent(null);
                }}>
                  Revogar Consentimento
                </button_1.Button>)}
            </div>
          </card_1.CardContent>
        </card_1.Card>)}
    </div>);
}

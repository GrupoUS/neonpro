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
exports.default = ComplianceSettings;
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
var select_1 = require("@/components/ui/select");
var switch_1 = require("@/components/ui/switch");
var tabs_1 = require("@/components/ui/tabs");
var alert_1 = require("@/components/ui/alert");
var progress_1 = require("@/components/ui/progress");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var licenseTypes = [
    { value: "anvisa_estabelecimento", label: "ANVISA - Licença de Funcionamento", authority: "ANVISA" },
    { value: "anvisa_responsavel", label: "ANVISA - Responsável Técnico", authority: "ANVISA" },
    { value: "anvisa_equipamentos", label: "ANVISA - Registro de Equipamentos", authority: "ANVISA" },
    { value: "crm_clinica", label: "CRM - Registro da Clínica", authority: "CRM" },
    { value: "cfm_telemedicina", label: "CFM - Certificação Telemedicina", authority: "CFM" },
    { value: "vigilancia_sanitaria", label: "Vigilância Sanitária Municipal", authority: "Vigilância Sanitária" },
    { value: "bombeiros", label: "Corpo de Bombeiros - AVCB", authority: "Corpo de Bombeiros" },
    { value: "prefeitura", label: "Prefeitura - Alvará de Funcionamento", authority: "Prefeitura" },
    { value: "inmetro", label: "INMETRO - Equipamentos", authority: "INMETRO" },
];
var complianceCategories = [
    { value: "medical_devices", label: "Dispositivos Médicos", regulation: "RDC 185/2001" },
    { value: "data_protection", label: "Proteção de Dados", regulation: "LGPD Lei 13.709/2018" },
    { value: "professional_ethics", label: "Ética Profissional", regulation: "Resolução CFM 2.314/2022" },
    { value: "telemedicine", label: "Telemedicina", regulation: "Resolução CFM 2.314/2022" },
    { value: "waste_management", label: "Gerenciamento de Resíduos", regulation: "RDC 222/2018" },
    { value: "building_safety", label: "Segurança Predial", regulation: "NBR 9050" },
];
var licenseSchema = z.object({
    type: z.string().min(1, "Tipo de licença é obrigatório"),
    number: z.string().min(1, "Número da licença é obrigatório"),
    authority: z.string().min(1, "Órgão emissor é obrigatório"),
    issueDate: z.string(),
    expiryDate: z.string(),
    status: z.enum(["active", "expired", "pending", "suspended"]),
    notes: z.string().optional(),
    documentUrl: z.string().url("URL inválida").optional().or(z.literal("")),
    reminderDays: z.number().min(0).max(365),
});
var auditLogSchema = z.object({
    date: z.string(),
    category: z.string(),
    description: z.string(),
    responsible: z.string(),
    evidence: z.string().optional(),
    status: z.enum(["compliant", "non_compliant", "pending"]),
});
var complianceSettingsSchema = z.object({
    // Licenses
    licenses: z.array(licenseSchema),
    // LGPD Compliance
    lgpdCompliance: z.object({
        dataProtectionOfficer: z.string().optional(),
        dpoEmail: z.string().email("Email inválido").optional().or(z.literal("")),
        privacyImpactAssessment: z.boolean(),
        consentManagement: z.boolean(),
        dataRetentionPolicy: z.boolean(),
        breachNotificationProcess: z.boolean(),
        thirdPartyAgreements: z.boolean(),
    }),
    // ANVISA Compliance
    anvisaCompliance: z.object({
        medicalDeviceRegistry: z.boolean(),
        adverseEventReporting: z.boolean(),
        qualityManagementSystem: z.boolean(),
        technicalResponsible: z.string().optional(),
        technicalResponsibleCrm: z.string().optional(),
    }),
    // CFM Compliance
    cfmCompliance: z.object({
        professionalEthics: z.boolean(),
        telemedicineCompliance: z.boolean(),
        medicalRecordsSecurity: z.boolean(),
        patientPrivacy: z.boolean(),
        informedConsent: z.boolean(),
    }),
    // Audit Logs
    auditLogs: z.array(auditLogSchema),
    // Notifications
    enableExpiryAlerts: z.boolean(),
    alertDaysBefore: z.number().min(1).max(365),
    notificationEmails: z.array(z.string().email()),
});
function ComplianceSettings() {
    var _this = this;
    var _a = (0, react_1.useState)(false), isLoading = _a[0], setIsLoading = _a[1];
    var _b = (0, react_1.useState)(false), isSaving = _b[0], setIsSaving = _b[1];
    var _c = (0, react_1.useState)(null), lastSaved = _c[0], setLastSaved = _c[1];
    var _d = (0, react_1.useState)("licenses"), activeTab = _d[0], setActiveTab = _d[1];
    var _e = (0, react_1.useState)([]), complianceScores = _e[0], setComplianceScores = _e[1];
    var form = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_1.zodResolver)(complianceSettingsSchema),
        defaultValues: {
            licenses: [],
            lgpdCompliance: {
                dataProtectionOfficer: "",
                dpoEmail: "",
                privacyImpactAssessment: false,
                consentManagement: false,
                dataRetentionPolicy: false,
                breachNotificationProcess: false,
                thirdPartyAgreements: false,
            },
            anvisaCompliance: {
                medicalDeviceRegistry: false,
                adverseEventReporting: false,
                qualityManagementSystem: false,
                technicalResponsible: "",
                technicalResponsibleCrm: "",
            },
            cfmCompliance: {
                professionalEthics: false,
                telemedicineCompliance: false,
                medicalRecordsSecurity: false,
                patientPrivacy: false,
                informedConsent: false,
            },
            auditLogs: [],
            enableExpiryAlerts: true,
            alertDaysBefore: 30,
            notificationEmails: [],
        },
    });
    var _f = (0, react_hook_form_1.useFieldArray)({
        control: form.control,
        name: "licenses",
    }), licenseFields = _f.fields, appendLicense = _f.append, removeLicense = _f.remove;
    var _g = (0, react_hook_form_1.useFieldArray)({
        control: form.control,
        name: "auditLogs",
    }), auditLogFields = _g.fields, appendAuditLog = _g.append, removeAuditLog = _g.remove;
    // Calculate compliance scores
    (0, react_1.useEffect)(function () {
        var calculateScores = function () {
            var lgpdData = form.watch("lgpdCompliance");
            var anvisaData = form.watch("anvisaCompliance");
            var cfmData = form.watch("cfmCompliance");
            var scores = [
                {
                    category: "LGPD",
                    score: Object.values(lgpdData).filter(function (v) { return v === true; }).length,
                    maxScore: 5,
                    items: [
                        { name: "Avaliação de Impacto", compliant: lgpdData.privacyImpactAssessment, required: true },
                        { name: "Gestão de Consentimento", compliant: lgpdData.consentManagement, required: true },
                        { name: "Política de Retenção", compliant: lgpdData.dataRetentionPolicy, required: true },
                        { name: "Processo de Vazamento", compliant: lgpdData.breachNotificationProcess, required: true },
                        { name: "Acordos com Terceiros", compliant: lgpdData.thirdPartyAgreements, required: false },
                    ],
                },
                {
                    category: "ANVISA",
                    score: Object.values(anvisaData).filter(function (v) { return v === true; }).length,
                    maxScore: 3,
                    items: [
                        { name: "Registro de Dispositivos", compliant: anvisaData.medicalDeviceRegistry, required: true },
                        { name: "Notificação de Eventos", compliant: anvisaData.adverseEventReporting, required: true },
                        { name: "Sistema de Qualidade", compliant: anvisaData.qualityManagementSystem, required: true },
                    ],
                },
                {
                    category: "CFM",
                    score: Object.values(cfmData).filter(function (v) { return v === true; }).length,
                    maxScore: 5,
                    items: [
                        { name: "Ética Profissional", compliant: cfmData.professionalEthics, required: true },
                        { name: "Telemedicina", compliant: cfmData.telemedicineCompliance, required: false },
                        { name: "Segurança Prontuários", compliant: cfmData.medicalRecordsSecurity, required: true },
                        { name: "Privacidade Paciente", compliant: cfmData.patientPrivacy, required: true },
                        { name: "Consentimento Informado", compliant: cfmData.informedConsent, required: true },
                    ],
                },
            ];
            setComplianceScores(scores);
        };
        calculateScores();
    }, [form.watch()]);
    // Load existing settings
    (0, react_1.useEffect)(function () {
        var loadComplianceSettings = function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                setIsLoading(true);
                try {
                    // TODO: Replace with actual API call
                    // const response = await fetch("/api/settings/compliance");
                    // const data = await response.json();
                    // form.reset(data);
                }
                catch (error) {
                    console.error("Erro ao carregar configurações:", error);
                    sonner_1.toast.error("Erro ao carregar configurações de conformidade");
                }
                finally {
                    setIsLoading(false);
                }
                return [2 /*return*/];
            });
        }); };
        loadComplianceSettings();
    }, [form]);
    var onSubmit = function (data) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            setIsSaving(true);
            try {
                // TODO: Replace with actual API call
                // await fetch("/api/settings/compliance", {
                //   method: "POST",
                //   headers: { "Content-Type": "application/json" },
                //   body: JSON.stringify(data),
                // });
                setLastSaved(new Date());
                sonner_1.toast.success("Configurações de conformidade salvas com sucesso!");
            }
            catch (error) {
                console.error("Erro ao salvar configurações:", error);
                sonner_1.toast.error("Erro ao salvar configurações");
            }
            finally {
                setIsSaving(false);
            }
            return [2 /*return*/];
        });
    }); };
    var getExpiryStatus = function (expiryDate) {
        var expiry = new Date(expiryDate);
        var today = new Date();
        var diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24));
        if (diffDays < 0)
            return { status: "expired", label: "Vencida", color: "bg-red-100 text-red-800" };
        if (diffDays <= 30)
            return { status: "expiring", label: "Vencendo", color: "bg-yellow-100 text-yellow-800" };
        return { status: "valid", label: "Válida", color: "bg-green-100 text-green-800" };
    };
    var getCompliancePercentage = function () {
        var totalScore = complianceScores.reduce(function (sum, score) { return sum + score.score; }, 0);
        var totalMaxScore = complianceScores.reduce(function (sum, score) { return sum + score.maxScore; }, 0);
        return totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;
    };
    if (isLoading) {
        return (<div className="flex items-center justify-center p-8">
        <lucide_react_1.Loader2 className="h-8 w-8 animate-spin"/>
      </div>);
    }
    return (<div className="space-y-6">
      {/* Compliance Overview */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.ShieldCheck className="h-5 w-5"/>
            Índice de Conformidade Geral
          </card_1.CardTitle>
          <card_1.CardDescription>
            Status consolidado da conformidade regulatória
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {getCompliancePercentage()}% Conforme
              </span>
              <badge_1.Badge className={getCompliancePercentage() >= 80 ? "bg-green-100 text-green-800" :
            getCompliancePercentage() >= 60 ? "bg-yellow-100 text-yellow-800" :
                "bg-red-100 text-red-800"}>
                {getCompliancePercentage() >= 80 ? "Excelente" :
            getCompliancePercentage() >= 60 ? "Boa" : "Crítica"}
              </badge_1.Badge>
            </div>
            
            <progress_1.Progress value={getCompliancePercentage()} className="h-3"/>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {complianceScores.map(function (score) { return (<div key={score.category} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{score.category}</h4>
                    <badge_1.Badge variant="outline">
                      {score.score}/{score.maxScore}
                    </badge_1.Badge>
                  </div>
                  <progress_1.Progress value={(score.score / score.maxScore) * 100} className="h-2 mb-3"/>
                  <div className="space-y-1">
                    {score.items.map(function (item, index) { return (<div key={index} className="flex items-center gap-2 text-sm">
                        {item.compliant ? (<lucide_react_1.CheckCircle2 className="h-3 w-3 text-green-600"/>) : (<lucide_react_1.XCircle className="h-3 w-3 text-red-600"/>)}
                        <span className={item.required ? "font-medium" : ""}>
                          {item.name}
                          {item.required && <span className="text-red-500 ml-1">*</span>}
                        </span>
                      </div>); })}
                  </div>
                </div>); })}
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      <form_1.Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab}>
            <tabs_1.TabsList className="grid w-full grid-cols-4">
              <tabs_1.TabsTrigger value="licenses">Licenças</tabs_1.TabsTrigger>
              <tabs_1.TabsTrigger value="lgpd">LGPD</tabs_1.TabsTrigger>
              <tabs_1.TabsTrigger value="anvisa">ANVISA</tabs_1.TabsTrigger>
              <tabs_1.TabsTrigger value="cfm">CFM</tabs_1.TabsTrigger>
            </tabs_1.TabsList>

            {/* Licenses Tab */}
            <tabs_1.TabsContent value="licenses" className="space-y-6">
              <card_1.Card>
                <card_1.CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <card_1.CardTitle>Licenças e Certificações</card_1.CardTitle>
                      <card_1.CardDescription>
                        Gerenciar licenças de funcionamento e certificações
                      </card_1.CardDescription>
                    </div>
                    <button_1.Button type="button" onClick={function () { return appendLicense({
            type: "",
            number: "",
            authority: "",
            issueDate: "",
            expiryDate: "",
            status: "active",
            notes: "",
            documentUrl: "",
            reminderDays: 30,
        }); }}>
                      <lucide_react_1.Plus className="h-4 w-4 mr-2"/>
                      Adicionar Licença
                    </button_1.Button>
                  </div>
                </card_1.CardHeader>
                <card_1.CardContent>
                  {licenseFields.length === 0 ? (<div className="text-center p-8">
                      <lucide_react_1.FileCheck className="h-12 w-12 text-gray-400 mx-auto mb-4"/>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Nenhuma licença cadastrada
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Adicione as licenças e certificações da clínica
                      </p>
                    </div>) : (<div className="space-y-6">
                      {licenseFields.map(function (field, index) { return (<card_1.Card key={field.id} className="p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium">Licença #{index + 1}</h4>
                            <button_1.Button type="button" variant="outline" size="sm" onClick={function () { return removeLicense(index); }} className="text-red-600 hover:text-red-800">
                              <lucide_react_1.Trash2 className="h-4 w-4"/>
                            </button_1.Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <form_1.FormField control={form.control} name={"licenses.".concat(index, ".type")} render={function (_a) {
                    var field = _a.field;
                    return (<form_1.FormItem>
                                  <form_1.FormLabel>Tipo de Licença</form_1.FormLabel>
                                  <select_1.Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <form_1.FormControl>
                                      <select_1.SelectTrigger>
                                        <select_1.SelectValue placeholder="Selecione o tipo"/>
                                      </select_1.SelectTrigger>
                                    </form_1.FormControl>
                                    <select_1.SelectContent>
                                      {licenseTypes.map(function (type) { return (<select_1.SelectItem key={type.value} value={type.value}>
                                          {type.label}
                                        </select_1.SelectItem>); })}
                                    </select_1.SelectContent>
                                  </select_1.Select>
                                  <form_1.FormMessage />
                                </form_1.FormItem>);
                }}/>

                            <form_1.FormField control={form.control} name={"licenses.".concat(index, ".number")} render={function (_a) {
                    var field = _a.field;
                    return (<form_1.FormItem>
                                  <form_1.FormLabel>Número da Licença</form_1.FormLabel>
                                  <form_1.FormControl>
                                    <input_1.Input placeholder="ABC123456" {...field}/>
                                  </form_1.FormControl>
                                  <form_1.FormMessage />
                                </form_1.FormItem>);
                }}/>

                            <form_1.FormField control={form.control} name={"licenses.".concat(index, ".authority")} render={function (_a) {
                    var field = _a.field;
                    return (<form_1.FormItem>
                                  <form_1.FormLabel>Órgão Emissor</form_1.FormLabel>
                                  <form_1.FormControl>
                                    <input_1.Input placeholder="ANVISA, CRM, etc." {...field}/>
                                  </form_1.FormControl>
                                  <form_1.FormMessage />
                                </form_1.FormItem>);
                }}/>

                            <form_1.FormField control={form.control} name={"licenses.".concat(index, ".status")} render={function (_a) {
                    var field = _a.field;
                    return (<form_1.FormItem>
                                  <form_1.FormLabel>Status</form_1.FormLabel>
                                  <select_1.Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <form_1.FormControl>
                                      <select_1.SelectTrigger>
                                        <select_1.SelectValue />
                                      </select_1.SelectTrigger>
                                    </form_1.FormControl>
                                    <select_1.SelectContent>
                                      <select_1.SelectItem value="active">Ativa</select_1.SelectItem>
                                      <select_1.SelectItem value="expired">Vencida</select_1.SelectItem>
                                      <select_1.SelectItem value="pending">Pendente</select_1.SelectItem>
                                      <select_1.SelectItem value="suspended">Suspensa</select_1.SelectItem>
                                    </select_1.SelectContent>
                                  </select_1.Select>
                                  <form_1.FormMessage />
                                </form_1.FormItem>);
                }}/>

                            <form_1.FormField control={form.control} name={"licenses.".concat(index, ".issueDate")} render={function (_a) {
                    var field = _a.field;
                    return (<form_1.FormItem>
                                  <form_1.FormLabel>Data de Emissão</form_1.FormLabel>
                                  <form_1.FormControl>
                                    <input_1.Input type="date" {...field}/>
                                  </form_1.FormControl>
                                  <form_1.FormMessage />
                                </form_1.FormItem>);
                }}/>

                            <form_1.FormField control={form.control} name={"licenses.".concat(index, ".expiryDate")} render={function (_a) {
                    var field = _a.field;
                    return (<form_1.FormItem>
                                  <form_1.FormLabel>Data de Vencimento</form_1.FormLabel>
                                  <form_1.FormControl>
                                    <input_1.Input type="date" {...field}/>
                                  </form_1.FormControl>
                                  {field.value && (<div className="mt-1">
                                      <badge_1.Badge className={getExpiryStatus(field.value).color}>
                                        {getExpiryStatus(field.value).label}
                                      </badge_1.Badge>
                                    </div>)}
                                  <form_1.FormMessage />
                                </form_1.FormItem>);
                }}/>
                          </div>

                          <div className="mt-4 space-y-4">
                            <form_1.FormField control={form.control} name={"licenses.".concat(index, ".documentUrl")} render={function (_a) {
                    var field = _a.field;
                    return (<form_1.FormItem>
                                  <form_1.FormLabel>URL do Documento</form_1.FormLabel>
                                  <form_1.FormControl>
                                    <input_1.Input placeholder="https://..." {...field} className="pr-10"/>
                                  </form_1.FormControl>
                                  {field.value && (<button_1.Button type="button" variant="ghost" size="sm" onClick={function () { return window.open(field.value, '_blank'); }} className="absolute right-2 top-8">
                                      <lucide_react_1.ExternalLink className="h-4 w-4"/>
                                    </button_1.Button>)}
                                  <form_1.FormMessage />
                                </form_1.FormItem>);
                }}/>

                            <form_1.FormField control={form.control} name={"licenses.".concat(index, ".notes")} render={function (_a) {
                    var field = _a.field;
                    return (<form_1.FormItem>
                                  <form_1.FormLabel>Observações</form_1.FormLabel>
                                  <form_1.FormControl>
                                    <textarea_1.Textarea placeholder="Observações sobre a licença..." className="resize-none" rows={2} {...field}/>
                                  </form_1.FormControl>
                                  <form_1.FormMessage />
                                </form_1.FormItem>);
                }}/>
                          </div>
                        </card_1.Card>); })}
                    </div>)}
                </card_1.CardContent>
              </card_1.Card>
            </tabs_1.TabsContent>

            {/* LGPD Tab */}
            <tabs_1.TabsContent value="lgpd" className="space-y-6">
              <alert_1.Alert>
                <lucide_react_1.ShieldCheck className="h-4 w-4"/>
                <alert_1.AlertDescription>
                  <strong>LGPD (Lei 13.709/2018):</strong> A Lei Geral de Proteção de Dados 
                  exige conformidade obrigatória para clínicas que processam dados pessoais de pacientes.
                </alert_1.AlertDescription>
              </alert_1.Alert>

              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle>Conformidade LGPD</card_1.CardTitle>
                  <card_1.CardDescription>
                    Configurações para conformidade com a Lei Geral de Proteção de Dados
                  </card_1.CardDescription>
                </card_1.CardHeader>
                <card_1.CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <form_1.FormField control={form.control} name="lgpdCompliance.dataProtectionOfficer" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                          <form_1.FormLabel>Encarregado de Dados (DPO)</form_1.FormLabel>
                          <form_1.FormControl>
                            <input_1.Input placeholder="Nome do responsável" {...field}/>
                          </form_1.FormControl>
                          <form_1.FormDescription>
                            Pessoa responsável pela proteção de dados
                          </form_1.FormDescription>
                          <form_1.FormMessage />
                        </form_1.FormItem>);
        }}/>

                    <form_1.FormField control={form.control} name="lgpdCompliance.dpoEmail" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                          <form_1.FormLabel>Email do DPO</form_1.FormLabel>
                          <form_1.FormControl>
                            <input_1.Input type="email" placeholder="dpo@clinica.com.br" {...field}/>
                          </form_1.FormControl>
                          <form_1.FormDescription>
                            Email para contato sobre dados pessoais
                          </form_1.FormDescription>
                          <form_1.FormMessage />
                        </form_1.FormItem>);
        }}/>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Requisitos de Conformidade</h4>
                    
                    <form_1.FormField control={form.control} name="lgpdCompliance.privacyImpactAssessment" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <form_1.FormLabel className="text-base">
                              Avaliação de Impacto à Proteção de Dados
                              <span className="text-red-500 ml-1">*</span>
                            </form_1.FormLabel>
                            <form_1.FormDescription>
                              RIPD realizada para atividades de alto risco
                            </form_1.FormDescription>
                          </div>
                          <form_1.FormControl>
                            <switch_1.Switch checked={field.value} onCheckedChange={field.onChange}/>
                          </form_1.FormControl>
                        </form_1.FormItem>);
        }}/>

                    <form_1.FormField control={form.control} name="lgpdCompliance.consentManagement" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <form_1.FormLabel className="text-base">
                              Gestão de Consentimento
                              <span className="text-red-500 ml-1">*</span>
                            </form_1.FormLabel>
                            <form_1.FormDescription>
                              Sistema para gerenciar consentimentos dos pacientes
                            </form_1.FormDescription>
                          </div>
                          <form_1.FormControl>
                            <switch_1.Switch checked={field.value} onCheckedChange={field.onChange}/>
                          </form_1.FormControl>
                        </form_1.FormItem>);
        }}/>

                    <form_1.FormField control={form.control} name="lgpdCompliance.dataRetentionPolicy" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <form_1.FormLabel className="text-base">
                              Política de Retenção de Dados
                              <span className="text-red-500 ml-1">*</span>
                            </form_1.FormLabel>
                            <form_1.FormDescription>
                              Definição de prazos para manutenção dos dados
                            </form_1.FormDescription>
                          </div>
                          <form_1.FormControl>
                            <switch_1.Switch checked={field.value} onCheckedChange={field.onChange}/>
                          </form_1.FormControl>
                        </form_1.FormItem>);
        }}/>

                    <form_1.FormField control={form.control} name="lgpdCompliance.breachNotificationProcess" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <form_1.FormLabel className="text-base">
                              Processo de Notificação de Vazamentos
                              <span className="text-red-500 ml-1">*</span>
                            </form_1.FormLabel>
                            <form_1.FormDescription>
                              Procedimento para notificar ANPD e titulares em até 72h
                            </form_1.FormDescription>
                          </div>
                          <form_1.FormControl>
                            <switch_1.Switch checked={field.value} onCheckedChange={field.onChange}/>
                          </form_1.FormControl>
                        </form_1.FormItem>);
        }}/>

                    <form_1.FormField control={form.control} name="lgpdCompliance.thirdPartyAgreements" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <form_1.FormLabel className="text-base">Acordos com Terceiros</form_1.FormLabel>
                            <form_1.FormDescription>
                              Contratos de compartilhamento de dados com parceiros
                            </form_1.FormDescription>
                          </div>
                          <form_1.FormControl>
                            <switch_1.Switch checked={field.value} onCheckedChange={field.onChange}/>
                          </form_1.FormControl>
                        </form_1.FormItem>);
        }}/>
                  </div>
                </card_1.CardContent>
              </card_1.Card>
            </tabs_1.TabsContent>

            {/* ANVISA Tab */}
            <tabs_1.TabsContent value="anvisa" className="space-y-6">
              <alert_1.Alert>
                <lucide_react_1.FileCheck className="h-4 w-4"/>
                <alert_1.AlertDescription>
                  <strong>ANVISA:</strong> Agência Nacional de Vigilância Sanitária regula 
                  dispositivos médicos e estabelecimentos de saúde no Brasil.
                </alert_1.AlertDescription>
              </alert_1.Alert>

              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle>Conformidade ANVISA</card_1.CardTitle>
                  <card_1.CardDescription>
                    Requisitos para funcionamento de estabelecimentos de saúde
                  </card_1.CardDescription>
                </card_1.CardHeader>
                <card_1.CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <form_1.FormField control={form.control} name="anvisaCompliance.technicalResponsible" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                          <form_1.FormLabel>Responsável Técnico</form_1.FormLabel>
                          <form_1.FormControl>
                            <input_1.Input placeholder="Dr. João Silva" {...field}/>
                          </form_1.FormControl>
                          <form_1.FormDescription>
                            Profissional responsável técnico perante ANVISA
                          </form_1.FormDescription>
                          <form_1.FormMessage />
                        </form_1.FormItem>);
        }}/>

                    <form_1.FormField control={form.control} name="anvisaCompliance.technicalResponsibleCrm" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                          <form_1.FormLabel>CRM do Responsável</form_1.FormLabel>
                          <form_1.FormControl>
                            <input_1.Input placeholder="123456/SP" {...field}/>
                          </form_1.FormControl>
                          <form_1.FormDescription>
                            Número do CRM do responsável técnico
                          </form_1.FormDescription>
                          <form_1.FormMessage />
                        </form_1.FormItem>);
        }}/>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Requisitos Obrigatórios</h4>
                    
                    <form_1.FormField control={form.control} name="anvisaCompliance.medicalDeviceRegistry" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <form_1.FormLabel className="text-base">
                              Registro de Dispositivos Médicos
                              <span className="text-red-500 ml-1">*</span>
                            </form_1.FormLabel>
                            <form_1.FormDescription>
                              Todos os equipamentos médicos registrados na ANVISA
                            </form_1.FormDescription>
                          </div>
                          <form_1.FormControl>
                            <switch_1.Switch checked={field.value} onCheckedChange={field.onChange}/>
                          </form_1.FormControl>
                        </form_1.FormItem>);
        }}/>

                    <form_1.FormField control={form.control} name="anvisaCompliance.adverseEventReporting" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <form_1.FormLabel className="text-base">
                              Notificação de Eventos Adversos
                              <span className="text-red-500 ml-1">*</span>
                            </form_1.FormLabel>
                            <form_1.FormDescription>
                              Sistema para reportar eventos adversos ao SNVS
                            </form_1.FormDescription>
                          </div>
                          <form_1.FormControl>
                            <switch_1.Switch checked={field.value} onCheckedChange={field.onChange}/>
                          </form_1.FormControl>
                        </form_1.FormItem>);
        }}/>

                    <form_1.FormField control={form.control} name="anvisaCompliance.qualityManagementSystem" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <form_1.FormLabel className="text-base">
                              Sistema de Gestão da Qualidade
                              <span className="text-red-500 ml-1">*</span>
                            </form_1.FormLabel>
                            <form_1.FormDescription>
                              SGQ implementado conforme RDC 16/2013
                            </form_1.FormDescription>
                          </div>
                          <form_1.FormControl>
                            <switch_1.Switch checked={field.value} onCheckedChange={field.onChange}/>
                          </form_1.FormControl>
                        </form_1.FormItem>);
        }}/>
                  </div>
                </card_1.CardContent>
              </card_1.Card>
            </tabs_1.TabsContent>

            {/* CFM Tab */}
            <tabs_1.TabsContent value="cfm" className="space-y-6">
              <alert_1.Alert>
                <lucide_react_1.ShieldCheck className="h-4 w-4"/>
                <alert_1.AlertDescription>
                  <strong>CFM:</strong> Conselho Federal de Medicina regula o exercício 
                  da medicina e a telemedicina no Brasil.
                </alert_1.AlertDescription>
              </alert_1.Alert>

              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle>Conformidade CFM</card_1.CardTitle>
                  <card_1.CardDescription>
                    Requisitos éticos e profissionais para prática médica
                  </card_1.CardDescription>
                </card_1.CardHeader>
                <card_1.CardContent className="space-y-4">
                  <form_1.FormField control={form.control} name="cfmCompliance.professionalEthics" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <form_1.FormLabel className="text-base">
                            Código de Ética Médica
                            <span className="text-red-500 ml-1">*</span>
                          </form_1.FormLabel>
                          <form_1.FormDescription>
                            Cumprimento do Código de Ética Médica (Resolução CFM 2.217/2018)
                          </form_1.FormDescription>
                        </div>
                        <form_1.FormControl>
                          <switch_1.Switch checked={field.value} onCheckedChange={field.onChange}/>
                        </form_1.FormControl>
                      </form_1.FormItem>);
        }}/>

                  <form_1.FormField control={form.control} name="cfmCompliance.telemedicineCompliance" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <form_1.FormLabel className="text-base">Conformidade Telemedicina</form_1.FormLabel>
                          <form_1.FormDescription>
                            Atendimento conforme Resolução CFM 2.314/2022
                          </form_1.FormDescription>
                        </div>
                        <form_1.FormControl>
                          <switch_1.Switch checked={field.value} onCheckedChange={field.onChange}/>
                        </form_1.FormControl>
                      </form_1.FormItem>);
        }}/>

                  <form_1.FormField control={form.control} name="cfmCompliance.medicalRecordsSecurity" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <form_1.FormLabel className="text-base">
                            Segurança dos Prontuários
                            <span className="text-red-500 ml-1">*</span>
                          </form_1.FormLabel>
                          <form_1.FormDescription>
                            Prontuários eletrônicos seguros conforme CFM 1.821/2007
                          </form_1.FormDescription>
                        </div>
                        <form_1.FormControl>
                          <switch_1.Switch checked={field.value} onCheckedChange={field.onChange}/>
                        </form_1.FormControl>
                      </form_1.FormItem>);
        }}/>

                  <form_1.FormField control={form.control} name="cfmCompliance.patientPrivacy" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <form_1.FormLabel className="text-base">
                            Privacidade do Paciente
                            <span className="text-red-500 ml-1">*</span>
                          </form_1.FormLabel>
                          <form_1.FormDescription>
                            Sigilo médico e proteção da privacidade
                          </form_1.FormDescription>
                        </div>
                        <form_1.FormControl>
                          <switch_1.Switch checked={field.value} onCheckedChange={field.onChange}/>
                        </form_1.FormControl>
                      </form_1.FormItem>);
        }}/>

                  <form_1.FormField control={form.control} name="cfmCompliance.informedConsent" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <form_1.FormLabel className="text-base">
                            Consentimento Informado
                            <span className="text-red-500 ml-1">*</span>
                          </form_1.FormLabel>
                          <form_1.FormDescription>
                            Processo de consentimento livre e esclarecido
                          </form_1.FormDescription>
                        </div>
                        <form_1.FormControl>
                          <switch_1.Switch checked={field.value} onCheckedChange={field.onChange}/>
                        </form_1.FormControl>
                      </form_1.FormItem>);
        }}/>
                </card_1.CardContent>
              </card_1.Card>
            </tabs_1.TabsContent>
          </tabs_1.Tabs>

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
                  Salvar Conformidade
                </>)}
            </button_1.Button>
          </div>
        </form>
      </form_1.Form>
    </div>);
}

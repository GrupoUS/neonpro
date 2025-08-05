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
exports.default = PrivacyCompliance;
var alert_1 = require("@/components/ui/alert");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var progress_1 = require("@/components/ui/progress");
var select_1 = require("@/components/ui/select");
var switch_1 = require("@/components/ui/switch");
var tabs_1 = require("@/components/ui/tabs");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
function PrivacyCompliance() {
    var _this = this;
    var _a = (0, react_1.useState)([]), complianceRules = _a[0], setComplianceRules = _a[1];
    var _b = (0, react_1.useState)({
        dataRetentionDays: 365,
        anonymizeAfterDays: 1095,
        allowDataExport: true,
        requireExplicitConsent: true,
        enableDataDeletion: true,
        auditLogging: true,
        encryptionLevel: "HIGH",
    }), privacySettings = _b[0], setPrivacySettings = _b[1];
    var _c = (0, react_1.useState)([]), consentRecords = _c[0], setConsentRecords = _c[1];
    var _d = (0, react_1.useState)(true), isLoading = _d[0], setIsLoading = _d[1];
    var _e = (0, react_1.useState)(0), complianceScore = _e[0], setComplianceScore = _e[1];
    (0, react_1.useEffect)(function () {
        loadComplianceData();
    }, []);
    var loadComplianceData = function () { return __awaiter(_this, void 0, void 0, function () {
        var mockRules, mockConsents, totalRules, activeRules, violationsCount, score, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    // Mock data - replace with actual API calls
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                case 2:
                    // Mock data - replace with actual API calls
                    _a.sent();
                    mockRules = [
                        {
                            id: "1",
                            name: "LGPD - Consentimento Explícito",
                            description: "Verificar se todos os pacientes têm consentimento explícito para processamento de dados",
                            type: "LGPD",
                            isActive: true,
                            severity: "CRITICAL",
                            lastChecked: new Date().toISOString(),
                            violations: 2,
                            autoRemediation: true,
                        },
                        {
                            id: "2",
                            name: "ANVISA - Dados de Procedimentos",
                            description: "Garantir conformidade com regulamentos ANVISA para dados de procedimentos estéticos",
                            type: "ANVISA",
                            isActive: true,
                            severity: "HIGH",
                            lastChecked: new Date().toISOString(),
                            violations: 0,
                            autoRemediation: false,
                        },
                        {
                            id: "3",
                            name: "CFM - Sigilo Médico",
                            description: "Verificar conformidade com regras de sigilo médico do CFM",
                            type: "CFM",
                            isActive: true,
                            severity: "CRITICAL",
                            lastChecked: new Date().toISOString(),
                            violations: 1,
                            autoRemediation: true,
                        },
                        {
                            id: "4",
                            name: "Retenção de Dados",
                            description: "Verificar se dados não são mantidos além do período legal",
                            type: "CUSTOM",
                            isActive: true,
                            severity: "MEDIUM",
                            lastChecked: new Date().toISOString(),
                            violations: 0,
                            autoRemediation: true,
                        },
                    ];
                    mockConsents = [
                        {
                            id: "1",
                            patientId: "pat_001",
                            patientName: "Maria Silva",
                            consentType: "Processamento de Dados Pessoais",
                            status: "GRANTED",
                            grantedAt: "2024-01-15T10:30:00Z",
                            purpose: "Atendimento médico e comunicação",
                            dataTypes: ["Dados pessoais", "Dados de saúde", "Histórico médico"],
                        },
                        {
                            id: "2",
                            patientId: "pat_002",
                            patientName: "João Santos",
                            consentType: "Marketing e Comunicação",
                            status: "WITHDRAWN",
                            grantedAt: "2024-01-10T14:20:00Z",
                            withdrawnAt: "2024-01-25T09:15:00Z",
                            purpose: "Envio de ofertas e comunicações promocionais",
                            dataTypes: ["Dados pessoais", "Preferências"],
                        },
                        {
                            id: "3",
                            patientId: "pat_003",
                            patientName: "Ana Costa",
                            consentType: "Compartilhamento de Dados",
                            status: "PENDING",
                            grantedAt: "2024-01-30T16:45:00Z",
                            purpose: "Compartilhamento com laboratórios parceiros",
                            dataTypes: ["Dados de exames", "Resultados"],
                        },
                    ];
                    setComplianceRules(mockRules);
                    setConsentRecords(mockConsents);
                    totalRules = mockRules.length;
                    activeRules = mockRules.filter(function (r) { return r.isActive; }).length;
                    violationsCount = mockRules.reduce(function (acc, r) { return acc + r.violations; }, 0);
                    score = Math.max(0, ((activeRules - violationsCount) / totalRules) * 100);
                    setComplianceScore(Math.round(score));
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    console.error("Failed to load compliance data:", error_1);
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var getSeverityColor = function (severity) {
        var colors = {
            LOW: "bg-blue-100 text-blue-800",
            MEDIUM: "bg-yellow-100 text-yellow-800",
            HIGH: "bg-orange-100 text-orange-800",
            CRITICAL: "bg-red-100 text-red-800",
        };
        return colors[severity] || colors.LOW;
    };
    var getStatusColor = function (status) {
        var colors = {
            GRANTED: "bg-green-100 text-green-800",
            WITHDRAWN: "bg-red-100 text-red-800",
            PENDING: "bg-yellow-100 text-yellow-800",
        };
        return colors[status] || colors.PENDING;
    };
    var toggleRule = function (ruleId) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            setComplianceRules(function (rules) {
                return rules.map(function (rule) {
                    return rule.id === ruleId ? __assign(__assign({}, rule), { isActive: !rule.isActive }) : rule;
                });
            });
            return [2 /*return*/];
        });
    }); };
    var updatePrivacySettings = function (newSettings) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            setPrivacySettings(function (current) { return (__assign(__assign({}, current), newSettings)); });
            return [2 /*return*/];
        });
    }); };
    var exportComplianceReport = function () {
        var reportData = {
            complianceScore: complianceScore,
            rules: complianceRules,
            settings: privacySettings,
            consents: consentRecords,
            generatedAt: new Date().toISOString(),
        };
        var blob = new Blob([JSON.stringify(reportData, null, 2)], {
            type: "application/json",
        });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = "compliance-report-".concat(new Date().toISOString().split("T")[0], ".json");
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    if (isLoading) {
        return (<div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map(function (_, i) { return (<card_1.Card key={i}>
              <card_1.CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </card_1.CardContent>
            </card_1.Card>); })}
        </div>
      </div>);
    }
    return (<div className="space-y-6">
      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <card_1.Card>
          <card_1.CardContent className="p-6">
            <div className="flex items-center">
              <lucide_react_1.Shield className="h-4 w-4 text-muted-foreground"/>
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Score de Conformidade
                </p>
                <div className="flex items-center">
                  <div className="text-2xl font-bold">{complianceScore}%</div>
                  <progress_1.Progress value={complianceScore} className="ml-2 w-16"/>
                </div>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-6">
            <div className="flex items-center">
              <lucide_react_1.CheckCircle className="h-4 w-4 text-muted-foreground"/>
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Regras Ativas
                </p>
                <div className="text-2xl font-bold">
                  {complianceRules.filter(function (r) { return r.isActive; }).length}
                </div>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-6">
            <div className="flex items-center">
              <lucide_react_1.AlertTriangle className="h-4 w-4 text-muted-foreground"/>
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Violações
                </p>
                <div className="text-2xl font-bold">
                  {complianceRules.reduce(function (acc, r) { return acc + r.violations; }, 0)}
                </div>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-6">
            <div className="flex items-center">
              <lucide_react_1.UserCheck className="h-4 w-4 text-muted-foreground"/>
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Consentimentos
                </p>
                <div className="text-2xl font-bold">
                  {consentRecords.filter(function (c) { return c.status === "GRANTED"; }).length}
                </div>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Compliance Alerts */}
      {complianceRules.some(function (r) { return r.violations > 0; }) && (<alert_1.Alert variant="destructive">
          <lucide_react_1.AlertTriangle className="h-4 w-4"/>
          <alert_1.AlertDescription>
            Foram detectadas{" "}
            {complianceRules.reduce(function (acc, r) { return acc + r.violations; }, 0)}{" "}
            violações de conformidade. Revise as regras e tome as ações
            necessárias.
          </alert_1.AlertDescription>
        </alert_1.Alert>)}

      {/* Main Content */}
      <tabs_1.Tabs defaultValue="rules" className="space-y-4">
        <div className="flex items-center justify-between">
          <tabs_1.TabsList>
            <tabs_1.TabsTrigger value="rules">Regras de Conformidade</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="privacy">
              Configurações de Privacidade
            </tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="consents">Gestão de Consentimentos</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="audit">Auditoria</tabs_1.TabsTrigger>
          </tabs_1.TabsList>

          <div className="flex gap-2">
            <button_1.Button variant="outline" onClick={exportComplianceReport}>
              <lucide_react_1.Download className="h-4 w-4 mr-2"/>
              Exportar Relatório
            </button_1.Button>
          </div>
        </div>

        <tabs_1.TabsContent value="rules" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Regras de Conformidade</card_1.CardTitle>
              <card_1.CardDescription>
                Configure e monitore regras de conformidade com LGPD, ANVISA e
                CFM
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                {complianceRules.map(function (rule) { return (<card_1.Card key={rule.id} className="border">
                    <card_1.CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{rule.name}</h4>
                            <badge_1.Badge className={getSeverityColor(rule.severity)}>
                              {rule.severity}
                            </badge_1.Badge>
                            <badge_1.Badge variant={rule.type === "LGPD" ? "default" : "secondary"}>
                              {rule.type}
                            </badge_1.Badge>
                            {rule.violations > 0 && (<badge_1.Badge variant="destructive">
                                {rule.violations} violações
                              </badge_1.Badge>)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {rule.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>
                              Última verificação:{" "}
                              {new Date(rule.lastChecked).toLocaleString("pt-BR")}
                            </span>
                            {rule.autoRemediation && (<span className="flex items-center gap-1">
                                <lucide_react_1.CheckCircle className="h-3 w-3"/>
                                Remediação automática
                              </span>)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <switch_1.Switch checked={rule.isActive} onCheckedChange={function () { return toggleRule(rule.id); }}/>
                          <button_1.Button variant="outline" size="sm">
                            <lucide_react_1.Settings className="h-4 w-4"/>
                          </button_1.Button>
                        </div>
                      </div>
                    </card_1.CardContent>
                  </card_1.Card>); })}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="privacy" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Configurações de Privacidade</card_1.CardTitle>
              <card_1.CardDescription>
                Configure políticas de retenção de dados, criptografia e
                privacidade
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label_1.Label htmlFor="retention">Retenção de Dados (dias)</label_1.Label>
                    <input_1.Input id="retention" type="number" value={privacySettings.dataRetentionDays} onChange={function (e) {
            return updatePrivacySettings({
                dataRetentionDays: parseInt(e.target.value),
            });
        }}/>
                  </div>

                  <div>
                    <label_1.Label htmlFor="anonymize">Anonimização Após (dias)</label_1.Label>
                    <input_1.Input id="anonymize" type="number" value={privacySettings.anonymizeAfterDays} onChange={function (e) {
            return updatePrivacySettings({
                anonymizeAfterDays: parseInt(e.target.value),
            });
        }}/>
                  </div>

                  <div>
                    <label_1.Label htmlFor="encryption">Nível de Criptografia</label_1.Label>
                    <select_1.Select value={privacySettings.encryptionLevel} onValueChange={function (value) {
            return updatePrivacySettings({ encryptionLevel: value });
        }}>
                      <select_1.SelectTrigger>
                        <select_1.SelectValue />
                      </select_1.SelectTrigger>
                      <select_1.SelectContent>
                        <select_1.SelectItem value="STANDARD">Padrão</select_1.SelectItem>
                        <select_1.SelectItem value="HIGH">Alto</select_1.SelectItem>
                        <select_1.SelectItem value="MAXIMUM">Máximo</select_1.SelectItem>
                      </select_1.SelectContent>
                    </select_1.Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label_1.Label htmlFor="export">Permitir Exportação de Dados</label_1.Label>
                    <switch_1.Switch id="export" checked={privacySettings.allowDataExport} onCheckedChange={function (checked) {
            return updatePrivacySettings({
                allowDataExport: checked,
            });
        }}/>
                  </div>

                  <div className="flex items-center justify-between">
                    <label_1.Label htmlFor="consent">Consentimento Explícito</label_1.Label>
                    <switch_1.Switch id="consent" checked={privacySettings.requireExplicitConsent} onCheckedChange={function (checked) {
            return updatePrivacySettings({
                requireExplicitConsent: checked,
            });
        }}/>
                  </div>

                  <div className="flex items-center justify-between">
                    <label_1.Label htmlFor="deletion">Permitir Exclusão de Dados</label_1.Label>
                    <switch_1.Switch id="deletion" checked={privacySettings.enableDataDeletion} onCheckedChange={function (checked) {
            return updatePrivacySettings({
                enableDataDeletion: checked,
            });
        }}/>
                  </div>

                  <div className="flex items-center justify-between">
                    <label_1.Label htmlFor="audit">Log de Auditoria</label_1.Label>
                    <switch_1.Switch id="audit" checked={privacySettings.auditLogging} onCheckedChange={function (checked) {
            return updatePrivacySettings({
                auditLogging: checked,
            });
        }}/>
                  </div>
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="consents" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Gestão de Consentimentos</card_1.CardTitle>
              <card_1.CardDescription>
                Monitore e gerencie consentimentos dos pacientes para
                processamento de dados
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                {consentRecords.map(function (consent) { return (<card_1.Card key={consent.id} className="border">
                    <card_1.CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">
                              {consent.patientName}
                            </h4>
                            <badge_1.Badge className={getStatusColor(consent.status)}>
                              {consent.status}
                            </badge_1.Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {consent.consentType} - {consent.purpose}
                          </p>
                          <p className="text-xs text-muted-foreground mb-2">
                            Dados: {consent.dataTypes.join(", ")}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>
                              Concedido:{" "}
                              {new Date(consent.grantedAt).toLocaleDateString("pt-BR")}
                            </span>
                            {consent.withdrawnAt && (<span>
                                Retirado:{" "}
                                {new Date(consent.withdrawnAt).toLocaleDateString("pt-BR")}
                              </span>)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button_1.Button variant="outline" size="sm">
                            <lucide_react_1.Eye className="h-4 w-4"/>
                          </button_1.Button>
                          <button_1.Button variant="outline" size="sm">
                            <lucide_react_1.FileText className="h-4 w-4"/>
                          </button_1.Button>
                        </div>
                      </div>
                    </card_1.CardContent>
                  </card_1.Card>); })}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="audit" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Trilha de Auditoria</card_1.CardTitle>
              <card_1.CardDescription>
                Histórico de acessos e modificações de dados para conformidade
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-center py-8">
                <lucide_react_1.FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4"/>
                <h3 className="text-lg font-semibold">Logs de Auditoria</h3>
                <p className="text-muted-foreground">
                  Relatórios detalhados de auditoria serão exibidos aqui
                </p>
                <button_1.Button className="mt-4">
                  <lucide_react_1.Upload className="h-4 w-4 mr-2"/>
                  Gerar Relatório de Auditoria
                </button_1.Button>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>);
}

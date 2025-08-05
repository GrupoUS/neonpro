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
exports.PatientConsentDashboard = PatientConsentDashboard;
// 🎛️ Patient Consent Dashboard - Granular Consent Management Interface
// NeonPro - Sistema de Automação de Compliance LGPD
// Quality Standard: ≥9.5/10 (BMad Enhanced)
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var switch_1 = require("@/components/ui/switch");
var alert_1 = require("@/components/ui/alert");
var progress_1 = require("@/components/ui/progress");
var tabs_1 = require("@/components/ui/tabs");
var scroll_area_1 = require("@/components/ui/scroll-area");
var lucide_react_1 = require("lucide-react");
function PatientConsentDashboard(_a) {
    var _this = this;
    var patientId = _a.patientId, onConsentUpdate = _a.onConsentUpdate, onPrivacyRequest = _a.onPrivacyRequest;
    var _b = (0, react_1.useState)([]), services = _b[0], setServices = _b[1];
    var _c = (0, react_1.useState)([]), consentHistory = _c[0], setConsentHistory = _c[1];
    var _d = (0, react_1.useState)(false), isLoading = _d[0], setIsLoading = _d[1];
    var _e = (0, react_1.useState)('overview'), activeTab = _e[0], setActiveTab = _e[1];
    // Load consent data on component mount
    (0, react_1.useEffect)(function () {
        loadConsentData();
    }, [patientId]);
    var loadConsentData = function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, serviceData, historyData, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setIsLoading(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, Promise.all([
                            fetchServiceDependencies(patientId),
                            fetchConsentHistory(patientId)
                        ])];
                case 2:
                    _a = _b.sent(), serviceData = _a[0], historyData = _a[1];
                    setServices(serviceData);
                    setConsentHistory(historyData);
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _b.sent();
                    console.error('Failed to load consent data:', error_1);
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Calculate overall consent status
    var overallStatus = calculateOverallStatus(services);
    var consentCoverage = calculateConsentCoverage(services);
    return (<div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gerenciamento de Consentimentos</h2>
          <p className="text-muted-foreground">
            Controle seus dados pessoais e exercite seus direitos conforme a LGPD
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <badge_1.Badge variant={overallStatus === 'fully_consented' ? 'default' : 'secondary'} className="h-8 px-3">
            {overallStatus === 'fully_consented' && <lucide_react_1.CheckCircle className="mr-1 h-4 w-4"/>}
            {overallStatus === 'partially_consented' && <lucide_react_1.AlertTriangle className="mr-1 h-4 w-4"/>}
            {overallStatus === 'missing_consent' && <lucide_react_1.Lock className="mr-1 h-4 w-4"/>}
            {getStatusText(overallStatus)}
          </badge_1.Badge>
        </div>
      </div>

      {/* Consent Coverage Progress */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center">
            <lucide_react_1.Shield className="mr-2 h-5 w-5"/>
            Status Geral dos Consentimentos
          </card_1.CardTitle>
          <card_1.CardDescription>
            Cobertura de consentimento para todos os serviços da clínica
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Cobertura de Consentimento</span>
                <span className="text-sm text-muted-foreground">{consentCoverage}%</span>
              </div>
              <progress_1.Progress value={consentCoverage} className="h-2"/>
            </div>
            
            {overallStatus !== 'fully_consented' && (<alert_1.Alert>
                <lucide_react_1.AlertTriangle className="h-4 w-4"/>
                <alert_1.AlertTitle>Ação Necessária</alert_1.AlertTitle>
                <alert_1.AlertDescription>
                  Alguns serviços requerem consentimento adicional para funcionamento completo.
                  Revise suas configurações abaixo.
                </alert_1.AlertDescription>
              </alert_1.Alert>)}
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Tabs Navigation */}
      <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab}>
        <tabs_1.TabsList className="grid w-full grid-cols-4">
          <tabs_1.TabsTrigger value="overview">Visão Geral</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="services">Serviços</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="history">Histórico</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="rights">Direitos</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        {/* Overview Tab */}
        <tabs_1.TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Essential Services */}
            <card_1.Card>
              <card_1.CardHeader className="pb-3">
                <card_1.CardTitle className="text-lg">Serviços Essenciais</card_1.CardTitle>
                <card_1.CardDescription>Necessários para atendimento médico</card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-2">
                  {services.filter(function (s) { return s.essential; }).map(function (service) { return (<div key={service.service} className="flex items-center justify-between">
                      <span className="text-sm">{service.service}</span>
                      <badge_1.Badge variant={service.consentStatus === 'granted' ? 'default' : 'destructive'}>
                        {service.consentStatus === 'granted' ? <lucide_react_1.CheckCircle className="h-3 w-3"/> : <lucide_react_1.Lock className="h-3 w-3"/>}
                      </badge_1.Badge>
                    </div>); })}
                </div>
              </card_1.CardContent>
            </card_1.Card>

            {/* Optional Services */}
            <card_1.Card>
              <card_1.CardHeader className="pb-3">
                <card_1.CardTitle className="text-lg">Serviços Opcionais</card_1.CardTitle>
                <card_1.CardDescription>Melhoram sua experiência</card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-2">
                  {services.filter(function (s) { return !s.essential; }).map(function (service) { return (<div key={service.service} className="flex items-center justify-between">
                      <span className="text-sm">{service.service}</span>
                      <ConsentToggle service={service} onToggle={function (enabled) { return handleServiceToggle(service, enabled); }}/>
                    </div>); })}
                </div>
              </card_1.CardContent>
            </card_1.Card>

            {/* Recent Activity */}
            <card_1.Card>
              <card_1.CardHeader className="pb-3">
                <card_1.CardTitle className="text-lg">Atividade Recente</card_1.CardTitle>
                <card_1.CardDescription>Últimas alterações de consentimento</card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <scroll_area_1.ScrollArea className="h-32">
                  <div className="space-y-2">
                    {consentHistory.slice(0, 5).map(function (activity, index) { return (<div key={index} className="flex items-center space-x-2 text-sm">
                        <div className="h-2 w-2 rounded-full bg-blue-500"/>
                        <span className="flex-1">{activity.description}</span>
                        <span className="text-muted-foreground text-xs">
                          {formatDate(activity.timestamp)}
                        </span>
                      </div>); })}
                  </div>
                </scroll_area_1.ScrollArea>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>

        {/* Services Tab */}
        <tabs_1.TabsContent value="services" className="space-y-4">
          <div className="space-y-4">
            {services.map(function (service) { return (<ServiceConsentCard key={service.service} service={service} onToggle={function (enabled) { return handleServiceToggle(service, enabled); }} onViewDetails={function () { return handleViewServiceDetails(service); }}/>); })}
          </div>
        </tabs_1.TabsContent>

        {/* History Tab */}
        <tabs_1.TabsContent value="history" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center">
                <lucide_react_1.History className="mr-2 h-5 w-5"/>
                Histórico de Consentimentos
              </card_1.CardTitle>
              <card_1.CardDescription>
                Registro completo de todas as alterações de consentimento
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <scroll_area_1.ScrollArea className="h-96">
                <div className="space-y-4">
                  {consentHistory.map(function (activity, index) { return (<ConsentHistoryItem key={index} activity={activity}/>); })}
                </div>
              </scroll_area_1.ScrollArea>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        {/* Rights Tab */}
        <tabs_1.TabsContent value="rights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Data Access */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center">
                  <lucide_react_1.Eye className="mr-2 h-5 w-5"/>
                  Acesso aos Dados
                </card_1.CardTitle>
                <card_1.CardDescription>
                  Solicite uma cópia completa dos seus dados pessoais
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <button_1.Button className="w-full" onClick={function () { return handlePrivacyRequest('access'); }}>
                  <lucide_react_1.Download className="mr-2 h-4 w-4"/>
                  Solicitar Cópia dos Dados
                </button_1.Button>
              </card_1.CardContent>
            </card_1.Card>

            {/* Data Correction */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center">
                  <lucide_react_1.Edit className="mr-2 h-5 w-5"/>
                  Correção de Dados
                </card_1.CardTitle>
                <card_1.CardDescription>
                  Solicite correção de informações incorretas
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <button_1.Button variant="outline" className="w-full" onClick={function () { return handlePrivacyRequest('correction'); }}>
                  <lucide_react_1.Edit className="mr-2 h-4 w-4"/>
                  Solicitar Correção
                </button_1.Button>
              </card_1.CardContent>
            </card_1.Card>

            {/* Data Portability */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center">
                  <lucide_react_1.FileText className="mr-2 h-5 w-5"/>
                  Portabilidade
                </card_1.CardTitle>
                <card_1.CardDescription>
                  Exporte seus dados em formato estruturado
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <button_1.Button variant="outline" className="w-full" onClick={function () { return handlePrivacyRequest('portability'); }}>
                  <lucide_react_1.Download className="mr-2 h-4 w-4"/>
                  Exportar Dados
                </button_1.Button>
              </card_1.CardContent>
            </card_1.Card>

            {/* Data Deletion */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center text-destructive">
                  <lucide_react_1.Trash2 className="mr-2 h-5 w-5"/>
                  Exclusão de Dados
                </card_1.CardTitle>
                <card_1.CardDescription>
                  Solicite a exclusão dos seus dados pessoais
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <button_1.Button variant="destructive" className="w-full" onClick={function () { return handlePrivacyRequest('deletion'); }}>
                  <lucide_react_1.Trash2 className="mr-2 h-4 w-4"/>
                  Solicitar Exclusão
                </button_1.Button>
              </card_1.CardContent>
            </card_1.Card>
          </div>

          {/* Privacy Rights Information */}
          <alert_1.Alert>
            <lucide_react_1.Info className="h-4 w-4"/>
            <alert_1.AlertTitle>Seus Direitos sob a LGPD</alert_1.AlertTitle>
            <alert_1.AlertDescription className="mt-2">
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Acessar seus dados pessoais</li>
                <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
                <li>Solicitar a exclusão de dados desnecessários</li>
                <li>Solicitar a portabilidade de dados</li>
                <li>Revogar o consentimento a qualquer momento</li>
                <li>Obter informações sobre compartilhamento de dados</li>
              </ul>
            </alert_1.AlertDescription>
          </alert_1.Alert>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>);
    // Event Handlers
    function handleServiceToggle(service, enabled) {
        console.log("Toggling ".concat(service.service, " to ").concat(enabled));
        onConsentUpdate === null || onConsentUpdate === void 0 ? void 0 : onConsentUpdate({});
    }
    function handleViewServiceDetails(service) {
        console.log("Viewing details for ".concat(service.service));
    }
    function handlePrivacyRequest(requestType) {
        onPrivacyRequest === null || onPrivacyRequest === void 0 ? void 0 : onPrivacyRequest(requestType);
    }
}
// Helper Components
function ConsentToggle(_a) {
    var service = _a.service, onToggle = _a.onToggle;
    var _b = (0, react_1.useState)(service.consentStatus === 'granted'), enabled = _b[0], setEnabled = _b[1];
    var handleToggle = function (newEnabled) {
        setEnabled(newEnabled);
        onToggle(newEnabled);
    };
    return (<switch_1.Switch checked={enabled} onCheckedChange={handleToggle} disabled={service.essential}/>);
}
function ServiceConsentCard(_a) {
    var service = _a.service, onToggle = _a.onToggle, onViewDetails = _a.onViewDetails;
    var isGranted = service.consentStatus === 'granted';
    return (<card_1.Card>
      <card_1.CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <card_1.CardTitle className="text-lg">{service.service}</card_1.CardTitle>
            <card_1.CardDescription>{service.impact}</card_1.CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            {service.essential && (<badge_1.Badge variant="secondary">Essencial</badge_1.Badge>)}
            <badge_1.Badge variant={isGranted ? 'default' : 'outline'}>
              {isGranted ? <lucide_react_1.CheckCircle className="mr-1 h-3 w-3"/> : <lucide_react_1.Lock className="mr-1 h-3 w-3"/>}
              {isGranted ? 'Ativo' : 'Inativo'}
            </badge_1.Badge>
          </div>
        </div>
      </card_1.CardHeader>
      <card_1.CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Dados utilizados:</p>
            <div className="flex flex-wrap gap-1">
              {service.requiredData.map(function (dataType) { return (<badge_1.Badge key={dataType} variant="outline" className="text-xs">
                  {dataType}
                </badge_1.Badge>); })}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <ConsentToggle service={service} onToggle={onToggle}/>
            <button_1.Button variant="ghost" size="sm" onClick={onViewDetails}>
              <lucide_react_1.Settings className="mr-1 h-4 w-4"/>
              Detalhes
            </button_1.Button>
          </div>
        </div>
      </card_1.CardContent>
    </card_1.Card>);
}
function ConsentHistoryItem(_a) {
    var activity = _a.activity;
    var getActivityIcon = function (type) {
        switch (type) {
            case 'granted': return <lucide_react_1.CheckCircle className="h-4 w-4 text-green-500"/>;
            case 'withdrawn': return <lucide_react_1.Lock className="h-4 w-4 text-red-500"/>;
            case 'modified': return <lucide_react_1.Edit className="h-4 w-4 text-blue-500"/>;
            default: return <lucide_react_1.Clock className="h-4 w-4 text-gray-500"/>;
        }
    };
    return (<div className="flex items-start space-x-3 pb-4 last:pb-0">
      <div className="mt-0.5">
        {getActivityIcon(activity.type)}
      </div>
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium">{activity.description}</p>
        <p className="text-xs text-muted-foreground">
          {formatDate(activity.timestamp)} • {activity.details}
        </p>
      </div>
    </div>);
}
// Helper Functions
function calculateOverallStatus(services) {
    var grantedCount = services.filter(function (s) { return s.consentStatus === 'granted'; }).length;
    var totalCount = services.length;
    if (grantedCount === totalCount)
        return 'fully_consented';
    if (grantedCount > 0)
        return 'partially_consented';
    return 'missing_consent';
}
function calculateConsentCoverage(services) {
    var grantedCount = services.filter(function (s) { return s.consentStatus === 'granted'; }).length;
    return Math.round((grantedCount / services.length) * 100);
}
function getStatusText(status) {
    switch (status) {
        case 'fully_consented': return 'Totalmente Consentido';
        case 'partially_consented': return 'Parcialmente Consentido';
        case 'missing_consent': return 'Consentimento Necessário';
        default: return 'Status Desconhecido';
    }
}
function formatDate(dateString) {
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(dateString));
}
// Mock API functions (would be replaced with real API calls)
function fetchServiceDependencies(patientId) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, [
                    {
                        service: 'Atendimento Médico',
                        purpose: 'medical_care',
                        requiredData: ['personal', 'medical', 'sensitive'],
                        consentStatus: 'granted',
                        impact: 'Necessário para fornecimento de cuidados médicos e estéticos',
                        essential: true
                    },
                    {
                        service: 'Agendamento Online',
                        purpose: 'appointment_scheduling',
                        requiredData: ['personal'],
                        consentStatus: 'granted',
                        impact: 'Permite agendamento online de consultas e procedimentos',
                        essential: false
                    },
                    {
                        service: 'Comunicação Promocional',
                        purpose: 'marketing',
                        requiredData: ['personal', 'behavioral'],
                        consentStatus: 'missing',
                        impact: 'Recebimento de ofertas personalizadas e promoções',
                        essential: false
                    }
                ]];
        });
    });
}
function fetchConsentHistory(patientId) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, [
                    {
                        type: 'granted',
                        description: 'Consentimento concedido para atendimento médico',
                        timestamp: new Date().toISOString(),
                        details: 'Consentimento inicial para tratamento estético'
                    },
                    {
                        type: 'granted',
                        description: 'Consentimento concedido para agendamento online',
                        timestamp: new Date(Date.now() - 86400000).toISOString(),
                        details: 'Ativação do sistema de agendamento digital'
                    }
                ]];
        });
    });
}

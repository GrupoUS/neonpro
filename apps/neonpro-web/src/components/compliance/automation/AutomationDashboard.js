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
exports.default = AutomationDashboard;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var switch_1 = require("@/components/ui/switch");
var tabs_1 = require("@/components/ui/tabs");
var alert_1 = require("@/components/ui/alert");
var progress_1 = require("@/components/ui/progress");
var lucide_react_1 = require("lucide-react");
var use_toast_1 = require("@/components/ui/use-toast");
function AutomationDashboard() {
    var _this = this;
    var _a;
    var _b = (0, react_1.useState)(null), metrics = _b[0], setMetrics = _b[1];
    var _c = (0, react_1.useState)([]), alerts = _c[0], setAlerts = _c[1];
    var _d = (0, react_1.useState)(null), automationStatus = _d[0], setAutomationStatus = _d[1];
    var _e = (0, react_1.useState)(0), complianceScore = _e[0], setComplianceScore = _e[1];
    var _f = (0, react_1.useState)(true), loading = _f[0], setLoading = _f[1];
    var _g = (0, react_1.useState)(false), refreshing = _g[0], setRefreshing = _g[1];
    var toast = (0, use_toast_1.useToast)().toast;
    var loadDashboardData = function () { return __awaiter(_this, void 0, void 0, function () {
        var monitoringResponse, monitoringData, statusResponse, statusData, alertsResponse, alertsData, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 10, 11, 12]);
                    setRefreshing(true);
                    return [4 /*yield*/, fetch('/api/compliance/automation/monitoring')];
                case 1:
                    monitoringResponse = _a.sent();
                    if (!monitoringResponse.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, monitoringResponse.json()];
                case 2:
                    monitoringData = _a.sent();
                    setMetrics(monitoringData.data.metrics);
                    setComplianceScore(monitoringData.data.complianceScore);
                    _a.label = 3;
                case 3: return [4 /*yield*/, fetch('/api/compliance/automation')];
                case 4:
                    statusResponse = _a.sent();
                    if (!statusResponse.ok) return [3 /*break*/, 6];
                    return [4 /*yield*/, statusResponse.json()];
                case 5:
                    statusData = _a.sent();
                    setAutomationStatus(statusData.data.status);
                    _a.label = 6;
                case 6: return [4 /*yield*/, fetch('/api/compliance/automation/alerts?status=active&limit=10')];
                case 7:
                    alertsResponse = _a.sent();
                    if (!alertsResponse.ok) return [3 /*break*/, 9];
                    return [4 /*yield*/, alertsResponse.json()];
                case 8:
                    alertsData = _a.sent();
                    setAlerts(alertsData.data.alerts);
                    _a.label = 9;
                case 9: return [3 /*break*/, 12];
                case 10:
                    error_1 = _a.sent();
                    console.error('Erro ao carregar dados do dashboard:', error_1);
                    toast({
                        title: 'Erro',
                        description: 'Falha ao carregar dados do dashboard',
                        variant: 'destructive'
                    });
                    return [3 /*break*/, 12];
                case 11:
                    setLoading(false);
                    setRefreshing(false);
                    return [7 /*endfinally*/];
                case 12: return [2 /*return*/];
            }
        });
    }); };
    (0, react_1.useEffect)(function () {
        loadDashboardData();
        // Atualizar dados a cada 30 segundos
        var interval = setInterval(loadDashboardData, 30000);
        return function () { return clearInterval(interval); };
    }, []);
    var getSeverityColor = function (severity) {
        switch (severity) {
            case 'critical': return 'destructive';
            case 'high': return 'destructive';
            case 'medium': return 'default';
            case 'low': return 'secondary';
            default: return 'default';
        }
    };
    var getComplianceScoreColor = function (score) {
        if (score >= 90)
            return 'text-green-600';
        if (score >= 70)
            return 'text-yellow-600';
        return 'text-red-600';
    };
    if (loading) {
        return (<div className="flex items-center justify-center h-64">
        <lucide_react_1.RefreshCw className="h-8 w-8 animate-spin"/>
        <span className="ml-2">Carregando dashboard...</span>
      </div>);
    }
    return (<div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Automação LGPD</h1>
          <p className="text-muted-foreground">
            Monitoramento e controle da conformidade automatizada
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button_1.Button variant="outline" size="sm" onClick={loadDashboardData} disabled={refreshing}>
            <lucide_react_1.RefreshCw className={"h-4 w-4 mr-2 ".concat(refreshing ? 'animate-spin' : '')}/>
            Atualizar
          </button_1.Button>
          <button_1.Button variant="outline" size="sm">
            <lucide_react_1.Settings className="h-4 w-4 mr-2"/>
            Configurações
          </button_1.Button>
        </div>
      </div>
      {/* Métricas Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Score de Conformidade</card_1.CardTitle>
            <lucide_react_1.Shield className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              <span className={getComplianceScoreColor(complianceScore)}>
                {complianceScore.toFixed(1)}%
              </span>
            </div>
            <progress_1.Progress value={complianceScore} className="mt-2"/>
            <p className="text-xs text-muted-foreground mt-2">
              {complianceScore >= 90 ? 'Excelente' :
            complianceScore >= 70 ? 'Bom' : 'Requer atenção'}
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Consentimentos Ativos</card_1.CardTitle>
            <lucide_react_1.Users className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{(metrics === null || metrics === void 0 ? void 0 : metrics.consent.active) || 0}</div>
            <p className="text-xs text-muted-foreground">
              {(metrics === null || metrics === void 0 ? void 0 : metrics.consent.total) || 0} total
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Solicitações Pendentes</card_1.CardTitle>
            <lucide_react_1.FileText className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {((_a = metrics === null || metrics === void 0 ? void 0 : metrics.dataSubjectRequests.byStatus) === null || _a === void 0 ? void 0 : _a.pending) || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {(metrics === null || metrics === void 0 ? void 0 : metrics.dataSubjectRequests.total) || 0} total
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Alertas Ativos</card_1.CardTitle>
            <lucide_react_1.AlertTriangle className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold text-red-600">
              {alerts.filter(function (a) { return a.status === 'active'; }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {alerts.filter(function (a) { return a.severity === 'critical'; }).length} críticos
            </p>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Status da Automação */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center">
            <lucide_react_1.Activity className="h-5 w-5 mr-2"/>
            Status da Automação
          </card_1.CardTitle>
          <card_1.CardDescription>
            Controle e monitoramento dos processos automatizados
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Automação Geral</span>
                <div className="flex items-center space-x-2">
                  <badge_1.Badge variant={(automationStatus === null || automationStatus === void 0 ? void 0 : automationStatus.status) === 'running' ? 'default' :
            (automationStatus === null || automationStatus === void 0 ? void 0 : automationStatus.status) === 'error' ? 'destructive' : 'secondary'}>
                    {(automationStatus === null || automationStatus === void 0 ? void 0 : automationStatus.status) === 'running' ? 'Ativo' :
            (automationStatus === null || automationStatus === void 0 ? void 0 : automationStatus.status) === 'error' ? 'Erro' : 'Inativo'}
                  </badge_1.Badge>
                  <switch_1.Switch checked={(automationStatus === null || automationStatus === void 0 ? void 0 : automationStatus.enabled) || false} disabled/>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>Última execução: {(automationStatus === null || automationStatus === void 0 ? void 0 : automationStatus.lastRun) ?
            new Date(automationStatus.lastRun).toLocaleString('pt-BR') : 'Nunca'}
                </p>
                <p>Próxima execução: {(automationStatus === null || automationStatus === void 0 ? void 0 : automationStatus.nextRun) ?
            new Date(automationStatus.nextRun).toLocaleString('pt-BR') : 'Não agendada'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Recursos Habilitados</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Gestão de Consentimentos</span>
                  <switch_1.Switch checked={(automationStatus === null || automationStatus === void 0 ? void 0 : automationStatus.features.autoConsentManagement) || false} disabled/>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Direitos dos Titulares</span>
                  <switch_1.Switch checked={(automationStatus === null || automationStatus === void 0 ? void 0 : automationStatus.features.autoDataSubjectRights) || false} disabled/>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Relatórios de Auditoria</span>
                  <switch_1.Switch checked={(automationStatus === null || automationStatus === void 0 ? void 0 : automationStatus.features.autoAuditReporting) || false} disabled/>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Anonimização</span>
                  <switch_1.Switch checked={(automationStatus === null || automationStatus === void 0 ? void 0 : automationStatus.features.autoAnonymization) || false} disabled/>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Monitoramento em Tempo Real</span>
                  <switch_1.Switch checked={(automationStatus === null || automationStatus === void 0 ? void 0 : automationStatus.features.realTimeMonitoring) || false} disabled/>
                </div>
              </div>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>
      {/* Tabs com Detalhes */}
      <tabs_1.Tabs defaultValue="alerts" className="space-y-4">
        <tabs_1.TabsList>
          <tabs_1.TabsTrigger value="alerts">Alertas</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="actions">Ações</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="metrics">Métricas Detalhadas</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="alerts" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Alertas de Conformidade</card_1.CardTitle>
              <card_1.CardDescription>
                Alertas ativos que requerem atenção
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              {alerts.length === 0 ? (<div className="text-center py-8">
                  <lucide_react_1.CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4"/>
                  <p className="text-muted-foreground">Nenhum alerta ativo</p>
                </div>) : (<div className="space-y-3">
                  {alerts.map(function (alert) { return (<alert_1.Alert key={alert.id} className="border-l-4 border-l-red-500">
                      <lucide_react_1.AlertTriangle className="h-4 w-4"/>
                      <alert_1.AlertTitle className="flex items-center justify-between">
                        <span>{alert.title}</span>
                        <badge_1.Badge variant={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </badge_1.Badge>
                      </alert_1.AlertTitle>
                      <alert_1.AlertDescription>
                        <p className="mb-2">{alert.description}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Categoria: {alert.category}</span>
                          <span>{new Date(alert.created_at).toLocaleString('pt-BR')}</span>
                        </div>
                      </alert_1.AlertDescription>
                    </alert_1.Alert>); })}
                </div>)}
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="actions" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Ações de Automação</card_1.CardTitle>
              <card_1.CardDescription>
                Execute ações manuais de conformidade
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <button_1.Button variant="outline" className="h-20 flex-col">
                  <lucide_react_1.Play className="h-6 w-6 mb-2"/>
                  <span>Executar Automação Completa</span>
                </button_1.Button>
                
                <button_1.Button variant="outline" className="h-20 flex-col">
                  <lucide_react_1.Users className="h-6 w-6 mb-2"/>
                  <span>Processar Consentimentos</span>
                </button_1.Button>
                
                <button_1.Button variant="outline" className="h-20 flex-col">
                  <lucide_react_1.FileText className="h-6 w-6 mb-2"/>
                  <span>Processar Solicitações</span>
                </button_1.Button>
                
                <button_1.Button variant="outline" className="h-20 flex-col">
                  <lucide_react_1.Database className="h-6 w-6 mb-2"/>
                  <span>Executar Anonimização</span>
                </button_1.Button>
                
                <button_1.Button variant="outline" className="h-20 flex-col">
                  <lucide_react_1.Eye className="h-6 w-6 mb-2"/>
                  <span>Auditoria Manual</span>
                </button_1.Button>
                
                <button_1.Button variant="outline" className="h-20 flex-col">
                  <lucide_react_1.TrendingUp className="h-6 w-6 mb-2"/>
                  <span>Gerar Relatórios</span>
                </button_1.Button>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="metrics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Métricas de Consentimento</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span className="font-medium">{(metrics === null || metrics === void 0 ? void 0 : metrics.consent.total) || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ativos:</span>
                    <span className="font-medium text-green-600">{(metrics === null || metrics === void 0 ? void 0 : metrics.consent.active) || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Revogados:</span>
                    <span className="font-medium text-red-600">{(metrics === null || metrics === void 0 ? void 0 : metrics.consent.revoked) || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expirados:</span>
                    <span className="font-medium text-yellow-600">{(metrics === null || metrics === void 0 ? void 0 : metrics.consent.expired) || 0}</span>
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Métricas de Auditoria</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total de Eventos:</span>
                    <span className="font-medium">{(metrics === null || metrics === void 0 ? void 0 : metrics.audit.total) || 0}</span>
                  </div>
                  {(metrics === null || metrics === void 0 ? void 0 : metrics.audit.bySeverity) && Object.entries(metrics.audit.bySeverity).map(function (_a) {
            var severity = _a[0], count = _a[1];
            return (<div key={severity} className="flex justify-between">
                      <span className="capitalize">{severity}:</span>
                      <span className="font-medium">{count}</span>
                    </div>);
        })}
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>);
}

/**
 * LGPD Compliance Monitoring Dashboard Component
 *
 * Real-time compliance monitoring interface for healthcare administrators
 * with violations, alerts, metrics, and recommendations management.
 */
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
exports.ComplianceMonitoringDashboard = ComplianceMonitoringDashboard;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var alert_1 = require("@/components/ui/alert");
var tabs_1 = require("@/components/ui/tabs");
var progress_1 = require("@/components/ui/progress");
var dialog_1 = require("@/components/ui/dialog");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var input_1 = require("@/components/ui/input");
var select_1 = require("@/components/ui/select");
var use_compliance_monitoring_1 = require("@/app/lib/lgpd/monitoring/use-compliance-monitoring");
var compliance_monitoring_1 = require("@/app/lib/lgpd/monitoring/compliance-monitoring");
var lucide_react_1 = require("lucide-react");
function ComplianceMonitoringDashboard(_a) {
    var _this = this;
    var className = _a.className;
    var _b = (0, use_compliance_monitoring_1.useComplianceMonitoring)(), status = _b.status, isLoading = _b.isLoading, isMonitoring = _b.isMonitoring, error = _b.error, startMonitoring = _b.startMonitoring, stopMonitoring = _b.stopMonitoring, refresh = _b.refresh, reportViolation = _b.reportViolation, resolveViolation = _b.resolveViolation, acknowledgeAlert = _b.acknowledgeAlert, triggerAssessment = _b.triggerAssessment;
    var _c = (0, use_compliance_monitoring_1.useComplianceMetrics)(), metrics = _c.metrics, getComplianceLevelColor = _c.getComplianceLevelColor, getComplianceLevelText = _c.getComplianceLevelText;
    var _d = (0, use_compliance_monitoring_1.useComplianceViolations)(), violations = _d.violations, getViolationsByType = _d.getViolationsByType, getCriticalViolations = _d.getCriticalViolations, getViolationTypeText = _d.getViolationTypeText, getSeverityColor = _d.getSeverityColor;
    var _e = (0, use_compliance_monitoring_1.useComplianceAlerts)(), alerts = _e.alerts, getUnacknowledgedAlerts = _e.getUnacknowledgedAlerts, getCriticalAlerts = _e.getCriticalAlerts, getAlertSeverityColor = _e.getAlertSeverityColor;
    var _f = (0, use_compliance_monitoring_1.useComplianceRecommendations)(), recommendations = _f.recommendations, getCriticalRecommendations = _f.getCriticalRecommendations, getPriorityColor = _f.getPriorityColor;
    // Dialog states
    var _g = (0, react_1.useState)(false), violationDialogOpen = _g[0], setViolationDialogOpen = _g[1];
    var _h = (0, react_1.useState)(false), resolveDialogOpen = _h[0], setResolveDialogOpen = _h[1];
    var _j = (0, react_1.useState)(null), selectedViolation = _j[0], setSelectedViolation = _j[1];
    // Form states
    var _k = (0, react_1.useState)({
        type: '',
        category: '',
        description: '',
        severity: 'medium',
        affectedData: '',
        potentialImpact: ''
    }), violationForm = _k[0], setViolationForm = _k[1];
    var _l = (0, react_1.useState)({
        resolution: '',
        responsible: ''
    }), resolutionForm = _l[0], setResolutionForm = _l[1];
    // Start monitoring on component mount
    (0, react_1.useEffect)(function () {
        if (!isMonitoring && !isLoading) {
            startMonitoring();
        }
    }, [isMonitoring, isLoading, startMonitoring]);
    // Handle violation reporting
    var handleReportViolation = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!violationForm.type || !violationForm.category || !violationForm.description) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, reportViolation({
                            type: violationForm.type,
                            category: violationForm.category,
                            description: violationForm.description,
                            severity: violationForm.severity,
                            affectedData: violationForm.affectedData,
                            potentialImpact: violationForm.potentialImpact
                        })];
                case 1:
                    _a.sent();
                    setViolationForm({
                        type: '',
                        category: '',
                        description: '',
                        severity: 'medium',
                        affectedData: '',
                        potentialImpact: ''
                    });
                    setViolationDialogOpen(false);
                    return [2 /*return*/];
            }
        });
    }); };
    // Handle violation resolution
    var handleResolveViolation = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedViolation || !resolutionForm.resolution || !resolutionForm.responsible) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, resolveViolation(selectedViolation.id, resolutionForm.resolution, resolutionForm.responsible)];
                case 1:
                    _a.sent();
                    setSelectedViolation(null);
                    setResolutionForm({ resolution: '', responsible: '' });
                    setResolveDialogOpen(false);
                    return [2 /*return*/];
            }
        });
    }); };
    if (isLoading) {
        return (<div className="flex items-center justify-center p-8">
        <lucide_react_1.RefreshCw className="h-8 w-8 animate-spin"/>
        <span className="ml-2">Carregando monitoramento de conformidade...</span>
      </div>);
    }
    if (error) {
        return (<alert_1.Alert variant="destructive">
        <lucide_react_1.AlertCircle className="h-4 w-4"/>
        <alert_1.AlertTitle>Erro no Monitoramento</alert_1.AlertTitle>
        <alert_1.AlertDescription>{error}</alert_1.AlertDescription>
      </alert_1.Alert>);
    }
    var criticalViolations = getCriticalViolations();
    var unacknowledgedAlerts = getUnacknowledgedAlerts();
    var criticalAlerts = getCriticalAlerts();
    var criticalRecommendations = getCriticalRecommendations();
    return (<div className={"space-y-6 ".concat(className)}>
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Monitoramento LGPD</h1>
          <p className="text-muted-foreground">
            Dashboard em tempo real para conformidade e monitoramento de dados
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button_1.Button variant="outline" size="sm" onClick={refresh} disabled={isLoading}>
            <lucide_react_1.RefreshCw className={"h-4 w-4 mr-2 ".concat(isLoading ? 'animate-spin' : '')}/>
            Atualizar
          </button_1.Button>
          <button_1.Button variant="outline" size="sm" onClick={triggerAssessment} disabled={isLoading}>
            <lucide_react_1.FileText className="h-4 w-4 mr-2"/>
            Executar Avaliação
          </button_1.Button>
          {isMonitoring ? (<button_1.Button variant="destructive" size="sm" onClick={stopMonitoring}>
              <lucide_react_1.Square className="h-4 w-4 mr-2"/>
              Parar Monitoramento
            </button_1.Button>) : (<button_1.Button variant="default" size="sm" onClick={startMonitoring}>
              <lucide_react_1.Play className="h-4 w-4 mr-2"/>
              Iniciar Monitoramento
            </button_1.Button>)}
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Status de Conformidade</card_1.CardTitle>
            <lucide_react_1.Shield className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {metrics && (<span className={getComplianceLevelColor(metrics.overallComplianceLevel)}>
                  {getComplianceLevelText(metrics.overallComplianceLevel)}
                </span>)}
            </div>
            <p className="text-xs text-muted-foreground">
              Score: {metrics === null || metrics === void 0 ? void 0 : metrics.overallScore.toFixed(1)}%
            </p>
            {metrics && (<progress_1.Progress value={metrics.overallScore} className="mt-2"/>)}
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Violações Ativas</card_1.CardTitle>
            <lucide_react_1.AlertTriangle className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {violations.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {criticalViolations.length} críticas
            </p>
            {criticalViolations.length > 0 && (<badge_1.Badge variant="destructive" className="mt-2">
                Ação Imediata Necessária
              </badge_1.Badge>)}
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Alertas Não Confirmados</card_1.CardTitle>
            <lucide_react_1.Bell className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {unacknowledgedAlerts.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {criticalAlerts.length} críticos
            </p>
            {criticalAlerts.length > 0 && (<badge_1.Badge variant="destructive" className="mt-2">
                Crítico
              </badge_1.Badge>)}
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Recomendações</card_1.CardTitle>
            <lucide_react_1.Lightbulb className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {recommendations.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {criticalRecommendations.length} prioritárias
            </p>
            {criticalRecommendations.length > 0 && (<badge_1.Badge variant="secondary" className="mt-2">
                Melhorias Disponíveis
              </badge_1.Badge>)}
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Critical Issues Alert */}
      {(criticalViolations.length > 0 || criticalAlerts.length > 0) && (<alert_1.Alert variant="destructive">
          <lucide_react_1.AlertCircle className="h-4 w-4"/>
          <alert_1.AlertTitle>Atenção: Problemas Críticos Detectados</alert_1.AlertTitle>
          <alert_1.AlertDescription>
            Existem {criticalViolations.length} violações críticas e {criticalAlerts.length} alertas críticos 
            que requerem atenção imediata. Verifique as abas correspondentes para mais detalhes.
          </alert_1.AlertDescription>
        </alert_1.Alert>)}

      {/* Main Content Tabs */}
      <tabs_1.Tabs defaultValue="overview" className="space-y-4">
        <tabs_1.TabsList className="grid w-full grid-cols-5">
          <tabs_1.TabsTrigger value="overview">Visão Geral</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="violations">
            Violações
            {criticalViolations.length > 0 && (<badge_1.Badge variant="destructive" className="ml-2">
                {criticalViolations.length}
              </badge_1.Badge>)}
          </tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="alerts">
            Alertas
            {unacknowledgedAlerts.length > 0 && (<badge_1.Badge variant="secondary" className="ml-2">
                {unacknowledgedAlerts.length}
              </badge_1.Badge>)}
          </tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="metrics">Métricas</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="recommendations">Recomendações</tabs_1.TabsTrigger>
        </tabs_1.TabsList>        {/* Overview Tab */}
        <tabs_1.TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Compliance Score Chart */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Detalhamento da Conformidade</card_1.CardTitle>
                <card_1.CardDescription>
                  Pontuação detalhada por categoria
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                {metrics && (<div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Consentimento</span>
                        <span>{metrics.consentScore.toFixed(1)}%</span>
                      </div>
                      <progress_1.Progress value={metrics.consentScore} className="mt-1"/>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Acesso e Portabilidade</span>
                        <span>{metrics.accessScore.toFixed(1)}%</span>
                      </div>
                      <progress_1.Progress value={metrics.accessScore} className="mt-1"/>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Retenção</span>
                        <span>{metrics.retentionScore.toFixed(1)}%</span>
                      </div>
                      <progress_1.Progress value={metrics.retentionScore} className="mt-1"/>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Auditoria</span>
                        <span>{metrics.auditScore.toFixed(1)}%</span>
                      </div>
                      <progress_1.Progress value={metrics.auditScore} className="mt-1"/>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Segurança</span>
                        <span>{metrics.securityScore.toFixed(1)}%</span>
                      </div>
                      <progress_1.Progress value={metrics.securityScore} className="mt-1"/>
                    </div>
                  </div>)}
              </card_1.CardContent>
            </card_1.Card>

            {/* Recent Activity */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Atividade Recente</card_1.CardTitle>
                <card_1.CardDescription>
                  Últimas violações e alertas
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-3">
                  {violations.slice(0, 3).map(function (violation) { return (<div key={violation.id} className="flex items-start space-x-3">
                      <lucide_react_1.AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5"/>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {getViolationTypeText(violation.type)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(violation.detectedAt).toLocaleString()}
                        </p>
                      </div>
                      <badge_1.Badge variant="outline" className={getSeverityColor(violation.severity)}>
                        {violation.severity}
                      </badge_1.Badge>
                    </div>); })}
                  {alerts.slice(0, 2).map(function (alert) { return (<div key={alert.id} className="flex items-start space-x-3">
                      <lucide_react_1.Bell className="h-4 w-4 text-blue-500 mt-0.5"/>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {alert.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <badge_1.Badge variant="outline" className={getAlertSeverityColor(alert.severity)}>
                        {alert.severity}
                      </badge_1.Badge>
                    </div>); })}
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>

        {/* Violations Tab */}
        <tabs_1.TabsContent value="violations" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Violações de Conformidade</h3>
            <dialog_1.Dialog open={violationDialogOpen} onOpenChange={setViolationDialogOpen}>
              <dialog_1.DialogTrigger asChild>
                <button_1.Button>
                  <lucide_react_1.AlertTriangle className="h-4 w-4 mr-2"/>
                  Reportar Violação
                </button_1.Button>
              </dialog_1.DialogTrigger>
              <dialog_1.DialogContent className="sm:max-w-[425px]">
                <dialog_1.DialogHeader>
                  <dialog_1.DialogTitle>Reportar Nova Violação</dialog_1.DialogTitle>
                  <dialog_1.DialogDescription>
                    Registre uma nova violação de conformidade LGPD
                  </dialog_1.DialogDescription>
                </dialog_1.DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label_1.Label htmlFor="violation-type">Tipo de Violação</label_1.Label>
                    <select_1.Select value={violationForm.type} onValueChange={function (value) { return setViolationForm(function (prev) { return (__assign(__assign({}, prev), { type: value })); }); }}>
                      <select_1.SelectTrigger>
                        <select_1.SelectValue placeholder="Selecione o tipo"/>
                      </select_1.SelectTrigger>
                      <select_1.SelectContent>
                        <select_1.SelectItem value={compliance_monitoring_1.ViolationType.CONSENT_VIOLATION}>Violação de Consentimento</select_1.SelectItem>
                        <select_1.SelectItem value={compliance_monitoring_1.ViolationType.DATA_ACCESS_VIOLATION}>Violação de Acesso a Dados</select_1.SelectItem>
                        <select_1.SelectItem value={compliance_monitoring_1.ViolationType.RETENTION_VIOLATION}>Violação de Retenção</select_1.SelectItem>
                        <select_1.SelectItem value={compliance_monitoring_1.ViolationType.AUDIT_VIOLATION}>Violação de Auditoria</select_1.SelectItem>
                        <select_1.SelectItem value={compliance_monitoring_1.ViolationType.DISCLOSURE_VIOLATION}>Violação de Divulgação</select_1.SelectItem>
                        <select_1.SelectItem value={compliance_monitoring_1.ViolationType.SECURITY_VIOLATION}>Violação de Segurança</select_1.SelectItem>
                        <select_1.SelectItem value={compliance_monitoring_1.ViolationType.RESPONSE_TIME_VIOLATION}>Violação de Prazo</select_1.SelectItem>
                      </select_1.SelectContent>
                    </select_1.Select>
                  </div>
                  <div className="grid gap-2">
                    <label_1.Label htmlFor="violation-category">Categoria</label_1.Label>
                    <select_1.Select value={violationForm.category} onValueChange={function (value) { return setViolationForm(function (prev) { return (__assign(__assign({}, prev), { category: value })); }); }}>
                      <select_1.SelectTrigger>
                        <select_1.SelectValue placeholder="Selecione a categoria"/>
                      </select_1.SelectTrigger>
                      <select_1.SelectContent>
                        <select_1.SelectItem value={compliance_monitoring_1.ComplianceCategory.CONSENT}>Consentimento</select_1.SelectItem>
                        <select_1.SelectItem value={compliance_monitoring_1.ComplianceCategory.DATA_ACCESS}>Acesso a Dados</select_1.SelectItem>
                        <select_1.SelectItem value={compliance_monitoring_1.ComplianceCategory.DATA_RETENTION}>Retenção de Dados</select_1.SelectItem>
                        <select_1.SelectItem value={compliance_monitoring_1.ComplianceCategory.AUDIT_TRAIL}>Trilha de Auditoria</select_1.SelectItem>
                        <select_1.SelectItem value={compliance_monitoring_1.ComplianceCategory.SECURITY}>Segurança</select_1.SelectItem>
                        <select_1.SelectItem value={compliance_monitoring_1.ComplianceCategory.DISCLOSURE}>Divulgação</select_1.SelectItem>
                        <select_1.SelectItem value={compliance_monitoring_1.ComplianceCategory.RESPONSE_TIME}>Tempo de Resposta</select_1.SelectItem>
                      </select_1.SelectContent>
                    </select_1.Select>
                  </div>
                  <div className="grid gap-2">
                    <label_1.Label htmlFor="violation-severity">Severidade</label_1.Label>
                    <select_1.Select value={violationForm.severity} onValueChange={function (value) { return setViolationForm(function (prev) { return (__assign(__assign({}, prev), { severity: value })); }); }}>
                      <select_1.SelectTrigger>
                        <select_1.SelectValue />
                      </select_1.SelectTrigger>
                      <select_1.SelectContent>
                        <select_1.SelectItem value="low">Baixa</select_1.SelectItem>
                        <select_1.SelectItem value="medium">Média</select_1.SelectItem>
                        <select_1.SelectItem value="high">Alta</select_1.SelectItem>
                        <select_1.SelectItem value="critical">Crítica</select_1.SelectItem>
                      </select_1.SelectContent>
                    </select_1.Select>
                  </div>
                  <div className="grid gap-2">
                    <label_1.Label htmlFor="violation-description">Descrição</label_1.Label>
                    <textarea_1.Textarea id="violation-description" placeholder="Descreva a violação..." value={violationForm.description} onChange={function (e) { return setViolationForm(function (prev) { return (__assign(__assign({}, prev), { description: e.target.value })); }); }}/>
                  </div>
                  <div className="grid gap-2">
                    <label_1.Label htmlFor="affected-data">Dados Afetados</label_1.Label>
                    <input_1.Input id="affected-data" placeholder="Quais dados foram afetados..." value={violationForm.affectedData} onChange={function (e) { return setViolationForm(function (prev) { return (__assign(__assign({}, prev), { affectedData: e.target.value })); }); }}/>
                  </div>
                  <div className="grid gap-2">
                    <label_1.Label htmlFor="potential-impact">Impacto Potencial</label_1.Label>
                    <textarea_1.Textarea id="potential-impact" placeholder="Descreva o impacto potencial..." value={violationForm.potentialImpact} onChange={function (e) { return setViolationForm(function (prev) { return (__assign(__assign({}, prev), { potentialImpact: e.target.value })); }); }}/>
                  </div>
                </div>
                <dialog_1.DialogFooter>
                  <button_1.Button type="submit" onClick={handleReportViolation} disabled={!violationForm.type || !violationForm.category || !violationForm.description}>
                    Reportar Violação
                  </button_1.Button>
                </dialog_1.DialogFooter>
              </dialog_1.DialogContent>
            </dialog_1.Dialog>
          </div>

          <div className="grid gap-4">
            {violations.map(function (violation) { return (<card_1.Card key={violation.id} className="relative">
                <card_1.CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <card_1.CardTitle className="text-base">
                        {getViolationTypeText(violation.type)}
                      </card_1.CardTitle>
                      <card_1.CardDescription>
                        Detectada em {new Date(violation.detectedAt).toLocaleString()}
                      </card_1.CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <badge_1.Badge className={getSeverityColor(violation.severity)}>
                        {violation.severity}
                      </badge_1.Badge>
                      <badge_1.Badge variant="outline">
                        {violation.status}
                      </badge_1.Badge>
                    </div>
                  </div>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {violation.description}
                  </p>
                  {violation.affectedData && (<div className="mb-2">
                      <span className="text-sm font-medium">Dados Afetados: </span>
                      <span className="text-sm">{violation.affectedData}</span>
                    </div>)}
                  {violation.potentialImpact && (<div className="mb-3">
                      <span className="text-sm font-medium">Impacto Potencial: </span>
                      <span className="text-sm">{violation.potentialImpact}</span>
                    </div>)}
                  {violation.status === 'pending' && (<div className="flex justify-end">
                      <button_1.Button size="sm" onClick={function () {
                    setSelectedViolation(violation);
                    setResolveDialogOpen(true);
                }}>
                        <lucide_react_1.CheckCircle2 className="h-4 w-4 mr-2"/>
                        Resolver
                      </button_1.Button>
                    </div>)}
                  {violation.status === 'resolved' && violation.resolution && (<div className="bg-green-50 p-3 rounded-md mt-3">
                      <div className="flex items-start space-x-2">
                        <lucide_react_1.CheckCircle className="h-4 w-4 text-green-600 mt-0.5"/>
                        <div>
                          <p className="text-sm font-medium text-green-800">Resolução:</p>
                          <p className="text-sm text-green-700">{violation.resolution}</p>
                          {violation.resolvedBy && (<p className="text-xs text-green-600 mt-1">
                              Resolvido por: {violation.resolvedBy} em {violation.resolvedAt && new Date(violation.resolvedAt).toLocaleString()}
                            </p>)}
                        </div>
                      </div>
                    </div>)}
                </card_1.CardContent>
              </card_1.Card>); })}
          </div>
        </tabs_1.TabsContent>

        {/* Alerts Tab */}
        <tabs_1.TabsContent value="alerts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Alertas do Sistema</h3>
          </div>

          <div className="grid gap-4">
            {alerts.map(function (alert) { return (<card_1.Card key={alert.id} className="relative">
                <card_1.CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {alert.severity === 'critical' && <lucide_react_1.AlertCircle className="h-5 w-5 text-red-500 mt-0.5"/>}
                      {alert.severity === 'error' && <lucide_react_1.XCircle className="h-5 w-5 text-orange-500 mt-0.5"/>}
                      {alert.severity === 'warning' && <lucide_react_1.AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5"/>}
                      {alert.severity === 'info' && <lucide_react_1.Info className="h-5 w-5 text-blue-500 mt-0.5"/>}
                      <div>
                        <card_1.CardTitle className="text-base">{alert.title}</card_1.CardTitle>
                        <card_1.CardDescription>
                          {new Date(alert.timestamp).toLocaleString()}
                        </card_1.CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <badge_1.Badge className={getAlertSeverityColor(alert.severity)}>
                        {alert.severity}
                      </badge_1.Badge>
                      {alert.acknowledged && (<badge_1.Badge variant="outline">
                          Confirmado
                        </badge_1.Badge>)}
                    </div>
                  </div>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {alert.message}
                  </p>
                  {alert.metadata && Object.keys(alert.metadata).length > 0 && (<div className="bg-gray-50 p-3 rounded-md mb-3">
                      <p className="text-sm font-medium mb-2">Detalhes:</p>
                      <div className="space-y-1">
                        {Object.entries(alert.metadata).map(function (_a) {
                    var key = _a[0], value = _a[1];
                    return (<div key={key} className="flex justify-between text-sm">
                            <span className="text-gray-600">{key}:</span>
                            <span className="font-mono">{String(value)}</span>
                          </div>);
                })}
                      </div>
                    </div>)}
                  {!alert.acknowledged && (<div className="flex justify-end">
                      <button_1.Button size="sm" variant="outline" onClick={function () { return acknowledgeAlert(alert.id, 'Admin'); }}>
                        <lucide_react_1.CheckCircle2 className="h-4 w-4 mr-2"/>
                        Confirmar
                      </button_1.Button>
                    </div>)}
                  {alert.acknowledged && (<div className="bg-blue-50 p-3 rounded-md">
                      <div className="flex items-start space-x-2">
                        <lucide_react_1.CheckCircle className="h-4 w-4 text-blue-600 mt-0.5"/>
                        <div>
                          <p className="text-sm font-medium text-blue-800">
                            Alerta confirmado por: {alert.acknowledgedBy}
                          </p>
                          {alert.acknowledgedAt && (<p className="text-xs text-blue-600">
                              {new Date(alert.acknowledgedAt).toLocaleString()}
                            </p>)}
                        </div>
                      </div>
                    </div>)}
                </card_1.CardContent>
              </card_1.Card>); })}
          </div>
        </tabs_1.TabsContent>        {/* Metrics Tab */}
        <tabs_1.TabsContent value="metrics" className="space-y-4">
          <h3 className="text-lg font-semibold">Métricas Detalhadas</h3>
          
          {metrics && (<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle className="text-sm">Conformidade Geral</card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="text-3xl font-bold mb-2">
                    {metrics.overallScore.toFixed(1)}%
                  </div>
                  <progress_1.Progress value={metrics.overallScore} className="mb-2"/>
                  <p className="text-sm text-muted-foreground">
                    Nível: {getComplianceLevelText(metrics.overallComplianceLevel)}
                  </p>
                </card_1.CardContent>
              </card_1.Card>

              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle className="text-sm">Consentimento</card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="text-3xl font-bold mb-2">
                    {metrics.consentScore.toFixed(1)}%
                  </div>
                  <progress_1.Progress value={metrics.consentScore} className="mb-2"/>
                  <div className="text-xs space-y-1">
                    <div>Válidos: {metrics.consentMetrics.validConsents}</div>
                    <div>Expirados: {metrics.consentMetrics.expiredConsents}</div>
                    <div>Revogados: {metrics.consentMetrics.revokedConsents}</div>
                  </div>
                </card_1.CardContent>
              </card_1.Card>

              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle className="text-sm">Acesso a Dados</card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="text-3xl font-bold mb-2">
                    {metrics.accessScore.toFixed(1)}%
                  </div>
                  <progress_1.Progress value={metrics.accessScore} className="mb-2"/>
                  <div className="text-xs space-y-1">
                    <div>Solicitações: {metrics.accessMetrics.totalRequests}</div>
                    <div>Processadas: {metrics.accessMetrics.processedRequests}</div>
                    <div>No Prazo: {metrics.accessMetrics.timelyResponses}</div>
                  </div>
                </card_1.CardContent>
              </card_1.Card>

              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle className="text-sm">Retenção</card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="text-3xl font-bold mb-2">
                    {metrics.retentionScore.toFixed(1)}%
                  </div>
                  <progress_1.Progress value={metrics.retentionScore} className="mb-2"/>
                  <div className="text-xs space-y-1">
                    <div>Com Política: {metrics.retentionMetrics.recordsWithPolicy}</div>
                    <div>A Expirar: {metrics.retentionMetrics.recordsNearExpiry}</div>
                    <div>Expirados: {metrics.retentionMetrics.expiredRecords}</div>
                  </div>
                </card_1.CardContent>
              </card_1.Card>

              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle className="text-sm">Auditoria</card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="text-3xl font-bold mb-2">
                    {metrics.auditScore.toFixed(1)}%
                  </div>
                  <progress_1.Progress value={metrics.auditScore} className="mb-2"/>
                  <div className="text-xs space-y-1">
                    <div>Eventos Hoje: {metrics.auditMetrics.eventsToday}</div>
                    <div>Falhas: {metrics.auditMetrics.failedEvents}</div>
                    <div>Cobertura: {(metrics.auditMetrics.coveragePercentage * 100).toFixed(1)}%</div>
                  </div>
                </card_1.CardContent>
              </card_1.Card>

              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle className="text-sm">Segurança</card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="text-3xl font-bold mb-2">
                    {metrics.securityScore.toFixed(1)}%
                  </div>
                  <progress_1.Progress value={metrics.securityScore} className="mb-2"/>
                  <div className="text-xs space-y-1">
                    <div>Incidentes: {metrics.securityMetrics.securityIncidents}</div>
                    <div>Acessos Não Autorizados: {metrics.securityMetrics.unauthorizedAccess}</div>
                    <div>Criptografia: {(metrics.securityMetrics.encryptionCoverage * 100).toFixed(1)}%</div>
                  </div>
                </card_1.CardContent>
              </card_1.Card>
            </div>)}
        </tabs_1.TabsContent>

        {/* Recommendations Tab */}
        <tabs_1.TabsContent value="recommendations" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Recomendações de Melhoria</h3>
          </div>

          <div className="grid gap-4">
            {recommendations.map(function (recommendation) { return (<card_1.Card key={recommendation.id} className="relative">
                <card_1.CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <lucide_react_1.Lightbulb className="h-5 w-5 text-yellow-500 mt-0.5"/>
                      <div>
                        <card_1.CardTitle className="text-base">{recommendation.title}</card_1.CardTitle>
                        <card_1.CardDescription>
                          Categoria: {recommendation.category}
                        </card_1.CardDescription>
                      </div>
                    </div>
                    <badge_1.Badge className={getPriorityColor(recommendation.priority)}>
                      {recommendation.priority}
                    </badge_1.Badge>
                  </div>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {recommendation.description}
                  </p>
                  {recommendation.actionItems.length > 0 && (<div className="bg-blue-50 p-3 rounded-md">
                      <p className="text-sm font-medium text-blue-800 mb-2">Ações Recomendadas:</p>
                      <ul className="text-sm text-blue-700 space-y-1">
                        {recommendation.actionItems.map(function (action, index) { return (<li key={index} className="flex items-start space-x-2">
                            <span className="text-blue-500">•</span>
                            <span>{action}</span>
                          </li>); })}
                      </ul>
                    </div>)}
                  {recommendation.estimatedImpact && (<div className="mt-3 pt-3 border-t">
                      <p className="text-sm">
                        <span className="font-medium">Impacto Estimado: </span>
                        {recommendation.estimatedImpact}
                      </p>
                    </div>)}
                </card_1.CardContent>
              </card_1.Card>); })}
          </div>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>

      {/* Resolution Dialog */}
      <dialog_1.Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <dialog_1.DialogContent className="sm:max-w-[425px]">
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>Resolver Violação</dialog_1.DialogTitle>
            <dialog_1.DialogDescription>
              Registre a resolução da violação de conformidade
            </dialog_1.DialogDescription>
          </dialog_1.DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label_1.Label htmlFor="resolution-description">Descrição da Resolução</label_1.Label>
              <textarea_1.Textarea id="resolution-description" placeholder="Descreva como a violação foi resolvida..." value={resolutionForm.resolution} onChange={function (e) { return setResolutionForm(function (prev) { return (__assign(__assign({}, prev), { resolution: e.target.value })); }); }}/>
            </div>
            <div className="grid gap-2">
              <label_1.Label htmlFor="responsible-person">Responsável</label_1.Label>
              <input_1.Input id="responsible-person" placeholder="Nome do responsável pela resolução" value={resolutionForm.responsible} onChange={function (e) { return setResolutionForm(function (prev) { return (__assign(__assign({}, prev), { responsible: e.target.value })); }); }}/>
            </div>
          </div>
          <dialog_1.DialogFooter>
            <button_1.Button variant="outline" onClick={function () { return setResolveDialogOpen(false); }}>
              Cancelar
            </button_1.Button>
            <button_1.Button onClick={handleResolveViolation} disabled={!resolutionForm.resolution || !resolutionForm.responsible}>
              Resolver Violação
            </button_1.Button>
          </dialog_1.DialogFooter>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>
    </div>);
}
exports.default = ComplianceMonitoringDashboard;

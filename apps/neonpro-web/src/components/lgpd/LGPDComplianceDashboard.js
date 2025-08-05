/**
 * LGPD Compliance Dashboard Component
 * Story 1.5: LGPD Compliance Automation
 *
 * This component provides a comprehensive dashboard for LGPD compliance monitoring
 * and management with real-time analytics, consent management, and audit trail.
 */
'use client';
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
exports.default = LGPDComplianceDashboard;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var tabs_1 = require("@/components/ui/tabs");
var alert_1 = require("@/components/ui/alert");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var table_1 = require("@/components/ui/table");
var badge_1 = require("@/components/ui/badge");
var progress_1 = require("@/components/ui/progress");
var dialog_1 = require("@/components/ui/dialog");
var textarea_1 = require("@/components/ui/textarea");
var recharts_1 = require("recharts");
var lucide_react_1 = require("lucide-react");
// Import LGPD managers
var consent_automation_manager_1 = require("@/lib/lgpd/consent-automation-manager");
var audit_trail_manager_1 = require("@/lib/lgpd/audit-trail-manager");
var data_retention_manager_1 = require("@/lib/lgpd/data-retention-manager");
var COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
function LGPDComplianceDashboard(_a) {
    var _this = this;
    var clinicId = _a.clinicId, userRole = _a.userRole;
    // State management
    var _b = (0, react_1.useState)('overview'), activeTab = _b[0], setActiveTab = _b[1];
    var _c = (0, react_1.useState)(true), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)(false), refreshing = _d[0], setRefreshing = _d[1];
    var _e = (0, react_1.useState)(null), error = _e[0], setError = _e[1];
    // Data states
    var _f = (0, react_1.useState)(null), complianceOverview = _f[0], setComplianceOverview = _f[1];
    var _g = (0, react_1.useState)(null), consentAnalytics = _g[0], setConsentAnalytics = _g[1];
    var _h = (0, react_1.useState)(null), auditAnalytics = _h[0], setAuditAnalytics = _h[1];
    var _j = (0, react_1.useState)(null), retentionAnalytics = _j[0], setRetentionAnalytics = _j[1];
    var _k = (0, react_1.useState)([]), auditTrail = _k[0], setAuditTrail = _k[1];
    var _l = (0, react_1.useState)([]), dataSubjectRequests = _l[0], setDataSubjectRequests = _l[1];
    // Filter states
    var _m = (0, react_1.useState)({ start: '', end: '' }), dateRange = _m[0], setDateRange = _m[1];
    var _o = (0, react_1.useState)({
        eventType: '',
        severity: '',
        dataType: ''
    }), auditFilters = _o[0], setAuditFilters = _o[1];
    // Dialog states
    var _p = (0, react_1.useState)(false), showConsentDialog = _p[0], setShowConsentDialog = _p[1];
    var _q = (0, react_1.useState)(false), showRequestDialog = _q[0], setShowRequestDialog = _q[1];
    var _r = (0, react_1.useState)(null), selectedRequest = _r[0], setSelectedRequest = _r[1];
    /**
     * Load dashboard data
     */
    var loadDashboardData = function () { return __awaiter(_this, void 0, void 0, function () {
        var startDate, endDate, _a, consentData, auditData, retentionData, overview, auditRecords, err_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, 4, 5]);
                    setLoading(true);
                    setError(null);
                    startDate = dateRange.start ? new Date(dateRange.start) : undefined;
                    endDate = dateRange.end ? new Date(dateRange.end) : undefined;
                    return [4 /*yield*/, Promise.all([
                            consent_automation_manager_1.consentAutomationManager.getConsentAnalytics(clinicId, startDate, endDate),
                            audit_trail_manager_1.auditTrailManager.getAuditAnalytics(clinicId, startDate, endDate),
                            data_retention_manager_1.dataRetentionManager.getRetentionAnalytics(clinicId, startDate, endDate)
                        ])];
                case 1:
                    _a = _b.sent(), consentData = _a[0], auditData = _a[1], retentionData = _a[2];
                    setConsentAnalytics(consentData);
                    setAuditAnalytics(auditData);
                    setRetentionAnalytics(retentionData);
                    overview = {
                        complianceScore: Math.round((auditData.complianceRate + retentionData.retentionCompliance) / 2),
                        totalConsents: consentData.totalConsents,
                        activeConsents: consentData.activeConsents,
                        pendingRequests: auditData.dataSubjectRequests.pending,
                        recentViolations: auditData.recentViolations.length,
                        dataRetentionCompliance: Math.round(retentionData.retentionCompliance),
                        riskScore: auditData.riskScore
                    };
                    setComplianceOverview(overview);
                    return [4 /*yield*/, audit_trail_manager_1.auditTrailManager.getAuditTrail(clinicId, {
                            eventType: auditFilters.eventType || undefined,
                            severity: auditFilters.severity || undefined,
                            dataType: auditFilters.dataType || undefined,
                            startDate: startDate,
                            endDate: endDate
                        }, 50)];
                case 2:
                    auditRecords = _b.sent();
                    setAuditTrail(auditRecords);
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _b.sent();
                    console.error('Error loading dashboard data:', err_1);
                    setError('Erro ao carregar dados do dashboard');
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    setRefreshing(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    /**
     * Refresh dashboard data
     */
    var refreshData = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setRefreshing(true);
                    return [4 /*yield*/, loadDashboardData()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    /**
     * Handle date range change
     */
    var handleDateRangeChange = function (field, value) {
        setDateRange(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[field] = value, _a)));
        });
    };
    /**
     * Apply filters
     */
    var applyFilters = function () {
        loadDashboardData();
    };
    /**
     * Get compliance score color
     */
    var getComplianceColor = function (score) {
        if (score >= 90)
            return 'text-green-600';
        if (score >= 70)
            return 'text-yellow-600';
        return 'text-red-600';
    };
    /**
     * Get risk level badge
     */
    var getRiskBadge = function (score) {
        if (score <= 20)
            return <badge_1.Badge variant="default">Baixo</badge_1.Badge>;
        if (score <= 50)
            return <badge_1.Badge variant="secondary">Médio</badge_1.Badge>;
        if (score <= 80)
            return <badge_1.Badge variant="destructive">Alto</badge_1.Badge>;
        return <badge_1.Badge variant="destructive">Crítico</badge_1.Badge>;
    };
    /**
     * Format date for display
     */
    var formatDate = function (date) {
        return new Date(date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    /**
     * Get event type icon
     */
    var getEventTypeIcon = function (eventType) {
        var _a;
        var iconMap = (_a = {},
            _a[audit_trail_manager_1.LGPDAuditEventType.DATA_ACCESS] = <lucide_react_1.Eye className="h-4 w-4"/>,
            _a[audit_trail_manager_1.LGPDAuditEventType.DATA_MODIFICATION] = <lucide_react_1.Settings className="h-4 w-4"/>,
            _a[audit_trail_manager_1.LGPDAuditEventType.DATA_DELETION] = <lucide_react_1.Trash2 className="h-4 w-4"/>,
            _a[audit_trail_manager_1.LGPDAuditEventType.CONSENT_COLLECTED] = <lucide_react_1.UserCheck className="h-4 w-4"/>,
            _a[audit_trail_manager_1.LGPDAuditEventType.CONSENT_WITHDRAWN] = <lucide_react_1.AlertCircle className="h-4 w-4"/>,
            _a[audit_trail_manager_1.LGPDAuditEventType.DATA_BREACH] = <lucide_react_1.AlertTriangle className="h-4 w-4"/>,
            _a[audit_trail_manager_1.LGPDAuditEventType.DATA_SUBJECT_REQUEST] = <lucide_react_1.FileText className="h-4 w-4"/>,
            _a);
        return iconMap[eventType] || <lucide_react_1.FileText className="h-4 w-4"/>;
    };
    /**
     * Get severity badge
     */
    var getSeverityBadge = function (severity) {
        var _a;
        var variants = (_a = {},
            _a[audit_trail_manager_1.LGPDAuditSeverity.INFO] = 'default',
            _a[audit_trail_manager_1.LGPDAuditSeverity.WARNING] = 'secondary',
            _a[audit_trail_manager_1.LGPDAuditSeverity.ERROR] = 'destructive',
            _a[audit_trail_manager_1.LGPDAuditSeverity.CRITICAL] = 'destructive',
            _a);
        return <badge_1.Badge variant={variants[severity]}>{severity.toUpperCase()}</badge_1.Badge>;
    };
    // Load data on component mount and when filters change
    (0, react_1.useEffect)(function () {
        loadDashboardData();
    }, [clinicId]);
    if (loading) {
        return (<div className="flex items-center justify-center h-64">
        <lucide_react_1.RefreshCw className="h-8 w-8 animate-spin"/>
        <span className="ml-2">Carregando dados de conformidade...</span>
      </div>);
    }
    if (error) {
        return (<alert_1.Alert variant="destructive">
        <lucide_react_1.AlertTriangle className="h-4 w-4"/>
        <alert_1.AlertTitle>Erro</alert_1.AlertTitle>
        <alert_1.AlertDescription>{error}</alert_1.AlertDescription>
      </alert_1.Alert>);
    }
    return (<div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard LGPD</h1>
          <p className="text-muted-foreground">
            Monitoramento e gestão de conformidade com a LGPD
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button_1.Button variant="outline" size="sm" onClick={refreshData} disabled={refreshing}>
            <lucide_react_1.RefreshCw className={"h-4 w-4 mr-2 ".concat(refreshing ? 'animate-spin' : '')}/>
            Atualizar
          </button_1.Button>
          <button_1.Button variant="outline" size="sm">
            <lucide_react_1.Download className="h-4 w-4 mr-2"/>
            Exportar Relatório
          </button_1.Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center">
            <lucide_react_1.Filter className="h-5 w-5 mr-2"/>
            Filtros
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label_1.Label htmlFor="start-date">Data Início</label_1.Label>
              <input_1.Input id="start-date" type="date" value={dateRange.start} onChange={function (e) { return handleDateRangeChange('start', e.target.value); }}/>
            </div>
            <div>
              <label_1.Label htmlFor="end-date">Data Fim</label_1.Label>
              <input_1.Input id="end-date" type="date" value={dateRange.end} onChange={function (e) { return handleDateRangeChange('end', e.target.value); }}/>
            </div>
            <div>
              <label_1.Label>Tipo de Evento</label_1.Label>
              <select_1.Select value={auditFilters.eventType} onValueChange={function (value) { return setAuditFilters(function (prev) { return (__assign(__assign({}, prev), { eventType: value })); }); }}>
                <select_1.SelectTrigger>
                  <select_1.SelectValue placeholder="Todos"/>
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="">Todos</select_1.SelectItem>
                  {Object.values(audit_trail_manager_1.LGPDAuditEventType).map(function (type) { return (<select_1.SelectItem key={type} value={type}>{type}</select_1.SelectItem>); })}
                </select_1.SelectContent>
              </select_1.Select>
            </div>
            <div className="flex items-end">
              <button_1.Button onClick={applyFilters} className="w-full">
                Aplicar Filtros
              </button_1.Button>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Compliance Overview */}
      {complianceOverview && (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">Score de Conformidade</card_1.CardTitle>
              <lucide_react_1.Shield className="h-4 w-4 text-muted-foreground"/>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className={"text-2xl font-bold ".concat(getComplianceColor(complianceOverview.complianceScore))}>
                {complianceOverview.complianceScore}%
              </div>
              <progress_1.Progress value={complianceOverview.complianceScore} className="mt-2"/>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">Consentimentos Ativos</card_1.CardTitle>
              <lucide_react_1.UserCheck className="h-4 w-4 text-muted-foreground"/>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold">{complianceOverview.activeConsents}</div>
              <p className="text-xs text-muted-foreground">
                de {complianceOverview.totalConsents} total
              </p>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">Solicitações Pendentes</card_1.CardTitle>
              <lucide_react_1.Clock className="h-4 w-4 text-muted-foreground"/>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold">{complianceOverview.pendingRequests}</div>
              <p className="text-xs text-muted-foreground">
                Requer atenção
              </p>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">Nível de Risco</card_1.CardTitle>
              <lucide_react_1.TrendingUp className="h-4 w-4 text-muted-foreground"/>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="flex items-center space-x-2">
                <div className="text-2xl font-bold">{complianceOverview.riskScore}</div>
                {getRiskBadge(complianceOverview.riskScore)}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </div>)}

      {/* Main Content Tabs */}
      <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <tabs_1.TabsList>
          <tabs_1.TabsTrigger value="overview">Visão Geral</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="consents">Consentimentos</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="audit">Trilha de Auditoria</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="retention">Retenção de Dados</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="requests">Solicitações</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        {/* Overview Tab */}
        <tabs_1.TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Consent Analytics Chart */}
            {consentAnalytics && (<card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle>Consentimentos por Tipo de Dados</card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <recharts_1.ResponsiveContainer width="100%" height={300}>
                    <recharts_1.BarChart data={Object.entries(consentAnalytics.consentsByDataType).map(function (_a) {
                var type = _a[0], count = _a[1];
                return ({
                    type: type.replace('_', ' '),
                    count: count
                });
            })}>
                      <recharts_1.CartesianGrid strokeDasharray="3 3"/>
                      <recharts_1.XAxis dataKey="type" angle={-45} textAnchor="end" height={80}/>
                      <recharts_1.YAxis />
                      <recharts_1.Tooltip />
                      <recharts_1.Bar dataKey="count" fill="#8884d8"/>
                    </recharts_1.BarChart>
                  </recharts_1.ResponsiveContainer>
                </card_1.CardContent>
              </card_1.Card>)}

            {/* Audit Events Chart */}
            {auditAnalytics && (<card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle>Eventos de Auditoria por Severidade</card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <recharts_1.ResponsiveContainer width="100%" height={300}>
                    <recharts_1.PieChart>
                      <recharts_1.Pie data={Object.entries(auditAnalytics.eventsBySeverity).map(function (_a) {
                var severity = _a[0], count = _a[1];
                return ({
                    name: severity,
                    value: count
                });
            })} cx="50%" cy="50%" labelLine={false} label={function (_a) {
            var name = _a.name, percent = _a.percent;
            return "".concat(name, " ").concat((percent * 100).toFixed(0), "%");
        }} outerRadius={80} fill="#8884d8" dataKey="value">
                        {Object.entries(auditAnalytics.eventsBySeverity).map(function (entry, index) { return (<recharts_1.Cell key={"cell-".concat(index)} fill={COLORS[index % COLORS.length]}/>); })}
                      </recharts_1.Pie>
                      <recharts_1.Tooltip />
                    </recharts_1.PieChart>
                  </recharts_1.ResponsiveContainer>
                </card_1.CardContent>
              </card_1.Card>)}
          </div>

          {/* Recent Violations Alert */}
          {auditAnalytics && auditAnalytics.recentViolations.length > 0 && (<alert_1.Alert variant="destructive">
              <lucide_react_1.AlertTriangle className="h-4 w-4"/>
              <alert_1.AlertTitle>Violações Recentes Detectadas</alert_1.AlertTitle>
              <alert_1.AlertDescription>
                {auditAnalytics.recentViolations.length} violação(ões) de conformidade detectada(s) recentemente.
                Revise a trilha de auditoria para mais detalhes.
              </alert_1.AlertDescription>
            </alert_1.Alert>)}
        </tabs_1.TabsContent>

        {/* Consents Tab */}
        <tabs_1.TabsContent value="consents" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Gestão de Consentimentos</card_1.CardTitle>
              <card_1.CardDescription>
                Monitore e gerencie consentimentos LGPD dos usuários
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              {consentAnalytics && (<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {consentAnalytics.activeConsents}
                    </div>
                    <div className="text-sm text-muted-foreground">Ativos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {consentAnalytics.expiredConsents}
                    </div>
                    <div className="text-sm text-muted-foreground">Expirados</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {consentAnalytics.withdrawnConsents}
                    </div>
                    <div className="text-sm text-muted-foreground">Retirados</div>
                  </div>
                </div>)}
              
              <button_1.Button onClick={function () { return setShowConsentDialog(true); }}>
                <lucide_react_1.UserCheck className="h-4 w-4 mr-2"/>
                Coletar Novo Consentimento
              </button_1.Button>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        {/* Audit Tab */}
        <tabs_1.TabsContent value="audit" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Trilha de Auditoria LGPD</card_1.CardTitle>
              <card_1.CardDescription>
                Histórico completo de eventos relacionados à LGPD
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <table_1.Table>
                <table_1.TableHeader>
                  <table_1.TableRow>
                    <table_1.TableHead>Data/Hora</table_1.TableHead>
                    <table_1.TableHead>Evento</table_1.TableHead>
                    <table_1.TableHead>Severidade</table_1.TableHead>
                    <table_1.TableHead>Tipo de Dados</table_1.TableHead>
                    <table_1.TableHead>Descrição</table_1.TableHead>
                    <table_1.TableHead>Status</table_1.TableHead>
                  </table_1.TableRow>
                </table_1.TableHeader>
                <table_1.TableBody>
                  {auditTrail.map(function (record) { return (<table_1.TableRow key={record.id}>
                      <table_1.TableCell className="font-mono text-sm">
                        {formatDate(record.timestamp)}
                      </table_1.TableCell>
                      <table_1.TableCell>
                        <div className="flex items-center space-x-2">
                          {getEventTypeIcon(record.eventType)}
                          <span className="text-sm">{record.eventType}</span>
                        </div>
                      </table_1.TableCell>
                      <table_1.TableCell>
                        {getSeverityBadge(record.severity)}
                      </table_1.TableCell>
                      <table_1.TableCell>
                        <badge_1.Badge variant="outline">{record.dataType}</badge_1.Badge>
                      </table_1.TableCell>
                      <table_1.TableCell className="max-w-xs truncate">
                        {record.description}
                      </table_1.TableCell>
                      <table_1.TableCell>
                        <badge_1.Badge variant={record.complianceStatus === 'compliant' ? 'default' : 'destructive'}>
                          {record.complianceStatus}
                        </badge_1.Badge>
                      </table_1.TableCell>
                    </table_1.TableRow>); })}
                </table_1.TableBody>
              </table_1.Table>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        {/* Retention Tab */}
        <tabs_1.TabsContent value="retention" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Gestão de Retenção de Dados</card_1.CardTitle>
              <card_1.CardDescription>
                Monitore políticas de retenção e expiração de dados
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              {retentionAnalytics && (<div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{retentionAnalytics.activeRecords}</div>
                      <div className="text-sm text-muted-foreground">Registros Ativos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {retentionAnalytics.expiringSoonRecords}
                      </div>
                      <div className="text-sm text-muted-foreground">Expirando em Breve</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {retentionAnalytics.expiredRecords}
                      </div>
                      <div className="text-sm text-muted-foreground">Expirados</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round(retentionAnalytics.retentionCompliance)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Conformidade</div>
                    </div>
                  </div>

                  {retentionAnalytics.upcomingExpirations.length > 0 && (<div>
                      <h4 className="font-semibold mb-2">Próximas Expirações</h4>
                      <div className="space-y-2">
                        {retentionAnalytics.upcomingExpirations.slice(0, 5).map(function (record) { return (<div key={record.id} className="flex items-center justify-between p-2 border rounded">
                            <div>
                              <div className="font-medium">{record.dataType}</div>
                              <div className="text-sm text-muted-foreground">
                                Expira em: {formatDate(record.retentionExpiresAt)}
                              </div>
                            </div>
                            <badge_1.Badge variant="secondary">{record.status}</badge_1.Badge>
                          </div>); })}
                      </div>
                    </div>)}
                </div>)}
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        {/* Requests Tab */}
        <tabs_1.TabsContent value="requests" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Solicitações de Titulares de Dados</card_1.CardTitle>
              <card_1.CardDescription>
                Gerencie solicitações de acesso, retificação e exclusão de dados
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              {auditAnalytics && (<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {auditAnalytics.dataSubjectRequests.total}
                    </div>
                    <div className="text-sm text-muted-foreground">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {auditAnalytics.dataSubjectRequests.pending}
                    </div>
                    <div className="text-sm text-muted-foreground">Pendentes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(auditAnalytics.dataSubjectRequests.averageResponseTime)}
                    </div>
                    <div className="text-sm text-muted-foreground">Dias (Tempo Médio)</div>
                  </div>
                </div>)}
              
              <button_1.Button onClick={function () { return setShowRequestDialog(true); }}>
                <lucide_react_1.FileText className="h-4 w-4 mr-2"/>
                Nova Solicitação
              </button_1.Button>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>

      {/* Consent Collection Dialog */}
      <dialog_1.Dialog open={showConsentDialog} onOpenChange={setShowConsentDialog}>
        <dialog_1.DialogContent className="max-w-2xl">
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>Coletar Consentimento LGPD</dialog_1.DialogTitle>
            <dialog_1.DialogDescription>
              Configure e colete consentimento para processamento de dados pessoais
            </dialog_1.DialogDescription>
          </dialog_1.DialogHeader>
          <div className="space-y-4">
            <div>
              <label_1.Label htmlFor="consent-user">ID do Usuário</label_1.Label>
              <input_1.Input id="consent-user" placeholder="Digite o ID do usuário"/>
            </div>
            <div>
              <label_1.Label htmlFor="consent-types">Tipos de Dados</label_1.Label>
              <select_1.Select>
                <select_1.SelectTrigger>
                  <select_1.SelectValue placeholder="Selecione os tipos de dados"/>
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  {Object.values(consent_automation_manager_1.LGPDDataType).map(function (type) { return (<select_1.SelectItem key={type} value={type}>{type}</select_1.SelectItem>); })}
                </select_1.SelectContent>
              </select_1.Select>
            </div>
            <div>
              <label_1.Label htmlFor="consent-text">Texto do Consentimento</label_1.Label>
              <textarea_1.Textarea id="consent-text" placeholder="Digite o texto do consentimento..." rows={4}/>
            </div>
          </div>
          <dialog_1.DialogFooter>
            <button_1.Button variant="outline" onClick={function () { return setShowConsentDialog(false); }}>
              Cancelar
            </button_1.Button>
            <button_1.Button onClick={function () { return setShowConsentDialog(false); }}>
              Coletar Consentimento
            </button_1.Button>
          </dialog_1.DialogFooter>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>

      {/* Data Subject Request Dialog */}
      <dialog_1.Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <dialog_1.DialogContent className="max-w-2xl">
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>Nova Solicitação de Titular</dialog_1.DialogTitle>
            <dialog_1.DialogDescription>
              Registre uma nova solicitação de titular de dados
            </dialog_1.DialogDescription>
          </dialog_1.DialogHeader>
          <div className="space-y-4">
            <div>
              <label_1.Label htmlFor="request-type">Tipo de Solicitação</label_1.Label>
              <select_1.Select>
                <select_1.SelectTrigger>
                  <select_1.SelectValue placeholder="Selecione o tipo"/>
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="access">Acesso aos Dados</select_1.SelectItem>
                  <select_1.SelectItem value="rectification">Retificação</select_1.SelectItem>
                  <select_1.SelectItem value="deletion">Exclusão</select_1.SelectItem>
                  <select_1.SelectItem value="portability">Portabilidade</select_1.SelectItem>
                  <select_1.SelectItem value="restriction">Restrição</select_1.SelectItem>
                  <select_1.SelectItem value="objection">Oposição</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>
            <div>
              <label_1.Label htmlFor="request-subject">ID do Titular</label_1.Label>
              <input_1.Input id="request-subject" placeholder="Digite o ID do titular"/>
            </div>
            <div>
              <label_1.Label htmlFor="request-details">Detalhes da Solicitação</label_1.Label>
              <textarea_1.Textarea id="request-details" placeholder="Descreva os detalhes da solicitação..." rows={4}/>
            </div>
          </div>
          <dialog_1.DialogFooter>
            <button_1.Button variant="outline" onClick={function () { return setShowRequestDialog(false); }}>
              Cancelar
            </button_1.Button>
            <button_1.Button onClick={function () { return setShowRequestDialog(false); }}>
              Criar Solicitação
            </button_1.Button>
          </dialog_1.DialogFooter>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>
    </div>);
}

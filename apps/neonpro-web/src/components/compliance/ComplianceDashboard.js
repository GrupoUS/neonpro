/**
 * LGPD Compliance Dashboard Component
 * Dashboard para monitoramento de compliance LGPD
 *
 * @author APEX Master Developer
 * @version 1.0.0
 * @compliance LGPD Art. 37, 38, 39 (Relatórios e Monitoramento)
 */
"use client";
var __awaiter =
  (this && this.__awaiter) ||
  ((thisArg, _arguments, P, generator) => {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P((resolve) => {
            resolve(value);
          });
    }
    return new (P || (P = Promise))((resolve, reject) => {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  });
var __generator =
  (this && this.__generator) ||
  ((thisArg, body) => {
    var _ = {
        label: 0,
        sent: () => {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return (v) => step([n, v]);
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ComplianceDashboard;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var tabs_1 = require("@/components/ui/tabs");
var alert_1 = require("@/components/ui/alert");
var progress_1 = require("@/components/ui/progress");
var lucide_react_1 = require("lucide-react");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var useLGPD_1 = require("@/lib/compliance/useLGPD");
var audit_trail_1 = require("@/lib/compliance/audit-trail");
// ============================================================================
// MAIN COMPONENT
// ============================================================================
function ComplianceDashboard() {
  var _a = (0, react_1.useState)("30d"),
    selectedPeriod = _a[0],
    setSelectedPeriod = _a[1];
  var _b = (0, react_1.useState)(true),
    isLoading = _b[0],
    setIsLoading = _b[1];
  var _c = (0, react_1.useState)(null),
    metrics = _c[0],
    setMetrics = _c[1];
  var _d = (0, react_1.useState)([]),
    events = _d[0],
    setEvents = _d[1];
  var _e = (0, react_1.useState)([]),
    alerts = _e[0],
    setAlerts = _e[1];
  var _f = (0, react_1.useState)(new Date()),
    lastUpdated = _f[0],
    setLastUpdated = _f[1];
  var _g = (0, useLGPD_1.useLGPD)(),
    auditEvents = _g.auditEvents,
    complianceReport = _g.complianceReport,
    lgpdLoading = _g.isLoading,
    error = _g.error,
    refreshData = _g.refreshData;
  // ============================================================================
  // EFFECTS
  // ============================================================================
  (0, react_1.useEffect)(() => {
    loadDashboardData();
  }, [selectedPeriod]);
  (0, react_1.useEffect)(() => {
    if (auditEvents && complianceReport) {
      processComplianceData();
    }
  }, [auditEvents, complianceReport]);
  // ============================================================================
  // DATA PROCESSING
  // ============================================================================
  var loadDashboardData = () =>
    __awaiter(this, void 0, void 0, function () {
      var error_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            setIsLoading(true);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            return [4 /*yield*/, refreshData()];
          case 2:
            _a.sent();
            setLastUpdated(new Date());
            return [3 /*break*/, 5];
          case 3:
            error_1 = _a.sent();
            console.error("Failed to load dashboard data:", error_1);
            return [3 /*break*/, 5];
          case 4:
            setIsLoading(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  var processComplianceData = () => {
    if (!auditEvents || !complianceReport) return;
    // Calculate metrics
    var totalEvents = auditEvents.length;
    var dataAccesses = auditEvents.filter((e) =>
      [audit_trail_1.AuditEventType.DATA_ACCESS, audit_trail_1.AuditEventType.DATA_VIEW].includes(
        e.eventType,
      ),
    ).length;
    var consentChanges = auditEvents.filter((e) =>
      [
        audit_trail_1.AuditEventType.CONSENT_GRANTED,
        audit_trail_1.AuditEventType.CONSENT_WITHDRAWN,
      ].includes(e.eventType),
    ).length;
    var securityEvents = auditEvents.filter((e) =>
      [
        audit_trail_1.AuditEventType.UNAUTHORIZED_ACCESS,
        audit_trail_1.AuditEventType.DATA_BREACH,
      ].includes(e.eventType),
    ).length;
    // Calculate compliance score
    var complianceScore = calculateComplianceScore(auditEvents);
    var criticalIssues = complianceReport.compliance.issues.length;
    setMetrics({
      totalEvents: totalEvents,
      dataAccesses: dataAccesses,
      consentChanges: consentChanges,
      securityEvents: securityEvents,
      complianceScore: complianceScore,
      criticalIssues: criticalIssues,
      pendingRequests: 0, // Would come from API
      activeConsents: 0, // Would come from API
    });
    // Process event summaries
    var eventSummaries = processEventSummaries(auditEvents);
    setEvents(eventSummaries);
    // Generate alerts
    var complianceAlerts = generateAlerts(auditEvents, complianceReport);
    setAlerts(complianceAlerts);
  };
  var calculateComplianceScore = (events) => {
    if (events.length === 0) return 100;
    var totalEvents = events.length;
    var failedEvents = events.filter((e) => e.status === audit_trail_1.AuditStatus.FAILURE).length;
    var securityEvents = events.filter((e) =>
      [
        audit_trail_1.AuditEventType.UNAUTHORIZED_ACCESS,
        audit_trail_1.AuditEventType.DATA_BREACH,
      ].includes(e.eventType),
    ).length;
    // Calculate score based on success rate and security events
    var successRate = ((totalEvents - failedEvents) / totalEvents) * 100;
    var securityPenalty = Math.min(securityEvents * 10, 50); // Max 50% penalty
    return Math.max(0, Math.round(successRate - securityPenalty));
  };
  var processEventSummaries = (events) => {
    var eventCounts = events.reduce((acc, event) => {
      acc[event.eventType] = (acc[event.eventType] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(eventCounts).map((_a) => {
      var type = _a[0],
        count = _a[1];
      return {
        type: type,
        count: count,
        severity: getSeverityForEventType(type),
        trend: "stable", // Would calculate based on historical data
      };
    });
  };
  var generateAlerts = (events, report) => {
    var alerts = [];
    // Critical security events
    var criticalEvents = events.filter((e) => e.severity === audit_trail_1.AuditSeverity.CRITICAL);
    if (criticalEvents.length > 0) {
      alerts.push({
        id: "critical-events",
        type: "critical",
        title: "Eventos Críticos Detectados",
        description: "".concat(criticalEvents.length, " eventos cr\u00EDticos foram registrados"),
        timestamp: new Date(),
        resolved: false,
      });
    }
    // Compliance issues
    if (report.compliance.issues.length > 0) {
      alerts.push({
        id: "compliance-issues",
        type: "warning",
        title: "Problemas de Compliance",
        description: "".concat(
          report.compliance.issues.length,
          " problemas de compliance identificados",
        ),
        timestamp: new Date(),
        resolved: false,
      });
    }
    return alerts;
  };
  var getSeverityForEventType = (eventType) => {
    switch (eventType) {
      case audit_trail_1.AuditEventType.DATA_BREACH:
      case audit_trail_1.AuditEventType.UNAUTHORIZED_ACCESS:
        return audit_trail_1.AuditSeverity.CRITICAL;
      case audit_trail_1.AuditEventType.ENCRYPTION_FAILURE:
      case audit_trail_1.AuditEventType.DECRYPTION_FAILURE:
        return audit_trail_1.AuditSeverity.HIGH;
      case audit_trail_1.AuditEventType.CONSENT_EXPIRED:
        return audit_trail_1.AuditSeverity.MEDIUM;
      default:
        return audit_trail_1.AuditSeverity.LOW;
    }
  };
  var getPeriodDates = () => {
    var end = (0, date_fns_1.endOfDay)(new Date());
    var start = (0, date_fns_1.startOfDay)(
      (0, date_fns_1.subDays)(
        end,
        selectedPeriod === "7d" ? 7 : selectedPeriod === "30d" ? 30 : 90,
      ),
    );
    return { start: start, end: end };
  };
  // ============================================================================
  // RENDER HELPERS
  // ============================================================================
  var renderMetricCard = (title, value, icon, trend, color) => (
    <card_1.Card>
      <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <card_1.CardTitle className="text-sm font-medium">{title}</card_1.CardTitle>
        {icon}
      </card_1.CardHeader>
      <card_1.CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <div className="flex items-center text-xs text-muted-foreground">
            <lucide_react_1.TrendingUp className="mr-1 h-3 w-3" />
            <span>
              Tendência:{" "}
              {trend === "up" ? "Crescente" : trend === "down" ? "Decrescente" : "Estável"}
            </span>
          </div>
        )}
      </card_1.CardContent>
    </card_1.Card>
  );
  var renderComplianceScore = () => {
    var score = (metrics === null || metrics === void 0 ? void 0 : metrics.complianceScore) || 0;
    var color = score >= 90 ? "text-green-600" : score >= 70 ? "text-yellow-600" : "text-red-600";
    var bgColor = score >= 90 ? "bg-green-100" : score >= 70 ? "bg-yellow-100" : "bg-red-100";
    return (
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Shield className="h-5 w-5" />
            Score de Compliance LGPD
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className={"text-4xl font-bold ".concat(color, " mb-2")}>{score}%</div>
          <progress_1.Progress value={score} className="mb-4" />
          <div
            className={"inline-flex items-center px-2 py-1 rounded-full text-xs font-medium "
              .concat(bgColor, " ")
              .concat(color)}
          >
            {score >= 90
              ? <>
                  <lucide_react_1.CheckCircle className="mr-1 h-3 w-3" /> Excelente
                </>
              : score >= 70
                ? <>
                    <lucide_react_1.AlertTriangle className="mr-1 h-3 w-3" /> Atenção
                  </>
                : <>
                    <lucide_react_1.XCircle className="mr-1 h-3 w-3" /> Crítico
                  </>}
          </div>
        </card_1.CardContent>
      </card_1.Card>
    );
  };
  var renderAlerts = () => (
    <card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle className="flex items-center gap-2">
          <lucide_react_1.AlertTriangle className="h-5 w-5" />
          Alertas de Compliance
        </card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent>
        {alerts.length === 0
          ? <div className="text-center py-4 text-muted-foreground">
              <lucide_react_1.CheckCircle className="mx-auto h-8 w-8 mb-2" />
              <p>Nenhum alerta ativo</p>
            </div>
          : <div className="space-y-3">
              {alerts.map((alert) => (
                <alert_1.Alert
                  key={alert.id}
                  variant={alert.type === "critical" ? "destructive" : "default"}
                >
                  <lucide_react_1.AlertTriangle className="h-4 w-4" />
                  <alert_1.AlertTitle>{alert.title}</alert_1.AlertTitle>
                  <alert_1.AlertDescription>
                    {alert.description}
                    <div className="text-xs text-muted-foreground mt-1">
                      {(0, date_fns_1.format)(alert.timestamp, "dd/MM/yyyy HH:mm", {
                        locale: locale_1.ptBR,
                      })}
                    </div>
                  </alert_1.AlertDescription>
                </alert_1.Alert>
              ))}
            </div>}
      </card_1.CardContent>
    </card_1.Card>
  );
  var renderEventSummary = () => (
    <card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle className="flex items-center gap-2">
          <lucide_react_1.Activity className="h-5 w-5" />
          Resumo de Eventos
        </card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent>
        <div className="space-y-3">
          {events.slice(0, 5).map((event) => (
            <div key={event.type} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <badge_1.Badge
                  variant={
                    event.severity === audit_trail_1.AuditSeverity.CRITICAL
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {event.type.replace("_", " ")}
                </badge_1.Badge>
              </div>
              <div className="text-sm font-medium">{event.count}</div>
            </div>
          ))}
        </div>
      </card_1.CardContent>
    </card_1.Card>
  );
  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  if (isLoading || lgpdLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <lucide_react_1.RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando dashboard...</span>
      </div>
    );
  }
  if (error) {
    return (
      <alert_1.Alert variant="destructive">
        <lucide_react_1.XCircle className="h-4 w-4" />
        <alert_1.AlertTitle>Erro ao carregar dashboard</alert_1.AlertTitle>
        <alert_1.AlertDescription>{error}</alert_1.AlertDescription>
      </alert_1.Alert>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard LGPD</h1>
          <p className="text-muted-foreground">Monitoramento de compliance e auditoria</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <lucide_react_1.Clock className="h-4 w-4" />
            Atualizado:{" "}
            {(0, date_fns_1.format)(lastUpdated, "dd/MM/yyyy HH:mm", { locale: locale_1.ptBR })}
          </div>
          <button_1.Button variant="outline" size="sm" onClick={loadDashboardData}>
            <lucide_react_1.RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </button_1.Button>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex items-center gap-2">
        <lucide_react_1.Filter className="h-4 w-4" />
        <span className="text-sm font-medium">Período:</span>
        <div className="flex gap-1">
          {["7d", "30d", "90d"].map((period) => (
            <button_1.Button
              key={period}
              variant={selectedPeriod === period ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
            >
              {period === "7d" ? "7 dias" : period === "30d" ? "30 dias" : "90 dias"}
            </button_1.Button>
          ))}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {renderMetricCard(
          "Total de Eventos",
          (metrics === null || metrics === void 0 ? void 0 : metrics.totalEvents) || 0,
          <lucide_react_1.Activity className="h-4 w-4 text-muted-foreground" />,
        )}
        {renderMetricCard(
          "Acessos a Dados",
          (metrics === null || metrics === void 0 ? void 0 : metrics.dataAccesses) || 0,
          <lucide_react_1.Eye className="h-4 w-4 text-muted-foreground" />,
        )}
        {renderMetricCard(
          "Mudanças de Consentimento",
          (metrics === null || metrics === void 0 ? void 0 : metrics.consentChanges) || 0,
          <lucide_react_1.UserCheck className="h-4 w-4 text-muted-foreground" />,
        )}
        {renderMetricCard(
          "Eventos de Segurança",
          (metrics === null || metrics === void 0 ? void 0 : metrics.securityEvents) || 0,
          <lucide_react_1.Shield className="h-4 w-4 text-muted-foreground" />,
          "stable",
          (metrics === null || metrics === void 0 ? void 0 : metrics.securityEvents) &&
            metrics.securityEvents > 0
            ? "destructive"
            : "success",
        )}
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Compliance Score */}
        {renderComplianceScore()}

        {/* Alerts */}
        {renderAlerts()}

        {/* Event Summary */}
        {renderEventSummary()}
      </div>

      {/* Detailed Tabs */}
      <tabs_1.Tabs defaultValue="overview" className="space-y-4">
        <tabs_1.TabsList>
          <tabs_1.TabsTrigger value="overview">Visão Geral</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="audit">Auditoria</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="consent">Consentimentos</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="reports">Relatórios</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="overview" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Resumo do Período</card_1.CardTitle>
              <card_1.CardDescription>
                Análise de compliance para os últimos{" "}
                {selectedPeriod === "7d"
                  ? "7 dias"
                  : selectedPeriod === "30d"
                    ? "30 dias"
                    : "90 dias"}
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-2">Estatísticas Gerais</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total de eventos:</span>
                        <span className="font-medium">
                          {(metrics === null || metrics === void 0
                            ? void 0
                            : metrics.totalEvents) || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Score de compliance:</span>
                        <span className="font-medium">
                          {(metrics === null || metrics === void 0
                            ? void 0
                            : metrics.complianceScore) || 0}
                          %
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Problemas críticos:</span>
                        <span className="font-medium">
                          {(metrics === null || metrics === void 0
                            ? void 0
                            : metrics.criticalIssues) || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Atividade de Dados</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Acessos a dados:</span>
                        <span className="font-medium">
                          {(metrics === null || metrics === void 0
                            ? void 0
                            : metrics.dataAccesses) || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Mudanças de consentimento:</span>
                        <span className="font-medium">
                          {(metrics === null || metrics === void 0
                            ? void 0
                            : metrics.consentChanges) || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Eventos de segurança:</span>
                        <span className="font-medium">
                          {(metrics === null || metrics === void 0
                            ? void 0
                            : metrics.securityEvents) || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="audit">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Log de Auditoria</card_1.CardTitle>
              <card_1.CardDescription>
                Eventos de auditoria registrados no sistema
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <lucide_react_1.FileText className="mx-auto h-12 w-12 mb-4" />
                <p>Implementação detalhada do log de auditoria em desenvolvimento</p>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="consent">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Gerenciamento de Consentimentos</card_1.CardTitle>
              <card_1.CardDescription>
                Status e histórico de consentimentos dos usuários
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <lucide_react_1.UserCheck className="mx-auto h-12 w-12 mb-4" />
                <p>Interface de gerenciamento de consentimentos em desenvolvimento</p>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="reports">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Relatórios de Compliance</card_1.CardTitle>
              <card_1.CardDescription>
                Relatórios automáticos e exportação de dados
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <lucide_react_1.BarChart3 className="mx-auto h-12 w-12 mb-4" />
                <p>Sistema de relatórios automáticos em desenvolvimento</p>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>
  );
}

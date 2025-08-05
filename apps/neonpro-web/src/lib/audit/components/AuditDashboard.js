/**
 * NeonPro Audit Dashboard Component
 *
 * Componente principal para visualização e gestão do sistema
 * de auditoria, incluindo logs, alertas, relatórios e estatísticas.
 *
 * Features:
 * - Visualização de logs com filtros avançados
 * - Monitoramento de alertas de segurança
 * - Geração e gestão de relatórios
 * - Dashboard de estatísticas
 * - Exportação de dados
 *
 * @author APEX Master Developer
 * @version 1.0.0
 */
"use client";
"use strict";
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditDashboard = AuditDashboard;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var tabs_1 = require("@/components/ui/tabs");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var badge_1 = require("@/components/ui/badge");
var table_1 = require("@/components/ui/table");
var dialog_1 = require("@/components/ui/dialog");
var lucide_react_1 = require("lucide-react");
var useAuditSystem_1 = require("../hooks/useAuditSystem");
var audit_system_1 = require("../audit-system");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================
function AuditDashboard(_a) {
  var className = _a.className;
  var _b = (0, react_1.useState)("logs"),
    activeTab = _b[0],
    setActiveTab = _b[1];
  var _c = (0, react_1.useState)(null),
    selectedLogId = _c[0],
    setSelectedLogId = _c[1];
  // Hooks do sistema de auditoria
  var logs = (0, useAuditSystem_1.useAuditLogs)({ autoRefresh: true, refreshInterval: 30000 });
  var alerts = (0, useAuditSystem_1.useSecurityAlerts)();
  var reports = (0, useAuditSystem_1.useAuditReports)();
  var statistics = (0, useAuditSystem_1.useAuditStatistics)();
  var logger = (0, useAuditSystem_1.useAuditLogger)();
  // Estado para filtros
  var _d = (0, react_1.useState)({}),
    logFilters = _d[0],
    setLogFilters = _d[1];
  // Estatísticas resumidas
  var summaryStats = (0, react_1.useMemo)(
    function () {
      if (!statistics.statistics) return null;
      return {
        totalEvents: statistics.statistics.total_events,
        criticalEvents: statistics.statistics.events_by_severity.CRITICAL || 0,
        highEvents: statistics.statistics.events_by_severity.HIGH || 0,
        activeAlerts: alerts.unreadCount,
        recentReports: reports.reports.length,
      };
    },
    [statistics.statistics, alerts.unreadCount, reports.reports.length],
  );
  return (
    <div className={"space-y-6 ".concat(className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sistema de Auditoria</h1>
          <p className="text-muted-foreground">Monitoramento e análise de eventos de segurança</p>
        </div>
        <div className="flex items-center space-x-2">
          <button_1.Button
            variant="outline"
            size="sm"
            onClick={function () {
              logs.refresh();
              alerts.refresh();
              reports.refresh();
              statistics.refresh();
            }}
          >
            <lucide_react_1.RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </button_1.Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      {summaryStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">Total de Eventos</card_1.CardTitle>
              <lucide_react_1.BarChart3 className="h-4 w-4 text-muted-foreground" />
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold">{summaryStats.totalEvents.toLocaleString()}</div>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">Eventos Críticos</card_1.CardTitle>
              <lucide_react_1.AlertTriangle className="h-4 w-4 text-red-500" />
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold text-red-600">{summaryStats.criticalEvents}</div>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">
                Eventos de Alta Prioridade
              </card_1.CardTitle>
              <lucide_react_1.AlertCircle className="h-4 w-4 text-orange-500" />
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold text-orange-600">{summaryStats.highEvents}</div>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">Alertas Ativos</card_1.CardTitle>
              <lucide_react_1.Shield className="h-4 w-4 text-yellow-500" />
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold text-yellow-600">{summaryStats.activeAlerts}</div>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">Relatórios</card_1.CardTitle>
              <lucide_react_1.FileText className="h-4 w-4 text-muted-foreground" />
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold">{summaryStats.recentReports}</div>
            </card_1.CardContent>
          </card_1.Card>
        </div>
      )}

      {/* Tabs Principais */}
      <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <tabs_1.TabsList>
          <tabs_1.TabsTrigger value="logs">Logs de Auditoria</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="alerts">Alertas de Segurança</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="reports">Relatórios</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="statistics">Estatísticas</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        {/* Tab: Logs de Auditoria */}
        <tabs_1.TabsContent value="logs" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <card_1.CardTitle>Logs de Auditoria</card_1.CardTitle>
                  <card_1.CardDescription>
                    Visualização e análise de eventos do sistema
                  </card_1.CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <button_1.Button
                    variant="outline"
                    size="sm"
                    onClick={function () {
                      return logs.exportLogs("csv");
                    }}
                  >
                    <lucide_react_1.Download className="h-4 w-4 mr-2" />
                    Exportar CSV
                  </button_1.Button>
                  <button_1.Button
                    variant="outline"
                    size="sm"
                    onClick={function () {
                      return logs.exportLogs("json");
                    }}
                  >
                    <lucide_react_1.Download className="h-4 w-4 mr-2" />
                    Exportar JSON
                  </button_1.Button>
                </div>
              </div>
            </card_1.CardHeader>
            <card_1.CardContent>
              {/* Filtros */}
              <div className="grid gap-4 md:grid-cols-4 mb-6">
                <div className="space-y-2">
                  <label_1.Label htmlFor="event-type">Tipo de Evento</label_1.Label>
                  <select_1.Select
                    value={logFilters.event_type || ""}
                    onValueChange={function (value) {
                      return setLogFilters(function (prev) {
                        return __assign(__assign({}, prev), { event_type: value });
                      });
                    }}
                  >
                    <select_1.SelectTrigger>
                      <select_1.SelectValue placeholder="Todos os tipos" />
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="">Todos os tipos</select_1.SelectItem>
                      <select_1.SelectItem value="user.login">Login</select_1.SelectItem>
                      <select_1.SelectItem value="user.logout">Logout</select_1.SelectItem>
                      <select_1.SelectItem value="user.create">
                        Criação de Usuário
                      </select_1.SelectItem>
                      <select_1.SelectItem value="security.failed_login">
                        Login Falhado
                      </select_1.SelectItem>
                      <select_1.SelectItem value="security.suspicious_activity">
                        Atividade Suspeita
                      </select_1.SelectItem>
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>

                <div className="space-y-2">
                  <label_1.Label htmlFor="severity">Severidade</label_1.Label>
                  <select_1.Select
                    value={logFilters.severity || ""}
                    onValueChange={function (value) {
                      return setLogFilters(function (prev) {
                        return __assign(__assign({}, prev), { severity: value });
                      });
                    }}
                  >
                    <select_1.SelectTrigger>
                      <select_1.SelectValue placeholder="Todas as severidades" />
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="">Todas as severidades</select_1.SelectItem>
                      <select_1.SelectItem value="LOW">Baixa</select_1.SelectItem>
                      <select_1.SelectItem value="MEDIUM">Média</select_1.SelectItem>
                      <select_1.SelectItem value="HIGH">Alta</select_1.SelectItem>
                      <select_1.SelectItem value="CRITICAL">Crítica</select_1.SelectItem>
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>

                <div className="space-y-2">
                  <label_1.Label htmlFor="user-id">ID do Usuário</label_1.Label>
                  <input_1.Input
                    id="user-id"
                    placeholder="Filtrar por usuário"
                    value={logFilters.user_id || ""}
                    onChange={function (e) {
                      return setLogFilters(function (prev) {
                        return __assign(__assign({}, prev), { user_id: e.target.value });
                      });
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <label_1.Label htmlFor="ip-address">Endereço IP</label_1.Label>
                  <input_1.Input
                    id="ip-address"
                    placeholder="Filtrar por IP"
                    value={logFilters.ip_address || ""}
                    onChange={function (e) {
                      return setLogFilters(function (prev) {
                        return __assign(__assign({}, prev), { ip_address: e.target.value });
                      });
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <button_1.Button
                  variant="outline"
                  size="sm"
                  onClick={function () {
                    return logs.setFilters(logFilters);
                  }}
                >
                  <lucide_react_1.Filter className="h-4 w-4 mr-2" />
                  Aplicar Filtros
                </button_1.Button>
                <button_1.Button
                  variant="ghost"
                  size="sm"
                  onClick={function () {
                    setLogFilters({});
                    logs.setFilters({});
                  }}
                >
                  Limpar Filtros
                </button_1.Button>
              </div>

              {/* Tabela de Logs */}
              <div className="rounded-md border">
                <table_1.Table>
                  <table_1.TableHeader>
                    <table_1.TableRow>
                      <table_1.TableHead>Timestamp</table_1.TableHead>
                      <table_1.TableHead>Tipo</table_1.TableHead>
                      <table_1.TableHead>Severidade</table_1.TableHead>
                      <table_1.TableHead>Usuário</table_1.TableHead>
                      <table_1.TableHead>Descrição</table_1.TableHead>
                      <table_1.TableHead>IP</table_1.TableHead>
                      <table_1.TableHead>Ações</table_1.TableHead>
                    </table_1.TableRow>
                  </table_1.TableHeader>
                  <table_1.TableBody>
                    {logs.loading
                      ? <table_1.TableRow>
                          <table_1.TableCell colSpan={7} className="text-center py-8">
                            Carregando logs...
                          </table_1.TableCell>
                        </table_1.TableRow>
                      : logs.logs.length === 0
                        ? <table_1.TableRow>
                            <table_1.TableCell colSpan={7} className="text-center py-8">
                              Nenhum log encontrado
                            </table_1.TableCell>
                          </table_1.TableRow>
                        : logs.logs.map(function (log) {
                            return (
                              <table_1.TableRow key={log.id}>
                                <table_1.TableCell className="font-mono text-sm">
                                  {(0, date_fns_1.formatDistanceToNow)(log.timestamp, {
                                    addSuffix: true,
                                    locale: locale_1.ptBR,
                                  })}
                                </table_1.TableCell>
                                <table_1.TableCell>
                                  <badge_1.Badge variant="outline">{log.event_type}</badge_1.Badge>
                                </table_1.TableCell>
                                <table_1.TableCell>
                                  <badge_1.Badge variant={getSeverityVariant(log.severity)}>
                                    {log.severity}
                                  </badge_1.Badge>
                                </table_1.TableCell>
                                <table_1.TableCell>
                                  <div className="flex items-center">
                                    <lucide_react_1.User className="h-4 w-4 mr-2" />
                                    {log.user_id || "Sistema"}
                                  </div>
                                </table_1.TableCell>
                                <table_1.TableCell className="max-w-xs truncate">
                                  {log.description}
                                </table_1.TableCell>
                                <table_1.TableCell>
                                  <div className="flex items-center">
                                    <lucide_react_1.Globe className="h-4 w-4 mr-2" />
                                    {log.ip_address || "N/A"}
                                  </div>
                                </table_1.TableCell>
                                <table_1.TableCell>
                                  <dialog_1.Dialog>
                                    <dialog_1.DialogTrigger asChild>
                                      <button_1.Button variant="ghost" size="sm">
                                        <lucide_react_1.Eye className="h-4 w-4" />
                                      </button_1.Button>
                                    </dialog_1.DialogTrigger>
                                    <dialog_1.DialogContent className="max-w-2xl">
                                      <dialog_1.DialogHeader>
                                        <dialog_1.DialogTitle>Detalhes do Log</dialog_1.DialogTitle>
                                        <dialog_1.DialogDescription>
                                          Informações completas do evento de auditoria
                                        </dialog_1.DialogDescription>
                                      </dialog_1.DialogHeader>
                                      <LogDetailsView log={log} />
                                    </dialog_1.DialogContent>
                                  </dialog_1.Dialog>
                                </table_1.TableCell>
                              </table_1.TableRow>
                            );
                          })}
                  </table_1.TableBody>
                </table_1.Table>
              </div>

              {logs.totalCount > 0 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {logs.logs.length} de {logs.totalCount} eventos
                  </p>
                </div>
              )}
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        {/* Tab: Alertas de Segurança */}
        <tabs_1.TabsContent value="alerts" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Alertas de Segurança</card_1.CardTitle>
              <card_1.CardDescription>
                Monitoramento de atividades suspeitas e violações de segurança
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                {alerts.loading
                  ? <div className="text-center py-8">Carregando alertas...</div>
                  : alerts.alerts.length === 0
                    ? <div className="text-center py-8">
                        <lucide_react_1.Shield className="h-12 w-12 mx-auto text-green-500 mb-4" />
                        <p className="text-lg font-medium">Nenhum alerta ativo</p>
                        <p className="text-muted-foreground">Sistema funcionando normalmente</p>
                      </div>
                    : alerts.alerts.map(function (alert) {
                        return (
                          <card_1.Card key={alert.id} className="border-l-4 border-l-red-500">
                            <card_1.CardHeader>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <lucide_react_1.AlertTriangle className="h-5 w-5 text-red-500" />
                                  <card_1.CardTitle className="text-lg">
                                    {alert.alert_type}
                                  </card_1.CardTitle>
                                  <badge_1.Badge variant={getSeverityVariant(alert.severity)}>
                                    {alert.severity}
                                  </badge_1.Badge>
                                  <badge_1.Badge variant={getStatusVariant(alert.status)}>
                                    {getStatusLabel(alert.status)}
                                  </badge_1.Badge>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <button_1.Button
                                    variant="outline"
                                    size="sm"
                                    onClick={function () {
                                      return alerts.markAsRead(alert.id);
                                    }}
                                    disabled={alert.status !== "open"}
                                  >
                                    Marcar como Lido
                                  </button_1.Button>
                                  <select_1.Select
                                    value={alert.status}
                                    onValueChange={function (value) {
                                      return alerts.updateStatus(alert.id, value);
                                    }}
                                  >
                                    <select_1.SelectTrigger className="w-40">
                                      <select_1.SelectValue />
                                    </select_1.SelectTrigger>
                                    <select_1.SelectContent>
                                      <select_1.SelectItem value="open">Aberto</select_1.SelectItem>
                                      <select_1.SelectItem value="investigating">
                                        Investigando
                                      </select_1.SelectItem>
                                      <select_1.SelectItem value="resolved">
                                        Resolvido
                                      </select_1.SelectItem>
                                      <select_1.SelectItem value="false_positive">
                                        Falso Positivo
                                      </select_1.SelectItem>
                                    </select_1.SelectContent>
                                  </select_1.Select>
                                </div>
                              </div>
                              <card_1.CardDescription>
                                <div className="flex items-center space-x-4 text-sm">
                                  <span className="flex items-center">
                                    <lucide_react_1.Clock className="h-4 w-4 mr-1" />
                                    {(0, date_fns_1.formatDistanceToNow)(alert.created_at, {
                                      addSuffix: true,
                                      locale: locale_1.ptBR,
                                    })}
                                  </span>
                                  {alert.user_id && (
                                    <span className="flex items-center">
                                      <lucide_react_1.User className="h-4 w-4 mr-1" />
                                      {alert.user_id}
                                    </span>
                                  )}
                                  {alert.ip_address && (
                                    <span className="flex items-center">
                                      <lucide_react_1.Globe className="h-4 w-4 mr-1" />
                                      {alert.ip_address}
                                    </span>
                                  )}
                                </div>
                              </card_1.CardDescription>
                            </card_1.CardHeader>
                            <card_1.CardContent>
                              <p className="text-sm">{alert.description}</p>
                              {alert.actions_taken.length > 0 && (
                                <div className="mt-4">
                                  <h4 className="text-sm font-medium mb-2">Ações Tomadas:</h4>
                                  <ul className="text-sm text-muted-foreground space-y-1">
                                    {alert.actions_taken.map(function (action, index) {
                                      return <li key={index}>• {action}</li>;
                                    })}
                                  </ul>
                                </div>
                              )}
                            </card_1.CardContent>
                          </card_1.Card>
                        );
                      })}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        {/* Tab: Relatórios */}
        <tabs_1.TabsContent value="reports" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <card_1.CardTitle>Relatórios de Auditoria</card_1.CardTitle>
                  <card_1.CardDescription>
                    Geração e gestão de relatórios personalizados
                  </card_1.CardDescription>
                </div>
                <button_1.Button
                  onClick={function () {
                    // TODO: Implementar modal de criação de relatório
                    logger.logUserAction("generate_report", "audit_report");
                  }}
                >
                  <lucide_react_1.FileText className="h-4 w-4 mr-2" />
                  Novo Relatório
                </button_1.Button>
              </div>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                {reports.loading
                  ? <div className="text-center py-8">Carregando relatórios...</div>
                  : reports.reports.length === 0
                    ? <div className="text-center py-8">
                        <lucide_react_1.FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-lg font-medium">Nenhum relatório encontrado</p>
                        <p className="text-muted-foreground">Crie seu primeiro relatório</p>
                      </div>
                    : reports.reports.map(function (report) {
                        return (
                          <card_1.Card key={report.id}>
                            <card_1.CardHeader>
                              <div className="flex items-center justify-between">
                                <div>
                                  <card_1.CardTitle className="text-lg">
                                    {report.title}
                                  </card_1.CardTitle>
                                  <card_1.CardDescription>
                                    {report.description}
                                  </card_1.CardDescription>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <button_1.Button variant="outline" size="sm">
                                    <lucide_react_1.Download className="h-4 w-4 mr-2" />
                                    Exportar
                                  </button_1.Button>
                                  <button_1.Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={function () {
                                      return reports.deleteReport(report.id);
                                    }}
                                  >
                                    <lucide_react_1.XCircle className="h-4 w-4" />
                                  </button_1.Button>
                                </div>
                              </div>
                            </card_1.CardHeader>
                            <card_1.CardContent>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <span className="flex items-center">
                                  <lucide_react_1.Clock className="h-4 w-4 mr-1" />
                                  {(0, date_fns_1.formatDistanceToNow)(report.generated_at, {
                                    addSuffix: true,
                                    locale: locale_1.ptBR,
                                  })}
                                </span>
                                <span className="flex items-center">
                                  <lucide_react_1.User className="h-4 w-4 mr-1" />
                                  {report.generated_by}
                                </span>
                                <span>{report.events.length} eventos</span>
                              </div>
                            </card_1.CardContent>
                          </card_1.Card>
                        );
                      })}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        {/* Tab: Estatísticas */}
        <tabs_1.TabsContent value="statistics" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Estatísticas do Sistema</card_1.CardTitle>
              <card_1.CardDescription>
                Análise e métricas do sistema de auditoria
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              {statistics.loading
                ? <div className="text-center py-8">Carregando estatísticas...</div>
                : !statistics.statistics
                  ? <div className="text-center py-8">
                      <lucide_react_1.BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-lg font-medium">Nenhuma estatística disponível</p>
                      <button_1.Button
                        className="mt-4"
                        onClick={function () {
                          return statistics.refresh();
                        }}
                      >
                        Gerar Estatísticas
                      </button_1.Button>
                    </div>
                  : <div className="space-y-6">
                      {/* Estatísticas por Severidade */}
                      <div>
                        <h3 className="text-lg font-medium mb-4">Eventos por Severidade</h3>
                        <div className="grid gap-4 md:grid-cols-4">
                          {Object.entries(statistics.statistics.events_by_severity).map(
                            function (_a) {
                              var severity = _a[0],
                                count = _a[1];
                              return (
                                <card_1.Card key={severity}>
                                  <card_1.CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                          {severity}
                                        </p>
                                        <p className="text-2xl font-bold">{count}</p>
                                      </div>
                                      <badge_1.Badge variant={getSeverityVariant(severity)}>
                                        {severity}
                                      </badge_1.Badge>
                                    </div>
                                  </card_1.CardContent>
                                </card_1.Card>
                              );
                            },
                          )}
                        </div>
                      </div>

                      {/* Estatísticas por Tipo */}
                      <div>
                        <h3 className="text-lg font-medium mb-4">Eventos por Tipo</h3>
                        <div className="space-y-2">
                          {Object.entries(statistics.statistics.events_by_type).map(function (_a) {
                            var type = _a[0],
                              count = _a[1];
                            return (
                              <div
                                key={type}
                                className="flex items-center justify-between p-3 border rounded"
                              >
                                <span className="font-medium">{type}</span>
                                <badge_1.Badge variant="outline">{count}</badge_1.Badge>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Usuários Mais Ativos */}
                      <div>
                        <h3 className="text-lg font-medium mb-4">Usuários Mais Ativos</h3>
                        <div className="space-y-2">
                          {Object.entries(statistics.statistics.top_users).map(function (_a) {
                            var userId = _a[0],
                              count = _a[1];
                            return (
                              <div
                                key={userId}
                                className="flex items-center justify-between p-3 border rounded"
                              >
                                <div className="flex items-center">
                                  <lucide_react_1.User className="h-4 w-4 mr-2" />
                                  <span className="font-medium">{userId}</span>
                                </div>
                                <badge_1.Badge variant="outline">{count} eventos</badge_1.Badge>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>}
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>
  );
}
// =====================================================
// COMPONENTES AUXILIARES
// =====================================================
/**
 * Componente para exibir detalhes de um log
 */
function LogDetailsView(_a) {
  var log = _a.log;
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label_1.Label className="text-sm font-medium">ID do Evento</label_1.Label>
          <p className="text-sm font-mono">{log.id}</p>
        </div>
        <div>
          <label_1.Label className="text-sm font-medium">Timestamp</label_1.Label>
          <p className="text-sm">{log.timestamp.toLocaleString("pt-BR")}</p>
        </div>
        <div>
          <label_1.Label className="text-sm font-medium">Tipo de Evento</label_1.Label>
          <badge_1.Badge variant="outline">{log.event_type}</badge_1.Badge>
        </div>
        <div>
          <label_1.Label className="text-sm font-medium">Severidade</label_1.Label>
          <badge_1.Badge variant={getSeverityVariant(log.severity)}>{log.severity}</badge_1.Badge>
        </div>
        <div>
          <label_1.Label className="text-sm font-medium">Usuário</label_1.Label>
          <p className="text-sm">{log.user_id || "Sistema"}</p>
        </div>
        <div>
          <label_1.Label className="text-sm font-medium">Endereço IP</label_1.Label>
          <p className="text-sm">{log.ip_address || "N/A"}</p>
        </div>
      </div>

      <div>
        <label_1.Label className="text-sm font-medium">Descrição</label_1.Label>
        <p className="text-sm mt-1">{log.description}</p>
      </div>

      {log.resource_type && (
        <div>
          <label_1.Label className="text-sm font-medium">Recurso</label_1.Label>
          <p className="text-sm mt-1">
            {log.resource_type}: {log.resource_id}
          </p>
        </div>
      )}

      {log.user_agent && (
        <div>
          <label_1.Label className="text-sm font-medium">User Agent</label_1.Label>
          <p className="text-sm mt-1 font-mono break-all">{log.user_agent}</p>
        </div>
      )}

      {log.metadata && Object.keys(log.metadata).length > 0 && (
        <div>
          <label_1.Label className="text-sm font-medium">Metadados</label_1.Label>
          <pre className="text-xs mt-1 p-2 bg-muted rounded overflow-auto">
            {JSON.stringify(log.metadata, null, 2)}
          </pre>
        </div>
      )}

      {log.checksum && (
        <div>
          <label_1.Label className="text-sm font-medium">Checksum (Integridade)</label_1.Label>
          <p className="text-xs font-mono mt-1 break-all">{log.checksum}</p>
        </div>
      )}
    </div>
  );
}
// =====================================================
// HELPER FUNCTIONS
// =====================================================
/**
 * Retorna a variante do badge baseada na severidade
 */
function getSeverityVariant(severity) {
  switch (severity) {
    case audit_system_1.AuditSeverity.CRITICAL:
      return "destructive";
    case audit_system_1.AuditSeverity.HIGH:
      return "destructive";
    case audit_system_1.AuditSeverity.MEDIUM:
      return "secondary";
    case audit_system_1.AuditSeverity.LOW:
      return "outline";
    default:
      return "default";
  }
}
/**
 * Retorna a variante do badge baseada no status do alerta
 */
function getStatusVariant(status) {
  switch (status) {
    case "open":
      return "destructive";
    case "investigating":
      return "secondary";
    case "resolved":
      return "outline";
    case "false_positive":
      return "outline";
    default:
      return "default";
  }
}
/**
 * Retorna o label do status do alerta
 */
function getStatusLabel(status) {
  switch (status) {
    case "open":
      return "Aberto";
    case "investigating":
      return "Investigando";
    case "resolved":
      return "Resolvido";
    case "false_positive":
      return "Falso Positivo";
    default:
      return status;
  }
}
exports.default = AuditDashboard;

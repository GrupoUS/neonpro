"use client";
var __spreadArray =
  (this && this.__spreadArray) ||
  ((to, from, pack) => {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditTrailPanel = AuditTrailPanel;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var badge_1 = require("@/components/ui/badge");
var alert_1 = require("@/components/ui/alert");
var tabs_1 = require("@/components/ui/tabs");
var table_1 = require("@/components/ui/table");
var dialog_1 = require("@/components/ui/dialog");
var select_1 = require("@/components/ui/select");
var lucide_react_1 = require("lucide-react");
var useLGPD_1 = require("@/hooks/useLGPD");
function AuditTrailPanel(_a) {
  var className = _a.className;
  var _b = (0, useLGPD_1.useAuditTrail)(),
    events = _b.events,
    isLoading = _b.isLoading,
    error = _b.error,
    exportAuditTrail = _b.exportAuditTrail,
    refreshData = _b.refreshData;
  var _c = (0, react_1.useState)(""),
    searchTerm = _c[0],
    setSearchTerm = _c[1];
  var _d = (0, react_1.useState)("all"),
    actionFilter = _d[0],
    setActionFilter = _d[1];
  var _e = (0, react_1.useState)("all"),
    entityFilter = _e[0],
    setEntityFilter = _e[1];
  var _f = (0, react_1.useState)("all"),
    userFilter = _f[0],
    setUserFilter = _f[1];
  var _g = (0, react_1.useState)("7d"),
    dateRange = _g[0],
    setDateRange = _g[1];
  var _h = (0, react_1.useState)(null),
    selectedEvent = _h[0],
    setSelectedEvent = _h[1];
  // Filtrar eventos
  var filteredEvents =
    (events === null || events === void 0
      ? void 0
      : events.filter((event) => {
          var _a, _b, _c, _d;
          var matchesSearch =
            ((_a = event.action) === null || _a === void 0
              ? void 0
              : _a.toLowerCase().includes(searchTerm.toLowerCase())) ||
            ((_b = event.entity_type) === null || _b === void 0
              ? void 0
              : _b.toLowerCase().includes(searchTerm.toLowerCase())) ||
            ((_c = event.details) === null || _c === void 0
              ? void 0
              : _c.toLowerCase().includes(searchTerm.toLowerCase())) ||
            ((_d = event.user_id) === null || _d === void 0
              ? void 0
              : _d.toLowerCase().includes(searchTerm.toLowerCase()));
          var matchesAction = actionFilter === "all" || event.action === actionFilter;
          var matchesEntity = entityFilter === "all" || event.entity_type === entityFilter;
          var matchesUser = userFilter === "all" || event.user_id === userFilter;
          // Filtro de data
          var eventDate = new Date(event.timestamp);
          var now = new Date();
          var matchesDate = true;
          switch (dateRange) {
            case "1d":
              matchesDate = now.getTime() - eventDate.getTime() <= 24 * 60 * 60 * 1000;
              break;
            case "7d":
              matchesDate = now.getTime() - eventDate.getTime() <= 7 * 24 * 60 * 60 * 1000;
              break;
            case "30d":
              matchesDate = now.getTime() - eventDate.getTime() <= 30 * 24 * 60 * 60 * 1000;
              break;
            case "90d":
              matchesDate = now.getTime() - eventDate.getTime() <= 90 * 24 * 60 * 60 * 1000;
              break;
          }
          return matchesSearch && matchesAction && matchesEntity && matchesUser && matchesDate;
        })) || [];
  var getActionBadge = (action) => {
    switch (action) {
      case "create":
        return (
          <badge_1.Badge variant="default" className="bg-green-600">
            <lucide_react_1.CheckCircle className="h-3 w-3 mr-1" />
            Criar
          </badge_1.Badge>
        );
      case "read":
      case "view":
        return (
          <badge_1.Badge variant="outline">
            <lucide_react_1.Eye className="h-3 w-3 mr-1" />
            Visualizar
          </badge_1.Badge>
        );
      case "update":
      case "edit":
        return (
          <badge_1.Badge variant="secondary">
            <lucide_react_1.Settings className="h-3 w-3 mr-1" />
            Atualizar
          </badge_1.Badge>
        );
      case "delete":
        return (
          <badge_1.Badge variant="destructive">
            <lucide_react_1.XCircle className="h-3 w-3 mr-1" />
            Excluir
          </badge_1.Badge>
        );
      case "export":
        return (
          <badge_1.Badge variant="outline" className="bg-blue-50 text-blue-700">
            <lucide_react_1.Download className="h-3 w-3 mr-1" />
            Exportar
          </badge_1.Badge>
        );
      case "login":
        return (
          <badge_1.Badge variant="outline" className="bg-green-50 text-green-700">
            <lucide_react_1.User className="h-3 w-3 mr-1" />
            Login
          </badge_1.Badge>
        );
      case "logout":
        return (
          <badge_1.Badge variant="outline" className="bg-gray-50 text-gray-700">
            <lucide_react_1.User className="h-3 w-3 mr-1" />
            Logout
          </badge_1.Badge>
        );
      case "consent_given":
        return (
          <badge_1.Badge variant="default" className="bg-green-600">
            <lucide_react_1.CheckCircle className="h-3 w-3 mr-1" />
            Consentimento
          </badge_1.Badge>
        );
      case "consent_withdrawn":
        return (
          <badge_1.Badge variant="destructive">
            <lucide_react_1.XCircle className="h-3 w-3 mr-1" />
            Retirada
          </badge_1.Badge>
        );
      case "data_request":
        return (
          <badge_1.Badge variant="outline" className="bg-purple-50 text-purple-700">
            <lucide_react_1.FileText className="h-3 w-3 mr-1" />
            Solicitação
          </badge_1.Badge>
        );
      case "breach_reported":
        return (
          <badge_1.Badge variant="destructive">
            <lucide_react_1.AlertTriangle className="h-3 w-3 mr-1" />
            Violação
          </badge_1.Badge>
        );
      default:
        return (
          <badge_1.Badge variant="secondary">
            <lucide_react_1.Activity className="h-3 w-3 mr-1" />
            {action}
          </badge_1.Badge>
        );
    }
  };
  var getEntityIcon = (entityType) => {
    switch (entityType) {
      case "user":
        return <lucide_react_1.User className="h-4 w-4" />;
      case "consent":
        return <lucide_react_1.Shield className="h-4 w-4" />;
      case "data_request":
        return <lucide_react_1.FileText className="h-4 w-4" />;
      case "breach_incident":
        return <lucide_react_1.AlertTriangle className="h-4 w-4" />;
      case "assessment":
        return <lucide_react_1.BarChart3 className="h-4 w-4" />;
      case "system":
        return <lucide_react_1.Database className="h-4 w-4" />;
      default:
        return <lucide_react_1.Activity className="h-4 w-4" />;
    }
  };
  var getSeverityColor = (severity) => {
    switch (severity) {
      case "low":
        return "text-green-600";
      case "medium":
        return "text-yellow-600";
      case "high":
        return "text-orange-600";
      case "critical":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };
  // Calcular estatísticas
  var stats = {
    total: (events === null || events === void 0 ? void 0 : events.length) || 0,
    today:
      (events === null || events === void 0
        ? void 0
        : events.filter((e) => {
            var eventDate = new Date(e.timestamp);
            var today = new Date();
            return eventDate.toDateString() === today.toDateString();
          }).length) || 0,
    thisWeek:
      (events === null || events === void 0
        ? void 0
        : events.filter((e) => {
            var eventDate = new Date(e.timestamp);
            var weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            return eventDate >= weekAgo;
          }).length) || 0,
    uniqueUsers:
      new Set(
        events === null || events === void 0
          ? void 0
          : events.map((e) => e.user_id).filter(Boolean),
      ).size || 0,
  };
  // Obter listas únicas para filtros
  var uniqueActions =
    __spreadArray(
      [],
      new Set(
        events === null || events === void 0 ? void 0 : events.map((e) => e.action).filter(Boolean),
      ),
      true,
    ) || [];
  var uniqueEntities =
    __spreadArray(
      [],
      new Set(
        events === null || events === void 0
          ? void 0
          : events.map((e) => e.entity_type).filter(Boolean),
      ),
      true,
    ) || [];
  var uniqueUsers =
    __spreadArray(
      [],
      new Set(
        events === null || events === void 0
          ? void 0
          : events.map((e) => e.user_id).filter(Boolean),
      ),
      true,
    ) || [];
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <lucide_react_1.RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando trilha de auditoria...</span>
      </div>
    );
  }
  if (error) {
    return (
      <alert_1.Alert variant="destructive">
        <lucide_react_1.AlertTriangle className="h-4 w-4" />
        <alert_1.AlertDescription>
          Erro ao carregar trilha de auditoria: {error}
        </alert_1.AlertDescription>
      </alert_1.Alert>
    );
  }
  return (
    <div className={className}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold">Trilha de Auditoria LGPD</h3>
          <p className="text-muted-foreground">
            Monitore todas as atividades relacionadas à conformidade LGPD
          </p>
        </div>
        <div className="flex gap-2">
          <button_1.Button variant="outline" onClick={refreshData}>
            <lucide_react_1.RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </button_1.Button>
          <button_1.Button variant="outline" onClick={exportAuditTrail}>
            <lucide_react_1.Download className="h-4 w-4 mr-2" />
            Exportar
          </button_1.Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Eventos</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <lucide_react_1.Activity className="h-8 w-8 text-blue-600" />
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hoje</p>
                <p className="text-2xl font-bold">{stats.today}</p>
              </div>
              <lucide_react_1.Calendar className="h-8 w-8 text-green-600" />
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Esta Semana</p>
                <p className="text-2xl font-bold">{stats.thisWeek}</p>
              </div>
              <lucide_react_1.TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Usuários Únicos</p>
                <p className="text-2xl font-bold">{stats.uniqueUsers}</p>
              </div>
              <lucide_react_1.User className="h-8 w-8 text-orange-600" />
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      <tabs_1.Tabs defaultValue="events" className="space-y-4">
        <tabs_1.TabsList>
          <tabs_1.TabsTrigger value="events">Eventos</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="analytics">Análises</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="events" className="space-y-4">
          {/* Filtros */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Filtros</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div>
                  <label_1.Label htmlFor="search">Buscar</label_1.Label>
                  <div className="relative">
                    <lucide_react_1.Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input_1.Input
                      id="search"
                      placeholder="Ação, entidade, usuário..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>

                <div>
                  <label_1.Label htmlFor="action">Ação</label_1.Label>
                  <select_1.Select value={actionFilter} onValueChange={setActionFilter}>
                    <select_1.SelectTrigger>
                      <select_1.SelectValue placeholder="Todas as ações" />
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="all">Todas</select_1.SelectItem>
                      {uniqueActions.map((action) => (
                        <select_1.SelectItem key={action} value={action}>
                          {action}
                        </select_1.SelectItem>
                      ))}
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>

                <div>
                  <label_1.Label htmlFor="entity">Entidade</label_1.Label>
                  <select_1.Select value={entityFilter} onValueChange={setEntityFilter}>
                    <select_1.SelectTrigger>
                      <select_1.SelectValue placeholder="Todas as entidades" />
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="all">Todas</select_1.SelectItem>
                      {uniqueEntities.map((entity) => (
                        <select_1.SelectItem key={entity} value={entity}>
                          {entity}
                        </select_1.SelectItem>
                      ))}
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>

                <div>
                  <label_1.Label htmlFor="user">Usuário</label_1.Label>
                  <select_1.Select value={userFilter} onValueChange={setUserFilter}>
                    <select_1.SelectTrigger>
                      <select_1.SelectValue placeholder="Todos os usuários" />
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="all">Todos</select_1.SelectItem>
                      {uniqueUsers.map((user) => (
                        <select_1.SelectItem key={user} value={user}>
                          {user}
                        </select_1.SelectItem>
                      ))}
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>

                <div>
                  <label_1.Label htmlFor="date">Período</label_1.Label>
                  <select_1.Select value={dateRange} onValueChange={setDateRange}>
                    <select_1.SelectTrigger>
                      <select_1.SelectValue placeholder="Período" />
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="1d">Último dia</select_1.SelectItem>
                      <select_1.SelectItem value="7d">Últimos 7 dias</select_1.SelectItem>
                      <select_1.SelectItem value="30d">Últimos 30 dias</select_1.SelectItem>
                      <select_1.SelectItem value="90d">Últimos 90 dias</select_1.SelectItem>
                      <select_1.SelectItem value="all">Todos</select_1.SelectItem>
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>

                <div className="flex items-end">
                  <button_1.Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setActionFilter("all");
                      setEntityFilter("all");
                      setUserFilter("all");
                      setDateRange("7d");
                    }}
                  >
                    <lucide_react_1.Filter className="h-4 w-4 mr-2" />
                    Limpar
                  </button_1.Button>
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          {/* Tabela de eventos */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Eventos de Auditoria ({filteredEvents.length})</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <table_1.Table>
                <table_1.TableHeader>
                  <table_1.TableRow>
                    <table_1.TableHead>Timestamp</table_1.TableHead>
                    <table_1.TableHead>Ação</table_1.TableHead>
                    <table_1.TableHead>Entidade</table_1.TableHead>
                    <table_1.TableHead>Usuário</table_1.TableHead>
                    <table_1.TableHead>Detalhes</table_1.TableHead>
                    <table_1.TableHead>IP</table_1.TableHead>
                    <table_1.TableHead>Ações</table_1.TableHead>
                  </table_1.TableRow>
                </table_1.TableHeader>
                <table_1.TableBody>
                  {filteredEvents.map((event) => (
                    <table_1.TableRow key={event.id}>
                      <table_1.TableCell>
                        <div className="flex items-center gap-2">
                          <lucide_react_1.Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-sm font-medium">
                              {new Date(event.timestamp).toLocaleDateString("pt-BR")}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(event.timestamp).toLocaleTimeString("pt-BR")}
                            </div>
                          </div>
                        </div>
                      </table_1.TableCell>
                      <table_1.TableCell>{getActionBadge(event.action)}</table_1.TableCell>
                      <table_1.TableCell>
                        <div className="flex items-center gap-2">
                          {getEntityIcon(event.entity_type)}
                          <span className="text-sm">{event.entity_type}</span>
                        </div>
                      </table_1.TableCell>
                      <table_1.TableCell>
                        <div className="flex items-center gap-2">
                          <lucide_react_1.User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{event.user_id || "Sistema"}</span>
                        </div>
                      </table_1.TableCell>
                      <table_1.TableCell>
                        <div className="max-w-xs">
                          <p className="text-sm truncate" title={event.details}>
                            {event.details}
                          </p>
                        </div>
                      </table_1.TableCell>
                      <table_1.TableCell>
                        <span className="text-xs text-muted-foreground font-mono">
                          {event.ip_address || "-"}
                        </span>
                      </table_1.TableCell>
                      <table_1.TableCell>
                        <dialog_1.Dialog>
                          <dialog_1.DialogTrigger asChild>
                            <button_1.Button size="sm" variant="outline">
                              <lucide_react_1.Eye className="h-3 w-3 mr-1" />
                              Ver
                            </button_1.Button>
                          </dialog_1.DialogTrigger>
                          <dialog_1.DialogContent className="max-w-2xl">
                            <dialog_1.DialogHeader>
                              <dialog_1.DialogTitle className="flex items-center gap-2">
                                {getActionBadge(event.action)}
                                Detalhes do Evento
                              </dialog_1.DialogTitle>
                              <dialog_1.DialogDescription>
                                {new Date(event.timestamp).toLocaleString("pt-BR")}
                              </dialog_1.DialogDescription>
                            </dialog_1.DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label_1.Label>Ação</label_1.Label>
                                  <p className="text-sm font-medium">{event.action}</p>
                                </div>
                                <div>
                                  <label_1.Label>Tipo de Entidade</label_1.Label>
                                  <p className="text-sm">{event.entity_type}</p>
                                </div>
                                <div>
                                  <label_1.Label>ID da Entidade</label_1.Label>
                                  <p className="text-sm font-mono">{event.entity_id || "-"}</p>
                                </div>
                                <div>
                                  <label_1.Label>Usuário</label_1.Label>
                                  <p className="text-sm">{event.user_id || "Sistema"}</p>
                                </div>
                                <div>
                                  <label_1.Label>Endereço IP</label_1.Label>
                                  <p className="text-sm font-mono">{event.ip_address || "-"}</p>
                                </div>
                                <div>
                                  <label_1.Label>User Agent</label_1.Label>
                                  <p className="text-sm truncate" title={event.user_agent}>
                                    {event.user_agent || "-"}
                                  </p>
                                </div>
                              </div>

                              <div>
                                <label_1.Label>Detalhes</label_1.Label>
                                <p className="text-sm bg-muted p-3 rounded mt-1">{event.details}</p>
                              </div>

                              {event.metadata && (
                                <div>
                                  <label_1.Label>Metadados</label_1.Label>
                                  <pre className="text-xs bg-muted p-3 rounded mt-1 overflow-auto max-h-40">
                                    {JSON.stringify(event.metadata, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </dialog_1.DialogContent>
                        </dialog_1.Dialog>
                      </table_1.TableCell>
                    </table_1.TableRow>
                  ))}
                </table_1.TableBody>
              </table_1.Table>

              {filteredEvents.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum evento encontrado
                </div>
              )}
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ações mais frequentes */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Ações Mais Frequentes</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-3">
                  {Object.entries(
                    (events === null || events === void 0
                      ? void 0
                      : events.reduce((acc, event) => {
                          acc[event.action] = (acc[event.action] || 0) + 1;
                          return acc;
                        }, {})) || {},
                  )
                    .sort((_a, _b) => {
                      var a = _a[1];
                      var b = _b[1];
                      return b - a;
                    })
                    .slice(0, 5)
                    .map((_a) => {
                      var action = _a[0],
                        count = _a[1];
                      return (
                        <div key={action} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">{getActionBadge(action)}</div>
                          <badge_1.Badge variant="outline">{count}</badge_1.Badge>
                        </div>
                      );
                    })}
                </div>
              </card_1.CardContent>
            </card_1.Card>

            {/* Entidades mais acessadas */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Entidades Mais Acessadas</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-3">
                  {Object.entries(
                    (events === null || events === void 0
                      ? void 0
                      : events.reduce((acc, event) => {
                          acc[event.entity_type] = (acc[event.entity_type] || 0) + 1;
                          return acc;
                        }, {})) || {},
                  )
                    .sort((_a, _b) => {
                      var a = _a[1];
                      var b = _b[1];
                      return b - a;
                    })
                    .slice(0, 5)
                    .map((_a) => {
                      var entity = _a[0],
                        count = _a[1];
                      return (
                        <div key={entity} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getEntityIcon(entity)}
                            <span className="text-sm">{entity}</span>
                          </div>
                          <badge_1.Badge variant="outline">{count}</badge_1.Badge>
                        </div>
                      );
                    })}
                </div>
              </card_1.CardContent>
            </card_1.Card>

            {/* Usuários mais ativos */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Usuários Mais Ativos</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-3">
                  {Object.entries(
                    (events === null || events === void 0
                      ? void 0
                      : events.reduce((acc, event) => {
                          var user = event.user_id || "Sistema";
                          acc[user] = (acc[user] || 0) + 1;
                          return acc;
                        }, {})) || {},
                  )
                    .sort((_a, _b) => {
                      var a = _a[1];
                      var b = _b[1];
                      return b - a;
                    })
                    .slice(0, 5)
                    .map((_a) => {
                      var user = _a[0],
                        count = _a[1];
                      return (
                        <div key={user} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <lucide_react_1.User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{user}</span>
                          </div>
                          <badge_1.Badge variant="outline">{count}</badge_1.Badge>
                        </div>
                      );
                    })}
                </div>
              </card_1.CardContent>
            </card_1.Card>

            {/* Atividade por período */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Atividade por Período</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Últimas 24h</span>
                    <badge_1.Badge variant="outline">
                      {(events === null || events === void 0
                        ? void 0
                        : events.filter((e) => {
                            var eventDate = new Date(e.timestamp);
                            var dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                            return eventDate >= dayAgo;
                          }).length) || 0}
                    </badge_1.Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Últimos 7 dias</span>
                    <badge_1.Badge variant="outline">
                      {(events === null || events === void 0
                        ? void 0
                        : events.filter((e) => {
                            var eventDate = new Date(e.timestamp);
                            var weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                            return eventDate >= weekAgo;
                          }).length) || 0}
                    </badge_1.Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Últimos 30 dias</span>
                    <badge_1.Badge variant="outline">
                      {(events === null || events === void 0
                        ? void 0
                        : events.filter((e) => {
                            var eventDate = new Date(e.timestamp);
                            var monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                            return eventDate >= monthAgo;
                          }).length) || 0}
                    </badge_1.Badge>
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>
  );
}

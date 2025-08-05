"use client";
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      ((t) => {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.hasOwn(s, p)) t[p] = s[p];
        }
        return t;
      });
    return __assign.apply(this, arguments);
  };
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
exports.BreachManagementPanel = BreachManagementPanel;
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
var textarea_1 = require("@/components/ui/textarea");
var lucide_react_1 = require("lucide-react");
var useLGPD_1 = require("@/hooks/useLGPD");
function BreachManagementPanel(_a) {
  var className = _a.className;
  var _b = (0, useLGPD_1.useBreachManagement)(),
    incidents = _b.incidents,
    isLoading = _b.isLoading,
    error = _b.error,
    reportIncident = _b.reportIncident,
    updateIncident = _b.updateIncident,
    exportIncidents = _b.exportIncidents,
    refreshData = _b.refreshData;
  var _c = (0, react_1.useState)(""),
    searchTerm = _c[0],
    setSearchTerm = _c[1];
  var _d = (0, react_1.useState)("all"),
    statusFilter = _d[0],
    setStatusFilter = _d[1];
  var _e = (0, react_1.useState)("all"),
    severityFilter = _e[0],
    setSeverityFilter = _e[1];
  var _f = (0, react_1.useState)(null),
    selectedIncident = _f[0],
    setSelectedIncident = _f[1];
  var _g = (0, react_1.useState)(false),
    isCreateOpen = _g[0],
    setIsCreateOpen = _g[1];
  var _h = (0, react_1.useState)(false),
    isEditOpen = _h[0],
    setIsEditOpen = _h[1];
  var _j = (0, react_1.useState)({
      title: "",
      description: "",
      severity: "medium",
      affected_data_types: [],
      affected_individuals_count: 0,
      discovery_method: "",
      containment_actions: "",
      notification_required: false,
    }),
    newIncident = _j[0],
    setNewIncident = _j[1];
  // Filtrar incidentes
  var filteredIncidents =
    (incidents === null || incidents === void 0
      ? void 0
      : incidents.filter((incident) => {
          var _a, _b;
          var matchesSearch =
            ((_a = incident.title) === null || _a === void 0
              ? void 0
              : _a.toLowerCase().includes(searchTerm.toLowerCase())) ||
            ((_b = incident.description) === null || _b === void 0
              ? void 0
              : _b.toLowerCase().includes(searchTerm.toLowerCase()));
          var matchesStatus = statusFilter === "all" || incident.status === statusFilter;
          var matchesSeverity = severityFilter === "all" || incident.severity === severityFilter;
          return matchesSearch && matchesStatus && matchesSeverity;
        })) || [];
  var getSeverityBadge = (severity) => {
    switch (severity) {
      case "low":
        return (
          <badge_1.Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Baixa
          </badge_1.Badge>
        );
      case "medium":
        return (
          <badge_1.Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            Média
          </badge_1.Badge>
        );
      case "high":
        return (
          <badge_1.Badge
            variant="outline"
            className="bg-orange-50 text-orange-700 border-orange-200"
          >
            Alta
          </badge_1.Badge>
        );
      case "critical":
        return <badge_1.Badge variant="destructive">Crítica</badge_1.Badge>;
      default:
        return <badge_1.Badge variant="secondary">{severity}</badge_1.Badge>;
    }
  };
  var getStatusBadge = (status) => {
    switch (status) {
      case "reported":
        return (
          <badge_1.Badge variant="secondary">
            <lucide_react_1.Bell className="h-3 w-3 mr-1" />
            Reportado
          </badge_1.Badge>
        );
      case "investigating":
        return (
          <badge_1.Badge variant="default">
            <lucide_react_1.Search className="h-3 w-3 mr-1" />
            Investigando
          </badge_1.Badge>
        );
      case "contained":
        return (
          <badge_1.Badge variant="outline">
            <lucide_react_1.Shield className="h-3 w-3 mr-1" />
            Contido
          </badge_1.Badge>
        );
      case "resolved":
        return (
          <badge_1.Badge variant="outline" className="bg-green-50 text-green-700">
            <lucide_react_1.CheckCircle className="h-3 w-3 mr-1" />
            Resolvido
          </badge_1.Badge>
        );
      case "closed":
        return (
          <badge_1.Badge variant="outline">
            <lucide_react_1.XCircle className="h-3 w-3 mr-1" />
            Fechado
          </badge_1.Badge>
        );
      default:
        return <badge_1.Badge variant="secondary">{status}</badge_1.Badge>;
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
  var handleCreateIncident = () =>
    __awaiter(this, void 0, void 0, function () {
      var error_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, reportIncident(newIncident)];
          case 1:
            _a.sent();
            setIsCreateOpen(false);
            setNewIncident({
              title: "",
              description: "",
              severity: "medium",
              affected_data_types: [],
              affected_individuals_count: 0,
              discovery_method: "",
              containment_actions: "",
              notification_required: false,
            });
            return [3 /*break*/, 3];
          case 2:
            error_1 = _a.sent();
            console.error("Erro ao reportar incidente:", error_1);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  var handleUpdateIncident = (id, updates) =>
    __awaiter(this, void 0, void 0, function () {
      var error_2;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, updateIncident(id, updates)];
          case 1:
            _a.sent();
            setIsEditOpen(false);
            setSelectedIncident(null);
            return [3 /*break*/, 3];
          case 2:
            error_2 = _a.sent();
            console.error("Erro ao atualizar incidente:", error_2);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  // Calcular estatísticas
  var stats = {
    total: (incidents === null || incidents === void 0 ? void 0 : incidents.length) || 0,
    active:
      (incidents === null || incidents === void 0
        ? void 0
        : incidents.filter((i) => !["resolved", "closed"].includes(i.status)).length) || 0,
    critical:
      (incidents === null || incidents === void 0
        ? void 0
        : incidents.filter((i) => i.severity === "critical").length) || 0,
    thisMonth:
      (incidents === null || incidents === void 0
        ? void 0
        : incidents.filter((i) => {
            var incidentDate = new Date(i.created_at);
            var now = new Date();
            return (
              incidentDate.getMonth() === now.getMonth() &&
              incidentDate.getFullYear() === now.getFullYear()
            );
          }).length) || 0,
  };
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <lucide_react_1.RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando incidentes...</span>
      </div>
    );
  }
  if (error) {
    return (
      <alert_1.Alert variant="destructive">
        <lucide_react_1.AlertTriangle className="h-4 w-4" />
        <alert_1.AlertDescription>Erro ao carregar incidentes: {error}</alert_1.AlertDescription>
      </alert_1.Alert>
    );
  }
  return (
    <div className={className}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold">Gestão de Incidentes de Violação</h3>
          <p className="text-muted-foreground">
            Monitore e gerencie incidentes de violação de dados pessoais
          </p>
        </div>
        <div className="flex gap-2">
          <button_1.Button variant="outline" onClick={refreshData}>
            <lucide_react_1.RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </button_1.Button>
          <button_1.Button variant="outline" onClick={exportIncidents}>
            <lucide_react_1.Download className="h-4 w-4 mr-2" />
            Exportar
          </button_1.Button>
          <dialog_1.Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <dialog_1.DialogTrigger asChild>
              <button_1.Button>
                <lucide_react_1.Plus className="h-4 w-4 mr-2" />
                Reportar Incidente
              </button_1.Button>
            </dialog_1.DialogTrigger>
            <dialog_1.DialogContent className="max-w-2xl">
              <dialog_1.DialogHeader>
                <dialog_1.DialogTitle>Reportar Novo Incidente</dialog_1.DialogTitle>
                <dialog_1.DialogDescription>
                  Registre um novo incidente de violação de dados pessoais
                </dialog_1.DialogDescription>
              </dialog_1.DialogHeader>
              <div className="space-y-4">
                <div>
                  <label_1.Label htmlFor="title">Título do Incidente</label_1.Label>
                  <input_1.Input
                    id="title"
                    value={newIncident.title}
                    onChange={(e) =>
                      setNewIncident(__assign(__assign({}, newIncident), { title: e.target.value }))
                    }
                    placeholder="Ex: Acesso não autorizado ao banco de dados"
                  />
                </div>

                <div>
                  <label_1.Label htmlFor="description">Descrição</label_1.Label>
                  <textarea_1.Textarea
                    id="description"
                    value={newIncident.description}
                    onChange={(e) =>
                      setNewIncident(
                        __assign(__assign({}, newIncident), { description: e.target.value }),
                      )
                    }
                    placeholder="Descreva detalhadamente o incidente..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label_1.Label htmlFor="severity">Severidade</label_1.Label>
                    <select_1.Select
                      value={newIncident.severity}
                      onValueChange={(value) =>
                        setNewIncident(__assign(__assign({}, newIncident), { severity: value }))
                      }
                    >
                      <select_1.SelectTrigger>
                        <select_1.SelectValue placeholder="Selecione a severidade" />
                      </select_1.SelectTrigger>
                      <select_1.SelectContent>
                        <select_1.SelectItem value="low">Baixa</select_1.SelectItem>
                        <select_1.SelectItem value="medium">Média</select_1.SelectItem>
                        <select_1.SelectItem value="high">Alta</select_1.SelectItem>
                        <select_1.SelectItem value="critical">Crítica</select_1.SelectItem>
                      </select_1.SelectContent>
                    </select_1.Select>
                  </div>

                  <div>
                    <label_1.Label htmlFor="count">Indivíduos Afetados</label_1.Label>
                    <input_1.Input
                      id="count"
                      type="number"
                      value={newIncident.affected_individuals_count}
                      onChange={(e) =>
                        setNewIncident(
                          __assign(__assign({}, newIncident), {
                            affected_individuals_count: parseInt(e.target.value) || 0,
                          }),
                        )
                      }
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label_1.Label htmlFor="discovery">Método de Descoberta</label_1.Label>
                  <input_1.Input
                    id="discovery"
                    value={newIncident.discovery_method}
                    onChange={(e) =>
                      setNewIncident(
                        __assign(__assign({}, newIncident), { discovery_method: e.target.value }),
                      )
                    }
                    placeholder="Ex: Monitoramento de segurança, relatório de usuário"
                  />
                </div>

                <div>
                  <label_1.Label htmlFor="containment">Ações de Contenção</label_1.Label>
                  <textarea_1.Textarea
                    id="containment"
                    value={newIncident.containment_actions}
                    onChange={(e) =>
                      setNewIncident(
                        __assign(__assign({}, newIncident), {
                          containment_actions: e.target.value,
                        }),
                      )
                    }
                    placeholder="Descreva as ações tomadas para conter o incidente..."
                    rows={2}
                  />
                </div>
              </div>
              <dialog_1.DialogFooter>
                <button_1.Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancelar
                </button_1.Button>
                <button_1.Button onClick={handleCreateIncident}>Reportar Incidente</button_1.Button>
              </dialog_1.DialogFooter>
            </dialog_1.DialogContent>
          </dialog_1.Dialog>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Incidentes</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <lucide_react_1.FileText className="h-8 w-8 text-blue-600" />
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Incidentes Ativos</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
              <lucide_react_1.AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Incidentes Críticos</p>
                <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
              </div>
              <lucide_react_1.Shield className="h-8 w-8 text-red-600" />
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Este Mês</p>
                <p className="text-2xl font-bold">{stats.thisMonth}</p>
              </div>
              <lucide_react_1.Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Alertas para incidentes críticos */}
      {(incidents === null || incidents === void 0
        ? void 0
        : incidents.filter(
            (i) => i.severity === "critical" && !["resolved", "closed"].includes(i.status),
          ).length) > 0 && (
        <alert_1.Alert variant="destructive" className="mb-6">
          <lucide_react_1.AlertTriangle className="h-4 w-4" />
          <alert_1.AlertDescription>
            <strong>Atenção:</strong> Existem{" "}
            {
              incidents.filter(
                (i) => i.severity === "critical" && !["resolved", "closed"].includes(i.status),
              ).length
            }{" "}
            incidente(s) crítico(s) que requerem atenção imediata.
          </alert_1.AlertDescription>
        </alert_1.Alert>
      )}

      <tabs_1.Tabs defaultValue="incidents" className="space-y-4">
        <tabs_1.TabsList>
          <tabs_1.TabsTrigger value="incidents">Incidentes</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="timeline">Linha do Tempo</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="incidents" className="space-y-4">
          {/* Filtros */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Filtros</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label_1.Label htmlFor="search">Buscar</label_1.Label>
                  <div className="relative">
                    <lucide_react_1.Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input_1.Input
                      id="search"
                      placeholder="Título ou descrição..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>

                <div>
                  <label_1.Label htmlFor="status">Status</label_1.Label>
                  <select_1.Select value={statusFilter} onValueChange={setStatusFilter}>
                    <select_1.SelectTrigger>
                      <select_1.SelectValue placeholder="Todos os status" />
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="all">Todos</select_1.SelectItem>
                      <select_1.SelectItem value="reported">Reportado</select_1.SelectItem>
                      <select_1.SelectItem value="investigating">Investigando</select_1.SelectItem>
                      <select_1.SelectItem value="contained">Contido</select_1.SelectItem>
                      <select_1.SelectItem value="resolved">Resolvido</select_1.SelectItem>
                      <select_1.SelectItem value="closed">Fechado</select_1.SelectItem>
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>

                <div>
                  <label_1.Label htmlFor="severity">Severidade</label_1.Label>
                  <select_1.Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <select_1.SelectTrigger>
                      <select_1.SelectValue placeholder="Todas as severidades" />
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="all">Todas</select_1.SelectItem>
                      <select_1.SelectItem value="low">Baixa</select_1.SelectItem>
                      <select_1.SelectItem value="medium">Média</select_1.SelectItem>
                      <select_1.SelectItem value="high">Alta</select_1.SelectItem>
                      <select_1.SelectItem value="critical">Crítica</select_1.SelectItem>
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>

                <div className="flex items-end">
                  <button_1.Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                      setSeverityFilter("all");
                    }}
                  >
                    <lucide_react_1.Filter className="h-4 w-4 mr-2" />
                    Limpar
                  </button_1.Button>
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          {/* Tabela de incidentes */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Lista de Incidentes ({filteredIncidents.length})</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <table_1.Table>
                <table_1.TableHeader>
                  <table_1.TableRow>
                    <table_1.TableHead>Incidente</table_1.TableHead>
                    <table_1.TableHead>Severidade</table_1.TableHead>
                    <table_1.TableHead>Status</table_1.TableHead>
                    <table_1.TableHead>Indivíduos Afetados</table_1.TableHead>
                    <table_1.TableHead>Data de Reporte</table_1.TableHead>
                    <table_1.TableHead>Ações</table_1.TableHead>
                  </table_1.TableRow>
                </table_1.TableHeader>
                <table_1.TableBody>
                  {filteredIncidents.map((incident) => (
                    <table_1.TableRow key={incident.id}>
                      <table_1.TableCell>
                        <div>
                          <div className="font-medium">{incident.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-2">
                            {incident.description}
                          </div>
                        </div>
                      </table_1.TableCell>
                      <table_1.TableCell>{getSeverityBadge(incident.severity)}</table_1.TableCell>
                      <table_1.TableCell>{getStatusBadge(incident.status)}</table_1.TableCell>
                      <table_1.TableCell>
                        <div className="flex items-center gap-1">
                          <lucide_react_1.Users className="h-4 w-4 text-muted-foreground" />
                          <span>{incident.affected_individuals_count || 0}</span>
                        </div>
                      </table_1.TableCell>
                      <table_1.TableCell>
                        {new Date(incident.created_at).toLocaleDateString("pt-BR")}
                      </table_1.TableCell>
                      <table_1.TableCell>
                        <div className="flex gap-2">
                          <dialog_1.Dialog>
                            <dialog_1.DialogTrigger asChild>
                              <button_1.Button size="sm" variant="outline">
                                <lucide_react_1.Eye className="h-3 w-3 mr-1" />
                                Ver
                              </button_1.Button>
                            </dialog_1.DialogTrigger>
                            <dialog_1.DialogContent className="max-w-4xl">
                              <dialog_1.DialogHeader>
                                <dialog_1.DialogTitle className="flex items-center gap-2">
                                  {getSeverityBadge(incident.severity)}
                                  {incident.title}
                                </dialog_1.DialogTitle>
                                <dialog_1.DialogDescription>
                                  Incidente reportado em{" "}
                                  {new Date(incident.created_at).toLocaleDateString("pt-BR")}
                                </dialog_1.DialogDescription>
                              </dialog_1.DialogHeader>
                              <div className="space-y-6">
                                {/* Informações básicas */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label_1.Label>Status Atual</label_1.Label>
                                    <div className="mt-1">{getStatusBadge(incident.status)}</div>
                                  </div>
                                  <div>
                                    <label_1.Label>Severidade</label_1.Label>
                                    <div className="mt-1">
                                      {getSeverityBadge(incident.severity)}
                                    </div>
                                  </div>
                                  <div>
                                    <label_1.Label>Indivíduos Afetados</label_1.Label>
                                    <p className="text-sm font-medium">
                                      {incident.affected_individuals_count || 0}
                                    </p>
                                  </div>
                                  <div>
                                    <label_1.Label>Notificação Requerida</label_1.Label>
                                    <p className="text-sm">
                                      {incident.notification_required ? "Sim" : "Não"}
                                    </p>
                                  </div>
                                </div>

                                {/* Descrição */}
                                <div>
                                  <label_1.Label>Descrição do Incidente</label_1.Label>
                                  <p className="text-sm mt-1 bg-muted p-3 rounded">
                                    {incident.description}
                                  </p>
                                </div>

                                {/* Tipos de dados afetados */}
                                {incident.affected_data_types &&
                                  incident.affected_data_types.length > 0 && (
                                    <div>
                                      <label_1.Label>Tipos de Dados Afetados</label_1.Label>
                                      <div className="flex flex-wrap gap-2 mt-1">
                                        {incident.affected_data_types.map((type, index) => (
                                          <badge_1.Badge key={index} variant="outline">
                                            {type}
                                          </badge_1.Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                {/* Método de descoberta */}
                                {incident.discovery_method && (
                                  <div>
                                    <label_1.Label>Método de Descoberta</label_1.Label>
                                    <p className="text-sm mt-1">{incident.discovery_method}</p>
                                  </div>
                                )}

                                {/* Ações de contenção */}
                                {incident.containment_actions && (
                                  <div>
                                    <label_1.Label>Ações de Contenção</label_1.Label>
                                    <p className="text-sm mt-1 bg-muted p-3 rounded">
                                      {incident.containment_actions}
                                    </p>
                                  </div>
                                )}

                                {/* Notificações */}
                                {incident.notifications && incident.notifications.length > 0 && (
                                  <div>
                                    <label_1.Label>Notificações Enviadas</label_1.Label>
                                    <div className="space-y-2 mt-1">
                                      {incident.notifications.map((notification, index) => (
                                        <div
                                          key={index}
                                          className="text-sm bg-muted p-2 rounded flex items-center gap-2"
                                        >
                                          {notification.type === "email"
                                            ? <lucide_react_1.Mail className="h-4 w-4" />
                                            : <lucide_react_1.Bell className="h-4 w-4" />}
                                          <span>
                                            {notification.recipient} -{" "}
                                            {notification.sent_at
                                              ? new Date(notification.sent_at).toLocaleString(
                                                  "pt-BR",
                                                )
                                              : "Pendente"}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                              <dialog_1.DialogFooter>
                                <button_1.Button
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedIncident(incident);
                                    setIsEditOpen(true);
                                  }}
                                >
                                  <lucide_react_1.Edit className="h-4 w-4 mr-2" />
                                  Editar Status
                                </button_1.Button>
                              </dialog_1.DialogFooter>
                            </dialog_1.DialogContent>
                          </dialog_1.Dialog>
                        </div>
                      </table_1.TableCell>
                    </table_1.TableRow>
                  ))}
                </table_1.TableBody>
              </table_1.Table>

              {filteredIncidents.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum incidente encontrado
                </div>
              )}
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="timeline" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Linha do Tempo dos Incidentes</card_1.CardTitle>
              <card_1.CardDescription>
                Visualização cronológica dos incidentes de violação
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                {incidents === null || incidents === void 0
                  ? void 0
                  : incidents.slice(0, 10).map((incident, index) => (
                      <div
                        key={incident.id}
                        className="flex items-start gap-4 pb-4 border-b last:border-b-0"
                      >
                        <div className="flex-shrink-0">
                          <div
                            className={"w-3 h-3 rounded-full mt-2 ".concat(
                              incident.severity === "critical"
                                ? "bg-red-500"
                                : incident.severity === "high"
                                  ? "bg-orange-500"
                                  : incident.severity === "medium"
                                    ? "bg-yellow-500"
                                    : "bg-green-500",
                            )}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{incident.title}</h4>
                            {getSeverityBadge(incident.severity)}
                            {getStatusBadge(incident.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {incident.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <lucide_react_1.Calendar className="h-3 w-3" />
                              {new Date(incident.created_at).toLocaleDateString("pt-BR")}
                            </span>
                            <span className="flex items-center gap-1">
                              <lucide_react_1.Users className="h-3 w-3" />
                              {incident.affected_individuals_count || 0} afetados
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}

                {(incidents === null || incidents === void 0 ? void 0 : incidents.length) === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum incidente registrado
                  </div>
                )}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>

      {/* Dialog para editar status */}
      <dialog_1.Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <dialog_1.DialogContent>
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>Atualizar Status do Incidente</dialog_1.DialogTitle>
            <dialog_1.DialogDescription>
              {selectedIncident === null || selectedIncident === void 0
                ? void 0
                : selectedIncident.title}
            </dialog_1.DialogDescription>
          </dialog_1.DialogHeader>
          {selectedIncident && (
            <div className="space-y-4">
              <div>
                <label_1.Label htmlFor="status">Novo Status</label_1.Label>
                <select_1.Select
                  value={selectedIncident.status}
                  onValueChange={(value) =>
                    setSelectedIncident(__assign(__assign({}, selectedIncident), { status: value }))
                  }
                >
                  <select_1.SelectTrigger>
                    <select_1.SelectValue placeholder="Selecione o status" />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="reported">Reportado</select_1.SelectItem>
                    <select_1.SelectItem value="investigating">Investigando</select_1.SelectItem>
                    <select_1.SelectItem value="contained">Contido</select_1.SelectItem>
                    <select_1.SelectItem value="resolved">Resolvido</select_1.SelectItem>
                    <select_1.SelectItem value="closed">Fechado</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
              </div>
            </div>
          )}
          <dialog_1.DialogFooter>
            <button_1.Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancelar
            </button_1.Button>
            <button_1.Button
              onClick={() =>
                selectedIncident &&
                handleUpdateIncident(selectedIncident.id, {
                  status: selectedIncident.status,
                })
              }
            >
              Atualizar
            </button_1.Button>
          </dialog_1.DialogFooter>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>
    </div>
  );
}

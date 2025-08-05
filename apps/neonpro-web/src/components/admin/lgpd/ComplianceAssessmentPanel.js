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
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
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
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
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
      return function (v) {
        return step([n, v]);
      };
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
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceAssessmentPanel = ComplianceAssessmentPanel;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var badge_1 = require("@/components/ui/badge");
var alert_1 = require("@/components/ui/alert");
var progress_1 = require("@/components/ui/progress");
var tabs_1 = require("@/components/ui/tabs");
var table_1 = require("@/components/ui/table");
var dialog_1 = require("@/components/ui/dialog");
var select_1 = require("@/components/ui/select");
var textarea_1 = require("@/components/ui/textarea");
var lucide_react_1 = require("lucide-react");
var useLGPD_1 = require("@/hooks/useLGPD");
function ComplianceAssessmentPanel(_a) {
  var _this = this;
  var _b;
  var className = _a.className;
  var _c = (0, useLGPD_1.useComplianceAssessment)(),
    assessments = _c.assessments,
    isLoading = _c.isLoading,
    error = _c.error,
    createAssessment = _c.createAssessment,
    runAutomatedAssessment = _c.runAutomatedAssessment,
    exportAssessments = _c.exportAssessments,
    refreshData = _c.refreshData;
  var _d = (0, react_1.useState)(""),
    searchTerm = _d[0],
    setSearchTerm = _d[1];
  var _e = (0, react_1.useState)("all"),
    statusFilter = _e[0],
    setStatusFilter = _e[1];
  var _f = (0, react_1.useState)("all"),
    typeFilter = _f[0],
    setTypeFilter = _f[1];
  var _g = (0, react_1.useState)(null),
    selectedAssessment = _g[0],
    setSelectedAssessment = _g[1];
  var _h = (0, react_1.useState)(false),
    isCreateOpen = _h[0],
    setIsCreateOpen = _h[1];
  var _j = (0, react_1.useState)(false),
    isRunningAutomated = _j[0],
    setIsRunningAutomated = _j[1];
  var _k = (0, react_1.useState)({
      name: "",
      description: "",
      type: "manual",
    }),
    newAssessment = _k[0],
    setNewAssessment = _k[1];
  // Filtrar avaliações
  var filteredAssessments =
    (assessments === null || assessments === void 0
      ? void 0
      : assessments.filter(function (assessment) {
          var _a, _b;
          var matchesSearch =
            ((_a = assessment.name) === null || _a === void 0
              ? void 0
              : _a.toLowerCase().includes(searchTerm.toLowerCase())) ||
            ((_b = assessment.description) === null || _b === void 0
              ? void 0
              : _b.toLowerCase().includes(searchTerm.toLowerCase()));
          var matchesStatus = statusFilter === "all" || assessment.status === statusFilter;
          var matchesType = typeFilter === "all" || assessment.type === typeFilter;
          return matchesSearch && matchesStatus && matchesType;
        })) || [];
  var getStatusBadge = function (status) {
    switch (status) {
      case "pending":
        return (
          <badge_1.Badge variant="secondary">
            <lucide_react_1.Clock className="h-3 w-3 mr-1" />
            Pendente
          </badge_1.Badge>
        );
      case "in_progress":
        return (
          <badge_1.Badge variant="default">
            <lucide_react_1.RefreshCw className="h-3 w-3 mr-1" />
            Em Execução
          </badge_1.Badge>
        );
      case "completed":
        return (
          <badge_1.Badge variant="outline">
            <lucide_react_1.CheckCircle className="h-3 w-3 mr-1" />
            Concluída
          </badge_1.Badge>
        );
      case "failed":
        return (
          <badge_1.Badge variant="destructive">
            <lucide_react_1.XCircle className="h-3 w-3 mr-1" />
            Falhou
          </badge_1.Badge>
        );
      default:
        return <badge_1.Badge variant="secondary">{status}</badge_1.Badge>;
    }
  };
  var getScoreBadge = function (score) {
    if (score >= 90)
      return (
        <badge_1.Badge variant="default" className="bg-green-600">
          Excelente
        </badge_1.Badge>
      );
    if (score >= 70)
      return (
        <badge_1.Badge variant="secondary" className="bg-yellow-600">
          Bom
        </badge_1.Badge>
      );
    if (score >= 50)
      return (
        <badge_1.Badge variant="secondary" className="bg-orange-600">
          Regular
        </badge_1.Badge>
      );
    return <badge_1.Badge variant="destructive">Crítico</badge_1.Badge>;
  };
  var getScoreColor = function (score) {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    if (score >= 50) return "text-orange-600";
    return "text-red-600";
  };
  var handleCreateAssessment = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, createAssessment(newAssessment)];
          case 1:
            _a.sent();
            setIsCreateOpen(false);
            setNewAssessment({ name: "", description: "", type: "manual" });
            return [3 /*break*/, 3];
          case 2:
            error_1 = _a.sent();
            console.error("Erro ao criar avaliação:", error_1);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  var handleRunAutomatedAssessment = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            setIsRunningAutomated(true);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            return [4 /*yield*/, runAutomatedAssessment()];
          case 2:
            _a.sent();
            return [3 /*break*/, 5];
          case 3:
            error_2 = _a.sent();
            console.error("Erro ao executar avaliação automatizada:", error_2);
            return [3 /*break*/, 5];
          case 4:
            setIsRunningAutomated(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  // Calcular estatísticas
  var stats = {
    total: (assessments === null || assessments === void 0 ? void 0 : assessments.length) || 0,
    completed:
      (assessments === null || assessments === void 0
        ? void 0
        : assessments.filter(function (a) {
            return a.status === "completed";
          }).length) || 0,
    pending:
      (assessments === null || assessments === void 0
        ? void 0
        : assessments.filter(function (a) {
            return a.status === "pending";
          }).length) || 0,
    averageScore: (assessments === null || assessments === void 0 ? void 0 : assessments.length)
      ? Math.round(
          assessments.reduce(function (sum, a) {
            return sum + (a.score || 0);
          }, 0) / assessments.length,
        )
      : 0,
  };
  var latestAssessment =
    assessments === null || assessments === void 0
      ? void 0
      : assessments.find(function (a) {
          return a.status === "completed";
        });
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <lucide_react_1.RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando avaliações...</span>
      </div>
    );
  }
  if (error) {
    return (
      <alert_1.Alert variant="destructive">
        <lucide_react_1.AlertTriangle className="h-4 w-4" />
        <alert_1.AlertDescription>Erro ao carregar avaliações: {error}</alert_1.AlertDescription>
      </alert_1.Alert>
    );
  }
  return (
    <div className={className}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold">Avaliações de Conformidade</h3>
          <p className="text-muted-foreground">
            Execute e monitore avaliações de conformidade LGPD
          </p>
        </div>
        <div className="flex gap-2">
          <button_1.Button
            variant="outline"
            onClick={handleRunAutomatedAssessment}
            disabled={isRunningAutomated}
          >
            {isRunningAutomated
              ? <lucide_react_1.RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              : <lucide_react_1.Play className="h-4 w-4 mr-2" />}
            Executar Avaliação Automatizada
          </button_1.Button>
          <button_1.Button variant="outline" onClick={refreshData}>
            <lucide_react_1.RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </button_1.Button>
          <button_1.Button variant="outline" onClick={exportAssessments}>
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
                <p className="text-sm text-muted-foreground">Total de Avaliações</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <lucide_react_1.BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Concluídas</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
              <lucide_react_1.CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <lucide_react_1.Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pontuação Média</p>
                <p className={"text-2xl font-bold ".concat(getScoreColor(stats.averageScore))}>
                  {stats.averageScore}%
                </p>
              </div>
              <lucide_react_1.Target className="h-8 w-8 text-purple-600" />
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Última avaliação */}
      {latestAssessment && (
        <card_1.Card className="mb-6">
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.Shield className="h-5 w-5" />
              Última Avaliação de Conformidade
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Pontuação Geral</h4>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={"text-3xl font-bold ".concat(
                      getScoreColor(latestAssessment.score || 0),
                    )}
                  >
                    {latestAssessment.score}%
                  </span>
                  {getScoreBadge(latestAssessment.score || 0)}
                </div>
                <progress_1.Progress value={latestAssessment.score} className="mb-2" />
                <p className="text-sm text-muted-foreground">
                  Executada em{" "}
                  {new Date(latestAssessment.completed_at || "").toLocaleDateString("pt-BR")}
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Áreas Avaliadas</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Consentimentos</span>
                    <badge_1.Badge variant="outline">95%</badge_1.Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Direitos dos Titulares</span>
                    <badge_1.Badge variant="outline">88%</badge_1.Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Segurança de Dados</span>
                    <badge_1.Badge variant="outline">92%</badge_1.Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Documentação</span>
                    <badge_1.Badge variant="outline">85%</badge_1.Badge>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Recomendações</h4>
                <div className="space-y-2">
                  {((_b = latestAssessment.recommendations) === null || _b === void 0
                    ? void 0
                    : _b.slice(0, 3).map(function (rec, index) {
                        return (
                          <div key={index} className="text-sm bg-muted p-2 rounded">
                            {rec}
                          </div>
                        );
                      })) || (
                    <div className="text-sm text-muted-foreground">
                      Nenhuma recomendação específica
                    </div>
                  )}
                </div>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      )}

      <tabs_1.Tabs defaultValue="assessments" className="space-y-4">
        <tabs_1.TabsList>
          <tabs_1.TabsTrigger value="assessments">Avaliações</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="create">Nova Avaliação</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="assessments" className="space-y-4">
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
                      placeholder="Nome ou descrição..."
                      value={searchTerm}
                      onChange={function (e) {
                        return setSearchTerm(e.target.value);
                      }}
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
                      <select_1.SelectItem value="pending">Pendente</select_1.SelectItem>
                      <select_1.SelectItem value="in_progress">Em Execução</select_1.SelectItem>
                      <select_1.SelectItem value="completed">Concluída</select_1.SelectItem>
                      <select_1.SelectItem value="failed">Falhou</select_1.SelectItem>
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>

                <div>
                  <label_1.Label htmlFor="type">Tipo</label_1.Label>
                  <select_1.Select value={typeFilter} onValueChange={setTypeFilter}>
                    <select_1.SelectTrigger>
                      <select_1.SelectValue placeholder="Todos os tipos" />
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="all">Todos</select_1.SelectItem>
                      <select_1.SelectItem value="manual">Manual</select_1.SelectItem>
                      <select_1.SelectItem value="automated">Automatizada</select_1.SelectItem>
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>

                <div className="flex items-end">
                  <button_1.Button
                    variant="outline"
                    onClick={function () {
                      setSearchTerm("");
                      setStatusFilter("all");
                      setTypeFilter("all");
                    }}
                  >
                    <lucide_react_1.Filter className="h-4 w-4 mr-2" />
                    Limpar
                  </button_1.Button>
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          {/* Tabela de avaliações */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>
                Histórico de Avaliações ({filteredAssessments.length})
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <table_1.Table>
                <table_1.TableHeader>
                  <table_1.TableRow>
                    <table_1.TableHead>Nome</table_1.TableHead>
                    <table_1.TableHead>Tipo</table_1.TableHead>
                    <table_1.TableHead>Status</table_1.TableHead>
                    <table_1.TableHead>Pontuação</table_1.TableHead>
                    <table_1.TableHead>Data de Criação</table_1.TableHead>
                    <table_1.TableHead>Concluída em</table_1.TableHead>
                    <table_1.TableHead>Ações</table_1.TableHead>
                  </table_1.TableRow>
                </table_1.TableHeader>
                <table_1.TableBody>
                  {filteredAssessments.map(function (assessment) {
                    return (
                      <table_1.TableRow key={assessment.id}>
                        <table_1.TableCell>
                          <div>
                            <div className="font-medium">{assessment.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {assessment.description}
                            </div>
                          </div>
                        </table_1.TableCell>
                        <table_1.TableCell>
                          <badge_1.Badge
                            variant={assessment.type === "automated" ? "default" : "outline"}
                          >
                            {assessment.type === "automated" ? "Automatizada" : "Manual"}
                          </badge_1.Badge>
                        </table_1.TableCell>
                        <table_1.TableCell>{getStatusBadge(assessment.status)}</table_1.TableCell>
                        <table_1.TableCell>
                          {assessment.score !== null
                            ? <div className="flex items-center gap-2">
                                <span
                                  className={"font-semibold ".concat(
                                    getScoreColor(assessment.score),
                                  )}
                                >
                                  {assessment.score}%
                                </span>
                                {getScoreBadge(assessment.score)}
                              </div>
                            : <span className="text-muted-foreground">-</span>}
                        </table_1.TableCell>
                        <table_1.TableCell>
                          {new Date(assessment.created_at).toLocaleDateString("pt-BR")}
                        </table_1.TableCell>
                        <table_1.TableCell>
                          {assessment.completed_at
                            ? new Date(assessment.completed_at).toLocaleDateString("pt-BR")
                            : <span className="text-muted-foreground">-</span>}
                        </table_1.TableCell>
                        <table_1.TableCell>
                          <dialog_1.Dialog>
                            <dialog_1.DialogTrigger asChild>
                              <button_1.Button size="sm" variant="outline">
                                <lucide_react_1.Eye className="h-3 w-3 mr-1" />
                                Ver Detalhes
                              </button_1.Button>
                            </dialog_1.DialogTrigger>
                            <dialog_1.DialogContent className="max-w-4xl">
                              <dialog_1.DialogHeader>
                                <dialog_1.DialogTitle>{assessment.name}</dialog_1.DialogTitle>
                                <dialog_1.DialogDescription>
                                  {assessment.description}
                                </dialog_1.DialogDescription>
                              </dialog_1.DialogHeader>
                              <div className="space-y-6">
                                {/* Informações gerais */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label_1.Label>Tipo</label_1.Label>
                                    <p className="text-sm">
                                      {assessment.type === "automated" ? "Automatizada" : "Manual"}
                                    </p>
                                  </div>
                                  <div>
                                    <label_1.Label>Status</label_1.Label>
                                    <div className="mt-1">{getStatusBadge(assessment.status)}</div>
                                  </div>
                                  <div>
                                    <label_1.Label>Criada em</label_1.Label>
                                    <p className="text-sm">
                                      {new Date(assessment.created_at).toLocaleString("pt-BR")}
                                    </p>
                                  </div>
                                  {assessment.completed_at && (
                                    <div>
                                      <label_1.Label>Concluída em</label_1.Label>
                                      <p className="text-sm">
                                        {new Date(assessment.completed_at).toLocaleString("pt-BR")}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                {/* Pontuação */}
                                {assessment.score !== null && (
                                  <div>
                                    <label_1.Label>Pontuação de Conformidade</label_1.Label>
                                    <div className="mt-2">
                                      <div className="flex items-center gap-2 mb-2">
                                        <span
                                          className={"text-2xl font-bold ".concat(
                                            getScoreColor(assessment.score),
                                          )}
                                        >
                                          {assessment.score}%
                                        </span>
                                        {getScoreBadge(assessment.score)}
                                      </div>
                                      <progress_1.Progress
                                        value={assessment.score}
                                        className="mb-2"
                                      />
                                    </div>
                                  </div>
                                )}

                                {/* Recomendações */}
                                {assessment.recommendations &&
                                  assessment.recommendations.length > 0 && (
                                    <div>
                                      <label_1.Label>Recomendações</label_1.Label>
                                      <div className="mt-2 space-y-2">
                                        {assessment.recommendations.map(function (rec, index) {
                                          return (
                                            <div
                                              key={index}
                                              className="text-sm bg-muted p-3 rounded"
                                            >
                                              {rec}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}

                                {/* Resultados detalhados */}
                                {assessment.results && (
                                  <div>
                                    <label_1.Label>Resultados Detalhados</label_1.Label>
                                    <div className="mt-2">
                                      <pre className="text-sm bg-muted p-3 rounded overflow-auto max-h-40">
                                        {JSON.stringify(assessment.results, null, 2)}
                                      </pre>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </dialog_1.DialogContent>
                          </dialog_1.Dialog>
                        </table_1.TableCell>
                      </table_1.TableRow>
                    );
                  })}
                </table_1.TableBody>
              </table_1.Table>

              {filteredAssessments.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma avaliação encontrada
                </div>
              )}
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="create" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Criar Nova Avaliação</card_1.CardTitle>
              <card_1.CardDescription>
                Configure uma nova avaliação de conformidade LGPD
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              <div>
                <label_1.Label htmlFor="name">Nome da Avaliação</label_1.Label>
                <input_1.Input
                  id="name"
                  value={newAssessment.name}
                  onChange={function (e) {
                    return setNewAssessment(
                      __assign(__assign({}, newAssessment), { name: e.target.value }),
                    );
                  }}
                  placeholder="Ex: Avaliação Trimestral Q1 2024"
                />
              </div>

              <div>
                <label_1.Label htmlFor="description">Descrição</label_1.Label>
                <textarea_1.Textarea
                  id="description"
                  value={newAssessment.description}
                  onChange={function (e) {
                    return setNewAssessment(
                      __assign(__assign({}, newAssessment), { description: e.target.value }),
                    );
                  }}
                  placeholder="Descreva o objetivo e escopo desta avaliação..."
                  rows={3}
                />
              </div>

              <div>
                <label_1.Label htmlFor="type">Tipo de Avaliação</label_1.Label>
                <select_1.Select
                  value={newAssessment.type}
                  onValueChange={function (value) {
                    return setNewAssessment(__assign(__assign({}, newAssessment), { type: value }));
                  }}
                >
                  <select_1.SelectTrigger>
                    <select_1.SelectValue placeholder="Selecione o tipo" />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="manual">Manual</select_1.SelectItem>
                    <select_1.SelectItem value="automated">Automatizada</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
                <p className="text-sm text-muted-foreground mt-1">
                  {newAssessment.type === "automated"
                    ? "Avaliação executada automaticamente pelo sistema"
                    : "Avaliação que requer intervenção manual"}
                </p>
              </div>

              <div className="flex gap-2">
                <button_1.Button onClick={handleCreateAssessment}>
                  <lucide_react_1.Plus className="h-4 w-4 mr-2" />
                  Criar Avaliação
                </button_1.Button>
                <button_1.Button
                  variant="outline"
                  onClick={function () {
                    return setNewAssessment({ name: "", description: "", type: "manual" });
                  }}
                >
                  Limpar
                </button_1.Button>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>
  );
}

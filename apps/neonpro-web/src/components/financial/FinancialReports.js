"use client";
"use strict";
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancialReports = FinancialReports;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var select_1 = require("@/components/ui/select");
var tabs_1 = require("@/components/ui/tabs");
var dialog_1 = require("@/components/ui/dialog");
var skeleton_1 = require("@/components/ui/skeleton");
var lucide_react_1 = require("lucide-react");
function FinancialReports(_a) {
  var _b = _a.reports,
    reports = _b === void 0 ? [] : _b,
    _c = _a.templates,
    templates = _c === void 0 ? [] : _c,
    _d = _a.loading,
    loading = _d === void 0 ? false : _d,
    onGenerateReport = _a.onGenerateReport,
    onScheduleReport = _a.onScheduleReport,
    onDeleteReport = _a.onDeleteReport,
    _e = _a.className,
    className = _e === void 0 ? "" : _e;
  var _f = (0, react_1.useState)("reports"),
    activeTab = _f[0],
    setActiveTab = _f[1];
  var _g = (0, react_1.useState)(""),
    searchTerm = _g[0],
    setSearchTerm = _g[1];
  var _h = (0, react_1.useState)("all"),
    filterType = _h[0],
    setFilterType = _h[1];
  var _j = (0, react_1.useState)("all"),
    filterStatus = _j[0],
    setFilterStatus = _j[1];
  var _k = (0, react_1.useState)(false),
    showCreateDialog = _k[0],
    setShowCreateDialog = _k[1];
  var _l = (0, react_1.useState)(false),
    showScheduleDialog = _l[0],
    setShowScheduleDialog = _l[1];
  var _m = (0, react_1.useState)(null),
    selectedTemplate = _m[0],
    setSelectedTemplate = _m[1];
  // Mock data for demonstration
  var mockTemplates = [
    {
      id: "1",
      name: "Relatório de Receita Mensal",
      description: "Análise completa da receita mensal com comparativos",
      type: "revenue",
      format: "pdf",
      frequency: "monthly",
      sections: ["summary", "trends", "breakdown", "comparisons"],
      parameters: { includeCharts: true, includeTrends: true },
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-20T14:30:00Z",
    },
    {
      id: "2",
      name: "Análise de Despesas Detalhada",
      description: "Relatório detalhado de todas as despesas operacionais",
      type: "expenses",
      format: "excel",
      frequency: "weekly",
      sections: ["categories", "trends", "budget_comparison"],
      parameters: { includeSubcategories: true, showBudgetVariance: true },
      createdAt: "2024-01-10T09:00:00Z",
      updatedAt: "2024-01-18T16:45:00Z",
    },
    {
      id: "3",
      name: "Dashboard Executivo",
      description: "Visão executiva com KPIs principais e tendências",
      type: "custom",
      format: "html",
      frequency: "daily",
      sections: ["kpis", "alerts", "forecasts", "recommendations"],
      parameters: { executiveSummary: true, includeForecasts: true },
      createdAt: "2024-01-05T08:00:00Z",
      updatedAt: "2024-01-22T11:20:00Z",
    },
  ];
  var mockReports = [
    {
      id: "1",
      templateId: "1",
      name: "Receita Janeiro 2024",
      type: "revenue",
      format: "pdf",
      status: "completed",
      size: "2.4 MB",
      generatedAt: "2024-01-25T10:30:00Z",
      downloadUrl: "/reports/revenue-jan-2024.pdf",
    },
    {
      id: "2",
      templateId: "2",
      name: "Despesas Semana 3 - Janeiro",
      type: "expenses",
      format: "excel",
      status: "completed",
      size: "1.8 MB",
      generatedAt: "2024-01-22T15:45:00Z",
      downloadUrl: "/reports/expenses-week3-jan.xlsx",
    },
    {
      id: "3",
      templateId: "3",
      name: "Dashboard Executivo - 25/01",
      type: "custom",
      format: "html",
      status: "generating",
      size: "-",
      generatedAt: "2024-01-25T16:00:00Z",
    },
  ];
  // Filter functions
  var filteredReports = mockReports.filter(function (report) {
    var matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase());
    var matchesType = filterType === "all" || report.type === filterType;
    var matchesStatus = filterStatus === "all" || report.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });
  var filteredTemplates = mockTemplates.filter(function (template) {
    var matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());
    var matchesType = filterType === "all" || template.type === filterType;
    return matchesSearch && matchesType;
  });
  // Format date
  var formatDate = function (dateString) {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  // Get status badge
  var getStatusBadge = function (status) {
    var statusConfig = {
      completed: { label: "Concluído", variant: "default", icon: lucide_react_1.CheckCircle },
      generating: { label: "Gerando", variant: "secondary", icon: lucide_react_1.Clock },
      failed: { label: "Falhou", variant: "destructive", icon: lucide_react_1.AlertCircle },
      scheduled: { label: "Agendado", variant: "outline", icon: lucide_react_1.Calendar },
    };
    var config = statusConfig[status];
    if (!config) return null;
    var Icon = config.icon;
    return (
      <badge_1.Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </badge_1.Badge>
    );
  };
  // Get type icon
  var getTypeIcon = function (type) {
    var icons = {
      revenue: lucide_react_1.DollarSign,
      expenses: lucide_react_1.TrendingUp,
      profit: lucide_react_1.BarChart3,
      cash_flow: lucide_react_1.Activity,
      custom: lucide_react_1.FileText,
    };
    return icons[type] || lucide_react_1.FileText;
  };
  // Handle report generation
  var handleGenerateReport = function (templateId) {
    var template = mockTemplates.find(function (t) {
      return t.id === templateId;
    });
    if (template && onGenerateReport) {
      onGenerateReport({
        templateId: templateId,
        parameters: template.parameters,
        format: template.format,
      });
    }
  };
  // Render loading state
  if (loading) {
    return (
      <div className={"space-y-6 ".concat(className)}>
        <div className="flex items-center justify-between">
          <skeleton_1.Skeleton className="h-8 w-48" />
          <skeleton_1.Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {__spreadArray([], Array(6), true).map(function (_, i) {
            return (
              <card_1.Card key={i}>
                <card_1.CardHeader>
                  <skeleton_1.Skeleton className="h-6 w-32" />
                  <skeleton_1.Skeleton className="h-4 w-48" />
                </card_1.CardHeader>
                <card_1.CardContent>
                  <skeleton_1.Skeleton className="h-20 w-full" />
                </card_1.CardContent>
              </card_1.Card>
            );
          })}
        </div>
      </div>
    );
  }
  return (
    <div className={"space-y-6 ".concat(className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Relatórios Financeiros</h2>
          <p className="text-muted-foreground">
            Gerencie e visualize relatórios financeiros personalizados
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button_1.Button
            onClick={function () {
              return setShowScheduleDialog(true);
            }}
            variant="outline"
          >
            <lucide_react_1.Calendar className="h-4 w-4 mr-2" />
            Agendar
          </button_1.Button>
          <button_1.Button
            onClick={function () {
              return setShowCreateDialog(true);
            }}
          >
            <lucide_react_1.Plus className="h-4 w-4 mr-2" />
            Novo Relatório
          </button_1.Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <lucide_react_1.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input_1.Input
              placeholder="Buscar relatórios..."
              value={searchTerm}
              onChange={function (e) {
                return setSearchTerm(e.target.value);
              }}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select_1.Select value={filterType} onValueChange={setFilterType}>
            <select_1.SelectTrigger className="w-40">
              <select_1.SelectValue placeholder="Tipo" />
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="all">Todos os tipos</select_1.SelectItem>
              <select_1.SelectItem value="revenue">Receita</select_1.SelectItem>
              <select_1.SelectItem value="expenses">Despesas</select_1.SelectItem>
              <select_1.SelectItem value="profit">Lucro</select_1.SelectItem>
              <select_1.SelectItem value="cash_flow">Fluxo de Caixa</select_1.SelectItem>
              <select_1.SelectItem value="custom">Personalizado</select_1.SelectItem>
            </select_1.SelectContent>
          </select_1.Select>

          {activeTab === "reports" && (
            <select_1.Select value={filterStatus} onValueChange={setFilterStatus}>
              <select_1.SelectTrigger className="w-40">
                <select_1.SelectValue placeholder="Status" />
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="all">Todos os status</select_1.SelectItem>
                <select_1.SelectItem value="completed">Concluído</select_1.SelectItem>
                <select_1.SelectItem value="generating">Gerando</select_1.SelectItem>
                <select_1.SelectItem value="failed">Falhou</select_1.SelectItem>
                <select_1.SelectItem value="scheduled">Agendado</select_1.SelectItem>
              </select_1.SelectContent>
            </select_1.Select>
          )}
        </div>
      </div>

      {/* Tabs */}
      <tabs_1.Tabs
        value={activeTab}
        onValueChange={function (value) {
          return setActiveTab(value);
        }}
      >
        <tabs_1.TabsList>
          <tabs_1.TabsTrigger value="reports">Relatórios Gerados</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="templates">Templates</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="scheduled">Agendados</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        {/* Generated Reports */}
        <tabs_1.TabsContent value="reports" className="space-y-4">
          {filteredReports.length === 0
            ? <card_1.Card>
                <card_1.CardContent className="flex flex-col items-center justify-center py-12">
                  <lucide_react_1.FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum relatório encontrado</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    {searchTerm || filterType !== "all" || filterStatus !== "all"
                      ? "Tente ajustar os filtros de busca"
                      : "Comece criando seu primeiro relatório"}
                  </p>
                  <button_1.Button
                    onClick={function () {
                      return setShowCreateDialog(true);
                    }}
                  >
                    <lucide_react_1.Plus className="h-4 w-4 mr-2" />
                    Criar Relatório
                  </button_1.Button>
                </card_1.CardContent>
              </card_1.Card>
            : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReports.map(function (report) {
                  var TypeIcon = getTypeIcon(report.type);
                  return (
                    <card_1.Card key={report.id} className="hover:shadow-md transition-shadow">
                      <card_1.CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <TypeIcon className="h-5 w-5 text-muted-foreground" />
                            <card_1.CardTitle className="text-lg">{report.name}</card_1.CardTitle>
                          </div>
                          {getStatusBadge(report.status)}
                        </div>
                        <card_1.CardDescription>
                          {report.format.toUpperCase()} • {report.size}
                        </card_1.CardDescription>
                      </card_1.CardHeader>
                      <card_1.CardContent>
                        <div className="space-y-3">
                          <div className="text-sm text-muted-foreground">
                            Gerado em: {formatDate(report.generatedAt)}
                          </div>

                          <div className="flex items-center gap-2">
                            {report.status === "completed" && report.downloadUrl && (
                              <button_1.Button size="sm" variant="outline">
                                <lucide_react_1.Download className="h-4 w-4 mr-2" />
                                Download
                              </button_1.Button>
                            )}
                            <button_1.Button size="sm" variant="outline">
                              <lucide_react_1.Eye className="h-4 w-4 mr-2" />
                              Visualizar
                            </button_1.Button>
                            <button_1.Button size="sm" variant="outline">
                              <lucide_react_1.Share className="h-4 w-4 mr-2" />
                              Compartilhar
                            </button_1.Button>
                          </div>
                        </div>
                      </card_1.CardContent>
                    </card_1.Card>
                  );
                })}
              </div>}
        </tabs_1.TabsContent>

        {/* Templates */}
        <tabs_1.TabsContent value="templates" className="space-y-4">
          {filteredTemplates.length === 0
            ? <card_1.Card>
                <card_1.CardContent className="flex flex-col items-center justify-center py-12">
                  <lucide_react_1.FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum template encontrado</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    {searchTerm || filterType !== "all"
                      ? "Tente ajustar os filtros de busca"
                      : "Comece criando seu primeiro template"}
                  </p>
                  <button_1.Button
                    onClick={function () {
                      return setShowCreateDialog(true);
                    }}
                  >
                    <lucide_react_1.Plus className="h-4 w-4 mr-2" />
                    Criar Template
                  </button_1.Button>
                </card_1.CardContent>
              </card_1.Card>
            : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map(function (template) {
                  var TypeIcon = getTypeIcon(template.type);
                  return (
                    <card_1.Card key={template.id} className="hover:shadow-md transition-shadow">
                      <card_1.CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <TypeIcon className="h-5 w-5 text-muted-foreground" />
                            <card_1.CardTitle className="text-lg">{template.name}</card_1.CardTitle>
                          </div>
                          <badge_1.Badge variant="outline">{template.frequency}</badge_1.Badge>
                        </div>
                        <card_1.CardDescription>{template.description}</card_1.CardDescription>
                      </card_1.CardHeader>
                      <card_1.CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Formato: {template.format.toUpperCase()}</span>
                            <span>•</span>
                            <span>{template.sections.length} seções</span>
                          </div>

                          <div className="text-sm text-muted-foreground">
                            Atualizado: {formatDate(template.updatedAt)}
                          </div>

                          <div className="flex items-center gap-2">
                            <button_1.Button
                              size="sm"
                              onClick={function () {
                                return handleGenerateReport(template.id);
                              }}
                            >
                              <lucide_react_1.FileText className="h-4 w-4 mr-2" />
                              Gerar
                            </button_1.Button>
                            <button_1.Button size="sm" variant="outline">
                              <lucide_react_1.Edit className="h-4 w-4 mr-2" />
                              Editar
                            </button_1.Button>
                            <button_1.Button
                              size="sm"
                              variant="outline"
                              onClick={function () {
                                setSelectedTemplate(template);
                                setShowScheduleDialog(true);
                              }}
                            >
                              <lucide_react_1.Calendar className="h-4 w-4 mr-2" />
                              Agendar
                            </button_1.Button>
                          </div>
                        </div>
                      </card_1.CardContent>
                    </card_1.Card>
                  );
                })}
              </div>}
        </tabs_1.TabsContent>

        {/* Scheduled Reports */}
        <tabs_1.TabsContent value="scheduled" className="space-y-4">
          <card_1.Card>
            <card_1.CardContent className="flex flex-col items-center justify-center py-12">
              <lucide_react_1.Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Relatórios Agendados</h3>
              <p className="text-muted-foreground text-center mb-4">
                Visualize e gerencie relatórios agendados para geração automática
              </p>
              <button_1.Button
                onClick={function () {
                  return setShowScheduleDialog(true);
                }}
              >
                <lucide_react_1.Plus className="h-4 w-4 mr-2" />
                Agendar Relatório
              </button_1.Button>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>

      {/* Create Report Dialog */}
      <dialog_1.Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <dialog_1.DialogContent className="max-w-2xl">
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>Criar Novo Relatório</dialog_1.DialogTitle>
            <dialog_1.DialogDescription>
              Configure um novo relatório financeiro personalizado
            </dialog_1.DialogDescription>
          </dialog_1.DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label_1.Label htmlFor="report-name">Nome do Relatório</label_1.Label>
                <input_1.Input id="report-name" placeholder="Ex: Análise Mensal de Receita" />
              </div>
              <div className="space-y-2">
                <label_1.Label htmlFor="report-type">Tipo</label_1.Label>
                <select_1.Select>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue placeholder="Selecione o tipo" />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="revenue">Receita</select_1.SelectItem>
                    <select_1.SelectItem value="expenses">Despesas</select_1.SelectItem>
                    <select_1.SelectItem value="profit">Lucro</select_1.SelectItem>
                    <select_1.SelectItem value="cash_flow">Fluxo de Caixa</select_1.SelectItem>
                    <select_1.SelectItem value="custom">Personalizado</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
              </div>
            </div>

            <div className="space-y-2">
              <label_1.Label htmlFor="report-description">Descrição</label_1.Label>
              <textarea_1.Textarea
                id="report-description"
                placeholder="Descreva o objetivo e conteúdo do relatório"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label_1.Label htmlFor="report-format">Formato</label_1.Label>
                <select_1.Select>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue placeholder="Selecione o formato" />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="pdf">PDF</select_1.SelectItem>
                    <select_1.SelectItem value="excel">Excel</select_1.SelectItem>
                    <select_1.SelectItem value="csv">CSV</select_1.SelectItem>
                    <select_1.SelectItem value="html">HTML</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
              </div>
              <div className="space-y-2">
                <label_1.Label htmlFor="report-frequency">Frequência</label_1.Label>
                <select_1.Select>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue placeholder="Selecione a frequência" />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="daily">Diário</select_1.SelectItem>
                    <select_1.SelectItem value="weekly">Semanal</select_1.SelectItem>
                    <select_1.SelectItem value="monthly">Mensal</select_1.SelectItem>
                    <select_1.SelectItem value="quarterly">Trimestral</select_1.SelectItem>
                    <select_1.SelectItem value="yearly">Anual</select_1.SelectItem>
                    <select_1.SelectItem value="custom">Personalizado</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button_1.Button
                variant="outline"
                onClick={function () {
                  return setShowCreateDialog(false);
                }}
              >
                Cancelar
              </button_1.Button>
              <button_1.Button
                onClick={function () {
                  return setShowCreateDialog(false);
                }}
              >
                Criar Relatório
              </button_1.Button>
            </div>
          </div>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>

      {/* Schedule Report Dialog */}
      <dialog_1.Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <dialog_1.DialogContent>
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>Agendar Relatório</dialog_1.DialogTitle>
            <dialog_1.DialogDescription>
              Configure a geração automática de relatórios
            </dialog_1.DialogDescription>
          </dialog_1.DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label_1.Label htmlFor="schedule-template">Template</label_1.Label>
              <select_1.Select>
                <select_1.SelectTrigger>
                  <select_1.SelectValue placeholder="Selecione um template" />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  {mockTemplates.map(function (template) {
                    return (
                      <select_1.SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </select_1.SelectItem>
                    );
                  })}
                </select_1.SelectContent>
              </select_1.Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label_1.Label htmlFor="schedule-frequency">Frequência</label_1.Label>
                <select_1.Select>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue placeholder="Frequência" />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="daily">Diário</select_1.SelectItem>
                    <select_1.SelectItem value="weekly">Semanal</select_1.SelectItem>
                    <select_1.SelectItem value="monthly">Mensal</select_1.SelectItem>
                    <select_1.SelectItem value="quarterly">Trimestral</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
              </div>
              <div className="space-y-2">
                <label_1.Label htmlFor="schedule-time">Horário</label_1.Label>
                <input_1.Input id="schedule-time" type="time" defaultValue="09:00" />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button_1.Button
                variant="outline"
                onClick={function () {
                  return setShowScheduleDialog(false);
                }}
              >
                Cancelar
              </button_1.Button>
              <button_1.Button
                onClick={function () {
                  return setShowScheduleDialog(false);
                }}
              >
                Agendar
              </button_1.Button>
            </div>
          </div>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>
    </div>
  );
}
exports.default = FinancialReports;

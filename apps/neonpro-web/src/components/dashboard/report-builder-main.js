"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportBuilderMain = ReportBuilderMain;
var lucide_react_1 = require("lucide-react");
var link_1 = require("next/link");
var react_1 = require("react");
var avatar_1 = require("@/components/ui/avatar");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var input_1 = require("@/components/ui/input");
var select_1 = require("@/components/ui/select");
var tabs_1 = require("@/components/ui/tabs");
// Mock data for recent reports and templates
var recentReports = [
  {
    id: "1",
    name: "Relatório de Receita Mensal",
    description: "Análise detalhada da receita por mês e procedimento",
    type: "financial",
    lastModified: "2024-01-15T10:00:00Z",
    createdBy: "Dr. Ana Silva",
    avatar: "/avatars/ana.jpg",
    status: "published",
  },
  {
    id: "2",
    name: "Análise de Pacientes por Faixa Etária",
    description: "Distribuição demográfica dos pacientes",
    type: "patients",
    lastModified: "2024-01-14T15:30:00Z",
    createdBy: "Dra. Maria Santos",
    avatar: "/avatars/maria.jpg",
    status: "draft",
  },
  {
    id: "3",
    name: "Performance de Campanhas de Marketing",
    description: "ROI e conversão das campanhas ativas",
    type: "marketing",
    lastModified: "2024-01-13T09:15:00Z",
    createdBy: "João Oliveira",
    avatar: "/avatars/joao.jpg",
    status: "scheduled",
  },
  {
    id: "4",
    name: "Controle de Estoque - Produtos",
    description: "Níveis de estoque e movimentação de produtos",
    type: "inventory",
    lastModified: "2024-01-12T14:20:00Z",
    createdBy: "Dr. Ana Silva",
    avatar: "/avatars/ana.jpg",
    status: "published",
  },
];
var reportTemplates = [
  {
    id: "financial-summary",
    name: "Resumo Financeiro",
    description: "Template padrão para relatórios financeiros mensais",
    category: "financial",
    icon: lucide_react_1.TrendingUp,
    color: "bg-green-100 text-green-700",
  },
  {
    id: "patient-demographics",
    name: "Demografia de Pacientes",
    description: "Análise demográfica e segmentação de pacientes",
    category: "patients",
    icon: lucide_react_1.BarChart3,
    color: "bg-blue-100 text-blue-700",
  },
  {
    id: "marketing-performance",
    name: "Performance de Marketing",
    description: "Métricas de campanhas e conversão",
    category: "marketing",
    icon: lucide_react_1.TrendingUp,
    color: "bg-purple-100 text-purple-700",
  },
  {
    id: "inventory-control",
    name: "Controle de Estoque",
    description: "Monitoramento de produtos e movimentação",
    category: "inventory",
    icon: lucide_react_1.BarChart3,
    color: "bg-orange-100 text-orange-700",
  },
];
var quickActions = [
  {
    title: "Relatório Financeiro",
    description: "Receitas, pagamentos e faturamento",
    icon: lucide_react_1.TrendingUp,
    color: "bg-green-100 text-green-700",
    action: function () {
      return window.open("/dashboard/report-builder/new?template=financial-summary", "_blank");
    },
  },
  {
    title: "Análise de Pacientes",
    description: "Demografia e histórico de consultas",
    icon: lucide_react_1.BarChart3,
    color: "bg-blue-100 text-blue-700",
    action: function () {
      return window.open("/dashboard/report-builder/new?template=patient-demographics", "_blank");
    },
  },
  {
    title: "Dashboard Executivo",
    description: "Visão geral dos KPIs principais",
    icon: lucide_react_1.FileText,
    color: "bg-gray-100 text-gray-700",
    action: function () {
      return window.open("/dashboard/report-builder/new", "_blank");
    },
  },
];
function getStatusBadge(status) {
  switch (status) {
    case "published":
      return <badge_1.Badge className="bg-green-100 text-green-700">Publicado</badge_1.Badge>;
    case "draft":
      return <badge_1.Badge variant="secondary">Rascunho</badge_1.Badge>;
    case "scheduled":
      return <badge_1.Badge className="bg-blue-100 text-blue-700">Agendado</badge_1.Badge>;
    default:
      return <badge_1.Badge variant="outline">Desconhecido</badge_1.Badge>;
  }
}
function getTypeIcon(type) {
  switch (type) {
    case "financial":
      return <lucide_react_1.TrendingUp className="w-4 h-4" />;
    case "patients":
      return <lucide_react_1.BarChart3 className="w-4 h-4" />;
    case "marketing":
      return <lucide_react_1.TrendingUp className="w-4 h-4" />;
    case "inventory":
      return <lucide_react_1.BarChart3 className="w-4 h-4" />;
    default:
      return <lucide_react_1.FileText className="w-4 h-4" />;
  }
}
function formatDate(dateString) {
  var date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
function ReportBuilderMain() {
  var _a = (0, react_1.useState)(""),
    searchQuery = _a[0],
    setSearchQuery = _a[1];
  var _b = (0, react_1.useState)("all"),
    filterType = _b[0],
    setFilterType = _b[1];
  var _c = (0, react_1.useState)("all"),
    filterStatus = _c[0],
    setFilterStatus = _c[1];
  var filteredReports = recentReports.filter(function (report) {
    var matchesSearch =
      report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase());
    var matchesType = filterType === "all" || report.type === filterType;
    var matchesStatus = filterStatus === "all" || report.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });
  var handleCreateReport = (0, react_1.useCallback)(function (templateId) {
    var url = templateId
      ? "/dashboard/report-builder/new?template=".concat(templateId)
      : "/dashboard/report-builder/new";
    window.open(url, "_blank");
  }, []);
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Report Builder</h1>
          <p className="text-muted-foreground">
            Crie relatórios personalizados com nossa ferramenta de arrastar e soltar
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button_1.Button variant="outline" asChild>
            <link_1.default href="/dashboard/analytics">
              <lucide_react_1.Eye className="w-4 h-4 mr-2" />
              Analytics
            </link_1.default>
          </button_1.Button>
          <button_1.Button
            onClick={function () {
              return handleCreateReport();
            }}
          >
            <lucide_react_1.Plus className="w-4 h-4 mr-2" />
            Novo Relatório
          </button_1.Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickActions.map(function (action, index) {
          var IconComponent = action.icon;
          return (
            <card_1.Card
              key={index}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={action.action}
            >
              <card_1.CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={"p-2 rounded-lg ".concat(action.color)}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm">{action.title}</h3>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                  <lucide_react_1.ExternalLink className="w-4 h-4 text-muted-foreground" />
                </div>
              </card_1.CardContent>
            </card_1.Card>
          );
        })}
      </div>

      <tabs_1.Tabs defaultValue="reports" className="space-y-4">
        <tabs_1.TabsList>
          <tabs_1.TabsTrigger value="reports">Meus Relatórios</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="templates">Templates</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="shared">Compartilhados</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="reports" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input_1.Input
                placeholder="Buscar relatórios..."
                value={searchQuery}
                onChange={function (e) {
                  return setSearchQuery(e.target.value);
                }}
                className="max-w-sm"
              />
            </div>

            <select_1.Select value={filterType} onValueChange={setFilterType}>
              <select_1.SelectTrigger className="w-40">
                <select_1.SelectValue placeholder="Tipo" />
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="all">Todos os tipos</select_1.SelectItem>
                <select_1.SelectItem value="financial">Financeiro</select_1.SelectItem>
                <select_1.SelectItem value="patients">Pacientes</select_1.SelectItem>
                <select_1.SelectItem value="marketing">Marketing</select_1.SelectItem>
                <select_1.SelectItem value="inventory">Estoque</select_1.SelectItem>
              </select_1.SelectContent>
            </select_1.Select>

            <select_1.Select value={filterStatus} onValueChange={setFilterStatus}>
              <select_1.SelectTrigger className="w-40">
                <select_1.SelectValue placeholder="Status" />
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="all">Todos os status</select_1.SelectItem>
                <select_1.SelectItem value="published">Publicado</select_1.SelectItem>
                <select_1.SelectItem value="draft">Rascunho</select_1.SelectItem>
                <select_1.SelectItem value="scheduled">Agendado</select_1.SelectItem>
              </select_1.SelectContent>
            </select_1.Select>
          </div>

          {/* Reports Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReports.map(function (report) {
              return (
                <card_1.Card key={report.id} className="hover:shadow-md transition-shadow">
                  <card_1.CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(report.type)}
                        <card_1.CardTitle className="text-base">{report.name}</card_1.CardTitle>
                      </div>
                      <dropdown_menu_1.DropdownMenu>
                        <dropdown_menu_1.DropdownMenuTrigger asChild>
                          <button_1.Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="1" fill="currentColor" />
                              <circle cx="12" cy="5" r="1" fill="currentColor" />
                              <circle cx="12" cy="19" r="1" fill="currentColor" />
                            </svg>
                          </button_1.Button>
                        </dropdown_menu_1.DropdownMenuTrigger>
                        <dropdown_menu_1.DropdownMenuContent align="end">
                          <dropdown_menu_1.DropdownMenuItem asChild>
                            <link_1.default href={"/dashboard/report-builder/".concat(report.id)}>
                              <lucide_react_1.Edit className="w-4 h-4 mr-2" />
                              Editar
                            </link_1.default>
                          </dropdown_menu_1.DropdownMenuItem>
                          <dropdown_menu_1.DropdownMenuItem>
                            <lucide_react_1.Copy className="w-4 h-4 mr-2" />
                            Duplicar
                          </dropdown_menu_1.DropdownMenuItem>
                          <dropdown_menu_1.DropdownMenuItem>
                            <lucide_react_1.Download className="w-4 h-4 mr-2" />
                            Exportar
                          </dropdown_menu_1.DropdownMenuItem>
                          <dropdown_menu_1.DropdownMenuItem>
                            <lucide_react_1.Share className="w-4 h-4 mr-2" />
                            Compartilhar
                          </dropdown_menu_1.DropdownMenuItem>
                          <dropdown_menu_1.DropdownMenuSeparator />
                          <dropdown_menu_1.DropdownMenuItem className="text-destructive">
                            <lucide_react_1.Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </dropdown_menu_1.DropdownMenuItem>
                        </dropdown_menu_1.DropdownMenuContent>
                      </dropdown_menu_1.DropdownMenu>
                    </div>
                    <card_1.CardDescription className="text-xs">
                      {report.description}
                    </card_1.CardDescription>
                  </card_1.CardHeader>

                  <card_1.CardContent className="pb-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <avatar_1.Avatar className="h-5 w-5">
                          <avatar_1.AvatarImage src={report.avatar} />
                          <avatar_1.AvatarFallback>
                            {report.createdBy
                              .split(" ")
                              .map(function (n) {
                                return n[0];
                              })
                              .join("")}
                          </avatar_1.AvatarFallback>
                        </avatar_1.Avatar>
                        <span>{report.createdBy}</span>
                      </div>
                      {getStatusBadge(report.status)}
                    </div>
                  </card_1.CardContent>

                  <card_1.CardFooter className="pt-0 pb-3">
                    <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                      <span>Modificado: {formatDate(report.lastModified)}</span>
                      <button_1.Button variant="ghost" size="sm" asChild>
                        <link_1.default href={"/dashboard/report-builder/".concat(report.id)}>
                          <lucide_react_1.ExternalLink className="w-3 h-3" />
                        </link_1.default>
                      </button_1.Button>
                    </div>
                  </card_1.CardFooter>
                </card_1.Card>
              );
            })}
          </div>

          {filteredReports.length === 0 && (
            <div className="text-center py-12">
              <lucide_react_1.FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum relatório encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || filterType !== "all" || filterStatus !== "all"
                  ? "Tente ajustar os filtros de busca"
                  : "Comece criando seu primeiro relatório"}
              </p>
              <button_1.Button
                onClick={function () {
                  return handleCreateReport();
                }}
              >
                <lucide_react_1.Plus className="w-4 h-4 mr-2" />
                Criar Relatório
              </button_1.Button>
            </div>
          )}
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTemplates.map(function (template) {
              var IconComponent = template.icon;
              return (
                <card_1.Card
                  key={template.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={function () {
                    return handleCreateReport(template.id);
                  }}
                >
                  <card_1.CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={"p-2 rounded-lg ".concat(template.color)}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <card_1.CardTitle className="text-base">{template.name}</card_1.CardTitle>
                        <card_1.CardDescription className="text-xs">
                          {template.description}
                        </card_1.CardDescription>
                      </div>
                    </div>
                  </card_1.CardHeader>

                  <card_1.CardFooter>
                    <button_1.Button className="w-full" size="sm">
                      <lucide_react_1.Plus className="w-4 h-4 mr-2" />
                      Usar Template
                    </button_1.Button>
                  </card_1.CardFooter>
                </card_1.Card>
              );
            })}
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="shared" className="space-y-4">
          <div className="text-center py-12">
            <lucide_react_1.Share className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Relatórios Compartilhados</h3>
            <p className="text-muted-foreground">
              Aqui aparecerão os relatórios compartilhados com você
            </p>
          </div>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>
  );
}

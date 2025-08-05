"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportBuilderDashboard = ReportBuilderDashboard;
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var dialog_1 = require("@/components/ui/dialog");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var input_1 = require("@/components/ui/input");
var tabs_1 = require("@/components/ui/tabs");
var utils_1 = require("@/lib/utils");
function ReportBuilderDashboard() {
  var _a = (0, react_1.useState)("reports"),
    activeTab = _a[0],
    setActiveTab = _a[1];
  var _b = (0, react_1.useState)(""),
    searchQuery = _b[0],
    setSearchQuery = _b[1];
  var _c = (0, react_1.useState)("all"),
    selectedCategory = _c[0],
    setSelectedCategory = _c[1];
  // Mock data - replace with real API calls
  var reports = [
    {
      id: "1",
      name: "Relatório de Receita Mensal",
      description: "Análise detalhada da receita por mês e procedimento",
      visualization_type: "chart",
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-25T14:45:00Z",
      is_public: false,
      is_template: false,
      run_count: 24,
      last_run: "2024-01-25T09:15:00Z",
    },
    {
      id: "2",
      name: "Dashboard de Pacientes",
      description: "Visão geral dos pacientes ativos e novos cadastros",
      visualization_type: "mixed",
      created_at: "2024-01-20T16:20:00Z",
      updated_at: "2024-01-26T11:30:00Z",
      is_public: true,
      is_template: false,
      run_count: 45,
      last_run: "2024-01-26T08:00:00Z",
    },
    {
      id: "3",
      name: "Análise de Satisfação",
      description: "Relatório de satisfação dos pacientes por período",
      visualization_type: "chart",
      created_at: "2024-01-18T09:15:00Z",
      updated_at: "2024-01-24T15:20:00Z",
      is_public: false,
      is_template: false,
      run_count: 12,
    },
  ];
  var templates = [
    {
      id: "tpl-1",
      name: "Relatório Financeiro Básico",
      description: "Template para análise financeira mensal",
      category: "financial",
      visualization_type: "chart",
      usage_count: 156,
    },
    {
      id: "tpl-2",
      name: "Dashboard de Atendimentos",
      description: "Visão geral de consultas e procedimentos",
      category: "clinical",
      visualization_type: "mixed",
      usage_count: 89,
    },
    {
      id: "tpl-3",
      name: "Análise de Marketing",
      description: "Métricas de campanhas e conversão",
      category: "marketing",
      visualization_type: "chart",
      usage_count: 67,
    },
    {
      id: "tpl-4",
      name: "Relatório de Estoque",
      description: "Controle de produtos e materiais",
      category: "inventory",
      visualization_type: "table",
      usage_count: 43,
    },
  ];
  var getVisualizationIcon = (type) => {
    switch (type) {
      case "chart":
        return lucide_react_1.LineChart;
      case "table":
        return lucide_react_1.Table;
      case "kpi":
        return lucide_react_1.BarChart3;
      case "mixed":
        return lucide_react_1.PieChart;
      default:
        return lucide_react_1.BarChart3;
    }
  };
  var getCategoryIcon = (category) => {
    switch (category) {
      case "financial":
        return lucide_react_1.DollarSign;
      case "clinical":
        return lucide_react_1.Users;
      case "marketing":
        return lucide_react_1.BarChart3;
      case "inventory":
        return lucide_react_1.Table;
      default:
        return lucide_react_1.BarChart3;
    }
  };
  var getCategoryColor = (category) => {
    switch (category) {
      case "financial":
        return "bg-green-100 text-green-800";
      case "clinical":
        return "bg-blue-100 text-blue-800";
      case "marketing":
        return "bg-purple-100 text-purple-800";
      case "inventory":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  var filteredReports = reports.filter(
    (report) =>
      report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (report.description && report.description.toLowerCase().includes(searchQuery.toLowerCase())),
  );
  var filteredTemplates = templates.filter((template) => {
    var matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (template.description &&
        template.description.toLowerCase().includes(searchQuery.toLowerCase()));
    var matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <lucide_react_1.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input_1.Input
              placeholder="Buscar relatórios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <button_1.Button variant="outline">
          <lucide_react_1.Filter className="w-4 h-4 mr-2" />
          Filtros
        </button_1.Button>

        <dialog_1.Dialog>
          <dialog_1.DialogTrigger asChild>
            <button_1.Button>
              <lucide_react_1.Plus className="w-4 h-4 mr-2" />
              Novo Relatório
            </button_1.Button>
          </dialog_1.DialogTrigger>
          <dialog_1.DialogContent className="max-w-2xl">
            <dialog_1.DialogHeader>
              <dialog_1.DialogTitle>Criar Novo Relatório</dialog_1.DialogTitle>
              <dialog_1.DialogDescription>
                Escolha como deseja começar seu relatório
              </dialog_1.DialogDescription>
            </dialog_1.DialogHeader>
            <div className="grid gap-4 py-4">
              <card_1.Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                <card_1.CardHeader>
                  <card_1.CardTitle className="flex items-center gap-2">
                    <lucide_react_1.Plus className="w-5 h-5" />
                    Começar do Zero
                  </card_1.CardTitle>
                  <card_1.CardDescription>
                    Crie um relatório personalizado usando o editor drag-and-drop
                  </card_1.CardDescription>
                </card_1.CardHeader>
              </card_1.Card>

              <card_1.Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                <card_1.CardHeader>
                  <card_1.CardTitle className="flex items-center gap-2">
                    <lucide_react_1.Copy className="w-5 h-5" />
                    Usar Template
                  </card_1.CardTitle>
                  <card_1.CardDescription>
                    Comece com um template pré-configurado
                  </card_1.CardDescription>
                </card_1.CardHeader>
              </card_1.Card>
            </div>
          </dialog_1.DialogContent>
        </dialog_1.Dialog>
      </div>

      {/* Main Content */}
      <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab}>
        <tabs_1.TabsList>
          <tabs_1.TabsTrigger value="reports">Meus Relatórios</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="templates">Templates</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="scheduled">Agendados</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="reports" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredReports.map((report) => {
              var IconComponent = getVisualizationIcon(report.visualization_type);
              return (
                <card_1.Card
                  key={report.id}
                  className="medical-card hover:shadow-lg transition-shadow"
                >
                  <card_1.CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <IconComponent className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <card_1.CardTitle className="text-sm font-medium truncate">
                            {report.name}
                          </card_1.CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            {report.is_public && (
                              <badge_1.Badge variant="secondary" className="text-xs">
                                Público
                              </badge_1.Badge>
                            )}
                            <badge_1.Badge variant="outline" className="text-xs">
                              {report.visualization_type}
                            </badge_1.Badge>
                          </div>
                        </div>
                      </div>

                      <dropdown_menu_1.DropdownMenu>
                        <dropdown_menu_1.DropdownMenuTrigger asChild>
                          <button_1.Button variant="ghost" size="sm">
                            <lucide_react_1.MoreHorizontal className="w-4 h-4" />
                          </button_1.Button>
                        </dropdown_menu_1.DropdownMenuTrigger>
                        <dropdown_menu_1.DropdownMenuContent align="end">
                          <dropdown_menu_1.DropdownMenuItem>
                            <lucide_react_1.Eye className="w-4 h-4 mr-2" />
                            Visualizar
                          </dropdown_menu_1.DropdownMenuItem>
                          <dropdown_menu_1.DropdownMenuItem>
                            <lucide_react_1.Edit className="w-4 h-4 mr-2" />
                            Editar
                          </dropdown_menu_1.DropdownMenuItem>
                          <dropdown_menu_1.DropdownMenuItem>
                            <lucide_react_1.Play className="w-4 h-4 mr-2" />
                            Executar
                          </dropdown_menu_1.DropdownMenuItem>
                          <dropdown_menu_1.DropdownMenuSeparator />
                          <dropdown_menu_1.DropdownMenuItem>
                            <lucide_react_1.Copy className="w-4 h-4 mr-2" />
                            Duplicar
                          </dropdown_menu_1.DropdownMenuItem>
                          <dropdown_menu_1.DropdownMenuItem>
                            <lucide_react_1.Share className="w-4 h-4 mr-2" />
                            Compartilhar
                          </dropdown_menu_1.DropdownMenuItem>
                          <dropdown_menu_1.DropdownMenuItem>
                            <lucide_react_1.Download className="w-4 h-4 mr-2" />
                            Exportar
                          </dropdown_menu_1.DropdownMenuItem>
                          <dropdown_menu_1.DropdownMenuSeparator />
                          <dropdown_menu_1.DropdownMenuItem className="text-destructive">
                            <lucide_react_1.Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </dropdown_menu_1.DropdownMenuItem>
                        </dropdown_menu_1.DropdownMenuContent>
                      </dropdown_menu_1.DropdownMenu>
                    </div>
                  </card_1.CardHeader>

                  <card_1.CardContent className="pt-0">
                    {report.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {report.description}
                      </p>
                    )}

                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <span>Execuções: {report.run_count}</span>
                        <span>
                          Atualizado: {(0, utils_1.formatDate)(new Date(report.updated_at))}
                        </span>
                      </div>
                      {report.last_run && (
                        <div className="flex items-center gap-1">
                          <lucide_react_1.Clock className="w-3 h-3" />
                          <span>
                            Última execução: {(0, utils_1.formatDate)(new Date(report.last_run))}
                          </span>
                        </div>
                      )}
                    </div>
                  </card_1.CardContent>
                </card_1.Card>
              );
            })}
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template) => {
              var IconComponent = getVisualizationIcon(template.visualization_type);
              var CategoryIcon = getCategoryIcon(template.category);
              return (
                <card_1.Card
                  key={template.id}
                  className="medical-card hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <card_1.CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <IconComponent className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <card_1.CardTitle className="text-sm font-medium truncate">
                            {template.name}
                          </card_1.CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <badge_1.Badge
                              variant="secondary"
                              className={"text-xs ".concat(getCategoryColor(template.category))}
                            >
                              <CategoryIcon className="w-3 h-3 mr-1" />
                              {template.category}
                            </badge_1.Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </card_1.CardHeader>

                  <card_1.CardContent className="pt-0">
                    {template.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {template.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{template.usage_count} usos</span>
                      <badge_1.Badge variant="outline" className="text-xs">
                        {template.visualization_type}
                      </badge_1.Badge>
                    </div>

                    <button_1.Button className="w-full mt-3" size="sm">
                      <lucide_react_1.Plus className="w-4 h-4 mr-2" />
                      Usar Template
                    </button_1.Button>
                  </card_1.CardContent>
                </card_1.Card>
              );
            })}
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="scheduled" className="space-y-4">
          <div className="text-center py-12">
            <lucide_react_1.Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum relatório agendado</h3>
            <p className="text-muted-foreground mb-4">
              Configure relatórios para execução automática
            </p>
            <button_1.Button variant="outline">
              <lucide_react_1.Clock className="w-4 h-4 mr-2" />
              Agendar Relatório
            </button_1.Button>
          </div>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>
  );
}

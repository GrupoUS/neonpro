"use client";

import {
  BarChart3,
  Calendar,
  Clock,
  Copy,
  DollarSign,
  Download,
  Edit,
  Eye,
  Filter,
  LineChart,
  MoreHorizontal,
  PieChart,
  Play,
  Plus,
  Search,
  Share,
  Table,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/utils";

interface Report {
  id: string;
  name: string;
  description?: string;
  visualization_type: "chart" | "table" | "kpi" | "mixed";
  created_at: string;
  updated_at: string;
  is_public: boolean;
  is_template: boolean;
  run_count: number;
  last_run?: string;
}

interface ReportTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  visualization_type: "chart" | "table" | "kpi" | "mixed";
  preview_image?: string;
  usage_count: number;
}

export function ReportBuilderDashboard() {
  const [activeTab, setActiveTab] = useState("reports");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Mock data - replace with real API calls
  const reports: Report[] = [
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

  const templates: ReportTemplate[] = [
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

  const getVisualizationIcon = (type: string) => {
    switch (type) {
      case "chart":
        return LineChart;
      case "table":
        return Table;
      case "kpi":
        return BarChart3;
      case "mixed":
        return PieChart;
      default:
        return BarChart3;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "financial":
        return DollarSign;
      case "clinical":
        return Users;
      case "marketing":
        return BarChart3;
      case "inventory":
        return Table;
      default:
        return BarChart3;
    }
  };

  const getCategoryColor = (category: string) => {
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

  const filteredReports = reports.filter(
    (report) =>
      report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (report.description && report.description.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (template.description &&
        template.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar relatórios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filtros
        </Button>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Relatório
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Relatório</DialogTitle>
              <DialogDescription>Escolha como deseja começar seu relatório</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Começar do Zero
                  </CardTitle>
                  <CardDescription>
                    Crie um relatório personalizado usando o editor drag-and-drop
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Copy className="w-5 h-5" />
                    Usar Template
                  </CardTitle>
                  <CardDescription>Comece com um template pré-configurado</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="reports">Meus Relatórios</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="scheduled">Agendados</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredReports.map((report) => {
              const IconComponent = getVisualizationIcon(report.visualization_type);
              return (
                <Card key={report.id} className="medical-card hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <IconComponent className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-sm font-medium truncate">
                            {report.name}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            {report.is_public && (
                              <Badge variant="secondary" className="text-xs">
                                Público
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {report.visualization_type}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Play className="w-4 h-4 mr-2" />
                            Executar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share className="w-4 h-4 mr-2" />
                            Compartilhar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="w-4 h-4 mr-2" />
                            Exportar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {report.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {report.description}
                      </p>
                    )}

                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <span>Execuções: {report.run_count}</span>
                        <span>Atualizado: {formatDate(new Date(report.updated_at))}</span>
                      </div>
                      {report.last_run && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Última execução: {formatDate(new Date(report.last_run))}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template) => {
              const IconComponent = getVisualizationIcon(template.visualization_type);
              const CategoryIcon = getCategoryIcon(template.category);
              return (
                <Card
                  key={template.id}
                  className="medical-card hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <IconComponent className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-sm font-medium truncate">
                            {template.name}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant="secondary"
                              className={`text-xs ${getCategoryColor(template.category)}`}
                            >
                              <CategoryIcon className="w-3 h-3 mr-1" />
                              {template.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {template.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {template.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{template.usage_count} usos</span>
                      <Badge variant="outline" className="text-xs">
                        {template.visualization_type}
                      </Badge>
                    </div>

                    <Button className="w-full mt-3" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Usar Template
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum relatório agendado</h3>
            <p className="text-muted-foreground mb-4">
              Configure relatórios para execução automática
            </p>
            <Button variant="outline">
              <Clock className="w-4 h-4 mr-2" />
              Agendar Relatório
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

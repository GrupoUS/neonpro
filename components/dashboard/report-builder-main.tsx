"use client";

import {
  BarChart3,
  Copy,
  Download,
  Edit,
  ExternalLink,
  Eye,
  FileText,
  Plus,
  Share,
  Trash2,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data for recent reports and templates
const recentReports = [
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

const reportTemplates = [
  {
    id: "financial-summary",
    name: "Resumo Financeiro",
    description: "Template padrão para relatórios financeiros mensais",
    category: "financial",
    icon: TrendingUp,
    color: "bg-green-100 text-green-700",
  },
  {
    id: "patient-demographics",
    name: "Demografia de Pacientes",
    description: "Análise demográfica e segmentação de pacientes",
    category: "patients",
    icon: BarChart3,
    color: "bg-blue-100 text-blue-700",
  },
  {
    id: "marketing-performance",
    name: "Performance de Marketing",
    description: "Métricas de campanhas e conversão",
    category: "marketing",
    icon: TrendingUp,
    color: "bg-purple-100 text-purple-700",
  },
  {
    id: "inventory-control",
    name: "Controle de Estoque",
    description: "Monitoramento de produtos e movimentação",
    category: "inventory",
    icon: BarChart3,
    color: "bg-orange-100 text-orange-700",
  },
];

const quickActions = [
  {
    title: "Relatório Financeiro",
    description: "Receitas, pagamentos e faturamento",
    icon: TrendingUp,
    color: "bg-green-100 text-green-700",
    action: () =>
      window.open(
        "/dashboard/report-builder/new?template=financial-summary",
        "_blank"
      ),
  },
  {
    title: "Análise de Pacientes",
    description: "Demografia e histórico de consultas",
    icon: BarChart3,
    color: "bg-blue-100 text-blue-700",
    action: () =>
      window.open(
        "/dashboard/report-builder/new?template=patient-demographics",
        "_blank"
      ),
  },
  {
    title: "Dashboard Executivo",
    description: "Visão geral dos KPIs principais",
    icon: FileText,
    color: "bg-gray-100 text-gray-700",
    action: () => window.open("/dashboard/report-builder/new", "_blank"),
  },
];

function getStatusBadge(status: string) {
  switch (status) {
    case "published":
      return <Badge className="bg-green-100 text-green-700">Publicado</Badge>;
    case "draft":
      return <Badge variant="secondary">Rascunho</Badge>;
    case "scheduled":
      return <Badge className="bg-blue-100 text-blue-700">Agendado</Badge>;
    default:
      return <Badge variant="outline">Desconhecido</Badge>;
  }
}

function getTypeIcon(type: string) {
  switch (type) {
    case "financial":
      return <TrendingUp className="w-4 h-4" />;
    case "patients":
      return <BarChart3 className="w-4 h-4" />;
    case "marketing":
      return <TrendingUp className="w-4 h-4" />;
    case "inventory":
      return <BarChart3 className="w-4 h-4" />;
    default:
      return <FileText className="w-4 h-4" />;
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ReportBuilderMain() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredReports = recentReports.filter((report) => {
    const matchesSearch =
      report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || report.type === filterType;
    const matchesStatus =
      filterStatus === "all" || report.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreateReport = useCallback((templateId?: string) => {
    const url = templateId
      ? `/dashboard/report-builder/new?template=${templateId}`
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
            Crie relatórios personalizados com nossa ferramenta de arrastar e
            soltar
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/analytics">
              <Eye className="w-4 h-4 mr-2" />
              Analytics
            </Link>
          </Button>
          <Button onClick={() => handleCreateReport()}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Relatório
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickActions.map((action, index) => {
          const IconComponent = action.icon;
          return (
            <Card
              key={index}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={action.action}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${action.color}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm">{action.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reports">Meus Relatórios</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="shared">Compartilhados</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar relatórios..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="financial">Financeiro</SelectItem>
                <SelectItem value="patients">Pacientes</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="inventory">Estoque</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="published">Publicado</SelectItem>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="scheduled">Agendado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reports Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReports.map((report) => (
              <Card
                key={report.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(report.type)}
                      <CardTitle className="text-base">{report.name}</CardTitle>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <span className="sr-only">Abrir menu</span>
                          <svg
                            className="h-4 w-4"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <circle cx="12" cy="12" r="1" fill="currentColor" />
                            <circle cx="12" cy="5" r="1" fill="currentColor" />
                            <circle cx="12" cy="19" r="1" fill="currentColor" />
                          </svg>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/report-builder/${report.id}`}>
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="w-4 h-4 mr-2" />
                          Exportar
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Share className="w-4 h-4 mr-2" />
                          Compartilhar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription className="text-xs">
                    {report.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pb-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={report.avatar} />
                        <AvatarFallback>
                          {report.createdBy
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span>{report.createdBy}</span>
                    </div>
                    {getStatusBadge(report.status)}
                  </div>
                </CardContent>

                <CardFooter className="pt-0 pb-3">
                  <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                    <span>Modificado: {formatDate(report.lastModified)}</span>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/report-builder/${report.id}`}>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>

          {filteredReports.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                Nenhum relatório encontrado
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || filterType !== "all" || filterStatus !== "all"
                  ? "Tente ajustar os filtros de busca"
                  : "Comece criando seu primeiro relatório"}
              </p>
              <Button onClick={() => handleCreateReport()}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Relatório
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTemplates.map((template) => {
              const IconComponent = template.icon;
              return (
                <Card
                  key={template.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleCreateReport(template.id)}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${template.color}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base">
                          {template.name}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {template.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardFooter>
                    <Button className="w-full" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Usar Template
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="shared" className="space-y-4">
          <div className="text-center py-12">
            <Share className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              Relatórios Compartilhados
            </h3>
            <p className="text-muted-foreground">
              Aqui aparecerão os relatórios compartilhados com você
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

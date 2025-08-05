"use client";

import type {
  Activity,
  AlertCircle,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Download,
  Edit,
  Eye,
  FileText,
  Filter,
  Plus,
  Search,
  Share,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Input } from "@/components/ui/input";
import type { Label } from "@/components/ui/label";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Skeleton } from "@/components/ui/skeleton";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Textarea } from "@/components/ui/textarea";

interface FinancialReportsProps {
  reports?: any[];
  templates?: any[];
  loading?: boolean;
  onGenerateReport?: (config: any) => void;
  onScheduleReport?: (config: any) => void;
  onDeleteReport?: (id: string) => void;
  className?: string;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: "revenue" | "expenses" | "profit" | "cash_flow" | "custom";
  format: "pdf" | "excel" | "csv" | "html";
  frequency: "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "custom";
  sections: string[];
  parameters: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

interface GeneratedReport {
  id: string;
  templateId: string;
  name: string;
  type: string;
  format: string;
  status: "generating" | "completed" | "failed" | "scheduled";
  size: string;
  generatedAt: string;
  downloadUrl?: string;
  error?: string;
}

export function FinancialReports({
  reports = [],
  templates = [],
  loading = false,
  onGenerateReport,
  onScheduleReport,
  onDeleteReport,
  className = "",
}: FinancialReportsProps) {
  const [activeTab, setActiveTab] = useState<"reports" | "templates" | "scheduled">("reports");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);

  // Mock data for demonstration
  const mockTemplates: ReportTemplate[] = [
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

  const mockReports: GeneratedReport[] = [
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
  const filteredReports = mockReports.filter((report) => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || report.type === filterType;
    const matchesStatus = filterStatus === "all" || report.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const filteredTemplates = mockTemplates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || template.type === filterType;
    return matchesSearch && matchesType;
  });

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { label: "Concluído", variant: "default" as const, icon: CheckCircle },
      generating: { label: "Gerando", variant: "secondary" as const, icon: Clock },
      failed: { label: "Falhou", variant: "destructive" as const, icon: AlertCircle },
      scheduled: { label: "Agendado", variant: "outline" as const, icon: Calendar },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;

    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  // Get type icon
  const getTypeIcon = (type: string) => {
    const icons = {
      revenue: DollarSign,
      expenses: TrendingUp,
      profit: BarChart3,
      cash_flow: Activity,
      custom: FileText,
    };
    return icons[type as keyof typeof icons] || FileText;
  };

  // Handle report generation
  const handleGenerateReport = (templateId: string) => {
    const template = mockTemplates.find((t) => t.id === templateId);
    if (template && onGenerateReport) {
      onGenerateReport({
        templateId,
        parameters: template.parameters,
        format: template.format,
      });
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Relatórios Financeiros</h2>
          <p className="text-muted-foreground">
            Gerencie e visualize relatórios financeiros personalizados
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => setShowScheduleDialog(true)} variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Agendar
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Relatório
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar relatórios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="revenue">Receita</SelectItem>
              <SelectItem value="expenses">Despesas</SelectItem>
              <SelectItem value="profit">Lucro</SelectItem>
              <SelectItem value="cash_flow">Fluxo de Caixa</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>

          {activeTab === "reports" && (
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="generating">Gerando</SelectItem>
                <SelectItem value="failed">Falhou</SelectItem>
                <SelectItem value="scheduled">Agendado</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
        <TabsList>
          <TabsTrigger value="reports">Relatórios Gerados</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="scheduled">Agendados</TabsTrigger>
        </TabsList>

        {/* Generated Reports */}
        <TabsContent value="reports" className="space-y-4">
          {filteredReports.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum relatório encontrado</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {searchTerm || filterType !== "all" || filterStatus !== "all"
                    ? "Tente ajustar os filtros de busca"
                    : "Comece criando seu primeiro relatório"}
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Relatório
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReports.map((report) => {
                const TypeIcon = getTypeIcon(report.type);
                return (
                  <Card key={report.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <TypeIcon className="h-5 w-5 text-muted-foreground" />
                          <CardTitle className="text-lg">{report.name}</CardTitle>
                        </div>
                        {getStatusBadge(report.status)}
                      </div>
                      <CardDescription>
                        {report.format.toUpperCase()} • {report.size}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm text-muted-foreground">
                          Gerado em: {formatDate(report.generatedAt)}
                        </div>

                        <div className="flex items-center gap-2">
                          {report.status === "completed" && report.downloadUrl && (
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            Visualizar
                          </Button>
                          <Button size="sm" variant="outline">
                            <Share className="h-4 w-4 mr-2" />
                            Compartilhar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Templates */}
        <TabsContent value="templates" className="space-y-4">
          {filteredTemplates.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum template encontrado</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {searchTerm || filterType !== "all"
                    ? "Tente ajustar os filtros de busca"
                    : "Comece criando seu primeiro template"}
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Template
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => {
                const TypeIcon = getTypeIcon(template.type);
                return (
                  <Card key={template.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <TypeIcon className="h-5 w-5 text-muted-foreground" />
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                        </div>
                        <Badge variant="outline">{template.frequency}</Badge>
                      </div>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
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
                          <Button size="sm" onClick={() => handleGenerateReport(template.id)}>
                            <FileText className="h-4 w-4 mr-2" />
                            Gerar
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedTemplate(template);
                              setShowScheduleDialog(true);
                            }}
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            Agendar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Scheduled Reports */}
        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Relatórios Agendados</h3>
              <p className="text-muted-foreground text-center mb-4">
                Visualize e gerencie relatórios agendados para geração automática
              </p>
              <Button onClick={() => setShowScheduleDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Agendar Relatório
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Report Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Criar Novo Relatório</DialogTitle>
            <DialogDescription>
              Configure um novo relatório financeiro personalizado
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="report-name">Nome do Relatório</Label>
                <Input id="report-name" placeholder="Ex: Análise Mensal de Receita" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="report-type">Tipo</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="revenue">Receita</SelectItem>
                    <SelectItem value="expenses">Despesas</SelectItem>
                    <SelectItem value="profit">Lucro</SelectItem>
                    <SelectItem value="cash_flow">Fluxo de Caixa</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="report-description">Descrição</Label>
              <Textarea
                id="report-description"
                placeholder="Descreva o objetivo e conteúdo do relatório"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="report-format">Formato</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o formato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="html">HTML</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="report-frequency">Frequência</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a frequência" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diário</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                    <SelectItem value="quarterly">Trimestral</SelectItem>
                    <SelectItem value="yearly">Anual</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setShowCreateDialog(false)}>Criar Relatório</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Report Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agendar Relatório</DialogTitle>
            <DialogDescription>Configure a geração automática de relatórios</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="schedule-template">Template</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um template" />
                </SelectTrigger>
                <SelectContent>
                  {mockTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="schedule-frequency">Frequência</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Frequência" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diário</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                    <SelectItem value="quarterly">Trimestral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="schedule-time">Horário</Label>
                <Input id="schedule-time" type="time" defaultValue="09:00" />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setShowScheduleDialog(false)}>Agendar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default FinancialReports;

"use client";

import {
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Download,
  Eye,
  FileText,
  Filter,
  Package,
  PieChart,
  Save,
  Settings,
  Share,
  TrendingUp,
} from "lucide-react";
import type React from "react";
import { useCallback, useState } from "react";
import type { DateRange } from "react-day-picker";
import { toast } from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useReports } from "@/hooks/inventory/use-reports";

interface ReportSection {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: "analytics" | "performance" | "financial" | "operational";
  enabled: boolean;
}

interface ReportMetric {
  id: string;
  name: string;
  description: string;
  category: "kpi" | "trend" | "comparison";
  enabled: boolean;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  sections: string[];
  metrics: string[];
  groupBy: "category" | "supplier" | "product";
  format: "pdf" | "excel" | "csv";
}

const AVAILABLE_SECTIONS: ReportSection[] = [
  {
    id: "overview",
    title: "Visão Geral",
    description: "KPIs principais e resumo executivo",
    icon: BarChart3,
    category: "analytics",
    enabled: true,
  },
  {
    id: "turnover",
    title: "Análise de Giro",
    description: "Taxa de rotação e tempo em estoque",
    icon: TrendingUp,
    category: "performance",
    enabled: false,
  },
  {
    id: "categories",
    title: "Performance por Categoria",
    description: "Análise detalhada por categoria de produtos",
    icon: PieChart,
    category: "analytics",
    enabled: false,
  },
  {
    id: "financial",
    title: "Análise Financeira",
    description: "Custos, margens e investimento em estoque",
    icon: DollarSign,
    category: "financial",
    enabled: false,
  },
  {
    id: "suppliers",
    title: "Performance de Fornecedores",
    description: "Avaliação de pontualidade e qualidade",
    icon: Package,
    category: "operational",
    enabled: false,
  },
  {
    id: "alerts",
    title: "Alertas e Recomendações",
    description: "Produtos críticos e ações sugeridas",
    icon: AlertTriangle,
    category: "operational",
    enabled: false,
  },
  {
    id: "movements",
    title: "Movimentação de Estoque",
    description: "Histórico de entradas e saídas",
    icon: Activity,
    category: "operational",
    enabled: false,
  },
  {
    id: "predictive",
    title: "Análise Preditiva",
    description: "Previsão de demanda e recomendações",
    icon: Clock,
    category: "analytics",
    enabled: false,
  },
];

const AVAILABLE_METRICS: ReportMetric[] = [
  {
    id: "turnover-rate",
    name: "Taxa de Giro",
    description: "Velocidade de rotação do estoque",
    category: "kpi",
    enabled: true,
  },
  {
    id: "stock-accuracy",
    name: "Acurácia do Estoque",
    description: "Precisão entre físico e sistema",
    category: "kpi",
    enabled: true,
  },
  {
    id: "carrying-cost",
    name: "Custo de Carregamento",
    description: "Custo total de manutenção",
    category: "kpi",
    enabled: false,
  },
  {
    id: "stockout-rate",
    name: "Taxa de Ruptura",
    description: "Percentual de produtos em falta",
    category: "kpi",
    enabled: false,
  },
  {
    id: "fill-rate",
    name: "Taxa de Atendimento",
    description: "Percentual de pedidos completos",
    category: "kpi",
    enabled: false,
  },
  {
    id: "lead-time",
    name: "Lead Time Médio",
    description: "Tempo médio de reposição",
    category: "kpi",
    enabled: false,
  },
  {
    id: "demand-trend",
    name: "Tendência de Demanda",
    description: "Variação da demanda ao longo do tempo",
    category: "trend",
    enabled: false,
  },
  {
    id: "abc-distribution",
    name: "Distribuição ABC",
    description: "Classificação por importância",
    category: "comparison",
    enabled: false,
  },
];

const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: "executive",
    name: "Relatório Executivo",
    description: "Resumo gerencial com KPIs principais",
    sections: ["overview", "financial", "alerts"],
    metrics: ["turnover-rate", "stock-accuracy", "carrying-cost"],
    groupBy: "category",
    format: "pdf",
  },
  {
    id: "operational",
    name: "Relatório Operacional",
    description: "Análise detalhada para equipe operacional",
    sections: ["turnover", "movements", "suppliers", "alerts"],
    metrics: ["turnover-rate", "stockout-rate", "fill-rate", "lead-time"],
    groupBy: "product",
    format: "excel",
  },
  {
    id: "analytical",
    name: "Relatório Analítico",
    description: "Análise completa com insights preditivos",
    sections: ["overview", "categories", "turnover", "predictive"],
    metrics: ["turnover-rate", "stock-accuracy", "demand-trend", "abc-distribution"],
    groupBy: "category",
    format: "pdf",
  },
];

export function CustomReportBuilder() {
  const [sections, setSections] = useState<ReportSection[]>(AVAILABLE_SECTIONS);
  const [metrics, setMetrics] = useState<ReportMetric[]>(AVAILABLE_METRICS);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [groupBy, setGroupBy] = useState<"category" | "supplier" | "product">("category");
  const [format, setFormat] = useState<"pdf" | "excel" | "csv">("pdf");
  const [reportTitle, setReportTitle] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");

  const { generateCustomReport, exportReport, isGenerating } = useReports();

  const handleSectionToggle = useCallback((sectionId: string) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId ? { ...section, enabled: !section.enabled } : section,
      ),
    );
  }, []);

  const handleMetricToggle = useCallback((metricId: string) => {
    setMetrics((prev) =>
      prev.map((metric) =>
        metric.id === metricId ? { ...metric, enabled: !metric.enabled } : metric,
      ),
    );
  }, []);

  const handleTemplateSelect = useCallback((templateId: string) => {
    const template = REPORT_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;

    setSelectedTemplate(templateId);
    setGroupBy(template.groupBy);
    setFormat(template.format);

    // Update sections
    setSections((prev) =>
      prev.map((section) => ({
        ...section,
        enabled: template.sections.includes(section.id),
      })),
    );

    // Update metrics
    setMetrics((prev) =>
      prev.map((metric) => ({
        ...metric,
        enabled: template.metrics.includes(metric.id),
      })),
    );

    setReportTitle(template.name);
    setReportDescription(template.description);

    toast.success(`Template "${template.name}" aplicado!`);
  }, []);

  const handleGenerateReport = useCallback(async () => {
    const enabledSections = sections.filter((s) => s.enabled).map((s) => s.id);
    const enabledMetrics = metrics.filter((m) => m.enabled).map((m) => m.id);

    if (enabledSections.length === 0) {
      toast.error("Selecione pelo menos uma seção para o relatório");
      return;
    }

    try {
      const reportData = await generateCustomReport({
        sections: enabledSections,
        dateRange,
        groupBy,
        metrics: enabledMetrics,
      });

      if (reportData) {
        // Proceed to export
        await exportReport({
          type: format,
          filters: { dateRange },
          templateType: "detailed",
        });
      }
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      toast.error("Erro ao gerar relatório personalizado");
    }
  }, [sections, metrics, dateRange, groupBy, format, generateCustomReport, exportReport]);

  const enabledSectionsCount = sections.filter((s) => s.enabled).length;
  const enabledMetricsCount = metrics.filter((m) => m.enabled).length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Constructor de Relatórios</h1>
          <p className="text-muted-foreground mt-1">
            Crie relatórios personalizados de análise de estoque
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Salvar Template
          </Button>
          <Button variant="outline" size="sm">
            <Share className="h-4 w-4 mr-2" />
            Compartilhar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Templates Pré-definidos</span>
              </CardTitle>
              <CardDescription>Selecione um template como ponto de partida</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {REPORT_TEMPLATES.map((template) => (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-colors hover:bg-accent ${
                      selectedTemplate === template.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <CardDescription className="text-sm">{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{template.sections.length} seções</span>
                        <Badge variant="outline">{template.format.toUpperCase()}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
          {/* Report Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Configuração do Relatório</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="report-title">Título do Relatório</Label>
                  <Input
                    id="report-title"
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    placeholder="Digite o título do relatório"
                  />
                </div>

                <div>
                  <Label htmlFor="format">Formato de Exportação</Label>
                  <Select
                    value={format}
                    onValueChange={(value: "pdf" | "excel" | "csv") => setFormat(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="report-description">Descrição</Label>
                <Textarea
                  id="report-description"
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Descrição opcional do relatório"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Período de Análise</Label>
                  <DatePickerWithRange
                    value={dateRange}
                    onChange={setDateRange}
                    placeholder="Selecionar período"
                  />
                </div>

                <div>
                  <Label htmlFor="group-by">Agrupar Por</Label>
                  <Select
                    value={groupBy}
                    onValueChange={(value: "category" | "supplier" | "product") =>
                      setGroupBy(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="category">Categoria</SelectItem>
                      <SelectItem value="supplier">Fornecedor</SelectItem>
                      <SelectItem value="product">Produto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>{" "}
          {/* Sections Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Seções do Relatório</span>
                <Badge variant="secondary">{enabledSectionsCount} selecionadas</Badge>
              </CardTitle>
              <CardDescription>Escolha as seções que serão incluídas no relatório</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <div key={section.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={section.id}
                        checked={section.enabled}
                        onCheckedChange={() => handleSectionToggle(section.id)}
                      />
                      <div className="flex items-center space-x-2 flex-1">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <Label
                            htmlFor={section.id}
                            className="text-sm font-medium cursor-pointer"
                          >
                            {section.title}
                          </Label>
                          <p className="text-xs text-muted-foreground">{section.description}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {section.category}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          {/* Metrics Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Métricas e KPIs</span>
                <Badge variant="secondary">{enabledMetricsCount} selecionadas</Badge>
              </CardTitle>
              <CardDescription>
                Selecione as métricas que serão calculadas e exibidas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.map((metric) => (
                  <div key={metric.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id={metric.id}
                        checked={metric.enabled}
                        onCheckedChange={() => handleMetricToggle(metric.id)}
                      />
                      <div>
                        <Label htmlFor={metric.id} className="text-sm font-medium cursor-pointer">
                          {metric.name}
                        </Label>
                        <p className="text-xs text-muted-foreground">{metric.description}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {metric.category}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>Prévia do Relatório</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-sm mb-2">Título</h4>
                <p className="text-sm text-muted-foreground">
                  {reportTitle || "Relatório de Estoque Personalizado"}
                </p>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium text-sm mb-2">Configuração</h4>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>Formato: {format.toUpperCase()}</p>
                  <p>
                    Agrupamento:{" "}
                    {groupBy === "category"
                      ? "Categoria"
                      : groupBy === "supplier"
                        ? "Fornecedor"
                        : "Produto"}
                  </p>
                  <p>Período: {dateRange ? "Personalizado" : "Último mês"}</p>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium text-sm mb-2">Seções Incluídas</h4>
                <div className="space-y-1">
                  {sections
                    .filter((s) => s.enabled)
                    .map((section) => (
                      <div key={section.id} className="flex items-center space-x-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span className="text-xs">{section.title}</span>
                      </div>
                    ))}
                  {enabledSectionsCount === 0 && (
                    <p className="text-xs text-muted-foreground">Nenhuma seção selecionada</p>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium text-sm mb-2">Métricas Incluídas</h4>
                <div className="space-y-1">
                  {metrics
                    .filter((m) => m.enabled)
                    .map((metric) => (
                      <div key={metric.id} className="flex items-center space-x-2">
                        <CheckCircle className="h-3 w-3 text-blue-500" />
                        <span className="text-xs">{metric.name}</span>
                      </div>
                    ))}
                  {enabledMetricsCount === 0 && (
                    <p className="text-xs text-muted-foreground">Nenhuma métrica selecionada</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generation Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Gerar Relatório</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleGenerateReport}
                disabled={isGenerating || enabledSectionsCount === 0}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Gerando...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Gerar e Baixar
                  </>
                )}
              </Button>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>• O relatório será gerado com base nas configurações selecionadas</p>
                <p>• Tempo estimado: 30-60 segundos</p>
                <p>• O arquivo será baixado automaticamente quando pronto</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Estatísticas do Relatório</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Seções</span>
                <Badge variant={enabledSectionsCount > 0 ? "default" : "secondary"}>
                  {enabledSectionsCount}/{sections.length}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Métricas</span>
                <Badge variant={enabledMetricsCount > 0 ? "default" : "secondary"}>
                  {enabledMetricsCount}/{metrics.length}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Formato</span>
                <Badge variant="outline">{format.toUpperCase()}</Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Complexidade</span>
                <Badge
                  variant={
                    enabledSectionsCount + enabledMetricsCount > 8
                      ? "destructive"
                      : enabledSectionsCount + enabledMetricsCount > 4
                        ? "default"
                        : "secondary"
                  }
                >
                  {enabledSectionsCount + enabledMetricsCount > 8
                    ? "Alta"
                    : enabledSectionsCount + enabledMetricsCount > 4
                      ? "Média"
                      : "Baixa"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

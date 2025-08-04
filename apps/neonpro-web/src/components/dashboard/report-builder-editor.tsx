"use client";

import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Copy,
  Database,
  Download,
  Eye,
  Filter,
  Grid3X3,
  Image,
  LineChart,
  Move,
  PieChart,
  Play,
  Plus,
  Save,
  Share,
  Table,
  Trash2,
  Type,
} from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ReportComponent {
  id: string;
  type: "chart" | "table" | "kpi" | "text" | "image" | "filter";
  x: number;
  y: number;
  width: number;
  height: number;
  config: Record<string, any>;
}

interface ReportBuilderEditorProps {
  reportId?: string;
}

const componentLibrary = [
  {
    type: "chart",
    name: "Gráfico",
    icon: BarChart3,
    description: "Gráficos de linha, barra, pizza, etc.",
    variants: [
      { id: "line", name: "Linha", icon: LineChart },
      { id: "bar", name: "Barra", icon: BarChart3 },
      { id: "pie", name: "Pizza", icon: PieChart },
    ],
  },
  {
    type: "table",
    name: "Tabela",
    icon: Table,
    description: "Tabelas de dados com filtros e ordenação",
  },
  {
    type: "kpi",
    name: "KPI",
    icon: Grid3X3,
    description: "Indicadores chave de performance",
  },
  {
    type: "filter",
    name: "Filtro",
    icon: Filter,
    description: "Controles de filtro para dados",
  },
  {
    type: "text",
    name: "Texto",
    icon: Type,
    description: "Títulos, labels e textos",
  },
  {
    type: "image",
    name: "Imagem",
    icon: Image,
    description: "Logos, imagens e ícones",
  },
];

const dataSources = [
  {
    id: "patients",
    name: "Pacientes",
    icon: Database,
    description: "Dados de pacientes e consultas",
    tables: ["patients", "appointments", "medical_records"],
  },
  {
    id: "financial",
    name: "Financeiro",
    icon: Database,
    description: "Receitas, pagamentos e faturamento",
    tables: ["payments", "invoices", "financial_summary"],
  },
  {
    id: "inventory",
    name: "Estoque",
    icon: Database,
    description: "Produtos, fornecedores e movimentação",
    tables: ["inventory_items", "suppliers", "inventory_movements"],
  },
  {
    id: "marketing",
    name: "Marketing",
    icon: Database,
    description: "Campanhas, segmentação e conversão",
    tables: ["marketing_campaigns", "patient_segments", "campaign_analytics"],
  },
];

export function ReportBuilderEditor({ reportId }: ReportBuilderEditorProps) {
  const [reportName, setReportName] = useState("Novo Relatório");
  const [reportDescription, setReportDescription] = useState("");
  const [selectedDataSource, setSelectedDataSource] = useState("");
  const [components, setComponents] = useState<ReportComponent[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(
    null
  );
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 800 });
  const [showPreview, setShowPreview] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Mock report data if editing existing report
  React.useEffect(() => {
    if (reportId && reportId !== "new") {
      // Load existing report data
      setReportName("Relatório de Receita Mensal");
      setReportDescription(
        "Análise detalhada da receita por mês e procedimento"
      );
      setSelectedDataSource("financial");

      // Mock components
      setComponents([
        {
          id: "1",
          type: "kpi",
          x: 50,
          y: 50,
          width: 200,
          height: 100,
          config: {
            title: "Receita Total",
            value: "R$ 45.750,00",
            change: "+8.2%",
          },
        },
        {
          id: "2",
          type: "chart",
          x: 300,
          y: 50,
          width: 400,
          height: 250,
          config: {
            type: "line",
            title: "Receita por Mês",
            dataSource: "financial",
            xAxis: "month",
            yAxis: "revenue",
          },
        },
      ]);
    }
  }, [reportId]);

  const handleAddComponent = useCallback(
    (type: string, variant?: string) => {
      const newComponent: ReportComponent = {
        id: Date.now().toString(),
        type: type as any,
        x: 100,
        y: 100,
        width: type === "kpi" ? 200 : type === "text" ? 300 : 400,
        height: type === "kpi" ? 120 : type === "text" ? 60 : 250,
        config: {
          title: `Novo ${type}`,
          variant: variant,
          dataSource: selectedDataSource,
        },
      };

      setComponents((prev) => [...prev, newComponent]);
      setSelectedComponent(newComponent.id);
    },
    [selectedDataSource]
  );

  const handleComponentSelect = useCallback((id: string) => {
    setSelectedComponent(id);
  }, []);

  const handleComponentDelete = useCallback(
    (id: string) => {
      setComponents((prev) => prev.filter((comp) => comp.id !== id));
      if (selectedComponent === id) {
        setSelectedComponent(null);
      }
    },
    [selectedComponent]
  );

  const handleComponentUpdate = useCallback(
    (id: string, updates: Partial<ReportComponent>) => {
      setComponents((prev) =>
        prev.map((comp) => (comp.id === id ? { ...comp, ...updates } : comp))
      );
    },
    []
  );

  const handleSave = useCallback(async () => {
    // Implement save logic
    console.log("Saving report:", {
      name: reportName,
      description: reportDescription,
      dataSource: selectedDataSource,
      components,
    });
  }, [reportName, reportDescription, selectedDataSource, components]);

  const selectedComponentData = useMemo(() => {
    return components.find((comp) => comp.id === selectedComponent);
  }, [components, selectedComponent]);

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-background p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <Input
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                className="text-lg font-semibold border-none p-0 h-auto"
                placeholder="Nome do relatório"
              />
              <Input
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                className="text-sm text-muted-foreground border-none p-0 h-auto mt-1"
                placeholder="Descrição do relatório"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="w-4 h-4 mr-2" />
              {showPreview ? "Editor" : "Preview"}
            </Button>

            <Button variant="outline" size="sm">
              <Play className="w-4 h-4 mr-2" />
              Executar
            </Button>

            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>

            <Button variant="outline" size="sm">
              <Share className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>

            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Left Sidebar - Components & Data Sources */}
        <div
          className={`border-r bg-muted/30 transition-all duration-300 ${
            sidebarCollapsed ? "w-12" : "w-80"
          }`}
        >
          <div className="p-4">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start mb-4"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4 mr-2" />
              )}
              {!sidebarCollapsed && "Recolher"}
            </Button>

            {!sidebarCollapsed && (
              <Tabs defaultValue="components" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="components">Componentes</TabsTrigger>
                  <TabsTrigger value="data">Dados</TabsTrigger>
                </TabsList>

                <TabsContent value="components" className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-3">
                      Biblioteca de Componentes
                    </h3>
                    <div className="space-y-2">
                      {componentLibrary.map((component) => {
                        const IconComponent = component.icon;
                        return (
                          <Card
                            key={component.type}
                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => handleAddComponent(component.type)}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-center gap-2">
                                <IconComponent className="w-4 h-4 text-primary" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium">
                                    {component.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {component.description}
                                  </p>
                                </div>
                                <Plus className="w-3 h-3 text-muted-foreground" />
                              </div>

                              {component.variants && (
                                <div className="mt-2 flex gap-1">
                                  {component.variants.map((variant) => {
                                    const VariantIcon = variant.icon;
                                    return (
                                      <Button
                                        key={variant.id}
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 px-2"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleAddComponent(
                                            component.type,
                                            variant.id
                                          );
                                        }}
                                      >
                                        <VariantIcon className="w-3 h-3" />
                                      </Button>
                                    );
                                  })}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="data" className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-3">
                      Fontes de Dados
                    </h3>
                    <div className="space-y-2">
                      {dataSources.map((source) => {
                        const IconComponent = source.icon;
                        return (
                          <Card
                            key={source.id}
                            className={`cursor-pointer transition-colors ${
                              selectedDataSource === source.id
                                ? "ring-2 ring-primary bg-primary/5"
                                : "hover:bg-muted/50"
                            }`}
                            onClick={() => setSelectedDataSource(source.id)}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-center gap-2">
                                <IconComponent className="w-4 h-4 text-primary" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium">
                                    {source.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {source.description}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-2 flex flex-wrap gap-1">
                                {source.tables.map((table) => (
                                  <Badge
                                    key={table}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {table}
                                  </Badge>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>

        {/* Main Canvas */}
        <div className="flex-1 bg-background overflow-auto">
          <div
            className="relative"
            style={{ width: canvasSize.width, height: canvasSize.height }}
          >
            {/* Grid Background */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "radial-gradient(circle, #e5e7eb 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />

            {/* Components */}
            {components.map((component) => (
              <div
                key={component.id}
                className={`absolute border-2 rounded-lg bg-white shadow-sm cursor-move transition-all ${
                  selectedComponent === component.id
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border hover:border-primary/50"
                }`}
                style={{
                  left: component.x,
                  top: component.y,
                  width: component.width,
                  height: component.height,
                }}
                onClick={() => handleComponentSelect(component.id)}
              >
                <div className="p-4 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium">
                      {component.config.title || `${component.type} Component`}
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleComponentDelete(component.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>

                  <div className="flex-1 bg-muted/30 rounded flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      {component.type === "chart" && (
                        <BarChart3 className="w-8 h-8 mx-auto mb-2" />
                      )}
                      {component.type === "table" && (
                        <Table className="w-8 h-8 mx-auto mb-2" />
                      )}
                      {component.type === "kpi" && (
                        <Grid3X3 className="w-8 h-8 mx-auto mb-2" />
                      )}
                      {component.type === "filter" && (
                        <Filter className="w-8 h-8 mx-auto mb-2" />
                      )}
                      {component.type === "text" && (
                        <Type className="w-8 h-8 mx-auto mb-2" />
                      )}
                      {component.type === "image" && (
                        <Image className="w-8 h-8 mx-auto mb-2" />
                      )}
                      <p className="text-xs capitalize">{component.type}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Empty State */}
            {components.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    Comece criando seu relatório
                  </h3>
                  <p className="text-sm mb-4">
                    Arraste componentes da barra lateral para começar
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => handleAddComponent("chart")}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Primeiro Componente
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        {selectedComponentData && (
          <div className="w-80 border-l bg-muted/30 p-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-3">
                  Propriedades do Componente
                </h3>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="component-title" className="text-xs">
                      Título
                    </Label>
                    <Input
                      id="component-title"
                      value={selectedComponentData.config.title || ""}
                      onChange={(e) =>
                        handleComponentUpdate(selectedComponentData.id, {
                          config: {
                            ...selectedComponentData.config,
                            title: e.target.value,
                          },
                        })
                      }
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="component-width" className="text-xs">
                        Largura
                      </Label>
                      <Input
                        id="component-width"
                        type="number"
                        value={selectedComponentData.width}
                        onChange={(e) =>
                          handleComponentUpdate(selectedComponentData.id, {
                            width: parseInt(e.target.value) || 0,
                          })
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="component-height" className="text-xs">
                        Altura
                      </Label>
                      <Input
                        id="component-height"
                        type="number"
                        value={selectedComponentData.height}
                        onChange={(e) =>
                          handleComponentUpdate(selectedComponentData.id, {
                            height: parseInt(e.target.value) || 0,
                          })
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {selectedComponentData.type === "chart" && (
                    <div>
                      <Label htmlFor="chart-type" className="text-xs">
                        Tipo de Gráfico
                      </Label>
                      <Select
                        value={selectedComponentData.config.variant || "line"}
                        onValueChange={(value) =>
                          handleComponentUpdate(selectedComponentData.id, {
                            config: {
                              ...selectedComponentData.config,
                              variant: value,
                            },
                          })
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="line">Linha</SelectItem>
                          <SelectItem value="bar">Barra</SelectItem>
                          <SelectItem value="pie">Pizza</SelectItem>
                          <SelectItem value="area">Área</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="data-source" className="text-xs">
                      Fonte de Dados
                    </Label>
                    <Select
                      value={selectedComponentData.config.dataSource || ""}
                      onValueChange={(value) =>
                        handleComponentUpdate(selectedComponentData.id, {
                          config: {
                            ...selectedComponentData.config,
                            dataSource: value,
                          },
                        })
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Selecionar fonte" />
                      </SelectTrigger>
                      <SelectContent>
                        {dataSources.map((source) => (
                          <SelectItem key={source.id} value={source.id}>
                            {source.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium mb-3">Ações</h4>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <Move className="w-4 h-4 mr-2" />
                    Mover para Frente
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() =>
                      handleComponentDelete(selectedComponentData.id)
                    }
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remover
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

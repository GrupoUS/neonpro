"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  Calendar,
  Download,
  Eye,
  Grid,
  Image,
  Layers,
  Plus,
  Save,
  Trash2,
  Type,
} from "lucide-react";
import { useState } from "react";

// Types for the Report Builder
interface ReportElement {
  id: string;
  type: "chart" | "table" | "metric" | "text" | "image";
  title: string;
  config: any;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  elements: ReportElement[];
  thumbnail?: string;
  isPublic: boolean;
  usageCount: number;
  rating: number;
}

interface ReportSchedule {
  id: string;
  reportId: string;
  name: string;
  frequency: "daily" | "weekly" | "monthly";
  time: string;
  recipients: string[];
  format: "pdf" | "excel" | "csv";
  isActive: boolean;
}

// Visual components maintaining NeonPro design
const NeonGradientCard = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <motion.div
    animate={{ opacity: 1, y: 0 }}
    className={`relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/90 to-blue-900/30 backdrop-blur-sm ${className}`}
    initial={{ opacity: 0, y: 20 }}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-50" />
    <div className="relative z-10 p-6">{children}</div>
  </motion.div>
);

const CosmicGlowButton = ({
  children,
  variant = "primary",
  size = "md",
  onClick,
  className = "",
  disabled = false,
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) => {
  const variants = {
    primary:
      "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700",
    secondary:
      "bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800",
    success:
      "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700",
    warning:
      "bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700",
    danger:
      "bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <motion.button
      className={`inline-flex items-center gap-2 rounded-lg font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 ${
        variants[variant]
      } ${sizes[size]} ${className}`}
      disabled={disabled}
      onClick={onClick}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
    >
      {children}
    </motion.button>
  );
};

// Element Palette Component
const ElementPalette = ({
  onAddElement,
}: {
  onAddElement: (type: string) => void;
}) => {
  const elementTypes = [
    {
      type: "chart",
      label: "Gráfico",
      icon: BarChart3,
      description: "Gráficos de linha, barra, pizza",
    },
    {
      type: "table",
      label: "Tabela",
      icon: Grid,
      description: "Tabelas de dados",
    },
    {
      type: "metric",
      label: "Métrica",
      icon: Activity,
      description: "KPIs e indicadores",
    },
    {
      type: "text",
      label: "Texto",
      icon: Type,
      description: "Títulos e parágrafos",
    },
    {
      type: "image",
      label: "Imagem",
      icon: Image,
      description: "Logotipos e gráficos",
    },
  ];

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg text-white">Elementos</h3>
      <div className="space-y-2">
        {elementTypes.map((element) => {
          const Icon = element.icon;
          return (
            <motion.div
              className="cursor-pointer rounded-lg border border-slate-700 bg-white/5 p-3 transition-all duration-200 hover:border-blue-400"
              key={element.type}
              onClick={() => onAddElement(element.type)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-3">
                <Icon className="h-5 w-5 text-blue-400" />
                <div className="flex-1">
                  <div className="font-medium text-white">{element.label}</div>
                  <div className="text-slate-400 text-xs">
                    {element.description}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// Main Custom Report Builder Component
export default function CustomReportBuilder() {
  const [activeTab, setActiveTab] = useState("builder");
  const [elements, setElements] = useState<ReportElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>();
  const [reportName, setReportName] = useState("Novo Relatório");
  const [reportDescription, setReportDescription] = useState("");

  // Mock data for templates
  const mockTemplates: ReportTemplate[] = [
    {
      id: "1",
      name: "Relatório Financeiro Mensal",
      description: "Análise completa de receitas, custos e lucros mensais",
      category: "financial",
      elements: [],
      isPublic: true,
      usageCount: 45,
      rating: 4.8,
    },
    {
      id: "2",
      name: "Dashboard de Satisfação do Paciente",
      description: "Métricas de satisfação e feedback dos pacientes",
      category: "clinical",
      elements: [],
      isPublic: true,
      usageCount: 32,
      rating: 4.6,
    },
    {
      id: "3",
      name: "Relatório de Conformidade LGPD",
      description: "Status de conformidade e auditoria de dados",
      category: "compliance",
      elements: [],
      isPublic: true,
      usageCount: 28,
      rating: 4.9,
    },
  ];

  const addElement = (type: string) => {
    const newElement: ReportElement = {
      id: Date.now().toString(),
      type: type as any,
      title: `Novo ${type}`,
      config: {},
      position: { x: 50, y: 50 },
      size: { width: 300, height: 200 },
    };
    setElements([...elements, newElement]);
  };

  const deleteElement = (id: string) => {
    setElements(elements.filter((el) => el.id !== id));
    if (selectedElement === id) {
      setSelectedElement(undefined);
    }
  };

  const exportReport = (_format: "pdf" | "excel" | "csv") => {};

  const saveReport = () => {};

  const previewReport = () => {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="font-bold text-3xl text-white">
              Custom Report Builder
            </h1>
            <p className="text-slate-400">
              Crie relatórios personalizados com interface drag-and-drop
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <CosmicGlowButton
              onClick={previewReport}
              size="sm"
              variant="secondary"
            >
              <Eye className="mr-2 h-4 w-4" />
              Visualizar
            </CosmicGlowButton>

            <CosmicGlowButton onClick={saveReport} size="sm" variant="success">
              <Save className="mr-2 h-4 w-4" />
              Salvar
            </CosmicGlowButton>

            <div className="flex items-center space-x-1">
              <CosmicGlowButton
                onClick={() => exportReport("pdf")}
                size="sm"
                variant="primary"
              >
                <Download className="mr-2 h-4 w-4" />
                PDF
              </CosmicGlowButton>
              <CosmicGlowButton
                onClick={() => exportReport("excel")}
                size="sm"
                variant="primary"
              >
                Excel
              </CosmicGlowButton>
              <CosmicGlowButton
                onClick={() => exportReport("csv")}
                size="sm"
                variant="primary"
              >
                CSV
              </CosmicGlowButton>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs className="w-full" onValueChange={setActiveTab} value={activeTab}>
          <TabsList className="grid w-full grid-cols-3 border-slate-700 bg-slate-800/50">
            <TabsTrigger
              className="data-[state=active]:bg-blue-600"
              value="builder"
            >
              Construtor
            </TabsTrigger>
            <TabsTrigger
              className="data-[state=active]:bg-blue-600"
              value="templates"
            >
              Templates
            </TabsTrigger>
            <TabsTrigger
              className="data-[state=active]:bg-blue-600"
              value="scheduler"
            >
              Agendamentos
            </TabsTrigger>
          </TabsList>

          {/* Report Builder Tab */}
          <TabsContent className="space-y-6" value="builder">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
              {/* Left Sidebar - Tools */}
              <div className="lg:col-span-1">
                <NeonGradientCard>
                  <div className="space-y-6">
                    {/* Report Info */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg text-white">
                        Configurações
                      </h3>
                      <div className="space-y-2">
                        <Label className="text-slate-300" htmlFor="report-name">
                          Nome do Relatório
                        </Label>
                        <Input
                          className="border-slate-600 bg-slate-800 text-white"
                          id="report-name"
                          onChange={(e) => setReportName(e.target.value)}
                          value={reportName}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          className="text-slate-300"
                          htmlFor="report-description"
                        >
                          Descrição
                        </Label>
                        <Textarea
                          className="border-slate-600 bg-slate-800 text-white"
                          id="report-description"
                          onChange={(e) => setReportDescription(e.target.value)}
                          rows={3}
                          value={reportDescription}
                        />
                      </div>
                    </div>

                    {/* Element Palette */}
                    <ElementPalette onAddElement={addElement} />

                    {/* Element Properties */}
                    {selectedElement && (
                      <div className="space-y-3">
                        <h3 className="font-semibold text-lg text-white">
                          Propriedades
                        </h3>
                        <div className="rounded-lg bg-white/5 p-3">
                          <p className="text-slate-300 text-sm">
                            Elemento selecionado:{" "}
                            {
                              elements.find((el) => el.id === selectedElement)
                                ?.title
                            }
                          </p>
                          <div className="mt-2 space-y-2">
                            <Label className="text-slate-400">
                              Configurações avançadas estarão aqui
                            </Label>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </NeonGradientCard>
              </div>

              {/* Main Canvas */}
              <div className="lg:col-span-3">
                <NeonGradientCard>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg text-white">
                        Canvas do Relatório
                      </h3>
                      <div className="flex items-center space-x-2">
                        <Badge
                          className="border-blue-400 text-blue-400"
                          variant="outline"
                        >
                          {elements.length} elementos
                        </Badge>
                        <Button
                          className="border-slate-600 text-slate-300 hover:bg-red-500/20"
                          onClick={() => setElements([])}
                          size="sm"
                          variant="outline"
                        >
                          <Trash2 className="mr-1 h-4 w-4" />
                          Limpar
                        </Button>
                      </div>
                    </div>

                    {/* Canvas Area */}
                    <div className="relative h-96 overflow-hidden rounded-lg border-2 border-slate-600 border-dashed bg-slate-800/30">
                      {elements.length === 0 ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center text-slate-400">
                            <Layers className="mx-auto mb-4 h-12 w-12 opacity-50" />
                            <p>Arraste elementos da paleta para começar</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2 p-4">
                          {elements.map((element, _index) => (
                            <div
                              className="flex items-center justify-between rounded-lg border border-slate-700 bg-white/5 p-3"
                              key={element.id}
                            >
                              <div className="flex items-center space-x-3">
                                <BarChart3 className="h-5 w-5 text-blue-400" />
                                <div>
                                  <div className="font-medium text-white">
                                    {element.title}
                                  </div>
                                  <div className="text-slate-400 text-sm">
                                    Tipo: {element.type}
                                  </div>
                                </div>
                              </div>
                              <Button
                                className="h-8 w-8 p-0 hover:bg-red-500/20"
                                onClick={() => deleteElement(element.id)}
                                size="sm"
                                variant="ghost"
                              >
                                <Trash2 className="h-4 w-4 text-red-400" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Canvas Tools */}
                    <div className="flex items-center justify-between">
                      <div className="text-slate-400 text-sm">
                        Clique nos elementos da paleta para adicionar ao
                        relatório
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          className="border-slate-600 text-slate-300"
                          size="sm"
                          variant="outline"
                        >
                          <Grid className="mr-1 h-4 w-4" />
                          Grade
                        </Button>
                        <Button
                          className="border-slate-600 text-slate-300"
                          size="sm"
                          variant="outline"
                        >
                          <Layers className="mr-1 h-4 w-4" />
                          Camadas
                        </Button>
                      </div>
                    </div>
                  </div>
                </NeonGradientCard>
              </div>
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates">
            <NeonGradientCard>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg text-white">
                    Templates de Relatório
                  </h3>
                  <CosmicGlowButton size="sm">
                    <Plus className="mr-1 h-4 w-4" />
                    Novo Template
                  </CosmicGlowButton>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {mockTemplates.map((template) => (
                    <motion.div
                      className="cursor-pointer rounded-lg border border-slate-700 bg-white/5 p-4 transition-all duration-200 hover:border-blue-400"
                      key={template.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-white">
                            {template.name}
                          </h4>
                          <Badge
                            className="border-blue-400 text-blue-400"
                            variant="outline"
                          >
                            {template.category}
                          </Badge>
                        </div>

                        <p className="text-slate-400 text-sm">
                          {template.description}
                        </p>

                        <div className="flex items-center justify-between text-slate-500 text-xs">
                          <span>{template.usageCount} usos</span>
                          <div className="flex items-center space-x-1">
                            <span>★</span>
                            <span>{template.rating.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </NeonGradientCard>
          </TabsContent>

          {/* Scheduler Tab */}
          <TabsContent value="scheduler">
            <NeonGradientCard>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg text-white">
                    Agendamentos de Relatório
                  </h3>
                  <CosmicGlowButton size="sm">
                    <Calendar className="mr-1 h-4 w-4" />
                    Novo Agendamento
                  </CosmicGlowButton>
                </div>

                <div className="py-8 text-center text-slate-400">
                  <Calendar className="mx-auto mb-4 h-12 w-12 opacity-50" />
                  <p>Nenhum agendamento configurado</p>
                  <p className="mt-2 text-sm">
                    Crie agendamentos para envio automático de relatórios
                  </p>
                </div>
              </div>
            </NeonGradientCard>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center text-slate-500 text-sm">
          <p>Custom Report Builder - NeonPro Healthcare</p>
          <p>Crie relatórios personalizados para análise de dados médicos</p>
        </div>
      </div>
    </div>
  );
}

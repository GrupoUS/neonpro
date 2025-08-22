'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Save,
  Download,
  Eye,
  Settings,
  Trash2,
  Copy,
  Calendar,
  Mail,
  Users,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  DollarSign,
  Filter,
  Layers,
  Grid,
  Type,
  Image,
  Clock,
  Share,
  FileText,
  MoreVertical,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

// Types for the Report Builder
interface ReportElement {
  id: string;
  type: 'chart' | 'table' | 'metric' | 'text' | 'image';
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
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  recipients: string[];
  format: 'pdf' | 'excel' | 'csv';
  isActive: boolean;
}

// Visual components maintaining NeonPro design
const NeonGradientCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/90 to-blue-900/30 backdrop-blur-sm ${className}`}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-50" />
    <div className="relative z-10 p-6">{children}</div>
  </motion.div>
);

const CosmicGlowButton = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  className = '',
  disabled = false,
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700',
    secondary: 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800',
    success: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700',
    warning: 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700',
    danger: 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-lg font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </motion.button>
  );
};

// Element Palette Component
const ElementPalette = ({ onAddElement }: { onAddElement: (type: string) => void }) => {
  const elementTypes = [
    { type: 'chart', label: 'Gráfico', icon: BarChart3, description: 'Gráficos de linha, barra, pizza' },
    { type: 'table', label: 'Tabela', icon: Grid, description: 'Tabelas de dados' },
    { type: 'metric', label: 'Métrica', icon: Activity, description: 'KPIs e indicadores' },
    { type: 'text', label: 'Texto', icon: Type, description: 'Títulos e parágrafos' },
    { type: 'image', label: 'Imagem', icon: Image, description: 'Logotipos e gráficos' },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-white">Elementos</h3>
      <div className="space-y-2">
        {elementTypes.map((element) => {
          const Icon = element.icon;
          return (
            <motion.div
              key={element.type}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onAddElement(element.type)}
              className="p-3 bg-white/5 rounded-lg border border-slate-700 hover:border-blue-400 cursor-pointer transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <Icon className="h-5 w-5 text-blue-400" />
                <div className="flex-1">
                  <div className="text-white font-medium">{element.label}</div>
                  <div className="text-slate-400 text-xs">{element.description}</div>
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
  const [activeTab, setActiveTab] = useState('builder');
  const [elements, setElements] = useState<ReportElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [reportName, setReportName] = useState('Novo Relatório');
  const [reportDescription, setReportDescription] = useState('');

  // Mock data for templates
  const mockTemplates: ReportTemplate[] = [
    {
      id: '1',
      name: 'Relatório Financeiro Mensal',
      description: 'Análise completa de receitas, custos e lucros mensais',
      category: 'financial',
      elements: [],
      isPublic: true,
      usageCount: 45,
      rating: 4.8,
    },
    {
      id: '2',
      name: 'Dashboard de Satisfação do Paciente',
      description: 'Métricas de satisfação e feedback dos pacientes',
      category: 'clinical',
      elements: [],
      isPublic: true,
      usageCount: 32,
      rating: 4.6,
    },
    {
      id: '3',
      name: 'Relatório de Conformidade LGPD',
      description: 'Status de conformidade e auditoria de dados',
      category: 'compliance',
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
    setElements(elements.filter(el => el.id !== id));
    if (selectedElement === id) {
      setSelectedElement(null);
    }
  };

  const exportReport = (format: 'pdf' | 'excel' | 'csv') => {
    // Implementation for exporting reports
    console.log(`Exporting report as ${format}...`);
  };

  const saveReport = () => {
    // Implementation for saving reports
    console.log('Saving report...', { reportName, reportDescription, elements });
  };

  const previewReport = () => {
    // Implementation for previewing reports
    console.log('Previewing report...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-white">Custom Report Builder</h1>
            <p className="text-slate-400">Crie relatórios personalizados com interface drag-and-drop</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <CosmicGlowButton onClick={previewReport} size="sm" variant="secondary">
              <Eye className="mr-2 h-4 w-4" />
              Visualizar
            </CosmicGlowButton>
            
            <CosmicGlowButton onClick={saveReport} size="sm" variant="success">
              <Save className="mr-2 h-4 w-4" />
              Salvar
            </CosmicGlowButton>
            
            <div className="flex items-center space-x-1">
              <CosmicGlowButton onClick={() => exportReport('pdf')} size="sm" variant="primary">
                <Download className="mr-2 h-4 w-4" />
                PDF
              </CosmicGlowButton>
              <CosmicGlowButton onClick={() => exportReport('excel')} size="sm" variant="primary">
                Excel
              </CosmicGlowButton>
              <CosmicGlowButton onClick={() => exportReport('csv')} size="sm" variant="primary">
                CSV
              </CosmicGlowButton>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border-slate-700">
            <TabsTrigger value="builder" className="data-[state=active]:bg-blue-600">
              Construtor
            </TabsTrigger>
            <TabsTrigger value="templates" className="data-[state=active]:bg-blue-600">
              Templates
            </TabsTrigger>
            <TabsTrigger value="scheduler" className="data-[state=active]:bg-blue-600">
              Agendamentos
            </TabsTrigger>
          </TabsList>

          {/* Report Builder Tab */}
          <TabsContent value="builder" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Left Sidebar - Tools */}
              <div className="lg:col-span-1">
                <NeonGradientCard>
                  <div className="space-y-6">
                    {/* Report Info */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-white">Configurações</h3>
                      <div className="space-y-2">
                        <Label htmlFor="report-name" className="text-slate-300">Nome do Relatório</Label>
                        <Input
                          id="report-name"
                          value={reportName}
                          onChange={(e) => setReportName(e.target.value)}
                          className="bg-slate-800 border-slate-600 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="report-description" className="text-slate-300">Descrição</Label>
                        <Textarea
                          id="report-description"
                          value={reportDescription}
                          onChange={(e) => setReportDescription(e.target.value)}
                          className="bg-slate-800 border-slate-600 text-white"
                          rows={3}
                        />
                      </div>
                    </div>

                    {/* Element Palette */}
                    <ElementPalette onAddElement={addElement} />

                    {/* Element Properties */}
                    {selectedElement && (
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-white">Propriedades</h3>
                        <div className="p-3 bg-white/5 rounded-lg">
                          <p className="text-slate-300 text-sm">
                            Elemento selecionado: {elements.find(el => el.id === selectedElement)?.title}
                          </p>
                          <div className="mt-2 space-y-2">
                            <Label className="text-slate-400">Configurações avançadas estarão aqui</Label>
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
                      <h3 className="text-lg font-semibold text-white">Canvas do Relatório</h3>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-blue-400 border-blue-400">
                          {elements.length} elementos
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setElements([])}
                          className="border-slate-600 text-slate-300 hover:bg-red-500/20"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Limpar
                        </Button>
                      </div>
                    </div>

                    {/* Canvas Area */}
                    <div className="relative h-96 bg-slate-800/30 border-2 border-dashed border-slate-600 rounded-lg overflow-hidden">
                      {elements.length === 0 ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center text-slate-400">
                            <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Arraste elementos da paleta para começar</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2 p-4">
                          {elements.map((element, index) => (
                            <div key={element.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-slate-700">
                              <div className="flex items-center space-x-3">
                                <BarChart3 className="h-5 w-5 text-blue-400" />
                                <div>
                                  <div className="text-white font-medium">{element.title}</div>
                                  <div className="text-slate-400 text-sm">Tipo: {element.type}</div>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteElement(element.id)}
                                className="h-8 w-8 p-0 hover:bg-red-500/20"
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
                        Clique nos elementos da paleta para adicionar ao relatório
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">
                          <Grid className="h-4 w-4 mr-1" />
                          Grade
                        </Button>
                        <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">
                          <Layers className="h-4 w-4 mr-1" />
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
                  <h3 className="text-lg font-semibold text-white">Templates de Relatório</h3>
                  <CosmicGlowButton size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Novo Template
                  </CosmicGlowButton>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mockTemplates.map((template) => (
                    <motion.div
                      key={template.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="p-4 bg-white/5 rounded-lg border border-slate-700 hover:border-blue-400 cursor-pointer transition-all duration-200"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-white font-medium">{template.name}</h4>
                          <Badge variant="outline" className="text-blue-400 border-blue-400">
                            {template.category}
                          </Badge>
                        </div>
                        
                        <p className="text-slate-400 text-sm">{template.description}</p>
                        
                        <div className="flex items-center justify-between text-xs text-slate-500">
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
                  <h3 className="text-lg font-semibold text-white">Agendamentos de Relatório</h3>
                  <CosmicGlowButton size="sm">
                    <Calendar className="h-4 w-4 mr-1" />
                    Novo Agendamento
                  </CosmicGlowButton>
                </div>

                <div className="text-center py-8 text-slate-400">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum agendamento configurado</p>
                  <p className="text-sm mt-2">Crie agendamentos para envio automático de relatórios</p>
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
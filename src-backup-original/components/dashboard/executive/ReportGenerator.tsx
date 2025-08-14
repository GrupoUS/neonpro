/**
 * Report Generator Component
 * 
 * Handles report generation, scheduling, and export functionality
 * for the executive dashboard with multiple formats and templates.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  FileText,
  Download,
  Calendar,
  Clock,
  Mail,
  Settings,
  Play,
  Pause,
  Trash2,
  Copy,
  Eye,
  FileSpreadsheet,
  Image,
  Share,
  Plus,
  Edit,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { DashboardReport, ReportTemplate, ReportSchedule } from '@/lib/dashboard/types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface ReportGeneratorProps {
  reports: DashboardReport[];
  templates: ReportTemplate[];
  schedules: ReportSchedule[];
  onGenerateReport: (config: ReportConfig) => Promise<void>;
  onScheduleReport: (schedule: ReportSchedule) => Promise<void>;
  onDeleteReport: (reportId: string) => Promise<void>;
  onDeleteSchedule: (scheduleId: string) => Promise<void>;
  canManage?: boolean;
}

interface ReportConfig {
  templateId: string;
  title: string;
  description?: string;
  format: 'pdf' | 'excel' | 'csv' | 'png';
  dateRange: {
    start: Date;
    end: Date;
  };
  filters: {
    departments?: string[];
    metrics?: string[];
    includeCharts?: boolean;
    includeRawData?: boolean;
  };
  recipients?: string[];
  schedule?: {
    frequency: 'once' | 'daily' | 'weekly' | 'monthly';
    time?: string;
    dayOfWeek?: number;
    dayOfMonth?: number;
  };
}

interface ReportItemProps {
  report: DashboardReport;
  onDelete: (reportId: string) => void;
  onDownload: (reportId: string) => void;
  onShare: (reportId: string) => void;
}

interface ScheduleItemProps {
  schedule: ReportSchedule;
  onEdit: (schedule: ReportSchedule) => void;
  onDelete: (scheduleId: string) => void;
  onToggle: (scheduleId: string, enabled: boolean) => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const REPORT_FORMATS = {
  pdf: { label: 'PDF', icon: FileText, description: 'Documento formatado para impressão' },
  excel: { label: 'Excel', icon: FileSpreadsheet, description: 'Planilha com dados e gráficos' },
  csv: { label: 'CSV', icon: FileText, description: 'Dados brutos em formato tabular' },
  png: { label: 'PNG', icon: Image, description: 'Imagem dos gráficos principais' }
};

const FREQUENCY_OPTIONS = {
  once: { label: 'Uma vez', description: 'Gerar apenas uma vez' },
  daily: { label: 'Diário', description: 'Todos os dias no horário especificado' },
  weekly: { label: 'Semanal', description: 'Uma vez por semana' },
  monthly: { label: 'Mensal', description: 'Uma vez por mês' }
};

const WEEKDAYS = [
  'Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'
];

const DEFAULT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'executive-summary',
    name: 'Resumo Executivo',
    description: 'Visão geral dos KPIs principais',
    sections: ['financial', 'operational', 'patient'],
    defaultFormat: 'pdf'
  },
  {
    id: 'financial-detailed',
    name: 'Relatório Financeiro Detalhado',
    description: 'Análise completa das métricas financeiras',
    sections: ['financial'],
    defaultFormat: 'excel'
  },
  {
    id: 'operational-performance',
    name: 'Performance Operacional',
    description: 'Métricas de eficiência e produtividade',
    sections: ['operational', 'staff'],
    defaultFormat: 'pdf'
  },
  {
    id: 'patient-analytics',
    name: 'Analytics de Pacientes',
    description: 'Análise de satisfação e experiência do paciente',
    sections: ['patient'],
    defaultFormat: 'excel'
  }
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getNextRunTime = (schedule: ReportSchedule): string => {
  const now = new Date();
  let nextRun = new Date();
  
  switch (schedule.frequency) {
    case 'daily':
      nextRun.setDate(now.getDate() + 1);
      break;
    case 'weekly':
      const daysUntilNext = (schedule.dayOfWeek! - now.getDay() + 7) % 7;
      nextRun.setDate(now.getDate() + (daysUntilNext || 7));
      break;
    case 'monthly':
      nextRun.setMonth(now.getMonth() + 1);
      nextRun.setDate(schedule.dayOfMonth!);
      break;
    default:
      return 'N/A';
  }
  
  if (schedule.time) {
    const [hours, minutes] = schedule.time.split(':').map(Number);
    nextRun.setHours(hours, minutes, 0, 0);
  }
  
  return nextRun.toLocaleString('pt-BR');
};

// ============================================================================
// REPORT ITEM COMPONENT
// ============================================================================

const ReportItem: React.FC<ReportItemProps> = ({ report, onDelete, onDownload, onShare }) => {
  const formatConfig = REPORT_FORMATS[report.format];
  const Icon = formatConfig.icon;
  
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Icon className="h-5 w-5 text-blue-600" />
        </div>
        
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{report.title}</h4>
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
            <span>{formatConfig.label}</span>
            <span>•</span>
            <span>{formatFileSize(report.size || 0)}</span>
            <span>•</span>
            <span>{new Date(report.generatedAt).toLocaleString('pt-BR')}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={report.status === 'completed' ? 'default' : 'secondary'}>
            {report.status === 'completed' ? 'Concluído' : 'Processando'}
          </Badge>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDownload(report.id)}
          disabled={report.status !== 'completed'}
        >
          <Download className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onShare(report.id)}
          disabled={report.status !== 'completed'}
        >
          <Share className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(report.id)}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// ============================================================================
// SCHEDULE ITEM COMPONENT
// ============================================================================

const ScheduleItem: React.FC<ScheduleItemProps> = ({ schedule, onEdit, onDelete, onToggle }) => {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-100 rounded-lg">
          <Calendar className="h-5 w-5 text-green-600" />
        </div>
        
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{schedule.name}</h4>
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
            <span>{FREQUENCY_OPTIONS[schedule.frequency].label}</span>
            <span>•</span>
            <span>Próxima execução: {getNextRunTime(schedule)}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={schedule.enabled ? 'default' : 'secondary'}>
            {schedule.enabled ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Switch
          checked={schedule.enabled}
          onCheckedChange={(enabled) => onToggle(schedule.id, enabled)}
        />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(schedule)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(schedule.id)}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  reports,
  templates = DEFAULT_TEMPLATES,
  schedules,
  onGenerateReport,
  onScheduleReport,
  onDeleteReport,
  onDeleteSchedule,
  canManage = true
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [showNewReportDialog, setShowNewReportDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ReportSchedule | null>(null);
  
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    templateId: '',
    title: '',
    description: '',
    format: 'pdf',
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      end: new Date()
    },
    filters: {
      includeCharts: true,
      includeRawData: false
    },
    recipients: []
  });
  
  const [scheduleConfig, setScheduleConfig] = useState<ReportSchedule>({
    id: '',
    name: '',
    templateId: '',
    frequency: 'weekly',
    enabled: true,
    recipients: [],
    format: 'pdf',
    createdAt: new Date(),
    lastRun: null,
    nextRun: new Date()
  });
  
  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  const handleGenerateReport = async () => {
    if (!reportConfig.templateId || !reportConfig.title) {
      return;
    }
    
    setIsGenerating(true);
    try {
      await onGenerateReport(reportConfig);
      setShowNewReportDialog(false);
      // Reset form
      setReportConfig({
        templateId: '',
        title: '',
        description: '',
        format: 'pdf',
        dateRange: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: new Date()
        },
        filters: {
          includeCharts: true,
          includeRawData: false
        },
        recipients: []
      });
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleScheduleReport = async () => {
    if (!scheduleConfig.name || !scheduleConfig.templateId) {
      return;
    }
    
    try {
      await onScheduleReport(scheduleConfig);
      setShowScheduleDialog(false);
      setEditingSchedule(null);
      // Reset form
      setScheduleConfig({
        id: '',
        name: '',
        templateId: '',
        frequency: 'weekly',
        enabled: true,
        recipients: [],
        format: 'pdf',
        createdAt: new Date(),
        lastRun: null,
        nextRun: new Date()
      });
    } catch (error) {
      console.error('Error scheduling report:', error);
    }
  };
  
  const handleEditSchedule = (schedule: ReportSchedule) => {
    setEditingSchedule(schedule);
    setScheduleConfig(schedule);
    setShowScheduleDialog(true);
  };
  
  const handleToggleSchedule = async (scheduleId: string, enabled: boolean) => {
    const schedule = schedules.find(s => s.id === scheduleId);
    if (schedule) {
      await onScheduleReport({ ...schedule, enabled });
    }
  };
  
  // ============================================================================
  // RENDER HELPERS
  // ============================================================================
  
  const renderNewReportDialog = () => (
    <Dialog open={showNewReportDialog} onOpenChange={setShowNewReportDialog}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Relatório
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerar Novo Relatório</DialogTitle>
          <DialogDescription>
            Configure os parâmetros para gerar um novo relatório do dashboard.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Template Selection */}
          <div className="space-y-2">
            <Label>Template</Label>
            <Select 
              value={reportConfig.templateId} 
              onValueChange={(value) => setReportConfig(prev => ({ ...prev, templateId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    <div>
                      <div className="font-medium">{template.name}</div>
                      <div className="text-sm text-gray-500">{template.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={reportConfig.title}
                onChange={(e) => setReportConfig(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Nome do relatório"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Formato</Label>
              <Select 
                value={reportConfig.format} 
                onValueChange={(value: any) => setReportConfig(prev => ({ ...prev, format: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(REPORT_FORMATS).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <config.icon className="h-4 w-4" />
                        <div>
                          <div>{config.label}</div>
                          <div className="text-xs text-gray-500">{config.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <Label>Descrição (opcional)</Label>
            <Textarea
              value={reportConfig.description}
              onChange={(e) => setReportConfig(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição do relatório"
              rows={3}
            />
          </div>
          
          {/* Date Range */}
          <div className="space-y-2">
            <Label>Período</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-600">Data Inicial</Label>
                <Input
                  type="date"
                  value={reportConfig.dateRange.start.toISOString().split('T')[0]}
                  onChange={(e) => setReportConfig(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, start: new Date(e.target.value) }
                  }))}
                />
              </div>
              
              <div>
                <Label className="text-sm text-gray-600">Data Final</Label>
                <Input
                  type="date"
                  value={reportConfig.dateRange.end.toISOString().split('T')[0]}
                  onChange={(e) => setReportConfig(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, end: new Date(e.target.value) }
                  }))}
                />
              </div>
            </div>
          </div>
          
          {/* Filters */}
          <div className="space-y-4">
            <Label>Opções de Conteúdo</Label>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeCharts"
                  checked={reportConfig.filters.includeCharts}
                  onCheckedChange={(checked) => setReportConfig(prev => ({
                    ...prev,
                    filters: { ...prev.filters, includeCharts: !!checked }
                  }))}
                />
                <Label htmlFor="includeCharts" className="text-sm">
                  Incluir gráficos e visualizações
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeRawData"
                  checked={reportConfig.filters.includeRawData}
                  onCheckedChange={(checked) => setReportConfig(prev => ({
                    ...prev,
                    filters: { ...prev.filters, includeRawData: !!checked }
                  }))}
                />
                <Label htmlFor="includeRawData" className="text-sm">
                  Incluir dados brutos (tabelas detalhadas)
                </Label>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setShowNewReportDialog(false)}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleGenerateReport}
            disabled={isGenerating || !reportConfig.templateId || !reportConfig.title}
          >
            {isGenerating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Gerar Relatório
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
  
  const renderScheduleDialog = () => (
    <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Calendar className="h-4 w-4" />
          Agendar Relatório
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingSchedule ? 'Editar Agendamento' : 'Agendar Relatório'}
          </DialogTitle>
          <DialogDescription>
            Configure o agendamento automático de relatórios.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome do Agendamento</Label>
              <Input
                value={scheduleConfig.name}
                onChange={(e) => setScheduleConfig(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Relatório Semanal Executivo"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Template</Label>
              <Select 
                value={scheduleConfig.templateId} 
                onValueChange={(value) => setScheduleConfig(prev => ({ ...prev, templateId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Frequency */}
          <div className="space-y-2">
            <Label>Frequência</Label>
            <Select 
              value={scheduleConfig.frequency} 
              onValueChange={(value: any) => setScheduleConfig(prev => ({ ...prev, frequency: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(FREQUENCY_OPTIONS).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <div>
                      <div>{config.label}</div>
                      <div className="text-sm text-gray-500">{config.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Timing */}
          {scheduleConfig.frequency !== 'once' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Horário</Label>
                <Input
                  type="time"
                  value={scheduleConfig.time || '09:00'}
                  onChange={(e) => setScheduleConfig(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
              
              {scheduleConfig.frequency === 'weekly' && (
                <div className="space-y-2">
                  <Label>Dia da Semana</Label>
                  <Select 
                    value={scheduleConfig.dayOfWeek?.toString() || '1'} 
                    onValueChange={(value) => setScheduleConfig(prev => ({ 
                      ...prev, 
                      dayOfWeek: parseInt(value) 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WEEKDAYS.map((day, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {scheduleConfig.frequency === 'monthly' && (
                <div className="space-y-2">
                  <Label>Dia do Mês</Label>
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    value={scheduleConfig.dayOfMonth || 1}
                    onChange={(e) => setScheduleConfig(prev => ({ 
                      ...prev, 
                      dayOfMonth: parseInt(e.target.value) 
                    }))}
                  />
                </div>
              )}
            </div>
          )}
          
          {/* Format and Recipients */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Formato</Label>
              <Select 
                value={scheduleConfig.format} 
                onValueChange={(value: any) => setScheduleConfig(prev => ({ ...prev, format: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(REPORT_FORMATS).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <config.icon className="h-4 w-4" />
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  checked={scheduleConfig.enabled}
                  onCheckedChange={(enabled) => setScheduleConfig(prev => ({ ...prev, enabled }))}
                />
                <Label className="text-sm">
                  {scheduleConfig.enabled ? 'Ativo' : 'Inativo'}
                </Label>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => {
              setShowScheduleDialog(false);
              setEditingSchedule(null);
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleScheduleReport}
            disabled={!scheduleConfig.name || !scheduleConfig.templateId}
          >
            {editingSchedule ? 'Atualizar' : 'Agendar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
  
  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Relatórios</h2>
          <p className="text-gray-600 mt-1">
            Gere e agende relatórios personalizados do dashboard
          </p>
        </div>
        
        {canManage && (
          <div className="flex items-center gap-3">
            {renderNewReportDialog()}
            {renderScheduleDialog()}
          </div>
        )}
      </div>
      
      {/* Content Tabs */}
      <Tabs defaultValue="reports" className="space-y-6">
        <TabsList>
          <TabsTrigger value="reports" className="gap-2">
            <FileText className="h-4 w-4" />
            Relatórios Gerados
          </TabsTrigger>
          <TabsTrigger value="schedules" className="gap-2">
            <Calendar className="h-4 w-4" />
            Agendamentos
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <Settings className="h-4 w-4" />
            Templates
          </TabsTrigger>
        </TabsList>
        
        {/* Reports Tab */}
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Relatórios Recentes
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              {reports.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhum relatório gerado ainda</p>
                  <p className="text-sm mt-1">Clique em "Novo Relatório" para começar</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reports.map((report, index) => (
                    <React.Fragment key={report.id}>
                      <ReportItem
                        report={report}
                        onDelete={onDeleteReport}
                        onDownload={(id) => console.log('Download report:', id)}
                        onShare={(id) => console.log('Share report:', id)}
                      />
                      {index < reports.length - 1 && <Separator />}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Schedules Tab */}
        <TabsContent value="schedules">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Agendamentos Ativos
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              {schedules.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhum agendamento configurado</p>
                  <p className="text-sm mt-1">Configure relatórios automáticos</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {schedules.map((schedule, index) => (
                    <React.Fragment key={schedule.id}>
                      <ScheduleItem
                        schedule={schedule}
                        onEdit={handleEditSchedule}
                        onDelete={onDeleteSchedule}
                        onToggle={handleToggleSchedule}
                      />
                      {index < schedules.length - 1 && <Separator />}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Templates Tab */}
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Templates Disponíveis
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map(template => (
                  <div key={template.id} className="p-4 border rounded-lg">
                    <h4 className="font-medium text-gray-900">{template.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {REPORT_FORMATS[template.defaultFormat].label}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {template.sections.length} seções
                        </span>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setReportConfig(prev => ({
                            ...prev,
                            templateId: template.id,
                            title: template.name,
                            format: template.defaultFormat
                          }));
                          setShowNewReportDialog(true);
                        }}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Usar Template
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportGenerator;

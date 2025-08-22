'use client';

import { motion } from 'framer-motion';
import {
  BarChart3,
  Calendar,
  Download,
  FileText,
  Filter,
  Mail,
  Plus,
  Search,
  Settings,
  Shield,
  TrendingUp,
  Users,
  Activity,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileSpreadsheet,
  Printer,
  Share2,
  BookOpen,
  Stethoscope,
  Building2,
  CreditCard,
  Target,
  Zap,
  Eye,
  Edit,
  RefreshCw,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import SchedulingModal from './scheduling-modal';
import { 
  useAnnouncements, 
  useFocusManagement, 
  useReducedMotion,
  SkipLinks,
  initializeAccessibility,
  HEALTHCARE_ANNOUNCEMENTS 
} from './accessibility-utils';

// NeonPro design components consistent with dashboard
type NeonGradientCardProps = {
  children: React.ReactNode;
  className?: string;
};

const NeonGradientCard = ({
  children,
  className = '',
}: NeonGradientCardProps) => (
  <motion.div
    animate={{ opacity: 1, y: 0 }}
    className={`relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/90 to-blue-900/30 backdrop-blur-sm ${className}`}
    initial={{ opacity: 0, y: 20 }}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-50" />
    <div className="relative z-10 p-6">{children}</div>
  </motion.div>
);

type CosmicGlowButtonProps = {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  href?: string;
  className?: string;
  disabled?: boolean;
};

const CosmicGlowButton = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  href,
  className = '',
  disabled = false,
}: CosmicGlowButtonProps) => {
  const variants = {
    primary:
      'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700',
    secondary:
      'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800',
    success:
      'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700',
    warning:
      'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700',
    danger:
      'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const ButtonComponent = href ? 'a' : 'button';

  return (
    <motion.div
      className="inline-block"
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
    >
      <ButtonComponent
        className={`inline-flex items-center gap-2 rounded-lg font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl ${variants[variant]} ${sizes[size]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        href={href}
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
      >
        {children}
      </ButtonComponent>
    </motion.div>
  );
};

// Brazilian Healthcare Report Types
type ReportCategory = 'regulatory' | 'financial' | 'clinical' | 'custom';

type ReportTemplate = {
  id: string;
  name: string;
  description: string;
  category: ReportCategory;
  compliance: string[];
  lastGenerated?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'on-demand';
  status: 'available' | 'generating' | 'scheduled' | 'error';
  icon: React.ElementType;
  estimatedTime: string;
};

// Brazilian Healthcare Mock Data
const reportTemplates: ReportTemplate[] = [
  // Regulatory Reports
  {
    id: 'lgpd-compliance',
    name: 'Relatório de Conformidade LGPD',
    description: 'Análise completa de conformidade com a Lei Geral de Proteção de Dados',
    category: 'regulatory',
    compliance: ['LGPD', 'ANPD'],
    lastGenerated: '2024-01-20',
    frequency: 'monthly',
    status: 'available',
    icon: Shield,
    estimatedTime: '5-10 min',
  },
  {
    id: 'anvisa-inspection',
    name: 'Relatório de Inspeção ANVISA',
    description: 'Preparação para inspeções da Agência Nacional de Vigilância Sanitária',
    category: 'regulatory',
    compliance: ['ANVISA', 'RDC'],
    lastGenerated: '2024-01-18',
    frequency: 'quarterly',
    status: 'available',
    icon: Building2,
    estimatedTime: '15-20 min',
  },
  {
    id: 'cfm-professional',
    name: 'Relatório de Atividade Profissional CFM',
    description: 'Registro de atividades profissionais para o Conselho Federal de Medicina',
    category: 'regulatory',
    compliance: ['CFM', 'CRM'],
    lastGenerated: '2024-01-15',
    frequency: 'yearly',
    status: 'available',
    icon: Stethoscope,
    estimatedTime: '10-15 min',
  },
  {
    id: 'ans-performance',
    name: 'Métricas de Performance ANS',
    description: 'Indicadores de qualidade para a Agência Nacional de Saúde Suplementar',
    category: 'regulatory',
    compliance: ['ANS', 'QUALISS'],
    frequency: 'quarterly',
    status: 'available',
    icon: Target,
    estimatedTime: '8-12 min',
  },
  
  // Financial Reports
  {
    id: 'revenue-analysis',
    name: 'Análise de Receita',
    description: 'Análise detalhada de receitas por período, serviço e profissional',
    category: 'financial',
    compliance: ['Receita Federal', 'CNPJ'],
    lastGenerated: '2024-01-21',
    frequency: 'monthly',
    status: 'available',
    icon: DollarSign,
    estimatedTime: '3-5 min',
  },
  {
    id: 'payment-methods',
    name: 'Relatório de Métodos de Pagamento',
    description: 'Breakdown de pagamentos: PIX, cartão, convênios, SUS',
    category: 'financial',
    compliance: ['Bacen', 'PIX'],
    lastGenerated: '2024-01-20',
    frequency: 'weekly',
    status: 'available',
    icon: CreditCard,
    estimatedTime: '2-3 min',
  },
  {
    id: 'profitability',
    name: 'Análise de Lucratividade por Serviço',
    description: 'Margem de lucro e rentabilidade por tipo de tratamento',
    category: 'financial',
    compliance: ['Contabilidade'],
    frequency: 'monthly',
    status: 'generating',
    icon: TrendingUp,
    estimatedTime: '5-8 min',
  },
  {
    id: 'tax-compliance',
    name: 'Relatório de Conformidade Fiscal',
    description: 'Documentação para Receita Federal e obrigações acessórias',
    category: 'financial',
    compliance: ['Receita Federal', 'SPED'],
    frequency: 'monthly',
    status: 'available',
    icon: FileText,
    estimatedTime: '10-15 min',
  },
  
  // Clinical Reports
  {
    id: 'treatment-outcomes',
    name: 'Resultados de Tratamento',
    description: 'Análise de eficácia e resultados dos tratamentos realizados',
    category: 'clinical',
    compliance: ['CFM', 'Protocolos Clínicos'],
    lastGenerated: '2024-01-19',
    frequency: 'monthly',
    status: 'available',
    icon: Activity,
    estimatedTime: '8-12 min',
  },
  {
    id: 'patient-satisfaction',
    name: 'Satisfação do Paciente',
    description: 'Pesquisa de satisfação e NPS dos pacientes atendidos',
    category: 'clinical',
    compliance: ['Qualidade'],
    lastGenerated: '2024-01-17',
    frequency: 'weekly',
    status: 'available',
    icon: Users,
    estimatedTime: '5-7 min',
  },
  {
    id: 'adverse-events',
    name: 'Eventos Adversos',
    description: 'Registro e análise de eventos adversos e complicações',
    category: 'clinical',
    compliance: ['ANVISA', 'Farmacovigilância'],
    frequency: 'on-demand',
    status: 'available',
    icon: AlertTriangle,
    estimatedTime: '3-5 min',
  },
  {
    id: 'quality-metrics',
    name: 'Métricas de Qualidade',
    description: 'Indicadores de qualidade assistencial e protocolos clínicos',
    category: 'clinical',
    compliance: ['Acreditação'],
    frequency: 'monthly',
    status: 'available',
    icon: CheckCircle,
    estimatedTime: '6-10 min',
  },
];

// Report Categories Configuration
const reportCategories = [
  {
    id: 'regulatory' as const,
    name: 'Relatórios Regulatórios',
    description: 'Conformidade LGPD, ANVISA, CFM e ANS',
    icon: Shield,
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-500/10',
    count: reportTemplates.filter(r => r.category === 'regulatory').length,
  },
  {
    id: 'financial' as const,
    name: 'Relatórios Financeiros',
    description: 'Receitas, pagamentos e conformidade fiscal',
    icon: DollarSign,
    color: 'from-green-500 to-emerald-600',
    bgColor: 'bg-green-500/10',
    count: reportTemplates.filter(r => r.category === 'financial').length,
  },
  {
    id: 'clinical' as const,
    name: 'Relatórios Clínicos',
    description: 'Resultados, satisfação e qualidade',
    icon: Activity,
    color: 'from-purple-500 to-pink-600',
    bgColor: 'bg-purple-500/10',
    count: reportTemplates.filter(r => r.category === 'clinical').length,
  },
  {
    id: 'custom' as const,
    name: 'Relatórios Personalizados',
    description: 'Construtor de relatórios e templates',
    icon: Settings,
    color: 'from-orange-500 to-red-600',
    bgColor: 'bg-orange-500/10',
    count: 12, // Mock count for custom reports
  },
];

// Recent Reports Mock Data
const recentReports = [
  {
    id: '1',
    name: 'Conformidade LGPD - Janeiro 2024',
    type: 'PDF',
    size: '2.4 MB',
    generatedAt: '2024-01-21T10:30:00Z',
    status: 'completed',
    category: 'regulatory',
  },
  {
    id: '2',
    name: 'Análise Financeira - Mensal',
    type: 'Excel',
    size: '1.8 MB',
    generatedAt: '2024-01-21T09:15:00Z',
    status: 'completed',
    category: 'financial',
  },
  {
    id: '3',
    name: 'Satisfação do Paciente - Semanal',
    type: 'PDF',
    size: '890 KB',
    generatedAt: '2024-01-20T16:45:00Z',
    status: 'completed',
    category: 'clinical',
  },
];

// Import export utilities
import { 
  HealthcarePDFGenerator, 
  HealthcareExcelExporter, 
  generateCSVReport, 
  downloadReport,
  emailReport,
  generateSecureShareLink 
} from './export-utils';

// Export functionality implementation
const handleExportReport = (reportId: string, format: 'pdf' | 'excel' | 'csv') => {
  try {
    switch (format) {
      case 'pdf':
        const pdfGenerator = new HealthcarePDFGenerator();
        let pdfData: Uint8Array;
        
        switch (reportId) {
          case 'lgpd-compliance':
            pdfData = pdfGenerator.generateLGPDReport();
            downloadReport(pdfData, 'relatorio-lgpd-conformidade.pdf', 'pdf');
            break;
          case 'revenue-analysis':
            pdfData = pdfGenerator.generateFinancialReport();
            downloadReport(pdfData, 'relatorio-financeiro.pdf', 'pdf');
            break;
          case 'treatment-outcomes':
            pdfData = pdfGenerator.generateClinicalReport();
            downloadReport(pdfData, 'relatorio-clinico.pdf', 'pdf');
            break;
          default:
            console.log(`Relatório PDF ${reportId} não implementado ainda`);
        }
        break;
        
      case 'excel':
        const excelData = HealthcareExcelExporter.generateComprehensiveReport();
        downloadReport(excelData, 'relatorio-completo-neonpro.xlsx', 'excel');
        break;
        
      case 'csv':
        const csvData = generateCSVReport(reportId.split('-')[0]); // Extract category
        downloadReport(csvData, `relatorio-${reportId}.csv`, 'csv');
        break;
    }
  } catch (error) {
    console.error('Erro ao exportar relatório:', error);
    // In production, show user-friendly error message
  }
};

const handleEmailReport = async (reportId: string) => {
  try {
    // Mock email functionality - in production, implement proper email dialog
    const recipients = ['admin@neonpro.com.br']; // Default recipient
    const result = await emailReport(reportId, recipients, 'pdf');
    
    if (result.success) {
      console.log('Relatório enviado por email com sucesso');
      // Show success notification
    }
  } catch (error) {
    console.error('Erro ao enviar relatório por email:', error);
  }
};

const handleScheduleReport = (reportId: string) => {
  const report = reportTemplates.find(r => r.id === reportId);
  if (report) {
    setSchedulingModal({
      isOpen: true,
      reportId,
      reportName: report.name,
    });
  }
};

const handleScheduleCreated = (schedule: any) => {
  console.log('Agendamento criado:', schedule);
  // In production, save to backend
  // Show success notification
};// Main Reports Center Components

// Report Category Card Component
function ReportCategoryCard({ category, onSelectCategory }: { 
  category: typeof reportCategories[0], 
  onSelectCategory: (categoryId: ReportCategory) => void 
}) {
  const Icon = category.icon;
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="cursor-pointer"
      onClick={() => onSelectCategory(category.id)}
    >
      <NeonGradientCard className="h-full transition-all duration-300 hover:border-blue-500/50">
        <div className="flex items-start justify-between">
          <div className={`p-3 rounded-lg ${category.bgColor}`}>
            <Icon className="h-8 w-8 text-white" />
          </div>
          <Badge variant="secondary" className="text-xs">
            {category.count} relatórios
          </Badge>
        </div>
        
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-white">{category.name}</h3>
          <p className="text-sm text-slate-400 mt-1">{category.description}</p>
        </div>
        
        <div className="mt-4 flex items-center text-blue-400 text-sm font-medium">
          <span>Ver relatórios</span>
          <BarChart3 className="ml-2 h-4 w-4" />
        </div>
      </NeonGradientCard>
    </motion.div>
  );
}

// Report Template Card Component
function ReportTemplateCard({ report, onGenerate, onExport, onSchedule }: {
  report: ReportTemplate,
  onGenerate: (reportId: string) => void,
  onExport: (reportId: string, format: 'pdf' | 'excel' | 'csv') => void,
  onSchedule: (reportId: string) => void,
}) {
  const Icon = report.icon;
  
  const getStatusBadge = (status: ReportTemplate['status']) => {
    switch (status) {
      case 'available':
        return <Badge variant="secondary" className="text-green-400 border-green-400">Disponível</Badge>;
      case 'generating':
        return <Badge variant="secondary" className="text-yellow-400 border-yellow-400">Gerando...</Badge>;
      case 'scheduled':
        return <Badge variant="secondary" className="text-blue-400 border-blue-400">Agendado</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
    }
  };
  
  return (
    <NeonGradientCard className="transition-all duration-300 hover:border-blue-500/30">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Icon className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h4 className="font-semibold text-white text-sm">{report.name}</h4>
            <p className="text-xs text-slate-400">{report.description}</p>
          </div>
        </div>
        {getStatusBadge(report.status)}
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Frequência:</span>
          <span className="text-white capitalize">{report.frequency}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Tempo estimado:</span>
          <span className="text-white">{report.estimatedTime}</span>
        </div>
        {report.lastGenerated && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Última geração:</span>
            <span className="text-white">
              {new Date(report.lastGenerated).toLocaleDateString('pt-BR')}
            </span>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2 mb-3">
        {report.compliance.map((comp) => (
          <Badge key={comp} variant="outline" className="text-xs border-slate-600 text-slate-300">
            {comp}
          </Badge>
        ))}
      </div>
      
      <div className="flex items-center gap-2">
        <CosmicGlowButton
          size="sm"
          variant="primary"
          onClick={() => onGenerate(report.id)}
          disabled={report.status === 'generating'}
          className="flex-1"
        >
          {report.status === 'generating' ? (
            <>
              <RefreshCw className="h-3 w-3 animate-spin mr-1" />
              Gerando...
            </>
          ) : (
            <>
              <Zap className="h-3 w-3 mr-1" />
              Gerar
            </>
          )}
        </CosmicGlowButton>
        
        <Button 
          size="sm" 
          variant="outline" 
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
          onClick={() => onExport(report.id, 'pdf')}
        >
          <Download className="h-3 w-3" />
        </Button>
        
        <Button 
          size="sm" 
          variant="outline"
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
          onClick={() => onSchedule(report.id)}
        >
          <Calendar className="h-3 w-3" />
        </Button>
      </div>
    </NeonGradientCard>
  );
}

// Recent Reports Section
function RecentReportsSection() {
  return (
    <NeonGradientCard>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Relatórios Recentes</h3>
        <CosmicGlowButton size="sm" variant="secondary">
          <Eye className="h-4 w-4 mr-2" />
          Ver Todos
        </CosmicGlowButton>
      </div>
      
      <div className="space-y-3">
        {recentReports.map((report) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <FileText className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-white text-sm">{report.name}</p>
                <p className="text-xs text-slate-400">
                  {new Date(report.generatedAt).toLocaleString('pt-BR')} • {report.size}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
                {report.type}
              </Badge>
              <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white">
                <Download className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white">
                <Share2 className="h-3 w-3" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </NeonGradientCard>
  );
}

// Quick Actions Section
function QuickActionsSection({ onSelectCategory }: { 
  onSelectCategory: (categoryId: ReportCategory) => void 
}) {
  const quickActions = [
    {
      name: 'Relatório LGPD',
      description: 'Conformidade de dados',
      icon: Shield,
      action: () => onSelectCategory('regulatory'),
      variant: 'primary' as const,
    },
    {
      name: 'Receita Mensal',
      description: 'Análise financeira',
      icon: DollarSign,
      action: () => onSelectCategory('financial'),
      variant: 'success' as const,
    },
    {
      name: 'Satisfação Paciente',
      description: 'Pesquisa NPS',
      icon: Users,
      action: () => onSelectCategory('clinical'),
      variant: 'warning' as const,
    },
    {
      name: 'Construtor Custom',
      description: 'Criar relatório',
      icon: Plus,
      action: () => onSelectCategory('custom'),
      variant: 'secondary' as const,
    },
  ];
  
  return (
    <NeonGradientCard>
      <h3 className="text-xl font-bold text-white mb-6">Ações Rápidas</h3>
      <div className="grid grid-cols-2 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <CosmicGlowButton
              key={action.name}
              variant={action.variant}
              onClick={action.action}
              className="flex flex-col items-center justify-center p-4 h-24 text-center"
            >
              <Icon className="h-5 w-5 mb-2" />
              <span className="font-medium text-sm">{action.name}</span>
              <span className="text-xs opacity-75">{action.description}</span>
            </CosmicGlowButton>
          );
        })}
      </div>
    </NeonGradientCard>
  );
}// Export Options Modal Component
function ExportOptionsModal({ 
  isOpen, 
  onClose, 
  reportId, 
  reportName 
}: {
  isOpen: boolean,
  onClose: () => void,
  reportId: string,
  reportName: string
}) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full mx-4"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">Opções de Export</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </Button>
        </div>
        
        <p className="text-sm text-slate-400 mb-6">
          Selecione o formato para exportar: <strong className="text-white">{reportName}</strong>
        </p>
        
        <div className="space-y-3">
          <CosmicGlowButton
            variant="primary"
            className="w-full justify-start"
            onClick={() => {
              handleExportReport(reportId, 'pdf');
              onClose();
            }}
          >
            <FileText className="h-4 w-4 mr-3" />
            PDF - Formato profissional
          </CosmicGlowButton>
          
          <CosmicGlowButton
            variant="success"
            className="w-full justify-start"
            onClick={() => {
              handleExportReport(reportId, 'excel');
              onClose();
            }}
          >
            <FileSpreadsheet className="h-4 w-4 mr-3" />
            Excel - Dados para análise
          </CosmicGlowButton>
          
          <CosmicGlowButton
            variant="secondary"
            className="w-full justify-start"
            onClick={() => {
              handleExportReport(reportId, 'csv');
              onClose();
            }}
          >
            <Download className="h-4 w-4 mr-3" />
            CSV - Dados simplificados
          </CosmicGlowButton>
        </div>
        
        <div className="mt-6 pt-4 border-t border-slate-700">
          <div className="flex gap-3">
            <CosmicGlowButton
              variant="warning"
              size="sm"
              className="flex-1"
              onClick={() => {
                handleEmailReport(reportId);
                onClose();
              }}
            >
              <Mail className="h-3 w-3 mr-2" />
              Enviar por Email
            </CosmicGlowButton>
            
            <CosmicGlowButton
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={() => {
                handleScheduleReport(reportId);
                onClose();
              }}
            >
              <Calendar className="h-3 w-3 mr-2" />
              Agendar
            </CosmicGlowButton>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Main Reports Center Page Component
export default function ReportsPage() {
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Accessibility hooks
  const { announce } = useAnnouncements();
  const { saveFocus, restoreFocus } = useFocusManagement();
  const motionSettings = useReducedMotion();
  
  // Initialize accessibility features
  useEffect(() => {
    initializeAccessibility();
  }, []);
  const [exportModal, setExportModal] = useState<{
    isOpen: boolean;
    reportId: string;
    reportName: string;
  }>({
    isOpen: false,
    reportId: '',
    reportName: '',
  });
  
  const [schedulingModal, setSchedulingModal] = useState<{
    isOpen: boolean;
    reportId: string;
    reportName: string;
  }>({
    isOpen: false,
    reportId: '',
    reportName: '',
  });
  
  // Filter reports based on selected category and search
  const filteredReports = reportTemplates.filter(report => {
    const matchesCategory = !selectedCategory || report.category === selectedCategory;
    const matchesSearch = !searchTerm || 
      report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    
    return matchesCategory && matchesSearch && matchesStatus;
  });
  
  const handleGenerateReport = (reportId: string) => {
    console.log(`Gerando relatório: ${reportId}`);
    const report = reportTemplates.find(r => r.id === reportId);
    if (report) {
      report.status = 'generating';
      announce(HEALTHCARE_ANNOUNCEMENTS.REPORT_GENERATING);
      
      // Simulate generation time
      setTimeout(() => {
        report.status = 'available';
        report.lastGenerated = new Date().toISOString().split('T')[0];
        announce(HEALTHCARE_ANNOUNCEMENTS.REPORT_READY);
      }, 3000);
    }
  };
  
  const handleExportClick = (reportId: string) => {
    const report = reportTemplates.find(r => r.id === reportId);
    if (report) {
      saveFocus();
      setExportModal({
        isOpen: true,
        reportId,
        reportName: report.name,
      });
      announce(`Abrindo opções de exportação para ${report.name}`);
    }
  };
  
  const handleScheduleClick = (reportId: string) => {
    console.log(`Agendando relatório: ${reportId}`);
    // Will implement scheduling modal
  };
  
  // Add effect for search results announcement
  useEffect(() => {
    announce(HEALTHCARE_ANNOUNCEMENTS.SEARCH_RESULTS_UPDATED(filteredReports.length));
  }, [filteredReports.length, announce]);
  
  // Add effect for category selection announcement
  useEffect(() => {
    if (selectedCategory) {
      const categoryName = reportCategories.find(c => c.id === selectedCategory)?.name;
      if (categoryName) {
        announce(HEALTHCARE_ANNOUNCEMENTS.CATEGORY_SELECTED(categoryName));
      }
    }
  }, [selectedCategory, announce]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <SkipLinks />
      <div className="container mx-auto space-y-8 p-6" id="main-content" role="main">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Central de Relatórios
            </h1>
            <p className="text-slate-400">
              Sistema completo de relatórios para conformidade regulatória e gestão clínica
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <CosmicGlowButton
              variant="secondary"
              size="sm"
              onClick={() => window.print()}
            >
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </CosmicGlowButton>
            
            <CosmicGlowButton
              variant="primary"
              size="sm"
              onClick={() => setSelectedCategory('custom')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Relatório
            </CosmicGlowButton>
          </div>
        </div>
        
        {/* Search and Filters */}
        <NeonGradientCard>
          <div className="flex flex-col lg:flex-row gap-4" id="search-filters" role="search">
            <div className="flex-1">
              <Label htmlFor="report-search" className="sr-only">
                Buscar relatórios
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
                <Input
                  id="report-search"
                  placeholder="Buscar relatórios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-700 text-white placeholder-slate-400"
                  aria-label="Buscar relatórios por nome ou descrição"
                  aria-describedby="search-results-count"
                />
              </div>
              <div id="search-results-count" className="sr-only" aria-live="polite">
                {filteredReports.length} relatórios encontrados
              </div>
            </div>
            
            <div className="flex gap-3">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48 bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="available">Disponível</SelectItem>
                  <SelectItem value="generating">Gerando</SelectItem>
                  <SelectItem value="scheduled">Agendado</SelectItem>
                  <SelectItem value="error">Erro</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-700"
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setSelectedCategory(null);
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            </div>
          </div>
        </NeonGradientCard>
        
        {/* Report Categories Navigation */}
        {!selectedCategory && (
          <>
            <div id="report-categories" role="region" aria-labelledby="categories-heading">
              <h2 id="categories-heading" className="text-2xl font-bold text-white mb-6">
                Categorias de Relatórios
              </h2>
              <div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                role="grid"
                aria-label="Categorias de relatórios disponíveis"
              >
                {reportCategories.map((category) => (
                  <ReportCategoryCard
                    key={category.id}
                    category={category}
                    onSelectCategory={setSelectedCategory}
                  />
                ))}
              </div>
            </div>
            
            {/* Quick Actions and Recent Reports */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <QuickActionsSection onSelectCategory={setSelectedCategory} />
              <RecentReportsSection />
            </div>
          </>
        )}
        
        {/* Selected Category Reports */}
        {selectedCategory && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedCategory(null)}
                  className="border-slate-700 text-slate-300 hover:bg-slate-700"
                >
                  ← Voltar
                </Button>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {reportCategories.find(c => c.id === selectedCategory)?.name}
                  </h2>
                  <p className="text-slate-400">
                    {reportCategories.find(c => c.id === selectedCategory)?.description}
                  </p>
                </div>
              </div>
              
              <Badge variant="secondary" className="text-sm">
                {filteredReports.length} relatórios
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReports.map((report) => (
                <ReportTemplateCard
                  key={report.id}
                  report={report}
                  onGenerate={handleGenerateReport}
                  onExport={handleExportClick}
                  onSchedule={handleScheduleClick}
                />
              ))}
            </div>
            
            {filteredReports.length === 0 && (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-slate-600 mb-4" />
                <h3 className="text-lg font-medium text-slate-400 mb-2">
                  Nenhum relatório encontrado
                </h3>
                <p className="text-slate-500">
                  Tente ajustar os filtros ou termos de busca
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Export Modal */}
        <ExportOptionsModal
          isOpen={exportModal.isOpen}
          onClose={() => setExportModal({ ...exportModal, isOpen: false })}
          reportId={exportModal.reportId}
          reportName={exportModal.reportName}
        />
        
        {/* Scheduling Modal */}
        <SchedulingModal
          isOpen={schedulingModal.isOpen}
          onClose={() => setSchedulingModal({ ...schedulingModal, isOpen: false })}
          reportId={schedulingModal.reportId}
          reportName={schedulingModal.reportName}
          onScheduleCreated={handleScheduleCreated}
        />
        
        {/* Footer */}
        <div className="text-center text-slate-500 text-sm pt-8 border-t border-slate-800">
          <p>NeonPro Healthcare Reports Center</p>
          <p>Conformidade LGPD, ANVISA, CFM e ANS • Exportação segura • Auditoria completa</p>
        </div>
      </div>
    </div>
  );
}
'use client';

import { motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  Edit,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Mail,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Settings,
  Share2,
  Shield,
  Stethoscope,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  HEALTHCARE_ANNOUNCEMENTS,
  initializeAccessibility,
  SkipLinks,
  useAnnouncements,
  useFocusManagement,
  useReducedMotion,
} from './accessibility-utils';
import SchedulingModal from './scheduling-modal';

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
      'bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary',
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
        className={`inline-flex items-center gap-2 rounded-lg font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl ${variants[variant]} ${sizes[size]} ${className} ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
        disabled={disabled}
        href={href}
        onClick={disabled ? undefined : onClick}
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
  frequency:
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'quarterly'
    | 'yearly'
    | 'on-demand';
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
    description:
      'Análise completa de conformidade com a Lei Geral de Proteção de Dados',
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
    description:
      'Preparação para inspeções da Agência Nacional de Vigilância Sanitária',
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
    description:
      'Registro de atividades profissionais para o Conselho Federal de Medicina',
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
    description:
      'Indicadores de qualidade para a Agência Nacional de Saúde Suplementar',
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
    description:
      'Análise detalhada de receitas por período, serviço e profissional',
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
    count: reportTemplates.filter((r) => r.category === 'regulatory').length,
  },
  {
    id: 'financial' as const,
    name: 'Relatórios Financeiros',
    description: 'Receitas, pagamentos e conformidade fiscal',
    icon: DollarSign,
    color: 'from-green-500 to-emerald-600',
    bgColor: 'bg-green-500/10',
    count: reportTemplates.filter((r) => r.category === 'financial').length,
  },
  {
    id: 'clinical' as const,
    name: 'Relatórios Clínicos',
    description: 'Resultados, satisfação e qualidade',
    icon: Activity,
    color: 'from-primary to-accent',
    bgColor: 'bg-purple-500/10',
    count: reportTemplates.filter((r) => r.category === 'clinical').length,
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
  downloadReport,
  emailReport,
  generateCSVReport,
  generateSecureShareLink,
  HealthcareExcelExporter,
  HealthcarePDFGenerator,
} from './export-utils';

// Export functionality implementation
const handleExportReport = (
  reportId: string,
  format: 'pdf' | 'excel' | 'csv'
) => {
  try {
    switch (format) {
      case 'pdf': {
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
      }

      case 'excel': {
        const excelData = HealthcareExcelExporter.generateComprehensiveReport();
        downloadReport(excelData, 'relatorio-completo-neonpro.xlsx', 'excel');
        break;
      }

      case 'csv': {
        const csvData = generateCSVReport(reportId.split('-')[0]); // Extract category
        downloadReport(csvData, `relatorio-${reportId}.csv`, 'csv');
        break;
      }
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
  const report = reportTemplates.find((r) => r.id === reportId);
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
}; // Main Reports Center Components

// Report Category Card Component
function ReportCategoryCard({
  category,
  onSelectCategory,
}: {
  category: (typeof reportCategories)[0];
  onSelectCategory: (categoryId: ReportCategory) => void;
}) {
  const Icon = category.icon;

  return (
    <motion.div
      className="cursor-pointer"
      onClick={() => onSelectCategory(category.id)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <NeonGradientCard className="h-full transition-all duration-300 hover:border-blue-500/50">
        <div className="flex items-start justify-between">
          <div className={`rounded-lg p-3 ${category.bgColor}`}>
            <Icon className="h-8 w-8 text-white" />
          </div>
          <Badge className="text-xs" variant="secondary">
            {category.count} relatórios
          </Badge>
        </div>

        <div className="mt-4">
          <h3 className="font-semibold text-lg text-white">{category.name}</h3>
          <p className="mt-1 text-slate-400 text-sm">{category.description}</p>
        </div>

        <div className="mt-4 flex items-center font-medium text-blue-400 text-sm">
          <span>Ver relatórios</span>
          <BarChart3 className="ml-2 h-4 w-4" />
        </div>
      </NeonGradientCard>
    </motion.div>
  );
}

// Report Template Card Component
function ReportTemplateCard({
  report,
  onGenerate,
  onExport,
  onSchedule,
}: {
  report: ReportTemplate;
  onGenerate: (reportId: string) => void;
  onExport: (reportId: string, format: 'pdf' | 'excel' | 'csv') => void;
  onSchedule: (reportId: string) => void;
}) {
  const Icon = report.icon;

  const getStatusBadge = (status: ReportTemplate['status']) => {
    switch (status) {
      case 'available':
        return (
          <Badge
            className="border-green-400 text-green-400"
            variant="secondary"
          >
            Disponível
          </Badge>
        );
      case 'generating':
        return (
          <Badge
            className="border-yellow-400 text-yellow-400"
            variant="secondary"
          >
            Gerando...
          </Badge>
        );
      case 'scheduled':
        return (
          <Badge className="border-blue-400 text-blue-400" variant="secondary">
            Agendado
          </Badge>
        );
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
    }
  };

  return (
    <NeonGradientCard className="transition-all duration-300 hover:border-blue-500/30">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-500/10 p-2">
            <Icon className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-white">{report.name}</h4>
            <p className="text-slate-400 text-xs">{report.description}</p>
          </div>
        </div>
        {getStatusBadge(report.status)}
      </div>

      <div className="mb-4 space-y-2">
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

      <div className="mb-3 flex items-center gap-2">
        {report.compliance.map((comp) => (
          <Badge
            className="border-slate-600 text-slate-300 text-xs"
            key={comp}
            variant="outline"
          >
            {comp}
          </Badge>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <CosmicGlowButton
          className="flex-1"
          disabled={report.status === 'generating'}
          onClick={() => onGenerate(report.id)}
          size="sm"
          variant="primary"
        >
          {report.status === 'generating' ? (
            <>
              <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
              Gerando...
            </>
          ) : (
            <>
              <Zap className="mr-1 h-3 w-3" />
              Gerar
            </>
          )}
        </CosmicGlowButton>

        <Button
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
          onClick={() => onExport(report.id, 'pdf')}
          size="sm"
          variant="outline"
        >
          <Download className="h-3 w-3" />
        </Button>

        <Button
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
          onClick={() => onSchedule(report.id)}
          size="sm"
          variant="outline"
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
      <div className="mb-6 flex items-center justify-between">
        <h3 className="font-bold text-white text-xl">Relatórios Recentes</h3>
        <CosmicGlowButton size="sm" variant="secondary">
          <Eye className="mr-2 h-4 w-4" />
          Ver Todos
        </CosmicGlowButton>
      </div>

      <div className="space-y-3">
        {recentReports.map((report) => (
          <motion.div
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-between rounded-lg bg-white/5 p-3 transition-colors hover:bg-white/10"
            initial={{ opacity: 0, x: -20 }}
            key={report.id}
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/10 p-2">
                <FileText className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-sm text-white">{report.name}</p>
                <p className="text-slate-400 text-xs">
                  {new Date(report.generatedAt).toLocaleString('pt-BR')} •{' '}
                  {report.size}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                className="border-slate-600 text-slate-300 text-xs"
                variant="outline"
              >
                {report.type}
              </Badge>
              <Button
                className="text-slate-400 hover:text-white"
                size="sm"
                variant="ghost"
              >
                <Download className="h-3 w-3" />
              </Button>
              <Button
                className="text-slate-400 hover:text-white"
                size="sm"
                variant="ghost"
              >
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
function QuickActionsSection({
  onSelectCategory,
}: {
  onSelectCategory: (categoryId: ReportCategory) => void;
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
      <h3 className="mb-6 font-bold text-white text-xl">Ações Rápidas</h3>
      <div className="grid grid-cols-2 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <CosmicGlowButton
              className="flex h-24 flex-col items-center justify-center p-4 text-center"
              key={action.name}
              onClick={action.action}
              variant={action.variant}
            >
              <Icon className="mb-2 h-5 w-5" />
              <span className="font-medium text-sm">{action.name}</span>
              <span className="text-xs opacity-75">{action.description}</span>
            </CosmicGlowButton>
          );
        })}
      </div>
    </NeonGradientCard>
  );
} // Export Options Modal Component
function ExportOptionsModal({
  isOpen,
  onClose,
  reportId,
  reportName,
}: {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
  reportName: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        animate={{ opacity: 1, scale: 1 }}
        className="mx-4 w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6"
        initial={{ opacity: 0, scale: 0.9 }}
      >
        <div className="mb-6 flex items-center justify-between">
          <h3 className="font-bold text-lg text-white">Opções de Export</h3>
          <Button
            className="text-slate-400 hover:text-white"
            onClick={onClose}
            size="sm"
            variant="ghost"
          >
            ✕
          </Button>
        </div>

        <p className="mb-6 text-slate-400 text-sm">
          Selecione o formato para exportar:{' '}
          <strong className="text-white">{reportName}</strong>
        </p>

        <div className="space-y-3">
          <CosmicGlowButton
            className="w-full justify-start"
            onClick={() => {
              handleExportReport(reportId, 'pdf');
              onClose();
            }}
            variant="primary"
          >
            <FileText className="mr-3 h-4 w-4" />
            PDF - Formato profissional
          </CosmicGlowButton>

          <CosmicGlowButton
            className="w-full justify-start"
            onClick={() => {
              handleExportReport(reportId, 'excel');
              onClose();
            }}
            variant="success"
          >
            <FileSpreadsheet className="mr-3 h-4 w-4" />
            Excel - Dados para análise
          </CosmicGlowButton>

          <CosmicGlowButton
            className="w-full justify-start"
            onClick={() => {
              handleExportReport(reportId, 'csv');
              onClose();
            }}
            variant="secondary"
          >
            <Download className="mr-3 h-4 w-4" />
            CSV - Dados simplificados
          </CosmicGlowButton>
        </div>

        <div className="mt-6 border-slate-700 border-t pt-4">
          <div className="flex gap-3">
            <CosmicGlowButton
              className="flex-1"
              onClick={() => {
                handleEmailReport(reportId);
                onClose();
              }}
              size="sm"
              variant="warning"
            >
              <Mail className="mr-2 h-3 w-3" />
              Enviar por Email
            </CosmicGlowButton>

            <CosmicGlowButton
              className="flex-1"
              onClick={() => {
                handleScheduleReport(reportId);
                onClose();
              }}
              size="sm"
              variant="secondary"
            >
              <Calendar className="mr-2 h-3 w-3" />
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
  const [selectedCategory, setSelectedCategory] =
    useState<ReportCategory | null>(null);
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
  const filteredReports = reportTemplates.filter((report) => {
    const matchesCategory =
      !selectedCategory || report.category === selectedCategory;
    const matchesSearch =
      !searchTerm ||
      report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' || report.status === filterStatus;

    return matchesCategory && matchesSearch && matchesStatus;
  });

  const handleGenerateReport = (reportId: string) => {
    console.log(`Gerando relatório: ${reportId}`);
    const report = reportTemplates.find((r) => r.id === reportId);
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
    const report = reportTemplates.find((r) => r.id === reportId);
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
    announce(
      HEALTHCARE_ANNOUNCEMENTS.SEARCH_RESULTS_UPDATED(filteredReports.length)
    );
  }, [filteredReports.length, announce]);

  // Add effect for category selection announcement
  useEffect(() => {
    if (selectedCategory) {
      const categoryName = reportCategories.find(
        (c) => c.id === selectedCategory
      )?.name;
      if (categoryName) {
        announce(HEALTHCARE_ANNOUNCEMENTS.CATEGORY_SELECTED(categoryName));
      }
    }
  }, [selectedCategory, announce]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <SkipLinks />
      <div
        className="container mx-auto space-y-8 p-6"
        id="main-content"
        role="main"
      >
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="mb-2 font-bold text-3xl text-white">
              Central de Relatórios
            </h1>
            <p className="text-slate-400">
              Sistema completo de relatórios para conformidade regulatória e
              gestão clínica
            </p>
          </div>

          <div className="flex items-center gap-3">
            <CosmicGlowButton
              onClick={() => window.print()}
              size="sm"
              variant="secondary"
            >
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </CosmicGlowButton>

            <CosmicGlowButton
              onClick={() => setSelectedCategory('custom')}
              size="sm"
              variant="primary"
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Relatório
            </CosmicGlowButton>
          </div>
        </div>

        {/* Search and Filters */}
        <NeonGradientCard>
          <div
            className="flex flex-col gap-4 lg:flex-row"
            id="search-filters"
            role="search"
          >
            <div className="flex-1">
              <Label className="sr-only" htmlFor="report-search">
                Buscar relatórios
              </Label>
              <div className="relative">
                <Search
                  aria-hidden="true"
                  className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-slate-400"
                />
                <Input
                  aria-describedby="search-results-count"
                  aria-label="Buscar relatórios por nome ou descrição"
                  className="border-slate-700 bg-slate-800 pl-10 text-white placeholder-slate-400"
                  id="report-search"
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar relatórios..."
                  value={searchTerm}
                />
              </div>
              <div
                aria-live="polite"
                className="sr-only"
                id="search-results-count"
              >
                {filteredReports.length} relatórios encontrados
              </div>
            </div>

            <div className="flex gap-3">
              <Select onValueChange={setFilterStatus} value={filterStatus}>
                <SelectTrigger className="w-48 border-slate-700 bg-slate-800 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="border-slate-700 bg-slate-800">
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="available">Disponível</SelectItem>
                  <SelectItem value="generating">Gerando</SelectItem>
                  <SelectItem value="scheduled">Agendado</SelectItem>
                  <SelectItem value="error">Erro</SelectItem>
                </SelectContent>
              </Select>

              <Button
                className="border-slate-700 text-slate-300 hover:bg-slate-700"
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setSelectedCategory(null);
                }}
                variant="outline"
              >
                <Filter className="mr-2 h-4 w-4" />
                Limpar
              </Button>
            </div>
          </div>
        </NeonGradientCard>

        {/* Report Categories Navigation */}
        {!selectedCategory && (
          <>
            <div
              aria-labelledby="categories-heading"
              id="report-categories"
              role="region"
            >
              <h2
                className="mb-6 font-bold text-2xl text-white"
                id="categories-heading"
              >
                Categorias de Relatórios
              </h2>
              <div
                aria-label="Categorias de relatórios disponíveis"
                className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
                role="grid"
              >
                {reportCategories.map((category) => (
                  <ReportCategoryCard
                    category={category}
                    key={category.id}
                    onSelectCategory={setSelectedCategory}
                  />
                ))}
              </div>
            </div>

            {/* Quick Actions and Recent Reports */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <QuickActionsSection onSelectCategory={setSelectedCategory} />
              <RecentReportsSection />
            </div>
          </>
        )}

        {/* Selected Category Reports */}
        {selectedCategory && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  className="border-slate-700 text-slate-300 hover:bg-slate-700"
                  onClick={() => setSelectedCategory(null)}
                  variant="outline"
                >
                  ← Voltar
                </Button>
                <div>
                  <h2 className="font-bold text-2xl text-white">
                    {
                      reportCategories.find((c) => c.id === selectedCategory)
                        ?.name
                    }
                  </h2>
                  <p className="text-slate-400">
                    {
                      reportCategories.find((c) => c.id === selectedCategory)
                        ?.description
                    }
                  </p>
                </div>
              </div>

              <Badge className="text-sm" variant="secondary">
                {filteredReports.length} relatórios
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredReports.map((report) => (
                <ReportTemplateCard
                  key={report.id}
                  onExport={handleExportClick}
                  onGenerate={handleGenerateReport}
                  onSchedule={handleScheduleClick}
                  report={report}
                />
              ))}
            </div>

            {filteredReports.length === 0 && (
              <div className="py-12 text-center">
                <FileText className="mx-auto mb-4 h-12 w-12 text-slate-600" />
                <h3 className="mb-2 font-medium text-lg text-slate-400">
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
          onClose={() =>
            setSchedulingModal({ ...schedulingModal, isOpen: false })
          }
          onScheduleCreated={handleScheduleCreated}
          reportId={schedulingModal.reportId}
          reportName={schedulingModal.reportName}
        />

        {/* Footer */}
        <div className="border-slate-800 border-t pt-8 text-center text-slate-500 text-sm">
          <p>NeonPro Healthcare Reports Center</p>
          <p>
            Conformidade LGPD, ANVISA, CFM e ANS • Exportação segura • Auditoria
            completa
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import { motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Heart,
  Shield,
  TrendingUp,
  Users,
  Zap,
  Calendar,
  Bell,
  Activity,
  BarChart3,
  Settings,
  Download,
  RefreshCw,
  ChevronRight,
  AlertCircle,
  Info,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Healthcare compliance types
interface ComplianceMetric {
  id: string;
  title: string;
  score: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
}

interface ComplianceAlert {
  id: string;
  type: 'critical' | 'important' | 'routine';
  title: string;
  description: string;
  dueDate: string;
  category: 'LGPD' | 'ANVISA' | 'CFM';
  actionRequired: boolean;
}

interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'LGPD' | 'ANVISA' | 'CFM';
  estimatedTime: string;
  assignedTo: string;
  status: 'pending' | 'in_progress' | 'completed';
  dueDate: string;
}

// NeonPro design components matching existing dashboard patterns
type NeonGradientCardProps = {
  children: React.ReactNode;
  className?: string;
};

const NeonGradientCard = ({ children, className = '' }: NeonGradientCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`relative overflow-hidden rounded-xl border border-healthcare-border bg-gradient-to-br from-slate-900/90 to-blue-900/30 backdrop-blur-sm ${className}`}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-healthcare-primary/10 to-blue-500/10 opacity-50" />
    <div className="relative z-10 p-6">{children}</div>
  </motion.div>
);

type CosmicGlowButtonProps = {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
};

const CosmicGlowButton = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  className = '',
  disabled = false,
}: CosmicGlowButtonProps) => {
  const variants = {
    primary: 'bg-gradient-to-r from-healthcare-primary to-blue-600 hover:from-healthcare-primary/80 hover:to-blue-700',
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

// Mock data for Brazilian healthcare compliance
const complianceMetrics: ComplianceMetric[] = [
  {
    id: 'lgpd-overall',
    title: 'LGPD - Proteção de Dados',
    score: 92,
    status: 'excellent',
    trend: 'up',
    lastUpdated: '2024-01-15T14:30:00Z',
  },
  {
    id: 'anvisa-overall',
    title: 'ANVISA - Vigilância Sanitária',
    score: 88,
    status: 'good',
    trend: 'stable',
    lastUpdated: '2024-01-15T10:15:00Z',
  },
  {
    id: 'cfm-overall',
    title: 'CFM - Medicina Profissional',
    score: 95,
    status: 'excellent',
    trend: 'up',
    lastUpdated: '2024-01-15T16:45:00Z',
  },
  {
    id: 'audit-readiness',
    title: 'Prontidão para Auditoria',
    score: 85,
    status: 'good',
    trend: 'up',
    lastUpdated: '2024-01-15T12:00:00Z',
  },
];

const complianceAlerts: ComplianceAlert[] = [
  {
    id: 'lgpd-consent-review',
    type: 'important',
    title: 'Revisão de Consentimentos LGPD',
    description: 'Revisar e atualizar formulários de consentimento para pacientes',
    dueDate: '2024-01-25',
    category: 'LGPD',
    actionRequired: true,
  },
  {
    id: 'anvisa-license-renewal',
    type: 'critical',
    title: 'Renovação de Licença ANVISA',
    description: 'Licença de funcionamento ANVISA expira em 10 dias',
    dueDate: '2024-01-25',
    category: 'ANVISA',
    actionRequired: true,
  },
  {
    id: 'cfm-education-credits',
    type: 'routine',
    title: 'Créditos de Educação Continuada',
    description: 'Acompanhar progresso de educação médica continuada da equipe',
    dueDate: '2024-02-15',
    category: 'CFM',
    actionRequired: false,
  },
];

const actionItems: ActionItem[] = [
  {
    id: 'lgpd-data-mapping',
    title: 'Mapeamento de Dados Pessoais',
    description: 'Atualizar inventário de processamento de dados pessoais',
    priority: 'high',
    category: 'LGPD',
    estimatedTime: '4 horas',
    assignedTo: 'Dr. Maria Silva',
    status: 'in_progress',
    dueDate: '2024-01-20',
  },
  {
    id: 'anvisa-equipment-validation',
    title: 'Validação de Equipamentos Médicos',
    description: 'Completar validação anual de equipamentos médicos',
    priority: 'critical',
    category: 'ANVISA',
    estimatedTime: '2 dias',
    assignedTo: 'Eng. João Santos',
    status: 'pending',
    dueDate: '2024-01-18',
  },
  {
    id: 'cfm-license-check',
    title: 'Verificação de Licenças Médicas',
    description: 'Verificar status de renovação das licenças da equipe médica',
    priority: 'medium',
    category: 'CFM',
    estimatedTime: '1 hora',
    assignedTo: 'RH - Ana Costa',
    status: 'completed',
    dueDate: '2024-01-15',
  },
];

// Compliance Overview Section
function ComplianceOverview() {
  const overallScore = Math.round(
    complianceMetrics.reduce((acc, metric) => acc + metric.score, 0) / complianceMetrics.length
  );

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreStatus = (score: number) => {
    if (score >= 90) return 'Excelente';
    if (score >= 80) return 'Bom';
    if (score >= 60) return 'Atenção';
    return 'Crítico';
  };

  return (
    <NeonGradientCard>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-4">
          Score de Compliance Geral
        </h2>
        <div className={`text-6xl font-bold mb-2 ${getScoreColor(overallScore)}`}>
          {overallScore}%
        </div>
        <p className="text-slate-300 mb-6">
          Status: {getScoreStatus(overallScore)}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {complianceMetrics.map((metric) => (
            <div key={metric.id} className="bg-white/5 rounded-lg p-4">
              <h3 className="text-sm font-medium text-slate-300 mb-2">
                {metric.title}
              </h3>
              <div className={`text-2xl font-bold ${getScoreColor(metric.score)}`}>
                {metric.score}%
              </div>
              <div className="flex items-center justify-center mt-2">
                {metric.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-400" />}
                {metric.trend === 'down' && <TrendingUp className="h-4 w-4 text-red-400 rotate-180" />}
                {metric.trend === 'stable' && <Activity className="h-4 w-4 text-yellow-400" />}
                <span className="text-xs text-slate-400 ml-1">
                  {metric.trend === 'up' ? 'Melhorando' : metric.trend === 'down' ? 'Declinando' : 'Estável'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </NeonGradientCard>
  );
}// Critical Alerts Section
function CriticalAlerts() {
  const criticalAlerts = complianceAlerts.filter(alert => alert.type === 'critical');
  const importantAlerts = complianceAlerts.filter(alert => alert.type === 'important');

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="h-5 w-5 text-red-400" />;
      case 'important': return <AlertCircle className="h-5 w-5 text-yellow-400" />;
      default: return <Info className="h-5 w-5 text-blue-400" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'border-red-500/50 bg-red-500/10';
      case 'important': return 'border-yellow-500/50 bg-yellow-500/10';
      default: return 'border-blue-500/50 bg-blue-500/10';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'LGPD': return 'bg-blue-500';
      case 'ANVISA': return 'bg-green-500';
      case 'CFM': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <NeonGradientCard>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Bell className="h-5 w-5 mr-2" />
          Alertas Críticos e Importantes
        </h2>
        <CosmicGlowButton variant="secondary" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </CosmicGlowButton>
      </div>

      <div className="space-y-4">
        {complianceAlerts.slice(0, 5).map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-4 rounded-lg border ${getAlertColor(alert.type)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                {getAlertIcon(alert.type)}
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-white">{alert.title}</h3>
                    <Badge className={`${getCategoryColor(alert.category)} text-white text-xs`}>
                      {alert.category}
                    </Badge>
                  </div>
                  <p className="text-slate-300 text-sm mb-2">{alert.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-slate-400">
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Prazo: {new Date(alert.dueDate).toLocaleDateString('pt-BR')}
                    </span>
                    {alert.actionRequired && (
                      <span className="text-red-400 font-medium">Ação Requerida</span>
                    )}
                  </div>
                </div>
              </div>
              <CosmicGlowButton
                variant={alert.type === 'critical' ? 'danger' : 'warning'}
                size="sm"
              >
                <ChevronRight className="h-4 w-4" />
              </CosmicGlowButton>
            </div>
          </motion.div>
        ))}
      </div>

      {complianceAlerts.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum alerta crítico no momento</p>
          <p className="text-sm">Todos os sistemas estão em conformidade</p>
        </div>
      )}
    </NeonGradientCard>
  );
}

// LGPD Compliance Module
function LGPDComplianceModule() {
  const lgpdMetrics = [
    { label: 'Consentimentos Válidos', value: '94%', status: 'good' },
    { label: 'Solicitações de Dados', value: '12', status: 'good' },
    { label: 'Tempo de Resposta Médio', value: '3.2 dias', status: 'good' },
    { label: 'Incidentes de Dados', value: '0', status: 'excellent' },
  ];

  const recentActivities = [
    { action: 'Consentimento atualizado', patient: 'Paciente #1234', time: '2h atrás' },
    { action: 'Solicitação de dados processada', patient: 'Paciente #5678', time: '4h atrás' },
    { action: 'Revisão de política de privacidade', patient: 'Sistema', time: '1 dia atrás' },
  ];

  return (
    <NeonGradientCard>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Shield className="h-5 w-5 mr-2 text-blue-400" />
          LGPD - Proteção de Dados
        </h2>
        <div className="flex space-x-2">
          <CosmicGlowButton variant="primary" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Relatório LGPD
          </CosmicGlowButton>
          <CosmicGlowButton variant="secondary" size="sm">
            <Settings className="h-4 w-4" />
          </CosmicGlowButton>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {lgpdMetrics.map((metric, index) => (
          <div key={index} className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-white">{metric.value}</div>
            <div className="text-sm text-slate-300">{metric.label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-white text-sm">Atividades Recentes</h3>
        {recentActivities.map((activity, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div>
              <p className="text-white text-sm font-medium">{activity.action}</p>
              <p className="text-slate-400 text-xs">{activity.patient}</p>
            </div>
            <span className="text-slate-400 text-xs">{activity.time}</span>
          </div>
        ))}
      </div>
    </NeonGradientCard>
  );
}

// ANVISA Compliance Module
function ANVISAComplianceModule() {
  const anvisaMetrics = [
    { label: 'Licenças Válidas', value: '8/8', status: 'excellent' },
    { label: 'Equipamentos Validados', value: '97%', status: 'good' },
    { label: 'Eventos Adversos', value: '2', status: 'warning' },
    { label: 'Auditorias Pendentes', value: '1', status: 'warning' },
  ];

  const licenses = [
    { name: 'Licença de Funcionamento', expiry: '2024-06-15', status: 'valid' },
    { name: 'Licença Sanitária', expiry: '2024-03-20', status: 'renewing' },
    { name: 'Licença de Equipamentos', expiry: '2024-08-10', status: 'valid' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'text-green-400';
      case 'renewing': return 'text-yellow-400';
      case 'expired': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'valid': return 'Válida';
      case 'renewing': return 'Renovando';
      case 'expired': return 'Expirada';
      default: return 'Desconhecido';
    }
  };

  return (
    <NeonGradientCard>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Heart className="h-5 w-5 mr-2 text-green-400" />
          ANVISA - Vigilância Sanitária
        </h2>
        <div className="flex space-x-2">
          <CosmicGlowButton variant="success" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Certificados
          </CosmicGlowButton>
          <CosmicGlowButton variant="secondary" size="sm">
            <Settings className="h-4 w-4" />
          </CosmicGlowButton>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {anvisaMetrics.map((metric, index) => (
          <div key={index} className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-white">{metric.value}</div>
            <div className="text-sm text-slate-300">{metric.label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-white text-sm">Status das Licenças</h3>
        {licenses.map((license, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div>
              <p className="text-white text-sm font-medium">{license.name}</p>
              <p className="text-slate-400 text-xs">
                Expira em: {new Date(license.expiry).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <span className={`text-sm font-medium ${getStatusColor(license.status)}`}>
              {getStatusText(license.status)}
            </span>
          </div>
        ))}
      </div>
    </NeonGradientCard>
  );
}// CFM Professional Module
function CFMComplianceModule() {
  const cfmMetrics = [
    { label: 'Licenças Médicas Válidas', value: '12/12', status: 'excellent' },
    { label: 'Créditos CME Completos', value: '89%', status: 'good' },
    { label: 'Certificações Especiais', value: '6', status: 'good' },
    { label: 'Renovações Pendentes', value: '2', status: 'warning' },
  ];

  const professionals = [
    { name: 'Dr. João Silva', crm: 'CRM-SP 123456', specialty: 'Cardiologia', cmeCredits: '85%' },
    { name: 'Dra. Maria Santos', crm: 'CRM-SP 234567', specialty: 'Pediatria', cmeCredits: '92%' },
    { name: 'Dr. Carlos Oliveira', crm: 'CRM-SP 345678', specialty: 'Ortopedia', cmeCredits: '78%' },
  ];

  return (
    <NeonGradientCard>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Users className="h-5 w-5 mr-2 text-purple-400" />
          CFM - Medicina Profissional
        </h2>
        <div className="flex space-x-2">
          <CosmicGlowButton variant="primary" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Relatório CME
          </CosmicGlowButton>
          <CosmicGlowButton variant="secondary" size="sm">
            <Settings className="h-4 w-4" />
          </CosmicGlowButton>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {cfmMetrics.map((metric, index) => (
          <div key={index} className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-white">{metric.value}</div>
            <div className="text-sm text-slate-300">{metric.label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-white text-sm">Equipe Médica</h3>
        {professionals.map((prof, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div>
              <p className="text-white text-sm font-medium">{prof.name}</p>
              <p className="text-slate-400 text-xs">{prof.crm} - {prof.specialty}</p>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium text-white">{prof.cmeCredits}</span>
              <p className="text-slate-400 text-xs">CME Completo</p>
            </div>
          </div>
        ))}
      </div>
    </NeonGradientCard>
  );
}

// Action Items Section
function ActionItemsSection() {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-400 border-red-500/50 bg-red-500/10';
      case 'high': return 'text-orange-400 border-orange-500/50 bg-orange-500/10';
      case 'medium': return 'text-yellow-400 border-yellow-500/50 bg-yellow-500/10';
      case 'low': return 'text-green-400 border-green-500/50 bg-green-500/10';
      default: return 'text-slate-400 border-slate-500/50 bg-slate-500/10';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'high': return <AlertCircle className="h-4 w-4" />;
      case 'medium': return <Clock className="h-4 w-4" />;
      case 'low': return <Info className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'critical': return 'Crítico';
      case 'high': return 'Alto';
      case 'medium': return 'Médio';
      case 'low': return 'Baixo';
      default: return 'Indefinido';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'in_progress': return 'text-blue-400';
      case 'pending': return 'text-yellow-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluído';
      case 'in_progress': return 'Em Andamento';
      case 'pending': return 'Pendente';
      default: return 'Indefinido';
    }
  };

  return (
    <NeonGradientCard>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Zap className="h-5 w-5 mr-2 text-yellow-400" />
          Itens de Ação Prioritários
        </h2>
        <div className="flex space-x-2">
          <CosmicGlowButton variant="primary" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Nova Ação
          </CosmicGlowButton>
          <CosmicGlowButton variant="secondary" size="sm">
            <Settings className="h-4 w-4" />
          </CosmicGlowButton>
        </div>
      </div>

      <div className="space-y-4">
        {actionItems.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg border ${getPriorityColor(item.priority)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="flex items-center space-x-2">
                  {getPriorityIcon(item.priority)}
                  <Badge className={`${item.category === 'LGPD' ? 'bg-blue-500' : item.category === 'ANVISA' ? 'bg-green-500' : 'bg-purple-500'} text-white text-xs`}>
                    {item.category}
                  </Badge>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white text-sm mb-1">{item.title}</h3>
                  <p className="text-slate-300 text-xs mb-2">{item.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-slate-400">
                    <span>Responsável: {item.assignedTo}</span>
                    <span>Tempo estimado: {item.estimatedTime}</span>
                    <span>Prazo: {new Date(item.dueDate).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <span className={`text-xs font-medium ${getPriorityColor(item.priority).split(' ')[0]}`}>
                  {getPriorityText(item.priority)}
                </span>
                <span className={`text-xs font-medium ${getStatusColor(item.status)}`}>
                  {getStatusText(item.status)}
                </span>
                <CosmicGlowButton
                  variant={item.status === 'completed' ? 'success' : 'primary'}
                  size="sm"
                  disabled={item.status === 'completed'}
                >
                  {item.status === 'completed' ? 'Concluído' : 'Ação'}
                </CosmicGlowButton>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </NeonGradientCard>
  );
}

// Regulatory Calendar
function RegulatoryCalendar() {
  const upcomingDeadlines = [
    { title: 'Renovação ANVISA', date: '2024-01-25', category: 'ANVISA', type: 'critical' },
    { title: 'Relatório LGPD Trimestral', date: '2024-01-31', category: 'LGPD', type: 'important' },
    { title: 'Auditoria Interna', date: '2024-02-15', category: 'Qualidade', type: 'routine' },
    { title: 'Renovação CRM Dr. Silva', date: '2024-02-28', category: 'CFM', type: 'important' },
    { title: 'Treinamento LGPD Equipe', date: '2024-03-05', category: 'LGPD', type: 'routine' },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'critical': return 'border-l-red-500 bg-red-500/10';
      case 'important': return 'border-l-yellow-500 bg-yellow-500/10';
      case 'routine': return 'border-l-blue-500 bg-blue-500/10';
      default: return 'border-l-slate-500 bg-slate-500/10';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'LGPD': return 'bg-blue-500';
      case 'ANVISA': return 'bg-green-500';
      case 'CFM': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getDaysUntil = (dateString: string) => {
    const today = new Date();
    const targetDate = new Date(dateString);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <NeonGradientCard>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-blue-400" />
          Calendário Regulatório
        </h2>
        <div className="flex space-x-2">
          <CosmicGlowButton variant="primary" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Ver Calendário
          </CosmicGlowButton>
          <CosmicGlowButton variant="secondary" size="sm">
            <Bell className="h-4 w-4" />
          </CosmicGlowButton>
        </div>
      </div>

      <div className="space-y-3">
        {upcomingDeadlines.map((deadline, index) => {
          const daysUntil = getDaysUntil(deadline.date);
          return (
            <div
              key={index}
              className={`p-4 border-l-4 rounded-r-lg ${getTypeColor(deadline.type)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div>
                    <h3 className="font-semibold text-white text-sm">{deadline.title}</h3>
                    <p className="text-slate-300 text-xs">
                      {new Date(deadline.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <Badge className={`${getCategoryColor(deadline.category)} text-white text-xs`}>
                    {deadline.category}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${daysUntil <= 7 ? 'text-red-400' : daysUntil <= 30 ? 'text-yellow-400' : 'text-green-400'}`}>
                    {daysUntil < 0 ? 'Vencido' : daysUntil === 0 ? 'Hoje' : `${daysUntil} dias`}
                  </div>
                  <p className="text-slate-400 text-xs">
                    {daysUntil < 0 ? 'Ação urgente' : daysUntil <= 7 ? 'Urgente' : 'No prazo'}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </NeonGradientCard>
  );
}// Main Compliance Dashboard Page
export default function ComplianceAutomationPage() {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  const overallComplianceScore = Math.round(
    complianceMetrics.reduce((acc, metric) => acc + metric.score, 0) / complianceMetrics.length
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto space-y-8 p-6">
        {/* Header with accessibility attributes */}
        <header className="flex items-center justify-between" role="banner">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Central de Compliance Regulatório
            </h1>
            <p className="text-slate-300">
              Monitoramento em tempo real - LGPD, ANVISA e CFM
            </p>
            <p className="text-slate-400 text-sm mt-1">
              Última atualização: {lastUpdated.toLocaleString('pt-BR')}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
              overallComplianceScore >= 90 ? 'bg-green-500/20 text-green-400' :
              overallComplianceScore >= 80 ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              <span className="text-sm font-medium">Compliance:</span>
              <span className="text-lg font-bold">{overallComplianceScore}%</span>
            </div>
            <CosmicGlowButton
              variant="secondary"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Atualizando...' : 'Atualizar'}
            </CosmicGlowButton>
            <CosmicGlowButton variant="primary" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Relatório Completo
            </CosmicGlowButton>
          </div>
        </header>

        {/* Main Content with semantic structure */}
        <main role="main">
          {/* Compliance Overview */}
          <section aria-labelledby="overview-heading" className="mb-8">
            <h2 id="overview-heading" className="sr-only">Visão Geral de Compliance</h2>
            <ComplianceOverview />
          </section>

          {/* Critical Alerts */}
          <section aria-labelledby="alerts-heading" className="mb-8">
            <h2 id="alerts-heading" className="sr-only">Alertas Críticos e Importantes</h2>
            <CriticalAlerts />
          </section>

          {/* Compliance Modules Grid */}
          <section aria-labelledby="modules-heading" className="mb-8">
            <h2 id="modules-heading" className="sr-only">Módulos de Compliance Regulatório</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div role="region" aria-labelledby="lgpd-heading">
                <h3 id="lgpd-heading" className="sr-only">Módulo LGPD</h3>
                <LGPDComplianceModule />
              </div>
              <div role="region" aria-labelledby="anvisa-heading">
                <h3 id="anvisa-heading" className="sr-only">Módulo ANVISA</h3>
                <ANVISAComplianceModule />
              </div>
              <div role="region" aria-labelledby="cfm-heading">
                <h3 id="cfm-heading" className="sr-only">Módulo CFM</h3>
                <CFMComplianceModule />
              </div>
            </div>
          </section>

          {/* Action Items and Calendar */}
          <section aria-labelledby="actions-calendar-heading" className="mb-8">
            <h2 id="actions-calendar-heading" className="sr-only">Ações e Calendário Regulatório</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div role="region" aria-labelledby="actions-heading">
                <h3 id="actions-heading" className="sr-only">Itens de Ação Prioritários</h3>
                <ActionItemsSection />
              </div>
              <div role="region" aria-labelledby="calendar-heading">
                <h3 id="calendar-heading" className="sr-only">Calendário Regulatório</h3>
                <RegulatoryCalendar />
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section aria-labelledby="quick-actions-heading" className="mb-8">
            <h2 id="quick-actions-heading" className="sr-only">Ações Rápidas</h2>
            <NeonGradientCard>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-yellow-400" />
                  Ações Rápidas de Compliance
                </h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <CosmicGlowButton 
                  variant="primary" 
                  className="flex flex-col items-center justify-center p-6 h-auto"
                  aria-label="Gerar relatório LGPD"
                >
                  <Shield className="h-8 w-8 mb-2" />
                  <span className="text-sm font-medium">Relatório LGPD</span>
                </CosmicGlowButton>
                <CosmicGlowButton 
                  variant="success" 
                  className="flex flex-col items-center justify-center p-6 h-auto"
                  aria-label="Verificar licenças ANVISA"
                >
                  <Heart className="h-8 w-8 mb-2" />
                  <span className="text-sm font-medium">Licenças ANVISA</span>
                </CosmicGlowButton>
                <CosmicGlowButton 
                  variant="secondary" 
                  className="flex flex-col items-center justify-center p-6 h-auto"
                  aria-label="Monitorar equipe médica CFM"
                >
                  <Users className="h-8 w-8 mb-2" />
                  <span className="text-sm font-medium">Equipe CFM</span>
                </CosmicGlowButton>
                <CosmicGlowButton 
                  variant="warning" 
                  className="flex flex-col items-center justify-center p-6 h-auto"
                  aria-label="Agendar auditoria"
                >
                  <Calendar className="h-8 w-8 mb-2" />
                  <span className="text-sm font-medium">Agendar Auditoria</span>
                </CosmicGlowButton>
              </div>
            </NeonGradientCard>
          </section>

          {/* System Status Footer */}
          <section aria-labelledby="system-status-heading">
            <h2 id="system-status-heading" className="sr-only">Status do Sistema de Compliance</h2>
            <NeonGradientCard>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-white font-medium">Sistema Online</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-blue-400" />
                    <span className="text-slate-300">Monitoramento Ativo</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-green-400" />
                    <span className="text-slate-300">Backups Sincronizados</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-slate-300 text-sm">
                    NeonPro Healthcare Compliance System v2.1
                  </p>
                  <p className="text-slate-400 text-xs">
                    Certificado para regulamentações brasileiras de saúde
                  </p>
                </div>
              </div>
            </NeonGradientCard>
          </section>
        </main>

        {/* Accessibility Live Region for Updates */}
        <div
          role="status"
          aria-live="polite"
          aria-label="Atualizações de compliance"
          className="sr-only"
        >
          {isRefreshing && "Atualizando dados de compliance..."}
        </div>
      </div>
    </div>
  );
}
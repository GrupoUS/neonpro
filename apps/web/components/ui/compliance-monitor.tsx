"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Eye, 
  FileText, 
  Clock, 
  CheckCircle2,
  XCircle,
  RefreshCw,
  Download,
  Users,
  Database,
  Lock
} from 'lucide-react';

export interface ComplianceItem {
  id: string;
  category: 'lgpd' | 'anvisa' | 'cfm' | 'data_protection';
  title: string;
  description: string;
  status: 'compliant' | 'warning' | 'violation' | 'pending';
  priority: 'high' | 'medium' | 'low';
  lastChecked: Date;
  nextReview: Date;
  affectedRecords?: number;
  actions?: string[];
}

export interface DataProcessingActivity {
  id: string;
  activity: string;
  personalData: string[];
  legalBasis: string;
  recipients: string[];
  retentionPeriod: string;
  lastAudit: Date;
  status: 'active' | 'suspended' | 'under_review';
}

export interface ComplianceMonitorProps {
  userRole: 'Admin' | 'Professional' | 'Assistant' | 'Coordinator';
  onExportReport?: () => void;
  onRefreshData?: () => void;
  onViewDetails?: (itemId: string) => void;
  className?: string;
}

export function ComplianceMonitor({
  userRole,
  onExportReport,
  onRefreshData,
  onViewDetails,
  className
}: ComplianceMonitorProps) {
  const [complianceItems, setComplianceItems] = useState&lt;ComplianceItem[]&gt;([]);
  const [dataActivities, setDataActivities] = useState&lt;DataProcessingActivity[]&gt;([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Generate compliance monitoring data
  const generateComplianceData = useMemo((): ComplianceItem[] => [
    {
      id: 'lgpd-consent',
      category: 'lgpd',
      title: 'Consentimentos LGPD',
      description: 'Verificação de consentimentos válidos para tratamento de dados pessoais',
      status: 'compliant',
      priority: 'high',
      lastChecked: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h ago
      nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h from now
      affectedRecords: 1247,
      actions: ['Monitoramento contínuo', 'Renovação automática em 6 meses']
    },
    {
      id: 'data-retention',
      category: 'lgpd',
      title: 'Política de Retenção',
      description: 'Conformidade com prazos de retenção de dados pessoais',
      status: 'warning',
      priority: 'medium',
      lastChecked: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6h ago
      nextReview: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48h from now
      affectedRecords: 89,
      actions: ['Revisar 89 registros vencidos', 'Implementar exclusão automática']
    },
    {
      id: 'patient-rights',
      category: 'lgpd',
      title: 'Direitos dos Titulares',
      description: 'Gestão de solicitações de acesso, correção e exclusão',
      status: 'compliant',
      priority: 'high',
      lastChecked: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1h ago
      nextReview: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12h from now
      affectedRecords: 15,
      actions: ['3 solicitações pendentes (dentro do prazo)']
    },
    {
      id: 'anvisa-adverse',
      category: 'anvisa',
      title: 'Eventos Adversos',
      description: 'Notificação obrigatória de eventos adversos à ANVISA',
      status: 'compliant',
      priority: 'high',
      lastChecked: new Date(Date.now() - 30 * 60 * 1000), // 30min ago
      nextReview: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8h from now
      affectedRecords: 2,
      actions: ['Todos os eventos notificados dentro do prazo']
    },
    {
      id: 'cfm-ethics',
      category: 'cfm',
      title: 'Ética Médica',
      description: 'Conformidade com código de ética médica do CFM',
      status: 'compliant',
      priority: 'medium',
      lastChecked: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4h ago
      nextReview: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      actions: ['Revisão mensal do comitê de ética']
    },
    {
      id: 'data-security',
      category: 'data_protection',
      title: 'Segurança dos Dados',
      description: 'Medidas técnicas e organizacionais de proteção',
      status: 'warning',
      priority: 'high',
      lastChecked: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8h ago
      nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h from now
      actions: ['Atualizar certificados SSL vencidos', 'Implementar 2FA para todos os usuários']
    }
  ], []);

  const generateDataActivities = useMemo((): DataProcessingActivity[] => [
    {
      id: 'patient-records',
      activity: 'Prontuários Eletrônicos',
      personalData: ['Nome', 'CPF', 'Dados de saúde', 'Histórico médico'],
      legalBasis: 'Cuidados de saúde (Art. 11, II, LGPD)',
      recipients: ['Equipe médica', 'Laboratórios conveniados'],
      retentionPeriod: '20 anos após último atendimento',
      lastAudit: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      status: 'active'
    },
    {
      id: 'appointment-scheduling',
      activity: 'Agendamento de Consultas',
      personalData: ['Nome', 'Telefone', 'E-mail'],
      legalBasis: 'Execução de contrato (Art. 7, V, LGPD)',
      recipients: ['Recepcionistas', 'Sistema de confirmação'],
      retentionPeriod: '5 anos após cancelamento',
      lastAudit: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      status: 'active'
    },
    {
      id: 'marketing-communications',
      activity: 'Comunicações de Marketing',
      personalData: ['Nome', 'E-mail', 'Histórico de procedimentos'],
      legalBasis: 'Consentimento (Art. 7, I, LGPD)',
      recipients: ['Equipe de marketing'],
      retentionPeriod: 'Até revogação do consentimento',
      lastAudit: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
      status: 'under_review'
    }
  ], []);

  useEffect(() => {
    setComplianceItems(generateComplianceData);
    setDataActivities(generateDataActivities);
  }, [generateComplianceData, generateDataActivities]);

  const handleRefresh = async () => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setComplianceItems(generateComplianceData);
    setDataActivities(generateDataActivities);
    setLastUpdated(new Date());
    setIsLoading(false);
    
    onRefreshData?.();
  };

  // Calculate compliance statistics
  const complianceStats = useMemo(() => {
    const total = complianceItems.length;
    const compliant = complianceItems.filter(item => item.status === 'compliant').length;
    const warnings = complianceItems.filter(item => item.status === 'warning').length;
    const violations = complianceItems.filter(item => item.status === 'violation').length;
    const pending = complianceItems.filter(item => item.status === 'pending').length;
    
    return {
      total,
      compliant,
      warnings,
      violations,
      pending,
      complianceScore: total > 0 ? Math.round((compliant / total) * 100) : 0
    };
  }, [complianceItems]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return CheckCircle2;
      case 'warning': return AlertTriangle;
      case 'violation': return XCircle;
      case 'pending': return Clock;
      default: return Shield;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'violation': return 'text-red-600 bg-red-50 border-red-200';
      case 'pending': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'lgpd': return Shield;
      case 'anvisa': return FileText;
      case 'cfm': return Users;
      case 'data_protection': return Lock;
      default: return Shield;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Filter items based on user role
  const visibleItems = useMemo(() => {
    if (userRole === 'Admin') return complianceItems;
    
    // Professionals see medical compliance items
    if (userRole === 'Professional') {
      return complianceItems.filter(item => 
        item.category === 'anvisa' || 
        item.category === 'cfm' || 
        (item.category === 'lgpd' && item.title.includes('Consentimentos'))
      );
    }
    
    // Assistants see basic compliance status
    return complianceItems.filter(item => 
      item.status === 'violation' || item.status === 'warning'
    );
  }, [complianceItems, userRole]);

  return (
    &lt;Card className={cn('w-full', className)}&gt;
      &lt;CardHeader className="pb-4"&gt;
        &lt;div className="flex items-center justify-between"&gt;
          &lt;CardTitle className="flex items-center gap-2"&gt;
            &lt;Shield className="h-5 w-5 text-green-600" /&gt;
            Monitor de Compliance - LGPD/ANVISA/CFM
          &lt;/CardTitle&gt;
          
          &lt;div className="flex items-center gap-2"&gt;
            &lt;Badge variant="outline" className="text-xs"&gt;
              Última verificação: {lastUpdated.toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            &lt;/Badge&gt;
            
            &lt;Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            &gt;
              &lt;RefreshCw className={cn('h-4 w-4 mr-2', isLoading && 'animate-spin')} /&gt;
              Verificar
            &lt;/Button&gt;
            
            {userRole === 'Admin' && (
              &lt;Button 
                variant="outline" 
                size="sm"
                onClick={onExportReport}
              &gt;
                &lt;Download className="h-4 w-4 mr-2" /&gt;
                Relatório
              &lt;/Button&gt;
            )}
          &lt;/div&gt;
        &lt;/div&gt;

        {/* Compliance Score Overview */}
        &lt;div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4"&gt;
          &lt;Card className="p-4 bg-green-50 border-green-200"&gt;
            &lt;div className="flex items-center justify-between"&gt;
              &lt;div&gt;
                &lt;p className="text-sm text-green-600 font-medium"&gt;Score de Compliance&lt;/p&gt;
                &lt;p className="text-3xl font-bold text-green-900"&gt;
                  {complianceStats.complianceScore}%
                &lt;/p&gt;
              &lt;/div&gt;
              &lt;ShieldCheck className="h-10 w-10 text-green-600" /&gt;
            &lt;/div&gt;
            &lt;Progress 
              value={complianceStats.complianceScore} 
              className="mt-2 h-2"
            /&gt;
          &lt;/Card&gt;

          &lt;Card className="p-4 border-green-200"&gt;
            &lt;div className="flex items-center justify-between"&gt;
              &lt;div&gt;
                &lt;p className="text-sm text-gray-600 font-medium"&gt;Conformes&lt;/p&gt;
                &lt;p className="text-2xl font-bold text-green-700"&gt;
                  {complianceStats.compliant}
                &lt;/p&gt;
              &lt;/div&gt;
              &lt;CheckCircle2 className="h-8 w-8 text-green-600" /&gt;
            &lt;/div&gt;
          &lt;/Card&gt;

          &lt;Card className="p-4 border-yellow-200"&gt;
            &lt;div className="flex items-center justify-between"&gt;
              &lt;div&gt;
                &lt;p className="text-sm text-gray-600 font-medium"&gt;Avisos&lt;/p&gt;
                &lt;p className="text-2xl font-bold text-yellow-700"&gt;
                  {complianceStats.warnings}
                &lt;/p&gt;
              &lt;/div&gt;
              &lt;AlertTriangle className="h-8 w-8 text-yellow-600" /&gt;
            &lt;/div&gt;
          &lt;/Card&gt;

          &lt;Card className="p-4 border-red-200"&gt;
            &lt;div className="flex items-center justify-between"&gt;
              &lt;div&gt;
                &lt;p className="text-sm text-gray-600 font-medium"&gt;Violações&lt;/p&gt;
                &lt;p className="text-2xl font-bold text-red-700"&gt;
                  {complianceStats.violations}
                &lt;/p&gt;
              &lt;/div&gt;
              &lt;ShieldAlert className="h-8 w-8 text-red-600" /&gt;
            &lt;/div&gt;
          &lt;/Card&gt;
        &lt;/div&gt;
      &lt;/CardHeader&gt;

      &lt;CardContent className="space-y-6"&gt;
        {/* Critical Alerts */}
        {complianceStats.violations > 0 && (
          &lt;Alert className="border-red-200 bg-red-50"&gt;
            &lt;ShieldAlert className="h-4 w-4 text-red-600" /&gt;
            &lt;AlertTitle className="text-red-800"&gt;
              Ação Imediata Necessária
            &lt;/AlertTitle&gt;
            &lt;AlertDescription className="text-red-700"&gt;
              {complianceStats.violations} violação(ões) de compliance detectada(s). 
              Resolução imediata é obrigatória para evitar sanções regulatórias.
            &lt;/AlertDescription&gt;
          &lt;/Alert&gt;
        )}

        {/* Compliance Items */}
        &lt;div className="space-y-4"&gt;
          &lt;h3 className="text-lg font-medium"&gt;Itens de Compliance&lt;/h3&gt;
          
          &lt;div className="grid gap-4"&gt;
            {visibleItems.map((item) =&gt; {
              const StatusIcon = getStatusIcon(item.status);
              const CategoryIcon = getCategoryIcon(item.category);
              
              return (
                &lt;Card 
                  key={item.id}
                  className={cn(
                    'p-4 transition-all hover:shadow-md',
                    getStatusColor(item.status)
                  )}
                &gt;
                  &lt;div className="space-y-3"&gt;
                    {/* Header */}
                    &lt;div className="flex items-center justify-between"&gt;
                      &lt;div className="flex items-center gap-3"&gt;
                        &lt;div className="p-2 rounded-lg bg-white/60 border"&gt;
                          &lt;CategoryIcon className="h-4 w-4" /&gt;
                        &lt;/div&gt;
                        &lt;div&gt;
                          &lt;h4 className="font-medium"&gt;{item.title}&lt;/h4&gt;
                          &lt;p className="text-sm opacity-80 capitalize"&gt;
                            {item.category.replace('_', ' ')}
                          &lt;/p&gt;
                        &lt;/div&gt;
                      &lt;/div&gt;
                      
                      &lt;div className="flex items-center gap-2"&gt;
                        &lt;Badge 
                          variant="outline" 
                          className={cn('text-xs', getPriorityColor(item.priority))}
                        &gt;
                          {item.priority === 'high' ? 'Alta' :
                           item.priority === 'medium' ? 'Média' : 'Baixa'}
                        &lt;/Badge&gt;
                        
                        &lt;StatusIcon className="h-5 w-5" /&gt;
                      &lt;/div&gt;
                    &lt;/div&gt;

                    {/* Description */}
                    &lt;p className="text-sm opacity-90"&gt;{item.description}&lt;/p&gt;

                    {/* Details */}
                    &lt;div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs"&gt;
                      &lt;div&gt;
                        &lt;p className="font-medium opacity-80"&gt;Última Verificação&lt;/p&gt;
                        &lt;p&gt;{item.lastChecked.toLocaleDateString('pt-BR')}&lt;/p&gt;
                      &lt;/div&gt;
                      &lt;div&gt;
                        &lt;p className="font-medium opacity-80"&gt;Próxima Revisão&lt;/p&gt;
                        &lt;p&gt;{item.nextReview.toLocaleDateString('pt-BR')}&lt;/p&gt;
                      &lt;/div&gt;
                      {item.affectedRecords && (
                        &lt;div&gt;
                          &lt;p className="font-medium opacity-80"&gt;Registros Afetados&lt;/p&gt;
                          &lt;p&gt;{item.affectedRecords.toLocaleString('pt-BR')}&lt;/p&gt;
                        &lt;/div&gt;
                      )}
                    &lt;/div&gt;

                    {/* Actions */}
                    {item.actions && item.actions.length > 0 && (
                      &lt;div className="pt-2 border-t border-current/20"&gt;
                        &lt;p className="text-xs font-medium mb-2"&gt;Ações Necessárias:&lt;/p&gt;
                        &lt;ul className="text-xs space-y-1"&gt;
                          {item.actions.map((action, index) =&gt; (
                            &lt;li key={index} className="flex items-start gap-2"&gt;
                              &lt;span className="text-current/60"&gt;•&lt;/span&gt;
                              &lt;span&gt;{action}&lt;/span&gt;
                            &lt;/li&gt;
                          ))}
                        &lt;/ul&gt;
                      &lt;/div&gt;
                    )}

                    {/* View Details Button */}
                    &lt;div className="pt-2"&gt;
                      &lt;Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() =&gt; onViewDetails?.(item.id)}
                        className="h-8 px-3 bg-white/20 hover:bg-white/30"
                      &gt;
                        &lt;Eye className="h-3 w-3 mr-2" /&gt;
                        Ver Detalhes
                      &lt;/Button&gt;
                    &lt;/div&gt;
                  &lt;/div&gt;
                &lt;/Card&gt;
              );
            })}
          &lt;/div&gt;
        &lt;/div&gt;

        {/* Data Processing Activities (Admin only) */}
        {userRole === 'Admin' && (
          &lt;div className="space-y-4"&gt;
            &lt;h3 className="text-lg font-medium flex items-center gap-2"&gt;
              &lt;Database className="h-5 w-5" /&gt;
              Atividades de Tratamento de Dados
            &lt;/h3&gt;
            
            &lt;div className="grid gap-3"&gt;
              {dataActivities.map((activity) =&gt; (
                &lt;Card key={activity.id} className="p-4"&gt;
                  &lt;div className="space-y-3"&gt;
                    &lt;div className="flex items-center justify-between"&gt;
                      &lt;h4 className="font-medium"&gt;{activity.activity}&lt;/h4&gt;
                      &lt;Badge 
                        variant={activity.status === 'active' ? 'default' : 'secondary'}
                      &gt;
                        {activity.status === 'active' ? 'Ativa' :
                         activity.status === 'suspended' ? 'Suspensa' : 'Em Revisão'}
                      &lt;/Badge&gt;
                    &lt;/div&gt;
                    
                    &lt;div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm"&gt;
                      &lt;div&gt;
                        &lt;p className="font-medium text-gray-700"&gt;Base Legal:&lt;/p&gt;
                        &lt;p className="text-gray-600"&gt;{activity.legalBasis}&lt;/p&gt;
                      &lt;/div&gt;
                      &lt;div&gt;
                        &lt;p className="font-medium text-gray-700"&gt;Retenção:&lt;/p&gt;
                        &lt;p className="text-gray-600"&gt;{activity.retentionPeriod}&lt;/p&gt;
                      &lt;/div&gt;
                      &lt;div&gt;
                        &lt;p className="font-medium text-gray-700"&gt;Dados Tratados:&lt;/p&gt;
                        &lt;p className="text-gray-600"&gt;{activity.personalData.join(', ')}&lt;/p&gt;
                      &lt;/div&gt;
                      &lt;div&gt;
                        &lt;p className="font-medium text-gray-700"&gt;Última Auditoria:&lt;/p&gt;
                        &lt;p className="text-gray-600"&gt;
                          {activity.lastAudit.toLocaleDateString('pt-BR')}
                        &lt;/p&gt;
                      &lt;/div&gt;
                    &lt;/div&gt;
                  &lt;/div&gt;
                &lt;/Card&gt;
              ))}
            &lt;/div&gt;
          &lt;/div&gt;
        )}

        {/* Footer */}
        &lt;div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm"&gt;
          &lt;div className="flex items-start gap-2 text-blue-800"&gt;
            &lt;Shield className="h-4 w-4 mt-0.5" /&gt;
            &lt;div&gt;
              &lt;p className="font-medium"&gt;Conformidade Regulatória:&lt;/p&gt;
              &lt;p className="mt-1 text-blue-700"&gt;
                Este sistema monitora automaticamente a conformidade com LGPD (Lei Geral de Proteção de Dados), 
                normas da ANVISA (Agência Nacional de Vigilância Sanitária) e diretrizes do CFM (Conselho Federal de Medicina). 
                Relatórios detalhados estão disponíveis para auditoria.
              &lt;/p&gt;
            &lt;/div&gt;
          &lt;/div&gt;
        &lt;/div&gt;
      &lt;/CardContent&gt;
    &lt;/Card&gt;
  );
}
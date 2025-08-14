// 🔍 Patient Data Processing Transparency Dashboard Component
// NeonPro - Sistema de Automação de Compliance LGPD - Phase 3 Task 3.2
// Quality Standard: ≥9.5/10 (BMad Enhanced)

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  Eye, 
  Share2, 
  FileText, 
  Calendar, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Settings,
  Info,
  ExternalLink,
  Lock,
  Globe,
  User,
  Database,
  Activity,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProcessingActivity {
  purpose: string;
  description: string;
  legalBasis: string;
  dataCategories: string[];
  frequency: string;
  lastActivity: Date;
  canOptOut: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  complianceScore: number;
}

interface ThirdPartySharing {
  recipient: string;
  recipientType: string;
  purpose: string;
  dataShared: string[];
  safeguards: string[];
  location: string;
  canOptOut: boolean;
  sharingDate: Date;
  status: 'active' | 'suspended' | 'terminated';
}

interface DataFlow {
  system: string;
  purpose: string;
  dataTypes: string[];
  frequency: string;
  encryption: boolean;
  lastAccess: Date;
}

interface PatientRights {
  access: { available: boolean; lastUsed?: Date; description: string };
  correction: { available: boolean; lastUsed?: Date; description: string };
  deletion: { available: boolean; lastUsed?: Date; description: string };
  portability: { available: boolean; lastUsed?: Date; description: string };
  objection: { available: boolean; lastUsed?: Date; description: string };
}

interface TransparencyDashboardData {
  patientId: string;
  patientName: string;
  lastUpdated: Date;
  overallTransparencyScore: number;
  processingActivities: ProcessingActivity[];
  thirdPartySharing: ThirdPartySharing[];
  dataFlows: {
    internal: DataFlow[];
    external: DataFlow[];
  };
  rights: PatientRights;
  recentActivities: Array<{
    timestamp: Date;
    action: string;
    description: string;
    complianceStatus: 'compliant' | 'warning' | 'violation';
  }>;
  privacySettings: {
    marketingConsent: boolean;
    analyticsConsent: boolean;
    thirdPartySharing: boolean;
    researchParticipation: boolean;
  };
}

interface PatientDataProcessingTransparencyDashboardProps {
  patientId: string;
  viewMode: 'patient' | 'admin';
  className?: string;
}

export default function PatientDataProcessingTransparencyDashboard({
  patientId,
  viewMode = 'patient',
  className = ''
}: PatientDataProcessingTransparencyDashboardProps) {
  const [dashboardData, setDashboardData] = useState<TransparencyDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);

  // Load dashboard data
  useEffect(() => {
    loadTransparencyData();
  }, [patientId]);

  const loadTransparencyData = async () => {
    try {
      setLoading(true);
      
      // In production, this would call the data processing transparency manager
      const mockData: TransparencyDashboardData = {
        patientId,
        patientName: 'Maria Silva Santos',
        lastUpdated: new Date(),
        overallTransparencyScore: 9.2,
        processingActivities: [
          {
            purpose: 'medical_care',
            description: 'Cuidados médicos e procedimentos estéticos',
            legalBasis: 'Interesses vitais - Cuidados de saúde',
            dataCategories: ['dados pessoais', 'dados médicos', 'dados sensíveis'],
            frequency: 'Conforme necessário',
            lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            canOptOut: false,
            riskLevel: 'low',
            complianceScore: 9.5
          },
          {
            purpose: 'appointment_scheduling',
            description: 'Agendamento e gestão de consultas',
            legalBasis: 'Execução de contrato',
            dataCategories: ['dados pessoais', 'dados de contato'],
            frequency: 'Semanal',
            lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            canOptOut: false,
            riskLevel: 'low',
            complianceScore: 9.8
          },
          {
            purpose: 'marketing',
            description: 'Comunicações promocionais personalizadas',
            legalBasis: 'Consentimento',
            dataCategories: ['dados pessoais', 'preferências'],
            frequency: 'Mensal',
            lastActivity: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            canOptOut: true,
            riskLevel: 'medium',
            complianceScore: 8.5
          }
        ],
        thirdPartySharing: [
          {
            recipient: 'Laboratório Alpha',
            recipientType: 'processor',
            purpose: 'Análises clínicas e exames',
            dataShared: ['dados pessoais', 'resultados de exames'],
            safeguards: ['Contrato de processamento', 'Criptografia', 'Acesso restrito'],
            location: 'Brasil',
            canOptOut: false,
            sharingDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            status: 'active'
          },
          {
            recipient: 'Plano de Saúde Beta',
            recipientType: 'controller',
            purpose: 'Autorização e reembolso de procedimentos',
            dataShared: ['dados pessoais', 'dados financeiros', 'relatórios médicos'],
            safeguards: ['Acordo de confidencialidade', 'Portal seguro', 'Auditoria regular'],
            location: 'Brasil',
            canOptOut: false,
            sharingDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            status: 'active'
          }
        ],
        dataFlows: {
          internal: [
            {
              system: 'Sistema de Prontuário Eletrônico',
              purpose: 'Gestão de histórico médico',
              dataTypes: ['dados médicos', 'resultados de exames', 'prescrições'],
              frequency: 'Diário',
              encryption: true,
              lastAccess: new Date(Date.now() - 1 * 60 * 60 * 1000)
            },
            {
              system: 'Sistema de Agendamento',
              purpose: 'Gestão de consultas',
              dataTypes: ['dados pessoais', 'dados de contato', 'preferências'],
              frequency: 'Conforme necessário',
              encryption: true,
              lastAccess: new Date(Date.now() - 3 * 60 * 60 * 1000)
            }
          ],
          external: [
            {
              system: 'Gateway de Pagamento',
              purpose: 'Processamento de pagamentos',
              dataTypes: ['dados financeiros', 'dados de transação'],
              frequency: 'Por transação',
              encryption: true,
              lastAccess: new Date(Date.now() - 24 * 60 * 60 * 1000)
            }
          ]
        },
        rights: {
          access: { 
            available: true, 
            lastUsed: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            description: 'Solicitar cópia de todos os seus dados pessoais'
          },
          correction: { 
            available: true,
            description: 'Corrigir ou atualizar dados pessoais incorretos'
          },
          deletion: { 
            available: true,
            description: 'Solicitar exclusão de dados pessoais (sujeito a restrições legais)'
          },
          portability: { 
            available: true,
            description: 'Receber seus dados em formato estruturado'
          },
          objection: { 
            available: true,
            description: 'Contestar o processamento de dados para marketing'
          }
        },
        recentActivities: [
          {
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            action: 'data_access',
            description: 'Acesso ao prontuário médico para consulta',
            complianceStatus: 'compliant'
          },
          {
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            action: 'appointment_update',
            description: 'Atualização de dados de agendamento',
            complianceStatus: 'compliant'
          },
          {
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            action: 'consent_renewal',
            description: 'Renovação de consentimento para marketing',
            complianceStatus: 'compliant'
          }
        ],
        privacySettings: {
          marketingConsent: true,
          analyticsConsent: false,
          thirdPartySharing: true,
          researchParticipation: false
        }
      };

      setDashboardData(mockData);
    } catch (error) {
      console.error('Error loading transparency data:', error);
      toast.error('Erro ao carregar dados de transparência');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadTransparencyData();
    setRefreshing(false);
    toast.success('Dados atualizados com sucesso');
  };

  const handleRightExercise = async (rightType: string) => {
    try {
      // In production, this would call the privacy rights manager
      toast.success(`Solicitação de ${rightType} enviada com sucesso`);
    } catch (error) {
      toast.error('Erro ao processar solicitação');
    }
  };

  const exportTransparencyReport = async () => {
    try {
      // In production, this would generate a comprehensive transparency report
      toast.success('Relatório de transparência gerado com sucesso');
    } catch (error) {
      toast.error('Erro ao gerar relatório');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 9) return 'text-green-600';
    if (score >= 7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 9) return 'default';
    if (score >= 7) return 'secondary';
    return 'destructive';
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getComplianceStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'violation':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Não foi possível carregar os dados de transparência. Tente novamente.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Overall Score */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Eye className="h-6 w-6" />
            Transparência de Dados
            {viewMode === 'admin' && (
              <Badge variant="outline">Visão Administrativa</Badge>
            )}
          </h2>
          <p className="text-sm text-muted-foreground">
            Última atualização: {format(dashboardData.lastUpdated, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm font-medium">Score de Transparência</div>
            <div className={`text-2xl font-bold ${getScoreColor(dashboardData.overallTransparencyScore)}`}>
              {dashboardData.overallTransparencyScore}/10
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={refreshing}
            >
              {refreshing ? <Clock className="h-4 w-4" /> : <Activity className="h-4 w-4" />}
              Atualizar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportTransparencyReport}
            >
              <Download className="h-4 w-4" />
              Exportar Relatório
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="processing">Processamento</TabsTrigger>
          <TabsTrigger value="sharing">Compartilhamento</TabsTrigger>
          <TabsTrigger value="rights">Direitos</TabsTrigger>
          <TabsTrigger value="activities">Atividades</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Atividades de Processamento
                </CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.processingActivities.length}</div>
                <p className="text-xs text-muted-foreground">
                  ativas no sistema
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Compartilhamentos Externos
                </CardTitle>
                <Share2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.thirdPartySharing.length}</div>
                <p className="text-xs text-muted-foreground">
                  parceiros ativos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Fluxos de Dados
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData.dataFlows.internal.length + dashboardData.dataFlows.external.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  sistemas integrados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Compliance Score
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getScoreColor(dashboardData.overallTransparencyScore)}`}>
                  {dashboardData.overallTransparencyScore}/10
                </div>
                <p className="text-xs text-muted-foreground">
                  transparência geral
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activities Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Atividades Recentes
              </CardTitle>
              <CardDescription>
                Últimas ações relacionadas aos seus dados pessoais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.recentActivities.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getComplianceStatusIcon(activity.complianceStatus)}
                      <div>
                        <div className="font-medium">{activity.description}</div>
                        <div className="text-sm text-muted-foreground">
                          {format(activity.timestamp, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </div>
                      </div>
                    </div>
                    <Badge variant={activity.complianceStatus === 'compliant' ? 'default' : 'secondary'}>
                      {activity.complianceStatus === 'compliant' ? 'Conforme' : 'Atenção'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Processing Activities Tab */}
        <TabsContent value="processing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Atividades de Processamento de Dados
              </CardTitle>
              <CardDescription>
                Finalidades e bases legais para o processamento dos seus dados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.processingActivities.map((activity, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">{activity.description}</h4>
                        <p className="text-sm text-muted-foreground">
                          Base legal: {activity.legalBasis}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={getScoreBadgeVariant(activity.complianceScore)}
                          className={getRiskLevelColor(activity.riskLevel)}
                        >
                          {activity.riskLevel === 'low' ? 'Baixo Risco' : 
                           activity.riskLevel === 'medium' ? 'Médio Risco' : 'Alto Risco'}
                        </Badge>
                        <Badge variant="outline">
                          Score: {activity.complianceScore}/10
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Categorias de dados:</span>
                        <div className="text-muted-foreground">
                          {activity.dataCategories.join(', ')}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Frequência:</span>
                        <div className="text-muted-foreground">
                          {activity.frequency}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Última atividade:</span>
                        <div className="text-muted-foreground">
                          {format(activity.lastActivity, "dd/MM/yyyy", { locale: ptBR })}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Pode recusar:</span>
                        <Badge variant={activity.canOptOut ? 'default' : 'secondary'}>
                          {activity.canOptOut ? 'Sim' : 'Não'}
                        </Badge>
                      </div>
                    </div>

                    {activity.canOptOut && (
                      <div className="pt-2 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRightExercise('objection')}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Gerenciar Consentimento
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Third-Party Sharing Tab */}
        <TabsContent value="sharing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Compartilhamento com Terceiros
              </CardTitle>
              <CardDescription>
                Parceiros e prestadores de serviços que têm acesso aos seus dados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.thirdPartySharing.map((sharing, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium flex items-center gap-2">
                          {sharing.recipient}
                          <Globe className="h-4 w-4 text-muted-foreground" />
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {sharing.purpose}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={sharing.status === 'active' ? 'default' : 'secondary'}>
                          {sharing.status === 'active' ? 'Ativo' : 'Inativo'}
                        </Badge>
                        <Badge variant="outline">
                          {sharing.recipientType === 'processor' ? 'Processador' : 'Controlador'}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Dados compartilhados:</span>
                        <div className="text-muted-foreground">
                          {sharing.dataShared.join(', ')}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Localização:</span>
                        <div className="text-muted-foreground">
                          {sharing.location}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Data do compartilhamento:</span>
                        <div className="text-muted-foreground">
                          {format(sharing.sharingDate, "dd/MM/yyyy", { locale: ptBR })}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Pode recusar:</span>
                        <Badge variant={sharing.canOptOut ? 'default' : 'secondary'}>
                          {sharing.canOptOut ? 'Sim' : 'Não'}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <span className="font-medium text-sm">Salvaguardas implementadas:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {sharing.safeguards.map((safeguard, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            <Lock className="h-3 w-3 mr-1" />
                            {safeguard}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {sharing.canOptOut && (
                      <div className="pt-2 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRightExercise('objection')}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Recusar Compartilhamento
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Patient Rights Tab */}
        <TabsContent value="rights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Seus Direitos de Privacidade
              </CardTitle>
              <CardDescription>
                Exercite seus direitos de proteção de dados pessoais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(dashboardData.rights).map(([rightKey, right]) => (
                  <div key={rightKey} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium capitalize">
                        {rightKey === 'access' ? 'Acesso aos Dados' :
                         rightKey === 'correction' ? 'Correção' :
                         rightKey === 'deletion' ? 'Exclusão' :
                         rightKey === 'portability' ? 'Portabilidade' :
                         'Objeção'}
                      </h4>
                      <Badge variant={right.available ? 'default' : 'secondary'}>
                        {right.available ? 'Disponível' : 'Indisponível'}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {right.description}
                    </p>

                    {right.lastUsed && (
                      <p className="text-xs text-muted-foreground">
                        Último uso: {format(right.lastUsed, "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    )}

                    {right.available && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRightExercise(rightKey)}
                        className="w-full"
                      >
                        <User className="h-4 w-4 mr-2" />
                        Exercer Direito
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações de Privacidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(dashboardData.privacySettings).map(([setting, enabled]) => (
                  <div key={setting} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        {setting === 'marketingConsent' ? 'Marketing e Promoções' :
                         setting === 'analyticsConsent' ? 'Análises e Estatísticas' :
                         setting === 'thirdPartySharing' ? 'Compartilhamento com Terceiros' :
                         'Participação em Pesquisas'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {setting === 'marketingConsent' ? 'Receber comunicações promocionais' :
                         setting === 'analyticsConsent' ? 'Permitir análise de uso do sistema' :
                         setting === 'thirdPartySharing' ? 'Compartilhar dados com parceiros' :
                         'Participar de estudos clínicos'}
                      </div>
                    </div>
                    <Badge variant={enabled ? 'default' : 'secondary'}>
                      {enabled ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Log de Atividades Detalhado
              </CardTitle>
              <CardDescription>
                Histórico completo de acesso e processamento dos seus dados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getComplianceStatusIcon(activity.complianceStatus)}
                      <div>
                        <div className="font-medium">{activity.description}</div>
                        <div className="text-sm text-muted-foreground">
                          {format(activity.timestamp, "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={activity.complianceStatus === 'compliant' ? 'default' : 'secondary'}>
                        {activity.complianceStatus === 'compliant' ? 'Conforme' : 'Atenção'}
                      </Badge>
                      {viewMode === 'admin' && (
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
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
}
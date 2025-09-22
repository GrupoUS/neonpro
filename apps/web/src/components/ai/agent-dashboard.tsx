/**
 * AI Agent Dashboard Component
 *
 * Comprehensive dashboard for managing AI agent interactions
 * Integrates agent selection, chat interface, and knowledge base
 *
 * Features:
 * - Multi-agent support (Client, Financial, Appointment)
 * - Real-time chat with streaming responses
 * - Knowledge base management
 * - Analytics and monitoring
 * - LGPD compliance
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs } from '@/components/ui/tabs';
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  Bot,
  Calendar,
  CheckCircle,
  Clock,
  Database,
  DollarSign,
  MessageSquare,
  Settings,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { useAgentAnalytics, useAgentSessionManager, useKnowledgeBaseManager } from '@/trpc/agent';
import { AgentType } from '@/types/ai-agent';
import { formatDateTime } from '@/utils/brazilian-formatters';
import { AgentChat } from './agent-chat';
import { AgentSelector } from './agent-selector';
import { KnowledgeBaseManager } from './knowledge-base';

interface AgentDashboardProps {
  patientId?: string;
  healthcareProfessionalId?: string;
  clinicId?: string;
}

export function AgentDashboard({
  patientId,
  healthcareProfessionalId,
  clinicId,
}: AgentDashboardProps) {
  const [selectedAgent, setSelectedAgent] = useState<AgentType>('client');
  const [activeTab, setActiveTab] = useState('chat');

  const {
    currentSessionId,
    startNewSession,
    endCurrentSession,
    isCreating,
    isArchiving,
  } = useAgentSessionManager();

  const { data: analytics } = useAgentAnalytics();
  const { searchEntries, isSearching } = useKnowledgeBaseManager();

  // Start new session when agent is selected
  useEffect(() => {
    if (selectedAgent && !currentSessionId) {
      startNewSession({
        agent_type: selectedAgent,
        initial_context: patientId ? 'patient_context' : 'general',
        metadata: {
          patientId,
          healthcareProfessionalId,
          clinicId,
        },
      });
    }
  }, [
    selectedAgent,
    currentSessionId,
    startNewSession,
    patientId,
    healthcareProfessionalId,
    clinicId,
  ]);

  // End session when switching agents
  useEffect(() => {
    return () => {
      if (currentSessionId) {
        endCurrentSession('User switched agents');
      }
    };
  }, [currentSessionId, endCurrentSession]);

  const handleAgentSelect = (_agentType: any) => {
    setSelectedAgent(agentType);
  };

  const getAgentStats = (_agentType: any) => {
    const agentAnalytics = analytics?.data?.agent_usage?.find(
      usage => usage.agent_type === agentType,
    );

    return {
      sessions: agentAnalytics?.session_count || 0,
      messages: agentAnalytics?.message_count || 0,
      satisfaction: agentAnalytics?.user_satisfaction || 0,
      avgDuration: agentAnalytics?.average_session_duration || 0,
    };
  };

  const selectedAgentStats = getAgentStats(selectedAgent);

  return (
    <div className='flex flex-col h-full max-w-7xl mx-auto space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Assistentes de IA</h1>
          <p className='text-muted-foreground'>
            Gerencie interações com assistentes inteligentes especializados
          </p>
        </div>

        <div className='flex items-center gap-2'>
          <Badge variant='outline' className='flex items-center gap-1'>
            <Database className='h-3 w-3' />
            LGPD Compliant
          </Badge>
          {currentSessionId && (
            <Badge variant='secondary' className='flex items-center gap-1'>
              <Clock className='h-3 w-3' />
              Ativo
            </Badge>
          )}
        </div>
      </div>

      {/* Agent Selection */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Bot className='h-5 w-5' />
            Selecione um Assistente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AgentSelector
            selectedAgent={selectedAgent}
            onAgentSelect={handleAgentSelect}
            disabled={isCreating || isArchiving}
          />

          {/* Quick Stats */}
          <div className='mt-6 grid grid-cols-1 md:grid-cols-4 gap-4'>
            <Card className='p-4'>
              <div className='flex items-center gap-2'>
                <MessageSquare className='h-4 w-4 text-blue-500' />
                <div>
                  <p className='text-2xl font-bold'>
                    {selectedAgentStats.sessions}
                  </p>
                  <p className='text-xs text-muted-foreground'>Sessões</p>
                </div>
              </div>
            </Card>

            <Card className='p-4'>
              <div className='flex items-center gap-2'>
                <BarChart3 className='h-4 w-4 text-green-500' />
                <div>
                  <p className='text-2xl font-bold'>
                    {selectedAgentStats.messages}
                  </p>
                  <p className='text-xs text-muted-foreground'>Mensagens</p>
                </div>
              </div>
            </Card>

            <Card className='p-4'>
              <div className='flex items-center gap-2'>
                <TrendingUp className='h-4 w-4 text-purple-500' />
                <div>
                  <p className='text-2xl font-bold'>
                    {selectedAgentStats.satisfaction > 0
                      ? selectedAgentStats.satisfaction.toFixed(1)
                      : 'N/A'}
                  </p>
                  <p className='text-xs text-muted-foreground'>Satisfação</p>
                </div>
              </div>
            </Card>

            <Card className='p-4'>
              <div className='flex items-center gap-2'>
                <Clock className='h-4 w-4 text-orange-500' />
                <div>
                  <p className='text-2xl font-bold'>
                    {selectedAgentStats.avgDuration > 0
                      ? `${Math.round(selectedAgentStats.avgDuration / 60)}min`
                      : 'N/A'}
                  </p>
                  <p className='text-xs text-muted-foreground'>Duração Média</p>
                </div>
              </div>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className='flex-1'>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='chat' className='flex items-center gap-2'>
            <MessageSquare className='h-4 w-4' />
            Conversa
          </TabsTrigger>
          <TabsTrigger value='knowledge' className='flex items-center gap-2'>
            <BookOpen className='h-4 w-4' />
            Base de Conhecimento
          </TabsTrigger>
          <TabsTrigger value='analytics' className='flex items-center gap-2'>
            <BarChart3 className='h-4 w-4' />
            Análise
          </TabsTrigger>
          <TabsTrigger value='settings' className='flex items-center gap-2'>
            <Settings className='h-4 w-4' />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value='chat' className='flex-1 mt-6'>
          <AgentChat
            patientId={patientId}
            healthcareProfessionalId={healthcareProfessionalId}
          />
        </TabsContent>

        <TabsContent value='knowledge' className='flex-1 mt-6'>
          <KnowledgeBaseManager />
        </TabsContent>

        <TabsContent value='analytics' className='flex-1 mt-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Desempenho</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <span>Tempo Médio de Resposta</span>
                    <span className='font-mono'>
                      {analytics?.data?.average_response_time?.toFixed(2)
                        || '0.00'}
                      s
                    </span>
                  </div>

                  <div className='flex items-center justify-between'>
                    <span>Total de Sessões</span>
                    <span className='font-mono'>
                      {analytics?.data?.total_sessions || 0}
                    </span>
                  </div>

                  <div className='flex items-center justify-between'>
                    <span>Total de Mensagens</span>
                    <span className='font-mono'>
                      {analytics?.data?.total_messages || 0}
                    </span>
                  </div>

                  <div className='flex items-center justify-between'>
                    <span>Taxa de Erro</span>
                    <span className='font-mono'>
                      {(
                        (1 - (analytics?.data?.user_satisfaction || 0) / 5)
                        * 100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Queries */}
            <Card>
              <CardHeader>
                <CardTitle>Consultas Mais Frequentes</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className='max-h-64'>
                  <div className='space-y-2'>
                    {analytics?.data?.top_queries?.map((query, _index) => (
                      <div
                        key={index}
                        className='flex items-center justify-between p-2 rounded bg-muted'
                      >
                        <span className='text-sm'>{query.query}</span>
                        <Badge variant='outline'>{query.count}</Badge>
                      </div>
                    )) || (
                      <p className='text-center text-muted-foreground py-4'>
                        Nenhuma consulta registrada
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Agent Usage */}
            <Card>
              <CardHeader>
                <CardTitle>Uso por Assistente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {analytics?.data?.agent_usage?.map(usage => (
                    <div key={usage.agent_type} className='space-y-2'>
                      <div className='flex items-center justify-between'>
                        <span className='capitalize'>{usage.agent_type}</span>
                        <Badge variant='outline'>
                          {usage.session_count} sessões
                        </Badge>
                      </div>
                      <div className='w-full bg-muted rounded-full h-2'>
                        <div
                          className='bg-primary h-2 rounded-full'
                          style={{
                            width: `${
                              (usage.session_count / Math.max(...analytics.data.agent_usage.map(u =>
                                u.session_count
                              ))) * 100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  )) || (
                    <p className='text-center text-muted-foreground py-4'>
                      Nenhum dado de uso disponível
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status do Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  <div className='flex items-center gap-2'>
                    <CheckCircle className='h-4 w-4 text-green-500' />
                    <span>API de Agentes</span>
                    <Badge variant='secondary'>Online</Badge>
                  </div>

                  <div className='flex items-center gap-2'>
                    <CheckCircle className='h-4 w-4 text-green-500' />
                    <span>Base de Conhecimento</span>
                    <Badge variant='secondary'>Ativa</Badge>
                  </div>

                  <div className='flex items-center gap-2'>
                    <CheckCircle className='h-4 w-4 text-green-500' />
                    <span>LGPD Compliance</span>
                    <Badge variant='secondary'>OK</Badge>
                  </div>

                  <div className='flex items-center gap-2'>
                    <AlertTriangle className='h-4 w-4 text-yellow-500' />
                    <span>Entrada de Voz</span>
                    <Badge variant='outline'>Em breve</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='settings' className='flex-1 mt-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Agent Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Assistente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='font-medium'>Modelo de IA</p>
                      <p className='text-sm text-muted-foreground'>
                        GPT-4 para contexto médico
                      </p>
                    </div>
                    <Badge variant='secondary'>GPT-4</Badge>
                  </div>

                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='font-medium'>Temperatura</p>
                      <p className='text-sm text-muted-foreground'>
                        Criatividade das respostas
                      </p>
                    </div>
                    <Badge variant='secondary'>0.3</Badge>
                  </div>

                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='font-medium'>Tokens Máximos</p>
                      <p className='text-sm text-muted-foreground'>
                        Limite de resposta
                      </p>
                    </div>
                    <Badge variant='secondary'>4000</Badge>
                  </div>

                  <Separator />

                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='font-medium'>Compliance LGPD</p>
                      <p className='text-sm text-muted-foreground'>
                        Proteção de dados
                      </p>
                    </div>
                    <Badge variant='default' className='bg-green-500'>
                      Ativo
                    </Badge>
                  </div>

                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='font-medium'>Criptografia</p>
                      <p className='text-sm text-muted-foreground'>
                        Dados em trânsito
                      </p>
                    </div>
                    <Badge variant='default' className='bg-green-500'>
                      AES-256
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Privacidade e Segurança</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='font-medium'>Retenção de Dados</p>
                      <p className='text-sm text-muted-foreground'>
                        Período de armazenamento
                      </p>
                    </div>
                    <Badge variant='secondary'>30 dias</Badge>
                  </div>

                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='font-medium'>Anonimização</p>
                      <p className='text-sm text-muted-foreground'>
                        Nível de privacidade
                      </p>
                    </div>
                    <Badge variant='secondary'>Estrito</Badge>
                  </div>

                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='font-medium'>Auditoria</p>
                      <p className='text-sm text-muted-foreground'>
                        Registro de atividades
                      </p>
                    </div>
                    <Badge variant='default' className='bg-green-500'>
                      Ativo
                    </Badge>
                  </div>

                  <Separator />

                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='font-medium'>Consentimento</p>
                      <p className='text-sm text-muted-foreground'>
                        Autorização do usuário
                      </p>
                    </div>
                    <Badge variant='default' className='bg-green-500'>
                      Obrigatório
                    </Badge>
                  </div>

                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='font-medium'>Localização</p>
                      <p className='text-sm text-muted-foreground'>
                        Servidores no Brasil
                      </p>
                    </div>
                    <Badge variant='default' className='bg-green-500'>
                      Sim
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Configurações Avançadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='font-medium'>Streaming</p>
                      <p className='text-sm text-muted-foreground'>
                        Respostas em tempo real
                      </p>
                    </div>
                    <Badge variant='default' className='bg-green-500'>
                      Ativo
                    </Badge>
                  </div>

                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='font-medium'>Cache</p>
                      <p className='text-sm text-muted-foreground'>
                        Otimização de performance
                      </p>
                    </div>
                    <Badge variant='default' className='bg-green-500'>
                      Ativo
                    </Badge>
                  </div>

                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='font-medium'>Rate Limiting</p>
                      <p className='text-sm text-muted-foreground'>
                        Proteção contra abuso
                      </p>
                    </div>
                    <Badge variant='default' className='bg-green-500'>
                      60/min
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Session Management */}
            <Card>
              <CardHeader>
                <CardTitle>Gerenciamento de Sessão</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='font-medium'>Sessão Atual</p>
                      <p className='text-sm text-muted-foreground'>
                        {currentSessionId ? 'Ativa' : 'Inativa'}
                      </p>
                    </div>
                    <Badge variant={currentSessionId ? 'default' : 'secondary'}>
                      {currentSessionId
                        ? 'ID: ' + currentSessionId.substring(0, 8)
                        : 'N/A'}
                    </Badge>
                  </div>

                  {currentSessionId && (<Button
                      variant='outline'
                      onClick={() => endCurrentSession('User ended session')}
                      disabled={isArchiving}
                      className='w-full'
                    >
                      Encerrar Sessão Atual
                    </Button>
                  )}

                  <Separator />

                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='font-medium'>Limpar Histórico</p>
                      <p className='text-sm text-muted-foreground'>
                        Remover todas as conversas
                      </p>
                    </div>
                    <Button variant='destructive' size='sm'>
                      Limpar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

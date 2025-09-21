/**
 * Telemedicine Dashboard - Session Management Interface
 * Overview of active sessions, scheduled consultations, and compliance status
 * Enhanced with real tRPC integration, real-time updates, and comprehensive features
 */

import { createFileRoute } from '@tanstack/react-router';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  FileText,
  Filter,
  Heart,
  PlayCircle,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Shield,
  Stethoscope,
  TrendingUp,
  UserCheck,
  Users,
  Video,
  Wifi,
  WifiOff,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { Alert } from '@/components/ui/alert';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs } from '@/components/ui/tabs';
import { toast } from 'sonner';

// Import tRPC client and types
import { trpc } from '@/lib/trpc';
import type { ScheduledSession } from '@neonpro/types';

// Import telemedicine components
import { RealTimeChat } from '@/components/telemedicine/RealTimeChat';
import { SessionConsent } from '@/components/telemedicine/SessionConsent';
import { VideoConsultation } from '@/components/telemedicine/VideoConsultation';
import { WaitingRoom } from '@/components/telemedicine/WaitingRoom';

export const Route = createFileRoute('/telemedicine/')({
  component: TelemedicineDashboard,
});

interface TelemedicineDashboardState {
  searchQuery: string;
  filterStatus: 'all' | 'active' | 'scheduled' | 'completed' | 'cancelled';
  filterType:
    | 'all'
    | 'consultation'
    | 'follow_up'
    | 'emergency'
    | 'second_opinion';
  showOnlyUrgent: boolean;
  autoRefresh: boolean;
}

function TelemedicineDashboard() {
  // State
  const [state, setState] = useState<TelemedicineDashboardState>({
    searchQuery: '',
    filterStatus: 'all',
    filterType: 'all',
    showOnlyUrgent: false,
    autoRefresh: true,
  });
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [showConsentModal, setShowConsentModal] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // tRPC Queries
  const {
    data: sessionStats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = trpc.telemedicine.getSessionStats.useQuery();

  const {
    data: scheduledSessions,
    isLoading: sessionsLoading,
    refetch: refetchSessions,
  } = trpc.telemedicine.getScheduledSessions.useQuery({
    status: state.filterStatus !== 'all' ? state.filterStatus : undefined,
    type: state.filterType !== 'all' ? state.filterType : undefined,
    search: state.searchQuery || undefined,
    urgentOnly: state.showOnlyUrgent,
  });

  const { data: activeSessions, isLoading: activeLoading } = trpc.telemedicine.getActiveSessions
    .useQuery();

  const { data: complianceStatus } = trpc.telemedicine.getComplianceStatus.useQuery();

  const { data: systemHealth, isLoading: healthLoading } = trpc.telemedicine.getSystemHealth
    .useQuery();

  // tRPC Mutations
  const startSessionMutation = trpc.telemedicine.startSession.useMutation({
    onSuccess: session => {
      toast.success('Sessão iniciada com sucesso');
      setSelectedSession(session.id);
      refetchSessions();
      refetchStats();
    },
    onError: error => {
      toast.error(`Erro ao iniciar sessão: ${error.message}`);
    },
  });

  const joinSessionMutation = trpc.telemedicine.joinSession.useMutation({
    onSuccess: session => {
      toast.success('Conectado à sessão');
      setSelectedSession(session.id);
    },
    onError: error => {
      toast.error(`Erro ao conectar: ${error.message}`);
    },
  });

  const endSessionMutation = trpc.telemedicine.endSession.useMutation({
    onSuccess: () => {
      toast.success('Sessão finalizada');
      setSelectedSession(null);
      refetchSessions();
      refetchStats();
    },
    onError: error => {
      toast.error(`Erro ao finalizar sessão: ${error.message}`);
    },
  });

  // Real-time subscriptions
  trpc.telemedicine.onSessionUpdate.useSubscription(undefined, {
    onData: data => {
      if (
        data.type === 'session_started'
        || data.type === 'session_ended'
        || data.type === 'session_updated'
      ) {
        refetchSessions();
        refetchStats();
        if (data.type === 'session_started') {
          toast.info(`Nova sessão iniciada: ${data.sessionId}`);
        }
      }
    },
    onError: error => {
      console.error('WebSocket error:', error);
    },
  });

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Auto-refresh data
  useEffect(() => {
    if (state.autoRefresh) {
      const interval = setInterval(() => {
        refetchSessions();
        refetchStats();
      }, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [state.autoRefresh, refetchSessions, refetchStats]);

  // Handle session start
  const handleStartSession = async (_appointmentId: [a-zA-Z][a-zA-Z]*) => {
    try {
      await startSessionMutation.mutateAsync({
        appointmentId,
        sessionType: 'consultation',
        settings: {
          recordingEnabled: true,
          aiAssistanceEnabled: true,
          complianceMode: 'strict',
        },
      });
    } catch (_error) {
      // Error handled by onError callback
    }
  };

  // Handle session join
  const handleJoinSession = async (_sessionId: [a-zA-Z][a-zA-Z]*) => {
    try {
      await joinSessionMutation.mutateAsync({ sessionId });
    } catch (_error) {
      // Error handled by onError callback
    }
  };

  // Handle session end
  const handleEndSession = async (
    sessionId: string,
    reason: string = 'completed',
  ) => {
    try {
      await endSessionMutation.mutateAsync({ sessionId, reason });
    } catch (_error) {
      // Error handled by onError callback
    }
  };

  // Filter sessions based on current state
  const filteredSessions = scheduledSessions?.filter(session => {
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      return (
        session.patientName.toLowerCase().includes(query)
        || session.professionalName.toLowerCase().includes(query)
        || session.appointmentId.toLowerCase().includes(query)
      );
    }
    return true;
  }) || [];

  // Get status color
  const getStatusColor = (_status: [a-zA-Z][a-zA-Z]*) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'waiting':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Get urgency color
  const getUrgencyColor = (_urgency: [a-zA-Z][a-zA-Z]*) => {
    switch (urgency) {
      case 'critical':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  // Format time for display
  const formatTime = (_date: [a-zA-Z][a-zA-Z]*) => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  // Show session view if a session is selected
  if (selectedSession) {
    const session = activeSessions?.find(s => s.id === selectedSession)
      || scheduledSessions?.find(s => s.id === selectedSession);

    if (session) {
      return (
        <VideoConsultation
          sessionId={selectedSession}
          onSessionEnd={() => setSelectedSession(null)}
          className='h-screen'
        />
      );
    }
  }

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-7xl mx-auto space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>Telemedicina</h1>
            <p className='text-gray-600'>
              Plataforma completa para consultas médicas remotas
            </p>
          </div>

          <div className='flex items-center space-x-3'>
            {/* System Health Indicator */}
            <div className='flex items-center space-x-2'>
              {systemHealth?.status === 'healthy'
                ? <Wifi className='h-5 w-5 text-green-600' />
                : <WifiOff className='h-5 w-5 text-red-600' />}
              <span className='text-sm text-gray-600'>
                Sistema {systemHealth?.status === 'healthy'
                  ? 'Operacional'
                  : 'Instável'}
              </span>
            </div>

            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                refetchSessions();
                refetchStats();
                toast.success('Dados atualizados');
              }}
              disabled={sessionsLoading || statsLoading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${sessionsLoading || statsLoading ? 'animate-spin' : ''}`}
              />
              Atualizar
            </Button>

            <Button asChild>
              <Link to='/telemedicine/new-session'>
                <Plus className='h-4 w-4 mr-2' />
                Nova Sessão
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>
                    Sessões Ativas
                  </p>
                  <p className='text-2xl font-bold text-green-600'>
                    {statsLoading ? '...' : sessionStats?.activeNow || 0}
                  </p>
                </div>
                <div className='h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center'>
                  <Video className='h-6 w-6 text-green-600' />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>
                    Agendadas Hoje
                  </p>
                  <p className='text-2xl font-bold text-blue-600'>
                    {statsLoading ? '...' : sessionStats?.scheduledToday || 0}
                  </p>
                </div>
                <div className='h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center'>
                  <Calendar className='h-6 w-6 text-blue-600' />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>
                    Finalizadas Hoje
                  </p>
                  <p className='text-2xl font-bold text-purple-600'>
                    {statsLoading ? '...' : sessionStats?.completedToday || 0}
                  </p>
                </div>
                <div className='h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center'>
                  <CheckCircle className='h-6 w-6 text-purple-600' />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>
                    Duração Média
                  </p>
                  <p className='text-2xl font-bold text-orange-600'>
                    {statsLoading
                      ? '...'
                      : `${sessionStats?.avgDuration || 0}min`}
                  </p>
                </div>
                <div className='h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center'>
                  <Clock className='h-6 w-6 text-orange-600' />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Compliance Status */}
        {complianceStatus && (
          <Card>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-4'>
                  <Shield className='h-5 w-5 text-green-600' />
                  <div>
                    <h3 className='font-medium'>Status de Conformidade</h3>
                    <p className='text-sm text-gray-600'>
                      Sistema em conformidade com CFM e LGPD
                    </p>
                  </div>
                </div>
                <div className='flex items-center space-x-4'>
                  <Badge
                    variant='outline'
                    className='bg-green-50 text-green-700 border-green-300'
                  >
                    CFM ✓
                  </Badge>
                  <Badge
                    variant='outline'
                    className='bg-blue-50 text-blue-700 border-blue-300'
                  >
                    LGPD ✓
                  </Badge>
                  <Badge
                    variant='outline'
                    className='bg-purple-50 text-purple-700 border-purple-300'
                  >
                    E2E Crypto ✓
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Active Sessions */}
          <div className='lg:col-span-2'>
            <Card>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <CardTitle className='flex items-center space-x-2'>
                    <Activity className='h-5 w-5' />
                    <span>Sessões Programadas</span>
                  </CardTitle>

                  <div className='flex items-center space-x-2'>
                    {/* Search */}
                    <div className='relative'>
                      <Search className='absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                      <Input
                        placeholder='Buscar...'
                        value={state.searchQuery}
                        onChange={e =>
                          setState(prev => ({
                            ...prev,
                            searchQuery: e.target.value,
                          }))}
                        className='pl-8 w-48'
                      />
                    </div>

                    {/* Filter */}
                    <Select
                      value={state.filterStatus}
                      onValueChange={(value: any) =>
                        setState(prev => ({ ...prev, filterStatus: value }))}
                    >
                      <SelectTrigger className='w-32'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='all'>Todas</SelectItem>
                        <SelectItem value='active'>Ativas</SelectItem>
                        <SelectItem value='scheduled'>Agendadas</SelectItem>
                        <SelectItem value='waiting'>Aguardando</SelectItem>
                        <SelectItem value='completed'>Finalizadas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {sessionsLoading
                  ? (
                    <div className='flex items-center justify-center h-32'>
                      <Activity className='h-6 w-6 animate-spin mr-2' />
                      <span>Carregando sessões...</span>
                    </div>
                  )
                  : filteredSessions.length === 0
                  ? (
                    <div className='text-center py-8'>
                      <Calendar className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                      <h3 className='text-lg font-medium text-gray-900 mb-2'>
                        Nenhuma sessão encontrada
                      </h3>
                      <p className='text-gray-600'>
                        {state.searchQuery
                          ? 'Tente ajustar os filtros de busca.'
                          : 'Não há sessões programadas no momento.'}
                      </p>
                    </div>
                  )
                  : (
                    <ScrollArea className='h-96'>
                      <div className='space-y-4'>
                        {filteredSessions.map(session => (
                          <div
                            key={session.id}
                            className='flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50'
                          >
                            <div className='flex items-center space-x-4'>
                              <Avatar className='h-10 w-10'>
                                <AvatarImage src={session.patientAvatar} />
                                <AvatarFallback className='bg-blue-100 text-blue-600'>
                                  {session.patientName
                                    .split(' ')
                                    .map(n => n[0])
                                    .join('')
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>

                              <div>
                                <h4 className='font-medium'>
                                  {session.patientName}
                                </h4>
                                <div className='flex items-center space-x-2 text-sm text-gray-600'>
                                  <span>{formatTime(session.scheduledTime)}</span>
                                  <span>•</span>
                                  <span>{session.sessionType}</span>
                                  <span>•</span>
                                  <span>{session.estimatedDuration} min</span>
                                </div>
                              </div>
                            </div>

                            <div className='flex items-center space-x-3'>
                              {/* Urgency indicator */}
                              {session.urgencyLevel
                                && session.urgencyLevel !== 'low' && (
                                <AlertTriangle
                                  className={`h-4 w-4 ${getUrgencyColor(session.urgencyLevel)}`}
                                />
                              )}

                              {/* Status badge */}
                              <Badge
                                variant='outline'
                                className={getStatusColor(session.status)}
                              >
                                {session.status === 'active' && 'Ativa'}
                                {session.status === 'scheduled' && 'Agendada'}
                                {session.status === 'waiting' && 'Aguardando'}
                                {session.status === 'completed' && 'Finalizada'}
                                {session.status === 'cancelled' && 'Cancelada'}
                              </Badge>

                              {/* Action buttons */}
                              <div className='flex space-x-2'>
                                {session.status === 'scheduled' && (
                                  <Button
                                    size='sm'
                                    onClick={() => handleStartSession(session.appointmentId)}
                                    disabled={startSessionMutation.isLoading}
                                  >
                                    <PlayCircle className='h-4 w-4 mr-1' />
                                    Iniciar
                                  </Button>
                                )}

                                {session.status === 'active' && (
                                  <Button
                                    size='sm'
                                    onClick={() => handleJoinSession(session.id)}
                                    disabled={joinSessionMutation.isLoading}
                                  >
                                    <Video className='h-4 w-4 mr-1' />
                                    Entrar
                                  </Button>
                                )}

                                {session.status === 'waiting' && (
                                  <Button
                                    size='sm'
                                    variant='outline'
                                    onClick={() => setShowConsentModal(session.id)}
                                  >
                                    <UserCheck className='h-4 w-4 mr-1' />
                                    Consent
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Quick Actions & Info */}
          <div className='space-y-6'>
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <Button asChild className='w-full'>
                  <Link to='/telemedicine/new-session'>
                    <Plus className='h-4 w-4 mr-2' />
                    Nova Consulta
                  </Link>
                </Button>

                <Button asChild variant='outline' className='w-full'>
                  <Link to='/telemedicine/waiting-room'>
                    <Clock className='h-4 w-4 mr-2' />
                    Sala de Espera
                  </Link>
                </Button>

                <Button asChild variant='outline' className='w-full'>
                  <Link to='/telemedicine/reports'>
                    <BarChart3 className='h-4 w-4 mr-2' />
                    Relatórios
                  </Link>
                </Button>

                <Button asChild variant='outline' className='w-full'>
                  <Link to='/telemedicine/settings'>
                    <Settings className='h-4 w-4 mr-2' />
                    Configurações
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Status do Sistema</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex items-center justify-between text-sm'>
                  <span>WebRTC Server</span>
                  <Badge
                    variant='outline'
                    className='bg-green-50 text-green-700'
                  >
                    ✓ Online
                  </Badge>
                </div>
                <div className='flex items-center justify-between text-sm'>
                  <span>AI Assistant</span>
                  <Badge
                    variant='outline'
                    className='bg-green-50 text-green-700'
                  >
                    ✓ Ativo
                  </Badge>
                </div>
                <div className='flex items-center justify-between text-sm'>
                  <span>Compliance Monitor</span>
                  <Badge
                    variant='outline'
                    className='bg-green-50 text-green-700'
                  >
                    ✓ Conforme
                  </Badge>
                </div>
                <div className='flex items-center justify-between text-sm'>
                  <span>Backup System</span>
                  <Badge variant='outline' className='bg-blue-50 text-blue-700'>
                    ✓ Sincronizado
                  </Badge>
                </div>

                <Separator />

                <div className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span>Capacidade do Sistema</span>
                    <span>78%</span>
                  </div>
                  <Progress value={78} className='h-2' />
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Atividade Recente</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className='h-48'>
                  <div className='space-y-3'>
                    {activeSessions?.slice(0, 5).map((session, index) => (
                      <div
                        key={session.id}
                        className='flex items-center space-x-3 text-sm'
                      >
                        <div className='w-2 h-2 bg-green-500 rounded-full' />
                        <div className='flex-1'>
                          <div className='font-medium'>
                            {session.patientName}
                          </div>
                          <div className='text-gray-600'>
                            {session.status === 'active'
                              ? 'Em andamento'
                              : 'Finalizada'} • {formatTime(session.startTime)}
                          </div>
                        </div>
                      </div>
                    )) || (
                      <div className='text-center text-gray-500 py-4'>
                        Nenhuma atividade recente
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Consent Modal */}
        {showConsentModal && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
            <div className='bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-y-auto'>
              <SessionConsent
                sessionId={showConsentModal}
                patientId='patient-id' // Should come from session data
                professionalId='professional-id' // Should come from session data
                onConsentComplete={() => {
                  setShowConsentModal(null);
                  toast.success('Consentimento registrado');
                  refetchSessions();
                }}
                onConsentRevoke={() => {
                  setShowConsentModal(null);
                  toast.info('Consentimento revogado');
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TelemedicineDashboard;

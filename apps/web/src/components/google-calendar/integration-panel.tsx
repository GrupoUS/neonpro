import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle,
  Download,
  RefreshCw,
  Sync,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { GoogleCalendarConnectButton } from './connect-button';
import { SyncSettings } from './sync-settings';

interface GoogleCalendarIntegrationPanelProps {
  _userId: string;
  clinicId: string;
}

interface IntegrationStatus {
  isConnected: boolean;
  lastSyncAt?: Date;
  totalEvents: number;
  syncErrors: number;
  calendarName?: string;
}

export function GoogleCalendarIntegrationPanel({
  userId,
  clinicId,
}: GoogleCalendarIntegrationPanelProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Query for integration status
  const { data: integrationStatus, isLoading } = useQuery({
    queryKey: ['gcal-status', userId, clinicId],
    queryFn: async (): Promise<IntegrationStatus> => {
      // In real app, fetch from API
      return {
        isConnected: false, // Mock value
        totalEvents: 0,
        syncErrors: 0,
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Query for recent sync activity
  const { data: syncActivity } = useQuery({
    queryKey: ['gcal-activity',userId, clinicId],
    queryFn: async () => {
      // In real app, fetch from API
      return [
        {
          id: '1',
          operation: 'SYNC',
          direction: 'TO_GOOGLE',
          status: 'SUCCESS',
          timestamp: new Date(),
          appointmentCount: 5,
        },
        {
          id: '2',
          operation: 'CREATE',
          direction: 'TO_GOOGLE',
          status: 'SUCCESS',
          timestamp: new Date(Date.now() - 3600000), // 1 hour ago
          appointmentCount: 1,
        },
      ];
    },
    enabled: integrationStatus?.isConnected,
  });

  const disconnectMutation = useMutation({
    mutationFn: async () => {
      // In real app, call disconnect API
      return { success: true };
    },
    onSuccess: () => {
      // Refresh status
      // Show success message
    },
  });

  const handleDisconnect = () => {
    if (confirm('Tem certeza que deseja desconectar o Google Calendar?')) {
      disconnectMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center space-x-2'>
              <Calendar className='h-5 w-5' />
              <span>Integração Google Calendar</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center justify-center py-8'>
              <RefreshCw className='h-8 w-8 animate-spin text-gray-400' />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <Calendar className='h-5 w-5' />
            <span>Integração Google Calendar</span>
            {integrationStatus?.isConnected && (
              <Badge variant='default' className='bg-green-100 text-green-800'>
                Conectado
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Sincronize seus compromissos automaticamente com o Google Calendar
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!integrationStatus?.isConnected
            ? (<GoogleCalendarConnectButton
                userId={userId}
                clinicId={clinicId}
                onConnect={() => {
                  // Refresh status after connect
                }}
              />
            )
            : (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className='grid w-full grid-cols-4'>
                  <TabsTrigger value='overview'>Visão Geral</TabsTrigger>
                  <TabsTrigger value='sync'>Sincronização</TabsTrigger>
                  <TabsTrigger value='activity'>Atividade</TabsTrigger>
                  <TabsTrigger value='settings'>Configurações</TabsTrigger>
                </TabsList>

                <TabsContent value='overview' className='space-y-4 mt-6'>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <Card>
                      <CardContent className='p-4'>
                        <div className='flex items-center space-x-2'>
                          <Calendar className='h-4 w-4 text-blue-600' />
                          <span className='text-sm font-medium'>
                            Total de Eventos
                          </span>
                        </div>
                        <p className='text-2xl font-bold mt-1'>
                          {integrationStatus.totalEvents}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className='p-4'>
                        <div className='flex items-center space-x-2'>
                          <Sync className='h-4 w-4 text-green-600' />
                          <span className='text-sm font-medium'>
                            Sincronizações
                          </span>
                        </div>
                        <p className='text-2xl font-bold mt-1'>
                          {syncActivity?.length || 0}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className='p-4'>
                        <div className='flex items-center space-x-2'>
                          <AlertTriangle className='h-4 w-4 text-orange-600' />
                          <span className='text-sm font-medium'>Erros</span>
                        </div>
                        <p className='text-2xl font-bold mt-1'>
                          {integrationStatus.syncErrors}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className='space-y-4'>
                    <div>
                      <h3 className='font-medium mb-2'>Status da Integração</h3>
                      <div className='p-4 bg-gray-50 rounded-lg space-y-2'>
                        <div className='flex items-center justify-between'>
                          <span className='text-sm'>Conectado com:</span>
                          <Badge variant='outline'>
                            {integrationStatus.calendarName
                              || 'Calendário Principal'}
                          </Badge>
                        </div>
                        {integrationStatus.lastSyncAt && (
                          <div className='flex items-center justify-between'>
                            <span className='text-sm'>Última sincronização:</span>
                            <span className='text-sm text-gray-600'>
                              {integrationStatus.lastSyncAt.toLocaleString(
                                'pt-BR',
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <Alert>
                      <CheckCircle className='h-4 w-4' />
                      <AlertDescription>
                        Sua integração está funcionando corretamente. Os compromissos estão sendo
                        sincronizados automaticamente entre o NeonPro e seu Google Calendar.
                      </AlertDescription>
                    </Alert>

                    <div className='flex justify-between'>
                      <Button variant='outline' onClick={handleDisconnect}>
                        Desconectar
                      </Button>
                      <Button onClick={() => setActiveTab('settings')}>
                        Configurações Avançadas
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value='sync' className='space-y-4 mt-6'>
                  <SyncSettings
                    userId={userId}
                    clinicId={clinicId}
                    integrationId='mock-id'
                  />
                </TabsContent>

                <TabsContent value='activity' className='space-y-4 mt-6'>
                  <Card>
                    <CardHeader>
                      <CardTitle className='flex items-center space-x-2'>
                        <Activity className='h-5 w-5' />
                        <span>Atividade Recente</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {syncActivity && syncActivity.length > 0
                        ? (
                          <div className='space-y-3'>
                            {syncActivity.map(activity => (
                              <div
                                key={activity.id}
                                className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                              >
                                <div className='flex items-center space-x-3'>
                                  <div
                                    className={`p-1 rounded ${
                                      activity.status === 'SUCCESS'
                                        ? 'bg-green-100'
                                        : 'bg-red-100'
                                    }`}
                                  >
                                    {activity.status === 'SUCCESS'
                                      ? <CheckCircle className='h-4 w-4 text-green-600' />
                                      : <AlertTriangle className='h-4 w-4 text-red-600' />}
                                  </div>
                                  <div>
                                    <p className='font-medium text-sm'>
                                      {activity.operation === 'SYNC'
                                        ? 'Sincronização'
                                        : 'Criar Evento'}
                                    </p>
                                    <p className='text-xs text-gray-500'>
                                      {activity.timestamp.toLocaleString('pt-BR')}
                                    </p>
                                  </div>
                                </div>
                                <div className='text-right'>
                                  <Badge variant='outline'>
                                    {activity.direction === 'TO_GOOGLE'
                                      ? 'Para Google'
                                      : 'Do Google'}
                                  </Badge>
                                  {activity.appointmentCount > 0 && (
                                    <p className='text-xs text-gray-500 mt-1'>
                                      {activity.appointmentCount} compromissos
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )
                        : (
                          <p className='text-center text-gray-500 py-8'>
                            Nenhuma atividade recente encontrada
                          </p>
                        )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value='settings' className='space-y-4 mt-6'>
                  <SyncSettings
                    userId={userId}
                    clinicId={clinicId}
                    integrationId='mock-id'
                  />

                  <Card>
                    <CardHeader>
                      <CardTitle className='flex items-center space-x-2'>
                        <BarChart3 className='h-5 w-5' />
                        <span>Estatísticas</span>
                      </CardTitle>
                      <CardDescription>
                        Visualize estatísticas de sincronização
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className='space-y-4'>
                        <div className='grid grid-cols-2 gap-4'>
                          <div className='text-center p-4 bg-blue-50 rounded-lg'>
                            <p className='text-2xl font-bold text-blue-600'>24</p>
                            <p className='text-sm text-gray-600'>
                              Eventos este mês
                            </p>
                          </div>
                          <div className='text-center p-4 bg-green-50 rounded-lg'>
                            <p className='text-2xl font-bold text-green-600'>
                              98%
                            </p>
                            <p className='text-sm text-gray-600'>
                              Taxa de sucesso
                            </p>
                          </div>
                        </div>
                        <Button variant='outline' className='w-full'>
                          <Download className='mr-2 h-4 w-4' />
                          Exportar Relatório
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
        </CardContent>
      </Card>
    </div>
  );
}

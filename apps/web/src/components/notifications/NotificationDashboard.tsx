/**
 * Notification Dashboard Component
 * Shows notification statistics and management tools for clinic staff
 */

import {
  useNotificationStats,
  useProcessPendingNotifications,
} from '@/hooks/useNotificationScheduler';
import { cn } from '@neonpro/ui';

// Simple Progress component since it's not in the UI package
const Progress = ({ value, className }: { value: number; className?: string }) => (
  <div className={cn('w-full bg-muted rounded-full h-2', className)}>
    <div
      className='bg-primary h-2 rounded-full transition-all duration-300'
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);
import { Button } from '@neonpro/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@neonpro/ui';
import { Badge } from '@neonpro/ui';
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  Clock,
  Mail,
  MessageSquare,
  Phone,
  RefreshCw,
  Send,
  TrendingUp,
  Users,
  XCircle,
} from 'lucide-react';

interface NotificationDashboardProps {
  clinicId?: string;
  className?: string;
}

export function NotificationDashboard({
  clinicId,
  className,
}: NotificationDashboardProps) {
  const { data: stats, isLoading, refetch } = useNotificationStats(clinicId);
  const processPendingMutation = useProcessPendingNotifications();

  const handleProcessPending = async () => {
    try {
      await processPendingMutation.mutateAsync();
      refetch(); // Refresh stats after processing
    } catch (error) {
      console.error('Error processing pending notifications:', error);
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Bell className='h-5 w-5' />
            Dashboard de Notificações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='animate-pulse space-y-4'>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className='h-20 bg-muted rounded'></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const successRate = stats?.total ? Math.round((stats.sent / stats.total) * 100) : 0;
  const pendingRate = stats?.total ? Math.round((stats.pending / stats.total) * 100) : 0;
  const failureRate = stats?.total ? Math.round((stats.failed / stats.total) * 100) : 0;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='flex items-center gap-2'>
            <Bell className='h-5 w-5' />
            Dashboard de Notificações
          </CardTitle>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
              Atualizar
            </Button>
            <Button
              size='sm'
              onClick={handleProcessPending}
              disabled={processPendingMutation.isPending || stats?.pending === 0}
            >
              <Send className='h-4 w-4 mr-2' />
              {processPendingMutation.isPending ? 'Processando...' : 'Processar Pendentes'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Statistics Cards */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>Total</p>
                <p className='text-2xl font-bold'>{stats?.total || 0}</p>
              </div>
              <Bell className='h-8 w-8 text-muted-foreground' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>Enviadas</p>
                <p className='text-2xl font-bold text-green-600'>{stats?.sent || 0}</p>
              </div>
              <CheckCircle className='h-8 w-8 text-green-600' />
            </div>
            <div className='mt-2'>
              <Progress value={successRate} className='h-2' />
              <p className='text-xs text-muted-foreground mt-1'>{successRate}% do total</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>Pendentes</p>
                <p className='text-2xl font-bold text-amber-600'>{stats?.pending || 0}</p>
              </div>
              <Clock className='h-8 w-8 text-amber-600' />
            </div>
            <div className='mt-2'>
              <Progress value={pendingRate} className='h-2' />
              <p className='text-xs text-muted-foreground mt-1'>{pendingRate}% do total</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>Falharam</p>
                <p className='text-2xl font-bold text-red-600'>{stats?.failed || 0}</p>
              </div>
              <XCircle className='h-8 w-8 text-red-600' />
            </div>
            <div className='mt-2'>
              <Progress value={failureRate} className='h-2' />
              <p className='text-xs text-muted-foreground mt-1'>{failureRate}% do total</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Overview */}
      <div className='grid md:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <TrendingUp className='h-5 w-5' />
              Taxa de Sucesso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>Taxa de Entrega</span>
                <Badge
                  variant={successRate >= 90
                    ? 'default'
                    : successRate >= 70
                    ? 'secondary'
                    : 'destructive'}
                >
                  {successRate}%
                </Badge>
              </div>
              <Progress value={successRate} className='h-3' />
              <p className='text-xs text-muted-foreground'>
                {successRate >= 90
                  ? 'Excelente taxa de entrega'
                  : successRate >= 70
                  ? 'Taxa de entrega boa'
                  : 'Taxa de entrega precisa melhorar'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Users className='h-5 w-5' />
              Canais de Comunicação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <Mail className='h-4 w-4 text-blue-600' />
                  <span className='text-sm'>Email</span>
                </div>
                <Badge variant='outline'>Ativo</Badge>
              </div>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <Phone className='h-4 w-4 text-green-600' />
                  <span className='text-sm'>SMS</span>
                </div>
                <Badge variant='outline'>Ativo</Badge>
              </div>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <MessageSquare className='h-4 w-4 text-green-600' />
                  <span className='text-sm'>WhatsApp</span>
                </div>
                <Badge variant='outline'>Ativo</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Warnings */}
      {(stats?.pending || 0) > 10 && (
        <Card className='border-amber-200 bg-amber-50'>
          <CardContent className='p-4'>
            <div className='flex items-start gap-3'>
              <AlertTriangle className='h-5 w-5 text-amber-600 mt-0.5' />
              <div>
                <h4 className='font-medium text-amber-800'>
                  Muitas notificações pendentes
                </h4>
                <p className='text-sm text-amber-700 mt-1'>
                  Existem {stats?.pending}{' '}
                  notificações aguardando processamento. Considere processar as pendentes para
                  melhorar a experiência dos pacientes.
                </p>
                <Button
                  size='sm'
                  className='mt-2'
                  onClick={handleProcessPending}
                  disabled={processPendingMutation.isPending}
                >
                  Processar Agora
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {failureRate > 20 && (
        <Card className='border-red-200 bg-red-50'>
          <CardContent className='p-4'>
            <div className='flex items-start gap-3'>
              <XCircle className='h-5 w-5 text-red-600 mt-0.5' />
              <div>
                <h4 className='font-medium text-red-800'>
                  Alta taxa de falhas
                </h4>
                <p className='text-sm text-red-700 mt-1'>
                  {failureRate}% das notificações falharam. Verifique a configuração dos serviços de
                  email, SMS e WhatsApp.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {stats?.total === 0 && (
        <Card className='border-blue-200 bg-blue-50'>
          <CardContent className='p-4'>
            <div className='flex items-start gap-3'>
              <Bell className='h-5 w-5 text-blue-600 mt-0.5' />
              <div>
                <h4 className='font-medium text-blue-800'>
                  Sistema de notificações pronto
                </h4>
                <p className='text-sm text-blue-700 mt-1'>
                  O sistema está configurado e pronto para enviar notificações. As notificações
                  aparecerão aqui conforme os agendamentos forem criados.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

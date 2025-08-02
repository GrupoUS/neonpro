// =====================================================================================
// FOLLOW-UP DASHBOARD COMPONENT
// Epic 7.3: Main dashboard component for treatment follow-up automation
// =====================================================================================

'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { CalendarIcon, ClockIcon, UserIcon, MessageSquareIcon, TrendingUpIcon, AlertCircleIcon } from 'lucide-react';
import { useFollowupDashboardSummary, useTodayFollowups, usePendingFollowups, useOverdueFollowups } from '@/app/hooks/use-treatment-followups';
import type { TreatmentFollowup } from '@/app/types/treatment-followups';

interface FollowupDashboardProps {
  clinicId: string;
}

const FollowupDashboard: React.FC<FollowupDashboardProps> = ({ clinicId }) => {
  // Fetch dashboard data
  const { data: summary, isLoading: summaryLoading, error: summaryError } = useFollowupDashboardSummary(clinicId);
  const { data: todayFollowups, isLoading: todayLoading } = useTodayFollowups(clinicId);
  const { data: pendingFollowups, isLoading: pendingLoading } = usePendingFollowups(clinicId);
  const { data: overdueFollowups, isLoading: overdueLoading } = useOverdueFollowups(clinicId);

  if (summaryLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (summaryError) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar dashboard</h3>
          <p className="text-gray-500">{summaryError.message}</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'sent': return 'Enviado';
      case 'completed': return 'Concluído';
      case 'failed': return 'Falhou';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'normal': return 'Normal';
      case 'low': return 'Baixa';
      default: return priority;
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Follow-ups Hoje</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.today_followups || 0}</div>
            <p className="text-xs text-muted-foreground">Agendados para hoje</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aguardando Resposta</CardTitle>
            <MessageSquareIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.pending_responses || 0}</div>
            <p className="text-xs text-muted-foreground">Respostas pendentes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Atraso</CardTitle>
            <AlertCircleIcon className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summary?.overdue_followups || 0}</div>
            <p className="text-xs text-muted-foreground">Follow-ups atrasados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.upcoming_this_week || 0}</div>
            <p className="text-xs text-muted-foreground">Próximos 7 dias</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Follow-ups */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Follow-ups de Hoje
          </CardTitle>
          <CardDescription>
            Follow-ups agendados para hoje ({new Date().toLocaleDateString('pt-BR')})
          </CardDescription>
        </CardHeader>
        <CardContent>
          {todayLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 animate-pulse">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-48"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : todayFollowups && todayFollowups.length > 0 ? (
            <div className="space-y-4">
              {todayFollowups.slice(0, 5).map((followup) => (
                <FollowupItem key={followup.id} followup={followup} />
              ))}
              {todayFollowups.length > 5 && (
                <div className="text-center pt-4">
                  <Button variant="outline" size="sm">
                    Ver todos ({todayFollowups.length})
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhum follow-up agendado para hoje</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Overdue Follow-ups */}
      {overdueFollowups && overdueFollowups.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertCircleIcon className="h-5 w-5" />
              Follow-ups em Atraso
            </CardTitle>
            <CardDescription>
              Follow-ups que deveriam ter sido realizados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {overdueFollowups.slice(0, 3).map((followup) => (
                <FollowupItem key={followup.id} followup={followup} isOverdue />
              ))}
              {overdueFollowups.length > 3 && (
                <div className="text-center pt-4">
                  <Button variant="outline" size="sm" className="text-red-600 border-red-300">
                    Ver todos ({overdueFollowups.length})
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Helper component for follow-up items
interface FollowupItemProps {
  followup: TreatmentFollowup;
  isOverdue?: boolean;
}

const FollowupItem: React.FC<FollowupItemProps> = ({ followup, isOverdue = false }) => {
  const scheduledTime = new Date(followup.scheduled_date).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const getTypeText = (type: string) => {
    switch (type) {
      case 'initial': return 'Inicial';
      case 'progress': return 'Progresso';
      case 'satisfaction': return 'Satisfação';
      case 'outcome': return 'Resultado';
      case 'maintenance': return 'Manutenção';
      default: return type;
    }
  };

  const getCommunicationIcon = (method: string) => {
    switch (method) {
      case 'whatsapp': return '📱';
      case 'sms': return '💬';
      case 'email': return '📧';
      case 'phone': return '📞';
      default: return '💬';
    }
  };

  return (
    <div className={`flex items-center justify-between p-4 rounded-lg border ${isOverdue ? 'bg-red-50 border-red-200' : 'bg-gray-50'}`}>
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            <UserIcon className="h-5 w-5 text-blue-600" />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900 truncate">
            {followup.patient?.name || 'Paciente não identificado'}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs">
              {getTypeText(followup.followup_type)}
            </Badge>
            <span className="text-xs text-gray-500">
              {getCommunicationIcon(followup.communication_method)} {scheduledTime}
            </span>
            {followup.priority === 'high' && (
              <Badge className="text-xs bg-red-100 text-red-800">
                Alta Prioridade
              </Badge>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Badge className={`text-xs ${isOverdue ? 'bg-red-100 text-red-800' : getStatusColor(followup.status)}`}>
          {isOverdue ? 'Em Atraso' : getStatusText(followup.status)}
        </Badge>
        <Button variant="outline" size="sm">
          Ver
        </Button>
      </div>
    </div>
  );
};

export default FollowupDashboard;
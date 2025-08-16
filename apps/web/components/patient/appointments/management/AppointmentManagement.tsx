'use client';

import {
  AlertCircle,
  Calendar,
  Clock,
  FileText,
  TrendingUp,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePatientAppointments } from '@/hooks/patient/usePatientAppointments';
import { AppointmentCancellation } from './AppointmentCancellation';
import { AppointmentHistory } from './AppointmentHistory';
import { AppointmentStatusTracker } from './AppointmentStatusTracker';
import { RescheduleRequest } from './RescheduleRequest';
import { UpcomingAppointments } from './UpcomingAppointments';

/**
 * Appointment Management Interface for NeonPro Patients
 *
 * VIBECODE MCP Research Implementation:
 * - Context7: React component patterns and state management
 * - Tavily: Healthcare no-show prevention (27% avg rate, 60% reduction with reminders)
 * - Exa: Advanced cancellation policies (24-48h standards, industry best practices)
 *
 * Features:
 * - Comprehensive appointment overview with status tracking
 * - Policy-compliant cancellation and rescheduling
 * - Analytics dashboard for patient engagement
 * - Real-time updates and notifications
 * - Accessibility-first design patterns
 */

type AppointmentManagementProps = {
  /**
   * Optional callback when appointment actions are performed
   * Useful for parent components to track patient engagement
   */
  onAppointmentAction?: (
    action: 'cancel' | 'reschedule' | 'view',
    appointmentId: string,
  ) => void;
};

export function AppointmentManagement({
  onAppointmentAction,
}: AppointmentManagementProps) {
  const {
    upcomingAppointments,
    pastAppointments,
    loading,
    error,
    cancellationPolicies,
    cancelAppointment,
    requestReschedule,
    refreshAppointments,
    getNoShowPattern,
    getCancellationStats,
  } = usePatientAppointments();

  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | null
  >(null);
  const [showCancellationDialog, setShowCancellationDialog] = useState(false);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');

  // Analytics data based on research insights
  const noShowPattern = getNoShowPattern();
  const cancellationStats = getCancellationStats();

  // Handle appointment actions with analytics tracking
  const handleAppointmentAction = (
    action: 'cancel' | 'reschedule' | 'view',
    appointmentId: string,
  ) => {
    setSelectedAppointmentId(appointmentId);

    switch (action) {
      case 'cancel':
        setShowCancellationDialog(true);
        break;
      case 'reschedule':
        setShowRescheduleDialog(true);
        break;
      case 'view':
        // Navigate to detailed view or expand
        break;
    }

    onAppointmentAction?.(action, appointmentId);
  };

  // Handle cancellation completion
  const handleCancellationComplete = async (
    appointmentId: string,
    reason: string,
  ) => {
    const success = await cancelAppointment(appointmentId, reason);
    if (success) {
      setShowCancellationDialog(false);
      setSelectedAppointmentId(null);
      await refreshAppointments();
    }
  };

  // Handle reschedule request completion
  const handleRescheduleComplete = async (
    appointmentId: string,
    newDate: string,
    newTime: string,
    reason: string,
  ) => {
    const success = await requestReschedule(
      appointmentId,
      newDate,
      newTime,
      reason,
    );
    if (success) {
      setShowRescheduleDialog(false);
      setSelectedAppointmentId(null);
      await refreshAppointments();
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[...new Array(3)].map((_, i) => (
            <Card className="animate-pulse" key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 w-3/4 rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-1/2 rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardContent className="pt-6">
            <div className="space-y-3">
              {[...new Array(3)].map((_, i) => (
                <div className="h-16 rounded bg-muted" key={i} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro ao carregar agendamentos</AlertTitle>
        <AlertDescription>
          {error}
          <Button
            className="ml-4"
            onClick={refreshAppointments}
            size="sm"
            variant="outline"
          >
            Tentar novamente
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards - Based on Tavily healthcare dashboard patterns */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-muted-foreground text-sm">
              Próximos Agendamentos
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {upcomingAppointments.length}
            </div>
            <p className="text-muted-foreground text-xs">
              {upcomingAppointments.filter((apt) => apt.can_cancel).length}{' '}
              podem ser cancelados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-muted-foreground text-sm">
              Taxa de Presença
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {Math.round(100 - noShowPattern.rate)}%
            </div>
            <p className="text-muted-foreground text-xs">
              {noShowPattern.rate}% de faltas (média: 27%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-muted-foreground text-sm">
              Tempo para Cancelar
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {cancellationPolicies?.minimum_hours || 24}h
            </div>
            <p className="text-muted-foreground text-xs">
              Antecedência mínima obrigatória
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-muted-foreground text-sm">
              Histórico Total
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{pastAppointments.length}</div>
            <p className="text-muted-foreground text-xs">
              {cancellationStats.rate}% taxa de cancelamento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Policy Information Alert - Based on Exa cancellation policy patterns */}
      {cancellationPolicies && (
        <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertTitle>Política de Cancelamento</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-1 text-sm">
              <div>
                • Cancelamentos devem ser feitos com{' '}
                <strong>
                  {cancellationPolicies.minimum_hours}h de antecedência
                </strong>
              </div>
              <div>
                • Reagendamentos precisam de{' '}
                <strong>48h de antecedência</strong> para solicitação
              </div>
              {cancellationPolicies.fee_applies && (
                <div>
                  • Taxa de cancelamento tardio:{' '}
                  <strong>
                    R$ {cancellationPolicies.fee_amount.toFixed(2)}
                  </strong>
                </div>
              )}
              <div>• Exceções para emergências médicas e familiares</div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Tabs Interface */}
      <Tabs
        className="space-y-4"
        onValueChange={setActiveTab}
        value={activeTab}
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger className="flex items-center gap-2" value="upcoming">
            <Calendar className="h-4 w-4" />
            Próximos ({upcomingAppointments.length})
          </TabsTrigger>
          <TabsTrigger className="flex items-center gap-2" value="history">
            <FileText className="h-4 w-4" />
            Histórico ({pastAppointments.length})
          </TabsTrigger>
          <TabsTrigger className="flex items-center gap-2" value="status">
            <User className="h-4 w-4" />
            Status & Analytics
          </TabsTrigger>
        </TabsList>

        {/* Upcoming Appointments Tab */}
        <TabsContent className="space-y-4" value="upcoming">
          <Card>
            <CardHeader>
              <CardTitle>Próximos Agendamentos</CardTitle>
              <CardDescription>
                Gerencie seus agendamentos futuros. Cancele ou reagende seguindo
                as políticas da clínica.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UpcomingAppointments
                appointments={upcomingAppointments}
                cancellationPolicies={cancellationPolicies}
                onCancel={(id: string) => handleAppointmentAction('cancel', id)}
                onReschedule={(id: string) =>
                  handleAppointmentAction('reschedule', id)
                }
                onView={(id: string) => handleAppointmentAction('view', id)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appointment History Tab */}
        <TabsContent className="space-y-4" value="history">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Agendamentos</CardTitle>
              <CardDescription>
                Visualize seus agendamentos passados, cancelados e completados.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AppointmentHistory
                appointments={pastAppointments}
                onView={(id: string) => handleAppointmentAction('view', id)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Status & Analytics Tab */}
        <TabsContent className="space-y-4" value="status">
          <AppointmentStatusTracker
            cancellationPolicies={cancellationPolicies}
            cancellationStats={cancellationStats}
            noShowPattern={noShowPattern}
            pastCount={pastAppointments.length}
            upcomingCount={upcomingAppointments.length}
          />
        </TabsContent>
      </Tabs>

      {/* Modals for Actions */}
      {selectedAppointmentId && showCancellationDialog && (
        <AppointmentCancellation
          appointment={upcomingAppointments.find(
            (apt) => apt.id === selectedAppointmentId,
          )}
          appointmentId={selectedAppointmentId}
          cancellationPolicies={cancellationPolicies}
          onConfirm={handleCancellationComplete}
          onOpenChange={setShowCancellationDialog}
          open={showCancellationDialog}
        />
      )}

      {selectedAppointmentId && showRescheduleDialog && (
        <RescheduleRequest
          appointment={upcomingAppointments.find(
            (apt) => apt.id === selectedAppointmentId,
          )}
          appointmentId={selectedAppointmentId}
          onConfirm={handleRescheduleComplete}
          onOpenChange={setShowRescheduleDialog}
          open={showRescheduleDialog}
        />
      )}
    </div>
  );
}

export default AppointmentManagement;

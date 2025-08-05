"use client";

import type { AlertCircle, Calendar, Clock, FileText, TrendingUp, User } from "lucide-react";
import type { useState } from "react";
import type { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { usePatientAppointments } from "@/hooks/patient/usePatientAppointments";
import type { AppointmentCancellation } from "./AppointmentCancellation";
import type { AppointmentHistory } from "./AppointmentHistory";
import type { AppointmentStatusTracker } from "./AppointmentStatusTracker";
import type { RescheduleRequest } from "./RescheduleRequest";
import type { UpcomingAppointments } from "./UpcomingAppointments";

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

interface AppointmentManagementProps {
  /**
   * Optional callback when appointment actions are performed
   * Useful for parent components to track patient engagement
   */
  onAppointmentAction?: (action: "cancel" | "reschedule" | "view", appointmentId: string) => void;
}

export function AppointmentManagement({ onAppointmentAction }: AppointmentManagementProps) {
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

  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [showCancellationDialog, setShowCancellationDialog] = useState(false);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming");

  // Analytics data based on research insights
  const noShowPattern = getNoShowPattern();
  const cancellationStats = getCancellationStats();

  // Handle appointment actions with analytics tracking
  const handleAppointmentAction = (
    action: "cancel" | "reschedule" | "view",
    appointmentId: string,
  ) => {
    setSelectedAppointmentId(appointmentId);

    switch (action) {
      case "cancel":
        setShowCancellationDialog(true);
        break;
      case "reschedule":
        setShowRescheduleDialog(true);
        break;
      case "view":
        // Navigate to detailed view or expand
        break;
    }

    onAppointmentAction?.(action, appointmentId);
  };

  // Handle cancellation completion
  const handleCancellationComplete = async (appointmentId: string, reason: string) => {
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
    const success = await requestReschedule(appointmentId, newDate, newTime, reason);
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardContent className="pt-6">
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded" />
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
          <Button variant="outline" size="sm" className="ml-4" onClick={refreshAppointments}>
            Tentar novamente
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards - Based on Tavily healthcare dashboard patterns */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Próximos Agendamentos
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
            <p className="text-xs text-muted-foreground">
              {upcomingAppointments.filter((apt) => apt.can_cancel).length} podem ser cancelados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taxa de Presença
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(100 - noShowPattern.rate)}%</div>
            <p className="text-xs text-muted-foreground">
              {noShowPattern.rate}% de faltas (média: 27%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tempo para Cancelar
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cancellationPolicies?.minimum_hours || 24}h</div>
            <p className="text-xs text-muted-foreground">Antecedência mínima obrigatória</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Histórico Total
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pastAppointments.length}</div>
            <p className="text-xs text-muted-foreground">
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
                • Cancelamentos devem ser feitos com{" "}
                <strong>{cancellationPolicies.minimum_hours}h de antecedência</strong>
              </div>
              <div>
                • Reagendamentos precisam de <strong>48h de antecedência</strong> para solicitação
              </div>
              {cancellationPolicies.fee_applies && (
                <div>
                  • Taxa de cancelamento tardio:{" "}
                  <strong>R$ {cancellationPolicies.fee_amount.toFixed(2)}</strong>
                </div>
              )}
              <div>• Exceções para emergências médicas e familiares</div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Tabs Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Próximos ({upcomingAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Histórico ({pastAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="status" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Status & Analytics
          </TabsTrigger>
        </TabsList>

        {/* Upcoming Appointments Tab */}
        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Próximos Agendamentos</CardTitle>
              <CardDescription>
                Gerencie seus agendamentos futuros. Cancele ou reagende seguindo as políticas da
                clínica.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UpcomingAppointments
                appointments={upcomingAppointments}
                onCancel={(id: string) => handleAppointmentAction("cancel", id)}
                onReschedule={(id: string) => handleAppointmentAction("reschedule", id)}
                onView={(id: string) => handleAppointmentAction("view", id)}
                cancellationPolicies={cancellationPolicies}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appointment History Tab */}
        <TabsContent value="history" className="space-y-4">
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
                onView={(id: string) => handleAppointmentAction("view", id)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Status & Analytics Tab */}
        <TabsContent value="status" className="space-y-4">
          <AppointmentStatusTracker
            upcomingCount={upcomingAppointments.length}
            pastCount={pastAppointments.length}
            noShowPattern={noShowPattern}
            cancellationStats={cancellationStats}
            cancellationPolicies={cancellationPolicies}
          />
        </TabsContent>
      </Tabs>

      {/* Modals for Actions */}
      {selectedAppointmentId && showCancellationDialog && (
        <AppointmentCancellation
          appointmentId={selectedAppointmentId}
          appointment={upcomingAppointments.find((apt) => apt.id === selectedAppointmentId)}
          open={showCancellationDialog}
          onOpenChange={setShowCancellationDialog}
          onConfirm={handleCancellationComplete}
          cancellationPolicies={cancellationPolicies}
        />
      )}

      {selectedAppointmentId && showRescheduleDialog && (
        <RescheduleRequest
          appointmentId={selectedAppointmentId}
          appointment={upcomingAppointments.find((apt) => apt.id === selectedAppointmentId)}
          open={showRescheduleDialog}
          onOpenChange={setShowRescheduleDialog}
          onConfirm={handleRescheduleComplete}
        />
      )}
    </div>
  );
}

export default AppointmentManagement;

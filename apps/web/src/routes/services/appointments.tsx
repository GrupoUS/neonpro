import { AppointmentBooking } from "@/components/appointment-booking";
import { type EventColor } from "@/components/event-calendar";
import { Experiment06CalendarIntegration } from "@/components/calendar/experiment-06-integration";
import {
  useAppointmentRealtime,
  useAppointments,
  useCreateAppointment,
  useDeleteAppointment,
  useUpdateAppointment,
} from "@/hooks/useAppointments";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import type {
  CreateAppointmentData,
  UpdateAppointmentData,
} from "@/services/appointments.service";
import { Card, CardContent } from "@neonpro/ui";
import { Button } from "@neonpro/ui";
import { createFileRoute, Link } from "@tanstack/react-router"; // useNavigate removed
import { isAfter, isSameDay } from "date-fns";
import {
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

function AppointmentsPage() {
  const [showNewAppointment, setShowNewAppointment] = useState(false); // removed unused navigate
  const {
    /* user, */ profile,
    hasPermission,
    loading: authLoading,
  } = useAuth();
  const toast = useToast();

  // Get clinic ID from user profile
  const clinicId = profile?.clinicId || "89084c3a-9200-4058-a15a-b440d3c60687"; // Fallback for testing

  // Check permissions - handle case where profile is null
  const canViewAllAppointments = profile
    ? hasPermission("canViewAllAppointments")
    : true; // Allow access when no profile
  // const canCreateAppointments = profile ? hasPermission('canCreateAppointments') : true; // Removed top CTA, keep permission check if re-enabled later

  // Fetch appointments from database
  // For patients, we'll need to filter by patient_id in the future
  const { data: appointments, isLoading, error } = useAppointments(clinicId);

  // Build a memoized set of event time ranges for collision checks
  const appointmentRanges = useMemo(() => {
    return (appointments || []).map((a) => ({
      id: a.id,
      start: new Date(a.start),
      end: new Date(a.end),
    }));
  }, [appointments]);

  // Set up real-time updates
  useAppointmentRealtime(clinicId);

  // Mutation hooks
  const createAppointmentMutation = useCreateAppointment();
  const updateAppointmentMutation = useUpdateAppointment();
  const deleteAppointmentMutation = useDeleteAppointment();

  // Appointments statistics for overview cards
  const stats = useMemo(() => {
    const list = appointments || [];
    const now = new Date();
    const totalToday = list.filter((a) =>
      isSameDay(new Date(a.start), now),
    ).length;
    const upcoming = list.filter((a) => isAfter(new Date(a.start), now)).length;
    const completed = list.filter((a) =>
      ["completed", "done"].includes(String(a.status || "").toLowerCase()),
    ).length;
    const cancelled = list.filter((a) =>
      ["cancelled", "canceled"].includes(String(a.status || "").toLowerCase()),
    ).length;
    return { totalToday, upcoming, completed, cancelled };
  }, [appointments]);

  // New event creation is handled by EventCalendar's internal dialog.
  // We only need to handle add/update/delete callbacks from the calendar.

  const handleEventUpdate = (
    event: CalendarEvent,
    updates?: Partial<CalendarEvent>,
  ) => {
    const updateData: UpdateAppointmentData = {};

    // Use updates if provided (e.g., inline edit), otherwise use the updated event payload (e.g., DnD)
    const src = updates ?? event;

    if (src.start) updateData.startTime = src.start;
    if (src.end) updateData.endTime = src.end;
    if (src.description !== undefined) updateData.notes = src.description;

    if (!event?.id) return;
    // Skip if nothing to update
    if (Object.keys(updateData).length === 0) return;

    // Collision check (non-blocking): warn if overlapping with another appointment
    const start = updateData.startTime ?? (event.start as Date);
    const end = updateData.endTime ?? (event.end as Date);
    const overlaps = appointmentRanges.some(
      (r) => r.id !== event.id && start < r.end && end > r.start,
    );
    if (overlaps) {
      toast.info("Aviso: possível conflito de horário com outro agendamento.");
    }

    // Lightweight audit note (client-side). In a full implementation, send to an audit endpoint.
    try {
      console.debug("[Audit] appointment_update", {
        action: "appointment_update",
        appointmentId: event.id,
        clinicId,
        userRole: profile?.role,
        timestamp: new Date().toISOString(),
        changes: {
          startTime: updateData.startTime?.toISOString?.(),
          endTime: updateData.endTime?.toISOString?.(),
          notes: updateData.notes,
        },
      });
    } catch {}

    updateAppointmentMutation.mutate({
      appointmentId: event.id,
      updates: updateData,
      clinicId,
    });
  };

  const handleEventDelete = (eventId: string) => {
    deleteAppointmentMutation.mutate({
      appointmentId: eventId,
      clinicId,
      reason: "Cancelled from calendar",
    });
  };

  const handleBookingComplete = (booking: {
    date: Date;
    time: string;
    patientId: string;
    patientName: string;
    serviceTypeId: string;
    serviceName: string;
    professionalId: string;
    notes?: string;
  }) => {
    // Parse time and create start/end dates
    const [hours, minutes] = booking.time.split(":").map(Number);
    const startTime = new Date(booking.date);
    startTime.setHours(hours, minutes, 0, 0);

    const endTime = new Date(startTime);
    endTime.setHours(hours + 1, minutes, 0, 0); // Default 1 hour duration

    // In a real implementation, you'd need to:
    // 1. Look up patient ID by name or create new patient
    // 2. Look up service type ID by service name
    // 3. Get professional ID from current user or selection

    // Use the actual IDs from the booking form
    const appointmentData: CreateAppointmentData = {
      patientId: booking.patientId || "placeholder-patient-id", // Will need patient creation if empty
      professionalId: booking.professionalId,
      serviceTypeId: booking.serviceTypeId,
      startTime,
      endTime,
      notes: booking.notes,
      status: "scheduled",
    };

    createAppointmentMutation.mutate(
      { data: appointmentData, clinicId },
      {
        onSuccess: () => {
          setShowNewAppointment(false);
        },
      },
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 sm:mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Consultas hoje</p>
                <p className="text-2xl font-bold">
                  {stats.totalToday.toLocaleString("pt-BR")}
                </p>
                <p className="text-xs text-muted-foreground">
                  Atualizado em tempo real
                </p>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <CalendarCheck className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Próximas consultas
                </p>
                <p className="text-2xl font-bold">
                  {stats.upcoming.toLocaleString("pt-BR")}
                </p>
                <p className="text-xs text-muted-foreground">
                  Agendadas no futuro
                </p>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <CalendarClock className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Concluídas</p>
                <p className="text-2xl font-bold">
                  {stats.completed.toLocaleString("pt-BR")}
                </p>
                <p className="text-xs text-muted-foreground">
                  Hoje e anteriores
                </p>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <CheckCircle2 className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Canceladas</p>
                <p className="text-2xl font-bold">
                  {stats.cancelled.toLocaleString("pt-BR")}
                </p>
                <p className="text-xs text-muted-foreground">Período atual</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <XCircle className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4 sm:p-5">
          {(authLoading || isLoading) && (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-sm text-muted-foreground">
                  {authLoading
                    ? "Carregando perfil do usuário..."
                    : "Carregando agendamentos..."}
                </p>
                {authLoading && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Se esta tela persistir, recarregue a página
                  </p>
                )}
              </div>
            </div>
          )}

          {!authLoading &&
            !canViewAllAppointments &&
            profile &&
            profile.role !== "patient" && (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <p className="text-lg font-semibold text-destructive">
                    Acesso Negado
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Você não tem permissão para visualizar agendamentos.
                  </p>
                </div>
              </div>
            )}
          {error && (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <p className="text-lg font-semibold text-destructive mb-2">
                  Erro ao carregar agendamentos
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Ocorreu um problema ao conectar com o servidor. Tente
                  novamente.
                </p>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="mr-2"
                >
                  Recarregar Página
                </Button>
                <Button variant="ghost" onClick={() => window.history.back()}>
                  Voltar
                </Button>
              </div>
            </div>
          )}
          {!authLoading &&
            !isLoading &&
            !error &&
            (canViewAllAppointments ||
              !profile ||
              profile.role === "patient") &&
            ((appointments?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum agendamento encontrado
              </p>
            ) : (
              <>
                <div className="h-[calc(100vh-340px)] min-h-[520px] max-h-[82vh]">
                  <Experiment06CalendarIntegration
                    appointments={appointments || []}
                    onEventUpdate={handleEventUpdate}
                    onEventDelete={handleEventDelete}
                    onNewConsultation={() => setShowNewAppointment(true)}
                    className="h-full"
                  />
                </div>
              </>
            ))}
        </CardContent>
      </Card>

      <div className="mt-4">
        <Link
          to="/dashboard"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Voltar ao Dashboard
        </Link>
      </div>

      {showNewAppointment && (
        <AppointmentBooking
          open={showNewAppointment}
          onOpenChange={setShowNewAppointment}
          clinicId={clinicId}
          onBookingComplete={handleBookingComplete}
        />
      )}
    </div>
  );
}

export const Route = createFileRoute("/services/appointments")({
  component: AppointmentsPage,
});

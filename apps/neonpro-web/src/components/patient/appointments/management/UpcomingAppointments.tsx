"use client";

import type { format, parseISO } from "date-fns";
import type { ptBR } from "date-fns/locale";
import type {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  RotateCcw,
  User,
  XCircle,
} from "lucide-react";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Card, CardContent } from "@/components/ui/card";
import type {
  CancellationPolicies,
  PatientAppointment,
} from "@/hooks/patient/usePatientAppointments";

/**
 * Upcoming Appointments Component for NeonPro
 *
 * Based on VIBECODE MCP Research:
 * - Context7: React component patterns with accessibility
 * - Tavily: Healthcare appointment display best practices
 * - Exa: Policy enforcement UI patterns (24-48h rules)
 */

interface UpcomingAppointmentsProps {
  appointments: PatientAppointment[];
  onCancel: (appointmentId: string) => void;
  onReschedule: (appointmentId: string) => void;
  onView: (appointmentId: string) => void;
  cancellationPolicies: CancellationPolicies | null;
}

export function UpcomingAppointments({
  appointments,
  onCancel,
  onReschedule,
  onView,
  cancellationPolicies,
}: UpcomingAppointmentsProps) {
  if (appointments.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          Nenhum agendamento próximo
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Você não tem agendamentos futuros. Que tal agendar um novo procedimento?
        </p>
      </div>
    );
  }

  const getStatusBadge = (appointment: PatientAppointment) => {
    switch (appointment.status) {
      case "confirmed":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
            Confirmado
          </Badge>
        );
      case "rescheduled":
        return <Badge variant="secondary">Reagendado</Badge>;
      default:
        return <Badge variant="outline">{appointment.status}</Badge>;
    }
  };

  const getUrgencyIndicator = (hoursUntil: number) => {
    if (hoursUntil <= 24) {
      return (
        <div title="Menos de 24h - não pode cancelar">
          <AlertTriangle className="h-4 w-4 text-orange-500" />
        </div>
      );
    } else if (hoursUntil <= 48) {
      return (
        <div title="Menos de 48h - não pode reagendar">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
        </div>
      );
    }
    return (
      <div title="Pode cancelar e reagendar">
        <CheckCircle className="h-4 w-4 text-green-500" />
      </div>
    );
  };

  const formatAppointmentDateTime = (date: string, time: string) => {
    try {
      const dateTime = parseISO(`${date}T${time}`);
      return {
        date: format(dateTime, "EEEE, dd MMMM yyyy", { locale: ptBR }),
        time: format(dateTime, "HH:mm", { locale: ptBR }),
      };
    } catch (error) {
      return { date: date, time: time };
    }
  };

  // Group appointments by date for better organization
  const groupedAppointments = appointments.reduce(
    (groups, appointment) => {
      const date = appointment.appointment_date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(appointment);
      return groups;
    },
    {} as Record<string, PatientAppointment[]>,
  );

  // Sort dates
  const sortedDates = Object.keys(groupedAppointments).sort();

  return (
    <div className="space-y-4">
      {sortedDates.map((date) => {
        const dayAppointments = groupedAppointments[date];
        const formattedDate = formatAppointmentDateTime(date, "00:00").date;

        return (
          <div key={date} className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {formattedDate}
            </div>

            {dayAppointments.map((appointment) => {
              const { time } = formatAppointmentDateTime(
                appointment.appointment_date,
                appointment.appointment_time,
              );

              return (
                <Card key={appointment.id} className="transition-shadow hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        {/* Header with service and status */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              {getUrgencyIndicator(appointment.hours_until_appointment)}
                              <h3 className="font-semibold text-lg">{appointment.service_name}</h3>
                            </div>
                            {getStatusBadge(appointment)}
                          </div>
                        </div>

                        {/* Time and duration */}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{time}</span>
                          </div>
                          <div>Duração: {appointment.service_duration} min</div>
                          <div>
                            {appointment.hours_until_appointment > 0
                              ? `Em ${appointment.hours_until_appointment}h`
                              : `${Math.abs(appointment.hours_until_appointment)}h atrás`}
                          </div>
                        </div>

                        {/* Professional info */}
                        {appointment.professional_name && (
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{appointment.professional_name}</span>
                          </div>
                        )}

                        {/* Notes */}
                        {appointment.notes && (
                          <div className="bg-muted/30 rounded-md p-3 text-sm">
                            <strong>Observações:</strong> {appointment.notes}
                          </div>
                        )}

                        {/* Policy warnings */}
                        <div className="space-y-2">
                          {!appointment.can_cancel && appointment.hours_until_appointment < 24 && (
                            <div className="flex items-start gap-2 text-xs text-orange-600 bg-orange-50 dark:bg-orange-950 p-2 rounded-md">
                              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                              <div>
                                <strong>Cancelamento não permitido</strong>
                                <br />
                                Resta{appointment.hours_until_appointment > 1 ? "m" : ""} apenas{" "}
                                {appointment.hours_until_appointment}h. Mínimo necessário:{" "}
                                {cancellationPolicies?.minimum_hours || 24}h.
                              </div>
                            </div>
                          )}

                          {!appointment.can_reschedule &&
                            appointment.hours_until_appointment < 48 &&
                            appointment.can_cancel && (
                              <div className="flex items-start gap-2 text-xs text-yellow-600 bg-yellow-50 dark:bg-yellow-950 p-2 rounded-md">
                                <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                <div>
                                  <strong>Reagendamento não permitido</strong>
                                  <br />
                                  Solicitações de reagendamento precisam de 48h de antecedência.
                                </div>
                              </div>
                            )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onView(appointment.id)}
                          className="text-xs"
                        >
                          Detalhes
                        </Button>

                        {appointment.can_reschedule && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onReschedule(appointment.id)}
                            className="text-xs"
                          >
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Reagendar
                          </Button>
                        )}

                        {appointment.can_cancel && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => onCancel(appointment.id)}
                            className="text-xs"
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Cancelar
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        );
      })}

      {/* Policy information footer */}
      {cancellationPolicies && (
        <div className="mt-6 p-4 bg-muted/30 rounded-lg text-xs text-muted-foreground">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <strong>Cancelamento:</strong> {cancellationPolicies.minimum_hours}h de antecedência
              {cancellationPolicies.fee_applies && (
                <div>
                  Taxa por cancelamento tardio: R$ {cancellationPolicies.fee_amount.toFixed(2)}
                </div>
              )}
            </div>
            <div>
              <strong>Reagendamento:</strong> 48h de antecedência para solicitação
              <div>Exceções para emergências médicas</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

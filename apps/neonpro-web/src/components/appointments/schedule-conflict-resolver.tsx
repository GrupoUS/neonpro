"use client";

import type {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle,
  Clock,
  RotateCcw,
  User,
  XCircle,
} from "lucide-react";
import moment from "moment";
import React, { useMemo, useState } from "react";
import type { AppointmentEvent, Professional } from "@/app/appointments/page";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Separator } from "@/components/ui/separator";
import type { cn } from "@/lib/utils";
import "moment/locale/pt-br";

moment.locale("pt-br");

interface ScheduleConflictResolverProps {
  conflicts: AppointmentEvent[];
  isOpen: boolean;
  onResolve: (resolvedAppointments: AppointmentEvent[]) => void;
  onCancel: () => void;
  professionals: Professional[];
}

type ConflictResolution = {
  appointmentId: string;
  action: "keep" | "move" | "cancel" | "resize";
  newStart?: Date;
  newEnd?: Date;
  reason?: string;
};

// Service type colors
const serviceColors = {
  consultation: "bg-blue-500 text-blue-50",
  botox: "bg-violet-500 text-violet-50",
  fillers: "bg-emerald-500 text-emerald-50",
  procedure: "bg-amber-500 text-amber-50",
};

export function ScheduleConflictResolver({
  conflicts,
  isOpen,
  onResolve,
  onCancel,
  professionals,
}: ScheduleConflictResolverProps) {
  const [resolutions, setResolutions] = useState<ConflictResolution[]>([]);
  const [selectedConflictId, setSelectedConflictId] = useState<string | null>(null);

  // Group conflicts by professional and time overlap
  const conflictGroups = useMemo(() => {
    const groups: Array<{
      professionalId: string;
      professionalName: string;
      timeRange: { start: Date; end: Date };
      appointments: AppointmentEvent[];
    }> = [];

    conflicts.forEach((appointment) => {
      const professional = professionals.find((p) => p.id === appointment.professionalId);

      // Find if there's an existing group for this professional with overlapping time
      const existingGroup = groups.find(
        (group) =>
          group.professionalId === appointment.professionalId &&
          ((appointment.start >= group.timeRange.start &&
            appointment.start < group.timeRange.end) ||
            (appointment.end > group.timeRange.start && appointment.end <= group.timeRange.end) ||
            (appointment.start <= group.timeRange.start && appointment.end >= group.timeRange.end)),
      );

      if (existingGroup) {
        existingGroup.appointments.push(appointment);
        // Expand time range if necessary
        if (appointment.start < existingGroup.timeRange.start) {
          existingGroup.timeRange.start = appointment.start;
        }
        if (appointment.end > existingGroup.timeRange.end) {
          existingGroup.timeRange.end = appointment.end;
        }
      } else {
        groups.push({
          professionalId: appointment.professionalId,
          professionalName: professional?.name || "Profissional não encontrado",
          timeRange: { start: appointment.start, end: appointment.end },
          appointments: [appointment],
        });
      }
    });

    return groups;
  }, [conflicts, professionals]);

  // Generate suggested resolutions
  const generateSuggestions = (conflictGroup: (typeof conflictGroups)[0]) => {
    const suggestions: ConflictResolution[] = [];
    const sortedAppointments = conflictGroup.appointments.sort(
      (a, b) => a.start.getTime() - b.start.getTime(),
    );

    sortedAppointments.forEach((appointment, index) => {
      if (index === 0) {
        // Keep the first appointment as is
        suggestions.push({
          appointmentId: appointment.id,
          action: "keep",
          reason: "Primeiro agendamento mantido",
        });
      } else {
        // Try to move subsequent appointments
        const previousAppointment = sortedAppointments[index - 1];
        const suggestedStart = moment(previousAppointment.end).add(15, "minutes").toDate();
        const duration = moment(appointment.end).diff(moment(appointment.start), "minutes");
        const suggestedEnd = moment(suggestedStart).add(duration, "minutes").toDate();

        // Check if the suggested time is within business hours
        if (suggestedEnd.getHours() < 18) {
          suggestions.push({
            appointmentId: appointment.id,
            action: "move",
            newStart: suggestedStart,
            newEnd: suggestedEnd,
            reason: `Reagendar para ${moment(suggestedStart).format("HH:mm")} - ${moment(suggestedEnd).format("HH:mm")}`,
          });
        } else {
          // Suggest moving to next available day
          const nextDay = moment(appointment.start).add(1, "day").hour(9).minute(0).toDate();
          suggestions.push({
            appointmentId: appointment.id,
            action: "move",
            newStart: nextDay,
            newEnd: moment(nextDay).add(duration, "minutes").toDate(),
            reason: "Reagendar para próximo dia útil",
          });
        }
      }
    });

    return suggestions;
  };

  // Initialize resolutions when conflicts change
  React.useEffect(() => {
    if (conflicts.length > 0) {
      const initialResolutions: ConflictResolution[] = [];

      conflictGroups.forEach((group) => {
        const suggestions = generateSuggestions(group);
        initialResolutions.push(...suggestions);
      });

      setResolutions(initialResolutions);
    }
  }, [conflicts, conflictGroups]);

  // Handle resolution change
  const updateResolution = (appointmentId: string, resolution: Partial<ConflictResolution>) => {
    setResolutions((prev) =>
      prev.map((r) => (r.appointmentId === appointmentId ? { ...r, ...resolution } : r)),
    );
  };

  // Handle resolve conflicts
  const handleResolve = () => {
    const resolvedAppointments: AppointmentEvent[] = [];

    conflicts.forEach((appointment) => {
      const resolution = resolutions.find((r) => r.appointmentId === appointment.id);

      if (!resolution || resolution.action === "cancel") {
        // Skip cancelled appointments
        return;
      }

      if (resolution.action === "keep") {
        resolvedAppointments.push(appointment);
      } else if (resolution.action === "move" && resolution.newStart && resolution.newEnd) {
        resolvedAppointments.push({
          ...appointment,
          start: resolution.newStart,
          end: resolution.newEnd,
        });
      } else if (resolution.action === "resize" && resolution.newStart && resolution.newEnd) {
        resolvedAppointments.push({
          ...appointment,
          start: resolution.newStart,
          end: resolution.newEnd,
        });
      }
    });

    onResolve(resolvedAppointments);
  };

  if (!isOpen || conflicts.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <span>Conflitos de Agendamento Detectados</span>
          </DialogTitle>
          <DialogDescription>
            {conflicts.length} consulta{conflicts.length > 1 ? "s" : ""} em conflito. Escolha como
            resolver cada situação.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {conflictGroups.map((group, groupIndex) => (
            <Card key={`${group.professionalId}-${groupIndex}`}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{group.professionalName}</span>
                  </div>
                  <Badge variant="secondary">
                    {moment(group.timeRange.start).format("DD/MM HH:mm")} -{" "}
                    {moment(group.timeRange.end).format("HH:mm")}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {group.appointments.map((appointment, index) => {
                    const resolution = resolutions.find((r) => r.appointmentId === appointment.id);
                    const isSelected = selectedConflictId === appointment.id;

                    return (
                      <div key={appointment.id} className="space-y-3">
                        {/* Appointment Card */}
                        <div
                          className={cn(
                            "p-4 border rounded-lg cursor-pointer transition-all",
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-muted-foreground",
                          )}
                          onClick={() => setSelectedConflictId(isSelected ? null : appointment.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Badge className={serviceColors[appointment.serviceType]}>
                                  {appointment.serviceType === "consultation"
                                    ? "Consulta"
                                    : appointment.serviceType === "botox"
                                      ? "Botox"
                                      : appointment.serviceType === "fillers"
                                        ? "Preenchimento"
                                        : "Procedimento"}
                                </Badge>
                                <span className="font-medium">{appointment.patientName}</span>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-3 w-3" />
                                  <span>
                                    {moment(appointment.start).format("HH:mm")} -{" "}
                                    {moment(appointment.end).format("HH:mm")}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{moment(appointment.start).format("DD/MM/YYYY")}</span>
                                </div>
                              </div>
                            </div>

                            {/* Resolution Status */}
                            <div className="flex items-center space-x-2">
                              {resolution?.action === "keep" && (
                                <Badge variant="default" className="bg-green-500">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Manter
                                </Badge>
                              )}
                              {resolution?.action === "move" && (
                                <Badge variant="default" className="bg-blue-500">
                                  <ArrowRight className="h-3 w-3 mr-1" />
                                  Reagendar
                                </Badge>
                              )}
                              {resolution?.action === "cancel" && (
                                <Badge variant="destructive">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Cancelar
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Resolution Details */}
                          {resolution && resolution.action === "move" && resolution.newStart && (
                            <div className="mt-3 pt-3 border-t">
                              <div className="flex items-center space-x-2 text-sm">
                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                <span className="text-muted-foreground">Novo horário:</span>
                                <span className="font-medium">
                                  {moment(resolution.newStart).format("DD/MM HH:mm")} -{" "}
                                  {moment(resolution.newEnd).format("HH:mm")}
                                </span>
                              </div>
                              {resolution.reason && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {resolution.reason}
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Resolution Options */}
                        {isSelected && (
                          <div className="pl-4 border-l-2 border-primary/20">
                            <h4 className="font-medium mb-3">Opções de Resolução:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                              <Button
                                variant={resolution?.action === "keep" ? "default" : "outline"}
                                size="sm"
                                onClick={() => updateResolution(appointment.id, { action: "keep" })}
                                className="justify-start"
                              >
                                <CheckCircle className="h-3 w-3 mr-2" />
                                Manter
                              </Button>

                              <Button
                                variant={resolution?.action === "move" ? "default" : "outline"}
                                size="sm"
                                onClick={() => {
                                  const suggestions = generateSuggestions(group);
                                  const suggestion = suggestions.find(
                                    (s) => s.appointmentId === appointment.id,
                                  );
                                  if (suggestion && suggestion.action === "move") {
                                    updateResolution(appointment.id, suggestion);
                                  }
                                }}
                                className="justify-start"
                              >
                                <RotateCcw className="h-3 w-3 mr-2" />
                                Reagendar
                              </Button>

                              <Button
                                variant={
                                  resolution?.action === "cancel" ? "destructive" : "outline"
                                }
                                size="sm"
                                onClick={() =>
                                  updateResolution(appointment.id, { action: "cancel" })
                                }
                                className="justify-start"
                              >
                                <XCircle className="h-3 w-3 mr-2" />
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        )}

                        {index < group.appointments.length - 1 && <Separator />}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={handleResolve}>Aplicar Resoluções</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

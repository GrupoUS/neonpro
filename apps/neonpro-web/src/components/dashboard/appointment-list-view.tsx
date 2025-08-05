"use client";

import type { format } from "date-fns";
import type { pt } from "date-fns/locale";
import type {
  Calendar as CalendarIcon,
  CheckCircle,
  Clock,
  Edit,
  MessageCircle,
  MoreHorizontal,
  Phone,
  Trash2,
  UserCheck,
  XCircle,
} from "lucide-react";
import type { useState } from "react";
import type { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Card, CardContent } from "@/components/ui/card";
import type {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Appointment } from "@/hooks/use-appointments-manager";
import type { cn } from "@/lib/utils";

interface AppointmentListViewProps {
  appointments: Appointment[];
  onEdit?: (appointment: Appointment) => void;
  onCancel?: (appointmentId: string, reason?: string) => void;
  onConfirm?: (appointmentId: string) => void;
  onReschedule?: (appointment: Appointment) => void;
  onMarkCompleted?: (appointmentId: string) => void;
  onMarkNoShow?: (appointmentId: string) => void;
  onContact?: (appointment: Appointment) => void;
  loading?: boolean;
  className?: string;
}

const statusConfig = {
  pending: {
    label: "Pendente",
    variant: "secondary" as const,
    icon: Clock,
    className: "text-yellow-600 bg-yellow-50 border-yellow-200",
  },
  confirmed: {
    label: "Confirmado",
    variant: "default" as const,
    icon: CheckCircle,
    className: "text-blue-600 bg-blue-50 border-blue-200",
  },
  cancelled: {
    label: "Cancelado",
    variant: "destructive" as const,
    icon: XCircle,
    className: "text-red-600 bg-red-50 border-red-200",
  },
  completed: {
    label: "Concluído",
    variant: "default" as const,
    icon: CheckCircle,
    className: "text-green-600 bg-green-50 border-green-200",
  },
  no_show: {
    label: "Não Compareceu",
    variant: "destructive" as const,
    icon: XCircle,
    className: "text-red-600 bg-red-50 border-red-200",
  },
  rescheduled: {
    label: "Reagendado",
    variant: "secondary" as const,
    icon: CalendarIcon,
    className: "text-purple-600 bg-purple-50 border-purple-200",
  },
};

export function AppointmentListView({
  appointments,
  onEdit,
  onCancel,
  onConfirm,
  onReschedule,
  onMarkCompleted,
  onMarkNoShow,
  onContact,
  loading = false,
  className,
}: AppointmentListViewProps) {
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>({});

  const handleAction = async (actionId: string, action: () => Promise<void> | void) => {
    setLoadingActions((prev) => ({ ...prev, [actionId]: true }));
    try {
      await action();
    } catch (error) {
      console.error("Error executing action:", error);
    } finally {
      setLoadingActions((prev) => ({ ...prev, [actionId]: false }));
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (dateTime: string) => {
    return format(new Date(dateTime), "HH:mm", { locale: pt });
  };

  const formatDate = (dateTime: string) => {
    return format(new Date(dateTime), "dd/MM/yyyy", { locale: pt });
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (appointments.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <div className="flex flex-col items-center space-y-4">
            <CalendarIcon className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="font-semibold">Nenhum agendamento encontrado</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Não há agendamentos que correspondam aos filtros selecionados.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Paciente</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Horário</TableHead>
              <TableHead>Serviço</TableHead>
              <TableHead>Profissional</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((appointment) => {
              const statusInfo = statusConfig[appointment.status];
              const StatusIcon = statusInfo.icon;

              return (
                <TableRow key={appointment.id} className="group hover:bg-muted/50">
                  {/* Patient */}
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={appointment.patient.avatar_url}
                          alt={appointment.patient.full_name}
                        />
                        <AvatarFallback className="text-xs">
                          {getInitials(appointment.patient.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{appointment.patient.full_name}</p>
                        {appointment.patient.phone && (
                          <p className="text-xs text-muted-foreground">
                            {appointment.patient.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Date */}
                  <TableCell>{formatDate(appointment.date_time)}</TableCell>

                  {/* Time */}
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {formatTime(appointment.date_time)}
                    </div>
                  </TableCell>

                  {/* Service */}
                  <TableCell>
                    <div>
                      <p className="font-medium">{appointment.service.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {appointment.service.duration}min • R$ {appointment.service.price}
                      </p>
                    </div>
                  </TableCell>

                  {/* Professional */}
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={appointment.professional?.avatar_url}
                          alt={appointment.professional?.full_name}
                        />
                        <AvatarFallback className="text-xs">
                          {appointment.professional?.full_name
                            ? getInitials(appointment.professional.full_name)
                            : "N/A"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">
                        {appointment.professional?.full_name || "Não atribuído"}
                      </span>
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge
                      variant={statusInfo.variant}
                      className={cn("flex items-center gap-1", statusInfo.className)}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {statusInfo.label}
                    </Badge>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        {/* Edit */}
                        <DropdownMenuItem
                          onClick={() => onEdit?.(appointment)}
                          disabled={loadingActions[`edit-${appointment.id}`]}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>

                        {/* Quick Actions based on status */}
                        {appointment.status === "pending" && (
                          <>
                            <DropdownMenuItem
                              onClick={() =>
                                handleAction(`confirm-${appointment.id}`, () =>
                                  onConfirm?.(appointment.id),
                                )
                              }
                              disabled={loadingActions[`confirm-${appointment.id}`]}
                            >
                              <UserCheck className="h-4 w-4 mr-2" />
                              Confirmar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onReschedule?.(appointment)}
                              disabled={loadingActions[`reschedule-${appointment.id}`]}
                            >
                              <CalendarIcon className="h-4 w-4 mr-2" />
                              Reagendar
                            </DropdownMenuItem>
                          </>
                        )}

                        {appointment.status === "confirmed" && (
                          <>
                            <DropdownMenuItem
                              onClick={() =>
                                handleAction(`complete-${appointment.id}`, () =>
                                  onMarkCompleted?.(appointment.id),
                                )
                              }
                              disabled={loadingActions[`complete-${appointment.id}`]}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Marcar Concluído
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleAction(`no-show-${appointment.id}`, () =>
                                  onMarkNoShow?.(appointment.id),
                                )
                              }
                              disabled={loadingActions[`no-show-${appointment.id}`]}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Marcar Falta
                            </DropdownMenuItem>
                          </>
                        )}

                        <DropdownMenuSeparator />

                        {/* Contact Actions */}
                        {appointment.patient.phone && (
                          <DropdownMenuItem onClick={() => onContact?.(appointment)}>
                            <Phone className="h-4 w-4 mr-2" />
                            Contatar
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuItem onClick={() => onContact?.(appointment)}>
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Enviar Mensagem
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        {/* Cancel */}
                        {!["cancelled", "completed", "no_show"].includes(appointment.status) && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleAction(`cancel-${appointment.id}`, () =>
                                onCancel?.(appointment.id),
                              )
                            }
                            disabled={loadingActions[`cancel-${appointment.id}`]}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Cancelar
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

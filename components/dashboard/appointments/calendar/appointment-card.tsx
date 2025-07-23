"use client";

import type { AppointmentWithRelations } from "@/app/lib/types/appointments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Clock,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  Stethoscope,
  User,
  User2,
} from "lucide-react";
import React from "react";

interface AppointmentCardProps {
  appointment: AppointmentWithRelations;
  onClick?: () => void;
  variant?: "default" | "compact" | "grid";
  showActions?: boolean;
  showPatient?: boolean;
  showProfessional?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onCancel?: () => void;
  onConfirm?: () => void;
  onComplete?: () => void;
}

const getStatusInfo = (status: string) => {
  const statusMap = {
    scheduled: { label: "Agendado", color: "bg-blue-500 text-white" },
    confirmed: { label: "Confirmado", color: "bg-green-500 text-white" },
    in_progress: { label: "Em Andamento", color: "bg-yellow-500 text-white" },
    completed: { label: "Concluído", color: "bg-emerald-500 text-white" },
    cancelled: { label: "Cancelado", color: "bg-red-500 text-white" },
    no_show: { label: "Não Compareceu", color: "bg-gray-500 text-white" },
  };

  return (
    statusMap[status as keyof typeof statusMap] || {
      label: status,
      color: "bg-gray-500 text-white",
    }
  );
};

export function AppointmentCard({
  appointment,
  onClick,
  variant = "default",
  showActions = true,
  showPatient = true,
  showProfessional = true,
  onEdit,
  onDelete,
  onCancel,
  onConfirm,
  onComplete,
}: AppointmentCardProps) {
  const status = getStatusInfo(appointment.status);
  const startTime = new Date(appointment.start_time);
  const endTime = new Date(appointment.end_time);

  // Create comprehensive ARIA label
  const ariaLabel = [
    `Agendamento ${status.label}`,
    appointment.patient?.full_name
      ? `para ${appointment.patient.full_name}`
      : "",
    appointment.service_type?.name
      ? `serviço: ${appointment.service_type.name}`
      : "",
    appointment.professional?.full_name
      ? `com ${appointment.professional.full_name}`
      : "",
    `às ${format(startTime, "HH:mm", { locale: ptBR })}`,
    `até ${format(endTime, "HH:mm", { locale: ptBR })}`,
  ]
    .filter(Boolean)
    .join(", ");
  const duration = Math.round(
    (endTime.getTime() - startTime.getTime()) / (1000 * 60)
  );

  const handleCardClick = (e: React.MouseEvent) => {
    if (onClick && !e.defaultPrevented) {
      onClick();
    }
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  if (variant === "compact") {
    return (
      <div
        role="button"
        tabIndex={0}
        aria-label={ariaLabel}
        className={cn(
          "p-2 rounded-md border-l-4 cursor-pointer hover:shadow-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/20",
          status.color.replace("bg-", "border-l-").replace("text-white", "")
        )}
        onClick={handleCardClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleCardClick(e as any);
          }
        }}
      >
        <div className="flex flex-col gap-1">
          {/* Time */}
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs font-medium text-gray-600 whitespace-nowrap">
              {format(startTime, "HH:mm", { locale: ptBR })}
            </span>
          </div>

          {/* Patient */}
          <div className="flex items-start gap-2">
            <User2 className="h-3 w-3 mt-0.5 text-muted-foreground flex-shrink-0" />
            {showPatient && appointment.patient && (
              <span className="text-sm font-medium truncate">
                {appointment.patient.full_name}
              </span>
            )}
          </div>

          {/* Service */}
          {appointment.service_type && (
            <Badge variant="outline" className="text-xs">
              {appointment.service_type.name}
            </Badge>
          )}

          <Badge className={cn("text-xs", status.color)}>{status.label}</Badge>
        </div>
      </div>
    );
  }

  if (variant === "grid") {
    return (
      <Card
        className={cn(
          "p-3 cursor-pointer hover:shadow-md transition-shadow focus-within:ring-2 focus-within:ring-primary/20",
          status.color
            .replace("bg-", "border-l-4 border-l-")
            .replace("text-white", "")
        )}
        role="button"
        tabIndex={0}
        aria-label={ariaLabel}
        onClick={handleCardClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleCardClick(e as any);
          }
        }}
      >
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="flex justify-between items-start">
            <span className="font-medium">
              {format(startTime, "HH:mm", { locale: ptBR })} -{" "}
              {format(endTime, "HH:mm", { locale: ptBR })}
            </span>
            <Badge className={cn("text-xs", status.color)}>
              {status.label}
            </Badge>
          </div>

          {showPatient && appointment.patient && (
            <p className="font-medium text-sm truncate">
              {appointment.patient.full_name}
            </p>
          )}

          {appointment.service_type && (
            <p className="text-xs text-muted-foreground truncate">
              {appointment.service_type.name}
            </p>
          )}

          {showProfessional && appointment.professional && (
            <p className="text-xs text-muted-foreground truncate">
              {appointment.professional.full_name}
            </p>
          )}

          {showActions && (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-6 w-6 p-0 focus:ring-2 focus:ring-primary/20"
                    aria-label={`Ações para agendamento de ${
                      appointment.patient?.full_name || "paciente"
                    }`}
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {onEdit && (
                    <DropdownMenuItem
                      onClick={(e) => handleActionClick(e, onEdit)}
                    >
                      Editar
                    </DropdownMenuItem>
                  )}
                  {onConfirm && appointment.status === "scheduled" && (
                    <DropdownMenuItem
                      onClick={(e) => handleActionClick(e, onConfirm)}
                    >
                      Confirmar
                    </DropdownMenuItem>
                  )}
                  {onComplete && appointment.status === "confirmed" && (
                    <DropdownMenuItem
                      onClick={(e) => handleActionClick(e, onComplete)}
                    >
                      Concluir
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem
                      onClick={(e) => handleActionClick(e, onDelete)}
                      className="text-red-600"
                    >
                      Excluir
                    </DropdownMenuItem>
                  )}
                  {onCancel && appointment.status !== "cancelled" && (
                    <DropdownMenuItem
                      onClick={(e) => handleActionClick(e, onCancel)}
                      className="text-red-600"
                    >
                      Cancelar
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </Card>
    );
  } // Default variant (detailed card)
  return (
    <Card
      className={cn(
        "cursor-pointer hover:shadow-md transition-shadow focus-within:ring-2 focus-within:ring-primary/20",
        status.color
          .replace("bg-", "border-l-4 border-l-")
          .replace("text-white", "")
      )}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick(e as any);
        }
      }}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header with time and actions */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {format(startTime, "HH:mm", { locale: ptBR })} -{" "}
                {format(endTime, "HH:mm", { locale: ptBR })}
              </span>
              <span className="text-sm text-muted-foreground">
                ({duration} min)
              </span>
            </div>

            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`Ações para agendamento de ${
                      appointment.patient?.full_name || "paciente"
                    }`}
                    className="focus:ring-2 focus:ring-primary/20"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {onEdit && (
                    <DropdownMenuItem
                      onClick={(e) => handleActionClick(e, onEdit)}
                    >
                      Editar
                    </DropdownMenuItem>
                  )}
                  {onConfirm && appointment.status === "scheduled" && (
                    <DropdownMenuItem
                      onClick={(e) => handleActionClick(e, onConfirm)}
                    >
                      Confirmar
                    </DropdownMenuItem>
                  )}
                  {onComplete && appointment.status === "confirmed" && (
                    <DropdownMenuItem
                      onClick={(e) => handleActionClick(e, onComplete)}
                    >
                      Concluir
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem
                      onClick={(e) => handleActionClick(e, onDelete)}
                      className="text-red-600"
                    >
                      Excluir
                    </DropdownMenuItem>
                  )}
                  {onCancel && appointment.status !== "cancelled" && (
                    <DropdownMenuItem
                      onClick={(e) => handleActionClick(e, onCancel)}
                      className="text-red-600"
                    >
                      Cancelar
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Patient info */}
          {showPatient && appointment.patient && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {appointment.patient.full_name}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {appointment.patient.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {appointment.patient.phone}
                    </span>
                  )}
                  {appointment.patient.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {appointment.patient.email}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Professional info */}
          {showProfessional && appointment.professional && (
            <div className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {appointment.professional.full_name}
                </p>
                {appointment.professional.specialization && (
                  <p className="text-sm text-muted-foreground">
                    {appointment.professional.specialization}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Service info */}
          {appointment.service_type && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{appointment.service_type.name}</p>
                {appointment.service_type.description && (
                  <p className="text-sm text-muted-foreground">
                    {appointment.service_type.description}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {appointment.notes && (
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm">{appointment.notes}</p>
            </div>
          )}

          {/* Status */}
          <div className="flex justify-between items-center">
            <Badge className={cn("text-xs", status.color)}>
              {status.label}
            </Badge>
            {appointment.service_type?.price && (
              <span className="text-sm font-medium">
                R$ {appointment.service_type.price.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

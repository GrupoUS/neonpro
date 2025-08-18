import { AlertCircle, Calendar, CheckCircle, Clock, MapPin, User, X } from "lucide-react";
import * as React from "react";
import { cn } from "../utils/cn";
import { formatDate } from "../utils/formatters";
import { Avatar, AvatarFallback, AvatarImage } from "./Avatar";
import { Badge } from "./Badge";
import { Button } from "./Button";

export type AppointmentData = {
  id: string;
  patientId: string;
  patientName: string;
  patientAvatar?: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  status: "scheduled" | "confirmed" | "in-progress" | "completed" | "cancelled" | "no-show";
  type: "consultation" | "procedure" | "follow-up" | "emergency";
  practitioner?: string;
  room?: string;
  notes?: string;
  urgency?: "low" | "medium" | "high" | "urgent";
};

export type AppointmentCardProps = {
  appointment: AppointmentData;
  onView?: () => void;
  onEdit?: () => void;
  onCancel?: () => void;
  onReschedule?: () => void;
  onCheckIn?: () => void;
  onComplete?: () => void;
  showPatientInfo?: boolean;
  compact?: boolean;
  className?: string;
  onClick?: () => void;
};

// Helper function to get initials from name
const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// Helper function to format time
const formatTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Helper function to get status variant for badge
const getStatusVariant = (appointmentStatus: string) => {
  switch (appointmentStatus) {
    case "scheduled":
      return "pending";
    case "confirmed":
      return "confirmed";
    case "in-progress":
      return "processing";
    case "completed":
      return "confirmed";
    case "cancelled":
      return "cancelled";
    case "no-show":
      return "cancelled";
    default:
      return "default";
  }
};

// Helper function to get type icon
const getTypeIcon = (appointmentType: string) => {
  switch (appointmentType) {
    case "emergency":
      return <AlertCircle className="h-4 w-4" />;
    case "procedure":
      return <Calendar className="h-4 w-4" />;
    case "follow-up":
      return <Clock className="h-4 w-4" />;
    default:
      return <User className="h-4 w-4" />;
  }
};
const AppointmentCard = React.forwardRef<HTMLButtonElement, AppointmentCardProps>(
  (
    {
      appointment,
      onView,
      onEdit,
      onCancel,
      onReschedule,
      onCheckIn,
      onComplete,
      showPatientInfo = true,
      compact = false,
      className,
      onClick,
      ...props
    },
    ref,
  ) => {
    const {
      patientName,
      patientAvatar,
      title,
      description,
      startTime,
      endTime,
      status,
      type,
      practitioner,
      room,
      notes,
      urgency = "medium",
    } = appointment;

    const statusVariant = getStatusVariant(status);
    const isUrgent = urgency === "urgent" || urgency === "high";

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    const duration = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));

    const isToday = startDate.toDateString() === new Date().toDateString();
    const isPast = startDate < new Date();
    const isInProgress = status === "in-progress";

    const typeIcon = getTypeIcon(type);

    const getTypeColor = () => {
      switch (type) {
        case "emergency":
          return "urgent";
        case "procedure":
          return "processing";
        case "follow-up":
          return "pending";
        default:
          return "confirmed";
      }
    };

    const getTypeLabel = (appointmentType: string) => {
      switch (appointmentType) {
        case "consultation":
          return "Consulta";
        case "procedure":
          return "Procedimento";
        case "follow-up":
          return "Retorno";
        case "emergency":
          return "Emergência";
        default:
          return appointmentType;
      }
    };

    const getStatusLabel = (appointmentStatus: string) => {
      switch (appointmentStatus) {
        case "scheduled":
          return "Agendada";
        case "confirmed":
          return "Confirmada";
        case "in-progress":
          return "Em andamento";
        case "completed":
          return "Concluída";
        case "cancelled":
          return "Cancelada";
        case "no-show":
          return "Não compareceu";
        default:
          return appointmentStatus;
      }
    };
    return (
      <button
        className={cn(
          "w-full rounded-lg border bg-card p-4 text-left text-card-foreground transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          isInProgress && "ring-2 ring-blue-500 ring-opacity-50",
          isUrgent && "border-red-200",
          onClick && "cursor-pointer",
          className,
        )}
        onClick={onClick}
        ref={ref}
        type="button"
        {...props}
      >
        {/* Header */}
        <div className="flex items-start gap-3">
          {showPatientInfo && (
            <Avatar size={compact ? "sm" : "default"}>
              <AvatarImage alt={patientName} src={patientAvatar} />
              <AvatarFallback>{getInitials(patientName)}</AvatarFallback>
            </Avatar>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className={cn("truncate font-medium", compact ? "text-sm" : "text-base")}>
                  {showPatientInfo ? patientName : title}
                </h3>
                <p className="truncate text-muted-foreground text-sm">
                  {showPatientInfo ? title : patientName}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {isUrgent && (
                  <Badge size="sm" variant="urgent">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    Urgente
                  </Badge>
                )}
                <Badge size="sm" variant={statusVariant}>
                  {getStatusLabel(status)}
                </Badge>
              </div>
            </div>
          </div>
        </div>{" "}
        {/* Time and Type Info */}
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span
                className={cn(
                  isToday ? "font-medium text-primary" : "",
                  isPast && status === "scheduled" ? "text-red-600" : "",
                )}
              >
                {formatTime(startTime)} - {formatTime(endTime)}
              </span>
              <span className="text-muted-foreground">({duration}min)</span>
            </div>

            <div className="flex items-center gap-2">
              <Badge size="sm" variant={getTypeColor()}>
                {typeIcon}
                <span className="ml-1">{getTypeLabel(type)}</span>
              </Badge>
            </div>
          </div>

          {(practitioner || room) && (
            <div className="flex items-center gap-4 text-sm">
              {practitioner && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{practitioner}</span>
                </div>
              )}

              {room && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>Sala {room}</span>
                </div>
              )}
            </div>
          )}
        </div>
        {/* Description/Notes */}
        {!compact && (description || notes) && (
          <div className="mt-3 border-t pt-3">
            {description && <p className="mb-2 text-muted-foreground text-sm">{description}</p>}
            {notes && (
              <p className="text-muted-foreground text-xs">
                <strong>Observações:</strong> {notes}
              </p>
            )}
          </div>
        )}{" "}
        {/* Actions */}
        <div className="mt-4 flex flex-wrap gap-2 border-t pt-3">
          {status === "scheduled" && onCheckIn && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onCheckIn();
              }}
              size="sm"
              variant="confirmed"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Check-in
            </Button>
          )}

          {status === "in-progress" && onComplete && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onComplete();
              }}
              size="sm"
              variant="confirmed"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Finalizar
            </Button>
          )}

          {onView && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onView();
              }}
              size="sm"
              variant="outline"
            >
              Ver Detalhes
            </Button>
          )}

          {onEdit && status !== "completed" && status !== "cancelled" && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              size="sm"
              variant="outline"
            >
              Editar
            </Button>
          )}

          {onReschedule && status !== "completed" && status !== "cancelled" && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onReschedule();
              }}
              size="sm"
              variant="outline"
            >
              Reagendar
            </Button>
          )}

          {onCancel && status !== "completed" && status !== "cancelled" && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onCancel();
              }}
              size="sm"
              variant="destructive"
            >
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
          )}
        </div>
        {/* Date Display for Non-Today Appointments */}
        {!isToday && (
          <div className="mt-2 text-muted-foreground text-xs">{formatDate(startTime)}</div>
        )}
      </button>
    );
  },
);

AppointmentCard.displayName = "AppointmentCard";

export { AppointmentCard };

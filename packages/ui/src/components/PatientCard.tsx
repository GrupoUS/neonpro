import { AlertCircle, Calendar, Eye, MapPin, Phone } from "lucide-react";
import * as React from "react";
import { cn } from "../utils/cn";
import { formatDate, formatPhone } from "../utils/formatters";
import { Avatar, AvatarFallback, AvatarImage } from "./Avatar";
import { Badge } from "./Badge";
import { Button } from "./Button";

export type PatientData = {
  id: string;
  name: string;
  avatar?: string;
  phone?: string;
  email?: string;
  birthDate?: string;
  address?: string;
  status: "active" | "inactive" | "blocked";
  lastVisit?: string;
  nextAppointment?: string;
  urgentAlerts?: number;
  totalAppointments?: number;
  registrationDate?: string;
};

export type PatientCardProps = {
  patient: PatientData;
  onViewDetails?: () => void;
  onScheduleAppointment?: () => void;
  onCall?: (phone: string) => void;
  onEdit?: () => void;
  showActions?: boolean;
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

// Helper function to format relative time
const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Hoje";
  }
  if (diffDays === 1) {
    return "Ontem";
  }
  if (diffDays < 7) {
    return `${diffDays} dias atrás`;
  }
  if (diffDays < 30) {
    return `${Math.floor(diffDays / 7)} semanas atrás`;
  }
  return formatDate(dateString);
};

// Helper function to get status text
const getStatusText = (patientStatus: string): string => {
  if (patientStatus === "active") {
    return "Ativo";
  }
  if (patientStatus === "inactive") {
    return "Inativo";
  }
  return "Bloqueado";
};
const PatientCard = React.forwardRef<HTMLButtonElement, PatientCardProps>(
  (
    {
      patient,
      onViewDetails,
      onScheduleAppointment,
      onCall,
      onEdit,
      showActions = true,
      compact = false,
      className,
      onClick,
      ...props
    },
    ref,
  ) => {
    const {
      name,
      avatar,
      phone,
      email,
      birthDate,
      address,
      status,
      lastVisit,
      nextAppointment,
      urgentAlerts = 0,
      totalAppointments = 0,
      registrationDate,
    } = patient;

    const age = birthDate
      ? Math.floor((Date.now() - new Date(birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : null;

    const getStatusVariant = (patientStatus: string) => {
      switch (patientStatus) {
        case "active":
          return "confirmed";
        case "inactive":
          return "pending";
        case "blocked":
          return "cancelled";
        default:
          return "default";
      }
    };

    const statusVariant = getStatusVariant(status);

    return (
      <button
        className={cn(
          "w-full rounded-lg border bg-card p-4 text-left text-card-foreground transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
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
          <Avatar size={compact ? "sm" : "default"}>
            <AvatarImage alt={name} src={avatar} />
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className={cn("truncate font-medium", compact ? "text-sm" : "text-base")}>
                  {name}
                </h3>
                {age && <p className="text-muted-foreground text-sm">{age} anos</p>}
              </div>

              <div className="flex items-center gap-2">
                {urgentAlerts > 0 && (
                  <Badge size="sm" variant="urgent">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    {urgentAlerts}
                  </Badge>
                )}
                <Badge size="sm" variant={statusVariant}>
                  {getStatusText(status)}
                </Badge>
              </div>
            </div>

            {!compact && email && (
              <p className="mt-1 truncate text-muted-foreground text-sm">{email}</p>
            )}
          </div>
        </div>{" "}
        {/* Contact Info */}
        {!compact && (
          <div className="mt-3 space-y-2">
            {phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{formatPhone(phone)}</span>
                {onCall && (
                  <Button
                    className="ml-auto h-6 px-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCall(phone);
                    }}
                    size="sm"
                    variant="ghost"
                  >
                    Ligar
                  </Button>
                )}
              </div>
            )}

            {address && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{address}</span>
              </div>
            )}
          </div>
        )}
        {/* Appointment Info */}
        <div className="mt-3 space-y-2 border-t pt-3">
          {lastVisit && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Última consulta:</span>
              <span>{formatRelativeTime(lastVisit)}</span>
            </div>
          )}

          {nextAppointment && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Próxima consulta:</span>
              <span className="font-medium text-primary">{formatDate(nextAppointment)}</span>
            </div>
          )}

          {!compact && totalAppointments > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total de consultas:</span>
              <span>{totalAppointments}</span>
            </div>
          )}
        </div>{" "}
        {/* Actions */}
        {showActions && (
          <div className="mt-4 flex gap-2 border-t pt-3">
            {onViewDetails && (
              <Button
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails();
                }}
                size="sm"
                variant="outline"
              >
                <Eye className="mr-2 h-4 w-4" />
                Ver Detalhes
              </Button>
            )}

            {onScheduleAppointment && (
              <Button
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onScheduleAppointment();
                }}
                size="sm"
                variant="default"
              >
                <Calendar className="mr-2 h-4 w-4" />
                {compact ? "Agendar" : "Nova Consulta"}
              </Button>
            )}
          </div>
        )}
        {/* Registration Info */}
        {!compact && registrationDate && (
          <div className="mt-2 text-muted-foreground text-xs">
            Cadastrado em {formatDate(registrationDate)}
          </div>
        )}
      </button>
    );
  },
);

PatientCard.displayName = "PatientCard";

export { PatientCard };

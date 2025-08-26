import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  MapPin,
  XCircle,
} from "lucide-react";
import * as React from "react";
import type { PractitionerData, TreatmentData } from "../types";
import { cn } from "../utils/cn";
import { formatters } from "../utils/formatters";
import { Avatar, AvatarFallback, AvatarImage } from "./Avatar";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { ProgressBar } from "./ProgressBar";

interface TreatmentCardProps {
  treatment: TreatmentData;
  practitioner?: PractitionerData;
  showProgress?: boolean;
  showActions?: boolean;
  onView?: () => void;
  onEdit?: () => void;
  onScheduleNext?: () => void;
  onComplete?: () => void;
  onCancel?: () => void;
  onClick?: () => void;
  className?: string;
}

const statusIcons = {
  planned: Calendar,
  active: Clock,
  completed: CheckCircle,
  cancelled: XCircle,
  on_hold: AlertCircle,
};

const statusColors = {
  planned: "text-blue-600",
  active: "text-green-600",
  completed: "text-emerald-600",
  cancelled: "text-red-600",
  on_hold: "text-yellow-600",
};

const TreatmentCard = React.forwardRef<HTMLDivElement, TreatmentCardProps>(
  (
    {
      treatment,
      practitioner,
      showProgress = true,
      showActions = true,
      onView,
      onEdit,
      onScheduleNext,
      onComplete,
      onCancel,
      onClick,
      className,
      ...props
    },
    ref,
  ) => {
    const StatusIcon = statusIcons[treatment.status];
    const _statusColor = statusColors[treatment.status];

    const progress =
      treatment.sessions &&
      treatment.totalSessions &&
      treatment.completedSessions
        ? (treatment.completedSessions / treatment.totalSessions) * 100
        : 0;

    return (
      <div
        className={cn(
          "space-y-4 rounded-lg border bg-card p-6 transition-colors hover:bg-accent/50",
          onClick && "cursor-pointer",
          className,
        )}
        onClick={onClick}
        ref={ref}
        {...props}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">{treatment.name}</h3>
              <Badge
                variant={
                  treatment.status === "completed"
                    ? "confirmed"
                    : treatment.status === "active"
                      ? "default"
                      : treatment.status === "cancelled"
                        ? "destructive"
                        : "secondary"
                }
              >
                <StatusIcon className="mr-1 h-3 w-3" />
                {treatment.statusLabel || treatment.status}
              </Badge>
            </div>

            {treatment.category && (
              <p className="text-muted-foreground text-sm">
                {treatment.category}
              </p>
            )}
          </div>

          {treatment.priority && treatment.priority !== "normal" && (
            <Badge
              variant={
                treatment.priority === "high" ? "destructive" : "pending"
              }
            >
              {treatment.priority === "high" ? "Alta Prioridade" : "Moderada"}
            </Badge>
          )}
        </div>{" "}
        {/* Treatment Details */}
        <div className="space-y-3">
          {/* Sessions Progress */}
          {treatment.sessions &&
            showProgress &&
            treatment.totalSessions &&
            treatment.completedSessions !== undefined && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Progresso das Sessões
                  </span>
                  <span className="font-medium">
                    {treatment.completedSessions} de {treatment.totalSessions}
                  </span>
                </div>
                <ProgressBar
                  className="h-2"
                  value={progress}
                  variant={progress === 100 ? "success" : "default"}
                />
              </div>
            )}

          {/* Key Information */}
          <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
            {treatment.startDate && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Início: {formatters.date(treatment.startDate)}</span>
              </div>
            )}

            {treatment.nextSession && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Próxima: {formatters.date(treatment.nextSession)}</span>
              </div>
            )}

            {treatment.estimatedDuration && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Duração: {treatment.estimatedDuration}</span>
              </div>
            )}

            {treatment.location && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{treatment.location}</span>
              </div>
            )}
          </div>

          {/* Practitioner */}
          {practitioner && (
            <div className="flex items-center gap-3 rounded-md bg-muted/50 p-3">
              <Avatar size="sm">
                <AvatarImage
                  alt={practitioner.name}
                  src={practitioner.avatar}
                />
                <AvatarFallback>
                  {formatters.initials(practitioner.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-sm">{practitioner.name}</div>
                <div className="text-muted-foreground text-xs">
                  {practitioner.specialization}
                </div>
              </div>
            </div>
          )}

          {/* Treatment Notes */}
          {treatment.notes && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-medium text-sm">
                <FileText className="h-4 w-4" />
                Observações
              </div>
              <p className="rounded-md bg-muted/30 p-3 text-muted-foreground text-sm">
                {treatment.notes}
              </p>
            </div>
          )}

          {/* Treatment Outcomes (if completed) */}
          {treatment.status === "completed" && treatment.outcomes && (
            <div className="space-y-2">
              <div className="font-medium text-green-700 text-sm">
                Resultados do Tratamento
              </div>
              <div className="space-y-1">
                {treatment.outcomes.map((outcome, index) => (
                  <div className="flex items-center gap-2 text-sm" key={index}>
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span>{outcome}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>{" "}
        {/* Actions */}
        {showActions && (
          <div className="flex items-center gap-2 border-t pt-2">
            {onView && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onView();
                }}
                size="sm"
                variant="outline"
              >
                <FileText className="mr-2 h-4 w-4" />
                Ver Detalhes
              </Button>
            )}

            {treatment.status === "active" && onScheduleNext && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onScheduleNext();
                }}
                size="sm"
                variant="medical"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Próxima Sessão
              </Button>
            )}

            {treatment.status === "active" && onComplete && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onComplete();
                }}
                size="sm"
                variant="outline"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Finalizar
              </Button>
            )}

            {onEdit && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                size="sm"
                variant="ghost"
              >
                Editar
              </Button>
            )}

            {treatment.status !== "completed" &&
              treatment.status !== "cancelled" &&
              onCancel && (
                <Button
                  className="text-red-600 hover:text-red-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCancel();
                  }}
                  size="sm"
                  variant="ghost"
                >
                  Cancelar
                </Button>
              )}
          </div>
        )}
      </div>
    );
  },
);

TreatmentCard.displayName = "TreatmentCard";

export { TreatmentCard };

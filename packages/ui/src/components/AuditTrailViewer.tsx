import {
  Activity,
  Calendar,
  Download,
  Eye,
  FileText,
  Lock,
  Shield,
  User,
  UserCheck,
} from "lucide-react";
import * as React from "react";
import { cn } from "../utils/cn";
import { formatDate } from "../utils/formatters";
import { Avatar, AvatarFallback, AvatarImage } from "./Avatar";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Input } from "./Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./Select";

export type AuditEventType =
  | "login"
  | "logout"
  | "patient_view"
  | "patient_edit"
  | "patient_create"
  | "patient_delete"
  | "appointment_view"
  | "appointment_create"
  | "appointment_edit"
  | "appointment_cancel"
  | "treatment_view"
  | "treatment_edit"
  | "document_view"
  | "document_download"
  | "consent_given"
  | "consent_withdrawn"
  | "data_export"
  | "data_deletion"
  | "backup_access"
  | "system_config"
  | "emergency_access";

export type AuditSeverity = "low" | "medium" | "high" | "critical";

export interface AuditEvent {
  id: string;
  timestamp: Date;
  eventType: AuditEventType;
  severity: AuditSeverity;
  userId: string;
  userName: string;
  userRole: string;
  userAvatar?: string;
  patientId?: string;
  patientName?: string;
  resourceId?: string;
  resourceType?: string;
  action: string;
  description: string;
  ipAddress: string;
  userAgent?: string;
  location?: string;
  success: boolean;
  errorMessage?: string;
  dataAccessed?: string[];
  consentStatus?: "granted" | "required" | "withdrawn";
  lgpdBasis?: string;
  metadata?: Record<string, unknown>;
}

export interface AuditTrailViewerProps {
  /**
   * Array of audit events to display
   */
  events: AuditEvent[];
  /**
   * Loading state
   */
  loading?: boolean;
  /**
   * Error state
   */
  error?: string;
  /**
   * Filter by patient ID (for patient-specific audit logs)
   */
  patientId?: string;
  /**
   * Filter by event type
   */
  eventTypeFilter?: AuditEventType[];
  /**
   * Filter by severity
   */
  severityFilter?: AuditSeverity[];
  /**
   * Filter by date range
   */
  dateRange?: {
    start: Date;
    end: Date;
  };
  /**
   * Search query
   */
  searchQuery?: string;
  /**
   * Callback for filter changes
   */
  onFilterChange?: (filters: {
    eventTypes?: AuditEventType[];
    severities?: AuditSeverity[];
    dateRange?: { start: Date; end: Date; };
    searchQuery?: string;
  }) => void;
  /**
   * Callback for exporting audit logs
   */
  onExportAuditLog?: () => void;
  /**
   * Show patient data access details (LGPD Article 20 compliance)
   */
  showDataAccessDetails?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
}

const eventTypeLabels: Record<AuditEventType, string> = {
  login: "Login",
  logout: "Logout",
  patient_view: "Visualização de Paciente",
  patient_edit: "Edição de Paciente",
  patient_create: "Criação de Paciente",
  patient_delete: "Exclusão de Paciente",
  appointment_view: "Visualização de Agendamento",
  appointment_create: "Criação de Agendamento",
  appointment_edit: "Edição de Agendamento",
  appointment_cancel: "Cancelamento de Agendamento",
  treatment_view: "Visualização de Tratamento",
  treatment_edit: "Edição de Tratamento",
  document_view: "Visualização de Documento",
  document_download: "Download de Documento",
  consent_given: "Consentimento Concedido",
  consent_withdrawn: "Consentimento Retirado",
  data_export: "Exportação de Dados",
  data_deletion: "Exclusão de Dados",
  backup_access: "Acesso a Backup",
  system_config: "Configuração do Sistema",
  emergency_access: "Acesso de Emergência",
};

const getEventIcon = (eventType: AuditEventType) => {
  const iconMap: Record<AuditEventType, React.ElementType> = {
    login: UserCheck,
    logout: UserCheck,
    patient_view: Eye,
    patient_edit: FileText,
    patient_create: User,
    patient_delete: User,
    appointment_view: Calendar,
    appointment_create: Calendar,
    appointment_edit: Calendar,
    appointment_cancel: Calendar,
    treatment_view: Activity,
    treatment_edit: Activity,
    document_view: FileText,
    document_download: Download,
    consent_given: Shield,
    consent_withdrawn: Shield,
    data_export: Download,
    data_deletion: FileText,
    backup_access: Lock,
    system_config: Shield,
    emergency_access: Lock,
  };

  const Icon = iconMap[eventType] || Activity;
  return <Icon className="h-4 w-4" />;
};

const getSeverityVariant = (severity: AuditSeverity) => {
  switch (severity) {
    case "low": {
      return "confirmed";
    }
    case "medium": {
      return "medium";
    }
    case "high": {
      return "high";
    }
    case "critical": {
      return "urgent";
    }
    default: {
      return "default";
    }
  }
};

const getSeverityLabel = (severity: AuditSeverity) => {
  switch (severity) {
    case "low": {
      return "Baixa";
    }
    case "medium": {
      return "Média";
    }
    case "high": {
      return "Alta";
    }
    case "critical": {
      return "Crítica";
    }
    default: {
      return severity;
    }
  }
};

const AuditEventCard: React.FC<{
  event: AuditEvent;
  showDataAccessDetails?: boolean;
}> = ({ event, showDataAccessDetails = false }) => {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div className="rounded-lg border bg-card p-4 text-card-foreground">
      <div className="flex items-start gap-4">
        {/* Icon & Severity */}
        <div className="flex flex-col items-center gap-2">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full",
              event.success
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700",
            )}
          >
            {getEventIcon(event.eventType)}
          </div>
          <Badge size="sm" variant={getSeverityVariant(event.severity)}>
            {getSeverityLabel(event.severity)}
          </Badge>
        </div>

        {/* Main Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-sm">
                {eventTypeLabels[event.eventType]} - {event.action}
              </h4>
              <p className="mt-1 text-muted-foreground text-sm">
                {event.description}
              </p>

              {/* User Info */}
              <div className="mt-2 flex items-center gap-2">
                <Avatar size="sm">
                  <AvatarImage alt={event.userName} src={event.userAvatar} />
                  <AvatarFallback>
                    {event.userName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <span className="font-medium">{event.userName}</span>
                  <span className="ml-1 text-muted-foreground">
                    ({event.userRole})
                  </span>
                </div>
              </div>

              {/* Patient Info */}
              {event.patientName && (
                <div className="mt-1 text-muted-foreground text-sm">
                  Paciente: <span className="font-medium">{event.patientName}</span>
                </div>
              )}
            </div>

            {/* Timestamp */}
            <div className="text-right text-sm">
              <div className="font-medium">{formatDate(event.timestamp)}</div>
              <div className="text-muted-foreground text-xs">
                {event.location || "Local não informado"}
              </div>
            </div>
          </div>

          {/* LGPD Data Access Details */}
          {showDataAccessDetails
            && event.dataAccessed
            && event.dataAccessed.length > 0 && (
            <div className="mt-3 rounded-lg bg-muted p-3">
              <div className="mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">
                  Dados Acessados (LGPD Art. 20)
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {event.dataAccessed.map((data, index) => (
                  <Badge key={index} size="sm" variant="outline">
                    {data}
                  </Badge>
                ))}
              </div>
              {event.lgpdBasis && (
                <p className="mt-2 text-muted-foreground text-xs">
                  Base legal: {event.lgpdBasis}
                </p>
              )}
            </div>
          )}

          {/* Expandable Details */}
          {(event.userAgent || event.ipAddress || event.metadata) && (
            <div className="mt-3">
              <Button
                className="h-auto p-0 text-muted-foreground hover:text-foreground"
                onClick={() => setExpanded(!expanded)}
                size="sm"
                variant="ghost"
              >
                {expanded ? "Ocultar" : "Ver"} detalhes técnicos
              </Button>

              {expanded && (
                <div className="mt-2 space-y-2 rounded-lg bg-muted p-3 text-xs">
                  <div>
                    <span className="font-medium">IP:</span>
                    {event.ipAddress}
                  </div>
                  {event.userAgent && (
                    <div>
                      <span className="font-medium">User Agent:</span>
                      {event.userAgent}
                    </div>
                  )}
                  {event.metadata && Object.keys(event.metadata).length > 0 && (
                    <div>
                      <span className="font-medium">Metadados:</span>
                      <pre className="mt-1 text-xs">
                        {JSON.stringify(event.metadata, undefined, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {!event.success && event.errorMessage && (
            <div className="mt-3 rounded-lg bg-red-50 p-3 text-red-800 text-sm">
              <span className="font-medium">Erro:</span>
              {event.errorMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const AuditTrailViewer = React.forwardRef<
  HTMLDivElement,
  AuditTrailViewerProps
>(
  (
    {
      events,
      loading = false,
      error,
      patientId,
      eventTypeFilter = [],
      severityFilter = [],
      dateRange,
      searchQuery = "",
      onFilterChange,
      onExportAuditLog,
      showDataAccessDetails = true,
      className,
      ...props
    },
    ref,
  ) => {
    const [localSearchQuery, setLocalSearchQuery] = React.useState(searchQuery);
    const [selectedEventType, setSelectedEventType] = React.useState<string>("all");
    const [selectedSeverity, setSelectedSeverity] = React.useState<string>("all");

    const handleSearchChange = (query: string) => {
      setLocalSearchQuery(query);
      onFilterChange?.({ searchQuery: query });
    };

    const handleEventTypeChange = (value: string) => {
      setSelectedEventType(value);
      const eventTypes = value === "all" ? [] : [value as AuditEventType];
      onFilterChange?.({ eventTypes });
    };

    const handleSeverityChange = (value: string) => {
      setSelectedSeverity(value);
      const severities = value === "all" ? [] : [value as AuditSeverity];
      onFilterChange?.({ severities });
    };

    if (error) {
      return (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-800">
            Erro ao carregar logs de auditoria: {error}
          </p>
        </div>
      );
    }

    return (
      <div
        className={cn("space-y-6", className)}
        ref={ref}
        {...props}
        aria-labelledby="audit-trail-title"
        role="region"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg" id="audit-trail-title">
              Trilha de Auditoria
            </h3>
            <p className="text-muted-foreground text-sm">
              {patientId
                ? "Registro de acesso aos dados do paciente (LGPD Art. 20)"
                : "Registro completo de atividades do sistema"}
            </p>
          </div>

          {onExportAuditLog && (
            <Button onClick={onExportAuditLog} size="sm" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar Logs
            </Button>
          )}
        </div>

        {/* Filters */}
        {onFilterChange && (
          <div className="flex flex-wrap gap-4">
            <div className="min-w-64 flex-1">
              <Input
                className="w-full"
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Buscar por usuário, ação ou descrição..."
                value={localSearchQuery}
              />
            </div>

            <Select
              onValueChange={handleEventTypeChange}
              value={selectedEventType}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tipo de evento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os eventos</SelectItem>
                {Object.entries(eventTypeLabels).map(([type, label]) => (
                  <SelectItem key={type} value={type}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              onValueChange={handleSeverityChange}
              value={selectedSeverity}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Severidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="critical">Crítica</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Events List */}
        {loading
          ? (
            <div className="space-y-4">
              {new Array(5).fill().map((_, index) => (
                <div
                  className="animate-pulse rounded-lg border bg-card p-4"
                  key={index}
                >
                  <div className="flex gap-4">
                    <div className="h-10 w-10 rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 rounded bg-muted" />
                      <div className="h-3 w-1/2 rounded bg-muted" />
                      <div className="h-3 w-1/4 rounded bg-muted" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
          : events.length === 0
          ? (
            <div className="rounded-lg border bg-card p-8 text-center">
              <Activity className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">
                Nenhum evento de auditoria encontrado para os filtros selecionados.
              </p>
            </div>
          )
          : (
            <div
              aria-label="Eventos de auditoria"
              className="space-y-4"
              role="list"
            >
              {events.map((event) => (
                <AuditEventCard
                  event={event}
                  key={event.id}
                  showDataAccessDetails={showDataAccessDetails}
                />
              ))}
            </div>
          )}

        {/* Summary */}
        {events.length > 0 && (
          <div className="rounded-lg bg-muted p-4 text-sm">
            <div className="flex items-center justify-between">
              <span>
                Total de {events.length} evento{events.length !== 1 ? "s" : ""} de auditoria
              </span>
              <span className="text-muted-foreground">
                Último evento: {events[0] ? formatDate(events[0].timestamp) : "N/A"}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  },
);

AuditTrailViewer.displayName = "AuditTrailViewer";

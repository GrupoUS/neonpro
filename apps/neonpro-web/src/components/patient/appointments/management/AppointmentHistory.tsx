"use client";

import type { format, parseISO } from "date-fns";
import type { ptBR } from "date-fns/locale";
import type {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Filter,
  Search,
  User,
  XCircle,
} from "lucide-react";
import type { useState } from "react";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Card, CardContent } from "@/components/ui/card";
import type { Input } from "@/components/ui/input";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PatientAppointment } from "@/hooks/patient/usePatientAppointments";

/**
 * Appointment History Component for NeonPro
 *
 * Based on VIBECODE MCP Research:
 * - Context7: React filtering and search patterns
 * - Tavily: Healthcare appointment history best practices
 * - Exa: Patient engagement analytics patterns
 */

interface AppointmentHistoryProps {
  appointments: PatientAppointment[];
  onView: (appointmentId: string) => void;
}

type FilterStatus = "all" | "completed" | "cancelled" | "no_show";

export function AppointmentHistory({ appointments, onView }: AppointmentHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  // Filter and sort appointments
  const filteredAppointments = appointments
    .filter((appointment) => {
      // Search filter
      const matchesSearch =
        searchTerm === "" ||
        appointment.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.professional_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.notes?.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === "all" || appointment.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.appointment_date}T${a.appointment_time}`);
      const dateB = new Date(`${b.appointment_date}T${b.appointment_time}`);
      return sortOrder === "desc"
        ? dateB.getTime() - dateA.getTime()
        : dateA.getTime() - dateB.getTime();
    });

  const getStatusBadge = (status: PatientAppointment["status"]) => {
    const statusConfig = {
      completed: {
        variant: "default" as const,
        className: "bg-green-100 text-green-800 hover:bg-green-100",
        icon: CheckCircle,
        label: "Concluído",
      },
      cancelled: {
        variant: "destructive" as const,
        className: "",
        icon: XCircle,
        label: "Cancelado",
      },
      no_show: {
        variant: "secondary" as const,
        className: "bg-orange-100 text-orange-800 hover:bg-orange-100",
        icon: AlertCircle,
        label: "Falta",
      },
      rescheduled: {
        variant: "outline" as const,
        className: "",
        icon: Calendar,
        label: "Reagendado",
      },
    } as const;

    const config = statusConfig[status as keyof typeof statusConfig] || {
      variant: "outline" as const,
      className: "",
      icon: FileText,
      label: status,
    };

    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const formatAppointmentDateTime = (date: string, time: string) => {
    try {
      const dateTime = parseISO(`${date}T${time}`);
      return {
        date: format(dateTime, "dd/MM/yyyy", { locale: ptBR }),
        time: format(dateTime, "HH:mm", { locale: ptBR }),
        fullDate: format(dateTime, "EEEE, dd MMMM yyyy", { locale: ptBR }),
      };
    } catch (error) {
      return { date, time, fullDate: date };
    }
  };

  // Statistics
  const stats = {
    total: appointments.length,
    completed: appointments.filter((a) => a.status === "completed").length,
    cancelled: appointments.filter((a) => a.status === "cancelled").length,
    noShow: appointments.filter((a) => a.status === "no_show").length,
  };

  if (appointments.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          Nenhum histórico encontrado
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Seus agendamentos passados aparecerão aqui após serem realizados ou cancelados.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-3">
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-xs text-muted-foreground">Concluídos</div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
            <div className="text-xs text-muted-foreground">Cancelados</div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.noShow}</div>
            <div className="text-xs text-muted-foreground">Faltas</div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por serviço, profissional ou observações..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(value: FilterStatus) => setStatusFilter(value)}
        >
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="completed">Concluídos</SelectItem>
            <SelectItem value="cancelled">Cancelados</SelectItem>
            <SelectItem value="no_show">Faltas</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortOrder} onValueChange={(value: "desc" | "asc") => setSortOrder(value)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Ordenar por data" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Mais recentes primeiro</SelectItem>
            <SelectItem value="asc">Mais antigos primeiro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Mostrando {filteredAppointments.length} de {appointments.length} agendamentos
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <div className="text-center py-8">
          <Search className="mx-auto h-8 w-8 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Nenhum agendamento encontrado com os filtros aplicados.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAppointments.map((appointment) => {
            const { date, time, fullDate } = formatAppointmentDateTime(
              appointment.appointment_date,
              appointment.appointment_time,
            );

            return (
              <Card key={appointment.id} className="transition-shadow hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">{appointment.service_name}</h3>
                        {getStatusBadge(appointment.status)}
                      </div>

                      {/* Date and time */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{fullDate}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{time}</span>
                        </div>
                        <div>{appointment.service_duration} min</div>
                      </div>

                      {/* Professional */}
                      {appointment.professional_name && (
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{appointment.professional_name}</span>
                        </div>
                      )}

                      {/* Cancellation reason */}
                      {appointment.status === "cancelled" && appointment.cancellation_reason && (
                        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md p-2 text-sm">
                          <strong>Motivo do cancelamento:</strong> {appointment.cancellation_reason}
                          {appointment.cancellation_date && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Cancelado em:{" "}
                              {format(parseISO(appointment.cancellation_date), "dd/MM/yyyy HH:mm", {
                                locale: ptBR,
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Notes */}
                      {appointment.notes && (
                        <div className="bg-muted/30 rounded-md p-2 text-sm">
                          <strong>Observações:</strong> {appointment.notes}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onView(appointment.id)}
                        className="text-xs"
                      >
                        Ver detalhes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Summary footer */}
      {filteredAppointments.length > 0 && (
        <div className="mt-6 p-4 bg-muted/30 rounded-lg text-xs text-muted-foreground text-center">
          {stats.completed > 0 && (
            <span>
              Taxa de comparecimento:{" "}
              {Math.round((stats.completed / (stats.total - stats.cancelled)) * 100)}%
            </span>
          )}
          {stats.noShow > 0 && (
            <span className="ml-4">
              Taxa de faltas: {Math.round((stats.noShow / stats.total) * 100)}%
            </span>
          )}
        </div>
      )}
    </div>
  );
}

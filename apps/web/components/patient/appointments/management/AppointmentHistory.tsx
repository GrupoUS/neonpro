'use client';

import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Filter,
  Search,
  User,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { PatientAppointment } from '@/hooks/patient/usePatientAppointments';

/**
 * Appointment History Component for NeonPro
 *
 * Based on VIBECODE MCP Research:
 * - Context7: React filtering and search patterns
 * - Tavily: Healthcare appointment history best practices
 * - Exa: Patient engagement analytics patterns
 */

type AppointmentHistoryProps = {
  appointments: PatientAppointment[];
  onView: (appointmentId: string) => void;
};

type FilterStatus = 'all' | 'completed' | 'cancelled' | 'no_show';

export function AppointmentHistory({
  appointments,
  onView,
}: AppointmentHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Filter and sort appointments
  const filteredAppointments = appointments
    .filter((appointment) => {
      // Search filter
      const matchesSearch =
        searchTerm === '' ||
        appointment.service_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        appointment.professional_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        appointment.notes?.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus =
        statusFilter === 'all' || appointment.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.appointment_date}T${a.appointment_time}`);
      const dateB = new Date(`${b.appointment_date}T${b.appointment_time}`);
      return sortOrder === 'desc'
        ? dateB.getTime() - dateA.getTime()
        : dateA.getTime() - dateB.getTime();
    });

  const getStatusBadge = (status: PatientAppointment['status']) => {
    const statusConfig = {
      completed: {
        variant: 'default' as const,
        className: 'bg-green-100 text-green-800 hover:bg-green-100',
        icon: CheckCircle,
        label: 'Concluído',
      },
      cancelled: {
        variant: 'destructive' as const,
        className: '',
        icon: XCircle,
        label: 'Cancelado',
      },
      no_show: {
        variant: 'secondary' as const,
        className: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
        icon: AlertCircle,
        label: 'Falta',
      },
      rescheduled: {
        variant: 'outline' as const,
        className: '',
        icon: Calendar,
        label: 'Reagendado',
      },
    } as const;

    const config = statusConfig[status as keyof typeof statusConfig] || {
      variant: 'outline' as const,
      className: '',
      icon: FileText,
      label: status,
    };

    const Icon = config.icon;

    return (
      <Badge className={config.className} variant={config.variant}>
        <Icon className="mr-1 h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatAppointmentDateTime = (date: string, time: string) => {
    try {
      const dateTime = parseISO(`${date}T${time}`);
      return {
        date: format(dateTime, 'dd/MM/yyyy', { locale: ptBR }),
        time: format(dateTime, 'HH:mm', { locale: ptBR }),
        fullDate: format(dateTime, 'EEEE, dd MMMM yyyy', { locale: ptBR }),
      };
    } catch (_error) {
      return { date, time, fullDate: date };
    }
  };

  // Statistics
  const stats = {
    total: appointments.length,
    completed: appointments.filter((a) => a.status === 'completed').length,
    cancelled: appointments.filter((a) => a.status === 'cancelled').length,
    noShow: appointments.filter((a) => a.status === 'no_show').length,
  };

  if (appointments.length === 0) {
    return (
      <div className="py-12 text-center">
        <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-2 font-medium text-lg text-muted-foreground">
          Nenhum histórico encontrado
        </h3>
        <p className="mx-auto max-w-sm text-muted-foreground text-sm">
          Seus agendamentos passados aparecerão aqui após serem realizados ou
          cancelados.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card className="p-3">
          <div className="text-center">
            <div className="font-bold text-2xl">{stats.total}</div>
            <div className="text-muted-foreground text-xs">Total</div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-center">
            <div className="font-bold text-2xl text-green-600">
              {stats.completed}
            </div>
            <div className="text-muted-foreground text-xs">Concluídos</div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-center">
            <div className="font-bold text-2xl text-red-600">
              {stats.cancelled}
            </div>
            <div className="text-muted-foreground text-xs">Cancelados</div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-center">
            <div className="font-bold text-2xl text-orange-600">
              {stats.noShow}
            </div>
            <div className="text-muted-foreground text-xs">Faltas</div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por serviço, profissional ou observações..."
            value={searchTerm}
          />
        </div>

        <Select
          onValueChange={(value: FilterStatus) => setStatusFilter(value)}
          value={statusFilter}
        >
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="completed">Concluídos</SelectItem>
            <SelectItem value="cancelled">Cancelados</SelectItem>
            <SelectItem value="no_show">Faltas</SelectItem>
          </SelectContent>
        </Select>

        <Select
          onValueChange={(value: 'desc' | 'asc') => setSortOrder(value)}
          value={sortOrder}
        >
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
      <div className="text-muted-foreground text-sm">
        Mostrando {filteredAppointments.length} de {appointments.length}{' '}
        agendamentos
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <div className="py-8 text-center">
          <Search className="mx-auto mb-4 h-8 w-8 text-muted-foreground" />
          <p className="text-muted-foreground">
            Nenhum agendamento encontrado com os filtros aplicados.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAppointments.map((appointment) => {
            const { date, time, fullDate } = formatAppointmentDateTime(
              appointment.appointment_date,
              appointment.appointment_time
            );

            return (
              <Card
                className="transition-shadow hover:shadow-md"
                key={appointment.id}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">
                          {appointment.service_name}
                        </h3>
                        {getStatusBadge(appointment.status)}
                      </div>

                      {/* Date and time */}
                      <div className="flex items-center gap-4 text-muted-foreground text-sm">
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
                      {appointment.status === 'cancelled' &&
                        appointment.cancellation_reason && (
                          <div className="rounded-md border border-red-200 bg-red-50 p-2 text-sm dark:border-red-800 dark:bg-red-950">
                            <strong>Motivo do cancelamento:</strong>{' '}
                            {appointment.cancellation_reason}
                            {appointment.cancellation_date && (
                              <div className="mt-1 text-muted-foreground text-xs">
                                Cancelado em:{' '}
                                {format(
                                  parseISO(appointment.cancellation_date),
                                  'dd/MM/yyyy HH:mm',
                                  { locale: ptBR }
                                )}
                              </div>
                            )}
                          </div>
                        )}

                      {/* Notes */}
                      {appointment.notes && (
                        <div className="rounded-md bg-muted/30 p-2 text-sm">
                          <strong>Observações:</strong> {appointment.notes}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="ml-4">
                      <Button
                        className="text-xs"
                        onClick={() => onView(appointment.id)}
                        size="sm"
                        variant="outline"
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
        <div className="mt-6 rounded-lg bg-muted/30 p-4 text-center text-muted-foreground text-xs">
          {stats.completed > 0 && (
            <span>
              Taxa de comparecimento:{' '}
              {Math.round(
                (stats.completed / (stats.total - stats.cancelled)) * 100
              )}
              %
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

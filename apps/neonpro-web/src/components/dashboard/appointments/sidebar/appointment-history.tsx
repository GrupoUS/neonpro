// components/dashboard/appointments/sidebar/appointment-history.tsx
// Appointment history and audit trail component
// Story 1.1 Task 5 - Appointment Details Modal/Sidebar

"use client";

import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Badge } from "@/components/ui/badge";
import type { Separator } from "@/components/ui/separator";
import type { ScrollArea } from "@/components/ui/scroll-area";
import type {
  History,
  Plus,
  Edit,
  X,
  CheckCircle,
  Calendar,
  Clock,
  User,
  FileText,
  Loader2,
} from "lucide-react";
import type { format } from "date-fns";
import type { ptBR } from "date-fns/locale";
import type { AppointmentHistoryEntry } from "@/app/lib/types/appointments";

// Action configuration with icons and colors
const actionConfig = {
  create: {
    label: "Criado",
    icon: Plus,
    color: "bg-green-100 text-green-700 border-green-200",
    variant: "default" as const,
  },
  update: {
    label: "Atualizado",
    icon: Edit,
    color: "bg-blue-100 text-blue-700 border-blue-200",
    variant: "secondary" as const,
  },
  cancel: {
    label: "Cancelado",
    icon: X,
    color: "bg-red-100 text-red-700 border-red-200",
    variant: "destructive" as const,
  },
  complete: {
    label: "Concluído",
    icon: CheckCircle,
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    variant: "default" as const,
  },
  reschedule: {
    label: "Reagendado",
    icon: Calendar,
    color: "bg-orange-100 text-orange-700 border-orange-200",
    variant: "secondary" as const,
  },
};

// Field labels for better display
const fieldLabels: Record<string, string> = {
  patient_id: "Paciente",
  professional_id: "Profissional",
  service_type_id: "Serviço",
  start_time: "Data/Hora Início",
  end_time: "Data/Hora Fim",
  status: "Status",
  notes: "Observações",
  internal_notes: "Observações Internas",
};

interface AppointmentHistoryProps {
  history: AppointmentHistoryEntry[];
  isLoading?: boolean;
}
export default function AppointmentHistory({
  history,
  isLoading = false,
}: AppointmentHistoryProps) {
  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const formatFieldValue = (field: string, value: any) => {
    if (!value) return "N/A";

    if (field.includes("time")) {
      return format(new Date(value), "dd/MM/yyyy HH:mm", { locale: ptBR });
    }

    if (field === "status") {
      const statusLabels: Record<string, string> = {
        scheduled: "Agendado",
        confirmed: "Confirmado",
        in_progress: "Em Andamento",
        completed: "Concluído",
        cancelled: "Cancelado",
        no_show: "Não Compareceu",
      };
      return statusLabels[value] || value;
    }

    return value;
  };

  const renderFieldChange = (field: string, oldValue: any, newValue: any) => {
    const fieldLabel = fieldLabels[field] || field;
    const oldFormatted = formatFieldValue(field, oldValue);
    const newFormatted = formatFieldValue(field, newValue);

    return (
      <div key={field} className="text-xs space-y-1">
        <span className="font-medium">{fieldLabel}:</span>
        <div className="flex items-center gap-2 pl-2">
          <span className="text-red-600 line-through">{oldFormatted}</span>
          <span className="text-muted-foreground">→</span>
          <span className="text-green-600 font-medium">{newFormatted}</span>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Carregando histórico...</span>
        </CardContent>
      </Card>
    );
  }
  if (!history.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Alterações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <History className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">Nenhuma alteração registrada</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <History className="h-5 w-5" />
          Histórico de Alterações
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {history.map((entry, index) => {
              const actionInfo = actionConfig[entry.action] || actionConfig.update;
              const ActionIcon = actionInfo.icon;

              return (
                <div key={entry.id} className="relative">
                  {/* Timeline line */}
                  {index < history.length - 1 && (
                    <div className="absolute left-6 top-10 h-full w-px bg-border" />
                  )}

                  <div className="flex gap-3">
                    {/* Action icon */}
                    <div className={`rounded-full p-2 ${actionInfo.color} flex-shrink-0`}>
                      <ActionIcon className="h-4 w-4" />
                    </div>

                    {/* Event details */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant={actionInfo.variant} className="text-xs">
                              {actionInfo.label}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium mt-1">{entry.changed_by_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDateTime(entry.created_at)}
                          </p>
                        </div>
                      </div>{" "}
                      {/* Change reason */}
                      {entry.change_reason && (
                        <div className="bg-muted/50 rounded p-2">
                          <div className="flex items-start gap-2">
                            <FileText className="h-3 w-3 text-muted-foreground mt-0.5" />
                            <p className="text-xs text-muted-foreground">
                              <span className="font-medium">Motivo:</span> {entry.change_reason}
                            </p>
                          </div>
                        </div>
                      )}
                      {/* Field changes */}
                      {entry.action === "update" && entry.changed_fields.length > 0 && (
                        <div className="bg-muted/30 rounded p-3 space-y-2">
                          <p className="text-xs font-medium text-muted-foreground mb-2">
                            Campos alterados:
                          </p>
                          {entry.changed_fields.map((field) =>
                            renderFieldChange(
                              field,
                              entry.old_values?.[field],
                              entry.new_values?.[field],
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Separator */}
                  {index < history.length - 1 && <Separator className="mt-4" />}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

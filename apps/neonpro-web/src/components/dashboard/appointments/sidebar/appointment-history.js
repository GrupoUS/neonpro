// components/dashboard/appointments/sidebar/appointment-history.tsx
// Appointment history and audit trail component
// Story 1.1 Task 5 - Appointment Details Modal/Sidebar
"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AppointmentHistory;
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var separator_1 = require("@/components/ui/separator");
var scroll_area_1 = require("@/components/ui/scroll-area");
var lucide_react_1 = require("lucide-react");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
// Action configuration with icons and colors
var actionConfig = {
  create: {
    label: "Criado",
    icon: lucide_react_1.Plus,
    color: "bg-green-100 text-green-700 border-green-200",
    variant: "default",
  },
  update: {
    label: "Atualizado",
    icon: lucide_react_1.Edit,
    color: "bg-blue-100 text-blue-700 border-blue-200",
    variant: "secondary",
  },
  cancel: {
    label: "Cancelado",
    icon: lucide_react_1.X,
    color: "bg-red-100 text-red-700 border-red-200",
    variant: "destructive",
  },
  complete: {
    label: "Concluído",
    icon: lucide_react_1.CheckCircle,
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    variant: "default",
  },
  reschedule: {
    label: "Reagendado",
    icon: lucide_react_1.Calendar,
    color: "bg-orange-100 text-orange-700 border-orange-200",
    variant: "secondary",
  },
};
// Field labels for better display
var fieldLabels = {
  patient_id: "Paciente",
  professional_id: "Profissional",
  service_type_id: "Serviço",
  start_time: "Data/Hora Início",
  end_time: "Data/Hora Fim",
  status: "Status",
  notes: "Observações",
  internal_notes: "Observações Internas",
};
function AppointmentHistory(_a) {
  var history = _a.history,
    _b = _a.isLoading,
    isLoading = _b === void 0 ? false : _b;
  var formatDateTime = function (dateString) {
    return (0, date_fns_1.format)(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", {
      locale: locale_1.ptBR,
    });
  };
  var formatFieldValue = function (field, value) {
    if (!value) return "N/A";
    if (field.includes("time")) {
      return (0, date_fns_1.format)(new Date(value), "dd/MM/yyyy HH:mm", { locale: locale_1.ptBR });
    }
    if (field === "status") {
      var statusLabels = {
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
  var renderFieldChange = function (field, oldValue, newValue) {
    var fieldLabel = fieldLabels[field] || field;
    var oldFormatted = formatFieldValue(field, oldValue);
    var newFormatted = formatFieldValue(field, newValue);
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
      <card_1.Card>
        <card_1.CardContent className="flex items-center justify-center py-8">
          <lucide_react_1.Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Carregando histórico...</span>
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  if (!history.length) {
    return (
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="text-lg flex items-center gap-2">
            <lucide_react_1.History className="h-5 w-5" />
            Histórico de Alterações
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="text-center py-4">
            <lucide_react_1.History className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">Nenhuma alteração registrada</p>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  return (
    <card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle className="text-lg flex items-center gap-2">
          <lucide_react_1.History className="h-5 w-5" />
          Histórico de Alterações
        </card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent>
        <scroll_area_1.ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {history.map(function (entry, index) {
              var actionInfo = actionConfig[entry.action] || actionConfig.update;
              var ActionIcon = actionInfo.icon;
              return (
                <div key={entry.id} className="relative">
                  {/* Timeline line */}
                  {index < history.length - 1 && (
                    <div className="absolute left-6 top-10 h-full w-px bg-border" />
                  )}

                  <div className="flex gap-3">
                    {/* Action icon */}
                    <div className={"rounded-full p-2 ".concat(actionInfo.color, " flex-shrink-0")}>
                      <ActionIcon className="h-4 w-4" />
                    </div>

                    {/* Event details */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <badge_1.Badge variant={actionInfo.variant} className="text-xs">
                              {actionInfo.label}
                            </badge_1.Badge>
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
                            <lucide_react_1.FileText className="h-3 w-3 text-muted-foreground mt-0.5" />
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
                          {entry.changed_fields.map(function (field) {
                            var _a, _b;
                            return renderFieldChange(
                              field,
                              (_a = entry.old_values) === null || _a === void 0
                                ? void 0
                                : _a[field],
                              (_b = entry.new_values) === null || _b === void 0
                                ? void 0
                                : _b[field],
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Separator */}
                  {index < history.length - 1 && <separator_1.Separator className="mt-4" />}
                </div>
              );
            })}
          </div>
        </scroll_area_1.ScrollArea>
      </card_1.CardContent>
    </card_1.Card>
  );
}

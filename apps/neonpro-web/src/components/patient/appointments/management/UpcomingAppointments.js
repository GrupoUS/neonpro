"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpcomingAppointments = UpcomingAppointments;
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var lucide_react_1 = require("lucide-react");
function UpcomingAppointments(_a) {
  var appointments = _a.appointments,
    onCancel = _a.onCancel,
    onReschedule = _a.onReschedule,
    onView = _a.onView,
    cancellationPolicies = _a.cancellationPolicies;
  if (appointments.length === 0) {
    return (
      <div className="text-center py-12">
        <lucide_react_1.Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          Nenhum agendamento próximo
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Você não tem agendamentos futuros. Que tal agendar um novo procedimento?
        </p>
      </div>
    );
  }
  var getStatusBadge = function (appointment) {
    switch (appointment.status) {
      case "confirmed":
        return (
          <badge_1.Badge
            variant="default"
            className="bg-green-100 text-green-800 hover:bg-green-100"
          >
            Confirmado
          </badge_1.Badge>
        );
      case "rescheduled":
        return <badge_1.Badge variant="secondary">Reagendado</badge_1.Badge>;
      default:
        return <badge_1.Badge variant="outline">{appointment.status}</badge_1.Badge>;
    }
  };
  var getUrgencyIndicator = function (hoursUntil) {
    if (hoursUntil <= 24) {
      return (
        <div title="Menos de 24h - não pode cancelar">
          <lucide_react_1.AlertTriangle className="h-4 w-4 text-orange-500" />
        </div>
      );
    } else if (hoursUntil <= 48) {
      return (
        <div title="Menos de 48h - não pode reagendar">
          <lucide_react_1.AlertTriangle className="h-4 w-4 text-yellow-500" />
        </div>
      );
    }
    return (
      <div title="Pode cancelar e reagendar">
        <lucide_react_1.CheckCircle className="h-4 w-4 text-green-500" />
      </div>
    );
  };
  var formatAppointmentDateTime = function (date, time) {
    try {
      var dateTime = (0, date_fns_1.parseISO)("".concat(date, "T").concat(time));
      return {
        date: (0, date_fns_1.format)(dateTime, "EEEE, dd MMMM yyyy", { locale: locale_1.ptBR }),
        time: (0, date_fns_1.format)(dateTime, "HH:mm", { locale: locale_1.ptBR }),
      };
    } catch (error) {
      return { date: date, time: time };
    }
  };
  // Group appointments by date for better organization
  var groupedAppointments = appointments.reduce(function (groups, appointment) {
    var date = appointment.appointment_date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(appointment);
    return groups;
  }, {});
  // Sort dates
  var sortedDates = Object.keys(groupedAppointments).sort();
  return (
    <div className="space-y-4">
      {sortedDates.map(function (date) {
        var dayAppointments = groupedAppointments[date];
        var formattedDate = formatAppointmentDateTime(date, "00:00").date;
        return (
          <div key={date} className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <lucide_react_1.Calendar className="h-4 w-4" />
              {formattedDate}
            </div>

            {dayAppointments.map(function (appointment) {
              var time = formatAppointmentDateTime(
                appointment.appointment_date,
                appointment.appointment_time,
              ).time;
              return (
                <card_1.Card key={appointment.id} className="transition-shadow hover:shadow-md">
                  <card_1.CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        {/* Header with service and status */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              {getUrgencyIndicator(appointment.hours_until_appointment)}
                              <h3 className="font-semibold text-lg">{appointment.service_name}</h3>
                            </div>
                            {getStatusBadge(appointment)}
                          </div>
                        </div>

                        {/* Time and duration */}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <lucide_react_1.Clock className="h-4 w-4" />
                            <span>{time}</span>
                          </div>
                          <div>Duração: {appointment.service_duration} min</div>
                          <div>
                            {appointment.hours_until_appointment > 0
                              ? "Em ".concat(appointment.hours_until_appointment, "h")
                              : "".concat(
                                  Math.abs(appointment.hours_until_appointment),
                                  "h atr\u00E1s",
                                )}
                          </div>
                        </div>

                        {/* Professional info */}
                        {appointment.professional_name && (
                          <div className="flex items-center gap-2 text-sm">
                            <lucide_react_1.User className="h-4 w-4 text-muted-foreground" />
                            <span>{appointment.professional_name}</span>
                          </div>
                        )}

                        {/* Notes */}
                        {appointment.notes && (
                          <div className="bg-muted/30 rounded-md p-3 text-sm">
                            <strong>Observações:</strong> {appointment.notes}
                          </div>
                        )}

                        {/* Policy warnings */}
                        <div className="space-y-2">
                          {!appointment.can_cancel && appointment.hours_until_appointment < 24 && (
                            <div className="flex items-start gap-2 text-xs text-orange-600 bg-orange-50 dark:bg-orange-950 p-2 rounded-md">
                              <lucide_react_1.AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                              <div>
                                <strong>Cancelamento não permitido</strong>
                                <br />
                                Resta{appointment.hours_until_appointment > 1 ? "m" : ""} apenas{" "}
                                {appointment.hours_until_appointment}h. Mínimo necessário:{" "}
                                {(cancellationPolicies === null || cancellationPolicies === void 0
                                  ? void 0
                                  : cancellationPolicies.minimum_hours) || 24}
                                h.
                              </div>
                            </div>
                          )}

                          {!appointment.can_reschedule &&
                            appointment.hours_until_appointment < 48 &&
                            appointment.can_cancel && (
                              <div className="flex items-start gap-2 text-xs text-yellow-600 bg-yellow-50 dark:bg-yellow-950 p-2 rounded-md">
                                <lucide_react_1.AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                <div>
                                  <strong>Reagendamento não permitido</strong>
                                  <br />
                                  Solicitações de reagendamento precisam de 48h de antecedência.
                                </div>
                              </div>
                            )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-col gap-2 ml-4">
                        <button_1.Button
                          variant="outline"
                          size="sm"
                          onClick={function () {
                            return onView(appointment.id);
                          }}
                          className="text-xs"
                        >
                          Detalhes
                        </button_1.Button>

                        {appointment.can_reschedule && (
                          <button_1.Button
                            variant="outline"
                            size="sm"
                            onClick={function () {
                              return onReschedule(appointment.id);
                            }}
                            className="text-xs"
                          >
                            <lucide_react_1.RotateCcw className="h-3 w-3 mr-1" />
                            Reagendar
                          </button_1.Button>
                        )}

                        {appointment.can_cancel && (
                          <button_1.Button
                            variant="destructive"
                            size="sm"
                            onClick={function () {
                              return onCancel(appointment.id);
                            }}
                            className="text-xs"
                          >
                            <lucide_react_1.XCircle className="h-3 w-3 mr-1" />
                            Cancelar
                          </button_1.Button>
                        )}
                      </div>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>
              );
            })}
          </div>
        );
      })}

      {/* Policy information footer */}
      {cancellationPolicies && (
        <div className="mt-6 p-4 bg-muted/30 rounded-lg text-xs text-muted-foreground">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <strong>Cancelamento:</strong> {cancellationPolicies.minimum_hours}h de antecedência
              {cancellationPolicies.fee_applies && (
                <div>
                  Taxa por cancelamento tardio: R$ {cancellationPolicies.fee_amount.toFixed(2)}
                </div>
              )}
            </div>
            <div>
              <strong>Reagendamento:</strong> 48h de antecedência para solicitação
              <div>Exceções para emergências médicas</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

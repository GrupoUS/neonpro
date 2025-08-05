"use client";
"use strict";
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleConflictResolver = ScheduleConflictResolver;
var react_1 = require("react");
var dialog_1 = require("@/components/ui/dialog");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var card_1 = require("@/components/ui/card");
var separator_1 = require("@/components/ui/separator");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
var moment_1 = require("moment");
require("moment/locale/pt-br");
moment_1.default.locale("pt-br");
// Service type colors
var serviceColors = {
  consultation: "bg-blue-500 text-blue-50",
  botox: "bg-violet-500 text-violet-50",
  fillers: "bg-emerald-500 text-emerald-50",
  procedure: "bg-amber-500 text-amber-50",
};
function ScheduleConflictResolver(_a) {
  var conflicts = _a.conflicts,
    isOpen = _a.isOpen,
    onResolve = _a.onResolve,
    onCancel = _a.onCancel,
    professionals = _a.professionals;
  var _b = (0, react_1.useState)([]),
    resolutions = _b[0],
    setResolutions = _b[1];
  var _c = (0, react_1.useState)(null),
    selectedConflictId = _c[0],
    setSelectedConflictId = _c[1];
  // Group conflicts by professional and time overlap
  var conflictGroups = (0, react_1.useMemo)(
    function () {
      var groups = [];
      conflicts.forEach(function (appointment) {
        var professional = professionals.find(function (p) {
          return p.id === appointment.professionalId;
        });
        // Find if there's an existing group for this professional with overlapping time
        var existingGroup = groups.find(function (group) {
          return (
            group.professionalId === appointment.professionalId &&
            ((appointment.start >= group.timeRange.start &&
              appointment.start < group.timeRange.end) ||
              (appointment.end > group.timeRange.start && appointment.end <= group.timeRange.end) ||
              (appointment.start <= group.timeRange.start &&
                appointment.end >= group.timeRange.end))
          );
        });
        if (existingGroup) {
          existingGroup.appointments.push(appointment);
          // Expand time range if necessary
          if (appointment.start < existingGroup.timeRange.start) {
            existingGroup.timeRange.start = appointment.start;
          }
          if (appointment.end > existingGroup.timeRange.end) {
            existingGroup.timeRange.end = appointment.end;
          }
        } else {
          groups.push({
            professionalId: appointment.professionalId,
            professionalName:
              (professional === null || professional === void 0 ? void 0 : professional.name) ||
              "Profissional não encontrado",
            timeRange: { start: appointment.start, end: appointment.end },
            appointments: [appointment],
          });
        }
      });
      return groups;
    },
    [conflicts, professionals],
  );
  // Generate suggested resolutions
  var generateSuggestions = function (conflictGroup) {
    var suggestions = [];
    var sortedAppointments = conflictGroup.appointments.sort(function (a, b) {
      return a.start.getTime() - b.start.getTime();
    });
    sortedAppointments.forEach(function (appointment, index) {
      if (index === 0) {
        // Keep the first appointment as is
        suggestions.push({
          appointmentId: appointment.id,
          action: "keep",
          reason: "Primeiro agendamento mantido",
        });
      } else {
        // Try to move subsequent appointments
        var previousAppointment = sortedAppointments[index - 1];
        var suggestedStart = (0, moment_1.default)(previousAppointment.end)
          .add(15, "minutes")
          .toDate();
        var duration = (0, moment_1.default)(appointment.end).diff(
          (0, moment_1.default)(appointment.start),
          "minutes",
        );
        var suggestedEnd = (0, moment_1.default)(suggestedStart).add(duration, "minutes").toDate();
        // Check if the suggested time is within business hours
        if (suggestedEnd.getHours() < 18) {
          suggestions.push({
            appointmentId: appointment.id,
            action: "move",
            newStart: suggestedStart,
            newEnd: suggestedEnd,
            reason: "Reagendar para "
              .concat((0, moment_1.default)(suggestedStart).format("HH:mm"), " - ")
              .concat((0, moment_1.default)(suggestedEnd).format("HH:mm")),
          });
        } else {
          // Suggest moving to next available day
          var nextDay = (0, moment_1.default)(appointment.start)
            .add(1, "day")
            .hour(9)
            .minute(0)
            .toDate();
          suggestions.push({
            appointmentId: appointment.id,
            action: "move",
            newStart: nextDay,
            newEnd: (0, moment_1.default)(nextDay).add(duration, "minutes").toDate(),
            reason: "Reagendar para próximo dia útil",
          });
        }
      }
    });
    return suggestions;
  };
  // Initialize resolutions when conflicts change
  react_1.default.useEffect(
    function () {
      if (conflicts.length > 0) {
        var initialResolutions_1 = [];
        conflictGroups.forEach(function (group) {
          var suggestions = generateSuggestions(group);
          initialResolutions_1.push.apply(initialResolutions_1, suggestions);
        });
        setResolutions(initialResolutions_1);
      }
    },
    [conflicts, conflictGroups],
  );
  // Handle resolution change
  var updateResolution = function (appointmentId, resolution) {
    setResolutions(function (prev) {
      return prev.map(function (r) {
        return r.appointmentId === appointmentId ? __assign(__assign({}, r), resolution) : r;
      });
    });
  };
  // Handle resolve conflicts
  var handleResolve = function () {
    var resolvedAppointments = [];
    conflicts.forEach(function (appointment) {
      var resolution = resolutions.find(function (r) {
        return r.appointmentId === appointment.id;
      });
      if (!resolution || resolution.action === "cancel") {
        // Skip cancelled appointments
        return;
      }
      if (resolution.action === "keep") {
        resolvedAppointments.push(appointment);
      } else if (resolution.action === "move" && resolution.newStart && resolution.newEnd) {
        resolvedAppointments.push(
          __assign(__assign({}, appointment), {
            start: resolution.newStart,
            end: resolution.newEnd,
          }),
        );
      } else if (resolution.action === "resize" && resolution.newStart && resolution.newEnd) {
        resolvedAppointments.push(
          __assign(__assign({}, appointment), {
            start: resolution.newStart,
            end: resolution.newEnd,
          }),
        );
      }
    });
    onResolve(resolvedAppointments);
  };
  if (!isOpen || conflicts.length === 0) return null;
  return (
    <dialog_1.Dialog open={isOpen} onOpenChange={onCancel}>
      <dialog_1.DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle className="flex items-center space-x-2">
            <lucide_react_1.AlertTriangle className="h-5 w-5 text-amber-500" />
            <span>Conflitos de Agendamento Detectados</span>
          </dialog_1.DialogTitle>
          <dialog_1.DialogDescription>
            {conflicts.length} consulta{conflicts.length > 1 ? "s" : ""} em conflito. Escolha como
            resolver cada situação.
          </dialog_1.DialogDescription>
        </dialog_1.DialogHeader>

        <div className="space-y-6">
          {conflictGroups.map(function (group, groupIndex) {
            return (
              <card_1.Card key={"".concat(group.professionalId, "-").concat(groupIndex)}>
                <card_1.CardHeader>
                  <card_1.CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <lucide_react_1.User className="h-4 w-4" />
                      <span>{group.professionalName}</span>
                    </div>
                    <badge_1.Badge variant="secondary">
                      {(0, moment_1.default)(group.timeRange.start).format("DD/MM HH:mm")} -{" "}
                      {(0, moment_1.default)(group.timeRange.end).format("HH:mm")}
                    </badge_1.Badge>
                  </card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="space-y-4">
                    {group.appointments.map(function (appointment, index) {
                      var resolution = resolutions.find(function (r) {
                        return r.appointmentId === appointment.id;
                      });
                      var isSelected = selectedConflictId === appointment.id;
                      return (
                        <div key={appointment.id} className="space-y-3">
                          {/* Appointment Card */}
                          <div
                            className={(0, utils_1.cn)(
                              "p-4 border rounded-lg cursor-pointer transition-all",
                              isSelected
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-muted-foreground",
                            )}
                            onClick={function () {
                              return setSelectedConflictId(isSelected ? null : appointment.id);
                            }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <badge_1.Badge className={serviceColors[appointment.serviceType]}>
                                    {appointment.serviceType === "consultation"
                                      ? "Consulta"
                                      : appointment.serviceType === "botox"
                                        ? "Botox"
                                        : appointment.serviceType === "fillers"
                                          ? "Preenchimento"
                                          : "Procedimento"}
                                  </badge_1.Badge>
                                  <span className="font-medium">{appointment.patientName}</span>
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                  <div className="flex items-center space-x-1">
                                    <lucide_react_1.Clock className="h-3 w-3" />
                                    <span>
                                      {(0, moment_1.default)(appointment.start).format("HH:mm")} -{" "}
                                      {(0, moment_1.default)(appointment.end).format("HH:mm")}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <lucide_react_1.Calendar className="h-3 w-3" />
                                    <span>
                                      {(0, moment_1.default)(appointment.start).format(
                                        "DD/MM/YYYY",
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Resolution Status */}
                              <div className="flex items-center space-x-2">
                                {(resolution === null || resolution === void 0
                                  ? void 0
                                  : resolution.action) === "keep" && (
                                  <badge_1.Badge variant="default" className="bg-green-500">
                                    <lucide_react_1.CheckCircle className="h-3 w-3 mr-1" />
                                    Manter
                                  </badge_1.Badge>
                                )}
                                {(resolution === null || resolution === void 0
                                  ? void 0
                                  : resolution.action) === "move" && (
                                  <badge_1.Badge variant="default" className="bg-blue-500">
                                    <lucide_react_1.ArrowRight className="h-3 w-3 mr-1" />
                                    Reagendar
                                  </badge_1.Badge>
                                )}
                                {(resolution === null || resolution === void 0
                                  ? void 0
                                  : resolution.action) === "cancel" && (
                                  <badge_1.Badge variant="destructive">
                                    <lucide_react_1.XCircle className="h-3 w-3 mr-1" />
                                    Cancelar
                                  </badge_1.Badge>
                                )}
                              </div>
                            </div>

                            {/* Resolution Details */}
                            {resolution && resolution.action === "move" && resolution.newStart && (
                              <div className="mt-3 pt-3 border-t">
                                <div className="flex items-center space-x-2 text-sm">
                                  <lucide_react_1.ArrowRight className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Novo horário:</span>
                                  <span className="font-medium">
                                    {(0, moment_1.default)(resolution.newStart).format(
                                      "DD/MM HH:mm",
                                    )}{" "}
                                    - {(0, moment_1.default)(resolution.newEnd).format("HH:mm")}
                                  </span>
                                </div>
                                {resolution.reason && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {resolution.reason}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Resolution Options */}
                          {isSelected && (
                            <div className="pl-4 border-l-2 border-primary/20">
                              <h4 className="font-medium mb-3">Opções de Resolução:</h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                <button_1.Button
                                  variant={
                                    (resolution === null || resolution === void 0
                                      ? void 0
                                      : resolution.action) === "keep"
                                      ? "default"
                                      : "outline"
                                  }
                                  size="sm"
                                  onClick={function () {
                                    return updateResolution(appointment.id, { action: "keep" });
                                  }}
                                  className="justify-start"
                                >
                                  <lucide_react_1.CheckCircle className="h-3 w-3 mr-2" />
                                  Manter
                                </button_1.Button>

                                <button_1.Button
                                  variant={
                                    (resolution === null || resolution === void 0
                                      ? void 0
                                      : resolution.action) === "move"
                                      ? "default"
                                      : "outline"
                                  }
                                  size="sm"
                                  onClick={function () {
                                    var suggestions = generateSuggestions(group);
                                    var suggestion = suggestions.find(function (s) {
                                      return s.appointmentId === appointment.id;
                                    });
                                    if (suggestion && suggestion.action === "move") {
                                      updateResolution(appointment.id, suggestion);
                                    }
                                  }}
                                  className="justify-start"
                                >
                                  <lucide_react_1.RotateCcw className="h-3 w-3 mr-2" />
                                  Reagendar
                                </button_1.Button>

                                <button_1.Button
                                  variant={
                                    (resolution === null || resolution === void 0
                                      ? void 0
                                      : resolution.action) === "cancel"
                                      ? "destructive"
                                      : "outline"
                                  }
                                  size="sm"
                                  onClick={function () {
                                    return updateResolution(appointment.id, { action: "cancel" });
                                  }}
                                  className="justify-start"
                                >
                                  <lucide_react_1.XCircle className="h-3 w-3 mr-2" />
                                  Cancelar
                                </button_1.Button>
                              </div>
                            </div>
                          )}

                          {index < group.appointments.length - 1 && <separator_1.Separator />}
                        </div>
                      );
                    })}
                  </div>
                </card_1.CardContent>
              </card_1.Card>
            );
          })}
        </div>

        <dialog_1.DialogFooter>
          <button_1.Button variant="outline" onClick={onCancel}>
            Cancelar
          </button_1.Button>
          <button_1.Button onClick={handleResolve}>Aplicar Resoluções</button_1.Button>
        </dialog_1.DialogFooter>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>
  );
}

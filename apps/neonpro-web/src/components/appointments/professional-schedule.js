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
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfessionalSchedule = ProfessionalSchedule;
var react_1 = require("react");
var dialog_1 = require("@/components/ui/dialog");
var tabs_1 = require("@/components/ui/tabs");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var switch_1 = require("@/components/ui/switch");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var separator_1 = require("@/components/ui/separator");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
var moment_1 = require("moment");
require("moment/locale/pt-br");
moment_1.default.locale("pt-br");
var weekDays = [
  { day: 1, dayName: "Segunda-feira" },
  { day: 2, dayName: "Terça-feira" },
  { day: 3, dayName: "Quarta-feira" },
  { day: 4, dayName: "Quinta-feira" },
  { day: 5, dayName: "Sexta-feira" },
  { day: 6, dayName: "Sábado" },
  { day: 0, dayName: "Domingo" },
];
var absenceTypes = [
  { value: "vacation", label: "Férias", color: "bg-blue-500" },
  { value: "sick", label: "Atestado Médico", color: "bg-red-500" },
  { value: "personal", label: "Pessoal", color: "bg-amber-500" },
  { value: "training", label: "Treinamento", color: "bg-green-500" },
];
function ProfessionalSchedule(_a) {
  var _b;
  var isOpen = _a.isOpen,
    onClose = _a.onClose,
    professionals = _a.professionals,
    onProfessionalsUpdate = _a.onProfessionalsUpdate;
  var _c = (0, react_1.useState)(
      ((_b = professionals[0]) === null || _b === void 0 ? void 0 : _b.id) || "",
    ),
    selectedProfessionalId = _c[0],
    setSelectedProfessionalId = _c[1];
  var _d = (0, react_1.useState)([]),
    workingDays = _d[0],
    setWorkingDays = _d[1];
  var _e = (0, react_1.useState)([]),
    absences = _e[0],
    setAbsences = _e[1];
  var _f = (0, react_1.useState)({
      startDate: (0, moment_1.default)().format("YYYY-MM-DD"),
      endDate: (0, moment_1.default)().add(1, "day").format("YYYY-MM-DD"),
      reason: "",
      type: "vacation",
    }),
    newAbsence = _f[0],
    setNewAbsence = _f[1];
  var selectedProfessional = professionals.find(function (p) {
    return p.id === selectedProfessionalId;
  });
  // Initialize working days when professional changes
  react_1.default.useEffect(
    function () {
      if (selectedProfessional) {
        var initialDays = weekDays.map(function (day) {
          return __assign(__assign({}, day), {
            enabled: selectedProfessional.workingHours.days.includes(day.day),
            startTime: selectedProfessional.workingHours.start,
            endTime: selectedProfessional.workingHours.end,
            lunchStart: "12:00",
            lunchEnd: "13:00",
          });
        });
        setWorkingDays(initialDays);
        // Mock absence data - in production, this would come from API
        setAbsences([
          {
            id: "1",
            startDate: (0, moment_1.default)().add(7, "days").format("YYYY-MM-DD"),
            endDate: (0, moment_1.default)().add(10, "days").format("YYYY-MM-DD"),
            reason: "Férias programadas",
            type: "vacation",
          },
        ]);
      }
    },
    [selectedProfessional],
  );
  // Update working day
  var updateWorkingDay = function (dayIndex, updates) {
    setWorkingDays(function (prev) {
      return prev.map(function (day, index) {
        return index === dayIndex ? __assign(__assign({}, day), updates) : day;
      });
    });
  };
  // Toggle professional availability
  var toggleAvailability = function (professionalId) {
    onProfessionalsUpdate(
      professionals.map(function (p) {
        return p.id === professionalId
          ? __assign(__assign({}, p), { availability: !p.availability })
          : p;
      }),
    );
  };
  // Save schedule changes
  var saveSchedule = function () {
    var _a, _b;
    if (!selectedProfessional) return;
    var enabledDays = workingDays
      .filter(function (day) {
        return day.enabled;
      })
      .map(function (day) {
        return day.day;
      });
    var startTime =
      ((_a = workingDays.find(function (day) {
        return day.enabled;
      })) === null || _a === void 0
        ? void 0
        : _a.startTime) || "08:00";
    var endTime =
      ((_b = workingDays.find(function (day) {
        return day.enabled;
      })) === null || _b === void 0
        ? void 0
        : _b.endTime) || "18:00";
    onProfessionalsUpdate(
      professionals.map(function (p) {
        return p.id === selectedProfessionalId
          ? __assign(__assign({}, p), {
              workingHours: {
                start: startTime,
                end: endTime,
                days: enabledDays,
              },
            })
          : p;
      }),
    );
  };
  // Add new absence
  var addAbsence = function () {
    if (!newAbsence.reason || !newAbsence.startDate || !newAbsence.endDate) return;
    var absence = {
      id: Date.now().toString(),
      startDate: newAbsence.startDate,
      endDate: newAbsence.endDate,
      reason: newAbsence.reason,
      type: newAbsence.type,
    };
    setAbsences(function (prev) {
      return __spreadArray(__spreadArray([], prev, true), [absence], false);
    });
    setNewAbsence({
      startDate: (0, moment_1.default)().format("YYYY-MM-DD"),
      endDate: (0, moment_1.default)().add(1, "day").format("YYYY-MM-DD"),
      reason: "",
      type: "vacation",
    });
  };
  // Remove absence
  var removeAbsence = function (absenceId) {
    setAbsences(function (prev) {
      return prev.filter(function (a) {
        return a.id !== absenceId;
      });
    });
  };
  if (!isOpen) return null;
  return (
    <dialog_1.Dialog open={isOpen} onOpenChange={onClose}>
      <dialog_1.DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle className="flex items-center space-x-2">
            <lucide_react_1.Settings className="h-5 w-5" />
            <span>Gerenciar Agenda Profissional</span>
          </dialog_1.DialogTitle>
          <dialog_1.DialogDescription>
            Configure horários de trabalho, pausas e períodos de ausência
          </dialog_1.DialogDescription>
        </dialog_1.DialogHeader>

        <div className="space-y-6">
          {/* Professional Selector */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {professionals.map(function (professional) {
              return (
                <card_1.Card
                  key={professional.id}
                  className={(0, utils_1.cn)(
                    "cursor-pointer transition-colors",
                    selectedProfessionalId === professional.id
                      ? "ring-2 ring-primary"
                      : "hover:bg-muted/50",
                  )}
                  onClick={function () {
                    return setSelectedProfessionalId(professional.id);
                  }}
                >
                  <card_1.CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: professional.color }}
                      />
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{professional.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {professional.specialization}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <badge_1.Badge
                        variant={professional.availability ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {professional.availability ? "Ativo" : "Inativo"}
                      </badge_1.Badge>
                      <switch_1.Switch
                        checked={professional.availability}
                        onCheckedChange={function () {
                          return toggleAvailability(professional.id);
                        }}
                        size="sm"
                      />
                    </div>
                  </card_1.CardContent>
                </card_1.Card>
              );
            })}
          </div>

          {selectedProfessional && (
            <tabs_1.Tabs defaultValue="schedule" className="w-full">
              <tabs_1.TabsList className="grid w-full grid-cols-3">
                <tabs_1.TabsTrigger value="schedule">
                  <lucide_react_1.Clock className="h-4 w-4 mr-2" />
                  Horários
                </tabs_1.TabsTrigger>
                <tabs_1.TabsTrigger value="breaks">
                  <lucide_react_1.Coffee className="h-4 w-4 mr-2" />
                  Pausas
                </tabs_1.TabsTrigger>
                <tabs_1.TabsTrigger value="absences">
                  <lucide_react_1.Calendar className="h-4 w-4 mr-2" />
                  Ausências
                </tabs_1.TabsTrigger>
              </tabs_1.TabsList>

              {/* Working Schedule Tab */}
              <tabs_1.TabsContent value="schedule" className="space-y-4">
                <card_1.Card>
                  <card_1.CardHeader>
                    <card_1.CardTitle className="flex items-center justify-between">
                      <span>Horários de Trabalho</span>
                      <badge_1.Badge variant="outline">{selectedProfessional.name}</badge_1.Badge>
                    </card_1.CardTitle>
                  </card_1.CardHeader>
                  <card_1.CardContent className="space-y-4">
                    {workingDays.map(function (day, index) {
                      return (
                        <div
                          key={day.day}
                          className="flex items-center space-x-4 p-3 rounded-lg border"
                        >
                          <switch_1.Switch
                            checked={day.enabled}
                            onCheckedChange={function (checked) {
                              return updateWorkingDay(index, { enabled: checked });
                            }}
                          />

                          <div className="flex-1 min-w-0">
                            <label_1.Label
                              className={(0, utils_1.cn)(
                                "font-medium",
                                !day.enabled && "text-muted-foreground",
                              )}
                            >
                              {day.dayName}
                            </label_1.Label>
                          </div>

                          {day.enabled && (
                            <div className="flex items-center space-x-2">
                              <input_1.Input
                                type="time"
                                value={day.startTime}
                                onChange={function (e) {
                                  return updateWorkingDay(index, { startTime: e.target.value });
                                }}
                                className="w-24"
                              />
                              <span className="text-muted-foreground">às</span>
                              <input_1.Input
                                type="time"
                                value={day.endTime}
                                onChange={function (e) {
                                  return updateWorkingDay(index, { endTime: e.target.value });
                                }}
                                className="w-24"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </card_1.CardContent>
                </card_1.Card>
              </tabs_1.TabsContent>

              {/* Breaks Tab */}
              <tabs_1.TabsContent value="breaks" className="space-y-4">
                <card_1.Card>
                  <card_1.CardHeader>
                    <card_1.CardTitle>Intervalos e Pausas</card_1.CardTitle>
                  </card_1.CardHeader>
                  <card_1.CardContent className="space-y-4">
                    {workingDays
                      .filter(function (day) {
                        return day.enabled;
                      })
                      .map(function (day, index) {
                        return (
                          <div key={day.day} className="space-y-3">
                            <label_1.Label className="font-medium">{day.dayName}</label_1.Label>
                            <div className="grid grid-cols-2 gap-4 pl-4">
                              <div className="space-y-2">
                                <label_1.Label className="text-sm text-muted-foreground">
                                  Início do Almoço
                                </label_1.Label>
                                <input_1.Input
                                  type="time"
                                  value={day.lunchStart || "12:00"}
                                  onChange={function (e) {
                                    return updateWorkingDay(index, { lunchStart: e.target.value });
                                  }}
                                />
                              </div>
                              <div className="space-y-2">
                                <label_1.Label className="text-sm text-muted-foreground">
                                  Fim do Almoço
                                </label_1.Label>
                                <input_1.Input
                                  type="time"
                                  value={day.lunchEnd || "13:00"}
                                  onChange={function (e) {
                                    return updateWorkingDay(index, { lunchEnd: e.target.value });
                                  }}
                                />
                              </div>
                            </div>
                            {index <
                              workingDays.filter(function (d) {
                                return d.enabled;
                              }).length -
                                1 && <separator_1.Separator />}
                          </div>
                        );
                      })}
                  </card_1.CardContent>
                </card_1.Card>
              </tabs_1.TabsContent>

              {/* Absences Tab */}
              <tabs_1.TabsContent value="absences" className="space-y-4">
                {/* Add New Absence */}
                <card_1.Card>
                  <card_1.CardHeader>
                    <card_1.CardTitle className="flex items-center space-x-2">
                      <lucide_react_1.Plus className="h-4 w-4" />
                      <span>Nova Ausência</span>
                    </card_1.CardTitle>
                  </card_1.CardHeader>
                  <card_1.CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <label_1.Label>Data Início</label_1.Label>
                        <input_1.Input
                          type="date"
                          value={newAbsence.startDate}
                          onChange={function (e) {
                            return setNewAbsence(function (prev) {
                              return __assign(__assign({}, prev), { startDate: e.target.value });
                            });
                          }}
                          min={(0, moment_1.default)().format("YYYY-MM-DD")}
                        />
                      </div>
                      <div className="space-y-2">
                        <label_1.Label>Data Fim</label_1.Label>
                        <input_1.Input
                          type="date"
                          value={newAbsence.endDate}
                          onChange={function (e) {
                            return setNewAbsence(function (prev) {
                              return __assign(__assign({}, prev), { endDate: e.target.value });
                            });
                          }}
                          min={newAbsence.startDate}
                        />
                      </div>
                      <div className="space-y-2">
                        <label_1.Label>Tipo</label_1.Label>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={newAbsence.type}
                          onChange={function (e) {
                            return setNewAbsence(function (prev) {
                              return __assign(__assign({}, prev), { type: e.target.value });
                            });
                          }}
                        >
                          {absenceTypes.map(function (type) {
                            return (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label_1.Label>Motivo</label_1.Label>
                        <input_1.Input
                          placeholder="Descreva o motivo"
                          value={newAbsence.reason}
                          onChange={function (e) {
                            return setNewAbsence(function (prev) {
                              return __assign(__assign({}, prev), { reason: e.target.value });
                            });
                          }}
                        />
                      </div>
                    </div>
                    <button_1.Button onClick={addAbsence} size="sm">
                      <lucide_react_1.Plus className="h-3 w-3 mr-2" />
                      Adicionar Ausência
                    </button_1.Button>
                  </card_1.CardContent>
                </card_1.Card>

                {/* Existing Absences */}
                <card_1.Card>
                  <card_1.CardHeader>
                    <card_1.CardTitle>Ausências Programadas</card_1.CardTitle>
                  </card_1.CardHeader>
                  <card_1.CardContent>
                    {absences.length === 0
                      ? <div className="text-center text-muted-foreground py-8">
                          <lucide_react_1.Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Nenhuma ausência programada</p>
                        </div>
                      : <div className="space-y-3">
                          {absences.map(function (absence) {
                            var typeConfig = absenceTypes.find(function (t) {
                              return t.value === absence.type;
                            });
                            var duration =
                              (0, moment_1.default)(absence.endDate).diff(
                                (0, moment_1.default)(absence.startDate),
                                "days",
                              ) + 1;
                            return (
                              <div
                                key={absence.id}
                                className="flex items-center justify-between p-4 border rounded-lg"
                              >
                                <div className="flex items-center space-x-3">
                                  <div
                                    className={(0, utils_1.cn)(
                                      "w-3 h-3 rounded-full",
                                      typeConfig === null || typeConfig === void 0
                                        ? void 0
                                        : typeConfig.color,
                                    )}
                                  />
                                  <div>
                                    <h4 className="font-medium">{absence.reason}</h4>
                                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                      <span>
                                        {(0, moment_1.default)(absence.startDate).format(
                                          "DD/MM/YYYY",
                                        )}{" "}
                                        -{" "}
                                        {(0, moment_1.default)(absence.endDate).format(
                                          "DD/MM/YYYY",
                                        )}
                                      </span>
                                      <badge_1.Badge variant="secondary" className="text-xs">
                                        {duration} dia{duration > 1 ? "s" : ""}
                                      </badge_1.Badge>
                                      <badge_1.Badge variant="outline" className="text-xs">
                                        {typeConfig === null || typeConfig === void 0
                                          ? void 0
                                          : typeConfig.label}
                                      </badge_1.Badge>
                                    </div>
                                  </div>
                                </div>
                                <button_1.Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={function () {
                                    return removeAbsence(absence.id);
                                  }}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <lucide_react_1.Trash2 className="h-4 w-4" />
                                </button_1.Button>
                              </div>
                            );
                          })}
                        </div>}
                  </card_1.CardContent>
                </card_1.Card>
              </tabs_1.TabsContent>
            </tabs_1.Tabs>
          )}
        </div>

        <dialog_1.DialogFooter>
          <button_1.Button variant="outline" onClick={onClose}>
            Cancelar
          </button_1.Button>
          <button_1.Button
            onClick={function () {
              saveSchedule();
              onClose();
            }}
          >
            Salvar Alterações
          </button_1.Button>
        </dialog_1.DialogFooter>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>
  );
}

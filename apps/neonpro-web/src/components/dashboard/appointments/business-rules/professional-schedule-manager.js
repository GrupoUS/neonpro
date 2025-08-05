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
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfessionalScheduleManager = ProfessionalScheduleManager;
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var switch_1 = require("@/components/ui/switch");
var tabs_1 = require("@/components/ui/tabs");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var sonner_1 = require("sonner");
var DAYS_OF_WEEK = [
  { value: 0, label: "Domingo", short: "Dom" },
  { value: 1, label: "Segunda-feira", short: "Seg" },
  { value: 2, label: "Terça-feira", short: "Ter" },
  { value: 3, label: "Quarta-feira", short: "Qua" },
  { value: 4, label: "Quinta-feira", short: "Qui" },
  { value: 5, label: "Sexta-feira", short: "Sex" },
  { value: 6, label: "Sábado", short: "Sáb" },
];
function ProfessionalScheduleManager(_a) {
  var _this = this;
  var professionalId = _a.professionalId,
    _b = _a.professionalName,
    professionalName = _b === void 0 ? "Professional" : _b,
    clinicId = _a.clinicId,
    onSave = _a.onSave;
  // State management
  var _c = (0, react_1.useState)([]),
    schedules = _c[0],
    setSchedules = _c[1];
  var _d = (0, react_1.useState)(true),
    isLoading = _d[0],
    setIsLoading = _d[1];
  var _e = (0, react_1.useState)(false),
    isSaving = _e[0],
    setIsSaving = _e[1];
  var _f = (0, react_1.useState)("schedule"),
    activeTab = _f[0],
    setActiveTab = _f[1];
  var _g = (0, react_1.useState)({
      min_booking_notice_hours: 2,
      max_booking_days_ahead: 90,
      buffer_minutes_between: 15,
      max_appointments_per_hour: 4,
    }),
    globalSettings = _g[0],
    setGlobalSettings = _g[1];
  // Initialize schedules for all days if not exist
  (0, react_1.useEffect)(
    function () {
      initializeSchedules();
    },
    [professionalId, clinicId],
  );
  var initializeSchedules = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var response, existingSchedules, defaultSchedules, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, 6, 7]);
            setIsLoading(true);
            return [4 /*yield*/, fetch("/api/professionals/".concat(professionalId, "/schedules"))];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            existingSchedules = _a.sent();
            setSchedules(existingSchedules);
            return [3 /*break*/, 4];
          case 3:
            defaultSchedules = DAYS_OF_WEEK.map(function (day) {
              return {
                id: "temp-".concat(day.value),
                professional_id: professionalId,
                clinic_id: clinicId,
                day_of_week: day.value,
                start_time: day.value >= 1 && day.value <= 5 ? "08:00" : "09:00", // Earlier start on weekdays
                end_time: day.value >= 1 && day.value <= 5 ? "18:00" : "17:00",
                break_start_time: "12:00",
                break_end_time: "13:00",
                is_available: day.value >= 1 && day.value <= 5, // Only weekdays available by default
                max_appointments_per_hour: 4,
                buffer_minutes_between: 15,
                min_booking_notice_hours: 2,
                max_booking_days_ahead: 90,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };
            });
            setSchedules(defaultSchedules);
            _a.label = 4;
          case 4:
            return [3 /*break*/, 7];
          case 5:
            error_1 = _a.sent();
            console.error("Error loading schedules:", error_1);
            sonner_1.toast.error("Erro ao carregar horários");
            return [3 /*break*/, 7];
          case 6:
            setIsLoading(false);
            return [7 /*endfinally*/];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  var updateSchedule = function (dayOfWeek, updates) {
    setSchedules(function (prev) {
      return prev.map(function (schedule) {
        return schedule.day_of_week === dayOfWeek
          ? __assign(__assign(__assign({}, schedule), updates), {
              updated_at: new Date().toISOString(),
            })
          : schedule;
      });
    });
  };
  var saveSchedules = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var config, response, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, 3, 4]);
            setIsSaving(true);
            config = {
              professional_id: professionalId,
              schedules: schedules.map(function (s) {
                return {
                  day_of_week: s.day_of_week,
                  start_time: s.start_time,
                  end_time: s.end_time,
                  break_start_time: s.break_start_time,
                  break_end_time: s.break_end_time,
                  is_available: s.is_available,
                  max_appointments_per_hour: s.max_appointments_per_hour,
                  buffer_minutes_between: s.buffer_minutes_between,
                };
              }),
              default_settings: globalSettings,
            };
            return [
              4 /*yield*/,
              fetch("/api/professionals/".concat(professionalId, "/schedules"), {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(config),
              }),
            ];
          case 1:
            response = _a.sent();
            if (!response.ok) {
              throw new Error("Failed to save schedules");
            }
            sonner_1.toast.success("Horários salvos com sucesso!");
            onSave === null || onSave === void 0 ? void 0 : onSave(config);
            return [3 /*break*/, 4];
          case 2:
            error_2 = _a.sent();
            console.error("Error saving schedules:", error_2);
            sonner_1.toast.error("Erro ao salvar horários");
            return [3 /*break*/, 4];
          case 3:
            setIsSaving(false);
            return [7 /*endfinally*/];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  var copyScheduleToAll = function (sourceDay) {
    var sourceSchedule = schedules.find(function (s) {
      return s.day_of_week === sourceDay;
    });
    if (!sourceSchedule) return;
    setSchedules(function (prev) {
      return prev.map(function (schedule) {
        return __assign(__assign({}, schedule), {
          start_time: sourceSchedule.start_time,
          end_time: sourceSchedule.end_time,
          break_start_time: sourceSchedule.break_start_time,
          break_end_time: sourceSchedule.break_end_time,
          max_appointments_per_hour: sourceSchedule.max_appointments_per_hour,
          buffer_minutes_between: sourceSchedule.buffer_minutes_between,
          updated_at: new Date().toISOString(),
        });
      });
    });
    sonner_1.toast.success("Horário copiado para todos os dias");
  };
  if (isLoading) {
    return (
      <card_1.Card>
        <card_1.CardContent className="p-6">
          <div className="flex items-center gap-2">
            <lucide_react_1.Clock className="h-4 w-4 animate-spin" />
            <span>Carregando horários...</span>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  return (
    <card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle className="flex items-center gap-2">
          <lucide_react_1.User className="h-5 w-5" />
          Horários de {professionalName}
        </card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent>
        <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab}>
          <tabs_1.TabsList className="grid w-full grid-cols-2">
            <tabs_1.TabsTrigger value="schedule">Agenda Semanal</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="settings">Configurações</tabs_1.TabsTrigger>
          </tabs_1.TabsList>

          <tabs_1.TabsContent value="schedule" className="space-y-4">
            <div className="grid gap-4">
              {DAYS_OF_WEEK.map(function (day) {
                var schedule = schedules.find(function (s) {
                  return s.day_of_week === day.value;
                });
                if (!schedule) return null;
                return (
                  <card_1.Card
                    key={day.value}
                    className={schedule.is_available ? "" : "opacity-60"}
                  >
                    <card_1.CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <badge_1.Badge variant={schedule.is_available ? "default" : "secondary"}>
                            {day.short}
                          </badge_1.Badge>
                          <span className="font-medium">{day.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <switch_1.Switch
                            checked={schedule.is_available}
                            onCheckedChange={function (checked) {
                              return updateSchedule(day.value, {
                                is_available: checked,
                              });
                            }}
                          />
                          <button_1.Button
                            variant="ghost"
                            size="sm"
                            onClick={function () {
                              return copyScheduleToAll(day.value);
                            }}
                            title="Copiar para todos os dias"
                          >
                            <lucide_react_1.Plus className="h-3 w-3" />
                          </button_1.Button>
                        </div>
                      </div>

                      {schedule.is_available && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <label_1.Label htmlFor={"start-".concat(day.value)}>
                              Início
                            </label_1.Label>
                            <input_1.Input
                              id={"start-".concat(day.value)}
                              type="time"
                              value={schedule.start_time}
                              onChange={function (e) {
                                return updateSchedule(day.value, {
                                  start_time: e.target.value,
                                });
                              }}
                            />
                          </div>
                          <div>
                            <label_1.Label htmlFor={"end-".concat(day.value)}>Fim</label_1.Label>
                            <input_1.Input
                              id={"end-".concat(day.value)}
                              type="time"
                              value={schedule.end_time}
                              onChange={function (e) {
                                return updateSchedule(day.value, {
                                  end_time: e.target.value,
                                });
                              }}
                            />
                          </div>
                          <div>
                            <label_1.Label htmlFor={"break-start-".concat(day.value)}>
                              Pausa início
                            </label_1.Label>
                            <input_1.Input
                              id={"break-start-".concat(day.value)}
                              type="time"
                              value={schedule.break_start_time || ""}
                              onChange={function (e) {
                                return updateSchedule(day.value, {
                                  break_start_time: e.target.value || undefined,
                                });
                              }}
                            />
                          </div>
                          <div>
                            <label_1.Label htmlFor={"break-end-".concat(day.value)}>
                              Pausa fim
                            </label_1.Label>
                            <input_1.Input
                              id={"break-end-".concat(day.value)}
                              type="time"
                              value={schedule.break_end_time || ""}
                              onChange={function (e) {
                                return updateSchedule(day.value, {
                                  break_end_time: e.target.value || undefined,
                                });
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </card_1.CardContent>
                  </card_1.Card>
                );
              })}
            </div>
          </tabs_1.TabsContent>

          <tabs_1.TabsContent value="settings" className="space-y-4">
            <div className="grid gap-6">
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle className="flex items-center gap-2 text-base">
                    <lucide_react_1.Settings className="h-4 w-4" />
                    Configurações de Agendamento
                  </card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label_1.Label htmlFor="min-notice">Aviso mínimo (horas)</label_1.Label>
                      <input_1.Input
                        id="min-notice"
                        type="number"
                        min="0"
                        max="168"
                        value={globalSettings.min_booking_notice_hours}
                        onChange={function (e) {
                          return setGlobalSettings(function (prev) {
                            return __assign(__assign({}, prev), {
                              min_booking_notice_hours: parseInt(e.target.value) || 0,
                            });
                          });
                        }}
                      />
                    </div>
                    <div>
                      <label_1.Label htmlFor="max-days">Máximo de dias antecedência</label_1.Label>
                      <input_1.Input
                        id="max-days"
                        type="number"
                        min="1"
                        max="365"
                        value={globalSettings.max_booking_days_ahead}
                        onChange={function (e) {
                          return setGlobalSettings(function (prev) {
                            return __assign(__assign({}, prev), {
                              max_booking_days_ahead: parseInt(e.target.value) || 1,
                            });
                          });
                        }}
                      />
                    </div>
                    <div>
                      <label_1.Label htmlFor="buffer-minutes">
                        Buffer entre consultas (min)
                      </label_1.Label>
                      <input_1.Input
                        id="buffer-minutes"
                        type="number"
                        min="0"
                        max="120"
                        value={globalSettings.buffer_minutes_between}
                        onChange={function (e) {
                          return setGlobalSettings(function (prev) {
                            return __assign(__assign({}, prev), {
                              buffer_minutes_between: parseInt(e.target.value) || 0,
                            });
                          });
                        }}
                      />
                    </div>
                    <div>
                      <label_1.Label htmlFor="max-per-hour">Máx. consultas por hora</label_1.Label>
                      <input_1.Input
                        id="max-per-hour"
                        type="number"
                        min="1"
                        max="20"
                        value={globalSettings.max_appointments_per_hour}
                        onChange={function (e) {
                          return setGlobalSettings(function (prev) {
                            return __assign(__assign({}, prev), {
                              max_appointments_per_hour: parseInt(e.target.value) || 1,
                            });
                          });
                        }}
                      />
                    </div>
                  </div>
                </card_1.CardContent>
              </card_1.Card>

              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle className="flex items-center gap-2 text-base">
                    <lucide_react_1.AlertTriangle className="h-4 w-4 text-amber-500" />
                    Resumo das Configurações
                  </card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Dias disponíveis:</strong>{" "}
                      {
                        schedules.filter(function (s) {
                          return s.is_available;
                        }).length
                      }{" "}
                      de 7
                    </p>
                    <p>
                      <strong>Aviso mínimo:</strong> {globalSettings.min_booking_notice_hours} horas
                    </p>
                    <p>
                      <strong>Antecedência máxima:</strong> {globalSettings.max_booking_days_ahead}{" "}
                      dias
                    </p>
                    <p>
                      <strong>Buffer entre consultas:</strong>{" "}
                      {globalSettings.buffer_minutes_between} minutos
                    </p>
                    <p>
                      <strong>Capacidade por hora:</strong>{" "}
                      {globalSettings.max_appointments_per_hour} consultas
                    </p>
                  </div>
                </card_1.CardContent>
              </card_1.Card>
            </div>
          </tabs_1.TabsContent>
        </tabs_1.Tabs>

        <div className="flex justify-end gap-2 mt-6">
          <button_1.Button onClick={saveSchedules} disabled={isSaving} className="min-w-[120px]">
            {isSaving
              ? <lucide_react_1.Clock className="h-4 w-4 animate-spin mr-2" />
              : <lucide_react_1.Save className="h-4 w-4 mr-2" />}
            {isSaving ? "Salvando..." : "Salvar"}
          </button_1.Button>
        </div>
      </card_1.CardContent>
    </card_1.Card>
  );
}

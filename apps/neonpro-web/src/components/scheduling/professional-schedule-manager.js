/**
 * Professional Schedule Manager Component
 * NeonPro Scheduling System
 *
 * Comprehensive tool for managing professional availability,
 * including recurring schedules, exceptions, and breaks
 */
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
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var label_1 = require("@/components/ui/label");
var switch_1 = require("@/components/ui/switch");
var select_1 = require("@/components/ui/select");
var badge_1 = require("@/components/ui/badge");
var separator_1 = require("@/components/ui/separator");
var dialog_1 = require("@/components/ui/dialog");
var lucide_react_1 = require("lucide-react");
var date_fns_1 = require("date-fns");
var auth_helpers_nextjs_1 = require("@supabase/auth-helpers-nextjs");
var react_query_1 = require("@tanstack/react-query");
var ProfessionalScheduleManager = function (_a) {
  var _b;
  var professionalId = _a.professionalId,
    onScheduleUpdate = _a.onScheduleUpdate;
  var _c = (0, react_1.useState)(professionalId || ""),
    selectedProfessional = _c[0],
    setSelectedProfessional = _c[1];
  var _d = (0, react_1.useState)(new Date()),
    selectedWeek = _d[0],
    setSelectedWeek = _d[1];
  var _e = (0, react_1.useState)(null),
    editingAvailability = _e[0],
    setEditingAvailability = _e[1];
  var _f = (0, react_1.useState)(false),
    showExceptionDialog = _f[0],
    setShowExceptionDialog = _f[1];
  var _g = (0, react_1.useState)(null),
    selectedExceptionDate = _g[0],
    setSelectedExceptionDate = _g[1];
  var _h = (0, react_1.useState)(false),
    bulkUpdateMode = _h[0],
    setBulkUpdateMode = _h[1];
  var supabase = (0, auth_helpers_nextjs_1.createClientComponentClient)();
  var queryClient = (0, react_query_1.useQueryClient)();
  // Days of the week
  var daysOfWeek = [
    { value: 1, label: "Segunda-feira", short: "Seg" },
    { value: 2, label: "Terça-feira", short: "Ter" },
    { value: 3, label: "Quarta-feira", short: "Qua" },
    { value: 4, label: "Quinta-feira", short: "Qui" },
    { value: 5, label: "Sexta-feira", short: "Sex" },
    { value: 6, label: "Sábado", short: "Sáb" },
    { value: 0, label: "Domingo", short: "Dom" },
  ];
  // Fetch professionals
  var _j = (0, react_query_1.useQuery)({
      queryKey: ["professionals"],
      queryFn: function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var _a, data, error;
          return __generator(this, function (_b) {
            switch (_b.label) {
              case 0:
                return [
                  4 /*yield*/,
                  supabase
                    .from("professionals")
                    .select("*")
                    .eq("is_active", true)
                    .order("full_name"),
                ];
              case 1:
                (_a = _b.sent()), (data = _a.data), (error = _a.error);
                if (error) throw error;
                return [2 /*return*/, data];
            }
          });
        });
      },
    }).data,
    professionals = _j === void 0 ? [] : _j;
  // Fetch professional availability
  var _k = (0, react_query_1.useQuery)({
      queryKey: ["professional_availability", selectedProfessional],
      queryFn: function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var _a, data, error;
          return __generator(this, function (_b) {
            switch (_b.label) {
              case 0:
                if (!selectedProfessional) return [2 /*return*/, []];
                return [
                  4 /*yield*/,
                  supabase
                    .from("professional_availability")
                    .select("*")
                    .eq("professional_id", selectedProfessional)
                    .order("day_of_week"),
                ];
              case 1:
                (_a = _b.sent()), (data = _a.data), (error = _a.error);
                if (error) throw error;
                return [2 /*return*/, data];
            }
          });
        });
      },
      enabled: !!selectedProfessional,
    }),
    _l = _k.data,
    availability = _l === void 0 ? [] : _l,
    availabilityLoading = _k.isLoading,
    refetchAvailability = _k.refetch;
  // Get current professional data
  var currentProfessional = professionals.find(function (p) {
    return p.id === selectedProfessional;
  });
  // Generate week days for display
  var weekDays = (0, date_fns_1.eachDayOfInterval)({
    start: (0, date_fns_1.startOfWeek)(selectedWeek, { weekStartsOn: 1 }),
    end: (0, date_fns_1.endOfWeek)(selectedWeek, { weekStartsOn: 1 }),
  });
  // Time slot options
  var timeOptions = Array.from({ length: 24 * 2 }, function (_, i) {
    var hour = Math.floor(i / 2);
    var minute = (i % 2) * 30;
    var time = ""
      .concat(hour.toString().padStart(2, "0"), ":")
      .concat(minute.toString().padStart(2, "0"));
    return { value: time, label: time };
  });
  // Update availability mutation
  var updateAvailabilityMutation = (0, react_query_1.useMutation)({
    mutationFn: function (availabilityData) {
      return __awaiter(void 0, void 0, void 0, function () {
        var _a, data, error, _b, data, error;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              if (!availabilityData.id) return [3 /*break*/, 2];
              return [
                4 /*yield*/,
                supabase
                  .from("professional_availability")
                  .update(availabilityData)
                  .eq("id", availabilityData.id)
                  .select()
                  .single(),
              ];
            case 1:
              (_a = _c.sent()), (data = _a.data), (error = _a.error);
              if (error) throw error;
              return [2 /*return*/, data];
            case 2:
              return [
                4 /*yield*/,
                supabase
                  .from("professional_availability")
                  .insert([availabilityData])
                  .select()
                  .single(),
              ];
            case 3:
              (_b = _c.sent()), (data = _b.data), (error = _b.error);
              if (error) throw error;
              return [2 /*return*/, data];
          }
        });
      });
    },
    onSuccess: function () {
      queryClient.invalidateQueries({ queryKey: ["professional_availability"] });
      onScheduleUpdate === null || onScheduleUpdate === void 0 ? void 0 : onScheduleUpdate();
      setEditingAvailability(null);
    },
  });
  // Delete availability mutation
  var deleteAvailabilityMutation = (0, react_query_1.useMutation)({
    mutationFn: function (id) {
      return __awaiter(void 0, void 0, void 0, function () {
        var error;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                supabase.from("professional_availability").delete().eq("id", id),
              ];
            case 1:
              error = _a.sent().error;
              if (error) throw error;
              return [2 /*return*/];
          }
        });
      });
    },
    onSuccess: function () {
      queryClient.invalidateQueries({ queryKey: ["professional_availability"] });
      onScheduleUpdate === null || onScheduleUpdate === void 0 ? void 0 : onScheduleUpdate();
    },
  });
  // Create default schedule
  var createDefaultSchedule = function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var defaultSchedule, error, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!selectedProfessional) return [2 /*return*/];
            defaultSchedule = daysOfWeek
              .filter(function (day) {
                return (
                  (currentProfessional === null || currentProfessional === void 0
                    ? void 0
                    : currentProfessional.can_work_weekends) ||
                  (day.value !== 0 && day.value !== 6)
                );
              })
              .map(function (day) {
                return {
                  professional_id: selectedProfessional,
                  day_of_week: day.value,
                  start_time:
                    (currentProfessional === null || currentProfessional === void 0
                      ? void 0
                      : currentProfessional.default_start_time) || "08:00",
                  end_time:
                    (currentProfessional === null || currentProfessional === void 0
                      ? void 0
                      : currentProfessional.default_end_time) || "18:00",
                  break_start_time:
                    (currentProfessional === null || currentProfessional === void 0
                      ? void 0
                      : currentProfessional.default_break_start) || "12:00",
                  break_end_time:
                    (currentProfessional === null || currentProfessional === void 0
                      ? void 0
                      : currentProfessional.default_break_end) || "13:00",
                  is_available: true,
                };
              });
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, , 4]);
            return [
              4 /*yield*/,
              supabase.from("professional_availability").insert(defaultSchedule),
            ];
          case 2:
            error = _a.sent().error;
            if (error) throw error;
            refetchAvailability();
            return [3 /*break*/, 4];
          case 3:
            error_1 = _a.sent();
            console.error("Error creating default schedule:", error_1);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  // Get availability for a specific day
  var getAvailabilityForDay = function (dayOfWeek) {
    return availability.find(function (a) {
      return a.day_of_week === dayOfWeek;
    });
  };
  // Handle edit availability
  var handleEditAvailability = function (dayOfWeek) {
    var existingAvailability = getAvailabilityForDay(dayOfWeek);
    if (existingAvailability) {
      setEditingAvailability(existingAvailability);
    } else {
      setEditingAvailability({
        id: "",
        professional_id: selectedProfessional,
        day_of_week: dayOfWeek,
        start_time: "08:00",
        end_time: "18:00",
        break_start_time: "12:00",
        break_end_time: "13:00",
        is_available: true,
      });
    }
  };
  // Save availability
  var handleSaveAvailability = function () {
    if (!editingAvailability) return;
    updateAvailabilityMutation.mutate(editingAvailability);
  };
  // Bulk update all days
  var handleBulkUpdate = function (template) {
    return __awaiter(void 0, void 0, void 0, function () {
      var updates, _i, updates_1, update, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!selectedProfessional) return [2 /*return*/];
            updates = daysOfWeek.map(function (day) {
              var existing = getAvailabilityForDay(day.value);
              return __assign(
                __assign(
                  {},
                  existing || { professional_id: selectedProfessional, day_of_week: day.value },
                ),
                template,
              );
            });
            _a.label = 1;
          case 1:
            _a.trys.push([1, 6, , 7]);
            (_i = 0), (updates_1 = updates);
            _a.label = 2;
          case 2:
            if (!(_i < updates_1.length)) return [3 /*break*/, 5];
            update = updates_1[_i];
            return [4 /*yield*/, updateAvailabilityMutation.mutateAsync(update)];
          case 3:
            _a.sent();
            _a.label = 4;
          case 4:
            _i++;
            return [3 /*break*/, 2];
          case 5:
            return [3 /*break*/, 7];
          case 6:
            error_2 = _a.sent();
            console.error("Error bulk updating:", error_2);
            return [3 /*break*/, 7];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <card_1.Card>
        <card_1.CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.UserCheck className="w-5 h-5" />
                Gestão de Disponibilidade
              </card_1.CardTitle>
              <card_1.CardDescription>
                Configure os horários de trabalho e disponibilidade dos profissionais
              </card_1.CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <button_1.Button
                variant="outline"
                size="sm"
                onClick={function () {
                  return setBulkUpdateMode(!bulkUpdateMode);
                }}
              >
                <lucide_react_1.Settings className="w-4 h-4 mr-2" />
                Edição em Lote
              </button_1.Button>
            </div>
          </div>
        </card_1.CardHeader>

        <card_1.CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label_1.Label htmlFor="professional-select">Profissional</label_1.Label>
              <select_1.Select value={selectedProfessional} onValueChange={setSelectedProfessional}>
                <select_1.SelectTrigger id="professional-select">
                  <select_1.SelectValue placeholder="Selecione um profissional" />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  {professionals.map(function (professional) {
                    return (
                      <select_1.SelectItem key={professional.id} value={professional.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: professional.color }}
                          />
                          <span>{professional.full_name}</span>
                          {professional.specialization && (
                            <span className="text-gray-500 text-sm">
                              - {professional.specialization}
                            </span>
                          )}
                        </div>
                      </select_1.SelectItem>
                    );
                  })}
                </select_1.SelectContent>
              </select_1.Select>
            </div>

            {selectedProfessional && availability.length === 0 && (
              <button_1.Button onClick={createDefaultSchedule} variant="outline">
                <lucide_react_1.Plus className="w-4 h-4 mr-2" />
                Criar Agenda Padrão
              </button_1.Button>
            )}
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {selectedProfessional && (
        <>
          {/* Bulk Update Controls */}
          {bulkUpdateMode && (
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="text-lg">Edição em Lote</card_1.CardTitle>
                <card_1.CardDescription>
                  Aplique as mesmas configurações para todos os dias da semana
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label_1.Label>Horário de Início</label_1.Label>
                    <select_1.Select
                      onValueChange={function (value) {
                        return handleBulkUpdate({ start_time: value });
                      }}
                    >
                      <select_1.SelectTrigger>
                        <select_1.SelectValue placeholder="Início" />
                      </select_1.SelectTrigger>
                      <select_1.SelectContent>
                        {timeOptions.slice(16, 40).map(function (option) {
                          return (
                            <select_1.SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </select_1.SelectItem>
                          );
                        })}
                      </select_1.SelectContent>
                    </select_1.Select>
                  </div>

                  <div>
                    <label_1.Label>Horário de Fim</label_1.Label>
                    <select_1.Select
                      onValueChange={function (value) {
                        return handleBulkUpdate({ end_time: value });
                      }}
                    >
                      <select_1.SelectTrigger>
                        <select_1.SelectValue placeholder="Fim" />
                      </select_1.SelectTrigger>
                      <select_1.SelectContent>
                        {timeOptions.slice(32, 48).map(function (option) {
                          return (
                            <select_1.SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </select_1.SelectItem>
                          );
                        })}
                      </select_1.SelectContent>
                    </select_1.Select>
                  </div>

                  <div>
                    <label_1.Label>Início do Intervalo</label_1.Label>
                    <select_1.Select
                      onValueChange={function (value) {
                        return handleBulkUpdate({ break_start_time: value });
                      }}
                    >
                      <select_1.SelectTrigger>
                        <select_1.SelectValue placeholder="Intervalo" />
                      </select_1.SelectTrigger>
                      <select_1.SelectContent>
                        {timeOptions.slice(22, 32).map(function (option) {
                          return (
                            <select_1.SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </select_1.SelectItem>
                          );
                        })}
                      </select_1.SelectContent>
                    </select_1.Select>
                  </div>

                  <div>
                    <label_1.Label>Fim do Intervalo</label_1.Label>
                    <select_1.Select
                      onValueChange={function (value) {
                        return handleBulkUpdate({ break_end_time: value });
                      }}
                    >
                      <select_1.SelectTrigger>
                        <select_1.SelectValue placeholder="Fim Intervalo" />
                      </select_1.SelectTrigger>
                      <select_1.SelectContent>
                        {timeOptions.slice(24, 34).map(function (option) {
                          return (
                            <select_1.SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </select_1.SelectItem>
                          );
                        })}
                      </select_1.SelectContent>
                    </select_1.Select>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-4">
                  <button_1.Button
                    onClick={function () {
                      return handleBulkUpdate({ is_available: true });
                    }}
                    size="sm"
                    variant="outline"
                  >
                    <lucide_react_1.CheckCircle className="w-4 h-4 mr-2" />
                    Habilitar Todos os Dias
                  </button_1.Button>

                  <button_1.Button
                    onClick={function () {
                      return handleBulkUpdate({ is_available: false });
                    }}
                    size="sm"
                    variant="outline"
                  >
                    <lucide_react_1.X className="w-4 h-4 mr-2" />
                    Desabilitar Todos os Dias
                  </button_1.Button>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          )}

          {/* Weekly Schedule */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.CalendarDays className="w-5 h-5" />
                Agenda Semanal
              </card_1.CardTitle>
              <card_1.CardDescription>
                Configure os horários de disponibilidade para cada dia da semana
              </card_1.CardDescription>
            </card_1.CardHeader>

            <card_1.CardContent>
              {availabilityLoading
                ? <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                : <div className="space-y-4">
                    {daysOfWeek.map(function (day) {
                      var dayAvailability = getAvailabilityForDay(day.value);
                      var isWeekend = day.value === 0 || day.value === 6;
                      return (
                        <div
                          key={day.value}
                          className={"p-4 border rounded-lg ".concat(
                            (
                              dayAvailability === null || dayAvailability === void 0
                                ? void 0
                                : dayAvailability.is_available
                            )
                              ? "bg-green-50 border-green-200"
                              : isWeekend
                                ? "bg-gray-50 border-gray-200"
                                : "bg-red-50 border-red-200",
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                {isWeekend
                                  ? <lucide_react_1.Moon className="w-4 h-4 text-gray-500" />
                                  : <lucide_react_1.Sun className="w-4 h-4 text-yellow-500" />}
                                <span className="font-medium min-w-[120px]">{day.label}</span>
                              </div>

                              {dayAvailability
                                ? <div className="flex items-center gap-4">
                                    <badge_1.Badge
                                      variant={
                                        dayAvailability.is_available ? "default" : "secondary"
                                      }
                                    >
                                      {dayAvailability.is_available ? "Disponível" : "Indisponível"}
                                    </badge_1.Badge>

                                    {dayAvailability.is_available && (
                                      <>
                                        <div className="flex items-center gap-1 text-sm">
                                          <lucide_react_1.Clock className="w-3 h-3" />
                                          {dayAvailability.start_time} - {dayAvailability.end_time}
                                        </div>

                                        {dayAvailability.break_start_time &&
                                          dayAvailability.break_end_time && (
                                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                              <lucide_react_1.Coffee className="w-3 h-3" />
                                              Intervalo: {dayAvailability.break_start_time} -{" "}
                                              {dayAvailability.break_end_time}
                                            </div>
                                          )}
                                      </>
                                    )}
                                  </div>
                                : <badge_1.Badge variant="outline">Não configurado</badge_1.Badge>}
                            </div>

                            <div className="flex items-center gap-2">
                              <button_1.Button
                                size="sm"
                                variant="outline"
                                onClick={function () {
                                  return handleEditAvailability(day.value);
                                }}
                              >
                                <lucide_react_1.Edit className="w-3 h-3 mr-1" />
                                {dayAvailability ? "Editar" : "Configurar"}
                              </button_1.Button>

                              {dayAvailability && (
                                <button_1.Button
                                  size="sm"
                                  variant="outline"
                                  onClick={function () {
                                    return deleteAvailabilityMutation.mutate(dayAvailability.id);
                                  }}
                                >
                                  <lucide_react_1.Trash2 className="w-3 h-3" />
                                </button_1.Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>}
            </card_1.CardContent>
          </card_1.Card>

          {/* Edit Availability Dialog */}
          {editingAvailability && (
            <dialog_1.Dialog
              open={!!editingAvailability}
              onOpenChange={function () {
                return setEditingAvailability(null);
              }}
            >
              <dialog_1.DialogContent className="sm:max-w-md">
                <dialog_1.DialogHeader>
                  <dialog_1.DialogTitle>
                    Configurar Disponibilidade -{" "}
                    {(_b = daysOfWeek.find(function (d) {
                      return d.value === editingAvailability.day_of_week;
                    })) === null || _b === void 0
                      ? void 0
                      : _b.label}
                  </dialog_1.DialogTitle>
                  <dialog_1.DialogDescription>
                    Configure os horários de trabalho para este dia da semana
                  </dialog_1.DialogDescription>
                </dialog_1.DialogHeader>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <switch_1.Switch
                      id="available"
                      checked={editingAvailability.is_available}
                      onCheckedChange={function (checked) {
                        return setEditingAvailability(
                          __assign(__assign({}, editingAvailability), { is_available: checked }),
                        );
                      }}
                    />
                    <label_1.Label htmlFor="available">Disponível neste dia</label_1.Label>
                  </div>

                  {editingAvailability.is_available && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label_1.Label>Horário de Início</label_1.Label>
                          <select_1.Select
                            value={editingAvailability.start_time}
                            onValueChange={function (value) {
                              return setEditingAvailability(
                                __assign(__assign({}, editingAvailability), { start_time: value }),
                              );
                            }}
                          >
                            <select_1.SelectTrigger>
                              <select_1.SelectValue />
                            </select_1.SelectTrigger>
                            <select_1.SelectContent>
                              {timeOptions.slice(16, 40).map(function (option) {
                                return (
                                  <select_1.SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </select_1.SelectItem>
                                );
                              })}
                            </select_1.SelectContent>
                          </select_1.Select>
                        </div>

                        <div>
                          <label_1.Label>Horário de Fim</label_1.Label>
                          <select_1.Select
                            value={editingAvailability.end_time}
                            onValueChange={function (value) {
                              return setEditingAvailability(
                                __assign(__assign({}, editingAvailability), { end_time: value }),
                              );
                            }}
                          >
                            <select_1.SelectTrigger>
                              <select_1.SelectValue />
                            </select_1.SelectTrigger>
                            <select_1.SelectContent>
                              {timeOptions.slice(32, 48).map(function (option) {
                                return (
                                  <select_1.SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </select_1.SelectItem>
                                );
                              })}
                            </select_1.SelectContent>
                          </select_1.Select>
                        </div>
                      </div>

                      <separator_1.Separator />

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label_1.Label>Início do Intervalo</label_1.Label>
                          <select_1.Select
                            value={editingAvailability.break_start_time || ""}
                            onValueChange={function (value) {
                              return setEditingAvailability(
                                __assign(__assign({}, editingAvailability), {
                                  break_start_time: value || undefined,
                                }),
                              );
                            }}
                          >
                            <select_1.SelectTrigger>
                              <select_1.SelectValue placeholder="Sem intervalo" />
                            </select_1.SelectTrigger>
                            <select_1.SelectContent>
                              <select_1.SelectItem value="">Sem intervalo</select_1.SelectItem>
                              {timeOptions.slice(22, 32).map(function (option) {
                                return (
                                  <select_1.SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </select_1.SelectItem>
                                );
                              })}
                            </select_1.SelectContent>
                          </select_1.Select>
                        </div>

                        <div>
                          <label_1.Label>Fim do Intervalo</label_1.Label>
                          <select_1.Select
                            value={editingAvailability.break_end_time || ""}
                            onValueChange={function (value) {
                              return setEditingAvailability(
                                __assign(__assign({}, editingAvailability), {
                                  break_end_time: value || undefined,
                                }),
                              );
                            }}
                            disabled={!editingAvailability.break_start_time}
                          >
                            <select_1.SelectTrigger>
                              <select_1.SelectValue placeholder="Fim do intervalo" />
                            </select_1.SelectTrigger>
                            <select_1.SelectContent>
                              {timeOptions.slice(24, 34).map(function (option) {
                                return (
                                  <select_1.SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </select_1.SelectItem>
                                );
                              })}
                            </select_1.SelectContent>
                          </select_1.Select>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <dialog_1.DialogFooter>
                  <button_1.Button
                    variant="outline"
                    onClick={function () {
                      return setEditingAvailability(null);
                    }}
                  >
                    Cancelar
                  </button_1.Button>
                  <button_1.Button
                    onClick={handleSaveAvailability}
                    disabled={updateAvailabilityMutation.isPending}
                  >
                    {updateAvailabilityMutation.isPending && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    )}
                    <lucide_react_1.Save className="w-4 h-4 mr-2" />
                    Salvar
                  </button_1.Button>
                </dialog_1.DialogFooter>
              </dialog_1.DialogContent>
            </dialog_1.Dialog>
          )}
        </>
      )}

      {!selectedProfessional && (
        <card_1.Card>
          <card_1.CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <lucide_react_1.User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Selecione um Profissional</h3>
              <p className="text-gray-500">
                Escolha um profissional para configurar sua disponibilidade
              </p>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      )}
    </div>
  );
};
exports.default = ProfessionalScheduleManager;

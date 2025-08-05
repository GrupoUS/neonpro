"use client";
"use strict";
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
exports.AlternativeSlotSuggestion = AlternativeSlotSuggestion;
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var separator_1 = require("@/components/ui/separator");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var sonner_1 = require("sonner");
function AlternativeSlotSuggestion(_a) {
  var _this = this;
  var clinicId = _a.clinicId,
    professionalId = _a.professionalId,
    serviceTypeId = _a.serviceTypeId,
    originalStartTime = _a.originalStartTime,
    originalEndTime = _a.originalEndTime,
    excludeAppointmentId = _a.excludeAppointmentId,
    onSlotSelected = _a.onSlotSelected,
    onClose = _a.onClose,
    _b = _a.maxSuggestions,
    maxSuggestions = _b === void 0 ? 6 : _b,
    _c = _a.searchWindowDays,
    searchWindowDays = _c === void 0 ? 14 : _c;
  var _d = (0, react_1.useState)(false),
    isLoading = _d[0],
    setIsLoading = _d[1];
  var _e = (0, react_1.useState)([]),
    suggestions = _e[0],
    setSuggestions = _e[1];
  var _f = (0, react_1.useState)(null),
    searchInfo = _f[0],
    setSearchInfo = _f[1];
  var _g = (0, react_1.useState)(null),
    selectedSlot = _g[0],
    setSelectedSlot = _g[1];
  // Calculate duration from original times
  var durationMinutes = Math.round(
    ((0, date_fns_1.parseISO)(originalEndTime).getTime() -
      (0, date_fns_1.parseISO)(originalStartTime).getTime()) /
      (1000 * 60),
  );
  (0, react_1.useEffect)(
    function () {
      if (professionalId && serviceTypeId && originalStartTime) {
        searchAlternativeSlots();
      }
    },
    [professionalId, serviceTypeId, originalStartTime, originalEndTime],
  );
  var searchAlternativeSlots = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var params, queryString, response, data, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            setIsLoading(true);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 4, 5, 6]);
            params = {
              professional_id: professionalId,
              service_type_id: serviceTypeId,
              preferred_start_time: originalStartTime,
              duration_minutes: durationMinutes,
              exclude_appointment_id: excludeAppointmentId,
              max_suggestions: maxSuggestions,
              search_window_days: searchWindowDays,
              clinic_id: clinicId,
            };
            queryString = new URLSearchParams(params).toString();
            return [4 /*yield*/, fetch("/api/appointments/suggest-slots?".concat(queryString))];
          case 2:
            response = _a.sent();
            if (!response.ok) {
              throw new Error("Failed to fetch alternative slots");
            }
            return [4 /*yield*/, response.json()];
          case 3:
            data = _a.sent();
            setSuggestions(data.suggestions);
            setSearchInfo(data.search_info);
            return [3 /*break*/, 6];
          case 4:
            error_1 = _a.sent();
            console.error("Error fetching alternative slots:", error_1);
            sonner_1.toast.error("Erro ao buscar horários alternativos");
            return [3 /*break*/, 6];
          case 5:
            setIsLoading(false);
            return [7 /*endfinally*/];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  var handleSlotSelect = function (slot) {
    setSelectedSlot(slot.start_time);
    onSlotSelected(slot);
  };
  var formatSlotTime = function (slot) {
    var startDate = (0, date_fns_1.parseISO)(slot.start_time);
    var endDate = (0, date_fns_1.parseISO)(slot.end_time);
    return ""
      .concat(
        (0, date_fns_1.format)(startDate, "EEEE, dd/MM", { locale: locale_1.ptBR }),
        " \u2022 ",
      )
      .concat((0, date_fns_1.format)(startDate, "HH:mm", { locale: locale_1.ptBR }), "-")
      .concat((0, date_fns_1.format)(endDate, "HH:mm", { locale: locale_1.ptBR }));
  };
  var getSlotScore = function (slot) {
    return slot.score || 0;
  };
  var getSlotScoreColor = function (score) {
    if (score >= 90) return "text-green-600 bg-green-50";
    if (score >= 70) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };
  var getSlotScoreLabel = function (score) {
    if (score >= 90) return "Excelente";
    if (score >= 70) return "Boa";
    return "Aceitável";
  };
  var getDaysFromOriginal = function (slotTime) {
    var original = (0, date_fns_1.parseISO)(originalStartTime);
    var slot = (0, date_fns_1.parseISO)(slotTime);
    return Math.ceil((slot.getTime() - original.getTime()) / (1000 * 60 * 60 * 24));
  };
  var groupSlotsByDate = function (slots) {
    var groups = {};
    slots.forEach(function (slot) {
      var date = (0, date_fns_1.format)((0, date_fns_1.parseISO)(slot.start_time), "yyyy-MM-dd");
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(slot);
    });
    return groups;
  };
  var groupedSlots = groupSlotsByDate(suggestions);
  var hasSlots = suggestions.length > 0;
  return (
    <card_1.Card className="w-full max-w-2xl">
      <card_1.CardHeader>
        <div className="flex items-center justify-between">
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.CalendarDays className="h-5 w-5 text-blue-600" />
            Horários Alternativos
          </card_1.CardTitle>
          {onClose && (
            <button_1.Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </button_1.Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Encontre horários disponíveis próximos ao horário desejado
        </p>
      </card_1.CardHeader>
      <card_1.CardContent>
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <lucide_react_1.Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Buscando horários alternativos...</p>
            </div>
          </div>
        )}

        {/* No Slots Found */}
        {!isLoading && !hasSlots && (
          <div className="text-center py-8">
            <lucide_react_1.AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
            <h3 className="font-medium mb-2">Nenhum horário alternativo encontrado</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Não encontramos horários disponíveis nos próximos {searchWindowDays} dias.
            </p>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>• Tente escolher um período diferente</p>
              <p>• Considere outros profissionais</p>
              <p>• Verifique se há feriados configurados</p>
            </div>
          </div>
        )}

        {/* Slots Display */}
        {!isLoading && hasSlots && (
          <div className="space-y-6">
            {/* Search Info */}
            {searchInfo && (
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-blue-900 text-sm">
                  <lucide_react_1.CheckCircle className="h-4 w-4" />
                  <span>
                    Encontrados {searchInfo.available_slots_found} horários disponíveis de{" "}
                    {searchInfo.total_slots_checked} verificados
                  </span>
                </div>
              </div>
            )}

            {/* Grouped Slots */}
            {Object.entries(groupedSlots).map(function (_a) {
              var date = _a[0],
                slots = _a[1];
              var dateObj = (0, date_fns_1.parseISO)(date);
              var isToday = (0, date_fns_1.isSameDay)(dateObj, new Date());
              var daysFromOriginal = getDaysFromOriginal(slots[0].start_time);
              return (
                <div key={date} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">
                      {(0, date_fns_1.format)(dateObj, "EEEE, dd/MM/yyyy", {
                        locale: locale_1.ptBR,
                      })}
                    </h4>
                    {isToday && (
                      <badge_1.Badge variant="default" className="text-xs">
                        Hoje
                      </badge_1.Badge>
                    )}
                    {daysFromOriginal > 0 && (
                      <badge_1.Badge variant="secondary" className="text-xs">
                        +{daysFromOriginal} dia{daysFromOriginal > 1 ? "s" : ""}
                      </badge_1.Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {slots.map(function (slot, index) {
                      var score = getSlotScore(slot);
                      var isSelected = selectedSlot === slot.start_time;
                      return (
                        <card_1.Card
                          key={index}
                          className={"cursor-pointer transition-all hover:shadow-md ".concat(
                            isSelected ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50",
                          )}
                          onClick={function () {
                            return handleSlotSelect(slot);
                          }}
                        >
                          <card_1.CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <lucide_react_1.Clock className="h-4 w-4 text-blue-600" />
                                <span className="font-medium">
                                  {(0, date_fns_1.format)(
                                    (0, date_fns_1.parseISO)(slot.start_time),
                                    "HH:mm",
                                  )}{" "}
                                  -{" "}
                                  {(0, date_fns_1.format)(
                                    (0, date_fns_1.parseISO)(slot.end_time),
                                    "HH:mm",
                                  )}
                                </span>
                              </div>
                              {score > 0 && (
                                <badge_1.Badge
                                  className={"text-xs ".concat(getSlotScoreColor(score))}
                                >
                                  <lucide_react_1.Star className="h-3 w-3 mr-1" />
                                  {getSlotScoreLabel(score)}
                                </badge_1.Badge>
                              )}
                            </div>

                            {slot.reason && (
                              <p className="text-xs text-muted-foreground mb-2">{slot.reason}</p>
                            )}

                            {slot.conflicts && slot.conflicts.length > 0 && (
                              <div className="space-y-1">
                                {slot.conflicts.map(function (conflict, cIndex) {
                                  return (
                                    <div
                                      key={cIndex}
                                      className={"text-xs p-2 rounded ".concat(
                                        conflict.severity === "warning"
                                          ? "bg-amber-50 text-amber-700"
                                          : "bg-red-50 text-red-700",
                                      )}
                                    >
                                      {conflict.message}
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <lucide_react_1.User className="h-3 w-3" />
                                Disponível
                              </div>
                              <lucide_react_1.ArrowRight
                                className={"h-4 w-4 transition-transform ".concat(
                                  isSelected ? "text-blue-600 scale-110" : "text-muted-foreground",
                                )}
                              />
                            </div>
                          </card_1.CardContent>
                        </card_1.Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <separator_1.Separator />

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button_1.Button
                onClick={function () {
                  return searchAlternativeSlots();
                }}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <lucide_react_1.Loader2 className="h-4 w-4" />
                Buscar Mais
              </button_1.Button>
              <div className="text-xs text-muted-foreground">
                Mostrando até {maxSuggestions} sugestões nos próximos {searchWindowDays} dias
              </div>
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="mt-6 p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-600 space-y-1">
            <p>
              <strong>Como funciona:</strong>
            </p>
            <p>• Horários são ordenados por proximidade e disponibilidade</p>
            <p>• Badges indicam a qualidade da sugestão baseada em preferências</p>
            <p>• Clique em um horário para aplicá-lo automaticamente</p>
            <p>• Conflitos menores são mostrados como avisos</p>
          </div>
        </div>
      </card_1.CardContent>
    </card_1.Card>
  );
}

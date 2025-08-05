// =============================================
// NeonPro Integrated Calendar View Component
// Story 1.2: Task 6 - Calendar visualization integration
// Research-based implementation with react-big-calendar + alternative slots
// =============================================
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
exports.default = IntegratedCalendarView;
var react_1 = require("react");
var react_big_calendar_1 = require("react-big-calendar");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var dialog_1 = require("@/components/ui/dialog");
var tabs_1 = require("@/components/ui/tabs");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
var dayjs_1 = require("dayjs");
var duration_1 = require("dayjs/plugin/duration");
require("react-big-calendar/lib/css/react-big-calendar.css");
// Import our enhanced alternative slots system
var use_alternative_slots_1 = require("@/hooks/appointments/use-alternative-slots");
var alternative_slots_display_1 = require("./alternative-slots-display");
// Initialize dayjs plugins for performance (research-based)
dayjs_1.default.extend(duration_1.default);
// Create the localizer with dayjs (performance optimized)
var localizer = (0, react_big_calendar_1.dayjsLocalizer)(dayjs_1.default);
function IntegratedCalendarView(_a) {
  var _this = this;
  var events = _a.events,
    onEventClick = _a.onEventClick,
    onSlotSelect = _a.onSlotSelect,
    _b = _a.view,
    view = _b === void 0 ? "week" : _b,
    _c = _a.date,
    date = _c === void 0 ? new Date() : _c,
    selectedProfessionalId = _a.selectedProfessionalId,
    selectedServiceId = _a.selectedServiceId,
    _d = _a.enableAlternativeSlots,
    enableAlternativeSlots = _d === void 0 ? true : _d,
    _e = _a.conflictDetection,
    conflictDetection = _e === void 0 ? true : _e,
    _f = _a.showPerformanceMetrics,
    showPerformanceMetrics = _f === void 0 ? false : _f,
    _g = _a.mobileOptimized,
    mobileOptimized = _g === void 0 ? true : _g,
    className = _a.className;
  // State management with performance optimization
  var _h = (0, react_1.useState)(view),
    currentView = _h[0],
    setCurrentView = _h[1];
  var _j = (0, react_1.useState)(date),
    currentDate = _j[0],
    setCurrentDate = _j[1];
  var _k = (0, react_1.useState)(null),
    selectedSlot = _k[0],
    setSelectedSlot = _k[1];
  var _l = (0, react_1.useState)(false),
    showAlternativesDialog = _l[0],
    setShowAlternativesDialog = _l[1];
  var _m = (0, react_1.useState)(null),
    conflictingEvent = _m[0],
    setConflictingEvent = _m[1];
  // Alternative slots integration
  var alternativeSlots = (0, use_alternative_slots_1.useAlternativeSlots)();
  // Performance-optimized event processing (research-based)
  var processedEvents = (0, react_1.useMemo)(
    function () {
      return events.map(function (event) {
        return __assign(__assign({}, event), {
          // Enhanced rendering for alternative slots
          style: event.isAlternativeSlot
            ? {
                backgroundColor: "#10b981", // Green for alternatives
                borderColor: "#059669",
                opacity: 0.8,
              }
            : undefined,
        });
      });
    },
    [events],
  );
  // Conflict detection with real-time validation
  var detectConflict = (0, react_1.useCallback)(
    function (slotInfo) {
      if (!conflictDetection) return null;
      var start = slotInfo.start,
        end = slotInfo.end;
      return (
        events.find(function (event) {
          var eventStart = (0, dayjs_1.default)(event.start);
          var eventEnd = (0, dayjs_1.default)(event.end);
          var slotStart = (0, dayjs_1.default)(start);
          var slotEnd = (0, dayjs_1.default)(end);
          // Check for overlap using dayjs optimization
          return (
            (slotStart.isBefore(eventEnd) && slotEnd.isAfter(eventStart)) ||
            (slotStart.isSameOrAfter(eventStart) && slotStart.isBefore(eventEnd)) ||
            (slotEnd.isAfter(eventStart) && slotEnd.isSameOrBefore(eventEnd))
          );
        }) || null
      );
    },
    [events, conflictDetection],
  ); // Enhanced slot selection with conflict handling
  var handleSlotSelect = (0, react_1.useCallback)(
    function (slotInfo) {
      return __awaiter(_this, void 0, void 0, function () {
        var enhancedSlotInfo, conflict, alternativeRequest;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              enhancedSlotInfo = __assign(__assign({}, slotInfo), {
                suggested: false,
                alternativeScore: 0,
              });
              conflict = detectConflict(enhancedSlotInfo);
              if (!conflict) return [3 /*break*/, 3];
              // Handle conflict - show alternative suggestions
              setConflictingEvent(conflict);
              setSelectedSlot(enhancedSlotInfo);
              if (!(enableAlternativeSlots && selectedProfessionalId && selectedServiceId))
                return [3 /*break*/, 2];
              alternativeRequest = {
                professional_id: selectedProfessionalId,
                service_type_id: selectedServiceId,
                preferred_start_time: (0, dayjs_1.default)(slotInfo.start).format(
                  "YYYY-MM-DD HH:mm:ss",
                ),
                duration_minutes: (0, dayjs_1.default)(slotInfo.end).diff(
                  (0, dayjs_1.default)(slotInfo.start),
                  "minutes",
                ),
                search_window_days: 7,
                max_suggestions: 5,
              };
              return [4 /*yield*/, alternativeSlots.getSuggestions(alternativeRequest)];
            case 1:
              _a.sent();
              setShowAlternativesDialog(true);
              _a.label = 2;
            case 2:
              return [3 /*break*/, 4];
            case 3:
              // No conflict - proceed with selection
              setSelectedSlot(enhancedSlotInfo);
              onSlotSelect === null || onSlotSelect === void 0
                ? void 0
                : onSlotSelect(enhancedSlotInfo);
              _a.label = 4;
            case 4:
              return [2 /*return*/];
          }
        });
      });
    },
    [
      detectConflict,
      enableAlternativeSlots,
      selectedProfessionalId,
      selectedServiceId,
      alternativeSlots,
      onSlotSelect,
    ],
  );
  // Enhanced event styling with research-based visual indicators
  var eventStyleGetter = (0, react_1.useCallback)(
    function (event) {
      var _a;
      var backgroundColor = "#3174ad"; // Default blue
      var borderColor = "#265985";
      var color = "white";
      if (event.isAlternativeSlot) {
        // Alternative slot styling (research-based colors)
        backgroundColor =
          event.alternativeScore && event.alternativeScore > 80 ? "#10b981" : "#f59e0b";
        borderColor = event.alternativeScore && event.alternativeScore > 80 ? "#059669" : "#d97706";
      }
      if (
        ((_a = event.resource) === null || _a === void 0 ? void 0 : _a.professionalId) ===
        selectedProfessionalId
      ) {
        // Highlight selected professional's events
        backgroundColor = "#8b5cf6";
        borderColor = "#7c3aed";
      }
      return {
        style: {
          backgroundColor: backgroundColor,
          borderColor: borderColor,
          color: color,
          border: "2px solid ".concat(borderColor),
          borderRadius: "6px",
          fontSize: "0.875rem",
          fontWeight: "500",
        },
      };
    },
    [selectedProfessionalId],
  );
  // Research-based mobile optimization
  var mobileProps = (0, react_1.useMemo)(
    function () {
      if (!mobileOptimized) return {};
      return {
        popup: true,
        popupOffset: { x: 10, y: 10 },
        step: 30, // 30-minute increments for mobile
        timeslots: 2, // Show 2 time slots per hour
        showMultiDayTimes: false,
      };
    },
    [mobileOptimized],
  );
  // Custom components for enhanced UX
  var components = (0, react_1.useMemo)(function () {
    return {
      // Custom event component with alternative slot indicators
      event: function (_a) {
        var event = _a.event;
        return (
          <div className="flex items-center gap-1 truncate">
            {event.isAlternativeSlot && (
              <lucide_react_1.Star className="h-3 w-3 text-yellow-400 flex-shrink-0" />
            )}
            <span className="truncate text-sm">{event.title}</span>
            {event.alternativeScore && event.alternativeScore > 80 && (
              <lucide_react_1.Zap className="h-3 w-3 text-green-400 flex-shrink-0" />
            )}
          </div>
        );
      },
    };
  }, []);
  return (
    <div className={(0, utils_1.cn)("space-y-4", className)}>
      {/* Performance metrics display (research-based) */}
      {showPerformanceMetrics && alternativeSlots.performanceMetrics && (
        <card_1.Card className="border-blue-200 bg-blue-50/30">
          <card_1.CardHeader className="pb-3">
            <card_1.CardTitle className="text-sm flex items-center gap-2">
              <lucide_react_1.TrendingUp className="h-4 w-4 text-blue-600" />
              Calendar Performance Metrics
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent className="pt-0">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Load Time</p>
                <p className="font-medium">
                  {alternativeSlots.performanceMetrics.searchTime.toFixed(0)}ms
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Algorithm Efficiency</p>
                <p className="font-medium">
                  {(alternativeSlots.performanceMetrics.algorithm_efficiency * 100).toFixed(0)}%
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Available Slots</p>
                <p className="font-medium">{alternativeSlots.performanceMetrics.totalOptions}</p>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      )}{" "}
      {/* Main Calendar with Enhanced Integration */}
      <card_1.Card className="overflow-hidden">
        <card_1.CardHeader className="pb-4">
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Calendar className="h-5 w-5" />
            Agenda Integrada
            {conflictDetection && (
              <badge_1.Badge variant="secondary" className="text-xs">
                Detecção de Conflitos Ativa
              </badge_1.Badge>
            )}
          </card_1.CardTitle>
          <card_1.CardDescription>
            Visualização completa com sugestões alternativas integradas
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent className="p-0">
          <div className="h-[600px] p-4">
            <react_big_calendar_1.Calendar
              localizer={localizer}
              events={processedEvents}
              startAccessor="start"
              endAccessor="end"
              titleAccessor="title"
              view={currentView}
              date={currentDate}
              onView={setCurrentView}
              onNavigate={setCurrentDate}
              onSelectEvent={function (event) {
                return onEventClick === null || onEventClick === void 0
                  ? void 0
                  : onEventClick(event);
              }}
              onSelectSlot={handleSlotSelect}
              eventPropGetter={eventStyleGetter}
              components={components}
              selectable
              popup
              step={15}
              timeslots={4}
              min={(0, dayjs_1.default)().hour(6).minute(0).toDate()} // 6:00 AM
              max={(0, dayjs_1.default)().hour(22).minute(0).toDate()} // 10:00 PM
              formats={{
                timeGutterFormat: "HH:mm",
                eventTimeRangeFormat: function (_a) {
                  var start = _a.start,
                    end = _a.end;
                  return ""
                    .concat((0, dayjs_1.default)(start).format("HH:mm"), " - ")
                    .concat((0, dayjs_1.default)(end).format("HH:mm"));
                },
                agendaTimeFormat: "HH:mm",
                agendaDateFormat: "DD/MM/YYYY",
              }}
              messages={{
                allDay: "Dia Todo",
                previous: "Anterior",
                next: "Próximo",
                today: "Hoje",
                month: "Mês",
                week: "Semana",
                day: "Dia",
                agenda: "Agenda",
                date: "Data",
                time: "Hora",
                event: "Agendamento",
                noEventsInRange: "Nenhum agendamento neste período.",
                showMore: function (total) {
                  return "+".concat(total, " mais");
                },
              }}
              {...mobileProps}
            />
          </div>
        </card_1.CardContent>
      </card_1.Card>
      {/* Alternative Slots Dialog with Enhanced Integration */}
      <dialog_1.Dialog open={showAlternativesDialog} onOpenChange={setShowAlternativesDialog}>
        <dialog_1.DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle className="flex items-center gap-2">
              <lucide_react_1.Clock className="h-5 w-5 text-orange-500" />
              Conflito Detectado - Horários Alternativos
            </dialog_1.DialogTitle>
          </dialog_1.DialogHeader>

          <tabs_1.Tabs defaultValue="alternatives" className="w-full">
            <tabs_1.TabsList className="grid w-full grid-cols-2">
              <tabs_1.TabsTrigger value="conflict">Detalhes do Conflito</tabs_1.TabsTrigger>
              <tabs_1.TabsTrigger value="alternatives">Sugestões Alternativas</tabs_1.TabsTrigger>
            </tabs_1.TabsList>

            <tabs_1.TabsContent value="conflict" className="space-y-4">
              {conflictingEvent && (
                <card_1.Card className="border-red-200 bg-red-50/50">
                  <card_1.CardHeader>
                    <card_1.CardTitle className="text-red-700 text-lg">
                      Agendamento Conflitante
                    </card_1.CardTitle>
                  </card_1.CardHeader>
                  <card_1.CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <lucide_react_1.Calendar className="h-4 w-4 text-red-600" />
                        <span className="font-medium">{conflictingEvent.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <lucide_react_1.Clock className="h-4 w-4 text-red-600" />
                        <span>
                          {(0, dayjs_1.default)(conflictingEvent.start).format("DD/MM/YYYY HH:mm")}{" "}
                          -{(0, dayjs_1.default)(conflictingEvent.end).format("HH:mm")}
                        </span>
                      </div>
                      {conflictingEvent.resource && (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-red-600 font-medium">Profissional:</p>
                            <p>{conflictingEvent.resource.professionalName}</p>
                          </div>
                          <div>
                            <p className="text-red-600 font-medium">Serviço:</p>
                            <p>{conflictingEvent.resource.serviceName}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </card_1.CardContent>
                </card_1.Card>
              )}

              {selectedSlot && (
                <card_1.Card className="border-blue-200 bg-blue-50/50">
                  <card_1.CardHeader>
                    <card_1.CardTitle className="text-blue-700 text-lg">
                      Horário Solicitado
                    </card_1.CardTitle>
                  </card_1.CardHeader>
                  <card_1.CardContent>
                    <div className="flex items-center gap-2">
                      <lucide_react_1.Clock className="h-4 w-4 text-blue-600" />
                      <span>
                        {(0, dayjs_1.default)(selectedSlot.start).format("DD/MM/YYYY HH:mm")} -
                        {(0, dayjs_1.default)(selectedSlot.end).format("HH:mm")}
                      </span>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>
              )}
            </tabs_1.TabsContent>

            <tabs_1.TabsContent value="alternatives">
              <alternative_slots_display_1.default
                alternativeSlots={alternativeSlots}
                onSelectSlot={function (slot) {
                  // Convert alternative slot to calendar event
                  var alternativeEvent = {
                    id: "alt-".concat(slot.start_time),
                    title: "Alternativa Sugerida (Score: ".concat(slot.score, ")"),
                    start: new Date(slot.start_time),
                    end: new Date(slot.end_time),
                    isAlternativeSlot: true,
                    alternativeScore: slot.score,
                    alternativeReasons: slot.reasons,
                  };
                  onEventClick === null || onEventClick === void 0
                    ? void 0
                    : onEventClick(alternativeEvent);
                  setShowAlternativesDialog(false);
                }}
                showPerformanceMetrics={showPerformanceMetrics}
                showBookingProbability={true}
                enableRealtimeFiltering={true}
              />
            </tabs_1.TabsContent>
          </tabs_1.Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button_1.Button
              variant="outline"
              onClick={function () {
                return setShowAlternativesDialog(false);
              }}
            >
              Cancelar
            </button_1.Button>
            <button_1.Button
              onClick={function () {
                // Handle force booking despite conflict
                if (selectedSlot) {
                  onSlotSelect === null || onSlotSelect === void 0
                    ? void 0
                    : onSlotSelect(selectedSlot);
                  setShowAlternativesDialog(false);
                }
              }}
            >
              Forçar Agendamento
            </button_1.Button>
          </div>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>
    </div>
  );
}

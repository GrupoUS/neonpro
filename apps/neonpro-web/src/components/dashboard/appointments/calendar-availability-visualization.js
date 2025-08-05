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
exports.CalendarAvailabilityVisualization = CalendarAvailabilityVisualization;
// =============================================
// NeonPro Calendar Availability Visualization
// Story 1.2: Heat map availability display
// =============================================
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var tooltip_1 = require("@/components/ui/tooltip");
var utils_1 = require("@/lib/utils");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
function CalendarAvailabilityVisualization(_a) {
  var _this = this;
  var professionalId = _a.professionalId,
    clinicId = _a.clinicId,
    _b = _a.selectedDate,
    selectedDate = _b === void 0 ? new Date() : _b,
    _c = _a.view,
    view = _c === void 0 ? "week" : _c,
    serviceTypeId = _a.serviceTypeId,
    onSlotClick = _a.onSlotClick,
    _d = _a.showHeatMap,
    showHeatMap = _d === void 0 ? true : _d;
  var _e = (0, react_1.useState)([]),
    availability = _e[0],
    setAvailability = _e[1];
  var _f = (0, react_1.useState)(false),
    isLoading = _f[0],
    setIsLoading = _f[1];
  var _g = (0, react_1.useState)(true),
    showDetails = _g[0],
    setShowDetails = _g[1];
  var _h = (0, react_1.useState)(null),
    hoveredSlot = _h[0],
    setHoveredSlot = _h[1];
  // Calculate date range based on view
  var dateRange = (0, react_1.useMemo)(
    function () {
      switch (view) {
        case "day":
          return {
            start: (0, date_fns_1.startOfDay)(selectedDate),
            end: (0, date_fns_1.endOfDay)(selectedDate),
          };
        case "week":
          return {
            start: (0, date_fns_1.startOfWeek)(selectedDate, { weekStartsOn: 1 }), // Monday
            end: (0, date_fns_1.endOfWeek)(selectedDate, { weekStartsOn: 1 }),
          };
        case "month":
          return {
            start: (0, date_fns_1.startOfWeek)(
              (0, date_fns_1.startOfDay)(
                new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
              ),
            ),
            end: (0, date_fns_1.endOfWeek)(
              (0, date_fns_1.endOfDay)(
                new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0),
              ),
            ),
          };
      }
    },
    [selectedDate, view],
  );
  (0, react_1.useEffect)(
    function () {
      if (professionalId && clinicId) {
        loadAvailabilityData();
      }
    },
    [professionalId, clinicId, dateRange.start, dateRange.end, serviceTypeId],
  );
  var loadAvailabilityData = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var params, response, data, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            setIsLoading(true);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 6, 7, 8]);
            params = new URLSearchParams(
              __assign(
                {
                  professional_id: professionalId,
                  clinic_id: clinicId,
                  start_date: dateRange.start.toISOString(),
                  end_date: dateRange.end.toISOString(),
                },
                serviceTypeId && { service_type_id: serviceTypeId },
              ),
            );
            return [4 /*yield*/, fetch("/api/appointments/availability-heatmap?".concat(params))];
          case 2:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 4];
            return [4 /*yield*/, response.json()];
          case 3:
            data = _a.sent();
            setAvailability(data.days || []);
            return [3 /*break*/, 5];
          case 4:
            console.error("Failed to load availability data");
            _a.label = 5;
          case 5:
            return [3 /*break*/, 8];
          case 6:
            error_1 = _a.sent();
            console.error("Error loading availability:", error_1);
            return [3 /*break*/, 8];
          case 7:
            setIsLoading(false);
            return [7 /*endfinally*/];
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  var getAvailabilityLevel = function (slot) {
    if (!slot.available) return "blocked";
    var hasErrors = slot.conflicts.some(function (c) {
      return c.severity === "error";
    });
    if (hasErrors) return "blocked";
    var hasWarnings = slot.conflicts.some(function (c) {
      return c.severity === "warning";
    });
    if (hasWarnings) return "low";
    var capacityRatio = slot.capacity.used / slot.capacity.maximum;
    if (capacityRatio >= 0.8) return "low";
    if (capacityRatio >= 0.5) return "medium";
    return "high";
  };
  var getAvailabilityColor = function (level) {
    switch (level) {
      case "high":
        return "bg-green-200 hover:bg-green-300 border-green-300";
      case "medium":
        return "bg-yellow-200 hover:bg-yellow-300 border-yellow-300";
      case "low":
        return "bg-orange-200 hover:bg-orange-300 border-orange-300";
      case "blocked":
        return "bg-red-200 hover:bg-red-300 border-red-300";
      case "none":
        return "bg-gray-100 hover:bg-gray-200 border-gray-200";
    }
  };
  var getAvailabilityIcon = function (level) {
    switch (level) {
      case "high":
        return <lucide_react_1.CheckCircle className="h-3 w-3 text-green-600" />;
      case "medium":
        return <lucide_react_1.Clock className="h-3 w-3 text-yellow-600" />;
      case "low":
        return <lucide_react_1.AlertCircle className="h-3 w-3 text-orange-600" />;
      case "blocked":
        return <lucide_react_1.XCircle className="h-3 w-3 text-red-600" />;
      case "none":
        return <div className="h-3 w-3 bg-gray-400 rounded-full" />;
    }
  };
  var getSlotTooltipContent = function (slot) {
    var level = getAvailabilityLevel(slot);
    var time = (0, date_fns_1.format)((0, date_fns_1.parseISO)(slot.time), "HH:mm");
    var content = "".concat(time, "\n");
    switch (level) {
      case "high":
        content += "Totalmente disponível";
        break;
      case "medium":
        content += "Parcialmente ocupado ("
          .concat(slot.capacity.used, "/")
          .concat(slot.capacity.maximum, ")");
        break;
      case "low":
        content += "Pouco dispon\u00EDvel ("
          .concat(slot.capacity.used, "/")
          .concat(slot.capacity.maximum, ")");
        if (slot.conflicts.length > 0) {
          content +=
            "\nAvisos: " +
            slot.conflicts
              .map(function (c) {
                return c.message;
              })
              .join(", ");
        }
        break;
      case "blocked":
        content += "Indisponível";
        if (slot.conflicts.length > 0) {
          content +=
            "\nMotivo: " +
            slot.conflicts
              .map(function (c) {
                return c.message;
              })
              .join(", ");
        }
        break;
      case "none":
        content += "Sem horário configurado";
        break;
    }
    return content;
  };
  var getDaySummary = function (day) {
    var availablePercent = Math.round(
      (day.summary.available_slots / day.summary.total_slots) * 100,
    );
    var level;
    if (availablePercent >= 80) level = "high";
    else if (availablePercent >= 50) level = "medium";
    else if (availablePercent >= 20) level = "low";
    else level = "blocked";
    return { percent: availablePercent, level: level };
  };
  var renderDayView = function () {
    var dayData = availability.find(function (d) {
      return (0, date_fns_1.isSameDay)((0, date_fns_1.parseISO)(d.date), selectedDate);
    });
    if (!dayData) return null;
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">
            {(0, date_fns_1.format)(selectedDate, "EEEE, dd/MM/yyyy", { locale: locale_1.ptBR })}
          </h3>
          <badge_1.Badge variant="secondary">
            {dayData.summary.available_slots} de {dayData.summary.total_slots} disponíveis
          </badge_1.Badge>
        </div>

        <div className="grid grid-cols-12 gap-1">
          {dayData.slots.map(function (slot, index) {
            var level = getAvailabilityLevel(slot);
            return (
              <tooltip_1.TooltipProvider key={index}>
                <tooltip_1.Tooltip>
                  <tooltip_1.TooltipTrigger asChild>
                    <div
                      className={(0, utils_1.cn)(
                        "h-8 rounded border cursor-pointer transition-all",
                        getAvailabilityColor(level),
                      )}
                      onClick={function () {
                        return onSlotClick === null || onSlotClick === void 0
                          ? void 0
                          : onSlotClick(slot);
                      }}
                      onMouseEnter={function () {
                        return setHoveredSlot(slot);
                      }}
                      onMouseLeave={function () {
                        return setHoveredSlot(null);
                      }}
                    >
                      <div className="flex items-center justify-center h-full">
                        {showDetails && getAvailabilityIcon(level)}
                      </div>
                    </div>
                  </tooltip_1.TooltipTrigger>
                  <tooltip_1.TooltipContent>
                    <div className="text-xs whitespace-pre-line">{getSlotTooltipContent(slot)}</div>
                  </tooltip_1.TooltipContent>
                </tooltip_1.Tooltip>
              </tooltip_1.TooltipProvider>
            );
          })}
        </div>

        {/* Time labels */}
        <div className="grid grid-cols-12 gap-1 text-xs text-muted-foreground">
          {dayData.slots
            .filter(function (_, i) {
              return i % 2 === 0;
            })
            .map(function (slot, index) {
              return (
                <div key={index} className="col-span-2 text-center">
                  {(0, date_fns_1.format)((0, date_fns_1.parseISO)(slot.time), "HH:mm")}
                </div>
              );
            })}
        </div>
      </div>
    );
  };
  var renderWeekView = function () {
    var weekDays = [];
    var _loop_1 = function (i) {
      var day = (0, date_fns_1.addDays)(dateRange.start, i);
      var dayData = availability.find(function (d) {
        return (0, date_fns_1.isSameDay)((0, date_fns_1.parseISO)(d.date), day);
      });
      weekDays.push({ date: day, data: dayData });
    };
    for (var i = 0; i < 7; i++) {
      _loop_1(i);
    }
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map(function (_a, dayIndex) {
            var date = _a.date,
              data = _a.data;
            var summary = data ? getDaySummary(data) : { percent: 0, level: "none" };
            return (
              <div key={dayIndex} className="space-y-2">
                <div className="text-center">
                  <div className="text-xs font-medium">
                    {(0, date_fns_1.format)(date, "EEE", { locale: locale_1.ptBR })}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {(0, date_fns_1.format)(date, "dd")}
                  </div>
                  <badge_1.Badge variant="secondary" className="text-xs mt-1">
                    {summary.percent}%
                  </badge_1.Badge>
                </div>

                {showHeatMap && data && (
                  <div className="space-y-1">
                    {data.slots.map(function (slot, slotIndex) {
                      var level = getAvailabilityLevel(slot);
                      return (
                        <tooltip_1.TooltipProvider key={slotIndex}>
                          <tooltip_1.Tooltip>
                            <tooltip_1.TooltipTrigger asChild>
                              <div
                                className={(0, utils_1.cn)(
                                  "h-4 rounded border cursor-pointer transition-all",
                                  getAvailabilityColor(level),
                                )}
                                onClick={function () {
                                  return onSlotClick === null || onSlotClick === void 0
                                    ? void 0
                                    : onSlotClick(slot);
                                }}
                              />
                            </tooltip_1.TooltipTrigger>
                            <tooltip_1.TooltipContent>
                              <div className="text-xs whitespace-pre-line">
                                {getSlotTooltipContent(slot)}
                              </div>
                            </tooltip_1.TooltipContent>
                          </tooltip_1.Tooltip>
                        </tooltip_1.TooltipProvider>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  var renderMonthView = function () {
    // Group days by week
    var weeks = [];
    var currentWeek = [];
    var _loop_2 = function (day) {
      var dayData = availability.find(function (d) {
        return (0, date_fns_1.isSameDay)((0, date_fns_1.parseISO)(d.date), day);
      });
      currentWeek.push({ date: new Date(day), data: dayData });
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    };
    for (
      var day = new Date(dateRange.start);
      day <= dateRange.end;
      day = (0, date_fns_1.addDays)(day, 1)
    ) {
      _loop_2(day);
    }
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }
    return (
      <div className="space-y-2">
        {weeks.map(function (week, weekIndex) {
          return (
            <div key={weekIndex} className="grid grid-cols-7 gap-1">
              {week.map(function (_a, dayIndex) {
                var date = _a.date,
                  data = _a.data;
                var summary = data ? getDaySummary(data) : { percent: 0, level: "none" };
                var isCurrentMonth = date.getMonth() === selectedDate.getMonth();
                return (
                  <tooltip_1.TooltipProvider key={dayIndex}>
                    <tooltip_1.Tooltip>
                      <tooltip_1.TooltipTrigger asChild>
                        <div
                          className={(0, utils_1.cn)(
                            "h-12 rounded border flex flex-col items-center justify-center cursor-pointer transition-all",
                            getAvailabilityColor(summary.level),
                            !isCurrentMonth && "opacity-50",
                          )}
                        >
                          <div className="text-xs font-medium">
                            {(0, date_fns_1.format)(date, "d")}
                          </div>
                          {showDetails && <div className="text-xs">{summary.percent}%</div>}
                        </div>
                      </tooltip_1.TooltipTrigger>
                      <tooltip_1.TooltipContent>
                        <div className="text-xs">
                          {(0, date_fns_1.format)(date, "dd/MM/yyyy", { locale: locale_1.ptBR })}
                          <br />
                          {data
                            ? ""
                                .concat(data.summary.available_slots, "/")
                                .concat(data.summary.total_slots, " slots dispon\u00EDveis")
                            : "Sem dados"}
                        </div>
                      </tooltip_1.TooltipContent>
                    </tooltip_1.Tooltip>
                  </tooltip_1.TooltipProvider>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };
  var renderLegend = function () {
    return (
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-200 rounded border" />
          <span>Alta disponibilidade</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-yellow-200 rounded border" />
          <span>Média disponibilidade</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-orange-200 rounded border" />
          <span>Baixa disponibilidade</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-200 rounded border" />
          <span>Indisponível</span>
        </div>
      </div>
    );
  };
  if (isLoading) {
    return (
      <card_1.Card className="p-6">
        <div className="flex items-center justify-center">
          <lucide_react_1.Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Carregando disponibilidade...</span>
        </div>
      </card_1.Card>
    );
  }
  return (
    <card_1.Card className="p-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <lucide_react_1.Calendar className="h-5 w-5 text-blue-600" />
            <h3 className="font-medium">Mapa de Disponibilidade</h3>
          </div>
          <div className="flex items-center gap-2">
            <button_1.Button
              variant="ghost"
              size="sm"
              onClick={function () {
                return setShowDetails(!showDetails);
              }}
            >
              {showDetails
                ? <lucide_react_1.Eye className="h-4 w-4" />
                : <lucide_react_1.EyeOff className="h-4 w-4" />}
            </button_1.Button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {view === "day" && renderDayView()}
          {view === "week" && renderWeekView()}
          {view === "month" && renderMonthView()}
        </div>

        {/* Legend */}
        {showHeatMap && <div className="border-t pt-4">{renderLegend()}</div>}

        {/* Current hover info */}
        {hoveredSlot && (
          <div className="border-t pt-4">
            <div className="text-sm">
              <strong>Horário selecionado:</strong>{" "}
              {(0, date_fns_1.format)((0, date_fns_1.parseISO)(hoveredSlot.time), "HH:mm")}
              <br />
              <strong>Status:</strong> {hoveredSlot.available ? "Disponível" : "Indisponível"}
              <br />
              <strong>Capacidade:</strong> {hoveredSlot.capacity.used}/
              {hoveredSlot.capacity.maximum}
              {hoveredSlot.conflicts.length > 0 && (
                <>
                  <br />
                  <strong>Conflitos:</strong>{" "}
                  {hoveredSlot.conflicts
                    .map(function (c) {
                      return c.message;
                    })
                    .join(", ")}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </card_1.Card>
  );
}

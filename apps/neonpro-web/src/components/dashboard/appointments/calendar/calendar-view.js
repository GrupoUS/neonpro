"use client";
var __awaiter =
  (this && this.__awaiter) ||
  ((thisArg, _arguments, P, generator) => {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P((resolve) => {
            resolve(value);
          });
    }
    return new (P || (P = Promise))((resolve, reject) => {
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
  });
var __generator =
  (this && this.__generator) ||
  ((thisArg, body) => {
    var _ = {
        label: 0,
        sent: () => {
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
      return (v) => step([n, v]);
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
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarView = CalendarView;
var react_1 = require("react");
var sonner_1 = require("sonner");
var calendar_navigation_1 = require("./calendar-navigation");
var day_view_1 = require("./day-view");
var week_view_1 = require("./week-view");
var month_view_1 = require("./month-view");
function CalendarView(_a) {
  var appointments = _a.appointments,
    onRefresh = _a.onRefresh,
    onAppointmentClick = _a.onAppointmentClick,
    onAppointmentEdit = _a.onAppointmentEdit,
    onAppointmentCancel = _a.onAppointmentCancel,
    onAppointmentComplete = _a.onAppointmentComplete,
    onCreateAppointment = _a.onCreateAppointment,
    className = _a.className;
  // State management
  var _b = (0, react_1.useState)(null),
    currentDate = _b[0],
    setCurrentDate = _b[1];
  var _c = (0, react_1.useState)("week"),
    view = _c[0],
    setView = _c[1];
  var _d = (0, react_1.useState)(false),
    isLoading = _d[0],
    setIsLoading = _d[1];
  // Initialize current date on client side only
  (0, react_1.useEffect)(() => {
    setCurrentDate(new Date());
  }, []);
  // Handle real-time updates via Supabase
  (0, react_1.useEffect)(() => {
    // This will be implemented when we add real-time functionality
    // For now, we can refresh appointments periodically or on window focus
    var handleFocus = () => {
      if (onRefresh) {
        onRefresh();
      }
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [onRefresh]);
  // Handle keyboard shortcuts
  (0, react_1.useEffect)(() => {
    var handleKeyPress = (event) => {
      // Only handle if no input elements are focused
      var activeElement = document.activeElement;
      if (
        (activeElement === null || activeElement === void 0 ? void 0 : activeElement.tagName) ===
          "INPUT" ||
        (activeElement === null || activeElement === void 0 ? void 0 : activeElement.tagName) ===
          "TEXTAREA" ||
        (activeElement === null || activeElement === void 0 ? void 0 : activeElement.tagName) ===
          "SELECT"
      ) {
        return;
      }
      switch (event.key) {
        case "ArrowLeft":
          handlePreviousNavigation();
          break;
        case "ArrowRight":
          handleNextNavigation();
          break;
        case "t":
          setCurrentDate(new Date());
          break;
        case "1":
          setView("day");
          break;
        case "2":
          setView("week");
          break;
        case "3":
          setView("month");
          break;
        case "n":
          if (onCreateAppointment) {
            onCreateAppointment(currentDate || undefined);
          }
          break;
        case "r":
          if (onRefresh) {
            onRefresh();
            sonner_1.toast.success("Calendário atualizado");
          }
          break;
      }
    };
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [currentDate, onCreateAppointment, onRefresh]);
  // Navigation handlers
  var handlePreviousNavigation = (0, react_1.useCallback)(() => {
    if (!currentDate) return;
    var today = new Date();
    switch (view) {
      case "day":
        setCurrentDate((prev) =>
          prev ? new Date(prev.getTime() - 24 * 60 * 60 * 1000) : new Date(),
        );
        break;
      case "week":
        setCurrentDate((prev) =>
          prev ? new Date(prev.getTime() - 7 * 24 * 60 * 60 * 1000) : new Date(),
        );
        break;
      case "month":
        setCurrentDate((prev) => {
          if (!prev) return new Date();
          var newDate = new Date(prev);
          newDate.setMonth(prev.getMonth() - 1);
          return newDate;
        });
        break;
    }
  }, [view, currentDate]);
  var handleNextNavigation = (0, react_1.useCallback)(() => {
    if (!currentDate) return;
    switch (view) {
      case "day":
        setCurrentDate((prev) =>
          prev ? new Date(prev.getTime() + 24 * 60 * 60 * 1000) : new Date(),
        );
        break;
      case "week":
        setCurrentDate((prev) =>
          prev ? new Date(prev.getTime() + 7 * 24 * 60 * 60 * 1000) : new Date(),
        );
        break;
      case "month":
        setCurrentDate((prev) => {
          if (!prev) return new Date();
          var newDate = new Date(prev);
          newDate.setMonth(prev.getMonth() + 1);
          return newDate;
        });
        break;
    }
  }, [view, currentDate]);
  var handleToday = (0, react_1.useCallback)(() => {
    setCurrentDate(new Date());
  }, []);
  // Appointment action handlers with optimistic updates
  var handleAppointmentEdit = (0, react_1.useCallback)(
    (appointment) =>
      __awaiter(this, void 0, void 0, function () {
        var error_1;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              if (!onAppointmentEdit) return [3 /*break*/, 5];
              setIsLoading(true);
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, 4, 5]);
              return [4 /*yield*/, onAppointmentEdit(appointment)];
            case 2:
              _a.sent();
              // Refresh appointments after edit
              if (onRefresh) {
                onRefresh();
              }
              return [3 /*break*/, 5];
            case 3:
              error_1 = _a.sent();
              console.error("Error editing appointment:", error_1);
              sonner_1.toast.error("Erro ao editar agendamento");
              return [3 /*break*/, 5];
            case 4:
              setIsLoading(false);
              return [7 /*endfinally*/];
            case 5:
              return [2 /*return*/];
          }
        });
      }),
    [onAppointmentEdit, onRefresh],
  );
  var handleAppointmentCancel = (0, react_1.useCallback)(
    (appointment) =>
      __awaiter(this, void 0, void 0, function () {
        var error_2;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              if (!onAppointmentCancel) return [3 /*break*/, 5];
              setIsLoading(true);
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, 4, 5]);
              return [4 /*yield*/, onAppointmentCancel(appointment)];
            case 2:
              _a.sent();
              sonner_1.toast.success("Agendamento cancelado");
              // Refresh appointments after cancel
              if (onRefresh) {
                onRefresh();
              }
              return [3 /*break*/, 5];
            case 3:
              error_2 = _a.sent();
              console.error("Error cancelling appointment:", error_2);
              sonner_1.toast.error("Erro ao cancelar agendamento");
              return [3 /*break*/, 5];
            case 4:
              setIsLoading(false);
              return [7 /*endfinally*/];
            case 5:
              return [2 /*return*/];
          }
        });
      }),
    [onAppointmentCancel, onRefresh],
  );
  var handleAppointmentComplete = (0, react_1.useCallback)(
    (appointment) =>
      __awaiter(this, void 0, void 0, function () {
        var error_3;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              if (!onAppointmentComplete) return [3 /*break*/, 5];
              setIsLoading(true);
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, 4, 5]);
              return [4 /*yield*/, onAppointmentComplete(appointment)];
            case 2:
              _a.sent();
              sonner_1.toast.success("Agendamento marcado como concluído");
              // Refresh appointments after complete
              if (onRefresh) {
                onRefresh();
              }
              return [3 /*break*/, 5];
            case 3:
              error_3 = _a.sent();
              console.error("Error completing appointment:", error_3);
              sonner_1.toast.error("Erro ao concluir agendamento");
              return [3 /*break*/, 5];
            case 4:
              setIsLoading(false);
              return [7 /*endfinally*/];
            case 5:
              return [2 /*return*/];
          }
        });
      }),
    [onAppointmentComplete, onRefresh],
  );
  // Handle time slot clicks
  var handleTimeSlotClick = (0, react_1.useCallback)(
    (time) => {
      if (onCreateAppointment) {
        onCreateAppointment(currentDate || undefined, time);
      }
    },
    [currentDate, onCreateAppointment],
  );
  var handleWeekTimeSlotClick = (0, react_1.useCallback)(
    (date, time) => {
      if (onCreateAppointment) {
        onCreateAppointment(date, time);
      }
    },
    [onCreateAppointment],
  );
  var handleDayClick = (0, react_1.useCallback)((date) => {
    // Switch to day view when clicking on a day in month view
    setCurrentDate(date);
    setView("day");
  }, []);
  // Render current view
  var renderCurrentView = () => {
    var commonProps = {
      appointments: appointments,
      onAppointmentClick: onAppointmentClick,
      onAppointmentEdit: handleAppointmentEdit,
      onAppointmentCancel: handleAppointmentCancel,
      onAppointmentComplete: handleAppointmentComplete,
    };
    switch (view) {
      case "day":
        return (
          <day_view_1.DayView
            date={currentDate}
            onTimeSlotClick={handleTimeSlotClick}
            {...commonProps}
          />
        );
      case "week":
        return (
          <week_view_1.WeekView
            date={currentDate}
            onTimeSlotClick={handleWeekTimeSlotClick}
            {...commonProps}
          />
        );
      case "month":
        return (
          <month_view_1.MonthView date={currentDate} onDayClick={handleDayClick} {...commonProps} />
        );
      default:
        return null;
    }
  };
  // Don't render until currentDate is initialized
  if (!currentDate) {
    return (
      <div className={"flex flex-col h-full ".concat(className || "")}>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  return (
    <div className={"flex flex-col h-full ".concat(className || "")}>
      {/* Navigation */}
      <calendar_navigation_1.CalendarNavigation
        currentDate={currentDate}
        view={view}
        onDateChange={setCurrentDate}
        onViewChange={setView}
        onToday={handleToday}
      />

      {/* Current view */}
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
        {renderCurrentView()}
      </div>

      {/* Keyboard shortcuts help */}
      <div className="hidden lg:block p-2 border-t text-xs text-muted-foreground">
        <div className="flex flex-wrap gap-4">
          <span>
            <kbd className="bg-muted px-1 rounded">←/→</kbd> Navegar
          </span>
          <span>
            <kbd className="bg-muted px-1 rounded">T</kbd> Hoje
          </span>
          <span>
            <kbd className="bg-muted px-1 rounded">1/2/3</kbd> Dia/Semana/Mês
          </span>
          <span>
            <kbd className="bg-muted px-1 rounded">N</kbd> Novo agendamento
          </span>
          <span>
            <kbd className="bg-muted px-1 rounded">R</kbd> Atualizar
          </span>
        </div>
      </div>
    </div>
  );
}

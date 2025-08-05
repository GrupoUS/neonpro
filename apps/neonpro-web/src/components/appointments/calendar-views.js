"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarViews = CalendarViews;
exports.MobileCalendarViews = MobileCalendarViews;
var react_1 = require("react");
var button_1 = require("@/components/ui/button");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
var moment_1 = require("moment");
require("moment/locale/pt-br");
// Configure moment for Brazilian Portuguese
moment_1.default.locale("pt-br");
var viewConfig = [
  {
    key: "month",
    label: "Mês",
    icon: lucide_react_1.Calendar,
    shortcut: "M",
  },
  {
    key: "week",
    label: "Semana",
    icon: lucide_react_1.CalendarDays,
    shortcut: "S",
  },
  {
    key: "day",
    label: "Dia",
    icon: lucide_react_1.Clock,
    shortcut: "D",
  },
  {
    key: "agenda",
    label: "Agenda",
    icon: lucide_react_1.List,
    shortcut: "A",
  },
];
function CalendarViews(_a) {
  var currentView = _a.currentView,
    onViewChange = _a.onViewChange,
    currentDate = _a.currentDate,
    onDateChange = _a.onDateChange;
  // Navigation handlers
  var handlePrevious = () => {
    var newDate = (0, moment_1.default)(currentDate).subtract(1, getNavigationUnit()).toDate();
    onDateChange(newDate);
  };
  var handleNext = () => {
    var newDate = (0, moment_1.default)(currentDate).add(1, getNavigationUnit()).toDate();
    onDateChange(newDate);
  };
  var handleToday = () => {
    onDateChange(new Date());
  };
  // Get navigation unit based on current view
  var getNavigationUnit = () => {
    switch (currentView) {
      case "month":
        return "month";
      case "week":
        return "week";
      case "day":
        return "day";
      case "agenda":
        return "week";
      default:
        return "month";
    }
  };
  // Get formatted date label
  var getDateLabel = () => {
    var momentDate = (0, moment_1.default)(currentDate);
    switch (currentView) {
      case "month":
        return momentDate.format("MMMM YYYY");
      case "week": {
        var weekStart = momentDate.startOf("week");
        var weekEnd = momentDate.endOf("week");
        if (weekStart.month() === weekEnd.month()) {
          return ""
            .concat(weekStart.format("DD"), " - ")
            .concat(weekEnd.format("DD"), " de ")
            .concat(momentDate.format("MMMM YYYY"));
        } else {
          return "".concat(weekStart.format("DD MMM"), " - ").concat(weekEnd.format("DD MMM YYYY"));
        }
      }
      case "day":
        return momentDate.format("dddd, DD [de] MMMM [de] YYYY");
      case "agenda":
        return "Agenda - ".concat(momentDate.format("MMMM YYYY"));
      default:
        return momentDate.format("MMMM YYYY");
    }
  };
  // Keyboard shortcuts handler
  react_1.default.useEffect(() => {
    var handleKeyDown = (event) => {
      var _a, _b;
      // Only handle if no input is focused
      if (
        ((_a = document.activeElement) === null || _a === void 0 ? void 0 : _a.tagName) ===
          "INPUT" ||
        ((_b = document.activeElement) === null || _b === void 0 ? void 0 : _b.tagName) ===
          "TEXTAREA"
      ) {
        return;
      }
      // View shortcuts
      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case "m":
            event.preventDefault();
            onViewChange("month");
            break;
          case "s":
            event.preventDefault();
            onViewChange("week");
            break;
          case "d":
            event.preventDefault();
            onViewChange("day");
            break;
          case "a":
            event.preventDefault();
            onViewChange("agenda");
            break;
        }
      }
      // Navigation shortcuts
      switch (event.key) {
        case "ArrowLeft":
          if (event.shiftKey) {
            event.preventDefault();
            handlePrevious();
          }
          break;
        case "ArrowRight":
          if (event.shiftKey) {
            event.preventDefault();
            handleNext();
          }
          break;
        case "Home":
          event.preventDefault();
          handleToday();
          break;
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [currentView, currentDate, onViewChange, onDateChange]);
  return (
    <div className="flex items-center justify-between w-full">
      {/* Navigation Controls */}
      <div className="flex items-center space-x-2">
        <button_1.Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          className="h-8 w-8 p-0"
          title={"Anterior (Shift + \u2190)"}
        >
          <lucide_react_1.ChevronLeft className="h-4 w-4" />
        </button_1.Button>

        <button_1.Button
          variant="outline"
          size="sm"
          onClick={handleToday}
          className="h-8 px-3"
          title="Hoje (Home)"
        >
          <lucide_react_1.RotateCcw className="h-3 w-3 mr-1" />
          Hoje
        </button_1.Button>

        <button_1.Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          className="h-8 w-8 p-0"
          title={"Pr\u00F3ximo (Shift + \u2192)"}
        >
          <lucide_react_1.ChevronRight className="h-4 w-4" />
        </button_1.Button>
      </div>

      {/* Date Label */}
      <div className="flex-1 text-center">
        <h3 className="text-lg font-semibold text-foreground">{getDateLabel()}</h3>
        {currentView === "day" && (
          <p className="text-sm text-muted-foreground">
            {(0, moment_1.default)().isSame(currentDate, "day") ? "Hoje" : ""}
          </p>
        )}
      </div>

      {/* View Toggle Buttons */}
      <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
        {viewConfig.map((_a) => {
          var key = _a.key,
            label = _a.label,
            Icon = _a.icon,
            shortcut = _a.shortcut;
          return (
            <button_1.Button
              key={key}
              variant={currentView === key ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onViewChange(key)}
              className={(0, utils_1.cn)(
                "h-8 px-3 text-xs font-medium transition-all",
                currentView === key ? "bg-background shadow-sm" : "hover:bg-background/50",
              )}
              title={"".concat(label, " (Ctrl/Cmd + ").concat(shortcut, ")")}
            >
              <Icon className="h-3 w-3 mr-1" />
              {label}
            </button_1.Button>
          );
        })}
      </div>
    </div>
  );
}
// Additional component for mobile view toggle
function MobileCalendarViews(_a) {
  var currentView = _a.currentView,
    onViewChange = _a.onViewChange,
    currentDate = _a.currentDate,
    onDateChange = _a.onDateChange;
  var handlePrevious = () => {
    var unit = currentView === "month" ? "month" : currentView === "week" ? "week" : "day";
    var newDate = (0, moment_1.default)(currentDate).subtract(1, unit).toDate();
    onDateChange(newDate);
  };
  var handleNext = () => {
    var unit = currentView === "month" ? "month" : currentView === "week" ? "week" : "day";
    var newDate = (0, moment_1.default)(currentDate).add(1, unit).toDate();
    onDateChange(newDate);
  };
  var getShortDateLabel = () => {
    var momentDate = (0, moment_1.default)(currentDate);
    switch (currentView) {
      case "month":
        return momentDate.format("MMM YYYY");
      case "week":
        return ""
          .concat(momentDate.startOf("week").format("DD/MM"), " - ")
          .concat(momentDate.endOf("week").format("DD/MM"));
      case "day":
        return momentDate.format("DD/MM");
      case "agenda":
        return "Agenda";
      default:
        return momentDate.format("MMM YYYY");
    }
  };
  return (
    <div className="flex flex-col space-y-3 md:hidden">
      {/* Date Navigation */}
      <div className="flex items-center justify-between">
        <button_1.Button variant="ghost" size="sm" onClick={handlePrevious}>
          <lucide_react_1.ChevronLeft className="h-4 w-4" />
        </button_1.Button>

        <h3 className="text-lg font-semibold">{getShortDateLabel()}</h3>

        <button_1.Button variant="ghost" size="sm" onClick={handleNext}>
          <lucide_react_1.ChevronRight className="h-4 w-4" />
        </button_1.Button>
      </div>

      {/* View Toggle */}
      <div className="grid grid-cols-4 gap-1 bg-muted rounded-lg p-1">
        {viewConfig.map((_a) => {
          var key = _a.key,
            label = _a.label,
            Icon = _a.icon;
          return (
            <button_1.Button
              key={key}
              variant={currentView === key ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onViewChange(key)}
              className={(0, utils_1.cn)(
                "h-8 text-xs",
                currentView === key && "bg-background shadow-sm",
              )}
            >
              <Icon className="h-3 w-3 mr-1" />
              {label}
            </button_1.Button>
          );
        })}
      </div>
    </div>
  );
}

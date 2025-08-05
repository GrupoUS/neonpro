"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarNavigation = CalendarNavigation;
var react_1 = require("react");
var button_1 = require("@/components/ui/button");
var select_1 = require("@/components/ui/select");
var utils_1 = require("@/lib/utils");
var lucide_react_1 = require("lucide-react");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
function CalendarNavigation(_a) {
    var currentDate = _a.currentDate, view = _a.view, onDateChange = _a.onDateChange, onViewChange = _a.onViewChange, onToday = _a.onToday, className = _a.className;
    var navigatePrevious = function () {
        switch (view) {
            case "day":
                onDateChange((0, date_fns_1.subDays)(currentDate, 1));
                break;
            case "week":
                onDateChange((0, date_fns_1.subWeeks)(currentDate, 1));
                break;
            case "month":
                onDateChange((0, date_fns_1.subMonths)(currentDate, 1));
                break;
        }
    };
    var navigateNext = function () {
        switch (view) {
            case "day":
                onDateChange((0, date_fns_1.addDays)(currentDate, 1));
                break;
            case "week":
                onDateChange((0, date_fns_1.addWeeks)(currentDate, 1));
                break;
            case "month":
                onDateChange((0, date_fns_1.addMonths)(currentDate, 1));
                break;
        }
    };
    var getDateRangeText = function () {
        switch (view) {
            case "day":
                return (0, date_fns_1.format)(currentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: locale_1.ptBR });
            case "week": {
                var startOfWeek = new Date(currentDate);
                startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
                var endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
                    return "".concat((0, date_fns_1.format)(startOfWeek, "d", { locale: locale_1.ptBR }), " - ").concat((0, date_fns_1.format)(endOfWeek, "d 'de' MMMM 'de' yyyy", { locale: locale_1.ptBR }));
                }
                else {
                    return "".concat((0, date_fns_1.format)(startOfWeek, "d 'de' MMM", { locale: locale_1.ptBR }), " - ").concat((0, date_fns_1.format)(endOfWeek, "d 'de' MMM 'de' yyyy", { locale: locale_1.ptBR }));
                }
            }
            case "month":
                return (0, date_fns_1.format)(currentDate, "MMMM 'de' yyyy", { locale: locale_1.ptBR });
            default:
                return "";
        }
    };
    var viewIcons = {
        day: lucide_react_1.Clock,
        week: lucide_react_1.Grid3X3,
        month: lucide_react_1.LayoutGrid,
    };
    var viewLabels = {
        day: "Dia",
        week: "Semana",
        month: "Mês",
    };
    return (<div className={(0, utils_1.cn)("flex items-center justify-between gap-4 p-4 border-b", className)}>
      {/* Left side - Date navigation */}
      <div className="flex items-center gap-2">
        <button_1.Button variant="outline" size="sm" onClick={navigatePrevious} className="h-9 w-9 p-0">
          <lucide_react_1.ChevronLeft className="h-4 w-4"/>
        </button_1.Button>
        
        <button_1.Button variant="outline" size="sm" onClick={navigateNext} className="h-9 w-9 p-0">
          <lucide_react_1.ChevronRight className="h-4 w-4"/>
        </button_1.Button>

        <button_1.Button variant="outline" size="sm" onClick={onToday} className="h-9 px-3">
          Hoje
        </button_1.Button>

        <div className="flex items-center gap-2 ml-4">
          <lucide_react_1.Calendar className="h-4 w-4 text-muted-foreground"/>
          <span className="font-semibold text-lg min-w-0">
            {getDateRangeText()}
          </span>
        </div>
      </div>

      {/* Right side - View selection */}
      <div className="flex items-center gap-2">
        <select_1.Select value={view} onValueChange={function (value) { return onViewChange(value); }}>
          <select_1.SelectTrigger className="h-9 w-[120px]">
            <select_1.SelectValue />
          </select_1.SelectTrigger>
          <select_1.SelectContent>
            {Object.entries(viewLabels).map(function (_a) {
            var key = _a[0], label = _a[1];
            var IconComponent = viewIcons[key];
            return (<select_1.SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-4 w-4"/>
                    <span>{label}</span>
                  </div>
                </select_1.SelectItem>);
        })}
          </select_1.SelectContent>
        </select_1.Select>

        {/* Quick view toggle buttons */}
        <div className="hidden md:flex items-center gap-1 border rounded-md p-1">
          {Object.entries(viewLabels).map(function (_a) {
            var key = _a[0], label = _a[1];
            var IconComponent = viewIcons[key];
            return (<button_1.Button key={key} variant={view === key ? "secondary" : "ghost"} size="sm" onClick={function () { return onViewChange(key); }} className="h-7 px-2" title={label}>
                <IconComponent className="h-4 w-4"/>
                <span className="ml-1 text-xs">{label}</span>
              </button_1.Button>);
        })}
        </div>
      </div>
    </div>);
}

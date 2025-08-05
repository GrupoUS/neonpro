"use client";
var __spreadArray =
  (this && this.__spreadArray) ||
  ((to, from, pack) => {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentCalendarView = AppointmentCalendarView;
var react_1 = require("react");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
var statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  confirmed: "bg-blue-100 text-blue-800 border-blue-300",
  cancelled: "bg-red-100 text-red-800 border-red-300",
  completed: "bg-green-100 text-green-800 border-green-300",
  no_show: "bg-red-100 text-red-800 border-red-300",
  rescheduled: "bg-purple-100 text-purple-800 border-purple-300",
};
function AppointmentCalendarView(_a) {
  var appointments = _a.appointments,
    currentDate = _a.currentDate,
    onDateChange = _a.onDateChange,
    onAppointmentSelect = _a.onAppointmentSelect,
    onDaySelect = _a.onDaySelect,
    onCreateAppointment = _a.onCreateAppointment,
    _b = _a.loading,
    loading = _b === void 0 ? false : _b,
    className = _a.className;
  var _c = (0, react_1.useState)(null),
    selectedDate = _c[0],
    setSelectedDate = _c[1];
  var _d = (0, react_1.useState)("month"),
    viewMode = _d[0],
    setViewMode = _d[1];
  // Calculate calendar days
  var calendarDays = (0, react_1.useMemo)(() => {
    var monthStart = (0, date_fns_1.startOfMonth)(currentDate);
    var monthEnd = (0, date_fns_1.endOfMonth)(currentDate);
    var calendarStart = (0, date_fns_1.startOfWeek)(monthStart, { locale: locale_1.pt });
    var calendarEnd = (0, date_fns_1.endOfWeek)(monthEnd, { locale: locale_1.pt });
    var days = (0, date_fns_1.eachDayOfInterval)({ start: calendarStart, end: calendarEnd });
    return days.map((date) => {
      var dayAppointments = appointments.filter((appointment) =>
        (0, date_fns_1.isSameDay)(new Date(appointment.date_time), date),
      );
      return {
        date: date,
        isCurrentMonth: (0, date_fns_1.isSameMonth)(date, currentDate),
        isToday: (0, date_fns_1.isToday)(date),
        appointments: dayAppointments,
      };
    });
  }, [currentDate, appointments]);
  // Get appointments for selected date
  var selectedDateAppointments = (0, react_1.useMemo)(() => {
    if (!selectedDate) return [];
    return appointments
      .filter((appointment) =>
        (0, date_fns_1.isSameDay)(new Date(appointment.date_time), selectedDate),
      )
      .sort((a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime());
  }, [selectedDate, appointments]);
  var navigateMonth = (direction) => {
    var newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === "next" ? 1 : -1));
    onDateChange(newDate);
  };
  var handleDayClick = (day) => {
    setSelectedDate(day.date);
    onDaySelect === null || onDaySelect === void 0 ? void 0 : onDaySelect(day.date);
  };
  var formatTime = (dateTime) =>
    (0, date_fns_1.format)(new Date(dateTime), "HH:mm", { locale: locale_1.pt });
  if (loading) {
    return (
      <card_1.Card className={className}>
        <card_1.CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="grid grid-cols-7 gap-2">
              {__spreadArray([], Array(35), true).map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  var weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  return (
    <div className={(0, utils_1.cn)("space-y-4", className)}>
      <card_1.Card>
        <card_1.CardHeader>
          <div className="flex items-center justify-between">
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.Calendar className="h-5 w-5" />
              {(0, date_fns_1.format)(currentDate, "MMMM yyyy", { locale: locale_1.pt })}
            </card_1.CardTitle>

            <div className="flex items-center space-x-2">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-muted rounded-md p-1">
                <button_1.Button
                  variant={viewMode === "month" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("month")}
                  className="px-3"
                >
                  <lucide_react_1.Grid3x3 className="h-4 w-4" />
                </button_1.Button>
                <button_1.Button
                  variant={viewMode === "week" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("week")}
                  className="px-3"
                >
                  <lucide_react_1.List className="h-4 w-4" />
                </button_1.Button>
              </div>

              {/* Navigation */}
              <button_1.Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                <lucide_react_1.ChevronLeft className="h-4 w-4" />
              </button_1.Button>
              <button_1.Button variant="outline" size="sm" onClick={() => onDateChange(new Date())}>
                Hoje
              </button_1.Button>
              <button_1.Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                <lucide_react_1.ChevronRight className="h-4 w-4" />
              </button_1.Button>
            </div>
          </div>
        </card_1.CardHeader>

        <card_1.CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
            {/* Weekday Headers */}
            {weekdays.map((day, index) => (
              <div
                key={day}
                className="bg-muted p-3 text-center text-sm font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={(0, utils_1.cn)(
                  "bg-background p-2 min-h-[80px] cursor-pointer hover:bg-muted/50 transition-colors",
                  !day.isCurrentMonth && "opacity-40",
                  day.isToday && "bg-primary/5",
                  selectedDate &&
                    (0, date_fns_1.isSameDay)(day.date, selectedDate) &&
                    "bg-primary/10 ring-2 ring-primary",
                )}
                onClick={() => handleDayClick(day)}
              >
                <div className="flex justify-between items-start mb-1">
                  <span
                    className={(0, utils_1.cn)(
                      "text-sm font-medium",
                      day.isToday && "text-primary",
                    )}
                  >
                    {(0, date_fns_1.format)(day.date, "d")}
                  </span>

                  {day.appointments.length > 0 && (
                    <badge_1.Badge variant="secondary" className="text-xs h-4 px-1">
                      {day.appointments.length}
                    </badge_1.Badge>
                  )}
                </div>

                {/* Appointment previews */}
                <div className="space-y-1">
                  {day.appointments.slice(0, 2).map((appointment) => (
                    <div
                      key={appointment.id}
                      className={(0, utils_1.cn)(
                        "text-xs p-1 rounded border cursor-pointer truncate",
                        statusColors[appointment.status],
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAppointmentSelect === null || onAppointmentSelect === void 0
                          ? void 0
                          : onAppointmentSelect(appointment);
                      }}
                      title={""
                        .concat(formatTime(appointment.date_time), " - ")
                        .concat(appointment.patient.full_name)}
                    >
                      <div className="flex items-center gap-1">
                        <lucide_react_1.Clock className="h-3 w-3" />
                        {formatTime(appointment.date_time)}
                      </div>
                      <div className="truncate">{appointment.patient.full_name}</div>
                    </div>
                  ))}

                  {day.appointments.length > 2 && (
                    <div className="text-xs text-muted-foreground px-1">
                      +{day.appointments.length - 2} mais
                    </div>
                  )}
                </div>

                {/* Add appointment button on hover */}
                <div className="opacity-0 hover:opacity-100 transition-opacity mt-1">
                  <button_1.Button
                    variant="ghost"
                    size="sm"
                    className="w-full h-6 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCreateAppointment === null || onCreateAppointment === void 0
                        ? void 0
                        : onCreateAppointment(day.date);
                    }}
                  >
                    +
                  </button_1.Button>
                </div>
              </div>
            ))}
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Selected Date Details */}
      {selectedDate && selectedDateAppointments.length > 0 && (
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.Calendar className="h-4 w-4" />
              {(0, date_fns_1.format)(selectedDate, "dd 'de' MMMM", { locale: locale_1.pt })}
              <badge_1.Badge variant="outline">
                {selectedDateAppointments.length} agendamento
                {selectedDateAppointments.length !== 1 ? "s" : ""}
              </badge_1.Badge>
            </card_1.CardTitle>
          </card_1.CardHeader>

          <card_1.CardContent className="space-y-3">
            {selectedDateAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() =>
                  onAppointmentSelect === null || onAppointmentSelect === void 0
                    ? void 0
                    : onAppointmentSelect(appointment)
                }
              >
                <div className="flex items-center space-x-3">
                  <div className="flex flex-col items-center">
                    <lucide_react_1.Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{formatTime(appointment.date_time)}</span>
                  </div>

                  <div>
                    <p className="font-medium">{appointment.patient.full_name}</p>
                    <p className="text-sm text-muted-foreground">{appointment.service.name}</p>
                    {appointment.professional && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <lucide_react_1.User className="h-3 w-3" />
                        {appointment.professional.full_name}
                      </p>
                    )}
                  </div>
                </div>

                <badge_1.Badge variant="outline" className={statusColors[appointment.status]}>
                  {appointment.status === "pending" && "Pendente"}
                  {appointment.status === "confirmed" && "Confirmado"}
                  {appointment.status === "cancelled" && "Cancelado"}
                  {appointment.status === "completed" && "Concluído"}
                  {appointment.status === "no_show" && "Não Compareceu"}
                  {appointment.status === "rescheduled" && "Reagendado"}
                </badge_1.Badge>
              </div>
            ))}
          </card_1.CardContent>
        </card_1.Card>
      )}
    </div>
  );
}

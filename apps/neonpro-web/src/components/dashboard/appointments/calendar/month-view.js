"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonthView = MonthView;
var react_1 = require("react");
var badge_1 = require("@/components/ui/badge");
var utils_1 = require("@/lib/utils");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
function MonthView(_a) {
  var date = _a.date,
    appointments = _a.appointments,
    onAppointmentClick = _a.onAppointmentClick,
    onDayClick = _a.onDayClick,
    className = _a.className;
  // Get month boundaries
  var monthStart = (0, date_fns_1.startOfMonth)(date);
  var monthEnd = (0, date_fns_1.endOfMonth)(date);
  // Get the full calendar grid (including leading/trailing days)
  var calendarStart = (0, date_fns_1.startOfWeek)(monthStart, { weekStartsOn: 0 });
  var calendarEnd = (0, date_fns_1.endOfWeek)(monthEnd, { weekStartsOn: 0 });
  var calendarDays = (0, date_fns_1.eachDayOfInterval)({ start: calendarStart, end: calendarEnd });
  // Get appointments for the month
  var monthAppointments = appointments.filter((appointment) => {
    var appointmentDate = new Date(appointment.start_time);
    return appointmentDate >= calendarStart && appointmentDate <= calendarEnd;
  });
  // Get appointments for a specific day
  var getAppointmentsForDay = (day) =>
    monthAppointments.filter((appointment) =>
      (0, date_fns_1.isSameDay)(new Date(appointment.start_time), day),
    );
  // Get appointment count by status for a day
  var getStatusCounts = (dayAppointments) => {
    var counts = {
      scheduled: 0,
      confirmed: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
      no_show: 0,
    };
    dayAppointments.forEach((appointment) => {
      if (Object.hasOwn(counts, appointment.status)) {
        counts[appointment.status]++;
      }
    });
    return counts;
  };
  var weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  var handleDayClick = (day) => {
    if (onDayClick) {
      onDayClick(day);
    }
  };
  return (
    <div className={(0, utils_1.cn)("flex-1 flex flex-col", className)}>
      {/* Month header */}
      <div className="p-4 border-b bg-muted/50">
        <h2 className="text-lg font-semibold">
          {(0, date_fns_1.format)(date, "MMMM 'de' yyyy", { locale: locale_1.ptBR })}
        </h2>
        <p className="text-sm text-muted-foreground">
          {monthAppointments.length} agendamento{monthAppointments.length !== 1 ? "s" : ""} no mês
        </p>
      </div>

      {/* Calendar grid */}
      <div className="flex-1 flex flex-col">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b">
          {weekDays.map((day, index) => (
            <div
              key={index}
              className="p-2 text-center text-sm font-medium border-r last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days grid */}
        <div className="flex-1 grid grid-rows-6">
          {Array.from({ length: 6 }).map((_, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 border-b last:border-b-0">
              {calendarDays.slice(weekIndex * 7, (weekIndex + 1) * 7).map((day, dayIndex) => {
                var dayAppointments = getAppointmentsForDay(day);
                var statusCounts = getStatusCounts(dayAppointments);
                var isCurrentMonth = (0, date_fns_1.isSameMonth)(day, date);
                return (
                  <div
                    key={dayIndex}
                    className={(0, utils_1.cn)(
                      "border-r last:border-r-0 p-1 cursor-pointer hover:bg-muted/50 transition-colors min-h-[100px] flex flex-col",
                      !isCurrentMonth && "bg-muted/20 text-muted-foreground",
                      (0, date_fns_1.isToday)(day) && "bg-primary/10 border-primary/20",
                    )}
                    onClick={() => handleDayClick(day)}
                  >
                    {/* Day number */}
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={(0, utils_1.cn)(
                          "text-sm font-medium",
                          (0, date_fns_1.isToday)(day) &&
                            isCurrentMonth &&
                            "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs",
                        )}
                      >
                        {(0, date_fns_1.format)(day, "d")}
                      </span>

                      {/* Total appointments badge */}
                      {dayAppointments.length > 0 && (
                        <badge_1.Badge variant="secondary" className="text-xs h-5 px-1.5">
                          {dayAppointments.length}
                        </badge_1.Badge>
                      )}
                    </div>

                    {/* Appointment indicators */}
                    <div className="flex-1 space-y-1">
                      {/* Show first few appointments */}
                      {dayAppointments.slice(0, 3).map((appointment, index) => {
                        var _a;
                        return (
                          <div
                            key={index}
                            className={(0, utils_1.cn)(
                              "text-xs p-1 rounded text-white cursor-pointer hover:opacity-80",
                              appointment.status === "scheduled" && "bg-blue-500",
                              appointment.status === "confirmed" && "bg-green-500",
                              appointment.status === "in_progress" && "bg-yellow-500",
                              appointment.status === "completed" && "bg-emerald-500",
                              appointment.status === "cancelled" && "bg-red-500",
                              appointment.status === "no_show" && "bg-gray-500",
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              onAppointmentClick === null || onAppointmentClick === void 0
                                ? void 0
                                : onAppointmentClick(appointment);
                            }}
                          >
                            <div className="truncate">
                              {(0, date_fns_1.format)(new Date(appointment.start_time), "HH:mm")} -{" "}
                              {((_a = appointment.patients) === null || _a === void 0
                                ? void 0
                                : _a.full_name) || "Sem nome"}
                            </div>
                          </div>
                        );
                      })}

                      {/* Show "more" indicator */}
                      {dayAppointments.length > 3 && (
                        <div className="text-xs text-muted-foreground p-1">
                          +{dayAppointments.length - 3} mais
                        </div>
                      )}

                      {/* Status dots for quick overview */}
                      {dayAppointments.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {statusCounts.scheduled > 0 && (
                            <div
                              className="w-2 h-2 bg-blue-500 rounded-full"
                              title={"".concat(statusCounts.scheduled, " agendado(s)")}
                            />
                          )}
                          {statusCounts.confirmed > 0 && (
                            <div
                              className="w-2 h-2 bg-green-500 rounded-full"
                              title={"".concat(statusCounts.confirmed, " confirmado(s)")}
                            />
                          )}
                          {statusCounts.in_progress > 0 && (
                            <div
                              className="w-2 h-2 bg-yellow-500 rounded-full"
                              title={"".concat(statusCounts.in_progress, " em andamento")}
                            />
                          )}
                          {statusCounts.completed > 0 && (
                            <div
                              className="w-2 h-2 bg-emerald-500 rounded-full"
                              title={"".concat(statusCounts.completed, " conclu\u00EDdo(s)")}
                            />
                          )}
                          {statusCounts.cancelled > 0 && (
                            <div
                              className="w-2 h-2 bg-red-500 rounded-full"
                              title={"".concat(statusCounts.cancelled, " cancelado(s)")}
                            />
                          )}
                          {statusCounts.no_show > 0 && (
                            <div
                              className="w-2 h-2 bg-gray-500 rounded-full"
                              title={"".concat(statusCounts.no_show, " n\u00E3o compareceu")}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Month summary */}
      <div className="p-4 border-t bg-muted/50">
        <div className="flex items-center justify-between text-sm">
          <span>
            {(0, date_fns_1.format)(monthStart, "d", { locale: locale_1.ptBR })} -{" "}
            {(0, date_fns_1.format)(monthEnd, "d 'de' MMMM 'de' yyyy", { locale: locale_1.ptBR })}
          </span>
          <div className="flex items-center gap-4 text-muted-foreground">
            {monthAppointments.length > 0 && (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span>
                    Confirmados: {monthAppointments.filter((a) => a.status === "confirmed").length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span>
                    Agendados: {monthAppointments.filter((a) => a.status === "scheduled").length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                  <span>
                    Concluídos: {monthAppointments.filter((a) => a.status === "completed").length}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

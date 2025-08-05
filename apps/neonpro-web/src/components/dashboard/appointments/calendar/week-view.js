"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeekView = WeekView;
var react_1 = require("react");
var scroll_area_1 = require("@/components/ui/scroll-area");
var utils_1 = require("@/lib/utils");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var appointment_card_1 = require("./appointment-card");
function WeekView(_a) {
  var date = _a.date,
    appointments = _a.appointments,
    onAppointmentClick = _a.onAppointmentClick,
    onAppointmentEdit = _a.onAppointmentEdit,
    onAppointmentCancel = _a.onAppointmentCancel,
    onAppointmentComplete = _a.onAppointmentComplete,
    onTimeSlotClick = _a.onTimeSlotClick,
    className = _a.className;
  // Get week boundaries
  var weekStart = (0, date_fns_1.startOfWeek)(date, { weekStartsOn: 0 }); // Sunday = 0
  var weekEnd = (0, date_fns_1.endOfWeek)(date, { weekStartsOn: 0 });
  var weekDays = (0, date_fns_1.eachDayOfInterval)({ start: weekStart, end: weekEnd });
  // Filter appointments for the week
  var weekAppointments = appointments.filter((appointment) => {
    var appointmentDate = new Date(appointment.start_time);
    return appointmentDate >= weekStart && appointmentDate <= weekEnd;
  });
  // Generate time slots
  var generateTimeSlots = () => {
    var slots = [];
    var startHour = 8;
    var endHour = 18;
    for (var hour = startHour; hour < endHour; hour++) {
      for (var _i = 0, _a = [0, 15, 30, 45]; _i < _a.length; _i++) {
        var minutes = _a[_i];
        slots.push({
          hour: hour,
          minutes: minutes,
          time: ""
            .concat(hour.toString().padStart(2, "0"), ":")
            .concat(minutes.toString().padStart(2, "0")),
        });
      }
    }
    return slots;
  };
  var timeSlots = generateTimeSlots();
  // Get appointments for specific day and time slot
  var getAppointmentsForSlot = (day, slotHour, slotMinutes) =>
    weekAppointments.filter((appointment) => {
      var appointmentStart = new Date(appointment.start_time);
      var appointmentEnd = new Date(appointment.end_time);
      if (!(0, date_fns_1.isSameDay)(appointmentStart, day)) return false;
      var slotStart = new Date(day);
      slotStart.setHours(slotHour, slotMinutes, 0, 0);
      var slotEnd = new Date(slotStart.getTime() + 15 * 60 * 1000);
      return (
        (appointmentStart >= slotStart && appointmentStart < slotEnd) ||
        (appointmentStart <= slotStart && appointmentEnd > slotStart)
      );
    });
  var handleTimeSlotClick = (day, time) => {
    if (onTimeSlotClick) {
      onTimeSlotClick(day, time);
    }
  };
  return (
    <div className={(0, utils_1.cn)("flex-1 flex flex-col", className)}>
      {/* Week header with days */}
      <div className="grid grid-cols-8 border-b bg-muted/50">
        {/* Time column header */}
        <div className="p-2 border-r">
          <div className="text-xs text-muted-foreground text-center">Horário</div>
        </div>

        {/* Day headers */}
        {weekDays.map((day, index) => (
          <div
            key={index}
            className={(0, utils_1.cn)(
              "p-2 border-r text-center",
              (0, date_fns_1.isToday)(day) && "bg-primary/10",
            )}
          >
            <div className="text-xs text-muted-foreground">
              {(0, date_fns_1.format)(day, "EEE", { locale: locale_1.ptBR })}
            </div>
            <div
              className={(0, utils_1.cn)(
                "text-lg font-semibold",
                (0, date_fns_1.isToday)(day) && "text-primary",
              )}
            >
              {(0, date_fns_1.format)(day, "d")}
            </div>
          </div>
        ))}
      </div>

      {/* Time grid */}
      <scroll_area_1.ScrollArea className="flex-1">
        <div className="grid grid-cols-8 gap-px bg-border min-h-full">
          {/* Time slots */}
          {timeSlots.map((_a, slotIndex) => {
            var hour = _a.hour,
              minutes = _a.minutes,
              time = _a.time;
            var isHourMark = minutes === 0;
            return (
              <react_1.default.Fragment key={slotIndex}>
                {/* Time label column */}
                <div
                  className={(0, utils_1.cn)(
                    "bg-background border-r p-1 text-xs text-muted-foreground text-right pr-2",
                    isHourMark && "border-t-2 border-t-border/50",
                  )}
                  style={{ minHeight: "48px" }}
                >
                  {isHourMark && time}
                </div>

                {/* Day columns */}
                {weekDays.map((day, dayIndex) => {
                  var slotAppointments = getAppointmentsForSlot(day, hour, minutes);
                  return (
                    <div
                      key={"".concat(slotIndex, "-").concat(dayIndex)}
                      className={(0, utils_1.cn)(
                        "bg-background border-r hover:bg-muted/50 cursor-pointer transition-colors relative",
                        isHourMark && "border-t-2 border-t-border/50",
                        (0, date_fns_1.isToday)(day) && "bg-primary/5",
                      )}
                      style={{ minHeight: "48px" }}
                      onClick={() => handleTimeSlotClick(day, time)}
                    >
                      {/* Appointments in this slot */}
                      <div className="p-1">
                        {slotAppointments.map((appointment, appointmentIndex) => (
                          <div
                            key={"".concat(appointment.id, "-").concat(appointmentIndex)}
                            className="mb-1"
                          >
                            <appointment_card_1.AppointmentCard
                              appointment={appointment}
                              variant="compact"
                              showTime={false}
                              showPatient={true}
                              showProfessional={false}
                              showActions={false}
                              onClick={() =>
                                onAppointmentClick === null || onAppointmentClick === void 0
                                  ? void 0
                                  : onAppointmentClick(appointment)
                              }
                              className="text-xs"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </react_1.default.Fragment>
            );
          })}
        </div>

        {/* Current time indicator for week view */}
        <WeekCurrentTimeIndicator weekStart={weekStart} />
      </scroll_area_1.ScrollArea>

      {/* Week summary */}
      <div className="p-4 border-t bg-muted/50">
        <div className="flex items-center justify-between text-sm">
          <span>
            {(0, date_fns_1.format)(weekStart, "d 'de' MMM", { locale: locale_1.ptBR })} -{" "}
            {(0, date_fns_1.format)(weekEnd, "d 'de' MMM 'de' yyyy", { locale: locale_1.ptBR })}
          </span>
          <span className="text-muted-foreground">
            {weekAppointments.length} agendamento{weekAppointments.length !== 1 ? "s" : ""} na
            semana
          </span>
        </div>
      </div>
    </div>
  );
}
// Current time indicator for week view
function WeekCurrentTimeIndicator(_a) {
  var weekStart = _a.weekStart;
  var _b = react_1.default.useState(null),
    currentTime = _b[0],
    setCurrentTime = _b[1];
  react_1.default.useEffect(() => {
    // Set initial time on client side only
    setCurrentTime(new Date());
    var interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);
  // Don't render during SSR or before client hydration
  if (!currentTime) {
    return null;
  }
  // Check if current time is within the week
  var weekEnd = (0, date_fns_1.endOfWeek)(weekStart, { weekStartsOn: 0 });
  if (currentTime < weekStart || currentTime > weekEnd) {
    return null;
  }
  var currentHour = currentTime.getHours();
  var currentMinute = currentTime.getMinutes();
  if (currentHour < 8 || currentHour >= 18) {
    return null;
  }
  // Calculate position
  var totalMinutesFromStart = (currentHour - 8) * 60 + currentMinute;
  var rowPosition = (totalMinutesFromStart / 15) * 48;
  // Calculate which day column
  var dayOfWeek = currentTime.getDay(); // 0 = Sunday
  var columnStart = (dayOfWeek + 1) * (100 / 8); // +1 for time column
  return (
    <div
      className="absolute z-10 flex items-center pointer-events-none"
      style={{
        top: "".concat(rowPosition + 80, "px"), // +80 for header height
        left: "".concat(columnStart, "%"),
        width: "".concat(100 / 8, "%"),
      }}
    >
      <div className="w-1 h-1 bg-red-500 rounded-full mr-1" />
      <div className="flex-1 h-px bg-red-500" />
    </div>
  );
}

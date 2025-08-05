"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DayView = DayView;
var react_1 = require("react");
var scroll_area_1 = require("@/components/ui/scroll-area");
var utils_1 = require("@/lib/utils");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var appointment_card_1 = require("./appointment-card");
function DayView(_a) {
  var date = _a.date,
    appointments = _a.appointments,
    onAppointmentClick = _a.onAppointmentClick,
    onAppointmentEdit = _a.onAppointmentEdit,
    onAppointmentCancel = _a.onAppointmentCancel,
    onAppointmentComplete = _a.onAppointmentComplete,
    onTimeSlotClick = _a.onTimeSlotClick,
    className = _a.className;
  // Filter appointments for the specific date
  var dayAppointments = appointments.filter((appointment) =>
    (0, date_fns_1.isSameDay)(new Date(appointment.start_time), date),
  );
  // Generate time slots from 8 AM to 6 PM
  var generateTimeSlots = () => {
    var slots = [];
    var startHour = 8;
    var endHour = 18;
    for (var hour = startHour; hour < endHour; hour++) {
      for (var _i = 0, _a = [0, 15, 30, 45]; _i < _a.length; _i++) {
        var minutes = _a[_i];
        var time = new Date(date);
        time.setHours(hour, minutes, 0, 0);
        slots.push(time);
      }
    }
    return slots;
  };
  var timeSlots = generateTimeSlots();
  // Function to get appointments for a specific time slot
  var getAppointmentsForSlot = (slotTime) =>
    dayAppointments.filter((appointment) => {
      var appointmentStart = new Date(appointment.start_time);
      var appointmentEnd = new Date(appointment.end_time);
      var slotEnd = new Date(slotTime.getTime() + 15 * 60 * 1000); // 15 minutes later
      return (
        (appointmentStart >= slotTime && appointmentStart < slotEnd) ||
        (appointmentStart <= slotTime && appointmentEnd > slotTime)
      );
    });
  // Function to calculate appointment height based on duration
  var getAppointmentHeight = (appointment) => {
    var start = new Date(appointment.start_time);
    var end = new Date(appointment.end_time);
    var duration = (end.getTime() - start.getTime()) / (1000 * 60); // minutes
    var slotHeight = 48; // 48px per 15-minute slot
    return Math.max((duration / 15) * slotHeight, slotHeight);
  };
  var handleTimeSlotClick = (slotTime) => {
    if (onTimeSlotClick) {
      onTimeSlotClick((0, date_fns_1.format)(slotTime, "HH:mm"));
    }
  };
  return (
    <div className={(0, utils_1.cn)("flex-1 flex flex-col", className)}>
      {/* Date header */}
      <div className="p-4 border-b bg-muted/50">
        <h2 className="text-lg font-semibold">
          {(0, date_fns_1.format)(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: locale_1.ptBR })}
        </h2>
        <p className="text-sm text-muted-foreground">
          {dayAppointments.length} agendamento{dayAppointments.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Time grid */}
      <scroll_area_1.ScrollArea className="flex-1">
        <div className="relative">
          {/* Time slots grid */}
          <div className="grid grid-cols-1 gap-px bg-border">
            {timeSlots.map((slotTime, index) => {
              var slotAppointments = getAppointmentsForSlot(slotTime);
              var isHourMark = slotTime.getMinutes() === 0;
              return (
                <div
                  key={index}
                  className={(0, utils_1.cn)(
                    "relative bg-background border-r border-border",
                    isHourMark && "border-t-2 border-t-border/50",
                    "hover:bg-muted/50 cursor-pointer transition-colors",
                  )}
                  style={{ minHeight: "48px" }}
                  onClick={() => handleTimeSlotClick(slotTime)}
                >
                  {/* Time label */}
                  <div className="absolute -left-12 top-0 w-10 text-xs text-muted-foreground text-right pr-2">
                    {isHourMark && (0, date_fns_1.format)(slotTime, "HH:mm")}
                  </div>

                  {/* Appointments in this slot */}
                  <div className="pl-2 pr-2 pt-1">
                    {slotAppointments.map((appointment, appointmentIndex) => (
                      <div
                        key={"".concat(appointment.id, "-").concat(appointmentIndex)}
                        className="mb-1"
                        style={{
                          height: "".concat(getAppointmentHeight(appointment), "px"),
                          minHeight: "40px",
                        }}
                      >
                        <appointment_card_1.AppointmentCard
                          appointment={appointment}
                          variant="compact"
                          showTime={true}
                          showPatient={true}
                          showProfessional={false}
                          showActions={true}
                          onClick={() =>
                            onAppointmentClick === null || onAppointmentClick === void 0
                              ? void 0
                              : onAppointmentClick(appointment)
                          }
                          onEdit={() =>
                            onAppointmentEdit === null || onAppointmentEdit === void 0
                              ? void 0
                              : onAppointmentEdit(appointment)
                          }
                          onCancel={() =>
                            onAppointmentCancel === null || onAppointmentCancel === void 0
                              ? void 0
                              : onAppointmentCancel(appointment)
                          }
                          onComplete={() =>
                            onAppointmentComplete === null || onAppointmentComplete === void 0
                              ? void 0
                              : onAppointmentComplete(appointment)
                          }
                          className="h-full"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Current time indicator */}
          <CurrentTimeIndicator date={date} />
        </div>
      </scroll_area_1.ScrollArea>

      {/* Empty state */}
      {dayAppointments.length === 0 && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <span className="text-2xl">📅</span>
            </div>
            <h3 className="text-lg font-medium mb-2">Nenhum agendamento hoje</h3>
            <p className="text-muted-foreground mb-4">
              Clique em um horário para criar um novo agendamento
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
// Component to show current time indicator
function CurrentTimeIndicator(_a) {
  var date = _a.date;
  var _b = react_1.default.useState(null),
    currentTime = _b[0],
    setCurrentTime = _b[1];
  react_1.default.useEffect(() => {
    // Set initial time only on client side to avoid hydration mismatch
    setCurrentTime(new Date());
    var interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);
  // Don't render anything during SSR or before client hydration
  if (!currentTime) {
    return null;
  }
  // Only show if viewing today
  if (!(0, date_fns_1.isSameDay)(date, currentTime)) {
    return null;
  }
  // Calculate position based on current time
  var startHour = 8;
  var currentHour = currentTime.getHours();
  var currentMinute = currentTime.getMinutes();
  if (currentHour < startHour || currentHour >= 18) {
    return null;
  }
  var totalMinutesFromStart = (currentHour - startHour) * 60 + currentMinute;
  var position = (totalMinutesFromStart / 15) * 48; // 48px per 15-minute slot
  return (
    <div
      className="absolute left-0 right-0 z-10 flex items-center pointer-events-none"
      style={{ top: "".concat(position, "px") }}
    >
      <div className="w-2 h-2 bg-red-500 rounded-full mr-2" />
      <div className="flex-1 h-px bg-red-500" />
      <div className="text-xs text-red-500 ml-2">
        {(0, date_fns_1.format)(currentTime, "HH:mm")}
      </div>
    </div>
  );
}

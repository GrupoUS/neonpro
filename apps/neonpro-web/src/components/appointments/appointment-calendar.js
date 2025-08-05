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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentCalendar = AppointmentCalendar;
var react_1 = require("react");
var react_big_calendar_1 = require("react-big-calendar");
var dragAndDrop_1 = require("react-big-calendar/lib/addons/dragAndDrop");
var moment_1 = require("moment");
require("moment/locale/pt-br");
require("react-big-calendar/lib/css/react-big-calendar.css");
require("react-big-calendar/lib/addons/dragAndDrop/styles.css");
var appointment_slot_1 = require("./appointment-slot");
var utils_1 = require("@/lib/utils");
// Configure moment for Brazilian Portuguese
moment_1.default.locale("pt-br");
var localizer = (0, react_big_calendar_1.momentLocalizer)(moment_1.default);
// Create draggable calendar
var DnDCalendar = (0, dragAndDrop_1.default)(react_big_calendar_1.Calendar);
// Service type colors for appointments
var serviceColors = {
  consultation: "#3B82F6", // blue-500
  botox: "#8B5CF6", // violet-500
  fillers: "#10B981", // emerald-500
  procedure: "#F59E0B", // amber-500
};
// Status styling modifiers
var statusStyles = {
  scheduled: { opacity: 0.7, borderStyle: "dashed" },
  confirmed: { opacity: 1, borderStyle: "solid" },
  "in-progress": { opacity: 1, borderStyle: "solid", animation: "pulse 2s infinite" },
  completed: { opacity: 0.6, filter: "grayscale(0.3)" },
  cancelled: { opacity: 0.4, textDecoration: "line-through" },
  "no-show": { opacity: 0.3, filter: "grayscale(0.8)" },
};
// Brazilian Portuguese messages
var messages = {
  date: "Data",
  time: "Horário",
  event: "Consulta",
  allDay: "Dia Todo",
  week: "Semana",
  work_week: "Semana Útil",
  day: "Dia",
  month: "Mês",
  previous: "Anterior",
  next: "Próximo",
  yesterday: "Ontem",
  tomorrow: "Amanhã",
  today: "Hoje",
  agenda: "Agenda",
  noEventsInRange: "Não há consultas neste período.",
  showMore: function (total) {
    return "+".concat(total, " mais");
  },
};
// Brazilian date formats
var formats = {
  dayFormat: "dddd",
  dayRangeHeaderFormat: function (_a) {
    var start = _a.start,
      end = _a.end;
    return ""
      .concat((0, moment_1.default)(start).format("DD/MM"), " - ")
      .concat((0, moment_1.default)(end).format("DD/MM/YYYY"));
  },
  dayHeaderFormat: "dddd, DD/MM",
  monthHeaderFormat: "MMMM YYYY",
  agendaDateFormat: "DD/MM/YYYY",
  agendaTimeFormat: "HH:mm",
  agendaTimeRangeFormat: function (_a) {
    var start = _a.start,
      end = _a.end;
    return ""
      .concat((0, moment_1.default)(start).format("HH:mm"), " - ")
      .concat((0, moment_1.default)(end).format("HH:mm"));
  },
  timeGutterFormat: "HH:mm",
  selectRangeFormat: function (_a) {
    var start = _a.start,
      end = _a.end;
    return ""
      .concat((0, moment_1.default)(start).format("DD/MM HH:mm"), " - ")
      .concat((0, moment_1.default)(end).format("DD/MM HH:mm"));
  },
};
function AppointmentCalendar(_a) {
  var appointments = _a.appointments,
    professionals = _a.professionals,
    view = _a.view,
    date = _a.date,
    onViewChange = _a.onViewChange,
    onDateChange = _a.onDateChange,
    onAppointmentDrop = _a.onAppointmentDrop,
    onAppointmentResize = _a.onAppointmentResize,
    onAppointmentSelect = _a.onAppointmentSelect,
    onSlotSelect = _a.onSlotSelect;
  // Convert appointments to calendar events
  var calendarEvents = (0, react_1.useMemo)(
    function () {
      return appointments.map(function (appointment) {
        return __assign(__assign({}, appointment), { resource: appointment.professionalId });
      });
    },
    [appointments],
  );
  // Professional resources for resource view
  var resources = (0, react_1.useMemo)(
    function () {
      return professionals.map(function (prof) {
        return {
          resourceId: prof.id,
          resourceTitle: prof.name,
        };
      });
    },
    [professionals],
  );
  // Event style getter for color coding
  var eventStyleGetter = (0, react_1.useCallback)(function (event) {
    var baseColor = serviceColors[event.serviceType] || "#6B7280";
    var statusStyle = statusStyles[event.status] || {};
    return {
      style: __assign(
        {
          backgroundColor: baseColor,
          borderColor: baseColor,
          color: "white",
          border: "2px solid",
          borderRadius: "6px",
          fontSize: "12px",
          fontWeight: "500",
        },
        statusStyle,
      ),
    };
  }, []);
  // Slot style getter for time slots
  var slotStyleGetter = (0, react_1.useCallback)(function (date) {
    var hour = date.getHours();
    var isBusinessHours = hour >= 8 && hour < 18;
    var isLunchTime = hour >= 12 && hour < 14;
    var style = {};
    if (!isBusinessHours) {
      style.backgroundColor = "#F3F4F6"; // gray-100
      style.cursor = "not-allowed";
    } else if (isLunchTime) {
      style.backgroundColor = "#FEF3C7"; // amber-100
    }
    return { style: style };
  }, []);
  // Day prop getter for date cells
  var dayPropGetter = (0, react_1.useCallback)(function (date) {
    var isWeekend = date.getDay() === 0 || date.getDay() === 6;
    var isToday = (0, moment_1.default)(date).isSame((0, moment_1.default)(), "day");
    var className = "";
    var style = {};
    if (isWeekend) {
      className += " weekend-day";
      style.backgroundColor = "#F9FAFB"; // gray-50
    }
    if (isToday) {
      className += " today";
      style.backgroundColor = "#EFF6FF"; // blue-50
      style.fontWeight = "bold";
    }
    return { className: className.trim(), style: style };
  }, []);
  // Handle event drop (drag and drop)
  var handleEventDrop = (0, react_1.useCallback)(
    function (_a) {
      var event = _a.event,
        start = _a.start,
        end = _a.end;
      onAppointmentDrop(event, start, end);
    },
    [onAppointmentDrop],
  );
  // Handle event resize
  var handleEventResize = (0, react_1.useCallback)(
    function (_a) {
      var event = _a.event,
        start = _a.start,
        end = _a.end;
      onAppointmentResize(event, start, end);
    },
    [onAppointmentResize],
  );
  // Handle event selection
  var handleSelectEvent = (0, react_1.useCallback)(
    function (event) {
      onAppointmentSelect(event);
    },
    [onAppointmentSelect],
  );
  // Handle slot selection
  var handleSelectSlot = (0, react_1.useCallback)(
    function (slotInfo) {
      // Only allow booking during business hours
      var hour = slotInfo.start.getHours();
      var isBusinessHours = hour >= 8 && hour < 18;
      if (isBusinessHours) {
        onSlotSelect(slotInfo);
      }
    },
    [onSlotSelect],
  );
  // Custom components
  var components = (0, react_1.useMemo)(function () {
    return {
      event: appointment_slot_1.AppointmentSlot,
      toolbar: function (props) {
        return (
          <div className="flex items-center justify-between mb-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-2">
              <button
                onClick={function () {
                  return props.onNavigate("PREV");
                }}
                className="px-3 py-1 text-sm bg-background hover:bg-muted rounded border"
              >
                ← {messages.previous}
              </button>
              <button
                onClick={function () {
                  return props.onNavigate("TODAY");
                }}
                className="px-3 py-1 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded"
              >
                {messages.today}
              </button>
              <button
                onClick={function () {
                  return props.onNavigate("NEXT");
                }}
                className="px-3 py-1 text-sm bg-background hover:bg-muted rounded border"
              >
                {messages.next} →
              </button>
            </div>

            <h3 className="text-lg font-semibold">{props.label}</h3>

            <div className="flex items-center space-x-1">
              {[
                { key: "month", label: messages.month },
                { key: "week", label: messages.week },
                { key: "day", label: messages.day },
                { key: "agenda", label: messages.agenda },
              ].map(function (_a) {
                var key = _a.key,
                  label = _a.label;
                return (
                  <button
                    key={key}
                    onClick={function () {
                      return props.onView(key);
                    }}
                    className={(0, utils_1.cn)(
                      "px-3 py-1 text-sm rounded border",
                      props.view === key
                        ? "bg-primary text-primary-foreground"
                        : "bg-background hover:bg-muted",
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      },
    };
  }, []);
  return (
    <div className="h-[600px] w-full">
      <style jsx global>
        {
          "\n        .rbc-calendar {\n          font-family: inherit;\n        }\n        \n        .rbc-time-view .rbc-time-gutter {\n          font-size: 12px;\n        }\n        \n        .rbc-time-slot {\n          border-bottom: 1px solid #e5e7eb;\n        }\n        \n        .rbc-day-slot .rbc-time-slot {\n          border-bottom: 1px solid #f3f4f6;\n        }\n        \n        .rbc-current-time-indicator {\n          background-color: #ef4444;\n          height: 2px;\n        }\n        \n        .rbc-time-header {\n          border-bottom: 2px solid #e5e7eb;\n        }\n        \n        .rbc-header {\n          font-weight: 600;\n          padding: 8px;\n          background-color: #f9fafb;\n        }\n        \n        .weekend-day {\n          background-color: #f9fafb;\n        }\n        \n        .today {\n          background-color: #eff6ff !important;\n        }\n        \n        .rbc-event {\n          outline: none;\n        }\n        \n        .rbc-event:focus {\n          outline: 2px solid #3b82f6;\n          outline-offset: 2px;\n        }\n        \n        .rbc-time-slot:hover {\n          background-color: #f0f9ff;\n        }\n        \n        .rbc-day-bg:hover {\n          background-color: #f0f9ff;\n        }\n        \n        @keyframes pulse {\n          0%, 100% { opacity: 1; }\n          50% { opacity: 0.7; }\n        }\n      "
        }
      </style>

      <DnDCalendar
        localizer={localizer}
        events={calendarEvents}
        resources={view === "day" ? resources : undefined}
        resourceIdAccessor="resourceId"
        resourceTitleAccessor="resourceTitle"
        startAccessor="start"
        endAccessor="end"
        titleAccessor="title"
        view={view}
        date={date}
        onView={function (newView) {
          return onViewChange(newView);
        }}
        onNavigate={onDateChange}
        onEventDrop={handleEventDrop}
        onEventResize={handleEventResize}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        selectable
        resizable
        draggableAccessor={function () {
          return true;
        }}
        eventPropGetter={eventStyleGetter}
        slotPropGetter={slotStyleGetter}
        dayPropGetter={dayPropGetter}
        messages={messages}
        formats={formats}
        components={components}
        min={new Date(2024, 0, 1, 8, 0)} // 8:00 AM
        max={new Date(2024, 0, 1, 18, 0)} // 6:00 PM
        step={15} // 15-minute intervals
        timeslots={4} // 4 slots per hour (15 min each)
        showMultiDayTimes
        popup
        popupOffset={{ x: 10, y: 10 }}
        className="rbc-calendar"
      />
    </div>
  );
}

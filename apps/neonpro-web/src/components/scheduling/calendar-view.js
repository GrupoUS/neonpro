/**
 * Calendar View Component
 * NeonPro Intelligent Scheduling System
 *
 * Advanced calendar component with multi-professional scheduling,
 * conflict detection, and real-time updates
 */
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
var alert_1 = require("@/components/ui/alert");
var button_1 = require("@/components/ui/button");
var calendar_1 = require("@/components/ui/calendar");
var card_1 = require("@/components/ui/card");
var select_1 = require("@/components/ui/select");
var tabs_1 = require("@/components/ui/tabs");
var auth_helpers_nextjs_1 = require("@supabase/auth-helpers-nextjs");
var react_query_1 = require("@tanstack/react-query");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var CalendarView = (_a) => {
  var onAppointmentClick = _a.onAppointmentClick,
    onTimeSlotClick = _a.onTimeSlotClick,
    onCreateAppointment = _a.onCreateAppointment;
  var _b = (0, react_1.useState)(new Date()),
    selectedDate = _b[0],
    setSelectedDate = _b[1];
  var _c = (0, react_1.useState)(new Date()),
    currentWeek = _c[0],
    setCurrentWeek = _c[1];
  var _d = (0, react_1.useState)("week"),
    viewMode = _d[0],
    setViewMode = _d[1];
  var _e = (0, react_1.useState)("all"),
    selectedProfessional = _e[0],
    setSelectedProfessional = _e[1];
  var _f = (0, react_1.useState)("all"),
    selectedStatus = _f[0],
    setSelectedStatus = _f[1];
  var _g = (0, react_1.useState)(false),
    isLoading = _g[0],
    setIsLoading = _g[1];
  var supabase = (0, auth_helpers_nextjs_1.createClientComponentClient)();
  var queryClient = (0, react_query_1.useQueryClient)();
  // Fetch appointments
  var _h = (0, react_query_1.useQuery)({
      queryKey: ["appointments", selectedDate, selectedProfessional, selectedStatus],
      queryFn: () =>
        __awaiter(void 0, void 0, void 0, function () {
          var startDate, endDate, query, _a, data, error;
          return __generator(this, (_b) => {
            switch (_b.label) {
              case 0:
                startDate =
                  viewMode === "month"
                    ? (0, date_fns_1.startOfWeek)(selectedDate)
                    : (0, date_fns_1.startOfWeek)(currentWeek);
                endDate =
                  viewMode === "month"
                    ? (0, date_fns_1.endOfWeek)(selectedDate)
                    : (0, date_fns_1.endOfWeek)(currentWeek);
                query = supabase
                  .from("appointments")
                  .select(
                    "\n          *,\n          patients (id, full_name, phone),\n          professionals (id, full_name, color),\n          service_types (id, name, duration_minutes, color)\n        ",
                  )
                  .gte("start_time", startDate.toISOString())
                  .lte("start_time", endDate.toISOString())
                  .order("start_time", { ascending: true });
                if (selectedProfessional !== "all") {
                  query = query.eq("professional_id", selectedProfessional);
                }
                if (selectedStatus !== "all") {
                  query = query.eq("status", selectedStatus);
                }
                return [4 /*yield*/, query];
              case 1:
                (_a = _b.sent()), (data = _a.data), (error = _a.error);
                if (error) throw error;
                return [2 /*return*/, data];
            }
          });
        }),
      refetchInterval: 30000, // Refresh every 30 seconds for real-time updates
    }),
    _j = _h.data,
    appointments = _j === void 0 ? [] : _j,
    appointmentsLoading = _h.isLoading,
    appointmentsError = _h.error;
  // Fetch professionals
  var _k = (0, react_query_1.useQuery)({
      queryKey: ["professionals"],
      queryFn: () =>
        __awaiter(void 0, void 0, void 0, function () {
          var _a, data, error;
          return __generator(this, (_b) => {
            switch (_b.label) {
              case 0:
                return [
                  4 /*yield*/,
                  supabase
                    .from("professionals")
                    .select("*")
                    .eq("is_active", true)
                    .order("full_name"),
                ];
              case 1:
                (_a = _b.sent()), (data = _a.data), (error = _a.error);
                if (error) throw error;
                return [2 /*return*/, data];
            }
          });
        }),
    }).data,
    professionals = _k === void 0 ? [] : _k;
  // Fetch service types
  var _l = (0, react_query_1.useQuery)({
      queryKey: ["service_types"],
      queryFn: () =>
        __awaiter(void 0, void 0, void 0, function () {
          var _a, data, error;
          return __generator(this, (_b) => {
            switch (_b.label) {
              case 0:
                return [
                  4 /*yield*/,
                  supabase.from("service_types").select("*").eq("is_active", true).order("name"),
                ];
              case 1:
                (_a = _b.sent()), (data = _a.data), (error = _a.error);
                if (error) throw error;
                return [2 /*return*/, data];
            }
          });
        }),
    }).data,
    serviceTypes = _l === void 0 ? [] : _l;
  // Week navigation
  var goToPreviousWeek = () => {
    setCurrentWeek((0, date_fns_1.subWeeks)(currentWeek, 1));
  };
  var goToNextWeek = () => {
    setCurrentWeek((0, date_fns_1.addWeeks)(currentWeek, 1));
  };
  var goToToday = () => {
    var today = new Date();
    setCurrentWeek(today);
    setSelectedDate(today);
  };
  // Generate time slots for display
  var timeSlots = (0, react_1.useMemo)(() => {
    var slots = [];
    for (var hour = 8; hour <= 18; hour++) {
      for (var minute = 0; minute < 60; minute += 30) {
        var timeString = ""
          .concat(hour.toString().padStart(2, "0"), ":")
          .concat(minute.toString().padStart(2, "0"));
        slots.push(timeString);
      }
    }
    return slots;
  }, []);
  // Generate week days
  var weekDays = (0, react_1.useMemo)(
    () =>
      (0, date_fns_1.eachDayOfInterval)({
        start: (0, date_fns_1.startOfWeek)(currentWeek, { weekStartsOn: 1 }), // Monday start
        end: (0, date_fns_1.endOfWeek)(currentWeek, { weekStartsOn: 1 }),
      }),
    [currentWeek],
  );
  // Get appointments for a specific date and time
  var getAppointmentsForSlot = (date, time, professionalId) => {
    var slotDateTime = new Date(date);
    var _a = time.split(":").map(Number),
      hours = _a[0],
      minutes = _a[1];
    slotDateTime.setHours(hours, minutes, 0, 0);
    return appointments.filter((appointment) => {
      var appointmentStart = new Date(appointment.start_time);
      var appointmentEnd = new Date(appointment.end_time);
      var slotEnd = new Date(slotDateTime);
      slotEnd.setMinutes(slotEnd.getMinutes() + 30);
      var hasTimeOverlap =
        (appointmentStart <= slotDateTime && appointmentEnd > slotDateTime) ||
        (appointmentStart < slotEnd && appointmentEnd >= slotEnd) ||
        (appointmentStart >= slotDateTime && appointmentEnd <= slotEnd);
      var matchesProfessional = !professionalId || appointment.professional_id === professionalId;
      return hasTimeOverlap && matchesProfessional;
    });
  };
  // Get status color
  var getStatusColor = (status) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "no_show":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "rescheduled":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  // Get priority indicator
  var getPriorityIcon = (priority) => {
    if (priority >= 4) return <lucide_react_1.AlertTriangle className="w-3 h-3 text-red-500" />;
    if (priority >= 3) return <lucide_react_1.Clock className="w-3 h-3 text-yellow-500" />;
    return null;
  };
  // Appointment Card Component
  var AppointmentCard = (_a) => {
    var appointment = _a.appointment;
    return (
      <div
        className={"p-2 rounded-md text-xs cursor-pointer transition-all hover:shadow-md border ".concat(
          getStatusColor(appointment.status),
        )}
        onClick={() =>
          onAppointmentClick === null || onAppointmentClick === void 0
            ? void 0
            : onAppointmentClick(appointment)
        }
        style={{
          borderLeftWidth: "4px",
          borderLeftColor: appointment.professionals.color || "#3B82F6",
        }}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="font-medium truncate">{appointment.patients.full_name}</span>
          {getPriorityIcon(appointment.priority)}
        </div>
        <div className="text-gray-600 mb-1">
          {(0, date_fns_1.format)(new Date(appointment.start_time), "HH:mm")} -{" "}
          {(0, date_fns_1.format)(new Date(appointment.end_time), "HH:mm")}
        </div>
        <div className="text-gray-500 truncate">{appointment.service_types.name}</div>
        <div className="text-gray-500 truncate text-xs">{appointment.professionals.full_name}</div>
      </div>
    );
  };
  // Week View Component
  var WeekView = () => (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Header with days */}
        <div className="grid grid-cols-8 gap-1 mb-4">
          <div className="p-2 font-medium text-sm text-gray-600">Horário</div>
          {weekDays.map((day) => (
            <div key={day.toISOString()} className="p-2 text-center">
              <div className="font-medium text-sm">
                {(0, date_fns_1.format)(day, "EEEEEE", { locale: locale_1.ptBR })}
              </div>
              <div
                className={"text-lg ".concat(
                  (0, date_fns_1.isSameDay)(day, new Date()) ? "text-blue-600 font-bold" : "",
                )}
              >
                {(0, date_fns_1.format)(day, "d")}
              </div>
            </div>
          ))}
        </div>

        {/* Time slots */}
        <div className="space-y-1">
          {timeSlots.map((time) => (
            <div key={time} className="grid grid-cols-8 gap-1">
              <div className="p-2 text-sm text-gray-600 font-mono border-r">{time}</div>
              {weekDays.map((day) => {
                var slotAppointments = getAppointmentsForSlot(day, time);
                return (
                  <div
                    key={"".concat(day.toISOString(), "-").concat(time)}
                    className="min-h-[60px] border border-gray-200 p-1 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() =>
                      onTimeSlotClick === null || onTimeSlotClick === void 0
                        ? void 0
                        : onTimeSlotClick(day, time)
                    }
                  >
                    <div className="space-y-1">
                      {slotAppointments.map((appointment) => (
                        <AppointmentCard key={appointment.id} appointment={appointment} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  // Month View Component
  var MonthView = () => (
    <div className="space-y-4">
      <calendar_1.Calendar
        mode="single"
        selected={selectedDate}
        onSelect={(date) => date && setSelectedDate(date)}
        className="rounded-md border"
        locale={locale_1.ptBR}
      />

      {/* Appointments for selected date */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="text-lg">
            Agendamentos -{" "}
            {(0, date_fns_1.format)(selectedDate, "dd/MM/yyyy", { locale: locale_1.ptBR })}
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="space-y-2">
            {appointments
              .filter((appointment) =>
                (0, date_fns_1.isSameDay)(new Date(appointment.start_time), selectedDate),
              )
              .map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            {appointments.filter((appointment) =>
              (0, date_fns_1.isSameDay)(new Date(appointment.start_time), selectedDate),
            ).length === 0 && (
              <p className="text-gray-500 text-center py-4">Nenhum agendamento para este dia</p>
            )}
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </div>
  );
  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <card_1.Card>
        <card_1.CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.Calendar className="w-5 h-5" />
                Agenda Inteligente
              </card_1.CardTitle>
              <card_1.CardDescription>
                Sistema de agendamento com detecção de conflitos em tempo real
              </card_1.CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <button_1.Button onClick={goToToday} variant="outline" size="sm">
                Hoje
              </button_1.Button>
              <button_1.Button onClick={onCreateAppointment} size="sm">
                <lucide_react_1.Plus className="w-4 h-4 mr-2" />
                Novo Agendamento
              </button_1.Button>
            </div>
          </div>
        </card_1.CardHeader>

        <card_1.CardContent>
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* View Mode Tabs */}
            <tabs_1.Tabs
              value={viewMode}
              onValueChange={(value) => setViewMode(value)}
              className="w-full lg:w-auto"
            >
              <tabs_1.TabsList>
                <tabs_1.TabsTrigger value="month" className="flex items-center gap-2">
                  <lucide_react_1.Grid3X3 className="w-4 h-4" />
                  Mês
                </tabs_1.TabsTrigger>
                <tabs_1.TabsTrigger value="week" className="flex items-center gap-2">
                  <lucide_react_1.List className="w-4 h-4" />
                  Semana
                </tabs_1.TabsTrigger>
              </tabs_1.TabsList>
            </tabs_1.Tabs>

            {/* Navigation Controls */}
            {viewMode === "week" && (
              <div className="flex items-center gap-2">
                <button_1.Button onClick={goToPreviousWeek} variant="outline" size="sm">
                  <lucide_react_1.ChevronLeft className="w-4 h-4" />
                </button_1.Button>
                <span className="px-4 py-2 text-sm font-medium">
                  {(0, date_fns_1.format)(
                    (0, date_fns_1.startOfWeek)(currentWeek, { weekStartsOn: 1 }),
                    "dd/MM",
                    { locale: locale_1.ptBR },
                  )}{" "}
                  -{" "}
                  {(0, date_fns_1.format)(
                    (0, date_fns_1.endOfWeek)(currentWeek, { weekStartsOn: 1 }),
                    "dd/MM/yyyy",
                    { locale: locale_1.ptBR },
                  )}
                </span>
                <button_1.Button onClick={goToNextWeek} variant="outline" size="sm">
                  <lucide_react_1.ChevronRight className="w-4 h-4" />
                </button_1.Button>
              </div>
            )}

            {/* Filters */}
            <div className="flex items-center gap-2 w-full lg:w-auto">
              <select_1.Select value={selectedProfessional} onValueChange={setSelectedProfessional}>
                <select_1.SelectTrigger className="w-full lg:w-[200px]">
                  <select_1.SelectValue placeholder="Profissional" />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="all">Todos os profissionais</select_1.SelectItem>
                  {professionals.map((professional) => (
                    <select_1.SelectItem key={professional.id} value={professional.id}>
                      {professional.full_name}
                    </select_1.SelectItem>
                  ))}
                </select_1.SelectContent>
              </select_1.Select>

              <select_1.Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <select_1.SelectTrigger className="w-full lg:w-[150px]">
                  <select_1.SelectValue placeholder="Status" />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="all">Todos os status</select_1.SelectItem>
                  <select_1.SelectItem value="scheduled">Agendado</select_1.SelectItem>
                  <select_1.SelectItem value="confirmed">Confirmado</select_1.SelectItem>
                  <select_1.SelectItem value="in_progress">Em andamento</select_1.SelectItem>
                  <select_1.SelectItem value="completed">Concluído</select_1.SelectItem>
                  <select_1.SelectItem value="cancelled">Cancelado</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>

              <button_1.Button
                onClick={() => queryClient.invalidateQueries({ queryKey: ["appointments"] })}
                variant="outline"
                size="sm"
                disabled={appointmentsLoading}
              >
                <lucide_react_1.RefreshCw
                  className={"w-4 h-4 ".concat(appointmentsLoading ? "animate-spin" : "")}
                />
              </button_1.Button>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Error Display */}
      {appointmentsError && (
        <alert_1.Alert variant="destructive">
          <lucide_react_1.AlertTriangle className="h-4 w-4" />
          <alert_1.AlertDescription>
            Erro ao carregar agendamentos: {appointmentsError.message}
          </alert_1.AlertDescription>
        </alert_1.Alert>
      )}

      {/* Calendar Content */}
      <card_1.Card>
        <card_1.CardContent className="p-6">
          {appointmentsLoading
            ? <div className="flex items-center justify-center py-12">
                <lucide_react_1.RefreshCw className="w-6 h-6 animate-spin mr-2" />
                Carregando agendamentos...
              </div>
            : <tabs_1.Tabs value={viewMode} className="w-full">
                <tabs_1.TabsContent value="month" className="mt-0">
                  <MonthView />
                </tabs_1.TabsContent>
                <tabs_1.TabsContent value="week" className="mt-0">
                  <WeekView />
                </tabs_1.TabsContent>
              </tabs_1.Tabs>}
        </card_1.CardContent>
      </card_1.Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Hoje</p>
                <p className="text-2xl font-bold">
                  {
                    appointments.filter((apt) =>
                      (0, date_fns_1.isSameDay)(new Date(apt.start_time), new Date()),
                    ).length
                  }
                </p>
              </div>
              <lucide_react_1.Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Confirmados</p>
                <p className="text-2xl font-bold text-green-600">
                  {appointments.filter((apt) => apt.status === "confirmed").length}
                </p>
              </div>
              <lucide_react_1.CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Em Andamento</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {appointments.filter((apt) => apt.status === "in_progress").length}
                </p>
              </div>
              <lucide_react_1.Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Profissionais</p>
                <p className="text-2xl font-bold">{professionals.length}</p>
              </div>
              <lucide_react_1.Users className="w-8 h-8 text-purple-500" />
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>
    </div>
  );
};
exports.default = CalendarView;

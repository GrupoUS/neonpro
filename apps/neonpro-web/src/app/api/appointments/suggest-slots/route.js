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
          step(generator.throw(value));
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
      (g.throw = verb(1)),
      (g.return = verb(2)),
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
                  ? y.return
                  : op[0]
                    ? y.throw || ((t = y.return) && t.call(y), 0)
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
exports.GET = GET;
var server_1 = require("@/lib/supabase/server");
var date_fns_1 = require("date-fns");
var server_2 = require("next/server");
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var searchParams,
      params,
      supabase,
      _a,
      professionalSchedule,
      serviceRules,
      existingAppointments,
      suggestions,
      preferredDate,
      searchInfo,
      response,
      error_1;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 4, undefined, 5]);
          searchParams = new URL(request.url).searchParams;
          params = {
            professional_id: searchParams.get("professional_id") || "",
            service_type_id: searchParams.get("service_type_id") || "",
            preferred_start_time: searchParams.get("preferred_start_time") || "",
            duration_minutes: parseInt(searchParams.get("duration_minutes") || "60"),
            exclude_appointment_id: searchParams.get("exclude_appointment_id") || undefined,
            max_suggestions: Math.min(parseInt(searchParams.get("max_suggestions") || "6"), 20),
            search_window_days: Math.min(
              parseInt(searchParams.get("search_window_days") || "14"),
              30,
            ),
            clinic_id: searchParams.get("clinic_id") || "",
          };
          // Validation
          if (
            !params.professional_id ||
            !params.service_type_id ||
            !params.preferred_start_time ||
            !params.clinic_id
          ) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Missing required parameters" }, { status: 400 }),
            ];
          }
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 1:
          supabase = _b.sent();
          return [
            4 /*yield*/,
            Promise.all([
              getProfessionalSchedule(supabase, params.professional_id, params.clinic_id),
              getServiceRules(supabase, params.service_type_id, params.clinic_id),
              getExistingAppointments(
                supabase,
                params.professional_id,
                params.clinic_id,
                params.search_window_days,
                params.exclude_appointment_id,
              ),
            ]),
          ];
        case 2:
          (_a = _b.sent()),
            (professionalSchedule = _a[0]),
            (serviceRules = _a[1]),
            (existingAppointments = _a[2]);
          return [
            4 /*yield*/,
            generateSlotSuggestions(
              params,
              professionalSchedule,
              serviceRules,
              existingAppointments,
            ),
          ];
        case 3:
          suggestions = _b.sent();
          preferredDate = (0, date_fns_1.parseISO)(params.preferred_start_time);
          searchInfo = {
            total_slots_checked: params.search_window_days * 48, // Assuming 30-min intervals
            available_slots_found: suggestions.length,
            search_period: {
              start_date: (0, date_fns_1.format)(preferredDate, "yyyy-MM-dd"),
              end_date: (0, date_fns_1.format)(
                (0, date_fns_1.addDays)(preferredDate, params.search_window_days),
                "yyyy-MM-dd",
              ),
            },
          };
          response = {
            suggestions: suggestions.slice(0, params.max_suggestions),
            search_info: searchInfo,
          };
          return [2 /*return*/, server_2.NextResponse.json(response)];
        case 4:
          error_1 = _b.sent();
          console.error("Error in suggest-slots API:", error_1);
          return [
            2 /*return*/,
            server_2.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
function getProfessionalSchedule(supabase, professionalId, clinicId) {
  return __awaiter(this, void 0, void 0, function () {
    var _a, data, error;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          return [
            4 /*yield*/,
            supabase
              .from("professional_schedules")
              .select("*")
              .eq("professional_id", professionalId)
              .eq("clinic_id", clinicId)
              .eq("is_available", true),
          ];
        case 1:
          (_a = _b.sent()), (data = _a.data), (error = _a.error);
          if (error) {
            console.error("Error fetching professional schedule:", error);
            return [2 /*return*/, []];
          }
          return [2 /*return*/, data || []];
      }
    });
  });
}
function getServiceRules(supabase, serviceTypeId, clinicId) {
  return __awaiter(this, void 0, void 0, function () {
    var _a, data, error;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          return [
            4 /*yield*/,
            supabase
              .from("service_type_rules")
              .select("*")
              .eq("service_type_id", serviceTypeId)
              .eq("clinic_id", clinicId)
              .eq("is_active", true)
              .single(),
          ];
        case 1:
          (_a = _b.sent()), (data = _a.data), (error = _a.error);
          if (error && error.code !== "PGRST116") {
            // Not found is OK
            console.error("Error fetching service rules:", error);
          }
          return [2 /*return*/, data || {}];
      }
    });
  });
}
function getExistingAppointments(supabase, professionalId, clinicId, searchWindowDays, excludeId) {
  return __awaiter(this, void 0, void 0, function () {
    var startDate, endDate, query, _a, data, error;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          startDate = new Date();
          endDate = (0, date_fns_1.addDays)(startDate, searchWindowDays);
          query = supabase
            .from("appointments")
            .select("start_time, end_time")
            .eq("professional_id", professionalId)
            .eq("clinic_id", clinicId)
            .neq("status", "cancelled")
            .gte("start_time", startDate.toISOString())
            .lte("start_time", endDate.toISOString());
          if (excludeId) {
            query = query.neq("id", excludeId);
          }
          return [4 /*yield*/, query];
        case 1:
          (_a = _b.sent()), (data = _a.data), (error = _a.error);
          if (error) {
            console.error("Error fetching existing appointments:", error);
            return [2 /*return*/, []];
          }
          return [2 /*return*/, data || []];
      }
    });
  });
}
function generateSlotSuggestions(params, schedule, serviceRules, existingAppointments) {
  return __awaiter(this, void 0, void 0, function () {
    var suggestions,
      preferredDate,
      preferredTime,
      scheduleMap,
      appointments,
      dayOffset,
      searchDate,
      dayOfWeek,
      daySchedule,
      daySlots;
    return __generator(this, (_a) => {
      suggestions = [];
      preferredDate = (0, date_fns_1.parseISO)(params.preferred_start_time);
      preferredTime = (0, date_fns_1.format)(preferredDate, "HH:mm");
      scheduleMap = new Map();
      schedule.forEach((s) => {
        scheduleMap.set(s.day_of_week, s);
      });
      appointments = existingAppointments.map((apt) => ({
        start: (0, date_fns_1.parseISO)(apt.start_time),
        end: (0, date_fns_1.parseISO)(apt.end_time),
      }));
      // Search through each day in the window
      for (dayOffset = 0; dayOffset < params.search_window_days; dayOffset++) {
        searchDate = (0, date_fns_1.addDays)(preferredDate, dayOffset);
        dayOfWeek = searchDate.getDay();
        daySchedule = scheduleMap.get(dayOfWeek);
        if (!daySchedule) continue; // No schedule for this day
        daySlots = generateDaySuggestions(
          searchDate,
          daySchedule,
          serviceRules,
          appointments,
          params,
          preferredTime,
          dayOffset,
        );
        suggestions.push.apply(suggestions, daySlots);
      }
      // Sort by score (best first)
      return [2 /*return*/, suggestions.sort((a, b) => (b.score || 0) - (a.score || 0))];
    });
  });
}
function generateDaySuggestions(
  date,
  schedule,
  serviceRules,
  appointments,
  params,
  preferredTime,
  dayOffset,
) {
  var slots = [];
  var startTime = parseTime(schedule.start_time);
  var endTime = parseTime(schedule.end_time);
  var bufferBefore = serviceRules.buffer_before || 0;
  var bufferAfter = serviceRules.buffer_after || 0;
  // 30-minute intervals
  var intervalMinutes = 30;
  var currentTime = startTime;
  while (currentTime + params.duration_minutes <= endTime) {
    var slotStart = new Date(date);
    slotStart.setHours(Math.floor(currentTime / 60), currentTime % 60, 0, 0);
    var slotEnd = (0, date_fns_1.addMinutes)(slotStart, params.duration_minutes);
    // Check for conflicts
    var conflicts = checkSlotConflicts(
      slotStart,
      slotEnd,
      appointments,
      schedule,
      bufferBefore,
      bufferAfter,
    );
    var hasErrors = conflicts.some((c) => c.severity === "error");
    if (!hasErrors) {
      var score = calculateSlotScore(slotStart, preferredTime, dayOffset, conflicts.length);
      slots.push({
        start_time: slotStart.toISOString(),
        end_time: slotEnd.toISOString(),
        available: true,
        conflicts: conflicts.length > 0 ? conflicts : undefined,
        score: score,
        reason: generateSlotReason(slotStart, preferredTime, dayOffset),
      });
    }
    currentTime += intervalMinutes;
  }
  return slots;
}
function parseTime(timeString) {
  var _a = timeString.split(":").map(Number),
    hours = _a[0],
    minutes = _a[1];
  return hours * 60 + minutes;
}
function checkSlotConflicts(slotStart, slotEnd, appointments, schedule, bufferBefore, bufferAfter) {
  var conflicts = [];
  // Check appointment overlaps
  var slotStartWithBuffer = (0, date_fns_1.addMinutes)(slotStart, -bufferBefore);
  var slotEndWithBuffer = (0, date_fns_1.addMinutes)(slotEnd, bufferAfter);
  for (var _i = 0, appointments_1 = appointments; _i < appointments_1.length; _i++) {
    var apt = appointments_1[_i];
    if (
      (slotStartWithBuffer >= apt.start && slotStartWithBuffer < apt.end) ||
      (slotEndWithBuffer > apt.start && slotEndWithBuffer <= apt.end) ||
      (slotStartWithBuffer <= apt.start && slotEndWithBuffer >= apt.end)
    ) {
      conflicts.push({
        type: "appointment_overlap",
        message: "Conflito com agendamento existente",
        severity: "error",
      });
    }
  }
  // Check break time
  if (schedule.break_start_time && schedule.break_end_time) {
    var breakStart = parseTime(schedule.break_start_time);
    var breakEnd = parseTime(schedule.break_end_time);
    var slotTimeStart = parseTime((0, date_fns_1.format)(slotStart, "HH:mm"));
    var slotTimeEnd = parseTime((0, date_fns_1.format)(slotEnd, "HH:mm"));
    if (
      (slotTimeStart >= breakStart && slotTimeStart < breakEnd) ||
      (slotTimeEnd > breakStart && slotTimeEnd <= breakEnd) ||
      (slotTimeStart <= breakStart && slotTimeEnd >= breakEnd)
    ) {
      conflicts.push({
        type: "break_time",
        message: "Conflito com horário de intervalo",
        severity: "error",
      });
    }
  }
  // Check capacity limits
  var hourStart = new Date(slotStart);
  hourStart.setMinutes(0, 0, 0);
  var hourEnd = (0, date_fns_1.addMinutes)(hourStart, 60);
  var appointmentsInHour = appointments.filter(
    (apt) => apt.start >= hourStart && apt.start < hourEnd,
  ).length;
  if (appointmentsInHour >= (schedule.max_appointments_per_hour || 4)) {
    conflicts.push({
      type: "capacity_exceeded",
      message: "Capacidade m\u00E1xima da hora (".concat(
        schedule.max_appointments_per_hour,
        ") atingida",
      ),
      severity: "warning",
    });
  }
  return conflicts;
}
function calculateSlotScore(slotStart, preferredTime, dayOffset, conflictCount) {
  var score = 100;
  // Penalty for days away from preferred date
  score -= dayOffset * 5;
  // Penalty for time difference from preferred
  var slotTime = (0, date_fns_1.format)(slotStart, "HH:mm");
  var preferredMinutes = parseTime(preferredTime);
  var slotMinutes = parseTime(slotTime);
  var timeDiff = Math.abs(preferredMinutes - slotMinutes);
  score -= Math.min(timeDiff / 30, 20); // Max 20 points penalty for time difference
  // Penalty for conflicts (warnings)
  score -= conflictCount * 10;
  // Bonus for morning slots (generally preferred)
  var hour = slotStart.getHours();
  if (hour >= 8 && hour <= 11) {
    score += 5;
  }
  return Math.max(score, 0);
}
function generateSlotReason(slotStart, preferredTime, dayOffset) {
  if (dayOffset === 0) {
    var slotTime = (0, date_fns_1.format)(slotStart, "HH:mm");
    if (slotTime === preferredTime) {
      return "Horário exato solicitado";
    }
    return "Mesmo dia, horário próximo";
  }
  if (dayOffset === 1) {
    return "Próximo dia útil disponível";
  }
  if (dayOffset <= 3) {
    return "Horário próximo disponível";
  }
  return "Próxima disponibilidade";
}

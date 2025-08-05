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
      professionalId,
      clinicId,
      startDateStr,
      endDateStr,
      serviceTypeId,
      startDate,
      endDate,
      supabase,
      _a,
      professionalSchedule,
      existingAppointments,
      serviceRules,
      holidays,
      days,
      _loop_1,
      currentDate,
      response,
      error_1;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 7, undefined, 8]);
          searchParams = new URL(request.url).searchParams;
          professionalId = searchParams.get("professional_id");
          clinicId = searchParams.get("clinic_id");
          startDateStr = searchParams.get("start_date");
          endDateStr = searchParams.get("end_date");
          serviceTypeId = searchParams.get("service_type_id");
          if (!professionalId || !clinicId || !startDateStr || !endDateStr) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Missing required parameters" }, { status: 400 }),
            ];
          }
          startDate = (0, date_fns_1.parseISO)(startDateStr);
          endDate = (0, date_fns_1.parseISO)(endDateStr);
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 1:
          supabase = _b.sent();
          return [
            4 /*yield*/,
            Promise.all([
              getProfessionalSchedule(supabase, professionalId, clinicId),
              getExistingAppointments(supabase, professionalId, clinicId, startDate, endDate),
              serviceTypeId
                ? getServiceRules(supabase, serviceTypeId, clinicId)
                : Promise.resolve(null),
              getClinicHolidays(supabase, clinicId, startDate, endDate),
            ]),
          ];
        case 2:
          (_a = _b.sent()),
            (professionalSchedule = _a[0]),
            (existingAppointments = _a[1]),
            (serviceRules = _a[2]),
            (holidays = _a[3]);
          days = [];
          _loop_1 = function (currentDate) {
            var dayOfWeek, daySchedule, dayAvailability;
            return __generator(this, (_c) => {
              switch (_c.label) {
                case 0:
                  dayOfWeek = currentDate.getDay();
                  daySchedule = professionalSchedule.find((s) => s.day_of_week === dayOfWeek);
                  if (!daySchedule?.is_available) return [3 /*break*/, 2];
                  return [
                    4 /*yield*/,
                    generateDayAvailability(
                      currentDate,
                      daySchedule,
                      existingAppointments,
                      serviceRules,
                      holidays,
                    ),
                  ];
                case 1:
                  dayAvailability = _c.sent();
                  days.push(dayAvailability);
                  return [3 /*break*/, 3];
                case 2:
                  // No schedule for this day
                  days.push({
                    date: (0, date_fns_1.format)(currentDate, "yyyy-MM-dd"),
                    slots: [],
                    summary: {
                      total_slots: 0,
                      available_slots: 0,
                      blocked_slots: 0,
                      warning_slots: 0,
                    },
                  });
                  _c.label = 3;
                case 3:
                  return [2 /*return*/];
              }
            });
          };
          currentDate = new Date(startDate);
          _b.label = 3;
        case 3:
          if (!(currentDate <= endDate)) return [3 /*break*/, 6];
          return [5 /*yield**/, _loop_1(currentDate)];
        case 4:
          _b.sent();
          _b.label = 5;
        case 5:
          currentDate = (0, date_fns_1.addDays)(currentDate, 1);
          return [3 /*break*/, 3];
        case 6:
          response = {
            days: days,
            period: {
              start_date: (0, date_fns_1.format)(startDate, "yyyy-MM-dd"),
              end_date: (0, date_fns_1.format)(endDate, "yyyy-MM-dd"),
            },
          };
          return [2 /*return*/, server_2.NextResponse.json(response)];
        case 7:
          error_1 = _b.sent();
          console.error("Error in availability-heatmap API:", error_1);
          return [
            2 /*return*/,
            server_2.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 8:
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
              .eq("clinic_id", clinicId),
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
function getExistingAppointments(supabase, professionalId, clinicId, startDate, endDate) {
  return __awaiter(this, void 0, void 0, function () {
    var _a, data, error;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          return [
            4 /*yield*/,
            supabase
              .from("appointments")
              .select("start_time, end_time, service_type_id, status")
              .eq("professional_id", professionalId)
              .eq("clinic_id", clinicId)
              .neq("status", "cancelled")
              .gte("start_time", startDate.toISOString())
              .lte("start_time", endDate.toISOString()),
          ];
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
          return [2 /*return*/, data];
      }
    });
  });
}
function getClinicHolidays(supabase, clinicId, startDate, endDate) {
  return __awaiter(this, void 0, void 0, function () {
    var _a, data, error;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          return [
            4 /*yield*/,
            supabase
              .from("clinic_holidays")
              .select("*")
              .eq("clinic_id", clinicId)
              .eq("is_active", true)
              .or(
                "start_date.lte."
                  .concat((0, date_fns_1.format)(endDate, "yyyy-MM-dd"), ",end_date.gte.")
                  .concat((0, date_fns_1.format)(startDate, "yyyy-MM-dd")),
              ),
          ];
        case 1:
          (_a = _b.sent()), (data = _a.data), (error = _a.error);
          if (error) {
            console.error("Error fetching clinic holidays:", error);
            return [2 /*return*/, []];
          }
          return [2 /*return*/, data || []];
      }
    });
  });
}
function generateDayAvailability(date, schedule, appointments, serviceRules, holidays) {
  return __awaiter(this, void 0, void 0, function () {
    var slots,
      intervalMinutes,
      startTime,
      endTime,
      dayHolidays,
      currentTime,
      slotStart,
      slotEnd,
      slot,
      summary;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          slots = [];
          intervalMinutes = 30;
          startTime = parseTime(schedule.start_time);
          endTime = parseTime(schedule.end_time);
          dayHolidays = holidays.filter((holiday) => {
            var holidayStart = (0, date_fns_1.parseISO)(holiday.start_date);
            var holidayEnd = (0, date_fns_1.parseISO)(holiday.end_date);
            return date >= holidayStart && date <= holidayEnd;
          });
          currentTime = startTime;
          _a.label = 1;
        case 1:
          if (!(currentTime < endTime)) return [3 /*break*/, 4];
          slotStart = new Date(date);
          slotStart.setHours(Math.floor(currentTime / 60), currentTime % 60, 0, 0);
          slotEnd = (0, date_fns_1.addMinutes)(slotStart, intervalMinutes);
          return [
            4 /*yield*/,
            analyzeSlot(slotStart, slotEnd, schedule, appointments, serviceRules, dayHolidays),
          ];
        case 2:
          slot = _a.sent();
          slots.push(slot);
          _a.label = 3;
        case 3:
          currentTime += intervalMinutes;
          return [3 /*break*/, 1];
        case 4:
          summary = {
            total_slots: slots.length,
            available_slots: slots.filter((s) => s.available && s.conflicts.length === 0).length,
            blocked_slots: slots.filter((s) => !s.available).length,
            warning_slots: slots.filter(
              (s) => s.available && s.conflicts.some((c) => c.severity === "warning"),
            ).length,
          };
          return [
            2 /*return*/,
            {
              date: (0, date_fns_1.format)(date, "yyyy-MM-dd"),
              slots: slots,
              summary: summary,
            },
          ];
      }
    });
  });
}
function analyzeSlot(slotStart, slotEnd, schedule, appointments, serviceRules, holidays) {
  return __awaiter(this, void 0, void 0, function () {
    var conflicts,
      available,
      capacityUsed,
      maxCapacity,
      _i,
      holidays_1,
      holiday,
      holidayStartTime,
      holidayEndTime,
      _slotStartTime,
      _slotEndTime,
      breakStart,
      breakEnd,
      slotStartTime,
      slotEndTime,
      hourStart,
      hourEnd,
      appointmentsInHour,
      directOverlaps,
      bufferBefore_1,
      bufferAfter_1,
      bufferConflicts;
    return __generator(this, (_a) => {
      conflicts = [];
      available = true;
      capacityUsed = 0;
      maxCapacity = schedule.max_appointments_per_hour || 2;
      // Check holiday conflicts
      for (_i = 0, holidays_1 = holidays; _i < holidays_1.length; _i++) {
        holiday = holidays_1[_i];
        if (holiday.start_time && holiday.end_time) {
          holidayStartTime = parseTime(holiday.start_time);
          holidayEndTime = parseTime(holiday.end_time);
          slotStartTime = slotStart.getHours() * 60 + slotStart.getMinutes();
          slotEndTime = slotEnd.getHours() * 60 + slotEnd.getMinutes();
          if (slotStartTime >= holidayStartTime && slotEndTime <= holidayEndTime) {
            conflicts.push({
              type: "holiday",
              message: "Fechado: ".concat(holiday.name),
              severity: "error",
            });
            available = false;
          }
        } else {
          // Full day holiday
          conflicts.push({
            type: "holiday",
            message: "Fechado: ".concat(holiday.name),
            severity: "error",
          });
          available = false;
        }
      }
      // Check break time
      if (schedule.break_start_time && schedule.break_end_time) {
        breakStart = parseTime(schedule.break_start_time);
        breakEnd = parseTime(schedule.break_end_time);
        slotStartTime = slotStart.getHours() * 60 + slotStart.getMinutes();
        slotEndTime = slotEnd.getHours() * 60 + slotEnd.getMinutes();
        if (
          (slotStartTime >= breakStart && slotStartTime < breakEnd) ||
          (slotEndTime > breakStart && slotEndTime <= breakEnd) ||
          (slotStartTime <= breakStart && slotEndTime >= breakEnd)
        ) {
          conflicts.push({
            type: "break_time",
            message: "Horário de intervalo",
            severity: "error",
          });
          available = false;
        }
      }
      hourStart = new Date(slotStart);
      hourStart.setMinutes(0, 0, 0);
      hourEnd = (0, date_fns_1.addMinutes)(hourStart, 60);
      appointmentsInHour = appointments.filter((apt) => {
        var aptStart = (0, date_fns_1.parseISO)(apt.start_time);
        return aptStart >= hourStart && aptStart < hourEnd;
      });
      capacityUsed = appointmentsInHour.length;
      // Check capacity limits
      if (capacityUsed >= maxCapacity) {
        conflicts.push({
          type: "capacity_full",
          message: "Capacidade esgotada (".concat(capacityUsed, "/").concat(maxCapacity, ")"),
          severity: "error",
        });
        available = false;
      } else if (capacityUsed / maxCapacity >= 0.8) {
        conflicts.push({
          type: "capacity_high",
          message: "Alta ocupa\u00E7\u00E3o (".concat(capacityUsed, "/").concat(maxCapacity, ")"),
          severity: "warning",
        });
      }
      directOverlaps = appointments.filter((apt) => {
        var aptStart = (0, date_fns_1.parseISO)(apt.start_time);
        var aptEnd = (0, date_fns_1.parseISO)(apt.end_time);
        return (
          (slotStart >= aptStart && slotStart < aptEnd) ||
          (slotEnd > aptStart && slotEnd <= aptEnd) ||
          (slotStart <= aptStart && slotEnd >= aptEnd)
        );
      });
      if (directOverlaps.length > 0) {
        conflicts.push({
          type: "appointment_overlap",
          message: "Conflito direto com agendamento",
          severity: "error",
        });
        available = false;
      }
      // Service-specific rules
      if (serviceRules) {
        bufferBefore_1 = serviceRules.buffer_before || 0;
        bufferAfter_1 = serviceRules.buffer_after || 0;
        if (bufferBefore_1 > 0 || bufferAfter_1 > 0) {
          bufferConflicts = appointments.filter((apt) => {
            var aptStart = (0, date_fns_1.parseISO)(apt.start_time);
            var aptEnd = (0, date_fns_1.parseISO)(apt.end_time);
            var slotWithBufferStart = (0, date_fns_1.addMinutes)(slotStart, -bufferBefore_1);
            var slotWithBufferEnd = (0, date_fns_1.addMinutes)(slotEnd, bufferAfter_1);
            return (
              (slotWithBufferStart >= aptStart && slotWithBufferStart < aptEnd) ||
              (slotWithBufferEnd > aptStart && slotWithBufferEnd <= aptEnd) ||
              (slotWithBufferStart <= aptStart && slotWithBufferEnd >= aptEnd)
            );
          });
          if (bufferConflicts.length > 0) {
            conflicts.push({
              type: "buffer_conflict",
              message: "Conflito com tempo de buffer (".concat(
                bufferBefore_1 + bufferAfter_1,
                "min)",
              ),
              severity: "warning",
            });
          }
        }
      }
      return [
        2 /*return*/,
        {
          time: slotStart.toISOString(),
          available: available,
          conflicts: conflicts,
          capacity: {
            used: capacityUsed,
            maximum: maxCapacity,
          },
        },
      ];
    });
  });
}
function parseTime(timeString) {
  var _a = timeString.split(":").map(Number),
    hours = _a[0],
    minutes = _a[1];
  return hours * 60 + minutes;
}

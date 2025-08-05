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
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
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
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
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
      return function (v) {
        return step([n, v]);
      };
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
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentManager = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var AppointmentManager = /** @class */ (function () {
  function AppointmentManager(
    supabaseUrl,
    supabaseKey,
    auditLogger,
    lgpdManager,
    sessionManager,
    config,
  ) {
    this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
    this.auditLogger = auditLogger;
    this.lgpdManager = lgpdManager;
    this.sessionManager = sessionManager;
    this.config = __assign(
      {
        maxAdvanceBookingDays: 90,
        minAdvanceBookingHours: 2,
        maxReschedulingAttempts: 3,
        cancellationDeadlineHours: 24,
        enableWaitingList: true,
        autoConfirmationEnabled: false,
        reminderIntervals: [24, 2],
      },
      config,
    );
  }
  /**
   * Get available time slots for booking
   */
  AppointmentManager.prototype.getAvailableSlots = function (
    patientId,
    sessionToken,
    serviceId,
    startDate,
    endDate,
    staffId,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var sessionValidation,
        now,
        maxDate,
        _a,
        service,
        serviceError,
        staffFilter,
        _b,
        availableStaff,
        staffError,
        _c,
        existingAppointments,
        appointmentsError,
        availableSlots,
        currentDate,
        _loop_1,
        this_1,
        error_1;
      var _d;
      return __generator(this, function (_e) {
        switch (_e.label) {
          case 0:
            _e.trys.push([0, 6, , 8]);
            return [4 /*yield*/, this.sessionManager.validateSession(sessionToken)];
          case 1:
            sessionValidation = _e.sent();
            if (
              !sessionValidation.isValid ||
              ((_d = sessionValidation.session) === null || _d === void 0
                ? void 0
                : _d.patientId) !== patientId
            ) {
              throw new Error("Invalid session or unauthorized access");
            }
            now = new Date();
            maxDate = new Date(
              now.getTime() + this.config.maxAdvanceBookingDays * 24 * 60 * 60 * 1000,
            );
            if (startDate < now || endDate > maxDate) {
              throw new Error(
                "Booking dates must be between now and ".concat(
                  this.config.maxAdvanceBookingDays,
                  " days in advance",
                ),
              );
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("services")
                .select("id, name, duration, price, category")
                .eq("id", serviceId)
                .single(),
            ];
          case 2:
            (_a = _e.sent()), (service = _a.data), (serviceError = _a.error);
            if (serviceError) throw serviceError;
            staffFilter = {};
            if (staffId) {
              staffFilter = { id: staffId };
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("staff")
                .select(
                  "\n          id, name, specialization,\n          staff_availability!inner(\n            day_of_week, start_time, end_time, is_available\n          )\n        ",
                )
                .match(staffFilter)
                .eq("staff_availability.is_available", true),
            ];
          case 3:
            (_b = _e.sent()), (availableStaff = _b.data), (staffError = _b.error);
            if (staffError) throw staffError;
            return [
              4 /*yield*/,
              this.supabase
                .from("appointments")
                .select("staff_id, appointment_date, appointment_time, estimated_duration")
                .gte("appointment_date", startDate.toISOString().split("T")[0])
                .lte("appointment_date", endDate.toISOString().split("T")[0])
                .in("status", ["scheduled", "confirmed", "in_progress"]),
            ];
          case 4:
            (_c = _e.sent()), (existingAppointments = _c.data), (appointmentsError = _c.error);
            if (appointmentsError) throw appointmentsError;
            availableSlots = [];
            currentDate = new Date(startDate);
            _loop_1 = function () {
              var dayOfWeek = currentDate.getDay();
              // Check each staff member's availability for this day
              for (var _i = 0, _f = availableStaff || []; _i < _f.length; _i++) {
                var staff = _f[_i];
                var dayAvailability = staff.staff_availability.find(function (avail) {
                  return avail.day_of_week === dayOfWeek;
                });
                if (dayAvailability) {
                  var slots = this_1.generateTimeSlots(
                    currentDate,
                    dayAvailability.start_time,
                    dayAvailability.end_time,
                    service.duration,
                    staff,
                    service,
                    existingAppointments,
                  );
                  availableSlots.push.apply(availableSlots, slots);
                }
              }
              currentDate.setDate(currentDate.getDate() + 1);
            };
            this_1 = this;
            while (currentDate <= endDate) {
              _loop_1();
            }
            // Log slot access
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "slots_accessed",
                userId: patientId,
                userType: "patient",
                details: {
                  serviceId: serviceId,
                  dateRange: { startDate: startDate, endDate: endDate },
                  slotsFound: availableSlots.length,
                },
              }),
            ];
          case 5:
            // Log slot access
            _e.sent();
            return [
              2 /*return*/,
              availableSlots.sort(function (a, b) {
                return a.date.getTime() - b.date.getTime();
              }),
            ];
          case 6:
            error_1 = _e.sent();
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "slots_access_failed",
                userId: patientId,
                userType: "patient",
                details: { error: error_1.message },
              }),
            ];
          case 7:
            _e.sent();
            throw error_1;
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Generate time slots for a specific day and staff member
   */
  AppointmentManager.prototype.generateTimeSlots = function (
    date,
    startTime,
    endTime,
    serviceDuration,
    staff,
    service,
    existingAppointments,
  ) {
    var slots = [];
    var _a = startTime.split(":").map(Number),
      startHour = _a[0],
      startMinute = _a[1];
    var _b = endTime.split(":").map(Number),
      endHour = _b[0],
      endMinute = _b[1];
    var slotStart = new Date(date);
    slotStart.setHours(startHour, startMinute, 0, 0);
    var slotEnd = new Date(date);
    slotEnd.setHours(endHour, endMinute, 0, 0);
    var now = new Date();
    var minBookingTime = new Date(
      now.getTime() + this.config.minAdvanceBookingHours * 60 * 60 * 1000,
    );
    var _loop_2 = function () {
      var slotEndTime = new Date(slotStart.getTime() + serviceDuration * 60 * 1000);
      // Check if slot is in the future with minimum advance booking time
      if (slotStart >= minBookingTime) {
        // Check for conflicts with existing appointments
        var hasConflict = existingAppointments.some(function (apt) {
          if (apt.staff_id !== staff.id) return false;
          var aptDate = new Date("".concat(apt.appointment_date, "T").concat(apt.appointment_time));
          var aptEndTime = new Date(aptDate.getTime() + apt.estimated_duration * 60 * 1000);
          return (
            (slotStart >= aptDate && slotStart < aptEndTime) ||
            (slotEndTime > aptDate && slotEndTime <= aptEndTime) ||
            (slotStart <= aptDate && slotEndTime >= aptEndTime)
          );
        });
        if (!hasConflict) {
          slots.push({
            id: ""
              .concat(staff.id, "_")
              .concat(date.toISOString().split("T")[0], "_")
              .concat(slotStart.getHours(), ":")
              .concat(slotStart.getMinutes().toString().padStart(2, "0")),
            date: new Date(date),
            startTime: ""
              .concat(slotStart.getHours(), ":")
              .concat(slotStart.getMinutes().toString().padStart(2, "0")),
            endTime: ""
              .concat(slotEndTime.getHours(), ":")
              .concat(slotEndTime.getMinutes().toString().padStart(2, "0")),
            staffId: staff.id,
            staffName: staff.name,
            serviceId: service.id,
            serviceName: service.name,
            duration: serviceDuration,
            isAvailable: true,
            price: service.price,
          });
        }
      }
      // Move to next slot (15-minute intervals)
      slotStart.setMinutes(slotStart.getMinutes() + 15);
    };
    while (slotStart.getTime() + serviceDuration * 60 * 1000 <= slotEnd.getTime()) {
      _loop_2();
    }
    return slots;
  };
  /**
   * Book an appointment
   */
  AppointmentManager.prototype.bookAppointment = function (request, sessionToken) {
    return __awaiter(this, void 0, void 0, function () {
      var sessionValidation,
        validationResult,
        _a,
        conflictingAppointments,
        conflictError,
        alternatives,
        _b,
        newAppointment,
        insertError,
        error_2;
      var _c;
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            _d.trys.push([0, 8, , 10]);
            return [4 /*yield*/, this.sessionManager.validateSession(sessionToken)];
          case 1:
            sessionValidation = _d.sent();
            if (
              !sessionValidation.isValid ||
              ((_c = sessionValidation.session) === null || _c === void 0
                ? void 0
                : _c.patientId) !== request.patientId
            ) {
              throw new Error("Invalid session or unauthorized access");
            }
            return [4 /*yield*/, this.validateBookingRequest(request)];
          case 2:
            validationResult = _d.sent();
            if (!validationResult.isValid) {
              return [
                2 /*return*/,
                {
                  success: false,
                  message: validationResult.message,
                  conflictingAppointments: validationResult.conflicts,
                  suggestedAlternatives: validationResult.alternatives,
                },
              ];
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("appointments")
                .select("*")
                .eq("staff_id", request.staffId)
                .eq("appointment_date", request.preferredDate.toISOString().split("T")[0])
                .eq("appointment_time", request.preferredTime)
                .in("status", ["scheduled", "confirmed", "in_progress"]),
            ];
          case 3:
            (_a = _d.sent()), (conflictingAppointments = _a.data), (conflictError = _a.error);
            if (conflictError) throw conflictError;
            if (!(conflictingAppointments && conflictingAppointments.length > 0))
              return [3 /*break*/, 5];
            return [
              4 /*yield*/,
              this.getAlternativeSlots(request.serviceId, request.preferredDate, request.staffId),
            ];
          case 4:
            alternatives = _d.sent();
            return [
              2 /*return*/,
              {
                success: false,
                message: "Horário não disponível. Verifique as alternativas sugeridas.",
                conflictingAppointments: conflictingAppointments,
                suggestedAlternatives: alternatives,
              },
            ];
          case 5:
            return [
              4 /*yield*/,
              this.supabase
                .from("appointments")
                .insert({
                  patient_id: request.patientId,
                  service_id: request.serviceId,
                  staff_id: request.staffId,
                  appointment_date: request.preferredDate.toISOString().split("T")[0],
                  appointment_time: request.preferredTime,
                  status: this.config.autoConfirmationEnabled ? "confirmed" : "scheduled",
                  notes: request.notes,
                  is_urgent: request.isUrgent || false,
                  reminder_preferences: request.reminderPreferences,
                  created_at: new Date().toISOString(),
                })
                .select()
                .single(),
            ];
          case 6:
            (_b = _d.sent()), (newAppointment = _b.data), (insertError = _b.error);
            if (insertError) throw insertError;
            // Log successful booking
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "appointment_booked",
                userId: request.patientId,
                userType: "patient",
                details: {
                  appointmentId: newAppointment.id,
                  serviceId: request.serviceId,
                  staffId: request.staffId,
                  appointmentDate: request.preferredDate,
                  appointmentTime: request.preferredTime,
                },
              }),
            ];
          case 7:
            // Log successful booking
            _d.sent();
            return [
              2 /*return*/,
              {
                success: true,
                appointmentId: newAppointment.id,
                message: "Agendamento realizado com sucesso!",
              },
            ];
          case 8:
            error_2 = _d.sent();
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "appointment_booking_failed",
                userId: request.patientId,
                userType: "patient",
                details: { error: error_2.message },
              }),
            ];
          case 9:
            _d.sent();
            throw error_2;
          case 10:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Validate booking request
   */
  AppointmentManager.prototype.validateBookingRequest = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var now,
        appointmentDateTime,
        minBookingTime,
        maxBookingTime,
        _a,
        service,
        serviceError,
        _b,
        staff,
        staffError;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            now = new Date();
            appointmentDateTime = new Date(
              ""
                .concat(request.preferredDate.toISOString().split("T")[0], "T")
                .concat(request.preferredTime),
            );
            minBookingTime = new Date(
              now.getTime() + this.config.minAdvanceBookingHours * 60 * 60 * 1000,
            );
            maxBookingTime = new Date(
              now.getTime() + this.config.maxAdvanceBookingDays * 24 * 60 * 60 * 1000,
            );
            // Check minimum advance booking time
            if (appointmentDateTime < minBookingTime) {
              return [
                2 /*return*/,
                {
                  isValid: false,
                  message: "Agendamentos devem ser feitos com pelo menos ".concat(
                    this.config.minAdvanceBookingHours,
                    " horas de anteced\u00EAncia.",
                  ),
                },
              ];
            }
            // Check maximum advance booking time
            if (appointmentDateTime > maxBookingTime) {
              return [
                2 /*return*/,
                {
                  isValid: false,
                  message: "Agendamentos podem ser feitos com at\u00E9 ".concat(
                    this.config.maxAdvanceBookingDays,
                    " dias de anteced\u00EAncia.",
                  ),
                },
              ];
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("services")
                .select("id, name, is_active")
                .eq("id", request.serviceId)
                .single(),
            ];
          case 1:
            (_a = _c.sent()), (service = _a.data), (serviceError = _a.error);
            if (serviceError || !service || !service.is_active) {
              return [
                2 /*return*/,
                {
                  isValid: false,
                  message: "Serviço não encontrado ou não disponível.",
                },
              ];
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("staff")
                .select("id, name, is_active")
                .eq("id", request.staffId)
                .single(),
            ];
          case 2:
            (_b = _c.sent()), (staff = _b.data), (staffError = _b.error);
            if (staffError || !staff || !staff.is_active) {
              return [
                2 /*return*/,
                {
                  isValid: false,
                  message: "Profissional não encontrado ou não disponível.",
                },
              ];
            }
            return [
              2 /*return*/,
              {
                isValid: true,
                message: "Validação bem-sucedida",
              },
            ];
        }
      });
    });
  };
  /**
   * Get alternative time slots when preferred slot is not available
   */
  AppointmentManager.prototype.getAlternativeSlots = function (serviceId, preferredDate, staffId) {
    return __awaiter(this, void 0, void 0, function () {
      var startDate, endDate, alternatives;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            startDate = new Date(preferredDate);
            endDate = new Date(preferredDate.getTime() + 7 * 24 * 60 * 60 * 1000);
            return [
              4 /*yield*/,
              this.getAvailableSlots(
                "", // We'll skip session validation for internal use
                "",
                serviceId,
                startDate,
                endDate,
                staffId,
              ),
            ];
          case 1:
            alternatives = _a.sent();
            return [2 /*return*/, alternatives.slice(0, 5)]; // Return top 5 alternatives
        }
      });
    });
  };
  return AppointmentManager;
})();
exports.AppointmentManager = AppointmentManager;

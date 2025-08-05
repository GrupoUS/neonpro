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
exports.runtime = void 0;
exports.GET = GET;
var server_1 = require("@/lib/supabase/server");
var server_2 = require("next/server");
// 🚀 Edge Runtime para busca ultra-rápida de horários disponíveis
exports.runtime = "edge";
/**
 * 📅 Available Slots API - Edge Runtime Optimized
 *
 * ⚡ Ultra-fast slot availability com Edge Runtime
 * 📊 Critical performance: <100ms para agenda em tempo real
 * 🌐 Global edge deployment: Resposta instantânea mundial
 * 🔄 Real-time conflict detection sem latency
 */
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      user,
      searchParams,
      professionalId,
      date,
      profile,
      generateTimeSlots,
      timeSlots,
      startOfDay,
      endOfDay,
      _a,
      existingAppointments_1,
      appointmentsError,
      availableSlots,
      response,
      error_1;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 5, , 6]);
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 1:
          supabase = _b.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          user = _b.sent().data.user;
          if (!user) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          searchParams = request.nextUrl.searchParams;
          professionalId = searchParams.get("professional_id");
          date = searchParams.get("date");
          if (!professionalId || !date) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Missing required parameters" }, { status: 400 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("profiles").select("clinic_id").eq("id", user.id).single(),
          ];
        case 3:
          profile = _b.sent().data;
          if (!(profile === null || profile === void 0 ? void 0 : profile.clinic_id)) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Clinic not found" }, { status: 400 }),
            ];
          }
          generateTimeSlots = function (date) {
            var slots = [];
            var baseDate = new Date(date + "T00:00:00.000Z");
            for (var hour = 8; hour < 18; hour++) {
              for (var minute = 0; minute < 60; minute += 15) {
                var slotStart = new Date(baseDate);
                slotStart.setUTCHours(hour, minute, 0, 0);
                var slotEnd = new Date(slotStart);
                slotEnd.setUTCMinutes(slotEnd.getUTCMinutes() + 15);
                slots.push({
                  slot_start: slotStart.toISOString(),
                  slot_end: slotEnd.toISOString(),
                  is_available: true, // Will be updated based on existing appointments
                  duration_minutes: 15,
                });
              }
            }
            return slots;
          };
          timeSlots = generateTimeSlots(date);
          startOfDay = new Date(date + "T00:00:00.000Z");
          endOfDay = new Date(date + "T23:59:59.999Z");
          return [
            4 /*yield*/,
            supabase
              .from("appointments")
              .select("start_time, end_time")
              .eq("clinic_id", profile.clinic_id)
              .eq("professional_id", professionalId)
              .not("status", "eq", "cancelled")
              .gte("start_time", startOfDay.toISOString())
              .lte("start_time", endOfDay.toISOString()),
          ];
        case 4:
          (_a = _b.sent()), (existingAppointments_1 = _a.data), (appointmentsError = _a.error);
          if (appointmentsError) {
            console.error("Error fetching appointments:", appointmentsError);
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                {
                  success: false,
                  data: [],
                  error_message: appointmentsError.message,
                },
                { status: 500 },
              ),
            ];
          }
          availableSlots = timeSlots.map(function (slot) {
            var slotStart = new Date(slot.slot_start);
            var slotEnd = new Date(slot.slot_end);
            var hasConflict =
              existingAppointments_1 === null || existingAppointments_1 === void 0
                ? void 0
                : existingAppointments_1.some(function (appointment) {
                    var appointmentStart = new Date(appointment.start_time);
                    var appointmentEnd = new Date(appointment.end_time);
                    // Check if the slot overlaps with any existing appointment
                    return (
                      (slotStart >= appointmentStart && slotStart < appointmentEnd) ||
                      (slotEnd > appointmentStart && slotEnd <= appointmentEnd) ||
                      (slotStart <= appointmentStart && slotEnd >= appointmentEnd)
                    );
                  });
            return __assign(__assign({}, slot), { is_available: !hasConflict });
          });
          response = {
            success: true,
            data: availableSlots,
          };
          return [2 /*return*/, server_2.NextResponse.json(response)];
        case 5:
          error_1 = _b.sent();
          console.error("API Error:", error_1);
          return [
            2 /*return*/,
            server_2.NextResponse.json(
              {
                success: false,
                data: [],
                error_message: "Internal Server Error",
              },
              { status: 500 },
            ),
          ];
        case 6:
          return [2 /*return*/];
      }
    });
  });
}

"use strict";
/**
 * tRPC Appointments Router
 * Healthcare appointment management with conflict detection
 */
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
exports.appointmentsRouter = void 0;
var zod_1 = require("zod");
var trpc_1 = require("../trpc");
var server_1 = require("@trpc/server");
var appointmentSchema = zod_1.z.object({
  patient_id: zod_1.z.string().uuid(),
  doctor_id: zod_1.z.string().uuid(),
  appointment_date: zod_1.z.string().datetime(),
  duration_minutes: zod_1.z.number().min(15).max(480),
  appointment_type: zod_1.z.enum(["consultation", "follow_up", "emergency", "surgery"]),
  notes: zod_1.z.string().optional(),
  priority: zod_1.z.enum(["low", "medium", "high", "urgent"]).default("medium"),
});
exports.appointmentsRouter = (0, trpc_1.createTRPCRouter)({
  // List appointments with filters
  list: trpc_1.protectedProcedure
    .input(
      zod_1.z.object({
        limit: zod_1.z.number().min(1).max(100).default(20),
        offset: zod_1.z.number().min(0).default(0),
        date_from: zod_1.z.string().date().optional(),
        date_to: zod_1.z.string().date().optional(),
        doctor_id: zod_1.z.string().uuid().optional(),
        patient_id: zod_1.z.string().uuid().optional(),
        status: zod_1.z
          .enum(["scheduled", "completed", "cancelled", "no_show", "all"])
          .default("scheduled"),
      }),
    )
    .query(function (_a) {
      return __awaiter(void 0, [_a], void 0, function (_b) {
        var supabase, query, _c, data, error, count;
        var ctx = _b.ctx,
          input = _b.input;
        return __generator(this, function (_d) {
          switch (_d.label) {
            case 0:
              supabase = ctx.supabase;
              query = supabase
                .from("appointments")
                .select(
                  "\n          *,\n          patients!inner(id, name, email),\n          doctors!inner(id, name, specialty)\n        ",
                  { count: "exact" },
                )
                .range(input.offset, input.offset + input.limit - 1)
                .order("appointment_date", { ascending: true });
              if (input.date_from) {
                query = query.gte("appointment_date", input.date_from);
              }
              if (input.date_to) {
                query = query.lte("appointment_date", input.date_to);
              }
              if (input.doctor_id) {
                query = query.eq("doctor_id", input.doctor_id);
              }
              if (input.patient_id) {
                query = query.eq("patient_id", input.patient_id);
              }
              if (input.status !== "all") {
                query = query.eq("status", input.status);
              }
              return [4 /*yield*/, query];
            case 1:
              (_c = _d.sent()), (data = _c.data), (error = _c.error), (count = _c.count);
              if (error) {
                throw new server_1.TRPCError({
                  code: "INTERNAL_SERVER_ERROR",
                  message: "Failed to fetch appointments",
                });
              }
              return [
                2 /*return*/,
                {
                  appointments: data || [],
                  total: count || 0,
                  hasMore: input.offset + input.limit < (count || 0),
                },
              ];
          }
        });
      });
    }),
  // Create appointment with conflict detection
  create: trpc_1.protectedProcedure.input(appointmentSchema).mutation(function (_a) {
    return __awaiter(void 0, [_a], void 0, function (_b) {
      var supabase, user, appointmentEnd, conflicts, _c, data, error;
      var ctx = _b.ctx,
        input = _b.input;
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            (supabase = ctx.supabase), (user = ctx.user);
            appointmentEnd = new Date(input.appointment_date);
            appointmentEnd.setMinutes(appointmentEnd.getMinutes() + input.duration_minutes);
            return [
              4 /*yield*/,
              supabase
                .from("appointments")
                .select("id")
                .eq("doctor_id", input.doctor_id)
                .eq("status", "scheduled")
                .gte("appointment_date", input.appointment_date)
                .lt("appointment_date", appointmentEnd.toISOString()),
            ];
          case 1:
            conflicts = _d.sent().data;
            if (conflicts && conflicts.length > 0) {
              throw new server_1.TRPCError({
                code: "CONFLICT",
                message: "Doctor has a conflicting appointment at this time",
              });
            }
            return [
              4 /*yield*/,
              supabase
                .from("appointments")
                .insert(
                  __assign(__assign({}, input), {
                    status: "scheduled",
                    created_by: user.id,
                    created_at: new Date().toISOString(),
                  }),
                )
                .select()
                .single(),
            ];
          case 2:
            (_c = _d.sent()), (data = _c.data), (error = _c.error);
            if (error) {
              throw new server_1.TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to create appointment",
              });
            }
            return [2 /*return*/, data];
        }
      });
    });
  }),
  // Update appointment status
  updateStatus: trpc_1.protectedProcedure
    .input(
      zod_1.z.object({
        id: zod_1.z.string().uuid(),
        status: zod_1.z.enum(["scheduled", "completed", "cancelled", "no_show"]),
        notes: zod_1.z.string().optional(),
      }),
    )
    .mutation(function (_a) {
      return __awaiter(void 0, [_a], void 0, function (_b) {
        var supabase, user, _c, data, error;
        var ctx = _b.ctx,
          input = _b.input;
        return __generator(this, function (_d) {
          switch (_d.label) {
            case 0:
              (supabase = ctx.supabase), (user = ctx.user);
              return [
                4 /*yield*/,
                supabase
                  .from("appointments")
                  .update({
                    status: input.status,
                    notes: input.notes,
                    updated_by: user.id,
                    updated_at: new Date().toISOString(),
                  })
                  .eq("id", input.id)
                  .select()
                  .single(),
              ];
            case 1:
              (_c = _d.sent()), (data = _c.data), (error = _c.error);
              if (error) {
                throw new server_1.TRPCError({
                  code: "INTERNAL_SERVER_ERROR",
                  message: "Failed to update appointment",
                });
              }
              return [2 /*return*/, data];
          }
        });
      });
    }),
  // Get available slots for doctor
  getAvailableSlots: trpc_1.protectedProcedure
    .input(
      zod_1.z.object({
        doctor_id: zod_1.z.string().uuid(),
        date: zod_1.z.string().date(),
        duration_minutes: zod_1.z.number().min(15).max(480).default(30),
      }),
    )
    .query(function (_a) {
      return __awaiter(void 0, [_a], void 0, function (_b) {
        var supabase,
          startOfDay,
          endOfDay,
          _c,
          appointments,
          error,
          workingHours,
          slots,
          hour,
          _loop_1,
          minute;
        var ctx = _b.ctx,
          input = _b.input;
        return __generator(this, function (_d) {
          switch (_d.label) {
            case 0:
              supabase = ctx.supabase;
              startOfDay = "".concat(input.date, "T00:00:00.000Z");
              endOfDay = "".concat(input.date, "T23:59:59.999Z");
              return [
                4 /*yield*/,
                supabase
                  .from("appointments")
                  .select("appointment_date, duration_minutes")
                  .eq("doctor_id", input.doctor_id)
                  .eq("status", "scheduled")
                  .gte("appointment_date", startOfDay)
                  .lte("appointment_date", endOfDay)
                  .order("appointment_date"),
              ];
            case 1:
              (_c = _d.sent()), (appointments = _c.data), (error = _c.error);
              if (error) {
                throw new server_1.TRPCError({
                  code: "INTERNAL_SERVER_ERROR",
                  message: "Failed to fetch doctor availability",
                });
              }
              workingHours = { start: 8, end: 18 };
              slots = [];
              for (hour = workingHours.start; hour < workingHours.end; hour++) {
                _loop_1 = function (minute) {
                  var slotTime = new Date(input.date);
                  slotTime.setHours(hour, minute, 0, 0);
                  // Check if slot conflicts with existing appointments
                  var hasConflict =
                    appointments === null || appointments === void 0
                      ? void 0
                      : appointments.some(function (apt) {
                          var aptStart = new Date(apt.appointment_date);
                          var aptEnd = new Date(aptStart.getTime() + apt.duration_minutes * 60000);
                          var slotEnd = new Date(
                            slotTime.getTime() + input.duration_minutes * 60000,
                          );
                          return (
                            (slotTime >= aptStart && slotTime < aptEnd) ||
                            (slotEnd > aptStart && slotEnd <= aptEnd)
                          );
                        });
                  if (!hasConflict) {
                    slots.push({
                      datetime: slotTime.toISOString(),
                      display_time: slotTime.toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      }),
                    });
                  }
                };
                for (minute = 0; minute < 60; minute += 30) {
                  _loop_1(minute);
                }
              }
              return [2 /*return*/, { slots: slots }];
          }
        });
      });
    }),
});

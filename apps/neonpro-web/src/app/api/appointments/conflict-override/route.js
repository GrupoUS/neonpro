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
exports.POST = POST;
exports.GET = GET;
var server_1 = require("@/lib/supabase/server");
var server_2 = require("next/server");
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      body,
      appointment_id,
      professional_id,
      clinic_id,
      patient_id,
      service_type_id,
      start_time,
      end_time,
      override_reason,
      conflicts,
      hasManagerPermission,
      _b,
      transactionResult,
      transactionError,
      response,
      error_1;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 7, undefined, 8]);
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 1:
          supabase = _c.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _c.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _c.sent();
          (appointment_id = body.appointment_id),
            (professional_id = body.professional_id),
            (clinic_id = body.clinic_id),
            (patient_id = body.patient_id),
            (service_type_id = body.service_type_id),
            (start_time = body.start_time),
            (end_time = body.end_time),
            (override_reason = body.override_reason),
            (conflicts = body.conflicts);
          // Validate required fields
          if (
            !professional_id ||
            !clinic_id ||
            !patient_id ||
            !service_type_id ||
            !start_time ||
            !end_time ||
            !override_reason ||
            !conflicts.length
          ) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Missing required fields" }, { status: 400 }),
            ];
          }
          return [4 /*yield*/, checkManagerPermissions(supabase, user.id, clinic_id)];
        case 4:
          hasManagerPermission = _c.sent();
          if (!hasManagerPermission) {
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { error: "Insufficient permissions. Manager access required." },
                { status: 403 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            supabase.rpc("handle_conflict_override", {
              p_appointment_id: appointment_id,
              p_professional_id: professional_id,
              p_clinic_id: clinic_id,
              p_patient_id: patient_id,
              p_service_type_id: service_type_id,
              p_start_time: start_time,
              p_end_time: end_time,
              p_override_reason: override_reason,
              p_conflicts: JSON.stringify(conflicts),
              p_manager_id: user.id,
              p_manager_email: user.email,
            }),
          ];
        case 5:
          (_b = _c.sent()), (transactionResult = _b.data), (transactionError = _b.error);
          if (transactionError) {
            console.error("Error handling conflict override:", transactionError);
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { error: "Failed to process override request" },
                { status: 500 },
              ),
            ];
          }
          // Send notifications
          return [
            4 /*yield*/,
            sendOverrideNotifications(
              supabase,
              transactionResult.appointment_id,
              professional_id,
              patient_id,
              user.email || "Unknown Manager",
              override_reason,
              conflicts,
            ),
          ];
        case 6:
          // Send notifications
          _c.sent();
          response = {
            success: true,
            appointment_id: transactionResult.appointment_id,
            override_id: transactionResult.override_id,
            warnings: transactionResult.warnings || [],
          };
          return [2 /*return*/, server_2.NextResponse.json(response)];
        case 7:
          error_1 = _c.sent();
          console.error("Error in conflict-override API:", error_1);
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
// Get override history for an appointment
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var searchParams,
      appointmentId,
      clinicId,
      supabase,
      _a,
      user,
      authError,
      hasAccess,
      _b,
      overrides,
      error,
      error_2;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 5, undefined, 6]);
          searchParams = new URL(request.url).searchParams;
          appointmentId = searchParams.get("appointment_id");
          clinicId = searchParams.get("clinic_id");
          if (!appointmentId || !clinicId) {
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { error: "Missing appointment_id or clinic_id parameter" },
                { status: 400 },
              ),
            ];
          }
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 1:
          supabase = _c.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _c.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, checkClinicAccess(supabase, user.id, clinicId)];
        case 3:
          hasAccess = _c.sent();
          if (!hasAccess) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Access denied" }, { status: 403 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("appointment_conflict_overrides")
              .select(
                "\n        id,\n        override_reason,\n        conflicts,\n        override_timestamp,\n        manager_email,\n        is_active,\n        profiles!manager_id (\n          full_name\n        )\n      ",
              )
              .eq("appointment_id", appointmentId)
              .order("override_timestamp", { ascending: false }),
          ];
        case 4:
          (_b = _c.sent()), (overrides = _b.data), (error = _b.error);
          if (error) {
            console.error("Error fetching override history:", error);
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { error: "Failed to fetch override history" },
                { status: 500 },
              ),
            ];
          }
          return [2 /*return*/, server_2.NextResponse.json({ overrides: overrides || [] })];
        case 5:
          error_2 = _c.sent();
          console.error("Error in conflict-override GET API:", error_2);
          return [
            2 /*return*/,
            server_2.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
function checkManagerPermissions(supabase, userId, clinicId) {
  return __awaiter(this, void 0, void 0, function () {
    var _a, data, error;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          return [
            4 /*yield*/,
            supabase
              .from("clinic_users")
              .select("role")
              .eq("user_id", userId)
              .eq("clinic_id", clinicId)
              .eq("is_active", true)
              .single(),
          ];
        case 1:
          (_a = _b.sent()), (data = _a.data), (error = _a.error);
          if (error || !data) {
            return [2 /*return*/, false];
          }
          return [2 /*return*/, ["admin", "manager"].includes(data.role)];
      }
    });
  });
}
function checkClinicAccess(supabase, userId, clinicId) {
  return __awaiter(this, void 0, void 0, function () {
    var _a, data, error;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          return [
            4 /*yield*/,
            supabase
              .from("clinic_users")
              .select("id")
              .eq("user_id", userId)
              .eq("clinic_id", clinicId)
              .eq("is_active", true)
              .single(),
          ];
        case 1:
          (_a = _b.sent()), (data = _a.data), (error = _a.error);
          return [2 /*return*/, !error && data];
      }
    });
  });
}
function sendOverrideNotifications(
  supabase,
  appointmentId,
  professionalId,
  patientId,
  managerEmail,
  overrideReason,
  conflicts,
) {
  return __awaiter(this, void 0, void 0, function () {
    var appointment, notifications, error_3;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 3, undefined, 4]);
          return [
            4 /*yield*/,
            supabase
              .from("appointments")
              .select(
                "\n        start_time,\n        end_time,\n        profiles!patient_id (\n          full_name,\n          email,\n          phone\n        ),\n        profiles!professional_id (\n          full_name,\n          email\n        )\n      ",
              )
              .eq("id", appointmentId)
              .single(),
          ];
        case 1:
          appointment = _a.sent().data;
          if (!appointment) return [2 /*return*/];
          notifications = [
            {
              recipient_id: professionalId,
              recipient_email: appointment.profiles.email,
              type: "conflict_override_professional",
              title: "Agendamento com Override de Conflito",
              message: "Um gestor ("
                .concat(managerEmail, ") autorizou um agendamento que possui conflitos. Motivo: ")
                .concat(overrideReason),
              data: {
                appointment_id: appointmentId,
                start_time: appointment.start_time,
                patient_name: appointment.profiles.full_name,
                conflicts: conflicts,
                manager_email: managerEmail,
              },
            },
            {
              recipient_id: patientId,
              recipient_email: appointment.profiles.email,
              type: "conflict_override_patient",
              title: "Agendamento Confirmado com Exceção",
              message:
                "Seu agendamento foi confirmado mesmo com restri\u00E7\u00F5es. Profissional: ".concat(
                  appointment.profiles.full_name,
                ),
              data: {
                appointment_id: appointmentId,
                start_time: appointment.start_time,
                professional_name: appointment.profiles.full_name,
              },
            },
          ];
          // Insert notifications
          return [4 /*yield*/, supabase.from("notifications").insert(notifications)];
        case 2:
          // Insert notifications
          _a.sent();
          return [3 /*break*/, 4];
        case 3:
          error_3 = _a.sent();
          console.error("Error sending override notifications:", error_3);
          return [3 /*break*/, 4];
        case 4:
          return [2 /*return*/];
      }
    });
  });
}

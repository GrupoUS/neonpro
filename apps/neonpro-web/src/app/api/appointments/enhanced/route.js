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
exports.POST = POST;
exports.GET = GET;
var server_1 = require("@/lib/supabase/server");
var server_2 = require("next/server");
var trigger_jobs_1 = require("@/lib/automation/trigger-jobs");
/**
 * 🚀 ENHANCED APPOINTMENTS API with Background Jobs
 *
 * Versão melhorada da API de appointments que automaticamente:
 * - Envia email de confirmação
 * - Agenda lembrete 24h antes
 * - Integra com sistema Trigger.dev
 *
 * Mantém 100% compatibilidade com API existente
 */
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      user,
      body,
      _a,
      profile,
      profileError,
      _b,
      patientResult,
      professionalResult,
      serviceResult,
      clinicResult,
      _c,
      appointment,
      appointmentError,
      automationResults,
      automationError_1,
      response,
      error_1;
    var _d, _e, _f, _g, _h, _j, _k, _l, _m;
    return __generator(this, function (_o) {
      switch (_o.label) {
        case 0:
          _o.trys.push([0, 12, , 13]);
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 1:
          supabase = _o.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          user = _o.sent().data.user;
          if (!user) {
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { success: false, error_message: "Unauthorized" },
                { status: 401 },
              ),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _o.sent();
          // Validate required fields
          if (
            !body.patient_id ||
            !body.professional_id ||
            !body.service_type_id ||
            !body.start_time ||
            !body.end_time
          ) {
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                {
                  success: false,
                  error_message: "Dados obrigatórios não fornecidos",
                },
                { status: 400 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("profiles").select("clinic_id").eq("id", user.id).single(),
          ];
        case 4:
          (_a = _o.sent()), (profile = _a.data), (profileError = _a.error);
          if (profileError || !profile) {
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { success: false, error_message: "Perfil do usuário não encontrado" },
                { status: 400 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            Promise.all([
              supabase
                .from("patients")
                .select("full_name, email")
                .eq("id", body.patient_id)
                .single(),
              supabase.from("professionals").select("name").eq("id", body.professional_id).single(),
              supabase.from("service_types").select("name").eq("id", body.service_type_id).single(),
              supabase.from("clinics").select("name").eq("id", profile.clinic_id).single(),
            ]),
          ];
        case 5:
          (_b = _o.sent()),
            (patientResult = _b[0]),
            (professionalResult = _b[1]),
            (serviceResult = _b[2]),
            (clinicResult = _b[3]);
          return [
            4 /*yield*/,
            supabase
              .from("appointments")
              .insert({
                patient_id: body.patient_id,
                professional_id: body.professional_id,
                service_type_id: body.service_type_id,
                appointment_date: body.start_time.split("T")[0], // Extract date
                appointment_time:
                  ((_d = body.start_time.split("T")[1]) === null || _d === void 0
                    ? void 0
                    : _d.split("Z")[0]) || body.start_time,
                end_time: body.end_time,
                status: "confirmed", // ✨ ENHANCED: Auto-confirm with email
                notes: body.notes,
                clinic_id: profile.clinic_id,
                created_by: user.id,
              })
              .select("*")
              .single(),
          ];
        case 6:
          (_c = _o.sent()), (appointment = _c.data), (appointmentError = _c.error);
          if (appointmentError) {
            console.error("Error creating appointment:", appointmentError);
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                {
                  success: false,
                  error_message: "Erro ao criar consulta",
                  details: appointmentError.message,
                },
                { status: 500 },
              ),
            ];
          }
          automationResults = null;
          _o.label = 7;
        case 7:
          _o.trys.push([7, 10, , 11]);
          if (
            !(
              ((_e = patientResult.data) === null || _e === void 0 ? void 0 : _e.email) &&
              ((_f = professionalResult.data) === null || _f === void 0 ? void 0 : _f.name) &&
              ((_g = serviceResult.data) === null || _g === void 0 ? void 0 : _g.name) &&
              ((_h = clinicResult.data) === null || _h === void 0 ? void 0 : _h.name)
            )
          )
            return [3 /*break*/, 9];
          console.log("🤖 Triggering appointment automation...");
          return [
            4 /*yield*/,
            trigger_jobs_1.NeonProAutomation.onNewAppointmentCreated({
              appointmentId: appointment.id,
              patientEmail: patientResult.data.email,
              patientName: patientResult.data.full_name,
              clinicName: clinicResult.data.name,
              clinicId: profile.clinic_id,
              appointmentDate: appointment.appointment_date,
              appointmentTime: appointment.appointment_time,
              professionalName: professionalResult.data.name,
              serviceName: serviceResult.data.name,
            }),
          ];
        case 8:
          automationResults = _o.sent();
          console.log("✅ Appointment automation triggered successfully", {
            appointmentId: appointment.id,
            confirmationJobId:
              (_j =
                automationResults === null || automationResults === void 0
                  ? void 0
                  : automationResults.confirmation) === null || _j === void 0
                ? void 0
                : _j.jobId,
            reminderJobId:
              (_k =
                automationResults === null || automationResults === void 0
                  ? void 0
                  : automationResults.reminder) === null || _k === void 0
                ? void 0
                : _k.jobId,
          });
          _o.label = 9;
        case 9:
          return [3 /*break*/, 11];
        case 10:
          automationError_1 = _o.sent();
          // Log error but don't fail the appointment creation
          console.error("⚠️ Automation failed, but appointment was created", {
            appointmentId: appointment.id,
            error:
              automationError_1 instanceof Error ? automationError_1.message : automationError_1,
          });
          return [3 /*break*/, 11];
        case 11:
          response = {
            success: true,
            appointment: {
              id: appointment.id,
              patient_id: appointment.patient_id,
              professional_id: appointment.professional_id,
              service_type_id: appointment.service_type_id,
              appointment_date: appointment.appointment_date,
              appointment_time: appointment.appointment_time,
              status: appointment.status,
              notes: appointment.notes,
              created_at: appointment.created_at,
            },
            // ✨ ENHANCED: Include automation status
            automation: automationResults
              ? {
                  confirmation_job_id:
                    (_l = automationResults.confirmation) === null || _l === void 0
                      ? void 0
                      : _l.jobId,
                  reminder_job_id:
                    (_m = automationResults.reminder) === null || _m === void 0 ? void 0 : _m.jobId,
                  status: "triggered",
                }
              : {
                  status: "skipped",
                  reason: "missing_data_or_email",
                },
          };
          return [2 /*return*/, server_2.NextResponse.json(response, { status: 201 })];
        case 12:
          error_1 = _o.sent();
          console.error("Error in enhanced appointments API:", error_1);
          return [
            2 /*return*/,
            server_2.NextResponse.json(
              {
                success: false,
                error_message: "Erro interno do servidor",
                details: error_1 instanceof Error ? error_1.message : "Unknown error",
              },
              { status: 500 },
            ),
          ];
        case 13:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * GET: List appointments with automation status
 * ✨ ENHANCED: Inclui status dos jobs de automação
 */
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      searchParams,
      user,
      _a,
      profile,
      profileError,
      date,
      status_1,
      limit,
      query,
      _b,
      appointments,
      appointmentsError,
      enhancedAppointments,
      error_2;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 5, , 6]);
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 1:
          supabase = _c.sent();
          searchParams = new URL(request.url).searchParams;
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          user = _c.sent().data.user;
          if (!user) {
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { success: false, error_message: "Unauthorized" },
                { status: 401 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("profiles").select("clinic_id").eq("id", user.id).single(),
          ];
        case 3:
          (_a = _c.sent()), (profile = _a.data), (profileError = _a.error);
          if (profileError || !profile) {
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { success: false, error_message: "Perfil do usuário não encontrado" },
                { status: 400 },
              ),
            ];
          }
          date = searchParams.get("date");
          status_1 = searchParams.get("status");
          limit = parseInt(searchParams.get("limit") || "50");
          query = supabase
            .from("appointments")
            .select(
              "\n        id,\n        patient_id,\n        professional_id,\n        service_type_id,\n        appointment_date,\n        appointment_time,\n        end_time,\n        status,\n        notes,\n        created_at,\n        confirmation_sent_at,\n        reminder_sent_at,\n        patients (\n          full_name,\n          email,\n          phone\n        ),\n        professionals (\n          name,\n          specialty\n        ),\n        service_types (\n          name,\n          duration_minutes,\n          price\n        )\n      ",
            )
            .eq("clinic_id", profile.clinic_id)
            .order("appointment_date", { ascending: true })
            .order("appointment_time", { ascending: true })
            .limit(limit);
          if (date) {
            query = query.eq("appointment_date", date);
          }
          if (status_1) {
            query = query.eq("status", status_1);
          }
          return [4 /*yield*/, query];
        case 4:
          (_b = _c.sent()), (appointments = _b.data), (appointmentsError = _b.error);
          if (appointmentsError) {
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { success: false, error_message: "Erro ao buscar consultas" },
                { status: 500 },
              ),
            ];
          }
          enhancedAppointments =
            appointments === null || appointments === void 0
              ? void 0
              : appointments.map(function (appointment) {
                  return __assign(__assign({}, appointment), {
                    automation_status: {
                      confirmation_sent: !!appointment.confirmation_sent_at,
                      reminder_sent: !!appointment.reminder_sent_at,
                      confirmation_sent_at: appointment.confirmation_sent_at,
                      reminder_sent_at: appointment.reminder_sent_at,
                    },
                  });
                });
          return [
            2 /*return*/,
            server_2.NextResponse.json({
              success: true,
              appointments: enhancedAppointments,
              total:
                (enhancedAppointments === null || enhancedAppointments === void 0
                  ? void 0
                  : enhancedAppointments.length) || 0,
              has_automation: true, // ✨ Flag indicating enhanced API
            }),
          ];
        case 5:
          error_2 = _c.sent();
          console.error("Error in enhanced appointments GET:", error_2);
          return [
            2 /*return*/,
            server_2.NextResponse.json(
              {
                success: false,
                error_message: "Erro interno do servidor",
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

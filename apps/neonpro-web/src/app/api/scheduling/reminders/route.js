"use strict";
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
exports.PUT = PUT;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var zod_1 = require("zod");
var scheduling_templates_1 = require("@/lib/communication/scheduling-templates");
var scheduling_workflow_1 = require("@/lib/communication/scheduling-workflow");
var communication_service_1 = require("@/lib/communication/communication-service");
// Schema validation for reminder requests
var ReminderConfigSchema = zod_1.z.object({
  appointmentId: zod_1.z.string().uuid(),
  reminderTypes: zod_1.z.array(zod_1.z.enum(["24h", "2h", "30m"])),
  channels: zod_1.z.array(zod_1.z.enum(["sms", "email", "whatsapp"])),
  customMessage: zod_1.z.string().optional(),
  useWorkflow: zod_1.z.boolean().default(true), // Enable workflow by default
  force: zod_1.z.boolean().default(false), // Force send even if already sent
  patientPreferences: zod_1.z
    .object({
      preferredChannel: zod_1.z.enum(["sms", "email", "whatsapp"]),
      timezone: zod_1.z.string().optional(),
      language: zod_1.z.enum(["pt", "en", "es"]).default("pt"),
    })
    .optional(),
});
var ImmediateReminderSchema = zod_1.z.object({
  appointmentId: zod_1.z.string().uuid(),
  channel: zod_1.z.enum(["sms", "email", "whatsapp"]).optional(),
  customMessage: zod_1.z.string().optional(),
  force: zod_1.z.boolean().default(false),
});
var BulkReminderSchema = zod_1.z.object({
  date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  clinicId: zod_1.z.string().uuid(),
  reminderType: zod_1.z.enum(["24h", "2h", "30m"]),
  channels: zod_1.z.array(zod_1.z.enum(["sms", "email", "whatsapp"])),
  useWorkflow: zod_1.z.boolean().default(true),
});
/**
 * POST /api/scheduling/reminders
 * Schedule automated reminders for appointments using intelligent workflow
 */
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      body,
      validatedData_1,
      validatedData,
      workflowConfig,
      workflow,
      workflows,
      reminderWorkflows,
      workflowError_1,
      error_1;
    var _b;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 11, , 12]);
          return [
            4 /*yield*/,
            (0, server_2.createClient)(),
            // Verify authentication
          ];
        case 1:
          supabase = _c.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _c.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [
            4 /*yield*/,
            request.json(),
            // Handle immediate reminders with different schema
          ];
        case 3:
          body = _c.sent();
          if (!body.immediate) return [3 /*break*/, 5];
          validatedData_1 = ImmediateReminderSchema.parse(body);
          return [4 /*yield*/, handleImmediateReminder(supabase, validatedData_1, user)];
        case 4:
          return [2 /*return*/, _c.sent()];
        case 5:
          validatedData = ReminderConfigSchema.parse(body);
          if (!validatedData.useWorkflow) return [3 /*break*/, 9];
          _c.label = 6;
        case 6:
          _c.trys.push([6, 8, , 9]);
          workflowConfig = {
            reminderSettings: {
              enabled24h: validatedData.reminderTypes.includes("24h"),
              enabled2h: validatedData.reminderTypes.includes("2h"),
              enabled30m: validatedData.reminderTypes.includes("30m"),
              channels: validatedData.channels,
              preferredChannel:
                ((_b = validatedData.patientPreferences) === null || _b === void 0
                  ? void 0
                  : _b.preferredChannel) || validatedData.channels[0],
            },
          };
          workflow = new scheduling_workflow_1.SchedulingCommunicationWorkflow();
          return [
            4 /*yield*/,
            workflow.initializeWorkflows(validatedData.appointmentId, workflowConfig),
          ];
        case 7:
          workflows = _c.sent();
          reminderWorkflows = workflows.filter(function (w) {
            return w.workflowType === "reminder";
          });
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              method: "workflow",
              workflows: reminderWorkflows.map(function (w) {
                return {
                  id: w.id,
                  timing: w.metadata.timing,
                  scheduledAt: w.scheduledAt,
                  status: w.status,
                };
              }),
              message: "Scheduled ".concat(reminderWorkflows.length, " reminder workflows"),
            }),
          ];
        case 8:
          workflowError_1 = _c.sent();
          console.error("Workflow error, falling back to legacy method:", workflowError_1);
          return [3 /*break*/, 9];
        case 9:
          return [4 /*yield*/, handleLegacyReminders(supabase, validatedData, user)];
        case 10:
          // Legacy reminder scheduling method
          return [2 /*return*/, _c.sent()];
        case 11:
          error_1 = _c.sent();
          console.error("Error in POST /api/scheduling/reminders:", error_1);
          if (error_1 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Invalid request data", details: error_1.errors },
                { status: 400 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 12:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Handle immediate reminder sending
 */
function handleImmediateReminder(supabase, data, user) {
  return __awaiter(this, void 0, void 0, function () {
    var communicationService,
      _a,
      appointment,
      appointmentError,
      recentReminder,
      channel,
      message,
      template,
      variables,
      result;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          communicationService = new communication_service_1.CommunicationService();
          return [
            4 /*yield*/,
            supabase
              .from("appointments")
              .select(
                "\n      *,\n      patients(*),\n      professionals(*),\n      services(*),\n      clinics(*)\n    ",
              )
              .eq("id", data.appointmentId)
              .single(),
          ];
        case 1:
          (_a = _b.sent()), (appointment = _a.data), (appointmentError = _a.error);
          if (appointmentError || !appointment) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Appointment not found" }, { status: 404 }),
            ];
          }
          if (!!data.force) return [3 /*break*/, 3];
          return [
            4 /*yield*/,
            supabase
              .from("appointment_reminders")
              .select("*")
              .eq("appointment_id", data.appointmentId)
              .eq("reminder_type", "immediate")
              .gte("sent_at", new Date(Date.now() - 30 * 60 * 1000).toISOString()) // Last 30 minutes
              .single(),
          ];
        case 2:
          recentReminder = _b.sent().data;
          if (recentReminder) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Immediate reminder already sent recently" },
                { status: 409 },
              ),
            ];
          }
          _b.label = 3;
        case 3:
          channel = data.channel || "whatsapp";
          message = data.customMessage;
          if (!!message) return [3 /*break*/, 5];
          template = scheduling_templates_1.schedulingTemplateEngine.selectBestTemplate(
            "reminder",
            appointment,
            appointment.patients,
            null,
          );
          if (!template) return [3 /*break*/, 5];
          variables = {
            patientName: appointment.patients.name,
            serviceName: appointment.services.name,
            professionalName: appointment.professionals.name,
            appointmentDate: new Date(appointment.date).toLocaleDateString("pt-BR"),
            appointmentTime: new Date(appointment.date).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            clinicName: appointment.clinics.name,
            clinicPhone: appointment.clinics.phone,
          };
          return [
            4 /*yield*/,
            scheduling_templates_1.schedulingTemplateEngine.renderTemplate(
              template,
              channel,
              variables,
            ),
          ];
        case 4:
          message = _b.sent();
          _b.label = 5;
        case 5:
          if (!message) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "No message content available" },
                { status: 400 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            communicationService.sendMessage({
              patientId: appointment.patient_id,
              clinicId: appointment.clinic_id,
              appointmentId: data.appointmentId,
              messageType: "reminder",
              channel: channel,
              customContent: message,
            }),
            // Log the reminder
          ];
        case 6:
          result = _b.sent();
          // Log the reminder
          return [
            4 /*yield*/,
            supabase.from("appointment_reminders").insert({
              appointment_id: data.appointmentId,
              patient_id: appointment.patient_id,
              clinic_id: appointment.clinic_id,
              reminder_type: "immediate",
              channel: channel,
              status: result.success ? "sent" : "failed",
              message_content: message,
              sent_at: new Date().toISOString(),
              delivery_status: result.success ? "delivered" : "failed",
              cost: result.cost || 0,
              created_by: user.id,
            }),
          ];
        case 7:
          // Log the reminder
          _b.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: result.success,
              method: "immediate",
              messageId: result.messageId,
              channel: channel,
              cost: result.cost,
              message: result.success ? "Reminder sent immediately" : "Failed to send reminder",
            }),
          ];
      }
    });
  });
}
/**
 * Handle legacy reminder scheduling
 */
function handleLegacyReminders(supabase, data, user) {
  return __awaiter(this, void 0, void 0, function () {
    var _a,
      appointment,
      appointmentError,
      appointmentDate,
      reminders,
      _i,
      _b,
      reminderType,
      scheduledTime,
      _c,
      insertedReminders,
      insertError;
    return __generator(this, function (_d) {
      switch (_d.label) {
        case 0:
          return [
            4 /*yield*/,
            supabase
              .from("appointments")
              .select(
                "\n      *,\n      patients(*),\n      professionals(*),\n      services(*),\n      clinics(*)\n    ",
              )
              .eq("id", data.appointmentId)
              .single(),
          ];
        case 1:
          (_a = _d.sent()), (appointment = _a.data), (appointmentError = _a.error);
          if (appointmentError || !appointment) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Appointment not found" }, { status: 404 }),
            ];
          }
          appointmentDate = new Date(appointment.date);
          reminders = [];
          for (_i = 0, _b = data.reminderTypes; _i < _b.length; _i++) {
            reminderType = _b[_i];
            scheduledTime = void 0;
            switch (reminderType) {
              case "24h":
                scheduledTime = new Date(appointmentDate.getTime() - 24 * 60 * 60 * 1000);
                break;
              case "2h":
                scheduledTime = new Date(appointmentDate.getTime() - 2 * 60 * 60 * 1000);
                break;
              case "30m":
                scheduledTime = new Date(appointmentDate.getTime() - 30 * 60 * 1000);
                break;
            }
            // Skip if scheduled time is in the past
            if (scheduledTime <= new Date()) {
              continue;
            }
            reminders.push({
              appointment_id: data.appointmentId,
              patient_id: appointment.patient_id,
              clinic_id: appointment.clinic_id,
              reminder_type: reminderType,
              scheduled_time: scheduledTime.toISOString(),
              channels: data.channels,
              status: "scheduled",
              custom_message: data.customMessage,
              patient_preferences: data.patientPreferences,
              created_by: user.id,
              created_at: new Date().toISOString(),
            });
          }
          if (reminders.length === 0) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({
                success: false,
                message: "No valid reminder times (all in the past)",
              }),
            ];
          }
          return [4 /*yield*/, supabase.from("appointment_reminders").insert(reminders).select()];
        case 2:
          (_c = _d.sent()), (insertedReminders = _c.data), (insertError = _c.error);
          if (insertError) {
            console.error("Error inserting reminders:", insertError);
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Failed to schedule reminders" },
                { status: 500 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              method: "legacy",
              reminders: insertedReminders,
              appointmentId: data.appointmentId,
              message: "Scheduled ".concat(insertedReminders.length, " reminders"),
            }),
          ];
      }
    });
  });
}
/**
 * GET /api/scheduling/reminders
 * Get reminders for appointments with filtering
 */
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      searchParams,
      appointmentId,
      clinicId,
      status_1,
      date,
      workflowId,
      workflowInstance,
      workflow,
      error_2,
      query,
      startOfDay,
      endOfDay,
      _b,
      reminders,
      queryError,
      workflows,
      workflowData,
      error_3,
      error_4;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 12, , 13]);
          return [
            4 /*yield*/,
            (0, server_2.createClient)(),
            // Verify authentication
          ];
        case 1:
          supabase = _c.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _c.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          searchParams = new URL(request.url).searchParams;
          appointmentId = searchParams.get("appointmentId");
          clinicId = searchParams.get("clinicId");
          status_1 = searchParams.get("status");
          date = searchParams.get("date");
          workflowId = searchParams.get("workflowId");
          if (!workflowId) return [3 /*break*/, 6];
          _c.label = 3;
        case 3:
          _c.trys.push([3, 5, , 6]);
          workflowInstance = new scheduling_workflow_1.SchedulingCommunicationWorkflow();
          return [4 /*yield*/, workflowInstance.getWorkflow(workflowId)];
        case 4:
          workflow = _c.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              workflow: workflow,
              message: "Workflow retrieved",
            }),
          ];
        case 5:
          error_2 = _c.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Workflow not found" }, { status: 404 }),
          ];
        case 6:
          query = supabase
            .from("appointment_reminders")
            .select(
              "\n        *,\n        appointments(*),\n        patients(name, phone, email),\n        clinics(name)\n      ",
            );
          if (appointmentId) {
            query = query.eq("appointment_id", appointmentId);
          }
          if (clinicId) {
            query = query.eq("clinic_id", clinicId);
          }
          if (status_1) {
            query = query.eq("status", status_1);
          }
          if (date) {
            startOfDay = new Date(date);
            endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            query = query
              .gte("scheduled_time", startOfDay.toISOString())
              .lte("scheduled_time", endOfDay.toISOString());
          }
          return [4 /*yield*/, query.order("scheduled_time", { ascending: true })];
        case 7:
          (_b = _c.sent()), (reminders = _b.data), (queryError = _b.error);
          if (queryError) {
            console.error("Error fetching reminders:", queryError);
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Failed to fetch reminders" }, { status: 500 }),
            ];
          }
          workflows = [];
          if (!appointmentId) return [3 /*break*/, 11];
          _c.label = 8;
        case 8:
          _c.trys.push([8, 10, , 11]);
          return [
            4 /*yield*/,
            supabase
              .from("communication_workflows")
              .select("*")
              .eq("appointment_id", appointmentId)
              .eq("workflow_type", "reminder"),
          ];
        case 9:
          workflowData = _c.sent().data;
          workflows = workflowData || [];
          return [3 /*break*/, 11];
        case 10:
          error_3 = _c.sent();
          console.error("Error fetching workflows:", error_3);
          return [3 /*break*/, 11];
        case 11:
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              reminders: reminders || [],
              workflows: workflows,
              count: {
                reminders:
                  (reminders === null || reminders === void 0 ? void 0 : reminders.length) || 0,
                workflows: workflows.length,
              },
            }),
          ];
        case 12:
          error_4 = _c.sent();
          console.error("Error in GET /api/scheduling/reminders:", error_4);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 13:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * PUT /api/scheduling/reminders/bulk
 * Schedule bulk reminders for all appointments on a specific date
 */
function PUT(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      body,
      validatedData,
      startOfDay,
      endOfDay,
      _b,
      appointments,
      appointmentsError,
      results,
      successCount,
      errorCount,
      _i,
      appointments_1,
      appointment,
      workflowConfig,
      workflowInstance,
      workflows,
      reminderData,
      error_5,
      error_6;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 14, , 15]);
          return [
            4 /*yield*/,
            (0, server_2.createClient)(),
            // Verify authentication
          ];
        case 1:
          supabase = _c.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _c.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _c.sent();
          validatedData = BulkReminderSchema.parse(body);
          startOfDay = new Date(validatedData.date);
          endOfDay = new Date(validatedData.date);
          endOfDay.setHours(23, 59, 59, 999);
          return [
            4 /*yield*/,
            supabase
              .from("appointments")
              .select("id")
              .eq("clinic_id", validatedData.clinicId)
              .gte("date", startOfDay.toISOString())
              .lte("date", endOfDay.toISOString())
              .eq("status", "scheduled"),
          ];
        case 4:
          (_b = _c.sent()), (appointments = _b.data), (appointmentsError = _b.error);
          if (appointmentsError) {
            console.error("Error fetching appointments:", appointmentsError);
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Failed to fetch appointments" },
                { status: 500 },
              ),
            ];
          }
          if (!appointments || appointments.length === 0) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({
                success: true,
                message: "No appointments found for the specified date",
                processed: 0,
              }),
            ];
          }
          results = [];
          successCount = 0;
          errorCount = 0;
          (_i = 0), (appointments_1 = appointments);
          _c.label = 5;
        case 5:
          if (!(_i < appointments_1.length)) return [3 /*break*/, 13];
          appointment = appointments_1[_i];
          _c.label = 6;
        case 6:
          _c.trys.push([6, 11, , 12]);
          if (!validatedData.useWorkflow) return [3 /*break*/, 8];
          workflowConfig = {
            reminderSettings: {
              enabled24h: validatedData.reminderType === "24h",
              enabled2h: validatedData.reminderType === "2h",
              enabled30m: validatedData.reminderType === "30m",
              channels: validatedData.channels,
              preferredChannel: validatedData.channels[0],
            },
          };
          workflowInstance = new scheduling_workflow_1.SchedulingCommunicationWorkflow();
          return [
            4 /*yield*/,
            workflowInstance.initializeWorkflows(appointment.id, workflowConfig),
          ];
        case 7:
          workflows = _c.sent();
          results.push({
            appointmentId: appointment.id,
            success: true,
            method: "workflow",
            workflowsCreated: workflows.length,
          });
          return [3 /*break*/, 10];
        case 8:
          reminderData = {
            appointmentId: appointment.id,
            reminderTypes: [validatedData.reminderType],
            channels: validatedData.channels,
            useWorkflow: false,
          };
          return [4 /*yield*/, handleLegacyReminders(supabase, reminderData, user)];
        case 9:
          _c.sent();
          results.push({
            appointmentId: appointment.id,
            success: true,
            method: "legacy",
          });
          _c.label = 10;
        case 10:
          successCount++;
          return [3 /*break*/, 12];
        case 11:
          error_5 = _c.sent();
          console.error("Error processing appointment ".concat(appointment.id, ":"), error_5);
          results.push({
            appointmentId: appointment.id,
            success: false,
            error: error_5.message,
          });
          errorCount++;
          return [3 /*break*/, 12];
        case 12:
          _i++;
          return [3 /*break*/, 5];
        case 13:
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              processed: appointments.length,
              successful: successCount,
              failed: errorCount,
              results: results,
              message: "Processed "
                .concat(appointments.length, " appointments: ")
                .concat(successCount, " successful, ")
                .concat(errorCount, " failed"),
            }),
          ];
        case 14:
          error_6 = _c.sent();
          console.error("Error in PUT /api/scheduling/reminders:", error_6);
          if (error_6 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Invalid request data", details: error_6.errors },
                { status: 400 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 15:
          return [2 /*return*/];
      }
    });
  });
}

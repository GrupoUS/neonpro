var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      ((t) => {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.hasOwn(s, p)) t[p] = s[p];
        }
        return t;
      });
    return __assign.apply(this, arguments);
  };
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
exports.POST = POST;
exports.PUT = PUT;
exports.GET = GET;
exports.DELETE = DELETE;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var zod_1 = require("zod");
var scheduling_workflow_1 = require("@/lib/communication/scheduling-workflow");
var communication_service_1 = require("@/lib/communication/communication-service");
var no_show_predictor_1 = require("@/lib/communication/no-show-predictor");
// Schema validation for confirmation requests
var ConfirmationRequestSchema = zod_1.z.object({
  appointmentId: zod_1.z.string().uuid(),
  sendTime: zod_1.z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional()
    .default("09:00"), // HH:MM format
  timeoutHours: zod_1.z.number().min(1).max(72).default(24),
  channels: zod_1.z.array(zod_1.z.enum(["sms", "email", "whatsapp"])).default(["whatsapp"]),
  enableEscalation: zod_1.z.boolean().default(true),
  escalationChannels: zod_1.z.array(zod_1.z.enum(["sms", "email", "whatsapp"])).default(["sms"]),
  customMessage: zod_1.z.string().optional(),
  useWorkflow: zod_1.z.boolean().default(true),
  useNoShowPrediction: zod_1.z.boolean().default(true),
});
var ConfirmationResponseSchema = zod_1.z.object({
  confirmationToken: zod_1.z.string(),
  response: zod_1.z.enum(["confirmed", "cancelled", "reschedule"]),
  rescheduleDate: zod_1.z.string().optional(),
  rescheduleTime: zod_1.z.string().optional(),
  notes: zod_1.z.string().optional(),
});
var BulkConfirmationSchema = zod_1.z.object({
  date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  clinicId: zod_1.z.string().uuid(),
  sendTime: zod_1.z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .default("09:00"),
  timeoutHours: zod_1.z.number().min(1).max(72).default(24),
  channels: zod_1.z.array(zod_1.z.enum(["sms", "email", "whatsapp"])).default(["whatsapp"]),
  useWorkflow: zod_1.z.boolean().default(true),
});
/**
 * POST /api/scheduling/confirmations
 * Schedule appointment confirmation requests using intelligent workflow
 */
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      body,
      validatedData,
      _b,
      appointment,
      appointmentError,
      existingConfirmation,
      workflowConfig,
      workflow,
      workflows,
      confirmationWorkflow,
      workflowError_1,
      error_1;
    return __generator(this, (_c) => {
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
          return [4 /*yield*/, request.json()];
        case 3:
          body = _c.sent();
          validatedData = ConfirmationRequestSchema.parse(body);
          return [
            4 /*yield*/,
            supabase
              .from("appointments")
              .select(
                "\n        *,\n        patients(*),\n        professionals(*),\n        services(*),\n        clinics(*)\n      ",
              )
              .eq("id", validatedData.appointmentId)
              .single(),
          ];
        case 4:
          (_b = _c.sent()), (appointment = _b.data), (appointmentError = _b.error);
          if (appointmentError || !appointment) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Appointment not found" }, { status: 404 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("appointment_confirmations")
              .select("*")
              .eq("appointment_id", validatedData.appointmentId)
              .neq("status", "expired")
              .single(),
          ];
        case 5:
          existingConfirmation = _c.sent().data;
          if (existingConfirmation) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error: "Confirmation request already exists",
                  existing: existingConfirmation,
                },
                { status: 409 },
              ),
            ];
          }
          if (!validatedData.useWorkflow) return [3 /*break*/, 9];
          _c.label = 6;
        case 6:
          _c.trys.push([6, 8, , 9]);
          workflowConfig = {
            confirmationSettings: {
              enableConfirmationRequests: true,
              sendTime: validatedData.sendTime,
              timeoutHours: validatedData.timeoutHours,
              escalationChannels: validatedData.escalationChannels,
            },
            noShowPrevention: {
              enabled: validatedData.useNoShowPrediction,
              probabilityThreshold: 0.6, // Lower threshold for confirmations
              interventionTiming: "2h",
              specialHandling: true,
            },
          };
          workflow = new scheduling_workflow_1.SchedulingCommunicationWorkflow();
          return [
            4 /*yield*/,
            workflow.initializeWorkflows(validatedData.appointmentId, workflowConfig),
          ];
        case 7:
          workflows = _c.sent();
          confirmationWorkflow = workflows.find((w) => w.workflowType === "confirmation");
          if (confirmationWorkflow) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({
                success: true,
                method: "workflow",
                workflowId: confirmationWorkflow.id,
                confirmationToken: confirmationWorkflow.metadata.confirmationToken,
                scheduledAt: confirmationWorkflow.scheduledAt,
                steps: confirmationWorkflow.steps.length,
                message: "Confirmation workflow scheduled",
              }),
            ];
          }
          return [3 /*break*/, 9];
        case 8:
          workflowError_1 = _c.sent();
          console.error("Workflow error, falling back to legacy method:", workflowError_1);
          return [3 /*break*/, 9];
        case 9:
          return [
            4 /*yield*/,
            handleLegacyConfirmation(supabase, validatedData, appointment, user),
          ];
        case 10:
          // Legacy confirmation method
          return [2 /*return*/, _c.sent()];
        case 11:
          error_1 = _c.sent();
          console.error("Error in POST /api/scheduling/confirmations:", error_1);
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
 * Handle legacy confirmation creation
 */
function handleLegacyConfirmation(supabase, data, appointment, user) {
  return __awaiter(this, void 0, void 0, function () {
    var confirmationToken,
      appointmentDate,
      _a,
      hours,
      minutes,
      sendAt,
      expiresAt,
      noShowPrediction,
      predictor,
      error_2,
      _b,
      confirmationRecord,
      insertError;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          confirmationToken = generateConfirmationToken();
          appointmentDate = new Date(appointment.date);
          (_a = data.sendTime.split(":").map(Number)), (hours = _a[0]), (minutes = _a[1]);
          sendAt = new Date(appointmentDate);
          sendAt.setDate(sendAt.getDate() - 1); // Day before
          sendAt.setHours(hours, minutes, 0, 0);
          expiresAt = new Date(sendAt.getTime() + data.timeoutHours * 60 * 60 * 1000);
          noShowPrediction = null;
          if (!data.useNoShowPrediction) return [3 /*break*/, 4];
          _c.label = 1;
        case 1:
          _c.trys.push([1, 3, , 4]);
          predictor = new no_show_predictor_1.NoShowPredictor();
          return [4 /*yield*/, predictor.predict(data.appointmentId)];
        case 2:
          noShowPrediction = _c.sent();
          return [3 /*break*/, 4];
        case 3:
          error_2 = _c.sent();
          console.error("Error getting no-show prediction:", error_2);
          return [3 /*break*/, 4];
        case 4:
          return [
            4 /*yield*/,
            supabase
              .from("appointment_confirmations")
              .insert({
                appointment_id: data.appointmentId,
                patient_id: appointment.patient_id,
                clinic_id: appointment.clinic_id,
                confirmation_token: confirmationToken,
                send_at: sendAt.toISOString(),
                expires_at: expiresAt.toISOString(),
                channels: data.channels,
                escalation_channels: data.escalationChannels,
                custom_message: data.customMessage,
                no_show_prediction: noShowPrediction,
                timeout_hours: data.timeoutHours,
                enable_escalation: data.enableEscalation,
                status: "pending",
                created_by: user.id,
                created_at: new Date().toISOString(),
              })
              .select()
              .single(),
          ];
        case 5:
          (_b = _c.sent()), (confirmationRecord = _b.data), (insertError = _b.error);
          if (insertError) {
            console.error("Error creating confirmation:", insertError);
            throw new Error("Failed to create confirmation request");
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              method: "legacy",
              confirmation: confirmationRecord,
              confirmationToken: confirmationToken,
              sendAt: sendAt,
              expiresAt: expiresAt,
              message: "Confirmation request scheduled",
            }),
          ];
      }
    });
  });
}
/**
 * PUT /api/scheduling/confirmations
 * Handle patient responses to confirmation requests
 */
function PUT(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      body,
      validatedData,
      _a,
      confirmation,
      confirmationError,
      updateData,
      updateError,
      appointmentStatus,
      communicationService,
      notificationMessage,
      error_3;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 7, , 8]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _b.sent();
          return [4 /*yield*/, request.json()];
        case 2:
          body = _b.sent();
          validatedData = ConfirmationResponseSchema.parse(body);
          return [
            4 /*yield*/,
            supabase
              .from("appointment_confirmations")
              .select(
                "\n        *,\n        appointments(*),\n        patients(*),\n        clinics(*)\n      ",
              )
              .eq("confirmation_token", validatedData.confirmationToken)
              .single(),
          ];
        case 3:
          (_a = _b.sent()), (confirmation = _a.data), (confirmationError = _a.error);
          if (confirmationError || !confirmation) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Invalid confirmation token" }, { status: 404 }),
            ];
          }
          // Check if confirmation has expired
          if (new Date() > new Date(confirmation.expires_at)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Confirmation request has expired" },
                { status: 410 },
              ),
            ];
          }
          // Check if already responded
          if (confirmation.status !== "pending") {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error: "Already responded to this confirmation",
                  currentResponse: confirmation.status,
                },
                { status: 409 },
              ),
            ];
          }
          updateData = {
            status: validatedData.response,
            response_date: new Date().toISOString(),
            response_notes: validatedData.notes,
          };
          // Handle reschedule requests
          if (
            validatedData.response === "reschedule" &&
            validatedData.rescheduleDate &&
            validatedData.rescheduleTime
          ) {
            updateData.reschedule_requested_date = validatedData.rescheduleDate;
            updateData.reschedule_requested_time = validatedData.rescheduleTime;
          }
          return [
            4 /*yield*/,
            supabase.from("appointment_confirmations").update(updateData).eq("id", confirmation.id),
          ];
        case 4:
          updateError = _b.sent().error;
          if (updateError) {
            console.error("Error updating confirmation:", updateError);
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Failed to update confirmation" },
                { status: 500 },
              ),
            ];
          }
          appointmentStatus = confirmation.appointments.status;
          if (validatedData.response === "confirmed") {
            appointmentStatus = "confirmed";
          } else if (validatedData.response === "cancelled") {
            appointmentStatus = "cancelled";
          } else if (validatedData.response === "reschedule") {
            appointmentStatus = "reschedule_requested";
          }
          if (!(appointmentStatus !== confirmation.appointments.status)) return [3 /*break*/, 6];
          return [
            4 /*yield*/,
            supabase
              .from("appointments")
              .update({
                status: appointmentStatus,
                confirmation_status: validatedData.response,
                updated_at: new Date().toISOString(),
              })
              .eq("id", confirmation.appointment_id),
          ];
        case 5:
          _b.sent();
          _b.label = 6;
        case 6:
          // Send notification to clinic staff
          try {
            communicationService = new communication_service_1.CommunicationService();
            notificationMessage = "";
            switch (validatedData.response) {
              case "confirmed":
                notificationMessage = "\u2705 Consulta confirmada: "
                  .concat(confirmation.patients.name, " - ")
                  .concat(new Date(confirmation.appointments.date).toLocaleDateString("pt-BR"));
                break;
              case "cancelled":
                notificationMessage = "\u274C Consulta cancelada: "
                  .concat(confirmation.patients.name, " - ")
                  .concat(new Date(confirmation.appointments.date).toLocaleDateString("pt-BR"));
                break;
              case "reschedule":
                notificationMessage = "\uD83D\uDD04 Reagendamento solicitado: "
                  .concat(confirmation.patients.name, " - ")
                  .concat(new Date(confirmation.appointments.date).toLocaleDateString("pt-BR"));
                if (validatedData.rescheduleDate) {
                  notificationMessage += " \u2192 Nova data: ".concat(validatedData.rescheduleDate);
                }
                break;
            }
            // Send to clinic notification channels (implementation depends on clinic preferences)
            // This could be integrated with clinic staff notification system
          } catch (notificationError) {
            console.error("Error sending clinic notification:", notificationError);
            // Don't fail the response for notification errors
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              response: validatedData.response,
              appointmentId: confirmation.appointment_id,
              message: "Appointment ".concat(validatedData.response),
              nextSteps: getNextSteps(validatedData.response),
            }),
          ];
        case 7:
          error_3 = _b.sent();
          console.error("Error in PUT /api/scheduling/confirmations:", error_3);
          if (error_3 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Invalid request data", details: error_3.errors },
                { status: 400 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 8:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * GET /api/scheduling/confirmations
 * Get confirmation requests with filtering
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
      confirmationToken,
      _b,
      confirmation,
      tokenError,
      isExpired,
      query,
      startOfDay,
      endOfDay,
      _c,
      confirmations,
      queryError,
      confirmationsWithStatus,
      error_4;
    return __generator(this, (_d) => {
      switch (_d.label) {
        case 0:
          _d.trys.push([0, 6, , 7]);
          return [
            4 /*yield*/,
            (0, server_2.createClient)(),
            // Verify authentication
          ];
        case 1:
          supabase = _d.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _d.sent()), (user = _a.data.user), (authError = _a.error);
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
          confirmationToken = searchParams.get("token");
          if (!confirmationToken) return [3 /*break*/, 4];
          return [
            4 /*yield*/,
            supabase
              .from("appointment_confirmations")
              .select(
                "\n          *,\n          appointments(*),\n          patients(name),\n          professionals(name),\n          services(name),\n          clinics(name, address, phone)\n        ",
              )
              .eq("confirmation_token", confirmationToken)
              .single(),
          ];
        case 3:
          (_b = _d.sent()), (confirmation = _b.data), (tokenError = _b.error);
          if (tokenError || !confirmation) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Invalid confirmation token" }, { status: 404 }),
            ];
          }
          isExpired = new Date() > new Date(confirmation.expires_at);
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              confirmation: __assign(__assign({}, confirmation), { expired: isExpired }),
            }),
          ];
        case 4:
          query = supabase
            .from("appointment_confirmations")
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
              .gte("send_at", startOfDay.toISOString())
              .lte("send_at", endOfDay.toISOString());
          }
          return [4 /*yield*/, query.order("send_at", { ascending: true })];
        case 5:
          (_c = _d.sent()), (confirmations = _c.data), (queryError = _c.error);
          if (queryError) {
            console.error("Error fetching confirmations:", queryError);
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Failed to fetch confirmations" },
                { status: 500 },
              ),
            ];
          }
          confirmationsWithStatus =
            (confirmations === null || confirmations === void 0
              ? void 0
              : confirmations.map((conf) =>
                  __assign(__assign({}, conf), {
                    expired: new Date() > new Date(conf.expires_at),
                    timeRemaining: Math.max(0, new Date(conf.expires_at).getTime() - Date.now()),
                  }),
                )) || [];
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              confirmations: confirmationsWithStatus,
              count: confirmationsWithStatus.length,
              summary: {
                pending: confirmationsWithStatus.filter((c) => c.status === "pending" && !c.expired)
                  .length,
                confirmed: confirmationsWithStatus.filter((c) => c.status === "confirmed").length,
                cancelled: confirmationsWithStatus.filter((c) => c.status === "cancelled").length,
                reschedule: confirmationsWithStatus.filter((c) => c.status === "reschedule").length,
                expired: confirmationsWithStatus.filter((c) => c.expired).length,
              },
            }),
          ];
        case 6:
          error_4 = _d.sent();
          console.error("Error in GET /api/scheduling/confirmations:", error_4);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 7:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * DELETE /api/scheduling/confirmations
 * Cancel/expire confirmation requests
 */
function DELETE(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      searchParams,
      confirmationId,
      appointmentId,
      query,
      _b,
      updated,
      updateError,
      error_5;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 4, , 5]);
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
          confirmationId = searchParams.get("id");
          appointmentId = searchParams.get("appointmentId");
          if (!confirmationId && !appointmentId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Either confirmationId or appointmentId required" },
                { status: 400 },
              ),
            ];
          }
          query = supabase.from("appointment_confirmations").update({
            status: "expired",
            expired_by: user.id,
            expired_at: new Date().toISOString(),
          });
          if (confirmationId) {
            query = query.eq("id", confirmationId);
          } else {
            query = query.eq("appointment_id", appointmentId);
          }
          return [4 /*yield*/, query.select()];
        case 3:
          (_b = _c.sent()), (updated = _b.data), (updateError = _b.error);
          if (updateError) {
            console.error("Error expiring confirmations:", updateError);
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Failed to expire confirmations" },
                { status: 500 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              expired: (updated === null || updated === void 0 ? void 0 : updated.length) || 0,
              message: "Expired ".concat(
                (updated === null || updated === void 0 ? void 0 : updated.length) || 0,
                " confirmation(s)",
              ),
            }),
          ];
        case 4:
          error_5 = _c.sent();
          console.error("Error in DELETE /api/scheduling/confirmations:", error_5);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Helper functions
 */
function generateConfirmationToken() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
function getNextSteps(response) {
  switch (response) {
    case "confirmed":
      return [
        "Sua consulta está confirmada",
        "Você receberá um lembrete antes do horário",
        "Em caso de imprevistos, entre em contato com a clínica",
      ];
    case "cancelled":
      return [
        "Sua consulta foi cancelada",
        "Você pode reagendar quando desejar",
        "Entre em contato com a clínica para mais informações",
      ];
    case "reschedule":
      return [
        "Solicitação de reagendamento enviada",
        "A clínica entrará em contato para confirmar nova data",
        "Aguarde o retorno da equipe",
      ];
    default:
      return [];
  }
}

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
exports.GET = GET;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var email_service_1 = require("@/lib/email-service");
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      profile,
      _b,
      to,
      template,
      variables,
      type,
      result,
      _c,
      error_1;
    return __generator(this, (_d) => {
      switch (_d.label) {
        case 0:
          _d.trys.push([0, 15, , 16]);
          return [
            4 /*yield*/,
            (0, server_2.createClient)(),
            // Check authentication
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
          return [4 /*yield*/, supabase.from("profiles").select("role").eq("id", user.id).single()];
        case 3:
          profile = _d.sent().data;
          if (
            (profile === null || profile === void 0 ? void 0 : profile.role) !== "admin" &&
            (profile === null || profile === void 0 ? void 0 : profile.role) !== "manager"
          ) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Insufficient permissions" }, { status: 403 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 4:
          (_b = _d.sent()),
            (to = _b.to),
            (template = _b.template),
            (variables = _b.variables),
            (type = _b.type);
          if (!to || !template) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Missing required fields: to, template" },
                { status: 400 },
              ),
            ];
          }
          result = void 0;
          _c = type;
          switch (_c) {
            case "appointment_confirmation":
              return [3 /*break*/, 5];
            case "appointment_reminder":
              return [3 /*break*/, 7];
            case "appointment_cancellation":
              return [3 /*break*/, 9];
          }
          return [3 /*break*/, 11];
        case 5:
          if (
            !variables.patientName ||
            !variables.appointmentDate ||
            !variables.appointmentTime ||
            !variables.serviceName ||
            !variables.professionalName
          ) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Missing required variables for appointment confirmation" },
                { status: 400 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            email_service_1.default.sendAppointmentConfirmation({
              patientEmail: to,
              patientName: variables.patientName,
              appointmentDate: variables.appointmentDate,
              appointmentTime: variables.appointmentTime,
              serviceName: variables.serviceName,
              professionalName: variables.professionalName,
              clinicName: variables.clinicName || "NeonPro",
            }),
          ];
        case 6:
          result = _d.sent();
          return [3 /*break*/, 13];
        case 7:
          if (
            !variables.patientName ||
            !variables.appointmentDate ||
            !variables.appointmentTime ||
            !variables.serviceName ||
            !variables.professionalName
          ) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Missing required variables for appointment reminder" },
                { status: 400 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            email_service_1.default.sendAppointmentReminder({
              patientEmail: to,
              patientName: variables.patientName,
              appointmentDate: variables.appointmentDate,
              appointmentTime: variables.appointmentTime,
              serviceName: variables.serviceName,
              professionalName: variables.professionalName,
              clinicName: variables.clinicName || "NeonPro",
            }),
          ];
        case 8:
          result = _d.sent();
          return [3 /*break*/, 13];
        case 9:
          if (!variables.patientName || !variables.appointmentDate || !variables.appointmentTime) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Missing required variables for appointment cancellation" },
                { status: 400 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            email_service_1.default.sendAppointmentCancellation({
              patientEmail: to,
              patientName: variables.patientName,
              appointmentDate: variables.appointmentDate,
              appointmentTime: variables.appointmentTime,
              cancellationReason: variables.cancellationReason,
              clinicName: variables.clinicName || "NeonPro",
            }),
          ];
        case 10:
          result = _d.sent();
          return [3 /*break*/, 13];
        case 11:
          return [
            4 /*yield*/,
            email_service_1.default.sendEmail({
              to: to,
              template: template,
              variables: variables || {},
            }),
          ];
        case 12:
          // Generic email sending
          result = _d.sent();
          _d.label = 13;
        case 13:
          if (!result.success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error: result.error || "Failed to send email",
                },
                { status: 500 },
              ),
            ];
          }
          // Log the email sending activity
          return [
            4 /*yield*/,
            supabase.from("notifications").insert({
              user_id: user.id,
              type: "email",
              title: "Email sent: ".concat(template),
              message: "Email sent to ".concat(to, " using template ").concat(template),
              data: {
                template: template,
                to: to,
                messageId: result.messageId,
                sentBy: user.id,
              },
              is_read: true,
            }),
          ];
        case 14:
          // Log the email sending activity
          _d.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              messageId: result.messageId,
              message: "Email sent successfully",
            }),
          ];
        case 15:
          error_1 = _d.sent();
          console.error("Error sending email:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 16:
          return [2 /*return*/];
      }
    });
  });
}
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, _a, user, authError, result, error_2;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 4, , 5]);
          return [
            4 /*yield*/,
            (0, server_2.createClient)(),
            // Check authentication
          ];
        case 1:
          supabase = _b.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _b.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, email_service_1.default.testConnection()];
        case 3:
          result = _b.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              connected: result.success,
              error: result.error,
              message: result.success
                ? "Email service is working correctly"
                : "Email service connection failed",
            }),
          ];
        case 4:
          error_2 = _b.sent();
          console.error("Error testing email service:", error_2);
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

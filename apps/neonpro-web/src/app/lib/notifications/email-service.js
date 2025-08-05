/**
 * NeonPro - Email Service for React Email Integration
 * HIPAA-compliant email notifications using React Email templates
 */
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
exports.EmailService = void 0;
var resend_1 = require("resend");
var render_1 = require("@react-email/render");
var config_1 = require("./config");
var zod_1 = require("zod");
// Import email templates
var appointment_reminder_1 = require("./templates/appointment-reminder");
var appointment_confirmation_1 = require("./templates/appointment-confirmation");
var appointment_cancellation_1 = require("./templates/appointment-cancellation");
var reschedule_request_1 = require("./templates/reschedule-request");
var treatment_reminder_1 = require("./templates/treatment-reminder");
var follow_up_reminder_1 = require("./templates/follow-up-reminder");
var emergency_alert_1 = require("./templates/emergency-alert");
var billing_reminder_1 = require("./templates/billing-reminder");
var resend = new resend_1.Resend(process.env.RESEND_API_KEY);
var EmailService = /** @class */ (() => {
  function EmailService() {
    this.config = config_1.NOTIFICATION_CONFIG.email;
  }
  /**
   * Send email using React Email templates
   */
  EmailService.prototype.send = function (payload) {
    return __awaiter(this, void 0, void 0, function () {
      var TemplateComponent, emailHtml, emailData, result, error_1;
      var _a, _b;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 2, , 3]);
            // Validate required environment variables
            if (!process.env.RESEND_API_KEY) {
              throw new Error("RESEND_API_KEY environment variable is required");
            }
            TemplateComponent = this.getTemplateComponent(payload.type);
            if (!TemplateComponent) {
              throw new Error("No template found for notification type: ".concat(payload.type));
            }
            emailHtml = (0, render_1.render)(
              TemplateComponent(
                __assign(__assign({}, payload.templateData), {
                  recipientEmail: payload.recipientEmail,
                  timezone: payload.timezone || "UTC",
                }),
              ),
            );
            emailData = {
              from: this.config.from,
              to: payload.recipientEmail,
              subject: payload.subject,
              html: emailHtml,
              headers: {
                "X-Priority": this.getPriorityHeader(payload.priority),
                "X-Notification-Type": payload.type,
                "X-Recipient-ID": payload.recipientId,
              },
              tags: [
                { name: "notification_type", value: payload.type },
                { name: "priority", value: payload.priority || "normal" },
                { name: "clinic", value: "neonpro" },
              ],
            };
            return [4 /*yield*/, resend.emails.send(emailData)];
          case 1:
            result = _c.sent();
            if (result.error) {
              throw new Error("Email sending failed: ".concat(result.error.message));
            }
            return [
              2 /*return*/,
              {
                success: true,
                notificationId:
                  ((_a = result.data) === null || _a === void 0 ? void 0 : _a.id) ||
                  "email_".concat(Date.now()),
                messageId: (_b = result.data) === null || _b === void 0 ? void 0 : _b.id,
                channel: "email",
                deliveredAt: new Date(),
              },
            ];
          case 2:
            error_1 = _c.sent();
            console.error("Email sending error:", error_1);
            return [
              2 /*return*/,
              {
                success: false,
                channel: "email",
                error: error_1 instanceof Error ? error_1.message : "Failed to send email",
              },
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  }; /**
   * Get React Email template component for notification type
   */
  EmailService.prototype.getTemplateComponent = (type) => {
    var templates = {
      appointment_reminder: appointment_reminder_1.AppointmentReminderEmail,
      appointment_confirmation: appointment_confirmation_1.AppointmentConfirmationEmail,
      appointment_cancellation: appointment_cancellation_1.AppointmentCancellationEmail,
      reschedule_request: reschedule_request_1.RescheduleRequestEmail,
      treatment_reminder: treatment_reminder_1.TreatmentReminderEmail,
      follow_up_reminder: follow_up_reminder_1.FollowUpReminderEmail,
      emergency_alert: emergency_alert_1.EmergencyAlertEmail,
      billing_reminder: billing_reminder_1.BillingReminderEmail,
    };
    return templates[type];
  };
  /**
   * Get email priority header value
   */
  EmailService.prototype.getPriorityHeader = (priority) => {
    switch (priority) {
      case "urgent":
        return "1";
      case "high":
        return "2";
      case "normal":
        return "3";
      case "low":
        return "4";
      default:
        return "3";
    }
  };
  /**
   * Get email delivery status from Resend
   */
  EmailService.prototype.getDeliveryStatus = function (messageId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        try {
          // Note: This is a placeholder for Resend's delivery status API
          // Resend doesn't currently provide detailed delivery status
          // You would implement webhook handling for delivery events
          // For now, assume sent means delivered after a short delay
          return [
            2 /*return*/,
            {
              status: "delivered",
              deliveredAt: new Date(),
            },
          ];
        } catch (error) {
          console.error("Error getting email delivery status:", error);
          return [2 /*return*/, null];
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Validate email template data against schema
   */
  EmailService.prototype.validateTemplateData = (type, data) => {
    try {
      // Define schemas for each template type
      var appointmentSchema = zod_1.z.object({
        patientName: zod_1.z.string(),
        appointmentDate: zod_1.z.string(),
        appointmentTime: zod_1.z.string(),
        clinicName: zod_1.z.string(),
        clinicAddress: zod_1.z.string(),
        cancellationLink: zod_1.z.string().url().optional(),
        rescheduleLink: zod_1.z.string().url().optional(),
      });
      var treatmentSchema = zod_1.z.object({
        patientName: zod_1.z.string(),
        treatmentName: zod_1.z.string(),
        nextAppointment: zod_1.z.string(),
        instructions: zod_1.z.string().optional(),
      });
      var billingSchema = zod_1.z.object({
        patientName: zod_1.z.string(),
        amountDue: zod_1.z.string(),
        dueDate: zod_1.z.string(),
        paymentLink: zod_1.z.string().url(),
        invoiceNumber: zod_1.z.string(),
      });
      // Validate based on type
      switch (type) {
        case "appointment_reminder":
        case "appointment_confirmation":
        case "appointment_cancellation":
        case "reschedule_request":
          appointmentSchema.parse(data);
          break;
        case "treatment_reminder":
        case "follow_up_reminder":
          treatmentSchema.parse(data);
          break;
        case "billing_reminder":
          billingSchema.parse(data);
          break;
        case "emergency_alert":
          zod_1.z
            .object({
              patientName: zod_1.z.string(),
              message: zod_1.z.string(),
              contactInfo: zod_1.z.string(),
            })
            .parse(data);
          break;
      }
      return true;
    } catch (error) {
      console.error("Template data validation failed for ".concat(type, ":"), error);
      return false;
    }
  };
  return EmailService;
})();
exports.EmailService = EmailService;

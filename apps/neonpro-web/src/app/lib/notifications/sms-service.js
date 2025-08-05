/**
 * NeonPro - SMS Service for Twilio Integration
 * HIPAA-compliant SMS notifications for healthcare appointments
 */
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
exports.SMSService = void 0;
var twilio_1 = require("twilio");
var config_1 = require("./config");
var client = new twilio_1.Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
var SMSService = /** @class */ (() => {
  function SMSService() {
    this.config = config_1.NOTIFICATION_CONFIG.sms;
  }
  /**
   * Send SMS using Twilio with HIPAA compliance
   */
  SMSService.prototype.send = function (payload) {
    return __awaiter(this, void 0, void 0, function () {
      var cleanPhone, messageContent, message, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            // Validate required environment variables
            if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
              throw new Error(
                "Twilio credentials are required (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)",
              );
            }
            if (!process.env.TWILIO_PHONE_NUMBER) {
              throw new Error("TWILIO_PHONE_NUMBER environment variable is required");
            }
            cleanPhone = this.validatePhoneNumber(payload.recipientPhone);
            if (!cleanPhone) {
              throw new Error("Invalid phone number format");
            }
            messageContent = this.generateSMSContent(
              payload.type,
              payload.content,
              payload.templateData,
            );
            return [
              4 /*yield*/,
              client.messages.create({
                body: messageContent,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: cleanPhone,
                // HIPAA compliance settings
                forceDelivery: true, // Ensure message is delivered
                provideFeedback: true, // Enable delivery status callbacks
                statusCallback: "".concat(process.env.NEXTAUTH_URL, "/api/webhooks/sms-status"),
                // Optional: Set message validity period (max 4 days for SMS)
                validityPeriod: this.config.validityPeriod || 1440, // 24 hours in minutes
              }),
            ];
          case 1:
            message = _a.sent();
            return [
              2 /*return*/,
              {
                success: true,
                notificationId: message.sid,
                messageId: message.sid,
                channel: "sms",
                deliveredAt: new Date(),
              },
            ];
          case 2:
            error_1 = _a.sent();
            console.error("SMS sending error:", error_1);
            return [
              2 /*return*/,
              {
                success: false,
                channel: "sms",
                error: error_1 instanceof Error ? error_1.message : "Failed to send SMS",
              },
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Validate and format phone number for Twilio
   */
  SMSService.prototype.validatePhoneNumber = (phone) => {
    try {
      // Remove all non-digit characters
      var cleaned = phone.replace(/\D/g, "");
      // Handle Brazilian phone numbers
      if (cleaned.length === 11 && cleaned.startsWith("55")) {
        // Already has country code
        return "+".concat(cleaned);
      } else if (cleaned.length === 10 || cleaned.length === 11) {
        // Add Brazilian country code
        return "+55".concat(cleaned);
      } else if (cleaned.length === 13 && cleaned.startsWith("55")) {
        // Already formatted correctly
        return "+".concat(cleaned);
      }
      // For international numbers, assume they're correctly formatted
      if (cleaned.length > 11) {
        return "+".concat(cleaned);
      }
      return null;
    } catch (error) {
      console.error("Phone number validation error:", error);
      return null;
    }
  }; /**
   * Generate SMS content based on notification type and template data
   */
  SMSService.prototype.generateSMSContent = (type, baseContent, templateData) => {
    try {
      // SMS templates optimized for healthcare (160-320 characters)
      var templates = {
        appointment_reminder: (data) =>
          "\uD83C\uDFE5 "
            .concat(
              (data === null || data === void 0 ? void 0 : data.clinicName) || "NeonPro",
              ": Lembrete de consulta para ",
            )
            .concat(data === null || data === void 0 ? void 0 : data.patientName, " em ")
            .concat(data === null || data === void 0 ? void 0 : data.appointmentDate, " \u00E0s ")
            .concat(
              data === null || data === void 0 ? void 0 : data.appointmentTime,
              ". Para cancelar/reagendar: ",
            )
            .concat(
              data === null || data === void 0 ? void 0 : data.clinicPhone,
              ". STOP para cancelar msgs.",
            ),
        appointment_confirmation: (data) =>
          "\u2705 "
            .concat(
              (data === null || data === void 0 ? void 0 : data.clinicName) || "NeonPro",
              ": Consulta confirmada para ",
            )
            .concat(data === null || data === void 0 ? void 0 : data.patientName, " em ")
            .concat(data === null || data === void 0 ? void 0 : data.appointmentDate, " \u00E0s ")
            .concat(data === null || data === void 0 ? void 0 : data.appointmentTime, ". Local: ")
            .concat(
              data === null || data === void 0 ? void 0 : data.clinicAddress,
              ". Chegue 15min antes.",
            ),
        appointment_cancellation: (data) =>
          "\u274C "
            .concat(
              (data === null || data === void 0 ? void 0 : data.clinicName) || "NeonPro",
              ": Consulta cancelada para ",
            )
            .concat(data === null || data === void 0 ? void 0 : data.patientName, " em ")
            .concat(data === null || data === void 0 ? void 0 : data.appointmentDate, " \u00E0s ")
            .concat(
              data === null || data === void 0 ? void 0 : data.appointmentTime,
              ". Para reagendar: ",
            )
            .concat(data === null || data === void 0 ? void 0 : data.clinicPhone, "."),
        reschedule_request: (data) =>
          "\uD83D\uDCC5 "
            .concat(
              (data === null || data === void 0 ? void 0 : data.clinicName) || "NeonPro",
              ": Solicita\u00E7\u00E3o de reagendamento para ",
            )
            .concat(
              data === null || data === void 0 ? void 0 : data.patientName,
              ". Nova data dispon\u00EDvel: ",
            )
            .concat(data === null || data === void 0 ? void 0 : data.newDate, ". Confirme: ")
            .concat(data === null || data === void 0 ? void 0 : data.confirmationLink),
        treatment_reminder: (data) =>
          "\uD83D\uDC8A "
            .concat(
              (data === null || data === void 0 ? void 0 : data.clinicName) || "NeonPro",
              ": Lembrete de tratamento para ",
            )
            .concat(data === null || data === void 0 ? void 0 : data.patientName, ". ")
            .concat(
              data === null || data === void 0 ? void 0 : data.treatmentName,
              " - Pr\u00F3xima sess\u00E3o: ",
            )
            .concat(data === null || data === void 0 ? void 0 : data.nextAppointment, "."),
        follow_up_reminder: (data) =>
          "\uD83D\uDC68\u200D\u2695\uFE0F "
            .concat(
              (data === null || data === void 0 ? void 0 : data.clinicName) || "NeonPro",
              ": Acompanhamento p\u00F3s-tratamento para ",
            )
            .concat(
              data === null || data === void 0 ? void 0 : data.patientName,
              ". Agende consulta de retorno: ",
            )
            .concat(data === null || data === void 0 ? void 0 : data.clinicPhone, "."),
        emergency_alert: (data) =>
          "\uD83D\uDEA8 "
            .concat(
              (data === null || data === void 0 ? void 0 : data.clinicName) || "NeonPro",
              " - URGENTE: ",
            )
            .concat(data === null || data === void 0 ? void 0 : data.message, ". Contato: ")
            .concat(data === null || data === void 0 ? void 0 : data.contactInfo, ". ")
            .concat(data === null || data === void 0 ? void 0 : data.patientName),
        billing_reminder: (data) =>
          "\uD83D\uDCB3 "
            .concat(
              (data === null || data === void 0 ? void 0 : data.clinicName) || "NeonPro",
              ": Cobran\u00E7a de R$ ",
            )
            .concat(data === null || data === void 0 ? void 0 : data.amountDue, " vence em ")
            .concat(data === null || data === void 0 ? void 0 : data.dueDate, ". Pague online: ")
            .concat(data === null || data === void 0 ? void 0 : data.paymentLink),
      };
      var template = templates[type];
      if (template && templateData) {
        return template(templateData);
      }
      // Fallback to base content with character limit
      return baseContent.length > 320
        ? "".concat(baseContent.substring(0, 317), "...")
        : baseContent;
    } catch (error) {
      console.error("Error generating SMS content:", error);
      return baseContent.length > 160
        ? "".concat(baseContent.substring(0, 157), "...")
        : baseContent;
    }
  };
  /**
   * Get SMS delivery status from Twilio
   */
  SMSService.prototype.getDeliveryStatus = function (messageId) {
    return __awaiter(this, void 0, void 0, function () {
      var message, statusMap, error_2;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
              return [2 /*return*/, null];
            }
            return [4 /*yield*/, client.messages(messageId).fetch()];
          case 1:
            message = _a.sent();
            statusMap = {
              queued: "pending",
              sending: "pending",
              sent: "sent",
              received: "delivered",
              delivered: "delivered",
              undelivered: "failed",
              failed: "failed",
              cancelled: "cancelled",
            };
            return [
              2 /*return*/,
              {
                status: statusMap[message.status] || "failed",
                deliveredAt: message.dateUpdated ? new Date(message.dateUpdated) : undefined,
                error: message.errorCode
                  ? "".concat(message.errorCode, ": ").concat(message.errorMessage)
                  : undefined,
              },
            ];
          case 2:
            error_2 = _a.sent();
            console.error("Error getting SMS delivery status:", error_2);
            return [2 /*return*/, null];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Validate SMS template data for specific notification type
   */
  SMSService.prototype.validateSMSTemplate = (type, data) => {
    try {
      var requiredFields = {
        appointment_reminder: ["patientName", "appointmentDate", "appointmentTime", "clinicPhone"],
        appointment_confirmation: [
          "patientName",
          "appointmentDate",
          "appointmentTime",
          "clinicAddress",
        ],
        appointment_cancellation: [
          "patientName",
          "appointmentDate",
          "appointmentTime",
          "clinicPhone",
        ],
        reschedule_request: ["patientName", "newDate", "confirmationLink"],
        treatment_reminder: ["patientName", "treatmentName", "nextAppointment"],
        follow_up_reminder: ["patientName", "clinicPhone"],
        emergency_alert: ["message", "contactInfo", "patientName"],
        billing_reminder: ["patientName", "amountDue", "dueDate", "paymentLink"],
      };
      var required = requiredFields[type];
      if (!required) return true; // No validation for unknown types
      return required.every((field) => data && data[field]);
    } catch (error) {
      console.error("SMS template validation error:", error);
      return false;
    }
  };
  /**
   * Send bulk SMS messages (for batch notifications)
   */
  SMSService.prototype.sendBulk = function (payloads) {
    return __awaiter(this, void 0, void 0, function () {
      var results, batchSize, i, batch, batchPromises, batchResults, error_3;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            results = [];
            batchSize = 10;
            i = 0;
            _a.label = 1;
          case 1:
            if (!(i < payloads.length)) return [3 /*break*/, 8];
            batch = payloads.slice(i, i + batchSize);
            batchPromises = batch.map((payload) => this.send(payload));
            _a.label = 2;
          case 2:
            _a.trys.push([2, 6, , 7]);
            return [4 /*yield*/, Promise.all(batchPromises)];
          case 3:
            batchResults = _a.sent();
            results.push.apply(results, batchResults);
            if (!(i + batchSize < payloads.length)) return [3 /*break*/, 5];
            return [4 /*yield*/, new Promise((resolve) => setTimeout(resolve, 1000))];
          case 4:
            _a.sent(); // 1 second delay
            _a.label = 5;
          case 5:
            return [3 /*break*/, 7];
          case 6:
            error_3 = _a.sent();
            console.error("Bulk SMS batch error:", error_3);
            // Add failed results for this batch
            batch.forEach(() => {
              results.push({
                success: false,
                channel: "sms",
                error: "Batch processing failed",
              });
            });
            return [3 /*break*/, 7];
          case 7:
            i += batchSize;
            return [3 /*break*/, 1];
          case 8:
            return [2 /*return*/, results];
        }
      });
    });
  };
  return SMSService;
})();
exports.SMSService = SMSService;

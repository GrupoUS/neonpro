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
exports.NeonProAutomation = void 0;
var sdk_1 = require("@trigger.dev/sdk");
// Initialize Trigger.dev client
var client = new sdk_1.TriggerClient({
  id: "neonpro",
  apiKey: process.env.TRIGGER_API_KEY,
  apiUrl: process.env.TRIGGER_API_URL,
});
/**
 * 🤖 NeonPro Background Jobs Automation
 *
 * Utilitários para facilitar o uso dos jobs do Trigger.dev
 * na aplicação NeonPro existente. Integra com APIs atuais.
 */
var NeonProAutomation = /** @class */ (() => {
  function NeonProAutomation() {}
  /**
   * 📧 Enviar confirmação de consulta automaticamente
   * Integra com o sistema de appointments existente
   */
  NeonProAutomation.sendAppointmentConfirmation = function (params) {
    return __awaiter(this, void 0, void 0, function () {
      var payload, handle, error_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            payload = {
              appointmentId: params.appointmentId,
              recipientEmail: params.patientEmail,
              recipientName: params.patientName,
              clinicName: params.clinicName,
              clinicId: params.clinicId,
              appointmentDate: params.appointmentDate,
              appointmentTime: params.appointmentTime,
              professionalName: params.professionalName,
              serviceName: params.serviceName,
            };
            return [
              4 /*yield*/,
              client.sendEvent({
                name: "appointment-confirmation-email",
                payload: payload,
              }),
            ];
          case 1:
            handle = _a.sent();
            console.log("✅ Appointment confirmation job triggered", {
              jobId: handle.id,
              appointmentId: params.appointmentId,
            });
            return [
              2 /*return*/,
              {
                success: true,
                jobId: handle.id,
                appointmentId: params.appointmentId,
              },
            ];
          case 2:
            error_1 = _a.sent();
            console.error("❌ Failed to trigger appointment confirmation", error_1);
            throw new Error(
              "Failed to send appointment confirmation: ".concat(
                error_1 instanceof Error ? error_1.message : error_1,
              ),
            );
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * ⏰ Agendar lembrete de consulta (24h antes)
   * Auto-schedule para reduzir no-shows
   */
  NeonProAutomation.scheduleAppointmentReminder = function (params) {
    return __awaiter(this, void 0, void 0, function () {
      var payload, scheduleFor, appointmentDateTime, handle, error_2;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            payload = {
              appointmentId: params.appointmentId,
              recipientEmail: params.patientEmail,
              recipientName: params.patientName,
              clinicName: params.clinicName,
              clinicId: params.clinicId,
              appointmentDate: params.appointmentDate,
              appointmentTime: params.appointmentTime,
              professionalName: params.professionalName,
              serviceName: params.serviceName,
            };
            scheduleFor = params.reminderDate;
            if (!scheduleFor) {
              appointmentDateTime = new Date(
                "".concat(params.appointmentDate, "T").concat(params.appointmentTime),
              );
              scheduleFor = new Date(appointmentDateTime.getTime() - 24 * 60 * 60 * 1000); // 24h antes
            }
            return [
              4 /*yield*/,
              client.sendEvent({
                name: "appointment-reminder-email",
                payload: payload,
                options: {
                  delay: scheduleFor,
                },
              }),
            ];
          case 1:
            handle = _a.sent();
            console.log("✅ Appointment reminder scheduled", {
              jobId: handle.id,
              appointmentId: params.appointmentId,
              scheduledFor: scheduleFor,
            });
            return [
              2 /*return*/,
              {
                success: true,
                jobId: handle.id,
                appointmentId: params.appointmentId,
                scheduledFor: scheduleFor,
              },
            ];
          case 2:
            error_2 = _a.sent();
            console.error("❌ Failed to schedule appointment reminder", error_2);
            throw new Error(
              "Failed to schedule reminder: ".concat(
                error_2 instanceof Error ? error_2.message : error_2,
              ),
            );
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * 💰 Enviar fatura por email automaticamente
   * Integra com sistema de billing existente
   */
  NeonProAutomation.sendInvoiceEmail = function (params) {
    return __awaiter(this, void 0, void 0, function () {
      var payload, handle, error_3;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            payload = {
              invoiceId: params.invoiceId,
              recipientEmail: params.patientEmail,
              recipientName: params.patientName,
              clinicName: params.clinicName,
              clinicId: params.clinicId,
              amount: params.amount,
              dueDate: params.dueDate,
              invoiceUrl: params.invoiceUrl,
            };
            return [
              4 /*yield*/,
              client.sendEvent({
                name: "invoice-email-delivery",
                payload: payload,
              }),
            ];
          case 1:
            handle = _a.sent();
            console.log("✅ Invoice email job triggered", {
              jobId: handle.id,
              invoiceId: params.invoiceId,
              amount: params.amount,
            });
            return [
              2 /*return*/,
              {
                success: true,
                jobId: handle.id,
                invoiceId: params.invoiceId,
                amount: params.amount,
              },
            ];
          case 2:
            error_3 = _a.sent();
            console.error("❌ Failed to trigger invoice email", error_3);
            throw new Error(
              "Failed to send invoice: ".concat(
                error_3 instanceof Error ? error_3.message : error_3,
              ),
            );
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * 📱 Enviar lembrete de pagamento
   * Para faturas vencidas ou próximas do vencimento
   */
  NeonProAutomation.sendPaymentReminder = function (params) {
    return __awaiter(this, void 0, void 0, function () {
      var payload, scheduleOptions, delayDate, handle, error_4;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            payload = {
              invoiceId: params.invoiceId,
              recipientEmail: params.patientEmail,
              recipientName: params.patientName,
              clinicName: params.clinicName,
              clinicId: params.clinicId,
              amount: params.amount,
              dueDate: params.dueDate,
              invoiceUrl: params.invoiceUrl,
            };
            scheduleOptions = {};
            if (params.delayDays) {
              delayDate = new Date();
              delayDate.setDate(delayDate.getDate() + params.delayDays);
              scheduleOptions = { delay: delayDate };
            }
            return [
              4 /*yield*/,
              client.sendEvent({
                name: "payment-reminder-email",
                payload: payload,
                options: scheduleOptions,
              }),
            ];
          case 1:
            handle = _a.sent();
            console.log("✅ Payment reminder job triggered", {
              jobId: handle.id,
              invoiceId: params.invoiceId,
              delayDays: params.delayDays,
            });
            return [
              2 /*return*/,
              {
                success: true,
                jobId: handle.id,
                invoiceId: params.invoiceId,
                scheduledFor: params.delayDays ? "+".concat(params.delayDays, " days") : "now",
              },
            ];
          case 2:
            error_4 = _a.sent();
            console.error("❌ Failed to trigger payment reminder", error_4);
            throw new Error(
              "Failed to send payment reminder: ".concat(
                error_4 instanceof Error ? error_4.message : error_4,
              ),
            );
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * 🎯 Auto-trigger para nova consulta agendada
   * Chamado automaticamente quando uma consulta é criada
   */
  NeonProAutomation.onNewAppointmentCreated = function (appointmentData) {
    return __awaiter(this, void 0, void 0, function () {
      var results, _a, _b, error_5;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            results = {
              confirmation: null,
              reminder: null,
            };
            _c.label = 1;
          case 1:
            _c.trys.push([1, 4, , 5]);
            // 1. Enviar confirmação imediatamente
            _a = results;
            return [4 /*yield*/, this.sendAppointmentConfirmation(appointmentData)];
          case 2:
            // 1. Enviar confirmação imediatamente
            _a.confirmation = _c.sent();
            // 2. Agendar lembrete para 24h antes
            _b = results;
            return [4 /*yield*/, this.scheduleAppointmentReminder(appointmentData)];
          case 3:
            // 2. Agendar lembrete para 24h antes
            _b.reminder = _c.sent();
            console.log("✅ New appointment automation completed", {
              appointmentId: appointmentData.appointmentId,
              confirmationJobId: results.confirmation.jobId,
              reminderJobId: results.reminder.jobId,
            });
            return [2 /*return*/, results];
          case 4:
            error_5 = _c.sent();
            console.error("❌ Failed to complete appointment automation", error_5);
            return [2 /*return*/, results];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * 💰 Auto-trigger para nova fatura criada
   * Chamado automaticamente quando uma fatura é gerada
   */
  NeonProAutomation.onNewInvoiceCreated = function (invoiceData) {
    return __awaiter(this, void 0, void 0, function () {
      var results, _a, dueDate, reminderDate, _b, error_6;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            results = {
              invoiceEmail: null,
              paymentReminder: null,
            };
            _c.label = 1;
          case 1:
            _c.trys.push([1, 4, , 5]);
            // 1. Enviar fatura imediatamente
            _a = results;
            return [4 /*yield*/, this.sendInvoiceEmail(invoiceData)];
          case 2:
            // 1. Enviar fatura imediatamente
            _a.invoiceEmail = _c.sent();
            dueDate = new Date(invoiceData.dueDate);
            reminderDate = new Date(dueDate.getTime() + 24 * 60 * 60 * 1000);
            _b = results;
            return [
              4 /*yield*/,
              this.sendPaymentReminder(
                __assign(__assign({}, invoiceData), {
                  delayDays: Math.ceil(
                    (reminderDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                  ),
                }),
              ),
            ];
          case 3:
            _b.paymentReminder = _c.sent();
            console.log("✅ New invoice automation completed", {
              invoiceId: invoiceData.invoiceId,
              amount: invoiceData.amount,
              invoiceJobId: results.invoiceEmail.jobId,
              reminderJobId: results.paymentReminder.jobId,
            });
            return [2 /*return*/, results];
          case 4:
            error_6 = _c.sent();
            console.error("❌ Failed to complete invoice automation", error_6);
            return [2 /*return*/, results];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  return NeonProAutomation;
})();
exports.NeonProAutomation = NeonProAutomation;

"use strict";
// Serviço de notificações por email e SMS
// lib/services/notification-email-sms.ts
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
exports.notificationService = void 0;
var resend_1 = require("resend");
// Configuração do Resend para emails
var resend = new resend_1.Resend(process.env.RESEND_API_KEY);
var NotificationService = /** @class */ (function () {
  function NotificationService() {}
  // Templates de email
  NotificationService.prototype.getEmailTemplate = function (type, context) {
    var baseSubject = "[NeonPro] Contas a Pagar - ";
    switch (type) {
      case "overdue":
        return {
          to: context.vendorName,
          subject: "".concat(baseSubject, "Conta Vencida - ").concat(context.invoiceNumber),
          html: '\n            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">\n              <h2 style="color: #dc2626;">\u26A0\uFE0F Conta Vencida</h2>\n              <p><strong>Fornecedor:</strong> '
            .concat(context.vendorName, "</p>\n              <p><strong>Fatura:</strong> ")
            .concat(context.invoiceNumber, "</p>\n              <p><strong>Valor:</strong> R$ ")
            .concat(
              context.amount.toFixed(2),
              "</p>\n              <p><strong>Vencimento:</strong> ",
            )
            .concat(context.dueDate, "</p>\n              <p><strong>Dias em Atraso:</strong> ")
            .concat(
              context.daysPastDue,
              ' dias</p>\n              <div style="background-color: #fee2e2; padding: 15px; border-radius: 5px; margin: 20px 0;">\n                <p style="color: #dc2626; margin: 0;">\n                  <strong>A\u00E7\u00E3o Urgente Necess\u00E1ria:</strong> Esta conta est\u00E1 vencida h\u00E1 ',
            )
            .concat(
              context.daysPastDue,
              ' dias. \n                  Por favor, providencie o pagamento o mais breve poss\u00EDvel para evitar juros e multas.\n                </p>\n              </div>\n              <a href="http://127.0.0.1:8080/dashboard/accounts-payable" \n                 style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">\n                Acessar Sistema\n              </a>\n            </div>\n          ',
            ),
          text: "Conta Vencida - "
            .concat(context.invoiceNumber, " - ")
            .concat(context.vendorName, " - R$ ")
            .concat(context.amount.toFixed(2), " - ")
            .concat(context.daysPastDue, " dias em atraso"),
        };
      case "due_today":
        return {
          to: context.vendorName,
          subject: "".concat(baseSubject, "Vencimento Hoje - ").concat(context.invoiceNumber),
          html: '\n            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">\n              <h2 style="color: #f59e0b;">\uD83D\uDCC5 Vencimento Hoje</h2>\n              <p><strong>Fornecedor:</strong> '
            .concat(context.vendorName, "</p>\n              <p><strong>Fatura:</strong> ")
            .concat(context.invoiceNumber, "</p>\n              <p><strong>Valor:</strong> R$ ")
            .concat(
              context.amount.toFixed(2),
              "</p>\n              <p><strong>Vencimento:</strong> ",
            )
            .concat(
              context.dueDate,
              '</p>\n              <div style="background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0;">\n                <p style="color: #d97706; margin: 0;">\n                  <strong>Lembrete:</strong> Esta conta vence hoje. Providencie o pagamento para evitar atrasos.\n                </p>\n              </div>\n              <a href="http://127.0.0.1:8080/dashboard/accounts-payable" \n                 style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">\n                Processar Pagamento\n              </a>\n            </div>\n          ',
            ),
          text: "Vencimento Hoje - "
            .concat(context.invoiceNumber, " - ")
            .concat(context.vendorName, " - R$ ")
            .concat(context.amount.toFixed(2)),
        };
      case "due_soon":
        return {
          to: context.vendorName,
          subject: ""
            .concat(baseSubject, "Vencimento Pr\u00F3ximo - ")
            .concat(context.invoiceNumber),
          html: '\n            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">\n              <h2 style="color: #3b82f6;">\uD83D\uDD14 Vencimento Pr\u00F3ximo</h2>\n              <p><strong>Fornecedor:</strong> '
            .concat(context.vendorName, "</p>\n              <p><strong>Fatura:</strong> ")
            .concat(context.invoiceNumber, "</p>\n              <p><strong>Valor:</strong> R$ ")
            .concat(
              context.amount.toFixed(2),
              "</p>\n              <p><strong>Vencimento:</strong> ",
            )
            .concat(
              context.dueDate,
              '</p>\n              <div style="background-color: #dbeafe; padding: 15px; border-radius: 5px; margin: 20px 0;">\n                <p style="color: #1d4ed8; margin: 0;">\n                  <strong>Aviso:</strong> Esta conta vencer\u00E1 em breve. Organize-se para o pagamento.\n                </p>\n              </div>\n              <a href="http://127.0.0.1:8080/dashboard/accounts-payable" \n                 style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">\n                Ver Detalhes\n              </a>\n            </div>\n          ',
            ),
          text: "Vencimento Pr\u00F3ximo - "
            .concat(context.invoiceNumber, " - ")
            .concat(context.vendorName, " - R$ ")
            .concat(context.amount.toFixed(2), " em ")
            .concat(context.dueDate),
        };
      case "payment_complete":
        return {
          to: context.vendorName,
          subject: "".concat(baseSubject, "Pagamento Realizado - ").concat(context.invoiceNumber),
          html: '\n            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">\n              <h2 style="color: #10b981;">\u2705 Pagamento Realizado</h2>\n              <p><strong>Fornecedor:</strong> '
            .concat(context.vendorName, "</p>\n              <p><strong>Fatura:</strong> ")
            .concat(
              context.invoiceNumber,
              "</p>\n              <p><strong>Valor Pago:</strong> R$ ",
            )
            .concat(
              context.amount.toFixed(2),
              '</p>\n              <div style="background-color: #d1fae5; padding: 15px; border-radius: 5px; margin: 20px 0;">\n                <p style="color: #065f46; margin: 0;">\n                  <strong>Confirmado:</strong> O pagamento foi processado com sucesso.\n                </p>\n              </div>\n              <a href="http://127.0.0.1:8080/dashboard/accounts-payable" \n                 style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">\n                Ver Comprovante\n              </a>\n            </div>\n          ',
            ),
          text: "Pagamento Realizado - "
            .concat(context.invoiceNumber, " - ")
            .concat(context.vendorName, " - R$ ")
            .concat(context.amount.toFixed(2)),
        };
      default:
        return {
          to: context.vendorName,
          subject: "".concat(baseSubject, "Notifica\u00E7\u00E3o - ").concat(context.invoiceNumber),
          html: "<p>Notifica\u00E7\u00E3o sobre a fatura "
            .concat(context.invoiceNumber, " - ")
            .concat(context.vendorName, "</p>"),
          text: "Notifica\u00E7\u00E3o sobre a fatura "
            .concat(context.invoiceNumber, " - ")
            .concat(context.vendorName),
        };
    }
  };
  // Templates de SMS
  NotificationService.prototype.getSMSTemplate = function (type, context) {
    switch (type) {
      case "overdue":
        return "[NeonPro] URGENTE: Conta "
          .concat(context.invoiceNumber, " vencida h\u00E1 ")
          .concat(context.daysPastDue, " dias. Valor: R$ ")
          .concat(
            context.amount.toFixed(2),
            ". Acesse: http://127.0.0.1:8080/dashboard/accounts-payable",
          );
      case "due_today":
        return "[NeonPro] VENCE HOJE: "
          .concat(context.invoiceNumber, " - R$ ")
          .concat(
            context.amount.toFixed(2),
            ". Providencie pagamento. Acesse: http://127.0.0.1:8080/dashboard/accounts-payable",
          );
      case "due_soon":
        return "[NeonPro] Vence "
          .concat(context.dueDate, ": ")
          .concat(context.invoiceNumber, " - R$ ")
          .concat(context.amount.toFixed(2), ". Prepare-se para o pagamento.");
      case "payment_complete":
        return "[NeonPro] \u2705 Pagamento confirmado: "
          .concat(context.invoiceNumber, " - R$ ")
          .concat(context.amount.toFixed(2));
      default:
        return "[NeonPro] Notifica\u00E7\u00E3o sobre "
          .concat(context.invoiceNumber, " - R$ ")
          .concat(context.amount.toFixed(2));
    }
  };
  // Enviar email
  NotificationService.prototype.sendEmail = function (type, context, recipientEmail) {
    return __awaiter(this, void 0, void 0, function () {
      var template_1, template, result, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            if (
              !process.env.RESEND_API_KEY ||
              process.env.RESEND_API_KEY === "your_resend_api_key_here"
            ) {
              console.log("⚠️ Email não configurado. Template que seria enviado:");
              template_1 = this.getEmailTemplate(type, context);
              console.log("Para: ".concat(recipientEmail));
              console.log("Assunto: ".concat(template_1.subject));
              console.log("Conte\u00FAdo: ".concat(template_1.text));
              return [2 /*return*/, false];
            }
            template = this.getEmailTemplate(type, context);
            return [
              4 /*yield*/,
              resend.emails.send({
                from: "NeonPro <noreply@neonpro.app>",
                to: recipientEmail,
                subject: template.subject,
                html: template.html,
                text: template.text,
              }),
            ];
          case 1:
            result = _a.sent();
            console.log(
              "\u2705 Email enviado: ".concat(template.subject, " para ").concat(recipientEmail),
            );
            return [2 /*return*/, true];
          case 2:
            error_1 = _a.sent();
            console.error("❌ Erro ao enviar email:", error_1);
            return [2 /*return*/, false];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // Enviar SMS (simulado - integraria com Twilio, etc.)
  NotificationService.prototype.sendSMS = function (type, context, phoneNumber) {
    return __awaiter(this, void 0, void 0, function () {
      var message;
      return __generator(this, function (_a) {
        try {
          message = this.getSMSTemplate(type, context);
          // Por enquanto apenas simula o envio
          console.log("📱 SMS (SIMULADO):");
          console.log("Para: ".concat(phoneNumber));
          console.log("Mensagem: ".concat(message));
          // Aqui integraria com Twilio, AWS SNS, ou outro provedor
          // const result = await twilioClient.messages.create({
          //   body: message,
          //   from: '+5511999999999',
          //   to: phoneNumber
          // });
          return [2 /*return*/, true];
        } catch (error) {
          console.error("❌ Erro ao enviar SMS:", error);
          return [2 /*return*/, false];
        }
        return [2 /*return*/];
      });
    });
  };
  // Enviar notificação (email + SMS)
  NotificationService.prototype.sendNotification = function (type, context, recipients) {
    return __awaiter(this, void 0, void 0, function () {
      var results, _a, _b;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            results = { emailSent: false, smsSent: false };
            if (!recipients.email) return [3 /*break*/, 2];
            _a = results;
            return [4 /*yield*/, this.sendEmail(type, context, recipients.email)];
          case 1:
            _a.emailSent = _c.sent();
            _c.label = 2;
          case 2:
            if (!recipients.phone) return [3 /*break*/, 4];
            _b = results;
            return [4 /*yield*/, this.sendSMS(type, context, recipients.phone)];
          case 3:
            _b.smsSent = _c.sent();
            _c.label = 4;
          case 4:
            return [2 /*return*/, results];
        }
      });
    });
  };
  return NotificationService;
})();
exports.notificationService = new NotificationService();
exports.default = NotificationService;

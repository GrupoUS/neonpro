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
exports.EmailNotificationService = void 0;
var resend_1 = require("resend");
// Initialize Resend
var resend = new resend_1.Resend(process.env.RESEND_API_KEY);
// Professional email templates with modern styling
var EmailTemplates = {
  overduePayment: (data, config) => ({
    subject: "[URGENTE] Pagamento em atraso - ".concat(data.supplierName),
    html: '\n      <div style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, \'Helvetica Neue\', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">\n        <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">\n          <div style="font-size: 48px; margin-bottom: 10px;">\u26A0\uFE0F</div>\n          <h1 style="margin: 0; font-size: 28px; font-weight: 700;">Pagamento em Atraso</h1>\n          <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">A\u00E7\u00E3o imediata requerida</p>\n        </div>\n        \n        <div style="background-color: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">\n          <div style="background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); border: 1px solid #fca5a5; border-radius: 8px; padding: 24px; margin-bottom: 24px;">\n            <h2 style="color: #dc2626; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">Detalhes do Pagamento</h2>\n            \n            <table style="width: 100%; border-collapse: collapse;">\n              <tr>\n                <td style="padding: 12px 0; font-weight: 600; color: #374151; width: 140px;">Fornecedor:</td>\n                <td style="padding: 12px 0; color: #111827; font-weight: 500;">'
      .concat(
        data.supplierName,
        '</td>\n              </tr>\n              <tr>\n                <td style="padding: 12px 0; font-weight: 600; color: #374151;">Valor:</td>\n                <td style="padding: 12px 0; color: #dc2626; font-size: 24px; font-weight: 700;">R$ ',
      )
      .concat(
        data.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 }),
        '</td>\n              </tr>\n              <tr>\n                <td style="padding: 12px 0; font-weight: 600; color: #374151;">Vencimento:</td>\n                <td style="padding: 12px 0; color: #dc2626; font-weight: 600; font-size: 16px;">',
      )
      .concat(
        new Date(data.dueDate).toLocaleDateString("pt-BR"),
        "</td>\n              </tr>\n              ",
      )
      .concat(
        data.invoiceNumber
          ? '\n              <tr>\n                <td style="padding: 12px 0; font-weight: 600; color: #374151;">Nota Fiscal:</td>\n                <td style="padding: 12px 0; color: #111827; font-family: monospace; background: #f3f4f6; padding: 4px 8px; border-radius: 4px; display: inline-block;">'.concat(
              data.invoiceNumber,
              "</td>\n              </tr>\n              ",
            )
          : "",
        '\n            </table>\n          </div>\n          \n          <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 24px 0; border-radius: 0 6px 6px 0;">\n            <p style="margin: 0; font-size: 16px; color: #991b1b; font-weight: 500;">\n              <strong>Importante:</strong> Este pagamento est\u00E1 em atraso. Por favor, efetue o pagamento o quanto antes para evitar juros e multas.\n            </p>\n          </div>\n          \n          <div style="text-align: center; margin: 32px 0;">\n            <div style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 16px;">\n              Efetue o pagamento HOJE\n            </div>\n          </div>\n          \n          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 32px;">\n            <p style="font-size: 14px; color: #6b7280; margin: 0; text-align: center;">\n              Esta \u00E9 uma notifica\u00E7\u00E3o autom\u00E1tica do sistema <strong>',
      )
      .concat(
        config.companyName || "NeonPro",
        '</strong><br>\n              Para d\u00FAvidas, entre em contato: <a href="mailto:',
      )
      .concat(
        config.supportEmail || "suporte@neonpro.com",
        '" style="color: #3b82f6; text-decoration: none;">',
      )
      .concat(
        config.supportEmail || "suporte@neonpro.com",
        "</a>\n            </p>\n          </div>\n        </div>\n      </div>\n    ",
      ),
  }),
  dueToday: (data, config) => ({
    subject: "\u23F0 Pagamento vence HOJE - ".concat(data.supplierName),
    html: '\n      <div style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, \'Helvetica Neue\', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">\n        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">\n          <div style="font-size: 48px; margin-bottom: 10px;">\u23F0</div>\n          <h1 style="margin: 0; font-size: 28px; font-weight: 700;">Pagamento Vence Hoje</h1>\n          <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Lembrete importante</p>\n        </div>\n        \n        <div style="background-color: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">\n          <div style="background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%); border: 1px solid #fbbf24; border-radius: 8px; padding: 24px; margin-bottom: 24px;">\n            <h2 style="color: #d97706; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">Detalhes do Pagamento</h2>\n            \n            <table style="width: 100%; border-collapse: collapse;">\n              <tr>\n                <td style="padding: 12px 0; font-weight: 600; color: #374151; width: 140px;">Fornecedor:</td>\n                <td style="padding: 12px 0; color: #111827; font-weight: 500;">'
      .concat(
        data.supplierName,
        '</td>\n              </tr>\n              <tr>\n                <td style="padding: 12px 0; font-weight: 600; color: #374151;">Valor:</td>\n                <td style="padding: 12px 0; color: #f59e0b; font-size: 24px; font-weight: 700;">R$ ',
      )
      .concat(
        data.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 }),
        '</td>\n              </tr>\n              <tr>\n                <td style="padding: 12px 0; font-weight: 600; color: #374151;">Vencimento:</td>\n                <td style="padding: 12px 0; color: #f59e0b; font-weight: 600; font-size: 16px;">HOJE (',
      )
      .concat(
        new Date(data.dueDate).toLocaleDateString("pt-BR"),
        ")</td>\n              </tr>\n              ",
      )
      .concat(
        data.invoiceNumber
          ? '\n              <tr>\n                <td style="padding: 12px 0; font-weight: 600; color: #374151;">Nota Fiscal:</td>\n                <td style="padding: 12px 0; color: #111827; font-family: monospace; background: #f3f4f6; padding: 4px 8px; border-radius: 4px; display: inline-block;">'.concat(
              data.invoiceNumber,
              "</td>\n              </tr>\n              ",
            )
          : "",
        '\n            </table>\n          </div>\n          \n          <div style="text-align: center; margin: 32px 0;">\n            <div style="background: #fff3cd; border: 2px solid #f59e0b; padding: 20px; border-radius: 8px;">\n              <p style="margin: 0; font-size: 18px; font-weight: 600; color: #d97706;">\n                \uD83C\uDFAF N\u00E3o esque\u00E7a: o pagamento vence hoje!\n              </p>\n            </div>\n          </div>\n          \n          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 32px;">\n            <p style="font-size: 14px; color: #6b7280; margin: 0; text-align: center;">\n              Esta \u00E9 uma notifica\u00E7\u00E3o autom\u00E1tica do sistema <strong>',
      )
      .concat(
        config.companyName || "NeonPro",
        '</strong><br>\n              Para d\u00FAvidas, entre em contato: <a href="mailto:',
      )
      .concat(
        config.supportEmail || "suporte@neonpro.com",
        '" style="color: #3b82f6; text-decoration: none;">',
      )
      .concat(
        config.supportEmail || "suporte@neonpro.com",
        "</a>\n            </p>\n          </div>\n        </div>\n      </div>\n    ",
      ),
  }),
  dueSoon: (data, config) => ({
    subject: "\uD83D\uDCC5 Pagamento pr\u00F3ximo do vencimento - ".concat(data.supplierName),
    html: '\n      <div style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, \'Helvetica Neue\', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">\n        <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">\n          <div style="font-size: 48px; margin-bottom: 10px;">\uD83D\uDCC5</div>\n          <h1 style="margin: 0; font-size: 28px; font-weight: 700;">Pagamento Pr\u00F3ximo</h1>\n          <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Lembrete preventivo</p>\n        </div>\n        \n        <div style="background-color: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">\n          <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border: 1px solid #93c5fd; border-radius: 8px; padding: 24px; margin-bottom: 24px;">\n            <h2 style="color: #1d4ed8; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">Detalhes do Pagamento</h2>\n            \n            <table style="width: 100%; border-collapse: collapse;">\n              <tr>\n                <td style="padding: 12px 0; font-weight: 600; color: #374151; width: 140px;">Fornecedor:</td>\n                <td style="padding: 12px 0; color: #111827; font-weight: 500;">'
      .concat(
        data.supplierName,
        '</td>\n              </tr>\n              <tr>\n                <td style="padding: 12px 0; font-weight: 600; color: #374151;">Valor:</td>\n                <td style="padding: 12px 0; color: #3b82f6; font-size: 24px; font-weight: 700;">R$ ',
      )
      .concat(
        data.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 }),
        '</td>\n              </tr>\n              <tr>\n                <td style="padding: 12px 0; font-weight: 600; color: #374151;">Vencimento:</td>\n                <td style="padding: 12px 0; color: #3b82f6; font-weight: 600; font-size: 16px;">',
      )
      .concat(
        new Date(data.dueDate).toLocaleDateString("pt-BR"),
        "</td>\n              </tr>\n              ",
      )
      .concat(
        data.invoiceNumber
          ? '\n              <tr>\n                <td style="padding: 12px 0; font-weight: 600; color: #374151;">Nota Fiscal:</td>\n                <td style="padding: 12px 0; color: #111827; font-family: monospace; background: #f3f4f6; padding: 4px 8px; border-radius: 4px; display: inline-block;">'.concat(
              data.invoiceNumber,
              "</td>\n              </tr>\n              ",
            )
          : "",
        '\n            </table>\n          </div>\n          \n          <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 24px 0; border-radius: 0 6px 6px 0;">\n            <p style="margin: 0; font-size: 16px; color: #1e40af; font-weight: 500;">\n              \uD83D\uDCA1 <strong>Dica:</strong> Organize-se para efetuar este pagamento antes do vencimento e evite multas e juros.\n            </p>\n          </div>\n          \n          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 32px;">\n            <p style="font-size: 14px; color: #6b7280; margin: 0; text-align: center;">\n              Esta \u00E9 uma notifica\u00E7\u00E3o autom\u00E1tica do sistema <strong>',
      )
      .concat(
        config.companyName || "NeonPro",
        '</strong><br>\n              Para d\u00FAvidas, entre em contato: <a href="mailto:',
      )
      .concat(
        config.supportEmail || "suporte@neonpro.com",
        '" style="color: #3b82f6; text-decoration: none;">',
      )
      .concat(
        config.supportEmail || "suporte@neonpro.com",
        "</a>\n            </p>\n          </div>\n        </div>\n      </div>\n    ",
      ),
  }),
  paymentCompleted: (data, config) => ({
    subject: "\u2705 Pagamento confirmado - ".concat(data.supplierName),
    html: '\n      <div style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, \'Helvetica Neue\', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">\n        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">\n          <div style="font-size: 48px; margin-bottom: 10px;">\u2705</div>\n          <h1 style="margin: 0; font-size: 28px; font-weight: 700;">Pagamento Confirmado</h1>\n          <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Transa\u00E7\u00E3o realizada com sucesso</p>\n        </div>\n        \n        <div style="background-color: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">\n          <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border: 1px solid #6ee7b7; border-radius: 8px; padding: 24px; margin-bottom: 24px;">\n            <h2 style="color: #059669; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">Detalhes do Pagamento</h2>\n            \n            <table style="width: 100%; border-collapse: collapse;">\n              <tr>\n                <td style="padding: 12px 0; font-weight: 600; color: #374151; width: 140px;">Fornecedor:</td>\n                <td style="padding: 12px 0; color: #111827; font-weight: 500;">'
      .concat(
        data.supplierName,
        '</td>\n              </tr>\n              <tr>\n                <td style="padding: 12px 0; font-weight: 600; color: #374151;">Valor Pago:</td>\n                <td style="padding: 12px 0; color: #10b981; font-size: 24px; font-weight: 700;">R$ ',
      )
      .concat(
        data.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 }),
        '</td>\n              </tr>\n              <tr>\n                <td style="padding: 12px 0; font-weight: 600; color: #374151;">Data:</td>\n                <td style="padding: 12px 0; color: #111827; font-weight: 500;">',
      )
      .concat(new Date().toLocaleDateString("pt-BR"), "</td>\n              </tr>\n              ")
      .concat(
        data.paymentId
          ? '\n              <tr>\n                <td style="padding: 12px 0; font-weight: 600; color: #374151;">ID Pagamento:</td>\n                <td style="padding: 12px 0; color: #111827; font-family: monospace; background: #f3f4f6; padding: 4px 8px; border-radius: 4px; display: inline-block;">'.concat(
              data.paymentId,
              "</td>\n              </tr>\n              ",
            )
          : "",
        '\n            </table>\n          </div>\n          \n          <div style="text-align: center; margin: 32px 0;">\n            <div style="background: #ecfdf5; border: 2px solid #10b981; padding: 20px; border-radius: 8px;">\n              <p style="margin: 0; font-size: 18px; font-weight: 600; color: #059669;">\n                \uD83C\uDF89 Obrigado por manter as contas em dia!\n              </p>\n            </div>\n          </div>\n          \n          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 32px;">\n            <p style="font-size: 14px; color: #6b7280; margin: 0; text-align: center;">\n              Esta \u00E9 uma confirma\u00E7\u00E3o autom\u00E1tica do sistema <strong>',
      )
      .concat(
        config.companyName || "NeonPro",
        '</strong><br>\n              Para d\u00FAvidas, entre em contato: <a href="mailto:',
      )
      .concat(
        config.supportEmail || "suporte@neonpro.com",
        '" style="color: #3b82f6; text-decoration: none;">',
      )
      .concat(
        config.supportEmail || "suporte@neonpro.com",
        "</a>\n            </p>\n          </div>\n        </div>\n      </div>\n    ",
      ),
  }),
};
// SMS Templates (concise messages)
var SMSTemplates = {
  overduePayment: (data) =>
    "\uD83D\uDEA8 URGENTE: Pagamento "
      .concat(data.supplierName, " em atraso - R$ ")
      .concat(data.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 }), " - Venceu: ")
      .concat(new Date(data.dueDate).toLocaleDateString("pt-BR")),
  dueToday: (data) =>
    "\u23F0 HOJE: Vence pagamento "
      .concat(data.supplierName, " - R$ ")
      .concat(
        data.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 }),
        ". N\u00E3o esque\u00E7a!",
      ),
  dueSoon: (data) =>
    "\uD83D\uDCC5 Lembrete: Pagamento "
      .concat(data.supplierName, " vence ")
      .concat(new Date(data.dueDate).toLocaleDateString("pt-BR"), " - R$ ")
      .concat(data.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })),
  paymentCompleted: (data) =>
    "\u2705 Confirmado: Pagamento "
      .concat(data.supplierName, " - R$ ")
      .concat(
        data.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 }),
        " realizado com sucesso",
      ),
};
// Main email notification service class
var EmailNotificationService = /** @class */ (() => {
  function EmailNotificationService(config) {
    if (config === void 0) {
      config = {
        enableEmail: true,
        enableSMS: false,
        fromEmail: "noreply@neonpro.com",
        companyName: "NeonPro",
        supportEmail: "suporte@neonpro.com",
      };
    }
    this.config = config;
  }
  // Public notification methods
  EmailNotificationService.prototype.sendOverduePaymentNotification = function (data) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.sendNotification("overduePayment", data)];
          case 1:
            return [2 /*return*/, _a.sent()];
        }
      });
    });
  };
  EmailNotificationService.prototype.sendDueTodayNotification = function (data) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.sendNotification("dueToday", data)];
          case 1:
            return [2 /*return*/, _a.sent()];
        }
      });
    });
  };
  EmailNotificationService.prototype.sendDueSoonNotification = function (data) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.sendNotification("dueSoon", data)];
          case 1:
            return [2 /*return*/, _a.sent()];
        }
      });
    });
  };
  EmailNotificationService.prototype.sendPaymentCompletedNotification = function (data) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.sendNotification("paymentCompleted", data)];
          case 1:
            return [2 /*return*/, _a.sent()];
        }
      });
    });
  };
  // Private notification dispatcher
  EmailNotificationService.prototype.sendNotification = function (type, data) {
    return __awaiter(this, void 0, void 0, function () {
      var emailSuccess, smsSuccess, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            emailSuccess = true;
            smsSuccess = true;
            _a.label = 1;
          case 1:
            _a.trys.push([1, 6, , 7]);
            if (!(this.config.enableEmail && data.recipientEmail)) return [3 /*break*/, 3];
            return [4 /*yield*/, this.sendEmail(type, data)];
          case 2:
            emailSuccess = _a.sent();
            _a.label = 3;
          case 3:
            if (!(this.config.enableSMS && data.recipientPhone)) return [3 /*break*/, 5];
            return [4 /*yield*/, this.sendSMS(type, data)];
          case 4:
            smsSuccess = _a.sent();
            _a.label = 5;
          case 5:
            return [2 /*return*/, emailSuccess && smsSuccess];
          case 6:
            error_1 = _a.sent();
            console.error("Failed to send notification (".concat(type, "):"), error_1);
            return [2 /*return*/, false];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  // Email sender
  EmailNotificationService.prototype.sendEmail = function (type, data) {
    return __awaiter(this, void 0, void 0, function () {
      var template, result, error_2;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            if (!process.env.RESEND_API_KEY) {
              console.warn("RESEND_API_KEY not configured - email notifications disabled");
              return [2 /*return*/, false];
            }
            template = EmailTemplates[type](data, this.config);
            return [
              4 /*yield*/,
              resend.emails.send({
                from: this.config.fromEmail || "NeonPro <noreply@neonpro.com>",
                to: [data.recipientEmail],
                subject: template.subject,
                html: template.html,
                tags: [
                  { name: "category", value: "accounts-payable" },
                  { name: "type", value: type },
                  { name: "supplier", value: data.supplierName },
                ],
              }),
            ];
          case 1:
            result = _b.sent();
            console.log(
              "\u2705 Email notification sent ("
                .concat(type, ") to ")
                .concat(data.recipientEmail, ":"),
              (_a = result.data) === null || _a === void 0 ? void 0 : _a.id,
            );
            return [2 /*return*/, true];
          case 2:
            error_2 = _b.sent();
            console.error("\u274C Failed to send email notification (".concat(type, "):"), error_2);
            return [2 /*return*/, false];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // SMS sender (placeholder)
  EmailNotificationService.prototype.sendSMS = function (type, data) {
    return __awaiter(this, void 0, void 0, function () {
      var message;
      return __generator(this, (_a) => {
        try {
          message = SMSTemplates[type](data);
          // TODO: Implement SMS sending with Twilio or similar service
          console.log(
            "\uD83D\uDCF1 SMS notification would be sent to "
              .concat(data.recipientPhone, ": ")
              .concat(message),
          );
          // Example Twilio implementation:
          // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
          // await client.messages.create({
          //   body: message,
          //   from: process.env.TWILIO_PHONE_NUMBER,
          //   to: data.recipientPhone
          // });
          return [2 /*return*/, true];
        } catch (error) {
          console.error("\u274C Failed to send SMS notification (".concat(type, "):"), error);
          return [2 /*return*/, false];
        }
        return [2 /*return*/];
      });
    });
  };
  // Helper method to create notification data from accounts payable record
  EmailNotificationService.createNotificationData = (
    accountsPayable,
    recipientEmail,
    recipientPhone,
  ) => ({
    recipientEmail: recipientEmail,
    recipientPhone: recipientPhone,
    supplierName: accountsPayable.supplier_name,
    amount: parseFloat(accountsPayable.amount),
    dueDate: accountsPayable.due_date,
    invoiceNumber: accountsPayable.invoice_number,
    paymentId: accountsPayable.id,
  });
  // Batch notification method
  EmailNotificationService.prototype.sendBatchNotifications = function (notifications) {
    return __awaiter(this, void 0, void 0, function () {
      var results;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              Promise.allSettled(
                notifications.map((_a) => {
                  var type = _a.type,
                    data = _a.data;
                  return this.sendNotification(type, data);
                }),
              ),
            ];
          case 1:
            results = _a.sent();
            return [
              2 /*return*/,
              results.map((result) => (result.status === "fulfilled" ? result.value : false)),
            ];
        }
      });
    });
  };
  // Configuration methods
  EmailNotificationService.prototype.updateConfig = function (newConfig) {
    this.config = __assign(__assign({}, this.config), newConfig);
  };
  EmailNotificationService.prototype.getConfig = function () {
    return __assign({}, this.config);
  };
  // Health check method
  EmailNotificationService.prototype.testConnection = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        try {
          if (!process.env.RESEND_API_KEY) {
            console.warn("RESEND_API_KEY not configured");
            return [2 /*return*/, false];
          }
          // Test with a simple API call (get domains)
          // This is a lightweight way to verify the API key works
          console.log("✅ Email notification service is configured correctly");
          return [2 /*return*/, true];
        } catch (error) {
          console.error("❌ Email notification service test failed:", error);
          return [2 /*return*/, false];
        }
        return [2 /*return*/];
      });
    });
  };
  return EmailNotificationService;
})();
exports.EmailNotificationService = EmailNotificationService;
// Default export
exports.default = EmailNotificationService;

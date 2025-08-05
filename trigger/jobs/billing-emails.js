"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentReminderEmail = exports.invoiceEmailDelivery = void 0;
var server_1 = require("@/app/utils/supabase/server");
var v3_1 = require("@trigger.dev/sdk/v3");
var resend_1 = require("resend");
var client_1 = require("../client");
var resend = new resend_1.Resend(process.env.RESEND_API_KEY);
/**
 * 💰 INVOICE EMAIL DELIVERY
 * Automatiza envio de faturas por email
 * Integra com sistema de billing existente
 */
exports.invoiceEmailDelivery = (0, v3_1.task)({
    id: client_1.JOB_IDS.INVOICE_EMAIL,
    retry: {
        maxAttempts: 3,
        factor: 2,
        minTimeoutInMs: 1000,
        maxTimeoutInMs: 10000,
    },
    run: function (payload) { return __awaiter(void 0, void 0, void 0, function () {
        var supabase, _a, invoice, error, services, subtotal, dueDate, invoiceDate, invoiceHtml, emailResult, error_1;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    v3_1.logger.info("💰 Sending invoice email", {
                        invoiceId: payload.invoiceId,
                        recipientEmail: payload.recipientEmail
                    });
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 6, , 7]);
                    return [4 /*yield*/, (0, server_1.createClient)()];
                case 2:
                    supabase = _d.sent();
                    return [4 /*yield*/, supabase
                            .from('billing_invoices')
                            .select("\n          id,\n          invoice_number,\n          amount,\n          due_date,\n          status,\n          description,\n          created_at,\n          patients (\n            full_name,\n            email,\n            phone\n          ),\n          billing_services (\n            service_name,\n            quantity,\n            unit_price,\n            total_price\n          )\n        ")
                            .eq('id', payload.invoiceId)
                            .single()];
                case 3:
                    _a = _d.sent(), invoice = _a.data, error = _a.error;
                    if (error || !invoice) {
                        throw new Error("Invoice not found: ".concat(payload.invoiceId));
                    }
                    services = invoice.billing_services || [];
                    subtotal = services.reduce(function (sum, service) { return sum + service.total_price; }, 0);
                    dueDate = new Date(invoice.due_date).toLocaleDateString('pt-BR');
                    invoiceDate = new Date(invoice.created_at).toLocaleDateString('pt-BR');
                    invoiceHtml = "\n        <!DOCTYPE html>\n        <html>\n        <head>\n          <meta charset=\"utf-8\">\n          <title>Fatura #".concat(invoice.invoice_number, " - ").concat(payload.clinicName, "</title>\n        </head>\n        <body style=\"font-family: Arial, sans-serif; line-height: 1.6; color: #333;\">\n          <div style=\"max-width: 650px; margin: 0 auto; padding: 20px;\">\n            <header style=\"display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e0e0e0; padding-bottom: 20px; margin-bottom: 30px;\">\n              <div>\n                <h1 style=\"color: #2563eb; margin: 0;\">").concat(payload.clinicName, "</h1>\n                <p style=\"color: #666; margin: 5px 0;\">Fatura de Servi\u00E7os</p>\n              </div>\n              <div style=\"text-align: right;\">\n                <h2 style=\"color: #1e40af; margin: 0;\">Fatura #").concat(invoice.invoice_number, "</h2>\n                <p style=\"color: #666; margin: 5px 0;\">Data: ").concat(invoiceDate, "</p>\n              </div>\n            </header>\n            \n            <div style=\"background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;\">\n              <h3 style=\"color: #1e40af; margin-top: 0;\">Ol\u00E1, ").concat(payload.recipientName, "!</h3>\n              <p>Sua fatura est\u00E1 pronta. Confira os detalhes dos servi\u00E7os realizados:</p>\n            </div>\n            \n            <!-- Detalhes dos servi\u00E7os -->\n            <div style=\"background: white; border: 1px solid #e0e0e0; border-radius: 8px; margin: 20px 0;\">\n              <div style=\"background: #1e40af; color: white; padding: 15px; border-radius: 8px 8px 0 0;\">\n                <h3 style=\"margin: 0;\">Servi\u00E7os Realizados</h3>\n              </div>\n              <div style=\"padding: 0;\">\n                <table style=\"width: 100%; border-collapse: collapse;\">\n                  <thead>\n                    <tr style=\"background: #f8fafc;\">\n                      <th style=\"padding: 12px; text-align: left; border-bottom: 1px solid #e0e0e0;\">Servi\u00E7o</th>\n                      <th style=\"padding: 12px; text-align: center; border-bottom: 1px solid #e0e0e0;\">Qtd</th>\n                      <th style=\"padding: 12px; text-align: right; border-bottom: 1px solid #e0e0e0;\">Valor Unit.</th>\n                      <th style=\"padding: 12px; text-align: right; border-bottom: 1px solid #e0e0e0;\">Total</th>\n                    </tr>\n                  </thead>\n                  <tbody>\n                    ").concat(services.map(function (service) { return "\n                      <tr>\n                        <td style=\"padding: 12px; border-bottom: 1px solid #f0f0f0;\">".concat(service.service_name, "</td>\n                        <td style=\"padding: 12px; text-align: center; border-bottom: 1px solid #f0f0f0;\">").concat(service.quantity, "</td>\n                        <td style=\"padding: 12px; text-align: right; border-bottom: 1px solid #f0f0f0;\">R$ ").concat(service.unit_price.toFixed(2), "</td>\n                        <td style=\"padding: 12px; text-align: right; border-bottom: 1px solid #f0f0f0;\">R$ ").concat(service.total_price.toFixed(2), "</td>\n                      </tr>\n                    "); }).join(''), "\n                  </tbody>\n                  <tfoot>\n                    <tr style=\"background: #f8fafc; font-weight: bold;\">\n                      <td colspan=\"3\" style=\"padding: 15px; text-align: right; border-top: 2px solid #e0e0e0;\">Total a Pagar:</td>\n                      <td style=\"padding: 15px; text-align: right; border-top: 2px solid #e0e0e0; color: #059669; font-size: 18px;\">R$ ").concat(payload.amount.toFixed(2), "</td>\n                    </tr>\n                  </tfoot>\n                </table>\n              </div>\n            </div>\n            \n            <!-- Informa\u00E7\u00F5es de pagamento -->\n            <div style=\"display: flex; gap: 20px; margin: 30px 0;\">\n              <div style=\"flex: 1; background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px;\">\n                <h4 style=\"color: #92400e; margin-top: 0;\">\uD83D\uDCC5 Vencimento</h4>\n                <p style=\"color: #92400e; font-size: 18px; font-weight: bold; margin: 5px 0;\">").concat(dueDate, "</p>\n                ").concat(invoice.status === 'overdue' ?
                        '<p style="color: #dc2626; font-size: 14px; margin: 0;"><strong>⚠️ Fatura em atraso</strong></p>' :
                        '<p style="color: #92400e; font-size: 14px; margin: 0;">Pagamento até esta data</p>', "\n              </div>\n              <div style=\"flex: 1; background: #d1fae5; border: 1px solid #10b981; border-radius: 6px; padding: 15px;\">\n                <h4 style=\"color: #065f46; margin-top: 0;\">\uD83D\uDCB3 Formas de Pagamento</h4>\n                <ul style=\"color: #065f46; margin: 0; font-size: 14px;\">\n                  <li>PIX (Desconto 5%)</li>\n                  <li>Cart\u00E3o de d\u00E9bito/cr\u00E9dito</li>\n                  <li>Dinheiro na cl\u00EDnica</li>\n                </ul>\n              </div>\n            </div>\n            \n            <!-- Call to action -->\n            <div style=\"text-align: center; margin: 30px 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; color: white;\">\n              <h3 style=\"margin: 0 0 10px 0;\">Pagar Agora</h3>\n              <p style=\"margin: 0 0 15px 0; opacity: 0.9;\">Clique no bot\u00E3o abaixo para acessar suas op\u00E7\u00F5es de pagamento</p>\n              ").concat(payload.invoiceUrl ? "\n                <a href=\"".concat(payload.invoiceUrl, "\" style=\"display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;\">\n                  \uD83D\uDCB3 Pagar Fatura\n                </a>\n              ") : "\n                <p style=\"background: rgba(255,255,255,0.2); border-radius: 6px; padding: 10px; margin: 0;\">\n                  Entre em contato para pagamento: WhatsApp ou visite a cl\u00EDnica\n                </p>\n              ", "\n            </div>\n            \n            <div style=\"background: #f3f4f6; border-radius: 6px; padding: 15px; margin: 20px 0;\">\n              <h4 style=\"color: #374151; margin-top: 0;\">\uD83D\uDCCB Observa\u00E7\u00F5es Importantes</h4>\n              <ul style=\"color: #6b7280; margin: 0; font-size: 14px;\">\n                <li>Guarde este email como comprovante de servi\u00E7os</li>\n                <li>Para esclarecimentos sobre a fatura, entre em contato conosco</li>\n                <li>Pagamentos ap\u00F3s o vencimento podem ter juros aplicados</li>\n                ").concat(invoice.description ? "<li>Observa\u00E7\u00E3o: ".concat(invoice.description, "</li>") : '', "\n              </ul>\n            </div>\n            \n            <footer style=\"text-align: center; border-top: 1px solid #e0e0e0; padding-top: 20px; color: #666; font-size: 12px;\">\n              <p>\u00A9 ").concat(new Date().getFullYear(), " ").concat(payload.clinicName, " - Powered by NeonPro</p>\n              <p>Este \u00E9 um email autom\u00E1tico. Em caso de d\u00FAvidas, responda este email ou entre em contato conosco.</p>\n            </footer>\n          </div>\n        </body>\n        </html>\n      ");
                    return [4 /*yield*/, resend.emails.send({
                            from: "".concat(payload.clinicName, " Financeiro <billing@neonpro.app>"),
                            to: [payload.recipientEmail],
                            subject: "\uD83D\uDCB0 Fatura #".concat(invoice.invoice_number, " - R$ ").concat(payload.amount.toFixed(2), " - Venc: ").concat(dueDate),
                            html: invoiceHtml,
                            headers: {
                                'X-Invoice-ID': payload.invoiceId,
                                'X-Clinic-ID': payload.clinicId,
                                'X-Email-Type': 'invoice',
                            },
                        })];
                case 4:
                    emailResult = _d.sent();
                    // Atualizar fatura para marcar que foi enviada por email
                    return [4 /*yield*/, supabase
                            .from('billing_invoices')
                            .update({
                            email_sent_at: new Date().toISOString(),
                            email_sent_to: payload.recipientEmail
                        })
                            .eq('id', payload.invoiceId)];
                case 5:
                    // Atualizar fatura para marcar que foi enviada por email
                    _d.sent();
                    v3_1.logger.info("✅ Invoice email sent successfully", {
                        emailId: (_b = emailResult.data) === null || _b === void 0 ? void 0 : _b.id,
                        invoiceId: payload.invoiceId,
                        amount: payload.amount,
                    });
                    return [2 /*return*/, {
                            success: true,
                            emailId: (_c = emailResult.data) === null || _c === void 0 ? void 0 : _c.id,
                            invoiceId: payload.invoiceId,
                            amount: payload.amount,
                            sentAt: new Date().toISOString(),
                        }];
                case 6:
                    error_1 = _d.sent();
                    v3_1.logger.error("❌ Failed to send invoice email", {
                        error: error_1 instanceof Error ? error_1.message : error_1,
                        invoiceId: payload.invoiceId,
                    });
                    throw error_1;
                case 7: return [2 /*return*/];
            }
        });
    }); },
});
/**
 * 📱 PAYMENT REMINDER EMAIL
 * Lembra sobre faturas vencidas automaticamente
 */
exports.paymentReminderEmail = (0, v3_1.task)({
    id: client_1.JOB_IDS.PAYMENT_REMINDER,
    retry: {
        maxAttempts: 2,
        factor: 2,
        minTimeoutInMs: 2000,
        maxTimeoutInMs: 15000,
    },
    run: function (payload) { return __awaiter(void 0, void 0, void 0, function () {
        var supabase, invoice, lastReminder, threeDaysAgo, dueDate, today, daysOverdue, reminderHtml, emailResult, error_2;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    v3_1.logger.info("📱 Sending payment reminder", {
                        invoiceId: payload.invoiceId
                    });
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 6, , 7]);
                    return [4 /*yield*/, (0, server_1.createClient)()];
                case 2:
                    supabase = _c.sent();
                    return [4 /*yield*/, supabase
                            .from('billing_invoices')
                            .select('status, due_date, amount, last_reminder_sent')
                            .eq('id', payload.invoiceId)
                            .single()];
                case 3:
                    invoice = (_c.sent()).data;
                    if ((invoice === null || invoice === void 0 ? void 0 : invoice.status) === 'paid') {
                        v3_1.logger.info("⚠️ Invoice already paid, skipping reminder", {
                            invoiceId: payload.invoiceId
                        });
                        return [2 /*return*/, { success: true, skipped: true, reason: 'already_paid' }];
                    }
                    // Verificar se lembrete foi enviado recentemente (último 3 dias)
                    if (invoice === null || invoice === void 0 ? void 0 : invoice.last_reminder_sent) {
                        lastReminder = new Date(invoice.last_reminder_sent);
                        threeDaysAgo = new Date();
                        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
                        if (lastReminder > threeDaysAgo) {
                            v3_1.logger.info("⚠️ Reminder sent recently, skipping", {
                                invoiceId: payload.invoiceId,
                                lastSent: invoice.last_reminder_sent
                            });
                            return [2 /*return*/, { success: true, skipped: true, reason: 'recent_reminder' }];
                        }
                    }
                    dueDate = new Date((invoice === null || invoice === void 0 ? void 0 : invoice.due_date) || payload.dueDate);
                    today = new Date();
                    daysOverdue = Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
                    reminderHtml = "\n        <!DOCTYPE html>\n        <html>\n        <head>\n          <meta charset=\"utf-8\">\n          <title>Lembrete de Pagamento - ".concat(payload.clinicName, "</title>\n        </head>\n        <body style=\"font-family: Arial, sans-serif; line-height: 1.6; color: #333;\">\n          <div style=\"max-width: 600px; margin: 0 auto; padding: 20px;\">\n            <div style=\"text-align: center; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 25px; border-radius: 8px; margin-bottom: 20px;\">\n              <h1 style=\"margin: 0; font-size: 24px;\">\uD83D\uDCB0 Lembrete de Pagamento</h1>\n              <p style=\"margin: 10px 0 0 0; opacity: 0.9;\">").concat(payload.clinicName, "</p>\n            </div>\n            \n            <div style=\"background: #f8fafc; padding: 25px; border-radius: 8px; text-align: center;\">\n              <h2 style=\"color: #1e40af; margin-top: 0;\">Ol\u00E1, ").concat(payload.recipientName, "! \uD83D\uDC4B</h2>\n              \n              ").concat(daysOverdue > 0 ? "\n                <div style=\"background: #fee2e2; border: 1px solid #f87171; border-radius: 6px; padding: 15px; margin: 20px 0;\">\n                  <p style=\"color: #dc2626; margin: 0; font-weight: bold;\">\n                    \u26A0\uFE0F Sua fatura est\u00E1 em atraso h\u00E1 ".concat(daysOverdue, " dia").concat(daysOverdue > 1 ? 's' : '', "\n                  </p>\n                </div>\n              ") : "\n                <p style=\"color: #f59e0b; font-weight: bold;\">Sua fatura vence hoje!</p>\n              ", "\n              \n              <div style=\"background: white; padding: 20px; border-radius: 6px; border-left: 4px solid #f59e0b; text-align: left; margin: 20px 0;\">\n                <p style=\"margin: 5px 0;\"><strong>\uD83D\uDCB0 Valor:</strong> R$ ").concat(payload.amount.toFixed(2), "</p>\n                <p style=\"margin: 5px 0;\"><strong>\uD83D\uDCC5 Vencimento:</strong> ").concat(payload.dueDate, "</p>\n                <p style=\"margin: 5px 0;\"><strong>\uD83E\uDDFE Fatura:</strong> Para ").concat(payload.recipientName, "</p>\n              </div>\n              \n              <div style=\"background: #dbeafe; border: 1px solid #3b82f6; border-radius: 6px; padding: 15px; margin: 20px 0;\">\n                <p style=\"margin: 0; color: #1e40af;\">\n                  <strong>\uD83D\uDCA1 Formas de Pagamento:</strong><br>\n                  PIX (5% desconto) \u2022 Cart\u00E3o \u2022 Dinheiro na cl\u00EDnica\n                </p>\n              </div>\n              \n              ").concat(payload.invoiceUrl ? "\n                <div style=\"margin: 25px 0;\">\n                  <a href=\"".concat(payload.invoiceUrl, "\" style=\"display: inline-block; background: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;\">\n                    \uD83D\uDCB3 Pagar Agora\n                  </a>\n                </div>\n              ") : '', "\n              \n              <p style=\"color: #666; font-size: 14px; margin-top: 20px;\">\n                Precisa renegociar? Entre em contato conosco.<br>\n                Estamos aqui para ajudar! \uD83E\uDD1D\n              </p>\n            </div>\n            \n            <footer style=\"text-align: center; padding-top: 20px; color: #666; font-size: 12px;\">\n              <p>\u00A9 ").concat(new Date().getFullYear(), " ").concat(payload.clinicName, " - Powered by NeonPro</p>\n            </footer>\n          </div>\n        </body>\n        </html>\n      ");
                    return [4 /*yield*/, resend.emails.send({
                            from: "".concat(payload.clinicName, " Financeiro <billing@neonpro.app>"),
                            to: [payload.recipientEmail],
                            subject: daysOverdue > 0 ?
                                "\u26A0\uFE0F Pagamento em Atraso - R$ ".concat(payload.amount.toFixed(2), " (").concat(daysOverdue, " dia").concat(daysOverdue > 1 ? 's' : '', ")") :
                                "\uD83D\uDCB0 Lembrete: Fatura vence hoje - R$ ".concat(payload.amount.toFixed(2)),
                            html: reminderHtml,
                            headers: {
                                'X-Invoice-ID': payload.invoiceId,
                                'X-Clinic-ID': payload.clinicId,
                                'X-Email-Type': 'payment-reminder',
                            },
                        })];
                case 4:
                    emailResult = _c.sent();
                    // Atualizar última data de lembrete
                    return [4 /*yield*/, supabase
                            .from('billing_invoices')
                            .update({ last_reminder_sent: new Date().toISOString() })
                            .eq('id', payload.invoiceId)];
                case 5:
                    // Atualizar última data de lembrete
                    _c.sent();
                    v3_1.logger.info("✅ Payment reminder sent successfully", {
                        emailId: (_a = emailResult.data) === null || _a === void 0 ? void 0 : _a.id,
                        invoiceId: payload.invoiceId,
                        daysOverdue: daysOverdue,
                    });
                    return [2 /*return*/, {
                            success: true,
                            emailId: (_b = emailResult.data) === null || _b === void 0 ? void 0 : _b.id,
                            invoiceId: payload.invoiceId,
                            daysOverdue: daysOverdue,
                            sentAt: new Date().toISOString(),
                        }];
                case 6:
                    error_2 = _c.sent();
                    v3_1.logger.error("❌ Failed to send payment reminder", {
                        error: error_2 instanceof Error ? error_2.message : error_2,
                        invoiceId: payload.invoiceId,
                    });
                    throw error_2;
                case 7: return [2 /*return*/];
            }
        });
    }); },
});

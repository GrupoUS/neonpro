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
          step(generator.throw(value));
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
      (g.throw = verb(1)),
      (g.return = verb(2)),
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
                  ? y.return
                  : op[0]
                    ? y.throw || ((t = y.return) && t.call(y), 0)
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
exports.appointmentReminderEmail = exports.appointmentConfirmationEmail = void 0;
var server_1 = require("@/app/utils/supabase/server");
var v3_1 = require("@trigger.dev/sdk/v3");
var resend_1 = require("resend");
var client_1 = require("../client");
var resend = new resend_1.Resend(process.env.RESEND_API_KEY);
/**
 * 📧 APPOINTMENT CONFIRMATION EMAIL
 * Automatiza envio de confirmação de consulta
 * Integra com o sistema de appointments existente
 */
exports.appointmentConfirmationEmail = (0, v3_1.task)({
  id: client_1.JOB_IDS.APPOINTMENT_CONFIRMATION,
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 10000,
  },
  run: (payload) =>
    __awaiter(void 0, void 0, void 0, function () {
      var supabase, _a, appointment, error, emailHtml, emailResult, updateError, error_1;
      var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
      return __generator(this, (_q) => {
        switch (_q.label) {
          case 0:
            v3_1.logger.info("🏥 Sending appointment confirmation", {
              appointmentId: payload.appointmentId,
              recipientEmail: payload.recipientEmail,
            });
            _q.label = 1;
          case 1:
            _q.trys.push([1, 6, undefined, 7]);
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 2:
            supabase = _q.sent();
            return [
              4 /*yield*/,
              supabase
                .from("appointments")
                .select(
                  "\n          id,\n          appointment_date,\n          appointment_time,\n          status,\n          notes,\n          patients (\n            full_name,\n            email,\n            phone\n          ),\n          professionals (\n            name,\n            specialty\n          ),\n          service_types (\n            name,\n            duration_minutes,\n            price\n          )\n        ",
                )
                .eq("id", payload.appointmentId)
                .single(),
            ];
          case 3:
            (_a = _q.sent()), (appointment = _a.data), (error = _a.error);
            if (error || !appointment) {
              throw new Error("Appointment not found: ".concat(payload.appointmentId));
            }
            emailHtml =
              '\n        <!DOCTYPE html>\n        <html>\n        <head>\n          <meta charset="utf-8">\n          <title>Confirma\u00E7\u00E3o de Consulta - '
                .concat(
                  payload.clinicName,
                  '</title>\n        </head>\n        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">\n          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">\n            <header style="text-align: center; border-bottom: 2px solid #e0e0e0; padding-bottom: 20px; margin-bottom: 30px;">\n              <h1 style="color: #2563eb; margin: 0;">',
                )
                .concat(
                  payload.clinicName,
                  '</h1>\n              <p style="color: #666; margin: 5px 0;">Consulta Confirmada \u2728</p>\n            </header>\n            \n            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">\n              <h2 style="color: #1e40af; margin-top: 0;">Ol\u00E1, ',
                )
                .concat(
                  payload.recipientName,
                  '!</h2>\n              <p>Sua consulta foi confirmada com sucesso. Aqui est\u00E3o os detalhes:</p>\n              \n              <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #10b981;">\n                <p><strong>\uD83D\uDCC5 Data:</strong> ',
                )
                .concat(
                  new Date(appointment.appointment_date).toLocaleDateString("pt-BR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }),
                  "</p>\n                <p><strong>\uD83D\uDD50 Hor\u00E1rio:</strong> ",
                )
                .concat(
                  appointment.appointment_time,
                  "</p>\n                <p><strong>\uD83D\uDC68\u200D\u2695\uFE0F Profissional:</strong> ",
                )
                .concat(
                  Array.isArray(appointment.professionals)
                    ? (_b = appointment.professionals[0]) === null || _b === void 0
                      ? void 0
                      : _b.name
                    : (_c = appointment.professionals) === null || _c === void 0
                      ? void 0
                      : _c.name,
                  "</p>\n                <p><strong>\uD83D\uDC85 Servi\u00E7o:</strong> ",
                )
                .concat(
                  Array.isArray(appointment.service_types)
                    ? (_d = appointment.service_types[0]) === null || _d === void 0
                      ? void 0
                      : _d.name
                    : (_e = appointment.service_types) === null || _e === void 0
                      ? void 0
                      : _e.name,
                  "</p>\n                <p><strong>\u23F1\uFE0F Dura\u00E7\u00E3o:</strong> ",
                )
                .concat(
                  Array.isArray(appointment.service_types)
                    ? (_f = appointment.service_types[0]) === null || _f === void 0
                      ? void 0
                      : _f.duration_minutes
                    : (_g = appointment.service_types) === null || _g === void 0
                      ? void 0
                      : _g.duration_minutes,
                  " minutos</p>\n                ",
                )
                .concat(
                  (
                    Array.isArray(appointment.service_types)
                      ? (_h = appointment.service_types[0]) === null || _h === void 0
                        ? void 0
                        : _h.price
                      : (_j = appointment.service_types) === null || _j === void 0
                        ? void 0
                        : _j.price
                  )
                    ? "<p><strong>\uD83D\uDCB0 Valor:</strong> R$ ".concat(
                        (_m = Array.isArray(appointment.service_types)
                          ? (_k = appointment.service_types[0]) === null || _k === void 0
                            ? void 0
                            : _k.price
                          : (_l = appointment.service_types) === null || _l === void 0
                            ? void 0
                            : _l.price) === null || _m === void 0
                          ? void 0
                          : _m.toFixed(2),
                        "</p>",
                      )
                    : "",
                  '\n              </div>\n            </div>\n            \n            <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 20px 0;">\n              <h3 style="color: #92400e; margin-top: 0;">\uD83D\uDCDD Lembrete Importante</h3>\n              <ul style="color: #92400e; margin: 0;">\n                <li>Chegue 10 minutos antes do hor\u00E1rio marcado</li>\n                <li>Traga um documento de identidade</li>\n                <li>Para reagendamentos, entre em contato conosco</li>\n                ',
                )
                .concat(
                  appointment.notes
                    ? "<li>Observa\u00E7\u00E3o especial: ".concat(appointment.notes, "</li>")
                    : "",
                  '\n              </ul>\n            </div>\n            \n            <div style="text-align: center; margin: 30px 0;">\n              <p>Precisa reagendar ou tem alguma d\u00FAvida?</p>\n              <p style="color: #666; font-size: 14px;">\n                Entre em contato conosco<br>\n                \uD83D\uDCF1 WhatsApp: Dispon\u00EDvel no seu painel<br>\n                \u2709\uFE0F Email: Responda este email\n              </p>\n            </div>\n            \n            <footer style="text-align: center; border-top: 1px solid #e0e0e0; padding-top: 20px; color: #666; font-size: 12px;">\n              <p>\u00A9 ',
                )
                .concat(new Date().getFullYear(), " ")
                .concat(
                  payload.clinicName,
                  " - Powered by NeonPro</p>\n              <p>Este \u00E9 um email autom\u00E1tico. Voc\u00EA recebeu porque tem uma consulta agendada conosco.</p>\n            </footer>\n          </div>\n        </body>\n        </html>\n      ",
                );
            return [
              4 /*yield*/,
              resend.emails.send({
                from: "".concat(payload.clinicName, " <noreply@neonpro.app>"),
                to: [payload.recipientEmail],
                subject: "\u2728 Consulta Confirmada - "
                  .concat(payload.appointmentDate, " \u00E0s ")
                  .concat(payload.appointmentTime),
                html: emailHtml,
                headers: {
                  "X-Appointment-ID": payload.appointmentId,
                  "X-Clinic-ID": payload.clinicId,
                },
              }),
            ];
          case 4:
            emailResult = _q.sent();
            v3_1.logger.info("✅ Appointment confirmation sent successfully", {
              emailId: (_o = emailResult.data) === null || _o === void 0 ? void 0 : _o.id,
              appointmentId: payload.appointmentId,
              recipientEmail: payload.recipientEmail,
            });
            return [
              4 /*yield*/,
              supabase
                .from("appointments")
                .update({
                  confirmation_sent_at: new Date().toISOString(),
                  status: appointment.status === "pending" ? "confirmed" : appointment.status,
                })
                .eq("id", payload.appointmentId),
            ];
          case 5:
            updateError = _q.sent().error;
            if (updateError) {
              v3_1.logger.warn("⚠️ Failed to update appointment confirmation status", {
                error: updateError,
                appointmentId: payload.appointmentId,
              });
            }
            return [
              2 /*return*/,
              {
                success: true,
                emailId: (_p = emailResult.data) === null || _p === void 0 ? void 0 : _p.id,
                appointmentId: payload.appointmentId,
                sentAt: new Date().toISOString(),
              },
            ];
          case 6:
            error_1 = _q.sent();
            v3_1.logger.error("❌ Failed to send appointment confirmation", {
              error: error_1 instanceof Error ? error_1.message : error_1,
              appointmentId: payload.appointmentId,
              recipientEmail: payload.recipientEmail,
            });
            throw error_1;
          case 7:
            return [2 /*return*/];
        }
      });
    }),
});
/**
 * 📱 APPOINTMENT REMINDER EMAIL (24h antes)
 * Reduz no-shows automaticamente
 */
exports.appointmentReminderEmail = (0, v3_1.task)({
  id: client_1.JOB_IDS.APPOINTMENT_REMINDER,
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 10000,
  },
  run: (payload) =>
    __awaiter(void 0, void 0, void 0, function () {
      var supabase, appointment, reminderHtml, emailResult, error_2;
      var _a, _b;
      return __generator(this, (_c) => {
        switch (_c.label) {
          case 0:
            v3_1.logger.info("⏰ Sending appointment reminder", {
              appointmentId: payload.appointmentId,
            });
            _c.label = 1;
          case 1:
            _c.trys.push([1, 6, undefined, 7]);
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 2:
            supabase = _c.sent();
            return [
              4 /*yield*/,
              supabase
                .from("appointments")
                .select("reminder_sent_at, status, appointment_date, appointment_time")
                .eq("id", payload.appointmentId)
                .single(),
            ];
          case 3:
            appointment = _c.sent().data;
            if (
              appointment === null || appointment === void 0 ? void 0 : appointment.reminder_sent_at
            ) {
              v3_1.logger.info("⚠️ Reminder already sent, skipping", {
                appointmentId: payload.appointmentId,
              });
              return [2 /*return*/, { success: true, skipped: true, reason: "already_sent" }];
            }
            if (
              (appointment === null || appointment === void 0 ? void 0 : appointment.status) ===
              "cancelled"
            ) {
              v3_1.logger.info("⚠️ Appointment cancelled, skipping reminder", {
                appointmentId: payload.appointmentId,
              });
              return [2 /*return*/, { success: true, skipped: true, reason: "cancelled" }];
            }
            reminderHtml =
              '\n        <!DOCTYPE html>\n        <html>\n        <head>\n          <meta charset="utf-8">\n          <title>Lembrete de Consulta - '
                .concat(
                  payload.clinicName,
                  '</title>\n        </head>\n        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">\n          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">\n            <div style="text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px; margin-bottom: 20px;">\n              <h1 style="margin: 0; font-size: 24px;">\u23F0 Lembrete de Consulta</h1>\n              <p style="margin: 10px 0 0 0; opacity: 0.9;">',
                )
                .concat(
                  payload.clinicName,
                  '</p>\n            </div>\n            \n            <div style="background: #f8fafc; padding: 25px; border-radius: 8px; text-align: center;">\n              <h2 style="color: #1e40af; margin-top: 0;">Ol\u00E1, ',
                )
                .concat(
                  payload.recipientName,
                  '! \uD83D\uDC4B</h2>\n              <p style="font-size: 16px; margin-bottom: 20px;">Sua consulta \u00E9 <strong>amanh\u00E3</strong>!</p>\n              \n              <div style="background: white; padding: 20px; border-radius: 6px; border-left: 4px solid #10b981; text-align: left; margin: 20px 0;">\n                <p style="margin: 5px 0;"><strong>\uD83D\uDCC5 Data:</strong> ',
                )
                .concat(
                  payload.appointmentDate,
                  '</p>\n                <p style="margin: 5px 0;"><strong>\uD83D\uDD50 Hor\u00E1rio:</strong> ',
                )
                .concat(
                  payload.appointmentTime,
                  '</p>\n                <p style="margin: 5px 0;"><strong>\uD83D\uDC68\u200D\u2695\uFE0F Profissional:</strong> ',
                )
                .concat(
                  payload.professionalName,
                  '</p>\n                <p style="margin: 5px 0;"><strong>\uD83D\uDC85 Servi\u00E7o:</strong> ',
                )
                .concat(
                  payload.serviceName,
                  '</p>\n              </div>\n              \n              <div style="background: #dbeafe; border: 1px solid #3b82f6; border-radius: 6px; padding: 15px; margin: 20px 0;">\n                <p style="margin: 0; color: #1e40af;"><strong>\uD83D\uDCA1 Dica:</strong> Chegue 10 minutos antes para um atendimento mais tranquilo!</p>\n              </div>\n              \n              <p style="color: #666; font-size: 14px; margin-top: 20px;">\n                Precisa reagendar? Entre em contato conosco o quanto antes.<br>\n                Estamos ansiosos para atend\u00EA-la! \u2728\n              </p>\n            </div>\n            \n            <footer style="text-align: center; padding-top: 20px; color: #666; font-size: 12px;">\n              <p>\u00A9 ',
                )
                .concat(new Date().getFullYear(), " ")
                .concat(
                  payload.clinicName,
                  " - Powered by NeonPro</p>\n            </footer>\n          </div>\n        </body>\n        </html>\n      ",
                );
            return [
              4 /*yield*/,
              resend.emails.send({
                from: "".concat(payload.clinicName, " <noreply@neonpro.app>"),
                to: [payload.recipientEmail],
                subject: "\u23F0 Lembrete: Sua consulta \u00E9 amanh\u00E3 - ".concat(
                  payload.appointmentTime,
                ),
                html: reminderHtml,
                headers: {
                  "X-Appointment-ID": payload.appointmentId,
                  "X-Clinic-ID": payload.clinicId,
                  "X-Email-Type": "reminder",
                },
              }),
            ];
          case 4:
            emailResult = _c.sent();
            // Marcar lembrete como enviado
            return [
              4 /*yield*/,
              supabase
                .from("appointments")
                .update({ reminder_sent_at: new Date().toISOString() })
                .eq("id", payload.appointmentId),
            ];
          case 5:
            // Marcar lembrete como enviado
            _c.sent();
            v3_1.logger.info("✅ Appointment reminder sent successfully", {
              emailId: (_a = emailResult.data) === null || _a === void 0 ? void 0 : _a.id,
              appointmentId: payload.appointmentId,
            });
            return [
              2 /*return*/,
              {
                success: true,
                emailId: (_b = emailResult.data) === null || _b === void 0 ? void 0 : _b.id,
                appointmentId: payload.appointmentId,
                sentAt: new Date().toISOString(),
              },
            ];
          case 6:
            error_2 = _c.sent();
            v3_1.logger.error("❌ Failed to send appointment reminder", {
              error: error_2 instanceof Error ? error_2.message : error_2,
              appointmentId: payload.appointmentId,
            });
            throw error_2;
          case 7:
            return [2 /*return*/];
        }
      });
    }),
});

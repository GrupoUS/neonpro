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
exports.sendAppointmentNotificationEmail = sendAppointmentNotificationEmail;
exports.sendScheduledReminders = sendScheduledReminders;
var resend_1 = require("resend");
var auth_helpers_nextjs_1 = require("@supabase/auth-helpers-nextjs");
// FIXED: Removed direct import of 'next/headers' to avoid client-side errors
var resend = new resend_1.Resend(process.env.RESEND_API_KEY);
var EmailService = /** @class */ (function () {
    function EmailService() {
        this.supabase = null;
        this.defaultFrom = process.env.DEFAULT_FROM_EMAIL || 'neonpro@example.com';
        this.defaultReplyTo = process.env.DEFAULT_REPLY_TO_EMAIL;
    }
    // Initialize Supabase client with dynamic cookies import
    EmailService.prototype.getSupabaseClient = function () {
        return __awaiter(this, void 0, void 0, function () {
            var cookies, error_1, createClient, createClient;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.supabase) {
                            return [2 /*return*/, this.supabase];
                        }
                        if (!(typeof window === 'undefined')) return [3 /*break*/, 6];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 5]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('next/headers'); })];
                    case 2:
                        cookies = (_a.sent()).cookies;
                        this.supabase = (0, auth_helpers_nextjs_1.createServerComponentClient)({ cookies: cookies });
                        return [3 /*break*/, 5];
                    case 3:
                        error_1 = _a.sent();
                        console.error('Error importing next/headers:', error_1);
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('@supabase/supabase-js'); })];
                    case 4:
                        createClient = (_a.sent()).createClient;
                        this.supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
                        return [3 /*break*/, 5];
                    case 5: return [3 /*break*/, 8];
                    case 6: return [4 /*yield*/, Promise.resolve().then(function () { return require('@supabase/supabase-js'); })];
                    case 7:
                        createClient = (_a.sent()).createClient;
                        this.supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
                        _a.label = 8;
                    case 8: return [2 /*return*/, this.supabase];
                }
            });
        });
    };
    EmailService.prototype.getTemplate = function (templateName) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, data, error, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getSupabaseClient()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('email_templates')
                                .select('*')
                                .eq('name', templateName)
                                .eq('is_active', true)
                                .single()];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            console.error('Error fetching email template:', error);
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, data];
                    case 3:
                        error_2 = _b.sent();
                        console.error('Error in getTemplate:', error_2);
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    EmailService.prototype.replaceVariables = function (content, variables) {
        var result = content;
        Object.entries(variables).forEach(function (_a) {
            var key = _a[0], value = _a[1];
            var regex = new RegExp("{{".concat(key, "}}"), 'g');
            result = result.replace(regex, value || '');
        });
        return result;
    };
    EmailService.prototype.sendEmail = function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var template, subject, html, text, _c, data, error, error_3;
            var to = _b.to, templateName = _b.template, variables = _b.variables, _d = _b.from, from = _d === void 0 ? this.defaultFrom : _d, _e = _b.reply_to, reply_to = _e === void 0 ? this.defaultReplyTo : _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _f.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getTemplate(templateName)];
                    case 1:
                        template = _f.sent();
                        if (!template) {
                            return [2 /*return*/, { success: false, error: "Template '".concat(templateName, "' not found") }];
                        }
                        subject = this.replaceVariables(template.subject, variables);
                        html = this.replaceVariables(template.html_content, variables);
                        text = template.text_content
                            ? this.replaceVariables(template.text_content, variables)
                            : undefined;
                        return [4 /*yield*/, resend.emails.send({
                                from: from,
                                to: [to],
                                subject: subject,
                                html: html,
                                text: text,
                                reply_to: reply_to
                            })];
                    case 2:
                        _c = _f.sent(), data = _c.data, error = _c.error;
                        if (error) {
                            console.error('Resend error:', error);
                            return [2 /*return*/, { success: false, error: error.message }];
                        }
                        console.log('Email sent successfully:', data === null || data === void 0 ? void 0 : data.id);
                        return [2 /*return*/, { success: true, messageId: data === null || data === void 0 ? void 0 : data.id }];
                    case 3:
                        error_3 = _f.sent();
                        console.error('Error sending email:', error_3);
                        return [2 /*return*/, {
                                success: false,
                                error: error_3 instanceof Error ? error_3.message : 'Unknown error'
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    EmailService.prototype.sendBulkEmails = function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var template_1, results, processedResults, overallSuccess, error_4;
            var _this = this;
            var templateName = _b.template, recipients = _b.recipients, _c = _b.from, from = _c === void 0 ? this.defaultFrom : _c, _d = _b.reply_to, reply_to = _d === void 0 ? this.defaultReplyTo : _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getTemplate(templateName)];
                    case 1:
                        template_1 = _e.sent();
                        if (!template_1) {
                            return [2 /*return*/, {
                                    success: false,
                                    results: recipients.map(function (r) { return ({
                                        email: r.email,
                                        success: false,
                                        error: "Template '".concat(templateName, "' not found")
                                    }); })
                                }];
                        }
                        return [4 /*yield*/, Promise.allSettled(recipients.map(function (recipient) { return __awaiter(_this, void 0, void 0, function () {
                                var subject, html, text, _a, data, error;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            subject = this.replaceVariables(template_1.subject, recipient.variables);
                                            html = this.replaceVariables(template_1.html_content, recipient.variables);
                                            text = template_1.text_content
                                                ? this.replaceVariables(template_1.text_content, recipient.variables)
                                                : undefined;
                                            return [4 /*yield*/, resend.emails.send({
                                                    from: from,
                                                    to: [recipient.email],
                                                    subject: subject,
                                                    html: html,
                                                    text: text,
                                                    reply_to: reply_to
                                                })];
                                        case 1:
                                            _a = _b.sent(), data = _a.data, error = _a.error;
                                            return [2 /*return*/, {
                                                    email: recipient.email,
                                                    success: !error,
                                                    messageId: data === null || data === void 0 ? void 0 : data.id,
                                                    error: error === null || error === void 0 ? void 0 : error.message
                                                }];
                                    }
                                });
                            }); }))];
                    case 2:
                        results = _e.sent();
                        processedResults = results.map(function (result, index) {
                            var _a;
                            if (result.status === 'fulfilled') {
                                return result.value;
                            }
                            else {
                                return {
                                    email: recipients[index].email,
                                    success: false,
                                    error: ((_a = result.reason) === null || _a === void 0 ? void 0 : _a.message) || 'Failed to send'
                                };
                            }
                        });
                        overallSuccess = processedResults.every(function (r) { return r.success; });
                        return [2 /*return*/, {
                                success: overallSuccess,
                                results: processedResults
                            }];
                    case 3:
                        error_4 = _e.sent();
                        console.error('Error sending bulk emails:', error_4);
                        return [2 /*return*/, {
                                success: false,
                                results: recipients.map(function (r) { return ({
                                    email: r.email,
                                    success: false,
                                    error: error_4 instanceof Error ? error_4.message : 'Unknown error'
                                }); })
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    EmailService.prototype.sendAppointmentConfirmation = function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var patientEmail = _b.patientEmail, patientName = _b.patientName, appointmentDate = _b.appointmentDate, appointmentTime = _b.appointmentTime, serviceName = _b.serviceName, professionalName = _b.professionalName, _c = _b.clinicName, clinicName = _c === void 0 ? 'NeonPro' : _c;
            return __generator(this, function (_d) {
                return [2 /*return*/, this.sendEmail({
                        to: patientEmail,
                        template: 'appointment_confirmation',
                        variables: {
                            patient_name: patientName,
                            appointment_date: appointmentDate,
                            appointment_time: appointmentTime,
                            service_name: serviceName,
                            professional_name: professionalName,
                            clinic_name: clinicName
                        }
                    })];
            });
        });
    };
    EmailService.prototype.sendAppointmentReminder = function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var patientEmail = _b.patientEmail, patientName = _b.patientName, appointmentDate = _b.appointmentDate, appointmentTime = _b.appointmentTime, serviceName = _b.serviceName, professionalName = _b.professionalName, _c = _b.clinicName, clinicName = _c === void 0 ? 'NeonPro' : _c;
            return __generator(this, function (_d) {
                return [2 /*return*/, this.sendEmail({
                        to: patientEmail,
                        template: 'appointment_reminder',
                        variables: {
                            patient_name: patientName,
                            appointment_date: appointmentDate,
                            appointment_time: appointmentTime,
                            service_name: serviceName,
                            professional_name: professionalName,
                            clinic_name: clinicName
                        }
                    })];
            });
        });
    };
    EmailService.prototype.sendAppointmentCancellation = function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var patientEmail = _b.patientEmail, patientName = _b.patientName, appointmentDate = _b.appointmentDate, appointmentTime = _b.appointmentTime, _c = _b.cancellationReason, cancellationReason = _c === void 0 ? 'Solicitação da clínica' : _c, _d = _b.clinicName, clinicName = _d === void 0 ? 'NeonPro' : _d;
            return __generator(this, function (_e) {
                return [2 /*return*/, this.sendEmail({
                        to: patientEmail,
                        template: 'appointment_cancellation',
                        variables: {
                            patient_name: patientName,
                            appointment_date: appointmentDate,
                            appointment_time: appointmentTime,
                            cancellation_reason: cancellationReason,
                            clinic_name: clinicName
                        }
                    })];
            });
        });
    };
    EmailService.prototype.testConnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, data, error, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getSupabaseClient()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('email_templates')
                                .select('id')
                                .limit(1)];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            return [2 /*return*/, { success: false, error: error.message }];
                        }
                        return [2 /*return*/, { success: true }];
                    case 3:
                        error_5 = _b.sent();
                        return [2 /*return*/, {
                                success: false,
                                error: error_5 instanceof Error ? error_5.message : 'Unknown error'
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return EmailService;
}());
// Singleton instance
var emailService = new EmailService();
exports.default = emailService;
// Utility functions for common use cases
function sendAppointmentNotificationEmail(appointmentId, type, cancellationReason) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                // This would typically fetch appointment details from the database
                // For now, this is a placeholder that would be implemented with actual data fetching
                console.log("Sending ".concat(type, " email for appointment ").concat(appointmentId));
                // The actual implementation would:
                // 1. Fetch appointment details from database
                // 2. Fetch patient email and preferences
                // 3. Check if email notifications are enabled
                // 4. Send appropriate email using emailService methods
                return [2 /*return*/, { success: true }];
            }
            catch (error) {
                console.error("Error sending ".concat(type, " email:"), error);
                return [2 /*return*/, {
                        success: false,
                        error: error instanceof Error ? error.message : 'Unknown error'
                    }];
            }
            return [2 /*return*/];
        });
    });
}
// Background job function for sending reminder emails
function sendScheduledReminders() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                // This would be called by a cron job to send reminder emails
                // Implementation would:
                // 1. Query appointments that need reminders
                // 2. Check user notification preferences
                // 3. Send emails using emailService.sendAppointmentReminder
                console.log('Processing scheduled reminder emails');
                return [2 /*return*/, { success: true, processed: 0 }];
            }
            catch (error) {
                console.error('Error sending scheduled reminders:', error);
                return [2 /*return*/, {
                        success: false,
                        error: error instanceof Error ? error.message : 'Unknown error'
                    }];
            }
            return [2 /*return*/];
        });
    });
}

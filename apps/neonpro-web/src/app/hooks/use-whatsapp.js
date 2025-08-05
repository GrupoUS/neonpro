"use strict";
// WhatsApp React Hooks for NeonPro
// Provides React integration for WhatsApp Business API
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
exports.useWhatsAppConfig = useWhatsAppConfig;
exports.useUpdateWhatsAppConfig = useUpdateWhatsAppConfig;
exports.useWhatsAppTemplates = useWhatsAppTemplates;
exports.useWhatsAppTemplate = useWhatsAppTemplate;
exports.useSendWhatsAppMessage = useSendWhatsAppMessage;
exports.useSendWhatsAppTemplate = useSendWhatsAppTemplate;
exports.useSendBulkWhatsAppMessages = useSendBulkWhatsAppMessages;
exports.useCheckWhatsAppOptIn = useCheckWhatsAppOptIn;
exports.useRecordWhatsAppOptIn = useRecordWhatsAppOptIn;
exports.useWhatsAppAnalytics = useWhatsAppAnalytics;
exports.useWhatsAppStatus = useWhatsAppStatus;
exports.useWhatsAppConfigValidation = useWhatsAppConfigValidation;
exports.useWhatsAppTemplateValidation = useWhatsAppTemplateValidation;
exports.useWhatsAppNotifications = useWhatsAppNotifications;
var react_query_1 = require("@tanstack/react-query");
var whatsapp_service_1 = require("@/app/lib/services/whatsapp-service");
var whatsapp_1 = require("@/app/types/whatsapp");
var react_hot_toast_1 = require("react-hot-toast");
// Configuration hooks
function useWhatsAppConfig() {
    return (0, react_query_1.useQuery)({
        queryKey: ['whatsapp-config'],
        queryFn: function () { return whatsapp_service_1.whatsAppService.getConfig(); },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}
function useUpdateWhatsAppConfig() {
    var queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: function (config) { return whatsapp_service_1.whatsAppService.updateConfig(config); },
        onSuccess: function (data) {
            queryClient.setQueryData(['whatsapp-config'], data);
            react_hot_toast_1.toast.success('Configuração do WhatsApp atualizada com sucesso!');
        },
        onError: function (error) {
            console.error('Error updating WhatsApp config:', error);
            react_hot_toast_1.toast.error("Erro ao atualizar configura\u00E7\u00E3o: ".concat(error.message));
        },
    });
}
// Template hooks
function useWhatsAppTemplates() {
    return (0, react_query_1.useQuery)({
        queryKey: ['whatsapp-templates'],
        queryFn: function () { return whatsapp_service_1.whatsAppService.getTemplates(); },
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
}
function useWhatsAppTemplate(name) {
    return (0, react_query_1.useQuery)({
        queryKey: ['whatsapp-template', name],
        queryFn: function () { return whatsapp_service_1.whatsAppService.getTemplate(name); },
        enabled: !!name,
        staleTime: 10 * 60 * 1000,
    });
}
// Message hooks
function useSendWhatsAppMessage() {
    var _this = this;
    return (0, react_query_1.useMutation)({
        mutationFn: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var phoneNumber = _b.phoneNumber, content = _b.content, _c = _b.type, type = _c === void 0 ? whatsapp_1.WhatsAppMessageType.TEXT : _c, patientId = _b.patientId, templateName = _b.templateName;
            return __generator(this, function (_d) {
                return [2 /*return*/, whatsapp_service_1.whatsAppService.sendMessage(phoneNumber, content, type, patientId, templateName)];
            });
        }); },
        onSuccess: function () {
            react_hot_toast_1.toast.success('Mensagem WhatsApp enviada com sucesso!');
        },
        onError: function (error) {
            console.error('Error sending WhatsApp message:', error);
            react_hot_toast_1.toast.error("Erro ao enviar mensagem: ".concat(error.message));
        },
    });
}
function useSendWhatsAppTemplate() {
    var _this = this;
    return (0, react_query_1.useMutation)({
        mutationFn: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var phoneNumber = _b.phoneNumber, templateName = _b.templateName, _c = _b.parameters, parameters = _c === void 0 ? {} : _c, patientId = _b.patientId;
            return __generator(this, function (_d) {
                return [2 /*return*/, whatsapp_service_1.whatsAppService.sendTemplateMessage(phoneNumber, templateName, parameters, patientId)];
            });
        }); },
        onSuccess: function () {
            react_hot_toast_1.toast.success('Template WhatsApp enviado com sucesso!');
        },
        onError: function (error) {
            console.error('Error sending WhatsApp template:', error);
            react_hot_toast_1.toast.error("Erro ao enviar template: ".concat(error.message));
        },
    });
}
function useSendBulkWhatsAppMessages() {
    var _this = this;
    return (0, react_query_1.useMutation)({
        mutationFn: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var phoneNumbers = _b.phoneNumbers, templateName = _b.templateName, _c = _b.parameters, parameters = _c === void 0 ? {} : _c;
            return __generator(this, function (_d) {
                return [2 /*return*/, whatsapp_service_1.whatsAppService.sendBulkMessages(phoneNumbers, templateName, parameters)];
            });
        }); },
        onSuccess: function (results) {
            react_hot_toast_1.toast.success("Envio em massa conclu\u00EDdo: ".concat(results.sent, " enviadas, ").concat(results.failed, " falharam"));
        },
        onError: function (error) {
            console.error('Error sending bulk WhatsApp messages:', error);
            react_hot_toast_1.toast.error("Erro no envio em massa: ".concat(error.message));
        },
    });
}
// Opt-in hooks
function useCheckWhatsAppOptIn(phoneNumber) {
    return (0, react_query_1.useQuery)({
        queryKey: ['whatsapp-opt-in', phoneNumber],
        queryFn: function () { return whatsapp_service_1.whatsAppService.checkOptIn(phoneNumber); },
        enabled: !!phoneNumber,
        staleTime: 5 * 60 * 1000,
    });
}
function useRecordWhatsAppOptIn() {
    var _this = this;
    var queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var patientId = _b.patientId, phoneNumber = _b.phoneNumber, _c = _b.source, source = _c === void 0 ? 'manual' : _c, consentMessage = _b.consentMessage;
            return __generator(this, function (_d) {
                return [2 /*return*/, whatsapp_service_1.whatsAppService.recordOptIn(patientId, phoneNumber, source, consentMessage)];
            });
        }); },
        onSuccess: function (_, variables) {
            queryClient.setQueryData(['whatsapp-opt-in', variables.phoneNumber], true);
            react_hot_toast_1.toast.success('Consentimento WhatsApp registrado com sucesso!');
        },
        onError: function (error) {
            console.error('Error recording WhatsApp opt-in:', error);
            react_hot_toast_1.toast.error("Erro ao registrar consentimento: ".concat(error.message));
        },
    });
}
// Analytics hooks
function useWhatsAppAnalytics(startDate, endDate) {
    return (0, react_query_1.useQuery)({
        queryKey: ['whatsapp-analytics', startDate.toISOString(), endDate.toISOString()],
        queryFn: function () { return whatsapp_service_1.whatsAppService.getAnalytics(startDate, endDate); },
        enabled: !!startDate && !!endDate,
        staleTime: 60 * 1000, // 1 minute for analytics
    });
}
// Utility hooks
function useWhatsAppStatus() {
    var _a = useWhatsAppConfig(), config = _a.data, configLoading = _a.isLoading;
    var _b = useWhatsAppTemplates(), templates = _b.data, templatesLoading = _b.isLoading;
    var isConfigured = !!((config === null || config === void 0 ? void 0 : config.phoneNumberId) &&
        (config === null || config === void 0 ? void 0 : config.accessToken) &&
        (config === null || config === void 0 ? void 0 : config.webhookVerifyToken) &&
        (config === null || config === void 0 ? void 0 : config.isActive));
    var hasTemplates = !!(templates && templates.length > 0);
    var isReady = isConfigured && hasTemplates;
    return {
        isConfigured: isConfigured,
        hasTemplates: hasTemplates,
        isReady: isReady,
        isLoading: configLoading || templatesLoading,
        config: config,
        templates: templates
    };
}
// Form validation hooks (for use with react-hook-form)
function useWhatsAppConfigValidation() {
    return {
        phoneNumberId: {
            required: 'Phone Number ID é obrigatório',
            pattern: {
                value: /^\d+$/,
                message: 'Phone Number ID deve conter apenas números'
            }
        },
        accessToken: {
            required: 'Access Token é obrigatório',
            minLength: {
                value: 50,
                message: 'Access Token deve ter pelo menos 50 caracteres'
            }
        },
        webhookVerifyToken: {
            required: 'Webhook Verify Token é obrigatório',
            minLength: {
                value: 8,
                message: 'Webhook Verify Token deve ter pelo menos 8 caracteres'
            }
        },
        businessName: {
            required: 'Nome do negócio é obrigatório',
            maxLength: {
                value: 100,
                message: 'Nome do negócio deve ter no máximo 100 caracteres'
            }
        }
    };
}
function useWhatsAppTemplateValidation() {
    return {
        name: {
            required: 'Nome do template é obrigatório',
            pattern: {
                value: /^[a-z0-9_]+$/,
                message: 'Nome deve conter apenas letras minúsculas, números e underscore'
            }
        },
        bodyText: {
            required: 'Texto do corpo é obrigatório',
            maxLength: {
                value: 1024,
                message: 'Texto do corpo deve ter no máximo 1024 caracteres'
            }
        },
        headerText: {
            maxLength: {
                value: 60,
                message: 'Texto do cabeçalho deve ter no máximo 60 caracteres'
            }
        },
        footerText: {
            maxLength: {
                value: 60,
                message: 'Texto do rodapé deve ter no máximo 60 caracteres'
            }
        }
    };
}
// Custom hook for automatic WhatsApp notifications based on appointments
function useWhatsAppNotifications() {
    var _this = this;
    var sendTemplate = useSendWhatsAppTemplate();
    var checkOptIn = useCheckWhatsAppOptIn;
    var sendAppointmentReminder = function (patientId, phoneNumber, appointmentDate, appointmentTime, doctorName) { return __awaiter(_this, void 0, void 0, function () {
        var isOptedIn, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, whatsapp_service_1.whatsAppService.checkOptIn(phoneNumber)];
                case 1:
                    isOptedIn = _a.sent();
                    if (!isOptedIn) {
                        throw new Error('Paciente não autorizou mensagens WhatsApp');
                    }
                    return [4 /*yield*/, sendTemplate.mutateAsync({
                            phoneNumber: phoneNumber,
                            templateName: 'appointment_reminder',
                            parameters: {
                                appointment_date: appointmentDate,
                                appointment_time: appointmentTime,
                                doctor_name: doctorName
                            },
                            patientId: patientId
                        })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error('Error sending appointment reminder:', error_1);
                    throw error_1;
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var sendTreatmentFollowup = function (patientId, phoneNumber, treatmentName, doctorName, daysAfterTreatment) { return __awaiter(_this, void 0, void 0, function () {
        var isOptedIn, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, whatsapp_service_1.whatsAppService.checkOptIn(phoneNumber)];
                case 1:
                    isOptedIn = _a.sent();
                    if (!isOptedIn) {
                        throw new Error('Paciente não autorizou mensagens WhatsApp');
                    }
                    return [4 /*yield*/, sendTemplate.mutateAsync({
                            phoneNumber: phoneNumber,
                            templateName: 'treatment_followup',
                            parameters: {
                                treatment_name: treatmentName,
                                doctor_name: doctorName,
                                days_after: daysAfterTreatment.toString()
                            },
                            patientId: patientId
                        })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.error('Error sending treatment followup:', error_2);
                    throw error_2;
                case 4: return [2 /*return*/];
            }
        });
    }); };
    return {
        sendAppointmentReminder: sendAppointmentReminder,
        sendTreatmentFollowup: sendTreatmentFollowup,
        isLoading: sendTemplate.isPending
    };
}

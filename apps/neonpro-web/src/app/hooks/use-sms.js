"use strict";
// SMS React Hooks for NeonPro
// Comprehensive React hooks for SMS integration with TanStack Query
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SMS_QUERY_KEYS = void 0;
exports.useSMSProviders = useSMSProviders;
exports.useActiveSMSProvider = useActiveSMSProvider;
exports.useUpsertSMSProvider = useUpsertSMSProvider;
exports.useTestSMSProvider = useTestSMSProvider;
exports.useSMSMessages = useSMSMessages;
exports.useSMSMessage = useSMSMessage;
exports.useSendSMS = useSendSMS;
exports.useSendBulkSMS = useSendBulkSMS;
exports.useSMSTemplates = useSMSTemplates;
exports.useUpsertSMSTemplate = useUpsertSMSTemplate;
exports.useDeleteSMSTemplate = useDeleteSMSTemplate;
exports.useSMSOptInStatus = useSMSOptInStatus;
exports.useUpdateSMSOptIn = useUpdateSMSOptIn;
exports.useSMSAnalytics = useSMSAnalytics;
exports.useProcessSMSWebhook = useProcessSMSWebhook;
exports.useSMSIntegrationStatus = useSMSIntegrationStatus;
exports.useFormatPhoneNumber = useFormatPhoneNumber;
exports.useSMSMessageStats = useSMSMessageStats;
exports.useSMSValidation = useSMSValidation;
exports.useRealtimeSMSMessages = useRealtimeSMSMessages;
exports.useSMSConfigurationWizard = useSMSConfigurationWizard;
var react_query_1 = require("@tanstack/react-query");
var sonner_1 = require("sonner");
var sms_service_1 = require("@/app/lib/services/sms-service");
// ==================== QUERY KEYS ====================
exports.SMS_QUERY_KEYS = {
    all: ['sms'],
    providers: function () { return __spreadArray(__spreadArray([], exports.SMS_QUERY_KEYS.all, true), ['providers'], false); },
    activeProvider: function () { return __spreadArray(__spreadArray([], exports.SMS_QUERY_KEYS.all, true), ['activeProvider'], false); },
    messages: function (params) { return __spreadArray(__spreadArray([], exports.SMS_QUERY_KEYS.all, true), ['messages', params], false); },
    message: function (id) { return __spreadArray(__spreadArray([], exports.SMS_QUERY_KEYS.all, true), ['message', id], false); },
    templates: function () { return __spreadArray(__spreadArray([], exports.SMS_QUERY_KEYS.all, true), ['templates'], false); },
    template: function (id) { return __spreadArray(__spreadArray([], exports.SMS_QUERY_KEYS.all, true), ['template', id], false); },
    optIns: function () { return __spreadArray(__spreadArray([], exports.SMS_QUERY_KEYS.all, true), ['optIns'], false); },
    optIn: function (phone) { return __spreadArray(__spreadArray([], exports.SMS_QUERY_KEYS.all, true), ['optIn', phone], false); },
    analytics: function (startDate, endDate, period) {
        return __spreadArray(__spreadArray([], exports.SMS_QUERY_KEYS.all, true), ['analytics', startDate, endDate, period], false);
    },
    integration: function (provider) { return __spreadArray(__spreadArray([], exports.SMS_QUERY_KEYS.all, true), ['integration', provider], false); }
};
// ==================== PROVIDER HOOKS ====================
/**
 * Hook to fetch all SMS providers
 */
function useSMSProviders() {
    return (0, react_query_1.useQuery)({
        queryKey: exports.SMS_QUERY_KEYS.providers(),
        queryFn: function () { return sms_service_1.smsService.getProviders(); },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
}
/**
 * Hook to fetch active SMS provider
 */
function useActiveSMSProvider() {
    return (0, react_query_1.useQuery)({
        queryKey: exports.SMS_QUERY_KEYS.activeProvider(),
        queryFn: function () { return sms_service_1.smsService.getActiveProvider(); },
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 5 * 60 * 1000, // 5 minutes
    });
}
/**
 * Hook to create or update SMS provider
 */
function useUpsertSMSProvider() {
    var queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: function (config) {
            return sms_service_1.smsService.upsertProvider(config);
        },
        onSuccess: function (data) {
            // Invalidate and refetch providers
            queryClient.invalidateQueries({ queryKey: exports.SMS_QUERY_KEYS.providers() });
            queryClient.invalidateQueries({ queryKey: exports.SMS_QUERY_KEYS.activeProvider() });
            sonner_1.toast.success("Provedor SMS ".concat(data.provider, " configurado com sucesso!"));
        },
        onError: function (error) {
            console.error('Error upserting SMS provider:', error);
            sonner_1.toast.error("Erro ao configurar provedor SMS: ".concat(error.message));
        },
    });
}
/**
 * Hook to test SMS provider connection
 */
function useTestSMSProvider() {
    return (0, react_query_1.useMutation)({
        mutationFn: function (_a) {
            var providerId = _a.providerId, testPhone = _a.testPhone;
            return sms_service_1.smsService.testProvider(providerId, testPhone);
        },
        onSuccess: function (success, variables) {
            if (success) {
                sonner_1.toast.success('Teste de conexão SMS realizado com sucesso!');
            }
            else {
                sonner_1.toast.error('Falha no teste de conexão SMS. Verifique as configurações.');
            }
        },
        onError: function (error) {
            console.error('Error testing SMS provider:', error);
            sonner_1.toast.error("Erro no teste SMS: ".concat(error.message));
        },
    });
}
// ==================== MESSAGE HOOKS ====================
/**
 * Hook to fetch SMS messages with filtering and pagination
 */
function useSMSMessages(params) {
    if (params === void 0) { params = {}; }
    return (0, react_query_1.useQuery)({
        queryKey: exports.SMS_QUERY_KEYS.messages(params),
        queryFn: function () { return sms_service_1.smsService.getMessages(params); },
        staleTime: 30 * 1000, // 30 seconds
        gcTime: 2 * 60 * 1000, // 2 minutes
    });
}
/**
 * Hook to fetch single SMS message
 */
function useSMSMessage(id, enabled) {
    if (enabled === void 0) { enabled = true; }
    return (0, react_query_1.useQuery)({
        queryKey: exports.SMS_QUERY_KEYS.message(id),
        queryFn: function () { return sms_service_1.smsService.getMessage(id); },
        enabled: enabled && !!id,
        staleTime: 30 * 1000, // 30 seconds
        gcTime: 2 * 60 * 1000, // 2 minutes
    });
}
/**
 * Hook to send individual SMS message
 */
function useSendSMS() {
    var queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: function (params) { return sms_service_1.smsService.sendMessage(params); },
        onSuccess: function (data, variables) {
            // Invalidate messages list to show new message
            queryClient.invalidateQueries({ queryKey: exports.SMS_QUERY_KEYS.messages() });
            sonner_1.toast.success("SMS enviado para ".concat(variables.to, " com sucesso!"));
        },
        onError: function (error, variables) {
            console.error('Error sending SMS:', error);
            sonner_1.toast.error("Erro ao enviar SMS para ".concat(variables.to, ": ").concat(error.message));
        },
    });
}
/**
 * Hook to send bulk SMS messages
 */
function useSendBulkSMS() {
    var queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: function (request) { return sms_service_1.smsService.sendBulkMessages(request); },
        onSuccess: function (data) {
            // Invalidate messages list to show new messages
            queryClient.invalidateQueries({ queryKey: exports.SMS_QUERY_KEYS.messages() });
            var successRate = ((data.queued_messages / data.total_messages) * 100).toFixed(1);
            sonner_1.toast.success("Envio em lote conclu\u00EDdo: ".concat(data.queued_messages, "/").concat(data.total_messages, " mensagens enviadas (").concat(successRate, "%)"));
            if (data.failed_messages > 0) {
                sonner_1.toast.warning("".concat(data.failed_messages, " mensagens falharam no envio."));
            }
        },
        onError: function (error) {
            console.error('Error sending bulk SMS:', error);
            sonner_1.toast.error("Erro no envio em lote: ".concat(error.message));
        },
    });
}
// ==================== TEMPLATE HOOKS ====================
/**
 * Hook to fetch SMS templates
 */
function useSMSTemplates() {
    return (0, react_query_1.useQuery)({
        queryKey: exports.SMS_QUERY_KEYS.templates(),
        queryFn: function () { return sms_service_1.smsService.getTemplates(); },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
}
/**
 * Hook to create or update SMS template
 */
function useUpsertSMSTemplate() {
    var queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: function (template) {
            return sms_service_1.smsService.upsertTemplate(template);
        },
        onSuccess: function (data) {
            // Invalidate templates list
            queryClient.invalidateQueries({ queryKey: exports.SMS_QUERY_KEYS.templates() });
            sonner_1.toast.success("Template SMS \"".concat(data.name, "\" salvo com sucesso!"));
        },
        onError: function (error) {
            console.error('Error upserting SMS template:', error);
            sonner_1.toast.error("Erro ao salvar template SMS: ".concat(error.message));
        },
    });
}
/**
 * Hook to delete SMS template
 */
function useDeleteSMSTemplate() {
    var _this = this;
    var queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: function (id) { return __awaiter(_this, void 0, void 0, function () {
            var error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, sms_service_1.smsService['supabase']
                            .from('sms_templates')
                            .delete()
                            .eq('id', id)];
                    case 1:
                        error = (_a.sent()).error;
                        if (error)
                            throw error;
                        return [2 /*return*/, id];
                }
            });
        }); },
        onSuccess: function (deletedId) {
            // Invalidate templates list
            queryClient.invalidateQueries({ queryKey: exports.SMS_QUERY_KEYS.templates() });
            sonner_1.toast.success('Template SMS removido com sucesso!');
        },
        onError: function (error) {
            console.error('Error deleting SMS template:', error);
            sonner_1.toast.error("Erro ao remover template SMS: ".concat(error.message));
        },
    });
}
// ==================== OPT-IN HOOKS ====================
/**
 * Hook to check opt-in status for phone number
 */
function useSMSOptInStatus(phoneNumber, enabled) {
    if (enabled === void 0) { enabled = true; }
    return (0, react_query_1.useQuery)({
        queryKey: exports.SMS_QUERY_KEYS.optIn(phoneNumber),
        queryFn: function () { return sms_service_1.smsService.checkOptInStatus(phoneNumber); },
        enabled: enabled && !!phoneNumber,
        staleTime: 60 * 1000, // 1 minute
        gcTime: 5 * 60 * 1000, // 5 minutes
    });
}
/**
 * Hook to update opt-in status
 */
function useUpdateSMSOptIn() {
    var queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: function (params) { return sms_service_1.smsService.updateOptInStatus(params.phoneNumber, params.status, params.source, params.patientId); },
        onSuccess: function (data, variables) {
            // Invalidate opt-in queries
            queryClient.invalidateQueries({ queryKey: exports.SMS_QUERY_KEYS.optIn(variables.phoneNumber) });
            queryClient.invalidateQueries({ queryKey: exports.SMS_QUERY_KEYS.optIns() });
            var statusText = variables.status === 'opted_in' ? 'autorizado' : 'removido';
            sonner_1.toast.success("Contato ".concat(variables.phoneNumber, " ").concat(statusText, " para SMS!"));
        },
        onError: function (error, variables) {
            console.error('Error updating SMS opt-in:', error);
            sonner_1.toast.error("Erro ao atualizar autoriza\u00E7\u00E3o SMS para ".concat(variables.phoneNumber, ": ").concat(error.message));
        },
    });
}
// ==================== ANALYTICS HOOKS ====================
/**
 * Hook to fetch SMS analytics
 */
function useSMSAnalytics(startDate, endDate, period, enabled) {
    if (period === void 0) { period = 'day'; }
    if (enabled === void 0) { enabled = true; }
    return (0, react_query_1.useQuery)({
        queryKey: exports.SMS_QUERY_KEYS.analytics(startDate, endDate, period),
        queryFn: function () { return sms_service_1.smsService.getAnalytics(startDate, endDate, period); },
        enabled: enabled && !!startDate && !!endDate,
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 5 * 60 * 1000, // 5 minutes
    });
}
// ==================== WEBHOOK HOOKS ====================
/**
 * Hook to process SMS webhook
 */
function useProcessSMSWebhook() {
    var queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: function (params) {
            return sms_service_1.smsService.processWebhook(params.provider, params.payload);
        },
        onSuccess: function () {
            // Invalidate messages to refresh status
            queryClient.invalidateQueries({ queryKey: exports.SMS_QUERY_KEYS.messages() });
        },
        onError: function (error) {
            console.error('Error processing SMS webhook:', error);
            sonner_1.toast.error("Erro ao processar webhook SMS: ".concat(error.message));
        },
    });
}
// ==================== INTEGRATION STATUS HOOKS ====================
/**
 * Hook to get SMS provider integration status
 */
function useSMSIntegrationStatus(provider, enabled) {
    var _this = this;
    if (enabled === void 0) { enabled = true; }
    return (0, react_query_1.useQuery)({
        queryKey: exports.SMS_QUERY_KEYS.integration(provider),
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // This would be implemented as a service method
                // For now, return a mock status
                return [2 /*return*/, {
                        provider: provider,
                        status: 'connected',
                        last_test: new Date().toISOString(),
                        webhook_status: 'active',
                        features: {
                            supports_delivery_reports: true,
                            supports_two_way: true,
                            supports_bulk: true,
                            supports_scheduling: false,
                            supports_templates: true,
                            max_message_length: 1600,
                            max_bulk_size: 1000,
                            rate_limit_per_second: 1,
                            supported_countries: ['BR']
                        }
                    }];
            });
        }); },
        enabled: enabled,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
}
// ==================== UTILITY HOOKS ====================
/**
 * Hook to format phone numbers for Brazilian format
 */
function useFormatPhoneNumber() {
    return {
        formatToInternational: function (phone) {
            // Remove all non-digits
            var digits = phone.replace(/\D/g, '');
            // Handle different formats
            if (digits.length === 11 && digits.startsWith('55')) {
                // Already has country code
                return "+".concat(digits);
            }
            else if (digits.length === 11) {
                // Mobile number without country code
                return "+55".concat(digits);
            }
            else if (digits.length === 10) {
                // Landline without country code
                return "+55".concat(digits);
            }
            else if (digits.length === 9) {
                // Mobile without area code (assume São Paulo 11)
                return "+5511".concat(digits);
            }
            return phone; // Return as-is if can't format
        },
        formatToDisplay: function (phone) {
            var digits = phone.replace(/\D/g, '');
            if (digits.length === 13 && digits.startsWith('55')) {
                // +55 11 99999-9999
                return "+".concat(digits.slice(0, 2), " ").concat(digits.slice(2, 4), " ").concat(digits.slice(4, 9), "-").concat(digits.slice(9));
            }
            else if (digits.length === 11) {
                // (11) 99999-9999
                return "(".concat(digits.slice(0, 2), ") ").concat(digits.slice(2, 7), "-").concat(digits.slice(7));
            }
            else if (digits.length === 10) {
                // (11) 9999-9999
                return "(".concat(digits.slice(0, 2), ") ").concat(digits.slice(2, 6), "-").concat(digits.slice(6));
            }
            return phone;
        },
        isValidBrazilianPhone: function (phone) {
            var digits = phone.replace(/\D/g, '');
            // Check various valid formats
            if (digits.length === 13 && digits.startsWith('55')) {
                return true; // +55 format
            }
            else if (digits.length === 11 || digits.length === 10) {
                return true; // National format
            }
            else if (digits.length === 9) {
                return true; // Mobile without area code
            }
            return false;
        }
    };
}
/**
 * Hook to calculate SMS message statistics
 */
function useSMSMessageStats(messages) {
    return {
        totalMessages: messages.length,
        sentMessages: messages.filter(function (m) { return m.status === 'sent' || m.status === 'delivered'; }).length,
        deliveredMessages: messages.filter(function (m) { return m.status === 'delivered'; }).length,
        failedMessages: messages.filter(function (m) { return m.status === 'failed' || m.status === 'undelivered'; }).length,
        deliveryRate: messages.length > 0
            ? (messages.filter(function (m) { return m.status === 'delivered'; }).length / messages.length) * 100
            : 0,
        totalCost: messages.reduce(function (sum, m) { return sum + (m.cost || 0); }, 0),
        averageCostPerMessage: messages.length > 0
            ? messages.reduce(function (sum, m) { return sum + (m.cost || 0); }, 0) / messages.length
            : 0,
        messagesByProvider: messages.reduce(function (acc, m) {
            acc[m.provider] = (acc[m.provider] || 0) + 1;
            return acc;
        }, {}),
        messagesByStatus: messages.reduce(function (acc, m) {
            acc[m.status] = (acc[m.status] || 0) + 1;
            return acc;
        }, {})
    };
}
/**
 * Hook to validate SMS message content
 */
function useSMSValidation() {
    return {
        validateMessage: function (body) {
            var errors = [];
            var warnings = [];
            if (!body.trim()) {
                errors.push('Mensagem não pode estar vazia');
            }
            if (body.length > 1600) {
                errors.push('Mensagem muito longa (máximo 1600 caracteres)');
            }
            if (body.length > 160) {
                var parts = Math.ceil(body.length / 160);
                warnings.push("Mensagem ser\u00E1 enviada em ".concat(parts, " partes"));
            }
            // Check for common issues
            if (body.includes('{{') && body.includes('}}')) {
                warnings.push('Mensagem contém variáveis. Certifique-se de usar um template.');
            }
            return {
                isValid: errors.length === 0,
                errors: errors,
                warnings: warnings
            };
        },
        estimateCost: function (messageLength, recipients, costPerMessage) {
            if (costPerMessage === void 0) { costPerMessage = 0.05; }
            var parts = Math.ceil(messageLength / 160);
            return recipients * parts * costPerMessage;
        },
        extractVariables: function (template) {
            var matches = template.match(/\{\{\s*([^}]+)\s*\}\}/g);
            return matches ? matches.map(function (match) { return match.replace(/[{}]/g, '').trim(); }) : [];
        }
    };
}
// ==================== REAL-TIME HOOKS ====================
/**
 * Hook for real-time SMS message updates
 */
function useRealtimeSMSMessages() {
    var _this = this;
    var queryClient = (0, react_query_1.useQueryClient)();
    // This would be implemented with Supabase real-time subscriptions
    // For now, we'll use polling as a fallback
    return (0, react_query_1.useQuery)({
        queryKey: ['sms', 'realtime'],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var fiveMinutesAgo;
            return __generator(this, function (_a) {
                fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
                return [2 /*return*/, sms_service_1.smsService.getMessages({
                        filters: { date_from: fiveMinutesAgo },
                        limit: 100
                    })];
            });
        }); },
        refetchInterval: 30 * 1000, // Poll every 30 seconds
        refetchIntervalInBackground: true,
        onSuccess: function () {
            // Invalidate main messages query to update UI
            queryClient.invalidateQueries({ queryKey: exports.SMS_QUERY_KEYS.messages() });
        }
    });
}
/**
 * Hook to manage SMS configuration wizard state
 */
function useSMSConfigurationWizard() {
    var _a = react_1.default.useState(0), currentStep = _a[0], setCurrentStep = _a[1];
    var _b = react_1.default.useState(null), providerType = _b[0], setProviderType = _b[1];
    var _c = react_1.default.useState({}), configuration = _c[0], setConfiguration = _c[1];
    var steps = [
        'Escolher Provedor',
        'Configurar Credenciais',
        'Testar Conexão',
        'Confirmar Configuração'
    ];
    var nextStep = function () { return setCurrentStep(function (prev) { return Math.min(prev + 1, steps.length - 1); }); };
    var prevStep = function () { return setCurrentStep(function (prev) { return Math.max(prev - 1, 0); }); };
    var resetWizard = function () {
        setCurrentStep(0);
        setProviderType(null);
        setConfiguration({});
    };
    return {
        currentStep: currentStep,
        totalSteps: steps.length,
        stepTitle: steps[currentStep],
        providerType: providerType,
        setProviderType: setProviderType,
        configuration: configuration,
        setConfiguration: setConfiguration,
        nextStep: nextStep,
        prevStep: prevStep,
        resetWizard: resetWizard,
        isFirstStep: currentStep === 0,
        isLastStep: currentStep === steps.length - 1
    };
}
// React import for hooks that need it
var react_1 = require("react");

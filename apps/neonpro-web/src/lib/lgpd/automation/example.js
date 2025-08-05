"use strict";
/**
 * LGPD Automation System - Exemplo Prático de Implementação
 *
 * Este arquivo demonstra como implementar e usar o sistema de automação LGPD
 * em uma aplicação real, incluindo configuração, inicialização e uso dos módulos.
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.lgpdApiExamples = exports.LGPDUsageExamples = exports.LGPDAutomationService = void 0;
exports.getLGPDService = getLGPDService;
exports.initializeLGPDInNextJS = initializeLGPDInNextJS;
exports.lgpdConsentMiddleware = lgpdConsentMiddleware;
var supabase_js_1 = require("@supabase/supabase-js");
var LGPDComplianceManager_1 = require("../LGPDComplianceManager");
var index_1 = require("./index");
// Configuração do ambiente
var SUPABASE_URL = process.env.SUPABASE_URL;
var SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
var ENVIRONMENT = process.env.NODE_ENV || 'development';
/**
 * Classe principal para gerenciar a automação LGPD na aplicação
 */
var LGPDAutomationService = /** @class */ (function () {
    function LGPDAutomationService() {
        this.isInitialized = false;
        // Inicializar cliente Supabase
        this.const;
        supabase = (0, supabase_js_1.createClient)((SUPABASE_URL, SUPABASE_ANON_KEY)
        // Inicializar gerenciador de conformidade
        , 
        // Inicializar gerenciador de conformidade
        this.complianceManager = new LGPDComplianceManager_1.LGPDComplianceManager(this.supabase));
    }
    /**
     * Inicializar o sistema de automação LGPD
     */
    LGPDAutomationService.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var config, result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log('🚀 Inicializando sistema de automação LGPD...');
                        config = this.getEnvironmentConfig();
                        // Criar orquestrador
                        this.orchestrator = new index_1.LGPDAutomationOrchestrator(this.supabase, this.complianceManager, config);
                        // Configurar callbacks de monitoramento
                        this.setupMonitoringCallbacks();
                        return [4 /*yield*/, this.orchestrator.startAllAutomation()];
                    case 1:
                        result = _a.sent();
                        if (result.success) {
                            console.log('✅ Sistema de automação LGPD iniciado com sucesso!');
                            console.log('📊 Módulos iniciados:', result.started_modules);
                        }
                        else {
                            console.warn('⚠️ Alguns módulos falharam ao iniciar:');
                            console.log('✅ Iniciados:', result.started_modules);
                            console.log('❌ Falharam:', result.failed_modules);
                        }
                        this.isInitialized = true;
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.error('❌ Erro ao inicializar sistema de automação LGPD:', error_1);
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Parar o sistema de automação
     */
    LGPDAutomationService.prototype.shutdown = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isInitialized)
                            return [2 /*return*/];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        console.log('🛑 Parando sistema de automação LGPD...');
                        return [4 /*yield*/, this.orchestrator.stopAllAutomation()];
                    case 2:
                        result = _a.sent();
                        console.log('✅ Sistema parado com sucesso!');
                        console.log('📊 Módulos parados:', result.stopped_modules);
                        this.isInitialized = false;
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        console.error('❌ Erro ao parar sistema de automação LGPD:', error_2);
                        throw error_2;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Obter configuração baseada no ambiente
     */
    LGPDAutomationService.prototype.getEnvironmentConfig = function () {
        var baseConfig = (0, index_1.getLGPDAutomationConfig)(ENVIRONMENT);
        // Personalizar configuração se necessário
        if (ENVIRONMENT === 'production') {
            return __assign(__assign({}, baseConfig), { 
                // Configurações específicas de produção
                breach_detection: __assign(__assign({}, baseConfig.breach_detection), { notification_settings: __assign(__assign({}, baseConfig.breach_detection.notification_settings), { anpd_notification_enabled: true // Habilitar notificação ANPD em produção
                     }) }) });
        }
        return baseConfig;
    };
    /**
     * Configurar callbacks de monitoramento
     */
    LGPDAutomationService.prototype.setupMonitoringCallbacks = function () {
        var _this = this;
        // Callback para alertas
        this.orchestrator.onAlert(function (alert) {
            console.log("\uD83D\uDEA8 Alerta ".concat(alert.alert_type.toUpperCase(), ": ").concat(alert.title));
            console.log("\uD83D\uDCCD M\u00F3dulo: ".concat(alert.module));
            console.log("\uD83D\uDCDD Mensagem: ".concat(alert.message));
            // Enviar para sistema de monitoramento externo se necessário
            if (alert.alert_type === 'critical') {
                _this.sendCriticalAlert(alert);
            }
        });
        // Callback para mudanças de status
        this.orchestrator.onStatusChange(function (statuses) {
            var errorModules = statuses.filter(function (s) { return s.status === 'error'; });
            if (errorModules.length > 0) {
                console.warn('⚠️ Módulos com erro:', errorModules.map(function (m) { return m.module; }));
            }
        });
    };
    /**
     * Enviar alerta crítico para sistema de monitoramento
     */
    LGPDAutomationService.prototype.sendCriticalAlert = function (alert) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementar integração com sistema de monitoramento
                // (ex: Slack, Discord, email, etc.)
                console.log('🚨 ALERTA CRÍTICO - Enviando notificação...', alert);
                return [2 /*return*/];
            });
        });
    };
    /**
     * Obter dashboard de conformidade
     */
    LGPDAutomationService.prototype.getDashboard = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isInitialized) {
                            throw new Error('Sistema não inicializado');
                        }
                        return [4 /*yield*/, this.orchestrator.getUnifiedDashboard()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Obter métricas de automação
     */
    LGPDAutomationService.prototype.getMetrics = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isInitialized) {
                            throw new Error('Sistema não inicializado');
                        }
                        return [4 /*yield*/, this.orchestrator.getAutomationMetrics()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Obter módulos para uso direto
     */
    LGPDAutomationService.prototype.getModules = function () {
        if (!this.isInitialized) {
            throw new Error('Sistema não inicializado');
        }
        return this.orchestrator.getModules();
    };
    return LGPDAutomationService;
}());
exports.LGPDAutomationService = LGPDAutomationService;
// Instância singleton do serviço
var lgpdService = null;
/**
 * Obter instância singleton do serviço LGPD
 */
function getLGPDService() {
    if (!lgpdService) {
        lgpdService = new LGPDAutomationService();
    }
    return lgpdService;
}
/**
 * Exemplos de uso dos módulos de automação
 */
var LGPDUsageExamples = /** @class */ (function () {
    function LGPDUsageExamples() {
        this.service = getLGPDService();
    }
    /**
     * Exemplo: Coletar consentimento de usuário
     */
    LGPDUsageExamples.prototype.collectUserConsent = function (userId, purpose, ipAddress, userAgent) {
        return __awaiter(this, void 0, void 0, function () {
            var modules, consent, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        modules = this.service.getModules();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, modules.consentAutomation.collectConsentWithTracking({
                                user_id: userId,
                                purpose: purpose,
                                consent_given: true,
                                collection_method: 'web_form',
                                ip_address: ipAddress,
                                user_agent: userAgent,
                                consent_text: "Eu concordo com o uso dos meus dados para ".concat(purpose),
                                legal_basis: 'consent',
                                data_categories: ['personal', 'contact'],
                                retention_period_months: 24,
                                third_party_sharing: false
                            })];
                    case 2:
                        consent = _a.sent();
                        console.log('✅ Consentimento coletado:', consent.consent_id);
                        return [2 /*return*/, consent];
                    case 3:
                        error_3 = _a.sent();
                        console.error('❌ Erro ao coletar consentimento:', error_3);
                        throw error_3;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Exemplo: Processar solicitação de acesso a dados
     */
    LGPDUsageExamples.prototype.processDataAccessRequest = function (userId, email) {
        return __awaiter(this, void 0, void 0, function () {
            var modules, request, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        modules = this.service.getModules();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, modules.dataSubjectRights.processAccessRequest({
                                user_id: userId,
                                request_type: 'access',
                                contact_email: email,
                                identity_verified: true,
                                requested_data_categories: ['personal', 'usage', 'preferences'],
                                delivery_method: 'secure_download'
                            })];
                    case 2:
                        request = _a.sent();
                        console.log('✅ Solicitação de acesso processada:', request.request_id);
                        return [2 /*return*/, request];
                    case 3:
                        error_4 = _a.sent();
                        console.error('❌ Erro ao processar solicitação de acesso:', error_4);
                        throw error_4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Exemplo: Processar solicitação de exclusão de dados
     */
    LGPDUsageExamples.prototype.processDataDeletionRequest = function (userId, email) {
        return __awaiter(this, void 0, void 0, function () {
            var modules, request, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        modules = this.service.getModules();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, modules.dataSubjectRights.processDeletionRequest({
                                user_id: userId,
                                request_type: 'deletion',
                                contact_email: email,
                                identity_verified: true,
                                deletion_scope: 'all_data',
                                reason: 'user_request'
                            })];
                    case 2:
                        request = _a.sent();
                        console.log('✅ Solicitação de exclusão processada:', request.request_id);
                        return [2 /*return*/, request];
                    case 3:
                        error_5 = _a.sent();
                        console.error('❌ Erro ao processar solicitação de exclusão:', error_5);
                        throw error_5;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Exemplo: Criar política de retenção de dados
     */
    LGPDUsageExamples.prototype.createRetentionPolicy = function (tableName, retentionMonths) {
        return __awaiter(this, void 0, void 0, function () {
            var modules, policy, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        modules = this.service.getModules();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, modules.dataRetention.createRetentionPolicy({
                                name: "Pol\u00EDtica ".concat(tableName),
                                description: "Reten\u00E7\u00E3o autom\u00E1tica para tabela ".concat(tableName),
                                table_name: tableName,
                                retention_period_months: retentionMonths,
                                retention_type: 'soft_delete',
                                conditions: {
                                    date_column: 'created_at',
                                    additional_conditions: []
                                },
                                approval_required: true,
                                backup_before_deletion: true,
                                notification_before_days: 7
                            })];
                    case 2:
                        policy = _a.sent();
                        console.log('✅ Política de retenção criada:', policy.policy_id);
                        return [2 /*return*/, policy];
                    case 3:
                        error_6 = _a.sent();
                        console.error('❌ Erro ao criar política de retenção:', error_6);
                        throw error_6;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Exemplo: Registrar fornecedor terceiro
     */
    LGPDUsageExamples.prototype.registerThirdPartyProvider = function (providerData) {
        return __awaiter(this, void 0, void 0, function () {
            var modules, provider, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        modules = this.service.getModules();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, modules.thirdPartyCompliance.registerProvider({
                                name: providerData.name,
                                contact_email: providerData.email,
                                data_processing_agreement_url: providerData.agreementUrl,
                                data_categories_shared: providerData.dataCategories,
                                processing_purposes: providerData.purposes,
                                data_retention_period_months: providerData.retentionMonths,
                                international_transfer: providerData.internationalTransfer || false,
                                adequacy_decision: providerData.adequacyDecision,
                                safeguards_implemented: providerData.safeguards || [],
                                compliance_certifications: providerData.certifications || []
                            })];
                    case 2:
                        provider = _a.sent();
                        console.log('✅ Fornecedor registrado:', provider.provider_id);
                        return [2 /*return*/, provider];
                    case 3:
                        error_7 = _a.sent();
                        console.error('❌ Erro ao registrar fornecedor:', error_7);
                        throw error_7;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Exemplo: Gerar relatório de conformidade
     */
    LGPDUsageExamples.prototype.generateComplianceReport = function (reportType) {
        return __awaiter(this, void 0, void 0, function () {
            var modules, report, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        modules = this.service.getModules();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, modules.auditReporting.generateComplianceReport({
                                report_type: reportType,
                                include_metrics: true,
                                include_incidents: true,
                                include_requests: true,
                                include_consents: true,
                                format: 'pdf',
                                language: 'pt-BR'
                            })];
                    case 2:
                        report = _a.sent();
                        console.log('✅ Relatório gerado:', report.report_id);
                        return [2 /*return*/, report];
                    case 3:
                        error_8 = _a.sent();
                        console.error('❌ Erro ao gerar relatório:', error_8);
                        throw error_8;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return LGPDUsageExamples;
}());
exports.LGPDUsageExamples = LGPDUsageExamples;
/**
 * Exemplo de inicialização em uma aplicação Next.js
 */
function initializeLGPDInNextJS() {
    return __awaiter(this, void 0, void 0, function () {
        var service, error_9;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    service = getLGPDService();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, service.initialize()
                        // Configurar shutdown graceful
                    ];
                case 2:
                    _a.sent();
                    // Configurar shutdown graceful
                    process.on('SIGTERM', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    console.log('📡 Recebido SIGTERM, parando sistema LGPD...');
                                    return [4 /*yield*/, service.shutdown()];
                                case 1:
                                    _a.sent();
                                    process.exit(0);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    process.on('SIGINT', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    console.log('📡 Recebido SIGINT, parando sistema LGPD...');
                                    return [4 /*yield*/, service.shutdown()];
                                case 1:
                                    _a.sent();
                                    process.exit(0);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    return [2 /*return*/, service];
                case 3:
                    error_9 = _a.sent();
                    console.error('❌ Falha ao inicializar LGPD:', error_9);
                    throw error_9;
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Exemplo de uso em API Routes do Next.js
 */
exports.lgpdApiExamples = {
    // POST /api/lgpd/consent
    collectConsent: function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, userId, purpose, ipAddress, userAgent, examples, consent, error_10;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = req.body, userId = _a.userId, purpose = _a.purpose, ipAddress = _a.ipAddress, userAgent = _a.userAgent;
                        examples = new LGPDUsageExamples();
                        return [4 /*yield*/, examples.collectUserConsent(userId, purpose, ipAddress, userAgent)];
                    case 1:
                        consent = _b.sent();
                        res.status(200).json({ success: true, consent: consent });
                        return [3 /*break*/, 3];
                    case 2:
                        error_10 = _b.sent();
                        res.status(500).json({ success: false, error: error_10.message });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    // POST /api/lgpd/data-request
    handleDataRequest: function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, userId, email, requestType, examples, result, error_11;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        _a = req.body, userId = _a.userId, email = _a.email, requestType = _a.requestType;
                        examples = new LGPDUsageExamples();
                        result = void 0;
                        if (!(requestType === 'access')) return [3 /*break*/, 2];
                        return [4 /*yield*/, examples.processDataAccessRequest(userId, email)];
                    case 1:
                        result = _b.sent();
                        return [3 /*break*/, 5];
                    case 2:
                        if (!(requestType === 'deletion')) return [3 /*break*/, 4];
                        return [4 /*yield*/, examples.processDataDeletionRequest(userId, email)];
                    case 3:
                        result = _b.sent();
                        return [3 /*break*/, 5];
                    case 4: throw new Error('Tipo de solicitação inválido');
                    case 5:
                        res.status(200).json({ success: true, request: result });
                        return [3 /*break*/, 7];
                    case 6:
                        error_11 = _b.sent();
                        res.status(500).json({ success: false, error: error_11.message });
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    },
    // GET /api/lgpd/dashboard
    getDashboard: function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var service, dashboard, error_12;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        service = getLGPDService();
                        return [4 /*yield*/, service.getDashboard()];
                    case 1:
                        dashboard = _a.sent();
                        res.status(200).json({ success: true, dashboard: dashboard });
                        return [3 /*break*/, 3];
                    case 2:
                        error_12 = _a.sent();
                        res.status(500).json({ success: false, error: error_12.message });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    // GET /api/lgpd/metrics
    getMetrics: function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var service, metrics, error_13;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        service = getLGPDService();
                        return [4 /*yield*/, service.getMetrics()];
                    case 1:
                        metrics = _a.sent();
                        res.status(200).json({ success: true, metrics: metrics });
                        return [3 /*break*/, 3];
                    case 2:
                        error_13 = _a.sent();
                        res.status(500).json({ success: false, error: error_13.message });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    }
};
/**
 * Exemplo de middleware para verificação de consentimento
 */
function lgpdConsentMiddleware(requiredPurpose) {
    var _this = this;
    return function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
        var userId, service, modules, consents, error_14;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id // Assumindo que o usuário está autenticado
                    ;
                    if (!userId) {
                        return [2 /*return*/, res.status(401).json({ error: 'Usuário não autenticado' })];
                    }
                    service = getLGPDService();
                    modules = service.getModules();
                    return [4 /*yield*/, modules.consentAutomation.getConsents({
                            user_id: userId,
                            purpose: requiredPurpose,
                            active_only: true
                        })];
                case 1:
                    consents = _b.sent();
                    if (consents.consents.length === 0) {
                        return [2 /*return*/, res.status(403).json({
                                error: 'Consentimento necessário',
                                required_purpose: requiredPurpose,
                                consent_url: "/consent?purpose=".concat(requiredPurpose)
                            })];
                    }
                    // Adicionar informações de consentimento ao request
                    req.lgpd = {
                        consents: consents.consents,
                        purpose: requiredPurpose
                    };
                    next();
                    return [3 /*break*/, 3];
                case 2:
                    error_14 = _b.sent();
                    console.error('Erro no middleware LGPD:', error_14);
                    res.status(500).json({ error: 'Erro interno do servidor' });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
}
// Exportar instância singleton
exports.default = getLGPDService;

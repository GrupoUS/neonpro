"use strict";
/**
 * LGPD Automation System - Testes Automatizados
 *
 * Suite completa de testes para validar o funcionamento do sistema de automação LGPD
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
exports.testHelpers = void 0;
var globals_1 = require("@jest/globals");
var index_1 = require("./index");
// Mock do Supabase para testes
var mockSupabase = {
    from: globals_1.jest.fn(function () { return ({
        select: globals_1.jest.fn(function () { return ({
            eq: globals_1.jest.fn(function () { return ({
                single: globals_1.jest.fn(function () { return Promise.resolve({ data: {}, error: null }); })
            }); })
        }); }),
        insert: globals_1.jest.fn(function () { return ({
            select: globals_1.jest.fn(function () { return ({
                single: globals_1.jest.fn(function () { return Promise.resolve({ data: { id: 'test-id' }, error: null }); })
            }); })
        }); }),
        update: globals_1.jest.fn(function () { return ({
            eq: globals_1.jest.fn(function () { return Promise.resolve({ data: {}, error: null }); })
        }); }),
        delete: globals_1.jest.fn(function () { return ({
            eq: globals_1.jest.fn(function () { return Promise.resolve({ data: {}, error: null }); })
        }); })
    }); }),
    rpc: globals_1.jest.fn(function () { return Promise.resolve({ data: {}, error: null }); }),
    channel: globals_1.jest.fn(function () { return ({
        on: globals_1.jest.fn(function () { return ({
            subscribe: globals_1.jest.fn()
        }); })
    }); })
};
// Mock do LGPDComplianceManager
var mockComplianceManager = {
    logAuditEvent: globals_1.jest.fn(function () { return Promise.resolve({ success: true }); }),
    checkUserPermission: globals_1.jest.fn(function () { return Promise.resolve(true); }),
    getDashboardMetrics: globals_1.jest.fn(function () { return Promise.resolve({}); }),
    getConsents: globals_1.jest.fn(function () { return Promise.resolve({ consents: [] }); }),
    createOrUpdateConsent: globals_1.jest.fn(function () { return Promise.resolve({ consent_id: 'test-consent' }); })
};
(0, globals_1.describe)('LGPD Automation System', function () {
    var orchestrator;
    var config;
    (0, globals_1.beforeAll)(function () {
        // Configuração de teste
        config = (0, index_1.getLGPDAutomationConfig)('development');
        // Inicializar orquestrador com mocks
        orchestrator = new index_1.LGPDAutomationOrchestrator(mockSupabase, mockComplianceManager, config);
    });
    (0, globals_1.afterAll)(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!orchestrator) return [3 /*break*/, 2];
                    return [4 /*yield*/, orchestrator.stopAllAutomation()];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.describe)('Orchestrator', function () {
        (0, globals_1.test)('should initialize successfully', function () {
            (0, globals_1.expect)(orchestrator).toBeDefined();
            (0, globals_1.expect)(typeof orchestrator.startAllAutomation).toBe('function');
            (0, globals_1.expect)(typeof orchestrator.stopAllAutomation).toBe('function');
        });
        (0, globals_1.test)('should start all automation modules', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, orchestrator.startAllAutomation()];
                    case 1:
                        result = _a.sent();
                        (0, globals_1.expect)(result).toHaveProperty('success');
                        (0, globals_1.expect)(result).toHaveProperty('started_modules');
                        (0, globals_1.expect)(result).toHaveProperty('failed_modules');
                        (0, globals_1.expect)(Array.isArray(result.started_modules)).toBe(true);
                        (0, globals_1.expect)(Array.isArray(result.failed_modules)).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.test)('should stop all automation modules', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, orchestrator.stopAllAutomation()];
                    case 1:
                        result = _a.sent();
                        (0, globals_1.expect)(result).toHaveProperty('success');
                        (0, globals_1.expect)(result).toHaveProperty('stopped_modules');
                        (0, globals_1.expect)(Array.isArray(result.stopped_modules)).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.test)('should get automation status', function () { return __awaiter(void 0, void 0, void 0, function () {
            var status;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, orchestrator.getAutomationStatus()];
                    case 1:
                        status = _a.sent();
                        (0, globals_1.expect)(Array.isArray(status)).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.test)('should get automation metrics', function () { return __awaiter(void 0, void 0, void 0, function () {
            var metrics;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, orchestrator.getAutomationMetrics()];
                    case 1:
                        metrics = _a.sent();
                        (0, globals_1.expect)(metrics).toBeDefined();
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.test)('should get unified dashboard', function () { return __awaiter(void 0, void 0, void 0, function () {
            var dashboard;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, orchestrator.getUnifiedDashboard()];
                    case 1:
                        dashboard = _a.sent();
                        (0, globals_1.expect)(dashboard).toBeDefined();
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.test)('should get modules', function () {
            var modules = orchestrator.getModules();
            (0, globals_1.expect)(modules).toHaveProperty('consentAutomation');
            (0, globals_1.expect)(modules).toHaveProperty('dataSubjectRights');
            (0, globals_1.expect)(modules).toHaveProperty('complianceMonitor');
            (0, globals_1.expect)(modules).toHaveProperty('dataRetention');
            (0, globals_1.expect)(modules).toHaveProperty('breachDetection');
            (0, globals_1.expect)(modules).toHaveProperty('dataMinimization');
            (0, globals_1.expect)(modules).toHaveProperty('thirdPartyCompliance');
            (0, globals_1.expect)(modules).toHaveProperty('auditReporting');
        });
    });
    (0, globals_1.describe)('Consent Automation Manager', function () {
        var consentManager;
        (0, globals_1.beforeEach)(function () {
            consentManager = new index_1.ConsentAutomationManager(mockSupabase, mockComplianceManager, config.consent_automation);
        });
        (0, globals_1.test)('should collect consent with tracking', function () { return __awaiter(void 0, void 0, void 0, function () {
            var consentData, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        consentData = {
                            user_id: 'test-user',
                            purpose: 'marketing',
                            consent_given: true,
                            collection_method: 'web_form',
                            ip_address: '192.168.1.1',
                            user_agent: 'Mozilla/5.0 Test',
                            consent_text: 'Test consent',
                            legal_basis: 'consent',
                            data_categories: ['personal'],
                            retention_period_months: 24,
                            third_party_sharing: false
                        };
                        return [4 /*yield*/, consentManager.collectConsentWithTracking(consentData)];
                    case 1:
                        result = _a.sent();
                        (0, globals_1.expect)(result).toHaveProperty('consent_id');
                        (0, globals_1.expect)(result).toHaveProperty('tracking_id');
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.test)('should process consent renewal', function () { return __awaiter(void 0, void 0, void 0, function () {
            var renewalData, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        renewalData = {
                            consent_id: 'test-consent',
                            user_id: 'test-user',
                            purpose: 'marketing',
                            renewal_method: 'email',
                            notification_sent: true
                        };
                        return [4 /*yield*/, consentManager.processConsentRenewal(renewalData)];
                    case 1:
                        result = _a.sent();
                        (0, globals_1.expect)(result).toHaveProperty('success');
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.test)('should withdraw consent', function () { return __awaiter(void 0, void 0, void 0, function () {
            var withdrawalData, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        withdrawalData = {
                            consent_id: 'test-consent',
                            user_id: 'test-user',
                            withdrawal_reason: 'user_request',
                            withdrawal_method: 'web_form',
                            ip_address: '192.168.1.1',
                            user_agent: 'Mozilla/5.0 Test'
                        };
                        return [4 /*yield*/, consentManager.withdrawConsent(withdrawalData)];
                    case 1:
                        result = _a.sent();
                        (0, globals_1.expect)(result).toHaveProperty('success');
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.test)('should get consent analytics', function () { return __awaiter(void 0, void 0, void 0, function () {
            var filters, analytics;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        filters = {
                            start_date: '2024-01-01',
                            end_date: '2024-12-31',
                            purpose: 'marketing'
                        };
                        return [4 /*yield*/, consentManager.getConsentAnalytics(filters)];
                    case 1:
                        analytics = _a.sent();
                        (0, globals_1.expect)(analytics).toHaveProperty('total_consents');
                        (0, globals_1.expect)(analytics).toHaveProperty('consent_rate');
                        (0, globals_1.expect)(analytics).toHaveProperty('withdrawal_rate');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, globals_1.describe)('Data Subject Rights Automation', function () {
        var rightsManager;
        (0, globals_1.beforeEach)(function () {
            rightsManager = new index_1.DataSubjectRightsAutomation(mockSupabase, mockComplianceManager, config.data_subject_rights);
        });
        (0, globals_1.test)('should process access request', function () { return __awaiter(void 0, void 0, void 0, function () {
            var requestData, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        requestData = {
                            user_id: 'test-user',
                            request_type: 'access',
                            contact_email: 'test@example.com',
                            identity_verified: true,
                            requested_data_categories: ['personal', 'usage'],
                            delivery_method: 'secure_download'
                        };
                        return [4 /*yield*/, rightsManager.processAccessRequest(requestData)];
                    case 1:
                        result = _a.sent();
                        (0, globals_1.expect)(result).toHaveProperty('request_id');
                        (0, globals_1.expect)(result).toHaveProperty('status');
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.test)('should process rectification request', function () { return __awaiter(void 0, void 0, void 0, function () {
            var requestData, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        requestData = {
                            user_id: 'test-user',
                            request_type: 'rectification',
                            contact_email: 'test@example.com',
                            identity_verified: true,
                            rectification_details: {
                                field: 'email',
                                current_value: 'old@example.com',
                                new_value: 'new@example.com',
                                justification: 'Email address changed'
                            }
                        };
                        return [4 /*yield*/, rightsManager.processRectificationRequest(requestData)];
                    case 1:
                        result = _a.sent();
                        (0, globals_1.expect)(result).toHaveProperty('request_id');
                        (0, globals_1.expect)(result).toHaveProperty('status');
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.test)('should process deletion request', function () { return __awaiter(void 0, void 0, void 0, function () {
            var requestData, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        requestData = {
                            user_id: 'test-user',
                            request_type: 'deletion',
                            contact_email: 'test@example.com',
                            identity_verified: true,
                            deletion_scope: 'all_data',
                            reason: 'user_request'
                        };
                        return [4 /*yield*/, rightsManager.processDeletionRequest(requestData)];
                    case 1:
                        result = _a.sent();
                        (0, globals_1.expect)(result).toHaveProperty('request_id');
                        (0, globals_1.expect)(result).toHaveProperty('status');
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.test)('should process portability request', function () { return __awaiter(void 0, void 0, void 0, function () {
            var requestData, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        requestData = {
                            user_id: 'test-user',
                            request_type: 'portability',
                            contact_email: 'test@example.com',
                            identity_verified: true,
                            export_format: 'json',
                            data_categories: ['personal', 'preferences']
                        };
                        return [4 /*yield*/, rightsManager.processPortabilityRequest(requestData)];
                    case 1:
                        result = _a.sent();
                        (0, globals_1.expect)(result).toHaveProperty('request_id');
                        (0, globals_1.expect)(result).toHaveProperty('status');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, globals_1.describe)('Real-Time Compliance Monitor', function () {
        var complianceMonitor;
        (0, globals_1.beforeEach)(function () {
            complianceMonitor = new index_1.RealTimeComplianceMonitor(mockSupabase, mockComplianceManager, config.compliance_monitoring);
        });
        (0, globals_1.test)('should start monitoring', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, complianceMonitor.startMonitoring()];
                    case 1:
                        result = _a.sent();
                        (0, globals_1.expect)(result).toHaveProperty('success');
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.test)('should get compliance dashboard', function () { return __awaiter(void 0, void 0, void 0, function () {
            var dashboard;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, complianceMonitor.getComplianceDashboard()];
                    case 1:
                        dashboard = _a.sent();
                        (0, globals_1.expect)(dashboard).toHaveProperty('overall_compliance_score');
                        (0, globals_1.expect)(dashboard).toHaveProperty('compliance_checks');
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.test)('should perform compliance check', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, complianceMonitor.performComplianceCheck()];
                    case 1:
                        result = _a.sent();
                        (0, globals_1.expect)(result).toHaveProperty('overall_score');
                        (0, globals_1.expect)(result).toHaveProperty('checks');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, globals_1.describe)('Data Retention Automation', function () {
        var retentionManager;
        (0, globals_1.beforeEach)(function () {
            retentionManager = new index_1.DataRetentionAutomation(mockSupabase, mockComplianceManager, config.data_retention);
        });
        (0, globals_1.test)('should create retention policy', function () { return __awaiter(void 0, void 0, void 0, function () {
            var policyData, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        policyData = {
                            name: 'Test Policy',
                            description: 'Test retention policy',
                            table_name: 'test_table',
                            retention_period_months: 24,
                            retention_type: 'soft_delete',
                            conditions: {
                                date_column: 'created_at',
                                additional_conditions: []
                            },
                            approval_required: true,
                            backup_before_deletion: true,
                            notification_before_days: 7
                        };
                        return [4 /*yield*/, retentionManager.createRetentionPolicy(policyData)];
                    case 1:
                        result = _a.sent();
                        (0, globals_1.expect)(result).toHaveProperty('policy_id');
                        (0, globals_1.expect)(result).toHaveProperty('status');
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.test)('should schedule retention execution', function () { return __awaiter(void 0, void 0, void 0, function () {
            var scheduleData, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        scheduleData = {
                            policy_id: 'test-policy',
                            execution_date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
                            dry_run: true,
                            notification_recipients: ['admin@example.com']
                        };
                        return [4 /*yield*/, retentionManager.scheduleRetentionExecution(scheduleData)];
                    case 1:
                        result = _a.sent();
                        (0, globals_1.expect)(result).toHaveProperty('schedule_id');
                        (0, globals_1.expect)(result).toHaveProperty('status');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, globals_1.describe)('Breach Detection Automation', function () {
        var breachDetection;
        (0, globals_1.beforeEach)(function () {
            breachDetection = new index_1.BreachDetectionAutomation(mockSupabase, mockComplianceManager, config.breach_detection);
        });
        (0, globals_1.test)('should create detection rule', function () { return __awaiter(void 0, void 0, void 0, function () {
            var ruleData, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ruleData = {
                            name: 'Test Rule',
                            description: 'Test detection rule',
                            rule_type: 'failed_login',
                            conditions: {
                                threshold: 5,
                                time_window_minutes: 15,
                                user_scope: 'all'
                            },
                            severity: 'medium',
                            auto_response_enabled: true,
                            notification_enabled: true
                        };
                        return [4 /*yield*/, breachDetection.createDetectionRule(ruleData)];
                    case 1:
                        result = _a.sent();
                        (0, globals_1.expect)(result).toHaveProperty('rule_id');
                        (0, globals_1.expect)(result).toHaveProperty('status');
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.test)('should report incident', function () { return __awaiter(void 0, void 0, void 0, function () {
            var incidentData, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        incidentData = {
                            incident_type: 'unauthorized_access',
                            severity: 'high',
                            description: 'Test incident',
                            affected_data_categories: ['personal'],
                            estimated_affected_users: 100,
                            detection_method: 'automated',
                            source_ip: '192.168.1.1',
                            user_agent: 'Test Agent'
                        };
                        return [4 /*yield*/, breachDetection.reportIncident(incidentData)];
                    case 1:
                        result = _a.sent();
                        (0, globals_1.expect)(result).toHaveProperty('incident_id');
                        (0, globals_1.expect)(result).toHaveProperty('status');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, globals_1.describe)('Data Minimization Automation', function () {
        var dataMinimization;
        (0, globals_1.beforeEach)(function () {
            dataMinimization = new index_1.DataMinimizationAutomation(mockSupabase, mockComplianceManager, config.data_minimization);
        });
        (0, globals_1.test)('should create minimization rule', function () { return __awaiter(void 0, void 0, void 0, function () {
            var ruleData, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ruleData = {
                            name: 'Test Minimization Rule',
                            description: 'Test rule for data minimization',
                            table_name: 'test_table',
                            minimization_type: 'anonymization',
                            conditions: {
                                age_threshold_days: 365,
                                data_categories: ['personal'],
                                exclude_conditions: []
                            },
                            approval_required: true,
                            backup_enabled: true,
                            business_impact_assessment: true
                        };
                        return [4 /*yield*/, dataMinimization.createMinimizationRule(ruleData)];
                    case 1:
                        result = _a.sent();
                        (0, globals_1.expect)(result).toHaveProperty('rule_id');
                        (0, globals_1.expect)(result).toHaveProperty('status');
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.test)('should get data inventory', function () { return __awaiter(void 0, void 0, void 0, function () {
            var filters, inventory;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        filters = {
                            table_name: 'test_table',
                            data_categories: ['personal'],
                            age_threshold_days: 365
                        };
                        return [4 /*yield*/, dataMinimization.getDataInventory(filters)];
                    case 1:
                        inventory = _a.sent();
                        (0, globals_1.expect)(inventory).toHaveProperty('tables');
                        (0, globals_1.expect)(inventory).toHaveProperty('total_records');
                        (0, globals_1.expect)(inventory).toHaveProperty('data_categories');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, globals_1.describe)('Third Party Compliance Automation', function () {
        var thirdPartyCompliance;
        (0, globals_1.beforeEach)(function () {
            thirdPartyCompliance = new index_1.ThirdPartyComplianceAutomation(mockSupabase, mockComplianceManager, config.third_party_compliance);
        });
        (0, globals_1.test)('should register provider', function () { return __awaiter(void 0, void 0, void 0, function () {
            var providerData, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        providerData = {
                            name: 'Test Provider',
                            contact_email: 'provider@example.com',
                            data_processing_agreement_url: 'https://example.com/dpa',
                            data_categories_shared: ['personal', 'usage'],
                            processing_purposes: ['analytics', 'marketing'],
                            data_retention_period_months: 24,
                            international_transfer: false,
                            adequacy_decision: null,
                            safeguards_implemented: ['encryption', 'access_controls'],
                            compliance_certifications: ['ISO27001']
                        };
                        return [4 /*yield*/, thirdPartyCompliance.registerProvider(providerData)];
                    case 1:
                        result = _a.sent();
                        (0, globals_1.expect)(result).toHaveProperty('provider_id');
                        (0, globals_1.expect)(result).toHaveProperty('status');
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.test)('should create data sharing agreement', function () { return __awaiter(void 0, void 0, void 0, function () {
            var agreementData, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        agreementData = {
                            provider_id: 'test-provider',
                            agreement_type: 'data_processing',
                            data_categories: ['personal'],
                            processing_purposes: ['analytics'],
                            retention_period_months: 12,
                            international_transfer: false,
                            legal_basis: 'legitimate_interest',
                            safeguards: ['encryption'],
                            start_date: new Date().toISOString(),
                            end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
                        };
                        return [4 /*yield*/, thirdPartyCompliance.createDataSharingAgreement(agreementData)];
                    case 1:
                        result = _a.sent();
                        (0, globals_1.expect)(result).toHaveProperty('agreement_id');
                        (0, globals_1.expect)(result).toHaveProperty('status');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, globals_1.describe)('Audit Reporting Automation', function () {
        var auditReporting;
        (0, globals_1.beforeEach)(function () {
            auditReporting = new index_1.AuditReportingAutomation(mockSupabase, mockComplianceManager, config.audit_reporting);
        });
        (0, globals_1.test)('should generate compliance report', function () { return __awaiter(void 0, void 0, void 0, function () {
            var reportData, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        reportData = {
                            report_type: 'monthly',
                            include_metrics: true,
                            include_incidents: true,
                            include_requests: true,
                            include_consents: true,
                            format: 'pdf',
                            language: 'pt-BR'
                        };
                        return [4 /*yield*/, auditReporting.generateComplianceReport(reportData)];
                    case 1:
                        result = _a.sent();
                        (0, globals_1.expect)(result).toHaveProperty('report_id');
                        (0, globals_1.expect)(result).toHaveProperty('status');
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.test)('should schedule report', function () { return __awaiter(void 0, void 0, void 0, function () {
            var scheduleData, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        scheduleData = {
                            report_type: 'weekly',
                            schedule_pattern: 'weekly',
                            recipients: ['admin@example.com'],
                            format: 'pdf',
                            auto_send: true,
                            include_metrics: true,
                            include_incidents: true
                        };
                        return [4 /*yield*/, auditReporting.scheduleReport(scheduleData)];
                    case 1:
                        result = _a.sent();
                        (0, globals_1.expect)(result).toHaveProperty('schedule_id');
                        (0, globals_1.expect)(result).toHaveProperty('status');
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.test)('should get audit trail', function () { return __awaiter(void 0, void 0, void 0, function () {
            var filters, trail;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        filters = {
                            start_date: '2024-01-01',
                            end_date: '2024-12-31',
                            event_type: 'consent_collected',
                            user_id: 'test-user'
                        };
                        return [4 /*yield*/, auditReporting.getAuditTrail(filters)];
                    case 1:
                        trail = _a.sent();
                        (0, globals_1.expect)(trail).toHaveProperty('events');
                        (0, globals_1.expect)(trail).toHaveProperty('total_count');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, globals_1.describe)('Configuration', function () {
        (0, globals_1.test)('should get default configuration', function () {
            var defaultConfig = (0, index_1.getLGPDAutomationConfig)('default');
            (0, globals_1.expect)(defaultConfig).toHaveProperty('consent_automation');
            (0, globals_1.expect)(defaultConfig).toHaveProperty('data_subject_rights');
            (0, globals_1.expect)(defaultConfig).toHaveProperty('compliance_monitoring');
            (0, globals_1.expect)(defaultConfig).toHaveProperty('data_retention');
            (0, globals_1.expect)(defaultConfig).toHaveProperty('breach_detection');
            (0, globals_1.expect)(defaultConfig).toHaveProperty('data_minimization');
            (0, globals_1.expect)(defaultConfig).toHaveProperty('third_party_compliance');
            (0, globals_1.expect)(defaultConfig).toHaveProperty('audit_reporting');
            (0, globals_1.expect)(defaultConfig).toHaveProperty('global_settings');
        });
        (0, globals_1.test)('should get development configuration', function () {
            var devConfig = (0, index_1.getLGPDAutomationConfig)('development');
            (0, globals_1.expect)(devConfig.consent_automation.processing_interval_minutes).toBe(5);
            (0, globals_1.expect)(devConfig.data_subject_rights.processing_interval_minutes).toBe(10);
            (0, globals_1.expect)(devConfig.compliance_monitoring.monitoring_interval_minutes).toBe(1);
        });
        (0, globals_1.test)('should get production configuration', function () {
            var prodConfig = (0, index_1.getLGPDAutomationConfig)('production');
            (0, globals_1.expect)(prodConfig.compliance_monitoring.alert_thresholds.consent_compliance).toBe(98);
            (0, globals_1.expect)(prodConfig.breach_detection.detection_rules.failed_login_threshold).toBe(3);
            (0, globals_1.expect)(prodConfig.data_retention.approval_required).toBe(true);
        });
    });
    (0, globals_1.describe)('Error Handling', function () {
        (0, globals_1.test)('should handle database errors gracefully', function () { return __awaiter(void 0, void 0, void 0, function () {
            var errorSupabase, errorOrchestrator;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        errorSupabase = __assign(__assign({}, mockSupabase), { from: globals_1.jest.fn(function () { return ({
                                select: globals_1.jest.fn(function () { return Promise.resolve({ data: null, error: { message: 'Database error' } }); })
                            }); }) });
                        errorOrchestrator = new index_1.LGPDAutomationOrchestrator(errorSupabase, mockComplianceManager, config);
                        return [4 /*yield*/, (0, globals_1.expect)(errorOrchestrator.getAutomationStatus()).rejects.toThrow()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.test)('should handle invalid configuration', function () {
            var invalidConfig = __assign(__assign({}, config), { consent_automation: null });
            (0, globals_1.expect)(function () {
                new index_1.LGPDAutomationOrchestrator(mockSupabase, mockComplianceManager, invalidConfig);
            }).toThrow();
        });
    });
    (0, globals_1.describe)('Performance', function () {
        (0, globals_1.test)('should handle batch operations efficiently', function () { return __awaiter(void 0, void 0, void 0, function () {
            var modules, batchSize, consentPromises, startTime, endTime, executionTime;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        modules = orchestrator.getModules();
                        batchSize = 100;
                        consentPromises = Array.from({ length: batchSize }, function (_, i) {
                            return modules.consentAutomation.collectConsentWithTracking({
                                user_id: "test-user-".concat(i),
                                purpose: 'marketing',
                                consent_given: true,
                                collection_method: 'web_form',
                                ip_address: '192.168.1.1',
                                user_agent: 'Test Agent',
                                consent_text: 'Test consent',
                                legal_basis: 'consent',
                                data_categories: ['personal'],
                                retention_period_months: 24,
                                third_party_sharing: false
                            });
                        });
                        startTime = Date.now();
                        return [4 /*yield*/, Promise.all(consentPromises)];
                    case 1:
                        _a.sent();
                        endTime = Date.now();
                        executionTime = endTime - startTime;
                        (0, globals_1.expect)(executionTime).toBeLessThan(5000); // Should complete within 5 seconds
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.test)('should handle concurrent operations', function () { return __awaiter(void 0, void 0, void 0, function () {
            var modules, operations, startTime, endTime, executionTime;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        modules = orchestrator.getModules();
                        operations = [
                            modules.consentAutomation.getConsentAnalytics({}),
                            modules.dataSubjectRights.getRequestStatus('test-request'),
                            modules.complianceMonitor.getComplianceDashboard(),
                            modules.dataRetention.getRetentionStatus(),
                            modules.auditReporting.getAuditTrail({})
                        ];
                        startTime = Date.now();
                        return [4 /*yield*/, Promise.allSettled(operations)];
                    case 1:
                        _a.sent();
                        endTime = Date.now();
                        executionTime = endTime - startTime;
                        (0, globals_1.expect)(executionTime).toBeLessThan(3000); // Should complete within 3 seconds
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
// Helper functions for testing
exports.testHelpers = {
    /**
     * Create mock user data for testing
     */
    createMockUser: function (id) {
        if (id === void 0) { id = 'test-user'; }
        return ({
            id: id,
            email: "".concat(id, "@example.com"),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });
    },
    /**
     * Create mock consent data for testing
     */
    createMockConsent: function (userId, purpose) {
        if (userId === void 0) { userId = 'test-user'; }
        if (purpose === void 0) { purpose = 'marketing'; }
        return ({
            user_id: userId,
            purpose: purpose,
            consent_given: true,
            collection_method: 'web_form',
            ip_address: '192.168.1.1',
            user_agent: 'Mozilla/5.0 Test',
            consent_text: "Test consent for ".concat(purpose),
            legal_basis: 'consent',
            data_categories: ['personal'],
            retention_period_months: 24,
            third_party_sharing: false
        });
    },
    /**
     * Create mock data subject request for testing
     */
    createMockDataSubjectRequest: function (userId, type) {
        if (userId === void 0) { userId = 'test-user'; }
        if (type === void 0) { type = 'access'; }
        return ({
            user_id: userId,
            request_type: type,
            contact_email: "".concat(userId, "@example.com"),
            identity_verified: true,
            requested_data_categories: ['personal', 'usage'],
            delivery_method: 'secure_download'
        });
    },
    /**
     * Wait for async operations to complete
     */
    waitFor: function (ms) { return new Promise(function (resolve) { return setTimeout(resolve, ms); }); },
    /**
     * Generate test data in bulk
     */
    generateTestData: function (count, generator) {
        return Array.from({ length: count }, function (_, i) { return generator(i); });
    }
};

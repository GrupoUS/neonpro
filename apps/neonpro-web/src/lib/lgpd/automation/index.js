"use strict";
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
exports.AuditReportingAutomation = exports.ThirdPartyComplianceAutomation = exports.DataMinimizationAutomation = exports.BreachDetectionAutomation = exports.DataRetentionAutomation = exports.RealTimeComplianceMonitor = exports.DataSubjectRightsAutomation = exports.ConsentAutomationManager = exports.LGPDAutomationOrchestrator = void 0;
// Import all automation modules
var ConsentAutomationManager_1 = require("./ConsentAutomationManager");
Object.defineProperty(exports, "ConsentAutomationManager", { enumerable: true, get: function () { return ConsentAutomationManager_1.ConsentAutomationManager; } });
var DataSubjectRightsAutomation_1 = require("./DataSubjectRightsAutomation");
Object.defineProperty(exports, "DataSubjectRightsAutomation", { enumerable: true, get: function () { return DataSubjectRightsAutomation_1.DataSubjectRightsAutomation; } });
var RealTimeComplianceMonitor_1 = require("./RealTimeComplianceMonitor");
Object.defineProperty(exports, "RealTimeComplianceMonitor", { enumerable: true, get: function () { return RealTimeComplianceMonitor_1.RealTimeComplianceMonitor; } });
var DataRetentionAutomation_1 = require("./DataRetentionAutomation");
Object.defineProperty(exports, "DataRetentionAutomation", { enumerable: true, get: function () { return DataRetentionAutomation_1.DataRetentionAutomation; } });
var BreachDetectionAutomation_1 = require("./BreachDetectionAutomation");
Object.defineProperty(exports, "BreachDetectionAutomation", { enumerable: true, get: function () { return BreachDetectionAutomation_1.BreachDetectionAutomation; } });
var DataMinimizationAutomation_1 = require("./DataMinimizationAutomation");
Object.defineProperty(exports, "DataMinimizationAutomation", { enumerable: true, get: function () { return DataMinimizationAutomation_1.DataMinimizationAutomation; } });
var ThirdPartyComplianceAutomation_1 = require("./ThirdPartyComplianceAutomation");
Object.defineProperty(exports, "ThirdPartyComplianceAutomation", { enumerable: true, get: function () { return ThirdPartyComplianceAutomation_1.ThirdPartyComplianceAutomation; } });
var AuditReportingAutomation_1 = require("./AuditReportingAutomation");
Object.defineProperty(exports, "AuditReportingAutomation", { enumerable: true, get: function () { return AuditReportingAutomation_1.AuditReportingAutomation; } });
/**
 * LGPD Automation Orchestrator
 *
 * Central orchestration system that manages all LGPD automation modules,
 * providing unified control, monitoring, and coordination.
 */
var LGPDAutomationOrchestrator = /** @class */ (function () {
    function LGPDAutomationOrchestrator(supabase, complianceManager, config) {
        // Orchestrator state
        this.isRunning = false;
        this.monitoringInterval = null;
        this.alertCallbacks = [];
        this.statusCallbacks = [];
        this.supabase = supabase;
        this.complianceManager = complianceManager;
        this.config = config;
        // Initialize automation modules
        this.initializeModules();
    }
    /**
     * Initialize all automation modules
     */
    LGPDAutomationOrchestrator.prototype.initializeModules = function () {
        this.consentAutomation = new ConsentAutomationManager_1.ConsentAutomationManager(this.supabase, this.complianceManager, this.config.consent_automation);
        this.dataSubjectRights = new DataSubjectRightsAutomation_1.DataSubjectRightsAutomation(this.supabase, this.complianceManager, this.config.data_subject_rights);
        this.complianceMonitor = new RealTimeComplianceMonitor_1.RealTimeComplianceMonitor(this.supabase, this.complianceManager, this.config.compliance_monitoring);
        this.dataRetention = new DataRetentionAutomation_1.DataRetentionAutomation(this.supabase, this.complianceManager, this.config.data_retention);
        this.breachDetection = new BreachDetectionAutomation_1.BreachDetectionAutomation(this.supabase, this.complianceManager, this.config.breach_detection);
        this.dataMinimization = new DataMinimizationAutomation_1.DataMinimizationAutomation(this.supabase, this.complianceManager, this.config.data_minimization);
        this.thirdPartyCompliance = new ThirdPartyComplianceAutomation_1.ThirdPartyComplianceAutomation(this.supabase, this.complianceManager, this.config.third_party_compliance);
        this.auditReporting = new AuditReportingAutomation_1.AuditReportingAutomation(this.supabase, this.complianceManager, this.config.audit_reporting);
        // Set up cross-module event handlers
        this.setupCrossModuleIntegration();
    };
    /**
     * Start all automation modules
     */
    LGPDAutomationOrchestrator.prototype.startAllAutomation = function () {
        return __awaiter(this, void 0, void 0, function () {
            var startedModules, failedModules, modules, _i, modules_1, module_1, error_1, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startedModules = [];
                        failedModules = [];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 12, , 13]);
                        console.log('Starting LGPD Automation Orchestrator...');
                        modules = [
                            { name: 'consent_automation', instance: this.consentAutomation, method: 'startAutomation' },
                            { name: 'data_subject_rights', instance: this.dataSubjectRights, method: 'startAutomation' },
                            { name: 'compliance_monitoring', instance: this.complianceMonitor, method: 'startMonitoring' },
                            { name: 'data_retention', instance: this.dataRetention, method: 'startAutomatedProcessing' },
                            { name: 'breach_detection', instance: this.breachDetection, method: 'startRealTimeDetection' },
                            { name: 'data_minimization', instance: this.dataMinimization, method: 'startAutomation' },
                            { name: 'third_party_compliance', instance: this.thirdPartyCompliance, method: 'startComplianceMonitoring' },
                            { name: 'audit_reporting', instance: this.auditReporting, method: 'startAutomatedReporting' }
                        ];
                        _i = 0, modules_1 = modules;
                        _a.label = 2;
                    case 2:
                        if (!(_i < modules_1.length)) return [3 /*break*/, 8];
                        module_1 = modules_1[_i];
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 7]);
                        return [4 /*yield*/, module_1.instance[module_1.method]()];
                    case 4:
                        _a.sent();
                        startedModules.push(module_1.name);
                        console.log("\u2705 ".concat(module_1.name, " started successfully"));
                        return [3 /*break*/, 7];
                    case 5:
                        error_1 = _a.sent();
                        failedModules.push(module_1.name);
                        console.error("\u274C Failed to start ".concat(module_1.name, ":"), error_1);
                        return [4 /*yield*/, this.createAlert({
                                module: module_1.name,
                                alert_type: 'error',
                                title: 'Module Start Failed',
                                message: "Failed to start ".concat(module_1.name),
                                details: { error: error_1.message }
                            })];
                    case 6:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 7:
                        _i++;
                        return [3 /*break*/, 2];
                    case 8:
                        if (!(startedModules.length > 0)) return [3 /*break*/, 10];
                        this.isRunning = true;
                        return [4 /*yield*/, this.startOrchestatorMonitoring()];
                    case 9:
                        _a.sent();
                        _a.label = 10;
                    case 10: 
                    // Log orchestrator start
                    return [4 /*yield*/, this.complianceManager.logAuditEvent({
                            event_type: 'automation_orchestrator',
                            resource_type: 'orchestrator',
                            resource_id: 'main',
                            action: 'orchestrator_started',
                            details: {
                                started_modules: startedModules,
                                failed_modules: failedModules,
                                total_modules: modules.length
                            }
                        })];
                    case 11:
                        // Log orchestrator start
                        _a.sent();
                        return [2 /*return*/, {
                                success: failedModules.length === 0,
                                started_modules: startedModules,
                                failed_modules: failedModules
                            }];
                    case 12:
                        error_2 = _a.sent();
                        console.error('Error starting automation orchestrator:', error_2);
                        throw new Error("Failed to start automation orchestrator: ".concat(error_2.message));
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Stop all automation modules
     */
    LGPDAutomationOrchestrator.prototype.stopAllAutomation = function () {
        return __awaiter(this, void 0, void 0, function () {
            var stoppedModules, modules, _i, modules_2, module_2, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        stoppedModules = [];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        console.log('Stopping LGPD Automation Orchestrator...');
                        // Stop orchestrator monitoring
                        this.stopOrchestatorMonitoring();
                        modules = [
                            { name: 'consent_automation', instance: this.consentAutomation, method: 'stopAutomation' },
                            { name: 'data_subject_rights', instance: this.dataSubjectRights, method: 'stopAutomation' },
                            { name: 'compliance_monitoring', instance: this.complianceMonitor, method: 'stopMonitoring' },
                            { name: 'data_retention', instance: this.dataRetention, method: 'stopAutomatedProcessing' },
                            { name: 'breach_detection', instance: this.breachDetection, method: 'stopRealTimeDetection' },
                            { name: 'data_minimization', instance: this.dataMinimization, method: 'stopAutomation' },
                            { name: 'third_party_compliance', instance: this.thirdPartyCompliance, method: 'stopComplianceMonitoring' },
                            { name: 'audit_reporting', instance: this.auditReporting, method: 'stopAutomatedReporting' }
                        ];
                        for (_i = 0, modules_2 = modules; _i < modules_2.length; _i++) {
                            module_2 = modules_2[_i];
                            try {
                                module_2.instance[module_2.method]();
                                stoppedModules.push(module_2.name);
                                console.log("\u2705 ".concat(module_2.name, " stopped successfully"));
                            }
                            catch (error) {
                                console.error("\u274C Error stopping ".concat(module_2.name, ":"), error);
                            }
                        }
                        this.isRunning = false;
                        // Log orchestrator stop
                        return [4 /*yield*/, this.complianceManager.logAuditEvent({
                                event_type: 'automation_orchestrator',
                                resource_type: 'orchestrator',
                                resource_id: 'main',
                                action: 'orchestrator_stopped',
                                details: {
                                    stopped_modules: stoppedModules,
                                    total_modules: modules.length
                                }
                            })];
                    case 2:
                        // Log orchestrator stop
                        _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                stopped_modules: stoppedModules
                            }];
                    case 3:
                        error_3 = _a.sent();
                        console.error('Error stopping automation orchestrator:', error_3);
                        throw new Error("Failed to stop automation orchestrator: ".concat(error_3.message));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get automation status for all modules
     */
    LGPDAutomationOrchestrator.prototype.getAutomationStatus = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, statusData, error, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .rpc('get_automation_status')];
                    case 1:
                        _a = _b.sent(), statusData = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, statusData || []];
                    case 2:
                        error_4 = _b.sent();
                        console.error('Error getting automation status:', error_4);
                        throw new Error("Failed to get automation status: ".concat(error_4.message));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get comprehensive automation metrics
     */
    LGPDAutomationOrchestrator.prototype.getAutomationMetrics = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, metrics, error, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .rpc('get_automation_metrics')];
                    case 1:
                        _a = _b.sent(), metrics = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, metrics];
                    case 2:
                        error_5 = _b.sent();
                        console.error('Error getting automation metrics:', error_5);
                        throw new Error("Failed to get automation metrics: ".concat(error_5.message));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get automation alerts
     */
    LGPDAutomationOrchestrator.prototype.getAutomationAlerts = function () {
        return __awaiter(this, arguments, void 0, function (filters, pagination) {
            var query, offset, _a, alerts, error, count, totalPages, error_6;
            if (filters === void 0) { filters = {}; }
            if (pagination === void 0) { pagination = { page: 1, limit: 50 }; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        query = this.supabase
                            .from('lgpd_automation_alerts')
                            .select('*', { count: 'exact' });
                        // Apply filters
                        if (filters.module) {
                            query = query.eq('module', filters.module);
                        }
                        if (filters.alert_type) {
                            query = query.eq('alert_type', filters.alert_type);
                        }
                        if (filters.resolved !== undefined) {
                            query = query.eq('resolved', filters.resolved);
                        }
                        if (filters.start_date) {
                            query = query.gte('timestamp', filters.start_date);
                        }
                        if (filters.end_date) {
                            query = query.lte('timestamp', filters.end_date);
                        }
                        offset = (pagination.page - 1) * pagination.limit;
                        query = query
                            .order('timestamp', { ascending: false })
                            .range(offset, offset + pagination.limit - 1);
                        return [4 /*yield*/, query];
                    case 1:
                        _a = _b.sent(), alerts = _a.data, error = _a.error, count = _a.count;
                        if (error)
                            throw error;
                        totalPages = Math.ceil((count || 0) / pagination.limit);
                        return [2 /*return*/, {
                                alerts: alerts || [],
                                total_count: count || 0,
                                page: pagination.page,
                                total_pages: totalPages
                            }];
                    case 2:
                        error_6 = _b.sent();
                        console.error('Error getting automation alerts:', error_6);
                        throw new Error("Failed to get automation alerts: ".concat(error_6.message));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Resolve automation alert
     */
    LGPDAutomationOrchestrator.prototype.resolveAlert = function (alertId, resolvedBy, resolutionNotes) {
        return __awaiter(this, void 0, void 0, function () {
            var error, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.supabase
                                .from('lgpd_automation_alerts')
                                .update({
                                resolved: true,
                                resolved_at: new Date().toISOString(),
                                resolved_by: resolvedBy,
                                resolution_notes: resolutionNotes
                            })
                                .eq('id', alertId)];
                    case 1:
                        error = (_a.sent()).error;
                        if (error)
                            throw error;
                        // Log alert resolution
                        return [4 /*yield*/, this.complianceManager.logAuditEvent({
                                event_type: 'automation_orchestrator',
                                resource_type: 'automation_alert',
                                resource_id: alertId,
                                action: 'alert_resolved',
                                details: {
                                    resolved_by: resolvedBy,
                                    resolution_notes: resolutionNotes
                                }
                            })];
                    case 2:
                        // Log alert resolution
                        _a.sent();
                        return [2 /*return*/, { success: true }];
                    case 3:
                        error_7 = _a.sent();
                        console.error('Error resolving alert:', error_7);
                        throw new Error("Failed to resolve alert: ".concat(error_7.message));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get unified automation dashboard
     */
    LGPDAutomationOrchestrator.prototype.getUnifiedDashboard = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, dashboard, error, error_8;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .rpc('get_unified_automation_dashboard')];
                    case 1:
                        _a = _b.sent(), dashboard = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, dashboard];
                    case 2:
                        error_8 = _b.sent();
                        console.error('Error getting unified dashboard:', error_8);
                        throw new Error("Failed to get unified dashboard: ".concat(error_8.message));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Register alert callback
     */
    LGPDAutomationOrchestrator.prototype.onAlert = function (callback) {
        this.alertCallbacks.push(callback);
    };
    /**
     * Register status callback
     */
    LGPDAutomationOrchestrator.prototype.onStatusChange = function (callback) {
        this.statusCallbacks.push(callback);
    };
    /**
     * Get individual module instances for direct access
     */
    LGPDAutomationOrchestrator.prototype.getModules = function () {
        return {
            consentAutomation: this.consentAutomation,
            dataSubjectRights: this.dataSubjectRights,
            complianceMonitor: this.complianceMonitor,
            dataRetention: this.dataRetention,
            breachDetection: this.breachDetection,
            dataMinimization: this.dataMinimization,
            thirdPartyCompliance: this.thirdPartyCompliance,
            auditReporting: this.auditReporting
        };
    };
    // Private helper methods
    LGPDAutomationOrchestrator.prototype.setupCrossModuleIntegration = function () {
        // Set up cross-module event handlers for coordinated automation
        var _this = this;
        // Breach detection triggers compliance monitoring
        this.breachDetection.onBreachDetected(function (incident) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.complianceMonitor.triggerEmergencyCompliance(incident)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        // Consent changes trigger data retention review
        this.consentAutomation.onConsentWithdrawn(function (consent) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.dataRetention.reviewRetentionForConsent(consent.user_id, consent.purpose)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        // Data subject requests trigger compliance checks
        this.dataSubjectRights.onRequestProcessed(function (request) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.complianceMonitor.validateRequestCompliance(request)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        // Third-party compliance issues trigger alerts
        this.thirdPartyCompliance.onComplianceAssessmentCompleted(function (assessment) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(assessment.risk_rating === 'high' || assessment.risk_rating === 'critical')) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.createAlert({
                                module: 'third_party_compliance',
                                alert_type: 'warning',
                                title: 'High Risk Third Party Detected',
                                message: "Provider ".concat(assessment.provider_id, " has ").concat(assessment.risk_rating, " risk rating"),
                                details: assessment
                            })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        }); });
        // Data minimization opportunities trigger retention review
        this.dataMinimization.onMinimizationOpportunity(function (opportunity) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.dataRetention.evaluateMinimizationOpportunity(opportunity)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    };
    LGPDAutomationOrchestrator.prototype.startOrchestatorMonitoring = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (this.monitoringInterval) {
                    clearInterval(this.monitoringInterval);
                }
                this.monitoringInterval = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
                    var error_9;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 4, , 5]);
                                return [4 /*yield*/, this.performHealthCheck()];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, this.updatePerformanceMetrics()];
                            case 2:
                                _a.sent();
                                return [4 /*yield*/, this.checkForCriticalAlerts()];
                            case 3:
                                _a.sent();
                                return [3 /*break*/, 5];
                            case 4:
                                error_9 = _a.sent();
                                console.error('Error in orchestrator monitoring cycle:', error_9);
                                return [3 /*break*/, 5];
                            case 5: return [2 /*return*/];
                        }
                    });
                }); }, 60000); // Check every minute
                console.log('Orchestrator monitoring started');
                return [2 /*return*/];
            });
        });
    };
    LGPDAutomationOrchestrator.prototype.stopOrchestatorMonitoring = function () {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        console.log('Orchestrator monitoring stopped');
    };
    LGPDAutomationOrchestrator.prototype.createAlert = function (alertData) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, alert_1, error, _i, _b, callback, error_10;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('lgpd_automation_alerts')
                                .insert(__assign(__assign({}, alertData), { timestamp: new Date().toISOString(), resolved: false }))
                                .select('*')
                                .single()];
                    case 1:
                        _a = _c.sent(), alert_1 = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        // Trigger callbacks
                        for (_i = 0, _b = this.alertCallbacks; _i < _b.length; _i++) {
                            callback = _b[_i];
                            try {
                                callback(alert_1);
                            }
                            catch (error) {
                                console.error('Error in alert callback:', error);
                            }
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_10 = _c.sent();
                        console.error('Error creating alert:', error_10);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    LGPDAutomationOrchestrator.prototype.performHealthCheck = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    LGPDAutomationOrchestrator.prototype.updatePerformanceMetrics = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    LGPDAutomationOrchestrator.prototype.checkForCriticalAlerts = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    return LGPDAutomationOrchestrator;
}());
exports.LGPDAutomationOrchestrator = LGPDAutomationOrchestrator;

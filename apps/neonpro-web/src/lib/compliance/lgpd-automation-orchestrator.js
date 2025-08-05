"use strict";
// ============================================================================
// LGPD AUTOMATION ORCHESTRATOR
// ============================================================================
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
exports.LGPDAutomationOrchestrator = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var lgpd_automation_1 = require("./lgpd-automation");
var lgpd_core_1 = require("./lgpd-core");
var lgpd_1 = require("@/types/lgpd");
/**
 * Orquestrador principal da automação LGPD
 * Coordena todos os serviços de automação e fornece interface unificada
 */
var LGPDAutomationOrchestrator = /** @class */ (function () {
    function LGPDAutomationOrchestrator() {
        this.supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
        this.consentService = new lgpd_automation_1.LGPDAutoConsentService();
        this.dataSubjectService = new lgpd_automation_1.LGPDAutoDataSubjectRightsService();
        this.auditService = new lgpd_automation_1.LGPDAutoAuditService();
        this.reportingService = new lgpd_automation_1.LGPDAutoReportingService();
        this.anonymizationService = new lgpd_automation_1.LGPDAutoAnonymizationService();
        this.complianceService = new lgpd_core_1.LGPDComplianceService();
    }
    /**
     * Executa automação completa para uma clínica
     */
    LGPDAutomationOrchestrator.prototype.executeFullAutomation = function (clinicId) {
        return __awaiter(this, void 0, void 0, function () {
            var results, startTime, healthCheck, consentResult, rightsResult, auditResult, reportingResult, anonymizationResult, error_1, errorResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        results = [];
                        startTime = new Date();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 9, , 10]);
                        return [4 /*yield*/, this.executeHealthCheck(clinicId)];
                    case 2:
                        healthCheck = _a.sent();
                        results.push(healthCheck);
                        return [4 /*yield*/, this.executeConsentAutomation(clinicId)];
                    case 3:
                        consentResult = _a.sent();
                        results.push(consentResult);
                        return [4 /*yield*/, this.executeDataSubjectRightsAutomation(clinicId)];
                    case 4:
                        rightsResult = _a.sent();
                        results.push(rightsResult);
                        return [4 /*yield*/, this.executeAuditAutomation(clinicId)];
                    case 5:
                        auditResult = _a.sent();
                        results.push(auditResult);
                        return [4 /*yield*/, this.executeReportingAutomation(clinicId)];
                    case 6:
                        reportingResult = _a.sent();
                        results.push(reportingResult);
                        return [4 /*yield*/, this.executeAnonymizationAutomation(clinicId)];
                    case 7:
                        anonymizationResult = _a.sent();
                        results.push(anonymizationResult);
                        // Registrar execução completa
                        return [4 /*yield*/, this.logAutomationExecution(clinicId, results, startTime)];
                    case 8:
                        // Registrar execução completa
                        _a.sent();
                        return [2 /*return*/, results];
                    case 9:
                        error_1 = _a.sent();
                        console.error('Full automation failed:', error_1);
                        errorResult = {
                            id: crypto.randomUUID(),
                            automationType: 'full_automation',
                            status: 'failed',
                            startTime: startTime,
                            endTime: new Date(),
                            itemsProcessed: 0,
                            itemsSuccessful: 0,
                            errors: [error_1 instanceof Error ? error_1.message : 'Unknown error'],
                            details: { clinicId: clinicId }
                        };
                        results.push(errorResult);
                        return [2 /*return*/, results];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Executa verificação de saúde do compliance
     */
    LGPDAutomationOrchestrator.prototype.executeHealthCheck = function (clinicId) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, healthCheck, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = new Date();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.auditService.performComplianceHealthCheck(clinicId)];
                    case 2:
                        healthCheck = _a.sent();
                        return [2 /*return*/, {
                                id: crypto.randomUUID(),
                                automationType: 'health_check',
                                status: healthCheck.overallScore >= 80 ? 'success' : 'partial',
                                startTime: startTime,
                                endTime: new Date(),
                                itemsProcessed: 1,
                                itemsSuccessful: healthCheck.overallScore >= 80 ? 1 : 0,
                                errors: healthCheck.criticalIssues,
                                details: healthCheck
                            }];
                    case 3:
                        error_2 = _a.sent();
                        return [2 /*return*/, {
                                id: crypto.randomUUID(),
                                automationType: 'health_check',
                                status: 'failed',
                                startTime: startTime,
                                endTime: new Date(),
                                itemsProcessed: 0,
                                itemsSuccessful: 0,
                                errors: [error_2 instanceof Error ? error_2.message : 'Unknown error'],
                                details: { clinicId: clinicId }
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Executa automação de consentimentos
     */
    LGPDAutomationOrchestrator.prototype.executeConsentAutomation = function (clinicId) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, expiredConsents, processedCount, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = new Date();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.consentService.checkConsentExpiration(clinicId)];
                    case 2:
                        expiredConsents = _a.sent();
                        processedCount = expiredConsents.length;
                        return [2 /*return*/, {
                                id: crypto.randomUUID(),
                                automationType: 'consent_check',
                                status: 'success',
                                startTime: startTime,
                                endTime: new Date(),
                                itemsProcessed: processedCount,
                                itemsSuccessful: processedCount,
                                errors: [],
                                details: { expiredConsents: expiredConsents }
                            }];
                    case 3:
                        error_3 = _a.sent();
                        return [2 /*return*/, {
                                id: crypto.randomUUID(),
                                automationType: 'consent_check',
                                status: 'failed',
                                startTime: startTime,
                                endTime: new Date(),
                                itemsProcessed: 0,
                                itemsSuccessful: 0,
                                errors: [error_3 instanceof Error ? error_3.message : 'Unknown error'],
                                details: { clinicId: clinicId }
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Executa automação de direitos do titular
     */
    LGPDAutomationOrchestrator.prototype.executeDataSubjectRightsAutomation = function (clinicId) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, processedRequests, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = new Date();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.dataSubjectService.processAutomaticRequests(clinicId)];
                    case 2:
                        processedRequests = _a.sent();
                        return [2 /*return*/, {
                                id: crypto.randomUUID(),
                                automationType: 'data_subject_rights',
                                status: 'success',
                                startTime: startTime,
                                endTime: new Date(),
                                itemsProcessed: processedRequests.length,
                                itemsSuccessful: processedRequests.filter(function (r) { return r.status === 'completed'; }).length,
                                errors: [],
                                details: { processedRequests: processedRequests }
                            }];
                    case 3:
                        error_4 = _a.sent();
                        return [2 /*return*/, {
                                id: crypto.randomUUID(),
                                automationType: 'data_subject_rights',
                                status: 'failed',
                                startTime: startTime,
                                endTime: new Date(),
                                itemsProcessed: 0,
                                itemsSuccessful: 0,
                                errors: [error_4 instanceof Error ? error_4.message : 'Unknown error'],
                                details: { clinicId: clinicId }
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Executa automação de auditoria
     */
    LGPDAutomationOrchestrator.prototype.executeAuditAutomation = function (clinicId) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, auditResult, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = new Date();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.auditService.performAutomaticAudit(clinicId)];
                    case 2:
                        auditResult = _a.sent();
                        return [2 /*return*/, {
                                id: crypto.randomUUID(),
                                automationType: 'audit',
                                status: auditResult.complianceScore >= 80 ? 'success' : 'partial',
                                startTime: startTime,
                                endTime: new Date(),
                                itemsProcessed: 1,
                                itemsSuccessful: auditResult.complianceScore >= 80 ? 1 : 0,
                                errors: auditResult.actionItems.filter(function (item) { return item.priority === 'critical'; }).map(function (item) { return item.description; }),
                                details: auditResult
                            }];
                    case 3:
                        error_5 = _a.sent();
                        return [2 /*return*/, {
                                id: crypto.randomUUID(),
                                automationType: 'audit',
                                status: 'failed',
                                startTime: startTime,
                                endTime: new Date(),
                                itemsProcessed: 0,
                                itemsSuccessful: 0,
                                errors: [error_5 instanceof Error ? error_5.message : 'Unknown error'],
                                details: { clinicId: clinicId }
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Executa automação de relatórios
     */
    LGPDAutomationOrchestrator.prototype.executeReportingAutomation = function (clinicId) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, reportTypes, reports, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = new Date();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        reportTypes = [
                            lgpd_1.ComplianceReportType.CONSENT_SUMMARY,
                            lgpd_1.ComplianceReportType.DATA_PROCESSING,
                            lgpd_1.ComplianceReportType.AUDIT_TRAIL
                        ];
                        return [4 /*yield*/, this.reportingService.generateComplianceReports(clinicId, reportTypes)];
                    case 2:
                        reports = _a.sent();
                        return [2 /*return*/, {
                                id: crypto.randomUUID(),
                                automationType: 'reporting',
                                status: 'success',
                                startTime: startTime,
                                endTime: new Date(),
                                itemsProcessed: reportTypes.length,
                                itemsSuccessful: reports.length,
                                errors: [],
                                details: { reports: reports }
                            }];
                    case 3:
                        error_6 = _a.sent();
                        return [2 /*return*/, {
                                id: crypto.randomUUID(),
                                automationType: 'reporting',
                                status: 'failed',
                                startTime: startTime,
                                endTime: new Date(),
                                itemsProcessed: 0,
                                itemsSuccessful: 0,
                                errors: [error_6 instanceof Error ? error_6.message : 'Unknown error'],
                                details: { clinicId: clinicId }
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Executa automação de anonimização
     */
    LGPDAutomationOrchestrator.prototype.executeAnonymizationAutomation = function (clinicId) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, anonymizationJob, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = new Date();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.anonymizationService.executeAutoAnonymization(clinicId)];
                    case 2:
                        anonymizationJob = _a.sent();
                        return [2 /*return*/, {
                                id: crypto.randomUUID(),
                                automationType: 'anonymization',
                                status: anonymizationJob.status === 'completed' ? 'success' : 'failed',
                                startTime: startTime,
                                endTime: new Date(),
                                itemsProcessed: anonymizationJob.recordsProcessed,
                                itemsSuccessful: anonymizationJob.recordsAnonymized,
                                errors: anonymizationJob.errors || [],
                                details: anonymizationJob
                            }];
                    case 3:
                        error_7 = _a.sent();
                        return [2 /*return*/, {
                                id: crypto.randomUUID(),
                                automationType: 'anonymization',
                                status: 'failed',
                                startTime: startTime,
                                endTime: new Date(),
                                itemsProcessed: 0,
                                itemsSuccessful: 0,
                                errors: [error_7 instanceof Error ? error_7.message : 'Unknown error'],
                                details: { clinicId: clinicId }
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Obtém métricas do dashboard LGPD
     */
    LGPDAutomationOrchestrator.prototype.getDashboardMetrics = function (clinicId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, consents, requests, schedules, auditLogs, healthCheck, criticalIssues, nextScheduledTasks, recentAlerts, error_8;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, Promise.all([
                                this.getActiveConsents(clinicId),
                                this.getPendingRequests(clinicId),
                                this.getScheduledTasks(clinicId),
                                this.getRecentAuditLogs(clinicId)
                            ])];
                    case 1:
                        _a = _b.sent(), consents = _a[0], requests = _a[1], schedules = _a[2], auditLogs = _a[3];
                        return [4 /*yield*/, this.auditService.performComplianceHealthCheck(clinicId)];
                    case 2:
                        healthCheck = _b.sent();
                        criticalIssues = healthCheck.criticalIssues.length;
                        nextScheduledTasks = schedules
                            .filter(function (s) { return s.enabled; })
                            .sort(function (a, b) { return a.nextRun.getTime() - b.nextRun.getTime(); })
                            .slice(0, 5);
                        recentAlerts = auditLogs
                            .filter(function (log) { return log.riskLevel === 'high' || log.riskLevel === 'critical'; })
                            .slice(0, 5)
                            .map(function (log) { return "".concat(log.eventType, ": ").concat(log.action); });
                        return [2 /*return*/, {
                                complianceScore: healthCheck.overallScore,
                                activeConsents: consents.length,
                                pendingRequests: requests.length,
                                criticalIssues: criticalIssues,
                                lastAuditDate: healthCheck.lastAuditDate,
                                nextScheduledTasks: nextScheduledTasks,
                                recentAlerts: recentAlerts
                            }];
                    case 3:
                        error_8 = _b.sent();
                        console.error('Error getting dashboard metrics:', error_8);
                        throw error_8;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Configura automação para uma clínica
     */
    LGPDAutomationOrchestrator.prototype.configureAutomation = function (clinicId, config) {
        return __awaiter(this, void 0, void 0, function () {
            var error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.supabase
                                .from('lgpd_automation_config')
                                .upsert({
                                clinic_id: clinicId,
                                config: config,
                                updated_at: new Date().toISOString()
                            })];
                    case 1:
                        _a.sent();
                        // Criar/atualizar agendamentos
                        return [4 /*yield*/, this.updateAutomationSchedules(clinicId, config)];
                    case 2:
                        // Criar/atualizar agendamentos
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_9 = _a.sent();
                        console.error('Error configuring automation:', error_9);
                        throw error_9;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Executa tarefas agendadas
     */
    LGPDAutomationOrchestrator.prototype.executeScheduledTasks = function () {
        return __awaiter(this, void 0, void 0, function () {
            var now, scheduledTasks, _i, _a, task, nextRun, error_10, error_11;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 9, , 10]);
                        now = new Date();
                        return [4 /*yield*/, this.supabase
                                .from('lgpd_automation_schedules')
                                .select('*')
                                .eq('enabled', true)
                                .lte('next_run', now.toISOString())];
                    case 1:
                        scheduledTasks = (_b.sent()).data;
                        _i = 0, _a = scheduledTasks || [];
                        _b.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 8];
                        task = _a[_i];
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 6, , 7]);
                        return [4 /*yield*/, this.executeScheduledTask(task)];
                    case 4:
                        _b.sent();
                        nextRun = this.calculateNextRun(task.frequency, now);
                        return [4 /*yield*/, this.supabase
                                .from('lgpd_automation_schedules')
                                .update({
                                last_run: now.toISOString(),
                                next_run: nextRun.toISOString()
                            })
                                .eq('id', task.id)];
                    case 5:
                        _b.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        error_10 = _b.sent();
                        console.error("Failed to execute scheduled task ".concat(task.id, ":"), error_10);
                        return [3 /*break*/, 7];
                    case 7:
                        _i++;
                        return [3 /*break*/, 2];
                    case 8: return [3 /*break*/, 10];
                    case 9:
                        error_11 = _b.sent();
                        console.error('Error executing scheduled tasks:', error_11);
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    // Métodos auxiliares privados
    LGPDAutomationOrchestrator.prototype.getActiveConsents = function (clinicId) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('lgpd_consent_records')
                            .select('id')
                            .eq('clinicId', clinicId)
                            .eq('status', 'granted')];
                    case 1:
                        data = (_a.sent()).data;
                        return [2 /*return*/, data || []];
                }
            });
        });
    };
    LGPDAutomationOrchestrator.prototype.getPendingRequests = function (clinicId) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('lgpd_data_subject_requests')
                            .select('id')
                            .eq('clinicId', clinicId)
                            .in('status', ['pending', 'in_progress'])];
                    case 1:
                        data = (_a.sent()).data;
                        return [2 /*return*/, data || []];
                }
            });
        });
    };
    LGPDAutomationOrchestrator.prototype.getScheduledTasks = function (clinicId) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('lgpd_automation_schedules')
                            .select('*')
                            .eq('clinic_id', clinicId)];
                    case 1:
                        data = (_a.sent()).data;
                        return [2 /*return*/, data || []];
                }
            });
        });
    };
    LGPDAutomationOrchestrator.prototype.getRecentAuditLogs = function (clinicId) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('lgpd_audit_logs')
                            .select('*')
                            .eq('clinicId', clinicId)
                            .order('timestamp', { ascending: false })
                            .limit(10)];
                    case 1:
                        data = (_a.sent()).data;
                        return [2 /*return*/, data || []];
                }
            });
        });
    };
    LGPDAutomationOrchestrator.prototype.logAutomationExecution = function (clinicId, results, startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var auditLog;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        auditLog = {
                            id: crypto.randomUUID(),
                            clinicId: clinicId,
                            eventType: lgpd_1.AuditEventType.SYSTEM_MAINTENANCE,
                            timestamp: new Date(),
                            userId: 'SYSTEM',
                            userRole: 'system',
                            resourceType: 'automation_execution',
                            resourceId: crypto.randomUUID(),
                            action: 'full_automation_execution',
                            details: {
                                startTime: startTime,
                                endTime: new Date(),
                                results: results,
                                totalItemsProcessed: results.reduce(function (sum, r) { return sum + r.itemsProcessed; }, 0),
                                totalItemsSuccessful: results.reduce(function (sum, r) { return sum + r.itemsSuccessful; }, 0),
                                totalErrors: results.reduce(function (sum, r) { return sum + r.errors.length; }, 0)
                            },
                            ipAddress: 'system',
                            userAgent: 'LGPD Automation Orchestrator',
                            riskLevel: 'low'
                        };
                        return [4 /*yield*/, this.supabase
                                .from('lgpd_audit_logs')
                                .insert(auditLog)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    LGPDAutomationOrchestrator.prototype.updateAutomationSchedules = function (clinicId, config) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    LGPDAutomationOrchestrator.prototype.executeScheduledTask = function (task) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = task.automation_type;
                        switch (_a) {
                            case 'consent_check': return [3 /*break*/, 1];
                            case 'audit': return [3 /*break*/, 3];
                            case 'reporting': return [3 /*break*/, 5];
                            case 'anonymization': return [3 /*break*/, 7];
                            case 'health_check': return [3 /*break*/, 9];
                        }
                        return [3 /*break*/, 11];
                    case 1: return [4 /*yield*/, this.executeConsentAutomation(task.clinic_id)];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 11];
                    case 3: return [4 /*yield*/, this.executeAuditAutomation(task.clinic_id)];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 11];
                    case 5: return [4 /*yield*/, this.executeReportingAutomation(task.clinic_id)];
                    case 6:
                        _b.sent();
                        return [3 /*break*/, 11];
                    case 7: return [4 /*yield*/, this.executeAnonymizationAutomation(task.clinic_id)];
                    case 8:
                        _b.sent();
                        return [3 /*break*/, 11];
                    case 9: return [4 /*yield*/, this.executeHealthCheck(task.clinic_id)];
                    case 10:
                        _b.sent();
                        return [3 /*break*/, 11];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    LGPDAutomationOrchestrator.prototype.calculateNextRun = function (frequency, lastRun) {
        var next = new Date(lastRun);
        switch (frequency) {
            case 'daily':
                next.setDate(next.getDate() + 1);
                break;
            case 'weekly':
                next.setDate(next.getDate() + 7);
                break;
            case 'monthly':
                next.setMonth(next.getMonth() + 1);
                break;
            case 'quarterly':
                next.setMonth(next.getMonth() + 3);
                break;
        }
        return next;
    };
    return LGPDAutomationOrchestrator;
}());
exports.LGPDAutomationOrchestrator = LGPDAutomationOrchestrator;

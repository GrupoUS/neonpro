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
var globals_1 = require("@jest/globals");
var backup_manager_1 = require("@/lib/backup/backup-manager");
var scheduler_1 = require("@/lib/backup/scheduler");
var monitoring_1 = require("@/lib/backup/monitoring");
// Mock do Supabase
globals_1.jest.mock('@/app/utils/supabase/client', function () { return ({
    createClient: globals_1.jest.fn(function () { return ({
        from: globals_1.jest.fn(function () { return ({
            select: globals_1.jest.fn().mockReturnThis(),
            insert: globals_1.jest.fn().mockReturnThis(),
            update: globals_1.jest.fn().mockReturnThis(),
            delete: globals_1.jest.fn().mockReturnThis(),
            eq: globals_1.jest.fn().mockReturnThis(),
            single: globals_1.jest.fn(),
        }); }),
    }); }),
}); });
describe('BackupManager', function () {
    var backupManager;
    beforeEach(function () {
        backupManager = new backup_manager_1.BackupManager();
        globals_1.jest.clearAllMocks();
    });
    describe('executeBackup', function () {
        it('should execute a full backup successfully', function () { return __awaiter(void 0, void 0, void 0, function () {
            var config, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        config = {
                            id: 'test-config-1',
                            name: 'Test Backup',
                            type: 'FULL',
                            storage_provider: 'local',
                            schedule: {
                                enabled: true,
                                frequency: 'DAILY',
                                time: '02:00',
                            },
                            retention: {
                                daily: 7,
                                weekly: 4,
                                monthly: 12,
                            },
                            data_sources: ['database', 'files'],
                            encryption: {
                                enabled: true,
                                algorithm: 'AES-256',
                            },
                            compression: {
                                enabled: true,
                                algorithm: 'gzip',
                                level: 6,
                            },
                            created_at: new Date(),
                            updated_at: new Date(),
                        };
                        return [4 /*yield*/, backupManager.executeBackup(config)];
                    case 1:
                        result = _a.sent();
                        expect(result).toBeDefined();
                        expect(result.status).toBe('COMPLETED');
                        expect(result.config_id).toBe(config.id);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle backup failures gracefully', function () { return __awaiter(void 0, void 0, void 0, function () {
            var config, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        config = {
                            id: 'test-config-2',
                            name: 'Test Backup Fail',
                            type: 'FULL',
                            storage_provider: 'invalid',
                            schedule: {
                                enabled: true,
                                frequency: 'DAILY',
                                time: '02:00',
                            },
                            retention: {
                                daily: 7,
                                weekly: 4,
                                monthly: 12,
                            },
                            data_sources: ['database'],
                            encryption: {
                                enabled: false,
                            },
                            compression: {
                                enabled: false,
                            },
                            created_at: new Date(),
                            updated_at: new Date(),
                        };
                        return [4 /*yield*/, backupManager.executeBackup(config)];
                    case 1:
                        result = _a.sent();
                        expect(result.status).toBe('FAILED');
                        expect(result.error_message).toBeDefined();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('recovery', function () {
        it.skip('should restore a backup successfully', function () { return __awaiter(void 0, void 0, void 0, function () {
            var backupId, options;
            return __generator(this, function (_a) {
                backupId = 'test-backup-1';
                options = {
                    target_location: '/tmp/restore',
                    overwrite_existing: true,
                    verify_integrity: true,
                };
                return [2 /*return*/];
            });
        }); });
        it.skip('should validate backup integrity before restore', function () { return __awaiter(void 0, void 0, void 0, function () {
            var backupId, options;
            return __generator(this, function (_a) {
                backupId = 'test-backup-corrupted';
                options = {
                    target_location: '/tmp/restore',
                    verify_integrity: true,
                };
                return [2 /*return*/];
            });
        }); });
    });
});
describe('SchedulerService', function () {
    var scheduler;
    beforeEach(function () {
        scheduler = new scheduler_1.SchedulerService({}); // Mock BackupManager
        globals_1.jest.clearAllMocks();
    });
    describe('scheduleBackup', function () {
        it('should schedule a daily backup correctly', function () { return __awaiter(void 0, void 0, void 0, function () {
            var config, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        config = {
                            id: 'schedule-test-1',
                            name: 'Daily Backup',
                            type: 'INCREMENTAL',
                            storage_provider: 'local',
                            schedule: {
                                enabled: true,
                                frequency: 'DAILY',
                                time: '02:00',
                            },
                            retention: {
                                daily: 7,
                                weekly: 4,
                                monthly: 12,
                            },
                            data_sources: ['database'],
                            encryption: {
                                enabled: true,
                                algorithm: 'AES-256',
                            },
                            compression: {
                                enabled: true,
                                algorithm: 'gzip',
                                level: 6,
                            },
                            created_at: new Date(),
                            updated_at: new Date(),
                        };
                        return [4 /*yield*/, scheduler.scheduleBackup(config)];
                    case 1:
                        result = _a.sent();
                        expect(result).toBeTruthy();
                        expect(scheduler.getScheduledJobs()).toContain(config.id);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle scheduling conflicts', function () { return __awaiter(void 0, void 0, void 0, function () {
            var config1, config2, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        config1 = {
                            id: 'schedule-test-2',
                            name: 'Backup 1',
                            type: 'FULL',
                            storage_provider: 'local',
                            schedule: {
                                enabled: true,
                                frequency: 'DAILY',
                                time: '02:00',
                            },
                            retention: { daily: 7, weekly: 4, monthly: 12 },
                            data_sources: ['database'],
                            encryption: { enabled: false },
                            compression: { enabled: false },
                            created_at: new Date(),
                            updated_at: new Date(),
                        };
                        config2 = __assign(__assign({}, config1), { id: 'schedule-test-3', name: 'Backup 2' });
                        return [4 /*yield*/, scheduler.scheduleBackup(config1)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, scheduler.scheduleBackup(config2)];
                    case 2:
                        result = _a.sent();
                        // Should handle conflict by adjusting time or queuing
                        expect(result).toBeTruthy();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('cancelSchedule', function () {
        it('should cancel a scheduled backup', function () { return __awaiter(void 0, void 0, void 0, function () {
            var configId, config, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        configId = 'schedule-test-4';
                        config = {
                            id: configId,
                            name: 'Test Cancel',
                            type: 'FULL',
                            storage_provider: 'local',
                            schedule: {
                                enabled: true,
                                frequency: 'DAILY',
                                time: '02:00',
                            },
                            retention: { daily: 7, weekly: 4, monthly: 12 },
                            data_sources: ['database'],
                            encryption: { enabled: false },
                            compression: { enabled: false },
                            created_at: new Date(),
                            updated_at: new Date(),
                        };
                        return [4 /*yield*/, scheduler.scheduleBackup(config)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, scheduler.cancelSchedule(configId)];
                    case 2:
                        result = _a.sent();
                        expect(result).toBeTruthy();
                        expect(scheduler.getScheduledJobs()).not.toContain(configId);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
describe('MonitoringService', function () {
    var monitoring;
    beforeEach(function () {
        monitoring = new monitoring_1.MonitoringService({}); // Mock BackupManager
        globals_1.jest.clearAllMocks();
    });
    describe('getMetrics', function () {
        it('should return backup metrics', function () { return __awaiter(void 0, void 0, void 0, function () {
            var metrics;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, monitoring.getMetrics()];
                    case 1:
                        metrics = _a.sent();
                        expect(metrics).toBeDefined();
                        expect(metrics).toHaveProperty('total_backups');
                        expect(metrics).toHaveProperty('successful_backups');
                        expect(metrics).toHaveProperty('failed_backups');
                        expect(metrics).toHaveProperty('storage_used');
                        expect(metrics).toHaveProperty('average_duration');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should calculate metrics correctly', function () { return __awaiter(void 0, void 0, void 0, function () {
            var metrics;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, monitoring.getMetrics()];
                    case 1:
                        metrics = _a.sent();
                        expect(typeof metrics.total_backups).toBe('number');
                        expect(typeof metrics.successful_backups).toBe('number');
                        expect(typeof metrics.failed_backups).toBe('number');
                        expect(metrics.total_backups).toBeGreaterThanOrEqual(0);
                        expect(metrics.successful_backups).toBeGreaterThanOrEqual(0);
                        expect(metrics.failed_backups).toBeGreaterThanOrEqual(0);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('getSystemHealth', function () {
        it('should return system health status', function () { return __awaiter(void 0, void 0, void 0, function () {
            var health;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, monitoring.getSystemHealth()];
                    case 1:
                        health = _a.sent();
                        expect(health).toBeDefined();
                        expect(health).toHaveProperty('overall_status');
                        expect(health).toHaveProperty('storage_health');
                        expect(health).toHaveProperty('backup_health');
                        expect(health).toHaveProperty('last_check');
                        expect(['HEALTHY', 'WARNING', 'CRITICAL']).toContain(health.overall_status);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('alerting', function () {
        it('should detect and report issues', function () { return __awaiter(void 0, void 0, void 0, function () {
            var issues, issue;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, monitoring.checkForIssues()];
                    case 1:
                        issues = _a.sent();
                        expect(Array.isArray(issues)).toBeTruthy();
                        if (issues.length > 0) {
                            issue = issues[0];
                            expect(issue).toHaveProperty('type');
                            expect(issue).toHaveProperty('severity');
                            expect(issue).toHaveProperty('message');
                            expect(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).toContain(issue.severity);
                        }
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
describe('Backup Integration Tests', function () {
    describe('End-to-End Backup Flow', function () {
        it.skip('should complete a full backup and recovery cycle', function () { return __awaiter(void 0, void 0, void 0, function () {
            var backupManager, config, backupResult, metrics, restoreResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        backupManager = new backup_manager_1.BackupManager();
                        config = {
                            id: 'integration-test-1',
                            name: 'Integration Test Backup',
                            type: 'FULL',
                            storage_provider: 'local',
                            schedule: {
                                enabled: false,
                                frequency: 'MANUAL',
                            },
                            retention: {
                                daily: 7,
                                weekly: 4,
                                monthly: 12,
                            },
                            data_sources: ['database'],
                            encryption: {
                                enabled: true,
                                algorithm: 'AES-256',
                            },
                            compression: {
                                enabled: true,
                                algorithm: 'gzip',
                                level: 6,
                            },
                            created_at: new Date(),
                            updated_at: new Date(),
                        };
                        return [4 /*yield*/, backupManager.executeBackup(config)];
                    case 1:
                        backupResult = _a.sent();
                        expect(backupResult.status).toBe('COMPLETED');
                        return [4 /*yield*/, monitoring.getMetrics()];
                    case 2:
                        metrics = _a.sent();
                        expect(metrics.total_backups).toBeGreaterThan(0);
                        return [4 /*yield*/, backupManager.restoreBackup(backupResult.id, {
                                target_location: '/tmp/test-restore',
                                verify_integrity: true,
                            })];
                    case 3:
                        restoreResult = _a.sent();
                        expect(restoreResult.status).toBe('COMPLETED');
                        return [2 /*return*/];
                }
            });
        }); }, 30000); // 30 second timeout for integration test
    });
});

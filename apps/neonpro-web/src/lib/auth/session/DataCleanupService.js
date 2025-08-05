"use strict";
/**
 * Data Cleanup Service - Automated Data Maintenance and Cleanup
 *
 * Comprehensive data cleanup and maintenance service for the NeonPro
 * session management system, ensuring optimal performance and compliance.
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 * @created 2024
 */
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
exports.DataCleanupService = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
/**
 * Data Cleanup Service Class
 *
 * Core cleanup operations:
 * - Expired session cleanup
 * - Inactive device removal
 * - Old security event archival
 * - Notification history cleanup
 * - Automated scheduling and monitoring
 * - Performance optimization
 */
var DataCleanupService = /** @class */ (function () {
    function DataCleanupService(config) {
        this.scheduledTasks = new Map();
        this.isRunning = false;
        this.lastCleanupResults = new Map();
        this.config = config;
        this.supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
        this.initializeScheduledTasks();
    }
    /**
     * Run comprehensive cleanup
     */
    DataCleanupService.prototype.runCleanup = function (tasks) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, results, tasksToRun, _i, tasksToRun_1, taskName, result, error_1, errorResult, endTime, totalDuration, totalDeleted, totalProcessed, successfulTasks, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isRunning) {
                            return [2 /*return*/, {
                                    success: false,
                                    error: {
                                        code: 'CLEANUP_IN_PROGRESS',
                                        message: 'Cleanup is already in progress'
                                    },
                                    timestamp: new Date().toISOString()
                                }];
                        }
                        this.isRunning = true;
                        startTime = Date.now();
                        results = [];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 9, 10, 11]);
                        tasksToRun = tasks || [
                            'expired_sessions',
                            'inactive_devices',
                            'old_security_events',
                            'old_notifications',
                            'expired_device_verifications',
                            'old_audit_logs'
                        ];
                        _i = 0, tasksToRun_1 = tasksToRun;
                        _a.label = 2;
                    case 2:
                        if (!(_i < tasksToRun_1.length)) return [3 /*break*/, 7];
                        taskName = tasksToRun_1[_i];
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.runCleanupTask(taskName)];
                    case 4:
                        result = _a.sent();
                        results.push(result);
                        this.lastCleanupResults.set(taskName, result);
                        return [3 /*break*/, 6];
                    case 5:
                        error_1 = _a.sent();
                        errorResult = {
                            task: taskName,
                            success: false,
                            itemsProcessed: 0,
                            itemsDeleted: 0,
                            error: error_1 instanceof Error ? error_1.message : 'Unknown error',
                            startTime: new Date().toISOString(),
                            endTime: new Date().toISOString(),
                            duration: 0
                        };
                        results.push(errorResult);
                        this.lastCleanupResults.set(taskName, errorResult);
                        return [3 /*break*/, 6];
                    case 6:
                        _i++;
                        return [3 /*break*/, 2];
                    case 7:
                        endTime = Date.now();
                        totalDuration = endTime - startTime;
                        totalDeleted = results.reduce(function (sum, r) { return sum + r.itemsDeleted; }, 0);
                        totalProcessed = results.reduce(function (sum, r) { return sum + r.itemsProcessed; }, 0);
                        successfulTasks = results.filter(function (r) { return r.success; }).length;
                        // Log cleanup summary
                        return [4 /*yield*/, this.logCleanupSummary({
                                totalTasks: results.length,
                                successfulTasks: successfulTasks,
                                totalProcessed: totalProcessed,
                                totalDeleted: totalDeleted,
                                duration: totalDuration,
                                results: results
                            })];
                    case 8:
                        // Log cleanup summary
                        _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                data: {
                                    summary: {
                                        totalTasks: results.length,
                                        successfulTasks: successfulTasks,
                                        totalProcessed: totalProcessed,
                                        totalDeleted: totalDeleted,
                                        duration: totalDuration
                                    },
                                    results: results
                                },
                                timestamp: new Date().toISOString()
                            }];
                    case 9:
                        error_2 = _a.sent();
                        return [2 /*return*/, {
                                success: false,
                                error: {
                                    code: 'CLEANUP_ERROR',
                                    message: 'Error during cleanup process',
                                    details: { error: error_2 instanceof Error ? error_2.message : 'Unknown error' }
                                },
                                timestamp: new Date().toISOString()
                            }];
                    case 10:
                        this.isRunning = false;
                        return [7 /*endfinally*/];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Clean up expired sessions
     */
    DataCleanupService.prototype.cleanupExpiredSessions = function () {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, taskStartTime, now, _a, expiredSessions, selectError, itemsProcessed, _b, deletedSessions, deleteError, itemsDeleted, error_3;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        startTime = Date.now();
                        taskStartTime = new Date().toISOString();
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 4, , 5]);
                        now = new Date().toISOString();
                        return [4 /*yield*/, this.supabase
                                .from('sessions')
                                .select('id')
                                .lt('expires_at', now)];
                    case 2:
                        _a = _c.sent(), expiredSessions = _a.data, selectError = _a.error;
                        if (selectError) {
                            throw new Error("Failed to query expired sessions: ".concat(selectError.message));
                        }
                        itemsProcessed = (expiredSessions === null || expiredSessions === void 0 ? void 0 : expiredSessions.length) || 0;
                        if (itemsProcessed === 0) {
                            return [2 /*return*/, {
                                    task: 'expired_sessions',
                                    success: true,
                                    itemsProcessed: 0,
                                    itemsDeleted: 0,
                                    startTime: taskStartTime,
                                    endTime: new Date().toISOString(),
                                    duration: Date.now() - startTime
                                }];
                        }
                        return [4 /*yield*/, this.supabase
                                .from('sessions')
                                .delete()
                                .lt('expires_at', now)
                                .select('id')];
                    case 3:
                        _b = _c.sent(), deletedSessions = _b.data, deleteError = _b.error;
                        if (deleteError) {
                            throw new Error("Failed to delete expired sessions: ".concat(deleteError.message));
                        }
                        itemsDeleted = (deletedSessions === null || deletedSessions === void 0 ? void 0 : deletedSessions.length) || 0;
                        return [2 /*return*/, {
                                task: 'expired_sessions',
                                success: true,
                                itemsProcessed: itemsProcessed,
                                itemsDeleted: itemsDeleted,
                                startTime: taskStartTime,
                                endTime: new Date().toISOString(),
                                duration: Date.now() - startTime
                            }];
                    case 4:
                        error_3 = _c.sent();
                        return [2 /*return*/, {
                                task: 'expired_sessions',
                                success: false,
                                itemsProcessed: 0,
                                itemsDeleted: 0,
                                error: error_3 instanceof Error ? error_3.message : 'Unknown error',
                                startTime: taskStartTime,
                                endTime: new Date().toISOString(),
                                duration: Date.now() - startTime
                            }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Clean up inactive devices
     */
    DataCleanupService.prototype.cleanupInactiveDevices = function () {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, taskStartTime, cutoffDate, cutoffDateString, _a, inactiveDevices, selectError, itemsProcessed, _b, deletedDevices, deleteError, itemsDeleted, error_4;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        startTime = Date.now();
                        taskStartTime = new Date().toISOString();
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 4, , 5]);
                        cutoffDate = new Date();
                        cutoffDate.setDate(cutoffDate.getDate() - this.config.deviceRetentionDays);
                        cutoffDateString = cutoffDate.toISOString();
                        return [4 /*yield*/, this.supabase
                                .from('devices')
                                .select('id')
                                .lt('last_seen', cutoffDateString)];
                    case 2:
                        _a = _c.sent(), inactiveDevices = _a.data, selectError = _a.error;
                        if (selectError) {
                            throw new Error("Failed to query inactive devices: ".concat(selectError.message));
                        }
                        itemsProcessed = (inactiveDevices === null || inactiveDevices === void 0 ? void 0 : inactiveDevices.length) || 0;
                        if (itemsProcessed === 0) {
                            return [2 /*return*/, {
                                    task: 'inactive_devices',
                                    success: true,
                                    itemsProcessed: 0,
                                    itemsDeleted: 0,
                                    startTime: taskStartTime,
                                    endTime: new Date().toISOString(),
                                    duration: Date.now() - startTime
                                }];
                        }
                        return [4 /*yield*/, this.supabase
                                .from('devices')
                                .delete()
                                .lt('last_seen', cutoffDateString)
                                .select('id')];
                    case 3:
                        _b = _c.sent(), deletedDevices = _b.data, deleteError = _b.error;
                        if (deleteError) {
                            throw new Error("Failed to delete inactive devices: ".concat(deleteError.message));
                        }
                        itemsDeleted = (deletedDevices === null || deletedDevices === void 0 ? void 0 : deletedDevices.length) || 0;
                        return [2 /*return*/, {
                                task: 'inactive_devices',
                                success: true,
                                itemsProcessed: itemsProcessed,
                                itemsDeleted: itemsDeleted,
                                startTime: taskStartTime,
                                endTime: new Date().toISOString(),
                                duration: Date.now() - startTime
                            }];
                    case 4:
                        error_4 = _c.sent();
                        return [2 /*return*/, {
                                task: 'inactive_devices',
                                success: false,
                                itemsProcessed: 0,
                                itemsDeleted: 0,
                                error: error_4 instanceof Error ? error_4.message : 'Unknown error',
                                startTime: taskStartTime,
                                endTime: new Date().toISOString(),
                                duration: Date.now() - startTime
                            }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Clean up old security events
     */
    DataCleanupService.prototype.cleanupOldSecurityEvents = function () {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, taskStartTime, cutoffDate, cutoffDateString, _a, oldEvents, selectError, itemsProcessed, _b, deletedEvents, deleteError, itemsDeleted, error_5;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        startTime = Date.now();
                        taskStartTime = new Date().toISOString();
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 6, , 7]);
                        cutoffDate = new Date();
                        cutoffDate.setDate(cutoffDate.getDate() - this.config.securityEventRetentionDays);
                        cutoffDateString = cutoffDate.toISOString();
                        return [4 /*yield*/, this.supabase
                                .from('security_events')
                                .select('id')
                                .lt('created_at', cutoffDateString)
                                .neq('severity', 'critical')];
                    case 2:
                        _a = _c.sent(), oldEvents = _a.data, selectError = _a.error;
                        if (selectError) {
                            throw new Error("Failed to query old security events: ".concat(selectError.message));
                        }
                        itemsProcessed = (oldEvents === null || oldEvents === void 0 ? void 0 : oldEvents.length) || 0;
                        if (itemsProcessed === 0) {
                            return [2 /*return*/, {
                                    task: 'old_security_events',
                                    success: true,
                                    itemsProcessed: 0,
                                    itemsDeleted: 0,
                                    startTime: taskStartTime,
                                    endTime: new Date().toISOString(),
                                    duration: Date.now() - startTime
                                }];
                        }
                        if (!this.config.archiveCriticalEvents) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.archiveCriticalEvents(cutoffDateString)];
                    case 3:
                        _c.sent();
                        _c.label = 4;
                    case 4: return [4 /*yield*/, this.supabase
                            .from('security_events')
                            .delete()
                            .lt('created_at', cutoffDateString)
                            .neq('severity', 'critical')
                            .select('id')];
                    case 5:
                        _b = _c.sent(), deletedEvents = _b.data, deleteError = _b.error;
                        if (deleteError) {
                            throw new Error("Failed to delete old security events: ".concat(deleteError.message));
                        }
                        itemsDeleted = (deletedEvents === null || deletedEvents === void 0 ? void 0 : deletedEvents.length) || 0;
                        return [2 /*return*/, {
                                task: 'old_security_events',
                                success: true,
                                itemsProcessed: itemsProcessed,
                                itemsDeleted: itemsDeleted,
                                startTime: taskStartTime,
                                endTime: new Date().toISOString(),
                                duration: Date.now() - startTime
                            }];
                    case 6:
                        error_5 = _c.sent();
                        return [2 /*return*/, {
                                task: 'old_security_events',
                                success: false,
                                itemsProcessed: 0,
                                itemsDeleted: 0,
                                error: error_5 instanceof Error ? error_5.message : 'Unknown error',
                                startTime: taskStartTime,
                                endTime: new Date().toISOString(),
                                duration: Date.now() - startTime
                            }];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Clean up old notifications
     */
    DataCleanupService.prototype.cleanupOldNotifications = function () {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, taskStartTime, cutoffDate, cutoffDateString, _a, oldNotifications, selectError, itemsProcessed, _b, deletedNotifications, deleteError, itemsDeleted, error_6;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        startTime = Date.now();
                        taskStartTime = new Date().toISOString();
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 5, , 6]);
                        cutoffDate = new Date();
                        cutoffDate.setDate(cutoffDate.getDate() - this.config.notificationRetentionDays);
                        cutoffDateString = cutoffDate.toISOString();
                        return [4 /*yield*/, this.supabase
                                .from('notifications')
                                .select('id')
                                .lt('created_at', cutoffDateString)];
                    case 2:
                        _a = _c.sent(), oldNotifications = _a.data, selectError = _a.error;
                        if (selectError) {
                            throw new Error("Failed to query old notifications: ".concat(selectError.message));
                        }
                        itemsProcessed = (oldNotifications === null || oldNotifications === void 0 ? void 0 : oldNotifications.length) || 0;
                        if (itemsProcessed === 0) {
                            return [2 /*return*/, {
                                    task: 'old_notifications',
                                    success: true,
                                    itemsProcessed: 0,
                                    itemsDeleted: 0,
                                    startTime: taskStartTime,
                                    endTime: new Date().toISOString(),
                                    duration: Date.now() - startTime
                                }];
                        }
                        return [4 /*yield*/, this.supabase
                                .from('notifications')
                                .delete()
                                .lt('created_at', cutoffDateString)
                                .select('id')];
                    case 3:
                        _b = _c.sent(), deletedNotifications = _b.data, deleteError = _b.error;
                        if (deleteError) {
                            throw new Error("Failed to delete old notifications: ".concat(deleteError.message));
                        }
                        itemsDeleted = (deletedNotifications === null || deletedNotifications === void 0 ? void 0 : deletedNotifications.length) || 0;
                        // Also cleanup related in-app notifications
                        return [4 /*yield*/, this.supabase
                                .from('in_app_notifications')
                                .delete()
                                .lt('created_at', cutoffDateString)];
                    case 4:
                        // Also cleanup related in-app notifications
                        _c.sent();
                        return [2 /*return*/, {
                                task: 'old_notifications',
                                success: true,
                                itemsProcessed: itemsProcessed,
                                itemsDeleted: itemsDeleted,
                                startTime: taskStartTime,
                                endTime: new Date().toISOString(),
                                duration: Date.now() - startTime
                            }];
                    case 5:
                        error_6 = _c.sent();
                        return [2 /*return*/, {
                                task: 'old_notifications',
                                success: false,
                                itemsProcessed: 0,
                                itemsDeleted: 0,
                                error: error_6 instanceof Error ? error_6.message : 'Unknown error',
                                startTime: taskStartTime,
                                endTime: new Date().toISOString(),
                                duration: Date.now() - startTime
                            }];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Clean up expired device verifications
     */
    DataCleanupService.prototype.cleanupExpiredDeviceVerifications = function () {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, taskStartTime, now, _a, expiredVerifications, selectError, itemsProcessed, _b, deletedVerifications, deleteError, itemsDeleted, error_7;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        startTime = Date.now();
                        taskStartTime = new Date().toISOString();
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 4, , 5]);
                        now = new Date().toISOString();
                        return [4 /*yield*/, this.supabase
                                .from('device_verifications')
                                .select('id')
                                .lt('expires_at', now)];
                    case 2:
                        _a = _c.sent(), expiredVerifications = _a.data, selectError = _a.error;
                        if (selectError) {
                            throw new Error("Failed to query expired verifications: ".concat(selectError.message));
                        }
                        itemsProcessed = (expiredVerifications === null || expiredVerifications === void 0 ? void 0 : expiredVerifications.length) || 0;
                        if (itemsProcessed === 0) {
                            return [2 /*return*/, {
                                    task: 'expired_device_verifications',
                                    success: true,
                                    itemsProcessed: 0,
                                    itemsDeleted: 0,
                                    startTime: taskStartTime,
                                    endTime: new Date().toISOString(),
                                    duration: Date.now() - startTime
                                }];
                        }
                        return [4 /*yield*/, this.supabase
                                .from('device_verifications')
                                .delete()
                                .lt('expires_at', now)
                                .select('id')];
                    case 3:
                        _b = _c.sent(), deletedVerifications = _b.data, deleteError = _b.error;
                        if (deleteError) {
                            throw new Error("Failed to delete expired verifications: ".concat(deleteError.message));
                        }
                        itemsDeleted = (deletedVerifications === null || deletedVerifications === void 0 ? void 0 : deletedVerifications.length) || 0;
                        return [2 /*return*/, {
                                task: 'expired_device_verifications',
                                success: true,
                                itemsProcessed: itemsProcessed,
                                itemsDeleted: itemsDeleted,
                                startTime: taskStartTime,
                                endTime: new Date().toISOString(),
                                duration: Date.now() - startTime
                            }];
                    case 4:
                        error_7 = _c.sent();
                        return [2 /*return*/, {
                                task: 'expired_device_verifications',
                                success: false,
                                itemsProcessed: 0,
                                itemsDeleted: 0,
                                error: error_7 instanceof Error ? error_7.message : 'Unknown error',
                                startTime: taskStartTime,
                                endTime: new Date().toISOString(),
                                duration: Date.now() - startTime
                            }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get cleanup status and statistics
     */
    DataCleanupService.prototype.getCleanupStatus = function () {
        return __awaiter(this, void 0, void 0, function () {
            var status_1;
            return __generator(this, function (_a) {
                try {
                    status_1 = {
                        isRunning: this.isRunning,
                        lastCleanupResults: Object.fromEntries(this.lastCleanupResults),
                        scheduledTasks: Array.from(this.scheduledTasks.keys()),
                        config: this.config,
                        nextScheduledRun: this.getNextScheduledRun()
                    };
                    return [2 /*return*/, {
                            success: true,
                            data: status_1,
                            timestamp: new Date().toISOString()
                        }];
                }
                catch (error) {
                    return [2 /*return*/, {
                            success: false,
                            error: {
                                code: 'CLEANUP_STATUS_ERROR',
                                message: 'Error getting cleanup status',
                                details: { error: error instanceof Error ? error.message : 'Unknown error' }
                            },
                            timestamp: new Date().toISOString()
                        }];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Schedule cleanup task
     */
    DataCleanupService.prototype.scheduleCleanup = function (schedule) {
        var _this = this;
        // Clear existing schedule if any
        var existingTimeout = this.scheduledTasks.get(schedule.name);
        if (existingTimeout) {
            clearTimeout(existingTimeout);
        }
        // Calculate next run time
        var now = Date.now();
        var nextRun = this.calculateNextRun(schedule.cron, now);
        var delay = nextRun - now;
        // Schedule the task
        var timeout = setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
            var error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.runCleanup(schedule.tasks)];
                    case 1:
                        _a.sent();
                        // Reschedule for next run
                        this.scheduleCleanup(schedule);
                        return [3 /*break*/, 3];
                    case 2:
                        error_8 = _a.sent();
                        console.error("Error running scheduled cleanup ".concat(schedule.name, ":"), error_8);
                        // Reschedule even if there was an error
                        this.scheduleCleanup(schedule);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); }, delay);
        this.scheduledTasks.set(schedule.name, timeout);
    };
    /**
     * Stop all scheduled tasks
     */
    DataCleanupService.prototype.stopScheduledTasks = function () {
        this.scheduledTasks.forEach(function (timeout) { return clearTimeout(timeout); });
        this.scheduledTasks.clear();
    };
    /**
     * Private helper methods
     */
    DataCleanupService.prototype.initializeScheduledTasks = function () {
        if (this.config.enableScheduledCleanup) {
            // Daily cleanup at 2 AM
            this.scheduleCleanup({
                name: 'daily_cleanup',
                cron: '0 2 * * *',
                tasks: ['expired_sessions', 'expired_device_verifications']
            });
            // Weekly cleanup on Sunday at 3 AM
            this.scheduleCleanup({
                name: 'weekly_cleanup',
                cron: '0 3 * * 0',
                tasks: ['inactive_devices', 'old_notifications']
            });
            // Monthly cleanup on 1st at 4 AM
            this.scheduleCleanup({
                name: 'monthly_cleanup',
                cron: '0 4 1 * *',
                tasks: ['old_security_events', 'old_audit_logs']
            });
        }
    };
    DataCleanupService.prototype.runCleanupTask = function (taskName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (taskName) {
                    case 'expired_sessions':
                        return [2 /*return*/, this.cleanupExpiredSessions()];
                    case 'inactive_devices':
                        return [2 /*return*/, this.cleanupInactiveDevices()];
                    case 'old_security_events':
                        return [2 /*return*/, this.cleanupOldSecurityEvents()];
                    case 'old_notifications':
                        return [2 /*return*/, this.cleanupOldNotifications()];
                    case 'expired_device_verifications':
                        return [2 /*return*/, this.cleanupExpiredDeviceVerifications()];
                    case 'old_audit_logs':
                        return [2 /*return*/, this.cleanupOldAuditLogs()];
                    default:
                        throw new Error("Unknown cleanup task: ".concat(taskName));
                }
                return [2 /*return*/];
            });
        });
    };
    DataCleanupService.prototype.cleanupOldAuditLogs = function () {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, taskStartTime, cutoffDate, cutoffDateString;
            return __generator(this, function (_a) {
                startTime = Date.now();
                taskStartTime = new Date().toISOString();
                try {
                    cutoffDate = new Date();
                    cutoffDate.setDate(cutoffDate.getDate() - this.config.auditLogRetentionDays);
                    cutoffDateString = cutoffDate.toISOString();
                    // This would cleanup audit logs if they exist
                    // For now, return a placeholder result
                    return [2 /*return*/, {
                            task: 'old_audit_logs',
                            success: true,
                            itemsProcessed: 0,
                            itemsDeleted: 0,
                            startTime: taskStartTime,
                            endTime: new Date().toISOString(),
                            duration: Date.now() - startTime
                        }];
                }
                catch (error) {
                    return [2 /*return*/, {
                            task: 'old_audit_logs',
                            success: false,
                            itemsProcessed: 0,
                            itemsDeleted: 0,
                            error: error instanceof Error ? error.message : 'Unknown error',
                            startTime: taskStartTime,
                            endTime: new Date().toISOString(),
                            duration: Date.now() - startTime
                        }];
                }
                return [2 /*return*/];
            });
        });
    };
    DataCleanupService.prototype.archiveCriticalEvents = function (cutoffDate) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, criticalEvents, error, error_9;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('security_events')
                                .select('*')
                                .eq('severity', 'critical')
                                .lt('created_at', cutoffDate)];
                    case 1:
                        _a = _b.sent(), criticalEvents = _a.data, error = _a.error;
                        if (error || !criticalEvents || criticalEvents.length === 0) {
                            return [2 /*return*/];
                        }
                        // Archive to separate table or external storage
                        // For now, we'll just log that archival would happen
                        console.log("Would archive ".concat(criticalEvents.length, " critical security events"));
                        return [3 /*break*/, 3];
                    case 2:
                        error_9 = _b.sent();
                        console.error('Error archiving critical events:', error_9);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DataCleanupService.prototype.logCleanupSummary = function (summary) {
        return __awaiter(this, void 0, void 0, function () {
            var error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('cleanup_logs')
                                .insert({
                                id: crypto.randomUUID(),
                                summary: JSON.stringify(summary),
                                created_at: new Date().toISOString()
                            })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_10 = _a.sent();
                        console.error('Error logging cleanup summary:', error_10);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DataCleanupService.prototype.calculateNextRun = function (cron, fromTime) {
        // Simple cron parser for basic schedules
        // Format: "minute hour day month dayOfWeek"
        var parts = cron.split(' ');
        if (parts.length !== 5) {
            throw new Error('Invalid cron format');
        }
        var _a = parts.map(function (p) { return parseInt(p); }), minute = _a[0], hour = _a[1], day = _a[2], month = _a[3], dayOfWeek = _a[4];
        var now = new Date(fromTime);
        var next = new Date(now);
        // Set to specified time
        next.setHours(hour, minute, 0, 0);
        // If time has passed today, move to next occurrence
        if (next.getTime() <= now.getTime()) {
            if (dayOfWeek !== undefined && !isNaN(dayOfWeek)) {
                // Weekly schedule
                var daysUntilNext = (7 + dayOfWeek - next.getDay()) % 7;
                next.setDate(next.getDate() + (daysUntilNext || 7));
            }
            else if (day !== undefined && !isNaN(day)) {
                // Monthly schedule
                next.setMonth(next.getMonth() + 1, day);
            }
            else {
                // Daily schedule
                next.setDate(next.getDate() + 1);
            }
        }
        return next.getTime();
    };
    DataCleanupService.prototype.getNextScheduledRun = function () {
        var nextRun = null;
        this.scheduledTasks.forEach(function (timeout) {
            // This is a simplified approach - in a real implementation,
            // you'd track the actual scheduled times
            var scheduledTime = Date.now() + 24 * 60 * 60 * 1000; // Next day
            if (!nextRun || scheduledTime < nextRun) {
                nextRun = scheduledTime;
            }
        });
        return nextRun ? new Date(nextRun).toISOString() : null;
    };
    return DataCleanupService;
}());
exports.DataCleanupService = DataCleanupService;
exports.default = DataCleanupService;

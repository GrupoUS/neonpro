'use client';
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
exports.useBackupSystem = void 0;
var react_1 = require("react");
var client_1 = require("@/lib/supabase/client");
var backup_1 = require("@/lib/backup");
// Mock data for development
var mockConfigs = [
    {
        id: '1',
        name: 'Daily Database Backup',
        description: 'Automated daily backup of the main database',
        enabled: true,
        type: 'FULL',
        source_type: 'DATABASE',
        source_config: {
            database_url: 'postgresql://localhost:5432/neonpro',
        },
        schedule_frequency: 'DAILY',
        schedule_config: {
            time_of_day: '02:00',
            timezone: 'UTC',
        },
        storage_provider: 'S3',
        storage_config: {
            s3_bucket: 'neonpro-backups',
            s3_region: 'us-east-1',
        },
        retention_policy: {
            daily: 7,
            weekly: 4,
            monthly: 3,
            yearly: 1,
        },
        compression_enabled: true,
        compression_level: 6,
        encryption_enabled: true,
        notification_config: {
            on_success: false,
            on_failure: true,
            email_recipients: ['admin@neonpro.com'],
        },
        parallel_uploads: 3,
        chunk_size_mb: 64,
        verify_integrity: true,
        test_restore: false,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-15'),
    },
    {
        id: '2',
        name: 'Weekly Files Backup',
        description: 'Weekly backup of application files and uploads',
        enabled: true,
        type: 'INCREMENTAL',
        source_type: 'DIRECTORY',
        source_config: {
            directory_path: '/app/uploads',
            exclude_patterns: ['*.tmp', '*.log'],
        },
        schedule_frequency: 'WEEKLY',
        schedule_config: {
            time_of_day: '01:00',
            day_of_week: 0,
            timezone: 'UTC',
        },
        storage_provider: 'LOCAL',
        storage_config: {
            local_path: '/backups/files',
        },
        retention_policy: {
            daily: 0,
            weekly: 8,
            monthly: 6,
            yearly: 2,
        },
        compression_enabled: true,
        compression_level: 4,
        encryption_enabled: false,
        notification_config: {
            on_success: true,
            on_failure: true,
        },
        parallel_uploads: 2,
        chunk_size_mb: 32,
        verify_integrity: true,
        test_restore: true,
        created_at: new Date('2024-01-05'),
        updated_at: new Date('2024-01-10'),
    },
];
var mockBackups = [
    {
        id: '1',
        config_id: '1',
        type: 'FULL',
        status: 'COMPLETED',
        started_at: new Date('2024-01-15T02:00:00Z'),
        completed_at: new Date('2024-01-15T02:45:00Z'),
        size_bytes: 1024 * 1024 * 1024 * 2.5, // 2.5 GB
        compressed_size_bytes: 1024 * 1024 * 1024 * 0.8, // 800 MB
        file_count: 15420,
        storage_path: 's3://neonpro-backups/2024/01/15/full-backup-20240115-020000.tar.gz',
        checksum: 'sha256:abc123...',
        metadata: {
            duration_seconds: 2700,
            compression_ratio: 0.32,
            upload_speed_mbps: 12.5,
        },
        created_at: new Date('2024-01-15T02:00:00Z'),
        updated_at: new Date('2024-01-15T02:45:00Z'),
    },
    {
        id: '2',
        config_id: '1',
        type: 'INCREMENTAL',
        status: 'COMPLETED',
        started_at: new Date('2024-01-14T02:00:00Z'),
        completed_at: new Date('2024-01-14T02:15:00Z'),
        size_bytes: 1024 * 1024 * 256, // 256 MB
        compressed_size_bytes: 1024 * 1024 * 64, // 64 MB
        file_count: 1250,
        storage_path: 's3://neonpro-backups/2024/01/14/incremental-backup-20240114-020000.tar.gz',
        checksum: 'sha256:def456...',
        metadata: {
            duration_seconds: 900,
            compression_ratio: 0.25,
            upload_speed_mbps: 15.2,
        },
        created_at: new Date('2024-01-14T02:00:00Z'),
        updated_at: new Date('2024-01-14T02:15:00Z'),
    },
    {
        id: '3',
        config_id: '2',
        type: 'INCREMENTAL',
        status: 'RUNNING',
        started_at: new Date(),
        size_bytes: 0,
        file_count: 0,
        progress_percentage: 65,
        current_operation: 'Uploading files to storage',
        created_at: new Date(),
        updated_at: new Date(),
    },
];
var mockRecoveries = [
    {
        id: '1',
        backup_id: '1',
        type: 'FULL',
        status: 'COMPLETED',
        target_location: '/restore/2024-01-15',
        requested_by: 'admin@neonpro.com',
        started_at: new Date('2024-01-15T10:00:00Z'),
        completed_at: new Date('2024-01-15T10:30:00Z'),
        progress_percentage: 100,
        metadata: {
            restored_files: 15420,
            restored_size_bytes: 1024 * 1024 * 1024 * 2.5,
            duration_seconds: 1800,
        },
        created_at: new Date('2024-01-15T09:55:00Z'),
        updated_at: new Date('2024-01-15T10:30:00Z'),
    },
];
var mockMetrics = {
    id: '1',
    date: new Date(),
    total_backups: 156,
    successful_backups: 152,
    failed_backups: 4,
    total_size_bytes: 1024 * 1024 * 1024 * 1024 * 2.8, // 2.8 TB
    compressed_size_bytes: 1024 * 1024 * 1024 * 1024 * 0.9, // 900 GB
    average_duration_seconds: 1800,
    storage_usage_bytes: 1024 * 1024 * 1024 * 1024 * 0.9,
    active_configs: 8,
    created_at: new Date(),
    updated_at: new Date(),
};
var mockAlerts = [
    {
        id: '1',
        type: 'BACKUP_FAILED',
        severity: 'HIGH',
        title: 'Database Backup Failed',
        message: 'The daily database backup failed due to connection timeout',
        config_id: '1',
        backup_id: '3',
        acknowledged: false,
        resolved: false,
        metadata: {
            error_code: 'TIMEOUT',
            retry_count: 3,
        },
        created_at: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        updated_at: new Date(Date.now() - 1000 * 60 * 30),
    },
    {
        id: '2',
        type: 'STORAGE_WARNING',
        severity: 'MEDIUM',
        title: 'Storage Space Warning',
        message: 'Backup storage is 85% full. Consider cleaning up old backups.',
        acknowledged: false,
        resolved: false,
        metadata: {
            usage_percentage: 85,
            available_space_gb: 150,
        },
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
];
var useBackupSystem = function () {
    // State
    var _a = (0, react_1.useState)({
        isInitialized: false,
        isLoading: false,
        error: null,
        configs: [],
        activeConfigs: [],
        backups: [],
        recentBackups: [],
        recoveries: [],
        activeRecoveries: [],
        metrics: null,
        alerts: [],
        systemHealth: {
            overall: 'healthy',
            storage: 'healthy',
            scheduler: 'healthy',
            lastCheck: null,
        },
    }), state = _a[0], setState = _a[1];
    var _b = (0, react_1.useState)(null), backupSystem = _b[0], setBackupSystem = _b[1];
    var supabase = yield (0, client_1.createClient)();
    // Initialize the backup system
    var initializeSystem = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var system, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    setState(function (prev) { return (__assign(__assign({}, prev), { isLoading: true, error: null })); });
                    system = new backup_1.BackupSystem();
                    return [4 /*yield*/, system.initialize()];
                case 1:
                    _a.sent();
                    setBackupSystem(system);
                    // Load initial data
                    setState(function (prev) { return (__assign(__assign({}, prev), { isInitialized: true, isLoading: false, configs: mockConfigs, activeConfigs: mockConfigs.filter(function (c) { return c.enabled; }), backups: mockBackups, recentBackups: mockBackups.slice(0, 10), recoveries: mockRecoveries, activeRecoveries: mockRecoveries.filter(function (r) { return r.status === 'RUNNING'; }), metrics: mockMetrics, alerts: mockAlerts, systemHealth: {
                            overall: 'healthy',
                            storage: 'warning', // Based on storage alert
                            scheduler: 'healthy',
                            lastCheck: new Date(),
                        } })); });
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    setState(function (prev) { return (__assign(__assign({}, prev), { isLoading: false, error: error_1 instanceof Error ? error_1.message : 'Failed to initialize backup system' })); });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); }, []);
    // Shutdown the backup system
    var shutdownSystem = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    if (!backupSystem) return [3 /*break*/, 2];
                    return [4 /*yield*/, backupSystem.shutdown()];
                case 1:
                    _a.sent();
                    setBackupSystem(null);
                    _a.label = 2;
                case 2:
                    setState(function (prev) { return (__assign(__assign({}, prev), { isInitialized: false })); });
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    setState(function (prev) { return (__assign(__assign({}, prev), { error: error_2 instanceof Error ? error_2.message : 'Failed to shutdown backup system' })); });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [backupSystem]);
    // Refresh all data
    var refreshData = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    setState(function (prev) { return (__assign(__assign({}, prev), { isLoading: true })); });
                    // In a real implementation, this would fetch from the database
                    // For now, we'll simulate a refresh with updated mock data
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                case 1:
                    // In a real implementation, this would fetch from the database
                    // For now, we'll simulate a refresh with updated mock data
                    _a.sent();
                    setState(function (prev) { return (__assign(__assign({}, prev), { isLoading: false, configs: mockConfigs, activeConfigs: mockConfigs.filter(function (c) { return c.enabled; }), backups: mockBackups, recentBackups: mockBackups.slice(0, 10), recoveries: mockRecoveries, activeRecoveries: mockRecoveries.filter(function (r) { return r.status === 'RUNNING'; }), metrics: mockMetrics, alerts: mockAlerts, systemHealth: __assign(__assign({}, prev.systemHealth), { lastCheck: new Date() }) })); });
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    setState(function (prev) { return (__assign(__assign({}, prev), { isLoading: false, error: error_3 instanceof Error ? error_3.message : 'Failed to refresh data' })); });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); }, []);
    // Configuration management
    var createConfig = (0, react_1.useCallback)(function (configData) { return __awaiter(void 0, void 0, void 0, function () {
        var newConfig_1;
        return __generator(this, function (_a) {
            try {
                newConfig_1 = __assign(__assign({}, configData), { id: Math.random().toString(36).substr(2, 9), created_at: new Date(), updated_at: new Date() });
                setState(function (prev) { return (__assign(__assign({}, prev), { configs: __spreadArray(__spreadArray([], prev.configs, true), [newConfig_1], false), activeConfigs: newConfig_1.enabled
                        ? __spreadArray(__spreadArray([], prev.activeConfigs, true), [newConfig_1], false) : prev.activeConfigs })); });
                return [2 /*return*/, newConfig_1];
            }
            catch (error) {
                throw new Error(error instanceof Error ? error.message : 'Failed to create config');
            }
            return [2 /*return*/];
        });
    }); }, []);
    var updateConfig = (0, react_1.useCallback)(function (id, updates) { return __awaiter(void 0, void 0, void 0, function () {
        var updatedConfig_1;
        return __generator(this, function (_a) {
            try {
                updatedConfig_1 = __assign(__assign(__assign({}, state.configs.find(function (c) { return c.id === id; })), updates), { updated_at: new Date() });
                setState(function (prev) { return (__assign(__assign({}, prev), { configs: prev.configs.map(function (c) { return c.id === id ? updatedConfig_1 : c; }), activeConfigs: prev.activeConfigs.map(function (c) { return c.id === id ? updatedConfig_1 : c; }) })); });
                return [2 /*return*/, updatedConfig_1];
            }
            catch (error) {
                throw new Error(error instanceof Error ? error.message : 'Failed to update config');
            }
            return [2 /*return*/];
        });
    }); }, [state.configs]);
    var deleteConfig = (0, react_1.useCallback)(function (id) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                setState(function (prev) { return (__assign(__assign({}, prev), { configs: prev.configs.filter(function (c) { return c.id !== id; }), activeConfigs: prev.activeConfigs.filter(function (c) { return c.id !== id; }) })); });
            }
            catch (error) {
                throw new Error(error instanceof Error ? error.message : 'Failed to delete config');
            }
            return [2 /*return*/];
        });
    }); }, []);
    var toggleConfig = (0, react_1.useCallback)(function (id, enabled) { return __awaiter(void 0, void 0, void 0, function () {
        var error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, updateConfig(id, { enabled: enabled })];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_4 = _a.sent();
                    throw new Error(error_4 instanceof Error ? error_4.message : 'Failed to toggle config');
                case 3: return [2 /*return*/];
            }
        });
    }); }, [updateConfig]);
    // Backup operations
    var runManualBackup = (0, react_1.useCallback)(function (configId) { return __awaiter(void 0, void 0, void 0, function () {
        var newBackup_1;
        return __generator(this, function (_a) {
            try {
                if (!backupSystem) {
                    throw new Error('Backup system not initialized');
                }
                newBackup_1 = {
                    id: Math.random().toString(36).substr(2, 9),
                    config_id: configId,
                    type: 'FULL',
                    status: 'RUNNING',
                    started_at: new Date(),
                    size_bytes: 0,
                    file_count: 0,
                    progress_percentage: 0,
                    current_operation: 'Initializing backup...',
                    created_at: new Date(),
                    updated_at: new Date(),
                };
                setState(function (prev) { return (__assign(__assign({}, prev), { backups: __spreadArray([newBackup_1], prev.backups, true), recentBackups: __spreadArray([newBackup_1], prev.recentBackups.slice(0, 9), true) })); });
                return [2 /*return*/, newBackup_1];
            }
            catch (error) {
                throw new Error(error instanceof Error ? error.message : 'Failed to run manual backup');
            }
            return [2 /*return*/];
        });
    }); }, [backupSystem]);
    var runQuickBackup = (0, react_1.useCallback)(function (type, source) { return __awaiter(void 0, void 0, void 0, function () {
        var quickConfig, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    if (!backupSystem) {
                        throw new Error('Backup system not initialized');
                    }
                    quickConfig = {
                        id: 'quick-' + Math.random().toString(36).substr(2, 9),
                        name: "Quick ".concat(type, " Backup"),
                        description: "Quick backup of ".concat(source),
                        enabled: true,
                        type: type,
                        source_type: 'DIRECTORY',
                        source_config: { directory_path: source },
                        schedule_frequency: 'DAILY',
                        schedule_config: { timezone: 'UTC' },
                        storage_provider: 'LOCAL',
                        storage_config: { local_path: '/tmp/quick-backups' },
                        retention_policy: { daily: 1, weekly: 0, monthly: 0, yearly: 0 },
                        compression_enabled: true,
                        compression_level: 6,
                        encryption_enabled: false,
                        notification_config: { on_success: false, on_failure: true },
                        parallel_uploads: 1,
                        chunk_size_mb: 64,
                        verify_integrity: true,
                        test_restore: false,
                        created_at: new Date(),
                        updated_at: new Date(),
                    };
                    return [4 /*yield*/, runManualBackup(quickConfig.id)];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    error_5 = _a.sent();
                    throw new Error(error_5 instanceof Error ? error_5.message : 'Failed to run quick backup');
                case 3: return [2 /*return*/];
            }
        });
    }); }, [backupSystem, runManualBackup]);
    var cancelBackup = (0, react_1.useCallback)(function (backupId) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                setState(function (prev) { return (__assign(__assign({}, prev), { backups: prev.backups.map(function (b) {
                        return b.id === backupId
                            ? __assign(__assign({}, b), { status: 'CANCELLED', completed_at: new Date() }) : b;
                    }) })); });
            }
            catch (error) {
                throw new Error(error instanceof Error ? error.message : 'Failed to cancel backup');
            }
            return [2 /*return*/];
        });
    }); }, []);
    // Recovery operations
    var createRecovery = (0, react_1.useCallback)(function (requestData) { return __awaiter(void 0, void 0, void 0, function () {
        var newRecovery_1;
        return __generator(this, function (_a) {
            try {
                newRecovery_1 = __assign(__assign({}, requestData), { id: Math.random().toString(36).substr(2, 9), status: 'PENDING', progress_percentage: 0, created_at: new Date(), updated_at: new Date() });
                setState(function (prev) { return (__assign(__assign({}, prev), { recoveries: __spreadArray([newRecovery_1], prev.recoveries, true), activeRecoveries: __spreadArray([newRecovery_1], prev.activeRecoveries, true) })); });
                return [2 /*return*/, newRecovery_1];
            }
            catch (error) {
                throw new Error(error instanceof Error ? error.message : 'Failed to create recovery request');
            }
            return [2 /*return*/];
        });
    }); }, []);
    var cancelRecovery = (0, react_1.useCallback)(function (recoveryId) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                setState(function (prev) { return (__assign(__assign({}, prev), { recoveries: prev.recoveries.map(function (r) {
                        return r.id === recoveryId
                            ? __assign(__assign({}, r), { status: 'CANCELLED', completed_at: new Date() }) : r;
                    }), activeRecoveries: prev.activeRecoveries.filter(function (r) { return r.id !== recoveryId; }) })); });
            }
            catch (error) {
                throw new Error(error instanceof Error ? error.message : 'Failed to cancel recovery');
            }
            return [2 /*return*/];
        });
    }); }, []);
    // Monitoring
    var acknowledgeAlert = (0, react_1.useCallback)(function (alertId) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                setState(function (prev) { return (__assign(__assign({}, prev), { alerts: prev.alerts.map(function (a) {
                        return a.id === alertId
                            ? __assign(__assign({}, a), { acknowledged: true, updated_at: new Date() }) : a;
                    }) })); });
            }
            catch (error) {
                throw new Error(error instanceof Error ? error.message : 'Failed to acknowledge alert');
            }
            return [2 /*return*/];
        });
    }); }, []);
    var dismissAlert = (0, react_1.useCallback)(function (alertId) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                setState(function (prev) { return (__assign(__assign({}, prev), { alerts: prev.alerts.filter(function (a) { return a.id !== alertId; }) })); });
            }
            catch (error) {
                throw new Error(error instanceof Error ? error.message : 'Failed to dismiss alert');
            }
            return [2 /*return*/];
        });
    }); }, []);
    // Testing
    var testStorageConnection = (0, react_1.useCallback)(function (provider, config) { return __awaiter(void 0, void 0, void 0, function () {
        var error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    // Simulate connection test
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 2000); })];
                case 1:
                    // Simulate connection test
                    _a.sent();
                    return [2 /*return*/, Math.random() > 0.2]; // 80% success rate for demo
                case 2:
                    error_6 = _a.sent();
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    }); }, []);
    var validateBackup = (0, react_1.useCallback)(function (backupId) { return __awaiter(void 0, void 0, void 0, function () {
        var error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    // Simulate backup validation
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 3000); })];
                case 1:
                    // Simulate backup validation
                    _a.sent();
                    return [2 /*return*/, Math.random() > 0.1]; // 90% success rate for demo
                case 2:
                    error_7 = _a.sent();
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    }); }, []);
    // Auto-refresh data every 30 seconds when initialized
    (0, react_1.useEffect)(function () {
        if (!state.isInitialized)
            return;
        var interval = setInterval(function () {
            refreshData();
        }, 30000);
        return function () { return clearInterval(interval); };
    }, [state.isInitialized, refreshData]);
    // Initialize on mount
    (0, react_1.useEffect)(function () {
        initializeSystem();
        return function () {
            shutdownSystem();
        };
    }, []);
    return __assign(__assign({}, state), { 
        // Actions
        initializeSystem: initializeSystem, shutdownSystem: shutdownSystem, refreshData: refreshData, createConfig: createConfig, updateConfig: updateConfig, deleteConfig: deleteConfig, toggleConfig: toggleConfig, runManualBackup: runManualBackup, runQuickBackup: runQuickBackup, cancelBackup: cancelBackup, createRecovery: createRecovery, cancelRecovery: cancelRecovery, acknowledgeAlert: acknowledgeAlert, dismissAlert: dismissAlert, testStorageConnection: testStorageConnection, validateBackup: validateBackup });
};
exports.useBackupSystem = useBackupSystem;
exports.default = exports.useBackupSystem;

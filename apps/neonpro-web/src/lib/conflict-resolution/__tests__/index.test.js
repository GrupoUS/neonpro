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
var index_1 = require("../index");
var types_1 = require("../types");
var supabase_js_1 = require("@supabase/supabase-js");
// Mock Supabase
jest.mock('@supabase/supabase-js');
var mockSupabase = {
    from: jest.fn(function () { return ({
        select: jest.fn(function () { return ({
            eq: jest.fn(function () { return ({
                gte: jest.fn(function () { return ({
                    lte: jest.fn(function () { return ({
                        neq: jest.fn(function () { return ({
                            order: jest.fn(function () { return Promise.resolve({ data: [], error: null }); })
                        }); })
                    }); })
                }); })
            }); })
        }); }),
        update: jest.fn(function () { return ({
            eq: jest.fn(function () { return Promise.resolve({ data: [], error: null }); })
        }); }),
        insert: jest.fn(function () { return Promise.resolve({ data: [], error: null }); })
    }); }),
    rpc: jest.fn(function () { return Promise.resolve({ data: null, error: null }); })
};
supabase_js_1.createClient.mockReturnValue(mockSupabase);
describe('IntelligentConflictResolutionSystem', function () {
    var system;
    var mockConfig;
    beforeEach(function () {
        mockConfig = {
            detection: {
                enabledTypes: [types_1.ConflictType.TIME_OVERLAP, types_1.ConflictType.STAFF_CONFLICT, types_1.ConflictType.ROOM_CONFLICT],
                severityThresholds: {
                    low: 0.3,
                    medium: 0.6,
                    high: 0.8
                },
                cacheEnabled: true,
                cacheTTL: 300000,
                batchSize: 100,
                maxConcurrentChecks: 5
            },
            resolution: {
                enabledStrategies: [
                    types_1.ResolutionStrategy.RESCHEDULE_LATER,
                    types_1.ResolutionStrategy.RESCHEDULE_EARLIER,
                    types_1.ResolutionStrategy.CHANGE_STAFF,
                    types_1.ResolutionStrategy.CHANGE_ROOM
                ],
                maxResolutionOptions: 5,
                autoApplyThreshold: 0.9,
                requireApproval: true,
                notificationEnabled: true,
                rollbackEnabled: true,
                maxRollbackDays: 7
            },
            optimization: {
                enabledOptimizations: [
                    types_1.OptimizationType.STAFF_BALANCING,
                    types_1.OptimizationType.ROOM_UTILIZATION,
                    types_1.OptimizationType.EQUIPMENT_ALLOCATION
                ],
                workloadThresholds: {
                    underutilized: 0.3,
                    optimal: 0.7,
                    overloaded: 0.9
                },
                utilizationTargets: {
                    staff: 0.75,
                    rooms: 0.8,
                    equipment: 0.7
                },
                optimizationInterval: 3600000,
                autoApplyOptimizations: false,
                maxRecommendations: 10,
                considerClientPreferences: true,
                respectStaffAvailability: true
            },
            automation: {
                enabled: true,
                rules: [],
                scheduleOptimization: true,
                optimizationFrequency: 'daily',
                autoResolveConflicts: false,
                notificationSettings: {
                    email: true,
                    sms: false,
                    inApp: true
                }
            },
            constraints: {
                businessHours: {
                    start: '09:00',
                    end: '17:00'
                },
                maxRescheduleDays: 7,
                minNoticeHours: 24,
                allowWeekendRescheduling: false,
                respectClientPreferences: true,
                maintainServiceQuality: true
            }
        };
        system = new index_1.IntelligentConflictResolutionSystem(mockConfig);
        jest.clearAllMocks();
    });
    describe('Initialization', function () {
        it('should initialize with default config', function () {
            var defaultSystem = new index_1.IntelligentConflictResolutionSystem();
            expect(defaultSystem).toBeInstanceOf(index_1.IntelligentConflictResolutionSystem);
        });
        it('should initialize with custom config', function () {
            expect(system).toBeInstanceOf(index_1.IntelligentConflictResolutionSystem);
        });
        it('should validate config on initialization', function () {
            var invalidConfig = __assign(__assign({}, mockConfig), { detection: __assign(__assign({}, mockConfig.detection), { severityThresholds: {
                        low: 0.8,
                        medium: 0.6,
                        high: 0.3
                    } }) });
            expect(function () { return new index_1.IntelligentConflictResolutionSystem(invalidConfig); }).toThrow();
        });
        it('should initialize all subsystems', function () {
            expect(system).toHaveProperty('detector');
            expect(system).toHaveProperty('resolutionEngine');
            expect(system).toHaveProperty('optimizer');
        });
    });
    describe('detectAndResolveConflicts', function () {
        var mockAppointment = {
            id: 'appointment-1',
            start_time: '2024-01-15T10:00:00Z',
            end_time: '2024-01-15T11:00:00Z',
            staff_id: 'staff-1',
            room_id: 'room-1',
            client_id: 'client-1',
            service_id: 'service-1',
            status: 'scheduled'
        };
        it('should detect and resolve conflicts automatically', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockConflicts, overlappingAppointment, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockConflicts = [
                            {
                                id: 'conflict-1',
                                type: types_1.ConflictType.TIME_OVERLAP,
                                severity: types_1.ConflictSeverity.HIGH,
                                appointmentId: 'appointment-1',
                                conflictingAppointmentId: 'appointment-2',
                                description: 'Time overlap conflict',
                                detectedAt: new Date(),
                                metadata: {
                                    overlapDuration: 30,
                                    overlapPercentage: 0.5
                                }
                            }
                        ];
                        overlappingAppointment = {
                            id: 'appointment-2',
                            start_time: '2024-01-15T10:30:00Z',
                            end_time: '2024-01-15T11:30:00Z',
                            staff_id: 'staff-1',
                            room_id: 'room-2',
                            client_id: 'client-2',
                            service_id: 'service-2',
                            status: 'scheduled'
                        };
                        mockSupabase.from.mockImplementation(function (table) {
                            if (table === 'appointments') {
                                return {
                                    select: jest.fn(function () { return ({
                                        gte: jest.fn(function () { return ({
                                            lte: jest.fn(function () { return ({
                                                eq: jest.fn(function () { return ({
                                                    neq: jest.fn(function () { return Promise.resolve({
                                                        data: [overlappingAppointment],
                                                        error: null
                                                    }); })
                                                }); })
                                            }); })
                                        }); })
                                    }); }),
                                    update: jest.fn(function () { return ({
                                        eq: jest.fn(function () { return Promise.resolve({
                                            data: [{ id: 'appointment-1' }],
                                            error: null
                                        }); })
                                    }); })
                                };
                            }
                            return {
                                select: jest.fn(function () { return Promise.resolve({ data: [], error: null }); })
                            };
                        });
                        return [4 /*yield*/, system.detectAndResolveConflicts(mockAppointment)];
                    case 1:
                        result = _a.sent();
                        expect(result).toBeDefined();
                        expect(result.conflicts).toBeDefined();
                        expect(result.resolutions).toBeDefined();
                        expect(Array.isArray(result.conflicts)).toBe(true);
                        expect(Array.isArray(result.resolutions)).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle no conflicts scenario', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockSupabase.from.mockReturnValue({
                            select: jest.fn(function () { return ({
                                gte: jest.fn(function () { return ({
                                    lte: jest.fn(function () { return ({
                                        eq: jest.fn(function () { return ({
                                            neq: jest.fn(function () { return Promise.resolve({
                                                data: [],
                                                error: null
                                            }); })
                                        }); })
                                    }); })
                                }); })
                            }); })
                        });
                        return [4 /*yield*/, system.detectAndResolveConflicts(mockAppointment)];
                    case 1:
                        result = _a.sent();
                        expect(result.conflicts).toHaveLength(0);
                        expect(result.resolutions).toHaveLength(0);
                        expect(result.success).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should respect automation rules', function () { return __awaiter(void 0, void 0, void 0, function () {
            var automationRule, configWithAutomation, automatedSystem, lowSeverityConflict, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        automationRule = {
                            id: 'rule-1',
                            name: 'Auto-resolve low severity conflicts',
                            condition: {
                                conflictType: types_1.ConflictType.TIME_OVERLAP,
                                severity: types_1.ConflictSeverity.LOW,
                                maxAffectedAppointments: 2
                            },
                            action: {
                                strategy: types_1.ResolutionStrategy.RESCHEDULE_LATER,
                                autoApply: true,
                                requireApproval: false
                            },
                            enabled: true,
                            priority: 1
                        };
                        configWithAutomation = __assign(__assign({}, mockConfig), { automation: __assign(__assign({}, mockConfig.automation), { rules: [automationRule], autoResolveConflicts: true }) });
                        automatedSystem = new index_1.IntelligentConflictResolutionSystem(configWithAutomation);
                        lowSeverityConflict = {
                            id: 'appointment-2',
                            start_time: '2024-01-15T10:45:00Z',
                            end_time: '2024-01-15T11:15:00Z',
                            staff_id: 'staff-1',
                            room_id: 'room-2',
                            client_id: 'client-2',
                            service_id: 'service-2',
                            status: 'scheduled'
                        };
                        mockSupabase.from.mockImplementation(function (table) {
                            if (table === 'appointments') {
                                return {
                                    select: jest.fn(function () { return ({
                                        gte: jest.fn(function () { return ({
                                            lte: jest.fn(function () { return ({
                                                eq: jest.fn(function () { return ({
                                                    neq: jest.fn(function () { return Promise.resolve({
                                                        data: [lowSeverityConflict],
                                                        error: null
                                                    }); })
                                                }); })
                                            }); })
                                        }); })
                                    }); }),
                                    update: jest.fn(function () { return ({
                                        eq: jest.fn(function () { return Promise.resolve({
                                            data: [{ id: 'appointment-1' }],
                                            error: null
                                        }); })
                                    }); })
                                };
                            }
                            return {
                                select: jest.fn(function () { return Promise.resolve({ data: [], error: null }); })
                            };
                        });
                        return [4 /*yield*/, automatedSystem.detectAndResolveConflicts(mockAppointment)];
                    case 1:
                        result = _a.sent();
                        expect(result.autoResolved).toBe(true);
                        expect(result.appliedResolutions).toBeDefined();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle high severity conflicts requiring approval', function () { return __awaiter(void 0, void 0, void 0, function () {
            var highSeverityConflict, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        highSeverityConflict = {
                            id: 'appointment-2',
                            start_time: '2024-01-15T10:00:00Z',
                            end_time: '2024-01-15T11:00:00Z',
                            staff_id: 'staff-1',
                            room_id: 'room-1',
                            client_id: 'client-2',
                            service_id: 'service-2',
                            status: 'scheduled'
                        };
                        mockSupabase.from.mockImplementation(function (table) {
                            if (table === 'appointments') {
                                return {
                                    select: jest.fn(function () { return ({
                                        gte: jest.fn(function () { return ({
                                            lte: jest.fn(function () { return ({
                                                eq: jest.fn(function () { return ({
                                                    neq: jest.fn(function () { return Promise.resolve({
                                                        data: [highSeverityConflict],
                                                        error: null
                                                    }); })
                                                }); })
                                            }); })
                                        }); })
                                    }); })
                                };
                            }
                            return {
                                select: jest.fn(function () { return Promise.resolve({ data: [], error: null }); })
                            };
                        });
                        return [4 /*yield*/, system.detectAndResolveConflicts(mockAppointment)];
                    case 1:
                        result = _a.sent();
                        expect(result.requiresApproval).toBe(true);
                        expect(result.pendingApprovals).toBeDefined();
                        expect(result.pendingApprovals.length).toBeGreaterThan(0);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('optimizeResourceAllocation', function () {
        var mockDateRange = {
            startDate: new Date('2024-01-15T00:00:00Z'),
            endDate: new Date('2024-01-15T23:59:59Z')
        };
        it('should optimize resource allocation', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockAppointments, mockStaff, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockAppointments = [
                            {
                                id: 'appointment-1',
                                start_time: '2024-01-15T10:00:00Z',
                                end_time: '2024-01-15T11:00:00Z',
                                staff_id: 'staff-1',
                                room_id: 'room-1',
                                client_id: 'client-1',
                                service_id: 'service-1',
                                status: 'scheduled'
                            }
                        ];
                        mockStaff = [
                            {
                                id: 'staff-1',
                                name: 'John Doe',
                                role: 'therapist',
                                availability: '09:00-17:00'
                            }
                        ];
                        mockSupabase.from.mockImplementation(function (table) {
                            if (table === 'appointments') {
                                return {
                                    select: jest.fn(function () { return ({
                                        gte: jest.fn(function () { return ({
                                            lte: jest.fn(function () { return ({
                                                eq: jest.fn(function () { return Promise.resolve({
                                                    data: mockAppointments,
                                                    error: null
                                                }); })
                                            }); })
                                        }); })
                                    }); })
                                };
                            }
                            if (table === 'staff') {
                                return {
                                    select: jest.fn(function () { return Promise.resolve({
                                        data: mockStaff,
                                        error: null
                                    }); })
                                };
                            }
                            return {
                                select: jest.fn(function () { return Promise.resolve({ data: [], error: null }); })
                            };
                        });
                        return [4 /*yield*/, system.optimizeResourceAllocation(mockDateRange)];
                    case 1:
                        result = _a.sent();
                        expect(result).toBeDefined();
                        expect(result.recommendations).toBeDefined();
                        expect(result.metrics).toBeDefined();
                        expect(result.workloadDistribution).toBeDefined();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should apply optimizations when auto-apply is enabled', function () { return __awaiter(void 0, void 0, void 0, function () {
            var configWithAutoApply, autoSystem, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        configWithAutoApply = __assign(__assign({}, mockConfig), { optimization: __assign(__assign({}, mockConfig.optimization), { autoApplyOptimizations: true }) });
                        autoSystem = new index_1.IntelligentConflictResolutionSystem(configWithAutoApply);
                        mockSupabase.from.mockImplementation(function (table) {
                            return {
                                select: jest.fn(function () { return ({
                                    gte: jest.fn(function () { return ({
                                        lte: jest.fn(function () { return ({
                                            eq: jest.fn(function () { return Promise.resolve({
                                                data: [],
                                                error: null
                                            }); })
                                        }); })
                                    }); })
                                }); }),
                                update: jest.fn(function () { return ({
                                    eq: jest.fn(function () { return Promise.resolve({
                                        data: [],
                                        error: null
                                    }); })
                                }); })
                            };
                        });
                        return [4 /*yield*/, autoSystem.optimizeResourceAllocation(mockDateRange)];
                    case 1:
                        result = _a.sent();
                        expect(result.appliedOptimizations).toBeDefined();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('balanceWorkload', function () {
        it('should balance workload across staff', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockStaffWorkload, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockStaffWorkload = [
                            {
                                staffId: 'staff-1',
                                totalHours: 45,
                                appointmentCount: 10,
                                utilizationRate: 0.9,
                                efficiency: 0.8
                            },
                            {
                                staffId: 'staff-2',
                                totalHours: 20,
                                appointmentCount: 4,
                                utilizationRate: 0.4,
                                efficiency: 0.9
                            }
                        ];
                        mockSupabase.from.mockReturnValue({
                            select: jest.fn(function () { return ({
                                gte: jest.fn(function () { return ({
                                    lte: jest.fn(function () { return ({
                                        eq: jest.fn(function () { return Promise.resolve({
                                            data: [],
                                            error: null
                                        }); })
                                    }); })
                                }); })
                            }); })
                        });
                        return [4 /*yield*/, system.balanceWorkload(mockStaffWorkload)];
                    case 1:
                        result = _a.sent();
                        expect(result).toBeDefined();
                        expect(result.recommendations).toBeDefined();
                        expect(result.balancingActions).toBeDefined();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('getSystemAnalytics', function () {
        it('should provide comprehensive system analytics', function () { return __awaiter(void 0, void 0, void 0, function () {
            var dateRange, analytics;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dateRange = {
                            startDate: new Date('2024-01-01T00:00:00Z'),
                            endDate: new Date('2024-01-31T23:59:59Z')
                        };
                        mockSupabase.from.mockReturnValue({
                            select: jest.fn(function () { return ({
                                gte: jest.fn(function () { return ({
                                    lte: jest.fn(function () { return ({
                                        eq: jest.fn(function () { return Promise.resolve({
                                            data: [],
                                            error: null
                                        }); })
                                    }); })
                                }); })
                            }); })
                        });
                        return [4 /*yield*/, system.getSystemAnalytics(dateRange)];
                    case 1:
                        analytics = _a.sent();
                        expect(analytics).toBeDefined();
                        expect(analytics.conflictMetrics).toBeDefined();
                        expect(analytics.resolutionMetrics).toBeDefined();
                        expect(analytics.optimizationMetrics).toBeDefined();
                        expect(analytics.performanceMetrics).toBeDefined();
                        expect(analytics.trends).toBeDefined();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should calculate performance trends', function () { return __awaiter(void 0, void 0, void 0, function () {
            var dateRange, mockConflictHistory, analytics;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dateRange = {
                            startDate: new Date('2024-01-01T00:00:00Z'),
                            endDate: new Date('2024-01-31T23:59:59Z')
                        };
                        mockConflictHistory = [
                            {
                                date: '2024-01-01',
                                conflicts_detected: 5,
                                conflicts_resolved: 4,
                                avg_resolution_time: 15
                            },
                            {
                                date: '2024-01-02',
                                conflicts_detected: 3,
                                conflicts_resolved: 3,
                                avg_resolution_time: 12
                            }
                        ];
                        mockSupabase.from.mockReturnValue({
                            select: jest.fn(function () { return ({
                                gte: jest.fn(function () { return ({
                                    lte: jest.fn(function () { return ({
                                        eq: jest.fn(function () { return Promise.resolve({
                                            data: mockConflictHistory,
                                            error: null
                                        }); })
                                    }); })
                                }); })
                            }); })
                        });
                        return [4 /*yield*/, system.getSystemAnalytics(dateRange)];
                    case 1:
                        analytics = _a.sent();
                        expect(analytics.trends).toBeDefined();
                        expect(analytics.trends.conflictReduction).toBeDefined();
                        expect(analytics.trends.resolutionEfficiency).toBeDefined();
                        expect(analytics.trends.resourceUtilization).toBeDefined();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('updateConfiguration', function () {
        it('should update system configuration', function () {
            var newConfig = __assign(__assign({}, mockConfig), { automation: __assign(__assign({}, mockConfig.automation), { autoResolveConflicts: true }) });
            system.updateConfiguration(newConfig);
            // Configuration should be updated (no direct way to test, but method should not throw)
        });
        it('should validate new configuration', function () {
            var invalidConfig = __assign(__assign({}, mockConfig), { detection: __assign(__assign({}, mockConfig.detection), { severityThresholds: {
                        low: 1.5,
                        medium: 0.6,
                        high: 0.3
                    } }) });
            expect(function () { return system.updateConfiguration(invalidConfig); }).toThrow();
        });
        it('should update subsystem configurations', function () {
            var newConfig = __assign(__assign({}, mockConfig), { detection: __assign(__assign({}, mockConfig.detection), { cacheEnabled: false }), resolution: __assign(__assign({}, mockConfig.resolution), { autoApplyThreshold: 0.95 }), optimization: __assign(__assign({}, mockConfig.optimization), { autoApplyOptimizations: true }) });
            system.updateConfiguration(newConfig);
            // All subsystems should be updated
        });
    });
    describe('performHealthCheck', function () {
        it('should perform comprehensive health check', function () { return __awaiter(void 0, void 0, void 0, function () {
            var healthCheck;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockSupabase.from.mockReturnValue({
                            select: jest.fn(function () { return ({
                                limit: jest.fn(function () { return Promise.resolve({
                                    data: [{ id: 'test' }],
                                    error: null
                                }); })
                            }); })
                        });
                        return [4 /*yield*/, system.performHealthCheck()];
                    case 1:
                        healthCheck = _a.sent();
                        expect(healthCheck).toBeDefined();
                        expect(healthCheck.overall).toBeDefined();
                        expect(healthCheck.subsystems).toBeDefined();
                        expect(healthCheck.subsystems.detector).toBeDefined();
                        expect(healthCheck.subsystems.resolutionEngine).toBeDefined();
                        expect(healthCheck.subsystems.optimizer).toBeDefined();
                        expect(healthCheck.database).toBeDefined();
                        expect(healthCheck.performance).toBeDefined();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should detect database connectivity issues', function () { return __awaiter(void 0, void 0, void 0, function () {
            var healthCheck;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockSupabase.from.mockReturnValue({
                            select: jest.fn(function () { return ({
                                limit: jest.fn(function () { return Promise.reject(new Error('Connection failed')); })
                            }); })
                        });
                        return [4 /*yield*/, system.performHealthCheck()];
                    case 1:
                        healthCheck = _a.sent();
                        expect(healthCheck.overall).toBe('unhealthy');
                        expect(healthCheck.database.status).toBe('error');
                        expect(healthCheck.database.error).toContain('Connection failed');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should measure performance metrics', function () { return __awaiter(void 0, void 0, void 0, function () {
            var startTime, healthCheck, endTime;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockSupabase.from.mockReturnValue({
                            select: jest.fn(function () { return ({
                                limit: jest.fn(function () { return Promise.resolve({
                                    data: [{ id: 'test' }],
                                    error: null
                                }); })
                            }); })
                        });
                        startTime = Date.now();
                        return [4 /*yield*/, system.performHealthCheck()];
                    case 1:
                        healthCheck = _a.sent();
                        endTime = Date.now();
                        expect(healthCheck.performance).toBeDefined();
                        expect(healthCheck.performance.responseTime).toBeLessThan(endTime - startTime + 100);
                        expect(healthCheck.performance.memoryUsage).toBeDefined();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Error Handling and Edge Cases', function () {
        it('should handle invalid appointment data', function () { return __awaiter(void 0, void 0, void 0, function () {
            var invalidAppointment;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        invalidAppointment = {
                            id: 'invalid-appointment',
                            start_time: 'invalid-date',
                            end_time: '2024-01-15T11:00:00Z',
                            staff_id: 'staff-1',
                            room_id: 'room-1',
                            client_id: 'client-1',
                            service_id: 'service-1',
                            status: 'scheduled'
                        };
                        return [4 /*yield*/, expect(system.detectAndResolveConflicts(invalidAppointment))
                                .rejects.toThrow()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle database connection failures', function () { return __awaiter(void 0, void 0, void 0, function () {
            var appointment;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        appointment = {
                            id: 'appointment-1',
                            start_time: '2024-01-15T10:00:00Z',
                            end_time: '2024-01-15T11:00:00Z',
                            staff_id: 'staff-1',
                            room_id: 'room-1',
                            client_id: 'client-1',
                            service_id: 'service-1',
                            status: 'scheduled'
                        };
                        mockSupabase.from.mockReturnValue({
                            select: jest.fn(function () { return ({
                                gte: jest.fn(function () { return ({
                                    lte: jest.fn(function () { return ({
                                        eq: jest.fn(function () { return ({
                                            neq: jest.fn(function () { return Promise.reject(new Error('Database error')); })
                                        }); })
                                    }); })
                                }); })
                            }); })
                        });
                        return [4 /*yield*/, expect(system.detectAndResolveConflicts(appointment))
                                .rejects.toThrow('Database error')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle empty date ranges gracefully', function () { return __awaiter(void 0, void 0, void 0, function () {
            var emptyDateRange;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        emptyDateRange = {
                            startDate: new Date('2024-01-15T00:00:00Z'),
                            endDate: new Date('2024-01-14T23:59:59Z')
                        };
                        return [4 /*yield*/, expect(system.optimizeResourceAllocation(emptyDateRange))
                                .rejects.toThrow()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle network timeouts', function () { return __awaiter(void 0, void 0, void 0, function () {
            var appointment;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        appointment = {
                            id: 'appointment-1',
                            start_time: '2024-01-15T10:00:00Z',
                            end_time: '2024-01-15T11:00:00Z',
                            staff_id: 'staff-1',
                            room_id: 'room-1',
                            client_id: 'client-1',
                            service_id: 'service-1',
                            status: 'scheduled'
                        };
                        mockSupabase.from.mockReturnValue({
                            select: jest.fn(function () { return ({
                                gte: jest.fn(function () { return ({
                                    lte: jest.fn(function () { return ({
                                        eq: jest.fn(function () { return ({
                                            neq: jest.fn(function () { return new Promise(function (_, reject) {
                                                setTimeout(function () { return reject(new Error('Timeout')); }, 100);
                                            }); })
                                        }); })
                                    }); })
                                }); })
                            }); })
                        });
                        return [4 /*yield*/, expect(system.detectAndResolveConflicts(appointment))
                                .rejects.toThrow('Timeout')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Performance and Scalability', function () {
        it('should handle large numbers of appointments efficiently', function () { return __awaiter(void 0, void 0, void 0, function () {
            var appointment, largeDataset, startTime, result, endTime;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        appointment = {
                            id: 'appointment-1',
                            start_time: '2024-01-15T10:00:00Z',
                            end_time: '2024-01-15T11:00:00Z',
                            staff_id: 'staff-1',
                            room_id: 'room-1',
                            client_id: 'client-1',
                            service_id: 'service-1',
                            status: 'scheduled'
                        };
                        largeDataset = Array.from({ length: 500 }, function (_, i) { return ({
                            id: "appointment-".concat(i),
                            start_time: '2024-01-15T10:30:00Z',
                            end_time: '2024-01-15T11:30:00Z',
                            staff_id: "staff-".concat(i % 10),
                            room_id: "room-".concat(i % 5),
                            client_id: "client-".concat(i),
                            service_id: "service-".concat(i),
                            status: 'scheduled'
                        }); });
                        mockSupabase.from.mockReturnValue({
                            select: jest.fn(function () { return ({
                                gte: jest.fn(function () { return ({
                                    lte: jest.fn(function () { return ({
                                        eq: jest.fn(function () { return ({
                                            neq: jest.fn(function () { return Promise.resolve({
                                                data: largeDataset,
                                                error: null
                                            }); })
                                        }); })
                                    }); })
                                }); })
                            }); })
                        });
                        startTime = Date.now();
                        return [4 /*yield*/, system.detectAndResolveConflicts(appointment)];
                    case 1:
                        result = _a.sent();
                        endTime = Date.now();
                        expect(endTime - startTime).toBeLessThan(10000); // Should complete within 10 seconds
                        expect(result).toBeDefined();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should cache results for improved performance', function () { return __awaiter(void 0, void 0, void 0, function () {
            var appointment, startTime, endTime;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        appointment = {
                            id: 'appointment-1',
                            start_time: '2024-01-15T10:00:00Z',
                            end_time: '2024-01-15T11:00:00Z',
                            staff_id: 'staff-1',
                            room_id: 'room-1',
                            client_id: 'client-1',
                            service_id: 'service-1',
                            status: 'scheduled'
                        };
                        mockSupabase.from.mockReturnValue({
                            select: jest.fn(function () { return ({
                                gte: jest.fn(function () { return ({
                                    lte: jest.fn(function () { return ({
                                        eq: jest.fn(function () { return ({
                                            neq: jest.fn(function () { return Promise.resolve({
                                                data: [],
                                                error: null
                                            }); })
                                        }); })
                                    }); })
                                }); })
                            }); })
                        });
                        // First call
                        return [4 /*yield*/, system.detectAndResolveConflicts(appointment)];
                    case 1:
                        // First call
                        _a.sent();
                        startTime = Date.now();
                        return [4 /*yield*/, system.detectAndResolveConflicts(appointment)];
                    case 2:
                        _a.sent();
                        endTime = Date.now();
                        expect(endTime - startTime).toBeLessThan(100); // Should be very fast due to caching
                        return [2 /*return*/];
                }
            });
        }); });
    });
});

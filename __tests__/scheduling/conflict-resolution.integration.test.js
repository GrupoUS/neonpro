"use strict";
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
// Mock Supabase client
var mockSupabaseClient = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn(),
    data: null,
    error: null
};
// Mock AuditLogger
var mockAuditLogger = {
    logConflictDetection: jest.fn(),
    logSchedulingAction: jest.fn(),
    logSystemEvent: jest.fn()
};
// Mock createClient to return our mock
jest.mock('@supabase/supabase-js', function () { return ({
    createClient: jest.fn(function () { return mockSupabaseClient; })
}); });
// Import services after mocking
var conflict_resolution_1 = require("../../lib/scheduling/conflict-resolution");
describe('Conflict Resolution System Integration Tests', function () {
    var conflictService;
    var waitlistService;
    beforeEach(function () {
        jest.clearAllMocks();
        conflictService = new conflict_resolution_1.ConflictDetectionService();
        waitlistService = new conflict_resolution_1.WaitlistService();
        // Default successful responses
        mockSupabaseClient.single.mockResolvedValue({
            data: { count: 0 },
            error: null
        });
    });
    describe('ConflictDetectionService', function () {
        describe('detectConflicts', function () {
            test('should detect appointment conflicts successfully', function () { return __awaiter(void 0, void 0, void 0, function () {
                var appointmentData, result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            appointmentData = {
                                provider_id: 'prov-123',
                                start_time: '2024-01-15T10:00:00Z',
                                end_time: '2024-01-15T11:00:00Z',
                                service_type: 'consultation'
                            };
                            mockSupabaseClient.single.mockResolvedValue({
                                data: { count: 2 },
                                error: null
                            });
                            return [4 /*yield*/, conflictService.detectConflicts(appointmentData)];
                        case 1:
                            result = _a.sent();
                            expect(result).toEqual({
                                hasConflicts: true,
                                conflictCount: 2,
                                severity: 'medium'
                            });
                            expect(mockSupabaseClient.from).toHaveBeenCalledWith('appointments');
                            return [2 /*return*/];
                    }
                });
            }); });
            test('should return no conflicts when none exist', function () { return __awaiter(void 0, void 0, void 0, function () {
                var appointmentData, result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            appointmentData = {
                                provider_id: 'prov-123',
                                start_time: '2024-01-15T10:00:00Z',
                                end_time: '2024-01-15T11:00:00Z',
                                service_type: 'consultation'
                            };
                            mockSupabaseClient.single.mockResolvedValue({
                                data: { count: 0 },
                                error: null
                            });
                            return [4 /*yield*/, conflictService.detectConflicts(appointmentData)];
                        case 1:
                            result = _a.sent();
                            expect(result).toEqual({
                                hasConflicts: false,
                                conflictCount: 0,
                                severity: 'none'
                            });
                            return [2 /*return*/];
                    }
                });
            }); });
            test('should handle database errors gracefully', function () { return __awaiter(void 0, void 0, void 0, function () {
                var appointmentData, mockError;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            appointmentData = {
                                provider_id: 'prov-123',
                                start_time: '2024-01-15T10:00:00Z',
                                end_time: '2024-01-15T11:00:00Z',
                                service_type: 'consultation'
                            };
                            mockError = new Error('DB error');
                            mockSupabaseClient.single.mockRejectedValue(mockError);
                            return [4 /*yield*/, expect(conflictService.detectConflicts(appointmentData))
                                    .rejects.toThrow('Failed to detect conflicts')];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
        });
        describe('analyzeConflictSeverity', function () {
            test('should correctly analyze conflict severity', function () { return __awaiter(void 0, void 0, void 0, function () {
                var conflictData, result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            conflictData = {
                                conflictCount: 3,
                                affectedProviders: ['prov-1', 'prov-2'],
                                timeOverlap: 30
                            };
                            return [4 /*yield*/, conflictService.analyzeConflictSeverity(conflictData)];
                        case 1:
                            result = _a.sent();
                            expect(result).toEqual({
                                severity: 'high',
                                impact: 'multiple_providers',
                                recommendation: 'immediate_resolution'
                            });
                            return [2 /*return*/];
                    }
                });
            }); });
        });
        describe('suggestResolutions', function () {
            test('should suggest appropriate resolutions', function () { return __awaiter(void 0, void 0, void 0, function () {
                var conflictContext, result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            conflictContext = {
                                conflictType: 'time_overlap',
                                severity: 'medium',
                                involvedAppointments: ['apt-1', 'apt-2']
                            };
                            return [4 /*yield*/, conflictService.suggestResolutions(conflictContext)];
                        case 1:
                            result = _a.sent();
                            expect(result).toHaveProperty('suggestions');
                            expect(Array.isArray(result.suggestions)).toBe(true);
                            expect(result.suggestions.length).toBeGreaterThan(0);
                            return [2 /*return*/];
                    }
                });
            }); });
        });
    });
    describe('WaitlistService', function () {
        describe('addToWaitlist', function () {
            test('should add patient to waitlist successfully', function () { return __awaiter(void 0, void 0, void 0, function () {
                var waitlistData, result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            waitlistData = {
                                patient_id: 'pat-123',
                                preferred_provider: 'prov-456',
                                service_type: 'consultation',
                                priority: 'normal'
                            };
                            mockSupabaseClient.single.mockResolvedValue({
                                data: { id: 'wait-789' },
                                error: null
                            });
                            return [4 /*yield*/, waitlistService.addToWaitlist(waitlistData)];
                        case 1:
                            result = _a.sent();
                            expect(result).toEqual({
                                success: true,
                                waitlistId: 'wait-789',
                                position: 5
                            });
                            expect(mockSupabaseClient.from).toHaveBeenCalledWith('waitlist');
                            return [2 /*return*/];
                    }
                });
            }); });
            test('should handle duplicate waitlist entries', function () { return __awaiter(void 0, void 0, void 0, function () {
                var waitlistData, mockError;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            waitlistData = {
                                patient_id: 'pat-123',
                                preferred_provider: 'prov-456',
                                service_type: 'consultation',
                                priority: 'normal'
                            };
                            mockError = new Error('Duplicate entry');
                            mockSupabaseClient.single.mockRejectedValue(mockError);
                            return [4 /*yield*/, expect(waitlistService.addToWaitlist(waitlistData))
                                    .rejects.toThrow('Failed to add to waitlist')];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
        });
        describe('processWaitlist', function () {
            test('should process waitlist successfully', function () { return __awaiter(void 0, void 0, void 0, function () {
                var criteria, result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            criteria = {
                                provider_id: 'prov-123',
                                available_slots: ['2024-01-15T10:00:00Z', '2024-01-15T14:00:00Z']
                            };
                            mockSupabaseClient.single.mockResolvedValue({
                                data: [
                                    { id: 'wait-1', patient_id: 'pat-1', priority: 'high' },
                                    { id: 'wait-2', patient_id: 'pat-2', priority: 'normal' }
                                ],
                                error: null
                            });
                            return [4 /*yield*/, waitlistService.processWaitlist(criteria)];
                        case 1:
                            result = _a.sent();
                            expect(result).toEqual({
                                processed: 2,
                                matched: 2
                            });
                            return [2 /*return*/];
                    }
                });
            }); });
        });
        describe('getWaitlistPosition', function () {
            test('should return correct waitlist position', function () { return __awaiter(void 0, void 0, void 0, function () {
                var patientId, result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            patientId = 'pat-123';
                            // Mock the full chain: from().select().eq().single()
                            mockSupabaseClient.from.mockReturnValueOnce({
                                select: jest.fn().mockReturnValueOnce({
                                    eq: jest.fn().mockReturnValueOnce({
                                        single: jest.fn().mockResolvedValueOnce({
                                            data: {
                                                id: 'wait-1',
                                                patient_id: 'pat-123',
                                                created_at: '2024-01-15T10:30:00Z'
                                            },
                                            error: null
                                        })
                                    })
                                })
                            });
                            return [4 /*yield*/, waitlistService.getWaitlistPosition(patientId)];
                        case 1:
                            result = _a.sent();
                            expect(result).toEqual({
                                position: 3,
                                estimatedWait: '2 hours'
                            });
                            return [2 /*return*/];
                    }
                });
            }); });
            test('should handle patient not on waitlist', function () { return __awaiter(void 0, void 0, void 0, function () {
                var patientId, result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            patientId = 'pat-999';
                            // Mock the full chain: from().select().eq().single() - returning null data
                            mockSupabaseClient.from.mockReturnValueOnce({
                                select: jest.fn().mockReturnValueOnce({
                                    eq: jest.fn().mockReturnValueOnce({
                                        single: jest.fn().mockResolvedValueOnce({
                                            data: null,
                                            error: null
                                        })
                                    })
                                })
                            });
                            return [4 /*yield*/, waitlistService.getWaitlistPosition(patientId)];
                        case 1:
                            result = _a.sent();
                            expect(result).toEqual({
                                position: null,
                                estimatedWait: null
                            });
                            return [2 /*return*/];
                    }
                });
            }); });
        });
    });
    describe('Integration Scenarios', function () {
        test('should handle conflict detection and waitlist integration', function () { return __awaiter(void 0, void 0, void 0, function () {
            var appointmentData, conflicts, waitlistResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        appointmentData = {
                            provider_id: 'prov-123',
                            start_time: '2024-01-15T10:00:00Z',
                            end_time: '2024-01-15T11:00:00Z',
                            service_type: 'consultation'
                        };
                        // Mock conflict detection
                        mockSupabaseClient.single.mockResolvedValueOnce({
                            data: { count: 1 },
                            error: null
                        });
                        return [4 /*yield*/, conflictService.detectConflicts(appointmentData)];
                    case 1:
                        conflicts = _a.sent();
                        expect(conflicts.hasConflicts).toBe(true);
                        // Mock waitlist addition
                        mockSupabaseClient.single.mockResolvedValueOnce({
                            data: { id: 'wait-new' },
                            error: null
                        });
                        return [4 /*yield*/, waitlistService.addToWaitlist({
                                patient_id: 'pat-123',
                                preferred_provider: appointmentData.provider_id,
                                service_type: appointmentData.service_type,
                                priority: 'normal'
                            })];
                    case 2:
                        waitlistResult = _a.sent();
                        expect(waitlistResult.success).toBe(true);
                        expect(waitlistResult.position).toBe(5);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});

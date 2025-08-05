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
var server_1 = require("next/server");
var route_1 = require("@/app/api/scheduling/confirmations/route");
// Mock dependencies
globals_1.jest.mock('@/app/utils/supabase/server');
globals_1.jest.mock('@/lib/communication/scheduling-templates');
globals_1.jest.mock('@/lib/communication/scheduling-workflow');
globals_1.jest.mock('@/lib/communication/communication-service');
globals_1.jest.mock('@/lib/communication/no-show-predictor');
var mockSupabase = {
    auth: {
        getUser: globals_1.jest.fn()
    },
    from: globals_1.jest.fn(function () { return ({
        select: globals_1.jest.fn(function () { return ({
            eq: globals_1.jest.fn(function () { return ({
                single: globals_1.jest.fn(),
                neq: globals_1.jest.fn(function () { return ({
                    single: globals_1.jest.fn()
                }); }),
                order: globals_1.jest.fn()
            }); }),
            insert: globals_1.jest.fn(function () { return ({
                select: globals_1.jest.fn(function () { return ({
                    single: globals_1.jest.fn()
                }); })
            }); }),
            update: globals_1.jest.fn(function () { return ({
                eq: globals_1.jest.fn(),
                select: globals_1.jest.fn()
            }); }),
            gte: globals_1.jest.fn(function () { return ({
                lte: globals_1.jest.fn(function () { return ({
                    order: globals_1.jest.fn()
                }); })
            }); })
        }); })
    }); })
};
var mockCreateClient = globals_1.jest.fn(function () { return Promise.resolve(mockSupabase); });
(0, globals_1.beforeEach)(function () {
    globals_1.jest.clearAllMocks();
    require('@/app/utils/supabase/server').createClient = mockCreateClient;
});
(0, globals_1.describe)('/api/scheduling/confirmations', function () {
    var mockUser = {
        id: 'user-123',
        email: 'test@example.com'
    };
    var mockAppointment = {
        id: 'appointment-123',
        patient_id: 'patient-123',
        clinic_id: 'clinic-123',
        date: '2024-01-15T10:00:00Z',
        status: 'scheduled',
        patients: {
            id: 'patient-123',
            name: 'João Silva',
            phone: '+5511999999999',
            email: 'joao@example.com'
        },
        professionals: {
            id: 'prof-123',
            name: 'Dr. Maria Santos'
        },
        services: {
            id: 'service-123',
            name: 'Consulta Dermatológica',
            category: 'dermatology'
        },
        clinics: {
            id: 'clinic-123',
            name: 'Clínica Beleza',
            phone: '+5511888888888'
        }
    };
    var mockConfirmation = {
        id: 'confirmation-123',
        appointment_id: 'appointment-123',
        patient_id: 'patient-123',
        clinic_id: 'clinic-123',
        confirmation_token: 'token-123',
        status: 'pending',
        send_at: '2024-01-14T09:00:00Z',
        expires_at: '2024-01-15T09:00:00Z',
        timeout_hours: 24,
        channels: ['whatsapp'],
        appointments: mockAppointment,
        patients: mockAppointment.patients,
        clinics: mockAppointment.clinics
    };
    (0, globals_1.describe)('POST /api/scheduling/confirmations', function () {
        (0, globals_1.it)('should create confirmation request using workflow by default', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockWorkflows, mockWorkflowModule, request, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Setup mocks
                        mockSupabase.auth.getUser.mockResolvedValue({
                            data: { user: mockUser },
                            error: null
                        });
                        mockSupabase.from.mockImplementation(function (table) {
                            if (table === 'appointments') {
                                return {
                                    select: globals_1.jest.fn().mockReturnValue({
                                        eq: globals_1.jest.fn().mockReturnValue({
                                            single: globals_1.jest.fn().mockResolvedValue({
                                                data: mockAppointment,
                                                error: null
                                            })
                                        })
                                    })
                                };
                            }
                            else if (table === 'appointment_confirmations') {
                                return {
                                    select: globals_1.jest.fn().mockReturnValue({
                                        eq: globals_1.jest.fn().mockReturnValue({
                                            neq: globals_1.jest.fn().mockReturnValue({
                                                single: globals_1.jest.fn().mockResolvedValue({
                                                    data: null,
                                                    error: null
                                                })
                                            })
                                        })
                                    })
                                };
                            }
                        });
                        mockWorkflows = [
                            {
                                id: 'workflow-123',
                                workflowType: 'confirmation',
                                scheduledAt: new Date('2024-01-14T09:00:00Z'),
                                status: 'scheduled',
                                metadata: { confirmationToken: 'token-123' },
                                steps: [
                                    { id: 'step-1', type: 'predict_no_show' },
                                    { id: 'step-2', type: 'send_message' },
                                    { id: 'step-3', type: 'wait_response' }
                                ]
                            }
                        ];
                        mockWorkflowModule = require('@/lib/communication/scheduling-workflow');
                        mockWorkflowModule.schedulingCommunicationWorkflow = {
                            initializeWorkflows: globals_1.jest.fn().mockResolvedValue(mockWorkflows)
                        };
                        request = new server_1.NextRequest('http://localhost:3000/api/scheduling/confirmations', {
                            method: 'POST',
                            body: JSON.stringify({
                                appointmentId: 'appointment-123',
                                sendTime: '09:00',
                                timeoutHours: 24,
                                channels: ['whatsapp'],
                                useWorkflow: true,
                                useNoShowPrediction: true
                            })
                        });
                        return [4 /*yield*/, (0, route_1.POST)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        (0, globals_1.expect)(response.status).toBe(200);
                        (0, globals_1.expect)(data.success).toBe(true);
                        (0, globals_1.expect)(data.method).toBe('workflow');
                        (0, globals_1.expect)(data.workflowId).toBe('workflow-123');
                        (0, globals_1.expect)(data.confirmationToken).toBe('token-123');
                        (0, globals_1.expect)(data.steps).toBe(3);
                        (0, globals_1.expect)(mockWorkflowModule.schedulingCommunicationWorkflow.initializeWorkflows).toHaveBeenCalledWith('appointment-123', globals_1.expect.objectContaining({
                            confirmationSettings: globals_1.expect.objectContaining({
                                enableConfirmationRequests: true,
                                sendTime: '09:00',
                                timeoutHours: 24
                            }),
                            noShowPrevention: globals_1.expect.objectContaining({
                                enabled: true,
                                probabilityThreshold: 0.6
                            })
                        }));
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.it)('should create legacy confirmation when workflow disabled', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockPredictor, mockPredictorModule, request, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Setup mocks
                        mockSupabase.auth.getUser.mockResolvedValue({
                            data: { user: mockUser },
                            error: null
                        });
                        mockSupabase.from.mockImplementation(function (table) {
                            if (table === 'appointments') {
                                return {
                                    select: globals_1.jest.fn().mockReturnValue({
                                        eq: globals_1.jest.fn().mockReturnValue({
                                            single: globals_1.jest.fn().mockResolvedValue({
                                                data: mockAppointment,
                                                error: null
                                            })
                                        })
                                    })
                                };
                            }
                            else if (table === 'appointment_confirmations') {
                                return {
                                    select: globals_1.jest.fn().mockReturnValue({
                                        eq: globals_1.jest.fn().mockReturnValue({
                                            neq: globals_1.jest.fn().mockReturnValue({
                                                single: globals_1.jest.fn().mockResolvedValue({
                                                    data: null,
                                                    error: null
                                                })
                                            })
                                        })
                                    }),
                                    insert: globals_1.jest.fn().mockReturnValue({
                                        select: globals_1.jest.fn().mockReturnValue({
                                            single: globals_1.jest.fn().mockResolvedValue({
                                                data: mockConfirmation,
                                                error: null
                                            })
                                        })
                                    })
                                };
                            }
                        });
                        mockPredictor = {
                            predict: globals_1.jest.fn().mockResolvedValue({
                                probability: 0.3,
                                factors: ['historical_attendance']
                            })
                        };
                        mockPredictorModule = require('@/lib/communication/no-show-predictor');
                        mockPredictorModule.NoShowPredictor = globals_1.jest.fn(function () { return mockPredictor; });
                        request = new server_1.NextRequest('http://localhost:3000/api/scheduling/confirmations', {
                            method: 'POST',
                            body: JSON.stringify({
                                appointmentId: 'appointment-123',
                                sendTime: '09:00',
                                timeoutHours: 24,
                                channels: ['whatsapp'],
                                useWorkflow: false,
                                useNoShowPrediction: true
                            })
                        });
                        return [4 /*yield*/, (0, route_1.POST)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        (0, globals_1.expect)(response.status).toBe(200);
                        (0, globals_1.expect)(data.success).toBe(true);
                        (0, globals_1.expect)(data.method).toBe('legacy');
                        (0, globals_1.expect)(data.confirmation).toEqual(mockConfirmation);
                        (0, globals_1.expect)(data.confirmationToken).toBeDefined();
                        (0, globals_1.expect)(mockPredictor.predict).toHaveBeenCalledWith('appointment-123');
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.it)('should prevent duplicate confirmation requests', function () { return __awaiter(void 0, void 0, void 0, function () {
            var request, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockSupabase.auth.getUser.mockResolvedValue({
                            data: { user: mockUser },
                            error: null
                        });
                        mockSupabase.from.mockImplementation(function (table) {
                            if (table === 'appointments') {
                                return {
                                    select: globals_1.jest.fn().mockReturnValue({
                                        eq: globals_1.jest.fn().mockReturnValue({
                                            single: globals_1.jest.fn().mockResolvedValue({
                                                data: mockAppointment,
                                                error: null
                                            })
                                        })
                                    })
                                };
                            }
                            else if (table === 'appointment_confirmations') {
                                return {
                                    select: globals_1.jest.fn().mockReturnValue({
                                        eq: globals_1.jest.fn().mockReturnValue({
                                            neq: globals_1.jest.fn().mockReturnValue({
                                                single: globals_1.jest.fn().mockResolvedValue({
                                                    data: mockConfirmation,
                                                    error: null
                                                })
                                            })
                                        })
                                    })
                                };
                            }
                        });
                        request = new server_1.NextRequest('http://localhost:3000/api/scheduling/confirmations', {
                            method: 'POST',
                            body: JSON.stringify({
                                appointmentId: 'appointment-123',
                                useWorkflow: false
                            })
                        });
                        return [4 /*yield*/, (0, route_1.POST)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        (0, globals_1.expect)(response.status).toBe(409);
                        (0, globals_1.expect)(data.error).toContain('already exists');
                        (0, globals_1.expect)(data.existing).toEqual(mockConfirmation);
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.it)('should handle appointment not found', function () { return __awaiter(void 0, void 0, void 0, function () {
            var request, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockSupabase.auth.getUser.mockResolvedValue({
                            data: { user: mockUser },
                            error: null
                        });
                        mockSupabase.from.mockReturnValue({
                            select: globals_1.jest.fn().mockReturnValue({
                                eq: globals_1.jest.fn().mockReturnValue({
                                    single: globals_1.jest.fn().mockResolvedValue({
                                        data: null,
                                        error: new Error('Not found')
                                    })
                                })
                            })
                        });
                        request = new server_1.NextRequest('http://localhost:3000/api/scheduling/confirmations', {
                            method: 'POST',
                            body: JSON.stringify({
                                appointmentId: 'appointment-123'
                            })
                        });
                        return [4 /*yield*/, (0, route_1.POST)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        (0, globals_1.expect)(response.status).toBe(404);
                        (0, globals_1.expect)(data.error).toBe('Appointment not found');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, globals_1.describe)('PUT /api/scheduling/confirmations', function () {
        (0, globals_1.it)('should handle patient confirmation response', function () { return __awaiter(void 0, void 0, void 0, function () {
            var confirmedConfirmation, mockCommunicationService, mockCommModule, request, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        confirmedConfirmation = __assign(__assign({}, mockConfirmation), { expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours from now
                         });
                        mockSupabase.from.mockImplementation(function (table) {
                            if (table === 'appointment_confirmations') {
                                return {
                                    select: globals_1.jest.fn().mockReturnValue({
                                        eq: globals_1.jest.fn().mockReturnValue({
                                            single: globals_1.jest.fn().mockResolvedValue({
                                                data: confirmedConfirmation,
                                                error: null
                                            })
                                        })
                                    }),
                                    update: globals_1.jest.fn().mockReturnValue({
                                        eq: globals_1.jest.fn().mockResolvedValue({
                                            data: null,
                                            error: null
                                        })
                                    })
                                };
                            }
                            else if (table === 'appointments') {
                                return {
                                    update: globals_1.jest.fn().mockReturnValue({
                                        eq: globals_1.jest.fn().mockResolvedValue({
                                            data: null,
                                            error: null
                                        })
                                    })
                                };
                            }
                        });
                        mockCommunicationService = {
                            sendMessage: globals_1.jest.fn().mockResolvedValue({
                                success: true,
                                messageId: 'msg-123'
                            })
                        };
                        mockCommModule = require('@/lib/communication/communication-service');
                        mockCommModule.CommunicationService = globals_1.jest.fn(function () { return mockCommunicationService; });
                        request = new server_1.NextRequest('http://localhost:3000/api/scheduling/confirmations', {
                            method: 'PUT',
                            body: JSON.stringify({
                                confirmationToken: 'token-123',
                                response: 'confirmed',
                                notes: 'Paciente confirmou presença'
                            })
                        });
                        return [4 /*yield*/, (0, route_1.PUT)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        (0, globals_1.expect)(response.status).toBe(200);
                        (0, globals_1.expect)(data.success).toBe(true);
                        (0, globals_1.expect)(data.response).toBe('confirmed');
                        (0, globals_1.expect)(data.appointmentId).toBe('appointment-123');
                        (0, globals_1.expect)(data.nextSteps).toEqual(globals_1.expect.arrayContaining([
                            'Sua consulta está confirmada'
                        ]));
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.it)('should handle reschedule requests', function () { return __awaiter(void 0, void 0, void 0, function () {
            var request, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockSupabase.from.mockImplementation(function (table) {
                            if (table === 'appointment_confirmations') {
                                return {
                                    select: globals_1.jest.fn().mockReturnValue({
                                        eq: globals_1.jest.fn().mockReturnValue({
                                            single: globals_1.jest.fn().mockResolvedValue({
                                                data: __assign(__assign({}, mockConfirmation), { expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() }),
                                                error: null
                                            })
                                        })
                                    }),
                                    update: globals_1.jest.fn().mockReturnValue({
                                        eq: globals_1.jest.fn().mockResolvedValue({
                                            data: null,
                                            error: null
                                        })
                                    })
                                };
                            }
                            else if (table === 'appointments') {
                                return {
                                    update: globals_1.jest.fn().mockReturnValue({
                                        eq: globals_1.jest.fn().mockResolvedValue({
                                            data: null,
                                            error: null
                                        })
                                    })
                                };
                            }
                        });
                        request = new server_1.NextRequest('http://localhost:3000/api/scheduling/confirmations', {
                            method: 'PUT',
                            body: JSON.stringify({
                                confirmationToken: 'token-123',
                                response: 'reschedule',
                                rescheduleDate: '2024-01-20',
                                rescheduleTime: '14:00',
                                notes: 'Preciso reagendar para outro dia'
                            })
                        });
                        return [4 /*yield*/, (0, route_1.PUT)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        (0, globals_1.expect)(response.status).toBe(200);
                        (0, globals_1.expect)(data.success).toBe(true);
                        (0, globals_1.expect)(data.response).toBe('reschedule');
                        (0, globals_1.expect)(data.nextSteps).toEqual(globals_1.expect.arrayContaining([
                            'Solicitação de reagendamento enviada'
                        ]));
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.it)('should reject expired confirmation tokens', function () { return __awaiter(void 0, void 0, void 0, function () {
            var expiredConfirmation, request, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        expiredConfirmation = __assign(__assign({}, mockConfirmation), { expires_at: new Date(Date.now() - 60 * 60 * 1000).toISOString() // 1 hour ago
                         });
                        mockSupabase.from.mockReturnValue({
                            select: globals_1.jest.fn().mockReturnValue({
                                eq: globals_1.jest.fn().mockReturnValue({
                                    single: globals_1.jest.fn().mockResolvedValue({
                                        data: expiredConfirmation,
                                        error: null
                                    })
                                })
                            })
                        });
                        request = new server_1.NextRequest('http://localhost:3000/api/scheduling/confirmations', {
                            method: 'PUT',
                            body: JSON.stringify({
                                confirmationToken: 'token-123',
                                response: 'confirmed'
                            })
                        });
                        return [4 /*yield*/, (0, route_1.PUT)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        (0, globals_1.expect)(response.status).toBe(410);
                        (0, globals_1.expect)(data.error).toContain('expired');
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.it)('should reject duplicate responses', function () { return __awaiter(void 0, void 0, void 0, function () {
            var respondedConfirmation, request, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        respondedConfirmation = __assign(__assign({}, mockConfirmation), { status: 'confirmed', expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() });
                        mockSupabase.from.mockReturnValue({
                            select: globals_1.jest.fn().mockReturnValue({
                                eq: globals_1.jest.fn().mockReturnValue({
                                    single: globals_1.jest.fn().mockResolvedValue({
                                        data: respondedConfirmation,
                                        error: null
                                    })
                                })
                            })
                        });
                        request = new server_1.NextRequest('http://localhost:3000/api/scheduling/confirmations', {
                            method: 'PUT',
                            body: JSON.stringify({
                                confirmationToken: 'token-123',
                                response: 'confirmed'
                            })
                        });
                        return [4 /*yield*/, (0, route_1.PUT)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        (0, globals_1.expect)(response.status).toBe(409);
                        (0, globals_1.expect)(data.error).toContain('Already responded');
                        (0, globals_1.expect)(data.currentResponse).toBe('confirmed');
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.it)('should handle invalid confirmation tokens', function () { return __awaiter(void 0, void 0, void 0, function () {
            var request, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockSupabase.from.mockReturnValue({
                            select: globals_1.jest.fn().mockReturnValue({
                                eq: globals_1.jest.fn().mockReturnValue({
                                    single: globals_1.jest.fn().mockResolvedValue({
                                        data: null,
                                        error: new Error('Not found')
                                    })
                                })
                            })
                        });
                        request = new server_1.NextRequest('http://localhost:3000/api/scheduling/confirmations', {
                            method: 'PUT',
                            body: JSON.stringify({
                                confirmationToken: 'invalid-token',
                                response: 'confirmed'
                            })
                        });
                        return [4 /*yield*/, (0, route_1.PUT)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        (0, globals_1.expect)(response.status).toBe(404);
                        (0, globals_1.expect)(data.error).toBe('Invalid confirmation token');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, globals_1.describe)('GET /api/scheduling/confirmations', function () {
        (0, globals_1.it)('should fetch confirmations with filters for authenticated users', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockConfirmations, request, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockSupabase.auth.getUser.mockResolvedValue({
                            data: { user: mockUser },
                            error: null
                        });
                        mockConfirmations = [
                            __assign(__assign({}, mockConfirmation), { id: 'confirmation-1', status: 'pending', expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() }),
                            __assign(__assign({}, mockConfirmation), { id: 'confirmation-2', status: 'confirmed', expires_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() })
                        ];
                        mockSupabase.from.mockReturnValue({
                            select: globals_1.jest.fn().mockReturnValue({
                                eq: globals_1.jest.fn().mockReturnValue({
                                    order: globals_1.jest.fn().mockResolvedValue({
                                        data: mockConfirmations,
                                        error: null
                                    })
                                })
                            })
                        });
                        request = new server_1.NextRequest('http://localhost:3000/api/scheduling/confirmations?clinicId=clinic-123&status=pending');
                        return [4 /*yield*/, (0, route_1.GET)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        (0, globals_1.expect)(response.status).toBe(200);
                        (0, globals_1.expect)(data.success).toBe(true);
                        (0, globals_1.expect)(data.confirmations).toHaveLength(2);
                        (0, globals_1.expect)(data.count).toBe(2);
                        (0, globals_1.expect)(data.summary).toEqual({
                            pending: 1,
                            confirmed: 1,
                            cancelled: 0,
                            reschedule: 0,
                            expired: 1
                        });
                        (0, globals_1.expect)(data.confirmations[0]).toHaveProperty('expired', false);
                        (0, globals_1.expect)(data.confirmations[1]).toHaveProperty('expired', true);
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.it)('should fetch single confirmation by token (public endpoint)', function () { return __awaiter(void 0, void 0, void 0, function () {
            var publicConfirmation, request, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        publicConfirmation = __assign(__assign({}, mockConfirmation), { expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() });
                        mockSupabase.from.mockReturnValue({
                            select: globals_1.jest.fn().mockReturnValue({
                                eq: globals_1.jest.fn().mockReturnValue({
                                    single: globals_1.jest.fn().mockResolvedValue({
                                        data: publicConfirmation,
                                        error: null
                                    })
                                })
                            })
                        });
                        request = new server_1.NextRequest('http://localhost:3000/api/scheduling/confirmations?token=token-123');
                        return [4 /*yield*/, (0, route_1.GET)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        (0, globals_1.expect)(response.status).toBe(200);
                        (0, globals_1.expect)(data.success).toBe(true);
                        (0, globals_1.expect)(data.confirmation.id).toBe('confirmation-123');
                        (0, globals_1.expect)(data.confirmation.expired).toBe(false);
                        (0, globals_1.expect)(data.confirmation.appointments).toBeDefined();
                        (0, globals_1.expect)(data.confirmation.patients).toBeDefined();
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.it)('should handle invalid tokens gracefully', function () { return __awaiter(void 0, void 0, void 0, function () {
            var request, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockSupabase.from.mockReturnValue({
                            select: globals_1.jest.fn().mockReturnValue({
                                eq: globals_1.jest.fn().mockReturnValue({
                                    single: globals_1.jest.fn().mockResolvedValue({
                                        data: null,
                                        error: new Error('Not found')
                                    })
                                })
                            })
                        });
                        request = new server_1.NextRequest('http://localhost:3000/api/scheduling/confirmations?token=invalid-token');
                        return [4 /*yield*/, (0, route_1.GET)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        (0, globals_1.expect)(response.status).toBe(404);
                        (0, globals_1.expect)(data.error).toBe('Invalid confirmation token');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, globals_1.describe)('DELETE /api/scheduling/confirmations', function () {
        (0, globals_1.it)('should expire confirmation by ID', function () { return __awaiter(void 0, void 0, void 0, function () {
            var request, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockSupabase.auth.getUser.mockResolvedValue({
                            data: { user: mockUser },
                            error: null
                        });
                        mockSupabase.from.mockReturnValue({
                            update: globals_1.jest.fn().mockReturnValue({
                                eq: globals_1.jest.fn().mockReturnValue({
                                    select: globals_1.jest.fn().mockResolvedValue({
                                        data: [mockConfirmation],
                                        error: null
                                    })
                                })
                            })
                        });
                        request = new server_1.NextRequest('http://localhost:3000/api/scheduling/confirmations?id=confirmation-123', {
                            method: 'DELETE'
                        });
                        return [4 /*yield*/, (0, route_1.DELETE)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        (0, globals_1.expect)(response.status).toBe(200);
                        (0, globals_1.expect)(data.success).toBe(true);
                        (0, globals_1.expect)(data.expired).toBe(1);
                        (0, globals_1.expect)(data.message).toContain('Expired 1 confirmation');
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.it)('should expire confirmations by appointment ID', function () { return __awaiter(void 0, void 0, void 0, function () {
            var request, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockSupabase.auth.getUser.mockResolvedValue({
                            data: { user: mockUser },
                            error: null
                        });
                        mockSupabase.from.mockReturnValue({
                            update: globals_1.jest.fn().mockReturnValue({
                                eq: globals_1.jest.fn().mockReturnValue({
                                    select: globals_1.jest.fn().mockResolvedValue({
                                        data: [mockConfirmation],
                                        error: null
                                    })
                                })
                            })
                        });
                        request = new server_1.NextRequest('http://localhost:3000/api/scheduling/confirmations?appointmentId=appointment-123', {
                            method: 'DELETE'
                        });
                        return [4 /*yield*/, (0, route_1.DELETE)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        (0, globals_1.expect)(response.status).toBe(200);
                        (0, globals_1.expect)(data.success).toBe(true);
                        (0, globals_1.expect)(data.expired).toBe(1);
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.it)('should require either confirmationId or appointmentId', function () { return __awaiter(void 0, void 0, void 0, function () {
            var request, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockSupabase.auth.getUser.mockResolvedValue({
                            data: { user: mockUser },
                            error: null
                        });
                        request = new server_1.NextRequest('http://localhost:3000/api/scheduling/confirmations', {
                            method: 'DELETE'
                        });
                        return [4 /*yield*/, (0, route_1.DELETE)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        (0, globals_1.expect)(response.status).toBe(400);
                        (0, globals_1.expect)(data.error).toContain('required');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, globals_1.describe)('Error handling', function () {
        (0, globals_1.it)('should handle authentication errors', function () { return __awaiter(void 0, void 0, void 0, function () {
            var request, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockSupabase.auth.getUser.mockResolvedValue({
                            data: { user: null },
                            error: new Error('Unauthorized')
                        });
                        request = new server_1.NextRequest('http://localhost:3000/api/scheduling/confirmations', {
                            method: 'POST',
                            body: JSON.stringify({
                                appointmentId: 'appointment-123'
                            })
                        });
                        return [4 /*yield*/, (0, route_1.POST)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        (0, globals_1.expect)(response.status).toBe(401);
                        (0, globals_1.expect)(data.error).toBe('Unauthorized');
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.it)('should validate request schemas', function () { return __awaiter(void 0, void 0, void 0, function () {
            var request, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockSupabase.auth.getUser.mockResolvedValue({
                            data: { user: mockUser },
                            error: null
                        });
                        request = new server_1.NextRequest('http://localhost:3000/api/scheduling/confirmations', {
                            method: 'POST',
                            body: JSON.stringify({
                                appointmentId: 'invalid-uuid',
                                sendTime: 'invalid-time',
                                timeoutHours: 'not-a-number'
                            })
                        });
                        return [4 /*yield*/, (0, route_1.POST)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        (0, globals_1.expect)(response.status).toBe(400);
                        (0, globals_1.expect)(data.error).toBe('Invalid request data');
                        (0, globals_1.expect)(data.details).toBeDefined();
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.it)('should handle database errors gracefully', function () { return __awaiter(void 0, void 0, void 0, function () {
            var request, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockSupabase.auth.getUser.mockResolvedValue({
                            data: { user: mockUser },
                            error: null
                        });
                        mockSupabase.from.mockReturnValue({
                            select: globals_1.jest.fn().mockReturnValue({
                                eq: globals_1.jest.fn().mockReturnValue({
                                    single: globals_1.jest.fn().mockRejectedValue(new Error('Database connection failed'))
                                })
                            })
                        });
                        request = new server_1.NextRequest('http://localhost:3000/api/scheduling/confirmations', {
                            method: 'POST',
                            body: JSON.stringify({
                                appointmentId: 'appointment-123'
                            })
                        });
                        return [4 /*yield*/, (0, route_1.POST)(request)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        (0, globals_1.expect)(response.status).toBe(500);
                        (0, globals_1.expect)(data.error).toBe('Internal server error');
                        return [2 /*return*/];
                }
            });
        }); });
    });
});

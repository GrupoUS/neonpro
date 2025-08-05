"use strict";
// Story 11.2: No-Show Prediction API Tests
// Test suite for main prediction API endpoints
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
var route_1 = require("@/app/api/no-show-prediction/route");
var server_1 = require("@/app/utils/supabase/server");
var server_2 = require("next/server");
// Mock Supabase client
jest.mock('@/app/utils/supabase/server', function () { return ({
    createClient: jest.fn(),
}); });
// Mock noShowPredictionEngine
jest.mock('@/app/lib/services/no-show-prediction', function () { return ({
    noShowPredictionEngine: {
        generatePrediction: jest.fn(),
        getHighRiskPatients: jest.fn(),
        calculateAccuracyMetrics: jest.fn(),
    },
}); });
describe('/api/no-show-prediction', function () {
    var mockSupabase;
    var mockRequest;
    beforeEach(function () {
        jest.clearAllMocks();
        mockSupabase = {
            auth: {
                getSession: jest.fn().mockResolvedValue({
                    data: {
                        session: {
                            user: { id: 'user-123' }
                        }
                    }
                }),
            },
            from: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            gte: jest.fn().mockReturnThis(),
            lte: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            range: jest.fn().mockReturnThis(),
        };
        server_1.createClient.mockResolvedValue(mockSupabase);
    });
    describe('GET /api/no-show-prediction', function () {
        it('should return predictions list successfully', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockPredictions, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockPredictions = [
                            {
                                id: 'prediction-1',
                                appointment_id: 'appointment-1',
                                patient_id: 'patient-1',
                                risk_score: 0.85,
                                confidence_score: 0.92,
                                prediction_date: '2024-02-15T10:00:00Z',
                                patient: { name: 'João Silva' },
                                appointment: { scheduled_at: '2024-02-15T14:00:00Z' }
                            }
                        ];
                        mockSupabase.select.mockResolvedValueOnce({
                            data: mockPredictions,
                            error: null
                        });
                        mockRequest = new server_2.NextRequest('http://localhost:3000/api/no-show-prediction?page=1&limit=10');
                        return [4 /*yield*/, (0, route_1.GET)(mockRequest)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        expect(response.status).toBe(200);
                        expect(data.predictions).toBeDefined();
                        expect(Array.isArray(data.predictions)).toBe(true);
                        expect(data.predictions.length).toBe(1);
                        expect(data.pagination).toBeDefined();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle unauthorized requests', function () { return __awaiter(void 0, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockSupabase.auth.getSession.mockResolvedValueOnce({
                            data: { session: null }
                        });
                        mockRequest = new server_2.NextRequest('http://localhost:3000/api/no-show-prediction');
                        return [4 /*yield*/, (0, route_1.GET)(mockRequest)];
                    case 1:
                        response = _a.sent();
                        expect(response.status).toBe(401);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should apply filters correctly', function () { return __awaiter(void 0, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockSupabase.select.mockResolvedValueOnce({
                            data: [],
                            error: null
                        });
                        mockRequest = new server_2.NextRequest('http://localhost:3000/api/no-show-prediction?clinic_id=clinic-123&min_risk=0.8');
                        return [4 /*yield*/, (0, route_1.GET)(mockRequest)];
                    case 1:
                        response = _a.sent();
                        expect(response.status).toBe(200);
                        expect(mockSupabase.eq).toHaveBeenCalledWith('clinic_id', 'clinic-123');
                        expect(mockSupabase.gte).toHaveBeenCalledWith('risk_score', 0.8);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('POST /api/no-show-prediction', function () {
        it('should create new prediction successfully', function () { return __awaiter(void 0, void 0, void 0, function () {
            var noShowPredictionEngine, mockPrediction, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        noShowPredictionEngine = require('@/app/lib/services/no-show-prediction').noShowPredictionEngine;
                        mockPrediction = {
                            id: 'prediction-123',
                            appointment_id: 'appointment-123',
                            patient_id: 'patient-123',
                            risk_score: 0.75,
                            confidence_score: 0.88,
                            prediction_date: '2024-02-15T10:00:00Z',
                            model_version: '1.0'
                        };
                        noShowPredictionEngine.generatePrediction.mockResolvedValueOnce(mockPrediction);
                        mockRequest = new server_2.NextRequest('http://localhost:3000/api/no-show-prediction', {
                            method: 'POST',
                            body: JSON.stringify({
                                appointment_id: 'appointment-123'
                            }),
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        });
                        return [4 /*yield*/, (0, route_1.POST)(mockRequest)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        expect(response.status).toBe(201);
                        expect(data.id).toBe('prediction-123');
                        expect(data.risk_score).toBe(0.75);
                        expect(noShowPredictionEngine.generatePrediction).toHaveBeenCalledWith('appointment-123');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should validate request body', function () { return __awaiter(void 0, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockRequest = new server_2.NextRequest('http://localhost:3000/api/no-show-prediction', {
                            method: 'POST',
                            body: JSON.stringify({
                            // Missing appointment_id
                            }),
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        });
                        return [4 /*yield*/, (0, route_1.POST)(mockRequest)];
                    case 1:
                        response = _a.sent();
                        expect(response.status).toBe(400);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle prediction generation errors', function () { return __awaiter(void 0, void 0, void 0, function () {
            var noShowPredictionEngine, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        noShowPredictionEngine = require('@/app/lib/services/no-show-prediction').noShowPredictionEngine;
                        noShowPredictionEngine.generatePrediction.mockRejectedValueOnce(new Error('Appointment not found'));
                        mockRequest = new server_2.NextRequest('http://localhost:3000/api/no-show-prediction', {
                            method: 'POST',
                            body: JSON.stringify({
                                appointment_id: 'invalid-appointment'
                            }),
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        });
                        return [4 /*yield*/, (0, route_1.POST)(mockRequest)];
                    case 1:
                        response = _a.sent();
                        expect(response.status).toBe(500);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});

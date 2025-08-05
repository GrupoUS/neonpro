"use strict";
// API Tests for Patient Insights Endpoints
// Story 3.2: Task 9 - API Integration Testing
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
var server_1 = require("next/server");
var route_1 = require("../../../../../../app/api/patients/[patientId]/insights/risk-assessment/route");
var route_2 = require("../../../../../../app/api/patients/[patientId]/insights/alerts/route");
var route_3 = require("../../../../../../app/api/patients/[patientId]/insights/treatments/route");
var route_4 = require("../../../../../../app/api/patients/[patientId]/insights/comprehensive/route");
// Mock Supabase
jest.mock('@supabase/auth-helpers-nextjs', function () { return ({
    createRouteHandlerClient: jest.fn(function () { return ({
        auth: {
            getSession: jest.fn(function () { return Promise.resolve({
                data: {
                    session: {
                        user: { id: 'user-123' }
                    }
                }
            }); })
        },
        from: jest.fn(function () { return ({
            select: jest.fn(function () { return ({
                eq: jest.fn(function () { return ({
                    single: jest.fn(function () { return Promise.resolve({
                        data: {
                            id: 'patient-123',
                            clinic_id: 'clinic-abc'
                        }
                    }); })
                }); })
            }); })
        }); })
    }); })
}); });
// Mock next/headers
jest.mock('next/headers', function () { return ({
    cookies: jest.fn()
}); });
// Mock the patient insights integration
jest.mock('@/lib/ai/patient-insights', function () {
    return jest.fn().mockImplementation(function () { return ({
        generateQuickRiskAssessment: jest.fn(function () { return Promise.resolve({
            patientId: 'patient-123',
            overallRiskScore: 0.45,
            confidence: 0.85,
            recommendations: ['Monitor blood pressure', 'Follow up in 2 weeks']
        }); }),
        generateComprehensiveInsights: jest.fn(function () { return Promise.resolve({
            patientId: 'patient-123',
            requestId: 'req-456',
            riskAssessment: {
                patientId: 'patient-123',
                overallRiskScore: 0.45,
                confidence: 0.85
            },
            alerts: {
                totalAlerts: 2,
                criticalAlerts: 0,
                warningAlerts: 1,
                infoAlerts: 1
            },
            recommendations: ['Follow treatment plan'],
            processingTime: 1500,
            generatedAt: new Date(),
            version: '1.0.0'
        }); }),
        generateTreatmentGuidance: jest.fn(function () { return Promise.resolve({
            patientId: 'patient-123',
            primaryRecommendations: [
                {
                    recommendation: 'Continue current medication',
                    confidence: 0.9,
                    priority: 'high'
                }
            ],
            confidence: 0.88
        }); }),
        monitorPatientAlerts: jest.fn(function () { return Promise.resolve({
            patientId: 'patient-123',
            totalAlerts: 3,
            criticalAlerts: 1,
            warningAlerts: 1,
            infoAlerts: 1,
            alerts: [
                {
                    id: 'alert-1',
                    severity: 'high',
                    title: 'High Risk Alert',
                    description: 'Patient shows high risk factors'
                }
            ],
            lastChecked: new Date(),
            nextCheckRecommended: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }); }),
        updatePatientOutcome: jest.fn(function () { return Promise.resolve([
            {
                insight: 'Treatment effectiveness improved',
                confidence: 0.85
            }
        ]); })
    }); });
});
describe('Patient Insights API Endpoints', function () {
    var mockParams = { patientId: 'patient-123' };
    beforeEach(function () {
        jest.clearAllMocks();
    });
    describe('Risk Assessment API', function () {
        describe('GET /api/patients/[patientId]/insights/risk-assessment', function () {
            it('should return risk assessment for authenticated user', function () { return __awaiter(void 0, void 0, void 0, function () {
                var request, response, data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            request = new server_1.NextRequest('http://localhost:3000/api/patients/patient-123/insights/risk-assessment');
                            return [4 /*yield*/, (0, route_1.GET)(request, { params: mockParams })];
                        case 1:
                            response = _a.sent();
                            return [4 /*yield*/, response.json()];
                        case 2:
                            data = _a.sent();
                            expect(response.status).toBe(200);
                            expect(data.success).toBe(true);
                            expect(data.data).toBeDefined();
                            expect(data.data.patientId).toBe('patient-123');
                            expect(data.data.overallRiskScore).toBeDefined();
                            return [2 /*return*/];
                    }
                });
            }); });
            it('should return 401 for unauthenticated user', function () { return __awaiter(void 0, void 0, void 0, function () {
                var createRouteHandlerClient, request, response, data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            createRouteHandlerClient = require('@supabase/auth-helpers-nextjs').createRouteHandlerClient;
                            createRouteHandlerClient.mockReturnValueOnce({
                                auth: {
                                    getSession: jest.fn(function () { return Promise.resolve({ data: { session: null } }); })
                                }
                            });
                            request = new server_1.NextRequest('http://localhost:3000/api/patients/patient-123/insights/risk-assessment');
                            return [4 /*yield*/, (0, route_1.GET)(request, { params: mockParams })];
                        case 1:
                            response = _a.sent();
                            return [4 /*yield*/, response.json()];
                        case 2:
                            data = _a.sent();
                            expect(response.status).toBe(401);
                            expect(data.error).toBe('Unauthorized');
                            return [2 /*return*/];
                    }
                });
            }); });
        });
        describe('POST /api/patients/[patientId]/insights/risk-assessment', function () {
            it('should update risk factors successfully', function () { return __awaiter(void 0, void 0, void 0, function () {
                var requestBody, request, response, data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            requestBody = {
                                riskFactors: {
                                    age: 45,
                                    medicalHistory: ['hypertension'],
                                    lifestyle: 'moderate'
                                },
                                customFactors: {
                                    familyHistory: 'positive'
                                }
                            };
                            request = new server_1.NextRequest('http://localhost:3000/api/patients/patient-123/insights/risk-assessment', {
                                method: 'POST',
                                body: JSON.stringify(requestBody)
                            });
                            return [4 /*yield*/, (0, route_1.POST)(request, { params: mockParams })];
                        case 1:
                            response = _a.sent();
                            return [4 /*yield*/, response.json()];
                        case 2:
                            data = _a.sent();
                            expect(response.status).toBe(200);
                            expect(data.success).toBe(true);
                            expect(data.data.assessment).toBeDefined();
                            return [2 /*return*/];
                    }
                });
            }); });
            it('should return 400 for missing risk factors', function () { return __awaiter(void 0, void 0, void 0, function () {
                var request, response, data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            request = new server_1.NextRequest('http://localhost:3000/api/patients/patient-123/insights/risk-assessment', {
                                method: 'POST',
                                body: JSON.stringify({})
                            });
                            return [4 /*yield*/, (0, route_1.POST)(request, { params: mockParams })];
                        case 1:
                            response = _a.sent();
                            return [4 /*yield*/, response.json()];
                        case 2:
                            data = _a.sent();
                            expect(response.status).toBe(400);
                            expect(data.error).toContain('Risk factors or custom factors required');
                            return [2 /*return*/];
                    }
                });
            }); });
        });
    });
    describe('Comprehensive Insights API', function () {
        describe('POST /api/patients/[patientId]/insights/comprehensive', function () {
            it('should generate comprehensive insights successfully', function () { return __awaiter(void 0, void 0, void 0, function () {
                var requestBody, request, response, data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            requestBody = {
                                requestedInsights: ['risk', 'treatment', 'behavior'],
                                treatmentContext: 'consultation',
                                includeAlerts: true,
                                includePredictions: true
                            };
                            request = new server_1.NextRequest('http://localhost:3000/api/patients/patient-123/insights/comprehensive', {
                                method: 'POST',
                                body: JSON.stringify(requestBody)
                            });
                            return [4 /*yield*/, (0, route_4.POST)(request, { params: mockParams })];
                        case 1:
                            response = _a.sent();
                            return [4 /*yield*/, response.json()];
                        case 2:
                            data = _a.sent();
                            expect(response.status).toBe(200);
                            expect(data.success).toBe(true);
                            expect(data.data).toBeDefined();
                            expect(data.data.patientId).toBe('patient-123');
                            expect(data.data.riskAssessment).toBeDefined();
                            expect(data.metadata.requestId).toBeDefined();
                            expect(data.metadata.processingTime).toBeDefined();
                            return [2 /*return*/];
                    }
                });
            }); });
            it('should handle default insight types', function () { return __awaiter(void 0, void 0, void 0, function () {
                var request, response, data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            request = new server_1.NextRequest('http://localhost:3000/api/patients/patient-123/insights/comprehensive', {
                                method: 'POST',
                                body: JSON.stringify({})
                            });
                            return [4 /*yield*/, (0, route_4.POST)(request, { params: mockParams })];
                        case 1:
                            response = _a.sent();
                            return [4 /*yield*/, response.json()];
                        case 2:
                            data = _a.sent();
                            expect(response.status).toBe(200);
                            expect(data.success).toBe(true);
                            return [2 /*return*/];
                    }
                });
            }); });
        });
        describe('GET /api/patients/[patientId]/insights/comprehensive', function () {
            it('should return recent insights with pagination', function () { return __awaiter(void 0, void 0, void 0, function () {
                var request, response, data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            request = new server_1.NextRequest('http://localhost:3000/api/patients/patient-123/insights/comprehensive?limit=5&offset=0');
                            return [4 /*yield*/, (0, route_4.GET)(request, { params: mockParams })];
                        case 1:
                            response = _a.sent();
                            return [4 /*yield*/, response.json()];
                        case 2:
                            data = _a.sent();
                            expect(response.status).toBe(200);
                            expect(data.success).toBe(true);
                            expect(data.metadata).toBeDefined();
                            expect(data.metadata.limit).toBe(5);
                            expect(data.metadata.offset).toBe(0);
                            return [2 /*return*/];
                    }
                });
            }); });
            it('should filter by date when since parameter is provided', function () { return __awaiter(void 0, void 0, void 0, function () {
                var since, request, response, data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
                            ;
                            request = new server_1.NextRequest("http://localhost:3000/api/patients/patient-123/insights/comprehensive?since=".concat(since));
                            return [4 /*yield*/, (0, route_4.GET)(request, { params: mockParams })];
                        case 1:
                            response = _a.sent();
                            return [4 /*yield*/, response.json()];
                        case 2:
                            data = _a.sent();
                            expect(response.status).toBe(200);
                            expect(data.success).toBe(true);
                            return [2 /*return*/];
                    }
                });
            }); });
        });
    });
    describe('Alerts API', function () {
        describe('GET /api/patients/[patientId]/insights/alerts', function () {
            it('should return patient alerts successfully', function () { return __awaiter(void 0, void 0, void 0, function () {
                var request, response, data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            request = new server_1.NextRequest('http://localhost:3000/api/patients/patient-123/insights/alerts');
                            return [4 /*yield*/, (0, route_2.GET)(request, { params: mockParams })];
                        case 1:
                            response = _a.sent();
                            return [4 /*yield*/, response.json()];
                        case 2:
                            data = _a.sent();
                            expect(response.status).toBe(200);
                            expect(data.success).toBe(true);
                            expect(data.data).toBeDefined();
                            expect(data.data.patientId).toBe('patient-123');
                            expect(data.data.totalAlerts).toBeDefined();
                            expect(Array.isArray(data.data.alerts)).toBe(true);
                            return [2 /*return*/];
                    }
                });
            }); });
            it('should filter alerts by severity', function () { return __awaiter(void 0, void 0, void 0, function () {
                var request, response, data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            request = new server_1.NextRequest('http://localhost:3000/api/patients/patient-123/insights/alerts?severity=high');
                            return [4 /*yield*/, (0, route_2.GET)(request, { params: mockParams })];
                        case 1:
                            response = _a.sent();
                            return [4 /*yield*/, response.json()];
                        case 2:
                            data = _a.sent();
                            expect(response.status).toBe(200);
                            expect(data.success).toBe(true);
                            return [2 /*return*/];
                    }
                });
            }); });
            it('should filter alerts by category', function () { return __awaiter(void 0, void 0, void 0, function () {
                var request, response, data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            request = new server_1.NextRequest('http://localhost:3000/api/patients/patient-123/insights/alerts?category=risk');
                            return [4 /*yield*/, (0, route_2.GET)(request, { params: mockParams })];
                        case 1:
                            response = _a.sent();
                            return [4 /*yield*/, response.json()];
                        case 2:
                            data = _a.sent();
                            expect(response.status).toBe(200);
                            expect(data.success).toBe(true);
                            return [2 /*return*/];
                    }
                });
            }); });
            it('should filter active alerts only', function () { return __awaiter(void 0, void 0, void 0, function () {
                var request, response, data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            request = new server_1.NextRequest('http://localhost:3000/api/patients/patient-123/insights/alerts?active=true');
                            return [4 /*yield*/, (0, route_2.GET)(request, { params: mockParams })];
                        case 1:
                            response = _a.sent();
                            return [4 /*yield*/, response.json()];
                        case 2:
                            data = _a.sent();
                            expect(response.status).toBe(200);
                            expect(data.success).toBe(true);
                            return [2 /*return*/];
                    }
                });
            }); });
        });
        describe('POST /api/patients/[patientId]/insights/alerts', function () {
            it('should acknowledge alert successfully', function () { return __awaiter(void 0, void 0, void 0, function () {
                var requestBody, request, response, data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            requestBody = {
                                alertId: 'alert-123',
                                action: 'acknowledge',
                                notes: 'Acknowledged by physician'
                            };
                            request = new server_1.NextRequest('http://localhost:3000/api/patients/patient-123/insights/alerts', {
                                method: 'POST',
                                body: JSON.stringify(requestBody)
                            });
                            return [4 /*yield*/, (0, route_2.POST)(request, { params: mockParams })];
                        case 1:
                            response = _a.sent();
                            return [4 /*yield*/, response.json()];
                        case 2:
                            data = _a.sent();
                            expect(response.status).toBe(200);
                            expect(data.success).toBe(true);
                            expect(data.message).toContain('acknowledged successfully');
                            return [2 /*return*/];
                    }
                });
            }); });
            it('should resolve alert successfully', function () { return __awaiter(void 0, void 0, void 0, function () {
                var requestBody, request, response, data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            requestBody = {
                                alertId: 'alert-123',
                                action: 'resolve',
                                notes: 'Issue resolved'
                            };
                            request = new server_1.NextRequest('http://localhost:3000/api/patients/patient-123/insights/alerts', {
                                method: 'POST',
                                body: JSON.stringify(requestBody)
                            });
                            return [4 /*yield*/, (0, route_2.POST)(request, { params: mockParams })];
                        case 1:
                            response = _a.sent();
                            return [4 /*yield*/, response.json()];
                        case 2:
                            data = _a.sent();
                            expect(response.status).toBe(200);
                            expect(data.success).toBe(true);
                            expect(data.message).toContain('resolved successfully');
                            return [2 /*return*/];
                    }
                });
            }); });
            it('should return 400 for invalid action', function () { return __awaiter(void 0, void 0, void 0, function () {
                var requestBody, request, response, data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            requestBody = {
                                alertId: 'alert-123',
                                action: 'invalid_action'
                            };
                            request = new server_1.NextRequest('http://localhost:3000/api/patients/patient-123/insights/alerts', {
                                method: 'POST',
                                body: JSON.stringify(requestBody)
                            });
                            return [4 /*yield*/, (0, route_2.POST)(request, { params: mockParams })];
                        case 1:
                            response = _a.sent();
                            return [4 /*yield*/, response.json()];
                        case 2:
                            data = _a.sent();
                            expect(response.status).toBe(400);
                            expect(data.error).toContain('Invalid request');
                            return [2 /*return*/];
                    }
                });
            }); });
        });
    });
    describe('Treatment Guidance API', function () {
        describe('GET /api/patients/[patientId]/insights/treatments', function () {
            it('should return treatment guidance successfully', function () { return __awaiter(void 0, void 0, void 0, function () {
                var request, response, data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            request = new server_1.NextRequest('http://localhost:3000/api/patients/patient-123/insights/treatments');
                            return [4 /*yield*/, (0, route_3.GET)(request, { params: mockParams })];
                        case 1:
                            response = _a.sent();
                            return [4 /*yield*/, response.json()];
                        case 2:
                            data = _a.sent();
                            expect(response.status).toBe(200);
                            expect(data.success).toBe(true);
                            expect(data.data).toBeDefined();
                            expect(data.data.patientId).toBe('patient-123');
                            expect(data.data.primaryRecommendations).toBeDefined();
                            return [2 /*return*/];
                    }
                });
            }); });
            it('should include treatment context when provided', function () { return __awaiter(void 0, void 0, void 0, function () {
                var request, response, data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            request = new server_1.NextRequest('http://localhost:3000/api/patients/patient-123/insights/treatments?context=follow-up');
                            return [4 /*yield*/, (0, route_3.GET)(request, { params: mockParams })];
                        case 1:
                            response = _a.sent();
                            return [4 /*yield*/, response.json()];
                        case 2:
                            data = _a.sent();
                            expect(response.status).toBe(200);
                            expect(data.success).toBe(true);
                            expect(data.data.context).toBeDefined();
                            return [2 /*return*/];
                    }
                });
            }); });
        });
        describe('POST /api/patients/[patientId]/insights/treatments', function () {
            it('should record treatment outcome successfully', function () { return __awaiter(void 0, void 0, void 0, function () {
                var requestBody, request, response, data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            requestBody = {
                                treatmentId: 'treatment-456',
                                outcome: 'completed',
                                effectiveness: 0.85,
                                patientSatisfaction: 0.9,
                                notes: 'Patient responded well to treatment'
                            };
                            request = new server_1.NextRequest('http://localhost:3000/api/patients/patient-123/insights/treatments', {
                                method: 'POST',
                                body: JSON.stringify(requestBody)
                            });
                            return [4 /*yield*/, (0, route_3.POST)(request, { params: mockParams })];
                        case 1:
                            response = _a.sent();
                            return [4 /*yield*/, response.json()];
                        case 2:
                            data = _a.sent();
                            expect(response.status).toBe(200);
                            expect(data.success).toBe(true);
                            expect(data.data.outcome).toBeDefined();
                            expect(data.data.learningInsights).toBeDefined();
                            return [2 /*return*/];
                    }
                });
            }); });
            it('should return 400 for missing required fields', function () { return __awaiter(void 0, void 0, void 0, function () {
                var requestBody, request, response, data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            requestBody = {
                                // Missing treatmentId and outcome
                                effectiveness: 0.85
                            };
                            request = new server_1.NextRequest('http://localhost:3000/api/patients/patient-123/insights/treatments', {
                                method: 'POST',
                                body: JSON.stringify(requestBody)
                            });
                            return [4 /*yield*/, (0, route_3.POST)(request, { params: mockParams })];
                        case 1:
                            response = _a.sent();
                            return [4 /*yield*/, response.json()];
                        case 2:
                            data = _a.sent();
                            expect(response.status).toBe(400);
                            expect(data.error).toContain('Treatment ID and outcome are required');
                            return [2 /*return*/];
                    }
                });
            }); });
        });
    });
    describe('Error Handling', function () {
        it('should handle patient not found', function () { return __awaiter(void 0, void 0, void 0, function () {
            var createRouteHandlerClient, request, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        createRouteHandlerClient = require('@supabase/auth-helpers-nextjs').createRouteHandlerClient;
                        createRouteHandlerClient.mockReturnValueOnce({
                            auth: {
                                getSession: jest.fn(function () { return Promise.resolve({
                                    data: { session: { user: { id: 'user-123' } } }
                                }); })
                            },
                            from: jest.fn(function () { return ({
                                select: jest.fn(function () { return ({
                                    eq: jest.fn(function () { return ({
                                        single: jest.fn(function () { return Promise.resolve({ data: null }); })
                                    }); })
                                }); })
                            }); })
                        });
                        request = new server_1.NextRequest('http://localhost:3000/api/patients/nonexistent/insights/risk-assessment');
                        return [4 /*yield*/, (0, route_1.GET)(request, { params: { patientId: 'nonexistent' } })];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        expect(response.status).toBe(404);
                        expect(data.error).toBe('Patient not found');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle access denied for different clinic', function () { return __awaiter(void 0, void 0, void 0, function () {
            var createRouteHandlerClient, request, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        createRouteHandlerClient = require('@supabase/auth-helpers-nextjs').createRouteHandlerClient;
                        createRouteHandlerClient.mockReturnValueOnce({
                            auth: {
                                getSession: jest.fn(function () { return Promise.resolve({
                                    data: { session: { user: { id: 'user-123' } } }
                                }); })
                            },
                            from: jest.fn(function (table) {
                                if (table === 'patients') {
                                    return {
                                        select: jest.fn(function () { return ({
                                            eq: jest.fn(function () { return ({
                                                single: jest.fn(function () { return Promise.resolve({
                                                    data: { id: 'patient-123', clinic_id: 'different-clinic' }
                                                }); })
                                            }); })
                                        }); })
                                    };
                                }
                                else if (table === 'profiles') {
                                    return {
                                        select: jest.fn(function () { return ({
                                            eq: jest.fn(function () { return ({
                                                single: jest.fn(function () { return Promise.resolve({
                                                    data: { clinic_id: 'original-clinic', role: 'doctor' }
                                                }); })
                                            }); })
                                        }); })
                                    };
                                }
                            })
                        });
                        request = new server_1.NextRequest('http://localhost:3000/api/patients/patient-123/insights/risk-assessment');
                        return [4 /*yield*/, (0, route_1.GET)(request, { params: mockParams })];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        expect(response.status).toBe(403);
                        expect(data.error).toBe('Access denied');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Performance and Quality', function () {
        it('should respond within reasonable time', function () { return __awaiter(void 0, void 0, void 0, function () {
            var start, request, duration;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        start = Date.now();
                        request = new server_1.NextRequest('http://localhost:3000/api/patients/patient-123/insights/risk-assessment');
                        return [4 /*yield*/, (0, route_1.GET)(request, { params: mockParams })];
                    case 1:
                        _a.sent();
                        duration = Date.now() - start;
                        expect(duration).toBeLessThan(5000); // 5 seconds max for API
                        return [2 /*return*/];
                }
            });
        }); }, 10000);
        it('should include proper audit logging', function () { return __awaiter(void 0, void 0, void 0, function () {
            var request, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = new server_1.NextRequest('http://localhost:3000/api/patients/patient-123/insights/risk-assessment');
                        return [4 /*yield*/, (0, route_1.GET)(request, { params: mockParams })];
                    case 1:
                        response = _a.sent();
                        expect(response.status).toBe(200);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});

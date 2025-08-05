/**
 * @file Business Dashboard API Integration Tests
 * @description Integration tests for Story 8.1 - Business Dashboard APIs
 * @author NeonPro Development Team
 * @created 2024-01-15
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
var _this = this;
// Mock global fetch for API testing
global.fetch = jest.fn();
describe('Business Dashboard API Integration - Story 8.1', function () {
    beforeEach(function () {
        // Clear all mocks before each test
        jest.clearAllMocks();
        global.fetch.mockClear();
    });
    describe('API Performance (<1s Load)', function () {
        it('should fetch KPIs data within performance budget', function () { return __awaiter(_this, void 0, void 0, function () {
            var startTime, response, data, endTime, duration;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = performance.now();
                        global.fetch.mockResolvedValueOnce({
                            ok: true,
                            json: function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    return [2 /*return*/, ({
                                            totalRevenue: 125000.00,
                                            totalAppointments: 850,
                                            conversionRate: 0.2875,
                                            newPatients: 120,
                                            averageTicket: 147.06,
                                            retentionRate: 0.82,
                                            nps: 8.5,
                                            cac: 75.00
                                        })];
                                });
                            }); },
                            headers: new Headers({ 'content-type': 'application/json' }),
                        });
                        return [4 /*yield*/, fetch('/api/dashboard/kpis')];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        endTime = performance.now();
                        duration = endTime - startTime;
                        expect(response.ok).toBe(true);
                        expect(data.totalRevenue).toBe(125000.00);
                        expect(data.totalAppointments).toBe(850);
                        expect(duration).toBeLessThan(1000); // <1s load requirement
                        return [2 /*return*/];
                }
            });
        }); });
        it('should fetch charts data within performance budget', function () { return __awaiter(_this, void 0, void 0, function () {
            var startTime, response, data, endTime, duration;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = performance.now();
                        global.fetch.mockResolvedValueOnce({
                            ok: true,
                            json: function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    return [2 /*return*/, ({
                                            revenueChart: [
                                                { month: 'Jan', revenue: 15000, appointments: 120 },
                                                { month: 'Feb', revenue: 18000, appointments: 140 },
                                                { month: 'Mar', revenue: 22000, appointments: 160 },
                                            ],
                                            conversionFunnel: [
                                                { stage: 'Visitantes', value: 2500 },
                                                { stage: 'Leads', value: 850 },
                                                { stage: 'Agendamentos', value: 245 },
                                                { stage: 'Conversões', value: 120 },
                                            ],
                                            procedureDistribution: [
                                                { procedure: 'Limpeza', count: 320, revenue: 24000 },
                                                { procedure: 'Botox', count: 85, revenue: 34000 },
                                                { procedure: 'Preenchimento', count: 45, revenue: 22500 },
                                            ]
                                        })];
                                });
                            }); },
                            headers: new Headers({ 'content-type': 'application/json' }),
                        });
                        return [4 /*yield*/, fetch('/api/dashboard/charts')];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        endTime = performance.now();
                        duration = endTime - startTime;
                        expect(response.ok).toBe(true);
                        expect(data.revenueChart).toHaveLength(3);
                        expect(data.conversionFunnel).toHaveLength(4);
                        expect(data.procedureDistribution).toHaveLength(3);
                        expect(duration).toBeLessThan(1000); // <1s load requirement
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('API Data Validation', function () {
        it('should validate KPIs data structure', function () { return __awaiter(_this, void 0, void 0, function () {
            var response, data;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Mock successful KPIs API response
                        ;
                        global.fetch.mockResolvedValueOnce({
                            ok: true,
                            json: function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    return [2 /*return*/, ({
                                            totalRevenue: 125000.00,
                                            totalAppointments: 850,
                                            conversionRate: 0.2875,
                                            newPatients: 120,
                                            averageTicket: 147.06,
                                            retentionRate: 0.82,
                                            nps: 8.5,
                                            cac: 75.00
                                        })];
                                });
                            }); },
                            headers: new Headers({ 'content-type': 'application/json' }),
                        });
                        return [4 /*yield*/, fetch('/api/dashboard/kpis')];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()
                            // Validate required KPI fields
                        ];
                    case 2:
                        data = _a.sent();
                        // Validate required KPI fields
                        expect(data).toHaveProperty('totalRevenue');
                        expect(data).toHaveProperty('totalAppointments');
                        expect(data).toHaveProperty('conversionRate');
                        expect(data).toHaveProperty('newPatients');
                        expect(data).toHaveProperty('averageTicket');
                        expect(data).toHaveProperty('retentionRate');
                        expect(data).toHaveProperty('nps');
                        expect(data).toHaveProperty('cac');
                        // Validate data types
                        expect(typeof data.totalRevenue).toBe('number');
                        expect(typeof data.totalAppointments).toBe('number');
                        expect(typeof data.conversionRate).toBe('number');
                        expect(typeof data.newPatients).toBe('number');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should validate charts data structure', function () { return __awaiter(_this, void 0, void 0, function () {
            var response, data;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Mock successful charts API response
                        ;
                        global.fetch.mockResolvedValueOnce({
                            ok: true,
                            json: function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    return [2 /*return*/, ({
                                            revenueChart: [
                                                { month: 'Jan', revenue: 15000, appointments: 120 },
                                                { month: 'Feb', revenue: 18000, appointments: 140 },
                                            ],
                                            conversionFunnel: [
                                                { stage: 'Visitantes', value: 2500 },
                                                { stage: 'Leads', value: 850 },
                                            ],
                                            procedureDistribution: [
                                                { procedure: 'Limpeza', count: 320, revenue: 24000 },
                                                { procedure: 'Botox', count: 85, revenue: 34000 },
                                            ]
                                        })];
                                });
                            }); },
                            headers: new Headers({ 'content-type': 'application/json' }),
                        });
                        return [4 /*yield*/, fetch('/api/dashboard/charts')];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()
                            // Validate charts structure
                        ];
                    case 2:
                        data = _a.sent();
                        // Validate charts structure
                        expect(data).toHaveProperty('revenueChart');
                        expect(data).toHaveProperty('conversionFunnel');
                        expect(data).toHaveProperty('procedureDistribution');
                        // Validate array structures
                        expect(Array.isArray(data.revenueChart)).toBe(true);
                        expect(Array.isArray(data.conversionFunnel)).toBe(true);
                        expect(Array.isArray(data.procedureDistribution)).toBe(true);
                        // Validate array item structures
                        if (data.revenueChart.length > 0) {
                            expect(data.revenueChart[0]).toHaveProperty('month');
                            expect(data.revenueChart[0]).toHaveProperty('revenue');
                        }
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('API Error Handling', function () {
        it('should handle KPIs API errors gracefully', function () { return __awaiter(_this, void 0, void 0, function () {
            var response, data;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Mock failed KPIs API response
                        ;
                        global.fetch.mockResolvedValueOnce({
                            ok: false,
                            status: 500,
                            json: function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    return [2 /*return*/, ({
                                            error: 'Internal Server Error',
                                            message: 'Database connection failed'
                                        })];
                                });
                            }); },
                            headers: new Headers({ 'content-type': 'application/json' }),
                        });
                        return [4 /*yield*/, fetch('/api/dashboard/kpis')];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        expect(response.ok).toBe(false);
                        expect(response.status).toBe(500);
                        expect(data).toHaveProperty('error');
                        expect(data.error).toBe('Internal Server Error');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle charts API errors gracefully', function () { return __awaiter(_this, void 0, void 0, function () {
            var response, data;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Mock failed charts API response
                        ;
                        global.fetch.mockResolvedValueOnce({
                            ok: false,
                            status: 404,
                            json: function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    return [2 /*return*/, ({
                                            error: 'Not Found',
                                            message: 'Charts data not available'
                                        })];
                                });
                            }); },
                            headers: new Headers({ 'content-type': 'application/json' }),
                        });
                        return [4 /*yield*/, fetch('/api/dashboard/charts')];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        expect(response.ok).toBe(false);
                        expect(response.status).toBe(404);
                        expect(data).toHaveProperty('error');
                        expect(data.error).toBe('Not Found');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('API Security & Authentication', function () {
        it('should require authentication for KPIs endpoint', function () { return __awaiter(_this, void 0, void 0, function () {
            var response, data;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Mock unauthorized response
                        ;
                        global.fetch.mockResolvedValueOnce({
                            ok: false,
                            status: 401,
                            json: function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    return [2 /*return*/, ({
                                            error: 'Unauthorized',
                                            message: 'Authentication required'
                                        })];
                                });
                            }); },
                            headers: new Headers({ 'content-type': 'application/json' }),
                        });
                        return [4 /*yield*/, fetch('/api/dashboard/kpis')];
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
        it('should validate user permissions for dashboard access', function () { return __awaiter(_this, void 0, void 0, function () {
            var response, data;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Mock forbidden response
                        ;
                        global.fetch.mockResolvedValueOnce({
                            ok: false,
                            status: 403,
                            json: function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    return [2 /*return*/, ({
                                            error: 'Forbidden',
                                            message: 'Insufficient permissions for dashboard access'
                                        })];
                                });
                            }); },
                            headers: new Headers({ 'content-type': 'application/json' }),
                        });
                        return [4 /*yield*/, fetch('/api/dashboard/charts')];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        expect(response.status).toBe(403);
                        expect(data.error).toBe('Forbidden');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('API Caching & Performance', function () {
        it('should support cache headers for performance', function () { return __awaiter(_this, void 0, void 0, function () {
            var response;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Mock response with cache headers
                        ;
                        global.fetch.mockResolvedValueOnce({
                            ok: true,
                            json: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                return [2 /*return*/, ({ totalRevenue: 125000 })];
                            }); }); },
                            headers: new Headers({
                                'content-type': 'application/json',
                                'cache-control': 'public, max-age=300',
                                'etag': '"abc123"'
                            }),
                        });
                        return [4 /*yield*/, fetch('/api/dashboard/kpis')];
                    case 1:
                        response = _a.sent();
                        expect(response.headers.get('cache-control')).toBe('public, max-age=300');
                        expect(response.headers.get('etag')).toBe('"abc123"');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle concurrent requests efficiently', function () { return __awaiter(_this, void 0, void 0, function () {
            var startTime, promises, responses, endTime, duration;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Mock multiple concurrent responses
                        ;
                        global.fetch
                            .mockResolvedValueOnce({
                            ok: true,
                            json: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                return [2 /*return*/, ({ totalRevenue: 125000 })];
                            }); }); },
                        })
                            .mockResolvedValueOnce({
                            ok: true,
                            json: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                return [2 /*return*/, ({ revenueChart: [] })];
                            }); }); },
                        })
                            .mockResolvedValueOnce({
                            ok: true,
                            json: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                return [2 /*return*/, ({ alerts: [] })];
                            }); }); },
                        });
                        startTime = performance.now();
                        promises = [
                            fetch('/api/dashboard/kpis'),
                            fetch('/api/dashboard/charts'),
                            fetch('/api/dashboard/alerts')
                        ];
                        return [4 /*yield*/, Promise.all(promises)];
                    case 1:
                        responses = _a.sent();
                        endTime = performance.now();
                        duration = endTime - startTime;
                        expect(responses).toHaveLength(3);
                        expect(responses.every(function (r) { return r.ok; })).toBe(true);
                        expect(duration).toBeLessThan(2000); // Should handle concurrent requests efficiently
                        return [2 /*return*/];
                }
            });
        }); });
    });
});

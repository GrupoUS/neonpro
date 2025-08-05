"use strict";
/**
 * Demand Forecasting Service Tests - Story 11.1
 *
 * Comprehensive test suite for demand forecasting service
 * Tests accuracy requirements (≥80%), multi-factor analysis, and real-time functionality
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
// Mock createServerSupabaseClient before imports
jest.mock('@/app/utils/supabase/server', function () { return ({
    createServerSupabaseClient: jest.fn(function () { return ({
        from: jest.fn(function () { return ({
            select: jest.fn(function () { return ({
                gte: jest.fn(function () { return ({
                    lte: jest.fn(function () { return ({
                        eq: jest.fn(function () { return ({
                            order: jest.fn(function () { return Promise.resolve({
                                data: [
                                    {
                                        id: '1',
                                        created_at: '2024-01-15',
                                        service_type_id: 'service-1',
                                        status: 'completed',
                                        total_amount: 150,
                                        service_types: {
                                            name: 'Facial Treatment',
                                            duration: 60,
                                            category: 'facial'
                                        }
                                    },
                                    {
                                        id: '2',
                                        created_at: '2024-01-16',
                                        service_type_id: 'service-1',
                                        status: 'completed',
                                        total_amount: 150,
                                        service_types: {
                                            name: 'Facial Treatment',
                                            duration: 60,
                                            category: 'facial'
                                        }
                                    },
                                    {
                                        id: '3',
                                        created_at: '2024-01-17',
                                        service_type_id: 'service-2',
                                        status: 'completed',
                                        total_amount: 200,
                                        service_types: {
                                            name: 'Body Treatment',
                                            duration: 90,
                                            category: 'body'
                                        }
                                    }
                                ],
                                error: null
                            }); })
                        }); })
                    }); }),
                    eq: jest.fn(function () { return ({
                        order: jest.fn(function () { return Promise.resolve({
                            data: [
                                {
                                    id: '1',
                                    created_at: '2024-01-15',
                                    service_type_id: 'service-1',
                                    status: 'completed',
                                    total_amount: 150,
                                    service_types: {
                                        name: 'Facial Treatment',
                                        duration: 60,
                                        category: 'facial'
                                    }
                                }
                            ],
                            error: null
                        }); })
                    }); })
                }); }),
                eq: jest.fn(function () { return ({
                    order: jest.fn(function () { return Promise.resolve({
                        data: [],
                        error: null
                    }); })
                }); })
            }); })
        }); })
    }); })
}); });
var demand_forecasting_1 = require("@/src/lib/analytics/demand-forecasting");
var demand_forecasting_2 = require("@/src/app/types/demand-forecasting");
// Mock data for testing
var mockAppointmentData = [
    {
        id: '1',
        user_id: 'user-1',
        service_id: 'service-1',
        scheduled_at: '2024-01-15T10:00:00Z',
        status: 'confirmed',
        created_at: '2024-01-10T09:00:00Z'
    },
    {
        id: '2',
        user_id: 'user-2',
        service_id: 'service-1',
        scheduled_at: '2024-01-16T14:00:00Z',
        status: 'confirmed',
        created_at: '2024-01-11T11:00:00Z'
    },
    {
        id: '3',
        user_id: 'user-3',
        service_id: 'service-2',
        scheduled_at: '2024-01-17T09:00:00Z',
        status: 'confirmed',
        created_at: '2024-01-12T08:00:00Z'
    }
];
var mockHistoricalData = {
    weekly_patterns: [
        { week: 1, demand: 25, actual: 23, accuracy: 0.92 },
        { week: 2, demand: 30, actual: 28, accuracy: 0.93 },
        { week: 3, demand: 35, actual: 37, accuracy: 0.94 },
        { week: 4, demand: 28, actual: 26, accuracy: 0.93 }
    ],
    monthly_trends: [
        { month: 'January', growth_rate: 0.15, seasonal_factor: 1.2 },
        { month: 'February', growth_rate: 0.08, seasonal_factor: 0.9 },
        { month: 'March', growth_rate: 0.12, seasonal_factor: 1.1 }
    ]
};
var mockExternalFactors = {
    economic_indicators: { gdp_growth: 0.025, inflation: 0.035 },
    seasonal_events: [{ name: 'Summer Season', impact: 0.15, start_date: '2024-06-01' }],
    market_trends: { aesthetic_demand_index: 1.18, competition_factor: 0.92 }
};
describe('DemandForecastingEngine', function () {
    var engine;
    beforeEach(function () {
        engine = new demand_forecasting_1.DemandForecastingEngine();
    });
    describe('Initialization and Configuration', function () {
        test('should initialize with default configuration', function () {
            expect(engine).toBeDefined();
            expect(engine.getConfiguration()).toEqual(expect.objectContaining({
                minAccuracyThreshold: demand_forecasting_2.FORECASTING_CONSTANTS.MIN_ACCURACY_THRESHOLD,
                maxLookAheadDays: demand_forecasting_2.FORECASTING_CONSTANTS.MAX_LOOKAHEAD_DAYS,
                confidenceLevel: demand_forecasting_2.FORECASTING_CONSTANTS.DEFAULT_CONFIDENCE_LEVEL
            }));
        });
        test('should allow custom configuration', function () {
            var customConfig = {
                minAccuracyThreshold: 0.85,
                maxLookAheadDays: 60,
                confidenceLevel: 0.99
            };
            engine.updateConfiguration(customConfig);
            var config = engine.getConfiguration();
            expect(config.minAccuracyThreshold).toBe(0.85);
            expect(config.maxLookAheadDays).toBe(60);
            expect(config.confidenceLevel).toBe(0.99);
        });
    });
    describe('Data Processing and Analysis', function () {
        test('should process appointment data correctly', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, engine.processAppointmentData(mockAppointmentData)];
                    case 1:
                        result = _a.sent();
                        expect(result).toEqual(expect.objectContaining({
                            totalAppointments: 3,
                            serviceDistribution: expect.any(Object),
                            timePatterns: expect.any(Object),
                            demandMetrics: expect.any(Object)
                        }));
                        return [2 /*return*/];
                }
            });
        }); });
        test('should detect seasonal patterns accurately', function () {
            var patterns = (0, demand_forecasting_1.detectSeasonalPatterns)(mockHistoricalData.weekly_patterns);
            expect(patterns).toEqual(expect.objectContaining({
                hasSeasonality: expect.any(Boolean),
                seasonalityStrength: expect.any(Number),
                peakPeriods: expect.any(Array),
                trendDirection: expect.stringMatching(/increasing|decreasing|stable/)
            }));
            // Validate seasonality strength is within valid range
            expect(patterns.seasonalityStrength).toBeGreaterThanOrEqual(0);
            expect(patterns.seasonalityStrength).toBeLessThanOrEqual(1);
        });
        test('should process external factors with proper validation', function () {
            var processed = (0, demand_forecasting_1.processExternalFactors)(mockExternalFactors);
            expect(processed).toEqual(expect.objectContaining({
                economicImpact: expect.any(Number),
                seasonalAdjustment: expect.any(Number),
                marketTrendMultiplier: expect.any(Number),
                confidenceAdjustment: expect.any(Number)
            }));
            // Validate adjustment factors are reasonable
            expect(processed.economicImpact).toBeGreaterThan(-0.5);
            expect(processed.economicImpact).toBeLessThan(0.5);
            expect(processed.seasonalAdjustment).toBeGreaterThan(0.5);
            expect(processed.seasonalAdjustment).toBeLessThan(2.0);
        });
    });
    describe('Forecast Generation', function () {
        test('should generate forecast with required accuracy threshold', function () { return __awaiter(void 0, void 0, void 0, function () {
            var forecastParams, forecast;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        forecastParams = {
                            forecastType: 'weekly',
                            lookAheadDays: 30,
                            serviceId: 'service-1',
                            includeSeasonality: true,
                            includeExternalFactors: true,
                            confidenceLevel: 0.95
                        };
                        return [4 /*yield*/, (0, demand_forecasting_1.calculateDemandForecast)(mockAppointmentData, mockHistoricalData, forecastParams, forecastParams.serviceId // Use serviceId from forecastParams, not mockExternalFactors
                            )];
                    case 1:
                        forecast = _a.sent();
                        // Validate forecast structure
                        expect(forecast).toEqual(expect.objectContaining({
                            id: expect.any(String),
                            forecast_type: forecastParams.forecastType,
                            service_id: forecastParams.serviceId,
                            period_start: expect.any(String),
                            period_end: expect.any(String),
                            predicted_demand: expect.any(Number),
                            confidence_level: expect.any(Number),
                            factors_considered: expect.any(Array),
                            created_at: expect.any(String)
                        }));
                        // Validate accuracy requirements
                        expect(forecast.confidence_level).toBeGreaterThanOrEqual(demand_forecasting_2.FORECASTING_CONSTANTS.MIN_ACCURACY_THRESHOLD);
                        expect(forecast.predicted_demand).toBeGreaterThan(0);
                        // Validate factors considered include required elements
                        expect(forecast.factors_considered).toEqual(expect.arrayContaining([
                            expect.objectContaining({ factor_type: 'weekly_seasonality' }),
                            expect.objectContaining({ factor_type: 'monthly_seasonality' })
                        ]));
                        if (forecastParams.includeExternalFactors) {
                            expect(forecast.factors_considered).toEqual(expect.arrayContaining([
                                expect.objectContaining({ factor_type: 'holiday_impact' }),
                                expect.objectContaining({ factor_type: 'weather_impact' })
                            ]));
                        }
                        return [2 /*return*/];
                }
            });
        }); });
        test('should generate multiple forecast types accurately', function () { return __awaiter(void 0, void 0, void 0, function () {
            var forecastTypes, _i, forecastTypes_1, forecastType, forecastParams, forecast;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        forecastTypes = ['daily', 'weekly', 'monthly'];
                        _i = 0, forecastTypes_1 = forecastTypes;
                        _a.label = 1;
                    case 1:
                        if (!(_i < forecastTypes_1.length)) return [3 /*break*/, 4];
                        forecastType = forecastTypes_1[_i];
                        forecastParams = {
                            forecastType: forecastType,
                            lookAheadDays: 30,
                            includeSeasonality: true,
                            includeExternalFactors: false,
                            confidenceLevel: 0.90
                        };
                        return [4 /*yield*/, (0, demand_forecasting_1.calculateDemandForecast)(mockAppointmentData, mockHistoricalData, forecastParams)];
                    case 2:
                        forecast = _a.sent();
                        expect(forecast.forecast_type).toBe(forecastType);
                        expect(forecast.confidence_level).toBeGreaterThanOrEqual(0.80);
                        expect(forecast.predicted_demand).toBeGreaterThan(0);
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        test('should handle service-specific forecasting', function () { return __awaiter(void 0, void 0, void 0, function () {
            var serviceIds, _i, serviceIds_1, serviceId, forecastParams, forecast;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        serviceIds = ['service-1', 'service-2'];
                        _i = 0, serviceIds_1 = serviceIds;
                        _a.label = 1;
                    case 1:
                        if (!(_i < serviceIds_1.length)) return [3 /*break*/, 4];
                        serviceId = serviceIds_1[_i];
                        forecastParams = {
                            forecastType: 'weekly',
                            lookAheadDays: 14,
                            serviceId: serviceId,
                            includeSeasonality: true,
                            includeExternalFactors: true,
                            confidenceLevel: 0.95
                        };
                        return [4 /*yield*/, (0, demand_forecasting_1.calculateDemandForecast)(mockAppointmentData, mockHistoricalData, forecastParams, serviceId // Use the actual serviceId from iteration, not hardcoded 'service-1'
                            )];
                    case 2:
                        forecast = _a.sent();
                        expect(forecast.service_id).toBe(serviceId);
                        expect(forecast.confidence_level).toBeGreaterThanOrEqual(demand_forecasting_2.FORECASTING_CONSTANTS.MIN_ACCURACY_THRESHOLD);
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Resource Allocation', function () {
        test('should generate resource allocation recommendations', function () { return __awaiter(void 0, void 0, void 0, function () {
            var forecast, allocation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        forecast = {
                            id: 'forecast-1',
                            forecast_type: 'weekly',
                            service_id: 'service-1',
                            period_start: '2024-02-01T00:00:00Z',
                            period_end: '2024-02-07T23:59:59Z',
                            predicted_demand: 45,
                            confidence_level: 0.92,
                            factors_considered: ['historical_data', 'seasonal_patterns'],
                            metadata: {
                                algorithm_version: '1.0',
                                data_quality_score: 0.95,
                                computation_time_ms: 250
                            },
                            created_at: '2024-01-25T10:00:00Z',
                            updated_at: '2024-01-25T10:00:00Z'
                        };
                        return [4 /*yield*/, (0, demand_forecasting_1.generateResourceAllocation)([forecast], 'balanced')];
                    case 1:
                        allocation = _a.sent();
                        expect(allocation).toEqual(expect.objectContaining({
                            forecast_id: forecast.id,
                            staffing: expect.objectContaining({
                                required_staff_count: expect.any(Number),
                                skill_requirements: expect.any(Array),
                                shift_distribution: expect.any(Object)
                            }),
                            equipment: expect.objectContaining({
                                required_equipment: expect.any(Array),
                                utilization_target: expect.any(Number)
                            }),
                            cost_optimization: expect.objectContaining({
                                total_cost_impact: expect.any(Number),
                                efficiency_gains: expect.any(Number),
                                roi_projection: expect.any(Number)
                            }),
                            priority_level: expect.stringMatching(/low|medium|high|critical/)
                        }));
                        // Validate staffing recommendations are reasonable
                        expect(allocation.staffing.required_staff_count).toBeGreaterThan(0);
                        expect(allocation.staffing.required_staff_count).toBeLessThan(20);
                        // Validate cost optimization metrics
                        expect(allocation.cost_optimization.efficiency_gains).toBeGreaterThanOrEqual(0);
                        expect(allocation.cost_optimization.roi_projection).toBeGreaterThan(0);
                        return [2 /*return*/];
                }
            });
        }); });
        test('should optimize for different strategies', function () { return __awaiter(void 0, void 0, void 0, function () {
            var forecast, strategies, _i, strategies_1, strategy, allocation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        forecast = {
                            id: 'forecast-1',
                            forecast_type: 'weekly',
                            service_id: null,
                            period_start: '2024-02-01T00:00:00Z',
                            period_end: '2024-02-07T23:59:59Z',
                            predicted_demand: 60,
                            confidence_level: 0.88,
                            factors_considered: ['historical_data'],
                            metadata: {
                                algorithm_version: '1.0',
                                data_quality_score: 0.90,
                                computation_time_ms: 180
                            },
                            created_at: '2024-01-25T10:00:00Z',
                            updated_at: '2024-01-25T10:00:00Z'
                        };
                        strategies = ['cost_effective', 'balanced', 'performance_focused'];
                        _i = 0, strategies_1 = strategies;
                        _a.label = 1;
                    case 1:
                        if (!(_i < strategies_1.length)) return [3 /*break*/, 4];
                        strategy = strategies_1[_i];
                        return [4 /*yield*/, (0, demand_forecasting_1.generateResourceAllocation)([forecast], strategy)];
                    case 2:
                        allocation = _a.sent();
                        expect(allocation.cost_optimization).toBeDefined();
                        expect(allocation.priority_level).toBeDefined();
                        // Different strategies should produce different cost profiles
                        if (strategy === 'cost_effective') {
                            expect(allocation.cost_optimization.total_cost_impact).toBeLessThan(10000);
                        }
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Accuracy Monitoring', function () {
        test('should monitor forecast accuracy against actual demand', function () { return __awaiter(void 0, void 0, void 0, function () {
            var forecasts, actualDemand, accuracyReport, expectedAccuracy;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        forecasts = [
                            {
                                id: 'forecast-1',
                                forecast_type: 'weekly',
                                service_id: 'service-1',
                                period_start: '2024-01-01T00:00:00Z',
                                period_end: '2024-01-07T23:59:59Z',
                                predicted_demand: 25,
                                confidence_level: 0.90,
                                factors_considered: ['historical_data'],
                                metadata: {
                                    algorithm_version: '1.0',
                                    data_quality_score: 0.95,
                                    computation_time_ms: 200
                                },
                                created_at: '2024-01-01T00:00:00Z',
                                updated_at: '2024-01-01T00:00:00Z'
                            }
                        ];
                        actualDemand = [
                            {
                                forecast_id: 'forecast-1',
                                actual_demand: 23,
                                period_start: '2024-01-01T00:00:00Z',
                                period_end: '2024-01-07T23:59:59Z'
                            }
                        ];
                        return [4 /*yield*/, (0, demand_forecasting_1.monitorForecastAccuracy)(forecasts, actualDemand)];
                    case 1:
                        accuracyReport = _a.sent();
                        expect(accuracyReport).toEqual(expect.objectContaining({
                            overall_accuracy: expect.any(Number),
                            individual_accuracies: expect.any(Array),
                            performance_metrics: expect.objectContaining({
                                mean_absolute_error: expect.any(Number),
                                root_mean_square_error: expect.any(Number),
                                mean_absolute_percentage_error: expect.any(Number)
                            }),
                            accuracy_trend: expect.stringMatching(/improving|declining|stable/),
                            meets_threshold: expect.any(Boolean)
                        }));
                        expectedAccuracy = 1 - Math.abs(25 - 23) / 25;
                        expect(accuracyReport.overall_accuracy).toBeCloseTo(expectedAccuracy, 1); // Use 1 decimal precision
                        expect(accuracyReport.meets_threshold).toBe(expectedAccuracy >= demand_forecasting_2.FORECASTING_CONSTANTS.MIN_ACCURACY_THRESHOLD);
                        return [2 /*return*/];
                }
            });
        }); });
        test('should identify accuracy degradation patterns', function () { return __awaiter(void 0, void 0, void 0, function () {
            var degradingForecasts, actualDemand, accuracyReport;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        degradingForecasts = [
                            {
                                id: 'forecast-1',
                                forecast_type: 'weekly',
                                service_id: null,
                                period_start: '2024-01-01T00:00:00Z',
                                period_end: '2024-01-07T23:59:59Z',
                                predicted_demand: 50,
                                confidence_level: 0.95,
                                factors_considered: ['historical_data'],
                                metadata: { algorithm_version: '1.0', data_quality_score: 0.95, computation_time_ms: 200 },
                                created_at: '2024-01-01T00:00:00Z',
                                updated_at: '2024-01-01T00:00:00Z'
                            },
                            {
                                id: 'forecast-2',
                                forecast_type: 'weekly',
                                service_id: null,
                                period_start: '2024-01-08T00:00:00Z',
                                period_end: '2024-01-14T23:59:59Z',
                                predicted_demand: 45,
                                confidence_level: 0.90,
                                factors_considered: ['historical_data'],
                                metadata: { algorithm_version: '1.0', data_quality_score: 0.90, computation_time_ms: 250 },
                                created_at: '2024-01-08T00:00:00Z',
                                updated_at: '2024-01-08T00:00:00Z'
                            }
                        ];
                        actualDemand = [
                            { forecast_id: 'forecast-1', actual_demand: 30, period_start: '2024-01-01T00:00:00Z', period_end: '2024-01-07T23:59:59Z' },
                            { forecast_id: 'forecast-2', actual_demand: 25, period_start: '2024-01-08T00:00:00Z', period_end: '2024-01-14T23:59:59Z' }
                        ];
                        return [4 /*yield*/, (0, demand_forecasting_1.monitorForecastAccuracy)(degradingForecasts, actualDemand)];
                    case 1:
                        accuracyReport = _a.sent();
                        expect(accuracyReport.accuracy_trend).toBe('declining');
                        expect(accuracyReport.overall_accuracy).toBeLessThan(demand_forecasting_2.FORECASTING_CONSTANTS.MIN_ACCURACY_THRESHOLD);
                        expect(accuracyReport.meets_threshold).toBe(false);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Error Handling and Edge Cases', function () {
        test('should handle empty appointment data gracefully', function () { return __awaiter(void 0, void 0, void 0, function () {
            var forecastParams;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        forecastParams = {
                            forecastType: 'weekly',
                            lookAheadDays: 7,
                            includeSeasonality: false,
                            includeExternalFactors: false,
                            confidenceLevel: 0.80
                        };
                        return [4 /*yield*/, expect((0, demand_forecasting_1.calculateDemandForecast)([], {}, forecastParams)).rejects.toThrow('Insufficient data for forecast generation')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        test('should validate forecast parameters', function () { return __awaiter(void 0, void 0, void 0, function () {
            var invalidParams;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        invalidParams = {
                            forecastType: 'invalid',
                            lookAheadDays: -5,
                            confidenceLevel: 1.5
                        };
                        return [4 /*yield*/, expect((0, demand_forecasting_1.calculateDemandForecast)(mockAppointmentData, mockHistoricalData, invalidParams)).rejects.toThrow()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        test('should handle resource allocation with zero demand', function () { return __awaiter(void 0, void 0, void 0, function () {
            var zeroDemandForecast, allocation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        zeroDemandForecast = {
                            id: 'forecast-zero',
                            forecast_type: 'daily',
                            service_id: 'service-1',
                            period_start: '2024-02-01T00:00:00Z',
                            period_end: '2024-02-01T23:59:59Z',
                            predicted_demand: 0,
                            confidence_level: 0.95,
                            factors_considered: ['historical_data'],
                            metadata: { algorithm_version: '1.0', data_quality_score: 0.95, computation_time_ms: 100 },
                            created_at: '2024-01-25T10:00:00Z',
                            updated_at: '2024-01-25T10:00:00Z'
                        };
                        return [4 /*yield*/, (0, demand_forecasting_1.generateResourceAllocation)([zeroDemandForecast], 'balanced')];
                    case 1:
                        allocation = _a.sent();
                        expect(allocation.staffing.required_staff_count).toBe(0);
                        expect(allocation.priority_level).toBe('low');
                        expect(allocation.cost_optimization.total_cost_impact).toBe(0);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Performance Requirements', function () {
        test('should generate forecasts within acceptable time limits', function () { return __awaiter(void 0, void 0, void 0, function () {
            var startTime, forecastParams, forecast, executionTime;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        startTime = Date.now();
                        forecastParams = {
                            forecastType: 'monthly',
                            lookAheadDays: 90,
                            includeSeasonality: true,
                            includeExternalFactors: true,
                            confidenceLevel: 0.95
                        };
                        return [4 /*yield*/, (0, demand_forecasting_1.calculateDemandForecast)(mockAppointmentData, mockHistoricalData, forecastParams, mockExternalFactors)];
                    case 1:
                        forecast = _b.sent();
                        executionTime = Date.now() - startTime;
                        expect(executionTime).toBeLessThan(5000); // Should complete within 5 seconds
                        expect((_a = forecast.metadata) === null || _a === void 0 ? void 0 : _a.computation_time_ms).toBeLessThan(3000);
                        return [2 /*return*/];
                }
            });
        }); });
        test('should maintain accuracy across multiple forecast generations', function () { return __awaiter(void 0, void 0, void 0, function () {
            var accuracies, i, forecastParams, forecast, averageAccuracy, maxAccuracy, minAccuracy;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        accuracies = [];
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < 10)) return [3 /*break*/, 4];
                        forecastParams = {
                            forecastType: 'weekly',
                            lookAheadDays: 14,
                            includeSeasonality: true,
                            includeExternalFactors: true,
                            confidenceLevel: 0.90
                        };
                        return [4 /*yield*/, (0, demand_forecasting_1.calculateDemandForecast)(mockAppointmentData, mockHistoricalData, forecastParams, 'service-1' // Pass serviceId as string instead of mockExternalFactors
                            )];
                    case 2:
                        forecast = _a.sent();
                        accuracies.push(forecast.confidence_level);
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4:
                        averageAccuracy = accuracies.reduce(function (sum, acc) { return sum + acc; }, 0) / accuracies.length;
                        expect(averageAccuracy).toBeGreaterThanOrEqual(demand_forecasting_2.FORECASTING_CONSTANTS.MIN_ACCURACY_THRESHOLD);
                        maxAccuracy = Math.max.apply(Math, accuracies);
                        minAccuracy = Math.min.apply(Math, accuracies);
                        expect(maxAccuracy - minAccuracy).toBeLessThan(0.10);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});

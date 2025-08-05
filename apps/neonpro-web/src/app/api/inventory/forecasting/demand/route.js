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
exports.POST = POST;
exports.GET = GET;
var demand_forecasting_service_1 = require("@/app/lib/services/demand-forecasting-service");
var server_1 = require("next/server");
var zod_1 = require("zod");
// Validation schemas
var forecastRequestSchema = zod_1.z.object({
    itemId: zod_1.z.string().uuid(),
    clinicId: zod_1.z.string().uuid(),
    forecastPeriod: zod_1.z.number().min(1).max(365),
    confidenceLevel: zod_1.z.number().min(0.5).max(0.99).default(0.95)
});
var bulkForecastRequestSchema = zod_1.z.object({
    items: zod_1.z.array(zod_1.z.object({
        itemId: zod_1.z.string().uuid(),
        forecastPeriod: zod_1.z.number().min(1).max(365).default(30)
    })),
    clinicId: zod_1.z.string().uuid(),
    confidenceLevel: zod_1.z.number().min(0.5).max(0.99).default(0.95)
});
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var body, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, request.json()];
                case 1:
                    body = _a.sent();
                    // Check if it's a bulk request
                    if (body.items && Array.isArray(body.items)) {
                        return [2 /*return*/, handleBulkForecast(body)];
                    }
                    else {
                        return [2 /*return*/, handleSingleForecast(body)];
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error('Demand forecasting error:', error_1);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to generate demand forecast' }, { status: 500 })];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function handleSingleForecast(body) {
    return __awaiter(this, void 0, void 0, function () {
        var validation, forecast;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    validation = forecastRequestSchema.safeParse(body);
                    if (!validation.success) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Invalid request data', details: validation.error.errors }, { status: 400 })];
                    }
                    return [4 /*yield*/, demand_forecasting_service_1.demandForecastingService.generateDemandForecast(validation.data)];
                case 1:
                    forecast = _a.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: forecast
                        })];
            }
        });
    });
}
function handleBulkForecast(body) {
    return __awaiter(this, void 0, void 0, function () {
        var validation, _a, items, clinicId, confidenceLevel, forecastPromises, forecasts, successful, errors;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    validation = bulkForecastRequestSchema.safeParse(body);
                    if (!validation.success) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Invalid bulk request data', details: validation.error.errors }, { status: 400 })];
                    }
                    _a = validation.data, items = _a.items, clinicId = _a.clinicId, confidenceLevel = _a.confidenceLevel;
                    forecastPromises = items.map(function (item) {
                        return demand_forecasting_service_1.demandForecastingService.generateDemandForecast({
                            itemId: item.itemId,
                            clinicId: clinicId,
                            forecastPeriod: item.forecastPeriod,
                            confidenceLevel: confidenceLevel
                        }).catch(function (error) { return ({
                            itemId: item.itemId,
                            error: error.message
                        }); });
                    });
                    return [4 /*yield*/, Promise.all(forecastPromises)];
                case 1:
                    forecasts = _b.sent();
                    successful = forecasts.filter(function (f) { return !('error' in f); });
                    errors = forecasts.filter(function (f) { return 'error' in f; });
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: {
                                forecasts: successful,
                                errors: errors.length > 0 ? errors : undefined,
                                summary: {
                                    total: items.length,
                                    successful: successful.length,
                                    failed: errors.length
                                }
                            }
                        })];
            }
        });
    });
}
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var searchParams, clinicId, capabilities;
        return __generator(this, function (_a) {
            try {
                searchParams = new URL(request.url).searchParams;
                clinicId = searchParams.get('clinicId');
                if (!clinicId) {
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Clinic ID is required' }, { status: 400 })];
                }
                capabilities = {
                    algorithms: [
                        {
                            name: 'exponential_smoothing',
                            description: 'Exponential smoothing for trend-based forecasting',
                            bestFor: 'Short to medium-term forecasts with clear trends'
                        },
                        {
                            name: 'seasonal_decomposition',
                            description: 'Seasonal decomposition for cyclical patterns',
                            bestFor: 'Data with strong seasonal patterns'
                        },
                        {
                            name: 'linear_regression',
                            description: 'Linear regression for trend analysis',
                            bestFor: 'Linear trend identification'
                        },
                        {
                            name: 'moving_average',
                            description: 'Moving average for stable demand',
                            bestFor: 'Stable demand with minimal seasonality'
                        }
                    ],
                    supportedPeriods: {
                        min: 1,
                        max: 365,
                        recommended: [7, 14, 30, 60, 90]
                    },
                    confidenceLevels: [0.80, 0.90, 0.95, 0.99],
                    minimumDataPoints: 30,
                    maximumItemsPerBulkRequest: 50
                };
                return [2 /*return*/, server_1.NextResponse.json({
                        success: true,
                        data: capabilities
                    })];
            }
            catch (error) {
                console.error('Failed to get forecasting capabilities:', error);
                return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to retrieve forecasting information' }, { status: 500 })];
            }
            return [2 /*return*/];
        });
    });
}

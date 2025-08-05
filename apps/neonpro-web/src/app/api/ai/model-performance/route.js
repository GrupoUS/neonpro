"use strict";
/**
 * AI Model Performance API Route
 * GET /api/ai/model-performance
 *
 * Provides access to ML model performance metrics and statistics
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
exports.GET = GET;
exports.POST = POST;
exports.PUT = PUT;
exports.DELETE = DELETE;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var duration_prediction_1 = require("@/lib/ai/duration-prediction");
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var searchParams, modelVersion, includeABStats, supabase, _a, user, authError, _b, userRole, roleError, performanceService, abTestService, models, response, abStats, abError_1, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 9, , 10]);
                    searchParams = new URL(request.url).searchParams;
                    modelVersion = searchParams.get('modelVersion');
                    includeABStats = searchParams.get('includeABStats') === 'true';
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 1:
                    supabase = _c.sent();
                    return [4 /*yield*/, supabase.auth.getUser()];
                case 2:
                    _a = _c.sent(), user = _a.data.user, authError = _a.error;
                    if (authError || !user) {
                        return [2 /*return*/, server_1.NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })];
                    }
                    return [4 /*yield*/, supabase
                            .from('user_roles')
                            .select('role')
                            .eq('user_id', user.id)
                            .in('role', ['admin', 'manager'])
                            .single()];
                case 3:
                    _b = _c.sent(), userRole = _b.data, roleError = _b.error;
                    if (roleError || !userRole) {
                        return [2 /*return*/, server_1.NextResponse.json({ success: false, error: 'Insufficient permissions. Admin or Manager role required.' }, { status: 403 })];
                    }
                    performanceService = new duration_prediction_1.ModelPerformanceService();
                    abTestService = new duration_prediction_1.AIABTestingService();
                    return [4 /*yield*/, performanceService.getModelPerformance(modelVersion || undefined)];
                case 4:
                    models = _c.sent();
                    response = {
                        success: true,
                        models: models.map(function (model) { return ({
                            version: model.version,
                            accuracy: model.accuracy,
                            mae: model.mae,
                            rmse: model.rmse,
                            confidenceThreshold: model.confidenceThreshold,
                            isActive: model.isActive
                        }); })
                    };
                    if (!includeABStats) return [3 /*break*/, 8];
                    _c.label = 5;
                case 5:
                    _c.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, abTestService.getABTestStats()];
                case 6:
                    abStats = _c.sent();
                    response.abTestStats = abStats;
                    return [3 /*break*/, 8];
                case 7:
                    abError_1 = _c.sent();
                    console.error('Failed to get A/B test stats:', abError_1);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/, server_1.NextResponse.json(response)];
                case 9:
                    error_1 = _c.sent();
                    console.error('Model Performance API Error:', error_1);
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: false,
                            error: 'Internal server error occurred while retrieving model performance'
                        }, { status: 500 })];
                case 10: return [2 /*return*/];
            }
        });
    });
}
// Handle POST requests for updating model performance
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var body, modelVersion, action, supabase, _a, user, authError, _b, userRole, roleError, performanceService, _c, updatedModel, hyperparameters, featureImportance, trainingDataCount, error_2;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 11, , 12]);
                    return [4 /*yield*/, request.json()];
                case 1:
                    body = _d.sent();
                    modelVersion = body.modelVersion, action = body.action;
                    if (!modelVersion || !action) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                success: false,
                                error: 'Missing required fields: modelVersion, action'
                            }, { status: 400 })];
                    }
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 2:
                    supabase = _d.sent();
                    return [4 /*yield*/, supabase.auth.getUser()];
                case 3:
                    _a = _d.sent(), user = _a.data.user, authError = _a.error;
                    if (authError || !user) {
                        return [2 /*return*/, server_1.NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })];
                    }
                    return [4 /*yield*/, supabase
                            .from('user_roles')
                            .select('role')
                            .eq('user_id', user.id)
                            .eq('role', 'admin')
                            .single()];
                case 4:
                    _b = _d.sent(), userRole = _b.data, roleError = _b.error;
                    if (roleError || !userRole) {
                        return [2 /*return*/, server_1.NextResponse.json({ success: false, error: 'Insufficient permissions. Admin role required.' }, { status: 403 })];
                    }
                    performanceService = new duration_prediction_1.ModelPerformanceService();
                    _c = action;
                    switch (_c) {
                        case 'update_performance': return [3 /*break*/, 5];
                        case 'deploy_model': return [3 /*break*/, 7];
                    }
                    return [3 /*break*/, 9];
                case 5: return [4 /*yield*/, performanceService.updateModelPerformance(modelVersion)];
                case 6:
                    updatedModel = _d.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            message: 'Model performance updated successfully',
                            model: {
                                version: updatedModel.version,
                                accuracy: updatedModel.accuracy,
                                mae: updatedModel.mae,
                                rmse: updatedModel.rmse,
                                confidenceThreshold: updatedModel.confidenceThreshold,
                                isActive: updatedModel.isActive
                            }
                        })];
                case 7:
                    hyperparameters = body.hyperparameters, featureImportance = body.featureImportance, trainingDataCount = body.trainingDataCount;
                    if (!hyperparameters || !featureImportance || !trainingDataCount) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                success: false,
                                error: 'Missing required fields for model deployment: hyperparameters, featureImportance, trainingDataCount'
                            }, { status: 400 })];
                    }
                    return [4 /*yield*/, performanceService.deployNewModel(modelVersion, hyperparameters, featureImportance, trainingDataCount)];
                case 8:
                    _d.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            message: "Model ".concat(modelVersion, " deployed successfully")
                        })];
                case 9: return [2 /*return*/, server_1.NextResponse.json({
                        success: false,
                        error: "Unsupported action: ".concat(action, ". Supported actions: update_performance, deploy_model")
                    }, { status: 400 })];
                case 10: return [3 /*break*/, 12];
                case 11:
                    error_2 = _d.sent();
                    console.error('Model Performance POST API Error:', error_2);
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: false,
                            error: 'Internal server error occurred while processing model performance request'
                        }, { status: 500 })];
                case 12: return [2 /*return*/];
            }
        });
    });
}
// Handle unsupported HTTP methods
function PUT() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, server_1.NextResponse.json({ success: false, error: 'Method not allowed. Use GET to retrieve or POST to update.' }, { status: 405 })];
        });
    });
}
function DELETE() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, server_1.NextResponse.json({ success: false, error: 'Method not allowed. Use GET to retrieve or POST to update.' }, { status: 405 })];
        });
    });
}

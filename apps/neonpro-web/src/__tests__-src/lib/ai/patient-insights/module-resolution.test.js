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
var globals_1 = require("@jest/globals");
(0, globals_1.describe)('Patient Insights - Module Resolution Test', function () {
    (0, globals_1.test)('should validate test environment is working', function () {
        (0, globals_1.expect)(1 + 1).toBe(2);
    });
    (0, globals_1.test)('should test basic module imports using @/ alias', function () { return __awaiter(void 0, void 0, void 0, function () {
        var types, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('@/lib/ai/patient-insights/types'); })];
                case 1:
                    types = _a.sent();
                    (0, globals_1.expect)(types).toBeDefined();
                    console.log('Types module loaded successfully');
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error('Types import error:', error_1);
                    throw error_1;
                case 3: return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.test)('should test individual module imports using @/ alias', function () { return __awaiter(void 0, void 0, void 0, function () {
        var riskAssessment, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('@/lib/ai/patient-insights/risk-assessment'); })];
                case 1:
                    riskAssessment = _a.sent();
                    (0, globals_1.expect)(riskAssessment).toBeDefined();
                    (0, globals_1.expect)(riskAssessment.RiskAssessmentEngine).toBeDefined();
                    console.log('RiskAssessmentEngine module loaded successfully');
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error('Risk Assessment import error:', error_2);
                    throw error_2;
                case 3: return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.test)('should test index module import using @/ alias', function () { return __awaiter(void 0, void 0, void 0, function () {
        var index, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('@/lib/ai/patient-insights/index'); })];
                case 1:
                    index = _a.sent();
                    (0, globals_1.expect)(index).toBeDefined();
                    console.log('Available exports:', Object.keys(index));
                    (0, globals_1.expect)(index.PatientInsightsIntegration).toBeDefined();
                    console.log('PatientInsightsIntegration class loaded successfully');
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    console.error('Index import error:', error_3);
                    throw error_3;
                case 3: return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.test)('should test PatientInsightsIntegration instantiation', function () { return __awaiter(void 0, void 0, void 0, function () {
        var PatientInsightsIntegration, mockSupabase, integration, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('@/lib/ai/patient-insights/index'); })];
                case 1:
                    PatientInsightsIntegration = (_a.sent()).PatientInsightsIntegration;
                    mockSupabase = {
                        from: jest.fn().mockReturnThis(),
                        select: jest.fn().mockReturnThis(),
                        eq: jest.fn().mockReturnThis(),
                        gte: jest.fn().mockReturnThis(),
                        lte: jest.fn().mockReturnThis(),
                        order: jest.fn().mockReturnThis(),
                        limit: jest.fn().mockReturnThis(),
                        single: jest.fn().mockResolvedValue({ data: {}, error: null })
                    };
                    integration = new PatientInsightsIntegration(mockSupabase);
                    (0, globals_1.expect)(integration).toBeDefined();
                    (0, globals_1.expect)(integration).toBeInstanceOf(PatientInsightsIntegration);
                    console.log('PatientInsightsIntegration instantiated successfully');
                    return [3 /*break*/, 3];
                case 2:
                    error_4 = _a.sent();
                    console.error('PatientInsightsIntegration instantiation error:', error_4);
                    throw error_4;
                case 3: return [2 /*return*/];
            }
        });
    }); });
});

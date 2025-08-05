"use strict";
// Story 11.2: No-Show Prediction Overview Component Tests
// Test suite for overview dashboard component
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
var react_1 = require("@testing-library/react");
var overview_1 = require("@/components/dashboard/no-show-prediction/overview");
// Mock fetch
global.fetch = jest.fn();
// Mock toast hook
jest.mock('@/hooks/use-toast', function () { return ({
    useToast: function () { return ({
        toast: jest.fn(),
    }); },
}); });
var mockOverviewData = {
    total_predictions: 150,
    accuracy_rate: 0.85,
    high_risk_patients: 12,
    interventions_today: 8,
    revenue_protected: 15000,
    cost_savings: 3500,
    recent_predictions: [
        {
            id: 'pred-1',
            patient_name: 'João Silva',
            appointment_date: '2024-02-15T14:00:00Z',
            risk_score: 0.85,
            intervention_status: 'pending'
        },
        {
            id: 'pred-2',
            patient_name: 'Maria Santos',
            appointment_date: '2024-02-16T10:00:00Z',
            risk_score: 0.92,
            intervention_status: 'completed'
        }
    ]
};
describe('NoShowPredictionOverview', function () {
    beforeEach(function () {
        jest.clearAllMocks();
    });
    it('should render overview metrics correctly', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fetch.mockResolvedValueOnce({
                        ok: true,
                        json: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/, mockOverviewData];
                        }); }); },
                    });
                    (0, react_1.render)(<overview_1.default />);
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            expect(react_1.screen.getByText('150')).toBeInTheDocument();
                            expect(react_1.screen.getByText('85.0%')).toBeInTheDocument();
                            expect(react_1.screen.getByText('12')).toBeInTheDocument();
                            expect(react_1.screen.getByText('8')).toBeInTheDocument();
                            expect(react_1.screen.getByText('R$ 15,000')).toBeInTheDocument();
                            expect(react_1.screen.getByText('R$ 3,500')).toBeInTheDocument();
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should display recent predictions', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fetch.mockResolvedValueOnce({
                        ok: true,
                        json: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/, mockOverviewData];
                        }); }); },
                    });
                    (0, react_1.render)(<overview_1.default />);
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            expect(react_1.screen.getByText('João Silva')).toBeInTheDocument();
                            expect(react_1.screen.getByText('Maria Santos')).toBeInTheDocument();
                            expect(react_1.screen.getByText('85% risk')).toBeInTheDocument();
                            expect(react_1.screen.getByText('92% risk')).toBeInTheDocument();
                            expect(react_1.screen.getByText('pending')).toBeInTheDocument();
                            expect(react_1.screen.getByText('completed')).toBeInTheDocument();
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should show loading state initially', function () {
        fetch.mockImplementation(function () { return new Promise(function () { }); });
        (0, react_1.render)(<overview_1.default />);
        expect(react_1.screen.getAllByRole('progressbar')).toHaveLength(6);
    });
    it('should handle fetch errors gracefully', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fetch.mockRejectedValueOnce(new Error('Network error'));
                    (0, react_1.render)(<overview_1.default />);
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            expect(react_1.screen.getByText('No data available')).toBeInTheDocument();
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should display quick action buttons', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fetch.mockResolvedValueOnce({
                        ok: true,
                        json: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/, mockOverviewData];
                        }); }); },
                    });
                    (0, react_1.render)(<overview_1.default />);
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            expect(react_1.screen.getByText('Run New Prediction')).toBeInTheDocument();
                            expect(react_1.screen.getByText('Model Settings')).toBeInTheDocument();
                            expect(react_1.screen.getByText('Export Report')).toBeInTheDocument();
                            expect(react_1.screen.getByText('Schedule Analysis')).toBeInTheDocument();
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should handle empty recent predictions', function () { return __awaiter(void 0, void 0, void 0, function () {
        var emptyData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    emptyData = __assign(__assign({}, mockOverviewData), { recent_predictions: [] });
                    fetch.mockResolvedValueOnce({
                        ok: true,
                        json: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/, emptyData];
                        }); }); },
                    });
                    (0, react_1.render)(<overview_1.default />);
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            expect(react_1.screen.getByText('No high-risk predictions found')).toBeInTheDocument();
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});

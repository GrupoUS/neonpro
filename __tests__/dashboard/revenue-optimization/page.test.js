"use strict";
/**
 * Revenue Optimization Dashboard Tests
 *
 * Comprehensive test suite for the revenue optimization dashboard page:
 * - Component rendering and layout
 * - Data fetching and display
 * - User interactions and state management
 * - Error handling and loading states
 * - Integration with optimization engine
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
var react_1 = require("react");
var react_2 = require("@testing-library/react");
var react_query_1 = require("@tanstack/react-query");
var sonner_1 = require("sonner");
var page_1 = require("@/app/dashboard/revenue-optimization/page");
// Mock Next.js modules
jest.mock('next/navigation', function () { return ({
    useRouter: function () { return ({
        push: jest.fn(),
        back: jest.fn(),
        forward: jest.fn(),
        refresh: jest.fn()
    }); },
    useSearchParams: function () { return ({
        get: function () { return 'clinic-123'; }
    }); }
}); });
// Mock Supabase auth
jest.mock('@/app/utils/supabase/client', function () { return ({
    createClient: function () { return ({
        auth: {
            getUser: function () { return Promise.resolve({
                data: { user: { id: 'user-123' } },
                error: null
            }); },
            getSession: function () { return Promise.resolve({
                data: { session: { user: { id: 'user-123' } } },
                error: null
            }); }
        }
    }); }
}); });
// Mock API calls
global.fetch = jest.fn();
// Mock toast notifications
jest.mock('sonner', function () { return ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
        loading: jest.fn(),
        dismiss: jest.fn()
    }
}); });
var mockFetch = global.fetch;
var createTestQueryClient = function () { return new react_query_1.QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            gcTime: 0
        }
    }
}); };
var renderWithQueryClient = function (component) {
    var queryClient = createTestQueryClient();
    return (0, react_2.render)(<react_query_1.QueryClientProvider client={queryClient}>
      {component}
    </react_query_1.QueryClientProvider>);
};
// Mock data
var mockOptimizationData = {
    summary: {
        totalOptimizations: 5,
        activeOptimizations: 3,
        averageImprovement: 12.5,
        totalProjectedRevenue: 150000
    },
    pricing: {
        currentStrategy: { strategy_name: 'Dynamic Pricing' },
        recommendations: ['Increase service A pricing by 10%'],
        projectedIncrease: 8.5
    },
    serviceMix: {
        profitabilityGain: 12.3,
        recommendations: ['Focus on high-margin services']
    },
    clv: {
        projectedIncrease: 15.7,
        enhancementStrategies: ['Implement loyalty program']
    },
    automated: {
        recommendations: [
            {
                type: 'pricing',
                priority: 'high',
                description: 'Optimize pricing for peak hours',
                expectedImpact: 10,
                implementationEffort: 'medium',
                timeframe: '2 weeks'
            }
        ],
        totalProjectedIncrease: 25.5,
        implementationPlan: ['Phase 1: Analysis', 'Phase 2: Implementation']
    },
    competitive: {
        marketPosition: 'Strong',
        opportunityAreas: ['Expand premium services']
    },
    performance: {
        roiMetrics: [],
        performanceIndicators: { overallROI: 1.2, successRate: 0.8 },
        trendAnalysis: { improving: 2, declining: 1, stable: 3 },
        recommendations: ['Monitor competitive pricing']
    }
};
describe('🔥 Revenue Optimization Dashboard', function () {
    beforeEach(function () {
        jest.clearAllMocks();
        mockFetch.mockResolvedValue({
            ok: true,
            json: function () { return Promise.resolve(mockOptimizationData); }
        });
    });
    describe('🔥 Component Rendering', function () {
        test('should render dashboard layout and title', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                renderWithQueryClient(<page_1.default />);
                expect(react_2.screen.getByText('Revenue Optimization')).toBeInTheDocument();
                expect(react_2.screen.getByText(/Maximize revenue through intelligent optimization/)).toBeInTheDocument();
                return [2 /*return*/];
            });
        }); });
        test('should render all optimization sections', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        renderWithQueryClient(<page_1.default />);
                        return [4 /*yield*/, (0, react_2.waitFor)(function () {
                                expect(react_2.screen.getByText('Optimization Overview')).toBeInTheDocument();
                                expect(react_2.screen.getByText('Pricing Optimization')).toBeInTheDocument();
                                expect(react_2.screen.getByText('Service Mix Analysis')).toBeInTheDocument();
                                expect(react_2.screen.getByText('Customer Lifetime Value')).toBeInTheDocument();
                                expect(react_2.screen.getByText('Automated Recommendations')).toBeInTheDocument();
                                expect(react_2.screen.getByText('Competitive Analysis')).toBeInTheDocument();
                                expect(react_2.screen.getByText('Performance Tracking')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        test('should render summary cards with correct data', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        renderWithQueryClient(<page_1.default />);
                        return [4 /*yield*/, (0, react_2.waitFor)(function () {
                                expect(react_2.screen.getByText('5')).toBeInTheDocument(); // totalOptimizations
                                expect(react_2.screen.getByText('3')).toBeInTheDocument(); // activeOptimizations
                                expect(react_2.screen.getByText('12.5%')).toBeInTheDocument(); // averageImprovement
                                expect(react_2.screen.getByText('R$ 150.000')).toBeInTheDocument(); // totalProjectedRevenue
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        test('should render action buttons', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        renderWithQueryClient(<page_1.default />);
                        return [4 /*yield*/, (0, react_2.waitFor)(function () {
                                expect(react_2.screen.getByRole('button', { name: /New Optimization/i })).toBeInTheDocument();
                                expect(react_2.screen.getByRole('button', { name: /Generate Report/i })).toBeInTheDocument();
                                expect(react_2.screen.getByRole('button', { name: /Export Data/i })).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('🔥 Data Fetching', function () {
        test('should fetch optimization data on mount', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        renderWithQueryClient(<page_1.default />);
                        return [4 /*yield*/, (0, react_2.waitFor)(function () {
                                expect(mockFetch).toHaveBeenCalledWith('/api/revenue-optimization?clinicId=clinic-123');
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        test('should display loading state while fetching', function () {
            renderWithQueryClient(<page_1.default />);
            expect(react_2.screen.getByTestId('revenue-optimization-loading')).toBeInTheDocument();
        });
        test('should handle fetch errors gracefully', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockFetch.mockRejectedValueOnce(new Error('API Error'));
                        renderWithQueryClient(<page_1.default />);
                        return [4 /*yield*/, (0, react_2.waitFor)(function () {
                                expect(react_2.screen.getByText(/Failed to load optimization data/)).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        test('should retry failed requests', function () { return __awaiter(void 0, void 0, void 0, function () {
            var retryButton;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockFetch
                            .mockRejectedValueOnce(new Error('Network error'))
                            .mockResolvedValueOnce({
                            ok: true,
                            json: function () { return Promise.resolve(mockOptimizationData); }
                        });
                        renderWithQueryClient(<page_1.default />);
                        return [4 /*yield*/, react_2.screen.findByRole('button', { name: /Retry/i })];
                    case 1:
                        retryButton = _a.sent();
                        react_2.fireEvent.click(retryButton);
                        return [4 /*yield*/, (0, react_2.waitFor)(function () {
                                expect(react_2.screen.getByText('Optimization Overview')).toBeInTheDocument();
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('🔥 Pricing Optimization Section', function () {
        test('should display current pricing strategy', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        renderWithQueryClient(<page_1.default />);
                        return [4 /*yield*/, (0, react_2.waitFor)(function () {
                                expect(react_2.screen.getByText('Dynamic Pricing')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        test('should show pricing recommendations', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        renderWithQueryClient(<page_1.default />);
                        return [4 /*yield*/, (0, react_2.waitFor)(function () {
                                expect(react_2.screen.getByText('Increase service A pricing by 10%')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        test('should display projected increase percentage', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        renderWithQueryClient(<page_1.default />);
                        return [4 /*yield*/, (0, react_2.waitFor)(function () {
                                expect(react_2.screen.getByText('8.5%')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        test('should handle create pricing optimization', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockFetch.mockResolvedValueOnce({
                            ok: true,
                            json: function () { return Promise.resolve({
                                optimization: { id: 'new-opt' },
                                message: 'Optimization created'
                            }); }
                        });
                        renderWithQueryClient(<page_1.default />);
                        return [4 /*yield*/, (0, react_2.waitFor)(function () {
                                var createButton = react_2.screen.getByRole('button', { name: /Create Pricing Optimization/i });
                                react_2.fireEvent.click(createButton);
                            })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, (0, react_2.waitFor)(function () {
                                expect(mockFetch).toHaveBeenCalledWith('/api/revenue-optimization', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        optimizationType: 'pricing',
                                        clinicId: 'clinic-123',
                                        title: 'Pricing Optimization',
                                        description: 'Automatic pricing optimization analysis'
                                    })
                                });
                                expect(sonner_1.toast.success).toHaveBeenCalledWith('Pricing optimization created successfully!');
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('🔥 Service Mix Analysis', function () {
        test('should display profitability gain', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        renderWithQueryClient(<page_1.default />);
                        return [4 /*yield*/, (0, react_2.waitFor)(function () {
                                expect(react_2.screen.getByText('12.3%')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        test('should show service mix recommendations', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        renderWithQueryClient(<page_1.default />);
                        return [4 /*yield*/, (0, react_2.waitFor)(function () {
                                expect(react_2.screen.getByText('Focus on high-margin services')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        test('should handle service mix optimization creation', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockFetch.mockResolvedValueOnce({
                            ok: true,
                            json: function () { return Promise.resolve({
                                optimization: { id: 'new-opt' },
                                message: 'Service mix optimization created'
                            }); }
                        });
                        renderWithQueryClient(<page_1.default />);
                        return [4 /*yield*/, (0, react_2.waitFor)(function () {
                                var createButton = react_2.screen.getByRole('button', { name: /Optimize Service Mix/i });
                                react_2.fireEvent.click(createButton);
                            })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, (0, react_2.waitFor)(function () {
                                expect(mockFetch).toHaveBeenCalledWith('/api/revenue-optimization', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        optimizationType: 'service_mix',
                                        clinicId: 'clinic-123',
                                        title: 'Service Mix Optimization',
                                        description: 'Automatic service mix optimization analysis'
                                    })
                                });
                                expect(sonner_1.toast.success).toHaveBeenCalledWith('Service mix optimization created successfully!');
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('🔥 Customer Lifetime Value', function () {
        test('should display CLV projected increase', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        renderWithQueryClient(<page_1.default />);
                        return [4 /*yield*/, (0, react_2.waitFor)(function () {
                                expect(react_2.screen.getByText('15.7%')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        test('should show enhancement strategies', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        renderWithQueryClient(<page_1.default />);
                        return [4 /*yield*/, (0, react_2.waitFor)(function () {
                                expect(react_2.screen.getByText('Implement loyalty program')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        test('should handle CLV optimization creation', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockFetch.mockResolvedValueOnce({
                            ok: true,
                            json: function () { return Promise.resolve({
                                optimization: { id: 'new-opt' },
                                message: 'CLV optimization created'
                            }); }
                        });
                        renderWithQueryClient(<page_1.default />);
                        return [4 /*yield*/, (0, react_2.waitFor)(function () {
                                var createButton = react_2.screen.getByRole('button', { name: /Enhance CLV/i });
                                react_2.fireEvent.click(createButton);
                            })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, (0, react_2.waitFor)(function () {
                                expect(mockFetch).toHaveBeenCalledWith('/api/revenue-optimization', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        optimizationType: 'clv',
                                        clinicId: 'clinic-123',
                                        title: 'CLV Enhancement',
                                        description: 'Automatic customer lifetime value optimization'
                                    })
                                });
                                expect(sonner_1.toast.success).toHaveBeenCalledWith('CLV optimization created successfully!');
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('🔥 Automated Recommendations', function () {
        test('should display recommendation cards', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        renderWithQueryClient(<page_1.default />);
                        return [4 /*yield*/, (0, react_2.waitFor)(function () {
                                expect(react_2.screen.getByText('Optimize pricing for peak hours')).toBeInTheDocument();
                                expect(react_2.screen.getByText('High Priority')).toBeInTheDocument();
                                expect(react_2.screen.getByText('Expected Impact: 10%')).toBeInTheDocument();
                                expect(react_2.screen.getByText('Effort: medium')).toBeInTheDocument();
                                expect(react_2.screen.getByText('Timeframe: 2 weeks')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        test('should show total projected increase', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        renderWithQueryClient(<page_1.default />);
                        return [4 /*yield*/, (0, react_2.waitFor)(function () {
                                expect(react_2.screen.getByText('25.5%')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        test('should display implementation plan', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        renderWithQueryClient(<page_1.default />);
                        return [4 /*yield*/, (0, react_2.waitFor)(function () {
                                expect(react_2.screen.getByText('Phase 1: Analysis')).toBeInTheDocument();
                                expect(react_2.screen.getByText('Phase 2: Implementation')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        test('should handle generate recommendations', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockFetch.mockResolvedValueOnce({
                            ok: true,
                            json: function () { return Promise.resolve({
                                optimization: { id: 'new-opt' },
                                message: 'Recommendations generated'
                            }); }
                        });
                        renderWithQueryClient(<page_1.default />);
                        return [4 /*yield*/, (0, react_2.waitFor)(function () {
                                var generateButton = react_2.screen.getByRole('button', { name: /Generate New Recommendations/i });
                                react_2.fireEvent.click(generateButton);
                            })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, (0, react_2.waitFor)(function () {
                                expect(mockFetch).toHaveBeenCalledWith('/api/revenue-optimization', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        optimizationType: 'automated',
                                        clinicId: 'clinic-123',
                                        title: 'Automated Recommendations',
                                        description: 'Generate new automated optimization recommendations'
                                    })
                                });
                                expect(sonner_1.toast.success).toHaveBeenCalledWith('New recommendations generated successfully!');
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('🔥 Competitive Analysis', function () {
        test('should display market position', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        renderWithQueryClient(<page_1.default />);
                        return [4 /*yield*/, (0, react_2.waitFor)(function () {
                                expect(react_2.screen.getByText('Strong')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        test('should show opportunity areas', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        renderWithQueryClient(<page_1.default />);
                        return [4 /*yield*/, (0, react_2.waitFor)(function () {
                                expect(react_2.screen.getByText('Expand premium services')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        test('should handle competitive analysis update', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockFetch.mockResolvedValueOnce({
                            ok: true,
                            json: function () { return Promise.resolve({
                                optimization: { id: 'new-opt' },
                                message: 'Competitive analysis updated'
                            }); }
                        });
                        renderWithQueryClient(<page_1.default />);
                        return [4 /*yield*/, (0, react_2.waitFor)(function () {
                                var updateButton = react_2.screen.getByRole('button', { name: /Update Analysis/i });
                                react_2.fireEvent.click(updateButton);
                            })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, (0, react_2.waitFor)(function () {
                                expect(mockFetch).toHaveBeenCalledWith('/api/revenue-optimization', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        optimizationType: 'competitive',
                                        clinicId: 'clinic-123',
                                        title: 'Competitive Analysis Update',
                                        description: 'Update competitive market analysis'
                                    })
                                });
                                expect(sonner_1.toast.success).toHaveBeenCalledWith('Competitive analysis updated successfully!');
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('🔥 Performance Tracking', function () {
        test('should display performance indicators', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        renderWithQueryClient(<page_1.default />);
                        return [4 /*yield*/, (0, react_2.waitFor)(function () {
                                expect(react_2.screen.getByText('1.2')).toBeInTheDocument(); // overallROI
                                expect(react_2.screen.getByText('80%')).toBeInTheDocument(); // successRate
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        test('should show trend analysis', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        renderWithQueryClient(<page_1.default />);
                        return [4 /*yield*/, (0, react_2.waitFor)(function () {
                                expect(react_2.screen.getByText('2 Improving')).toBeInTheDocument();
                                expect(react_2.screen.getByText('1 Declining')).toBeInTheDocument();
                                expect(react_2.screen.getByText('3 Stable')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        test('should display performance recommendations', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        renderWithQueryClient(<page_1.default />);
                        return [4 /*yield*/, (0, react_2.waitFor)(function () {
                                expect(react_2.screen.getByText('Monitor competitive pricing')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('🔥 User Interactions', function () {
        test('should handle new optimization creation', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        renderWithQueryClient(<page_1.default />);
                        return [4 /*yield*/, (0, react_2.waitFor)(function () {
                                var newOptButton = react_2.screen.getByRole('button', { name: /New Optimization/i });
                                react_2.fireEvent.click(newOptButton);
                            })];
                    case 1:
                        _a.sent();
                        // Should open optimization creation modal or navigate
                        expect(react_2.screen.getByTestId('optimization-creation-modal')).toBeInTheDocument();
                        return [2 /*return*/];
                }
            });
        }); });
        test('should handle report generation', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockFetch.mockResolvedValueOnce({
                            ok: true,
                            blob: function () { return Promise.resolve(new Blob(['report data'], { type: 'application/pdf' })); }
                        });
                        renderWithQueryClient(<page_1.default />);
                        return [4 /*yield*/, (0, react_2.waitFor)(function () {
                                var reportButton = react_2.screen.getByRole('button', { name: /Generate Report/i });
                                react_2.fireEvent.click(reportButton);
                            })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, (0, react_2.waitFor)(function () {
                                expect(sonner_1.toast.success).toHaveBeenCalledWith('Report generated successfully!');
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        test('should handle data export', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockFetch.mockResolvedValueOnce({
                            ok: true,
                            blob: function () { return Promise.resolve(new Blob(['csv data'], { type: 'text/csv' })); }
                        });
                        renderWithQueryClient(<page_1.default />);
                        return [4 /*yield*/, (0, react_2.waitFor)(function () {
                                var exportButton = react_2.screen.getByRole('button', { name: /Export Data/i });
                                react_2.fireEvent.click(exportButton);
                            })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, (0, react_2.waitFor)(function () {
                                expect(sonner_1.toast.success).toHaveBeenCalledWith('Data exported successfully!');
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        test('should handle refresh data', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        renderWithQueryClient(<page_1.default />);
                        return [4 /*yield*/, (0, react_2.waitFor)(function () {
                                var refreshButton = react_2.screen.getByRole('button', { name: /Refresh/i });
                                react_2.fireEvent.click(refreshButton);
                            })];
                    case 1:
                        _a.sent();
                        // Should trigger data refetch
                        expect(mockFetch).toHaveBeenCalledTimes(2); // Initial load + refresh
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('🔥 Error Handling', function () {
        test('should handle API errors during optimization creation', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockFetch.mockResolvedValueOnce({
                            ok: false,
                            status: 500,
                            json: function () { return Promise.resolve({ error: 'Server error' }); }
                        });
                        renderWithQueryClient(<page_1.default />);
                        return [4 /*yield*/, (0, react_2.waitFor)(function () {
                                var createButton = react_2.screen.getByRole('button', { name: /Create Pricing Optimization/i });
                                react_2.fireEvent.click(createButton);
                            })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, (0, react_2.waitFor)(function () {
                                expect(sonner_1.toast.error).toHaveBeenCalledWith('Failed to create optimization. Please try again.');
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        test('should handle network errors gracefully', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockFetch.mockRejectedValueOnce(new Error('Network error'));
                        renderWithQueryClient(<page_1.default />);
                        return [4 /*yield*/, (0, react_2.waitFor)(function () {
                                expect(react_2.screen.getByText(/Failed to load optimization data/)).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        test('should handle unauthorized access', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockFetch.mockResolvedValueOnce({
                            ok: false,
                            status: 401,
                            json: function () { return Promise.resolve({ error: 'Unauthorized' }); }
                        });
                        renderWithQueryClient(<page_1.default />);
                        return [4 /*yield*/, (0, react_2.waitFor)(function () {
                                expect(react_2.screen.getByText(/Authentication required/)).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('🔥 Responsive Design', function () {
        test('should be responsive on mobile devices', function () {
            // Mock mobile viewport
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 375
            });
            renderWithQueryClient(<page_1.default />);
            var container = react_2.screen.getByTestId('revenue-optimization-container');
            expect(container).toHaveClass('responsive-layout');
        });
        test('should stack cards vertically on small screens', function () {
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 640
            });
            renderWithQueryClient(<page_1.default />);
            var cardsContainer = react_2.screen.getByTestId('optimization-cards');
            expect(cardsContainer).toHaveClass('flex-col', 'sm:flex-row');
        });
    });
    describe('🔥 Accessibility', function () {
        test('should have proper ARIA labels', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        renderWithQueryClient(<page_1.default />);
                        return [4 /*yield*/, (0, react_2.waitFor)(function () {
                                expect(react_2.screen.getByLabelText('Revenue optimization overview')).toBeInTheDocument();
                                expect(react_2.screen.getByLabelText('Pricing optimization section')).toBeInTheDocument();
                                expect(react_2.screen.getByLabelText('Service mix analysis section')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        test('should support keyboard navigation', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        renderWithQueryClient(<page_1.default />);
                        return [4 /*yield*/, (0, react_2.waitFor)(function () {
                                var firstButton = react_2.screen.getByRole('button', { name: /New Optimization/i });
                                firstButton.focus();
                                expect(firstButton).toHaveFocus();
                                // Tab to next button
                                react_2.fireEvent.keyDown(firstButton, { key: 'Tab' });
                                var secondButton = react_2.screen.getByRole('button', { name: /Generate Report/i });
                                expect(secondButton).toHaveFocus();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        test('should have sufficient color contrast', function () {
            renderWithQueryClient(<page_1.default />);
            var headings = react_2.screen.getAllByRole('heading');
            headings.forEach(function (heading) {
                var styles = window.getComputedStyle(heading);
                // Basic contrast check (implementation would need actual color analysis)
                expect(styles.color).not.toBe(styles.backgroundColor);
            });
        });
    });
});

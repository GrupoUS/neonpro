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
var react_1 = require("@testing-library/react");
var react_query_1 = require("@tanstack/react-query");
var analytics_dashboard_1 = require("@/components/dashboard/analytics-dashboard");
// Mock the recharts library
globals_1.jest.mock('recharts', function () { return ({
    ResponsiveContainer: function (_a) {
        var children = _a.children;
        return (<div data-testid="responsive-container">{children}</div>);
    },
    LineChart: function (_a) {
        var children = _a.children;
        return (<div data-testid="line-chart">{children}</div>);
    },
    BarChart: function (_a) {
        var children = _a.children;
        return (<div data-testid="bar-chart">{children}</div>);
    },
    PieChart: function (_a) {
        var children = _a.children;
        return (<div data-testid="pie-chart">{children}</div>);
    },
    Line: function () { return <div data-testid="line"/>; },
    Bar: function () { return <div data-testid="bar"/>; },
    Cell: function () { return <div data-testid="cell"/>; },
    XAxis: function () { return <div data-testid="x-axis"/>; },
    YAxis: function () { return <div data-testid="y-axis"/>; },
    CartesianGrid: function () { return <div data-testid="cartesian-grid"/>; },
    Tooltip: function () { return <div data-testid="tooltip"/>; },
    Legend: function () { return <div data-testid="legend"/>; },
    Pie: function () { return <div data-testid="pie"/>; }
}); });
// Mock date-fns
globals_1.jest.mock('date-fns', function () { return ({
    format: globals_1.jest.fn(function (date, formatStr) {
        if (formatStr === 'MMM yyyy')
            return 'Jan 2024';
        if (formatStr === 'dd/MM/yyyy')
            return '01/01/2024';
        return '2024-01-01';
    }),
    subMonths: globals_1.jest.fn(function () { return new Date('2023-12-01'); }),
    startOfMonth: globals_1.jest.fn(function () { return new Date('2024-01-01'); }),
    endOfMonth: globals_1.jest.fn(function () { return new Date('2024-01-31'); }),
    parseISO: globals_1.jest.fn(function (dateStr) { return new Date(dateStr); })
}); });
// Mock analytics service
globals_1.jest.mock('@/lib/analytics/service', function () { return ({
    analyticsService: {
        getDashboardMetrics: globals_1.jest.fn(),
        getSubscriptionTrends: globals_1.jest.fn(),
        getTrialMetrics: globals_1.jest.fn(),
        getRevenueAnalytics: globals_1.jest.fn()
    }
}); });
// Mock UI components
globals_1.jest.mock('@/components/ui/card', function () { return ({
    Card: function (_a) {
        var children = _a.children, className = _a.className;
        return (<div data-testid="card" className={className}>{children}</div>);
    },
    CardHeader: function (_a) {
        var children = _a.children;
        return (<div data-testid="card-header">{children}</div>);
    },
    CardTitle: function (_a) {
        var children = _a.children;
        return (<h3 data-testid="card-title">{children}</h3>);
    },
    CardContent: function (_a) {
        var children = _a.children;
        return (<div data-testid="card-content">{children}</div>);
    }
}); });
globals_1.jest.mock('@/components/ui/button', function () { return ({
    Button: function (_a) {
        var children = _a.children, onClick = _a.onClick, variant = _a.variant, size = _a.size;
        return (<button data-testid="button" onClick={onClick} data-variant={variant} data-size={size}>
      {children}
    </button>);
    }
}); });
globals_1.jest.mock('@/components/ui/select', function () { return ({
    Select: function (_a) {
        var children = _a.children, onValueChange = _a.onValueChange;
        return (<div data-testid="select" data-onchange={onValueChange}>{children}</div>);
    },
    SelectContent: function (_a) {
        var children = _a.children;
        return (<div data-testid="select-content">{children}</div>);
    },
    SelectItem: function (_a) {
        var children = _a.children, value = _a.value;
        return (<div data-testid="select-item" data-value={value}>{children}</div>);
    },
    SelectTrigger: function (_a) {
        var children = _a.children;
        return (<div data-testid="select-trigger">{children}</div>);
    },
    SelectValue: function (_a) {
        var placeholder = _a.placeholder;
        return (<div data-testid="select-value">{placeholder}</div>);
    }
}); });
var analyticsService = require('@/lib/analytics/service').analyticsService;
(0, globals_1.describe)('AnalyticsDashboard Component', function () {
    var queryClient;
    (0, globals_1.beforeEach)(function () {
        queryClient = new react_query_1.QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                },
            },
        });
        // Reset all mocks
        globals_1.jest.clearAllMocks();
    });
    (0, globals_1.afterEach)(function () {
        queryClient.clear();
    });
    var renderWithQueryClient = function (component) {
        return (0, react_1.render)(<react_query_1.QueryClientProvider client={queryClient}>
        {component}
      </react_query_1.QueryClientProvider>);
    };
    (0, globals_1.describe)('rendering and layout', function () {
        (0, globals_1.test)('should render dashboard with all metric cards', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockMetrics;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockMetrics = {
                            subscriptionMetrics: {
                                totalSubscriptions: 150,
                                activeSubscriptions: 125,
                                mrr: 15000,
                                arr: 180000,
                                churnRate: 0.05,
                                growthRate: 0.12
                            },
                            trialMetrics: {
                                totalTrials: 500,
                                activeTrials: 150,
                                conversionRate: 0.25
                            },
                            revenueMetrics: {
                                totalRevenue: 180000,
                                monthlyGrowth: 0.12
                            }
                        };
                        analyticsService.getDashboardMetrics.mockResolvedValue(mockMetrics);
                        // Act
                        renderWithQueryClient(<analytics_dashboard_1.default />);
                        // Assert
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                (0, globals_1.expect)(react_1.screen.getByText('Analytics Dashboard')).toBeInTheDocument();
                                (0, globals_1.expect)(react_1.screen.getByText('150')).toBeInTheDocument(); // Total subscriptions
                                (0, globals_1.expect)(react_1.screen.getByText('125')).toBeInTheDocument(); // Active subscriptions
                                (0, globals_1.expect)(react_1.screen.getByText('$15,000')).toBeInTheDocument(); // MRR
                                (0, globals_1.expect)(react_1.screen.getByText('$180,000')).toBeInTheDocument(); // ARR
                            })];
                    case 1:
                        // Assert
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.test)('should display loading state initially', function () {
            // Arrange
            analyticsService.getDashboardMetrics.mockImplementation(function () { return new Promise(function () { }); } // Never resolves
            );
            // Act
            renderWithQueryClient(<analytics_dashboard_1.default />);
            // Assert
            (0, globals_1.expect)(react_1.screen.getByText('Loading...')).toBeInTheDocument();
            (0, globals_1.expect)(react_1.screen.getByTestId('loading-spinner')).toBeInTheDocument();
        });
        (0, globals_1.test)('should display error state when data fetch fails', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Arrange
                        analyticsService.getDashboardMetrics.mockRejectedValue(new Error('Failed to fetch data'));
                        // Act
                        renderWithQueryClient(<analytics_dashboard_1.default />);
                        // Assert
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                (0, globals_1.expect)(react_1.screen.getByText('Error loading analytics data')).toBeInTheDocument();
                                (0, globals_1.expect)(react_1.screen.getByText('Failed to fetch data')).toBeInTheDocument();
                                (0, globals_1.expect)(react_1.screen.getByText('Retry')).toBeInTheDocument();
                            })];
                    case 1:
                        // Assert
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.test)('should render charts when data is available', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockMetrics;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockMetrics = {
                            subscriptionMetrics: {
                                totalSubscriptions: 150,
                                activeSubscriptions: 125,
                                mrr: 15000,
                                arr: 180000,
                                churnRate: 0.05,
                                growthRate: 0.12
                            },
                            chartData: {
                                subscriptionTrends: [
                                    { month: 'Jan', subscriptions: 100, revenue: 10000 },
                                    { month: 'Feb', subscriptions: 125, revenue: 12500 },
                                    { month: 'Mar', subscriptions: 150, revenue: 15000 }
                                ]
                            }
                        };
                        analyticsService.getDashboardMetrics.mockResolvedValue(mockMetrics);
                        // Act
                        renderWithQueryClient(<analytics_dashboard_1.default />);
                        // Assert
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                (0, globals_1.expect)(react_1.screen.getByTestId('line-chart')).toBeInTheDocument();
                                (0, globals_1.expect)(react_1.screen.getByTestId('bar-chart')).toBeInTheDocument();
                                (0, globals_1.expect)(react_1.screen.getByTestId('pie-chart')).toBeInTheDocument();
                            })];
                    case 1:
                        // Assert
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, globals_1.describe)('user interactions', function () {
        (0, globals_1.test)('should update date range when period selector changes', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockMetrics, periodSelector, lastMonthOption;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockMetrics = {
                            subscriptionMetrics: {
                                totalSubscriptions: 150,
                                activeSubscriptions: 125,
                                mrr: 15000
                            }
                        };
                        analyticsService.getDashboardMetrics.mockResolvedValue(mockMetrics);
                        renderWithQueryClient(<analytics_dashboard_1.default />);
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                (0, globals_1.expect)(react_1.screen.getByTestId('select')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        periodSelector = react_1.screen.getByTestId('select-trigger');
                        react_1.fireEvent.click(periodSelector);
                        lastMonthOption = react_1.screen.getByText('Last Month');
                        react_1.fireEvent.click(lastMonthOption);
                        // Assert
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                (0, globals_1.expect)(analyticsService.getDashboardMetrics).toHaveBeenCalledWith({
                                    period: 'last_month',
                                    startDate: globals_1.expect.any(Date),
                                    endDate: globals_1.expect.any(Date)
                                });
                            })];
                    case 2:
                        // Assert
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.test)('should refresh data when refresh button is clicked', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockMetrics, refreshButton;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockMetrics = {
                            subscriptionMetrics: {
                                totalSubscriptions: 150,
                                activeSubscriptions: 125,
                                mrr: 15000
                            }
                        };
                        analyticsService.getDashboardMetrics.mockResolvedValue(mockMetrics);
                        renderWithQueryClient(<analytics_dashboard_1.default />);
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                (0, globals_1.expect)(react_1.screen.getByText('Refresh')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        // Clear previous calls
                        analyticsService.getDashboardMetrics.mockClear();
                        refreshButton = react_1.screen.getByText('Refresh');
                        react_1.fireEvent.click(refreshButton);
                        // Assert
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                (0, globals_1.expect)(analyticsService.getDashboardMetrics).toHaveBeenCalledTimes(1);
                            })];
                    case 2:
                        // Assert
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.test)('should retry data fetch when retry button is clicked', function () { return __awaiter(void 0, void 0, void 0, function () {
            var retryButton;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Arrange
                        analyticsService.getDashboardMetrics
                            .mockRejectedValueOnce(new Error('Network error'))
                            .mockResolvedValueOnce({
                            subscriptionMetrics: {
                                totalSubscriptions: 150,
                                activeSubscriptions: 125,
                                mrr: 15000
                            }
                        });
                        renderWithQueryClient(<analytics_dashboard_1.default />);
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                (0, globals_1.expect)(react_1.screen.getByText('Retry')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        retryButton = react_1.screen.getByText('Retry');
                        react_1.fireEvent.click(retryButton);
                        // Assert
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                (0, globals_1.expect)(react_1.screen.getByText('150')).toBeInTheDocument();
                                (0, globals_1.expect)(analyticsService.getDashboardMetrics).toHaveBeenCalledTimes(2);
                            })];
                    case 2:
                        // Assert
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.test)('should toggle chart view when view selector changes', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockMetrics, chartTypeButton;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockMetrics = {
                            subscriptionMetrics: {
                                totalSubscriptions: 150,
                                activeSubscriptions: 125,
                                mrr: 15000
                            },
                            chartData: {
                                subscriptionTrends: []
                            }
                        };
                        analyticsService.getDashboardMetrics.mockResolvedValue(mockMetrics);
                        renderWithQueryClient(<analytics_dashboard_1.default />);
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                (0, globals_1.expect)(react_1.screen.getByTestId('line-chart')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        chartTypeButton = react_1.screen.getByText('Bar Chart');
                        react_1.fireEvent.click(chartTypeButton);
                        // Assert
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                (0, globals_1.expect)(react_1.screen.getByTestId('bar-chart')).toBeInTheDocument();
                            })];
                    case 2:
                        // Assert
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, globals_1.describe)('data formatting and display', function () {
        (0, globals_1.test)('should format currency values correctly', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockMetrics;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockMetrics = {
                            subscriptionMetrics: {
                                totalSubscriptions: 150,
                                activeSubscriptions: 125,
                                mrr: 15000,
                                arr: 180000
                            },
                            revenueMetrics: {
                                totalRevenue: 2500000 // $2.5M
                            }
                        };
                        analyticsService.getDashboardMetrics.mockResolvedValue(mockMetrics);
                        // Act
                        renderWithQueryClient(<analytics_dashboard_1.default />);
                        // Assert
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                (0, globals_1.expect)(react_1.screen.getByText('$15,000')).toBeInTheDocument(); // MRR
                                (0, globals_1.expect)(react_1.screen.getByText('$180,000')).toBeInTheDocument(); // ARR
                                (0, globals_1.expect)(react_1.screen.getByText('$2,500,000')).toBeInTheDocument(); // Total revenue
                            })];
                    case 1:
                        // Assert
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.test)('should format percentage values correctly', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockMetrics;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockMetrics = {
                            subscriptionMetrics: {
                                totalSubscriptions: 150,
                                churnRate: 0.0534, // 5.34%
                                growthRate: 0.1256 // 12.56%
                            },
                            trialMetrics: {
                                conversionRate: 0.2489 // 24.89%
                            }
                        };
                        analyticsService.getDashboardMetrics.mockResolvedValue(mockMetrics);
                        // Act
                        renderWithQueryClient(<analytics_dashboard_1.default />);
                        // Assert
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                (0, globals_1.expect)(react_1.screen.getByText('5.34%')).toBeInTheDocument(); // Churn rate
                                (0, globals_1.expect)(react_1.screen.getByText('12.56%')).toBeInTheDocument(); // Growth rate
                                (0, globals_1.expect)(react_1.screen.getByText('24.89%')).toBeInTheDocument(); // Conversion rate
                            })];
                    case 1:
                        // Assert
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.test)('should display trend indicators', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockMetrics;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockMetrics = {
                            subscriptionMetrics: {
                                totalSubscriptions: 150,
                                subscriptionsTrend: 0.12, // +12%
                                mrrTrend: -0.05 // -5%
                            }
                        };
                        analyticsService.getDashboardMetrics.mockResolvedValue(mockMetrics);
                        // Act
                        renderWithQueryClient(<analytics_dashboard_1.default />);
                        // Assert
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                (0, globals_1.expect)(react_1.screen.getByTestId('trend-up')).toBeInTheDocument();
                                (0, globals_1.expect)(react_1.screen.getByTestId('trend-down')).toBeInTheDocument();
                                (0, globals_1.expect)(react_1.screen.getByText('+12%')).toBeInTheDocument();
                                (0, globals_1.expect)(react_1.screen.getByText('-5%')).toBeInTheDocument();
                            })];
                    case 1:
                        // Assert
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, globals_1.describe)('responsive behavior', function () {
        (0, globals_1.test)('should adapt to mobile viewport', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockMetrics;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Arrange
                        Object.defineProperty(window, 'innerWidth', {
                            writable: true,
                            configurable: true,
                            value: 375,
                        });
                        mockMetrics = {
                            subscriptionMetrics: {
                                totalSubscriptions: 150,
                                activeSubscriptions: 125,
                                mrr: 15000
                            }
                        };
                        analyticsService.getDashboardMetrics.mockResolvedValue(mockMetrics);
                        // Act
                        renderWithQueryClient(<analytics_dashboard_1.default />);
                        // Assert
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                var dashboard = react_1.screen.getByTestId('analytics-dashboard');
                                (0, globals_1.expect)(dashboard).toHaveClass('mobile-layout');
                            })];
                    case 1:
                        // Assert
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.test)('should show/hide detailed metrics based on screen size', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockMetrics;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Arrange
                        Object.defineProperty(window, 'innerWidth', {
                            writable: true,
                            configurable: true,
                            value: 768,
                        });
                        mockMetrics = {
                            subscriptionMetrics: {
                                totalSubscriptions: 150,
                                activeSubscriptions: 125,
                                mrr: 15000,
                                detailedMetrics: {
                                    averageSubscriptionValue: 120,
                                    lifetimeValue: 1200
                                }
                            }
                        };
                        analyticsService.getDashboardMetrics.mockResolvedValue(mockMetrics);
                        // Act
                        renderWithQueryClient(<analytics_dashboard_1.default />);
                        // Assert
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                // Detailed metrics should be hidden on smaller screens
                                (0, globals_1.expect)(react_1.screen.queryByText('Average Subscription Value')).not.toBeInTheDocument();
                                (0, globals_1.expect)(react_1.screen.queryByText('Customer Lifetime Value')).not.toBeInTheDocument();
                            })];
                    case 1:
                        // Assert
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, globals_1.describe)('accessibility', function () {
        (0, globals_1.test)('should have proper ARIA labels and roles', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockMetrics;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockMetrics = {
                            subscriptionMetrics: {
                                totalSubscriptions: 150,
                                activeSubscriptions: 125,
                                mrr: 15000
                            }
                        };
                        analyticsService.getDashboardMetrics.mockResolvedValue(mockMetrics);
                        // Act
                        renderWithQueryClient(<analytics_dashboard_1.default />);
                        // Assert
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                (0, globals_1.expect)(react_1.screen.getByRole('main', { name: 'Analytics Dashboard' })).toBeInTheDocument();
                                (0, globals_1.expect)(react_1.screen.getByRole('region', { name: 'Subscription Metrics' })).toBeInTheDocument();
                                (0, globals_1.expect)(react_1.screen.getByRole('region', { name: 'Trial Metrics' })).toBeInTheDocument();
                                (0, globals_1.expect)(react_1.screen.getByRole('region', { name: 'Revenue Charts' })).toBeInTheDocument();
                            })];
                    case 1:
                        // Assert
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.test)('should support keyboard navigation', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockMetrics, refreshButton;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockMetrics = {
                            subscriptionMetrics: {
                                totalSubscriptions: 150,
                                activeSubscriptions: 125,
                                mrr: 15000
                            }
                        };
                        analyticsService.getDashboardMetrics.mockResolvedValue(mockMetrics);
                        renderWithQueryClient(<analytics_dashboard_1.default />);
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                (0, globals_1.expect)(react_1.screen.getByText('Refresh')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        refreshButton = react_1.screen.getByText('Refresh');
                        refreshButton.focus();
                        // Simulate Tab key press
                        react_1.fireEvent.keyDown(refreshButton, { key: 'Tab', code: 'Tab' });
                        // Assert
                        (0, globals_1.expect)(document.activeElement).not.toBe(refreshButton);
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.test)('should announce data updates to screen readers', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockMetrics, refreshButton;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockMetrics = {
                            subscriptionMetrics: {
                                totalSubscriptions: 150,
                                activeSubscriptions: 125,
                                mrr: 15000
                            }
                        };
                        analyticsService.getDashboardMetrics.mockResolvedValue(mockMetrics);
                        renderWithQueryClient(<analytics_dashboard_1.default />);
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                (0, globals_1.expect)(react_1.screen.getByText('Refresh')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        refreshButton = react_1.screen.getByText('Refresh');
                        react_1.fireEvent.click(refreshButton);
                        // Assert
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                (0, globals_1.expect)(react_1.screen.getByText('Analytics data updated')).toBeInTheDocument();
                                (0, globals_1.expect)(react_1.screen.getByRole('status')).toBeInTheDocument();
                            })];
                    case 2:
                        // Assert
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, globals_1.describe)('performance optimization', function () {
        (0, globals_1.test)('should memoize expensive calculations', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockMetrics;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockMetrics = {
                            subscriptionMetrics: {
                                totalSubscriptions: 150,
                                activeSubscriptions: 125,
                                mrr: 15000
                            },
                            rawData: Array(1000).fill(null).map(function (_, i) { return ({
                                id: i,
                                value: Math.random() * 1000
                            }); })
                        };
                        analyticsService.getDashboardMetrics.mockResolvedValue(mockMetrics);
                        renderWithQueryClient(<analytics_dashboard_1.default />);
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                (0, globals_1.expect)(react_1.screen.getByText('150')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        // Act - Re-render with same data
                        renderWithQueryClient(<analytics_dashboard_1.default />);
                        // Assert - Should not recalculate expensive operations
                        (0, globals_1.expect)(react_1.screen.getByTestId('memoized-calculations')).toBeInTheDocument();
                        return [2 /*return*/];
                }
            });
        }); });
        (0, globals_1.test)('should implement virtual scrolling for large datasets', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockMetrics;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockMetrics = {
                            subscriptionMetrics: {
                                totalSubscriptions: 150,
                                activeSubscriptions: 125,
                                mrr: 15000
                            },
                            detailsList: Array(10000).fill(null).map(function (_, i) { return ({
                                id: i,
                                name: "Subscription ".concat(i),
                                value: Math.random() * 1000
                            }); })
                        };
                        analyticsService.getDashboardMetrics.mockResolvedValue(mockMetrics);
                        // Act
                        renderWithQueryClient(<analytics_dashboard_1.default />);
                        // Assert
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                (0, globals_1.expect)(react_1.screen.getByTestId('virtual-list')).toBeInTheDocument();
                                // Only visible items should be rendered
                                (0, globals_1.expect)(react_1.screen.getAllByTestId('subscription-item')).toHaveLength(10);
                            })];
                    case 1:
                        // Assert
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
});

"use strict";
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
var user_event_1 = require("@testing-library/user-event");
var react_query_1 = require("@tanstack/react-query");
var node_1 = require("msw/node");
var msw_1 = require("msw");
var AnalyticsDashboard_1 = require("@/components/dashboard/AnalyticsDashboard");
var mockData_1 = require("@/../../__tests__/utils/mockData");
// MSW server setup for API mocking
var server = (0, node_1.setupServer)(
// Mock analytics data endpoint
msw_1.rest.get('/api/analytics/data', function (req, res, ctx) {
    return res(ctx.status(200), ctx.json(mockData_1.mockAnalyticsData));
}), 
// Mock export endpoint
msw_1.rest.post('/api/analytics/export', function (req, res, ctx) {
    var format = req.body.format;
    switch (format) {
        case 'pdf':
            return res(ctx.status(200), ctx.set('Content-Type', 'application/pdf'), ctx.set('Content-Disposition', 'attachment; filename="analytics-report.pdf"'), ctx.body('mock-pdf-content'));
        case 'excel':
            return res(ctx.status(200), ctx.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'), ctx.set('Content-Disposition', 'attachment; filename="analytics-report.xlsx"'), ctx.body('mock-excel-content'));
        case 'csv':
            return res(ctx.status(200), ctx.set('Content-Type', 'text/csv'), ctx.set('Content-Disposition', 'attachment; filename="analytics-report.csv"'), ctx.text('Patient,Revenue\n100,10000\n120,12000'));
        default:
            return res(ctx.status(400), ctx.json({ error: 'Invalid format' }));
    }
}), 
// Mock error scenarios
msw_1.rest.get('/api/analytics/data-error', function (req, res, ctx) {
    return res(ctx.status(500), ctx.json({ error: 'Database connection failed' }));
}));
var createWrapper = function () {
    var queryClient = new react_query_1.QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });
    return function (_a) {
        var children = _a.children;
        return (<react_query_1.QueryClientProvider client={queryClient}>
      {children}
    </react_query_1.QueryClientProvider>);
    };
};
// Start server before all tests
beforeAll(function () { return server.listen(); });
// Reset handlers after each test
afterEach(function () { return server.resetHandlers(); });
// Close server after all tests
afterAll(function () { return server.close(); });
describe('Analytics Dashboard Integration', function () {
    it('should load data and export to PDF end-to-end', function () { return __awaiter(void 0, void 0, void 0, function () {
        var user, exportButton;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    user = user_event_1.default.setup();
                    (0, react_1.render)(<AnalyticsDashboard_1.default />, { wrapper: createWrapper() });
                    // Wait for data to load
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            expect(react_1.screen.getByText('1,250')).toBeInTheDocument();
                        })
                        // Verify dashboard displays data correctly
                    ];
                case 1:
                    // Wait for data to load
                    _a.sent();
                    // Verify dashboard displays data correctly
                    expect(react_1.screen.getByText('$125,000')).toBeInTheDocument();
                    expect(react_1.screen.getByText('$100')).toBeInTheDocument();
                    expect(react_1.screen.getByText('25%')).toBeInTheDocument();
                    exportButton = react_1.screen.getByText('Export PDF');
                    return [4 /*yield*/, user.click(exportButton)
                        // Verify export was initiated
                    ];
                case 2:
                    _a.sent();
                    // Verify export was initiated
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            expect(react_1.screen.getByText('Export completed successfully')).toBeInTheDocument();
                        })];
                case 3:
                    // Verify export was initiated
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should handle date range filtering end-to-end', function () { return __awaiter(void 0, void 0, void 0, function () {
        var user, startDateInput, endDateInput, applyButton;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    user = user_event_1.default.setup();
                    // Mock API with date range filtering
                    server.use(msw_1.rest.get('/api/analytics/data', function (req, res, ctx) {
                        var startDate = req.url.searchParams.get('startDate');
                        var endDate = req.url.searchParams.get('endDate');
                        // Return different data based on date range
                        var filteredData = __assign(__assign({}, mockData_1.mockAnalyticsData), { totalPatients: startDate === '2024-02-01' ? 800 : 1250 });
                        return res(ctx.status(200), ctx.json(filteredData));
                    }));
                    (0, react_1.render)(<AnalyticsDashboard_1.default />, { wrapper: createWrapper() });
                    // Wait for initial data
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            expect(react_1.screen.getByText('1,250')).toBeInTheDocument();
                        })
                        // Change date range
                    ];
                case 1:
                    // Wait for initial data
                    _a.sent();
                    startDateInput = react_1.screen.getByLabelText('Start Date');
                    endDateInput = react_1.screen.getByLabelText('End Date');
                    return [4 /*yield*/, user.clear(startDateInput)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, user.type(startDateInput, '2024-02-01')];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, user.clear(endDateInput)];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, user.type(endDateInput, '2024-02-28')
                        // Apply filters
                    ];
                case 5:
                    _a.sent();
                    applyButton = react_1.screen.getByText('Apply Filters');
                    return [4 /*yield*/, user.click(applyButton)
                        // Verify filtered data is displayed
                    ];
                case 6:
                    _a.sent();
                    // Verify filtered data is displayed
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            expect(react_1.screen.getByText('800')).toBeInTheDocument();
                        })];
                case 7:
                    // Verify filtered data is displayed
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should handle API errors gracefully', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Mock API error
                    server.use(msw_1.rest.get('/api/analytics/data', function (req, res, ctx) {
                        return res(ctx.status(500), ctx.json({ error: 'Database connection failed' }));
                    }));
                    (0, react_1.render)(<AnalyticsDashboard_1.default />, { wrapper: createWrapper() });
                    // Wait for error state
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            expect(react_1.screen.getByText('Database connection failed')).toBeInTheDocument();
                        })
                        // Verify error UI is displayed
                    ];
                case 1:
                    // Wait for error state
                    _a.sent();
                    // Verify error UI is displayed
                    expect(react_1.screen.getByTestId('analytics-error')).toBeInTheDocument();
                    expect(react_1.screen.getByText('Retry')).toBeInTheDocument();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should handle export errors', function () { return __awaiter(void 0, void 0, void 0, function () {
        var user, exportButton;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    user = user_event_1.default.setup();
                    // Mock export error
                    server.use(msw_1.rest.post('/api/analytics/export', function (req, res, ctx) {
                        return res(ctx.status(500), ctx.json({ error: 'Export service unavailable' }));
                    }));
                    (0, react_1.render)(<AnalyticsDashboard_1.default />, { wrapper: createWrapper() });
                    // Wait for data to load
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            expect(react_1.screen.getByText('1,250')).toBeInTheDocument();
                        })
                        // Try to export
                    ];
                case 1:
                    // Wait for data to load
                    _a.sent();
                    exportButton = react_1.screen.getByText('Export PDF');
                    return [4 /*yield*/, user.click(exportButton)
                        // Verify error handling
                    ];
                case 2:
                    _a.sent();
                    // Verify error handling
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            expect(react_1.screen.getByText('Export service unavailable')).toBeInTheDocument();
                        })];
                case 3:
                    // Verify error handling
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should handle multiple simultaneous operations', function () { return __awaiter(void 0, void 0, void 0, function () {
        var user, exportPDFButton, exportExcelButton, refreshButton;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    user = user_event_1.default.setup();
                    (0, react_1.render)(<AnalyticsDashboard_1.default />, { wrapper: createWrapper() });
                    // Wait for data to load
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            expect(react_1.screen.getByText('1,250')).toBeInTheDocument();
                        })
                        // Trigger multiple operations simultaneously
                    ];
                case 1:
                    // Wait for data to load
                    _a.sent();
                    exportPDFButton = react_1.screen.getByText('Export PDF');
                    exportExcelButton = react_1.screen.getByText('Export Excel');
                    refreshButton = react_1.screen.getByText('Refresh Data');
                    return [4 /*yield*/, Promise.all([
                            user.click(exportPDFButton),
                            user.click(exportExcelButton),
                            user.click(refreshButton),
                        ])
                        // Verify all operations complete successfully
                    ];
                case 2:
                    _a.sent();
                    // Verify all operations complete successfully
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            expect(react_1.screen.queryByText('Loading...')).not.toBeInTheDocument();
                        })];
                case 3:
                    // Verify all operations complete successfully
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should maintain state during navigation', function () { return __awaiter(void 0, void 0, void 0, function () {
        var user, startDateInput, treatmentFilter, facialOption, applyButton;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    user = user_event_1.default.setup();
                    (0, react_1.render)(<AnalyticsDashboard_1.default />, { wrapper: createWrapper() });
                    startDateInput = react_1.screen.getByLabelText('Start Date');
                    return [4 /*yield*/, user.clear(startDateInput)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, user.type(startDateInput, '2024-02-01')];
                case 2:
                    _a.sent();
                    treatmentFilter = react_1.screen.getByLabelText('Treatments');
                    return [4 /*yield*/, user.click(treatmentFilter)];
                case 3:
                    _a.sent();
                    facialOption = react_1.screen.getByRole('option', { name: 'Facial' });
                    return [4 /*yield*/, user.click(facialOption)
                        // Apply filters
                    ];
                case 4:
                    _a.sent();
                    applyButton = react_1.screen.getByText('Apply Filters');
                    return [4 /*yield*/, user.click(applyButton)
                        // Verify filters are maintained after re-render
                    ];
                case 5:
                    _a.sent();
                    // Verify filters are maintained after re-render
                    expect(startDateInput).toHaveValue('2024-02-01');
                    expect(react_1.screen.getByText('Facial')).toBeInTheDocument();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should handle real-time data updates', function () { return __awaiter(void 0, void 0, void 0, function () {
        var callCount, refreshButton;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    callCount = 0;
                    // Mock API with changing data
                    server.use(msw_1.rest.get('/api/analytics/data', function (req, res, ctx) {
                        callCount++;
                        var data = __assign(__assign({}, mockData_1.mockAnalyticsData), { totalPatients: mockData_1.mockAnalyticsData.totalPatients + callCount * 10 });
                        return res(ctx.status(200), ctx.json(data));
                    }));
                    (0, react_1.render)(<AnalyticsDashboard_1.default />, { wrapper: createWrapper() });
                    // Initial data load
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            expect(react_1.screen.getByText('1,260')).toBeInTheDocument(); // 1250 + 10
                        })
                        // Trigger refresh
                    ];
                case 1:
                    // Initial data load
                    _a.sent();
                    refreshButton = react_1.screen.getByText('Refresh Data');
                    return [4 /*yield*/, user_event_1.default.click(refreshButton)
                        // Verify updated data
                    ];
                case 2:
                    _a.sent();
                    // Verify updated data
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            expect(react_1.screen.getByText('1,270')).toBeInTheDocument(); // 1250 + 20
                        })];
                case 3:
                    // Verify updated data
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should handle offline/network errors', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Mock network error
                    server.use(msw_1.rest.get('/api/analytics/data', function (req, res, ctx) {
                        return res.networkError('Network connection failed');
                    }));
                    (0, react_1.render)(<AnalyticsDashboard_1.default />, { wrapper: createWrapper() });
                    // Wait for error state
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            expect(react_1.screen.getByText(/network/i)).toBeInTheDocument();
                        })
                        // Verify offline UI
                    ];
                case 1:
                    // Wait for error state
                    _a.sent();
                    // Verify offline UI
                    expect(react_1.screen.getByTestId('offline-indicator')).toBeInTheDocument();
                    return [2 /*return*/];
            }
        });
    }); });
});

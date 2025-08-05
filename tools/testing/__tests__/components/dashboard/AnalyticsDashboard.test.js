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
var react_1 = require("@testing-library/react");
var user_event_1 = require("@testing-library/user-event");
var react_query_1 = require("@tanstack/react-query");
var AnalyticsDashboard_1 = require("@/components/dashboard/AnalyticsDashboard");
var mockData_1 = require("@/../../__tests__/utils/mockData");
// Mock Recharts components
jest.mock('recharts', function () { return ({
    LineChart: function (_a) {
        var children = _a.children;
        return <div data-testid="line-chart">{children}</div>;
    },
    BarChart: function (_a) {
        var children = _a.children;
        return <div data-testid="bar-chart">{children}</div>;
    },
    PieChart: function (_a) {
        var children = _a.children;
        return <div data-testid="pie-chart">{children}</div>;
    },
    Line: function () { return <div data-testid="line"/>; },
    Bar: function () { return <div data-testid="bar"/>; },
    Cell: function () { return <div data-testid="cell"/>; },
    XAxis: function () { return <div data-testid="x-axis"/>; },
    YAxis: function () { return <div data-testid="y-axis"/>; },
    CartesianGrid: function () { return <div data-testid="cartesian-grid"/>; },
    Tooltip: function () { return <div data-testid="tooltip"/>; },
    Legend: function () { return <div data-testid="legend"/>; },
    ResponsiveContainer: function (_a) {
        var children = _a.children;
        return <div data-testid="responsive-container">{children}</div>;
    },
}); });
// Mock hooks
jest.mock('@/hooks/analytics/useAnalyticsData', function () { return ({
    useAnalyticsData: jest.fn(),
}); });
jest.mock('@/hooks/analytics/useExportData', function () { return ({
    useExportData: jest.fn(),
}); });
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
describe('AnalyticsDashboard', function () {
    var mockUseAnalyticsData = require('@/hooks/analytics/useAnalyticsData').useAnalyticsData;
    var mockUseExportData = require('@/hooks/analytics/useExportData').useExportData;
    beforeEach(function () {
        mockUseAnalyticsData.mockReturnValue({
            data: mockData_1.mockAnalyticsData,
            isLoading: false,
            isError: false,
            error: null,
        });
        mockUseExportData.mockReturnValue({
            exportToPDF: jest.fn(),
            exportToExcel: jest.fn(),
            exportToCSV: jest.fn(),
            isExporting: false,
            exportError: null,
        });
    });
    afterEach(function () {
        jest.clearAllMocks();
    });
    it('should render dashboard with analytics data', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            (0, react_1.render)(<AnalyticsDashboard_1.default />, { wrapper: createWrapper() });
            // Check if key metrics are displayed
            expect(react_1.screen.getByText('1,250')).toBeInTheDocument(); // totalPatients
            expect(react_1.screen.getByText('$125,000')).toBeInTheDocument(); // totalRevenue
            expect(react_1.screen.getByText('$100')).toBeInTheDocument(); // averageTicket
            expect(react_1.screen.getByText('25%')).toBeInTheDocument(); // conversionRate
            // Check if charts are rendered
            expect(react_1.screen.getByTestId('line-chart')).toBeInTheDocument();
            expect(react_1.screen.getByTestId('bar-chart')).toBeInTheDocument();
            expect(react_1.screen.getByTestId('pie-chart')).toBeInTheDocument();
            return [2 /*return*/];
        });
    }); });
    it('should show loading state', function () {
        mockUseAnalyticsData.mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
            error: null,
        });
        (0, react_1.render)(<AnalyticsDashboard_1.default />, { wrapper: createWrapper() });
        expect(react_1.screen.getByTestId('analytics-loading')).toBeInTheDocument();
        expect(react_1.screen.getByText('Loading analytics...')).toBeInTheDocument();
    });
    it('should show error state', function () {
        mockUseAnalyticsData.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
            error: new Error('Failed to load analytics'),
        });
        (0, react_1.render)(<AnalyticsDashboard_1.default />, { wrapper: createWrapper() });
        expect(react_1.screen.getByTestId('analytics-error')).toBeInTheDocument();
        expect(react_1.screen.getByText('Failed to load analytics')).toBeInTheDocument();
    });
    it('should handle export to PDF', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockExportToPDF, user, exportButton;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockExportToPDF = jest.fn();
                    mockUseExportData.mockReturnValue({
                        exportToPDF: mockExportToPDF,
                        exportToExcel: jest.fn(),
                        exportToCSV: jest.fn(),
                        isExporting: false,
                        exportError: null,
                    });
                    user = user_event_1.default.setup();
                    (0, react_1.render)(<AnalyticsDashboard_1.default />, { wrapper: createWrapper() });
                    exportButton = react_1.screen.getByText('Export PDF');
                    return [4 /*yield*/, user.click(exportButton)];
                case 1:
                    _a.sent();
                    expect(mockExportToPDF).toHaveBeenCalledWith(expect.objectContaining({
                        data: mockData_1.mockAnalyticsData,
                        title: expect.stringContaining('Analytics Report'),
                    }));
                    return [2 /*return*/];
            }
        });
    }); });
    it('should handle date range filter changes', function () { return __awaiter(void 0, void 0, void 0, function () {
        var user, startDateInput, endDateInput, applyButton;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    user = user_event_1.default.setup();
                    (0, react_1.render)(<AnalyticsDashboard_1.default />, { wrapper: createWrapper() });
                    startDateInput = react_1.screen.getByLabelText('Start Date');
                    endDateInput = react_1.screen.getByLabelText('End Date');
                    return [4 /*yield*/, user.clear(startDateInput)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, user.type(startDateInput, '2024-02-01')];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, user.clear(endDateInput)];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, user.type(endDateInput, '2024-02-28')
                        // Apply filters
                    ];
                case 4:
                    _a.sent();
                    applyButton = react_1.screen.getByText('Apply Filters');
                    return [4 /*yield*/, user.click(applyButton)
                        // Verify hook was called with new filters
                    ];
                case 5:
                    _a.sent();
                    // Verify hook was called with new filters
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            expect(mockUseAnalyticsData).toHaveBeenCalledWith(expect.objectContaining({
                                dateRange: { start: '2024-02-01', end: '2024-02-28' },
                            }));
                        })];
                case 6:
                    // Verify hook was called with new filters
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should handle treatment filter changes', function () { return __awaiter(void 0, void 0, void 0, function () {
        var user, treatmentFilter, facialOption, botoxOption, applyButton;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    user = user_event_1.default.setup();
                    (0, react_1.render)(<AnalyticsDashboard_1.default />, { wrapper: createWrapper() });
                    treatmentFilter = react_1.screen.getByLabelText('Treatments');
                    return [4 /*yield*/, user.click(treatmentFilter)
                        // Select treatments
                    ];
                case 1:
                    _a.sent();
                    facialOption = react_1.screen.getByRole('option', { name: 'Facial' });
                    botoxOption = react_1.screen.getByRole('option', { name: 'Botox' });
                    return [4 /*yield*/, user.click(facialOption)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, user.click(botoxOption)
                        // Apply filters
                    ];
                case 3:
                    _a.sent();
                    applyButton = react_1.screen.getByText('Apply Filters');
                    return [4 /*yield*/, user.click(applyButton)
                        // Verify hook was called with selected treatments
                    ];
                case 4:
                    _a.sent();
                    // Verify hook was called with selected treatments
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            expect(mockUseAnalyticsData).toHaveBeenCalledWith(expect.objectContaining({
                                treatments: ['facial', 'botox'],
                            }));
                        })];
                case 5:
                    // Verify hook was called with selected treatments
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should show export loading state', function () {
        mockUseExportData.mockReturnValue({
            exportToPDF: jest.fn(),
            exportToExcel: jest.fn(),
            exportToCSV: jest.fn(),
            isExporting: true,
            exportError: null,
        });
        (0, react_1.render)(<AnalyticsDashboard_1.default />, { wrapper: createWrapper() });
        expect(react_1.screen.getByText('Exporting...')).toBeInTheDocument();
        expect(react_1.screen.getByRole('button', { name: 'Export PDF' })).toBeDisabled();
    });
    it('should display export error', function () {
        mockUseExportData.mockReturnValue({
            exportToPDF: jest.fn(),
            exportToExcel: jest.fn(),
            exportToCSV: jest.fn(),
            isExporting: false,
            exportError: new Error('Export failed'),
        });
        (0, react_1.render)(<AnalyticsDashboard_1.default />, { wrapper: createWrapper() });
        expect(react_1.screen.getByText('Export failed')).toBeInTheDocument();
        expect(react_1.screen.getByTestId('export-error-alert')).toBeInTheDocument();
    });
    it('should be accessible', function () { return __awaiter(void 0, void 0, void 0, function () {
        var exportButton;
        return __generator(this, function (_a) {
            (0, react_1.render)(<AnalyticsDashboard_1.default />, { wrapper: createWrapper() });
            // Check for proper headings hierarchy
            expect(react_1.screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
            expect(react_1.screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
            // Check for proper labels
            expect(react_1.screen.getByLabelText('Start Date')).toBeInTheDocument();
            expect(react_1.screen.getByLabelText('End Date')).toBeInTheDocument();
            expect(react_1.screen.getByLabelText('Treatments')).toBeInTheDocument();
            exportButton = react_1.screen.getByRole('button', { name: 'Export PDF' });
            expect(exportButton).toHaveAttribute('tabindex', '0');
            return [2 /*return*/];
        });
    }); });
    it('should handle responsive design', function () {
        // Mock window.matchMedia for mobile viewport
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: jest.fn().mockImplementation(function (query) { return ({
                matches: query === '(max-width: 768px)',
                media: query,
                onchange: null,
                addListener: jest.fn(),
                removeListener: jest.fn(),
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                dispatchEvent: jest.fn(),
            }); }),
        });
        (0, react_1.render)(<AnalyticsDashboard_1.default />, { wrapper: createWrapper() });
        // Check mobile-specific elements
        expect(react_1.screen.getByTestId('mobile-dashboard')).toBeInTheDocument();
        expect(react_1.screen.getByTestId('responsive-container')).toBeInTheDocument();
    });
});

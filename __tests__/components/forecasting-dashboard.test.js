/**
 * Demand Forecasting Dashboard Tests - Story 11.1
 *
 * Comprehensive test suite for demand forecasting dashboard component
 * Tests UI functionality, data visualization, and user interactions
 */
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      ((t) => {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.hasOwn(s, p)) t[p] = s[p];
        }
        return t;
      });
    return __assign.apply(this, arguments);
  };
var __awaiter =
  (this && this.__awaiter) ||
  ((thisArg, _arguments, P, generator) => {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P((resolve) => {
            resolve(value);
          });
    }
    return new (P || (P = Promise))((resolve, reject) => {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  });
var __generator =
  (this && this.__generator) ||
  ((thisArg, body) => {
    var _ = {
        label: 0,
        sent: () => {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return (
      (g.next = verb(0)),
      (g.throw = verb(1)),
      (g.return = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return (v) => step([n, v]);
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y.return
                  : op[0]
                    ? y.throw || ((t = y.return) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  });
Object.defineProperty(exports, "__esModule", { value: true });
var _react_1 = require("react");
var react_2 = require("@testing-library/react");
var user_event_1 = require("@testing-library/user-event");
var react_query_1 = require("@tanstack/react-query");
var forecasting_dashboard_1 = require("@/src/components/dashboard/forecasting/forecasting-dashboard");
var sonner_1 = require("sonner");
// Mock the toast notifications
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));
// Mock the chart components to avoid canvas rendering issues in tests
jest.mock("recharts", () => ({
  LineChart: (_a) => {
    var children = _a.children;
    return <div data-testid="line-chart">{children}</div>;
  },
  Line: () => <div data-testid="line" />,
  AreaChart: (_a) => {
    var children = _a.children;
    return <div data-testid="area-chart">{children}</div>;
  },
  Area: () => <div data-testid="area" />,
  BarChart: (_a) => {
    var children = _a.children;
    return <div data-testid="bar-chart">{children}</div>;
  },
  Bar: () => <div data-testid="bar" />,
  PieChart: (_a) => {
    var children = _a.children;
    return <div data-testid="pie-chart">{children}</div>;
  },
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: (_a) => {
    var children = _a.children;
    return <div data-testid="responsive-container">{children}</div>;
  },
}));
// Mock date-fns
jest.mock("date-fns", () => ({
  format: jest.fn((_date, formatString) => {
    if (formatString === "MMM dd") return "Feb 15";
    if (formatString === "MMM dd, yyyy") return "Feb 15, 2024";
    if (formatString === "yyyy-MM-dd") return "2024-02-15";
    return "2024-02-15T10:00:00Z";
  }),
  parseISO: jest.fn((dateString) => new Date(dateString)),
  addDays: jest.fn((date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000)),
}));
// Mock fetch for API calls
var mockFetch = jest.fn();
global.fetch = mockFetch;
// Mock data
var mockForecastData = {
  forecasts: [
    {
      id: "forecast-1",
      forecast_type: "weekly",
      service_id: "service-1",
      period_start: "2024-02-01T00:00:00Z",
      period_end: "2024-02-07T23:59:59Z",
      predicted_demand: 35,
      confidence_level: 0.92,
      factors_considered: ["historical_data", "seasonal_patterns"],
      metadata: {
        algorithm_version: "1.0",
        data_quality_score: 0.95,
        computation_time_ms: 250,
      },
      created_at: "2024-01-25T10:00:00Z",
      updated_at: "2024-01-25T10:00:00Z",
    },
    {
      id: "forecast-2",
      forecast_type: "monthly",
      service_id: "service-2",
      period_start: "2024-02-01T00:00:00Z",
      period_end: "2024-02-29T23:59:59Z",
      predicted_demand: 120,
      confidence_level: 0.88,
      factors_considered: ["historical_data", "seasonal_patterns", "external_factors"],
      metadata: {
        algorithm_version: "1.0",
        data_quality_score: 0.92,
        computation_time_ms: 380,
      },
      created_at: "2024-01-25T10:00:00Z",
      updated_at: "2024-01-25T10:00:00Z",
    },
  ],
  accuracy: 0.9,
  generated_at: "2024-01-25T10:00:00Z",
};
var mockAlertsData = [
  {
    id: "alert-1",
    alert_type: "high_demand",
    severity: "warning",
    message: "High demand predicted for service-1 next week",
    status: "active",
    forecast_id: "forecast-1",
    created_at: "2024-01-25T09:00:00Z",
  },
  {
    id: "alert-2",
    alert_type: "capacity_shortage",
    severity: "critical",
    message: "Insufficient capacity for predicted demand",
    status: "active",
    forecast_id: "forecast-2",
    created_at: "2024-01-25T08:00:00Z",
  },
];
var mockResourceAllocationData = {
  recommendations: [
    {
      forecast_id: "forecast-1",
      staffing: {
        required_staff_count: 8,
        skill_requirements: ["aesthetic_procedures", "patient_care"],
        shift_distribution: { morning: 3, afternoon: 3, evening: 2 },
      },
      equipment: {
        required_equipment: ["treatment_rooms", "aesthetic_devices"],
        utilization_target: 0.85,
      },
      cost_optimization: {
        total_cost_impact: 15000,
        efficiency_gains: 12.5,
        roi_projection: 1.35,
      },
      priority_level: "high",
    },
  ],
  optimization_strategy: "balanced",
  total_cost_impact: 15000,
  efficiency_improvement: 12.5,
};
var createTestQueryClient = () =>
  new react_query_1.QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
    },
  });
var renderWithQueryClient = (component) => {
  var queryClient = createTestQueryClient();
  return (0, react_2.render)(
    <react_query_1.QueryClientProvider client={queryClient}>
      {component}
    </react_query_1.QueryClientProvider>,
  );
};
describe("ForecastingDashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default successful API responses
    mockFetch.mockImplementation((url) => {
      if (url.includes("/api/forecasting/alerts")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockAlertsData }),
        });
      }
      if (url.includes("/api/forecasting/resource-allocation") && url.includes("POST")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockResourceAllocationData }),
        });
      }
      if (url.includes("/api/forecasting")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockForecastData }),
        });
      }
      return Promise.reject(new Error("Unknown API endpoint"));
    });
  });
  describe("Component Rendering", () => {
    test("should render dashboard header with title and controls", () =>
      __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, (_a) => {
          renderWithQueryClient(<forecasting_dashboard_1.default />);
          expect(react_2.screen.getByText("Demand Forecasting")).toBeInTheDocument();
          expect(
            react_2.screen.getByText("AI-powered demand prediction with ≥80% accuracy"),
          ).toBeInTheDocument();
          expect(react_2.screen.getByRole("button", { name: /export/i })).toBeInTheDocument();
          expect(react_2.screen.getByRole("button", { name: /regenerate/i })).toBeInTheDocument();
          return [2 /*return*/];
        });
      }));
    test("should render key metrics cards", () =>
      __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              renderWithQueryClient(<forecasting_dashboard_1.default />);
              return [
                4 /*yield*/,
                (0, react_2.waitFor)(() => {
                  expect(react_2.screen.getByText("Overall Accuracy")).toBeInTheDocument();
                  expect(react_2.screen.getByText("Active Forecasts")).toBeInTheDocument();
                  expect(react_2.screen.getByText("Active Alerts")).toBeInTheDocument();
                  expect(react_2.screen.getByText("Avg Confidence")).toBeInTheDocument();
                }),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }));
    test("should render tabs for different views", () =>
      __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, (_a) => {
          renderWithQueryClient(<forecasting_dashboard_1.default />);
          expect(react_2.screen.getByRole("tab", { name: /overview/i })).toBeInTheDocument();
          expect(react_2.screen.getByRole("tab", { name: /forecasts/i })).toBeInTheDocument();
          expect(react_2.screen.getByRole("tab", { name: /resources/i })).toBeInTheDocument();
          expect(react_2.screen.getByRole("tab", { name: /alerts/i })).toBeInTheDocument();
          return [2 /*return*/];
        });
      }));
    test("should display loading skeletons while fetching data", () => {
      // Mock pending API call
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves
      renderWithQueryClient(<forecasting_dashboard_1.default />);
      // Should show skeleton loaders
      expect(react_2.screen.getAllByTestId(/skeleton/i)).toHaveLength(4); // One for each metric card
    });
  });
  describe("Metrics Display", () => {
    test("should calculate and display correct accuracy percentage", () =>
      __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              renderWithQueryClient(<forecasting_dashboard_1.default />);
              return [
                4 /*yield*/,
                (0, react_2.waitFor)(() => {
                  expect(react_2.screen.getByText("90%")).toBeInTheDocument(); // mockForecastData.accuracy * 100
                  expect(react_2.screen.getByText("Above 80% threshold")).toBeInTheDocument();
                }),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }));
    test("should show warning when accuracy is below threshold", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var lowAccuracyData;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              lowAccuracyData = __assign(__assign({}, mockForecastData), { accuracy: 0.75 });
              mockFetch.mockImplementation((url) => {
                if (url.includes("/api/forecasting/alerts")) {
                  return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ success: true, data: mockAlertsData }),
                  });
                }
                if (url.includes("/api/forecasting")) {
                  return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ success: true, data: lowAccuracyData }),
                  });
                }
                return Promise.reject(new Error("Unknown API endpoint"));
              });
              renderWithQueryClient(<forecasting_dashboard_1.default />);
              return [
                4 /*yield*/,
                (0, react_2.waitFor)(() => {
                  expect(react_2.screen.getByText("75%")).toBeInTheDocument();
                  expect(react_2.screen.getByText("Below 80% threshold")).toBeInTheDocument();
                }),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }));
    test("should display correct count of active forecasts", () =>
      __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              renderWithQueryClient(<forecasting_dashboard_1.default />);
              return [
                4 /*yield*/,
                (0, react_2.waitFor)(() => {
                  expect(react_2.screen.getByText("2")).toBeInTheDocument(); // mockForecastData.forecasts.length
                }),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }));
    test("should display correct count of active alerts", () =>
      __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              renderWithQueryClient(<forecasting_dashboard_1.default />);
              return [
                4 /*yield*/,
                (0, react_2.waitFor)(() => {
                  expect(react_2.screen.getByText("2")).toBeInTheDocument(); // mockAlertsData.length
                }),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }));
    test("should calculate and display average confidence", () =>
      __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              renderWithQueryClient(<forecasting_dashboard_1.default />);
              return [
                4 /*yield*/,
                (0, react_2.waitFor)(() => {
                  var avgConfidence = Math.round(((0.92 + 0.88) / 2) * 100); // Average of forecast confidence levels
                  expect(
                    react_2.screen.getByText("".concat(avgConfidence, "%")),
                  ).toBeInTheDocument();
                }),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }));
  });
  describe("Chart Rendering", () => {
    test("should render demand forecast trend chart", () =>
      __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              renderWithQueryClient(<forecasting_dashboard_1.default />);
              return [
                4 /*yield*/,
                (0, react_2.waitFor)(() => {
                  expect(react_2.screen.getByText("Demand Forecast Trend")).toBeInTheDocument();
                  expect(react_2.screen.getByTestId("line-chart")).toBeInTheDocument();
                }),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }));
    test("should render confidence distribution chart", () =>
      __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              renderWithQueryClient(<forecasting_dashboard_1.default />);
              return [
                4 /*yield*/,
                (0, react_2.waitFor)(() => {
                  expect(react_2.screen.getByText("Confidence Distribution")).toBeInTheDocument();
                  expect(react_2.screen.getByTestId("bar-chart")).toBeInTheDocument();
                }),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }));
    test("should display accuracy status with progress bar", () =>
      __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              renderWithQueryClient(<forecasting_dashboard_1.default />);
              return [
                4 /*yield*/,
                (0, react_2.waitFor)(() => {
                  expect(react_2.screen.getByText("Accuracy Status")).toBeInTheDocument();
                  expect(react_2.screen.getByText("90% / 80% required")).toBeInTheDocument();
                  expect(
                    react_2.screen.getByText("Meeting accuracy requirements"),
                  ).toBeInTheDocument();
                }),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }));
  });
  describe("Tab Navigation", () => {
    test("should switch between tabs correctly", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var user;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              user = user_event_1.default.setup();
              renderWithQueryClient(<forecasting_dashboard_1.default />);
              // Start on overview tab
              expect(react_2.screen.getByRole("tabpanel")).toHaveTextContent(
                "Demand Forecast Trend",
              );
              // Switch to forecasts tab
              return [
                4 /*yield*/,
                user.click(react_2.screen.getByRole("tab", { name: /forecasts/i })),
              ];
            case 1:
              // Switch to forecasts tab
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_2.waitFor)(() => {
                  expect(react_2.screen.getByText("Forecast Details")).toBeInTheDocument();
                }),
              ];
            case 2:
              _a.sent();
              // Switch to resources tab
              return [
                4 /*yield*/,
                user.click(react_2.screen.getByRole("tab", { name: /resources/i })),
              ];
            case 3:
              // Switch to resources tab
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_2.waitFor)(() => {
                  expect(react_2.screen.getByText("Resource Allocation")).toBeInTheDocument();
                }),
              ];
            case 4:
              _a.sent();
              // Switch to alerts tab
              return [
                4 /*yield*/,
                user.click(react_2.screen.getByRole("tab", { name: /alerts/i })),
              ];
            case 5:
              // Switch to alerts tab
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_2.waitFor)(() => {
                  expect(react_2.screen.getByText("Active Alerts")).toBeInTheDocument();
                }),
              ];
            case 6:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }));
  });
  describe("Forecasts Tab", () => {
    test("should display forecast details correctly", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var user;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              user = user_event_1.default.setup();
              renderWithQueryClient(<forecasting_dashboard_1.default />);
              return [
                4 /*yield*/,
                user.click(react_2.screen.getByRole("tab", { name: /forecasts/i })),
              ];
            case 1:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_2.waitFor)(() => {
                  expect(react_2.screen.getByText("WEEKLY")).toBeInTheDocument();
                  expect(react_2.screen.getByText("MONTHLY")).toBeInTheDocument();
                  expect(react_2.screen.getByText("35 appointments")).toBeInTheDocument();
                  expect(react_2.screen.getByText("120 appointments")).toBeInTheDocument();
                  expect(react_2.screen.getByText("92% confidence")).toBeInTheDocument();
                  expect(react_2.screen.getByText("88% confidence")).toBeInTheDocument();
                }),
              ];
            case 2:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }));
    test("should handle empty forecasts gracefully", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var emptyData, user;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              emptyData = __assign(__assign({}, mockForecastData), { forecasts: [] });
              mockFetch.mockImplementation((url) => {
                if (url.includes("/api/forecasting/alerts")) {
                  return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ success: true, data: [] }),
                  });
                }
                if (url.includes("/api/forecasting")) {
                  return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ success: true, data: emptyData }),
                  });
                }
                return Promise.reject(new Error("Unknown API endpoint"));
              });
              user = user_event_1.default.setup();
              renderWithQueryClient(<forecasting_dashboard_1.default />);
              return [
                4 /*yield*/,
                user.click(react_2.screen.getByRole("tab", { name: /forecasts/i })),
              ];
            case 1:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_2.waitFor)(() => {
                  expect(react_2.screen.getByText("No forecasts available")).toBeInTheDocument();
                  expect(
                    react_2.screen.getByRole("button", { name: /generate forecasts/i }),
                  ).toBeInTheDocument();
                }),
              ];
            case 2:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }));
  });
  describe("Resources Tab", () => {
    test("should display resource allocation recommendations", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var user;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              user = user_event_1.default.setup();
              renderWithQueryClient(<forecasting_dashboard_1.default />);
              return [
                4 /*yield*/,
                user.click(react_2.screen.getByRole("tab", { name: /resources/i })),
              ];
            case 1:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_2.waitFor)(() => {
                  expect(react_2.screen.getByText("8 Staff Members")).toBeInTheDocument();
                  expect(react_2.screen.getByText("high")).toBeInTheDocument();
                  expect(react_2.screen.getByText("Cost Impact: $15,000")).toBeInTheDocument();
                  expect(react_2.screen.getByText("Efficiency Gain: 12.5%")).toBeInTheDocument();
                }),
              ];
            case 2:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }));
    test("should handle no resource allocations", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var emptyData, user;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              emptyData = __assign(__assign({}, mockForecastData), { forecasts: [] });
              mockFetch.mockImplementation((url) => {
                if (url.includes("/api/forecasting")) {
                  return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ success: true, data: emptyData }),
                  });
                }
                return Promise.reject(new Error("Unknown API endpoint"));
              });
              user = user_event_1.default.setup();
              renderWithQueryClient(<forecasting_dashboard_1.default />);
              return [
                4 /*yield*/,
                user.click(react_2.screen.getByRole("tab", { name: /resources/i })),
              ];
            case 1:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_2.waitFor)(() => {
                  expect(
                    react_2.screen.getByText(
                      "No resource allocations available. Generate forecasts first.",
                    ),
                  ).toBeInTheDocument();
                }),
              ];
            case 2:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }));
  });
  describe("Alerts Tab", () => {
    test("should display active alerts correctly", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var user;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              user = user_event_1.default.setup();
              renderWithQueryClient(<forecasting_dashboard_1.default />);
              return [
                4 /*yield*/,
                user.click(react_2.screen.getByRole("tab", { name: /alerts/i })),
              ];
            case 1:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_2.waitFor)(() => {
                  expect(react_2.screen.getByText("High demand - warning")).toBeInTheDocument();
                  expect(
                    react_2.screen.getByText("Capacity shortage - critical"),
                  ).toBeInTheDocument();
                  expect(
                    react_2.screen.getByText("High demand predicted for service-1 next week"),
                  ).toBeInTheDocument();
                  expect(
                    react_2.screen.getByText("Insufficient capacity for predicted demand"),
                  ).toBeInTheDocument();
                }),
              ];
            case 2:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }));
    test("should handle no active alerts", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var user;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              // Mock empty alerts
              mockFetch.mockImplementation((url) => {
                if (url.includes("/api/forecasting/alerts")) {
                  return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ success: true, data: [] }),
                  });
                }
                if (url.includes("/api/forecasting")) {
                  return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ success: true, data: mockForecastData }),
                  });
                }
                return Promise.reject(new Error("Unknown API endpoint"));
              });
              user = user_event_1.default.setup();
              renderWithQueryClient(<forecasting_dashboard_1.default />);
              return [
                4 /*yield*/,
                user.click(react_2.screen.getByRole("tab", { name: /alerts/i })),
              ];
            case 1:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_2.waitFor)(() => {
                  expect(react_2.screen.getByText("No active alerts")).toBeInTheDocument();
                }),
              ];
            case 2:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }));
  });
  describe("User Interactions", () => {
    test("should handle regenerate forecast button click", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var user, regenerateButton;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              user = user_event_1.default.setup();
              renderWithQueryClient(<forecasting_dashboard_1.default />);
              regenerateButton = react_2.screen.getByRole("button", { name: /regenerate/i });
              return [4 /*yield*/, user.click(regenerateButton)];
            case 1:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_2.waitFor)(() => {
                  expect(sonner_1.toast.success).toHaveBeenCalledWith(
                    "Demand forecast generated successfully",
                  );
                }),
              ];
            case 2:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }));
    test("should handle export data button click", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var user, mockCreateObjectURL, mockRevokeObjectURL, mockClick, mockLink, exportButton;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              user = user_event_1.default.setup();
              renderWithQueryClient(<forecasting_dashboard_1.default />);
              mockCreateObjectURL = jest.fn(() => "mock-url");
              mockRevokeObjectURL = jest.fn();
              Object.defineProperty(URL, "createObjectURL", { value: mockCreateObjectURL });
              Object.defineProperty(URL, "revokeObjectURL", { value: mockRevokeObjectURL });
              mockClick = jest.fn();
              mockLink = { href: "", download: "", click: mockClick };
              jest.spyOn(document, "createElement").mockReturnValue(mockLink);
              return [
                4 /*yield*/,
                (0, react_2.waitFor)(() => {
                  expect(
                    react_2.screen.getByRole("button", { name: /export/i }),
                  ).not.toBeDisabled();
                }),
              ];
            case 1:
              _a.sent();
              exportButton = react_2.screen.getByRole("button", { name: /export/i });
              return [4 /*yield*/, user.click(exportButton)];
            case 2:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_2.waitFor)(() => {
                  expect(mockCreateObjectURL).toHaveBeenCalled();
                  expect(mockClick).toHaveBeenCalled();
                  expect(sonner_1.toast.success).toHaveBeenCalledWith(
                    "Forecast data exported successfully",
                  );
                }),
              ];
            case 3:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }));
    test("should disable export button when no data available", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var emptyData;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              emptyData = __assign(__assign({}, mockForecastData), { forecasts: [] });
              mockFetch.mockImplementation((url) => {
                if (url.includes("/api/forecasting")) {
                  return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ success: true, data: emptyData }),
                  });
                }
                return Promise.reject(new Error("Unknown API endpoint"));
              });
              renderWithQueryClient(<forecasting_dashboard_1.default />);
              return [
                4 /*yield*/,
                (0, react_2.waitFor)(() => {
                  expect(react_2.screen.getByRole("button", { name: /export/i })).toBeDisabled();
                }),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }));
  });
  describe("Error Handling", () => {
    test("should display error message when API call fails", () =>
      __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockFetch.mockImplementation(() =>
                Promise.resolve({
                  ok: false,
                  status: 500,
                  json: () =>
                    Promise.resolve({ success: false, error: { message: "Server error" } }),
                }),
              );
              renderWithQueryClient(<forecasting_dashboard_1.default />);
              return [
                4 /*yield*/,
                (0, react_2.waitFor)(() => {
                  expect(react_2.screen.getByText("Error Loading Forecasts")).toBeInTheDocument();
                  expect(react_2.screen.getByText(/server error/i)).toBeInTheDocument();
                }),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }));
    test("should handle network errors gracefully", () =>
      __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockFetch.mockImplementation(() => Promise.reject(new Error("Network error")));
              renderWithQueryClient(<forecasting_dashboard_1.default />);
              return [
                4 /*yield*/,
                (0, react_2.waitFor)(() => {
                  expect(react_2.screen.getByText("Error Loading Forecasts")).toBeInTheDocument();
                }),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }));
    test("should show error toast when regenerate fails", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var user, callCount, regenerateButton;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              user = user_event_1.default.setup();
              callCount = 0;
              mockFetch.mockImplementation((url) => {
                callCount++;
                if (callCount === 1 && url.includes("/api/forecasting/alerts")) {
                  return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ success: true, data: mockAlertsData }),
                  });
                }
                if (callCount === 2 && url.includes("/api/forecasting")) {
                  return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ success: true, data: mockForecastData }),
                  });
                }
                // Subsequent calls fail
                return Promise.resolve({
                  ok: false,
                  status: 500,
                  json: () =>
                    Promise.resolve({
                      success: false,
                      error: { message: "Regenerate failed" },
                    }),
                });
              });
              renderWithQueryClient(<forecasting_dashboard_1.default />);
              return [
                4 /*yield*/,
                (0, react_2.waitFor)(() => {
                  expect(
                    react_2.screen.getByRole("button", { name: /regenerate/i }),
                  ).toBeInTheDocument();
                }),
              ];
            case 1:
              _a.sent();
              regenerateButton = react_2.screen.getByRole("button", { name: /regenerate/i });
              return [4 /*yield*/, user.click(regenerateButton)];
            case 2:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_2.waitFor)(() => {
                  expect(sonner_1.toast.error).toHaveBeenCalledWith(
                    "Failed to generate forecast: Regenerate failed",
                  );
                }),
              ];
            case 3:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }));
  });
  describe("Accessibility", () => {
    test("should have proper ARIA labels and roles", () =>
      __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, (_a) => {
          renderWithQueryClient(<forecasting_dashboard_1.default />);
          expect(react_2.screen.getByRole("tablist")).toBeInTheDocument();
          expect(react_2.screen.getAllByRole("tab")).toHaveLength(4);
          expect(react_2.screen.getByRole("tabpanel")).toBeInTheDocument();
          expect(react_2.screen.getByRole("button", { name: /export/i })).toBeInTheDocument();
          expect(react_2.screen.getByRole("button", { name: /regenerate/i })).toBeInTheDocument();
          return [2 /*return*/];
        });
      }));
    test("should support keyboard navigation", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var user, firstTab, secondTab;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              user = user_event_1.default.setup();
              renderWithQueryClient(<forecasting_dashboard_1.default />);
              firstTab = react_2.screen.getByRole("tab", { name: /overview/i });
              secondTab = react_2.screen.getByRole("tab", { name: /forecasts/i });
              return [4 /*yield*/, user.click(firstTab)];
            case 1:
              _a.sent();
              expect(firstTab).toHaveAttribute("aria-selected", "true");
              return [4 /*yield*/, user.tab()];
            case 2:
              _a.sent();
              return [4 /*yield*/, user.keyboard("{Enter}")];
            case 3:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_2.waitFor)(() => {
                  expect(secondTab).toHaveAttribute("aria-selected", "true");
                }),
              ];
            case 4:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }));
  });
});

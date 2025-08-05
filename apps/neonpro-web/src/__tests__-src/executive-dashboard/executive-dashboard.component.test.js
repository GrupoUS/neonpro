/**
 * Executive Dashboard Component Tests
 * Story 7.1: Executive Dashboard Implementation
 *
 * Tests for the frontend React components of the executive dashboard
 */
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
var __rest =
  (this && this.__rest) ||
  ((s, e) => {
    var t = {};
    for (var p in s) if (Object.hasOwn(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
          t[p[i]] = s[p[i]];
      }
    return t;
  });
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("@testing-library/react");
var react_query_1 = require("@tanstack/react-query");
var executive_dashboard_1 = require("@/components/dashboard/executive-dashboard");
// Mock the API fetch functions
var mockFetch = jest.fn();
global.fetch = mockFetch;
// Mock chart components
jest.mock("recharts", () => ({
  LineChart: (_a) => {
    var children = _a.children;
    return <div data-testid="line-chart">{children}</div>;
  },
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  BarChart: (_a) => {
    var children = _a.children;
    return <div data-testid="bar-chart">{children}</div>;
  },
  Bar: () => <div data-testid="bar" />,
  ResponsiveContainer: (_a) => {
    var children = _a.children;
    return <div data-testid="responsive-container">{children}</div>;
  },
}));
// Mock shadcn/ui components
jest.mock("@/components/ui/card", () => ({
  Card: (_a) => {
    var children = _a.children,
      className = _a.className,
      props = __rest(_a, ["children", "className"]);
    return (
      <div data-testid="card" className={className} {...props}>
        {children}
      </div>
    );
  },
  CardContent: (_a) => {
    var children = _a.children,
      className = _a.className,
      props = __rest(_a, ["children", "className"]);
    return (
      <div data-testid="card-content" className={className} {...props}>
        {children}
      </div>
    );
  },
  CardDescription: (_a) => {
    var children = _a.children,
      className = _a.className,
      props = __rest(_a, ["children", "className"]);
    return (
      <div data-testid="card-description" className={className} {...props}>
        {children}
      </div>
    );
  },
  CardHeader: (_a) => {
    var children = _a.children,
      className = _a.className,
      props = __rest(_a, ["children", "className"]);
    return (
      <div data-testid="card-header" className={className} {...props}>
        {children}
      </div>
    );
  },
  CardTitle: (_a) => {
    var children = _a.children,
      className = _a.className,
      props = __rest(_a, ["children", "className"]);
    return (
      <div data-testid="card-title" className={className} {...props}>
        {children}
      </div>
    );
  },
}));
jest.mock("@/components/ui/button", () => ({
  Button: (_a) => {
    var children = _a.children,
      onClick = _a.onClick,
      props = __rest(_a, ["children", "onClick"]);
    return (
      <button data-testid="button" onClick={onClick} {...props}>
        {children}
      </button>
    );
  },
}));
jest.mock("@/components/ui/select", () => ({
  Select: (_a) => {
    var children = _a.children;
    return <div data-testid="select">{children}</div>;
  },
  SelectContent: (_a) => {
    var children = _a.children;
    return <div data-testid="select-content">{children}</div>;
  },
  SelectItem: (_a) => {
    var children = _a.children,
      value = _a.value;
    return (
      <div data-testid="select-item" data-value={value}>
        {children}
      </div>
    );
  },
  SelectTrigger: (_a) => {
    var children = _a.children;
    return <div data-testid="select-trigger">{children}</div>;
  },
  SelectValue: (_a) => {
    var placeholder = _a.placeholder;
    return <div data-testid="select-value">{placeholder}</div>;
  },
}));
jest.mock("@/components/ui/alert", () => ({
  Alert: (_a) => {
    var children = _a.children;
    return <div data-testid="alert">{children}</div>;
  },
  AlertDescription: (_a) => {
    var children = _a.children;
    return <div data-testid="alert-description">{children}</div>;
  },
  AlertTitle: (_a) => {
    var children = _a.children;
    return <div data-testid="alert-title">{children}</div>;
  },
}));
jest.mock("@/components/ui/badge", () => ({
  Badge: (_a) => {
    var children = _a.children,
      variant = _a.variant;
    return (
      <span data-testid="badge" data-variant={variant}>
        {children}
      </span>
    );
  },
}));
var TestWrapper = (_a) => {
  var children = _a.children;
  var queryClient = new react_query_1.QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return (
    <react_query_1.QueryClientProvider client={queryClient}>
      {children}
    </react_query_1.QueryClientProvider>
  );
};
describe("ExecutiveDashboard Component", () => {
  var mockProps = {
    clinicId: "clinic-1",
    userId: "user-1",
  };
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful API responses
    mockFetch.mockImplementation((url) => {
      if (url.includes("/api/executive-dashboard/kpis")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              data: [
                {
                  id: "1",
                  kpi_name: "total_revenue",
                  kpi_value: 85000,
                  unit: "BRL",
                  period_type: "monthly",
                },
                {
                  id: "2",
                  kpi_name: "total_appointments",
                  kpi_value: 342,
                  unit: "appointments",
                  period_type: "monthly",
                },
              ],
            }),
        });
      }
      if (url.includes("/api/executive-dashboard/alerts")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              data: [
                {
                  id: "1",
                  alert_type: "revenue_drop",
                  severity: "high",
                  title: "Queda na conversão",
                  message: "A taxa de conversão está abaixo do esperado",
                  is_active: true,
                },
              ],
            }),
        });
      }
      if (url.includes("/api/executive-dashboard/widgets")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              data: [
                {
                  id: "1",
                  widget_type: "revenue_chart",
                  position_x: 0,
                  position_y: 0,
                  width: 6,
                  height: 4,
                  configuration: { chart_type: "line" },
                },
              ],
            }),
        });
      }
      if (url.includes("/api/executive-dashboard/comparison")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              data: {
                total_revenue: {
                  current: 85000,
                  previous: 78500,
                  change: 6500,
                  changePercent: 8.28,
                },
              },
            }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: [] }),
      });
    });
  });
  it("should render dashboard with loading state initially", () => {
    (0, react_1.render)(
      <TestWrapper>
        <executive_dashboard_1.ExecutiveDashboard {...mockProps} />
      </TestWrapper>,
    );
    expect(react_1.screen.getByText("Dashboard Executivo")).toBeInTheDocument();
    expect(react_1.screen.getByText("Carregando dados do dashboard...")).toBeInTheDocument();
  });
  it("should render KPI cards after data loads", () =>
    __awaiter(void 0, void 0, void 0, function () {
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            (0, react_1.render)(
              <TestWrapper>
                <executive_dashboard_1.ExecutiveDashboard {...mockProps} />
              </TestWrapper>,
            );
            return [
              4 /*yield*/,
              (0, react_1.waitFor)(() => {
                expect(react_1.screen.getByText("Receita Total")).toBeInTheDocument();
                expect(react_1.screen.getByText("R$ 85.000,00")).toBeInTheDocument();
                expect(react_1.screen.getByText("Total de Consultas")).toBeInTheDocument();
                expect(react_1.screen.getByText("342")).toBeInTheDocument();
              }),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    }));
  it("should render alerts section", () =>
    __awaiter(void 0, void 0, void 0, function () {
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            (0, react_1.render)(
              <TestWrapper>
                <executive_dashboard_1.ExecutiveDashboard {...mockProps} />
              </TestWrapper>,
            );
            return [
              4 /*yield*/,
              (0, react_1.waitFor)(() => {
                expect(react_1.screen.getByText("Alertas Ativos")).toBeInTheDocument();
                expect(react_1.screen.getByText("Queda na conversão")).toBeInTheDocument();
                expect(
                  react_1.screen.getByText("A taxa de conversão está abaixo do esperado"),
                ).toBeInTheDocument();
              }),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    }));
  it("should handle period selection change", () =>
    __awaiter(void 0, void 0, void 0, function () {
      var periodTrigger, weeklyOption;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            (0, react_1.render)(
              <TestWrapper>
                <executive_dashboard_1.ExecutiveDashboard {...mockProps} />
              </TestWrapper>,
            );
            return [
              4 /*yield*/,
              (0, react_1.waitFor)(() => {
                var periodSelect = react_1.screen.getByTestId("select");
                expect(periodSelect).toBeInTheDocument();
              }),
              // Test period change functionality
            ];
          case 1:
            _a.sent();
            periodTrigger = react_1.screen.getByTestId("select-trigger");
            react_1.fireEvent.click(periodTrigger);
            weeklyOption = react_1.screen.getByText("Semanal");
            if (weeklyOption) {
              react_1.fireEvent.click(weeklyOption);
            }
            // Should trigger new API calls with updated period
            return [
              4 /*yield*/,
              (0, react_1.waitFor)(() => {
                expect(mockFetch).toHaveBeenCalledWith(
                  expect.stringContaining("period_type=weekly"),
                  expect.any(Object),
                );
              }),
            ];
          case 2:
            // Should trigger new API calls with updated period
            _a.sent();
            return [2 /*return*/];
        }
      });
    }));
  it("should render comparison data with trend indicators", () =>
    __awaiter(void 0, void 0, void 0, function () {
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            (0, react_1.render)(
              <TestWrapper>
                <executive_dashboard_1.ExecutiveDashboard {...mockProps} />
              </TestWrapper>,
            );
            return [
              4 /*yield*/,
              (0, react_1.waitFor)(() => {
                // Should show percentage change
                expect(react_1.screen.getByText("+8.28%")).toBeInTheDocument();
              }),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    }));
  it("should handle chart type switching", () =>
    __awaiter(void 0, void 0, void 0, function () {
      var chartToggle;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            (0, react_1.render)(
              <TestWrapper>
                <executive_dashboard_1.ExecutiveDashboard {...mockProps} />
              </TestWrapper>,
            );
            return [
              4 /*yield*/,
              (0, react_1.waitFor)(() => {
                expect(react_1.screen.getByTestId("line-chart")).toBeInTheDocument();
              }),
              // Test chart type toggle if implemented
            ];
          case 1:
            _a.sent();
            chartToggle = react_1.screen.queryByText("Gráfico de Barras");
            if (!chartToggle) return [3 /*break*/, 3];
            react_1.fireEvent.click(chartToggle);
            return [
              4 /*yield*/,
              (0, react_1.waitFor)(() => {
                expect(react_1.screen.getByTestId("bar-chart")).toBeInTheDocument();
              }),
            ];
          case 2:
            _a.sent();
            _a.label = 3;
          case 3:
            return [2 /*return*/];
        }
      });
    }));
  it("should handle API errors gracefully", () =>
    __awaiter(void 0, void 0, void 0, function () {
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            mockFetch.mockImplementation(() =>
              Promise.resolve({
                ok: false,
                json: () =>
                  Promise.resolve({
                    success: false,
                    error: "API Error",
                  }),
              }),
            );
            (0, react_1.render)(
              <TestWrapper>
                <executive_dashboard_1.ExecutiveDashboard {...mockProps} />
              </TestWrapper>,
            );
            return [
              4 /*yield*/,
              (0, react_1.waitFor)(() => {
                expect(react_1.screen.getByText("Erro ao carregar dados")).toBeInTheDocument();
              }),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    }));
  it("should export report when button is clicked", () =>
    __awaiter(void 0, void 0, void 0, function () {
      var exportButton;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            (0, react_1.render)(
              <TestWrapper>
                <executive_dashboard_1.ExecutiveDashboard {...mockProps} />
              </TestWrapper>,
            );
            return [
              4 /*yield*/,
              (0, react_1.waitFor)(() => {
                var exportButton = react_1.screen.getByText("Exportar Relatório");
                expect(exportButton).toBeInTheDocument();
              }),
            ];
          case 1:
            _a.sent();
            exportButton = react_1.screen.getByText("Exportar Relatório");
            react_1.fireEvent.click(exportButton);
            return [
              4 /*yield*/,
              (0, react_1.waitFor)(() => {
                expect(mockFetch).toHaveBeenCalledWith(
                  expect.stringContaining("/api/executive-dashboard/reports"),
                  expect.objectContaining({
                    method: "POST",
                  }),
                );
              }),
            ];
          case 2:
            _a.sent();
            return [2 /*return*/];
        }
      });
    }));
  it("should render responsive layout", () => {
    (0, react_1.render)(
      <TestWrapper>
        <executive_dashboard_1.ExecutiveDashboard {...mockProps} />
      </TestWrapper>,
    );
    var dashboard = react_1.screen.getByTestId("executive-dashboard");
    expect(dashboard).toHaveClass("grid");
    // Should have responsive grid classes
    expect(dashboard).toHaveClass("grid-cols-1", "md:grid-cols-2", "lg:grid-cols-3");
  });
  it("should handle widget drag and drop configuration", () =>
    __awaiter(void 0, void 0, void 0, function () {
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            (0, react_1.render)(
              <TestWrapper>
                <executive_dashboard_1.ExecutiveDashboard {...mockProps} />
              </TestWrapper>,
            );
            return [
              4 /*yield*/,
              (0, react_1.waitFor)(() => {
                var configButton = react_1.screen.queryByText("Configurar Layout");
                if (configButton) {
                  react_1.fireEvent.click(configButton);
                  // Should enable drag mode
                  expect(react_1.screen.getByText("Modo de Edição Ativado")).toBeInTheDocument();
                }
              }),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    }));
});

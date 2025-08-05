/**
 * Executive Dashboard Service Integration Test
 * Tests the complete executive dashboard functionality end-to-end
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
Object.defineProperty(exports, "__esModule", { value: true });
var executive_dashboard_1 = require("@/lib/services/executive-dashboard");
// Mock the dependencies
jest.mock("@/app/utils/supabase/server", () => ({
  createClient: jest.fn(() => ({
    from: jest.fn((table) => {
      var mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn(() =>
          Promise.resolve({
            data: { role: "admin", permissions: ["executive_dashboard"] },
            error: null,
          }),
        ),
      };
      // Mock different responses based on table
      if (table === "executive_dashboard_metrics" || table === "executive_dashboard_charts") {
        // Add promise resolution to the chain for metrics/charts
        mockChain.order = jest.fn(() =>
          Promise.resolve({
            data: [
              {
                id: "1",
                date: "2024-01-01",
                revenue: 10000,
                new_patients: 15,
                appointments: 50,
                completed_appointments: 45,
                costs: 7000,
                satisfaction_sum: 200,
                satisfaction_count: 40,
              },
            ],
            error: null,
          }),
        );
      } else if (table === "executive_dashboard_alerts") {
        // Mock alerts with double order + limit
        mockChain.order = jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() =>
              Promise.resolve({
                data: [],
                error: null,
              }),
            ),
          })),
        }));
      } else if (table === "professionals") {
        // Mock professionals table for access verification
        mockChain.eq = jest.fn(() => ({
          single: jest.fn(() =>
            Promise.resolve({
              data: { role: "admin", permissions: ["executive_dashboard"] },
              error: null,
            }),
          ),
        }));
      }
      return mockChain;
    }),
    auth: {
      getUser: jest.fn(() =>
        Promise.resolve({
          data: { user: { id: "test-user-id" } },
          error: null,
        }),
      ),
    },
  })),
}));
jest.mock("@/lib/auth/server", () => ({
  getCurrentUser: jest.fn(() => Promise.resolve({ id: "test-user-id" })),
}));
jest.mock("@/lib/analytics/service", () => ({
  AnalyticsService: jest.fn(() => ({})),
}));
jest.mock("@/lib/logger", () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));
describe("ExecutiveDashboardService Integration", () => {
  var service;
  beforeEach(() => {
    service = new executive_dashboard_1.ExecutiveDashboardService();
    jest.clearAllMocks();
  });
  describe("Dashboard Metrics", () => {
    it("should fetch comprehensive dashboard metrics successfully", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var filters, result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              filters = {
                dateRange: {
                  start: "2024-01-01",
                  end: "2024-01-31",
                },
                clinicIds: ["clinic-1"],
                categories: ["financial", "operational"],
              };
              return [4 /*yield*/, service.getDashboardMetrics(filters)];
            case 1:
              result = _a.sent();
              expect(result).toHaveProperty("kpis");
              expect(result).toHaveProperty("charts");
              expect(result).toHaveProperty("alerts");
              expect(result).toHaveProperty("lastUpdated");
              expect(result.kpis).toBeInstanceOf(Array);
              expect(result.kpis.length).toBeGreaterThan(0);
              return [2 /*return*/];
          }
        });
      }));
    it("should calculate KPIs correctly", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var filters, kpis, revenueKPI;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              filters = {
                dateRange: {
                  start: "2024-01-01",
                  end: "2024-01-31",
                },
              };
              return [4 /*yield*/, service.getKPIs(filters)];
            case 1:
              kpis = _a.sent();
              expect(kpis).toBeInstanceOf(Array);
              expect(kpis.length).toBe(6); // Revenue, Patients, Appointments, Efficiency, Profitability, Satisfaction
              revenueKPI = kpis.find((kpi) => kpi.id === "revenue");
              expect(revenueKPI).toBeDefined();
              expect(
                revenueKPI === null || revenueKPI === void 0 ? void 0 : revenueKPI.format,
              ).toBe("currency");
              expect(
                revenueKPI === null || revenueKPI === void 0 ? void 0 : revenueKPI.category,
              ).toBe("financial");
              return [2 /*return*/];
          }
        });
      }));
    it("should fetch chart data with proper structure", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var filters, charts;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              filters = {
                dateRange: {
                  start: "2024-01-01",
                  end: "2024-01-31",
                },
              };
              return [4 /*yield*/, service.getChartData(filters)];
            case 1:
              charts = _a.sent();
              expect(charts).toHaveProperty("revenue");
              expect(charts).toHaveProperty("appointments");
              expect(charts).toHaveProperty("patients");
              expect(charts.revenue).toHaveProperty("labels");
              expect(charts.revenue).toHaveProperty("data");
              expect(charts.revenue).toHaveProperty("previousData");
              return [2 /*return*/];
          }
        });
      }));
    it("should fetch alerts with proper prioritization", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var filters, alerts;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              filters = {
                dateRange: {
                  start: "2024-01-01",
                  end: "2024-01-31",
                },
              };
              return [4 /*yield*/, service.getAlerts(filters)];
            case 1:
              alerts = _a.sent();
              expect(alerts).toBeInstanceOf(Array);
              // Since we mocked empty alerts, we expect an empty array
              expect(alerts.length).toBe(0);
              return [2 /*return*/];
          }
        });
      }));
  });
  describe("Period Comparison", () => {
    it("should compare metrics between two periods", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var currentPeriod, previousPeriod, comparison;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              currentPeriod = {
                start: "2024-01-01",
                end: "2024-01-31",
              };
              previousPeriod = {
                start: "2023-12-01",
                end: "2023-12-31",
              };
              return [4 /*yield*/, service.comparePeriods(currentPeriod, previousPeriod)];
            case 1:
              comparison = _a.sent();
              expect(comparison).toHaveProperty("current");
              expect(comparison).toHaveProperty("previous");
              expect(comparison).toHaveProperty("changes");
              expect(comparison.current).toHaveProperty("metrics");
              expect(comparison.previous).toHaveProperty("metrics");
              expect(comparison.changes).toBeInstanceOf(Object);
              return [2 /*return*/];
          }
        });
      }));
  });
  describe("Export Functionality", () => {
    it("should generate export URLs for different formats", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var filters, pdfExport, excelExport, csvExport;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              filters = {
                dateRange: {
                  start: "2024-01-01",
                  end: "2024-01-31",
                },
              };
              return [4 /*yield*/, service.exportDashboard(filters, "pdf")];
            case 1:
              pdfExport = _a.sent();
              return [4 /*yield*/, service.exportDashboard(filters, "excel")];
            case 2:
              excelExport = _a.sent();
              return [4 /*yield*/, service.exportDashboard(filters, "csv")];
            case 3:
              csvExport = _a.sent();
              expect(pdfExport).toHaveProperty("url");
              expect(pdfExport).toHaveProperty("filename");
              expect(pdfExport.filename).toContain(".pdf");
              expect(excelExport).toHaveProperty("url");
              expect(excelExport).toHaveProperty("filename");
              expect(excelExport.filename).toContain(".excel");
              expect(csvExport).toHaveProperty("url");
              expect(csvExport).toHaveProperty("filename");
              expect(csvExport.filename).toContain(".csv");
              return [2 /*return*/];
          }
        });
      }));
  });
  describe("Error Handling", () => {
    it("should handle authentication errors gracefully", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var mockGetCurrentUser, filters;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockGetCurrentUser = require("@/lib/auth/server").getCurrentUser;
              mockGetCurrentUser.mockResolvedValueOnce(null);
              filters = {
                dateRange: {
                  start: "2024-01-01",
                  end: "2024-01-31",
                },
              };
              return [
                4 /*yield*/,
                expect(service.getDashboardMetrics(filters)).rejects.toThrow(
                  "User not authenticated",
                ),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }));
    it("should handle insufficient permissions", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var service, verifyAccessSpy, filters;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              service = new executive_dashboard_1.ExecutiveDashboardService();
              verifyAccessSpy = jest
                .spyOn(service, "verifyExecutiveAccess")
                .mockRejectedValue(new Error("Insufficient permissions for executive dashboard"));
              filters = {
                dateRange: {
                  start: "2024-01-01",
                  end: "2024-01-31",
                },
              };
              return [
                4 /*yield*/,
                expect(service.getDashboardMetrics(filters)).rejects.toThrow(
                  "Insufficient permissions for executive dashboard",
                ),
              ];
            case 1:
              _a.sent();
              verifyAccessSpy.mockRestore();
              return [2 /*return*/];
          }
        });
      }));
  });
});

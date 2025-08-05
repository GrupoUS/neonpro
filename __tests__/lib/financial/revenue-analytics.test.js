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
var globals_1 = require("@jest/globals");
var revenue_analytics_engine_1 = require("../../../lib/financial/revenue-analytics-engine");
// Mock Supabase client
var mockSupabaseClient = {
  from: globals_1.jest.fn(() => ({
    select: globals_1.jest.fn().mockReturnThis(),
    eq: globals_1.jest.fn().mockReturnThis(),
    gte: globals_1.jest.fn().mockReturnThis(),
    lte: globals_1.jest.fn().mockReturnThis(),
    order: globals_1.jest.fn().mockReturnThis(),
    returns: globals_1.jest.fn(),
  })),
};
globals_1.jest.mock("../../../lib/supabase-browser", () => ({
  createBrowserClient: () => mockSupabaseClient,
}));
(0, globals_1.describe)("RevenueAnalyticsEngine", () => {
  var analytics;
  (0, globals_1.beforeEach)(() => {
    analytics = new revenue_analytics_engine_1.RevenueAnalyticsEngine();
    // Mock current date
    globals_1.jest.useFakeTimers();
    globals_1.jest.setSystemTime(new Date("2024-01-15"));
    // Reset mocks
    globals_1.jest.clearAllMocks();
  });
  (0, globals_1.afterEach)(() => {
    globals_1.jest.useRealTimers();
    globals_1.jest.clearAllMocks();
  });
  (0, globals_1.describe)("Revenue Analysis Basic Tests", () => {
    (0, globals_1.it)("should create analytics engine instance", () => {
      (0, globals_1.expect)(analytics).toBeInstanceOf(
        revenue_analytics_engine_1.RevenueAnalyticsEngine,
      );
    });
    (0, globals_1.it)("should have required methods", () => {
      (0, globals_1.expect)(typeof analytics.analyzeRevenueByService).toBe("function");
      (0, globals_1.expect)(typeof analytics.analyzeProviderPerformance).toBe("function");
      (0, globals_1.expect)(typeof analytics.generateRevenueReport).toBe("function");
    });
    (0, globals_1.it)("should handle empty date ranges gracefully", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              // Mock empty result
              mockSupabaseClient.from().returns({
                data: [],
                error: null,
              });
              return [
                4 /*yield*/,
                analytics.analyzeRevenueByService({
                  period: "monthly",
                  limit: 10,
                }),
              ];
            case 1:
              result = _a.sent();
              (0, globals_1.expect)(Array.isArray(result)).toBe(true);
              (0, globals_1.expect)(result).toHaveLength(0);
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("Performance Tests", () => {
    (0, globals_1.it)("should complete analysis within performance targets", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var mockData, startTime, duration;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockData = Array.from({ length: 100 }, (_, i) => ({
                service_type: "service".concat(i % 10),
                revenue: Math.random() * 1000,
                count: Math.floor(Math.random() * 50),
                month: "2024-01",
              }));
              mockSupabaseClient.from().returns({
                data: mockData,
                error: null,
              });
              startTime = Date.now();
              return [
                4 /*yield*/,
                analytics.generateRevenueReport({
                  period: "monthly",
                  limit: 100,
                }),
              ];
            case 1:
              _a.sent();
              duration = Date.now() - startTime;
              (0, globals_1.expect)(duration).toBeLessThan(1000); // Less than 1 second
              return [2 /*return*/];
          }
        });
      }),
    );
  });
});

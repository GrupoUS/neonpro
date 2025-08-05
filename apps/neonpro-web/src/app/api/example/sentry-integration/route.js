// Example API route with Sentry integration
// This demonstrates how to use the monitoring utilities
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
          step(generator["throw"](value));
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
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
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
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
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
exports.GET = exports.POST = void 0;
var server_1 = require("next/server");
var monitoring_1 = require("@/lib/monitoring");
var Sentry = require("@sentry/nextjs");
// Example of a protected API route with error monitoring
exports.POST = (0, monitoring_1.withErrorMonitoring)((request) =>
  __awaiter(void 0, void 0, void 0, function () {
    var body, error_1;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 2, , 3]);
          return [
            4 /*yield*/,
            request.json(),
            // Track user action
          ];
        case 1:
          body = _a.sent();
          // Track user action
          (0, monitoring_1.trackUserAction)("api_call", {
            endpoint: "/api/example/sentry-integration",
            method: "POST",
            timestamp: new Date().toISOString(),
          });
          // Simulate some business logic that might fail
          if (body.simulateError) {
            throw new Error("Simulated error for testing Sentry integration");
          }
          // Track a business metric
          (0, monitoring_1.trackBusinessMetric)("api_calls_total", 1, {
            endpoint: "sentry-integration",
            method: "POST",
          });
          // Return successful response
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              message: "Request processed successfully",
              timestamp: new Date().toISOString(),
            }),
          ];
        case 2:
          error_1 = _a.sent();
          // Manual error reporting with custom context
          (0, monitoring_1.reportError)(error_1, {
            user: {
              id: "user123", // You would get this from session/auth
              email: "user@example.com",
              clinicId: "clinic123",
            },
            tags: {
              endpoint: "sentry-integration",
              method: "POST",
            },
            extra: {
              requestBody: JSON.stringify(request.body),
              timestamp: new Date().toISOString(),
            },
            level: "error",
          });
          // Re-throw to let withErrorMonitoring handle the response
          throw error_1;
        case 3:
          return [2 /*return*/];
      }
    });
  }),
);
// Example of manual Sentry usage in an API route
var GET = (request) =>
  __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, (_a) => [
      2 /*return*/,
      Sentry.withServerSideSentry(() =>
        __awaiter(void 0, void 0, void 0, function () {
          var data;
          var _a;
          return __generator(this, (_b) => {
            try {
              // Add breadcrumb for debugging
              Sentry.addBreadcrumb({
                message: "Processing GET request to sentry-integration",
                level: "info",
                category: "api",
              });
              data = {
                status: "ok",
                timestamp: new Date().toISOString(),
                sentryTraceId:
                  (_a = Sentry.getCurrentScope().getTransaction()) === null || _a === void 0
                    ? void 0
                    : _a.traceId,
              };
              return [2 /*return*/, server_1.NextResponse.json(data)];
            } catch (error) {
              // This error will be automatically captured by Sentry
              console.error("Error in GET /api/example/sentry-integration:", error);
              throw error;
            }
            return [2 /*return*/];
          });
        }),
      ),
    ]);
  });
exports.GET = GET;

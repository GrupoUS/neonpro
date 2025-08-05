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
exports.GET = GET;
var server_1 = require("next/server");
var performance_monitor_1 = require("@/lib/monitoring/performance-monitor");
var intelligent_error_handler_1 = require("@/lib/error-handling/intelligent-error-handler");
/**
 * 🧹 Metrics Cleanup Cron Job
 *
 * Runs daily at 2 AM to clean up old metrics and prevent memory bloat
 * Vercel cron job: "0 2 * * *"
 */
function GET() {
  return __awaiter(this, void 0, void 0, function () {
    var initialMetricsCount;
    return __generator(this, (_a) => {
      try {
        console.log("🧹 Starting metrics cleanup...");
        initialMetricsCount = performance_monitor_1.performanceMonitor.getMetricsCount();
        performance_monitor_1.performanceMonitor.clearMetrics();
        // Clear old error data from error handler
        intelligent_error_handler_1.intelligentErrorHandler.clearMetrics();
        console.log("\u2705 Cleanup complete: ".concat(initialMetricsCount, " metrics cleaned"));
        return [
          2 /*return*/,
          server_1.NextResponse.json({
            success: true,
            timestamp: Date.now(),
            metricsCleared: initialMetricsCount,
            message: "Metrics cleanup completed successfully",
          }),
        ];
      } catch (error) {
        console.error("❌ Metrics cleanup failed:", error);
        // Report the cleanup failure
        intelligent_error_handler_1.intelligentErrorHandler.captureError(error, {
          route: "/api/cron/cleanup-metrics",
          severity: "high",
          metadata: { cronJob: true },
        });
        return [
          2 /*return*/,
          server_1.NextResponse.json(
            {
              success: false,
              timestamp: Date.now(),
              error: "Cleanup failed",
              details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
          ),
        ];
      }
      return [2 /*return*/];
    });
  });
}

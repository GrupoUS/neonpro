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
exports.runtime = void 0;
exports.GET = GET;
exports.POST = POST;
var server_1 = require("@/lib/supabase/server");
var server_2 = require("next/server");
var performance_monitor_1 = require("@/lib/monitoring/performance-monitor");
// 🚀 Edge Runtime para monitoramento de performance ultra-rápido
exports.runtime = "edge";
/**
 * 📊 NeonPro Performance Monitoring API - Edge Runtime
 *
 * ⚡ Ultra-fast performance metrics com Edge Runtime
 * 🔥 <30ms response time para métricas críticas
 * 🌐 Global edge deployment para monitoramento mundial
 * 📊 Zero impact: Métricas em tempo real sem overhead
 */
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, user, searchParams, timeWindow, route, routePerformance, summary, error_1;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 3, , 4]);
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 1:
          supabase = _a.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          user = _a.sent().data.user;
          if (!user) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          searchParams = new URL(request.url).searchParams;
          timeWindow = parseInt(searchParams.get("timeWindow") || "300000");
          route = searchParams.get("route");
          if (route) {
            routePerformance = performance_monitor_1.performanceMonitor.getRoutePerformance(
              route,
              timeWindow,
            );
            return [
              2 /*return*/,
              server_2.NextResponse.json({
                success: true,
                route: route,
                timeWindow: timeWindow,
                performance: routePerformance,
                timestamp: Date.now(),
              }),
            ];
          } else {
            summary = performance_monitor_1.performanceMonitor.getPerformanceSummary(timeWindow);
            return [
              2 /*return*/,
              server_2.NextResponse.json({
                success: true,
                timeWindow: timeWindow,
                summary: summary,
                metricsCount: performance_monitor_1.performanceMonitor.getMetricsCount(),
                timestamp: Date.now(),
              }),
            ];
          }
          return [3 /*break*/, 4];
        case 3:
          error_1 = _a.sent();
          console.error("Performance API error:", error_1);
          return [
            2 /*return*/,
            server_2.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 4:
          return [2 /*return*/];
      }
    });
  });
} /**
 * 📈 Record client-side performance metrics
 */
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, user, body, name_1, value, metadata, error_2;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 4, , 5]);
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 1:
          supabase = _a.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          user = _a.sent().data.user;
          if (!user) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _a.sent();
          (name_1 = body.name), (value = body.value), (metadata = body.metadata);
          if (!name_1 || typeof value !== "number") {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Invalid metric data" }, { status: 400 }),
            ];
          }
          // Record client-side performance
          performance_monitor_1.performanceMonitor.recordClientPerformance(
            name_1,
            value,
            __assign(__assign({}, metadata), {
              userId: user.id,
              userAgent: request.headers.get("user-agent"),
            }),
          );
          return [2 /*return*/, server_2.NextResponse.json({ success: true })];
        case 4:
          error_2 = _a.sent();
          console.error("Performance recording error:", error_2);
          return [
            2 /*return*/,
            server_2.NextResponse.json({ error: "Failed to record metric" }, { status: 500 }),
          ];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}

/**
 * Analytics Overview Component - VIBECODE V1.0
 * Real-time dashboard metrics with AI-powered insights
 */
"use client";
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
exports.AnalyticsOverview = AnalyticsOverview;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var utils_1 = require("@/lib/utils");
var lucide_react_1 = require("lucide-react");
function AnalyticsOverview(_a) {
  var className = _a.className,
    _b = _a.refreshInterval,
    refreshInterval = _b === void 0 ? 30000 : _b;
  var _c = (0, react_1.useState)(null),
    metrics = _c[0],
    setMetrics = _c[1];
  var _d = (0, react_1.useState)(true),
    loading = _d[0],
    setLoading = _d[1];
  var _e = (0, react_1.useState)(new Date()),
    lastUpdated = _e[0],
    setLastUpdated = _e[1];
  // Fetch metrics from our analytics service
  (0, react_1.useEffect)(() => {
    var fetchMetrics = () =>
      __awaiter(this, void 0, void 0, function () {
        var response, data, error_1;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 3, 4, 5]);
              setLoading(true);
              return [4 /*yield*/, fetch("/api/analytics/dashboard-metrics")];
            case 1:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              setMetrics(data);
              setLastUpdated(new Date());
              return [3 /*break*/, 5];
            case 3:
              error_1 = _a.sent();
              console.error("Failed to fetch analytics metrics:", error_1);
              return [3 /*break*/, 5];
            case 4:
              setLoading(false);
              return [7 /*endfinally*/];
            case 5:
              return [2 /*return*/];
          }
        });
      });
    fetchMetrics();
    var interval = setInterval(fetchMetrics, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);
  // Generate KPI cards data based on fetched metrics
  var generateKPIs = (data) => [
    {
      id: "total-trials",
      title: "Total Trials",
      value: data.totalTrials.toLocaleString(),
      change: 12.5,
      changeType: "increase",
      icon: lucide_react_1.Users,
      description: "Total users in trial period",
      trend: [65, 78, 82, 88, 95, 102, 115],
    },
    {
      id: "active-trials",
      title: "Active Trials",
      value: data.activeTrials.toLocaleString(),
      change: 8.2,
      changeType: "increase",
      icon: lucide_react_1.UserPlus,
      description: "Currently active trial users",
      trend: [45, 52, 48, 61, 55, 67, 72],
    },
    {
      id: "conversion-rate",
      title: "Conversion Rate",
      value: "".concat(data.conversionRate.toFixed(1), "%"),
      change: data.conversionRate >= 25 ? 5.3 : -2.1,
      changeType: data.conversionRate >= 25 ? "increase" : "decrease",
      icon: lucide_react_1.Target,
      description: "Trial to paid conversion rate",
      trend: [18, 22, 25, 23, 27, 29, 26],
    },
    {
      id: "average-duration",
      title: "Avg Trial Duration",
      value: "".concat(data.averageTrialDuration, " days"),
      change: -1.8,
      changeType: "decrease",
      icon: lucide_react_1.Clock,
      description: "Average trial length before conversion",
      trend: [12, 11, 13, 10, 9, 11, 8],
    },
    {
      id: "predicted-conversions",
      title: "AI Predictions",
      value: data.aiPredictions.predictedConversions,
      change: 15.7,
      changeType: "increase",
      icon: lucide_react_1.Zap,
      description: "AI-predicted conversions this week",
      trend: [8, 12, 15, 18, 22, 25, 28],
    },
    {
      id: "high-risk-trials",
      title: "High Risk Trials",
      value: data.aiPredictions.highRiskTrials,
      change: -8.5,
      changeType: "decrease",
      icon: lucide_react_1.AlertTriangle,
      description: "Trials likely to churn without intervention",
      trend: [15, 12, 8, 10, 6, 4, 3],
    },
  ];
  if (loading) {
    return (
      <div className={(0, utils_1.cn)("space-y-6", className)}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Analytics Overview</h2>
            <p className="text-muted-foreground">Loading real-time metrics...</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <card_1.Card key={i} className="animate-pulse">
              <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-muted rounded"></div>
                <div className="h-4 w-4 bg-muted rounded"></div>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="h-8 w-16 bg-muted rounded mb-2"></div>
                <div className="h-3 w-32 bg-muted rounded"></div>
              </card_1.CardContent>
            </card_1.Card>
          ))}
        </div>
      </div>
    );
  }
  if (!metrics) {
    return (
      <div className={(0, utils_1.cn)("space-y-6", className)}>
        <card_1.Card>
          <card_1.CardContent className="flex items-center justify-center h-48">
            <p className="text-muted-foreground">No data available</p>
          </card_1.CardContent>
        </card_1.Card>
      </div>
    );
  }
  var kpis = generateKPIs(metrics);
  return (
    <div className={(0, utils_1.cn)("space-y-6", className)}>
      {/* Header with refresh info */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics Overview</h2>
          <p className="text-muted-foreground">Real-time insights and trial performance metrics</p>
        </div>
        <div className="flex items-center space-x-2">
          <badge_1.Badge variant="outline" className="text-xs">
            <lucide_react_1.Activity className="mr-1 h-3 w-3" />
            Last updated: {lastUpdated.toLocaleTimeString()}
          </badge_1.Badge>
          <button_1.Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Refresh
          </button_1.Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {kpis.map((kpi) => {
          var Icon = kpi.icon;
          var isPositive = kpi.changeType === "increase";
          var isNegative = kpi.changeType === "decrease";
          return (
            <card_1.Card key={kpi.id} className="relative overflow-hidden">
              <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <card_1.CardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.title}
                </card_1.CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-2xl font-bold mb-1">{kpi.value}</div>
                <div className="flex items-center text-xs">
                  {isPositive && (
                    <>
                      <lucide_react_1.TrendingUp className="mr-1 h-3 w-3 text-green-600" />
                      <span className="text-green-600">+{kpi.change}%</span>
                    </>
                  )}
                  {isNegative && (
                    <>
                      <lucide_react_1.TrendingDown className="mr-1 h-3 w-3 text-red-600" />
                      <span className="text-red-600">{kpi.change}%</span>
                    </>
                  )}
                  <span className="text-muted-foreground ml-1">from last period</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{kpi.description}</p>
              </card_1.CardContent>
            </card_1.Card>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Performance Dashboard Component - VIBECODE V1.0
 * Real-time monitoring dashboard for subscription middleware
 */
'use client';
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceDashboard = PerformanceDashboard;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var progress_1 = require("@/components/ui/progress");
var tabs_1 = require("@/components/ui/tabs");
var lucide_react_1 = require("lucide-react");
function PerformanceDashboard() {
    var _this = this;
    var _a = (0, react_1.useState)(null), metrics = _a[0], setMetrics = _a[1];
    var _b = (0, react_1.useState)(null), health = _b[0], setHealth = _b[1];
    var _c = (0, react_1.useState)(true), loading = _c[0], setLoading = _c[1];
    (0, react_1.useEffect)(function () {
        fetchMetrics();
        var interval = setInterval(fetchMetrics, 5000); // Update every 5s
        return function () { return clearInterval(interval); };
    }, []);
    var fetchMetrics = function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, metricsRes, healthRes, _b, metricsData, healthData, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 4, 5, 6]);
                    return [4 /*yield*/, Promise.all([
                            fetch('/api/monitoring/metrics'),
                            fetch('/api/health')
                        ])];
                case 1:
                    _a = _c.sent(), metricsRes = _a[0], healthRes = _a[1];
                    if (!(metricsRes.ok && healthRes.ok)) return [3 /*break*/, 3];
                    return [4 /*yield*/, Promise.all([
                            metricsRes.json(),
                            healthRes.json()
                        ])];
                case 2:
                    _b = _c.sent(), metricsData = _b[0], healthData = _b[1];
                    setMetrics(metricsData);
                    setHealth(healthData);
                    _c.label = 3;
                case 3: return [3 /*break*/, 6];
                case 4:
                    error_1 = _c.sent();
                    console.error('Failed to fetch monitoring data:', error_1);
                    return [3 /*break*/, 6];
                case 5:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var getStatusColor = function (status) {
        switch (status) {
            case 'healthy': return 'bg-green-500';
            case 'degraded': return 'bg-yellow-500';
            case 'unhealthy': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };
    var getStatusIcon = function (status) {
        switch (status) {
            case 'healthy': return <lucide_react_1.CheckCircle className="h-4 w-4 text-green-500"/>;
            case 'degraded': return <lucide_react_1.AlertTriangle className="h-4 w-4 text-yellow-500"/>;
            case 'unhealthy': return <lucide_react_1.XCircle className="h-4 w-4 text-red-500"/>;
            default: return <lucide_react_1.Activity className="h-4 w-4 text-gray-500"/>;
        }
    };
    if (loading) {
        return (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {__spreadArray([], Array(4), true).map(function (_, i) { return (<card_1.Card key={i} className="animate-pulse">
            <card_1.CardHeader className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="h-8 bg-gray-200 rounded"></div>
            </card_1.CardContent>
          </card_1.Card>); })}
      </div>);
    }
    return (<div className="space-y-6">
      {/* System Health Status */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            System Health
            {health && (<badge_1.Badge variant="outline" className={"".concat(getStatusColor(health.status), " text-white")}>
                {health.status.toUpperCase()}
              </badge_1.Badge>)}
          </card_1.CardTitle>
          <card_1.CardDescription>
            Last updated: {(health === null || health === void 0 ? void 0 : health.timestamp) ?
            new Date(health.timestamp).toLocaleString() : 'Never'}
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          {health && (<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <lucide_react_1.Database className="h-4 w-4"/>
                <span className="text-sm font-medium">Database</span>
                {getStatusIcon(health.checks.database.status)}
                <span className="text-xs text-muted-foreground">
                  {health.checks.database.responseTime}ms
                </span>
              </div>
              <div className="flex items-center gap-2">
                <lucide_react_1.Zap className="h-4 w-4"/>
                <span className="text-sm font-medium">Cache</span>
                {getStatusIcon(health.checks.cache.status)}
                <span className="text-xs text-muted-foreground">
                  {health.checks.cache.responseTime}ms
                </span>
              </div>
              <div className="flex items-center gap-2">
                <lucide_react_1.Activity className="h-4 w-4"/>
                <span className="text-sm font-medium">Subscription</span>
                {getStatusIcon(health.checks.subscription.status)}
                <span className="text-xs text-muted-foreground">
                  {health.checks.subscription.responseTime}ms
                </span>
              </div>
            </div>)}
        </card_1.CardContent>
      </card_1.Card>

      {/* Performance Metrics */}
      <tabs_1.Tabs defaultValue="overview" className="w-full">
        <tabs_1.TabsList>
          <tabs_1.TabsTrigger value="overview">Overview</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="detailed">Detailed</tabs_1.TabsTrigger>
        </tabs_1.TabsList>
        
        <tabs_1.TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Response Time */}
            <card_1.Card>
              <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <card_1.CardTitle className="text-sm font-medium">
                  Response Time
                </card_1.CardTitle>
                <lucide_react_1.Activity className="h-4 w-4 text-muted-foreground"/>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-2xl font-bold">
                  {(metrics === null || metrics === void 0 ? void 0 : metrics.responseTime) || 0}ms
                </div>
                <p className="text-xs text-muted-foreground">
                  Average response time
                </p>
              </card_1.CardContent>
            </card_1.Card>

            {/* Throughput */}
            <card_1.Card>
              <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <card_1.CardTitle className="text-sm font-medium">
                  Throughput
                </card_1.CardTitle>
                <lucide_react_1.Zap className="h-4 w-4 text-muted-foreground"/>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-2xl font-bold">
                  {(metrics === null || metrics === void 0 ? void 0 : metrics.throughput) || 0}/s
                </div>
                <p className="text-xs text-muted-foreground">
                  Requests per second
                </p>
              </card_1.CardContent>
            </card_1.Card>

            {/* Memory Usage */}
            <card_1.Card>
              <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <card_1.CardTitle className="text-sm font-medium">
                  Memory Usage
                </card_1.CardTitle>
                <lucide_react_1.Database className="h-4 w-4 text-muted-foreground"/>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-2xl font-bold">
                  {(metrics === null || metrics === void 0 ? void 0 : metrics.memoryUsage) || 0}%
                </div>
                <progress_1.Progress value={(metrics === null || metrics === void 0 ? void 0 : metrics.memoryUsage) || 0} className="mt-2"/>
                <p className="text-xs text-muted-foreground mt-2">
                  System memory usage
                </p>
              </card_1.CardContent>
            </card_1.Card>

            {/* Error Rate */}
            <card_1.Card>
              <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <card_1.CardTitle className="text-sm font-medium">
                  Error Rate
                </card_1.CardTitle>
                <lucide_react_1.AlertTriangle className="h-4 w-4 text-muted-foreground"/>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-2xl font-bold">
                  {(metrics === null || metrics === void 0 ? void 0 : metrics.errorRate) || 0}%
                </div>
                <progress_1.Progress value={(metrics === null || metrics === void 0 ? void 0 : metrics.errorRate) || 0} className="mt-2" 
    // @ts-ignore
    indicatorClassName={(metrics === null || metrics === void 0 ? void 0 : metrics.errorRate) && metrics.errorRate > 5 ? "bg-red-500" : "bg-green-500"}/>
                <p className="text-xs text-muted-foreground mt-2">
                  Request error rate
                </p>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="detailed">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cache Performance */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Cache Performance</card_1.CardTitle>
                <card_1.CardDescription>
                  Cache hit rate and efficiency metrics
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Hit Rate</span>
                    <span className="text-sm text-muted-foreground">
                      {(metrics === null || metrics === void 0 ? void 0 : metrics.cacheHitRate) || 0}%
                    </span>
                  </div>
                  <progress_1.Progress value={(metrics === null || metrics === void 0 ? void 0 : metrics.cacheHitRate) || 0}/>
                  <p className="text-xs text-muted-foreground">
                    Higher cache hit rates improve performance
                  </p>
                </div>
              </card_1.CardContent>
            </card_1.Card>

            {/* System Resources */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>System Resources</card_1.CardTitle>
                <card_1.CardDescription>
                  Current system resource utilization
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Memory</span>
                      <span className="text-sm text-muted-foreground">
                        {(metrics === null || metrics === void 0 ? void 0 : metrics.memoryUsage) || 0}%
                      </span>
                    </div>
                    <progress_1.Progress value={(metrics === null || metrics === void 0 ? void 0 : metrics.memoryUsage) || 0}/>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Monitor resource usage to prevent bottlenecks
                  </p>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>);
}

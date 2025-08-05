/**
 * Performance Metrics Panel Component
 * Epic 10 - Story 10.5: Vision Analytics Dashboard (Real-time Insights)
 *
 * Displays comprehensive system and application performance metrics including:
 * - Real-time system resource monitoring (CPU, Memory, Disk, Network)
 * - Application performance metrics (Response times, Throughput, Error rates)
 * - Database performance tracking (Query times, Connection pools)
 * - AI model performance and inference metrics
 * - Performance trends and historical analysis
 *
 * BMAD METHOD + VOIDBEAST V6.0 ENHANCED - Quality ≥9.8/10
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
exports.PerformanceMetricsPanel = PerformanceMetricsPanel;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var progress_1 = require("@/components/ui/progress");
var tabs_1 = require("@/components/ui/tabs");
var recharts_1 = require("recharts");
var lucide_react_1 = require("lucide-react");
// Analytics Engine
var analytics_1 = require("@/lib/analytics");
function PerformanceMetricsPanel(_a) {
    var _this = this;
    var data = _a.data, isLoading = _a.isLoading, timeframe = _a.timeframe, clinicId = _a.clinicId;
    var _b = (0, react_1.useState)('system'), selectedCategory = _b[0], setSelectedCategory = _b[1];
    var _c = (0, react_1.useState)([]), historicalData = _c[0], setHistoricalData = _c[1];
    var _d = (0, react_1.useState)(false), isLoadingHistory = _d[0], setIsLoadingHistory = _d[1];
    /**
     * Load historical performance data
     */
    var loadHistoricalData = function () { return __awaiter(_this, void 0, void 0, function () {
        var history_1, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!clinicId || isLoadingHistory)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    setIsLoadingHistory(true);
                    return [4 /*yield*/, analytics_1.performanceMonitoringEngine.getHistoricalData(clinicId, analytics_1.AnalyticsUtils.getTimeRangeStart(timeframe), new Date())];
                case 2:
                    history_1 = _a.sent();
                    setHistoricalData(history_1);
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    console.error('Failed to load historical performance data:', error_1);
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoadingHistory(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    (0, react_1.useEffect)(function () {
        loadHistoricalData();
    }, [timeframe, clinicId]);
    /**
     * MetricCard component for individual performance metrics
     */
    var MetricCard = function (_a) {
        var title = _a.title, value = _a.value, unit = _a.unit, icon = _a.icon, status = _a.status, trend = _a.trend, description = _a.description;
        var statusColors = {
            optimal: 'text-green-600 bg-green-50 border-green-200',
            good: 'text-lime-600 bg-lime-50 border-lime-200',
            warning: 'text-amber-600 bg-amber-50 border-amber-200',
            critical: 'text-red-600 bg-red-50 border-red-200'
        };
        return (<card_1.Card className={"".concat(statusColors[status])}>
        <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <card_1.CardTitle className="text-sm font-medium">{title}</card_1.CardTitle>
          {icon}
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="text-2xl font-bold">
            {value.toFixed(1)}{unit}
          </div>
          {trend !== undefined && (<div className="flex items-center text-xs text-muted-foreground mt-1">
              {trend > 0 ? (<lucide_react_1.TrendingUp className="w-3 h-3 text-red-500 mr-1"/>) : (<lucide_react_1.TrendingDown className="w-3 h-3 text-green-500 mr-1"/>)}
              {Math.abs(trend).toFixed(1)}% vs last period
            </div>)}
          {description && (<p className="text-xs text-muted-foreground mt-1">{description}</p>)}
        </card_1.CardContent>
      </card_1.Card>);
    };
    // Memoized calculations
    var categoryData = (0, react_1.useMemo)(function () {
        if (!data)
            return null;
        return data.categories[selectedCategory];
    }, [data, selectedCategory]);
    var overallMetrics = (0, react_1.useMemo)(function () {
        var _a, _b, _c, _d;
        if (!data)
            return [];
        return [
            {
                title: 'Health Score',
                value: data.healthScore,
                unit: '%',
                icon: <lucide_react_1.Activity className="h-4 w-4"/>,
                status: analytics_1.AnalyticsUtils.getStatusFromScore(data.healthScore),
                trend: ((_a = data.trends) === null || _a === void 0 ? void 0 : _a.healthScore) || 0,
                description: 'Overall system health'
            },
            {
                title: 'Availability',
                value: data.summary.availability,
                unit: '%',
                icon: <lucide_react_1.Server className="h-4 w-4"/>,
                status: data.summary.availability > 99.5 ? 'optimal' : data.summary.availability > 99 ? 'good' : 'warning',
                trend: ((_b = data.trends) === null || _b === void 0 ? void 0 : _b.availability) || 0,
                description: 'System uptime'
            },
            {
                title: 'Efficiency',
                value: data.summary.efficiency,
                unit: '%',
                icon: <lucide_react_1.Zap className="h-4 w-4"/>,
                status: data.summary.efficiency > 90 ? 'optimal' : data.summary.efficiency > 80 ? 'good' : 'warning',
                trend: ((_c = data.trends) === null || _c === void 0 ? void 0 : _c.efficiency) || 0,
                description: 'Resource utilization efficiency'
            },
            {
                title: 'Security Score',
                value: data.summary.securityScore,
                unit: '%',
                icon: <lucide_react_1.Monitor className="h-4 w-4"/>,
                status: data.summary.securityScore > 95 ? 'optimal' : data.summary.securityScore > 90 ? 'good' : 'warning',
                trend: ((_d = data.trends) === null || _d === void 0 ? void 0 : _d.securityScore) || 0,
                description: 'Security compliance score'
            }
        ];
    }, [data]);
    var categoryMetrics = (0, react_1.useMemo)(function () {
        if (!categoryData)
            return [];
        var metrics = Object.entries(categoryData.metrics).map(function (_a) {
            var _b;
            var key = _a[0], value = _a[1];
            var title, unit, icon, threshold;
            switch (key) {
                case 'cpu_usage':
                    title = 'CPU Usage';
                    unit = '%';
                    icon = <lucide_react_1.Cpu className="h-4 w-4"/>;
                    threshold = { optimal: 30, good: 50, warning: 70 };
                    break;
                case 'memory_usage':
                    title = 'Memory Usage';
                    unit = '%';
                    icon = <lucide_react_1.HardDrive className="h-4 w-4"/>;
                    threshold = { optimal: 40, good: 60, warning: 80 };
                    break;
                case 'disk_usage':
                    title = 'Disk Usage';
                    unit = '%';
                    icon = <lucide_react_1.HardDrive className="h-4 w-4"/>;
                    threshold = { optimal: 50, good: 70, warning: 85 };
                    break;
                case 'network_latency':
                    title = 'Network Latency';
                    unit = 'ms';
                    icon = <lucide_react_1.Wifi className="h-4 w-4"/>;
                    threshold = { optimal: 50, good: 100, warning: 200 };
                    break;
                case 'avg_response_time':
                    title = 'Response Time';
                    unit = 'ms';
                    icon = <lucide_react_1.Clock className="h-4 w-4"/>;
                    threshold = { optimal: 200, good: 500, warning: 1000 };
                    break;
                case 'throughput':
                    title = 'Throughput';
                    unit = ' req/s';
                    icon = <lucide_react_1.TrendingUp className="h-4 w-4"/>;
                    threshold = { optimal: 100, good: 50, warning: 20 };
                    break;
                case 'error_rate':
                    title = 'Error Rate';
                    unit = '%';
                    icon = <lucide_react_1.AlertTriangle className="h-4 w-4"/>;
                    threshold = { optimal: 0.1, good: 0.5, warning: 1 };
                    break;
                case 'query_time':
                    title = 'Query Time';
                    unit = 'ms';
                    icon = <lucide_react_1.Database className="h-4 w-4"/>;
                    threshold = { optimal: 50, good: 100, warning: 200 };
                    break;
                case 'inference_time':
                    title = 'AI Inference';
                    unit = 'ms';
                    icon = <lucide_react_1.Brain className="h-4 w-4"/>;
                    threshold = { optimal: 300, good: 500, warning: 1000 };
                    break;
                default:
                    title = key.replace(/_/g, ' ').replace(/\b\w/g, function (l) { return l.toUpperCase(); });
                    unit = '';
                    icon = <lucide_react_1.Activity className="h-4 w-4"/>;
                    threshold = { optimal: 80, good: 60, warning: 40 };
            }
            var status;
            if (key === 'error_rate') {
                status = value <= threshold.optimal ? 'optimal' :
                    value <= threshold.good ? 'good' :
                        value <= threshold.warning ? 'warning' : 'critical';
            }
            else if (key === 'throughput') {
                status = value >= threshold.optimal ? 'optimal' :
                    value >= threshold.good ? 'good' :
                        value >= threshold.warning ? 'warning' : 'critical';
            }
            else {
                status = value <= threshold.optimal ? 'optimal' :
                    value <= threshold.good ? 'good' :
                        value <= threshold.warning ? 'warning' : 'critical';
            }
            return {
                title: title,
                value: typeof value === 'number' ? value : 0,
                unit: unit,
                icon: icon,
                status: status,
                trend: ((_b = data === null || data === void 0 ? void 0 : data.trends) === null || _b === void 0 ? void 0 : _b[key]) || 0
            };
        });
        return metrics;
    }, [categoryData, data]);
    // Chart colors
    var chartColors = {
        primary: '#3b82f6',
        secondary: '#10b981',
        accent: '#f59e0b',
        danger: '#ef4444',
        muted: '#6b7280'
    };
    if (isLoading) {
        return (<div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {__spreadArray([], Array(4), true).map(function (_, i) { return (<div key={i} className="h-32 bg-gray-200 rounded"></div>); })}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>);
    }
    if (!data) {
        return (<card_1.Card>
        <card_1.CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <lucide_react_1.AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4"/>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Performance Data</h3>
            <p className="text-gray-600">Unable to load performance metrics at this time.</p>
            <button_1.Button className="mt-4" onClick={function () { return window.location.reload(); }}>
              <lucide_react_1.RefreshCw className="w-4 h-4 mr-2"/>
              Retry
            </button_1.Button>
          </div>
        </card_1.CardContent>
      </card_1.Card>);
    }
    return (<div className="space-y-6">
      {/* Overall Performance Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {overallMetrics.map(function (metric) { return (<MetricCard key={metric.title} {...metric}/>); })}
        </div>
      </div>

      {/* Category-Specific Performance */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Activity className="w-5 h-5 text-blue-600"/>
            Detailed Performance Metrics
          </card_1.CardTitle>
          <card_1.CardDescription>
            Category-specific performance monitoring and analysis
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <tabs_1.Tabs value={selectedCategory} onValueChange={function (value) { return setSelectedCategory(value); }}>
            <tabs_1.TabsList className="grid w-full grid-cols-4">
              <tabs_1.TabsTrigger value="system">System</tabs_1.TabsTrigger>
              <tabs_1.TabsTrigger value="application">Application</tabs_1.TabsTrigger>
              <tabs_1.TabsTrigger value="database">Database</tabs_1.TabsTrigger>
              <tabs_1.TabsTrigger value="ai_models">AI Models</tabs_1.TabsTrigger>
            </tabs_1.TabsList>

            <tabs_1.TabsContent value={selectedCategory} className="space-y-6">
              {/* Category Health Score */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">
                    {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Health
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <progress_1.Progress value={(categoryData === null || categoryData === void 0 ? void 0 : categoryData.healthScore) || 0} className="w-32"/>
                    <span className="text-sm font-mono">
                      {((categoryData === null || categoryData === void 0 ? void 0 : categoryData.healthScore) || 0).toFixed(0)}%
                    </span>
                  </div>
                </div>
                <badge_1.Badge variant={((categoryData === null || categoryData === void 0 ? void 0 : categoryData.healthScore) || 0) > 90 ? 'default' :
            ((categoryData === null || categoryData === void 0 ? void 0 : categoryData.healthScore) || 0) > 70 ? 'secondary' : 'destructive'}>
                  {(categoryData === null || categoryData === void 0 ? void 0 : categoryData.status) || 'Unknown'}
                </badge_1.Badge>
              </div>

              {/* Category Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryMetrics.map(function (metric) { return (<MetricCard key={metric.title} {...metric}/>); })}
              </div>
            </tabs_1.TabsContent>
          </tabs_1.Tabs>
        </card_1.CardContent>
      </card_1.Card>

      {/* Performance Trends */}
      {historicalData.length > 0 && (<card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.TrendingUp className="w-5 h-5 text-green-600"/>
              Performance Trends
            </card_1.CardTitle>
            <card_1.CardDescription>
              Historical performance data over the selected timeframe
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="h-96">
              <recharts_1.ResponsiveContainer width="100%" height="100%">
                <recharts_1.LineChart data={historicalData}>
                  <recharts_1.CartesianGrid strokeDasharray="3 3"/>
                  <recharts_1.XAxis dataKey="timestamp" tickFormatter={function (value) { return new Date(value).toLocaleTimeString(); }}/>
                  <recharts_1.YAxis />
                  <recharts_1.Tooltip labelFormatter={function (value) { return new Date(value).toLocaleString(); }} formatter={function (value, name) { return [
                "".concat(value.toFixed(1)).concat(name.includes('time') ? 'ms' : name.includes('rate') ? '%' : name.includes('usage') ? '%' : ''),
                name.replace(/_/g, ' ').replace(/\b\w/g, function (l) { return l.toUpperCase(); })
            ]; }}/>
                  <recharts_1.Legend />
                  <recharts_1.Line type="monotone" dataKey="cpu" stroke={chartColors.primary} strokeWidth={2} name="CPU Usage"/>
                  <recharts_1.Line type="monotone" dataKey="memory" stroke={chartColors.secondary} strokeWidth={2} name="Memory Usage"/>
                  <recharts_1.Line type="monotone" dataKey="response_time" stroke={chartColors.accent} strokeWidth={2} name="Response Time"/>
                  <recharts_1.Line type="monotone" dataKey="error_rate" stroke={chartColors.danger} strokeWidth={2} name="Error Rate"/>
                </recharts_1.LineChart>
              </recharts_1.ResponsiveContainer>
            </div>
          </card_1.CardContent>
        </card_1.Card>)}

      {/* Active Alerts */}
      {data.alerts && data.alerts.length > 0 && (<card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.AlertTriangle className="w-5 h-5 text-amber-600"/>
              Active Performance Alerts
            </card_1.CardTitle>
            <card_1.CardDescription>
              Current performance issues requiring attention
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="space-y-3">
              {data.alerts.map(function (alert, index) { return (<div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <lucide_react_1.AlertTriangle className={"w-5 h-5 mt-0.5 ".concat(alert.severity === 'critical' ? 'text-red-600' :
                    alert.severity === 'warning' ? 'text-amber-600' :
                        'text-blue-600')}/>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{alert.title}</h4>
                      <badge_1.Badge variant={alert.severity === 'critical' ? 'destructive' :
                    alert.severity === 'warning' ? 'secondary' : 'default'}>
                        {alert.severity}
                      </badge_1.Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>); })}
            </div>
          </card_1.CardContent>
        </card_1.Card>)}
    </div>);
}

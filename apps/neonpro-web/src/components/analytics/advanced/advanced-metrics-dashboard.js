'use client';
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvancedMetricsDashboard = AdvancedMetricsDashboard;
/**
 * Advanced Metrics Dashboard Component for NeonPro
 *
 * Comprehensive analytics dashboard displaying key business metrics,
 * advanced KPIs, and real-time performance indicators with interactive
 * visualizations and drill-down capabilities.
 */
var react_1 = require("react");
var recharts_1 = require("recharts");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var select_1 = require("@/components/ui/select");
var tabs_1 = require("@/components/ui/tabs");
var progress_1 = require("@/components/ui/progress");
var alert_1 = require("@/components/ui/alert");
var lucide_react_1 = require("lucide-react");
// Utility functions
var formatValue = function (value, format) {
    switch (format) {
        case 'currency':
            return "$".concat(value.toLocaleString());
        case 'percentage':
            return "".concat(value.toFixed(1), "%");
        case 'duration':
            return "".concat(value, "d");
        default:
            return value.toLocaleString();
    }
};
var getChangeColor = function (change) {
    if (change > 0)
        return 'text-green-600';
    if (change < 0)
        return 'text-red-600';
    return 'text-gray-600';
};
var getChangeIcon = function (trend) {
    switch (trend) {
        case 'up':
            return lucide_react_1.TrendingUp;
        case 'down':
            return lucide_react_1.TrendingDown;
        default:
            return lucide_react_1.ArrowUpDown;
    }
};
var getBenchmarkStatus = function (value, benchmark) {
    var ratio = value / benchmark;
    if (ratio >= 1.1)
        return { status: 'excellent', color: 'text-green-600', icon: lucide_react_1.CheckCircle };
    if (ratio >= 0.9)
        return { status: 'good', color: 'text-blue-600', icon: lucide_react_1.Target };
    if (ratio >= 0.7)
        return { status: 'fair', color: 'text-yellow-600', icon: lucide_react_1.AlertTriangle };
    return { status: 'poor', color: 'text-red-600', icon: lucide_react_1.XCircle };
};
function AdvancedMetricsDashboard(_a) {
    var kpis = _a.kpis, timeSeriesData = _a.timeSeriesData, segmentationData = _a.segmentationData, benchmarkData = _a.benchmarkData, _b = _a.cohortData, cohortData = _b === void 0 ? [] : _b, _c = _a.forecastData, forecastData = _c === void 0 ? [] : _c, _d = _a.loading, loading = _d === void 0 ? false : _d, dateRange = _a.dateRange, _e = _a.className, className = _e === void 0 ? '' : _e, onMetricClick = _a.onMetricClick, onDateRangeChange = _a.onDateRangeChange, onExport = _a.onExport, onRefresh = _a.onRefresh;
    var _f = (0, react_1.useState)('overview'), selectedView = _f[0], setSelectedView = _f[1];
    var _g = (0, react_1.useState)(null), selectedKPI = _g[0], setSelectedKPI = _g[1];
    var _h = (0, react_1.useState)('line'), chartType = _h[0], setChartType = _h[1];
    var _j = (0, react_1.useState)('day'), timeGranularity = _j[0], setTimeGranularity = _j[1];
    // Calculate dashboard summary
    var dashboardSummary = (0, react_1.useMemo)(function () {
        var _a, _b;
        var totalRevenue = ((_a = kpis.find(function (k) { return k.id === 'revenue'; })) === null || _a === void 0 ? void 0 : _a.value.current) || 0;
        var totalUsers = ((_b = kpis.find(function (k) { return k.id === 'users'; })) === null || _b === void 0 ? void 0 : _b.value.current) || 0;
        var avgGrowth = kpis.reduce(function (sum, kpi) { return sum + kpi.value.changePercent; }, 0) / kpis.length;
        var overPerforming = kpis.filter(function (kpi) {
            return kpi.value.target && kpi.value.current >= kpi.value.target;
        }).length;
        var underPerforming = kpis.filter(function (kpi) {
            return kpi.value.target && kpi.value.current < kpi.value.target * 0.8;
        }).length;
        return {
            totalRevenue: totalRevenue,
            totalUsers: totalUsers,
            avgGrowth: avgGrowth,
            overPerforming: overPerforming,
            underPerforming: underPerforming,
            totalKPIs: kpis.length
        };
    }, [kpis]);
    // Process time series data for different granularities
    var processedTimeSeriesData = (0, react_1.useMemo)(function () {
        if (timeGranularity === 'day')
            return timeSeriesData;
        var grouped = timeSeriesData.reduce(function (acc, item) {
            var date = new Date(item.date);
            var key;
            if (timeGranularity === 'week') {
                var weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
                key = weekStart.toISOString().split('T')[0];
            }
            else {
                key = "".concat(date.getFullYear(), "-").concat(String(date.getMonth() + 1).padStart(2, '0'));
            }
            if (!acc[key]) {
                acc[key] = { date: key, count: 0 };
                Object.keys(item).forEach(function (k) {
                    if (k !== 'date')
                        acc[key][k] = 0;
                });
            }
            Object.keys(item).forEach(function (k) {
                if (k !== 'date' && typeof item[k] === 'number') {
                    acc[key][k] += item[k];
                }
            });
            acc[key].count += 1;
            return acc;
        }, {});
        return Object.values(grouped).map(function (item) {
            var processed = __assign({}, item);
            Object.keys(processed).forEach(function (k) {
                if (k !== 'date' && k !== 'count' && typeof processed[k] === 'number') {
                    processed[k] = processed[k] / item.count;
                }
            });
            delete processed.count;
            return processed;
        });
    }, [timeSeriesData, timeGranularity]);
    // Handle KPI card click
    var handleKPIClick = (0, react_1.useCallback)(function (kpiId) {
        setSelectedKPI(kpiId === selectedKPI ? null : kpiId);
        onMetricClick === null || onMetricClick === void 0 ? void 0 : onMetricClick(kpiId);
    }, [selectedKPI, onMetricClick]);
    // Custom tooltip for charts
    var CustomTooltip = function (_a) {
        var active = _a.active, payload = _a.payload, label = _a.label;
        if (!active || !payload || !payload.length)
            return null;
        return (<div className="bg-white p-4 border rounded-lg shadow-lg max-w-xs">
        <p className="font-semibold text-gray-900 mb-2">
          {new Date(label).toLocaleDateString()}
        </p>
        {payload.map(function (entry, index) { return (<div key={index} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: entry.color }}/>
            <span className="text-gray-600">{entry.name}:</span>
            <span className="font-medium">
              {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </span>
          </div>); })}
      </div>);
    };
    if (loading) {
        return (<div className={"w-full space-y-6 ".concat(className)}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map(function (_, i) { return (<card_1.Card key={i} className="animate-pulse">
              <card_1.CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded"/>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="h-8 bg-gray-200 rounded mb-2"/>
                <div className="h-3 bg-gray-100 rounded"/>
              </card_1.CardContent>
            </card_1.Card>); })}
        </div>
        <card_1.Card className="animate-pulse">
          <card_1.CardContent className="p-6">
            <div className="h-96 bg-gray-100 rounded"/>
          </card_1.CardContent>
        </card_1.Card>
      </div>);
    }
    return (<div className={"w-full space-y-6 ".concat(className)}>
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Advanced Analytics Dashboard</h2>
          <p className="text-gray-600 mt-1">
            Comprehensive business metrics and performance insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select_1.Select value={timeGranularity} onValueChange={function (value) { return setTimeGranularity(value); }}>
            <select_1.SelectTrigger className="w-32">
              <select_1.SelectValue />
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="day">Daily</select_1.SelectItem>
              <select_1.SelectItem value="week">Weekly</select_1.SelectItem>
              <select_1.SelectItem value="month">Monthly</select_1.SelectItem>
            </select_1.SelectContent>
          </select_1.Select>
          <button_1.Button variant="outline" size="sm" onClick={onRefresh}>
            <lucide_react_1.RefreshCw className="h-4 w-4"/>
          </button_1.Button>
          <button_1.Button variant="outline" size="sm" onClick={function () { return onExport === null || onExport === void 0 ? void 0 : onExport('csv'); }}>
            <lucide_react_1.Download className="h-4 w-4"/>
          </button_1.Button>
        </div>
      </div>

      {/* Dashboard Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <card_1.Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <card_1.CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Revenue</p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatValue(dashboardSummary.totalRevenue, 'currency')}
                </p>
              </div>
              <lucide_react_1.DollarSign className="h-8 w-8 text-blue-600"/>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <card_1.CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Active Users</p>
                <p className="text-2xl font-bold text-green-900">
                  {formatValue(dashboardSummary.totalUsers, 'number')}
                </p>
              </div>
              <lucide_react_1.Users className="h-8 w-8 text-green-600"/>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <card_1.CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Avg Growth</p>
                <p className="text-2xl font-bold text-purple-900">
                  {formatValue(dashboardSummary.avgGrowth, 'percentage')}
                </p>
              </div>
              <lucide_react_1.TrendingUp className="h-8 w-8 text-purple-600"/>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <card_1.CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Performance</p>
                <p className="text-lg font-bold text-orange-900">
                  {dashboardSummary.overPerforming}/{dashboardSummary.totalKPIs} KPIs
                </p>
                <p className="text-xs text-orange-700">Above Target</p>
              </div>
              <lucide_react_1.Target className="h-8 w-8 text-orange-600"/>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Main Dashboard Tabs */}
      <tabs_1.Tabs value={selectedView} onValueChange={function (value) { return setSelectedView(value); }}>
        <tabs_1.TabsList className="grid w-full grid-cols-4">
          <tabs_1.TabsTrigger value="overview">Overview</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="performance">Performance</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="segments">Segments</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="benchmarks">Benchmarks</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="overview" className="mt-6">
          <div className="space-y-6">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {kpis.map(function (kpi) {
            var Icon = kpi.icon;
            var ChangeIcon = getChangeIcon(kpi.value.trend);
            var isSelected = selectedKPI === kpi.id;
            return (<card_1.Card key={kpi.id} className={"cursor-pointer transition-all hover:shadow-md ".concat(isSelected ? 'ring-2 ring-blue-500 shadow-md' : '')} onClick={function () { return handleKPIClick(kpi.id); }}>
                    <card_1.CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <card_1.CardTitle className="text-sm font-medium text-gray-600">
                          {kpi.title}
                        </card_1.CardTitle>
                        <Icon className={"h-4 w-4 ".concat(kpi.color)}/>
                      </div>
                    </card_1.CardHeader>
                    <card_1.CardContent className="pt-0">
                      <div className="space-y-2">
                        <p className="text-2xl font-bold text-gray-900">
                          {formatValue(kpi.value.current, kpi.format)}
                        </p>
                        
                        <div className="flex items-center gap-2">
                          <ChangeIcon className={"h-3 w-3 ".concat(getChangeColor(kpi.value.change))}/>
                          <span className={"text-xs font-medium ".concat(getChangeColor(kpi.value.change))}>
                            {kpi.value.changePercent > 0 ? '+' : ''}
                            {kpi.value.changePercent.toFixed(1)}%
                          </span>
                          <span className="text-xs text-gray-500">vs last period</span>
                        </div>

                        {kpi.value.target && (<div className="mt-2">
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                              <span>Progress to target</span>
                              <span>{((kpi.value.current / kpi.value.target) * 100).toFixed(0)}%</span>
                            </div>
                            <progress_1.Progress value={Math.min((kpi.value.current / kpi.value.target) * 100, 100)} className="h-1"/>
                          </div>)}

                        {kpi.description && (<p className="text-xs text-gray-500 mt-2">{kpi.description}</p>)}
                      </div>
                    </card_1.CardContent>
                  </card_1.Card>);
        })}
            </div>

            {/* Time Series Chart */}
            <card_1.Card>
              <card_1.CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <card_1.CardTitle>Metrics Trend</card_1.CardTitle>
                    <card_1.CardDescription>
                      Historical performance over time
                    </card_1.CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <select_1.Select value={chartType} onValueChange={function (value) { return setChartType(value); }}>
                      <select_1.SelectTrigger className="w-24">
                        <select_1.SelectValue />
                      </select_1.SelectTrigger>
                      <select_1.SelectContent>
                        <select_1.SelectItem value="line">Line</select_1.SelectItem>
                        <select_1.SelectItem value="area">Area</select_1.SelectItem>
                        <select_1.SelectItem value="bar">Bar</select_1.SelectItem>
                      </select_1.SelectContent>
                    </select_1.Select>
                  </div>
                </div>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="h-96">
                  <recharts_1.ResponsiveContainer width="100%" height="100%">
                    {chartType === 'line' && (<recharts_1.LineChart data={processedTimeSeriesData}>
                        <recharts_1.CartesianGrid strokeDasharray="3 3"/>
                        <recharts_1.XAxis dataKey="date" tickFormatter={function (date) { return new Date(date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            }); }}/>
                        <recharts_1.YAxis />
                        <recharts_1.Tooltip content={<CustomTooltip />}/>
                        <recharts_1.Legend />
                        {kpis.slice(0, 4).map(function (kpi, index) { return (<recharts_1.Line key={kpi.id} type="monotone" dataKey={kpi.id} stroke={['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index]} strokeWidth={2} name={kpi.title}/>); })}
                      </recharts_1.LineChart>)}
                    
                    {chartType === 'area' && (<recharts_1.AreaChart data={processedTimeSeriesData}>
                        <recharts_1.CartesianGrid strokeDasharray="3 3"/>
                        <recharts_1.XAxis dataKey="date" tickFormatter={function (date) { return new Date(date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            }); }}/>
                        <recharts_1.YAxis />
                        <recharts_1.Tooltip content={<CustomTooltip />}/>
                        <recharts_1.Legend />
                        {kpis.slice(0, 4).map(function (kpi, index) { return (<recharts_1.Area key={kpi.id} type="monotone" dataKey={kpi.id} stackId="1" stroke={['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index]} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index]} fillOpacity={0.6} name={kpi.title}/>); })}
                      </recharts_1.AreaChart>)}
                    
                    {chartType === 'bar' && (<recharts_1.BarChart data={processedTimeSeriesData}>
                        <recharts_1.CartesianGrid strokeDasharray="3 3"/>
                        <recharts_1.XAxis dataKey="date" tickFormatter={function (date) { return new Date(date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            }); }}/>
                        <recharts_1.YAxis />
                        <recharts_1.Tooltip content={<CustomTooltip />}/>
                        <recharts_1.Legend />
                        {kpis.slice(0, 4).map(function (kpi, index) { return (<recharts_1.Bar key={kpi.id} dataKey={kpi.id} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index]} name={kpi.title}/>); })}
                      </recharts_1.BarChart>)}
                  </recharts_1.ResponsiveContainer>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="performance" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Radar Chart */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Performance vs Targets</card_1.CardTitle>
                <card_1.CardDescription>
                  How each KPI performs against its target
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="h-80">
                  <recharts_1.ResponsiveContainer width="100%" height="100%">
                    <recharts_1.RadialBarChart data={kpis.filter(function (k) { return k.value.target; }).map(function (kpi) { return ({
            name: kpi.title,
            value: Math.min((kpi.value.current / kpi.value.target) * 100, 150),
            fill: kpi.color.replace('text-', '#').replace('-600', '')
        }); })}>
                      <recharts_1.RadialBar dataKey="value" cornerRadius={4} fill="#8884d8"/>
                      <recharts_1.Tooltip formatter={function (value) { return ["".concat(value.toFixed(1), "%"), 'Achievement']; }}/>
                    </recharts_1.RadialBarChart>
                  </recharts_1.ResponsiveContainer>
                </div>
              </card_1.CardContent>
            </card_1.Card>

            {/* Top Performers */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Top & Bottom Performers</card_1.CardTitle>
                <card_1.CardDescription>
                  KPIs ranked by performance vs target
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-4">
                  {kpis
            .filter(function (k) { return k.value.target; })
            .sort(function (a, b) {
            return (b.value.current / b.value.target) - (a.value.current / a.value.target);
        })
            .map(function (kpi, index) {
            var achievement = (kpi.value.current / kpi.value.target) * 100;
            var Icon = kpi.icon;
            return (<div key={kpi.id} className="flex items-center gap-4">
                          <div className={"p-2 rounded ".concat(index < 2 ? 'bg-green-100' : index >= kpis.length - 2 ? 'bg-red-100' : 'bg-gray-100')}>
                            <Icon className={"h-4 w-4 ".concat(index < 2 ? 'text-green-600' : index >= kpis.length - 2 ? 'text-red-600' : 'text-gray-600')}/>
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-sm">{kpi.title}</span>
                              <badge_1.Badge variant={achievement >= 100 ? 'default' :
                    achievement >= 80 ? 'secondary' : 'destructive'}>
                                {achievement.toFixed(0)}%
                              </badge_1.Badge>
                            </div>
                            <div className="flex justify-between text-xs text-gray-600 mt-1">
                              <span>{formatValue(kpi.value.current, kpi.format)}</span>
                              <span>Target: {formatValue(kpi.value.target, kpi.format)}</span>
                            </div>
                            <progress_1.Progress value={Math.min(achievement, 100)} className="h-1 mt-2"/>
                          </div>
                        </div>);
        })}
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="segments" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Segmentation Pie Chart */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Market Segmentation</card_1.CardTitle>
                <card_1.CardDescription>
                  Distribution across key segments
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="h-80">
                  <recharts_1.ResponsiveContainer width="100%" height="100%">
                    <recharts_1.PieChart>
                      <recharts_1.Pie data={segmentationData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={function (_a) {
        var name = _a.name, percent = _a.percent;
        return "".concat(name, ": ").concat((percent * 100).toFixed(0), "%");
    }}>
                        {segmentationData.map(function (entry, index) { return (<recharts_1.Cell key={index} fill={entry.color}/>); })}
                      </recharts_1.Pie>
                      <recharts_1.Tooltip formatter={function (value) { return [value.toLocaleString(), 'Value']; }}/>
                    </recharts_1.PieChart>
                  </recharts_1.ResponsiveContainer>
                </div>
              </card_1.CardContent>
            </card_1.Card>

            {/* Segment Performance */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Segment Performance</card_1.CardTitle>
                <card_1.CardDescription>
                  Growth and performance by segment
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-4">
                  {segmentationData.map(function (segment, index) { return (<div key={segment.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded" style={{ backgroundColor: segment.color }}/>
                          <span className="font-medium">{segment.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{segment.value.toLocaleString()}</div>
                          {segment.change !== undefined && (<div className={"text-xs ".concat(getChangeColor(segment.change))}>
                              {segment.change > 0 ? '+' : ''}{segment.change.toFixed(1)}%
                            </div>)}
                        </div>
                      </div>
                      <progress_1.Progress value={(segment.value / Math.max.apply(Math, segmentationData.map(function (s) { return s.value; }))) * 100} className="h-2"/>
                    </div>); })}
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="benchmarks" className="mt-6">
          <div className="space-y-6">
            {/* Benchmark Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <card_1.Card className="bg-green-50 border-green-200">
                <card_1.CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 text-sm font-medium">Above Benchmark</p>
                      <p className="text-2xl font-bold text-green-900">
                        {benchmarkData.filter(function (b) { return b.value >= b.benchmark; }).length}
                      </p>
                    </div>
                    <lucide_react_1.CheckCircle className="h-8 w-8 text-green-600"/>
                  </div>
                </card_1.CardContent>
              </card_1.Card>

              <card_1.Card className="bg-yellow-50 border-yellow-200">
                <card_1.CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-600 text-sm font-medium">Near Benchmark</p>
                      <p className="text-2xl font-bold text-yellow-900">
                        {benchmarkData.filter(function (b) { return b.value < b.benchmark && b.value >= b.benchmark * 0.8; }).length}
                      </p>
                    </div>
                    <lucide_react_1.AlertTriangle className="h-8 w-8 text-yellow-600"/>
                  </div>
                </card_1.CardContent>
              </card_1.Card>

              <card_1.Card className="bg-red-50 border-red-200">
                <card_1.CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-600 text-sm font-medium">Below Benchmark</p>
                      <p className="text-2xl font-bold text-red-900">
                        {benchmarkData.filter(function (b) { return b.value < b.benchmark * 0.8; }).length}
                      </p>
                    </div>
                    <lucide_react_1.XCircle className="h-8 w-8 text-red-600"/>
                  </div>
                </card_1.CardContent>
              </card_1.Card>
            </div>

            {/* Detailed Benchmark Comparison */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Benchmark Comparison</card_1.CardTitle>
                <card_1.CardDescription>
                  Performance vs industry benchmarks and targets
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-6">
                  {benchmarkData.map(function (benchmark) {
            var status = getBenchmarkStatus(benchmark.value, benchmark.benchmark);
            var StatusIcon = status.icon;
            return (<div key={benchmark.metric} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <StatusIcon className={"h-5 w-5 ".concat(status.color)}/>
                            <div>
                              <h4 className="font-medium">{benchmark.metric}</h4>
                              <p className="text-sm text-gray-600">
                                {benchmark.percentile}th percentile
                              </p>
                            </div>
                          </div>
                          <badge_1.Badge variant={status.status === 'excellent' ? 'default' :
                    status.status === 'good' ? 'secondary' :
                        status.status === 'fair' ? 'outline' : 'destructive'}>
                            {status.status.toUpperCase()}
                          </badge_1.Badge>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Your Value</span>
                            <p className="font-medium text-lg">
                              {benchmark.value.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Benchmark</span>
                            <p className="font-medium text-lg">
                              {benchmark.benchmark.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Industry Avg</span>
                            <p className="font-medium text-lg">
                              {benchmark.industry.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>Performance vs Benchmark</span>
                            <span>{((benchmark.value / benchmark.benchmark) * 100).toFixed(0)}%</span>
                          </div>
                          <progress_1.Progress value={Math.min((benchmark.value / benchmark.benchmark) * 100, 150)} className="h-2"/>
                        </div>
                      </div>);
        })}
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>

      {/* Action Items Alert */}
      {dashboardSummary.underPerforming > 0 && (<alert_1.Alert>
          <lucide_react_1.AlertTriangle className="h-4 w-4"/>
          <alert_1.AlertDescription>
            <strong>Action Required:</strong> {dashboardSummary.underPerforming} KPI(s) are significantly below target. 
            Review performance metrics and consider strategic adjustments.
          </alert_1.AlertDescription>
        </alert_1.Alert>)}
    </div>);
}

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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutiveSummary = ExecutiveSummary;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var progress_1 = require("@/components/ui/progress");
var tabs_1 = require("@/components/ui/tabs");
var separator_1 = require("@/components/ui/separator");
var lucide_react_1 = require("lucide-react");
var date_fns_1 = require("date-fns");
var PRIORITY_CONFIG = {
    high: {
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        label: 'High Priority'
    },
    medium: {
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        label: 'Medium Priority'
    },
    low: {
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        label: 'Low Priority'
    }
};
var STATUS_CONFIG = {
    excellent: { color: 'text-green-600', icon: lucide_react_1.CheckCircle, label: 'Excellent' },
    good: { color: 'text-blue-600', icon: lucide_react_1.CheckCircle, label: 'Good' },
    warning: { color: 'text-yellow-600', icon: lucide_react_1.AlertTriangle, label: 'Warning' },
    critical: { color: 'text-red-600', icon: lucide_react_1.XCircle, label: 'Critical' }
};
function ExecutiveSummary(_a) {
    var _this = this;
    var clinicId = _a.clinicId, dateRange = _a.dateRange, _b = _a.className, className = _b === void 0 ? '' : _b, _c = _a.showDetails, showDetails = _c === void 0 ? true : _c, _d = _a.autoRefresh, autoRefresh = _d === void 0 ? true : _d, _e = _a.refreshInterval // 5 minutes
    , refreshInterval = _e === void 0 ? 300000 : _e // 5 minutes
    ;
    var _f = (0, react_1.useState)(null), summaryData = _f[0], setSummaryData = _f[1];
    var _g = (0, react_1.useState)('overview'), selectedTab = _g[0], setSelectedTab = _g[1];
    var _h = (0, react_1.useState)(true), isLoading = _h[0], setIsLoading = _h[1];
    var _j = (0, react_1.useState)(new Date()), lastRefresh = _j[0], setLastRefresh = _j[1];
    // Load executive summary data
    (0, react_1.useEffect)(function () {
        var loadSummaryData = function () { return __awaiter(_this, void 0, void 0, function () {
            var mockData, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setIsLoading(true);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        // Simulate API call - replace with actual implementation
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1500); })];
                    case 2:
                        // Simulate API call - replace with actual implementation
                        _a.sent();
                        mockData = generateMockSummaryData(clinicId, dateRange);
                        setSummaryData(mockData);
                        setLastRefresh(new Date());
                        return [3 /*break*/, 5];
                    case 3:
                        err_1 = _a.sent();
                        console.error('Failed to load executive summary:', err_1);
                        return [3 /*break*/, 5];
                    case 4:
                        setIsLoading(false);
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        loadSummaryData();
    }, [clinicId, dateRange]);
    // Auto-refresh
    (0, react_1.useEffect)(function () {
        if (!autoRefresh)
            return;
        var interval = setInterval(function () {
            var refreshData = function () { return __awaiter(_this, void 0, void 0, function () {
                var mockData;
                return __generator(this, function (_a) {
                    try {
                        mockData = generateMockSummaryData(clinicId, dateRange);
                        setSummaryData(mockData);
                        setLastRefresh(new Date());
                    }
                    catch (err) {
                        console.error('Failed to refresh summary:', err);
                    }
                    return [2 /*return*/];
                });
            }); };
            refreshData();
        }, refreshInterval);
        return function () { return clearInterval(interval); };
    }, [autoRefresh, refreshInterval, clinicId, dateRange]);
    // Format value based on unit
    var formatValue = function (value, unit) {
        switch (unit) {
            case 'currency':
                return new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                }).format(value);
            case 'percentage':
                return "".concat(value.toFixed(1), "%");
            case 'duration':
                var hours = Math.floor(value / 60);
                var minutes = value % 60;
                return "".concat(hours, "h ").concat(minutes, "m");
            default:
                return value.toLocaleString('pt-BR');
        }
    };
    // Get trend icon
    var getTrendIcon = function (trend, size) {
        if (size === void 0) { size = 'h-4 w-4'; }
        switch (trend) {
            case 'up':
                return <lucide_react_1.TrendingUp className={"".concat(size, " text-green-600")}/>;
            case 'down':
                return <lucide_react_1.TrendingDown className={"".concat(size, " text-red-600")}/>;
            default:
                return <lucide_react_1.Minus className={"".concat(size, " text-gray-600")}/>;
        }
    };
    // Calculate score change
    var getScoreChange = function (current, previous) {
        var change = current - previous;
        var percentage = ((change / previous) * 100);
        return {
            value: change,
            percentage: percentage,
            trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
        };
    };
    // Handle manual refresh
    var handleRefresh = function () { return __awaiter(_this, void 0, void 0, function () {
        var mockData, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                case 2:
                    _a.sent();
                    mockData = generateMockSummaryData(clinicId, dateRange);
                    setSummaryData(mockData);
                    setLastRefresh(new Date());
                    return [3 /*break*/, 5];
                case 3:
                    err_2 = _a.sent();
                    console.error('Failed to refresh summary:', err_2);
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Export summary
    var handleExport = function () {
        if (!summaryData)
            return;
        var exportData = __assign(__assign({}, summaryData), { exportedAt: new Date().toISOString() });
        var dataStr = JSON.stringify(exportData, null, 2);
        var dataBlob = new Blob([dataStr], { type: 'application/json' });
        var url = URL.createObjectURL(dataBlob);
        var link = document.createElement('a');
        link.href = url;
        link.download = "executive-summary-".concat((0, date_fns_1.format)(new Date(), 'yyyy-MM-dd'), ".json");
        link.click();
        URL.revokeObjectURL(url);
    };
    if (isLoading && !summaryData) {
        return (<card_1.Card className={className}>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Brain className="h-5 w-5"/>
            Executive Summary
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <lucide_react_1.RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground"/>
              <p className="text-muted-foreground">Generating executive summary...</p>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>);
    }
    if (!summaryData) {
        return (<card_1.Card className={className}>
        <card_1.CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <lucide_react_1.Brain className="h-8 w-8 mx-auto mb-4"/>
            <p>No summary data available</p>
          </div>
        </card_1.CardContent>
      </card_1.Card>);
    }
    var scoreChange = getScoreChange(summaryData.overallScore, summaryData.previousScore);
    return (<card_1.Card className={className}>
      <card_1.CardHeader>
        <div className="flex items-center justify-between">
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Brain className="h-5 w-5"/>
            Executive Summary
            {isLoading && <lucide_react_1.RefreshCw className="h-4 w-4 animate-spin"/>}
          </card_1.CardTitle>
          
          <div className="flex items-center gap-2">
            <button_1.Button size="sm" variant="outline" onClick={handleRefresh} disabled={isLoading}>
              <lucide_react_1.RefreshCw className={"h-4 w-4 ".concat(isLoading ? 'animate-spin' : '')}/>
            </button_1.Button>
            
            <button_1.Button size="sm" variant="outline" onClick={handleExport}>
              <lucide_react_1.Download className="h-4 w-4"/>
            </button_1.Button>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Last updated: {(0, date_fns_1.format)(lastRefresh, 'HH:mm:ss')}</span>
          <separator_1.Separator orientation="vertical" className="h-4"/>
          <span>Period: {(0, date_fns_1.format)(dateRange.from, 'MMM dd')} - {(0, date_fns_1.format)(dateRange.to, 'MMM dd')}</span>
        </div>
      </card_1.CardHeader>
      
      <card_1.CardContent>
        {/* Overall Score */}
        <div className="mb-6">
          <card_1.Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <card_1.CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">Overall Performance Score</h3>
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-bold text-blue-900">
                      {summaryData.overallScore.toFixed(1)}/10
                    </div>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(scoreChange.trend, 'h-6 w-6')}
                      <div className="text-sm">
                        <div className={"font-medium ".concat(scoreChange.trend === 'up' ? 'text-green-600' :
            scoreChange.trend === 'down' ? 'text-red-600' : 'text-gray-600')}>
                          {scoreChange.value > 0 ? '+' : ''}{scoreChange.value.toFixed(1)}
                        </div>
                        <div className="text-muted-foreground">
                          vs. previous period
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <lucide_react_1.Award className="h-12 w-12 text-blue-600 mb-2"/>
                  <progress_1.Progress value={summaryData.overallScore * 10} className="w-32"/>
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </div>

        <tabs_1.Tabs value={selectedTab} onValueChange={function (value) { return setSelectedTab(value); }}>
          <tabs_1.TabsList className="grid w-full grid-cols-4">
            <tabs_1.TabsTrigger value="overview">Overview</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="insights">Insights</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="recommendations">Recommendations</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="details">Details</tabs_1.TabsTrigger>
          </tabs_1.TabsList>
          
          <tabs_1.TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <lucide_react_1.Target className="h-5 w-5"/>
                Key Metrics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {summaryData.keyMetrics.slice(0, 4).map(function (metric) {
            var statusConfig = STATUS_CONFIG[metric.status];
            var StatusIcon = statusConfig.icon;
            var change = ((metric.value - metric.previousValue) / metric.previousValue) * 100;
            return (<card_1.Card key={metric.id}>
                      <card_1.CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">{metric.name}</h4>
                          <StatusIcon className={"h-4 w-4 ".concat(statusConfig.color)}/>
                        </div>
                        <div className="text-2xl font-bold mb-1">
                          {formatValue(metric.value, metric.unit)}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          {getTrendIcon(metric.trend)}
                          <span className={"".concat(change > 0 ? 'text-green-600' :
                    change < 0 ? 'text-red-600' : 'text-gray-600')}>
                            {change > 0 ? '+' : ''}{change.toFixed(1)}%
                          </span>
                        </div>
                      </card_1.CardContent>
                    </card_1.Card>);
        })}
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Financial Summary */}
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle className="text-lg flex items-center gap-2">
                    <lucide_react_1.DollarSign className="h-5 w-5"/>
                    Financial
                  </card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Revenue</span>
                    <div className="text-right">
                      <div className="font-medium">
                        {formatValue(summaryData.financialSummary.revenue.current, 'currency')}
                      </div>
                      <div className="text-xs text-green-600">
                        +{summaryData.financialSummary.revenue.growth.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Profit Margin</span>
                    <div className="font-medium">
                      {summaryData.financialSummary.profit.margin.toFixed(1)}%
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Cash Flow</span>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">
                        {formatValue(summaryData.financialSummary.cashFlow.current, 'currency')}
                      </span>
                      {summaryData.financialSummary.cashFlow.trend === 'positive' && (<lucide_react_1.ArrowUp className="h-3 w-3 text-green-600"/>)}
                    </div>
                  </div>
                </card_1.CardContent>
              </card_1.Card>

              {/* Operational Summary */}
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle className="text-lg flex items-center gap-2">
                    <lucide_react_1.Activity className="h-5 w-5"/>
                    Operational
                  </card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Efficiency</span>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">
                        {summaryData.operationalSummary.efficiency.score.toFixed(1)}%
                      </span>
                      {getTrendIcon(summaryData.operationalSummary.efficiency.trend, 'h-3 w-3')}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Capacity Utilization</span>
                    <div className="font-medium">
                      {summaryData.operationalSummary.capacity.utilization.toFixed(1)}%
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Staff Productivity</span>
                    <div className="font-medium">
                      {summaryData.operationalSummary.staff.productivity.toFixed(1)}%
                    </div>
                  </div>
                </card_1.CardContent>
              </card_1.Card>

              {/* Clinical Summary */}
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle className="text-lg flex items-center gap-2">
                    <lucide_react_1.Users className="h-5 w-5"/>
                    Clinical
                  </card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Success Rate</span>
                    <div className="font-medium">
                      {summaryData.clinicalSummary.outcomes.successRate.toFixed(1)}%
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Patient Satisfaction</span>
                    <div className="font-medium">
                      {summaryData.clinicalSummary.satisfaction.patient.toFixed(1)}/5
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Safety Score</span>
                    <div className="font-medium">
                      {summaryData.clinicalSummary.safety.score.toFixed(1)}%
                    </div>
                  </div>
                </card_1.CardContent>
              </card_1.Card>
            </div>

            {/* Recent Achievements */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <lucide_react_1.Award className="h-5 w-5"/>
                Recent Achievements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {summaryData.achievements.slice(0, 4).map(function (achievement) { return (<card_1.Card key={achievement.id} className="border-green-200 bg-green-50">
                    <card_1.CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <lucide_react_1.CheckCircle className="h-5 w-5 text-green-600 mt-0.5"/>
                        <div className="flex-1">
                          <h4 className="font-medium text-green-900 mb-1">{achievement.title}</h4>
                          <p className="text-sm text-green-700 mb-2">{achievement.description}</p>
                          <div className="flex items-center gap-2 text-xs text-green-600">
                            <badge_1.Badge variant="secondary" className="bg-green-100 text-green-800">
                              {achievement.category}
                            </badge_1.Badge>
                            <span>{(0, date_fns_1.format)(achievement.date, 'MMM dd')}</span>
                          </div>
                        </div>
                      </div>
                    </card_1.CardContent>
                  </card_1.Card>); })}
              </div>
            </div>
          </tabs_1.TabsContent>
          
          <tabs_1.TabsContent value="insights" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <lucide_react_1.Eye className="h-5 w-5"/>
                Key Insights
              </h3>
              <div className="space-y-4">
                {summaryData.insights.map(function (insight) {
            var priorityConfig = PRIORITY_CONFIG[insight.priority];
            return (<card_1.Card key={insight.id} className={"".concat(priorityConfig.borderColor, " ").concat(priorityConfig.bgColor)}>
                      <card_1.CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{insight.title}</h4>
                              <badge_1.Badge variant="secondary" className="text-xs">
                                {insight.type}
                              </badge_1.Badge>
                              <badge_1.Badge variant="outline" className={"text-xs ".concat(priorityConfig.color)}>
                                {priorityConfig.label}
                              </badge_1.Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                            <p className="text-sm font-medium">{insight.impact}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {insight.confidence}% confidence
                            </div>
                            {insight.actionable && (<badge_1.Badge variant="secondary" className="mt-1">
                                Actionable
                              </badge_1.Badge>)}
                          </div>
                        </div>
                        {insight.relatedMetrics.length > 0 && (<div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Related metrics:</span>
                            {insight.relatedMetrics.map(function (metric, index) { return (<badge_1.Badge key={index} variant="outline" className="text-xs">
                                {metric}
                              </badge_1.Badge>); })}
                          </div>)}
                      </card_1.CardContent>
                    </card_1.Card>);
        })}
              </div>
            </div>
          </tabs_1.TabsContent>
          
          <tabs_1.TabsContent value="recommendations" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <lucide_react_1.Zap className="h-5 w-5"/>
                Strategic Recommendations
              </h3>
              <div className="space-y-4">
                {summaryData.recommendations.map(function (recommendation) {
            var priorityConfig = PRIORITY_CONFIG[recommendation.priority];
            return (<card_1.Card key={recommendation.id}>
                      <card_1.CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{recommendation.title}</h4>
                              <badge_1.Badge variant="secondary" className="text-xs">
                                {recommendation.category}
                              </badge_1.Badge>
                              <badge_1.Badge variant="outline" className={"text-xs ".concat(priorityConfig.color)}>
                                {priorityConfig.label}
                              </badge_1.Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{recommendation.description}</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Expected Impact:</span>
                                <p className="text-muted-foreground">{recommendation.expectedImpact}</p>
                              </div>
                              <div>
                                <span className="font-medium">Timeline:</span>
                                <p className="text-muted-foreground">{recommendation.timeline}</p>
                              </div>
                              <div>
                                <span className="font-medium">Effort:</span>
                                <badge_1.Badge variant="outline" className="ml-1">
                                  {recommendation.effort}
                                </badge_1.Badge>
                              </div>
                            </div>
                          </div>
                          <lucide_react_1.ArrowRight className="h-5 w-5 text-muted-foreground mt-1"/>
                        </div>
                        {recommendation.resources.length > 0 && (<div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Resources needed:</span>
                            {recommendation.resources.map(function (resource, index) { return (<badge_1.Badge key={index} variant="outline" className="text-xs">
                                {resource}
                              </badge_1.Badge>); })}
                          </div>)}
                      </card_1.CardContent>
                    </card_1.Card>);
        })}
              </div>
            </div>
          </tabs_1.TabsContent>
          
          <tabs_1.TabsContent value="details" className="space-y-6">
            {/* Trends */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <lucide_react_1.LineChart className="h-5 w-5"/>
                Key Trends
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {summaryData.trends.map(function (trend) { return (<card_1.Card key={trend.id}>
                    <card_1.CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{trend.metric}</h4>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(trend.direction)}
                          <badge_1.Badge variant="outline" className="text-xs">
                            {trend.significance}
                          </badge_1.Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{trend.description}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Duration: {trend.duration}</span>
                        <span>Magnitude: {trend.magnitude.toFixed(1)}%</span>
                      </div>
                    </card_1.CardContent>
                  </card_1.Card>); })}
              </div>
            </div>

            {/* Active Alerts */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <lucide_react_1.AlertTriangle className="h-5 w-5"/>
                Active Alerts
              </h3>
              <div className="space-y-2">
                {summaryData.alerts.filter(function (alert) { return !alert.acknowledged; }).map(function (alert) { return (<card_1.Card key={alert.id} className={"".concat(alert.severity === 'critical' ? 'border-red-200 bg-red-50' :
                alert.severity === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                    'border-blue-200 bg-blue-50')}>
                    <card_1.CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{alert.title}</h4>
                            <badge_1.Badge variant="outline" className={"text-xs ".concat(alert.severity === 'critical' ? 'text-red-600' :
                alert.severity === 'warning' ? 'text-yellow-600' :
                    'text-blue-600')}>
                              {alert.severity}
                            </badge_1.Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{alert.message}</p>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {(0, date_fns_1.format)(alert.timestamp, 'HH:mm')}
                        </div>
                      </div>
                    </card_1.CardContent>
                  </card_1.Card>); })}
              </div>
            </div>
          </tabs_1.TabsContent>
        </tabs_1.Tabs>
      </card_1.CardContent>
    </card_1.Card>);
}
// Helper function to generate mock summary data
function generateMockSummaryData(clinicId, dateRange) {
    return {
        id: "summary-".concat(clinicId, "-").concat(Date.now()),
        clinicId: clinicId,
        period: dateRange,
        overallScore: 8.4,
        previousScore: 7.9,
        keyMetrics: [
            {
                id: 'revenue',
                name: 'Revenue',
                value: 125000,
                previousValue: 118000,
                target: 130000,
                unit: 'currency',
                trend: 'up',
                status: 'good',
                impact: 'high',
                category: 'financial'
            },
            {
                id: 'satisfaction',
                name: 'Patient Satisfaction',
                value: 4.7,
                previousValue: 4.5,
                target: 4.8,
                unit: 'number',
                trend: 'up',
                status: 'excellent',
                impact: 'high',
                category: 'satisfaction'
            },
            {
                id: 'efficiency',
                name: 'Operational Efficiency',
                value: 87.3,
                previousValue: 84.1,
                target: 90.0,
                unit: 'percentage',
                trend: 'up',
                status: 'good',
                impact: 'medium',
                category: 'operational'
            },
            {
                id: 'wait-time',
                name: 'Avg Wait Time',
                value: 18,
                previousValue: 22,
                target: 15,
                unit: 'duration',
                trend: 'down',
                status: 'warning',
                impact: 'medium',
                category: 'operational'
            }
        ],
        insights: [
            {
                id: 'insight-1',
                title: 'Revenue Growth Acceleration',
                description: 'Revenue growth has accelerated by 15% compared to the previous period, driven by increased patient volume and new service offerings.',
                type: 'opportunity',
                priority: 'high',
                impact: 'Potential for 20% revenue increase if trend continues',
                confidence: 85,
                relatedMetrics: ['Revenue', 'Patient Volume'],
                actionable: true
            },
            {
                id: 'insight-2',
                title: 'Wait Time Improvement Needed',
                description: 'Despite recent improvements, wait times are still above target. Peak hours show the highest delays.',
                type: 'risk',
                priority: 'medium',
                impact: 'May affect patient satisfaction if not addressed',
                confidence: 78,
                relatedMetrics: ['Wait Time', 'Patient Satisfaction'],
                actionable: true
            }
        ],
        recommendations: [
            {
                id: 'rec-1',
                title: 'Implement Advanced Scheduling System',
                description: 'Deploy AI-powered scheduling to optimize appointment distribution and reduce wait times.',
                category: 'operational',
                priority: 'high',
                effort: 'medium',
                expectedImpact: '25% reduction in wait times, 10% increase in patient satisfaction',
                timeline: '2-3 months',
                resources: ['IT Team', 'Training Budget'],
                kpis: ['Wait Time', 'Patient Satisfaction']
            },
            {
                id: 'rec-2',
                title: 'Expand Telehealth Services',
                description: 'Increase telehealth capacity to handle routine consultations and follow-ups.',
                category: 'strategic',
                priority: 'medium',
                effort: 'low',
                expectedImpact: '15% increase in capacity, improved patient convenience',
                timeline: '1-2 months',
                resources: ['Technology Platform', 'Staff Training'],
                kpis: ['Capacity Utilization', 'Patient Satisfaction']
            }
        ],
        alerts: [
            {
                id: 'alert-1',
                title: 'Equipment Maintenance Due',
                message: 'Critical medical equipment requires scheduled maintenance within 48 hours.',
                severity: 'warning',
                category: 'maintenance',
                timestamp: new Date(),
                acknowledged: false,
                actionRequired: true
            }
        ],
        achievements: [
            {
                id: 'ach-1',
                title: 'Patient Satisfaction Target Exceeded',
                description: 'Achieved 4.7/5 patient satisfaction score, exceeding quarterly target.',
                category: 'Quality',
                value: '4.7/5',
                date: (0, date_fns_1.subDays)(new Date(), 2),
                impact: 'high'
            },
            {
                id: 'ach-2',
                title: 'Revenue Growth Milestone',
                description: 'Reached highest monthly revenue in clinic history.',
                category: 'Financial',
                value: 'R$ 125,000',
                date: (0, date_fns_1.subDays)(new Date(), 5),
                impact: 'high'
            }
        ],
        trends: [
            {
                id: 'trend-1',
                metric: 'Patient Volume',
                direction: 'up',
                magnitude: 12.5,
                duration: '3 months',
                significance: 'high',
                description: 'Steady increase in patient appointments across all departments'
            },
            {
                id: 'trend-2',
                metric: 'Staff Productivity',
                direction: 'up',
                magnitude: 8.3,
                duration: '2 months',
                significance: 'medium',
                description: 'Improved productivity following new workflow implementation'
            }
        ],
        financialSummary: {
            revenue: {
                current: 125000,
                previous: 118000,
                target: 130000,
                growth: 5.9
            },
            costs: {
                current: 95000,
                previous: 92000,
                target: 98000,
                change: 3.3
            },
            profit: {
                current: 30000,
                previous: 26000,
                margin: 24.0
            },
            cashFlow: {
                current: 45000,
                trend: 'positive'
            }
        },
        operationalSummary: {
            efficiency: {
                score: 87.3,
                trend: 'up'
            },
            capacity: {
                utilization: 82.5,
                available: 17.5
            },
            quality: {
                score: 94.2,
                incidents: 2
            },
            staff: {
                productivity: 91.8,
                satisfaction: 4.3
            }
        },
        clinicalSummary: {
            outcomes: {
                successRate: 94.2,
                improvement: 2.1
            },
            safety: {
                score: 98.5,
                incidents: 0
            },
            satisfaction: {
                patient: 4.7,
                provider: 4.2
            },
            compliance: {
                score: 96.8,
                issues: 1
            }
        },
        lastUpdated: new Date()
    };
}

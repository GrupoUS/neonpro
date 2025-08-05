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
exports.ForecastingCharts = ForecastingCharts;
/**
 * Advanced Forecasting Charts Component for NeonPro
 *
 * Interactive time series forecasting visualization using Recharts.
 * Displays revenue predictions, subscription growth forecasts, and confidence intervals
 * with scenario analysis and accuracy metrics.
 */
var react_1 = require("react");
var recharts_1 = require("recharts");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var tabs_1 = require("@/components/ui/tabs");
var progress_1 = require("@/components/ui/progress");
var alert_1 = require("@/components/ui/alert");
var lucide_react_1 = require("lucide-react");
// Utility functions
var formatValue = function (value, metric) {
    if (metric === 'revenue' || metric === 'mrr' || metric === 'arr') {
        return "$".concat(value.toLocaleString());
    }
    if (metric === 'churn_rate') {
        return "".concat(value.toFixed(1), "%");
    }
    return value.toLocaleString();
};
var getMetricLabel = function (metric) {
    var labels = {
        subscriptions: 'Subscriptions',
        revenue: 'Revenue',
        churn_rate: 'Churn Rate',
        mrr: 'Monthly Recurring Revenue',
        arr: 'Annual Recurring Revenue'
    };
    return labels[metric] || metric;
};
var getMetricIcon = function (metric) {
    switch (metric) {
        case 'revenue':
        case 'mrr':
        case 'arr':
            return lucide_react_1.DollarSign;
        case 'subscriptions':
            return lucide_react_1.Users;
        case 'churn_rate':
            return lucide_react_1.TrendingDown;
        default:
            return lucide_react_1.Activity;
    }
};
function ForecastingCharts(_a) {
    var _b;
    var metric = _a.metric, historicalData = _a.historicalData, forecastData = _a.forecastData, _c = _a.scenarios, scenarios = _c === void 0 ? [] : _c, accuracyMetrics = _a.accuracyMetrics, _d = _a.loading, loading = _d === void 0 ? false : _d, _e = _a.className, className = _e === void 0 ? '' : _e, onDateRangeChange = _a.onDateRangeChange, onScenarioToggle = _a.onScenarioToggle;
    var _f = (0, react_1.useState)('forecast'), selectedView = _f[0], setSelectedView = _f[1];
    var _g = (0, react_1.useState)(new Set(scenarios.map(function (s) { return s.name; }))), enabledScenarios = _g[0], setEnabledScenarios = _g[1];
    var _h = (0, react_1.useState)(true), showConfidenceInterval = _h[0], setShowConfidenceInterval = _h[1];
    var _j = (0, react_1.useState)(null), zoomDomain = _j[0], setZoomDomain = _j[1];
    // Combine historical and forecast data
    var combinedData = (0, react_1.useMemo)(function () {
        var historical = historicalData.map(function (d) { return (__assign(__assign({}, d), { type: 'historical' })); });
        var forecast = forecastData.map(function (d) { return ({
            date: d.date,
            value: d.predicted,
            predicted: d.predicted,
            lower_bound: d.lower_bound,
            upper_bound: d.upper_bound,
            confidence: d.confidence,
            type: 'forecast'
        }); });
        return __spreadArray(__spreadArray([], historical, true), forecast, true);
    }, [historicalData, forecastData]);
    // Calculate forecast insights
    var forecastInsights = (0, react_1.useMemo)(function () {
        if (forecastData.length === 0)
            return null;
        var firstForecast = forecastData[0];
        var lastForecast = forecastData[forecastData.length - 1];
        var lastHistorical = historicalData[historicalData.length - 1];
        var growth = lastHistorical
            ? ((lastForecast.predicted - lastHistorical.value) / lastHistorical.value) * 100
            : 0;
        var averageConfidence = forecastData.reduce(function (sum, f) { return sum + f.confidence; }, 0) / forecastData.length;
        var volatility = forecastData.reduce(function (sum, f) {
            var range = f.upper_bound - f.lower_bound;
            var midpoint = (f.upper_bound + f.lower_bound) / 2;
            return sum + (range / midpoint);
        }, 0) / forecastData.length;
        return {
            growth: Math.round(growth * 100) / 100,
            averageConfidence: Math.round(averageConfidence * 100) / 100,
            volatility: Math.round(volatility * 100) / 100,
            trend: growth > 5 ? 'positive' : growth < -5 ? 'negative' : 'stable',
            forecastPeriods: forecastData.length
        };
    }, [forecastData, historicalData]);
    // Handle scenario toggle
    var handleScenarioToggle = (0, react_1.useCallback)(function (scenarioName) {
        var newEnabled = new Set(enabledScenarios);
        if (newEnabled.has(scenarioName)) {
            newEnabled.delete(scenarioName);
        }
        else {
            newEnabled.add(scenarioName);
        }
        setEnabledScenarios(newEnabled);
        onScenarioToggle === null || onScenarioToggle === void 0 ? void 0 : onScenarioToggle(scenarioName, newEnabled.has(scenarioName));
    }, [enabledScenarios, onScenarioToggle]);
    // Custom tooltip for forecast chart
    var ForecastTooltip = function (_a) {
        var active = _a.active, payload = _a.payload, label = _a.label;
        if (!active || !payload || !payload.length)
            return null;
        var data = payload[0].payload;
        var isHistorical = data.type === 'historical';
        return (<div className="bg-white p-4 border rounded-lg shadow-lg max-w-xs">
        <p className="font-semibold text-gray-900 mb-2">
          {new Date(label).toLocaleDateString()}
        </p>
        
        {isHistorical ? (<div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500"/>
            <span className="text-sm text-gray-600">Actual:</span>
            <span className="text-sm font-medium">
              {formatValue(data.value, metric)}
            </span>
          </div>) : (<div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500"/>
              <span className="text-sm text-gray-600">Predicted:</span>
              <span className="text-sm font-medium">
                {formatValue(data.predicted, metric)}
              </span>
            </div>
            {showConfidenceInterval && (<>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-500">Range:</span>
                  <span>
                    {formatValue(data.lower_bound, metric)} - {formatValue(data.upper_bound, metric)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-500">Confidence:</span>
                  <span>{data.confidence}%</span>
                </div>
              </>)}
          </div>)}
      </div>);
    };
    var MetricIcon = getMetricIcon(metric);
    if (loading) {
        return (<card_1.Card className={"w-full ".concat(className)}>
        <card_1.CardHeader>
          <div className="h-6 bg-gray-200 rounded animate-pulse"/>
          <div className="h-4 bg-gray-100 rounded animate-pulse"/>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="h-96 bg-gray-50 rounded animate-pulse"/>
        </card_1.CardContent>
      </card_1.Card>);
    }
    return (<card_1.Card className={"w-full ".concat(className)}>
      <card_1.CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <card_1.CardTitle className="flex items-center gap-2">
              <MetricIcon className="h-5 w-5 text-blue-600"/>
              {getMetricLabel(metric)} Forecast
            </card_1.CardTitle>
            <card_1.CardDescription>
              Predictive analysis with confidence intervals and scenario modeling
            </card_1.CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <button_1.Button variant={showConfidenceInterval ? "default" : "outline"} size="sm" onClick={function () { return setShowConfidenceInterval(!showConfidenceInterval); }}>
              Confidence Bands
            </button_1.Button>
          </div>
        </div>
      </card_1.CardHeader>
      <card_1.CardContent>
        <tabs_1.Tabs value={selectedView} onValueChange={function (value) { return setSelectedView(value); }}>
          <tabs_1.TabsList className="grid w-full grid-cols-3">
            <tabs_1.TabsTrigger value="forecast">Forecast</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="scenarios">Scenarios</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="accuracy">Accuracy</tabs_1.TabsTrigger>
          </tabs_1.TabsList>

          <tabs_1.TabsContent value="forecast" className="mt-6">
            <div className="space-y-6">
              {/* Forecast Insights */}
              {forecastInsights && (<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <lucide_react_1.BarChart3 className="h-4 w-4 text-blue-600"/>
                      <span className="text-sm font-medium text-blue-700">Growth</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      {forecastInsights.trend === 'positive' ? (<lucide_react_1.TrendingUp className="h-4 w-4 text-green-600"/>) : forecastInsights.trend === 'negative' ? (<lucide_react_1.TrendingDown className="h-4 w-4 text-red-600"/>) : (<lucide_react_1.Activity className="h-4 w-4 text-gray-600"/>)}
                      <span className="text-xl font-bold text-blue-900">
                        {forecastInsights.growth > 0 ? '+' : ''}{forecastInsights.growth}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <lucide_react_1.Target className="h-4 w-4 text-green-600"/>
                      <span className="text-sm font-medium text-green-700">Confidence</span>
                    </div>
                    <p className="text-xl font-bold text-green-900 mt-1">
                      {forecastInsights.averageConfidence}%
                    </p>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <lucide_react_1.AlertTriangle className="h-4 w-4 text-orange-600"/>
                      <span className="text-sm font-medium text-orange-700">Volatility</span>
                    </div>
                    <p className="text-xl font-bold text-orange-900 mt-1">
                      {(forecastInsights.volatility * 100).toFixed(1)}%
                    </p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <lucide_react_1.Calendar className="h-4 w-4 text-purple-600"/>
                      <span className="text-sm font-medium text-purple-700">Periods</span>
                    </div>
                    <p className="text-xl font-bold text-purple-900 mt-1">
                      {forecastInsights.forecastPeriods}
                    </p>
                  </div>
                </div>)}

              {/* Main Forecast Chart */}
              <div className="h-96">
                <recharts_1.ResponsiveContainer width="100%" height="100%">
                  <recharts_1.ComposedChart data={combinedData}>
                    <recharts_1.CartesianGrid strokeDasharray="3 3"/>
                    <recharts_1.XAxis dataKey="date" tickFormatter={function (date) { return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        }); }}/>
                    <recharts_1.YAxis tickFormatter={function (value) { return formatValue(value, metric); }}/>
                    <recharts_1.Tooltip content={<ForecastTooltip />}/>
                    <recharts_1.Legend />

                    {/* Confidence Interval Area */}
                    {showConfidenceInterval && (<recharts_1.Area type="monotone" dataKey="upper_bound" stackId="confidence" stroke="none" fill="rgba(34, 197, 94, 0.1)" name="Upper Bound"/>)}
                    {showConfidenceInterval && (<recharts_1.Area type="monotone" dataKey="lower_bound" stackId="confidence" stroke="none" fill="rgba(255, 255, 255, 1)" name="Lower Bound"/>)}

                    {/* Historical Data Line */}
                    <recharts_1.Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={function (props) { return props.payload.type === 'historical' ? __assign(__assign({}, props), { fill: '#3b82f6', r: 3 }) : false; }} connectNulls={false} name="Actual"/>

                    {/* Forecast Line */}
                    <recharts_1.Line type="monotone" dataKey="predicted" stroke="#22c55e" strokeWidth={2} strokeDasharray="5 5" dot={function (props) { return props.payload.type === 'forecast' ? __assign(__assign({}, props), { fill: '#22c55e', r: 3 }) : false; }} connectNulls={false} name="Predicted"/>

                    {/* Current Date Reference Line */}
                    <recharts_1.ReferenceLine x={(_b = historicalData[historicalData.length - 1]) === null || _b === void 0 ? void 0 : _b.date} stroke="#6b7280" strokeDasharray="2 2" label={{ value: "Now", position: "topRight" }}/>

                    <recharts_1.Brush dataKey="date" height={30} onChange={function (domain) {
            var _a, _b;
            if (domain && domain.startIndex !== undefined && domain.endIndex !== undefined) {
                var start = (_a = combinedData[domain.startIndex]) === null || _a === void 0 ? void 0 : _a.date;
                var end = (_b = combinedData[domain.endIndex]) === null || _b === void 0 ? void 0 : _b.date;
                if (start && end) {
                    setZoomDomain([start, end]);
                    onDateRangeChange === null || onDateRangeChange === void 0 ? void 0 : onDateRangeChange(start, end);
                }
            }
        }}/>
                  </recharts_1.ComposedChart>
                </recharts_1.ResponsiveContainer>
              </div>

              {/* Forecast Summary */}
              {forecastData.length > 0 && (<alert_1.Alert>
                  <lucide_react_1.TrendingUp className="h-4 w-4"/>
                  <alert_1.AlertDescription>
                    <strong>Forecast Summary:</strong> Based on historical trends, we predict{' '}
                    <strong>{getMetricLabel(metric).toLowerCase()}</strong> will{' '}
                    {(forecastInsights === null || forecastInsights === void 0 ? void 0 : forecastInsights.trend) === 'positive' ? 'increase' :
                (forecastInsights === null || forecastInsights === void 0 ? void 0 : forecastInsights.trend) === 'negative' ? 'decrease' : 'remain stable'} by{' '}
                    <strong>{Math.abs((forecastInsights === null || forecastInsights === void 0 ? void 0 : forecastInsights.growth) || 0)}%</strong> over the next{' '}
                    {forecastData.length} periods with {forecastInsights === null || forecastInsights === void 0 ? void 0 : forecastInsights.averageConfidence}% confidence.
                  </alert_1.AlertDescription>
                </alert_1.Alert>)}
            </div>
          </tabs_1.TabsContent>

          <tabs_1.TabsContent value="scenarios" className="mt-6">
            <div className="space-y-6">
              {/* Scenario Controls */}
              <div className="flex flex-wrap gap-2">
                {scenarios.map(function (scenario) { return (<button_1.Button key={scenario.name} variant={enabledScenarios.has(scenario.name) ? "default" : "outline"} size="sm" onClick={function () { return handleScenarioToggle(scenario.name); }} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: scenario.color }}/>
                    {scenario.name}
                  </button_1.Button>); })}
              </div>

              {/* Scenario Comparison Chart */}
              <div className="h-96">
                <recharts_1.ResponsiveContainer width="100%" height="100%">
                  <recharts_1.LineChart>
                    <recharts_1.CartesianGrid strokeDasharray="3 3"/>
                    <recharts_1.XAxis dataKey="date" tickFormatter={function (date) { return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        }); }}/>
                    <recharts_1.YAxis tickFormatter={function (value) { return formatValue(value, metric); }}/>
                    <recharts_1.Tooltip formatter={function (value) { return [formatValue(value, metric), 'Predicted']; }} labelFormatter={function (date) { return new Date(date).toLocaleDateString(); }}/>
                    <recharts_1.Legend />

                    {/* Historical Data */}
                    <recharts_1.Line data={historicalData} type="monotone" dataKey="value" stroke="#6b7280" strokeWidth={2} name="Historical"/>

                    {/* Scenario Lines */}
                    {scenarios
            .filter(function (scenario) { return enabledScenarios.has(scenario.name); })
            .map(function (scenario) { return (<recharts_1.Line key={scenario.name} data={scenario.data} type="monotone" dataKey="predicted" stroke={scenario.color} strokeWidth={2} strokeDasharray="5 5" name={scenario.name}/>); })}
                  </recharts_1.LineChart>
                </recharts_1.ResponsiveContainer>
              </div>

              {/* Scenario Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {scenarios.map(function (scenario) {
            var lastForecast = scenario.data[scenario.data.length - 1];
            var firstForecast = scenario.data[0];
            var growth = firstForecast
                ? ((lastForecast.predicted - firstForecast.predicted) / firstForecast.predicted) * 100
                : 0;
            return (<card_1.Card key={scenario.name} className={"border-l-4 ".concat(enabledScenarios.has(scenario.name) ? 'opacity-100' : 'opacity-50')} style={{ borderLeftColor: scenario.color }}>
                      <card_1.CardHeader className="pb-2">
                        <card_1.CardTitle className="text-sm font-medium flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: scenario.color }}/>
                          {scenario.name}
                        </card_1.CardTitle>
                      </card_1.CardHeader>
                      <card_1.CardContent className="pt-2">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">Final Value</span>
                            <span className="text-sm font-medium">
                              {formatValue(lastForecast.predicted, metric)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">Growth</span>
                            <div className="flex items-center gap-1">
                              {growth > 0 ? (<lucide_react_1.TrendingUp className="h-3 w-3 text-green-500"/>) : (<lucide_react_1.TrendingDown className="h-3 w-3 text-red-500"/>)}
                              <span className="text-sm font-medium">
                                {growth > 0 ? '+' : ''}{growth.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">Confidence</span>
                            <badge_1.Badge variant="secondary">
                              {lastForecast.confidence}%
                            </badge_1.Badge>
                          </div>
                        </div>
                      </card_1.CardContent>
                    </card_1.Card>);
        })}
              </div>
            </div>
          </tabs_1.TabsContent>

          <tabs_1.TabsContent value="accuracy" className="mt-6">
            {accuracyMetrics ? (<div className="space-y-6">
                {/* Accuracy Metrics Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <lucide_react_1.Target className="h-4 w-4 text-green-600"/>
                      <span className="text-sm font-medium text-green-700">Accuracy Score</span>
                    </div>
                    <p className="text-2xl font-bold text-green-900 mt-1">
                      {accuracyMetrics.accuracy_score.toFixed(1)}%
                    </p>
                    <progress_1.Progress value={accuracyMetrics.accuracy_score} className="mt-2"/>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <lucide_react_1.Activity className="h-4 w-4 text-blue-600"/>
                      <span className="text-sm font-medium text-blue-700">MAE</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-900 mt-1">
                      {formatValue(accuracyMetrics.mae, metric)}
                    </p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <lucide_react_1.BarChart3 className="h-4 w-4 text-purple-600"/>
                      <span className="text-sm font-medium text-purple-700">MAPE</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-900 mt-1">
                      {accuracyMetrics.mape.toFixed(1)}%
                    </p>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <lucide_react_1.TrendingUp className="h-4 w-4 text-orange-600"/>
                      <span className="text-sm font-medium text-orange-700">RMSE</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-900 mt-1">
                      {formatValue(accuracyMetrics.rmse, metric)}
                    </p>
                  </div>
                </div>

                {/* Accuracy Chart */}
                <div className="h-96">
                  <recharts_1.ResponsiveContainer width="100%" height="100%">
                    <recharts_1.ComposedChart data={accuracyMetrics.predictions}>
                      <recharts_1.CartesianGrid strokeDasharray="3 3"/>
                      <recharts_1.XAxis dataKey="date" tickFormatter={function (date) { return new Date(date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            }); }}/>
                      <recharts_1.YAxis tickFormatter={function (value) { return formatValue(value, metric); }}/>
                      <recharts_1.Tooltip formatter={function (value, name) { return [
                formatValue(value, metric),
                name === 'actual' ? 'Actual' : 'Predicted'
            ]; }} labelFormatter={function (date) { return new Date(date).toLocaleDateString(); }}/>
                      <recharts_1.Legend />

                      {/* Actual vs Predicted Lines */}
                      <recharts_1.Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} name="Actual"/>
                      <recharts_1.Line type="monotone" dataKey="predicted" stroke="#22c55e" strokeWidth={2} strokeDasharray="5 5" name="Predicted"/>

                      {/* Error Bars */}
                      <recharts_1.Bar dataKey={function (entry) { return Math.abs(entry.actual - entry.predicted); }} fill="rgba(239, 68, 68, 0.3)" name="Prediction Error"/>
                    </recharts_1.ComposedChart>
                  </recharts_1.ResponsiveContainer>
                </div>

                {/* Accuracy Insights */}
                <alert_1.Alert>
                  <lucide_react_1.Target className="h-4 w-4"/>
                  <alert_1.AlertDescription>
                    <strong>Model Performance:</strong> The forecasting model achieves{' '}
                    <strong>{accuracyMetrics.accuracy_score.toFixed(1)}%</strong> accuracy with an average error of{' '}
                    <strong>{formatValue(accuracyMetrics.mae, metric)}</strong>. The model is{' '}
                    {accuracyMetrics.accuracy_score >= 80 ? 'highly reliable' :
                accuracyMetrics.accuracy_score >= 60 ? 'moderately reliable' : 'needs improvement'} for business planning.
                  </alert_1.AlertDescription>
                </alert_1.Alert>
              </div>) : (<div className="text-center py-12">
                <lucide_react_1.AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4"/>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Accuracy Data Available</h3>
                <p className="text-gray-600">
                  Run model validation to see accuracy metrics and performance analysis.
                </p>
              </div>)}
          </tabs_1.TabsContent>
        </tabs_1.Tabs>
      </card_1.CardContent>
    </card_1.Card>);
}

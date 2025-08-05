// Story 11.2: No-Show Prediction Analytics Component
// Advanced analytics and performance monitoring
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = NoShowPredictionAnalytics;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var select_1 = require("@/components/ui/select");
var date_picker_1 = require("@/components/ui/date-picker");
var icons_1 = require("@/components/ui/icons");
var use_toast_1 = require("@/hooks/use-toast");
var date_fns_1 = require("date-fns");
function NoShowPredictionAnalytics() {
    var _this = this;
    var _a = (0, react_1.useState)(null), analytics = _a[0], setAnalytics = _a[1];
    var _b = (0, react_1.useState)(true), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)({
        from: (0, date_fns_1.addDays)(new Date(), -30),
        to: new Date(),
    }), dateRange = _c[0], setDateRange = _c[1];
    var _d = (0, react_1.useState)('accuracy'), selectedMetric = _d[0], setSelectedMetric = _d[1];
    var toast = (0, use_toast_1.useToast)().toast;
    (0, react_1.useEffect)(function () {
        fetchAnalytics();
    }, [dateRange]);
    var fetchAnalytics = function () { return __awaiter(_this, void 0, void 0, function () {
        var params, response, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, 4, 5]);
                    setLoading(true);
                    params = new URLSearchParams();
                    if (dateRange === null || dateRange === void 0 ? void 0 : dateRange.from) {
                        params.append('date_from', dateRange.from.toISOString().split('T')[0]);
                    }
                    if (dateRange === null || dateRange === void 0 ? void 0 : dateRange.to) {
                        params.append('date_to', dateRange.to.toISOString().split('T')[0]);
                    }
                    return [4 /*yield*/, fetch("/api/no-show-prediction/analytics?".concat(params))];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error('Failed to fetch analytics');
                    }
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    setAnalytics(data);
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    console.error('Error fetching analytics:', error_1);
                    toast({
                        title: 'Error',
                        description: 'Failed to load analytics data',
                        variant: 'destructive',
                    });
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    if (loading) {
        return (<div className="space-y-4">
        {Array.from({ length: 4 }).map(function (_, i) { return (<card_1.Card key={i}>
            <card_1.CardHeader>
              <div className="h-4 bg-muted animate-pulse rounded w-1/3"/>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="h-32 bg-muted animate-pulse rounded"/>
            </card_1.CardContent>
          </card_1.Card>); })}
      </div>);
    }
    return (<div className="space-y-6">
      {/* Controls */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Analytics Filters</card_1.CardTitle>
          <card_1.CardDescription>
            Customize your analytics view
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <date_picker_1.DatePickerWithRange date={dateRange} onDateChange={setDateRange}/>
          </div>
          <select_1.Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <select_1.SelectTrigger className="w-[180px]">
              <select_1.SelectValue placeholder="Select metric"/>
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="accuracy">Accuracy Trends</select_1.SelectItem>
              <select_1.SelectItem value="effectiveness">Intervention Effectiveness</select_1.SelectItem>
              <select_1.SelectItem value="risk-factors">Risk Factor Analysis</select_1.SelectItem>
              <select_1.SelectItem value="model-performance">Model Performance</select_1.SelectItem>
            </select_1.SelectContent>
          </select_1.Select>
          <button_1.Button onClick={fetchAnalytics} variant="outline">
            <icons_1.Icons.refresh className="mr-2 h-4 w-4"/>
            Refresh
          </button_1.Button>
        </card_1.CardContent>
      </card_1.Card>

      {/* Accuracy Trends */}
      {selectedMetric === 'accuracy' && analytics && (<card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Prediction Accuracy Trends</card_1.CardTitle>
            <card_1.CardDescription>
              Model accuracy over time
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="space-y-4">
              {analytics.accuracy_trends.map(function (trend, index) { return (<div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">{new Date(trend.date).toLocaleDateString()}</p>
                    <p className="text-sm text-muted-foreground">
                      {trend.predictions_count} predictions
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">
                      {(trend.accuracy * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground">accuracy</p>
                  </div>
                </div>); })}
            </div>
          </card_1.CardContent>
        </card_1.Card>)}      {/* Model Performance */}
      {selectedMetric === 'model-performance' && analytics && (<card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Model Performance Comparison</card_1.CardTitle>
            <card_1.CardDescription>
              Performance metrics by model version
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {Object.entries(analytics.model_performance).map(function (_a) {
                var version = _a[0], performance = _a[1];
                return (<div key={version} className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Model {version}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Accuracy:</span>
                      <span className="font-medium">
                        {(performance.accuracy * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Predictions:</span>
                      <span className="font-medium">{performance.total_predictions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Avg Confidence:</span>
                      <span className="font-medium">
                        {(performance.avg_confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>);
            })}
            </div>
          </card_1.CardContent>
        </card_1.Card>)}

      {/* Risk Factor Analysis */}
      {selectedMetric === 'risk-factors' && analytics && (<card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Risk Factor Analysis</card_1.CardTitle>
            <card_1.CardDescription>
              Impact and frequency of risk factors
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="space-y-4">
              {analytics.risk_factor_analysis.map(function (factor, index) { return (<div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium capitalize">{factor.factor_type.replace('_', ' ')}</p>
                    <p className="text-sm text-muted-foreground">
                      Frequency: {factor.frequency} occurrences
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">
                      {(factor.impact_weight * 100).toFixed(0)}%
                    </p>
                    <p className="text-xs text-muted-foreground">impact weight</p>
                  </div>
                </div>); })}
            </div>
          </card_1.CardContent>
        </card_1.Card>)}
    </div>);
}

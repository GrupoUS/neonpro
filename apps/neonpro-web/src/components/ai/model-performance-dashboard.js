/**
 * AI Model Performance Dashboard Component
 *
 * Displays ML model performance metrics, A/B testing statistics,
 * and provides model management capabilities for administrators.
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ModelPerformanceDashboard;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var alert_1 = require("@/components/ui/alert");
var progress_1 = require("@/components/ui/progress");
var tabs_1 = require("@/components/ui/tabs");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
function ModelPerformanceDashboard(_a) {
    var _this = this;
    var _b;
    var _c = _a.className, className = _c === void 0 ? '' : _c, _d = _a.showABStats, showABStats = _d === void 0 ? true : _d, _e = _a.allowModelManagement, allowModelManagement = _e === void 0 ? false : _e;
    // State
    var _f = (0, react_1.useState)(null), data = _f[0], setData = _f[1];
    var _g = (0, react_1.useState)(true), loading = _g[0], setLoading = _g[1];
    var _h = (0, react_1.useState)(null), error = _h[0], setError = _h[1];
    var _j = (0, react_1.useState)(false), refreshing = _j[0], setRefreshing = _j[1];
    var _k = (0, react_1.useState)(null), updatingModel = _k[0], setUpdatingModel = _k[1];
    // Load data on component mount
    (0, react_1.useEffect)(function () {
        loadPerformanceData();
    }, [showABStats]);
    /**
     * Load model performance data
     */
    var loadPerformanceData = function () { return __awaiter(_this, void 0, void 0, function () {
        var url, response, result, err_1, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, 4, 5]);
                    setError(null);
                    url = new URL('/api/ai/model-performance', window.location.origin);
                    if (showABStats) {
                        url.searchParams.set('includeABStats', 'true');
                    }
                    return [4 /*yield*/, fetch(url.toString())];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _a.sent();
                    if (!result.success) {
                        throw new Error(result.error || 'Failed to load performance data');
                    }
                    setData(result);
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    errorMessage = err_1 instanceof Error ? err_1.message : 'Unknown error occurred';
                    setError(errorMessage);
                    sonner_1.toast.error('Failed to load performance data', { description: errorMessage });
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    /**
     * Refresh performance data
     */
    var refreshData = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setRefreshing(true);
                    return [4 /*yield*/, loadPerformanceData()];
                case 1:
                    _a.sent();
                    setRefreshing(false);
                    sonner_1.toast.success('Performance data refreshed');
                    return [2 /*return*/];
            }
        });
    }); };
    /**
     * Update model performance
     */
    var updateModelPerformance = function (modelVersion) { return __awaiter(_this, void 0, void 0, function () {
        var response, result, err_2, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setUpdatingModel(modelVersion);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, 6, 7]);
                    return [4 /*yield*/, fetch('/api/ai/model-performance', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                modelVersion: modelVersion,
                                action: 'update_performance'
                            })
                        })];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    result = _a.sent();
                    if (!result.success) {
                        throw new Error(result.error || 'Failed to update model performance');
                    }
                    sonner_1.toast.success('Model performance updated');
                    return [4 /*yield*/, loadPerformanceData()];
                case 4:
                    _a.sent(); // Refresh data
                    return [3 /*break*/, 7];
                case 5:
                    err_2 = _a.sent();
                    errorMessage = err_2 instanceof Error ? err_2.message : 'Unknown error occurred';
                    sonner_1.toast.error('Failed to update model performance', { description: errorMessage });
                    return [3 /*break*/, 7];
                case 6:
                    setUpdatingModel(null);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    /**
     * Get accuracy badge variant
     */
    var getAccuracyBadge = function (accuracy) {
        if (accuracy >= 85)
            return { variant: 'default', icon: lucide_react_1.CheckCircle, color: 'text-green-600' };
        if (accuracy >= 70)
            return { variant: 'secondary', icon: lucide_react_1.Activity, color: 'text-blue-600' };
        return { variant: 'destructive', icon: lucide_react_1.AlertCircle, color: 'text-orange-600' };
    };
    /**
     * Format metrics for display
     */
    var formatMetric = function (value, type) {
        switch (type) {
            case 'accuracy':
                return "".concat(value.toFixed(1), "%");
            case 'error':
                return "".concat(value.toFixed(1), " min");
            case 'threshold':
                return "".concat((value * 100).toFixed(0), "%");
            default:
                return value.toString();
        }
    };
    if (loading) {
        return (<card_1.Card className={className}>
        <card_1.CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Loading performance data...</span>
        </card_1.CardContent>
      </card_1.Card>);
    }
    if (error) {
        return (<card_1.Card className={className}>
        <card_1.CardContent>
          <alert_1.Alert variant="destructive">
            <lucide_react_1.AlertCircle className="h-4 w-4"/>
            <alert_1.AlertDescription>{error}</alert_1.AlertDescription>
          </alert_1.Alert>
          <button_1.Button onClick={refreshData} className="mt-4 w-full">
            Retry
          </button_1.Button>
        </card_1.CardContent>
      </card_1.Card>);
    }
    var activeModel = (_b = data === null || data === void 0 ? void 0 : data.models) === null || _b === void 0 ? void 0 : _b.find(function (m) { return m.isActive; });
    var allModels = (data === null || data === void 0 ? void 0 : data.models) || [];
    return (<div className={"space-y-6 ".concat(className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Model Performance</h2>
          <p className="text-muted-foreground">AI model metrics and A/B testing statistics</p>
        </div>
        <button_1.Button variant="outline" size="sm" onClick={refreshData} disabled={refreshing}>
          <lucide_react_1.RefreshCw className={"h-4 w-4 mr-2 ".concat(refreshing ? 'animate-spin' : '')}/>
          Refresh
        </button_1.Button>
      </div>

      <tabs_1.Tabs defaultValue="overview" className="space-y-4">
        <tabs_1.TabsList>
          <tabs_1.TabsTrigger value="overview">Overview</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="models">Model Details</tabs_1.TabsTrigger>
          {showABStats && <tabs_1.TabsTrigger value="ab-testing">A/B Testing</tabs_1.TabsTrigger>}
        </tabs_1.TabsList>

        {/* Overview Tab */}
        <tabs_1.TabsContent value="overview" className="space-y-4">
          {activeModel && (<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Active Model Accuracy */}
              <card_1.Card>
                <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <card_1.CardTitle className="text-sm font-medium">Model Accuracy</card_1.CardTitle>
                  <lucide_react_1.Target className="h-4 w-4 text-muted-foreground"/>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="text-2xl font-bold">
                    {formatMetric(activeModel.accuracy, 'accuracy')}
                  </div>
                  <progress_1.Progress value={activeModel.accuracy} className="mt-2"/>
                  <p className="text-xs text-muted-foreground mt-2">
                    Current active model: {activeModel.version}
                  </p>
                </card_1.CardContent>
              </card_1.Card>

              {/* Mean Absolute Error */}
              <card_1.Card>
                <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <card_1.CardTitle className="text-sm font-medium">Avg Error (MAE)</card_1.CardTitle>
                  <lucide_react_1.BarChart3 className="h-4 w-4 text-muted-foreground"/>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="text-2xl font-bold">
                    {formatMetric(activeModel.mae, 'error')}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Lower is better
                  </p>
                </card_1.CardContent>
              </card_1.Card>

              {/* Confidence Threshold */}
              <card_1.Card>
                <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <card_1.CardTitle className="text-sm font-medium">Confidence Threshold</card_1.CardTitle>
                  <lucide_react_1.Brain className="h-4 w-4 text-muted-foreground"/>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="text-2xl font-bold">
                    {formatMetric(activeModel.confidenceThreshold, 'threshold')}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Prediction confidence minimum
                  </p>
                </card_1.CardContent>
              </card_1.Card>

              {/* RMSE */}
              <card_1.Card>
                <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <card_1.CardTitle className="text-sm font-medium">RMSE</card_1.CardTitle>
                  <lucide_react_1.TrendingDown className="h-4 w-4 text-muted-foreground"/>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="text-2xl font-bold">
                    {formatMetric(activeModel.rmse, 'error')}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Root Mean Square Error
                  </p>
                </card_1.CardContent>
              </card_1.Card>
            </div>)}

          {/* Model Status Alert */}
          {activeModel && (<alert_1.Alert>
              <lucide_react_1.CheckCircle className="h-4 w-4"/>
              <alert_1.AlertDescription>
                Model <strong>{activeModel.version}</strong> is currently active with{' '}
                <strong>{formatMetric(activeModel.accuracy, 'accuracy')}</strong> accuracy.
                {activeModel.accuracy < 70 && ' Consider retraining or updating the model.'}
              </alert_1.AlertDescription>
            </alert_1.Alert>)}
        </tabs_1.TabsContent>

        {/* Model Details Tab */}
        <tabs_1.TabsContent value="models" className="space-y-4">
          <div className="space-y-4">
            {allModels.map(function (model) { return (<card_1.Card key={model.version}>
                <card_1.CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <card_1.CardTitle className="flex items-center gap-2">
                        {model.version}
                        {model.isActive && (<badge_1.Badge variant="default">Active</badge_1.Badge>)}
                      </card_1.CardTitle>
                      <card_1.CardDescription>
                        {(function () {
                var _a = getAccuracyBadge(model.accuracy), variant = _a.variant, Icon = _a.icon;
                return (<badge_1.Badge variant={variant} className="flex items-center gap-1 w-fit mt-1">
                              <Icon className="h-3 w-3"/>
                              {formatMetric(model.accuracy, 'accuracy')} accuracy
                            </badge_1.Badge>);
            })()}
                      </card_1.CardDescription>
                    </div>
                    {allowModelManagement && (<button_1.Button variant="outline" size="sm" onClick={function () { return updateModelPerformance(model.version); }} disabled={updatingModel === model.version}>
                        {updatingModel === model.version ? (<lucide_react_1.RefreshCw className="h-4 w-4 animate-spin"/>) : ('Update Metrics')}
                      </button_1.Button>)}
                  </div>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">MAE</p>
                      <p className="text-lg font-semibold">{formatMetric(model.mae, 'error')}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">RMSE</p>
                      <p className="text-lg font-semibold">{formatMetric(model.rmse, 'error')}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Confidence</p>
                      <p className="text-lg font-semibold">{formatMetric(model.confidenceThreshold, 'threshold')}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Status</p>
                      <p className="text-lg font-semibold">{model.isActive ? 'Active' : 'Inactive'}</p>
                    </div>
                  </div>
                </card_1.CardContent>
              </card_1.Card>); })}
          </div>
        </tabs_1.TabsContent>

        {/* A/B Testing Tab */}
        {showABStats && (data === null || data === void 0 ? void 0 : data.abTestStats) && (<tabs_1.TabsContent value="ab-testing" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              {/* Total Users */}
              <card_1.Card>
                <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <card_1.CardTitle className="text-sm font-medium">Total Test Users</card_1.CardTitle>
                  <lucide_react_1.Users className="h-4 w-4 text-muted-foreground"/>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="text-2xl font-bold">{data.abTestStats.total.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Users in A/B test
                  </p>
                </card_1.CardContent>
              </card_1.Card>

              {/* Control Group */}
              <card_1.Card>
                <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <card_1.CardTitle className="text-sm font-medium">Control Group</card_1.CardTitle>
                  <lucide_react_1.Clock className="h-4 w-4 text-muted-foreground"/>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="text-2xl font-bold">{data.abTestStats.control.toLocaleString()}</div>
                  <progress_1.Progress value={data.abTestStats.split_percentage.control} className="mt-2"/>
                  <p className="text-xs text-muted-foreground mt-2">
                    {data.abTestStats.split_percentage.control}% of users
                  </p>
                </card_1.CardContent>
              </card_1.Card>

              {/* AI Prediction Group */}
              <card_1.Card>
                <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <card_1.CardTitle className="text-sm font-medium">AI Prediction Group</card_1.CardTitle>
                  <lucide_react_1.Brain className="h-4 w-4 text-muted-foreground"/>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="text-2xl font-bold">{data.abTestStats.ai_prediction.toLocaleString()}</div>
                  <progress_1.Progress value={data.abTestStats.split_percentage.ai_prediction} className="mt-2"/>
                  <p className="text-xs text-muted-foreground mt-2">
                    {data.abTestStats.split_percentage.ai_prediction}% of users
                  </p>
                </card_1.CardContent>
              </card_1.Card>
            </div>

            {/* A/B Test Status */}
            <alert_1.Alert>
              <lucide_react_1.TrendingUp className="h-4 w-4"/>
              <alert_1.AlertDescription>
                A/B testing is active with a {data.abTestStats.split_percentage.control}/{data.abTestStats.split_percentage.ai_prediction} split 
                between control and AI prediction groups. Total participants: {data.abTestStats.total.toLocaleString()}.
              </alert_1.AlertDescription>
            </alert_1.Alert>
          </tabs_1.TabsContent>)}
      </tabs_1.Tabs>
    </div>);
}

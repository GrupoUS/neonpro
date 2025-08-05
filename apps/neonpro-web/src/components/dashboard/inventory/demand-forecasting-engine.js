"use client";
"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
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
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
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
      return function (v) {
        return step([n, v]);
      };
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
  };
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.DemandForecastingEngine = DemandForecastingEngine;
var useDemandForecasting_1 = require("@/app/hooks/useDemandForecasting");
var alert_1 = require("@/components/ui/alert");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var label_1 = require("@/components/ui/label");
var progress_1 = require("@/components/ui/progress");
var select_1 = require("@/components/ui/select");
var tabs_1 = require("@/components/ui/tabs");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
function DemandForecastingEngine(_a) {
  var _this = this;
  var clinicId = _a.clinicId,
    inventoryItems = _a.inventoryItems;
  var _b = (0, useDemandForecasting_1.useDemandForecasting)(),
    isLoading = _b.isLoading,
    forecast = _b.forecast,
    bulkForecasts = _b.bulkForecasts,
    seasonalAnalysis = _b.seasonalAnalysis,
    accuracyAnalysis = _b.accuracyAnalysis,
    capabilities = _b.capabilities,
    generateForecast = _b.generateForecast,
    generateBulkForecast = _b.generateBulkForecast,
    analyzeSeasonalPatterns = _b.analyzeSeasonalPatterns,
    getAccuracyAnalysis = _b.getAccuracyAnalysis,
    getCapabilities = _b.getCapabilities,
    clearForecast = _b.clearForecast,
    clearBulkForecasts = _b.clearBulkForecasts,
    clearSeasonalAnalysis = _b.clearSeasonalAnalysis,
    calculateConfidenceScore = _b.calculateConfidenceScore,
    getForecastRecommendations = _b.getForecastRecommendations;
  // Form states
  var _c = (0, react_1.useState)(""),
    selectedItem = _c[0],
    setSelectedItem = _c[1];
  var _d = (0, react_1.useState)(30),
    forecastPeriod = _d[0],
    setForecastPeriod = _d[1];
  var _e = (0, react_1.useState)(0.95),
    confidenceLevel = _e[0],
    setConfidenceLevel = _e[1];
  var _f = (0, react_1.useState)([]),
    bulkItems = _f[0],
    setBulkItems = _f[1];
  var _g = (0, react_1.useState)(365),
    analysisPeriod = _g[0],
    setAnalysisPeriod = _g[1];
  (0, react_1.useEffect)(
    function () {
      getCapabilities(clinicId);
    },
    [clinicId, getCapabilities],
  );
  var handleSingleForecast = function () {
    return __awaiter(_this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!selectedItem) return [2 /*return*/];
            return [
              4 /*yield*/,
              generateForecast({
                itemId: selectedItem,
                clinicId: clinicId,
                forecastPeriod: forecastPeriod,
                confidenceLevel: confidenceLevel,
              }),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  var handleBulkForecast = function () {
    return __awaiter(_this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (bulkItems.length === 0) return [2 /*return*/];
            return [
              4 /*yield*/,
              generateBulkForecast({
                items: bulkItems.map(function (itemId) {
                  return { itemId: itemId, forecastPeriod: forecastPeriod };
                }),
                clinicId: clinicId,
                confidenceLevel: confidenceLevel,
              }),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  var handleSeasonalAnalysis = function () {
    return __awaiter(_this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!selectedItem) return [2 /*return*/];
            return [4 /*yield*/, analyzeSeasonalPatterns(selectedItem, clinicId, analysisPeriod)];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  var handleAccuracyAnalysis = function () {
    var args_1 = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      args_1[_i] = arguments[_i];
    }
    return __awaiter(_this, __spreadArray([], args_1, true), void 0, function (period) {
      if (period === void 0) {
        period = "30d";
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, getAccuracyAnalysis(clinicId, undefined, period)];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  var getModelIcon = function (model) {
    switch (model) {
      case "exponential_smoothing":
        return <lucide_react_1.TrendingUp className="h-4 w-4" />;
      case "seasonal_decomposition":
        return <lucide_react_1.Calendar className="h-4 w-4" />;
      case "linear_regression":
        return <lucide_react_1.BarChart3 className="h-4 w-4" />;
      case "moving_average":
        return <lucide_react_1.Activity className="h-4 w-4" />;
      default:
        return <lucide_react_1.Brain className="h-4 w-4" />;
    }
  };
  var getModelName = function (model) {
    switch (model) {
      case "exponential_smoothing":
        return "Exponential Smoothing";
      case "seasonal_decomposition":
        return "Seasonal Decomposition";
      case "linear_regression":
        return "Linear Regression";
      case "moving_average":
        return "Moving Average";
      default:
        return "Unknown Model";
    }
  };
  var getConfidenceColor = function (score) {
    if (score >= 0.8) return "bg-green-500";
    if (score >= 0.6) return "bg-yellow-500";
    return "bg-red-500";
  };
  var formatPeriod = function (days) {
    if (days === 1) return "1 day";
    if (days === 7) return "1 week";
    if (days === 30) return "1 month";
    if (days === 90) return "3 months";
    if (days === 365) return "1 year";
    return "".concat(days, " days");
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Demand Forecasting Engine</h2>
          <p className="text-muted-foreground">
            AI-powered demand prediction and seasonal analysis
          </p>
        </div>
        <badge_1.Badge variant="secondary" className="flex items-center gap-2">
          <lucide_react_1.Brain className="h-4 w-4" />
          Advanced Analytics
        </badge_1.Badge>
      </div>

      <tabs_1.Tabs defaultValue="single-forecast" className="space-y-6">
        <tabs_1.TabsList className="grid w-full grid-cols-4">
          <tabs_1.TabsTrigger value="single-forecast">Single Forecast</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="bulk-forecast">Bulk Forecast</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="seasonal-analysis">Seasonal Analysis</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="accuracy-tracking">Accuracy Tracking</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        {/* Single Forecast */}
        <tabs_1.TabsContent value="single-forecast" className="space-y-6">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.Target className="h-5 w-5" />
                Single Item Forecast
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label_1.Label htmlFor="item-select">Select Item</label_1.Label>
                  <select_1.Select value={selectedItem} onValueChange={setSelectedItem}>
                    <select_1.SelectTrigger>
                      <select_1.SelectValue placeholder="Choose an item to forecast" />
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      {inventoryItems.map(function (item) {
                        return (
                          <select_1.SelectItem key={item.id} value={item.id}>
                            {item.name} ({item.category})
                          </select_1.SelectItem>
                        );
                      })}
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>

                <div className="space-y-2">
                  <label_1.Label htmlFor="forecast-period">Forecast Period (days)</label_1.Label>
                  <select_1.Select
                    value={forecastPeriod.toString()}
                    onValueChange={function (value) {
                      return setForecastPeriod(Number(value));
                    }}
                  >
                    <select_1.SelectTrigger>
                      <select_1.SelectValue />
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="7">7 days</select_1.SelectItem>
                      <select_1.SelectItem value="14">14 days</select_1.SelectItem>
                      <select_1.SelectItem value="30">30 days</select_1.SelectItem>
                      <select_1.SelectItem value="60">60 days</select_1.SelectItem>
                      <select_1.SelectItem value="90">90 days</select_1.SelectItem>
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>

                <div className="space-y-2">
                  <label_1.Label htmlFor="confidence-level">Confidence Level</label_1.Label>
                  <select_1.Select
                    value={confidenceLevel.toString()}
                    onValueChange={function (value) {
                      return setConfidenceLevel(Number(value));
                    }}
                  >
                    <select_1.SelectTrigger>
                      <select_1.SelectValue />
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="0.80">80%</select_1.SelectItem>
                      <select_1.SelectItem value="0.90">90%</select_1.SelectItem>
                      <select_1.SelectItem value="0.95">95%</select_1.SelectItem>
                      <select_1.SelectItem value="0.99">99%</select_1.SelectItem>
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>
              </div>

              <div className="flex gap-2">
                <button_1.Button
                  onClick={handleSingleForecast}
                  disabled={!selectedItem || isLoading}
                  className="flex items-center gap-2"
                >
                  <lucide_react_1.Zap className="h-4 w-4" />
                  Generate Forecast
                </button_1.Button>
                {forecast && (
                  <button_1.Button variant="outline" onClick={clearForecast}>
                    Clear
                  </button_1.Button>
                )}
              </div>
            </card_1.CardContent>
          </card_1.Card>

          {/* Single Forecast Results */}
          {forecast && (
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center justify-between">
                  <span>Forecast Results: {forecast.itemName}</span>
                  <div className="flex items-center gap-2">
                    {getModelIcon(forecast.modelUsed)}
                    <badge_1.Badge variant="secondary">
                      {getModelName(forecast.modelUsed)}
                    </badge_1.Badge>
                  </div>
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <card_1.Card>
                    <card_1.CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {forecast.predictedDemand}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Predicted Demand ({formatPeriod(forecast.forecastPeriod)})
                        </div>
                      </div>
                    </card_1.CardContent>
                  </card_1.Card>

                  <card_1.Card>
                    <card_1.CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold">
                          {forecast.confidenceInterval.lower} - {forecast.confidenceInterval.upper}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {Math.round(forecast.confidenceInterval.level * 100)}% Confidence Interval
                        </div>
                      </div>
                    </card_1.CardContent>
                  </card_1.Card>

                  <card_1.Card>
                    <card_1.CardContent className="p-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div
                            className={"w-3 h-3 rounded-full ".concat(
                              getConfidenceColor(calculateConfidenceScore(forecast)),
                            )}
                          />
                          <span className="text-lg font-semibold">
                            {Math.round(calculateConfidenceScore(forecast) * 100)}%
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">Forecast Confidence</div>
                      </div>
                    </card_1.CardContent>
                  </card_1.Card>
                </div>

                {/* Accuracy Metrics */}
                <div>
                  <h4 className="font-semibold mb-3">Model Accuracy</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>MAPE</span>
                        <span>{Math.round(forecast.accuracy.mape * 100)}%</span>
                      </div>
                      <progress_1.Progress
                        value={Math.max(0, 100 - forecast.accuracy.mape * 100)}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>RMSE</span>
                        <span>{forecast.accuracy.rmse.toFixed(2)}</span>
                      </div>
                      <progress_1.Progress value={Math.max(0, 100 - forecast.accuracy.rmse)} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Last Period Accuracy</span>
                        <span>{Math.round(forecast.accuracy.lastPeriodAccuracy * 100)}%</span>
                      </div>
                      <progress_1.Progress value={forecast.accuracy.lastPeriodAccuracy * 100} />
                    </div>
                  </div>
                </div>

                {/* Trend Analysis */}
                {forecast.trendComponent !== 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Trend Analysis</h4>
                    <div className="flex items-center gap-2">
                      {forecast.trendComponent > 0
                        ? <lucide_react_1.TrendingUp className="h-5 w-5 text-green-600" />
                        : <lucide_react_1.TrendingDown className="h-5 w-5 text-red-600" />}
                      <span className="text-sm">
                        {forecast.trendComponent > 0 ? "Increasing" : "Decreasing"} trend detected (
                        {Math.abs(forecast.trendComponent * 100).toFixed(1)}% change)
                      </span>
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {forecast.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Recommendations</h4>
                    <div className="space-y-2">
                      {getForecastRecommendations(forecast, seasonalAnalysis || undefined).map(
                        function (rec, index) {
                          return (
                            <alert_1.Alert key={index}>
                              <lucide_react_1.CheckCircle className="h-4 w-4" />
                              <alert_1.AlertDescription>{rec}</alert_1.AlertDescription>
                            </alert_1.Alert>
                          );
                        },
                      )}
                    </div>
                  </div>
                )}
              </card_1.CardContent>
            </card_1.Card>
          )}
        </tabs_1.TabsContent>

        {/* Bulk Forecast */}
        <tabs_1.TabsContent value="bulk-forecast" className="space-y-6">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.BarChart3 className="h-5 w-5" />
                Bulk Forecast Generation
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label_1.Label>Select Items (hold Ctrl for multiple)</label_1.Label>
                  <div className="max-h-40 overflow-y-auto border rounded p-2 space-y-1">
                    {inventoryItems.map(function (item) {
                      return (
                        <div key={item.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={"bulk-".concat(item.id)}
                            checked={bulkItems.includes(item.id)}
                            onChange={function (e) {
                              if (e.target.checked) {
                                setBulkItems(
                                  __spreadArray(
                                    __spreadArray([], bulkItems, true),
                                    [item.id],
                                    false,
                                  ),
                                );
                              } else {
                                setBulkItems(
                                  bulkItems.filter(function (id) {
                                    return id !== item.id;
                                  }),
                                );
                              }
                            }}
                          />
                          <label htmlFor={"bulk-".concat(item.id)} className="text-sm">
                            {item.name} ({item.category})
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label_1.Label htmlFor="bulk-period">Forecast Period</label_1.Label>
                    <select_1.Select
                      value={forecastPeriod.toString()}
                      onValueChange={function (value) {
                        return setForecastPeriod(Number(value));
                      }}
                    >
                      <select_1.SelectTrigger>
                        <select_1.SelectValue />
                      </select_1.SelectTrigger>
                      <select_1.SelectContent>
                        <select_1.SelectItem value="7">7 days</select_1.SelectItem>
                        <select_1.SelectItem value="14">14 days</select_1.SelectItem>
                        <select_1.SelectItem value="30">30 days</select_1.SelectItem>
                        <select_1.SelectItem value="60">60 days</select_1.SelectItem>
                        <select_1.SelectItem value="90">90 days</select_1.SelectItem>
                      </select_1.SelectContent>
                    </select_1.Select>
                  </div>

                  <div className="space-y-2">
                    <label_1.Label htmlFor="bulk-confidence">Confidence Level</label_1.Label>
                    <select_1.Select
                      value={confidenceLevel.toString()}
                      onValueChange={function (value) {
                        return setConfidenceLevel(Number(value));
                      }}
                    >
                      <select_1.SelectTrigger>
                        <select_1.SelectValue />
                      </select_1.SelectTrigger>
                      <select_1.SelectContent>
                        <select_1.SelectItem value="0.80">80%</select_1.SelectItem>
                        <select_1.SelectItem value="0.90">90%</select_1.SelectItem>
                        <select_1.SelectItem value="0.95">95%</select_1.SelectItem>
                        <select_1.SelectItem value="0.99">99%</select_1.SelectItem>
                      </select_1.SelectContent>
                    </select_1.Select>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button_1.Button
                  onClick={handleBulkForecast}
                  disabled={bulkItems.length === 0 || isLoading}
                  className="flex items-center gap-2"
                >
                  <lucide_react_1.Zap className="h-4 w-4" />
                  Generate Bulk Forecasts ({bulkItems.length} items)
                </button_1.Button>
                {bulkForecasts.length > 0 && (
                  <button_1.Button variant="outline" onClick={clearBulkForecasts}>
                    Clear Results
                  </button_1.Button>
                )}
              </div>
            </card_1.CardContent>
          </card_1.Card>

          {/* Bulk Forecast Results */}
          {bulkForecasts.length > 0 && (
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>
                  Bulk Forecast Results ({bulkForecasts.length} items)
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-4">
                  {bulkForecasts.map(function (forecast) {
                    return (
                      <div key={forecast.itemId} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{forecast.itemName}</h4>
                          <div className="flex items-center gap-2">
                            {getModelIcon(forecast.modelUsed)}
                            <badge_1.Badge variant="outline">
                              {getModelName(forecast.modelUsed)}
                            </badge_1.Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Predicted Demand:</span>
                            <div className="font-semibold text-blue-600">
                              {forecast.predictedDemand}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Confidence Range:</span>
                            <div className="font-semibold">
                              {forecast.confidenceInterval.lower} -{" "}
                              {forecast.confidenceInterval.upper}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Model Accuracy:</span>
                            <div className="font-semibold">
                              {Math.round((1 - forecast.accuracy.mape) * 100)}%
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Confidence Score:</span>
                            <div className="flex items-center gap-2">
                              <div
                                className={"w-2 h-2 rounded-full ".concat(
                                  getConfidenceColor(calculateConfidenceScore(forecast)),
                                )}
                              />
                              <span className="font-semibold">
                                {Math.round(calculateConfidenceScore(forecast) * 100)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </card_1.CardContent>
            </card_1.Card>
          )}
        </tabs_1.TabsContent>

        {/* Seasonal Analysis */}
        <tabs_1.TabsContent value="seasonal-analysis" className="space-y-6">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.Calendar className="h-5 w-5" />
                Seasonal Pattern Analysis
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label_1.Label htmlFor="seasonal-item">Select Item</label_1.Label>
                  <select_1.Select value={selectedItem} onValueChange={setSelectedItem}>
                    <select_1.SelectTrigger>
                      <select_1.SelectValue placeholder="Choose an item to analyze" />
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      {inventoryItems.map(function (item) {
                        return (
                          <select_1.SelectItem key={item.id} value={item.id}>
                            {item.name} ({item.category})
                          </select_1.SelectItem>
                        );
                      })}
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>

                <div className="space-y-2">
                  <label_1.Label htmlFor="analysis-period">Analysis Period</label_1.Label>
                  <select_1.Select
                    value={analysisPeriod.toString()}
                    onValueChange={function (value) {
                      return setAnalysisPeriod(Number(value));
                    }}
                  >
                    <select_1.SelectTrigger>
                      <select_1.SelectValue />
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="90">90 days</select_1.SelectItem>
                      <select_1.SelectItem value="180">6 months</select_1.SelectItem>
                      <select_1.SelectItem value="365">1 year</select_1.SelectItem>
                      <select_1.SelectItem value="730">2 years</select_1.SelectItem>
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>
              </div>

              <div className="flex gap-2">
                <button_1.Button
                  onClick={handleSeasonalAnalysis}
                  disabled={!selectedItem || isLoading}
                  className="flex items-center gap-2"
                >
                  <lucide_react_1.Calendar className="h-4 w-4" />
                  Analyze Patterns
                </button_1.Button>
                {seasonalAnalysis && (
                  <button_1.Button variant="outline" onClick={clearSeasonalAnalysis}>
                    Clear Analysis
                  </button_1.Button>
                )}
              </div>
            </card_1.CardContent>
          </card_1.Card>

          {/* Seasonal Analysis Results */}
          {seasonalAnalysis && (
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Seasonal Analysis Results</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-6">
                {/* Statistics */}
                <div>
                  <h4 className="font-semibold mb-3">Consumption Statistics</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {seasonalAnalysis.statistics.totalConsumption}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Consumption</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {seasonalAnalysis.statistics.averageDailyConsumption.toFixed(1)}
                      </div>
                      <div className="text-sm text-muted-foreground">Daily Average</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {(seasonalAnalysis.statistics.coefficientOfVariation * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Variability</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {seasonalAnalysis.dataPoints}
                      </div>
                      <div className="text-sm text-muted-foreground">Data Points</div>
                    </div>
                  </div>
                </div>

                {/* Seasonal Patterns */}
                {seasonalAnalysis.seasonalPatterns.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Detected Patterns</h4>
                    <div className="space-y-3">
                      {seasonalAnalysis.seasonalPatterns.map(function (pattern, index) {
                        return (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold capitalize">
                                {pattern.pattern} Pattern
                              </span>
                              <badge_1.Badge
                                variant={
                                  pattern.strength > 0.7
                                    ? "default"
                                    : pattern.strength > 0.4
                                      ? "secondary"
                                      : "outline"
                                }
                              >
                                {Math.round(pattern.strength * 100)}% strength
                              </badge_1.Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {pattern.peaks.length > 0 && (
                                <div>Peak periods: {pattern.peaks.join(", ")}</div>
                              )}
                              {pattern.valleys.length > 0 && (
                                <div>Low periods: {pattern.valleys.join(", ")}</div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Demand Drivers */}
                <div>
                  <h4 className="font-semibold mb-3">Demand Drivers</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={"w-3 h-3 rounded-full ".concat(
                          seasonalAnalysis.demandDrivers.appointmentBased
                            ? "bg-green-500"
                            : "bg-gray-300",
                        )}
                      />
                      <span className="text-sm">Appointment-Based</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={"w-3 h-3 rounded-full ".concat(
                          seasonalAnalysis.demandDrivers.seasonalInfluenced
                            ? "bg-green-500"
                            : "bg-gray-300",
                        )}
                      />
                      <span className="text-sm">Seasonal Influence</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={"w-3 h-3 rounded-full ".concat(
                          seasonalAnalysis.demandDrivers.highVariability
                            ? "bg-red-500"
                            : "bg-gray-300",
                        )}
                      />
                      <span className="text-sm">High Variability</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={"w-3 h-3 rounded-full ".concat(
                          seasonalAnalysis.demandDrivers.steadyDemand
                            ? "bg-green-500"
                            : "bg-gray-300",
                        )}
                      />
                      <span className="text-sm">Steady Demand</span>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                {seasonalAnalysis.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Analysis Recommendations</h4>
                    <div className="space-y-2">
                      {seasonalAnalysis.recommendations.map(function (rec, index) {
                        return (
                          <alert_1.Alert key={index}>
                            <lucide_react_1.CheckCircle className="h-4 w-4" />
                            <alert_1.AlertDescription>{rec}</alert_1.AlertDescription>
                          </alert_1.Alert>
                        );
                      })}
                    </div>
                  </div>
                )}
              </card_1.CardContent>
            </card_1.Card>
          )}
        </tabs_1.TabsContent>

        {/* Accuracy Tracking */}
        <tabs_1.TabsContent value="accuracy-tracking" className="space-y-6">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.Target className="h-5 w-5" />
                Forecast Accuracy Tracking
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              <div className="flex gap-2">
                <button_1.Button
                  onClick={function () {
                    return handleAccuracyAnalysis("7d");
                  }}
                  disabled={isLoading}
                >
                  Last 7 Days
                </button_1.Button>
                <button_1.Button
                  onClick={function () {
                    return handleAccuracyAnalysis("30d");
                  }}
                  disabled={isLoading}
                >
                  Last 30 Days
                </button_1.Button>
                <button_1.Button
                  onClick={function () {
                    return handleAccuracyAnalysis("90d");
                  }}
                  disabled={isLoading}
                >
                  Last 90 Days
                </button_1.Button>
                <button_1.Button
                  onClick={function () {
                    return handleAccuracyAnalysis("1y");
                  }}
                  disabled={isLoading}
                >
                  Last Year
                </button_1.Button>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          {/* Accuracy Results */}
          {accuracyAnalysis && (
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Accuracy Analysis - {accuracyAnalysis.period}</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-6">
                {/* Overall Statistics */}
                <div>
                  <h4 className="font-semibold mb-3">Overall Performance</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.round(accuracyAnalysis.overallStatistics.averageAccuracy * 100)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Average Accuracy</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round(
                          accuracyAnalysis.overallStatistics.confidenceIntervalHitRate * 100,
                        )}
                        %
                      </div>
                      <div className="text-sm text-muted-foreground">CI Hit Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {(accuracyAnalysis.overallStatistics.averageMAPE * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Average MAPE</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {accuracyAnalysis.totalForecasts}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Forecasts</div>
                    </div>
                  </div>
                </div>

                {/* Model Performance */}
                <div>
                  <h4 className="font-semibold mb-3">Model Performance</h4>
                  <div className="space-y-3">
                    {Object.entries(accuracyAnalysis.byModel).map(function (_a) {
                      var model = _a[0],
                        data = _a[1];
                      return (
                        <div key={model} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getModelIcon(model)}
                              <span className="font-semibold">{getModelName(model)}</span>
                            </div>
                            <badge_1.Badge variant="outline">{data.usage} forecasts</badge_1.Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Accuracy:</span>
                              <div className="font-semibold">
                                {Math.round(data.statistics.averageAccuracy * 100)}%
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">MAPE:</span>
                              <div className="font-semibold">
                                {(data.statistics.averageMAPE * 100).toFixed(1)}%
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">CI Hit Rate:</span>
                              <div className="font-semibold">
                                {Math.round(data.statistics.confidenceIntervalHitRate * 100)}%
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Trend Analysis */}
                {accuracyAnalysis.trends && (
                  <div>
                    <h4 className="font-semibold mb-3">Accuracy Trends</h4>
                    <div className="flex items-center gap-2 mb-4">
                      {accuracyAnalysis.trends.trend.direction === "improving"
                        ? <lucide_react_1.TrendingUp className="h-5 w-5 text-green-600" />
                        : <lucide_react_1.TrendingDown className="h-5 w-5 text-red-600" />}
                      <span className="text-sm">
                        Accuracy is {accuracyAnalysis.trends.trend.direction}
                        {accuracyAnalysis.trends.trend.isSignificant && (
                          <badge_1.Badge variant="outline" className="ml-2">
                            Significant
                          </badge_1.Badge>
                        )}
                      </span>
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {accuracyAnalysis.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Improvement Recommendations</h4>
                    <div className="space-y-2">
                      {accuracyAnalysis.recommendations.map(function (rec, index) {
                        return (
                          <alert_1.Alert key={index}>
                            <lucide_react_1.CheckCircle className="h-4 w-4" />
                            <alert_1.AlertDescription>{rec}</alert_1.AlertDescription>
                          </alert_1.Alert>
                        );
                      })}
                    </div>
                  </div>
                )}
              </card_1.CardContent>
            </card_1.Card>
          )}
        </tabs_1.TabsContent>
      </tabs_1.Tabs>

      {/* Loading indicator */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <card_1.Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span>Generating forecast analysis...</span>
            </div>
          </card_1.Card>
        </div>
      )}
    </div>
  );
}

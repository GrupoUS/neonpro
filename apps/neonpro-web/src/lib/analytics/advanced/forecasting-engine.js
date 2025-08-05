/**
 * Time Series Forecasting Engine for NeonPro
 *
 * Advanced forecasting capabilities using machine learning approaches
 * inspired by Python's skforecast library but implemented in TypeScript.
 *
 * Features:
 * - Subscription growth forecasting
 * - Revenue prediction with confidence intervals
 * - Churn rate forecasting
 * - Seasonal adjustment
 * - Multiple time series support
 * - Automated feature engineering
 */
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
var __spreadArray =
  (this && this.__spreadArray) ||
  ((to, from, pack) => {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.forecastUtils = exports.ForecastingEngine = void 0;
exports.createForecastingEngine = createForecastingEngine;
var server_1 = require("@/lib/supabase/server");
var zod_1 = require("zod");
// Validation schemas
var forecastConfigSchema = zod_1.z.object({
  metric: zod_1.z.enum(["subscriptions", "revenue", "churn_rate", "mrr", "arr"]),
  horizon: zod_1.z.number().min(1).max(365),
  frequency: zod_1.z.enum(["daily", "weekly", "monthly"]),
  includeSeasonality: zod_1.z.boolean().default(true),
  includeExogenous: zod_1.z.boolean().default(true),
  confidenceLevel: zod_1.z.number().min(0.8).max(0.99).default(0.95),
  modelType: zod_1.z.enum(["linear", "polynomial", "exponential", "seasonal"]).default("seasonal"),
});
var ForecastingEngine = /** @class */ (() => {
  function ForecastingEngine() {
    this.supabase = (0, server_1.createClient)();
    this.modelCache = new Map();
  }
  /**
   * Generate forecasts for subscription metrics
   * Based on skforecast ForecasterRecursive pattern
   */
  ForecastingEngine.prototype.generateForecast = function (config) {
    return __awaiter(this, void 0, void 0, function () {
      var validConfig, historicalData, features, trainingData, model, forecasts;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            validConfig = forecastConfigSchema.parse(config);
            return [4 /*yield*/, this.getHistoricalData(validConfig.metric, validConfig.frequency)];
          case 1:
            historicalData = _a.sent();
            if (historicalData.length < 10) {
              throw new Error(
                "Insufficient historical data for forecasting (minimum 10 data points required)",
              );
            }
            features = this.generateModelFeatures(validConfig);
            trainingData = this.prepareTrainingData(historicalData, features);
            return [
              4 /*yield*/,
              this.getOrTrainModel(validConfig, trainingData),
              // Generate forecasts
            ];
          case 2:
            model = _a.sent();
            forecasts = this.predictFuture(
              model,
              historicalData,
              features,
              validConfig.horizon,
              validConfig.confidenceLevel,
            );
            return [2 /*return*/, forecasts];
        }
      });
    });
  };
  /**
   * Multiple time series forecasting
   * Similar to ForecasterRecursiveMultiSeries
   */
  ForecastingEngine.prototype.forecastMultipleSeries = function (metrics, config) {
    return __awaiter(this, void 0, void 0, function () {
      var results, forecastPromises, forecastResults;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            results = {};
            forecastPromises = metrics.map((metric) =>
              __awaiter(this, void 0, void 0, function () {
                var seriesConfig, forecast, error_1;
                return __generator(this, function (_a) {
                  switch (_a.label) {
                    case 0:
                      _a.trys.push([0, 2, , 3]);
                      seriesConfig = __assign(__assign({}, config), { metric: metric });
                      return [4 /*yield*/, this.generateForecast(seriesConfig)];
                    case 1:
                      forecast = _a.sent();
                      return [2 /*return*/, { metric: metric, forecast: forecast }];
                    case 2:
                      error_1 = _a.sent();
                      console.error("Error forecasting ".concat(metric, ":"), error_1);
                      return [2 /*return*/, { metric: metric, forecast: [] }];
                    case 3:
                      return [2 /*return*/];
                  }
                });
              }),
            );
            return [4 /*yield*/, Promise.all(forecastPromises)];
          case 1:
            forecastResults = _a.sent();
            forecastResults.forEach((_a) => {
              var metric = _a.metric,
                forecast = _a.forecast;
              results[metric] = forecast;
            });
            return [2 /*return*/, results];
        }
      });
    });
  };
  /**
   * Scenario analysis - generate forecasts under different conditions
   */
  ForecastingEngine.prototype.generateScenarios = function (config, scenarios) {
    return __awaiter(this, void 0, void 0, function () {
      var scenarioResults, baselineForecast, _i, scenarios_1, scenario, adjustedForecast;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            scenarioResults = {};
            return [4 /*yield*/, this.generateForecast(config)];
          case 1:
            baselineForecast = _a.sent();
            scenarioResults["baseline"] = baselineForecast;
            // Generate scenario-based forecasts
            for (_i = 0, scenarios_1 = scenarios; _i < scenarios_1.length; _i++) {
              scenario = scenarios_1[_i];
              adjustedForecast = this.applyScenarioAdjustments(
                baselineForecast,
                scenario.adjustments,
              );
              scenarioResults[scenario.name] = adjustedForecast;
            }
            return [2 /*return*/, scenarioResults];
        }
      });
    });
  };
  /**
   * Forecast accuracy evaluation using backtesting
   * Similar to skforecast backtesting_forecaster
   */
  ForecastingEngine.prototype.evaluateForecastAccuracy = function (config_1) {
    return __awaiter(this, arguments, void 0, function (config, backtestPeriods) {
      var historicalData,
        predictions,
        errors,
        i,
        splitPoint,
        trainData,
        testData,
        features,
        trainingFeatures,
        model,
        forecast,
        j,
        actual,
        predicted,
        mae,
        mse,
        rmse,
        mape,
        accuracy_score;
      if (backtestPeriods === void 0) {
        backtestPeriods = 4;
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.getHistoricalData(
                config.metric,
                config.frequency,
                true, // extended data
              ),
            ];
          case 1:
            historicalData = _a.sent();
            predictions = [];
            errors = [];
            i = 0;
            _a.label = 2;
          case 2:
            if (!(i < backtestPeriods)) return [3 /*break*/, 5];
            splitPoint = historicalData.length - (backtestPeriods - i) * config.horizon;
            trainData = historicalData.slice(0, splitPoint);
            testData = historicalData.slice(splitPoint, splitPoint + config.horizon);
            if (trainData.length < 10 || testData.length === 0) return [3 /*break*/, 4];
            features = this.generateModelFeatures(config);
            trainingFeatures = this.prepareTrainingData(trainData, features);
            return [4 /*yield*/, this.trainModel(config, trainingFeatures)];
          case 3:
            model = _a.sent();
            forecast = this.predictFuture(
              model,
              trainData,
              features,
              testData.length,
              config.confidenceLevel,
            );
            // Compare predictions with actual values
            for (j = 0; j < Math.min(forecast.length, testData.length); j++) {
              actual = testData[j].value;
              predicted = forecast[j].predicted;
              predictions.push({
                actual: actual,
                predicted: predicted,
                date: testData[j].date,
              });
              errors.push({
                absolute: Math.abs(actual - predicted),
                squared: (actual - predicted) ** 2,
                percentage: actual !== 0 ? Math.abs((actual - predicted) / actual) * 100 : 0,
              });
            }
            _a.label = 4;
          case 4:
            i++;
            return [3 /*break*/, 2];
          case 5:
            if (errors.length === 0) {
              throw new Error("Insufficient data for accuracy evaluation");
            }
            mae = errors.reduce((sum, e) => sum + e.absolute, 0) / errors.length;
            mse = errors.reduce((sum, e) => sum + e.squared, 0) / errors.length;
            rmse = Math.sqrt(mse);
            mape = errors.reduce((sum, e) => sum + e.percentage, 0) / errors.length;
            accuracy_score = Math.max(0, 100 - mape);
            return [
              2 /*return*/,
              {
                mae: Math.round(mae * 100) / 100,
                mape: Math.round(mape * 100) / 100,
                rmse: Math.round(rmse * 100) / 100,
                accuracy_score: Math.round(accuracy_score * 100) / 100,
                predictions: predictions,
              },
            ];
        }
      });
    });
  };
  /**
   * Automated feature engineering for time series
   */
  ForecastingEngine.prototype.generateModelFeatures = (config) => {
    var features = {
      lags: [],
      rolling_stats: [],
      seasonality: {
        weekly: false,
        monthly: false,
        quarterly: false,
      },
      trends: true,
      exogenous_vars: [],
    };
    // Configure lags based on frequency
    if (config.frequency === "daily") {
      features.lags = [1, 7, 14, 30]; // 1 day, 1 week, 2 weeks, 1 month
      features.rolling_stats = [
        { window: 7, stats: ["mean", "std"] },
        { window: 30, stats: ["mean", "min", "max"] },
      ];
      if (config.includeSeasonality) {
        features.seasonality.weekly = true;
        features.seasonality.monthly = true;
      }
    } else if (config.frequency === "weekly") {
      features.lags = [1, 4, 12, 24]; // 1 week, 1 month, 3 months, 6 months
      features.rolling_stats = [
        { window: 4, stats: ["mean", "std"] },
        { window: 12, stats: ["mean", "min", "max"] },
      ];
      if (config.includeSeasonality) {
        features.seasonality.monthly = true;
        features.seasonality.quarterly = true;
      }
    } else {
      // monthly
      features.lags = [1, 3, 6, 12]; // 1, 3, 6, 12 months
      features.rolling_stats = [
        { window: 3, stats: ["mean", "std"] },
        { window: 6, stats: ["mean", "min", "max"] },
      ];
      if (config.includeSeasonality) {
        features.seasonality.quarterly = true;
      }
    }
    // Add exogenous variables if requested
    if (config.includeExogenous) {
      features.exogenous_vars = [
        "marketing_spend",
        "support_tickets",
        "feature_releases",
        "competitor_activity",
        "economic_indicator",
      ];
    }
    return features;
  };
  /**
   * Prepare training data with lag features and rolling statistics
   */
  ForecastingEngine.prototype.prepareTrainingData = (data, features) => {
    var trainingData = [];
    var maxLag = Math.max.apply(
      Math,
      __spreadArray(__spreadArray([], features.lags, false), [0], false),
    );
    var maxWindow = Math.max.apply(
      Math,
      __spreadArray(
        __spreadArray(
          [],
          features.rolling_stats.map((rs) => rs.window),
          false,
        ),
        [0],
        false,
      ),
    );
    var startIndex = Math.max(maxLag, maxWindow);
    var _loop_1 = (i) => {
      var featureVector = {};
      // Add lag features
      features.lags.forEach((lag) => {
        if (i - lag >= 0) {
          featureVector["lag_".concat(lag)] = data[i - lag].value;
        }
      });
      // Add rolling statistics
      features.rolling_stats.forEach((_a) => {
        var window = _a.window,
          stats = _a.stats;
        if (i - window + 1 >= 0) {
          var windowData_1 = data.slice(i - window + 1, i + 1).map((d) => d.value);
          stats.forEach((stat) => {
            var value = 0;
            if (stat === "mean") {
              value = windowData_1.reduce((sum, v) => sum + v, 0) / windowData_1.length;
            } else if (stat === "std") {
              var mean_1 = windowData_1.reduce((sum, v) => sum + v, 0) / windowData_1.length;
              value = Math.sqrt(
                windowData_1.reduce((sum, v) => sum + (v - mean_1) ** 2, 0) / windowData_1.length,
              );
            } else if (stat === "min") {
              value = Math.min.apply(Math, windowData_1);
            } else if (stat === "max") {
              value = Math.max.apply(Math, windowData_1);
            }
            featureVector["rolling_".concat(window, "_").concat(stat)] = value;
          });
        }
      });
      // Add seasonality features
      var date = new Date(data[i].date);
      if (features.seasonality.weekly) {
        featureVector["day_of_week"] = date.getDay();
        featureVector["day_of_week_sin"] = Math.sin((2 * Math.PI * date.getDay()) / 7);
        featureVector["day_of_week_cos"] = Math.cos((2 * Math.PI * date.getDay()) / 7);
      }
      if (features.seasonality.monthly) {
        featureVector["day_of_month"] = date.getDate();
        featureVector["month"] = date.getMonth();
        featureVector["month_sin"] = Math.sin((2 * Math.PI * date.getMonth()) / 12);
        featureVector["month_cos"] = Math.cos((2 * Math.PI * date.getMonth()) / 12);
      }
      if (features.seasonality.quarterly) {
        var quarter = Math.floor(date.getMonth() / 3);
        featureVector["quarter"] = quarter;
        featureVector["quarter_sin"] = Math.sin((2 * Math.PI * quarter) / 4);
        featureVector["quarter_cos"] = Math.cos((2 * Math.PI * quarter) / 4);
      }
      // Add trend feature
      if (features.trends) {
        featureVector["trend"] = i;
      }
      // Add exogenous variables
      if (data[i].exogenous) {
        features.exogenous_vars.forEach((varName) => {
          if (data[i].exogenous[varName] !== undefined) {
            featureVector[varName] = data[i].exogenous[varName];
          }
        });
      }
      trainingData.push({
        target: data[i].value,
        features: featureVector,
      });
    };
    for (var i = startIndex; i < data.length; i++) {
      _loop_1(i);
    }
    return trainingData;
  };
  /**
   * Get historical data from the database
   */
  ForecastingEngine.prototype.getHistoricalData = function (metric_1, frequency_1) {
    return __awaiter(this, arguments, void 0, function (metric, frequency, extended) {
      var _a, data, error;
      if (extended === void 0) {
        extended = false;
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.rpc("get_forecasting_data", {
                p_metric: metric,
                p_frequency: frequency,
                p_extended: extended,
              }),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Failed to fetch historical data: ".concat(error.message));
            }
            return [2 /*return*/, data || []];
        }
      });
    });
  };
  /**
   * Train or retrieve cached forecasting model
   */
  ForecastingEngine.prototype.getOrTrainModel = function (config, trainingData) {
    return __awaiter(this, void 0, void 0, function () {
      var cacheKey, model, firstKey;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            cacheKey = this.generateModelCacheKey(config);
            if (this.modelCache.has(cacheKey)) {
              return [2 /*return*/, this.modelCache.get(cacheKey)];
            }
            return [4 /*yield*/, this.trainModel(config, trainingData)];
          case 1:
            model = _a.sent();
            this.modelCache.set(cacheKey, model);
            // Cache cleanup (keep only last 10 models)
            if (this.modelCache.size > 10) {
              firstKey = this.modelCache.keys().next().value;
              this.modelCache.delete(firstKey);
            }
            return [2 /*return*/, model];
        }
      });
    });
  };
  /**
   * Train a forecasting model based on configuration
   */
  ForecastingEngine.prototype.trainModel = function (config, trainingData) {
    return __awaiter(this, void 0, void 0, function () {
      var features, X, y, model;
      return __generator(this, function (_a) {
        // Simple linear regression implementation
        // In production, could integrate with ML services or more sophisticated models
        if (trainingData.length === 0) {
          throw new Error("No training data available");
        }
        features = Object.keys(trainingData[0].features);
        X = trainingData.map((d) => features.map((f) => d.features[f] || 0));
        y = trainingData.map((d) => d.target);
        if (config.modelType === "linear") {
          model = this.trainLinearRegression(X, y);
        } else if (config.modelType === "polynomial") {
          model = this.trainPolynomialRegression(X, y, 2);
        } else if (config.modelType === "exponential") {
          model = this.trainExponentialSmoothing(y);
        } else {
          // seasonal
          model = this.trainSeasonalModel(X, y, config.frequency);
        }
        return [
          2 /*return*/,
          __assign(__assign({}, model), {
            features: features,
            config: config,
            trainedAt: new Date().toISOString(),
          }),
        ];
      });
    });
  };
  /**
   * Generate future predictions using trained model
   */
  ForecastingEngine.prototype.predictFuture = function (
    model,
    historicalData,
    features,
    horizon,
    confidenceLevel,
  ) {
    var predictions = [];
    var extendedData = __spreadArray([], historicalData, true);
    for (var i = 0; i < horizon; i++) {
      // Prepare features for next prediction
      var featureVector = this.prepareFeatureVector(
        extendedData,
        features,
        extendedData.length - 1 + i,
      );
      // Make prediction
      var predicted = this.makePrediction(model, featureVector);
      // Calculate confidence interval
      var _a = this.calculateConfidenceInterval(
          predicted,
          model.residualStd || predicted * 0.1, // fallback to 10% of prediction
          confidenceLevel,
        ),
        lower_bound = _a.lower_bound,
        upper_bound = _a.upper_bound;
      // Generate future date
      var lastDate = new Date(extendedData[extendedData.length - 1].date);
      var nextDate = this.getNextDate(lastDate, features, model.config.frequency);
      var result = {
        date: nextDate.toISOString().split("T")[0],
        predicted: Math.round(predicted * 100) / 100,
        lower_bound: Math.round(lower_bound * 100) / 100,
        upper_bound: Math.round(upper_bound * 100) / 100,
        confidence: confidenceLevel * 100,
      };
      predictions.push(result);
      // Add predicted value to extended data for next iteration
      extendedData.push({
        date: result.date,
        value: predicted,
      });
    }
    return predictions;
  };
  // Simplified ML model implementations (in production, use proper ML libraries)
  ForecastingEngine.prototype.trainLinearRegression = (X, y) => {
    // Simple linear regression using normal equation
    // For production, use proper ML libraries
    var n = X.length;
    var features = X[0].length;
    // Add bias term
    var XWithBias = X.map((row) => __spreadArray([1], row, true));
    // Calculate weights using normal equation: w = (X^T * X)^-1 * X^T * y
    // Simplified implementation
    var weights = new Array(features + 1).fill(0);
    // Simple gradient descent approximation
    for (var iter = 0; iter < 1000; iter++) {
      var predictions = XWithBias.map((row) =>
        row.reduce((sum, xi, i) => sum + xi * weights[i], 0),
      );
      var errors = predictions.map((pred, i) => pred - y[i]);
      var _loop_2 = (j) => {
        var gradient = errors.reduce((sum, error, i) => sum + error * XWithBias[i][j], 0) / n;
        weights[j] -= 0.001 * gradient; // learning rate
      };
      // Update weights
      for (var j = 0; j < weights.length; j++) {
        _loop_2(j);
      }
    }
    // Calculate residual standard deviation
    var finalPredictions = XWithBias.map((row) =>
      row.reduce((sum, xi, i) => sum + xi * weights[i], 0),
    );
    var residuals = finalPredictions.map((pred, i) => (pred - y[i]) ** 2);
    var residualStd = Math.sqrt(residuals.reduce((sum, r) => sum + r, 0) / (n - 1));
    return {
      type: "linear",
      weights: weights,
      residualStd: residualStd,
    };
  };
  ForecastingEngine.prototype.trainPolynomialRegression = function (X, y, degree) {
    // Transform features to polynomial features
    var polyX = X.map((row) => {
      var polyRow = [1]; // bias
      row.forEach((x) => polyRow.push(x)); // linear terms
      if (degree >= 2) {
        // Add quadratic terms
        row.forEach((x, i) => {
          polyRow.push(x * x); // x^2
          for (var j = i + 1; j < row.length; j++) {
            polyRow.push(x * row[j]); // xi * xj
          }
        });
      }
      return polyRow;
    });
    // Use linear regression on polynomial features
    return this.trainLinearRegression(
      polyX.map((row) => row.slice(1)),
      y,
    );
  };
  ForecastingEngine.prototype.trainExponentialSmoothing = (y) => {
    // Simple exponential smoothing
    var alpha = 0.3; // smoothing parameter
    var smoothed = y[0];
    var smoothedValues = [smoothed];
    for (var i = 1; i < y.length; i++) {
      smoothed = alpha * y[i] + (1 - alpha) * smoothed;
      smoothedValues.push(smoothed);
    }
    var residuals = y.map((actual, i) => (actual - smoothedValues[i]) ** 2);
    var residualStd = Math.sqrt(residuals.reduce((sum, r) => sum + r, 0) / (y.length - 1));
    return {
      type: "exponential",
      alpha: alpha,
      lastSmoothed: smoothed,
      residualStd: residualStd,
    };
  };
  ForecastingEngine.prototype.trainSeasonalModel = function (X, y, frequency) {
    // Simple seasonal decomposition and linear regression
    // This is a simplified implementation
    var seasonalPeriod = frequency === "daily" ? 7 : frequency === "weekly" ? 4 : 12;
    // Calculate seasonal components
    var seasonal = this.calculateSeasonalComponents(y, seasonalPeriod);
    // Deseasonalize the data
    var deseasonalized = y.map((value, i) => value - seasonal[i % seasonalPeriod]);
    // Train linear model on deseasonalized data
    var linearModel = this.trainLinearRegression(X, deseasonalized);
    return {
      type: "seasonal",
      linearModel: linearModel,
      seasonal: seasonal,
      seasonalPeriod: seasonalPeriod,
    };
  };
  ForecastingEngine.prototype.calculateSeasonalComponents = (y, period) => {
    var seasonal = new Array(period).fill(0);
    var counts = new Array(period).fill(0);
    y.forEach((value, i) => {
      var seasonIndex = i % period;
      seasonal[seasonIndex] += value;
      counts[seasonIndex]++;
    });
    // Calculate average for each season
    for (var i = 0; i < period; i++) {
      seasonal[i] = counts[i] > 0 ? seasonal[i] / counts[i] : 0;
    }
    // Center the seasonal components
    var mean = seasonal.reduce((sum, s) => sum + s, 0) / period;
    return seasonal.map((s) => s - mean);
  };
  ForecastingEngine.prototype.prepareFeatureVector = (data, features, index) => {
    var featureVector = {};
    // Add lag features
    features.lags.forEach((lag) => {
      var lagIndex = index - lag;
      if (lagIndex >= 0 && lagIndex < data.length) {
        featureVector["lag_".concat(lag)] = data[lagIndex].value;
      } else {
        featureVector["lag_".concat(lag)] = 0;
      }
    });
    // Add rolling statistics (simplified)
    features.rolling_stats.forEach((_a) => {
      var window = _a.window,
        stats = _a.stats;
      var windowStart = Math.max(0, index - window + 1);
      var windowEnd = Math.min(data.length, index + 1);
      var windowData = data.slice(windowStart, windowEnd).map((d) => d.value);
      if (windowData.length > 0) {
        stats.forEach((stat) => {
          var value = 0;
          if (stat === "mean") {
            value = windowData.reduce((sum, v) => sum + v, 0) / windowData.length;
          } else if (stat === "std") {
            var mean_2 = windowData.reduce((sum, v) => sum + v, 0) / windowData.length;
            value = Math.sqrt(
              windowData.reduce((sum, v) => sum + (v - mean_2) ** 2, 0) / windowData.length,
            );
          } else if (stat === "min") {
            value = Math.min.apply(Math, windowData);
          } else if (stat === "max") {
            value = Math.max.apply(Math, windowData);
          }
          featureVector["rolling_".concat(window, "_").concat(stat)] = value;
        });
      }
    });
    // Add seasonality and trend features
    featureVector["trend"] = index;
    return featureVector;
  };
  ForecastingEngine.prototype.makePrediction = function (model, featureVector) {
    if (model.type === "linear" || model.type === "polynomial") {
      var features = __spreadArray(
        [1],
        model.features.map((f) => featureVector[f] || 0),
        true,
      );
      return features.reduce((sum, xi, i) => sum + xi * (model.weights[i] || 0), 0);
    } else if (model.type === "exponential") {
      return model.lastSmoothed;
    } else if (model.type === "seasonal") {
      var linearPred = this.makePrediction(model.linearModel, featureVector);
      var seasonalIndex = (featureVector.trend || 0) % model.seasonalPeriod;
      return linearPred + model.seasonal[seasonalIndex];
    }
    return 0;
  };
  ForecastingEngine.prototype.calculateConfidenceInterval = (
    prediction,
    standardError,
    confidenceLevel,
  ) => {
    // Z-scores for common confidence levels
    var zScores = {
      0.9: 1.645,
      0.95: 1.96,
      0.99: 2.576,
    };
    var zScore = zScores[confidenceLevel] || 1.96;
    var margin = zScore * standardError;
    return {
      lower_bound: Math.max(0, prediction - margin), // Don't allow negative predictions
      upper_bound: prediction + margin,
    };
  };
  ForecastingEngine.prototype.getNextDate = (lastDate, features, frequency) => {
    var nextDate = new Date(lastDate);
    if (frequency === "daily") {
      nextDate.setDate(nextDate.getDate() + 1);
    } else if (frequency === "weekly") {
      nextDate.setDate(nextDate.getDate() + 7);
    } else {
      // monthly
      nextDate.setMonth(nextDate.getMonth() + 1);
    }
    return nextDate;
  };
  ForecastingEngine.prototype.applyScenarioAdjustments = (baselineForecast, adjustments) =>
    baselineForecast.map((forecast, i) => {
      var adjusted = forecast.predicted;
      // Apply growth rate adjustment
      if (adjustments.growth_rate) {
        var growthMultiplier = (1 + adjustments.growth_rate / 100) ** (i + 1);
        adjusted *= growthMultiplier;
      }
      // Apply seasonality factor
      if (adjustments.seasonality_factor) {
        adjusted *= 1 + adjustments.seasonality_factor / 100;
      }
      // Apply external factors (simplified)
      if (adjustments.external_factors) {
        var factorSum = Object.values(adjustments.external_factors).reduce(
          (sum, factor) => sum + factor,
          0,
        );
        adjusted *= 1 + factorSum / 100;
      }
      // Recalculate bounds proportionally
      var ratio = adjusted / forecast.predicted;
      return __assign(__assign({}, forecast), {
        predicted: Math.round(adjusted * 100) / 100,
        lower_bound: Math.round(forecast.lower_bound * ratio * 100) / 100,
        upper_bound: Math.round(forecast.upper_bound * ratio * 100) / 100,
      });
    });
  ForecastingEngine.prototype.generateModelCacheKey = (config) =>
    ""
      .concat(config.metric, "_")
      .concat(config.frequency, "_")
      .concat(config.modelType, "_")
      .concat(config.horizon, "_")
      .concat(config.includeSeasonality, "_")
      .concat(config.includeExogenous);
  return ForecastingEngine;
})();
exports.ForecastingEngine = ForecastingEngine;
// Factory function
function createForecastingEngine() {
  return new ForecastingEngine();
}
// Utility functions for forecasting
exports.forecastUtils = {
  /**
   * Calculate forecast accuracy metrics
   */
  calculateAccuracyMetrics: (actual, predicted) => {
    if (actual.length !== predicted.length) {
      throw new Error("Actual and predicted arrays must have the same length");
    }
    var n = actual.length;
    var errors = actual.map((a, i) => a - predicted[i]);
    var absoluteErrors = errors.map((e) => Math.abs(e));
    var squaredErrors = errors.map((e) => e * e);
    var percentageErrors = actual.map((a, i) =>
      a !== 0 ? Math.abs((a - predicted[i]) / a) * 100 : 0,
    );
    return {
      mae: absoluteErrors.reduce((sum, e) => sum + e, 0) / n,
      mse: squaredErrors.reduce((sum, e) => sum + e, 0) / n,
      rmse: Math.sqrt(squaredErrors.reduce((sum, e) => sum + e, 0) / n),
      mape: percentageErrors.reduce((sum, e) => sum + e, 0) / n,
    };
  },
  /**
   * Format forecast data for visualization
   */
  formatForChart: (historical, forecasts) =>
    __spreadArray(
      __spreadArray(
        [],
        historical.map((h) => ({
          date: h.date,
          actual: h.value,
          type: "historical",
        })),
        true,
      ),
      forecasts.map((f) => ({
        date: f.date,
        predicted: f.predicted,
        lower_bound: f.lower_bound,
        upper_bound: f.upper_bound,
        type: "forecast",
      })),
      true,
    ),
  /**
   * Detect anomalies in forecast vs actual
   */
  detectAnomalies: (actual, predicted, threshold) => {
    if (threshold === void 0) {
      threshold = 2;
    }
    var errors = actual.map((a, i) => a - predicted[i]);
    var meanError = errors.reduce((sum, e) => sum + e, 0) / errors.length;
    var stdError = Math.sqrt(
      errors.reduce((sum, e) => sum + (e - meanError) ** 2, 0) / errors.length,
    );
    return errors.map((error, i) => ({
      index: i,
      actual: actual[i],
      predicted: predicted[i],
      error: error,
      isAnomaly: Math.abs(error - meanError) > threshold * stdError,
      zScore: stdError > 0 ? (error - meanError) / stdError : 0,
    }));
  },
};

"use strict";
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
var server_1 = require("@/lib/supabase/server");
var server_2 = require("next/server");
var zod_1 = require("zod");
var accuracyAnalysisSchema = zod_1.z.object({
  clinicId: zod_1.z.string().uuid(),
  itemId: zod_1.z.string().uuid().optional(),
  period: zod_1.z.enum(["7d", "30d", "90d", "1y"]).default("30d"),
  modelType: zod_1.z
    .enum([
      "exponential_smoothing",
      "seasonal_decomposition",
      "linear_regression",
      "moving_average",
    ])
    .optional(),
});
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var searchParams,
      params,
      validation,
      _a,
      clinicId,
      itemId,
      period,
      modelType,
      periodDays,
      startDate,
      supabase,
      query,
      _b,
      accuracyData,
      error,
      stats,
      byModel,
      byCategory,
      trends,
      error_1;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 3, , 4]);
          searchParams = new URL(request.url).searchParams;
          params = {
            clinicId: searchParams.get("clinicId"),
            itemId: searchParams.get("itemId") || undefined,
            period: searchParams.get("period") || "30d",
            modelType: searchParams.get("modelType") || undefined,
          };
          validation = accuracyAnalysisSchema.safeParse(params);
          if (!validation.success) {
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { error: "Invalid parameters", details: validation.error.errors },
                { status: 400 },
              ),
            ];
          }
          (_a = validation.data),
            (clinicId = _a.clinicId),
            (itemId = _a.itemId),
            (period = _a.period),
            (modelType = _a.modelType);
          periodDays = {
            "7d": 7,
            "30d": 30,
            "90d": 90,
            "1y": 365,
          };
          startDate = new Date();
          startDate.setDate(startDate.getDate() - periodDays[period]);
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 1:
          supabase = _c.sent();
          query = supabase
            .from("forecast_accuracy_log")
            .select(
              "\n        *,\n        inventory_items (\n          name,\n          category\n        )\n      ",
            )
            .eq("clinic_id", clinicId)
            .gte("forecast_date", startDate.toISOString())
            .order("forecast_date", { ascending: false });
          if (itemId) {
            query = query.eq("item_id", itemId);
          }
          if (modelType) {
            query = query.eq("model_used", modelType);
          }
          return [4 /*yield*/, query];
        case 2:
          (_b = _c.sent()), (accuracyData = _b.data), (error = _b.error);
          if (error) throw error;
          stats = calculateAccuracyStatistics(accuracyData || []);
          byModel = groupAccuracyByModel(accuracyData || []);
          byCategory = groupAccuracyByCategory(accuracyData || []);
          trends = calculateAccuracyTrends(accuracyData || [], period);
          return [
            2 /*return*/,
            server_2.NextResponse.json({
              success: true,
              data: {
                period: period,
                totalForecasts:
                  (accuracyData === null || accuracyData === void 0
                    ? void 0
                    : accuracyData.length) || 0,
                overallStatistics: stats,
                byModel: byModel,
                byCategory: byCategory,
                trends: trends,
                recommendations: generateAccuracyRecommendations(stats, byModel, trends),
              },
            }),
          ];
        case 3:
          error_1 = _c.sent();
          console.error("Accuracy analysis error:", error_1);
          return [
            2 /*return*/,
            server_2.NextResponse.json(
              { error: "Failed to analyze forecast accuracy" },
              { status: 500 },
            ),
          ];
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var body, supabase, _a, data, error, error_2;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 4, , 5]);
          return [4 /*yield*/, request.json()];
        case 1:
          body = _b.sent();
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 2:
          supabase = _b.sent();
          return [
            4 /*yield*/,
            supabase
              .from("forecast_accuracy_log")
              .insert({
                clinic_id: body.clinicId,
                item_id: body.itemId,
                forecast_date: body.forecastDate,
                forecast_period: body.forecastPeriod,
                predicted_demand: body.predictedDemand,
                actual_demand: body.actualDemand,
                accuracy_percentage: body.accuracyPercentage,
                mape: body.mape,
                rmse: body.rmse,
                model_used: body.modelUsed,
                confidence_level: body.confidenceLevel,
                within_confidence_interval: body.withinConfidenceInterval,
              })
              .select()
              .single(),
          ];
        case 3:
          (_a = _b.sent()), (data = _a.data), (error = _a.error);
          if (error) throw error;
          return [
            2 /*return*/,
            server_2.NextResponse.json({
              success: true,
              data: data,
            }),
          ];
        case 4:
          error_2 = _b.sent();
          console.error("Failed to log forecast accuracy:", error_2);
          return [
            2 /*return*/,
            server_2.NextResponse.json({ error: "Failed to log accuracy data" }, { status: 500 }),
          ];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
function calculateAccuracyStatistics(data) {
  if (data.length === 0) {
    return {
      averageAccuracy: 0,
      averageMAPE: 0,
      averageRMSE: 0,
      confidenceIntervalHitRate: 0,
      totalForecasts: 0,
    };
  }
  var accuracies = data
    .map(function (d) {
      return d.accuracy_percentage;
    })
    .filter(function (a) {
      return a !== null;
    });
  var mapes = data
    .map(function (d) {
      return d.mape;
    })
    .filter(function (m) {
      return m !== null;
    });
  var rmses = data
    .map(function (d) {
      return d.rmse;
    })
    .filter(function (r) {
      return r !== null;
    });
  var confidenceHits = data.filter(function (d) {
    return d.within_confidence_interval === true;
  }).length;
  return {
    averageAccuracy:
      accuracies.reduce(function (sum, acc) {
        return sum + acc;
      }, 0) / accuracies.length,
    averageMAPE:
      mapes.reduce(function (sum, mape) {
        return sum + mape;
      }, 0) / mapes.length,
    averageRMSE:
      rmses.reduce(function (sum, rmse) {
        return sum + rmse;
      }, 0) / rmses.length,
    confidenceIntervalHitRate: confidenceHits / data.length,
    totalForecasts: data.length,
  };
}
function groupAccuracyByModel(data) {
  var byModel = {};
  data.forEach(function (item) {
    var model = item.model_used;
    if (!byModel[model]) {
      byModel[model] = [];
    }
    byModel[model].push(item);
  });
  // Calculate statistics for each model
  Object.keys(byModel).forEach(function (model) {
    var modelData = byModel[model];
    byModel[model] = {
      forecasts: modelData,
      statistics: calculateAccuracyStatistics(modelData),
      usage: modelData.length,
    };
  });
  return byModel;
}
function groupAccuracyByCategory(data) {
  var byCategory = {};
  data.forEach(function (item) {
    var _a;
    var category =
      ((_a = item.inventory_items) === null || _a === void 0 ? void 0 : _a.category) || "Unknown";
    if (!byCategory[category]) {
      byCategory[category] = [];
    }
    byCategory[category].push(item);
  });
  // Calculate statistics for each category
  Object.keys(byCategory).forEach(function (category) {
    var categoryData = byCategory[category];
    byCategory[category] = {
      forecasts: categoryData,
      statistics: calculateAccuracyStatistics(categoryData),
      itemCount: new Set(
        categoryData.map(function (d) {
          return d.item_id;
        }),
      ).size,
    };
  });
  return byCategory;
}
function calculateAccuracyTrends(data, period) {
  // Group by week for trend analysis
  var weeklyData = new Map();
  data.forEach(function (item) {
    var date = new Date(item.forecast_date);
    var weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay()); // Start of week
    var weekKey = weekStart.toISOString().split("T")[0];
    if (!weeklyData.has(weekKey)) {
      weeklyData.set(weekKey, []);
    }
    weeklyData.get(weekKey).push(item);
  });
  // Calculate weekly averages
  var weeklyStats = Array.from(weeklyData.entries())
    .map(function (_a) {
      var week = _a[0],
        items = _a[1];
      return __assign({ week: week }, calculateAccuracyStatistics(items));
    })
    .sort(function (a, b) {
      return a.week.localeCompare(b.week);
    });
  // Calculate trend direction
  var recentWeeks = weeklyStats.slice(-4); // Last 4 weeks
  var earlyWeeks = weeklyStats.slice(0, 4); // First 4 weeks
  var recentAvgAccuracy =
    recentWeeks.reduce(function (sum, w) {
      return sum + w.averageAccuracy;
    }, 0) / recentWeeks.length;
  var earlyAvgAccuracy =
    earlyWeeks.reduce(function (sum, w) {
      return sum + w.averageAccuracy;
    }, 0) / earlyWeeks.length;
  return {
    weeklyStats: weeklyStats,
    trend: {
      direction: recentAvgAccuracy > earlyAvgAccuracy ? "improving" : "declining",
      change: recentAvgAccuracy - earlyAvgAccuracy,
      isSignificant: Math.abs(recentAvgAccuracy - earlyAvgAccuracy) > 0.05, // 5% threshold
    },
  };
}
function generateAccuracyRecommendations(overallStats, byModel, trends) {
  var recommendations = [];
  // Overall accuracy recommendations
  if (overallStats.averageAccuracy < 0.7) {
    recommendations.push(
      "Overall forecast accuracy is below 70% - consider reviewing forecasting parameters and data quality",
    );
  }
  if (overallStats.confidenceIntervalHitRate < 0.8) {
    recommendations.push(
      "Confidence intervals are not performing well - consider adjusting confidence levels or improving uncertainty estimates",
    );
  }
  // Model performance recommendations
  var modelPerformance = Object.entries(byModel)
    .map(function (_a) {
      var model = _a[0],
        data = _a[1];
      return {
        model: model,
        accuracy: data.statistics.averageAccuracy,
        usage: data.usage,
      };
    })
    .sort(function (a, b) {
      return b.accuracy - a.accuracy;
    });
  if (modelPerformance.length > 1) {
    var bestModel = modelPerformance[0];
    var worstModel = modelPerformance[modelPerformance.length - 1];
    if (bestModel.accuracy - worstModel.accuracy > 0.1) {
      recommendations.push(
        "Consider using "
          .concat(bestModel.model, " more frequently - it shows ")
          .concat(
            Math.round((bestModel.accuracy - worstModel.accuracy) * 100),
            "% better accuracy than ",
          )
          .concat(worstModel.model),
      );
    }
  }
  // Trend recommendations
  if (trends.trend.direction === "declining" && trends.trend.isSignificant) {
    recommendations.push(
      "Forecast accuracy is declining over time - review data quality and model parameters",
    );
  } else if (trends.trend.direction === "improving" && trends.trend.isSignificant) {
    recommendations.push("Forecast accuracy is improving - current approach is working well");
  }
  return recommendations;
}

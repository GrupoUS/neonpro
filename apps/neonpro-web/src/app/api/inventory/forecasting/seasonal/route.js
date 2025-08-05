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
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
var demand_forecasting_service_1 = require("@/app/lib/services/demand-forecasting-service");
var server_1 = require("next/server");
var zod_1 = require("zod");
var seasonalAnalysisSchema = zod_1.z.object({
  itemId: zod_1.z.string().uuid(),
  clinicId: zod_1.z.string().uuid(),
  analysisPeriod: zod_1.z.number().min(90).max(730).default(365), // 90 days to 2 years
});
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var body,
      validation,
      _a,
      itemId,
      clinicId,
      analysisPeriod,
      historicalData,
      seasonalPatterns,
      appointmentDemand,
      totalConsumption,
      averageDailyConsumption_1,
      consumptionByType,
      dailyConsumption_1,
      consumptionValues,
      variance,
      standardDeviation,
      coefficientOfVariation,
      demandDrivers,
      analysis,
      error_1;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 4, , 5]);
          return [4 /*yield*/, request.json()];
        case 1:
          body = _b.sent();
          validation = seasonalAnalysisSchema.safeParse(body);
          if (!validation.success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Invalid request data", details: validation.error.errors },
                { status: 400 },
              ),
            ];
          }
          (_a = validation.data),
            (itemId = _a.itemId),
            (clinicId = _a.clinicId),
            (analysisPeriod = _a.analysisPeriod);
          return [
            4 /*yield*/,
            demand_forecasting_service_1.demandForecastingService.getHistoricalConsumption(
              itemId,
              clinicId,
              analysisPeriod,
            ),
          ];
        case 2:
          historicalData = _b.sent();
          if (historicalData.length < 30) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error:
                    "Insufficient data for seasonal analysis (minimum 30 data points required)",
                },
                { status: 400 },
              ),
            ];
          }
          seasonalPatterns =
            demand_forecasting_service_1.demandForecastingService.analyzeSeasonalPatterns(
              historicalData,
            );
          return [
            4 /*yield*/,
            demand_forecasting_service_1.demandForecastingService.getAppointmentBasedDemand(
              itemId,
              clinicId,
              analysisPeriod,
            ),
          ];
        case 3:
          appointmentDemand = _b.sent();
          totalConsumption = historicalData.reduce((sum, item) => sum + item.quantity, 0);
          averageDailyConsumption_1 = totalConsumption / analysisPeriod;
          consumptionByType = historicalData.reduce((acc, item) => {
            acc[item.type] = (acc[item.type] || 0) + item.quantity;
            return acc;
          }, {});
          dailyConsumption_1 = new Map();
          historicalData.forEach((item) => {
            var dateKey = item.date.toISOString().split("T")[0];
            dailyConsumption_1.set(dateKey, (dailyConsumption_1.get(dateKey) || 0) + item.quantity);
          });
          consumptionValues = Array.from(dailyConsumption_1.values());
          variance =
            consumptionValues.reduce(
              (sum, val) => sum + (val - averageDailyConsumption_1) ** 2,
              0,
            ) / consumptionValues.length;
          standardDeviation = Math.sqrt(variance);
          coefficientOfVariation =
            averageDailyConsumption_1 > 0 ? standardDeviation / averageDailyConsumption_1 : 0;
          demandDrivers = {
            appointmentBased: appointmentDemand.length > 0,
            seasonalInfluenced: seasonalPatterns.some((p) => p.strength > 0.3),
            highVariability: coefficientOfVariation > 0.5,
            steadyDemand: coefficientOfVariation < 0.2,
          };
          analysis = {
            itemId: itemId,
            analysisPeriod: analysisPeriod,
            dataPoints: historicalData.length,
            seasonalPatterns: seasonalPatterns,
            statistics: {
              totalConsumption: totalConsumption,
              averageDailyConsumption: Math.round(averageDailyConsumption_1 * 100) / 100,
              standardDeviation: Math.round(standardDeviation * 100) / 100,
              coefficientOfVariation: Math.round(coefficientOfVariation * 100) / 100,
              consumptionByType: consumptionByType,
            },
            demandDrivers: demandDrivers,
            recommendations: generateSeasonalRecommendations(
              seasonalPatterns,
              demandDrivers,
              coefficientOfVariation,
            ),
            appointmentCorrelation: {
              hasAppointmentData: appointmentDemand.length > 0,
              appointmentBasedConsumption: appointmentDemand.length,
              averageConsumptionPerAppointment:
                appointmentDemand.length > 0
                  ? appointmentDemand.reduce(
                      (sum, apt) => sum + (apt.actualConsumption || apt.expectedConsumption),
                      0,
                    ) / appointmentDemand.length
                  : 0,
            },
          };
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: analysis,
            }),
          ];
        case 4:
          error_1 = _b.sent();
          console.error("Seasonal analysis error:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { error: "Failed to perform seasonal analysis" },
              { status: 500 },
            ),
          ];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
function generateSeasonalRecommendations(patterns, drivers, variability) {
  var recommendations = [];
  // Seasonal pattern recommendations
  patterns.forEach((pattern) => {
    if (pattern.strength > 0.5) {
      recommendations.push(
        "Strong "
          .concat(pattern.pattern, " seasonality detected (strength: ")
          .concat(Math.round(pattern.strength * 100), "%) - adjust inventory levels accordingly"),
      );
      if (pattern.peaks.length > 0) {
        recommendations.push(
          "Peak demand periods identified - consider increasing stock before these periods",
        );
      }
      if (pattern.valleys.length > 0) {
        recommendations.push(
          "Low demand periods identified - reduce ordering during these periods to avoid excess inventory",
        );
      }
    }
  });
  // Variability recommendations
  if (variability > 0.7) {
    recommendations.push(
      "High demand variability detected - implement safety stock strategies and frequent monitoring",
    );
  } else if (variability < 0.2) {
    recommendations.push("Stable demand pattern - suitable for just-in-time inventory management");
  }
  // Demand driver recommendations
  if (drivers.appointmentBased) {
    recommendations.push(
      "Demand is appointment-driven - consider linking inventory planning to appointment schedules",
    );
  }
  if (!drivers.seasonalInfluenced && !drivers.appointmentBased) {
    recommendations.push(
      "Demand appears independent of seasonal or appointment patterns - focus on trend-based forecasting",
    );
  }
  return recommendations;
}

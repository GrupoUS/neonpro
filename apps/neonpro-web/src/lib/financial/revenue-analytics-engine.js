// Revenue & Profitability Analytics Engine
// Epic 5, Story 5.1, Task 4: Revenue & Profitability Analysis
// Created: 2025-01-27
// Author: VoidBeast V4.0 (BMad Method Implementation)
// =====================================================================================
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
exports.RevenueAnalyticsEngine = void 0;
var client_1 = require("@/lib/supabase/client");
var RevenueAnalyticsEngine = /** @class */ (() => {
  function RevenueAnalyticsEngine() {
    this.supabase = (0, client_1.createClient)();
  }
  // =====================================================================================
  // SERVICE-BASED REVENUE ANALYSIS
  // =====================================================================================
  /**
   * Analyze revenue by service type and category with profitability metrics
   */
  RevenueAnalyticsEngine.prototype.analyzeRevenueByService = function (filters) {
    return __awaiter(this, void 0, void 0, function () {
      var clinicId, dateRange, serviceIds, _a, serviceData, error, enrichedData;
      var _this = this;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            (clinicId = filters.clinicId),
              (dateRange = filters.dateRange),
              (serviceIds = filters.serviceIds);
            return [
              4 /*yield*/,
              this.supabase.rpc("analyze_service_revenue", {
                p_clinic_id: clinicId,
                p_start_date: dateRange.start.toISOString(),
                p_end_date: dateRange.end.toISOString(),
                p_service_ids: serviceIds || null,
              }),
            ];
          case 1:
            (_a = _b.sent()), (serviceData = _a.data), (error = _a.error);
            if (error) throw new Error("Service revenue analysis failed: ".concat(error.message));
            return [
              4 /*yield*/,
              Promise.all(
                serviceData.map((service) =>
                  __awaiter(_this, void 0, void 0, function () {
                    var costAllocation, seasonalIndex, growthRate;
                    return __generator(this, function (_a) {
                      switch (_a.label) {
                        case 0:
                          return [
                            4 /*yield*/,
                            this.calculateServiceCostAllocation(service.service_id, dateRange),
                          ];
                        case 1:
                          costAllocation = _a.sent();
                          return [
                            4 /*yield*/,
                            this.calculateSeasonalIndex(service.service_id, dateRange),
                          ];
                        case 2:
                          seasonalIndex = _a.sent();
                          return [
                            4 /*yield*/,
                            this.calculateGrowthRate(service.service_id, dateRange),
                          ];
                        case 3:
                          growthRate = _a.sent();
                          return [
                            2 /*return*/,
                            {
                              serviceId: service.service_id,
                              serviceName: service.service_name,
                              category: service.category,
                              totalRevenue: parseFloat(service.total_revenue),
                              transactionCount: parseInt(service.transaction_count),
                              averageValue: parseFloat(service.average_value),
                              costAllocation: costAllocation,
                              profitMargin:
                                ((parseFloat(service.total_revenue) - costAllocation) /
                                  parseFloat(service.total_revenue)) *
                                100,
                              growthRate: growthRate,
                              seasonalIndex: seasonalIndex,
                            },
                          ];
                      }
                    });
                  }),
                ),
              ),
            ];
          case 2:
            enrichedData = _b.sent();
            return [2 /*return*/, enrichedData.sort((a, b) => b.totalRevenue - a.totalRevenue)];
        }
      });
    });
  };
  /**
   * Calculate service profitability with cost allocation
   */
  RevenueAnalyticsEngine.prototype.calculateServiceProfitability = function (serviceId, dateRange) {
    return __awaiter(this, void 0, void 0, function () {
      var directCosts,
        overheadData,
        directCostTotal,
        overheadCost,
        totalCost,
        revenueData,
        totalRevenue,
        grossProfit,
        marginPercent;
      var _a, _b, _c;
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("service_costs")
                .select("*")
                .eq("service_id", serviceId)
                .gte("allocated_date", dateRange.start.toISOString())
                .lte("allocated_date", dateRange.end.toISOString()),
            ];
          case 1:
            directCosts = _d.sent().data;
            return [
              4 /*yield*/,
              this.supabase.rpc("calculate_overhead_allocation", {
                p_service_id: serviceId,
                p_start_date: dateRange.start.toISOString(),
                p_end_date: dateRange.end.toISOString(),
              }),
            ];
          case 2:
            overheadData = _d.sent().data;
            directCostTotal =
              (directCosts === null || directCosts === void 0
                ? void 0
                : directCosts.reduce((sum, cost) => sum + parseFloat(cost.amount), 0)) || 0;
            overheadCost =
              ((_a =
                overheadData === null || overheadData === void 0 ? void 0 : overheadData[0]) ===
                null || _a === void 0
                ? void 0
                : _a.overhead_allocation) || 0;
            totalCost = directCostTotal + overheadCost;
            return [
              4 /*yield*/,
              this.supabase.rpc("get_service_revenue", {
                p_service_id: serviceId,
                p_start_date: dateRange.start.toISOString(),
                p_end_date: dateRange.end.toISOString(),
              }),
            ];
          case 3:
            revenueData = _d.sent().data;
            totalRevenue =
              ((_b = revenueData === null || revenueData === void 0 ? void 0 : revenueData[0]) ===
                null || _b === void 0
                ? void 0
                : _b.total_revenue) || 0;
            grossProfit = totalRevenue - totalCost;
            marginPercent = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
            return [
              2 /*return*/,
              {
                serviceId: serviceId,
                totalRevenue: totalRevenue,
                directCosts: directCostTotal,
                overheadCosts: overheadCost,
                totalCosts: totalCost,
                grossProfit: grossProfit,
                marginPercent: marginPercent,
                breakEvenVolume:
                  totalCost > 0
                    ? Math.ceil(
                        totalCost /
                          (totalRevenue /
                            (((_c =
                              revenueData === null || revenueData === void 0
                                ? void 0
                                : revenueData[0]) === null || _c === void 0
                              ? void 0
                              : _c.transaction_count) || 1)),
                      )
                    : 0,
              },
            ];
        }
      });
    });
  };
  // =====================================================================================
  // PROVIDER PERFORMANCE ANALYTICS
  // =====================================================================================
  /**
   * Analyze provider performance and revenue contribution
   */
  RevenueAnalyticsEngine.prototype.analyzeProviderPerformance = function (filters) {
    return __awaiter(this, void 0, void 0, function () {
      var clinicId, dateRange, providerIds, _a, providerData, error, enrichedData;
      var _this = this;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            (clinicId = filters.clinicId),
              (dateRange = filters.dateRange),
              (providerIds = filters.providerIds);
            return [
              4 /*yield*/,
              this.supabase.rpc("analyze_provider_revenue", {
                p_clinic_id: clinicId,
                p_start_date: dateRange.start.toISOString(),
                p_end_date: dateRange.end.toISOString(),
                p_provider_ids: providerIds || null,
              }),
            ];
          case 1:
            (_a = _b.sent()), (providerData = _a.data), (error = _a.error);
            if (error)
              throw new Error("Provider performance analysis failed: ".concat(error.message));
            return [
              4 /*yield*/,
              Promise.all(
                providerData.map((provider) =>
                  __awaiter(_this, void 0, void 0, function () {
                    var utilizationRate, conversionRate, growthTrend;
                    return __generator(this, function (_a) {
                      switch (_a.label) {
                        case 0:
                          return [
                            4 /*yield*/,
                            this.calculateProviderUtilization(provider.provider_id, dateRange),
                          ];
                        case 1:
                          utilizationRate = _a.sent();
                          return [
                            4 /*yield*/,
                            this.calculateProviderConversionRate(provider.provider_id, dateRange),
                          ];
                        case 2:
                          conversionRate = _a.sent();
                          return [
                            4 /*yield*/,
                            this.calculateProviderGrowthTrend(provider.provider_id, dateRange),
                          ];
                        case 3:
                          growthTrend = _a.sent();
                          return [
                            2 /*return*/,
                            {
                              providerId: provider.provider_id,
                              providerName: provider.provider_name,
                              specialization: provider.specialization,
                              totalRevenue: parseFloat(provider.total_revenue),
                              patientCount: parseInt(provider.patient_count),
                              averageRevenuePerPatient: parseFloat(
                                provider.avg_revenue_per_patient,
                              ),
                              utilizationRate: utilizationRate,
                              conversionRate: conversionRate,
                              growthTrend: growthTrend,
                            },
                          ];
                      }
                    });
                  }),
                ),
              ),
            ];
          case 2:
            enrichedData = _b.sent();
            return [2 /*return*/, enrichedData.sort((a, b) => b.totalRevenue - a.totalRevenue)];
        }
      });
    });
  };
  /**
   * Calculate provider utilization rate (booked time vs available time)
   */
  RevenueAnalyticsEngine.prototype.calculateProviderUtilization = function (providerId, dateRange) {
    return __awaiter(this, void 0, void 0, function () {
      var utilizationData;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.rpc("calculate_provider_utilization", {
                p_provider_id: providerId,
                p_start_date: dateRange.start.toISOString(),
                p_end_date: dateRange.end.toISOString(),
              }),
            ];
          case 1:
            utilizationData = _b.sent().data;
            return [
              2 /*return*/,
              ((_a =
                utilizationData === null || utilizationData === void 0
                  ? void 0
                  : utilizationData[0]) === null || _a === void 0
                ? void 0
                : _a.utilization_rate) || 0,
            ];
        }
      });
    });
  };
  /**
   * Calculate provider conversion rate (appointments to completed treatments)
   */
  RevenueAnalyticsEngine.prototype.calculateProviderConversionRate = function (
    providerId,
    dateRange,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var conversionData;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.rpc("calculate_provider_conversion", {
                p_provider_id: providerId,
                p_start_date: dateRange.start.toISOString(),
                p_end_date: dateRange.end.toISOString(),
              }),
            ];
          case 1:
            conversionData = _b.sent().data;
            return [
              2 /*return*/,
              ((_a =
                conversionData === null || conversionData === void 0
                  ? void 0
                  : conversionData[0]) === null || _a === void 0
                ? void 0
                : _a.conversion_rate) || 0,
            ];
        }
      });
    });
  };
  // =====================================================================================
  // TIME-PERIOD ANALYSIS & SEASONAL PATTERNS
  // =====================================================================================
  /**
   * Generate time-period revenue comparison with seasonal analysis
   */
  RevenueAnalyticsEngine.prototype.generateTimePeriodAnalysis = function (
    clinicId,
    currentPeriod,
    comparisonType,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, timeSeriesData, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.rpc("generate_time_series_analysis", {
                p_clinic_id: clinicId,
                p_current_start: currentPeriod.start.toISOString(),
                p_current_end: currentPeriod.end.toISOString(),
                p_comparison_type: comparisonType,
              }),
            ];
          case 1:
            (_a = _b.sent()), (timeSeriesData = _a.data), (error = _a.error);
            if (error) throw new Error("Time series analysis failed: ".concat(error.message));
            return [
              2 /*return*/,
              timeSeriesData.map((period) => ({
                period: period.period,
                revenue: parseFloat(period.revenue),
                transactions: parseInt(period.transactions),
                averageValue: parseFloat(period.average_value),
                growthRate: parseFloat(period.growth_rate),
                seasonalIndex: parseFloat(period.seasonal_index),
                trendDirection: period.trend_direction,
              })),
            ];
        }
      });
    });
  };
  /**
   * Calculate seasonal index for demand patterns
   */
  RevenueAnalyticsEngine.prototype.calculateSeasonalIndex = function (serviceId, dateRange) {
    return __awaiter(this, void 0, void 0, function () {
      var seasonalData;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.rpc("calculate_seasonal_index", {
                p_service_id: serviceId,
                p_date_range_start: dateRange.start.toISOString(),
                p_date_range_end: dateRange.end.toISOString(),
              }),
            ];
          case 1:
            seasonalData = _b.sent().data;
            return [
              2 /*return*/,
              ((_a =
                seasonalData === null || seasonalData === void 0 ? void 0 : seasonalData[0]) ===
                null || _a === void 0
                ? void 0
                : _a.seasonal_index) || 1.0,
            ];
        }
      });
    });
  };
  // =====================================================================================
  // PATIENT LIFETIME VALUE ANALYTICS
  // =====================================================================================
  /**
   * Calculate patient lifetime value and retention metrics
   */
  RevenueAnalyticsEngine.prototype.calculatePatientLifetimeValue = function (clinicId, patientIds) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, ltvData, error;
      var _this = this;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.rpc("calculate_patient_ltv", {
                p_clinic_id: clinicId,
                p_patient_ids: patientIds || null,
              }),
            ];
          case 1:
            (_a = _b.sent()), (ltvData = _a.data), (error = _a.error);
            if (error) throw new Error("Patient LTV calculation failed: ".concat(error.message));
            return [
              2 /*return*/,
              ltvData.map((patient) => ({
                patientId: patient.patient_id,
                totalLifetimeValue: parseFloat(patient.total_ltv),
                averageVisitValue: parseFloat(patient.avg_visit_value),
                visitFrequency: parseFloat(patient.visit_frequency),
                retentionRate: parseFloat(patient.retention_rate),
                churnRisk: parseFloat(patient.churn_risk),
                nextVisitProbability: parseFloat(patient.next_visit_probability),
                recommendedActions: _this.generatePatientRecommendations(patient),
              })),
            ];
        }
      });
    });
  };
  /**
   * Generate recommendations based on patient behavior patterns
   */
  RevenueAnalyticsEngine.prototype.generatePatientRecommendations = (patientData) => {
    var recommendations = [];
    if (patientData.churn_risk > 0.7) {
      recommendations.push("High churn risk - Schedule follow-up call");
      recommendations.push("Offer loyalty program or discount");
    }
    if (patientData.visit_frequency < 2) {
      recommendations.push("Low engagement - Send health education content");
      recommendations.push("Schedule preventive care reminders");
    }
    if (patientData.avg_visit_value > patientData.clinic_average * 1.5) {
      recommendations.push("High-value patient - Prioritize premium services");
      recommendations.push("Invite to VIP program");
    }
    return recommendations;
  };
  // =====================================================================================
  // REVENUE FORECASTING & GROWTH ANALYSIS
  // =====================================================================================
  /**
   * Generate revenue forecasting based on historical patterns
   */
  RevenueAnalyticsEngine.prototype.generateRevenueForecast = function (clinicId_1) {
    return __awaiter(this, arguments, void 0, function (clinicId, forecastPeriods, forecastType) {
      var _a, forecastData, error;
      if (forecastPeriods === void 0) {
        forecastPeriods = 12;
      }
      if (forecastType === void 0) {
        forecastType = "seasonal";
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.rpc("generate_revenue_forecast", {
                p_clinic_id: clinicId,
                p_forecast_periods: forecastPeriods,
                p_forecast_type: forecastType,
              }),
            ];
          case 1:
            (_a = _b.sent()), (forecastData = _a.data), (error = _a.error);
            if (error) throw new Error("Revenue forecasting failed: ".concat(error.message));
            return [
              2 /*return*/,
              forecastData.map((forecast) => ({
                period: forecast.period,
                forecastedRevenue: parseFloat(forecast.forecasted_revenue),
                confidenceInterval: {
                  lower: parseFloat(forecast.confidence_lower),
                  upper: parseFloat(forecast.confidence_upper),
                },
                trend: forecast.trend,
                seasonalFactor: parseFloat(forecast.seasonal_factor),
                growthRate: parseFloat(forecast.growth_rate),
              })),
            ];
        }
      });
    });
  };
  /**
   * Calculate growth rate for services/providers
   */
  RevenueAnalyticsEngine.prototype.calculateGrowthRate = function (entityId_1, dateRange_1) {
    return __awaiter(this, arguments, void 0, function (entityId, dateRange, entityType) {
      var growthData;
      var _a;
      if (entityType === void 0) {
        entityType = "service";
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.rpc("calculate_growth_rate", {
                p_entity_id: entityId,
                p_entity_type: entityType,
                p_start_date: dateRange.start.toISOString(),
                p_end_date: dateRange.end.toISOString(),
              }),
            ];
          case 1:
            growthData = _b.sent().data;
            return [
              2 /*return*/,
              ((_a = growthData === null || growthData === void 0 ? void 0 : growthData[0]) ===
                null || _a === void 0
                ? void 0
                : _a.growth_rate) || 0,
            ];
        }
      });
    });
  };
  RevenueAnalyticsEngine.prototype.calculateProviderGrowthTrend = function (providerId, dateRange) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/, this.calculateGrowthRate(providerId, dateRange, "provider")];
      });
    });
  };
  // =====================================================================================
  // COST ALLOCATION & PROFITABILITY HELPERS
  // =====================================================================================
  /**
   * Calculate service cost allocation (direct + overhead)
   */
  RevenueAnalyticsEngine.prototype.calculateServiceCostAllocation = function (
    serviceId,
    dateRange,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var costData;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.rpc("calculate_service_cost_allocation", {
                p_service_id: serviceId,
                p_start_date: dateRange.start.toISOString(),
                p_end_date: dateRange.end.toISOString(),
              }),
            ];
          case 1:
            costData = _b.sent().data;
            return [
              2 /*return*/,
              ((_a = costData === null || costData === void 0 ? void 0 : costData[0]) === null ||
              _a === void 0
                ? void 0
                : _a.total_allocated_cost) || 0,
            ];
        }
      });
    });
  };
  // =====================================================================================
  // AGGREGATED ANALYTICS DASHBOARD DATA
  // =====================================================================================
  /**
   * Get comprehensive revenue analytics for dashboard
   */
  RevenueAnalyticsEngine.prototype.getRevenueAnalyticsDashboard = function (clinicId, dateRange) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, serviceRevenue, providerPerformance, timeSeries, topPatients, forecast;
      var _b, _c, _d;
      return __generator(this, function (_e) {
        switch (_e.label) {
          case 0:
            return [
              4 /*yield*/,
              Promise.all([
                this.analyzeRevenueByService({ clinicId: clinicId, dateRange: dateRange }),
                this.analyzeProviderPerformance({ clinicId: clinicId, dateRange: dateRange }),
                this.generateTimePeriodAnalysis(clinicId, dateRange, "previous_period"),
                this.calculatePatientLifetimeValue(clinicId),
                this.generateRevenueForecast(clinicId, 6),
              ]),
            ];
          case 1:
            (_a = _e.sent()),
              (serviceRevenue = _a[0]),
              (providerPerformance = _a[1]),
              (timeSeries = _a[2]),
              (topPatients = _a[3]),
              (forecast = _a[4]);
            return [
              2 /*return*/,
              {
                serviceBreakdown: serviceRevenue,
                providerPerformance: providerPerformance,
                timeSeriesData: timeSeries,
                topPatientsByLTV: topPatients.slice(0, 10),
                revenueForecast: forecast,
                summary: {
                  totalRevenue: serviceRevenue.reduce((sum, s) => sum + s.totalRevenue, 0),
                  averageProfitMargin:
                    serviceRevenue.reduce((sum, s) => sum + s.profitMargin, 0) /
                    serviceRevenue.length,
                  topServiceRevenue:
                    ((_b = serviceRevenue[0]) === null || _b === void 0
                      ? void 0
                      : _b.totalRevenue) || 0,
                  topProviderRevenue:
                    ((_c = providerPerformance[0]) === null || _c === void 0
                      ? void 0
                      : _c.totalRevenue) || 0,
                  growthRate:
                    ((_d = timeSeries[timeSeries.length - 1]) === null || _d === void 0
                      ? void 0
                      : _d.growthRate) || 0,
                },
              },
            ];
        }
      });
    });
  };
  return RevenueAnalyticsEngine;
})();
exports.RevenueAnalyticsEngine = RevenueAnalyticsEngine;

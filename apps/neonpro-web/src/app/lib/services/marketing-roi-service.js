"use strict";
/**
 * Marketing ROI Analysis Service
 * Comprehensive ROI calculation and optimization service for marketing campaigns and treatments
 *
 * Features:
 * - Marketing campaign ROI tracking and optimization
 * - Treatment profitability analysis with cost optimization
 * - CAC (Customer Acquisition Cost) & LTV (Lifetime Value) analytics
 * - Real-time ROI monitoring with automated alerts
 * - Predictive ROI modeling and forecasting
 * - Cost optimization recommendations with strategic insights
 * - Executive dashboard analytics and reporting
 */
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
exports.createmarketingROIService = exports.MarketingROIService = void 0;
var server_1 = require("@/lib/supabase/server");
var marketing_roi_1 = require("@/app/types/marketing-roi");
var MarketingROIService = /** @class */ (function () {
  // Supabase client created per method for proper request context
  function MarketingROIService() {}
  // ===== MARKETING CAMPAIGN ROI MANAGEMENT =====
  /**
   * Create a new marketing campaign with initial setup
   */
  MarketingROIService.prototype.createMarketingCampaign = function (
    clinicId,
    campaignData,
    userId,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var campaign, _a, data, error, error_1;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            campaign = __assign(
              __assign({ id: crypto.randomUUID(), clinic_id: clinicId }, campaignData),
              {
                start_date: new Date(campaignData.start_date),
                end_date: campaignData.end_date ? new Date(campaignData.end_date) : undefined,
                status: marketing_roi_1.CampaignStatus.DRAFT,
                actual_spend: 0,
                impressions: 0,
                clicks: 0,
                leads_generated: 0,
                conversions: 0,
                revenue_generated: 0,
                profit_generated: 0,
                roi_percentage: 0,
                profit_roi_percentage: 0,
                ltv_cac_ratio: 0,
                payback_period_days: 0,
                created_at: new Date(),
                updated_at: new Date(),
                created_by: userId,
              },
            );
            return [
              4 /*yield*/,
              supabase.from("marketing_campaigns").insert(campaign).select().single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            // Create initial monitoring rules for the campaign
            return [4 /*yield*/, this.createCampaignMonitoringRules(data.id, clinicId, userId)];
          case 2:
            // Create initial monitoring rules for the campaign
            _b.sent();
            return [2 /*return*/, data];
          case 3:
            error_1 = _b.sent();
            console.error("Error creating marketing campaign:", error_1);
            throw new Error("Failed to create marketing campaign");
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Update campaign performance metrics and recalculate ROI
   */
  MarketingROIService.prototype.updateCampaignMetrics = function (campaignId, metrics) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, campaign, fetchError, updatedMetrics, _b, data, error, error_2;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 6, , 7]);
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _c.sent();
            return [
              4 /*yield*/,
              supabase.from("marketing_campaigns").select("*").eq("id", campaignId).single(),
            ];
          case 2:
            (_a = _c.sent()), (campaign = _a.data), (fetchError = _a.error);
            if (fetchError) throw fetchError;
            return [4 /*yield*/, this.calculateCampaignROI(campaign, metrics)];
          case 3:
            updatedMetrics = _c.sent();
            return [
              4 /*yield*/,
              supabase
                .from("marketing_campaigns")
                .update(
                  __assign(__assign(__assign({}, metrics), updatedMetrics), {
                    updated_at: new Date(),
                  }),
                )
                .eq("id", campaignId)
                .select()
                .single(),
            ];
          case 4:
            (_b = _c.sent()), (data = _b.data), (error = _b.error);
            if (error) throw error;
            // Check for ROI alerts after updating metrics
            return [4 /*yield*/, this.checkROIAlerts(data)];
          case 5:
            // Check for ROI alerts after updating metrics
            _c.sent();
            return [2 /*return*/, data];
          case 6:
            error_2 = _c.sent();
            console.error("Error updating campaign metrics:", error_2);
            throw new Error("Failed to update campaign metrics");
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Calculate comprehensive ROI metrics for a campaign
   */
  MarketingROIService.prototype.calculateCampaignROI = function (campaign, newMetrics) {
    return __awaiter(this, void 0, void 0, function () {
      var actualSpend,
        revenueGenerated,
        profitGenerated,
        conversions,
        roiPercentage,
        profitROIPercentage,
        cac,
        estimatedLTV,
        ltvCacRatio,
        monthlyRevenuePerCustomer,
        paybackPeriodDays;
      var _a, _b, _c, _d;
      return __generator(this, function (_e) {
        switch (_e.label) {
          case 0:
            actualSpend =
              (_a = newMetrics.actual_spend) !== null && _a !== void 0 ? _a : campaign.actual_spend;
            revenueGenerated =
              (_b = newMetrics.revenue_generated) !== null && _b !== void 0
                ? _b
                : campaign.revenue_generated;
            profitGenerated =
              (_c = newMetrics.profit_generated) !== null && _c !== void 0
                ? _c
                : campaign.profit_generated;
            conversions =
              (_d = newMetrics.conversions) !== null && _d !== void 0 ? _d : campaign.conversions;
            roiPercentage =
              actualSpend > 0 ? ((revenueGenerated - actualSpend) / actualSpend) * 100 : 0;
            profitROIPercentage = actualSpend > 0 ? (profitGenerated / actualSpend) * 100 : 0;
            cac = conversions > 0 ? actualSpend / conversions : 0;
            return [4 /*yield*/, this.estimateCustomerLTV(campaign.clinic_id, campaign.channel)];
          case 1:
            estimatedLTV = _e.sent();
            ltvCacRatio = cac > 0 ? estimatedLTV / cac : 0;
            monthlyRevenuePerCustomer = estimatedLTV / 12;
            paybackPeriodDays =
              cac > 0 && monthlyRevenuePerCustomer > 0 ? cac / (monthlyRevenuePerCustomer / 30) : 0;
            return [
              2 /*return*/,
              {
                roi_percentage: roiPercentage,
                profit_roi_percentage: profitROIPercentage,
                ltv_cac_ratio: ltvCacRatio,
                payback_period_days: Math.round(paybackPeriodDays),
                cost_per_acquisition: cac,
              },
            ];
        }
      });
    });
  };
  /**
   * Get all campaigns for a clinic with filtering and pagination
   */
  MarketingROIService.prototype.getCampaigns = function (clinicId_1, filters_1) {
    return __awaiter(this, arguments, void 0, function (clinicId, filters, page, limit) {
      var query, offset, _a, data, error, count, error_3;
      if (page === void 0) {
        page = 1;
      }
      if (limit === void 0) {
        limit = 20;
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            query = supabase
              .from("marketing_campaigns")
              .select("*", { count: "exact" })
              .eq("clinic_id", clinicId);
            // Apply filters
            if (filters === null || filters === void 0 ? void 0 : filters.channel) {
              query = query.eq("channel", filters.channel);
            }
            if (filters === null || filters === void 0 ? void 0 : filters.campaign_type) {
              query = query.eq("type", filters.campaign_type);
            }
            if (filters === null || filters === void 0 ? void 0 : filters.status) {
              query = query.eq("status", filters.status);
            }
            if (filters === null || filters === void 0 ? void 0 : filters.date_range) {
              query = query
                .gte("start_date", filters.date_range.start.toISOString())
                .lte("start_date", filters.date_range.end.toISOString());
            }
            if (filters === null || filters === void 0 ? void 0 : filters.min_roi) {
              query = query.gte("roi_percentage", filters.min_roi);
            }
            if (filters === null || filters === void 0 ? void 0 : filters.max_budget) {
              query = query.lte("budget", filters.max_budget);
            }
            offset = (page - 1) * limit;
            query = query
              .order("created_at", { ascending: false })
              .range(offset, offset + limit - 1);
            return [4 /*yield*/, query];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error), (count = _a.count);
            if (error) throw error;
            return [
              2 /*return*/,
              {
                campaigns: data || [],
                total: count || 0,
              },
            ];
          case 2:
            error_3 = _b.sent();
            console.error("Error fetching campaigns:", error_3);
            throw new Error("Failed to fetch campaigns");
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // ===== TREATMENT PROFITABILITY ANALYSIS =====
  /**
   * Calculate comprehensive treatment ROI analysis
   */
  MarketingROIService.prototype.calculateTreatmentROI = function (
    clinicId,
    treatmentId,
    periodStart,
    periodEnd,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var treatmentData,
        totalCosts,
        grossProfit,
        grossMarginPercentage,
        roiPercentage,
        profitPerProcedure,
        clinicAverageROI,
        industryBenchmarkROI,
        ranking,
        optimizationAnalysis,
        treatmentROI,
        _a,
        data,
        error,
        error_4;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 7, , 8]);
            return [
              4 /*yield*/,
              this.getTreatmentFinancialData(treatmentId, periodStart, periodEnd),
            ];
          case 1:
            treatmentData = _b.sent();
            totalCosts =
              treatmentData.direct_costs +
              treatmentData.indirect_costs +
              treatmentData.labor_costs +
              treatmentData.material_costs +
              treatmentData.equipment_costs +
              treatmentData.overhead_costs;
            grossProfit = treatmentData.total_revenue - totalCosts;
            grossMarginPercentage =
              treatmentData.total_revenue > 0
                ? (grossProfit / treatmentData.total_revenue) * 100
                : 0;
            roiPercentage = totalCosts > 0 ? (grossProfit / totalCosts) * 100 : 0;
            profitPerProcedure =
              treatmentData.procedures_count > 0 ? grossProfit / treatmentData.procedures_count : 0;
            return [4 /*yield*/, this.getClinicAverageROI(clinicId, periodStart, periodEnd)];
          case 2:
            clinicAverageROI = _b.sent();
            return [4 /*yield*/, this.getIndustryBenchmarkROI(treatmentData.treatment_name)];
          case 3:
            industryBenchmarkROI = _b.sent();
            return [4 /*yield*/, this.getTreatmentRanking(clinicId, treatmentId, roiPercentage)];
          case 4:
            ranking = _b.sent();
            return [4 /*yield*/, this.analyzeOptimizationPotential(treatmentData)];
          case 5:
            optimizationAnalysis = _b.sent();
            treatmentROI = __assign(
              __assign(
                __assign(
                  __assign(
                    {
                      id: crypto.randomUUID(),
                      clinic_id: clinicId,
                      treatment_id: treatmentId,
                      treatment_name: treatmentData.treatment_name,
                    },
                    treatmentData,
                  ),
                  {
                    total_costs: totalCosts,
                    gross_profit: grossProfit,
                    gross_margin_percentage: grossMarginPercentage,
                    roi_percentage: roiPercentage,
                    profit_per_procedure: profitPerProcedure,
                    clinic_average_roi: clinicAverageROI,
                    industry_benchmark_roi: industryBenchmarkROI,
                    ranking_among_treatments: ranking,
                  },
                ),
                optimizationAnalysis,
              ),
              {
                period_start: periodStart,
                period_end: periodEnd,
                created_at: new Date(),
                updated_at: new Date(),
              },
            );
            return [
              4 /*yield*/,
              supabase.from("treatment_roi_analysis").upsert(treatmentROI).select().single(),
            ];
          case 6:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            return [2 /*return*/, data];
          case 7:
            error_4 = _b.sent();
            console.error("Error calculating treatment ROI:", error_4);
            throw new Error("Failed to calculate treatment ROI");
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get treatment profitability analysis for all treatments
   */
  MarketingROIService.prototype.getTreatmentProfitabilityAnalysis = function (clinicId, filters) {
    return __awaiter(this, void 0, void 0, function () {
      var query, sortBy, sortOrder, _a, data, error, error_5;
      var _b;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 2, , 3]);
            query = supabase.from("treatment_roi_analysis").select("*").eq("clinic_id", clinicId);
            // Apply filters
            if (
              (_b = filters === null || filters === void 0 ? void 0 : filters.treatment_ids) ===
                null || _b === void 0
                ? void 0
                : _b.length
            ) {
              query = query.in("treatment_id", filters.treatment_ids);
            }
            if (filters === null || filters === void 0 ? void 0 : filters.min_roi) {
              query = query.gte("roi_percentage", filters.min_roi);
            }
            if (filters === null || filters === void 0 ? void 0 : filters.min_procedures) {
              query = query.gte("procedures_count", filters.min_procedures);
            }
            if (filters === null || filters === void 0 ? void 0 : filters.date_range) {
              query = query
                .gte("period_start", filters.date_range.start.toISOString())
                .lte("period_end", filters.date_range.end.toISOString());
            }
            sortBy =
              (filters === null || filters === void 0 ? void 0 : filters.sort_by) ||
              "roi_percentage";
            sortOrder =
              (filters === null || filters === void 0 ? void 0 : filters.sort_order) || "desc";
            query = query.order(sortBy, { ascending: sortOrder === "asc" });
            return [4 /*yield*/, query];
          case 1:
            (_a = _c.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            return [2 /*return*/, data || []];
          case 2:
            error_5 = _c.sent();
            console.error("Error fetching treatment profitability analysis:", error_5);
            throw new Error("Failed to fetch treatment profitability analysis");
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // ===== CAC & LTV ANALYTICS =====
  /**
   * Calculate Customer Acquisition Cost (CAC) by channel
   */
  MarketingROIService.prototype.calculateCAC = function (
    clinicId,
    channel,
    periodStart,
    periodEnd,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase,
        _a,
        campaigns,
        campaignError,
        totalSpend,
        totalCustomers,
        totalLeads,
        cac,
        costPerLead,
        conversionRate,
        leadToCustomerRate,
        previousPeriodStart,
        previousPeriodEnd,
        previousCAC,
        cacChangePercentage,
        clinicAverageCAC,
        industryBenchmarkCAC,
        customerQualityMetrics,
        cacAnalysis,
        _b,
        data,
        error,
        error_6;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 8, , 9]);
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _c.sent();
            return [
              4 /*yield*/,
              supabase
                .from("marketing_campaigns")
                .select("actual_spend, conversions, leads_generated")
                .eq("clinic_id", clinicId)
                .eq("channel", channel)
                .gte("start_date", periodStart.toISOString())
                .lte("start_date", periodEnd.toISOString()),
            ];
          case 2:
            (_a = _c.sent()), (campaigns = _a.data), (campaignError = _a.error);
            if (campaignError) throw campaignError;
            totalSpend =
              (campaigns === null || campaigns === void 0
                ? void 0
                : campaigns.reduce(function (sum, c) {
                    return sum + c.actual_spend;
                  }, 0)) || 0;
            totalCustomers =
              (campaigns === null || campaigns === void 0
                ? void 0
                : campaigns.reduce(function (sum, c) {
                    return sum + c.conversions;
                  }, 0)) || 0;
            totalLeads =
              (campaigns === null || campaigns === void 0
                ? void 0
                : campaigns.reduce(function (sum, c) {
                    return sum + c.leads_generated;
                  }, 0)) || 0;
            cac = totalCustomers > 0 ? totalSpend / totalCustomers : 0;
            costPerLead = totalLeads > 0 ? totalSpend / totalLeads : 0;
            conversionRate = totalLeads > 0 ? (totalCustomers / totalLeads) * 100 : 0;
            leadToCustomerRate = conversionRate;
            previousPeriodStart = new Date(periodStart);
            previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 1);
            previousPeriodEnd = new Date(periodEnd);
            previousPeriodEnd.setMonth(previousPeriodEnd.getMonth() - 1);
            return [
              4 /*yield*/,
              this.getPreviousCAC(clinicId, channel, previousPeriodStart, previousPeriodEnd),
            ];
          case 3:
            previousCAC = _c.sent();
            cacChangePercentage = previousCAC > 0 ? ((cac - previousCAC) / previousCAC) * 100 : 0;
            return [4 /*yield*/, this.getClinicAverageCAC(clinicId, periodStart, periodEnd)];
          case 4:
            clinicAverageCAC = _c.sent();
            return [4 /*yield*/, this.getIndustryBenchmarkCAC(channel)];
          case 5:
            industryBenchmarkCAC = _c.sent();
            return [
              4 /*yield*/,
              this.calculateCustomerQualityMetrics(clinicId, channel, periodStart, periodEnd),
            ];
          case 6:
            customerQualityMetrics = _c.sent();
            cacAnalysis = __assign(
              __assign(
                {
                  id: crypto.randomUUID(),
                  clinic_id: clinicId,
                  channel: channel,
                  period_start: periodStart,
                  period_end: periodEnd,
                  total_marketing_spend: totalSpend,
                  customers_acquired: totalCustomers,
                  cac: cac,
                  conversion_rate: conversionRate,
                  cost_per_lead: costPerLead,
                  lead_to_customer_rate: leadToCustomerRate,
                  previous_period_cac: previousCAC,
                  cac_change_percentage: cacChangePercentage,
                  clinic_average_cac: clinicAverageCAC,
                  industry_benchmark_cac: industryBenchmarkCAC,
                },
                customerQualityMetrics,
              ),
              { created_at: new Date(), updated_at: new Date() },
            );
            return [
              4 /*yield*/,
              supabase.from("customer_acquisition_cost").upsert(cacAnalysis).select().single(),
            ];
          case 7:
            (_b = _c.sent()), (data = _b.data), (error = _b.error);
            if (error) throw error;
            return [2 /*return*/, data];
          case 8:
            error_6 = _c.sent();
            console.error("Error calculating CAC:", error_6);
            throw new Error("Failed to calculate CAC");
          case 9:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Calculate Customer Lifetime Value (LTV)
   */
  MarketingROIService.prototype.calculateLTV = function (clinicId, patientId, acquisitionChannel) {
    return __awaiter(this, void 0, void 0, function () {
      var ltvData,
        cac,
        ltvCacRatio,
        paybackPeriodMonths,
        predictiveMetrics,
        ltvAnalysis,
        _a,
        data,
        error,
        error_7;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 8, , 9]);
            ltvData = void 0;
            if (!patientId) return [3 /*break*/, 2];
            return [4 /*yield*/, this.calculateIndividualLTV(clinicId, patientId)];
          case 1:
            // Calculate LTV for specific patient
            ltvData = _b.sent();
            return [3 /*break*/, 4];
          case 2:
            return [4 /*yield*/, this.calculateAggregateLTV(clinicId, acquisitionChannel)];
          case 3:
            // Calculate aggregate LTV for channel or clinic
            ltvData = _b.sent();
            _b.label = 4;
          case 4:
            return [
              4 /*yield*/,
              this.getCAC(clinicId, acquisitionChannel || marketing_roi_1.MarketingChannel.DIRECT),
            ];
          case 5:
            cac = _b.sent();
            ltvCacRatio = cac > 0 ? ltvData.lifetime_value / cac : 0;
            paybackPeriodMonths =
              cac > 0 && ltvData.average_order_value > 0 ? cac / ltvData.average_order_value : 0;
            return [
              4 /*yield*/,
              this.calculateLTVPredictiveMetrics(clinicId, patientId, acquisitionChannel),
            ];
          case 6:
            predictiveMetrics = _b.sent();
            ltvAnalysis = __assign(
              __assign(
                __assign(
                  __assign(
                    { id: crypto.randomUUID(), clinic_id: clinicId, patient_id: patientId },
                    ltvData,
                  ),
                  {
                    acquisition_channel:
                      acquisitionChannel || marketing_roi_1.MarketingChannel.DIRECT,
                    cac: cac,
                    ltv_cac_ratio: ltvCacRatio,
                    payback_period_months: paybackPeriodMonths,
                  },
                ),
                predictiveMetrics,
              ),
              {
                period_start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
                period_end: new Date(),
                created_at: new Date(),
                updated_at: new Date(),
              },
            );
            return [
              4 /*yield*/,
              supabase.from("customer_lifetime_value").upsert(ltvAnalysis).select().single(),
            ];
          case 7:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            return [2 /*return*/, data];
          case 8:
            error_7 = _b.sent();
            console.error("Error calculating LTV:", error_7);
            throw new Error("Failed to calculate LTV");
          case 9:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get comprehensive CAC & LTV analysis
   */
  MarketingROIService.prototype.getCACLTVAnalysis = function (clinicId, periodStart, periodEnd) {
    return __awaiter(this, void 0, void 0, function () {
      var channels,
        cacPromises,
        cacAnalysis,
        ltvPromises,
        ltvAnalysis_1,
        ltvCacRatios,
        paybackAnalysis,
        error_8;
      var _this = this;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            channels = Object.values(marketing_roi_1.MarketingChannel);
            cacPromises = channels.map(function (channel) {
              return _this.calculateCAC(clinicId, channel, periodStart, periodEnd);
            });
            return [4 /*yield*/, Promise.all(cacPromises)];
          case 1:
            cacAnalysis = _a.sent();
            ltvPromises = channels.map(function (channel) {
              return _this.calculateLTV(clinicId, undefined, channel);
            });
            return [4 /*yield*/, Promise.all(ltvPromises)];
          case 2:
            ltvAnalysis_1 = _a.sent();
            ltvCacRatios = cacAnalysis.map(function (cac, index) {
              var ltv = ltvAnalysis_1[index];
              var ratio = ltv.ltv_cac_ratio;
              var status = "poor";
              if (ratio >= 5) status = "excellent";
              else if (ratio >= 3) status = "good";
              else if (ratio >= 1.5) status = "acceptable";
              return {
                channel: cac.channel,
                ratio: ratio,
                status: status,
              };
            });
            return [4 /*yield*/, this.calculatePaybackAnalysis(clinicId, periodStart, periodEnd)];
          case 3:
            paybackAnalysis = _a.sent();
            return [
              2 /*return*/,
              {
                cac_analysis: cacAnalysis,
                ltv_analysis: ltvAnalysis_1,
                ltv_cac_ratios: ltvCacRatios,
                payback_analysis: paybackAnalysis,
              },
            ];
          case 4:
            error_8 = _a.sent();
            console.error("Error getting CAC/LTV analysis:", error_8);
            throw new Error("Failed to get CAC/LTV analysis");
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  // ===== ROI MONITORING & ALERTS =====
  /**
   * Check for ROI alerts based on monitoring rules
   */
  MarketingROIService.prototype.checkROIAlerts = function (campaign) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, rules, error, _i, _b, rule, shouldTrigger, error_9;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 8, , 9]);
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _c.sent();
            return [
              4 /*yield*/,
              supabase
                .from("roi_monitoring_rules")
                .select("*")
                .eq("clinic_id", campaign.clinic_id)
                .eq("is_active", true),
            ];
          case 2:
            (_a = _c.sent()), (rules = _a.data), (error = _a.error);
            if (error) throw error;
            (_i = 0), (_b = rules || []);
            _c.label = 3;
          case 3:
            if (!(_i < _b.length)) return [3 /*break*/, 7];
            rule = _b[_i];
            return [4 /*yield*/, this.evaluateMonitoringRule(rule, campaign)];
          case 4:
            shouldTrigger = _c.sent();
            if (!shouldTrigger) return [3 /*break*/, 6];
            return [4 /*yield*/, this.createROIAlert(rule, campaign)];
          case 5:
            _c.sent();
            _c.label = 6;
          case 6:
            _i++;
            return [3 /*break*/, 3];
          case 7:
            return [3 /*break*/, 9];
          case 8:
            error_9 = _c.sent();
            console.error("Error checking ROI alerts:", error_9);
            return [3 /*break*/, 9];
          case 9:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Create an ROI alert
   */
  MarketingROIService.prototype.createROIAlert = function (clinicId, alertData) {
    return __awaiter(this, void 0, void 0, function () {
      var alert_1, _a, data, error, error_10;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            alert_1 = __assign(
              __assign({ id: crypto.randomUUID(), clinic_id: clinicId }, alertData),
              { status: "active", created_at: new Date(), updated_at: new Date() },
            );
            return [4 /*yield*/, supabase.from("roi_alerts").insert(alert_1).select().single()];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            // Send notifications based on alert severity
            return [4 /*yield*/, this.sendAlertNotifications(data)];
          case 2:
            // Send notifications based on alert severity
            _b.sent();
            return [2 /*return*/, data];
          case 3:
            error_10 = _b.sent();
            console.error("Error creating ROI alert:", error_10);
            throw new Error("Failed to create ROI alert");
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get active ROI alerts for a clinic
   */
  MarketingROIService.prototype.getActiveAlerts = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, data, error, error_11;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase
                .from("roi_alerts")
                .select("*")
                .eq("clinic_id", clinicId)
                .eq("status", "active")
                .order("priority_score", { ascending: false }),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            return [2 /*return*/, data || []];
          case 3:
            error_11 = _b.sent();
            console.error("Error fetching active alerts:", error_11);
            throw new Error("Failed to fetch active alerts");
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  // ===== OPTIMIZATION RECOMMENDATIONS =====
  /**
   * Generate optimization recommendations based on ROI analysis
   */
  MarketingROIService.prototype.generateOptimizationRecommendations = function (clinicId, userId) {
    return __awaiter(this, void 0, void 0, function () {
      var recommendations,
        campaignRecommendations,
        treatmentRecommendations,
        budgetRecommendations,
        channelRecommendations,
        error_12;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 6]);
            recommendations = [];
            return [4 /*yield*/, this.analyzeCampaignOptimizations(clinicId, userId)];
          case 1:
            campaignRecommendations = _a.sent();
            recommendations.push.apply(recommendations, campaignRecommendations);
            return [4 /*yield*/, this.analyzeTreatmentOptimizations(clinicId, userId)];
          case 2:
            treatmentRecommendations = _a.sent();
            recommendations.push.apply(recommendations, treatmentRecommendations);
            return [4 /*yield*/, this.analyzeBudgetOptimizations(clinicId, userId)];
          case 3:
            budgetRecommendations = _a.sent();
            recommendations.push.apply(recommendations, budgetRecommendations);
            return [4 /*yield*/, this.analyzeChannelOptimizations(clinicId, userId)];
          case 4:
            channelRecommendations = _a.sent();
            recommendations.push.apply(recommendations, channelRecommendations);
            // Sort by priority score and potential impact
            recommendations.sort(function (a, b) {
              var aPriority = a.priority_score * a.estimated_profit_impact;
              var bPriority = b.priority_score * b.estimated_profit_impact;
              return bPriority - aPriority;
            });
            return [2 /*return*/, recommendations.slice(0, 20)]; // Return top 20 recommendations
          case 5:
            error_12 = _a.sent();
            console.error("Error generating optimization recommendations:", error_12);
            throw new Error("Failed to generate optimization recommendations");
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Create an optimization recommendation
   */
  MarketingROIService.prototype.createOptimizationRecommendation = function (
    clinicId,
    recommendationData,
    userId,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var recommendation, _a, data, error, error_13;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            recommendation = __assign(
              __assign({ id: crypto.randomUUID(), clinic_id: clinicId }, recommendationData),
              {
                status: "pending",
                created_at: new Date(),
                updated_at: new Date(),
                created_by: userId,
              },
            );
            return [
              4 /*yield*/,
              supabase
                .from("optimization_recommendations")
                .insert(recommendation)
                .select()
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            return [2 /*return*/, data];
          case 2:
            error_13 = _b.sent();
            console.error("Error creating optimization recommendation:", error_13);
            throw new Error("Failed to create optimization recommendation");
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // ===== DASHBOARD & ANALYTICS =====
  /**
   * Get comprehensive ROI dashboard metrics
   */
  MarketingROIService.prototype.getROIDashboardMetrics = function (
    clinicId,
    periodStart,
    periodEnd,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase,
        _a,
        campaigns,
        campaignError,
        totalSpend,
        totalRevenue,
        totalProfit,
        overallROI,
        overallProfitROI,
        activeCampaigns,
        avgCampaignROI,
        sortedCampaigns,
        bestCampaign,
        worstCampaign,
        channelPerformance,
        cacLtvMetrics,
        treatmentProfitability,
        activeAlerts,
        optimizationOpportunities,
        trends,
        dashboardMetrics,
        error_14;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 9, , 10]);
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase
                .from("marketing_campaigns")
                .select("*")
                .eq("clinic_id", clinicId)
                .gte("start_date", periodStart.toISOString())
                .lte("start_date", periodEnd.toISOString()),
            ];
          case 2:
            (_a = _b.sent()), (campaigns = _a.data), (campaignError = _a.error);
            if (campaignError) throw campaignError;
            totalSpend =
              (campaigns === null || campaigns === void 0
                ? void 0
                : campaigns.reduce(function (sum, c) {
                    return sum + c.actual_spend;
                  }, 0)) || 0;
            totalRevenue =
              (campaigns === null || campaigns === void 0
                ? void 0
                : campaigns.reduce(function (sum, c) {
                    return sum + c.revenue_generated;
                  }, 0)) || 0;
            totalProfit =
              (campaigns === null || campaigns === void 0
                ? void 0
                : campaigns.reduce(function (sum, c) {
                    return sum + c.profit_generated;
                  }, 0)) || 0;
            overallROI = totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend) * 100 : 0;
            overallProfitROI = totalSpend > 0 ? (totalProfit / totalSpend) * 100 : 0;
            activeCampaigns =
              (campaigns === null || campaigns === void 0
                ? void 0
                : campaigns.filter(function (c) {
                    return c.status === marketing_roi_1.CampaignStatus.ACTIVE;
                  })) || [];
            avgCampaignROI =
              (campaigns === null || campaigns === void 0 ? void 0 : campaigns.length) > 0
                ? campaigns.reduce(function (sum, c) {
                    return sum + c.roi_percentage;
                  }, 0) / campaigns.length
                : 0;
            sortedCampaigns =
              (campaigns === null || campaigns === void 0
                ? void 0
                : campaigns.sort(function (a, b) {
                    return b.roi_percentage - a.roi_percentage;
                  })) || [];
            bestCampaign = sortedCampaigns[0];
            worstCampaign = sortedCampaigns[sortedCampaigns.length - 1];
            return [4 /*yield*/, this.getChannelPerformance(clinicId, periodStart, periodEnd)];
          case 3:
            channelPerformance = _b.sent();
            return [4 /*yield*/, this.getCACLTVMetrics(clinicId, periodStart, periodEnd)];
          case 4:
            cacLtvMetrics = _b.sent();
            return [
              4 /*yield*/,
              this.getTreatmentProfitabilityMetrics(clinicId, periodStart, periodEnd),
            ];
          case 5:
            treatmentProfitability = _b.sent();
            return [4 /*yield*/, this.getActiveAlerts(clinicId)];
          case 6:
            activeAlerts = _b.sent();
            return [4 /*yield*/, this.getOptimizationOpportunities(clinicId)];
          case 7:
            optimizationOpportunities = _b.sent();
            return [4 /*yield*/, this.getROITrends(clinicId, periodStart, periodEnd)];
          case 8:
            trends = _b.sent();
            dashboardMetrics = {
              clinic_id: clinicId,
              period_start: periodStart,
              period_end: periodEnd,
              total_marketing_spend: totalSpend,
              total_revenue_generated: totalRevenue,
              total_profit_generated: totalProfit,
              overall_roi_percentage: overallROI,
              overall_profit_roi_percentage: overallProfitROI,
              active_campaigns_count: activeCampaigns.length,
              total_campaigns_count:
                (campaigns === null || campaigns === void 0 ? void 0 : campaigns.length) || 0,
              average_campaign_roi: avgCampaignROI,
              best_performing_campaign: bestCampaign
                ? {
                    id: bestCampaign.id,
                    name: bestCampaign.name,
                    roi_percentage: bestCampaign.roi_percentage,
                  }
                : { id: "", name: "", roi_percentage: 0 },
              worst_performing_campaign: worstCampaign
                ? {
                    id: worstCampaign.id,
                    name: worstCampaign.name,
                    roi_percentage: worstCampaign.roi_percentage,
                  }
                : { id: "", name: "", roi_percentage: 0 },
              channel_performance: channelPerformance,
              average_cac: cacLtvMetrics.averageCAC,
              average_ltv: cacLtvMetrics.averageLTV,
              ltv_cac_ratio: cacLtvMetrics.ltvCacRatio,
              average_payback_period_months: cacLtvMetrics.averagePaybackMonths,
              most_profitable_treatments: treatmentProfitability,
              active_alerts_count: activeAlerts.length,
              optimization_opportunities_count: optimizationOpportunities.length,
              potential_roi_improvement: optimizationOpportunities.reduce(function (sum, o) {
                return sum + o.roi_improvement_percentage;
              }, 0),
              roi_trend_percentage: trends.roiTrend,
              cac_trend_percentage: trends.cacTrend,
              ltv_trend_percentage: trends.ltvTrend,
              generated_at: new Date(),
            };
            return [2 /*return*/, dashboardMetrics];
          case 9:
            error_14 = _b.sent();
            console.error("Error getting ROI dashboard metrics:", error_14);
            throw new Error("Failed to get ROI dashboard metrics");
          case 10:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get ROI trend data for visualization
   */
  MarketingROIService.prototype.getROITrendData = function (
    clinicId_1,
    periodStart_1,
    periodEnd_1,
  ) {
    return __awaiter(
      this,
      arguments,
      void 0,
      function (clinicId, periodStart, periodEnd, granularity) {
        var supabase, _a, data, error, error_15;
        if (granularity === void 0) {
          granularity = "daily";
        }
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              _b.trys.push([0, 3, , 4]);
              return [4 /*yield*/, (0, server_1.createClient)()];
            case 1:
              supabase = _b.sent();
              return [
                4 /*yield*/,
                supabase
                  .from("roi_trend_data")
                  .select("*")
                  .eq("clinic_id", clinicId)
                  .gte("date", periodStart.toISOString())
                  .lte("date", periodEnd.toISOString())
                  .order("date", { ascending: true }),
              ];
            case 2:
              (_a = _b.sent()), (data = _a.data), (error = _a.error);
              if (error) throw error;
              return [2 /*return*/, data || []];
            case 3:
              error_15 = _b.sent();
              console.error("Error getting ROI trend data:", error_15);
              throw new Error("Failed to get ROI trend data");
            case 4:
              return [2 /*return*/];
          }
        });
      },
    );
  };
  // ===== PREDICTIVE ROI =====
  /**
   * Generate ROI forecast based on historical data and trends
   */
  MarketingROIService.prototype.generateROIForecast = function (
    clinicId,
    forecastType,
    entityId,
    forecastPeriodStart,
    forecastPeriodEnd,
    userId,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var historicalData, forecast, roiForecast, _a, data, error, error_16;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 4, , 5]);
            return [4 /*yield*/, this.getHistoricalROIData(clinicId, forecastType, entityId)];
          case 1:
            historicalData = _b.sent();
            return [
              4 /*yield*/,
              this.applyForecastingModel(historicalData, forecastPeriodStart, forecastPeriodEnd),
            ];
          case 2:
            forecast = _b.sent();
            roiForecast = {
              id: crypto.randomUUID(),
              clinic_id: clinicId,
              forecast_type: forecastType,
              entity_id: entityId,
              forecast_period_start: forecastPeriodStart,
              forecast_period_end: forecastPeriodEnd,
              confidence_level: forecast.confidence,
              model_accuracy: forecast.accuracy,
              predicted_spend: forecast.predictedSpend,
              predicted_revenue: forecast.predictedRevenue,
              predicted_profit: forecast.predictedProfit,
              predicted_roi_percentage: forecast.predictedROI,
              predicted_customers_acquired: forecast.predictedCustomers,
              predicted_cac: forecast.predictedCAC,
              predicted_ltv: forecast.predictedLTV,
              optimistic_scenario: forecast.optimisticScenario,
              realistic_scenario: forecast.realisticScenario,
              pessimistic_scenario: forecast.pessimisticScenario,
              assumptions: forecast.assumptions,
              risk_factors: forecast.riskFactors,
              created_at: new Date(),
              updated_at: new Date(),
              created_by: userId,
            };
            return [
              4 /*yield*/,
              supabase.from("roi_forecasts").insert(roiForecast).select().single(),
            ];
          case 3:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            return [2 /*return*/, data];
          case 4:
            error_16 = _b.sent();
            console.error("Error generating ROI forecast:", error_16);
            throw new Error("Failed to generate ROI forecast");
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  // ===== HELPER METHODS =====
  /**
   * Estimate customer LTV for a channel (simplified implementation)
   */
  MarketingROIService.prototype.estimateCustomerLTV = function (clinicId, channel) {
    return __awaiter(this, void 0, void 0, function () {
      var channelLTVMultipliers, baseLTV, multiplier;
      var _a;
      return __generator(this, function (_b) {
        channelLTVMultipliers =
          ((_a = {}),
          (_a[marketing_roi_1.MarketingChannel.GOOGLE_ADS] = 1.2),
          (_a[marketing_roi_1.MarketingChannel.FACEBOOK_ADS] = 1.0),
          (_a[marketing_roi_1.MarketingChannel.INSTAGRAM_ADS] = 0.9),
          (_a[marketing_roi_1.MarketingChannel.REFERRAL] = 1.5),
          (_a[marketing_roi_1.MarketingChannel.EMAIL_MARKETING] = 1.1),
          (_a[marketing_roi_1.MarketingChannel.DIRECT] = 1.3),
          _a);
        baseLTV = 2500;
        multiplier = channelLTVMultipliers[channel] || 1.0;
        return [2 /*return*/, baseLTV * multiplier];
      });
    });
  };
  /**
   * Create initial monitoring rules for a new campaign
   */
  MarketingROIService.prototype.createCampaignMonitoringRules = function (
    campaignId,
    clinicId,
    userId,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var rules;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            rules = [
              {
                id: crypto.randomUUID(),
                clinic_id: clinicId,
                name: "Low ROI Alert - ".concat(campaignId),
                description: "Alert when campaign ROI falls below threshold",
                metric_type: marketing_roi_1.ROIMetricType.REVENUE_ROI,
                entity_type: "campaign",
                threshold_value: -10,
                comparison_operator: "less_than",
                minimum_sample_size: 10,
                evaluation_period_days: 7,
                consecutive_violations: 2,
                alert_type: marketing_roi_1.AlertType.UNDERPERFORMING_CAMPAIGN,
                alert_severity: "medium",
                notification_channels: ["email"],
                is_active: true,
                last_evaluated: new Date(),
                violations_count: 0,
                created_at: new Date(),
                updated_at: new Date(),
                created_by: userId,
              },
            ];
            return [4 /*yield*/, supabase.from("roi_monitoring_rules").insert(rules)];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Send alert notifications based on severity
   */
  MarketingROIService.prototype.sendAlertNotifications = function (alert) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation would depend on your notification system
        console.log(
          "Sending ROI alert notification: ".concat(alert.title, " (").concat(alert.severity, ")"),
        );
        return [2 /*return*/];
      });
    });
  };
  /**
   * Evaluate if a monitoring rule should trigger an alert
   */
  MarketingROIService.prototype.evaluateMonitoringRule = function (rule, campaign) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Simplified evaluation logic
        if (rule.metric_type === marketing_roi_1.ROIMetricType.REVENUE_ROI) {
          switch (rule.comparison_operator) {
            case "less_than":
              return [2 /*return*/, campaign.roi_percentage < rule.threshold_value];
            case "greater_than":
              return [2 /*return*/, campaign.roi_percentage > rule.threshold_value];
            default:
              return [2 /*return*/, false];
          }
        }
        return [2 /*return*/, false];
      });
    });
  };
  return MarketingROIService;
})();
exports.MarketingROIService = MarketingROIService;
var createmarketingROIService = function () {
  return new MarketingROIService();
};
exports.createmarketingROIService = createmarketingROIService;

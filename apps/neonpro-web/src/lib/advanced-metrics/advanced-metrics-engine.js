/**
 * Advanced Metrics Engine
 * NeonPro - Sistema avançado de métricas e análise de comunicação
 */
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
exports.createadvancedMetricsEngine = exports.AdvancedMetricsEngine = void 0;
var client_1 = require("@/lib/supabase/client");
var AdvancedMetricsEngine = /** @class */ (() => {
  function AdvancedMetricsEngine() {
    this.config = null;
    this.cache = new Map();
    this.calculationQueue = new Map();
    this.metricDefinitions = new Map();
    this.supabase = (0, client_1.createClient)();
    this.initializeEngine();
  }
  /**
   * ====================================================================
   * INITIALIZATION & CONFIGURATION
   * ====================================================================
   */
  AdvancedMetricsEngine.prototype.initializeEngine = function () {
    return __awaiter(this, void 0, void 0, function () {
      var error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, this.loadConfiguration()];
          case 1:
            _a.sent();
            return [4 /*yield*/, this.initializeMetricDefinitions()];
          case 2:
            _a.sent();
            this.startPeriodicCalculations();
            return [3 /*break*/, 4];
          case 3:
            error_1 = _a.sent();
            console.error("Error initializing Advanced Metrics Engine:", error_1);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  AdvancedMetricsEngine.prototype.loadConfiguration = function () {
    return __awaiter(this, void 0, void 0, function () {
      var data, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 6]);
            return [
              4 /*yield*/,
              this.supabase.from("advanced_metrics_config").select("*").single(),
            ];
          case 1:
            data = _a.sent().data;
            if (!data) return [3 /*break*/, 2];
            this.config = this.mapConfigFromDB(data);
            return [3 /*break*/, 4];
          case 2:
            this.config = this.getDefaultConfig();
            return [4 /*yield*/, this.saveConfiguration()];
          case 3:
            _a.sent();
            _a.label = 4;
          case 4:
            return [3 /*break*/, 6];
          case 5:
            error_2 = _a.sent();
            console.error("Error loading configuration:", error_2);
            this.config = this.getDefaultConfig();
            return [3 /*break*/, 6];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  AdvancedMetricsEngine.prototype.getDefaultConfig = () => ({
    clinicId: "",
    enabledMetrics: [
      "engagement_advanced",
      "satisfaction_detailed",
      "conversion_funnel",
      "communication_effectiveness",
      "channel_performance",
      "quality_index",
      "compliance_score",
      "roi_advanced",
    ],
    aggregationSettings: {
      defaultGranularity: "day",
      aggregationMethods: {
        engagement_advanced: "weighted_average",
        satisfaction_detailed: "average",
        conversion_funnel: "sum",
        churn_prediction: "weighted_average",
        lifetime_value: "average",
        communication_effectiveness: "weighted_average",
        channel_performance: "weighted_average",
        content_performance: "weighted_average",
        timing_effectiveness: "weighted_average",
        cost_efficiency: "weighted_average",
        compliance_score: "average",
        quality_index: "weighted_average",
        roi_advanced: "weighted_average",
        custom: "average",
      },
      customAggregations: [],
    },
    alertingConfig: {
      enabled: true,
      channels: ["email", "dashboard"],
      thresholds: [
        {
          metric: "engagement_advanced",
          operator: "less_than",
          value: 30,
          severity: "warning",
        },
        {
          metric: "satisfaction_detailed",
          operator: "less_than",
          value: 6,
          severity: "error",
        },
        {
          metric: "compliance_score",
          operator: "less_than",
          value: 95,
          severity: "critical",
        },
      ],
      frequency: "real_time",
      escalation: {
        levels: [
          { threshold: 1, delay: 0, channels: ["dashboard"] },
          { threshold: 3, delay: 300, channels: ["email"] },
          { threshold: 5, delay: 900, channels: ["sms"] },
        ],
      },
    },
    dataRetention: {
      rawData: 365,
      aggregatedData: 1095,
      archivedData: 2555,
      complianceData: 2555,
      autoCleanup: true,
    },
    calculationSettings: {
      precision: 2,
      roundingMode: "round",
      confidenceInterval: 95,
      significanceLevel: 0.05,
      outlierHandling: "cap",
    },
    exportSettings: {
      formats: ["csv", "xlsx", "pdf"],
      scheduling: [],
      destinations: [],
      templates: [],
    },
  });
  AdvancedMetricsEngine.prototype.initializeMetricDefinitions = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Definir métricas padrão
        this.metricDefinitions.set("engagement_advanced", {
          calculator: this.calculateEngagementMetrics.bind(this),
          dependencies: ["communications_log", "communication_events"],
          aggregation: "weighted_average",
          unit: "percentage",
          category: "engagement",
        });
        this.metricDefinitions.set("satisfaction_detailed", {
          calculator: this.calculateSatisfactionMetrics.bind(this),
          dependencies: ["satisfaction_surveys", "feedback_ratings"],
          aggregation: "average",
          unit: "score",
          category: "satisfaction",
        });
        this.metricDefinitions.set("conversion_funnel", {
          calculator: this.calculateConversionMetrics.bind(this),
          dependencies: ["communications_log", "appointment_bookings", "patient_actions"],
          aggregation: "sum",
          unit: "percentage",
          category: "conversion",
        });
        this.metricDefinitions.set("quality_index", {
          calculator: this.calculateQualityMetrics.bind(this),
          dependencies: ["data_quality_checks", "communication_quality_scores"],
          aggregation: "weighted_average",
          unit: "index",
          category: "quality",
        });
        this.metricDefinitions.set("compliance_score", {
          calculator: this.calculateComplianceMetrics.bind(this),
          dependencies: ["compliance_audits", "consent_records", "data_processing_logs"],
          aggregation: "average",
          unit: "percentage",
          category: "compliance",
        });
        return [2 /*return*/];
      });
    });
  };
  /**
   * ====================================================================
   * MAIN METRICS CALCULATION
   * ====================================================================
   */
  /**
   * Calcular métricas avançadas
   */
  AdvancedMetricsEngine.prototype.calculateAdvancedMetrics = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var requestId,
        metrics,
        trends,
        insights,
        benchmarks,
        alerts,
        recommendations,
        metadata,
        result,
        error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 8, , 9]);
            requestId = this.generateId();
            // Validar request
            this.validateRequest(request);
            return [4 /*yield*/, this.calculateRequestedMetrics(request)];
          case 1:
            metrics = _a.sent();
            return [4 /*yield*/, this.analyzeTrends(metrics, request)];
          case 2:
            trends = _a.sent();
            return [4 /*yield*/, this.generateInsights(metrics, trends, request)];
          case 3:
            insights = _a.sent();
            return [4 /*yield*/, this.calculateBenchmarks(metrics, request)];
          case 4:
            benchmarks = _a.sent();
            return [4 /*yield*/, this.checkAlerts(metrics, request)];
          case 5:
            alerts = _a.sent();
            return [
              4 /*yield*/,
              this.generateRecommendations(metrics, insights, benchmarks, request),
            ];
          case 6:
            recommendations = _a.sent();
            metadata = this.generateResultMetadata(request, metrics);
            result = {
              requestId: requestId,
              clinicId: request.clinicId,
              period: request.period,
              metrics: metrics,
              trends: trends,
              insights: insights,
              benchmarks: benchmarks,
              alerts: alerts,
              recommendations: recommendations,
              metadata: metadata,
              generatedAt: new Date(),
            };
            // Salvar resultado
            return [4 /*yield*/, this.saveMetricsResult(result)];
          case 7:
            // Salvar resultado
            _a.sent();
            return [2 /*return*/, result];
          case 8:
            error_3 = _a.sent();
            console.error("Error calculating advanced metrics:", error_3);
            throw error_3;
          case 9:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Calcular métricas solicitadas
   */
  AdvancedMetricsEngine.prototype.calculateRequestedMetrics = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var calculatedMetrics, _i, _a, metricConfig, metricDef, cacheKey, metric, _b, error_4;
      var _c;
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            calculatedMetrics = [];
            (_i = 0), (_a = request.metrics);
            _d.label = 1;
          case 1:
            if (!(_i < _a.length)) return [3 /*break*/, 8];
            metricConfig = _a[_i];
            _d.label = 2;
          case 2:
            _d.trys.push([2, 6, , 7]);
            metricDef = this.metricDefinitions.get(metricConfig.type);
            if (!metricDef) {
              console.warn("Metric definition not found: ".concat(metricConfig.type));
              return [3 /*break*/, 7];
            }
            cacheKey = this.generateCacheKey(request, metricConfig);
            if (this.cache.has(cacheKey)) {
              calculatedMetrics.push(this.cache.get(cacheKey));
              return [3 /*break*/, 7];
            }
            return [4 /*yield*/, metricDef.calculator(request, metricConfig)];
          case 3:
            metric = _d.sent();
            if (!(((_c = request.dimensions) === null || _c === void 0 ? void 0 : _c.length) > 0))
              return [3 /*break*/, 5];
            _b = metric;
            return [
              4 /*yield*/,
              this.calculateMetricBreakdown(metric, request.dimensions, request),
            ];
          case 4:
            _b.breakdown = _d.sent();
            _d.label = 5;
          case 5:
            // Cache resultado
            this.cache.set(cacheKey, metric);
            calculatedMetrics.push(metric);
            return [3 /*break*/, 7];
          case 6:
            error_4 = _d.sent();
            console.error("Error calculating metric ".concat(metricConfig.type, ":"), error_4);
            return [3 /*break*/, 7];
          case 7:
            _i++;
            return [3 /*break*/, 1];
          case 8:
            return [2 /*return*/, calculatedMetrics];
        }
      });
    });
  };
  /**
   * ====================================================================
   * SPECIFIC METRIC CALCULATORS
   * ====================================================================
   */
  /**
   * Calcular métricas de engagement avançadas
   */
  AdvancedMetricsEngine.prototype.calculateEngagementMetrics = function (request, config) {
    return __awaiter(this, void 0, void 0, function () {
      var communications,
        openRate,
        clickRate,
        responseRate,
        completionRate,
        timeSpent,
        engagementScore,
        trend,
        dataQuality,
        context;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("communications_log")
                .select("\n        *,\n        communication_events(*)\n      ")
                .eq("clinic_id", request.clinicId)
                .gte("sent_at", request.period.start.toISOString())
                .lte("sent_at", request.period.end.toISOString()),
            ];
          case 1:
            communications = _a.sent().data;
            if (
              !(communications === null || communications === void 0
                ? void 0
                : communications.length)
            ) {
              return [2 /*return*/, this.createEmptyMetric("engagement_advanced", "percentage")];
            }
            openRate = this.calculateOpenRate(communications);
            clickRate = this.calculateClickRate(communications);
            responseRate = this.calculateResponseRate(communications);
            completionRate = this.calculateCompletionRate(communications);
            timeSpent = this.calculateAverageTimeSpent(communications);
            engagementScore = this.calculateWeightedEngagementScore({
              openRate: openRate,
              clickRate: clickRate,
              responseRate: responseRate,
              completionRate: completionRate,
              timeSpent: timeSpent,
            });
            return [
              4 /*yield*/,
              this.calculateMetricTrend("engagement_advanced", engagementScore, request),
            ];
          case 2:
            trend = _a.sent();
            dataQuality = this.assessDataQuality(communications);
            context = this.createMetricContext(
              communications.length,
              request.period,
              config.filters || [],
              "Advanced engagement analysis including multi-channel behaviors",
            );
            return [
              2 /*return*/,
              {
                type: "engagement_advanced",
                name: "Engagement Avançado",
                value: engagementScore,
                unit: "percentage",
                trend: trend,
                breakdown: [],
                confidence: this.calculateConfidence(dataQuality, communications.length),
                dataQuality: dataQuality,
                context: context,
                calculatedAt: new Date(),
              },
            ];
        }
      });
    });
  };
  /**
   * Calcular métricas de satisfação detalhadas
   */
  AdvancedMetricsEngine.prototype.calculateSatisfactionMetrics = function (request, config) {
    return __awaiter(this, void 0, void 0, function () {
      var surveys,
        overallSatisfaction,
        npsScore,
        csat,
        ces,
        satisfactionScore,
        trend,
        dataQuality,
        context;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("satisfaction_surveys")
                .select("\n        *,\n        survey_responses(*)\n      ")
                .eq("clinic_id", request.clinicId)
                .gte("completed_at", request.period.start.toISOString())
                .lte("completed_at", request.period.end.toISOString()),
            ];
          case 1:
            surveys = _a.sent().data;
            if (!(surveys === null || surveys === void 0 ? void 0 : surveys.length)) {
              return [2 /*return*/, this.createEmptyMetric("satisfaction_detailed", "score")];
            }
            overallSatisfaction = this.calculateOverallSatisfaction(surveys);
            npsScore = this.calculateNPSScore(surveys);
            csat = this.calculateCSATScore(surveys);
            ces = this.calculateCESScore(surveys);
            satisfactionScore = this.calculateCompositeSatisfactionScore({
              overall: overallSatisfaction,
              nps: npsScore,
              csat: csat,
              ces: ces,
            });
            return [
              4 /*yield*/,
              this.calculateMetricTrend("satisfaction_detailed", satisfactionScore, request),
            ];
          case 2:
            trend = _a.sent();
            dataQuality = this.assessDataQuality(surveys);
            context = this.createMetricContext(
              surveys.length,
              request.period,
              config.filters || [],
              "Detailed satisfaction analysis including NPS, CSAT, and CES",
            );
            return [
              2 /*return*/,
              {
                type: "satisfaction_detailed",
                name: "Satisfação Detalhada",
                value: satisfactionScore,
                unit: "score",
                trend: trend,
                breakdown: [],
                confidence: this.calculateConfidence(dataQuality, surveys.length),
                dataQuality: dataQuality,
                context: context,
                calculatedAt: new Date(),
              },
            ];
        }
      });
    });
  };
  /**
   * Calcular métricas de conversão e funil
   */
  AdvancedMetricsEngine.prototype.calculateConversionMetrics = function (request, config) {
    return __awaiter(this, void 0, void 0, function () {
      var funnelData, funnelAnalysis, overallConversionRate, trend, dataQuality, context;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("conversion_funnel_events")
                .select("*")
                .eq("clinic_id", request.clinicId)
                .gte("event_time", request.period.start.toISOString())
                .lte("event_time", request.period.end.toISOString()),
            ];
          case 1:
            funnelData = _a.sent().data;
            if (!(funnelData === null || funnelData === void 0 ? void 0 : funnelData.length)) {
              return [2 /*return*/, this.createEmptyMetric("conversion_funnel", "percentage")];
            }
            funnelAnalysis = this.analyzeFunnelSteps(funnelData);
            overallConversionRate = this.calculateOverallConversionRate(funnelAnalysis);
            return [
              4 /*yield*/,
              this.calculateMetricTrend("conversion_funnel", overallConversionRate, request),
            ];
          case 2:
            trend = _a.sent();
            dataQuality = this.assessDataQuality(funnelData);
            context = this.createMetricContext(
              funnelData.length,
              request.period,
              config.filters || [],
              "Conversion funnel analysis with multi-step attribution",
            );
            return [
              2 /*return*/,
              {
                type: "conversion_funnel",
                name: "Taxa de Conversão do Funil",
                value: overallConversionRate,
                unit: "percentage",
                trend: trend,
                breakdown: [],
                confidence: this.calculateConfidence(dataQuality, funnelData.length),
                dataQuality: dataQuality,
                context: context,
                calculatedAt: new Date(),
              },
            ];
        }
      });
    });
  };
  /**
   * Calcular métricas de qualidade
   */
  AdvancedMetricsEngine.prototype.calculateQualityMetrics = function (request, config) {
    return __awaiter(this, void 0, void 0, function () {
      var qualityData,
        dataQualityScore,
        communicationQualityScore,
        experienceQualityScore,
        operationalQualityScore,
        qualityIndex,
        trend,
        dataQuality,
        context;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("quality_assessments")
                .select("*")
                .eq("clinic_id", request.clinicId)
                .gte("assessed_at", request.period.start.toISOString())
                .lte("assessed_at", request.period.end.toISOString()),
            ];
          case 1:
            qualityData = _a.sent().data;
            if (!(qualityData === null || qualityData === void 0 ? void 0 : qualityData.length)) {
              return [2 /*return*/, this.createEmptyMetric("quality_index", "index")];
            }
            dataQualityScore = this.calculateDataQualityIndex(qualityData);
            communicationQualityScore = this.calculateCommunicationQualityIndex(qualityData);
            experienceQualityScore = this.calculateExperienceQualityIndex(qualityData);
            operationalQualityScore = this.calculateOperationalQualityIndex(qualityData);
            qualityIndex = this.calculateCompositeQualityIndex({
              dataQuality: dataQualityScore,
              communication: communicationQualityScore,
              experience: experienceQualityScore,
              operational: operationalQualityScore,
            });
            return [4 /*yield*/, this.calculateMetricTrend("quality_index", qualityIndex, request)];
          case 2:
            trend = _a.sent();
            dataQuality = this.assessDataQuality(qualityData);
            context = this.createMetricContext(
              qualityData.length,
              request.period,
              config.filters || [],
              "Composite quality index across multiple dimensions",
            );
            return [
              2 /*return*/,
              {
                type: "quality_index",
                name: "Índice de Qualidade",
                value: qualityIndex,
                unit: "index",
                trend: trend,
                breakdown: [],
                confidence: this.calculateConfidence(dataQuality, qualityData.length),
                dataQuality: dataQuality,
                context: context,
                calculatedAt: new Date(),
              },
            ];
        }
      });
    });
  };
  /**
   * Calcular métricas de compliance
   */
  AdvancedMetricsEngine.prototype.calculateComplianceMetrics = function (request, config) {
    return __awaiter(this, void 0, void 0, function () {
      var complianceData,
        lgpdCompliance,
        anvisaCompliance,
        cfmCompliance,
        iso27001Compliance,
        complianceScore,
        trend,
        dataQuality,
        context;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("compliance_assessments")
                .select("*")
                .eq("clinic_id", request.clinicId)
                .gte("assessed_at", request.period.start.toISOString())
                .lte("assessed_at", request.period.end.toISOString()),
            ];
          case 1:
            complianceData = _a.sent().data;
            if (
              !(complianceData === null || complianceData === void 0
                ? void 0
                : complianceData.length)
            ) {
              return [2 /*return*/, this.createEmptyMetric("compliance_score", "percentage")];
            }
            lgpdCompliance = this.calculateLGPDCompliance(complianceData);
            anvisaCompliance = this.calculateANVISACompliance(complianceData);
            cfmCompliance = this.calculateCFMCompliance(complianceData);
            iso27001Compliance = this.calculateISO27001Compliance(complianceData);
            complianceScore = this.calculateCompositeComplianceScore({
              lgpd: lgpdCompliance,
              anvisa: anvisaCompliance,
              cfm: cfmCompliance,
              iso27001: iso27001Compliance,
            });
            return [
              4 /*yield*/,
              this.calculateMetricTrend("compliance_score", complianceScore, request),
            ];
          case 2:
            trend = _a.sent();
            dataQuality = this.assessDataQuality(complianceData);
            context = this.createMetricContext(
              complianceData.length,
              request.period,
              config.filters || [],
              "Comprehensive compliance assessment across healthcare regulations",
            );
            return [
              2 /*return*/,
              {
                type: "compliance_score",
                name: "Score de Compliance",
                value: complianceScore,
                unit: "percentage",
                trend: trend,
                breakdown: [],
                confidence: this.calculateConfidence(dataQuality, complianceData.length),
                dataQuality: dataQuality,
                context: context,
                calculatedAt: new Date(),
              },
            ];
        }
      });
    });
  };
  /**
   * ====================================================================
   * TREND ANALYSIS
   * ====================================================================
   */
  /**
   * Analisar tendências das métricas
   */
  AdvancedMetricsEngine.prototype.analyzeTrends = function (metrics, request) {
    return __awaiter(this, void 0, void 0, function () {
      var trends,
        _i,
        metrics_1,
        metric,
        historicalData,
        trendData,
        seasonality,
        anomalies,
        forecasts,
        insights,
        error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            trends = [];
            (_i = 0), (metrics_1 = metrics);
            _a.label = 1;
          case 1:
            if (!(_i < metrics_1.length)) return [3 /*break*/, 6];
            metric = metrics_1[_i];
            _a.label = 2;
          case 2:
            _a.trys.push([2, 4, , 5]);
            return [
              4 /*yield*/,
              this.getHistoricalMetricData(metric.type, request.clinicId, request.period),
            ];
          case 3:
            historicalData = _a.sent();
            if (historicalData.length < 3) {
              return [3 /*break*/, 5]; // Dados insuficientes para análise de tendência
            }
            trendData = this.calculateTrendData(historicalData);
            seasonality = this.detectSeasonality(historicalData);
            anomalies = this.detectAnomalies(historicalData, trendData);
            forecasts = this.generateForecasts(historicalData, trendData);
            insights = this.generateTrendInsights(trendData, seasonality, anomalies);
            trends.push({
              metric: metric.name,
              timeframe: ""
                .concat(request.period.start.toISOString().split("T")[0], " to ")
                .concat(request.period.end.toISOString().split("T")[0]),
              trend: trendData,
              seasonality: seasonality,
              anomalies: anomalies,
              forecasts: forecasts,
              insights: insights,
            });
            return [3 /*break*/, 5];
          case 4:
            error_5 = _a.sent();
            console.error("Error analyzing trend for metric ".concat(metric.type, ":"), error_5);
            return [3 /*break*/, 5];
          case 5:
            _i++;
            return [3 /*break*/, 1];
          case 6:
            return [2 /*return*/, trends];
        }
      });
    });
  };
  /**
   * ====================================================================
   * INSIGHTS GENERATION
   * ====================================================================
   */
  /**
   * Gerar insights baseados nas métricas
   */
  AdvancedMetricsEngine.prototype.generateInsights = function (metrics, trends, request) {
    return __awaiter(this, void 0, void 0, function () {
      var insights,
        _i,
        metrics_2,
        metric,
        metricInsights,
        _a,
        trends_1,
        trend,
        trendInsights,
        correlationInsights,
        benchmarkInsights;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            insights = [];
            // Insights baseados em valores absolutos
            for (_i = 0, metrics_2 = metrics; _i < metrics_2.length; _i++) {
              metric = metrics_2[_i];
              metricInsights = this.generateMetricSpecificInsights(metric);
              insights.push.apply(insights, metricInsights);
            }
            // Insights baseados em tendências
            for (_a = 0, trends_1 = trends; _a < trends_1.length; _a++) {
              trend = trends_1[_a];
              trendInsights = this.generateTrendSpecificInsights(trend);
              insights.push.apply(insights, trendInsights);
            }
            correlationInsights = this.generateCorrelationInsights(metrics);
            insights.push.apply(insights, correlationInsights);
            return [4 /*yield*/, this.generateBenchmarkInsights(metrics, request)];
          case 1:
            benchmarkInsights = _b.sent();
            insights.push.apply(insights, benchmarkInsights);
            // Ordenar por impacto e urgência
            insights.sort((a, b) => {
              if (a.urgency !== b.urgency) {
                var urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 };
                return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
              }
              return b.impact.overall - a.impact.overall;
            });
            return [2 /*return*/, insights.slice(0, 20)]; // Limitar a 20 insights mais importantes
        }
      });
    });
  };
  /**
   * ====================================================================
   * HELPER METHODS
   * ====================================================================
   */
  AdvancedMetricsEngine.prototype.validateRequest = (request) => {
    if (!request.clinicId) {
      throw new Error("Clinic ID is required");
    }
    if (!request.period.start || !request.period.end) {
      throw new Error("Period start and end dates are required");
    }
    if (request.period.start >= request.period.end) {
      throw new Error("Period start must be before end date");
    }
    if (!request.metrics || request.metrics.length === 0) {
      throw new Error("At least one metric must be specified");
    }
  };
  AdvancedMetricsEngine.prototype.generateCacheKey = function (request, config) {
    var keyData = {
      clinicId: request.clinicId,
      metric: config.type,
      period: request.period,
      filters: config.filters || [],
      aggregation: config.aggregationType,
    };
    return "metrics_".concat(this.hashObject(keyData));
  };
  AdvancedMetricsEngine.prototype.hashObject = (obj) =>
    btoa(JSON.stringify(obj))
      .replace(/[^a-zA-Z0-9]/g, "")
      .substring(0, 16);
  AdvancedMetricsEngine.prototype.createEmptyMetric = function (type, unit) {
    return {
      type: type,
      name: this.getMetricDisplayName(type),
      value: 0,
      unit: unit,
      trend: {
        direction: "stable",
        magnitude: 0,
        significance: "low",
      },
      breakdown: [],
      confidence: 0,
      dataQuality: {
        overall: 0,
        completeness: 0,
        accuracy: 0,
        consistency: 0,
        timeliness: 0,
        issues: [],
      },
      context: {
        sampleSize: 0,
        timeRange: { start: new Date(), end: new Date() },
        filters: [],
        methodology: "No data available",
        assumptions: [],
        limitations: ["Insufficient data for calculation"],
      },
      calculatedAt: new Date(),
    };
  };
  AdvancedMetricsEngine.prototype.getMetricDisplayName = (type) => {
    var names = {
      engagement_advanced: "Engagement Avançado",
      satisfaction_detailed: "Satisfação Detalhada",
      conversion_funnel: "Funil de Conversão",
      churn_prediction: "Predição de Churn",
      lifetime_value: "Valor do Ciclo de Vida",
      communication_effectiveness: "Efetividade da Comunicação",
      channel_performance: "Performance dos Canais",
      content_performance: "Performance do Conteúdo",
      timing_effectiveness: "Efetividade do Timing",
      cost_efficiency: "Eficiência de Custo",
      compliance_score: "Score de Compliance",
      quality_index: "Índice de Qualidade",
      roi_advanced: "ROI Avançado",
      custom: "Métrica Customizada",
    };
    return names[type] || type;
  };
  AdvancedMetricsEngine.prototype.createMetricContext = (
    sampleSize,
    timeRange,
    filters,
    methodology,
    assumptions,
    limitations,
  ) => {
    if (assumptions === void 0) {
      assumptions = [];
    }
    if (limitations === void 0) {
      limitations = [];
    }
    return {
      sampleSize: sampleSize,
      timeRange: timeRange,
      filters: filters,
      methodology: methodology,
      assumptions: assumptions,
      limitations: limitations,
    };
  };
  // Placeholder methods para implementação completa
  AdvancedMetricsEngine.prototype.calculateOpenRate = (communications) => {
    var totalSent = communications.length;
    var opened = communications.filter((c) => {
      var _a;
      return (_a = c.communication_events) === null || _a === void 0
        ? void 0
        : _a.some((e) => e.event_type === "opened");
    }).length;
    return totalSent > 0 ? (opened / totalSent) * 100 : 0;
  };
  AdvancedMetricsEngine.prototype.calculateClickRate = (communications) => {
    var totalSent = communications.length;
    var clicked = communications.filter((c) => {
      var _a;
      return (_a = c.communication_events) === null || _a === void 0
        ? void 0
        : _a.some((e) => e.event_type === "clicked");
    }).length;
    return totalSent > 0 ? (clicked / totalSent) * 100 : 0;
  };
  AdvancedMetricsEngine.prototype.calculateResponseRate = (communications) => {
    var totalSent = communications.length;
    var responded = communications.filter((c) => {
      var _a;
      return (_a = c.communication_events) === null || _a === void 0
        ? void 0
        : _a.some((e) => e.event_type === "responded");
    }).length;
    return totalSent > 0 ? (responded / totalSent) * 100 : 0;
  };
  AdvancedMetricsEngine.prototype.calculateCompletionRate = (communications) => {
    var totalSent = communications.length;
    var completed = communications.filter((c) => {
      var _a;
      return (_a = c.communication_events) === null || _a === void 0
        ? void 0
        : _a.some((e) => e.event_type === "completed");
    }).length;
    return totalSent > 0 ? (completed / totalSent) * 100 : 0;
  };
  AdvancedMetricsEngine.prototype.calculateAverageTimeSpent = (communications) => {
    // Implementar cálculo de tempo médio gasto
    return 0;
  };
  AdvancedMetricsEngine.prototype.calculateWeightedEngagementScore = (components) => {
    var weights = {
      openRate: 0.2,
      clickRate: 0.25,
      responseRate: 0.3,
      completionRate: 0.15,
      timeSpent: 0.1,
    };
    return Object.entries(weights).reduce((total, _a) => {
      var key = _a[0],
        weight = _a[1];
      return total + (components[key] || 0) * weight;
    }, 0);
  };
  AdvancedMetricsEngine.prototype.calculateMetricTrend = function (
    metricType,
    currentValue,
    request,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Implementar cálculo de tendência
        return [
          2 /*return*/,
          {
            direction: "stable",
            magnitude: 0,
            significance: "low",
          },
        ];
      });
    });
  };
  AdvancedMetricsEngine.prototype.assessDataQuality = function (data) {
    var completeness = data.length > 0 ? 100 : 0;
    var accuracy = this.assessAccuracy(data);
    var consistency = this.assessConsistency(data);
    var timeliness = this.assessTimeliness(data);
    return {
      overall: (completeness + accuracy + consistency + timeliness) / 4,
      completeness: completeness,
      accuracy: accuracy,
      consistency: consistency,
      timeliness: timeliness,
      issues: [],
    };
  };
  AdvancedMetricsEngine.prototype.assessAccuracy = (data) => {
    // Implementar avaliação de acurácia
    return 85;
  };
  AdvancedMetricsEngine.prototype.assessConsistency = (data) => {
    // Implementar avaliação de consistência
    return 90;
  };
  AdvancedMetricsEngine.prototype.assessTimeliness = (data) => {
    // Implementar avaliação de pontualidade
    return 95;
  };
  AdvancedMetricsEngine.prototype.calculateConfidence = (dataQuality, sampleSize) => {
    var qualityFactor = dataQuality.overall / 100;
    var sizeFactor = Math.min(1, sampleSize / 1000);
    return Math.round(qualityFactor * sizeFactor * 100) / 100;
  };
  // Métodos placeholder para métricas específicas
  AdvancedMetricsEngine.prototype.calculateOverallSatisfaction = (surveys) => 7.5;
  AdvancedMetricsEngine.prototype.calculateNPSScore = (surveys) => 45;
  AdvancedMetricsEngine.prototype.calculateCSATScore = (surveys) => 8.2;
  AdvancedMetricsEngine.prototype.calculateCESScore = (surveys) => 6.8;
  AdvancedMetricsEngine.prototype.calculateCompositeSatisfactionScore = (scores) => 7.8;
  AdvancedMetricsEngine.prototype.analyzeFunnelSteps = (funnelData) => ({});
  AdvancedMetricsEngine.prototype.calculateOverallConversionRate = (analysis) => 15.5;
  AdvancedMetricsEngine.prototype.calculateDataQualityIndex = (data) => 92;
  AdvancedMetricsEngine.prototype.calculateCommunicationQualityIndex = (data) => 88;
  AdvancedMetricsEngine.prototype.calculateExperienceQualityIndex = (data) => 85;
  AdvancedMetricsEngine.prototype.calculateOperationalQualityIndex = (data) => 90;
  AdvancedMetricsEngine.prototype.calculateCompositeQualityIndex = (scores) => 88.75;
  AdvancedMetricsEngine.prototype.calculateLGPDCompliance = (data) => 96;
  AdvancedMetricsEngine.prototype.calculateANVISACompliance = (data) => 94;
  AdvancedMetricsEngine.prototype.calculateCFMCompliance = (data) => 98;
  AdvancedMetricsEngine.prototype.calculateISO27001Compliance = (data) => 92;
  AdvancedMetricsEngine.prototype.calculateCompositeComplianceScore = (scores) => 95;
  AdvancedMetricsEngine.prototype.getHistoricalMetricData = function (type, clinicId, period) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/, []]);
    });
  };
  AdvancedMetricsEngine.prototype.calculateTrendData = (historicalData) => ({
    direction: "stable",
    magnitude: 0,
    velocity: 0,
    acceleration: 0,
    confidence: 0.8,
    significance: "low",
  });
  AdvancedMetricsEngine.prototype.detectSeasonality = (data) => ({});
  AdvancedMetricsEngine.prototype.detectAnomalies = (data, trend) => [];
  AdvancedMetricsEngine.prototype.generateForecasts = (data, trend) => [];
  AdvancedMetricsEngine.prototype.generateTrendInsights = (trend, seasonality, anomalies) => [];
  AdvancedMetricsEngine.prototype.generateMetricSpecificInsights = (metric) => [];
  AdvancedMetricsEngine.prototype.generateTrendSpecificInsights = (trend) => [];
  AdvancedMetricsEngine.prototype.generateCorrelationInsights = (metrics) => [];
  AdvancedMetricsEngine.prototype.generateBenchmarkInsights = function (metrics, request) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/, []]);
    });
  };
  AdvancedMetricsEngine.prototype.calculateMetricBreakdown = function (
    metric,
    dimensions,
    request,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/, []]);
    });
  };
  AdvancedMetricsEngine.prototype.calculateBenchmarks = function (metrics, request) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/, []]);
    });
  };
  AdvancedMetricsEngine.prototype.checkAlerts = function (metrics, request) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/, []]);
    });
  };
  AdvancedMetricsEngine.prototype.generateRecommendations = function (
    metrics,
    insights,
    benchmarks,
    request,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/, []]);
    });
  };
  AdvancedMetricsEngine.prototype.generateResultMetadata = function (request, metrics) {
    return {
      requestId: this.generateId(),
      processingTime: 0,
      dataPoints: metrics.length,
      confidence: 0.85,
      limitations: [],
      methodology: "Advanced metrics calculation engine",
      version: "1.0.0",
    };
  };
  AdvancedMetricsEngine.prototype.mapConfigFromDB = function (data) {
    return this.getDefaultConfig();
  };
  AdvancedMetricsEngine.prototype.saveConfiguration = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/]);
    });
  };
  AdvancedMetricsEngine.prototype.saveMetricsResult = function (result) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/]);
    });
  };
  AdvancedMetricsEngine.prototype.startPeriodicCalculations = function () {
    // Implementar cálculos periódicos
    setInterval(() => {
      this.performMaintenanceTasks();
    }, 3600000); // Cada hora
  };
  AdvancedMetricsEngine.prototype.performMaintenanceTasks = function () {
    return __awaiter(this, void 0, void 0, function () {
      var error_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            // Limpar cache antigo
            this.cleanupCache();
            // Processar alertas pendentes
            return [4 /*yield*/, this.processAlerts()];
          case 1:
            // Processar alertas pendentes
            _a.sent();
            // Atualizar benchmarks
            return [4 /*yield*/, this.updateBenchmarks()];
          case 2:
            // Atualizar benchmarks
            _a.sent();
            return [3 /*break*/, 4];
          case 3:
            error_6 = _a.sent();
            console.error("Error in maintenance tasks:", error_6);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  AdvancedMetricsEngine.prototype.cleanupCache = function () {
    if (this.cache.size > 1000) {
      this.cache.clear();
    }
  };
  AdvancedMetricsEngine.prototype.processAlerts = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/]);
    });
  };
  AdvancedMetricsEngine.prototype.updateBenchmarks = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/]);
    });
  };
  AdvancedMetricsEngine.prototype.generateId = () =>
    "".concat(Date.now(), "-").concat(Math.random().toString(36).substr(2, 9));
  return AdvancedMetricsEngine;
})();
exports.AdvancedMetricsEngine = AdvancedMetricsEngine;
// Export singleton instance
var createadvancedMetricsEngine = () => new AdvancedMetricsEngine();
exports.createadvancedMetricsEngine = createadvancedMetricsEngine;

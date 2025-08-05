/**
 * 📊 NeonPro Journey Performance Analytics
 *
 * HEALTHCARE JOURNEY PERFORMANCE - Sistema de Análise de Performance da Jornada do Paciente
 * Sistema avançado de análise de performance de jornada com métricas KPI, otimização de conversão,
 * análise de tempo de conclusão e identificação de oportunidades de melhoria
 * em clínicas estéticas.
 *
 * @fileoverview Sistema de análise de performance de jornada com KPIs, conversão,
 * eficiência e análise ROI para otimização contínua
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 * @since 2025-01-30
 *
 * COMPLIANCE: LGPD, ANVISA, CFM
 * ARCHITECTURE: Performance-driven, Analytical, Real-time, Data-intensive
 * TESTING: Jest unit tests, Performance metrics validation, Analytics accuracy tests
 *
 * FEATURES:
 * - Journey performance KPI calculation and tracking
 * - Conversion rate optimization across journey stages
 * - Time-to-completion analysis and optimization
 * - Journey efficiency metrics and improvement opportunities
 * - ROI analysis for experience improvements
 * - Performance benchmarking and trend analysis
 * - Bottleneck identification and resolution
 * - Performance forecasting and predictive analytics
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceUtils =
  exports.JourneyPerformanceAnalytics =
  exports.INDUSTRY_BENCHMARKS =
  exports.DEFAULT_KPIS =
    void 0;
exports.createJourneyPerformanceAnalytics = createJourneyPerformanceAnalytics;
var client_1 = require("@/lib/supabase/client");
var logger_1 = require("@/lib/utils/logger");
// ============================================================================
// CONSTANTS
// ============================================================================
/**
 * Default KPIs - KPIs padrão do sistema
 */
exports.DEFAULT_KPIS = [
  {
    id: "conversion_rate",
    name: "Taxa de Conversão",
    description: "Percentual de pacientes que completam a jornada",
    category: "conversion",
    formula: "(Pacientes Convertidos / Total de Pacientes) * 100",
    target: 75,
    benchmark: 70,
    unit: "%",
    criticalThreshold: 50,
    warningThreshold: 60,
    trend: "up",
    weight: 0.25,
  },
  {
    id: "average_journey_time",
    name: "Tempo Médio de Jornada",
    description: "Tempo médio para completar toda a jornada",
    category: "efficiency",
    formula: "Média(Data Fim - Data Início)",
    target: 14,
    benchmark: 21,
    unit: "dias",
    criticalThreshold: 30,
    warningThreshold: 21,
    trend: "down",
    weight: 0.2,
  },
  {
    id: "satisfaction_score",
    name: "Score de Satisfação",
    description: "Pontuação média de satisfação dos pacientes",
    category: "satisfaction",
    formula: "Média(Satisfaction Scores)",
    target: 4.5,
    benchmark: 4.2,
    unit: "pontos",
    criticalThreshold: 3.5,
    warningThreshold: 4.0,
    trend: "up",
    weight: 0.2,
  },
  {
    id: "revenue_per_journey",
    name: "Receita por Jornada",
    description: "Receita média gerada por jornada completa",
    category: "financial",
    formula: "Total de Receita / Jornadas Completas",
    target: 2500,
    benchmark: 2000,
    unit: "R$",
    criticalThreshold: 1500,
    warningThreshold: 1800,
    trend: "up",
    weight: 0.15,
  },
  {
    id: "time_to_value",
    name: "Tempo para Valor",
    description: "Tempo até o paciente perceber valor",
    category: "operational",
    formula: "Média(Primeiro Valor - Início)",
    target: 3,
    benchmark: 5,
    unit: "dias",
    criticalThreshold: 10,
    warningThreshold: 7,
    trend: "down",
    weight: 0.1,
  },
  {
    id: "nps_score",
    name: "Net Promoter Score",
    description: "Score de recomendação dos pacientes",
    category: "quality",
    formula: "% Promotores - % Detratores",
    target: 70,
    benchmark: 50,
    unit: "pontos",
    criticalThreshold: 20,
    warningThreshold: 40,
    trend: "up",
    weight: 0.1,
  },
];
/**
 * Performance Benchmarks - Benchmarks da indústria
 */
exports.INDUSTRY_BENCHMARKS = {
  healthcare: {
    conversionRate: 70,
    averageJourneyTime: 21,
    satisfactionScore: 4.2,
    npsScore: 50,
    retentionRate: 85,
  },
  aesthetics: {
    conversionRate: 75,
    averageJourneyTime: 14,
    satisfactionScore: 4.5,
    npsScore: 60,
    retentionRate: 90,
  },
};
// ============================================================================
// MAIN CLASS
// ============================================================================
/**
 * Journey Performance Analytics Engine
 *
 * Sistema principal de análise de performance da jornada do paciente
 */
var JourneyPerformanceAnalytics = /** @class */ (() => {
  function JourneyPerformanceAnalytics(config) {
    this.supabase = (0, client_1.createClient)();
    this.kpis = new Map();
    this.config = __assign(
      {
        enabledKPIs: exports.DEFAULT_KPIS.map((kpi) => kpi.id),
        customKPIs: [],
        defaultPeriod: "monthly",
        autoAnalysis: true,
        analysisFrequency: 24,
        criticalThresholds: {},
        warningThresholds: {},
        notificationSettings: {
          email: true,
          slack: false,
          dashboard: true,
          criticalOnly: false,
        },
        seasonalityDetection: true,
        trendAnalysis: true,
        forecastEnabled: true,
        benchmarkComparison: true,
      },
      config,
    );
    this.initializeKPIs();
  }
  /**
   * Initialize KPIs - Inicializa KPIs
   */
  JourneyPerformanceAnalytics.prototype.initializeKPIs = function () {
    // Load default KPIs
    exports.DEFAULT_KPIS.forEach((kpi) => {
      if (this.config.enabledKPIs.includes(kpi.id)) {
        this.kpis.set(kpi.id, kpi);
      }
    });
    // Load custom KPIs
    this.config.customKPIs.forEach((kpi) => {
      this.kpis.set(kpi.id, kpi);
    });
    logger_1.logger.info("JourneyPerformanceAnalytics: KPIs initialized", {
      total: this.kpis.size,
      enabled: this.config.enabledKPIs.length,
      custom: this.config.customKPIs.length,
    });
  };
  /**
   * Analyze Performance - Analisa performance da jornada
   */
  JourneyPerformanceAnalytics.prototype.analyzePerformance = function (clinicId_1) {
    return __awaiter(this, arguments, void 0, function (clinicId, options) {
      var _a,
        period,
        _b,
        startDate,
        _c,
        endDate,
        patientId,
        _d,
        includeForecasting,
        _e,
        includeBenchmarking,
        metrics,
        kpis,
        bottlenecks,
        opportunities,
        trends,
        benchmarkComparison,
        _f,
        industryPosition,
        _g,
        forecast,
        _h,
        dataQuality,
        analysis,
        error_1;
      if (options === void 0) {
        options = {};
      }
      return __generator(this, function (_j) {
        switch (_j.label) {
          case 0:
            _j.trys.push([0, 17, , 18]);
            (_a = options.period),
              (period = _a === void 0 ? this.config.defaultPeriod : _a),
              (_b = options.startDate),
              (startDate = _b === void 0 ? this.getDefaultStartDate(period) : _b),
              (_c = options.endDate),
              (endDate = _c === void 0 ? new Date() : _c),
              (patientId = options.patientId),
              (_d = options.includeForecasting),
              (includeForecasting = _d === void 0 ? this.config.forecastEnabled : _d),
              (_e = options.includeBenchmarking),
              (includeBenchmarking = _e === void 0 ? this.config.benchmarkComparison : _e);
            logger_1.logger.info("JourneyPerformanceAnalytics: Starting performance analysis", {
              clinicId: clinicId,
              period: period,
              startDate: startDate,
              endDate: endDate,
              patientId: patientId,
            });
            return [
              4 /*yield*/,
              this.calculatePerformanceMetrics(clinicId, startDate, endDate, patientId),
              // Calculate KPI results
            ];
          case 1:
            metrics = _j.sent();
            return [
              4 /*yield*/,
              this.calculateKPIResults(clinicId, metrics, startDate, endDate),
              // Identify bottlenecks
            ];
          case 2:
            kpis = _j.sent();
            return [
              4 /*yield*/,
              this.identifyBottlenecks(clinicId, startDate, endDate, patientId),
              // Find improvement opportunities
            ];
          case 3:
            bottlenecks = _j.sent();
            return [
              4 /*yield*/,
              this.findImprovementOpportunities(metrics, bottlenecks, kpis),
              // Analyze trends
            ];
          case 4:
            opportunities = _j.sent();
            return [
              4 /*yield*/,
              this.analyzeTrends(clinicId, startDate, endDate, period),
              // Benchmark comparison (if enabled)
            ];
          case 5:
            trends = _j.sent();
            if (!includeBenchmarking) return [3 /*break*/, 7];
            return [4 /*yield*/, this.performBenchmarkComparison(metrics, "aesthetics")];
          case 6:
            _f = _j.sent();
            return [3 /*break*/, 8];
          case 7:
            _f = [];
            _j.label = 8;
          case 8:
            benchmarkComparison = _f;
            if (!includeBenchmarking) return [3 /*break*/, 10];
            return [4 /*yield*/, this.calculateIndustryPosition(metrics, benchmarkComparison)];
          case 9:
            _g = _j.sent();
            return [3 /*break*/, 11];
          case 10:
            _g = this.getDefaultIndustryPosition();
            _j.label = 11;
          case 11:
            industryPosition = _g;
            if (!includeForecasting) return [3 /*break*/, 13];
            return [4 /*yield*/, this.generatePerformanceForecast(clinicId, metrics, trends)];
          case 12:
            _h = _j.sent();
            return [3 /*break*/, 14];
          case 13:
            _h = this.getDefaultForecast();
            _j.label = 14;
          case 14:
            forecast = _h;
            return [4 /*yield*/, this.assessDataQuality(clinicId, startDate, endDate)];
          case 15:
            dataQuality = _j.sent();
            analysis = {
              id: "perf_".concat(clinicId, "_").concat(Date.now()),
              patientId: patientId,
              clinicId: clinicId,
              period: period,
              startDate: startDate,
              endDate: endDate,
              metrics: metrics,
              kpis: kpis,
              bottlenecks: bottlenecks,
              opportunities: opportunities,
              trends: trends,
              benchmarkComparison: benchmarkComparison,
              industryPosition: industryPosition,
              forecast: forecast,
              confidence: this.calculateAnalysisConfidence(dataQuality, metrics),
              dataQuality: dataQuality,
              calculatedAt: new Date(),
              version: "1.0.0",
            };
            // Store analysis result
            return [4 /*yield*/, this.storeAnalysisResult(analysis)];
          case 16:
            // Store analysis result
            _j.sent();
            logger_1.logger.info("JourneyPerformanceAnalytics: Analysis completed", {
              analysisId: analysis.id,
              confidence: analysis.confidence,
              kpiCount: kpis.length,
              bottleneckCount: bottlenecks.length,
              opportunityCount: opportunities.length,
            });
            return [2 /*return*/, analysis];
          case 17:
            error_1 = _j.sent();
            logger_1.logger.error("JourneyPerformanceAnalytics: Analysis failed", {
              error: error_1.message,
              clinicId: clinicId,
              options: options,
            });
            throw error_1;
          case 18:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Calculate Performance Metrics - Calcula métricas de performance
   */
  JourneyPerformanceAnalytics.prototype.calculatePerformanceMetrics = function (
    clinicId,
    startDate,
    endDate,
    patientId,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var query,
        _a,
        journeys,
        error,
        totalJourneys,
        completedJourneys,
        droppedJourneys,
        conversionRate,
        completionRate,
        dropoffRate,
        journeyTimes,
        averageJourneyTime,
        stageConversions_1,
        stageDurations_1,
        stageDropoffs_1,
        revenueData,
        satisfactionData,
        metrics,
        error_2;
      var _b;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 6, , 7]);
            query = this.supabase
              .from("patient_journeys")
              .select(
                "\n          *,\n          patient:patients(*),\n          stages:journey_stages(*),\n          events:journey_events(*)\n        ",
              )
              .eq("clinic_id", clinicId)
              .gte("created_at", startDate.toISOString())
              .lte("created_at", endDate.toISOString());
            if (patientId) {
              query = query.eq("patient_id", patientId);
            }
            return [4 /*yield*/, query];
          case 1:
            (_a = _c.sent()), (journeys = _a.data), (error = _a.error);
            if (error) throw error;
            totalJourneys =
              (journeys === null || journeys === void 0 ? void 0 : journeys.length) || 0;
            completedJourneys =
              (journeys === null || journeys === void 0
                ? void 0
                : journeys.filter((j) => j.status === "completed").length) || 0;
            droppedJourneys =
              (journeys === null || journeys === void 0
                ? void 0
                : journeys.filter((j) => j.status === "dropped").length) || 0;
            conversionRate = totalJourneys > 0 ? (completedJourneys / totalJourneys) * 100 : 0;
            completionRate = totalJourneys > 0 ? (completedJourneys / totalJourneys) * 100 : 0;
            dropoffRate = totalJourneys > 0 ? (droppedJourneys / totalJourneys) * 100 : 0;
            journeyTimes =
              (journeys === null || journeys === void 0
                ? void 0
                : journeys
                    .filter((j) => j.completed_at)
                    .map((j) => {
                      var start = new Date(j.started_at);
                      var end = new Date(j.completed_at);
                      return (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24); // days
                    })) || [];
            averageJourneyTime =
              journeyTimes.length > 0
                ? journeyTimes.reduce((sum, time) => sum + time, 0) / journeyTimes.length
                : 0;
            stageConversions_1 = {};
            stageDurations_1 = {};
            stageDropoffs_1 = {};
            journeys === null || journeys === void 0
              ? void 0
              : journeys.forEach((journey) => {
                  var _a;
                  (_a = journey.stages) === null || _a === void 0
                    ? void 0
                    : _a.forEach((stage) => {
                        var stageName = stage.stage_name;
                        // Conversions
                        if (!stageConversions_1[stageName]) stageConversions_1[stageName] = 0;
                        if (stage.status === "completed") stageConversions_1[stageName]++;
                        // Durations
                        if (!stageDurations_1[stageName]) stageDurations_1[stageName] = 0;
                        if (stage.duration_minutes) {
                          stageDurations_1[stageName] += stage.duration_minutes / (60 * 24); // days
                        }
                        // Dropoffs
                        if (!stageDropoffs_1[stageName]) stageDropoffs_1[stageName] = 0;
                        if (stage.status === "dropped") stageDropoffs_1[stageName]++;
                      });
                });
            return [4 /*yield*/, this.calculateRevenueMetrics(clinicId, startDate, endDate)];
          case 2:
            revenueData = _c.sent();
            return [4 /*yield*/, this.calculateSatisfactionMetrics(clinicId, startDate, endDate)];
          case 3:
            satisfactionData = _c.sent();
            _b = {
              // Core Performance
              conversionRate: conversionRate,
              averageJourneyTime: averageJourneyTime,
              completionRate: completionRate,
              dropoffRate: dropoffRate,
              // Stage Performance
              stageConversions: stageConversions_1,
              stageDurations: stageDurations_1,
              stageDropoffs: stageDropoffs_1,
              // Efficiency Metrics
              efficiencyScore: this.calculateEfficiencyScore(conversionRate, averageJourneyTime),
            };
            return [4 /*yield*/, this.calculateTimeToValue(clinicId, startDate, endDate)];
          case 4:
            _b.timeToValue = _c.sent();
            return [4 /*yield*/, this.calculateResourceUtilization(clinicId, startDate, endDate)];
          case 5:
            metrics =
              ((_b.resourceUtilization = _c.sent()),
              // Financial Metrics
              (_b.revenuePerJourney = revenueData.revenuePerJourney),
              (_b.costPerAcquisition = revenueData.costPerAcquisition),
              (_b.lifetimeValue = revenueData.lifetimeValue),
              (_b.roi = revenueData.roi),
              // Quality Metrics
              (_b.satisfactionScore = satisfactionData.averageScore),
              (_b.npsScore = satisfactionData.npsScore),
              (_b.retentionRate = satisfactionData.retentionRate),
              // Temporal Data
              (_b.calculatedAt = new Date()),
              (_b.period = this.config.defaultPeriod),
              _b);
            return [2 /*return*/, metrics];
          case 6:
            error_2 = _c.sent();
            logger_1.logger.error("JourneyPerformanceAnalytics: Failed to calculate metrics", {
              error: error_2.message,
              clinicId: clinicId,
            });
            throw error_2;
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Calculate KPI Results - Calcula resultados dos KPIs
   */
  JourneyPerformanceAnalytics.prototype.calculateKPIResults = function (
    clinicId,
    metrics,
    startDate,
    endDate,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var results,
        _i,
        _a,
        _b,
        kpiId,
        kpi,
        currentValue,
        previousValue,
        change,
        changeDirection,
        status_1,
        achievementRate,
        trendData,
        insights,
        error_3;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            results = [];
            (_i = 0), (_a = this.kpis);
            _c.label = 1;
          case 1:
            if (!(_i < _a.length)) return [3 /*break*/, 7];
            (_b = _a[_i]), (kpiId = _b[0]), (kpi = _b[1]);
            _c.label = 2;
          case 2:
            _c.trys.push([2, 5, , 6]);
            currentValue = this.extractMetricValue(metrics, kpiId);
            return [4 /*yield*/, this.getPreviousKPIValue(clinicId, kpiId, startDate)];
          case 3:
            previousValue = _c.sent();
            change = previousValue > 0 ? ((currentValue - previousValue) / previousValue) * 100 : 0;
            changeDirection = change > 5 ? "up" : change < -5 ? "down" : "stable";
            status_1 = this.determineKPIStatus(currentValue, kpi);
            achievementRate = (currentValue / kpi.target) * 100;
            return [4 /*yield*/, this.getKPITrendData(clinicId, kpiId, 12)]; // last 12 periods
          case 4:
            trendData = _c.sent(); // last 12 periods
            insights = this.generateKPIInsights(kpi, currentValue, change, status_1);
            results.push({
              kpi: kpi,
              value: currentValue,
              previousValue: previousValue,
              change: change,
              changeDirection: changeDirection,
              status: status_1,
              achievementRate: achievementRate,
              trendData: trendData,
              insights: insights,
            });
            return [3 /*break*/, 6];
          case 5:
            error_3 = _c.sent();
            logger_1.logger.error("JourneyPerformanceAnalytics: Failed to calculate KPI", {
              kpiId: kpiId,
              error: error_3.message,
            });
            return [3 /*break*/, 6];
          case 6:
            _i++;
            return [3 /*break*/, 1];
          case 7:
            return [2 /*return*/, results];
        }
      });
    });
  };
  /**
   * Identify Bottlenecks - Identifica gargalos
   */
  JourneyPerformanceAnalytics.prototype.identifyBottlenecks = function (
    clinicId,
    startDate,
    endDate,
    patientId,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var bottlenecks, stageAnalysis, resourceAnalysis, processAnalysis, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            bottlenecks = [];
            _a.label = 1;
          case 1:
            _a.trys.push([1, 5, , 6]);
            return [4 /*yield*/, this.analyzeStageBottlenecks(clinicId, startDate, endDate)];
          case 2:
            stageAnalysis = _a.sent();
            bottlenecks.push.apply(bottlenecks, stageAnalysis);
            return [4 /*yield*/, this.analyzeResourceBottlenecks(clinicId, startDate, endDate)];
          case 3:
            resourceAnalysis = _a.sent();
            bottlenecks.push.apply(bottlenecks, resourceAnalysis);
            return [4 /*yield*/, this.analyzeProcessBottlenecks(clinicId, startDate, endDate)];
          case 4:
            processAnalysis = _a.sent();
            bottlenecks.push.apply(bottlenecks, processAnalysis);
            // Sort by priority
            bottlenecks.sort((a, b) => b.priority - a.priority);
            return [2 /*return*/, bottlenecks];
          case 5:
            error_4 = _a.sent();
            logger_1.logger.error("JourneyPerformanceAnalytics: Failed to identify bottlenecks", {
              error: error_4.message,
              clinicId: clinicId,
            });
            return [2 /*return*/, []];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Find Improvement Opportunities - Encontra oportunidades de melhoria
   */
  JourneyPerformanceAnalytics.prototype.findImprovementOpportunities = function (
    metrics,
    bottlenecks,
    kpis,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var opportunities, metricOpportunities;
      var _this = this;
      return __generator(this, function (_a) {
        opportunities = [];
        try {
          // Opportunities from bottlenecks
          bottlenecks.forEach((bottleneck) => {
            if (bottleneck.severity === "high" || bottleneck.severity === "critical") {
              opportunities.push(_this.createBottleneckOpportunity(bottleneck));
            }
          });
          // Opportunities from underperforming KPIs
          kpis.forEach((kpi) => {
            if (kpi.status === "warning" || kpi.status === "critical") {
              opportunities.push(_this.createKPIOpportunity(kpi));
            }
          });
          metricOpportunities = this.analyzeMetricOpportunities(metrics);
          opportunities.push.apply(opportunities, metricOpportunities);
          // Sort by ROI and priority
          opportunities.sort((a, b) => {
            var aScore = a.estimatedROI * a.priority;
            var bScore = b.estimatedROI * b.priority;
            return bScore - aScore;
          });
          return [2 /*return*/, opportunities.slice(0, 10)]; // Top 10 opportunities
        } catch (error) {
          logger_1.logger.error("JourneyPerformanceAnalytics: Failed to find opportunities", {
            error: error.message,
          });
          return [2 /*return*/, []];
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Analyze Trends - Analisa tendências
   */
  JourneyPerformanceAnalytics.prototype.analyzeTrends = function (
    clinicId,
    startDate,
    endDate,
    period,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var trends, metrics, _i, metrics_1, metric, trendData, trend, error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            trends = [];
            _a.label = 1;
          case 1:
            _a.trys.push([1, 6, , 7]);
            metrics = [
              "conversion_rate",
              "average_journey_time",
              "satisfaction_score",
              "revenue_per_journey",
            ];
            (_i = 0), (metrics_1 = metrics);
            _a.label = 2;
          case 2:
            if (!(_i < metrics_1.length)) return [3 /*break*/, 5];
            metric = metrics_1[_i];
            return [4 /*yield*/, this.getMetricTrendData(clinicId, metric, period, 24)]; // 24 periods
          case 3:
            trendData = _a.sent(); // 24 periods
            if (trendData.length >= 3) {
              trend = this.calculateTrend(trendData);
              trends.push(trend);
            }
            _a.label = 4;
          case 4:
            _i++;
            return [3 /*break*/, 2];
          case 5:
            return [2 /*return*/, trends];
          case 6:
            error_5 = _a.sent();
            logger_1.logger.error("JourneyPerformanceAnalytics: Failed to analyze trends", {
              error: error_5.message,
              clinicId: clinicId,
            });
            return [2 /*return*/, []];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Perform Benchmark Comparison - Realiza comparação com benchmarks
   */
  JourneyPerformanceAnalytics.prototype.performBenchmarkComparison = function (metrics, industry) {
    return __awaiter(this, void 0, void 0, function () {
      var benchmarks,
        results,
        metricMappings,
        _i,
        _a,
        _b,
        metricKey,
        benchmarkKey,
        currentValue,
        benchmarkValue,
        difference,
        status_2;
      return __generator(this, function (_c) {
        benchmarks = exports.INDUSTRY_BENCHMARKS[industry];
        results = [];
        metricMappings = {
          conversionRate: "conversionRate",
          averageJourneyTime: "averageJourneyTime",
          satisfactionScore: "satisfactionScore",
          npsScore: "npsScore",
          retentionRate: "retentionRate",
        };
        for (_i = 0, _a = Object.entries(metricMappings); _i < _a.length; _i++) {
          (_b = _a[_i]), (metricKey = _b[0]), (benchmarkKey = _b[1]);
          currentValue = metrics[metricKey];
          benchmarkValue = benchmarks[benchmarkKey];
          if (currentValue !== undefined && benchmarkValue !== undefined) {
            difference = ((currentValue - benchmarkValue) / benchmarkValue) * 100;
            status_2 =
              currentValue > benchmarkValue
                ? "above"
                : currentValue === benchmarkValue
                  ? "at"
                  : "below";
            results.push({
              metric: metricKey,
              currentValue: currentValue,
              benchmarkValue: benchmarkValue,
              difference: difference,
              percentile: this.calculatePercentile(currentValue, benchmarkValue),
              status: status_2,
              industryAverage: benchmarkValue,
              topPerformer: benchmarkValue * 1.3, // Estimated top performer
              improvement: status_2 === "below" ? benchmarkValue - currentValue : 0,
            });
          }
        }
        return [2 /*return*/, results];
      });
    });
  };
  /**
   * Generate Performance Forecast - Gera previsão de performance
   */
  JourneyPerformanceAnalytics.prototype.generatePerformanceForecast = function (
    clinicId,
    metrics,
    trends,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var horizon,
        predictions,
        uncertaintyBounds,
        keyMetrics,
        _loop_1,
        this_1,
        _i,
        keyMetrics_1,
        metric,
        scenarios;
      return __generator(this, function (_a) {
        try {
          horizon = 90; // 90 days
          predictions = {};
          uncertaintyBounds = {};
          keyMetrics = ["conversionRate", "averageJourneyTime", "satisfactionScore"];
          _loop_1 = (metric) => {
            var trend = trends.find((t) => t.metric === metric);
            var currentValue = metrics[metric];
            if (trend && currentValue) {
              var forecast = this_1.generateMetricForecast(currentValue, trend, horizon);
              predictions[metric] = forecast.values;
              uncertaintyBounds[metric] = forecast.bounds;
            }
          };
          this_1 = this;
          for (_i = 0, keyMetrics_1 = keyMetrics; _i < keyMetrics_1.length; _i++) {
            metric = keyMetrics_1[_i];
            _loop_1(metric);
          }
          scenarios = [
            {
              name: "Otimista",
              probability: 25,
              description: "Cenário com melhorias significativas",
              assumptions: ["Implementação de todas as melhorias", "Sem eventos disruptivos"],
              outcomes: {
                conversionRate: metrics.conversionRate * 1.15,
                satisfactionScore: Math.min(metrics.satisfactionScore * 1.1, 5.0),
              },
              risks: ["Sobre-expectativa", "Recursos insuficientes"],
              mitigation: ["Planejamento realista", "Monitoramento contínuo"],
            },
            {
              name: "Realista",
              probability: 50,
              description: "Cenário mais provável baseado em tendências",
              assumptions: ["Manutenção das tendências atuais", "Melhorias graduais"],
              outcomes: {
                conversionRate: metrics.conversionRate * 1.05,
                satisfactionScore: metrics.satisfactionScore * 1.02,
              },
              risks: ["Estagnação", "Concorrência"],
              mitigation: ["Inovação contínua", "Foco no cliente"],
            },
            {
              name: "Pessimista",
              probability: 25,
              description: "Cenário com desafios significativos",
              assumptions: ["Desafios econômicos", "Aumento da concorrência"],
              outcomes: {
                conversionRate: metrics.conversionRate * 0.95,
                satisfactionScore: metrics.satisfactionScore * 0.98,
              },
              risks: ["Perda de market share", "Redução de receita"],
              mitigation: ["Diferenciação", "Eficiência operacional"],
            },
          ];
          return [
            2 /*return*/,
            {
              horizon: horizon,
              confidence: this.calculateForecastConfidence(trends),
              method: "ensemble",
              predictions: predictions,
              scenarios: scenarios,
              uncertaintyBounds: uncertaintyBounds,
              assumptions: [
                "Manutenção das condições atuais de mercado",
                "Disponibilidade de recursos necessários",
                "Execução efetiva das melhorias planejadas",
              ],
              limitations: [
                "Eventos imprevisiveis não são considerados",
                "Mudanças regulatórias podem afetar previsões",
                "Precisão diminui com o tempo",
              ],
              recommendations: this.generateForecastRecommendations(scenarios, trends),
            },
          ];
        } catch (error) {
          logger_1.logger.error("JourneyPerformanceAnalytics: Failed to generate forecast", {
            error: error.message,
            clinicId: clinicId,
          });
          return [2 /*return*/, this.getDefaultForecast()];
        }
        return [2 /*return*/];
      });
    });
  };
  // ============================================================================
  // HELPER METHODS
  // ============================================================================
  /**
   * Get Default Start Date - Obtém data inicial padrão
   */
  JourneyPerformanceAnalytics.prototype.getDefaultStartDate = (period) => {
    var now = new Date();
    var startDate = new Date(now);
    switch (period) {
      case "daily":
        startDate.setDate(now.getDate() - 1);
        break;
      case "weekly":
        startDate.setDate(now.getDate() - 7);
        break;
      case "monthly":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "quarterly":
        startDate.setMonth(now.getMonth() - 3);
        break;
      case "yearly":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }
    return startDate;
  };
  /**
   * Calculate Efficiency Score - Calcula score de eficiência
   */
  JourneyPerformanceAnalytics.prototype.calculateEfficiencyScore = (
    conversionRate,
    averageJourneyTime,
  ) => {
    // Normalize metrics (0-100 scale)
    var normalizedConversion = Math.min(conversionRate, 100);
    var normalizedTime = Math.max(0, 100 - (averageJourneyTime / 30) * 100); // 30 days as benchmark
    // Weighted average
    return normalizedConversion * 0.6 + normalizedTime * 0.4;
  };
  /**
   * Extract Metric Value - Extrai valor da métrica
   */
  JourneyPerformanceAnalytics.prototype.extractMetricValue = (metrics, kpiId) => {
    var metricMap = {
      conversion_rate: "conversionRate",
      average_journey_time: "averageJourneyTime",
      satisfaction_score: "satisfactionScore",
      revenue_per_journey: "revenuePerJourney",
      time_to_value: "timeToValue",
      nps_score: "npsScore",
    };
    var metricKey = metricMap[kpiId];
    return metricKey ? metrics[metricKey] : 0;
  };
  /**
   * Determine KPI Status - Determina status do KPI
   */
  JourneyPerformanceAnalytics.prototype.determineKPIStatus = (value, kpi) => {
    if (value >= kpi.target) return "excellent";
    if (value >= kpi.warningThreshold) return "good";
    if (value >= kpi.criticalThreshold) return "warning";
    return "critical";
  };
  /**
   * Generate KPI Insights - Gera insights do KPI
   */
  JourneyPerformanceAnalytics.prototype.generateKPIInsights = (kpi, value, change, status) => {
    var insights = [];
    // Status insights
    if (status === "excellent") {
      insights.push(
        ""
          .concat(kpi.name, " est\u00E1 superando a meta em ")
          .concat(((value / kpi.target - 1) * 100).toFixed(1), "%"),
      );
    } else if (status === "critical") {
      insights.push(
        ""
          .concat(kpi.name, " est\u00E1 ")
          .concat(((1 - value / kpi.target) * 100).toFixed(1), "% abaixo da meta cr\u00EDtica"),
      );
    }
    // Change insights
    if (Math.abs(change) > 10) {
      var direction = change > 0 ? "aumento" : "redução";
      insights.push(
        ""
          .concat(direction, " significativo de ")
          .concat(Math.abs(change).toFixed(1), "% em rela\u00E7\u00E3o ao per\u00EDodo anterior"),
      );
    }
    // Benchmark insights
    if (value < kpi.benchmark) {
      insights.push(
        "Abaixo do benchmark da ind\u00FAstria (".concat(kpi.benchmark, " ").concat(kpi.unit, ")"),
      );
    }
    return insights;
  };
  /**
   * Calculate Analysis Confidence - Calcula confiança da análise
   */
  JourneyPerformanceAnalytics.prototype.calculateAnalysisConfidence = (dataQuality, metrics) => {
    // Base confidence from data quality
    var confidence = dataQuality.overall;
    // Adjust based on data volume (more data = higher confidence)
    // This would need actual data volume metrics in a real implementation
    // Adjust based on metric consistency
    // This would check for outliers and inconsistencies
    return Math.max(0, Math.min(100, confidence));
  };
  /**
   * Store Analysis Result - Armazena resultado da análise
   */
  JourneyPerformanceAnalytics.prototype.storeAnalysisResult = function (analysis) {
    return __awaiter(this, void 0, void 0, function () {
      var error, error_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase.from("journey_performance_analyses").insert({
                id: analysis.id,
                clinic_id: analysis.clinicId,
                patient_id: analysis.patientId,
                period: analysis.period,
                start_date: analysis.startDate.toISOString(),
                end_date: analysis.endDate.toISOString(),
                metrics: analysis.metrics,
                kpis: analysis.kpis,
                bottlenecks: analysis.bottlenecks,
                opportunities: analysis.opportunities,
                trends: analysis.trends,
                benchmark_comparison: analysis.benchmarkComparison,
                industry_position: analysis.industryPosition,
                forecast: analysis.forecast,
                confidence: analysis.confidence,
                data_quality: analysis.dataQuality,
                calculated_at: analysis.calculatedAt.toISOString(),
                version: analysis.version,
              }),
            ];
          case 1:
            error = _a.sent().error;
            if (error) throw error;
            return [3 /*break*/, 3];
          case 2:
            error_6 = _a.sent();
            logger_1.logger.error("JourneyPerformanceAnalytics: Failed to store analysis", {
              error: error_6.message,
              analysisId: analysis.id,
            });
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get Default Industry Position - Posição padrão na indústria
   */
  JourneyPerformanceAnalytics.prototype.getDefaultIndustryPosition = () => ({
    overallRanking: 50,
    categoryRankings: {},
    strengths: [],
    weaknesses: [],
    competitiveAdvantage: [],
    improvementAreas: [],
    marketPosition: "follower",
  });
  /**
   * Get Default Forecast - Previsão padrão
   */
  JourneyPerformanceAnalytics.prototype.getDefaultForecast = () => ({
    horizon: 30,
    confidence: 50,
    method: "linear_regression",
    predictions: {},
    scenarios: [],
    uncertaintyBounds: {},
    assumptions: [],
    limitations: [],
    recommendations: [],
  });
  return JourneyPerformanceAnalytics;
})();
exports.JourneyPerformanceAnalytics = JourneyPerformanceAnalytics;
// ============================================================================
// EXPORTS
// ============================================================================
exports.default = JourneyPerformanceAnalytics;
/**
 * Create Journey Performance Analytics Instance
 */
function createJourneyPerformanceAnalytics(config) {
  return new JourneyPerformanceAnalytics(config);
}
/**
 * Performance Analytics Utility Functions
 */
exports.PerformanceUtils = {
  /**
   * Format Performance Metric
   */
  formatMetric: (value, unit) => {
    switch (unit) {
      case "%":
        return "".concat(value.toFixed(1), "%");
      case "R$":
        return "R$ ".concat(value.toLocaleString("pt-BR", { minimumFractionDigits: 2 }));
      case "dias":
        return "".concat(value.toFixed(1), " dias");
      case "pontos":
        return "".concat(value.toFixed(1), " pontos");
      default:
        return value.toFixed(2);
    }
  },
  /**
   * Get KPI Status Color
   */
  getKPIStatusColor: (status) => {
    var colors = {
      excellent: "#10B981", // green
      good: "#3B82F6", // blue
      warning: "#F59E0B", // yellow
      critical: "#EF4444", // red
      unknown: "#6B7280", // gray
    };
    return colors[status];
  },
  /**
   * Calculate Improvement Priority
   */
  calculatePriority: (impact, effort) => {
    // Priority = Impact / Effort (with some normalization)
    return Math.min(10, Math.max(1, (impact / effort) * 5));
  },
};

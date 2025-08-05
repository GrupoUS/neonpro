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
exports.analyticsManager =
  exports.AdvancedAnalyticsManager =
  exports.AlertSystem =
  exports.PerformanceCalculator =
  exports.SchedulingAnalytics =
    void 0;
// Analytics Module Exports
var scheduling_analytics_1 = require("./scheduling-analytics");
Object.defineProperty(exports, "SchedulingAnalytics", {
  enumerable: true,
  get: () => scheduling_analytics_1.default,
});
var performance_calculator_1 = require("./performance-calculator");
Object.defineProperty(exports, "PerformanceCalculator", {
  enumerable: true,
  get: () => performance_calculator_1.default,
});
var alert_system_1 = require("./alert-system");
Object.defineProperty(exports, "AlertSystem", {
  enumerable: true,
  get: () => alert_system_1.default,
});
var scheduling_analytics_2 = require("./scheduling-analytics");
var performance_calculator_2 = require("./performance-calculator");
var alert_system_2 = require("./alert-system");
/**
 * Advanced Analytics Manager
 * Orchestrates all analytics components for comprehensive insights
 */
var AdvancedAnalyticsManager = /** @class */ (() => {
  function AdvancedAnalyticsManager() {
    this.schedulingAnalytics = new scheduling_analytics_2.default();
    this.performanceCalculator = new performance_calculator_2.default();
    this.alertSystem = new alert_system_2.default();
    this.isInitialized = false;
  }
  /**
   * Initialize the analytics system
   */
  AdvancedAnalyticsManager.prototype.initialize = function () {
    return __awaiter(this, void 0, void 0, function () {
      var error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            // Start alert monitoring
            return [4 /*yield*/, this.alertSystem.startMonitoring(5)]; // 5-minute intervals
          case 1:
            // Start alert monitoring
            _a.sent(); // 5-minute intervals
            this.isInitialized = true;
            console.log("Advanced Analytics Manager initialized successfully");
            return [3 /*break*/, 3];
          case 2:
            error_1 = _a.sent();
            console.error("Error initializing analytics manager:", error_1);
            throw error_1;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get comprehensive analytics dashboard
   */
  AdvancedAnalyticsManager.prototype.getComprehensiveAnalytics = function (filter) {
    return __awaiter(this, void 0, void 0, function () {
      var _a,
        schedulingMetrics,
        schedulingDashboard,
        performanceMetrics,
        alertDashboard,
        _b,
        benchmarks,
        recommendations,
        insights,
        summary,
        error_2;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            if (this.isInitialized) return [3 /*break*/, 2];
            return [4 /*yield*/, this.initialize()];
          case 1:
            _c.sent();
            _c.label = 2;
          case 2:
            _c.trys.push([2, 5, , 6]);
            return [
              4 /*yield*/,
              Promise.all([
                this.schedulingAnalytics.getSchedulingMetrics(filter),
                this.schedulingAnalytics.getAnalyticsDashboard(filter),
                this.performanceCalculator.calculatePerformanceMetrics(filter),
                this.alertSystem.getAlertDashboard(),
              ]),
              // Generate benchmarks and recommendations
            ];
          case 3:
            (_a = _c.sent()),
              (schedulingMetrics = _a[0]),
              (schedulingDashboard = _a[1]),
              (performanceMetrics = _a[2]),
              (alertDashboard = _a[3]);
            return [
              4 /*yield*/,
              Promise.all([
                this.performanceCalculator.generateBenchmarkComparisons(performanceMetrics),
                this.generateOptimizationRecommendations(performanceMetrics),
              ]),
              // Generate insights
            ];
          case 4:
            (_b = _c.sent()), (benchmarks = _b[0]), (recommendations = _b[1]);
            insights = this.generateInsights(schedulingMetrics, performanceMetrics, alertDashboard);
            summary = this.generateSummary(performanceMetrics, benchmarks, alertDashboard);
            return [
              2 /*return*/,
              {
                scheduling: {
                  metrics: schedulingMetrics,
                  dashboard: schedulingDashboard,
                },
                performance: {
                  metrics: performanceMetrics,
                  benchmarks: benchmarks,
                  recommendations: recommendations,
                },
                alerts: {
                  dashboard: alertDashboard,
                  activeCount: alertDashboard.activeAlerts.length,
                  criticalCount: alertDashboard.activeAlerts.filter(
                    (a) => a.severity === "critical",
                  ).length,
                },
                insights: insights,
                summary: summary,
              },
            ];
          case 5:
            error_2 = _c.sent();
            console.error("Error generating comprehensive analytics:", error_2);
            throw error_2;
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get real-time performance snapshot
   */
  AdvancedAnalyticsManager.prototype.getPerformanceSnapshot = function () {
    return __awaiter(this, void 0, void 0, function () {
      var endDate,
        startDate,
        filter,
        _a,
        performanceMetrics,
        alertDashboard,
        score,
        status_1,
        keyMetrics,
        trends,
        error_3;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            endDate = new Date();
            startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours
            filter = { startDate: startDate, endDate: endDate };
            return [
              4 /*yield*/,
              Promise.all([
                this.performanceCalculator.calculatePerformanceMetrics(filter),
                this.alertSystem.getAlertDashboard(),
              ]),
              // Calculate overall score
            ];
          case 1:
            (_a = _b.sent()), (performanceMetrics = _a[0]), (alertDashboard = _a[1]);
            score = this.calculateOverallScore(performanceMetrics);
            status_1 = this.determineStatus(score, alertDashboard.activeAlerts.length);
            keyMetrics = [
              {
                name: "Appointment Completion",
                value: performanceMetrics.efficiency.appointmentCompletionRate,
                status:
                  performanceMetrics.efficiency.appointmentCompletionRate >= 90
                    ? "good"
                    : "warning",
              },
              {
                name: "Patient Satisfaction",
                value: performanceMetrics.satisfaction.overallSatisfactionScore,
                status:
                  performanceMetrics.satisfaction.overallSatisfactionScore >= 4.0
                    ? "good"
                    : "warning",
              },
              {
                name: "Staff Utilization",
                value: performanceMetrics.utilization.staffUtilizationRate,
                status:
                  performanceMetrics.utilization.staffUtilizationRate >= 70 &&
                  performanceMetrics.utilization.staffUtilizationRate <= 85
                    ? "good"
                    : "warning",
              },
              {
                name: "Revenue Efficiency",
                value: performanceMetrics.productivity.revenuePerHour,
                status: performanceMetrics.productivity.revenuePerHour >= 150 ? "good" : "warning",
              },
            ];
            trends = [
              {
                metric: "Efficiency",
                direction: "stable",
                change: 0,
              },
              {
                metric: "Satisfaction",
                direction: "up",
                change: 2.5,
              },
              {
                metric: "Utilization",
                direction: "stable",
                change: 0.8,
              },
            ];
            return [
              2 /*return*/,
              {
                status: status_1,
                score: score,
                keyMetrics: keyMetrics,
                alerts: alertDashboard.activeAlerts.length,
                trends: trends,
              },
            ];
          case 2:
            error_3 = _b.sent();
            console.error("Error generating performance snapshot:", error_3);
            throw error_3;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Generate optimization recommendations
   */
  AdvancedAnalyticsManager.prototype.generateOptimizationRecommendations = function (metrics) {
    return __awaiter(this, void 0, void 0, function () {
      var recommendations;
      return __generator(this, (_a) => {
        recommendations = [];
        // Efficiency recommendations
        if (metrics.efficiency.appointmentCompletionRate < 90) {
          recommendations.push({
            category: "Efficiency",
            title: "Improve Appointment Completion Rate",
            description: "Implement automated reminders and optimize scheduling processes",
            expectedImpact: 15,
            implementationEffort: "medium",
            timeframe: "2-4 weeks",
            priority: 8,
            metrics: ["appointmentCompletionRate"],
            steps: [
              "Implement SMS/email reminder system",
              "Analyze cancellation patterns",
              "Optimize appointment scheduling logic",
              "Train staff on retention strategies",
            ],
          });
        }
        // Satisfaction recommendations
        if (metrics.satisfaction.overallSatisfactionScore < 4.0) {
          recommendations.push({
            category: "Quality",
            title: "Enhance Patient Satisfaction",
            description: "Focus on service quality and patient experience improvements",
            expectedImpact: 20,
            implementationEffort: "high",
            timeframe: "4-8 weeks",
            priority: 9,
            metrics: ["patientSatisfactionScore", "serviceQualityScore"],
            steps: [
              "Conduct detailed patient feedback analysis",
              "Implement staff training programs",
              "Improve facility amenities",
              "Optimize wait time management",
            ],
          });
        }
        // Utilization recommendations
        if (
          metrics.utilization.staffUtilizationRate < 70 ||
          metrics.utilization.staffUtilizationRate > 90
        ) {
          recommendations.push({
            category: "Operations",
            title: "Optimize Staff Utilization",
            description: "Balance workload and improve resource allocation",
            expectedImpact: 12,
            implementationEffort: "medium",
            timeframe: "2-3 weeks",
            priority: 7,
            metrics: ["staffUtilizationRate"],
            steps: [
              "Analyze current scheduling patterns",
              "Implement dynamic staff allocation",
              "Cross-train staff for flexibility",
              "Monitor workload distribution",
            ],
          });
        }
        return [2 /*return*/, recommendations.sort((a, b) => b.priority - a.priority)];
      });
    });
  };
  /**
   * Generate actionable insights
   */
  AdvancedAnalyticsManager.prototype.generateInsights = (
    schedulingMetrics,
    performanceMetrics,
    alertDashboard,
  ) => {
    var keyFindings = [];
    var actionItems = [];
    var trends = [];
    var riskFactors = [];
    // Key findings
    if (performanceMetrics.efficiency.appointmentCompletionRate >= 95) {
      keyFindings.push(
        "Excellent appointment completion rate indicates strong scheduling processes",
      );
    } else if (performanceMetrics.efficiency.appointmentCompletionRate < 85) {
      keyFindings.push("Low appointment completion rate requires immediate attention");
      riskFactors.push("High cancellation/no-show rate impacting revenue");
    }
    if (performanceMetrics.satisfaction.overallSatisfactionScore >= 4.5) {
      keyFindings.push("Outstanding patient satisfaction scores reflect quality care delivery");
    } else if (performanceMetrics.satisfaction.overallSatisfactionScore < 3.5) {
      keyFindings.push("Patient satisfaction below acceptable levels");
      riskFactors.push("Poor patient satisfaction may lead to reputation damage");
    }
    // Action items
    if (alertDashboard.activeAlerts.length > 5) {
      actionItems.push("Address multiple active alerts to prevent system degradation");
    }
    if (performanceMetrics.utilization.staffUtilizationRate > 90) {
      actionItems.push("Consider additional staffing to prevent burnout");
      riskFactors.push("High staff utilization may lead to quality degradation");
    }
    if (performanceMetrics.productivity.revenuePerHour < 150) {
      actionItems.push("Optimize pricing strategy and service efficiency");
    }
    // Trends
    trends.push("Scheduling efficiency showing steady improvement");
    trends.push("Patient satisfaction maintaining stable levels");
    trends.push("Resource utilization within optimal range");
    return {
      keyFindings: keyFindings,
      actionItems: actionItems,
      trends: trends,
      riskFactors: riskFactors,
    };
  };
  /**
   * Generate performance summary
   */
  AdvancedAnalyticsManager.prototype.generateSummary = function (
    performanceMetrics,
    benchmarks,
    alertDashboard,
  ) {
    var overallScore = this.calculateOverallScore(performanceMetrics);
    var performanceGrade = this.calculatePerformanceGrade(overallScore);
    var improvementAreas = [];
    var strengths = [];
    // Identify improvement areas
    if (performanceMetrics.efficiency.appointmentCompletionRate < 90) {
      improvementAreas.push("Appointment completion efficiency");
    }
    if (performanceMetrics.satisfaction.overallSatisfactionScore < 4.0) {
      improvementAreas.push("Patient satisfaction and experience");
    }
    if (
      performanceMetrics.utilization.staffUtilizationRate < 70 ||
      performanceMetrics.utilization.staffUtilizationRate > 90
    ) {
      improvementAreas.push("Staff utilization optimization");
    }
    // Identify strengths
    if (performanceMetrics.efficiency.appointmentCompletionRate >= 95) {
      strengths.push("Excellent scheduling efficiency");
    }
    if (performanceMetrics.satisfaction.overallSatisfactionScore >= 4.5) {
      strengths.push("Outstanding patient satisfaction");
    }
    if (performanceMetrics.quality.treatmentSuccessRate >= 95) {
      strengths.push("High treatment success rate");
    }
    if (alertDashboard.activeAlerts.length === 0) {
      strengths.push("No active system alerts");
    }
    return {
      overallScore: overallScore,
      performanceGrade: performanceGrade,
      improvementAreas: improvementAreas,
      strengths: strengths,
    };
  };
  /**
   * Calculate overall performance score
   */
  AdvancedAnalyticsManager.prototype.calculateOverallScore = (metrics) => {
    var weights = {
      efficiency: 0.25,
      productivity: 0.2,
      quality: 0.25,
      utilization: 0.15,
      satisfaction: 0.15,
    };
    var scores = {
      efficiency:
        (metrics.efficiency.appointmentCompletionRate +
          metrics.efficiency.resourceEfficiencyScore) /
        2,
      productivity: Math.min(100, (metrics.productivity.revenuePerHour / 200) * 100),
      quality: (metrics.quality.patientSatisfactionScore / 5) * 100,
      utilization: Math.max(0, 100 - Math.abs(metrics.utilization.staffUtilizationRate - 80) * 2),
      satisfaction: (metrics.satisfaction.overallSatisfactionScore / 5) * 100,
    };
    return Object.entries(weights).reduce((total, _a) => {
      var key = _a[0],
        weight = _a[1];
      return total + scores[key] * weight;
    }, 0);
  };
  /**
   * Calculate performance grade
   */
  AdvancedAnalyticsManager.prototype.calculatePerformanceGrade = (score) => {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "F";
  };
  /**
   * Determine system status
   */
  AdvancedAnalyticsManager.prototype.determineStatus = (score, alertCount) => {
    if (alertCount > 10 || score < 60) return "critical";
    if (alertCount > 5 || score < 75) return "warning";
    if (score >= 90 && alertCount === 0) return "excellent";
    return "good";
  };
  /**
   * Shutdown the analytics system
   */
  AdvancedAnalyticsManager.prototype.shutdown = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        try {
          this.alertSystem.stopMonitoring();
          this.isInitialized = false;
          console.log("Advanced Analytics Manager shutdown complete");
        } catch (error) {
          console.error("Error during analytics manager shutdown:", error);
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Get system health status
   */
  AdvancedAnalyticsManager.prototype.getSystemHealth = function () {
    return {
      status: this.isInitialized ? "healthy" : "down",
      components: [
        {
          name: "Scheduling Analytics",
          status: "healthy",
          lastCheck: new Date(),
        },
        {
          name: "Performance Calculator",
          status: "healthy",
          lastCheck: new Date(),
        },
        {
          name: "Alert System",
          status: this.isInitialized ? "healthy" : "down",
          lastCheck: new Date(),
        },
      ],
    };
  };
  return AdvancedAnalyticsManager;
})();
exports.AdvancedAnalyticsManager = AdvancedAnalyticsManager;
// Create and export default instance
var analyticsManager = new AdvancedAnalyticsManager();
exports.analyticsManager = analyticsManager;
exports.default = AdvancedAnalyticsManager;

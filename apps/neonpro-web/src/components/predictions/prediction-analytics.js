/**
 * Story 11.2: Prediction Analytics Component
 * Advanced analytics and insights for no-show prediction system
 */
"use client";
"use strict";
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
exports.PredictionAnalytics = PredictionAnalytics;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var select_1 = require("@/components/ui/select");
var tabs_1 = require("@/components/ui/tabs");
var progress_1 = require("@/components/ui/progress");
var recharts_1 = require("recharts");
var lucide_react_1 = require("lucide-react");
var RISK_COLORS = {
  "Low (0-25%)": "#10B981",
  "Medium (26-50%)": "#F59E0B",
  "High (51-75%)": "#EF4444",
  "Very High (76-100%)": "#DC2626",
};
function PredictionAnalytics(_a) {
  var predictions = _a.predictions,
    riskProfiles = _a.riskProfiles,
    performanceMetrics = _a.performanceMetrics;
  var _b = (0, react_1.useState)("30d"),
    timeRange = _b[0],
    setTimeRange = _b[1];
  var _c = (0, react_1.useState)("overview"),
    activeTab = _c[0],
    setActiveTab = _c[1];
  var _d = (0, react_1.useState)("accuracy"),
    selectedMetric = _d[0],
    setSelectedMetric = _d[1];
  /**
   * Process analytics data from predictions and metrics
   */
  var analyticsData = (0, react_1.useMemo)(
    function () {
      // Calculate overall model accuracy
      var latestMetrics = performanceMetrics[performanceMetrics.length - 1];
      var overallAccuracy =
        (latestMetrics === null || latestMetrics === void 0 ? void 0 : latestMetrics.accuracy) || 0;
      // Accuracy by risk level
      var riskLevels = ["LOW", "MEDIUM", "HIGH", "VERY_HIGH"];
      var byRiskLevel = riskLevels.map(function (level) {
        var levelPredictions = predictions.filter(function (p) {
          return p.riskLevel === level;
        });
        var correct = levelPredictions.filter(function (p) {
          return p.confidence > 0.8;
        }).length; // Mock accuracy calculation
        return {
          level: level.charAt(0) + level.slice(1).toLowerCase(),
          accuracy: levelPredictions.length > 0 ? (correct / levelPredictions.length) * 100 : 0,
          precision: Math.random() * 20 + 75, // Mock data
          recall: Math.random() * 20 + 70,
          f1Score: Math.random() * 20 + 73,
        };
      });
      // Accuracy over time
      var overTime = Array.from({ length: 30 }, function (_, i) {
        var date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return {
          date: date.toISOString().split("T")[0],
          accuracy: 75 + Math.random() * 20,
          predictions: Math.floor(Math.random() * 50) + 20,
        };
      });
      // Prediction distribution by risk ranges
      var predictionDistribution = [
        {
          riskRange: "Low (0-25%)",
          count: predictions.filter(function (p) {
            return p.riskScore <= 25;
          }).length,
          accuracy: 92,
          color: RISK_COLORS["Low (0-25%)"],
        },
        {
          riskRange: "Medium (26-50%)",
          count: predictions.filter(function (p) {
            return p.riskScore > 25 && p.riskScore <= 50;
          }).length,
          accuracy: 88,
          color: RISK_COLORS["Medium (26-50%)"],
        },
        {
          riskRange: "High (51-75%)",
          count: predictions.filter(function (p) {
            return p.riskScore > 50 && p.riskScore <= 75;
          }).length,
          accuracy: 84,
          color: RISK_COLORS["High (51-75%)"],
        },
        {
          riskRange: "Very High (76-100%)",
          count: predictions.filter(function (p) {
            return p.riskScore > 75;
          }).length,
          accuracy: 89,
          color: RISK_COLORS["Very High (76-100%)"],
        },
      ];
      // Feature importance analysis
      var featureImportance = [
        {
          feature: "Historical No-Show Rate",
          importance: 0.34,
          impact: "POSITIVE",
          category: "Historical",
        },
        {
          feature: "Appointment Day of Week",
          importance: 0.18,
          impact: "POSITIVE",
          category: "Temporal",
        },
        {
          feature: "Time Since Last Visit",
          importance: 0.15,
          impact: "POSITIVE",
          category: "Behavioral",
        },
        {
          feature: "Communication Response Rate",
          importance: 0.12,
          impact: "NEGATIVE",
          category: "Communication",
        },
        {
          feature: "Distance from Clinic",
          importance: 0.09,
          impact: "POSITIVE",
          category: "Geographic",
        },
        { feature: "Age Group", importance: 0.08, impact: "POSITIVE", category: "Demographic" },
        { feature: "Insurance Type", importance: 0.04, impact: "POSITIVE", category: "Financial" },
      ].sort(function (a, b) {
        return b.importance - a.importance;
      });
      // Time-based patterns
      var timePatterns = Array.from({ length: 24 }, function (_, hour) {
        return {
          hour: hour,
          noShowRate: 15 + Math.sin((hour / 24) * Math.PI * 2) * 10 + Math.random() * 5,
          predictions: Math.floor(Math.random() * 30) + 10,
          accuracy: 80 + Math.random() * 15,
        };
      });
      // Demographic insights
      var demographicInsights = [
        {
          segment: "Young Adults (18-30)",
          noShowRate: 22,
          predictedRate: 21,
          accuracy: 87,
          count: 450,
        },
        { segment: "Adults (31-50)", noShowRate: 15, predictedRate: 16, accuracy: 91, count: 780 },
        { segment: "Seniors (51-70)", noShowRate: 8, predictedRate: 9, accuracy: 94, count: 620 },
        { segment: "Elderly (70+)", noShowRate: 12, predictedRate: 11, accuracy: 89, count: 280 },
        {
          segment: "First-time Patients",
          noShowRate: 28,
          predictedRate: 27,
          accuracy: 83,
          count: 340,
        },
        {
          segment: "Regular Patients",
          noShowRate: 10,
          predictedRate: 11,
          accuracy: 93,
          count: 1240,
        },
      ];
      // Intervention impact analysis
      var interventionImpact = [
        {
          intervention: "SMS Reminders",
          preventedNoShows: 85,
          cost: 0.15,
          roi: 450,
          effectiveness: 78,
        },
        {
          intervention: "Phone Calls",
          preventedNoShows: 42,
          cost: 2.5,
          roi: 180,
          effectiveness: 85,
        },
        {
          intervention: "Email Reminders",
          preventedNoShows: 28,
          cost: 0.05,
          roi: 680,
          effectiveness: 65,
        },
        {
          intervention: "Push Notifications",
          preventedNoShows: 35,
          cost: 0.02,
          roi: 890,
          effectiveness: 72,
        },
        {
          intervention: "Personal Outreach",
          preventedNoShows: 18,
          cost: 15.0,
          roi: 95,
          effectiveness: 92,
        },
      ];
      return {
        modelAccuracy: {
          overall: overallAccuracy,
          byRiskLevel: byRiskLevel,
          overTime: overTime,
        },
        predictionDistribution: predictionDistribution,
        featureImportance: featureImportance,
        timePatterns: timePatterns,
        demographicInsights: demographicInsights,
        interventionImpact: interventionImpact,
      };
    },
    [predictions, riskProfiles, performanceMetrics, timeRange],
  );
  /**
   * Get metric color based on value
   */
  var getMetricColor = function (value, type) {
    if (type === void 0) {
      type = "accuracy";
    }
    if (type === "accuracy") {
      if (value >= 90) return "text-green-600";
      if (value >= 80) return "text-yellow-600";
      return "text-red-600";
    }
    return "text-blue-600";
  };
  /**
   * Format percentage
   */
  var formatPercentage = function (value) {
    return "".concat(value.toFixed(1), "%");
  };
  /**
   * Calculate model improvement suggestions
   */
  var getModelInsights = function () {
    var insights = [];
    var lowAccuracySegments = analyticsData.demographicInsights.filter(function (s) {
      return s.accuracy < 85;
    });
    if (lowAccuracySegments.length > 0) {
      insights.push({
        type: "improvement",
        message: "Model accuracy is lower for ".concat(
          lowAccuracySegments
            .map(function (s) {
              return s.segment;
            })
            .join(", "),
          ". Consider adding more training data for these segments.",
        ),
        priority: "HIGH",
      });
    }
    var highROIInterventions = analyticsData.interventionImpact.filter(function (i) {
      return i.roi > 500;
    });
    if (highROIInterventions.length > 0) {
      insights.push({
        type: "optimization",
        message: "Scale up ".concat(
          highROIInterventions
            .map(function (i) {
              return i.intervention;
            })
            .join(", "),
          " - showing excellent ROI.",
        ),
        priority: "MEDIUM",
      });
    }
    return insights;
  };
  var modelInsights = getModelInsights();
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Prediction Analytics</h2>
          <p className="text-muted-foreground">
            Advanced analytics and insights for no-show prediction performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select_1.Select
            value={timeRange}
            onValueChange={function (value) {
              return setTimeRange(value);
            }}
          >
            <select_1.SelectTrigger className="w-32">
              <select_1.SelectValue />
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="7d">Last 7 days</select_1.SelectItem>
              <select_1.SelectItem value="30d">Last 30 days</select_1.SelectItem>
              <select_1.SelectItem value="90d">Last 90 days</select_1.SelectItem>
              <select_1.SelectItem value="1y">Last year</select_1.SelectItem>
            </select_1.SelectContent>
          </select_1.Select>
          <button_1.Button variant="outline">
            <lucide_react_1.Download className="h-4 w-4 mr-2" />
            Export
          </button_1.Button>
          <button_1.Button variant="outline">
            <lucide_react_1.Settings className="h-4 w-4 mr-2" />
            Settings
          </button_1.Button>
        </div>
      </div>

      {/* Model Insights Alerts */}
      {modelInsights.length > 0 && (
        <div className="space-y-3">
          {modelInsights.map(function (insight, index) {
            return (
              <card_1.Card
                key={index}
                className={
                  insight.priority === "HIGH"
                    ? "border-red-200 bg-red-50"
                    : insight.priority === "MEDIUM"
                      ? "border-yellow-200 bg-yellow-50"
                      : "border-blue-200 bg-blue-50"
                }
              >
                <card_1.CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    {insight.type === "improvement"
                      ? <lucide_react_1.AlertTriangle className="h-4 w-4 text-red-600" />
                      : <lucide_react_1.TrendingUp className="h-4 w-4 text-blue-600" />}
                    <span className="text-sm">{insight.message}</span>
                    <badge_1.Badge
                      variant={
                        insight.priority === "HIGH"
                          ? "destructive"
                          : insight.priority === "MEDIUM"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {insight.priority}
                    </badge_1.Badge>
                  </div>
                </card_1.CardContent>
              </card_1.Card>
            );
          })}
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <card_1.Card>
          <card_1.CardHeader className="pb-2">
            <card_1.CardTitle className="text-sm font-medium flex items-center gap-2">
              <lucide_react_1.Target className="h-4 w-4" />
              Model Accuracy
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div
              className={"text-2xl font-bold ".concat(
                getMetricColor(analyticsData.modelAccuracy.overall),
              )}
            >
              {formatPercentage(analyticsData.modelAccuracy.overall)}
            </div>
            <div className="text-xs text-muted-foreground">Current performance</div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="pb-2">
            <card_1.CardTitle className="text-sm font-medium flex items-center gap-2">
              <lucide_react_1.Brain className="h-4 w-4" />
              Predictions Made
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {predictions.length.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              {timeRange === "7d"
                ? "This week"
                : timeRange === "30d"
                  ? "This month"
                  : "This period"}
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="pb-2">
            <card_1.CardTitle className="text-sm font-medium flex items-center gap-2">
              <lucide_react_1.CheckCircle className="h-4 w-4" />
              High Confidence
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold text-green-600">
              {
                predictions.filter(function (p) {
                  return p.confidence > 0.8;
                }).length
              }
            </div>
            <div className="text-xs text-muted-foreground">Predictions >80% confidence</div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="pb-2">
            <card_1.CardTitle className="text-sm font-medium flex items-center gap-2">
              <lucide_react_1.Activity className="h-4 w-4" />
              Feature Importance
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {analyticsData.featureImportance.length}
            </div>
            <div className="text-xs text-muted-foreground">Active features</div>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Main Analytics Tabs */}
      <tabs_1.Tabs
        value={activeTab}
        onValueChange={function (value) {
          return setActiveTab(value);
        }}
      >
        <tabs_1.TabsList className="grid w-full grid-cols-5">
          <tabs_1.TabsTrigger value="overview">Overview</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="accuracy">Accuracy</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="features">Features</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="patterns">Patterns</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="impact">Impact</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="overview" className="space-y-6">
          {/* Prediction Distribution and Accuracy Trend */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.PieChart className="h-5 w-5" />
                  Prediction Distribution
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <recharts_1.ResponsiveContainer width="100%" height={300}>
                  <recharts_1.PieChart>
                    <recharts_1.Pie
                      data={analyticsData.predictionDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="count"
                      nameKey="riskRange"
                    >
                      {analyticsData.predictionDistribution.map(function (entry, index) {
                        return <recharts_1.Cell key={"cell-".concat(index)} fill={entry.color} />;
                      })}
                    </recharts_1.Pie>
                    <recharts_1.Tooltip
                      formatter={function (value, name) {
                        return [value, "Count"];
                      }}
                      labelFormatter={function (label) {
                        return "Risk: ".concat(label);
                      }}
                    />
                  </recharts_1.PieChart>
                </recharts_1.ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {analyticsData.predictionDistribution.map(function (item, index) {
                    return (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
                        <span>
                          {item.riskRange}: {item.count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.TrendingUp className="h-5 w-5" />
                  Accuracy Trend
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <recharts_1.ResponsiveContainer width="100%" height={300}>
                  <recharts_1.LineChart data={analyticsData.modelAccuracy.overTime.slice(-14)}>
                    <recharts_1.CartesianGrid strokeDasharray="3 3" />
                    <recharts_1.XAxis
                      dataKey="date"
                      tickFormatter={function (date) {
                        return new Date(date).toLocaleDateString("pt-BR", {
                          month: "short",
                          day: "numeric",
                        });
                      }}
                    />
                    <recharts_1.YAxis domain={[60, 100]} />
                    <recharts_1.Tooltip
                      labelFormatter={function (date) {
                        return new Date(date).toLocaleDateString("pt-BR");
                      }}
                      formatter={function (value, name) {
                        return [
                          "".concat(value.toFixed(1), "%"),
                          name === "accuracy" ? "Accuracy" : "Predictions",
                        ];
                      }}
                    />
                    <recharts_1.Line
                      type="monotone"
                      dataKey="accuracy"
                      stroke="#10B981"
                      strokeWidth={2}
                      name="accuracy"
                    />
                  </recharts_1.LineChart>
                </recharts_1.ResponsiveContainer>
              </card_1.CardContent>
            </card_1.Card>
          </div>

          {/* Top Features and Demographics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.BarChart3 className="h-5 w-5" />
                  Top Predictive Features
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-3">
                  {analyticsData.featureImportance.slice(0, 6).map(function (feature, index) {
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{feature.feature}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">
                              {(feature.importance * 100).toFixed(1)}%
                            </span>
                            <badge_1.Badge
                              variant={feature.impact === "POSITIVE" ? "destructive" : "default"}
                              size="sm"
                            >
                              {feature.impact}
                            </badge_1.Badge>
                          </div>
                        </div>
                        <progress_1.Progress value={feature.importance * 100} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.Users className="h-5 w-5" />
                  Demographic Performance
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-3">
                  {analyticsData.demographicInsights.map(function (segment, index) {
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{segment.segment}</span>
                          <div className="text-right">
                            <div
                              className={"text-sm font-medium ".concat(
                                getMetricColor(segment.accuracy),
                              )}
                            >
                              {formatPercentage(segment.accuracy)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {segment.count} patients
                            </div>
                          </div>
                        </div>
                        <progress_1.Progress value={segment.accuracy} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Actual: {formatPercentage(segment.noShowRate)}</span>
                          <span>Predicted: {formatPercentage(segment.predictedRate)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="accuracy" className="space-y-6">
          {/* Accuracy by Risk Level */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.Target className="h-5 w-5" />
                Model Performance by Risk Level
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="mb-4">
                <select_1.Select
                  value={selectedMetric}
                  onValueChange={function (value) {
                    return setSelectedMetric(value);
                  }}
                >
                  <select_1.SelectTrigger className="w-48">
                    <select_1.SelectValue />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="accuracy">Accuracy</select_1.SelectItem>
                    <select_1.SelectItem value="precision">Precision</select_1.SelectItem>
                    <select_1.SelectItem value="recall">Recall</select_1.SelectItem>
                    <select_1.SelectItem value="f1">F1 Score</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
              </div>
              <recharts_1.ResponsiveContainer width="100%" height={400}>
                <recharts_1.BarChart data={analyticsData.modelAccuracy.byRiskLevel}>
                  <recharts_1.CartesianGrid strokeDasharray="3 3" />
                  <recharts_1.XAxis dataKey="level" />
                  <recharts_1.YAxis />
                  <recharts_1.Tooltip
                    formatter={function (value) {
                      return [
                        "".concat(value.toFixed(1), "%"),
                        selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1),
                      ];
                    }}
                  />
                  <recharts_1.Bar dataKey={selectedMetric} fill="#3B82F6" name={selectedMetric} />
                </recharts_1.BarChart>
              </recharts_1.ResponsiveContainer>
            </card_1.CardContent>
          </card_1.Card>

          {/* Confusion Matrix Visualization */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Prediction vs Actual Distribution</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <recharts_1.ResponsiveContainer width="100%" height={300}>
                  <recharts_1.BarChart data={analyticsData.predictionDistribution}>
                    <recharts_1.CartesianGrid strokeDasharray="3 3" />
                    <recharts_1.XAxis dataKey="riskRange" />
                    <recharts_1.YAxis />
                    <recharts_1.Tooltip />
                    <recharts_1.Bar dataKey="count" name="Predictions" fill="#3B82F6" />
                    <recharts_1.Bar dataKey="accuracy" name="Accuracy %" fill="#10B981" />
                  </recharts_1.BarChart>
                </recharts_1.ResponsiveContainer>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Model Metrics Summary</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {analyticsData.modelAccuracy.byRiskLevel.map(function (level, index) {
                    return (
                      <div key={level.level} className="space-y-3 p-4 bg-muted rounded-lg">
                        <h4 className="font-medium">{level.level} Risk</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Accuracy:</span>
                            <span className={"font-medium ".concat(getMetricColor(level.accuracy))}>
                              {formatPercentage(level.accuracy)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Precision:</span>
                            <span className="font-medium">{formatPercentage(level.precision)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Recall:</span>
                            <span className="font-medium">{formatPercentage(level.recall)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>F1 Score:</span>
                            <span className="font-medium">{formatPercentage(level.f1Score)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>

          {/* Accuracy Trend Over Time */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Accuracy Trend Over Time</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <recharts_1.ResponsiveContainer width="100%" height={400}>
                <recharts_1.AreaChart data={analyticsData.modelAccuracy.overTime}>
                  <recharts_1.CartesianGrid strokeDasharray="3 3" />
                  <recharts_1.XAxis
                    dataKey="date"
                    tickFormatter={function (date) {
                      return new Date(date).toLocaleDateString("pt-BR", {
                        month: "short",
                        day: "numeric",
                      });
                    }}
                  />
                  <recharts_1.YAxis domain={[60, 100]} />
                  <recharts_1.Tooltip
                    labelFormatter={function (date) {
                      return new Date(date).toLocaleDateString("pt-BR");
                    }}
                    formatter={function (value, name) {
                      return [
                        name === "accuracy" ? "".concat(value.toFixed(1), "%") : value,
                        name === "accuracy" ? "Accuracy" : "Predictions",
                      ];
                    }}
                  />
                  <recharts_1.Area
                    type="monotone"
                    dataKey="accuracy"
                    stroke="#10B981"
                    fill="#DCFCE7"
                    name="accuracy"
                  />
                </recharts_1.AreaChart>
              </recharts_1.ResponsiveContainer>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="features" className="space-y-6">
          {/* Feature Importance Chart */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.Brain className="h-5 w-5" />
                Feature Importance Analysis
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <recharts_1.ResponsiveContainer width="100%" height={400}>
                <recharts_1.BarChart
                  data={analyticsData.featureImportance}
                  layout="horizontal"
                  margin={{ left: 120 }}
                >
                  <recharts_1.CartesianGrid strokeDasharray="3 3" />
                  <recharts_1.XAxis
                    type="number"
                    tickFormatter={function (value) {
                      return "".concat((value * 100).toFixed(0), "%");
                    }}
                  />
                  <recharts_1.YAxis dataKey="feature" type="category" />
                  <recharts_1.Tooltip
                    formatter={function (value) {
                      return ["".concat((value * 100).toFixed(1), "%"), "Importance"];
                    }}
                  />
                  <recharts_1.Bar dataKey="importance">
                    {analyticsData.featureImportance.map(function (entry, index) {
                      return (
                        <recharts_1.Cell
                          key={"cell-".concat(index)}
                          fill={entry.impact === "POSITIVE" ? "#EF4444" : "#10B981"}
                        />
                      );
                    })}
                  </recharts_1.Bar>
                </recharts_1.BarChart>
              </recharts_1.ResponsiveContainer>
            </card_1.CardContent>
          </card_1.Card>

          {/* Feature Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Feature Categories</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-4">
                  {__spreadArray(
                    [],
                    new Set(
                      analyticsData.featureImportance.map(function (f) {
                        return f.category;
                      }),
                    ),
                    true,
                  ).map(function (category) {
                    var categoryFeatures = analyticsData.featureImportance.filter(function (f) {
                      return f.category === category;
                    });
                    var totalImportance = categoryFeatures.reduce(function (sum, f) {
                      return sum + f.importance;
                    }, 0);
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{category}</span>
                          <span className="text-sm">{(totalImportance * 100).toFixed(1)}%</span>
                        </div>
                        <progress_1.Progress value={totalImportance * 100} className="h-2" />
                        <div className="text-xs text-muted-foreground">
                          {categoryFeatures.length} features
                        </div>
                      </div>
                    );
                  })}
                </div>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Feature Impact Distribution</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <recharts_1.ResponsiveContainer width="100%" height={300}>
                  <recharts_1.PieChart>
                    <recharts_1.Pie
                      data={[
                        {
                          name: "Risk Increasing",
                          value: analyticsData.featureImportance.filter(function (f) {
                            return f.impact === "POSITIVE";
                          }).length,
                          fill: "#EF4444",
                        },
                        {
                          name: "Risk Decreasing",
                          value: analyticsData.featureImportance.filter(function (f) {
                            return f.impact === "NEGATIVE";
                          }).length,
                          fill: "#10B981",
                        },
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                    />
                    <recharts_1.Tooltip />
                  </recharts_1.PieChart>
                </recharts_1.ResponsiveContainer>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="patterns" className="space-y-6">
          {/* Time-based Patterns */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.Calendar className="h-5 w-5" />
                No-Show Patterns by Hour
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <recharts_1.ResponsiveContainer width="100%" height={400}>
                <recharts_1.AreaChart data={analyticsData.timePatterns}>
                  <recharts_1.CartesianGrid strokeDasharray="3 3" />
                  <recharts_1.XAxis
                    dataKey="hour"
                    tickFormatter={function (hour) {
                      return "".concat(hour, ":00");
                    }}
                  />
                  <recharts_1.YAxis />
                  <recharts_1.Tooltip
                    labelFormatter={function (hour) {
                      return "".concat(hour, ":00");
                    }}
                    formatter={function (value, name) {
                      return [
                        name === "noShowRate"
                          ? "".concat(value.toFixed(1), "%")
                          : name === "accuracy"
                            ? "".concat(value.toFixed(1), "%")
                            : value,
                        name === "noShowRate"
                          ? "No-Show Rate"
                          : name === "accuracy"
                            ? "Prediction Accuracy"
                            : "Predictions",
                      ];
                    }}
                  />
                  <recharts_1.Area
                    type="monotone"
                    dataKey="noShowRate"
                    stroke="#EF4444"
                    fill="#FEE2E2"
                    name="noShowRate"
                  />
                  <recharts_1.Area
                    type="monotone"
                    dataKey="accuracy"
                    stroke="#10B981"
                    fill="#DCFCE7"
                    name="accuracy"
                  />
                </recharts_1.AreaChart>
              </recharts_1.ResponsiveContainer>
            </card_1.CardContent>
          </card_1.Card>

          {/* Demographic Patterns */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Demographic Prediction Accuracy</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <recharts_1.ResponsiveContainer width="100%" height={400}>
                <recharts_1.ScatterChart>
                  <recharts_1.CartesianGrid strokeDasharray="3 3" />
                  <recharts_1.XAxis
                    dataKey="noShowRate"
                    name="Actual No-Show Rate"
                    tickFormatter={function (value) {
                      return "".concat(value, "%");
                    }}
                  />
                  <recharts_1.YAxis
                    dataKey="predictedRate"
                    name="Predicted No-Show Rate"
                    tickFormatter={function (value) {
                      return "".concat(value, "%");
                    }}
                  />
                  <recharts_1.Tooltip
                    formatter={function (value, name) {
                      return [
                        "".concat(value, "%"),
                        name === "noShowRate" ? "Actual Rate" : "Predicted Rate",
                      ];
                    }}
                    labelFormatter={function (label, payload) {
                      var _a, _b;
                      return (
                        ((_b =
                          (_a = payload === null || payload === void 0 ? void 0 : payload[0]) ===
                            null || _a === void 0
                            ? void 0
                            : _a.payload) === null || _b === void 0
                          ? void 0
                          : _b.segment) || ""
                      );
                    }}
                  />
                  <recharts_1.Scatter data={analyticsData.demographicInsights} fill="#3B82F6" />
                </recharts_1.ScatterChart>
              </recharts_1.ResponsiveContainer>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="impact" className="space-y-6">
          {/* Intervention Impact */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.TrendingUp className="h-5 w-5" />
                Intervention Effectiveness & ROI
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <recharts_1.ResponsiveContainer width="100%" height={400}>
                <recharts_1.BarChart data={analyticsData.interventionImpact}>
                  <recharts_1.CartesianGrid strokeDasharray="3 3" />
                  <recharts_1.XAxis dataKey="intervention" />
                  <recharts_1.YAxis />
                  <recharts_1.Tooltip
                    formatter={function (value, name) {
                      return [
                        name === "roi"
                          ? "".concat(value, "%")
                          : name === "cost"
                            ? "R$ ".concat(value.toFixed(2))
                            : name === "effectiveness"
                              ? "".concat(value, "%")
                              : value,
                        name === "preventedNoShows"
                          ? "Prevented No-Shows"
                          : name === "roi"
                            ? "ROI"
                            : name === "cost"
                              ? "Cost per Contact"
                              : "Effectiveness",
                      ];
                    }}
                  />
                  <recharts_1.Bar
                    dataKey="preventedNoShows"
                    name="preventedNoShows"
                    fill="#10B981"
                  />
                  <recharts_1.Bar dataKey="effectiveness" name="effectiveness" fill="#3B82F6" />
                </recharts_1.BarChart>
              </recharts_1.ResponsiveContainer>
            </card_1.CardContent>
          </card_1.Card>

          {/* ROI Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Return on Investment</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-4">
                  {analyticsData.interventionImpact
                    .sort(function (a, b) {
                      return b.roi - a.roi;
                    })
                    .map(function (intervention, index) {
                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{intervention.intervention}</span>
                            <span className="text-lg font-bold text-green-600">
                              {intervention.roi}%
                            </span>
                          </div>
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Cost: R$ {intervention.cost.toFixed(2)}</span>
                            <span>{intervention.preventedNoShows} prevented</span>
                          </div>
                          <progress_1.Progress
                            value={Math.min(intervention.roi / 10, 100)}
                            className="h-2"
                          />
                        </div>
                      );
                    })}
                </div>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Cost vs Effectiveness</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <recharts_1.ResponsiveContainer width="100%" height={300}>
                  <recharts_1.ScatterChart>
                    <recharts_1.CartesianGrid strokeDasharray="3 3" />
                    <recharts_1.XAxis
                      dataKey="cost"
                      name="Cost per Contact"
                      tickFormatter={function (value) {
                        return "R$ ".concat(value);
                      }}
                    />
                    <recharts_1.YAxis
                      dataKey="effectiveness"
                      name="Effectiveness %"
                      tickFormatter={function (value) {
                        return "".concat(value, "%");
                      }}
                    />
                    <recharts_1.Tooltip
                      formatter={function (value, name) {
                        return [
                          name === "cost" ? "R$ ".concat(value.toFixed(2)) : "".concat(value, "%"),
                          name === "cost" ? "Cost per Contact" : "Effectiveness",
                        ];
                      }}
                      labelFormatter={function (label, payload) {
                        var _a, _b;
                        return (
                          ((_b =
                            (_a = payload === null || payload === void 0 ? void 0 : payload[0]) ===
                              null || _a === void 0
                              ? void 0
                              : _a.payload) === null || _b === void 0
                            ? void 0
                            : _b.intervention) || ""
                        );
                      }}
                    />
                    <recharts_1.Scatter data={analyticsData.interventionImpact} fill="#8B5CF6" />
                  </recharts_1.ScatterChart>
                </recharts_1.ResponsiveContainer>
              </card_1.CardContent>
            </card_1.Card>
          </div>

          {/* Impact Summary */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Overall Impact Summary</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {analyticsData.interventionImpact.reduce(function (sum, i) {
                      return sum + i.preventedNoShows;
                    }, 0)}
                  </div>
                  <div className="text-xs text-muted-foreground">Total No-Shows Prevented</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    R${" "}
                    {analyticsData.interventionImpact
                      .reduce(function (sum, i) {
                        return sum + i.preventedNoShows * i.cost;
                      }, 0)
                      .toFixed(0)}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Investment</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(
                      analyticsData.interventionImpact.reduce(function (sum, i) {
                        return sum + i.roi;
                      }, 0) / analyticsData.interventionImpact.length,
                    )}
                    %
                  </div>
                  <div className="text-xs text-muted-foreground">Average ROI</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.round(
                      analyticsData.interventionImpact.reduce(function (sum, i) {
                        return sum + i.effectiveness;
                      }, 0) / analyticsData.interventionImpact.length,
                    )}
                    %
                  </div>
                  <div className="text-xs text-muted-foreground">Average Effectiveness</div>
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>
  );
}

/**
 * Story 11.2: Prediction Overview Component
 * Comprehensive overview of no-show predictions with risk visualization and insights
 */
"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PredictionOverview = PredictionOverview;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var input_1 = require("@/components/ui/input");
var select_1 = require("@/components/ui/select");
var table_1 = require("@/components/ui/table");
var progress_1 = require("@/components/ui/progress");
var alert_1 = require("@/components/ui/alert");
var recharts_1 = require("recharts");
var lucide_react_1 = require("lucide-react");
var no_show_prediction_1 = require("@/lib/analytics/no-show-prediction");
function PredictionOverview(_a) {
  var predictions = _a.predictions,
    riskProfiles = _a.riskProfiles,
    timeRange = _a.timeRange,
    onTimeRangeChange = _a.onTimeRangeChange,
    riskLevelFilter = _a.riskLevelFilter,
    onRiskLevelChange = _a.onRiskLevelChange;
  var _b = (0, react_1.useState)(""),
    searchTerm = _b[0],
    setSearchTerm = _b[1];
  var _c = (0, react_1.useState)("riskScore"),
    sortBy = _c[0],
    setSortBy = _c[1];
  var _d = (0, react_1.useState)("desc"),
    sortOrder = _d[0],
    setSortOrder = _d[1];
  var _e = (0, react_1.useState)(null),
    selectedPrediction = _e[0],
    setSelectedPrediction = _e[1];
  /**
   * Filter and sort predictions based on current criteria
   */
  var filteredPredictions = (0, react_1.useMemo)(
    function () {
      var filtered = predictions;
      // Apply risk level filter
      if (riskLevelFilter !== "ALL") {
        filtered = filtered.filter(function (p) {
          return p.riskLevel === riskLevelFilter;
        });
      }
      // Apply search filter
      if (searchTerm) {
        filtered = filtered.filter(function (p) {
          return (
            p.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.appointmentId.toLowerCase().includes(searchTerm.toLowerCase())
          );
        });
      }
      // Apply sorting
      filtered.sort(function (a, b) {
        var comparison = 0;
        switch (sortBy) {
          case "riskScore":
            comparison = a.riskScore - b.riskScore;
            break;
          case "predictedAt":
            comparison = new Date(a.predictedAt).getTime() - new Date(b.predictedAt).getTime();
            break;
          case "patientName":
            comparison = a.patientId.localeCompare(b.patientId);
            break;
        }
        return sortOrder === "desc" ? -comparison : comparison;
      });
      return filtered;
    },
    [predictions, riskLevelFilter, searchTerm, sortBy, sortOrder],
  );
  /**
   * Generate summary analytics data
   */
  var summaryData = (0, react_1.useMemo)(
    function () {
      // Risk level distribution
      var riskDistribution = [
        {
          level: "LOW",
          count: predictions.filter(function (p) {
            return p.riskLevel === "LOW";
          }).length,
          color: "#10B981",
        },
        {
          level: "MEDIUM",
          count: predictions.filter(function (p) {
            return p.riskLevel === "MEDIUM";
          }).length,
          color: "#F59E0B",
        },
        {
          level: "HIGH",
          count: predictions.filter(function (p) {
            return p.riskLevel === "HIGH";
          }).length,
          color: "#F97316",
        },
        {
          level: "CRITICAL",
          count: predictions.filter(function (p) {
            return p.riskLevel === "CRITICAL";
          }).length,
          color: "#EF4444",
        },
      ];
      // Time-based distribution (hourly)
      var timeDistribution = Array.from({ length: 24 }, function (_, hour) {
        var hourPredictions = predictions.filter(function (p) {
          var predHour = new Date(p.predictedAt).getHours();
          return predHour === hour;
        });
        var avgRisk =
          hourPredictions.length > 0
            ? hourPredictions.reduce(function (sum, p) {
                return sum + p.riskScore;
              }, 0) / hourPredictions.length
            : 0;
        return {
          hour: "".concat(hour.toString().padStart(2, "0"), ":00"),
          predictions: hourPredictions.length,
          avgRisk: Math.round(avgRisk),
        };
      });
      // Risk trends over time (daily for last 7 days)
      var riskTrends = Array.from({ length: 7 }, function (_, dayIndex) {
        var date = new Date();
        date.setDate(date.getDate() - (6 - dayIndex));
        var dayPredictions = predictions.filter(function (p) {
          var predDate = new Date(p.predictedAt);
          return predDate.toDateString() === date.toDateString();
        });
        var avgRisk =
          dayPredictions.length > 0
            ? dayPredictions.reduce(function (sum, p) {
                return sum + p.riskScore;
              }, 0) / dayPredictions.length
            : 0;
        return {
          date: date.toLocaleDateString("pt-BR", { month: "short", day: "numeric" }),
          avgRisk: Math.round(avgRisk),
          count: dayPredictions.length,
        };
      });
      // Top risk factors analysis
      var factorImpacts = {};
      predictions.forEach(function (prediction) {
        prediction.factors.forEach(function (factor) {
          if (!factorImpacts[factor.factorName]) {
            factorImpacts[factor.factorName] = { impact: 0, frequency: 0 };
          }
          factorImpacts[factor.factorName].impact += factor.contribution;
          factorImpacts[factor.factorName].frequency += 1;
        });
      });
      var topRiskFactors = Object.entries(factorImpacts)
        .map(function (_a) {
          var factor = _a[0],
            data = _a[1];
          return {
            factor: factor,
            impact: Math.round(data.impact / data.frequency), // Average impact
            frequency: data.frequency,
          };
        })
        .sort(function (a, b) {
          return b.impact - a.impact;
        })
        .slice(0, 10);
      return {
        riskDistribution: riskDistribution,
        timeDistribution: timeDistribution,
        riskTrends: riskTrends,
        topRiskFactors: topRiskFactors,
      };
    },
    [predictions],
  );
  /**
   * Get recommendation for a specific prediction
   */
  var getRecommendation = function (prediction) {
    var recommendations = prediction.interventionRecommendations;
    if (recommendations.length === 0) return "No specific intervention required";
    var highestPriority = recommendations.sort(function (a, b) {
      var priorityOrder = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    })[0];
    return highestPriority.message;
  };
  /**
   * Format confidence level for display
   */
  var formatConfidence = function (confidence) {
    var percentage = Math.round(confidence * 100);
    if (percentage >= 90) return "Very High";
    if (percentage >= 70) return "High";
    if (percentage >= 50) return "Medium";
    return "Low";
  };
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <card_1.Card>
          <card_1.CardHeader className="pb-2">
            <card_1.CardTitle className="text-sm font-medium">Total Predictions</card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{predictions.length}</div>
            <div className="text-xs text-muted-foreground">
              {filteredPredictions.length} after filters
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="pb-2">
            <card_1.CardTitle className="text-sm font-medium">Average Risk Score</card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {predictions.length > 0
                ? Math.round(
                    predictions.reduce(function (sum, p) {
                      return sum + p.riskScore;
                    }, 0) / predictions.length,
                  )
                : 0}
              %
            </div>
            <div className="text-xs text-muted-foreground">Across all patients</div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="pb-2">
            <card_1.CardTitle className="text-sm font-medium">High Risk Count</card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {
                predictions.filter(function (p) {
                  return p.riskLevel === "HIGH" || p.riskLevel === "CRITICAL";
                }).length
              }
            </div>
            <div className="text-xs text-muted-foreground">Requiring intervention</div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="pb-2">
            <card_1.CardTitle className="text-sm font-medium">Model Confidence</card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {predictions.length > 0
                ? Math.round(
                    (predictions.reduce(function (sum, p) {
                      return sum + p.confidence;
                    }, 0) /
                      predictions.length) *
                      100,
                  )
                : 0}
              %
            </div>
            <div className="text-xs text-muted-foreground">Average confidence</div>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Chart */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.Target className="h-5 w-5" />
              Risk Level Distribution
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <recharts_1.ResponsiveContainer width="100%" height={300}>
              <recharts_1.PieChart>
                <recharts_1.Pie
                  data={summaryData.riskDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  label={function (_a) {
                    var level = _a.level,
                      count = _a.count,
                      percent = _a.percent;
                    return ""
                      .concat(level, ": ")
                      .concat(count, " (")
                      .concat((percent * 100).toFixed(0), "%)");
                  }}
                >
                  {summaryData.riskDistribution.map(function (entry, index) {
                    return <recharts_1.Cell key={"cell-".concat(index)} fill={entry.color} />;
                  })}
                </recharts_1.Pie>
                <recharts_1.Tooltip />
              </recharts_1.PieChart>
            </recharts_1.ResponsiveContainer>
          </card_1.CardContent>
        </card_1.Card>

        {/* Time Distribution Chart */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.Clock className="h-5 w-5" />
              Hourly Prediction Pattern
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <recharts_1.ResponsiveContainer width="100%" height={300}>
              <recharts_1.AreaChart data={summaryData.timeDistribution}>
                <recharts_1.CartesianGrid strokeDasharray="3 3" />
                <recharts_1.XAxis dataKey="hour" />
                <recharts_1.YAxis />
                <recharts_1.Tooltip
                  labelFormatter={function (hour) {
                    return "Time: ".concat(hour);
                  }}
                  formatter={function (value, name) {
                    return [value, name === "predictions" ? "Predictions" : "Avg Risk %"];
                  }}
                />
                <recharts_1.Area
                  type="monotone"
                  dataKey="predictions"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.3}
                />
                <recharts_1.Line
                  type="monotone"
                  dataKey="avgRisk"
                  stroke="#EF4444"
                  strokeWidth={2}
                />
              </recharts_1.AreaChart>
            </recharts_1.ResponsiveContainer>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Risk Trends and Top Factors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Trends */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.TrendingUp className="h-5 w-5" />
              Risk Trends (7 Days)
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <recharts_1.ResponsiveContainer width="100%" height={250}>
              <recharts_1.LineChart data={summaryData.riskTrends}>
                <recharts_1.CartesianGrid strokeDasharray="3 3" />
                <recharts_1.XAxis dataKey="date" />
                <recharts_1.YAxis />
                <recharts_1.Tooltip
                  formatter={function (value, name) {
                    return [value, name === "avgRisk" ? "Avg Risk %" : "Count"];
                  }}
                />
                <recharts_1.Line
                  type="monotone"
                  dataKey="avgRisk"
                  stroke="#EF4444"
                  strokeWidth={3}
                />
                <recharts_1.Bar dataKey="count" fill="#3B82F6" opacity={0.3} />
              </recharts_1.LineChart>
            </recharts_1.ResponsiveContainer>
          </card_1.CardContent>
        </card_1.Card>

        {/* Top Risk Factors */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.AlertTriangle className="h-5 w-5" />
              Top Risk Factors
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="space-y-3">
              {summaryData.topRiskFactors.slice(0, 8).map(function (factor, index) {
                return (
                  <div key={factor.factor} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium">{factor.factor}</div>
                      <div className="text-xs text-muted-foreground">
                        Frequency: {factor.frequency} patients
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <progress_1.Progress value={factor.impact} className="w-16 h-2" />
                      <span className="text-sm font-medium">{factor.impact}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Filters and Controls */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Filter className="h-5 w-5" />
            Prediction Details
          </card_1.CardTitle>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="flex-1">
              <input_1.Input
                placeholder="Search by patient ID or appointment..."
                value={searchTerm}
                onChange={function (e) {
                  return setSearchTerm(e.target.value);
                }}
                className="w-full"
              />
            </div>

            <select_1.Select value={riskLevelFilter} onValueChange={onRiskLevelChange}>
              <select_1.SelectTrigger className="w-full sm:w-48">
                <select_1.SelectValue placeholder="Filter by risk level" />
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="ALL">All Risk Levels</select_1.SelectItem>
                <select_1.SelectItem value="HIGH">High Risk Only</select_1.SelectItem>
                <select_1.SelectItem value="CRITICAL">Critical Risk Only</select_1.SelectItem>
              </select_1.SelectContent>
            </select_1.Select>

            <select_1.Select
              value={sortBy}
              onValueChange={function (value) {
                return setSortBy(value);
              }}
            >
              <select_1.SelectTrigger className="w-full sm:w-48">
                <select_1.SelectValue placeholder="Sort by" />
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="riskScore">Risk Score</select_1.SelectItem>
                <select_1.SelectItem value="predictedAt">Prediction Time</select_1.SelectItem>
                <select_1.SelectItem value="patientName">Patient ID</select_1.SelectItem>
              </select_1.SelectContent>
            </select_1.Select>

            <button_1.Button
              variant="outline"
              onClick={function () {
                return setSortOrder(sortOrder === "asc" ? "desc" : "asc");
              }}
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </button_1.Button>
          </div>
        </card_1.CardHeader>
        <card_1.CardContent>
          {/* Predictions Table */}
          <div className="rounded-md border">
            <table_1.Table>
              <table_1.TableHeader>
                <table_1.TableRow>
                  <table_1.TableHead>Patient</table_1.TableHead>
                  <table_1.TableHead>Risk Score</table_1.TableHead>
                  <table_1.TableHead>Risk Level</table_1.TableHead>
                  <table_1.TableHead>Confidence</table_1.TableHead>
                  <table_1.TableHead>Top Risk Factor</table_1.TableHead>
                  <table_1.TableHead>Recommendation</table_1.TableHead>
                  <table_1.TableHead>Predicted At</table_1.TableHead>
                </table_1.TableRow>
              </table_1.TableHeader>
              <table_1.TableBody>
                {filteredPredictions.slice(0, 20).map(function (prediction) {
                  var topFactor = prediction.factors.sort(function (a, b) {
                    return b.contribution - a.contribution;
                  })[0];
                  return (
                    <table_1.TableRow
                      key={prediction.appointmentId}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={function () {
                        return setSelectedPrediction(prediction);
                      }}
                    >
                      <table_1.TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <lucide_react_1.User className="h-4 w-4 text-muted-foreground" />
                          {prediction.patientId.slice(-8)}
                        </div>
                      </table_1.TableCell>

                      <table_1.TableCell>
                        <div className="flex items-center gap-2">
                          <progress_1.Progress value={prediction.riskScore} className="w-16 h-2" />
                          <span className="font-medium">{prediction.riskScore}%</span>
                        </div>
                      </table_1.TableCell>

                      <table_1.TableCell>
                        <badge_1.Badge
                          className={(0, no_show_prediction_1.getRiskBadgeColor)(
                            prediction.riskLevel,
                          )}
                        >
                          {prediction.riskLevel}
                        </badge_1.Badge>
                      </table_1.TableCell>

                      <table_1.TableCell>
                        <badge_1.Badge variant="outline">
                          {formatConfidence(prediction.confidence)}
                        </badge_1.Badge>
                      </table_1.TableCell>

                      <table_1.TableCell>
                        <div className="text-sm">{topFactor ? topFactor.factorName : "None"}</div>
                        {topFactor && (
                          <div className="text-xs text-muted-foreground">
                            +{topFactor.contribution.toFixed(1)}% impact
                          </div>
                        )}
                      </table_1.TableCell>

                      <table_1.TableCell className="max-w-xs">
                        <div className="text-sm truncate">{getRecommendation(prediction)}</div>
                      </table_1.TableCell>

                      <table_1.TableCell className="text-sm text-muted-foreground">
                        {new Date(prediction.predictedAt).toLocaleString()}
                      </table_1.TableCell>
                    </table_1.TableRow>
                  );
                })}
              </table_1.TableBody>
            </table_1.Table>
          </div>

          {filteredPredictions.length === 0 && (
            <div className="text-center py-8">
              <lucide_react_1.Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No predictions found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search criteria</p>
            </div>
          )}

          {filteredPredictions.length > 20 && (
            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground">
                Showing 20 of {filteredPredictions.length} predictions. Use filters to narrow down
                results.
              </p>
            </div>
          )}
        </card_1.CardContent>
      </card_1.Card>

      {/* Selected Prediction Details Modal/Card */}
      {selectedPrediction && (
        <card_1.Card className="border-primary">
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center justify-between">
              <span>Prediction Details</span>
              <button_1.Button
                variant="outline"
                size="sm"
                onClick={function () {
                  return setSelectedPrediction(null);
                }}
              >
                Close
              </button_1.Button>
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h4 className="font-medium">Prediction Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Patient ID:</span>
                    <span className="font-medium">{selectedPrediction.patientId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Risk Score:</span>
                    <span
                      className={"font-bold ".concat(
                        (0, no_show_prediction_1.getRiskColor)(selectedPrediction.riskLevel),
                      )}
                    >
                      {selectedPrediction.riskScore}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Confidence:</span>
                    <span className="font-medium">
                      {formatConfidence(selectedPrediction.confidence)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Model Version:</span>
                    <span className="font-medium">{selectedPrediction.modelVersion}</span>
                  </div>
                </div>
              </div>

              {/* Risk Factors */}
              <div className="space-y-4">
                <h4 className="font-medium">Risk Factors</h4>
                <div className="space-y-2">
                  {selectedPrediction.factors.map(function (factor, index) {
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-sm font-medium">{factor.factorName}</div>
                          <div className="text-xs text-muted-foreground">{factor.description}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            +{factor.contribution.toFixed(1)}%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Weight: {(factor.weight * 100).toFixed(0)}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Intervention Recommendations */}
            {selectedPrediction.interventionRecommendations.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium mb-4">Recommended Interventions</h4>
                <div className="space-y-3">
                  {selectedPrediction.interventionRecommendations.map(
                    function (intervention, index) {
                      return (
                        <alert_1.Alert key={index}>
                          <lucide_react_1.AlertTriangle className="h-4 w-4" />
                          <alert_1.AlertDescription>
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="font-medium">{intervention.type}</div>
                                <div className="text-sm">{intervention.message}</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  Channel: {intervention.channel} | Timing: {intervention.timing}
                                </div>
                              </div>
                              <div className="text-right">
                                <badge_1.Badge
                                  variant={
                                    intervention.priority === "URGENT"
                                      ? "destructive"
                                      : intervention.priority === "HIGH"
                                        ? "default"
                                        : "secondary"
                                  }
                                >
                                  {intervention.priority}
                                </badge_1.Badge>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {(intervention.effectiveness * 100).toFixed(0)}% effective
                                </div>
                              </div>
                            </div>
                          </alert_1.AlertDescription>
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
    </div>
  );
}

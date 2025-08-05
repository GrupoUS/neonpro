/**
 * Story 11.2: Risk Factors Analysis Component
 * Multi-factor risk analysis with patient behavior patterns and demographic insights
 */
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiskFactors = RiskFactors;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var progress_1 = require("@/components/ui/progress");
var tabs_1 = require("@/components/ui/tabs");
var alert_1 = require("@/components/ui/alert");
var recharts_1 = require("recharts");
var lucide_react_1 = require("lucide-react");
var risk_scoring_1 = require("@/lib/analytics/risk-scoring");
function RiskFactors(_a) {
  var riskProfiles = _a.riskProfiles,
    predictions = _a.predictions,
    onProfileUpdate = _a.onProfileUpdate;
  var _b = (0, react_1.useState)(null),
    selectedProfile = _b[0],
    setSelectedProfile = _b[1];
  var _c = (0, react_1.useState)("overview"),
    analysisView = _c[0],
    setAnalysisView = _c[1];
  var _d = (0, react_1.useState)("30d"),
    timeWindow = _d[0],
    setTimeWindow = _d[1];
  /**
   * Analyze risk factors across all profiles and predictions
   */
  var riskAnalysis = (0, react_1.useMemo)(() => {
    // Category breakdown analysis
    var categoryData = {};
    predictions.forEach((prediction) => {
      prediction.factors.forEach((factor) => {
        if (!categoryData[factor.category]) {
          categoryData[factor.category] = { risks: [], count: 0 };
        }
        categoryData[factor.category].risks.push(factor.contribution);
        categoryData[factor.category].count++;
      });
    });
    var categoryBreakdown = Object.entries(categoryData).map((_a) => {
      var _b;
      var _c, _d;
      var category = _a[0],
        data = _a[1];
      var avgRisk = data.risks.reduce((sum, risk) => sum + risk, 0) / data.risks.length;
      var categoryConfig =
        ((_b = {}),
        (_b[RiskFactorCategory.PATIENT_HISTORY] = {
          color: "#EF4444",
          icon: <lucide_react_1.Activity className="h-4 w-4" />,
        }),
        (_b[RiskFactorCategory.APPOINTMENT_CHARACTERISTICS] = {
          color: "#F97316",
          icon: <lucide_react_1.Calendar className="h-4 w-4" />,
        }),
        (_b[RiskFactorCategory.DEMOGRAPHICS] = {
          color: "#8B5CF6",
          icon: <lucide_react_1.Users className="h-4 w-4" />,
        }),
        (_b[RiskFactorCategory.EXTERNAL_FACTORS] = {
          color: "#06B6D4",
          icon: <lucide_react_1.MapPin className="h-4 w-4" />,
        }),
        (_b[RiskFactorCategory.COMMUNICATION_PATTERNS] = {
          color: "#10B981",
          icon: <lucide_react_1.MessageSquare className="h-4 w-4" />,
        }),
        _b);
      return {
        category: category
          .replace(/_/g, " ")
          .toLowerCase()
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        avgRisk: Math.round(avgRisk),
        count: data.count,
        color:
          ((_c = categoryConfig[category]) === null || _c === void 0 ? void 0 : _c.color) ||
          "#6B7280",
        icon: ((_d = categoryConfig[category]) === null || _d === void 0 ? void 0 : _d.icon) || (
          <lucide_react_1.Target className="h-4 w-4" />
        ),
      };
    });
    // Factor correlations (mock analysis for now)
    var factorCorrelations = [
      { factor: "Historical No-Show Rate", correlation: 0.85, significance: 0.95, trend: "UP" },
      { factor: "Booking Advance Time", correlation: 0.72, significance: 0.88, trend: "STABLE" },
      {
        factor: "Communication Response Rate",
        correlation: -0.68,
        significance: 0.82,
        trend: "DOWN",
      },
      { factor: "Weekend Appointment", correlation: 0.45, significance: 0.75, trend: "UP" },
      { factor: "Distance from Clinic", correlation: 0.38, significance: 0.68, trend: "STABLE" },
    ];
    // Patient segments based on risk profiles
    var patientSegments = [
      {
        segment: "Reliable Patients",
        count: riskProfiles.filter((p) => p.overallRiskScore < 25).length,
        avgRisk: 15,
        characteristics: [
          "High communication response",
          "Consistent attendance",
          "Long relationship",
        ],
      },
      {
        segment: "Moderate Risk",
        count: riskProfiles.filter((p) => p.overallRiskScore >= 25 && p.overallRiskScore < 50)
          .length,
        avgRisk: 35,
        characteristics: ["Occasional no-shows", "Variable communication", "Standard patterns"],
      },
      {
        segment: "High Risk",
        count: riskProfiles.filter((p) => p.overallRiskScore >= 50 && p.overallRiskScore < 75)
          .length,
        avgRisk: 62,
        characteristics: ["Frequent no-shows", "Poor communication", "Multiple risk factors"],
      },
      {
        segment: "Critical Risk",
        count: riskProfiles.filter((p) => p.overallRiskScore >= 75).length,
        avgRisk: 85,
        characteristics: ["Very high no-show rate", "Non-responsive", "Complex circumstances"],
      },
    ];
    // Time-based risk patterns
    var timePatterns = [
      { timeframe: "Monday Morning", riskIncrease: 25, frequency: 85 },
      { timeframe: "Friday Afternoon", riskIncrease: 35, frequency: 78 },
      { timeframe: "Day After Holiday", riskIncrease: 45, frequency: 65 },
      { timeframe: "Winter Months", riskIncrease: 20, frequency: 92 },
      { timeframe: "End of Month", riskIncrease: 15, frequency: 70 },
    ];
    // Protective factors
    var protectiveFactors = [
      { factor: "High Communication Response", riskReduction: 35, prevalence: 68 },
      { factor: "Consistent Appointment Times", riskReduction: 28, prevalence: 45 },
      { factor: "Family Support", riskReduction: 22, prevalence: 52 },
      { factor: "Close to Clinic", riskReduction: 18, prevalence: 38 },
      { factor: "Insurance Coverage", riskReduction: 15, prevalence: 82 },
    ];
    return {
      categoryBreakdown: categoryBreakdown,
      factorCorrelations: factorCorrelations,
      patientSegments: patientSegments,
      timePatterns: timePatterns,
      protectiveFactors: protectiveFactors,
    };
  }, [riskProfiles, predictions]);
  /**
   * Get risk profile details for radar chart
   */
  var getProfileRadarData = (profile) => [
    { factor: "Historical", score: profile.historicalRisk, fullMark: 100 },
    { factor: "Behavioral", score: profile.behavioralRisk, fullMark: 100 },
    { factor: "Demographic", score: profile.demographicRisk, fullMark: 100 },
    { factor: "Communication", score: profile.communicationRisk, fullMark: 100 },
    { factor: "Contextual", score: profile.contextualRisk, fullMark: 100 },
  ];
  /**
   * Format trend display
   */
  var formatTrend = (trend) => {
    switch (trend) {
      case "IMPROVING":
        return {
          icon: <lucide_react_1.TrendingDown className="h-4 w-4" />,
          color: "text-green-600",
        };
      case "DETERIORATING":
        return { icon: <lucide_react_1.TrendingUp className="h-4 w-4" />, color: "text-red-600" };
      default:
        return { icon: <lucide_react_1.Target className="h-4 w-4" />, color: "text-gray-600" };
    }
  };
  return (
    <div className="space-y-6">
      {/* Analysis Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <card_1.Card>
          <card_1.CardHeader className="pb-2">
            <card_1.CardTitle className="text-sm font-medium flex items-center gap-2">
              <lucide_react_1.Users className="h-4 w-4" />
              Risk Profiles
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{riskProfiles.length}</div>
            <div className="text-xs text-muted-foreground">Analyzed patients</div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="pb-2">
            <card_1.CardTitle className="text-sm font-medium flex items-center gap-2">
              <lucide_react_1.TrendingUp className="h-4 w-4" />
              Improving Trends
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold text-green-600">
              {riskProfiles.filter((p) => p.riskTrend === "IMPROVING").length}
            </div>
            <div className="text-xs text-muted-foreground">Patients getting better</div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="pb-2">
            <card_1.CardTitle className="text-sm font-medium flex items-center gap-2">
              <lucide_react_1.AlertTriangle className="h-4 w-4" />
              High Risk Factors
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {riskAnalysis.factorCorrelations.filter((f) => f.correlation > 0.7).length}
            </div>
            <div className="text-xs text-muted-foreground">Strong correlations</div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="pb-2">
            <card_1.CardTitle className="text-sm font-medium flex items-center gap-2">
              <lucide_react_1.Star className="h-4 w-4" />
              Protective Factors
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {riskAnalysis.protectiveFactors.length}
            </div>
            <div className="text-xs text-muted-foreground">Risk reduction factors</div>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Main Analysis Tabs */}
      <tabs_1.Tabs value={analysisView} onValueChange={(value) => setAnalysisView(value)}>
        <tabs_1.TabsList className="grid w-full grid-cols-4">
          <tabs_1.TabsTrigger value="overview">Overview</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="categories">Categories</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="correlations">Correlations</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="segments">Segments</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="overview" className="space-y-6">
          {/* Category Breakdown Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.Target className="h-5 w-5" />
                  Risk Factor Categories
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <recharts_1.ResponsiveContainer width="100%" height={300}>
                  <recharts_1.BarChart data={riskAnalysis.categoryBreakdown}>
                    <recharts_1.CartesianGrid strokeDasharray="3 3" />
                    <recharts_1.XAxis dataKey="category" angle={-45} textAnchor="end" height={80} />
                    <recharts_1.YAxis />
                    <recharts_1.Tooltip
                      formatter={(value, name) => [
                        "".concat(value, "%"),
                        name === "avgRisk" ? "Average Risk" : "Count",
                      ]}
                    />
                    <recharts_1.Bar dataKey="avgRisk" name="Average Risk">
                      {riskAnalysis.categoryBreakdown.map((entry, index) => (
                        <recharts_1.Cell key={"cell-".concat(index)} fill={entry.color} />
                      ))}
                    </recharts_1.Bar>
                  </recharts_1.BarChart>
                </recharts_1.ResponsiveContainer>
              </card_1.CardContent>
            </card_1.Card>

            {/* Patient Segments */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.Users className="h-5 w-5" />
                  Patient Risk Segments
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-4">
                  {riskAnalysis.patientSegments.map((segment, index) => (
                    <div key={segment.segment} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <badge_1.Badge
                            variant={
                              segment.avgRisk >= 75
                                ? "destructive"
                                : segment.avgRisk >= 50
                                  ? "default"
                                  : segment.avgRisk >= 25
                                    ? "secondary"
                                    : "outline"
                            }
                          >
                            {segment.segment}
                          </badge_1.Badge>
                          <span className="text-sm text-muted-foreground">
                            {segment.count} patients
                          </span>
                        </div>
                        <span className="font-medium">{segment.avgRisk}%</span>
                      </div>
                      <progress_1.Progress value={segment.avgRisk} className="h-2" />
                      <div className="text-xs text-muted-foreground">
                        {segment.characteristics.join(" • ")}
                      </div>
                    </div>
                  ))}
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>

          {/* Protective Factors and Time Patterns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.Star className="h-5 w-5" />
                  Protective Factors
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-3">
                  {riskAnalysis.protectiveFactors.map((factor, index) => (
                    <div key={factor.factor} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium">{factor.factor}</div>
                        <div className="text-xs text-muted-foreground">
                          Present in {factor.prevalence}% of patients
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-green-600">
                          -{factor.riskReduction}%
                        </div>
                        <div className="text-xs text-muted-foreground">Risk reduction</div>
                      </div>
                    </div>
                  ))}
                </div>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.Clock className="h-5 w-5" />
                  Time-Based Risk Patterns
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-3">
                  {riskAnalysis.timePatterns.map((pattern, index) => (
                    <div key={pattern.timeframe} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{pattern.timeframe}</span>
                        <div className="text-right">
                          <span className="text-sm font-medium text-orange-600">
                            +{pattern.riskIncrease}%
                          </span>
                          <div className="text-xs text-muted-foreground">
                            {pattern.frequency}% frequency
                          </div>
                        </div>
                      </div>
                      <progress_1.Progress value={pattern.riskIncrease} className="h-2" />
                    </div>
                  ))}
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="categories" className="space-y-6">
          {/* Detailed Category Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {riskAnalysis.categoryBreakdown.map((category) => (
              <card_1.Card key={category.category}>
                <card_1.CardHeader className="pb-3">
                  <card_1.CardTitle className="text-sm font-medium flex items-center gap-2">
                    {category.icon}
                    {category.category}
                  </card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Average Risk</span>
                      <span className="font-bold" style={{ color: category.color }}>
                        {category.avgRisk}%
                      </span>
                    </div>
                    <progress_1.Progress value={category.avgRisk} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      {category.count} total factors analyzed
                    </div>
                  </div>
                </card_1.CardContent>
              </card_1.Card>
            ))}
          </div>

          {/* Category Details Table */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Category Impact Analysis</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <recharts_1.ResponsiveContainer width="100%" height={400}>
                <recharts_1.BarChart
                  data={riskAnalysis.categoryBreakdown}
                  layout="horizontal"
                  margin={{ left: 100 }}
                >
                  <recharts_1.CartesianGrid strokeDasharray="3 3" />
                  <recharts_1.XAxis type="number" />
                  <recharts_1.YAxis dataKey="category" type="category" />
                  <recharts_1.Tooltip
                    formatter={(value) => ["".concat(value, "%"), "Average Risk"]}
                  />
                  <recharts_1.Bar dataKey="avgRisk">
                    {riskAnalysis.categoryBreakdown.map((entry, index) => (
                      <recharts_1.Cell key={"cell-".concat(index)} fill={entry.color} />
                    ))}
                  </recharts_1.Bar>
                </recharts_1.BarChart>
              </recharts_1.ResponsiveContainer>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="correlations" className="space-y-6">
          {/* Factor Correlations */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.Activity className="h-5 w-5" />
                Factor Correlations with No-Show Risk
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                {riskAnalysis.factorCorrelations.map((correlation, index) => {
                  var trendDisplay = formatTrend(correlation.trend);
                  var isPositive = correlation.correlation > 0;
                  return (
                    <div key={correlation.factor} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{correlation.factor}</span>
                          <div className={"flex items-center gap-1 ".concat(trendDisplay.color)}>
                            {trendDisplay.icon}
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={"font-medium ".concat(
                              isPositive ? "text-red-600" : "text-green-600",
                            )}
                          >
                            {correlation.correlation > 0 ? "+" : ""}
                            {(correlation.correlation * 100).toFixed(0)}%
                          </span>
                          <div className="text-xs text-muted-foreground">
                            {(correlation.significance * 100).toFixed(0)}% significant
                          </div>
                        </div>
                      </div>
                      <progress_1.Progress
                        value={Math.abs(correlation.correlation) * 100}
                        className="h-2"
                      />
                    </div>
                  );
                })}
              </div>
            </card_1.CardContent>
          </card_1.Card>

          {/* Correlation Scatter Plot */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Correlation Strength vs. Significance</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <recharts_1.ResponsiveContainer width="100%" height={400}>
                <recharts_1.ScatterChart>
                  <recharts_1.CartesianGrid strokeDasharray="3 3" />
                  <recharts_1.XAxis
                    dataKey="correlation"
                    domain={[-1, 1]}
                    tickFormatter={(value) => "".concat((value * 100).toFixed(0), "%")}
                  />
                  <recharts_1.YAxis
                    dataKey="significance"
                    domain={[0, 1]}
                    tickFormatter={(value) => "".concat((value * 100).toFixed(0), "%")}
                  />
                  <recharts_1.Tooltip
                    formatter={(value, name) => [
                      name === "correlation"
                        ? "".concat((value * 100).toFixed(1), "%")
                        : "".concat((value * 100).toFixed(1), "%"),
                      name === "correlation" ? "Correlation" : "Significance",
                    ]}
                  />
                  <recharts_1.Scatter data={riskAnalysis.factorCorrelations} fill="#3B82F6" />
                </recharts_1.ScatterChart>
              </recharts_1.ResponsiveContainer>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="segments" className="space-y-6">
          {/* Patient Risk Profiles List */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.Eye className="h-5 w-5" />
                Individual Risk Profiles
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                {riskProfiles.slice(0, 10).map((profile) => (
                  <card_1.Card
                    key={profile.patientId}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedProfile(profile)}
                  >
                    <card_1.CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <badge_1.Badge
                            className={(0, risk_scoring_1.getRiskLevelColor)(profile.riskLevel)}
                          >
                            {profile.riskLevel}
                          </badge_1.Badge>
                          <span className="font-medium">Patient {profile.patientId.slice(-8)}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">{profile.overallRiskScore}%</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            {(0, risk_scoring_1.getRiskTrendIcon)(profile.riskTrend)}
                            {profile.riskTrend.toLowerCase()}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-5 gap-2 mb-3">
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground">Historical</div>
                          <div className="font-medium">{profile.historicalRisk}%</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground">Behavioral</div>
                          <div className="font-medium">{profile.behavioralRisk}%</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground">Demographic</div>
                          <div className="font-medium">{profile.demographicRisk}%</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground">Communication</div>
                          <div className="font-medium">{profile.communicationRisk}%</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground">Contextual</div>
                          <div className="font-medium">{profile.contextualRisk}%</div>
                        </div>
                      </div>

                      <progress_1.Progress value={profile.overallRiskScore} className="h-2" />

                      {profile.topRiskFactors.length > 0 && (
                        <div className="mt-3 text-xs text-muted-foreground">
                          Top risks:{" "}
                          {profile.topRiskFactors
                            .slice(0, 3)
                            .map((f) => f.factorName)
                            .join(", ")}
                        </div>
                      )}
                    </card_1.CardContent>
                  </card_1.Card>
                ))}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>

      {/* Selected Profile Detail Modal */}
      {selectedProfile && (
        <card_1.Card className="border-primary">
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center justify-between">
              <span>Risk Profile Details</span>
              <button_1.Button variant="outline" size="sm" onClick={() => setSelectedProfile(null)}>
                Close
              </button_1.Button>
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profile Overview */}
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">{selectedProfile.overallRiskScore}%</div>
                  <badge_1.Badge
                    className={(0, risk_scoring_1.getRiskLevelColor)(selectedProfile.riskLevel)}
                    size="lg"
                  >
                    {selectedProfile.riskLevel} RISK
                  </badge_1.Badge>
                  <div className="text-sm text-muted-foreground mt-2">
                    Confidence: {(selectedProfile.confidence * 100).toFixed(0)}%
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Risk Trend:</span>
                    <div className="flex items-center gap-1">
                      {(0, risk_scoring_1.getRiskTrendIcon)(selectedProfile.riskTrend)}
                      <span className="font-medium">{selectedProfile.riskTrend}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Updated:</span>
                    <span className="font-medium">
                      {selectedProfile.lastUpdated.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly History:</span>
                    <span className="font-medium">
                      {selectedProfile.monthlyRiskHistory.length} months
                    </span>
                  </div>
                </div>
              </div>

              {/* Risk Radar Chart */}
              <div>
                <h4 className="font-medium mb-4 text-center">Risk Factor Breakdown</h4>
                <recharts_1.ResponsiveContainer width="100%" height={250}>
                  <recharts_1.RadarChart data={getProfileRadarData(selectedProfile)}>
                    <recharts_1.PolarGrid />
                    <recharts_1.PolarAngleAxis dataKey="factor" />
                    <recharts_1.PolarRadiusAxis domain={[0, 100]} />
                    <recharts_1.Radar
                      name="Risk Score"
                      dataKey="score"
                      stroke="#EF4444"
                      fill="#EF4444"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </recharts_1.RadarChart>
                </recharts_1.ResponsiveContainer>
              </div>
            </div>

            {/* Top Risk Factors */}
            {selectedProfile.topRiskFactors.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium mb-4">Top Risk Factors</h4>
                <div className="space-y-3">
                  {selectedProfile.topRiskFactors.map((factor, index) => (
                    <alert_1.Alert key={index}>
                      <lucide_react_1.AlertTriangle className="h-4 w-4" />
                      <alert_1.AlertDescription>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium">{factor.factorName}</div>
                            <div className="text-sm text-muted-foreground">
                              {factor.description}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">+{factor.contribution.toFixed(1)}%</div>
                            <div className="text-xs text-muted-foreground">
                              Weight: {(factor.weight * 100).toFixed(0)}%
                            </div>
                          </div>
                        </div>
                      </alert_1.AlertDescription>
                    </alert_1.Alert>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Interventions */}
            {selectedProfile.recommendedInterventions.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium mb-4">Recommended Interventions</h4>
                <div className="space-y-2">
                  {selectedProfile.recommendedInterventions.map((intervention, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <span className="text-sm">{intervention}</span>
                      <button_1.Button variant="outline" size="sm">
                        Apply
                      </button_1.Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </card_1.CardContent>
        </card_1.Card>
      )}
    </div>
  );
}

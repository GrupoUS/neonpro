/**
 * Story 11.2: Risk Factors Analysis Component
 * Multi-factor risk analysis with patient behavior patterns and demographic insights
 */

"use client";

import React, { useState, useMemo } from "react";
import type { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Button } from "@/components/ui/button";
import type { Badge } from "@/components/ui/badge";
import type { Progress } from "@/components/ui/progress";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Alert, AlertDescription } from "@/components/ui/alert";
import type {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  LineChart,
  Line,
  Cell,
} from "recharts";
import type {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Users,
  Calendar,
  Clock,
  MapPin,
  Phone,
  MessageSquare,
  Heart,
  Briefcase,
  Home,
  Star,
  Activity,
  Target,
  Zap,
  Eye,
} from "lucide-react";
import type {
  NoShowPrediction,
  PatientRiskProfile,
  RiskFactor,
  RiskFactorCategory,
} from "@/lib/analytics/no-show-prediction";
import type {
  getRiskTrendIcon,
  getRiskLevelColor,
  formatRiskScore,
} from "@/lib/analytics/risk-scoring";

interface RiskFactorsProps {
  riskProfiles: PatientRiskProfile[];
  predictions: NoShowPrediction[];
  onProfileUpdate: () => void;
}

interface RiskAnalysisData {
  categoryBreakdown: Array<{
    category: string;
    avgRisk: number;
    count: number;
    color: string;
    icon: React.ReactNode;
  }>;
  factorCorrelations: Array<{
    factor: string;
    correlation: number;
    significance: number;
    trend: "UP" | "DOWN" | "STABLE";
  }>;
  patientSegments: Array<{
    segment: string;
    count: number;
    avgRisk: number;
    characteristics: string[];
  }>;
  timePatterns: Array<{
    timeframe: string;
    riskIncrease: number;
    frequency: number;
  }>;
  protectiveFactors: Array<{
    factor: string;
    riskReduction: number;
    prevalence: number;
  }>;
}

export function RiskFactors({ riskProfiles, predictions, onProfileUpdate }: RiskFactorsProps) {
  const [selectedProfile, setSelectedProfile] = useState<PatientRiskProfile | null>(null);
  const [analysisView, setAnalysisView] = useState<
    "overview" | "categories" | "correlations" | "segments"
  >("overview");
  const [timeWindow, setTimeWindow] = useState<"7d" | "30d" | "90d">("30d");

  /**
   * Analyze risk factors across all profiles and predictions
   */
  const riskAnalysis = useMemo((): RiskAnalysisData => {
    // Category breakdown analysis
    const categoryData: Record<string, { risks: number[]; count: number }> = {};

    predictions.forEach((prediction) => {
      prediction.factors.forEach((factor) => {
        if (!categoryData[factor.category]) {
          categoryData[factor.category] = { risks: [], count: 0 };
        }
        categoryData[factor.category].risks.push(factor.contribution);
        categoryData[factor.category].count++;
      });
    });

    const categoryBreakdown = Object.entries(categoryData).map(([category, data]) => {
      const avgRisk = data.risks.reduce((sum, risk) => sum + risk, 0) / data.risks.length;

      const categoryConfig = {
        [RiskFactorCategory.PATIENT_HISTORY]: {
          color: "#EF4444",
          icon: <Activity className="h-4 w-4" />,
        },
        [RiskFactorCategory.APPOINTMENT_CHARACTERISTICS]: {
          color: "#F97316",
          icon: <Calendar className="h-4 w-4" />,
        },
        [RiskFactorCategory.DEMOGRAPHICS]: {
          color: "#8B5CF6",
          icon: <Users className="h-4 w-4" />,
        },
        [RiskFactorCategory.EXTERNAL_FACTORS]: {
          color: "#06B6D4",
          icon: <MapPin className="h-4 w-4" />,
        },
        [RiskFactorCategory.COMMUNICATION_PATTERNS]: {
          color: "#10B981",
          icon: <MessageSquare className="h-4 w-4" />,
        },
      };

      return {
        category: category
          .replace(/_/g, " ")
          .toLowerCase()
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        avgRisk: Math.round(avgRisk),
        count: data.count,
        color: categoryConfig[category as RiskFactorCategory]?.color || "#6B7280",
        icon: categoryConfig[category as RiskFactorCategory]?.icon || (
          <Target className="h-4 w-4" />
        ),
      };
    });

    // Factor correlations (mock analysis for now)
    const factorCorrelations = [
      {
        factor: "Historical No-Show Rate",
        correlation: 0.85,
        significance: 0.95,
        trend: "UP" as const,
      },
      {
        factor: "Booking Advance Time",
        correlation: 0.72,
        significance: 0.88,
        trend: "STABLE" as const,
      },
      {
        factor: "Communication Response Rate",
        correlation: -0.68,
        significance: 0.82,
        trend: "DOWN" as const,
      },
      {
        factor: "Weekend Appointment",
        correlation: 0.45,
        significance: 0.75,
        trend: "UP" as const,
      },
      {
        factor: "Distance from Clinic",
        correlation: 0.38,
        significance: 0.68,
        trend: "STABLE" as const,
      },
    ];

    // Patient segments based on risk profiles
    const patientSegments = [
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
    const timePatterns = [
      { timeframe: "Monday Morning", riskIncrease: 25, frequency: 85 },
      { timeframe: "Friday Afternoon", riskIncrease: 35, frequency: 78 },
      { timeframe: "Day After Holiday", riskIncrease: 45, frequency: 65 },
      { timeframe: "Winter Months", riskIncrease: 20, frequency: 92 },
      { timeframe: "End of Month", riskIncrease: 15, frequency: 70 },
    ];

    // Protective factors
    const protectiveFactors = [
      { factor: "High Communication Response", riskReduction: 35, prevalence: 68 },
      { factor: "Consistent Appointment Times", riskReduction: 28, prevalence: 45 },
      { factor: "Family Support", riskReduction: 22, prevalence: 52 },
      { factor: "Close to Clinic", riskReduction: 18, prevalence: 38 },
      { factor: "Insurance Coverage", riskReduction: 15, prevalence: 82 },
    ];

    return {
      categoryBreakdown,
      factorCorrelations,
      patientSegments,
      timePatterns,
      protectiveFactors,
    };
  }, [riskProfiles, predictions]);

  /**
   * Get risk profile details for radar chart
   */
  const getProfileRadarData = (profile: PatientRiskProfile) => {
    return [
      { factor: "Historical", score: profile.historicalRisk, fullMark: 100 },
      { factor: "Behavioral", score: profile.behavioralRisk, fullMark: 100 },
      { factor: "Demographic", score: profile.demographicRisk, fullMark: 100 },
      { factor: "Communication", score: profile.communicationRisk, fullMark: 100 },
      { factor: "Contextual", score: profile.contextualRisk, fullMark: 100 },
    ];
  };

  /**
   * Format trend display
   */
  const formatTrend = (trend: string): { icon: React.ReactNode; color: string } => {
    switch (trend) {
      case "IMPROVING":
        return { icon: <TrendingDown className="h-4 w-4" />, color: "text-green-600" };
      case "DETERIORATING":
        return { icon: <TrendingUp className="h-4 w-4" />, color: "text-red-600" };
      default:
        return { icon: <Target className="h-4 w-4" />, color: "text-gray-600" };
    }
  };

  return (
    <div className="space-y-6">
      {/* Analysis Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Risk Profiles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{riskProfiles.length}</div>
            <div className="text-xs text-muted-foreground">Analyzed patients</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Improving Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {riskProfiles.filter((p) => p.riskTrend === "IMPROVING").length}
            </div>
            <div className="text-xs text-muted-foreground">Patients getting better</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              High Risk Factors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {riskAnalysis.factorCorrelations.filter((f) => f.correlation > 0.7).length}
            </div>
            <div className="text-xs text-muted-foreground">Strong correlations</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Star className="h-4 w-4" />
              Protective Factors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {riskAnalysis.protectiveFactors.length}
            </div>
            <div className="text-xs text-muted-foreground">Risk reduction factors</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analysis Tabs */}
      <Tabs value={analysisView} onValueChange={(value: any) => setAnalysisView(value)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="correlations">Correlations</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Category Breakdown Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Risk Factor Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={riskAnalysis.categoryBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [
                        `${value}%`,
                        name === "avgRisk" ? "Average Risk" : "Count",
                      ]}
                    />
                    <Bar dataKey="avgRisk" name="Average Risk">
                      {riskAnalysis.categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Patient Segments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Patient Risk Segments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {riskAnalysis.patientSegments.map((segment, index) => (
                    <div key={segment.segment} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge
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
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {segment.count} patients
                          </span>
                        </div>
                        <span className="font-medium">{segment.avgRisk}%</span>
                      </div>
                      <Progress value={segment.avgRisk} className="h-2" />
                      <div className="text-xs text-muted-foreground">
                        {segment.characteristics.join(" • ")}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Protective Factors and Time Patterns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Protective Factors
                </CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Time-Based Risk Patterns
                </CardTitle>
              </CardHeader>
              <CardContent>
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
                      <Progress value={pattern.riskIncrease} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          {/* Detailed Category Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {riskAnalysis.categoryBreakdown.map((category) => (
              <Card key={category.category}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    {category.icon}
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Average Risk</span>
                      <span className="font-bold" style={{ color: category.color }}>
                        {category.avgRisk}%
                      </span>
                    </div>
                    <Progress value={category.avgRisk} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      {category.count} total factors analyzed
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Category Details Table */}
          <Card>
            <CardHeader>
              <CardTitle>Category Impact Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={riskAnalysis.categoryBreakdown}
                  layout="horizontal"
                  margin={{ left: 100 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="category" type="category" />
                  <Tooltip formatter={(value) => [`${value}%`, "Average Risk"]} />
                  <Bar dataKey="avgRisk">
                    {riskAnalysis.categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="correlations" className="space-y-6">
          {/* Factor Correlations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Factor Correlations with No-Show Risk
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {riskAnalysis.factorCorrelations.map((correlation, index) => {
                  const trendDisplay = formatTrend(correlation.trend);
                  const isPositive = correlation.correlation > 0;

                  return (
                    <div key={correlation.factor} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{correlation.factor}</span>
                          <div className={`flex items-center gap-1 ${trendDisplay.color}`}>
                            {trendDisplay.icon}
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={`font-medium ${isPositive ? "text-red-600" : "text-green-600"}`}
                          >
                            {correlation.correlation > 0 ? "+" : ""}
                            {(correlation.correlation * 100).toFixed(0)}%
                          </span>
                          <div className="text-xs text-muted-foreground">
                            {(correlation.significance * 100).toFixed(0)}% significant
                          </div>
                        </div>
                      </div>
                      <Progress value={Math.abs(correlation.correlation) * 100} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Correlation Scatter Plot */}
          <Card>
            <CardHeader>
              <CardTitle>Correlation Strength vs. Significance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="correlation"
                    domain={[-1, 1]}
                    tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                  />
                  <YAxis
                    dataKey="significance"
                    domain={[0, 1]}
                    tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      name === "correlation"
                        ? `${(value * 100).toFixed(1)}%`
                        : `${(value * 100).toFixed(1)}%`,
                      name === "correlation" ? "Correlation" : "Significance",
                    ]}
                  />
                  <Scatter data={riskAnalysis.factorCorrelations} fill="#3B82F6" />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="segments" className="space-y-6">
          {/* Patient Risk Profiles List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Individual Risk Profiles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {riskProfiles.slice(0, 10).map((profile) => (
                  <Card
                    key={profile.patientId}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedProfile(profile)}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Badge className={getRiskLevelColor(profile.riskLevel)}>
                            {profile.riskLevel}
                          </Badge>
                          <span className="font-medium">Patient {profile.patientId.slice(-8)}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">{profile.overallRiskScore}%</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            {getRiskTrendIcon(profile.riskTrend)}
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

                      <Progress value={profile.overallRiskScore} className="h-2" />

                      {profile.topRiskFactors.length > 0 && (
                        <div className="mt-3 text-xs text-muted-foreground">
                          Top risks:{" "}
                          {profile.topRiskFactors
                            .slice(0, 3)
                            .map((f) => f.factorName)
                            .join(", ")}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Selected Profile Detail Modal */}
      {selectedProfile && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Risk Profile Details</span>
              <Button variant="outline" size="sm" onClick={() => setSelectedProfile(null)}>
                Close
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profile Overview */}
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">{selectedProfile.overallRiskScore}%</div>
                  <Badge className={getRiskLevelColor(selectedProfile.riskLevel)} size="lg">
                    {selectedProfile.riskLevel} RISK
                  </Badge>
                  <div className="text-sm text-muted-foreground mt-2">
                    Confidence: {(selectedProfile.confidence * 100).toFixed(0)}%
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Risk Trend:</span>
                    <div className="flex items-center gap-1">
                      {getRiskTrendIcon(selectedProfile.riskTrend)}
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
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={getProfileRadarData(selectedProfile)}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="factor" />
                    <PolarRadiusAxis domain={[0, 100]} />
                    <Radar
                      name="Risk Score"
                      dataKey="score"
                      stroke="#EF4444"
                      fill="#EF4444"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Risk Factors */}
            {selectedProfile.topRiskFactors.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium mb-4">Top Risk Factors</h4>
                <div className="space-y-3">
                  {selectedProfile.topRiskFactors.map((factor, index) => (
                    <Alert key={index}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
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
                      </AlertDescription>
                    </Alert>
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
                      <Button variant="outline" size="sm">
                        Apply
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

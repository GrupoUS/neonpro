"use client";

import React, { useState, useEffect } from "react";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Button } from "@/components/ui/button";
import type { Badge } from "@/components/ui/badge";
import type { Progress } from "@/components/ui/progress";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Separator } from "@/components/ui/separator";
import type { ScrollArea } from "@/components/ui/scroll-area";
import type {
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Clock,
  Users,
  DollarSign,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw,
  Download,
  Calendar,
  Award,
  Zap,
  Brain,
  Eye,
  MessageSquare,
  FileText,
  ArrowRight,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import type { format, subDays, startOfMonth, endOfMonth, isToday, isYesterday } from "date-fns";

// Types
interface ExecutiveSummaryData {
  id: string;
  clinicId: string;
  period: {
    from: Date;
    to: Date;
  };
  overallScore: number;
  previousScore: number;
  keyMetrics: KeyMetric[];
  insights: Insight[];
  recommendations: Recommendation[];
  alerts: Alert[];
  achievements: Achievement[];
  trends: Trend[];
  financialSummary: FinancialSummary;
  operationalSummary: OperationalSummary;
  clinicalSummary: ClinicalSummary;
  lastUpdated: Date;
}

interface KeyMetric {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  target: number;
  unit: "currency" | "percentage" | "number" | "duration";
  trend: "up" | "down" | "stable";
  status: "excellent" | "good" | "warning" | "critical";
  impact: "high" | "medium" | "low";
  category: "financial" | "operational" | "clinical" | "satisfaction";
}

interface Insight {
  id: string;
  title: string;
  description: string;
  type: "opportunity" | "risk" | "trend" | "anomaly";
  priority: "high" | "medium" | "low";
  impact: string;
  confidence: number;
  relatedMetrics: string[];
  actionable: boolean;
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: "financial" | "operational" | "clinical" | "strategic";
  priority: "high" | "medium" | "low";
  effort: "low" | "medium" | "high";
  expectedImpact: string;
  timeline: string;
  resources: string[];
  kpis: string[];
}

interface Alert {
  id: string;
  title: string;
  message: string;
  severity: "critical" | "warning" | "info";
  category: string;
  timestamp: Date;
  acknowledged: boolean;
  actionRequired: boolean;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: string;
  value: string;
  date: Date;
  impact: "high" | "medium" | "low";
}

interface Trend {
  id: string;
  metric: string;
  direction: "up" | "down" | "stable";
  magnitude: number;
  duration: string;
  significance: "high" | "medium" | "low";
  description: string;
}

interface FinancialSummary {
  revenue: {
    current: number;
    previous: number;
    target: number;
    growth: number;
  };
  costs: {
    current: number;
    previous: number;
    target: number;
    change: number;
  };
  profit: {
    current: number;
    previous: number;
    margin: number;
  };
  cashFlow: {
    current: number;
    trend: "positive" | "negative" | "stable";
  };
}

interface OperationalSummary {
  efficiency: {
    score: number;
    trend: "up" | "down" | "stable";
  };
  capacity: {
    utilization: number;
    available: number;
  };
  quality: {
    score: number;
    incidents: number;
  };
  staff: {
    productivity: number;
    satisfaction: number;
  };
}

interface ClinicalSummary {
  outcomes: {
    successRate: number;
    improvement: number;
  };
  safety: {
    score: number;
    incidents: number;
  };
  satisfaction: {
    patient: number;
    provider: number;
  };
  compliance: {
    score: number;
    issues: number;
  };
}

interface ExecutiveSummaryProps {
  clinicId: string;
  dateRange: {
    from: Date;
    to: Date;
  };
  className?: string;
  showDetails?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const PRIORITY_CONFIG = {
  high: {
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    label: "High Priority",
  },
  medium: {
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    label: "Medium Priority",
  },
  low: {
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    label: "Low Priority",
  },
};

const STATUS_CONFIG = {
  excellent: { color: "text-green-600", icon: CheckCircle, label: "Excellent" },
  good: { color: "text-blue-600", icon: CheckCircle, label: "Good" },
  warning: { color: "text-yellow-600", icon: AlertTriangle, label: "Warning" },
  critical: { color: "text-red-600", icon: XCircle, label: "Critical" },
};

export function ExecutiveSummary({
  clinicId,
  dateRange,
  className = "",
  showDetails = true,
  autoRefresh = true,
  refreshInterval = 300000, // 5 minutes
}: ExecutiveSummaryProps) {
  const [summaryData, setSummaryData] = useState<ExecutiveSummaryData | null>(null);
  const [selectedTab, setSelectedTab] = useState<
    "overview" | "insights" | "recommendations" | "details"
  >("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Load executive summary data
  useEffect(() => {
    const loadSummaryData = async () => {
      setIsLoading(true);
      try {
        // Simulate API call - replace with actual implementation
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const mockData = generateMockSummaryData(clinicId, dateRange);
        setSummaryData(mockData);
        setLastRefresh(new Date());
      } catch (err) {
        console.error("Failed to load executive summary:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSummaryData();
  }, [clinicId, dateRange]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      const refreshData = async () => {
        try {
          const mockData = generateMockSummaryData(clinicId, dateRange);
          setSummaryData(mockData);
          setLastRefresh(new Date());
        } catch (err) {
          console.error("Failed to refresh summary:", err);
        }
      };

      refreshData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, clinicId, dateRange]);

  // Format value based on unit
  const formatValue = (value: number, unit: string): string => {
    switch (unit) {
      case "currency":
        return new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(value);
      case "percentage":
        return `${value.toFixed(1)}%`;
      case "duration":
        const hours = Math.floor(value / 60);
        const minutes = value % 60;
        return `${hours}h ${minutes}m`;
      default:
        return value.toLocaleString("pt-BR");
    }
  };

  // Get trend icon
  const getTrendIcon = (trend: string, size = "h-4 w-4") => {
    switch (trend) {
      case "up":
        return <TrendingUp className={`${size} text-green-600`} />;
      case "down":
        return <TrendingDown className={`${size} text-red-600`} />;
      default:
        return <Minus className={`${size} text-gray-600`} />;
    }
  };

  // Calculate score change
  const getScoreChange = (current: number, previous: number) => {
    const change = current - previous;
    const percentage = (change / previous) * 100;
    return {
      value: change,
      percentage,
      trend: change > 0 ? "up" : change < 0 ? "down" : "stable",
    };
  };

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const mockData = generateMockSummaryData(clinicId, dateRange);
      setSummaryData(mockData);
      setLastRefresh(new Date());
    } catch (err) {
      console.error("Failed to refresh summary:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Export summary
  const handleExport = () => {
    if (!summaryData) return;

    const exportData = {
      ...summaryData,
      exportedAt: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `executive-summary-${format(new Date(), "yyyy-MM-dd")}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading && !summaryData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Generating executive summary...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summaryData) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Brain className="h-8 w-8 mx-auto mb-4" />
            <p>No summary data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const scoreChange = getScoreChange(summaryData.overallScore, summaryData.previousScore);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Executive Summary
            {isLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
          </CardTitle>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>

            <Button size="sm" variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Last updated: {format(lastRefresh, "HH:mm:ss")}</span>
          <Separator orientation="vertical" className="h-4" />
          <span>
            Period: {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd")}
          </span>
        </div>
      </CardHeader>

      <CardContent>
        {/* Overall Score */}
        <div className="mb-6">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    Overall Performance Score
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-bold text-blue-900">
                      {summaryData.overallScore.toFixed(1)}/10
                    </div>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(scoreChange.trend, "h-6 w-6")}
                      <div className="text-sm">
                        <div
                          className={`font-medium ${
                            scoreChange.trend === "up"
                              ? "text-green-600"
                              : scoreChange.trend === "down"
                                ? "text-red-600"
                                : "text-gray-600"
                          }`}
                        >
                          {scoreChange.value > 0 ? "+" : ""}
                          {scoreChange.value.toFixed(1)}
                        </div>
                        <div className="text-muted-foreground">vs. previous period</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Award className="h-12 w-12 text-blue-600 mb-2" />
                  <Progress value={summaryData.overallScore * 10} className="w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as any)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Target className="h-5 w-5" />
                Key Metrics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {summaryData.keyMetrics.slice(0, 4).map((metric) => {
                  const statusConfig = STATUS_CONFIG[metric.status];
                  const StatusIcon = statusConfig.icon;
                  const change =
                    ((metric.value - metric.previousValue) / metric.previousValue) * 100;

                  return (
                    <Card key={metric.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">{metric.name}</h4>
                          <StatusIcon className={`h-4 w-4 ${statusConfig.color}`} />
                        </div>
                        <div className="text-2xl font-bold mb-1">
                          {formatValue(metric.value, metric.unit)}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          {getTrendIcon(metric.trend)}
                          <span
                            className={`${
                              change > 0
                                ? "text-green-600"
                                : change < 0
                                  ? "text-red-600"
                                  : "text-gray-600"
                            }`}
                          >
                            {change > 0 ? "+" : ""}
                            {change.toFixed(1)}%
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Financial Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Financial
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Revenue</span>
                    <div className="text-right">
                      <div className="font-medium">
                        {formatValue(summaryData.financialSummary.revenue.current, "currency")}
                      </div>
                      <div className="text-xs text-green-600">
                        +{summaryData.financialSummary.revenue.growth.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Profit Margin</span>
                    <div className="font-medium">
                      {summaryData.financialSummary.profit.margin.toFixed(1)}%
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Cash Flow</span>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">
                        {formatValue(summaryData.financialSummary.cashFlow.current, "currency")}
                      </span>
                      {summaryData.financialSummary.cashFlow.trend === "positive" && (
                        <ArrowUp className="h-3 w-3 text-green-600" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Operational Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Operational
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Efficiency</span>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">
                        {summaryData.operationalSummary.efficiency.score.toFixed(1)}%
                      </span>
                      {getTrendIcon(summaryData.operationalSummary.efficiency.trend, "h-3 w-3")}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Capacity Utilization</span>
                    <div className="font-medium">
                      {summaryData.operationalSummary.capacity.utilization.toFixed(1)}%
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Staff Productivity</span>
                    <div className="font-medium">
                      {summaryData.operationalSummary.staff.productivity.toFixed(1)}%
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Clinical Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Clinical
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Success Rate</span>
                    <div className="font-medium">
                      {summaryData.clinicalSummary.outcomes.successRate.toFixed(1)}%
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Patient Satisfaction</span>
                    <div className="font-medium">
                      {summaryData.clinicalSummary.satisfaction.patient.toFixed(1)}/5
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Safety Score</span>
                    <div className="font-medium">
                      {summaryData.clinicalSummary.safety.score.toFixed(1)}%
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Achievements */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Award className="h-5 w-5" />
                Recent Achievements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {summaryData.achievements.slice(0, 4).map((achievement) => (
                  <Card key={achievement.id} className="border-green-200 bg-green-50">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium text-green-900 mb-1">{achievement.title}</h4>
                          <p className="text-sm text-green-700 mb-2">{achievement.description}</p>
                          <div className="flex items-center gap-2 text-xs text-green-600">
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              {achievement.category}
                            </Badge>
                            <span>{format(achievement.date, "MMM dd")}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Key Insights
              </h3>
              <div className="space-y-4">
                {summaryData.insights.map((insight) => {
                  const priorityConfig = PRIORITY_CONFIG[insight.priority];

                  return (
                    <Card
                      key={insight.id}
                      className={`${priorityConfig.borderColor} ${priorityConfig.bgColor}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{insight.title}</h4>
                              <Badge variant="secondary" className="text-xs">
                                {insight.type}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={`text-xs ${priorityConfig.color}`}
                              >
                                {priorityConfig.label}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {insight.description}
                            </p>
                            <p className="text-sm font-medium">{insight.impact}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {insight.confidence}% confidence
                            </div>
                            {insight.actionable && (
                              <Badge variant="secondary" className="mt-1">
                                Actionable
                              </Badge>
                            )}
                          </div>
                        </div>
                        {insight.relatedMetrics.length > 0 && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Related metrics:</span>
                            {insight.relatedMetrics.map((metric, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {metric}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Strategic Recommendations
              </h3>
              <div className="space-y-4">
                {summaryData.recommendations.map((recommendation) => {
                  const priorityConfig = PRIORITY_CONFIG[recommendation.priority];

                  return (
                    <Card key={recommendation.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{recommendation.title}</h4>
                              <Badge variant="secondary" className="text-xs">
                                {recommendation.category}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={`text-xs ${priorityConfig.color}`}
                              >
                                {priorityConfig.label}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {recommendation.description}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Expected Impact:</span>
                                <p className="text-muted-foreground">
                                  {recommendation.expectedImpact}
                                </p>
                              </div>
                              <div>
                                <span className="font-medium">Timeline:</span>
                                <p className="text-muted-foreground">{recommendation.timeline}</p>
                              </div>
                              <div>
                                <span className="font-medium">Effort:</span>
                                <Badge variant="outline" className="ml-1">
                                  {recommendation.effort}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <ArrowRight className="h-5 w-5 text-muted-foreground mt-1" />
                        </div>
                        {recommendation.resources.length > 0 && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Resources needed:</span>
                            {recommendation.resources.map((resource, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {resource}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            {/* Trends */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Key Trends
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {summaryData.trends.map((trend) => (
                  <Card key={trend.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{trend.metric}</h4>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(trend.direction)}
                          <Badge variant="outline" className="text-xs">
                            {trend.significance}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{trend.description}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Duration: {trend.duration}</span>
                        <span>Magnitude: {trend.magnitude.toFixed(1)}%</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Active Alerts */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Active Alerts
              </h3>
              <div className="space-y-2">
                {summaryData.alerts
                  .filter((alert) => !alert.acknowledged)
                  .map((alert) => (
                    <Card
                      key={alert.id}
                      className={`${
                        alert.severity === "critical"
                          ? "border-red-200 bg-red-50"
                          : alert.severity === "warning"
                            ? "border-yellow-200 bg-yellow-50"
                            : "border-blue-200 bg-blue-50"
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{alert.title}</h4>
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  alert.severity === "critical"
                                    ? "text-red-600"
                                    : alert.severity === "warning"
                                      ? "text-yellow-600"
                                      : "text-blue-600"
                                }`}
                              >
                                {alert.severity}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{alert.message}</p>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(alert.timestamp, "HH:mm")}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Helper function to generate mock summary data
function generateMockSummaryData(
  clinicId: string,
  dateRange: { from: Date; to: Date },
): ExecutiveSummaryData {
  return {
    id: `summary-${clinicId}-${Date.now()}`,
    clinicId,
    period: dateRange,
    overallScore: 8.4,
    previousScore: 7.9,
    keyMetrics: [
      {
        id: "revenue",
        name: "Revenue",
        value: 125000,
        previousValue: 118000,
        target: 130000,
        unit: "currency",
        trend: "up",
        status: "good",
        impact: "high",
        category: "financial",
      },
      {
        id: "satisfaction",
        name: "Patient Satisfaction",
        value: 4.7,
        previousValue: 4.5,
        target: 4.8,
        unit: "number",
        trend: "up",
        status: "excellent",
        impact: "high",
        category: "satisfaction",
      },
      {
        id: "efficiency",
        name: "Operational Efficiency",
        value: 87.3,
        previousValue: 84.1,
        target: 90.0,
        unit: "percentage",
        trend: "up",
        status: "good",
        impact: "medium",
        category: "operational",
      },
      {
        id: "wait-time",
        name: "Avg Wait Time",
        value: 18,
        previousValue: 22,
        target: 15,
        unit: "duration",
        trend: "down",
        status: "warning",
        impact: "medium",
        category: "operational",
      },
    ],
    insights: [
      {
        id: "insight-1",
        title: "Revenue Growth Acceleration",
        description:
          "Revenue growth has accelerated by 15% compared to the previous period, driven by increased patient volume and new service offerings.",
        type: "opportunity",
        priority: "high",
        impact: "Potential for 20% revenue increase if trend continues",
        confidence: 85,
        relatedMetrics: ["Revenue", "Patient Volume"],
        actionable: true,
      },
      {
        id: "insight-2",
        title: "Wait Time Improvement Needed",
        description:
          "Despite recent improvements, wait times are still above target. Peak hours show the highest delays.",
        type: "risk",
        priority: "medium",
        impact: "May affect patient satisfaction if not addressed",
        confidence: 78,
        relatedMetrics: ["Wait Time", "Patient Satisfaction"],
        actionable: true,
      },
    ],
    recommendations: [
      {
        id: "rec-1",
        title: "Implement Advanced Scheduling System",
        description:
          "Deploy AI-powered scheduling to optimize appointment distribution and reduce wait times.",
        category: "operational",
        priority: "high",
        effort: "medium",
        expectedImpact: "25% reduction in wait times, 10% increase in patient satisfaction",
        timeline: "2-3 months",
        resources: ["IT Team", "Training Budget"],
        kpis: ["Wait Time", "Patient Satisfaction"],
      },
      {
        id: "rec-2",
        title: "Expand Telehealth Services",
        description: "Increase telehealth capacity to handle routine consultations and follow-ups.",
        category: "strategic",
        priority: "medium",
        effort: "low",
        expectedImpact: "15% increase in capacity, improved patient convenience",
        timeline: "1-2 months",
        resources: ["Technology Platform", "Staff Training"],
        kpis: ["Capacity Utilization", "Patient Satisfaction"],
      },
    ],
    alerts: [
      {
        id: "alert-1",
        title: "Equipment Maintenance Due",
        message: "Critical medical equipment requires scheduled maintenance within 48 hours.",
        severity: "warning",
        category: "maintenance",
        timestamp: new Date(),
        acknowledged: false,
        actionRequired: true,
      },
    ],
    achievements: [
      {
        id: "ach-1",
        title: "Patient Satisfaction Target Exceeded",
        description: "Achieved 4.7/5 patient satisfaction score, exceeding quarterly target.",
        category: "Quality",
        value: "4.7/5",
        date: subDays(new Date(), 2),
        impact: "high",
      },
      {
        id: "ach-2",
        title: "Revenue Growth Milestone",
        description: "Reached highest monthly revenue in clinic history.",
        category: "Financial",
        value: "R$ 125,000",
        date: subDays(new Date(), 5),
        impact: "high",
      },
    ],
    trends: [
      {
        id: "trend-1",
        metric: "Patient Volume",
        direction: "up",
        magnitude: 12.5,
        duration: "3 months",
        significance: "high",
        description: "Steady increase in patient appointments across all departments",
      },
      {
        id: "trend-2",
        metric: "Staff Productivity",
        direction: "up",
        magnitude: 8.3,
        duration: "2 months",
        significance: "medium",
        description: "Improved productivity following new workflow implementation",
      },
    ],
    financialSummary: {
      revenue: {
        current: 125000,
        previous: 118000,
        target: 130000,
        growth: 5.9,
      },
      costs: {
        current: 95000,
        previous: 92000,
        target: 98000,
        change: 3.3,
      },
      profit: {
        current: 30000,
        previous: 26000,
        margin: 24.0,
      },
      cashFlow: {
        current: 45000,
        trend: "positive",
      },
    },
    operationalSummary: {
      efficiency: {
        score: 87.3,
        trend: "up",
      },
      capacity: {
        utilization: 82.5,
        available: 17.5,
      },
      quality: {
        score: 94.2,
        incidents: 2,
      },
      staff: {
        productivity: 91.8,
        satisfaction: 4.3,
      },
    },
    clinicalSummary: {
      outcomes: {
        successRate: 94.2,
        improvement: 2.1,
      },
      safety: {
        score: 98.5,
        incidents: 0,
      },
      satisfaction: {
        patient: 4.7,
        provider: 4.2,
      },
      compliance: {
        score: 96.8,
        issues: 1,
      },
    },
    lastUpdated: new Date(),
  };
}

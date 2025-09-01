// Real-time compliance monitoring dashboard with comprehensive tracking
import { formatDistanceToNow } from "date-fns";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

// UI Components
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Icons
import {
  Accessibility,
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Download,
  FileText,
  Loader2,
  Minus,
  Play,
  RefreshCw,
  Shield,
  TrendingDown,
  TrendingUp,
  UserCheck,
  XCircle,
} from "lucide-react";

// Types and Service
import { ComplianceService } from "./ComplianceService";
import type {
  ComplianceFramework,
  ComplianceScore,
  ComplianceStatus,
  ComplianceTrend,
  ComplianceTrendData,
  ComplianceViolation,
} from "./types";

interface ComplianceDashboardProps {
  data?: unknown;
}

export const ComplianceDashboard: React.FC<ComplianceDashboardProps> = ({
  data,
}) => {
  const [complianceScores, setComplianceScores] = useState<ComplianceScore[]>([]);
  const [violations, setViolations] = useState<ComplianceViolation[]>([]);
  const [trends, setTrends] = useState<Record<string, ComplianceTrendData>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFramework, setSelectedFramework] = useState<ComplianceFramework | "all">("all");
  const [refreshInterval, setRefreshInterval] = useState<number>(30_000); // 30 seconds

  const complianceService = useMemo(() => new ComplianceService(), []);

  // Real-time subscription effect
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const setupRealTimeMonitoring = async () => {
      try {
        setIsLoading(true);

        // Initial data fetch
        const [initialScores, initialViolations] = await Promise.all([
          complianceService.fetchComplianceScores(selectedFramework),
          complianceService.fetchViolations({
            framework: selectedFramework !== "all" ? selectedFramework : undefined,
          }),
        ]);

        setComplianceScores(initialScores);
        setViolations(initialViolations);

        // Load trends for each framework
        const frameworks: ComplianceFramework[] = ["WCAG", "LGPD", "ANVISA", "CFM"];
        const trendsData: Record<string, ComplianceTrendData> = {};

        await Promise.all(
          frameworks.map(async (framework) => {
            if (selectedFramework === "all" || selectedFramework === framework) {
              const trendResult = await complianceService.getComplianceTrends(framework, 7);

              // Transform the result to match ComplianceTrendData interface
              trendsData[framework] = {
                framework,
                data: trendResult, // Use the array directly instead of destructuring
                summary: {
                  averageScore: trendResult.reduce((sum, item) => sum + item.score, 0)
                    / trendResult.length,
                  totalViolations: trendResult.reduce((sum, item) => sum + item.violations, 0),
                  trend: trendResult.length >= 2
                    ? trendResult[trendResult.length - 1].score > trendResult[0].score
                      ? "up"
                      : "down"
                    : "stable",
                },
              };
            }
          }),
        );

        setTrends(trendsData);

        // Set up real-time subscription
        unsubscribe = complianceService.subscribeToUpdates(
          selectedFramework,
          (updatedScores) => {
            setComplianceScores(updatedScores);
          },
        );

        setIsLoading(false);
      } catch (error) {
        console.error("Error setting up compliance monitoring:", error);
        setIsLoading(false);
      }
    };

    setupRealTimeMonitoring();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [selectedFramework, complianceService]);

  // Auto-refresh effect for violations and trends
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const [updatedViolations] = await Promise.all([
          complianceService.fetchViolations({
            framework: selectedFramework !== "all" ? selectedFramework : undefined,
          }),
        ]);
        setViolations(updatedViolations);
      } catch (error) {
        console.error("Error refreshing compliance data:", error);
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [selectedFramework, refreshInterval, complianceService]);

  const getStatusColor = (status: ComplianceStatus): string => {
    const colors = {
      excellent: "bg-green-500",
      good: "bg-blue-500",
      warning: "bg-yellow-500",
      critical: "bg-red-500",
    };
    return colors[status];
  };

  const getStatusIcon = (status: ComplianceStatus) => {
    const icons = {
      excellent: <CheckCircle className="h-5 w-5" />,
      good: <CheckCircle className="h-5 w-5" />,
      warning: <AlertTriangle className="h-5 w-5" />,
      critical: <XCircle className="h-5 w-5" />,
    };
    return icons[status];
  };

  const getTrendIcon = (trend: ComplianceTrend) => {
    if (trend === "up") return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === "down") return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const runManualCheck = async (framework: ComplianceFramework) => {
    try {
      setIsLoading(true);
      await complianceService.runComplianceCheck(framework);
      // Data will be updated automatically via real-time subscription
      toast.success(`${framework} compliance check completed`);
    } catch (error) {
      console.error("Manual check failed:", error);
      toast.error(`Failed to run ${framework} check`);
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      const frameworks: ComplianceFramework[] = selectedFramework === "all"
        ? ["WCAG", "LGPD", "ANVISA", "CFM"]
        : [selectedFramework];

      const result = await complianceService.generateReport(frameworks);
      toast.success("Compliance report generated");
      window.open(result.downloadUrl, "_blank");
    } catch (error) {
      console.error("Report generation failed:", error);
      toast.error("Failed to generate compliance report");
    }
  };

  // Update the onValueChange handler to properly type the value
  const handleFrameworkChange = (value: string) => {
    setSelectedFramework(value as ComplianceFramework | "all");
  };

  if (isLoading && complianceScores.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading compliance data...</span>
      </div>
    );
  }

  return (
    <div className="compliance-dashboard space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Compliance Monitoring Dashboard</h1>
          <p className="text-gray-600 mt-1">Real-time healthcare compliance tracking</p>
        </div>

        <div className="flex items-center gap-4">
          <Select value={selectedFramework} onValueChange={handleFrameworkChange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Frameworks</SelectItem>
              <SelectItem value="WCAG">WCAG Accessibility</SelectItem>
              <SelectItem value="LGPD">LGPD Data Privacy</SelectItem>
              <SelectItem value="ANVISA">ANVISA Healthcare</SelectItem>
              <SelectItem value="CFM">CFM Medical Ethics</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={generateReport} variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>

          <Button onClick={() => window.location.reload()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Real-time Status Indicator */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-800 font-medium">Real-time monitoring active</span>
            <span className="text-green-600 text-sm">
              Last updated: {new Date().toLocaleTimeString()}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {complianceScores.map((score) => (
          <Card key={score.framework} className="relative overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{score.framework}</CardTitle>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    runManualCheck(score.framework)}
                  disabled={isLoading}
                >
                  <Play className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${getStatusColor(score.status)}`}>
                  {getStatusIcon(score.status)}
                </div>

                <div className="flex-1">
                  <div className="text-2xl font-bold">{score.score}%</div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    {getTrendIcon(score.trend)}
                    <span
                      className={score.trend === "up"
                        ? "text-green-600"
                        : score.trend === "down"
                        ? "text-red-600"
                        : "text-gray-600"}
                    >
                      {score.trend === "stable" ? "Stable" : `${Math.abs(score.trendValue)}%`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm">
                <span>{score.violations} violations</span>
                <span className="text-gray-500">
                  {formatDistanceToNow(score.lastUpdated)} ago
                </span>
              </div>

              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${getStatusColor(score.status)}`}
                  style={{ width: `${score.score}%` }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Compliance Trends (7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <BarChart3 className="h-8 w-8 mr-2" />
              <span>Trends visualization would be implemented here with a charting library</span>
            </div>
          </CardContent>
        </Card>

        {/* Active Violations */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Active Violations</CardTitle>
              <Badge variant="secondary">{violations.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {violations.slice(0, 10).map((violation) => (
                  <div key={violation.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div
                      className={`h-2 w-2 rounded-full mt-2 flex-shrink-0 ${
                        violation.severity === "critical"
                          ? "bg-red-500"
                          : violation.severity === "high"
                          ? "bg-orange-500"
                          : violation.severity === "medium"
                          ? "bg-yellow-500"
                          : "bg-blue-500"
                      }`}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {violation.framework}
                        </Badge>
                        <Badge
                          variant={violation.severity === "critical"
                            ? "destructive"
                            : violation.severity === "high"
                            ? "destructive"
                            : violation.severity === "medium"
                            ? "default"
                            : "secondary"}
                        >
                          {violation.severity}
                        </Badge>
                      </div>

                      <p className="text-sm font-medium truncate">
                        {violation.rule}
                      </p>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {violation.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {violation.page} • {formatDistanceToNow(violation.timestamp)} ago
                      </p>
                    </div>
                  </div>
                ))}

                {violations.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                    <p>No active violations found</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => runManualCheck("WCAG")} variant="outline">
              <Accessibility className="h-4 w-4 mr-2" />
              Run WCAG Check
            </Button>

            <Button onClick={() => runManualCheck("LGPD")} variant="outline">
              <Shield className="h-4 w-4 mr-2" />
              Run LGPD Check
            </Button>

            <Button onClick={() => runManualCheck("ANVISA")} variant="outline">
              <Activity className="h-4 w-4 mr-2" />
              Run ANVISA Check
            </Button>

            <Button onClick={() => runManualCheck("CFM")} variant="outline">
              <UserCheck className="h-4 w-4 mr-2" />
              Run CFM Check
            </Button>

            <Button onClick={generateReport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplianceDashboard;

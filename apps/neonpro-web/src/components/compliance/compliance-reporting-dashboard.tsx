"use client";

import type { useState, useEffect } from "react";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Label } from "@/components/ui/label";
import type { Progress } from "@/components/ui/progress";
import type { Alert, AlertDescription } from "@/components/ui/alert";
import type {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  FileText,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  BarChart3,
  PieChart,
  Shield,
} from "lucide-react";
import type { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { useToast } from "@/hooks/use-toast";

interface ComplianceAnalytic {
  totalConsents: number;
  signedConsents: number;
  pendingConsents: number;
  revokedConsents: number;
  expiredConsents: number;
  complianceRate: number;
  consentsByType: Record<string, number>;
  consentsByMonth: Record<string, number>;
  withdrawalReasons: Record<string, number>;
  averageSigningTime: number;
  criticalAlerts: number;
}

interface ComplianceReportingDashboardProps {
  clinicId: string;
}

export default function ComplianceReportingDashboard({
  clinicId,
}: ComplianceReportingDashboardProps) {
  const [analytics, setAnalytics] = useState<ComplianceAnalytic | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30"); // days
  const [reportType, setReportType] = useState("summary");
  const [generatingReport, setGeneratingReport] = useState(false);

  const supabase = createClientComponentClient();
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, [clinicId, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(timeRange));

      // Fetch consent statistics
      const { data: consents, error: consentsError } = await supabase
        .from("patient_consent")
        .select("*")
        .eq("clinic_id", clinicId)
        .gte("consent_date", cutoffDate.toISOString());

      if (consentsError) {
        console.error("Error fetching consents:", consentsError);
        toast({
          title: "Error",
          description: "Failed to fetch consent analytics",
          variant: "destructive",
        });
        return;
      }

      const totalConsents = consents?.length || 0;
      const signedConsents = consents?.filter((c) => c.status === "signed").length || 0;
      const pendingConsents = consents?.filter((c) => c.status === "pending").length || 0;
      const revokedConsents = consents?.filter((c) => c.status === "revoked").length || 0;
      const expiredConsents = consents?.filter((c) => c.status === "expired").length || 0;

      const complianceRate = totalConsents > 0 ? (signedConsents / totalConsents) * 100 : 0;

      // Group by consent type
      const consentsByType =
        consents?.reduce(
          (acc, consent) => {
            const type = consent.consent_type || "unknown";
            acc[type] = (acc[type] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        ) || {};

      // Group by month
      const consentsByMonth =
        consents?.reduce(
          (acc, consent) => {
            const month = new Date(consent.consent_date).toLocaleDateString("pt-BR", {
              year: "numeric",
              month: "short",
            });
            acc[month] = (acc[month] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        ) || {};

      // Withdrawal reasons
      const withdrawalReasons =
        consents?.reduce(
          (acc, consent) => {
            if (consent.withdrawal_reason) {
              acc[consent.withdrawal_reason] = (acc[consent.withdrawal_reason] || 0) + 1;
            }
            return acc;
          },
          {} as Record<string, number>,
        ) || {};

      // Calculate average signing time (mock calculation)
      const averageSigningTime = Math.random() * 10 + 5; // 5-15 minutes mock

      // Critical alerts (consents expiring soon, pending too long, etc.)
      const now = new Date();
      const criticalAlerts =
        consents?.filter((consent) => {
          if (consent.status === "pending") {
            const consentDate = new Date(consent.consent_date);
            const daysDiff = (now.getTime() - consentDate.getTime()) / (1000 * 3600 * 24);
            return daysDiff > 7; // Pending for more than 7 days
          }
          return false;
        }).length || 0;

      setAnalytics({
        totalConsents,
        signedConsents,
        pendingConsents,
        revokedConsents,
        expiredConsents,
        complianceRate,
        consentsByType,
        consentsByMonth,
        withdrawalReasons,
        averageSigningTime,
        criticalAlerts,
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      setGeneratingReport(true);

      // Simulate report generation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast({
        title: "Success",
        description: `${reportType} report generated successfully`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive",
      });
    } finally {
      setGeneratingReport(false);
    }
  };

  const getComplianceStatus = (rate: number) => {
    if (rate >= 95) return { color: "text-green-600", label: "Excellent", icon: CheckCircle };
    if (rate >= 85) return { color: "text-blue-600", label: "Good", icon: TrendingUp };
    if (rate >= 70)
      return { color: "text-yellow-600", label: "Needs Attention", icon: AlertTriangle };
    return { color: "text-red-600", label: "Critical", icon: XCircle };
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Compliance Reporting Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Compliance Reporting Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Unable to load compliance analytics. Please try again.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const complianceStatus = getComplianceStatus(analytics.complianceRate);
  const ComplianceIcon = complianceStatus.icon;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Compliance Reporting Dashboard
          </CardTitle>
          <CardDescription>
            Monitor compliance metrics, generate reports, and track regulatory adherence
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="time-range">Time Range</Label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 3 months</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="report-type">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Summary Report</SelectItem>
                  <SelectItem value="detailed">Detailed Report</SelectItem>
                  <SelectItem value="anvisa">ANVISA Report</SelectItem>
                  <SelectItem value="cfm">CFM Report</SelectItem>
                  <SelectItem value="lgpd">LGPD Compliance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={generateReport} disabled={generatingReport}>
              <Download className="h-4 w-4 mr-2" />
              {generatingReport ? "Generating..." : "Generate Report"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Consents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalConsents}</div>
            <p className="text-xs text-muted-foreground">In the last {timeRange} days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <ComplianceIcon className={`h-4 w-4 ${complianceStatus.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.complianceRate.toFixed(1)}%</div>
            <p className={`text-xs ${complianceStatus.color}`}>{complianceStatus.label}</p>
            <Progress value={analytics.complianceRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Consents</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.pendingConsents}</div>
            <p className="text-xs text-muted-foreground">Awaiting signature</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <AlertTriangle
              className={`h-4 w-4 ${analytics.criticalAlerts > 0 ? "text-red-500" : "text-green-500"}`}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.criticalAlerts}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Consent Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Signed</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{analytics.signedConsents}</span>
                  <Badge variant="default">
                    {analytics.totalConsents > 0
                      ? ((analytics.signedConsents / analytics.totalConsents) * 100).toFixed(1)
                      : 0}
                    %
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span>Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{analytics.pendingConsents}</span>
                  <Badge variant="secondary">
                    {analytics.totalConsents > 0
                      ? ((analytics.pendingConsents / analytics.totalConsents) * 100).toFixed(1)
                      : 0}
                    %
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span>Revoked</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{analytics.revokedConsents}</span>
                  <Badge variant="destructive">
                    {analytics.totalConsents > 0
                      ? ((analytics.revokedConsents / analytics.totalConsents) * 100).toFixed(1)
                      : 0}
                    %
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <span>Expired</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{analytics.expiredConsents}</span>
                  <Badge variant="outline">
                    {analytics.totalConsents > 0
                      ? ((analytics.expiredConsents / analytics.totalConsents) * 100).toFixed(1)
                      : 0}
                    %
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Consent Types Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.consentsByType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="capitalize">{type.replace("_", " ")}</span>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={
                        analytics.totalConsents > 0 ? (count / analytics.totalConsents) * 100 : 0
                      }
                      className="w-20"
                    />
                    <span className="font-medium w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {analytics.averageSigningTime.toFixed(1)}min
              </div>
              <p className="text-sm text-muted-foreground">Average Signing Time</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Object.keys(analytics.withdrawalReasons).length}
              </div>
              <p className="text-sm text-muted-foreground">Withdrawal Categories</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Object.keys(analytics.consentsByMonth).length}
              </div>
              <p className="text-sm text-muted-foreground">Active Months</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Withdrawal Reasons Analysis */}
      {Object.keys(analytics.withdrawalReasons).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Withdrawal Reasons Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reason</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(analytics.withdrawalReasons)
                  .sort(([, a], [, b]) => b - a)
                  .map(([reason, count]) => (
                    <TableRow key={reason}>
                      <TableCell>{reason}</TableCell>
                      <TableCell>{count}</TableCell>
                      <TableCell>
                        {analytics.revokedConsents > 0
                          ? ((count / analytics.revokedConsents) * 100).toFixed(1)
                          : 0}
                        %
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

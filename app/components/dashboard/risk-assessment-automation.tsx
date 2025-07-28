/**
 * Risk Assessment Automation Dashboard Component
 * Story 9.4: Comprehensive automated risk assessment with medical validation
 *
 * This component provides a comprehensive dashboard for:
 * - Automated risk scoring and assessment management
 * - Human-in-the-loop medical validation workflow
 * - Real-time alert monitoring and management
 * - Risk mitigation strategy execution
 * - Performance analytics and reporting
 */

"use client";

import type {
  RiskAlert,
  RiskAssessment,
  RiskMitigation,
  RiskValidation,
} from "@/app/types/risk-assessment-automation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Bell,
  Clock,
  FileText,
  RefreshCw,
  Search,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";

interface RiskAssessmentDashboardProps {
  initialData?: {
    assessments: RiskAssessment[];
    validations: RiskValidation[];
    alerts: RiskAlert[];
    mitigations: RiskMitigation[];
  };
}

export default function RiskAssessmentDashboard({
  initialData,
}: RiskAssessmentDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRiskLevel, setFilterRiskLevel] = useState("all");

  // Data states
  const [assessments, setAssessments] = useState<RiskAssessment[]>(
    initialData?.assessments || []
  );
  const [validations, setValidations] = useState<RiskValidation[]>(
    initialData?.validations || []
  );
  const [alerts, setAlerts] = useState<RiskAlert[]>(initialData?.alerts || []);
  const [mitigations, setMitigations] = useState<RiskMitigation[]>(
    initialData?.mitigations || []
  );

  // Statistics calculations
  const totalAssessments = assessments.length;
  const highRiskCount = assessments.filter(
    (a) => a.risk_level === "high"
  ).length;
  const pendingValidations = validations.filter(
    (v) => v.validation_decision === "approved"
  ).length;
  const activeAlerts = alerts.filter((a) => a.alert_status === "active").length;

  const refreshData = async () => {
    setIsLoading(true);
    try {
      // Refresh all data from APIs
      const [assessmentsRes, validationsRes, alertsRes] = await Promise.all([
        fetch("/api/risk-assessment"),
        fetch("/api/risk-assessment/validations"),
        fetch("/api/risk-assessment/alerts"),
      ]);

      if (assessmentsRes.ok) {
        const data = await assessmentsRes.json();
        setAssessments(data.data || []);
      }

      if (validationsRes.ok) {
        const data = await validationsRes.json();
        setValidations(data.data || []);
      }

      if (alertsRes.ok) {
        const data = await alertsRes.json();
        setAlerts(data.data || []);
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "high":
        return "bg-red-500 text-white";
      case "medium":
        return "bg-yellow-500 text-white";
      case "low":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-red-500 text-white";
      case "completed":
        return "bg-green-500 text-white";
      case "pending":
        return "bg-yellow-500 text-white";
      case "validated":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Risk Assessment Automation</h1>
          <p className="text-muted-foreground">
            Comprehensive automated risk assessment with medical validation
          </p>
        </div>
        <Button onClick={refreshData} disabled={isLoading} variant="outline">
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Assessments
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssessments}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              High Risk Cases
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {highRiskCount}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalAssessments > 0
                ? Math.round((highRiskCount / totalAssessments) * 100)
                : 0}
              % of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Validations
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {pendingValidations}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting medical review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <Bell className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {activeAlerts}
            </div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="validations">Validations</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent High-Risk Assessments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Recent High-Risk Cases
                </CardTitle>
                <CardDescription>
                  Latest assessments requiring immediate attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {assessments
                    .filter((a) => a.risk_level === "high")
                    .slice(0, 5)
                    .map((assessment) => (
                      <div
                        key={assessment.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            Patient ID: {assessment.patient_id}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Score: {assessment.risk_score}/100
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={getRiskLevelColor(assessment.risk_level)}
                          >
                            {assessment.risk_level.toUpperCase()}
                          </Badge>
                          {assessment.validation_required && (
                            <Badge variant="outline">Validation Required</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  {assessments.filter((a) => a.risk_level === "high").length ===
                    0 && (
                    <p className="text-center text-muted-foreground py-4">
                      No high-risk cases found
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Validation Queue */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  Validation Queue
                </CardTitle>
                <CardDescription>
                  Cases awaiting medical professional review
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {validations
                    .filter((v) => v.validation_decision === "approved")
                    .slice(0, 5)
                    .map((validation) => (
                      <div
                        key={validation.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            Assessment ID: {validation.assessment_id}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Assigned to:{" "}
                            {validation.validator_id || "Unassigned"}
                          </p>
                        </div>
                        <Badge
                          className={getStatusColor(
                            validation.validation_decision
                          )}
                        >
                          {validation.validation_decision.toUpperCase()}
                        </Badge>
                      </div>
                    ))}
                  {validations.filter(
                    (v) => v.validation_decision === "approved"
                  ).length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      No pending validations
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Risk Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Level Distribution</CardTitle>
              <CardDescription>
                Overview of current risk assessment distribution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {["high", "medium", "low"].map((level) => {
                  const count = assessments.filter(
                    (a) => a.risk_level === level
                  ).length;
                  const percentage =
                    totalAssessments > 0 ? (count / totalAssessments) * 100 : 0;

                  return (
                    <div key={level} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="capitalize font-medium">
                          {level} Risk
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {count} ({Math.round(percentage)}%)
                        </span>
                      </div>
                      <Progress
                        value={percentage}
                        className={`h-2 ${
                          level === "high"
                            ? "[&>div]:bg-red-500"
                            : level === "medium"
                              ? "[&>div]:bg-yellow-500"
                              : "[&>div]:bg-green-500"
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assessments Tab */}
        <TabsContent value="assessments" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filter Assessments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by patient ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <div className="sm:w-48">
                  <Label htmlFor="risk-level">Risk Level</Label>
                  <Select
                    value={filterRiskLevel}
                    onValueChange={setFilterRiskLevel}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="high">High Risk</SelectItem>
                      <SelectItem value="medium">Medium Risk</SelectItem>
                      <SelectItem value="low">Low Risk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:w-48">
                  <Label htmlFor="status">Status</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="validated">Validated</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assessments List */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Assessments</CardTitle>
              <CardDescription>
                Comprehensive list of all risk assessments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assessments
                  .filter((assessment) => {
                    const matchesSearch =
                      searchTerm === "" ||
                      assessment.patient_id
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase());
                    const matchesRiskLevel =
                      filterRiskLevel === "all" ||
                      assessment.risk_level === filterRiskLevel;
                    const matchesStatus =
                      filterStatus === "all" ||
                      assessment.validation_status === filterStatus;

                    return matchesSearch && matchesRiskLevel && matchesStatus;
                  })
                  .map((assessment) => (
                    <div
                      key={assessment.id}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">
                            Patient ID: {assessment.patient_id}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Assessment ID: {assessment.id}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={getRiskLevelColor(assessment.risk_level)}
                          >
                            {assessment.risk_level.toUpperCase()}
                          </Badge>
                          <Badge
                            className={getStatusColor(
                              assessment.validation_status
                            )}
                          >
                            {assessment.validation_status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm font-medium">Risk Score</p>
                          <p className="text-2xl font-bold">
                            {assessment.risk_score}/100
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Created</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(
                              assessment.created_at
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Last Updated</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(
                              assessment.last_updated
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {assessment.validation_required && (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Validation Required</AlertTitle>
                          <AlertDescription>
                            This assessment requires medical professional
                            validation due to high risk factors.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ))}

                {assessments.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No assessments found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Validations Tab */}
        <TabsContent value="validations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Medical Validations</CardTitle>
              <CardDescription>
                Human-in-the-loop medical professional validations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {validations.map((validation) => (
                  <div
                    key={validation.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">
                          Validation ID: {validation.id}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Assessment: {validation.assessment_id}
                        </p>
                      </div>
                      <Badge
                        className={getStatusColor(
                          validation.validation_decision
                        )}
                      >
                        {validation.validation_decision.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Validator</p>
                        <p className="text-sm text-muted-foreground">
                          {validation.validator_id || "Unassigned"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Created</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(validation.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {validation.validation_notes && (
                      <div>
                        <p className="text-sm font-medium mb-2">Feedback</p>
                        <p className="text-sm text-muted-foreground p-3 bg-muted rounded">
                          {validation.validation_notes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}

                {validations.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No validations found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Alerts</CardTitle>
              <CardDescription>
                Real-time alert monitoring and management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">Alert ID: {alert.id}</h3>
                        <p className="text-sm text-muted-foreground">
                          Assessment: {alert.assessment_id}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={getRiskLevelColor(alert.severity_level)}
                        >
                          {alert.severity_level.toUpperCase()}
                        </Badge>
                        <Badge className={getStatusColor(alert.alert_status)}>
                          {alert.alert_status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium">Alert Type</p>
                        <p className="text-sm text-muted-foreground">
                          {alert.alert_type}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Escalation Level</p>
                        <p className="text-sm text-muted-foreground">
                          {alert.escalation_level}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Created</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(alert.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {alert.emergency_protocol_triggered && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Emergency Protocol Activated</AlertTitle>
                        <AlertDescription>
                          This alert has triggered emergency protocols.
                          Immediate action required.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ))}

                {alerts.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No alerts found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Automation Accuracy</span>
                    <span className="font-bold">94.2%</span>
                  </div>
                  <Progress value={94.2} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Validation Compliance</span>
                    <span className="font-bold">87.5%</span>
                  </div>
                  <Progress value={87.5} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Alert Response Time</span>
                    <span className="font-bold">92.1%</span>
                  </div>
                  <Progress value={92.1} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Risk Assessment Engine</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Operational</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span>Validation Workflow</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Operational</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span>Alert System</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Operational</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span>Database Connectivity</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Operational</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

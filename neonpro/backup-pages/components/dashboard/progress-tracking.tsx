// Story 10.2: Progress Tracking through Computer Vision - Dashboard Component
// React component for progress tracking dashboard

"use client";

import type {
  ProgressAlert,
  ProgressDashboardStats,
  ProgressMilestone,
  ProgressTracking,
  ProgressTrackingFilters,
  ProgressTrendData,
} from "@/app/types/progress-tracking";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  AlertTriangle,
  BarChart3,
  Brain,
  Camera,
  Filter,
  Plus,
  RefreshCw,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Mock data for development
const mockDashboardStats: ProgressDashboardStats = {
  total_trackings: 247,
  active_treatments: 12,
  average_progress: 73.5,
  milestone_achievements: 18,
  pending_validations: 5,
  urgent_alerts: 2,
  predictions_accuracy: 89.2,
  treatment_completion_rate: 76.8,
};

const mockTrendData: ProgressTrendData[] = [
  {
    treatment_type: "acne_treatment",
    treatment_area: "facial",
    progress_points: [
      { date: "2024-01-15", score: 45, confidence: 85 },
      { date: "2024-01-22", score: 52, confidence: 87 },
      { date: "2024-01-29", score: 58, confidence: 90 },
      { date: "2024-02-05", score: 65, confidence: 88 },
      { date: "2024-02-12", score: 73, confidence: 92 },
    ],
    trend_direction: "improving",
  },
  {
    treatment_type: "anti_aging",
    treatment_area: "periorbital",
    progress_points: [
      { date: "2024-01-10", score: 62, confidence: 89 },
      { date: "2024-01-17", score: 64, confidence: 91 },
      { date: "2024-01-24", score: 67, confidence: 88 },
      { date: "2024-01-31", score: 69, confidence: 90 },
      { date: "2024-02-07", score: 72, confidence: 94 },
    ],
    trend_direction: "improving",
  },
];

const mockTrackings: ProgressTracking[] = [
  {
    id: "pt-001",
    patient_id: "patient-123",
    session_id: "session-456",
    tracking_type: "healing",
    tracking_date: "2024-02-12",
    progress_score: 73,
    measurement_data: { area: 150.2, improvement: 23.5 },
    comparison_baseline: "pt-baseline-001",
    treatment_area: "facial",
    treatment_type: "acne_treatment",
    visual_annotations: {},
    confidence_score: 92.5,
    validation_status: "validated",
    validation_notes: "Clear improvement visible",
    created_at: "2024-02-12T09:15:00Z",
    updated_at: "2024-02-12T10:30:00Z",
    created_by: "provider-789",
    updated_by: "provider-789",
  },
];

const mockMilestones: ProgressMilestone[] = [
  {
    id: "pm-001",
    patient_id: "patient-123",
    tracking_id: "pt-001",
    milestone_type: "significant_improvement",
    milestone_name: "25% Improvement Achieved",
    achievement_date: "2024-02-12",
    progress_data: { improvement_percentage: 27.3 },
    threshold_criteria: { min_improvement: 25 },
    achievement_score: 85,
    validation_status: "confirmed",
    validated_by: "provider-789",
    validation_notes: "Significant improvement confirmed",
    alert_sent: true,
    created_at: "2024-02-12T11:00:00Z",
    updated_at: "2024-02-12T11:00:00Z",
    created_by: "system",
    updated_by: "provider-789",
  },
];

const mockAlerts: ProgressAlert[] = [
  {
    id: "pa-001",
    patient_id: "patient-123",
    tracking_id: "pt-001",
    milestone_id: "pm-001",
    alert_type: "milestone_achieved",
    alert_priority: "medium",
    alert_title: "Milestone Achievement",
    alert_message: "Patient has achieved 25% improvement threshold",
    alert_data: { improvement: 27.3 },
    recipient_type: "both",
    is_read: false,
    action_required: false,
    action_taken: false,
    expires_at: "2024-02-19T00:00:00Z",
    created_at: "2024-02-12T11:00:00Z",
    updated_at: "2024-02-12T11:00:00Z",
    created_by: "system",
    updated_by: "system",
  },
];

interface ProgressTrackingDashboardProps {
  className?: string;
}

export function ProgressTrackingDashboard({
  className,
}: ProgressTrackingDashboardProps) {
  // State management
  const [dashboardStats, setDashboardStats] =
    useState<ProgressDashboardStats>(mockDashboardStats);
  const [trendData, setTrendData] =
    useState<ProgressTrendData[]>(mockTrendData);
  const [trackings, setTrackings] = useState<ProgressTracking[]>(mockTrackings);
  const [milestones, setMilestones] =
    useState<ProgressMilestone[]>(mockMilestones);
  const [alerts, setAlerts] = useState<ProgressAlert[]>(mockAlerts);
  const [selectedPatient, setSelectedPatient] = useState<string>("all");
  const [selectedTreatmentType, setSelectedTreatmentType] =
    useState<string>("all");
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("30d");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Filter states
  const [filters, setFilters] = useState<ProgressTrackingFilters>({
    page: 1,
    limit: 20,
  });

  // Load dashboard data
  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, fetch from API
      // const stats = await fetch('/api/progress-analytics?type=dashboard_stats').then(r => r.json());
      // setDashboardStats(stats);

      // For demo, use mock data
      setDashboardStats(mockDashboardStats);
      setTrendData(mockTrendData);
      setTrackings(mockTrackings);
      setMilestones(mockMilestones);
      setAlerts(mockAlerts);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
  }, [selectedPatient, selectedTreatmentType, selectedTimeRange]);

  // Handle create new tracking session
  const handleCreateSession = () => {
    toast.info("New tracking session creation coming soon");
  };

  // Handle refresh data
  const handleRefresh = () => {
    loadDashboardData();
    toast.success("Data refreshed successfully");
  };

  // Handle alert actions
  const handleMarkAlertRead = async (alertId: string) => {
    try {
      // In real implementation: await fetch(`/api/alerts/${alertId}?action=mark_read`, { method: 'PATCH' });
      setAlerts((prev) =>
        prev.map((alert) =>
          alert.id === alertId
            ? { ...alert, is_read: true, read_at: new Date().toISOString() }
            : alert
        )
      );
      toast.success("Alert marked as read");
    } catch (error) {
      toast.error("Failed to update alert");
    }
  };

  // Get trend direction icon
  const getTrendIcon = (direction: ProgressTrendData["trend_direction"]) => {
    switch (direction) {
      case "improving":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "declining":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case "stable":
        return <Activity className="w-4 h-4 text-blue-500" />;
      case "mixed":
        return <BarChart3 className="w-4 h-4 text-orange-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  // Get priority badge color
  const getPriorityColor = (priority: ProgressAlert["alert_priority"]) => {
    switch (priority) {
      case "urgent":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "secondary";
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Progress Tracking
          </h1>
          <p className="text-gray-600 mt-1">
            Computer vision-powered treatment progress monitoring
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleCreateSession} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Session
          </Button>
        </div>
      </div>

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select patient" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Patients</SelectItem>
                <SelectItem value="patient-123">Patient #123</SelectItem>
                <SelectItem value="patient-456">Patient #456</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={selectedTreatmentType}
              onValueChange={setSelectedTreatmentType}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Treatment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Treatments</SelectItem>
                <SelectItem value="acne_treatment">Acne Treatment</SelectItem>
                <SelectItem value="anti_aging">Anti-Aging</SelectItem>
                <SelectItem value="skin_resurfacing">
                  Skin Resurfacing
                </SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={selectedTimeRange}
              onValueChange={setSelectedTimeRange}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tracking">Tracking</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Trackings
                </CardTitle>
                <Camera className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardStats.total_trackings}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all treatments
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Treatments
                </CardTitle>
                <Activity className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardStats.active_treatments}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently monitoring
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Progress
                </CardTitle>
                <Target className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardStats.average_progress}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Overall improvement
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Predictions Accuracy
                </CardTitle>
                <Brain className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardStats.predictions_accuracy}%
                </div>
                <p className="text-xs text-muted-foreground">
                  AI model accuracy
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Treatment Trends
              </CardTitle>
              <CardDescription>
                Progress trends across different treatment types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trendData.map((trend, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getTrendIcon(trend.trend_direction)}
                      <div>
                        <p className="font-medium capitalize">
                          {trend.treatment_type.replace("_", " ")} -{" "}
                          {trend.treatment_area}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {trend.progress_points.length} tracking points
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {
                          trend.progress_points[
                            trend.progress_points.length - 1
                          ]?.score
                        }
                        %
                      </p>
                      <Badge
                        variant={
                          trend.trend_direction === "improving"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {trend.trend_direction}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Recent Alerts
              </CardTitle>
              <CardDescription>
                Latest progress tracking alerts requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.slice(0, 3).map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          alert.is_read ? "bg-gray-300" : "bg-blue-500"
                        }`}
                      />
                      <div>
                        <p className="font-medium">{alert.alert_title}</p>
                        <p className="text-sm text-muted-foreground">
                          {alert.alert_message}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getPriorityColor(alert.alert_priority)}>
                        {alert.alert_priority}
                      </Badge>
                      {!alert.is_read && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAlertRead(alert.id)}
                        >
                          Mark Read
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tabs would be implemented similarly */}
        <TabsContent value="tracking">
          <Card>
            <CardHeader>
              <CardTitle>Progress Tracking Sessions</CardTitle>
              <CardDescription>
                Detailed view of all progress tracking sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Tracking sessions table will be implemented here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="milestones">
          <Card>
            <CardHeader>
              <CardTitle>Progress Milestones</CardTitle>
              <CardDescription>
                Treatment milestones and achievements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Milestones management will be implemented here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Progress Alerts</CardTitle>
              <CardDescription>
                Manage progress tracking alerts and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Alerts management will be implemented here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Analytics</CardTitle>
              <CardDescription>
                Deep insights and analytics for progress tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Advanced analytics will be implemented here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ProgressTrackingDashboard;

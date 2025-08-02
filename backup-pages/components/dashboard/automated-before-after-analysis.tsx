// app/components/dashboard/automated-before-after-analysis.tsx
// Dashboard component for Story 10.1: Automated Before/After Analysis

"use client";

import type {
  AccuracyMetrics,
  AnalysisDashboardStats,
  AnalysisProgressResponse,
  BeforeAfterPhotoPair,
  CreateAnalysisSessionRequest,
  CreatePhotoPairRequest,
  PhotoAnalysisSession,
  ProcessingMetrics,
  QualityMetrics,
} from "@/app/types/automated-before-after-analysis";
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  Camera,
  CheckCircle,
  Clock,
  FileText,
  Monitor,
  Play,
  Settings,
  Target,
  TrendingUp,
  Upload,
  Users,
  XCircle,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface AutomatedBeforeAfterAnalysisProps {
  patientId?: string;
  initialData?: any;
}

export function AutomatedBeforeAfterAnalysis({
  patientId,
  initialData,
}: AutomatedBeforeAfterAnalysisProps) {
  // State management
  const [activeTab, setActiveTab] = useState("overview");
  const [sessions, setSessions] = useState<PhotoAnalysisSession[]>([]);
  const [photoPairs, setPhotoPairs] = useState<BeforeAfterPhotoPair[]>([]);
  const [selectedSession, setSelectedSession] =
    useState<PhotoAnalysisSession | null>(null);
  const [dashboardStats, setDashboardStats] =
    useState<AnalysisDashboardStats | null>(null);
  const [accuracyMetrics, setAccuracyMetrics] =
    useState<AccuracyMetrics | null>(null);
  const [processingMetrics, setProcessingMetrics] =
    useState<ProcessingMetrics | null>(null);
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetrics | null>(
    null
  );
  const [analysisProgress, setAnalysisProgress] = useState<
    Record<string, AnalysisProgressResponse>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form states
  const [newSessionForm, setNewSessionForm] =
    useState<CreateAnalysisSessionRequest>({
      patient_id: patientId || "",
      treatment_type: "",
      session_name: "",
      analysis_type: "before_after",
    });

  const [newPhotoPairForm, setNewPhotoPairForm] =
    useState<CreatePhotoPairRequest>({
      session_id: "",
      before_photo_id: "",
      after_photo_id: "",
      treatment_area: "",
      pair_type: "frontal",
      time_between_days: 0,
    });

  // Load initial data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        loadAnalysisSessions(),
        loadDashboardStats(),
        loadAccuracyMetrics(),
        loadProcessingMetrics(),
        loadQualityMetrics(),
      ]);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const loadAnalysisSessions = async () => {
    try {
      const filters = patientId ? { patient_id: patientId } : {};
      const response = await fetch(
        `/api/automated-analysis?${new URLSearchParams(filters)}`
      );
      const data = await response.json();

      if (data.success) {
        setSessions(data.data);
      }
    } catch (error) {
      console.error("Error loading analysis sessions:", error);
    }
  };

  const loadPhotoPairs = async (sessionId: string) => {
    try {
      const response = await fetch(
        `/api/automated-analysis/photo-pairs?session_id=${sessionId}`
      );
      const data = await response.json();

      if (data.success) {
        setPhotoPairs(data.data);
      }
    } catch (error) {
      console.error("Error loading photo pairs:", error);
    }
  };

  const loadDashboardStats = async () => {
    try {
      // Mock data - in real implementation, would call actual API
      setDashboardStats({
        total_sessions: 45,
        completed_sessions: 38,
        average_accuracy: 95.2,
        average_processing_time: 25.8,
        total_photo_pairs: 127,
        analyzed_pairs: 115,
        pending_validations: 8,
        recent_activity: sessions.slice(0, 5),
      });
    } catch (error) {
      console.error("Error loading dashboard stats:", error);
    }
  };

  const loadAccuracyMetrics = async () => {
    try {
      // Mock data - in real implementation, would call actual API
      setAccuracyMetrics({
        overall_accuracy: 95.2,
        accuracy_by_treatment_area: {
          facial_full: 96.1,
          body_abdomen: 93.8,
          facial_upper: 97.2,
        },
        accuracy_by_engine: {
          primary_cv_engine: 95.2,
        },
        accuracy_trend: [
          { date: "2025-01-20", accuracy: 94.5 },
          { date: "2025-01-21", accuracy: 95.1 },
          { date: "2025-01-22", accuracy: 95.2 },
        ],
        confidence_distribution: {
          high: 75,
          medium: 20,
          low: 5,
        },
      });
    } catch (error) {
      console.error("Error loading accuracy metrics:", error);
    }
  };

  const loadProcessingMetrics = async () => {
    try {
      // Mock data - in real implementation, would call actual API
      setProcessingMetrics({
        average_processing_time: 25800,
        processing_time_by_area: {
          facial_full: 25000,
          body_abdomen: 35000,
          facial_upper: 20000,
        },
        processing_time_trend: [
          { date: "2025-01-20", time_ms: 28000 },
          { date: "2025-01-21", time_ms: 26000 },
          { date: "2025-01-22", time_ms: 25800 },
        ],
        queue_statistics: {
          pending: 3,
          processing: 2,
          completed_today: 12,
        },
      });
    } catch (error) {
      console.error("Error loading processing metrics:", error);
    }
  };

  const loadQualityMetrics = async () => {
    try {
      // Mock data - in real implementation, would call actual API
      setQualityMetrics({
        validation_success_rate: 92.5,
        manual_review_rate: 7.5,
        accuracy_validation_results: {
          approved: 85,
          rejected: 8,
          needs_review: 7,
        },
        quality_score_distribution: {
          excellent: 60,
          good: 30,
          fair: 8,
          poor: 2,
        },
        improvement_validation: {
          accurate_predictions: 88,
          false_positives: 7,
          false_negatives: 5,
        },
      });
    } catch (error) {
      console.error("Error loading quality metrics:", error);
    }
  };

  const createAnalysisSession = async () => {
    try {
      setIsProcessing(true);
      const response = await fetch("/api/automated-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSessionForm),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Analysis session created successfully");
        await loadAnalysisSessions();
        setNewSessionForm({
          patient_id: patientId || "",
          treatment_type: "",
          session_name: "",
          analysis_type: "before_after",
        });
      } else {
        toast.error(data.error || "Failed to create analysis session");
      }
    } catch (error) {
      console.error("Error creating analysis session:", error);
      toast.error("Failed to create analysis session");
    } finally {
      setIsProcessing(false);
    }
  };

  const createPhotoPair = async () => {
    try {
      setIsProcessing(true);
      const response = await fetch("/api/automated-analysis/photo-pairs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPhotoPairForm),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Photo pair created successfully");
        if (selectedSession) {
          await loadPhotoPairs(selectedSession.id);
        }
        setNewPhotoPairForm({
          session_id: "",
          before_photo_id: "",
          after_photo_id: "",
          treatment_area: "",
          pair_type: "frontal",
          time_between_days: 0,
        });
      } else {
        toast.error(data.error || "Failed to create photo pair");
      }
    } catch (error) {
      console.error("Error creating photo pair:", error);
      toast.error("Failed to create photo pair");
    } finally {
      setIsProcessing(false);
    }
  };

  const startAnalysis = async (sessionId: string) => {
    try {
      setIsProcessing(true);
      const response = await fetch("/api/automated-analysis/processing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start_analysis",
          session_id: sessionId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Analysis started successfully");
        setAnalysisProgress((prev) => ({
          ...prev,
          [sessionId]: data.data,
        }));
        await loadAnalysisSessions();
      } else {
        toast.error(data.error || "Failed to start analysis");
      }
    } catch (error) {
      console.error("Error starting analysis:", error);
      toast.error("Failed to start analysis");
    } finally {
      setIsProcessing(false);
    }
  };

  const generateReport = async (sessionId: string, reportType: string) => {
    try {
      setIsProcessing(true);
      const response = await fetch("/api/automated-analysis/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          report_type: reportType,
          export_format: "html",
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Report generated successfully");
      } else {
        toast.error(data.error || "Failed to generate report");
      }
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report");
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "processing":
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      completed: "default",
      processing: "secondary",
      failed: "destructive",
      pending: "outline",
    };

    return (
      <Badge variant={variants[status] || "outline"}>
        {getStatusIcon(status)}
        <span className="ml-1 capitalize">{status}</span>
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Automated Before/After Analysis
          </h1>
          <p className="text-muted-foreground">
            AI-powered photo analysis with ≥95% accuracy and &lt;30s processing
            time
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setActiveTab("sessions")}>
            <Camera className="h-4 w-4 mr-2" />
            New Session
          </Button>
          <Button variant="outline" onClick={loadDashboardData}>
            <Monitor className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Dashboard Stats Cards */}
      {dashboardStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Sessions
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardStats.total_sessions}
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboardStats.completed_sessions} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Accuracy
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardStats.average_accuracy.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">Above 95% target</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Processing Time
              </CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardStats.average_processing_time.toFixed(1)}s
              </div>
              <p className="text-xs text-muted-foreground">Under 30s target</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Photo Pairs</CardTitle>
              <Camera className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardStats.analyzed_pairs}/
                {dashboardStats.total_photo_pairs}
              </div>
              <p className="text-xs text-muted-foreground">Analyzed pairs</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Accuracy Metrics */}
            {accuracyMetrics && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Accuracy Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Overall Accuracy</span>
                      <span>
                        {accuracyMetrics.overall_accuracy.toFixed(1)}%
                      </span>
                    </div>
                    <Progress
                      value={accuracyMetrics.overall_accuracy}
                      className="h-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">By Treatment Area</h4>
                    {Object.entries(
                      accuracyMetrics.accuracy_by_treatment_area
                    ).map(([area, accuracy]) => (
                      <div key={area} className="flex justify-between text-sm">
                        <span className="capitalize">
                          {area.replace("_", " ")}
                        </span>
                        <span>{accuracy.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Processing Metrics */}
            {processingMetrics && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Processing Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-2xl font-bold">
                      {(
                        processingMetrics.average_processing_time / 1000
                      ).toFixed(1)}
                      s
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Average processing time
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Queue Status</h4>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-yellow-50 rounded-lg">
                        <div className="text-lg font-semibold text-yellow-600">
                          {processingMetrics.queue_statistics.pending}
                        </div>
                        <div className="text-xs text-yellow-600">Pending</div>
                      </div>
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <div className="text-lg font-semibold text-blue-600">
                          {processingMetrics.queue_statistics.processing}
                        </div>
                        <div className="text-xs text-blue-600">Processing</div>
                      </div>
                      <div className="p-2 bg-green-50 rounded-lg">
                        <div className="text-lg font-semibold text-green-600">
                          {processingMetrics.queue_statistics.completed_today}
                        </div>
                        <div className="text-xs text-green-600">Completed</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sessions.slice(0, 5).map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(session.status)}
                      <div>
                        <p className="font-medium">
                          {session.session_name || "Unnamed Session"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {session.treatment_type} • {session.total_photos}{" "}
                          photos
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(session.status)}
                      {session.accuracy_score && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {session.accuracy_score.toFixed(1)}% accuracy
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create New Session */}
            <Card>
              <CardHeader>
                <CardTitle>Create Analysis Session</CardTitle>
                <CardDescription>
                  Start a new before/after photo analysis session
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="session-name">Session Name</Label>
                  <Input
                    id="session-name"
                    value={newSessionForm.session_name}
                    onChange={(e) =>
                      setNewSessionForm((prev) => ({
                        ...prev,
                        session_name: e.target.value,
                      }))
                    }
                    placeholder="Enter session name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="treatment-type">Treatment Type</Label>
                  <Input
                    id="treatment-type"
                    value={newSessionForm.treatment_type}
                    onChange={(e) =>
                      setNewSessionForm((prev) => ({
                        ...prev,
                        treatment_type: e.target.value,
                      }))
                    }
                    placeholder="e.g., Facial rejuvenation, Body contouring"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="analysis-type">Analysis Type</Label>
                  <Select
                    value={newSessionForm.analysis_type}
                    onValueChange={(value: any) =>
                      setNewSessionForm((prev) => ({
                        ...prev,
                        analysis_type: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="before_after">
                        Before/After Comparison
                      </SelectItem>
                      <SelectItem value="progress_tracking">
                        Progress Tracking
                      </SelectItem>
                      <SelectItem value="treatment_validation">
                        Treatment Validation
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={createAnalysisSession}
                  disabled={isProcessing}
                  className="w-full"
                >
                  {isProcessing ? "Creating..." : "Create Session"}
                </Button>
              </CardContent>
            </Card>

            {/* Sessions List */}
            <Card>
              <CardHeader>
                <CardTitle>Analysis Sessions</CardTitle>
                <CardDescription>
                  Manage your photo analysis sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedSession?.id === session.id
                          ? "bg-primary/10 border-primary"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => {
                        setSelectedSession(session);
                        loadPhotoPairs(session.id);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {session.session_name || "Unnamed Session"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {session.treatment_type} •{" "}
                            {session.processed_photos}/{session.total_photos}{" "}
                            processed
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(session.status)}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              startAnalysis(session.id);
                            }}
                            disabled={
                              session.status === "processing" || isProcessing
                            }
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {analysisProgress[session.id] && (
                        <div className="mt-2">
                          <Progress
                            value={
                              analysisProgress[session.id].progress_percentage
                            }
                            className="h-2"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            {analysisProgress[
                              session.id
                            ].progress_percentage.toFixed(0)}
                            % complete
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-4">
          {selectedSession ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Photo Pairs */}
              <Card>
                <CardHeader>
                  <CardTitle>Photo Pairs</CardTitle>
                  <CardDescription>
                    Manage before/after photo pairs for analysis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Add New Photo Pair Form */}
                  <div className="p-4 border rounded-lg space-y-3">
                    <h4 className="font-medium">Add Photo Pair</h4>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Pair Type</Label>
                        <Select
                          value={newPhotoPairForm.pair_type}
                          onValueChange={(value: any) =>
                            setNewPhotoPairForm((prev) => ({
                              ...prev,
                              pair_type: value,
                            }))
                          }
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="frontal">Frontal</SelectItem>
                            <SelectItem value="profile">Profile</SelectItem>
                            <SelectItem value="close_up">Close Up</SelectItem>
                            <SelectItem value="full_body">Full Body</SelectItem>
                            <SelectItem value="specific_area">
                              Specific Area
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Treatment Area</Label>
                        <Input
                          className="h-8"
                          value={newPhotoPairForm.treatment_area}
                          onChange={(e) =>
                            setNewPhotoPairForm((prev) => ({
                              ...prev,
                              treatment_area: e.target.value,
                            }))
                          }
                          placeholder="e.g., Face, Abdomen"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Time Between (Days)</Label>
                      <Input
                        type="number"
                        className="h-8"
                        value={newPhotoPairForm.time_between_days}
                        onChange={(e) =>
                          setNewPhotoPairForm((prev) => ({
                            ...prev,
                            time_between_days: Number(e.target.value),
                          }))
                        }
                        placeholder="Days between photos"
                      />
                    </div>

                    <Button
                      size="sm"
                      onClick={() => {
                        setNewPhotoPairForm((prev) => ({
                          ...prev,
                          session_id: selectedSession.id,
                        }));
                        createPhotoPair();
                      }}
                      disabled={isProcessing}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Add Pair
                    </Button>
                  </div>

                  {/* Photo Pairs List */}
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {photoPairs.map((pair) => (
                      <div
                        key={pair.id}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <div>
                          <p className="text-sm font-medium capitalize">
                            {pair.pair_type}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {pair.treatment_area} • {pair.time_between_days}{" "}
                            days apart
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(pair.analysis_status)}
                          {pair.improvement_percentage && (
                            <Badge variant="outline">
                              {pair.improvement_percentage.toFixed(1)}%
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Analysis Results */}
              <Card>
                <CardHeader>
                  <CardTitle>Analysis Results</CardTitle>
                  <CardDescription>
                    View results and generate reports
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">
                        {selectedSession.accuracy_score?.toFixed(1) || "--"}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Accuracy
                      </div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">
                        {selectedSession.processing_time_seconds?.toFixed(1) ||
                          "--"}
                        s
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Processing
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        generateReport(selectedSession.id, "summary")
                      }
                      disabled={isProcessing}
                      className="w-full"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Summary Report
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        generateReport(selectedSession.id, "detailed")
                      }
                      disabled={isProcessing}
                      className="w-full"
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Generate Detailed Report
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        generateReport(
                          selectedSession.id,
                          "patient_consultation"
                        )
                      }
                      disabled={isProcessing}
                      className="w-full"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Patient Consultation Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">No Session Selected</p>
                  <p className="text-muted-foreground">
                    Select a session from the Sessions tab to view analysis
                    details
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analysis Reports</CardTitle>
              <CardDescription>
                View and download generated analysis reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">No Reports Available</p>
                <p className="text-muted-foreground">
                  Generate reports from analysis sessions to view them here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quality Tab */}
        <TabsContent value="quality" className="space-y-4">
          {qualityMetrics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Validation Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Success Rate</span>
                      <span>{qualityMetrics.validation_success_rate}%</span>
                    </div>
                    <Progress
                      value={qualityMetrics.validation_success_rate}
                      className="h-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Validation Status</h4>
                    {Object.entries(
                      qualityMetrics.accuracy_validation_results
                    ).map(([status, count]) => (
                      <div
                        key={status}
                        className="flex justify-between text-sm"
                      >
                        <span className="capitalize">
                          {status.replace("_", " ")}
                        </span>
                        <span>{count}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quality Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(
                    qualityMetrics.quality_score_distribution
                  ).map(([quality, percentage]) => (
                    <div key={quality}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize">{quality}</span>
                        <span>{percentage}%</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analysis Engine Settings</CardTitle>
              <CardDescription>
                Configure computer vision analysis parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Accuracy Threshold (%)</Label>
                <Input type="number" defaultValue="95" min="80" max="100" />
              </div>

              <div className="space-y-2">
                <Label>Processing Timeout (seconds)</Label>
                <Input type="number" defaultValue="30" min="10" max="300" />
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="auto-validation" />
                <Label htmlFor="auto-validation">
                  Enable automatic quality validation
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="real-time-updates" />
                <Label htmlFor="real-time-updates">
                  Real-time progress updates
                </Label>
              </div>

              <Button className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

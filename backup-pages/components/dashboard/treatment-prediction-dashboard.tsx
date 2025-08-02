"use client";

// Treatment Success Prediction Dashboard Component
// Advanced AI-powered treatment prediction with comprehensive analytics
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  BarChart3,
  Brain,
  CheckCircle,
  Eye,
  Filter,
  PieChart,
  RefreshCw,
  Search,
  Shield,
  Stethoscope,
  Target,
  TrendingUp,
  User,
  XCircle,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface TreatmentPredictionDashboardProps {
  className?: string;
}

interface PredictionModel {
  id: string;
  name: string;
  version: string;
  accuracy: number;
  status: "active" | "training" | "archived";
  algorithm_type: string;
  created_at: string;
}

interface TreatmentPrediction {
  id: string;
  patient_id: string;
  treatment_type: string;
  prediction_score: number;
  confidence_interval: {
    lower: number;
    upper: number;
    confidence_level: number;
  };
  risk_assessment: "low" | "medium" | "high";
  predicted_outcome: "success" | "partial_success" | "failure";
  prediction_date: string;
  actual_outcome?: string;
  accuracy_validated: boolean;
  patients?: {
    name: string;
    email: string;
  };
}

interface PredictionRequest {
  patient_id: string;
  treatment_type: string;
  include_alternatives?: boolean;
}

interface Analytics {
  total_predictions: number;
  validated_predictions: number;
  average_prediction_score: number;
  risk_distribution: {
    low: number;
    medium: number;
    high: number;
  };
  outcome_distribution: {
    success: number;
    partial_success: number;
    failure: number;
  };
  treatment_type_distribution: Record<string, number>;
  model_accuracy: number;
}

export function TreatmentPredictionDashboard({
  className = "",
}: TreatmentPredictionDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [models, setModels] = useState<PredictionModel[]>([]);
  const [predictions, setPredictions] = useState<TreatmentPrediction[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [patients, setPatients] = useState<any[]>([]);

  // Form states
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedTreatmentType, setSelectedTreatmentType] = useState("");
  const [newPredictionLoading, setNewPredictionLoading] = useState(false);

  // Filter states
  const [filterRisk, setFilterRisk] = useState("");
  const [filterTreatment, setFilterTreatment] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Load initial data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadModels(),
        loadPredictions(),
        loadAnalytics(),
        loadPatients(),
      ]);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const loadModels = async () => {
    try {
      const response = await fetch("/api/treatment-prediction/models");
      if (!response.ok) throw new Error("Failed to fetch models");
      const data = await response.json();
      setModels(data.models || []);
    } catch (error) {
      console.error("Error loading models:", error);
    }
  };

  const loadPredictions = async () => {
    try {
      const response = await fetch(
        "/api/treatment-prediction/predictions?limit=50"
      );
      if (!response.ok) throw new Error("Failed to fetch predictions");
      const data = await response.json();
      setPredictions(data.predictions || []);
    } catch (error) {
      console.error("Error loading predictions:", error);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await fetch("/api/treatment-prediction/analytics");
      if (!response.ok) throw new Error("Failed to fetch analytics");
      const data = await response.json();
      setAnalytics(data.analytics);
    } catch (error) {
      console.error("Error loading analytics:", error);
    }
  };

  const loadPatients = async () => {
    try {
      const response = await fetch("/api/patients?limit=100");
      if (!response.ok) throw new Error("Failed to fetch patients");
      const data = await response.json();
      setPatients(data.patients || []);
    } catch (error) {
      console.error("Error loading patients:", error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
    toast.success("Dashboard data refreshed");
  };

  const generatePrediction = async () => {
    if (!selectedPatientId || !selectedTreatmentType) {
      toast.error("Please select both patient and treatment type");
      return;
    }

    setNewPredictionLoading(true);
    try {
      const predictionRequest: PredictionRequest = {
        patient_id: selectedPatientId,
        treatment_type: selectedTreatmentType,
        include_alternatives: true,
      };

      const response = await fetch("/api/treatment-prediction/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(predictionRequest),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate prediction");
      }

      const data = await response.json();
      toast.success("Treatment prediction generated successfully");

      // Refresh predictions and analytics
      await Promise.all([loadPredictions(), loadAnalytics()]);

      // Reset form
      setSelectedPatientId("");
      setSelectedTreatmentType("");
    } catch (error) {
      console.error("Error generating prediction:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to generate prediction"
      );
    } finally {
      setNewPredictionLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "partial_success":
        return <Activity className="h-4 w-4 text-yellow-600" />;
      case "failure":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Eye className="h-4 w-4 text-gray-600" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "text-green-600";
    if (score >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  const filteredPredictions = predictions.filter((prediction) => {
    const matchesRisk =
      !filterRisk || prediction.risk_assessment === filterRisk;
    const matchesTreatment =
      !filterTreatment || prediction.treatment_type.includes(filterTreatment);
    const matchesSearch =
      !searchQuery ||
      prediction.patients?.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      prediction.treatment_type
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    return matchesRisk && matchesTreatment && matchesSearch;
  });

  const activeModel = models.find((m) => m.status === "active");

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Brain className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Treatment Success Prediction
            </h1>
            <p className="text-gray-600">
              AI-powered treatment outcome predictions with ≥85% accuracy
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Active Model Alert */}
      {activeModel && (
        <Alert>
          <Brain className="h-4 w-4" />
          <AlertDescription>
            Using{" "}
            <strong>
              {activeModel.name} v{activeModel.version}
            </strong>{" "}
            ({activeModel.algorithm_type}) with{" "}
            <strong>{(activeModel.accuracy * 100).toFixed(1)}%</strong> accuracy
          </AlertDescription>
        </Alert>
      )}

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="generate">Generate Prediction</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {analytics && (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Total Predictions
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {analytics.total_predictions}
                        </p>
                      </div>
                      <Target className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Model Accuracy
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                          {(analytics.model_accuracy * 100).toFixed(1)}%
                        </p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Avg. Confidence
                        </p>
                        <p className="text-2xl font-bold text-purple-600">
                          {(analytics.average_prediction_score * 100).toFixed(
                            1
                          )}
                          %
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Validated
                        </p>
                        <p className="text-2xl font-bold text-orange-600">
                          {analytics.validated_predictions}
                        </p>
                      </div>
                      <Shield className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Risk Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <PieChart className="h-5 w-5" />
                      <span>Risk Assessment Distribution</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span>Low Risk</span>
                        </div>
                        <span className="font-semibold">
                          {analytics.risk_distribution.low}
                        </span>
                      </div>
                      <Progress
                        value={
                          (analytics.risk_distribution.low /
                            analytics.total_predictions) *
                          100
                        }
                        className="h-2"
                      />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <span>Medium Risk</span>
                        </div>
                        <span className="font-semibold">
                          {analytics.risk_distribution.medium}
                        </span>
                      </div>
                      <Progress
                        value={
                          (analytics.risk_distribution.medium /
                            analytics.total_predictions) *
                          100
                        }
                        className="h-2"
                      />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span>High Risk</span>
                        </div>
                        <span className="font-semibold">
                          {analytics.risk_distribution.high}
                        </span>
                      </div>
                      <Progress
                        value={
                          (analytics.risk_distribution.high /
                            analytics.total_predictions) *
                          100
                        }
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5" />
                      <span>Predicted Outcomes</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Success</span>
                        </div>
                        <span className="font-semibold">
                          {analytics.outcome_distribution.success}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Activity className="h-4 w-4 text-yellow-600" />
                          <span>Partial Success</span>
                        </div>
                        <span className="font-semibold">
                          {analytics.outcome_distribution.partial_success}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <XCircle className="h-4 w-4 text-red-600" />
                          <span>Failure</span>
                        </div>
                        <span className="font-semibold">
                          {analytics.outcome_distribution.failure}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* Generate Prediction Tab */}
        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Generate New Prediction</span>
              </CardTitle>
              <CardDescription>
                Create AI-powered treatment success predictions for patients
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patient-select">Patient</Label>
                  <Select
                    value={selectedPatientId}
                    onValueChange={setSelectedPatientId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name} ({patient.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="treatment-select">Treatment Type</Label>
                  <Select
                    value={selectedTreatmentType}
                    onValueChange={setSelectedTreatmentType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select treatment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="laser_hair_removal">
                        Laser Hair Removal
                      </SelectItem>
                      <SelectItem value="facial_rejuvenation">
                        Facial Rejuvenation
                      </SelectItem>
                      <SelectItem value="body_contouring">
                        Body Contouring
                      </SelectItem>
                      <SelectItem value="skin_resurfacing">
                        Skin Resurfacing
                      </SelectItem>
                      <SelectItem value="botox_treatment">
                        Botox Treatment
                      </SelectItem>
                      <SelectItem value="dermal_fillers">
                        Dermal Fillers
                      </SelectItem>
                      <SelectItem value="chemical_peel">
                        Chemical Peel
                      </SelectItem>
                      <SelectItem value="microneedling">
                        Microneedling
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={generatePrediction}
                disabled={
                  !selectedPatientId ||
                  !selectedTreatmentType ||
                  newPredictionLoading
                }
                className="w-full"
              >
                {newPredictionLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating Prediction...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Generate Prediction
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Filter Predictions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search patients or treatments..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="filter-risk">Risk Level</Label>
                  <Select value={filterRisk} onValueChange={setFilterRisk}>
                    <SelectTrigger>
                      <SelectValue placeholder="All risk levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All risk levels</SelectItem>
                      <SelectItem value="low">Low Risk</SelectItem>
                      <SelectItem value="medium">Medium Risk</SelectItem>
                      <SelectItem value="high">High Risk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="filter-treatment">Treatment Type</Label>
                  <Input
                    id="filter-treatment"
                    placeholder="Filter by treatment..."
                    value={filterTreatment}
                    onChange={(e) => setFilterTreatment(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Predictions List */}
          <div className="space-y-4">
            {filteredPredictions.map((prediction) => (
              <Card key={prediction.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">
                          {prediction.patients?.name || "Unknown Patient"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Stethoscope className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {prediction.treatment_type.replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge
                        className={getRiskColor(prediction.risk_assessment)}
                      >
                        {prediction.risk_assessment} risk
                      </Badge>
                      <div className="flex items-center space-x-1">
                        {getOutcomeIcon(prediction.predicted_outcome)}
                        <span className="text-sm">
                          {prediction.predicted_outcome.replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Prediction Score</p>
                      <p
                        className={`text-lg font-semibold ${getScoreColor(prediction.prediction_score)}`}
                      >
                        {(prediction.prediction_score * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        Confidence Interval
                      </p>
                      <p className="text-sm">
                        {(prediction.confidence_interval.lower * 100).toFixed(
                          1
                        )}
                        % -{" "}
                        {(prediction.confidence_interval.upper * 100).toFixed(
                          1
                        )}
                        %
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Prediction Date</p>
                      <p className="text-sm">
                        {new Date(
                          prediction.prediction_date
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {prediction.actual_outcome && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Actual Outcome:
                        </span>
                        <div className="flex items-center space-x-1">
                          {getOutcomeIcon(prediction.actual_outcome)}
                          <span className="text-sm">
                            {prediction.actual_outcome.replace(/_/g, " ")}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {filteredPredictions.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-500">
                    No predictions found matching your filters.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {analytics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Treatment Type Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(analytics.treatment_type_distribution).map(
                      ([type, count]) => (
                        <div
                          key={type}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm">
                            {type.replace(/_/g, " ")}
                          </span>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Model Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Overall Accuracy</span>
                      <span className="font-semibold text-green-600">
                        {(analytics.model_accuracy * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Total Predictions</span>
                      <span className="font-semibold">
                        {analytics.total_predictions}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Validated Predictions</span>
                      <span className="font-semibold">
                        {analytics.validated_predictions}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Validation Rate</span>
                      <span className="font-semibold">
                        {analytics.total_predictions > 0
                          ? (
                              (analytics.validated_predictions /
                                analytics.total_predictions) *
                              100
                            ).toFixed(1)
                          : 0}
                        %
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Models Tab */}
        <TabsContent value="models" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {models.map((model) => (
              <Card key={model.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{model.name}</span>
                    <Badge
                      variant={
                        model.status === "active" ? "default" : "secondary"
                      }
                    >
                      {model.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Version {model.version} •{" "}
                    {model.algorithm_type.replace(/_/g, " ")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Accuracy</span>
                      <span className="font-semibold text-green-600">
                        {(model.accuracy * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Created</span>
                      <span className="text-sm">
                        {new Date(model.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {models.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">No prediction models found.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

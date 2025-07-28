"use client";

import {
  ComplianceReport,
  ComplianceStats,
  ProtocolOptimization,
  ProviderPerformance,
  ProviderStats,
  QualityBenchmark,
  SuccessMetrics,
  SuccessRateStats,
  TreatmentOutcome,
  TreatmentTypeStats,
} from "@/app/types/treatment-success";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Award,
  CheckCircle,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

interface TreatmentSuccessPageProps {
  className?: string;
}

export default function TreatmentSuccessPage({
  className,
}: TreatmentSuccessPageProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [successStats, setSuccessStats] = useState<SuccessRateStats | null>(
    null
  );
  const [providerStats, setProviderStats] = useState<ProviderStats | null>(
    null
  );
  const [treatmentTypeStats, setTreatmentTypeStats] = useState<
    TreatmentTypeStats[]
  >([]);
  const [complianceStats, setComplianceStats] =
    useState<ComplianceStats | null>(null);
  const [treatmentOutcomes, setTreatmentOutcomes] = useState<
    TreatmentOutcome[]
  >([]);
  const [successMetrics, setSuccessMetrics] = useState<SuccessMetrics[]>([]);
  const [providerPerformance, setProviderPerformance] = useState<
    ProviderPerformance[]
  >([]);
  const [protocolOptimizations, setProtocolOptimizations] = useState<
    ProtocolOptimization[]
  >([]);
  const [qualityBenchmarks, setQualityBenchmarks] = useState<
    QualityBenchmark[]
  >([]);
  const [complianceReports, setComplianceReports] = useState<
    ComplianceReport[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [outcomeForm, setOutcomeForm] = useState({
    patient_id: "",
    treatment_type: "",
    provider_id: "",
    treatment_date: "",
    success_score: 0,
    patient_satisfaction_score: 0,
    complications: "",
    follow_up_notes: "",
    status: "completed" as const,
  });

  const [optimizationForm, setOptimizationForm] = useState({
    treatment_type: "",
    current_protocol: "",
    suggested_improvements: "",
    success_rate_improvement: 0,
    implementation_priority: "medium" as const,
    rationale: "",
  });

  const [benchmarkForm, setBenchmarkForm] = useState({
    treatment_type: "",
    target_success_rate: 0,
    minimum_satisfaction: 0,
    maximum_complication_rate: 0,
    industry_standard: 0,
    certification_requirement: "",
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadSuccessStats(),
        loadProviderStats(),
        loadTreatmentTypeStats(),
        loadComplianceStats(),
        loadTreatmentOutcomes(),
        loadSuccessMetrics(),
        loadProviderPerformance(),
        loadProtocolOptimizations(),
        loadQualityBenchmarks(),
        loadComplianceReports(),
      ]);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError("Erro ao carregar dados do dashboard");
    } finally {
      setLoading(false);
    }
  };

  const loadSuccessStats = async () => {
    try {
      const response = await fetch("/api/treatment-success/stats/success-rate");
      if (!response.ok) throw new Error("Failed to fetch success stats");
      const data = await response.json();
      setSuccessStats(data.data);
    } catch (err) {
      console.error("Error loading success stats:", err);
    }
  };

  const loadProviderStats = async () => {
    try {
      const response = await fetch(
        "/api/treatment-success/stats/provider-stats"
      );
      if (!response.ok) throw new Error("Failed to fetch provider stats");
      const data = await response.json();
      setProviderStats(data.data);
    } catch (err) {
      console.error("Error loading provider stats:", err);
    }
  };

  const loadTreatmentTypeStats = async () => {
    try {
      const response = await fetch(
        "/api/treatment-success/stats/treatment-type"
      );
      if (!response.ok) throw new Error("Failed to fetch treatment type stats");
      const data = await response.json();
      setTreatmentTypeStats(data.data);
    } catch (err) {
      console.error("Error loading treatment type stats:", err);
    }
  };

  const loadComplianceStats = async () => {
    try {
      const response = await fetch("/api/treatment-success/stats/compliance");
      if (!response.ok) throw new Error("Failed to fetch compliance stats");
      const data = await response.json();
      setComplianceStats(data.data);
    } catch (err) {
      console.error("Error loading compliance stats:", err);
    }
  };

  const loadTreatmentOutcomes = async () => {
    try {
      const response = await fetch("/api/treatment-success/outcomes?limit=10");
      if (!response.ok) throw new Error("Failed to fetch treatment outcomes");
      const data = await response.json();
      setTreatmentOutcomes(data.data);
    } catch (err) {
      console.error("Error loading treatment outcomes:", err);
    }
  };

  const loadSuccessMetrics = async () => {
    try {
      const response = await fetch("/api/treatment-success/metrics?limit=10");
      if (!response.ok) throw new Error("Failed to fetch success metrics");
      const data = await response.json();
      setSuccessMetrics(data.data);
    } catch (err) {
      console.error("Error loading success metrics:", err);
    }
  };

  const loadProviderPerformance = async () => {
    try {
      const response = await fetch(
        "/api/treatment-success/provider-performance?limit=10"
      );
      if (!response.ok) throw new Error("Failed to fetch provider performance");
      const data = await response.json();
      setProviderPerformance(data.data);
    } catch (err) {
      console.error("Error loading provider performance:", err);
    }
  };

  const loadProtocolOptimizations = async () => {
    try {
      const response = await fetch(
        "/api/treatment-success/protocol-optimizations?limit=10"
      );
      if (!response.ok)
        throw new Error("Failed to fetch protocol optimizations");
      const data = await response.json();
      setProtocolOptimizations(data.data);
    } catch (err) {
      console.error("Error loading protocol optimizations:", err);
    }
  };

  const loadQualityBenchmarks = async () => {
    try {
      const response = await fetch(
        "/api/treatment-success/quality-benchmarks?limit=10"
      );
      if (!response.ok) throw new Error("Failed to fetch quality benchmarks");
      const data = await response.json();
      setQualityBenchmarks(data.data);
    } catch (err) {
      console.error("Error loading quality benchmarks:", err);
    }
  };

  const loadComplianceReports = async () => {
    try {
      const response = await fetch(
        "/api/treatment-success/compliance-reports?limit=10"
      );
      if (!response.ok) throw new Error("Failed to fetch compliance reports");
      const data = await response.json();
      setComplianceReports(data.data);
    } catch (err) {
      console.error("Error loading compliance reports:", err);
    }
  };

  const handleCreateOutcome = async () => {
    try {
      const response = await fetch("/api/treatment-success/outcomes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(outcomeForm),
      });

      if (!response.ok) throw new Error("Failed to create outcome");

      setOutcomeForm({
        patient_id: "",
        treatment_type: "",
        provider_id: "",
        treatment_date: "",
        success_score: 0,
        patient_satisfaction_score: 0,
        complications: "",
        follow_up_notes: "",
        status: "completed",
      });

      await loadTreatmentOutcomes();
      await loadSuccessStats();
    } catch (err) {
      console.error("Error creating outcome:", err);
      setError("Erro ao criar resultado de tratamento");
    }
  };

  const handleCreateOptimization = async () => {
    try {
      const response = await fetch(
        "/api/treatment-success/protocol-optimizations",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(optimizationForm),
        }
      );

      if (!response.ok) throw new Error("Failed to create optimization");

      setOptimizationForm({
        treatment_type: "",
        current_protocol: "",
        suggested_improvements: "",
        success_rate_improvement: 0,
        implementation_priority: "medium",
        rationale: "",
      });

      await loadProtocolOptimizations();
    } catch (err) {
      console.error("Error creating optimization:", err);
      setError("Erro ao criar otimização de protocolo");
    }
  };

  const handleCreateBenchmark = async () => {
    try {
      const response = await fetch(
        "/api/treatment-success/quality-benchmarks",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(benchmarkForm),
        }
      );

      if (!response.ok) throw new Error("Failed to create benchmark");

      setBenchmarkForm({
        treatment_type: "",
        target_success_rate: 0,
        minimum_satisfaction: 0,
        maximum_complication_rate: 0,
        industry_standard: 0,
        certification_requirement: "",
      });

      await loadQualityBenchmarks();
    } catch (err) {
      console.error("Error creating benchmark:", err);
      setError("Erro ao criar benchmark de qualidade");
    }
  };

  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;
  const formatScore = (value: number) => value.toFixed(2);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            Carregando rastreamento de sucesso...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Rastreamento de Sucesso de Tratamento
        </h1>
        <p className="text-gray-600">
          Monitore e otimize as taxas de sucesso dos tratamentos da clínica
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Sucesso Geral
            </CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {successStats
                ? formatPercentage(successStats.overall_success_rate)
                : "0%"}
            </div>
            <p className="text-xs text-gray-600">
              {successStats?.trend_direction === "up" ? (
                <span className="flex items-center text-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Em alta
                </span>
              ) : (
                <span className="flex items-center text-red-600">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  Em baixa
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Tratamentos
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {successStats?.total_treatments || 0}
            </div>
            <p className="text-xs text-gray-600">
              Avaliação de satisfação:{" "}
              {successStats
                ? formatScore(successStats.average_satisfaction)
                : "0"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Profissionais Ativos
            </CardTitle>
            <Award className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {providerStats?.total_providers || 0}
            </div>
            <p className="text-xs text-gray-600">
              {providerStats?.improvement_needed || 0} precisam de melhoria
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conformidade</CardTitle>
            <CheckCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {complianceStats
                ? formatPercentage(complianceStats.overall_compliance)
                : "0%"}
            </div>
            <p className="text-xs text-gray-600">
              {complianceStats?.pending_reports || 0} relatórios pendentes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="outcomes">Resultados</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="optimization">Otimização</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
          <TabsTrigger value="compliance">Conformidade</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Success by Treatment Type */}
            <Card>
              <CardHeader>
                <CardTitle>Sucesso por Tipo de Tratamento</CardTitle>
                <CardDescription>
                  Taxa de sucesso e satisfação por categoria
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {treatmentTypeStats.map((stat, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">
                        {stat.treatment_type}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">
                          {formatPercentage(stat.success_rate)}
                        </span>
                        <Badge
                          variant={
                            stat.benchmark_status === "above"
                              ? "default"
                              : stat.benchmark_status === "at"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {stat.benchmark_status === "above"
                            ? "Acima"
                            : stat.benchmark_status === "at"
                              ? "No padrão"
                              : "Abaixo"}
                        </Badge>
                      </div>
                    </div>
                    <Progress value={stat.success_rate * 100} className="h-2" />
                    <div className="text-xs text-gray-600">
                      {stat.total_treatments} tratamentos • Satisfação:{" "}
                      {formatScore(stat.satisfaction_score)}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Optimizations */}
            <Card>
              <CardHeader>
                <CardTitle>Otimizações Recentes</CardTitle>
                <CardDescription>
                  Melhorias nos protocolos de tratamento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {protocolOptimizations.slice(0, 5).map((optimization) => (
                  <div
                    key={optimization.id}
                    className="border-l-4 border-blue-500 pl-4"
                  >
                    <h4 className="font-medium">
                      {optimization.treatment_type}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {optimization.suggested_improvements}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <Badge
                        variant={
                          optimization.implementation_priority === "high"
                            ? "destructive"
                            : optimization.implementation_priority === "medium"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {optimization.implementation_priority === "high"
                          ? "Alta"
                          : optimization.implementation_priority === "medium"
                            ? "Média"
                            : "Baixa"}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        +
                        {formatPercentage(
                          optimization.success_rate_improvement
                        )}{" "}
                        sucesso
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="outcomes">
          <div className="space-y-6">
            {/* Create Outcome Form */}
            <Card>
              <CardHeader>
                <CardTitle>Registrar Resultado de Tratamento</CardTitle>
                <CardDescription>
                  Documente o resultado de um tratamento realizado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="patient_id">ID do Paciente</Label>
                    <Input
                      id="patient_id"
                      value={outcomeForm.patient_id}
                      onChange={(e) =>
                        setOutcomeForm({
                          ...outcomeForm,
                          patient_id: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="treatment_type">Tipo de Tratamento</Label>
                    <Input
                      id="treatment_type"
                      value={outcomeForm.treatment_type}
                      onChange={(e) =>
                        setOutcomeForm({
                          ...outcomeForm,
                          treatment_type: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="provider_id">ID do Profissional</Label>
                    <Input
                      id="provider_id"
                      value={outcomeForm.provider_id}
                      onChange={(e) =>
                        setOutcomeForm({
                          ...outcomeForm,
                          provider_id: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="treatment_date">Data do Tratamento</Label>
                    <Input
                      id="treatment_date"
                      type="date"
                      value={outcomeForm.treatment_date}
                      onChange={(e) =>
                        setOutcomeForm({
                          ...outcomeForm,
                          treatment_date: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="success_score">
                      Score de Sucesso (0-1)
                    </Label>
                    <Input
                      id="success_score"
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={outcomeForm.success_score}
                      onChange={(e) =>
                        setOutcomeForm({
                          ...outcomeForm,
                          success_score: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="satisfaction_score">
                      Satisfação do Paciente (0-10)
                    </Label>
                    <Input
                      id="satisfaction_score"
                      type="number"
                      min="0"
                      max="10"
                      value={outcomeForm.patient_satisfaction_score}
                      onChange={(e) =>
                        setOutcomeForm({
                          ...outcomeForm,
                          patient_satisfaction_score: parseFloat(
                            e.target.value
                          ),
                        })
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="complications">Complicações</Label>
                  <Textarea
                    id="complications"
                    value={outcomeForm.complications}
                    onChange={(e) =>
                      setOutcomeForm({
                        ...outcomeForm,
                        complications: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="follow_up_notes">
                    Notas de Acompanhamento
                  </Label>
                  <Textarea
                    id="follow_up_notes"
                    value={outcomeForm.follow_up_notes}
                    onChange={(e) =>
                      setOutcomeForm({
                        ...outcomeForm,
                        follow_up_notes: e.target.value,
                      })
                    }
                  />
                </div>
                <Button onClick={handleCreateOutcome} className="w-full">
                  Registrar Resultado
                </Button>
              </CardContent>
            </Card>

            {/* Outcomes List */}
            <Card>
              <CardHeader>
                <CardTitle>Resultados Recentes</CardTitle>
                <CardDescription>
                  Últimos resultados de tratamento registrados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {treatmentOutcomes.map((outcome) => (
                    <div key={outcome.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">
                            {outcome.treatment_type}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Paciente: {outcome.patient_id} • Profissional:{" "}
                            {outcome.provider_id}
                          </p>
                          <p className="text-sm text-gray-600">
                            Data:{" "}
                            {new Date(
                              outcome.treatment_date
                            ).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            {formatPercentage(outcome.success_score || 0)}
                          </div>
                          <div className="text-sm text-gray-600">
                            Satisfação: {outcome.patient_satisfaction_score}/10
                          </div>
                          <Badge
                            variant={
                              outcome.status === "completed"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {outcome.status === "completed"
                              ? "Concluído"
                              : outcome.status === "in_progress"
                                ? "Em andamento"
                                : "Acompanhamento"}
                          </Badge>
                        </div>
                      </div>
                      {outcome.complications && (
                        <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                          <strong>Complicações:</strong> {outcome.complications}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="metrics">
          <Card>
            <CardHeader>
              <CardTitle>Métricas de Sucesso</CardTitle>
              <CardDescription>
                Análise de performance por período e tipo de tratamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {successMetrics.map((metric) => (
                  <div key={metric.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{metric.treatment_type}</h4>
                        <p className="text-sm text-gray-600">
                          Período:{" "}
                          {new Date(metric.period_start).toLocaleDateString(
                            "pt-BR"
                          )}{" "}
                          -{" "}
                          {new Date(metric.period_end).toLocaleDateString(
                            "pt-BR"
                          )}
                        </p>
                        <p className="text-sm text-gray-600">
                          {metric.total_treatments} tratamentos •{" "}
                          {metric.successful_treatments} sucessos
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          {formatPercentage(metric.success_rate)}
                        </div>
                        <div className="text-sm text-gray-600">
                          Satisfação:{" "}
                          {formatScore(metric.average_satisfaction || 0)}
                        </div>
                        <div className="text-sm text-red-600">
                          Complicações:{" "}
                          {formatPercentage(metric.complication_rate || 0)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance dos Profissionais</CardTitle>
              <CardDescription>
                Avaliação de performance individual dos profissionais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {providerPerformance.map((performance) => (
                  <div key={performance.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">
                          Profissional: {performance.provider_id}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Período:{" "}
                          {new Date(
                            performance.period_start
                          ).toLocaleDateString("pt-BR")}{" "}
                          -{" "}
                          {new Date(performance.period_end).toLocaleDateString(
                            "pt-BR"
                          )}
                        </p>
                        <p className="text-sm text-gray-600">
                          Avaliação: {performance.evaluation_period}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">
                          {formatPercentage(performance.overall_success_rate)}
                        </div>
                        <div className="text-sm text-gray-600">
                          Score:{" "}
                          {formatScore(performance.performance_score || 0)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization">
          <div className="space-y-6">
            {/* Create Optimization Form */}
            <Card>
              <CardHeader>
                <CardTitle>Propor Otimização de Protocolo</CardTitle>
                <CardDescription>
                  Sugira melhorias nos protocolos de tratamento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="opt_treatment_type">
                      Tipo de Tratamento
                    </Label>
                    <Input
                      id="opt_treatment_type"
                      value={optimizationForm.treatment_type}
                      onChange={(e) =>
                        setOptimizationForm({
                          ...optimizationForm,
                          treatment_type: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="implementation_priority">Prioridade</Label>
                    <Select
                      value={optimizationForm.implementation_priority}
                      onValueChange={(value: "high" | "medium" | "low") =>
                        setOptimizationForm({
                          ...optimizationForm,
                          implementation_priority: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="low">Baixa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="current_protocol">Protocolo Atual</Label>
                  <Textarea
                    id="current_protocol"
                    value={optimizationForm.current_protocol}
                    onChange={(e) =>
                      setOptimizationForm({
                        ...optimizationForm,
                        current_protocol: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="suggested_improvements">
                    Melhorias Sugeridas
                  </Label>
                  <Textarea
                    id="suggested_improvements"
                    value={optimizationForm.suggested_improvements}
                    onChange={(e) =>
                      setOptimizationForm({
                        ...optimizationForm,
                        suggested_improvements: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="rationale">Justificativa</Label>
                  <Textarea
                    id="rationale"
                    value={optimizationForm.rationale}
                    onChange={(e) =>
                      setOptimizationForm({
                        ...optimizationForm,
                        rationale: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="success_improvement">
                    Melhoria Esperada (0-1)
                  </Label>
                  <Input
                    id="success_improvement"
                    type="number"
                    min="0"
                    max="1"
                    step="0.01"
                    value={optimizationForm.success_rate_improvement}
                    onChange={(e) =>
                      setOptimizationForm({
                        ...optimizationForm,
                        success_rate_improvement: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
                <Button onClick={handleCreateOptimization} className="w-full">
                  Propor Otimização
                </Button>
              </CardContent>
            </Card>

            {/* Optimizations List */}
            <Card>
              <CardHeader>
                <CardTitle>Otimizações Propostas</CardTitle>
                <CardDescription>
                  Lista de melhorias de protocolo sugeridas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {protocolOptimizations.map((optimization) => (
                    <div
                      key={optimization.id}
                      className="border rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">
                            {optimization.treatment_type}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {optimization.suggested_improvements}
                          </p>
                          {optimization.rationale && (
                            <p className="text-sm text-gray-500 mt-1">
                              <strong>Justificativa:</strong>{" "}
                              {optimization.rationale}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              optimization.implementation_priority === "high"
                                ? "destructive"
                                : optimization.implementation_priority ===
                                    "medium"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {optimization.implementation_priority === "high"
                              ? "Alta"
                              : optimization.implementation_priority ===
                                  "medium"
                                ? "Média"
                                : "Baixa"}
                          </Badge>
                          <div className="text-sm text-green-600 mt-1">
                            +
                            {formatPercentage(
                              optimization.success_rate_improvement
                            )}
                          </div>
                          <Badge
                            variant={
                              optimization.approval_status === "approved"
                                ? "default"
                                : optimization.approval_status === "rejected"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {optimization.approval_status === "pending"
                              ? "Pendente"
                              : optimization.approval_status === "approved"
                                ? "Aprovado"
                                : optimization.approval_status === "rejected"
                                  ? "Rejeitado"
                                  : "Implementado"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="benchmarks">
          <div className="space-y-6">
            {/* Create Benchmark Form */}
            <Card>
              <CardHeader>
                <CardTitle>Definir Benchmark de Qualidade</CardTitle>
                <CardDescription>
                  Estabeleça padrões de qualidade para tipos de tratamento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bench_treatment_type">
                      Tipo de Tratamento
                    </Label>
                    <Input
                      id="bench_treatment_type"
                      value={benchmarkForm.treatment_type}
                      onChange={(e) =>
                        setBenchmarkForm({
                          ...benchmarkForm,
                          treatment_type: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="target_success_rate">
                      Meta de Sucesso (0-1)
                    </Label>
                    <Input
                      id="target_success_rate"
                      type="number"
                      min="0"
                      max="1"
                      step="0.01"
                      value={benchmarkForm.target_success_rate}
                      onChange={(e) =>
                        setBenchmarkForm({
                          ...benchmarkForm,
                          target_success_rate: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="minimum_satisfaction">
                      Satisfação Mínima (0-10)
                    </Label>
                    <Input
                      id="minimum_satisfaction"
                      type="number"
                      min="0"
                      max="10"
                      value={benchmarkForm.minimum_satisfaction}
                      onChange={(e) =>
                        setBenchmarkForm({
                          ...benchmarkForm,
                          minimum_satisfaction: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="max_complication_rate">
                      Taxa Máx. Complicações (0-1)
                    </Label>
                    <Input
                      id="max_complication_rate"
                      type="number"
                      min="0"
                      max="1"
                      step="0.01"
                      value={benchmarkForm.maximum_complication_rate}
                      onChange={(e) =>
                        setBenchmarkForm({
                          ...benchmarkForm,
                          maximum_complication_rate: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="industry_standard">
                      Padrão da Indústria (0-1)
                    </Label>
                    <Input
                      id="industry_standard"
                      type="number"
                      min="0"
                      max="1"
                      step="0.01"
                      value={benchmarkForm.industry_standard}
                      onChange={(e) =>
                        setBenchmarkForm({
                          ...benchmarkForm,
                          industry_standard: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="certification_requirement">
                      Requisito de Certificação
                    </Label>
                    <Input
                      id="certification_requirement"
                      value={benchmarkForm.certification_requirement}
                      onChange={(e) =>
                        setBenchmarkForm({
                          ...benchmarkForm,
                          certification_requirement: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <Button onClick={handleCreateBenchmark} className="w-full">
                  Definir Benchmark
                </Button>
              </CardContent>
            </Card>

            {/* Benchmarks List */}
            <Card>
              <CardHeader>
                <CardTitle>Benchmarks de Qualidade</CardTitle>
                <CardDescription>
                  Padrões de qualidade definidos por tipo de tratamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {qualityBenchmarks.map((benchmark) => (
                    <div key={benchmark.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">
                            {benchmark.treatment_type}
                          </h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>
                              Taxa de sucesso alvo:{" "}
                              {formatPercentage(benchmark.target_success_rate)}
                            </p>
                            <p>
                              Satisfação mínima:{" "}
                              {benchmark.minimum_satisfaction}/10
                            </p>
                            <p>
                              Taxa máx. complicações:{" "}
                              {formatPercentage(
                                benchmark.maximum_complication_rate
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-600">
                            {formatPercentage(benchmark.industry_standard)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Padrão da indústria
                          </div>
                          {benchmark.certification_requirement && (
                            <Badge variant="outline" className="mt-1">
                              {benchmark.certification_requirement}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios de Conformidade</CardTitle>
              <CardDescription>
                Monitoramento de conformidade com padrões e regulamentações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceReports.map((report) => (
                  <div key={report.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{report.report_type}</h4>
                        <p className="text-sm text-gray-600">
                          Período:{" "}
                          {new Date(
                            report.reporting_period_start
                          ).toLocaleDateString("pt-BR")}{" "}
                          -{" "}
                          {new Date(
                            report.reporting_period_end
                          ).toLocaleDateString("pt-BR")}
                        </p>
                        <p className="text-sm text-gray-600">
                          Criado em:{" "}
                          {new Date(report.created_at).toLocaleDateString(
                            "pt-BR"
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-orange-600">
                          {formatPercentage(report.compliance_score || 0)}
                        </div>
                        <Badge
                          variant={
                            report.status === "finalized"
                              ? "default"
                              : report.status === "review"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {report.status === "draft"
                            ? "Rascunho"
                            : report.status === "review"
                              ? "Em revisão"
                              : "Finalizado"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

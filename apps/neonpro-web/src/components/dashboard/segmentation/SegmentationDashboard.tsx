"use client";

import type { Alert, AlertDescription } from "@/components/ui/alert";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Input } from "@/components/ui/input";
import type { Label } from "@/components/ui/label";
import type { Progress } from "@/components/ui/progress";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Switch } from "@/components/ui/switch";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Textarea } from "@/components/ui/textarea";
import type {
  AlertCircle,
  BarChart3,
  Brain,
  CheckCircle,
  Clock,
  Eye,
  Filter,
  Plus,
  Settings,
  Target,
  Users,
  Zap,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import PerformanceTracking from "./PerformanceTracking";
import PrivacyCompliance from "./PrivacyCompliance";
import SegmentBuilder from "./SegmentBuilder";

interface PatientSegment {
  id: string;
  name: string;
  segment_type:
    | "demographic"
    | "behavioral"
    | "clinical"
    | "engagement"
    | "financial"
    | "custom"
    | "ai_generated";
  member_count: number;
  ai_generated: boolean;
  is_active: boolean;
  created_at: string;
  last_updated: string;
  description?: string;
  criteria: Record<string, any>;
}

interface SegmentPerformance {
  segment_id: string;
  member_count: number;
  new_members: number;
  departed_members: number;
  member_retention_rate: number;
  average_engagement_score: number;
  total_revenue: number;
  roi: number;
  campaign_open_rate: number;
  treatment_success_rate: number;
  patient_satisfaction_score: number;
}

interface SegmentationRule {
  id: string;
  segment_id: string;
  rule_name: string;
  rule_description?: string;
  is_active: boolean;
  requires_ai: boolean;
  matches_count: number;
  accuracy_rate?: number;
  last_evaluated: string;
}

const SegmentationDashboard: React.FC = () => {
  const [segments, setSegments] = useState<PatientSegment[]>([]);
  const [performance, setPerformance] = useState<Record<string, SegmentPerformance>>({});
  const [rules, setRules] = useState<SegmentationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("overview");

  // New segment form state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newSegment, setNewSegment] = useState({
    name: "",
    description: "",
    segment_type: "custom" as const,
    criteria: {},
    auto_update: true,
    update_frequency: "daily" as const,
  });

  useEffect(() => {
    loadSegmentationData();
  }, []);

  const loadSegmentationData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load segments
      const segmentsResponse = await fetch("/api/segmentation/segments");
      if (!segmentsResponse.ok) throw new Error("Failed to load segments");
      const segmentsData = await segmentsResponse.json();
      setSegments(segmentsData.data || []);

      // Load performance data for each segment
      const performanceData: Record<string, SegmentPerformance> = {};
      for (const segment of segmentsData.data || []) {
        try {
          const perfResponse = await fetch(`/api/segmentation/segments/${segment.id}/performance`);
          if (perfResponse.ok) {
            const perfData = await perfResponse.json();
            performanceData[segment.id] = perfData.data;
          }
        } catch (error) {
          console.warn(`Failed to load performance for segment ${segment.id}:`, error);
        }
      }
      setPerformance(performanceData);

      // Load segmentation rules
      const rulesResponse = await fetch("/api/segmentation/rules");
      if (rulesResponse.ok) {
        const rulesData = await rulesResponse.json();
        setRules(rulesData.data || []);
      }
    } catch (error) {
      console.error("Error loading segmentation data:", error);
      setError(error instanceof Error ? error.message : "Failed to load segmentation data");
    } finally {
      setLoading(false);
    }
  };

  const createSegment = async () => {
    try {
      const response = await fetch("/api/segmentation/segments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSegment),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create segment");
      }

      // Reset form and reload data
      setNewSegment({
        name: "",
        description: "",
        segment_type: "custom",
        criteria: {},
        auto_update: true,
        update_frequency: "daily",
      });
      setShowCreateDialog(false);
      await loadSegmentationData();
    } catch (error) {
      console.error("Error creating segment:", error);
      setError(error instanceof Error ? error.message : "Failed to create segment");
    }
  };

  const getSegmentTypeColor = (type: string) => {
    const colors = {
      demographic: "bg-blue-100 text-blue-800",
      behavioral: "bg-green-100 text-green-800",
      clinical: "bg-red-100 text-red-800",
      engagement: "bg-purple-100 text-purple-800",
      financial: "bg-yellow-100 text-yellow-800",
      custom: "bg-gray-100 text-gray-800",
      ai_generated: "bg-indigo-100 text-indigo-800",
    };
    return colors[type as keyof typeof colors] || colors.custom;
  };

  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;
  const formatCurrency = (value: number) =>
    `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  const filteredSegments =
    selectedSegment === "all" ? segments : segments.filter((s) => s.id === selectedSegment);

  const totalPatients = segments.reduce((sum, segment) => sum + segment.member_count, 0);
  const aiGeneratedCount = segments.filter((s) => s.ai_generated).length;
  const activeSegmentsCount = segments.filter((s) => s.is_active).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Segmentação de Pacientes</h1>
          <p className="text-muted-foreground">
            Análise inteligente e segmentação automatizada de pacientes
          </p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Segmento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Novo Segmento</DialogTitle>
                <DialogDescription>Configure um novo segmento de pacientes</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="segment-name">Nome do Segmento</Label>
                  <Input
                    id="segment-name"
                    value={newSegment.name}
                    onChange={(e) => setNewSegment({ ...newSegment, name: e.target.value })}
                    placeholder="Ex: Pacientes Premium"
                  />
                </div>
                <div>
                  <Label htmlFor="segment-description">Descrição</Label>
                  <Textarea
                    id="segment-description"
                    value={newSegment.description}
                    onChange={(e) =>
                      setNewSegment({
                        ...newSegment,
                        description: e.target.value,
                      })
                    }
                    placeholder="Descreva o segmento..."
                  />
                </div>
                <div>
                  <Label htmlFor="segment-type">Tipo de Segmento</Label>
                  <Select
                    value={newSegment.segment_type}
                    onValueChange={(value: any) =>
                      setNewSegment({ ...newSegment, segment_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="demographic">Demográfico</SelectItem>
                      <SelectItem value="behavioral">Comportamental</SelectItem>
                      <SelectItem value="clinical">Clínico</SelectItem>
                      <SelectItem value="engagement">Engajamento</SelectItem>
                      <SelectItem value="financial">Financeiro</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-update"
                    checked={newSegment.auto_update}
                    onCheckedChange={(checked) =>
                      setNewSegment({ ...newSegment, auto_update: checked })
                    }
                  />
                  <Label htmlFor="auto-update">Atualização Automática</Label>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={createSegment} disabled={!newSegment.name}>
                    Criar Segmento
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={loadSegmentationData}>
            <BarChart3 className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pacientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPatients.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Em {segments.length} segmentos ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Segmentos Ativos</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSegmentsCount}</div>
            <p className="text-xs text-muted-foreground">
              {segments.length - activeSegmentsCount} inativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">IA Ativa</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aiGeneratedCount}</div>
            <p className="text-xs text-muted-foreground">Segmentos gerados por IA</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regras Ativas</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rules.filter((r) => r.is_active).length}</div>
            <p className="text-xs text-muted-foreground">{rules.length} regras totais</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="builder">Construtor</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="privacy">Privacidade</TabsTrigger>
            <TabsTrigger value="segments">Segmentos</TabsTrigger>
            <TabsTrigger value="rules">Regras de Automação</TabsTrigger>
          </TabsList>

          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedSegment} onValueChange={setSelectedSegment}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar segmentos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Segmentos</SelectItem>
                {segments.map((segment) => (
                  <SelectItem key={segment.id} value={segment.id}>
                    {segment.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4">
            {filteredSegments.map((segment) => {
              const segmentPerf = performance[segment.id];
              return (
                <Card key={segment.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {segment.name}
                          <Badge className={getSegmentTypeColor(segment.segment_type)}>
                            {segment.segment_type}
                          </Badge>
                          {segment.ai_generated && (
                            <Badge variant="secondary">
                              <Brain className="w-3 h-3 mr-1" />
                              IA
                            </Badge>
                          )}
                          {segment.is_active ? (
                            <Badge variant="default">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Ativo
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <Clock className="w-3 h-3 mr-1" />
                              Inativo
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>{segment.description}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{segment.member_count}</div>
                        <div className="text-sm text-muted-foreground">pacientes</div>
                      </div>
                    </div>
                  </CardHeader>
                  {segmentPerf && (
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-sm font-medium">Retenção</div>
                          <div className="text-lg">
                            {formatPercentage(segmentPerf.member_retention_rate)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Engajamento</div>
                          <div className="text-lg">
                            {formatPercentage(segmentPerf.average_engagement_score)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Receita Total</div>
                          <div className="text-lg">{formatCurrency(segmentPerf.total_revenue)}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">ROI</div>
                          <div
                            className={`text-lg ${segmentPerf.roi > 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {formatPercentage(segmentPerf.roi)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="segments" className="space-y-4">
          <div className="grid gap-4">
            {filteredSegments.map((segment) => (
              <Card key={segment.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{segment.name}</CardTitle>
                      <CardDescription>
                        Criado em {new Date(segment.created_at).toLocaleDateString("pt-BR")}
                      </CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Visualizar
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Configurar
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Membros:</span>
                      <span className="font-medium">{segment.member_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tipo:</span>
                      <Badge className={getSegmentTypeColor(segment.segment_type)}>
                        {segment.segment_type}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge variant={segment.is_active ? "default" : "secondary"}>
                        {segment.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4">
            {filteredSegments.map((segment) => {
              const segmentPerf = performance[segment.id];
              if (!segmentPerf) return null;

              return (
                <Card key={segment.id}>
                  <CardHeader>
                    <CardTitle>{segment.name} - Performance</CardTitle>
                    <CardDescription>Métricas de performance do segmento</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <Label>Taxa de Retenção</Label>
                        <div className="mt-2">
                          <Progress value={segmentPerf.member_retention_rate * 100} />
                          <div className="text-sm text-muted-foreground mt-1">
                            {formatPercentage(segmentPerf.member_retention_rate)}
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label>Engajamento Médio</Label>
                        <div className="mt-2">
                          <Progress value={segmentPerf.average_engagement_score * 100} />
                          <div className="text-sm text-muted-foreground mt-1">
                            {formatPercentage(segmentPerf.average_engagement_score)}
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label>Taxa de Sucesso</Label>
                        <div className="mt-2">
                          <Progress value={segmentPerf.treatment_success_rate * 100} />
                          <div className="text-sm text-muted-foreground mt-1">
                            {formatPercentage(segmentPerf.treatment_success_rate)}
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label>Novos Membros</Label>
                        <div className="text-2xl font-bold text-green-600">
                          +{segmentPerf.new_members}
                        </div>
                      </div>
                      <div>
                        <Label>Membros que Saíram</Label>
                        <div className="text-2xl font-bold text-red-600">
                          -{segmentPerf.departed_members}
                        </div>
                      </div>
                      <div>
                        <Label>ROI</Label>
                        <div
                          className={`text-2xl font-bold ${segmentPerf.roi > 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {formatPercentage(segmentPerf.roi)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <div className="grid gap-4">
            {rules.map((rule) => (
              <Card key={rule.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{rule.rule_name}</CardTitle>
                      <CardDescription>{rule.rule_description}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      {rule.requires_ai && (
                        <Badge variant="secondary">
                          <Brain className="w-3 h-3 mr-1" />
                          IA
                        </Badge>
                      )}
                      <Badge variant={rule.is_active ? "default" : "secondary"}>
                        {rule.is_active ? "Ativa" : "Inativa"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label>Correspondências</Label>
                      <div className="text-lg font-semibold">{rule.matches_count}</div>
                    </div>
                    <div>
                      <Label>Precisão</Label>
                      <div className="text-lg font-semibold">
                        {rule.accuracy_rate ? formatPercentage(rule.accuracy_rate) : "N/A"}
                      </div>
                    </div>
                    <div>
                      <Label>Última Avaliação</Label>
                      <div className="text-sm text-muted-foreground">
                        {new Date(rule.last_evaluated).toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                    <div>
                      <Label>Ações</Label>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          Editar
                        </Button>
                        <Button variant="outline" size="sm">
                          Executar
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="builder" className="space-y-4">
          <SegmentBuilder />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <PerformanceTracking />
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <PrivacyCompliance />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SegmentationDashboard;

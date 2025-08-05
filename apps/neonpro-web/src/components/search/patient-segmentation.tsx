/**
 * Patient Segmentation Component
 * Story 3.4: Smart Search + NLP Integration - Task 3
 * AI-driven patient segmentation with natural language criteria
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Button } from "@/components/ui/button";
import type { Input } from "@/components/ui/input";
import type { Label } from "@/components/ui/label";
import type { Textarea } from "@/components/ui/textarea";
import type { Badge } from "@/components/ui/badge";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Alert, AlertDescription } from "@/components/ui/alert";
import type { Progress } from "@/components/ui/progress";
import type { Separator } from "@/components/ui/separator";
import type { ScrollArea } from "@/components/ui/scroll-area";
import type {
  Users,
  Plus,
  Search,
  Filter,
  TrendingUp,
  BarChart3,
  Target,
  Brain,
  Lightbulb,
  Edit,
  Trash2,
  RefreshCw,
  Download,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
} from "lucide-react";
import type { toast } from "sonner";
import type { useDebounce } from "@/hooks/use-debounce";
import type {
  patientSegmentation,
  type PatientSegment,
  type SegmentCriteria,
  type PatientSegmentMember,
  type SegmentationAnalytics,
  type SupportedLanguage,
} from "@/lib/search/patient-segmentation";

interface PatientSegmentationProps {
  onSegmentSelect?: (segment: PatientSegment) => void;
  className?: string;
}

export function PatientSegmentation({ onSegmentSelect, className }: PatientSegmentationProps) {
  // State
  const [segments, setSegments] = useState<PatientSegment[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<PatientSegment | null>(null);
  const [analytics, setAnalytics] = useState<SegmentationAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("segments");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showSegmentDetails, setShowSegmentDetails] = useState(false);

  // Create segment form state
  const [newSegment, setNewSegment] = useState({
    name: "",
    description: "",
    naturalLanguageQuery: "",
    language: "pt" as SupportedLanguage,
  });

  // Debounced search
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Load segments and analytics
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [segmentsData, analyticsData] = await Promise.all([
        patientSegmentation.getAllSegments(),
        patientSegmentation.getAnalytics(),
      ]);

      setSegments(segmentsData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error("Error loading segmentation data:", error);
      toast.error("Erro ao carregar dados de segmentação");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter segments based on search
  const filteredSegments = segments.filter(
    (segment) =>
      segment.criteria.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      segment.criteria.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      segment.criteria.naturalLanguageQuery
        .toLowerCase()
        .includes(debouncedSearchQuery.toLowerCase()),
  );

  // Create new segment
  const handleCreateSegment = async () => {
    if (!newSegment.name.trim() || !newSegment.naturalLanguageQuery.trim()) {
      toast.error("Nome e critério em linguagem natural são obrigatórios");
      return;
    }

    setIsCreating(true);
    try {
      const segment = await patientSegmentation.createSegment(
        newSegment.name,
        newSegment.naturalLanguageQuery,
        newSegment.language,
        "current-user", // TODO: Get from auth context
        newSegment.description,
      );

      setSegments((prev) => [segment, ...prev]);
      setShowCreateDialog(false);
      setNewSegment({
        name: "",
        description: "",
        naturalLanguageQuery: "",
        language: "pt",
      });

      toast.success(`Segmento "${segment.criteria.name}" criado com sucesso!`);

      // Refresh analytics
      const updatedAnalytics = await patientSegmentation.getAnalytics();
      setAnalytics(updatedAnalytics);
    } catch (error) {
      console.error("Error creating segment:", error);
      toast.error("Erro ao criar segmento");
    } finally {
      setIsCreating(false);
    }
  };

  // Delete segment
  const handleDeleteSegment = async (segmentId: string) => {
    try {
      await patientSegmentation.deleteSegment(segmentId);
      setSegments((prev) => prev.filter((s) => s.id !== segmentId));

      if (selectedSegment?.id === segmentId) {
        setSelectedSegment(null);
        setShowSegmentDetails(false);
      }

      toast.success("Segmento excluído com sucesso!");

      // Refresh analytics
      const updatedAnalytics = await patientSegmentation.getAnalytics();
      setAnalytics(updatedAnalytics);
    } catch (error) {
      console.error("Error deleting segment:", error);
      toast.error("Erro ao excluir segmento");
    }
  };

  // Refresh segment
  const handleRefreshSegment = async (segment: PatientSegment) => {
    try {
      const refreshedSegment = await patientSegmentation.generateSegment(segment.criteria, {
        refreshData: true,
      });

      setSegments((prev) => prev.map((s) => (s.id === segment.id ? refreshedSegment : s)));

      if (selectedSegment?.id === segment.id) {
        setSelectedSegment(refreshedSegment);
      }

      toast.success("Segmento atualizado com sucesso!");
    } catch (error) {
      console.error("Error refreshing segment:", error);
      toast.error("Erro ao atualizar segmento");
    }
  };

  // Select segment
  const handleSelectSegment = (segment: PatientSegment) => {
    setSelectedSegment(segment);
    setShowSegmentDetails(true);
    onSegmentSelect?.(segment);
  };

  // Get performance color
  const getPerformanceColor = (accuracy: number) => {
    if (accuracy >= 0.8) return "text-green-600";
    if (accuracy >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  // Get performance icon
  const getPerformanceIcon = (accuracy: number) => {
    if (accuracy >= 0.8) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (accuracy >= 0.6) return <Clock className="h-4 w-4 text-yellow-600" />;
    return <AlertCircle className="h-4 w-4 text-red-600" />;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Segmentação de Pacientes</h2>
          <p className="text-muted-foreground">
            Crie e gerencie segmentos inteligentes usando linguagem natural
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Segmento
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Novo Segmento</DialogTitle>
                <DialogDescription>
                  Use linguagem natural para definir critérios de segmentação
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="segment-name">Nome do Segmento</Label>
                    <Input
                      id="segment-name"
                      placeholder="Ex: Pacientes Diabéticos Ativos"
                      value={newSegment.name}
                      onChange={(e) => setNewSegment((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="segment-language">Idioma</Label>
                    <Select
                      value={newSegment.language}
                      onValueChange={(value: SupportedLanguage) =>
                        setNewSegment((prev) => ({ ...prev, language: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt">Português</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="segment-description">Descrição (Opcional)</Label>
                  <Input
                    id="segment-description"
                    placeholder="Descrição do segmento..."
                    value={newSegment.description}
                    onChange={(e) =>
                      setNewSegment((prev) => ({ ...prev, description: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="segment-criteria">Critérios em Linguagem Natural</Label>
                  <Textarea
                    id="segment-criteria"
                    placeholder="Ex: Pacientes com diabetes entre 40 e 65 anos que visitaram a clínica nos últimos 6 meses"
                    value={newSegment.naturalLanguageQuery}
                    onChange={(e) =>
                      setNewSegment((prev) => ({ ...prev, naturalLanguageQuery: e.target.value }))
                    }
                    rows={3}
                  />
                  <p className="text-sm text-muted-foreground">
                    <Brain className="h-4 w-4 inline mr-1" />
                    Use linguagem natural. A IA irá interpretar e converter em critérios
                    estruturados.
                  </p>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateDialog(false)}
                    disabled={isCreating}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateSegment} disabled={isCreating}>
                    {isCreating && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                    Criar Segmento
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Segmentos</p>
                  <p className="text-2xl font-bold">{analytics.totalSegments}</p>
                </div>
                <Target className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Pacientes</p>
                  <p className="text-2xl font-bold">{analytics.totalPatients}</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tamanho Médio</p>
                  <p className="text-2xl font-bold">{analytics.averageSegmentSize}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Alta Performance</p>
                  <p className="text-2xl font-bold">
                    {analytics.segmentPerformance.highPerforming}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="segments">Segmentos</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="segments" className="space-y-4">
          {/* Search */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar segmentos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Segments Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredSegments.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum segmento encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery
                    ? "Tente ajustar sua busca"
                    : "Crie seu primeiro segmento de pacientes"}
                </p>
                {!searchQuery && (
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Segmento
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSegments.map((segment) => (
                <Card key={segment.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{segment.criteria.name}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {segment.criteria.description}
                        </CardDescription>
                      </div>
                      {getPerformanceIcon(segment.performance.accuracy)}
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {/* Patient Count */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Pacientes</span>
                        <Badge variant="secondary">
                          <Users className="h-3 w-3 mr-1" />
                          {segment.patientCount}
                        </Badge>
                      </div>

                      {/* Performance */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Precisão</span>
                          <span className={getPerformanceColor(segment.performance.accuracy)}>
                            {Math.round(segment.performance.accuracy * 100)}%
                          </span>
                        </div>
                        <Progress value={segment.performance.accuracy * 100} className="h-2" />
                      </div>

                      {/* Tags */}
                      {segment.criteria.tags && segment.criteria.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {segment.criteria.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {segment.criteria.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{segment.criteria.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-1 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSelectSegment(segment)}
                          className="flex-1"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Ver
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRefreshSegment(segment)}
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteSegment(segment.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {analytics && (
            <>
              {/* Performance Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de Performance</CardTitle>
                  <CardDescription>Análise da qualidade dos segmentos criados</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {analytics.segmentPerformance.highPerforming}
                      </div>
                      <div className="text-sm text-muted-foreground">Alta Performance</div>
                      <div className="text-xs text-muted-foreground">≥80% precisão</div>
                    </div>

                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {analytics.segmentPerformance.mediumPerforming}
                      </div>
                      <div className="text-sm text-muted-foreground">Média Performance</div>
                      <div className="text-xs text-muted-foreground">60-79% precisão</div>
                    </div>

                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {analytics.segmentPerformance.lowPerforming}
                      </div>
                      <div className="text-sm text-muted-foreground">Baixa Performance</div>
                      <div className="text-xs text-muted-foreground">&lt;60% precisão</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Common Criteria */}
              <Card>
                <CardHeader>
                  <CardTitle>Critérios Mais Utilizados</CardTitle>
                  <CardDescription>Tags e critérios mais frequentes nos segmentos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {analytics.mostCommonCriteria.map((criteria, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {criteria}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Trends */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-600">Segmentos Crescendo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-32">
                      {analytics.trends.growingSegments.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Nenhum segmento em crescimento
                        </p>
                      ) : (
                        <div className="space-y-1">
                          {analytics.trends.growingSegments.map((name, index) => (
                            <div key={index} className="text-sm">
                              {name}
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-blue-600">Segmentos Estáveis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-32">
                      {analytics.trends.stableSegments.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nenhum segmento estável</p>
                      ) : (
                        <div className="space-y-1">
                          {analytics.trends.stableSegments.map((name, index) => (
                            <div key={index} className="text-sm">
                              {name}
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-600">Segmentos Diminuindo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-32">
                      {analytics.trends.shrinkingSegments.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nenhum segmento diminuindo</p>
                      ) : (
                        <div className="space-y-1">
                          {analytics.trends.shrinkingSegments.map((name, index) => (
                            <div key={index} className="text-sm">
                              {name}
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Segment Details Dialog */}
      <Dialog open={showSegmentDetails} onOpenChange={setShowSegmentDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedSegment && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedSegment.criteria.name}</DialogTitle>
                <DialogDescription>{selectedSegment.criteria.description}</DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Segment Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{selectedSegment.patientCount}</div>
                    <div className="text-sm text-muted-foreground">Pacientes</div>
                  </div>

                  <div className="text-center">
                    <div
                      className={`text-2xl font-bold ${getPerformanceColor(selectedSegment.performance.accuracy)}`}
                    >
                      {Math.round(selectedSegment.performance.accuracy * 100)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Precisão</div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {Math.round(selectedSegment.performance.precision * 100)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Precisão</div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {Math.round(selectedSegment.performance.recall * 100)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Recall</div>
                  </div>
                </div>

                <Separator />

                {/* Natural Language Query */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center">
                    <Brain className="h-4 w-4 mr-2" />
                    Critério em Linguagem Natural
                  </h4>
                  <Alert>
                    <AlertDescription>
                      {selectedSegment.criteria.naturalLanguageQuery}
                    </AlertDescription>
                  </Alert>
                </div>

                {/* Insights */}
                {selectedSegment.insights && (
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center">
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Insights do Segmento
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Características Comuns</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="text-sm space-y-1">
                            {selectedSegment.insights.commonCharacteristics.map((char, index) => (
                              <li key={index} className="text-muted-foreground">
                                • {char}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Tendências</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="text-sm space-y-1">
                            {selectedSegment.insights.trends.map((trend, index) => (
                              <li key={index} className="text-muted-foreground">
                                • {trend}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Recomendações</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="text-sm space-y-1">
                            {selectedSegment.insights.recommendations.map((rec, index) => (
                              <li key={index} className="text-muted-foreground">
                                • {rec}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                {/* Patient List */}
                <div>
                  <h4 className="font-semibold mb-4 flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Pacientes no Segmento ({selectedSegment.patientCount})
                  </h4>

                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {selectedSegment.patients.slice(0, 50).map((patient) => (
                        <Card key={patient.patientId} className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-medium">{patient.patientName}</div>
                              <div className="text-sm text-muted-foreground">
                                {patient.demographics.age} anos • {patient.demographics.gender} •{" "}
                                {patient.demographics.location}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                Última visita: {patient.medicalSummary.lastVisit}
                              </div>
                            </div>

                            <div className="text-right">
                              <div
                                className={`font-medium ${getPerformanceColor(patient.matchScore)}`}
                              >
                                {Math.round(patient.matchScore * 100)}%
                              </div>
                              <div className="text-xs text-muted-foreground">Correspondência</div>
                            </div>
                          </div>

                          {patient.matchedCriteria.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {patient.matchedCriteria.map((criteria, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {criteria}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </Card>
                      ))}

                      {selectedSegment.patients.length > 50 && (
                        <div className="text-center text-sm text-muted-foreground py-2">
                          Mostrando 50 de {selectedSegment.patients.length} pacientes
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Intelligent Threshold Management Component
// Story 6.2: Automated Reorder Alerts + Threshold Management

"use client";

import { useIntelligentThresholds } from "@/app/hooks/useIntelligentThresholds";
import {
  ReorderThreshold,
  ThresholdOptimization,
} from "@/app/types/reorder-alerts";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  AlertTriangle,
  ArrowUp,
  BarChart3,
  Brain,
  CheckCircle,
  Lightbulb,
  Settings,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useState } from "react";

interface IntelligentThresholdManagerProps {
  clinicId: string;
  className?: string;
}

export function IntelligentThresholdManager({
  clinicId,
  className,
}: IntelligentThresholdManagerProps) {
  const {
    thresholds,
    optimizations,
    alertStats,
    loading,
    error,
    refresh,
    createThreshold,
    updateThreshold,
    deleteThreshold,
    generateForecast,
    totalThresholds,
    activeThresholds,
    autoReorderEnabled,
    optimizationOpportunities,
    totalPotentialSavings,
  } = useIntelligentThresholds({
    clinicId,
    autoRefresh: true,
    refreshInterval: 30000,
  });

  const [selectedThreshold, setSelectedThreshold] =
    useState<ReorderThreshold | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showOptimizationDialog, setShowOptimizationDialog] = useState(false);
  const [newThreshold, setNewThreshold] = useState({
    item_id: "",
    reorder_point: 0,
    safety_stock: 0,
    lead_time_days: 7,
    demand_forecast_weekly: 0,
    auto_reorder_enabled: false,
    supplier_id: "",
    notes: "",
  });

  if (loading && !thresholds.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-2">
          <Brain className="h-8 w-8 animate-pulse mx-auto text-blue-500" />
          <p className="text-sm text-muted-foreground">
            Carregando sistema inteligente...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span>Erro ao carregar sistema de limites: {error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleCreateThreshold = async () => {
    try {
      await createThreshold({
        ...newThreshold,
        clinic_id: clinicId,
        is_active: true,
      });
      setShowCreateDialog(false);
      setNewThreshold({
        item_id: "",
        reorder_point: 0,
        safety_stock: 0,
        lead_time_days: 7,
        demand_forecast_weekly: 0,
        auto_reorder_enabled: false,
        supplier_id: "",
        notes: "",
      });
    } catch (error) {
      console.error("Failed to create threshold:", error);
    }
  };

  const handleUpdateThreshold = async (
    id: string,
    updates: Partial<ReorderThreshold>
  ) => {
    try {
      await updateThreshold(id, updates);
    } catch (error) {
      console.error("Failed to update threshold:", error);
    }
  };

  const handleOptimizeThreshold = async (
    optimization: ThresholdOptimization
  ) => {
    try {
      await updateThreshold(optimization.item_id, {
        reorder_point: optimization.recommended_reorder_point,
        safety_stock: optimization.recommended_safety_stock,
      });
      setShowOptimizationDialog(false);
      refresh();
    } catch (error) {
      console.error("Failed to optimize threshold:", error);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-500" />
            Sistema Inteligente de Limites
          </h2>
          <p className="text-muted-foreground">
            Gerenciamento automatizado com IA preditiva e otimização contínua
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refresh} variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Target className="h-4 w-4 mr-2" />
                Novo Limite
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Limite Inteligente</DialogTitle>
                <DialogDescription>
                  Configure um novo limite com cálculos automáticos de IA
                </DialogDescription>
              </DialogHeader>
              <CreateThresholdForm
                threshold={newThreshold}
                onChange={setNewThreshold}
                onSubmit={handleCreateThreshold}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total de Limites
                </p>
                <p className="text-2xl font-bold">{totalThresholds}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Ativos
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {activeThresholds}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Auto-Reorder
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {autoReorderEnabled}
                </p>
              </div>
              <Zap className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Otimizações
                </p>
                <p className="text-2xl font-bold text-amber-600">
                  {optimizationOpportunities}
                </p>
              </div>
              <Lightbulb className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Optimization Opportunities */}
      {optimizations.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <Lightbulb className="h-5 w-5" />
              Oportunidades de Otimização
              <Badge variant="secondary" className="ml-auto">
                Economia: R$ {totalPotentialSavings.toFixed(2)}
              </Badge>
            </CardTitle>
            <CardDescription>
              A IA identificou oportunidades para otimizar seus limites
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {optimizations.slice(0, 3).map((optimization) => (
                <div
                  key={optimization.item_id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border"
                >
                  <div className="flex-1">
                    <p className="font-medium">{optimization.item_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {optimization.optimization_reason}
                    </p>
                    <div className="flex gap-4 mt-1 text-xs">
                      <span>Atual: {optimization.current_reorder_point}</span>
                      <ArrowUp className="h-3 w-3" />
                      <span>
                        Sugerido: {optimization.recommended_reorder_point}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        optimization.implementation_priority === "high"
                          ? "destructive"
                          : "secondary"
                      }
                      className="mb-2"
                    >
                      {optimization.implementation_priority === "high"
                        ? "Alta"
                        : "Média"}{" "}
                      Prioridade
                    </Badge>
                    <p className="text-sm font-medium text-green-600">
                      +R$ {optimization.potential_savings.toFixed(2)}
                    </p>
                    <Button
                      size="sm"
                      onClick={() => handleOptimizeThreshold(optimization)}
                      className="mt-2"
                    >
                      Aplicar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Threshold Management Tabs */}
      <Tabs defaultValue="thresholds" className="space-y-4">
        <TabsList>
          <TabsTrigger value="thresholds">Limites Ativos</TabsTrigger>
          <TabsTrigger value="analytics">Análise Preditiva</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="thresholds" className="space-y-4">
          <ThresholdsList
            thresholds={thresholds}
            onUpdate={handleUpdateThreshold}
            onDelete={deleteThreshold}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <PredictiveAnalytics
            clinicId={clinicId}
            generateForecast={generateForecast}
          />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <AlertsOverview alertStats={alertStats} clinicId={clinicId} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <SystemSettings clinicId={clinicId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Subcomponents
function CreateThresholdForm({ threshold, onChange, onSubmit }: any) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="item_id">Item</Label>
          <Input
            id="item_id"
            value={threshold.item_id}
            onChange={(e) =>
              onChange({ ...threshold, item_id: e.target.value })
            }
            placeholder="ID do item"
          />
        </div>
        <div>
          <Label htmlFor="reorder_point">Ponto de Reposição</Label>
          <Input
            id="reorder_point"
            type="number"
            value={threshold.reorder_point}
            onChange={(e) =>
              onChange({
                ...threshold,
                reorder_point: parseInt(e.target.value),
              })
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="safety_stock">Estoque de Segurança</Label>
          <Input
            id="safety_stock"
            type="number"
            value={threshold.safety_stock}
            onChange={(e) =>
              onChange({ ...threshold, safety_stock: parseInt(e.target.value) })
            }
          />
        </div>
        <div>
          <Label htmlFor="lead_time_days">Lead Time (dias)</Label>
          <Input
            id="lead_time_days"
            type="number"
            value={threshold.lead_time_days}
            onChange={(e) =>
              onChange({
                ...threshold,
                lead_time_days: parseInt(e.target.value),
              })
            }
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="auto_reorder"
          checked={threshold.auto_reorder_enabled}
          onCheckedChange={(checked) =>
            onChange({ ...threshold, auto_reorder_enabled: checked })
          }
        />
        <Label htmlFor="auto_reorder">Ativar Reposição Automática</Label>
      </div>

      <div>
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          value={threshold.notes}
          onChange={(e) => onChange({ ...threshold, notes: e.target.value })}
          placeholder="Observações sobre este limite..."
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => {}}>
          Cancelar
        </Button>
        <Button onClick={onSubmit}>
          <Brain className="h-4 w-4 mr-2" />
          Criar com IA
        </Button>
      </div>
    </div>
  );
}

function ThresholdsList({ thresholds, onUpdate, onDelete }: any) {
  return (
    <div className="space-y-4">
      {thresholds.map((threshold: ReorderThreshold) => (
        <Card key={threshold.id}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-semibold">{threshold.item_id}</h4>
                <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Reposição:</span>
                    <p className="font-medium">{threshold.reorder_point}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Segurança:</span>
                    <p className="font-medium">{threshold.safety_stock}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Lead Time:</span>
                    <p className="font-medium">
                      {threshold.lead_time_days || 7} dias
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {threshold.auto_reorder_enabled && (
                  <Badge variant="outline">
                    <Zap className="h-3 w-3 mr-1" />
                    Auto
                  </Badge>
                )}
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function PredictiveAnalytics({ clinicId, generateForecast }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Análise Preditiva
        </CardTitle>
        <CardDescription>
          Previsões de demanda baseadas em IA e dados históricos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-center py-8 text-muted-foreground">
          Funcionalidade de análise preditiva em desenvolvimento...
        </p>
      </CardContent>
    </Card>
  );
}

function AlertsOverview({ alertStats, clinicId }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Visão Geral de Alertas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alertStats ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{alertStats.total_alerts}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-600">
                {alertStats.pending_alerts}
              </p>
              <p className="text-sm text-muted-foreground">Pendentes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {alertStats.critical_alerts}
              </p>
              <p className="text-sm text-muted-foreground">Críticos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {alertStats.resolved_today}
              </p>
              <p className="text-sm text-muted-foreground">Resolvidos Hoje</p>
            </div>
          </div>
        ) : (
          <p className="text-center py-8 text-muted-foreground">
            Carregando estatísticas de alertas...
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function SystemSettings({ clinicId }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configurações do Sistema
        </CardTitle>
        <CardDescription>
          Configure comportamentos automáticos e preferências de IA
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-center py-8 text-muted-foreground">
          Configurações avançadas em desenvolvimento...
        </p>
      </CardContent>
    </Card>
  );
}

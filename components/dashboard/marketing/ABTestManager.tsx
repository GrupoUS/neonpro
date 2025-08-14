// A/B Testing Manager Component
// Epic 7.2: Automated Marketing Campaigns + Personalization
// Author: VoidBeast Agent

"use client";

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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { BarChart3, Pause, Play, TestTube, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ABTest {
  id: string;
  campaign_id: string;
  test_name: string;
  hypothesis: string;
  variations: Record<string, any>;
  traffic_split: Record<string, number>;
  success_metric: string;
  confidence_level: number;
  duration_days: number;
  status: string;
  winner_variation?: string;
  statistical_significance?: number;
  created_at: string;
  started_at?: string;
  ended_at?: string;
}

interface ABTestManagerProps {
  campaignId: string;
  onTestCreated?: (test: ABTest) => void;
}

export default function ABTestManager({
  campaignId,
  onTestCreated,
}: ABTestManagerProps) {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);

  // Form state for creating new A/B test
  const [formData, setFormData] = useState({
    test_name: "",
    hypothesis: "",
    variations: {
      control: { name: "Controle (Original)", content: "", percentage: 50 },
      variant_a: { name: "Variação A", content: "", percentage: 50 },
    },
    success_metric: "conversion_rate",
    confidence_level: 95,
    duration_days: 14,
  });

  const loadABTests = async () => {
    try {
      setIsLoading(true);
      // This would typically load A/B tests for the campaign
      // For now, we'll use mock data since the API endpoints would need to be expanded
      const mockTests: ABTest[] = [
        {
          id: "1",
          campaign_id: campaignId,
          test_name: "Teste de Assunto do Email",
          hypothesis: "Assuntos mais personalizados aumentam taxa de abertura",
          variations: {
            control: {
              name: "Controle",
              content: "Promoção especial para você",
              percentage: 50,
            },
            variant_a: {
              name: "Variação A",
              content: "Maria, sua promoção exclusiva chegou!",
              percentage: 50,
            },
          },
          traffic_split: { control: 0.5, variant_a: 0.5 },
          success_metric: "open_rate",
          confidence_level: 95,
          duration_days: 7,
          status: "running",
          statistical_significance: 0.83,
          created_at: new Date().toISOString(),
          started_at: new Date().toISOString(),
        },
      ];
      setTests(mockTests);
    } catch (error) {
      console.error("Error loading A/B tests:", error);
      toast.error("Erro ao carregar testes A/B");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadABTests();
  }, [campaignId]);

  const handleCreateTest = async () => {
    try {
      setIsCreating(true);

      const testData = {
        campaign_id: campaignId,
        test_name: formData.test_name,
        hypothesis: formData.hypothesis,
        variations: formData.variations,
        traffic_split: Object.keys(formData.variations).reduce(
          (acc, key) => {
            acc[key] = formData.variations[key].percentage / 100;
            return acc;
          },
          {} as Record<string, number>
        ),
        success_metric: formData.success_metric,
        confidence_level: formData.confidence_level,
        duration_days: formData.duration_days,
      };

      const response = await fetch(`/api/campaigns/${campaignId}/ab-test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Teste A/B criado com sucesso!");
        loadABTests();
        if (onTestCreated) {
          onTestCreated(data.ab_test);
        }

        // Reset form
        setFormData({
          test_name: "",
          hypothesis: "",
          variations: {
            control: {
              name: "Controle (Original)",
              content: "",
              percentage: 50,
            },
            variant_a: { name: "Variação A", content: "", percentage: 50 },
          },
          success_metric: "conversion_rate",
          confidence_level: 95,
          duration_days: 14,
        });
      } else {
        toast.error("Erro ao criar teste A/B: " + data.error);
      }
    } catch (error) {
      console.error("Error creating A/B test:", error);
      toast.error("Erro ao criar teste A/B");
    } finally {
      setIsCreating(false);
    }
  };

  const updateVariationPercentage = (
    variationKey: string,
    percentage: number
  ) => {
    const variations = { ...formData.variations };
    const variationKeys = Object.keys(variations);
    const otherKey = variationKeys.find((key) => key !== variationKey);

    if (otherKey) {
      variations[variationKey].percentage = percentage;
      variations[otherKey].percentage = 100 - percentage;

      setFormData((prev) => ({ ...prev, variations }));
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: "bg-gray-500", text: "Rascunho" },
      running: { color: "bg-blue-500", text: "Executando" },
      completed: { color: "bg-green-500", text: "Concluído" },
      paused: { color: "bg-yellow-500", text: "Pausado" },
      cancelled: { color: "bg-red-500", text: "Cancelado" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;

    return (
      <Badge className={`${config.color} text-white`}>{config.text}</Badge>
    );
  };

  const getSuccessMetricLabel = (metric: string) => {
    const labels = {
      open_rate: "Taxa de Abertura",
      click_rate: "Taxa de Clique",
      conversion_rate: "Taxa de Conversão",
      unsubscribe_rate: "Taxa de Descadastro",
      revenue: "Receita",
    };

    return labels[metric as keyof typeof labels] || metric;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TestTube className="h-6 w-6" />
            Testes A/B
          </h2>
          <p className="text-muted-foreground">
            Otimize suas campanhas com testes estatisticamente significativos
          </p>
        </div>
      </div>

      {/* Create New A/B Test */}
      <Card>
        <CardHeader>
          <CardTitle>Criar Novo Teste A/B</CardTitle>
          <CardDescription>
            Configure um teste para otimizar sua campanha
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="test_name">Nome do Teste</Label>
              <Input
                id="test_name"
                value={formData.test_name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    test_name: e.target.value,
                  }))
                }
                placeholder="Ex: Teste de Assunto do Email"
              />
            </div>

            <div>
              <Label htmlFor="success_metric">Métrica de Sucesso</Label>
              <Select
                value={formData.success_metric}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, success_metric: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a métrica" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open_rate">Taxa de Abertura</SelectItem>
                  <SelectItem value="click_rate">Taxa de Clique</SelectItem>
                  <SelectItem value="conversion_rate">
                    Taxa de Conversão
                  </SelectItem>
                  <SelectItem value="revenue">Receita</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="hypothesis">Hipótese</Label>
            <Textarea
              id="hypothesis"
              value={formData.hypothesis}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, hypothesis: e.target.value }))
              }
              placeholder="Ex: Assuntos mais personalizados aumentam a taxa de abertura em 15%"
              rows={2}
            />
          </div>

          {/* Variations Configuration */}
          <div className="space-y-4">
            <Label>Configuração das Variações</Label>

            {Object.entries(formData.variations).map(
              ([key, variation], index) => (
                <Card key={key} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{variation.name}</h4>
                      <div className="flex items-center space-x-2">
                        <Label className="text-sm">Tráfego:</Label>
                        <Input
                          type="number"
                          min="10"
                          max="90"
                          value={variation.percentage}
                          onChange={(e) =>
                            updateVariationPercentage(
                              key,
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-20"
                        />
                        <span className="text-sm">%</span>
                      </div>
                    </div>

                    <Textarea
                      value={variation.content}
                      onChange={(e) => {
                        const variations = { ...formData.variations };
                        variations[key].content = e.target.value;
                        setFormData((prev) => ({ ...prev, variations }));
                      }}
                      placeholder="Conteúdo da variação..."
                      rows={2}
                    />
                  </div>
                </Card>
              )
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="confidence_level">Nível de Confiança (%)</Label>
              <Select
                value={formData.confidence_level.toString()}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    confidence_level: parseInt(value),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="90">90%</SelectItem>
                  <SelectItem value="95">95%</SelectItem>
                  <SelectItem value="99">99%</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="duration_days">Duração (dias)</Label>
              <Input
                id="duration_days"
                type="number"
                min="3"
                max="30"
                value={formData.duration_days}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    duration_days: parseInt(e.target.value) || 14,
                  }))
                }
              />
            </div>
          </div>

          <Button
            onClick={handleCreateTest}
            disabled={isCreating || !formData.test_name || !formData.hypothesis}
            className="w-full"
          >
            {isCreating ? "Criando..." : "Criar Teste A/B"}
          </Button>
        </CardContent>
      </Card>

      {/* Active Tests */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Testes Ativos ({tests.length})
        </h3>

        {tests.map((test) => (
          <Card key={test.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{test.test_name}</CardTitle>
                  <CardDescription>{test.hypothesis}</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(test.status)}
                  {test.status === "running" &&
                    test.statistical_significance && (
                      <Badge variant="outline">
                        {Math.round(test.statistical_significance * 100)}%
                        confiança
                      </Badge>
                    )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Test Configuration */}
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Métrica: </span>
                    {getSuccessMetricLabel(test.success_metric)}
                  </div>
                  <div>
                    <span className="font-medium">Duração: </span>
                    {test.duration_days} dias
                  </div>
                  <div>
                    <span className="font-medium">Confiança: </span>
                    {test.confidence_level}%
                  </div>
                </div>

                <Separator />

                {/* Variations Performance */}
                <div className="space-y-3">
                  <h4 className="font-medium">Performance das Variações</h4>

                  {Object.entries(test.variations).map(([key, variation]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {variation.name}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">
                            {Math.round(test.traffic_split[key] * 100)}% tráfego
                          </span>
                          {test.winner_variation === key && (
                            <Badge className="bg-yellow-500 text-white">
                              <Trophy className="h-3 w-3 mr-1" />
                              Vencedor
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Mock performance data - in real app would come from API */}
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="font-medium">1,250</div>
                            <div className="text-muted-foreground">Envios</div>
                          </div>
                          <div>
                            <div className="font-medium">387</div>
                            <div className="text-muted-foreground">
                              Aberturas
                            </div>
                          </div>
                          <div>
                            <div className="font-medium">31.0%</div>
                            <div className="text-muted-foreground">Taxa</div>
                          </div>
                          <div>
                            <div className="font-medium text-green-600">
                              +5.2%
                            </div>
                            <div className="text-muted-foreground">
                              vs. Controle
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Statistical Significance */}
                {test.status === "running" && test.statistical_significance && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Significância Estatística</span>
                      <span className="font-medium">
                        {Math.round(test.statistical_significance * 100)}%
                      </span>
                    </div>
                    <Progress value={test.statistical_significance * 100} />

                    {test.statistical_significance >= 0.95 ? (
                      <p className="text-sm text-green-600">
                        ✓ Resultado estatisticamente significativo! Pode
                        declarar vencedor.
                      </p>
                    ) : (
                      <p className="text-sm text-yellow-600">
                        ⏳ Aguardando mais dados para significância
                        estatística...
                      </p>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 pt-2">
                  <Button variant="outline" size="sm">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Ver Detalhes
                  </Button>

                  {test.status === "running" && (
                    <>
                      <Button variant="outline" size="sm">
                        <Pause className="h-4 w-4 mr-2" />
                        Pausar
                      </Button>

                      {test.statistical_significance &&
                        test.statistical_significance >= 0.95 && (
                          <Button size="sm">
                            <Trophy className="h-4 w-4 mr-2" />
                            Declarar Vencedor
                          </Button>
                        )}
                    </>
                  )}

                  {test.status === "draft" && (
                    <Button size="sm">
                      <Play className="h-4 w-4 mr-2" />
                      Iniciar Teste
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {tests.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <TestTube className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                Nenhum teste A/B configurado
              </h3>
              <p className="text-muted-foreground">
                Crie seu primeiro teste para otimizar sua campanha
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

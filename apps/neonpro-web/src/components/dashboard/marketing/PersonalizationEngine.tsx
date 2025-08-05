// Personalization Engine Component
// Epic 7.2: Automated Marketing Campaigns + Personalization
// Author: VoidBeast Agent

"use client";

import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import type { Separator } from "@/components/ui/separator";
import type { Switch } from "@/components/ui/switch";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Textarea } from "@/components/ui/textarea";
import type {
  AlertCircle,
  Brain,
  CheckCircle,
  Eye,
  MessageSquare,
  Settings,
  Star,
  Target,
  TrendingUp,
} from "lucide-react";
import type { useEffect, useState } from "react";
import type { toast } from "sonner";

interface PersonalizationRule {
  id: string;
  name: string;
  condition: Record<string, any>;
  action: Record<string, any>;
  priority: number;
  is_active: boolean;
  performance_score?: number;
  created_at: string;
}

interface PersonalizationTemplate {
  id: string;
  name: string;
  type: "email" | "sms" | "push" | "web";
  content_variables: string[];
  base_template: string;
  personalization_fields: Record<string, any>;
  conversion_rate?: number;
  usage_count?: number;
}

interface PersonalizationEngineProps {
  campaignId: string;
  onRuleCreated?: (rule: PersonalizationRule) => void;
}

export default function PersonalizationEngine({
  campaignId,
  onRuleCreated,
}: PersonalizationEngineProps) {
  const [rules, setRules] = useState<PersonalizationRule[]>([]);
  const [templates, setTemplates] = useState<PersonalizationTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("rules");

  // Form state for creating new personalization rule
  const [ruleForm, setRuleForm] = useState({
    name: "",
    trigger_event: "segment_match",
    conditions: {
      segment_id: "",
      behavior_pattern: "",
      engagement_level: "",
      time_condition: "",
    },
    actions: {
      content_variation: "",
      send_time_optimization: false,
      frequency_capping: "",
      channel_preference: "",
    },
    priority: 5,
    is_active: true,
  });

  // Form state for creating new template
  const [templateForm, setTemplateForm] = useState<{
    name: string;
    type: "email" | "sms" | "push" | "web";
    content_variables: string[];
    base_template: string;
    personalization_fields: Record<string, any>;
  }>({
    name: "",
    type: "email",
    content_variables: [],
    base_template: "",
    personalization_fields: {},
  });

  const loadPersonalizationData = async () => {
    try {
      setIsLoading(true);

      // Mock data for personalization rules and templates
      const mockRules: PersonalizationRule[] = [
        {
          id: "1",
          name: "Personalização por Segmento VIP",
          condition: {
            segment: "vip_customers",
            engagement_level: "high",
            last_purchase: "within_30_days",
          },
          action: {
            content_variation: "premium_offers",
            send_time: "optimal_per_user",
            discount_level: "20_percent",
          },
          priority: 9,
          is_active: true,
          performance_score: 8.7,
          created_at: new Date().toISOString(),
        },
        {
          id: "2",
          name: "Re-engajamento para Inativos",
          condition: {
            last_interaction: "over_90_days",
            purchase_history: "exists",
            email_engagement: "low",
          },
          action: {
            content_variation: "reactivation_offers",
            send_time: "previous_optimal",
            incentive: "progressive_discount",
          },
          priority: 7,
          is_active: true,
          performance_score: 6.3,
          created_at: new Date().toISOString(),
        },
      ];

      const mockTemplates: PersonalizationTemplate[] = [
        {
          id: "1",
          name: "Template VIP Personalizado",
          type: "email",
          content_variables: ["first_name", "last_purchase", "vip_tier", "exclusive_offer"],
          base_template:
            "Olá {{first_name}}, como membro {{vip_tier}}, temos uma oferta exclusiva...",
          personalization_fields: {
            greeting_style: "formal",
            offer_intensity: "high",
            urgency_level: "medium",
          },
          conversion_rate: 12.8,
          usage_count: 247,
        },
        {
          id: "2",
          name: "Template Re-engajamento",
          type: "email",
          content_variables: ["first_name", "last_visit", "favorite_category", "comeback_offer"],
          base_template:
            "Sentimos sua falta, {{first_name}}! Veja o que há de novo em {{favorite_category}}...",
          personalization_fields: {
            tone: "friendly",
            incentive_type: "discount",
            content_focus: "product_recommendations",
          },
          conversion_rate: 8.4,
          usage_count: 156,
        },
      ];

      setRules(mockRules);
      setTemplates(mockTemplates);
    } catch (error) {
      console.error("Error loading personalization data:", error);
      toast.error("Erro ao carregar dados de personalização");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPersonalizationData();
  }, [campaignId]);

  const handleCreateRule = async () => {
    try {
      const ruleData = {
        campaign_id: campaignId,
        name: ruleForm.name,
        condition: ruleForm.conditions,
        action: ruleForm.actions,
        priority: ruleForm.priority,
        is_active: ruleForm.is_active,
      };

      // In a real app, this would call the API
      console.log("Creating personalization rule:", ruleData);
      toast.success("Regra de personalização criada com sucesso!");

      // Reset form
      setRuleForm({
        name: "",
        trigger_event: "segment_match",
        conditions: {
          segment_id: "",
          behavior_pattern: "",
          engagement_level: "",
          time_condition: "",
        },
        actions: {
          content_variation: "",
          send_time_optimization: false,
          frequency_capping: "",
          channel_preference: "",
        },
        priority: 5,
        is_active: true,
      });

      loadPersonalizationData();
    } catch (error) {
      console.error("Error creating personalization rule:", error);
      toast.error("Erro ao criar regra de personalização");
    }
  };

  const handleCreateTemplate = async () => {
    try {
      const templateData = {
        campaign_id: campaignId,
        ...templateForm,
      };

      // In a real app, this would call the API
      console.log("Creating personalization template:", templateData);
      toast.success("Template de personalização criado com sucesso!");

      // Reset form
      setTemplateForm({
        name: "",
        type: "email",
        content_variables: [],
        base_template: "",
        personalization_fields: {},
      });

      loadPersonalizationData();
    } catch (error) {
      console.error("Error creating personalization template:", error);
      toast.error("Erro ao criar template de personalização");
    }
  };

  const getPriorityBadge = (priority: number) => {
    if (priority >= 8) return <Badge className="bg-red-500 text-white">Alta</Badge>;
    if (priority >= 5) return <Badge className="bg-yellow-500 text-white">Média</Badge>;
    return <Badge className="bg-green-500 text-white">Baixa</Badge>;
  };

  const getPerformanceColor = (score?: number) => {
    if (!score) return "text-gray-500";
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const addContentVariable = () => {
    const newVar = prompt("Nome da variável (ex: first_name):");
    if (newVar && !templateForm.content_variables.includes(newVar)) {
      setTemplateForm((prev) => ({
        ...prev,
        content_variables: [...prev.content_variables, newVar],
      }));
    }
  };

  const removeContentVariable = (variable: string) => {
    setTemplateForm((prev) => ({
      ...prev,
      content_variables: prev.content_variables.filter((v) => v !== variable),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6" />
            Engine de Personalização
          </h2>
          <p className="text-muted-foreground">
            Configure regras inteligentes para personalizar automaticamente suas campanhas
          </p>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Regras Ativas</p>
                <p className="text-2xl font-bold">{rules.filter((r) => r.is_active).length}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Templates</p>
                <p className="text-2xl font-bold">{templates.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Performance Média</p>
                <p className="text-2xl font-bold">7.5</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Uplift Médio</p>
                <p className="text-2xl font-bold text-green-600">+24%</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rules">Regras de Personalização</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Personalization Rules Tab */}
        <TabsContent value="rules" className="space-y-6">
          {/* Create New Rule */}
          <Card>
            <CardHeader>
              <CardTitle>Nova Regra de Personalização</CardTitle>
              <CardDescription>
                Configure quando e como personalizar o conteúdo da campanha
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rule_name">Nome da Regra</Label>
                  <Input
                    id="rule_name"
                    value={ruleForm.name}
                    onChange={(e) => setRuleForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Personalização VIP"
                  />
                </div>

                <div>
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select
                    value={ruleForm.priority.toString()}
                    onValueChange={(value) =>
                      setRuleForm((prev) => ({
                        ...prev,
                        priority: parseInt(value),
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Muito Baixa</SelectItem>
                      <SelectItem value="3">3 - Baixa</SelectItem>
                      <SelectItem value="5">5 - Média</SelectItem>
                      <SelectItem value="7">7 - Alta</SelectItem>
                      <SelectItem value="9">9 - Muito Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Conditions */}
              <div className="space-y-3">
                <Label>Condições de Ativação</Label>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="segment_id">Segmento</Label>
                    <Select
                      value={ruleForm.conditions.segment_id}
                      onValueChange={(value) =>
                        setRuleForm((prev) => ({
                          ...prev,
                          conditions: { ...prev.conditions, segment_id: value },
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o segmento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vip">Clientes VIP</SelectItem>
                        <SelectItem value="new">Novos Clientes</SelectItem>
                        <SelectItem value="inactive">Inativos</SelectItem>
                        <SelectItem value="high_value">Alto Valor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="engagement_level">Nível de Engajamento</Label>
                    <Select
                      value={ruleForm.conditions.engagement_level}
                      onValueChange={(value) =>
                        setRuleForm((prev) => ({
                          ...prev,
                          conditions: {
                            ...prev.conditions,
                            engagement_level: value,
                          },
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o nível" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">Alto</SelectItem>
                        <SelectItem value="medium">Médio</SelectItem>
                        <SelectItem value="low">Baixo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Label>Ações de Personalização</Label>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="content_variation">Variação de Conteúdo</Label>
                    <Select
                      value={ruleForm.actions.content_variation}
                      onValueChange={(value) =>
                        setRuleForm((prev) => ({
                          ...prev,
                          actions: {
                            ...prev.actions,
                            content_variation: value,
                          },
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo de variação" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="premium_offers">Ofertas Premium</SelectItem>
                        <SelectItem value="discount_focus">Foco em Desconto</SelectItem>
                        <SelectItem value="product_recs">Recomendações</SelectItem>
                        <SelectItem value="urgency">Urgência</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="channel_preference">Canal Preferido</Label>
                    <Select
                      value={ruleForm.actions.channel_preference}
                      onValueChange={(value) =>
                        setRuleForm((prev) => ({
                          ...prev,
                          actions: {
                            ...prev.actions,
                            channel_preference: value,
                          },
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Canal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="push">Push</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="send_time_optimization"
                    checked={ruleForm.actions.send_time_optimization}
                    onCheckedChange={(checked) =>
                      setRuleForm((prev) => ({
                        ...prev,
                        actions: {
                          ...prev.actions,
                          send_time_optimization: checked,
                        },
                      }))
                    }
                  />
                  <Label htmlFor="send_time_optimization">Otimização de Horário de Envio</Label>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={ruleForm.is_active}
                  onCheckedChange={(checked) =>
                    setRuleForm((prev) => ({
                      ...prev,
                      is_active: checked,
                    }))
                  }
                />
                <Label htmlFor="is_active">Regra Ativa</Label>
              </div>

              <Button onClick={handleCreateRule} disabled={!ruleForm.name} className="w-full">
                Criar Regra de Personalização
              </Button>
            </CardContent>
          </Card>

          {/* Existing Rules */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Regras Configuradas ({rules.length})</h3>

            {rules.map((rule) => (
              <Card key={rule.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{rule.name}</CardTitle>
                      <CardDescription>
                        Criada em {new Date(rule.created_at).toLocaleDateString("pt-BR")}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getPriorityBadge(rule.priority)}
                      {rule.is_active ? (
                        <Badge className="bg-green-500 text-white">Ativa</Badge>
                      ) : (
                        <Badge variant="outline">Inativa</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Performance Score */}
                    {rule.performance_score && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Performance:</span>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`font-bold ${getPerformanceColor(rule.performance_score)}`}
                          >
                            {rule.performance_score.toFixed(1)}/10
                          </span>
                          <Progress value={rule.performance_score * 10} className="w-20" />
                        </div>
                      </div>
                    )}

                    <Separator />

                    {/* Rule Configuration */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-medium mb-2">Condições</h4>
                        <ul className="space-y-1 text-muted-foreground">
                          {Object.entries(rule.condition).map(([key, value]) => (
                            <li key={key}>
                              <span className="capitalize">{key.replace("_", " ")}: </span>
                              {typeof value === "string" ? value : JSON.stringify(value)}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Ações</h4>
                        <ul className="space-y-1 text-muted-foreground">
                          {Object.entries(rule.action).map(([key, value]) => (
                            <li key={key}>
                              <span className="capitalize">{key.replace("_", " ")}: </span>
                              {typeof value === "string" ? value : JSON.stringify(value)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Performance
                      </Button>
                      <Button variant="outline" size="sm">
                        {rule.is_active ? "Desativar" : "Ativar"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          {/* Create New Template */}
          <Card>
            <CardHeader>
              <CardTitle>Novo Template de Personalização</CardTitle>
              <CardDescription>
                Crie templates reutilizáveis com variáveis dinâmicas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="template_name">Nome do Template</Label>
                  <Input
                    id="template_name"
                    value={templateForm.name}
                    onChange={(e) =>
                      setTemplateForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Ex: Email VIP Personalizado"
                  />
                </div>

                <div>
                  <Label htmlFor="template_type">Tipo de Template</Label>
                  <Select
                    value={templateForm.type}
                    onValueChange={(value) =>
                      setTemplateForm((prev) => ({
                        ...prev,
                        type: value as "email" | "sms" | "push" | "web",
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="push">Push Notification</SelectItem>
                      <SelectItem value="web">Web</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Content Variables */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Variáveis de Conteúdo</Label>
                  <Button onClick={addContentVariable} variant="outline" size="sm">
                    Adicionar Variável
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {templateForm.content_variables.map((variable) => (
                    <Badge key={variable} variant="outline" className="flex items-center gap-1">
                      {`{{${variable}}}`}
                      <button
                        onClick={() => removeContentVariable(variable)}
                        className="ml-1 text-xs hover:text-red-500"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="base_template">Template Base</Label>
                <Textarea
                  id="base_template"
                  value={templateForm.base_template}
                  onChange={(e) =>
                    setTemplateForm((prev) => ({
                      ...prev,
                      base_template: e.target.value,
                    }))
                  }
                  placeholder="Ex: Olá {{first_name}}, como membro {{vip_tier}}..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use {`{{variable}}`} para inserir variáveis dinâmicas
                </p>
              </div>

              <Button
                onClick={handleCreateTemplate}
                disabled={!templateForm.name || !templateForm.base_template}
                className="w-full"
              >
                Criar Template
              </Button>
            </CardContent>
          </Card>

          {/* Existing Templates */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Templates Criados ({templates.length})</h3>

            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription>
                        Tipo: {template.type.toUpperCase()} •{template.usage_count} usos
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{template.type}</Badge>
                      {template.conversion_rate && (
                        <Badge className="bg-green-500 text-white">
                          {template.conversion_rate}% conversão
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Template Preview */}
                    <div>
                      <h4 className="font-medium mb-2">Preview do Template</h4>
                      <div className="bg-gray-50 p-3 rounded-lg text-sm">
                        {template.base_template}
                      </div>
                    </div>

                    {/* Variables */}
                    <div>
                      <h4 className="font-medium mb-2">Variáveis Disponíveis</h4>
                      <div className="flex flex-wrap gap-2">
                        {template.content_variables.map((variable) => (
                          <Badge key={variable} variant="outline">
                            {`{{${variable}}}`}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                      <Button size="sm">Usar Template</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance da Personalização</CardTitle>
              <CardDescription>
                Análise de efetividade das regras e templates de personalização
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Overall Performance */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">+24%</div>
                    <div className="text-sm text-muted-foreground">Uplift em Conversão</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">+18%</div>
                    <div className="text-sm text-muted-foreground">Melhoria em Engajamento</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">87%</div>
                    <div className="text-sm text-muted-foreground">Taxa de Acerto</div>
                  </div>
                </div>

                <Separator />

                {/* Top Performing Rules */}
                <div>
                  <h4 className="font-medium mb-3">Regras com Melhor Performance</h4>
                  <div className="space-y-2">
                    {rules
                      .filter((r) => r.performance_score)
                      .sort((a, b) => (b.performance_score || 0) - (a.performance_score || 0))
                      .slice(0, 3)
                      .map((rule, index) => (
                        <div
                          key={rule.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="text-lg font-bold text-muted-foreground">
                              #{index + 1}
                            </div>
                            <div>
                              <div className="font-medium">{rule.name}</div>
                              <div className="text-sm text-muted-foreground">
                                Prioridade: {rule.priority}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div
                              className={`font-bold ${getPerformanceColor(rule.performance_score)}`}
                            >
                              {rule.performance_score?.toFixed(1)}/10
                            </div>
                            <div className="text-sm text-green-600">
                              +{Math.round((rule.performance_score || 0) * 3)}% uplift
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <h4 className="font-medium mb-3">Recomendações de Otimização</h4>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <div className="font-medium">Expandir Regra VIP</div>
                        <div className="text-sm text-muted-foreground">
                          A regra para clientes VIP está performando muito bem. Considere criar
                          variações para diferentes níveis VIP.
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div>
                        <div className="font-medium">Otimizar Timing</div>
                        <div className="text-sm text-muted-foreground">
                          Algumas regras podem se beneficiar de horários de envio mais específicos
                          baseados no comportamento do usuário.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

'use client';

/**
 * Story 11.3: Inventory Configuration Component
 * System configuration and settings management
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  InventoryConfig,
  type ConfigurationSettings,
  type AlertRule,
  type AutomationRule
} from '@/lib/inventory';
import { useToast } from '@/hooks/use-toast';

interface InventoryConfigurationProps {
  onRefresh: () => void;
  className?: string;
}

interface ConfigFormData {
  fifo_enabled: boolean;
  auto_alerts: boolean;
  cost_tracking: boolean;
  transfer_approval_required: boolean;
  min_stock_threshold: number;
  expiry_warning_days: number;
  consumption_forecast_days: number;
  efficiency_target: number;
  auto_reorder_enabled: boolean;
  reorder_lead_time: number;
}

interface AlertRuleFormData {
  name: string;
  type: string;
  threshold: number;
  severity: string;
  enabled: boolean;
  description: string;
}

export function InventoryConfiguration({ onRefresh, className }: InventoryConfigurationProps) {
  const [config, setConfig] = useState<ConfigurationSettings | null>(null);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [configForm, setConfigForm] = useState<ConfigFormData>({
    fifo_enabled: true,
    auto_alerts: true,
    cost_tracking: true,
    transfer_approval_required: true,
    min_stock_threshold: 10,
    expiry_warning_days: 30,
    consumption_forecast_days: 30,
    efficiency_target: 85,
    auto_reorder_enabled: false,
    reorder_lead_time: 7
  });
  const [alertRuleForm, setAlertRuleForm] = useState<AlertRuleFormData>({
    name: '',
    type: 'stock_low',
    threshold: 10,
    severity: 'media',
    enabled: true,
    description: ''
  });
  const [isEditingRule, setIsEditingRule] = useState<string | null>(null);
  const { toast } = useToast();

  const inventoryConfig = new InventoryConfig();

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      setIsLoading(true);

      // Load general configuration
      const { data: configData, error: configError } = await inventoryConfig.getConfiguration();
      
      if (configError) {
        console.warn('Config error:', configError);
      } else if (configData) {
        setConfig(configData);
        setConfigForm({
          fifo_enabled: configData.fifo_enabled,
          auto_alerts: configData.auto_alerts,
          cost_tracking: configData.cost_tracking,
          transfer_approval_required: configData.transfer_approval_required,
          min_stock_threshold: configData.min_stock_threshold,
          expiry_warning_days: configData.expiry_warning_days,
          consumption_forecast_days: configData.consumption_forecast_days,
          efficiency_target: configData.efficiency_target,
          auto_reorder_enabled: configData.auto_reorder_enabled,
          reorder_lead_time: configData.reorder_lead_time
        });
      }

      // Load alert rules
      const { data: alertRulesData, error: alertRulesError } = await inventoryConfig.getAlertRules();
      
      if (alertRulesError) {
        console.warn('Alert rules error:', alertRulesError);
      } else {
        setAlertRules(alertRulesData || []);
      }

      // Load automation rules
      const { data: automationRulesData, error: automationRulesError } = await inventoryConfig.getAutomationRules();
      
      if (automationRulesError) {
        console.warn('Automation rules error:', automationRulesError);
      } else {
        setAutomationRules(automationRulesData || []);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar configurações';
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfiguration = async () => {
    try {
      setIsSaving(true);

      const { error } = await inventoryConfig.updateConfiguration(configForm);

      if (error) {
        throw new Error(error);
      }

      toast({
        title: 'Sucesso',
        description: 'Configurações salvas com sucesso',
      });

      loadConfiguration();
      onRefresh();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar configurações';
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAlertRule = async () => {
    if (!alertRuleForm.name || !alertRuleForm.description) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (isEditingRule) {
        const { error } = await inventoryConfig.updateAlertRule(isEditingRule, alertRuleForm);
        if (error) throw new Error(error);
      } else {
        const { error } = await inventoryConfig.createAlertRule(alertRuleForm);
        if (error) throw new Error(error);
      }

      toast({
        title: 'Sucesso',
        description: isEditingRule ? 'Regra atualizada com sucesso' : 'Regra criada com sucesso',
      });

      setAlertRuleForm({
        name: '',
        type: 'stock_low',
        threshold: 10,
        severity: 'media',
        enabled: true,
        description: ''
      });
      setIsEditingRule(null);
      loadConfiguration();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar regra';
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAlertRule = async (ruleId: string) => {
    try {
      const { error } = await inventoryConfig.deleteAlertRule(ruleId);

      if (error) {
        throw new Error(error);
      }

      toast({
        title: 'Sucesso',
        description: 'Regra removida com sucesso',
      });

      loadConfiguration();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao remover regra';
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleEditAlertRule = (rule: AlertRule) => {
    setAlertRuleForm({
      name: rule.name,
      type: rule.type,
      threshold: rule.threshold,
      severity: rule.severity,
      enabled: rule.enabled,
      description: rule.description
    });
    setIsEditingRule(rule.id);
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      'baixa': 'bg-blue-100 text-blue-800',
      'media': 'bg-yellow-100 text-yellow-800',
      'alta': 'bg-red-100 text-red-800'
    };
    return colors[severity as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      'stock_low': 'Estoque Baixo',
      'expiry_warning': 'Vencimento Próximo',
      'efficiency_low': 'Eficiência Baixa',
      'cost_high': 'Custo Alto',
      'consumption_anomaly': 'Anomalia de Consumo'
    };
    return labels[type as keyof typeof labels] || type;
  };

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Configurações do Inventário</h2>
            <p className="text-muted-foreground">Configurações do sistema</p>
          </div>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="h-48 bg-gray-200 rounded animate-pulse" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Configurações do Inventário</h2>
          <p className="text-muted-foreground">
            Configurações e regras do sistema de inventário
          </p>
        </div>
        <Button variant="outline" onClick={loadConfiguration}>
          <Icons.RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Configuration Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="automation">Automação</TabsTrigger>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
        </TabsList>

        {/* General Configuration */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
              <CardDescription>
                Configurações básicas do sistema de inventário
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Core Features */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Funcionalidades Principais</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="fifo_enabled" className="text-sm">
                      Controle FIFO Ativado
                    </Label>
                    <Switch
                      id="fifo_enabled"
                      checked={configForm.fifo_enabled}
                      onCheckedChange={(checked) => 
                        setConfigForm(prev => ({ ...prev, fifo_enabled: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="auto_alerts" className="text-sm">
                      Alertas Automáticos
                    </Label>
                    <Switch
                      id="auto_alerts"
                      checked={configForm.auto_alerts}
                      onCheckedChange={(checked) => 
                        setConfigForm(prev => ({ ...prev, auto_alerts: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="cost_tracking" className="text-sm">
                      Rastreamento de Custos
                    </Label>
                    <Switch
                      id="cost_tracking"
                      checked={configForm.cost_tracking}
                      onCheckedChange={(checked) => 
                        setConfigForm(prev => ({ ...prev, cost_tracking: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="transfer_approval_required" className="text-sm">
                      Aprovação de Transferências
                    </Label>
                    <Switch
                      id="transfer_approval_required"
                      checked={configForm.transfer_approval_required}
                      onCheckedChange={(checked) => 
                        setConfigForm(prev => ({ ...prev, transfer_approval_required: checked }))
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Thresholds */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Limites e Parâmetros</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="min_stock_threshold">Limite Mínimo de Estoque (%)</Label>
                    <Input
                      id="min_stock_threshold"
                      type="number"
                      min="1"
                      max="100"
                      value={configForm.min_stock_threshold}
                      onChange={(e) => setConfigForm(prev => ({ 
                        ...prev, 
                        min_stock_threshold: parseInt(e.target.value) || 10 
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expiry_warning_days">Aviso de Vencimento (dias)</Label>
                    <Input
                      id="expiry_warning_days"
                      type="number"
                      min="1"
                      max="365"
                      value={configForm.expiry_warning_days}
                      onChange={(e) => setConfigForm(prev => ({ 
                        ...prev, 
                        expiry_warning_days: parseInt(e.target.value) || 30 
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="consumption_forecast_days">Previsão de Consumo (dias)</Label>
                    <Input
                      id="consumption_forecast_days"
                      type="number"
                      min="7"
                      max="365"
                      value={configForm.consumption_forecast_days}
                      onChange={(e) => setConfigForm(prev => ({ 
                        ...prev, 
                        consumption_forecast_days: parseInt(e.target.value) || 30 
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="efficiency_target">Meta de Eficiência (%)</Label>
                    <Input
                      id="efficiency_target"
                      type="number"
                      min="50"
                      max="100"
                      value={configForm.efficiency_target}
                      onChange={(e) => setConfigForm(prev => ({ 
                        ...prev, 
                        efficiency_target: parseInt(e.target.value) || 85 
                      }))}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Auto Reorder */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Reposição Automática</h4>
                <div className="flex items-center justify-between space-x-2 mb-4">
                  <Label htmlFor="auto_reorder_enabled" className="text-sm">
                    Reposição Automática Ativada
                  </Label>
                  <Switch
                    id="auto_reorder_enabled"
                    checked={configForm.auto_reorder_enabled}
                    onCheckedChange={(checked) => 
                      setConfigForm(prev => ({ ...prev, auto_reorder_enabled: checked }))
                    }
                  />
                </div>

                {configForm.auto_reorder_enabled && (
                  <div className="space-y-2">
                    <Label htmlFor="reorder_lead_time">Lead Time para Reposição (dias)</Label>
                    <Input
                      id="reorder_lead_time"
                      type="number"
                      min="1"
                      max="30"
                      value={configForm.reorder_lead_time}
                      onChange={(e) => setConfigForm(prev => ({ 
                        ...prev, 
                        reorder_lead_time: parseInt(e.target.value) || 7 
                      }))}
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveConfiguration} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Icons.Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Icons.Save className="w-4 h-4 mr-2" />
                      Salvar Configurações
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alert Rules */}
        <TabsContent value="alerts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Alert Rules Form */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {isEditingRule ? 'Editar Regra de Alerta' : 'Nova Regra de Alerta'}
                </CardTitle>
                <CardDescription>
                  Configure regras personalizadas para alertas automáticos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rule_name">Nome da Regra *</Label>
                  <Input
                    id="rule_name"
                    value={alertRuleForm.name}
                    onChange={(e) => setAlertRuleForm(prev => ({ 
                      ...prev, 
                      name: e.target.value 
                    }))}
                    placeholder="Ex: Estoque Crítico Medicamentos"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rule_type">Tipo de Alerta</Label>
                  <Select 
                    value={alertRuleForm.type} 
                    onValueChange={(value) => setAlertRuleForm(prev => ({ 
                      ...prev, 
                      type: value 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stock_low">Estoque Baixo</SelectItem>
                      <SelectItem value="expiry_warning">Vencimento Próximo</SelectItem>
                      <SelectItem value="efficiency_low">Eficiência Baixa</SelectItem>
                      <SelectItem value="cost_high">Custo Alto</SelectItem>
                      <SelectItem value="consumption_anomaly">Anomalia de Consumo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rule_threshold">Limite/Threshold</Label>
                  <Input
                    id="rule_threshold"
                    type="number"
                    value={alertRuleForm.threshold}
                    onChange={(e) => setAlertRuleForm(prev => ({ 
                      ...prev, 
                      threshold: parseInt(e.target.value) || 0 
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rule_severity">Severidade</Label>
                  <Select 
                    value={alertRuleForm.severity} 
                    onValueChange={(value) => setAlertRuleForm(prev => ({ 
                      ...prev, 
                      severity: value 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rule_description">Descrição *</Label>
                  <Textarea
                    id="rule_description"
                    value={alertRuleForm.description}
                    onChange={(e) => setAlertRuleForm(prev => ({ 
                      ...prev, 
                      description: e.target.value 
                    }))}
                    placeholder="Descreva quando e como este alerta deve ser acionado..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="rule_enabled" className="text-sm">
                    Regra Ativa
                  </Label>
                  <Switch
                    id="rule_enabled"
                    checked={alertRuleForm.enabled}
                    onCheckedChange={(checked) => 
                      setAlertRuleForm(prev => ({ ...prev, enabled: checked }))
                    }
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSaveAlertRule} className="flex-1">
                    {isEditingRule ? 'Atualizar Regra' : 'Criar Regra'}
                  </Button>
                  {isEditingRule && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsEditingRule(null);
                        setAlertRuleForm({
                          name: '',
                          type: 'stock_low',
                          threshold: 10,
                          severity: 'media',
                          enabled: true,
                          description: ''
                        });
                      }}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Existing Rules */}
            <Card>
              <CardHeader>
                <CardTitle>Regras Ativas</CardTitle>
                <CardDescription>
                  {alertRules.length} regra(s) configurada(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {alertRules.length === 0 ? (
                  <div className="text-center py-8">
                    <Icons.Bell className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhuma regra configurada
                    </h3>
                    <p className="text-gray-500">
                      Crie regras personalizadas para alertas automáticos.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Limite</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {alertRules.map((rule) => (
                        <TableRow key={rule.id}>
                          <TableCell className="font-medium">{rule.name}</TableCell>
                          <TableCell>{getTypeLabel(rule.type)}</TableCell>
                          <TableCell>{rule.threshold}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Badge className={getSeverityColor(rule.severity)}>
                                {rule.severity}
                              </Badge>
                              {rule.enabled ? (
                                <Badge variant="default">Ativa</Badge>
                              ) : (
                                <Badge variant="secondary">Inativa</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditAlertRule(rule)}
                              >
                                <Icons.Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteAlertRule(rule.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Icons.Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Automation Rules */}
        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Regras de Automação</CardTitle>
              <CardDescription>
                Configure automações para otimizar processos do inventário
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Icons.Zap className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Em Desenvolvimento
                </h3>
                <p className="text-gray-500">
                  Funcionalidades de automação serão implementadas em breve.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Integrações Externas</CardTitle>
              <CardDescription>
                Configure integrações com sistemas externos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Icons.Globe className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Em Desenvolvimento
                </h3>
                <p className="text-gray-500">
                  Integrações com fornecedores e sistemas ERP serão implementadas em breve.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
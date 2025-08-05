/**
 * Alert Manager Component for NeonPro
 * Interface completa para gerenciamento de alertas financeiros
 */

"use client";

import type {
  AlertTriangle,
  Bell,
  BellOff,
  CheckCircle,
  Clock,
  Filter,
  Plus,
  Settings,
} from "lucide-react";
import React, { useState } from "react";
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
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Switch } from "@/components/ui/switch";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  useAlertChannelConfig,
  useAlertResolution,
  useAlertRuleCreation,
  useAlertRuleTemplates,
  useAlertStatistics,
  useFinancialAlerts,
  useRealTimeAlerts,
} from "@/lib/financial/hooks/use-alert-system";
import type { AlertChannel, AlertSeverity, AlertType } from "@/lib/financial/types/cash-flow";

interface AlertManagerProps {
  userId: string;
}

export function AlertManager({ userId }: AlertManagerProps) {
  const [selectedTab, setSelectedTab] = useState("active");
  const [filterSeverity, setFilterSeverity] = useState<AlertSeverity | undefined>();
  const [filterType, setFilterType] = useState<AlertType | undefined>();

  const { alerts, isLoading, refetch } = useFinancialAlerts(filterSeverity, filterType);
  const { resolveAlert, isResolving } = useAlertResolution();
  const { statistics } = useAlertStatistics(30);
  const { alerts: realTimeAlerts, unreadCount, markAsRead } = useRealTimeAlerts();

  const activeAlerts = alerts.filter((alert) => !alert.is_resolved);
  const resolvedAlerts = alerts.filter((alert) => alert.is_resolved);

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-300";
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "info":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "info":
        return <Bell className="h-4 w-4 text-blue-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleResolveAlert = (alertId: string, resolution: string) => {
    resolveAlert({ alertId, resolution, userId });
    markAsRead(alertId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando alertas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{activeAlerts.length}</p>
                <p className="text-sm text-muted-foreground">Alertas Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{resolvedAlerts.length}</p>
                <p className="text-sm text-muted-foreground">Resolvidos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">
                  {statistics?.average_resolution_time
                    ? `${Math.round(statistics.average_resolution_time / 60)}h`
                    : "0h"}
                </p>
                <p className="text-sm text-muted-foreground">Tempo Médio</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{unreadCount}</p>
                <p className="text-sm text-muted-foreground">Não Lidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Ações */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gerenciamento de Alertas</CardTitle>
              <CardDescription>
                Monitore e gerencie alertas financeiros em tempo real
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <CreateAlertRuleDialog userId={userId} />
              <AlertSettingsDialog />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <Label>Filtros:</Label>
            </div>
            <Select
              value={filterSeverity}
              onValueChange={(value) => setFilterSeverity(value as AlertSeverity)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Severidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="critical">Crítico</SelectItem>
                <SelectItem value="warning">Aviso</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={(value) => setFilterType(value as AlertType)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low_balance">Saldo Baixo</SelectItem>
                <SelectItem value="negative_cash_flow">Cash Flow Negativo</SelectItem>
                <SelectItem value="high_expenses">Despesas Altas</SelectItem>
                <SelectItem value="budget_exceeded">Orçamento Excedido</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFilterSeverity(undefined);
                setFilterType(undefined);
              }}
            >
              Limpar Filtros
            </Button>
          </div>

          {/* Tabs de Alertas */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList>
              <TabsTrigger value="active">Ativos ({activeAlerts.length})</TabsTrigger>
              <TabsTrigger value="resolved">Resolvidos ({resolvedAlerts.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              {activeAlerts.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <p className="text-lg font-medium">Nenhum alerta ativo</p>
                  <p className="text-muted-foreground">
                    Todos os indicadores financeiros estão dentro dos parâmetros normais
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {activeAlerts.map((alert) => (
                    <AlertCard
                      key={alert.id}
                      alert={alert}
                      onResolve={handleResolveAlert}
                      isResolving={isResolving}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="resolved" className="space-y-4">
              {resolvedAlerts.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium">Nenhum alerta resolvido</p>
                  <p className="text-muted-foreground">
                    Histórico de alertas resolvidos aparecerá aqui
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {resolvedAlerts.map((alert) => (
                    <AlertCard key={alert.id} alert={alert} isResolved />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente para Card de Alerta Individual
interface AlertCardProps {
  alert: any;
  onResolve?: (alertId: string, resolution: string) => void;
  isResolving?: boolean;
  isResolved?: boolean;
}

function AlertCard({ alert, onResolve, isResolving, isResolved }: AlertCardProps) {
  const [resolution, setResolution] = useState("");
  const [showResolveDialog, setShowResolveDialog] = useState(false);

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-300";
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "info":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <Card className={`${isResolved ? "opacity-60" : ""}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Badge className={getSeverityColor(alert.severity)}>
                {alert.severity.toUpperCase()}
              </Badge>
              <Badge variant="outline">{alert.type.replace("_", " ").toUpperCase()}</Badge>
              {isResolved && (
                <Badge className="bg-green-100 text-green-800 border-green-300">RESOLVIDO</Badge>
              )}
            </div>

            <h3 className="font-semibold text-lg mb-2">{alert.title}</h3>
            <p className="text-muted-foreground mb-4">{alert.message}</p>

            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>Criado: {new Date(alert.created_at).toLocaleString("pt-BR")}</span>
              {alert.resolved_at && (
                <span>Resolvido: {new Date(alert.resolved_at).toLocaleString("pt-BR")}</span>
              )}
            </div>

            {alert.resolution && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">
                  <strong>Resolução:</strong> {alert.resolution}
                </p>
              </div>
            )}
          </div>

          {!isResolved && onResolve && (
            <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
              <DialogTrigger asChild>
                <Button size="sm">Resolver</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Resolver Alerta</DialogTitle>
                  <DialogDescription>
                    Descreva como este alerta foi resolvido para referência futura.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="resolution">Descrição da Resolução</Label>
                    <Input
                      id="resolution"
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      placeholder="Ex: Transferência realizada para normalizar saldo"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowResolveDialog(false)}>
                      Cancelar
                    </Button>
                    <Button
                      onClick={() => {
                        onResolve(alert.id, resolution);
                        setShowResolveDialog(false);
                        setResolution("");
                      }}
                      disabled={!resolution.trim() || isResolving}
                    >
                      {isResolving ? "Resolvendo..." : "Confirmar"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Dialog para criar nova regra de alerta
function CreateAlertRuleDialog({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const { createRule, isCreating } = useAlertRuleCreation();
  const { templates, createFromTemplate } = useAlertRuleTemplates();

  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [ruleName, setRuleName] = useState("");
  const [threshold, setThreshold] = useState("");

  const handleCreateRule = () => {
    if (!selectedTemplate || !ruleName || !threshold) return;

    const template = createFromTemplate(selectedTemplate, {
      name: ruleName,
      condition: {
        ...templates.find((t) => t.id === selectedTemplate)?.template.condition,
        threshold: parseFloat(threshold),
      },
    });

    if (template) {
      createRule(template);
      setOpen(false);
      setSelectedTemplate("");
      setRuleName("");
      setThreshold("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Regra
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Nova Regra de Alerta</DialogTitle>
          <DialogDescription>
            Configure uma nova regra para monitoramento automático
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="template">Template</Label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="ruleName">Nome da Regra</Label>
            <Input
              id="ruleName"
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
              placeholder="Ex: Monitoramento Saldo Conta Principal"
            />
          </div>

          <div>
            <Label htmlFor="threshold">Valor Limite</Label>
            <Input
              id="threshold"
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              placeholder="Ex: 5000"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreateRule}
              disabled={!selectedTemplate || !ruleName || !threshold || isCreating}
            >
              {isCreating ? "Criando..." : "Criar Regra"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Dialog para configurações de alertas
function AlertSettingsDialog() {
  const [open, setOpen] = useState(false);
  const { config, updateChannelConfig } = useAlertChannelConfig();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Configurações
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configurações de Alerta</DialogTitle>
          <DialogDescription>Configure como e quando receber notificações</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Email */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-enabled">Notificações por Email</Label>
              <Switch
                id="email-enabled"
                checked={config.email.enabled}
                onCheckedChange={(enabled) => updateChannelConfig("email", { enabled })}
              />
            </div>
            {config.email.enabled && (
              <div className="ml-4 space-y-2">
                <Select
                  value={config.email.severityThreshold}
                  onValueChange={(value) =>
                    updateChannelConfig("email", { severityThreshold: value as AlertSeverity })
                  }
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Todos os alertas</SelectItem>
                    <SelectItem value="warning">Avisos e críticos</SelectItem>
                    <SelectItem value="critical">Apenas críticos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Dashboard */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="dashboard-enabled">Notificações no Dashboard</Label>
              <Switch
                id="dashboard-enabled"
                checked={config.dashboard.enabled}
                onCheckedChange={(enabled) => updateChannelConfig("dashboard", { enabled })}
              />
            </div>
            {config.dashboard.enabled && (
              <div className="ml-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-refresh">Atualização Automática</Label>
                  <Switch
                    id="auto-refresh"
                    checked={config.dashboard.autoRefresh}
                    onCheckedChange={(autoRefresh) =>
                      updateChannelConfig("dashboard", { autoRefresh })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="sound-alerts">Alertas Sonoros</Label>
                  <Switch
                    id="sound-alerts"
                    checked={config.dashboard.soundAlerts}
                    onCheckedChange={(soundAlerts) =>
                      updateChannelConfig("dashboard", { soundAlerts })
                    }
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

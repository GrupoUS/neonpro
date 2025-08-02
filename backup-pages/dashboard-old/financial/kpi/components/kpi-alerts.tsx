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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  CheckCircle,
  Clock,
  Edit,
  Mail,
  Monitor,
  Plus,
  Settings,
  Smartphone,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";

interface KPIAlert {
  id: string;
  kpiId: string;
  kpiName: string;
  alertType: "threshold" | "trend" | "anomaly";
  severity: "low" | "medium" | "high" | "critical";
  condition: "above" | "below" | "equals" | "changes_by";
  threshold: number;
  currentValue: number;
  triggeredAt: Date;
  acknowledged: boolean;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  notificationChannels: ("email" | "sms" | "push" | "dashboard")[];
  escalationRules: EscalationRule[];
  isActive: boolean;
  message: string;
  description?: string;
}

interface EscalationRule {
  id: string;
  delayMinutes: number;
  recipients: string[];
  channels: ("email" | "sms" | "push")[];
  escalationLevel: number;
}

interface AlertRule {
  id: string;
  name: string;
  kpiId: string;
  kpiName: string;
  alertType: "threshold" | "trend" | "anomaly";
  conditions: {
    warningThreshold?: number;
    criticalThreshold?: number;
    trendPeriod?: number;
    trendThreshold?: number;
    operator: "above" | "below" | "equals" | "changes_by";
  };
  notificationSettings: {
    channels: ("email" | "sms" | "push" | "dashboard")[];
    recipients: string[];
    escalationEnabled: boolean;
    escalationDelayMinutes: number;
  };
  schedule: {
    enabled: boolean;
    timezone: string;
    businessHoursOnly: boolean;
    businessHours: { start: string; end: string };
    businessDays: number[];
  };
  isEnabled: boolean;
  createdAt: Date;
  lastTriggered?: Date;
}

interface KPIAlertsProps {
  className?: string;
}

export function KPIAlerts({ className }: KPIAlertsProps) {
  const [alerts, setAlerts] = useState<KPIAlert[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<KPIAlert | null>(null);
  const [selectedRule, setSelectedRule] = useState<AlertRule | null>(null);
  const [showNewRule, setShowNewRule] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlertsAndRules();
  }, []);

  const loadAlertsAndRules = async () => {
    setLoading(true);

    // Mock data - In real implementation, this would come from Supabase
    const mockAlerts = generateMockAlerts();
    const mockRules = generateMockAlertRules();

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    setAlerts(mockAlerts);
    setAlertRules(mockRules);
    setLoading(false);
  };

  const acknowledgeAlert = async (alertId: string) => {
    setAlerts(
      alerts.map((alert) =>
        alert.id === alertId
          ? {
              ...alert,
              acknowledged: true,
              acknowledgedAt: new Date(),
              acknowledgedBy: "current_user", // In real implementation, get from auth
            }
          : alert
      )
    );
  };

  const dismissAlert = async (alertId: string) => {
    setAlerts(alerts.filter((alert) => alert.id !== alertId));
  };

  const createAlertRule = async (rule: Omit<AlertRule, "id" | "createdAt">) => {
    const newRule: AlertRule = {
      ...rule,
      id: `rule_${Date.now()}`,
      createdAt: new Date(),
    };

    setAlertRules([...alertRules, newRule]);
    setShowNewRule(false);
  };

  const updateAlertRule = async (updatedRule: AlertRule) => {
    setAlertRules(
      alertRules.map((rule) =>
        rule.id === updatedRule.id ? updatedRule : rule
      )
    );
    setSelectedRule(null);
  };

  const deleteAlertRule = async (ruleId: string) => {
    setAlertRules(alertRules.filter((rule) => rule.id !== ruleId));
    setSelectedRule(null);
  };

  const toggleRuleStatus = async (ruleId: string) => {
    setAlertRules(
      alertRules.map((rule) =>
        rule.id === ruleId ? { ...rule, isEnabled: !rule.isEnabled } : rule
      )
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-600 bg-red-50 border-red-200";
      case "high":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "high":
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case "medium":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-blue-600" />;
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "email":
        return <Mail className="h-4 w-4" />;
      case "sms":
        return <Smartphone className="h-4 w-4" />;
      case "push":
        return <Bell className="h-4 w-4" />;
      case "dashboard":
        return <Monitor className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(date);
  };

  const activeAlerts = alerts.filter((alert) => !alert.acknowledged);
  const acknowledgedAlerts = alerts.filter((alert) => alert.acknowledged);
  const enabledRules = alertRules.filter((rule) => rule.isEnabled);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Carregando alertas...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Alert Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Alertas Ativos
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {activeAlerts.length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Alertas Reconhecidos
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {acknowledgedAlerts.length}
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
                <p className="text-sm font-medium text-muted-foreground">
                  Regras Ativas
                </p>
                <p className="text-2xl font-bold">{enabledRules.length}</p>
              </div>
              <Settings className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Críticos
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {activeAlerts.filter((a) => a.severity === "critical").length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Alerts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Alertas Ativos ({activeAlerts.length})
              </CardTitle>
              <CardDescription>
                Alertas que requerem atenção imediata
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {activeAlerts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-medium">Nenhum alerta ativo</p>
              <p className="text-muted-foreground">
                Todos os KPIs estão dentro dos limites esperados
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeAlerts.map((alert) => (
                <Card
                  key={alert.id}
                  className={`border-l-4 ${getSeverityColor(alert.severity)}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getSeverityIcon(alert.severity)}
                          <h4 className="font-medium">{alert.kpiName}</h4>
                          <Badge
                            variant="outline"
                            className={getSeverityColor(alert.severity)}
                          >
                            {alert.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {alert.message}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTimestamp(alert.triggeredAt)}
                          </span>
                          <span>Valor: {alert.currentValue}</span>
                          <span>Limite: {alert.threshold}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-2">
                          {alert.notificationChannels.map((channel, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              <span className="flex items-center gap-1">
                                {getChannelIcon(channel)}
                                {channel}
                              </span>
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => acknowledgeAlert(alert.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Reconhecer
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => dismissAlert(alert.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alert Rules Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Regras de Alertas ({alertRules.length})
              </CardTitle>
              <CardDescription>
                Configure quando e como você deseja ser notificado
              </CardDescription>
            </div>
            <Dialog open={showNewRule} onOpenChange={setShowNewRule}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Regra
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Criar Nova Regra de Alerta</DialogTitle>
                  <DialogDescription>
                    Configure as condições e notificações para um KPI
                  </DialogDescription>
                </DialogHeader>
                <AlertRuleForm
                  onSave={createAlertRule}
                  onCancel={() => setShowNewRule(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>KPI</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Condições</TableHead>
                <TableHead>Canais</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alertRules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">{rule.name}</TableCell>
                  <TableCell>{rule.kpiName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {rule.alertType === "threshold" && "Limite"}
                      {rule.alertType === "trend" && "Tendência"}
                      {rule.alertType === "anomaly" && "Anomalia"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {rule.conditions.warningThreshold && (
                        <div>Aviso: {rule.conditions.warningThreshold}</div>
                      )}
                      {rule.conditions.criticalThreshold && (
                        <div>Crítico: {rule.conditions.criticalThreshold}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {rule.notificationSettings.channels.map(
                        (channel, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {getChannelIcon(channel)}
                          </Badge>
                        )
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={rule.isEnabled}
                      onCheckedChange={() => toggleRuleStatus(rule.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedRule(rule)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteAlertRule(rule.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// Alert Rule Form Component
function AlertRuleForm({
  rule,
  onSave,
  onCancel,
}: {
  rule?: AlertRule;
  onSave: (rule: Omit<AlertRule, "id" | "createdAt">) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: rule?.name || "",
    kpiId: rule?.kpiId || "",
    kpiName: rule?.kpiName || "",
    alertType: rule?.alertType || "threshold",
    warningThreshold: rule?.conditions.warningThreshold || "",
    criticalThreshold: rule?.conditions.criticalThreshold || "",
    operator: rule?.conditions.operator || "above",
    channels: rule?.notificationSettings.channels || ["dashboard"],
    recipients: rule?.notificationSettings.recipients.join(", ") || "",
    isEnabled: rule?.isEnabled ?? true,
  });

  const handleSave = () => {
    const newRule: Omit<AlertRule, "id" | "createdAt"> = {
      name: formData.name,
      kpiId: formData.kpiId,
      kpiName: formData.kpiName,
      alertType: formData.alertType as any,
      conditions: {
        warningThreshold: Number(formData.warningThreshold),
        criticalThreshold: Number(formData.criticalThreshold),
        operator: formData.operator as any,
      },
      notificationSettings: {
        channels: formData.channels as any,
        recipients: formData.recipients
          .split(",")
          .map((r) => r.trim())
          .filter(Boolean),
        escalationEnabled: false,
        escalationDelayMinutes: 30,
      },
      schedule: {
        enabled: true,
        timezone: "America/Sao_Paulo",
        businessHoursOnly: false,
        businessHours: { start: "09:00", end: "18:00" },
        businessDays: [1, 2, 3, 4, 5],
      },
      isEnabled: formData.isEnabled,
    };

    onSave(newRule);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rule-name">Nome da Regra</Label>
          <Input
            id="rule-name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ex: Receita baixa"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="alert-type">Tipo de Alerta</Label>
          <Select
            value={formData.alertType}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                alertType: value as "threshold" | "trend" | "anomaly",
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="threshold">Limite</SelectItem>
              <SelectItem value="trend">Tendência</SelectItem>
              <SelectItem value="anomaly">Anomalia</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="warning-threshold">Limite de Aviso</Label>
          <Input
            id="warning-threshold"
            type="number"
            value={formData.warningThreshold}
            onChange={(e) =>
              setFormData({ ...formData, warningThreshold: e.target.value })
            }
            placeholder="1000"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="critical-threshold">Limite Crítico</Label>
          <Input
            id="critical-threshold"
            type="number"
            value={formData.criticalThreshold}
            onChange={(e) =>
              setFormData({ ...formData, criticalThreshold: e.target.value })
            }
            placeholder="500"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="recipients">
          Destinatários (emails separados por vírgula)
        </Label>
        <Input
          id="recipients"
          value={formData.recipients}
          onChange={(e) =>
            setFormData({ ...formData, recipients: e.target.value })
          }
          placeholder="admin@clinica.com, gerente@clinica.com"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="enabled"
          checked={formData.isEnabled}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, isEnabled: checked })
          }
        />
        <Label htmlFor="enabled">Regra ativa</Label>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={handleSave}>Salvar Regra</Button>
      </DialogFooter>
    </div>
  );
}

// Mock data generators
function generateMockAlerts(): KPIAlert[] {
  return [
    {
      id: "alert_1",
      kpiId: "total_revenue",
      kpiName: "Receita Total",
      alertType: "threshold",
      severity: "critical",
      condition: "below",
      threshold: 50000,
      currentValue: 42000,
      triggeredAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      acknowledged: false,
      notificationChannels: ["email", "dashboard"],
      escalationRules: [],
      isActive: true,
      message: "Receita total está 16% abaixo do limite mínimo esperado",
    },
    {
      id: "alert_2",
      kpiId: "patient_retention",
      kpiName: "Retenção de Pacientes",
      alertType: "trend",
      severity: "high",
      condition: "below",
      threshold: 85,
      currentValue: 78,
      triggeredAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      acknowledged: false,
      notificationChannels: ["email", "sms", "dashboard"],
      escalationRules: [],
      isActive: true,
      message: "Taxa de retenção de pacientes em queda nos últimos 7 dias",
    },
  ];
}

function generateMockAlertRules(): AlertRule[] {
  return [
    {
      id: "rule_1",
      name: "Receita Mensal Baixa",
      kpiId: "total_revenue",
      kpiName: "Receita Total",
      alertType: "threshold",
      conditions: {
        warningThreshold: 60000,
        criticalThreshold: 50000,
        operator: "below",
      },
      notificationSettings: {
        channels: ["email", "dashboard"],
        recipients: ["admin@clinica.com"],
        escalationEnabled: true,
        escalationDelayMinutes: 30,
      },
      schedule: {
        enabled: true,
        timezone: "America/Sao_Paulo",
        businessHoursOnly: false,
        businessHours: { start: "09:00", end: "18:00" },
        businessDays: [1, 2, 3, 4, 5],
      },
      isEnabled: true,
      createdAt: new Date(),
    },
    {
      id: "rule_2",
      name: "Margem de Lucro Crítica",
      kpiId: "gross_margin",
      kpiName: "Margem Bruta",
      alertType: "threshold",
      conditions: {
        warningThreshold: 60,
        criticalThreshold: 50,
        operator: "below",
      },
      notificationSettings: {
        channels: ["email", "sms", "dashboard"],
        recipients: ["gerente@clinica.com", "financeiro@clinica.com"],
        escalationEnabled: false,
        escalationDelayMinutes: 60,
      },
      schedule: {
        enabled: true,
        timezone: "America/Sao_Paulo",
        businessHoursOnly: true,
        businessHours: { start: "08:00", end: "19:00" },
        businessDays: [1, 2, 3, 4, 5],
      },
      isEnabled: true,
      createdAt: new Date(),
    },
  ];
}

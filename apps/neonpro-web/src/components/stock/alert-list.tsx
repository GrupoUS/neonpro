// Stock Alert List Component
// Story 11.4: Alertas e Relatórios de Estoque
// Lista e gerenciamento de configurações de alertas

"use client";

import type {
  AlertTriangle,
  Bell,
  Edit,
  Filter,
  MoreVertical,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import type {
  ALERT_TYPE_LABELS,
  AlertType,
  SEVERITY_LABELS,
  SeverityLevel,
  StockAlert,
  StockAlertConfig,
  StockAlertError,
} from "@/app/lib/types/stock";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Switch } from "@/components/ui/switch";

// =====================================================
// TYPES AND INTERFACES
// =====================================================

interface AlertListProps {
  configs: StockAlertConfig[];
  alerts: StockAlert[];
  onCreateNew: () => void;
  onEdit: (config: StockAlertConfig) => void;
  onDelete: (configId: string) => Promise<void>;
  onToggleActive: (configId: string, isActive: boolean) => Promise<void>;
  onAcknowledge: (alertId: string) => Promise<void>;
  onRefresh: () => Promise<void>;
  loading?: boolean;
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

const getSeverityColor = (severity: SeverityLevel): string => {
  switch (severity) {
    case "low":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "high":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "critical":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getAlertTypeIcon = (alertType: AlertType) => {
  const iconProps = { className: "h-4 w-4" };
  switch (alertType) {
    case "low_stock":
      return <AlertTriangle {...iconProps} />;
    case "expiring":
      return <Bell {...iconProps} />;
    case "expired":
      return <AlertTriangle {...iconProps} className="h-4 w-4 text-red-500" />;
    case "overstock":
      return <AlertTriangle {...iconProps} className="h-4 w-4 text-orange-500" />;
    default:
      return <Bell {...iconProps} />;
  }
};

// =====================================================
// MAIN COMPONENT
// =====================================================

const AlertList: React.FC<AlertListProps> = ({
  configs,
  alerts,
  onCreateNew,
  onEdit,
  onDelete,
  onToggleActive,
  onAcknowledge,
  onRefresh,
  loading = false,
}) => {
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // =====================================================
  // ACTION HANDLERS
  // =====================================================

  const handleToggleActive = async (configId: string, isActive: boolean) => {
    try {
      setActionError(null);
      setActionLoading(configId);
      await onToggleActive(configId, isActive);
    } catch (error) {
      if (error instanceof StockAlertError) {
        setActionError(error.message);
      } else {
        setActionError("Falha ao atualizar status do alerta");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (configId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta configuração de alerta?")) {
      return;
    }

    try {
      setActionError(null);
      setActionLoading(configId);
      await onDelete(configId);
    } catch (error) {
      if (error instanceof StockAlertError) {
        setActionError(error.message);
      } else {
        setActionError("Falha ao excluir configuração de alerta");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleAcknowledge = async (alertId: string) => {
    try {
      setActionError(null);
      setActionLoading(alertId);
      await onAcknowledge(alertId);
    } catch (error) {
      if (error instanceof StockAlertError) {
        setActionError(error.message);
      } else {
        setActionError("Falha ao confirmar alerta");
      }
    } finally {
      setActionLoading(null);
    }
  };

  // =====================================================
  // COMPUTED VALUES
  // =====================================================

  const activeAlerts = alerts.filter((alert) => !alert.acknowledgedAt);
  const criticalAlerts = activeAlerts.filter((alert) => alert.severityLevel === "critical");

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Alertas de Estoque</h2>
          <p className="text-muted-foreground">
            Gerencie configurações de alertas e monitore notificações ativas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          <Button onClick={onCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Configuração
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {actionError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Ativos</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAlerts.length}</div>
            <p className="text-xs text-muted-foreground">{criticalAlerts.length} críticos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Configurações</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{configs.length}</div>
            <p className="text-xs text-muted-foreground">
              {configs.filter((c) => c.isActive).length} ativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Resposta</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {alerts.length > 0
                ? Math.round((alerts.filter((a) => a.acknowledgedAt).length / alerts.length) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">alertas confirmados</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Alertas Pendentes
            </CardTitle>
            <CardDescription>Alertas que requerem atenção imediata</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getAlertTypeIcon(alert.alertType)}
                    <div>
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(alert.triggeredAt).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getSeverityColor(alert.severityLevel)}>
                      {SEVERITY_LABELS[alert.severityLevel]}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAcknowledge(alert.id)}
                      disabled={actionLoading === alert.id}
                    >
                      Confirmar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alert Configurations */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Alertas</CardTitle>
          <CardDescription>
            Gerencie as regras de alertas automáticos para seu estoque
          </CardDescription>
        </CardHeader>
        <CardContent>
          {configs.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma configuração encontrada</h3>
              <p className="text-muted-foreground mb-4">
                Crie sua primeira configuração de alerta para começar a monitorar seu estoque
              </p>
              <Button onClick={onCreateNew}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Configuração
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {configs.map((config) => (
                <div
                  key={config.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    {getAlertTypeIcon(config.alertType)}
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{ALERT_TYPE_LABELS[config.alertType]}</h4>
                        <Badge className={getSeverityColor(config.severityLevel)}>
                          {SEVERITY_LABELS[config.severityLevel]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Limite: {config.thresholdValue}{" "}
                        {config.thresholdUnit === "quantity"
                          ? "unidades"
                          : config.thresholdUnit === "days"
                            ? "dias"
                            : "%"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Canais: {config.notificationChannels.join(", ")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Ativo</span>
                      <Switch
                        checked={config.isActive}
                        onCheckedChange={(checked) => handleToggleActive(config.id, checked)}
                        disabled={actionLoading === config.id}
                      />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(config)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(config.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AlertList;

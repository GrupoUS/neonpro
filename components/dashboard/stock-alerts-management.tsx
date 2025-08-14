"use client";

import type {
  AlertType,
  SeverityLevel,
  StockAlert,
  StockAlertConfig,
} from "@/app/lib/types/stock-alerts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  Clock,
  Edit,
  Filter,
  Info,
  Package,
  Plus,
  RefreshCw,
  Settings,
} from "lucide-react";
import { useEffect, useState } from "react";

interface StockAlertsManagementProps {
  className?: string;
}

const alertSeverityColors = {
  low: "text-blue-600 bg-blue-50 border-blue-200",
  medium: "text-yellow-600 bg-yellow-50 border-yellow-200",
  high: "text-orange-600 bg-orange-50 border-orange-200",
  critical: "text-red-600 bg-red-50 border-red-200",
};

const alertTypeIcons = {
  low_stock: Package,
  expiring: Clock,
  expired: AlertTriangle,
  overstock: Package,
  critical_shortage: AlertTriangle,
};

const alertTypeLabels = {
  low_stock: "Estoque Baixo",
  expiring: "Próximo ao Vencimento",
  expired: "Vencido",
  overstock: "Excesso de Estoque",
  critical_shortage: "Falta Crítica",
};

const severityLabels = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  critical: "Crítica",
};

export function StockAlertsManagement({
  className,
}: StockAlertsManagementProps) {
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [configs, setConfigs] = useState<StockAlertConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<"alerts" | "configs">(
    "alerts"
  );
  const [filterSeverity, setFilterSeverity] = useState<SeverityLevel | "all">(
    "all"
  );
  const [filterType, setFilterType] = useState<AlertType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<
    "active" | "resolved" | "all"
  >("all");
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [editingConfig, setEditingConfig] = useState<StockAlertConfig | null>(
    null
  );
  const { toast } = useToast();

  // Load alerts and configurations
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [alertsRes, configsRes] = await Promise.all([
        fetch("/api/stock/alerts"),
        fetch("/api/stock/alerts/configs"),
      ]);

      if (alertsRes.ok) {
        const alertsData = await alertsRes.json();
        setAlerts(alertsData.alerts || []);
      }

      if (configsRes.ok) {
        const configsData = await configsRes.json();
        setConfigs(configsData.configs || []);
      }
    } catch (error) {
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os alertas e configurações.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Resolve alert
  const resolveAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/stock/alerts`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId, resolved: true }),
      });

      if (response.ok) {
        setAlerts((prev) =>
          prev.map((alert) =>
            alert.id === alertId ? { ...alert, resolvedAt: new Date() } : alert
          )
        );
        toast({
          title: "Alerta resolvido",
          description: "O alerta foi marcado como resolvido.",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível resolver o alerta.",
        variant: "destructive",
      });
    }
  };

  // Toggle configuration active status
  const toggleConfig = async (configId: string, active: boolean) => {
    try {
      const response = await fetch(`/api/stock/alerts/configs`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ configId, active }),
      });

      if (response.ok) {
        setConfigs((prev) =>
          prev.map((config) =>
            config.id === configId ? { ...config, isActive: active } : config
          )
        );
        toast({
          title: active ? "Configuração ativada" : "Configuração desativada",
          description: `A configuração foi ${active ? "ativada" : "desativada"} com sucesso.`,
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a configuração.",
        variant: "destructive",
      });
    }
  };

  // Filter alerts
  const filteredAlerts = alerts.filter((alert) => {
    if (filterSeverity !== "all" && alert.severityLevel !== filterSeverity)
      return false;
    if (filterType !== "all" && alert.alertType !== filterType) return false;
    if (filterStatus === "active" && alert.resolvedAt) return false;
    if (filterStatus === "resolved" && !alert.resolvedAt) return false;
    return true;
  });

  // Filter configs
  const filteredConfigs = configs.filter((config) => {
    if (filterType !== "all" && config.alertType !== filterType) return false;
    return true;
  });

  useEffect(() => {
    loadData();
  }, []);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Gerenciamento de Alertas de Estoque
          </CardTitle>
          <Button onClick={loadData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs
          value={selectedTab}
          onValueChange={(value) => setSelectedTab(value as any)}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Alertas Ativos ({filteredAlerts.length})
            </TabsTrigger>
            <TabsTrigger value="configs" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configurações ({filteredConfigs.length})
            </TabsTrigger>
          </TabsList>

          {/* Filters */}
          <div className="flex items-center gap-4 py-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <Label>Filtros:</Label>
            </div>

            <Select
              value={filterSeverity}
              onValueChange={(value) => setFilterSeverity(value as any)}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Severidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="critical">Crítica</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filterType}
              onValueChange={(value) => setFilterType(value as any)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="low_stock">Estoque Baixo</SelectItem>
                <SelectItem value="out_of_stock">Sem Estoque</SelectItem>
                <SelectItem value="expiring_soon">Expirando</SelectItem>
                <SelectItem value="demand_prediction">Previsão</SelectItem>
              </SelectContent>
            </Select>

            {selectedTab === "alerts" && (
              <Select
                value={filterStatus}
                onValueChange={(value) => setFilterStatus(value as any)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="resolved">Resolvidos</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          <TabsContent value="alerts" className="space-y-4">
            {filteredAlerts.length === 0 ? (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Nenhum alerta encontrado com os filtros selecionados.
                </AlertDescription>
              </Alert>
            ) : (
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {filteredAlerts.map((alert) => {
                    const Icon =
                      alertTypeIcons[
                        alert.alertType as keyof typeof alertTypeIcons
                      ];
                    const isResolved = !!alert.resolvedAt;

                    return (
                      <div
                        key={alert.id}
                        className={cn(
                          "p-4 rounded-lg border transition-colors",
                          alertSeverityColors[alert.severityLevel],
                          isResolved && "opacity-60"
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <Icon className="h-5 w-5 mt-0.5" />
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">
                                  {
                                    alertTypeLabels[
                                      alert.alertType as keyof typeof alertTypeLabels
                                    ]
                                  }
                                </h4>
                                <Badge
                                  variant={
                                    alert.severityLevel === "critical"
                                      ? "destructive"
                                      : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  {severityLabels[alert.severityLevel]}
                                </Badge>
                                {isResolved && (
                                  <Badge variant="outline" className="text-xs">
                                    Resolvido
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm mt-1">{alert.message}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span>Produto ID: {alert.productId}</span>
                                <span>Valor Atual: {alert.currentValue}</span>
                                {alert.thresholdValue && (
                                  <span>Limite: {alert.thresholdValue}</span>
                                )}
                                <span>
                                  {alert.createdAt &&
                                    format(
                                      new Date(alert.createdAt),
                                      "dd/MM/yy HH:mm",
                                      { locale: pt }
                                    )}
                                </span>
                              </div>
                            </div>
                          </div>

                          {!isResolved && (
                            <Button
                              onClick={() => resolveAlert(alert.id!)}
                              variant="outline"
                              size="sm"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Resolver
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="configs" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Configure os alertas automáticos para diferentes tipos de
                eventos de estoque.
              </p>
              <Dialog
                open={showConfigDialog}
                onOpenChange={setShowConfigDialog}
              >
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingConfig(null)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Configuração
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingConfig ? "Editar" : "Nova"} Configuração de Alerta
                    </DialogTitle>
                    <DialogDescription>
                      Configure os parâmetros para alertas automáticos de
                      estoque.
                    </DialogDescription>
                  </DialogHeader>
                  <ConfigForm
                    config={editingConfig}
                    onSave={(config) => {
                      // Handle save
                      setShowConfigDialog(false);
                      loadData();
                    }}
                    onCancel={() => setShowConfigDialog(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>

            {filteredConfigs.length === 0 ? (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Nenhuma configuração encontrada. Crie uma nova configuração
                  para começar.
                </AlertDescription>
              </Alert>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Parâmetros</TableHead>
                    <TableHead>Severidade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredConfigs.map((config) => (
                    <TableRow key={config.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {(() => {
                            const Icon =
                              alertTypeIcons[
                                config.alertType as keyof typeof alertTypeIcons
                              ];
                            return <Icon className="h-4 w-4" />;
                          })()}
                          {
                            alertTypeLabels[
                              config.alertType as keyof typeof alertTypeLabels
                            ]
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {config.thresholdUnit === "percentage"
                            ? `${config.thresholdValue}%`
                            : `${config.thresholdValue} unidades`}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            config.severityLevel === "critical"
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {severityLabels[config.severityLevel]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={config.isActive}
                          onCheckedChange={(checked) =>
                            toggleConfig(config.id!, checked)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingConfig(config);
                              setShowConfigDialog(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Config Form Component (placeholder)
function ConfigForm({
  config,
  onSave,
  onCancel,
}: {
  config: StockAlertConfig | null;
  onSave: (config: any) => void;
  onCancel: () => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Formulário de configuração será implementado na próxima iteração.
      </p>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={() => onSave({})}>Salvar</Button>
      </DialogFooter>
    </div>
  );
}

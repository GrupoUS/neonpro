"use client";

import type { useState, useMemo } from "react";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type {
  AlertTriangle,
  Clock,
  Package,
  Thermometer,
  Shield,
  Bell,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface StockAlert {
  id: string;
  type: "low_stock" | "expiring" | "expired" | "temperature" | "anvisa_compliance" | "maintenance";
  severity: "critical" | "warning" | "info";
  productId: string;
  productName: string;
  category: string;
  message: string;
  details: string;
  createdAt: string;
  resolvedAt?: string;
  actionRequired: boolean;
  anvisaRegistration?: string;
  batchNumber?: string;
  location?: string;
  temperatureReading?: number;
  targetTemperatureRange?: string;
}

// Mock data for demonstration
const mockAlerts: StockAlert[] = [
  {
    id: "ALT001",
    type: "expired",
    severity: "critical",
    productId: "PRD003",
    productName: "Ácido Hialurônico Restylane",
    category: "fillers",
    message: "Produto vencido encontrado no estoque",
    details: "Lote JV240815 venceu em 15/11/2024. Remoção imediata necessária.",
    createdAt: "2024-11-16T08:30:00Z",
    actionRequired: true,
    anvisaRegistration: "10295770030",
    batchNumber: "JV240815",
    location: "Geladeira A1-05",
  },
  {
    id: "ALT002",
    type: "low_stock",
    severity: "warning",
    productId: "PRD001",
    productName: "Botox Allergan 100U",
    category: "botox",
    message: "Estoque abaixo do mínimo",
    details: "Apenas 8 unidades restantes. Mínimo configurado: 10 unidades.",
    createdAt: "2024-11-15T14:22:00Z",
    actionRequired: true,
    anvisaRegistration: "10295770028",
    location: "Geladeira A1-03",
  },
  {
    id: "ALT003",
    type: "expiring",
    severity: "warning",
    productId: "PRD002",
    productName: "Preenchedor Juvederm Ultra",
    category: "fillers",
    message: "Produto próximo do vencimento",
    details: "Vencimento em 12 dias (28/11/2024). Priorizar uso.",
    createdAt: "2024-11-16T09:15:00Z",
    actionRequired: true,
    anvisaRegistration: "10295770029",
    batchNumber: "JV241015",
    location: "Geladeira A1-04",
  },
  {
    id: "ALT004",
    type: "temperature",
    severity: "critical",
    productId: "PRD004",
    productName: "Equipamento Laser CO2",
    category: "equipment",
    message: "Falha no sistema de refrigeração",
    details: "Temperatura da sala de equipamentos acima de 25°C.",
    createdAt: "2024-11-16T10:45:00Z",
    actionRequired: true,
    location: "Sala de Equipamentos B",
    temperatureReading: 28.5,
    targetTemperatureRange: "18-22°C",
  },
  {
    id: "ALT005",
    type: "anvisa_compliance",
    severity: "warning",
    productId: "PRD005",
    productName: "Dermógrafo Elétrico",
    category: "equipment",
    message: "Manutenção preventiva vencida",
    details: "Calibração ANVISA venceu em 10/11/2024. Reagendar manutenção.",
    createdAt: "2024-11-11T16:00:00Z",
    actionRequired: true,
    anvisaRegistration: "80146170015",
    location: "Sala de Procedimentos 1",
  },
];

const alertTypeConfig = {
  low_stock: {
    icon: Package,
    color: "text-amber-600 bg-amber-50 border-amber-200",
    bgColor: "bg-amber-50",
    label: "Estoque Baixo",
  },
  expiring: {
    icon: Clock,
    color: "text-orange-600 bg-orange-50 border-orange-200",
    bgColor: "bg-orange-50",
    label: "Próximo ao Vencimento",
  },
  expired: {
    icon: XCircle,
    color: "text-red-600 bg-red-50 border-red-200",
    bgColor: "bg-red-50",
    label: "Vencido",
  },
  temperature: {
    icon: Thermometer,
    color: "text-blue-600 bg-blue-50 border-blue-200",
    bgColor: "bg-blue-50",
    label: "Controle de Temperatura",
  },
  anvisa_compliance: {
    icon: Shield,
    color: "text-purple-600 bg-purple-50 border-purple-200",
    bgColor: "bg-purple-50",
    label: "Compliance ANVISA",
  },
  maintenance: {
    icon: AlertTriangle,
    color: "text-yellow-600 bg-yellow-50 border-yellow-200",
    bgColor: "bg-yellow-50",
    label: "Manutenção",
  },
};

/**
 * Stock Alerts Component for NeonPro Inventory Management
 *
 * Features:
 * - Multi-type alert system (stock, expiration, temperature, compliance)
 * - ANVISA medical device compliance monitoring
 * - Temperature-controlled storage alerts
 * - Controlled substance expiration tracking
 * - CFM equipment maintenance alerts
 * - Brazilian healthcare regulation compliance
 * - Priority-based alert categorization
 * - Action-required workflow management
 *
 * @author VoidBeast V4.0 + neonpro-code-guardian
 * @version 1.0.0
 * @compliance ANVISA, CFM, LGPD
 */
export function StockAlerts() {
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");

  const alertCounts = useMemo(() => {
    const unresolved = mockAlerts.filter((alert) => !alert.resolvedAt);
    return {
      total: unresolved.length,
      critical: unresolved.filter((alert) => alert.severity === "critical").length,
      warning: unresolved.filter((alert) => alert.severity === "warning").length,
      actionRequired: unresolved.filter((alert) => alert.actionRequired).length,
    };
  }, []);

  const filteredAlerts = useMemo(() => {
    return mockAlerts.filter((alert) => {
      if (alert.resolvedAt) return false; // Only show unresolved alerts

      const matchesSeverity = selectedSeverity === "all" || alert.severity === selectedSeverity;
      const matchesType = selectedType === "all" || alert.type === selectedType;

      return matchesSeverity && matchesType;
    });
  }, [selectedSeverity, selectedType]);

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "warning":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "info":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleResolveAlert = (alertId: string) => {
    // In a real implementation, this would update the database
    console.log("Resolving alert:", alertId);
  };

  return (
    <div className="space-y-6">
      {/* Alert Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Alertas</p>
                <p className="text-2xl font-bold">{alertCounts.total}</p>
              </div>
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Críticos</p>
                <p className="text-2xl font-bold text-red-600">{alertCounts.critical}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avisos</p>
                <p className="text-2xl font-bold text-amber-600">{alertCounts.warning}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ação Necessária</p>
                <p className="text-2xl font-bold text-blue-600">{alertCounts.actionRequired}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>{" "}
      {/* Filters */}
      <div className="flex gap-4">
        <Tabs value={selectedSeverity} onValueChange={setSelectedSeverity}>
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="critical">Críticos</TabsTrigger>
            <TabsTrigger value="warning">Avisos</TabsTrigger>
            <TabsTrigger value="info">Informativos</TabsTrigger>
          </TabsList>
        </Tabs>

        <Tabs value={selectedType} onValueChange={setSelectedType}>
          <TabsList>
            <TabsTrigger value="all">Todos os Tipos</TabsTrigger>
            <TabsTrigger value="expired">Vencidos</TabsTrigger>
            <TabsTrigger value="expiring">Vencendo</TabsTrigger>
            <TabsTrigger value="low_stock">Estoque Baixo</TabsTrigger>
            <TabsTrigger value="anvisa_compliance">ANVISA</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => {
          const config = alertTypeConfig[alert.type];
          const Icon = config.icon;

          return (
            <Card
              key={alert.id}
              className={`border-l-4 ${alert.severity === "critical" ? "border-l-red-500" : alert.severity === "warning" ? "border-l-amber-500" : "border-l-blue-500"}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${config.bgColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{alert.message}</CardTitle>
                        <Badge variant="outline" className={getSeverityBadgeColor(alert.severity)}>
                          {alert.severity === "critical"
                            ? "Crítico"
                            : alert.severity === "warning"
                              ? "Aviso"
                              : "Info"}
                        </Badge>
                        <Badge variant="outline" className={config.color}>
                          {config.label}
                        </Badge>
                      </div>

                      <CardDescription className="text-sm">
                        <strong>{alert.productName}</strong> • {alert.category}
                      </CardDescription>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {alert.actionRequired && (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        Ação Necessária
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleResolveAlert(alert.id)}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Resolver
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">{alert.details}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {alert.location && (
                      <div>
                        <span className="font-medium text-muted-foreground">Localização:</span>
                        <br />
                        {alert.location}
                      </div>
                    )}

                    {alert.batchNumber && (
                      <div>
                        <span className="font-medium text-muted-foreground">Lote:</span>
                        <br />
                        {alert.batchNumber}
                      </div>
                    )}

                    {alert.anvisaRegistration && (
                      <div>
                        <span className="font-medium text-muted-foreground">ANVISA:</span>
                        <br />
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200 text-xs"
                        >
                          <Shield className="w-3 h-3 mr-1" />
                          {alert.anvisaRegistration}
                        </Badge>
                      </div>
                    )}

                    {alert.temperatureReading && (
                      <div>
                        <span className="font-medium text-muted-foreground">Temperatura:</span>
                        <br />
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200 text-xs"
                        >
                          <Thermometer className="w-3 h-3 mr-1" />
                          {alert.temperatureReading}°C
                        </Badge>
                        {alert.targetTemperatureRange && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Ideal: {alert.targetTemperatureRange}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-muted">
                    <span className="text-xs text-muted-foreground">
                      Criado em: {new Date(alert.createdAt).toLocaleString("pt-BR")}
                    </span>

                    {alert.type === "anvisa_compliance" && (
                      <Alert className="max-w-md">
                        <Shield className="h-4 w-4" />
                        <AlertTitle>Compliance ANVISA</AlertTitle>
                        <AlertDescription className="text-xs">
                          Este alerta requer ação imediata para manter compliance regulatório.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredAlerts.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Nenhum alerta encontrado</h3>
              <p className="text-muted-foreground">
                {selectedSeverity === "all" && selectedType === "all"
                  ? "Todos os alertas foram resolvidos. Excelente trabalho!"
                  : "Nenhum alerta corresponde aos filtros selecionados."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

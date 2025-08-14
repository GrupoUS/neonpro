// =====================================================================================
// EQUIPMENT MAINTENANCE DASHBOARD COMPONENT
// Epic 6 - Story 6.4: Comprehensive equipment maintenance management with scheduling and alerts
// =====================================================================================

"use client";

import {
  AlertSeverity,
  Equipment,
  EquipmentStatus,
  MaintenanceAlert,
} from "@/app/types/maintenance";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Bell,
  Calendar,
  CheckCircle,
  Clock,
  Filter,
  Plus,
  Search,
  Settings,
  TrendingUp,
  Wrench,
  XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";

// =====================================================================================
// DASHBOARD SUMMARY METRICS COMPONENT
// =====================================================================================
interface SummaryMetrics {
  totalEquipment: number;
  activeAlerts: number;
  overdueMaintenances: number;
  upcomingMaintenances: number;
  equipmentByStatus: Record<string, number>;
  alertsBySeverity: Record<string, number>;
}

const SummaryCards: React.FC<{ summary: SummaryMetrics | null }> = ({
  summary,
}) => {
  if (!summary) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-300 rounded w-20"></div>
              <div className="h-4 w-4 bg-gray-300 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-6 bg-gray-300 rounded w-12 mb-1"></div>
              <div className="h-3 bg-gray-300 rounded w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Equipment */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total de Equipamentos
          </CardTitle>
          <Settings className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.totalEquipment}</div>
          <p className="text-xs text-muted-foreground">
            Ativos: {summary.equipmentByStatus.active || 0}
          </p>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Alertas Ativos</CardTitle>
          <AlertTriangle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">
            {summary.activeAlerts}
          </div>
          <p className="text-xs text-muted-foreground">
            Críticos: {summary.alertsBySeverity.critical || 0}
          </p>
        </CardContent>
      </Card>

      {/* Overdue Maintenances */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Manutenções Atrasadas
          </CardTitle>
          <Clock className="h-4 w-4 text-warning" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-warning">
            {summary.overdueMaintenances}
          </div>
          <p className="text-xs text-muted-foreground">
            Requer atenção imediata
          </p>
        </CardContent>
      </Card>

      {/* Upcoming Maintenances */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Próximas Manutenções
          </CardTitle>
          <Calendar className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {summary.upcomingMaintenances}
          </div>
          <p className="text-xs text-muted-foreground">Próximos 30 dias</p>
        </CardContent>
      </Card>
    </div>
  );
};

// =====================================================================================
// EQUIPMENT LIST COMPONENT
// =====================================================================================
interface EquipmentListProps {
  clinicId: string;
}

const EquipmentList: React.FC<EquipmentListProps> = ({ clinicId }) => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        clinic_id: clinicId,
        page: page.toString(),
        limit: "20",
      });

      if (searchTerm) queryParams.append("search", searchTerm);
      if (statusFilter) queryParams.append("status", statusFilter);

      const response = await fetch(`/api/maintenance/equipment?${queryParams}`);
      if (!response.ok) throw new Error("Failed to fetch equipment");

      const data = await response.json();
      setEquipment(data.equipment);
      setTotal(data.total);
    } catch (error) {
      console.error("Error fetching equipment:", error);
      toast({
        title: "Erro",
        description: "Falha ao carregar equipamentos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, [clinicId, page, searchTerm, statusFilter]);

  const getStatusBadge = (status: EquipmentStatus) => {
    const statusMap = {
      active: { label: "Ativo", className: "bg-green-100 text-green-800" },
      maintenance: {
        label: "Manutenção",
        className: "bg-yellow-100 text-yellow-800",
      },
      out_of_service: {
        label: "Fora de Serviço",
        className: "bg-red-100 text-red-800",
      },
      decommissioned: {
        label: "Descomissionado",
        className: "bg-gray-100 text-gray-800",
      },
    };

    const config = statusMap[status];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getCriticalityBadge = (level: string) => {
    const criticalityMap = {
      critical: { label: "Crítico", className: "bg-red-100 text-red-800" },
      high: { label: "Alto", className: "bg-orange-100 text-orange-800" },
      medium: { label: "Médio", className: "bg-yellow-100 text-yellow-800" },
      low: { label: "Baixo", className: "bg-green-100 text-green-800" },
    };

    const config = criticalityMap[level as keyof typeof criticalityMap];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar equipamentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os status</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="maintenance">Manutenção</SelectItem>
            <SelectItem value="out_of_service">Fora de Serviço</SelectItem>
            <SelectItem value="decommissioned">Descomissionado</SelectItem>
          </SelectContent>
        </Select>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Equipamento
        </Button>
      </div>

      {/* Equipment Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-300 rounded"></div>
                  <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : equipment.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <Settings className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Nenhum equipamento encontrado
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter
                ? "Tente ajustar os filtros."
                : "Comece adicionando um novo equipamento."}
            </p>
          </div>
        ) : (
          equipment.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{item.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {item.model} • {item.serial_number}
                    </CardDescription>
                  </div>
                  {getStatusBadge(item.status)}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Activity className="mr-2 h-4 w-4" />
                    {item.department} • {item.location}
                  </div>
                  <div className="flex items-center justify-between">
                    {getCriticalityBadge(item.criticality_level)}
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm">
                        <Calendar className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Wrench className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {total > 20 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {(page - 1) * 20 + 1} a {Math.min(page * 20, total)} de{" "}
            {total} equipamentos
          </p>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page * 20 >= total}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// =====================================================================================
// ALERTS LIST COMPONENT
// =====================================================================================
interface AlertsListProps {
  clinicId: string;
}

const AlertsList: React.FC<AlertsListProps> = ({ clinicId }) => {
  const [alerts, setAlerts] = useState<MaintenanceAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/maintenance/alerts/active?clinic_id=${clinicId}`
      );
      if (!response.ok) throw new Error("Failed to fetch alerts");

      const data = await response.json();
      setAlerts(data);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      toast({
        title: "Erro",
        description: "Falha ao carregar alertas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [clinicId]);

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case "critical":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "high":
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case "medium":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "low":
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSeverityBadge = (severity: AlertSeverity) => {
    const severityMap = {
      critical: { label: "Crítico", className: "bg-red-100 text-red-800" },
      high: { label: "Alto", className: "bg-orange-100 text-orange-800" },
      medium: { label: "Médio", className: "bg-yellow-100 text-yellow-800" },
      low: { label: "Baixo", className: "bg-blue-100 text-blue-800" },
      info: { label: "Info", className: "bg-gray-100 text-gray-800" },
    };

    const config = severityMap[severity] || severityMap.info;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const handleAcknowledge = async (alertId: string) => {
    try {
      const response = await fetch(
        `/api/maintenance/alerts?alert_id=${alertId}&action=acknowledge`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            acknowledged_by: "current_user", // TODO: Get from auth context
            notes: "Alerta reconhecido via dashboard",
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to acknowledge alert");

      toast({
        title: "Sucesso",
        description: "Alerta reconhecido com sucesso",
      });

      fetchAlerts(); // Refresh alerts
    } catch (error) {
      console.error("Error acknowledging alert:", error);
      toast({
        title: "Erro",
        description: "Falha ao reconhecer alerta",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {loading ? (
        [...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="h-4 w-4 bg-gray-300 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-gray-300 rounded w-16"></div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : alerts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Nenhum alerta ativo
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Todos os equipamentos estão funcionando normalmente.
            </p>
          </CardContent>
        </Card>
      ) : (
        alerts.map((alert) => (
          <Card key={alert.id} className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {getSeverityIcon(alert.severity)}
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      {alert.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {alert.message}
                    </p>
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <Calendar className="mr-1 h-3 w-3" />
                      {new Date(alert.created_at).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getSeverityBadge(alert.severity)}
                  {!alert.is_acknowledged && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAcknowledge(alert.id)}
                    >
                      Reconhecer
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

// =====================================================================================
// MAIN DASHBOARD COMPONENT
// =====================================================================================
interface MaintenanceDashboardProps {
  clinicId: string;
}

const MaintenanceDashboard: React.FC<MaintenanceDashboardProps> = ({
  clinicId,
}) => {
  const [summary, setSummary] = useState<SummaryMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/maintenance/summary?clinic_id=${clinicId}`
      );
      if (!response.ok) throw new Error("Failed to fetch summary");

      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error("Error fetching summary:", error);
      toast({
        title: "Erro",
        description: "Falha ao carregar resumo de manutenção",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [clinicId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Manutenção de Equipamentos
          </h1>
          <p className="text-gray-600">
            Gerencie cronogramas de manutenção e monitore alertas de
            equipamentos
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Agendamento
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards summary={summary} />

      {/* Main Content Tabs */}
      <Tabs defaultValue="equipment" className="space-y-4">
        <TabsList>
          <TabsTrigger value="equipment">
            <Settings className="mr-2 h-4 w-4" />
            Equipamentos
          </TabsTrigger>
          <TabsTrigger value="schedules">
            <Calendar className="mr-2 h-4 w-4" />
            Cronogramas
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Alertas
            {summary && summary.activeAlerts > 0 && (
              <Badge className="ml-2 bg-red-100 text-red-800">
                {summary.activeAlerts}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <TrendingUp className="mr-2 h-4 w-4" />
            Análises
          </TabsTrigger>
        </TabsList>

        <TabsContent value="equipment">
          <EquipmentList clinicId={clinicId} />
        </TabsContent>

        <TabsContent value="schedules">
          <Card>
            <CardHeader>
              <CardTitle>Cronogramas de Manutenção</CardTitle>
              <CardDescription>
                Gerencie cronogramas preventivos e preditivos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Em desenvolvimento
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Interface de cronogramas será implementada em breve.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <AlertsList clinicId={clinicId} />
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Análises e Relatórios</CardTitle>
              <CardDescription>
                Métricas de performance e custos de manutenção
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Em desenvolvimento
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Dashboard de análises será implementado em breve.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MaintenanceDashboard;

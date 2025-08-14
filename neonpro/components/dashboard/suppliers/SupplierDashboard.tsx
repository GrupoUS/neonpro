// =====================================================================================
// SUPPLIER MANAGEMENT DASHBOARD
// Epic 6 - Story 6.3: Comprehensive supplier management with performance tracking
// =====================================================================================

"use client";

import { useSupplierManagement } from "@/app/hooks/useSupplierManagement";
import { SupplierStatus, SupplierType } from "@/app/types/suppliers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Building2,
  Calendar,
  Download,
  Filter,
  Package,
  Plus,
  Shield,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

interface SupplierDashboardProps {
  clinicId: string;
}

export function SupplierDashboard({ clinicId }: SupplierDashboardProps) {
  const {
    suppliers,
    dashboardData,
    contractAlerts,
    qualityIssuesSummary,
    analytics,
    isLoading,
    error,
    loadSuppliers,
    loadDashboardData,
    loadContractAlerts,
    loadQualityIssuesSummary,
    loadAnalytics,
    refreshData,
  } = useSupplierManagement({
    clinicId,
    autoRefresh: true,
    refreshInterval: 300000, // 5 minutes
  });

  const [selectedTab, setSelectedTab] = useState("overview");

  useEffect(() => {
    // Initial data load
    loadSuppliers();
    loadContractAlerts();
    loadQualityIssuesSummary();

    // Load analytics for last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    loadAnalytics(
      startDate.toISOString().split("T")[0],
      endDate.toISOString().split("T")[0]
    );
  }, [
    loadSuppliers,
    loadContractAlerts,
    loadQualityIssuesSummary,
    loadAnalytics,
  ]);

  // Render loading state
  if (isLoading && !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">
            Carregando dashboard de fornecedores...
          </p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Erro no Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={refreshData} variant="outline">
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  const getSupplierTypeIcon = (type: SupplierType) => {
    switch (type) {
      case "medical_supplies":
        return <Package className="h-4 w-4" />;
      case "pharmaceutical":
        return <Shield className="h-4 w-4" />;
      case "equipment":
        return <Building2 className="h-4 w-4" />;
      case "laboratory":
        return <BarChart3 className="h-4 w-4" />;
      case "services":
        return <Users className="h-4 w-4" />;
      case "technology":
        return <Building2 className="h-4 w-4" />;
      case "maintenance":
        return <Building2 className="h-4 w-4" />;
      default:
        return <Building2 className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: SupplierStatus) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Ativo
          </Badge>
        );
      case "inactive":
        return <Badge variant="secondary">Inativo</Badge>;
      case "pending":
        return <Badge variant="outline">Pendente</Badge>;
      case "suspended":
        return <Badge variant="destructive">Suspenso</Badge>;
      case "under_review":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            Em Análise
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Fornecedores</h1>
          <p className="text-muted-foreground">
            Monitore performance, contratos e qualidade dos fornecedores
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Novo Fornecedor
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Fornecedores
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.totalSuppliers || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.activeSuppliers || 0} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Performance Média
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.averagePerformance?.toFixed(1) || "0.0"}%
            </div>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Contratos Vencendo
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contractAlerts?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Próximos 90 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Issues de Qualidade
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {qualityIssuesSummary?.reduce(
                (acc, item) => acc + item.openIssues,
                0
              ) || 0}
            </div>
            <p className="text-xs text-muted-foreground">Em aberto</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="suppliers">Fornecedores</TabsTrigger>
          <TabsTrigger value="contracts">Contratos</TabsTrigger>
          <TabsTrigger value="quality">Qualidade</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Suppliers */}
            <Card>
              <CardHeader>
                <CardTitle>Melhores Fornecedores</CardTitle>
                <CardDescription>
                  Baseado na performance dos últimos 30 dias
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData?.topSuppliers?.slice(0, 5).map((supplier) => (
                    <div
                      key={supplier.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          {getSupplierTypeIcon(supplier.supplier_type)}
                          <span className="font-medium">{supplier.name}</span>
                        </div>
                        {supplier.is_preferred && (
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                      <div className="text-right">
                        <div
                          className={`font-semibold ${getPerformanceColor(supplier.performance_score || 0)}`}
                        >
                          {supplier.performance_score?.toFixed(1) || "0.0"}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {supplier.delivery_reliability?.toFixed(0) || "0"}%
                          entrega
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Contract Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>Alertas de Contrato</CardTitle>
                <CardDescription>
                  Contratos que requerem atenção
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contractAlerts?.slice(0, 5).map((alert) => (
                    <div
                      key={alert.contractId}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {alert.supplierName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Vence em {alert.daysUntilExpiry} dias
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant={
                          alert.daysUntilExpiry <= 30
                            ? "destructive"
                            : "outline"
                        }
                      >
                        {alert.alertType === "renewal"
                          ? "Renovação"
                          : "Atenção"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Tendências de Performance</CardTitle>
              <CardDescription>
                Evolução da performance por categoria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData?.performanceByType?.map((category) => (
                  <div key={category.type} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2">
                        {getSupplierTypeIcon(category.type)}
                        {category.type.replace("_", " ").toUpperCase()}
                      </span>
                      <span
                        className={getPerformanceColor(category.averageScore)}
                      >
                        {category.averageScore.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={category.averageScore} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Suppliers Tab */}
        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Fornecedores</CardTitle>
              <CardDescription>
                Todos os fornecedores cadastrados no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Último Pedido</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliers.slice(0, 10).map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getSupplierTypeIcon(supplier.supplier_type)}
                          <span className="font-medium">{supplier.name}</span>
                          {supplier.is_preferred && (
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {supplier.supplier_type.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(supplier.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span
                            className={getPerformanceColor(
                              supplier.performance_score || 0
                            )}
                          >
                            {supplier.performance_score?.toFixed(1) || "0.0"}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {supplier.last_order_date
                          ? new Date(
                              supplier.last_order_date
                            ).toLocaleDateString("pt-BR")
                          : "Nunca"}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          Ver Detalhes
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contracts Tab */}
        <TabsContent value="contracts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Contratos</CardTitle>
              <CardDescription>
                Contratos ativos e alertas de renovação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contractAlerts?.map((alert) => (
                  <div key={alert.contractId} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h4 className="font-semibold">{alert.supplierName}</h4>
                        <p className="text-sm text-muted-foreground">
                          Contrato: {alert.contractType}
                        </p>
                        <p className="text-sm">
                          Valor: R${" "}
                          {alert.contractValue?.toLocaleString("pt-BR") ||
                            "N/A"}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            alert.daysUntilExpiry <= 30
                              ? "destructive"
                              : "outline"
                          }
                        >
                          {alert.daysUntilExpiry} dias
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          Vence:{" "}
                          {new Date(alert.expiryDate).toLocaleDateString(
                            "pt-BR"
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline">
                        Ver Contrato
                      </Button>
                      <Button size="sm">Renovar</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quality Tab */}
        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Issues de Qualidade</CardTitle>
              <CardDescription>
                Resumo dos problemas de qualidade por fornecedor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {qualityIssuesSummary?.map((summary) => (
                  <div
                    key={summary.supplierId}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h4 className="font-semibold">
                          {summary.supplierName}
                        </h4>
                        <div className="flex gap-4 text-sm">
                          <span className="text-red-600">
                            {summary.openIssues} em aberto
                          </span>
                          <span className="text-green-600">
                            {summary.resolvedIssues} resolvidos
                          </span>
                          <span className="text-muted-foreground">
                            {summary.totalIssues} total
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`font-semibold ${getPerformanceColor(summary.averageResolutionTime)}`}
                        >
                          {summary.averageResolutionTime.toFixed(1)} dias
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Tempo médio de resolução
                        </p>
                      </div>
                    </div>
                    {summary.openIssues > 0 && (
                      <div className="mt-3">
                        <Button size="sm" variant="outline">
                          Ver Issues
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics de Fornecedores</CardTitle>
              <CardDescription>
                Análise detalhada de performance e custos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Métricas de Performance</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Entregas no Prazo:</span>
                        <span className="font-semibold">
                          {analytics.deliveryMetrics?.onTimeDeliveryRate?.toFixed(
                            1
                          ) || "0.0"}
                          %
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Qualidade Média:</span>
                        <span className="font-semibold">
                          {analytics.qualityMetrics?.averageQualityRating?.toFixed(
                            1
                          ) || "0.0"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tempo de Resposta:</span>
                        <span className="font-semibold">
                          {analytics.responseMetrics?.averageResponseTime?.toFixed(
                            1
                          ) || "0.0"}
                          h
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Métricas de Custo</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Gastos Totais:</span>
                        <span className="font-semibold">
                          R${" "}
                          {analytics.costMetrics?.totalSpent?.toLocaleString(
                            "pt-BR"
                          ) || "0"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Economia Obtida:</span>
                        <span className="font-semibold text-green-600">
                          R${" "}
                          {analytics.costMetrics?.savingsAchieved?.toLocaleString(
                            "pt-BR"
                          ) || "0"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>ROI Médio:</span>
                        <span className="font-semibold">
                          {analytics.costMetrics?.averageROI?.toFixed(1) ||
                            "0.0"}
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Carregando analytics...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

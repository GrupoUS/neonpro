"use client";

/**
 * Story 11.3: Inventory Overview Component
 * Comprehensive inventory overview with alerts, stock levels, and quick actions
 */

import React, { useEffect, useState } from "react";
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
import type { Icons } from "@/components/ui/icons";
import type { Progress } from "@/components/ui/progress";
import type {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { InventoryDashboardSummary } from "@/lib/inventory";

interface InventoryOverviewProps {
  dashboardData: InventoryDashboardSummary | null;
  onRefresh: () => void;
  className?: string;
}

interface AlertItem {
  id: string;
  type: "low_stock" | "expiry" | "out_of_stock" | "fifo_violation";
  product_name: string;
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  action_required: string;
  created_at: Date;
}

export function InventoryOverview({ dashboardData, onRefresh, className }: InventoryOverviewProps) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [expiringProducts, setExpiringProducts] = useState<any[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    if (dashboardData) {
      loadDetailedData();
    }
  }, [dashboardData]);

  const loadDetailedData = async () => {
    setIsLoadingDetails(true);
    try {
      // Simulate loading detailed data
      // In real implementation, these would be separate API calls
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock alerts data
      setAlerts([
        {
          id: "1",
          type: "low_stock",
          product_name: "Luvas de Procedimento",
          message: "Estoque baixo - apenas 45 unidades restantes",
          severity: "medium",
          action_required: "Reabastecer estoque",
          created_at: new Date(),
        },
        {
          id: "2",
          type: "expiry",
          product_name: "Soro Fisiológico 500ml",
          message: "Lote vencendo em 5 dias",
          severity: "high",
          action_required: "Usar prioritariamente",
          created_at: new Date(),
        },
        {
          id: "3",
          type: "out_of_stock",
          product_name: "Seringas 5ml",
          message: "Produto em falta",
          severity: "critical",
          action_required: "Compra urgente",
          created_at: new Date(),
        },
      ]);

      // Mock low stock products
      setLowStockProducts([
        {
          id: "1",
          name: "Luvas de Procedimento",
          current_stock: 45,
          minimum_stock: 100,
          percentage: 45,
          status: "low",
        },
        {
          id: "2",
          name: "Máscaras Cirúrgicas",
          current_stock: 78,
          minimum_stock: 200,
          percentage: 39,
          status: "critical",
        },
        {
          id: "3",
          name: "Gaze Estéril",
          current_stock: 23,
          minimum_stock: 50,
          percentage: 46,
          status: "low",
        },
      ]);

      // Mock expiring products
      setExpiringProducts([
        {
          id: "1",
          name: "Soro Fisiológico 500ml",
          batch_number: "LT20241201",
          expiry_date: new Date("2024-12-10"),
          days_to_expiry: 5,
          quantity: 120,
          value: 2400,
        },
        {
          id: "2",
          name: "Medicamento X",
          batch_number: "LT20241205",
          expiry_date: new Date("2024-12-15"),
          days_to_expiry: 10,
          quantity: 30,
          value: 1500,
        },
      ]);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: "bg-blue-100 text-blue-800 border-blue-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      high: "bg-orange-100 text-orange-800 border-orange-200",
      critical: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[severity as keyof typeof colors] || colors.low;
  };

  const getStockStatusColor = (percentage: number) => {
    if (percentage <= 25) return "bg-red-500";
    if (percentage <= 50) return "bg-orange-500";
    if (percentage <= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (!dashboardData) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-8">
          <Icons.Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Nenhum dado disponível</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Alert Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.AlertTriangle className="h-5 w-5" />
              Alertas Ativos
            </CardTitle>
            <CardDescription>Situações que requerem atenção imediata</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingDetails ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            ) : alerts.length > 0 ? (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{alert.product_name}</p>
                        <p className="text-sm opacity-90">{alert.message}</p>
                        <p className="text-xs mt-1 opacity-75">{alert.action_required}</p>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {alert.severity}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <Icons.CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-2" />
                <p className="text-sm text-muted-foreground">Nenhum alerta ativo</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.TrendingDown className="h-5 w-5" />
              Produtos com Estoque Baixo
            </CardTitle>
            <CardDescription>Produtos próximos ao estoque mínimo</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingDetails ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-2 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : lowStockProducts.length > 0 ? (
              <div className="space-y-4">
                {lowStockProducts.map((product) => (
                  <div key={product.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{product.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {product.current_stock}/{product.minimum_stock}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <Progress value={product.percentage} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{product.percentage}% do mínimo</span>
                        <Badge
                          variant={product.status === "critical" ? "destructive" : "secondary"}
                        >
                          {product.status === "critical" ? "Crítico" : "Baixo"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <Icons.CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-2" />
                <p className="text-sm text-muted-foreground">Todos os estoques adequados</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stock Value Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.DollarSign className="h-5 w-5" />
            Valor do Estoque
          </CardTitle>
          <CardDescription>Distribuição de valor por categoria e status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(dashboardData.stock_levels.total_value)}
              </div>
              <p className="text-sm text-muted-foreground">Valor Total</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(dashboardData.cost_efficiency.monthly_consumption_value)}
              </div>
              <p className="text-sm text-muted-foreground">Consumo Mensal</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(dashboardData.cost_efficiency.potential_savings)}
              </div>
              <p className="text-sm text-muted-foreground">Economia Potencial</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expiring Products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.Clock className="h-5 w-5" />
            Produtos Próximos ao Vencimento
          </CardTitle>
          <CardDescription>Lotes que vencem nos próximos 30 dias</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingDetails ? (
            <div className="h-48 bg-gray-200 rounded animate-pulse" />
          ) : expiringProducts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Lote</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Dias</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expiringProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.batch_number}</TableCell>
                    <TableCell>{product.expiry_date.toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>
                      <Badge variant={product.days_to_expiry <= 7 ? "destructive" : "secondary"}>
                        {product.days_to_expiry} dias
                      </Badge>
                    </TableCell>
                    <TableCell>{product.quantity}</TableCell>
                    <TableCell>{formatCurrency(product.value)}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">
                        <Icons.ArrowRight className="h-4 w-4 mr-1" />
                        Usar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Icons.CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <p className="text-muted-foreground">Nenhum produto próximo ao vencimento</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.Zap className="h-5 w-5" />
            Ações Rápidas
          </CardTitle>
          <CardDescription>Operações frequentes do sistema de estoque</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Icons.Plus className="h-5 w-5" />
              Nova Saída
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Icons.ArrowUpDown className="h-5 w-5" />
              Transferência
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Icons.BarChart3 className="h-5 w-5" />
              Relatório
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={onRefresh}>
              <Icons.RefreshCw className="h-5 w-5" />
              Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

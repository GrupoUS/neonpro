"use client";

import type {
  ConsumptionTrend,
  CustomStockReport,
  ReportType,
  StockKPIs,
  TopProduct,
  WasteAnalysis,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  Clock,
  DollarSign,
  Download,
  Eye,
  FileText,
  Filter,
  Package,
  PieChart,
  Plus,
  RefreshCw,
  Settings,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";

interface StockReportsProps {
  className?: string;
}

const reportTypeIcons = {
  consumption: BarChart3,
  valuation: DollarSign,
  movement: TrendingUp,
  expiration: Clock,
  custom: FileText,
  performance: PieChart,
};

const reportTypeLabels = {
  consumption: "Relatório de Consumo",
  valuation: "Relatório de Valorização",
  movement: "Relatório de Movimentação",
  expiration: "Relatório de Vencimentos",
  custom: "Relatório Personalizado",
  performance: "Métricas de Performance",
};

export function StockReports({ className }: StockReportsProps) {
  const [reports, setReports] = useState<CustomStockReport[]>([]);
  const [kpis, setKpis] = useState<StockKPIs | null>(null);
  const [consumptionTrend, setConsumptionTrend] = useState<ConsumptionTrend[]>(
    []
  );
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [wasteAnalysis, setWasteAnalysis] = useState<WasteAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<"dashboard" | "reports">(
    "dashboard"
  );
  const [filterType, setFilterType] = useState<ReportType | "all">("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();

  // Load dashboard data and reports
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [dashboardRes, reportsRes] = await Promise.all([
        fetch("/api/stock/reports?type=dashboard"),
        fetch("/api/stock/reports"),
      ]);

      if (dashboardRes.ok) {
        const dashboardData = await dashboardRes.json();
        setKpis(dashboardData.kpis || null);
        setConsumptionTrend(dashboardData.charts?.consumptionTrend || []);
        setTopProducts(dashboardData.charts?.topProducts || []);
        setWasteAnalysis(dashboardData.charts?.wasteAnalysis || []);
      }

      if (reportsRes.ok) {
        const reportsData = await reportsRes.json();
        setReports(reportsData.reports || []);
      }
    } catch (error) {
      toast({
        title: "Erro ao carregar dados",
        description:
          "Não foi possível carregar os dados do dashboard e relatórios.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate report
  const generateReport = async (reportId: string) => {
    try {
      const response = await fetch(`/api/stock/reports/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `relatorio-estoque-${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast({
          title: "Relatório gerado",
          description: "O relatório foi gerado e está sendo baixado.",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível gerar o relatório.",
        variant: "destructive",
      });
    }
  };

  // Filter reports
  const filteredReports = reports.filter((report) => {
    if (filterType !== "all" && report.reportType !== filterType) return false;
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
            <BarChart3 className="h-5 w-5" />
            Relatórios e Analytics de Estoque
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
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Relatórios ({filteredReports.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* KPIs */}
            {kpis && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Valor Total
                        </p>
                        <p className="text-2xl font-bold">
                          R$ {kpis.totalValue.toLocaleString("pt-BR")}
                        </p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Taxa de Giro
                        </p>
                        <p className="text-2xl font-bold">
                          {kpis.turnoverRate.toFixed(1)}x
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Cobertura (Dias)
                        </p>
                        <p className="text-2xl font-bold">
                          {kpis.daysCoverage}
                        </p>
                      </div>
                      <Calendar className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Alertas Ativos
                        </p>
                        <p className="text-2xl font-bold text-red-600">
                          {kpis.activeAlerts}
                        </p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-red-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Products */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Produtos Mais Consumidos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {topProducts.length === 0 ? (
                    <Alert>
                      <Package className="h-4 w-4" />
                      <AlertDescription>
                        Nenhum dado de consumo disponível.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-3">
                      {topProducts.slice(0, 5).map((product, index) => (
                        <div
                          key={product.productId}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{product.name}</p>
                              {product.sku && (
                                <p className="text-sm text-muted-foreground">
                                  {product.sku}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{product.consumption}</p>
                            <p className="text-sm text-muted-foreground">
                              R$ {product.value.toLocaleString("pt-BR")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Waste Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Análise de Desperdício
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {wasteAnalysis.length === 0 ? (
                    <Alert>
                      <TrendingDown className="h-4 w-4" />
                      <AlertDescription>
                        Nenhum dado de desperdício disponível.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-3">
                      {wasteAnalysis.map((waste, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg border"
                        >
                          <div>
                            <p className="font-medium">{waste.period}</p>
                            <p className="text-sm text-muted-foreground">
                              {waste.percentage.toFixed(1)}% de desperdício
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-red-600">
                              R$ {waste.waste.toLocaleString("pt-BR")}
                            </p>
                            {waste.trend && (
                              <div className="flex items-center gap-1">
                                {waste.trend === "improving" && (
                                  <TrendingDown className="h-4 w-4 text-green-600" />
                                )}
                                {waste.trend === "worsening" && (
                                  <TrendingUp className="h-4 w-4 text-red-600" />
                                )}
                                <span className="text-sm capitalize">
                                  {waste.trend}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <Label>Filtrar por tipo:</Label>
                </div>

                <Select
                  value={filterType}
                  onValueChange={(value) => setFilterType(value as any)}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Tipo de relatório" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="consumption">Consumo</SelectItem>
                    <SelectItem value="valuation">Valorização</SelectItem>
                    <SelectItem value="movement">Movimentação</SelectItem>
                    <SelectItem value="expiration">Vencimentos</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Dialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Relatório
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[525px]">
                  <DialogHeader>
                    <DialogTitle>Novo Relatório Personalizado</DialogTitle>
                    <DialogDescription>
                      Configure um novo relatório personalizado para análise de
                      estoque.
                    </DialogDescription>
                  </DialogHeader>
                  <ReportForm
                    onSave={(report) => {
                      setShowCreateDialog(false);
                      loadData();
                    }}
                    onCancel={() => setShowCreateDialog(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>

            {filteredReports.length === 0 ? (
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  Nenhum relatório encontrado. Crie um novo relatório para
                  começar.
                </AlertDescription>
              </Alert>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Última Execução</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => {
                    const Icon =
                      reportTypeIcons[
                        report.reportType as keyof typeof reportTypeIcons
                      ];

                    return (
                      <TableRow key={report.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <div>
                              <p className="font-medium">{report.reportName}</p>
                              <p className="text-sm text-muted-foreground">
                                {report.executionCount} execuções
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {
                              reportTypeLabels[
                                report.reportType as keyof typeof reportTypeLabels
                              ]
                            }
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {report.lastExecutedAt ? (
                            <span className="text-sm">
                              {format(
                                new Date(report.lastExecutedAt),
                                "dd/MM/yy HH:mm",
                                { locale: pt }
                              )}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              Nunca executado
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={report.isActive ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {report.isActive ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => generateReport(report.id!)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Report Form Component (placeholder)
function ReportForm({
  onSave,
  onCancel,
}: {
  onSave: (report: any) => void;
  onCancel: () => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Formulário de criação de relatório será implementado na próxima
        iteração.
      </p>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={() => onSave({})}>Criar Relatório</Button>
      </DialogFooter>
    </div>
  );
}

"use client";

import type {
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Star,
  TrendingDown,
  TrendingUp,
  XCircle,
} from "lucide-react";
import type { useEffect, useState } from "react";
import type { toast } from "sonner";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Progress } from "@/components/ui/progress";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { VendorService } from "@/lib/services/vendors";

interface VendorPerformance {
  vendor_id: string;
  vendor_name: string;
  total_transactions: number;
  total_amount: number;
  average_payment_time: number;
  on_time_payment_rate: number;
  overdue_count: number;
  completed_count: number;
  pending_count: number;
  quality_score: number;
  last_transaction_date: string;
  documents_count: number;
}

export default function VendorPerformanceDashboard() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [performance, setPerformance] = useState<VendorPerformance[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30"); // days

  const loadVendors = async () => {
    try {
      const vendorList = await VendorService.getVendors();
      setVendors(vendorList.vendors || []);
    } catch (error) {
      console.error("Erro ao carregar fornecedores:", error);
      toast.error("Erro ao carregar fornecedores");
    }
  };

  const loadPerformanceData = async () => {
    setLoading(true);
    try {
      // Simulated performance data - In a real implementation,
      // this would come from database queries and calculations
      const mockPerformance: VendorPerformance[] = vendors.map((vendor) => ({
        vendor_id: vendor.id,
        vendor_name: vendor.company_name,
        total_transactions: Math.floor(Math.random() * 50) + 5,
        total_amount: Math.random() * 100000 + 10000,
        average_payment_time: Math.floor(Math.random() * 45) + 15,
        on_time_payment_rate: Math.random() * 40 + 60,
        overdue_count: Math.floor(Math.random() * 5),
        completed_count: Math.floor(Math.random() * 30) + 10,
        pending_count: Math.floor(Math.random() * 8) + 2,
        quality_score: Math.random() * 30 + 70,
        last_transaction_date: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        documents_count: Math.floor(Math.random() * 15) + 5,
      }));

      setPerformance(mockPerformance);
    } catch (error) {
      console.error("Erro ao carregar dados de performance:", error);
      toast.error("Erro ao carregar dados de performance");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendors();
  }, []);

  useEffect(() => {
    if (vendors.length > 0) {
      loadPerformanceData();
    }
  }, [vendors, period]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (
    score: number,
  ): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 90) return "default";
    if (score >= 70) return "secondary";
    return "destructive";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  const filteredPerformance =
    selectedVendor === "all"
      ? performance
      : performance.filter((p) => p.vendor_id === selectedVendor);

  const totalStats = performance.reduce(
    (acc, p) => ({
      transactions: acc.transactions + p.total_transactions,
      amount: acc.amount + p.total_amount,
      overdue: acc.overdue + p.overdue_count,
      completed: acc.completed + p.completed_count,
    }),
    { transactions: 0, amount: 0, overdue: 0, completed: 0 },
  );

  const averagePaymentTime =
    performance.length > 0
      ? performance.reduce((sum, p) => sum + p.average_payment_time, 0) / performance.length
      : 0;

  const averageOnTimeRate =
    performance.length > 0
      ? performance.reduce((sum, p) => sum + p.on_time_payment_rate, 0) / performance.length
      : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex gap-4 items-center">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="90">Últimos 90 dias</SelectItem>
            <SelectItem value="365">Último ano</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedVendor} onValueChange={setSelectedVendor}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Todos os fornecedores" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os fornecedores</SelectItem>
            {vendors.map((vendor) => (
              <SelectItem key={vendor.id} value={vendor.id}>
                {vendor.company_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={loadPerformanceData} variant="outline">
          Atualizar
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Transações</p>
                <p className="text-2xl font-bold">{totalStats.transactions}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold">{formatCurrency(totalStats.amount)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Tempo Médio de Pagamento
                </p>
                <p className="text-2xl font-bold">{Math.round(averagePaymentTime)} dias</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Pontualidade</p>
                <p className="text-2xl font-bold">{Math.round(averageOnTimeRate)}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vendor Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Performance por Fornecedor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Fornecedor</th>
                  <th className="text-left p-2">Score</th>
                  <th className="text-left p-2">Transações</th>
                  <th className="text-left p-2">Valor Total</th>
                  <th className="text-left p-2">Pontualidade</th>
                  <th className="text-left p-2">Tempo Médio</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Documentos</th>
                </tr>
              </thead>
              <tbody>
                {filteredPerformance.map((vendor) => (
                  <tr key={vendor.vendor_id} className="border-b hover:bg-muted/50">
                    <td className="p-2">
                      <div>
                        <p className="font-medium">{vendor.vendor_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Última transação:{" "}
                          {new Date(vendor.last_transaction_date).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={getScoreBadgeVariant(vendor.quality_score)}>
                          {Math.round(vendor.quality_score)}
                        </Badge>
                        <div className="flex items-center">
                          {vendor.quality_score >= 90 ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : vendor.quality_score < 70 ? (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-2">{vendor.total_transactions}</td>
                    <td className="p-2">{formatCurrency(vendor.total_amount)}</td>
                    <td className="p-2">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{Math.round(vendor.on_time_payment_rate)}%</span>
                        </div>
                        <Progress value={vendor.on_time_payment_rate} className="h-2" />
                      </div>
                    </td>
                    <td className="p-2">{vendor.average_payment_time} dias</td>
                    <td className="p-2">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">{vendor.completed_count} concluídas</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm">{vendor.pending_count} pendentes</span>
                        </div>
                        {vendor.overdue_count > 0 && (
                          <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-600" />
                            <span className="text-sm">{vendor.overdue_count} atrasadas</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-2">
                      <Badge variant="outline">{vendor.documents_count} docs</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

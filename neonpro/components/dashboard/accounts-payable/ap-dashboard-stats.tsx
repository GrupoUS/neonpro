"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AccountsPayableService } from "@/lib/services/accounts-payable";
import { VendorService } from "@/lib/services/vendors";
import {
  AlertCircle,
  Building,
  CreditCard,
  Loader2,
  Receipt,
} from "lucide-react";
import { useEffect, useState } from "react";

export function APDashboardStats() {
  const [stats, setStats] = useState({
    pending: 0,
    totalOpenAmount: 0,
    dueToday: 0,
    activeVendors: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [apStats, vendorStats] = await Promise.all([
        AccountsPayableService.getDashboardStats(),
        VendorService.getVendorStats(),
      ]);

      setStats({
        pending: apStats.pending,
        totalOpenAmount: apStats.totalOpenAmount,
        dueToday: apStats.dueToday,
        activeVendors: vendorStats.active,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Contas Pendentes
          </CardTitle>
          <Receipt className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <div className="text-2xl font-bold">--</div>
            </div>
          ) : (
            <div className="text-2xl font-bold">{stats.pending}</div>
          )}
          <p className="text-xs text-muted-foreground">
            Aguardando aprovação ou pagamento
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total em Aberto</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <div className="text-2xl font-bold">R$ --</div>
            </div>
          ) : (
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalOpenAmount)}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Valor total a ser pago
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Vencendo Hoje</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <div className="text-2xl font-bold">--</div>
            </div>
          ) : (
            <div className="text-2xl font-bold">{stats.dueToday}</div>
          )}
          <p className="text-xs text-muted-foreground">
            Contas com vencimento hoje
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Fornecedores Ativos
          </CardTitle>
          <Building className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <div className="text-2xl font-bold">--</div>
            </div>
          ) : (
            <div className="text-2xl font-bold">{stats.activeVendors}</div>
          )}
          <p className="text-xs text-muted-foreground">
            Fornecedores cadastrados
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

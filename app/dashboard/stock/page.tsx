import { createClient } from "@/app/utils/supabase/server";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { StockAlertsManagement } from "@/components/dashboard/stock-alerts-management";
import { StockPerformanceDashboard } from "@/components/dashboard/stock-performance-dashboard";
import { StockReports } from "@/components/dashboard/stock-reports";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Gerenciamento de Estoque - NeonPro",
  description:
    "Sistema de alertas e relatórios de estoque para gestão inteligente de materiais.",
};

export default async function StockManagementPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gerenciamento de Estoque
          </h1>
          <p className="text-muted-foreground">
            Sistema integrado de alertas, relatórios e analytics para gestão
            inteligente de estoque.
          </p>
        </div>

        <Tabs defaultValue="performance" className="space-y-4">
          <TabsList>
            <TabsTrigger value="performance">Performance e KPIs</TabsTrigger>
            <TabsTrigger value="alerts">Alertas e Configurações</TabsTrigger>
            <TabsTrigger value="reports">Relatórios e Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-4">
            <StockPerformanceDashboard />
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <StockAlertsManagement />
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <StockReports />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

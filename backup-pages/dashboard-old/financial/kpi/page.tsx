import { createClient } from "@/app/utils/supabase/server";
import { DashboardLayout } from "@/components/navigation/dashboard-layout";
import { redirect } from "next/navigation";
import { FinancialKPIDashboard } from "./components/financial-kpi-dashboard";

export default async function FinancialKPIPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect("/login");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Financeiro", href: "/dashboard/financial" },
    { title: "KPI Dashboard" },
  ];

  return (
    <DashboardLayout user={user} breadcrumbs={breadcrumbs}>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Dashboard de KPIs Financeiros</h1>
          <p className="text-muted-foreground">
            Acompanhe os principais indicadores financeiros da clínica em tempo
            real
          </p>
        </div>

        <FinancialKPIDashboard />
      </div>
    </DashboardLayout>
  );
}

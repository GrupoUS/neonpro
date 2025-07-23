import { createClient } from "@/app/utils/supabase/server";
import { BillingDashboard } from "@/components/dashboard/billing-dashboard";
import { DashboardLayout } from "@/components/navigation/dashboard-layout";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Sistema de Faturamento - NeonPro",
  description: "Gerencie serviços, faturas e pagamentos da sua clínica",
};

export default async function BillingPage() {
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

  if (!user) {
    redirect("/login");
  }

  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Faturamento" },
  ];

  return (
    <DashboardLayout user={user} breadcrumbs={breadcrumbs}>
      <BillingDashboard />
    </DashboardLayout>
  );
}

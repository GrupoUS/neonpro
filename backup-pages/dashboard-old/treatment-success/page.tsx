import { createClient } from "@/app/utils/supabase/server";
import TreatmentSuccessPage from "@/components/dashboard/treatment-success/TreatmentSuccessPage";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Rastreamento de Sucesso de Tratamento | NeonPro",
  description:
    "Monitore e otimize as taxas de sucesso dos tratamentos da clínica",
};

export default async function TreatmentSuccessPageWrapper() {
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

  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Análise & Inteligência", href: "/dashboard/analytics" },
    { title: "Rastreamento de Sucesso" },
  ];

  return (
    <DashboardLayout user={user} breadcrumbs={breadcrumbs}>
      <TreatmentSuccessPage />
    </DashboardLayout>
  );
}

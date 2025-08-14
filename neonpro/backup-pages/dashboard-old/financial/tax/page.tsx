/**
 * Brazilian Tax System Page
 * Main page for demonstrating Brazilian tax compliance features
 * Part of Story 5.5 - Brazilian Tax System Integration
 */

import { createClient } from "@/app/utils/supabase/server";
import { DashboardLayout } from "@/components/navigation/dashboard-layout";
import { redirect } from "next/navigation";
import BrazilianTaxDemo from "./components/brazilian-tax-demo";

export default async function BrazilianTaxPage() {
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
    { title: "Financeiro", href: "/dashboard/financial" },
    { title: "Sistema Fiscal Brasileiro" },
  ];

  return (
    <DashboardLayout user={user} breadcrumbs={breadcrumbs}>
      <BrazilianTaxDemo />
    </DashboardLayout>
  );
}

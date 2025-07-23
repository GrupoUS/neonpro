import { createClient } from "@/app/utils/supabase/server";
import { AccountsPayableList } from "@/components/dashboard/accounts-payable/accounts-payable-list";
import { DashboardLayout } from "@/components/navigation/dashboard-layout";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function AccountsPayablePage() {
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
    { title: "Contas a Pagar", href: "/dashboard/accounts-payable" },
    { title: "Contas a Pagar" },
  ];

  return (
    <DashboardLayout user={user} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        <Suspense fallback={<div>Carregando contas a pagar...</div>}>
          <AccountsPayableList />
        </Suspense>
      </div>
    </DashboardLayout>
  );
}

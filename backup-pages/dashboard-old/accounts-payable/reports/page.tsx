import { createClient } from "@/app/utils/supabase/server";
import FinancialReportsPage from "@/components/dashboard/accounts-payable/financial-reports";
import { redirect } from "next/navigation";

export default async function ReportsPage() {
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

  // Buscar perfil do usuário para obter clinic_id
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!profile?.clinic_id) {
    redirect("/dashboard");
  }

  return <FinancialReportsPage clinicId={profile.clinic_id} />;
}

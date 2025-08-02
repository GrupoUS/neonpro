import { createClient } from "@/app/utils/supabase/server";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { TreatmentPredictionDashboard } from "@/components/dashboard/treatment-prediction-dashboard";
import { redirect } from "next/navigation";

export default async function TreatmentPredictionPage() {
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
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Predição de Tratamentos com IA
          </h1>
          <p className="mt-2 text-gray-600">
            Sistema avançado de predição de sucesso de tratamentos estéticos
            usando inteligência artificial
          </p>
        </div>

        <TreatmentPredictionDashboard />
      </div>
    </DashboardLayout>
  );
}

export const metadata = {
  title: "Predição de Tratamentos | NeonPro",
  description: "Sistema de predição de sucesso de tratamentos usando IA",
};

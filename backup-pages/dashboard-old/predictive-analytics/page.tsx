import { createClient } from "@/app/utils/supabase/server";
import PredictiveAnalyticsPage from "@/components/dashboard/predictive-analytics/PredictiveAnalyticsPage";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function PredictiveAnalytics() {
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
    <div className="flex-1 space-y-4 p-8 pt-6">
      <Suspense fallback={<div>Carregando...</div>}>
        <PredictiveAnalyticsPage />
      </Suspense>
    </div>
  );
}

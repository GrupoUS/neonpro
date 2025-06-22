import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { FinancialSummary } from "@/components/dashboard/financial-summary";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentAppointments } from "@/components/dashboard/recent-appointments";
import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";

// Skeleton para loading
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-200 animate-pulse p-4 rounded-lg h-24"
          ></div>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-gray-200 animate-pulse p-4 rounded-lg h-64"></div>
        <div className="bg-gray-200 animate-pulse p-4 rounded-lg h-64"></div>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = createClient();

  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Acesso negado</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header da página */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral da sua clínica de estética
        </p>
      </div>

      {/* Estatísticas principais */}
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardStats />
      </Suspense>

      {/* Ações rápidas */}
      <Suspense fallback={<div>Carregando ações...</div>}>
        <QuickActions />
      </Suspense>

      {/* Conteúdo principal */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Agendamentos recentes */}
        <Suspense fallback={<div>Carregando agendamentos...</div>}>
          <RecentAppointments />
        </Suspense>

        {/* Resumo financeiro */}
        <Suspense fallback={<div>Carregando resumo financeiro...</div>}>
          <FinancialSummary />
        </Suspense>
      </div>
    </div>
  );
}

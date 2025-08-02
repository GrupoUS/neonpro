/**
 * Scenario Planning Dashboard Page
 * Página do dashboard para planejamento de cenários financeiros
 */

import { createClient } from '@/app/utils/supabase/server';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/navigation/DashboardLayout';
import { ScenarioPlanner } from '@/components/financial/ScenarioPlanner';

export default async function ScenariosPage() {
  const supabase = await createClient();
  
  // Verificar autenticação
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/login');
  }
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Breadcrumbs para navegação
  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Financeiro", href: "/dashboard/financial" },
    { title: "Planejamento de Cenários" }
  ];

  return (
    <DashboardLayout user={user} breadcrumbs={breadcrumbs}>
      <ScenarioPlanner userId={user.id} />
    </DashboardLayout>
  );
}
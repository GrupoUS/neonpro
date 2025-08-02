/**
 * Financial Alerts Page for NeonPro
 * Página de gerenciamento de alertas financeiros
 */

import { Suspense } from 'react';
import { Metadata } from 'next';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { AlertManager } from '@/components/financial/AlertManager';
import { createClient } from '@/app/utils/supabase/server';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Alertas Financeiros | NeonPro',
  description: 'Gerencie alertas e notificações financeiras do seu consultório',
};

export default async function FinancialAlertsPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/login');
  }

  const { data: { user } } = await supabase.auth.getUser();

  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Financeiro", href: "/dashboard/financial" },
    { title: "Alertas" }
  ];

  return (
    <DashboardLayout user={user} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alertas Financeiros</h1>
          <p className="text-muted-foreground">
            Monitore e gerencie alertas financeiros em tempo real para manter a saúde financeira do seu consultório
          </p>
        </div>

        <Suspense 
          fallback={
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Carregando alertas financeiros...</p>
              </div>
            </div>
          }
        >
          <AlertManager userId={user?.id || ''} />
        </Suspense>
      </div>
    </DashboardLayout>
  );
}
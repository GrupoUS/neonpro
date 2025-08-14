import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/app/utils/supabase/server';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import ExecutiveDashboard from '@/components/dashboard/executive-dashboard';

export default async function ExecutiveDashboardPage() {
  const supabase = await createClient();
  
  // Check authentication
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/login');
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Get user's clinic access
  const { data: professional, error } = await supabase
    .from('professionals')
    .select('clinic_id, clinics(clinic_name)')
    .eq('user_id', user.id)
    .single();

  if (error || !professional) {
    return (
      <DashboardLayout user={user} breadcrumbs={[
        { title: "Dashboard", href: "/dashboard" },
        { title: "Executivo" }
      ]}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              Acesso não autorizado
            </h2>
            <p className="text-sm text-gray-500">
              Você não tem permissão para acessar o dashboard executivo.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Executivo" }
  ];

  return (
    <DashboardLayout user={user} breadcrumbs={breadcrumbs}>
      <ExecutiveDashboard 
        clinicId={professional.clinic_id}
        userId={user.id}
      />
    </DashboardLayout>
  );
}
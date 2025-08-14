// Cash Flow Management Page
// Main page for daily cash flow management

import { redirect } from 'next/navigation';
import { createClient } from '@/app/utils/supabase/server';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { CashFlowDashboard } from '@/components/cash-flow';

export default async function CashFlowPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/login');
  }

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Get user profile with clinic information
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, clinic_id')
    .eq('id', user.id)
    .single();

  if (!profile?.clinic_id) {
    redirect('/dashboard');
  }

  const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Fluxo de Caixa' }
  ];

  return (
    <DashboardLayout user={user} breadcrumbs={breadcrumbs}>
      <CashFlowDashboard 
        clinicId={profile.clinic_id}
        userId={user.id}
      />
    </DashboardLayout>
  );
}
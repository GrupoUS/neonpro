import { createClient } from '@/app/utils/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/navigation/dashboard-layout';
import { AnalyticsDashboard } from '@/components/analytics';

export default async function AnalyticsPage() {
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

  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Analytics" }
  ];

  return (
    <DashboardLayout user={user} breadcrumbs={breadcrumbs}>
      <AnalyticsDashboard />
    </DashboardLayout>
  );
}
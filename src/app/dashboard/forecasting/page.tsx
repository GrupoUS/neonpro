/**
 * Demand Forecasting Page - Story 11.1
 * 
 * Main page for demand forecasting with comprehensive dashboard
 * Includes real-time monitoring, resource allocation, and performance tracking
 */

import { Metadata } from 'next';
import { createClient } from '@/app/utils/supabase/server';
import { redirect } from 'next/navigation';
import ForecastingDashboard from '@/src/components/dashboard/forecasting/forecasting-dashboard';
import DashboardLayout from '@/components/dashboard/dashboard-layout';

export const metadata: Metadata = {
  title: 'Demand Forecasting | NeonPro',
  description: 'AI-powered demand forecasting with ≥80% accuracy for clinic management',
};

export default async function DemandForecastingPage() {
  // Authentication check
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/login');
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Breadcrumbs for navigation
  const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Analytics', href: '/dashboard/analytics' },
    { title: 'Demand Forecasting' }
  ];

  return (
    <DashboardLayout user={user} breadcrumbs={breadcrumbs}>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <ForecastingDashboard />
      </div>
    </DashboardLayout>
  );
}
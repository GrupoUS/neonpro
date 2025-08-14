// =====================================================================================
// MARKETING CAMPAIGNS DASHBOARD - Story 7.2 Implementation
// Automated Marketing Campaigns + Personalization
// =====================================================================================

import { redirect } from 'next/navigation';
import { createClient } from '@/app/utils/supabase/server';
import { DashboardLayout } from '@/app/components/dashboard/dashboard-layout';
import { MarketingCampaignsDashboard } from '@/app/components/marketing/marketing-campaigns-dashboard';

export default async function MarketingCampaignsPage() {
  // Authentication and user data
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/login');
  }

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Breadcrumb configuration
  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Marketing", href: "/dashboard/marketing" },
    { title: "Automated Campaigns" }
  ];

  return (
    <DashboardLayout user={user} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Automated Marketing Campaigns
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Create, manage, and optimize automated marketing campaigns with AI-driven personalization
            </p>
          </div>
        </div>

        {/* Main Dashboard Component */}
        <MarketingCampaignsDashboard />
      </div>
    </DashboardLayout>
  );
}

export const metadata = {
  title: 'Marketing Campaigns | NeonPro',
  description: 'Automated marketing campaigns with personalization and A/B testing capabilities',
};
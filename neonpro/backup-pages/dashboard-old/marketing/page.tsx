import { Suspense } from 'react';
import { createClient } from '@/app/utils/supabase/server';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/layout';
import { 
  OAuthConnectionsManager, 
  BackgroundJobsMonitor, 
  MarketingAutomationDashboard 
} from '@/components/dashboard/marketing';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Settings,
  Activity,
  Target,
  BarChart3,
} from 'lucide-react';

/**
 * Marketing Dashboard Page - Research-Backed Implementation
 * 
 * Features:
 * - OAuth connection management for social platforms
 * - Background job monitoring and control
 * - Marketing automation campaign management
 * - Comprehensive analytics and performance tracking
 * 
 * Based on modern SaaS marketing dashboard patterns and UX best practices
 */

const LoadingSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <Skeleton className="h-8 w-full mb-2" />
            <Skeleton className="h-12 w-3/4" />
          </CardContent>
        </Card>
      ))}
    </div>
    <Card>
      <CardContent className="p-6">
        <Skeleton className="h-8 w-1/3 mb-4" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

export default async function MarketingDashboard() {
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

  // Define breadcrumbs for navigation
  const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Marketing' }
  ];

  return (
    <DashboardLayout user={user} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Marketing Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Manage social media connections, monitor automation, and track campaign performance
            </p>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="connections" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="connections" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Connections</span>
            </TabsTrigger>
            <TabsTrigger value="automation" className="flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span>Campaigns</span>
            </TabsTrigger>
            <TabsTrigger value="jobs" className="flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>System Jobs</span>
            </TabsTrigger>
          </TabsList>

          {/* OAuth Connections Tab */}
          <TabsContent value="connections" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Platform Connections</h2>
                <p className="text-gray-600">
                  Connect and manage your social media and marketing platform integrations
                </p>
              </div>
            </div>
            
            <Suspense fallback={<LoadingSkeleton />}>
              <OAuthConnectionsManager />
            </Suspense>
          </TabsContent>

          {/* Marketing Automation Tab */}
          <TabsContent value="automation" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Marketing Campaigns</h2>
                <p className="text-gray-600">
                  Create, manage, and monitor automated marketing campaigns
                </p>
              </div>
            </div>
            
            <Suspense fallback={<LoadingSkeleton />}>
              <MarketingAutomationDashboard />
            </Suspense>
          </TabsContent>

          {/* Background Jobs Tab */}
          <TabsContent value="jobs" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Background Jobs</h2>
                <p className="text-gray-600">
                  Monitor system jobs, queue health, and automation performance
                </p>
              </div>
            </div>
            
            <Suspense fallback={<LoadingSkeleton />}>
              <BackgroundJobsMonitor />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
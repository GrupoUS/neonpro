// Story 11.2: No-Show Prediction Dashboard Page
// Main dashboard for no-show prediction analytics and management

import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/app/utils/supabase/server';
import { DashboardLayout } from '@/components/dashboard/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NoShowPredictionOverview from '@/components/dashboard/no-show-prediction/overview';
import NoShowPredictionAnalytics from '@/components/dashboard/no-show-prediction/analytics';
import NoShowPredictionInterventions from '@/components/dashboard/no-show-prediction/interventions';
import RiskFactorsManagement from '@/components/dashboard/no-show-prediction/risk-factors';
import { Skeleton } from '@/components/ui/skeleton';

export default async function NoShowPredictionDashboard() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const { data: { user } } = await supabase.auth.getUser();

  const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Analytics', href: '/dashboard/analytics' },
    { title: 'No-Show Prediction' }
  ];

  return (
    <DashboardLayout user={user} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">No-Show Prediction</h1>
            <p className="text-muted-foreground">
              Predict and prevent patient no-shows with advanced analytics
            </p>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="interventions">Interventions</TabsTrigger>
            <TabsTrigger value="risk-factors">Risk Factors</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Suspense fallback={<DashboardSkeleton />}>
              <NoShowPredictionOverview />
            </Suspense>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Suspense fallback={<DashboardSkeleton />}>
              <NoShowPredictionAnalytics />
            </Suspense>
          </TabsContent>

          <TabsContent value="interventions" className="space-y-4">
            <Suspense fallback={<DashboardSkeleton />}>
              <NoShowPredictionInterventions />
            </Suspense>
          </TabsContent>

          <TabsContent value="risk-factors" className="space-y-4">
            <Suspense fallback={<DashboardSkeleton />}>
              <RiskFactorsManagement />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-7 w-[60px] mb-1" />
            <Skeleton className="h-3 w-[120px]" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
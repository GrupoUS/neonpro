'use client';

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/layout';
import { RetentionAnalyticsDashboard } from '@/components/dashboard/retention/retention-analytics-dashboard';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrentUser } from '@/hooks/use-auth';

const breadcrumbs = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Analytics de Retenção' }
];

export default function RetentionAnalyticsPage() {
  const { user, loading } = useCurrentUser();

  if (loading) {
    return (
      <DashboardLayout breadcrumbs={breadcrumbs}>
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-4 w-[100px] mb-2" />
                <Skeleton className="h-8 w-[60px]" />
              </Card>
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6">
              <Skeleton className="h-[200px] w-full" />
            </Card>
            <Card className="p-6">
              <Skeleton className="h-[200px] w-full" />
            </Card>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user?.clinic_id) {
    notFound();
  }

  return (
    <DashboardLayout user={user} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics de Retenção</h1>
          <p className="text-muted-foreground">
            Monitore a retenção de pacientes e previna a perda com insights inteligentes
          </p>
        </div>

        <Suspense
          fallback={
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="p-6">
                    <Skeleton className="h-4 w-[100px] mb-2" />
                    <Skeleton className="h-8 w-[60px]" />
                  </Card>
                ))}
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="p-6">
                  <Skeleton className="h-[200px] w-full" />
                </Card>
                <Card className="p-6">
                  <Skeleton className="h-[200px] w-full" />
                </Card>
              </div>
            </div>
          }
        >
          <RetentionAnalyticsDashboard clinicId={user.clinic_id} />
        </Suspense>
      </div>
    </DashboardLayout>
  );
}
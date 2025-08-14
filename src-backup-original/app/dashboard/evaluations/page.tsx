import { Suspense } from 'react';
import { createClient } from '@/app/utils/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/navigation/DashboardLayout';
import { EvaluationAnalytics } from '@/components/patient-portal/evaluations';
import { Card, CardContent } from '@/components/ui/card';

async function DashboardEvaluationsPage() {
  const supabase = await createClient();
  
  // Check authentication
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/auth');
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/auth');
  }

  // Get user profile to check permissions
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'manager', 'professional'].includes(profile.role)) {
    redirect('/patient-portal');
  }

  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Avaliações" }
  ];

  return (
    <DashboardLayout user={user} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Avaliações</h1>
          <p className="text-muted-foreground">
            Analytics completos sobre satisfação e feedback dos pacientes
          </p>
        </div>

        <Suspense fallback={
          <div className="space-y-6">
            {/* Key Metrics Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Charts Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-4">
                      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-40 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        }>
          <EvaluationAnalytics />
        </Suspense>
      </div>
    </DashboardLayout>
  );
}

export default DashboardEvaluationsPage;
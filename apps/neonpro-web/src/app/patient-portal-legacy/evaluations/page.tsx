import { Suspense } from 'react';
import { createClient } from '@/app/utils/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/navigation/dashboard-layout';
import { EvaluationHistory } from '@/components/patient-portal/evaluations-legacy';
import { NPSWidget } from '@/components/patient-portal/evaluations-legacy';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';

async function EvaluationsPage() {
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

  // Get user profile to check if it's a patient
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'patient') {
    redirect('/dashboard');
  }

  const breadcrumbs = [
    { title: "Portal do Paciente", href: "/patient-portal" },
    { title: "Avaliações" }
  ];

  return (
    <DashboardLayout user={user} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Minhas Avaliações</h1>
          <p className="text-muted-foreground">
            Avalie seus atendimentos e acompanhe seu histórico de feedback
          </p>
        </div>

        <Tabs defaultValue="history" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="history">Histórico de Avaliações</TabsTrigger>
            <TabsTrigger value="nps">Avaliar Clínica (NPS)</TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="space-y-6">
            <Suspense fallback={
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="animate-pulse space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            }>
              <EvaluationHistory />
            </Suspense>
          </TabsContent>

          <TabsContent value="nps" className="space-y-6">
            <Suspense fallback={
              <Card>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="grid grid-cols-11 gap-2">
                      {[...Array(11)].map((_, i) => (
                        <div key={i} className="h-12 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            }>
              <NPSWidget />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

export default EvaluationsPage;
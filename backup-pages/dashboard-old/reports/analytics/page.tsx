import { createClient } from "@/app/utils/supabase/server";
import { DashboardLayout } from "@/components/navigation/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Plus } from "lucide-react";
import { redirect } from "next/navigation";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");
  const { data: { user } } = await supabase.auth.getUser();

  const breadcrumbs = [{"title":"Dashboard","href":"/dashboard"},{"title":"Relatórios","href":"/dashboard/reports"},{"title":"Análise de Dados"}];

  return (
    <DashboardLayout user={user} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Análise de Dados</h2>
            <p className="text-muted-foreground">Análises detalhadas e métricas</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Análise de Dados
            </CardTitle>
            <CardDescription>
              Esta página está em desenvolvimento. Em breve você poderá acessar todas as funcionalidades aqui.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Funcionalidade em Desenvolvimento</h3>
              <p className="mt-2 text-muted-foreground">
                Este módulo será implementado em breve com funcionalidades completas.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
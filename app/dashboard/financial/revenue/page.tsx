import { createClient } from "@/app/utils/supabase/server";
import { DashboardLayout } from "@/components/navigation/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Plus } from "lucide-react";
import { redirect } from "next/navigation";

export default async function RevenuePage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");
  const { data: { user } } = await supabase.auth.getUser();

  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Financeiro", href: "/dashboard/financial" },
    { title: "Receitas" },
  ];

  return (
    <DashboardLayout user={user} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Receitas</h2>
            <p className="text-muted-foreground">Gerencie todas as receitas da clínica</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Receita
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Controle de Receitas
            </CardTitle>
            <CardDescription>
              Esta página está em desenvolvimento. Em breve você poderá gerenciar todas as receitas da sua clínica aqui.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <DollarSign className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Funcionalidade em Desenvolvimento</h3>
              <p className="mt-2 text-muted-foreground">
                O módulo de receitas será implementado em breve com funcionalidades completas.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
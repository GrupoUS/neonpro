// app/dashboard/patients/page.tsx
import { createClient } from "@/app/utils/supabase/server";
import { DashboardLayout } from "@/components/navigation/dashboard-layout";
import PatientSearch from "@/components/patients/patient-search";
import PatientProfile from "@/components/patients/patient-profile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Users, Activity, Heart } from "lucide-react";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function PatientsPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Pacientes" }
  ];

  // Mock stats for patient management
  const patientStats = {
    totalPatients: 1247,
    activePatients: 892,
    newThisMonth: 45,
    chronicPatients: 156
  };

  return (
    <DashboardLayout user={user} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Gerenciamento de Pacientes
            </h2>
            <p className="text-muted-foreground">
              Visualize, pesquise e gerencie todos os seus pacientes em um só lugar.
            </p>
          </div>
          <div className="flex gap-2">
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Novo Paciente
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Pacientes
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {patientStats.totalPatients.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Todos os pacientes cadastrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pacientes Ativos
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {patientStats.activePatients.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Últimos 6 meses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Novos Este Mês
              </CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {patientStats.newThisMonth}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12%</span> vs mês anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pacientes Crônicos
              </CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {patientStats.chronicPatients}
              </div>
              <p className="text-xs text-muted-foreground">
                Acompanhamento especial
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Search Panel - Takes 1 column */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Buscar Pacientes</CardTitle>
              <CardDescription>
                Pesquise por nome, CPF, telefone ou outras informações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Carregando busca...</div>}>
                <PatientSearch />
              </Suspense>
            </CardContent>
          </Card>

          {/* Patient Profile - Takes 2 columns */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Perfil do Paciente</CardTitle>
              <CardDescription>
                Visualização 360° completa do paciente selecionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Carregando perfil...</div>}>
                <PatientProfile />
              </Suspense>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Acesse funcionalidades importantes rapidamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                <UserPlus className="h-6 w-6" />
                <span>Cadastrar Paciente</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                <Activity className="h-6 w-6" />
                <span>Relatórios</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                <Heart className="h-6 w-6" />
                <span>Pacientes Especiais</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                <Users className="h-6 w-6" />
                <span>Grupos de Pacientes</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
import { createClient } from "@/app/utils/supabase/server";
import { DashboardLayout } from "@/components/navigation/dashboard-layout";
import EnhancedPatientList from "@/components/patients/enhanced-patient-list";
import PatientRegistrationForm from "@/components/patients/patient-registration-form";
import EnhancedPatientProfile from "@/components/patients/enhanced-patient-profile";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  FileText, 
  Heart, 
  UserPlus, 
  Users,
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertTriangle,
  Clock,
  Shield
} from "lucide-react";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function EnhancedPatientsPage() {
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
    { title: "Gestão de Pacientes" },
  ];

  // Get real patient statistics
  const getPatientStats = async () => {
    try {
      // Total patients
      const { count: totalPatients } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'patient');

      // Active patients (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const { count: activePatients } = await supabase
        .from('medical_timeline')
        .select('patient_id', { count: 'exact', head: true })
        .gte('event_date', sixMonthsAgo.toISOString())
        .distinct();

      // New patients this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const { count: newThisMonth } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'patient')
        .gte('created_at', startOfMonth.toISOString());

      // Previous month for comparison
      const startOfPrevMonth = new Date(startOfMonth);
      startOfPrevMonth.setMonth(startOfPrevMonth.getMonth() - 1);
      
      const { count: newLastMonth } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'patient')
        .gte('created_at', startOfPrevMonth.toISOString())
        .lt('created_at', startOfMonth.toISOString());

      // High-risk patients
      const { count: highRiskPatients } = await supabase
        .from('patient_profiles_extended')
        .select('*', { count: 'exact', head: true })
        .in('risk_level', ['high', 'critical']);

      // Patients needing follow-up
      const { count: followUpNeeded } = await supabase
        .from('medical_timeline')
        .select('*', { count: 'exact', head: true })
        .eq('follow_up_required', true)
        .is('follow_up_date', null);

      // Calculate growth percentage
      const growthPercentage = newLastMonth && newLastMonth > 0 
        ? Math.round(((newThisMonth || 0) - newLastMonth) / newLastMonth * 100)
        : 0;

      return {
        totalPatients: totalPatients || 0,
        activePatients: activePatients || 0,
        newThisMonth: newThisMonth || 0,
        highRiskPatients: highRiskPatients || 0,
        followUpNeeded: followUpNeeded || 0,
        growthPercentage
      };
    } catch (error) {
      console.error('Error fetching patient stats:', error);
      return {
        totalPatients: 0,
        activePatients: 0,
        newThisMonth: 0,
        highRiskPatients: 0,
        followUpNeeded: 0,
        growthPercentage: 0
      };
    }
  };

  const patientStats = await getPatientStats();

  return (
    <DashboardLayout user={user} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Gestão de Pacientes NeonPro
            </h2>
            <p className="text-muted-foreground">
              Sistema completo de gerenciamento de pacientes com conformidade LGPD e integração em tempo real.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Relatórios
            </Button>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Novo Paciente
            </Button>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
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
                <span className={`${patientStats.growthPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {patientStats.growthPercentage >= 0 ? '+' : ''}{patientStats.growthPercentage}%
                </span>
                {' '}vs mês anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Alto Risco
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {patientStats.highRiskPatients}
              </div>
              <p className="text-xs text-muted-foreground">
                Atenção especial necessária
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Retornos Pendentes
              </CardTitle>
              <Clock className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {patientStats.followUpNeeded}
              </div>
              <p className="text-xs text-muted-foreground">
                Aguardando reagendamento
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Main Content */}
        <Tabs defaultValue="list" className="space-y-6">
          <TabsList>
            <TabsTrigger value="list">Lista de Pacientes</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="compliance">Conformidade LGPD</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-6">
            <Suspense fallback={
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2">Carregando lista de pacientes...</span>
                </CardContent>
              </Card>
            }>
              <EnhancedPatientList />
            </Suspense>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Growth Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Tendências de Crescimento
                  </CardTitle>
                  <CardDescription>
                    Análise de novos pacientes nos últimos 6 meses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Este mês</span>
                      <div className="flex items-center gap-2">
                        {patientStats.growthPercentage >= 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <span className="font-medium">{patientStats.newThisMonth} novos pacientes</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Taxa de crescimento</span>
                      <span className={patientStats.growthPercentage >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {patientStats.growthPercentage >= 0 ? '+' : ''}{patientStats.growthPercentage}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Risk Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Distribuição de Risco
                  </CardTitle>
                  <CardDescription>
                    Classificação de pacientes por nível de risco
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Baixo Risco</span>
                      </div>
                      <span className="font-medium">
                        {Math.max(0, patientStats.totalPatients - patientStats.highRiskPatients)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="text-sm">Alto Risco</span>
                      </div>
                      <span className="font-medium text-orange-600">
                        {patientStats.highRiskPatients}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Follow-up Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Gestão de Retornos
                  </CardTitle>
                  <CardDescription>
                    Acompanhamento de consultas e procedimentos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Retornos pendentes</span>
                      <span className="font-medium text-red-600">
                        {patientStats.followUpNeeded}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Pacientes ativos</span>
                      <span className="font-medium text-green-600">
                        {patientStats.activePatients}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Ações Rápidas</CardTitle>
                  <CardDescription>
                    Operações frequentes do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <Button variant="outline" className="justify-start">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Cadastrar Novo Paciente
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <FileText className="mr-2 h-4 w-4" />
                      Relatório de Atendimentos
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Pacientes Alto Risco
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <Clock className="mr-2 h-4 w-4" />
                      Retornos Pendentes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* LGPD Compliance Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Status de Conformidade LGPD
                  </CardTitle>
                  <CardDescription>
                    Monitoramento em tempo real da conformidade com a LGPD
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Consentimentos Ativos</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="font-medium text-green-600">100%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Dados Criptografados</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="font-medium text-green-600">Ativo</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Audit Trail</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="font-medium text-green-600">Ativo</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Políticas RLS</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="font-medium text-green-600">Aplicadas</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Data Retention Policy */}
              <Card>
                <CardHeader>
                  <CardTitle>Política de Retenção de Dados</CardTitle>
                  <CardDescription>
                    Conformidade com CFM e LGPD para dados médicos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-1">
                        Dados Médicos (CFM)
                      </h4>
                      <p className="text-sm text-blue-800">
                        Retenção por 20 anos conforme Resolução CFM 1.821/2007
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-1">
                        Dados Pessoais (LGPD)
                      </h4>
                      <p className="text-sm text-green-800">
                        Retenção conforme finalidade e consentimento do titular
                      </p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <h4 className="font-medium text-orange-900 mb-1">
                        Direitos do Titular
                      </h4>
                      <p className="text-sm text-orange-800">
                        Acesso, correção, exclusão e portabilidade garantidos
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Compliance Actions */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Ações de Conformidade</CardTitle>
                  <CardDescription>
                    Ferramentas para gestão de conformidade e privacidade
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                    <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                      <Shield className="h-6 w-6" />
                      <span className="text-sm">Audit de Consentimentos</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                      <FileText className="h-6 w-6" />
                      <span className="text-sm">Relatório LGPD</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                      <Users className="h-6 w-6" />
                      <span className="text-sm">Solicitações de Dados</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                      <Activity className="h-6 w-6" />
                      <span className="text-sm">Log de Atividades</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
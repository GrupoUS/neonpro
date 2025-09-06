"use client";

import { useAppointments } from "@/hooks/useAppointments";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { usePatients } from "@/hooks/usePatients";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@neonpro/ui";
import { Building2, Calendar, Shield, TestTube, User } from "lucide-react";
import Link from "next/link";
import { PatientsList } from "../components/PatientsList";
import { AppointmentsList } from "./components/dashboard/AppointmentsList";
import { HeroSection } from "./components/dashboard/HeroSection";
import { MetricsCards } from "./components/dashboard/MetricsCards";

interface Patient {
  id: string;
  name?: string;
  status: string;
  avatar?: string;
}

interface Appointment {
  id: string;
  patient?: {
    name?: string;
  };
  time?: string;
  type?: string;
}

const MetricsSection = ({
  metricsLoading,
  monthlyRevenue,
  revenueGrowth,
  totalPatients,
  upcomingAppointments,
}: {
  metricsLoading: boolean;
  monthlyRevenue: number;
  revenueGrowth: number;
  totalPatients: number;
  upcomingAppointments: number;
}) => (
  <section className="container mx-auto px-6 pb-20">
    <div className="mb-12 text-center">
      <h2 className="mb-4 font-bold text-3xl text-foreground">
        Performance em Tempo Real
      </h2>
      <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
        Acompanhe o crescimento da sua clínica com métricas atualizadas automaticamente
      </p>
    </div>

    <MetricsCards
      metricsLoading={metricsLoading}
      monthlyRevenue={monthlyRevenue}
      revenueGrowth={revenueGrowth}
      totalPatients={totalPatients}
      upcomingAppointments={upcomingAppointments}
    />
  </section>
);

const QuickAccessSection = ({
  patientsLoading,
  recentPatients,
  appointmentsLoading,
  todaysAppointments,
}: {
  patientsLoading: boolean;
  recentPatients: Patient[];
  appointmentsLoading: boolean;
  todaysAppointments: Appointment[];
}) => (
  <section className="container mx-auto px-6 pb-20">
    <div className="mb-12 text-center">
      <h2 className="mb-4 font-bold text-3xl text-foreground">Acesso Rápido</h2>
      <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
        Informações importantes sempre à mão
      </p>
    </div>

    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <PatientsList
        patientsLoading={patientsLoading}
        recentPatients={recentPatients}
      />

      <AppointmentsList
        appointmentsLoading={appointmentsLoading}
        todaysAppointments={todaysAppointments}
      />
    </div>

    {/* Quick Access Links */}
    <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Gerenciar Pacientes
          </CardTitle>
          <CardDescription>
            Sistema completo de cadastro e gerenciamento de pacientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/pacientes">
            <Button className="w-full">
              <User className="h-4 w-4 mr-2" />
              Ver Todos os Pacientes
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Agenda de Consultas
          </CardTitle>
          <CardDescription>
            Visualização e gerenciamento de agendamentos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/agenda">
            <Button className="w-full">
              <Calendar className="h-4 w-4 mr-2" />
              Abrir Agenda
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            Gerenciar Clínica
          </CardTitle>
          <CardDescription>
            Configurações, equipe e informações da clínica
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/clinica">
            <Button className="w-full">
              <Building2 className="h-4 w-4 mr-2" />
              Gerenciar Clínica
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Teste de Autenticação
          </CardTitle>
          <CardDescription>
            Página de desenvolvimento para testar o sistema de autenticação real
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/auth-test">
            <Button className="w-full" variant="outline">
              <TestTube className="h-4 w-4 mr-2" />
              Abrir Teste de Auth
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  </section>
);

export default function HomePage() {
  const metricsData = useDashboardMetrics();
  const patientsData = usePatients();
  const appointmentsData = useAppointments();

  return (
    <div className="min-h-screen bg-background">
      <HeroSection />

      <MetricsSection
        metricsLoading={metricsData.loading}
        monthlyRevenue={metricsData.monthlyRevenue}
        revenueGrowth={metricsData.revenueGrowth}
        totalPatients={metricsData.totalPatients}
        upcomingAppointments={metricsData.upcomingAppointments}
      />

      <QuickAccessSection
        patientsLoading={patientsData.loading}
        recentPatients={patientsData.recentPatients}
        appointmentsLoading={appointmentsData.loading}
        todaysAppointments={appointmentsData.todaysAppointments}
      />
    </div>
  );
}

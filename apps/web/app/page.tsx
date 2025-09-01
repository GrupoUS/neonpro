"use client";

import { useAppointments } from "@/hooks/useAppointments";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { usePatients } from "@/hooks/usePatients";
import { AppointmentsList } from "./components/dashboard/AppointmentsList";
import { HeroSection } from "./components/dashboard/HeroSection";
import { MetricsCards } from "./components/dashboard/MetricsCards";
import { PatientsList } from "../components/PatientsList";

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

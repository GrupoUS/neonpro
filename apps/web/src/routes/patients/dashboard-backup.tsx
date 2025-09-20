import { AccessiblePatientCard } from "@/components/accessibility/AccessiblePatientCard";
import { MobilePatientCard } from "@/components/patients/MobilePatientCard";
import { AnimatedModal } from "@/components/ui/animated-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EnhancedTable } from "@/components/ui/enhanced-table";
import { FocusCards } from "@/components/ui/focus-cards";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { UniversalButton } from "@/components/ui/universal-button";
import { useToast } from "@/hooks/use-toast";
import { usePatientStats } from "@/hooks/usePatientStats";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { cn } from "@/lib/utils";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { format, isThisWeek, isToday, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Activity,
  AlertTriangle,
  Bell,
  Calendar,
  Clock,
  Eye,
  Heart,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Shield,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/patients/dashboard-backup")({
  component: PatientDashboard,
});

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  riskScore?: number;
  lastVisit?: string;
  nextAppointment?: {
    date: string;
    time: string;
  };
  healthInsurance?: {
    provider: string;
  };
}

interface PatientDashboardStats {
  totalPatients: number;
  newThisMonth: number;
  highRiskPatients: number;
  appointmentsToday: number;
  noShowRate: number;
  activePatients: number;
  pendingFollowUps: number;
  completedTreatments: number;
  patientSatisfaction: number;
}

interface AIInsight {
  id: string;
  type:
    | "no_show_prediction"
    | "risk_assessment"
    | "treatment_recommendation"
    | "follow_up_alert";
  patientId?: string;
  patientName?: string;
  title: string;
  description: string;
  confidence: number;
  priority: "low" | "medium" | "high" | "critical";
  actionable: boolean;
  actionLabel?: string;
  timestamp: Date;
}

interface RealTimeUpdate {
  type:
    | "new_patient"
    | "appointment_update"
    | "status_change"
    | "risk_level_change";
  message: string;
  timestamp: Date;
  patientId?: string;
}

interface PatientCardProps {
  patient: Patient;
  onClick: (patientId: string) => void;
}

function PatientCard({ patient, onClick }: PatientCardProps) {
  const getRiskColor = (riskScore: number) => {
    if (riskScore >= 0.8) return "destructive";
    if (riskScore >= 0.6) return "warning";
    return "default";
  };

  const getRiskLabel = (riskScore: number) => {
    if (riskScore >= 0.8) return "Alto Risco";
    if (riskScore >= 0.6) return "Médio Risco";
    return "Baixo Risco";
  };

  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onClick(patient.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{patient.name}</CardTitle>
          <Badge variant={getRiskColor(patient.riskScore || 0)}>
            {getRiskLabel(patient.riskScore || 0)}
          </Badge>
        </div>
        <CardDescription>
          {patient.email} • {patient.phone}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span>Última consulta:</span>
          <span>
            {patient.lastVisit
              ? format(new Date(patient.lastVisit), "dd/MM/yyyy", {
                  locale: ptBR,
                })
              : "Nunca"}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Plano de saúde:</span>
          <span>{patient.healthInsurance?.provider || "Particular"}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Status:</span>
          <Badge variant="outline">{patient.status}</Badge>
        </div>
        {patient.nextAppointment && (
          <div className="pt-2 border-t">
            <div className="text-sm font-medium">Próxima consulta:</div>
            <div className="text-sm text-muted-foreground">
              {format(
                new Date(patient.nextAppointment.date),
                "dd/MM/yyyy HH:mm",
                { locale: ptBR },
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PatientDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Enhanced mock data for development with Brazilian healthcare context
  const mockStats: PatientDashboardStats = {
    totalPatients: 1250,
    newThisMonth: 45,
    highRiskPatients: 89,
    appointmentsToday: 24,
    noShowRate: 8.5,
    activePatients: 1156,
    pendingFollowUps: 67,
    completedTreatments: 2341,
    patientSatisfaction: 4.7,
  };

  const mockAIInsights: AIInsight[] = [
    {
      id: "1",
      type: "no_show_prediction",
      patientId: "1",
      patientName: "João Silva",
      title: "Alto risco de não comparecimento",
      description:
        "Paciente tem 85% de probabilidade de não comparecer à consulta de hoje",
      confidence: 0.85,
      priority: "high",
      actionable: true,
      actionLabel: "Notificar paciente",
      timestamp: new Date(),
    },
    {
      id: "2",
      type: "risk_assessment",
      patientId: "3",
      patientName: "Carlos Oliveira",
      title: "Necessidade de acompanhamento intensivo",
      description:
        "Paciente apresenta risco elevado - recomendação de follow-up semanal",
      confidence: 0.92,
      priority: "critical",
      actionable: true,
      actionLabel: "Agendar follow-up",
      timestamp: new Date(),
    },
    {
      id: "3",
      type: "treatment_recommendation",
      patientId: "2",
      patientName: "Maria Santos",
      title: "Otimização de tratamento",
      description:
        "Baseado no histórico, sugere-se ajuste no protocolo de tratamento",
      confidence: 0.78,
      priority: "medium",
      actionable: true,
      actionLabel: "Revisar protocolo",
      timestamp: new Date(),
    },
  ];

  const mockRealTimeUpdates: RealTimeUpdate[] = [
    {
      type: "new_patient",
      message: "Novo paciente cadastrado: Ana Costa",
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
    },
    {
      type: "appointment_update",
      message: "Consulta confirmada: Roberto Almeida",
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
    },
  ];

  const mockPatients: Patient[] = [
    {
      id: "1",
      name: "João Silva",
      email: "joao.silva@email.com",
      phone: "+55 11 99999-8888",
      status: "Ativo",
      riskScore: 0.3,
      lastVisit: "2024-01-15",
      nextAppointment: {
        date: "2024-02-01",
        time: "14:30",
      },
      healthInsurance: {
        provider: "Unimed",
      },
    },
    {
      id: "2",
      name: "Maria Santos",
      email: "maria.santos@email.com",
      phone: "+55 11 98888-7777",
      status: "Ativo",
      riskScore: 0.7,
      lastVisit: "2024-01-10",
      healthInsurance: {
        provider: "Amil",
      },
    },
    {
      id: "3",
      name: "Carlos Oliveira",
      email: "carlos.oliveira@email.com",
      phone: "+55 11 97777-6666",
      status: "Inativo",
      riskScore: 0.9,
      lastVisit: "2023-12-20",
      healthInsurance: {
        provider: "Bradesco Saúde",
      },
    },
  ];

  const stats = mockStats;
  const patients = mockPatients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handlePatientClick = (patientId: string) => {
    navigate({ to: "/patients/$patientId", params: { patientId } });
  };

  const handleDeletePatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsModalOpen(true);
  };

  const confirmDelete = () => {
    toast({
      title: "Paciente excluído com sucesso",
      description: "O paciente foi removido do sistema.",
    });
    setIsModalOpen(false);
    setSelectedPatient(null);
  };

  const tableColumns = [
    {
      accessorKey: "name",
      header: "Nome",
      cell: (info: any) => <div className="font-medium">{info.getValue()}</div>,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: "phone",
      header: "Telefone",
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (info: any) => <Badge variant="outline">{info.getValue()}</Badge>,
    },
    {
      accessorKey: "riskScore",
      header: "Risco",
      cell: (info: any) => {
        const score = info.getValue();
        let variant: "default" | "destructive" | "outline" = "default";
        let label = "Baixo";

        if (score >= 0.8) {
          variant = "destructive";
          label = "Alto";
        } else if (score >= 0.6) {
          variant = "outline";
          label = "Médio";
        }

        return <Badge variant={variant}>{label}</Badge>;
      },
    },
    {
      accessorKey: "lastVisit",
      header: "Última Consulta",
      cell: (info: any) => {
        const date = info.getValue();
        return date
          ? format(new Date(date), "dd/MM/yyyy", { locale: ptBR })
          : "Nunca";
      },
    },
    {
      id: "actions",
      header: "Ações",
      cell: (info: any) => {
        const patient = info.row.original;
        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePatientClick(patient.id)}
            >
              Ver
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                navigate({
                  to: "/patients/$patientId/edit",
                  params: { patientId: patient.id },
                })
              }
            >
              Editar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeletePatient(patient)}
            >
              Excluir
            </Button>
          </div>
        );
      },
    },
  ];

  const statsCards = [
    {
      title: "Total de Pacientes",
      value: stats.totalPatients,
      change: stats.newThisMonth,
      changeType: "increase" as const,
      description: "Novos este mês",
    },
    {
      title: "Consultas Hoje",
      value: stats.appointmentsToday,
      change: "+12%",
      changeType: "increase" as const,
      description: "Comparado ontem",
    },
    {
      title: "Pacientes de Alto Risco",
      value: stats.highRiskPatients,
      change: "-5%",
      changeType: "decrease" as const,
      description: "Melhoria este mês",
    },
    {
      title: "Taxa de Não Comparecimento",
      value: `${stats.noShowRate.toFixed(1)}%`,
      change: "-2.1%",
      changeType: "decrease" as const,
      description: "Redução este mês",
    },
  ];

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header - Mobile-first responsive */}
      <header className="space-y-4 sm:space-y-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
              Dashboard de Pacientes
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-0">
              Gerencie pacientes, consultas e acompanhamento em tempo real
            </p>
          </div>

          {/* Mobile-optimized button layout */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <UniversalButton
              variant="primary"
              onClick={() => navigate({ to: "/patients/register" })}
              className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 h-11 sm:h-10 text-base sm:text-sm font-medium w-full sm:w-auto"
              aria-label="Cadastrar novo paciente no sistema"
            >
              Novo Paciente
            </UniversalButton>
            <UniversalButton
              variant="outline"
              onClick={() => navigate({ to: "/ai/insights" })}
              className="h-11 sm:h-10 text-base sm:text-sm font-medium w-full sm:w-auto focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Visualizar insights de inteligência artificial"
            >
              Insights de IA
            </UniversalButton>
          </div>
        </div>
      </header>

      {/* Stats Cards - Mobile-optimized grid */}
      <section aria-labelledby="stats-heading" className="space-y-4">
        <h2 id="stats-heading" className="sr-only">
          Estatísticas do dashboard
        </h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat, index) => (
            <Card
              key={stat.title}
              className="transition-shadow hover:shadow-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm sm:text-base font-medium text-gray-900">
                  {stat.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  <span
                    className={`inline-flex items-center font-medium ${
                      stat.changeType === "increase"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                    aria-label={`${
                      stat.changeType === "increase" ? "Aumento" : "Diminuição"
                    } de ${stat.change}`}
                  >
                    <span aria-hidden="true">
                      {stat.changeType === "increase" ? "↑" : "↓"}
                    </span>
                    <span className="ml-1">{stat.change}</span>
                  </span>{" "}
                  <span className="text-gray-600">{stat.description}</span>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Search and Patient Management */}
      <section aria-labelledby="patients-heading">
        <Card>
          <CardHeader>
            <CardTitle
              id="patients-heading"
              className="text-lg sm:text-xl font-semibold text-gray-900"
            >
              Pacientes
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Busque e gerencie todos os pacientes cadastrados no sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Mobile-optimized search */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="relative flex-1 sm:max-w-sm">
                <label htmlFor="patient-search" className="sr-only">
                  Buscar pacientes por nome, email ou CPF
                </label>
                <Input
                  id="patient-search"
                  type="search"
                  placeholder="Buscar por nome, email ou CPF..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-11 sm:h-10 text-base sm:text-sm pl-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  aria-describedby="search-help"
                />
                <div id="search-help" className="sr-only">
                  Digite pelo menos 2 caracteres para buscar pacientes
                </div>
              </div>

              {/* Results count for screen readers */}
              <div className="sr-only" aria-live="polite">
                {patients.length > 0
                  ? `${patients.length} paciente${patients.length !== 1 ? "s" : ""} encontrado${
                      patients.length !== 1 ? "s" : ""
                    }`
                  : "Nenhum paciente encontrado"}
              </div>
            </div>

            <div className="overflow-x-auto">
              <EnhancedTable
                columns={tableColumns}
                data={patients}
                searchable={false}
                pagination={true}
                itemsPerPage={10}
                className="min-w-full"
                aria-label="Lista de pacientes"
              />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Quick Actions - Mobile-first accessibility */}
      <section aria-labelledby="quick-actions-heading">
        <h2 id="quick-actions-heading" className="sr-only">
          Ações rápidas
        </h2>
        <FocusCards
          cards={[
            {
              title: "Novo Paciente",
              description: "Cadastre um novo paciente no sistema",
              action: () => navigate({ to: "/patients/register" }),
              icon: "👥",
              ariaLabel: "Ir para página de cadastro de novo paciente",
            },
            {
              title: "Agendar Consulta",
              description: "Agende uma nova consulta para um paciente",
              action: () => navigate({ to: "/appointments/new" }),
              icon: "📅",
              ariaLabel: "Ir para página de agendamento de consulta",
            },
            {
              title: "AI Insights",
              description: "Visualize insights e previsões de IA",
              action: () => navigate({ to: "/ai/insights" }),
              icon: "🤖",
              ariaLabel:
                "Ir para página de insights de inteligência artificial",
            },
            {
              title: "Relatórios",
              description: "Gere relatórios e análises",
              action: () => navigate({ to: "/reports" }),
              icon: "📊",
              ariaLabel: "Ir para página de relatórios e análises",
            },
          ]}
          className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        />
      </section>

      {/* Delete Confirmation Modal */}
      <AnimatedModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPatient(null);
        }}
        title="Confirmar Exclusão"
        description={`Tem certeza que deseja excluir o paciente "${selectedPatient?.name}"? Esta ação não pode ser desfeita.`}
      >
        <div className="flex justify-end gap-3 mt-6">
          <UniversalButton
            variant="outline"
            onClick={() => {
              setIsModalOpen(false);
              setSelectedPatient(null);
            }}
          >
            Cancelar
          </UniversalButton>
          <UniversalButton variant="destructive" onClick={confirmDelete}>
            Excluir Paciente
          </UniversalButton>
        </div>
      </AnimatedModal>
    </div>
  );
}

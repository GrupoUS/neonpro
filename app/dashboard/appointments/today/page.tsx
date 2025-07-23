import { createClient } from "@/app/utils/supabase/server";
import { DashboardLayout } from "@/components/navigation/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Calendar,
  Clock,
  User,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  CalendarPlus,
} from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function TodayAppointmentsPage() {
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

  // Mock data para demonstração
  const todayAppointments = [
    {
      id: 1,
      time: "09:00",
      patient: "João Silva",
      phone: "(11) 99999-9999",
      type: "Consulta",
      status: "Confirmado",
      duration: "30min",
      room: "Sala 1",
      reason: "Consulta de rotina",
    },
    {
      id: 2,
      time: "10:30",
      patient: "Maria Santos",
      phone: "(11) 88888-8888",
      type: "Retorno",
      status: "Concluído",
      duration: "20min",
      room: "Sala 2",
      reason: "Acompanhamento pós-cirúrgico",
    },
    {
      id: 3,
      time: "14:00",
      patient: "Pedro Costa",
      phone: "(11) 77777-7777",
      type: "Consulta",
      status: "Pendente",
      duration: "45min",
      room: "Sala 1",
      reason: "Dor nas costas",
    },
    {
      id: 4,
      time: "15:30",
      patient: "Ana Silva",
      phone: "(11) 66666-6666",
      type: "Exame",
      status: "Confirmado",
      duration: "60min",
      room: "Sala 3",
      reason: "Exame cardiológico",
    },
    {
      id: 5,
      time: "16:30",
      patient: "Carlos Santos",
      phone: "(11) 55555-5555",
      type: "Consulta",
      status: "Atrasado",
      duration: "30min",
      room: "Sala 2",
      reason: "Consulta de emergência",
    },
  ];

  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Agendamentos", href: "/dashboard/appointments" },
    { title: "Consultas do Dia" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmado":
        return "default";
      case "Concluído":
        return "secondary";
      case "Pendente":
        return "outline";
      case "Atrasado":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Confirmado":
        return <CheckCircle className="h-4 w-4" />;
      case "Concluído":
        return <CheckCircle className="h-4 w-4" />;
      case "Pendente":
        return <AlertCircle className="h-4 w-4" />;
      case "Atrasado":
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <DashboardLayout user={user} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Consultas do Dia</h2>
            <p className="text-muted-foreground">
              {new Date().toLocaleDateString("pt-BR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <Link href="/dashboard/appointments/new">
            <Button>
              <CalendarPlus className="mr-2 h-4 w-4" />
              Nova Consulta
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">Consultas hoje</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmadas</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">2</div>
              <p className="text-xs text-muted-foreground">Prontas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">1</div>
              <p className="text-xs text-muted-foreground">Finalizadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">1</div>
              <p className="text-xs text-muted-foreground">Aguardando</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Atrasadas</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">1</div>
              <p className="text-xs text-muted-foreground">Requer atenção</p>
            </CardContent>
          </Card>
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {todayAppointments.map((appointment) => (
            <Card key={appointment.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{appointment.time}</div>
                      <div className="text-sm text-muted-foreground">
                        {appointment.duration}
                      </div>
                    </div>
                    
                    <div className="h-12 w-px bg-border" />
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{appointment.patient}</span>
                        <Badge variant="outline">{appointment.type}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {appointment.phone}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {appointment.reason}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">{appointment.room}</div>
                      <div className="flex items-center gap-1 mt-1">
                        {getStatusIcon(appointment.status)}
                        <Badge variant={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {appointment.status === "Pendente" && (
                        <Button size="sm" variant="outline">
                          Confirmar
                        </Button>
                      )}
                      {appointment.status === "Confirmado" && (
                        <Button size="sm">
                          Iniciar Consulta
                        </Button>
                      )}
                      {appointment.status === "Atrasado" && (
                        <Button size="sm" variant="destructive">
                          Reagendar
                        </Button>
                      )}
                      <Button size="sm" variant="ghost">
                        Detalhes
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Gerencie rapidamente as consultas do dia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <Button variant="outline" className="h-16 flex-col gap-2">
                <CheckCircle className="h-5 w-5" />
                <span>Confirmar Todas</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col gap-2">
                <Phone className="h-5 w-5" />
                <span>Ligar para Pacientes</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col gap-2">
                <Clock className="h-5 w-5" />
                <span>Reagendar</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col gap-2">
                <Calendar className="h-5 w-5" />
                <span>Ver Semana</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
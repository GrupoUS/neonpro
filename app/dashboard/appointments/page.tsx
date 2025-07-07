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
import { Calendar } from "@/components/ui/calendar";
import {
  CalendarPlus,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  Calendar as CalendarIcon,
} from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AppointmentsPage() {
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
      type: "Consulta",
      status: "Confirmado",
      duration: "30min",
    },
    {
      id: 2,
      time: "10:30",
      patient: "Maria Santos",
      type: "Retorno",
      status: "Concluído",
      duration: "20min",
    },
    {
      id: 3,
      time: "14:00",
      patient: "Pedro Costa",
      type: "Consulta",
      status: "Pendente",
      duration: "45min",
    },
    {
      id: 4,
      time: "15:30",
      patient: "Ana Silva",
      type: "Exame",
      status: "Confirmado",
      duration: "60min",
    },
  ];

  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Agendamentos" },
  ];

  return (
    <DashboardLayout user={user} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Agendamentos</h2>
            <p className="text-muted-foreground">
              Gerencie sua agenda e consultas
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/appointments/today">
              <Button variant="outline">
                <CalendarIcon className="mr-2 h-4 w-4" />
                Hoje
              </Button>
            </Link>
            <Link href="/dashboard/appointments/new">
              <Button>
                <CalendarPlus className="mr-2 h-4 w-4" />
                Nova Consulta
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Consultas Hoje
              </CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                7 concluídas, 5 pendentes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Esta Semana
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">68</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12%</span> vs semana anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Taxa de Ocupação
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">87%</div>
              <p className="text-xs text-muted-foreground">
                Horários preenchidos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Próxima Consulta
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">30min</div>
              <p className="text-xs text-muted-foreground">
                João Silva - 14:00
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Calendar */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Calendário</CardTitle>
              <CardDescription>
                Visualize e gerencie seus agendamentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          {/* Today's Appointments */}
          <Card>
            <CardHeader>
              <CardTitle>Agendamentos de Hoje</CardTitle>
              <CardDescription>
                Suas consultas programadas para hoje
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todayAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {appointment.time}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {appointment.type}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium">
                        {appointment.patient}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {appointment.duration}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          appointment.status === "Confirmado"
                            ? "default"
                            : appointment.status === "Concluído"
                            ? "secondary"
                            : "outline"
                        }
                        className="text-xs"
                      >
                        {appointment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Acesso rápido às funcionalidades de agendamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <Link href="/dashboard/appointments/new">
                <Button variant="outline" className="h-20 flex-col gap-2 w-full">
                  <CalendarPlus className="h-6 w-6" />
                  <span>Nova Consulta</span>
                </Button>
              </Link>
              <Link href="/dashboard/appointments/today">
                <Button variant="outline" className="h-20 flex-col gap-2 w-full">
                  <CalendarIcon className="h-6 w-6" />
                  <span>Consultas Hoje</span>
                </Button>
              </Link>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <CheckCircle className="h-6 w-6" />
                <span>Confirmar Consultas</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Clock className="h-6 w-6" />
                <span>Reagendar</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
"use client";

import { useAppointments } from "@/hooks/useAppointments";
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@neonpro/ui";
// AppointmentCalendar component not available - will create mock
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Clock, LoaderCircle, Plus, User } from "lucide-react";
import { useState } from "react";

export default function AgendaPage() {
  const {
    appointments,
    upcomingAppointments,
    todaysAppointments,
    appointmentsByDate,
    loading,
    error,
    refreshAppointments,
  } = useAppointments();

  const [selectedDate, setSelectedDate] = useState(new Date());

  // Transform appointments data for the calendar component
  const calendarAppointments = appointments.map(appointment => ({
    id: appointment.id,
    patientId: appointment.patient_id,
    patientName: appointment.patients?.name || "Nome não disponível",
    patientAvatar: "", // Could be added from patient data
    appointmentDate: new Date(appointment.appointment_date),
    duration: appointment.services?.duration || 60,
    type: appointment.services?.name || "Consulta",
    status: appointment.status as "scheduled" | "confirmed" | "cancelled" | "completed",
    notes: appointment.notes || "",
    staffMember: appointment.staff_members?.name || "Profissional não definido",
  }));

  const selectedDateAppointments = appointmentsByDate(selectedDate);

  if (loading) {
    return (
      <div className="container max-w-7xl mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-lg">Carregando agenda...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Agenda</h1>
          <p className="text-muted-foreground">
            Gerenciamento completo de agendamentos e consultas
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            <strong>Erro ao carregar agenda:</strong> {error.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaysAppointments.length}</div>
            <p className="text-xs text-muted-foreground">
              agendamentos para hoje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximos 30 dias</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
            <p className="text-xs text-muted-foreground">
              agendamentos futuros
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointments.length}</div>
            <p className="text-xs text-muted-foreground">
              agendamentos no sistema
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar">Calendário</TabsTrigger>
          <TabsTrigger value="list">Lista</TabsTrigger>
          <TabsTrigger value="today">Hoje</TabsTrigger>
        </TabsList>

        {/* Calendar View */}
        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Calendário de Agendamentos</CardTitle>
              <CardDescription>
                Visualização mensal dos agendamentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* AppointmentCalendar component will be implemented in future version */}
              <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
                <div className="text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Calendário de agendamentos será implementado em versão futura
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected Date Details */}
          {selectedDateAppointments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Agendamentos para {format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedDateAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {format(new Date(appointment.appointment_date), "HH:mm")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {appointment.patients?.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={appointment.status === "scheduled" ? "default" : "secondary"}
                        >
                          {appointment.status}
                        </Badge>
                        <p className="text-sm text-muted-foreground">
                          {appointment.services?.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* List View */}
        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Todos os Agendamentos</CardTitle>
              <CardDescription>
                Lista completa de agendamentos ordenados por data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <p className="text-sm font-medium">
                          {format(new Date(appointment.appointment_date), "dd/MM")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(appointment.appointment_date), "HH:mm")}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">{appointment.patients?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.services?.name} - {appointment.staff_members?.name}
                        </p>
                      </div>
                    </div>
                    <Badge variant={appointment.status === "scheduled" ? "default" : "secondary"}>
                      {appointment.status}
                    </Badge>
                  </div>
                ))}
                {appointments.length === 0 && (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium">Nenhum agendamento encontrado</p>
                    <p className="text-muted-foreground">
                      Crie seu primeiro agendamento para começar
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Today's Appointments */}
        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agendamentos de Hoje</CardTitle>
              <CardDescription>
                {format(new Date(), "dd/MM/yyyy", { locale: ptBR })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todaysAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 border-l-4 border-l-primary bg-primary/5 rounded-r-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <p className="text-lg font-bold text-primary">
                          {format(new Date(appointment.appointment_date), "HH:mm")}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">{appointment.patients?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.services?.name} - {appointment.staff_members?.name}
                        </p>
                      </div>
                    </div>
                    <Badge variant={appointment.status === "confirmed" ? "default" : "secondary"}>
                      {appointment.status}
                    </Badge>
                  </div>
                ))}
                {todaysAppointments.length === 0 && (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium">Nenhum agendamento para hoje</p>
                    <p className="text-muted-foreground">
                      Aproveite o dia livre ou agende novas consultas
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

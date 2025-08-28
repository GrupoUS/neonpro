/**
 * 📅 Appointments Calendar - NeonPro Healthcare
 * ===========================================
 *
 * Calendar view for appointments with scheduling
 * and healthcare-specific features.
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, User } from "lucide-react";

export function AppointmentsCalendar() {
  // Mock appointments data
  const appointments = [
    {
      id: "1",
      patient: "Ana Silva",
      service: "Limpeza de Pele",
      professional: "Dr. Maria Santos",
      time: "09:00",
      duration: 60,
      status: "confirmed",
      room: "Sala 1",
    },
    {
      id: "2",
      patient: "Carlos Oliveira",
      service: "Botox",
      professional: "Dr. João Costa",
      time: "10:30",
      duration: 45,
      status: "pending",
      room: "Sala 2",
    },
    {
      id: "3",
      patient: "Fernanda Lima",
      service: "Preenchimento",
      professional: "Dr. Maria Santos",
      time: "14:00",
      duration: 90,
      status: "confirmed",
      room: "Sala 1",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed": {
        return (
          <Badge className="bg-green-100 text-green-800">Confirmada</Badge>
        );
      }
      case "pending": {
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>
        );
      }
      case "completed": {
        return <Badge className="bg-blue-100 text-blue-800">Concluída</Badge>;
      }
      case "cancelled": {
        return <Badge variant="destructive">Cancelada</Badge>;
      }
      default: {
        return <Badge variant="outline">{status}</Badge>;
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl">Agenda</h1>
          <p className="text-muted-foreground">
            Gerencie suas consultas e horários
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Hoje
          </Button>
          <Button>Agendar Consulta</Button>
        </div>
      </div>

      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              {new Date().toLocaleDateString("pt-BR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            <Badge variant="outline">
              {appointments.length} consultas hoje
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Appointments Timeline */}
      <div className="grid grid-cols-1 gap-4">
        {appointments.map((appointment, index) => (
          <Card
            className="transition-shadow hover:shadow-md"
            key={appointment.id}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="flex flex-col items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 font-semibold text-white">
                      <Clock className="h-6 w-6" />
                    </div>
                    <span className="mt-2 font-medium text-sm">
                      {appointment.time}
                    </span>
                    {index < appointments.length - 1 && (
                      <div className="mt-2 h-8 w-0.5 bg-border" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {appointment.service}
                        </h3>
                        <div className="mt-1 flex items-center space-x-4 text-muted-foreground text-sm">
                          <div className="flex items-center">
                            <User className="mr-1 h-4 w-4" />
                            {appointment.patient}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="mr-1 h-4 w-4" />
                            {appointment.room}
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(appointment.status)}
                    </div>

                    <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                      <div>
                        <p className="font-medium">Profissional</p>
                        <p className="text-muted-foreground">
                          {appointment.professional}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Duração</p>
                        <p className="text-muted-foreground">
                          {appointment.duration} minutos
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Horário</p>
                        <p className="text-muted-foreground">
                          {appointment.time} -{" "}
                          {new Date(
                            new Date(
                              `2024-01-01 ${appointment.time}`,
                            ).getTime() +
                              appointment.duration * 60_000,
                          ).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        Ver Detalhes
                      </Button>
                      <Button size="sm" variant="outline">
                        Reagendar
                      </Button>
                      {appointment.status === "pending" && (
                        <Button size="sm">Confirmar</Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {appointments.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Calendar className="mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 font-semibold text-lg">
              Nenhuma consulta hoje
            </h3>
            <p className="mb-6 text-center text-muted-foreground">
              Você não tem consultas agendadas para hoje.
            </p>
            <Button>Agendar Nova Consulta</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

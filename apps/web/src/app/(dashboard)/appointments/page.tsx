"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, Filter, Plus, Search, User } from "lucide-react";
import Link from "next/link";

const appointments = [
  {
    id: "1",
    patient: "Maria Silva",
    service: "Limpeza de Pele",
    date: "2024-01-15",
    time: "09:00",
    duration: "60 min",
    status: "confirmado",
    professional: "Dr. Ana Santos",
  },
  {
    id: "2",
    patient: "João Santos",
    service: "Massagem Relaxante",
    date: "2024-01-15",
    time: "10:30",
    duration: "90 min",
    status: "pendente",
    professional: "Terapeuta Carlos",
  },
  {
    id: "3",
    patient: "Ana Costa",
    service: "Tratamento Facial",
    date: "2024-01-15",
    time: "14:00",
    duration: "120 min",
    status: "confirmado",
    professional: "Dra. Mariana",
  },
  {
    id: "4",
    patient: "Pedro Oliveira",
    service: "Consulta Dermatológica",
    date: "2024-01-15",
    time: "15:30",
    duration: "45 min",
    status: "cancelado",
    professional: "Dr. Roberto",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "confirmado":
      return "bg-green-100 text-green-800";
    case "pendente":
      return "bg-yellow-100 text-yellow-800";
    case "cancelado":
      return "bg-red-100 text-red-800";
    case "concluido":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function AppointmentsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agendamentos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie todos os agendamentos da sua clínica
          </p>
        </div>
        <Button asChild>
          <Link href="/appointments/new">
            <Plus className="h-4 w-4 mr-2" />
            Novo Agendamento
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-md p-3">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Hoje</p>
                <p className="text-lg font-medium text-gray-900">4</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-md p-3">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Confirmados</p>
                <p className="text-lg font-medium text-gray-900">2</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 rounded-md p-3">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Pendentes</p>
                <p className="text-lg font-medium text-gray-900">1</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-red-100 rounded-md p-3">
                <Clock className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Cancelados</p>
                <p className="text-lg font-medium text-gray-900">1</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar agendamentos..."
                className="pl-10"
              />
            </div>
            <Input type="date" className="w-auto" />
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <Card>
        <CardHeader>
          <CardTitle>Agendamentos de Hoje</CardTitle>
          <CardDescription>
            {appointments.length} agendamentos encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {appointment.patient}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {appointment.service}
                    </p>
                    <p className="text-xs text-gray-400">
                      com {appointment.professional}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">
                      {appointment.time}
                    </p>
                    <p className="text-xs text-gray-500">
                      {appointment.duration}
                    </p>
                  </div>

                  <Badge className={getStatusColor(appointment.status)}>
                    {appointment.status}
                  </Badge>

                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/appointments/${appointment.id}`}>
                        Ver
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/appointments/${appointment.id}/edit`}>
                        Editar
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

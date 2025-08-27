"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, AlertTriangle, Calendar, Plus, TrendingUp, Users } from "lucide-react";
import Link from "next/link";

const stats = [
  {
    name: "Agendamentos Hoje",
    value: "12",
    icon: Calendar,
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  {
    name: "Pacientes Ativos",
    value: "284",
    icon: Users,
    color: "text-green-600",
    bg: "bg-green-100",
  },
  {
    name: "Taxa de Comparecimento",
    value: "89%",
    icon: TrendingUp,
    color: "text-purple-600",
    bg: "bg-purple-100",
  },
  {
    name: "Alertas Pendentes",
    value: "3",
    icon: AlertTriangle,
    color: "text-red-600",
    bg: "bg-red-100",
  },
];

const recentAppointments = [
  {
    id: "1",
    patient: "Maria Silva",
    time: "09:00",
    service: "Limpeza de Pele",
    status: "confirmado",
  },
  {
    id: "2",
    patient: "João Santos",
    time: "10:30",
    service: "Massagem Relaxante",
    status: "pendente",
  },
  {
    id: "3",
    patient: "Ana Costa",
    time: "14:00",
    service: "Tratamento Facial",
    status: "confirmado",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Bem-vindo ao NeonPro! Aqui está um resumo da sua clínica hoje.
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/appointments/new">
              <Plus className="h-4 w-4 mr-2" />
              Novo Agendamento
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className={`${stat.bg} rounded-md p-3`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recent Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Agendamentos de Hoje
            </CardTitle>
            <CardDescription>
              Últimos agendamentos para hoje
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {appointment.patient}
                    </p>
                    <p className="text-sm text-gray-500">
                      {appointment.time} - {appointment.service}
                    </p>
                  </div>
                  <div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        appointment.status === "confirmado"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {appointment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Button variant="outline" asChild className="w-full">
                <Link href="/appointments">
                  Ver todos os agendamentos
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Ações Rápidas
            </CardTitle>
            <CardDescription>
              Ações mais utilizadas na clínica
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/patients/new">
                  <Users className="h-4 w-4 mr-2" />
                  Cadastrar Novo Paciente
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/appointments/new">
                  <Calendar className="h-4 w-4 mr-2" />
                  Agendar Consulta
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/compliance">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Verificar Compliance
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

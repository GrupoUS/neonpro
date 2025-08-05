"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Chart } from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Activity, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  Plus,
  Eye,
  FileText,
  Settings
} from "lucide-react";

interface DashboardStats {
  totalPatients: number;
  appointmentsToday: number;
  monthlyRevenue: number;
  activeConsultations: number;
  pendingResults: number;
  cancellationRate: number;
}

interface Appointment {
  id: string;
  patientName: string;
  time: string;
  type: string;
  status: "confirmed" | "pending" | "completed" | "cancelled";
  avatar?: string;
}

interface RevenueData {
  month: string;
  revenue: number;
  appointments: number;
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    appointmentsToday: 0,
    monthlyRevenue: 0,
    activeConsultations: 0,
    pendingResults: 0,
    cancellationRate: 0
  });

  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);

  useEffect(() => {
    // Simulate data loading
    const loadDashboardData = async () => {
      setIsLoading(true);
      
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setStats({
        totalPatients: 1247,
        appointmentsToday: 12,
        monthlyRevenue: 85420,
        activeConsultations: 3,
        pendingResults: 8,
        cancellationRate: 2.3
      });

      setTodayAppointments([
        {
          id: "1",
          patientName: "Ana Silva Santos",
          time: "09:00",
          type: "Consulta Geral",
          status: "confirmed",
          avatar: "/placeholder-avatar.jpg"
        },
        {
          id: "2", 
          patientName: "Carlos Rodrigues",
          time: "10:30",
          type: "Retorno",
          status: "completed",
          avatar: "/placeholder-avatar.jpg"
        },
        {
          id: "3",
          patientName: "Maria Oliveira",
          time: "14:00",
          type: "Exames",
          status: "pending",
          avatar: "/placeholder-avatar.jpg"
        },
        {
          id: "4",
          patientName: "João Ferreira",
          time: "15:30",
          type: "Consulta Especializada",
          status: "confirmed",
          avatar: "/placeholder-avatar.jpg"
        }
      ]);

      setRevenueData([
        { month: "Jan", revenue: 72500, appointments: 156 },
        { month: "Fev", revenue: 68900, appointments: 142 },
        { month: "Mar", revenue: 79200, appointments: 168 },
        { month: "Abr", revenue: 83100, appointments: 174 },
        { month: "Mai", revenue: 85420, appointments: 181 }
      ]);

      setIsLoading(false);
    };

    loadDashboardData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800 border-green-200";
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed": return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed": return "Confirmado";
      case "pending": return "Pendente";
      case "completed": return "Concluído";
      case "cancelled": return "Cancelado";
      default: return "Desconhecido";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <LoadingSpinner className="w-8 h-8 mx-auto" />
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }  return (
    <main className="flex-1 space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col space-y-2 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Dashboard NEONPRO
          </h1>
          <p className="text-muted-foreground">
            Visão geral da sua clínica médica
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Relatórios
          </Button>
          <Button size="sm" className="bg-neon-500 hover:bg-neon-600">
            <Plus className="w-4 h-4 mr-2" />
            Nova Consulta
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-neon-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pacientes</CardTitle>
            <Users className="h-4 w-4 text-neon-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPatients.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              +12% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultas Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.appointmentsToday}</div>
            <p className="text-xs text-muted-foreground">
              <Clock className="w-3 h-3 inline mr-1" />
              {stats.activeConsultations} consultas em andamento
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {stats.monthlyRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              +8.2% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Cancelamento</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cancellationRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingResults} resultados pendentes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's Appointments */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-neon-500" />
              Consultas de Hoje
            </CardTitle>
            <CardDescription>
              Agenda do dia - {new Date().toLocaleDateString('pt-BR')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {todayAppointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma consulta agendada para hoje</p>
              </div>
            ) : (
              todayAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={appointment.avatar} />
                      <AvatarFallback>
                        {appointment.patientName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{appointment.patientName}</p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.time} • {appointment.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant="outline" 
                      className={getStatusColor(appointment.status)}
                    >
                      {getStatusText(appointment.status)}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>        {/* Quick Actions & Analytics */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ações Rápidas</CardTitle>
              <CardDescription>
                Acesso rápido às principais funcionalidades
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Agendar Consulta
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Gerenciar Pacientes
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Relatórios Financeiros
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Activity className="w-4 h-4 mr-2" />
                Histórico Médico
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </Button>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Métricas de Performance</CardTitle>
              <CardDescription>
                Indicadores de performance da clínica
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Taxa de Ocupação</span>
                  <span className="font-medium">87%</span>
                </div>
                <Progress value={87} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Satisfação do Paciente</span>
                  <span className="font-medium">94%</span>
                </div>
                <Progress value={94} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Tempo Médio de Espera</span>
                  <span className="font-medium">12 min</span>
                </div>
                <Progress value={78} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Eficiência Operacional</span>
                  <span className="font-medium">91%</span>
                </div>
                <Progress value={91} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Revenue Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-neon-500" />
            Análise de Receita
          </CardTitle>
          <CardDescription>
            Evolução da receita e número de consultas nos últimos meses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="revenue" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="revenue">Receita</TabsTrigger>
              <TabsTrigger value="appointments">Consultas</TabsTrigger>
            </TabsList>
            
            <TabsContent value="revenue" className="space-y-4">
              <div className="h-[300px] mt-4">
                {/* Placeholder for revenue chart */}
                <div className="w-full h-full bg-gradient-to-br from-neon-50 to-blue-50 rounded-lg flex items-center justify-center border-2 border-dashed border-neon-200">
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 mx-auto mb-4 text-neon-500" />
                    <p className="text-lg font-medium text-neon-700">Gráfico de Receita</p>
                    <p className="text-sm text-muted-foreground">
                      R$ {stats.monthlyRevenue.toLocaleString()} este mês
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="appointments" className="space-y-4">
              <div className="h-[300px] mt-4">
                {/* Placeholder for appointments chart */}
                <div className="w-full h-full bg-gradient-to-br from-blue-50 to-green-50 rounded-lg flex items-center justify-center border-2 border-dashed border-blue-200">
                  <div className="text-center">
                    <Activity className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                    <p className="text-lg font-medium text-blue-700">Gráfico de Consultas</p>
                    <p className="text-sm text-muted-foreground">
                      181 consultas este mês
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
}
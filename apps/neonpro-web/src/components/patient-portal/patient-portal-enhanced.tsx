/**
 * NeonPro - Patient Portal Enhanced (FASE 2)
 * Portal do paciente otimizado para experiência holística
 *
 * Melhorias Fase 2:
 * - Interface acolhedora focada na persona Ana Costa
 * - Redução de ansiedade através de transparência
 * - Acompanhamento visual do progresso do tratamento
 * - Comunicação clara e educativa
 * - Agendamento simplificado com 3 cliques
 * - Integração com wellness intelligence
 */

"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  Clock,
  Heart,
  Star,
  CheckCircle2,
  AlertCircle,
  Phone,
  MessageCircle,
  Camera,
  TrendingUp,
  Award,
  Smile,
  BookOpen,
  Bell,
  Settings,
  User,
  Shield,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAccessibility } from "@/contexts/accessibility-context";

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  joinDate: string;
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  type: string;
  status: "confirmed" | "pending" | "completed" | "cancelled";
  doctor: string;
  preparation?: string[];
}

interface TreatmentProgress {
  id: string;
  name: string;
  startDate: string;
  progress: number;
  nextSession?: string;
  status: "active" | "completed" | "paused";
  sessions: {
    completed: number;
    total: number;
  };
}

interface WellnessMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: "up" | "down" | "stable";
  icon: React.ComponentType<{ className?: string }>;
}

interface PatientPortalProps {
  patient: Patient;
  className?: string;
}

export function PatientPortalEnhanced({ patient, className }: PatientPortalProps) {
  const { announceToScreenReader } = useAccessibility();
  const [activeTab, setActiveTab] = useState("home");

  // Mock data - em produção viria de APIs
  const nextAppointment: Appointment = {
    id: "1",
    date: "2025-01-30",
    time: "14:30",
    type: "Retorno - Botox",
    status: "confirmed",
    doctor: "Dra. Marina Silva",
    preparation: [
      "Não usar maquiagem no rosto",
      "Evitar anti-inflamatórios 24h antes",
      "Chegar 15 minutos antes do horário",
    ],
  };

  const treatments: TreatmentProgress[] = [
    {
      id: "1",
      name: "Rejuvenescimento Facial",
      startDate: "2024-12-15",
      progress: 65,
      nextSession: "2025-01-30",
      status: "active",
      sessions: { completed: 2, total: 4 },
    },
    {
      id: "2",
      name: "Tratamento Anti-idade",
      startDate: "2024-11-20",
      progress: 100,
      status: "completed",
      sessions: { completed: 3, total: 3 },
    },
  ];

  const wellnessMetrics: WellnessMetric[] = [
    {
      id: "satisfaction",
      name: "Satisfação",
      value: 95,
      unit: "%",
      trend: "up",
      icon: Smile,
    },
    {
      id: "confidence",
      name: "Confiança",
      value: 88,
      unit: "%",
      trend: "up",
      icon: TrendingUp,
    },
    {
      id: "wellbeing",
      name: "Bem-estar",
      value: 92,
      unit: "%",
      trend: "stable",
      icon: Heart,
    },
  ];

  const upcomingAppointments: Appointment[] = [
    nextAppointment,
    {
      id: "2",
      date: "2025-02-15",
      time: "16:00",
      type: "Manutenção",
      status: "pending",
      doctor: "Dra. Marina Silva",
    },
  ];

  // Cálculos derivados
  const daysUntilNext = useMemo(() => {
    if (!nextAppointment) return null;
    const today = new Date();
    const appointmentDate = new Date(nextAppointment.date);
    const diffTime = appointmentDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, [nextAppointment]);

  const completedTreatments = treatments.filter((t) => t.status === "completed").length;
  const activeTreatments = treatments.filter((t) => t.status === "active").length;

  // Anúncios para acessibilidade
  useEffect(() => {
    if (daysUntilNext !== null && daysUntilNext <= 2) {
      announceToScreenReader(
        `Lembrete: Você tem uma consulta em ${daysUntilNext} dia${daysUntilNext > 1 ? "s" : ""}`,
        "polite",
      );
    }
  }, [daysUntilNext, announceToScreenReader]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmada";
      case "pending":
        return "Pendente";
      case "completed":
        return "Concluída";
      case "cancelled":
        return "Cancelada";
      default:
        return status;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return "↗️";
      case "down":
        return "↘️";
      case "stable":
        return "→";
      default:
        return "";
    }
  };

  return (
    <div className={cn("max-w-6xl mx-auto space-y-6 p-6", className)}>
      {/* Header acolhedor */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center">
          <Avatar className="h-20 w-20">
            <AvatarImage src={patient.avatar} alt={patient.name} />
            <AvatarFallback className="text-2xl">
              {patient.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Olá, {patient.name.split(" ")[0]}! 👋
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Seja bem-vinda ao seu espaço de bem-estar e beleza
          </p>
        </div>

        {/* Status cards rápidos */}
        <div className="grid gap-4 md:grid-cols-3 max-w-2xl mx-auto">
          <Card className="text-center">
            <CardContent className="pt-4">
              <Calendar className="h-8 w-8 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold">{daysUntilNext || 0}</p>
              <p className="text-sm text-muted-foreground">
                {daysUntilNext === 1 ? "dia" : "dias"} até próxima consulta
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-4">
              <Activity className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <p className="text-2xl font-bold">{activeTreatments}</p>
              <p className="text-sm text-muted-foreground">
                tratamento{activeTreatments !== 1 ? "s" : ""} ativo
                {activeTreatments !== 1 ? "s" : ""}
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-4">
              <Award className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
              <p className="text-2xl font-bold">{completedTreatments}</p>
              <p className="text-sm text-muted-foreground">
                tratamento{completedTreatments !== 1 ? "s" : ""} concluído
                {completedTreatments !== 1 ? "s" : ""}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs principais */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="home">Início</TabsTrigger>
          <TabsTrigger value="appointments">Consultas</TabsTrigger>
          <TabsTrigger value="treatments">Tratamentos</TabsTrigger>
          <TabsTrigger value="wellness">Bem-estar</TabsTrigger>
          <TabsTrigger value="education">Educação</TabsTrigger>
        </TabsList>

        <TabsContent value="home" className="space-y-6">
          {/* Próxima consulta em destaque */}
          {nextAppointment && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center text-primary">
                  <Calendar className="h-5 w-5 mr-2" />
                  Próxima Consulta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className={getStatusColor(nextAppointment.status)}>
                        {getStatusLabel(nextAppointment.status)}
                      </Badge>
                      {daysUntilNext && daysUntilNext <= 2 && (
                        <Badge variant="outline" className="animate-pulse">
                          <Bell className="h-3 w-3 mr-1" />
                          Lembrete
                        </Badge>
                      )}
                    </div>
                    <p className="text-lg font-semibold">{nextAppointment.type}</p>
                    <p className="text-muted-foreground">
                      {new Date(nextAppointment.date).toLocaleDateString("pt-BR")} às{" "}
                      {nextAppointment.time}
                    </p>
                    <p className="text-muted-foreground">com {nextAppointment.doctor}</p>
                  </div>

                  {nextAppointment.preparation && (
                    <div>
                      <h4 className="font-medium mb-2">Preparação:</h4>
                      <ul className="space-y-1">
                        {nextAppointment.preparation.map((item, index) => (
                          <li key={index} className="flex items-start text-sm">
                            <CheckCircle2 className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2 mt-4">
                  <Button size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Reagendar
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Dúvidas
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Progresso dos tratamentos ativos */}
          <div className="grid gap-4 md:grid-cols-2">
            {treatments
              .filter((t) => t.status === "active")
              .map((treatment) => (
                <Card key={treatment.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{treatment.name}</CardTitle>
                    <CardDescription>
                      Sessão {treatment.sessions.completed} de {treatment.sessions.total}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progresso</span>
                          <span>{treatment.progress}%</span>
                        </div>
                        <Progress value={treatment.progress} className="h-2" />
                      </div>

                      {treatment.nextSession && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-1" />
                          Próxima sessão:{" "}
                          {new Date(treatment.nextSession).toLocaleDateString("pt-BR")}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>

          {/* Métricas de bem-estar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="h-5 w-5 mr-2 text-red-500" />
                Seu Bem-estar
              </CardTitle>
              <CardDescription>Acompanhe sua jornada de bem-estar e autoestima</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {wellnessMetrics.map((metric) => {
                  const IconComponent = metric.icon;
                  return (
                    <div key={metric.id} className="text-center">
                      <IconComponent className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <div className="text-2xl font-bold">
                        {metric.value}
                        {metric.unit}
                        <span className="text-lg ml-1">{getTrendIcon(metric.trend)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{metric.name}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Minhas Consultas</CardTitle>
                <Button>
                  <Calendar className="h-4 w-4 mr-2" />
                  Agendar Nova
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <p className="text-lg font-bold">{new Date(appointment.date).getDate()}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(appointment.date).toLocaleDateString("pt-BR", {
                            month: "short",
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">{appointment.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.time} - {appointment.doctor}
                        </p>
                        <Badge className={getStatusColor(appointment.status)} variant="outline">
                          {getStatusLabel(appointment.status)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        Detalhes
                      </Button>
                      {appointment.status === "confirmed" && (
                        <Button variant="outline" size="sm">
                          Reagendar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="treatments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Meus Tratamentos</CardTitle>
              <CardDescription>Acompanhe o progresso de todos os seus tratamentos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {treatments.map((treatment) => (
                  <div key={treatment.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{treatment.name}</h3>
                        <p className="text-muted-foreground">
                          Iniciado em {new Date(treatment.startDate).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <Badge
                        variant={treatment.status === "completed" ? "default" : "secondary"}
                        className={
                          treatment.status === "completed" ? "bg-green-100 text-green-800" : ""
                        }
                      >
                        {treatment.status === "completed"
                          ? "Concluído"
                          : treatment.status === "active"
                            ? "Ativo"
                            : "Pausado"}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Progresso Geral</span>
                          <span>{treatment.progress}%</span>
                        </div>
                        <Progress value={treatment.progress} className="h-3" />
                      </div>

                      <div className="flex justify-between text-sm">
                        <span>Sessões realizadas:</span>
                        <span>
                          {treatment.sessions.completed} de {treatment.sessions.total}
                        </span>
                      </div>

                      {treatment.nextSession && (
                        <div className="flex justify-between text-sm">
                          <span>Próxima sessão:</span>
                          <span>{new Date(treatment.nextSession).toLocaleDateString("pt-BR")}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2 mt-4">
                      <Button variant="outline" size="sm">
                        <Camera className="h-4 w-4 mr-2" />
                        Ver Fotos
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Dúvidas
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wellness" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="h-5 w-5 mr-2 text-red-500" />
                Wellness Intelligence
              </CardTitle>
              <CardDescription>Sua jornada holística de bem-estar e autoestima</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Heart className="h-16 w-16 mx-auto mb-4 text-red-200" />
                <h3 className="text-lg font-semibold mb-2">Em Desenvolvimento</h3>
                <p>Métricas avançadas de bem-estar serão disponibilizadas em breve</p>
                <p className="text-sm mt-2">
                  Incluindo análise de autoestima, satisfação com resultados e qualidade de vida
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="education" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Educação e Cuidados
              </CardTitle>
              <CardDescription>Conteúdo educativo personalizado para você</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-blue-200" />
                <h3 className="text-lg font-semibold mb-2">Conteúdo Personalizado</h3>
                <p>Artigos e dicas baseados no seu perfil e tratamentos</p>
                <p className="text-sm mt-2">
                  Cuidados pré e pós-procedimento, dicas de bem-estar e muito mais
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Botão de ação flutuante para contato rápido */}
      <div className="fixed bottom-6 right-6">
        <Button className="rounded-full h-14 w-14 shadow-lg">
          <MessageCircle className="h-6 w-6" />
          <span className="sr-only">Contatar clínica</span>
        </Button>
      </div>
    </div>
  );
}

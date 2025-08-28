/**
 * Real-time Activity Dashboard
 * FASE 4: Frontend Components - AI-Powered Dashboards
 * Compliance: LGPD/ANVISA/CFM
 */

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Activity,
  AlertCircle,
  Bell,
  Calendar,
  Clock,
  Eye,
  FileText,
  MapPin,
  MessageSquare,
  Shield,
  Stethoscope,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

interface ActivityEvent {
  id: string;
  type:
    | "appointment"
    | "consultation"
    | "prescription"
    | "report"
    | "message"
    | "login"
    | "audit";
  title: string;
  description: string;
  user: {
    name: string;
    role: string;
    avatar?: string;
  };
  timestamp: Date;
  location?: string;
  priority: "low" | "medium" | "high" | "critical";
  metadata?: Record<string, unknown>;
}

interface LiveStats {
  activeUsers: number;
  ongoingConsultations: number;
  pendingApprovals: number;
  systemAlerts: number;
  dailyAppointments: number;
  completedToday: number;
}

export function RealTimeActivityDashboard() {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [liveStats, setLiveStats] = useState<LiveStats | null>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading real-time data
    const loadActivityData = () => {
      const now = new Date();

      const mockActivities: ActivityEvent[] = [
        {
          id: "1",
          type: "consultation",
          title: "Nova Consulta Iniciada",
          description: "Dr. Silva iniciou consulta com Maria Santos",
          user: {
            name: "Dr. Silva",
            role: "Médico Cardiologista",
            avatar: "/avatars/dr-silva.jpg",
          },
          timestamp: new Date(now.getTime() - 2 * 60 * 1000),
          location: "Consultório 3",
          priority: "medium",
          metadata: {
            patientId: "PAT-001",
            appointmentType: "Retorno",
          },
        },
        {
          id: "2",
          type: "prescription",
          title: "Prescrição Digital Emitida",
          description: "Receita médica para João Carlos - Hipertensão",
          user: {
            name: "Dra. Oliveira",
            role: "Médica Clínica Geral",
            avatar: "/avatars/dra-oliveira.jpg",
          },
          timestamp: new Date(now.getTime() - 5 * 60 * 1000),
          priority: "medium",
          metadata: {
            medications: ["Losartana 50mg", "Hidroclorotiazida 25mg"],
            cfmNumber: "CFM-12345",
          },
        },
        {
          id: "3",
          type: "audit",
          title: "Acesso a Dados Sensíveis",
          description: "Enfermeira Ana acessou prontuário - LGPD Log",
          user: {
            name: "Ana Costa",
            role: "Enfermeira",
            avatar: "/avatars/ana-costa.jpg",
          },
          timestamp: new Date(now.getTime() - 8 * 60 * 1000),
          priority: "high",
          metadata: {
            dataType: "prontuario_medico",
            justification: "Preparação para consulta",
            lgpdCompliance: true,
          },
        },
        {
          id: "4",
          type: "appointment",
          title: "Agendamento Confirmado",
          description: "Pedro Lima confirmou consulta para amanhã",
          user: {
            name: "Pedro Lima",
            role: "Paciente",
          },
          timestamp: new Date(now.getTime() - 12 * 60 * 1000),
          priority: "low",
          metadata: {
            appointmentDate: "2024-01-15T10:00:00Z",
            specialty: "Dermatologia",
          },
        },
        {
          id: "5",
          type: "report",
          title: "Relatório ANVISA Gerado",
          description: "Relatório mensal de reações adversas",
          user: {
            name: "Sistema Automático",
            role: "Sistema",
          },
          timestamp: new Date(now.getTime() - 15 * 60 * 1000),
          priority: "critical",
          metadata: {
            reportType: "anvisa_monthly",
            recordCount: 23,
            compliance: "approved",
          },
        },
        {
          id: "6",
          type: "message",
          title: "Mensagem Recebida",
          description: "Paciente enviou mensagem sobre resultados",
          user: {
            name: "Carla Fernandes",
            role: "Paciente",
          },
          timestamp: new Date(now.getTime() - 18 * 60 * 1000),
          priority: "medium",
          metadata: {
            messageType: "resultado_exame",
            encrypted: true,
          },
        },
        {
          id: "7",
          type: "login",
          title: "Login de Usuário",
          description: "Dr. Roberto fez login no sistema",
          user: {
            name: "Dr. Roberto",
            role: "Médico Ortopedista",
          },
          timestamp: new Date(now.getTime() - 25 * 60 * 1000),
          location: "IP: 192.168.1.45",
          priority: "low",
          metadata: {
            deviceType: "desktop",
            location: "São Paulo, SP",
            twoFactorAuth: true,
          },
        },
      ];

      setActivities(mockActivities);
      setLiveStats({
        activeUsers: 12,
        ongoingConsultations: 3,
        pendingApprovals: 5,
        systemAlerts: 1,
        dailyAppointments: 28,
        completedToday: 15,
      });
      setLoading(false);
    };

    loadActivityData();

    // Simulate real-time updates
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newActivity: ActivityEvent = {
          id: Date.now().toString(),
          type: ["appointment", "consultation", "message"][
            Math.floor(Math.random() * 3)
          ] as unknown,
          title: "Nova Atividade",
          description: "Atividade simulada em tempo real",
          user: {
            name: "Usuário Simulado",
            role: "Sistema",
          },
          timestamp: new Date(),
          priority: "medium",
        };

        setActivities((prev) => [newActivity, ...prev.slice(0, 9)]);
      }

      // Update live stats
      setLiveStats((prev) =>
        prev
          ? {
              ...prev,
              activeUsers: Math.floor(10 + Math.random() * 8),
              ongoingConsultations: Math.floor(2 + Math.random() * 4),
            }
          : undefined,
      );
    }, 10_000);

    return () => clearInterval(interval);
  }, []);

  const getActivityIcon = (type: ActivityEvent["type"]) => {
    switch (type) {
      case "appointment": {
        return <Calendar className="h-4 w-4" />;
      }
      case "consultation": {
        return <Stethoscope className="h-4 w-4" />;
      }
      case "prescription": {
        return <FileText className="h-4 w-4" />;
      }
      case "report": {
        return <FileText className="h-4 w-4" />;
      }
      case "message": {
        return <MessageSquare className="h-4 w-4" />;
      }
      case "login": {
        return <UserCheck className="h-4 w-4" />;
      }
      case "audit": {
        return <Shield className="h-4 w-4" />;
      }
      default: {
        return <Activity className="h-4 w-4" />;
      }
    }
  };

  const getActivityColor = (
    type: ActivityEvent["type"],
    priority: ActivityEvent["priority"],
  ) => {
    if (priority === "critical") {
      return "text-red-600 bg-red-50";
    }
    if (priority === "high") {
      return "text-orange-600 bg-orange-50";
    }

    switch (type) {
      case "consultation": {
        return "text-blue-600 bg-blue-50";
      }
      case "prescription": {
        return "text-green-600 bg-green-50";
      }
      case "audit": {
        return "text-purple-600 bg-purple-50";
      }
      case "appointment": {
        return "text-teal-600 bg-teal-50";
      }
      default: {
        return "text-gray-600 bg-gray-50";
      }
    }
  };

  const getPriorityBadge = (priority: ActivityEvent["priority"]) => {
    switch (priority) {
      case "critical": {
        return (
          <Badge variant="destructive" className="text-xs">
            Crítico
          </Badge>
        );
      }
      case "high": {
        return (
          <Badge
            variant="secondary"
            className="text-xs bg-orange-100 text-orange-800"
          >
            Alto
          </Badge>
        );
      }
      case "medium": {
        return (
          <Badge variant="outline" className="text-xs">
            Médio
          </Badge>
        );
      }
      case "low": {
        return (
          <Badge variant="outline" className="text-xs text-gray-500">
            Baixo
          </Badge>
        );
      }
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - timestamp.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 1) {
      return "Agora";
    }
    if (diffInMinutes < 60) {
      return `${diffInMinutes}min atrás`;
    }
    if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h atrás`;
    }
    return timestamp.toLocaleDateString("pt-BR");
  };

  if (loading || !liveStats) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-8 bg-muted rounded w-16" />
                <div className="h-4 bg-muted rounded w-20 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="space-y-6"
      role="main"
      aria-labelledby="activity-heading"
      aria-describedby="activity-description"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Atividade em Tempo Real
          </h2>
          <p className="text-muted-foreground">
            Monitoramento de eventos e atividades do sistema
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
          Ao Vivo
        </Badge>
      </div>

      {/* Live Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="neonpro-card group">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {liveStats.activeUsers}
                </div>
                <div className="text-xs text-muted-foreground">
                  Usuários Ativos
                </div>
              </div>
              <div className="group-hover:neonpro-glow flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 transition-all">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="neonpro-card group">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {liveStats.ongoingConsultations}
                </div>
                <div className="text-xs text-muted-foreground">
                  Consultas Ativas
                </div>
              </div>
              <div className="group-hover:neonpro-glow flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 transition-all">
                <Stethoscope className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="neonpro-card group">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {liveStats.pendingApprovals}
                </div>
                <div className="text-xs text-muted-foreground">Aprovações</div>
              </div>
              <div className="group-hover:neonpro-glow flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 transition-all">
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="neonpro-card group">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {liveStats.systemAlerts}
                </div>
                <div className="text-xs text-muted-foreground">
                  Alertas Sistema
                </div>
              </div>
              <div className="group-hover:neonpro-glow flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 transition-all">
                <AlertCircle className="h-4 w-4 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="neonpro-card group">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {liveStats.dailyAppointments}
                </div>
                <div className="text-xs text-muted-foreground">
                  Agendamentos Hoje
                </div>
              </div>
              <div className="group-hover:neonpro-glow flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 transition-all">
                <Calendar className="h-4 w-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="neonpro-card group">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-teal-600">
                  {liveStats.completedToday}
                </div>
                <div className="text-xs text-muted-foreground">Finalizados</div>
              </div>
              <div className="group-hover:neonpro-glow flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 transition-all">
                <TrendingUp className="h-4 w-4 text-teal-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card className="neonpro-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="mr-2 h-5 w-5 text-blue-600" />
            Feed de Atividades
          </CardTitle>
          <CardDescription>
            Eventos e ações em tempo real • Última atualização:{" "}
            {new Date().toLocaleTimeString("pt-BR")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  {/* Icon */}
                  <div
                    className={`p-2 rounded-lg ${getActivityColor(
                      activity.type,
                      activity.priority,
                    )}`}
                  >
                    {getActivityIcon(activity.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-foreground truncate">
                        {activity.title}
                      </h4>
                      <div className="flex items-center space-x-2">
                        {getPriorityBadge(activity.priority)}
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(activity.timestamp)}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mt-1">
                      {activity.description}
                    </p>

                    {/* User Info */}
                    <div className="flex items-center space-x-2 mt-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={activity.user.avatar} />
                        <AvatarFallback className="text-xs">
                          {activity.user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">
                        {activity.user.name} • {activity.user.role}
                      </span>
                      {activity.location && (
                        <>
                          <span className="text-xs text-muted-foreground">
                            •
                          </span>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {activity.location}
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Metadata */}
                    {activity.metadata && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {Object.entries(activity.metadata)
                          .slice(0, 3)
                          .map(([key, value]) => (
                            <Badge
                              key={key}
                              variant="outline"
                              className="text-xs"
                            >
                              {key}: {String(value)}
                            </Badge>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-1">
                    <button className="p-1 text-muted-foreground hover:text-foreground">
                      <Eye className="h-4 w-4" />
                    </button>
                    {activity.type === "audit" && (
                      <button className="p-1 text-muted-foreground hover:text-foreground">
                        <Shield className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="neonpro-card cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-4 text-center">
            <Bell className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-medium">Configurar Notificações</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Personalizar alertas em tempo real
            </p>
          </CardContent>
        </Card>

        <Card className="neonpro-card cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-4 text-center">
            <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-medium">Logs de Auditoria</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Ver histórico completo
            </p>
          </CardContent>
        </Card>

        <Card className="neonpro-card cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-4 text-center">
            <Activity className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-medium">Relatórios Automáticos</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Gerar relatórios periódicos
            </p>
          </CardContent>
        </Card>

        <Card className="neonpro-card cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <h3 className="font-medium">Usuários Online</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Ver atividade detalhada
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

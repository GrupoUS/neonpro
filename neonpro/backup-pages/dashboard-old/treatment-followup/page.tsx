"use client";

// Treatment Follow-up Automation Dashboard
// Epic 7.3: Treatment Follow-up Automation
// Author: VoidBeast Agent

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Brain,
  Calendar,
  CheckCircle,
  Clock,
  Filter,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  Search,
  Target,
  Timer,
  TrendingUp,
  Users,
  XCircle,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

interface DashboardStats {
  totalActiveFollowups: number;
  pendingFollowups: number;
  overdueFollowups: number;
  completionRateToday: number;
  avgSatisfactionScore: number;
  escalationCount: number;
  topPerformingProtocols: { name: string; completion_rate: number }[];
}

interface PatientFollowup {
  id: string;
  patient_id: string;
  protocol_id: string;
  followup_type: string;
  sequence_number: number;
  scheduled_date: string;
  scheduled_time?: string;
  preferred_channel: string;
  status: string;
  patient_responded: boolean;
  response_channel?: string;
  satisfaction_score?: number;
  treatment_compliance_score?: number;
  symptoms_improved?: boolean;
  side_effects_reported?: boolean;
  additional_care_needed?: boolean;
  notes?: string;
  auto_generated: boolean;
  followup_protocols?: { name: string; treatment_type: string };
}

interface FollowupProtocol {
  id: string;
  name: string;
  description?: string;
  treatment_type: string;
  specialty?: string;
  evidence_level: string;
  initial_followup_days: number;
  subsequent_intervals: number[];
  max_followups: number;
  automation_level: number;
  auto_schedule_enabled: boolean;
  auto_reminders_enabled: boolean;
  escalation_enabled: boolean;
  is_active: boolean;
}

interface PerformanceAnalytics {
  analysis_date: string;
  period_type: string;
  total_followups_scheduled: number;
  total_followups_completed: number;
  total_followups_missed: number;
  total_escalations: number;
  completion_rate: number;
  response_rate: number;
  satisfaction_average: number;
  escalation_rate: number;
  sms_success_rate: number;
  whatsapp_success_rate: number;
  email_success_rate: number;
  phone_success_rate: number;
  optimal_time_accuracy: number;
  avg_response_time_minutes: number;
  treatment_improvement_rate: number;
  goal_achievement_rate: number;
  ai_prediction_accuracy: number;
  automation_success_rate: number;
}

export default function TreatmentFollowupDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [followups, setFollowups] = useState<PatientFollowup[]>([]);
  const [protocols, setProtocols] = useState<FollowupProtocol[]>([]);
  const [analytics, setAnalytics] = useState<PerformanceAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("today");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch dashboard stats
      const statsResponse = await fetch("/api/followup/dashboard");
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data);
      }

      // Fetch recent follow-ups
      const followupsResponse = await fetch("/api/followup?limit=50");
      if (followupsResponse.ok) {
        const followupsData = await followupsResponse.json();
        setFollowups(followupsData.data);
      }

      // Fetch protocols
      const protocolsResponse = await fetch(
        "/api/followup/protocols?is_active=true"
      );
      if (protocolsResponse.ok) {
        const protocolsData = await protocolsResponse.json();
        setProtocols(protocolsData.data);
      }

      // Fetch analytics
      const analyticsResponse = await fetch("/api/followup/analytics");
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setAnalytics(analyticsData.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "sent":
        return "bg-yellow-100 text-yellow-800";
      case "missed":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      case "escalated":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "phone":
        return <Phone className="h-4 w-4" />;
      case "email":
        return <Mail className="h-4 w-4" />;
      case "sms":
        return <MessageSquare className="h-4 w-4" />;
      case "whatsapp":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const filteredFollowups = followups.filter((followup) => {
    if (
      searchTerm &&
      !followup.patient_id.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !followup.followup_protocols?.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) &&
      !followup.followup_protocols?.treatment_type
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    if (statusFilter !== "all" && followup.status !== statusFilter)
      return false;
    if (typeFilter !== "all" && followup.followup_type !== typeFilter)
      return false;
    if (dateFilter === "today") {
      const today = new Date().toISOString().split("T")[0];
      return followup.scheduled_date === today;
    }
    if (dateFilter === "overdue") {
      const today = new Date().toISOString().split("T")[0];
      return followup.scheduled_date < today && followup.status === "scheduled";
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Acompanhamento de Tratamentos
          </h1>
          <p className="text-gray-600 mt-2">
            Sistema inteligente de follow-up automatizado com IA
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={fetchDashboardData}>
            <Activity className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Protocolo
          </Button>
        </div>
      </div>

      {/* Quick Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Follow-ups Ativos
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalActiveFollowups}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingFollowups} pendentes hoje
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Taxa de Conclusão
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.completionRateToday.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">Hoje</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Satisfação Média
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.avgSatisfactionScore.toFixed(1)}/10
              </div>
              <p className="text-xs text-muted-foreground">Últimas 24h</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Escalações</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.escalationCount}</div>
              <p className="text-xs text-muted-foreground">
                {stats.overdueFollowups} em atraso
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="followups">Follow-ups</TabsTrigger>
          <TabsTrigger value="protocols">Protocolos</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="ai-optimization">IA & Otimização</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Atividade Recente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredFollowups.slice(0, 5).map((followup) => (
                    <div
                      key={followup.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getChannelIcon(followup.preferred_channel)}
                        <div>
                          <p className="font-medium">
                            {followup.followup_protocols?.name || "Follow-up"}
                          </p>
                          <p className="text-sm text-gray-600">
                            Paciente {followup.patient_id.slice(0, 8)}... •{" "}
                            {followup.scheduled_date}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(followup.status)}>
                        {followup.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Performing Protocols */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Protocolos com Melhor Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.topPerformingProtocols.map((protocol, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{protocol.name}</p>
                        <div className="w-48 bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${protocol.completion_rate}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="font-bold text-blue-600">
                        {protocol.completion_rate.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analytics Overview */}
          {analytics && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Performance Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {analytics.response_rate.toFixed(1)}%
                    </div>
                    <p className="text-sm text-gray-600">Taxa de Resposta</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {analytics.avg_response_time_minutes}min
                    </div>
                    <p className="text-sm text-gray-600">
                      Tempo Médio de Resposta
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {analytics.ai_prediction_accuracy.toFixed(1)}%
                    </div>
                    <p className="text-sm text-gray-600">Precisão da IA</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {analytics.automation_success_rate.toFixed(1)}%
                    </div>
                    <p className="text-sm text-gray-600">
                      Sucesso da Automação
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="followups" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar follow-ups..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="scheduled">Agendado</SelectItem>
                    <SelectItem value="sent">Enviado</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="missed">Perdido</SelectItem>
                    <SelectItem value="escalated">Escalado</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Tipos</SelectItem>
                    <SelectItem value="initial">Inicial</SelectItem>
                    <SelectItem value="routine">Rotina</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                    <SelectItem value="outcome_check">Verificação</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Data" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Datas</SelectItem>
                    <SelectItem value="today">Hoje</SelectItem>
                    <SelectItem value="overdue">Em Atraso</SelectItem>
                    <SelectItem value="week">Esta Semana</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Follow-ups List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Follow-ups ({filteredFollowups.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredFollowups.map((followup) => (
                  <div
                    key={followup.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getChannelIcon(followup.preferred_channel)}
                        <div>
                          <h3 className="font-semibold">
                            {followup.followup_protocols?.name || "Follow-up"}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {followup.followup_protocols?.treatment_type} •
                            Sequência {followup.sequence_number}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(followup.status)}>
                          {followup.status}
                        </Badge>
                        {followup.auto_generated && (
                          <Badge variant="outline">
                            <Zap className="h-3 w-3 mr-1" />
                            Auto
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Paciente</p>
                        <p className="font-medium">
                          {followup.patient_id.slice(0, 8)}...
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Data Agendada</p>
                        <p className="font-medium">
                          {followup.scheduled_date}
                          {followup.scheduled_time &&
                            ` às ${followup.scheduled_time}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Canal Preferido</p>
                        <p className="font-medium capitalize">
                          {followup.preferred_channel}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Respondeu</p>
                        <div className="flex items-center gap-1">
                          {followup.patient_responded ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span className="font-medium">
                            {followup.patient_responded ? "Sim" : "Não"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {followup.satisfaction_score && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Satisfação:
                          </span>
                          <span className="font-bold text-blue-600">
                            {followup.satisfaction_score}/10
                          </span>
                        </div>
                      </div>
                    )}

                    {followup.notes && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm text-gray-600">Observações:</p>
                        <p className="text-sm mt-1">{followup.notes}</p>
                      </div>
                    )}
                  </div>
                ))}

                {filteredFollowups.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum follow-up encontrado com os filtros aplicados.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="protocols" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Protocolos de Follow-up ({protocols.length})
              </CardTitle>
              <CardDescription>
                Gerencie protocolos automatizados para diferentes tipos de
                tratamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {protocols.map((protocol) => (
                  <div
                    key={protocol.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{protocol.name}</h3>
                        <p className="text-sm text-gray-600">
                          {protocol.treatment_type} • Nível de Evidência:{" "}
                          {protocol.evidence_level}
                        </p>
                        {protocol.description && (
                          <p className="text-sm text-gray-500 mt-1">
                            {protocol.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={protocol.is_active ? "default" : "secondary"}
                        >
                          {protocol.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                        {protocol.auto_schedule_enabled && (
                          <Badge variant="outline">
                            <Timer className="h-3 w-3 mr-1" />
                            Auto-Agendamento
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Follow-up Inicial</p>
                        <p className="font-medium">
                          {protocol.initial_followup_days} dias
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Máximo Follow-ups</p>
                        <p className="font-medium">{protocol.max_followups}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Nível de Automação</p>
                        <p className="font-medium">
                          {(protocol.automation_level * 100).toFixed(0)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Especialidade</p>
                        <p className="font-medium">
                          {protocol.specialty || "Geral"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-gray-600 mb-2">
                        Intervalos Subsequentes:
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {protocol.subsequent_intervals.map(
                          (interval, index) => (
                            <Badge key={index} variant="outline">
                              {interval} dias
                            </Badge>
                          )
                        )}
                      </div>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                      <Button variant="outline" size="sm">
                        Ver Regras de Escalação
                      </Button>
                      <Button variant="outline" size="sm">
                        Analytics
                      </Button>
                    </div>
                  </div>
                ))}

                {protocols.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum protocolo encontrado. Crie o primeiro protocolo para
                    começar.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {analytics && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Agendados
                    </CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics.total_followups_scheduled}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {analytics.total_followups_completed} concluídos
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Taxa de Resposta
                    </CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics.response_rate.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Média de {analytics.avg_response_time_minutes}min
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Melhoria no Tratamento
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics.treatment_improvement_rate.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {analytics.goal_achievement_rate.toFixed(1)}% alcançaram
                      metas
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Taxa de Escalação
                    </CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics.escalation_rate.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {analytics.total_escalations} casos escalados
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Performance por Canal de Comunicação
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {analytics.sms_success_rate.toFixed(1)}%
                      </div>
                      <p className="text-sm text-gray-600 flex items-center justify-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        SMS
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {analytics.whatsapp_success_rate.toFixed(1)}%
                      </div>
                      <p className="text-sm text-gray-600 flex items-center justify-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        WhatsApp
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {analytics.email_success_rate.toFixed(1)}%
                      </div>
                      <p className="text-sm text-gray-600 flex items-center justify-center gap-1">
                        <Mail className="h-4 w-4" />
                        Email
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {analytics.phone_success_rate.toFixed(1)}%
                      </div>
                      <p className="text-sm text-gray-600 flex items-center justify-center gap-1">
                        <Phone className="h-4 w-4" />
                        Telefone
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="ai-optimization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Inteligência Artificial & Otimização
              </CardTitle>
              <CardDescription>
                Recursos avançados de IA para otimização de follow-ups e
                personalização
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Timer className="h-5 w-5" />
                    Otimização de Timing
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">
                        Precisão da Predição de Tempo Ótimo
                      </span>
                      <span className="font-bold text-green-600">
                        {analytics?.optimal_time_accuracy.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Tempo Médio de Resposta</span>
                      <span className="font-bold text-blue-600">
                        {analytics?.avg_response_time_minutes}min
                      </span>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Brain className="h-4 w-4 mr-2" />
                      Analisar Padrões de Timing
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Personalização Inteligente
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Precisão da IA</span>
                      <span className="font-bold text-purple-600">
                        {analytics?.ai_prediction_accuracy.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">
                        Taxa de Sucesso da Automação
                      </span>
                      <span className="font-bold text-orange-600">
                        {analytics?.automation_success_rate.toFixed(1)}%
                      </span>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Zap className="h-4 w-4 mr-2" />
                      Gerar Mensagens Personalizadas
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t">
                <h3 className="font-semibold mb-4">
                  Ferramentas de IA Disponíveis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-20 flex-col">
                    <Brain className="h-6 w-6 mb-2" />
                    <span className="text-sm">Análise Preditiva</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Timer className="h-6 w-6 mb-2" />
                    <span className="text-sm">Otimização de Timing</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <MessageSquare className="h-6 w-6 mb-2" />
                    <span className="text-sm">Personalização de Conteúdo</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

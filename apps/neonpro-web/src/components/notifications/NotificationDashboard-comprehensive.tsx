/**
 * NeonPro Notification Management Dashboard
 *
 * Dashboard completo de configuração e monitoramento de notificações
 * para clínicas estéticas com analytics em tempo real e gestão de templates.
 *
 * Features:
 * - Dashboard de configuração de notificações
 * - Visualização de performance em tempo real
 * - Gestão de templates e personalizações
 * - Configuração de escalação e workflows
 * - Análise de efetividade por canal
 * - Real-time metrics e KPIs
 *
 * @author BMad Method - NeonPro Development Team
 * @version 1.0.0
 * @since 2025-01-30
 */

"use client";

import React, { useState, useEffect, useMemo } from "react";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Input } from "@/components/ui/input";
import type { Label } from "@/components/ui/label";
import type { Textarea } from "@/components/ui/textarea";
import type { Switch } from "@/components/ui/switch";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Alert, AlertDescription } from "@/components/ui/alert";
import type { toast } from "sonner";
import type { createClient } from "@/app/utils/supabase/client";
import type { Database } from "@/lib/database.types";
import type {
  Bell,
  Send,
  MessageSquare,
  Mail,
  Smartphone,
  Settings,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  Activity,
  Zap,
  Target,
  MessageCircle,
  Timer,
  Calendar,
  RefreshCw,
  Filter,
  Search,
  Download,
  Upload,
  Share,
  Settings2,
  Sliders,
} from "lucide-react";
import type {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Types e Interfaces
interface NotificationTemplate {
  id: string;
  name: string;
  type: "reminder" | "confirmation" | "escalation" | "marketing";
  channel: "sms" | "email" | "whatsapp" | "push";
  subject?: string;
  content: string;
  variables: string[];
  active: boolean;
  clinicId: string;
  createdAt: string;
  updatedAt: string;
  usageCount?: number;
  successRate?: number;
}

interface NotificationRule {
  id: string;
  name: string;
  triggerType: string;
  conditions: Record<string, any>;
  templateId: string;
  channelPriority: string[];
  maxAttempts: number;
  retryInterval: number;
  active: boolean;
  clinicId: string;
  template?: NotificationTemplate;
}

interface NotificationStats {
  period: "today" | "week" | "month";
  totalSent: number;
  totalDelivered: number;
  totalRead: number;
  totalClicked: number;
  totalReplied: number;
  totalFailed: number;
  deliveryRate: number;
  readRate: number;
  responseRate: number;
  channels: {
    [key: string]: {
      sent: number;
      delivered: number;
      failed: number;
      rate: number;
    };
  };
}

interface PerformanceMetrics {
  date: string;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  responseTime: number;
}

interface ChannelPerformance {
  channel: string;
  sent: number;
  delivered: number;
  failed: number;
  rate: number;
  avgDeliveryTime: number;
  cost: number;
}

interface PatientEngagement {
  patientId: string;
  patientName: string;
  preferredChannel: string;
  responseScore: number;
  totalNotifications: number;
  totalResponses: number;
  lastResponse: string;
  averageResponseTime: number;
}

interface EscalationRule {
  id: string;
  name: string;
  triggerCondition: string;
  targetUserId: string;
  targetUserName?: string;
  delayMinutes: number;
  maxEscalations: number;
  active: boolean;
  clinicId: string;
}

/**
 * Dashboard principal de notificações
 */
export default function NotificationDashboard() {
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [channelPerformance, setChannelPerformance] = useState<ChannelPerformance[]>([]);
  const [patientEngagement, setPatientEngagement] = useState<PatientEngagement[]>([]);
  const [escalationRules, setEscalationRules] = useState<EscalationRule[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<"today" | "week" | "month">("week");
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterChannel, setFilterChannel] = useState<string>("all");
  const [refreshing, setRefreshing] = useState(false);

  const supabase = createClient();

  // Carregamento inicial dos dados
  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod]);

  /**
   * Carrega todos os dados do dashboard
   */
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadTemplates(),
        loadRules(),
        loadStats(),
        loadPerformanceMetrics(),
        loadChannelPerformance(),
        loadPatientEngagement(),
        loadEscalationRules(),
      ]);
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
      toast.error("Erro ao carregar dados do dashboard");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Carrega templates de notificação
   */
  const loadTemplates = async () => {
    const { data, error } = await supabase
      .from("notification_templates")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao carregar templates:", error);
      return;
    }

    // Adiciona estatísticas de uso
    const templatesWithStats = await Promise.all(
      data.map(async (template) => {
        const { count: usageCount } = await supabase
          .from("notification_queue")
          .select("*", { count: "exact", head: true })
          .eq("template_id", template.id);

        const { count: successCount } = await supabase
          .from("notification_queue")
          .select("*", { count: "exact", head: true })
          .eq("template_id", template.id)
          .eq("status", "delivered");

        return {
          ...template,
          usageCount: usageCount || 0,
          successRate: usageCount ? ((successCount || 0) / usageCount) * 100 : 0,
        };
      }),
    );

    setTemplates(templatesWithStats);
  };

  /**
   * Carrega regras de notificação
   */
  const loadRules = async () => {
    const { data, error } = await supabase
      .from("notification_rules")
      .select(`
        *,
        template:notification_templates(*)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao carregar regras:", error);
      return;
    }

    setRules(data);
  };

  /**
   * Carrega estatísticas gerais
   */
  const loadStats = async () => {
    const now = new Date();
    let startDate: Date;

    switch (selectedPeriod) {
      case "today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    const { data, error } = await supabase
      .from("notification_analytics")
      .select("*")
      .gte("date", startDate.toISOString().split("T")[0]);

    if (error) {
      console.error("Erro ao carregar estatísticas:", error);
      return;
    }

    // Agrega dados
    const aggregated = data.reduce(
      (acc, record) => {
        acc.totalSent += record.total_sent;
        acc.totalDelivered += record.total_delivered;
        acc.totalRead += record.total_read;
        acc.totalClicked += record.total_clicked;
        acc.totalReplied += record.total_replied;
        acc.totalFailed += record.total_failed;

        // Agrega por canal
        if (!acc.channels[record.channel]) {
          acc.channels[record.channel] = {
            sent: 0,
            delivered: 0,
            failed: 0,
            rate: 0,
          };
        }
        acc.channels[record.channel].sent += record.total_sent;
        acc.channels[record.channel].delivered += record.total_delivered;
        acc.channels[record.channel].failed += record.total_failed;

        return acc;
      },
      {
        period: selectedPeriod,
        totalSent: 0,
        totalDelivered: 0,
        totalRead: 0,
        totalClicked: 0,
        totalReplied: 0,
        totalFailed: 0,
        deliveryRate: 0,
        readRate: 0,
        responseRate: 0,
        channels: {} as Record<string, any>,
      },
    );

    // Calcula taxas
    aggregated.deliveryRate =
      aggregated.totalSent > 0 ? (aggregated.totalDelivered / aggregated.totalSent) * 100 : 0;
    aggregated.readRate =
      aggregated.totalDelivered > 0 ? (aggregated.totalRead / aggregated.totalDelivered) * 100 : 0;
    aggregated.responseRate =
      aggregated.totalSent > 0 ? (aggregated.totalReplied / aggregated.totalSent) * 100 : 0;

    // Calcula taxas por canal
    Object.keys(aggregated.channels).forEach((channel) => {
      const channelData = aggregated.channels[channel];
      channelData.rate =
        channelData.sent > 0 ? (channelData.delivered / channelData.sent) * 100 : 0;
    });

    setStats(aggregated);
  };

  /**
   * Carrega métricas de performance temporal
   */
  const loadPerformanceMetrics = async () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30); // Últimos 30 dias

    const { data, error } = await supabase
      .from("notification_analytics")
      .select("*")
      .gte("date", startDate.toISOString().split("T")[0])
      .lte("date", endDate.toISOString().split("T")[0])
      .order("date", { ascending: true });

    if (error) {
      console.error("Erro ao carregar métricas de performance:", error);
      return;
    }

    // Agrega por data
    const metricsMap = data.reduce(
      (acc, record) => {
        const date = record.date;
        if (!acc[date]) {
          acc[date] = {
            date,
            sent: 0,
            delivered: 0,
            read: 0,
            failed: 0,
            responseTime: 0,
            count: 0,
          };
        }
        acc[date].sent += record.total_sent;
        acc[date].delivered += record.total_delivered;
        acc[date].read += record.total_read;
        acc[date].failed += record.total_failed;
        if (record.avg_delivery_time_seconds) {
          acc[date].responseTime += record.avg_delivery_time_seconds;
          acc[date].count++;
        }
        return acc;
      },
      {} as Record<string, any>,
    );

    const metricsArray = Object.values(metricsMap).map((metric) => ({
      ...metric,
      responseTime: metric.count > 0 ? metric.responseTime / metric.count : 0,
    }));

    setMetrics(metricsArray);
  };

  /**
   * Carrega performance por canal
   */
  const loadChannelPerformance = async () => {
    const { data, error } = await supabase
      .from("notification_analytics")
      .select("*")
      .gte("date", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);

    if (error) {
      console.error("Erro ao carregar performance por canal:", error);
      return;
    }

    // Agrega por canal
    const channelMap = data.reduce(
      (acc, record) => {
        const channel = record.channel;
        if (!acc[channel]) {
          acc[channel] = {
            channel,
            sent: 0,
            delivered: 0,
            failed: 0,
            rate: 0,
            avgDeliveryTime: 0,
            cost: 0,
            count: 0,
          };
        }
        acc[channel].sent += record.total_sent;
        acc[channel].delivered += record.total_delivered;
        acc[channel].failed += record.total_failed;
        if (record.avg_delivery_time_seconds) {
          acc[channel].avgDeliveryTime += record.avg_delivery_time_seconds;
          acc[channel].count++;
        }
        return acc;
      },
      {} as Record<string, any>,
    );

    const channelArray = Object.values(channelMap).map((channel) => ({
      ...channel,
      rate: channel.sent > 0 ? (channel.delivered / channel.sent) * 100 : 0,
      avgDeliveryTime: channel.count > 0 ? channel.avgDeliveryTime / channel.count : 0,
      cost: calculateChannelCost(channel.channel, channel.sent),
    }));

    setChannelPerformance(channelArray);
  };

  /**
   * Carrega engajamento de pacientes
   */
  const loadPatientEngagement = async () => {
    const { data, error } = await supabase
      .from("patient_notification_preferences")
      .select(`
        *,
        patient:patients(*)
      `)
      .order("response_score", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Erro ao carregar engajamento de pacientes:", error);
      return;
    }

    const engagement = data.map((record) => ({
      patientId: record.patient_id,
      patientName: record.patient?.name || "N/A",
      preferredChannel: record.preferred_channels[0] || "whatsapp",
      responseScore: record.response_score || 0,
      totalNotifications: 0, // Será calculado
      totalResponses: 0, // Será calculado
      lastResponse: record.last_response_at || "Nunca",
      averageResponseTime: 0, // Será calculado
    }));

    setPatientEngagement(engagement);
  };

  /**
   * Carrega regras de escalação
   */
  const loadEscalationRules = async () => {
    const { data, error } = await supabase
      .from("escalation_rules")
      .select(`
        *,
        target_user:auth.users(*)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao carregar regras de escalação:", error);
      return;
    }

    const rules = data.map((rule) => ({
      ...rule,
      targetUserName: rule.target_user?.email || "N/A",
    }));

    setEscalationRules(rules);
  };

  /**
   * Calcula custo estimado por canal
   */
  const calculateChannelCost = (channel: string, sent: number): number => {
    const costs = {
      sms: 0.05, // R$ 0,05 por SMS
      whatsapp: 0.02, // R$ 0,02 por mensagem
      email: 0.001, // R$ 0,001 por email
      push: 0, // Gratuito
    };
    return (costs[channel as keyof typeof costs] || 0) * sent;
  };

  /**
   * Atualiza dados em tempo real
   */
  const refreshData = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
    toast.success("Dados atualizados");
  };

  /**
   * Filtra templates baseado na busca e filtros
   */
  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const matchesSearch =
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesChannel = filterChannel === "all" || template.channel === filterChannel;
      return matchesSearch && matchesChannel;
    });
  }, [templates, searchQuery, filterChannel]);

  /**
   * Cores para gráficos
   */
  const chartColors = {
    primary: "#3b82f6",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
    info: "#6366f1",
    secondary: "#8b5cf6",
  };

  /**
   * Ícones por canal
   */
  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "sms":
        return <Smartphone className="h-4 w-4" />;
      case "email":
        return <Mail className="h-4 w-4" />;
      case "whatsapp":
        return <MessageSquare className="h-4 w-4" />;
      case "push":
        return <Bell className="h-4 w-4" />;
      default:
        return <Send className="h-4 w-4" />;
    }
  };

  /**
   * Badge de status para templates
   */
  const getStatusBadge = (active: boolean) => {
    return <Badge variant={active ? "default" : "secondary"}>{active ? "Ativo" : "Inativo"}</Badge>;
  };

  /**
   * Badge de performance
   */
  const getPerformanceBadge = (rate: number) => {
    if (rate >= 90)
      return (
        <Badge variant="default" className="bg-green-500">
          Excelente
        </Badge>
      );
    if (rate >= 75)
      return (
        <Badge variant="default" className="bg-blue-500">
          Bom
        </Badge>
      );
    if (rate >= 50)
      return (
        <Badge variant="default" className="bg-yellow-500">
          Regular
        </Badge>
      );
    return <Badge variant="destructive">Baixo</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Notificações</h1>
          <p className="text-muted-foreground">Gerencie templates, regras e monitore performance</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={refreshData}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="week">7 dias</SelectItem>
              <SelectItem value="month">30 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPIs */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enviadas</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSent.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total de notificações enviadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Entrega</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.deliveryRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalDelivered.toLocaleString()} entregues
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Leitura</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.readRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalRead.toLocaleString()} lidas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Resposta</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.responseRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalReplied.toLocaleString()} respostas
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs principais */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="rules">Regras</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="patients">Pacientes</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Performance por Canal */}
            <Card>
              <CardHeader>
                <CardTitle>Performance por Canal</CardTitle>
                <CardDescription>Taxa de entrega dos últimos 7 dias</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={channelPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="channel" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="rate" fill={chartColors.primary} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Tendência Temporal */}
            <Card>
              <CardHeader>
                <CardTitle>Tendência de Envios</CardTitle>
                <CardDescription>Últimos 30 dias</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={metrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="sent"
                      stroke={chartColors.primary}
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="delivered"
                      stroke={chartColors.success}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Resumo por Canal */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo por Canal</CardTitle>
              <CardDescription>Performance detalhada de cada canal</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {channelPerformance.map((channel) => (
                  <div
                    key={channel.channel}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getChannelIcon(channel.channel)}
                      <div>
                        <p className="font-medium capitalize">{channel.channel}</p>
                        <p className="text-sm text-muted-foreground">
                          {channel.sent.toLocaleString()} enviadas
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{channel.rate.toFixed(1)}% entrega</p>
                      <p className="text-sm text-muted-foreground">
                        R$ {channel.cost.toFixed(2)} custo
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates */}
        <TabsContent value="templates" className="space-y-4">
          {/* Filtros e Ações */}
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Select value={filterChannel} onValueChange={setFilterChannel}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Canal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="push">Push</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setIsTemplateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Template
            </Button>
          </div>

          {/* Lista de Templates */}
          <div className="grid gap-4">
            {filteredTemplates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {getChannelIcon(template.channel)}
                        {template.name}
                      </CardTitle>
                      <CardDescription>
                        {template.type} • {template.usageCount} usos •{" "}
                        {template.successRate?.toFixed(1)}% sucesso
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(template.active)}
                      {getPerformanceBadge(template.successRate || 0)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {template.subject && (
                      <p className="text-sm">
                        <strong>Assunto:</strong> {template.subject}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {template.content.substring(0, 150)}...
                    </p>
                    <div className="flex gap-2">
                      {template.variables.map((variable) => (
                        <Badge key={variable} variant="outline" className="text-xs">
                          {variable}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Visualizar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Regras */}
        <TabsContent value="rules" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Regras de Notificação</h3>
            <Button onClick={() => setIsRuleDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Regra
            </Button>
          </div>

          <div className="grid gap-4">
            {rules.map((rule) => (
              <Card key={rule.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{rule.name}</CardTitle>
                      <CardDescription>
                        Trigger: {rule.triggerType} • {rule.maxAttempts} tentativas
                      </CardDescription>
                    </div>
                    {getStatusBadge(rule.active)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <strong>Template:</strong> {rule.template?.name || "N/A"}
                    </p>
                    <p className="text-sm">
                      <strong>Canais:</strong> {rule.channelPriority.join(", ")}
                    </p>
                    <p className="text-sm">
                      <strong>Intervalo de retry:</strong> {rule.retryInterval} minutos
                    </p>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Taxa de Entrega ao Longo do Tempo */}
            <Card>
              <CardHeader>
                <CardTitle>Taxa de Entrega</CardTitle>
                <CardDescription>Últimos 30 dias</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={metrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="delivered"
                      stackId="1"
                      stroke={chartColors.success}
                      fill={chartColors.success}
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="failed"
                      stackId="1"
                      stroke={chartColors.danger}
                      fill={chartColors.danger}
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Distribuição por Canal */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Canal</CardTitle>
                <CardDescription>Últimos 7 dias</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={channelPerformance}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="sent"
                      label={({ channel, sent }) => `${channel}: ${sent}`}
                    >
                      {channelPerformance.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            Object.values(chartColors)[index % Object.values(chartColors).length]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Tabela Detalhada */}
          <Card>
            <CardHeader>
              <CardTitle>Métricas Detalhadas</CardTitle>
              <CardDescription>Performance detalhada por canal e período</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Canal</th>
                      <th className="text-right p-2">Enviadas</th>
                      <th className="text-right p-2">Entregues</th>
                      <th className="text-right p-2">Falharam</th>
                      <th className="text-right p-2">Taxa</th>
                      <th className="text-right p-2">Tempo Médio</th>
                      <th className="text-right p-2">Custo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {channelPerformance.map((channel) => (
                      <tr key={channel.channel} className="border-b">
                        <td className="p-2 flex items-center gap-2">
                          {getChannelIcon(channel.channel)}
                          <span className="capitalize">{channel.channel}</span>
                        </td>
                        <td className="text-right p-2">{channel.sent.toLocaleString()}</td>
                        <td className="text-right p-2">{channel.delivered.toLocaleString()}</td>
                        <td className="text-right p-2">{channel.failed.toLocaleString()}</td>
                        <td className="text-right p-2">{channel.rate.toFixed(1)}%</td>
                        <td className="text-right p-2">{channel.avgDeliveryTime.toFixed(1)}s</td>
                        <td className="text-right p-2">R$ {channel.cost.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pacientes */}
        <TabsContent value="patients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Engajamento de Pacientes</CardTitle>
              <CardDescription>Top 20 pacientes por score de resposta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patientEngagement.map((patient) => (
                  <div
                    key={patient.patientId}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{patient.patientName}</p>
                      <p className="text-sm text-muted-foreground">
                        Prefere: {patient.preferredChannel} • Última resposta:{" "}
                        {patient.lastResponse}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full">
                          <div
                            className="h-2 bg-blue-500 rounded-full"
                            style={{ width: `${patient.responseScore}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{patient.responseScore}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações */}
        <TabsContent value="settings" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Regras de Escalação */}
            <Card>
              <CardHeader>
                <CardTitle>Regras de Escalação</CardTitle>
                <CardDescription>Configure escalação automática para não-resposta</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {escalationRules.map((rule) => (
                    <div
                      key={rule.id}
                      className="flex items-center justify-between p-3 border rounded"
                    >
                      <div>
                        <p className="font-medium">{rule.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {rule.triggerCondition} → {rule.targetUserName}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(rule.active)}
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Regra de Escalação
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Configurações Gerais */}
            <Card>
              <CardHeader>
                <CardTitle>Configurações Gerais</CardTitle>
                <CardDescription>Configurações globais do sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Auto-envio de lembretes</p>
                      <p className="text-sm text-muted-foreground">Enviar lembretes automáticos</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Escalação automática</p>
                      <p className="text-sm text-muted-foreground">
                        Escalar para gestores automaticamente
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Analytics avançado</p>
                      <p className="text-sm text-muted-foreground">Coletar métricas detalhadas</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Button className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Configurações Avançadas
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog para novo template */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Novo Template de Notificação</DialogTitle>
            <DialogDescription>
              Crie um novo template para notificações automáticas
            </DialogDescription>
          </DialogHeader>
          {/* Formulário de template seria implementado aqui */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="template-name">Nome do Template</Label>
              <Input id="template-name" placeholder="Ex: Lembrete de Consulta" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="template-type">Tipo</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reminder">Lembrete</SelectItem>
                    <SelectItem value="confirmation">Confirmação</SelectItem>
                    <SelectItem value="escalation">Escalação</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="template-channel">Canal</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o canal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="push">Push</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="template-subject">Assunto (opcional)</Label>
              <Input id="template-subject" placeholder="Assunto da mensagem" />
            </div>
            <div>
              <Label htmlFor="template-content">Conteúdo</Label>
              <Textarea
                id="template-content"
                placeholder="Olá {patient_name}, sua consulta está agendada para {appointment_date}..."
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setIsTemplateDialogOpen(false)}>Criar Template</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * NeonPro Notification System - Dashboard Component
 * Story 1.7: Sistema de Notificações
 *
 * Dashboard React para gerenciamento de notificações
 * Suporte a visualização, configuração e monitoramento
 */

"use client";

import type {
  AlertTriangle,
  BarChart3,
  Bell,
  CheckCircle,
  Clock,
  Download,
  Edit,
  Eye,
  Filter,
  Mail,
  MessageSquare,
  Monitor,
  Pause,
  Play,
  Plus,
  Search,
  Send,
  Settings,
  Smartphone,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import type { Alert, AlertDescription } from "@/components/ui/alert";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Input } from "@/components/ui/input";
import type { Label } from "@/components/ui/label";
import type { Progress } from "@/components/ui/progress";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Separator } from "@/components/ui/separator";
import type { Switch } from "@/components/ui/switch";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Textarea } from "@/components/ui/textarea";
import type {
  AutomationRule,
  DeliveryStatus,
  NotificationChannel,
  NotificationDelivery,
  NotificationPriority,
  NotificationTemplate,
  NotificationType,
} from "@/lib/notifications/types";

// ============================================================================
// INTERFACES
// ============================================================================

interface NotificationStats {
  total: number;
  sent: number;
  delivered: number;
  failed: number;
  pending: number;
  channels: {
    email: number;
    sms: number;
    push: number;
    inApp: number;
  };
  types: {
    appointment: number;
    payment: number;
    reminder: number;
    alert: number;
    marketing: number;
    system: number;
  };
}

interface ChannelStatus {
  channel: NotificationChannel;
  enabled: boolean;
  healthy: boolean;
  lastCheck: Date;
  errorCount: number;
  successRate: number;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function NotificationDashboard() {
  // Estados
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [channelStatus, setChannelStatus] = useState<ChannelStatus[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [deliveries, setDeliveries] = useState<NotificationDelivery[]>([]);
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterChannel, setFilterChannel] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    loadDashboardData();
  }, []);

  // ============================================================================
  // DATA LOADING
  // ============================================================================

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // Simular carregamento de dados
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock data
      setStats({
        total: 15420,
        sent: 14890,
        delivered: 14235,
        failed: 185,
        pending: 530,
        channels: {
          email: 8450,
          sms: 3210,
          push: 2890,
          inApp: 870,
        },
        types: {
          appointment: 6780,
          payment: 2340,
          reminder: 3450,
          alert: 890,
          marketing: 1560,
          system: 400,
        },
      });

      setChannelStatus([
        {
          channel: NotificationChannel.EMAIL,
          enabled: true,
          healthy: true,
          lastCheck: new Date(),
          errorCount: 12,
          successRate: 98.5,
        },
        {
          channel: NotificationChannel.SMS,
          enabled: true,
          healthy: true,
          lastCheck: new Date(),
          errorCount: 5,
          successRate: 99.2,
        },
        {
          channel: NotificationChannel.PUSH,
          enabled: true,
          healthy: false,
          lastCheck: new Date(Date.now() - 300000),
          errorCount: 45,
          successRate: 94.8,
        },
        {
          channel: NotificationChannel.IN_APP,
          enabled: true,
          healthy: true,
          lastCheck: new Date(),
          errorCount: 2,
          successRate: 99.8,
        },
      ]);

      // Mock templates
      setTemplates([
        {
          id: "welcome",
          name: "Boas-vindas",
          description: "Template de boas-vindas para novos usuários",
          type: NotificationType.SYSTEM,
          channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
          subject: "Bem-vindo ao NeonPro!",
          content: "Olá {{user.firstName}}, bem-vindo ao NeonPro!",
          variables: ["user.firstName", "user.email"],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "appointment-reminder",
          name: "Lembrete de Consulta",
          description: "Lembrete de consulta agendada",
          type: NotificationType.APPOINTMENT,
          channels: [NotificationChannel.SMS, NotificationChannel.PUSH],
          subject: "Lembrete: Consulta amanhã",
          content:
            "Olá {{patient.firstName}}, lembre-se da sua consulta amanhã às {{appointment.time}}.",
          variables: ["patient.firstName", "appointment.time", "appointment.date"],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const getChannelIcon = (channel: NotificationChannel) => {
    switch (channel) {
      case NotificationChannel.EMAIL:
        return <Mail className="h-4 w-4" />;
      case NotificationChannel.SMS:
        return <MessageSquare className="h-4 w-4" />;
      case NotificationChannel.PUSH:
        return <Smartphone className="h-4 w-4" />;
      case NotificationChannel.IN_APP:
        return <Monitor className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getChannelName = (channel: NotificationChannel) => {
    switch (channel) {
      case NotificationChannel.EMAIL:
        return "Email";
      case NotificationChannel.SMS:
        return "SMS";
      case NotificationChannel.PUSH:
        return "Push";
      case NotificationChannel.IN_APP:
        return "In-App";
      default:
        return "Desconhecido";
    }
  };

  const getStatusBadge = (status: DeliveryStatus) => {
    switch (status) {
      case DeliveryStatus.SENT:
        return (
          <Badge variant="outline" className="text-blue-600">
            Enviado
          </Badge>
        );
      case DeliveryStatus.DELIVERED:
        return (
          <Badge variant="outline" className="text-green-600">
            Entregue
          </Badge>
        );
      case DeliveryStatus.FAILED:
        return <Badge variant="destructive">Falhou</Badge>;
      case DeliveryStatus.PENDING:
        return <Badge variant="secondary">Pendente</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getPriorityBadge = (priority: NotificationPriority) => {
    switch (priority) {
      case NotificationPriority.URGENT:
        return <Badge variant="destructive">Urgente</Badge>;
      case NotificationPriority.HIGH:
        return <Badge className="bg-orange-500">Alta</Badge>;
      case NotificationPriority.MEDIUM:
        return <Badge variant="secondary">Média</Badge>;
      case NotificationPriority.LOW:
        return <Badge variant="outline">Baixa</Badge>;
      default:
        return <Badge variant="outline">Normal</Badge>;
    }
  };

  // ============================================================================
  // RENDER COMPONENTS
  // ============================================================================

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enviadas</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% em relação ao mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Entrega</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? ((stats.delivered / stats.sent) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">+2.1% em relação ao mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Falhas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.failed}</div>
            <p className="text-xs text-muted-foreground">-5% em relação ao mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats?.pending}</div>
            <p className="text-xs text-muted-foreground">Processando...</p>
          </CardContent>
        </Card>
      </div>

      {/* Status dos Canais */}
      <Card>
        <CardHeader>
          <CardTitle>Status dos Canais</CardTitle>
          <CardDescription>Monitoramento em tempo real dos canais de notificação</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {channelStatus.map((channel) => (
              <div
                key={channel.channel}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getChannelIcon(channel.channel)}
                  <div>
                    <div className="font-medium">{getChannelName(channel.channel)}</div>
                    <div className="text-sm text-muted-foreground">
                      Última verificação: {channel.lastCheck.toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium">{channel.successRate}% sucesso</div>
                    <div className="text-xs text-muted-foreground">{channel.errorCount} erros</div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch checked={channel.enabled} />
                    <div
                      className={`w-3 h-3 rounded-full ${
                        channel.healthy ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Distribuição por Canal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Canal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats &&
                Object.entries(stats.channels).map(([channel, count]) => {
                  const percentage = (count / stats.total) * 100;
                  return (
                    <div key={channel} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{channel}</span>
                        <span>
                          {count.toLocaleString()} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats &&
                Object.entries(stats.types).map(([type, count]) => {
                  const percentage = (count / stats.total) * 100;
                  return (
                    <div key={type} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{type}</span>
                        <span>
                          {count.toLocaleString()} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderTemplates = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Templates de Notificação</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie templates para diferentes tipos de notificação
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">CANAIS</Label>
                  <div className="flex space-x-1 mt-1">
                    {template.channels.map((channel) => (
                      <Badge key={channel} variant="outline" className="text-xs">
                        {getChannelName(channel)}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">ASSUNTO</Label>
                  <p className="text-sm mt-1 truncate">{template.subject}</p>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">VARIÁVEIS</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {template.variables.length} variáveis disponíveis
                  </p>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <Switch checked={template.isActive} />
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Visualizar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderDeliveries = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Histórico de Entregas</h3>
          <p className="text-sm text-muted-foreground">
            Acompanhe o status das notificações enviadas
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>
      </div>

      <div className="flex space-x-4">
        <Input
          placeholder="Buscar por destinatário..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={filterChannel} onValueChange={setFilterChannel}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Canal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os canais</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="sms">SMS</SelectItem>
            <SelectItem value="push">Push</SelectItem>
            <SelectItem value="inapp">In-App</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="sent">Enviado</SelectItem>
            <SelectItem value="delivered">Entregue</SelectItem>
            <SelectItem value="failed">Falhou</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="p-4 font-medium">Destinatário</th>
                  <th className="p-4 font-medium">Canal</th>
                  <th className="p-4 font-medium">Tipo</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Enviado em</th>
                  <th className="p-4 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {/* Mock data - em produção viria do estado deliveries */}
                <tr className="border-b">
                  <td className="p-4">
                    <div>
                      <div className="font-medium">João Silva</div>
                      <div className="text-sm text-muted-foreground">joao@email.com</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant="outline">Lembrete</Badge>
                  </td>
                  <td className="p-4">{getStatusBadge(DeliveryStatus.DELIVERED)}</td>
                  <td className="p-4">
                    <div className="text-sm">
                      {new Date().toLocaleDateString()}
                      <br />
                      <span className="text-muted-foreground">
                        {new Date().toLocaleTimeString()}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAutomation = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Automação</h3>
          <p className="text-sm text-muted-foreground">
            Configure regras automáticas para notificações
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Regra
        </Button>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          O sistema de automação está em desenvolvimento. Em breve você poderá criar regras
          automáticas baseadas em eventos do sistema.
        </AlertDescription>
      </Alert>
    </div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Sistema de Notificações</h1>
          <p className="text-muted-foreground">
            Gerencie e monitore todas as notificações do sistema
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
          <Button>
            <Send className="h-4 w-4 mr-2" />
            Enviar Notificação
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="deliveries">Entregas</TabsTrigger>
          <TabsTrigger value="automation">Automação</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">{renderOverview()}</TabsContent>
        <TabsContent value="templates">{renderTemplates()}</TabsContent>
        <TabsContent value="deliveries">{renderDeliveries()}</TabsContent>
        <TabsContent value="automation">{renderAutomation()}</TabsContent>
        <TabsContent value="analytics">
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Analytics em Desenvolvimento</h3>
            <p className="text-muted-foreground">
              Relatórios detalhados e métricas avançadas estarão disponíveis em breve.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default NotificationDashboard;

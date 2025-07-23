"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertTriangle,
  Bell,
  Check,
  ChevronRight,
  Clock,
  Eye,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

// Mock data - substituir por dados reais do Supabase
const mockDashboardAlerts = [
  {
    id: "1",
    title: "Pagamento em atraso - Fornecedor Gamma",
    message: "Conta de R$ 3.200,00 está 3 dias em atraso",
    alert_type: "overdue" as const,
    priority: "urgent" as const,
    is_read: false,
    is_dismissed: false,
    action_url: "/dashboard/accounts-payable/payables?id=3",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    title: "Pagamento vence hoje - Fornecedor Beta",
    message: "Conta de R$ 8.500,00 vence hoje",
    alert_type: "due_today" as const,
    priority: "high" as const,
    is_read: false,
    is_dismissed: false,
    action_url: "/dashboard/accounts-payable/payables?id=2",
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min atrás
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    title: "Pagamento crítico em atraso - Fornecedor Epsilon",
    message: "Conta de R$ 12.000,00 está 10 dias em atraso",
    alert_type: "overdue" as const,
    priority: "urgent" as const,
    is_read: true,
    is_dismissed: false,
    action_url: "/dashboard/accounts-payable/payables?id=5",
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 dia atrás
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    title: "Aprovação pendente - Fornecedor Zeta",
    message: "Pagamento de R$ 5.800,00 aguarda aprovação do gerente",
    alert_type: "approval_needed" as const,
    priority: "medium" as const,
    is_read: false,
    is_dismissed: false,
    action_url: "/dashboard/accounts-payable/approvals?id=6",
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 horas atrás
    expires_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "5",
    title: "Pagamento próximo do vencimento - Fornecedor Alpha",
    message: "Conta de R$ 15.000,00 vence amanhã",
    alert_type: "due_soon" as const,
    priority: "medium" as const,
    is_read: true,
    is_dismissed: false,
    action_url: "/dashboard/accounts-payable/payables?id=1",
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 horas atrás
    expires_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

interface DashboardAlert {
  id: string;
  title: string;
  message: string;
  alert_type:
    | "due_soon"
    | "overdue"
    | "approval_needed"
    | "high_priority"
    | "due_today";
  priority: "low" | "medium" | "high" | "urgent";
  is_read: boolean;
  is_dismissed: boolean;
  action_url?: string;
  created_at: string;
  expires_at?: string;
}

interface DashboardAlertsProps {
  clinicId: string;
  limit?: number;
  showTitle?: boolean;
}

export function DashboardAlerts({
  clinicId,
  limit = 5,
  showTitle = true,
}: DashboardAlertsProps) {
  const [alerts, setAlerts] = useState<DashboardAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, [clinicId]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      // TODO: Implementar chamada real para o serviço
      // const data = await notificationService.getDashboardAlerts(clinicId, limit)

      // Usando dados mock por enquanto
      setTimeout(() => {
        const limitedAlerts = mockDashboardAlerts
          .filter((alert) => !alert.is_dismissed)
          .slice(0, limit);
        setAlerts(limitedAlerts);
        setLoading(false);
      }, 300);
    } catch (error) {
      console.error("Error loading alerts:", error);
      setLoading(false);
    }
  };

  const markAsRead = async (alertId: string) => {
    try {
      // TODO: Implementar chamada real
      // await notificationService.markAlertAsRead(alertId)

      setAlerts((prev) =>
        prev.map((alert) =>
          alert.id === alertId ? { ...alert, is_read: true } : alert
        )
      );
    } catch (error) {
      console.error("Error marking alert as read:", error);
    }
  };

  const dismissAlert = async (alertId: string) => {
    try {
      // TODO: Implementar chamada real
      // await notificationService.dismissAlert(alertId)

      setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
    } catch (error) {
      console.error("Error dismissing alert:", error);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Zap className="h-4 w-4 text-red-500" />;
      case "high":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "medium":
        return <TrendingUp className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getAlertTypeBadgeColor = (alertType: string) => {
    switch (alertType) {
      case "overdue":
        return "destructive";
      case "due_today":
        return "destructive";
      case "approval_needed":
        return "secondary";
      case "due_soon":
        return "outline";
      case "high_priority":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getAlertTypeLabel = (alertType: string) => {
    switch (alertType) {
      case "overdue":
        return "Em Atraso";
      case "due_today":
        return "Vence Hoje";
      case "approval_needed":
        return "Aprovação";
      case "due_soon":
        return "Próximo";
      case "high_priority":
        return "Alta Prioridade";
      default:
        return "Info";
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m atrás`;
    } else if (diffInMinutes < 1440) {
      // menos de 24h
      return `${Math.floor(diffInMinutes / 60)}h atrás`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d atrás`;
    }
  };

  const unreadCount = alerts.filter((alert) => !alert.is_read).length;

  if (loading) {
    return (
      <Card>
        {showTitle && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Alertas
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 bg-gray-300 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (alerts.length === 0) {
    return (
      <Card>
        {showTitle && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Alertas
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Bell className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Nenhum alerta no momento
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Você será notificado sobre pagamentos importantes
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {showTitle && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Alertas
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <Link href="/dashboard/accounts-payable/alerts">
              <Button variant="outline" size="sm">
                Ver todos
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          <CardDescription>
            Notificações importantes sobre contas a pagar
          </CardDescription>
        </CardHeader>
      )}
      <CardContent className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`flex items-start gap-3 p-3 rounded-lg border ${
              alert.is_read
                ? "bg-muted/20 border-muted"
                : "bg-background border-border"
            } hover:bg-muted/30 transition-colors`}
          >
            <div className="mt-0.5">{getPriorityIcon(alert.priority)}</div>

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4
                    className={`text-sm font-medium leading-none ${
                      alert.is_read
                        ? "text-muted-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {alert.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {alert.message}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <Badge
                    variant={getAlertTypeBadgeColor(alert.alert_type)}
                    className="text-xs"
                  >
                    {getAlertTypeLabel(alert.alert_type)}
                  </Badge>
                  <Badge
                    variant={getPriorityBadgeColor(alert.priority)}
                    className="text-xs"
                  >
                    {alert.priority === "urgent"
                      ? "Urgente"
                      : alert.priority === "high"
                      ? "Alta"
                      : alert.priority === "medium"
                      ? "Média"
                      : "Baixa"}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {formatTimeAgo(alert.created_at)}
                </span>

                <div className="flex items-center gap-1">
                  {alert.action_url && (
                    <Link href={alert.action_url}>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2"
                        onClick={() => !alert.is_read && markAsRead(alert.id)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </Link>
                  )}

                  {!alert.is_read && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2"
                      onClick={() => markAsRead(alert.id)}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2"
                    onClick={() => dismissAlert(alert.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {alerts.length === limit && (
          <div className="text-center pt-2">
            <Link href="/dashboard/accounts-payable/alerts">
              <Button variant="outline" size="sm" className="w-full">
                Ver todos os alertas
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

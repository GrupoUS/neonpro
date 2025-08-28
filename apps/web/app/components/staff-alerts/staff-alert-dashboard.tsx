"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Alert as AlertUI,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Bell,
  Search,
  Filter,
  Clock,
  User,
  Phone,
  MessageSquare,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowUp,
  MoreVertical,
  Smartphone,
  Desktop,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStaffAlerts } from "@/hooks/use-staff-alerts";
import type { StaffAlert } from "@/types/staff-alerts";
import {
  ALERT_STATUS_LABELS_PT,
  ALERT_PRIORITY_LABELS_PT,
  ALERT_PRIORITY_COLORS,
  DEPARTMENT_LABELS_PT,
  INTERVENTION_TYPE_LABELS_PT,
} from "@/types/staff-alerts";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface StaffAlertDashboardProps {
  staffMemberId?: string;
  department?: string;
  isMobile?: boolean;
  compactMode?: boolean;
}

/**
 * Staff Alert Dashboard - Real-time alert management for clinical staff
 * Mobile-optimized interface with Brazilian Portuguese localization
 */
export function StaffAlertDashboard({
  staffMemberId,
  department,
  isMobile = false,
  compactMode = false,
}: StaffAlertDashboardProps) {
  const {
    alerts,
    stats,
    isLoading,
    error,
    filters,
    acknowledgeAlert,
    assignAlert,
    resolveAlert,
    dismissAlert,
    escalateAlert,
    setFilters,
    clearFilters,
    getUnreadCount,
  } = useStaffAlerts({
    staffMemberId,
    department,
    realTimeUpdates: true,
    autoRefresh: true,
    refreshInterval: 15_000, // 15 seconds for high responsiveness
  });

  const [selectedAlert, setSelectedAlert] = useState<StaffAlert | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Filter alerts based on search term and tab
  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      searchTerm === "" ||
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTab = activeTab === "all" || alert.status === activeTab;

    return matchesSearch && matchesTab;
  });

  const getAlertIcon = (alert: StaffAlert) => {
    switch (alert.status) {
      case "pending":
        return <Bell className="h-4 w-4" />;
      case "acknowledged":
        return <Clock className="h-4 w-4" />;
      case "assigned":
        return <User className="h-4 w-4" />;
      case "in_progress":
        return <ArrowUp className="h-4 w-4" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4" />;
      case "dismissed":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getAlertAge = (createdAt: Date) => {
    return formatDistanceToNow(createdAt, {
      addSuffix: true,
      locale: ptBR,
    });
  };

  const handleQuickAction = async (
    alert: StaffAlert,
    action: "acknowledge" | "assign" | "resolve" | "dismiss" | "escalate",
  ) => {
    try {
      switch (action) {
        case "acknowledge":
          await acknowledgeAlert(alert.id);
          break;
        case "assign":
          if (staffMemberId) {
            await assignAlert(alert.id, staffMemberId);
          }
          break;
        case "resolve":
          await resolveAlert(alert.id, "Resolved via dashboard");
          break;
        case "dismiss":
          await dismissAlert(alert.id, "Dismissed via dashboard");
          break;
        case "escalate":
          await escalateAlert(alert.id);
          break;
      }
    } catch (err) {
      console.error(`Error performing ${action} on alert:`, err);
    }
  };

  // Mobile-optimized compact view
  if (compactMode || isMobile) {
    return (
      <div className="space-y-4 p-2">
        {/* Mobile Header with Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <h2 className="font-semibold">Alertas</h2>
            {getUnreadCount() > 0 && (
              <Badge variant="destructive" className="ml-1">
                {getUnreadCount()}
              </Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {stats.total} total
          </div>
        </div>

        {/* Mobile Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar alertas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Mobile Alert List */}
        <div className="space-y-2">
          {filteredAlerts.slice(0, 10).map((alert) => (
            <Card key={alert.id} className="p-3">
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "p-1 rounded-full",
                    alert.priority === "critical"
                      ? "bg-red-100"
                      : alert.priority === "urgent"
                        ? "bg-orange-100"
                        : alert.priority === "high"
                          ? "bg-yellow-100"
                          : "bg-blue-100",
                  )}
                >
                  {getAlertIcon(alert)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">
                      {alert.title}
                    </p>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        ALERT_PRIORITY_COLORS[alert.priority],
                      )}
                    >
                      {ALERT_PRIORITY_LABELS_PT[alert.priority]}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {alert.message}
                  </p>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      {getAlertAge(alert.createdAt)}
                    </span>

                    <div className="flex gap-1">
                      {alert.status === "pending" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleQuickAction(alert, "acknowledge")
                          }
                          className="h-6 px-2 text-xs"
                        >
                          Confirmar
                        </Button>
                      )}
                      {alert.status === "acknowledged" && staffMemberId && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuickAction(alert, "assign")}
                          className="h-6 px-2 text-xs"
                        >
                          Assumir
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Mobile Quick Actions */}
        <div className="fixed bottom-4 right-4 flex flex-col gap-2">
          <Button size="sm" className="rounded-full h-12 w-12 shadow-lg">
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  }

  // Desktop full view
  return (
    <div className="space-y-6">
      {/* Header with Real-time Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Central de Alertas da Equipe</h1>
          <p className="text-muted-foreground">
            Gerenciamento em tempo real de alertas e intervenções
          </p>
        </div>

        <div className="flex items-center gap-2">
          {error && (
            <AlertUI variant="destructive" className="w-auto">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </AlertUI>
          )}

          <Badge variant="outline" className="px-3 py-1">
            <Bell className="h-3 w-3 mr-1" />
            {getUnreadCount()} novos
          </Badge>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-xs text-muted-foreground">Pendentes</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{stats.assigned}</p>
              <p className="text-xs text-muted-foreground">Atribuídos</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <ArrowUp className="h-4 w-4 text-orange-500" />
            <div>
              <p className="text-2xl font-bold">{stats.inProgress}</p>
              <p className="text-xs text-muted-foreground">Em Andamento</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <div>
              <p className="text-2xl font-bold">{stats.overdue}</p>
              <p className="text-xs text-muted-foreground">Atrasados</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-purple-500" />
            <div>
              <p className="text-2xl font-bold">
                {Math.round(stats.avgResponseTime)}
              </p>
              <p className="text-xs text-muted-foreground">Min Resp.</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-2xl font-bold">
                {Math.round(stats.interventionSuccessRate)}%
              </p>
              <p className="text-xs text-muted-foreground">Sucesso</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Alert Management Interface */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Alertas Ativos</CardTitle>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Buscar alertas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">Todos ({stats.total})</TabsTrigger>
              <TabsTrigger value="pending">
                Pendentes ({stats.pending})
              </TabsTrigger>
              <TabsTrigger value="assigned">
                Atribuídos ({stats.assigned})
              </TabsTrigger>
              <TabsTrigger value="in_progress">
                Andamento ({stats.inProgress})
              </TabsTrigger>
              <TabsTrigger value="resolved">
                Resolvidos ({stats.resolved})
              </TabsTrigger>
              <TabsTrigger value="overdue">
                Atrasados ({stats.overdue})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              <div className="space-y-2">
                {filteredAlerts.map((alert) => (
                  <Card
                    key={alert.id}
                    className={cn(
                      "p-4 cursor-pointer transition-colors hover:bg-muted/50",
                      alert.priority === "critical" &&
                        "border-red-200 bg-red-50/30",
                      alert.priority === "urgent" &&
                        "border-orange-200 bg-orange-50/30",
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          "p-2 rounded-full",
                          alert.priority === "critical"
                            ? "bg-red-100"
                            : alert.priority === "urgent"
                              ? "bg-orange-100"
                              : alert.priority === "high"
                                ? "bg-yellow-100"
                                : "bg-blue-100",
                        )}
                      >
                        {getAlertIcon(alert)}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold">{alert.title}</h3>
                            <Badge
                              variant="outline"
                              className={ALERT_PRIORITY_COLORS[alert.priority]}
                            >
                              {ALERT_PRIORITY_LABELS_PT[alert.priority]}
                            </Badge>
                            <Badge variant="secondary">
                              {ALERT_STATUS_LABELS_PT[alert.status]}
                            </Badge>
                          </div>

                          <div className="text-sm text-muted-foreground">
                            {getAlertAge(alert.createdAt)}
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground mt-1">
                          {alert.message}
                        </p>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-4 text-sm">
                            <span>Risco: {alert.riskScore}%</span>
                            <span>
                              Depto: {DEPARTMENT_LABELS_PT[alert.department]}
                            </span>
                            {alert.assignedTo && (
                              <span>Atribuído: {alert.assignedTo}</span>
                            )}
                          </div>

                          <div className="flex gap-2">
                            {alert.status === "pending" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleQuickAction(alert, "acknowledge")
                                }
                              >
                                Confirmar
                              </Button>
                            )}
                            {alert.status === "acknowledged" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleQuickAction(alert, "assign")
                                }
                              >
                                Atribuir a Mim
                              </Button>
                            )}
                            {["assigned", "in_progress"].includes(
                              alert.status,
                            ) && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleQuickAction(alert, "resolve")
                                  }
                                >
                                  Resolver
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleQuickAction(alert, "escalate")
                                  }
                                >
                                  Escalar
                                </Button>
                              </>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSelectedAlert(alert)}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

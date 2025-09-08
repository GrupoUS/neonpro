"use client";

import { Avatar, AvatarFallback /*, AvatarImage*/ } from "@/components/ui/avatar"; // AvatarImage unused import
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
// import { Separator } from "@/components/ui/separator"; // Unused import
import { cn } from "@/lib/utils";
import {
  Bell,
  BellRing,
  Calendar,
  CheckCircle,
  Clock,
  Filter,
  Pause,
  Play,
  Settings,
  TrendingUp,
  User,
  X,
} from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";

// Types
export interface StaffAlert {
  id: string;
  type:
    | "high_risk"
    | "critical_risk"
    | "intervention_needed"
    | "system_notification";
  priority: "low" | "medium" | "high" | "critical";
  title: string;
  message: string;
  appointmentId?: string;
  patientId?: string;
  patientName?: string;
  assignedTo?: string;
  assignedToName?: string;
  createdAt: string;
  expiresAt?: string;
  status: "unread" | "acknowledged" | "resolved" | "dismissed";
  actions?: AlertAction[];
  metadata?: {
    riskScore?: number;
    appointmentTime?: string;
    interventionsCount?: number;
    [key: string]: unknown;
  };
}

export interface AlertAction {
  id: string;
  label: string;
  type: "primary" | "secondary" | "danger";
  handler: string; // Function name or action type
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  online: boolean;
}

export interface StaffAlertSystemProps {
  alerts: StaffAlert[];
  currentUser: StaffMember;
  staffMembers: StaffMember[];
  onAlertAction: (alertId: string, actionType: string, data?: unknown) => void;
  onDismissAlert: (alertId: string) => void;
  onSnoozeAlert: (alertId: string, minutes: number) => void;
  soundEnabled?: boolean;
  onSoundToggle?: (enabled: boolean) => void;
  className?: string;
}

// Alert priority configuration
const ALERT_PRIORITY_CONFIG = {
  critical: {
    color: "border-red-500 bg-red-50 text-red-900",
    badgeColor: "bg-red-100 text-red-800",
    icon: BellRing,
    sound: true,
  },
  high: {
    color: "border-orange-500 bg-orange-50 text-orange-900",
    badgeColor: "bg-orange-100 text-orange-800",
    icon: BellRing,
    sound: true,
  },
  medium: {
    color: "border-yellow-500 bg-yellow-50 text-yellow-900",
    badgeColor: "bg-yellow-100 text-yellow-800",
    icon: Bell,
    sound: false,
  },
  low: {
    color: "border-blue-500 bg-blue-50 text-blue-900",
    badgeColor: "bg-blue-100 text-blue-800",
    icon: Bell,
    sound: false,
  },
};

// Snooze options
const SNOOZE_OPTIONS = [
  { minutes: 5, label: "5 minutos" },
  { minutes: 15, label: "15 minutos" },
  { minutes: 30, label: "30 minutos" },
  { minutes: 60, label: "1 hora" },
  { minutes: 240, label: "4 horas" },
];

export function StaffAlertSystem({
  alerts,
  currentUser,
  staffMembers,
  onAlertAction,
  onDismissAlert,
  onSnoozeAlert,
  soundEnabled = true,
  onSoundToggle,
  className = "",
}: StaffAlertSystemProps) {
  const [filter, setFilter] = useState<"all" | "unread" | "assigned">("unread");
  const [soundPlaying, setSoundPlaying] = useState(false);

  // Filter alerts
  const filteredAlerts = useMemo(() => {
    let filtered = alerts;

    switch (filter) {
      case "unread":
        filtered = alerts.filter((alert) => alert.status === "unread");
        break;
      case "assigned":
        filtered = alerts.filter(
          (alert) => alert.assignedTo === currentUser.id,
        );
        break;
      default:
        break;
    }

    // Sort by priority and creation time
    return filtered.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [alerts, filter, currentUser.id]);

  // Alert statistics
  const alertStats = useMemo(() => {
    return {
      total: alerts.length,
      unread: alerts.filter((a) => a.status === "unread").length,
      critical: alerts.filter(
        (a) => a.priority === "critical" && a.status === "unread",
      ).length,
      high: alerts.filter((a) => a.priority === "high" && a.status === "unread")
        .length,
      assigned: alerts.filter(
        (a) => a.assignedTo === currentUser.id && a.status !== "resolved",
      ).length,
    };
  }, [alerts, currentUser.id]);

  // Play alert sound for new critical/high priority alerts
  useEffect(() => {
    if (!soundEnabled || soundPlaying) {
      return;
    }

    const newCriticalAlerts = alerts.filter(
      (alert) =>
        alert.priority === "critical"
        && alert.status === "unread"
        && new Date().getTime() - new Date(alert.createdAt).getTime() < 5000, // Last 5 seconds
    );

    if (newCriticalAlerts.length > 0) {
      setSoundPlaying(true);
      // Play sound (would integrate with actual audio API)
      setTimeout(() => setSoundPlaying(false), 2000);
    }
  }, [alerts, soundEnabled, soundPlaying]);

  // Format time relative to now
  const formatRelativeTime = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) {
      return "Agora mesmo";
    }
    if (diffMins < 60) {
      return `${diffMins}min atrás`;
    }
    if (diffMins < 1440) {
      return `${Math.floor(diffMins / 60)}h atrás`;
    }
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }, []);

  // Handle alert action
  const handleAlertAction = useCallback(
    (alertId: string, actionType: string, data?: unknown) => {
      onAlertAction(alertId, actionType, data);
    },
    [onAlertAction],
  );

  // Handle dismiss
  const handleDismiss = useCallback(
    (alertId: string) => {
      onDismissAlert(alertId);
    },
    [onDismissAlert],
  );

  // Handle snooze
  const handleSnooze = useCallback(
    (alertId: string, minutes: number) => {
      onSnoozeAlert(alertId, minutes);
    },
    [onSnoozeAlert],
  );

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <div className="relative">
                <Bell className="h-5 w-5" />
                {alertStats.unread > 0 && (
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse" />
                )}
              </div>
              Alertas da Equipe
              {alertStats.unread > 0 && (
                <Badge className="bg-red-100 text-red-800">
                  {alertStats.unread} novos
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onSoundToggle?.(!soundEnabled)}
              >
                {soundEnabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button size="sm" variant="outline">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Statistics */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-lg font-bold">{alertStats.total}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">
                {alertStats.critical}
              </div>
              <div className="text-xs text-muted-foreground">Críticos</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">
                {alertStats.high}
              </div>
              <div className="text-xs text-muted-foreground">Altos</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {alertStats.assigned}
              </div>
              <div className="text-xs text-muted-foreground">Atribuídos</div>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            {[
              { key: "unread", label: `Não lidos (${alertStats.unread})` },
              { key: "assigned", label: `Atribuídos (${alertStats.assigned})` },
              { key: "all", label: `Todos (${alertStats.total})` },
            ].map((filterOption) => (
              <Button
                key={filterOption.key}
                size="sm"
                variant={filter === filterOption.key ? "default" : "outline"}
                onClick={() => setFilter(filterOption.key as unknown)}
              >
                <Filter className="h-3 w-3 mr-1" />
                {filterOption.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <Card className="flex-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            {filter === "unread" && "Alertas Não Lidos"}
            {filter === "assigned" && "Alertas Atribuídos a Mim"}
            {filter === "all" && "Todos os Alertas"}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            <div className="space-y-2 p-4">
              {filteredAlerts.length === 0
                ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                    <div className="text-sm">
                      {filter === "unread" && "Nenhum alerta não lido"}
                      {filter === "assigned" && "Nenhum alerta atribuído"}
                      {filter === "all" && "Nenhum alerta"}
                    </div>
                  </div>
                )
                : (
                  filteredAlerts.map((alert) => {
                    const config = ALERT_PRIORITY_CONFIG[alert.priority];
                    const IconComponent = config.icon;
                    const isExpired = alert.expiresAt && new Date(alert.expiresAt) < new Date();

                    return (
                      <Card
                        key={alert.id}
                        className={cn(
                          "transition-all duration-200 hover:shadow-md border-l-4",
                          config.color,
                          alert.status === "unread" && "shadow-sm",
                          isExpired && "opacity-60",
                        )}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            {/* Icon */}
                            <div className="flex-shrink-0 pt-1">
                              <IconComponent
                                className={cn(
                                  "h-5 w-5",
                                  alert.status === "unread"
                                    && config.sound
                                    && "animate-pulse",
                                )}
                              />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-sm truncate">
                                  {alert.title}
                                </h4>
                                <Badge className={config.badgeColor}>
                                  {alert.priority}
                                </Badge>
                                {alert.status === "unread" && (
                                  <div className="h-2 w-2 bg-red-500 rounded-full" />
                                )}
                              </div>

                              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                {alert.message}
                              </p>

                              {/* Metadata */}
                              {(alert.patientName
                                || alert.metadata?.appointmentTime) && (
                                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                                  {alert.patientName && (
                                    <span className="flex items-center gap-1">
                                      <User className="h-3 w-3" />
                                      {alert.patientName}
                                    </span>
                                  )}
                                  {alert.metadata?.appointmentTime && (
                                    <span className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {new Intl.DateTimeFormat("pt-BR", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      }).format(
                                        new Date(alert.metadata.appointmentTime),
                                      )}
                                    </span>
                                  )}
                                  {alert.metadata?.riskScore && (
                                    <span className="flex items-center gap-1">
                                      <TrendingUp className="h-3 w-3" />
                                      {Math.round(alert.metadata.riskScore * 100)}
                                      % risco
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Assignment */}
                              {alert.assignedToName && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                  <Avatar className="h-4 w-4">
                                    <AvatarFallback className="text-xs">
                                      {alert.assignedToName
                                        .charAt(0)
                                        .toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>Atribuído a {alert.assignedToName}</span>
                                </div>
                              )}

                              {/* Actions */}
                              {alert.actions && alert.actions.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {alert.actions.map((action) => (
                                    <Button
                                      key={action.id}
                                      size="sm"
                                      variant={action.type === "primary"
                                        ? "default"
                                        : "outline"}
                                      className={cn(
                                        "h-6 px-2 text-xs",
                                        action.type === "danger"
                                          && "text-red-600 hover:text-red-700",
                                      )}
                                      onClick={() =>
                                        handleAlertAction(
                                          alert.id,
                                          action.handler,
                                        )}
                                    >
                                      {action.label}
                                    </Button>
                                  ))}
                                </div>
                              )}

                              {/* Footer */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {formatRelativeTime(alert.createdAt)}
                                  {isExpired && (
                                    <span className="text-red-500 ml-1">
                                      (expirado)
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1">
                                  {/* Snooze Dropdown */}
                                  <select
                                    className="text-xs border rounded px-1 py-0.5"
                                    onChange={(e) => {
                                      const minutes = parseInt(e.target.value);
                                      if (minutes) {
                                        handleSnooze(alert.id, minutes);
                                      }
                                    }}
                                    defaultValue=""
                                  >
                                    <option value="" disabled>
                                      Soneca
                                    </option>
                                    {SNOOZE_OPTIONS.map((option) => (
                                      <option
                                        key={option.minutes}
                                        value={option.minutes}
                                      >
                                        {option.label}
                                      </option>
                                    ))}
                                  </select>

                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0"
                                    onClick={() => handleDismiss(alert.id)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

export default StaffAlertSystem;

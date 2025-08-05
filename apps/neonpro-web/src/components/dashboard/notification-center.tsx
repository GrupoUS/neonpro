"use client";

import type { useState } from "react";
import type { format } from "date-fns";
import type { pt } from "date-fns/locale";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Button } from "@/components/ui/button";
import type { Badge } from "@/components/ui/badge";
import type { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ScrollArea } from "@/components/ui/scroll-area";
import type { Separator } from "@/components/ui/separator";
import type { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type {
  Bell,
  BellRing,
  Check,
  CheckCheck,
  Trash2,
  Settings,
  Calendar,
  AlertTriangle,
  Info,
  Gift,
  Clock,
  MoreVertical,
  RefreshCw,
  Filter,
} from "lucide-react";
import type { cn } from "@/lib/utils";
import type { useNotificationContext } from "@/contexts/notification-context";
import type { Notification } from "@/hooks/use-notifications";

interface NotificationCenterProps {
  className?: string;
  variant?: "popover" | "page";
  maxHeight?: string;
}

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
  compact?: boolean;
}

const notificationIcons = {
  appointment_confirmed: Calendar,
  appointment_cancelled: AlertTriangle,
  appointment_reminder: Clock,
  appointment_rescheduled: Calendar,
  system: Info,
  marketing: Gift,
};

const notificationColors = {
  appointment_confirmed: "text-green-600",
  appointment_cancelled: "text-red-600",
  appointment_reminder: "text-blue-600",
  appointment_rescheduled: "text-yellow-600",
  system: "text-gray-600",
  marketing: "text-purple-600",
};

function NotificationItem({
  notification,
  onRead,
  onDelete,
  compact = false,
}: NotificationItemProps) {
  const Icon = notificationIcons[notification.type] || Bell;
  const isRead = !!notification.read_at;
  const isExpired = notification.expires_at && new Date(notification.expires_at) < new Date();

  const handleClick = () => {
    if (!isRead) {
      onRead(notification.id);
    }

    // Navigate to action URL if exists
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
  };

  return (
    <div
      className={cn(
        "flex items-start space-x-3 p-3 rounded-lg cursor-pointer transition-colors",
        isRead ? "opacity-60" : "bg-primary/5 hover:bg-primary/10",
        isExpired && "opacity-40",
        compact ? "p-2" : "p-3",
      )}
      onClick={handleClick}
    >
      {/* Icon */}
      <div className={cn("mt-0.5", notificationColors[notification.type])}>
        <Icon className={cn(compact ? "h-4 w-4" : "h-5 w-5")} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h4
              className={cn(
                "font-medium truncate",
                compact ? "text-sm" : "text-base",
                !isRead && "text-foreground",
                isRead && "text-muted-foreground",
              )}
            >
              {notification.title}
            </h4>

            <p
              className={cn(
                "text-muted-foreground mt-1",
                compact ? "text-xs" : "text-sm",
                compact ? "line-clamp-1" : "line-clamp-2",
              )}
            >
              {notification.message}
            </p>

            <div className="flex items-center space-x-2 mt-2">
              <time className={cn("text-muted-foreground", compact ? "text-xs" : "text-xs")}>
                {format(new Date(notification.created_at), "dd/MM HH:mm", { locale: pt })}
              </time>

              {notification.priority === "high" && (
                <Badge variant="destructive" className={cn(compact ? "text-xs px-1" : "text-xs")}>
                  Urgente
                </Badge>
              )}

              {isExpired && (
                <Badge variant="outline" className={cn(compact ? "text-xs px-1" : "text-xs")}>
                  Expirado
                </Badge>
              )}
            </div>
          </div>

          {/* Actions */}
          {!compact && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!isRead && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onRead(notification.id);
                    }}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Marcar como lida
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(notification.id);
                  }}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
}

export function NotificationCenter({
  className,
  variant = "popover",
  maxHeight = "400px",
}: NotificationCenterProps) {
  const [filterType, setFilterType] = useState<Notification["type"] | "all">("all");
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);

  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
    getNotificationsByType,
    getUnreadNotifications,
  } = useNotificationContext();

  // Filter notifications
  const filteredNotifications = (() => {
    let filtered = notifications;

    if (showOnlyUnread) {
      filtered = getUnreadNotifications();
    }

    if (filterType !== "all") {
      filtered = filtered.filter((notif) => notif.type === filterType);
    }

    return filtered;
  })();

  const isEmpty = filteredNotifications.length === 0;
  const hasUnread = unreadCount > 0;

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const handleRefresh = async () => {
    try {
      await refreshNotifications();
    } catch (error) {
      console.error("Error refreshing notifications:", error);
    }
  };

  const NotificationList = () => (
    <div className="space-y-1">
      {isLoading ? (
        <div className="flex justify-center p-4">
          <RefreshCw className="h-4 w-4 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center p-4 text-red-600">
          <p className="text-sm">{error}</p>
          <Button variant="outline" size="sm" onClick={handleRefresh} className="mt-2">
            Tentar novamente
          </Button>
        </div>
      ) : isEmpty ? (
        <div className="text-center p-6">
          <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {showOnlyUnread ? "Nenhuma notificação não lida" : "Nenhuma notificação"}
          </p>
        </div>
      ) : (
        <ScrollArea className={`${maxHeight}`}>
          {filteredNotifications.map((notification, index) => (
            <div key={notification.id}>
              <NotificationItem
                notification={notification}
                onRead={markAsRead}
                onDelete={deleteNotification}
                compact={variant === "popover"}
              />
              {index < filteredNotifications.length - 1 && <Separator className="my-1" />}
            </div>
          ))}
        </ScrollArea>
      )}
    </div>
  );

  if (variant === "popover") {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className={cn("relative", className)}>
            {hasUnread ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
            {hasUnread && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-80 p-0" align="end">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Notificações</h3>
              <div className="flex items-center space-x-1">
                {hasUnread && (
                  <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
                    <CheckCheck className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {hasUnread && (
              <p className="text-sm text-muted-foreground mt-1">
                {unreadCount} nova{unreadCount !== 1 ? "s" : ""} notificação
                {unreadCount !== 1 ? "ões" : ""}
              </p>
            )}
          </div>

          <NotificationList />
        </PopoverContent>
      </Popover>
    );
  }

  // Page variant
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Central de Notificações
            </CardTitle>
            {hasUnread && (
              <p className="text-sm text-muted-foreground mt-1">
                {unreadCount} não lida{unreadCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Tipo de notificação</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setFilterType("all")}>Todas</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType("appointment_confirmed")}>
                  Confirmações
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType("appointment_reminder")}>
                  Lembretes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType("appointment_cancelled")}>
                  Cancelamentos
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowOnlyUnread(!showOnlyUnread)}>
                  {showOnlyUnread ? "Mostrar todas" : "Apenas não lidas"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {hasUnread && (
              <Button size="sm" onClick={handleMarkAllRead}>
                <CheckCheck className="h-4 w-4 mr-2" />
                Marcar todas como lidas
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <NotificationList />
      </CardContent>
    </Card>
  );
}

import {
  AlertCircle,
  Bell,
  BellOff,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Info,
  MessageSquare,
  Settings,
  Shield,
  Stethoscope,
  User,
  UserCheck,
  X,
  Zap,
} from "lucide-react";
import * as React from "react";
import { cn } from "../utils/cn";
import { formatDate } from "../utils/formatters";
import { Avatar, AvatarFallback, AvatarImage } from "./Avatar";
import { Badge } from "./Badge";
import { Button } from "./Button";

export type NotificationType =
  | "appointment_reminder"
  | "appointment_confirmed"
  | "appointment_cancelled"
  | "appointment_rescheduled"
  | "patient_arrived"
  | "patient_checked_in"
  | "treatment_completed"
  | "document_ready"
  | "consent_required"
  | "emergency_alert"
  | "system_maintenance"
  | "compliance_alert"
  | "staff_message"
  | "general_info";

export type NotificationPriority = "low" | "medium" | "high" | "critical";

export interface NotificationAction {
  id: string;
  label: string;
  variant?: "default" | "outline" | "destructive";
  onClick: () => void;
}

export interface RealTimeNotification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  patientId?: string;
  patientName?: string;
  patientAvatar?: string;
  appointmentId?: string;
  staffId?: string;
  staffName?: string;
  staffAvatar?: string;
  metadata?: Record<string, unknown>;
  actions?: NotificationAction[];
  autoHideAfter?: number; // seconds
  requiresAcknowledgment?: boolean;
  soundEnabled?: boolean;
  lgpdRelevant?: boolean;
}

export interface RealTimeNotificationsProps {
  /**
   * Array of notifications to display
   */
  notifications: RealTimeNotification[];
  /**
   * Maximum number of notifications to show at once
   */
  maxVisible?: number;
  /**
   * Position of notifications on screen
   */
  position?:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "top-center";
  /**
   * Show notification badge/counter
   */
  showBadge?: boolean;
  /**
   * Allow manual dismissal of notifications
   */
  allowDismiss?: boolean;
  /**
   * Global sound enabled state
   */
  soundEnabled?: boolean;
  /**
   * Callback when notification is clicked
   */
  onNotificationClick?: (notification: RealTimeNotification) => void;
  /**
   * Callback when notification is dismissed
   */
  onNotificationDismiss?: (notificationId: string) => void;
  /**
   * Callback when notification action is triggered
   */
  onNotificationAction?: (notificationId: string, actionId: string) => void;
  /**
   * Callback when all notifications are marked as read
   */
  onMarkAllRead?: () => void;
  /**
   * Callback when notifications settings are opened
   */
  onOpenSettings?: () => void;
  /**
   * Show notifications panel (expanded view)
   */
  showPanel?: boolean;
  /**
   * Callback for panel toggle
   */
  onPanelToggle?: () => void;
  /**
   * Additional CSS classes
   */
  className?: string;
}

const notificationIcons: Record<NotificationType, React.ElementType> = {
  appointment_reminder: Clock,
  appointment_confirmed: CheckCircle,
  appointment_cancelled: X,
  appointment_rescheduled: Calendar,
  patient_arrived: User,
  patient_checked_in: UserCheck,
  treatment_completed: Stethoscope,
  document_ready: FileText,
  consent_required: Shield,
  emergency_alert: Zap,
  system_maintenance: Settings,
  compliance_alert: AlertCircle,
  staff_message: MessageSquare,
  general_info: Info,
};

const getPriorityVariant = (priority: NotificationPriority) => {
  switch (priority) {
    case "low": {
      return "confirmed";
    }
    case "medium": {
      return "medium";
    }
    case "high": {
      return "high";
    }
    case "critical": {
      return "urgent";
    }
    default: {
      return "default";
    }
  }
};

const getPriorityColor = (priority: NotificationPriority) => {
  switch (priority) {
    case "low": {
      return "border-green-200 bg-green-50";
    }
    case "medium": {
      return "border-yellow-200 bg-yellow-50";
    }
    case "high": {
      return "border-orange-200 bg-orange-50";
    }
    case "critical": {
      return "border-red-200 bg-red-50";
    }
    default: {
      return "border-gray-200 bg-gray-50";
    }
  }
};

const getTypeLabel = (type: NotificationType): string => {
  const labels: Record<NotificationType, string> = {
    appointment_reminder: "Lembrete de Consulta",
    appointment_confirmed: "Consulta Confirmada",
    appointment_cancelled: "Consulta Cancelada",
    appointment_rescheduled: "Consulta Reagendada",
    patient_arrived: "Paciente Chegou",
    patient_checked_in: "Check-in Realizado",
    treatment_completed: "Tratamento Concluído",
    document_ready: "Documento Disponível",
    consent_required: "Consentimento Necessário",
    emergency_alert: "Alerta de Emergência",
    system_maintenance: "Manutenção do Sistema",
    compliance_alert: "Alerta de Conformidade",
    staff_message: "Mensagem da Equipe",
    general_info: "Informação Geral",
  };
  return labels[type];
};

const NotificationCard: React.FC<{
  notification: RealTimeNotification;
  onDismiss?: (id: string) => void;
  onClick?: (notification: RealTimeNotification) => void;
  onAction?: (notificationId: string, actionId: string) => void;
  allowDismiss?: boolean;
  showAvatar?: boolean;
}> = ({
  notification,
  onDismiss,
  onClick,
  onAction,
  allowDismiss = true,
  showAvatar = true,
}) => {
  const Icon = notificationIcons[notification.type];
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    if (notification.autoHideAfter && notification.autoHideAfter > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onDismiss?.(notification.id), 300);
      }, notification.autoHideAfter * 1000);

      return () => clearTimeout(timer);
    }
  }, [notification.autoHideAfter, notification.id, onDismiss]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
    setTimeout(() => onDismiss?.(notification.id), 300);
  };

  const handleClick = () => {
    onClick?.(notification);
  };

  const handleAction = (actionId: string) => {
    onAction?.(notification.id, actionId);
  };

  return (
    <div
      aria-describedby={`notification-${notification.id}-message`}
      aria-labelledby={`notification-${notification.id}-title`}
      className={cn(
        "cursor-pointer rounded-lg border p-4 shadow-lg transition-all duration-300",
        getPriorityColor(notification.priority),
        !notification.read && "ring-2 ring-primary/20",
        isVisible
          ? "translate-x-0 transform opacity-100"
          : "translate-x-full transform opacity-0",
        onClick && "hover:shadow-xl",
      )}
      onClick={handleClick}
      role="alert"
    >
      <div className="flex items-start gap-3">
        {/* Icon/Avatar */}
        <div className="flex-shrink-0">
          {showAvatar
              && (notification.patientAvatar || notification.staffAvatar)
            ? (
              <Avatar size="sm">
                <AvatarImage
                  alt={notification.patientName || notification.staffName || "User"}
                  src={notification.patientAvatar || notification.staffAvatar}
                />
                <AvatarFallback>
                  {(notification.patientName || notification.staffName || "U")
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
            )
            : (
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full",
                  notification.priority === "critical"
                    && "bg-red-100 text-red-700",
                  notification.priority === "high"
                    && "bg-orange-100 text-orange-700",
                  notification.priority === "medium"
                    && "bg-yellow-100 text-yellow-700",
                  notification.priority === "low"
                    && "bg-green-100 text-green-700",
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
            )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <h4
                  className="truncate font-medium text-sm"
                  id={`notification-${notification.id}-title`}
                >
                  {notification.title}
                </h4>
                <Badge
                  size="sm"
                  variant={getPriorityVariant(notification.priority)}
                >
                  {getTypeLabel(notification.type)}
                </Badge>
              </div>

              <p
                className="text-muted-foreground text-sm"
                id={`notification-${notification.id}-message`}
              >
                {notification.message}
              </p>

              {/* Patient/Staff Info */}
              {(notification.patientName || notification.staffName) && (
                <p className="mt-1 text-muted-foreground text-xs">
                  {notification.patientName
                    && `Paciente: ${notification.patientName}`}
                  {notification.patientName && notification.staffName && " • "}
                  {notification.staffName && `Staff: ${notification.staffName}`}
                </p>
              )}

              {/* LGPD Notice */}
              {notification.lgpdRelevant && (
                <div className="mt-2 flex items-center gap-1">
                  <Shield className="h-3 w-3 text-blue-600" />
                  <span className="text-blue-600 text-xs">
                    Dados protegidos pela LGPD
                  </span>
                </div>
              )}

              {/* Timestamp */}
              <p className="mt-1 text-muted-foreground text-xs">
                {formatDate(notification.timestamp)}
              </p>
            </div>

            {/* Dismiss Button */}
            {allowDismiss && (
              <Button
                aria-label="Dispensar notificação"
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={handleDismiss}
                size="icon"
                variant="ghost"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Actions */}
          {notification.actions && notification.actions.length > 0 && (
            <div className="mt-3 flex gap-2">
              {notification.actions.map((action) => (
                <Button
                  key={action.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAction(action.id);
                  }}
                  size="sm"
                  variant={action.variant || "outline"}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const NotificationBell: React.FC<{
  unreadCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onTogglePanel: () => void;
  onMarkAllRead?: () => void;
  onOpenSettings?: () => void;
}> = ({
  unreadCount,
  soundEnabled,
  onToggleSound,
  onTogglePanel,
  onMarkAllRead,
  onOpenSettings,
}) => {
  return (
    <div className="relative">
      <Button
        aria-label={`Notificações ${unreadCount > 0 ? `(${unreadCount} não lidas)` : ""}`}
        className="relative"
        onClick={onTogglePanel}
        size="icon"
        variant="ghost"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            className="-top-1 -right-1 absolute flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
            size="sm"
            variant="urgent"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Quick Actions */}
      <div className="invisible absolute top-full right-0 z-50 mt-2 w-48 rounded-lg border bg-card p-2 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
        <div className="space-y-1">
          <Button
            className="w-full justify-start"
            onClick={onToggleSound}
            size="sm"
            variant="ghost"
          >
            {soundEnabled
              ? <Bell className="mr-2 h-4 w-4" />
              : <BellOff className="mr-2 h-4 w-4" />}
            {soundEnabled ? "Desativar Som" : "Ativar Som"}
          </Button>

          {onMarkAllRead && unreadCount > 0 && (
            <Button
              className="w-full justify-start"
              onClick={onMarkAllRead}
              size="sm"
              variant="ghost"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Marcar Todas como Lidas
            </Button>
          )}

          {onOpenSettings && (
            <Button
              className="w-full justify-start"
              onClick={onOpenSettings}
              size="sm"
              variant="ghost"
            >
              <Settings className="mr-2 h-4 w-4" />
              Configurações
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export const RealTimeNotifications = React.forwardRef<
  HTMLDivElement,
  RealTimeNotificationsProps
>(
  (
    {
      notifications,
      maxVisible = 5,
      position = "top-right",
      showBadge = true,
      allowDismiss = true,
      soundEnabled = true,
      onNotificationClick,
      onNotificationDismiss,
      onNotificationAction,
      onMarkAllRead,
      onOpenSettings,
      showPanel = false,
      onPanelToggle,
      className,
      ...props
    },
    ref,
  ) => {
    const [localSoundEnabled, setLocalSoundEnabled] = React.useState(soundEnabled);
    const [visibleNotifications, setVisibleNotifications] = React.useState<
      string[]
    >([]);

    const unreadNotifications = notifications.filter((n) => !n.read);
    const { length: unreadCount } = unreadNotifications;

    const positionClasses = {
      "top-right": "top-4 right-4",
      "top-left": "top-4 left-4",
      "bottom-right": "bottom-4 right-4",
      "bottom-left": "bottom-4 left-4",
      "top-center": "top-4 left-1/2 transform -translate-x-1/2",
    };

    // Handle new notifications
    React.useEffect(() => {
      const newNotifications = notifications.filter(
        (n) => !(visibleNotifications.includes(n.id) || n.read),
      );

      if (newNotifications.length > 0) {
        const newIds = newNotifications.slice(0, maxVisible).map((n) => n.id);
        setVisibleNotifications((prev) => [...prev, ...newIds].slice(-maxVisible));

        // Play sound for critical notifications if enabled
        if (localSoundEnabled) {
          const criticalNotifications = newNotifications.filter(
            (n) => n.priority === "critical",
          );
          if (criticalNotifications.length > 0) {
          }
        }
      }
    }, [notifications, visibleNotifications, maxVisible, localSoundEnabled]);

    const handleToggleSound = () => {
      setLocalSoundEnabled(!localSoundEnabled);
    };

    const handleDismiss = (notificationId: string) => {
      setVisibleNotifications((prev) => prev.filter((id) => id !== notificationId));
      onNotificationDismiss?.(notificationId);
    };

    const displayedNotifications = notifications
      .filter((n) => visibleNotifications.includes(n.id))
      .slice(0, maxVisible);

    return (
      <>
        {/* Notification Bell/Badge */}
        {showBadge && (
          <div className="group relative">
            <NotificationBell
              onMarkAllRead={onMarkAllRead}
              onOpenSettings={onOpenSettings}
              onTogglePanel={onPanelToggle || (() => {})}
              onToggleSound={handleToggleSound}
              soundEnabled={localSoundEnabled}
              unreadCount={unreadCount}
            />
          </div>
        )}

        {/* Notification Panel */}
        {showPanel && (
          <div
            className={cn(
              "fixed inset-y-0 right-0 z-50 w-96 transform border-l bg-card shadow-xl transition-transform",
              showPanel ? "translate-x-0" : "translate-x-full",
            )}
          >
            <div className="flex items-center justify-between border-b p-4">
              <h3 className="font-semibold">Notificações</h3>
              <Button onClick={onPanelToggle} size="icon" variant="ghost">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="h-full space-y-3 overflow-y-auto p-4">
              {notifications.length === 0
                ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <Bell className="mx-auto mb-4 h-12 w-12 opacity-50" />
                    <p>Nenhuma notificação</p>
                  </div>
                )
                : (
                  notifications.map((notification) => (
                    <NotificationCard
                      allowDismiss={allowDismiss}
                      key={notification.id}
                      notification={notification}
                      onAction={onNotificationAction}
                      onClick={onNotificationClick}
                      onDismiss={handleDismiss}
                      showAvatar
                    />
                  ))
                )}
            </div>
          </div>
        )}

        {/* Floating Notifications */}
        <div
          className={cn(
            "pointer-events-none fixed z-40",
            positionClasses[position],
            className,
          )}
          ref={ref}
          {...props}
        >
          <div className="pointer-events-auto max-w-sm space-y-3">
            {displayedNotifications.map((notification) => (
              <NotificationCard
                allowDismiss={allowDismiss}
                key={notification.id}
                notification={notification}
                onAction={onNotificationAction}
                onClick={onNotificationClick}
                onDismiss={handleDismiss}
                showAvatar={false}
              />
            ))}
          </div>
        </div>
      </>
    );
  },
);

RealTimeNotifications.displayName = "RealTimeNotifications";

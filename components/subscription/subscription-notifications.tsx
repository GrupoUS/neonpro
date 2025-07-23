/**
 * Subscription Notification System
 *
 * Centralized notification system for subscription-related events.
 * Handles toast notifications, alerts, and status updates.
 *
 * @author NeonPro Development Team
 * @version 1.0.0
 */

"use client";

import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertTriangle, Bell, CheckCircle2, Info, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useSubscriptionStatus } from "../../hooks/use-subscription-status";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";

export interface SubscriptionNotificationProps {
  className?: string;
  position?: "top" | "bottom";
  autoHide?: boolean;
  hideAfter?: number; // milliseconds
  showProgress?: boolean;
}

export function SubscriptionNotificationProvider({
  className,
  position = "top",
  autoHide = false,
  hideAfter = 10000,
  showProgress = true,
}: SubscriptionNotificationProps) {
  const { toast } = useToast();
  const {
    status,
    tier,
    gracePeriodEnd,
    nextBilling,
    isLoading,
    error,
    events,
  } = useSubscriptionStatus({
    onStatusChange: (newStatus, previousStatus) => {
      if (previousStatus && newStatus !== previousStatus) {
        handleStatusChange(newStatus, previousStatus);
      }
    },
    onError: (errorMessage) => {
      toast({
        title: "Erro na Assinatura",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const [notifications, setNotifications] = useState<
    Array<{
      id: string;
      type: "success" | "warning" | "error" | "info";
      title: string;
      description: string;
      action?: {
        label: string;
        onClick: () => void;
      };
      timestamp: Date;
      dismissed?: boolean;
    }>
  >([]);

  // Handle status changes
  const handleStatusChange = (newStatus: string, previousStatus: string) => {
    const statusMessages = {
      active: {
        type: "success" as const,
        title: "Assinatura Ativada",
        description:
          "Sua assinatura está ativa e todas as funcionalidades estão disponíveis.",
      },
      trialing: {
        type: "info" as const,
        title: "Período de Teste Iniciado",
        description:
          "Aproveite todas as funcionalidades durante seu período de teste.",
      },
      past_due: {
        type: "warning" as const,
        title: "Pagamento Pendente",
        description: "Atualize sua forma de pagamento para manter o acesso.",
        action: {
          label: "Atualizar Pagamento",
          onClick: () => console.log("Navigate to billing"),
        },
      },
      cancelled: {
        type: "error" as const,
        title: "Assinatura Cancelada",
        description: "Suas funcionalidades premium foram desabilitadas.",
        action: {
          label: "Reativar",
          onClick: () => console.log("Navigate to reactivate"),
        },
      },
      incomplete: {
        type: "error" as const,
        title: "Pagamento Incompleto",
        description: "Complete seu pagamento para ativar sua assinatura.",
        action: {
          label: "Completar Pagamento",
          onClick: () => console.log("Navigate to complete payment"),
        },
      },
    };

    const message = statusMessages[newStatus as keyof typeof statusMessages];

    if (message) {
      addNotification(message);

      // Also show toast for immediate feedback
      toast({
        title: message.title,
        description: message.description,
        variant:
          message.type === "success"
            ? "default"
            : message.type === "error"
              ? "destructive"
              : "default",
      });
    }
  };

  // Add notification to queue
  const addNotification = (
    notification: Omit<(typeof notifications)[0], "id" | "timestamp">
  ) => {
    const newNotification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    };

    setNotifications((prev) => [newNotification, ...prev.slice(0, 4)]); // Keep max 5 notifications

    if (autoHide) {
      setTimeout(() => {
        dismissNotification(newNotification.id);
      }, hideAfter);
    }
  };

  // Dismiss notification
  const dismissNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, dismissed: true }
          : notification
      )
    );

    // Remove after animation
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 300);
  };

  // Check for upcoming renewals/expirations
  useEffect(() => {
    if (status === "trialing" && gracePeriodEnd) {
      const daysUntilExpiration = Math.ceil(
        (new Date(gracePeriodEnd).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      );

      if (daysUntilExpiration <= 3 && daysUntilExpiration > 0) {
        addNotification({
          type: "warning",
          title: "Período de Teste Expirando",
          description: `Seu período de teste expira em ${daysUntilExpiration} ${daysUntilExpiration === 1 ? "dia" : "dias"}.`,
          action: {
            label: "Assinar Agora",
            onClick: () => console.log("Navigate to subscription"),
          },
        });
      }
    }

    if (status === "active" && nextBilling) {
      const daysUntilBilling = Math.ceil(
        (new Date(nextBilling).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      );

      if (daysUntilBilling <= 7 && daysUntilBilling > 0) {
        addNotification({
          type: "info",
          title: "Cobrança Próxima",
          description: `Sua próxima cobrança será em ${daysUntilBilling} ${daysUntilBilling === 1 ? "dia" : "dias"}.`,
        });
      }
    }
  }, [status, gracePeriodEnd, nextBilling]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case "error":
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case "info":
        return <Info className="h-5 w-5 text-blue-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationStyles = (type: string) => {
    switch (type) {
      case "success":
        return "border-green-200 bg-green-50";
      case "warning":
        return "border-orange-200 bg-orange-50";
      case "error":
        return "border-red-200 bg-red-50";
      case "info":
        return "border-blue-200 bg-blue-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  return (
    <div
      className={cn(
        "fixed z-50 w-full max-w-md space-y-2",
        position === "top" ? "top-4 right-4" : "bottom-4 right-4",
        className
      )}
    >
      {notifications
        .filter((notification) => !notification.dismissed)
        .map((notification) => (
          <div
            key={notification.id}
            className={cn(
              "transform transition-all duration-300 ease-in-out",
              "translate-x-0 opacity-100",
              notification.dismissed && "translate-x-full opacity-0"
            )}
          >
            <Alert
              className={cn(
                "shadow-lg border-l-4",
                getNotificationStyles(notification.type)
              )}
            >
              <div className="flex items-start gap-3">
                {getNotificationIcon(notification.type)}
                <div className="flex-1 min-w-0">
                  <AlertTitle className="text-sm font-medium">
                    {notification.title}
                  </AlertTitle>
                  <AlertDescription className="text-sm text-muted-foreground mt-1">
                    {notification.description}
                  </AlertDescription>

                  {notification.action && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={notification.action.onClick}
                    >
                      {notification.action.label}
                    </Button>
                  )}

                  <div className="text-xs text-muted-foreground mt-2">
                    {formatDistanceToNow(notification.timestamp, {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-transparent"
                  onClick={() => dismissNotification(notification.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {showProgress && autoHide && (
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div
                      className="bg-current h-1 rounded-full transition-all animate-pulse"
                      style={{
                        width: "100%",
                        animation: `shrink ${hideAfter}ms linear`,
                      }}
                    />
                  </div>
                </div>
              )}
            </Alert>
          </div>
        ))}
    </div>
  );
}

// Persistent notification for critical subscription issues
export function SubscriptionAlert() {
  const { status, gracePeriodEnd, isLoading } = useSubscriptionStatus();

  if (isLoading || status === "active") {
    return null;
  }

  const getAlertContent = () => {
    switch (status) {
      case "past_due":
        return {
          variant: "destructive" as const,
          title: "Pagamento em Atraso",
          description: gracePeriodEnd
            ? `Atualize sua forma de pagamento. Acesso expira ${formatDistanceToNow(new Date(gracePeriodEnd), { addSuffix: true, locale: ptBR })}.`
            : "Atualize sua forma de pagamento para manter o acesso.",
          action: "Atualizar Pagamento",
        };
      case "cancelled":
      case "canceled":
        return {
          variant: "destructive" as const,
          title: "Assinatura Cancelada",
          description:
            "Sua assinatura foi cancelada. Reative para continuar usando as funcionalidades premium.",
          action: "Reativar Assinatura",
        };
      case "incomplete":
        return {
          variant: "destructive" as const,
          title: "Pagamento Incompleto",
          description:
            "Complete seu pagamento para ativar sua assinatura e acessar todas as funcionalidades.",
          action: "Completar Pagamento",
        };
      default:
        return null;
    }
  };

  const alertContent = getAlertContent();

  if (!alertContent) {
    return null;
  }

  return (
    <Alert variant={alertContent.variant} className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>{alertContent.title}</AlertTitle>
      <AlertDescription className="mt-2 flex items-center justify-between">
        <span>{alertContent.description}</span>
        <Button variant="outline" size="sm" className="ml-4">
          {alertContent.action}
        </Button>
      </AlertDescription>
    </Alert>
  );
}

// CSS for progress bar animation
const styles = `
  @keyframes shrink {
    from { width: 100%; }
    to { width: 0%; }
  }
`;

// Inject styles
if (
  typeof document !== "undefined" &&
  !document.getElementById("subscription-notification-styles")
) {
  const styleSheet = document.createElement("style");
  styleSheet.id = "subscription-notification-styles";
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

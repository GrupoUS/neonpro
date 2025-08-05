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
"use strict";
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionNotificationProvider = SubscriptionNotificationProvider;
exports.SubscriptionAlert = SubscriptionAlert;
var utils_1 = require("@/lib/utils");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var use_subscription_status_1 = require("../../hooks/use-subscription-status");
var alert_1 = require("../ui/alert");
var button_1 = require("../ui/button");
var use_toast_1 = require("../ui/use-toast");
function SubscriptionNotificationProvider(_a) {
  var className = _a.className,
    _b = _a.position,
    position = _b === void 0 ? "top" : _b,
    _c = _a.autoHide,
    autoHide = _c === void 0 ? false : _c,
    _d = _a.hideAfter,
    hideAfter = _d === void 0 ? 10000 : _d,
    _e = _a.showProgress,
    showProgress = _e === void 0 ? true : _e;
  var toast = (0, use_toast_1.useToast)().toast;
  var _f = (0, use_subscription_status_1.useSubscriptionStatus)({
      onStatusChange: function (newStatus, previousStatus) {
        if (previousStatus && newStatus !== previousStatus) {
          handleStatusChange(newStatus, previousStatus);
        }
      },
      onError: function (errorMessage) {
        toast({
          title: "Erro na Assinatura",
          description: errorMessage,
          variant: "destructive",
        });
      },
    }),
    status = _f.status,
    tier = _f.tier,
    gracePeriodEnd = _f.gracePeriodEnd,
    nextBilling = _f.nextBilling,
    isLoading = _f.isLoading,
    error = _f.error,
    events = _f.events;
  var _g = (0, react_1.useState)([]),
    notifications = _g[0],
    setNotifications = _g[1];
  // Handle status changes
  var handleStatusChange = function (newStatus, previousStatus) {
    var statusMessages = {
      active: {
        type: "success",
        title: "Assinatura Ativada",
        description: "Sua assinatura está ativa e todas as funcionalidades estão disponíveis.",
      },
      trialing: {
        type: "info",
        title: "Período de Teste Iniciado",
        description: "Aproveite todas as funcionalidades durante seu período de teste.",
      },
      past_due: {
        type: "warning",
        title: "Pagamento Pendente",
        description: "Atualize sua forma de pagamento para manter o acesso.",
        action: {
          label: "Atualizar Pagamento",
          onClick: function () {
            return console.log("Navigate to billing");
          },
        },
      },
      cancelled: {
        type: "error",
        title: "Assinatura Cancelada",
        description: "Suas funcionalidades premium foram desabilitadas.",
        action: {
          label: "Reativar",
          onClick: function () {
            return console.log("Navigate to reactivate");
          },
        },
      },
      incomplete: {
        type: "error",
        title: "Pagamento Incompleto",
        description: "Complete seu pagamento para ativar sua assinatura.",
        action: {
          label: "Completar Pagamento",
          onClick: function () {
            return console.log("Navigate to complete payment");
          },
        },
      },
    };
    var message = statusMessages[newStatus];
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
  var addNotification = function (notification) {
    var newNotification = __assign(__assign({}, notification), {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    });
    setNotifications(function (prev) {
      return __spreadArray([newNotification], prev.slice(0, 4), true);
    }); // Keep max 5 notifications
    if (autoHide) {
      setTimeout(function () {
        dismissNotification(newNotification.id);
      }, hideAfter);
    }
  };
  // Dismiss notification
  var dismissNotification = function (id) {
    setNotifications(function (prev) {
      return prev.map(function (notification) {
        return notification.id === id
          ? __assign(__assign({}, notification), { dismissed: true })
          : notification;
      });
    });
    // Remove after animation
    setTimeout(function () {
      setNotifications(function (prev) {
        return prev.filter(function (n) {
          return n.id !== id;
        });
      });
    }, 300);
  };
  // Check for upcoming renewals/expirations
  (0, react_1.useEffect)(
    function () {
      if (status === "trialing" && gracePeriodEnd) {
        var daysUntilExpiration = Math.ceil(
          (new Date(gracePeriodEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
        );
        if (daysUntilExpiration <= 3 && daysUntilExpiration > 0) {
          addNotification({
            type: "warning",
            title: "Período de Teste Expirando",
            description: "Seu per\u00EDodo de teste expira em "
              .concat(daysUntilExpiration, " ")
              .concat(daysUntilExpiration === 1 ? "dia" : "dias", "."),
            action: {
              label: "Assinar Agora",
              onClick: function () {
                return console.log("Navigate to subscription");
              },
            },
          });
        }
      }
      if (status === "active" && nextBilling) {
        var daysUntilBilling = Math.ceil(
          (new Date(nextBilling).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
        );
        if (daysUntilBilling <= 7 && daysUntilBilling > 0) {
          addNotification({
            type: "info",
            title: "Cobrança Próxima",
            description: "Sua pr\u00F3xima cobran\u00E7a ser\u00E1 em "
              .concat(daysUntilBilling, " ")
              .concat(daysUntilBilling === 1 ? "dia" : "dias", "."),
          });
        }
      }
    },
    [status, gracePeriodEnd, nextBilling],
  );
  var getNotificationIcon = function (type) {
    switch (type) {
      case "success":
        return <lucide_react_1.CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "warning":
        return <lucide_react_1.AlertTriangle className="h-5 w-5 text-orange-600" />;
      case "error":
        return <lucide_react_1.AlertTriangle className="h-5 w-5 text-red-600" />;
      case "info":
        return <lucide_react_1.Info className="h-5 w-5 text-blue-600" />;
      default:
        return <lucide_react_1.Bell className="h-5 w-5 text-gray-600" />;
    }
  };
  var getNotificationStyles = function (type) {
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
      className={(0, utils_1.cn)(
        "fixed z-50 w-full max-w-md space-y-2",
        position === "top" ? "top-4 right-4" : "bottom-4 right-4",
        className,
      )}
    >
      {notifications
        .filter(function (notification) {
          return !notification.dismissed;
        })
        .map(function (notification) {
          return (
            <div
              key={notification.id}
              className={(0, utils_1.cn)(
                "transform transition-all duration-300 ease-in-out",
                "translate-x-0 opacity-100",
                notification.dismissed && "translate-x-full opacity-0",
              )}
            >
              <alert_1.Alert
                className={(0, utils_1.cn)(
                  "shadow-lg border-l-4",
                  getNotificationStyles(notification.type),
                )}
              >
                <div className="flex items-start gap-3">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1 min-w-0">
                    <alert_1.AlertTitle className="text-sm font-medium">
                      {notification.title}
                    </alert_1.AlertTitle>
                    <alert_1.AlertDescription className="text-sm text-muted-foreground mt-1">
                      {notification.description}
                    </alert_1.AlertDescription>

                    {notification.action && (
                      <button_1.Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={notification.action.onClick}
                      >
                        {notification.action.label}
                      </button_1.Button>
                    )}

                    <div className="text-xs text-muted-foreground mt-2">
                      {(0, date_fns_1.formatDistanceToNow)(notification.timestamp, {
                        addSuffix: true,
                        locale: locale_1.ptBR,
                      })}
                    </div>
                  </div>

                  <button_1.Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-transparent"
                    onClick={function () {
                      return dismissNotification(notification.id);
                    }}
                  >
                    <lucide_react_1.X className="h-4 w-4" />
                  </button_1.Button>
                </div>

                {showProgress && autoHide && (
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div
                        className="bg-current h-1 rounded-full transition-all animate-pulse"
                        style={{
                          width: "100%",
                          animation: "shrink ".concat(hideAfter, "ms linear"),
                        }}
                      />
                    </div>
                  </div>
                )}
              </alert_1.Alert>
            </div>
          );
        })}
    </div>
  );
}
// Persistent notification for critical subscription issues
function SubscriptionAlert() {
  var _a = (0, use_subscription_status_1.useSubscriptionStatus)(),
    status = _a.status,
    gracePeriodEnd = _a.gracePeriodEnd,
    isLoading = _a.isLoading;
  if (isLoading || status === "active") {
    return null;
  }
  var getAlertContent = function () {
    switch (status) {
      case "past_due":
        return {
          variant: "destructive",
          title: "Pagamento em Atraso",
          description: gracePeriodEnd
            ? "Atualize sua forma de pagamento. Acesso expira ".concat(
                (0, date_fns_1.formatDistanceToNow)(new Date(gracePeriodEnd), {
                  addSuffix: true,
                  locale: locale_1.ptBR,
                }),
                ".",
              )
            : "Atualize sua forma de pagamento para manter o acesso.",
          action: "Atualizar Pagamento",
        };
      case "cancelled":
      case "canceled":
        return {
          variant: "destructive",
          title: "Assinatura Cancelada",
          description:
            "Sua assinatura foi cancelada. Reative para continuar usando as funcionalidades premium.",
          action: "Reativar Assinatura",
        };
      case "incomplete":
        return {
          variant: "destructive",
          title: "Pagamento Incompleto",
          description:
            "Complete seu pagamento para ativar sua assinatura e acessar todas as funcionalidades.",
          action: "Completar Pagamento",
        };
      default:
        return null;
    }
  };
  var alertContent = getAlertContent();
  if (!alertContent) {
    return null;
  }
  return (
    <alert_1.Alert variant={alertContent.variant} className="mb-6">
      <lucide_react_1.AlertTriangle className="h-4 w-4" />
      <alert_1.AlertTitle>{alertContent.title}</alert_1.AlertTitle>
      <alert_1.AlertDescription className="mt-2 flex items-center justify-between">
        <span>{alertContent.description}</span>
        <button_1.Button variant="outline" size="sm" className="ml-4">
          {alertContent.action}
        </button_1.Button>
      </alert_1.AlertDescription>
    </alert_1.Alert>
  );
}
// CSS for progress bar animation
var styles = "\n  @keyframes shrink {\n    from { width: 100%; }\n    to { width: 0%; }\n  }\n";
// Inject styles
if (
  typeof document !== "undefined" &&
  !document.getElementById("subscription-notification-styles")
) {
  var styleSheet = document.createElement("style");
  styleSheet.id = "subscription-notification-styles";
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

"use client";
"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationCenter = NotificationCenter;
var react_1 = require("react");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var scroll_area_1 = require("@/components/ui/scroll-area");
var separator_1 = require("@/components/ui/separator");
var popover_1 = require("@/components/ui/popover");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
var notification_context_1 = require("@/contexts/notification-context");
var notificationIcons = {
  appointment_confirmed: lucide_react_1.Calendar,
  appointment_cancelled: lucide_react_1.AlertTriangle,
  appointment_reminder: lucide_react_1.Clock,
  appointment_rescheduled: lucide_react_1.Calendar,
  system: lucide_react_1.Info,
  marketing: lucide_react_1.Gift,
};
var notificationColors = {
  appointment_confirmed: "text-green-600",
  appointment_cancelled: "text-red-600",
  appointment_reminder: "text-blue-600",
  appointment_rescheduled: "text-yellow-600",
  system: "text-gray-600",
  marketing: "text-purple-600",
};
function NotificationItem(_a) {
  var notification = _a.notification,
    onRead = _a.onRead,
    onDelete = _a.onDelete,
    _b = _a.compact,
    compact = _b === void 0 ? false : _b;
  var Icon = notificationIcons[notification.type] || lucide_react_1.Bell;
  var isRead = !!notification.read_at;
  var isExpired = notification.expires_at && new Date(notification.expires_at) < new Date();
  var handleClick = function () {
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
      className={(0, utils_1.cn)(
        "flex items-start space-x-3 p-3 rounded-lg cursor-pointer transition-colors",
        isRead ? "opacity-60" : "bg-primary/5 hover:bg-primary/10",
        isExpired && "opacity-40",
        compact ? "p-2" : "p-3",
      )}
      onClick={handleClick}
    >
      {/* Icon */}
      <div className={(0, utils_1.cn)("mt-0.5", notificationColors[notification.type])}>
        <Icon className={(0, utils_1.cn)(compact ? "h-4 w-4" : "h-5 w-5")} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h4
              className={(0, utils_1.cn)(
                "font-medium truncate",
                compact ? "text-sm" : "text-base",
                !isRead && "text-foreground",
                isRead && "text-muted-foreground",
              )}
            >
              {notification.title}
            </h4>

            <p
              className={(0, utils_1.cn)(
                "text-muted-foreground mt-1",
                compact ? "text-xs" : "text-sm",
                compact ? "line-clamp-1" : "line-clamp-2",
              )}
            >
              {notification.message}
            </p>

            <div className="flex items-center space-x-2 mt-2">
              <time
                className={(0, utils_1.cn)(
                  "text-muted-foreground",
                  compact ? "text-xs" : "text-xs",
                )}
              >
                {(0, date_fns_1.format)(new Date(notification.created_at), "dd/MM HH:mm", {
                  locale: locale_1.pt,
                })}
              </time>

              {notification.priority === "high" && (
                <badge_1.Badge
                  variant="destructive"
                  className={(0, utils_1.cn)(compact ? "text-xs px-1" : "text-xs")}
                >
                  Urgente
                </badge_1.Badge>
              )}

              {isExpired && (
                <badge_1.Badge
                  variant="outline"
                  className={(0, utils_1.cn)(compact ? "text-xs px-1" : "text-xs")}
                >
                  Expirado
                </badge_1.Badge>
              )}
            </div>
          </div>

          {/* Actions */}
          {!compact && (
            <dropdown_menu_1.DropdownMenu>
              <dropdown_menu_1.DropdownMenuTrigger asChild>
                <button_1.Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <lucide_react_1.MoreVertical className="h-3 w-3" />
                </button_1.Button>
              </dropdown_menu_1.DropdownMenuTrigger>
              <dropdown_menu_1.DropdownMenuContent align="end">
                {!isRead && (
                  <dropdown_menu_1.DropdownMenuItem
                    onClick={function (e) {
                      e.stopPropagation();
                      onRead(notification.id);
                    }}
                  >
                    <lucide_react_1.Check className="h-4 w-4 mr-2" />
                    Marcar como lida
                  </dropdown_menu_1.DropdownMenuItem>
                )}
                <dropdown_menu_1.DropdownMenuItem
                  onClick={function (e) {
                    e.stopPropagation();
                    onDelete(notification.id);
                  }}
                  className="text-red-600"
                >
                  <lucide_react_1.Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </dropdown_menu_1.DropdownMenuItem>
              </dropdown_menu_1.DropdownMenuContent>
            </dropdown_menu_1.DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
}
function NotificationCenter(_a) {
  var _this = this;
  var className = _a.className,
    _b = _a.variant,
    variant = _b === void 0 ? "popover" : _b,
    _c = _a.maxHeight,
    maxHeight = _c === void 0 ? "400px" : _c;
  var _d = (0, react_1.useState)("all"),
    filterType = _d[0],
    setFilterType = _d[1];
  var _e = (0, react_1.useState)(false),
    showOnlyUnread = _e[0],
    setShowOnlyUnread = _e[1];
  var _f = (0, notification_context_1.useNotificationContext)(),
    notifications = _f.notifications,
    unreadCount = _f.unreadCount,
    isLoading = _f.isLoading,
    error = _f.error,
    markAsRead = _f.markAsRead,
    markAllAsRead = _f.markAllAsRead,
    deleteNotification = _f.deleteNotification,
    refreshNotifications = _f.refreshNotifications,
    getNotificationsByType = _f.getNotificationsByType,
    getUnreadNotifications = _f.getUnreadNotifications;
  // Filter notifications
  var filteredNotifications = (function () {
    var filtered = notifications;
    if (showOnlyUnread) {
      filtered = getUnreadNotifications();
    }
    if (filterType !== "all") {
      filtered = filtered.filter(function (notif) {
        return notif.type === filterType;
      });
    }
    return filtered;
  })();
  var isEmpty = filteredNotifications.length === 0;
  var hasUnread = unreadCount > 0;
  var handleMarkAllRead = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, markAllAsRead()];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_1 = _a.sent();
            console.error("Error marking all notifications as read:", error_1);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  var handleRefresh = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, refreshNotifications()];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_2 = _a.sent();
            console.error("Error refreshing notifications:", error_2);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  var NotificationList = function () {
    return (
      <div className="space-y-1">
        {isLoading
          ? <div className="flex justify-center p-4">
              <lucide_react_1.RefreshCw className="h-4 w-4 animate-spin" />
            </div>
          : error
            ? <div className="text-center p-4 text-red-600">
                <p className="text-sm">{error}</p>
                <button_1.Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  className="mt-2"
                >
                  Tentar novamente
                </button_1.Button>
              </div>
            : isEmpty
              ? <div className="text-center p-6">
                  <lucide_react_1.Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {showOnlyUnread ? "Nenhuma notificação não lida" : "Nenhuma notificação"}
                  </p>
                </div>
              : <scroll_area_1.ScrollArea className={"".concat(maxHeight)}>
                  {filteredNotifications.map(function (notification, index) {
                    return (
                      <div key={notification.id}>
                        <NotificationItem
                          notification={notification}
                          onRead={markAsRead}
                          onDelete={deleteNotification}
                          compact={variant === "popover"}
                        />
                        {index < filteredNotifications.length - 1 && (
                          <separator_1.Separator className="my-1" />
                        )}
                      </div>
                    );
                  })}
                </scroll_area_1.ScrollArea>}
      </div>
    );
  };
  if (variant === "popover") {
    return (
      <popover_1.Popover>
        <popover_1.PopoverTrigger asChild>
          <button_1.Button
            variant="ghost"
            size="sm"
            className={(0, utils_1.cn)("relative", className)}
          >
            {hasUnread
              ? <lucide_react_1.BellRing className="h-4 w-4" />
              : <lucide_react_1.Bell className="h-4 w-4" />}
            {hasUnread && (
              <badge_1.Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </badge_1.Badge>
            )}
          </button_1.Button>
        </popover_1.PopoverTrigger>

        <popover_1.PopoverContent className="w-80 p-0" align="end">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Notificações</h3>
              <div className="flex items-center space-x-1">
                {hasUnread && (
                  <button_1.Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
                    <lucide_react_1.CheckCheck className="h-4 w-4" />
                  </button_1.Button>
                )}
                <button_1.Button variant="ghost" size="sm" onClick={handleRefresh}>
                  <lucide_react_1.RefreshCw className="h-4 w-4" />
                </button_1.Button>
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
        </popover_1.PopoverContent>
      </popover_1.Popover>
    );
  }
  // Page variant
  return (
    <card_1.Card className={className}>
      <card_1.CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.Bell className="h-5 w-5" />
              Central de Notificações
            </card_1.CardTitle>
            {hasUnread && (
              <p className="text-sm text-muted-foreground mt-1">
                {unreadCount} não lida{unreadCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <dropdown_menu_1.DropdownMenu>
              <dropdown_menu_1.DropdownMenuTrigger asChild>
                <button_1.Button variant="outline" size="sm">
                  <lucide_react_1.Filter className="h-4 w-4 mr-2" />
                  Filtros
                </button_1.Button>
              </dropdown_menu_1.DropdownMenuTrigger>
              <dropdown_menu_1.DropdownMenuContent>
                <dropdown_menu_1.DropdownMenuLabel>
                  Tipo de notificação
                </dropdown_menu_1.DropdownMenuLabel>
                <dropdown_menu_1.DropdownMenuItem
                  onClick={function () {
                    return setFilterType("all");
                  }}
                >
                  Todas
                </dropdown_menu_1.DropdownMenuItem>
                <dropdown_menu_1.DropdownMenuItem
                  onClick={function () {
                    return setFilterType("appointment_confirmed");
                  }}
                >
                  Confirmações
                </dropdown_menu_1.DropdownMenuItem>
                <dropdown_menu_1.DropdownMenuItem
                  onClick={function () {
                    return setFilterType("appointment_reminder");
                  }}
                >
                  Lembretes
                </dropdown_menu_1.DropdownMenuItem>
                <dropdown_menu_1.DropdownMenuItem
                  onClick={function () {
                    return setFilterType("appointment_cancelled");
                  }}
                >
                  Cancelamentos
                </dropdown_menu_1.DropdownMenuItem>
                <dropdown_menu_1.DropdownMenuSeparator />
                <dropdown_menu_1.DropdownMenuItem
                  onClick={function () {
                    return setShowOnlyUnread(!showOnlyUnread);
                  }}
                >
                  {showOnlyUnread ? "Mostrar todas" : "Apenas não lidas"}
                </dropdown_menu_1.DropdownMenuItem>
              </dropdown_menu_1.DropdownMenuContent>
            </dropdown_menu_1.DropdownMenu>

            {hasUnread && (
              <button_1.Button size="sm" onClick={handleMarkAllRead}>
                <lucide_react_1.CheckCheck className="h-4 w-4 mr-2" />
                Marcar todas como lidas
              </button_1.Button>
            )}
          </div>
        </div>
      </card_1.CardHeader>

      <card_1.CardContent className="p-0">
        <NotificationList />
      </card_1.CardContent>
    </card_1.Card>
  );
}

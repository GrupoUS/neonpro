/**
 * NotificationDashboard Component
 *
 * Dashboard principal para gerenciamento de notificações
 * com analytics, envios e configurações.
 *
 * @author APEX UI/UX Team
 * @version 1.0.0
 * @compliance WCAG 2.1 AA, LGPD
 */
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
exports.NotificationDashboard = NotificationDashboard;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var tabs_1 = require("@/components/ui/tabs");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var icons_1 = require("@/components/ui/icons");
var use_toast_1 = require("@/hooks/use-toast");
var notification_sender_1 = require("./notification-sender");
var notification_history_1 = require("./notification-history");
var notification_analytics_1 = require("./notification-analytics");
var notification_settings_1 = require("./notification-settings");
// ================================================================================
// COMPONENT
// ================================================================================
function NotificationDashboard() {
  var _this = this;
  var _a = (0, react_1.useState)("overview"),
    activeTab = _a[0],
    setActiveTab = _a[1];
  var _b = (0, react_1.useState)(null),
    stats = _b[0],
    setStats = _b[1];
  var _c = (0, react_1.useState)([]),
    recentNotifications = _c[0],
    setRecentNotifications = _c[1];
  var _d = (0, react_1.useState)(true),
    loading = _d[0],
    setLoading = _d[1];
  var toast = (0, use_toast_1.useToast)().toast;
  // ================================================================================
  // EFFECTS
  // ================================================================================
  (0, react_1.useEffect)(function () {
    loadDashboardData();
  }, []);
  // ================================================================================
  // DATA LOADING
  // ================================================================================
  var loadDashboardData = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var _a, statsResponse, historyResponse, statsData, historyData, error_1;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 6, 7, 8]);
            setLoading(true);
            return [
              4 /*yield*/,
              Promise.all([
                fetch("/api/notifications/analytics?metric=overview&period=week"),
                fetch("/api/notifications/status?limit=5"),
              ]),
            ];
          case 1:
            (_a = _b.sent()), (statsResponse = _a[0]), (historyResponse = _a[1]);
            if (!statsResponse.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, statsResponse.json()];
          case 2:
            statsData = _b.sent();
            setStats(statsData.data);
            _b.label = 3;
          case 3:
            if (!historyResponse.ok) return [3 /*break*/, 5];
            return [4 /*yield*/, historyResponse.json()];
          case 4:
            historyData = _b.sent();
            setRecentNotifications(historyData.notifications || []);
            _b.label = 5;
          case 5:
            return [3 /*break*/, 8];
          case 6:
            error_1 = _b.sent();
            console.error("Erro ao carregar dashboard:", error_1);
            toast({
              title: "Erro",
              description: "Falha ao carregar dados do dashboard",
              variant: "destructive",
            });
            return [3 /*break*/, 8];
          case 7:
            setLoading(false);
            return [7 /*endfinally*/];
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  // ================================================================================
  // RENDER HELPERS
  // ================================================================================
  var renderOverviewCards = function () {
    return <div className />;
  };
  "grid gap-4 md:grid-cols-2 lg:grid-cols-4\">
        < card_1.Card >
        <card_1.CardHeader className/>
  "flex flex-row items-center justify-between space-y-0 pb-2\">
        < card_1.CardTitle
  className =
  "text-sm font-medium\">Total Enviadas</CardTitle>
        < icons_1.Icons.Send
  className =
  "h-4 w-4 text-muted-foreground\" />;
    card_1.CardHeader >
        (<card_1.CardContent>
          <div className/>\"text-2xl font-bold\">{(stats === null || stats === void 0 ? void 0 : stats.total) || 0}</div>
            ,
                <p className/>)
  "text-xs text-muted-foreground\">
        + 12 % em
  relação
  ao;
  período;
  anterior;
  p >
    ;
  card_1.CardContent >
    ;
  card_1.Card >
  (
    <card_1.Card>
      <card_1.CardHeader className />
      \"flex flex-row items-center justify-between space-y-0 pb-2\">
      <card_1.CardTitle className />
      \"text-sm font-medium\">Taxa de Entrega
    </card_1.CardTitle>
  ),
    (<icons_1.Icons.CheckCircle className />);
  "h-4 w-4 text-muted-foreground\" />;
    card_1.CardHeader >
        (<card_1.CardContent>
          <div className/>\"text-2xl font-bold\">{(stats === null || stats === void 0 ? void 0 : stats.deliveryRate) || 0}%</div>
            ,
                <p className/>)
  "text-xs text-muted-foreground\">
        + 2.1 % em
  relação
  ao;
  período;
  anterior;
  p >
    ;
  card_1.CardContent >
    ;
  card_1.Card >
  (
    <card_1.Card>
      <card_1.CardHeader className />
      \"flex flex-row items-center justify-between space-y-0 pb-2\">
      <card_1.CardTitle className />
      \"text-sm font-medium\">Engajamento
    </card_1.CardTitle>
  ),
    (<icons_1.Icons.Users className />);
  "h-4 w-4 text-muted-foreground\" />;
    card_1.CardHeader >
        (<card_1.CardContent>
          <div className/>\"text-2xl font-bold\">{(stats === null || stats === void 0 ? void 0 : stats.engagementRate) || 0}%</div>
            ,
                <p className/>)
  "text-xs text-muted-foreground\">
        + 5.4 % em
  relação
  ao;
  período;
  anterior;
  p >
    ;
  card_1.CardContent >
    ;
  card_1.Card >
  (
    <card_1.Card>
      <card_1.CardHeader className />
      \"flex flex-row items-center justify-between space-y-0 pb-2\">
      <card_1.CardTitle className />
      \"text-sm font-medium\">Pendentes
    </card_1.CardTitle>
  ),
    (<icons_1.Icons.Clock className />);
  "h-4 w-4 text-muted-foreground\" />;
    card_1.CardHeader >
        (<card_1.CardContent>
          <div className/>\"text-2xl font-bold\">{(stats === null || stats === void 0 ? void 0 : stats.pending) || 0}</div>
            ,
                <p className/>)
  "text-xs text-muted-foreground\">;
  {
    (stats === null || stats === void 0 ? void 0 : stats.failed) || 0;
  }
  falharam;
  p >
    ;
  card_1.CardContent >
    ;
  card_1.Card >
    ;
  div >
    ;
  var renderRecentNotifications = function () {
    return (
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Notificações Recentes</card_1.CardTitle>
          <card_1.CardDescription>Últimas 5 notificações enviadas</card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className />
          \"space-y-4\">
          {recentNotifications.map(function (notification) {
            return <div key={notification.id} className />;
          })}
          \"flex items-center justify-between space-x-4\" >
          <div className />
          \"flex-1 space-y-1\">
          <p className />
          \"text-sm font-medium leading-none\">
          {notification.title}
        </p>
        <p className />
        \"text-sm text-muted-foreground\">
        {notification.type} • {notification.recipientCount} destinatários
      </p>
    );
  };
  div > <div className />;
  "flex items-center space-x-2\">
        < div
  className =
  "flex space-x-1\">;
  {
    notification.channels.map(function (channel) { return (<badge_1.Badge key={channel} variant/>); }, "outline\" className=\"text-xs\">, { channel: channel }, badge_1.Badge >
        );
  }
  div >
  (
    <badge_1.Badge
      variant={
        notification.status === "delivered"
          ? "default"
          : notification.status === "sent"
            ? "secondary"
            : notification.status === "pending"
              ? "outline"
              : "destructive"
      }
    >
      {notification.status}
    </badge_1.Badge>
  );
  div >
    ;
  div >
    ;
}
div >
;
card_1.CardContent >
;
card_1.Card >
;
var renderQuickActions = function () {
  return (
    (
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Ações Rápidas</card_1.CardTitle>
          <card_1.CardDescription>
            Ações comuns para gerenciamento de notificações
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent className />
        \"space-y-4\">
        <button_1.Button className />
        \"w-full justify-start\" variant=\"outline\" onClick={function () {
          return setActiveTab("send");
        }}
        >
        <icons_1.Icons.Send className />
        \"mr-2 h-4 w-4\" /> Enviar Notificação
      </button_1.Button>
    ),
    (<button_1.Button className />)
  );
};
"w-full justify-start\" ;
variant =
"outline\";
onClick =
{
}
();
setActiveTab("analytics");
>
        <icons_1.Icons.BarChart className/>
"mr-2 h-4 w-4\" />;
Ver
Analytics
button_1.Button > <button_1.Button className />;
"w-full justify-start\" ;
variant =
"outline\";
onClick =
{
}
();
setActiveTab("settings");
>
        <icons_1.Icons.Settings className/>
"mr-2 h-4 w-4\" />;
Configurações
button_1.Button >
card_1.CardContent >
;
card_1.Card >
;
// ================================================================================
// MAIN RENDER
// ================================================================================
if (loading) {
  return (<div className/>);
  "flex items-center justify-center h-64\">
        < icons_1.Icons.Loader2
  className =
  "h-8 w-8 animate-spin\" />;
    div >
}
return (<div className/>);
"space-y-6\">;
{
  /* Header */
}
<div className />;
"flex items-center justify-between\">
    < div >
    <h2 className/>
"text-3xl font-bold tracking-tight\">Sistema de Notificações</h2>
    < p
className =
"text-muted-foreground\">;
Gerencie
e
monitore;
todas;
da;
clínica;
p >
;
div > <button_1.Button onClick={loadDashboardData} variant />;
"outline\" size=\"sm\">
    < icons_1.Icons.RefreshCw
className =
"mr-2 h-4 w-4\" />;
Atualizar
button_1.Button >
div >
  {
    /* Main Content */
  } <
  tabs_1.Tabs;
value = { activeTab: activeTab };
onValueChange = { setActiveTab: setActiveTab };
className = ;
"space-y-4\">
    < tabs_1.TabsList
className =
"grid w-full grid-cols-5\">
    < tabs_1.TabsTrigger
value =
"overview\">Visão Geral</TabsTrigger>
    < tabs_1.TabsTrigger
value =
"send\">Enviar</TabsTrigger>
    < tabs_1.TabsTrigger
value =
"history\">Histórico</TabsTrigger>
    < tabs_1.TabsTrigger
value =
"analytics\">Analytics</TabsTrigger>
    < tabs_1.TabsTrigger
value =
"settings\">Configurações</TabsTrigger>;
tabs_1.TabsList >
    <tabs_1.TabsContent value/>
"overview\" className=\"space-y-4\">;
{
  renderOverviewCards();
}
<div className />;
"grid gap-4 md:grid-cols-2 lg:grid-cols-7\">
    < div
className =
"col-span-4\">;
{
  renderRecentNotifications();
}
div > <div className />;
"col-span-3\">;
{
  renderQuickActions();
}
div >
;
div >
;
tabs_1.TabsContent > <tabs_1.TabsContent value />;
"send\">
    < notification_sender_1.NotificationSender
onNotificationSent =
{
  loadDashboardData: loadDashboardData;
}
/  >;
tabs_1.TabsContent > <tabs_1.TabsContent value />;
"history\">
    < notification_history_1.NotificationHistory /  >
tabs_1.TabsContent > <tabs_1.TabsContent value />
"analytics\">
    < notification_analytics_1.NotificationAnalytics /  >
tabs_1.TabsContent > <tabs_1.TabsContent value />
"settings\">
    < notification_settings_1.NotificationSettings /  >
tabs_1.TabsContent >
tabs_1.Tabs >
;
div >
;

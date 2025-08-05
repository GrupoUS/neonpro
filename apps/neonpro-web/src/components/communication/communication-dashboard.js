"use client";
var __awaiter =
  (this && this.__awaiter) ||
  ((thisArg, _arguments, P, generator) => {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P((resolve) => {
            resolve(value);
          });
    }
    return new (P || (P = Promise))((resolve, reject) => {
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
  });
var __generator =
  (this && this.__generator) ||
  ((thisArg, body) => {
    var _ = {
        label: 0,
        sent: () => {
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
      return (v) => step([n, v]);
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
  });
var __spreadArray =
  (this && this.__spreadArray) ||
  ((to, from, pack) => {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunicationDashboard = CommunicationDashboard;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var tabs_1 = require("@/components/ui/tabs");
var progress_1 = require("@/components/ui/progress");
var staff_chat_1 = require("./staff-chat");
var consent_manager_1 = require("./consent-manager");
var template_manager_1 = require("./template-manager");
var client_1 = require("@/lib/supabase/client");
var use_toast_1 = require("@/hooks/use-toast");
var utils_1 = require("@/lib/utils");
function CommunicationDashboard(_a) {
  var _b;
  var userId = _a.userId,
    clinicId = _a.clinicId,
    className = _a.className;
  var _c = (0, react_1.useState)({
      totalConversations: 0,
      activeConversations: 0,
      messagesSentToday: 0,
      messagesReceivedToday: 0,
      emailsToday: 0,
      smsToday: 0,
      pushToday: 0,
      consentRate: 0,
      responseRate: 0,
    }),
    stats = _c[0],
    setStats = _c[1];
  var _d = (0, react_1.useState)([]),
    conversations = _d[0],
    setConversations = _d[1];
  var _e = (0, react_1.useState)([]),
    templates = _e[0],
    setTemplates = _e[1];
  var _f = (0, react_1.useState)([]),
    consents = _f[0],
    setConsents = _f[1];
  var _g = (0, react_1.useState)([]),
    notifications = _g[0],
    setNotifications = _g[1];
  var _h = (0, react_1.useState)(null),
    selectedConversation = _h[0],
    setSelectedConversation = _h[1];
  var _j = (0, react_1.useState)("overview"),
    activeTab = _j[0],
    setActiveTab = _j[1];
  var _k = (0, react_1.useState)(true),
    loading = _k[0],
    setLoading = _k[1];
  var toast = (0, use_toast_1.useToast)().toast;
  var supabase = (0, client_1.createClient)();
  // Carregar dados do dashboard
  (0, react_1.useEffect)(() => {
    loadDashboardData();
    // Configurar updates em tempo real
    var conversationChannel = supabase
      .channel("dashboard-conversations")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "communication_conversations" },
        () => loadConversations(),
      )
      .subscribe();
    var messageChannel = supabase
      .channel("dashboard-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "communication_messages" },
        () => loadStats(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(conversationChannel);
      supabase.removeChannel(messageChannel);
    };
  }, [clinicId]);
  var loadDashboardData = () =>
    __awaiter(this, void 0, void 0, function () {
      var error_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            setLoading(true);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            return [
              4 /*yield*/,
              Promise.all([
                loadStats(),
                loadConversations(),
                loadTemplates(),
                loadConsents(),
                loadNotifications(),
              ]),
            ];
          case 2:
            _a.sent();
            return [3 /*break*/, 5];
          case 3:
            error_1 = _a.sent();
            toast({
              title: "Erro ao carregar dashboard",
              description: error_1 instanceof Error ? error_1.message : "Erro desconhecido",
              variant: "destructive",
            });
            return [3 /*break*/, 5];
          case 4:
            setLoading(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  var loadStats = () =>
    __awaiter(this, void 0, void 0, function () {
      var today,
        _a,
        conversationsData,
        messagesData,
        notificationsData,
        consentsData,
        conversations_1,
        messages,
        notifications_1,
        consents_1,
        messagesSent,
        messagesReceived,
        emailsToday,
        smsToday,
        pushToday,
        totalConsents,
        consentedCount,
        consentRate,
        error_2;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            today = new Date().toISOString().split("T")[0];
            return [
              4 /*yield*/,
              Promise.all([
                supabase
                  .from("communication_conversations")
                  .select("id, status")
                  .eq("clinic_id", clinicId),
                supabase
                  .from("communication_messages")
                  .select("id, sender_id, created_at")
                  .gte("created_at", "".concat(today, "T00:00:00.000Z"))
                  .lt("created_at", "".concat(today, "T23:59:59.999Z")),
                supabase
                  .from("communication_notifications")
                  .select("id, type, sent_at")
                  .eq("clinic_id", clinicId)
                  .gte("created_at", "".concat(today, "T00:00:00.000Z"))
                  .lt("created_at", "".concat(today, "T23:59:59.999Z")),
                supabase.from("communication_consents").select("id, consent_type, consented"),
              ]),
            ];
          case 1:
            (_a = _b.sent()),
              (conversationsData = _a[0]),
              (messagesData = _a[1]),
              (notificationsData = _a[2]),
              (consentsData = _a[3]);
            if (
              conversationsData.error ||
              messagesData.error ||
              notificationsData.error ||
              consentsData.error
            ) {
              throw new Error("Erro ao carregar estatísticas");
            }
            conversations_1 = conversationsData.data || [];
            messages = messagesData.data || [];
            notifications_1 = notificationsData.data || [];
            consents_1 = consentsData.data || [];
            messagesSent = messages.filter((m) => m.sender_id === userId).length;
            messagesReceived = messages.length - messagesSent;
            emailsToday = notifications_1.filter((n) => n.type === "email" && n.sent_at).length;
            smsToday = notifications_1.filter((n) => n.type === "sms" && n.sent_at).length;
            pushToday = notifications_1.filter((n) => n.type === "push" && n.sent_at).length;
            totalConsents = consents_1.length;
            consentedCount = consents_1.filter((c) => c.consented).length;
            consentRate = totalConsents > 0 ? (consentedCount / totalConsents) * 100 : 0;
            setStats({
              totalConversations: conversations_1.length,
              activeConversations: conversations_1.filter((c) => c.status === "active").length,
              messagesSentToday: messagesSent,
              messagesReceivedToday: messagesReceived,
              emailsToday: emailsToday,
              smsToday: smsToday,
              pushToday: pushToday,
              consentRate: Math.round(consentRate),
              responseRate: 85, // TODO: Calcular taxa de resposta real
            });
            return [3 /*break*/, 3];
          case 2:
            error_2 = _b.sent();
            console.error("Erro ao carregar estatísticas:", error_2);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  var loadConversations = () =>
    __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_3;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              supabase
                .from("communication_conversations")
                .select(
                  "\n          *,\n          patient:patients(id, name, email),\n          last_message:communication_messages(content, created_at, sender_id)\n        ",
                )
                .eq("clinic_id", clinicId)
                .order("updated_at", { ascending: false })
                .limit(20),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            setConversations(data || []);
            return [3 /*break*/, 3];
          case 2:
            error_3 = _b.sent();
            console.error("Erro ao carregar conversas:", error_3);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  var loadTemplates = () =>
    __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_4;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              supabase
                .from("communication_templates")
                .select("*")
                .eq("clinic_id", clinicId)
                .order("created_at", { ascending: false }),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            setTemplates(data || []);
            return [3 /*break*/, 3];
          case 2:
            error_4 = _b.sent();
            console.error("Erro ao carregar templates:", error_4);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  var loadConsents = () =>
    __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_5;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              supabase
                .from("communication_consents")
                .select("*")
                .order("created_at", { ascending: false }),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            setConsents(data || []);
            return [3 /*break*/, 3];
          case 2:
            error_5 = _b.sent();
            console.error("Erro ao carregar consentimentos:", error_5);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  var loadNotifications = () =>
    __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_6;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              supabase
                .from("communication_notifications")
                .select("*")
                .eq("clinic_id", clinicId)
                .order("created_at", { ascending: false })
                .limit(50),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            setNotifications(data || []);
            return [3 /*break*/, 3];
          case 2:
            error_6 = _b.sent();
            console.error("Erro ao carregar notificações:", error_6);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  // Renderizar cards de estatísticas
  var StatCard = (_a) => {
    var title = _a.title,
      value = _a.value,
      icon = _a.icon,
      change = _a.change,
      _b = _a.changeType,
      changeType = _b === void 0 ? "neutral" : _b;
    return (
      <card_1.Card>
        <card_1.CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold">{value}</h3>
                {change && (
                  <badge_1.Badge
                    variant={
                      changeType === "positive"
                        ? "default"
                        : changeType === "negative"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {change}
                  </badge_1.Badge>
                )}
              </div>
            </div>
            <div className="text-muted-foreground">{icon}</div>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    );
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  return (
    <div className={(0, utils_1.cn)("space-y-6", className)}>
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard de Comunicação</h1>
        <p className="text-muted-foreground">
          Gerencie todas as comunicações da clínica em um só lugar
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Conversas Ativas"
          value={stats.activeConversations}
          icon={<lucide_react_1.MessageSquare className="w-5 h-5" />}
          change="+12%"
          changeType="positive"
        />
        <StatCard
          title="Mensagens Hoje"
          value={stats.messagesSentToday + stats.messagesReceivedToday}
          icon={<lucide_react_1.Send className="w-5 h-5" />}
          change="+8%"
          changeType="positive"
        />
        <StatCard
          title="Taxa de Consentimento"
          value={"".concat(stats.consentRate, "%")}
          icon={<lucide_react_1.CheckCircle className="w-5 h-5" />}
          change="+3%"
          changeType="positive"
        />
        <StatCard
          title="Taxa de Resposta"
          value={"".concat(stats.responseRate, "%")}
          icon={<lucide_react_1.TrendingUp className="w-5 h-5" />}
          change="+5%"
          changeType="positive"
        />
      </div>

      {/* Tabs principais */}
      <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <tabs_1.TabsList className="grid w-full grid-cols-5">
          <tabs_1.TabsTrigger value="overview">Visão Geral</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="conversations">Conversas</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="templates">Templates</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="consents">Consentimentos</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="analytics">Analytics</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="overview" className="space-y-6">
          {/* Resumo de atividades */}
          <div className="grid gap-4 md:grid-cols-3">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.Mail className="w-5 h-5" />
                  Emails Hoje
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-2xl font-bold">{stats.emailsToday}</div>
                <progress_1.Progress value={65} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">65% da meta diária</p>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.Smartphone className="w-5 h-5" />
                  SMS Hoje
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-2xl font-bold">{stats.smsToday}</div>
                <progress_1.Progress value={80} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">80% da meta diária</p>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.Bell className="w-5 h-5" />
                  Push Hoje
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-2xl font-bold">{stats.pushToday}</div>
                <progress_1.Progress value={45} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">45% da meta diária</p>
              </card_1.CardContent>
            </card_1.Card>
          </div>

          {/* Conversas recentes */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Conversas Recentes</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                {conversations.slice(0, 5).map((conversation) => {
                  var _a, _b, _c;
                  return (
                    <div
                      key={conversation.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                          <lucide_react_1.Users className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {((_a = conversation.patient) === null || _a === void 0
                              ? void 0
                              : _a.name) || "Paciente não identificado"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {((_c =
                              (_b = conversation.last_message) === null || _b === void 0
                                ? void 0
                                : _b.content) === null || _c === void 0
                              ? void 0
                              : _c.substring(0, 50)) || "Sem mensagens"}
                            ...
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <badge_1.Badge
                          variant={conversation.status === "active" ? "default" : "secondary"}
                        >
                          {conversation.status}
                        </badge_1.Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {conversation.updated_at}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="conversations">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Lista de conversas */}
            <card_1.Card className="lg:col-span-1">
              <card_1.CardHeader>
                <card_1.CardTitle>Conversas Ativas</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-2">
                {conversations.map((conversation) => {
                  var _a, _b;
                  return (
                    <button_1.Button
                      key={conversation.id}
                      variant={selectedConversation === conversation.id ? "default" : "ghost"}
                      className="w-full justify-start h-auto p-3"
                      onClick={() => setSelectedConversation(conversation.id)}
                    >
                      <div className="text-left">
                        <p className="font-medium">
                          {((_a = conversation.patient) === null || _a === void 0
                            ? void 0
                            : _a.name) || "Paciente não identificado"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {((_b = conversation.last_message) === null || _b === void 0
                            ? void 0
                            : _b.content) || "Sem mensagens"}
                        </p>
                      </div>
                    </button_1.Button>
                  );
                })}
              </card_1.CardContent>
            </card_1.Card>

            {/* Chat */}
            <div className="lg:col-span-2">
              {selectedConversation
                ? <staff_chat_1.StaffChat
                    conversationId={selectedConversation}
                    userId={userId}
                    patientContext={
                      (_b = conversations.find((c) => c.id === selectedConversation)) === null ||
                      _b === void 0
                        ? void 0
                        : _b.patient
                    }
                  />
                : <card_1.Card className="h-[600px] flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <lucide_react_1.MessageSquare className="w-12 h-12 mx-auto mb-4" />
                      <p>Selecione uma conversa para começar</p>
                    </div>
                  </card_1.Card>}
            </div>
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="templates">
          <template_manager_1.TemplateManager
            templates={templates}
            onTemplateUpdate={(template) => {
              setTemplates((prev) => {
                var index = prev.findIndex((t) => t.id === template.id);
                if (index >= 0) {
                  var updated = __spreadArray([], prev, true);
                  updated[index] = template;
                  return updated;
                } else {
                  return __spreadArray(__spreadArray([], prev, true), [template], false);
                }
              });
            }}
            onTemplateDelete={(templateId) => {
              setTemplates((prev) => prev.filter((t) => t.id !== templateId));
            }}
          />
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="consents">
          <consent_manager_1.ConsentManager
            patientId={userId} // TODO: Implementar seleção de paciente
            consents={consents}
            onConsentUpdate={(consent) => {
              setConsents((prev) => {
                var index = prev.findIndex((c) => c.id === consent.id);
                if (index >= 0) {
                  var updated = __spreadArray([], prev, true);
                  updated[index] = consent;
                  return updated;
                } else {
                  return __spreadArray(__spreadArray([], prev, true), [consent], false);
                }
              });
            }}
          />
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="analytics">
          <div className="grid gap-6">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Analytics de Comunicação</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <lucide_react_1.TrendingUp className="w-12 h-12 mx-auto mb-4" />
                  <p>Relatórios detalhados em desenvolvimento</p>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>
  );
}

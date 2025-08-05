/**
 * Session Dashboard Component
 * Story 1.4: Session Management & Security
 *
 * Comprehensive dashboard for session management, security monitoring,
 * and device tracking with real-time updates.
 */
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SessionDashboard;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var tabs_1 = require("@/components/ui/tabs");
var alert_1 = require("@/components/ui/alert");
var progress_1 = require("@/components/ui/progress");
var lucide_react_1 = require("lucide-react");
var useSession_1 = require("@/hooks/useSession");
var session_1 = require("@/types/session");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================
function SessionDashboard() {
  var _a = (0, useSession_1.useSession)(),
    session = _a.session,
    isLoading = _a.isLoading,
    securityEvents = _a.securityEvents,
    devices = _a.devices,
    analytics = _a.analytics,
    terminateSession = _a.terminateSession,
    terminateAllSessions = _a.terminateAllSessions,
    refreshSession = _a.refreshSession,
    reportSuspiciousActivity = _a.reportSuspiciousActivity,
    trustDevice = _a.trustDevice,
    blockDevice = _a.blockDevice,
    error = _a.error;
  var _b = (0, react_1.useState)("overview"),
    activeTab = _b[0],
    setActiveTab = _b[1];
  var _c = (0, react_1.useState)(false),
    showSensitiveData = _c[0],
    setShowSensitiveData = _c[1];
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <lucide_react_1.RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando dados da sessão...</span>
      </div>
    );
  }
  if (!session) {
    return (
      <alert_1.Alert>
        <lucide_react_1.AlertTriangle className="h-4 w-4" />
        <alert_1.AlertTitle>Sessão não encontrada</alert_1.AlertTitle>
        <alert_1.AlertDescription>
          Não foi possível carregar os dados da sessão atual.
        </alert_1.AlertDescription>
      </alert_1.Alert>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Sessão</h1>
          <p className="text-muted-foreground">
            Monitore e gerencie suas sessões ativas e configurações de segurança
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button_1.Button
            variant="outline"
            size="sm"
            onClick={refreshSession}
            disabled={isLoading}
          >
            <lucide_react_1.RefreshCw
              className={"h-4 w-4 mr-2 ".concat(isLoading ? "animate-spin" : "")}
            />
            Atualizar
          </button_1.Button>
          <button_1.Button
            variant="destructive"
            size="sm"
            onClick={() => terminateSession("user_logout")}
          >
            <lucide_react_1.LogOut className="h-4 w-4 mr-2" />
            Encerrar Sessão
          </button_1.Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <alert_1.Alert variant="destructive">
          <lucide_react_1.AlertTriangle className="h-4 w-4" />
          <alert_1.AlertTitle>Erro</alert_1.AlertTitle>
          <alert_1.AlertDescription>{error}</alert_1.AlertDescription>
        </alert_1.Alert>
      )}

      {/* Security Score Alert */}
      {session.security_score < 50 && (
        <alert_1.Alert variant="destructive">
          <lucide_react_1.Shield className="h-4 w-4" />
          <alert_1.AlertTitle>Alerta de Segurança</alert_1.AlertTitle>
          <alert_1.AlertDescription>
            Sua pontuação de segurança está baixa ({session.security_score}/100). Verifique as
            atividades suspeitas e considere encerrar outras sessões.
          </alert_1.AlertDescription>
        </alert_1.Alert>
      )}

      {/* Main Content */}
      <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <tabs_1.TabsList>
          <tabs_1.TabsTrigger value="overview">Visão Geral</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="security">Segurança</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="devices">Dispositivos</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="analytics">Análises</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        {/* Overview Tab */}
        <tabs_1.TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <SessionStatusCard session={session} />
            <SecurityScoreCard score={session.security_score} />
            <ActiveDevicesCard devices={devices} />
            <SecurityEventsCard events={securityEvents} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <CurrentSessionCard
              session={session}
              showSensitiveData={showSensitiveData}
              onToggleSensitiveData={() => setShowSensitiveData(!showSensitiveData)}
            />
            <RecentSecurityEventsCard
              events={securityEvents.slice(0, 5)}
              onReportActivity={reportSuspiciousActivity}
            />
          </div>
        </tabs_1.TabsContent>

        {/* Security Tab */}
        <tabs_1.TabsContent value="security" className="space-y-4">
          <SecurityEventsTable
            events={securityEvents}
            onReportActivity={reportSuspiciousActivity}
          />
        </tabs_1.TabsContent>

        {/* Devices Tab */}
        <tabs_1.TabsContent value="devices" className="space-y-4">
          <DeviceManagementTable
            devices={devices}
            currentDeviceFingerprint={session.device_fingerprint}
            onTrustDevice={trustDevice}
            onBlockDevice={blockDevice}
          />
        </tabs_1.TabsContent>

        {/* Analytics Tab */}
        <tabs_1.TabsContent value="analytics" className="space-y-4">
          {analytics && <SessionAnalyticsCards analytics={analytics} />}
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>
  );
}
// ============================================================================
// OVERVIEW CARDS
// ============================================================================
function SessionStatusCard(_a) {
  var session = _a.session;
  var timeRemaining = new Date(session.expires_at).getTime() - Date.now();
  var totalTime = new Date(session.expires_at).getTime() - new Date(session.created_at).getTime();
  var progressPercentage = Math.max(0, (timeRemaining / totalTime) * 100);
  return (
    <card_1.Card>
      <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <card_1.CardTitle className="text-sm font-medium">Status da Sessão</card_1.CardTitle>
        <lucide_react_1.Clock className="h-4 w-4 text-muted-foreground" />
      </card_1.CardHeader>
      <card_1.CardContent>
        <div className="text-2xl font-bold">{session.is_active ? "Ativa" : "Inativa"}</div>
        <div className="space-y-2 mt-2">
          <div className="flex justify-between text-sm">
            <span>Tempo restante:</span>
            <span>
              {(0, date_fns_1.formatDistanceToNow)(new Date(session.expires_at), {
                locale: locale_1.ptBR,
              })}
            </span>
          </div>
          <progress_1.Progress value={progressPercentage} className="h-2" />
        </div>
      </card_1.CardContent>
    </card_1.Card>
  );
}
function SecurityScoreCard(_a) {
  var score = _a.score;
  var getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };
  var getScoreIcon = (score) => {
    if (score >= 80) return <lucide_react_1.Shield className="h-4 w-4 text-green-600" />;
    if (score >= 60) return <lucide_react_1.AlertTriangle className="h-4 w-4 text-yellow-600" />;
    return <lucide_react_1.XCircle className="h-4 w-4 text-red-600" />;
  };
  return (
    <card_1.Card>
      <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <card_1.CardTitle className="text-sm font-medium">Pontuação de Segurança</card_1.CardTitle>
        {getScoreIcon(score)}
      </card_1.CardHeader>
      <card_1.CardContent>
        <div className={"text-2xl font-bold ".concat(getScoreColor(score))}>{score}/100</div>
        <p className="text-xs text-muted-foreground mt-1">
          {score >= 80 ? "Excelente" : score >= 60 ? "Boa" : "Requer atenção"}
        </p>
      </card_1.CardContent>
    </card_1.Card>
  );
}
function ActiveDevicesCard(_a) {
  var devices = _a.devices;
  var activeDevices = devices.filter((d) => !d.blocked);
  var trustedDevices = activeDevices.filter((d) => d.trusted);
  return (
    <card_1.Card>
      <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <card_1.CardTitle className="text-sm font-medium">Dispositivos</card_1.CardTitle>
        <lucide_react_1.Smartphone className="h-4 w-4 text-muted-foreground" />
      </card_1.CardHeader>
      <card_1.CardContent>
        <div className="text-2xl font-bold">{activeDevices.length}</div>
        <p className="text-xs text-muted-foreground">{trustedDevices.length} confiáveis</p>
      </card_1.CardContent>
    </card_1.Card>
  );
}
function SecurityEventsCard(_a) {
  var events = _a.events;
  var unresolvedEvents = events.filter((e) => !e.resolved);
  var criticalEvents = unresolvedEvents.filter((e) => e.severity === "critical");
  return (
    <card_1.Card>
      <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <card_1.CardTitle className="text-sm font-medium">Eventos de Segurança</card_1.CardTitle>
        <lucide_react_1.AlertTriangle className="h-4 w-4 text-muted-foreground" />
      </card_1.CardHeader>
      <card_1.CardContent>
        <div className="text-2xl font-bold">{unresolvedEvents.length}</div>
        <p className="text-xs text-muted-foreground">{criticalEvents.length} críticos</p>
      </card_1.CardContent>
    </card_1.Card>
  );
}
// ============================================================================
// DETAILED CARDS
// ============================================================================
function CurrentSessionCard(_a) {
  var session = _a.session,
    showSensitiveData = _a.showSensitiveData,
    onToggleSensitiveData = _a.onToggleSensitiveData;
  var maskData = (data) => {
    if (showSensitiveData) return data;
    return data.replace(/./g, "•");
  };
  return (
    <card_1.Card>
      <card_1.CardHeader>
        <div className="flex items-center justify-between">
          <card_1.CardTitle>Sessão Atual</card_1.CardTitle>
          <button_1.Button variant="ghost" size="sm" onClick={onToggleSensitiveData}>
            {showSensitiveData
              ? <lucide_react_1.EyeOff className="h-4 w-4" />
              : <lucide_react_1.Eye className="h-4 w-4" />}
          </button_1.Button>
        </div>
      </card_1.CardHeader>
      <card_1.CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">ID da Sessão:</span>
            <p className="text-muted-foreground font-mono">{maskData(session.id)}</p>
          </div>
          <div>
            <span className="font-medium">Dispositivo:</span>
            <p className="text-muted-foreground">{session.device_name || "Desconhecido"}</p>
          </div>
          <div>
            <span className="font-medium">IP:</span>
            <p className="text-muted-foreground font-mono">{maskData(session.ip_address)}</p>
          </div>
          <div>
            <span className="font-medium">Localização:</span>
            <p className="text-muted-foreground">
              {session.location
                ? "".concat(session.location.city, ", ").concat(session.location.country)
                : "Desconhecida"}
            </p>
          </div>
          <div>
            <span className="font-medium">Criada em:</span>
            <p className="text-muted-foreground">
              {(0, date_fns_1.format)(new Date(session.created_at), "dd/MM/yyyy HH:mm", {
                locale: locale_1.ptBR,
              })}
            </p>
          </div>
          <div>
            <span className="font-medium">Última atividade:</span>
            <p className="text-muted-foreground">
              {(0, date_fns_1.formatDistanceToNow)(new Date(session.last_activity), {
                addSuffix: true,
                locale: locale_1.ptBR,
              })}
            </p>
          </div>
        </div>
      </card_1.CardContent>
    </card_1.Card>
  );
}
function RecentSecurityEventsCard(_a) {
  var events = _a.events,
    onReportActivity = _a.onReportActivity;
  var getSeverityBadge = (severity) => {
    var variants = {
      low: "secondary",
      medium: "default",
      high: "destructive",
      critical: "destructive",
    };
    return (
      <badge_1.Badge variant={variants[severity] || "default"}>
        {severity.toUpperCase()}
      </badge_1.Badge>
    );
  };
  var getEventTypeLabel = (eventType) => {
    var _a;
    var labels =
      ((_a = {}),
      (_a[session_1.SecurityEventType.UNUSUAL_LOCATION] = "Localização Incomum"),
      (_a[session_1.SecurityEventType.DEVICE_CHANGE] = "Mudança de Dispositivo"),
      (_a[session_1.SecurityEventType.RAPID_REQUESTS] = "Requisições Rápidas"),
      (_a[session_1.SecurityEventType.SESSION_HIJACK_ATTEMPT] = "Tentativa de Sequestro"),
      (_a[session_1.SecurityEventType.SUSPICIOUS_USER_AGENT] = "User Agent Suspeito"),
      (_a[session_1.SecurityEventType.CONCURRENT_SESSION_LIMIT] = "Limite de Sessões"),
      (_a[session_1.SecurityEventType.FAILED_AUTHENTICATION] = "Falha na Autenticação"),
      (_a[session_1.SecurityEventType.PRIVILEGE_ESCALATION] = "Escalação de Privilégios"),
      _a);
    return labels[eventType] || eventType;
  };
  return (
    <card_1.Card>
      <card_1.CardHeader>
        <div className="flex items-center justify-between">
          <card_1.CardTitle>Eventos de Segurança Recentes</card_1.CardTitle>
          <button_1.Button
            variant="outline"
            size="sm"
            onClick={() =>
              onReportActivity(session_1.SecurityEventType.SUSPICIOUS_USER_AGENT, {
                manual_report: true,
                description: "Atividade suspeita reportada pelo usuário",
              })
            }
          >
            <lucide_react_1.AlertTriangle className="h-4 w-4 mr-2" />
            Reportar
          </button_1.Button>
        </div>
      </card_1.CardHeader>
      <card_1.CardContent>
        {events.length === 0
          ? <p className="text-muted-foreground text-center py-4">
              Nenhum evento de segurança recente
            </p>
          : <div className="space-y-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{getEventTypeLabel(event.event_type)}</span>
                      {getSeverityBadge(event.severity)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {(0, date_fns_1.formatDistanceToNow)(new Date(event.timestamp), {
                        addSuffix: true,
                        locale: locale_1.ptBR,
                      })}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {event.resolved
                      ? <lucide_react_1.CheckCircle className="h-4 w-4 text-green-600" />
                      : <lucide_react_1.XCircle className="h-4 w-4 text-red-600" />}
                  </div>
                </div>
              ))}
            </div>}
      </card_1.CardContent>
    </card_1.Card>
  );
}

/**
 * Session Dashboard Component
 * Story 1.4: Session Management & Security
 *
 * Comprehensive dashboard for session management, security monitoring,
 * and device tracking with real-time updates.
 */

"use client";

import React, { useState, useEffect } from "react";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Progress } from "@/components/ui/progress";
import type {
  Shield,
  Monitor,
  Smartphone,
  AlertTriangle,
  Clock,
  MapPin,
  Activity,
  Users,
  Lock,
  Unlock,
  X,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  RefreshCw,
  LogOut,
  Settings,
} from "lucide-react";
import type { useSession, useSecurityEvents } from "@/hooks/useSession";
import type {
  UserSession,
  SessionSecurityEvent,
  DeviceRegistration,
  SecurityEventType,
  SecuritySeverity,
  DeviceType,
} from "@/types/session";
import type { formatDistanceToNow, format } from "date-fns";
import type { ptBR } from "date-fns/locale";

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================

export default function SessionDashboard() {
  const {
    session,
    isLoading,
    securityEvents,
    devices,
    analytics,
    terminateSession,
    terminateAllSessions,
    refreshSession,
    reportSuspiciousActivity,
    trustDevice,
    blockDevice,
    error,
  } = useSession();

  const [activeTab, setActiveTab] = useState("overview");
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando dados da sessão...</span>
      </div>
    );
  }

  if (!session) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Sessão não encontrada</AlertTitle>
        <AlertDescription>Não foi possível carregar os dados da sessão atual.</AlertDescription>
      </Alert>
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
          <Button variant="outline" size="sm" onClick={refreshSession} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          <Button variant="destructive" size="sm" onClick={() => terminateSession("user_logout")}>
            <LogOut className="h-4 w-4 mr-2" />
            Encerrar Sessão
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Security Score Alert */}
      {session.security_score < 50 && (
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertTitle>Alerta de Segurança</AlertTitle>
          <AlertDescription>
            Sua pontuação de segurança está baixa ({session.security_score}/100). Verifique as
            atividades suspeitas e considere encerrar outras sessões.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="devices">Dispositivos</TabsTrigger>
          <TabsTrigger value="analytics">Análises</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
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
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <SecurityEventsTable
            events={securityEvents}
            onReportActivity={reportSuspiciousActivity}
          />
        </TabsContent>

        {/* Devices Tab */}
        <TabsContent value="devices" className="space-y-4">
          <DeviceManagementTable
            devices={devices}
            currentDeviceFingerprint={session.device_fingerprint}
            onTrustDevice={trustDevice}
            onBlockDevice={blockDevice}
          />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          {analytics && <SessionAnalyticsCards analytics={analytics} />}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================================
// OVERVIEW CARDS
// ============================================================================

function SessionStatusCard({ session }: { session: UserSession }) {
  const timeRemaining = new Date(session.expires_at).getTime() - Date.now();
  const totalTime = new Date(session.expires_at).getTime() - new Date(session.created_at).getTime();
  const progressPercentage = Math.max(0, (timeRemaining / totalTime) * 100);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Status da Sessão</CardTitle>
        <Clock className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{session.is_active ? "Ativa" : "Inativa"}</div>
        <div className="space-y-2 mt-2">
          <div className="flex justify-between text-sm">
            <span>Tempo restante:</span>
            <span>{formatDistanceToNow(new Date(session.expires_at), { locale: ptBR })}</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}

function SecurityScoreCard({ score }: { score: number }) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <Shield className="h-4 w-4 text-green-600" />;
    if (score >= 60) return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Pontuação de Segurança</CardTitle>
        {getScoreIcon(score)}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}/100</div>
        <p className="text-xs text-muted-foreground mt-1">
          {score >= 80 ? "Excelente" : score >= 60 ? "Boa" : "Requer atenção"}
        </p>
      </CardContent>
    </Card>
  );
}

function ActiveDevicesCard({ devices }: { devices: DeviceRegistration[] }) {
  const activeDevices = devices.filter((d) => !d.blocked);
  const trustedDevices = activeDevices.filter((d) => d.trusted);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Dispositivos</CardTitle>
        <Smartphone className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{activeDevices.length}</div>
        <p className="text-xs text-muted-foreground">{trustedDevices.length} confiáveis</p>
      </CardContent>
    </Card>
  );
}

function SecurityEventsCard({ events }: { events: SessionSecurityEvent[] }) {
  const unresolvedEvents = events.filter((e) => !e.resolved);
  const criticalEvents = unresolvedEvents.filter((e) => e.severity === "critical");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Eventos de Segurança</CardTitle>
        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{unresolvedEvents.length}</div>
        <p className="text-xs text-muted-foreground">{criticalEvents.length} críticos</p>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// DETAILED CARDS
// ============================================================================

function CurrentSessionCard({
  session,
  showSensitiveData,
  onToggleSensitiveData,
}: {
  session: UserSession;
  showSensitiveData: boolean;
  onToggleSensitiveData: () => void;
}) {
  const maskData = (data: string) => {
    if (showSensitiveData) return data;
    return data.replace(/./g, "•");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Sessão Atual</CardTitle>
          <Button variant="ghost" size="sm" onClick={onToggleSensitiveData}>
            {showSensitiveData ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
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
                ? `${session.location.city}, ${session.location.country}`
                : "Desconhecida"}
            </p>
          </div>
          <div>
            <span className="font-medium">Criada em:</span>
            <p className="text-muted-foreground">
              {format(new Date(session.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
            </p>
          </div>
          <div>
            <span className="font-medium">Última atividade:</span>
            <p className="text-muted-foreground">
              {formatDistanceToNow(new Date(session.last_activity), {
                addSuffix: true,
                locale: ptBR,
              })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RecentSecurityEventsCard({
  events,
  onReportActivity,
}: {
  events: SessionSecurityEvent[];
  onReportActivity: (eventType: SecurityEventType, details?: any) => Promise<void>;
}) {
  const getSeverityBadge = (severity: SecuritySeverity) => {
    const variants = {
      low: "secondary",
      medium: "default",
      high: "destructive",
      critical: "destructive",
    } as const;

    return <Badge variant={variants[severity] || "default"}>{severity.toUpperCase()}</Badge>;
  };

  const getEventTypeLabel = (eventType: SecurityEventType) => {
    const labels = {
      [SecurityEventType.UNUSUAL_LOCATION]: "Localização Incomum",
      [SecurityEventType.DEVICE_CHANGE]: "Mudança de Dispositivo",
      [SecurityEventType.RAPID_REQUESTS]: "Requisições Rápidas",
      [SecurityEventType.SESSION_HIJACK_ATTEMPT]: "Tentativa de Sequestro",
      [SecurityEventType.SUSPICIOUS_USER_AGENT]: "User Agent Suspeito",
      [SecurityEventType.CONCURRENT_SESSION_LIMIT]: "Limite de Sessões",
      [SecurityEventType.FAILED_AUTHENTICATION]: "Falha na Autenticação",
      [SecurityEventType.PRIVILEGE_ESCALATION]: "Escalação de Privilégios",
    };

    return labels[eventType] || eventType;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Eventos de Segurança Recentes</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onReportActivity(SecurityEventType.SUSPICIOUS_USER_AGENT, {
                manual_report: true,
                description: "Atividade suspeita reportada pelo usuário",
              })
            }
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Reportar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            Nenhum evento de segurança recente
          </p>
        ) : (
          <div className="space-y-3">
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
                    {formatDistanceToNow(new Date(event.timestamp), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {event.resolved ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

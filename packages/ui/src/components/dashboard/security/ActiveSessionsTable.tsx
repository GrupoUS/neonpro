"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertTriangle,
  Eye,
  LogOut,
  MapPin,
  Monitor,
  RefreshCw,
  Search,
  Smartphone,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "../../ui/alert";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import {
  ConfirmationDialog,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";

interface ActiveSession {
  id: string;
  user_id: string;
  user_email?: string;
  user_name?: string;
  user_role?: string;
  session_token: string;
  ip_address?: string;
  user_agent?: string;
  device_type?: string;
  browser?: string;
  operating_system?: string;
  location?: string;
  country?: string;
  city?: string;
  is_current_session: boolean;
  is_suspicious: boolean;
  last_activity_at: string;
  created_at: string;
  expires_at: string;
  session_data?: Record<string, unknown>;
  security_flags: string[];
  risk_score: number;
}

export function ActiveSessionsTable() {
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [selectedSession, setSelectedSession] = useState<ActiveSession | null>();
  const [showTerminateConfirm, setShowTerminateConfirm] = useState(false);
  const [sessionToTerminate, setSessionToTerminate] = useState<string | null>(null);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/security/sessions", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch active sessions");
      }

      const data = await response.json();
      setSessions(data.sessions || []);
    } catch {
      toast.error("Erro ao carregar sessões ativas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchSessions, 30_000);
    return () => clearInterval(interval);
  }, [fetchSessions]);

  const handleTerminateSession = (sessionId: string) => {
    setSessionToTerminate(sessionId);
    setShowTerminateConfirm(true);
  };

  const confirmTerminateSession = async () => {
    if (!sessionToTerminate) {return;}

    try {
      const response = await fetch(
        `/api/security/sessions/${sessionToTerminate}/terminate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to terminate session");
      }

      await fetchSessions();
      toast.success("Sessão encerrada com sucesso");
    } catch {
      toast.error("Erro ao encerrar sessão");
    } finally {
      setShowTerminateConfirm(false);
      setSessionToTerminate(null);
    }
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore >= 80) {
      return "destructive";
    }
    if (riskScore >= 60) {
      return "secondary";
    }
    if (riskScore >= 40) {
      return "outline";
    }
    return "default";
  };

  const getRiskLevel = (riskScore: number) => {
    if (riskScore >= 80) {
      return "Alto";
    }
    if (riskScore >= 60) {
      return "Médio";
    }
    if (riskScore >= 40) {
      return "Baixo";
    }
    return "Mínimo";
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType?.toLowerCase()) {
      case "mobile": {
        return <Smartphone className="h-4 w-4" />;
      }
      case "tablet": {
        return <Monitor className="h-4 w-4" />;
      }
      default: {
        return <Monitor className="h-4 w-4" />;
      }
    }
  };

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch = session.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
      || session.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
      || session.ip_address?.toLowerCase().includes(searchTerm.toLowerCase())
      || session.location?.toLowerCase().includes(searchTerm.toLowerCase())
      || session.browser?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRisk = riskFilter === "all"
      || (riskFilter === "high" && session.risk_score >= 80)
      || (riskFilter === "medium"
        && session.risk_score >= 60
        && session.risk_score < 80)
      || (riskFilter === "low" && session.risk_score < 60)
      || (riskFilter === "suspicious" && session.is_suspicious);

    return matchesSearch && matchesRisk;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span className="ml-2">Carregando sessões ativas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-blue-50 p-4">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-600" />
            <div>
              <div className="font-bold text-2xl text-blue-600">
                {sessions.length}
              </div>
              <div className="text-blue-600 text-sm">Sessões Ativas</div>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-red-50 p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <div className="font-bold text-2xl text-red-600">
                {sessions.filter((s) => s.is_suspicious).length}
              </div>
              <div className="text-red-600 text-sm">Suspeitas</div>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-yellow-50 p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <div>
              <div className="font-bold text-2xl text-yellow-600">
                {sessions.filter((s) => s.risk_score >= 80).length}
              </div>
              <div className="text-sm text-yellow-600">Alto Risco</div>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-green-50 p-4">
          <div className="flex items-center space-x-2">
            <Monitor className="h-5 w-5 text-green-600" />
            <div>
              <div className="font-bold text-2xl text-green-600">
                {new Set(sessions.map((s) => s.user_id)).size}
              </div>
              <div className="text-green-600 text-sm">Usuários Únicos</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <Label htmlFor="search">Buscar sessões</Label>
          <div className="relative">
            <Search className="-translate-y-1/2 absolute top-1/2 left-2 h-4 w-4 transform text-muted-foreground" />
            <Input
              className="pl-8"
              id="search"
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por usuário, IP, localização ou navegador..."
              value={searchTerm}
            />
          </div>
        </div>
        <div className="min-w-[140px]">
          <Label htmlFor="risk-filter">Filtro de Risco</Label>
          <Select onValueChange={setRiskFilter} value={riskFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="high">Alto Risco</SelectItem>
              <SelectItem value="medium">Médio Risco</SelectItem>
              <SelectItem value="low">Baixo Risco</SelectItem>
              <SelectItem value="suspicious">Suspeitas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button onClick={fetchSessions} size="sm" variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Dispositivo</TableHead>
              <TableHead>IP / Localização</TableHead>
              <TableHead>Navegador</TableHead>
              <TableHead>Risco</TableHead>
              <TableHead>Última Atividade</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSessions.length === 0
              ? (
                <TableRow>
                  <TableCell
                    className="py-8 text-center text-muted-foreground"
                    colSpan={7}
                  >
                    Nenhuma sessão ativa encontrada
                  </TableCell>
                </TableRow>
              )
              : (
                filteredSessions.map((session) => (
                  <TableRow
                    className={`
                    ${session.is_current_session ? "bg-blue-50/50" : ""} 
                    ${session.is_suspicious ? "bg-red-50/50" : ""}
                  `}
                    key={session.id}
                  >
                    <TableCell>
                      <div>
                        <div className="flex items-center space-x-2 font-medium">
                          <span>{session.user_name || session.user_email}</span>
                          {session.is_current_session && (
                            <Badge className="text-xs" variant="outline">
                              Esta Sessão
                            </Badge>
                          )}
                          {session.is_suspicious && (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <div className="text-muted-foreground text-sm">
                          {session.user_role && (
                            <Badge className="text-xs" variant="outline">
                              {session.user_role}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getDeviceIcon(session.device_type || "desktop")}
                        <div>
                          <div className="font-medium text-sm">
                            {session.device_type || "Desktop"}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {session.operating_system}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="flex items-center space-x-1">
                          <code className="rounded bg-muted px-1 py-0.5 text-sm">
                            {session.ip_address}
                          </code>
                        </div>
                        {session.location && (
                          <div className="flex items-center space-x-1 text-muted-foreground text-sm">
                            <MapPin className="h-3 w-3" />
                            <span>{session.location}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{session.browser || "N/A"}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getRiskColor(session.risk_score)}>
                          {getRiskLevel(session.risk_score)}
                        </Badge>
                        <span className="text-muted-foreground text-xs">
                          {session.risk_score}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {format(
                          new Date(session.last_activity_at),
                          "dd/MM/yyyy HH:mm",
                          {
                            locale: ptBR,
                          },
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              onClick={() => setSelectedSession(session)}
                              size="sm"
                              variant="ghost"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="flex items-center space-x-2">
                                <Users className="h-5 w-5" />
                                <span>Detalhes da Sessão</span>
                                {selectedSession?.is_current_session && (
                                  <Badge variant="outline">Sessão Atual</Badge>
                                )}
                              </DialogTitle>
                              <DialogDescription>
                                Informações detalhadas da sessão #{session.id}
                              </DialogDescription>
                            </DialogHeader>
                            {selectedSession && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Usuário</Label>
                                    <div className="mt-1 text-sm">
                                      {selectedSession.user_name
                                        || selectedSession.user_email}
                                    </div>
                                  </div>
                                  <div>
                                    <Label>Função</Label>
                                    <div className="mt-1">
                                      <Badge variant="outline">
                                        {selectedSession.user_role || "N/A"}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div>
                                    <Label>IP Address</Label>
                                    <div className="mt-1">
                                      <code className="rounded bg-muted px-2 py-1 text-sm">
                                        {selectedSession.ip_address}
                                      </code>
                                    </div>
                                  </div>
                                  <div>
                                    <Label>Localização</Label>
                                    <div className="mt-1 text-sm">
                                      {selectedSession.location || "N/A"}
                                    </div>
                                  </div>
                                  <div>
                                    <Label>Dispositivo</Label>
                                    <div className="mt-1 text-sm">
                                      {selectedSession.device_type || "Desktop"}
                                    </div>
                                  </div>
                                  <div>
                                    <Label>Sistema Operacional</Label>
                                    <div className="mt-1 text-sm">
                                      {selectedSession.operating_system || "N/A"}
                                    </div>
                                  </div>
                                  <div>
                                    <Label>Navegador</Label>
                                    <div className="mt-1 text-sm">
                                      {selectedSession.browser || "N/A"}
                                    </div>
                                  </div>
                                  <div>
                                    <Label>Pontuação de Risco</Label>
                                    <div className="mt-1">
                                      <Badge
                                        variant={getRiskColor(
                                          selectedSession.risk_score,
                                        )}
                                      >
                                        {getRiskLevel(selectedSession.risk_score)}{" "}
                                        ({selectedSession.risk_score}%)
                                      </Badge>
                                    </div>
                                  </div>
                                  <div>
                                    <Label>Criada em</Label>
                                    <div className="mt-1 text-sm">
                                      {format(
                                        new Date(selectedSession.created_at),
                                        "dd/MM/yyyy HH:mm:ss",
                                        {
                                          locale: ptBR,
                                        },
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <Label>Última Atividade</Label>
                                    <div className="mt-1 text-sm">
                                      {format(
                                        new Date(
                                          selectedSession.last_activity_at,
                                        ),
                                        "dd/MM/yyyy HH:mm:ss",
                                        {
                                          locale: ptBR,
                                        },
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <Label>Expira em</Label>
                                    <div className="mt-1 text-sm">
                                      {format(
                                        new Date(selectedSession.expires_at),
                                        "dd/MM/yyyy HH:mm:ss",
                                        {
                                          locale: ptBR,
                                        },
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {selectedSession.security_flags
                                  && selectedSession.security_flags.length > 0 && (
                                  <div>
                                    <Label>Flags de Segurança</Label>
                                    <div className="mt-1 flex flex-wrap gap-2">
                                      {selectedSession.security_flags.map(
                                        (flag, index) => (
                                          <Badge key={index} variant="outline">
                                            {flag}
                                          </Badge>
                                        ),
                                      )}
                                    </div>
                                  </div>
                                )}

                                {selectedSession.is_suspicious && (
                                  <Alert>
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription>
                                      Esta sessão foi marcada como suspeita devido a atividade
                                      incomum.
                                    </AlertDescription>
                                  </Alert>
                                )}

                                {selectedSession.session_data
                                  && Object.keys(selectedSession.session_data)
                                      .length > 0
                                  && (
                                    <div>
                                      <Label>Dados da Sessão</Label>
                                      <div className="mt-1">
                                        <pre className="max-h-40 overflow-auto rounded bg-muted p-3 text-xs">
                                        {JSON.stringify(
                                          selectedSession.session_data,
                                          undefined,
                                          2,
                                        )}
                                        </pre>
                                      </div>
                                    </div>
                                  )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        {!session.is_current_session && (
                          <Button
                            onClick={() => handleTerminateSession(session.id)}
                            size="sm"
                            variant="destructive"
                          >
                            <LogOut className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      <div className="text-muted-foreground text-sm">
        Mostrando {filteredSessions.length} de {sessions.length} sessões ativas
        {sessions.some((s) => s.is_suspicious).length > 0 && (
          <span className="ml-2 text-red-600">
            • {sessions.filter((s) => s.is_suspicious).length} sessões suspeitas detectadas
          </span>
        )}
      </div>

      {/* Healthcare-Compliant Confirmation Dialog */}
      <Dialog open={showTerminateConfirm} onOpenChange={setShowTerminateConfirm}>
        <ConfirmationDialog
          title="Encerrar Sessão Ativa"
          description="Tem certeza que deseja encerrar esta sessão? Esta ação não pode ser desfeita e o usuário será desconectado imediatamente."
          confirmText="Encerrar Sessão"
          cancelText="Cancelar"
          isDestructive
          lgpdRequired
          medicalContext="patient-data"
          onConfirm={confirmTerminateSession}
          onCancel={() => {
            setShowTerminateConfirm(false);
            setSessionToTerminate(null);
          }}
        >
          <div className="space-y-3">
            <div className="rounded-lg bg-gradient-to-br from-warning/15 via-warning/10 to-warning/5 p-3 shadow-healthcare-sm backdrop-blur-sm">
              <p className="font-medium text-warning text-sm">
                ⚠️ Atenção: Esta ação será registrada nos logs de auditoria conforme LGPD
              </p>
            </div>
            <div className="rounded-lg bg-gradient-to-br from-info/15 via-info/10 to-info/5 p-3 shadow-healthcare-sm backdrop-blur-sm">
              <p className="text-info text-sm">
                🏥 Contexto Médico: O encerramento de sessões é monitorado para garantir a segurança
                dos dados de saúde
              </p>
            </div>
          </div>
        </ConfirmationDialog>
      </Dialog>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@neonpro/ui/badge';
import { Button } from '@neonpro/ui/button';
import { Input } from '@neonpro/ui/input';
import { Label } from '@neonpro/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@neonpro/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@neonpro/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@neonpro/ui/dialog';
import { Alert, AlertDescription } from '@neonpro/ui/alert';
import { Users, Eye, Search, RefreshCw, LogOut, AlertTriangle, MapPin, Monitor, Smartphone } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

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
  session_data?: Record<string, any>;
  security_flags: string[];
  risk_score: number;
}

export function ActiveSessionsTable() {
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [selectedSession, setSelectedSession] = useState<ActiveSession | null>(null);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/security/sessions', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch active sessions');
      }

      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('Error fetching active sessions:', error);
      toast.error('Erro ao carregar sessões ativas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchSessions, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleTerminateSession = async (sessionId: string) => {
    if (!confirm('Tem certeza que deseja encerrar esta sessão?')) {
      return;
    }

    try {
      const response = await fetch(`/api/security/sessions/${sessionId}/terminate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to terminate session');
      }

      await fetchSessions();
      toast.success('Sessão encerrada com sucesso');
    } catch (error) {
      console.error('Error terminating session:', error);
      toast.error('Erro ao encerrar sessão');
    }
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore >= 80) return 'destructive';
    if (riskScore >= 60) return 'secondary';
    if (riskScore >= 40) return 'outline';
    return 'default';
  };

  const getRiskLevel = (riskScore: number) => {
    if (riskScore >= 80) return 'Alto';
    if (riskScore >= 60) return 'Médio';
    if (riskScore >= 40) return 'Baixo';
    return 'Mínimo';
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Monitor className="h-4 w-4" />;
      case 'desktop':
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch = 
      session.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.ip_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.browser?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRisk = 
      riskFilter === 'all' ||
      (riskFilter === 'high' && session.risk_score >= 80) ||
      (riskFilter === 'medium' && session.risk_score >= 60 && session.risk_score < 80) ||
      (riskFilter === 'low' && session.risk_score < 60) ||
      (riskFilter === 'suspicious' && session.is_suspicious);

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-600" />
            <div>
              <div className="text-2xl font-bold text-blue-600">{sessions.length}</div>
              <div className="text-sm text-blue-600">Sessões Ativas</div>
            </div>
          </div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <div className="text-2xl font-bold text-red-600">
                {sessions.filter(s => s.is_suspicious).length}
              </div>
              <div className="text-sm text-red-600">Suspeitas</div>
            </div>
          </div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {sessions.filter(s => s.risk_score >= 80).length}
              </div>
              <div className="text-sm text-yellow-600">Alto Risco</div>
            </div>
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <Monitor className="h-5 w-5 text-green-600" />
            <div>
              <div className="text-2xl font-bold text-green-600">
                {new Set(sessions.map(s => s.user_id)).size}
              </div>
              <div className="text-sm text-green-600">Usuários Únicos</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="search">Buscar sessões</Label>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Buscar por usuário, IP, localização ou navegador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <div className="min-w-[140px]">
          <Label htmlFor="risk-filter">Filtro de Risco</Label>
          <Select value={riskFilter} onValueChange={setRiskFilter}>
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
          <Button onClick={fetchSessions} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
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
            {filteredSessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  Nenhuma sessão ativa encontrada
                </TableCell>
              </TableRow>
            ) : (
              filteredSessions.map((session) => (
                <TableRow 
                  key={session.id} 
                  className={`
                    ${session.is_current_session ? 'bg-blue-50/50' : ''} 
                    ${session.is_suspicious ? 'bg-red-50/50' : ''}
                  `}
                >
                  <TableCell>
                    <div>
                      <div className="font-medium flex items-center space-x-2">
                        <span>{session.user_name || session.user_email}</span>
                        {session.is_current_session && (
                          <Badge variant="outline" className="text-xs">Esta Sessão</Badge>
                        )}
                        {session.is_suspicious && (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {session.user_role && (
                          <Badge variant="outline" className="text-xs">
                            {session.user_role}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getDeviceIcon(session.device_type || 'desktop')}
                      <div>
                        <div className="text-sm font-medium">
                          {session.device_type || 'Desktop'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {session.operating_system}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="flex items-center space-x-1">
                        <code className="text-sm bg-muted px-1 py-0.5 rounded">
                          {session.ip_address}
                        </code>
                      </div>
                      {session.location && (
                        <div className="text-sm text-muted-foreground flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{session.location}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {session.browser || 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getRiskColor(session.risk_score)}>
                        {getRiskLevel(session.risk_score)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {session.risk_score}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {format(new Date(session.last_activity_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedSession(session)}
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
                                    {selectedSession.user_name || selectedSession.user_email}
                                  </div>
                                </div>
                                <div>
                                  <Label>Função</Label>
                                  <div className="mt-1">
                                    <Badge variant="outline">
                                      {selectedSession.user_role || 'N/A'}
                                    </Badge>
                                  </div>
                                </div>
                                <div>
                                  <Label>IP Address</Label>
                                  <div className="mt-1">
                                    <code className="text-sm bg-muted px-2 py-1 rounded">
                                      {selectedSession.ip_address}
                                    </code>
                                  </div>
                                </div>
                                <div>
                                  <Label>Localização</Label>
                                  <div className="mt-1 text-sm">
                                    {selectedSession.location || 'N/A'}
                                  </div>
                                </div>
                                <div>
                                  <Label>Dispositivo</Label>
                                  <div className="mt-1 text-sm">
                                    {selectedSession.device_type || 'Desktop'}
                                  </div>
                                </div>
                                <div>
                                  <Label>Sistema Operacional</Label>
                                  <div className="mt-1 text-sm">
                                    {selectedSession.operating_system || 'N/A'}
                                  </div>
                                </div>
                                <div>
                                  <Label>Navegador</Label>
                                  <div className="mt-1 text-sm">
                                    {selectedSession.browser || 'N/A'}
                                  </div>
                                </div>
                                <div>
                                  <Label>Pontuação de Risco</Label>
                                  <div className="mt-1">
                                    <Badge variant={getRiskColor(selectedSession.risk_score)}>
                                      {getRiskLevel(selectedSession.risk_score)} ({selectedSession.risk_score}%)
                                    </Badge>
                                  </div>
                                </div>
                                <div>
                                  <Label>Criada em</Label>
                                  <div className="mt-1 text-sm">
                                    {format(new Date(selectedSession.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                                  </div>
                                </div>
                                <div>
                                  <Label>Última Atividade</Label>
                                  <div className="mt-1 text-sm">
                                    {format(new Date(selectedSession.last_activity_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                                  </div>
                                </div>
                                <div>
                                  <Label>Expira em</Label>
                                  <div className="mt-1 text-sm">
                                    {format(new Date(selectedSession.expires_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                                  </div>
                                </div>
                              </div>

                              {selectedSession.security_flags && selectedSession.security_flags.length > 0 && (
                                <div>
                                  <Label>Flags de Segurança</Label>
                                  <div className="mt-1 flex flex-wrap gap-2">
                                    {selectedSession.security_flags.map((flag, index) => (
                                      <Badge key={index} variant="outline">
                                        {flag}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {selectedSession.is_suspicious && (
                                <Alert>
                                  <AlertTriangle className="h-4 w-4" />
                                  <AlertDescription>
                                    Esta sessão foi marcada como suspeita devido a atividade incomum.
                                  </AlertDescription>
                                </Alert>
                              )}

                              {selectedSession.session_data && Object.keys(selectedSession.session_data).length > 0 && (
                                <div>
                                  <Label>Dados da Sessão</Label>
                                  <div className="mt-1">
                                    <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                                      {JSON.stringify(selectedSession.session_data, null, 2)}
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
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleTerminateSession(session.id)}
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
      <div className="text-sm text-muted-foreground">
        Mostrando {filteredSessions.length} de {sessions.length} sessões ativas
        {sessions.filter(s => s.is_suspicious).length > 0 && (
          <span className="text-red-600 ml-2">
            • {sessions.filter(s => s.is_suspicious).length} sessões suspeitas detectadas
          </span>
        )}
      </div>
    </div>
  );
}
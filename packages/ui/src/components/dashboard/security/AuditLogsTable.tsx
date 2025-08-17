'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@neonpro/ui/badge';
import { Button } from '@neonpro/ui/button';
import { Input } from '@neonpro/ui/input';
import { Label } from '@neonpro/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@neonpro/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@neonpro/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@neonpro/ui/dialog';
import { Eye, Search, RefreshCw, Filter, Download, Calendar, User, Database, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface AuditLog {
  id: string;
  user_id?: string;
  session_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  table_name?: string;
  ip_address?: string;
  user_agent?: string;
  endpoint?: string;
  http_method?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  changed_fields?: string[];
  compliance_flags: string[];
  compliance_context?: Record<string, any>;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  security_flags: string[];
  created_at: string;
  metadata?: Record<string, any>;
  checksum?: string;
  signature?: string;
}

export function AuditLogsTable() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [resourceFilter, setResourceFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/security/audit-logs', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch audit logs');
      }

      const data = await response.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast.error('Erro ao carregar logs de auditoria');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleExportLogs = async () => {
    try {
      const response = await fetch('/api/security/audit-logs/export', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to export audit logs');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Logs de auditoria exportados com sucesso');
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      toast.error('Erro ao exportar logs de auditoria');
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('create') || action.includes('insert')) {
      return <Database className="h-4 w-4 text-green-500" />;
    }
    if (action.includes('update') || action.includes('modify')) {
      return <Database className="h-4 w-4 text-blue-500" />;
    }
    if (action.includes('delete') || action.includes('remove')) {
      return <Database className="h-4 w-4 text-red-500" />;
    }
    if (action.includes('login') || action.includes('auth')) {
      return <User className="h-4 w-4 text-purple-500" />;
    }
    if (action.includes('security') || action.includes('permission')) {
      return <Shield className="h-4 w-4 text-orange-500" />;
    }
    return <Database className="h-4 w-4 text-gray-500" />;
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ip_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.table_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === 'all' || log.action.toLowerCase().includes(actionFilter);
    const matchesResource = resourceFilter === 'all' || log.resource_type === resourceFilter;
    const matchesRisk = riskFilter === 'all' || log.risk_level === riskFilter;

    return matchesSearch && matchesAction && matchesResource && matchesRisk;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span className="ml-2">Carregando logs de auditoria...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-blue-600" />
            <div>
              <div className="text-2xl font-bold text-blue-600">{logs.length}</div>
              <div className="text-sm text-blue-600">Total de Logs</div>
            </div>
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-green-600" />
            <div>
              <div className="text-2xl font-bold text-green-600">
                {new Set(logs.map(l => l.user_id).filter(Boolean)).size}
              </div>
              <div className="text-sm text-green-600">Usuários Únicos</div>
            </div>
          </div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-yellow-600" />
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {logs.filter(l => l.risk_level === 'high' || l.risk_level === 'critical').length}
              </div>
              <div className="text-sm text-yellow-600">Alto Risco</div>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-purple-600" />
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {new Set(logs.map(l => l.resource_type)).size}
              </div>
              <div className="text-sm text-purple-600">Tipos de Recurso</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="search">Buscar logs</Label>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Buscar por ação, recurso, usuário, IP ou tabela..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <div className="min-w-[120px]">
          <Label htmlFor="action-filter">Ação</Label>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="create">Criar</SelectItem>
              <SelectItem value="update">Atualizar</SelectItem>
              <SelectItem value="delete">Deletar</SelectItem>
              <SelectItem value="login">Login</SelectItem>
              <SelectItem value="logout">Logout</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-[120px]">
          <Label htmlFor="resource-filter">Recurso</Label>
          <Select value={resourceFilter} onValueChange={setResourceFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="patient">Paciente</SelectItem>
              <SelectItem value="user">Usuário</SelectItem>
              <SelectItem value="appointment">Consulta</SelectItem>
              <SelectItem value="treatment">Tratamento</SelectItem>
              <SelectItem value="product">Produto</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-[120px]">
          <Label htmlFor="risk-filter">Risco</Label>
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="critical">Crítico</SelectItem>
              <SelectItem value="high">Alto</SelectItem>
              <SelectItem value="medium">Médio</SelectItem>
              <SelectItem value="low">Baixo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end space-x-2">
          <Button onClick={fetchLogs} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={handleExportLogs} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Ação</TableHead>
              <TableHead>Recurso</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>IP</TableHead>
              <TableHead>Risco</TableHead>
              <TableHead>Compliance</TableHead>
              <TableHead>Data/Hora</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  Nenhum log de auditoria encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getActionIcon(log.action)}
                      <div>
                        <div className="font-medium text-sm">{log.action}</div>
                        {log.http_method && (
                          <Badge variant="outline" className="text-xs">
                            {log.http_method}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{log.resource_type}</div>
                      {log.table_name && (
                        <div className="text-sm text-muted-foreground">{log.table_name}</div>
                      )}
                      {log.resource_id && (
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">
                          {log.resource_id}
                        </code>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {log.user_id ? (
                        <code className="bg-muted px-1 py-0.5 rounded">{log.user_id}</code>
                      ) : (
                        <span className="text-muted-foreground">Sistema</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-sm bg-muted px-1 py-0.5 rounded">
                      {log.ip_address || 'N/A'}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRiskColor(log.risk_level)}>
                      {log.risk_level === 'critical' && 'CRÍTICO'}
                      {log.risk_level === 'high' && 'ALTO'}
                      {log.risk_level === 'medium' && 'MÉDIO'}
                      {log.risk_level === 'low' && 'BAIXO'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {log.compliance_flags.slice(0, 2).map((flag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {flag}
                        </Badge>
                      ))}
                      {log.compliance_flags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{log.compliance_flags.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {format(new Date(log.created_at), 'dd/MM HH:mm:ss', { locale: ptBR })}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center space-x-2">
                            {getActionIcon(log.action)}
                            <span>Log de Auditoria</span>
                            <Badge variant={getRiskColor(log.risk_level)}>
                              {log.risk_level.toUpperCase()}
                            </Badge>
                          </DialogTitle>
                          <DialogDescription>
                            Detalhes completos do log #{log.id}
                          </DialogDescription>
                        </DialogHeader>
                        {selectedLog && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Ação</Label>
                                <div className="mt-1 text-sm">{selectedLog.action}</div>
                              </div>
                              <div>
                                <Label>Tipo de Recurso</Label>
                                <div className="mt-1 text-sm">{selectedLog.resource_type}</div>
                              </div>
                              <div>
                                <Label>ID do Recurso</Label>
                                <div className="mt-1">
                                  <code className="text-sm bg-muted px-2 py-1 rounded">
                                    {selectedLog.resource_id || 'N/A'}
                                  </code>
                                </div>
                              </div>
                              <div>
                                <Label>Tabela</Label>
                                <div className="mt-1 text-sm">{selectedLog.table_name || 'N/A'}</div>
                              </div>
                              <div>
                                <Label>Usuário</Label>
                                <div className="mt-1">
                                  <code className="text-sm bg-muted px-2 py-1 rounded">
                                    {selectedLog.user_id || 'Sistema'}
                                  </code>
                                </div>
                              </div>
                              <div>
                                <Label>IP Address</Label>
                                <div className="mt-1">
                                  <code className="text-sm bg-muted px-2 py-1 rounded">
                                    {selectedLog.ip_address || 'N/A'}
                                  </code>
                                </div>
                              </div>
                              <div>
                                <Label>Endpoint</Label>
                                <div className="mt-1 text-sm">{selectedLog.endpoint || 'N/A'}</div>
                              </div>
                              <div>
                                <Label>Método HTTP</Label>
                                <div className="mt-1">
                                  <Badge variant="outline">
                                    {selectedLog.http_method || 'N/A'}
                                  </Badge>
                                </div>
                              </div>
                              <div>
                                <Label>Nível de Risco</Label>
                                <div className="mt-1">
                                  <Badge variant={getRiskColor(selectedLog.risk_level)}>
                                    {selectedLog.risk_level.toUpperCase()}
                                  </Badge>
                                </div>
                              </div>
                              <div>
                                <Label>Data/Hora</Label>
                                <div className="mt-1 text-sm">
                                  {format(new Date(selectedLog.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                                </div>
                              </div>
                            </div>

                            {selectedLog.compliance_flags && selectedLog.compliance_flags.length > 0 && (
                              <div>
                                <Label>Flags de Compliance</Label>
                                <div className="mt-1 flex flex-wrap gap-2">
                                  {selectedLog.compliance_flags.map((flag, index) => (
                                    <Badge key={index} variant="outline">
                                      {flag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {selectedLog.security_flags && selectedLog.security_flags.length > 0 && (
                              <div>
                                <Label>Flags de Segurança</Label>
                                <div className="mt-1 flex flex-wrap gap-2">
                                  {selectedLog.security_flags.map((flag, index) => (
                                    <Badge key={index} variant="outline">
                                      {flag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {selectedLog.changed_fields && selectedLog.changed_fields.length > 0 && (
                              <div>
                                <Label>Campos Alterados</Label>
                                <div className="mt-1 flex flex-wrap gap-2">
                                  {selectedLog.changed_fields.map((field, index) => (
                                    <Badge key={index} variant="secondary">
                                      {field}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {selectedLog.old_values && Object.keys(selectedLog.old_values).length > 0 && (
                                <div>
                                  <Label>Valores Anteriores</Label>
                                  <div className="mt-1">
                                    <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                                      {JSON.stringify(selectedLog.old_values, null, 2)}
                                    </pre>
                                  </div>
                                </div>
                              )}

                              {selectedLog.new_values && Object.keys(selectedLog.new_values).length > 0 && (
                                <div>
                                  <Label>Valores Novos</Label>
                                  <div className="mt-1">
                                    <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                                      {JSON.stringify(selectedLog.new_values, null, 2)}
                                    </pre>
                                  </div>
                                </div>
                              )}
                            </div>

                            {selectedLog.compliance_context && Object.keys(selectedLog.compliance_context).length > 0 && (
                              <div>
                                <Label>Contexto de Compliance</Label>
                                <div className="mt-1">
                                  <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                                    {JSON.stringify(selectedLog.compliance_context, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            )}

                            {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                              <div>
                                <Label>Metadados</Label>
                                <div className="mt-1">
                                  <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                                    {JSON.stringify(selectedLog.metadata, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            )}

                            {selectedLog.user_agent && (
                              <div>
                                <Label>User Agent</Label>
                                <div className="mt-1 text-xs bg-muted p-2 rounded">
                                  {selectedLog.user_agent}
                                </div>
                              </div>
                            )}

                            {(selectedLog.checksum || selectedLog.signature) && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {selectedLog.checksum && (
                                  <div>
                                    <Label>Checksum</Label>
                                    <div className="mt-1">
                                      <code className="text-xs bg-muted px-2 py-1 rounded break-all">
                                        {selectedLog.checksum}
                                      </code>
                                    </div>
                                  </div>
                                )}
                                {selectedLog.signature && (
                                  <div>
                                    <Label>Assinatura Digital</Label>
                                    <div className="mt-1">
                                      <code className="text-xs bg-muted px-2 py-1 rounded break-all">
                                        {selectedLog.signature}
                                      </code>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      <div className="text-sm text-muted-foreground">
        Mostrando {filteredLogs.length} de {logs.length} logs de auditoria
      </div>
    </div>
  );
}
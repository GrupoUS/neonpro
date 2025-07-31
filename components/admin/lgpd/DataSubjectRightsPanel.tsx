'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Plus,
  AlertTriangle,
  User,
  Shield,
  Database,
  Mail,
  Calendar
} from 'lucide-react';
import { useDataSubjectRights } from '@/hooks/useLGPD';
import { DataSubjectRequest, DataSubjectRightType, RequestStatus } from '@/types/lgpd';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Data Subject Rights Panel
 * 
 * Comprehensive panel for managing data subject rights requests including:
 * - Request listing and filtering
 * - Request processing and fulfillment
 * - Data export and deletion
 * - Request status tracking
 * - Compliance timeline monitoring
 */
export function DataSubjectRightsPanel() {
  const {
    requests,
    loading,
    error,
    loadRequests,
    processRequest,
    fulfillRequest,
    exportUserData,
    deleteUserData
  } = useDataSubjectRights();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<DataSubjectRightType | 'all'>('all');
  const [selectedRequest, setSelectedRequest] = useState<DataSubjectRequest | null>(null);
  const [showProcessDialog, setShowProcessDialog] = useState(false);
  const [processingNotes, setProcessingNotes] = useState('');
  const [fulfillmentData, setFulfillmentData] = useState('');

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesType = typeFilter === 'all' || request.requestType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800"><RefreshCw className="h-3 w-3 mr-1" />Em Andamento</Badge>;
      case 'fulfilled':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Atendida</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejeitada</Badge>;
      case 'expired':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Expirada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRequestTypeLabel = (type: DataSubjectRightType) => {
    const labels: Record<DataSubjectRightType, string> = {
      'access': 'Acesso aos Dados',
      'rectification': 'Retificação',
      'erasure': 'Apagamento',
      'portability': 'Portabilidade',
      'restriction': 'Restrição de Processamento',
      'objection': 'Oposição ao Processamento'
    };
    return labels[type] || type;
  };

  const getRequestTypeIcon = (type: DataSubjectRightType) => {
    switch (type) {
      case 'access':
        return <Eye className="h-4 w-4" />;
      case 'rectification':
        return <Edit className="h-4 w-4" />;
      case 'erasure':
        return <Trash2 className="h-4 w-4" />;
      case 'portability':
        return <Download className="h-4 w-4" />;
      case 'restriction':
        return <Shield className="h-4 w-4" />;
      case 'objection':
        return <XCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const handleProcessRequest = async () => {
    if (!selectedRequest) return;

    try {
      await processRequest(selectedRequest.id, processingNotes);
      await loadRequests();
      setShowProcessDialog(false);
      setProcessingNotes('');
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error processing request:', error);
    }
  };

  const handleFulfillRequest = async (requestId: string, data?: string) => {
    try {
      await fulfillRequest(requestId, data);
      await loadRequests();
    } catch (error) {
      console.error('Error fulfilling request:', error);
    }
  };

  const handleExportData = async (request: DataSubjectRequest) => {
    try {
      const exportData = await exportUserData(request.userId);
      await handleFulfillRequest(request.id, JSON.stringify(exportData));
    } catch (error) {
      console.error('Error exporting user data:', error);
    }
  };

  const handleDeleteData = async (request: DataSubjectRequest) => {
    try {
      await deleteUserData(request.userId);
      await handleFulfillRequest(request.id, 'Data deletion completed');
    } catch (error) {
      console.error('Error deleting user data:', error);
    }
  };

  const getRequestStats = () => {
    const total = requests.length;
    const pending = requests.filter(r => r.status === 'pending').length;
    const inProgress = requests.filter(r => r.status === 'in_progress').length;
    const fulfilled = requests.filter(r => r.status === 'fulfilled').length;
    const rejected = requests.filter(r => r.status === 'rejected').length;
    const expired = requests.filter(r => r.status === 'expired').length;

    return { total, pending, inProgress, fulfilled, rejected, expired };
  };

  const getOverdueRequests = () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    return requests.filter(request => 
      (request.status === 'pending' || request.status === 'in_progress') &&
      new Date(request.createdAt) < thirtyDaysAgo
    );
  };

  const stats = getRequestStats();
  const overdueRequests = getOverdueRequests();

  if (loading && requests.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Carregando solicitações...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Direitos dos Titulares de Dados</h2>
          <p className="text-muted-foreground">
            Gerencie solicitações de exercício de direitos dos titulares de dados
          </p>
        </div>
        <Button onClick={loadRequests} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Overdue Requests Alert */}
      {overdueRequests.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Atenção:</strong> {overdueRequests.length} solicitação(ões) em atraso (mais de 30 dias). 
            Processe-as imediatamente para manter a conformidade LGPD.
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <RefreshCw className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atendidas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.fulfilled}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejeitadas</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Atraso</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueRequests.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Usuário, email ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as RequestStatus | 'all')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                  <SelectItem value="fulfilled">Atendida</SelectItem>
                  <SelectItem value="rejected">Rejeitada</SelectItem>
                  <SelectItem value="expired">Expirada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Direito</Label>
              <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as DataSubjectRightType | 'all')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="access">Acesso aos Dados</SelectItem>
                  <SelectItem value="rectification">Retificação</SelectItem>
                  <SelectItem value="erasure">Apagamento</SelectItem>
                  <SelectItem value="portability">Portabilidade</SelectItem>
                  <SelectItem value="restriction">Restrição de Processamento</SelectItem>
                  <SelectItem value="objection">Oposição ao Processamento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Solicitações ({filteredRequests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Tipo de Direito</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data da Solicitação</TableHead>
                  <TableHead>Prazo</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => {
                  const isOverdue = overdueRequests.some(r => r.id === request.id);
                  const daysRemaining = Math.ceil(
                    (new Date(request.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000 - Date.now()) / 
                    (24 * 60 * 60 * 1000)
                  );
                  
                  return (
                    <TableRow key={request.id} className={isOverdue ? 'bg-red-50' : ''}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{request.userId}</div>
                          {request.userEmail && (
                            <div className="text-sm text-muted-foreground">{request.userEmail}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getRequestTypeIcon(request.requestType)}
                          <span>{getRequestTypeLabel(request.requestType)}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>
                        {format(new Date(request.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        {request.status === 'pending' || request.status === 'in_progress' ? (
                          <span className={isOverdue ? 'text-red-600 font-medium' : daysRemaining <= 5 ? 'text-yellow-600' : ''}>
                            {isOverdue ? 'Em atraso' : `${daysRemaining} dias`}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {request.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowProcessDialog(true);
                              }}
                            >
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Processar
                            </Button>
                          )}
                          
                          {request.status === 'in_progress' && (
                            <>
                              {request.requestType === 'access' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleExportData(request)}
                                >
                                  <Download className="h-3 w-3 mr-1" />
                                  Exportar
                                </Button>
                              )}
                              
                              {request.requestType === 'erasure' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteData(request)}
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Apagar
                                </Button>
                              )}
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleFulfillRequest(request.id)}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Concluir
                              </Button>
                            </>
                          )}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedRequest(request)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Process Request Dialog */}
      <Dialog open={showProcessDialog} onOpenChange={setShowProcessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Processar Solicitação</DialogTitle>
            <DialogDescription>
              Inicie o processamento da solicitação de {selectedRequest?.userEmail || selectedRequest?.userId}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notas de Processamento</Label>
              <Textarea
                id="notes"
                placeholder="Adicione notas sobre o processamento desta solicitação..."
                value={processingNotes}
                onChange={(e) => setProcessingNotes(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowProcessDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleProcessRequest}>
                Iniciar Processamento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

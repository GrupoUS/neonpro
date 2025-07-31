'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  UserCheck,
  UserX,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Plus,
  AlertTriangle
} from 'lucide-react';
import { useConsentManagement } from '@/hooks/useLGPD';
import { ConsentRecord, ConsentStatus, ConsentPurpose } from '@/types/lgpd';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Consent Management Panel
 * 
 * Comprehensive panel for managing user consents including:
 * - Consent records listing and filtering
 * - Consent status management
 * - Purpose-based consent tracking
 * - Consent withdrawal handling
 * - Consent analytics and reporting
 */
export function ConsentManagementPanel() {
  const {
    consents,
    loading,
    error,
    loadConsents,
    updateConsent,
    withdrawConsent,
    getConsentHistory
  } = useConsentManagement();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ConsentStatus | 'all'>('all');
  const [purposeFilter, setPurposeFilter] = useState<ConsentPurpose | 'all'>('all');
  const [selectedConsent, setSelectedConsent] = useState<ConsentRecord | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [consentHistory, setConsentHistory] = useState<ConsentRecord[]>([]);

  useEffect(() => {
    loadConsents();
  }, [loadConsents]);

  const filteredConsents = consents.filter(consent => {
    const matchesSearch = consent.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consent.userEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || consent.status === statusFilter;
    const matchesPurpose = purposeFilter === 'all' || consent.purpose === purposeFilter;
    
    return matchesSearch && matchesStatus && matchesPurpose;
  });

  const getStatusBadge = (status: ConsentStatus) => {
    switch (status) {
      case 'granted':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Concedido</Badge>;
      case 'withdrawn':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Retirado</Badge>;
      case 'expired':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Expirado</Badge>;
      case 'pending':
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPurposeLabel = (purpose: ConsentPurpose) => {
    const labels: Record<ConsentPurpose, string> = {
      'marketing': 'Marketing',
      'analytics': 'Analytics',
      'personalization': 'Personalização',
      'third_party_sharing': 'Compartilhamento com Terceiros',
      'data_processing': 'Processamento de Dados',
      'communication': 'Comunicação'
    };
    return labels[purpose] || purpose;
  };

  const handleViewHistory = async (consent: ConsentRecord) => {
    try {
      const history = await getConsentHistory(consent.userId, consent.purpose);
      setConsentHistory(history);
      setSelectedConsent(consent);
      setShowHistory(true);
    } catch (error) {
      console.error('Error loading consent history:', error);
    }
  };

  const handleWithdrawConsent = async (consentId: string) => {
    try {
      await withdrawConsent(consentId, 'User request via admin panel');
      await loadConsents(); // Refresh the list
    } catch (error) {
      console.error('Error withdrawing consent:', error);
    }
  };

  const getConsentStats = () => {
    const total = consents.length;
    const granted = consents.filter(c => c.status === 'granted').length;
    const withdrawn = consents.filter(c => c.status === 'withdrawn').length;
    const expired = consents.filter(c => c.status === 'expired').length;
    const pending = consents.filter(c => c.status === 'pending').length;

    return { total, granted, withdrawn, expired, pending };
  };

  const stats = getConsentStats();

  if (loading && consents.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Carregando consentimentos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gerenciamento de Consentimentos</h2>
          <p className="text-muted-foreground">
            Visualize e gerencie todos os consentimentos de usuários
          </p>
        </div>
        <Button onClick={loadConsents} disabled={loading}>
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

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concedidos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.granted}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retirados</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.withdrawn}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expirados</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.expired}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
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
              <Label htmlFor="search">Buscar por usuário</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="ID do usuário ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ConsentStatus | 'all')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="granted">Concedido</SelectItem>
                  <SelectItem value="withdrawn">Retirado</SelectItem>
                  <SelectItem value="expired">Expirado</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Finalidade</Label>
              <Select value={purposeFilter} onValueChange={(value) => setPurposeFilter(value as ConsentPurpose | 'all')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as finalidades</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="analytics">Analytics</SelectItem>
                  <SelectItem value="personalization">Personalização</SelectItem>
                  <SelectItem value="third_party_sharing">Compartilhamento com Terceiros</SelectItem>
                  <SelectItem value="data_processing">Processamento de Dados</SelectItem>
                  <SelectItem value="communication">Comunicação</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registros de Consentimento ({filteredConsents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Finalidade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de Concessão</TableHead>
                  <TableHead>Expiração</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConsents.map((consent) => (
                  <TableRow key={consent.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{consent.userId}</div>
                        {consent.userEmail && (
                          <div className="text-sm text-muted-foreground">{consent.userEmail}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getPurposeLabel(consent.purpose)}</TableCell>
                    <TableCell>{getStatusBadge(consent.status)}</TableCell>
                    <TableCell>
                      {format(new Date(consent.grantedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      {consent.expiresAt ? (
                        format(new Date(consent.expiresAt), 'dd/MM/yyyy', { locale: ptBR })
                      ) : (
                        <span className="text-muted-foreground">Sem expiração</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewHistory(consent)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        {consent.status === 'granted' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleWithdrawConsent(consent.id)}
                          >
                            <UserX className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Consent History Dialog */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Histórico de Consentimento</DialogTitle>
            <DialogDescription>
              Histórico completo de consentimento para {selectedConsent?.userEmail || selectedConsent?.userId}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {consentHistory.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Motivo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consentHistory.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {format(new Date(record.grantedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        {record.status === 'granted' ? 'Consentimento concedido' : 
                         record.status === 'withdrawn' ? 'Consentimento retirado' :
                         record.status === 'expired' ? 'Consentimento expirado' : 'Ação desconhecida'}
                      </TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell>
                        {record.withdrawalReason || 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum histórico encontrado
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

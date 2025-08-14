// NFE Management Component
// Story 5.5: List, create, and manage Brazilian electronic invoices

"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  FileText,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  Download,
  RefreshCw,
  Filter
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface NFEManagementProps {
  clinicId: string;
}

interface NFEDocument {
  id: string;
  numero_nfe: number;
  serie_nfe: number;
  tipo_documento: string;
  modelo_documento: string;
  natureza_operacao: string;
  valor_total: number;
  cliente_cnpj_cpf?: string;
  cliente_nome?: string;
  status: 'draft' | 'authorized' | 'cancelled' | 'rejected';
  protocolo_autorizacao?: string;
  created_at: string;
  updated_at: string;
}

export default function NFEManagement({ clinicId }: NFEManagementProps) {
  const [documents, setDocuments] = useState<NFEDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    status: '',
    customerName: '',
    startDate: '',
    endDate: ''
  });
  const [pagination, setPagination] = useState({
    limit: 20,
    offset: 0
  });

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        clinic_id: clinicId,
        limit: pagination.limit.toString(),
        offset: pagination.offset.toString()
      });

      // Add filters
      if (filters.status) params.append('status', filters.status);
      if (filters.customerName) params.append('customer_name', filters.customerName);
      if (filters.startDate) params.append('start_date', filters.startDate);
      if (filters.endDate) params.append('end_date', filters.endDate);

      const response = await fetch(`/api/tax/nfe?${params}`);
      if (!response.ok) {
        throw new Error('Failed to load NFE documents');
      }

      const data = await response.json();
      setDocuments(data.data);
      setTotal(data.total);
    } catch (err) {
      console.error('Error loading NFE documents:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [clinicId, pagination, filters]);

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPagination(prev => ({ ...prev, offset: 0 })); // Reset to first page
  };

  const handleAuthorizeNFE = async (nfeId: string) => {
    try {
      const response = await fetch(`/api/tax/nfe/${nfeId}/authorize`, {
        method: 'POST'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to authorize NFE');
      }

      // Reload documents to show updated status
      await loadDocuments();
    } catch (err) {
      console.error('Error authorizing NFE:', err);
      alert(err instanceof Error ? err.message : 'Authorization failed');
    }
  };

  const handleCancelNFE = async (nfeId: string) => {
    const reason = prompt('Digite o motivo do cancelamento:');
    if (!reason) return;

    try {
      const response = await fetch(`/api/tax/nfe/${nfeId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel NFE');
      }

      // Reload documents to show updated status
      await loadDocuments();
    } catch (err) {
      console.error('Error cancelling NFE:', err);
      alert(err instanceof Error ? err.message : 'Cancellation failed');
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      draft: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Rascunho' },
      authorized: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Autorizada' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Cancelada' },
      rejected: { color: 'bg-red-100 text-red-800', icon: AlertTriangle, label: 'Rejeitada' }
    };

    const { color, icon: Icon, label } = config[status as keyof typeof config] || config.draft;

    return (
      <Badge className={color}>
        <Icon className="h-3 w-3 mr-1" />
        {label}
      </Badge>
    );
  };

  const hasNextPage = total > pagination.offset + pagination.limit;
  const hasPrevPage = pagination.offset > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando NFes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Notas Fiscais Eletrônicas</h2>
          <p className="text-gray-600">{total} documento(s) encontrado(s)</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova NFe
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <Select onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="authorized">Autorizada</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                  <SelectItem value="rejected">Rejeitada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Cliente</label>
              <Input
                placeholder="Nome do cliente"
                value={filters.customerName}
                onChange={(e) => handleFilterChange('customerName', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Data Início</label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Data Fim</label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <span>Erro ao carregar dados: {error}</span>
            </div>
            <Button 
              onClick={loadDocuments} 
              variant="outline" 
              className="mt-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Documents Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    Nenhuma NFe encontrada
                  </TableCell>
                </TableRow>
              ) : (
                documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">
                      {doc.numero_nfe.toString().padStart(9, '0')}
                      <div className="text-xs text-gray-500">
                        Série: {doc.serie_nfe}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{doc.cliente_nome || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{doc.cliente_cnpj_cpf}</div>
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(doc.valor_total)}</TableCell>
                    <TableCell>{getStatusBadge(doc.status)}</TableCell>
                    <TableCell>
                      {new Date(doc.created_at).toLocaleDateString()}
                      <div className="text-xs text-gray-500">
                        {new Date(doc.created_at).toLocaleTimeString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        {doc.status === 'draft' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleAuthorizeNFE(doc.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        {doc.status === 'authorized' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleCancelNFE(doc.id)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {documents.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Mostrando {pagination.offset + 1} a {Math.min(pagination.offset + pagination.limit, total)} de {total} registros
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!hasPrevPage}
              onClick={() => setPagination(prev => ({ 
                ...prev, 
                offset: Math.max(0, prev.offset - prev.limit) 
              }))}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasNextPage}
              onClick={() => setPagination(prev => ({ 
                ...prev, 
                offset: prev.offset + prev.limit 
              }))}
            >
              Próximo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
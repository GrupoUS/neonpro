'use client';

import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  Database,
  Download,
  Eye,
  Filter,
  HardDrive,
  MoreHorizontal,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  XCircle,
} from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatBytes, formatDate, formatDuration } from '@/lib/utils';

// Types
type BackupRecord = {
  id: string;
  config_id: string;
  config_name: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  type: 'FULL' | 'INCREMENTAL' | 'DIFFERENTIAL' | 'DATABASE' | 'FILES';
  start_time: Date;
  end_time?: Date;
  duration?: number;
  size?: number;
  compressed_size?: number;
  file_count?: number;
  progress?: number;
  error_message?: string;
  storage_location?: string;
  initiated_by?: string;
};

type BackupDetails = {
  id: string;
  config_name: string;
  type: string;
  status: string;
  start_time: Date;
  end_time?: Date;
  duration?: number;
  size?: number;
  compressed_size?: number;
  file_count?: number;
  storage_location?: string;
  error_message?: string;
  files?: string[];
  metrics?: {
    compression_ratio: number;
    transfer_speed: number;
    verification_status: string;
  };
};

const BackupHistory: React.FC = () => {
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [filteredBackups, setFilteredBackups] = useState<BackupRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBackup, setSelectedBackup] = useState<BackupDetails | null>(
    null,
  );
  const [showDetails, setShowDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    dateFrom: '',
    dateTo: '',
    searchTerm: '',
  });

  const itemsPerPage = 20;

  useEffect(() => {
    loadBackupHistory();
  }, [loadBackupHistory]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const loadBackupHistory = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      const response = await fetch(`/api/backup/jobs?${params}`);
      if (response.ok) {
        const data = await response.json();
        setBackups(data.data || []);
        setTotalPages(Math.ceil((data.total || 0) / itemsPerPage));
      } else {
        toast.error('Erro ao carregar histórico de backups');
      }
    } catch (_error) {
      toast.error('Erro ao carregar histórico de backups');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...backups];

    if (filters.status) {
      filtered = filtered.filter((backup) => backup.status === filters.status);
    }

    if (filters.type) {
      filtered = filtered.filter((backup) => backup.type === filters.type);
    }

    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter(
        (backup) => new Date(backup.start_time) >= fromDate,
      );
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      filtered = filtered.filter(
        (backup) => new Date(backup.start_time) <= toDate,
      );
    }

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (backup) =>
          backup.config_name.toLowerCase().includes(term) ||
          backup.id.toLowerCase().includes(term),
      );
    }

    setFilteredBackups(filtered);
  };

  const loadBackupDetails = async (backupId: string) => {
    try {
      const response = await fetch(`/api/backup/jobs/${backupId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedBackup(data.data);
        setShowDetails(true);
      } else {
        toast.error('Erro ao carregar detalhes do backup');
      }
    } catch (_error) {
      toast.error('Erro ao carregar detalhes do backup');
    }
  };

  const handleDownloadBackup = async (_backupId: string) => {
    try {
      toast.info('Iniciando download do backup...');
      // Implementar download do backup
      // const response = await fetch(`/api/backup/jobs/${backupId}/download`);
      // ... lógica de download
    } catch (_error) {
      toast.error('Erro ao baixar backup');
    }
  };

  const handleDeleteBackup = async (backupId: string) => {
    try {
      const response = await fetch(`/api/backup/jobs/${backupId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Backup removido com sucesso');
        loadBackupHistory();
      } else {
        toast.error('Erro ao remover backup');
      }
    } catch (_error) {
      toast.error('Erro ao remover backup');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'RUNNING':
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'CANCELLED':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'DATABASE':
        return <Database className="h-4 w-4" />;
      case 'FILES':
        return <HardDrive className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'default';
      case 'FAILED':
        return 'destructive';
      case 'RUNNING':
        return 'secondary';
      case 'PENDING':
        return 'outline';
      case 'CANCELLED':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-2xl">Histórico de Backups</h2>
          <p className="text-muted-foreground">
            Visualize e gerencie o histórico completo de backups
          </p>
        </div>
        <Button disabled={loading} onClick={loadBackupHistory}>
          <RefreshCw
            className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
          />
          Atualizar
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  id="search"
                  onChange={(e) =>
                    setFilters({ ...filters, searchTerm: e.target.value })
                  }
                  placeholder="Nome ou ID..."
                  value={filters.searchTerm}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                onValueChange={(value) =>
                  setFilters({ ...filters, status: value })
                }
                value={filters.status}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="COMPLETED">Concluído</SelectItem>
                  <SelectItem value="FAILED">Falhou</SelectItem>
                  <SelectItem value="RUNNING">Em Execução</SelectItem>
                  <SelectItem value="PENDING">Pendente</SelectItem>
                  <SelectItem value="CANCELLED">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                onValueChange={(value) =>
                  setFilters({ ...filters, type: value })
                }
                value={filters.type}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="FULL">Completo</SelectItem>
                  <SelectItem value="INCREMENTAL">Incremental</SelectItem>
                  <SelectItem value="DIFFERENTIAL">Diferencial</SelectItem>
                  <SelectItem value="DATABASE">Banco de Dados</SelectItem>
                  <SelectItem value="FILES">Arquivos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateFrom">Data Inicial</Label>
              <Input
                id="dateFrom"
                onChange={(e) =>
                  setFilters({ ...filters, dateFrom: e.target.value })
                }
                type="date"
                value={filters.dateFrom}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateTo">Data Final</Label>
              <Input
                id="dateTo"
                onChange={(e) =>
                  setFilters({ ...filters, dateTo: e.target.value })
                }
                type="date"
                value={filters.dateTo}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Histórico */}
      <Card>
        <CardHeader>
          <CardTitle>Backups ({filteredBackups.length})</CardTitle>
          <CardDescription>
            Histórico completo de operações de backup
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center">
              <RefreshCw className="mx-auto mb-2 h-8 w-8 animate-spin" />
              <p>Carregando histórico...</p>
            </div>
          ) : filteredBackups.length === 0 ? (
            <div className="py-8 text-center">
              <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">Nenhum backup encontrado</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Configuração</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Início</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead>Tamanho</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBackups.map((backup) => (
                  <TableRow key={backup.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(backup.type)}
                        <div>
                          <div className="font-medium">
                            {backup.config_name}
                          </div>
                          <div className="text-muted-foreground text-sm">
                            {backup.id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{backup.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(backup.status)}
                        <Badge variant={getStatusColor(backup.status) as any}>
                          {backup.status}
                        </Badge>
                      </div>
                      {backup.status === 'FAILED' && backup.error_message && (
                        <div className="mt-1 max-w-xs truncate text-red-500 text-xs">
                          {backup.error_message}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDate(new Date(backup.start_time))}
                        <div className="text-muted-foreground">
                          {new Date(backup.start_time).toLocaleTimeString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {backup.duration ? (
                        formatDuration(backup.duration)
                      ) : backup.status === 'RUNNING' ? (
                        <span className="text-blue-500">Em execução...</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {backup.size ? (
                        <div>
                          <div>{formatBytes(backup.size)}</div>
                          {backup.compressed_size && (
                            <div className="text-muted-foreground text-xs">
                              Comprimido: {formatBytes(backup.compressed_size)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => loadBackupDetails(backup.id)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Detalhes
                          </DropdownMenuItem>
                          {backup.status === 'COMPLETED' && (
                            <DropdownMenuItem
                              onClick={() => handleDownloadBackup(backup.id)}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteBackup(backup.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remover
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            variant="outline"
          >
            Anterior
          </Button>
          <span className="flex items-center px-4">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            disabled={currentPage === totalPages}
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            variant="outline"
          >
            Próximo
          </Button>
        </div>
      )}

      {/* Dialog de Detalhes */}
      <Dialog onOpenChange={setShowDetails} open={showDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Backup</DialogTitle>
            <DialogDescription>
              Informações detalhadas sobre a operação de backup
            </DialogDescription>
          </DialogHeader>
          {selectedBackup && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium text-sm">ID</Label>
                  <p className="text-muted-foreground text-sm">
                    {selectedBackup.id}
                  </p>
                </div>
                <div>
                  <Label className="font-medium text-sm">Configuração</Label>
                  <p className="text-muted-foreground text-sm">
                    {selectedBackup.config_name}
                  </p>
                </div>
                <div>
                  <Label className="font-medium text-sm">Tipo</Label>
                  <p className="text-muted-foreground text-sm">
                    {selectedBackup.type}
                  </p>
                </div>
                <div>
                  <Label className="font-medium text-sm">Status</Label>
                  <Badge variant={getStatusColor(selectedBackup.status) as any}>
                    {selectedBackup.status}
                  </Badge>
                </div>
                <div>
                  <Label className="font-medium text-sm">Início</Label>
                  <p className="text-muted-foreground text-sm">
                    {formatDate(new Date(selectedBackup.start_time))} às{' '}
                    {new Date(selectedBackup.start_time).toLocaleTimeString()}
                  </p>
                </div>
                {selectedBackup.end_time && (
                  <div>
                    <Label className="font-medium text-sm">Fim</Label>
                    <p className="text-muted-foreground text-sm">
                      {formatDate(new Date(selectedBackup.end_time))} às{' '}
                      {new Date(selectedBackup.end_time).toLocaleTimeString()}
                    </p>
                  </div>
                )}
                {selectedBackup.duration && (
                  <div>
                    <Label className="font-medium text-sm">Duração</Label>
                    <p className="text-muted-foreground text-sm">
                      {formatDuration(selectedBackup.duration)}
                    </p>
                  </div>
                )}
                {selectedBackup.size && (
                  <div>
                    <Label className="font-medium text-sm">Tamanho</Label>
                    <p className="text-muted-foreground text-sm">
                      {formatBytes(selectedBackup.size)}
                      {selectedBackup.compressed_size && (
                        <span className="ml-2">
                          (Comprimido:{' '}
                          {formatBytes(selectedBackup.compressed_size)})
                        </span>
                      )}
                    </p>
                  </div>
                )}
                {selectedBackup.file_count && (
                  <div>
                    <Label className="font-medium text-sm">Arquivos</Label>
                    <p className="text-muted-foreground text-sm">
                      {selectedBackup.file_count.toLocaleString()} arquivo(s)
                    </p>
                  </div>
                )}
              </div>

              {selectedBackup.error_message && (
                <Alert className="border-red-200">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Erro:</strong> {selectedBackup.error_message}
                  </AlertDescription>
                </Alert>
              )}

              {selectedBackup.storage_location && (
                <div>
                  <Label className="font-medium text-sm">
                    Local de Armazenamento
                  </Label>
                  <p className="rounded bg-muted p-2 font-mono text-muted-foreground text-sm">
                    {selectedBackup.storage_location}
                  </p>
                </div>
              )}

              {selectedBackup.metrics && (
                <div>
                  <Label className="font-medium text-sm">Métricas</Label>
                  <div className="mt-2 grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="font-bold text-2xl text-blue-600">
                        {(
                          selectedBackup.metrics.compression_ratio * 100
                        ).toFixed(1)}
                        %
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Compressão
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-2xl text-green-600">
                        {formatBytes(selectedBackup.metrics.transfer_speed)}/s
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Velocidade
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-2xl text-purple-600">
                        {selectedBackup.metrics.verification_status === 'PASSED'
                          ? '✓'
                          : '✗'}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Verificação
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BackupHistory;

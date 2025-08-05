"use client";

import type {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  Database,
  Download,
  Eye,
  FileText,
  Filter,
  HardDrive,
  MoreHorizontal,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  XCircle,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import type { toast } from "sonner";
import type { Alert, AlertDescription } from "@/components/ui/alert";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Input } from "@/components/ui/input";
import type { Label } from "@/components/ui/label";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { formatBytes, formatDate, formatDuration } from "@/lib/utils";

// Types
interface BackupRecord {
  id: string;
  config_id: string;
  config_name: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED";
  type: "FULL" | "INCREMENTAL" | "DIFFERENTIAL" | "DATABASE" | "FILES";
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
}

interface BackupDetails {
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
}

const BackupHistory: React.FC = () => {
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [filteredBackups, setFilteredBackups] = useState<BackupRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBackup, setSelectedBackup] = useState<BackupDetails | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: "",
    type: "",
    dateFrom: "",
    dateTo: "",
    searchTerm: "",
  });

  const itemsPerPage = 20;

  useEffect(() => {
    loadBackupHistory();
  }, [currentPage]);

  useEffect(() => {
    applyFilters();
  }, [backups, filters]);

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
        toast.error("Erro ao carregar histórico de backups");
      }
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
      toast.error("Erro ao carregar histórico de backups");
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
      filtered = filtered.filter((backup) => new Date(backup.start_time) >= fromDate);
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      filtered = filtered.filter((backup) => new Date(backup.start_time) <= toDate);
    }

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (backup) =>
          backup.config_name.toLowerCase().includes(term) || backup.id.toLowerCase().includes(term),
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
        toast.error("Erro ao carregar detalhes do backup");
      }
    } catch (error) {
      console.error("Erro ao carregar detalhes:", error);
      toast.error("Erro ao carregar detalhes do backup");
    }
  };

  const handleDownloadBackup = async (backupId: string) => {
    try {
      toast.info("Iniciando download do backup...");
      // Implementar download do backup
      // const response = await fetch(`/api/backup/jobs/${backupId}/download`);
      // ... lógica de download
    } catch (error) {
      console.error("Erro ao baixar backup:", error);
      toast.error("Erro ao baixar backup");
    }
  };

  const handleDeleteBackup = async (backupId: string) => {
    try {
      const response = await fetch(`/api/backup/jobs/${backupId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Backup removido com sucesso");
        loadBackupHistory();
      } else {
        toast.error("Erro ao remover backup");
      }
    } catch (error) {
      console.error("Erro ao remover backup:", error);
      toast.error("Erro ao remover backup");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "FAILED":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "RUNNING":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "CANCELLED":
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "DATABASE":
        return <Database className="h-4 w-4" />;
      case "FILES":
        return <HardDrive className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "default";
      case "FAILED":
        return "destructive";
      case "RUNNING":
        return "secondary";
      case "PENDING":
        return "outline";
      case "CANCELLED":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Histórico de Backups</h2>
          <p className="text-muted-foreground">
            Visualize e gerencie o histórico completo de backups
          </p>
        </div>
        <Button onClick={loadBackupHistory} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Nome ou ID..."
                  value={filters.searchTerm}
                  onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
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
                value={filters.type}
                onValueChange={(value) => setFilters({ ...filters, type: value })}
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
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateTo">Data Final</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Histórico */}
      <Card>
        <CardHeader>
          <CardTitle>Backups ({filteredBackups.length})</CardTitle>
          <CardDescription>Histórico completo de operações de backup</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p>Carregando histórico...</p>
            </div>
          ) : filteredBackups.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
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
                          <div className="font-medium">{backup.config_name}</div>
                          <div className="text-sm text-muted-foreground">
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
                      {backup.status === "FAILED" && backup.error_message && (
                        <div className="text-xs text-red-500 mt-1 max-w-xs truncate">
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
                      ) : backup.status === "RUNNING" ? (
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
                            <div className="text-xs text-muted-foreground">
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
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => loadBackupDetails(backup.id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalhes
                          </DropdownMenuItem>
                          {backup.status === "COMPLETED" && (
                            <DropdownMenuItem onClick={() => handleDownloadBackup(backup.id)}>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteBackup(backup.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
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
            variant="outline"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          <span className="flex items-center px-4">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Próximo
          </Button>
        </div>
      )}

      {/* Dialog de Detalhes */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Backup</DialogTitle>
            <DialogDescription>Informações detalhadas sobre a operação de backup</DialogDescription>
          </DialogHeader>
          {selectedBackup && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">ID</Label>
                  <p className="text-sm text-muted-foreground">{selectedBackup.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Configuração</Label>
                  <p className="text-sm text-muted-foreground">{selectedBackup.config_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Tipo</Label>
                  <p className="text-sm text-muted-foreground">{selectedBackup.type}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge variant={getStatusColor(selectedBackup.status) as any}>
                    {selectedBackup.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Início</Label>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(new Date(selectedBackup.start_time))} às{" "}
                    {new Date(selectedBackup.start_time).toLocaleTimeString()}
                  </p>
                </div>
                {selectedBackup.end_time && (
                  <div>
                    <Label className="text-sm font-medium">Fim</Label>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(new Date(selectedBackup.end_time))} às{" "}
                      {new Date(selectedBackup.end_time).toLocaleTimeString()}
                    </p>
                  </div>
                )}
                {selectedBackup.duration && (
                  <div>
                    <Label className="text-sm font-medium">Duração</Label>
                    <p className="text-sm text-muted-foreground">
                      {formatDuration(selectedBackup.duration)}
                    </p>
                  </div>
                )}
                {selectedBackup.size && (
                  <div>
                    <Label className="text-sm font-medium">Tamanho</Label>
                    <p className="text-sm text-muted-foreground">
                      {formatBytes(selectedBackup.size)}
                      {selectedBackup.compressed_size && (
                        <span className="ml-2">
                          (Comprimido: {formatBytes(selectedBackup.compressed_size)})
                        </span>
                      )}
                    </p>
                  </div>
                )}
                {selectedBackup.file_count && (
                  <div>
                    <Label className="text-sm font-medium">Arquivos</Label>
                    <p className="text-sm text-muted-foreground">
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
                  <Label className="text-sm font-medium">Local de Armazenamento</Label>
                  <p className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded">
                    {selectedBackup.storage_location}
                  </p>
                </div>
              )}

              {selectedBackup.metrics && (
                <div>
                  <Label className="text-sm font-medium">Métricas</Label>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {(selectedBackup.metrics.compression_ratio * 100).toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground">Compressão</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {formatBytes(selectedBackup.metrics.transfer_speed)}/s
                      </p>
                      <p className="text-xs text-muted-foreground">Velocidade</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">
                        {selectedBackup.metrics.verification_status === "PASSED" ? "✓" : "✗"}
                      </p>
                      <p className="text-xs text-muted-foreground">Verificação</p>
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

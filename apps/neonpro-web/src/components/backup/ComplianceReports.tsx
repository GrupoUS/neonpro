'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Shield,
  FileText,
  Download,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Filter,
  Search,
  RefreshCw,
  Plus,
  Eye,
  BarChart3,
  Users,
  Lock,
  Globe,
  Archive,
} from 'lucide-react';
import { formatDate, formatBytes } from '@/lib/utils';
import { toast } from 'sonner';

// Types
interface ComplianceReport {
  id: string;
  title: string;
  type: 'LGPD' | 'ANVISA' | 'CFM' | 'ISO27001' | 'CUSTOM';
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: Date;
  updated_at: Date;
  period_start: Date;
  period_end: Date;
  generated_by: string;
  reviewed_by?: string;
  approval_date?: Date;
  findings: Array<{
    category: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    description: string;
    recommendation?: string;
  }>;
  metrics: {
    total_backups: number;
    successful_backups: number;
    failed_backups: number;
    compliance_score: number;
    data_protection_score: number;
    availability_score: number;
  };
}

interface ComplianceTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  requirements: string[];
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
}

interface ComplianceMetrics {
  overall_score: number;
  total_reports: number;
  approved_reports: number;
  pending_reports: number;
  critical_findings: number;
  last_audit_date?: Date;
  next_audit_date?: Date;
}

const ComplianceReports: React.FC = () => {
  const [reports, setReports] = useState<ComplianceReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<ComplianceReport[]>([]);
  const [templates, setTemplates] = useState<ComplianceTemplate[]>([]);
  const [metrics, setMetrics] = useState<ComplianceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ComplianceReport | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    searchTerm: '',
  });
  const [newReport, setNewReport] = useState({
    title: '',
    type: 'LGPD' as const,
    template_id: '',
    period_start: '',
    period_end: '',
    description: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [reports, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadReports(),
        loadTemplates(),
        loadMetrics(),
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados de compliance');
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async () => {
    const response = await fetch('/api/backup/compliance/reports');
    if (response.ok) {
      const data = await response.json();
      setReports(data.data || []);
    }
  };

  const loadTemplates = async () => {
    const response = await fetch('/api/backup/compliance/templates');
    if (response.ok) {
      const data = await response.json();
      setTemplates(data.data || []);
    }
  };

  const loadMetrics = async () => {
    const response = await fetch('/api/backup/compliance/metrics');
    if (response.ok) {
      const data = await response.json();
      setMetrics(data.data);
    }
  };

  const applyFilters = () => {
    let filtered = [...reports];

    if (filters.type) {
      filtered = filtered.filter(report => report.type === filters.type);
    }

    if (filters.status) {
      filtered = filtered.filter(report => report.status === filters.status);
    }

    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter(report => new Date(report.created_at) >= fromDate);
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      filtered = filtered.filter(report => new Date(report.created_at) <= toDate);
    }

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(report => 
        report.title.toLowerCase().includes(term) ||
        report.id.toLowerCase().includes(term)
      );
    }

    setFilteredReports(filtered);
  };

  const handleCreateReport = async () => {
    try {
      const response = await fetch('/api/backup/compliance/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newReport),
      });

      if (response.ok) {
        toast.success('Relatório criado com sucesso');
        setShowCreateDialog(false);
        setNewReport({
          title: '',
          type: 'LGPD',
          template_id: '',
          period_start: '',
          period_end: '',
          description: '',
        });
        loadReports();
      } else {
        toast.error('Erro ao criar relatório');
      }
    } catch (error) {
      console.error('Erro ao criar relatório:', error);
      toast.error('Erro ao criar relatório');
    }
  };

  const handleGenerateReport = async (reportId: string) => {
    try {
      toast.info('Gerando relatório...');
      const response = await fetch(`/api/backup/compliance/reports/${reportId}/generate`, {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Relatório gerado com sucesso');
        loadReports();
      } else {
        toast.error('Erro ao gerar relatório');
      }
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast.error('Erro ao gerar relatório');
    }
  };

  const handleDownloadReport = async (reportId: string, format: 'PDF' | 'XLSX' = 'PDF') => {
    try {
      const response = await fetch(`/api/backup/compliance/reports/${reportId}/download?format=${format}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `compliance-report-${reportId}.${format.toLowerCase()}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Download iniciado');
      } else {
        toast.error('Erro ao baixar relatório');
      }
    } catch (error) {
      console.error('Erro ao baixar relatório:', error);
      toast.error('Erro ao baixar relatório');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'LGPD':
        return <Shield className="h-4 w-4" />;
      case 'ANVISA':
        return <Users className="h-4 w-4" />;
      case 'CFM':
        return <Lock className="h-4 w-4" />;
      case 'ISO27001':
        return <Globe className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'DRAFT':
        return <FileText className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'default';
      case 'REJECTED':
        return 'destructive';
      case 'PENDING':
        return 'secondary';
      case 'DRAFT':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'text-red-600 bg-red-50';
      case 'HIGH':
        return 'text-orange-600 bg-orange-50';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-50';
      case 'LOW':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getComplianceScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Relatórios de Compliance</h2>
          <p className="text-muted-foreground">
            Gerencie relatórios de conformidade e auditoria
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={loadData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Relatório
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Relatório de Compliance</DialogTitle>
                <DialogDescription>
                  Configure um novo relatório de conformidade
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={newReport.title}
                    onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
                    placeholder="Ex: Relatório LGPD Mensal"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Compliance</Label>
                  <Select
                    value={newReport.type}
                    onValueChange={(value: any) => setNewReport({ ...newReport, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LGPD">LGPD</SelectItem>
                      <SelectItem value="ANVISA">ANVISA</SelectItem>
                      <SelectItem value="CFM">CFM</SelectItem>
                      <SelectItem value="ISO27001">ISO 27001</SelectItem>
                      <SelectItem value="CUSTOM">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="periodStart">Período Inicial</Label>
                    <Input
                      id="periodStart"
                      type="date"
                      value={newReport.period_start}
                      onChange={(e) => setNewReport({ ...newReport, period_start: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="periodEnd">Período Final</Label>
                    <Input
                      id="periodEnd"
                      type="date"
                      value={newReport.period_end}
                      onChange={(e) => setNewReport({ ...newReport, period_end: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Template (Opcional)</Label>
                  <Select
                    value={newReport.template_id}
                    onValueChange={(value) => setNewReport({ ...newReport, template_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={newReport.description}
                    onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                    placeholder="Descrição do relatório..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateReport}>
                    Criar Relatório
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Métricas de Compliance */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-2xl font-bold ${getComplianceScoreColor(metrics.overall_score)}`}>
                    {metrics.overall_score}%
                  </p>
                  <p className="text-sm text-muted-foreground">Score Geral</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{metrics.total_reports}</p>
                  <p className="text-sm text-muted-foreground">Total de Relatórios</p>
                </div>
                <FileText className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{metrics.pending_reports}</p>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-red-600">{metrics.critical_findings}</p>
                  <p className="text-sm text-muted-foreground">Achados Críticos</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
                  placeholder="Título ou ID..."
                  value={filters.searchTerm}
                  onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                  className="pl-9"
                />
              </div>
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
                  <SelectItem value="LGPD">LGPD</SelectItem>
                  <SelectItem value="ANVISA">ANVISA</SelectItem>
                  <SelectItem value="CFM">CFM</SelectItem>
                  <SelectItem value="ISO27001">ISO 27001</SelectItem>
                  <SelectItem value="CUSTOM">Personalizado</SelectItem>
                </SelectContent>
              </Select>
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
                  <SelectItem value="DRAFT">Rascunho</SelectItem>
                  <SelectItem value="PENDING">Pendente</SelectItem>
                  <SelectItem value="APPROVED">Aprovado</SelectItem>
                  <SelectItem value="REJECTED">Rejeitado</SelectItem>
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

      {/* Lista de Relatórios */}
      <Card>
        <CardHeader>
          <CardTitle>
            Relatórios ({filteredReports.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p>Carregando relatórios...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum relatório encontrado</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Relatório</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Criado</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(report.type)}
                        <div>
                          <div className="font-medium">{report.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {report.id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{report.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(report.status)}
                        <Badge variant={getStatusColor(report.status) as any}>
                          {report.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDate(new Date(report.period_start))} -{' '}
                        {formatDate(new Date(report.period_end))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium ${getComplianceScoreColor(report.metrics.compliance_score)}`}>
                        {report.metrics.compliance_score}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDate(new Date(report.created_at))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedReport(report);
                            setShowDetailsDialog(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadReport(report.id)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        {report.status === 'DRAFT' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleGenerateReport(report.id)}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Detalhes */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Relatório</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Título</Label>
                  <p className="text-sm text-muted-foreground">{selectedReport.title}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Tipo</Label>
                  <p className="text-sm text-muted-foreground">{selectedReport.type}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Período</Label>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(new Date(selectedReport.period_start))} -{' '}
                    {formatDate(new Date(selectedReport.period_end))}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Criado por</Label>
                  <p className="text-sm text-muted-foreground">{selectedReport.generated_by}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <p className={`text-2xl font-bold ${getComplianceScoreColor(selectedReport.metrics.compliance_score)}`}>
                        {selectedReport.metrics.compliance_score}%
                      </p>
                      <p className="text-sm text-muted-foreground">Compliance</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <p className={`text-2xl font-bold ${getComplianceScoreColor(selectedReport.metrics.data_protection_score)}`}>
                        {selectedReport.metrics.data_protection_score}%
                      </p>
                      <p className="text-sm text-muted-foreground">Proteção</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <p className={`text-2xl font-bold ${getComplianceScoreColor(selectedReport.metrics.availability_score)}`}>
                        {selectedReport.metrics.availability_score}%
                      </p>
                      <p className="text-sm text-muted-foreground">Disponibilidade</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {selectedReport.findings.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Achados</Label>
                  <div className="space-y-2 mt-2">
                    {selectedReport.findings.map((finding, index) => (
                      <Alert key={index} className={getSeverityColor(finding.severity)}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <strong>{finding.category}:</strong> {finding.description}
                              {finding.recommendation && (
                                <div className="mt-1 text-sm">
                                  <strong>Recomendação:</strong> {finding.recommendation}
                                </div>
                              )}
                            </div>
                            <Badge variant="outline" className="ml-2">
                              {finding.severity}
                            </Badge>
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))}
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

export default ComplianceReports;

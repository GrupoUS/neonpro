'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Search, 
  Filter, 
  Download, 
  Share2, 
  Eye,
  Calendar,
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  Users,
  FileText,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { useVisionAnalysis } from '@/hooks/useVisionAnalysis';
import { AnalysisResults } from '@/components/vision/AnalysisResults';
import { BeforeAfterComparison } from '@/components/vision/BeforeAfterComparison';
import { cn } from '@/lib/utils';

interface AnalysisReport {
  id: string;
  patientId: string;
  patientName: string;
  treatmentType: string;
  analysisDate: Date;
  accuracyScore: number;
  processingTime: number;
  improvementPercentage: number;
  status: 'completed' | 'processing' | 'failed';
  beforeImageUrl: string;
  afterImageUrl: string;
  tags: string[];
}

interface ReportFilters {
  searchTerm: string;
  treatmentType: string;
  dateRange: string;
  accuracyRange: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface ReportStats {
  totalReports: number;
  averageAccuracy: number;
  averageImprovement: number;
  averageProcessingTime: number;
  successRate: number;
  treatmentDistribution: Record<string, number>;
}

export default function VisionReportsPage() {
  const { analysisHistory, loadAnalysisHistory, exportAnalysis } = useVisionAnalysis();
  
  const [reports, setReports] = useState<AnalysisReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<AnalysisReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  const [filters, setFilters] = useState<ReportFilters>({
    searchTerm: '',
    treatmentType: '',
    dateRange: '',
    accuracyRange: '',
    sortBy: 'analysisDate',
    sortOrder: 'desc'
  });

  // Mock data for demonstration
  useEffect(() => {
    const loadReports = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockReports: AnalysisReport[] = [
        {
          id: 'RPT-001',
          patientId: 'PAT-2024001',
          patientName: 'Maria Silva',
          treatmentType: 'skin-aesthetic',
          analysisDate: new Date('2024-01-15'),
          accuracyScore: 0.967,
          processingTime: 18500,
          improvementPercentage: 78.5,
          status: 'completed',
          beforeImageUrl: '/images/before-1.jpg',
          afterImageUrl: '/images/after-1.jpg',
          tags: ['facial', 'rejuvenation']
        },
        {
          id: 'RPT-002',
          patientId: 'PAT-2024002',
          patientName: 'João Santos',
          treatmentType: 'scar-treatment',
          analysisDate: new Date('2024-01-14'),
          accuracyScore: 0.954,
          processingTime: 22100,
          improvementPercentage: 65.2,
          status: 'completed',
          beforeImageUrl: '/images/before-2.jpg',
          afterImageUrl: '/images/after-2.jpg',
          tags: ['scar', 'healing']
        },
        {
          id: 'RPT-003',
          patientId: 'PAT-2024003',
          patientName: 'Ana Costa',
          treatmentType: 'pigmentation',
          analysisDate: new Date('2024-01-13'),
          accuracyScore: 0.981,
          processingTime: 16800,
          improvementPercentage: 82.1,
          status: 'completed',
          beforeImageUrl: '/images/before-3.jpg',
          afterImageUrl: '/images/after-3.jpg',
          tags: ['pigmentation', 'melasma']
        }
      ];
      
      setReports(mockReports);
      setIsLoading(false);
    };

    loadReports();
  }, []);

  // Filter and sort reports
  const filteredReports = useMemo(() => {
    const filtered = reports.filter(report => {
      const matchesSearch = 
        report.patientName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        report.patientId.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        report.id.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      const matchesTreatment = !filters.treatmentType || report.treatmentType === filters.treatmentType;
      
      const matchesAccuracy = (() => {
        if (!filters.accuracyRange) return true;
        const accuracy = report.accuracyScore * 100;
        switch (filters.accuracyRange) {
          case 'high': return accuracy >= 95;
          case 'medium': return accuracy >= 90 && accuracy < 95;
          case 'low': return accuracy < 90;
          default: return true;
        }
      })();
      
      return matchesSearch && matchesTreatment && matchesAccuracy;
    });

    // Sort reports
    filtered.sort((a, b) => {
      const aValue = a[filters.sortBy as keyof AnalysisReport];
      const bValue = b[filters.sortBy as keyof AnalysisReport];
      
      let comparison = 0;
      if (aValue < bValue) comparison = -1;
      if (aValue > bValue) comparison = 1;
      
      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [reports, filters]);

  // Calculate statistics
  const reportStats: ReportStats = useMemo(() => {
    if (filteredReports.length === 0) {
      return {
        totalReports: 0,
        averageAccuracy: 0,
        averageImprovement: 0,
        averageProcessingTime: 0,
        successRate: 0,
        treatmentDistribution: {}
      };
    }

    const totalReports = filteredReports.length;
    const averageAccuracy = filteredReports.reduce((sum, r) => sum + r.accuracyScore, 0) / totalReports;
    const averageImprovement = filteredReports.reduce((sum, r) => sum + r.improvementPercentage, 0) / totalReports;
    const averageProcessingTime = filteredReports.reduce((sum, r) => sum + r.processingTime, 0) / totalReports;
    const successRate = filteredReports.filter(r => r.status === 'completed').length / totalReports;
    
    const treatmentDistribution = filteredReports.reduce((acc, report) => {
      acc[report.treatmentType] = (acc[report.treatmentType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalReports,
      averageAccuracy,
      averageImprovement,
      averageProcessingTime,
      successRate,
      treatmentDistribution
    };
  }, [filteredReports]);

  // Pagination
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleExportReport = async (reportId: string) => {
    try {
      await exportAnalysis(reportId);
      toast.success('Relatório exportado com sucesso');
    } catch (error) {
      toast.error('Falha ao exportar relatório');
    }
  };

  const handleViewReport = (report: AnalysisReport) => {
    setSelectedReport(report);
  };

  const getStatusBadge = (status: AnalysisReport['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Concluído</Badge>;
      case 'processing':
        return <Badge className="bg-yellow-100 text-yellow-800">Processando</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Falhou</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getTreatmentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'skin-aesthetic': 'Estético - Pele',
      'medical-healing': 'Médico - Cicatrização',
      'body-contouring': 'Contorno Corporal',
      'facial-rejuvenation': 'Rejuvenescimento Facial',
      'scar-treatment': 'Tratamento de Cicatrizes',
      'pigmentation': 'Tratamento de Pigmentação'
    };
    return labels[type] || type;
  };

  if (selectedReport) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => setSelectedReport(null)}
            className="mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Voltar aos Relatórios
          </Button>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Relatório Detalhado</h1>
              <p className="text-gray-600">
                {selectedReport.patientName} - {selectedReport.id}
              </p>
            </div>
          </div>
        </div>

        <BeforeAfterComparison 
          beforeImageUrl={selectedReport.beforeImageUrl}
          afterImageUrl={selectedReport.afterImageUrl}
          analysisResult={{
            id: selectedReport.id,
            patientId: selectedReport.patientId,
            beforeImageId: 'before-' + selectedReport.id,
            afterImageId: 'after-' + selectedReport.id,
            accuracyScore: selectedReport.accuracyScore,
            processingTime: selectedReport.processingTime,
            improvementPercentage: selectedReport.improvementPercentage,
            changeMetrics: {
              overallImprovement: selectedReport.improvementPercentage
            },
            annotations: [],
            confidence: selectedReport.accuracyScore,
            analysisDate: selectedReport.analysisDate
          }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BarChart3 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Relatórios de Análise</h1>
            <p className="text-gray-600">
              Visualize e gerencie todas as análises de visão computacional
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Total</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {reportStats.totalReports}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Precisão Média</span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {(reportStats.averageAccuracy * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Melhoria Média</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {reportStats.averageImprovement.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Tempo Médio</span>
            </div>
            <p className="text-2xl font-bold text-orange-600">
              {(reportStats.averageProcessingTime / 1000).toFixed(1)}s
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-indigo-600" />
              <span className="text-sm font-medium">Taxa Sucesso</span>
            </div>
            <p className="text-2xl font-bold text-indigo-600">
              {(reportStats.successRate * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Nome, ID do paciente..."
                  value={filters.searchTerm}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="treatment">Tipo de Tratamento</Label>
              <Select 
                value={filters.treatmentType} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, treatmentType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tratamentos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os tratamentos</SelectItem>
                  <SelectItem value="skin-aesthetic">Estético - Pele</SelectItem>
                  <SelectItem value="medical-healing">Médico - Cicatrização</SelectItem>
                  <SelectItem value="body-contouring">Contorno Corporal</SelectItem>
                  <SelectItem value="facial-rejuvenation">Rejuvenescimento Facial</SelectItem>
                  <SelectItem value="scar-treatment">Tratamento de Cicatrizes</SelectItem>
                  <SelectItem value="pigmentation">Tratamento de Pigmentação</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="accuracy">Faixa de Precisão</Label>
              <Select 
                value={filters.accuracyRange} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, accuracyRange: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as precisões" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as precisões</SelectItem>
                  <SelectItem value="high">Alta (≥95%)</SelectItem>
                  <SelectItem value="medium">Média (90-95%)</SelectItem>
                  <SelectItem value="low">Baixa (&lt;90%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="sort">Ordenar por</Label>
              <Select 
                value={`${filters.sortBy}-${filters.sortOrder}`} 
                onValueChange={(value) => {
                  const [sortBy, sortOrder] = value.split('-');
                  setFilters(prev => ({ 
                    ...prev, 
                    sortBy, 
                    sortOrder: sortOrder as 'asc' | 'desc' 
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="analysisDate-desc">Data (Mais recente)</SelectItem>
                  <SelectItem value="analysisDate-asc">Data (Mais antiga)</SelectItem>
                  <SelectItem value="accuracyScore-desc">Precisão (Maior)</SelectItem>
                  <SelectItem value="accuracyScore-asc">Precisão (Menor)</SelectItem>
                  <SelectItem value="improvementPercentage-desc">Melhoria (Maior)</SelectItem>
                  <SelectItem value="improvementPercentage-asc">Melhoria (Menor)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Relatórios de Análise</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar Todos
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Carregando relatórios...</span>
            </div>
          ) : paginatedReports.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum relatório encontrado</p>
              <p className="text-sm text-gray-500">Ajuste os filtros ou execute novas análises</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {paginatedReports.map((report) => (
                  <div 
                    key={report.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{report.patientName}</h3>
                          <Badge variant="outline">{report.id}</Badge>
                          {getStatusBadge(report.status)}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Tratamento:</span>
                            <br />
                            {getTreatmentTypeLabel(report.treatmentType)}
                          </div>
                          <div>
                            <span className="font-medium">Data:</span>
                            <br />
                            {report.analysisDate.toLocaleDateString('pt-BR')}
                          </div>
                          <div>
                            <span className="font-medium">Precisão:</span>
                            <br />
                            <span className={cn(
                              "font-semibold",
                              report.accuracyScore >= 0.95 ? "text-green-600" : "text-yellow-600"
                            )}>
                              {(report.accuracyScore * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">Melhoria:</span>
                            <br />
                            <span className="font-semibold text-blue-600">
                              {report.improvementPercentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewReport(report)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleExportReport(report.id)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Exportar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    Mostrando {(currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, filteredReports.length)} de {filteredReports.length} relatórios
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    <span className="text-sm font-medium">
                      Página {currentPage} de {totalPages}
                    </span>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
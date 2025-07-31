'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  TrendingUp,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  Download,
  Eye,
  Activity,
  BarChart3,
  FileText,
  Target,
  Zap
} from 'lucide-react';
import { useComplianceAssessment } from '@/hooks/useLGPD';
import { ComplianceAssessment, AssessmentStatus, ComplianceArea } from '@/types/lgpd';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Compliance Assessment Panel
 * 
 * Comprehensive panel for LGPD compliance assessments including:
 * - Assessment execution and monitoring
 * - Compliance score tracking
 * - Area-specific compliance analysis
 * - Recommendations and action items
 * - Historical assessment comparison
 */
export function ComplianceAssessmentPanel() {
  const {
    assessments,
    currentAssessment,
    loading,
    error,
    loadAssessments,
    runAssessment,
    getAssessmentDetails
  } = useComplianceAssessment();

  const [selectedAssessment, setSelectedAssessment] = useState<ComplianceAssessment | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [runningAssessment, setRunningAssessment] = useState(false);

  useEffect(() => {
    loadAssessments();
  }, [loadAssessments]);

  const handleRunAssessment = async () => {
    setRunningAssessment(true);
    try {
      await runAssessment();
      await loadAssessments();
    } catch (error) {
      console.error('Error running assessment:', error);
    } finally {
      setRunningAssessment(false);
    }
  };

  const handleViewDetails = async (assessment: ComplianceAssessment) => {
    try {
      const details = await getAssessmentDetails(assessment.id);
      setSelectedAssessment({ ...assessment, ...details });
      setShowDetails(true);
    } catch (error) {
      console.error('Error loading assessment details:', error);
    }
  };

  const getStatusBadge = (status: AssessmentStatus) => {
    switch (status) {
      case 'running':
        return <Badge className="bg-blue-100 text-blue-800"><Activity className="h-3 w-3 mr-1" />Em Execução</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Concluída</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Falhou</Badge>;
      case 'scheduled':
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Agendada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    if (score >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const getComplianceLevel = (score: number) => {
    if (score >= 90) return 'Excelente';
    if (score >= 80) return 'Bom';
    if (score >= 70) return 'Adequado';
    if (score >= 60) return 'Atenção';
    return 'Crítico';
  };

  const getAreaLabel = (area: ComplianceArea) => {
    const labels: Record<ComplianceArea, string> = {
      'consent_management': 'Gestão de Consentimento',
      'data_subject_rights': 'Direitos dos Titulares',
      'data_protection': 'Proteção de Dados',
      'breach_management': 'Gestão de Incidentes',
      'audit_trail': 'Trilha de Auditoria',
      'retention_policies': 'Políticas de Retenção',
      'third_party_sharing': 'Compartilhamento com Terceiros',
      'documentation': 'Documentação'
    };
    return labels[area] || area;
  };

  const getLatestAssessment = () => {
    return assessments.find(a => a.status === 'completed') || null;
  };

  const getAssessmentTrend = () => {
    const completed = assessments.filter(a => a.status === 'completed').slice(0, 2);
    if (completed.length < 2) return null;
    
    const latest = completed[0];
    const previous = completed[1];
    const trend = latest.overallScore - previous.overallScore;
    
    return {
      trend,
      isImproving: trend > 0,
      percentage: Math.abs(trend)
    };
  };

  const latestAssessment = getLatestAssessment();
  const trend = getAssessmentTrend();

  if (loading && assessments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Carregando avaliações...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Avaliações de Conformidade</h2>
          <p className="text-muted-foreground">
            Execute e monitore avaliações automáticas de conformidade LGPD
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={loadAssessments} disabled={loading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button onClick={handleRunAssessment} disabled={runningAssessment || currentAssessment?.status === 'running'}>
            <Zap className={`h-4 w-4 mr-2 ${runningAssessment ? 'animate-pulse' : ''}`} />
            {runningAssessment ? 'Executando...' : 'Nova Avaliação'}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Current Assessment Status */}
      {currentAssessment && currentAssessment.status === 'running' && (
        <Alert>
          <Activity className="h-4 w-4" />
          <AlertTitle>Avaliação em Execução</AlertTitle>
          <AlertDescription>
            Uma avaliação de conformidade está sendo executada. Isso pode levar alguns minutos.
            <div className="mt-2">
              <Progress value={currentAssessment.progress || 0} className="w-full" />
              <p className="text-sm text-muted-foreground mt-1">
                Progresso: {currentAssessment.progress || 0}%
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Latest Assessment Overview */}
      {latestAssessment && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Score Geral</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${getComplianceColor(latestAssessment.overallScore)}`}>
                {latestAssessment.overallScore}%
              </div>
              <p className="text-xs text-muted-foreground">
                {getComplianceLevel(latestAssessment.overallScore)}
                {trend && (
                  <span className={`ml-2 ${trend.isImproving ? 'text-green-600' : 'text-red-600'}`}>
                    {trend.isImproving ? '↗' : '↘'} {trend.percentage.toFixed(1)}%
                  </span>
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Última Avaliação</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {format(new Date(latestAssessment.completedAt!), 'dd/MM', { locale: ptBR })}
              </div>
              <p className="text-xs text-muted-foreground">
                {format(new Date(latestAssessment.completedAt!), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recomendações</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {latestAssessment.recommendations?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Ações sugeridas
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="areas">Áreas de Conformidade</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {latestAssessment ? (
            <>
              {/* Compliance Areas */}
              <Card>
                <CardHeader>
                  <CardTitle>Conformidade por Área</CardTitle>
                  <CardDescription>
                    Pontuação detalhada por área de conformidade LGPD
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {latestAssessment.areaScores && Object.entries(latestAssessment.areaScores).map(([area, score]) => (
                      <div key={area} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{getAreaLabel(area as ComplianceArea)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-32">
                            <Progress value={score} className="h-2" />
                          </div>
                          <span className={`text-sm font-medium ${getComplianceColor(score)}`}>
                            {score}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              {latestAssessment.recommendations && latestAssessment.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recomendações de Melhoria</CardTitle>
                    <CardDescription>
                      Ações sugeridas para melhorar a conformidade LGPD
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {latestAssessment.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                          <div className="flex-shrink-0">
                            {recommendation.priority === 'high' ? (
                              <AlertTriangle className="h-5 w-5 text-red-500" />
                            ) : recommendation.priority === 'medium' ? (
                              <Clock className="h-5 w-5 text-yellow-500" />
                            ) : (
                              <CheckCircle className="h-5 w-5 text-blue-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium">{recommendation.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {recommendation.description}
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge variant={recommendation.priority === 'high' ? 'destructive' : 
                                            recommendation.priority === 'medium' ? 'default' : 'secondary'}>
                                {recommendation.priority === 'high' ? 'Alta' :
                                 recommendation.priority === 'medium' ? 'Média' : 'Baixa'}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                Área: {getAreaLabel(recommendation.area)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhuma Avaliação Disponível</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Execute sua primeira avaliação de conformidade LGPD para visualizar métricas e recomendações.
                </p>
                <Button onClick={handleRunAssessment} disabled={runningAssessment}>
                  <Zap className="h-4 w-4 mr-2" />
                  Executar Primeira Avaliação
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Avaliações</CardTitle>
              <CardDescription>
                Todas as avaliações de conformidade executadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Score Geral</TableHead>
                      <TableHead>Duração</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assessments.map((assessment) => (
                      <TableRow key={assessment.id}>
                        <TableCell>
                          {format(new Date(assessment.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </TableCell>
                        <TableCell>{getStatusBadge(assessment.status)}</TableCell>
                        <TableCell>
                          {assessment.status === 'completed' ? (
                            <span className={getComplianceColor(assessment.overallScore)}>
                              {assessment.overallScore}%
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {assessment.completedAt && assessment.createdAt ? (
                            `${Math.round(
                              (new Date(assessment.completedAt).getTime() - 
                               new Date(assessment.createdAt).getTime()) / 1000
                            )}s`
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {assessment.status === 'completed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(assessment)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Detalhes
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="areas" className="space-y-4">
          {latestAssessment?.areaScores ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Object.entries(latestAssessment.areaScores).map(([area, score]) => (
                <Card key={area}>
                  <CardHeader>
                    <CardTitle className="text-lg">{getAreaLabel(area as ComplianceArea)}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Conformidade</span>
                        <span className={`text-lg font-bold ${getComplianceColor(score)}`}>
                          {score}%
                        </span>
                      </div>
                      <Progress value={score} className="h-2" />
                      <p className="text-sm text-muted-foreground">
                        {getComplianceLevel(score)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Dados de Área Não Disponíveis</h3>
                <p className="text-muted-foreground text-center">
                  Execute uma avaliação para visualizar a conformidade por área.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

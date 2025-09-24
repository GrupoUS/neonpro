'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api';
import {
  ContraindicationAnalysis,
  ContraindicationRisk,
  PatientAssessment,
} from '@/types/ai-clinical-support';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Activity,
  AlertTriangle,
  Bone,
  Brain,
  CheckCircle,
  Eye,
  FileDown,
  Filter,
  Heart,
  Leaf,
  Pill,
  Scissors,
  Shield,
  Syringe,
  Thermometer,
  XCircle,
  Zap,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface ContraindicationAnalysisProps {
  patientId: string;
  procedureId?: string;
  treatmentPlanId?: string;
  onExportReport?: (analysis: ContraindicationAnalysis) => void;
}

export function ContraindicationAnalysis({
  patientId,
  procedureId,
  treatmentPlanId,
  onExportReport,
}: ContraindicationAnalysisProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showOnlyCritical, setShowOnlyCritical] = useState(false);
  const [activeTab, setActiveTab] = useState('analysis');

  // Fetch contraindication analysis
  const { data: analysis, isLoading, error } = useQuery({
    queryKey: ['contraindication-analysis', patientId, procedureId, treatmentPlanId],
    queryFn: async () => {
      return await api.aiClinicalSupport.analyzeContraindications({
        patientId,
        procedureId,
        treatmentPlanId,
        includeDetailedAnalysis: true,
      });
    },
    enabled: !!patientId,
  });

  const filteredRisks = analysis?.contraindicationRisks.filter(risk => {
    if (showOnlyCritical && risk.severity !== 'critical') return false;
    if (selectedCategory !== 'all' && risk.category !== selectedCategory) return false;
    return true;
  }) || [];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className='h-4 w-4' />;
      case 'high':
        return <AlertTriangle className='h-4 w-4' />;
      case 'moderate':
        return <AlertTriangle className='h-4 w-4' />;
      case 'low':
        return <Shield className='h-4 w-4' />;
      default:
        return <CheckCircle className='h-4 w-4' />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'medical':
        return <Heart className='h-4 w-4' />;
      case 'dermatological':
        return <Eye className='h-4 w-4' />;
      case 'medication':
        return <Pill className='h-4 w-4' />;
      case 'allergy':
        return <Leaf className='h-4 w-4' />;
      case 'lifestyle':
        return <Activity className='h-4 w-4' />;
      case 'procedural':
        return <Scissors className='h-4 w-4' />;
      default:
        return <Zap className='h-4 w-4' />;
    }
  };

  const categories = [
    { id: 'all', label: 'Todos', icon: <Filter className='h-4 w-4' /> },
    { id: 'medical', label: 'Médicas', icon: <Heart className='h-4 w-4' /> },
    { id: 'dermatological', label: 'Dermatológicas', icon: <Eye className='h-4 w-4' /> },
    { id: 'medication', label: 'Medicamentos', icon: <Pill className='h-4 w-4' /> },
    { id: 'allergy', label: 'Alergias', icon: <Leaf className='h-4 w-4' /> },
    { id: 'lifestyle', label: 'Estilo de Vida', icon: <Activity className='h-4 w-4' /> },
    { id: 'procedural', label: 'Procedurais', icon: <Scissors className='h-4 w-4' /> },
  ];

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <div className='animate-pulse'>
          <div className='h-8 bg-gray-200 rounded mb-4'></div>
          <div className='h-32 bg-gray-200 rounded'></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant='destructive'>
        <AlertTriangle className='h-4 w-4' />
        <AlertTitle>Erro na análise de contraindicações</AlertTitle>
        <AlertDescription>
          Não foi possível realizar a análise. Por favor, tente novamente.
        </AlertDescription>
      </Alert>
    );
  }

  if (!analysis) {
    return (
      <Card>
        <CardContent className='p-6'>
          <div className='text-center'>
            <Shield className='mx-auto h-12 w-12 text-gray-400 mb-4' />
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              Análise de Segurança
            </h3>
            <p className='text-gray-500 mb-4'>
              Selecione um procedimento para análise completa de contraindicações.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900'>
            Análise de Contraindicações
          </h2>
          <p className='text-gray-600 mt-1'>
            Avaliação de segurança baseada em IA para {analysis.patientInfo?.name}
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            onClick={() => onExportReport?.(analysis)}
            className='flex items-center gap-2'
          >
            <FileDown className='h-4 w-4' />
            Exportar Relatório
          </Button>
        </div>
      </div>

      {/* Risk Summary */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card
          className={analysis.overallRiskLevel === 'critical' ? 'border-red-200 bg-red-50' : ''}
        >
          <CardContent className='p-4'>
            <div className='flex items-center gap-2'>
              {getSeverityIcon(analysis.overallRiskLevel)}
              <div>
                <div className='text-sm text-gray-500'>Risco Geral</div>
                <div className='text-lg font-bold capitalize'>{analysis.overallRiskLevel}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='text-sm text-gray-500'>Contraindicações</div>
            <div className='text-lg font-bold'>{analysis.contraindicationRisks.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='text-sm text-gray-500'>Risco Crítico</div>
            <div className='text-lg font-bold text-red-600'>
              {analysis.contraindicationRisks.filter(r => r.severity === 'critical').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='text-sm text-gray-500'>Seguro para Tratamento</div>
            <div className='text-lg font-bold'>
              {analysis.isSafeForTreatment ? 'Sim' : 'Não'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Safety Recommendation */}
      {analysis.safetyRecommendation && (
        <Alert
          className={analysis.isSafeForTreatment
            ? 'border-green-200 bg-green-50'
            : 'border-red-200 bg-red-50'}
        >
          <AlertTriangle className='h-4 w-4' />
          <AlertTitle>Recomendação de Segurança</AlertTitle>
          <AlertDescription className='text-base'>
            {analysis.safetyRecommendation}
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='analysis'>Análise Detalhada</TabsTrigger>
          <TabsTrigger value='mitigation'>Medidas Mitigadoras</TabsTrigger>
          <TabsTrigger value='guidelines'>Diretrizes</TabsTrigger>
        </TabsList>

        {/* Detailed Analysis */}
        <TabsContent value='analysis' className='space-y-4'>
          {/* Filters */}
          <div className='flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg'>
            <div className='flex items-center gap-2'>
              <input
                type='checkbox'
                id='critical-only'
                checked={showOnlyCritical}
                onChange={e => setShowOnlyCritical(e.target.checked)}
                className='h-4 w-4 text-red-600 rounded border-gray-300'
              />
              <label htmlFor='critical-only' className='text-sm font-medium'>
                Apenas críticos
              </label>
            </div>

            <div className='flex items-center gap-2'>
              <span className='text-sm font-medium'>Categoria:</span>
              <div className='flex flex-wrap gap-2'>
                {categories.map(category => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => setSelectedCategory(category.id)}
                    className='flex items-center gap-1'
                  >
                    {category.icon}
                    {category.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Contraindication Risks */}
          <div className='space-y-4'>
            {filteredRisks.length === 0
              ? (
                <Card>
                  <CardContent className='p-6'>
                    <div className='text-center'>
                      <CheckCircle className='mx-auto h-12 w-12 text-green-500 mb-4' />
                      <h3 className='text-lg font-medium text-gray-900 mb-2'>
                        Nenhuma contraindicação encontrada
                      </h3>
                      <p className='text-gray-500'>
                        {showOnlyCritical
                          ? 'Não há contraindicações críticas com os filtros atuais.'
                          : 'O paciente não apresenta contraindicações significativas.'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
              : (
                filteredRisks.map(risk => (
                  <ContraindicationRiskCard
                    key={risk.id}
                    risk={risk}
                    getSeverityColor={getSeverityColor}
                    getSeverityIcon={getSeverityIcon}
                    getCategoryIcon={getCategoryIcon}
                  />
                ))
              )}
          </div>
        </TabsContent>

        {/* Mitigation Measures */}
        <TabsContent value='mitigation' className='space-y-4'>
          {analysis.mitigationMeasures.length === 0
            ? (
              <Card>
                <CardContent className='p-6'>
                  <div className='text-center'>
                    <Shield className='mx-auto h-12 w-12 text-gray-400 mb-4' />
                    <h3 className='text-lg font-medium text-gray-900 mb-2'>
                      Sem medidas mitigadoras necessárias
                    </h3>
                    <p className='text-gray-500'>
                      Não foram identificadas contraindicações que requerem medidas mitigadoras.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
            : (
              <div className='space-y-4'>
                {analysis.mitigationMeasures.map((measure, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className='flex items-center gap-2 text-lg'>
                        <Shield className='h-5 w-5' />
                        {measure.title}
                      </CardTitle>
                      <CardDescription>
                        {measure.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className='space-y-4'>
                        <div>
                          <h4 className='font-medium text-sm mb-2'>Aplicável para:</h4>
                          <div className='flex flex-wrap gap-2'>
                            {measure.applicableContraindications.map((contraindication, idx) => (
                              <Badge key={idx} variant='outline'>
                                {contraindication}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {measure.requiredTests.length > 0 && (
                          <div>
                            <h4 className='font-medium text-sm mb-2'>Exames necessários:</h4>
                            <ul className='list-disc list-inside text-sm text-gray-600'>
                              {measure.requiredTests.map((test, idx) => <li key={idx}>{test}</li>)}
                            </ul>
                          </div>
                        )}

                        {measure.precautions.length > 0 && (
                          <div>
                            <h4 className='font-medium text-sm mb-2'>Precauções:</h4>
                            <ul className='list-disc list-inside text-sm text-gray-600'>
                              {measure.precautions.map((precaution, idx) => (
                                <li key={idx}>{precaution}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {measure.alternativeProcedures.length > 0 && (
                          <div>
                            <h4 className='font-medium text-sm mb-2'>
                              Procedimentos alternativos:
                            </h4>
                            <ul className='list-disc list-inside text-sm text-gray-600'>
                              {measure.alternativeProcedures.map((alternative, idx) => (
                                <li key={idx}>{alternative}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
        </TabsContent>

        {/* Guidelines */}
        <TabsContent value='guidelines' className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Thermometer className='h-5 w-5' />
                  Recomendações Pré-Tratamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className='space-y-2'>
                  {analysis.preTreatmentGuidelines.map((guideline, index) => (
                    <li key={index} className='flex items-start gap-2 text-sm'>
                      <CheckCircle className='h-4 w-4 text-green-500 mt-0.5 flex-shrink-0' />
                      {guideline}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Activity className='h-5 w-5' />
                  Monitoramento Durante Tratamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className='space-y-2'>
                  {analysis.monitoringGuidelines.map((guideline, index) => (
                    <li key={index} className='flex items-start gap-2 text-sm'>
                      <Activity className='h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0' />
                      {guideline}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Brain className='h-5 w-5' />
                  Sinais de Alerta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className='space-y-2'>
                  {analysis.warningSigns.map((sign, index) => (
                    <li key={index} className='flex items-start gap-2 text-sm'>
                      <AlertTriangle className='h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0' />
                      {sign}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Bone className='h-5 w-5' />
                  Cuidados Pós-Tratamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className='space-y-2'>
                  {analysis.postTreatmentGuidelines.map((guideline, index) => (
                    <li key={index} className='flex items-start gap-2 text-sm'>
                      <CheckCircle className='h-4 w-4 text-green-500 mt-0.5 flex-shrink-0' />
                      {guideline}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface ContraindicationRiskCardProps {
  risk: ContraindicationRisk;
  getSeverityColor: (severity: string) => string;
  getSeverityIcon: (severity: string) => React.ReactNode;
  getCategoryIcon: (category: string) => React.ReactNode;
}

function ContraindicationRiskCard({
  risk,
  getSeverityColor,
  getSeverityIcon,
  getCategoryIcon,
}: ContraindicationRiskCardProps) {
  return (
    <Card
      className={`border-l-4 ${
        risk.severity === 'critical'
          ? 'border-l-red-500'
          : risk.severity === 'high'
          ? 'border-l-orange-500'
          : 'border-l-yellow-500'
      }`}
    >
      <CardHeader>
        <div className='flex items-start justify-between'>
          <div className='flex-1'>
            <div className='flex items-center gap-2 mb-2'>
              {getSeverityIcon(risk.severity)}
              <CardTitle className='text-lg'>{risk.condition}</CardTitle>
              <Badge
                variant='outline'
                className={getSeverityColor(risk.severity)}
              >
                {risk.severity}
              </Badge>
            </div>
            <div className='flex items-center gap-2 mb-2'>
              {getCategoryIcon(risk.category)}
              <span className='text-sm text-gray-600 capitalize'>{risk.category}</span>
              {risk.isAbsolute && <Badge variant='destructive'>Contraindicação Absoluta</Badge>}
            </div>
            <CardDescription>
              {risk.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          <div>
            <h4 className='font-medium text-sm mb-1'>Risco Explicado</h4>
            <p className='text-sm text-gray-600'>{risk.rationale}</p>
          </div>

          {risk.evidenceLevel && (
            <div className='flex items-center gap-2'>
              <span className='text-sm font-medium'>Nível de Evidência:</span>
              <Badge variant='outline'>
                {risk.evidenceLevel}
              </Badge>
            </div>
          )}

          {risk.references.length > 0 && (
            <div>
              <h4 className='font-medium text-sm mb-2'>Referências</h4>
              <ul className='text-sm text-gray-600 space-y-1'>
                {risk.references.map((reference, index) => (
                  <li key={index} className='flex items-start gap-2'>
                    <span className='text-blue-600 cursor-pointer hover:underline'>
                      {reference}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {risk.recommendedAction && (
            <Alert>
              <AlertTriangle className='h-4 w-4' />
              <AlertTitle>Ação Recomendada</AlertTitle>
              <AlertDescription>
                {risk.recommendedAction}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

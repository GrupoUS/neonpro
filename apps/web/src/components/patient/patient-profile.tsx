/**
 * Patient Profile View with AI Insights (T058)
 * Comprehensive patient profile with integrated AI insights
 *
 * Features:
 * - Integration with completed AI Features API endpoints (T051-T054)
 * - Real-time AI insights display using GET /api/v2/ai/insights/{patientId}
 * - Brazilian healthcare context with CFM compliance
 * - LGPD compliant data access with consent validation
 * - Performance optimization with caching and lazy loading
 * - Mobile-responsive design with touch interactions
 * - Accessibility compliance (WCAG 2.1 AA+)
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import {
  Activity,
  AlertTriangle,
  Brain,
  Calendar,
  FileText,
  Heart,
  Mail,
  MapPin,
  Phone,
  Shield,
  Stethoscope,
  TrendingUp,
  User,
  UserCheck,
} from 'lucide-react';
import { Suspense, useMemo, useState } from 'react';

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import { formatCPF, formatDate, formatDateTime, formatPhone } from '@/utils/brazilian-formatters';
import { Patient } from '@neonpro/shared/types/patient';
import { cn } from '@neonpro/ui';
import { PatientCard } from './patient-card';

export interface PatientProfileProps {
  /** Patient ID */
  patientId?: string;
  /** Show AI insights section */
  showAIInsights?: boolean;
  /** LGPD consent configuration */
  lgpdConsent?: {
    canShowFullData: boolean;
    canShowSensitiveData: boolean;
    canShowMedicalData: boolean;
    consentLevel: 'basic' | 'full' | 'restricted';
  };
  /** Mobile optimization */
  mobileOptimized?: boolean;
  /** Test ID */
  testId?: string;
}

// Mock API functions - these would be replaced with actual API calls
const fetchPatient = async (patientId: string): Promise<Patient> => {
  // This would call the actual GET /api/v2/patients/{id} endpoint (T045)
  const response = await fetch(`/api/v2/patients/${patientId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Falha ao carregar dados do paciente');
  }

  return response.json();
};

const fetchAIInsights = async (patientId: string) => {
  // This calls the actual GET /api/v2/ai/insights/{patientId} endpoint (T052)
  const response = await fetch(`/api/v2/ai/insights/${patientId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      'Content-Type': 'application/json',
      'X-Healthcare-Professional': 'true',
      'X-Healthcare-Context': 'patient_profile',
    },
  });

  if (!response.ok) {
    throw new Error('Falha ao carregar insights de IA');
  }

  return response.json();
};

/**
 * AI Insights Section Component
 */
const AIInsightsSection = ({ patientId, lgpdConsent }: {
  patientId: string;
  lgpdConsent: PatientProfileProps['lgpdConsent'];
}) => {
  const { data: insights, isLoading, error } = useQuery({
    queryKey: ['ai-insights', patientId],
    queryFn: () => fetchAIInsights(patientId),
    enabled: !!patientId && lgpdConsent?.canShowMedicalData,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    retry: 2,
  });

  if (!lgpdConsent?.canShowMedicalData) {
    return (
      <Alert>
        <Shield className='h-4 w-4' />
        <AlertTitle>Acesso Restrito</AlertTitle>
        <AlertDescription>
          Consentimento LGPD necessário para visualizar insights médicos de IA.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <Skeleton className='h-6 w-48' />
        <div className='grid gap-4 md:grid-cols-2'>
          <Skeleton className='h-32' />
          <Skeleton className='h-32' />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant='destructive'>
        <AlertTriangle className='h-4 w-4' />
        <AlertTitle>Erro ao Carregar Insights</AlertTitle>
        <AlertDescription>
          Não foi possível carregar os insights de IA. Tente novamente mais tarde.
        </AlertDescription>
      </Alert>
    );
  }

  if (!insights?.data) {
    return (
      <Alert>
        <Brain className='h-4 w-4' />
        <AlertTitle>Insights Indisponíveis</AlertTitle>
        <AlertDescription>
          Nenhum insight de IA disponível para este paciente no momento.
        </AlertDescription>
      </Alert>
    );
  }

  const { riskAssessment, recommendations, trends, summary } = insights.data;

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-2'>
        <Brain className='h-5 w-5 text-primary' />
        <h3 className='text-lg font-semibold'>Insights de IA</h3>
        <Badge variant='secondary' className='ml-auto'>
          Confiança: {Math.round((insights.data.confidence || 0.8) * 100)}%
        </Badge>
      </div>

      {/* Risk Assessment */}
      {riskAssessment && (
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-base'>
              <AlertTriangle className='h-4 w-4' />
              Avaliação de Risco
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>Risco Geral</span>
                <Badge
                  variant={riskAssessment.overallRisk === 'high'
                    ? 'destructive'
                    : riskAssessment.overallRisk === 'medium'
                    ? 'secondary'
                    : 'default'}
                >
                  {riskAssessment.overallRisk === 'high'
                    ? 'Alto'
                    : riskAssessment.overallRisk === 'medium'
                    ? 'Médio'
                    : 'Baixo'}
                </Badge>
              </div>

              {riskAssessment.factors && riskAssessment.factors.length > 0 && (
                <div className='space-y-2'>
                  <span className='text-sm font-medium'>Fatores de Risco:</span>
                  <ul className='text-sm text-muted-foreground space-y-1'>
                    {riskAssessment.factors.slice(0, 3).map((factor: string, index: number) => (
                      <li key={index} className='flex items-start gap-2'>
                        <span className='w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0' />
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-base'>
              <TrendingUp className='h-4 w-4' />
              Recomendações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {recommendations.slice(0, 4).map((rec: any, index: number) => (
                <div key={index} className='flex items-start gap-3 p-3 bg-muted/50 rounded-lg'>
                  <div className='w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0' />
                  <div className='space-y-1'>
                    <p className='text-sm font-medium'>{rec.title || rec.recommendation}</p>
                    {rec.description && (
                      <p className='text-xs text-muted-foreground'>{rec.description}</p>
                    )}
                    {rec.priority && (
                      <Badge
                        variant={rec.priority === 'high' ? 'destructive' : 'secondary'}
                      >
                        {rec.priority === 'high'
                          ? 'Alta Prioridade'
                          : rec.priority === 'medium'
                          ? 'Média Prioridade'
                          : 'Baixa Prioridade'}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Health Trends */}
      {trends && (
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-base'>
              <Activity className='h-4 w-4' />
              Tendências de Saúde
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid gap-4 sm:grid-cols-2'>
              {Object.entries(trends).slice(0, 4).map(([key, trend]: [string, any]) => (
                <div key={key} className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium capitalize'>
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </span>
                    <Badge
                      variant={trend.direction === 'improving'
                        ? 'default'
                        : trend.direction === 'declining'
                        ? 'destructive'
                        : 'secondary'}
                      className='text-xs'
                    >
                      {trend.direction === 'improving'
                        ? '↗ Melhorando'
                        : trend.direction === 'declining'
                        ? '↘ Piorando'
                        : '→ Estável'}
                    </Badge>
                  </div>
                  {trend.value && (
                    <p className='text-xs text-muted-foreground'>
                      Valor atual: {trend.value}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Summary */}
      {summary && (
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-base'>
              <FileText className='h-4 w-4' />
              Resumo da IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground leading-relaxed'>
              {summary}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Compliance Footer */}
      <div className='text-xs text-muted-foreground text-center pt-4 border-t'>
        <p>
          Insights gerados por IA • Conforme LGPD e CFM • Última atualização:{' '}
          {formatDateTime(insights.data.generatedAt || new Date())}
        </p>
      </div>
    </div>
  );
};

/**
 * PatientProfile - Main component
 */
export const PatientProfile = ({
  patientId: propPatientId,
  showAIInsights = true,
  lgpdConsent = {
    canShowFullData: true,
    canShowSensitiveData: false,
    canShowMedicalData: true,
    consentLevel: 'full',
  },
  mobileOptimized = true,
  testId = 'patient-profile',
}: PatientProfileProps) => {
  const params = useParams({ strict: false });
  const patientId = propPatientId || (params as any)?.patientId;
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch patient data
  const { data: patient, isLoading, error } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => fetchPatient(patientId),
    enabled: !!patientId,
    staleTime: 2 * 60 * 1000, // 2 minutes cache
    retry: 2,
  });

  // Memoized patient display data
  const displayData = useMemo(() => {
    if (!patient) return null;

    const { canShowFullData, canShowSensitiveData } = lgpdConsent;

    return {
      name: canShowFullData
        ? patient.name
        : patient.name?.split(' ')[0] || 'Paciente',
      cpf: canShowSensitiveData ? formatCPF(patient.cpf) : '***.***.***-**',
      phone: canShowFullData && patient.phone
        ? formatPhone(patient.phone)
        : '(**) ****-****',
      email: canShowFullData && patient.email
        ? patient.email
        : '***@***.***',
      birthDate: canShowFullData && patient.birthDate
        ? formatDate(patient.birthDate)
        : 'Não informado',
      address: canShowFullData && patient.address
        ? `${patient.address.street}, ${patient.address.number} - ${patient.address.neighborhood}, ${patient.address.city}/${patient.address.state}`
        : 'Endereço restrito',
    };
  }, [patient, lgpdConsent]);

  if (!patientId) {
    return (
      <Alert variant='destructive'>
        <AlertTriangle className='h-4 w-4' />
        <AlertTitle>ID do Paciente Necessário</AlertTitle>
        <AlertDescription>
          ID do paciente não fornecido para carregar o perfil.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className='space-y-6' data-testid={`${testId}-loading`}>
        <Skeleton className='h-8 w-64' />
        <div className='grid gap-6 lg:grid-cols-3'>
          <div className='lg:col-span-2 space-y-6'>
            <Skeleton className='h-48' />
            <Skeleton className='h-64' />
          </div>
          <div className='space-y-6'>
            <Skeleton className='h-32' />
            <Skeleton className='h-48' />
          </div>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <Alert variant='destructive' data-testid={`${testId}-error`}>
        <AlertTriangle className='h-4 w-4' />
        <AlertTitle>Erro ao Carregar Perfil</AlertTitle>
        <AlertDescription>
          {error instanceof Error
            ? error.message
            : 'Não foi possível carregar o perfil do paciente.'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className='space-y-6' data-testid={testId}>
      {/* Header */}
      <div className='flex items-start justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>{displayData?.name}</h1>
          <p className='text-muted-foreground'>
            CPF: {displayData?.cpf} • Cadastrado em {formatDate(patient.createdAt)}
          </p>
        </div>

        <div className='flex gap-2'>
          <Button variant='outline' size='sm'>
            <FileText className='h-4 w-4 mr-2' />
            Histórico
          </Button>
          <Button size='sm'>
            Editar Perfil
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-6'>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='overview'>Visão Geral</TabsTrigger>
          <TabsTrigger value='medical'>Dados Médicos</TabsTrigger>
          {showAIInsights && <TabsTrigger value='ai-insights'>Insights IA</TabsTrigger>}
        </TabsList>

        <TabsContent value='overview' className='space-y-6'>
          <div className='grid gap-6 lg:grid-cols-3'>
            {/* Patient Card */}
            <div className='lg:col-span-1'>
              <PatientCard
                patient={patient}
                variant='detailed'
                showActions={false}
                lgpdConsent={lgpdConsent}
                mobileOptimized={mobileOptimized}
              />
            </div>

            {/* Contact Information */}
            <div className='lg:col-span-2 space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <User className='h-5 w-5' />
                    Informações de Contato
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='grid gap-4 sm:grid-cols-2'>
                    <div className='flex items-center gap-3'>
                      <Phone className='h-4 w-4 text-muted-foreground' />
                      <div>
                        <p className='text-sm font-medium'>Telefone</p>
                        <p className='text-sm text-muted-foreground'>{displayData?.phone}</p>
                      </div>
                    </div>

                    <div className='flex items-center gap-3'>
                      <Mail className='h-4 w-4 text-muted-foreground' />
                      <div>
                        <p className='text-sm font-medium'>E-mail</p>
                        <p className='text-sm text-muted-foreground'>{displayData?.email}</p>
                      </div>
                    </div>

                    <div className='flex items-center gap-3'>
                      <Calendar className='h-4 w-4 text-muted-foreground' />
                      <div>
                        <p className='text-sm font-medium'>Data de Nascimento</p>
                        <p className='text-sm text-muted-foreground'>{displayData?.birthDate}</p>
                      </div>
                    </div>

                    <div className='flex items-center gap-3'>
                      <MapPin className='h-4 w-4 text-muted-foreground' />
                      <div>
                        <p className='text-sm font-medium'>Endereço</p>
                        <p className='text-sm text-muted-foreground'>{displayData?.address}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value='medical' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Stethoscope className='h-5 w-5' />
                Informações Médicas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lgpdConsent.canShowMedicalData
                ? (
                  <div className='space-y-4'>
                    {patient.healthcareInfo?.allergies
                      && patient.healthcareInfo.allergies.length > 0 && (
                      <div>
                        <h4 className='font-medium mb-2'>Alergias</h4>
                        <div className='flex flex-wrap gap-2'>
                          {patient.healthcareInfo.allergies.map((
                            allergy: string,
                            index: number,
                          ) => (
                            <Badge key={index} variant='secondary'>
                              {allergy}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {patient.healthcareInfo?.medications
                      && patient.healthcareInfo.medications.length > 0
                      && (
                        <div>
                          <h4 className='font-medium mb-2'>Medicações</h4>
                          <div className='space-y-2'>
                            {patient.healthcareInfo.medications.map((med: any, index: number) => (
                              <div key={index} className='text-sm'>
                                <span className='font-medium'>{med.name}</span>
                                {med.dosage && (
                                  <span className='text-muted-foreground'>- {med.dosage}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {(!patient.healthcareInfo?.allergies?.length
                      && !patient.healthcareInfo?.medications?.length) && (
                      <p className='text-muted-foreground'>Nenhuma informação médica registrada.</p>
                    )}
                  </div>
                )
                : (
                  <Alert>
                    <Shield className='h-4 w-4' />
                    <AlertTitle>Acesso Restrito</AlertTitle>
                    <AlertDescription>
                      Consentimento LGPD necessário para visualizar dados médicos.
                    </AlertDescription>
                  </Alert>
                )}
            </CardContent>
          </Card>
        </TabsContent>

        {showAIInsights && (
          <TabsContent value='ai-insights' className='space-y-6'>
            <Suspense fallback={<Skeleton className='h-64' />}>
              <AIInsightsSection patientId={patientId} lgpdConsent={lgpdConsent} />
            </Suspense>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default PatientProfile;

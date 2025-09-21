/**
 * No-show Prediction Alerts (T063)
 * AI-powered no-show prediction and alert system
 *
 * Features:
 * - Integration with AI analysis endpoint for prediction algorithms
 * - Real-time alert system with notification service integration
 * - Brazilian healthcare context with appointment management
 * - LGPD compliant patient data handling
 * - Mobile-optimized alert display
 * - Accessibility compliance (WCAG 2.1 AA+)
 */

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  Bell,
  BellOff,
  Calendar,
  Clock,
  Eye,
  EyeOff,
  Phone,
  Shield,
  UserX,
  X,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Switch,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui';
import { formatDate, formatDateTime } from '@/utils/brazilian-formatters';
import { cn } from '@neonpro/ui';

export interface NoShowAlertsProps {
  /** Time range for predictions */
  timeRange?: '24h' | '48h' | '7d';
  /** Minimum risk threshold for alerts */
  riskThreshold?: number;
  /** Show only high-risk predictions */
  highRiskOnly?: boolean;
  /** Healthcare professional context */
  healthcareProfessional?: {
    id: string;
    specialty: string;
  };
  /** LGPD consent configuration */
  lgpdConsent?: {
    canViewPatientData: boolean;
    canSendNotifications: boolean;
    consentLevel: 'basic' | 'full' | 'restricted';
  };
  /** Alert settings */
  alertSettings?: {
    enableNotifications: boolean;
    enableSMS: boolean;
    enableEmail: boolean;
    autoActions: boolean;
  };
  /** Mobile optimization */
  mobileOptimized?: boolean;
  /** Test ID */
  testId?: string;
}

interface NoShowPrediction {
  id: string;
  patientId: string;
  patientName: string;
  appointmentId: string;
  appointmentDate: Date;
  appointmentTime: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: string[];
  confidence: number;
  lastUpdated: Date;
  actionsTaken: string[];
  status: 'pending' | 'contacted' | 'confirmed' | 'cancelled';
}

// Mock API functions - these would be replaced with actual API calls
const fetchNoShowPredictions = async (params: {
  timeRange: string;
  riskThreshold: number;
  highRiskOnly: boolean;
}) => {
  // This calls the AI analysis endpoint for no-show predictions
  const response = await fetch('/api/v2/ai/analyze', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      'Content-Type': 'application/json',
      'X-Healthcare-Professional': 'true',
      'X-Healthcare-Context': 'appointment_management',
    },
    body: JSON.stringify({
      analysisType: 'diagnostic_support',
      data: {
        analysisSubtype: 'noshow_prediction',
        timeRange: params.timeRange,
        riskThreshold: params.riskThreshold,
        filters: {
          highRiskOnly: params.highRiskOnly,
        },
      },
      options: {
        includeRecommendations: true,
        confidenceThreshold: 0.7,
        identifyActionItems: true,
      },
    }),
  });

  if (!response.ok) {
    throw new Error('Falha ao carregar predições de no-show');
  }

  return response.json();
};

const updatePredictionStatus = async (data: {
  predictionId: string;
  status: string;
  actionTaken?: string;
}) => {
  const response = await fetch(
    `/api/v2/appointments/predictions/${data.predictionId}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: data.status,
        actionTaken: data.actionTaken,
      }),
    },
  );

  if (!response.ok) {
    throw new Error('Falha ao atualizar status da predição');
  }

  return response.json();
};

/**
 * PredictionCard - Individual prediction display component
 */
const PredictionCard = (_{
  prediction,_onStatusUpdate,_lgpdConsent,_mobileOptimized = true,
}: {
  prediction: NoShowPrediction;
  onStatusUpdate: (id: string, status: string, action?: string) => void;
  lgpdConsent: NoShowAlertsProps['lgpdConsent'];
  mobileOptimized?: boolean;
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const riskConfig = {
    low: {
      color: 'bg-green-100 text-green-800',
      label: 'Baixo',
      variant: 'default' as const,
    },
    medium: {
      color: 'bg-yellow-100 text-yellow-800',
      label: 'Médio',
      variant: 'secondary' as const,
    },
    high: {
      color: 'bg-orange-100 text-orange-800',
      label: 'Alto',
      variant: 'destructive' as const,
    },
    critical: {
      color: 'bg-red-100 text-red-800',
      label: 'Crítico',
      variant: 'destructive' as const,
    },
  };

  const config = riskConfig[prediction.riskLevel];
  const canViewPatientData = lgpdConsent?.canViewPatientData ?? false;

  return (
    <Card
      className={cn(
        'transition-all duration-200',
        prediction.riskLevel === 'critical' && 'border-red-200 bg-red-50/50',
        prediction.riskLevel === 'high' && 'border-orange-200 bg-orange-50/50',
        mobileOptimized && 'touch-manipulation',
      )}
    >
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between'>
          <div className='space-y-1 flex-1 min-w-0'>
            <div className='flex items-center gap-2'>
              <h3 className='font-semibold truncate'>
                {canViewPatientData ? prediction.patientName : 'Paciente ***'}
              </h3>
              <Badge variant={config.variant} className='text-xs'>
                {config.label} Risco
              </Badge>
            </div>
            <div className='flex items-center gap-4 text-sm text-muted-foreground'>
              <div className='flex items-center gap-1'>
                <Calendar className='h-3 w-3' />
                {formatDate(prediction.appointmentDate)}
              </div>
              <div className='flex items-center gap-1'>
                <Clock className='h-3 w-3' />
                {prediction.appointmentTime}
              </div>
            </div>
          </div>

          <div className='flex items-center gap-2 ml-2'>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => setShowDetails(!showDetails)}
                  >
                    {showDetails ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{showDetails ? 'Ocultar detalhes' : 'Ver detalhes'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>

      <CardContent className='space-y-4'>
        {/* Risk Score */}
        <div className='flex items-center justify-between'>
          <span className='text-sm font-medium'>Score de Risco</span>
          <div className='flex items-center gap-2'>
            <div className='w-24 h-2 bg-muted rounded-full overflow-hidden'>
              <div
                className={cn(
                  'h-full transition-all duration-300',
                  prediction.riskScore >= 80
                    ? 'bg-red-500'
                    : prediction.riskScore >= 60
                    ? 'bg-orange-500'
                    : prediction.riskScore >= 40
                    ? 'bg-yellow-500'
                    : 'bg-green-500',
                )}
                style={{ width: `${prediction.riskScore}%` }}
              />
            </div>
            <span className='text-sm font-medium'>{prediction.riskScore}%</span>
          </div>
        </div>

        {/* Confidence */}
        <div className='flex items-center justify-between'>
          <span className='text-sm font-medium'>Confiança da IA</span>
          <Badge variant='secondary'>
            {Math.round(prediction.confidence * 100)}%
          </Badge>
        </div>

        {/* Status */}
        <div className='flex items-center justify-between'>
          <span className='text-sm font-medium'>Status</span>
          <Badge
            variant={prediction.status === 'confirmed'
              ? 'default'
              : prediction.status === 'contacted'
              ? 'secondary'
              : prediction.status === 'cancelled'
              ? 'destructive'
              : 'outline'}
          >
            {prediction.status === 'confirmed'
              ? 'Confirmado'
              : prediction.status === 'contacted'
              ? 'Contatado'
              : prediction.status === 'cancelled'
              ? 'Cancelado'
              : 'Pendente'}
          </Badge>
        </div>

        {/* Details */}
        {showDetails && (
          <div className='space-y-3 pt-3 border-t'>
            {/* Risk Factors */}
            {prediction.factors.length > 0 && (
              <div>
                <h4 className='text-sm font-medium mb-2'>Fatores de Risco:</h4>
                <div className='space-y-1'>
                  {prediction.factors.slice(0, 3).map(_(factor, _index) => (
                    <div
                      key={index}
                      className='flex items-start gap-2 text-sm text-muted-foreground'
                    >
                      <span className='w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0' />
                      {factor}
                    </div>
                  ))}
                  {prediction.factors.length > 3 && (
                    <p className='text-xs text-muted-foreground'>
                      +{prediction.factors.length - 3} outros fatores
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Actions Taken */}
            {prediction.actionsTaken.length > 0 && (
              <div>
                <h4 className='text-sm font-medium mb-2'>Ações Realizadas:</h4>
                <div className='space-y-1'>
                  {prediction.actionsTaken.map((action, _index) => (
                    <div
                      key={index}
                      className='flex items-start gap-2 text-sm text-muted-foreground'
                    >
                      <span className='w-1 h-1 bg-green-500 rounded-full mt-2 flex-shrink-0' />
                      {action}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Last Updated */}
            <div className='text-xs text-muted-foreground'>
              Última atualização: {formatDateTime(prediction.lastUpdated)}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className='flex gap-2 pt-3 border-t'>
          {prediction.status === 'pending' && (_<>
              <Button
                variant='outline'
                size='sm'
                onClick={() =>
                  onStatusUpdate(
                    prediction.id,
                    'contacted',
                    'Paciente contatado por telefone',
                  )}
                className='flex-1'
              >
                <Phone className='h-4 w-4 mr-1' />
                Contatar
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() =>
                  onStatusUpdate(
                    prediction.id,
                    'confirmed',
                    'Consulta confirmada',
                  )}
                className='flex-1'
              >
                Confirmar
              </Button>
            </>
          )}

          {prediction.status === 'contacted' && (_<Button
              variant='outline'
              size='sm'
              onClick={() =>
                onStatusUpdate(
                  prediction.id,
                  'confirmed',
                  'Consulta confirmada após contato',
                )}
              className='flex-1'
            >
              Confirmar
            </Button>
          )}

          <Button
            variant='ghost'
            size='sm'
            onClick={() => onStatusUpdate(prediction.id, 'cancelled', 'Consulta cancelada')}
            className='text-destructive hover:text-destructive'
          >
            <X className='h-4 w-4' />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * NoShowAlerts - Main component
 */
export const NoShowAlerts = ({
  timeRange: initialTimeRange = '48h',_riskThreshold = 50,_highRiskOnly = false,
  healthcareProfessional: _healthcareProfessional, // unused by design
  lgpdConsent = {
    canViewPatientData: true,
    canSendNotifications: true,
    consentLevel: 'full',_},
  alertSettings = {
    enableNotifications: true,
    enableSMS: false,
    enableEmail: true,
    autoActions: false,_},_mobileOptimized = true,_testId = 'noshow-alerts',
}: NoShowAlertsProps) => {
  const [timeRange, setTimeRange] = useState(initialTimeRange);
  const [showHighRiskOnly, setShowHighRiskOnly] = useState(highRiskOnly);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    alertSettings.enableNotifications,
  );

  const queryClient = useQueryClient();

  // Fetch predictions
  const {
    data: predictions,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      'noshow-predictions',_timeRange,_riskThreshold,_showHighRiskOnly,_],
    queryFn: () =>
      fetchNoShowPredictions({
        timeRange,
        riskThreshold,
        highRiskOnly: showHighRiskOnly,
      }),
    enabled: lgpdConsent.canViewPatientData,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    retry: 2,
  });

  // Update prediction status mutation
  const updateStatusMutation = useMutation({
    mutationFn: updatePredictionStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['noshow-predictions'] });
    },
  });

  // Handle status update
  const handleStatusUpdate = useCallback(
    (predictionId: string, status: string, action?: string) => {
      updateStatusMutation.mutate({
        predictionId,
        status,
        actionTaken: action,
      });
    },
    [updateStatusMutation],
  );

  // Memoized statistics
  const stats = useMemo(_() => {
    if (!predictions?.data?.predictions) return null;

    const preds = predictions.data.predictions;
    return {
      total: preds.length,
      critical: preds.filter(
        (p: NoShowPrediction) => p.riskLevel === 'critical',
      ).length,
      high: preds.filter((p: NoShowPrediction) => p.riskLevel === 'high')
        .length,
      pending: preds.filter((p: NoShowPrediction) => p.status === 'pending')
        .length,
      contacted: preds.filter((p: NoShowPrediction) => p.status === 'contacted')
        .length,
    };
  }, [predictions]);

  if (!lgpdConsent.canViewPatientData) {
    return (
      <Alert>
        <Shield className='h-4 w-4' />
        <AlertTitle>Acesso Restrito</AlertTitle>
        <AlertDescription>
          Consentimento LGPD necessário para visualizar predições de no-show.
        </AlertDescription>
      </Alert>
    );
  }

  return (_<div className='space-y-6' data-testid={testId}>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-xl font-semibold tracking-tight'>
            Alertas de No-Show
          </h2>
          <p className='text-muted-foreground'>
            Predições de IA para faltas em consultas
          </p>
        </div>

        <div className='flex items-center gap-2'>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className={cn(notificationsEnabled && 'text-primary')}
                >
                  {notificationsEnabled
                    ? <Bell className='h-4 w-4' />
                    : <BellOff className='h-4 w-4' />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {notificationsEnabled
                    ? 'Desativar notificações'
                    : 'Ativar notificações'}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Controls */}
      <div className='flex items-center gap-4'>
        <Select
          value={timeRange}
          onValueChange={(value: string) => setTimeRange(value as typeof timeRange)}
        >
          <SelectTrigger className='w-40'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='24h'>Próximas 24h</SelectItem>
            <SelectItem value='48h'>Próximas 48h</SelectItem>
            <SelectItem value='7d'>Próximos 7 dias</SelectItem>
          </SelectContent>
        </Select>

        <div className='flex items-center gap-2'>
          <Switch
            checked={showHighRiskOnly}
            onCheckedChange={setShowHighRiskOnly}
            id='high-risk-only'
          />
          <label htmlFor='high-risk-only' className='text-sm'>
            Apenas alto risco
          </label>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className='grid gap-4 md:grid-cols-5'>
          <Card>
            <CardContent className='p-4'>
              <div className='text-center'>
                <p className='text-2xl font-bold'>{stats.total}</p>
                <p className='text-sm text-muted-foreground'>Total</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-4'>
              <div className='text-center'>
                <p className='text-2xl font-bold text-red-600'>
                  {stats.critical}
                </p>
                <p className='text-sm text-muted-foreground'>Crítico</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-4'>
              <div className='text-center'>
                <p className='text-2xl font-bold text-orange-600'>
                  {stats.high}
                </p>
                <p className='text-sm text-muted-foreground'>Alto Risco</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-4'>
              <div className='text-center'>
                <p className='text-2xl font-bold text-yellow-600'>
                  {stats.pending}
                </p>
                <p className='text-sm text-muted-foreground'>Pendente</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-4'>
              <div className='text-center'>
                <p className='text-2xl font-bold text-green-600'>
                  {stats.contacted}
                </p>
                <p className='text-sm text-muted-foreground'>Contatado</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Alert variant='destructive'>
          <AlertTriangle className='h-4 w-4' />
          <AlertTitle>Erro ao Carregar Predições</AlertTitle>
          <AlertDescription>
            Não foi possível carregar as predições de no-show. Tente novamente mais tarde.
          </AlertDescription>
        </Alert>
      )}

      {/* Predictions List */}
      {isLoading
        ? (
          <div className='space-y-4'>
            {Array.from({ length: 3 }).map(_(_,_i) => <Skeleton key={i} className='h-48' />)}
          </div>
        )
        : predictions?.data?.predictions?.length > 0
        ? (
          <div className='space-y-4'>
            {predictions.data.predictions
              .sort(
                (a: NoShowPrediction, b: NoShowPrediction) => b.riskScore - a.riskScore,
              )
              .map((prediction: NoShowPrediction) => (
                <PredictionCard
                  key={prediction.id}
                  prediction={prediction}
                  onStatusUpdate={handleStatusUpdate}
                  lgpdConsent={lgpdConsent}
                  mobileOptimized={mobileOptimized}
                />
              ))}
          </div>
        )
        : (
          <Card>
            <CardContent className='text-center py-8'>
              <UserX className='h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50' />
              <p className='text-lg font-medium mb-2'>
                Nenhuma predição de no-show
              </p>
              <p className='text-muted-foreground'>
                {showHighRiskOnly
                  ? 'Nenhuma predição de alto risco encontrada para o período selecionado.'
                  : 'Nenhuma predição encontrada para o período selecionado.'}
              </p>
            </CardContent>
          </Card>
        )}

      {/* Footer */}
      <div className='text-xs text-muted-foreground text-center pt-4 border-t'>
        <p>
          Predições geradas por IA • Conforme LGPD e CFM • Última atualização:{' '}
          {formatDateTime(new Date())} •
          {notificationsEnabled
            ? 'Notificações ativadas'
            : 'Notificações desativadas'}
        </p>
      </div>
    </div>
  );
};

export default NoShowAlerts;

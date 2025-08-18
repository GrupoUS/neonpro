import {
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Heart,
  Loader2,
  Shield,
  Stethoscope,
  User,
  Users,
} from 'lucide-react';
import * as React from 'react';
import { cn } from '../utils/cn';
import { Badge } from './Badge';

export type LoadingContext =
  | 'patient_search'
  | 'patient_loading'
  | 'appointment_scheduling'
  | 'appointment_loading'
  | 'treatment_processing'
  | 'document_upload'
  | 'document_processing'
  | 'consent_verification'
  | 'compliance_check'
  | 'emergency_access'
  | 'data_sync'
  | 'backup_restore'
  | 'system_health'
  | 'general';

export type LoadingStage =
  | 'initializing'
  | 'processing'
  | 'verifying'
  | 'finalizing'
  | 'completed'
  | 'error';

export type LoadingStep = {
  id: string;
  label: string;
  description?: string;
  stage: LoadingStage;
  duration?: number;
  isActive?: boolean;
  icon?: React.ElementType;
};

export type HealthcareLoadingStatesProps = {
  /**
   * Context of the loading operation for appropriate messaging
   */
  context: LoadingContext;
  /**
   * Current loading stage
   */
  stage?: LoadingStage;
  /**
   * Progress percentage (0-100)
   */
  progress?: number;
  /**
   * Specific steps in the loading process
   */
  steps?: LoadingStep[];
  /**
   * Estimated time remaining in seconds
   */
  estimatedTime?: number;
  /**
   * Error message if loading failed
   */
  error?: string;
  /**
   * Success message when completed
   */
  successMessage?: string;
  /**
   * Show anxiety-reducing tips and information
   */
  showComfortInfo?: boolean;
  /**
   * Patient name for personalized messages
   */
  patientName?: string;
  /**
   * Show detailed progress information
   */
  showDetailedProgress?: boolean;
  /**
   * Size variant of the loading component
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Additional CSS classes
   */
  className?: string;
};

const contextMessages: Record<
  LoadingContext,
  {
    title: string;
    description: string;
    comfortMessage: string;
    icon: React.ElementType;
  }
> = {
  patient_search: {
    title: 'Buscando Paciente',
    description: 'Localizando informações do paciente com segurança',
    comfortMessage:
      'Estamos organizando as informações de forma segura e privada.',
    icon: User,
  },
  patient_loading: {
    title: 'Carregando Dados do Paciente',
    description: 'Acessando histórico médico com proteção LGPD',
    comfortMessage:
      'Seus dados estão protegidos e sendo acessados apenas por profissionais autorizados.',
    icon: User,
  },
  appointment_scheduling: {
    title: 'Agendando Consulta',
    description: 'Processando agendamento e enviando confirmações',
    comfortMessage:
      'Estamos confirmando sua consulta e notificaremos você em breve.',
    icon: Calendar,
  },
  appointment_loading: {
    title: 'Carregando Agendamentos',
    description: 'Sincronizando agenda médica',
    comfortMessage:
      'Verificando disponibilidade para oferecer os melhores horários.',
    icon: Calendar,
  },
  treatment_processing: {
    title: 'Processando Tratamento',
    description: 'Registrando informações do procedimento',
    comfortMessage:
      'Documentando cuidadosamente todos os detalhes do seu tratamento.',
    icon: Stethoscope,
  },
  document_upload: {
    title: 'Enviando Documentos',
    description: 'Upload seguro de arquivos médicos',
    comfortMessage:
      'Seus documentos estão sendo carregados com criptografia de segurança.',
    icon: FileText,
  },
  document_processing: {
    title: 'Processando Documentos',
    description: 'Analisando e organizando arquivos médicos',
    comfortMessage: 'Organizando seus documentos para fácil acesso futuro.',
    icon: FileText,
  },
  consent_verification: {
    title: 'Verificando Consentimento',
    description: 'Validando autorizações LGPD',
    comfortMessage:
      'Confirmando suas autorizações para garantir total transparência.',
    icon: Shield,
  },
  compliance_check: {
    title: 'Verificação de Conformidade',
    description: 'Auditando conformidade regulatória',
    comfortMessage:
      'Garantindo que todos os protocolos de segurança estão sendo seguidos.',
    icon: Shield,
  },
  emergency_access: {
    title: 'Acesso de Emergência',
    description: 'Processando acesso médico emergencial',
    comfortMessage:
      'Priorizando acesso rápido aos dados críticos para seu atendimento.',
    icon: Heart,
  },
  data_sync: {
    title: 'Sincronizando Dados',
    description: 'Atualizando informações na nuvem',
    comfortMessage: 'Mantendo suas informações atualizadas e seguras.',
    icon: Users,
  },
  backup_restore: {
    title: 'Restaurando Dados',
    description: 'Recuperando informações do backup',
    comfortMessage: 'Recuperando suas informações de forma segura.',
    icon: Shield,
  },
  system_health: {
    title: 'Verificando Sistema',
    description: 'Monitorando saúde do sistema',
    comfortMessage:
      'Garantindo que todos os sistemas estão funcionando perfeitamente.',
    icon: Heart,
  },
  general: {
    title: 'Processando',
    description: 'Executando operação solicitada',
    comfortMessage: 'Trabalhando para processar sua solicitação rapidamente.',
    icon: Loader2,
  },
};

const formatTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

const ProgressBar: React.FC<{
  progress: number;
  className?: string;
}> = ({ progress, className }) => (
  <div className={cn('h-2 w-full rounded-full bg-muted', className)}>
    <div
      className="h-2 rounded-full bg-primary transition-all duration-300 ease-out"
      style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
    />
  </div>
);

const LoadingSpinner: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ size = 'md', className }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <Loader2
      className={cn('animate-spin text-primary', sizeClasses[size], className)}
    />
  );
};

const StepIndicator: React.FC<{
  steps: LoadingStep[];
  showDetailedProgress?: boolean;
}> = ({ steps, showDetailedProgress = false }) => (
  <div className="space-y-3">
    {steps.map((step, _index) => {
      const Icon = step.icon || Clock;
      const isCompleted = step.stage === 'completed';
      const isError = step.stage === 'error';
      const isActive = step.isActive || step.stage === 'processing';

      return (
        <div
          className={cn(
            'flex items-center gap-3 rounded-lg p-2 transition-colors',
            isActive && 'bg-primary/10',
            isCompleted && 'bg-green-50',
            isError && 'bg-red-50'
          )}
          key={step.id}
        >
          <div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full',
              isCompleted && 'bg-green-100 text-green-700',
              isError && 'bg-red-100 text-red-700',
              isActive && 'bg-primary/20 text-primary',
              !(isActive || isCompleted || isError) &&
                'bg-muted text-muted-foreground'
            )}
          >
            {isCompleted ? (
              <CheckCircle className="h-4 w-4" />
            ) : isActive ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Icon className="h-4 w-4" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'font-medium text-sm',
                  isCompleted && 'text-green-700',
                  isError && 'text-red-700',
                  isActive && 'text-primary'
                )}
              >
                {step.label}
              </span>

              {isActive && step.duration && (
                <Badge size="sm" variant="outline">
                  ~{formatTime(step.duration)}
                </Badge>
              )}
            </div>

            {showDetailedProgress && step.description && (
              <p
                className={cn(
                  'mt-1 text-xs',
                  isCompleted && 'text-green-600',
                  isError && 'text-red-600',
                  'text-muted-foreground'
                )}
              >
                {step.description}
              </p>
            )}
          </div>
        </div>
      );
    })}
  </div>
);

export const HealthcareLoadingStates = React.forwardRef<
  HTMLDivElement,
  HealthcareLoadingStatesProps
>(
  (
    {
      context,
      stage = 'processing',
      progress,
      steps,
      estimatedTime,
      error,
      successMessage,
      showComfortInfo = true,
      patientName,
      showDetailedProgress = false,
      size = 'md',
      className,
      ...props
    },
    ref
  ) => {
    const contextInfo = contextMessages[context];
    const Icon = contextInfo.icon;

    const sizeClasses = {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    // Error state
    if (error) {
      return (
        <div
          className={cn(
            'rounded-lg border border-red-200 bg-red-50 text-red-900',
            sizeClasses[size],
            className
          )}
          ref={ref}
          {...props}
          aria-labelledby="error-title"
          role="alert"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <Icon className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold" id="error-title">
                Erro no Processamento
              </h3>
              <p className="mt-1 text-red-700 text-sm">{error}</p>
              <p className="mt-2 text-red-600 text-xs">
                Por favor, tente novamente ou entre em contato com o suporte se
                o problema persistir.
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Success state
    if (stage === 'completed' && successMessage) {
      return (
        <div
          className={cn(
            'rounded-lg border border-green-200 bg-green-50 text-green-900',
            sizeClasses[size],
            className
          )}
          ref={ref}
          {...props}
          aria-labelledby="success-title"
          role="status"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold" id="success-title">
                {contextInfo.title} Concluído
              </h3>
              <p className="mt-1 text-green-700 text-sm">{successMessage}</p>
            </div>
          </div>
        </div>
      );
    }

    // Loading state
    return (
      <div
        className={cn(
          'rounded-lg border bg-card text-card-foreground',
          sizeClasses[size],
          className
        )}
        ref={ref}
        {...props}
        aria-describedby="loading-description"
        aria-labelledby="loading-title"
        aria-live="polite"
        role="status"
      >
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              {stage === 'processing' ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Icon className="h-5 w-5 text-primary" />
              )}
            </div>

            <div className="flex-1">
              <h3 className="font-semibold" id="loading-title">
                {contextInfo.title}
                {patientName && ` - ${patientName}`}
              </h3>
              <p
                className="mt-1 text-muted-foreground text-sm"
                id="loading-description"
              >
                {contextInfo.description}
              </p>

              {/* Progress Bar */}
              {typeof progress === 'number' && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progresso</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <ProgressBar progress={progress} />
                </div>
              )}

              {/* Estimated Time */}
              {estimatedTime && estimatedTime > 0 && (
                <p className="mt-2 text-muted-foreground text-xs">
                  Tempo estimado: {formatTime(estimatedTime)}
                </p>
              )}
            </div>
          </div>

          {/* Steps */}
          {steps && steps.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Etapas do Processo</h4>
              <StepIndicator
                showDetailedProgress={showDetailedProgress}
                steps={steps}
              />
            </div>
          )}

          {/* Comfort Information */}
          {showComfortInfo && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-start gap-3">
                <Heart className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                <div>
                  <h4 className="font-medium text-blue-900 text-sm">
                    Informação Tranquilizadora
                  </h4>
                  <p className="mt-1 text-blue-700 text-sm">
                    {contextInfo.comfortMessage}
                  </p>

                  {context === 'patient_loading' && (
                    <p className="mt-2 text-blue-600 text-xs">
                      💡 Seus dados estão criptografados e protegidos segundo a
                      LGPD. Apenas profissionais autorizados têm acesso.
                    </p>
                  )}

                  {(context === 'appointment_scheduling' ||
                    context === 'appointment_loading') && (
                    <p className="mt-2 text-blue-600 text-xs">
                      💡 Você receberá uma confirmação por e-mail e SMS assim
                      que o agendamento for concluído.
                    </p>
                  )}

                  {context === 'treatment_processing' && (
                    <p className="mt-2 text-blue-600 text-xs">
                      💡 Estamos registrando todos os detalhes para garantir a
                      continuidade do seu cuidado.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

HealthcareLoadingStates.displayName = 'HealthcareLoadingStates';

// Default steps for common contexts
export const defaultSteps: Record<LoadingContext, LoadingStep[]> = {
  patient_search: [
    {
      id: '1',
      label: 'Validando Critérios',
      stage: 'processing',
      icon: Shield,
    },
    { id: '2', label: 'Buscando Registros', stage: 'initializing', icon: User },
    {
      id: '3',
      label: 'Verificando Privacidade',
      stage: 'initializing',
      icon: Shield,
    },
    {
      id: '4',
      label: 'Organizando Resultados',
      stage: 'initializing',
      icon: FileText,
    },
  ],
  appointment_scheduling: [
    {
      id: '1',
      label: 'Verificando Disponibilidade',
      stage: 'processing',
      icon: Calendar,
    },
    {
      id: '2',
      label: 'Registrando Agendamento',
      stage: 'initializing',
      icon: FileText,
    },
    {
      id: '3',
      label: 'Enviando Confirmações',
      stage: 'initializing',
      icon: CheckCircle,
    },
  ],
  treatment_processing: [
    {
      id: '1',
      label: 'Validando Informações',
      stage: 'processing',
      icon: Shield,
    },
    {
      id: '2',
      label: 'Registrando Tratamento',
      stage: 'initializing',
      icon: Stethoscope,
    },
    {
      id: '3',
      label: 'Atualizando Histórico',
      stage: 'initializing',
      icon: FileText,
    },
    {
      id: '4',
      label: 'Sincronizando Dados',
      stage: 'initializing',
      icon: Users,
    },
  ],
  // Add other default steps as needed
  patient_loading: [],
  appointment_loading: [],
  document_upload: [],
  document_processing: [],
  consent_verification: [],
  compliance_check: [],
  emergency_access: [],
  data_sync: [],
  backup_restore: [],
  system_health: [],
  general: [],
};

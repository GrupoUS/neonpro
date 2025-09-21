/**
 * Clinical Workflow UX Patterns
 * Optimized healthcare user experience patterns for clinical environments
 *
 * Features:
 * - Clinical efficiency optimization
 * - Error prevention in medical contexts
 * - Multi-step procedure guidance
 * - Patient safety considerations
 * - Emergency response patterns
 * - Appointment and scheduling workflows
 * - LGPD and healthcare compliance
 * - Brazilian healthcare regulations (ANVISA, CFM)
 */

'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  AlertTriangle,
  Calendar,
  Check,
  CheckCircle,
  Clock,
  FileText,
  Heart,
  Phone,
  ShieldCheck,
  Stethoscope,
  User,
  UserCheck,
  Users,
  Zap,
  Activity,
  ClipboardList,
  AlertCircle,
  Thermometer,
  Eye,
  X,
  ChevronRight,
} from 'lucide-react';
import { Badge } from '@/components/ui';
import { NeumorphicCard } from '@/components/ui/neonpro-neumorphic';
import { cn } from '@neonpro/ui';
import { formatDateTime, formatCPF } from '@/utils/brazilian-formatters';

// Types for healthcare workflows
interface Patient {
  id: string;
  name: string;
  cpf?: string;
  birthDate?: string;
  status: 'active' | 'inactive' | 'pending' | 'urgent' | 'completed';
  lastVisit?: string;
  nextAppointment?: string;
  alerts?: PatientAlert[];
  medicalHistory?: MedicalHistoryItem[];
}

interface PatientAlert {
  id: string;
  type: 'allergy' | 'medication' | 'condition' | 'emergency' | 'follow-up';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  createdAt: string;
  acknowledged?: boolean;
}

interface MedicalHistoryItem {
  id: string;
  date: string;
  type: 'consultation' | 'procedure' | 'diagnosis' | 'prescription' | 'exam';
  description: string;
  provider: string;
  documents?: string[];
}

interface ClinicalStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'skipped' | 'error';
  required: boolean;
  estimatedDuration?: number;
  dependencies?: string[];
  validationRules?: ValidationRule[];
}

interface ValidationRule {
  field: string;
  rule: 'required' | 'min-length' | 'max-length' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

interface AppointmentSlot {
  id: string;
  dateTime: string;
  duration: number;
  available: boolean;
  provider: string;
  type: 'consultation' | 'procedure' | 'follow-up' | 'emergency';
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

/**
 * Patient Card with Clinical Information
 * Optimized for quick patient identification and critical alerts
 */
export const ClinicalPatientCard: React.FC<{
  patient: Patient;
  onSelectPatient?: (patient: Patient) => void;
  onViewHistory?: (patientId: string) => void;
  onScheduleAppointment?: (patientId: string) => void;
  showQuickActions?: boolean;
  compact?: boolean;
  className?: string;
}> = ({
  patient,
  onSelectPatient,
  onViewHistory,
  onScheduleAppointment,
  showQuickActions = true,
  compact = false,
  className,
}) => {
  const criticalAlerts = patient.alerts?.filter(alert => alert.severity === 'critical') || [];
  const hasUrgentStatus = patient.status === 'urgent' || criticalAlerts.length > 0;

  return (
    <NeumorphicCard
      variant={hasUrgentStatus ? 'alert' : 'patient'}
      className={cn(
        'cursor-pointer transition-all duration-200 hover:scale-[1.02]',
        hasUrgentStatus && 'ring-2 ring-red-500 ring-opacity-50',
        compact ? 'p-4' : 'p-6',
        className
      )}
      onClick={() => onSelectPatient?.(patient)}
      role="button"
      tabIndex={0}
      aria-label={`Paciente ${patient.name}, status ${patient.status}${hasUrgentStatus ? ', com alertas críticos' : ''}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelectPatient?.(patient);
        }
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#AC9469] to-[#d2aa60ff] flex items-center justify-center text-white font-semibold">
                {patient.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-[#112031] truncate text-base">
                {patient.name}
              </h3>
              {patient.cpf && (
                <p className="text-sm text-[#B4AC9C]">
                  CPF: {formatCPF(patient.cpf)}
                </p>
              )}
            </div>
          </div>

          {/* Patient Status and Alerts */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <PatientStatusBadge status={patient.status} />
            {criticalAlerts.length > 0 && (
              <Badge 
                variant="destructive" 
                className="text-xs animate-pulse"
                role="alert"
                aria-label={`${criticalAlerts.length} alerta${criticalAlerts.length > 1 ? 's' : ''} crítico${criticalAlerts.length > 1 ? 's' : ''}`}
              >
                <AlertTriangle className="w-3 h-3 mr-1" aria-hidden="true" />
                {criticalAlerts.length} Crítico{criticalAlerts.length > 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          {/* Quick Info */}
          {!compact && (
            <div className="space-y-1 text-xs text-[#B4AC9C]">
              {patient.lastVisit && (
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3" aria-hidden="true" />
                  <span>Última visita: {formatDateTime(patient.lastVisit)}</span>
                </div>
              )}
              {patient.nextAppointment && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3" aria-hidden="true" />
                  <span>Próxima consulta: {formatDateTime(patient.nextAppointment)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        {showQuickActions && (
          <div className="flex flex-col gap-2 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onViewHistory?.(patient.id);
              }}
              className="h-8 w-8 p-0 hover:bg-[#AC9469]/10"
              aria-label="Ver histórico médico"
            >
              <FileText className="w-4 h-4" aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onScheduleAppointment?.(patient.id);
              }}
              className="h-8 w-8 p-0 hover:bg-[#AC9469]/10"
              aria-label="Agendar consulta"
            >
              <Calendar className="w-4 h-4" aria-hidden="true" />
            </Button>
          </div>
        )}
      </div>

      {/* Critical Alerts Display */}
      {!compact && criticalAlerts.length > 0 && (
        <div className="mt-4 pt-3 border-t border-red-200">
          {criticalAlerts.slice(0, 2).map((alert) => (
            <div key={alert.id} className="flex items-start gap-2 mb-2 last:mb-0">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-red-700 font-medium">{alert.message}</p>
                <p className="text-xs text-red-600 opacity-70">
                  {formatDateTime(alert.createdAt)}
                </p>
              </div>
            </div>
          ))}
          {criticalAlerts.length > 2 && (
            <p className="text-xs text-red-600 mt-2">
              +{criticalAlerts.length - 2} alertas adicionais
            </p>
          )}
        </div>
      )}
    </NeumorphicCard>
  );
};

/**
 * Clinical Workflow Stepper
 * Guides healthcare professionals through multi-step procedures
 */
export const ClinicalWorkflowStepper: React.FC<{
  steps: ClinicalStep[];
  currentStep: number;
  onStepChange: (stepIndex: number) => void;
  onStepComplete: (stepIndex: number, _data?: any) => void;
  onWorkflowComplete: (data: any) => void;
  allowSkipping?: boolean;
  showProgress?: boolean;
  className?: string;
}> = ({
  steps,
  currentStep,
  onStepChange,
  onStepComplete,
  onWorkflowComplete,
  allowSkipping = false,
  showProgress = true,
  className,
}) => {
  const [stepData, setStepData] = useState<Record<number, any>>({});
  const [errors, setErrors] = useState<Record<number, string[]>>({});

  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  const validateStep = (stepIndex: number, data: any): string[] => {
    const step = steps[stepIndex];
    const stepErrors: string[] = [];

    if (step.validationRules) {
      step.validationRules.forEach(_rule => {
        const value = data[rule.field];
        
        switch (rule.rule) {
          case 'required':
            if (!value || (typeof value === 'string' && value.trim() === '')) {
              stepErrors.push(rule.message);
            }
            break;
          case 'min-length':
            if (typeof value === 'string' && value.length < rule.value) {
              stepErrors.push(rule.message);
            }
            break;
          case 'max-length':
            if (typeof value === 'string' && value.length > rule.value) {
              stepErrors.push(rule.message);
            }
            break;
          case 'pattern':
            if (typeof value === 'string' && !new RegExp(rule.value).test(value)) {
              stepErrors.push(rule.message);
            }
            break;
        }
      });
    }

    return stepErrors;
  };

  const handleStepComplete = (stepIndex: number, data: any) => {
    const stepErrors = validateStep(stepIndex, data);
    
    if (stepErrors.length > 0) {
      setErrors(prev => ({ ...prev, [stepIndex]: stepErrors }));
      return;
    }

    setErrors(prev => ({ ...prev, [stepIndex]: [] }));
    setStepData(prev => ({ ...prev, [stepIndex]: data }));
    onStepComplete(stepIndex, data);

    // Check if workflow is complete
    if (stepIndex === steps.length - 1) {
      const allData = { ...stepData, [stepIndex]: data };
      onWorkflowComplete(allData);
    } else {
      // Move to next step
      onStepChange(stepIndex + 1);
    }
  };

  const handleStepSkip = (_stepIndex: any) => {
    if (allowSkipping && !steps[stepIndex].required) {
      onStepChange(stepIndex + 1);
    }
  };

  const getStepIcon = (step: ClinicalStep, index: number) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" aria-hidden="true" />;
      case 'in-progress':
        return <Activity className="w-5 h-5 text-[#AC9469] animate-pulse" aria-hidden="true" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" aria-hidden="true" />;
      default:
        return (
          <div className="w-5 h-5 rounded-full border-2 border-[#B4AC9C] flex items-center justify-center">
            <span className="text-xs font-medium text-[#B4AC9C]">{index + 1}</span>
          </div>
        );
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Progress Bar */}
      {showProgress && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-[#112031]">Progresso do Procedimento</h3>
            <span className="text-sm text-[#B4AC9C]">
              {completedSteps} de {steps.length} etapas
            </span>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-2"
            aria-label={`Progresso: ${Math.round(progressPercentage)}% concluído`}
          />
        </div>
      )}

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step, _index) => {
          const isActive = index === currentStep;
          const isCompleted = step.status === 'completed';
          const hasErrors = errors[index]?.length > 0;

          return (
            <NeumorphicCard
              key={step.id}
              variant={isActive ? 'raised' : isCompleted ? 'success' : hasErrors ? 'alert' : 'inset'}
              className={cn(
                'transition-all duration-200',
                isActive && 'ring-2 ring-[#AC9469] ring-opacity-50',
                hasErrors && 'ring-2 ring-red-500 ring-opacity-50'
              )}
            >
              <div className="flex items-start gap-4">
                {/* Step Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getStepIcon(step, index)}
                </div>

                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={cn(
                        'font-medium mb-1',
                        isActive ? 'text-[#112031]' : 'text-[#B4AC9C]'
                      )}>
                        {step.title}
                        {step.required && (
                          <span className="text-red-500 ml-1" aria-label="obrigatório">*</span>
                        )}
                      </h4>
                      <p className="text-sm text-[#B4AC9C] mb-2">
                        {step.description}
                      </p>
                      {step.estimatedDuration && (
                        <div className="flex items-center gap-1 text-xs text-[#B4AC9C] mb-2">
                          <Clock className="w-3 h-3" aria-hidden="true" />
                          <span>Tempo estimado: {step.estimatedDuration} min</span>
                        </div>
                      )}
                    </div>

                    {/* Step Actions */}
                    {isActive && (
                      <div className="flex gap-2 ml-4">
                        {allowSkipping && !step.required && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStepSkip(index)}
                            className="text-xs"
                          >
                            Pular
                          </Button>
                        )}
                        <NeumorphicButton
                          variant="primary"
                          size="sm"
                          onClick={() => handleStepComplete(index, stepData[index] || {})}
                          className="text-xs"
                        >
                          {index === steps.length - 1 ? 'Finalizar' : 'Concluir'}
                        </NeumorphicButton>
                      </div>
                    )}
                  </div>

                  {/* Validation Errors */}
                  {hasErrors && (
                    <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                      <h5 className="text-sm font-medium text-red-800 mb-1">
                        Correções necessárias:
                      </h5>
                      <ul className="text-sm text-red-700 space-y-1">
                        {errors[index].map((error, errorIndex) => (
                          <li key={errorIndex} className="flex items-start gap-2">
                            <X className="w-3 h-3 mt-0.5 flex-shrink-0" aria-hidden="true" />
                            <span>{error}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </NeumorphicCard>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Emergency Alert System
 * Critical alert display for emergency situations in clinical environments
 */
export const EmergencyAlertSystem: React.FC<{
  alerts: PatientAlert[];
  onAcknowledgeAlert: (alertId: string) => void;
  onDismissAlert: (alertId: string) => void;
  onEscalateAlert: (alertId: string) => void;
  position?: 'top' | 'bottom' | 'center';
  autoHide?: boolean;
  className?: string;
}> = ({
  alerts,
  onAcknowledgeAlert,
  onDismissAlert,
  onEscalateAlert,
  position = 'top',
  autoHide = false,
  className,
}) => {
  const [visibleAlerts, setVisibleAlerts] = useState<string[]>([]);
  const alertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisibleAlerts(alerts.map(alert => alert.id));
  }, [alerts]);

  useEffect(() => {
    if (autoHide && alerts.length > 0) {
      const timer = setTimeout(() => {
        setVisibleAlerts([]);
      }, 10000); // Auto-hide after 10 seconds

      return () => clearTimeout(timer);
    }
  }, [alerts, autoHide]);

  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');
  const highAlerts = alerts.filter(alert => alert.severity === 'high');

  if (visibleAlerts.length === 0) return null;

  const positionClasses = {
    top: 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50',
    bottom: 'fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50',
    center: 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50',
  };

  return (
    <div 
      ref={alertRef}
      className={cn(positionClasses[position], className)}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="space-y-3 max-w-md">
        {alerts.filter(alert => visibleAlerts.includes(alert.id)).map((alert) => {
          const getSeverityStyles = (_severity: any) => {
            switch (severity) {
              case 'critical':
                return 'bg-gradient-to-r from-red-500 to-red-600 text-white border-red-700 animate-pulse';
              case 'high':
                return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-orange-700';
              case 'medium':
                return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-yellow-700';
              default:
                return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-700';
            }
          };

          const getSeverityIcon = (_severity: any) => {
            switch (severity) {
              case 'critical':
                return <Zap className="w-5 h-5" aria-hidden="true" />;
              case 'high':
                return <AlertTriangle className="w-5 h-5" aria-hidden="true" />;
              case 'medium':
                return <AlertCircle className="w-5 h-5" aria-hidden="true" />;
              default:
                return <Activity className="w-5 h-5" aria-hidden="true" />;
            }
          };

          return (
            <div
              key={alert.id}
              className={cn(
                'rounded-xl p-4 border-2 shadow-lg transition-all duration-300',
                getSeverityStyles(alert.severity)
              )}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  {getSeverityIcon(alert.severity)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium uppercase tracking-wider opacity-90">
                      {alert.type === 'emergency' ? 'EMERGÊNCIA' : alert.type}
                    </span>
                    <Badge variant="outline" className="text-xs bg-white/20 border-white/30 text-white">
                      {alert.severity === 'critical' ? 'CRÍTICO' : alert.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium mb-2">{alert.message}</p>
                  <p className="text-xs opacity-80">
                    {formatDateTime(alert.createdAt)}
                  </p>
                </div>
              </div>

              {/* Alert Actions */}
              <div className="flex items-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onAcknowledgeAlert(alert.id);
                    setVisibleAlerts(prev => prev.filter(id => id !== alert.id));
                  }}
                  className="text-xs bg-white/20 border-white/30 text-white hover:bg-white/30"
                >
                  Reconhecer
                </Button>
                
                {alert.severity === 'critical' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEscalateAlert(alert.id)}
                    className="text-xs bg-white/20 border-white/30 text-white hover:bg-white/30"
                  >
                    Escalar
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onDismissAlert(alert.id);
                    setVisibleAlerts(prev => prev.filter(id => id !== alert.id));
                  }}
                  className="text-xs text-white hover:bg-white/20 ml-auto"
                  aria-label="Dispensar alerta"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Quick Appointment Scheduler
 * Streamlined appointment booking for clinical efficiency
 */
export const QuickAppointmentScheduler: React.FC<{
  availableSlots: AppointmentSlot[];
  patientId?: string;
  providerId?: string;
  onScheduleAppointment: (slot: AppointmentSlot, notes?: string) => void;
  onCancel: () => void;
  emergencyMode?: boolean;
  className?: string;
}> = ({
  availableSlots,
  patientId,
  providerId,
  onScheduleAppointment,
  onCancel,
  emergencyMode = false,
  className,
}) => {
  const [selectedSlot, setSelectedSlot] = useState<AppointmentSlot | null>(null);
  const [notes, setNotes] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredSlots = availableSlots.filter(slot => {
    if (filterType === 'all') return true;
    return slot.type === filterType;
  });

  const urgentSlots = filteredSlots.filter(slot => slot.priority === 'urgent');
  const regularSlots = filteredSlots.filter(slot => slot.priority !== 'urgent');

  const handleSchedule = () => {
    if (selectedSlot) {
      onScheduleAppointment(selectedSlot, notes.trim() || undefined);
    }
  };

  return (
    <NeumorphicCard className={cn('p-6', className)}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#112031]">
            {emergencyMode ? 'Agendamento de Emergência' : 'Agendamento Rápido'}
          </h3>
          {emergencyMode && (
            <Badge variant="destructive" className="animate-pulse">
              <Zap className="w-3 h-3 mr-1" aria-hidden="true" />
              URGENTE
            </Badge>
          )}
        </div>

        {/* Appointment Type Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#112031]">Tipo de Consulta</label>
          <div className="flex flex-wrap gap-2">
            {['all', 'consultation', 'procedure', 'follow-up', 'emergency'].map((type) => (
              <Button
                key={type}
                variant={filterType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType(type)}
                className="text-xs"
              >
                {type === 'all' ? 'Todos' : 
                 type === 'consultation' ? 'Consulta' :
                 type === 'procedure' ? 'Procedimento' :
                 type === 'follow-up' ? 'Retorno' : 'Emergência'}
              </Button>
            ))}
          </div>
        </div>

        {/* Available Slots */}
        <div className="space-y-4">
          {/* Urgent Slots First */}
          {urgentSlots.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-red-600 mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4" aria-hidden="true" />
                Horários Urgentes
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {urgentSlots.map((slot) => (
                  <Button
                    key={slot.id}
                    variant={selectedSlot?.id === slot.id ? 'default' : 'outline'}
                    className={cn(
                      'text-left p-3 h-auto justify-start',
                      selectedSlot?.id === slot.id && 'ring-2 ring-[#AC9469]',
                      'border-red-200 hover:border-red-300'
                    )}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" aria-hidden="true" />
                        <span className="font-medium">
                          {formatDateTime(slot.dateTime)}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {slot.provider} • {slot.duration}min
                      </div>
                      <Badge variant="destructive" className="text-xs">
                        Urgente
                      </Badge>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Regular Slots */}
          {regularSlots.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-[#112031] mb-2">
                Horários Disponíveis
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                {regularSlots.map((slot) => (
                  <Button
                    key={slot.id}
                    variant={selectedSlot?.id === slot.id ? 'default' : 'outline'}
                    className={cn(
                      'text-left p-3 h-auto justify-start',
                      selectedSlot?.id === slot.id && 'ring-2 ring-[#AC9469]'
                    )}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" aria-hidden="true" />
                        <span className="font-medium">
                          {formatDateTime(slot.dateTime)}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {slot.provider} • {slot.duration}min
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {slot.type === 'consultation' ? 'Consulta' :
                         slot.type === 'procedure' ? 'Procedimento' :
                         slot.type === 'follow-up' ? 'Retorno' : 'Emergência'}
                      </Badge>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {filteredSlots.length === 0 && (
            <div className="text-center py-8 text-[#B4AC9C]">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" aria-hidden="true" />
              <p>Nenhum horário disponível para este tipo de consulta</p>
            </div>
          )}
        </div>

        {/* Notes */}
        {selectedSlot && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#112031]">Observações (opcional)</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Informações adicionais sobre o agendamento..."
              rows={3}
              className="resize-none"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <NeumorphicButton
            variant="primary"
            onClick={handleSchedule}
            disabled={!selectedSlot}
            className="flex-1"
          >
            {emergencyMode ? 'Agendar Urgente' : 'Confirmar Agendamento'}
          </NeumorphicButton>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </div>
    </NeumorphicCard>
  );
};

export type {
  Patient,
  PatientAlert,
  MedicalHistoryItem,
  ClinicalStep,
  ValidationRule,
  AppointmentSlot,
};
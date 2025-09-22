/**
 * Enhanced Patient Card with Healthcare Accessibility
 * T081-A3 - Enhanced Component Accessibility Compliance
 *
 * Enhanced features:
 * - Healthcare-specific ARIA attributes
 * - Emergency information indicators
 * - Medical terminology accessibility
 * - Treatment status accessibility
 * - Advanced healthcare audit integration
 * - Brazilian healthcare compliance (LGPD/ANVISA/CFM)
 */

'use client';

import { Card } from '@/components/ui';
import { AlertTriangle } from 'lucide-react';
import React, { useCallback, useMemo } from 'react';
import {
  useAccessibilityPreferences,
  useScreenReaderAnnouncement,
} from '../../hooks/useAccessibility';
import { ACCESSIBILITY_LABELS_PT_BR } from '../../utils/accessibility';

interface PatientData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  birthDate?: Date;
  lastAppointment?: Date;
  nextAppointment?: Date;
  status: 'active' | 'inactive' | 'pending' | 'critical' | 'emergency';
  lgpdConsent: boolean;
  treatmentType?: string;
  medication?: string[];
  allergies?: string[];
  emergencyContact?: string;
  isEmergencyCase?: boolean;
  requiresSpecialAttention?: boolean;
  lastVitalSigns?: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
  };
}

interface EnhancedPatientCardProps {
  patient: PatientData;
  onClick?: (patient: PatientData) => void;
  onKeyboardSelect?: (patient: PatientData) => void;
  isSelected?: boolean;
  showSensitiveData?: boolean;
  showEmergencyInfo?: boolean;
  enableHealthcareAudit?: boolean;
  auditContext?:
    | 'registration'
    | 'appointment'
    | 'treatment'
    | 'follow-up'
    | 'emergency';
  className?: string;
}

export function EnhancedPatientCard({
  patient,
  onClick,
  onKeyboardSelect,
  isSelected = false,
  showSensitiveData = false,
  showEmergencyInfo = false,
  enableHealthcareAudit = true,
  auditContext = 'registration',
  className,
}: EnhancedPatientCardProps) {
  const { prefersHighContrast, prefersReducedMotion } = useAccessibilityPreferences();
  const { announceHealthcareData } = useScreenReaderAnnouncement();

  // Healthcare-specific data categorization
  const healthcareDataCategory = useMemo(() => {
    if (patient.isEmergencyCase || patient.status === 'emergency') {
      return 'emergency';
    }
    if (patient.status === 'critical') return 'critical';
    if (patient.requiresSpecialAttention) return 'special-care';
    if (patient.medication && patient.medication.length > 0) {
      return 'under-treatment';
    }
    return 'general';
  }, [patient]);

  // Generate healthcare-specific ARIA attributes
  const healthcareAriaProps = useMemo(() => {
    const baseProps = {
      'data-patient-sensitive': showSensitiveData.toString(),
      'data-healthcare-category': healthcareDataCategory,
      'data-emergency': (
        patient.isEmergencyCase || patient.status === 'emergency'
      ).toString(),
      'data-audit-context': auditContext,
      'data-privacy-level': patient.status === 'critical'
        ? 'high'
        : showSensitiveData
        ? 'medium'
        : 'low',
    };

    return baseProps;
  }, [showSensitiveData, healthcareDataCategory, patient, auditContext]);

  // Enhanced screen reader formatting with medical terminology
  const formatPatientForScreenReader = useCallback(() => {
    const parts = [
      `Paciente: ${patient.name}`,
      `Status: ${getEnhancedStatusLabel(patient.status)}`,
      `Categoria: ${getHealthcareCategoryLabel(healthcareDataCategory)}`,
    ];

    // Emergency information
    if (patient.isEmergencyCase || patient.status === 'emergency') {
      parts.push('⚠️ Caso de emergência');
    }

    // Contact information
    if (showSensitiveData && patient.phone) {
      parts.push(
        `Telefone: ${ScreenReaderUtils.formatPhoneNumber(patient.phone)}`,
      );
    }

    // Medical information
    if (showSensitiveData && patient.treatmentType) {
      parts.push(`Tipo de tratamento: ${patient.treatmentType}`);
    }

    if (
      showSensitiveData
      && patient.medication
      && patient.medication.length > 0
    ) {
      parts.push(`Medicamentos: ${patient.medication.join(', ')}`);
    }

    // Appointment information
    if (patient.lastAppointment) {
      const formattedDate = ScreenReaderUtils.formatDateForScreenReader(
        patient.lastAppointment,
      );
      parts.push(`Última consulta: ${formattedDate}`);
    }

    if (patient.nextAppointment) {
      const formattedDate = ScreenReaderUtils.formatDateForScreenReader(
        patient.nextAppointment,
      );
      parts.push(`Próxima consulta: ${formattedDate}`);
    }

    // Vital signs
    if (showSensitiveData && patient.lastVitalSigns) {
      const { bloodPressure, heartRate, temperature } = patient.lastVitalSigns;
      if (bloodPressure) parts.push(`Pressão arterial: ${bloodPressure}`);
      if (heartRate) {
        parts.push(`Frequência cardíaca: ${heartRate} batimentos por minuto`);
      }
      if (temperature) parts.push(`Temperatura: ${temperature} graus`);
    }

    // Age and demographics
    if (patient.birthDate) {
      const age = calculateAge(patient.birthDate);
      parts.push(`Idade: ${age} anos`);
    }

    // Compliance information
    parts.push(`Consentimento LGPD: ${patient.lgpdConsent ? 'Sim' : 'Não'}`);

    return parts.join('. ');
  }, [patient, showSensitiveData, healthcareDataCategory]);

  const handleClick = useCallback(() => {
    onClick?.(patient);
    announceHealthcareData('Paciente selecionado', patient.name);
  }, [onClick, patient, announceHealthcareData]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onKeyboardSelect?.(patient);
        announceHealthcareData(
          'Paciente selecionado via teclado',
          patient.name,
        );
      }
    },
    [onKeyboardSelect, patient, announceHealthcareData],
  );

  const getEnhancedStatusLabel = (status: PatientData['status']): string => {
    const statusLabels = {
      active: 'Ativo',
      inactive: 'Inativo',
      pending: 'Pendente',
      critical: 'Crítico',
      emergency: 'Emergência',
    };
    return statusLabels[status];
  };

  const getHealthcareCategoryLabel = (category: string): string => {
    const categoryLabels = {
      emergency: 'Emergência',
      critical: 'Crítico',
      'special-care': 'Cuidados Especiais',
      'under-treatment': 'Em Tratamento',
      general: 'Geral',
    };
    return categoryLabels[category as keyof typeof categoryLabels] || 'Geral';
  };

  const calculateAge = (birthDate: Date): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0
      || (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  };

  const getStatusColor = (status: PatientData['status']): string => {
    const colors = {
      active: prefersHighContrast
        ? 'text-green-900 bg-green-100'
        : 'text-green-700 bg-green-50',
      inactive: prefersHighContrast
        ? 'text-gray-900 bg-gray-100'
        : 'text-gray-600 bg-gray-50',
      pending: prefersHighContrast
        ? 'text-yellow-900 bg-yellow-100'
        : 'text-yellow-700 bg-yellow-50',
      critical: prefersHighContrast
        ? 'text-red-900 bg-red-100'
        : 'text-red-700 bg-red-50',
      emergency: prefersHighContrast
        ? 'text-red-900 bg-red-100 border-2 border-red-900'
        : 'text-red-700 bg-red-50 border border-red-200',
    };
    return colors[status];
  };

  const getHealthcareCategoryIcon = (_category: any) => {
    const icons = {
      emergency: AlertTriangle,
      critical: AlertTriangle,
      'special-care': Heart,
      'under-treatment': Heart,
      general: User,
    };
    return icons[category as keyof typeof icons] || User;
  };

  const CategoryIcon = getHealthcareCategoryIcon(healthcareDataCategory);

  return (
    <Card
      className={`
        cursor-pointer transition-all duration-200 
        ${prefersReducedMotion ? '' : 'hover:shadow-md hover:scale-[1.02]'}
        ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
        ${prefersHighContrast ? 'border-2 border-gray-900' : 'border border-gray-200'}
        focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2
        ${patient.status === 'emergency' ? 'animate-pulse' : ''}
        ${className}
      `}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role='button'
      aria-label={formatPatientForScreenReader()}
      aria-selected={isSelected}
      aria-describedby={`patient-${patient.id}-details patient-${patient.id}-healthcare`}
      {...healthcareAriaProps}
    >
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            {/* Category Icon */}
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center
                ${
                healthcareDataCategory === 'emergency'
                  || healthcareDataCategory === 'critical'
                  ? prefersHighContrast
                    ? 'bg-red-900 text-white'
                    : 'bg-red-500 text-white'
                  : prefersHighContrast
                  ? 'bg-gray-900 text-white'
                  : 'bg-primary/10 text-primary'
              }
              `}
              aria-hidden='true'
            >
              <CategoryIcon className='w-5 h-5' />
            </div>

            <div>
              <h3
                className={`font-semibold ${
                  prefersHighContrast ? 'text-gray-900' : 'text-gray-900'
                }`}
              >
                {patient.name}
              </h3>
              <div className='flex items-center space-x-2'>
                <div
                  className={`
                    inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                    ${getStatusColor(patient.status)}
                  `}
                  role='status'
                  aria-label={`Status do paciente: ${getEnhancedStatusLabel(patient.status)}`}
                >
                  {getEnhancedStatusLabel(patient.status)}
                </div>
                {patient.requiresSpecialAttention && (
                  <div
                    className='w-2 h-2 rounded-full bg-orange-500'
                    aria-hidden='true'
                    title='Requer atenção especial'
                  />
                )}
              </div>
            </div>
          </div>

          {/* Compliance Indicators */}
          <div className='flex items-center space-x-2'>
            {/* LGPD Consent */}
            <div
              className={`
                w-3 h-3 rounded-full
                ${
                patient.lgpdConsent
                  ? prefersHighContrast
                    ? 'bg-green-900'
                    : 'bg-green-500'
                  : prefersHighContrast
                  ? 'bg-red-900'
                  : 'bg-red-500'
              }
              `}
              role='img'
              aria-label={`Consentimento LGPD: ${
                patient.lgpdConsent ? 'Concedido' : 'Não concedido'
              }`}
              title={`Consentimento LGPD: ${patient.lgpdConsent ? 'Concedido' : 'Não concedido'}`}
            />

            {/* Healthcare Audit Indicator */}
            {enableHealthcareAudit && (
              <div
                className='w-3 h-3 rounded-full bg-blue-500'
                role='img'
                aria-label='Auditoria de acessibilidade em saúde habilitada'
                title='Auditoria de saúde ativa'
              />
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className='pt-0'>
        <div id={`patient-${patient.id}-details`} className='space-y-2'>
          {/* Emergency Information */}
          {showEmergencyInfo
            && (patient.isEmergencyCase || patient.status === 'emergency') && (
            <div
              className={`
                p-3 rounded-md border
                ${
                prefersHighContrast
                  ? 'bg-red-100 border-red-900 text-red-900'
                  : 'bg-red-50 border-red-200 text-red-700'
              }
              `}
              role='alert'
              aria-live='assertive'
            >
              <div className='flex items-center space-x-2'>
                <AlertTriangle className='w-4 h-4' aria-hidden='true' />
                <span className='text-sm font-medium'>
                  Paciente em situação de emergência
                </span>
              </div>
              {patient.emergencyContact && (
                <div className='text-xs mt-1'>
                  Contato de emergência: {patient.emergencyContact}
                </div>
              )}
            </div>
          )}

          {/* Medical Information */}
          {showSensitiveData && patient.treatmentType && (
            <div className='text-sm text-gray-600'>
              <span className='font-medium'>Tratamento:</span> {patient.treatmentType}
            </div>
          )}

          {/* Medications */}
          {showSensitiveData
            && patient.medication
            && patient.medication.length > 0 && (
            <div className='text-sm text-gray-600'>
              <span className='font-medium'>Medicamentos:</span>{' '}
              <span
                aria-label={`Medicamentos: ${patient.medication.join(', ')}`}
              >
                {patient.medication.join(', ')}
              </span>
            </div>
          )}

          {/* Allergies */}
          {showSensitiveData
            && patient.allergies
            && patient.allergies.length > 0 && (
            <div
              className={`
                p-2 rounded-md text-sm
                ${
                prefersHighContrast
                  ? 'bg-yellow-100 border-yellow-900 text-yellow-900'
                  : 'bg-yellow-50 border border-yellow-200 text-yellow-700'
              }
              `}
              role='status'
            >
              <div className='flex items-center space-x-1'>
                <AlertTriangle className='w-4 h-4' aria-hidden='true' />
                <span className='font-medium'>Alergias:</span>{' '}
                <span
                  aria-label={`Alergias: ${patient.allergies.join(', ')}`}
                >
                  {patient.allergies.join(', ')}
                </span>
              </div>
            </div>
          )}

          {/* Contact Information */}
          {showSensitiveData && patient.phone && (
            <div className='flex items-center space-x-2 text-sm text-gray-600'>
              <Phone className='w-4 h-4' aria-hidden='true' />
              <span
                aria-label={`Telefone: ${ScreenReaderUtils.formatPhoneNumber(patient.phone)}`}
              >
                {patient.phone}
              </span>
            </div>
          )}

          {/* Age Information */}
          {patient.birthDate && (
            <div className='flex items-center space-x-2 text-sm text-gray-600'>
              <Calendar className='w-4 h-4' aria-hidden='true' />
              <span
                aria-label={`Idade: ${calculateAge(patient.birthDate)} anos`}
              >
                {calculateAge(patient.birthDate)} anos
              </span>
            </div>
          )}

          {/* Appointments */}
          {patient.lastAppointment && (
            <div className='text-sm text-gray-500'>
              <span className='sr-only'>Último agendamento:</span>
              <span
                aria-label={`Último agendamento: ${
                  ScreenReaderUtils.formatDateForScreenReader(
                    patient.lastAppointment,
                  )
                }`}
              >
                Último: {new Intl.DateTimeFormat('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                }).format(patient.lastAppointment)}
              </span>
            </div>
          )}

          {patient.nextAppointment && (
            <div className='text-sm text-gray-500'>
              <span className='sr-only'>Próximo agendamento:</span>
              <span
                aria-label={`Próximo agendamento: ${
                  ScreenReaderUtils.formatDateForScreenReader(
                    patient.nextAppointment,
                  )
                }`}
              >
                Próxima: {new Intl.DateTimeFormat('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                }).format(patient.nextAppointment)}
              </span>
            </div>
          )}

          {/* Vital Signs */}
          {showSensitiveData && patient.lastVitalSigns && (
            <div className='text-sm text-gray-600'>
              <span className='font-medium'>Sinais vitais:</span>
              <div
                className='grid grid-cols-2 gap-1 text-xs'
                aria-label='Sinais vitais do paciente'
              >
                {patient.lastVitalSigns.bloodPressure && (
                  <div>PA: {patient.lastVitalSigns.bloodPressure}</div>
                )}
                {patient.lastVitalSigns.heartRate && (
                  <div>FC: {patient.lastVitalSigns.heartRate} bpm</div>
                )}
                {patient.lastVitalSigns.temperature && (
                  <div>Temp: {patient.lastVitalSigns.temperature}°C</div>
                )}
              </div>
            </div>
          )}

          {/* Healthcare Audit Information */}
          <div id={`patient-${patient.id}-healthcare`} className='sr-only'>
            Categoria de atendimento:{' '}
            {getHealthcareCategoryLabel(healthcareDataCategory)}. Contexto da auditoria:{' '}
            {auditContext}.
            {enableHealthcareAudit
              && 'Auditoria de acessibilidade em saúde habilitada.'}
          </div>

          {/* Accessibility Information for Screen Readers */}
          <div className='sr-only'>
            {ACCESSIBILITY_LABELS_PT_BR.patientData}.
            {patient.requiresSpecialAttention && ' Requer atenção especial.'}
            {patient.isEmergencyCase && ' Caso de emergência.'}
            Pressione Enter ou Espaço para selecionar este paciente.
            {isSelected && ' Paciente atualmente selecionado.'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default EnhancedPatientCard;

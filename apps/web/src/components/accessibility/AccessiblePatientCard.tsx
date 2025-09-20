/**
 * Accessible Patient Card Component
 * T081 - WCAG 2.1 AA+ Accessibility Compliance
 *
 * Features:
 * - WCAG 2.1 AA+ compliant patient information display
 * - Screen reader optimized healthcare data
 * - Keyboard navigation support
 * - High contrast mode support
 * - Brazilian Portuguese accessibility
 * - LGPD compliant data display
 */

'use client';

import { Card, CardContent, CardHeader } from '@neonpro/ui';
import { Calendar, Phone, User } from 'lucide-react';
import React, { useCallback } from 'react';
import {
  useAccessibilityPreferences,
  useScreenReaderAnnouncement,
} from '../../hooks/useAccessibility';
import { ACCESSIBILITY_LABELS_PT_BR, ScreenReaderUtils } from '../../utils/accessibility';

interface PatientData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  birthDate?: Date;
  lastAppointment?: Date;
  status: 'active' | 'inactive' | 'pending';
  lgpdConsent: boolean;
}

interface AccessiblePatientCardProps {
  patient: PatientData;
  onClick?: (patient: PatientData) => void;
  onKeyboardSelect?: (patient: PatientData) => void;
  isSelected?: boolean;
  showSensitiveData?: boolean;
  className?: string;
}

export function AccessiblePatientCard({
  patient,
  onClick,
  onKeyboardSelect,
  isSelected = false,
  showSensitiveData = false,
  className,
}: AccessiblePatientCardProps) {
  const { prefersHighContrast, prefersReducedMotion } = useAccessibilityPreferences();
  const { announceHealthcareData } = useScreenReaderAnnouncement();

  // Format patient data for screen readers
  const formatPatientForScreenReader = useCallback(() => {
    const parts = [
      `Paciente: ${patient.name}`,
      `Status: ${getStatusLabel(patient.status)}`,
    ];

    if (showSensitiveData && patient.phone) {
      parts.push(`Telefone: ${patient.phone}`);
    }

    if (patient.lastAppointment) {
      const formattedDate = ScreenReaderUtils.formatDateForScreenReader(
        patient.lastAppointment,
      );
      parts.push(`Último agendamento: ${formattedDate}`);
    }

    if (patient.birthDate) {
      const age = calculateAge(patient.birthDate);
      parts.push(`Idade: ${age} anos`);
    }

    parts.push(`Consentimento LGPD: ${patient.lgpdConsent ? 'Sim' : 'Não'}`);

    return parts.join('. ');
  }, [patient, showSensitiveData]);

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

  const getStatusLabel = (status: PatientData['status']): string => {
    const statusLabels = {
      active: 'Ativo',
      inactive: 'Inativo',
      pending: 'Pendente',
    };
    return statusLabels[status];
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
    };
    return colors[status];
  };

  return (
    <Card
      className={`
        cursor-pointer transition-all duration-200 
        ${prefersReducedMotion ? '' : 'hover:shadow-md hover:scale-[1.02]'}
        ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
        ${prefersHighContrast ? 'border-2 border-gray-900' : 'border border-gray-200'}
        focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2
        ${className}
      `}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role='button'
      aria-label={formatPatientForScreenReader()}
      aria-selected={isSelected}
      aria-describedby={`patient-${patient.id}-details`}
    >
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center
                ${prefersHighContrast ? 'bg-gray-900 text-white' : 'bg-primary/10 text-primary'}
              `}
              aria-hidden='true'
            >
              <User className='w-5 h-5' />
            </div>
            <div>
              <h3
                className={`font-semibold ${
                  prefersHighContrast ? 'text-gray-900' : 'text-gray-900'
                }`}
              >
                {patient.name}
              </h3>
              <div
                className={`
                  inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                  ${getStatusColor(patient.status)}
                `}
                role='status'
                aria-label={`Status do paciente: ${getStatusLabel(patient.status)}`}
              >
                {getStatusLabel(patient.status)}
              </div>
            </div>
          </div>

          {/* LGPD Consent Indicator */}
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
        </div>
      </CardHeader>

      <CardContent className='pt-0'>
        <div id={`patient-${patient.id}-details`} className='space-y-2'>
          {/* Contact Information */}
          {showSensitiveData && patient.phone && (
            <div className='flex items-center space-x-2 text-sm text-gray-600'>
              <Phone className='w-4 h-4' aria-hidden='true' />
              <span aria-label={`Telefone: ${patient.phone}`}>
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

          {/* Last Appointment */}
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
                Último agendamento: {new Intl.DateTimeFormat('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                }).format(patient.lastAppointment)}
              </span>
            </div>
          )}

          {/* Accessibility Information for Screen Readers */}
          <div className='sr-only'>
            {ACCESSIBILITY_LABELS_PT_BR.patientData}. Pressione Enter ou Espaço para selecionar este
            paciente.
            {isSelected && ' Paciente atualmente selecionado.'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Accessible Patient List Component
 */
interface AccessiblePatientListProps {
  patients: PatientData[];
  onPatientSelect: (patient: PatientData) => void;
  selectedPatientId?: string;
  showSensitiveData?: boolean;
  className?: string;
}

export function AccessiblePatientList({
  patients,
  onPatientSelect,
  selectedPatientId,
  showSensitiveData = false,
  className,
}: AccessiblePatientListProps) {
  const { announce } = useScreenReaderAnnouncement();

  const handlePatientSelect = useCallback(
    (patient: PatientData) => {
      onPatientSelect(patient);
      announce(`Paciente ${patient.name} selecionado`, 'polite');
    },
    [onPatientSelect, announce],
  );

  return (
    <div
      className={className}
      role='list'
      aria-label={`Lista de pacientes. ${patients.length} pacientes encontrados.`}
    >
      {patients.map((patient, index) => (
        <div
          key={patient.id}
          role='listitem'
          aria-setsize={patients.length}
          aria-posinset={index + 1}
        >
          <AccessiblePatientCard
            patient={patient}
            onClick={handlePatientSelect}
            onKeyboardSelect={handlePatientSelect}
            isSelected={patient.id === selectedPatientId}
            showSensitiveData={showSensitiveData}
            className='mb-4'
          />
        </div>
      ))}

      {patients.length === 0 && (
        <div
          role='status'
          aria-live='polite'
          className='text-center py-8 text-gray-500'
        >
          Nenhum paciente encontrado.
        </div>
      )}
    </div>
  );
}

export default AccessiblePatientCard;

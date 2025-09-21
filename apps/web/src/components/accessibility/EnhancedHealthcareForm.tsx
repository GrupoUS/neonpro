/**
 * Enhanced Healthcare Form with Medical Field Accessibility
 * T081-A3 - Enhanced Component Accessibility Compliance
 *
 * Enhanced features:
 * - Medical terminology accessibility with explanations
 * - Healthcare-specific validation patterns
 * - Emergency field prioritization
 * - Medical data privacy integration
 * - Advanced healthcare audit features
 * - Brazilian healthcare compliance validation
 */

'use client';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@neonpro/ui';
import { AlertCircle } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import {
  useAccessibilityPreferences,
  useAccessibleField,
  useLiveRegion,
  useScreenReaderAnnouncement,
} from '../../hooks/useAccessibility';
import { ACCESSIBILITY_LABELS_PT_BR, createHealthcareFormAria } from '../../utils/accessibility';

interface MedicalFormField {
  name: string;
  label: string;
  type:
    | 'text'
    | 'email'
    | 'tel'
    | 'textarea'
    | 'select'
    | 'date'
    | 'number'
    | 'medical-code';
  required?: boolean;
  placeholder?: string;
  description?: string;
  options?: { value: string; label: string; description?: string }[];
  validate?: (value: string) => string | null;
  medicalTerminology?: {
    term: string;
    explanation: string;
    pronunciation?: string;
  };
  sensitivityLevel?: 'low' | 'medium' | 'high' | 'critical';
  emergencyRelevant?: boolean;
  lgpdRelevant?: boolean;
  anvisaRelevant?: boolean;
  format?: string; // For phone, CPF, dates, etc.
}

interface HealthcareValidationRule {
  field: string;
  rule: string;
  errorMessage: string;
  severity: 'error' | 'warning' | 'info';
}

interface EnhancedHealthcareFormProps {
  title: string;
  description?: string;
  fields: MedicalFormField[];
  validationRules?: HealthcareValidationRule[];
  onSubmit: (data: Record<string, string>) => Promise<void>;
  submitLabel?: string;
  isLoading?: boolean;
  enableHealthcareAudit?: boolean;
  auditContext?:
    | 'registration'
    | 'appointment'
    | 'treatment'
    | 'follow-up'
    | 'emergency';
  emergencyMode?: boolean;
  className?: string;
}

export function EnhancedHealthcareForm({
  title,
  description,
  fields,
  validationRules = [],
  onSubmit,
  submitLabel = 'Enviar',
  isLoading = false,
  enableHealthcareAudit = true,
  auditContext = 'registration',
  emergencyMode = false,
  className,
}: EnhancedHealthcareFormProps) {
  const { prefersHighContrast, prefersReducedMotion } = useAccessibilityPreferences();
  const { announce, announceFormError, announceFormSuccess } = useScreenReaderAnnouncement();
  const {
    message: liveMessage,
    announce: announceLive,
    liveRegionProps,
  } = useLiveRegion();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [validationWarnings, setValidationWarnings] = useState<
    Record<string, string>
  >({});

  // Create accessible field hooks for each form field
  const fieldHooks = fields.reduce(
    (acc, field) => {
      acc[field.name] = useAccessibleField(field.name, {
        required: field.required,
        validate: field.validate,
      });
      return acc;
    },
    {} as Record<string, ReturnType<typeof useAccessibleField>>,
  );

  const formatFieldValue = useCallback(
    (field: MedicalFormField, value: string): string => {
      if (!value) return value;

      switch (field.format) {
        case 'phone':
          return formatPhoneNumber(value);
        case 'cpf':
          return formatCPF(value);
        case 'date':
          return formatDate(value);
        default:
          return value;
      }
    },
    [],
  );

  const validateForm = useCallback(() => {
    let isValid = true;
    const errors: string[] = [];
    const warnings: Record<string, string> = {};

    // Validate each field
    fields.forEach(_field => {
      const fieldHook = fieldHooks[field.name];
      const fieldValue = formatFieldValue(field, fieldHook.value);

      // Update field value with formatting
      if (fieldValue !== fieldHook.value) {
        fieldHook.setValue(fieldValue);
      }

      const fieldIsValid = fieldHook.validateField();

      if (!fieldIsValid) {
        isValid = false;
        if (fieldHook.error) {
          errors.push(`${field.label}: ${fieldHook.error}`);
        }
      }
    });

    // Apply healthcare-specific validation rules
    validationRules.forEach(_rule => {
      const fieldHook = fieldHooks[rule.field];
      const fieldValue = fieldHook?.value || '';

      if (fieldValue && !isValidByRule(rule.rule, fieldValue)) {
        if (rule.severity === 'error') {
          isValid = false;
          errors.push(rule.errorMessage);
        } else if (rule.severity === 'warning') {
          warnings[rule.field] = rule.errorMessage;
        }
      }
    });

    setValidationWarnings(warnings);

    if (errors.length > 0) {
      announceFormError(
        'formulário de saúde',
        `${errors.length} erros encontrados: ${errors.join(', ')}`,
      );
      announceLive(
        `Formulário de saúde contém ${errors.length} erros. Corrija os campos destacados.`,
        'assertive',
      );
    }

    if (Object.keys(warnings).length > 0) {
      announceLive(
        `Formulário contém ${Object.keys(warnings).length} avisos para revisão.`,
        'polite',
      );
    }

    return isValid;
  }, [
    fields,
    fieldHooks,
    validationRules,
    announceFormError,
    announceLive,
    formatFieldValue,
  ]);

  const isValidByRule = useCallback((rule: string, value: string): boolean => {
    switch (rule) {
      case 'cpf-valid':
        return isValidCPF(value);
      case 'phone-valid':
        return isValidPhone(value);
      case 'email-medical':
        return isValidEmail(value);
      case 'date-not-future':
        return new Date(value) <= new Date();
      case 'age-adult':
        const age = calculateAge(value);
        return age >= 18;
      default:
        return true;
    }
  }, []);

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      if (isSubmitting || isLoading) return;

      setSubmitError(null);
      setSubmitSuccess(false);

      // Validate all fields
      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);
      announceLive('Enviando formulário de saúde...', 'polite');

      try {
        // Collect form data
        const formData = fields.reduce(
          (acc, field) => {
            acc[field.name] = fieldHooks[field.name].value;
            return acc;
          },
          {} as Record<string, string>,
        );

        await onSubmit(formData);

        setSubmitSuccess(true);
        announceFormSuccess('Formulário de saúde enviado com sucesso');
        announceLive('Formulário de saúde enviado com sucesso!', 'polite');
      } catch (_error) {
        const errorMessage = error instanceof Error
          ? error.message
          : 'Erro ao enviar formulário de saúde';
        setSubmitError(errorMessage);
        announceFormError('envio', errorMessage);
        announceLive(
          `Erro ao enviar formulário de saúde: ${errorMessage}`,
          'assertive',
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      isSubmitting,
      isLoading,
      validateForm,
      fields,
      fieldHooks,
      onSubmit,
      announceFormSuccess,
      announceFormError,
      announceLive,
    ],
  );

  const renderMedicalTerminologyHelp = useCallback(
    (_field: [a-zA-Z][a-zA-Z]*) => {
      if (!field.medicalTerminology) return null;

      const { term, explanation, pronunciation } = field.medicalTerminology;

      return (
        <div
          className={`
          mt-2 p-3 rounded-md border
          ${
            prefersHighContrast
              ? 'bg-blue-100 border-blue-900 text-blue-900'
              : 'bg-blue-50 border border-blue-200 text-blue-700'
          }
        `}
          role='tooltip'
          id={`${field.name}-terminology`}
        >
          <div className='flex items-start space-x-2'>
            <Info className='w-4 h-4 flex-shrink-0 mt-0.5' aria-hidden='true' />
            <div className='text-sm'>
              <div className='font-medium'>
                {term}
                {pronunciation && (
                  <span className='text-xs ml-2 text-blue-600'>
                    ({pronunciation})
                  </span>
                )}
              </div>
              <div className='mt-1'>{explanation}</div>
            </div>
          </div>
        </div>
      );
    },
    [prefersHighContrast],
  );

  const renderField = useCallback(
    (_field: [a-zA-Z][a-zA-Z]*) => {
      const fieldHook = fieldHooks[field.name];
      const { fieldProps, errorProps, descriptionProps } = fieldHook;

      const formattedValue = formatFieldValue(field, fieldHook.value);

      const baseInputClasses = `
      w-full transition-colors duration-200
      ${
        prefersHighContrast
          ? 'border-2 border-gray-900 focus:border-blue-900 focus:ring-blue-900'
          : 'border border-gray-300 focus:border-primary focus:ring-primary'
      }
      ${
        fieldHook.error
          ? prefersHighContrast
            ? 'border-red-900 bg-red-50'
            : 'border-red-500 bg-red-50'
          : validationWarnings[field.name]
          ? prefersHighContrast
            ? 'border-yellow-900 bg-yellow-50'
            : 'border-yellow-500 bg-yellow-50'
          : ''
      }
      focus:ring-2 focus:ring-offset-2 outline-none
      disabled:opacity-50 disabled:cursor-not-allowed
      ${field.emergencyRelevant ? 'border-2 border-red-300' : ''}
    `;

      // Healthcare-specific ARIA attributes
      const healthcareAriaProps = {
        'data-medical-term': field.medicalTerminology?.term || undefined,
        'data-sensitivity-level': field.sensitivityLevel || undefined,
        'data-emergency-relevant': field.emergencyRelevant?.toString() || undefined,
        'data-lgpd-relevant': field.lgpdRelevant?.toString() || undefined,
        'data-anvisa-relevant': field.anvisaRelevant?.toString() || undefined,
        'data-audit-context': enableHealthcareAudit ? auditContext : undefined,
      };

      const inputProps = {
        ...fieldProps,
        ...healthcareAriaProps,
        value: formattedValue,
        onChange: (
          e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
          >,
        ) => {
          fieldProps.onChange(e as any);
        },
      };

      return (
        <div
          key={field.name}
          className='space-y-2'
          data-healthcare-field={field.name}
          data-field-sensitivity={field.sensitivityLevel}
        >
          <div className='flex items-center space-x-2'>
            <Label
              htmlFor={fieldProps.id}
              className={`
              block text-sm font-medium
              ${prefersHighContrast ? 'text-gray-900' : 'text-gray-700'}
              ${field.required ? 'after:content-["*"] after:text-red-500 after:ml-1' : ''}
            `}
            >
              {field.label}
              {field.required && (
                <span className='sr-only'>
                  {ACCESSIBILITY_LABELS_PT_BR.required}
                </span>
              )}
            </Label>

            {/* Sensitivity Indicators */}
            <div className='flex items-center space-x-1'>
              {field.sensitivityLevel === 'critical' && (
                <div
                  className='w-2 h-2 rounded-full bg-red-500'
                  aria-hidden='true'
                  title='Dados críticos'
                />
              )}
              {field.emergencyRelevant && (
                <AlertTriangle
                  className='w-4 h-4 text-red-500'
                  aria-hidden='true'
                />
              )}
              {field.lgpdRelevant && (
                <Shield
                  className='w-4 h-4 text-blue-500'
                  aria-hidden='true'
                />
              )}
            </div>
          </div>

          {field.description && (
            <p
              {...descriptionProps}
              className={`text-sm ${prefersHighContrast ? 'text-gray-800' : 'text-gray-600'}`}
            >
              <Info className='w-4 h-4 inline mr-1' aria-hidden='true' />
              {field.description}
            </p>
          )}

          {/* Input field based on type */}
          {field.type === 'textarea'
            ? (
              <Textarea
                {...inputProps}
                placeholder={field.placeholder}
                className={baseInputClasses}
                rows={4}
              />
            )
            : field.type === 'select'
            ? (
              <Select
                value={fieldHook.value}
                onValueChange={value => fieldHook.setValue(value)}
              >
                <SelectTrigger className={baseInputClasses}>
                  <SelectValue
                    placeholder={field.placeholder || 'Selecione uma opção'}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=''>Selecione uma opção</SelectItem>
                  {field.options?.map(option => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      title={option.description}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )
            : field.type === 'medical-code'
            ? (
              <div className='relative'>
                <Input
                  {...inputProps}
                  type='text'
                  placeholder={field.placeholder}
                  className={`${baseInputClasses} pr-10`}
                />
                <div className='absolute right-3 top-1/2 transform -translate-y-1/2'>
                  <Info className='w-4 h-4 text-gray-400' aria-hidden='true' />
                </div>
              </div>
            )
            : (
              <Input
                {...inputProps}
                type={field.type}
                placeholder={field.placeholder}
                className={baseInputClasses}
              />
            )}

          {/* Medical terminology help */}
          {renderMedicalTerminologyHelp(field)}

          {/* Error message */}
          {fieldHook.error && errorProps && (
            <div
              {...errorProps}
              className={`
              flex items-center space-x-2 text-sm
              ${prefersHighContrast ? 'text-red-900' : 'text-red-600'}
            `}
            >
              <AlertCircle
                className='w-4 h-4 flex-shrink-0'
                aria-hidden='true'
              />
              <span>{fieldHook.error}</span>
            </div>
          )}

          {/* Warning message */}
          {validationWarnings[field.name] && (
            <div
              role='alert'
              className={`
              flex items-center space-x-2 text-sm
              ${prefersHighContrast ? 'text-yellow-900' : 'text-yellow-700'}
            `}
            >
              <AlertTriangle
                className='w-4 h-4 flex-shrink-0'
                aria-hidden='true'
              />
              <span>{validationWarnings[field.name]}</span>
            </div>
          )}
        </div>
      );
    },
    [
      fieldHooks,
      prefersHighContrast,
      validationWarnings,
      enableHealthcareAudit,
      auditContext,
      formatFieldValue,
      renderMedicalTerminologyHelp,
    ],
  );

  return (
    <Card
      className={`
        ${prefersHighContrast ? 'border-2 border-gray-900' : ''} 
        ${emergencyMode ? 'border-red-300 border-2' : ''}
        ${className}
      `}
      data-healthcare-form={auditContext}
      data-emergency-mode={emergencyMode}
      data-audit-enabled={enableHealthcareAudit}
    >
      <CardHeader>
        <CardTitle
          className={`${prefersHighContrast ? 'text-gray-900' : 'text-gray-900'}`}
          id='healthcare-form-title'
        >
          {title}
        </CardTitle>
        {description && (
          <p
            className={`text-sm ${prefersHighContrast ? 'text-gray-800' : 'text-gray-600'}`}
            id='healthcare-form-description'
          >
            {description}
          </p>
        )}
      </CardHeader>

      <CardContent>
        <form
          onSubmit={handleSubmit}
          noValidate
          aria-labelledby='healthcare-form-title'
          aria-describedby={description ? 'healthcare-form-description' : undefined}
        >
          <div className='space-y-6'>
            {fields.map(renderField)}

            {/* Submit Error */}
            {submitError && (
              <div
                role='alert'
                aria-live='assertive'
                className={`
                  flex items-center space-x-2 p-4 rounded-md
                  ${
                  prefersHighContrast
                    ? 'bg-red-100 border-2 border-red-900 text-red-900'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }
                `}
              >
                <AlertCircle
                  className='w-5 h-5 flex-shrink-0'
                  aria-hidden='true'
                />
                <span>{submitError}</span>
              </div>
            )}

            {/* Submit Success */}
            {submitSuccess && (
              <div
                role='status'
                aria-live='polite'
                className={`
                  flex items-center space-x-2 p-4 rounded-md
                  ${
                  prefersHighContrast
                    ? 'bg-green-100 border-2 border-green-900 text-green-900'
                    : 'bg-green-50 border border-green-200 text-green-700'
                }
                `}
              >
                <CheckCircle
                  className='w-5 h-5 flex-shrink-0'
                  aria-hidden='true'
                />
                <span>Formulário de saúde enviado com sucesso!</span>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type='submit'
              disabled={isSubmitting || isLoading}
              className={`
                w-full transition-all duration-200
                ${prefersReducedMotion ? '' : 'hover:scale-[1.02]'}
                ${prefersHighContrast ? 'border-2 border-gray-900' : ''}
                ${emergencyMode ? 'bg-red-600 hover:bg-red-700' : ''}
                focus:ring-2 focus:ring-offset-2 focus:ring-primary
              `}
              aria-describedby='healthcare-submit-status'
            >
              {isSubmitting
                ? (
                  <>
                    <div
                      className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'
                      aria-hidden='true'
                    />
                    Enviando...
                  </>
                )
                : submitLabel}
            </Button>

            {/* Submit Status for Screen Readers */}
            <div
              id='healthcare-submit-status'
              className='sr-only'
              aria-live='polite'
              aria-atomic='true'
            >
              {isSubmitting && 'Formulário de saúde sendo enviado'}
              {submitSuccess && 'Formulário de saúde enviado com sucesso'}
              {submitError
                && `Erro ao enviar formulário de saúde: ${submitError}`}
            </div>
          </div>
        </form>

        {/* Live Region for Dynamic Announcements */}
        <div {...liveRegionProps}>{liveMessage}</div>

        {/* Healthcare Audit Information */}
        {enableHealthcareAudit && (
          <div className='sr-only'>
            Auditoria de acessibilidade em saúde habilitada para contexto:{' '}
            {auditContext}. Formulário contém {fields.length} campos. Campos críticos:{' '}
            {fields.filter(f => f.sensitivityLevel === 'critical').length}. Campos relevantes para
            emergência: {fields.filter(f => f.emergencyRelevant).length}.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper functions for validation and formatting
function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  return phone;
}

function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  return cpf;
}

function formatDate(date: string): string {
  const cleaned = date.replace(/\D/g, '');
  if (cleaned.length === 8) {
    return cleaned.replace(/(\d{2})(\d{2})(\d{4})/, '$2/$1/$3');
  }
  return date;
}

function isValidCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '');
  return cleaned.length === 11;
}

function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 11 || cleaned.length === 10;
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

export default EnhancedHealthcareForm;

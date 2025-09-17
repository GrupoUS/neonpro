/**
 * Accessible Healthcare Form Component
 * T081 - WCAG 2.1 AA+ Accessibility Compliance
 *
 * Features:
 * - WCAG 2.1 AA+ compliant form elements
 * - Brazilian healthcare form validation
 * - Screen reader optimized error messages
 * - Keyboard navigation support
 * - LGPD compliant data collection
 * - Real-time validation feedback
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
  Textarea,
} from '@neonpro/ui';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import {
  useAccessibilityPreferences,
  useAccessibleField,
  useLiveRegion,
  useScreenReaderAnnouncement,
} from '../../hooks/useAccessibility';
import { ACCESSIBILITY_LABELS_PT_BR, createHealthcareFormAria } from '../../utils/accessibility';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select';
  required?: boolean;
  placeholder?: string;
  description?: string;
  options?: { value: string; label: string }[];
  validate?: (value: string) => string | null;
}

interface AccessibleHealthcareFormProps {
  title: string;
  description?: string;
  fields: FormField[];
  onSubmit: (data: Record<string, string>) => Promise<void>;
  submitLabel?: string;
  isLoading?: boolean;
  className?: string;
}

export function AccessibleHealthcareForm({
  title,
  description,
  fields,
  onSubmit,
  submitLabel = 'Enviar',
  isLoading = false,
  className,
}: AccessibleHealthcareFormProps) {
  const { prefersHighContrast, prefersReducedMotion } = useAccessibilityPreferences();
  const { announce, announceFormError, announceFormSuccess } = useScreenReaderAnnouncement();
  const { message: liveMessage, announce: announceLive, liveRegionProps } = useLiveRegion();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Create accessible field hooks for each form field
  const fieldHooks = fields.reduce((acc, field) => {
    acc[field.name] = useAccessibleField(field.name, {
      required: field.required,
      validate: field.validate,
    });
    return acc;
  }, {} as Record<string, ReturnType<typeof useAccessibleField>>);

  const validateForm = useCallback(() => {
    let isValid = true;
    const errors: string[] = [];

    fields.forEach(field => {
      const fieldHook = fieldHooks[field.name];
      const fieldIsValid = fieldHook.validateField();

      if (!fieldIsValid) {
        isValid = false;
        if (fieldHook.error) {
          errors.push(`${field.label}: ${fieldHook.error}`);
        }
      }
    });

    if (errors.length > 0) {
      announceFormError('formulário', `${errors.length} erros encontrados: ${errors.join(', ')}`);
      announceLive(
        `Formulário contém ${errors.length} erros. Corrija os campos destacados.`,
        'assertive',
      );
    }

    return isValid;
  }, [fields, fieldHooks, announceFormError, announceLive]);

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();

    if (isSubmitting || isLoading) return;

    setSubmitError(null);
    setSubmitSuccess(false);

    // Validate all fields
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    announceLive('Enviando formulário...', 'polite');

    try {
      // Collect form data
      const formData = fields.reduce((acc, field) => {
        acc[field.name] = fieldHooks[field.name].value;
        return acc;
      }, {} as Record<string, string>);

      await onSubmit(formData);

      setSubmitSuccess(true);
      announceFormSuccess('Formulário enviado com sucesso');
      announceLive('Formulário enviado com sucesso!', 'polite');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao enviar formulário';
      setSubmitError(errorMessage);
      announceFormError('envio', errorMessage);
      announceLive(`Erro ao enviar formulário: ${errorMessage}`, 'assertive');
    } finally {
      setIsSubmitting(false);
    }
  }, [
    isSubmitting,
    isLoading,
    validateForm,
    fields,
    fieldHooks,
    onSubmit,
    announceFormSuccess,
    announceFormError,
    announceLive,
  ]);

  const renderField = useCallback((field: FormField) => {
    const fieldHook = fieldHooks[field.name];
    const { fieldProps, errorProps, descriptionProps } = fieldHook;

    const baseInputClasses = `
      w-full transition-colors duration-200
      ${
      prefersHighContrast
        ? 'border-2 border-gray-900 focus:border-blue-900 focus:ring-blue-900'
        : 'border border-gray-300 focus:border-primary focus:ring-primary'
    }
      ${
      fieldHook.error
        ? (prefersHighContrast ? 'border-red-900 bg-red-50' : 'border-red-500 bg-red-50')
        : ''
    }
      focus:ring-2 focus:ring-offset-2 outline-none
      disabled:opacity-50 disabled:cursor-not-allowed
    `;

    return (
      <div key={field.name} className='space-y-2'>
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

        {field.description && (
          <p
            {...descriptionProps}
            className={`text-sm ${prefersHighContrast ? 'text-gray-800' : 'text-gray-600'}`}
          >
            <Info className='w-4 h-4 inline mr-1' aria-hidden='true' />
            {field.description}
          </p>
        )}

        {field.type === 'textarea'
          ? (
            <Textarea
              {...fieldProps}
              placeholder={field.placeholder}
              className={baseInputClasses}
              rows={4}
            />
          )
          : field.type === 'select'
          ? (
            <select
              {...fieldProps}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => fieldProps.onChange(e as any)}
              className={`${baseInputClasses} px-3 py-2 rounded-md`}
            >
              <option value=''>Selecione uma opção</option>
              {field.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )
          : (
            <Input
              {...fieldProps}
              type={field.type}
              placeholder={field.placeholder}
              className={baseInputClasses}
            />
          )}

        {fieldHook.error && errorProps && (
          <div
            {...errorProps}
            className={`
              flex items-center space-x-2 text-sm
              ${prefersHighContrast ? 'text-red-900' : 'text-red-600'}
            `}
          >
            <AlertCircle className='w-4 h-4 flex-shrink-0' aria-hidden='true' />
            <span>{fieldHook.error}</span>
          </div>
        )}
      </div>
    );
  }, [fieldHooks, prefersHighContrast]);

  return (
    <Card className={`${prefersHighContrast ? 'border-2 border-gray-900' : ''} ${className}`}>
      <CardHeader>
        <CardTitle
          className={`${prefersHighContrast ? 'text-gray-900' : 'text-gray-900'}`}
          id='form-title'
        >
          {title}
        </CardTitle>
        {description && (
          <p
            className={`text-sm ${prefersHighContrast ? 'text-gray-800' : 'text-gray-600'}`}
            id='form-description'
          >
            {description}
          </p>
        )}
      </CardHeader>

      <CardContent>
        <form
          onSubmit={handleSubmit}
          noValidate
          aria-labelledby='form-title'
          aria-describedby={description ? 'form-description' : undefined}
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
                <AlertCircle className='w-5 h-5 flex-shrink-0' aria-hidden='true' />
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
                <CheckCircle className='w-5 h-5 flex-shrink-0' aria-hidden='true' />
                <span>Formulário enviado com sucesso!</span>
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
                focus:ring-2 focus:ring-offset-2 focus:ring-primary
              `}
              aria-describedby='submit-status'
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
              id='submit-status'
              className='sr-only'
              aria-live='polite'
              aria-atomic='true'
            >
              {isSubmitting && 'Formulário sendo enviado'}
              {submitSuccess && 'Formulário enviado com sucesso'}
              {submitError && `Erro ao enviar formulário: ${submitError}`}
            </div>
          </div>
        </form>

        {/* Live Region for Dynamic Announcements */}
        <div {...liveRegionProps}>
          {liveMessage}
        </div>
      </CardContent>
    </Card>
  );
}

export default AccessibleHealthcareForm;

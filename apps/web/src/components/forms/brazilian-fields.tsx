/**
 * Brazilian Form Fields (T059)
 * Specialized form components for Brazilian data input
 *
 * Features:
 * - Integration with completed Brazilian validation schemas (T037)
 * - Real-time validation with Portuguese error messages
 * - Accessibility compliance with screen reader support
 * - Mobile-optimized input handling with proper keyboards
 * - Auto-formatting and masking for CPF, CEP, phone
 * - LGPD compliant data handling
 */

'use client';

import { MapPin } from 'lucide-react';
import { forwardRef, useCallback, useEffect, useState } from 'react';

import { Input } from '@/components/ui';
import {
  formatCEP,
  formatCNPJ,
  unformatCEP,
  unformatCNPJ,
  unformatCPF,
  unformatPhone,
} from '@/utils/brazilian-formatters';
import { validateCEP, validateCNPJ } from '@neonpro/shared/validators/brazilian';
import { cn } from '@neonpro/ui';
import { formatBRPhone, formatCPF, validateBRPhoneMask, validateCPFMask } from '@neonpro/utils';

export interface BrazilianFieldProps {
  /** Field label */
  label?: string;
  /** Field placeholder */
  placeholder?: string;
  /** Field value */
  value?: string;
  /** Change handler */
  onChange?: (value: string) => void;
  /** Blur handler */
  onBlur?: () => void;
  /** Error message */
  error?: string;
  /** Required field */
  required?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Field ID */
  id?: string;
  /** Field name */
  name?: string;
  /** CSS classes */
  className?: string;
  /** Test ID */
  testId?: string;
  /** Auto-complete attribute */
  autoComplete?: string;
}

/**
 * CPF Input Field
 * Formats and validates Brazilian CPF numbers
 */
export const CPFField = forwardRef<HTMLInputElement, BrazilianFieldProps>(_(
    {
      label = 'CPF',_placeholder = '000.000.000-00',_value = '',_onChange,_onBlur,_error,_required = false,_disabled = false,_id,_name = 'cpf',_className,_testId = 'cpf-field',_autoComplete = 'off',_},_ref,
  ) => {
    const [internalValue, setInternalValue] = useState(value);
    const [validationError, setValidationError] = useState<string>('');

    // Update internal value when prop changes
    useEffect(_() => {
      setInternalValue(value);
    }, [value]);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        const unformatted = unformatCPF(rawValue);

        // Limit to 11 digits
        if (unformatted.length <= 11) {
          const formatted = formatCPF(unformatted);
          setInternalValue(formatted);
          onChange?.(unformatted);
        }
      },
      [onChange],
    );

    const handleBlur = useCallback(_() => {
      const unformatted = unformatCPF(internalValue);

      if (unformatted && !validateCPFMask(unformatted)) {
        setValidationError('CPF inválido');
      } else {
        setValidationError('');
      }

      onBlur?.();
    }, [internalValue, onBlur]);

    const displayError = error || validationError;

    return (
      <div className={cn('space-y-2', className)}>
        {label && (
          <Label htmlFor={id} className='text-sm font-medium'>
            {label}
            {required && <span className='text-destructive ml-1'>*</span>}
          </Label>
        )}
        <div className='relative'>
          <User className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            ref={ref}
            id={id}
            name={name}
            type='text'
            inputMode='numeric'
            placeholder={placeholder}
            value={internalValue}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled}
            required={required}
            autoComplete={autoComplete}
            className={cn(
              'pl-10',
              displayError
                && 'border-destructive focus-visible:ring-destructive',
            )}
            data-testid={testId}
            aria-invalid={!!displayError}
            aria-describedby={displayError ? `${id}-error` : undefined}
          />
        </div>
        {displayError && (
          <p
            id={`${id}-error`}
            className='text-sm text-destructive'
            role='alert'
            aria-live='polite'
          >
            {displayError}
          </p>
        )}
      </div>
    );
  },
);

CPFField.displayName = 'CPFField';

/**
 * CNPJ Input Field
 * Formats and validates Brazilian CNPJ numbers
 */
export const CNPJField = forwardRef<HTMLInputElement, BrazilianFieldProps>(_(
    {
      label = 'CNPJ',_placeholder = '00.000.000/0000-00',_value = '',_onChange,_onBlur,_error,_required = false,_disabled = false,_id,_name = 'cnpj',_className,_testId = 'cnpj-field',_autoComplete = 'off',_},_ref,
  ) => {
    const [internalValue, setInternalValue] = useState(value);
    const [validationError, setValidationError] = useState<string>('');

    useEffect(_() => {
      setInternalValue(value);
    }, [value]);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        const unformatted = unformatCNPJ(rawValue);

        // Limit to 14 digits
        if (unformatted.length <= 14) {
          const formatted = formatCNPJ(unformatted);
          setInternalValue(formatted);
          onChange?.(unformatted);
        }
      },
      [onChange],
    );

    const handleBlur = useCallback(_() => {
      const unformatted = unformatCNPJ(internalValue);

      if (unformatted && !validateCNPJ(unformatted)) {
        setValidationError('CNPJ inválido');
      } else {
        setValidationError('');
      }

      onBlur?.();
    }, [internalValue, onBlur]);

    const displayError = error || validationError;

    return (
      <div className={cn('space-y-2', className)}>
        {label && (
          <Label htmlFor={id} className='text-sm font-medium'>
            {label}
            {required && <span className='text-destructive ml-1'>*</span>}
          </Label>
        )}
        <div className='relative'>
          <User className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            ref={ref}
            id={id}
            name={name}
            type='text'
            inputMode='numeric'
            placeholder={placeholder}
            value={internalValue}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled}
            required={required}
            autoComplete={autoComplete}
            className={cn(
              'pl-10',
              displayError
                && 'border-destructive focus-visible:ring-destructive',
            )}
            data-testid={testId}
            aria-invalid={!!displayError}
            aria-describedby={displayError ? `${id}-error` : undefined}
          />
        </div>
        {displayError && (
          <p
            id={`${id}-error`}
            className='text-sm text-destructive'
            role='alert'
            aria-live='polite'
          >
            {displayError}
          </p>
        )}
      </div>
    );
  },
);

CNPJField.displayName = 'CNPJField';

/**
 * Phone Input Field
 * Formats and validates Brazilian phone numbers
 */
export const PhoneField = forwardRef<HTMLInputElement, BrazilianFieldProps>(
  (
    {
      label = 'Telefone',
      placeholder = '(00) 00000-0000',
      value = '',
      onChange,
      onBlur,
      error,
      required = false,
      disabled = false,
      id,
      name = 'phone',
      className,
      testId = 'phone-field',
      autoComplete = 'tel',
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = useState(value);
    const [validationError, setValidationError] = useState<string>('');

    useEffect(_() => {
      setInternalValue(value);
    }, [value]);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        const unformatted = unformatPhone(rawValue);

        // Limit to 11 digits
        if (unformatted.length <= 11) {
          const formatted = formatBRPhone(unformatted);
          setInternalValue(formatted);
          onChange?.(unformatted);
        }
      },
      [onChange],
    );

    const handleBlur = useCallback(_() => {
      const unformatted = unformatPhone(internalValue);

      if (unformatted && !validateBRPhoneMask(unformatted)) {
        setValidationError('Telefone inválido');
      } else {
        setValidationError('');
      }

      onBlur?.();
    }, [internalValue, onBlur]);

    const displayError = error || validationError;

    return (
      <div className={cn('space-y-2', className)}>
        {label && (
          <Label htmlFor={id} className='text-sm font-medium'>
            {label}
            {required && <span className='text-destructive ml-1'>*</span>}
          </Label>
        )}
        <div className='relative'>
          <Phone className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            ref={ref}
            id={id}
            name={name}
            type='tel'
            inputMode='numeric'
            placeholder={placeholder}
            value={internalValue}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled}
            required={required}
            autoComplete={autoComplete}
            className={cn(
              'pl-10',
              displayError
                && 'border-destructive focus-visible:ring-destructive',
            )}
            data-testid={testId}
            aria-invalid={!!displayError}
            aria-describedby={displayError ? `${id}-error` : undefined}
          />
        </div>
        {displayError && (
          <p
            id={`${id}-error`}
            className='text-sm text-destructive'
            role='alert'
            aria-live='polite'
          >
            {displayError}
          </p>
        )}
      </div>
    );
  },
);

PhoneField.displayName = 'PhoneField';

/**
 * CEP Input Field
 * Formats and validates Brazilian postal codes
 */
export const CEPField = forwardRef<
  HTMLInputElement,
  BrazilianFieldProps & {
    /** Auto-fill address callback */
    onAddressFound?: (address: any) => void;
  }
>(_(
    {
      label = 'CEP',_placeholder = '00000-000',_value = '',_onChange,_onBlur,_error,_required = false,_disabled = false,_id,_name = 'cep',_className,_testId = 'cep-field',_autoComplete = 'postal-code',_onAddressFound,_},_ref,
  ) => {
    const [internalValue, setInternalValue] = useState(value);
    const [validationError, setValidationError] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(_() => {
      setInternalValue(value);
    }, [value]);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        const unformatted = unformatCEP(rawValue);

        // Limit to 8 digits
        if (unformatted.length <= 8) {
          const formatted = formatCEP(unformatted);
          setInternalValue(formatted);
          onChange?.(unformatted);
        }
      },
      [onChange],
    );

    const handleBlur = useCallback(_async () => {
      const unformatted = unformatCEP(internalValue);

      if (unformatted && !validateCEP(unformatted)) {
        setValidationError('CEP inválido');
      } else {
        setValidationError('');

        // Auto-fill address if CEP is valid and callback is provided
        if (unformatted.length === 8 && onAddressFound) {
          setIsLoading(true);
          try {
            const response = await fetch(
              `https://viacep.com.br/ws/${unformatted}/json/`,
            );
            const data = await response.json();

            if (!data.erro) {
              onAddressFound({
                street: data.logradouro,
                neighborhood: data.bairro,
                city: data.localidade,
                state: data.uf,
                cep: unformatted,
              });
            }
          } catch (_error) {
            console.warn('Erro ao buscar endereço:', error);
          } finally {
            setIsLoading(false);
          }
        }
      }

      onBlur?.();
    }, [internalValue, onBlur, onAddressFound]);

    const displayError = error || validationError;

    return (
      <div className={cn('space-y-2', className)}>
        {label && (
          <Label htmlFor={id} className='text-sm font-medium'>
            {label}
            {required && <span className='text-destructive ml-1'>*</span>}
          </Label>
        )}
        <div className='relative'>
          <MapPin className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            ref={ref}
            id={id}
            name={name}
            type='text'
            inputMode='numeric'
            placeholder={placeholder}
            value={internalValue}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled || isLoading}
            required={required}
            autoComplete={autoComplete}
            className={cn(
              'pl-10',
              displayError
                && 'border-destructive focus-visible:ring-destructive',
            )}
            data-testid={testId}
            aria-invalid={!!displayError}
            aria-describedby={displayError ? `${id}-error` : undefined}
          />
          {isLoading && (
            <div className='absolute right-3 top-1/2 transform -translate-y-1/2'>
              <div className='animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full' />
            </div>
          )}
        </div>
        {displayError && (
          <p
            id={`${id}-error`}
            className='text-sm text-destructive'
            role='alert'
            aria-live='polite'
          >
            {displayError}
          </p>
        )}
      </div>
    );
  },
);

CEPField.displayName = 'CEPField';

// Default export for lazy loading
const BrazilianFields = {
  CPFField,
  CNPJField,
  PhoneField,
  CEPField,
};

export default BrazilianFields;

'use client';

import { useKeyboardNavigation } from '@/hooks/accessibility/use-focus-management';
import { useMobileOptimization } from '@/hooks/accessibility/use-mobile-optimization';
import { cn } from '@/lib/utils';
import React from 'react';

export interface HealthcareInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Input label for accessibility */
  label?: string;
  /** Error message */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Required field indicator */
  required?: boolean;
  /** Mobile optimization */
  mobileOptimized?: boolean;
  /** Healthcare context */
  healthcareContext?: string;
  /** Brazilian formatting */
  brazilianFormat?: 'cpf' | 'cnpj' | 'phone' | 'cep' | 'date' | 'currency';
  /** Validation pattern */
  validationPattern?: RegExp;
  /** Real-time validation */
  validateOnChange?: boolean;
  /** Character limit */
  maxLength?: number;
  /** Show character count */
  showCharCount?: boolean;
  /** Password visibility toggle */
  isPassword?: boolean;
  /** Accessibility description */
  ariaDescription?: string;
  /** Input action for screen readers */
  accessibilityAction?: 'type' | 'enter' | 'select';
  /** Keyboard shortcut */
  keyboardShortcut?: string;
}

/**
 * HealthcareInput - WCAG 2.1 AA+ compliant input component
 * Designed for healthcare applications with Brazilian formatting and accessibility
 */
const HealthcareInput = React.forwardRef<HTMLInputElement, HealthcareInputProps>(_({
    className,_type = 'text',_label,_error,_helperText,_required = false,_mobileOptimized = true,_healthcareContext,_brazilianFormat,_validationPattern,_validateOnChange = false,_maxLength,_showCharCount = false,_isPassword = false,_ariaDescription,_accessibilityAction = 'type',_keyboardShortcut,_value,_onChange,_onBlur,_...props
  },_ref) => {
    const { isMobile } = useMobileOptimization();
    const [showPassword, setShowPassword] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState(value || '');
    const [validationError, setValidationError] = React.useState<string | null>(null);

    const inputId = React.useId();
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;
    const descriptionId = ariaDescription ? `${inputId}-description` : undefined;
    const charCountId = showCharCount ? `${inputId}-charcount` : undefined;

    // Brazilian formatting functions
    const formatBrazilianValue = React.useCallback(
      (value: string, format: HealthcareInputProps['brazilianFormat']) => {
        if (!format) return value;

        const cleanValue = value.replace(/\D/g, '');

        switch (format) {
          case 'cpf':
            return cleanValue
              .replace(/(\d{3})(\d)/, '$1.$2')
              .replace(/(\d{3})(\d)/, '$1.$2')
              .replace(/(\d{3})(\d{1,2})/, '$1-$2')
              .replace(/(-\d{2})\d+?$/, '$1');

          case 'cnpj':
            return cleanValue
              .replace(/(\d{2})(\d)/, '$1.$2')
              .replace(/(\d{3})(\d)/, '$1.$2')
              .replace(/(\d{3})(\d)/, '$1/$2')
              .replace(/(\d{4})(\d{1,2})/, '$1-$2')
              .replace(/(-\d{2})\d+?$/, '$1');

          case 'phone':
            return cleanValue
              .replace(/(\d{2})(\d)/, '($1) $2')
              .replace(/(\d{4})(\d)/, '$1-$2')
              .replace(/(-\d{4})\d+?$/, '$1');

          case 'cep':
            return cleanValue.replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{3})\d+?$/, '$1');

          case 'date':
            if (cleanValue.length <= 2) return cleanValue;
            if (cleanValue.length <= 4) return cleanValue.replace(/(\d{2})(\d)/, '$1/$2');
            return cleanValue.replace(/(\d{2})(\d{2})(\d)/, '$1/$2/$3').replace(
              /(\/\d{4})\d+?$/,
              '$1',
            );

          case 'currency':
            const numberValue = parseFloat(cleanValue) / 100;
            return new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(isNaN(numberValue) ? 0 : numberValue);

          default:
            return value;
        }
      },
      [],
    );

    // Validation function
    const validateValue = React.useCallback(
      (value: string) => {
        if (required && !value.trim()) {
          return 'Este campo é obrigatório';
        }

        if (validationPattern && value && !validationPattern.test(value)) {
          return 'Formato inválido';
        }

        if (maxLength && value.length > maxLength) {
          return `Máximo de ${maxLength} caracteres`;
        }

        return null;
      },
      [required, validationPattern, maxLength],
    );

    // Handle input change
    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        let newValue = e.target.value;

        // Apply Brazilian formatting
        if (brazilianFormat) {
          newValue = formatBrazilianValue(newValue, brazilianFormat);
        }

        setInternalValue(newValue);

        // Validate if enabled
        if (validateOnChange) {
          const error = validateValue(newValue);
          setValidationError(error);
        }

        // Call original onChange
        if (onChange) {
          const syntheticEvent = {
            ...e,
            target: {
              ...e.target,
              value: newValue,
            },
          };
          onChange(syntheticEvent);
        }
      },
      [brazilianFormat, formatBrazilianValue, validateOnChange, validateValue, onChange],
    );

    // Handle blur for validation
    const handleBlur = React.useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        const error = validateValue(internalValue);
        setValidationError(error);
        onBlur?.(e);
      },
      [internalValue, validateValue, onBlur],
    );

    // Handle keyboard navigation
    const handleKeyDown = useKeyboardNavigation(
      undefined, // Enter handled by form
      undefined, // Space handled by form
      undefined, // Escape handled by parent
    );

    // Determine input type
    const inputType = React.useMemo(_() => {
      if (isPassword && !showPassword) return 'password';
      if (isPassword && showPassword) return 'text';
      return type;
    }, [isPassword, showPassword, type]);

    // Get character count
    const charCount = React.useMemo(_() => {
      return internalValue.length;
    }, [internalValue]);

    // Check if character count is near limit
    const isCharCountWarning = React.useMemo(_() => {
      if (!maxLength) return false;
      return charCount >= maxLength * 0.9;
    }, [charCount, maxLength]);

    // Generate accessibility attributes
    const accessibilityProps = React.useMemo(_() => {
      const props: Record<string, string> = {};

      if (required) {
        props['aria-required'] = 'true';
      }

      if (error || validationError) {
        props['aria-invalid'] = 'true';
        props['aria-describedby'] = errorId;
      }

      if (helperText && !error && !validationError) {
        props['aria-describedby'] = helperId;
      }

      if (ariaDescription) {
        props['aria-description'] = ariaDescription;
      }

      if (healthcareContext) {
        props['data-healthcare-context'] = healthcareContext;
      }

      if (keyboardShortcut) {
        props['data-keyboard-shortcut'] = keyboardShortcut;
      }

      if (accessibilityAction) {
        props['data-action'] = accessibilityAction;
      }

      return props;
    }, [
      required,
      error,
      validationError,
      helperText,
      ariaDescription,
      healthcareContext,
      keyboardShortcut,
      accessibilityAction,
      errorId,
      helperId,
    ]);

    return (
      <div className={cn('space-y-2', className)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
              error || validationError ? 'text-destructive' : 'text-foreground',
            )}
          >
            {label}
            {required && <span className='text-destructive ml-1'>*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className='relative'>
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            value={internalValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={cn(
              'border-input file:text-foreground placeholder:text-muted-foreground/70 flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
              'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
              'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
              // Mobile optimization
              mobileOptimized && isMobile && 'h-10 text-base',
              // Error state
              (error || validationError) && 'border-destructive focus-visible:ring-destructive/20',
              // Healthcare context styling
              healthcareContext && 'border-blue-200 focus-visible:border-blue-400',
            )}
            {...accessibilityProps}
            {...props}
          />

          {/* Password Toggle */}
          {isPassword && (_<button
              type='button'
              onClick={() => setShowPassword(!showPassword)}
              className='absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring rounded-sm p-1'
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              aria-pressed={showPassword}
            >
              {showPassword
                ? (
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='16'
                    height='16'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <path d='M9.88 9.88a3 3 0 1 0 4.24 4.24' />
                    <path d='M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 11 8 11 8a18.45 18.45 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 0 1-4.24-4.24' />
                    <line x1='1' y1='1' x2='23' y2='23' />
                  </svg>
                )
                : (
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='16'
                    height='16'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <path d='M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z' />
                    <circle cx='12' cy='12' r='3' />
                  </svg>
                )}
            </button>
          )}
        </div>

        {/* Helper Text */}
        {helperText && !error && !validationError && (
          <p
            id={helperId}
            className='text-xs text-muted-foreground'
          >
            {helperText}
          </p>
        )}

        {/* Error Message */}
        {(error || validationError) && (
          <p
            id={errorId}
            className='text-xs text-destructive font-medium'
            role='alert'
            aria-live='polite'
          >
            {error || validationError}
          </p>
        )}

        {/* Character Count */}
        {showCharCount && maxLength && (
          <div
            id={charCountId}
            className={cn(
              'text-xs',
              isCharCountWarning ? 'text-yellow-600' : 'text-muted-foreground',
            )}
          >
            {charCount}/{maxLength}
          </div>
        )}

        {/* Accessibility Description */}
        {ariaDescription && (
          <div
            id={descriptionId}
            className='sr-only'
          >
            {ariaDescription}
          </div>
        )}
      </div>
    );
  },
);

HealthcareInput.displayName = 'HealthcareInput';

export { HealthcareInput };

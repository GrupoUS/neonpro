import { cva, type VariantProps } from 'class-variance-authority';
import { AlertCircle, Check, Eye, EyeOff, X } from 'lucide-react';
import type * as React from 'react';
import { forwardRef, useCallback, useState } from 'react';
import { cn } from '../../lib/utils';

const inputVariants = cva(
  'flex w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background transition-all duration-200 file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-input',
        medical:
          'border-primary/30 bg-blue-50/30 focus-visible:ring-primary/30 dark:bg-blue-950/10',
        sensitive:
          'border-orange-300 bg-orange-50/30 focus-visible:ring-orange-500/30 dark:bg-orange-950/10',
        critical:
          'border-red-300 bg-red-50/30 focus-visible:ring-red-500/30 dark:bg-red-950/10',
        success:
          'border-green-300 bg-green-50/30 focus-visible:ring-green-500/30 dark:bg-green-950/10',
      },
      inputSize: {
        default: 'h-10',
        sm: 'h-8 text-xs',
        lg: 'h-12',
      },
      validation: {
        none: '',
        valid: 'border-green-500 focus-visible:ring-green-500/30',
        invalid: 'border-red-500 focus-visible:ring-red-500/30',
        warning: 'border-orange-500 focus-visible:ring-orange-500/30',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'default',
      validation: 'none',
    },
  }
);

// Healthcare-specific input masks and validators
const healthcareMasks = {
  cpf: (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  },
  cns: (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4');
  },
  phone: (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4,5})(\d{4})$/, '$1-$2');
  },
  cep: (value: string) => {
    return value.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2');
  },
  date: (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1/$2')
      .replace(/(\d{2})(\d)/, '$1/$2')
      .replace(/(\d{4})\d+?$/, '$1');
  },
  time: (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1:$2')
      .replace(/(\d{2}:\d{2})\d+?$/, '$1');
  },
};

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  // Healthcare-specific props
  medicalType?:
    | 'cpf'
    | 'cns'
    | 'phone'
    | 'cep'
    | 'date'
    | 'time'
    | 'weight'
    | 'height'
    | 'temperature'
    | 'pressure';
  sensitiveData?: boolean;
  lgpdCompliant?: boolean;
  showValidation?: boolean;
  validationMessage?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  onValidation?: (isValid: boolean, message?: string) => void;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant = 'default',
      inputSize = 'default',
      validation = 'none',
      type = 'text',
      medicalType,
      sensitiveData = false,
      lgpdCompliant = true,
      showValidation = false,
      validationMessage,
      leftIcon,
      rightIcon,
      loading = false,
      onValidation,
      onChange,
      value,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [internalValue, setInternalValue] = useState(value || '');

    // Determine validation state
    const getValidationState = useCallback(
      (val: string) => {
        if (!(showValidation && val)) return 'none';

        // Basic validation patterns for healthcare data
        const validationPatterns = {
          cpf: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
          cns: /^\d{3} \d{4} \d{4} \d{4}$/,
          phone: /^\(\d{2}\) \d{4,5}-\d{4}$/,
          cep: /^\d{5}-\d{3}$/,
          date: /^\d{2}\/\d{2}\/\d{4}$/,
          time: /^\d{2}:\d{2}$/,
          email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        };

        if (medicalType && validationPatterns[medicalType]) {
          return validationPatterns[medicalType].test(val)
            ? 'valid'
            : 'invalid';
        }

        if (type === 'email') {
          return validationPatterns.email.test(val) ? 'valid' : 'invalid';
        }

        return val.length > 0 ? 'valid' : 'invalid';
      },
      [medicalType, type, showValidation]
    );

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        let newValue = e.target.value;

        // Apply healthcare masks
        if (medicalType && healthcareMasks[medicalType]) {
          newValue = healthcareMasks[medicalType](newValue);
        }

        setInternalValue(newValue);

        // Update validation
        if (showValidation && onValidation) {
          const validationState = getValidationState(newValue);
          onValidation(validationState === 'valid', validationMessage);
        }

        // Call original onChange with masked value
        const syntheticEvent = {
          ...e,
          target: { ...e.target, value: newValue },
        };
        onChange?.(syntheticEvent);
      },
      [
        medicalType,
        showValidation,
        onValidation,
        validationMessage,
        getValidationState,
        onChange,
      ]
    );

    // Determine final validation state
    const finalValidation = showValidation
      ? getValidationState(String(value || internalValue))
      : validation;

    // Auto-set variant based on medical type
    const finalVariant = medicalType
      ? sensitiveData
        ? 'sensitive'
        : 'medical'
      : variant;

    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    const ValidationIcon = () => {
      if (loading) {
        return (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        );
      }

      switch (finalValidation) {
        case 'valid':
          return <Check className="h-4 w-4 text-green-500" />;
        case 'invalid':
          return <X className="h-4 w-4 text-red-500" />;
        case 'warning':
          return <AlertCircle className="h-4 w-4 text-orange-500" />;
        default:
          return null;
      }
    };

    return (
      <div className="relative w-full">
        {leftIcon && (
          <div className="-translate-y-1/2 absolute top-1/2 left-3 text-muted-foreground">
            {leftIcon}
          </div>
        )}

        <input
          aria-describedby={
            validationMessage ? `${props.id}-validation` : undefined
          }
          aria-invalid={finalValidation === 'invalid'}
          className={cn(
            inputVariants({
              variant: finalVariant,
              inputSize,
              validation: finalValidation,
            }),
            leftIcon && 'pl-10',
            (rightIcon || isPassword || showValidation) && 'pr-10',
            sensitiveData && 'font-mono tracking-wider',
            lgpdCompliant && 'data-[lgpd=true]:bg-green-50/20',
            className
          )}
          data-lgpd={lgpdCompliant}
          data-medical-type={medicalType}
          data-sensitive={sensitiveData}
          data-validation={finalValidation}
          onChange={handleChange}
          ref={ref}
          type={inputType}
          value={value || internalValue}
          {...props}
        />

        <div className="-translate-y-1/2 absolute top-1/2 right-3 flex items-center gap-1">
          {showValidation && <ValidationIcon />}

          {isPassword && (
            <button
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setShowPassword(!showPassword)}
              type="button"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}

          {rightIcon && !isPassword && !showValidation && (
            <div className="text-muted-foreground">{rightIcon}</div>
          )}
        </div>

        {validationMessage && finalValidation === 'invalid' && (
          <p
            className="mt-1 flex items-center gap-1 text-red-500 text-sm"
            id={`${props.id}-validation`}
            role="alert"
          >
            <AlertCircle className="h-3 w-3" />
            {validationMessage}
          </p>
        )}

        {sensitiveData && lgpdCompliant && (
          <p className="mt-1 flex items-center gap-1 text-muted-foreground text-xs">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            Dados protegidos pela LGPD
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants, healthcareMasks, type InputProps };

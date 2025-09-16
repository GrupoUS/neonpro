/**
 * Healthcare Text Field Component
 * 
 * Enhanced text input with healthcare-specific validation, accessibility features,
 * medical data handling, and LGPD compliance built-in.
 * 
 * @fileoverview Healthcare text field with React Aria integration
 */

'use client';

import React, { 
  InputHTMLAttributes, 
  forwardRef, 
  useId, 
  useState, 
  useEffect,
  useRef
} from 'react';
import { z } from 'zod';
import { cn } from '../../lib/utils';
import { useHealthcareForm } from './healthcare-form';
import { useHealthcareTheme } from '../healthcare/healthcare-theme-provider';
import { 
  healthcareValidationSchemas,
  DataSensitivity,
  classifyHealthcareData,
  healthcareValidationMessages 
} from '../../utils/healthcare-validation';
import { 
  announceToScreenReader,
  HealthcarePriority,
  useHealthcareFocus,
  generateAccessibleId,
  validateAccessibilityRequirements 
} from '../../utils/accessibility';

// Healthcare field types for automatic validation
export type HealthcareFieldType = 
  | 'cpf'
  | 'crm' 
  | 'phone'
  | 'medical-record'
  | 'date-of-birth'
  | 'medical-specialty'
  | 'patient-name'
  | 'email'
  | 'generic';

// Healthcare text field props
export interface HealthcareTextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'onBlur'> {
  // Basic field properties
  name: string;
  label: string;
  
  // Healthcare-specific
  fieldType?: HealthcareFieldType;
  dataSensitivity?: DataSensitivity;
  emergencyField?: boolean;
  
  // Validation
  validationSchema?: z.ZodSchema;
  customValidation?: (value: string) => string | null;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  
  // UI and UX
  description?: string;
  placeholder?: string;
  helperText?: string;
  mask?: string; // Input mask (e.g., "000.000.000-00" for CPF)
  
  // Event handlers
  onChange?: (value: string, isValid: boolean) => void;
  onBlur?: (value: string, isValid: boolean) => void;
  onValidationChange?: (errors: string[]) => void;
  
  // Accessibility
  screenReaderDescription?: string;
  autoFocusOnError?: boolean;
  
  // Styling
  variant?: 'default' | 'emergency' | 'sensitive';
  size?: 'sm' | 'default' | 'lg';
  
  className?: string;
}

/**
 * Healthcare Text Field Component
 * 
 * Provides an accessible, validated text input specifically designed
 * for healthcare data entry with LGPD compliance and medical validation.
 */
export const HealthcareTextField = forwardRef<HTMLInputElement, HealthcareTextFieldProps>(({
  name,
  label,
  fieldType = 'generic',
  dataSensitivity,
  emergencyField = false,
  validationSchema,
  customValidation,
  validateOnChange = true,
  validateOnBlur = true,
  description,
  placeholder,
  helperText,
  mask,
  onChange,
  onBlur,
  onValidationChange,
  screenReaderDescription,
  autoFocusOnError = true,
  variant = 'default',
  size = 'default',
  className,
  required = false,
  disabled = false,
  value,
  defaultValue,
  ...props
}, ref) => {
  // Context and theme
  const formContext = useHealthcareForm();
  const { theme, accessibility } = useHealthcareTheme();
  
  // Local state
  const [internalValue, setInternalValue] = useState<string>(
    (value ?? defaultValue ?? '') as string
  );
  const [isFocused, setIsFocused] = useState(false);
  const [hasBeenBlurred, setHasBeenBlurred] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  
  // Merge refs
  const mergedRef = (node: HTMLInputElement) => {
    inputRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };
  
  // Auto-determine data sensitivity if not provided
  const effectiveDataSensitivity = dataSensitivity ?? classifyHealthcareData(fieldType);
  
  // Generate IDs
  const fieldId = useId();
  const descriptionId = description ? `${fieldId}-description` : undefined;
  const errorId = validationErrors.length > 0 ? `${fieldId}-error` : undefined;
  
  // Get validation schema based on field type
  const getValidationSchema = (): z.ZodSchema | null => {
    if (validationSchema) return validationSchema;
    
    const schemas = healthcareValidationSchemas;
    switch (fieldType) {
      case 'cpf': return schemas.cpf;
      case 'crm': return schemas.crm;
      case 'phone': return schemas.phoneNumber;
      case 'medical-record': return schemas.medicalRecordNumber;
      case 'date-of-birth': return schemas.dateOfBirth;
      case 'medical-specialty': return schemas.medicalSpecialty;
      default: return null;
    }
  };
  
  // Validate field value
  const validateField = (valueToValidate: string): string[] => {
    const errors: string[] = [];
    
    // Required validation
    if (required && !valueToValidate.trim()) {
      errors.push(healthcareValidationMessages.required);
    }
    
    // Skip other validations if empty and not required
    if (!valueToValidate.trim() && !required) {
      return errors;
    }
    
    // Schema validation
    const schema = getValidationSchema();
    if (schema) {
      try {
        schema.parse(valueToValidate);
      } catch (validationError) {
        if (validationError instanceof z.ZodError) {
          errors.push(...validationError.errors.map(err => err.message));
        }
      }
    }
    
    // Custom validation
    if (customValidation) {
      const customError = customValidation(valueToValidate);
      if (customError) {
        errors.push(customError);
      }
    }
    
    return errors;
  };
  
  // Handle value change
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setInternalValue(newValue);
    
    // Apply mask if provided
    let maskedValue = newValue;
    if (mask) {
      maskedValue = applyMask(newValue, mask);
      if (maskedValue !== newValue) {
        event.target.value = maskedValue;
        setInternalValue(maskedValue);
      }
    }
    
    // Validate on change if enabled
    if (validateOnChange) {
      const errors = validateField(maskedValue);
      setValidationErrors(errors);
      
      // Update form context
      if (errors.length > 0) {
        formContext.setFieldError(name, errors);
      } else {
        formContext.clearFieldError(name);
      }
      
      onValidationChange?.(errors);
    }
    
    // Notify parent
    onChange?.(maskedValue, validationErrors.length === 0);
  };
  
  // Handle blur
  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const currentValue = event.target.value;
    setIsFocused(false);
    setHasBeenBlurred(true);
    
    // Validate on blur if enabled
    if (validateOnBlur) {
      const errors = validateField(currentValue);
      setValidationErrors(errors);
      
      // Update form context
      if (errors.length > 0) {
        formContext.setFieldError(name, errors);
      } else {
        formContext.clearFieldError(name);
      }
      
      onValidationChange?.(errors);
      
      // Announce errors to screen readers
      if (errors.length > 0) {
        const priority = emergencyField ? HealthcarePriority.HIGH : HealthcarePriority.MEDIUM;
        announceToScreenReader(
          `Campo ${label}: ${errors.join('. ')}`,
          priority
        );
      }
    }
    
    // Notify parent
    onBlur?.(currentValue, validationErrors.length === 0);
  };
  
  // Handle focus
  const handleFocus = () => {
    setIsFocused(true);
  };
  
  // Apply input mask
  const applyMask = (value: string, maskPattern: string): string => {
    const cleanValue = value.replace(/\D/g, '');
    let masked = '';
    let valueIndex = 0;
    
    for (let i = 0; i < maskPattern.length && valueIndex < cleanValue.length; i++) {
      if (maskPattern[i] === '0') {
        masked += cleanValue[valueIndex];
        valueIndex++;
      } else {
        masked += maskPattern[i];
      }
    }
    
    return masked;
  };
  
  // Focus on error if needed
  useEffect(() => {
    if (autoFocusOnError && validationErrors.length > 0 && hasBeenBlurred) {
      inputRef.current?.focus();
    }
  }, [validationErrors, autoFocusOnError, hasBeenBlurred]);
  
  // Validate accessibility on mount
  useEffect(() => {
    if (inputRef.current) {
      const violations = validateAccessibilityRequirements(inputRef.current);
      if (!violations.isValid) {
        console.warn(`Accessibility violations in field "${name}":`, violations.violations);
      }
    }
  }, [name]);
  
  // Determine field styling
  const hasError = validationErrors.length > 0;
  const showError = hasError && (hasBeenBlurred || !validateOnBlur);
  
  const inputClasses = cn(
    // Base classes
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
    'ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium',
    'placeholder:text-muted-foreground',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    
    // Size variants
    {
      'h-8 px-2 py-1 text-xs': size === 'sm',
      'h-10 px-3 py-2 text-sm': size === 'default',
      'h-12 px-4 py-3 text-base': size === 'lg',
    },
    
    // Visual state
    {
      'border-destructive focus-visible:ring-destructive': showError,
      'border-warning': effectiveDataSensitivity === DataSensitivity.CONFIDENTIAL && !showError,
      'border-destructive bg-destructive/5': effectiveDataSensitivity === DataSensitivity.RESTRICTED && !showError,
    },
    
    // Variant styles
    {
      'border-warning bg-warning/5': variant === 'emergency' && !showError,
      'border-info bg-info/5': variant === 'sensitive' && !showError,
    },
    
    // Focus states
    {
      'ring-2 ring-warning ring-offset-2': isFocused && variant === 'emergency',
      'ring-2 ring-info ring-offset-2': isFocused && variant === 'sensitive',
    },
    
    className
  );
  
  return (
    <div className="healthcare-text-field space-y-2" data-sensitivity={effectiveDataSensitivity}>
      {/* Label */}
      <label 
        htmlFor={fieldId}
        className={cn(
          'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
          {
            'text-destructive': showError,
            'text-warning': variant === 'emergency',
          }
        )}
      >
        {label}
        {required && <span className="text-destructive ml-1" aria-label="obrigatório">*</span>}
        {emergencyField && <span className="ml-2 text-xs text-warning font-semibold">URGENTE</span>}
      </label>
      
      {/* Description */}
      {description && (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
      
      {/* Input */}
      <input
        ref={mergedRef}
        id={fieldId}
        name={name}
        value={value !== undefined ? value : internalValue}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        className={inputClasses}
        aria-invalid={showError}
        aria-describedby={cn(
          descriptionId,
          errorId,
          screenReaderDescription && `${fieldId}-sr-description`
        )}
        aria-required={required}
        data-emergency={emergencyField}
        data-field-type={fieldType}
        {...props}
      />
      
      {/* Screen reader description */}
      {screenReaderDescription && (
        <p id={`${fieldId}-sr-description`} className="sr-only">
          {screenReaderDescription}
        </p>
      )}
      
      {/* Helper text */}
      {helperText && !showError && (
        <p className="text-sm text-muted-foreground">
          {helperText}
        </p>
      )}
      
      {/* Error messages */}
      {showError && (
        <div 
          ref={errorRef}
          id={errorId}
          className="text-sm text-destructive"
          role="alert"
          aria-live="polite"
        >
          {validationErrors.map((error, index) => (
            <p key={index}>{error}</p>
          ))}
        </div>
      )}
      
      {/* Data sensitivity indicator */}
      {(effectiveDataSensitivity === DataSensitivity.RESTRICTED || 
        effectiveDataSensitivity === DataSensitivity.CONFIDENTIAL) && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <span role="img" aria-label="Dados protegidos">🔒</span>
          Dados protegidos pela LGPD
        </p>
      )}
    </div>
  );
});

HealthcareTextField.displayName = 'HealthcareTextField';
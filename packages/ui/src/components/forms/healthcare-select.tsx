/**
 * Healthcare Select Component
 * 
 * Enhanced select/dropdown with healthcare-specific validation, accessibility features,
 * medical option handling, and LGPD compliance built-in.
 * 
 * @fileoverview Healthcare select with React Aria integration and medical taxonomy support
 */

'use client';

import React, { 
  SelectHTMLAttributes, 
  forwardRef, 
  useId, 
  useState, 
  useEffect,
  useRef,
  useMemo
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
  generateAccessibleId
} from '../../utils/accessibility';

// Healthcare select option
export interface HealthcareSelectOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
  group?: string;
  medicalCode?: string; // CID-10, CBHPM, etc.
  deprecated?: boolean;
  emergencyOption?: boolean;
}

// Healthcare field types for automatic options
export type HealthcareSelectType = 
  | 'medical-specialty'
  | 'gender'
  | 'blood-type'
  | 'marital-status'
  | 'education-level'
  | 'insurance-type'
  | 'urgency-level'
  | 'consultation-type'
  | 'generic';

// Healthcare select props
export interface HealthcareSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'onBlur' | 'size'> {
  // Basic field properties
  name: string;
  label: string;
  
  // Options
  options: HealthcareSelectOption[];
  placeholder?: string;
  allowClear?: boolean;
  
  // Healthcare-specific
  selectType?: HealthcareSelectType;
  dataSensitivity?: DataSensitivity;
  emergencyField?: boolean;
  
  // Validation
  validationSchema?: z.ZodSchema;
  customValidation?: (value: string) => string | null;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  
  // UI and UX
  description?: string;
  helperText?: string;
  searchable?: boolean;
  groupOptions?: boolean;
  
  // Event handlers
  onChange?: (value: string, option: HealthcareSelectOption | null, isValid: boolean) => void;
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

// Predefined healthcare options
const healthcareSelectOptions: Record<HealthcareSelectType, HealthcareSelectOption[]> = {
  'medical-specialty': [
    { value: 'cardiologia', label: 'Cardiologia', medicalCode: 'CRM-01' },
    { value: 'pediatria', label: 'Pediatria', medicalCode: 'CRM-02' },
    { value: 'ginecologia', label: 'Ginecologia', medicalCode: 'CRM-03' },
    { value: 'neurologia', label: 'Neurologia', medicalCode: 'CRM-04' },
    { value: 'ortopedia', label: 'Ortopedia', medicalCode: 'CRM-05' },
    { value: 'psiquiatria', label: 'Psiquiatria', medicalCode: 'CRM-06' },
    { value: 'dermatologia', label: 'Dermatologia', medicalCode: 'CRM-07' },
    { value: 'oftalmologia', label: 'Oftalmologia', medicalCode: 'CRM-08' },
    { value: 'medicina-geral', label: 'Medicina Geral', medicalCode: 'CRM-00' },
  ],
  
  'gender': [
    { value: 'masculino', label: 'Masculino' },
    { value: 'feminino', label: 'Feminino' },
    { value: 'nao-binario', label: 'Não-binário' },
    { value: 'prefiro-nao-informar', label: 'Prefiro não informar' },
  ],
  
  'blood-type': [
    { value: 'A+', label: 'A+', group: 'A' },
    { value: 'A-', label: 'A-', group: 'A' },
    { value: 'B+', label: 'B+', group: 'B' },
    { value: 'B-', label: 'B-', group: 'B' },
    { value: 'AB+', label: 'AB+', group: 'AB' },
    { value: 'AB-', label: 'AB-', group: 'AB' },
    { value: 'O+', label: 'O+', group: 'O' },
    { value: 'O-', label: 'O-', group: 'O' },
  ],
  
  'marital-status': [
    { value: 'solteiro', label: 'Solteiro(a)' },
    { value: 'casado', label: 'Casado(a)' },
    { value: 'divorciado', label: 'Divorciado(a)' },
    { value: 'viuvo', label: 'Viúvo(a)' },
    { value: 'uniao-estavel', label: 'União Estável' },
    { value: 'separado', label: 'Separado(a)' },
  ],
  
  'education-level': [
    { value: 'fundamental-incompleto', label: 'Ensino Fundamental Incompleto' },
    { value: 'fundamental-completo', label: 'Ensino Fundamental Completo' },
    { value: 'medio-incompleto', label: 'Ensino Médio Incompleto' },
    { value: 'medio-completo', label: 'Ensino Médio Completo' },
    { value: 'superior-incompleto', label: 'Ensino Superior Incompleto' },
    { value: 'superior-completo', label: 'Ensino Superior Completo' },
    { value: 'pos-graduacao', label: 'Pós-graduação' },
    { value: 'mestrado', label: 'Mestrado' },
    { value: 'doutorado', label: 'Doutorado' },
  ],
  
  'insurance-type': [
    { value: 'sus', label: 'SUS (Sistema Único de Saúde)' },
    { value: 'plano-saude', label: 'Plano de Saúde' },
    { value: 'particular', label: 'Particular' },
    { value: 'convenio', label: 'Convênio' },
  ],
  
  'urgency-level': [
    { value: 'emergencia', label: 'Emergência', emergencyOption: true, description: 'Risco de vida imediato' },
    { value: 'urgencia', label: 'Urgência', description: 'Necessita atendimento rápido' },
    { value: 'prioridade', label: 'Prioridade', description: 'Atendimento prioritário' },
    { value: 'normal', label: 'Normal', description: 'Atendimento de rotina' },
    { value: 'baixa', label: 'Baixa', description: 'Pode aguardar' },
  ],
  
  'consultation-type': [
    { value: 'primeira-consulta', label: 'Primeira Consulta' },
    { value: 'retorno', label: 'Retorno' },
    { value: 'consulta-urgencia', label: 'Consulta de Urgência', emergencyOption: true },
    { value: 'teleconsulta', label: 'Teleconsulta' },
    { value: 'consulta-especializada', label: 'Consulta Especializada' },
    { value: 'segunda-opiniao', label: 'Segunda Opinião' },
  ],
  
  'generic': [],
};

/**
 * Healthcare Select Component
 * 
 * Provides an accessible, validated select input specifically designed
 * for healthcare data entry with LGPD compliance and medical validation.
 */
export const HealthcareSelect = forwardRef<HTMLSelectElement, HealthcareSelectProps>(({
  name,
  label,
  options: providedOptions,
  placeholder = 'Selecione uma opção...',
  allowClear = false,
  selectType = 'generic',
  dataSensitivity,
  emergencyField = false,
  validationSchema,
  customValidation,
  validateOnChange = true,
  validateOnBlur = true,
  description,
  helperText,
  searchable = false,
  groupOptions = false,
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
  useHealthcareTheme(); // Keep for future theme integration
  
  // Local state
  const [internalValue, setInternalValue] = useState<string>(
    (value ?? defaultValue ?? '') as string
  );
  const [isFocused, setIsFocused] = useState(false);
  const [hasBeenBlurred, setHasBeenBlurred] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Refs
  const selectRef = useRef<HTMLSelectElement>(null);
  
  // Merge refs
  const mergedRef = (node: HTMLSelectElement) => {
    selectRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };
  
  // Auto-determine data sensitivity if not provided
  const effectiveDataSensitivity = dataSensitivity ?? classifyHealthcareData(selectType);
  
  // Get effective options (provided or predefined)
  const effectiveOptions = useMemo(() => {
    let options = providedOptions && providedOptions.length > 0 
      ? providedOptions 
      : healthcareSelectOptions[selectType] || [];
    
    // Filter by search term if searchable
    if (searchable && searchTerm) {
      options = options.filter(option => 
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.medicalCode?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return options;
  }, [providedOptions, selectType, searchable, searchTerm]);
  
  // Group options if requested
  const groupedOptions = useMemo(() => {
    if (!groupOptions) return null;
    
    const groups: Record<string, HealthcareSelectOption[]> = {};
    const ungrouped: HealthcareSelectOption[] = [];
    
    effectiveOptions.forEach(option => {
      if (option.group) {
        if (!groups[option.group]) {
          groups[option.group] = [];
        }
        groups[option.group].push(option);
      } else {
        ungrouped.push(option);
      }
    });
    
    return { groups, ungrouped };
  }, [effectiveOptions, groupOptions]);
  
  // Generate IDs
  const fieldId = useId();
  const accessibleId = generateAccessibleId('healthcare-select');
  const descriptionId = description ? `${fieldId}-description` : undefined;
  const errorId = validationErrors.length > 0 ? `${fieldId}-error` : undefined;
  
  // Get validation schema based on select type
  const getValidationSchema = (): z.ZodSchema | null => {
    if (validationSchema) return validationSchema;
    
    const schemas = healthcareValidationSchemas;
    switch (selectType) {
      case 'medical-specialty': return schemas.medicalSpecialty;
      case 'gender': return z.enum(['masculino', 'feminino', 'nao-binario', 'prefiro-nao-informar']);
      case 'blood-type': return z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']);
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
    
    // Check if value exists in options
    const validOption = effectiveOptions.find(option => option.value === valueToValidate);
    if (valueToValidate && !validOption) {
      errors.push('Opção inválida selecionada');
    }
    
    // Check if option is disabled
    if (validOption && validOption.disabled) {
      errors.push('Esta opção não está disponível');
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
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = event.target.value;
    setInternalValue(newValue);
    
    // Find selected option
    const selectedOption = effectiveOptions.find(option => option.value === newValue) || null;
    
    // Validate on change if enabled
    if (validateOnChange) {
      const errors = validateField(newValue);
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
    onChange?.(newValue, selectedOption, validationErrors.length === 0);
  };
  
  // Handle blur
  const handleBlur = (event: React.FocusEvent<HTMLSelectElement>) => {
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
  
  // Focus on error if needed
  useEffect(() => {
    if (autoFocusOnError && validationErrors.length > 0 && hasBeenBlurred) {
      selectRef.current?.focus();
    }
  }, [validationErrors, autoFocusOnError, hasBeenBlurred]);
  
  // Validate accessibility on mount (basic label/error checks)
  useEffect(() => {
    const el = selectRef.current;
    if (!el) return;
    const violations: string[] = [];
    const hasLabel = !!(el.getAttribute('aria-label') || el.getAttribute('aria-labelledby'));
    if (!hasLabel) violations.push('Campo sem rótulo acessível');
    const isInvalid = el.getAttribute('aria-invalid') === 'true';
    if (isInvalid && !el.getAttribute('aria-describedby')) {
      violations.push('Erro sem descrição acessível');
    }
    if (el.hasAttribute('required') && !el.getAttribute('aria-required')) {
      violations.push('Campo obrigatório sem indicação acessível');
    }
    if (violations.length) {
      console.warn(`Accessibility violations in field "${name}":`, violations);
    }
  }, [name]);
  
  // Determine field styling
  const hasError = validationErrors.length > 0;
  const showError = hasError && (hasBeenBlurred || !validateOnBlur);
  
  const selectClasses = cn(
    // Base classes
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
    'ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    
    // Size variants
    {
      'h-8 px-2 py-1 text-xs': size === 'sm',
      'h-10 px-3 py-2 text-sm': size === 'default',
      'h-12 px-4 py-3 text-base': size === 'lg',
    },
    
    // Visual state
    {
      'border-destructive focus:ring-destructive': showError,
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
    <div className="healthcare-select space-y-2" data-sensitivity={effectiveDataSensitivity}>
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
      
      {/* Search input for searchable mode */}
      {searchable && (
        <input
          type="text"
          placeholder="Search options..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-input rounded-md mb-2"
        />
      )}
      
      {/* Select */}
      <select
        ref={mergedRef}
        id={accessibleId || fieldId}
        name={name}
        value={value !== undefined ? value : internalValue}
        required={required}
        disabled={disabled}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        className={selectClasses}
        aria-invalid={showError}
        aria-describedby={cn(
          descriptionId,
          errorId,
          screenReaderDescription && `${fieldId}-sr-description`
        )}
        aria-required={required}
        data-emergency={emergencyField}
        data-select-type={selectType}
        {...props}
      >
        {/* Placeholder option */}
        <option value="" disabled hidden>
          {placeholder}
        </option>
        
        {/* Clear option if allowed */}
        {allowClear && internalValue && (
          <option value="">Limpar seleção</option>
        )}
        
        {/* Render grouped or flat options */}
        {groupedOptions ? (
          <>
            {/* Ungrouped options */}
            {groupedOptions.ungrouped.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className={cn({
                  'font-semibold text-warning': option.emergencyOption,
                  'text-muted-foreground line-through': option.deprecated,
                })}
              >
                {option.label}
                {option.medicalCode && ` (${option.medicalCode})`}
              </option>
            ))}
            
            {/* Grouped options */}
            {Object.entries(groupedOptions.groups).map(([groupName, groupOptions]) => (
              <optgroup key={groupName} label={groupName}>
                {groupOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    className={cn({
                      'font-semibold text-warning': option.emergencyOption,
                      'text-muted-foreground line-through': option.deprecated,
                    })}
                  >
                    {option.label}
                    {option.medicalCode && ` (${option.medicalCode})`}
                  </option>
                ))}
              </optgroup>
            ))}
          </>
        ) : (
          // Flat options
          effectiveOptions.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              className={cn({
                'font-semibold text-warning': option.emergencyOption,
                'text-muted-foreground line-through': option.deprecated,
              })}
            >
              {option.label}
              {option.medicalCode && ` (${option.medicalCode})`}
            </option>
          ))
        )}
      </select>
      
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

HealthcareSelect.displayName = 'HealthcareSelect';
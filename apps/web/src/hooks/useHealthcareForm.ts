import { useAccessibility } from '@/components/ui/accessibility-provider'
import { useScreenReaderAnnouncer } from '@/components/ui/screen-reader-announcer'
import { HealthcareFormValidator, FormValidationResult, FormFieldError } from '@/types/validation'
import { PatientData, HealthcareContext, HealthcareValidationLevel } from '@/types/healthcare'
import * as React from 'react'

// Enhanced healthcare form hook with accessibility and LGPD compliance
export interface UseHealthcareFormOptions<T extends Record<string, any>> {
  initialValues: Partial<T>
  onSubmit: (data: T) => Promise<void>
  validationLevel?: HealthcareValidationLevel
  healthcareContext?: HealthcareContext
  enableLGPDCompliance?: boolean
  enableAccessibilityAnnouncements?: boolean
  shouldConfirmSensitiveActions?: boolean
}

export interface HealthcareFormState<T> {
  data: Partial<T>
  errors: Record<keyof T, string | undefined>
  touched: Record<keyof T, boolean>
  isSubmitting: boolean
  isValid: boolean
  isDirty: boolean
  submitCount: number
  lastSubmitTime?: Date
}

export interface HealthcareFormActions<T> {
  getFieldAccessor: (field: keyof T) => {
    value: T[keyof T] | undefined
    error: string | undefined
    touched: boolean
    onChange: (value: T[keyof T]) => void
    onBlur: () => void
    setTouched: (touched: boolean) => void
  }
  setValue: (field: keyof T, value: T[keyof T]) => void
  setError: (field: keyof T, error: string | undefined) => void
  clearError: (field: keyof T) => void
  setTouched: (field: keyof T, touched: boolean) => void
  handleSubmit: (e: React.FormEvent) => Promise<void>
  resetForm: (newValues?: Partial<T>) => void
  validateField: (field: keyof T) => FormFieldError | null
  validateForm: () => FormValidationResult
  setIsSubmitting: (submitting: boolean) => void
}

export interface HealthcareFormMetadata {
  validationLevel: HealthcareValidationLevel
  healthcareContext?: HealthcareContext
  lgpdCompliance: {
    enabled: boolean
    sensitiveFields: (keyof T)[]
    dataProcessingAnnounced: boolean
  }
  accessibility: {
    announcementsEnabled: boolean
    screenReaderOptimized: boolean
    keyboardNavigation: boolean
  }
}

export type HealthcareFormReturn<T> = HealthcareFormState<T> & HealthcareFormActions<T> & {
  metadata: HealthcareFormMetadata
}

// Custom hook for healthcare forms with full accessibility and LGPD compliance
export function useHealthcareForm<T extends Record<string, any>>(
  options: UseHealthcareFormOptions<T>
): HealthcareFormReturn<T> {
  const {
    initialValues,
    onSubmit,
    validationLevel = 'strict',
    healthcareContext,
    enableLGPDCompliance = true,
    enableAccessibilityAnnouncements = true,
    shouldConfirmSensitiveActions = true,
  } = options

  // Accessibility hooks
  const accessibility = useAccessibility()
  const { announce } = useScreenReaderAnnouncer()

  // Form validator
  const validator = React.useMemo(() => new HealthcareFormValidator(validationLevel), [validationLevel])

  // Form state
  const [state, setState] = React.useState<HealthcareFormState<T>>({
    data: initialValues,
    errors: {} as Record<keyof T, string | undefined>,
    touched: {} as Record<keyof T, boolean>,
    isSubmitting: false,
    isValid: false,
    isDirty: false,
    submitCount: 0,
  })

  // Metadata
  const metadata: HealthcareFormMetadata = {
    validationLevel,
    healthcareContext,
    lgpdCompliance: {
      enabled: enableLGPDCompliance,
      sensitiveFields: identifySensitiveFields(initialValues),
      dataProcessingAnnounced: false,
    },
    accessibility: {
      announcementsEnabled: enableAccessibilityAnnouncements,
      screenReaderOptimized: accessibility.preferences.screenReaderOptimized,
      keyboardNavigation: accessibility.preferences.keyboardNavigation,
    },
  }

  // Identify sensitive LGPD fields
  function identifySensitiveFields(values: Partial<T>): (keyof T)[] {
    const sensitive: (keyof T)[] = []
    
    // Common sensitive field patterns
    const sensitivePatterns = [
      /cpf/i,
      /rg/i,
      /nome.*completo/i,
      /endereco/i,
      /telefone/i,
      /email/i,
      /data.*nascimento/i,
      /historico.*medico/i,
      /alergias/i,
      /medicamentos/i,
    ]

    Object.keys(values).forEach(key => {
      const fieldName = key.toLowerCase()
      if (sensitivePatterns.some(pattern => pattern.test(fieldName))) {
        sensitive.push(key as keyof T)
      }
    })

    return sensitive
  }

  // Field accessor
  const getFieldAccessor = (field: keyof T) => {
    const value = state.data[field]
    const error = state.errors[field]
    const touched = state.touched[field]

    const onChange = (newValue: T[keyof T]) => {
      setState(prev => {
        const newData = { ...prev.data, [field]: newValue }
        const newTouched = { ...prev.touched, [field]: true }
        const isDirty = JSON.stringify(newData) !== JSON.stringify(initialValues)
        
        // Clear error when field is updated
        const newErrors = { ...prev.errors }
        if (newErrors[field]) {
          delete newErrors[field]
        }

        return {
          ...prev,
          data: newData,
          touched: newTouched,
          errors: newErrors,
          isDirty,
        }
      })

      // Accessibility announcement
      if (enableAccessibilityAnnouncements && accessibility.preferences.screenReaderOptimized) {
        const isSensitive = metadata.lgpdCompliance.sensitiveFields.includes(field)
        if (isSensitive) {
          announce(`Campo ${String(field)} atualizado. Dados sensíveis foram modificados.`, 'polite')
        }
      }
    }

    const onBlur = () => {
      if (!state.touched[field]) {
        setState(prev => ({
          ...prev,
          touched: { ...prev.touched, [field]: true },
        }))
      }
    }

    const setTouched = (touched: boolean) => {
      setState(prev => ({
        ...prev,
        touched: { ...prev.touched, [field]: touched },
      }))
    }

    return {
      value,
      error,
      touched,
      onChange,
      onBlur,
      setTouched,
    }
  }

  // Individual field operations
  const setValue = (field: keyof T, value: T[keyof T]) => {
    getFieldAccessor(field).onChange(value)
  }

  const setError = (field: keyof T, error: string | undefined) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: error },
    }))
  }

  const clearError = (field: keyof T) => {
    setState(prev => {
      const newErrors = { ...prev.errors }
      delete newErrors[field]
      return { ...prev, errors: newErrors }
    })
  }

  const setTouched = (field: keyof T, touched: boolean) => {
    getFieldAccessor(field).setTouched(touched)
  }

  // Validation methods
  const validateField = (field: keyof T): FormFieldError | null => {
    // Basic validation - can be extended with field-specific validation
    const value = state.data[field]
    
    if (value === undefined || value === null || value === '') {
      return {
        field: field as string,
        message: 'Campo obrigatório',
        severity: 'error',
      }
    }

    return null
  }

  const validateForm = (): FormValidationResult => {
    // Validate all fields
    const errors: FormFieldError[] = []
    
    Object.keys(state.data).forEach(field => {
      const fieldError = validateField(field as keyof T)
      if (fieldError) {
        errors.push(fieldError)
      }
    })

    // Use healthcare validator if data is PatientData
    if (healthcareContext && validationLevel === 'healthcare_critical') {
      try {
        const healthcareValidation = validator.validatePatientData(state.data as unknown as PatientData)
        errors.push(...healthcareValidation.errors)
      } catch (error) {
        console.warn('Healthcare validation failed:', error)
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: [],
    }
  }

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    const validation = validateForm()
    
    if (!validation.isValid) {
      // Update errors
      const newErrors: Record<keyof T, string | undefined> = {} as Record<keyof T, string | undefined>
      validation.errors.forEach(error => {
        newErrors[error.field as keyof T] = error.message
      })
      
      setState(prev => ({
        ...prev,
        errors: newErrors,
      }))
      
      // Accessibility announcement
      if (enableAccessibilityAnnouncements) {
        announce(`Formulário contém ${validation.errors.length} erros. Verifique os campos destacados.`, 'assertive')
      }
      
      return
    }

    // LGPD compliance check for sensitive actions
    if (enableLGPDCompliance && shouldConfirmSensitiveActions) {
      const hasSensitiveData = metadata.lgpdCompliance.sensitiveFields.some(field => 
        state.data[field] !== initialValues[field]
      )
      
      if (hasSensitiveData && !metadata.lgpdCompliance.dataProcessingAnnounced) {
        // In a real implementation, you'd show a confirmation dialog here
        announce('Processando dados sensíveis conforme LGPD.', 'polite')
        metadata.lgpdCompliance.dataProcessingAnnounced = true
      }
    }

    // Start submission
    setState(prev => ({
      ...prev,
      isSubmitting: true,
      submitCount: prev.submitCount + 1,
    }))

    try {
      // Accessibility announcement
      if (enableAccessibilityAnnouncements) {
        announce('Enviando formulário...', 'polite')
      }

      await onSubmit(state.data as T)
      
      // Success announcement
      if (enableAccessibilityAnnouncements) {
        announce('Formulário enviado com sucesso.', 'polite')
      }

      // Update submission metadata
      setState(prev => ({
        ...prev,
        lastSubmitTime: new Date(),
      }))

    } catch (error) {
      console.error('Form submission error:', error)
      
      // Error announcement
      if (enableAccessibilityAnnouncements) {
        announce('Erro ao enviar formulário. Tente novamente.', 'assertive')
      }
      
      throw error
      
    } finally {
      setState(prev => ({
        ...prev,
        isSubmitting: false,
      }))
    }
  }

  // Reset form
  const resetForm = (newValues?: Partial<T>) => {
    const resetValues = newValues || initialValues
    
    setState({
      data: resetValues,
      errors: {} as Record<keyof T, string | undefined>,
      touched: {} as Record<keyof T, boolean>,
      isSubmitting: false,
      isValid: false,
      isDirty: false,
      submitCount: 0,
    })

    // Accessibility announcement
    if (enableAccessibilityAnnouncements) {
      announce('Formulário redefinido.', 'polite')
    }
  }

  // Manual submission state control
  const setIsSubmitting = (submitting: boolean) => {
    setState(prev => ({
      ...prev,
      isSubmitting: submitting,
    }))
  }

  return {
    ...state,
    getFieldAccessor,
    setValue,
    setError,
    clearError,
    setTouched,
    handleSubmit,
    resetForm,
    validateField,
    validateForm,
    setIsSubmitting,
    metadata,
  }
}

// Higher-order component for healthcare forms
export function withHealthcareForm<T extends Record<string, any>>(
  Component: React.ComponentType<{
    form: HealthcareFormReturn<T>
    accessibility: ReturnType<typeof useAccessibility>
  }>,
  options: UseHealthcareFormOptions<T>
) {
  return function HealthcareFormComponent(props: any) {
    const accessibility = useAccessibility()
    const form = useHealthcareForm(options)

    return (
      <Component
        {...props}
        form={form}
        accessibility={accessibility}
      />
    )
  }
}

// Hook for LGPD compliance monitoring
export function useLGPDCompliance<T extends Record<string, any>>(
  formData: Partial<T>,
  sensitiveFields: (keyof T)[]
) {
  const [complianceStatus, setComplianceStatus] = React.useState({
    hasUnsavedSensitiveData: false,
    lastSensitiveChange: Date.now(),
    consentRequired: false,
  })

  React.useEffect(() => {
    const hasUnsavedChanges = sensitiveFields.some(field => 
      formData[field] !== undefined
    )

    setComplianceStatus(prev => ({
      ...prev,
      hasUnsavedSensitiveData: hasUnsavedChanges,
      lastSensitiveChange: hasUnsavedChanges ? Date.now() : prev.lastSensitiveChange,
    }))
  }, [formData, sensitiveFields])

  return {
    ...complianceStatus,
    markDataAsSaved: () => {
      setComplianceStatus(prev => ({ ...prev, hasUnsavedSensitiveData: false }))
    },
    requestConsent: () => {
      setComplianceStatus(prev => ({ ...prev, consentRequired: true }))
    },
    consentGranted: () => {
      setComplianceStatus(prev => ({ ...prev, consentRequired: false }))
    },
  }
}
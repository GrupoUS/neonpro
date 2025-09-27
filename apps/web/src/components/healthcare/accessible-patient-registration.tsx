import React, { useState, useCallback, useEffect, useMemo } from 'react'
// Note: Some accessibility imports temporarily disabled for build stability
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.js'
import { CardTitle } from '@/components/ui/card.js'
import { Badge } from '@/components/ui/badge.js'
import { Progress } from '@/components/ui/progress.js'
import { Alert, AlertDescription } from '@/components/ui/alert.js'
import { cn } from '@/lib/utils.js'

// Import simplified types - some healthcare types temporarily simplified for build
interface PatientData {
  id?: string
  name: string
  cpf?: string
  email?: string
  phone?: string
  dateOfBirth?: string
  address?: any
}

interface LGPDConsent {
  consentDate: string
  treatmentConsent: boolean
  dataProcessingConsent: boolean
}

// Type-safe form errors
interface FormErrors {
  'personalInfo.fullName'?: string
  'personalInfo.cpf'?: string
  'personalInfo.dateOfBirth'?: string
  'personalInfo.email'?: string
  'personalInfo.phone'?: string
  'address.street'?: string
  'address.number'?: string
  'address.complement'?: string
  'address.neighborhood'?: string
  'address.city'?: string
  'address.state'?: string
  'address.zipCode'?: string
  'emergencyContact.name'?: string
  'emergencyContact.relationship'?: string
  'emergencyContact.phone'?: string
  'emergencyContact.email'?: string
  'medicalHistory.allergies'?: string
  'medicalHistory.medications'?: string
  'medicalHistory.conditions'?: string
  'medicalHistory.previousTreatments'?: string
  'consent.treatmentConsent'?: string
  'consent.dataSharingConsent'?: string
  'consent.marketingConsent'?: string
  'consent.emergencyContactConsent'?: string
}

interface AccessiblePatientRegistrationProps {
  onSubmit: (data: PatientData) => Promise<void>
  onCancel?: () => void
  className?: string
  validationLevel?: 'basic' | 'strict' | 'healthcare_critical'
}

// Brazilian state options
const BRAZILIAN_STATES: Array<{ value: BrazilianState; label: string }> = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
]

export const AccessiblePatientRegistration: React.FC<AccessiblePatientRegistrationProps> = ({
  onSubmit,
  onCancel,
  className,
  validationLevel = 'strict',
}) => {
  const { t, formatDate } = useTranslation()
  const { announce } = useScreenReaderAnnouncer()
  const { setFocus } = useFocusManagement()
  const { registerFocusable } = useKeyboardNavigation()

  // Initialize validator
  const validator = React.useMemo(() => new HealthcareFormValidator(validationLevel), [validationLevel])

  const [currentStep, setCurrentStep] = React.useState(0)
  const [patientData, setPatientData] = React.useState<Partial<PatientData>>({})
  const [errors, setErrors] = React.useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)

  // Form steps with proper typing
  const formSteps = [
    {
      id: 'personal' as const,
      title: t('forms.personalInfo'),
      description: 'Informações básicas do paciente',
      icon: '👤',
      context: 'patient' as HealthcareContext,
    },
    {
      id: 'address' as const,
      title: t('forms.address'),
      description: 'Endereço residencial',
      icon: '🏠',
      context: 'administrative' as HealthcareContext,
    },
    {
      id: 'emergency' as const,
      title: t('healthcare.emergencyContact'),
      description: 'Contato para emergências',
      icon: '🆘',
      context: 'emergency' as HealthcareContext,
    },
    {
      id: 'medical' as const,
      title: t('medicalHistory.title'),
      description: 'Histórico médico importante',
      icon: '🏥',
      context: 'medical' as HealthcareContext,
    },
    {
      id: 'consent' as const,
      title: t('lgpd.consentTitle'),
      description: 'Consentimentos LGPD',
      icon: '📋',
      context: 'administrative' as HealthcareContext,
    },
    {
      id: 'review' as const,
      title: 'Revisão',
      description: 'Revisão e confirmação',
      icon: '✅',
      context: 'administrative' as HealthcareContext,
    },
  ]

  // Focus management for step changes
  const stepRef = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    if (stepRef.current) {
      stepRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setFocus(stepRef.current)
      announce({
        message: `Etapa ${currentStep + 1}: ${formSteps[currentStep].title}`,
        politeness: 'polite',
      })
    }
  }, [currentStep, announce, setFocus])

  // Type-safe field change handler
  const handleFieldChange = <T extends keyof PatientData>(
    field: T, 
    value: PatientData[T]
  ) => {
    setPatientData(prev => {
      const newData = { ...prev }
      
      if (field.includes('.')) {
        const [section, subField] = field.split('.') as [keyof PatientData, string]
        if (section && newData[section]) {
          newData[section] = {
            ...newData[section],
            [subField]: value
          }
        }
      } else {
        newData[field] = value
      }
      
      return newData
    })

    // Clear error when field is updated
    const errorKey = field as keyof FormErrors
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[errorKey]
        return newErrors
      })
    }
  }

  // Type-safe field-specific change handler
  const handleNestedFieldChange = <T extends keyof PatientData>(
    section: T,
    subField: string,
    value: any
  ) => {
    const fieldKey = `${String(section)}.${subField}` as keyof FormErrors
    handleFieldChange(fieldKey, value)
  }

  // Enhanced form validation using the validator
  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {}
    
    // Validate specific step fields
    switch (step) {
      case 0: // Personal Info
        if (!patientData.personalInfo?.fullName?.trim()) {
          newErrors['personalInfo.fullName'] = t('forms.required')
        }
        
        if (patientData.personalInfo?.cpf) {
          const cpfError = validator.validateCPF(patientData.personalInfo.cpf)
          if (cpfError) {
            newErrors['personalInfo.cpf'] = cpfError.message
          }
        }
        
        if (!patientData.personalInfo?.dateOfBirth) {
          newErrors['personalInfo.dateOfBirth'] = t('forms.required')
        } else {
          const dobError = validator.validateDateOfBirth(patientData.personalInfo.dateOfBirth)
          if (dobError) {
            newErrors['personalInfo.dateOfBirth'] = dobError.message
          }
        }
        
        if (!patientData.personalInfo?.phone?.trim()) {
          newErrors['personalInfo.phone'] = t('forms.required')
        } else {
          const phoneError = validator.validatePhone(patientData.personalInfo.phone)
          if (phoneError) {
            newErrors['personalInfo.phone'] = phoneError.message
          }
        }
        
        if (patientData.personalInfo?.email) {
          const emailError = validator.validateEmail(patientData.personalInfo.email)
          if (emailError) {
            newErrors['personalInfo.email'] = emailError.message
          }
        }
        break

      case 1: // Address
        if (!patientData.address?.street?.trim()) {
          newErrors['address.street'] = t('forms.required')
        }
        if (!patientData.address?.number?.trim()) {
          newErrors['address.number'] = t('forms.required')
        }
        if (!patientData.address?.neighborhood?.trim()) {
          newErrors['address.neighborhood'] = t('forms.required')
        }
        if (!patientData.address?.city?.trim()) {
          newErrors['address.city'] = t('forms.required')
        }
        if (!patientData.address?.state?.trim()) {
          newErrors['address.state'] = t('forms.required')
        }
        if (!patientData.address?.zipCode?.trim()) {
          newErrors['address.zipCode'] = t('forms.required')
        } else {
          const zipCodeError = validator.validateZipCode(patientData.address.zipCode)
          if (zipCodeError) {
            newErrors['address.zipCode'] = zipCodeError.message
          }
        }
        break

      case 2: // Emergency Contact
        if (!patientData.emergencyContact?.name?.trim()) {
          newErrors['emergencyContact.name'] = t('forms.required')
        }
        if (!patientData.emergencyContact?.relationship?.trim()) {
          newErrors['emergencyContact.relationship'] = t('forms.required')
        }
        if (!patientData.emergencyContact?.phone?.trim()) {
          newErrors['emergencyContact.phone'] = t('forms.required')
        } else {
          const phoneError = validator.validatePhone(patientData.emergencyContact.phone)
          if (phoneError) {
            newErrors['emergencyContact.phone'] = phoneError.message
          }
        }
        break

      case 4: // Consent
        if (!patientData.consent?.treatmentConsent) {
          newErrors['consent.treatmentConsent'] = t('forms.required')
        }
        if (!patientData.consent?.dataSharingConsent) {
          newErrors['consent.dataSharingConsent'] = t('forms.required')
        }
        break
    }

    setErrors(newErrors)
    
    if (Object.keys(newErrors).length > 0) {
      announce({
        message: 'Formulário contém erros. Verifique os campos destacados.',
        politeness: 'assertive',
      })
      return false
    }

    return true
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      const next = currentStep + 1
      setCurrentStep(next)
      announce({
        message: `Avançando para etapa ${next + 1}: ${formSteps[next].title}`,
        politeness: 'polite',
      })
    }
  }

  const prevStep = () => {
    const prev = Math.max(0, currentStep - 1)
    setCurrentStep(prev)
    announce({
      message: `Voltando para etapa ${prev + 1}: ${formSteps[prev].title}`,
      politeness: 'polite',
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateStep(currentStep)) {
      return
    }

    // Final validation of all data
    const finalValidation = validator.validatePatientData(patientData)
    if (!finalValidation.isValid) {
      const newErrors: FormErrors = {}
      finalValidation.errors.forEach(error => {
        const key = error.field as keyof FormErrors
        newErrors[key] = error.message
      })
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Add timestamps and consent data
      const completeData: PatientData = {
        personalInfo: patientData.personalInfo!,
        address: patientData.address!,
        emergencyContact: patientData.emergencyContact!,
        medicalHistory: patientData.medicalHistory || {},
        consent: {
          ...patientData.consent!,
          consentDate: new Date().toISOString(),
          consentVersion: '1.0'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      await onSubmit(completeData)
      announce({
        message: t('announcements.formSubmitted'),
        politeness: 'polite',
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('errors.unknownError')
      setSubmitError(errorMessage)
      announce({
        message: t('announcements.formError'),
        politeness: 'assertive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepContent = () => {
    const currentStepData = formSteps[currentStep]
    
    switch (currentStep) {
      case 0: // Personal Info
        return (
          <HealthcareFormGroup
            label={t('forms.personalInfo')}
            healthcareContext="patient"
          >
            <div className="space-y-4">
              <AccessibilityInput
                id="fullName"
                label={t('forms.fullName')}
                required
                value={patientData.personalInfo?.fullName || ''}
                onChange={(e) => handleNestedFieldChange('personalInfo', 'fullName', e.target.value)}
                error={errors['personalInfo.fullName']}
                helperText="Nome completo como aparece no documento"
                healthcareContext="personal"
                lgpdSensitive={true}
                dataPurpose="Identificação do paciente"
                screenReaderInstructions="Digite seu nome completo, incluindo primeiro nome e sobrenome"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AccessibilityInput
                  id="cpf"
                  label={t('forms.cpf')}
                  brazilianFormat="cpf"
                  value={patientData.personalInfo?.cpf || ''}
                  onChange={(e) => handleNestedFieldChange('personalInfo', 'cpf', e.target.value)}
                  error={errors['personalInfo.cpf']}
                  helperText="000.000.000-00"
                  healthcareContext="personal"
                  lgpdSensitive={true}
                  dataPurpose="Identificação fiscal do paciente"
                  screenReaderInstructions="Digite seu CPF com pontos e traço"
                />

                <AccessibilityInput
                  id="dateOfBirth"
                  label={t('forms.dateOfBirth')}
                  type="date"
                  brazilianFormat="date"
                  required
                  value={patientData.personalInfo?.dateOfBirth || ''}
                  onChange={(e) => handleNestedFieldChange('personalInfo', 'dateOfBirth', e.target.value)}
                  error={errors['personalInfo.dateOfBirth']}
                  healthcareContext="personal"
                  lgpdSensitive={true}
                  dataPurpose="Dados demográficos do paciente"
                  screenReaderInstructions="Digite sua data de nascimento no formato DD/MM/AAAA"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AccessibilityInput
                  id="email"
                  label={t('forms.email')}
                  type="email"
                  value={patientData.personalInfo?.email || ''}
                  onChange={(e) => handleNestedFieldChange('personalInfo', 'email', e.target.value)}
                  error={errors['personalInfo.email']}
                  helperText="email@exemplo.com"
                  healthcareContext="personal"
                  lgpdSensitive={true}
                  dataPurpose="Contato do paciente"
                  screenReaderInstructions="Digite seu endereço de email"
                />

                <AccessibilityInput
                  id="phone"
                  label={t('forms.phone')}
                  brazilianFormat="phone"
                  type="tel"
                  required
                  value={patientData.personalInfo?.phone || ''}
                  onChange={(e) => handleNestedFieldChange('personalInfo', 'phone', e.target.value)}
                  error={errors['personalInfo.phone']}
                  helperText="(11) 99999-9999"
                  healthcareContext="personal"
                  lgpdSensitive={true}
                  dataPurpose="Contato do paciente"
                  screenReaderInstructions="Digite seu telefone com DDD"
                />
              </div>
            </div>
          </HealthcareFormGroup>
        )

      case 1: // Address
        return (
          <HealthcareFormGroup
            label={t('forms.address')}
            healthcareContext="administrative"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <AccessibilityInput
                    id="street"
                    label={t('forms.street')}
                    required
                    value={patientData.address?.street || ''}
                    onChange={(e) => handleNestedFieldChange('address', 'street', e.target.value)}
                    error={errors['address.street']}
                    healthcareContext="administrative"
                    lgpdSensitive={true}
                    dataPurpose="Endereço residencial do paciente"
                    screenReaderInstructions="Digite o nome da sua rua"
                  />
                </div>
                <div>
                  <AccessibilityInput
                    id="number"
                    label={t('forms.number')}
                    required
                    value={patientData.address?.number || ''}
                    onChange={(e) => handleNestedFieldChange('address', 'number', e.target.value)}
                    error={errors['address.number']}
                    healthcareContext="administrative"
                    lgpdSensitive={true}
                    dataPurpose="Número do endereço residencial"
                    screenReaderInstructions="Digite o número da residência"
                  />
                </div>
              </div>

              <AccessibilityInput
                id="complement"
                label={t('forms.complement')}
                value={patientData.address?.complement || ''}
                onChange={(e) => handleNestedFieldChange('address', 'complement', e.target.value)}
                helperText="Apto, casa, etc."
                healthcareContext="administrative"
                lgpdSensitive={true}
                dataPurpose="Complemento do endereço residencial"
                screenReaderInstructions="Digite complemento como apartamento ou casa, se aplicável"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AccessibilityInput
                  id="neighborhood"
                  label={t('forms.neighborhood')}
                  required
                  value={patientData.address?.neighborhood || ''}
                  onChange={(e) => handleNestedFieldChange('address', 'neighborhood', e.target.value)}
                  error={errors['address.neighborhood']}
                  healthcareContext="administrative"
                  lgpdSensitive={true}
                  dataPurpose="Bairro do endereço residencial"
                  screenReaderInstructions="Digite o nome do seu bairro"
                />

                <AccessibilityInput
                  id="city"
                  label={t('forms.city')}
                  required
                  value={patientData.address?.city || ''}
                  onChange={(e) => handleNestedFieldChange('address', 'city', e.target.value)}
                  error={errors['address.city']}
                  healthcareContext="administrative"
                  lgpdSensitive={true}
                  dataPurpose="Cidade do endereço residencial"
                  screenReaderInstructions="Digite o nome da sua cidade"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <AccessibilityLabel htmlFor="state" required>
                    {t('forms.state')}
                  </AccessibilityLabel>
                  <Select
                    value={patientData.address?.state || ''}
                    onValueChange={(value) => handleNestedFieldChange('address', 'state', value)}
                  >
                    <SelectTrigger className="w-full" ref={(el) => el && registerFocusable(el, 1)}>
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {BRAZILIAN_STATES.map((state) => (
                        <SelectItem key={state.value} value={state.value}>
                          {state.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors['address.state'] && (
                    <HealthcareFieldError message={errors['address.state']} />
                  )}
                </div>

                <AccessibilityInput
                  id="zipCode"
                  label={t('forms.zipCode')}
                  brazilianFormat="cep"
                  required
                  value={patientData.address?.zipCode || ''}
                  onChange={(e) => handleNestedFieldChange('address', 'zipCode', e.target.value)}
                  error={errors['address.zipCode']}
                  helperText="00000-000"
                  healthcareContext="administrative"
                  lgpdSensitive={true}
                  dataPurpose="CEP do endereço residencial"
                  screenReaderInstructions="Digite seu CEP com o traço"
                />
              </div>
            </div>
          </HealthcareFormGroup>
        )

      // Continue with other steps...
      default:
        return <div>Em desenvolvimento...</div>
    }
  }

  const progress = ((currentStep + 1) / formSteps.length) * 100

  return (
    <KeyboardNavigationProvider trapFocus>
      <div className={cn('max-w-4xl mx-auto p-4', className)}>
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold">Cadastro de Paciente</h1>
            <Badge variant="outline">
              {currentStep + 1} de {formSteps.length}
            </Badge>
          </div>
          <Progress value={progress} className="w-full" />
          <div className="text-sm text-gray-600 mt-1">
            {Math.round(progress)}% completo
          </div>
        </div>

        {/* Step Navigation */}
        <nav aria-label="Etapas do cadastro" className="mb-6">
          <div className="flex flex-wrap gap-2">
            {formSteps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(index)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  index === currentStep
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                    : index < currentStep
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
                aria-current={index === currentStep ? 'step' : undefined}
                aria-disabled={index > currentStep}
                disabled={index > currentStep}
              >
                <span>{step.icon}</span>
                <span className="hidden sm:inline">{step.title}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Error Alert */}
        {submitError && (
          <Alert className="mb-6 healthcare-context-emergency">
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        {/* Form Content */}
        <form onSubmit={handleSubmit} noValidate>
          <div ref={stepRef} className="mb-6">
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <AccessibilityButton
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              size="mobile-lg"
              className="min-h-[48px]"
            >
              ← Anterior
            </AccessibilityButton>

            {currentStep < formSteps.length - 1 ? (
              <AccessibilityButton
                type="button"
                onClick={nextStep}
                size="mobile-lg"
                className="min-h-[48px]"
              >
                Próximo →
              </AccessibilityButton>
            ) : (
              <AccessibilityButton
                type="submit"
                loading={isSubmitting}
                loadingText="Registrando..."
                size="mobile-lg"
                className="min-h-[48px] healthcare-context-success"
              >
                Finalizar Cadastro
              </AccessibilityButton>
            )}
          </div>
        </form>

        {/* Loading Overlay */}
        {isSubmitting && (
          <HealthcareFormLoading
            message="Registrando paciente..."
            submessage="Isso pode levar alguns segundos"
          />
        )}
      </div>
    </KeyboardNavigationProvider>
  )
}
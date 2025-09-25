import * as React from 'react'
import { useTranslation } from '@/lib/i18n/use-translation'
import { AccessibilityButton } from '@/components/ui/accessibility-button'
import { AccessibilityInput } from '@/components/ui/accessibility-input'
import { AccessibilityLabel } from '@/components/ui/accessibility-label'
import { HealthcareFormGroup } from '@/components/ui/healthcare-form-group'
import { KeyboardNavigationProvider, useKeyboardNavigation } from '@/components/ui/keyboard-navigation'
import { useScreenReaderAnnouncer, useFocusManagement } from '@/components/ui/screen-reader-announcer'
import { HealthcareLoading, HealthcareFormLoading } from '@/components/ui/healthcare-loading'
import { HealthcareFieldError } from '@/components/ui/healthcare-error-boundary'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

interface PatientData {
  personalInfo: {
    fullName: string
    cpf?: string
    dateOfBirth: string
    email?: string
    phone: string
  }
  address: {
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
  }
  emergencyContact: {
    name: string
    relationship: string
    phone: string
    email?: string
  }
  medicalHistory: {
    allergies?: string[]
    medications?: string[]
    conditions?: string[]
    previousTreatments?: string[]
    notes?: string
  }
  consent: {
    treatmentConsent: boolean
    dataSharingConsent: boolean
    marketingConsent: boolean
    emergencyContactConsent: boolean
  }
}

interface FormErrors {
  [key: string]: string
}

interface AccessiblePatientRegistrationProps {
  onSubmit: (data: PatientData) => Promise<void>
  onCancel?: () => void
  className?: string
}

export const AccessiblePatientRegistration: React.FC<AccessiblePatientRegistrationProps> = ({
  onSubmit,
  onCancel,
  className,
}) => {
  const { t, formatDate } = useTranslation()
  const { announce } = useScreenReaderAnnouncer()
  const { setFocus } = useFocusManagement()
  const { registerFocusable } = useKeyboardNavigation()

  const [currentStep, setCurrentStep] = React.useState(0)
  const [patientData, setPatientData] = React.useState<Partial<PatientData>>({})
  const [errors, setErrors] = React.useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)

  const formSteps = [
    {
      id: 'personal',
      title: t('forms.personalInfo'),
      description: 'Informações básicas do paciente',
      icon: '👤',
    },
    {
      id: 'address',
      title: t('forms.address'),
      description: 'Endereço residencial',
      icon: '🏠',
    },
    {
      id: 'emergency',
      title: t('healthcare.emergencyContact'),
      description: 'Contato para emergências',
      icon: '🆘',
    },
    {
      id: 'medical',
      title: t('medicalHistory.title'),
      description: 'Histórico médico importante',
      icon: '🏥',
    },
    {
      id: 'consent',
      title: t('lgpd.consentTitle'),
      description: 'Consentimentos LGPD',
      icon: '📋',
    },
    {
      id: 'review',
      title: 'Revisão',
      description: 'Revisão e confirmação',
      icon: '✅',
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

  // Form validation
  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {}

    switch (step) {
      case 0: // Personal Info
        if (!patientData.personalInfo?.fullName?.trim()) {
          newErrors['personalInfo.fullName'] = t('forms.required')
        }
        if (!patientData.personalInfo?.dateOfBirth) {
          newErrors['personalInfo.dateOfBirth'] = t('forms.required')
        }
        if (!patientData.personalInfo?.phone?.trim()) {
          newErrors['personalInfo.phone'] = t('forms.required')
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

  const handleFieldChange = (field: string, value: any) => {
    setPatientData(prev => {
      const [section, subField] = field.split('.')
      if (subField) {
        return {
          ...prev,
          [section]: {
            ...prev[section as keyof PatientData],
            [subField]: value,
          },
        }
      } else {
        return { ...prev, [field]: value }
      }
    })

    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
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

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      await onSubmit(patientData as PatientData)
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
                onChange={(e) => handleFieldChange('personalInfo.fullName', e.target.value)}
                error={errors['personalInfo.fullName']}
                helperText="Nome completo como aparece no documento"
                healthcareContext="personal"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AccessibilityInput
                  id="cpf"
                  label={t('forms.cpf')}
                  value={patientData.personalInfo?.cpf || ''}
                  onChange={(e) => handleFieldChange('personalInfo.cpf', e.target.value)}
                  error={errors['personalInfo.cpf']}
                  helperText="000.000.000-00"
                  healthcareContext="personal"
                />

                <AccessibilityInput
                  id="dateOfBirth"
                  label={t('forms.dateOfBirth')}
                  type="date"
                  required
                  value={patientData.personalInfo?.dateOfBirth || ''}
                  onChange={(e) => handleFieldChange('personalInfo.dateOfBirth', e.target.value)}
                  error={errors['personalInfo.dateOfBirth']}
                  healthcareContext="personal"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AccessibilityInput
                  id="email"
                  label={t('forms.email')}
                  type="email"
                  value={patientData.personalInfo?.email || ''}
                  onChange={(e) => handleFieldChange('personalInfo.email', e.target.value)}
                  error={errors['personalInfo.email']}
                  helperText="email@exemplo.com"
                  healthcareContext="personal"
                />

                <AccessibilityInput
                  id="phone"
                  label={t('forms.phone')}
                  type="tel"
                  required
                  value={patientData.personalInfo?.phone || ''}
                  onChange={(e) => handleFieldChange('personalInfo.phone', e.target.value)}
                  error={errors['personalInfo.phone']}
                  helperText="(11) 99999-9999"
                  healthcareContext="personal"
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
                    onChange={(e) => handleFieldChange('address.street', e.target.value)}
                    error={errors['address.street']}
                    healthcareContext="administrative"
                  />
                </div>
                <div>
                  <AccessibilityInput
                    id="number"
                    label={t('forms.number')}
                    required
                    value={patientData.address?.number || ''}
                    onChange={(e) => handleFieldChange('address.number', e.target.value)}
                    error={errors['address.number']}
                    healthcareContext="administrative"
                  />
                </div>
              </div>

              <AccessibilityInput
                id="complement"
                label={t('forms.complement')}
                value={patientData.address?.complement || ''}
                onChange={(e) => handleFieldChange('address.complement', e.target.value)}
                helperText="Apto, casa, etc."
                healthcareContext="administrative"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AccessibilityInput
                  id="neighborhood"
                  label={t('forms.neighborhood')}
                  required
                  value={patientData.address?.neighborhood || ''}
                  onChange={(e) => handleFieldChange('address.neighborhood', e.target.value)}
                  error={errors['address.neighborhood']}
                  healthcareContext="administrative"
                />

                <AccessibilityInput
                  id="city"
                  label={t('forms.city')}
                  required
                  value={patientData.address?.city || ''}
                  onChange={(e) => handleFieldChange('address.city', e.target.value)}
                  error={errors['address.city']}
                  healthcareContext="administrative"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <AccessibilityLabel htmlFor="state" required>
                    {t('forms.state')}
                  </AccessibilityLabel>
                  <Select
                    value={patientData.address?.state || ''}
                    onValueChange={(value) => handleFieldChange('address.state', value)}
                  >
                    <SelectTrigger className="w-full" ref={(el) => el && registerFocusable(el, 1)}>
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AC">Acre</SelectItem>
                      <SelectItem value="AL">Alagoas</SelectItem>
                      <SelectItem value="AP">Amapá</SelectItem>
                      <SelectItem value="AM">Amazonas</SelectItem>
                      <SelectItem value="BA">Bahia</SelectItem>
                      <SelectItem value="CE">Ceará</SelectItem>
                      <SelectItem value="DF">Distrito Federal</SelectItem>
                      <SelectItem value="ES">Espírito Santo</SelectItem>
                      <SelectItem value="GO">Goiás</SelectItem>
                      <SelectItem value="MA">Maranhão</SelectItem>
                      <SelectItem value="MT">Mato Grosso</SelectItem>
                      <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                      <SelectItem value="MG">Minas Gerais</SelectItem>
                      <SelectItem value="PA">Pará</SelectItem>
                      <SelectItem value="PB">Paraíba</SelectItem>
                      <SelectItem value="PR">Paraná</SelectItem>
                      <SelectItem value="PE">Pernambuco</SelectItem>
                      <SelectItem value="PI">Piauí</SelectItem>
                      <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                      <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                      <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                      <SelectItem value="RO">Rondônia</SelectItem>
                      <SelectItem value="RR">Roraima</SelectItem>
                      <SelectItem value="SC">Santa Catarina</SelectItem>
                      <SelectItem value="SP">São Paulo</SelectItem>
                      <SelectItem value="SE">Sergipe</SelectItem>
                      <SelectItem value="TO">Tocantins</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors['address.state'] && (
                    <HealthcareFieldError message={errors['address.state']} />
                  )}
                </div>

                <AccessibilityInput
                  id="zipCode"
                  label={t('forms.zipCode')}
                  required
                  value={patientData.address?.zipCode || ''}
                  onChange={(e) => handleFieldChange('address.zipCode', e.target.value)}
                  error={errors['address.zipCode']}
                  helperText="00000-000"
                  healthcareContext="administrative"
                />
              </div>
            </div>
          </HealthcareFormGroup>
        )

      // ... other steps would follow similar pattern

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
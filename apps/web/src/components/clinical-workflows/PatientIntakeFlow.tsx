/**
 * Patient Intake Flow Component
 * 
 * Fluxo de cadastro de pacientes otimizado para clínicas estéticas brasileiras
 * Com conformidade LGPD e acessibilidade WCAG 2.1 AA+
 * 
 * @component PatientIntakeFlow
 */

'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@neonpro/ui'
import { Button } from '@neonpro/ui'
import { Alert, AlertDescription } from '@neonpro/ui'
import { Badge } from '@neonpro/ui'
import { Progress } from '@neonpro/ui'
import { AccessibilityProvider } from '@neonpro/ui'
import { ScreenReaderAnnouncer } from '@neonpro/ui'
import { HealthcareFormGroup } from '@/components/ui/healthcare-form-group'
import { AccessibilityInput } from '@/components/ui/accessibility-input'
import { MobileHealthcareButton } from '@/components/ui/mobile-healthcare-button'

import { 
  PatientIntakeFlow, 
  PatientIntakeStep, 
  ClinicalWorkflowComponentProps,
  ClinicalWorkflowValidation 
} from './types'

import { PatientData, HealthcareContext, FormValidationResult } from '@/types/healthcare'

interface PatientIntakeFlowProps extends ClinicalWorkflowComponentProps {
  intakeFlow?: PatientIntakeFlow
  onStepComplete?: (stepIndex: number, data: Partial<PatientData>) => Promise<void>
  onIntakeComplete?: (intakeData: PatientData) => Promise<void>
  onIntakeCancel?: () => void
  validationLevel?: 'basic' | 'strict' | 'healthcare_critical'
}

// Form steps for Brazilian aesthetic clinic patient intake
const PATIENT_INTAKE_STEPS: PatientIntakeStep[] = [
  {
    id: 'personal_info',
    title: 'Informações Pessoais',
    description: 'Dados básicos do paciente',
    order: 1,
    required: true,
    estimatedDuration: 10,
    formFields: ['fullName', 'dateOfBirth', 'gender', 'phone', 'email'],
    assignedRole: 'recepcao'
  },
  {
    id: 'address',
    title: 'Endereço',
    description: 'Informações de localização',
    order: 2,
    required: true,
    estimatedDuration: 5,
    formFields: ['street', 'number', 'neighborhood', 'city', 'state', 'zipCode'],
    assignedRole: 'recepcao'
  },
  {
    id: 'emergency_contact',
    title: 'Contato de Emergência',
    description: 'Informações para emergências',
    order: 3,
    required: true,
    estimatedDuration: 3,
    formFields: ['emergencyContactName', 'emergencyContactRelationship', 'emergencyContactPhone'],
    assignedRole: 'recepcao'
  },
  {
    id: 'medical_history',
    title: 'Histórico Médico',
    description: 'Informações médicas importantes',
    order: 4,
    required: true,
    estimatedDuration: 15,
    formFields: ['allergies', 'medications', 'conditions', 'bloodType', 'height', 'weight'],
    assignedRole: 'enfermeiro'
  },
  {
    id: 'aesthetic_history',
    title: 'Histórico Estético',
    description: 'Procedimentos estéticos anteriores',
    order: 5,
    required: true,
    estimatedDuration: 10,
    formFields: ['previousTreatments', 'skinType', 'sensitivity', 'expectations'],
    assignedRole: 'esteticista'
  },
  {
    id: 'lgpd_consent',
    title: 'Consentimento LGPD',
    description: 'Autorização de uso de dados',
    order: 6,
    required: true,
    estimatedDuration: 5,
    formFields: ['treatmentConsent', 'dataSharingConsent', 'marketingConsent', 'dataRetentionPeriod'],
    assignedRole: 'coordenador_clinico'
  }
]

export const PatientIntakeFlow: React.FC<PatientIntakeFlowProps> = ({
  patientId,
  staffId,
  healthcareContext,
  className,
  intakeFlow,
  onStepComplete,
  onIntakeComplete,
  onIntakeCancel,
  validationLevel = 'healthcare_critical',
  onEmergencyAlert
}) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Partial<PatientData>>({})
  const [validation, setValidation] = useState<ClinicalWorkflowValidation>({
    isValid: false,
    errors: [],
    warnings: []
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOffline, setIsOffline] = useState(false)
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(0)

  // Monitor offline status for mobile clinical use
  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Calculate estimated time remaining
  useEffect(() => {
    const remainingSteps = PATIENT_INTAKE_STEPS.slice(currentStep)
    const totalTime = remainingSteps.reduce((sum, step) => sum + step.estimatedDuration, 0)
    setEstimatedTimeRemaining(totalTime)
  }, [currentStep])

  // Validate current step data
  const validateStep = useCallback((stepIndex: number, data: Partial<PatientData>): ClinicalWorkflowValidation => {
    const step = PATIENT_INTAKE_STEPS[stepIndex]
    const errors: any[] = []
    const warnings: any[] = []

    // Required field validation
    step.formFields.forEach(field => {
      const value = getFieldValue(data, field)
      
      if (!value && step.required) {
        errors.push({
          field,
          message: `Campo ${getFieldLabel(field)} é obrigatório`,
          severity: 'error' as const,
          code: 'REQUIRED_FIELD'
        })
      }

      // Brazilian-specific validation
      if (field === 'phone' && value) {
        const phonePattern = /^\([0-9]{2}\) [0-9]{4,5}-[0-9]{4}$/
        if (!phonePattern.test(value as string)) {
          errors.push({
            field,
            message: 'Telefone deve estar no formato (11) 99999-9999',
            severity: 'error' as const,
            code: 'INVALID_PHONE_FORMAT'
          })
        }
      }

      if (field === 'dateOfBirth' && value) {
        const birthDate = new Date(value as string)
        const age = new Date().getFullYear() - birthDate.getFullYear()
        
        if (age < 13 || age > 120) {
          errors.push({
            field,
            message: 'Idade deve estar entre 13 e 120 anos',
            severity: 'error' as const,
            code: 'INVALID_AGE'
          })
        }
      }
    })

    // Healthcare-specific validations for critical mode
    if (validationLevel === 'healthcare_critical') {
      if (step.id === 'medical_history') {
        if (!data.medicalHistory?.allergies?.length) {
          warnings.push({
            field: 'allergies',
            message: 'É importante registrar alergias conhecidas, mesmo que nenhuma',
            severity: 'warning' as const,
            code: 'MISSING_ALLERGIES_INFO'
          })
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }, [validationLevel])

  const getFieldValue = (data: Partial<PatientData>, field: string): any => {
    const fieldMap: Record<string, string> = {
      fullName: 'personalInfo.fullName',
      dateOfBirth: 'personalInfo.dateOfBirth',
      gender: 'personalInfo.gender',
      phone: 'personalInfo.phone',
      email: 'personalInfo.email',
      street: 'address.street',
      number: 'address.number',
      neighborhood: 'address.neighborhood',
      city: 'address.city',
      state: 'address.state',
      zipCode: 'address.zipCode',
      emergencyContactName: 'emergencyContact.name',
      emergencyContactRelationship: 'emergencyContact.relationship',
      emergencyContactPhone: 'emergencyContact.phone',
      allergies: 'medicalHistory.allergies',
      medications: 'medicalHistory.medications',
      conditions: 'medicalHistory.conditions',
      bloodType: 'medicalHistory.bloodType',
      height: 'medicalHistory.height',
      weight: 'medicalHistory.weight',
      previousTreatments: 'medicalHistory.previousTreatments'
    }

    const key = fieldMap[field] || field
    return key.split('.').reduce((obj: any, k: string) => obj?.[k], data)
  }

  const getFieldLabel = (field: string): string => {
    const labels: Record<string, string> = {
      fullName: 'Nome Completo',
      dateOfBirth: 'Data de Nascimento',
      gender: 'Gênero',
      phone: 'Telefone',
      email: 'E-mail',
      street: 'Rua',
      number: 'Número',
      neighborhood: 'Bairro',
      city: 'Cidade',
      state: 'Estado',
      zipCode: 'CEP',
      emergencyContactName: 'Nome do Contato',
      emergencyContactRelationship: 'Relação',
      emergencyContactPhone: 'Telefone do Contato',
      allergies: 'Alergias',
      medications: 'Medicamentos',
      conditions: 'Condições Médicas',
      bloodType: 'Tipo Sanguíneo',
      height: 'Altura',
      weight: 'Peso',
      previousTreatments: 'Tratamentos Anteriores'
    }

    return labels[field] || field
  }

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev }
      const fieldMap: Record<string, string> = {
        fullName: 'personalInfo.fullName',
        dateOfBirth: 'personalInfo.dateOfBirth',
        gender: 'personalInfo.gender',
        phone: 'personalInfo.phone',
        email: 'personalInfo.email',
        street: 'address.street',
        number: 'address.number',
        neighborhood: 'address.neighborhood',
        city: 'address.city',
        state: 'address.state',
        zipCode: 'address.zipCode',
        emergencyContactName: 'emergencyContact.name',
        emergencyContactRelationship: 'emergencyContact.relationship',
        emergencyContactPhone: 'emergencyContact.phone',
        allergies: 'medicalHistory.allergies',
        medications: 'medicalHistory.medications',
        conditions: 'medicalHistory.conditions',
        bloodType: 'medicalHistory.bloodType',
        height: 'medicalHistory.height',
        weight: 'medicalHistory.weight',
        previousTreatments: 'medicalHistory.previousTreatments'
      }

      const key = fieldMap[field] || field
      const keys = key.split('.')
      
      keys.reduce((obj: any, k: string, index: number) => {
        if (index === keys.length - 1) {
          if (value === '') {
            delete obj[k]
          } else {
            obj[k] = value
          }
        } else {
          obj[k] = obj[k] || {}
        }
        return obj[k]
      }, newData)

      return newData
    })
  }, [])

  const handleNextStep = useCallback(async () => {
    const stepValidation = validateStep(currentStep, formData)
    setValidation(stepValidation)

    if (!stepValidation.isValid) {
      return
    }

    try {
      setIsSubmitting(true)
      
      // Announce progress for screen readers
      ScreenReaderAnnouncer.announce(`Etapa ${currentStep + 1} concluída. Proxima etapa: ${PATIENT_INTAKE_STEPS[currentStep + 1]?.title || 'Conclusão'}`)

      if (onStepComplete) {
        await onStepComplete(currentStep, formData)
      }

      if (currentStep < PATIENT_INTAKE_STEPS.length - 1) {
        setCurrentStep(prev => prev + 1)
      } else {
        // Complete intake
        if (onIntakeComplete && formData.personalInfo && formData.address && formData.emergencyContact && formData.medicalHistory && formData.consent) {
          await onIntakeComplete(formData as PatientData)
        }
      }
    } catch (error) {
      console.error('Error completing step:', error)
      setValidation({
        isValid: false,
        errors: [{
          field: 'system',
          message: 'Erro ao salvar dados. Por favor, tente novamente.',
          severity: 'error' as const,
          code: 'SAVE_ERROR'
        }],
        warnings: []
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [currentStep, formData, validateStep, onStepComplete, onIntakeComplete])

  const handlePreviousStep = useCallback(() => {
    setCurrentStep(prev => Math.max(0, prev - 1))
  }, [])

  const handleCancel = useCallback(() => {
    if (onIntakeCancel) {
      onIntakeCancel()
    }
  }, [onIntakeCancel])

  const handleEmergency = useCallback(() => {
    if (onEmergencyAlert) {
      onEmergencyAlert({
        id: `emergency-${Date.now()}`,
        type: 'medical_emergency',
        severity: 'high',
        patientId,
        location: 'Recepção - Cadastro de Paciente',
        description: 'Emergência durante processo de cadastro de paciente',
        reportedBy: staffId,
        reportedAt: new Date().toISOString(),
        status: 'active',
        responseTeam: []
      })
    }
  }, [onEmergencyAlert, patientId, staffId])

  const progress = ((currentStep + 1) / PATIENT_INTAKE_STEPS.length) * 100
  const currentStepData = PATIENT_INTAKE_STEPS[currentStep]

  return (
    <AccessibilityProvider>
      <div className={`max-w-4xl mx-auto p-4 ${className}`}>
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">
                  Cadastro de Paciente - Clínica Estética
                </CardTitle>
                <p className="text-gray-600 mt-2">
                  Fluxo de cadastro otimizado com conformidade LGPD
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={isOffline ? "destructive" : "secondary"}>
                  {isOffline ? 'Offline' : 'Online'}
                </Badge>
                <MobileHealthcareButton
                  variant="emergency"
                  size="lg"
                  onClick={handleEmergency}
                  aria-label="Acionar emergência"
                >
                  Emergência
                </MobileHealthcareButton>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Progress */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">
                    Etapa {currentStep + 1} de {PATIENT_INTAKE_STEPS.length}
                  </span>
                  <span className="text-sm text-gray-600">
                    Tempo estimado: {estimatedTimeRemaining}min
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Current Step Info */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold text-lg">{currentStepData.title}</h3>
                <p className="text-gray-600">{currentStepData.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">
                    {currentStepData.estimatedDuration} min
                  </Badge>
                  {currentStepData.assignedRole && (
                    <Badge variant="secondary">
                      {currentStepData.assignedRole}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Validation Errors */}
        {validation.errors.length > 0 && (
          <Alert className="mb-4" variant="destructive">
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1">
                {validation.errors.map((error, index) => (
                  <li key={index}>{error.message}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Validation Warnings */}
        {validation.warnings.length > 0 && (
          <Alert className="mb-4" variant="warning">
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1">
                {validation.warnings.map((warning, index) => (
                  <li key={index}>{warning.message}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Form Content */}
        <Card>
          <CardContent className="p-6">
            <PatientIntakeStepForm
              step={currentStepData}
              formData={formData}
              onInputChange={handleInputChange}
              validation={validation}
              healthcareContext={healthcareContext}
            />
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handlePreviousStep}
            disabled={currentStep === 0}
          >
            Anterior
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
            >
              Cancelar
            </Button>
            
            <Button
              onClick={handleNextStep}
              disabled={isSubmitting || !validation.isValid}
              loading={isSubmitting}
            >
              {currentStep === PATIENT_INTAKE_STEPS.length - 1 ? 'Finalizar Cadastro' : 'Próxima Etapa'}
            </Button>
          </div>
        </div>
      </div>
    </AccessibilityProvider>
  )
}

// Internal component for rendering individual step forms
const PatientIntakeStepForm: React.FC<{
  step: PatientIntakeStep
  formData: Partial<PatientData>
  onInputChange: (field: string, value: any) => void
  validation: ClinicalWorkflowValidation
  healthcareContext: HealthcareContext
}> = ({ step, formData, onInputChange, validation, healthcareContext }) => {
  const getFieldError = (field: string) => {
    return validation.errors.find(error => error.field === field)?.message
  }

  const renderFormField = (field: string) => {
    const error = getFieldError(field)
    const value = getFieldValue(formData, field)
    const label = getFieldLabel(field)

    switch (field) {
      case 'gender':
        return (
          <HealthcareFormGroup key={field} label={label} context={healthcareContext}>
            <select
              className="w-full p-2 border rounded-md"
              value={value || ''}
              onChange={(e) => onInputChange(field, e.target.value)}
              aria-invalid={!!error}
            >
              <option value="">Selecione...</option>
              <option value="masculino">Masculino</option>
              <option value="feminino">Feminino</option>
              <option value="outro">Outro</option>
              <option value="nao_informado">Não informado</option>
            </select>
            {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
          </HealthcareFormGroup>
        )

      case 'state':
        return (
          <HealthcareFormGroup key={field} label={label} context={healthcareContext}>
            <select
              className="w-full p-2 border rounded-md"
              value={value || ''}
              onChange={(e) => onInputChange(field, e.target.value)}
              aria-invalid={!!error}
            >
              <option value="">Selecione...</option>
              <option value="AC">Acre</option>
              <option value="AL">Alagoas</option>
              <option value="AP">Amapá</option>
              <option value="AM">Amazonas</option>
              <option value="BA">Bahia</option>
              <option value="CE">Ceará</option>
              <option value="DF">Distrito Federal</option>
              <option value="ES">Espírito Santo</option>
              <option value="GO">Goiás</option>
              <option value="MA">Maranhão</option>
              <option value="MT">Mato Grosso</option>
              <option value="MS">Mato Grosso do Sul</option>
              <option value="MG">Minas Gerais</option>
              <option value="PA">Pará</option>
              <option value="PB">Paraíba</option>
              <option value="PR">Paraná</option>
              <option value="PE">Pernambuco</option>
              <option value="PI">Piauí</option>
              <option value="RJ">Rio de Janeiro</option>
              <option value="RN">Rio Grande do Norte</option>
              <option value="RS">Rio Grande do Sul</option>
              <option value="RO">Rondônia</option>
              <option value="RR">Roraima</option>
              <option value="SC">Santa Catarina</option>
              <option value="SP">São Paulo</option>
              <option value="SE">Sergipe</option>
              <option value="TO">Tocantins</option>
            </select>
            {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
          </HealthcareFormGroup>
        )

      case 'allergies':
      case 'medications':
      case 'conditions':
      case 'previousTreatments':
        return (
          <HealthcareFormGroup key={field} label={label} context={healthcareContext}>
            <textarea
              className="w-full p-2 border rounded-md"
              rows={3}
              value={Array.isArray(value) ? value.join(', ') : value || ''}
              onChange={(e) => onInputChange(field, e.target.value.split(',').map(item => item.trim()))}
              placeholder={`Informe ${label.toLowerCase()} separados por vírgula`}
              aria-invalid={!!error}
            />
            {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
          </HealthcareFormGroup>
        )

      case 'dateOfBirth':
        return (
          <HealthcareFormGroup key={field} label={label} context={healthcareContext}>
            <AccessibilityInput
              type="date"
              value={value || ''}
              onChange={(e) => onInputChange(field, e.target.value)}
              aria-invalid={!!error}
              error={error}
              healthcareContext={healthcareContext}
            />
            {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
          </HealthcareFormGroup>
        )

      default:
        return (
          <HealthcareFormGroup key={field} label={label} context={healthcareContext}>
            <AccessibilityInput
              type={field.includes('email') ? 'email' : field.includes('phone') ? 'tel' : 'text'}
              value={value || ''}
              onChange={(e) => onInputChange(field, e.target.value)}
              placeholder={label}
              aria-invalid={!!error}
              error={error}
              healthcareContext={healthcareContext}
            />
            {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
          </HealthcareFormGroup>
        )
    }
  }

  return (
    <div className="space-y-4">
      {step.formFields.map(renderFormField)}
    </div>
  )
}

// Helper functions
const getFieldValue = (data: Partial<PatientData>, field: string): any => {
  const fieldMap: Record<string, string> = {
    fullName: 'personalInfo.fullName',
    dateOfBirth: 'personalInfo.dateOfBirth',
    gender: 'personalInfo.gender',
    phone: 'personalInfo.phone',
    email: 'personalInfo.email',
    street: 'address.street',
    number: 'address.number',
    neighborhood: 'address.neighborhood',
    city: 'address.city',
    state: 'address.state',
    zipCode: 'address.zipCode',
    emergencyContactName: 'emergencyContact.name',
    emergencyContactRelationship: 'emergencyContact.relationship',
    emergencyContactPhone: 'emergencyContact.phone',
    allergies: 'medicalHistory.allergies',
    medications: 'medicalHistory.medications',
    conditions: 'medicalHistory.conditions',
    bloodType: 'medicalHistory.bloodType',
    height: 'medicalHistory.height',
    weight: 'medicalHistory.weight',
    previousTreatments: 'medicalHistory.previousTreatments'
  }

  const key = fieldMap[field] || field
  return key.split('.').reduce((obj: any, k: string) => obj?.[k], data)
}

const getFieldLabel = (field: string): string => {
  const labels: Record<string, string> = {
    fullName: 'Nome Completo',
    dateOfBirth: 'Data de Nascimento',
    gender: 'Gênero',
    phone: 'Telefone',
    email: 'E-mail',
    street: 'Rua',
    number: 'Número',
    neighborhood: 'Bairro',
    city: 'Cidade',
    state: 'Estado',
    zipCode: 'CEP',
    emergencyContactName: 'Nome do Contato',
    emergencyContactRelationship: 'Relação',
    emergencyContactPhone: 'Telefone do Contato',
    allergies: 'Alergias',
    medications: 'Medicamentos',
    conditions: 'Condições Médicas',
    bloodType: 'Tipo Sanguíneo',
    height: 'Altura',
    weight: 'Peso',
    previousTreatments: 'Tratamentos Anteriores'
  }

  return labels[field] || field
}

export default PatientIntakeFlow
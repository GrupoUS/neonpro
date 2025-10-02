/**
 * Enhanced Client Registration Agent with CopilotKit Integration
 *
 * Intelligent client registration workflow with AI assistance,
 * document OCR processing, and LGPD compliance for Brazilian healthcare.
 */

import { Alert, AlertDescription } from '@/components/ui/alert.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Label } from '@/components/ui/label.tsx'
import { Progress } from '@/components/ui/progress.tsx'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx'
import { Textarea } from '@/components/ui/textarea.tsx'
import { createClient } from '@/integrations/supabase/client'
import { useCoAgent, useCopilotAction } from '@copilotkit/react-core'
import {
  AlertCircle,
  Brain,
  CheckCircle,
  FileText,
  Heart,
  MessageSquare,
  Shield,
  Upload,
  User,
} from 'lucide-react'
import React, { useCallback, useState } from 'react'

// Types
interface ClientRegistrationData {
  personalInfo: {
    fullName: string
    cpf?: string
    dateOfBirth: string
    email?: string
    phone?: string
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
  preferences: {
    communicationChannel: 'whatsapp' | 'sms' | 'email'
    language: 'pt-BR' | 'en-US'
    timezone: string
    notificationPreferences: {
      appointments: boolean
      promotions: boolean
      reminders: boolean
    }
  }
  documents: {
    idCard?: File
    medicalRecord?: File
    consentForm?: File
    insuranceCard?: File
  }
  consent: {
    treatmentConsent: boolean
    dataSharingConsent: boolean
    marketingConsent: boolean
    emergencyContactConsent: boolean
    consentDate: string
  }
}

interface AISuggestion {
  field: string
  value: any
  confidence: number
  reason: string
}

interface ValidationMessage {
  field: string
  message: string
  type: 'error' | 'warning' | 'info'
}

interface ClientRegistrationAgentProps {
  onSuccess?: (clientId: string) => void
  onError?: (error: string) => void
}

export const ClientRegistrationAgent: React.FC<
  ClientRegistrationAgentProps
> = ({ onSuccess, onError }) => {
  // CopilotKit integration
  const { state, setState } = useCoAgent({
    name: 'clientRegistrationAgent',
    initialState: {
      currentStep: 0,
      registrationData: {} as Partial<ClientRegistrationData>,
      aiSuggestions: [] as AISuggestion[],
      validationMessages: [] as ValidationMessage[],
      processingStatus: 'idle',
      ocrResults: {},
      consentStatus: {},
    },
  })

  const copilotAction = useCopilotAction({
    name: 'analyzeClientData',
    description: 'Analyze client data and provide suggestions',
    parameters: [
      { name: 'field', type: 'string', description: 'Field being analyzed' },
      { name: 'value', type: 'any', description: 'Value to analyze' },
      { name: 'context', type: 'object', description: 'Context for analysis' },
    ],
    handler: async ({ field: _field, value: _value, context: _context }) => {
      // AI-powered analysis will be handled by the backend
      return { analyzed: true }
    },
  })

  const [currentStep, setCurrentStep] = useState(0)
  const [registrationData, setRegistrationData] = useState<
    Partial<ClientRegistrationData>
  >({})
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([])
  const [validationMessages, setValidationMessages] = useState<
    ValidationMessage[]
  >([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [ocrProcessing, setOcrProcessing] = useState(false)

  const supabase = createClient()

  // Form steps
  const formSteps = [
    {
      id: 'personal',
      title: 'Dados Pessoais',
      icon: User,
      description: 'Informações básicas do cliente',
    },
    {
      id: 'address',
      title: 'Endereço',
      icon: FileText,
      description: 'Endereço residencial',
    },
    {
      id: 'emergency',
      title: 'Contato Emergência',
      icon: MessageSquare,
      description: 'Contato para emergências',
    },
    {
      id: 'medical',
      title: 'Histórico Médico',
      icon: Heart,
      description: 'Informações médicas importantes',
    },
    {
      id: 'documents',
      title: 'Documentos',
      icon: Upload,
      description: 'Upload e OCR de documentos',
    },
    {
      id: 'consent',
      title: 'Consentimentos',
      icon: Shield,
      description: 'Consentimentos LGPD',
    },
    {
      id: 'review',
      title: 'Revisão',
      icon: CheckCircle,
      description: 'Revisão e confirmação',
    },
  ]

  // Update CopilotKit state
  const updateAgentState = useCallback(
    (updates: Partial<typeof state>) => {
      setState(prev => ({ ...prev, ...updates }))
    },
    [setState],
  )

  // Handle field changes with AI analysis
  const handleFieldChange = async (
    field: string,
    value: any,
    context?: any,
  ) => {
    const newData = { ...registrationData, [field]: value }
    setRegistrationData(newData)

    // Update CopilotKit state
    updateAgentState({
      registrationData: newData,
    })

    // Trigger AI analysis
    try {
      await copilotAction.execute({
        field,
        value,
        context: { ...context, fullData: newData },
      })
    } catch (error) {
      console.warn('AI analysis failed:', error)
    }
  }

  // Document upload with OCR processing
  const handleDocumentUpload = async (
    documentType: keyof ClientRegistrationData['documents'],
    _file: File,
  ) => {
    setIsProcessing(true)
    setOcrProcessing(true)

    try {
      // Upload to Supabase Storage
      const fileName = `${Date.now()}_${file.name}`
      const { data: _data, error } = await supabase.storage
        .from('client-documents')
        .upload(fileName, file, {
          onUploadProgress: progress => {
            setUploadProgress((progress.loaded / progress.total) * 100)
          },
        })

      if (error) throw error

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('client-documents')
        .getPublicUrl(fileName)

      // Process OCR (simulated - would call backend service)
      const ocrResult = await processDocumentOCR(
        documentType,
        urlData.publicUrl,
        file,
      )

      // Update state with OCR results
      const updatedDocuments = {
        ...registrationData.documents,
        [documentType]: file,
      }

      setRegistrationData(prev => ({
        ...prev,
        documents: updatedDocuments,
      }))

      // Update CopilotKit state
      updateAgentState({
        registrationData: { ...registrationData, documents: updatedDocuments },
        ocrResults: { ...state.ocrResults, [documentType]: ocrResult },
      })

      // Auto-fill fields based on OCR results
      if (ocrResult.extractedFields) {
        await autoFillFromOCR(ocrResult.extractedFields)
      }
    } catch (error) {
      console.error('Document upload failed:', error)
      setValidationMessages(prev => [
        ...prev,
        {
          field: 'documents',
          message: `Erro no upload do documento: ${error}`,
          type: 'error',
        },
      ])
    } finally {
      setIsProcessing(false)
      setOcrProcessing(false)
      setUploadProgress(0)
    }
  }

  // Simulated OCR processing
  const processDocumentOCR = async (
    documentType: string,
    fileUrl: string,
    _file: File,
  ) => {
    // In real implementation, this would call the backend OCR service
    await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate processing

    const mockOCRResult = {
      documentType,
      fileUrl,
      extractedFields: documentType === 'idCard'
        ? {
          fullName: 'Nome Extraído do Documento',
          cpf: '123.456.789-00',
          dateOfBirth: '1990-01-01',
        }
        : {},
      confidence: 0.95,
      processingTime: 2000,
    }

    return mockOCRResult
  }

  // Auto-fill form fields from OCR results
  const autoFillFromOCR = async (extractedFields: Record<string, any>) => {
    const updates: Partial<ClientRegistrationData> = {}
    const suggestions: AISuggestion[] = []

    Object.entries(extractedFields).forEach(([field, value]) => {
      if (value) {
        const fieldPath = field.split('.')
        if (fieldPath[0] === 'personalInfo') {
          updates.personalInfo = {
            ...updates.personalInfo,
            [fieldPath[1]]: value,
          }
          suggestions.push({
            field: `personalInfo.${fieldPath[1]}`,
            value,
            confidence: 0.9,
            reason: `Extraído automaticamente via OCR do documento`,
          })
        }
      }
    })

    if (Object.keys(updates).length > 0) {
      setRegistrationData(prev => ({
        ...prev,
        ...updates,
      }))

      setAiSuggestions(prev => [...prev, ...suggestions])

      // Update CopilotKit state
      updateAgentState({
        registrationData: { ...registrationData, ...updates },
        aiSuggestions: [...aiSuggestions, ...suggestions],
      })
    }
  }

  // Validate current step
  const validateStep = (step: number): boolean => {
    const errors: ValidationMessage[] = []

    switch (step) {
      case 0: // Personal Info
        if (!registrationData.personalInfo?.fullName) {
          errors.push({
            field: 'personalInfo.fullName',
            message: 'Nome completo é obrigatório',
            type: 'error',
          })
        }
        if (!registrationData.personalInfo?.dateOfBirth) {
          errors.push({
            field: 'personalInfo.dateOfBirth',
            message: 'Data de nascimento é obrigatória',
            type: 'error',
          })
        }
        break

      case 1: // Address
        if (!registrationData.address?.street) {
          errors.push({
            field: 'address.street',
            message: 'Rua é obrigatória',
            type: 'error',
          })
        }
        break

      case 2: // Emergency Contact
        if (!registrationData.emergencyContact?.name) {
          errors.push({
            field: 'emergencyContact.name',
            message: 'Nome do contato de emergência é obrigatório',
            type: 'error',
          })
        }
        break

      case 5: // Consent
        if (!registrationData.consent?.treatmentConsent) {
          errors.push({
            field: 'consent.treatmentConsent',
            message: 'Consentimento de tratamento é obrigatório',
            type: 'error',
          })
        }
        if (!registrationData.consent?.dataSharingConsent) {
          errors.push({
            field: 'consent.dataSharingConsent',
            message: 'Consentimento de compartilhamento de dados é obrigatório',
            type: 'error',
          })
        }
        break
    }

    setValidationMessages(errors)
    updateAgentState({ validationMessages: errors })

    return errors.length === 0
  }

  // Handle step navigation
  const nextStep = () => {
    if (validateStep(currentStep)) {
      const next = currentStep + 1
      setCurrentStep(next)
      updateAgentState({ currentStep: next })
    }
  }

  const prevStep = () => {
    const prev = Math.max(0, currentStep - 1)
    setCurrentStep(prev)
    updateAgentState({ currentStep: prev })
  }

  // Submit registration
  const handleSubmit = async () => {
    setIsProcessing(true)

    try {
      // Prepare data for submission
      const submissionData = {
        ...registrationData,
        consent: {
          ...registrationData.consent,
          consentDate: new Date().toISOString(),
          ipAddress: '127.0.0.1', // Would get from actual client
          userAgent: navigator.userAgent,
        },
      }

      // Submit to backend (simulated)
      const response = await submitClientRegistration(submissionData)

      if (response.success) {
        onSuccess?.(response.clientId)
        updateAgentState({ processingStatus: 'completed' })
      } else {
        onError?.(response.error)
        updateAgentState({ processingStatus: 'error' })
      }
    } catch (error) {
      console.error('Registration failed:', error)
      onError?.(error instanceof Error ? error.message : 'Erro no registro')
      updateAgentState({ processingStatus: 'error' })
    } finally {
      setIsProcessing(false)
    }
  }

  // Simulated backend submission
  const submitClientRegistration = async (
    _data: Partial<ClientRegistrationData>,
  ) => {
    // In real implementation, this would call the enhanced client agent service
    await new Promise(resolve => setTimeout(resolve, 2000))

    return {
      success: true,
      clientId: 'generated-client-id',
      message: 'Cliente registrado com sucesso',
    }
  }

  // Accept AI suggestion
  const acceptSuggestion = (suggestion: AISuggestion) => {
    const fieldPath = suggestion.field.split('.')
    const field = fieldPath[0]
    const subField = fieldPath[1]

    if (subField) {
      setRegistrationData(prev => ({
        ...prev,
        [field]: {
          ...prev[field as keyof ClientRegistrationData],
          [subField]: suggestion.value,
        },
      }))
    } else {
      setRegistrationData(prev => ({
        ...prev,
        [field]: suggestion.value,
      }))
    }

    // Remove suggestion
    setAiSuggestions(prev => prev.filter(s => s.field !== suggestion.field))
  }

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Personal Info
        return (
          <div className='space-y-4'>
            <div>
              <Label htmlFor='fullName'>Nome Completo *</Label>
              <Input
                id='fullName'
                value={registrationData.personalInfo?.fullName || ''}
                onChange={e => handleFieldChange('personalInfo.fullName', e.target.value)}
                placeholder='Nome completo do cliente'
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='cpf'>CPF</Label>
                <Input
                  id='cpf'
                  value={registrationData.personalInfo?.cpf || ''}
                  onChange={e => handleFieldChange('personalInfo.cpf', e.target.value)}
                  placeholder='000.000.000-00'
                />
              </div>

              <div>
                <Label htmlFor='dateOfBirth'>Data de Nascimento *</Label>
                <Input
                  id='dateOfBirth'
                  type='date'
                  value={registrationData.personalInfo?.dateOfBirth || ''}
                  onChange={e =>
                    handleFieldChange(
                      'personalInfo.dateOfBirth',
                      e.target.value,
                    )}
                />
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='email'>Email</Label>
                <Input
                  id='email'
                  type='email'
                  value={registrationData.personalInfo?.email || ''}
                  onChange={e => handleFieldChange('personalInfo.email', e.target.value)}
                  placeholder='email@exemplo.com'
                />
              </div>

              <div>
                <Label htmlFor='phone'>Telefone</Label>
                <Input
                  id='phone'
                  value={registrationData.personalInfo?.phone || ''}
                  onChange={e => handleFieldChange('personalInfo.phone', e.target.value)}
                  placeholder='(11) 99999-9999'
                />
              </div>
            </div>
          </div>
        )

      case 1: // Address
        return (
          <div className='space-y-4'>
            <div className='grid grid-cols-3 gap-4'>
              <div className='col-span-2'>
                <Label htmlFor='street'>Rua *</Label>
                <Input
                  id='street'
                  value={registrationData.address?.street || ''}
                  onChange={e => handleFieldChange('address.street', e.target.value)}
                  placeholder='Nome da rua'
                />
              </div>

              <div>
                <Label htmlFor='number'>Número *</Label>
                <Input
                  id='number'
                  value={registrationData.address?.number || ''}
                  onChange={e => handleFieldChange('address.number', e.target.value)}
                  placeholder='123'
                />
              </div>
            </div>

            <div>
              <Label htmlFor='complement'>Complemento</Label>
              <Input
                id='complement'
                value={registrationData.address?.complement || ''}
                onChange={e => handleFieldChange('address.complement', e.target.value)}
                placeholder='Apto 123'
              />
            </div>

            <div>
              <Label htmlFor='neighborhood'>Bairro *</Label>
              <Input
                id='neighborhood'
                value={registrationData.address?.neighborhood || ''}
                onChange={e => handleFieldChange('address.neighborhood', e.target.value)}
                placeholder='Bairro'
              />
            </div>

            <div className='grid grid-cols-3 gap-4'>
              <div>
                <Label htmlFor='city'>Cidade *</Label>
                <Input
                  id='city'
                  value={registrationData.address?.city || ''}
                  onChange={e => handleFieldChange('address.city', e.target.value)}
                  placeholder='São Paulo'
                />
              </div>

              <div>
                <Label htmlFor='state'>Estado *</Label>
                <Select
                  value={registrationData.address?.state || ''}
                  onValueChange={value => handleFieldChange('address.state', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='UF' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='AC'>AC</SelectItem>
                    <SelectItem value='AL'>AL</SelectItem>
                    <SelectItem value='AP'>AP</SelectItem>
                    <SelectItem value='AM'>AM</SelectItem>
                    <SelectItem value='BA'>BA</SelectItem>
                    <SelectItem value='CE'>CE</SelectItem>
                    <SelectItem value='DF'>DF</SelectItem>
                    <SelectItem value='ES'>ES</SelectItem>
                    <SelectItem value='GO'>GO</SelectItem>
                    <SelectItem value='MA'>MA</SelectItem>
                    <SelectItem value='MT'>MT</SelectItem>
                    <SelectItem value='MS'>MS</SelectItem>
                    <SelectItem value='MG'>MG</SelectItem>
                    <SelectItem value='PA'>PA</SelectItem>
                    <SelectItem value='PB'>PB</SelectItem>
                    <SelectItem value='PR'>PR</SelectItem>
                    <SelectItem value='PE'>PE</SelectItem>
                    <SelectItem value='PI'>PI</SelectItem>
                    <SelectItem value='RJ'>RJ</SelectItem>
                    <SelectItem value='RN'>RN</SelectItem>
                    <SelectItem value='RS'>RS</SelectItem>
                    <SelectItem value='RO'>RO</SelectItem>
                    <SelectItem value='RR'>RR</SelectItem>
                    <SelectItem value='SC'>SC</SelectItem>
                    <SelectItem value='SP'>SP</SelectItem>
                    <SelectItem value='SE'>SE</SelectItem>
                    <SelectItem value='TO'>TO</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor='zipCode'>CEP *</Label>
                <Input
                  id='zipCode'
                  value={registrationData.address?.zipCode || ''}
                  onChange={e => handleFieldChange('address.zipCode', e.target.value)}
                  placeholder='00000-000'
                />
              </div>
            </div>
          </div>
        )

      case 2: // Emergency Contact
        return (
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='emergencyName'>Nome do Contato *</Label>
                <Input
                  id='emergencyName'
                  value={registrationData.emergencyContact?.name || ''}
                  onChange={e => handleFieldChange('emergencyContact.name', e.target.value)}
                  placeholder='Nome completo'
                />
              </div>

              <div>
                <Label htmlFor='emergencyRelationship'>Relação *</Label>
                <Input
                  id='emergencyRelationship'
                  value={registrationData.emergencyContact?.relationship || ''}
                  onChange={e =>
                    handleFieldChange(
                      'emergencyContact.relationship',
                      e.target.value,
                    )}
                  placeholder='Familiar, amigo, etc.'
                />
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='emergencyPhone'>Telefone *</Label>
                <Input
                  id='emergencyPhone'
                  value={registrationData.emergencyContact?.phone || ''}
                  onChange={e => handleFieldChange('emergencyContact.phone', e.target.value)}
                  placeholder='(11) 99999-9999'
                />
              </div>

              <div>
                <Label htmlFor='emergencyEmail'>Email</Label>
                <Input
                  id='emergencyEmail'
                  type='email'
                  value={registrationData.emergencyContact?.email || ''}
                  onChange={e => handleFieldChange('emergencyContact.email', e.target.value)}
                  placeholder='email@exemplo.com'
                />
              </div>
            </div>
          </div>
        )

      case 3: // Medical History
        return (
          <div className='space-y-4'>
            <div>
              <Label htmlFor='allergies'>Alergias</Label>
              <Textarea
                id='allergies'
                value={registrationData.medicalHistory?.allergies?.join(', ') || ''}
                onChange={e =>
                  handleFieldChange(
                    'medicalHistory.allergies',
                    e.target.value.split(',').map(s => s.trim()),
                  )}
                placeholder='Liste as alergias separadas por vírgula'
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor='medications'>Medicamentos em Uso</Label>
              <Textarea
                id='medications'
                value={registrationData.medicalHistory?.medications?.join(', ') || ''}
                onChange={e =>
                  handleFieldChange(
                    'medicalHistory.medications',
                    e.target.value.split(',').map(s => s.trim()),
                  )}
                placeholder='Liste os medicamentos separados por vírgula'
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor='conditions'>Condições Médicas</Label>
              <Textarea
                id='conditions'
                value={registrationData.medicalHistory?.conditions?.join(', ') || ''}
                onChange={e =>
                  handleFieldChange(
                    'medicalHistory.conditions',
                    e.target.value.split(',').map(s => s.trim()),
                  )}
                placeholder='Liste as condições médicas separadas por vírgula'
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor='previousTreatments'>Tratamentos Anteriores</Label>
              <Textarea
                id='previousTreatments'
                value={registrationData.medicalHistory?.previousTreatments?.join(
                  ', ',
                ) || ''}
                onChange={e =>
                  handleFieldChange(
                    'medicalHistory.previousTreatments',
                    e.target.value.split(',').map(s => s.trim()),
                  )}
                placeholder='Liste os tratamentos anteriores separados por vírgula'
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor='medicalNotes'>Observações Médicas</Label>
              <Textarea
                id='medicalNotes'
                value={registrationData.medicalHistory?.notes || ''}
                onChange={e => handleFieldChange('medicalHistory.notes', e.target.value)}
                placeholder='Observações importantes sobre o histórico médico'
                rows={4}
              />
            </div>
          </div>
        )

      case 4: // Documents
        return (
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <Card>
                <CardHeader>
                  <CardTitle className='text-sm'>
                    Documento de Identidade
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    type='file'
                    accept='image/*,.pdf'
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) handleDocumentUpload('idCard', file)
                    }}
                  />
                  {registrationData.documents?.idCard && (
                    <div className='mt-2'>
                      <Badge variant='outline'>Upload Completo</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className='text-sm'>Histórico Médico</CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    type='file'
                    accept='image/*,.pdf'
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) handleDocumentUpload('medicalRecord', file)
                    }}
                  />
                  {registrationData.documents?.medicalRecord && (
                    <div className='mt-2'>
                      <Badge variant='outline'>Upload Completo</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <Card>
                <CardHeader>
                  <CardTitle className='text-sm'>
                    Termo de Consentimento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    type='file'
                    accept='image/*,.pdf'
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) handleDocumentUpload('consentForm', file)
                    }}
                  />
                  {registrationData.documents?.consentForm && (
                    <div className='mt-2'>
                      <Badge variant='outline'>Upload Completo</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className='text-sm'>
                    Carteirinha de Convênio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    type='file'
                    accept='image/*,.pdf'
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) handleDocumentUpload('insuranceCard', file)
                    }}
                  />
                  {registrationData.documents?.insuranceCard && (
                    <div className='mt-2'>
                      <Badge variant='outline'>Upload Completo</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {ocrProcessing && (
              <div className='space-y-2'>
                <Label>Processando OCR...</Label>
                <Progress value={uploadProgress} className='w-full' />
              </div>
            )}
          </div>
        )

      case 5: // Consent
        return (
          <div className='space-y-4'>
            <Alert>
              <Shield className='h-4 w-4' />
              <AlertDescription>
                De acordo com a Lei Geral de Proteção de Dados (LGPD), necessitamos do seu
                consentimento para o tratamento dos seus dados.
              </AlertDescription>
            </Alert>

            <div className='space-y-3'>
              <div className='flex items-start space-x-2'>
                <input
                  type='checkbox'
                  id='treatmentConsent'
                  checked={registrationData.consent?.treatmentConsent || false}
                  onChange={e =>
                    handleFieldChange(
                      'consent.treatmentConsent',
                      e.target.checked,
                    )}
                  className='mt-1'
                />
                <label htmlFor='treatmentConsent' className='text-sm'>
                  <strong>Consentimento para Tratamento *</strong>
                  <br />
                  Autorizo o tratamento de meus dados para fins de tratamento médico e
                  acompanhamento de saúde.
                </label>
              </div>

              <div className='flex items-start space-x-2'>
                <input
                  type='checkbox'
                  id='dataSharingConsent'
                  checked={registrationData.consent?.dataSharingConsent || false}
                  onChange={e =>
                    handleFieldChange(
                      'consent.dataSharingConsent',
                      e.target.checked,
                    )}
                  className='mt-1'
                />
                <label htmlFor='dataSharingConsent' className='text-sm'>
                  <strong>Compartilhamento de Dados *</strong>
                  <br />
                  Autorizo o compartilhamento de meus dados com profissionais de saúde envolvidos no
                  meu tratamento.
                </label>
              </div>

              <div className='flex items-start space-x-2'>
                <input
                  type='checkbox'
                  id='marketingConsent'
                  checked={registrationData.consent?.marketingConsent || false}
                  onChange={e =>
                    handleFieldChange(
                      'consent.marketingConsent',
                      e.target.checked,
                    )}
                  className='mt-1'
                />
                <label htmlFor='marketingConsent' className='text-sm'>
                  <strong>Comunicação Marketing</strong>
                  <br />
                  Autorizo o envio de comunicações sobre serviços e promoções.
                </label>
              </div>

              <div className='flex items-start space-x-2'>
                <input
                  type='checkbox'
                  id='emergencyContactConsent'
                  checked={registrationData.consent?.emergencyContactConsent || false}
                  onChange={e =>
                    handleFieldChange(
                      'consent.emergencyContactConsent',
                      e.target.checked,
                    )}
                  className='mt-1'
                />
                <label htmlFor='emergencyContactConsent' className='text-sm'>
                  <strong>Contato de Emergência</strong>
                  <br />
                  Autorizo a utilização do contato de emergência em casos necessários.
                </label>
              </div>
            </div>
          </div>
        )

      case 6: // Review
        return (
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>Revisão dos Dados</h3>

            <Tabs defaultValue='personal' className='w-full'>
              <TabsList className='grid w-full grid-cols-4'>
                <TabsTrigger value='personal'>Pessoais</TabsTrigger>
                <TabsTrigger value='address'>Endereço</TabsTrigger>
                <TabsTrigger value='medical'>Médico</TabsTrigger>
                <TabsTrigger value='consent'>Consentimentos</TabsTrigger>
              </TabsList>

              <TabsContent value='personal' className='space-y-2'>
                <Card>
                  <CardContent className='pt-4'>
                    <div className='space-y-2 text-sm'>
                      <div>
                        <strong>Nome:</strong> {registrationData.personalInfo?.fullName}
                      </div>
                      <div>
                        <strong>CPF:</strong> {registrationData.personalInfo?.cpf}
                      </div>
                      <div>
                        <strong>Data Nasc:</strong> {registrationData.personalInfo?.dateOfBirth}
                      </div>
                      <div>
                        <strong>Email:</strong> {registrationData.personalInfo?.email}
                      </div>
                      <div>
                        <strong>Telefone:</strong> {registrationData.personalInfo?.phone}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value='address' className='space-y-2'>
                <Card>
                  <CardContent className='pt-4'>
                    <div className='space-y-2 text-sm'>
                      <div>
                        <strong>Endereço:</strong> {registrationData.address?.street},{' '}
                        {registrationData.address?.number}
                      </div>
                      {registrationData.address?.complement && (
                        <div>
                          <strong>Complemento:</strong> {registrationData.address?.complement}
                        </div>
                      )}
                      <div>
                        <strong>Bairro:</strong> {registrationData.address?.neighborhood}
                      </div>
                      <div>
                        <strong>Cidade:</strong> {registrationData.address?.city} -{' '}
                        {registrationData.address?.state}
                      </div>
                      <div>
                        <strong>CEP:</strong> {registrationData.address?.zipCode}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value='medical' className='space-y-2'>
                <Card>
                  <CardContent className='pt-4'>
                    <div className='space-y-2 text-sm'>
                      {registrationData.medicalHistory?.allergies &&
                        registrationData.medicalHistory.allergies.length >
                          0 &&
                        (
                          <div>
                            <strong>Alergias:</strong>{' '}
                            {registrationData.medicalHistory.allergies.join(
                              ', ',
                            )}
                          </div>
                        )}
                      {registrationData.medicalHistory?.medications &&
                        registrationData.medicalHistory.medications.length >
                          0 &&
                        (
                          <div>
                            <strong>Medicamentos:</strong>{' '}
                            {registrationData.medicalHistory.medications.join(
                              ', ',
                            )}
                          </div>
                        )}
                      {registrationData.medicalHistory?.conditions &&
                        registrationData.medicalHistory.conditions.length >
                          0 &&
                        (
                          <div>
                            <strong>Condições:</strong>{' '}
                            {registrationData.medicalHistory.conditions.join(
                              ', ',
                            )}
                          </div>
                        )}
                      {registrationData.medicalHistory?.notes && (
                        <div>
                          <strong>Observações:</strong> {registrationData.medicalHistory.notes}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value='consent' className='space-y-2'>
                <Card>
                  <CardContent className='pt-4'>
                    <div className='space-y-2 text-sm'>
                      <div className='flex items-center space-x-2'>
                        {registrationData.consent?.treatmentConsent
                          ? <CheckCircle className='h-4 w-4 text-green-500' />
                          : <AlertCircle className='h-4 w-4 text-red-500' />}
                        <span>Consentimento de Tratamento</span>
                      </div>
                      <div className='flex items-center space-x-2'>
                        {registrationData.consent?.dataSharingConsent
                          ? <CheckCircle className='h-4 w-4 text-green-500' />
                          : <AlertCircle className='h-4 w-4 text-red-500' />}
                        <span>Compartilhamento de Dados</span>
                      </div>
                      <div className='flex items-center space-x-2'>
                        {registrationData.consent?.marketingConsent
                          ? <CheckCircle className='h-4 w-4 text-green-500' />
                          : <AlertCircle className='h-4 w-4 text-gray-500' />}
                        <span>Marketing (opcional)</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )

      default:
        return null
    }
  }

  // AI Suggestions Panel
  const renderAISuggestions = () => {
    if (aiSuggestions.length === 0) return null

    return (
      <Card className='mb-4'>
        <CardHeader>
          <CardTitle className='text-sm flex items-center'>
            <Brain className='h-4 w-4 mr-2' />
            Sugestões da IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-2'>
            {aiSuggestions.map((suggestion, index) => (
              <div
                key={index}
                className='flex items-center justify-between p-2 bg-blue-50 rounded'
              >
                <div className='flex-1'>
                  <div className='text-sm font-medium'>{suggestion.field}</div>
                  <div className='text-xs text-gray-600'>
                    {suggestion.reason}
                  </div>
                  <div className='text-xs text-blue-600'>
                    Confiança: {Math.round(suggestion.confidence * 100)}%
                  </div>
                </div>
                <Button
                  size='sm'
                  onClick={() => acceptSuggestion(suggestion)}
                  className='ml-2'
                >
                  Aplicar
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Validation Messages
  const renderValidationMessages = () => {
    if (validationMessages.length === 0) return null

    return (
      <div className='space-y-2 mb-4'>
        {validationMessages.map((message, index) => (
          <Alert
            key={index}
            variant={message.type === 'error' ? 'destructive' : 'default'}
          >
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>
              {message.field}: {message.message}
            </AlertDescription>
          </Alert>
        ))}
      </div>
    )
  }

  return (
    <div className='max-w-4xl mx-auto p-6'>
      <Card>
        <CardHeader>
          <CardTitle className='text-2xl flex items-center'>
            <User className='h-6 w-6 mr-2' />
            Registro Inteligente de Clientes
          </CardTitle>
          <p className='text-gray-600'>
            Assistido por IA com processamento de documentos e conformidade LGPD
          </p>
        </CardHeader>

        <CardContent>
          {/* Progress Bar */}
          <div className='mb-6'>
            <div className='flex justify-between mb-2'>
              <span className='text-sm font-medium'>Progresso</span>
              <span className='text-sm text-gray-600'>
                Passo {currentStep + 1} de {formSteps.length}
              </span>
            </div>
            <Progress
              value={((currentStep + 1) / formSteps.length) * 100}
              className='w-full'
            />
          </div>

          {/* Step Navigation */}
          <div className='flex justify-center mb-6'>
            <div className='flex space-x-2'>
              {formSteps.map((step, index) => (
                <Button
                  key={step.id}
                  variant={index === currentStep ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setCurrentStep(index)}
                  className='flex flex-col items-center p-2 h-auto'
                >
                  <step.icon className='h-4 w-4 mb-1' />
                  <span className='text-xs'>{step.title}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* AI Suggestions */}
          {renderAISuggestions()}

          {/* Validation Messages */}
          {renderValidationMessages()}

          {/* Step Content */}
          <div className='mb-6'>
            <h2 className='text-xl font-semibold mb-4'>
              {formSteps[currentStep].title}
            </h2>
            <p className='text-gray-600 mb-4'>
              {formSteps[currentStep].description}
            </p>
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          <div className='flex justify-between'>
            <Button
              variant='outline'
              onClick={prevStep}
              disabled={currentStep === 0 || isProcessing}
            >
              Anterior
            </Button>

            <div className='flex space-x-2'>
              {currentStep < formSteps.length - 1
                ? (
                  <Button onClick={nextStep} disabled={isProcessing}>
                    Próximo
                  </Button>
                )
                : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isProcessing}
                    className='bg-green-600 hover:bg-green-700'
                  >
                    {isProcessing ? 'Registrando...' : 'Confirmar Registro'}
                  </Button>
                )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

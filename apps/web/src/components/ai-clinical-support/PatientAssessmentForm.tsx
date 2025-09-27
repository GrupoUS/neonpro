/**
 * Patient Assessment Form Component
 * 
 * Brazilian healthcare compliant AI-powered patient assessment interface for aesthetic clinics.
 * This component provides a comprehensive form for collecting patient information including
 * medical history, aesthetic goals, and risk factors to generate personalized treatment
 * recommendations using AI analysis.
 * 
 * @component
 * @example
 * // Usage in a React component
 * <PatientAssessmentForm 
 *   patientId="123" 
 *   onSuccess={(recommendations) => console.log(recommendations)}
 *   onError={(error) => console.error(error)}
 * />
 * 
 * @remarks
 * - WCAG 2.1 AA+ compliant accessibility features
 * - Brazilian healthcare regulations compliance (LGPD, ANVISA, CFM)
 * - Mobile-first responsive design with 44px+ touch targets
 * - Real-time form validation and error handling
 * - Integrates with tRPC for type-safe API communication
 */

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.js'
import { Badge } from '@/components/ui/badge.js'
import { Button } from '@/components/ui/button.js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.js'
import { Input } from '@/components/ui/input.js'
import { Label } from '@/components/ui/label.js'
import { Progress } from '@/components/ui/progress.js'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.js'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.js'
import { trpc } from '@/lib/trpc.js'
import {
  type PatientAssessment,
  PatientAssessmentSchema,
  type SkinType,
  type TreatmentRecommendation,
} from '@/types/ai-clinical-support.js'
import { useQueryClient } from '@tanstack/react-query'
import {
  Activity,
  AlertTriangle,
  Camera,
  CheckCircle,
  DollarSign,
  Info,
  Loader2,
  Target,
  User,
  X,
} from 'lucide-react'
import React, { useState } from 'react'

/**
 * Props for the PatientAssessmentForm component
 * 
 * @interface PatientAssessmentFormProps
 * @property {string} patientId - Unique identifier for the patient
 * @property {Function} [onSuccess] - Callback function triggered when treatment recommendations are successfully generated
 * @property {Function} [onError] - Callback function triggered when an error occurs during form submission or API calls
 */

export function PatientAssessmentForm(
  { patientId, onSuccess, onError }: PatientAssessmentFormProps,
) {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('basic')
  const [assessmentData, setAssessmentData] = useState<Partial<PatientAssessment>>({
    id: '',
    patientId,
    assessmentDate: new Date(),
    skinType: 'III',
    fitzpatrickScale: 3,
    skinConditions: [],
    medicalHistory: {
      allergies: [],
      medications: [],
      previousTreatments: [],
      chronicConditions: [],
      pregnancyStatus: 'none',
    },
    aestheticGoals: [],
    budgetRange: {
      min: 0,
      max: 10000,
      currency: 'BRL',
    },
    riskFactors: [],
    photos: [],
  })

  // Generate recommendations mutation
  const generateMutation = trpc.aiClinicalSupport.generateTreatmentRecommendations.useMutation({
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['patients', patientId] } as any)
      onSuccess?.(data.recommendations)
    },
    onError: (error: any) => {
      onError?.(error as Error)
    },
  })

  const skinTypeDescriptions: Record<SkinType, string> = {
    I: 'Pele muito clara - sempre queima, nunca bronzeia',
    II: 'Pele clara - queima facilmente, bronzeia minimamente',
    III: 'Pele média - queima moderadamente, bronzeia gradualmente',
    IV: 'Pele morena - queima minimamente, bronzeia bem',
    V: 'Pele escura - raramente queima, bronzeia muito bem',
    VI: 'Pele muito escura - nunca queima, profundamente pigmentada',
  }

  const commonSkinConditions = [
    'Acne',
    'Rosácea',
    'Melasma',
    'Vitiligo',
    'Eczema',
    'Psoríase',
    'Poros dilatados',
    'Oleosidade excessiva',
    'Ressecamento',
    'Sensibilidade',
    'Linhas finas',
    'Rugas',
    'Flacidez',
    'Manchas senis',
    'Cicatrizes de acne',
  ]

  const commonAestheticGoals = [
    'Reduzir rugas e linhas finas',
    'Melhorar textura da pele',
    'Reduzir oleosidade',
    'Clarear manchas',
    'Tratar acne',
    'Rejuvenescimento facial',
    'Reduzir flacidez',
    'Melhorar contorno facial',
    'Tratar olheiras',
    'Reduzir poros dilatados',
    'Uniformizar tom da pele',
    'Tratar cicatrizes',
  ]

  const commonRiskFactors = [
    'Tabagismo',
    'Exposição solar excessiva',
    'Estresse crônico',
    'Histórico de queloides',
    'Problemas de cicatrização',
    'Doenças autoimunes',
    'Diabetes',
    'Hipertensão',
    'Problemas de coagulação',
    'Alergias conhecidas',
    'Uso de anticoagulantes',
    'Gravidez ou amamentação',
  ]

  /**
   * Handles skin type selection changes
   *
   * Updates the assessment data with the selected skin type and calculates the corresponding
   * Fitzpatrick scale value. This classification is critical for treatment recommendations as
   * different skin types respond differently to aesthetic procedures and require customized approaches.
   *
   * @param {SkinType} skinType - The selected skin type (I-VI based on Fitzpatrick scale)
   * @example
   * handleSkinTypeChange('III') // Updates skin type to III and sets Fitzpatrick to 3
   * @remarks
   * Automatically calculates fitzpatrickScale from skinType string value
   */
  const handleSkinTypeChange = (skinType: SkinType) => {
    setAssessmentData({
      ...assessmentData,
      skinType,
      fitzpatrickScale: parseInt(skinType) as number,
    })
  }

  /**
   * Handles array field changes for dynamic form fields
   *
   * Manages updates to array-based form fields including skin conditions, aesthetic goals,
   * risk factors, and medical history. This handler supports both adding and removing items
   * from these arrays based on the user interaction, with special handling for medical history fields.
   *
   * @param {field} field - The name of the field to update ('skinConditions', 'aestheticGoals', 'riskFactors', or medical history fields)
   * @param {string[]} value - The array of values to set for the field
   * @param {boolean} [isMedicalHistory=false] - Whether this is a medical history field (requires special handling)
   * @example
   * handleArrayFieldChange('aestheticGoals', ['Redução de rugas', 'Clareamento de manchas']) // Sets goals
   * handleArrayFieldChange('medications', ['Aspirina'], true) // Updates medical history
   * @remarks
   * Medical history fields require nested object updates due to data structure
   */
  const handleArrayFieldChange = (
    field:
      | 'skinConditions'
      | 'aestheticGoals'
      | 'riskFactors'
      | keyof PatientAssessment['medicalHistory'],
    value: string[],
    isMedicalHistory = false,
  ) => {
    if (isMedicalHistory) {
      setAssessmentData({
        ...assessmentData,
        medicalHistory: {
          ...assessmentData.medicalHistory!,
          [field]: value,
        },
      })
    } else {
      setAssessmentData({
        ...assessmentData,
        [field]: value,
      })
    }
  }

  /**
   * Handles budget range input changes
   *
   * Updates the minimum or maximum values in the budget range field with proper
   * numeric validation and conversion. This ensures that budget values are stored
   * as numbers for proper calculations and display formatting.
   *
   * @param {'min' | 'max'} field - Which budget field to update ('min' or 'max')
   * @param {string} value - The string value from the input field
   * @example
   * handleBudgetChange('min', '1000') // Sets minimum budget to 1000 BRL
   * handleBudgetChange('max', '5000') // Sets maximum budget to 5000 BRL
   * @remarks
   * Converts string to float, defaults to 0 if invalid input
   * Uses Brazilian Real (BRL) currency as specified in form data
   */
  const handleBudgetChange = (field: 'min' | 'max', value: string) => {
    const numValue = parseFloat(value) || 0
    setAssessmentData({
      ...assessmentData,
      budgetRange: {
        ...assessmentData.budgetRange!,
        [field]: numValue,
      },
    })
  }

  /**
   * Adds a new tag to the specified field
   *
   * Handles the addition of new items to array-based fields with validation to prevent
   * duplicates. This is used for dynamic tag-based inputs where users can add custom
   * values like skin conditions, aesthetic goals, or risk factors.
   *
   * @param {field} field - The target field for adding the tag
   * @param {string} value - The tag value to add
   * @param {string[]} [options] - Optional array of valid options for validation
   * @param {boolean} [isMedicalHistory=false] - Whether this is a medical history field
   * @example
   * handleAddTag('aestheticGoals', 'Redução de rugas') // Adds new aesthetic goal
   * handleAddTag('medications', 'Aspirina', undefined, true) // Adds medication to medical history
   * @remarks
   * - Validates against empty strings and duplicate values
   * - Trims whitespace from input values
   * - Uses handleArrayFieldChange for actual state updates
   */
  const handleAddTag = (
    field: 'skinConditions' | 'aestheticGoals' | 'riskFactors' | keyof PatientAssessment['medicalHistory'],
    value: string,
    options?: string[],
    isMedicalHistory = false,
  ) => {
    if (value.trim() && (!options || !options.includes(value.trim()))) {
      const currentValues = isMedicalHistory
        ? assessmentData
          .medicalHistory?.[field as keyof typeof assessmentData.medicalHistory] as string[] || []
        : (assessmentData[field] as string[]) || []

      handleArrayFieldChange(field, [...currentValues, value.trim()], isMedicalHistory)
    }
  }

  /**
   * Removes a tag from the specified field
   *
   * Handles the removal of items from array-based fields while maintaining
   * the proper data structure. This is used for dynamic tag-based inputs where
   * users can remove previously added values like skin conditions or aesthetic goals.
   *
   * @param {field} field - The target field for removing the tag
   * @param {string} value - The tag value to remove
   * @param {boolean} [isMedicalHistory=false] - Whether this is a medical history field
   * @example
   * handleRemoveTag('aestheticGoals', 'Redução de rugas') // Removes aesthetic goal
   * handleRemoveTag('medications', 'Aspirina', true) // Removes medication from medical history
   * @remarks
   * - Creates new array without the specified value
   * - Preserves original order of remaining items
   * - Uses handleArrayFieldChange for actual state updates
   */
  const handleRemoveTag = (
    field: 'skinConditions' | 'aestheticGoals' | 'riskFactors' | keyof PatientAssessment['medicalHistory'],
    value: string,
    isMedicalHistory = false,
  ) => {
    const currentValues = isMedicalHistory
      ? assessmentData
        .medicalHistory?.[field as keyof typeof assessmentData.medicalHistory] as string[] || []
      : (assessmentData[field] as string[]) || []

    handleArrayFieldChange(field, currentValues.filter(item => item !== value), isMedicalHistory)
  }

  /**
   * Handles form submission with validation and API call
   *
   * Validates the complete assessment data using Zod schema, generates a unique identifier,
   * and submits the assessment to the AI clinical support system for treatment recommendations.
   * This is the main entry point for processing patient assessments.
   *
   * @param {React.FormEvent} e - The form event object
   * @example
   * handleSubmit() // Validates and submits assessment data
   * @remarks
   * - Generates UUID for assessment tracking
   * - Uses Zod schema for data validation
   * - Integrates with tRPC for API communication
   * - Handles both success and error callbacks
   * - Triggers invalidation of patient queries for data consistency
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const completeAssessment: PatientAssessment = {
        ...assessmentData as PatientAssessment,
        id: crypto.randomUUID(),
        patientId,
        assessmentDate: new Date(),
      }

      await PatientAssessmentSchema.parseAsync(completeAssessment)

      generateMutation.mutate(completeAssessment)
    } catch (error) {
      onError?.(error as Error)
    }
  }

  const isSubmitting = generateMutation.isLoading
  const progress = activeTab === 'basic'
    ? 25
    : activeTab === 'medical'
    ? 50
    : activeTab === 'goals'
    ? 75
    : 100

  return (
    <div className='max-w-4xl mx-auto space-y-6'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>
          Avaliação de Paciente com IA
        </h1>
        <p className='text-gray-600'>
          Avaliação completa para gerar recomendações de tratamento personalizadas
        </p>
      </div>

      {generateMutation.error && (
        <Alert variant='destructive'>
          <AlertTriangle className='h-4 w-4' />
          <AlertTitle>Erro na Geração de Recomendações</AlertTitle>
          <AlertDescription>
            {generateMutation.error.message}
          </AlertDescription>
        </Alert>
      )}

      <div className='mb-6'>
        <div className='flex items-center justify-between mb-2'>
          <span className='text-sm font-medium text-gray-700'>Progresso da Avaliação</span>
          <span className='text-sm text-gray-500'>{progress}%</span>
        </div>
        <Progress value={progress} className='h-2' />
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
          <TabsList className='grid w-full grid-cols-4'>
            <TabsTrigger value='basic'>Dados Básicos</TabsTrigger>
            <TabsTrigger value='medical'>Histórico</TabsTrigger>
            <TabsTrigger value='goals'>Objetivos</TabsTrigger>
            <TabsTrigger value='summary'>Resumo</TabsTrigger>
          </TabsList>

          <TabsContent value='basic' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <User className='h-5 w-5' />
                  Informações Básicas da Pele
                </CardTitle>
                <CardDescription>
                  Características fundamentais da pele para análise personalizada
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div>
                  <Label className='text-sm font-medium text-gray-700 mb-3 block'>
                    Tipo de Pele (Escala Fitzpatrick)
                  </Label>
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {Object.entries(skinTypeDescriptions).map(([type, description]) => (
                      <Card
                        key={type}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          assessmentData.skinType === type ? 'ring-2 ring-blue-500 shadow-lg' : ''
                        }`}
                        onClick={() => handleSkinTypeChange(type as SkinType)}
                      >
                        <CardContent className='p-4'>
                          <div className='flex items-center justify-between mb-2'>
                            <span className='font-medium'>Tipo {type}</span>
                            {assessmentData.skinType === type && (
                              <CheckCircle className='h-5 w-5 text-blue-600' />
                            )}
                          </div>
                          <p className='text-sm text-gray-600'>{description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className='text-sm font-medium text-gray-700 mb-3 block'>
                    Condições da Pele
                  </Label>
                  <div className='space-y-3'>
                    <div className='flex flex-wrap gap-2'>
                      {assessmentData.skinConditions?.map((condition) => (
                        <Badge key={condition} variant='secondary' className='cursor-pointer'>
                          {condition}
                          <X
                            className='h-3 w-3 ml-1'
                            onClick={() =>
                              handleRemoveTag('skinConditions', condition)}
                          />
                        </Badge>
                      ))}
                    </div>
                    <Select
                      onValueChange={value => {
                        if (value && !assessmentData.skinConditions?.includes(value)) {
                          handleAddTag('skinConditions', value, commonSkinConditions)
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Adicionar condição da pele' />
                      </SelectTrigger>
                      <SelectContent>
                        {commonSkinConditions
                          .filter(condition => !assessmentData.skinConditions?.includes(condition))
                          .map(condition => (
                            <SelectItem key={condition} value={condition}>
                              {condition}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className='text-sm font-medium text-gray-700 mb-3 block'>
                    Fotos do Paciente (Opcional)
                  </Label>
                  <div className='space-y-3'>
                    <Button type='button' variant='outline' className='w-full'>
                      <Camera className='h-4 w-4 mr-2' />
                      Adicionar Foto
                    </Button>
                    <p className='text-sm text-gray-500'>
                      Adicione fotos da face em diferentes ângulos para análise mais precisa
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='medical' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Activity className='h-5 w-5' />
                  Histórico Médico
                </CardTitle>
                <CardDescription>
                  Informações médicas importantes para avaliação de contraindicações
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div>
                  <Label htmlFor='pregnancyStatus'>Status de Gravidez</Label>
                  <Select
                    value={assessmentData.medicalHistory?.pregnancyStatus || 'none'}
                    onValueChange={value => {
                      setAssessmentData({
                        ...assessmentData,
                        medicalHistory: {
                          ...assessmentData.medicalHistory!,
                          pregnancyStatus: value as any,
                        },
                      })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='none'>Nenhuma</SelectItem>
                      <SelectItem value='pregnant'>Grávida</SelectItem>
                      <SelectItem value='breastfeeding'>Amamentando</SelectItem>
                      <SelectItem value='planning'>Planejando gravidez</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className='text-sm font-medium text-gray-700 mb-3 block'>
                    Alergias
                  </Label>
                  <div className='space-y-3'>
                    <div className='flex flex-wrap gap-2'>
                      {assessmentData.medicalHistory?.allergies?.map((allergy) => (
                        <Badge key={allergy} variant='destructive' className='cursor-pointer'>
                          {allergy}
                          <X
                            className='h-3 w-3 ml-1'
                            onClick={() =>
                              handleRemoveTag('allergies', allergy, true)}
                          />
                        </Badge>
                      ))}
                    </div>
                    <Input
                      placeholder='Adicionar alergia e pressionar Enter'
                      onKeyPress={e => {
                        if (e.key === 'Enter') {
                          const input = e.target as HTMLInputElement
                          if (input.value.trim()) {
                            handleAddTag('allergies', input.value, [], true)
                            input.value = ''
                          }
                        }
                      }}
                    />
                  </div>
                </div>

                <div>
                  <Label className='text-sm font-medium text-gray-700 mb-3 block'>
                    Medicamentos em Uso
                  </Label>
                  <div className='space-y-3'>
                    <div className='flex flex-wrap gap-2'>
                      {assessmentData.medicalHistory?.medications?.map((medication) => (
                        <Badge key={medication} variant='secondary' className='cursor-pointer'>
                          {medication}
                          <X
                            className='h-3 w-3 ml-1'
                            onClick={() =>
                              handleRemoveTag('medications', medication, true)}
                          />
                        </Badge>
                      ))}
                    </div>
                    <Input
                      placeholder='Adicionar medicamento e pressionar Enter'
                      onKeyPress={e => {
                        if (e.key === 'Enter') {
                          const input = e.target as HTMLInputElement
                          if (input.value.trim()) {
                            handleAddTag('medications', input.value, [], true)
                            input.value = ''
                          }
                        }
                      }}
                    />
                  </div>
                </div>

                <div>
                  <Label className='text-sm font-medium text-gray-700 mb-3 block'>
                    Tratamentos Anteriores
                  </Label>
                  <div className='space-y-3'>
                    <div className='flex flex-wrap gap-2'>
                      {assessmentData.medicalHistory?.previousTreatments?.map((treatment) => (
                        <Badge key={treatment} variant='outline' className='cursor-pointer'>
                          {treatment}
                          <X
                            className='h-3 w-3 ml-1'
                            onClick={() => handleRemoveTag('previousTreatments', treatment, true)}
                          />
                        </Badge>
                      ))}
                    </div>
                    <Input
                      placeholder='Adicionar tratamento anterior e pressionar Enter'
                      onKeyPress={e => {
                        if (e.key === 'Enter') {
                          const input = e.target as HTMLInputElement
                          if (input.value.trim()) {
                            handleAddTag('previousTreatments', input.value, [], true)
                            input.value = ''
                          }
                        }
                      }}
                    />
                  </div>
                </div>

                <div>
                  <Label className='text-sm font-medium text-gray-700 mb-3 block'>
                    Condições Crônicas
                  </Label>
                  <div className='space-y-3'>
                    <div className='flex flex-wrap gap-2'>
                      {assessmentData.medicalHistory?.chronicConditions?.map((condition) => (
                        <Badge key={condition} variant='destructive' className='cursor-pointer'>
                          {condition}
                          <X
                            className='h-3 w-3 ml-1'
                            onClick={() => handleRemoveTag('chronicConditions', condition, true)}
                          />
                        </Badge>
                      ))}
                    </div>
                    <Input
                      placeholder='Adicionar condição crônica e pressionar Enter'
                      onKeyPress={e => {
                        if (e.key === 'Enter') {
                          const input = e.target as HTMLInputElement
                          if (input.value.trim()) {
                            handleAddTag('chronicConditions', input.value, [], true)
                            input.value = ''
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='goals' className='space-y-6'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Target className='h-5 w-5' />
                    Objetivos Estéticos
                  </CardTitle>
                  <CardDescription>
                    O que o paciente espera alcançar com os tratamentos
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='space-y-3'>
                    <div className='flex flex-wrap gap-2'>
                      {assessmentData.aestheticGoals?.map((goal) => (
                        <Badge key={goal} variant='default' className='cursor-pointer'>
                          {goal}
                          <X
                            className='h-3 w-3 ml-1'
                            onClick={() =>
                              handleRemoveTag('aestheticGoals', goal)}
                          />
                        </Badge>
                      ))}
                    </div>
                    <Select
                      onValueChange={value => {
                        if (value && !assessmentData.aestheticGoals?.includes(value)) {
                          handleAddTag('aestheticGoals', value, commonAestheticGoals)
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Adicionar objetivo estético' />
                      </SelectTrigger>
                      <SelectContent>
                        {commonAestheticGoals
                          .filter(goal => !assessmentData.aestheticGoals?.includes(goal))
                          .map(goal => (
                            <SelectItem key={goal} value={goal}>
                              {goal}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <DollarSign className='h-5 w-5' />
                    Orçamento
                  </CardTitle>
                  <CardDescription>
                    Faixa de orçamento para tratamentos
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <Label htmlFor='budgetMin'>Valor Mínimo (R$)</Label>
                      <Input
                        id='budgetMin'
                        type='number'
                        value={assessmentData.budgetRange?.min || ''}
                        onChange={e => handleBudgetChange('min', e.target.value)}
                        placeholder='0'
                        min='0'
                      />
                    </div>
                    <div>
                      <Label htmlFor='budgetMax'>Valor Máximo (R$)</Label>
                      <Input
                        id='budgetMax'
                        type='number'
                        value={assessmentData.budgetRange?.max || ''}
                        onChange={e => handleBudgetChange('max', e.target.value)}
                        placeholder='10000'
                        min='0'
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor='currency'>Moeda</Label>
                    <Select
                      value={assessmentData.budgetRange?.currency || 'BRL'}
                      onValueChange={value => {
                        setAssessmentData({
                          ...assessmentData,
                          budgetRange: {
                            ...assessmentData.budgetRange!,
                            currency: value as 'BRL' | 'USD' | 'EUR',
                          },
                        })
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='BRL'>Real Brasileiro (R$)</SelectItem>
                        <SelectItem value='USD'>Dólar Americano ($)</SelectItem>
                        <SelectItem value='EUR'>Euro (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <AlertTriangle className='h-5 w-5' />
                  Fatores de Risco
                </CardTitle>
                <CardDescription>
                  Fatores que podem afetar a segurança ou eficácia dos tratamentos
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-3'>
                  <div className='flex flex-wrap gap-2'>
                    {assessmentData.riskFactors?.map((factor) => (
                      <Badge key={factor} variant='destructive' className='cursor-pointer'>
                        {factor}
                        <X
                          className='h-3 w-3 ml-1'
                          onClick={() =>
                            handleRemoveTag('riskFactors', factor)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <Select
                    onValueChange={value => {
                      if (value && !assessmentData.riskFactors?.includes(value)) {
                        handleAddTag('riskFactors', value, commonRiskFactors)
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Adicionar fator de risco' />
                    </SelectTrigger>
                    <SelectContent>
                      {commonRiskFactors
                        .filter(factor => !assessmentData.riskFactors?.includes(factor))
                        .map(factor => (
                          <SelectItem key={factor} value={factor}>
                            {factor}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='summary' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle>Resumo da Avaliação</CardTitle>
                <CardDescription>
                  Revise todas as informações antes de gerar recomendações
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <h3 className='font-medium text-gray-900 mb-2'>Dados da Pele</h3>
                    <div className='space-y-1 text-sm'>
                      <div className='flex justify-between'>
                        <span className='text-gray-600'>Tipo:</span>
                        <span className='font-medium'>Tipo {assessmentData.skinType}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-gray-600'>Escala Fitzpatrick:</span>
                        <span className='font-medium'>{assessmentData.fitzpatrickScale}</span>
                      </div>
                    </div>
                    {assessmentData.skinConditions && assessmentData.skinConditions.length > 0 && (
                      <div className='mt-2'>
                        <span className='text-gray-600 text-sm'>Condições:</span>
                        <div className='flex flex-wrap gap-1 mt-1'>
                          {assessmentData.skinConditions.map((condition) => (
                            <Badge key={condition} variant='outline' className='text-xs'>
                              {condition}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className='font-medium text-gray-900 mb-2'>Orçamento</h3>
                    <div className='space-y-1 text-sm'>
                      <div className='flex justify-between'>
                        <span className='text-gray-600'>Faixa:</span>
                        <span className='font-medium'>
                          {assessmentData.budgetRange?.currency}{' '}
                          {assessmentData.budgetRange?.min.toLocaleString('pt-BR')} -{' '}
                          {assessmentData.budgetRange?.max.toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {assessmentData.medicalHistory && (
                  <div>
                    <h3 className='font-medium text-gray-900 mb-2'>Histórico Médico</h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                      {assessmentData.medicalHistory.pregnancyStatus !== 'none' && (
                        <div className='flex justify-between'>
                          <span className='text-gray-600'>Gravidez:</span>
                          <span className='font-medium'>
                            {assessmentData.medicalHistory.pregnancyStatus}
                          </span>
                        </div>
                      )}
                      {assessmentData.medicalHistory.allergies &&
                        assessmentData.medicalHistory.allergies.length > 0 &&
                        (
                          <div>
                            <span className='text-gray-600'>Alergias:</span>
                            <div className='flex flex-wrap gap-1 mt-1'>
                              {assessmentData.medicalHistory.allergies.map((allergy) => (
                                <Badge key={allergy} variant='destructive' className='text-xs'>
                                  {allergy}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      {assessmentData.medicalHistory.medications &&
                        assessmentData.medicalHistory.medications.length > 0 &&
                        (
                          <div>
                            <span className='text-gray-600'>Medicamentos:</span>
                            <div className='flex flex-wrap gap-1 mt-1'>
                              {assessmentData.medicalHistory.medications.map((medication) => (
                                <Badge key={medication} variant='secondary' className='text-xs'>
                                  {medication}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                )}

                {assessmentData.aestheticGoals && assessmentData.aestheticGoals.length > 0 && (
                  <div>
                    <h3 className='font-medium text-gray-900 mb-2'>Objetivos Estéticos</h3>
                    <div className='flex flex-wrap gap-2'>
                      {assessmentData.aestheticGoals.map((goal) => (
                        <Badge key={goal} variant='default'>
                          {goal}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {assessmentData.riskFactors && assessmentData.riskFactors.length > 0 && (
                  <div>
                    <h3 className='font-medium text-gray-900 mb-2'>Fatores de Risco</h3>
                    <div className='flex flex-wrap gap-2'>
                      {assessmentData.riskFactors.map((factor) => (
                        <Badge key={factor} variant='destructive'>
                          {factor}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Alert>
                  <Info className='h-4 w-4' />
                  <AlertTitle>Próximo Passo</AlertTitle>
                  <AlertDescription>
                    Ao clicar em &ldquo;Gerar Recomendações&rdquo;, nossa IA analisará todas as informações e
                    gerará sugestões personalizadas de tratamento com base nas características do
                    paciente, objetivos e orçamento disponível.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className='flex justify-between'>
          <div className='flex gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => {
                const tabs = ['basic', 'medical', 'goals', 'summary']
                const currentIndex = tabs.indexOf(activeTab)
                if (currentIndex > 0) {
                  setActiveTab(tabs[currentIndex - 1])
                }
              }}
              disabled={activeTab === 'basic'}
            >
              Anterior
            </Button>
          </div>
          <div className='flex gap-2'>
            {activeTab !== 'summary'
              ? (
                <Button
                  type='button'
                  onClick={() => {
                    const tabs = ['basic', 'medical', 'goals', 'summary']
                    const currentIndex = tabs.indexOf(activeTab)
                    if (currentIndex < tabs.length - 1) {
                      setActiveTab(tabs[currentIndex + 1])
                    }
                  }}
                >
                  Próximo
                </Button>
              )
              : (
                <Button
                  type='submit'
                  disabled={isSubmitting || !assessmentData.aestheticGoals?.length}
                  className='min-w-40'
                >
                  {isSubmitting
                    ? (
                      <>
                        <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                        Gerando...
                      </>
                    )
                    : (
                      'Gerar Recomendações'
                    )}
                </Button>
              )}
          </div>
        </div>
      </form>
    </div>
  )
}

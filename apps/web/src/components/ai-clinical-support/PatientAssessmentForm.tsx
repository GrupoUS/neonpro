/**
 * Patient Assessment Form Component
 * Brazilian healthcare compliant AI-powered patient assessment interface
 */

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { trpc } from '@/lib/trpc'
import {
  type PatientAssessment,
  PatientAssessmentSchema,
  type SkinType,
  type TreatmentRecommendation,
} from '@/types/ai-clinical-support'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Activity,
  AlertTriangle,
  Camera,
  CheckCircle,
  DollarSign,
  Info,
  Loader2,
  Plus,
  Target,
  User,
  X,
} from 'lucide-react'
import React, { useEffect, useState } from 'react'

interface PatientAssessmentFormProps {
  patientId: string
  onSuccess?: (recommendations: TreatmentRecommendation[]) => void
  onError?: (error: Error) => void
}

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
    onSuccess: (data) => {
      queryClient.invalidateQueries(['patients', patientId])
      onSuccess?.(data.recommendations)
    },
    onError: (error) => {
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

  const handleSkinTypeChange = (skinType: SkinType) => {
    setAssessmentData({
      ...assessmentData,
      skinType,
      fitzpatrickScale: parseInt(skinType) as number,
    })
  }

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

  const handleAddTag = (
    field: 'skinConditions' | 'aestheticGoals' | 'riskFactors',
    value: string,
    options: string[],
    isMedicalHistory = false,
  ) => {
    if (value.trim() && !options.includes(value.trim())) {
      const currentValues = isMedicalHistory
        ? assessmentData
          .medicalHistory![field as keyof typeof assessmentData.medicalHistory] as string[]
        : assessmentData[field]

      handleArrayFieldChange(field, [...currentValues, value.trim()], isMedicalHistory)
    }
  }

  const handleRemoveTag = (
    field: 'skinConditions' | 'aestheticGoals' | 'riskFactors',
    value: string,
    isMedicalHistory = false,
  ) => {
    const currentValues = isMedicalHistory
      ? assessmentData
        .medicalHistory![field as keyof typeof assessmentData.medicalHistory] as string[]
      : assessmentData[field]

    handleArrayFieldChange(field, currentValues.filter((item) => item !== value), isMedicalHistory)
  }

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
                      {assessmentData.skinConditions?.map((condition, index) => (
                        <Badge key={index} variant='secondary' className='cursor-pointer'>
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
                      onValueChange={(value) => {
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
                          .filter((condition) =>
                            !assessmentData.skinConditions?.includes(condition)
                          )
                          .map((condition) => (
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
                    onValueChange={(value) => {
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
                      {assessmentData.medicalHistory?.allergies?.map((allergy, index) => (
                        <Badge key={index} variant='destructive' className='cursor-pointer'>
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
                      onKeyPress={(e) => {
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
                      {assessmentData.medicalHistory?.medications?.map((medication, index) => (
                        <Badge key={index} variant='secondary' className='cursor-pointer'>
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
                      onKeyPress={(e) => {
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
                      {assessmentData.medicalHistory?.previousTreatments?.map((
                        treatment,
                        index,
                      ) => (
                        <Badge key={index} variant='outline' className='cursor-pointer'>
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
                      onKeyPress={(e) => {
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
                      {assessmentData.medicalHistory?.chronicConditions?.map((condition, index) => (
                        <Badge key={index} variant='destructive' className='cursor-pointer'>
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
                      onKeyPress={(e) => {
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
                      {assessmentData.aestheticGoals?.map((goal, index) => (
                        <Badge key={index} variant='default' className='cursor-pointer'>
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
                      onValueChange={(value) => {
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
                          .filter((goal) => !assessmentData.aestheticGoals?.includes(goal))
                          .map((goal) => (
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
                        onChange={(e) => handleBudgetChange('min', e.target.value)}
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
                        onChange={(e) => handleBudgetChange('max', e.target.value)}
                        placeholder='10000'
                        min='0'
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor='currency'>Moeda</Label>
                    <Select
                      value={assessmentData.budgetRange?.currency || 'BRL'}
                      onValueChange={(value) => {
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
                    {assessmentData.riskFactors?.map((factor, index) => (
                      <Badge key={index} variant='destructive' className='cursor-pointer'>
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
                    onValueChange={(value) => {
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
                        .filter((factor) => !assessmentData.riskFactors?.includes(factor))
                        .map((factor) => (
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
                          {assessmentData.skinConditions.map((condition, index) => (
                            <Badge key={index} variant='outline' className='text-xs'>
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
                      {assessmentData.medicalHistory.allergies
                        && assessmentData.medicalHistory.allergies.length > 0
                        && (
                          <div>
                            <span className='text-gray-600'>Alergias:</span>
                            <div className='flex flex-wrap gap-1 mt-1'>
                              {assessmentData.medicalHistory.allergies.map((allergy, index) => (
                                <Badge key={index} variant='destructive' className='text-xs'>
                                  {allergy}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      {assessmentData.medicalHistory.medications
                        && assessmentData.medicalHistory.medications.length > 0
                        && (
                          <div>
                            <span className='text-gray-600'>Medicamentos:</span>
                            <div className='flex flex-wrap gap-1 mt-1'>
                              {assessmentData.medicalHistory.medications.map((
                                medication,
                                index,
                              ) => (
                                <Badge key={index} variant='secondary' className='text-xs'>
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
                      {assessmentData.aestheticGoals.map((goal, index) => (
                        <Badge key={index} variant='default'>
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
                      {assessmentData.riskFactors.map((factor, index) => (
                        <Badge key={index} variant='destructive'>
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
                    Ao clicar em "Gerar Recomendações", nossa IA analisará todas as informações e
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

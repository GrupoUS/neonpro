/**
 * Professional Certification Validator Component
 * Brazilian healthcare compliant CFM certification validation for aesthetic procedures
 */

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.js'
import { Badge } from '@/components/ui/badge.js'
import { Button } from '@/components/ui/button.js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.js'
import { Input } from '@/components/ui/input.js'
import { Label } from '@/components/ui/label.js'
import { Progress } from '@/components/ui/progress.js'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.js'
import { trpc } from '@/lib/trpc.js'
import {
  type CertificationValidation,
} from '@/types/aesthetic-scheduling.js'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertTriangle,
  Award,
  CheckCircle,
  Clock,
  Info,
  Loader2,
  Search,
  Shield,
  User,
  XCircle,
} from 'lucide-react'
import React, { useEffect, useState } from 'react'

interface CertificationValidatorProps {
  onValidationComplete?: (validation: CertificationValidation) => void
  onError?: (error: Error) => void
}

export function CertificationValidator(
  { onValidationComplete, onError }: CertificationValidatorProps,
) {
  const queryClient = useQueryClient()
  const [selectedProfessional, setSelectedProfessional] = useState<string>('')
  const [selectedProcedures, setSelectedProcedures] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [validationResults, setValidationResults] = useState<CertificationValidation | null>(null)

  // Fetch professionals
  const { data: professionalsData, isLoading: professionalsLoading } = (trpc as any).professional
    .getAll.useQuery()

  // Fetch aesthetic procedures
  const { data: proceduresData, isLoading: proceduresLoading } = (trpc as any).aestheticScheduling
    .getAestheticProcedures.useQuery(
      { limit: 100, offset: 0 },
      {
        select: (data: any) => data.procedures,
      },
    )

  // Validate certifications mutation
  const validateMutation = (trpc as any).aestheticScheduling.validateProfessionalCertifications
    .useMutation({
      onSuccess: (data: any) => {
        setValidationResults(data)
        onValidationComplete?.(data)
        queryClient.invalidateQueries({ queryKey: ['professionals'] })
      },
      onError: (error: any) => {
        onError?.(error as Error)
      },
    })

  const filteredProfessionals =
    professionalsData?.filter((professional: any) =>
      professional.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      professional.specialization.toLowerCase().includes(searchTerm.toLowerCase())
    ) || []

  const filteredProcedures =
    proceduresData?.filter((procedure: any) =>
      procedure.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      procedure.category.toLowerCase().includes(searchTerm.toLowerCase())
    ) || []

  const handleProfessionalSelect = (professionalId: string) => {
    setSelectedProfessional(professionalId)
    setSelectedProcedures([])
    setValidationResults(null)
  }

  const handleProcedureSelect = (procedureId: string, checked: boolean) => {
    if (checked) {
      setSelectedProcedures([...selectedProcedures, procedureId])
    } else {
      setSelectedProcedures(selectedProcedures.filter(id => id !== procedureId))
    }
    setValidationResults(null)
  }

  const handleValidate = () => {
    if (selectedProfessional && selectedProcedures.length > 0) {
      validateMutation.mutate({
        professionalId: selectedProfessional,
        procedureIds: selectedProcedures,
      })
    }
  }

  const selectedProfessionalData = professionalsData?.find((p: any) =>
    p.id === selectedProfessional
  )
  const selectedProceduresData =
    proceduresData?.filter((p: any) => selectedProcedures.includes(p.id)) || []
  const isValidating = validateMutation.isLoading

  const getExperienceLevelColor = (level: string) => {
    switch (level) {
      case 'expert':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'advanced':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'beginner':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getExperienceLevelIcon = (level: string) => {
    switch (level) {
      case 'expert':
        return <Award className='h-4 w-4' />
      case 'advanced':
        return <Shield className='h-4 w-4' />
      case 'intermediate':
        return <Clock className='h-4 w-4' />
      case 'beginner':
        return <AlertTriangle className='h-4 w-4' />
      default:
        return <User className='h-4 w-4' />
    }
  }

  return (
    <div className='max-w-6xl mx-auto space-y-6'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>
          Validação de Certificações Profissionais
        </h1>
        <p className='text-gray-600'>
          Validação de certificações CFM para procedimentos estéticos conforme padrões brasileiros
        </p>
      </div>

      {validateMutation.error && (
        <Alert variant='destructive'>
          <XCircle className='h-4 w-4' />
          <AlertTitle>Erro na Validação</AlertTitle>
          <AlertDescription>
            {validateMutation.error.message}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue='professionals' className='w-full'>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='professionals'>Profissionais</TabsTrigger>
          <TabsTrigger value='procedures'>Procedimentos</TabsTrigger>
          <TabsTrigger value='validation'>Validação</TabsTrigger>
        </TabsList>

        <TabsContent value='professionals' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <User className='h-5 w-5' />
                Buscar Profissional
              </CardTitle>
              <CardDescription>
                Selecione o profissional para validar suas certificações
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='relative'>
                <Search className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                <Input
                  type='text'
                  placeholder='Buscar por nome ou especialização...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='pl-10'
                  aria-label='Buscar profissional'
                />
              </div>

              {professionalsLoading
                ? (
                  <div className='flex items-center justify-center py-8'>
                    <Loader2 className='h-6 w-6 animate-spin' />
                    <span className='ml-2'>Carregando profissionais...</span>
                  </div>
                )
                : (
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto'>
                    {filteredProfessionals.map((professional: any) => (
                      <Card
                        key={professional.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedProfessional === professional.id
                            ? 'ring-2 ring-blue-500 shadow-lg'
                            : ''
                        }`}
                        onClick={() => handleProfessionalSelect(professional.id)}
                      >
                        <CardContent className='p-4'>
                          <div className='flex items-start justify-between mb-2'>
                            <div className='flex-1'>
                              <h3 className='font-medium text-gray-900'>{professional.fullName}</h3>
                              <p className='text-sm text-gray-600'>{professional.specialization}</p>
                            </div>
                            {selectedProfessional === professional.id && (
                              <CheckCircle className='h-5 w-5 text-green-600' />
                            )}
                          </div>
                          <div className='flex items-center gap-2 text-sm text-gray-600'>
                            <span>CRM: {professional.licenseNumber}</span>
                          </div>
                          <div className='flex flex-wrap gap-1 mt-2'>
                            <Badge variant='outline' className='text-xs'>
                              {professional.certifications?.length || 0} certificações
                            </Badge>
                            <Badge variant='outline' className='text-xs'>
                              {professional.specializations?.length || 0} especializações
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='procedures' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Shield className='h-5 w-5' />
                Selecionar Procedimentos para Validação
              </CardTitle>
              <CardDescription>
                Escolha os procedimentos que deseja validar para o profissional selecionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedProfessional
                ? (
                  <Alert>
                    <AlertTriangle className='h-4 w-4' />
                    <AlertTitle>Nenhum Profissional Selecionado</AlertTitle>
                    <AlertDescription>
                      Volte para a aba "Profissionais" e selecione um profissional para continuar.
                    </AlertDescription>
                  </Alert>
                )
                : (
                  <div className='space-y-4'>
                    <div className='flex items-center gap-2 text-sm text-gray-600'>
                      <User className='h-4 w-4' />
                      <span>Profissional: {selectedProfessionalData?.fullName}</span>
                    </div>

                    <div className='relative'>
                      <Search className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                      <Input
                        type='text'
                        placeholder='Buscar procedimentos...'
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className='pl-10'
                        aria-label='Buscar procedimentos'
                      />
                    </div>

                    {proceduresLoading
                      ? (
                        <div className='flex items-center justify-center py-8'>
                          <Loader2 className='h-6 w-6 animate-spin' />
                          <span className='ml-2'>Carregando procedimentos...</span>
                        </div>
                      )
                      : (
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto'>
                          {filteredProcedures.map((procedure: any) => (
                            <Card key={procedure.id} className='hover:shadow-md transition-shadow'>
                              <CardContent className='p-4'>
                                <div className='flex items-start justify-between'>
                                  <div className='flex-1'>
                                    <div className='flex items-center gap-2 mb-2'>
                                      <input
                                        type='checkbox'
                                        id={procedure.id}
                                        checked={selectedProcedures.includes(procedure.id)}
                                        onChange={e =>
                                          handleProcedureSelect(procedure.id, e.target.checked)}
                                        className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                                        aria-label={`Selecionar procedimento ${procedure.name}`}
                                      />
                                      <h3 className='font-medium text-gray-900'>
                                        {procedure.name}
                                      </h3>
                                    </div>
                                    <p className='text-sm text-gray-600 mb-2'>
                                      {procedure.description}
                                    </p>
                                    <div className='flex flex-wrap gap-2 mb-2'>
                                      <Badge variant='secondary'>{procedure.category}</Badge>
                                      <Badge variant='outline'>{procedure.procedureType}</Badge>
                                      {procedure.requiresCertification && (
                                        <Badge variant='destructive' className='text-xs'>
                                          Requer Certificação
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                  </div>
                )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='validation' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Shield className='h-5 w-5' />
                Resultados da Validação
              </CardTitle>
              <CardDescription>
                Validação de certificações CFM para os procedimentos selecionados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedProfessional || selectedProcedures.length === 0
                ? (
                  <Alert>
                    <AlertTriangle className='h-4 w-4' />
                    <AlertTitle>Informações Incompletas</AlertTitle>
                    <AlertDescription>
                      Selecione um profissional e ao menos um procedimento para realizar a
                      validação.
                    </AlertDescription>
                  </Alert>
                )
                : (
                  <div className='space-y-6'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <h3 className='font-medium text-gray-900'>
                          {selectedProfessionalData?.fullName}
                        </h3>
                        <p className='text-sm text-gray-600'>
                          {selectedProcedures.length} procedimento(s) selecionado(s)
                        </p>
                      </div>
                      <Button
                        onClick={handleValidate}
                        disabled={isValidating}
                        className='min-w-32'
                      >
                        {isValidating
                          ? (
                            <>
                              <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                              Validando...
                            </>
                          )
                          : (
                            'Validar Certificações'
                          )}
                      </Button>
                    </div>

                    {validationResults && (
                      <div className='space-y-6'>
                        {/* Validation Status */}
                        <div
                          className={`p-4 rounded-lg border ${
                            validationResults.isValid
                              ? 'bg-green-50 border-green-200'
                              : 'bg-red-50 border-red-200'
                          }`}
                        >
                          <div className='flex items-center gap-3'>
                            {validationResults.isValid
                              ? <CheckCircle className='h-6 w-6 text-green-600' />
                              : <XCircle className='h-6 w-6 text-red-600' />}
                            <div>
                              <h3
                                className={`font-medium ${
                                  validationResults.isValid ? 'text-green-900' : 'text-red-900'
                                }`}
                              >
                                {validationResults.isValid
                                  ? 'Validação Aprovada'
                                  : 'Validação Reprovada'}
                              </h3>
                              <p
                                className={`text-sm ${
                                  validationResults.isValid ? 'text-green-700' : 'text-red-700'
                                }`}
                              >
                                {validationResults.isValid
                                  ? 'O profissional possui todas as certificações necessárias'
                                  : 'O profissional não possui certificações suficientes'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Experience Level */}
                        <div className='bg-gray-50 rounded-lg p-4'>
                          <h4 className='font-medium text-gray-900 mb-3'>Nível de Experiência</h4>
                          <div className='flex items-center gap-3'>
                            <div
                              className={`p-2 rounded-full ${
                                getExperienceLevelColor(validationResults.experienceLevel || '')
                              }`}
                            >
                              {getExperienceLevelIcon(validationResults.experienceLevel || '')}
                            </div>
                            <div>
                              <Badge
                                className={getExperienceLevelColor(
                                  validationResults.experienceLevel || '',
                                )}
                              >
                                {validationResults.experienceLevel
                                  ? validationResults.experienceLevel.charAt(0).toUpperCase() +
                                    validationResults.experienceLevel.slice(1)
                                  : ''}
                              </Badge>
                              <p className='text-sm text-gray-600 mt-1'>
                                Baseado nas certificações e experiência do profissional
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Missing Certifications */}
                        {!validationResults.isValid &&
                          validationResults.missingCertifications &&
                          validationResults.missingCertifications.length > 0 &&
                          (
                            <div className='bg-red-50 rounded-lg p-4'>
                              <h4 className='font-medium text-red-900 mb-3'>
                                Certificações Faltantes
                              </h4>
                              <div className='space-y-2'>
                                {validationResults.missingCertifications.map((
                                  certification,
                                  index,
                                ) => (
                                  <div key={index} className='flex items-center gap-2'>
                                    <XCircle className='h-4 w-4 text-red-600' />
                                    <span className='text-sm text-red-800'>{certification}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        {/* Warnings */}
                        {validationResults.warnings && validationResults.warnings.length > 0 && (
                          <div className='bg-yellow-50 rounded-lg p-4'>
                            <h4 className='font-medium text-yellow-900 mb-3'>Avisos</h4>
                            <div className='space-y-2'>
                              {validationResults.warnings.map((warning, index) => (
                                <div key={index} className='flex items-center gap-2'>
                                  <AlertTriangle className='h-4 w-4 text-yellow-600' />
                                  <span className='text-sm text-yellow-800'>{warning}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Recommendations */}
                        {validationResults.recommendations &&
                          validationResults.recommendations.length > 0 &&
                          (
                            <div className='bg-blue-50 rounded-lg p-4'>
                              <h4 className='font-medium text-blue-900 mb-3'>Recomendações</h4>
                              <div className='space-y-2'>
                                {validationResults.recommendations.map((recommendation, index) => (
                                  <div key={index} className='flex items-center gap-2'>
                                    <Info className='h-4 w-4 text-blue-600' />
                                    <span className='text-sm text-blue-800'>{recommendation}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        {/* Professional Details */}
                        <div className='bg-gray-50 rounded-lg p-4'>
                          <h4 className='font-medium text-gray-900 mb-3'>
                            Detalhes do Profissional
                          </h4>
                          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div>
                              <Label className='text-sm font-medium text-gray-700'>Nome</Label>
                              <p className='text-sm text-gray-900'>
                                {validationResults.professional && typeof validationResults.professional === 'object' 
                                  ? validationResults.professional.name 
                                  : validationResults.professional || 'N/A'}
                              </p>
                            </div>
                            <div>
                              <Label className='text-sm font-medium text-gray-700'>
                                Especialização
                              </Label>
                              <p className='text-sm text-gray-900'>
                                {validationResults.professional && typeof validationResults.professional === 'object' 
                                  ? validationResults.professional.specialty 
                                  : 'N/A'}
                              </p>
                            </div>
                            <div>
                              <Label className='text-sm font-medium text-gray-700'>CRM</Label>
                              <p className='text-sm text-gray-900'>
                                {validationResults.professional && typeof validationResults.professional === 'object' 
                                  ? validationResults.professional.councilNumber 
                                  : 'N/A'}
                              </p>
                            </div>
                            <div>
                              <Label className='text-sm font-medium text-gray-700'>
                                Certificações
                              </Label>
                              <p className='text-sm text-gray-900'>Certificações</p>
                            </div>
                          </div>
                        </div>

                        {/* Compliance Status */}
                        <div className='bg-green-50 rounded-lg p-4'>
                          <h4 className='font-medium text-green-900 mb-3'>
                            Status de Conformidade
                          </h4>
                          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                            <div className='flex items-center gap-2'>
                              <CheckCircle className='h-4 w-4 text-green-600' />
                              <span className='text-sm text-green-800'>
                                CFM: {validationResults.complianceStatus === 'compliant'
                                  ? 'Validado'
                                  : 'Não Validado'}
                              </span>
                            </div>
                            <div className='flex items-center gap-2'>
                              <CheckCircle className='h-4 w-4 text-green-600' />
                              <span className='text-sm text-green-800'>
                                ANVISA: {validationResults.complianceStatus === 'compliant'
                                  ? 'Conforme'
                                  : 'Não Conforme'}
                              </span>
                            </div>
                            <div className='flex items-center gap-2'>
                              <Clock className='h-4 w-4 text-green-600' />
                              <span className='text-sm text-green-800'>
                                Última Validação: {new Date().toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

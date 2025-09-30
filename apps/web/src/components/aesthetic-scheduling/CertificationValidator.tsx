/**
 * Mobile-First Professional Certification Validator Component
 * Optimized for healthcare professionals with Brazilian CFM/ANVISA compliance
 * Features: 44px+ touch targets, emergency mode, offline capability, one-handed operation
 */

import {
  Alert, AlertDescription, AlertTitle,
  Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle,
  Input, Progress
} from '@/components/ui/index.js'
import { Label } from '@/components/ui/label.js'
// Switch component not available in current UI kit - using simple toggle instead
import { trpc } from '@/lib/trpc.js'
import {
  type CertificationValidation,
  type ProfessionalDetails,
  type AestheticProcedure,
  type ProfessionalCertification,
} from '@/types/aesthetic-scheduling.js'

// Export interfaces for direct use
export type { CertificationValidation, ProfessionalDetails }

// Default export for backward compatibility
export default CertificationValidator
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertTriangle,
  Award,
  Battery,
  CheckCircle,
  Clock,
  Heart,
  Info,
  Loader2,
  MapPin,
  Phone,
  Search,
  Shield,
  User,
  Wifi,
  WifiOff,
  XCircle,
  Zap,
} from 'lucide-react'
import React, { useEffect, useState, useCallback } from 'react'

interface CertificationValidatorProps {
  onValidationComplete?: (validation: CertificationValidation) => void
  onError?: (error: Error) => void
  isEmergencyMode?: boolean
}

interface MobileValidationState {
  isOffline: boolean
  emergencyMode: boolean
  lastSyncTime: Date | null
  cachedProfessionals: ProfessionalDetails[]
  cachedProcedures: AestheticProcedure[]
}

// Local storage keys for offline capability
const STORAGE_KEYS = {
  PROFESSIONALS: 'neonpro_cached_professionals',
  PROCEDURES: 'neonpro_cached_procedures',
  VALIDATIONS: 'neonpro_cached_validations',
  SETTINGS: 'neonpro_mobile_settings',
}

export function CertificationValidator(
  { onValidationComplete, onError, isEmergencyMode = false }: CertificationValidatorProps,
) {
  const queryClient = useQueryClient()
  const [selectedProfessional, setSelectedProfessional] = useState<string>('')
  const [selectedProcedures, setSelectedProcedures] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [validationResults, setValidationResults] = useState<CertificationValidation | null>(null)
  const [mobileState, setMobileState] = useState<MobileValidationState>({
    isOffline: !navigator.onLine,
    emergencyMode: isEmergencyMode,
    lastSyncTime: null,
    cachedProfessionals: [],
    cachedProcedures: [],
  })
  const [activeTab, setActiveTab] = useState<'quick' | 'detailed'>('quick')
  const [showEmergencyPanel, setShowEmergencyPanel] = useState(false)

  // Initialize cached data from localStorage
  useEffect(() => {
    const loadCachedData = () => {
      try {
        const cachedProfessionals = localStorage.getItem(STORAGE_KEYS.PROFESSIONALS)
        const cachedProcedures = localStorage.getItem(STORAGE_KEYS.PROCEDURES)
        const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS)

        setMobileState(prev => ({
          ...prev,
          cachedProfessionals: cachedProfessionals ? JSON.parse(cachedProfessionals) : [],
          cachedProcedures: cachedProcedures ? JSON.parse(cachedProcedures) : [],
          emergencyMode: settings ? JSON.parse(settings).emergencyMode : isEmergencyMode,
        }))
      } catch (error) {
        console.error('Error loading cached data:', error)
      }
    }

    loadCachedData()

    // Online/offline event listeners
    const handleOnline = () => setMobileState(prev => ({ ...prev, isOffline: false }))
    const handleOffline = () => setMobileState(prev => ({ ...prev, isOffline: true }))

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [isEmergencyMode])

  // Fetch professionals with caching
  const { data: professionalsData, isLoading: professionalsLoading } = useQuery({
    queryKey: ['professionals'],
    queryFn: async () => {
      if (mobileState.isOffline && mobileState.cachedProfessionals.length > 0) {
        return mobileState.cachedProfessionals
      }
      const data = await (trpc as { professional: { getAll: { useQuery: () => { fn: () => Promise<ProfessionalDetails[]> } } } }).professional.getAll.useQuery().fn()
      // Cache for offline use
      localStorage.setItem(STORAGE_KEYS.PROFESSIONALS, JSON.stringify(data))
      setMobileState(prev => ({ ...prev, cachedProfessionals: data, lastSyncTime: new Date() }))
      return data
    },
    enabled: !mobileState.isOffline || mobileState.cachedProfessionals.length === 0,
  })

  // Fetch procedures with caching
  const { data: proceduresData, isLoading: proceduresLoading } = useQuery({
    queryKey: ['aesthetic-procedures'],
    queryFn: async () => {
      if (mobileState.isOffline && mobileState.cachedProcedures.length > 0) {
        return mobileState.cachedProcedures
      }
      const data = await (trpc as { 
        aestheticScheduling: { 
          getAestheticProcedures: { 
            useQuery: (params: { limit: number; offset: number }, options: { select: (data: { procedures: AestheticProcedure[] }) => AestheticProcedure[] }) => { fn: () => Promise<AestheticProcedure[]> } 
          } 
        } 
      }).aestheticScheduling.getAestheticProcedures.useQuery(
        { limit: 100, offset: 0 },
        { select: (data: { procedures: AestheticProcedure[] }) => data.procedures }
      ).fn()
      // Cache for offline use
      localStorage.setItem(STORAGE_KEYS.PROCEDURES, JSON.stringify(data))
      setMobileState(prev => ({ ...prev, cachedProcedures: data, lastSyncTime: new Date() }))
      return data
    },
    enabled: !mobileState.isOffline || mobileState.cachedProcedures.length === 0,
  })

  // Validate certifications mutation
  const validateMutation = useMutation({
    mutationFn: async ({ professionalId, procedureIds }: { professionalId: string; procedureIds: string[] }) => {
      if (mobileState.isOffline) {
        // Offline validation using cached data
        return performOfflineValidation(professionalId, procedureIds)
      }
      return await (trpc as { 
        aestheticScheduling: { 
          validateProfessionalCertifications: { 
            mutateAsync: (params: { professionalId: string; procedureIds: string[] }) => Promise<CertificationValidation> 
          } 
        } 
      }).aestheticScheduling.validateProfessionalCertifications.mutateAsync({
        professionalId: professionalId,
        procedureIds: procedureIds,
      })
    },
    onSuccess: (data: CertificationValidation) => {
      setValidationResults(data)
      onValidationComplete?.(data)
      
      // Cache validation results for offline access
      const cachedValidations = JSON.parse(localStorage.getItem(STORAGE_KEYS.VALIDATIONS) || '[]')
      cachedValidations.push({
        ...data,
        timestamp: new Date().toISOString(),
        professionalId: professionalId,
        procedureIds: procedureIds,
      })
      localStorage.setItem(STORAGE_KEYS.VALIDATIONS, JSON.stringify(cachedValidations.slice(-50))) // Keep last 50
      
      queryClient.invalidateQueries({ queryKey: ['professionals'] })
    },
    onError: (error: unknown) => {
      onError?.(error as Error)
    },
  })

  // Offline validation simulation
  const performOfflineValidation = useCallback((profId: string, procIds: string[]) => {
    const professional = mobileState.cachedProfessionals.find((p: ProfessionalDetails) => p.id === profId)
    const procedures = mobileState.cachedProcedures.filter((p: AestheticProcedure) => procIds.includes(p.id))
    
    if (!professional || !procedures.length) {
      throw new Error('Dados não disponíveis offline')
    }

    // Simulate validation based on cached data
    const hasRequiredCerts = procedures.every(p => !p.requiresCertification || 
      professional.certifications?.some((c: ProfessionalCertification) => c.procedureId === p.id))

    return {
      id: `offline_${Date.now()}`,
      professionalId,
      procedureId: procedureIds.join(','),
      isValid: hasRequiredCerts,
      warnings: hasRequiredCerts ? [] : ['Validação offline - verificar online quando possível'],
      recommendations: ['Manter certificações atualizadas'],
      experienceLevel: professional.experienceLevel || 'intermediate',
      complianceStatus: hasRequiredCerts ? 'compliant' : 'warning',
      professional: professional.fullName,
    }
  }, [mobileState.cachedProfessionals, mobileState.cachedProcedures])

  const filteredProfessionals = professionalsData?.filter((professional: ProfessionalDetails) =>
    professional.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    professional.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const filteredProcedures = proceduresData?.filter((procedure: AestheticProcedure) =>
    procedure.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    procedure.category.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const handleProfessionalSelect = (professionalId: string) => {
    setSelectedProfessional(professionalId)
    setSelectedProcedures([])
    setValidationResults(null)
    // Haptic feedback for mobile devices
    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }
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

  const handleEmergencyValidate = () => {
    if (filteredProfessionals.length > 0) {
      // Quick validation for most recent professional
      const recentProfessional = filteredProfessionals[0]
      setSelectedProfessional(recentProfessional.id)
      const urgentProcedures = filteredProcedures.slice(0, 2) // Top 2 most urgent
      setSelectedProcedures(urgentProcedures.map(p => p.id))
      
      setTimeout(() => {
        validateMutation.mutate({
          professionalId: recentProfessional.id,
          procedureIds: urgentProcedures.map(p => p.id),
        })
      }, 500)
    }
  }

  const selectedProfessionalData = professionalsData?.find((p: ProfessionalDetails) => p.id === selectedProfessional)
  const selectedProceduresData = proceduresData?.filter((p: AestheticProcedure) => selectedProcedures.includes(p.id)) || []
  const isValidating = validateMutation.isPending

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
        return <Award className='h-5 w-5' />
      case 'advanced':
        return <Shield className='h-5 w-5' />
      case 'intermediate':
        return <Clock className='h-5 w-5' />
      case 'beginner':
        return <AlertTriangle className='h-5 w-5' />
      default:
        return <User className='h-5 w-5' />
    }
  }

  // Emergency Panel Component
  const EmergencyPanel = () => (
    showEmergencyPanel && (
      <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end'>
        <div className='bg-white w-full h-[80vh] rounded-t-2xl p-6'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-xl font-bold text-red-600 flex items-center gap-2'>
              <AlertTriangle className='h-6 w-6' />
              Modo Emergência
            </h2>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setShowEmergencyPanel(false)}
              className='h-10 w-10 p-0'
            >
              ×
            </Button>
          </div>
          
          <Alert className='mb-6 border-red-200 bg-red-50'>
            <AlertTriangle className='h-4 w-4' />
            <AlertTitle>Modo Emergência SAMU</AlertTitle>
            <AlertDescription>
              Validação acelerada para atendimento de urgência. Use apenas em situações críticas.
            </AlertDescription>
          </Alert>
          
          <div className='space-y-4'>
            <Button
              size='lg'
              className='w-full h-14 bg-red-600 hover:bg-red-700 text-lg font-semibold'
              onClick={handleEmergencyValidate}
            >
              <Heart className='h-6 w-6 mr-2' />
              Validação Emergencial
            </Button>
            
            <div className='grid grid-cols-2 gap-3'>
              <Button
                variant='outline'
                size='lg'
                className='h-12'
                onClick={() => window.location.href = 'tel:+551112345678'}
              >
                <Phone className='h-5 w-5 mr-2' />
                Clínica de Estética
              </Button>
              <Button
                variant='outline'
                size='lg'
                className='h-12'
                onClick={() => window.location.href = 'tel:193'}
              >
                <Phone className='h-5 w-5 mr-2' />
                Bombeiros
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  )

  // Touch-optimized mobile components
  const MobileProfessionalCard = ({ professional, isSelected, onSelect }: { professional: ProfessionalDetails; isSelected: boolean; onSelect: (id: string) => void }) => (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md mb-3 ${isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''}`}
      onClick={() => onSelect(professional.id)}
    >
      <CardContent className='p-4'>
        <div className='flex items-start justify-between mb-3'>
          <div className='flex-1'>
            <h3 className='font-semibold text-gray-900 text-base mb-1'>{professional.fullName}</h3>
            <p className='text-sm text-gray-600 mb-2'>{professional.specialization}</p>
            <div className='flex items-center gap-2 text-sm text-gray-700'>
              <span className='font-medium'>CRM: {professional.licenseNumber}</span>
            </div>
          </div>
          <div className='flex flex-col items-end gap-2'>
            {isSelected && <CheckCircle className='h-6 w-6 text-green-600' />}
            <div className='flex flex-wrap gap-1 justify-end'>
              <Badge variant='outline' className='text-xs'>
                {professional.certifications?.length || 0} cert
              </Badge>
              <Badge variant='outline' className='text-xs'>
                {professional.specializations?.length || 0} esp
              </Badge>
            </div>
          </div>
        </div>
        <Button
          size='sm'
          className={`w-full h-12 text-sm font-medium ${isSelected ? 'bg-blue-600' : 'bg-gray-100 text-gray-700'}`}
          onClick={(e) => {
            e.stopPropagation()
            onSelect(professional.id)
          }}
        >
          {isSelected ? 'Selecionado' : 'Selecionar'}
        </Button>
      </CardContent>
    </Card>
  )

  const MobileProcedureCard = ({ procedure, isSelected, onSelect }: { procedure: AestheticProcedure; isSelected: boolean; onSelect: (id: string, checked: boolean) => void }) => (
    <Card className='mb-3 hover:shadow-md transition-shadow'>
      <CardContent className='p-4'>
        <div className='flex items-start gap-3 mb-3'>
          <div className='flex items-center h-6'>
            <input
              type='checkbox'
              id={procedure.id}
              checked={isSelected}
              onChange={e => onSelect(procedure.id, e.target.checked)}
              className='h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
              aria-label={`Selecionar procedimento ${procedure.name}`}
            />
          </div>
          <div className='flex-1'>
            <h3 className='font-semibold text-gray-900 text-base mb-1'>{procedure.name}</h3>
            <p className='text-sm text-gray-600 mb-2'>{procedure.description}</p>
            <div className='flex flex-wrap gap-2'>
              <Badge variant='secondary' className='text-xs'>{procedure.category}</Badge>
              <Badge variant='outline' className='text-xs'>{procedure.procedureType}</Badge>
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
  )

  return (
    <div className='min-h-screen bg-gray-50 pb-20'>
      {/* Mobile Header with Status Bar */}
      <div className='sticky top-0 bg-white shadow-sm z-10'>
        <div className='flex items-center justify-between p-4 border-b'>
          <div className='flex items-center gap-2'>
            <Shield className='h-6 w-6 text-blue-600' />
            <div>
              <h1 className='text-lg font-bold text-gray-900'>Validação CFM</h1>
              <p className='text-xs text-gray-600'>Certificações Profissionais</p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            {mobileState.isOffline ? (
              <WifiOff className='h-5 w-5 text-orange-500' />
            ) : (
              <Wifi className='h-5 w-5 text-green-500' />
            )}
            <Battery className='h-5 w-5 text-gray-400' />
          </div>
        </div>

        {/* Quick Actions */}
        <div className='flex gap-2 p-4 bg-blue-50'>
          <Button
            variant='outline'
            size='sm'
            className='flex-1 h-12 text-sm font-medium'
            onClick={() => setActiveTab('quick')}
          >
            <Zap className='h-4 w-4 mr-2' />
            Rápido
          </Button>
          <Button
            variant='outline'
            size='sm'
            className='flex-1 h-12 text-sm font-medium'
            onClick={() => setActiveTab('detailed')}
          >
            <User className='h-4 w-4 mr-2' />
            Detalhado
          </Button>
          <Button
            variant='outline'
            size='sm'
            className='h-12 text-sm font-medium px-3'
            onClick={() => setShowEmergencyPanel(!showEmergencyPanel)}
          >
            <AlertTriangle className='h-4 w-4' />
          </Button>
        </div>
      </div>

      {/* Status Alerts */}
      <div className='p-4'>
        {mobileState.isOffline && (
          <Alert className='mb-4 border-orange-200 bg-orange-50'>
            <WifiOff className='h-4 w-4' />
            <AlertTitle>Modo Offline</AlertTitle>
            <AlertDescription>
              Usando dados em cache. Última sincronização: {mobileState.lastSyncTime?.toLocaleString('pt-BR') || 'nunca'}
            </AlertDescription>
          </Alert>
        )}

        {validateMutation.error && (
          <Alert variant='destructive' className='mb-4'>
            <XCircle className='h-4 w-4' />
            <AlertTitle>Erro na Validação</AlertTitle>
            <AlertDescription>
              {validateMutation.error.message}
            </AlertDescription>
          </Alert>
        )}

        {mobileState.emergencyMode && (
          <Alert className='mb-4 border-red-200 bg-red-50'>
            <AlertTriangle className='h-4 w-4' />
            <AlertTitle>Modo Emergência Ativado</AlertTitle>
            <AlertDescription>
              Interface simplificada para resposta rápida
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Quick Validation Mode */}
      {activeTab === 'quick' && (
        <div className='px-4 pb-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-lg'>
                <Zap className='h-5 w-5 text-blue-600' />
                Validação Rápida
              </CardTitle>
              <CardDescription>
                Selecione profissional e procedimentos para validação imediata
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              {/* Search */}
              <div className='relative'>
                <Search className='absolute left-4 top-4 h-5 w-5 text-gray-400' />
                <Input
                  type='text'
                  placeholder='Buscar profissional...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='pl-12 h-12 text-base'
                  aria-label='Buscar profissional'
                />
              </div>

              {/* Professionals List */}
              <div className='space-y-3 max-h-64 overflow-y-auto'>
                {professionalsLoading ? (
                  <div className='flex items-center justify-center py-8'>
                    <Loader2 className='h-6 w-6 animate-spin' />
                    <span className='ml-2'>Carregando...</span>
                  </div>
                ) : (
                  filteredProfessionals.slice(0, 5).map((professional: ProfessionalDetails) => (
                    <MobileProfessionalCard
                      key={professional.id}
                      professional={professional}
                      isSelected={selectedProfessional === professional.id}
                      onSelect={handleProfessionalSelect}
                    />
                  ))
                )}
              </div>

              {/* Quick Procedure Selection */}
              {selectedProfessional && (
                <div className='space-y-3'>
                  <h3 className='font-medium text-gray-900'>Procedimentos para Validação</h3>
                  <div className='max-h-48 overflow-y-auto'>
                    {proceduresLoading ? (
                      <div className='flex items-center justify-center py-4'>
                        <Loader2 className='h-5 w-5 animate-spin' />
                        <span className='ml-2'>Carregando...</span>
                      </div>
                    ) : (
                      filteredProcedures.slice(0, 8).map((procedure: AestheticProcedure) => (
                        <MobileProcedureCard
                          key={procedure.id}
                          procedure={procedure}
                          isSelected={selectedProcedures.includes(procedure.id)}
                          onSelect={handleProcedureSelect}
                        />
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Validate Button */}
              <Button
                size='lg'
                className='w-full h-14 text-lg font-semibold'
                onClick={handleValidate}
                disabled={!selectedProfessional || selectedProcedures.length === 0 || isValidating}
              >
                {isValidating ? (
                  <>
                    <Loader2 className='h-5 w-5 mr-2 animate-spin' />
                    Validando...
                  </>
                ) : (
                  <>
                    <Shield className='h-5 w-5 mr-2' />
                    Validar Certificações ({selectedProcedures.length})
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Validation Results */}
      {validationResults && (
        <div className='px-4 pb-4'>
          <Card className={`${validationResults.isValid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                {validationResults.isValid ? (
                  <CheckCircle className='h-6 w-6 text-green-600' />
                ) : (
                  <XCircle className='h-6 w-6 text-red-600' />
                )}
                Resultado da Validação
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className={`p-4 rounded-lg ${validationResults.isValid ? 'bg-green-100' : 'bg-red-100'}`}>
                <h3 className={`font-semibold ${validationResults.isValid ? 'text-green-900' : 'text-red-900'}`}>
                  {validationResults.isValid ? 'Validação Aprovada' : 'Validação Reprovada'}
                </h3>
                <p className={`text-sm mt-1 ${validationResults.isValid ? 'text-green-700' : 'text-red-700'}`}>
                  {validationResults.isValid
                    ? 'Profissional qualificado para os procedimentos selecionados'
                    : 'Certificações insuficientes para os procedimentos'}
                </p>
              </div>

              {validationResults.experienceLevel && (
                <div className='flex items-center gap-3 p-3 bg-gray-100 rounded-lg'>
                  {getExperienceLevelIcon(validationResults.experienceLevel)}
                  <div>
                    <Badge className={getExperienceLevelColor(validationResults.experienceLevel)}>
                      {validationResults.experienceLevel.charAt(0).toUpperCase() + validationResults.experienceLevel.slice(1)}
                    </Badge>
                    <p className='text-xs text-gray-600 mt-1'>Nível de experiência</p>
                  </div>
                </div>
              )}

              {validationResults.missingCertifications && validationResults.missingCertifications.length > 0 && (
                <div className='p-3 bg-red-100 rounded-lg'>
                  <h4 className='font-medium text-red-900 mb-2'>Certificações Faltantes</h4>
                  <div className='space-y-1'>
                    {validationResults.missingCertifications.map((certification, index) => (
                      <div key={index} className='flex items-center gap-2'>
                        <XCircle className='h-4 w-4 text-red-600' />
                        <span className='text-sm text-red-800'>{certification}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Compliance Status */}
              <div className='p-3 bg-blue-100 rounded-lg'>
                <h4 className='font-medium text-blue-900 mb-2'>Conformidade</h4>
                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <CheckCircle className='h-4 w-4 text-green-600' />
                    <span className='text-sm text-blue-800'>
                      CFM: {validationResults.complianceStatus === 'compliant' ? 'Validado' : 'Pendente'}
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <CheckCircle className='h-4 w-4 text-green-600' />
                    <span className='text-sm text-blue-800'>
                      ANVISA: {validationResults.complianceStatus === 'compliant' ? 'Conforme' : 'Em análise'}
                    </span>
                  </div>
                </div>
              </div>

              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  className='flex-1 h-11'
                  onClick={() => setValidationResults(null)}
                >
                  Nova Validação
                </Button>
                <Button
                  size='sm'
                  className='flex-1 h-11'
                  onClick={() => window.print()}
                >
                  Imprimir Laudo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bottom Navigation Hint */}
      <div className='fixed bottom-0 left-0 right-0 bg-white border-t p-2'>
        <div className='flex items-center justify-center gap-4 text-xs text-gray-500'>
          <div className='flex items-center gap-1'>
            <Shield className='h-3 w-3' />
            CFM Compliant
          </div>
          <div className='flex items-center gap-1'>
            <MapPin className='h-3 w-3' />
            Brasil
          </div>
          <div className='flex items-center gap-1'>
            {mobileState.isOffline ? <WifiOff className='h-3 w-3' /> : <Wifi className='h-3 w-3' />}
            {mobileState.isOffline ? 'Offline' : 'Online'}
          </div>
        </div>
      </div>
      
      {/* Emergency Panel */}
      <EmergencyPanel />
    </div>
  )
}
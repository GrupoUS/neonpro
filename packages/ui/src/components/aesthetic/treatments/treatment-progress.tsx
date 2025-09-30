import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'
import { Badge } from '../../ui/badge'
import { Button } from '../../ui/button'
import { Progress } from '../../ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar'
import { 
  Clock, 
  Calendar, 
  CheckCircle, 
  Circle, 
  AlertCircle, 
  Play, 
  Pause, 
  RotateCcw,
  Heart,
  Sparkles,
  TrendingUp,
  Camera,
  Thermometer,
  Droplet,
  Zap,
  Shield,
  Star
} from 'lucide-react'

// NeonPro Aesthetic Brand Colors
const NEONPRO_COLORS = {
  primary: '#AC9469',      // Golden Primary - Aesthetic Luxury
  deepBlue: '#112031',     // Healthcare Professional - Trust & Reliability
  accent: '#D2AA60',       // Gold Accent - Premium Services
  neutral: '#B4AC9C',      // Calming Light Beige
  background: '#D2D0C8',   // Soft Gray Background
  wellness: '#E8D5B7',     // Soft wellness tone
  luxury: '#B8860B',       // Gold luxury accent
  purpleAccent: '#9B7EBD', // Soft purple for elegance
}

export interface TreatmentStep {
  id: string
  name: string
  description: string
  duration: number // in minutes
  status: 'pending' | 'in_progress' | 'completed' | 'paused'
  notes?: string
  beforeAfter?: {
    before?: string
    after?: string
  }
  metrics?: {
    temperature?: number
    hydration?: number
    satisfaction?: number
  }
  assignedTo?: string
  startedAt?: Date
  completedAt?: Date
}

export interface TreatmentProgressProps {
  treatmentId: string
  treatmentName: string
  clientId: string
  clientName: string
  aestheticianName: string
  aestheticianAvatar?: string
  room: string
  startTime: Date
  estimatedDuration: number // total minutes
  steps: TreatmentStep[]
  currentStepIndex: number
  treatmentType: string
  onStepStart?: (stepId: string) => void
  onStepComplete?: (stepId: string) => void
  onStepPause?: (stepId: string) => void
  onTreatmentComplete?: () => void
  onAddNote?: (stepId: string, note: string) => void
  onTakePhoto?: (stepId: string, type: 'before' | 'after') => void
  onUpdateMetrics?: (stepId: string, metrics: Record<string, unknown>) => void
  className?: string
}

const TREATMENT_TYPES = {
  facial: {
    name: 'Tratamento Facial',
    color: '#F472B6',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-300',
    icon: <Heart className="h-4 w-4" />
  },
  body: {
    name: 'Tratamento Corporal',
    color: '#60A5FA',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    icon: <Sparkles className="h-4 w-4" />
  },
  injection: {
    name: 'Tratamento Injetável',
    color: '#A78BFA',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300',
    icon: <Zap className="h-4 w-4" />
  },
  laser: {
    name: 'Tratamento a Laser',
    color: '#34D399',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-300',
    icon: <Shield className="h-4 w-4" />
  },
  wellness: {
    name: 'Bem-Estar',
    color: '#FCD34D',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-300',
    icon: <Star className="h-4 w-4" />
  }
}

export const TreatmentProgress: React.FC<TreatmentProgressProps> = ({
  treatmentId,
  treatmentName,
  clientId,
  clientName,
  aestheticianName,
  aestheticianAvatar,
  room,
  startTime,
  estimatedDuration,
  steps,
  currentStepIndex,
  treatmentType,
  onStepStart,
  onStepComplete,
  onStepPause,
  onTreatmentComplete,
  onAddNote,
  onTakePhoto,
  onUpdateMetrics,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  
  const treatmentConfig = TREATMENT_TYPES[treatmentType as keyof typeof TREATMENT_TYPES] || TREATMENT_TYPES.wellness
  const currentStep = steps[currentStepIndex]
  const completedSteps = steps.filter(step => step.status === 'completed').length
  const totalProgress = (completedSteps / steps.length) * 100

  // Timer for treatment progress
  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (!isPaused && currentStep?.status === 'in_progress') {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPaused, currentStep?.status])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getStepIcon = (status: TreatmentStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'in_progress':
        return <Play className="h-5 w-5 text-blue-600" />
      case 'paused':
        return <Pause className="h-5 w-5 text-yellow-600" />
      default:
        return <Circle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStepStatusColor = (status: TreatmentStep['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-300'
      case 'in_progress':
        return 'bg-blue-50 border-blue-300'
      case 'paused':
        return 'bg-yellow-50 border-yellow-300'
      default:
        return 'bg-gray-50 border-gray-300'
    }
  }

  const handleStepAction = (step: TreatmentStep, action: 'start' | 'complete' | 'pause') => {
    switch (action) {
      case 'start':
        if (step.status === 'pending') {
          setIsPaused(false)
          onStepStart?.(step.id)
        }
        break
      case 'pause':
        if (step.status === 'in_progress') {
          setIsPaused(true)
          onStepPause?.(step.id)
        }
        break
      case 'complete':
        if (step.status === 'in_progress') {
          onStepComplete?.(step.id)
          // Auto-start next step if available
          const nextStepIndex = steps.findIndex(s => s.id === step.id) + 1
          if (nextStepIndex < steps.length) {
            setTimeout(() => {
              onStepStart?.(steps[nextStepIndex].id)
            }, 1000)
          }
        }
        break
    }
  }

  const allStepsCompleted = steps.every(step => step.status === 'completed')

  return (
    <div className={`w-full space-y-6 ${className}`}>
      {/* Treatment Header */}
      <Card className={`${treatmentConfig.bgColor} ${treatmentConfig.borderColor} border-2`}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 border-2" style={{ borderColor: treatmentConfig.color }}>
                <AvatarImage src={aestheticianAvatar} alt={aestheticianName} />
                <AvatarFallback className="text-sm font-semibold">
                  {aestheticianName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  {treatmentConfig.icon}
                  {treatmentName}
                </CardTitle>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                  <span>Cliente: {clientName}</span>
                  <span>Esteticista: {aestheticianName}</span>
                  <span>Sala: {room}</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <Badge variant="default" className="mb-2" style={{ backgroundColor: treatmentConfig.color, color: 'white' }}>
                {treatmentConfig.name}
              </Badge>
              <div className="text-sm text-gray-600">
                <div>Início: {startTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                <div>Duração: {estimatedDuration}min</div>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Overall Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Progresso Total</span>
              <span className="text-sm font-bold" style={{ color: treatmentConfig.color }}>
                {completedSteps}/{steps.length} passos ({Math.round(totalProgress)}%)
              </span>
            </div>
            <Progress value={totalProgress} className="h-3" />
            
            {currentStep && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Passo atual:</span>
                <span className="font-semibold">{currentStep.name}</span>
              </div>
            )}
          </div>
          
          {/* Current Timer */}
          {currentStep?.status === 'in_progress' && (
            <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-semibold">Tempo do Passo Atual</span>
                </div>
                <div className="text-2xl font-mono font-bold text-blue-600">
                  {formatTime(elapsedTime)}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="steps">Etapas</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
          <TabsTrigger value="photos">Fotos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumo do Tratamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-600">{completedSteps}</div>
                  <div className="text-xs text-gray-600">Etapas Concluídas</div>
                </div>
                
                <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">{steps.length - completedSteps}</div>
                  <div className="text-xs text-gray-600">Etapas Restantes</div>
                </div>
                
                <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-2xl font-bold text-purple-600">{Math.round(totalProgress)}%</div>
                  <div className="text-xs text-gray-600">Progresso</div>
                </div>
                
                <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="text-2xl font-bold text-yellow-600">
                    {currentStep?.duration || 0}min
                  </div>
                  <div className="text-xs text-gray-600">Duração Atual</div>
                </div>
              </div>

              {/* Current Step Details */}
              {currentStep && (
                <div className={`p-4 rounded-lg border-2 ${getStepStatusColor(currentStep.status)}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getStepIcon(currentStep.status)}
                      <h3 className="font-semibold text-lg">{currentStep.name}</h3>
                    </div>
                    <Badge variant="outline">
                      {currentStep.duration} minutos
                    </Badge>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{currentStep.description}</p>
                  
                  {currentStep.assignedTo && (
                    <div className="text-sm text-gray-600 mb-3">
                      Atribuído a: <span className="font-semibold">{currentStep.assignedTo}</span>
                    </div>
                  )}
                  
                  {/* Step Actions */}
                  <div className="flex gap-2">
                    {currentStep.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => handleStepAction(currentStep, 'start')}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Iniciar Etapa
                      </Button>
                    )}
                    
                    {currentStep.status === 'in_progress' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStepAction(currentStep, 'pause')}
                        >
                          <Pause className="h-3 w-3 mr-1" />
                          Pausar
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleStepAction(currentStep, 'complete')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Concluir
                        </Button>
                      </>
                    )}
                    
                    {currentStep.status === 'paused' && (
                      <Button
                        size="sm"
                        onClick={() => handleStepAction(currentStep, 'start')}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Continuar
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Treatment Complete */}
              {allStepsCompleted && (
                <div className="p-4 bg-green-50 border-2 border-green-300 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <h3 className="font-semibold text-lg text-green-800">Tratamento Concluído!</h3>
                  </div>
                  <p className="text-green-700 mb-4">
                    Todas as etapas do tratamento foram concluídas com sucesso.
                  </p>
                  <Button
                    onClick={onTreatmentComplete}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Finalizar Tratamento
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="steps" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Etapas do Tratamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`p-4 rounded-lg border-2 ${getStepStatusColor(step.status)} ${
                      index === currentStepIndex ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getStepIcon(step.status)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{step.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              {step.duration}min
                            </Badge>
                            {index === currentStepIndex && (
                              <Badge variant="default" className="text-xs bg-blue-600">
                                Atual
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{step.description}</p>
                          
                          {step.notes && (
                            <div className="text-xs text-gray-600 p-2 bg-yellow-50 rounded mb-2">
                              <strong>Nota:</strong> {step.notes}
                            </div>
                          )}
                          
                          {step.assignedTo && (
                            <div className="text-xs text-gray-600">
                              Atribuído a: <span className="font-semibold">{step.assignedTo}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-1 ml-4">
                        {step.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStepAction(step, 'start')}
                            className="h-8 px-2 text-xs"
                          >
                            <Play className="h-3 w-3" />
                          </Button>
                        )}
                        
                        {step.status === 'in_progress' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStepAction(step, 'pause')}
                              className="h-8 px-2 text-xs"
                            >
                              <Pause className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStepAction(step, 'complete')}
                              className="h-8 px-2 text-xs"
                            >
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                        
                        {step.status === 'paused' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStepAction(step, 'start')}
                            className="h-8 px-2 text-xs"
                          >
                            <Play className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Métricas do Tratamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Temperature */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Thermometer className="h-4 w-4 text-red-600" />
                    Temperatura da Pele
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-red-600">
                        {currentStep?.metrics?.temperature || '--'}°C
                      </span>
                      <Button size="sm" variant="outline" className="h-8 px-2 text-xs">
                        Atualizar
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Hydration */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Droplet className="h-4 w-4 text-blue-600" />
                    Hidratação
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-blue-600">
                        {currentStep?.metrics?.hydration || '--'}%
                      </span>
                      <Button size="sm" variant="outline" className="h-8 px-2 text-xs">
                        Atualizar
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Satisfaction */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Heart className="h-4 w-4 text-pink-600" />
                    Satisfação do Cliente
                  </div>
                  <div className="p-3 bg-pink-50 rounded-lg border border-pink-200">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-pink-600">
                        {currentStep?.metrics?.satisfaction || '--'}/10
                      </span>
                      <Button size="sm" variant="outline" className="h-8 px-2 text-xs">
                        Avaliar
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Additional Metrics */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    Resultado Estimado
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="text-lg font-bold text-purple-600">
                      Excelente
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Baseado no progresso atual
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="photos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Registro Fotográfico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Before Photo */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Antes do Tratamento</h4>
                  <div className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <div className="text-center">
                      <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Nenhuma foto "antes"</p>
                      <Button size="sm" variant="outline" className="mt-2">
                        <Camera className="h-3 w-3 mr-1" />
                        Tirar Foto
                      </Button>
                    </div>
                  </div>
                </div>

                {/* After Photo */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Após o Tratamento</h4>
                  <div className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <div className="text-center">
                      <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Nenhuma foto "depois"</p>
                      <Button size="sm" variant="outline" className="mt-2" disabled>
                        <Camera className="h-3 w-3 mr-1" />
                        Aguardar Conclusão
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              {currentStep?.beforeAfter && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-sm mb-3">Fotos da Etapa Atual</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {currentStep.beforeAfter.before && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Antes da etapa:</p>
                        <div className="aspect-video bg-gray-200 rounded flex items-center justify-center">
                          <Camera className="h-6 w-6 text-gray-400" />
                        </div>
                      </div>
                    )}
                    {currentStep.beforeAfter.after && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Após etapa:</p>
                        <div className="aspect-video bg-gray-200 rounded flex items-center justify-center">
                          <Camera className="h-6 w-6 text-gray-400" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default TreatmentProgress
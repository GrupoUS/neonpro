"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { 
  Accessibility, 
  Heart, 
  Stethoscope, 
  Activity, 
  AlertCircle, 
  CheckCircle2,
  User,
  Settings,
  Shield,
  Eye,
  Hand,
  Brain,
  Volume2,
  Zap,
  Target,
  Phone,
  Clock,
  FileText,
  Bell,
  Home,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Save
} from 'lucide-react'

// Import all accessibility components
import { 
  SwitchNavigationProvider, 
  SwitchNavigationSettings, 
  SwitchNavigationDemo 
} from './switch-navigation-controller'
import { 
  EyeTrackingProvider, 
  EyeTrackingSettings, 
  EyeTrackingDemo 
} from './eye-tracking-interaction'
import { 
  TremorFriendlyProvider, 
  TremorFriendlySettings, 
  TremorFriendlyDemo 
} from './tremor-friendly-controls'
import { 
  VoiceMedicalProvider, 
  VoiceMedicalSettings, 
  VoiceMedicalDemo 
} from './voice-medical-controller'
import { 
  OneHandedOperationProvider, 
  OneHandedOperationSettings, 
  OneHandedOperationDemo 
} from './one-handed-operation-mode'
import { 
  CognitiveAccessibilityProvider, 
  CognitiveAccessibilitySettings, 
  CognitiveAccessibilityDemo 
} from './cognitive-accessibility-helper'
import { 
  VisualAccessibilityProvider, 
  VisualAccessibilitySettings, 
  VisualAccessibilityDemo 
} from './visual-accessibility-enhancer'
import { 
  AssistiveTechnologyAPIProvider, 
  AssistiveTechnologyAPISettings, 
  AssistiveTechnologyAPIDemo 
} from './assistive-technology-api'

// ===============================
// TYPES & INTERFACES
// ===============================

export type HealthcareScenario = 
  | 'post_botox'
  | 'bandaged_hand'
  | 'post_cataract'
  | 'post_anesthesia'
  | 'tremor_management'
  | 'cognitive_recovery'
  | 'emergency_situation'

export interface PatientProfile {
  id: string
  name: string
  age: number
  medical_conditions: string[]
  accessibility_needs: string[]
  preferred_language: string
  emergency_contact: string
  current_scenario: HealthcareScenario
  last_procedure: string
  recovery_stage: 'acute' | 'intermediate' | 'advanced'
}

export interface AccessibilityConfiguration {
  switch_navigation: boolean
  eye_tracking: boolean
  tremor_friendly: boolean
  voice_medical: boolean
  one_handed_operation: boolean
  cognitive_accessibility: boolean
  visual_accessibility: boolean
  assistive_technology_api: boolean
  emergency_mode: boolean
}

// ===============================
// CONSTANTS & CONFIGURATIONS
// ===============================

const HEALTHCARE_SCENARIOS = {
  'post_botox': {
    name_pt: 'Pós-Aplicação de Botox',
    description_pt: 'Paciente com limitações de movimento facial e possível sensibilidade',
    recommended_features: ['voice_medical', 'visual_accessibility', 'cognitive_accessibility'],
    duration_hours: 4,
    priority_level: 'medium'
  },
  'bandaged_hand': {
    name_pt: 'Mão Enfaixada/Curativo',
    description_pt: 'Paciente com uma das mãos imobilizada',
    recommended_features: ['one_handed_operation', 'voice_medical', 'eye_tracking'],
    duration_hours: 24,
    priority_level: 'high'
  },
  'post_cataract': {
    name_pt: 'Pós-Cirurgia de Catarata',
    description_pt: 'Paciente com limitações visuais temporárias',
    recommended_features: ['visual_accessibility', 'voice_medical', 'assistive_technology_api'],
    duration_hours: 72,
    priority_level: 'high'
  },
  'post_anesthesia': {
    name_pt: 'Pós-Anestesia',
    description_pt: 'Paciente com capacidades cognitivas reduzidas temporariamente',
    recommended_features: ['cognitive_accessibility', 'visual_accessibility', 'voice_medical'],
    duration_hours: 8,
    priority_level: 'high'
  },
  'tremor_management': {
    name_pt: 'Controle de Tremor',
    description_pt: 'Paciente com tremor essencial ou induzido por medicação',
    recommended_features: ['tremor_friendly', 'switch_navigation', 'voice_medical'],
    duration_hours: 168, // 1 week
    priority_level: 'medium'
  },
  'cognitive_recovery': {
    name_pt: 'Recuperação Cognitiva',
    description_pt: 'Paciente em reabilitação cognitiva após procedimento',
    recommended_features: ['cognitive_accessibility', 'visual_accessibility', 'voice_medical'],
    duration_hours: 336, // 2 weeks
    priority_level: 'medium'
  },
  'emergency_situation': {
    name_pt: 'Situação de Emergência',
    description_pt: 'Situação crítica que requer acesso imediato a cuidados',
    recommended_features: ['assistive_technology_api', 'voice_medical', 'visual_accessibility'],
    duration_hours: 1,
    priority_level: 'emergency'
  }
}

const SAMPLE_PATIENTS: PatientProfile[] = [
  {
    id: 'patient_001',
    name: 'Maria Silva Santos',
    age: 45,
    medical_conditions: ['Rugas de Expressão', 'Estresse'],
    accessibility_needs: ['Movimento Facial Limitado', 'Sensibilidade à Luz'],
    preferred_language: 'pt-BR',
    emergency_contact: '+55 11 99999-0001',
    current_scenario: 'post_botox',
    last_procedure: 'Aplicação de Botox na Testa',
    recovery_stage: 'acute'
  },
  {
    id: 'patient_002',
    name: 'João Oliveira Costa',
    age: 32,
    medical_conditions: ['Corte na Mão', 'Ansiedade'],
    accessibility_needs: ['Mão Direita Imobilizada', 'Dificuldade de Concentração'],
    preferred_language: 'pt-BR',
    emergency_contact: '+55 11 99999-0002',
    current_scenario: 'bandaged_hand',
    last_procedure: 'Sutura de Corte Profundo',
    recovery_stage: 'intermediate'
  },
  {
    id: 'patient_003',
    name: 'Ana Pereira Lima',
    age: 68,
    medical_conditions: ['Catarata', 'Diabetes'],
    accessibility_needs: ['Visão Reduzida', 'Sensibilidade à Luz'],
    preferred_language: 'pt-BR',
    emergency_contact: '+55 11 99999-0003',
    current_scenario: 'post_cataract',
    last_procedure: 'Facoemulsificação com IOL',
    recovery_stage: 'acute'
  },
  {
    id: 'patient_004',
    name: 'Carlos Rodrigues Souza',
    age: 55,
    medical_conditions: ['Tremor Essencial', 'Hipertensão'],
    accessibility_needs: ['Tremor nas Mãos', 'Dificuldade Motora Fina'],
    preferred_language: 'pt-BR',
    emergency_contact: '+55 11 99999-0004',
    current_scenario: 'tremor_management',
    last_procedure: 'Ajuste de Medicação para Tremor',
    recovery_stage: 'advanced'
  }
]

// ===============================
// COMPREHENSIVE PROVIDER WRAPPER
// ===============================

function AccessibilityProvidersWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SwitchNavigationProvider>
      <EyeTrackingProvider>
        <TremorFriendlyProvider>
          <VoiceMedicalProvider>
            <OneHandedOperationProvider>
              <CognitiveAccessibilityProvider>
                <VisualAccessibilityProvider>
                  <AssistiveTechnologyAPIProvider>
                    {children}
                  </AssistiveTechnologyAPIProvider>
                </VisualAccessibilityProvider>
              </CognitiveAccessibilityProvider>
            </OneHandedOperationProvider>
          </VoiceMedicalProvider>
        </TremorFriendlyProvider>
      </EyeTrackingProvider>
    </SwitchNavigationProvider>
  )
}

// ===============================
// MAIN INTEGRATION EXAMPLE COMPONENT
// ===============================

export function AccessibilityIntegrationExample() {
  const [currentPatient, setCurrentPatient] = useState<PatientProfile>(SAMPLE_PATIENTS[0])
  const [accessibilityConfig, setAccessibilityConfig] = useState<AccessibilityConfiguration>({
    switch_navigation: false,
    eye_tracking: false,
    tremor_friendly: false,
    voice_medical: false,
    one_handed_operation: false,
    cognitive_accessibility: false,
    visual_accessibility: false,
    assistive_technology_api: false,
    emergency_mode: false
  })
  const [scenarioProgress, setScenarioProgress] = useState(25)
  const [currentStep, setCurrentStep] = useState(1)
  const [isEmergencyActive, setIsEmergencyActive] = useState(false)

  // Auto-configure accessibility based on patient scenario
  const configureForScenario = useCallback((scenario: HealthcareScenario) => {
    const scenarioConfig = HEALTHCARE_SCENARIOS[scenario]
    const newConfig: AccessibilityConfiguration = {
      switch_navigation: false,
      eye_tracking: false,
      tremor_friendly: false,
      voice_medical: false,
      one_handed_operation: false,
      cognitive_accessibility: false,
      visual_accessibility: false,
      assistive_technology_api: false,
      emergency_mode: scenario === 'emergency_situation'
    }

    // Enable recommended features
    scenarioConfig.recommended_features.forEach(feature => {
      newConfig[feature as keyof AccessibilityConfiguration] = true
    })

    // Always enable AT API for medical scenarios
    newConfig.assistive_technology_api = true

    setAccessibilityConfig(newConfig)
    setIsEmergencyActive(scenario === 'emergency_situation')
  }, [])

  // Auto-configure when patient changes
  useEffect(() => {
    configureForScenario(currentPatient.current_scenario)
  }, [currentPatient, configureForScenario])

  // Simulate scenario progress
  useEffect(() => {
    const interval = setInterval(() => {
      setScenarioProgress(prev => {
        if (prev >= 100) {return 25} // Reset to beginning
        return prev + 5
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const handlePatientChange = (patientId: string) => {
    const patient = SAMPLE_PATIENTS.find(p => p.id === patientId)
    if (patient) {
      setCurrentPatient(patient)
      setCurrentStep(1)
    }
  }

  const handleEmergencyActivation = () => {
    const emergencyPatient = {
      ...currentPatient,
      current_scenario: 'emergency_situation' as HealthcareScenario
    }
    setCurrentPatient(emergencyPatient)
    setIsEmergencyActive(true)
    configureForScenario('emergency_situation')
  }

  const handleScenarioStep = (step: number) => {
    setCurrentStep(step)
    // Adjust accessibility configuration based on recovery progress
    if (step >= 3 && currentPatient.recovery_stage === 'acute') {
      setCurrentPatient(prev => ({ ...prev, recovery_stage: 'intermediate' }))
    }
    if (step >= 5 && currentPatient.recovery_stage === 'intermediate') {
      setCurrentPatient(prev => ({ ...prev, recovery_stage: 'advanced' }))
    }
  }

  return (
    <AccessibilityProvidersWrapper>
      <div className="space-y-6 p-6">
        {/* Header */}
        <Card className={isEmergencyActive ? "border-red-500 bg-red-50" : ""}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Accessibility className="h-6 w-6" />
              <CardTitle>Sistema Integrado de Acessibilidade Médica</CardTitle>
              {isEmergencyActive && (
                <Badge variant="destructive" className="ml-auto">
                  MODO EMERGÊNCIA
                </Badge>
              )}
            </div>
            <CardDescription>
              Demonstração completa da integração de todos os componentes de acessibilidade
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Patient Selection and Current Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Perfil do Paciente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={currentPatient.id} onValueChange={handlePatientChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SAMPLE_PATIENTS.map(patient => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name} - {HEALTHCARE_SCENARIOS[patient.current_scenario].name_pt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="space-y-2 text-sm">
                <div><strong>Idade:</strong> {currentPatient.age} anos</div>
                <div><strong>Cenário:</strong> {HEALTHCARE_SCENARIOS[currentPatient.current_scenario].name_pt}</div>
                <div><strong>Último Procedimento:</strong> {currentPatient.last_procedure}</div>
                <div><strong>Estágio de Recuperação:</strong> 
                  <Badge variant="outline" className="ml-1">
                    {currentPatient.recovery_stage === 'acute' ? 'Agudo' : 
                     currentPatient.recovery_stage === 'intermediate' ? 'Intermediário' : 'Avançado'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Necessidades de Acessibilidade:</div>
                <div className="flex flex-wrap gap-1">
                  {currentPatient.accessibility_needs.map((need, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {need}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Progresso do Cenário
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progresso da Recuperação</span>
                  <span>{scenarioProgress}%</span>
                </div>
                <Progress value={scenarioProgress} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Etapa Atual:</div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(step => (
                    <Button
                      key={step}
                      size="sm"
                      variant={step === currentStep ? "default" : step < currentStep ? "secondary" : "outline"}
                      onClick={() => handleScenarioStep(step)}
                      className="w-8 h-8 p-0"
                    >
                      {step}
                    </Button>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleEmergencyActivation}
                variant="destructive"
                className="w-full"
                disabled={isEmergencyActive}
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                {isEmergencyActive ? 'EMERGÊNCIA ATIVA' : 'Simular Emergência'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Accessibility Features Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuração de Acessibilidade Ativa
            </CardTitle>
            <CardDescription>
              Recursos habilitados automaticamente baseados no cenário médico
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(accessibilityConfig).map(([key, enabled]) => {
                const featureNames: Record<string, { name: string; icon: React.ReactNode }> = {
                  'switch_navigation': { name: 'Navegação por Botão', icon: <Hand className="h-4 w-4" /> },
                  'eye_tracking': { name: 'Rastreamento Ocular', icon: <Eye className="h-4 w-4" /> },
                  'tremor_friendly': { name: 'Anti-Tremor', icon: <Target className="h-4 w-4" /> },
                  'voice_medical': { name: 'Voz Médica', icon: <Volume2 className="h-4 w-4" /> },
                  'one_handed_operation': { name: 'Uma Mão', icon: <Hand className="h-4 w-4" /> },
                  'cognitive_accessibility': { name: 'Suporte Cognitivo', icon: <Brain className="h-4 w-4" /> },
                  'visual_accessibility': { name: 'Melhorias Visuais', icon: <Eye className="h-4 w-4" /> },
                  'assistive_technology_api': { name: 'API de AT', icon: <Zap className="h-4 w-4" /> },
                  'emergency_mode': { name: 'Modo Emergência', icon: <AlertCircle className="h-4 w-4" /> }
                }

                const feature = featureNames[key]
                if (!feature) {return null}

                return (
                  <div key={key} className={`p-3 border rounded-lg ${enabled ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {feature.icon}
                      <span className="text-sm font-medium">{feature.name}</span>
                    </div>
                    <Badge variant={enabled ? "default" : "secondary"} className="text-xs">
                      {enabled ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Healthcare Workflow Simulation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Fluxo de Cuidados Médicos Adaptativo
            </CardTitle>
            <CardDescription>
              Simulação de tarefas médicas com acessibilidade integrada
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="assessment" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="assessment">Avaliação</TabsTrigger>
                <TabsTrigger value="medication">Medicação</TabsTrigger>
                <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
                <TabsTrigger value="discharge">Alta</TabsTrigger>
              </TabsList>

              <TabsContent value="assessment" className="space-y-4">
                <Alert>
                  <Stethoscope className="h-4 w-4" />
                  <AlertTitle>Avaliação Inicial do Paciente</AlertTitle>
                  <AlertDescription>
                    Coleta de informações com suporte de acessibilidade baseado no perfil
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Escala de Dor
                    </h4>
                    <div className="space-y-2">
                      <Slider defaultValue={[3]} max={10} step={1} className="w-full" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0 - Sem dor</span>
                        <span>10 - Dor insuportável</span>
                      </div>
                    </div>
                    {accessibilityConfig.voice_medical && (
                      <Badge variant="outline" className="mt-2 text-xs">
                        Comando de voz: "Dor nível 3"
                      </Badge>
                    )}
                  </Card>

                  <Card className="p-4">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Avaliação Visual
                    </h4>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <Button size="sm" variant="outline">Visão Clara</Button>
                        <Button size="sm" variant="outline">Visão Turva</Button>
                        <Button size="sm" variant="outline">Sensibilidade à Luz</Button>
                        <Button size="sm" variant="outline">Sem Problemas</Button>
                      </div>
                    </div>
                    {accessibilityConfig.eye_tracking && (
                      <Badge variant="outline" className="mt-2 text-xs">
                        Seleção por olhar habilitada
                      </Badge>
                    )}
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="medication" className="space-y-4">
                <Alert>
                  <Bell className="h-4 w-4" />
                  <AlertTitle>Gerenciamento de Medicação</AlertTitle>
                  <AlertDescription>
                    Administração e lembretes de medicamentos com suporte adaptativo
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  {[
                    { name: 'Dipirona 500mg', time: '14:00', status: 'pending' },
                    { name: 'Omeprazol 20mg', time: '18:00', status: 'completed' },
                    { name: 'Ibuprofeno 600mg', time: '22:00', status: 'scheduled' }
                  ].map((med, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          med.status === 'completed' ? 'bg-green-500' :
                          med.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-300'
                        }`} />
                        <div>
                          <div className="font-medium">{med.name}</div>
                          <div className="text-sm text-muted-foreground">Horário: {med.time}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          med.status === 'completed' ? 'default' :
                          med.status === 'pending' ? 'secondary' : 'outline'
                        }>
                          {med.status === 'completed' ? 'Tomado' :
                           med.status === 'pending' ? 'Pendente' : 'Agendado'}
                        </Badge>
                        {med.status === 'pending' && (
                          <Button size="sm">Confirmar</Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {accessibilityConfig.cognitive_accessibility && (
                  <Alert>
                    <Brain className="h-4 w-4" />
                    <AlertTitle>Lembrete Cognitivo Ativo</AlertTitle>
                    <AlertDescription>
                      Lembretes visuais e auditivos configurados para medicação às 14:00
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              <TabsContent value="monitoring" className="space-y-4">
                <Alert>
                  <Activity className="h-4 w-4" />
                  <AlertTitle>Monitoramento Contínuo</AlertTitle>
                  <AlertDescription>
                    Acompanhamento de sinais vitais e recuperação
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4 text-center">
                    <Heart className="h-8 w-8 mx-auto mb-2 text-red-500" />
                    <div className="text-2xl font-bold">72</div>
                    <div className="text-sm text-muted-foreground">BPM</div>
                  </Card>

                  <Card className="p-4 text-center">
                    <Activity className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <div className="text-2xl font-bold">120/80</div>
                    <div className="text-sm text-muted-foreground">mmHg</div>
                  </Card>

                  <Card className="p-4 text-center">
                    <Target className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <div className="text-2xl font-bold">98%</div>
                    <div className="text-sm text-muted-foreground">SpO2</div>
                  </Card>
                </div>

                {accessibilityConfig.tremor_friendly && (
                  <Alert>
                    <Target className="h-4 w-4" />
                    <AlertTitle>Compensação de Tremor Ativa</AlertTitle>
                    <AlertDescription>
                      Interface estabilizada para interação precisa com controles médicos
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              <TabsContent value="discharge" className="space-y-4">
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertTitle>Processo de Alta</AlertTitle>
                  <AlertDescription>
                    Instruções e documentação acessível para cuidados domiciliares
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <Card className="p-4">
                    <h4 className="font-medium mb-3">Instruções de Cuidado Pós-Procedimento</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500" />
                        <span>Manter curativo limpo e seco por 24 horas</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500" />
                        <span>Aplicar compressa fria por 10 minutos, 3x ao dia</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500" />
                        <span>Retornar em caso de sangramento ou dor intensa</span>
                      </div>
                    </div>
                  </Card>

                  <div className="flex gap-2">
                    <Button className="flex-1">
                      <FileText className="h-4 w-4 mr-2" />
                      Imprimir Instruções
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Volume2 className="h-4 w-4 mr-2" />
                      Ler em Voz Alta
                    </Button>
                  </div>

                  {accessibilityConfig.visual_accessibility && (
                    <Alert>
                      <Eye className="h-4 w-4" />
                      <AlertTitle>Otimização Visual Ativa</AlertTitle>
                      <AlertDescription>
                        Texto ampliado e contraste ajustado para facilitar a leitura das instruções
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Emergency Actions Panel */}
        {isEmergencyActive && (
          <Card className="border-red-500 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-5 w-5" />
                Painel de Emergência
              </CardTitle>
              <CardDescription>
                Acesso rápido a funções críticas com máxima acessibilidade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button variant="destructive" size="lg" className="h-16">
                  <Phone className="h-6 w-6 mb-1" />
                  Chamar Enfermeira
                </Button>
                <Button variant="destructive" size="lg" className="h-16">
                  <Heart className="h-6 w-6 mb-1" />
                  Emergência Médica
                </Button>
                <Button variant="outline" size="lg" className="h-16">
                  <Activity className="h-6 w-6 mb-1" />
                  Registrar Sintomas
                </Button>
                <Button variant="outline" size="lg" className="h-16">
                  <User className="h-6 w-6 mb-1" />
                  Contatar Família
                </Button>
              </div>

              <Alert className="mt-4 border-red-200">
                <Shield className="h-4 w-4" />
                <AlertTitle>Configurações de Emergência Aplicadas</AlertTitle>
                <AlertDescription>
                  Todos os recursos de acessibilidade foram otimizados para situação crítica:
                  contraste máximo, texto grande, navegação simplificada, comandos de voz prioritários.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Integration Status and Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Status da Integração e Conformidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <div className="font-medium">WCAG 2.1 AA+</div>
                <div className="text-xs text-muted-foreground">Conformidade</div>
              </div>

              <div className="text-center p-4 border rounded-lg">
                <Shield className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <div className="font-medium">LGPD</div>
                <div className="text-xs text-muted-foreground">Compliant</div>
              </div>

              <div className="text-center p-4 border rounded-lg">
                <Activity className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <div className="font-medium">ANVISA</div>
                <div className="text-xs text-muted-foreground">Certificado</div>
              </div>

              <div className="text-center p-4 border rounded-lg">
                <Target className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                <div className="font-medium">CFM</div>
                <div className="text-xs text-muted-foreground">Aprovado</div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <div className="text-sm font-medium mb-2">Resumo da Sessão:</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="font-medium">8</div>
                  <div className="text-muted-foreground">Recursos Ativos</div>
                </div>
                <div>
                  <div className="font-medium">100%</div>
                  <div className="text-muted-foreground">Conformidade</div>
                </div>
                <div>
                  <div className="font-medium">2.3s</div>
                  <div className="text-muted-foreground">Tempo de Resposta</div>
                </div>
                <div>
                  <div className="font-medium">pt-BR</div>
                  <div className="text-muted-foreground">Idioma</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AccessibilityProvidersWrapper>
  )
}

// ===============================
// INDIVIDUAL COMPONENT DEMOS
// ===============================

export function IndividualComponentsDemos() {
  const [activeComponent, setActiveComponent] = useState<string>('overview')

  return (
    <AccessibilityProvidersWrapper>
      <Card className="w-full max-w-6xl">
        <CardHeader>
          <CardTitle>Demonstração de Componentes Individuais</CardTitle>
          <CardDescription>
            Teste e configure cada componente de acessibilidade separadamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeComponent} onValueChange={setActiveComponent}>
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="switch">Botão</TabsTrigger>
              <TabsTrigger value="eye">Olhar</TabsTrigger>
              <TabsTrigger value="tremor">Tremor</TabsTrigger>
              <TabsTrigger value="voice">Voz</TabsTrigger>
              <TabsTrigger value="hand">Uma Mão</TabsTrigger>
              <TabsTrigger value="cognitive">Cognitivo</TabsTrigger>
              <TabsTrigger value="visual">Visual</TabsTrigger>
              <TabsTrigger value="api">API AT</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Alert>
                <Accessibility className="h-4 w-4" />
                <AlertTitle>Sistema Completo de Acessibilidade</AlertTitle>
                <AlertDescription>
                  8 componentes integrados para máxima inclusividade em ambiente médico
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { key: 'switch', name: 'Navegação por Botão', icon: <Hand className="h-5 w-5" />, color: 'bg-blue-50' },
                  { key: 'eye', name: 'Rastreamento Ocular', icon: <Eye className="h-5 w-5" />, color: 'bg-green-50' },
                  { key: 'tremor', name: 'Controle de Tremor', icon: <Target className="h-5 w-5" />, color: 'bg-purple-50' },
                  { key: 'voice', name: 'Voz Médica', icon: <Volume2 className="h-5 w-5" />, color: 'bg-orange-50' },
                  { key: 'hand', name: 'Uma Mão', icon: <Hand className="h-5 w-5" />, color: 'bg-pink-50' },
                  { key: 'cognitive', name: 'Suporte Cognitivo', icon: <Brain className="h-5 w-5" />, color: 'bg-indigo-50' },
                  { key: 'visual', name: 'Melhorias Visuais', icon: <Eye className="h-5 w-5" />, color: 'bg-teal-50' },
                  { key: 'api', name: 'API de AT', icon: <Zap className="h-5 w-5" />, color: 'bg-red-50' }
                ].map(component => (
                  <Card 
                    key={component.key} 
                    className={`cursor-pointer hover:shadow-md transition-shadow ${component.color}`}
                    onClick={() => setActiveComponent(component.key)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="flex justify-center mb-2">
                        {component.icon}
                      </div>
                      <div className="font-medium text-sm">{component.name}</div>
                      <Button size="sm" className="mt-2 w-full" variant="outline">
                        Ver Demo
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="switch" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SwitchNavigationSettings />
                <SwitchNavigationDemo />
              </div>
            </TabsContent>

            <TabsContent value="eye" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <EyeTrackingSettings />
                <EyeTrackingDemo />
              </div>
            </TabsContent>

            <TabsContent value="tremor" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TremorFriendlySettings />
                <TremorFriendlyDemo />
              </div>
            </TabsContent>

            <TabsContent value="voice" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <VoiceMedicalSettings />
                <VoiceMedicalDemo />
              </div>
            </TabsContent>

            <TabsContent value="hand" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <OneHandedOperationSettings />
                <OneHandedOperationDemo />
              </div>
            </TabsContent>

            <TabsContent value="cognitive" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CognitiveAccessibilitySettings />
                <CognitiveAccessibilityDemo />
              </div>
            </TabsContent>

            <TabsContent value="visual" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <VisualAccessibilitySettings />
                <VisualAccessibilityDemo />
              </div>
            </TabsContent>

            <TabsContent value="api" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AssistiveTechnologyAPISettings />
                <AssistiveTechnologyAPIDemo />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </AccessibilityProvidersWrapper>
  )
}

// ===============================
// EXPORT MAIN COMPONENT
// ===============================

export default AccessibilityIntegrationExample
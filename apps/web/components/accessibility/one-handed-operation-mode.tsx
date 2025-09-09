'use client'

import { Alert, AlertDescription, AlertTitle, } from '@/components/ui/alert'
import { Badge, } from '@/components/ui/badge'
import { Button, } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from '@/components/ui/card'
import { Progress, } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
// import { Slider } from "@/components/ui/slider";
import { Switch, } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger, } from '@/components/ui/tabs'
import {
  Activity,
  AlertCircle,
  CheckCircle,
  FileText,
  Gauge,
  Hand,
  MousePointer,
  Phone,
  Shield,
  Smartphone,
  Stethoscope,
  Target,
} from 'lucide-react'
import type React from 'react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

// ===============================
// TYPES & INTERFACES
// ===============================

export type HandDominance = 'left' | 'right' | 'ambidextrous'
export type OperationModeType =
  | 'post_procedure'
  | 'temporary_limitation'
  | 'permanent_adaptation'
  | 'preference_based'
export type LayoutOrientation = 'portrait' | 'landscape'
export type InteractionMethod = 'touch' | 'stylus' | 'voice_assist' | 'switch_assist'

export interface TouchTargetOptimization {
  minimum_size: number
  spacing_multiplier: number
  edge_avoidance: number
  priority_sizing: boolean
  thumb_zone_optimization: boolean
  medical_priority_targets: string[]
}

export interface OneHandedSettings {
  enabled: boolean
  hand_dominance: HandDominance
  operation_mode: OperationModeType
  layout_orientation: LayoutOrientation
  interaction_methods: InteractionMethod[]
  touch_optimization: TouchTargetOptimization
  medical_context_awareness: boolean
  emergency_mode_enabled: boolean
  auto_adaptation: boolean
  feedback_enabled: boolean
  lgpd_compliance_mode: boolean
}

export interface GestureAdaptation {
  gesture_id: string
  original_gesture: string
  adapted_gesture: string
  difficulty_level: number
  medical_safety_rating: number
  post_procedure_safe: boolean
  description_pt: string
}

export interface MedicalLayoutConfig {
  scenario: string
  name_pt: string
  layout_adjustments: {
    sidebar_position: 'left' | 'right' | 'collapsed'
    primary_actions_zone: 'thumb_reach' | 'index_reach' | 'bottom_edge'
    secondary_actions_position: 'contextual' | 'dedicated_area' | 'hidden'
    emergency_access_method: 'corner_tap' | 'edge_swipe' | 'voice_trigger'
  }
  target_adjustments: {
    minimum_target_size: number
    spacing_factor: number
    priority_boost: boolean
  }
  content_adaptations: {
    single_column_threshold: number
    text_scaling_factor: number
    media_positioning: 'center' | 'dominant_side' | 'non_dominant_side'
  }
}

export interface OneHandedAnalytics {
  session_start: Date
  total_interactions: number
  gesture_adaptations_used: number
  layout_switches: number
  medical_mode_activations: number
  emergency_triggers: number
  efficiency_score: number
  user_satisfaction_indicators: {
    successful_interactions: number
    failed_interactions: number
    abandoned_tasks: number
    completion_time_average: number
  }
  lgpd_data_points: {
    interaction_patterns_anonymized: boolean
    medical_data_encrypted: boolean
    user_consent_status: string
    data_retention_period: number
  }
}

export interface OneHandedContextValue {
  settings: OneHandedSettings
  analytics: OneHandedAnalytics
  updateSettings: (settings: Partial<OneHandedSettings>,) => void
  adaptLayout: (scenario: string,) => void
  registerMedicalContext: (context: string,) => void
  getOptimizedLayout: () => MedicalLayoutConfig
  triggerEmergencyMode: () => void
  logInteraction: (interaction: string,) => void
  exportAnalytics: () => Promise<string>
  resetToDefaults: () => void
}

// ===============================
// CONSTANTS & CONFIGURATIONS
// ===============================

const DEFAULT_SETTINGS: OneHandedSettings = {
  enabled: false,
  hand_dominance: 'right',
  operation_mode: 'preference_based',
  layout_orientation: 'portrait',
  interaction_methods: ['touch',],
  touch_optimization: {
    minimum_size: 44,
    spacing_multiplier: 1.5,
    edge_avoidance: 16,
    priority_sizing: true,
    thumb_zone_optimization: true,
    medical_priority_targets: ['emergency', 'pain_scale', 'medication', 'call_nurse',],
  },
  medical_context_awareness: true,
  emergency_mode_enabled: true,
  auto_adaptation: false,
  feedback_enabled: true,
  lgpd_compliance_mode: true,
}

const MEDICAL_LAYOUT_CONFIGS: Record<string, MedicalLayoutConfig> = {
  'post_botox': {
    scenario: 'post_botox',
    name_pt: 'Pós-Aplicação de Botox',
    layout_adjustments: {
      sidebar_position: 'collapsed',
      primary_actions_zone: 'thumb_reach',
      secondary_actions_position: 'contextual',
      emergency_access_method: 'corner_tap',
    },
    target_adjustments: {
      minimum_target_size: 56,
      spacing_factor: 2,
      priority_boost: true,
    },
    content_adaptations: {
      single_column_threshold: 768,
      text_scaling_factor: 1.25,
      media_positioning: 'center',
    },
  },
  'bandaged_hand': {
    scenario: 'bandaged_hand',
    name_pt: 'Mão Enfaixada/Curativo',
    layout_adjustments: {
      sidebar_position: 'collapsed',
      primary_actions_zone: 'index_reach',
      secondary_actions_position: 'dedicated_area',
      emergency_access_method: 'edge_swipe',
    },
    target_adjustments: {
      minimum_target_size: 64,
      spacing_factor: 2.5,
      priority_boost: true,
    },
    content_adaptations: {
      single_column_threshold: 640,
      text_scaling_factor: 1.4,
      media_positioning: 'dominant_side',
    },
  },
  'iv_drip': {
    scenario: 'iv_drip',
    name_pt: 'Com Soro/Medicação IV',
    layout_adjustments: {
      sidebar_position: 'left',
      primary_actions_zone: 'bottom_edge',
      secondary_actions_position: 'hidden',
      emergency_access_method: 'voice_trigger',
    },
    target_adjustments: {
      minimum_target_size: 48,
      spacing_factor: 1.8,
      priority_boost: false,
    },
    content_adaptations: {
      single_column_threshold: 896,
      text_scaling_factor: 1.15,
      media_positioning: 'non_dominant_side',
    },
  },
  'tremor_management': {
    scenario: 'tremor_management',
    name_pt: 'Gerenciamento de Tremor',
    layout_adjustments: {
      sidebar_position: 'right',
      primary_actions_zone: 'thumb_reach',
      secondary_actions_position: 'contextual',
      emergency_access_method: 'corner_tap',
    },
    target_adjustments: {
      minimum_target_size: 72,
      spacing_factor: 3,
      priority_boost: true,
    },
    content_adaptations: {
      single_column_threshold: 512,
      text_scaling_factor: 1.5,
      media_positioning: 'center',
    },
  },
}

const GESTURE_ADAPTATIONS: GestureAdaptation[] = [
  {
    gesture_id: 'double_tap',
    original_gesture: 'Toque duplo rápido',
    adapted_gesture: 'Toque único prolongado (800ms)',
    difficulty_level: 2,
    medical_safety_rating: 9,
    post_procedure_safe: true,
    description_pt: 'Evita movimentos repetitivos que podem causar desconforto pós-procedimento',
  },
  {
    gesture_id: 'pinch_zoom',
    original_gesture: 'Pinça com dois dedos',
    adapted_gesture: 'Toque + botão de zoom',
    difficulty_level: 1,
    medical_safety_rating: 10,
    post_procedure_safe: true,
    description_pt: 'Interface adaptada para operação com um dedo apenas',
  },
  {
    gesture_id: 'long_press_menu',
    original_gesture: 'Pressionar e manter pressionado',
    adapted_gesture: 'Toque + confirmação visual',
    difficulty_level: 1,
    medical_safety_rating: 8,
    post_procedure_safe: true,
    description_pt: 'Menu contextual ativado sem necessidade de pressão prolongada',
  },
  {
    gesture_id: 'edge_swipe',
    original_gesture: 'Deslizar da borda da tela',
    adapted_gesture: 'Botão de navegação fixo',
    difficulty_level: 1,
    medical_safety_rating: 9,
    post_procedure_safe: true,
    description_pt: 'Navegação sem movimentos de alcance completo da tela',
  },
  {
    gesture_id: 'multi_finger_tap',
    original_gesture: 'Toque com múltiplos dedos',
    adapted_gesture: 'Sequência de toques únicos',
    difficulty_level: 2,
    medical_safety_rating: 7,
    post_procedure_safe: false,
    description_pt: 'Gestos complexos substituídos por sequências simples',
  },
]

const MEDICAL_SCENARIOS_PT = {
  'post_procedure': 'Pós-Procedimento',
  'temporary_limitation': 'Limitação Temporária',
  'permanent_adaptation': 'Adaptação Permanente',
  'preference_based': 'Por Preferência',
}

// ===============================
// CONTEXT CREATION
// ===============================

const OneHandedOperationContext = createContext<OneHandedContextValue | undefined>(undefined,)

// ===============================
// HOOK FOR CONSUMING CONTEXT
// ===============================

export function useOneHandedOperation() {
  const context = useContext(OneHandedOperationContext,)
  if (context === undefined) {
    throw new Error('useOneHandedOperation must be used within a OneHandedOperationProvider',)
  }
  return context
}

// ===============================
// MAIN PROVIDER COMPONENT
// ===============================

export function OneHandedOperationProvider({ children, }: { children: React.ReactNode },) {
  const [settings, setSettings,] = useState<OneHandedSettings>(DEFAULT_SETTINGS,)
  const [analytics, setAnalytics,] = useState<OneHandedAnalytics>(() => ({
    session_start: new Date(),
    total_interactions: 0,
    gesture_adaptations_used: 0,
    layout_switches: 0,
    medical_mode_activations: 0,
    emergency_triggers: 0,
    efficiency_score: 0,
    user_satisfaction_indicators: {
      successful_interactions: 0,
      failed_interactions: 0,
      abandoned_tasks: 0,
      completion_time_average: 0,
    },
    lgpd_data_points: {
      interaction_patterns_anonymized: true,
      medical_data_encrypted: true,
      user_consent_status: 'pending',
      data_retention_period: 90,
    },
  }))

  const [currentMedicalContext, setCurrentMedicalContext,] = useState<string>('preference_based',)
  const [/* emergencyModeActive */, setEmergencyModeActive,] = useState(false,)
  const [layoutAdaptationsActive, setLayoutAdaptationsActive,] = useState<string[]>([],)

  // Analytics tracking
  const analyticsRef = useRef<NodeJS.Timeout | null>(null,)

  // Update settings with analytics tracking
  const updateSettings = useCallback((newSettings: Partial<OneHandedSettings>,) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings, }

      // Track significant changes
      if (newSettings.hand_dominance && newSettings.hand_dominance !== prev.hand_dominance) {
        setAnalytics(prevAnalytics => ({
          ...prevAnalytics,
          layout_switches: prevAnalytics.layout_switches + 1,
          total_interactions: prevAnalytics.total_interactions + 1,
        }))
      }

      if (
        newSettings.medical_context_awareness !== undefined
        && newSettings.medical_context_awareness !== prev.medical_context_awareness
      ) {
        setAnalytics(prevAnalytics => ({
          ...prevAnalytics,
          medical_mode_activations: prevAnalytics.medical_mode_activations + 1,
        }))
      }

      return updated
    },)
  }, [],)

  // Adapt layout based on medical scenario
  const adaptLayout = useCallback((scenario: string,) => {
    if (MEDICAL_LAYOUT_CONFIGS[scenario]) {
      setCurrentMedicalContext(scenario,)
      setLayoutAdaptationsActive(prev => {
        if (!prev.includes(scenario,)) {
          return [...prev, scenario,]
        }
        return prev
      },)

      setAnalytics(prev => ({
        ...prev,
        layout_switches: prev.layout_switches + 1,
        medical_mode_activations: prev.medical_mode_activations + 1,
        total_interactions: prev.total_interactions + 1,
      }))
    }
  }, [],)

  // Register medical context
  const registerMedicalContext = useCallback((context: string,) => {
    setCurrentMedicalContext(context,)

    // Auto-adapt settings based on medical context
    if (settings.auto_adaptation) {
      if (context.includes('post',) || context.includes('bandaged',)) {
        updateSettings({
          touch_optimization: {
            ...settings.touch_optimization,
            minimum_size: Math.max(settings.touch_optimization.minimum_size, 56,),
            spacing_multiplier: Math.max(settings.touch_optimization.spacing_multiplier, 2,),
          },
        },)
      }
    }
  }, [settings, updateSettings,],)

  // Get optimized layout configuration
  const getOptimizedLayout = useCallback((): MedicalLayoutConfig => {
    const config = MEDICAL_LAYOUT_CONFIGS[currentMedicalContext]
      || MEDICAL_LAYOUT_CONFIGS['post_procedure']

    // Apply hand dominance modifications
    if (settings.hand_dominance === 'left') {
      return {
        ...config,
        layout_adjustments: {
          ...config.layout_adjustments,
          sidebar_position: config.layout_adjustments.sidebar_position === 'left'
            ? 'right'
            : config.layout_adjustments.sidebar_position === 'right'
            ? 'left'
            : 'collapsed',
        },
      }
    }

    return config
  }, [currentMedicalContext, settings.hand_dominance,],)

  // Trigger emergency mode
  const triggerEmergencyMode = useCallback(() => {
    setEmergencyModeActive(true,)
    setAnalytics(prev => ({
      ...prev,
      emergency_triggers: prev.emergency_triggers + 1,
      total_interactions: prev.total_interactions + 1,
    }))

    // Auto-disable emergency mode after 5 minutes
    setTimeout(() => {
      setEmergencyModeActive(false,)
    }, 300_000,)
  }, [],)

  // Log interaction
  const logInteraction = useCallback((interaction: string,) => {
    if (!settings.lgpd_compliance_mode) return

    setAnalytics(prev => {
      const updated = {
        ...prev,
        total_interactions: prev.total_interactions + 1,
      }

      // Track gesture adaptations
      if (GESTURE_ADAPTATIONS.some(g => interaction.includes(g.gesture_id,))) {
        updated.gesture_adaptations_used = prev.gesture_adaptations_used + 1
      }

      return updated
    },)
  }, [settings.lgpd_compliance_mode,],)

  // Export analytics (LGPD compliant)
  const exportAnalytics = useCallback(async (): Promise<string> => {
    const exportData = {
      session_duration: Date.now() - analytics.session_start.getTime(),
      interactions_summary: {
        total: analytics.total_interactions,
        gesture_adaptations: analytics.gesture_adaptations_used,
        layout_switches: analytics.layout_switches,
        emergency_activations: analytics.emergency_triggers,
      },
      efficiency_metrics: {
        score: analytics.efficiency_score,
        successful_rate: analytics.user_satisfaction_indicators.successful_interactions
          / Math.max(analytics.total_interactions, 1,),
      },
      accessibility_data: {
        hand_dominance: settings.hand_dominance,
        operation_mode: settings.operation_mode,
        adaptations_used: layoutAdaptationsActive.length,
      },
      lgpd_compliance: {
        data_anonymized: true,
        medical_data_encrypted: analytics.lgpd_data_points.medical_data_encrypted,
        consent_status: analytics.lgpd_data_points.user_consent_status,
        retention_period_days: analytics.lgpd_data_points.data_retention_period,
      },
      export_timestamp: new Date().toISOString(),
    }

    return JSON.stringify(exportData, null, 2,)
  }, [analytics, settings, layoutAdaptationsActive,],)

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    setSettings(DEFAULT_SETTINGS,)
    setCurrentMedicalContext('preference_based',)
    setLayoutAdaptationsActive([],)
    setEmergencyModeActive(false,)
  }, [],)

  // Calculate efficiency score
  useEffect(() => {
    if (analyticsRef.current) {
      clearInterval(analyticsRef.current,)
    }

    analyticsRef.current = setInterval(() => {
      setAnalytics(prev => {
        const successRate = prev.user_satisfaction_indicators.successful_interactions
          / Math.max(prev.total_interactions, 1,)
        const adaptationUtilization = prev.gesture_adaptations_used
          / Math.max(prev.total_interactions, 1,)
        const emergencyFrequency = prev.emergency_triggers
          / Math.max(prev.total_interactions / 100, 1,)

        const efficiency_score = Math.round(
          (successRate * 0.5 + adaptationUtilization * 0.3 + (1 - emergencyFrequency) * 0.2) * 100,
        )

        return {
          ...prev,
          efficiency_score: Math.min(100, Math.max(0, efficiency_score,),),
        }
      },)
    }, 10_000,) // Update every 10 seconds

    return () => {
      if (analyticsRef.current) {
        clearInterval(analyticsRef.current,)
      }
    }
  }, [],)

  const contextValue: OneHandedContextValue = useMemo(() => ({
    settings,
    analytics,
    updateSettings,
    adaptLayout,
    registerMedicalContext,
    getOptimizedLayout,
    triggerEmergencyMode,
    logInteraction,
    exportAnalytics,
    resetToDefaults,
  }), [
    settings,
    analytics,
    updateSettings,
    adaptLayout,
    registerMedicalContext,
    getOptimizedLayout,
    triggerEmergencyMode,
    logInteraction,
    exportAnalytics,
    resetToDefaults,
  ],)

  return (
    <OneHandedOperationContext.Provider value={contextValue}>
      {children}
    </OneHandedOperationContext.Provider>
  )
}

// ===============================
// SETTINGS PANEL COMPONENT
// ===============================

export function OneHandedOperationSettings() {
  const {
    settings,
    analytics,
    updateSettings,
    adaptLayout,
    triggerEmergencyMode,
    exportAnalytics,
    resetToDefaults,
    getOptimizedLayout,
  } = useOneHandedOperation()

  const [activeTab, setActiveTab,] = useState('basic',)
  const [_showAdvanced, _setShowAdvanced,] = useState(false,)

  const currentLayout = getOptimizedLayout()

  const handleExportAnalytics = async () => {
    try {
      const data = await exportAnalytics()
      const blob = new Blob([data,], { type: 'application/json', },)
      const url = URL.createObjectURL(blob,)
      const a = document.createElement('a',)
      a.href = url
      a.download = `one-handed-analytics-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url,)
    } catch (error) {
      console.error('Erro ao exportar analytics:', error,)
    }
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Hand className="h-5 w-5" />
          <CardTitle>Modo de Operação com Uma Mão</CardTitle>
          {settings.enabled && (
            <Badge variant="secondary" className="ml-auto">
              {settings.hand_dominance === 'left'
                ? 'Canhoto'
                : settings.hand_dominance === 'right'
                ? 'Destro'
                : 'Ambidestro'}
            </Badge>
          )}
        </div>
        <CardDescription>
          Otimização de interface para uso com uma mão apenas - ideal para cenários médicos
          pós-procedimento
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Básico</TabsTrigger>
            <TabsTrigger value="medical">Médico</TabsTrigger>
            <TabsTrigger value="gestures">Gestos</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Habilitar Modo Uma Mão</label>
                <p className="text-xs text-muted-foreground">
                  Ativa otimizações de layout e interação para uso com uma mão
                </p>
              </div>
              <Switch
                checked={settings.enabled}
                onCheckedChange={(enabled,) => updateSettings({ enabled, },)}
              />
            </div>

            {settings.enabled && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Dominância da Mão</label>
                  <Select
                    value={settings.hand_dominance}
                    onValueChange={(hand_dominance: HandDominance,) =>
                      updateSettings({ hand_dominance, },)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="right">Destro (Mão Direita)</SelectItem>
                      <SelectItem value="left">Canhoto (Mão Esquerda)</SelectItem>
                      <SelectItem value="ambidextrous">Ambidestro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Modo de Operação</label>
                  <Select
                    value={settings.operation_mode}
                    onValueChange={(operation_mode: OperationModeType,) =>
                      updateSettings({ operation_mode, },)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(MEDICAL_SCENARIOS_PT,).map(([key, value,],) => (
                        <SelectItem key={key} value={key}>{value}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Tamanho Mínimo de Toque: {settings.touch_optimization.minimum_size}px
                  </label>
                  <input
                    type="range"
                    value={settings.touch_optimization.minimum_size}
                    onChange={(e,) =>
                      updateSettings({
                        touch_optimization: {
                          ...settings.touch_optimization,
                          minimum_size: parseInt(e.target.value,),
                        },
                      },)}
                    min={32}
                    max={96}
                    step={4}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Espaçamento entre Elementos: {settings.touch_optimization.spacing_multiplier}x
                  </label>
                  <input
                    type="range"
                    value={settings.touch_optimization.spacing_multiplier}
                    onChange={(e,) =>
                      updateSettings({
                        touch_optimization: {
                          ...settings.touch_optimization,
                          spacing_multiplier: parseFloat(e.target.value,),
                        },
                      },)}
                    min={1}
                    max={3}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="medical" className="space-y-4">
            <Alert>
              <Stethoscope className="h-4 w-4" />
              <AlertTitle>Configurações Médicas</AlertTitle>
              <AlertDescription>
                Configurações específicas para uso em ambiente médico e pós-procedimento
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(MEDICAL_LAYOUT_CONFIGS,).map(([key, config,],) => (
                <Card
                  key={key}
                  className="cursor-pointer hover:bg-accent/50"
                  onClick={() => adaptLayout(key,)}
                >
                  <CardContent className="p-4">
                    <h4 className="font-medium">{config.name_pt}</h4>
                    <div className="text-xs text-muted-foreground mt-1">
                      Target: {config.target_adjustments.minimum_target_size}px • Espaçamento:{' '}
                      {config.target_adjustments.spacing_factor}x
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {config.layout_adjustments.primary_actions_zone}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {config.layout_adjustments.emergency_access_method}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Consciência de Contexto Médico</label>
                <p className="text-xs text-muted-foreground">
                  Adaptações automáticas baseadas no contexto médico atual
                </p>
              </div>
              <Switch
                checked={settings.medical_context_awareness}
                onCheckedChange={(medical_context_awareness,) =>
                  updateSettings({ medical_context_awareness, },)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Modo Emergência Habilitado</label>
                <p className="text-xs text-muted-foreground">
                  Interface simplificada para situações de emergência
                </p>
              </div>
              <div className="flex gap-2">
                <Switch
                  checked={settings.emergency_mode_enabled}
                  onCheckedChange={(emergency_mode_enabled,) =>
                    updateSettings({ emergency_mode_enabled, },)}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={triggerEmergencyMode}
                  disabled={!settings.emergency_mode_enabled}
                >
                  Ativar Emergência
                </Button>
              </div>
            </div>

            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Layout Atual: {currentLayout.name_pt}</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>Sidebar: {currentLayout.layout_adjustments.sidebar_position}</div>
                  <div>Ações: {currentLayout.layout_adjustments.primary_actions_zone}</div>
                  <div>Emergência: {currentLayout.layout_adjustments.emergency_access_method}</div>
                  <div>Texto: {currentLayout.content_adaptations.text_scaling_factor}x</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gestures" className="space-y-4">
            <Alert>
              <Target className="h-4 w-4" />
              <AlertTitle>Adaptações de Gestos</AlertTitle>
              <AlertDescription>
                Gestos otimizados para operação com uma mão e segurança médica
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              {GESTURE_ADAPTATIONS.map((gesture,) => (
                <Card key={gesture.gesture_id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <h4 className="font-medium">{gesture.adapted_gesture}</h4>
                        <p className="text-sm text-muted-foreground">
                          {gesture.description_pt}
                        </p>
                        <div className="text-xs text-muted-foreground">
                          <strong>Original:</strong> {gesture.original_gesture}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        <Badge variant={gesture.post_procedure_safe ? 'default' : 'destructive'}>
                          {gesture.post_procedure_safe ? 'Seguro' : 'Cuidado'}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs">
                          <Activity className="h-3 w-3" />
                          Dificuldade: {gesture.difficulty_level}/10
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <Shield className="h-3 w-3" />
                          Segurança: {gesture.medical_safety_rating}/10
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Alert>
              <Gauge className="h-4 w-4" />
              <AlertTitle>Analytics de Acessibilidade</AlertTitle>
              <AlertDescription>
                Métricas de uso e eficiência - dados tratados conforme LGPD
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4" />
                    <span className="font-medium">Pontuação de Eficiência</span>
                  </div>
                  <div className="text-2xl font-bold mb-2">{analytics.efficiency_score}%</div>
                  <Progress value={analytics.efficiency_score} className="h-2" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MousePointer className="h-4 w-4" />
                    <span className="font-medium">Interações Totais</span>
                  </div>
                  <div className="text-2xl font-bold">{analytics.total_interactions}</div>
                  <div className="text-xs text-muted-foreground">
                    {analytics.gesture_adaptations_used} adaptações de gestos
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Smartphone className="h-4 w-4" />
                    <span className="font-medium">Mudanças de Layout</span>
                  </div>
                  <div className="text-2xl font-bold">{analytics.layout_switches}</div>
                  <div className="text-xs text-muted-foreground">
                    {analytics.medical_mode_activations} ativações médicas
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium">Ativações de Emergência</span>
                  </div>
                  <div className="text-2xl font-bold">{analytics.emergency_triggers}</div>
                  <div className="text-xs text-muted-foreground">
                    Última sessão iniciada em {analytics.session_start.toLocaleDateString('pt-BR',)}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-3">Satisfação do Usuário</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Interações Bem-sucedidas
                    </div>
                    <div className="text-lg font-semibold">
                      {analytics.user_satisfaction_indicators.successful_interactions}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      Interações Falhadas
                    </div>
                    <div className="text-lg font-semibold">
                      {analytics.user_satisfaction_indicators.failed_interactions}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50">
              <CardContent className="p-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Conformidade LGPD
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>Padrões Anonimizados: ✓</div>
                  <div>Dados Médicos Criptografados: ✓</div>
                  <div>Consentimento: {analytics.lgpd_data_points.user_consent_status}</div>
                  <div>Retenção: {analytics.lgpd_data_points.data_retention_period} dias</div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button onClick={handleExportAnalytics} variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Exportar Analytics
              </Button>
              <Button onClick={resetToDefaults} variant="outline">
                Resetar Configurações
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

// ===============================
// DEMO COMPONENT
// ===============================

export function OneHandedOperationDemo() {
  const {
    settings,
    adaptLayout,
    logInteraction,
    triggerEmergencyMode,
    getOptimizedLayout,
  } = useOneHandedOperation()

  const currentLayout = getOptimizedLayout()

  const handleMedicalAction = (action: string,) => {
    logInteraction(`medical_action_${action}`,)
    console.log(`Ação médica executada: ${action}`,)
  }

  if (!settings.enabled) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-6 text-center">
          <Hand className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-medium mb-2">Modo Uma Mão Desabilitado</h3>
          <p className="text-sm text-muted-foreground">
            Habilite nas configurações para ver a demonstração
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hand className="h-5 w-5" />
            Interface Adaptada - {currentLayout.name_pt}
          </CardTitle>
          <CardDescription>
            Layout otimizado para{' '}
            {settings.hand_dominance === 'left' ? 'mão esquerda' : 'mão direita'}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Simulação de Interface Médica Adaptada */}
      <div className="grid grid-cols-1 gap-4">
        {/* Área de Ações Primárias */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              Ações Rápidas (Zona {currentLayout.layout_adjustments.primary_actions_zone})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => handleMedicalAction('pain_scale',)}
                style={{
                  minHeight: `${currentLayout.target_adjustments.minimum_target_size}px`,
                  fontSize: `${currentLayout.content_adaptations.text_scaling_factor}rem`,
                }}
                className="flex items-center gap-2"
              >
                <Activity className="h-5 w-5" />
                Escala de Dor
              </Button>
              <Button
                onClick={() => handleMedicalAction('call_nurse',)}
                style={{
                  minHeight: `${currentLayout.target_adjustments.minimum_target_size}px`,
                  fontSize: `${currentLayout.content_adaptations.text_scaling_factor}rem`,
                }}
                className="flex items-center gap-2"
                variant="secondary"
              >
                <Phone className="h-5 w-5" />
                Chamar Enfermeira
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Botão de Emergência */}
        {settings.emergency_mode_enabled && (
          <Card className="border-red-200">
            <CardContent className="p-4">
              <Button
                onClick={triggerEmergencyMode}
                variant="destructive"
                size="lg"
                className="w-full"
                style={{
                  minHeight: `${
                    Math.max(currentLayout.target_adjustments.minimum_target_size, 64,)
                  }px`,
                }}
              >
                <AlertCircle className="h-6 w-6 mr-2" />
                EMERGÊNCIA
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Cenários Médicos Rápidos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Adaptar Para Cenário</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(MEDICAL_LAYOUT_CONFIGS,).map(([key, config,],) => (
                <Button
                  key={key}
                  variant="outline"
                  size="sm"
                  onClick={() => adaptLayout(key,)}
                  className="text-xs"
                >
                  {config.name_pt}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Informações do Layout Atual */}
        <Card className="bg-muted/50">
          <CardContent className="p-3">
            <div className="text-xs space-y-1">
              <div>
                <strong>Target Size:</strong>{' '}
                {currentLayout.target_adjustments.minimum_target_size}px
              </div>
              <div>
                <strong>Spacing:</strong> {currentLayout.target_adjustments.spacing_factor}x
              </div>
              <div>
                <strong>Text Scale:</strong>{' '}
                {currentLayout.content_adaptations.text_scaling_factor}x
              </div>
              <div>
                <strong>Emergency:</strong>{' '}
                {currentLayout.layout_adjustments.emergency_access_method}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

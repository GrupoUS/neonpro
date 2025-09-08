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
  ArrowRight,
  Bell,
  Brain,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  HelpCircle,
  Lightbulb,
  List,
  Shield,
  Target,
  Timer,
  Volume2,
  Zap,
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

export type CognitiveImpairmentType =
  | 'memory'
  | 'attention'
  | 'executive_function'
  | 'processing_speed'
  | 'language'
  | 'post_anesthesia'
  | 'medication_effects'
  | 'stress_induced'

export type CognitiveSupportLevel = 'minimal' | 'moderate' | 'extensive' | 'maximum'
export type CognitiveLoadLevel = 'low' | 'medium' | 'high' | 'overload'
export type MemoryAidType = 'visual' | 'auditory' | 'tactile' | 'multimodal'
export type AttentionCueType = 'highlight' | 'animation' | 'sound' | 'vibration'

export interface CognitiveProfile {
  impairment_types: CognitiveImpairmentType[]
  support_level: CognitiveSupportLevel
  memory_span_minutes: number
  attention_duration_seconds: number
  processing_speed_factor: number
  fatigue_threshold: number
  medical_context: string
  medication_effects: string[]
  recovery_stage: 'acute' | 'rehabilitation' | 'maintenance'
}

export interface CognitiveSettings {
  enabled: boolean
  profile: CognitiveProfile
  memory_aids_enabled: boolean
  attention_management: boolean
  cognitive_load_monitoring: boolean
  progressive_disclosure: boolean
  simplified_navigation: boolean
  repetition_frequency: number
  confirmation_requirements: boolean
  timeout_extensions: boolean
  visual_cues_intensity: number
  audio_cues_enabled: boolean
  haptic_feedback_enabled: boolean
  lgpd_compliance_mode: boolean
}

export interface MemoryAid {
  id: string
  type: MemoryAidType
  content: string
  medical_context: string
  trigger_conditions: string[]
  frequency_minutes: number
  importance_level: number
  created_at: Date
  last_shown: Date | null
  effectiveness_score: number
  portuguese_message: string
}

export interface AttentionCue {
  id: string
  type: AttentionCueType
  target_element: string
  intensity_level: number
  duration_ms: number
  repetition_count: number
  medical_priority: boolean
  accessibility_safe: boolean
  description_pt: string
}

export interface CognitiveTask {
  id: string
  title_pt: string
  description_pt: string
  steps: string[]
  estimated_duration_minutes: number
  cognitive_load_level: CognitiveLoadLevel
  medical_category: string
  completion_aids: string[]
  fallback_actions: string[]
  progress_tracking: boolean
}

export interface CognitiveFatigueMetrics {
  session_start: Date
  interaction_count: number
  error_rate: number
  task_abandonment_rate: number
  attention_breaks_taken: number
  confusion_indicators: number
  help_requests: number
  current_fatigue_level: number
  estimated_remaining_capacity: number
}

export interface CognitiveAnalytics {
  session_metrics: CognitiveFatigueMetrics
  memory_aid_effectiveness: Record<string, number>
  attention_patterns: {
    average_focus_duration: number
    distraction_frequency: number
    optimal_task_timing: string[]
  }
  cognitive_load_history: {
    timestamp: Date
    load_level: CognitiveLoadLevel
    task_context: string
  }[]
  improvement_indicators: {
    task_completion_rate: number
    error_reduction_percentage: number
    independence_growth: number
  }
  lgpd_data_points: {
    cognitive_patterns_anonymized: boolean
    medical_data_encrypted: boolean
    consent_status: string
    data_retention_period: number
  }
}

export interface CognitiveContextValue {
  settings: CognitiveSettings
  analytics: CognitiveAnalytics
  currentTask: CognitiveTask | null
  fatigueLevel: number
  updateSettings: (settings: Partial<CognitiveSettings>,) => void
  setCurrentTask: (task: CognitiveTask | null,) => void
  addMemoryAid: (
    aid: Omit<MemoryAid, 'id' | 'created_at' | 'last_shown' | 'effectiveness_score'>,
  ) => void
  triggerAttentionCue: (cue: AttentionCue,) => void
  checkCognitiveLoad: () => CognitiveLoadLevel
  requestSimplification: () => void
  takeAttentionBreak: () => void
  logInteraction: (interaction: string, success: boolean,) => void
  exportAnalytics: () => Promise<string>
  resetCognitiveState: () => void
}

// ===============================
// CONSTANTS & CONFIGURATIONS
// ===============================

const DEFAULT_COGNITIVE_PROFILE: CognitiveProfile = {
  impairment_types: [],
  support_level: 'moderate',
  memory_span_minutes: 15,
  attention_duration_seconds: 120,
  processing_speed_factor: 1,
  fatigue_threshold: 70,
  medical_context: 'general',
  medication_effects: [],
  recovery_stage: 'maintenance',
}

const DEFAULT_SETTINGS: CognitiveSettings = {
  enabled: false,
  profile: DEFAULT_COGNITIVE_PROFILE,
  memory_aids_enabled: true,
  attention_management: true,
  cognitive_load_monitoring: true,
  progressive_disclosure: true,
  simplified_navigation: true,
  repetition_frequency: 3,
  confirmation_requirements: false,
  timeout_extensions: true,
  visual_cues_intensity: 70,
  audio_cues_enabled: false,
  haptic_feedback_enabled: true,
  lgpd_compliance_mode: true,
}

const MEDICAL_CONTEXTS_PT = {
  'post_anesthesia': 'Pós-Anestesia',
  'post_procedure': 'Pós-Procedimento',
  'medication_adjustment': 'Ajuste de Medicação',
  'pain_management': 'Controle de Dor',
  'stress_recovery': 'Recuperação do Estresse',
  'cognitive_rehabilitation': 'Reabilitação Cognitiva',
  'general': 'Geral',
}

const COGNITIVE_IMPAIRMENTS_PT = {
  'memory': 'Problemas de Memória',
  'attention': 'Dificuldades de Atenção',
  'executive_function': 'Função Executiva',
  'processing_speed': 'Velocidade de Processamento',
  'language': 'Processamento de Linguagem',
  'post_anesthesia': 'Efeitos Pós-Anestesia',
  'medication_effects': 'Efeitos de Medicação',
  'stress_induced': 'Induzido por Estresse',
}

const MEMORY_AIDS_TEMPLATES: Partial<MemoryAid>[] = [
  {
    type: 'visual',
    content: 'medication_reminder',
    portuguese_message: 'Lembrete: Hora de tomar a medicação prescrita',
    medical_context: 'medication_management',
    frequency_minutes: 480,
    importance_level: 9,
  },
  {
    type: 'visual',
    content: 'appointment_reminder',
    portuguese_message: 'Consulta de retorno agendada para hoje',
    medical_context: 'appointment_management',
    frequency_minutes: 1440,
    importance_level: 8,
  },
  {
    type: 'multimodal',
    content: 'post_procedure_care',
    portuguese_message: 'Lembre-se: Cuidados pós-procedimento são importantes',
    medical_context: 'post_procedure',
    frequency_minutes: 120,
    importance_level: 9,
  },
  {
    type: 'auditory',
    content: 'hydration_reminder',
    portuguese_message: 'Mantenha-se hidratado - beba água regularmente',
    medical_context: 'general',
    frequency_minutes: 60,
    importance_level: 6,
  },
  {
    type: 'visual',
    content: 'pain_assessment',
    portuguese_message: 'Como está sua dor agora? Avalie de 1 a 10',
    medical_context: 'pain_management',
    frequency_minutes: 240,
    importance_level: 7,
  },
]

const COGNITIVE_TASKS_TEMPLATES: CognitiveTask[] = [
  {
    id: 'pain_scale_assessment',
    title_pt: 'Avaliação da Escala de Dor',
    description_pt: 'Avalie seu nível de dor atual usando a escala de 1 a 10',
    steps: [
      'Pense na sua dor agora',
      'Escolha um número de 1 a 10',
      '1 = sem dor, 10 = dor insuportável',
      'Confirme sua escolha',
    ],
    estimated_duration_minutes: 2,
    cognitive_load_level: 'low',
    medical_category: 'pain_management',
    completion_aids: ['visual_scale', 'color_coding', 'verbal_descriptions',],
    fallback_actions: ['call_nurse', 'simplified_options', 'voice_assistance',],
    progress_tracking: true,
  },
  {
    id: 'medication_schedule_review',
    title_pt: 'Revisão do Cronograma de Medicamentos',
    description_pt: 'Confirme seus horários de medicação para hoje',
    steps: [
      'Veja a lista de medicamentos',
      'Confirme os horários',
      'Marque as doses já tomadas',
      'Configure lembretes',
    ],
    estimated_duration_minutes: 5,
    cognitive_load_level: 'medium',
    medical_category: 'medication_management',
    completion_aids: ['visual_timeline', 'checkboxes', 'color_coding', 'images',],
    fallback_actions: ['nurse_assistance', 'family_contact', 'simplified_view',],
    progress_tracking: true,
  },
  {
    id: 'post_procedure_checklist',
    title_pt: 'Lista de Cuidados Pós-Procedimento',
    description_pt: 'Verifique os cuidados necessários após seu procedimento',
    steps: [
      'Leia cada item da lista',
      'Marque como concluído',
      'Anote qualquer dúvida',
      'Solicite ajuda se necessário',
    ],
    estimated_duration_minutes: 8,
    cognitive_load_level: 'medium',
    medical_category: 'post_procedure',
    completion_aids: ['step_by_step', 'visual_guides', 'progress_bar', 'reminders',],
    fallback_actions: ['break_into_smaller_steps', 'voice_guidance', 'nurse_call',],
    progress_tracking: true,
  },
]

const ATTENTION_CUES: AttentionCue[] = [
  {
    id: 'gentle_highlight',
    type: 'highlight',
    target_element: 'primary_action',
    intensity_level: 50,
    duration_ms: 2000,
    repetition_count: 2,
    medical_priority: false,
    accessibility_safe: true,
    description_pt: 'Destaque suave para chamar atenção',
  },
  {
    id: 'urgent_highlight',
    type: 'highlight',
    target_element: 'emergency_button',
    intensity_level: 90,
    duration_ms: 3000,
    repetition_count: 3,
    medical_priority: true,
    accessibility_safe: true,
    description_pt: 'Destaque intenso para situações urgentes',
  },
  {
    id: 'progress_animation',
    type: 'animation',
    target_element: 'next_step',
    intensity_level: 60,
    duration_ms: 1500,
    repetition_count: 1,
    medical_priority: false,
    accessibility_safe: true,
    description_pt: 'Animação para indicar próximo passo',
  },
  {
    id: 'completion_feedback',
    type: 'animation',
    target_element: 'completed_item',
    intensity_level: 70,
    duration_ms: 1000,
    repetition_count: 1,
    medical_priority: false,
    accessibility_safe: true,
    description_pt: 'Feedback visual para item concluído',
  },
]

// ===============================
// CONTEXT CREATION
// ===============================

const CognitiveAccessibilityContext = createContext<CognitiveContextValue | undefined>(undefined,)

// ===============================
// HOOK FOR CONSUMING CONTEXT
// ===============================

export function useCognitiveAccessibility() {
  const context = useContext(CognitiveAccessibilityContext,)
  if (context === undefined) {
    throw new Error(
      'useCognitiveAccessibility must be used within a CognitiveAccessibilityProvider',
    )
  }
  return context
}

// ===============================
// MAIN PROVIDER COMPONENT
// ===============================

export function CognitiveAccessibilityProvider({ children, }: { children: React.ReactNode },) {
  const [settings, setSettings,] = useState<CognitiveSettings>(DEFAULT_SETTINGS,)
  const [analytics, setAnalytics,] = useState<CognitiveAnalytics>(() => ({
    session_metrics: {
      session_start: new Date(),
      interaction_count: 0,
      error_rate: 0,
      task_abandonment_rate: 0,
      attention_breaks_taken: 0,
      confusion_indicators: 0,
      help_requests: 0,
      current_fatigue_level: 0,
      estimated_remaining_capacity: 100,
    },
    memory_aid_effectiveness: {},
    attention_patterns: {
      average_focus_duration: 120,
      distraction_frequency: 0,
      optimal_task_timing: ['morning', 'early_afternoon',],
    },
    cognitive_load_history: [],
    improvement_indicators: {
      task_completion_rate: 100,
      error_reduction_percentage: 0,
      independence_growth: 0,
    },
    lgpd_data_points: {
      cognitive_patterns_anonymized: true,
      medical_data_encrypted: true,
      consent_status: 'pending',
      data_retention_period: 90,
    },
  }))

  const [currentTask, setCurrentTask,] = useState<CognitiveTask | null>(null,)
  const [memoryAids, setMemoryAids,] = useState<MemoryAid[]>([],)
  const [activeAttentionCues, setActiveAttentionCues,] = useState<AttentionCue[]>([],)
  const [fatigueLevel, setFatigueLevel,] = useState(0,)

  // Timers and intervals
  const fatigueMonitoringRef = useRef<ReturnType<typeof setTimeout> | null>(null,)
  const memoryAidReminderRef = useRef<ReturnType<typeof setTimeout> | null>(null,)
  const attentionTrackingRef = useRef<ReturnType<typeof setInterval> | null>(null,)

  // Update settings with cognitive profiling
  const updateSettings = useCallback((newSettings: Partial<CognitiveSettings>,) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings, }

      // Auto-adjust based on cognitive profile changes
      if (newSettings.profile) {
        const profile = { ...prev.profile, ...newSettings.profile, }
        updated.profile = profile

        // Adjust support level based on impairment types
        if (
          profile.impairment_types.includes('post_anesthesia',)
          || profile.impairment_types.includes('medication_effects',)
        ) {
          updated.confirmation_requirements = true
          updated.repetition_frequency = Math.max(updated.repetition_frequency, 2,)
          updated.timeout_extensions = true
        }

        // Increase support for multiple impairments
        if (profile.impairment_types.length >= 3) {
          profile.support_level = 'extensive'
          updated.visual_cues_intensity = Math.max(updated.visual_cues_intensity, 80,)
        }
      }

      return updated
    },)
  }, [],)

  // Add memory aid
  const addMemoryAid = useCallback(
    (aid: Omit<MemoryAid, 'id' | 'created_at' | 'last_shown' | 'effectiveness_score'>,) => {
      const newAid: MemoryAid = {
        ...aid,
        id: `aid_${Date.now()}_${Math.random().toString(36,).slice(2, 9,)}`,
        created_at: new Date(),
        last_shown: null,
        effectiveness_score: 0,
      }

      setMemoryAids(prev => [...prev, newAid,])
    },
    [],
  )

  // Trigger attention cue
  const triggerAttentionCue = useCallback((cue: AttentionCue,) => {
    if (!settings.attention_management) return

    setActiveAttentionCues(prev => {
      // Remove existing cue for same element
      const filtered = prev.filter(c => c.target_element !== cue.target_element)
      return [...filtered, cue,]
    },)

    // Remove cue after duration
    setTimeout(() => {
      setActiveAttentionCues(prev => prev.filter(c => c.id !== cue.id))
    }, cue.duration_ms * cue.repetition_count,)

    // Log attention cue usage
    setAnalytics(prev => ({
      ...prev,
      session_metrics: {
        ...prev.session_metrics,
        interaction_count: prev.session_metrics.interaction_count + 1,
      },
    }))
  }, [settings.attention_management,],)

  // Check cognitive load
  const checkCognitiveLoad = useCallback((): CognitiveLoadLevel => {
    const metrics = analytics.session_metrics
    const profile = settings.profile

    // Calculate cognitive load based on multiple factors
    let loadScore = 0

    // Factor 1: Error rate
    loadScore += metrics.error_rate * 30

    // Factor 2: Task abandonment
    loadScore += metrics.task_abandonment_rate * 25

    // Factor 3: Confusion indicators
    loadScore += (metrics.confusion_indicators / Math.max(metrics.interaction_count, 1,)) * 20

    // Factor 4: Current fatigue
    loadScore += metrics.current_fatigue_level * 0.25

    // Factor 5: Profile-based adjustments
    if (profile.impairment_types.includes('attention',)) loadScore += 10
    if (profile.impairment_types.includes('executive_function',)) loadScore += 15
    if (profile.support_level === 'maximum') loadScore += 10

    // Classify load level
    if (loadScore >= 80) return 'overload'
    if (loadScore >= 60) return 'high'
    if (loadScore >= 35) return 'medium'
    return 'low'
  }, [analytics.session_metrics, settings.profile,],)

  // Request simplification
  const requestSimplification = useCallback(() => {
    updateSettings({
      progressive_disclosure: true,
      simplified_navigation: true,
      confirmation_requirements: true,
      visual_cues_intensity: Math.min(settings.visual_cues_intensity + 20, 100,),
    },)

    setAnalytics(prev => ({
      ...prev,
      session_metrics: {
        ...prev.session_metrics,
        confusion_indicators: prev.session_metrics.confusion_indicators + 1,
        help_requests: prev.session_metrics.help_requests + 1,
      },
    }))
  }, [settings.visual_cues_intensity, updateSettings,],)

  // Take attention break
  const takeAttentionBreak = useCallback(() => {
    setFatigueLevel(prev => Math.max(0, prev - 20,))

    setAnalytics(prev => ({
      ...prev,
      session_metrics: {
        ...prev.session_metrics,
        attention_breaks_taken: prev.session_metrics.attention_breaks_taken + 1,
        current_fatigue_level: Math.max(0, prev.session_metrics.current_fatigue_level - 15,),
      },
    }))
  }, [],)

  // Log interaction
  const logInteraction = useCallback((interaction: string, success: boolean,) => {
    if (!settings.lgpd_compliance_mode) return

    setAnalytics(prev => {
      const newMetrics = { ...prev.session_metrics, }
      newMetrics.interaction_count += 1

      if (!success) {
        newMetrics.error_rate = (newMetrics.error_rate * (newMetrics.interaction_count - 1) + 1)
          / newMetrics.interaction_count
      } else {
        newMetrics.error_rate = (newMetrics.error_rate * (newMetrics.interaction_count - 1))
          / newMetrics.interaction_count
      }

      // Track cognitive load
      const currentLoad = checkCognitiveLoad()
      const loadHistory = [...prev.cognitive_load_history, {
        timestamp: new Date(),
        load_level: currentLoad,
        task_context: currentTask?.id || 'general',
      },].slice(-100,) // Keep last 100 entries

      return {
        ...prev,
        session_metrics: newMetrics,
        cognitive_load_history: loadHistory,
      }
    },)
  }, [settings.lgpd_compliance_mode, checkCognitiveLoad, currentTask,],)

  // Export analytics (LGPD compliant)
  const exportAnalytics = useCallback(async (): Promise<string> => {
    // Check LGPD compliance requirements first
    if (analytics.lgpd_data_points.consent_status !== 'granted' || !settings.lgpd_compliance_mode) {
      throw new Error('Export blocked: LGPD consent not granted or compliance mode disabled',)
    }

    const sessionDuration = Date.now() - analytics.session_metrics.session_start.getTime()

    const exportData = {
      session_summary: {
        duration_minutes: Math.round(sessionDuration / 60_000,),
        total_interactions: analytics.session_metrics.interaction_count,
        success_rate: 1 - analytics.session_metrics.error_rate,
        breaks_taken: analytics.session_metrics.attention_breaks_taken,
      },
      cognitive_profile: {
        support_level: settings.profile.support_level,
        impairment_types_count: settings.profile.impairment_types.length,
        recovery_stage: settings.profile.recovery_stage,
      },
      effectiveness_metrics: {
        task_completion_rate: analytics.improvement_indicators.task_completion_rate,
        error_reduction: analytics.improvement_indicators.error_reduction_percentage,
        independence_growth: analytics.improvement_indicators.independence_growth,
      },
      attention_insights: {
        average_focus_duration: analytics.attention_patterns.average_focus_duration,
        optimal_timing: analytics.attention_patterns.optimal_task_timing,
        fatigue_pattern: analytics.cognitive_load_history.slice(-10,).map(h => h.load_level),
      },
      memory_aids_data: {
        total_aids_created: memoryAids.length,
        effectiveness_scores: Object.values(analytics.memory_aid_effectiveness,),
        most_effective_types: Object.keys(analytics.memory_aid_effectiveness,)
          .sort((a, b,) =>
            analytics.memory_aid_effectiveness[b] - analytics.memory_aid_effectiveness[a]
          )
          .slice(0, 3,),
      },
      lgpd_compliance: {
        data_anonymized: analytics.lgpd_data_points.cognitive_patterns_anonymized,
        medical_data_encrypted: analytics.lgpd_data_points.medical_data_encrypted,
        consent_status: analytics.lgpd_data_points.consent_status,
        retention_period_days: analytics.lgpd_data_points.data_retention_period,
      },
      export_timestamp: new Date().toISOString(),
    }

    return JSON.stringify(exportData, null, 2,)
  }, [analytics, settings, memoryAids,],)

  // Reset cognitive state
  const resetCognitiveState = useCallback(() => {
    setSettings(DEFAULT_SETTINGS,)
    setCurrentTask(null,)
    setMemoryAids([],)
    setActiveAttentionCues([],)
    setFatigueLevel(0,)

    setAnalytics(prev => ({
      ...prev,
      session_metrics: {
        ...prev.session_metrics,
        session_start: new Date(),
        interaction_count: 0,
        error_rate: 0,
        current_fatigue_level: 0,
        estimated_remaining_capacity: 100,
      },
    }))
  }, [],)

  // Fatigue monitoring
  useEffect(() => {
    if (!settings.enabled || !settings.cognitive_load_monitoring) return

    if (fatigueMonitoringRef.current) {
      clearInterval(fatigueMonitoringRef.current,)
    }

    fatigueMonitoringRef.current = setInterval(() => {
      setFatigueLevel(prev => {
        const increment = settings.profile.impairment_types.includes('post_anesthesia',) ? 2 : 1
        const newLevel = Math.min(100, prev + increment,)

        // Update analytics
        setAnalytics(prevAnalytics => ({
          ...prevAnalytics,
          session_metrics: {
            ...prevAnalytics.session_metrics,
            current_fatigue_level: newLevel,
            estimated_remaining_capacity: Math.max(0, 100 - newLevel,),
          },
        }))

        return newLevel
      },)
    }, 60_000,) // Update every minute

    return () => {
      if (fatigueMonitoringRef.current) {
        clearInterval(fatigueMonitoringRef.current,)
      }
    }
  }, [settings.enabled, settings.cognitive_load_monitoring, settings.profile.impairment_types,],)

  // Memory aid reminders
  useEffect(() => {
    if (!settings.enabled || !settings.memory_aids_enabled) return

    if (memoryAidReminderRef.current) {
      clearInterval(memoryAidReminderRef.current,)
    }

    memoryAidReminderRef.current = setInterval(() => {
      const now = new Date()

      memoryAids.forEach(aid => {
        const minutesSinceLastShown = aid.last_shown
          ? (now.getTime() - aid.last_shown.getTime()) / 60_000
          : aid.frequency_minutes + 1

        if (minutesSinceLastShown >= aid.frequency_minutes) {
          // Trigger memory aid display
          console.log(`Memory Aid: ${aid.portuguese_message}`,)

          // Update last shown timestamp
          setMemoryAids(prev => prev.map(a => a.id === aid.id ? { ...a, last_shown: now, } : a))
        }
      },)
    }, 30_000,) // Check every 30 seconds

    return () => {
      if (memoryAidReminderRef.current) {
        clearInterval(memoryAidReminderRef.current,)
      }
    }
  }, [settings.enabled, settings.memory_aids_enabled, memoryAids,],)

  const contextValue: CognitiveContextValue = useMemo(() => ({
    settings,
    analytics,
    currentTask,
    fatigueLevel,
    updateSettings,
    setCurrentTask,
    addMemoryAid,
    triggerAttentionCue,
    checkCognitiveLoad,
    requestSimplification,
    takeAttentionBreak,
    logInteraction,
    exportAnalytics,
    resetCognitiveState,
  }), [
    settings,
    analytics,
    currentTask,
    fatigueLevel,
    updateSettings,
    addMemoryAid,
    triggerAttentionCue,
    checkCognitiveLoad,
    requestSimplification,
    takeAttentionBreak,
    logInteraction,
    exportAnalytics,
    resetCognitiveState,
  ],)

  return (
    <CognitiveAccessibilityContext.Provider value={contextValue}>
      {children}
    </CognitiveAccessibilityContext.Provider>
  )
}

// ===============================
// SETTINGS PANEL COMPONENT
// ===============================

export function CognitiveAccessibilitySettings() {
  const {
    settings,
    analytics,
    fatigueLevel,
    updateSettings,
    requestSimplification,
    takeAttentionBreak,
    exportAnalytics,
    resetCognitiveState,
    checkCognitiveLoad,
    addMemoryAid,
  } = useCognitiveAccessibility()

  const [activeTab, setActiveTab,] = useState('profile',)
  const currentLoad = checkCognitiveLoad()

  const handleExportAnalytics = async () => {
    try {
      const data = await exportAnalytics()
      const blob = new Blob([data,], { type: 'application/json', },)
      const url = URL.createObjectURL(blob,)
      const a = document.createElement('a',)
      a.href = url
      a.download = `cognitive-accessibility-analytics-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url,)
    } catch (error) {
      console.error('Erro ao exportar analytics:', error,)
    }
  }

  const handleAddMemoryAid = () => {
    const randomAid =
      MEMORY_AIDS_TEMPLATES[Math.floor(Math.random() * MEMORY_AIDS_TEMPLATES.length,)]
    if (randomAid) {
      addMemoryAid({
        ...randomAid,
        type: randomAid.type || 'visual',
        content: randomAid.content || 'Lembrete padrão',
        medical_context: randomAid.medical_context || 'Geral',
        frequency_minutes: randomAid.frequency_minutes || 60,
        importance_level: randomAid.importance_level || 1,
        portuguese_message: randomAid.portuguese_message || 'Lembrete padrão',
        trigger_conditions: ['manual_add',],
      },)
    }
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          <CardTitle>Assistente de Acessibilidade Cognitiva</CardTitle>
          {settings.enabled && (
            <Badge variant="secondary" className="ml-auto">
              {settings.profile.support_level}
            </Badge>
          )}
        </div>
        <CardDescription>
          Suporte cognitivo inteligente para melhor experiência médica
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Current Status Indicators */}
        {settings.enabled && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4" />
                <span className="text-sm font-medium">Nível de Fadiga</span>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={fatigueLevel} className="flex-1" />
                <span className="text-sm">{fatigueLevel}%</span>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4" />
                <span className="text-sm font-medium">Carga Cognitiva</span>
              </div>
              <Badge
                variant={currentLoad === 'overload'
                  ? 'destructive'
                  : currentLoad === 'high'
                  ? 'secondary'
                  : currentLoad === 'medium'
                  ? 'outline'
                  : 'default'}
              >
                {currentLoad === 'low' && 'Baixa'}
                {currentLoad === 'medium' && 'Média'}
                {currentLoad === 'high' && 'Alta'}
                {currentLoad === 'overload' && 'Sobrecarga'}
              </Badge>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-medium">Taxa de Sucesso</span>
              </div>
              <div className="text-lg font-semibold">
                {Math.round((1 - analytics.session_metrics.error_rate) * 100,)}%
              </div>
            </Card>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="aids">Assistentes</TabsTrigger>
            <TabsTrigger value="tasks">Tarefas</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Habilitar Assistente Cognitivo</label>
                <p className="text-xs text-muted-foreground">
                  Ativa suporte cognitivo personalizado baseado no seu perfil
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
                  <label className="text-sm font-medium">Contexto Médico</label>
                  <Select
                    value={settings.profile.medical_context}
                    onValueChange={(medical_context: string,) =>
                      updateSettings({
                        profile: { ...settings.profile, medical_context, },
                      },)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(MEDICAL_CONTEXTS_PT,).map(([key, value,],) => (
                        <SelectItem key={key} value={key}>{value}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Nível de Suporte</label>
                  <Select
                    value={settings.profile.support_level}
                    onValueChange={(support_level: CognitiveSupportLevel,) =>
                      updateSettings({
                        profile: { ...settings.profile, support_level, },
                      },)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minimal">Mínimo</SelectItem>
                      <SelectItem value="moderate">Moderado</SelectItem>
                      <SelectItem value="extensive">Extensivo</SelectItem>
                      <SelectItem value="maximum">Máximo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipos de Dificuldades</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(COGNITIVE_IMPAIRMENTS_PT,).map(([key, value,],) => (
                      <label key={key} className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={settings.profile.impairment_types.includes(
                            key as CognitiveImpairmentType,
                          )}
                          onChange={(e,) => {
                            const types = settings.profile.impairment_types
                            if (e.target.checked) {
                              updateSettings({
                                profile: {
                                  ...settings.profile,
                                  impairment_types: [...types, key as CognitiveImpairmentType,],
                                },
                              },)
                            } else {
                              updateSettings({
                                profile: {
                                  ...settings.profile,
                                  impairment_types: types.filter(t =>
                                    t !== key
                                  ),
                                },
                              },)
                            }
                          }}
                          className="rounded"
                        />
                        <span>{value}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Intensidade das Pistas Visuais: {settings.visual_cues_intensity}%
                  </label>
                  <input
                    type="range"
                    value={settings.visual_cues_intensity}
                    onChange={(e,) =>
                      updateSettings({ visual_cues_intensity: parseInt(e.target.value,), },)}
                    min={0}
                    max={100}
                    step={10}
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Lembretes de Memória</label>
                    <Switch
                      checked={settings.memory_aids_enabled}
                      onCheckedChange={(memory_aids_enabled,) =>
                        updateSettings({ memory_aids_enabled, },)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Gerenciamento de Atenção</label>
                    <Switch
                      checked={settings.attention_management}
                      onCheckedChange={(attention_management,) =>
                        updateSettings({ attention_management, },)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Navegação Simplificada</label>
                    <Switch
                      checked={settings.simplified_navigation}
                      onCheckedChange={(simplified_navigation,) =>
                        updateSettings({ simplified_navigation, },)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Extensão de Tempo</label>
                    <Switch
                      checked={settings.timeout_extensions}
                      onCheckedChange={(timeout_extensions,) =>
                        updateSettings({ timeout_extensions, },)}
                    />
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="aids" className="space-y-4">
            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertTitle>Assistentes de Memória</AlertTitle>
              <AlertDescription>
                Lembretes e pistas para ajudar na sua jornada médica
              </AlertDescription>
            </Alert>

            <div className="flex gap-2 mb-4">
              <Button onClick={handleAddMemoryAid} variant="outline">
                <Bell className="h-4 w-4 mr-2" />
                Adicionar Lembrete
              </Button>
              <Button onClick={requestSimplification} variant="outline">
                <Target className="h-4 w-4 mr-2" />
                Solicitar Simplificação
              </Button>
              <Button onClick={takeAttentionBreak} variant="outline">
                <Timer className="h-4 w-4 mr-2" />
                Fazer Pausa
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {MEMORY_AIDS_TEMPLATES.map((template, index,) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <h4 className="font-medium">{template.portuguese_message}</h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline">{template.type}</Badge>
                          <span>A cada {template.frequency_minutes} min</span>
                          <span>Importância: {template.importance_level}/10</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {MEDICAL_CONTEXTS_PT[
                            template.medical_context as keyof typeof MEDICAL_CONTEXTS_PT
                          ]}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {template.type === 'visual' && <Eye className="h-4 w-4" />}
                        {template.type === 'auditory' && <Volume2 className="h-4 w-4" />}
                        {template.type === 'multimodal' && <Zap className="h-4 w-4" />}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <Alert>
              <List className="h-4 w-4" />
              <AlertTitle>Tarefas Cognitivas Guiadas</AlertTitle>
              <AlertDescription>
                Tarefas passo-a-passo com suporte cognitivo integrado
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              {COGNITIVE_TASKS_TEMPLATES.map((task,) => (
                <Card key={task.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="space-y-1">
                        <h4 className="font-medium">{task.title_pt}</h4>
                        <p className="text-sm text-muted-foreground">
                          {task.description_pt}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        <Badge
                          variant={task.cognitive_load_level === 'low'
                            ? 'default'
                            : task.cognitive_load_level === 'medium'
                            ? 'secondary'
                            : 'destructive'}
                        >
                          {task.cognitive_load_level === 'low' && 'Baixa carga'}
                          {task.cognitive_load_level === 'medium' && 'Média carga'}
                          {task.cognitive_load_level === 'high' && 'Alta carga'}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {task.estimated_duration_minutes} min
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">Passos:</div>
                      <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1 ml-2">
                        {task.steps.map((step, index,) => <li key={index}>{step}</li>)}
                      </ol>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1">
                      {task.completion_aids.slice(0, 3,).map((aid, index,) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {aid}
                        </Badge>
                      ))}
                      {task.completion_aids.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{task.completion_aids.length - 3} mais
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Alert>
              <Activity className="h-4 w-4" />
              <AlertTitle>Analytics Cognitivos</AlertTitle>
              <AlertDescription>
                Métricas de desempenho e padrões cognitivos - dados protegidos pela LGPD
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-4 w-4" />
                    <span className="font-medium">Sessão Atual</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Interações:</span>
                      <span className="font-semibold">
                        {analytics.session_metrics.interaction_count}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxa de Erro:</span>
                      <span className="font-semibold">
                        {Math.round(analytics.session_metrics.error_rate * 100,)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pausas Tomadas:</span>
                      <span className="font-semibold">
                        {analytics.session_metrics.attention_breaks_taken}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4" />
                    <span className="font-medium">Padrões de Atenção</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Foco Médio:</span>
                      <span className="font-semibold">
                        {analytics.attention_patterns.average_focus_duration}s
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Distrações:</span>
                      <span className="font-semibold">
                        {analytics.attention_patterns.distraction_frequency}
                      </span>
                    </div>
                    <div>
                      <span>Melhor Horário:</span>
                      <div className="mt-1">
                        {analytics.attention_patterns.optimal_task_timing.map((time, index,) => (
                          <Badge key={index} variant="outline" className="text-xs mr-1">
                            {time}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="font-medium">Indicadores de Melhora</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Taxa de Conclusão:</span>
                      <span className="font-semibold">
                        {analytics.improvement_indicators.task_completion_rate}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Redução de Erros:</span>
                      <span className="font-semibold">
                        {analytics.improvement_indicators.error_reduction_percentage}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Crescimento da Independência:</span>
                      <span className="font-semibold">
                        {analytics.improvement_indicators.independence_growth}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <HelpCircle className="h-4 w-4" />
                    <span className="font-medium">Solicitações de Ajuda</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Pedidos de Ajuda:</span>
                      <span className="font-semibold">
                        {analytics.session_metrics.help_requests}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Indicadores de Confusão:</span>
                      <span className="font-semibold">
                        {analytics.session_metrics.confusion_indicators}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Capacidade Restante:</span>
                      <span className="font-semibold">
                        {analytics.session_metrics.estimated_remaining_capacity}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-blue-50">
              <CardContent className="p-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Conformidade LGPD
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>Padrões Cognitivos Anonimizados: ✓</div>
                  <div>Dados Médicos Criptografados: ✓</div>
                  <div>Consentimento: {analytics.lgpd_data_points.consent_status}</div>
                  <div>Retenção: {analytics.lgpd_data_points.data_retention_period} dias</div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button onClick={handleExportAnalytics} variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Exportar Analytics
              </Button>
              <Button onClick={resetCognitiveState} variant="outline">
                Resetar Estado
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

export function CognitiveAccessibilityDemo() {
  const {
    settings,
    currentTask,
    fatigueLevel,
    setCurrentTask,
    checkCognitiveLoad,
    logInteraction,
    triggerAttentionCue,
    requestSimplification,
  } = useCognitiveAccessibility()

  const [activeDemo, setActiveDemo,] = useState<string | null>(null,)
  const currentLoad = checkCognitiveLoad()

  const handleStartTask = (task: CognitiveTask,) => {
    setCurrentTask(task,)
    setActiveDemo(task.id,)
    logInteraction(`task_started_${task.id}`, true,)
  }

  const handleCompleteStep = (taskId: string, stepIndex: number,) => {
    logInteraction(`step_completed_${stepIndex}`, true,)

    if (settings.attention_management) {
      const cue = ATTENTION_CUES.find(c => c.id === 'completion_feedback')
      if (cue) {
        triggerAttentionCue(cue,)
      }
    }
  }

  if (!settings.enabled) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-6 text-center">
          <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-medium mb-2">Assistente Cognitivo Desabilitado</h3>
          <p className="text-sm text-muted-foreground">
            Habilite nas configurações para ver a demonstração
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Assistente Cognitivo Ativo
            <Badge variant="secondary" className="ml-auto">
              {settings.profile.support_level}
            </Badge>
          </CardTitle>
          <CardDescription>
            Suporte personalizado baseado no seu perfil cognitivo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="font-medium">Fadiga</div>
              <div className="text-2xl font-bold">{fatigueLevel}%</div>
              <Progress value={fatigueLevel} className="h-2 mt-1" />
            </div>
            <div className="text-center">
              <div className="font-medium">Carga</div>
              <div className="text-2xl font-bold">
                {currentLoad === 'low' && '🟢'}
                {currentLoad === 'medium' && '🟡'}
                {currentLoad === 'high' && '🟠'}
                {currentLoad === 'overload' && '🔴'}
              </div>
              <div className="text-xs text-muted-foreground capitalize">
                {currentLoad}
              </div>
            </div>
            <div className="text-center">
              <div className="font-medium">Contexto</div>
              <div className="text-sm font-semibold">
                {MEDICAL_CONTEXTS_PT[
                  settings.profile.medical_context as keyof typeof MEDICAL_CONTEXTS_PT
                ]}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={requestSimplification}
            >
              <Target className="h-4 w-4 mr-2" />
              Simplificar Interface
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setActiveDemo('memory_aids',)}
            >
              <Bell className="h-4 w-4 mr-2" />
              Ver Lembretes
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => logInteraction('help_requested', true,)}
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Solicitar Ajuda
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Available Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Tarefas Disponíveis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {COGNITIVE_TASKS_TEMPLATES.map((task,) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 cursor-pointer"
                onClick={() => handleStartTask(task,)}
              >
                <div className="space-y-1">
                  <div className="font-medium text-sm">{task.title_pt}</div>
                  <div className="text-xs text-muted-foreground">
                    {task.estimated_duration_minutes} min • {task.cognitive_load_level} carga
                  </div>
                </div>
                <ArrowRight className="h-4 w-4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Task */}
      {currentTask && activeDemo === currentTask.id && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <List className="h-5 w-5" />
              {currentTask.title_pt}
              <Badge variant="secondary" className="ml-auto">
                Em Progresso
              </Badge>
            </CardTitle>
            <CardDescription>
              {currentTask.description_pt}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentTask.steps.map((step, index,) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm">{step}</div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleCompleteStep(currentTask.id, index,)}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <Button onClick={() => setActiveDemo(null,)}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Concluir Tarefa
              </Button>
              <Button variant="outline" onClick={() => setActiveDemo(null,)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Memory Aids Demo */}
      {activeDemo === 'memory_aids' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Lembretes Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {MEMORY_AIDS_TEMPLATES.map((aid, index,) => (
                <Alert key={index}>
                  <Bell className="h-4 w-4" />
                  <AlertTitle>{aid.portuguese_message}</AlertTitle>
                  <AlertDescription className="flex items-center justify-between">
                    <span>
                      {MEDICAL_CONTEXTS_PT[aid.medical_context as keyof typeof MEDICAL_CONTEXTS_PT]}
                    </span>
                    <Badge variant="outline">
                      A cada {aid.frequency_minutes} min
                    </Badge>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => setActiveDemo(null,)}
            >
              Fechar
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

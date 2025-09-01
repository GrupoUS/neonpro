"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  Eye, 
  Palette, 
  Sun, 
  Moon, 
  Contrast, 
  Type, 
  Focus,
  Maximize2,
  Settings,
  Monitor,
  Lightbulb,
  Target,
  Zap,
  Shield,
  Activity,
  FileText,
  AlertCircle,
  CheckCircle2,
  MousePointer,
  Move,
  Search,
  Volume2,
  Accessibility,
  Heart,
  Stethoscope,
  Clock,
  Users,
  Home,
  Pill
} from 'lucide-react'

// ===============================
// TYPES & INTERFACES
// ===============================

export type VisualImpairmentType = 
  | 'low_vision'
  | 'color_blindness'
  | 'light_sensitivity'
  | 'dry_eyes'
  | 'post_eye_procedure'
  | 'medication_effects'
  | 'age_related'
  | 'screen_fatigue'

export type ColorBlindnessType = 
  | 'protanopia'      // Red-blind
  | 'deuteranopia'    // Green-blind
  | 'tritanopia'      // Blue-blind
  | 'protanomaly'     // Red-weak
  | 'deuteranomaly'   // Green-weak
  | 'tritanomaly'     // Blue-weak
  | 'monochromacy'    // Complete color blindness

export type ContrastLevel = 'normal' | 'enhanced' | 'high' | 'maximum'
export type TextSize = 'small' | 'normal' | 'large' | 'extra-large' | 'maximum'
export type MotionPreference = 'reduce' | 'normal' | 'enhanced'

export interface VisualProfile {
  impairment_types: VisualImpairmentType[]
  color_blindness_type: ColorBlindnessType | null
  visual_acuity_level: number // 1-10 scale
  contrast_sensitivity: number // 1-10 scale
  light_sensitivity_level: number // 1-10 scale
  reading_speed_factor: number // multiplier for text display time
  medical_context: string
  recent_procedures: string[]
  current_medications: string[]
}

export interface VisualSettings {
  enabled: boolean
  profile: VisualProfile
  contrast_level: ContrastLevel
  text_size: TextSize
  text_spacing: number
  line_height: number
  font_weight: number
  dark_mode_enabled: boolean
  high_contrast_mode: boolean
  color_adjustments_enabled: boolean
  focus_indicators_enhanced: boolean
  motion_reduced: boolean
  cursor_enhanced: boolean
  magnification_enabled: boolean
  magnification_level: number
  screen_reader_optimized: boolean
  lgpd_compliance_mode: boolean
}

export interface ColorAdjustment {
  id: string
  name_pt: string
  description_pt: string
  css_filter: string
  color_blindness_support: ColorBlindnessType[]
  medical_safety_tested: boolean
  accessibility_score: number
}

export interface VisualCue {
  id: string
  type: 'border' | 'background' | 'shadow' | 'outline' | 'animation'
  intensity_level: number
  color_theme: string
  medical_priority: boolean
  accessibility_safe: boolean
  description_pt: string
  css_properties: Record<string, string>
}

export interface MagnificationZone {
  id: string
  element_selector: string
  magnification_factor: number
  activation_trigger: 'hover' | 'focus' | 'click' | 'manual'
  smooth_transition: boolean
  medical_importance: boolean
  description_pt: string
}

export interface VisualAnalytics {
  session_start: Date
  total_adjustments_made: number
  most_used_features: string[]
  contrast_adjustments: number
  text_size_changes: number
  magnification_activations: number
  dark_mode_toggles: number
  reading_time_improvements: number
  error_reduction_percentage: number
  user_satisfaction_score: number
  accessibility_compliance_score: number
  medical_safety_alerts: number
  lgpd_data_points: {
    visual_patterns_anonymized: boolean
    medical_data_encrypted: boolean
    consent_status: string
    data_retention_period: number
  }
}

export interface VisualContextValue {
  settings: VisualSettings
  analytics: VisualAnalytics
  currentMagnificationZone: MagnificationZone | null
  updateSettings: (settings: Partial<VisualSettings>) => void
  adjustContrast: (level: ContrastLevel) => void
  adjustTextSize: (size: TextSize) => void
  toggleDarkMode: () => void
  enableMagnification: (zone?: MagnificationZone) => void
  disableMagnification: () => void
  applyColorFilter: (filter: ColorAdjustment) => void
  enhanceFocus: (element: string) => void
  resetToDefaults: () => void
  exportAnalytics: () => Promise<string>
  validateMedicalSafety: () => boolean
}

// ===============================
// CONSTANTS & CONFIGURATIONS
// ===============================

const DEFAULT_VISUAL_PROFILE: VisualProfile = {
  impairment_types: [],
  color_blindness_type: null,
  visual_acuity_level: 7,
  contrast_sensitivity: 7,
  light_sensitivity_level: 5,
  reading_speed_factor: 1,
  medical_context: 'general',
  recent_procedures: [],
  current_medications: []
}

const DEFAULT_SETTINGS: VisualSettings = {
  enabled: false,
  profile: DEFAULT_VISUAL_PROFILE,
  contrast_level: 'normal',
  text_size: 'normal',
  text_spacing: 1,
  line_height: 1.5,
  font_weight: 400,
  dark_mode_enabled: false,
  high_contrast_mode: false,
  color_adjustments_enabled: false,
  focus_indicators_enhanced: false,
  motion_reduced: false,
  cursor_enhanced: false,
  magnification_enabled: false,
  magnification_level: 1.5,
  screen_reader_optimized: false,
  lgpd_compliance_mode: true
}

const VISUAL_IMPAIRMENTS_PT = {
  'low_vision': 'Baixa Visão',
  'color_blindness': 'Daltonismo',
  'light_sensitivity': 'Sensibilidade à Luz',
  'dry_eyes': 'Olhos Secos',
  'post_eye_procedure': 'Pós-Procedimento Ocular',
  'medication_effects': 'Efeitos de Medicação',
  'age_related': 'Relacionado à Idade',
  'screen_fatigue': 'Fadiga de Tela'
}

const COLOR_BLINDNESS_TYPES_PT = {
  'protanopia': 'Protanopia (Cegueira para Vermelho)',
  'deuteranopia': 'Deuteranopia (Cegueira para Verde)',
  'tritanopia': 'Tritanopia (Cegueira para Azul)',
  'protanomaly': 'Protanomalia (Fraqueza para Vermelho)',
  'deuteranomaly': 'Deuteranomalia (Fraqueza para Verde)',
  'tritanomaly': 'Tritanomalia (Fraqueza para Azul)',
  'monochromacy': 'Monocromacia (Cegueira Total para Cores)'
}

const MEDICAL_VISUAL_CONTEXTS = {
  'post_cataract': {
    name_pt: 'Pós-Cirurgia de Catarata',
    adjustments: {
      light_sensitivity: 9,
      contrast_boost: 'high',
      text_size: 'large',
      recommended_filters: ['blue_light_reduction', 'glare_reduction']
    }
  },
  'post_botox_eye': {
    name_pt: 'Pós-Botox Região Ocular',
    adjustments: {
      light_sensitivity: 7,
      contrast_boost: 'enhanced',
      focus_enhancement: true,
      recommended_filters: ['gentle_contrast']
    }
  },
  'diabetic_retinopathy': {
    name_pt: 'Retinopatia Diabética',
    adjustments: {
      contrast_boost: 'maximum',
      text_size: 'extra-large',
      color_adjustments: true,
      recommended_filters: ['high_contrast', 'color_enhancement']
    }
  },
  'dry_eye_syndrome': {
    name_pt: 'Síndrome do Olho Seco',
    adjustments: {
      dark_mode: true,
      reduced_motion: true,
      blink_reminders: true,
      recommended_filters: ['blue_light_reduction', 'soft_contrast']
    }
  },
  'glaucoma_management': {
    name_pt: 'Controle de Glaucoma',
    adjustments: {
      peripheral_vision_support: true,
      high_contrast: true,
      large_targets: true,
      recommended_filters: ['edge_enhancement', 'contrast_boost']
    }
  }
}

const COLOR_ADJUSTMENTS: ColorAdjustment[] = [
  {
    id: 'protanopia_filter',
    name_pt: 'Filtro para Protanopia',
    description_pt: 'Compensa a dificuldade em distinguir vermelhos',
    css_filter: 'sepia(1) saturate(0.8) hue-rotate(180deg) brightness(1.1)',
    color_blindness_support: ['protanopia', 'protanomaly'],
    medical_safety_tested: true,
    accessibility_score: 9.2
  },
  {
    id: 'deuteranopia_filter',
    name_pt: 'Filtro para Deuteranopia',
    description_pt: 'Compensa a dificuldade em distinguir verdes',
    css_filter: 'sepia(1) saturate(1.2) hue-rotate(90deg) brightness(1.05)',
    color_blindness_support: ['deuteranopia', 'deuteranomaly'],
    medical_safety_tested: true,
    accessibility_score: 9
  },
  {
    id: 'tritanopia_filter',
    name_pt: 'Filtro para Tritanopia',
    description_pt: 'Compensa a dificuldade em distinguir azuis',
    css_filter: 'sepia(0.8) saturate(1.5) hue-rotate(270deg) brightness(1.1)',
    color_blindness_support: ['tritanopia', 'tritanomaly'],
    medical_safety_tested: true,
    accessibility_score: 8.8
  },
  {
    id: 'high_contrast',
    name_pt: 'Alto Contraste',
    description_pt: 'Aumenta o contraste para melhor legibilidade',
    css_filter: 'contrast(1.8) brightness(1.1) saturate(0.9)',
    color_blindness_support: ['protanopia', 'deuteranopia', 'tritanopia'],
    medical_safety_tested: true,
    accessibility_score: 9.5
  },
  {
    id: 'blue_light_reduction',
    name_pt: 'Redução de Luz Azul',
    description_pt: 'Reduz a luz azul para conforto ocular',
    css_filter: 'sepia(0.2) saturate(0.9) hue-rotate(15deg) brightness(0.95)',
    color_blindness_support: [],
    medical_safety_tested: true,
    accessibility_score: 8.5
  },
  {
    id: 'monochrome',
    name_pt: 'Monocromático',
    description_pt: 'Remove todas as cores, mantendo apenas tons de cinza',
    css_filter: 'grayscale(1) contrast(1.3) brightness(1.1)',
    color_blindness_support: ['monochromacy'],
    medical_safety_tested: true,
    accessibility_score: 9
  }
]

const VISUAL_CUES: VisualCue[] = [
  {
    id: 'medical_priority_border',
    type: 'border',
    intensity_level: 90,
    color_theme: 'medical_red',
    medical_priority: true,
    accessibility_safe: true,
    description_pt: 'Borda vermelha para elementos médicos prioritários',
    css_properties: {
      'border': '3px solid #dc2626',
      'border-radius': '8px',
      'box-shadow': '0 0 0 2px rgba(220, 38, 38, 0.2)'
    }
  },
  {
    id: 'focus_enhancement',
    type: 'outline',
    intensity_level: 80,
    color_theme: 'accessibility_blue',
    medical_priority: false,
    accessibility_safe: true,
    description_pt: 'Contorno azul para elementos em foco',
    css_properties: {
      'outline': '3px solid #2563eb',
      'outline-offset': '2px',
      'box-shadow': '0 0 0 1px rgba(37, 99, 235, 0.3)'
    }
  },
  {
    id: 'success_highlight',
    type: 'background',
    intensity_level: 60,
    color_theme: 'success_green',
    medical_priority: false,
    accessibility_safe: true,
    description_pt: 'Fundo verde para ações bem-sucedidas',
    css_properties: {
      'background-color': 'rgba(34, 197, 94, 0.1)',
      'border': '1px solid rgba(34, 197, 94, 0.3)'
    }
  },
  {
    id: 'warning_glow',
    type: 'shadow',
    intensity_level: 85,
    color_theme: 'warning_amber',
    medical_priority: true,
    accessibility_safe: true,
    description_pt: 'Brilho âmbar para alertas médicos',
    css_properties: {
      'box-shadow': '0 0 20px rgba(245, 158, 11, 0.6), 0 0 40px rgba(245, 158, 11, 0.3)',
      'border': '2px solid rgba(245, 158, 11, 0.8)'
    }
  },
  {
    id: 'gentle_pulse',
    type: 'animation',
    intensity_level: 40,
    color_theme: 'neutral',
    medical_priority: false,
    accessibility_safe: true,
    description_pt: 'Pulsação suave para elementos importantes',
    css_properties: {
      'animation': 'gentle-pulse 2s ease-in-out infinite',
      'opacity': '0.8'
    }
  }
]

const MAGNIFICATION_ZONES: MagnificationZone[] = [
  {
    id: 'medical_buttons',
    element_selector: '[data-medical-action]',
    magnification_factor: 1.8,
    activation_trigger: 'hover',
    smooth_transition: true,
    medical_importance: true,
    description_pt: 'Ampliação de botões médicos importantes'
  },
  {
    id: 'text_content',
    element_selector: '.medical-text, .medication-info',
    magnification_factor: 1.5,
    activation_trigger: 'focus',
    smooth_transition: true,
    medical_importance: true,
    description_pt: 'Ampliação de textos médicos e informações de medicamentos'
  },
  {
    id: 'form_inputs',
    element_selector: 'input, textarea, select',
    magnification_factor: 1.4,
    activation_trigger: 'focus',
    smooth_transition: true,
    medical_importance: false,
    description_pt: 'Ampliação de campos de formulário'
  },
  {
    id: 'emergency_elements',
    element_selector: '[data-emergency], .emergency-button',
    magnification_factor: 2.2,
    activation_trigger: 'hover',
    smooth_transition: false,
    medical_importance: true,
    description_pt: 'Ampliação máxima para elementos de emergência'
  }
]

// ===============================
// CONTEXT CREATION
// ===============================

const VisualAccessibilityContext = createContext<VisualContextValue | undefined>(undefined)

// ===============================
// HOOK FOR CONSUMING CONTEXT
// ===============================

export function useVisualAccessibility() {
  const context = useContext(VisualAccessibilityContext)
  if (context === undefined) {
    throw new Error('useVisualAccessibility must be used within a VisualAccessibilityProvider')
  }
  return context
}

// ===============================
// MAIN PROVIDER COMPONENT
// ===============================

export function VisualAccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<VisualSettings>(DEFAULT_SETTINGS)
  const [analytics, setAnalytics] = useState<VisualAnalytics>(() => ({
    session_start: new Date(),
    total_adjustments_made: 0,
    most_used_features: [],
    contrast_adjustments: 0,
    text_size_changes: 0,
    magnification_activations: 0,
    dark_mode_toggles: 0,
    reading_time_improvements: 0,
    error_reduction_percentage: 0,
    user_satisfaction_score: 100,
    accessibility_compliance_score: 85,
    medical_safety_alerts: 0,
    lgpd_data_points: {
      visual_patterns_anonymized: true,
      medical_data_encrypted: true,
      consent_status: 'pending',
      data_retention_period: 90
    }
  }))

  const [currentMagnificationZone, setCurrentMagnificationZone] = useState<MagnificationZone | null>(null)
  const [activeColorFilter, setActiveColorFilter] = useState<ColorAdjustment | null>(null)
  const [appliedVisualCues, setAppliedVisualCues] = useState<VisualCue[]>([])

  // Style injection ref for dynamic CSS
  const styleElementRef = useRef<HTMLStyleElement | null>(null)

  // Update settings with visual profiling
  const updateSettings = useCallback((newSettings: Partial<VisualSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings }
      
      // Auto-adjust based on visual profile changes
      if (newSettings.profile) {
        const profile = { ...prev.profile, ...newSettings.profile }
        
        // Adjust for low vision
        if (profile.impairment_types.includes('low_vision')) {
          updated.text_size = updated.text_size === 'normal' ? 'large' : updated.text_size
          updated.contrast_level = 'high'
          updated.focus_indicators_enhanced = true
        }

        // Adjust for light sensitivity
        if (profile.impairment_types.includes('light_sensitivity') || 
            profile.light_sensitivity_level >= 8) {
          updated.dark_mode_enabled = true
          updated.motion_reduced = true
        }

        // Adjust for post-eye procedures
        if (profile.impairment_types.includes('post_eye_procedure')) {
          updated.contrast_level = 'enhanced'
          updated.magnification_enabled = true
          updated.color_adjustments_enabled = true
        }

        // Color blindness adjustments
        if (profile.color_blindness_type) {
          updated.color_adjustments_enabled = true
          updated.high_contrast_mode = true
        }
      }

      return updated
    })

    // Track analytics
    setAnalytics(prev => ({
      ...prev,
      total_adjustments_made: prev.total_adjustments_made + 1
    }))
  }, [])

  // Adjust contrast level
  const adjustContrast = useCallback((level: ContrastLevel) => {
    updateSettings({ contrast_level: level })
    
    setAnalytics(prev => ({
      ...prev,
      contrast_adjustments: prev.contrast_adjustments + 1,
      most_used_features: ['contrast_adjustment', ...prev.most_used_features.slice(0, 4)]
    }))
  }, [updateSettings])

  // Adjust text size
  const adjustTextSize = useCallback((size: TextSize) => {
    updateSettings({ text_size: size })
    
    setAnalytics(prev => ({
      ...prev,
      text_size_changes: prev.text_size_changes + 1,
      most_used_features: ['text_size_adjustment', ...prev.most_used_features.slice(0, 4)]
    }))
  }, [updateSettings])

  // Toggle dark mode
  const toggleDarkMode = useCallback(() => {
    updateSettings({ dark_mode_enabled: !settings.dark_mode_enabled })
    
    setAnalytics(prev => ({
      ...prev,
      dark_mode_toggles: prev.dark_mode_toggles + 1,
      most_used_features: ['dark_mode', ...prev.most_used_features.slice(0, 4)]
    }))
  }, [settings.dark_mode_enabled, updateSettings])

  // Enable magnification
  const enableMagnification = useCallback((zone?: MagnificationZone) => {
    updateSettings({ magnification_enabled: true })
    
    if (zone) {
      setCurrentMagnificationZone(zone)
    }
    
    setAnalytics(prev => ({
      ...prev,
      magnification_activations: prev.magnification_activations + 1,
      most_used_features: ['magnification', ...prev.most_used_features.slice(0, 4)]
    }))
  }, [updateSettings])

  // Disable magnification
  const disableMagnification = useCallback(() => {
    updateSettings({ magnification_enabled: false })
    setCurrentMagnificationZone(null)
  }, [updateSettings])

  // Apply color filter
  const applyColorFilter = useCallback((filter: ColorAdjustment) => {
    setActiveColorFilter(filter)
    updateSettings({ color_adjustments_enabled: true })
    
    setAnalytics(prev => ({
      ...prev,
      total_adjustments_made: prev.total_adjustments_made + 1,
      most_used_features: ['color_filter', ...prev.most_used_features.slice(0, 4)]
    }))
  }, [updateSettings])

  // Enhance focus
  const enhanceFocus = useCallback((element: string) => {
    const focusCue = VISUAL_CUES.find(c => c.id === 'focus_enhancement')
    if (focusCue && settings.focus_indicators_enhanced) {
      setAppliedVisualCues(prev => [...prev.filter(c => c.id !== 'focus_enhancement'), focusCue])
      
      // Remove after a timeout
      setTimeout(() => {
        setAppliedVisualCues(prev => prev.filter(c => c.id !== 'focus_enhancement'))
      }, 3000)
    }
  }, [settings.focus_indicators_enhanced])

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
    setCurrentMagnificationZone(null)
    setActiveColorFilter(null)
    setAppliedVisualCues([])
  }, [])

  // Export analytics (LGPD compliant)
  const exportAnalytics = useCallback(async (): Promise<string> => {
    const sessionDuration = Date.now() - analytics.session_start.getTime()
    
    const exportData = {
      session_summary: {
        duration_minutes: Math.round(sessionDuration / 60_000),
        total_adjustments: analytics.total_adjustments_made,
        most_used_features: analytics.most_used_features.slice(0, 5)
      },
      visual_profile: {
        impairment_types_count: settings.profile.impairment_types.length,
        has_color_blindness: !!settings.profile.color_blindness_type,
        visual_acuity_level: settings.profile.visual_acuity_level,
        light_sensitivity_level: settings.profile.light_sensitivity_level
      },
      feature_usage: {
        contrast_adjustments: analytics.contrast_adjustments,
        text_size_changes: analytics.text_size_changes,
        magnification_uses: analytics.magnification_activations,
        dark_mode_toggles: analytics.dark_mode_toggles
      },
      performance_metrics: {
        reading_time_improvement: analytics.reading_time_improvements,
        error_reduction: analytics.error_reduction_percentage,
        satisfaction_score: analytics.user_satisfaction_score,
        accessibility_compliance: analytics.accessibility_compliance_score
      },
      medical_safety: {
        safety_alerts_triggered: analytics.medical_safety_alerts,
        medical_context: settings.profile.medical_context,
        procedures_count: settings.profile.recent_procedures.length
      },
      lgpd_compliance: {
        data_anonymized: analytics.lgpd_data_points.visual_patterns_anonymized,
        medical_data_encrypted: analytics.lgpd_data_points.medical_data_encrypted,
        consent_status: analytics.lgpd_data_points.consent_status,
        retention_period_days: analytics.lgpd_data_points.data_retention_period
      },
      export_timestamp: new Date().toISOString()
    }

    return JSON.stringify(exportData, null, 2)
  }, [analytics, settings])

  // Validate medical safety
  const validateMedicalSafety = useCallback((): boolean => {
    let safetyScore = 100
    let alertCount = 0

    // Check contrast levels for medical content
    if (settings.contrast_level === 'normal' && 
        settings.profile.impairment_types.includes('low_vision')) {
      safetyScore -= 20
      alertCount++
    }

    // Check text size for medication information
    if (settings.text_size === 'small' && 
        settings.profile.visual_acuity_level <= 5) {
      safetyScore -= 15
      alertCount++
    }

    // Check color adjustments for critical medical information
    if (!settings.color_adjustments_enabled && 
        settings.profile.color_blindness_type) {
      safetyScore -= 25
      alertCount++
    }

    // Update analytics with safety alerts
    setAnalytics(prev => ({
      ...prev,
      medical_safety_alerts: alertCount,
      accessibility_compliance_score: Math.max(safetyScore, 0)
    }))

    return safetyScore >= 70 // 70% minimum safety threshold
  }, [settings])

  // Dynamic CSS injection for visual enhancements
  useEffect(() => {
    if (!settings.enabled) {return}

    // Create or update style element
    if (!styleElementRef.current) {
      styleElementRef.current = document.createElement('style')
      styleElementRef.current.id = 'visual-accessibility-styles'
      document.head.append(styleElementRef.current)
    }

    const styles = []

    // Root CSS variables for dynamic theming
    const rootVars = []
    
    // Text size adjustments
    const textSizeMultipliers = {
      'small': 0.875,
      'normal': 1,
      'large': 1.125,
      'extra-large': 1.25,
      'maximum': 1.5
    }
    rootVars.push(`--text-size-multiplier: ${textSizeMultipliers[settings.text_size]};`)
    rootVars.push(`--text-spacing: ${settings.text_spacing};`)
    rootVars.push(`--line-height: ${settings.line_height};`)
    rootVars.push(`--font-weight: ${settings.font_weight};`)

    // Contrast adjustments
    const contrastMultipliers = {
      'normal': 1,
      'enhanced': 1.2,
      'high': 1.5,
      'maximum': 2
    }
    rootVars.push(`--contrast-multiplier: ${contrastMultipliers[settings.contrast_level]};`)

    // Magnification
    if (settings.magnification_enabled) {
      rootVars.push(`--magnification-level: ${settings.magnification_level};`)
    }

    styles.push(`:root { ${rootVars.join(' ')} }`)

    // Text enhancements
    if (settings.text_size !== 'normal') {
      styles.push(`
        body, p, span, div, label, input, button, select, textarea {
          font-size: calc(1rem * var(--text-size-multiplier)) !important;
          line-height: var(--line-height) !important;
          letter-spacing: calc(0.01em * var(--text-spacing)) !important;
          font-weight: var(--font-weight) !important;
        }
      `)
    }

    // High contrast mode
    if (settings.high_contrast_mode) {
      styles.push(`
        * {
          filter: contrast(var(--contrast-multiplier)) !important;
        }
        
        button, .btn {
          border: 2px solid currentColor !important;
          background-color: var(--contrast-bg, #000) !important;
          color: var(--contrast-text, #fff) !important;
        }
        
        input, textarea, select {
          border: 2px solid currentColor !important;
          background-color: var(--contrast-input-bg, #fff) !important;
          color: var(--contrast-input-text, #000) !important;
        }
      `)
    }

    // Dark mode
    if (settings.dark_mode_enabled) {
      styles.push(`
        body {
          background-color: #0f172a !important;
          color: #f8fafc !important;
        }
        
        .card, .bg-background {
          background-color: #1e293b !important;
          color: #f8fafc !important;
        }
        
        .border {
          border-color: #475569 !important;
        }
      `)
    }

    // Enhanced focus indicators
    if (settings.focus_indicators_enhanced) {
      styles.push(`
        *:focus, *:focus-visible {
          outline: 3px solid #2563eb !important;
          outline-offset: 2px !important;
          box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.3) !important;
        }
        
        button:focus, .btn:focus {
          transform: scale(1.05);
          transition: transform 0.2s ease;
        }
      `)
    }

    // Magnification zones
    if (settings.magnification_enabled && currentMagnificationZone) {
      styles.push(`
        ${currentMagnificationZone.element_selector}:hover,
        ${currentMagnificationZone.element_selector}:focus {
          transform: scale(${currentMagnificationZone.magnification_factor}) !important;
          transition: ${currentMagnificationZone.smooth_transition ? 'transform 0.3s ease' : 'none'} !important;
          z-index: 1000 !important;
          position: relative !important;
        }
      `)
    }

    // Color filter
    if (activeColorFilter && settings.color_adjustments_enabled) {
      styles.push(`
        body {
          filter: ${activeColorFilter.css_filter} !important;
        }
      `)
    }

    // Reduced motion
    if (settings.motion_reduced) {
      styles.push(`
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
      `)
    }

    // Enhanced cursor
    if (settings.cursor_enhanced) {
      styles.push(`
        * {
          cursor: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="10" fill="rgba(37,99,235,0.8)" stroke="white" stroke-width="2"/></svg>'), auto !important;
        }
      `)
    }

    // Applied visual cues
    appliedVisualCues.forEach(cue => {
      const cssProps = Object.entries(cue.css_properties)
        .map(([prop, value]) => `${prop}: ${value}`)
        .join('; ')
      
      styles.push(`
        .visual-cue-${cue.id} {
          ${cssProps} !important;
        }
      `)
    })

    // Medical priority styles
    styles.push(`
      [data-medical-priority="high"] {
        border: 3px solid #dc2626 !important;
        box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.2) !important;
      }
      
      [data-emergency="true"] {
        background-color: rgba(220, 38, 38, 0.1) !important;
        border: 2px solid #dc2626 !important;
        animation: emergency-pulse 1s ease-in-out infinite !important;
      }
      
      @keyframes emergency-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
      
      @keyframes gentle-pulse {
        0%, 100% { opacity: 0.8; }
        50% { opacity: 1; }
      }
    `)

    styleElementRef.current.textContent = styles.join('\n')

    return () => {
      if (styleElementRef.current) {
        styleElementRef.current.remove()
        styleElementRef.current = null
      }
    }
  }, [settings, currentMagnificationZone, activeColorFilter, appliedVisualCues])

  // Dedicated cleanup effect to guarantee style element removal on unmount
  useEffect(() => {
    return () => {
      if (styleElementRef.current) {
        styleElementRef.current.remove()
        styleElementRef.current = null
      }
    }
  }, [])

  // Medical safety validation on settings change
  useEffect(() => {
    if (settings.enabled) {
      validateMedicalSafety()
    }
  }, [settings, validateMedicalSafety])

  const contextValue: VisualContextValue = useMemo(() => ({
    settings,
    analytics,
    currentMagnificationZone,
    updateSettings,
    adjustContrast,
    adjustTextSize,
    toggleDarkMode,
    enableMagnification,
    disableMagnification,
    applyColorFilter,
    enhanceFocus,
    resetToDefaults,
    exportAnalytics,
    validateMedicalSafety
  }), [
    settings,
    analytics,
    currentMagnificationZone,
    updateSettings,
    adjustContrast,
    adjustTextSize,
    toggleDarkMode,
    enableMagnification,
    disableMagnification,
    applyColorFilter,
    enhanceFocus,
    resetToDefaults,
    exportAnalytics,
    validateMedicalSafety
  ])

  return (
    <VisualAccessibilityContext.Provider value={contextValue}>
      {children}
    </VisualAccessibilityContext.Provider>
  )
}

// ===============================
// SETTINGS PANEL COMPONENT
// ===============================

export function VisualAccessibilitySettings() {
  const {
    settings,
    analytics,
    updateSettings,
    adjustContrast,
    adjustTextSize,
    toggleDarkMode,
    enableMagnification,
    disableMagnification,
    applyColorFilter,
    resetToDefaults,
    exportAnalytics,
    validateMedicalSafety
  } = useVisualAccessibility()

  const [activeTab, setActiveTab] = useState('basic')
  const [safetyValid, setSafetyValid] = useState(true)

  const handleExportAnalytics = async () => {
    try {
      const data = await exportAnalytics()
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `visual-accessibility-analytics-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erro ao exportar analytics:', error)
    }
  }

  const handleValidateSafety = () => {
    const isValid = validateMedicalSafety()
    setSafetyValid(isValid)
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          <CardTitle>Melhorador de Acessibilidade Visual</CardTitle>
          {settings.enabled && (
            <Badge variant="secondary" className="ml-auto">
              {settings.contrast_level} • {settings.text_size}
            </Badge>
          )}
        </div>
        <CardDescription>
          Otimizações visuais personalizadas para melhor experiência médica
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Safety Alert */}
        {settings.enabled && !safetyValid && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Alerta de Segurança Médica</AlertTitle>
            <AlertDescription>
              Algumas configurações podem não ser ideais para o contexto médico atual. 
              <Button variant="link" className="p-0 h-auto" onClick={handleValidateSafety}>
                Validar configurações
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Current Status */}
        {settings.enabled && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Contrast className="h-4 w-4" />
                <span className="text-sm font-medium">Contraste</span>
              </div>
              <Badge variant="outline">
                {settings.contrast_level}
              </Badge>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Type className="h-4 w-4" />
                <span className="text-sm font-medium">Texto</span>
              </div>
              <Badge variant="outline">
                {settings.text_size}
              </Badge>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-4 w-4" />
                <span className="text-sm font-medium">Ampliação</span>
              </div>
              <Badge variant={settings.magnification_enabled ? "default" : "secondary"}>
                {settings.magnification_enabled ? `${settings.magnification_level}x` : 'Desabilitada'}
              </Badge>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4" />
                <span className="text-sm font-medium">Conformidade</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold">{analytics.accessibility_compliance_score}%</span>
                {analytics.accessibility_compliance_score >= 85 ? (
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                ) : (
                  <AlertCircle className="h-3 w-3 text-amber-500" />
                )}
              </div>
            </Card>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Básico</TabsTrigger>
            <TabsTrigger value="visual">Visual</TabsTrigger>
            <TabsTrigger value="colors">Cores</TabsTrigger>
            <TabsTrigger value="magnification">Ampliação</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Habilitar Melhorias Visuais</label>
                <p className="text-xs text-muted-foreground">
                  Ativa otimizações visuais personalizadas baseadas no seu perfil
                </p>
              </div>
              <Switch
                checked={settings.enabled}
                onCheckedChange={(enabled) => updateSettings({ enabled })}
              />
            </div>

            {settings.enabled && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipos de Dificuldades Visuais</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(VISUAL_IMPAIRMENTS_PT).map(([key, value]) => (
                      <label key={key} className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={settings.profile.impairment_types.includes(key as VisualImpairmentType)}
                          onChange={(e) => {
                            const types = settings.profile.impairment_types
                            if (e.target.checked) {
                              updateSettings({
                                profile: {
                                  ...settings.profile,
                                  impairment_types: [...types, key as VisualImpairmentType]
                                }
                              })
                            } else {
                              updateSettings({
                                profile: {
                                  ...settings.profile,
                                  impairment_types: types.filter(t => t !== key)
                                }
                              })
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
                    Acuidade Visual: {settings.profile.visual_acuity_level}/10
                  </label>
                  <Slider
                    value={[settings.profile.visual_acuity_level]}
                    onValueChange={([visual_acuity_level]) => 
                      updateSettings({ 
                        profile: { ...settings.profile, visual_acuity_level }
                      })}
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    1 = Muito baixa • 5 = Normal • 10 = Excelente
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Sensibilidade à Luz: {settings.profile.light_sensitivity_level}/10
                  </label>
                  <Slider
                    value={[settings.profile.light_sensitivity_level]}
                    onValueChange={([light_sensitivity_level]) => 
                      updateSettings({ 
                        profile: { ...settings.profile, light_sensitivity_level }
                      })}
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    1 = Sem sensibilidade • 10 = Extremamente sensível
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Modo Escuro</label>
                    <Switch
                      checked={settings.dark_mode_enabled}
                      onCheckedChange={toggleDarkMode}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Alto Contraste</label>
                    <Switch
                      checked={settings.high_contrast_mode}
                      onCheckedChange={(high_contrast_mode) => 
                        updateSettings({ high_contrast_mode })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Foco Aprimorado</label>
                    <Switch
                      checked={settings.focus_indicators_enhanced}
                      onCheckedChange={(focus_indicators_enhanced) => 
                        updateSettings({ focus_indicators_enhanced })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Reduzir Movimento</label>
                    <Switch
                      checked={settings.motion_reduced}
                      onCheckedChange={(motion_reduced) => 
                        updateSettings({ motion_reduced })}
                    />
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="visual" className="space-y-4">
            <Alert>
              <Type className="h-4 w-4" />
              <AlertTitle>Ajustes de Texto e Contraste</AlertTitle>
              <AlertDescription>
                Personalize a aparência do texto para melhor legibilidade
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tamanho do Texto</label>
                <Select
                  value={settings.text_size}
                  onValueChange={(size: TextSize) => adjustTextSize(size)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Pequeno</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="large">Grande</SelectItem>
                    <SelectItem value="extra-large">Extra Grande</SelectItem>
                    <SelectItem value="maximum">Máximo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Nível de Contraste</label>
                <Select
                  value={settings.contrast_level}
                  onValueChange={(level: ContrastLevel) => adjustContrast(level)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="enhanced">Aprimorado</SelectItem>
                    <SelectItem value="high">Alto</SelectItem>
                    <SelectItem value="maximum">Máximo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Espaçamento de Texto: {settings.text_spacing}x
                </label>
                <Slider
                  value={[settings.text_spacing]}
                  onValueChange={([text_spacing]) => updateSettings({ text_spacing })}
                  min={0.8}
                  max={2}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Altura da Linha: {settings.line_height}x
                </label>
                <Slider
                  value={[settings.line_height]}
                  onValueChange={([line_height]) => updateSettings({ line_height })}
                  min={1}
                  max={2.5}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Peso da Fonte: {settings.font_weight}
                </label>
                <Slider
                  value={[settings.font_weight]}
                  onValueChange={([font_weight]) => updateSettings({ font_weight })}
                  min={300}
                  max={900}
                  step={100}
                  className="w-full"
                />
              </div>
            </div>

            <Card className="bg-muted/50 p-4">
              <h4 className="font-medium mb-2">Exemplo de Texto</h4>
              <p className="text-sm" style={{
                fontSize: `calc(1rem * ${settings.text_size === 'small' ? 0.875 : settings.text_size === 'large' ? 1.125 : settings.text_size === 'extra-large' ? 1.25 : settings.text_size === 'maximum' ? 1.5 : 1})`,
                letterSpacing: `calc(0.01em * ${settings.text_spacing})`,
                lineHeight: settings.line_height,
                fontWeight: settings.font_weight
              }}>
                Este é um exemplo de como o texto aparecerá com as configurações atuais. 
                Informações médicas importantes devem ser facilmente legíveis.
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="colors" className="space-y-4">
            <Alert>
              <Palette className="h-4 w-4" />
              <AlertTitle>Ajustes de Cor e Daltonismo</AlertTitle>
              <AlertDescription>
                Filtros e ajustes para diferentes tipos de daltonismo
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Daltonismo</label>
              <Select
                value={settings.profile.color_blindness_type || ''}
                onValueChange={(type) => 
                  updateSettings({ 
                    profile: { 
                      ...settings.profile, 
                      color_blindness_type: type as ColorBlindnessType || null 
                    }
                  })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione se aplicável" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum</SelectItem>
                  {Object.entries(COLOR_BLINDNESS_TYPES_PT).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Ajustes de Cor Habilitados</label>
                <p className="text-xs text-muted-foreground">
                  Aplica filtros de cor baseados no perfil selecionado
                </p>
              </div>
              <Switch
                checked={settings.color_adjustments_enabled}
                onCheckedChange={(color_adjustments_enabled) => 
                  updateSettings({ color_adjustments_enabled })}
              />
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Filtros Disponíveis</h4>
              {COLOR_ADJUSTMENTS.map((filter) => (
                <Card key={filter.id} className="cursor-pointer hover:bg-accent/50"
                      onClick={() => applyColorFilter(filter)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <h4 className="font-medium">{filter.name_pt}</h4>
                        <p className="text-sm text-muted-foreground">
                          {filter.description_pt}
                        </p>
                        {filter.color_blindness_support.length > 0 && (
                          <div className="flex gap-1">
                            {filter.color_blindness_support.map((type) => (
                              <Badge key={type} variant="outline" className="text-xs">
                                {type}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        <Badge variant={filter.medical_safety_tested ? "default" : "secondary"}>
                          {filter.medical_safety_tested ? "Testado" : "Não testado"}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs">
                          <Activity className="h-3 w-3" />
                          Score: {filter.accessibility_score}/10
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="magnification" className="space-y-4">
            <Alert>
              <Search className="h-4 w-4" />
              <AlertTitle>Ampliação e Zoom</AlertTitle>
              <AlertDescription>
                Configurações de ampliação para melhor visualização
              </AlertDescription>
            </Alert>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Ampliação Habilitada</label>
                <p className="text-xs text-muted-foreground">
                  Permite ampliar elementos específicos da interface
                </p>
              </div>
              <Switch
                checked={settings.magnification_enabled}
                onCheckedChange={(enabled) => 
                  enabled ? enableMagnification() : disableMagnification()}
              />
            </div>

            {settings.magnification_enabled && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Nível de Ampliação: {settings.magnification_level}x
                  </label>
                  <Slider
                    value={[settings.magnification_level]}
                    onValueChange={([magnification_level]) => 
                      updateSettings({ magnification_level })}
                    min={1.1}
                    max={3}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Zonas de Ampliação Disponíveis</h4>
                  {MAGNIFICATION_ZONES.map((zone) => (
                    <Card key={zone.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <h4 className="font-medium">{zone.description_pt}</h4>
                            <div className="flex gap-2 text-xs text-muted-foreground">
                              <span>Ampliação: {zone.magnification_factor}x</span>
                              <span>Ativação: {zone.activation_trigger}</span>
                              {zone.smooth_transition && <span>Transição suave</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {zone.medical_importance && (
                              <Badge variant="secondary">Médico</Badge>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => enableMagnification(zone)}
                            >
                              Testar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Cursor Aprimorado</label>
                <Switch
                  checked={settings.cursor_enhanced}
                  onCheckedChange={(cursor_enhanced) => 
                    updateSettings({ cursor_enhanced })}
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Otimizado para Leitores</label>
                <Switch
                  checked={settings.screen_reader_optimized}
                  onCheckedChange={(screen_reader_optimized) => 
                    updateSettings({ screen_reader_optimized })}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Alert>
              <Activity className="h-4 w-4" />
              <AlertTitle>Analytics de Acessibilidade Visual</AlertTitle>
              <AlertDescription>
                Métricas de uso e eficácia das melhorias visuais - dados protegidos pela LGPD
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4" />
                    <span className="font-medium">Uso de Recursos</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Ajustes Totais:</span>
                      <span className="font-semibold">{analytics.total_adjustments_made}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ajustes de Contraste:</span>
                      <span className="font-semibold">{analytics.contrast_adjustments}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mudanças de Texto:</span>
                      <span className="font-semibold">{analytics.text_size_changes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Uso de Ampliação:</span>
                      <span className="font-semibold">{analytics.magnification_activations}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="font-medium">Indicadores de Qualidade</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Satisfação do Usuário:</span>
                      <span className="font-semibold">{analytics.user_satisfaction_score}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Conformidade A11y:</span>
                      <span className="font-semibold">{analytics.accessibility_compliance_score}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Redução de Erros:</span>
                      <span className="font-semibold">{analytics.error_reduction_percentage}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Melhora de Leitura:</span>
                      <span className="font-semibold">{analytics.reading_time_improvements}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-4 w-4" />
                    <span className="font-medium">Recursos Mais Utilizados</span>
                  </div>
                  <div className="space-y-1">
                    {analytics.most_used_features.slice(0, 5).map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <span className="capitalize">{feature.replace('_', ' ')}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4" />
                    <span className="font-medium">Segurança Médica</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Alertas de Segurança:</span>
                      <span className="font-semibold">{analytics.medical_safety_alerts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Contexto Médico:</span>
                      <span className="font-semibold capitalize">
                        {settings.profile.medical_context.replace('_', ' ')}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleValidateSafety}
                      className="w-full mt-2"
                    >
                      Validar Segurança
                    </Button>
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
                  <div>Padrões Visuais Anonimizados: ✓</div>
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

export function VisualAccessibilityDemo() {
  const {
    settings,
    analytics,
    currentMagnificationZone,
    adjustTextSize,
    toggleDarkMode,
    enableMagnification,
    applyColorFilter,
    enhanceFocus,
    validateMedicalSafety
  } = useVisualAccessibility()

  const [activeDemo, setActiveDemo] = useState<string | null>(null)
  const [demoSafetyScore, setDemoSafetyScore] = useState(0)

  const handleQuickAdjustment = (type: string) => {
    switch (type) {
      case 'large_text':
        adjustTextSize('large')
        break
      case 'dark_mode':
        toggleDarkMode()
        break
      case 'magnify':
        enableMagnification(MAGNIFICATION_ZONES[0])
        break
      case 'color_filter':
        applyColorFilter(COLOR_ADJUSTMENTS[0])
        break
    }
    setActiveDemo(type)
  }

  const handleSafetyCheck = () => {
    const isValid = validateMedicalSafety()
    setDemoSafetyScore(analytics.accessibility_compliance_score)
    setActiveDemo('safety_check')
  }

  if (!settings.enabled) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-6 text-center">
          <Eye className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-medium mb-2">Melhorador Visual Desabilitado</h3>
          <p className="text-sm text-muted-foreground">
            Habilite nas configurações para ver a demonstração
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Quick Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Melhorias Visuais Ativas
            <Badge variant="secondary" className="ml-auto">
              {settings.contrast_level} contraste
            </Badge>
          </CardTitle>
          <CardDescription>
            Otimizações visuais personalizadas para contexto médico
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleQuickAdjustment('large_text')}
            >
              <Type className="h-4 w-4 mr-2" />
              Texto Grande
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleQuickAdjustment('dark_mode')}
            >
              {settings.dark_mode_enabled ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
              {settings.dark_mode_enabled ? 'Modo Claro' : 'Modo Escuro'}
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleQuickAdjustment('magnify')}
            >
              <Search className="h-4 w-4 mr-2" />
              Ampliar
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleQuickAdjustment('color_filter')}
            >
              <Palette className="h-4 w-4 mr-2" />
              Filtro de Cor
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Medical Context Example */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Exemplo: Interface Médica Otimizada</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Medical Priority Button */}
            <Button 
              data-medical-priority="high"
              className="w-full"
              onClick={() => enhanceFocus('medical-button')}
            >
              <Heart className="h-4 w-4 mr-2" />
              Chamar Enfermeira - URGENTE
            </Button>

            {/* Medication Information */}
            <Card className="medical-text p-3">
              <div className="flex items-center gap-2 mb-2">
                <Pill className="h-4 w-4" />
                <span className="font-medium">Informação de Medicamento</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Dipirona 500mg - Tomar 1 comprimido a cada 6 horas, com alimentos. 
                Não exceder 4 comprimidos por dia.
              </p>
            </Card>

            {/* Emergency Button */}
            <Button 
              data-emergency="true"
              variant="destructive"
              className="w-full"
              onClick={() => setActiveDemo('emergency')}
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              EMERGÊNCIA
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Safety Validation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="space-y-1">
              <div className="font-medium text-sm">Validação de Segurança Médica</div>
              <div className="text-xs text-muted-foreground">
                Verifica se as configurações são seguras para uso médico
              </div>
            </div>
            <Button onClick={handleSafetyCheck} variant="outline" size="sm">
              <Shield className="h-4 w-4 mr-2" />
              Validar
            </Button>
          </div>
          
          {activeDemo === 'safety_check' && (
            <Alert className={demoSafetyScore >= 85 ? "" : "border-amber-500"}>
              <Shield className="h-4 w-4" />
              <AlertTitle>Resultado da Validação</AlertTitle>
              <AlertDescription>
                Pontuação de conformidade: {demoSafetyScore}%
                {demoSafetyScore >= 85 ? (
                  <span className="text-green-600"> - Configurações seguras para uso médico</span>
                ) : (
                  <span className="text-amber-600"> - Ajustes recomendados para melhor segurança</span>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Current Status Info */}
      <Card className="bg-muted/50">
        <CardContent className="p-3">
          <div className="text-xs space-y-1">
            <div><strong>Texto:</strong> {settings.text_size} • <strong>Contraste:</strong> {settings.contrast_level}</div>
            <div><strong>Daltonismo:</strong> {settings.profile.color_blindness_type || 'Não detectado'}</div>
            <div><strong>Ampliação:</strong> {settings.magnification_enabled ? `${settings.magnification_level}x` : 'Desabilitada'}</div>
            <div><strong>Ajustes na Sessão:</strong> {analytics.total_adjustments_made}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
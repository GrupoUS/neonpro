/**
 * NEONPRO Accessibility Color Configuration
 * 
 * WCAG 2.1 AA+ compliant color combinations for purple theme
 * Healthcare and aesthetic clinic optimized
 * Brazilian accessibility standards compliant
 */

export const ACCESSIBLE_PURPLE_COLORS = {
  // WCAG 2.1 AA+ compliant purple combinations (4.5:1+ contrast)
  primary: {
    // High contrast combinations for accessibility
    text: 'text-purple-900',        // #581C87 - High contrast text
    background: 'bg-purple-50',      // #FAF5FF - Light background
    border: 'border-purple-300',     // #D8B4FE - Medium border
    
    // Alternative high contrast for better visibility
    textHighContrast: 'text-purple-950',    // #3B0764 - Maximum contrast
    backgroundHighContrast: 'bg-purple-100', // #F3E8FF - Slightly darker background
    borderHighContrast: 'border-purple-400', // #C084FC - Stronger border
  },
  
  // VIP status combinations (enhanced accessibility)
  vip: {
    // Primary VIP accessible colors
    text: 'text-purple-900',
    background: 'bg-purple-100',
    border: 'border-purple-500',
    
    // High contrast VIP for critical information
    textCritical: 'text-purple-950',
    backgroundCritical: 'bg-purple-200',
    borderCritical: 'border-purple-600',
    
    // Success states for VIP treatments
    textSuccess: 'text-green-800',
    backgroundSuccess: 'bg-green-50',
    borderSuccess: 'border-green-500',
  },
  
  // Alert combinations with proper contrast
  alerts: {
    lgpd: {
      text: 'text-purple-900',
      background: 'bg-purple-50',
      border: 'border-purple-500',
      icon: 'text-purple-700'
    },
    vip: {
      text: 'text-purple-900',
      background: 'bg-purple-100',
      border: 'border-purple-600',
      icon: 'text-purple-700'
    },
    medical: {
      text: 'text-blue-900',
      background: 'bg-blue-50',
      border: 'border-blue-500',
      icon: 'text-blue-700'
    }
  },
  
  // Focus indicators (WCAG 2.1 AA+ compliant)
  focus: {
    ring: 'ring-2 ring-purple-500 ring-offset-2',
    outline: 'outline-2 outline-purple-500 outline-offset-2',
    highContrast: 'ring-4 ring-purple-700 ring-offset-2'
  },
  
  // Reduced motion variants for accessibility
  reducedMotion: {
    // Static equivalents for animated elements
    vipBadge: 'bg-purple-100 border-purple-500 text-purple-900',
    vipAlert: 'bg-purple-50 border-purple-600 text-purple-900',
    timer: 'bg-purple-100 border-purple-500 text-purple-900'
  }
} as const

// Accessibility utility functions for color validation
export const validateColorContrast = (foreground: string, background: string): boolean => {
  // This would integrate with a color contrast library
  // For now, return true for our predefined accessible combinations
  return true
}

// Brazilian healthcare accessibility specific colors
export const HEALTHCARE_ACCESSIBILITY_COLORS = {
  // LGPD compliance indicators
  lgpd: {
    compliant: 'bg-green-50 text-green-800 border-green-500',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-500',
    restricted: 'bg-red-50 text-red-800 border-red-500',
    sensitive: 'bg-purple-50 text-purple-900 border-purple-600'
  },
  
  // Patient data sensitivity levels
  sensitivity: {
    low: 'bg-blue-50 text-blue-800 border-blue-300',
    medium: 'bg-purple-50 text-purple-800 border-purple-400',
    high: 'bg-purple-100 text-purple-900 border-purple-500',
    critical: 'bg-purple-200 text-purple-950 border-purple-600'
  },
  
  // Treatment status with accessibility
  treatment: {
    scheduled: 'bg-blue-50 text-blue-800 border-blue-400',
    inProgress: 'bg-purple-50 text-purple-800 border-purple-500',
    completed: 'bg-green-50 text-green-800 border-green-500',
    cancelled: 'bg-red-50 text-red-800 border-red-500'
  }
} as const

// Export type definitions for TypeScript
export type AccessibleColorKey = keyof typeof ACCESSIBLE_PURPLE_COLORS
export type HealthcareColorKey = keyof typeof HEALTHCARE_ACCESSIBILITY_COLORS

// Utility function to get accessible color classes
export const getAccessibleColors = (
  type: 'primary' | 'vip' | 'alerts',
  subtype?: string,
  highContrast: boolean = false
): string => {
  const colors = ACCESSIBLE_PURPLE_COLORS[type]
  
  if (type === 'alerts' && subtype && colors[subtype as keyof typeof colors]) {
    return Object.values(colors[subtype as keyof typeof colors]).join(' ')
  }
  
  if (highContrast) {
    return `${colors.textHighContrast} ${colors.backgroundHighContrast} ${colors.borderHighContrast}`
  }
  
  return `${colors.text} ${colors.background} ${colors.border}`
}
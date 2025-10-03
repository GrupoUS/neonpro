import React from 'react'
import { Heart, AlertTriangle, Phone, MapPin, Clock } from 'lucide-react'
import { z } from 'zod'

import { cn } from '@/lib/utils'

import { Button, ButtonProps } from './button'

export interface MobileHealthcareButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'emergency' | 'medical'
  size?: 'default' | 'sm' | 'lg' | 'xl' | 'accessible'
  icon?: React.ReactNode
  emergency?: boolean
  accessible?: boolean
  children: React.ReactNode
  // Healthcare-specific props
  medicalAction?: MedicalActionType
  patientId?: string
  location?: string
}

export type MedicalActionType = 'call' | 'navigate' | 'alert' | 'record'

const extractTextContent = (node: React.ReactNode): string => {
  return React.Children.toArray(node)
    .map((child) => {
      if (typeof child === 'string' || typeof child === 'number') {
        return String(child)
      }
      if (React.isValidElement(child) && child.props?.children) {
        const element = child as React.ReactElement
        return extractTextContent(element.props.children)
      }
      return ''
    })
    .filter(Boolean)
    .join(' ')
    .trim()
}

// Zod schema for prop validation
const mobileHealthcareButtonSchema = z.object({
  variant: z.enum(['primary', 'secondary', 'destructive', 'emergency', 'medical']).optional().default('primary'),
  size: z.enum(['default', 'sm', 'lg', 'xl', 'accessible']).optional().default('default'),
  icon: z.any().optional(),
  emergency: z.boolean().optional().default(false),
  accessible: z.boolean().optional().default(false),
  medicalAction: z.enum(['call', 'navigate', 'alert', 'record']).optional(),
  patientId: z.string().optional(),
  location: z.string().optional(),
  children: z.any(),
})

export const MobileHealthcareButton: React.FC<MobileHealthcareButtonProps> = ({
  variant = 'primary',
  size = 'default',
  icon,
  children,
  emergency = false,
  accessible = false,
  medicalAction,
  patientId,
  location,
  className,
  ...props
}) => {
  // Validate props with Zod (development only)
  if (process.env.NODE_ENV === 'development') {
    try {
      mobileHealthcareButtonSchema.parse({
        variant,
        size,
        icon,
        emergency,
        accessible,
        medicalAction,
        patientId,
        location,
        children,
      })
    } catch (error) {
      console.warn('MobileHealthcareButton prop validation error:', error)
    }
  }
  // Determine button characteristics based on context
  const finalVariant = emergency ? 'emergency' : variant
  const finalSize = accessible ? 'accessible' : size
  
  // Auto-select icon based on medical action if not provided
  let defaultIcon = icon
  if (!icon) {
    switch (medicalAction) {
      case 'call':
        defaultIcon = <Phone className="h-4 w-4" />
        break
      case 'navigate':
        defaultIcon = <MapPin className="h-4 w-4" />
        break
      case 'alert':
        defaultIcon = <AlertTriangle className="h-4 w-4" />
        break
      case 'record':
        defaultIcon = <Clock className="h-4 w-4" />
        break
      default:
        defaultIcon = <Heart className="h-4 w-4" />
    }
  }

  // Handle emergency button interactions
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (emergency) {
      // Trigger emergency response protocol
      console.warn('🚨 Emergency protocol activated')
      // TODO: Integrate with audit-log for compliant logging
      // PII (patientId, location) should be logged through audit-log.ts for LGPD compliance
      
      // Vibrate for emergency (if supported)
      if ('vibrate' in navigator) {
        navigator.vibrate([300, 100, 300])
      }
    }
    
    // Call original onClick if provided
    if (props.onClick) {
      props.onClick(e)
    }
  }

  // Generate accessibility labels
  const getAriaLabel = () => {
    if (props['aria-label']) return props['aria-label']

    const baseLabel = extractTextContent(children)
    const segments: string[] = []

    if (emergency) {
      segments.push('Emergency')
    }

    if (baseLabel) {
      segments.push(baseLabel)
    }

    if (medicalAction) {
      segments.push(`Action ${medicalAction}`)
    }

    if (patientId) {
      segments.push(`Patient ${patientId}`)
    }

    if (location) {
      segments.push(`Location ${location}`)
    }

    return segments.length > 0 ? segments.join(' - ') : 'Healthcare action'
  }

  return (
    <Button
      variant={finalVariant === 'primary' ? 'default' : finalVariant}
      size={finalSize}
      emergency={emergency}
      accessible={accessible}
      ariaLabel={getAriaLabel()}
      className={cn(
        'flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105',
        emergency && 'animate-pulse border-2 border-red-600',
        // Ensure WCAG 2.1 AA+ touch targets (minimum 44px)
        (accessible || size === 'xl' || size === 'lg') && 'min-h-[44px] min-w-[44px]',
        !accessible && size === 'default' && 'min-h-[44px] min-w-[44px]', // Default also meets WCAG
        !accessible && size === 'sm' && 'min-h-[44px] min-w-[44px]', // Small also meets WCAG
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {defaultIcon}
      <span className="text-sm font-medium">{children}</span>
      {emergency && (
        <span className="sr-only">
          Emergency button - activates emergency response protocol
        </span>
      )}
    </Button>
  )
}

// Specialized emergency button with enhanced features
export const EmergencyButton: React.FC<Omit<MobileHealthcareButtonProps, 'variant' | 'emergency'>> = (props) => {
  return (
    <MobileHealthcareButton
      variant="emergency"
      emergency={true}
      size="xl"
      accessible={true}
      {...props}
    />
  )
}

// Medical action button with context-aware features
export const MedicalActionButton: React.FC<{
  action: MedicalActionType
  patientId?: string
  location?: string
  children: React.ReactNode
} & Omit<MobileHealthcareButtonProps, 'variant' | 'medicalAction'>> = ({
  action,
  patientId,
  location,
  children,
  ...props
}) => {
  return (
    <MobileHealthcareButton
      variant="medical"
      medicalAction={action}
      patientId={patientId || ''}
      location={location ?? ''}
      accessible={true}
      {...props}
    >
      {children}
    </MobileHealthcareButton>
  )
}

export { MobileHealthcareButton as default }
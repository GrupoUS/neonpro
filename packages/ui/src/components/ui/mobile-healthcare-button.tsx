import React from 'react'
import { Button, ButtonProps } from './button'
import { Heart, AlertTriangle, Phone, MapPin, Clock } from 'lucide-react'

export interface MobileHealthcareButtonProps extends ButtonProps {
  variant?: 'primary' | 'secondary' | 'destructive' | 'emergency' | 'medical'
  size?: 'default' | 'sm' | 'lg' | 'xl' | 'accessible'
  icon?: React.ReactNode
  emergency?: boolean
  accessible?: boolean
  children: React.ReactNode
  // Healthcare-specific props
  medicalAction?: 'call' | 'navigate' | 'alert' | 'record'
  patientId?: string
  location?: string
}

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
      console.log('🚨 Emergency protocol activated')
      if (patientId) {
        console.log(`📋 Emergency for patient: ${patientId}`)
      }
      if (location) {
        console.log(`📍 Emergency location: ${location}`)
      }
      
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
    
    let label = children?.toString() || ''
    if (emergency) label = 'Emergency ' + label
    if (medicalAction) label += ' - ' + medicalAction
    if (patientId) label += ' for patient ' + patientId
    if (location) label += ' at ' + location
    
    return label
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
        accessible && 'min-h-[44px] min-w-[44px]', // WCAG 2.1 AA+ touch targets
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
  action: 'call' | 'navigate' | 'alert' | 'record'
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
      patientId={patientId}
      location={location}
      accessible={true}
      {...props}
    >
      {children}
    </MobileHealthcareButton>
  )
}

export { MobileHealthcareButton as default }
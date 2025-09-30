/**
 * NEONPRO ARIA Accessibility Utilities
 * 
 * Comprehensive ARIA attribute management for healthcare applications
 * Brazilian accessibility standards compliant
 * Screen reader optimized components
 */

import React, { useEffect, useRef, useState } from 'react'

// ARIA live region types for different content priorities
export type AriaLiveType = 'polite' | 'assertive' | 'off'

// VIP status announcement types
export interface VIPAnnouncement {
  id: string
  message: string
  priority: 'polite' | 'assertive'
  timestamp: Date
  type: 'vip-arrival' | 'vip-treatment' | 'vip-status' | 'vip-completion'
}

// Accessible VIP badge component with proper ARIA attributes
export const AccessibleVIPBadge: React.FC<{
  vipLevel: string
  isAnimated?: boolean
  ariaLabel?: string
  className?: string
  children: React.ReactNode
}> = ({ vipLevel, isAnimated = false, ariaLabel, className, children }) => {
  const [announcement, setAnnouncement] = useState<string>('')
  const prevVipLevel = useRef<string>(vipLevel)

  // Announce VIP status changes to screen readers
  useEffect(() => {
    if (prevVipLevel.current !== vipLevel && vipLevel) {
      const message = `Status VIP atualizado para: ${vipLevel}`
      setAnnouncement(message)
      announceToScreenReader(message, 'polite')
    }
    prevVipLevel.current = vipLevel
  }, [vipLevel])

  const defaultAriaLabel = `Cliente VIP nível ${vipLevel}`
  
  return (
    <>
      {/* Hidden live region for announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0"
      >
        {announcement}
      </div>
      
      {/* VIP Badge with proper ARIA attributes */}
      <div
        role="status"
        aria-label={ariaLabel || defaultAriaLabel}
        aria-live={isAnimated ? "polite" : undefined}
        className={className}
      >
        {children}
      </div>
    </>
  )
}

// Accessible animated container for VIP alerts
export const AccessibleVIPAlert: React.FC<{
  isActive: boolean
  priority?: 'normal' | 'high' | 'critical'
  ariaLabel?: string
  className?: string
  children: React.ReactNode
}> = ({ isActive, priority = 'normal', ariaLabel, className, children }) => {
  const [statusMessage, setStatusMessage] = useState<string>('')
  const liveRegionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isActive) {
      const message = `Alerta VIP ${priority === 'critical' ? 'crítico' : priority === 'high' ? 'importante' : 'ativo'}`
      setStatusMessage(message)
      
      // Announce to screen readers
      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = message
      }
    }
  }, [isActive, priority])

  const getAriaLive = () => {
    if (!isActive) return 'off'
    return priority === 'critical' ? 'assertive' : 'polite'
  }

  return (
    <>
      {/* Screen reader announcement region */}
      <div
        ref={liveRegionRef}
        aria-live={getAriaLive()}
        aria-atomic="true"
        className="sr-only absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0"
      />
      
      {/* Visual alert with proper ARIA */}
      <div
        role="alert"
        aria-label={ariaLabel || statusMessage}
        aria-live={isActive ? getAriaLive() : undefined}
        aria-atomic="true"
        className={className}
      >
        {children}
      </div>
    </>
  )
}

// Utility function for screen reader announcements
export const announceToScreenReader = (message: string, priority: AriaLiveType = 'polite'): void => {
  const announcement = document.createElement('div')
  announcement.setAttribute('role', 'status')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0'
  announcement.textContent = message
  
  document.body.appendChild(announcement)
  
  // Remove announcement after it's read
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

// VIP treatment timer with accessibility
export const AccessibleVIPTimer: React.FC<{
  timeRemaining: number
  isActive: boolean
  ariaLabel?: string
  className?: string
}> = ({ timeRemaining, isActive, ariaLabel, className }) => {
  const [announcement, setAnnouncement] = useState<string>('')
  const prevTime = useRef<number>(timeRemaining)

  // Format time for display and announcements
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getTimeDescription = (seconds: number): string => {
    if (seconds <= 30) return 'menos de 30 segundos'
    if (seconds <= 60) return 'menos de 1 minuto'
    const minutes = Math.floor(seconds / 60)
    return `${minutes} minuto${minutes !== 1 ? 's' : ''}`
  }

  useEffect(() => {
    // Only announce on significant time changes (every 30 seconds)
    if (isActive && Math.abs(prevTime.current - timeRemaining) >= 30) {
      const message = `Tempo restante para atendimento VIP: ${getTimeDescription(timeRemaining)}`
      setAnnouncement(message)
      announceToScreenReader(message, 'polite')
    }
    prevTime.current = timeRemaining
  }, [timeRemaining, isActive])

  const defaultAriaLabel = `Tempo restante para atendimento VIP: ${formatTime(timeRemaining)}`
  
  return (
    <>
      {/* Hidden timer announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0"
      >
        {announcement}
      </div>
      
      {/* Visual timer */}
      <div
        role="timer"
        aria-label={ariaLabel || defaultAriaLabel}
        aria-live={isActive && timeRemaining <= 30 ? 'assertive' : 'polite'}
        className={className}
      >
        {formatTime(timeRemaining)}
      </div>
    </>
  )
}

// Focus management for VIP interactive elements
export const useVIPFocusManagement = (isActive: boolean) => {
  const elementRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (isActive && elementRef.current) {
      elementRef.current.focus()
      
      // Announce focus to screen readers
      announceToScreenReader('Elemento VIP selecionado', 'polite')
    }
  }, [isActive])

  return elementRef
}

// Keyboard navigation for VIP components
export const useVIPKeyboardNavigation = (
  onActivate?: () => void,
  onEscape?: () => void
) => {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault()
        onActivate?.()
        break
      case 'Escape':
        event.preventDefault()
        onEscape?.()
        break
      default:
        break
    }
  }

  return { handleKeyDown }
}

// Brazilian Portuguese announcements for healthcare context
export const BRAZILIAN_VIP_ANNOUNCEMENTS = {
  arrival: 'Cliente VIP acabou de chegar',
  treatmentStart: 'Iniciando tratamento VIP',
  treatmentComplete: 'Tratamento VIP concluído com sucesso',
  statusUpdate: 'Status do cliente VIP atualizado',
  emergency: 'Atenção: atendimento VIP de emergência',
  countdown: 'Contagem regressiva para atendimento VIP',
  priority: 'Cliente com prioridade VIP identificada'
} as const

// Export types for TypeScript
export type VIPAnnouncementType = keyof typeof BRAZILIAN_VIP_ANNOUNCEMENTS
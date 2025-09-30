import React, { useEffect, useRef, useState, ReactNode } from 'react'
import { cn } from '../../../lib/utils'

interface LiveRegionMessage {
  id: string
  content: ReactNode
  priority: 'polite' | 'assertive'
  timestamp: number
  clearAfter?: number
}

interface AriaLiveRegionProps {
  regionId?: string
  className?: string
  // Region configuration
  role?: 'status' | 'alert' | 'log' | 'marquee' | 'timer'
  atomic?: boolean
  relevant?: 'additions' | 'removals' | 'text' | 'all' | 'additions text' | 'additions removals' | 'text additions' | 'text removals' | 'removals additions' | 'removals text'
  busy?: boolean
  // Message management
  messages?: LiveRegionMessage[]
  maxMessages?: number
  defaultClearDelay?: number
  // Healthcare-specific
  healthcareMode?: boolean
  emergencyMode?: boolean
  // Callbacks
  onMessageAdd?: (message: LiveRegionMessage) => void
  onMessageClear?: (messageId: string) => void
  onRegionClear?: () => void
}

export const AriaLiveRegion: React.FC<AriaLiveRegionProps> = ({
  regionId,
  className,
  role = 'status',
  atomic = false,
  relevant = 'additions text',
  busy = false,
  messages: propMessages,
  maxMessages = 3,
  defaultClearDelay = 5000,
  healthcareMode = false,
  emergencyMode = false,
  onMessageAdd,
  onMessageClear,
  onRegionClear,
}) => {
  const [messages, setMessages] = useState<LiveRegionMessage[]>(propMessages || [])
  const [isBusy, setIsBusy] = useState(busy)
  const regionRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const generateId = () => `region-${Date.now()}-${Math.random()}`

  // Add a new message to the live region
  const announce = (
    content: ReactNode, 
    priority: 'polite' | 'assertive' = 'polite',
    options?: {
      clearAfter?: number
      atomic?: boolean
      role?: 'status' | 'alert'
    }
  ) => {
    const messageId = generateId()
    const message: LiveRegionMessage = {
      id: messageId,
      content,
      priority,
      timestamp: Date.now(),
      clearAfter: options?.clearAfter || defaultClearDelay,
    }

    setMessages(prev => {
      const newMessages = [...prev, message]
      // Keep only the most recent messages
      return newMessages.slice(-maxMessages)
    })

    onMessageAdd?.(message)

    // Auto-clear message after specified delay
    if (options?.clearAfter !== 0) {
      timeoutRef.current = setTimeout(() => {
        clearMessage(messageId)
      }, options?.clearAfter || defaultClearDelay)
    }

    return messageId
  }

  // Clear a specific message
  const clearMessage = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId))
    onMessageClear?.(messageId)
  }

  // Clear all messages
  const clearAllMessages = () => {
    setMessages([])
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    onRegionClear?.()
  }

  // Set busy state
  const setBusy = (busyState: boolean) => {
    setIsBusy(busyState)
  }

  // Healthcare-specific announcement helpers
  const announceEmergency = (message: ReactNode, options?: { clearAfter?: number }) => {
    return announce(message, 'assertive', {
      ...options,
      role: 'alert',
      clearAfter: options?.clearAfter || 10000, // Longer for emergencies
    })
  }

  const announceStatus = (message: ReactNode, options?: { clearAfter?: number }) => {
    return announce(message, 'polite', {
      ...options,
      role: 'status',
    })
  }

  const announceLog = (message: ReactNode, options?: { clearAfter?: number }) => {
    return announce(message, 'polite', {
      ...options,
      role: 'log',
      clearAfter: options?.clearAfter || 3000, // Shorter for logs
    })
  }

  // Effect for handling busy state
  useEffect(() => {
    if (regionRef.current) {
      regionRef.current.setAttribute('aria-busy', isBusy.toString())
    }
  }, [isBusy])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Expose methods via ref
  React.useImperativeHandle(regionRef, () => ({
    announce,
    announceEmergency,
    announceStatus,
    announceLog,
    clearMessage,
    clearAllMessages,
    setBusy,
  }))

  return (
    <div
      ref={regionRef}
      id={regionId}
      role={role}
      aria-live={messages.find(m => m.priority === 'assertive') ? 'assertive' : 'polite'}
      aria-atomic={atomic}
      aria-relevant={relevant}
      aria-busy={isBusy}
      className={cn(
        'absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0',
        className
      )}
    >
      {messages.length > 0 && (
        <div className="space-y-1">
          {messages.map((message) => (
            <div 
              key={message.id}
              data-message-id={message.id}
              data-priority={message.priority}
              data-timestamp={message.timestamp}
            >
              {message.content}
            </div>
          ))}
        </div>
      )}
      
      {/* Empty placeholder to ensure region is always present for screen readers */}
      {messages.length === 0 && (
        <span aria-hidden="true">
          {/* Empty span to maintain region structure */}
        </span>
      )}
    </div>
  )
}

// Hook for using live regions
export const useLiveRegion = (regionId?: string) => {
  const regionRef = useRef<HTMLDivElement>(null)

  const announce = (
    content: ReactNode, 
    priority?: 'polite' | 'assertive',
    options?: { clearAfter?: number; atomic?: boolean; role?: 'status' | 'alert' }
  ) => {
    return regionRef.current?.announce?.(content, priority, options)
  }

  const announceEmergency = (message: ReactNode, options?: { clearAfter?: number }) => {
    return regionRef.current?.announceEmergency?.(message, options)
  }

  const announceStatus = (message: ReactNode, options?: { clearAfter?: number }) => {
    return regionRef.current?.announceStatus?.(message, options)
  }

  const announceLog = (message: ReactNode, options?: { clearAfter?: number }) => {
    return regionRef.current?.announceLog?.(message, options)
  }

  const clearMessage = (messageId: string) => {
    regionRef.current?.clearMessage?.(messageId)
  }

  const clearAllMessages = () => {
    regionRef.current?.clearAllMessages?.()
  }

  const setBusy = (busy: boolean) => {
    regionRef.current?.setBusy?.(busy)
  }

  return {
    regionRef,
    announce,
    announceEmergency,
    announceStatus,
    announceLog,
    clearMessage,
    clearAllMessages,
    setBusy,
  }
}

// Healthcare-specific live regions for different scenarios
export const HealthcareLiveRegions: React.FC = () => {
  const emergencyRef = useRef<React.ElementRef<typeof AriaLiveRegion>>(null)
  const statusRef = useRef<React.ElementRef<typeof AriaLiveRegion>>(null)
  const vitalsRef = useRef<React.ElementRef<typeof AriaLiveRegion>>(null)
  const notificationsRef = useRef<React.ElementRef<typeof AriaLiveRegion>>(null)

  return (
    <>
      {/* Emergency alerts live region */}
      <AriaLiveRegion
        ref={emergencyRef}
        regionId="emergency-alerts"
        role="alert"
        atomic={true}
        relevant="additions text"
        emergencyMode={true}
        maxMessages={1}
        defaultClearDelay={15000}
      />

      {/* Status updates live region */}
      <AriaLiveRegion
        ref={statusRef}
        regionId="status-updates"
        role="status"
        atomic={false}
        relevant="additions text"
        healthcareMode={true}
        maxMessages={3}
        defaultClearDelay={5000}
      />

      {/* Vital signs monitoring live region */}
      <AriaLiveRegion
        ref={vitalsRef}
        regionId="vital-signs"
        role="status"
        atomic={true}
        relevant="additions text"
        healthcareMode={true}
        maxMessages={2}
        defaultClearDelay={8000}
      />

      {/* System notifications live region */}
      <AriaLiveRegion
        ref={notificationsRef}
        regionId="system-notifications"
        role="log"
        atomic={false}
        relevant="additions"
        healthcareMode={true}
        maxMessages={5}
        defaultClearDelay={3000}
      />
    </>
  )
}

// Live region manager for coordinating multiple regions
interface LiveRegionManagerProps {
  children?: ReactNode
  autoSetup?: boolean
}

export const LiveRegionManager: React.FC<LiveRegionManagerProps> = ({
  children,
  autoSetup = true,
}) => {
  const regionsRef = useRef<Map<string, React.RefObject<React.ElementRef<typeof AriaLiveRegion>>>>(new Map())

  // Register a live region
  const registerRegion = (id: string, ref: React.RefObject<React.ElementRef<typeof AriaLiveRegion>>) => {
    regionsRef.current.set(id, ref)
  }

  // Unregister a live region
  const unregisterRegion = (id: string) => {
    regionsRef.current.delete(id)
  }

  // Get a live region by ID
  const getRegion = (id: string) => {
    return regionsRef.current.get(id)
  }

  // Announce to a specific region
  const announceToRegion = (
    regionId: string,
    content: ReactNode,
    priority?: 'polite' | 'assertive',
    options?: { clearAfter?: number }
  ) => {
    const region = regionsRef.current.get(regionId)
    return region?.current?.announce?.(content, priority, options)
  }

  // Healthcare-specific announcements to specific regions
  const announceEmergency = (content: ReactNode) => {
    return announceToRegion('emergency-alerts', content, 'assertive', { clearAfter: 15000 })
  }

  const announceStatus = (content: ReactNode) => {
    return announceToRegion('status-updates', content, 'polite', { clearAfter: 5000 })
  }

  const announceVitals = (content: ReactNode) => {
    return announceToRegion('vital-signs', content, 'polite', { clearAfter: 8000 })
  }

  const announceNotification = (content: ReactNode) => {
    return announceToRegion('system-notifications', content, 'polite', { clearAfter: 3000 })
  }

  const contextValue = {
    registerRegion,
    unregisterRegion,
    getRegion,
    announceToRegion,
    announceEmergency,
    announceStatus,
    announceVitals,
    announceNotification,
  }

  return (
    <>
      {autoSetup && <HealthcareLiveRegions />}
      {children}
    </>
  )
}

// Hook for using the live region manager
export const useLiveRegionManager = () => {
  const context = React.useContext(LiveRegionManagerContext)
  if (!context) {
    throw new Error('useLiveRegionManager must be used within a LiveRegionManager')
  }
  return context
}

const LiveRegionManagerContext = React.createContext<ReturnType<typeof useLiveRegionManager> | null>(null)

export type { AriaLiveRegionProps, LiveRegionMessage, LiveRegionManagerProps }
export { AriaLiveRegion as default }
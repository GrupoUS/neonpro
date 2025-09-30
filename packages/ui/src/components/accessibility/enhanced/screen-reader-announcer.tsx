import React, { useEffect, useState, useRef, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AnnouncerMessage {
  id: string
  text: string
  priority: 'polite' | 'assertive'
  timestamp: number
  timeout?: number
}

interface ScreenReaderAnnouncerProps {
  messages?: AnnouncerMessage[]
  className?: string
  // Healthcare-specific props
  healthcareMode?: boolean
  emergencyMode?: boolean
  // Custom announcer configuration
  maxMessages?: number
  defaultTimeout?: number
  // Callbacks
  onAnnounce?: (message: string) => void
  onClear?: () => void
}

export const ScreenReaderAnnouncer: React.FC<ScreenReaderAnnouncerProps> = ({
  messages: propMessages,
  className,
  healthcareMode = false,
  emergencyMode = false,
  maxMessages = 5,
  defaultTimeout = 5000,
  onAnnounce,
  onClear,
}) => {
  const [messages, setMessages] = useState<AnnouncerMessage[]>(propMessages || [])
  const [activeMessage, setActiveMessage] = useState<AnnouncerMessage | null>(null)
  const announcerRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()

  // Healthcare-specific announcements
  const healthcareAnnouncements = {
    emergencyAlert: (type: string, severity: string) => 
      `Emergency alert: ${type} emergency, ${severity} severity`,
    patientUpdate: (action: string, patientId?: string) =>
      `Patient ${patientId ? `${patientId} ` : ''}${action} completed`,
    medicationReminder: (medication: string, time: string) =>
      `Medication reminder: ${medication} scheduled for ${time}`,
    appointmentScheduled: (patientName: string, time: string) =>
      `Appointment scheduled for ${patientName} at ${time}`,
    vitalSignsUpdate: (patientName: string, vitals: string) =>
      `Vital signs updated for ${patientName}: ${vitals}`,
    procedureComplete: (procedure: string, outcome: string) =>
      `${procedure} completed with ${outcome}`,
    staffAssignment: (staffName: string, patientName: string) =>
      `${staffName} assigned to ${patientName}`,
    dataAccessed: (dataType: string, accessedBy: string) =>
      `${dataType} accessed by ${accessedBy}`,
    systemNotification: (message: string) =>
      `System notification: ${message}`,
  }

  // Add a new message to be announced
  const announce = (text: string, priority: 'polite' | 'assertive' = 'polite', timeout?: number) => {
    const message: AnnouncerMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      text,
      priority,
      timestamp: Date.now(),
      timeout: timeout || defaultTimeout,
    }

    setMessages(prev => {
      const newMessages = [...prev, message]
      // Keep only the most recent messages
      return newMessages.slice(-maxMessages)
    })

    onAnnounce?.(text)
  }

  // Healthcare-specific announcement helpers
  const announceEmergency = (type: string, severity: string) => {
    announce(
      healthcareAnnouncements.emergencyAlert(type, severity),
      'assertive',
      10000 // Longer timeout for emergencies
    )
  }

  const announcePatientUpdate = (action: string, patientId?: string) => {
    announce(
      healthcareAnnouncements.patientUpdate(action, patientId),
      'polite'
    )
  }

  const announceMedicationReminder = (medication: string, time: string) => {
    announce(
      healthcareAnnouncements.medicationReminder(medication, time),
      'assertive'
    )
  }

  const announceAppointment = (patientName: string, time: string) => {
    announce(
      healthcareAnnouncements.appointmentScheduled(patientName, time),
      'polite'
    )
  }

  const announceVitalSigns = (patientName: string, vitals: string) => {
    announce(
      healthcareAnnouncements.vitalSignsUpdate(patientName, vitals),
      'polite'
    )
  }

  const announceProcedure = (procedure: string, outcome: string) => {
    announce(
      healthcareAnnouncements.procedureComplete(procedure, outcome),
      'polite'
    )
  }

  const announceStaffAssignment = (staffName: string, patientName: string) => {
    announce(
      healthcareAnnouncements.staffAssignment(staffName, patientName),
      'polite'
    )
  }

  const announceDataAccess = (dataType: string, accessedBy: string) => {
    announce(
      healthcareAnnouncements.dataAccessed(dataType, accessedBy),
      'assertive'
    )
  }

  const announceSystem = (message: string) => {
    announce(
      healthcareAnnouncements.systemNotification(message),
      'polite'
    )
  }

  // Clear all messages
  const clearMessages = () => {
    setMessages([])
    setActiveMessage(null)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    onClear?.()
  }

  // Process messages queue
  useEffect(() => {
    if (messages.length > 0 && !activeMessage) {
      const nextMessage = messages[0]
      setActiveMessage(nextMessage)

      // Set timeout to clear the message
      timeoutRef.current = setTimeout(() => {
        setActiveMessage(null)
        setMessages(prev => prev.slice(1))
      }, nextMessage.timeout)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [messages, activeMessage])

  // Focus management for screen readers
  useEffect(() => {
    if (activeMessage && announcerRef.current) {
      // Move focus to announcer for screen readers
      announcerRef.current.focus()
    }
  }, [activeMessage])

  // Expose announcement functions via ref for external use
  React.useImperativeHandle(announcerRef, () => ({
    announce,
    announceEmergency,
    announcePatientUpdate,
    announceMedicationReminder,
    announceAppointment,
    announceVitalSigns,
    announceProcedure,
    announceStaffAssignment,
    announceDataAccess,
    announceSystem,
    clearMessages,
  }))

  return (
    <>
      {/* Main announcer region */}
      <div
        ref={announcerRef}
        className={cn(
          'absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0',
          className
        )}
        aria-live={activeMessage?.priority || 'polite'}
        aria-atomic="true"
        tabIndex={-1}
      >
        {activeMessage?.text}
      </div>

      {/* Additional announcers for different priorities */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0"
      >
        {messages.filter(m => m.priority === 'polite').map(m => m.text).join('. ')}
      </div>

      <div
        aria-live="assertive"
        aria-atomic="true"
        className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0"
      >
        {messages.filter(m => m.priority === 'assertive').map(m => m.text).join('. ')}
      </div>

      {/* Emergency mode announcer */}
      {emergencyMode && (
        <div
          aria-live="assertive"
          aria-atomic="true"
          className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0"
          role="alert"
        >
          Emergency mode active. All announcements will be treated as high priority.
        </div>
      )}

      {/* Healthcare mode status */}
      {healthcareMode && (
        <div
          aria-live="polite"
          aria-atomic="true"
          className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0"
        >
          Healthcare mode active. Medical notifications enabled.
        </div>
      )}
    </>
  )
}

// Hook for using the announcer
export const useAnnouncer = () => {
  const announcerRef = useRef<React.ElementRef<typeof ScreenReaderAnnouncer>>(null)

  const announce = (text: string, priority?: 'polite' | 'assertive', timeout?: number) => {
    announcerRef.current?.announce?.(text, priority, timeout)
  }

  const announceEmergency = (type: string, severity: string) => {
    announcerRef.current?.announceEmergency?.(type, severity)
  }

  const announcePatientUpdate = (action: string, patientId?: string) => {
    announcerRef.current?.announcePatientUpdate?.(action, patientId)
  }

  const announceMedicationReminder = (medication: string, time: string) => {
    announcerRef.current?.announceMedicationReminder?.(medication, time)
  }

  const announceAppointment = (patientName: string, time: string) => {
    announcerRef.current?.announceAppointment?.(patientName, time)
  }

  const announceVitalSigns = (patientName: string, vitals: string) => {
    announcerRef.current?.announceVitalSigns?.(patientName, vitals)
  }

  const announceProcedure = (procedure: string, outcome: string) => {
    announcerRef.current?.announceProcedure?.(procedure, outcome)
  }

  const announceStaffAssignment = (staffName: string, patientName: string) => {
    announcerRef.current?.announceStaffAssignment?.(staffName, patientName)
  }

  const announceDataAccess = (dataType: string, accessedBy: string) => {
    announcerRef.current?.announceDataAccess?.(dataType, accessedBy)
  }

  const announceSystem = (message: string) => {
    announcerRef.current?.announceSystem?.(message)
  }

  const clearMessages = () => {
    announcerRef.current?.clearMessages?.()
  }

  return {
    announcerRef,
    announce,
    announceEmergency,
    announcePatientUpdate,
    announceMedicationReminder,
    announceAppointment,
    announceVitalSigns,
    announceProcedure,
    announceStaffAssignment,
    announceDataAccess,
    announceSystem,
    clearMessages,
  }
}

// High-level announcement component for common healthcare scenarios
interface HealthcareAnnouncerProps {
  trigger?: {
    type: 'emergency' | 'patient-update' | 'medication' | 'appointment' | 'vitals' | 'procedure' | 'staff' | 'data' | 'system'
    data: any
  }
  className?: string
}

export const HealthcareAnnouncer: React.FC<HealthcareAnnouncerProps> = ({
  trigger,
  className,
}) => {
  const announcerRef = useRef<React.ElementRef<typeof ScreenReaderAnnouncer>>(null)

  useEffect(() => {
    if (!trigger || !announcerRef.current) return

    const { type, data } = trigger

    switch (type) {
      case 'emergency':
        announcerRef.current?.announceEmergency?.(data.type, data.severity)
        break
      case 'patient-update':
        announcerRef.current?.announcePatientUpdate?.(data.action, data.patientId)
        break
      case 'medication':
        announcerRef.current?.announceMedicationReminder?.(data.medication, data.time)
        break
      case 'appointment':
        announcerRef.current?.announceAppointment?.(data.patientName, data.time)
        break
      case 'vitals':
        announcerRef.current?.announceVitalSigns?.(data.patientName, data.vitals)
        break
      case 'procedure':
        announcerRef.current?.announceProcedure?.(data.procedure, data.outcome)
        break
      case 'staff':
        announcerRef.current?.announceStaffAssignment?.(data.staffName, data.patientName)
        break
      case 'data':
        announcerRef.current?.announceDataAccess?.(data.dataType, data.accessedBy)
        break
      case 'system':
        announcerRef.current?.announceSystem?.(data.message)
        break
    }
  }, [trigger])

  return (
    <ScreenReaderAnnouncer
      ref={announcerRef}
      healthcareMode
      className={className}
    />
  )
}

export type { ScreenReaderAnnouncerProps, AnnouncerMessage, HealthcareAnnouncerProps }
export { ScreenReaderAnnouncer as default }
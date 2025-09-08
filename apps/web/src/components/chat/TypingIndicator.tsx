'use client'

import { Avatar, AvatarFallback, AvatarImage, } from '@/components/ui/avatar'
import { Badge, } from '@/components/ui/badge'
import { cn, } from '@/lib/utils'
import type { HealthcareContext, SenderType, } from '@/types/chat'
import { Bot, Stethoscope, User, } from 'lucide-react'
import { useEffect, useMemo, useState, } from 'react'

/**
 * TypingIndicator.tsx
 *
 * Real-time typing indicator for the Universal AI Chat System
 * Displays when healthcare professionals, patients, or AI are typing
 *
 * Features:
 * - Animated typing dots with TweakCN NEONPRO theme
 * - Healthcare professional identification (CFM numbers)
 * - AI typing indicators with healthcare context
 * - Accessibility support with ARIA labels
 * - Brazilian Portuguese localization
 * - Emergency conversation styling
 * - LGPD-compliant user identification
 */

export interface TypingUser {
  id: string
  name: string
  type: SenderType
  avatar_url?: string
  healthcare_context?: HealthcareContext
  is_emergency?: boolean
  started_at: Date
}

export interface TypingIndicatorProps {
  /** List of users currently typing */
  typingUsers: TypingUser[]
  /** Current healthcare context */
  healthcareContext?: HealthcareContext
  /** Whether this is an emergency conversation */
  isEmergency?: boolean
  /** Maximum number of typing users to display */
  maxDisplayUsers?: number
  /** Auto-hide timeout in milliseconds */
  autoHideTimeout?: number
  /** Custom CSS classes */
  className?: string
  /** Accessibility label */
  ariaLabel?: string
}

export function TypingIndicator({
  typingUsers,
  healthcareContext,
  isEmergency = false,
  maxDisplayUsers = 3,
  autoHideTimeout = 10_000,
  className,
  ariaLabel,
}: TypingIndicatorProps,) {
  const [visibleUsers, setVisibleUsers,] = useState<TypingUser[]>([],)

  // Filter and manage visible typing users
  useEffect(() => {
    const now = new Date()
    const activeUsers = typingUsers.filter((user,) => {
      const timeSinceStarted = now.getTime() - user.started_at.getTime()
      return timeSinceStarted < autoHideTimeout
    },)

    setVisibleUsers(activeUsers.slice(0, maxDisplayUsers,),)
  }, [typingUsers, maxDisplayUsers, autoHideTimeout,],)

  // Memoized typing indicator content
  const typingContent = useMemo(() => {
    if (visibleUsers.length === 0) {
      return null
    }

    const hasMoreUsers = typingUsers.length > maxDisplayUsers
    const extraCount = typingUsers.length - maxDisplayUsers

    return (
      <div
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg',
          'bg-white/50 dark:bg-gray-800/50',
          'border border-blue-200 dark:border-blue-800',
          'transition-all duration-300 ease-in-out',
          isEmergency && [
            'bg-red-50/80 dark:bg-red-950/50',
            'border-red-300 dark:border-red-700',
            'animate-pulse',
          ],
          className,
        )}
      >
        {/* User Avatars */}
        <div className="flex -space-x-2">
          {visibleUsers.map((user, index,) => (
            <div key={user.id} className="relative">
              <Avatar
                className={cn(
                  'w-8 h-8 border-2 border-white dark:border-gray-900',
                  'transition-transform duration-200 hover:scale-110',
                  index === 0 && 'z-30',
                  index === 1 && 'z-20',
                  index === 2 && 'z-10',
                )}
              >
                <AvatarImage
                  src={user.avatar_url}
                  alt={`${user.name} avatar`}
                />
                <AvatarFallback
                  className={cn(
                    'text-xs font-medium',
                    user.type === 'healthcare_professional'
                      && 'bg-blue-100 text-blue-700 dark:bg-blue-900/50',
                    user.type === 'ai_assistant'
                      && 'bg-purple-100 text-purple-700 dark:bg-purple-900/50',
                    user.type === 'patient'
                      && 'bg-green-100 text-green-700 dark:bg-green-900/50',
                    isEmergency && 'bg-red-100 text-red-700 dark:bg-red-900/50',
                  )}
                >
                  {user.type === 'ai_assistant'
                    ? <Bot className="w-4 h-4" />
                    : user.type === 'healthcare_professional'
                    ? <Stethoscope className="w-4 h-4" />
                    : <User className="w-4 h-4" />}
                </AvatarFallback>
              </Avatar>

              {/* Professional Badge */}
              {user.healthcare_context?.professional_info && (
                <Badge
                  variant="secondary"
                  className="absolute -top-1 -right-1 text-xs px-1 py-0 h-4"
                >
                  {user.healthcare_context.professional_info.cfm_number
                    ? `CFM ${user.healthcare_context.professional_info.cfm_number}`
                    : user.healthcare_context.professional_info.specialty
                      ?.slice(0, 3,)
                      .toUpperCase()}
                </Badge>
              )}

              {/* Emergency Indicator */}
              {isEmergency && (
                <div className="absolute -top-1 -left-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
              )}
            </div>
          ))}

          {/* Extra Users Count */}
          {hasMoreUsers && (
            <div
              className={cn(
                'flex items-center justify-center w-8 h-8 rounded-full border-2',
                'bg-gray-100 dark:bg-gray-700 border-white dark:border-gray-900',
                'text-xs font-medium text-gray-600 dark:text-gray-300',
              )}
            >
              +{extraCount}
            </div>
          )}
        </div>

        {/* Typing Text and Animation */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'text-sm font-medium truncate',
                isEmergency
                  ? 'text-red-700 dark:text-red-300'
                  : 'text-gray-700 dark:text-gray-300',
              )}
            >
              {getTypingText(visibleUsers, isEmergency,)}
            </span>

            {/* Animated Typing Dots */}
            <div className="flex gap-1" aria-hidden="true">
              {[0, 1, 2,].map((dot,) => (
                <div
                  key={dot}
                  className={cn(
                    'w-2 h-2 rounded-full animate-bounce',
                    isEmergency ? 'bg-red-500' : 'bg-blue-500',
                  )}
                  style={{
                    animationDelay: `${dot * 0.15}s`,
                    animationDuration: '1.4s',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Healthcare Context */}
          {healthcareContext && (
            <div className="flex items-center gap-2 mt-1">
              {healthcareContext.consultation_type && (
                <Badge variant="outline" className="text-xs">
                  {healthcareContext.consultation_type === 'emergency'
                    ? 'Emergência'
                    : healthcareContext.consultation_type === 'consultation'
                    ? 'Consulta'
                    : healthcareContext.consultation_type === 'followup'
                    ? 'Acompanhamento'
                    : 'Teleconsulta'}
                </Badge>
              )}

              {healthcareContext.medical_specialty && (
                <Badge variant="secondary" className="text-xs">
                  {healthcareContext.medical_specialty}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* AI Processing Indicator */}
        {visibleUsers.some((user,) => user.type === 'ai_assistant') && (
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'w-2 h-2 rounded-full animate-pulse',
                'bg-purple-500',
              )}
            />
            <span className="text-xs text-purple-600 dark:text-purple-400">
              IA processando
            </span>
          </div>
        )}
      </div>
    )
  }, [
    visibleUsers,
    typingUsers.length,
    maxDisplayUsers,
    isEmergency,
    healthcareContext,
    className,
  ],)

  // Don't render if no visible users
  if (visibleUsers.length === 0) {
    return null
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={ariaLabel || getAccessibilityLabel(visibleUsers, isEmergency,)}
      className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
    >
      {typingContent}
    </div>
  )
}

/**
 * Generate typing text based on users and context
 */
function getTypingText(users: TypingUser[], isEmergency: boolean,): string {
  if (users.length === 0) {
    return ''
  }

  const emergencyPrefix = isEmergency ? '[EMERGÊNCIA] ' : ''

  if (users.length === 1) {
    const user = users[0]
    if (user.type === 'ai_assistant') {
      return `${emergencyPrefix}IA está processando...`
    }

    const name = user.healthcare_context?.professional_info
      ? `Dr(a). ${user.name}`
      : user.name

    return `${emergencyPrefix}${name} está digitando...`
  }

  if (users.length === 2) {
    return `${emergencyPrefix}${users[0].name} e ${users[1].name} estão digitando...`
  }

  return `${emergencyPrefix}${users.length} pessoas estão digitando...`
}

/**
 * Generate accessibility label
 */
function getAccessibilityLabel(
  users: TypingUser[],
  isEmergency: boolean,
): string {
  const emergencyPrefix = isEmergency ? 'Emergência: ' : ''

  if (users.length === 1) {
    const user = users[0]
    const role = user.type === 'healthcare_professional'
      ? 'profissional de saúde'
      : user.type === 'ai_assistant'
      ? 'assistente de IA'
      : 'paciente'

    return `${emergencyPrefix}${user.name}, ${role}, está digitando uma mensagem`
  }

  return `${emergencyPrefix}${users.length} pessoas estão digitando mensagens`
}

/**
 * Hook for managing typing status
 */
export function useTypingIndicator() {
  const [typingUsers, setTypingUsers,] = useState<TypingUser[]>([],)

  const addTypingUser = (user: TypingUser,) => {
    setTypingUsers((prev,) => {
      const exists = prev.find((u,) => u.id === user.id)
      if (exists) {
        return prev.map((u,) => u.id === user.id ? { ...user, started_at: new Date(), } : u)
      }
      return [...prev, { ...user, started_at: new Date(), },]
    },)
  }

  const removeTypingUser = (userId: string,) => {
    setTypingUsers((prev,) => prev.filter((u,) => u.id !== userId))
  }

  const clearTypingUsers = () => {
    setTypingUsers([],)
  }

  return {
    typingUsers,
    addTypingUser,
    removeTypingUser,
    clearTypingUsers,
  }
}

export default TypingIndicator

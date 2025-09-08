/**
 * ChatHeader - Chat Conversation Header Component
 * Displays conversation info, participant status, and controls
 * TweakCN NEONPRO theme integration with healthcare-specific features
 */

'use client'

import { cn, } from '@/lib/utils'
import type { ChatConversation, PresenceStatus, } from '@/types/chat'
// import { ConversationType, SenderType } from "@/types/chat"; // Unused imports
import React, { useCallback, useState, } from 'react'

// Icons (would be imported from lucide-react or similar)
const MenuIcon = ({ className, }: { className?: string },) => (
  <svg
    className={cn('w-4 h-4', className,)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <line
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      x1={3}
      y1={6}
      x2={21}
      y2={6}
    />
    <line
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      x1={3}
      y1={12}
      x2={21}
      y2={12}
    />
    <line
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      x1={3}
      y1={18}
      x2={21}
      y2={18}
    />
  </svg>
)

const PhoneIcon = ({ className, }: { className?: string },) => (
  <svg
    className={cn('w-4 h-4', className,)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
    />
  </svg>
)

const VideoIcon = ({ className, }: { className?: string },) => (
  <svg
    className={cn('w-4 h-4', className,)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <polygon
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      points="23,7 16,12 23,17 23,7"
    />
    <rect
      x={1}
      y={5}
      width={15}
      height={14}
      rx={2}
      ry={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
)

const InfoIcon = ({ className, }: { className?: string },) => (
  <svg
    className={cn('w-4 h-4', className,)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <circle
      cx={12}
      cy={12}
      r={10}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
    <line
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      x1={12}
      y1={16}
      x2={12}
      y2={12}
    />
    <line
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      x1={12}
      y1={8}
      x2={12.01}
      y2={8}
    />
  </svg>
)

const SettingsIcon = ({ className, }: { className?: string },) => (
  <svg
    className={cn('w-4 h-4', className,)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <circle
      cx={12}
      cy={12}
      r={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
    />
  </svg>
)

const BotIcon = ({ className, }: { className?: string },) => (
  <svg
    className={cn('w-4 h-4', className,)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <rect
      x={3}
      y={11}
      width={18}
      height={10}
      rx={2}
      ry={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
    <circle
      cx={12}
      cy={5}
      r={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="m12,7v4"
    />
  </svg>
)

const StethoscopeIcon = ({ className, }: { className?: string },) => (
  <svg
    className={cn('w-4 h-4', className,)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 2a2 2 0 0 0-2 2v6.5a.5.5 0 0 1-.5.5.5.5 0 0 1-.5-.5V8a2 2 0 0 0-2-2 2 2 0 0 0-2 2v2.5a.5.5 0 0 1-.5.5.5.5 0 0 1-.5-.5V8a4 4 0 0 1 8 0v13a2 2 0 0 1-4 0v-4a2 2 0 0 1 2-2 2 2 0 0 1 2 2"
    />
  </svg>
)

const ShieldCheckIcon = ({ className, }: { className?: string },) => (
  <svg
    className={cn('w-4 h-4', className,)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)

export interface ChatHeaderProps {
  conversation: ChatConversation
  presenceStatus: Record<string, PresenceStatus>
  onToggleSidebar?: () => void
  sidebarCollapsed?: boolean
  emergencyMode?: boolean
  onCall?: () => void
  onVideoCall?: () => void
  onInfo?: () => void
  onSettings?: () => void
  className?: string
}

export default function ChatHeader({
  conversation,
  presenceStatus,
  onToggleSidebar,
  sidebarCollapsed = false,
  emergencyMode = false,
  onCall,
  onVideoCall,
  onInfo,
  onSettings,
  className,
}: ChatHeaderProps,) {
  const [showDropdown, setShowDropdown,] = useState(false,)

  // Get conversation type info
  const getConversationInfo = useCallback(() => {
    switch (conversation.type) {
      case 'ai_assistant':
        return {
          title: conversation.title || 'Assistente IA NeonPro',
          subtitle: 'Assistente Inteligente de Saúde',
          icon: BotIcon,
          color: 'blue',
          isOnline: true,
        }
      case 'patient_support':
        return {
          title: conversation.title || 'Suporte ao Paciente',
          subtitle: 'Atendimento especializado',
          icon: StethoscopeIcon,
          color: 'green',
          isOnline: true,
        }
      case 'pre_consultation':
        return {
          title: conversation.title || 'Pré-Consulta',
          subtitle: 'Preparação para consulta médica',
          icon: StethoscopeIcon,
          color: 'teal',
          isOnline: true,
        }
      case 'post_procedure':
        return {
          title: conversation.title || 'Pós-Procedimento',
          subtitle: 'Acompanhamento pós-operatório',
          icon: StethoscopeIcon,
          color: 'purple',
          isOnline: true,
        }
      case 'emergency':
        return {
          title: conversation.title || 'Atendimento de Emergência',
          subtitle: 'PROTOCOLO DE EMERGÊNCIA ATIVO',
          icon: StethoscopeIcon,
          color: 'red',
          isOnline: true,
        }
      case 'staff_coordination':
        return {
          title: conversation.title || 'Coordenação Médica',
          subtitle: 'Comunicação entre profissionais',
          icon: StethoscopeIcon,
          color: 'indigo',
          isOnline: true,
        }
      default:
        return {
          title: conversation.title || 'Chat NeonPro',
          subtitle: 'Conversa em saúde',
          icon: StethoscopeIcon,
          color: 'gray',
          isOnline: false,
        }
    }
  }, [conversation.type, conversation.title,],)

  const conversationInfo = getConversationInfo()

  // Get active participants (excluding current user)
  const activeParticipants = conversation.participants.filter(
    (p,) =>
      presenceStatus[p.user_id] === 'online'
      || presenceStatus[p.user_id] === 'busy'
      || p.user_type === 'ai_assistant',
  )

  // Get healthcare context info
  const getHealthcareContextInfo = useCallback(() => {
    if (!conversation.healthcare_context) {
      return null
    }

    const context = conversation.healthcare_context
    const specialtyMap: Record<string, string> = {
      dermatologia: 'Dermatologia',
      cirurgia_plastica: 'Cirurgia Plástica',
      medicina_estetica: 'Medicina Estética',
      dermatologia_estetica: 'Dermatologia Estética',
      cirurgia_geral: 'Cirurgia Geral',
      anestesiologia: 'Anestesiologia',
      clinica_medica: 'Clínica Médica',
      emergencia: 'Emergência',
    }

    return {
      specialty: context.medical_specialty
        ? specialtyMap[context.medical_specialty]
        : null,
      department: context.department,
      clinic: context.clinic_id,
      appointment: context.appointment_id ? 'Consulta agendada' : null,
    }
  }, [conversation.healthcare_context,],)

  const healthcareContext = getHealthcareContextInfo()

  // Handle dropdown actions
  const handleAction = useCallback(
    (action: string,) => {
      setShowDropdown(false,)

      switch (action) {
        case 'call':
          onCall?.()
          break
        case 'video':
          onVideoCall?.()
          break
        case 'info':
          onInfo?.()
          break
        case 'settings':
          onSettings?.()
          break
        default:
          break
      }
    },
    [onCall, onVideoCall, onInfo, onSettings,],
  )

  return (
    <div
      className={cn(
        'flex items-center justify-between px-4 py-3',
        'bg-white dark:bg-gray-900',
        emergencyMode
          && 'bg-red-50 dark:bg-red-950 border-b-2 border-red-200 dark:border-red-800',
        className,
      )}
    >
      {/* Left Section - Navigation & Conversation Info */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Sidebar Toggle (Mobile) */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className={cn(
              'p-2 rounded-lg transition-colors',
              'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
              'hover:bg-gray-100 dark:hover:bg-gray-800',
              'md:hidden', // Hide on desktop
            )}
          >
            <MenuIcon />
          </button>
        )}

        {/* Conversation Icon & Status */}
        <div className="relative flex-shrink-0">
          <div
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center',
              conversationInfo.color === 'blue'
                && 'bg-blue-100 dark:bg-blue-900',
              conversationInfo.color === 'green'
                && 'bg-green-100 dark:bg-green-900',
              conversationInfo.color === 'teal'
                && 'bg-teal-100 dark:bg-teal-900',
              conversationInfo.color === 'purple'
                && 'bg-purple-100 dark:bg-purple-900',
              conversationInfo.color === 'red' && 'bg-red-100 dark:bg-red-900',
              conversationInfo.color === 'indigo'
                && 'bg-indigo-100 dark:bg-indigo-900',
              conversationInfo.color === 'gray'
                && 'bg-gray-100 dark:bg-gray-800',
              emergencyMode && 'animate-pulse',
            )}
          >
            {React.createElement(conversationInfo.icon, {
              className: cn(
                'w-5 h-5',
                conversationInfo.color === 'blue'
                  && 'text-blue-600 dark:text-blue-400',
                conversationInfo.color === 'green'
                  && 'text-green-600 dark:text-green-400',
                conversationInfo.color === 'teal'
                  && 'text-teal-600 dark:text-teal-400',
                conversationInfo.color === 'purple'
                  && 'text-purple-600 dark:text-purple-400',
                conversationInfo.color === 'red'
                  && 'text-red-600 dark:text-red-400',
                conversationInfo.color === 'indigo'
                  && 'text-indigo-600 dark:text-indigo-400',
                conversationInfo.color === 'gray'
                  && 'text-gray-600 dark:text-gray-400',
              ),
            },)}
          </div>

          {/* Online Status Indicator */}
          {conversationInfo.isOnline && (
            <div
              className={cn(
                'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900',
                emergencyMode ? 'bg-red-500' : 'bg-green-500',
              )}
            />
          )}
        </div>

        {/* Conversation Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2
              className={cn(
                'font-semibold text-gray-900 dark:text-gray-100 truncate',
                emergencyMode && 'text-red-900 dark:text-red-100',
              )}
            >
              {conversationInfo.title}
            </h2>

            {/* LGPD Compliance Indicator */}
            {conversation.lgpd_consent_level === 'full' && (
              <ShieldCheckIcon className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
            )}

            {/* AI Enabled Indicator */}
            {conversation.ai_enabled
              && conversation.type !== 'ai_assistant' && (
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded-full">
                <BotIcon className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                <span className="text-xs text-blue-700 dark:text-blue-300">
                  IA
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span
              className={cn(
                emergencyMode && 'text-red-700 dark:text-red-300 font-medium',
              )}
            >
              {conversationInfo.subtitle}
            </span>

            {/* Healthcare Context */}
            {healthcareContext?.specialty && (
              <>
                <span>•</span>
                <span className="text-green-600 dark:text-green-400">
                  {healthcareContext.specialty}
                </span>
              </>
            )}

            {/* Participant Count */}
            {activeParticipants.length > 0 && (
              <>
                <span>•</span>
                <span>
                  {activeParticipants.length === 1
                    ? '1 participante'
                    : `${activeParticipants.length} participantes`}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Section - Action Buttons */}
      <div className="flex items-center gap-1">
        {/* Call Button */}
        {onCall && conversation.type !== 'ai_assistant' && (
          <button
            onClick={() => handleAction('call',)}
            className={cn(
              'p-2 rounded-lg transition-colors',
              'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
              'hover:bg-gray-100 dark:hover:bg-gray-800',
              emergencyMode
                && 'text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900',
            )}
            title="Fazer chamada"
          >
            <PhoneIcon />
          </button>
        )}

        {/* Video Call Button */}
        {onVideoCall && conversation.type !== 'ai_assistant' && (
          <button
            onClick={() => handleAction('video',)}
            className={cn(
              'p-2 rounded-lg transition-colors',
              'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
              'hover:bg-gray-100 dark:hover:bg-gray-800',
              emergencyMode
                && 'text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900',
            )}
            title="Videochamada"
          >
            <VideoIcon />
          </button>
        )}

        {/* Info Button */}
        <button
          onClick={() => handleAction('info',)}
          className={cn(
            'p-2 rounded-lg transition-colors',
            'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
            'hover:bg-gray-100 dark:hover:bg-gray-800',
            emergencyMode
              && 'text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900',
          )}
          title="Informações da conversa"
        >
          <InfoIcon />
        </button>

        {/* Settings Button */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown,)}
            className={cn(
              'p-2 rounded-lg transition-colors',
              'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
              'hover:bg-gray-100 dark:hover:bg-gray-800',
              emergencyMode
                && 'text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900',
            )}
            title="Configurações"
          >
            <SettingsIcon />
          </button>

          {/* Settings Dropdown */}
          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
              <div className="py-1">
                <button
                  onClick={() => handleAction('info',)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Informações da conversa
                </button>
                <button
                  onClick={() => handleAction('settings',)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Configurações de privacidade
                </button>
                {conversation.type !== 'ai_assistant' && (
                  <button
                    onClick={() => handleAction('call',)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Iniciar chamada
                  </button>
                )}
                <div className="border-t border-gray-200 dark:border-gray-600 my-1" />
                <button
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={() => setShowDropdown(false,)}
                >
                  Encerrar conversa
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false,)}
        />
      )}
    </div>
  )
}

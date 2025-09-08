/**
 * ChatSidebar - Chat Conversations Sidebar
 * Lists conversations with search, filters, and quick actions
 * TweakCN NEONPRO theme integration with healthcare-specific features
 */

'use client'

import { cn, } from '@/lib/utils'
import type { ChatConversation, ConversationType, PresenceStatus, } from '@/types/chat'
// import { SenderType } from "@/types/chat"; // Unused import
import React, { useCallback, useMemo, useState, } from 'react'

// Icons (would be imported from lucide-react or similar)
const SearchIcon = ({ className, }: { className?: string },) => (
  <svg
    className={cn('w-4 h-4', className,)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <circle
      cx={11}
      cy={11}
      r={8}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="m21 21-4.35-4.35"
    />
  </svg>
)

const PlusIcon = ({ className, }: { className?: string },) => (
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
      x1={12}
      y1={5}
      x2={12}
      y2={19}
    />
    <line
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      x1={5}
      y1={12}
      x2={19}
      y2={12}
    />
  </svg>
)

const FilterIcon = ({ className, }: { className?: string },) => (
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
      points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3"
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

const UserIcon = ({ className, }: { className?: string },) => (
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
      d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
    />
    <circle
      cx={12}
      cy={7}
      r={4}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
)

const AlertTriangleIcon = ({ className, }: { className?: string },) => (
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
      d="m21.73,18-8-14a2,2,0,0,0-3.48,0l-8,14A2,2,0,0,0,4,21H20A2,2,0,0,0,21.73,18Z"
    />
    <line
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      x1={12}
      y1={9}
      x2={12}
      y2={13}
    />
    <line
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      x1={12}
      y1={17}
      x2={12.01}
      y2={17}
    />
  </svg>
)

const ChevronLeftIcon = ({ className, }: { className?: string },) => (
  <svg
    className={cn('w-4 h-4', className,)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <polyline
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      points="15,18 9,12 15,6"
    />
  </svg>
)

const ChevronRightIcon = ({ className, }: { className?: string },) => (
  <svg
    className={cn('w-4 h-4', className,)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <polyline
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      points="9,18 15,12 9,6"
    />
  </svg>
)

export interface ChatSidebarProps {
  conversations: ChatConversation[]
  activeConversation: ChatConversation | null
  onConversationSelect: (conversation: ChatConversation,) => void
  collapsed?: boolean
  onToggle?: () => void
  presenceStatus?: Record<string, PresenceStatus>
  emergencyMode?: boolean
  onNewConversation?: (type: ConversationType,) => void
  className?: string
}

type FilterType =
  | 'all'
  | 'ai_assistant'
  | 'patient_support'
  | 'emergency'
  | 'unread'

interface ConversationItemProps {
  conversation: ChatConversation
  isActive: boolean
  onClick: () => void
  collapsed: boolean
  presenceStatus?: Record<string, PresenceStatus>
  emergencyMode?: boolean
}

function ConversationItem({
  conversation,
  isActive,
  onClick,
  collapsed,
  presenceStatus,
  emergencyMode,
}: ConversationItemProps,) {
  const getConversationIcon = useCallback(() => {
    switch (conversation.type) {
      case 'ai_assistant':
        return BotIcon
      case 'emergency':
        return AlertTriangleIcon
      case 'patient_support':
      case 'pre_consultation':
      case 'post_procedure':
      case 'staff_coordination':
        return StethoscopeIcon
      default:
        return UserIcon
    }
  }, [conversation.type,],)

  const getConversationColor = useCallback(() => {
    switch (conversation.type) {
      case 'ai_assistant':
        return 'blue'
      case 'emergency':
        return 'red'
      case 'patient_support':
        return 'green'
      case 'pre_consultation':
        return 'teal'
      case 'post_procedure':
        return 'purple'
      case 'staff_coordination':
        return 'indigo'
      default:
        return 'gray'
    }
  }, [conversation.type,],)

  const formatTime = useCallback((timestamp: string,) => {
    const date = new Date(timestamp,)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60_000,)
    const hours = Math.floor(minutes / 60,)
    const days = Math.floor(hours / 24,)

    if (minutes < 1) {
      return 'agora'
    }
    if (minutes < 60) {
      return `${minutes}m`
    }
    if (hours < 24) {
      return `${hours}h`
    }
    if (days === 1) {
      return 'ontem'
    }
    if (days < 7) {
      return `${days}d`
    }
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    },)
  }, [],)

  const IconComponent = getConversationIcon()
  const color = getConversationColor()
  const isEmergency = conversation.type === 'emergency'
  const hasUnreadMessages = false // TODO: Implement unread message logic

  // Get online participants
  const onlineParticipants = conversation.participants.filter(
    (p,) =>
      presenceStatus?.[p.user_id] === 'online'
      || p.user_type === 'ai_assistant',
  ).length

  if (collapsed) {
    return (
      <button
        onClick={onClick}
        className={cn(
          'w-12 h-12 flex items-center justify-center rounded-lg transition-all relative group',
          isActive
            ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
            : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400',
          isEmergency && 'animate-pulse',
          emergencyMode
            && isActive
            && 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400',
        )}
        title={conversation.title || conversation.type}
      >
        <IconComponent className="w-5 h-5" />

        {hasUnreadMessages && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
        )}

        {onlineParticipants > 0 && !hasUnreadMessages && (
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white dark:border-gray-900" />
        )}
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full p-3 rounded-lg transition-all text-left group relative',
        isActive
          ? 'bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800'
          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50',
        isEmergency && 'animate-pulse',
        emergencyMode
          && isActive
          && 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800',
      )}
    >
      <div className="flex items-start gap-3">
        {/* Conversation Icon */}
        <div
          className={cn(
            'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center relative',
            color === 'blue' && 'bg-blue-100 dark:bg-blue-900',
            color === 'green' && 'bg-green-100 dark:bg-green-900',
            color === 'teal' && 'bg-teal-100 dark:bg-teal-900',
            color === 'purple' && 'bg-purple-100 dark:bg-purple-900',
            color === 'red' && 'bg-red-100 dark:bg-red-900',
            color === 'indigo' && 'bg-indigo-100 dark:bg-indigo-900',
            color === 'gray' && 'bg-gray-100 dark:bg-gray-800',
          )}
        >
          <IconComponent
            className={cn(
              'w-5 h-5',
              color === 'blue' && 'text-blue-600 dark:text-blue-400',
              color === 'green' && 'text-green-600 dark:text-green-400',
              color === 'teal' && 'text-teal-600 dark:text-teal-400',
              color === 'purple' && 'text-purple-600 dark:text-purple-400',
              color === 'red' && 'text-red-600 dark:text-red-400',
              color === 'indigo' && 'text-indigo-600 dark:text-indigo-400',
              color === 'gray' && 'text-gray-600 dark:text-gray-400',
            )}
          />

          {/* Online Indicator */}
          {onlineParticipants > 0 && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
          )}
        </div>

        {/* Conversation Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3
              className={cn(
                'font-medium truncate',
                isActive
                  ? 'text-green-900 dark:text-green-100'
                  : 'text-gray-900 dark:text-gray-100',
                emergencyMode && isActive && 'text-red-900 dark:text-red-100',
              )}
            >
              {conversation.title || `Chat ${conversation.type}`}
            </h3>

            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Emergency Indicator */}
              {isEmergency && <AlertTriangleIcon className="w-3 h-3 text-red-500" />}

              {/* AI Indicator */}
              {conversation.ai_enabled
                && conversation.type !== 'ai_assistant' && (
                <BotIcon className="w-3 h-3 text-blue-500" />
              )}

              {/* Unread Count */}
              {hasUnreadMessages && <div className="w-2 h-2 bg-red-500 rounded-full" />}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p
              className={cn(
                'text-sm truncate flex-1 mr-2',
                isActive
                  ? 'text-green-700 dark:text-green-300'
                  : 'text-gray-500 dark:text-gray-400',
              )}
            >
              {conversation.last_message?.content.text || 'Sem mensagens'}
            </p>

            <span
              className={cn(
                'text-xs flex-shrink-0',
                isActive
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-gray-400 dark:text-gray-500',
              )}
            >
              {formatTime(conversation.last_activity,)}
            </span>
          </div>

          {/* Healthcare Context */}
          {conversation.healthcare_context?.medical_specialty && (
            <div className="mt-1">
              <span className="inline-block text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full">
                {conversation.healthcare_context.medical_specialty}
              </span>
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

export default function ChatSidebar({
  conversations,
  activeConversation,
  onConversationSelect,
  collapsed = false,
  onToggle,
  presenceStatus = {},
  emergencyMode = false,
  onNewConversation,
  className,
}: ChatSidebarProps,) {
  const [searchQuery, setSearchQuery,] = useState('',)
  const [activeFilter, setActiveFilter,] = useState<FilterType>('all',)
  const [showFilters, setShowFilters,] = useState(false,)

  // Filter conversations based on search and filter type
  const filteredConversations = useMemo(() => {
    let filtered = conversations

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (conv,) =>
          conv.title?.toLowerCase().includes(query,)
          || conv.last_message?.content.text?.toLowerCase().includes(query,)
          || conv.participants.some((p,) => p.display_name.toLowerCase().includes(query,)),
      )
    }

    // Apply type filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter((conv,) => {
        switch (activeFilter) {
          case 'ai_assistant':
            return conv.type === 'ai_assistant'
          case 'patient_support':
            return conv.type === 'patient_support'
          case 'emergency':
            return conv.type === 'emergency'
          case 'unread':
            // TODO: Implement unread message logic
            return false
          default:
            return true
        }
      },)
    }

    // Sort by last activity (most recent first)
    return filtered.sort(
      (a, b,) =>
        new Date(b.last_activity,).getTime()
        - new Date(a.last_activity,).getTime(),
    )
  }, [conversations, searchQuery, activeFilter,],)

  // Handle new conversation
  const handleNewConversation = useCallback(
    (type: ConversationType,) => {
      onNewConversation?.(type,)
    },
    [onNewConversation,],
  )

  const filterOptions = [
    { key: 'all', label: 'Todas', count: conversations.length, },
    {
      key: 'ai_assistant',
      label: 'Assistente IA',
      count: conversations.filter((c,) => c.type === 'ai_assistant').length,
    },
    {
      key: 'patient_support',
      label: 'Suporte',
      count: conversations.filter((c,) => c.type === 'patient_support').length,
    },
    {
      key: 'emergency',
      label: 'Emergência',
      count: conversations.filter((c,) => c.type === 'emergency').length,
    },
    { key: 'unread', label: 'Não lidas', count: 0, }, // TODO: Implement unread count
  ] as const

  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full',
        'transition-all duration-300',
        collapsed ? 'w-16' : 'w-80',
        emergencyMode && 'border-red-200 dark:border-red-800',
        className,
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <h1
              className={cn(
                'text-lg font-semibold',
                emergencyMode
                  ? 'text-red-900 dark:text-red-100'
                  : 'text-gray-900 dark:text-gray-100',
              )}
            >
              Conversas
            </h1>
          )}

          {/* Toggle Button */}
          {onToggle && (
            <button
              onClick={onToggle}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </button>
          )}
        </div>

        {/* Search Bar */}
        {!collapsed && (
          <div className="mt-3 relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e,) => setSearchQuery(e.target.value,)}
              placeholder="Buscar conversas..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 text-sm"
            />
          </div>
        )}
      </div>

      {/* Filters */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filtros
            </span>
            <button
              onClick={() => setShowFilters(!showFilters,)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
            >
              <FilterIcon className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {showFilters && (
            <div className="space-y-1">
              {filterOptions.map((option,) => (
                <button
                  key={option.key}
                  onClick={() => setActiveFilter(option.key as FilterType,)}
                  className={cn(
                    'w-full text-left px-2 py-1 rounded text-sm transition-colors',
                    activeFilter === option.key
                      ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400',
                  )}
                >
                  <span>{option.label}</span>
                  {option.count > 0 && (
                    <span
                      className={cn(
                        'ml-2 px-1.5 py-0.5 text-xs rounded-full',
                        activeFilter === option.key
                          ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
                      )}
                    >
                      {option.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        <div
          className={cn(
            'p-2 space-y-1',
            collapsed && 'flex flex-col items-center',
          )}
        >
          {filteredConversations.length === 0
            ? !collapsed && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <div className="mb-2">💬</div>
                <p className="text-sm">
                  {searchQuery
                    ? 'Nenhuma conversa encontrada'
                    : 'Nenhuma conversa ainda'}
                </p>
                {onNewConversation && (
                  <button
                    onClick={() => handleNewConversation('ai_assistant',)}
                    className="mt-3 text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                  >
                    Iniciar chat com IA
                  </button>
                )}
              </div>
            )
            : filteredConversations.map((conversation,) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isActive={activeConversation?.id === conversation.id}
                onClick={() => onConversationSelect(conversation,)}
                collapsed={collapsed}
                presenceStatus={presenceStatus}
                emergencyMode={emergencyMode}
              />
            ))}
        </div>
      </div>

      {/* New Conversation Button */}
      {onNewConversation && (
        <div
          className={cn(
            'p-4 border-t border-gray-200 dark:border-gray-700',
            collapsed && 'p-2',
          )}
        >
          {collapsed
            ? (
              <button
                onClick={() => handleNewConversation('ai_assistant',)}
                className="w-12 h-12 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center transition-colors"
                title="Nova conversa"
              >
                <PlusIcon />
              </button>
            )
            : (
              <button
                onClick={() => handleNewConversation('ai_assistant',)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
              >
                <PlusIcon />
                Nova Conversa
              </button>
            )}
        </div>
      )}
    </div>
  )
}

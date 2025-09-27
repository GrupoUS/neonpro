/**
 * NeonPro Chat Interface Component
 *
 * Main chat interface with healthcare-specific design and multi-agent support
 * Features:
 * - Multi-agent coordination sidebar
 * - Portuguese healthcare context
 * - LGPD-compliant message handling
 * - WCAG 2.1 AA+ accessible design
 * - Mobile-responsive layout
 */

import { useCopilotChat } from '@copilotkit/react-core'
import { CopilotChat } from '@copilotkit/react-ui'
import {
  Accessibility,
  Calendar,
  DollarSign,
  Download,
  MessageSquare,
  MoreVertical,
  Send,
  Shield,
  Smartphone,
  Trash2,
  Users,
} from 'lucide-react'
import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Alert, AlertDescription } from '../ui/alert.js'
import { Badge } from '../ui/badge.js'
import { Button } from '../ui/button.js'
import { AccessibilityButton } from '../ui/accessibility-button.js'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.js'
import {
  AccessibilitySettingsPanel,
  AccessibleChatMessage,
  AccessibleErrorBoundary,
  AccessibleLoading,
  ScreenReaderAnnouncer,
  SkipLinks,
} from './NeonProAccessibility.js'
import { useNeonProChat } from './NeonProChatProvider.js'
import './accessibility.css'

// Types
interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  metadata?: Record<string, any>
}

interface ChatInputProps {
  onSendMessage: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = 'Digite sua mensagem...',
}) => {
  const [message, setMessage] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const submitButtonRef = useRef<HTMLButtonElement>(null)

  // Generate unique IDs for accessibility
  const inputId = React.useId()
  const helpId = `${inputId}-help`

  // Enhanced submit handler with screen reader announcements
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      // Announce message sending
      const announcement = document.createElement('div')
      announcement.setAttribute('role', 'status')
      announcement.setAttribute('aria-live', 'polite')
      announcement.className = 'sr-only'
      announcement.textContent = 'Enviando mensagem...'
      document.body.appendChild(announcement)

      onSendMessage(message.trim())
      setMessage('')

      // Focus back to input after sending
      setTimeout(() => {
        inputRef.current?.focus()
        document.body.removeChild(announcement)
      }, 100)
    }
  }, [message, disabled, onSendMessage])

  // Enhanced keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent)
    }

    // Alt+1 for quick navigation
    if (e.altKey && e.key === '1') {
      e.preventDefault()
      inputRef.current?.focus()
    }

    // Escape to clear input
    if (e.key === 'Escape' && message.trim()) {
      e.preventDefault()
      setMessage('')
      inputRef.current?.focus()

      // Announce clear action
      const announcement = document.createElement('div')
      announcement.setAttribute('role', 'status')
      announcement.setAttribute('aria-live', 'polite')
      announcement.className = 'sr-only'
      announcement.textContent = 'Mensagem limpa'
      document.body.appendChild(announcement)

      setTimeout(() => {
        document.body.removeChild(announcement)
      }, 1000)
    }
  }, [message, handleSubmit])

  return (
    <form
      onSubmit={handleSubmit}
      className='flex gap-2 p-4 border-t bg-gray-50'
      role='form'
      aria-label='Enviar mensagem de chat'
      onKeyDown={handleKeyDown}
    >
      <input
        ref={inputRef}
        id={inputId}
        type='text'
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className='flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 touch-target'
        aria-label='Digite sua mensagem'
        aria-describedby={helpId}
        autoComplete='off'
        enterKeyHint='send'
        aria-disabled={disabled}
        maxLength={2000}
      />
      <AccessibilityButton
        ref={submitButtonRef}
        type='submit'
        disabled={disabled || !message.trim()}
        healthcareContext='administrative'
        size='mobile-lg'
        className='px-4 py-3'
        ariaLabel='Enviar mensagem'
        ariaDescribedBy={helpId}
        shortcutKey='Enter'
        announcement='Enviando mensagem'
      >
        <Send className='h-4 w-4' />
        <span className='sr-only'>Enviar</span>
      </AccessibilityButton>
      <div id={helpId} className='sr-only'>
        Pressione Enter para enviar, Escape para limpar, Alt+1 para focar no campo. Máximo 2000 caracteres.
      </div>
    </form>
  )
}

const MessageBubble: React.FC<{ message: Message; isUser?: boolean }> = ({ message, isUser }) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <AccessibleChatMessage
      message={{
        id: message.id,
        content: message.content,
        role: message.role,
        timestamp: message.timestamp,
        metadata: {
          ...message.metadata,
          agentType: message.metadata?.agentType || 'Assistente',
        },
      }}
      isUser={isUser}
      onAction={action => {
        // Handle message actions (copy, speak, report)
        if (action === 'copy') {
          navigator.clipboard.writeText(message.content)
        }
      }}
    />
  )
}

const AgentSidebar: React.FC = () => {
  const { agents, activeAgent, setActiveAgent } = useNeonProChat()

  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'client':
        return <Users className='h-5 w-5' />
      case 'financial':
        return <DollarSign className='h-5 w-5' />
      case 'appointment':
        return <Calendar className='h-5 w-5' />
      default:
        return <MessageSquare className='h-5 w-5' />
    }
  }

  const getAgentColor = (status: string) => {
    switch (status) {
      case 'thinking':
        return 'bg-yellow-500'
      case 'responding':
        return 'bg-blue-500'
      case 'error':
        return 'bg-red-500'
      default:
        return 'bg-green-500'
    }
  }

  const getAgentLabel = (type: string) => {
    switch (type) {
      case 'client':
        return 'Pacientes'
      case 'financial':
        return 'Financeiro'
      case 'appointment':
        return 'Agendamento'
      default:
        return 'Assistente'
    }
  }

  const getAgentStatusText = (status: string) => {
    switch (status) {
      case 'thinking':
        return 'Pensando'
      case 'responding':
        return 'Respondendo'
      case 'error':
        return 'Erro'
      default:
        return 'Disponível'
    }
  }

  // Enhanced agent selection with screen reader announcements
  const handleAgentSelect = useCallback((agentType: string, agentName: string) => {
    setActiveAgent(agentType)

    // Announce agent selection to screen readers
    const announcement = document.createElement('div')
    announcement.setAttribute('role', 'status')
    announcement.setAttribute('aria-live', 'polite')
    announcement.className = 'sr-only'
    announcement.textContent = `Assistente ${agentName} selecionado`
    document.body.appendChild(announcement)

    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 2000)
  }, [setActiveAgent])

  return (
    <Card className='h-fit' role='region' aria-label='Seleção de assistentes'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2' id='assistants-title'>
          <MessageSquare className='h-5 w-5' aria-hidden='true' />
          Assistentes AI
        </CardTitle>
      </CardHeader>
      <CardContent
        className='space-y-3'
        role='list'
        aria-labelledby='assistants-title'
      >
        {agents.map((agent, index) => {
          const isActive = activeAgent?.id === agent.id
          const statusText = getAgentStatusText(agent.status)
          const agentLabel = getAgentLabel(agent.type)

          return (
            <AccessibilityButton
              key={agent.id}
              variant={isActive ? 'default' : 'outline'}
              onClick={() => handleAgentSelect(agent.type, agent.name)}
              healthcareContext='administrative'
              className={`w-full flex items-center gap-3 p-3 text-left ${isActive ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'}`}
              ariaLabel={`Selecionar assistente ${agent.name} - ${agentLabel} - Status: ${statusText}`}
              ariaPressed={isActive}
              role='listitem'
              announcement={`Assistente ${agent.name} selecionado`}
            >
              <div className='flex-shrink-0' aria-hidden='true'>
                {getAgentIcon(agent.type)}
              </div>
              <div className='flex-1 text-left'>
                <div className='flex items-center gap-2'>
                  <span className='font-medium text-sm'>{agent.name}</span>
                  <div
                    className={`w-2 h-2 rounded-full ${getAgentColor(agent.status)}`}
                    aria-hidden='true'
                  />
                  <span className='sr-only'>Status: {statusText}</span>
                </div>
                <span className='text-xs text-gray-500'>{agentLabel}</span>
              </div>
              <Badge variant='secondary' className='text-xs' aria-label={`${agent.messages.length} mensagens`}>
                {agent.messages.length}
              </Badge>
            </AccessibilityButton>
          )
        })}
      </CardContent>
    </Card>
  )
}

const ComplianceBanner: React.FC = () => {
  const { config } = useNeonProChat()

  if (!config?.compliance.lgpdEnabled) return null

  return (
    <Alert
      className='mb-4 healthcare-context-administrative'
      role='alert'
      aria-live='polite'
    >
      <Shield className='h-4 w-4' aria-hidden='true' />
      <AlertDescription className='text-sm'>
        <strong>Conformidade LGPD:</strong>{' '}
        Todas as conversas são criptografadas e registradas para auditoria. Os dados dos pacientes
        são tratados conforme a Lei Geral de Proteção de Dados.{' '}
        <span className='block mt-1 text-xs text-purple-600'>
          Dados sensíveis: Informações criptografadas em repouso e em trânsito
        </span>
      </AlertDescription>
    </Alert>
  )
}

export const NeonProChatInterface: React.FC = () => {
  const { activeAgent, sendMessage, clearChat, exportChat } = useNeonProChat()
  const [showExport, setShowExport] = useState(false)
  const [announcements, setAnnouncements] = useState<
    { message: string; priority: 'polite' | 'assertive' }[]
  >([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeAgent?.messages])

  // Enhanced keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+E for export
      if (e.altKey && e.key === 'e') {
        e.preventDefault()
        setShowExport(!showExport)
      }

      // Alt+C for clear chat
      if (e.altKey && e.key === 'c' && activeAgent) {
        e.preventDefault()
        clearChat(activeAgent.type)
      }

      // Alt+1-3 for quick agent selection
      if (e.altKey && /^[1-3]$/.test(e.key)) {
        e.preventDefault()
        const agentIndex = parseInt(e.key) - 1
        // Agent selection logic would go here
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showExport, activeAgent, clearChat])

  // Enhanced send message with accessibility
  const handleSendMessage = useCallback((content: string) => {
    if (activeAgent) {
      // Announce message sending
      const announcement = document.createElement('div')
      announcement.setAttribute('role', 'status')
      announcement.setAttribute('aria-live', 'polite')
      announcement.className = 'sr-only'
      announcement.textContent = `Enviando mensagem para ${activeAgent.name}`
      document.body.appendChild(announcement)

      sendMessage(content, activeAgent.type)

      setTimeout(() => {
        document.body.removeChild(announcement)
      }, 1000)
    }
  }, [activeAgent, sendMessage])

  const handleExport = useCallback(async () => {
    if (activeAgent) {
      try {
        // Announce export start
        const startAnnouncement = document.createElement('div')
        startAnnouncement.setAttribute('role', 'status')
        startAnnouncement.setAttribute('aria-live', 'polite')
        startAnnouncement.className = 'sr-only'
        startAnnouncement.textContent = 'Iniciando exportação do chat...'
        document.body.appendChild(startAnnouncement)

        const exportData = await exportChat(activeAgent.type)
        const blob = new Blob([exportData], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `chat-${activeAgent.type}-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        setShowExport(false)

        // Announce export completion
        document.body.removeChild(startAnnouncement)
        const completionAnnouncement = document.createElement('div')
        completionAnnouncement.setAttribute('role', 'status')
        completionAnnouncement.setAttribute('aria-live', 'polite')
        completionAnnouncement.className = 'sr-only'
        completionAnnouncement.textContent = 'Chat exportado com sucesso'
        document.body.appendChild(completionAnnouncement)

        setTimeout(() => {
          document.body.removeChild(completionAnnouncement)
        }, 3000)
      } catch (error) {
        console.error('Error exporting chat:', error)

        // Announce export error
        const errorAnnouncement = document.createElement('div')
        errorAnnouncement.setAttribute('role', 'alert')
        errorAnnouncement.setAttribute('aria-live', 'assertive')
        errorAnnouncement.className = 'sr-only'
        errorAnnouncement.textContent = 'Erro ao exportar chat. Tente novamente.'
        document.body.appendChild(errorAnnouncement)

        setTimeout(() => {
          document.body.removeChild(errorAnnouncement)
        }, 5000)
      }
    }
  }, [activeAgent, exportChat])

  const getAgentInstructions = (agentType: string) => {
    const instructions = {
      client:
        `Você é um assistente AI especializado em gestão de pacientes para clínicas estéticas brasileiras.
        
        Suas responsabilidades:
        - Auxiliar no cadastro e atualização de informações de pacientes
        - Verificar histórico de tratamentos e preferências
        - Responder perguntas sobre serviços e procedimentos
        - Manter conformidade com LGPD e ANVISA
        
        Sempre:
        - Fale em português do Brasil
        - Seja profissional e empático
        - Mantenha a privacidade dos dados dos pacientes
        - Forneça informações precisas e atualizadas`,

      financial:
        `Você é um assistente AI especializado em operações financeiras para clínicas estéticas.
        
        Suas responsabilidades:
        - Auxiliar em faturamento e cobranças
        - Verificar status de pagamentos
        - Calcular custos de tratamentos
        - Gerenciar informações de seguro saúde
        
        Sempre:
        - Fale em português do Brasil
        - Seja preciso com números e valores
        - Explique claramente opções de pagamento
        - Mantenha conformidade com normas financeiras`,

      appointment: `Você é um assistente AI especializado em agendamento para clínicas estéticas.
        
        Suas responsabilidades:
        - Verificar disponibilidade de profissionais
        - Sugerir horários otimizados
        - Gerenciar cancelamentos e remarcações
        - Considerar preferências dos pacientes
        
        Sempre:
        - Fale em português do Brasil
        - Confirme todos os detalhes do agendamento
        - Considere fatores como no-show e otimização
        - Seja claro sobre prazos e políticas`,
    }

    return instructions[agentType as keyof typeof instructions] || instructions.client
  }

  return (
    <AccessibleErrorBoundary>
      <SkipLinks />
      <ScreenReaderAnnouncer
        message={announcements.map(a => a.message).join('. ')}
        priority='polite'
      />
      <AccessibilitySettingsPanel />
      <div
        className='flex h-full gap-4 p-4 bg-gray-50'
        role='main'
        id='main-content'
        aria-label='Interface de chat NeonPro'
      >
        {/* Agent Sidebar */}
        <div className='w-80 flex-shrink-0'>
          <AgentSidebar />

          {/* Accessibility & Compliance Info */}
          <Card className='mt-4' role='region' aria-label='Informações de acessibilidade'>
            <CardHeader>
              <CardTitle className='text-sm' id='accessibility-title'>
                Acessibilidade & Compliance
              </CardTitle>
            </CardHeader>
            <CardContent
              className='space-y-2'
              role='list'
              aria-labelledby='accessibility-title'
            >
              <div className='flex items-center gap-2 text-sm' role='listitem'>
                <Accessibility className='h-4 w-4 text-green-600' aria-hidden='true' />
                <span>WCAG 2.1 AA+ Compatível</span>
                <Badge variant='outline' className='text-xs ml-auto'>Ativo</Badge>
              </div>
              <div className='flex items-center gap-2 text-sm' role='listitem'>
                <Smartphone className='h-4 w-4 text-blue-600' aria-hidden='true' />
                <span>Design Responsivo</span>
                <Badge variant='outline' className='text-xs ml-auto'>Ativo</Badge>
              </div>
              <div className='flex items-center gap-2 text-sm' role='listitem'>
                <Shield className='h-4 w-4 text-purple-600' aria-hidden='true' />
                <span>LGPD Compliant</span>
                <Badge variant='outline' className='text-xs ml-auto'>Ativo</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Keyboard shortcuts help */}
          <div className='mt-4 p-3 bg-gray-100 rounded-lg'>
            <h3 className='text-sm font-semibold mb-2' id='shortcuts-help'>
              Atalhos de Teclado:
            </h3>
            <ul className='text-xs text-gray-600 space-y-1' aria-labelledby='shortcuts-help'>
              <li>• Enter: Enviar mensagem</li>
              <li>• Escape: Limpar campo</li>
              <li>• Alt+1: Focar no campo de mensagem</li>
              <li>• Alt+E: Exportar conversa</li>
              <li>• Alt+C: Limpar conversa</li>
              <li>• Tab: Navegar entre elementos</li>
            </ul>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className='flex-1 flex flex-col bg-white rounded-lg shadow-lg'>
          {/* Chat Header */}
          <div className='flex items-center justify-between p-4 border-b'>
            <div>
              <h2 className='text-lg font-semibold text-gray-900'>
                {activeAgent?.name || 'Selecione um Assistente'}
              </h2>
              <p className='text-sm text-gray-600'>
                {activeAgent?.status === 'thinking' && 'Pensando...'}
                {activeAgent?.status === 'responding' && 'Respondendo...'}
                {activeAgent?.status === 'error' && 'Erro ocorreu'}
                {activeAgent?.status === 'idle' && 'Pronto para ajudar'}
              </p>
            </div>

            <div className='flex items-center gap-2'>
              <AccessibilityButton
                variant='outline'
                size='sm'
                onClick={() => setShowExport(!showExport)}
                ariaLabel='Exportar conversa'
                healthcareContext='administrative'
                shortcutKey='e'
                announcement={showExport ? 'Ocultar opções de exportação' : 'Mostrar opções de exportação'}
              >
                <Download className='h-4 w-4' />
              </AccessibilityButton>
              <AccessibilityButton
                variant='outline'
                size='sm'
                onClick={() => activeAgent && clearChat(activeAgent.type)}
                ariaLabel='Limpar conversa'
                healthcareContext='administrative'
                shortcutKey='c'
                announcement='Conversa limpa'
                disabled={!activeAgent}
              >
                <Trash2 className='h-4 w-4' />
              </AccessibilityButton>
            </div>
          </div>

          {/* Export Controls */}
          {showExport && (
            <div
              className='p-4 bg-gray-50 border-b'
              role='region'
              aria-label='Opções de exportação'
            >
              <div className='flex items-center gap-2'>
                <span className='text-sm font-medium'>Exportar conversa:</span>
                <AccessibilityButton
                  size='sm'
                  onClick={handleExport}
                  healthcareContext='administrative'
                  ariaLabel='Exportar conversa como JSON'
                >
                  Download JSON
                </AccessibilityButton>
                <AccessibilityButton
                  variant='outline'
                  size='sm'
                  onClick={() => setShowExport(false)}
                  healthcareContext='administrative'
                  ariaLabel='Cancelar exportação'
                >
                  Cancelar
                </AccessibilityButton>
              </div>
            </div>
          )}

          {/* Compliance Banner */}
          <ComplianceBanner />

          {/* Messages Area */}
          <div
            className='flex-1 overflow-y-auto p-4 space-y-4'
            role='log'
            aria-label='Mensagens do chat'
            aria-live='polite'
            aria-atomic='false'
          >
            {activeAgent && activeAgent.messages.length === 0 ? (
              <div
                className='flex items-center justify-center h-full text-gray-500'
                role='status'
                aria-live='polite'
              >
                <div className='text-center'>
                  <MessageSquare className='h-12 w-12 mx-auto mb-4 opacity-50' aria-hidden='true' />
                  <p className='text-lg font-medium'>Comece uma conversa</p>
                  <p className='text-sm'>Envie uma mensagem para {activeAgent?.name || 'o assistente'}</p>
                </div>
              </div>
            ) : (
              <>
                {activeAgent.messages.map((message, index) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isUser={message.role === 'user'}
                  />
                ))}
                <div ref={messagesEndRef} aria-hidden='true' />
              </>
            )}
          </div>

          {/* Input Area */}
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={!activeAgent || activeAgent.status === 'thinking'}
            placeholder={`Digite sua mensagem para ${activeAgent?.name || 'o assistente'}...`}
          />
        </div>

        {/* Hidden CopilotChat for backend integration */}
        {activeAgent && (
          <CopilotChat
            instructions={getAgentInstructions(activeAgent.type)}
            labels={{
              title: activeAgent.name,
              initial: `Olá! Sou ${activeAgent.name}. Como posso ajudar você hoje?`,
              placeholder: 'Digite sua mensagem...',
            }}
            className='hidden'
            onSubmitMessage={message => {
              // Handle message submission through our custom interface
              handleSendMessage(message)
            }}
          />
        )}
      </div>
    </AccessibleErrorBoundary>
  )
}

export default NeonProChatInterface

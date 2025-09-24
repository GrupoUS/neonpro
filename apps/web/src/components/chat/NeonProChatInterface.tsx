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
import React, { useEffect, useRef, useState } from 'react'
import { Alert, AlertDescription } from '../ui/alert'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import {
  AccessibilitySettingsPanel,
  AccessibleChatMessage,
  AccessibleErrorBoundary,
  AccessibleLoading,
  ScreenReaderAnnouncer,
  SkipLinks,
} from './NeonProAccessibility'
import { useNeonProChat } from './NeonProChatProvider'
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSendMessage(message.trim())
      setMessage('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className='flex gap-2 p-4 border-t bg-gray-50' role='form'>
      <input
        type='text'
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className='flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 touch-target'
        aria-label='Mensagem de chat'
        aria-describedby='chat-help-text'
        autoComplete='off'
        enterKeyHint='send'
      />
      <Button
        type='submit'
        disabled={disabled || !message.trim()}
        className='px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 touch-target'
        aria-label='Enviar mensagem'
        aria-disabled={disabled || !message.trim()}
      >
        <Send className='h-4 w-4' />
        <span className='sr-only'>Enviar</span>
      </Button>
      <div id='chat-help-text' className='sr-only'>
        Pressione Enter para enviar a mensagem ou use Alt+1 para navegação por atalhos
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
      onAction={(action) => {
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

  return (
    <Card className='h-fit'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <MessageSquare className='h-5 w-5' />
          Assistentes AI
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        {agents.map((agent) => (
          <button
            key={agent.id}
            onClick={() => setActiveAgent(agent.type)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
              activeAgent?.id === agent.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
            aria-label={`Selecionar assistente ${agent.name}`}
            aria-pressed={activeAgent?.id === agent.id}
          >
            <div className='flex-shrink-0'>
              {getAgentIcon(agent.type)}
            </div>
            <div className='flex-1 text-left'>
              <div className='flex items-center gap-2'>
                <span className='font-medium text-sm'>{agent.name}</span>
                <div
                  className={`w-2 h-2 rounded-full ${getAgentColor(agent.status)}`}
                  aria-hidden='true'
                />
              </div>
              <span className='text-xs text-gray-500'>{getAgentLabel(agent.type)}</span>
            </div>
            <Badge variant='secondary' className='text-xs'>
              {agent.messages.length}
            </Badge>
          </button>
        ))}
      </CardContent>
    </Card>
  )
}

const ComplianceBanner: React.FC = () => {
  const { config } = useNeonProChat()

  if (!config?.compliance.lgpdEnabled) return null

  return (
    <Alert className='mb-4'>
      <Shield className='h-4 w-4' />
      <AlertDescription className='text-sm'>
        <strong>LGPD Compliance:</strong>{' '}
        Todas as conversas são criptografadas e registradas para auditoria. Os dados dos pacientes
        são tratados conforme a Lei Geral de Proteção de Dados.
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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeAgent?.messages])

  const handleSendMessage = (content: string) => {
    if (activeAgent) {
      sendMessage(content, activeAgent.type)
    }
  }

  const handleExport = async () => {
    if (activeAgent) {
      try {
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
      } catch (error) {
        console.error('Error exporting chat:', error)
      }
    }
  }

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
        message={announcements.map((a) => a.message).join('. ')}
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
          <Card className='mt-4'>
            <CardHeader>
              <CardTitle className='text-sm'>Acessibilidade & Compliance</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
              <div className='flex items-center gap-2 text-sm'>
                <Accessibility className='h-4 w-4 text-green-600' />
                <span>WCAG 2.1 AA+ Compatível</span>
              </div>
              <div className='flex items-center gap-2 text-sm'>
                <Smartphone className='h-4 w-4 text-blue-600' />
                <span>Design Responsivo</span>
              </div>
              <div className='flex items-center gap-2 text-sm'>
                <Shield className='h-4 w-4 text-purple-600' />
                <span>LGPD Compliant</span>
              </div>
            </CardContent>
          </Card>
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
              <Button
                variant='outline'
                size='sm'
                onClick={() => setShowExport(!showExport)}
                aria-label='Exportar conversa'
              >
                <Download className='h-4 w-4' />
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => activeAgent && clearChat(activeAgent.type)}
                aria-label='Limpar conversa'
              >
                <Trash2 className='h-4 w-4' />
              </Button>
            </div>
          </div>

          {/* Export Controls */}
          {showExport && (
            <div className='p-4 bg-gray-50 border-b'>
              <div className='flex items-center gap-2'>
                <span className='text-sm font-medium'>Exportar conversa:</span>
                <Button size='sm' onClick={handleExport}>
                  Download JSON
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setShowExport(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* Compliance Banner */}
          <ComplianceBanner />

          {/* Messages Area */}
          <div className='flex-1 overflow-y-auto p-4 space-y-4'>
            {activeAgent?.messages.length === 0
              ? (
                <div className='flex items-center justify-center h-full text-gray-500'>
                  <div className='text-center'>
                    <MessageSquare className='h-12 w-12 mx-auto mb-4 opacity-50' />
                    <p className='text-lg font-medium'>Comece uma conversa</p>
                    <p className='text-sm'>Envie uma mensagem para {activeAgent?.name}</p>
                  </div>
                </div>
              )
              : (
                <>
                  {activeAgent.messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isUser={message.role === 'user'}
                    />
                  ))}
                  <div ref={messagesEndRef} />
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
            onSubmitMessage={(message) => {
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

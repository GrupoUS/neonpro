'use client'

import { Badge, } from '@/components/ui/badge'
import { Button, } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, } from '@/components/ui/card'
import { Input, } from '@/components/ui/input'
import { ScrollArea, } from '@/components/ui/scroll-area'
import { Separator, } from '@/components/ui/separator'
import {
  Maximize2,
  MessageCircle,
  Minimize2,
  Phone,
  Send,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react' // removed unused PhoneOff, Settings imports
import { useCallback, useEffect, useRef, useState, } from 'react'
import { cn, } from '../../lib/utils'

// import { ConfidenceIndicator } from "./confidence-indicator"; // Unused import
import { MessageRenderer, } from './message-renderer'
import type { Message, } from './message-renderer'
import { VoiceInput, } from './voice-input'

interface ExternalChatWidgetProps {
  className?: string
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' // eslint-disable-line @typescript-eslint/no-unused-vars
  onMessage?: (message: string,) => Promise<{
    response: string
    confidence: number
    requiresHumanHandoff?: boolean
  }>
  onHumanHandoffRequest?: () => void
  title?: string
  subtitle?: string
  avatar?: string
  theme?: 'light' | 'dark' | 'auto'
  isHighContrast?: boolean
  maxMessages?: number
  autoMinimize?: boolean
  enableVoice?: boolean
  enableHandoff?: boolean
}

export function ExternalChatWidget({
  className,
  position = 'bottom-right',
  onMessage,
  onHumanHandoffRequest,
  title = 'Assistente Virtual',
  subtitle = 'Como posso ajudar?',
  avatar,
  theme = 'auto',
  isHighContrast = false,
  maxMessages = 50,
  autoMinimize = true,
  enableVoice = true,
  enableHandoff = true,
}: ExternalChatWidgetProps,) {
  // Estados principais
  const [isOpen, setIsOpen,] = useState(false,)
  const [isMinimized, setIsMinimized,] = useState(false,)
  const [messages, setMessages,] = useState<Message[]>([],)
  const [inputValue, setInputValue,] = useState('',)
  const [isLoading, setIsLoading,] = useState(false,)
  const [isConnected,] = useState(true,)
  const [unreadCount, setUnreadCount,] = useState(0,)
  const [soundEnabled, setSoundEnabled,] = useState(true,)

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null,)
  const inputRef = useRef<HTMLInputElement>(null,)
  const audioRef = useRef<HTMLAudioElement | null>(null,)

  // Posição do widget
  const getPositionClasses = () => {
    const baseClasses = 'fixed z-50'
    switch (position) {
      case 'bottom-right':
        return `${baseClasses} bottom-4 right-4`
      case 'bottom-left':
        return `${baseClasses} bottom-4 left-4`
      case 'top-right':
        return `${baseClasses} top-4 right-4`
      case 'top-left':
        return `${baseClasses} top-4 left-4`
      default:
        return `${baseClasses} bottom-4 right-4`
    }
  }

  // Auto scroll para última mensagem
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', },)
  }, [],)

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom()
    }
  }, [messages, isOpen, isMinimized, scrollToBottom,],)

  // Som de notificação
  const playNotificationSound = useCallback(() => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.play().catch(console.error,)
    }
  }, [soundEnabled,],)

  // Adicionar mensagem
  const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>,) => {
    const newMessage: Message = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36,).slice(2, 9,)}`,
      timestamp: new Date(),
    }

    setMessages(prev => {
      const updated = [...prev, newMessage,]
      if (updated.length > maxMessages) {
        return updated.slice(-maxMessages,)
      }
      return updated
    },)

    // Incrementar contador de não lidas se widget fechado
    if (!isOpen && message.role !== 'user') {
      setUnreadCount(prev => prev + 1)
      playNotificationSound()
    }

    return newMessage.id
  }, [maxMessages, isOpen, playNotificationSound,],)

  // Enviar mensagem
  const handleSendMessage = useCallback(async (content: string,) => {
    if (!content || !content.trim() || isLoading) return

    // Adicionar mensagem do usuário
    addMessage({
      content: content.trim(),
      role: 'user',
    },)

    setInputValue('',)
    setIsLoading(true,)

    try {
      if (onMessage) {
        const response = await onMessage(content.trim(),)

        // Adicionar resposta do assistente
        addMessage({
          content: response.response,
          role: 'assistant',
          confidence: response.confidence,
          metadata: {
            requiresHumanHandoff: response.requiresHumanHandoff,
            processed: true,
          },
        },)

        // Verificar se requer atendimento humano
        if (response.requiresHumanHandoff && enableHandoff) {
          setTimeout(() => {
            addMessage({
              content:
                'Esta conversa foi encaminhada para atendimento humano. Um agente entrará em contato em breve.',
              role: 'system',
              metadata: {
                requiresHumanHandoff: true,
              },
            },)
            onHumanHandoffRequest?.()
          }, 1000,)
        }
      }
    } catch (error) {
      addMessage({
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
        role: 'assistant',
        confidence: 0,
        metadata: {
          error: true,
          errorMessage: error instanceof Error ? error.message : 'Erro desconhecido',
        },
      },)
    } finally {
      setIsLoading(false,)
    }
  }, [isLoading, onMessage, addMessage, enableHandoff, onHumanHandoffRequest,],)

  // Handler para transcrição de voz
  const handleVoiceTranscript = useCallback((transcript: string, confidence: number,) => {
    if (confidence >= 60) { // Só aceita transcrições com confiança ≥ 60%
      handleSendMessage(transcript,)
    }
  }, [handleSendMessage,],)

  // Abrir widget
  const handleOpen = useCallback(() => {
    setIsOpen(true,)
    setIsMinimized(false,)
    setUnreadCount(0,)

    // Focus no input após abrir
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100,)
  }, [],)

  // Fechar widget
  const handleClose = useCallback(() => {
    setIsOpen(false,)
    if (autoMinimize) {
      setIsMinimized(false,)
    }
  }, [autoMinimize,],)

  // Toggle minimizar
  const toggleMinimize = useCallback(() => {
    setIsMinimized(prev => !prev)
  }, [],)

  // Inicialização
  useEffect(() => {
    // Mensagem de boas-vindas
    if (messages.length === 0) {
      addMessage({
        content: 'Olá! Sou seu assistente virtual. Como posso ajudá-lo hoje?',
        role: 'assistant',
        confidence: 100,
      },)
    }

    // Inicializar áudio
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio(
        'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+TiuWkgBSSG0O/AdzEGJ4TB7+OZURE=',
      )
    }
  }, [messages.length, addMessage,],)

  // Render do botão flutuante
  if (!isOpen) {
    return (
      <>
        <div className={getPositionClasses()}>
          <Button
            onClick={handleOpen}
            size="lg"
            className={cn(
              'h-14 w-14 rounded-full shadow-lg hover:shadow-xl',
              'transition-all duration-200 hover:scale-110',
              'bg-blue-600 hover:bg-blue-700 text-white',
              isHighContrast && 'ring-2 ring-blue-800',
            )}
            aria-label={`Abrir ${title}`}
          >
            <MessageCircle className="h-6 w-6" />
            {unreadCount > 0 && (
              <Badge
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center bg-red-500"
                aria-label={`${unreadCount} mensagens não lidas`}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>
        </div>
      </>
    )
  }

  // Render do widget aberto
  return (
    <div className={cn(getPositionClasses(), className,)}>
      <Card
        className={cn(
          'w-80 h-96 sm:w-96 sm:h-[500px] flex flex-col shadow-xl',
          isHighContrast && 'ring-2 ring-gray-400',
          isMinimized && 'h-12',
        )}
        role="dialog"
        aria-label={title}
        aria-modal="true"
      >
        {/* Header */}
        <CardHeader className="flex-shrink-0 p-4 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'w-2 h-2 rounded-full',
                  isConnected ? 'bg-green-500' : 'bg-red-500',
                )}
              />
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled,)}
                className="h-8 w-8 p-0"
                aria-label={soundEnabled ? 'Desativar som' : 'Ativar som'}
              >
                {soundEnabled
                  ? <Volume2 className="h-4 w-4" />
                  : <VolumeX className="h-4 w-4" />}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMinimize}
                className="h-8 w-8 p-0"
                aria-label={isMinimized ? 'Maximizar' : 'Minimizar'}
              >
                {isMinimized
                  ? <Maximize2 className="h-4 w-4" />
                  : <Minimize2 className="h-4 w-4" />}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-8 w-8 p-0"
                aria-label="Fechar chat"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {!isMinimized && subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </CardHeader>

        {!isMinimized && (
          <>
            <Separator />

            {/* Messages Area */}
            <CardContent className="flex-1 p-0 overflow-hidden">
              <ScrollArea className="h-full px-4 py-2">
                <div className="space-y-4">
                  {messages.map((message,) => (
                    <MessageRenderer
                      key={message.id}
                      message={message}
                      showAvatar={false}
                      showTimestamp
                      showConfidence
                      isHighContrast={isHighContrast}
                    />
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-500 px-4 py-2 rounded-lg text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </CardContent>

            <Separator />

            {/* Input Area */}
            <div className="flex-shrink-0 p-4 space-y-2">
              {enableVoice && (
                <VoiceInput
                  onTranscript={handleVoiceTranscript}
                  disabled={isLoading}
                  continuous={false}
                  interimResults
                  className="mb-2"
                />
              )}

              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e,) => setInputValue(e.target.value,)}
                  onKeyDown={(e,) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage(inputValue,)
                    }
                  }}
                  placeholder="Digite sua mensagem..."
                  disabled={isLoading}
                  className="flex-1"
                  aria-label="Campo de mensagem"
                  maxLength={1000}
                />
                <Button
                  onClick={() => handleSendMessage(inputValue,)}
                  disabled={isLoading || !inputValue.trim()}
                  size="sm"
                  aria-label="Enviar mensagem"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              {enableHandoff && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onHumanHandoffRequest}
                  className="w-full text-xs"
                  aria-label="Falar com atendente humano"
                >
                  <Phone className="h-3 w-3 mr-1" />
                  Falar com Atendente
                </Button>
              )}
            </div>
          </>
        )}
      </Card>
    </div>
  )
}

/**
 * NeonPro Accessibility Enhancements
 *
 * Comprehensive WCAG 2.1 AA+ accessibility features for healthcare chat components
 * Features:
 * - Screen reader support with ARIA labels and live regions
 * - Keyboard navigation with focus management
 * - High contrast mode support
 * - Reduced motion preferences
 * - Text resizing and zoom capabilities
 * - Voice control compatibility
 * - Cognitive accessibility features
 * - Portuguese accessibility labels
 */

import {
  Accessibility,
  ChevronDown,
  ChevronUp,
  Eye,
  Keyboard,
  Moon,
  Pause,
  Play,
  RotateCcw,
  Sun,
  Volume2,
  VolumeX,
} from 'lucide-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  type AccessibilitySettings,
  applyFontSize,
  applyHighContrastTheme,
  applyReducedMotion,
  DEFAULT_ACCESSIBILITY_SETTINGS,
  FONT_SIZE_MAP,
  type FontSize,
  type HighContrastTheme,
} from '../../config/accessibility-theme.js'
import { Alert, AlertDescription } from '../ui/alert.js'
import { Badge } from '../ui/badge.js'
import { Button } from '../ui/button.js'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.js'

// Types for accessibility features

interface AnnouncerProps {
  message: string
  priority: 'polite' | 'assertive'
  timeout?: number
}

interface FocusTrapProps {
  children: React.ReactNode
  active: boolean
  onEscape?: () => void
}

interface KeyboardNavigationProps {
  children: React.ReactNode
  onNavigate?: (direction: 'next' | 'previous' | 'first' | 'last') => void
  onActivate?: () => void
}

// Screen Reader Announcer Component
export const ScreenReaderAnnouncer: React.FC<AnnouncerProps> = ({
  message,
  priority,
  timeout = 5000,
}) => {
  const [announcements, setAnnouncements] = useState<
    Array<{ id: string; message: string; priority: string }>
  >([])

  useEffect(() => {
    if (!message) return

    const id = Math.random().toString(36).substr(2, 9)
    const announcement = { id, message, priority }

    setAnnouncements(prev => [...prev, announcement])

    const timer = setTimeout(() => {
      setAnnouncements(prev => prev.filter(a => a.id !== id))
    }, timeout)

    return () => clearTimeout(timer)
  }, [message, priority, timeout])

  return (
    <div className='sr-only' aria-live={priority} aria-atomic='true'>
      {announcements.map(a => a.message).join('. ')}
    </div>
  )
}

// Focus Trap Component for modal dialogs
export const FocusTrap: React.FC<FocusTrapProps> = ({
  children,
  active,
  onEscape,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!active) return

    const container = containerRef.current
    if (!container) return

    // Get all focusable elements
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )

    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onEscape?.()
        return
      }

      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    // Focus first element when trap activates
    firstElement?.focus()

    container.addEventListener('keydown', handleKeyDown)
    return () => container.removeEventListener('keydown', handleKeyDown)
  }, [active, onEscape])

  return (
    <div ref={containerRef} tabIndex={-1}>
      {children}
    </div>
  )
}

// Enhanced Keyboard Navigation
export const KeyboardNavigation: React.FC<KeyboardNavigationProps> = ({
  children,
  onNavigate,
  onActivate,
}) => {
  const ref = useRef<HTMLDivElement>(null)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!ref.current?.contains(e.target as Node)) return

    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault()
        onNavigate?.('next')
        break
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault()
        onNavigate?.('previous')
        break
      case 'Home':
        e.preventDefault()
        onNavigate?.('first')
        break
      case 'End':
        e.preventDefault()
        onNavigate?.('last')
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        onActivate?.()
        break
    }
  }, [onNavigate, onActivate])

  useEffect(() => {
    const element = ref.current
    if (!element) return

    element.addEventListener('keydown', handleKeyDown)
    return () => element.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div ref={ref} role='application' aria-label='Navegação por teclado'>
      {children}
    </div>
  )
}

// Accessibility Settings Panel
export const AccessibilitySettingsPanel: React.FC = () => {
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_ACCESSIBILITY_SETTINGS)

  const [isOpen, setIsOpen] = useState(false)

  const updateSetting = useCallback(<K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K],
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }))

    // Apply settings to document using utility functions
    if (key === 'highContrast') {
      applyHighContrastTheme(value as boolean)
    }
    if (key === 'reducedMotion') {
      applyReducedMotion(value as boolean)
    }
    if (key === 'fontSize') {
      applyFontSize(value as FontSize)
    }
  }, [])

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('accessibility-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings) as AccessibilitySettings
        setSettings(parsed)

        // Apply saved settings with conditional checks
        applyHighContrastTheme(parsed.highContrast)
        applyReducedMotion(parsed.reducedMotion)
        applyFontSize(parsed.fontSize)
      } catch (error) {
        console.error('Failed to load accessibility settings:', error)
      }
    }

    // Detect system preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      updateSetting('reducedMotion', true)
    }

    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches
    if (prefersHighContrast) {
      updateSetting('highContrast', true)
    }
  }, [updateSetting])

  useEffect(() => {
    // Save settings to localStorage
    localStorage.setItem('accessibility-settings', JSON.stringify(settings))
  }, [settings])

  if (!isOpen) {
    return (
      <Button
        variant='outline'
        size='sm'
        onClick={() => setIsOpen(true)}
        className='fixed bottom-4 right-4 z-50 shadow-lg'
        aria-label='Abrir configurações de acessibilidade'
      >
        <Accessibility className='h-4 w-4 mr-2' />
        Acessibilidade
      </Button>
    )
  }

  return (
    <FocusTrap active={isOpen} onEscape={() => setIsOpen(false)}>
      <Card className='fixed bottom-4 right-4 w-80 z-50 shadow-xl border-2'>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-lg flex items-center gap-2'>
              <Accessibility className='h-5 w-5' />
              Configurações de Acessibilidade
            </CardTitle>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setIsOpen(false)}
              aria-label='Fechar configurações'
            >
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent className='space-y-4 max-h-96 overflow-y-auto'>
          {/* High Contrast */}
          <div className='space-y-2'>
            <label className='flex items-center justify-between cursor-pointer'>
              <span className='text-sm font-medium'>Alto Contraste</span>
              <Button
                variant={settings.highContrast ? 'default' : 'outline'}
                size='sm'
                onClick={() => updateSetting('highContrast', !settings.highContrast)}
                aria-pressed={settings.highContrast}
              >
                {settings.highContrast ? <Sun className='h-4 w-4' /> : <Moon className='h-4 w-4' />}
              </Button>
            </label>
          </div>

          {/* Reduced Motion */}
          <div className='space-y-2'>
            <label className='flex items-center justify-between cursor-pointer'>
              <span className='text-sm font-medium'>Reduzir Animações</span>
              <Button
                variant={settings.reducedMotion ? 'default' : 'outline'}
                size='sm'
                onClick={() => updateSetting('reducedMotion', !settings.reducedMotion)}
                aria-pressed={settings.reducedMotion}
              >
                {settings.reducedMotion
                  ? <Pause className='h-4 w-4' />
                  : <Play className='h-4 w-4' />}
              </Button>
            </label>
          </div>

          {/* Font Size */}
          <div className='space-y-2'>
            <label className='text-sm font-medium'>Tamanho do Texto</label>
            <div className='flex gap-2'>
              {(Object.keys(FONT_SIZE_MAP) as FontSize[]).map(size => (
                <Button
                  key={size}
                  variant={settings.fontSize === size ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => updateSetting('fontSize', size)}
                  aria-label={`Tamanho ${size}`}
                  className='flex-1'
                >
                  {size === 'small' && 'A'}
                  {size === 'medium' && 'A'}
                  {size === 'large' && <span className='text-lg'>A</span>}
                  {size === 'x-large' && <span className='text-xl'>A</span>}
                </Button>
              ))}
            </div>
          </div>

          {/* Text to Speech */}
          <div className='space-y-2'>
            <label className='flex items-center justify-between cursor-pointer'>
              <span className='text-sm font-medium'>Texto para Voz</span>
              <Button
                variant={settings.textToSpeech ? 'default' : 'outline'}
                size='sm'
                onClick={() => updateSetting('textToSpeech', !settings.textToSpeech)}
                aria-pressed={settings.textToSpeech}
              >
                {settings.textToSpeech
                  ? <Volume2 className='h-4 w-4' />
                  : <VolumeX className='h-4 w-4' />}
              </Button>
            </label>
          </div>

          {/* Keyboard Mode */}
          <div className='space-y-2'>
            <label className='flex items-center justify-between cursor-pointer'>
              <span className='text-sm font-medium'>Modo Teclado</span>
              <Button
                variant={settings.keyboardMode ? 'default' : 'outline'}
                size='sm'
                onClick={() => updateSetting('keyboardMode', !settings.keyboardMode)}
                aria-pressed={settings.keyboardMode}
              >
                <Keyboard className='h-4 w-4' />
              </Button>
            </label>
          </div>

          {/* Focus Visible */}
          <div className='space-y-2'>
            <label className='flex items-center justify-between cursor-pointer'>
              <span className='text-sm font-medium'>Indicador de Foco</span>
              <Button
                variant={settings.focusVisible ? 'default' : 'outline'}
                size='sm'
                onClick={() => updateSetting('focusVisible', !settings.focusVisible)}
                aria-pressed={settings.focusVisible}
              >
                <Eye className='h-4 w-4' />
              </Button>
            </label>
          </div>

          {/* Announcements */}
          <div className='space-y-2'>
            <label className='flex items-center justify-between cursor-pointer'>
              <span className='text-sm font-medium'>Anúncios de Tela</span>
              <Button
                variant={settings.announcementsEnabled ? 'default' : 'outline'}
                size='sm'
                onClick={() =>
                  updateSetting('announcementsEnabled', !settings.announcementsEnabled)}
                aria-pressed={settings.announcementsEnabled}
              >
                {settings.announcementsEnabled
                  ? <Volume2 className='h-4 w-4' />
                  : <VolumeX className='h-4 w-4' />}
              </Button>
            </label>
          </div>

          {/* Reset Button */}
          <Button
            variant='outline'
            size='sm'
            onClick={() => {
              setSettings(DEFAULT_ACCESSIBILITY_SETTINGS)
              // Apply default settings
              applyHighContrastTheme(DEFAULT_ACCESSIBILITY_SETTINGS.highContrast)
              applyReducedMotion(DEFAULT_ACCESSIBILITY_SETTINGS.reducedMotion)
              applyFontSize(DEFAULT_ACCESSIBILITY_SETTINGS.fontSize)
            }}
            className='w-full'
          >
            <RotateCcw className='h-4 w-4 mr-2' />
            Restaurar Padrões
          </Button>

          {/* Keyboard Shortcuts Info */}
          <Alert>
            <Keyboard className='h-4 w-4' />
            <AlertDescription className='text-xs'>
              <strong>Atalhos do Teclado:</strong>
              <br />
              • Tab / Shift+Tab: Navegar<br />
              • Enter / Espaço: Ativar<br />
              • Esc: Fechar diálogos<br />
              • Setas: Navegar em listas
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </FocusTrap>
  )
}

// Accessible Chat Message Component
interface AccessibleChatMessageProps {
  message: {
    id: string
    content: string
    role: 'user' | 'assistant'
    timestamp: Date
    metadata?: {
      agentType?: string
      processingTime?: number
      sensitiveData?: boolean
      complianceLevel?: 'standard' | 'enhanced' | 'restricted'
    }
  }
  isUser?: boolean
  onAction?: (action: 'copy' | 'speak' | 'report') => void
}

export const AccessibleChatMessage: React.FC<AccessibleChatMessageProps> = ({
  message,
  isUser = false,
  onAction,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)

  const formatTime = (date: Date) => {
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window && isSpeaking) {
        speechSynthesis.cancel()
      }
    }
  }, [isSpeaking])

  const handleSpeak = useCallback(() => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        speechSynthesis.cancel()
        setIsSpeaking(false)
      } else {
        // Cancel any ongoing speech to prevent overlapping
        speechSynthesis.cancel()

        const utterance = new SpeechSynthesisUtterance(message.content)
        utterance.lang = 'pt-BR'
        utterance.onend = () => setIsSpeaking(false)
        utterance.onerror = () => setIsSpeaking(false)
        speechSynthesis.speak(utterance)
        setIsSpeaking(true)
        onAction?.('speak')
      }
    }
  }, [message.content, isSpeaking, onAction])

  const isLongContent = message.content.length > 300

  return (
    <article
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      aria-label={`${isUser ? 'Sua' : 'Assistente'} mensagem`}
    >
      <div
        className={`max-w-lg lg:max-w-xl rounded-lg shadow-sm ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-white border border-gray-200 text-gray-900'
        }`}
        role={isUser ? 'user' : 'assistant'}
        aria-labelledby={`message-${message.id}-title`}
        aria-describedby={`message-${message.id}-content`}
      >
        {/* Message Header */}
        <div
          id={`message-${message.id}-title`}
          className='flex items-center justify-between p-3 pb-2 border-b border-gray-200'
        >
          <div className='flex items-center gap-2'>
            <span className='text-sm font-medium'>
              {isUser ? 'Você' : message.metadata?.agentType || 'Assistente'}
            </span>
            {message.metadata?.complianceLevel && (
              <Badge
                variant={message.metadata.complianceLevel === 'restricted'
                  ? 'destructive'
                  : 'secondary'}
                className='text-xs'
              >
                {message.metadata.complianceLevel === 'restricted' ? 'Restrito' : 'Padrão'}
              </Badge>
            )}
          </div>
          <time
            dateTime={message.timestamp.toISOString()}
            className='text-xs opacity-75'
          >
            {formatTime(message.timestamp)}
          </time>
        </div>

        {/* Message Content */}
        <div
          id={`message-${message.id}-content`}
          className='p-3'
        >
          <p className='text-sm leading-relaxed whitespace-pre-wrap break-words'>
            {isExpanded || !isLongContent
              ? message.content
              : `${message.content.substring(0, 300)}...`}
          </p>

          {isLongContent && (
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setIsExpanded(!isExpanded)}
              className='mt-2 p-0 h-auto text-xs'
              aria-expanded={isExpanded}
              aria-controls={`message-${message.id}-content`}
            >
              {isExpanded
                ? (
                  <>
                    <ChevronUp className='h-3 w-3 mr-1' />
                    Mostrar menos
                  </>
                )
                : (
                  <>
                    <ChevronDown className='h-3 w-3 mr-1' />
                    Mostrar mais
                  </>
                )}
            </Button>
          )}

          {message.metadata?.processingTime && (
            <p className='text-xs mt-2 opacity-75'>
              Processado em {Math.round(message.metadata.processingTime)}ms
            </p>
          )}
        </div>

        {/* Message Actions */}
        <div className='flex items-center gap-2 p-3 pt-2 border-t border-gray-200'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => onAction?.('copy')}
            className='text-xs'
            aria-label='Copiar mensagem'
          >
            Copiar
          </Button>

          <Button
            variant='ghost'
            size='sm'
            onClick={handleSpeak}
            className='text-xs'
            aria-label={isSpeaking ? 'Parar leitura' : 'Ouvir mensagem'}
            aria-pressed={isSpeaking}
          >
            {isSpeaking ? 'Parar' : 'Ouvir'}
          </Button>

          <Button
            variant='ghost'
            size='sm'
            onClick={() => onAction?.('report')}
            className='text-xs'
            aria-label='Reportar problema'
          >
            Reportar
          </Button>
        </div>
      </div>
    </article>
  )
}

// Skip Links Component for keyboard navigation
export const SkipLinks: React.FC = () => {
  const [showSkipLinks, setShowSkipLinks] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) {
        setShowSkipLinks(true)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.altKey) {
        setShowSkipLinks(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  if (!showSkipLinks) return null

  return (
    <nav className='fixed top-0 left-0 z-50 bg-white border-b shadow-lg p-2'>
      <div className='flex gap-2'>
        <a
          href='#main-content'
          className='px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700'
          onClick={e => {
            e.preventDefault()
            document.getElementById('main-content')?.focus()
          }}
        >
          Pular para conteúdo principal
        </a>
        <a
          href='#navigation'
          className='px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700'
          onClick={e => {
            e.preventDefault()
            document.getElementById('navigation')?.focus()
          }}
        >
          Pular para navegação
        </a>
        <a
          href='#search'
          className='px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700'
          onClick={e => {
            e.preventDefault()
            document.getElementById('search')?.focus()
          }}
        >
          Pular para busca
        </a>
      </div>
    </nav>
  )
}

// Accessible Loading Component
interface AccessibleLoadingProps {
  message?: string
  description?: string
}

export const AccessibleLoading: React.FC<AccessibleLoadingProps> = ({
  message = 'Carregando...',
  description = 'Por favor, aguarde enquanto processamos sua solicitação',
}) => {
  return (
    <div
      className='flex items-center justify-center p-4'
      role='status'
      aria-live='polite'
      aria-busy='true'
    >
      <div className='text-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2' />
        <p className='font-medium'>{message}</p>
        <p className='text-sm text-gray-500'>{description}</p>
      </div>
    </div>
  )
}

// Error Boundary with Accessibility
interface AccessibleErrorBoundaryProps {
  children: React.ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface AccessibleErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorId?: string
}

export class AccessibleErrorBoundary extends React.Component<
  AccessibleErrorBoundaryProps,
  AccessibleErrorBoundaryState
> {
  constructor(props: AccessibleErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): AccessibleErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorId: Math.random().toString(36).substr(2, 9),
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role='alert'
          className='p-4 border border-red-300 bg-red-50 rounded-lg'
          aria-labelledby={`error-${this.state.errorId}-title`}
          aria-describedby={`error-${this.state.errorId}-description`}
        >
          <h2
            id={`error-${this.state.errorId}-title`}
            className='text-lg font-semibold text-red-800 mb-2'
          >
            Ocorreu um erro inesperado
          </h2>
          <p
            id={`error-${this.state.errorId}-description`}
            className='text-red-700 mb-4'
          >
            Desculpe pelo inconveniente. Por favor, tente novamente ou contate o suporte se o
            problema persistir.
          </p>
          <Button
            onClick={() => this.setState({ hasError: false })}
            variant='outline'
          >
            Tentar novamente
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}

// Export all accessibility components
export { AccessibilitySettings, type HighContrastTheme }

export default {
  ScreenReaderAnnouncer,
  FocusTrap,
  KeyboardNavigation,
  AccessibilitySettingsPanel,
  AccessibleChatMessage,
  SkipLinks,
  AccessibleLoading,
  AccessibleErrorBoundary,
}

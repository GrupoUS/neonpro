/**
 * NeonPro Chat Components Library
 *
 * Reusable chat components with healthcare-specific features and LGPD compliance
 * Features:
 * - Message components with accessibility
 * - Agent status indicators
 * - Compliance controls
 * - Mobile-optimized layouts
 * - Portuguese localization
 */

import {
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  CreditCard,
  Download,
  Eye,
  EyeOff,
  Mail,
  MoreHorizontal,
  Phone,
  Shield,
  Stethoscope,
  User,
  XCircle,
} from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { Alert, AlertDescription } from '../ui/alert'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

// Types
interface MessageComponentProps {
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
  showSensitiveData?: boolean
  onToggleSensitiveData?: () => void
  className?: string
}

interface AgentStatusProps {
  agent: {
    id: string
    name: string
    type: string
    status: 'idle' | 'thinking' | 'responding' | 'error'
    messageCount: number
    lastActivity?: Date
  }
  isActive?: boolean
  onClick?: () => void
}

interface ComplianceControlProps {
  onExportData?: () => void
  onClearData?: () => void
  onDataAccessRequest?: () => void
  showControls?: boolean
}

interface PatientDataCardProps {
  patient: {
    id: string
    name: string
    contact: string
    lastVisit?: Date
    treatments?: string[]
    status: 'active' | 'inactive' | 'new'
  }
  showSensitiveData?: boolean
  onToggleSensitive?: () => void
}

interface AppointmentCardProps {
  appointment: {
    id: string
    patientName: string
    service: string
    dateTime: Date
    status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled'
    professional: string
    duration: number
  }
  onAction?: (action: 'confirm' | 'cancel' | 'reschedule') => void
}

// Message Component with LGPD compliance
export const NeonProMessage: React.FC<MessageComponentProps> = ({
  message,
  isUser = false,
  showSensitiveData = false,
  onToggleSensitiveData,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showCopied, setShowCopied] = useState(false)

  const formatTime = (date: Date) => {
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setShowCopied(true)
      setTimeout(() => setShowCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy message:', error)
    }
  }

  const hasSensitiveData = message.metadata?.sensitiveData
    || message.metadata?.complianceLevel === 'restricted'

  const getComplianceIcon = () => {
    if (hasSensitiveData && !showSensitiveData) {
      return <EyeOff className='h-4 w-4 text-yellow-600' />
    }
    if (hasSensitiveData) {
      return <Eye className='h-4 w-4 text-green-600' />
    }
    return <Shield className='h-4 w-4 text-blue-600' />
  }

  const displayContent = hasSensitiveData && !showSensitiveData
    ? '[Dados sensíveis ocultos por conformidade LGPD]'
    : message.content

  const isLongContent = message.content.length > 300

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 ${className}`}>
      <div
        className={`max-w-lg lg:max-w-xl ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-white border border-gray-200 text-gray-900'
        } rounded-lg shadow-sm`}
        role={isUser ? 'user' : 'assistant'}
        aria-label={`${isUser ? 'Sua' : 'Assistente'} mensagem`}
      >
        {/* Message Header */}
        <div className='flex items-center justify-between p-3 pb-2 border-b border-gray-200'>
          <div className='flex items-center gap-2'>
            {isUser ? <User className='h-4 w-4' /> : <Stethoscope className='h-4 w-4' />}
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
          <div className='flex items-center gap-2'>
            {getComplianceIcon()}
            <span className='text-xs opacity-75'>
              {formatTime(message.timestamp)}
            </span>
          </div>
        </div>

        {/* Message Content */}
        <div className='p-3'>
          <p className='text-sm leading-relaxed whitespace-pre-wrap break-words'>
            {isExpanded || !isLongContent
              ? displayContent
              : `${displayContent.substring(0, 300)}...`}
          </p>

          {isLongContent && (
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setIsExpanded(!isExpanded)}
              className='mt-2 p-0 h-auto text-xs'
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
        <div className='flex items-center justify-between p-3 pt-2 border-t border-gray-200'>
          <div className='flex items-center gap-2'>
            {hasSensitiveData && onToggleSensitiveData && (
              <Button
                variant='ghost'
                size='sm'
                onClick={onToggleSensitiveData}
                className='text-xs'
                aria-label={showSensitiveData
                  ? 'Ocultar dados sensíveis'
                  : 'Mostrar dados sensíveis'}
              >
                {showSensitiveData
                  ? <EyeOff className='h-3 w-3 mr-1' />
                  : <Eye className='h-3 w-3 mr-1' />}
                {showSensitiveData ? 'Ocultar' : 'Mostrar'}
              </Button>
            )}
            <Button
              variant='ghost'
              size='sm'
              onClick={handleCopy}
              className='text-xs'
              aria-label='Copiar mensagem'
            >
              <Copy className='h-3 w-3 mr-1' />
              {showCopied ? 'Copiado!' : 'Copiar'}
            </Button>
          </div>
          {message.metadata?.complianceLevel === 'restricted' && (
            <span className='text-xs text-yellow-600'>
              🔒 Dados protegidos por LGPD
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// Agent Status Component
export const NeonProAgentStatus: React.FC<AgentStatusProps> = ({
  agent,
  isActive = false,
  onClick,
}) => {
  const getStatusIcon = () => {
    switch (agent.status) {
      case 'thinking':
        return <Clock className='h-4 w-4 text-yellow-500' />
      case 'responding':
        return <Stethoscope className='h-4 w-4 text-blue-500' />
      case 'error':
        return <XCircle className='h-4 w-4 text-red-500' />
      default:
        return <CheckCircle className='h-4 w-4 text-green-500' />
    }
  }

  const getStatusColor = () => {
    switch (agent.status) {
      case 'thinking':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800'
      case 'responding':
        return 'bg-blue-100 border-blue-300 text-blue-800'
      case 'error':
        return 'bg-red-100 border-red-300 text-red-800'
      default:
        return 'bg-green-100 border-green-300 text-green-800'
    }
  }

  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'client':
        return <User className='h-5 w-5' />
      case 'financial':
        return <CreditCard className='h-5 w-5' />
      case 'appointment':
        return <Calendar className='h-5 w-5' />
      default:
        return <Stethoscope className='h-5 w-5' />
    }
  }

  const formatLastActivity = (date?: Date) => {
    if (!date) return 'Nunca'

    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)

    if (minutes < 1) return 'Agora'
    if (minutes < 60) return `${minutes}min atrás`
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h atrás`
    return `${Math.floor(minutes / 1440)}d atrás`
  }

  return (
    <Card
      className={`transition-all cursor-pointer hover:shadow-md ${
        isActive ? 'ring-2 ring-blue-500 shadow-md' : ''
      }`}
      onClick={onClick}
      role='button'
      tabIndex={0}
      aria-label={`Selecionar assistente ${agent.name}`}
      aria-pressed={isActive}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.()
        }
      }}
    >
      <CardContent className='p-4'>
        <div className='flex items-center justify-between mb-3'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-gray-100 rounded-lg'>
              {getAgentIcon(agent.type)}
            </div>
            <div>
              <h3 className='font-semibold text-gray-900'>{agent.name}</h3>
              <p className='text-sm text-gray-600 capitalize'>{agent.type}</p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            {getStatusIcon()}
            <Badge className={getStatusColor()}>
              {agent.status === 'thinking' && 'Pensando'}
              {agent.status === 'responding' && 'Respondendo'}
              {agent.status === 'error' && 'Erro'}
              {agent.status === 'idle' && 'Pronto'}
            </Badge>
          </div>
        </div>

        <div className='flex items-center justify-between text-sm text-gray-500'>
          <span>{agent.messageCount} mensagens</span>
          <span>Última atividade: {formatLastActivity(agent.lastActivity)}</span>
        </div>
      </CardContent>
    </Card>
  )
}

// Compliance Controls Component
export const NeonProComplianceControls: React.FC<ComplianceControlProps> = ({
  onExportData,
  onClearData,
  onDataAccessRequest,
  showControls = false,
}) => {
  const [isVisible, setIsVisible] = useState(showControls)

  if (!isVisible) {
    return (
      <Button
        variant='outline'
        size='sm'
        onClick={() => setIsVisible(true)}
        className='text-xs'
      >
        <Shield className='h-3 w-3 mr-1' />
        Controles LGPD
      </Button>
    )
  }

  return (
    <Card className='border-yellow-200 bg-yellow-50'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-sm flex items-center gap-2'>
            <Shield className='h-4 w-4 text-yellow-600' />
            Controles de Conformidade LGPD
          </CardTitle>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setIsVisible(false)}
            className='h-6 w-6 p-0'
          >
            ×
          </Button>
        </div>
      </CardHeader>
      <CardContent className='space-y-3'>
        <Alert>
          <Shield className='h-4 w-4' />
          <AlertDescription className='text-xs'>
            Estes controles permitem gerenciar seus dados conforme a Lei Geral de Proteção de Dados
            (LGPD).
          </AlertDescription>
        </Alert>

        <div className='space-y-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={onExportData}
            className='w-full justify-start text-xs'
          >
            <Download className='h-3 w-3 mr-2' />
            Exportar meus dados
          </Button>

          <Button
            variant='outline'
            size='sm'
            onClick={onDataAccessRequest}
            className='w-full justify-start text-xs'
          >
            <Eye className='h-3 w-3 mr-2' />
            Solicitar acesso a dados
          </Button>

          <Button
            variant='destructive'
            size='sm'
            onClick={onClearData}
            className='w-full justify-start text-xs'
          >
            <Trash2 className='h-3 w-3 mr-2' />
            Limpar dados da conversa
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Patient Data Card Component
export const NeonProPatientDataCard: React.FC<PatientDataCardProps> = ({
  patient,
  showSensitiveData = false,
  onToggleSensitive,
}) => {
  const formatContact = (contact: string) => {
    if (showSensitiveData) return contact

    // Mask phone number
    if (contact.match(/\d/)) {
      return contact.replace(/\d(?=\d{4})/g, '*')
    }

    // Mask email
    if (contact.includes('@')) {
      const [username, domain] = contact.split('@')
      return `${username.substring(0, 2)}***@${domain}`
    }

    return contact
  }

  const getStatusColor = () => {
    switch (patient.status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'new':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = () => {
    switch (patient.status) {
      case 'active':
        return 'Ativo'
      case 'inactive':
        return 'Inativo'
      case 'new':
        return 'Novo'
      default:
        return 'Desconhecido'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle className='flex items-center gap-2'>
            <User className='h-5 w-5' />
            Dados do Paciente
          </CardTitle>
          <Button
            variant='ghost'
            size='sm'
            onClick={onToggleSensitive}
            className='text-xs'
          >
            {showSensitiveData
              ? <EyeOff className='h-3 w-3 mr-1' />
              : <Eye className='h-3 w-3 mr-1' />}
            {showSensitiveData ? 'Ocultar' : 'Mostrar'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div>
          <label className='text-sm font-medium text-gray-700'>Nome</label>
          <p className='text-gray-900'>{patient.name}</p>
        </div>

        <div>
          <label className='text-sm font-medium text-gray-700'>Contato</label>
          <div className='flex items-center gap-2'>
            {patient.contact.includes('@')
              ? <Mail className='h-4 w-4 text-gray-500' />
              : <Phone className='h-4 w-4 text-gray-500' />}
            <p className='text-gray-900'>{formatContact(patient.contact)}</p>
          </div>
        </div>

        {patient.lastVisit && (
          <div>
            <label className='text-sm font-medium text-gray-700'>Última Visita</label>
            <p className='text-gray-900'>
              {patient.lastVisit.toLocaleDateString('pt-BR')}
            </p>
          </div>
        )}

        <div>
          <label className='text-sm font-medium text-gray-700'>Status</label>
          <Badge className={getStatusColor()}>
            {getStatusLabel()}
          </Badge>
        </div>

        {patient.treatments && patient.treatments.length > 0 && (
          <div>
            <label className='text-sm font-medium text-gray-700'>Tratamentos</label>
            <div className='flex flex-wrap gap-1 mt-1'>
              {patient.treatments.map((treatment, index) => (
                <Badge key={index} variant='outline' className='text-xs'>
                  {treatment}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {!showSensitiveData && (
          <Alert>
            <Shield className='h-4 w-4' />
            <AlertDescription className='text-xs'>
              Alguns dados estão ocultos para proteger a privacidade do paciente conforme LGPD.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

// Appointment Card Component
export const NeonProAppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onAction,
}) => {
  const formatDateTime = (date: Date) => {
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusColor = () => {
    switch (appointment.status) {
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = () => {
    switch (appointment.status) {
      case 'scheduled':
        return 'Agendado'
      case 'confirmed':
        return 'Confirmado'
      case 'completed':
        return 'Concluído'
      case 'cancelled':
        return 'Cancelado'
      default:
        return 'Desconhecido'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle className='flex items-center gap-2'>
            <Calendar className='h-5 w-5' />
            Agendamento
          </CardTitle>
          <Badge className={getStatusColor()}>
            {getStatusLabel()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div>
          <label className='text-sm font-medium text-gray-700'>Paciente</label>
          <p className='text-gray-900'>{appointment.patientName}</p>
        </div>

        <div>
          <label className='text-sm font-medium text-gray-700'>Serviço</label>
          <p className='text-gray-900'>{appointment.service}</p>
        </div>

        <div>
          <label className='text-sm font-medium text-gray-700'>Data e Horário</label>
          <p className='text-gray-900'>{formatDateTime(appointment.dateTime)}</p>
        </div>

        <div>
          <label className='text-sm font-medium text-gray-700'>Profissional</label>
          <p className='text-gray-900'>{appointment.professional}</p>
        </div>

        <div>
          <label className='text-sm font-medium text-gray-700'>Duração</label>
          <p className='text-gray-900'>{appointment.duration} minutos</p>
        </div>

        {onAction && appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
          <div className='flex gap-2 pt-2'>
            {appointment.status === 'scheduled' && (
              <Button
                size='sm'
                onClick={() => onAction('confirm')}
                className='flex-1'
              >
                Confirmar
              </Button>
            )}
            <Button
              variant='outline'
              size='sm'
              onClick={() => onAction('reschedule')}
              className='flex-1'
            >
              Remarcar
            </Button>
            <Button
              variant='destructive'
              size='sm'
              onClick={() => onAction('cancel')}
              className='flex-1'
            >
              Cancelar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default NeonProMessage

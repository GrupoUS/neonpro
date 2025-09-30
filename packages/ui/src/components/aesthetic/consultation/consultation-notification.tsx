import React, { useState, useEffect } from 'react'
import { Alert, AlertTitle, AlertDescription } from '../../ui/alert'
import { Button } from '../../ui/button'
import { Badge } from '../../ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Sparkles, 
  Heart, 
  Star, 
  Volume2, 
  VolumeX,
  Phone,
  MessageCircle,
  CheckCircle
} from 'lucide-react'

// NeonPro Aesthetic Brand Colors
const NEONPRO_COLORS = {
  primary: '#AC9469',      // Golden Primary - Aesthetic Luxury
  deepBlue: '#112031',     // Healthcare Professional - Trust & Reliability
  accent: '#D2AA60',       // Gold Accent - Premium Services
  neutral: '#B4AC9C',      // Calming Light Beige
  background: '#D2D0C8',   // Soft Gray Background
  wellness: '#E8D5B7',     // Soft wellness tone
  luxury: '#B8860B',       // Gold luxury accent
  purpleAccent: '#9B7EBD', // Soft purple for elegance
}

export interface ConsultationNotificationProps {
  type: 'new_client' | 'consultation_request' | 'follow_up' | 'treatment_reminder' | 'special_offer' | 'appointment_confirmation' | 'vip_arrival' | 'aftercare_check'
  priority: 'low' | 'medium' | 'high' | 'vip'
  clientId?: string
  clientName?: string
  location?: string
  timestamp?: Date
  treatmentType?: string
  autoDismiss?: boolean
  onAcknowledge?: () => void
  onResolve?: () => void
  onContactClient?: () => void
  className?: string
}

export interface ConsultationNotificationData {
  id: string
  type: ConsultationNotificationProps['type']
  priority: ConsultationNotificationProps['priority']
  clientId?: string
  clientName?: string
  location?: string
  treatmentType?: string
  timestamp: Date
  acknowledged: boolean
  resolved: boolean
}

export const ConsultationNotification: React.FC<ConsultationNotificationProps> = ({
  type,
  priority,
  clientId,
  clientName,
  location,
  treatmentType,
  timestamp = new Date(),
  autoDismiss = false,
  onAcknowledge,
  onResolve,
  onContactClient,
  className = '',
}) => {
  const [isMuted, setIsMuted] = useState(false)
  const [isAcknowledged, setIsAcknowledged] = useState(false)
  const [isResolved, setIsResolved] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)

  // Aesthetic consultation type configuration with Brazilian Portuguese
  const consultationConfig = {
    new_client: {
      title: 'Novo Cliente VIP',
      description: 'Um novo cliente premium solicitou consulta',
      color: NEONPRO_COLORS.primary,
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-300',
      icon: <Star className="h-5 w-5" />,
      sound: 'premium-client.mp3',
      ariaLabel: 'Notificação de novo cliente VIP'
    },
    consultation_request: {
      title: 'Solicitação de Consulta',
      description: 'Cliente solicitando agendamento de consulta',
      color: NEONPRO_COLORS.deepBlue,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-300',
      icon: <Calendar className="h-5 w-5" />,
      sound: 'consultation-request.mp3',
      ariaLabel: 'Notificação de solicitação de consulta'
    },
    follow_up: {
      title: 'Acompanhamento Pós-Tratamento',
      description: 'Agendamento de acompanhamento necessário',
      color: '#059669',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-300',
      icon: <Heart className="h-5 w-5" />,
      sound: 'follow-up.mp3',
      ariaLabel: 'Notificação de acompanhamento'
    },
    treatment_reminder: {
      title: 'Lembrete de Tratamento',
      description: 'Lembrete de tratamento agendado',
      color: '#D97706',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-300',
      icon: <Clock className="h-5 w-5" />,
      sound: 'treatment-reminder.mp3',
      ariaLabel: 'Lembrete de tratamento'
    },
    special_offer: {
      title: 'Oferta Exclusiva',
      description: 'Promoção especial disponível',
      color: '#EC4899',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-300',
      icon: <Sparkles className="h-5 w-5" />,
      sound: 'special-offer.mp3',
      ariaLabel: 'Oferta especial'
    },
    appointment_confirmation: {
      title: 'Confirmação de Agendamento',
      description: 'Cliente confirmou presença',
      color: '#6366F1',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-300',
      icon: <CheckCircle className="h-5 w-5" />,
      sound: 'confirmation.mp3',
      ariaLabel: 'Confirmação de agendamento'
    },
    vip_arrival: {
      title: 'Chegada VIP',
      description: 'Cliente VIP acabou de chegar',
      color: NEONPRO_COLORS.luxury,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-400',
      icon: <Star className="h-5 w-5" />,
      sound: 'vip-arrival.mp3',
      ariaLabel: 'Chegada de cliente VIP'
    },
    aftercare_check: {
      title: 'Verificação Pós-Cuidado',
      description: 'Verificação de bem-estar do cliente',
      color: NEONPRO_COLORS.purpleAccent,
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-300',
      icon: <Heart className="h-5 w-5" />,
      sound: 'aftercare-check.mp3',
      ariaLabel: 'Verificação de pós-cuidado'
    }
  }

  // Priority configuration with aesthetic context
  const priorityConfig = {
    low: { 
      pulse: 4000, 
      interval: 15000,
      label: 'Baixa',
      badgeColor: 'secondary'
    },
    medium: { 
      pulse: 3000, 
      interval: 10000,
      label: 'Média',
      badgeColor: 'default'
    },
    high: { 
      pulse: 2000, 
      interval: 6000,
      label: 'Alta',
      badgeColor: 'default'
    },
    vip: { 
      pulse: 1500, 
      interval: 3000,
      label: 'VIP',
      badgeColor: 'default'
    }
  }

  const config = consultationConfig[type]
  const priorityCfg = priorityConfig[priority]

  // Timer for consultation duration
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isResolved) {
        setTimeElapsed(prev => prev + 1)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isResolved])

  // Gentle notification sound and subtle vibration for tablet use
  useEffect(() => {
    if (isResolved || isMuted) return

    const playNotificationSound = () => {
      // In a real implementation, this would play actual audio files
      console.log(`🔔 Playing aesthetic notification sound: ${config.sound}`)
    }

    const vibratePattern = () => {
      if ('vibrate' in navigator) {
        const pattern = priority === 'vip' 
          ? [80, 40, 80, 40, 80]  // Elegant VIP pattern
          : [60, 30, 60]           // Standard gentle pattern
        navigator.vibrate(pattern)
      }
    }

    // Initial notification
    playNotificationSound()
    vibratePattern()

    // Repeat based on priority
    const soundInterval = setInterval(() => {
      playNotificationSound()
      vibratePattern()
    }, priorityCfg.interval)

    return () => clearInterval(soundInterval)
  }, [priority, isResolved, isMuted, config.sound, priorityCfg.interval])

  // Auto-dismiss for low priority notifications
  useEffect(() => {
    if (autoDismiss && priority === 'low' && !isAcknowledged && timeElapsed > 30) {
      handleAcknowledge()
    }
  }, [autoDismiss, priority, isAcknowledged, timeElapsed])

  const handleAcknowledge = () => {
    setIsAcknowledged(true)
    onAcknowledge?.()
    
    // Stop vibration
    if ('vibrate' in navigator) {
      navigator.vibrate(0)
    }
  }

  const handleResolve = () => {
    setIsResolved(true)
    onResolve?.()
    
    // Stop vibration and sound
    if ('vibrate' in navigator) {
      navigator.vibrate(0)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (isResolved) return null

  return (
    <Alert 
      className={`border-2 ${config.borderColor} ${config.bgColor} ${
        priority === 'vip' ? 'animate-pulse shadow-lg' : 'shadow-sm'
      } ${className}`}
      role="alert"
      aria-label={config.ariaLabel}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div style={{ color: config.color }} className="flex-shrink-0">
            {config.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <AlertTitle 
                className="text-base font-semibold"
                style={{ color: config.color }}
              >
                {config.title}
              </AlertTitle>
              <Badge variant={priorityCfg.badgeColor as any} className="text-xs">
                {priorityCfg.label}
              </Badge>
              {priority === 'vip' && (
                <Badge variant="default" className="bg-yellow-500 text-white text-xs animate-pulse">
                  VIP
                </Badge>
              )}
            </div>
            
            <AlertDescription className="space-y-2">
              <p className="text-sm text-gray-700">{config.description}</p>
              
              <div className="flex items-center gap-4 text-sm text-gray-600">
                {clientName && (
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span className="font-medium">{clientName}</span>
                    {clientId && (
                      <span className="text-xs text-gray-500">(ID: {clientId})</span>
                    )}
                  </div>
                )}
                
                {location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{location}</span>
                  </div>
                )}
                
                {treatmentType && (
                  <div className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    <span>{treatmentType}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatTime(timeElapsed)}</span>
                </div>
              </div>
              
              <div className="text-xs text-gray-500">
                Notificação iniciada às {timestamp.toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </AlertDescription>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMuted(!isMuted)}
            className="h-8 w-8"
            aria-label={isMuted ? "Ativar sons de notificação" : "Desativar sons de notificação"}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          
          {onContactClient && (
            <Button
              variant="outline"
              size="sm"
              onClick={onContactClient}
              className="h-8 px-3 text-xs"
              aria-label="Entrar em contato com cliente"
            >
              <MessageCircle className="h-3 w-3 mr-1" />
              Contato
            </Button>
          )}
          
          {!isAcknowledged ? (
            <Button
              size="sm"
              onClick={handleAcknowledge}
              className="h-8 px-3 text-xs"
              style={{ backgroundColor: config.color, color: 'white' }}
              aria-label="Visualizar notificação"
            >
              Visualizar
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleResolve}
              className="h-8 px-3 text-xs bg-green-600 hover:bg-green-700 text-white"
              aria-label="Concluir notificação"
            >
              Concluído
            </Button>
          )}
        </div>
      </div>
    </Alert>
  )
}

// Aesthetic consultation notification manager for handling multiple notifications
export const ConsultationNotificationManager: React.FC<{
  className?: string
}> = ({ className = '' }) => {
  const [notifications, setNotifications] = useState<ConsultationNotificationData[]>([])

  const addNotification = (notification: Omit<ConsultationNotificationData, 'id' | 'timestamp' | 'acknowledged' | 'resolved'>) => {
    const newNotification: ConsultationNotificationData = {
      ...notification,
      id: `consultation-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      acknowledged: false,
      resolved: false,
    }
    setNotifications(prev => [...prev, newNotification])
  }

  const acknowledgeNotification = (id: string) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === id ? { ...notification, acknowledged: true } : notification
    ))
  }

  const resolveNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  // Demo function - remove in production
  const triggerDemoNotifications = () => {
    // VIP client arrival
    addNotification({
      type: 'vip_arrival',
      priority: 'vip',
      clientName: 'Maria Silva',
      clientId: 'C001',
      location: 'Sala VIP 01',
      treatmentType: 'Tratamento Facial Premium'
    })
    
    // New consultation request
    setTimeout(() => {
      addNotification({
        type: 'consultation_request',
        priority: 'medium',
        clientName: 'João Santos',
        clientId: 'C002',
        location: 'Recepção',
        treatmentType: 'Consulta Inicial'
      })
    }, 2000)
  }

  const activeVIPNotifications = notifications.filter(n => 
    !n.resolved && !n.acknowledged && n.priority === 'vip'
  )

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-gray-800">
              Sistema de Notificações Estéticas
            </CardTitle>
            <p className="text-gray-600 text-sm mt-1">
              Gerenciamento de notificações para clínicas estéticas premium
            </p>
          </div>
          <div className="flex items-center gap-2">
            {activeVIPNotifications.length > 0 && (
              <Badge variant="default" className="bg-yellow-500 text-white animate-pulse">
                {activeVIPNotifications.length} VIP Ativo(s)
              </Badge>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={triggerDemoNotifications}
              className="text-xs"
            >
              Demo
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Heart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>Nenhuma notificação ativa</p>
              <p className="text-sm text-gray-400 mt-1">
                As notificações aparecerão aqui quando clientes interagirem com a clínica
              </p>
            </div>
          ) : (
            notifications.map(notification => (
              <ConsultationNotification
                key={notification.id}
                type={notification.type}
                priority={notification.priority}
                clientId={notification.clientId}
                clientName={notification.clientName}
                location={notification.location}
                treatmentType={notification.treatmentType}
                timestamp={notification.timestamp}
                onAcknowledge={() => acknowledgeNotification(notification.id)}
                onResolve={() => resolveNotification(notification.id)}
                onContactClient={() => {
                  // In a real implementation, this would open a communication interface
                  console.log(`Contacting client: ${notification.clientName}`)
                }}
              />
            ))
          )}
        </div>
        
        {notifications.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{notifications.length} notificação(ões) ativa(s)</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setNotifications([])}
                className="text-xs"
              >
                Limpar Todas
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ConsultationNotification
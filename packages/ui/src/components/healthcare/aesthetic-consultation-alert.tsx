import React, { useState, useEffect } from 'react'
import { Alert, AlertTitle, AlertDescription } from '../ui/alert'
import { Button } from '../ui/button'
import { AlertTriangle, MapPin, Clock, User, Volume2, VolumeX, Calendar, Sparkles } from 'lucide-react'

interface AestheticConsultationAlertProps {
  type: 'new_client' | 'consultation_request' | 'follow_up' | 'treatment_reminder' | 'special_offer' | 'appointment_confirmation'
  priority: 'low' | 'medium' | 'high' | 'vip'
  clientId?: string | undefined
  clientName?: string | undefined
  location?: string | undefined
  timestamp?: Date
  autoDismiss?: boolean
  onAcknowledge?: () => void
  onResolve?: () => void
}

interface AestheticConsultationAlertData {
  id: string
  type: AestheticConsultationAlertProps['type']
  priority: AestheticConsultationAlertProps['priority']
  clientId?: string
  clientName?: string
  location?: string
  timestamp: Date
  acknowledged: boolean
  resolved: boolean
}

export const AestheticConsultationAlert: React.FC<AestheticConsultationAlertProps> = ({
  type,
  priority,
  clientId,
  clientName,
  location,
  timestamp = new Date(),
  autoDismiss = false,
  onAcknowledge,
  onResolve,
}) => {
  const [isMuted, setIsMuted] = useState(false)
  const [isAcknowledged, setIsAcknowledged] = useState(false)
  const [isResolved, setIsResolved] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)

  // Aesthetic consultation type configuration
  const consultationConfig = {
    new_client: {
      title: 'Novo Cliente',
      color: 'text-purple-700',
      icon: <Sparkles className="h-5 w-5" />,
      sound: 'new-client.mp3',
    },
    consultation_request: {
      title: 'Solicitação de Consulta',
      color: 'text-blue-700',
      icon: <Calendar className="h-5 w-5" />,
      sound: 'consultation-request.mp3',
    },
    follow_up: {
      title: 'Acompanhamento',
      color: 'text-green-700',
      icon: <Calendar className="h-5 w-5" />,
      sound: 'follow-up.mp3',
    },
    treatment_reminder: {
      title: 'Lembrete de Tratamento',
      color: 'text-yellow-700',
      icon: <Clock className="h-5 w-5" />,
      sound: 'treatment-reminder.mp3',
    },
    special_offer: {
      title: 'Oferta Especial',
      color: 'text-pink-700',
      icon: <Sparkles className="h-5 w-5" />,
      sound: 'special-offer.mp3',
    },
    appointment_confirmation: {
      title: 'Confirmação de Agendamento',
      color: 'text-indigo-700',
      icon: <Calendar className="h-5 w-5" />,
      sound: 'appointment-confirmation.mp3',
    },
  }

  // Priority configuration
  const priorityConfig = {
    low: { pulse: 3000, interval: 10000 },
    medium: { pulse: 2000, interval: 6000 },
    high: { pulse: 1500, interval: 4000 },
    vip: { pulse: 1000, interval: 2000 },
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

  // Consultation notification sound and gentle vibration
  useEffect(() => {
    if (isResolved || isMuted) return

    const playNotificationSound = () => {
      // In a real implementation, this would play actual audio files
      console.log(`🔔 Playing notification sound: ${config.sound}`)
    }

    const vibratePattern = () => {
      if ('vibrate' in navigator) {
        const pattern = priority === 'vip' 
          ? [100, 50, 100]
          : [80, 40, 80]
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

  // Auto-dismiss for low priority
  useEffect(() => {
    if (autoDismiss && priority === 'low' && !isAcknowledged && timeElapsed > 20) {
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
      variant="default" 
      className={`border-2 ${priority === 'vip' ? 'border-purple-600 bg-purple-50' : 'border-blue-200 bg-blue-50'} ${priority === 'vip' ? 'animate-pulse' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={config.color}>
            {config.icon}
          </div>
          <div className="flex-1">
            <AlertTitle className={config.color}>
              {config.title} - {priority.toUpperCase()}
            </AlertTitle>
            <AlertDescription className="space-y-2">
              <div className="flex items-center gap-4 text-sm">
                {clientName && (
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{clientName}</span>
                    {clientId && <span className="text-xs text-gray-500">(ID: {clientId})</span>}
                  </div>
                )}
                {location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{location}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatTime(timeElapsed)}</span>
                </div>
              </div>
              <div className="text-xs text-gray-600">
                Notificação iniciada às {timestamp.toLocaleTimeString('pt-BR')}
              </div>
            </AlertDescription>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMuted(!isMuted)}
            className="h-8 w-8"
            aria-label={isMuted ? "Ativar sons" : "Desativar sons"}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          
          {!isAcknowledged && (
            <Button
              size="sm"
              onClick={handleAcknowledge}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Visualizar
            </Button>
          )}
          
          {isAcknowledged && (
            <Button
              size="sm"
              onClick={handleResolve}
              className="bg-green-600 hover:bg-green-700"
            >
              Concluído
            </Button>
          )}
        </div>
      </div>
    </Alert>
  )
}

// Aesthetic consultation alert manager for handling multiple notifications
export const AestheticConsultationAlertManager: React.FC = () => {
  const [alerts, setAlerts] = useState<AestheticConsultationAlertData[]>([])

  const addAlert = (alert: Omit<AestheticConsultationAlertData, 'id' | 'timestamp' | 'acknowledged' | 'resolved'>) => {
    const newAlert: AestheticConsultationAlertData = {
      ...alert,
      id: `consultation-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      acknowledged: false,
      resolved: false,
    }
    setAlerts(prev => [...prev, newAlert])
  }

  const acknowledgeAlert = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, acknowledged: true } : alert
    ))
  }

  const resolveAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id))
  }

  // Demo function - remove in production
  const triggerDemoAlert = () => {
    addAlert({
      type: 'new_client',
      priority: 'vip',
      clientName: 'Maria Silva',
      clientId: 'C12345',
      location: 'Sala de Consulta',
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Sistema de Notificações</h3>
        <Button variant="outline" size="sm" onClick={triggerDemoAlert}>
          Demo
        </Button>
      </div>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            Nenhuma notificação ativa
          </div>
        ) : (
          alerts.map(alert => (
            <AestheticConsultationAlert
              key={alert.id}
              type={alert.type}
              priority={alert.priority}
              clientId={alert.clientId || undefined}
              clientName={alert.clientName || undefined}
              location={alert.location || undefined}
              timestamp={alert.timestamp}
              onAcknowledge={() => acknowledgeAlert(alert.id)}
              onResolve={() => resolveAlert(alert.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}

export type { AestheticConsultationAlertProps }
export default AestheticConsultationAlert
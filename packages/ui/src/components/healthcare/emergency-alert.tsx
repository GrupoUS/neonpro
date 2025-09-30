import React, { useState, useEffect } from 'react'
import { Alert, AlertTitle, AlertDescription } from '../ui/alert'
import { Button } from '../ui/button'
import { EmergencyButton } from '../ui/mobile-healthcare-button'
import { AlertTriangle, MapPin, Clock, User, Volume2, VolumeX } from 'lucide-react'

interface EmergencyAlertProps {
  type: 'cardiac' | 'respiratory' | 'allergic' | 'trauma' | 'seizure' | 'other'
  severity: 'low' | 'medium' | 'high' | 'critical'
  patientId?: string | undefined
  patientName?: string | undefined
  location?: string | undefined
  timestamp?: Date
  autoDismiss?: boolean
  onAcknowledge?: () => void
  onResolve?: () => void
}

interface EmergencyAlertData {
  id: string
  type: EmergencyAlertProps['type']
  severity: EmergencyAlertProps['severity']
  patientId?: string
  patientName?: string
  location?: string
  timestamp: Date
  acknowledged: boolean
  resolved: boolean
}

export const EmergencyAlert: React.FC<EmergencyAlertProps> = ({
  type,
  severity,
  patientId,
  patientName,
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

  // Emergency type configuration
  const emergencyConfig = {
    cardiac: {
      title: 'Cardiac Emergency',
      color: 'text-red-700',
      icon: <AlertTriangle className="h-5 w-5" />,
      sound: 'cardiac-emergency.mp3',
    },
    respiratory: {
      title: 'Respiratory Emergency',
      color: 'text-blue-700',
      icon: <AlertTriangle className="h-5 w-5" />,
      sound: 'respiratory-emergency.mp3',
    },
    allergic: {
      title: 'Allergic Reaction',
      color: 'text-yellow-700',
      icon: <AlertTriangle className="h-5 w-5" />,
      sound: 'allergic-emergency.mp3',
    },
    trauma: {
      title: 'Trauma Emergency',
      color: 'text-purple-700',
      icon: <AlertTriangle className="h-5 w-5" />,
      sound: 'trauma-emergency.mp3',
    },
    seizure: {
      title: 'Seizure Emergency',
      color: 'text-orange-700',
      icon: <AlertTriangle className="h-5 w-5" />,
      sound: 'seizure-emergency.mp3',
    },
    other: {
      title: 'Emergency Alert',
      color: 'text-gray-700',
      icon: <AlertTriangle className="h-5 w-5" />,
      sound: 'general-emergency.mp3',
    },
  }

  // Severity configuration
  const severityConfig = {
    low: { pulse: 2000, interval: 5000 },
    medium: { pulse: 1500, interval: 3000 },
    high: { pulse: 1000, interval: 2000 },
    critical: { pulse: 500, interval: 1000 },
  }

  const config = emergencyConfig[type]
  const severityCfg = severityConfig[severity]

  // Timer for emergency duration
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isResolved) {
        setTimeElapsed(prev => prev + 1)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isResolved])

  // Emergency sound and vibration
  useEffect(() => {
    if (isResolved || isMuted) return

    const playEmergencySound = () => {
      // In a real implementation, this would play actual audio files
      console.log(`🔊 Playing emergency sound: ${config.sound}`)
    }

    const vibratePattern = () => {
      if ('vibrate' in navigator) {
        const pattern = severity === 'critical' 
          ? [200, 100, 200, 100, 200]
          : [300, 200, 300]
        navigator.vibrate(pattern)
      }
    }

    // Initial alert
    playEmergencySound()
    vibratePattern()

    // Repeat based on severity
    const soundInterval = setInterval(() => {
      playEmergencySound()
      vibratePattern()
    }, severityCfg.interval)

    return () => clearInterval(soundInterval)
  }, [severity, isResolved, isMuted, config.sound, severityCfg.interval])

  // Auto-dismiss for low severity
  useEffect(() => {
    if (autoDismiss && severity === 'low' && !isAcknowledged && timeElapsed > 30) {
      handleAcknowledge()
    }
  }, [autoDismiss, severity, isAcknowledged, timeElapsed])

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
      variant="emergency" 
      emergency 
      className="border-4 border-red-600 bg-red-50 animate-pulse"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={config.color}>
            {config.icon}
          </div>
          <div className="flex-1">
            <AlertTitle className={config.color}>
              {config.title} - {severity.toUpperCase()}
            </AlertTitle>
            <AlertDescription className="space-y-2">
              <div className="flex items-center gap-4 text-sm">
                {patientName && (
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{patientName}</span>
                    {patientId && <span className="text-xs text-gray-500">(ID: {patientId})</span>}
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
                Alert started at {timestamp.toLocaleTimeString()}
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
            aria-label={isMuted ? "Unmute emergency sounds" : "Mute emergency sounds"}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          
          {!isAcknowledged && (
            <EmergencyButton
              size="sm"
              onClick={handleAcknowledge}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Acknowledge
            </EmergencyButton>
          )}
          
          {isAcknowledged && (
            <EmergencyButton
              size="sm"
              onClick={handleResolve}
              className="bg-green-600 hover:bg-green-700"
            >
              Resolve
            </EmergencyButton>
          )}
        </div>
      </div>
    </Alert>
  )
}

// Emergency alert manager for handling multiple alerts
export const EmergencyAlertManager: React.FC = () => {
  const [alerts, setAlerts] = useState<EmergencyAlertData[]>([])

  const addAlert = (alert: Omit<EmergencyAlertData, 'id' | 'timestamp' | 'acknowledged' | 'resolved'>) => {
    const newAlert: EmergencyAlertData = {
      ...alert,
      id: `emergency-${Date.now()}-${Math.random()}`,
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
      type: 'cardiac',
      severity: 'critical',
      patientName: 'John Doe',
      patientId: 'P12345',
      location: 'Room 101',
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Emergency Alert System</h3>
        <Button variant="outline" size="sm" onClick={triggerDemoAlert}>
          Demo Alert
        </Button>
      </div>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No active emergency alerts
          </div>
        ) : (
          alerts.map(alert => (
            <EmergencyAlert
              key={alert.id}
              type={alert.type}
              severity={alert.severity}
              patientId={alert.patientId || undefined}
              patientName={alert.patientName || undefined}
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

export type { EmergencyAlertProps }
export default EmergencyAlert
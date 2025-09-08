'use client'

import { Badge, } from '@/components/ui/badge'
import { Button, } from '@/components/ui/button'
import { cn, } from '@/lib/utils'
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
  MapPin,
  // Phone,
  Shield,
  Zap,
} from 'lucide-react'
import React, { useEffect, useState, } from 'react'

// SAMU Integration Types
export interface SAMUCallData {
  emergencyType: 'life-threatening' | 'urgent' | 'non-urgent'
  patientInfo: {
    name: string
    age: number
    gender: 'M' | 'F' | 'O'
    consciousness: 'conscious' | 'unconscious' | 'semi-conscious'
    breathing: 'normal' | 'difficulty' | 'not-breathing'
    pulse: 'normal' | 'weak' | 'strong' | 'absent'
  }
  location: {
    address: string
    coordinates?: {
      lat: number
      lng: number
    }
    landmarks: string
    accessInstructions: string
  }
  symptoms: string[]
  allergies?: string[]
  currentMedications?: string[]
  callerInfo: {
    name: string
    phone: string
    relationship: string
  }
}

export interface SAMUDialButtonProps {
  emergencyData?: Partial<SAMUCallData>
  emergencyLevel: 'life-threatening' | 'urgent' | 'non-urgent'
  onCallInitiated?: (callData: SAMUCallData,) => void
  onCallCompleted?: (callId: string,) => void
  disabled?: boolean
  size?: 'sm' | 'default' | 'lg'
  showCountdown?: boolean
  className?: string
} // Emergency Level Configurations
const getEmergencyConfig = (level: SAMUCallData['emergencyType'],) => {
  switch (level) {
    case 'life-threatening':
      return {
        color: 'bg-red-600 hover:bg-red-700 focus:ring-red-500 border-red-500',
        text: 'SAMU 192 - EMERGÊNCIA',
        icon: Zap,
        priority: 'RISCO DE VIDA',
        animate: 'animate-pulse',
        countdown: 0, // Immediate
        description: 'Situação crítica - Resposta imediata',
      }
    case 'urgent':
      return {
        color: 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500 border-orange-500',
        text: 'SAMU 192 - URGENTE',
        icon: AlertTriangle,
        priority: 'URGENTE',
        animate: '',
        countdown: 3, // 3 second delay
        description: 'Situação urgente - Resposta rápida',
      }
    case 'non-urgent':
      return {
        color: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 border-blue-500',
        text: 'SAMU 192 - SUPORTE',
        icon: Shield,
        priority: 'SUPORTE',
        animate: '',
        countdown: 5, // 5 second delay
        description: 'Orientação médica - Resposta normal',
      }
  }
}

export function SAMUDialButton({
  emergencyData,
  emergencyLevel,
  onCallInitiated,
  onCallCompleted,
  disabled = false,
  size = 'default',
  showCountdown = true,
  className,
}: SAMUDialButtonProps,) {
  const [callState, setCallState,] = useState<
    'idle' | 'preparing' | 'calling' | 'connected' | 'completed'
  >('idle',)
  const [countdown, setCountdown,] = useState<number>(0,)
  const [location, setLocation,] = useState<GeolocationPosition | null>(null,)
  const [locationError, setLocationError,] = useState<string | null>(null,)

  const config = getEmergencyConfig(emergencyLevel,)
  const IconComponent = config.icon // Get current location on mount for emergency calls
  useEffect(() => {
    if (emergencyLevel === 'life-threatening') {
      navigator.geolocation.getCurrentPosition(
        (position,) => {
          setLocation(position,)
          setLocationError(null,)
        },
        (error,) => {
          setLocationError(error.message,)
          console.error('Location error:', error,)
        },
        {
          enableHighAccuracy: true,
          timeout: 10_000,
          maximumAge: 300_000, // 5 minutes
        },
      )
    }
  }, [emergencyLevel,],)

  // Countdown effect
  useEffect(() => {
    if (callState === 'preparing' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1,)
      }, 1000,)
      return () => clearTimeout(timer,)
    } else if (callState === 'preparing' && countdown === 0) {
      handleActualCall()
    }
  }, [callState, countdown,],)

  const handleCallClick = async () => {
    if (disabled || callState !== 'idle') {
      return
    }

    // For life-threatening emergencies, call immediately
    if (emergencyLevel === 'life-threatening') {
      handleActualCall()
      return
    }

    // For others, start countdown
    setCallState('preparing',)
    setCountdown(config.countdown,)
  }

  const handleActualCall = async () => {
    setCallState('calling',)

    // Prepare call data
    const callData: SAMUCallData = {
      emergencyType: emergencyLevel,
      patientInfo: emergencyData?.patientInfo || {
        name: 'Não informado',
        age: 0,
        gender: 'O',
        consciousness: 'conscious',
        breathing: 'normal',
        pulse: 'normal',
      },
      location: {
        address: emergencyData?.location?.address || 'Endereço não disponível',
        coordinates: location
          ? {
            lat: location.coords.latitude,
            lng: location.coords.longitude,
          }
          : emergencyData?.location?.coordinates,
        landmarks: emergencyData?.location?.landmarks || '',
        accessInstructions: emergencyData?.location?.accessInstructions || '',
      },
      symptoms: emergencyData?.symptoms || [],
      allergies: emergencyData?.allergies || [],
      currentMedications: emergencyData?.currentMedications || [],
      callerInfo: emergencyData?.callerInfo || {
        name: 'Profissional de saúde',
        phone: 'Não informado',
        relationship: 'Médico',
      },
    }

    // Callback for call initiated
    onCallInitiated?.(callData,)

    // Simulate call process
    setTimeout(() => {
      setCallState('connected',)

      // Generate call ID and complete
      const callId = `SAMU-${Date.now()}-${emergencyLevel}`
      setTimeout(() => {
        setCallState('completed',)
        onCallCompleted?.(callId,)

        // Reset after completion
        setTimeout(() => {
          setCallState('idle',)
        }, 3000,)
      }, 2000,)
    }, 1500,)
  }

  const cancelCall = () => {
    setCallState('idle',)
    setCountdown(0,)
  }
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-8 px-3 text-sm'
      case 'lg':
        return 'h-12 px-6 text-lg font-bold'
      default:
        return 'h-10 px-4'
    }
  }

  if (callState === 'completed') {
    return (
      <Button
        variant="outline"
        className={cn(
          'border-green-500 bg-green-50 text-green-700 hover:bg-green-100',
          getSizeClasses(),
          className,
        )}
        disabled
        aria-label="Chamada SAMU concluída com sucesso"
      >
        <CheckCircle className="h-4 w-4 mr-2" aria-hidden="true" />
        SAMU Acionado
      </Button>
    )
  }

  if (callState === 'calling' || callState === 'connected') {
    return (
      <Button
        variant="destructive"
        className={cn(
          config.color,
          'relative overflow-hidden',
          getSizeClasses(),
          className,
        )}
        disabled
        aria-label={`${callState === 'calling' ? 'Conectando' : 'Conectado'} com SAMU 192`}
      >
        <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
        {callState === 'calling' ? 'Conectando...' : 'SAMU Online'}

        {/* Pulse animation for connected state */}
        {callState === 'connected' && (
          <div className="absolute inset-0 bg-white/20 animate-pulse rounded" />
        )}
      </Button>
    )
  }

  if (callState === 'preparing') {
    return (
      <div className="flex flex-col items-center gap-2">
        <Button
          onClick={cancelCall}
          variant="destructive"
          className={cn(config.color, 'relative', getSizeClasses(), className,)}
          aria-label={`Cancelar chamada SAMU - ${countdown} segundos restantes`}
        >
          <IconComponent className="h-4 w-4 mr-2" aria-hidden="true" />
          Cancelar ({countdown}s)
        </Button>
        {showCountdown && (
          <div className="text-xs text-muted-foreground text-center">
            Chamada será realizada em {countdown} segundos...
          </div>
        )}
      </div>
    )
  }
  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        onClick={handleCallClick}
        variant="destructive"
        className={cn(
          config.color,
          config.animate,
          'font-bold shadow-lg transition-all duration-200 hover:shadow-xl border-2',
          'focus:ring-4 focus:ring-offset-2',
          getSizeClasses(),
          disabled && 'opacity-50 cursor-not-allowed',
          className,
        )}
        disabled={disabled}
        aria-label={`Ligar para ${config.text} - ${config.description}`}
      >
        <IconComponent
          className={cn(
            'mr-2',
            size === 'lg' ? 'h-6 w-6' : 'h-4 w-4',
            config.animate,
          )}
          aria-hidden="true"
        />
        {config.text}
      </Button>

      {/* Emergency Info Display */}
      <div className="flex flex-col items-center gap-1">
        <Badge
          className={cn(
            'text-xs',
            emergencyLevel === 'life-threatening'
              && 'bg-red-600 text-white animate-pulse',
            emergencyLevel === 'urgent' && 'bg-orange-600 text-white',
            emergencyLevel === 'non-urgent' && 'bg-blue-600 text-white',
          )}
        >
          {config.priority}
        </Badge>

        <div className="text-xs text-muted-foreground text-center max-w-48">
          {config.description}
        </div>

        {/* Location Status */}
        {emergencyLevel === 'life-threatening' && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" aria-hidden="true" />
            {location
              ? <span className="text-green-600">Localização obtida</span>
              : locationError
              ? <span className="text-orange-600">Localização indisponível</span>
              : <span>Obtendo localização...</span>}
          </div>
        )}

        {/* Countdown info for non-life-threatening */}
        {emergencyLevel !== 'life-threatening' && showCountdown && (
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" aria-hidden="true" />
            Confirmação em {config.countdown}s
          </div>
        )}
      </div>
    </div>
  )
}

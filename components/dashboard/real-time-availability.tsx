'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Clock, 
  Wifi, 
  WifiOff, 
  Calendar,
  CheckCircle,
  XCircle,
  Users,
  Activity
} from 'lucide-react'
import { format } from 'date-fns'
import { pt } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { useAvailabilityManager } from '@/hooks/use-availability-manager'
import type { TimeSlot } from '@/hooks/use-realtime-availability'

interface RealTimeAvailabilityProps {
  professionalId?: string
  serviceId?: string
  selectedDate?: Date
  onSlotSelect?: (slot: TimeSlot) => void
  className?: string
}

export function RealTimeAvailability({
  professionalId,
  serviceId,
  selectedDate,
  onSlotSelect,
  className
}: RealTimeAvailabilityProps) {
  const {
    timeSlots,
    groupedSlots,
    selectedSlot,
    isConnected,
    isLoading,
    error,
    availability,
    updateFilters,
    selectSlot,
    isSlotBookable
  } = useAvailabilityManager()

  // Atualizar filtros quando props mudarem
  useEffect(() => {
    updateFilters({
      professionalId,
      serviceId,
      date: selectedDate
    })
  }, [professionalId, serviceId, selectedDate, updateFilters])

  const handleSlotClick = (slot: TimeSlot) => {
    selectSlot(slot)
    onSlotSelect?.(slot)
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Disponibilidade em Tempo Real
              </CardTitle>
              <CardDescription>
                Carregando horários disponíveis...
              </CardDescription>
            </div>
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex gap-2">
              {[...Array(4)].map((_, j) => (
                <Skeleton key={j} className="h-12 w-20" />
              ))}
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <XCircle className="h-5 w-5" />
            Erro de Conectividade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Disponibilidade em Tempo Real
              {isConnected ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
            </CardTitle>
            <CardDescription>
              {isConnected 
                ? 'Atualizações automáticas ativadas' 
                : 'Reconectando...'
              }
            </CardDescription>
          </div>
          
          {/* Indicadores de status */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <Activity className="h-3 w-3 mr-1" />
              {availability.available} disponíveis
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <Users className="h-3 w-3 mr-1" />
              {availability.booked} ocupados
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {Object.keys(groupedSlots).length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Nenhum horário encontrado para os filtros selecionados
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedSlots).map(([date, slots]) => (
              <div key={date}>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4" />
                  <h3 className="font-medium">
                    {format(new Date(date + 'T00:00:00'), 'EEEE, dd/MM/yyyy', { locale: pt })}
                  </h3>
                  <Badge variant="outline" className="ml-auto text-xs">
                    {slots.filter(slot => slot.is_available).length} disponíveis
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {slots.map((slot) => {
                    const isSelected = selectedSlot?.id === slot.id
                    const isBookable = isSlotBookable(slot)
                    
                    return (
                      <Button
                        key={slot.id}
                        variant={isSelected ? 'default' : slot.is_available ? 'outline' : 'ghost'}
                        size="sm"
                        className={cn(
                          'h-12 flex flex-col items-center justify-center text-xs',
                          !slot.is_available && 'opacity-50 cursor-not-allowed',
                          !isBookable && slot.is_available && 'opacity-60',
                          isSelected && 'ring-2 ring-primary ring-offset-1'
                        )}
                        disabled={!slot.is_available || !isBookable}
                        onClick={() => isBookable && handleSlotClick(slot)}
                      >
                        <span className="font-medium">
                          {format(new Date(`2000-01-01T${slot.start_time}`), 'HH:mm')}
                        </span>
                        <span className="text-[10px] opacity-75">
                          {slot.is_available ? 'Livre' : 'Ocupado'}
                        </span>
                        {isSelected && (
                          <CheckCircle className="h-3 w-3 absolute -top-1 -right-1 text-primary" />
                        )}
                      </Button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Resumo de disponibilidade */}
        {availability.total > 0 && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span>Taxa de disponibilidade:</span>
              <span className="font-medium">
                {availability.availabilityRate}%
              </span>
            </div>
            <div className="w-full bg-background rounded-full h-2 mt-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${availability.availabilityRate}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
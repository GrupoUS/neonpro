'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import { useTranslation } from '@/app/lib/i18n/use-translation';
import type { AvailableTimeSlot } from '@/app/types/appointments';
import { RealTimeAvailability } from '@/components/dashboard/real-time-availability';
import { BookingConflictPrevention } from '@/components/dashboard/booking-conflict-prevention';
import { useAvailabilityManager } from '@/hooks/use-availability-manager';
import type { TimeSlot } from '@/hooks/use-realtime-availability';
import { format } from 'date-fns';

interface TimeSlotPickerProps {
  serviceId?: string;
  professionalId?: string;
  selectedTimeSlot?: AvailableTimeSlot;
  onTimeSlotSelect: (timeSlot: AvailableTimeSlot) => void;
  isLoading: boolean;
  patientId: string;
}

export default function TimeSlotPicker({
  serviceId,
  professionalId,
  selectedTimeSlot,
  onTimeSlotSelect,
  isLoading,
  patientId
}: TimeSlotPickerProps) {
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedRealtimeSlot, setSelectedRealtimeSlot] = useState<TimeSlot | null>(null);

  // Real-time availability manager with filters
  const availabilityManager = useAvailabilityManager();

  // Update filters when props change
  useEffect(() => {
    availabilityManager.updateFilters({
      professionalId,
      serviceId,
      date: selectedDate,
      onlyAvailable: true
    });
  }, [professionalId, serviceId, selectedDate, availabilityManager]);

  // Convert realtime slot to legacy format for compatibility
  const convertRealtimeSlot = (slot: TimeSlot): AvailableTimeSlot => {
    return {
      id: slot.id,
      professional_id: slot.professional_id,
      professional_name: 'Professional', // Will be populated from relations
      specialty: 'specialist',
      start_time: `${slot.date}T${slot.start_time}Z`,
      end_time: `${slot.date}T${slot.end_time}Z`,
      duration_minutes: 60 // Default duration
    };
  };

  // Handle slot selection from real-time component
  const handleRealtimeSlotSelect = (slot: TimeSlot) => {
    setSelectedRealtimeSlot(slot);
    const legacySlot = convertRealtimeSlot(slot);
    onTimeSlotSelect(legacySlot);
  };

  // Format time for display
  const formatTime = (time: string) => {
    try {
      return format(new Date(`2000-01-01T${time}`), 'HH:mm');
    } catch {
      return time;
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t('booking.steps.time.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Date picker skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-64 w-full" />
            </div>
            
            {/* Time slots skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-6 w-40" />
              <div className="grid grid-cols-2 gap-2">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {t('booking.steps.time.title')}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Date Selection */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              {t('booking.date.title')}
            </h3>
            
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date() || date.getDay() === 0} // Disable past dates and Sundays
              className="rounded-md border"
            />
            
            {selectedDate && (
              <Badge variant="outline" className="mt-2">
                {format(selectedDate, 'EEEE, dd/MM/yyyy')}
              </Badge>
            )}
          </div>

          {/* Real-time Availability Display */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">
              {t('booking.availability.title')}
            </h3>
            
            <RealTimeAvailability
              professionalId={professionalId}
              serviceId={serviceId}
              selectedDate={selectedDate}
              onSlotSelect={handleRealtimeSlotSelect}
              className="h-fit"
            />
          </div>
        </div>

        {/* Conflict Prevention */}
        {selectedRealtimeSlot && (
          <BookingConflictPrevention
            selectedSlot={selectedRealtimeSlot}
            patientId={patientId}
            onConflictResolved={() => setSelectedRealtimeSlot(null)}
          />
        )}

        {/* Selected Slot Summary */}
        {selectedTimeSlot && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-primary/10 border border-primary/20 rounded-lg"
          >
            <h4 className="font-medium text-primary mb-2">
              {t('booking.steps.time.selected_slot')}
            </h4>
            <div className="flex items-center gap-4 text-sm">
              <Badge variant="default">
                {format(new Date(selectedTimeSlot.start_time), 'dd/MM/yyyy')}
              </Badge>
              <span>
                {format(new Date(selectedTimeSlot.start_time), 'HH:mm')} às {format(new Date(selectedTimeSlot.end_time), 'HH:mm')}
              </span>
            </div>
          </motion.div>
        )}

        {/* Availability Stats */}
        {!availabilityManager.isLoading && availabilityManager.availability.total > 0 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground p-3 bg-muted rounded-lg">
            <span>Taxa de disponibilidade:</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {availabilityManager.availability.availabilityRate}%
              </span>
              <Badge variant={availabilityManager.availability.availabilityRate > 50 ? 'default' : 'secondary'}>
                {availabilityManager.availability.available} disponíveis
              </Badge>
            </div>
          </div>
        )}

        {/* No slots available message */}
        {!availabilityManager.isLoading && 
         availabilityManager.timeSlots.length === 0 && 
         selectedDate && (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">
              {t('booking.time.no_slots_available')}
            </p>
            <p className="text-xs mt-1">
              Tente selecionar outra data ou profissional
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
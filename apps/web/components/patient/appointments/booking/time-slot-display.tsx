'use client';

import {
  addDays,
  endOfDay,
  format,
  isToday,
  isTomorrow,
  startOfDay,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertCircle, Calendar, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/app/utils/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

type TimeSlot = {
  datetime: string;
  is_available: boolean;
  professional_id?: string;
  professional_name?: string;
};

type AvailableSlot = {
  date: string;
  slots: TimeSlot[];
};

type TimeSlotDisplayProps = {
  serviceId: string;
  selectedSlot: TimeSlot | null;
  onSlotSelect: (slot: TimeSlot) => void;
  professionalId?: string;
  className?: string;
};

export function TimeSlotDisplay({
  serviceId,
  selectedSlot,
  onSlotSelect,
  professionalId,
  className = '',
}: TimeSlotDisplayProps) {
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), 'yyyy-MM-dd'),
  );

  useEffect(() => {
    if (serviceId) {
      fetchAvailableSlots();
    }
  }, [serviceId, fetchAvailableSlots]);

  const fetchAvailableSlots = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      // Generate date range for next 30 days
      const startDate = startOfDay(new Date(selectedDate));
      const endDate = endOfDay(addDays(startDate, 6)); // Show 7 days at a time

      const { data, error: fetchError } = await supabase.rpc(
        'get_patient_available_slots',
        {
          p_service_id: serviceId,
          p_professional_id: professionalId || null,
          p_start_date: startDate.toISOString(),
          p_end_date: endDate.toISOString(),
        },
      );

      if (fetchError) {
        throw fetchError;
      }

      // Group slots by date
      const groupedSlots: Record<string, TimeSlot[]> = {};

      data.forEach((slot: any) => {
        const date = format(new Date(slot.datetime), 'yyyy-MM-dd');
        if (!groupedSlots[date]) {
          groupedSlots[date] = [];
        }
        groupedSlots[date].push({
          datetime: slot.datetime,
          is_available: slot.is_available,
          professional_id: slot.professional_id,
          professional_name: slot.professional_name,
        });
      });

      // Convert to array format
      const slotsArray = Object.entries(groupedSlots).map(([date, slots]) => ({
        date,
        slots: slots.sort(
          (a, b) =>
            new Date(a.datetime).getTime() - new Date(b.datetime).getTime(),
        ),
      }));

      setAvailableSlots(
        slotsArray.sort((a, b) => a.date.localeCompare(b.date)),
      );
    } catch (_err) {
      setError('Erro ao carregar horários disponíveis. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return 'Hoje';
    }
    if (isTomorrow(date)) {
      return 'Amanhã';
    }
    return format(date, "EEEE, d 'de' MMMM", { locale: ptBR });
  };

  const formatTimeSlot = (datetime: string) => {
    return format(new Date(datetime), 'HH:mm', { locale: ptBR });
  };

  // Generate date navigation
  const generateDateOptions = () => {
    const options = [];
    for (let i = 0; i < 30; i++) {
      const date = addDays(new Date(), i);
      options.push({
        value: format(date, 'yyyy-MM-dd'),
        label: format(date, "d 'de' MMM", { locale: ptBR }),
        isToday: isToday(date),
        isTomorrow: isTomorrow(date),
      });
    }
    return options;
  };

  if (loading) {
    return (
      <div className={`flex justify-center p-8 ${className}`}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <Alert className={`${className} border-red-200 bg-red-50`}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-red-700">{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <h2 className="mb-2 font-semibold text-gray-900 text-xl">
          Escolha o Horário
        </h2>
        <p className="text-gray-600">
          Selecione a data e horário desejado para seu agendamento
        </p>
      </div>

      {/* Date Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {generateDateOptions()
          .slice(0, 7)
          .map((option) => (
            <Button
              className="min-w-fit whitespace-nowrap"
              key={option.value}
              onClick={() => setSelectedDate(option.value)}
              size="sm"
              variant={selectedDate === option.value ? 'default' : 'outline'}
            >
              {option.isToday
                ? 'Hoje'
                : option.isTomorrow
                  ? 'Amanhã'
                  : option.label}
            </Button>
          ))}
      </div>

      {/* Available Slots */}
      <div className="space-y-6">
        {availableSlots.length === 0 ? (
          <Card className="p-6 text-center">
            <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 font-medium text-gray-900 text-lg">
              Nenhum horário disponível
            </h3>
            <p className="text-gray-600">
              Não há horários disponíveis para o período selecionado. Tente
              escolher outra data.
            </p>
            <Button
              className="mt-4"
              onClick={fetchAvailableSlots}
              variant="outline"
            >
              Atualizar Horários
            </Button>
          </Card>
        ) : (
          availableSlots.map(({ date, slots }) => (
            <Card className="overflow-hidden" key={date}>
              <CardHeader className="bg-gray-50 py-4">
                <CardTitle className="text-lg capitalize">
                  {formatDateHeader(date)}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {slots
                    .filter((slot) => slot.is_available)
                    .map((slot) => (
                      <Button
                        aria-pressed={selectedSlot?.datetime === slot.datetime}
                        className={`flex h-auto flex-col items-center p-3 ${
                          selectedSlot?.datetime === slot.datetime
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'hover:border-blue-300 hover:bg-blue-50'
                        }`}
                        key={slot.datetime}
                        onClick={() => onSlotSelect(slot)}
                        size="sm"
                        variant={
                          selectedSlot?.datetime === slot.datetime
                            ? 'default'
                            : 'outline'
                        }
                      >
                        <Clock className="mb-1 h-4 w-4" />
                        <span className="font-medium">
                          {formatTimeSlot(slot.datetime)}
                        </span>
                        {slot.professional_name && (
                          <span className="w-full truncate text-xs opacity-80">
                            {slot.professional_name}
                          </span>
                        )}
                      </Button>
                    ))}
                </div>

                {slots.filter((slot) => slot.is_available).length === 0 && (
                  <div className="py-6 text-center text-gray-500">
                    <Clock className="mx-auto mb-2 h-8 w-8 opacity-50" />
                    <p>Nenhum horário disponível nesta data</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Real-time availability notice */}
      <Alert className="border-blue-200 bg-blue-50">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-blue-700">
          Os horários são atualizados em tempo real. Se um horário não estiver
          mais disponível durante o agendamento, sugeriremos alternativas
          próximas.
        </AlertDescription>
      </Alert>
    </div>
  );
}

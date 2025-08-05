"use client";

// =============================================
// NeonPro Alternative Slot Suggestion System
// Story 1.2: Intelligent slot recommendation
// =============================================

import type { AlternativeSlot } from "@/app/lib/types/conflict-prevention";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Separator } from "@/components/ui/separator";
import type { format, isSameDay, parseISO } from "date-fns";
import type { ptBR } from "date-fns/locale";
import type {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CheckCircle,
  Clock,
  Loader2,
  Star,
  User,
} from "lucide-react";
import type { useEffect, useState } from "react";
import type { toast } from "sonner";

interface AlternativeSlotSuggestionProps {
  clinicId: string;
  professionalId: string;
  serviceTypeId: string;
  originalStartTime: string;
  originalEndTime: string;
  excludeAppointmentId?: string;
  onSlotSelected: (slot: AlternativeSlot) => void;
  onClose?: () => void;
  maxSuggestions?: number;
  searchWindowDays?: number;
}

interface SlotSuggestionParams {
  professional_id: string;
  service_type_id: string;
  preferred_start_time: string;
  duration_minutes: number;
  exclude_appointment_id?: string;
  max_suggestions: number;
  search_window_days: number;
  clinic_id: string;
}

interface SuggestionResponse {
  suggestions: AlternativeSlot[];
  search_info: {
    total_slots_checked: number;
    available_slots_found: number;
    search_period: {
      start_date: string;
      end_date: string;
    };
  };
}

export function AlternativeSlotSuggestion({
  clinicId,
  professionalId,
  serviceTypeId,
  originalStartTime,
  originalEndTime,
  excludeAppointmentId,
  onSlotSelected,
  onClose,
  maxSuggestions = 6,
  searchWindowDays = 14,
}: AlternativeSlotSuggestionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AlternativeSlot[]>([]);
  const [searchInfo, setSearchInfo] = useState<any>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // Calculate duration from original times
  const durationMinutes = Math.round(
    (parseISO(originalEndTime).getTime() - parseISO(originalStartTime).getTime()) / (1000 * 60),
  );

  useEffect(() => {
    if (professionalId && serviceTypeId && originalStartTime) {
      searchAlternativeSlots();
    }
  }, [professionalId, serviceTypeId, originalStartTime, originalEndTime]);

  const searchAlternativeSlots = async () => {
    setIsLoading(true);
    try {
      const params: SlotSuggestionParams = {
        professional_id: professionalId,
        service_type_id: serviceTypeId,
        preferred_start_time: originalStartTime,
        duration_minutes: durationMinutes,
        exclude_appointment_id: excludeAppointmentId,
        max_suggestions: maxSuggestions,
        search_window_days: searchWindowDays,
        clinic_id: clinicId,
      };

      const queryString = new URLSearchParams(params as any).toString();
      const response = await fetch(`/api/appointments/suggest-slots?${queryString}`);

      if (!response.ok) {
        throw new Error("Failed to fetch alternative slots");
      }

      const data: SuggestionResponse = await response.json();
      setSuggestions(data.suggestions);
      setSearchInfo(data.search_info);
    } catch (error) {
      console.error("Error fetching alternative slots:", error);
      toast.error("Erro ao buscar horários alternativos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSlotSelect = (slot: AlternativeSlot) => {
    setSelectedSlot(slot.start_time);
    onSlotSelected(slot);
  };

  const formatSlotTime = (slot: AlternativeSlot): string => {
    const startDate = parseISO(slot.start_time);
    const endDate = parseISO(slot.end_time);

    return `${format(startDate, "EEEE, dd/MM", { locale: ptBR })} • ${format(startDate, "HH:mm", {
      locale: ptBR,
    })}-${format(endDate, "HH:mm", { locale: ptBR })}`;
  };

  const getSlotScore = (slot: AlternativeSlot): number => {
    return slot.score || 0;
  };

  const getSlotScoreColor = (score: number): string => {
    if (score >= 90) return "text-green-600 bg-green-50";
    if (score >= 70) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getSlotScoreLabel = (score: number): string => {
    if (score >= 90) return "Excelente";
    if (score >= 70) return "Boa";
    return "Aceitável";
  };

  const getDaysFromOriginal = (slotTime: string): number => {
    const original = parseISO(originalStartTime);
    const slot = parseISO(slotTime);
    return Math.ceil((slot.getTime() - original.getTime()) / (1000 * 60 * 60 * 24));
  };

  const groupSlotsByDate = (slots: AlternativeSlot[]) => {
    const groups: { [key: string]: AlternativeSlot[] } = {};

    slots.forEach((slot) => {
      const date = format(parseISO(slot.start_time), "yyyy-MM-dd");
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(slot);
    });

    return groups;
  };

  const groupedSlots = groupSlotsByDate(suggestions);
  const hasSlots = suggestions.length > 0;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-blue-600" />
            Horários Alternativos
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Encontre horários disponíveis próximos ao horário desejado
        </p>
      </CardHeader>
      <CardContent>
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Buscando horários alternativos...</p>
            </div>
          </div>
        )}

        {/* No Slots Found */}
        {!isLoading && !hasSlots && (
          <div className="text-center py-8">
            <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
            <h3 className="font-medium mb-2">Nenhum horário alternativo encontrado</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Não encontramos horários disponíveis nos próximos {searchWindowDays} dias.
            </p>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>• Tente escolher um período diferente</p>
              <p>• Considere outros profissionais</p>
              <p>• Verifique se há feriados configurados</p>
            </div>
          </div>
        )}

        {/* Slots Display */}
        {!isLoading && hasSlots && (
          <div className="space-y-6">
            {/* Search Info */}
            {searchInfo && (
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-blue-900 text-sm">
                  <CheckCircle className="h-4 w-4" />
                  <span>
                    Encontrados {searchInfo.available_slots_found} horários disponíveis de{" "}
                    {searchInfo.total_slots_checked} verificados
                  </span>
                </div>
              </div>
            )}

            {/* Grouped Slots */}
            {Object.entries(groupedSlots).map(([date, slots]) => {
              const dateObj = parseISO(date);
              const isToday = isSameDay(dateObj, new Date());
              const daysFromOriginal = getDaysFromOriginal(slots[0].start_time);

              return (
                <div key={date} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">
                      {format(dateObj, "EEEE, dd/MM/yyyy", { locale: ptBR })}
                    </h4>
                    {isToday && (
                      <Badge variant="default" className="text-xs">
                        Hoje
                      </Badge>
                    )}
                    {daysFromOriginal > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        +{daysFromOriginal} dia{daysFromOriginal > 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {slots.map((slot, index) => {
                      const score = getSlotScore(slot);
                      const isSelected = selectedSlot === slot.start_time;

                      return (
                        <Card
                          key={index}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            isSelected ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"
                          }`}
                          onClick={() => handleSlotSelect(slot)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-blue-600" />
                                <span className="font-medium">
                                  {format(parseISO(slot.start_time), "HH:mm")} -{" "}
                                  {format(parseISO(slot.end_time), "HH:mm")}
                                </span>
                              </div>
                              {score > 0 && (
                                <Badge className={`text-xs ${getSlotScoreColor(score)}`}>
                                  <Star className="h-3 w-3 mr-1" />
                                  {getSlotScoreLabel(score)}
                                </Badge>
                              )}
                            </div>

                            {slot.reason && (
                              <p className="text-xs text-muted-foreground mb-2">{slot.reason}</p>
                            )}

                            {slot.conflicts && slot.conflicts.length > 0 && (
                              <div className="space-y-1">
                                {slot.conflicts.map((conflict, cIndex) => (
                                  <div
                                    key={cIndex}
                                    className={`text-xs p-2 rounded ${
                                      conflict.severity === "warning"
                                        ? "bg-amber-50 text-amber-700"
                                        : "bg-red-50 text-red-700"
                                    }`}
                                  >
                                    {conflict.message}
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <User className="h-3 w-3" />
                                Disponível
                              </div>
                              <ArrowRight
                                className={`h-4 w-4 transition-transform ${
                                  isSelected ? "text-blue-600 scale-110" : "text-muted-foreground"
                                }`}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <Separator />

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button
                onClick={() => searchAlternativeSlots()}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Loader2 className="h-4 w-4" />
                Buscar Mais
              </Button>
              <div className="text-xs text-muted-foreground">
                Mostrando até {maxSuggestions} sugestões nos próximos {searchWindowDays} dias
              </div>
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="mt-6 p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-600 space-y-1">
            <p>
              <strong>Como funciona:</strong>
            </p>
            <p>• Horários são ordenados por proximidade e disponibilidade</p>
            <p>• Badges indicam a qualidade da sugestão baseada em preferências</p>
            <p>• Clique em um horário para aplicá-lo automaticamente</p>
            <p>• Conflitos menores são mostrados como avisos</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

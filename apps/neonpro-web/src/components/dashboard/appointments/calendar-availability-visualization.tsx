"use client";

// =============================================
// NeonPro Calendar Availability Visualization
// Story 1.2: Heat map availability display
// =============================================

import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Card } from "@/components/ui/card";
import type {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { cn } from "@/lib/utils";
import type {
  addDays,
  endOfDay,
  endOfWeek,
  format,
  isSameDay,
  parseISO,
  startOfDay,
  startOfWeek,
} from "date-fns";
import type { ptBR } from "date-fns/locale";
import type {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  EyeOff,
  Loader2,
  XCircle,
} from "lucide-react";
import type { useEffect, useMemo, useState } from "react";

interface AvailabilitySlot {
  time: string;
  available: boolean;
  conflicts: Array<{
    type: string;
    message: string;
    severity: "error" | "warning" | "info";
  }>;
  capacity: {
    used: number;
    maximum: number;
  };
}

interface DayAvailability {
  date: string;
  slots: AvailabilitySlot[];
  summary: {
    total_slots: number;
    available_slots: number;
    blocked_slots: number;
    warning_slots: number;
  };
}

interface CalendarAvailabilityVisualizationProps {
  professionalId: string;
  clinicId: string;
  selectedDate?: Date;
  view: "day" | "week" | "month";
  serviceTypeId?: string;
  onSlotClick?: (slot: AvailabilitySlot) => void;
  showHeatMap?: boolean;
}

type AvailabilityLevel = "high" | "medium" | "low" | "none" | "blocked";

export function CalendarAvailabilityVisualization({
  professionalId,
  clinicId,
  selectedDate = new Date(),
  view = "week",
  serviceTypeId,
  onSlotClick,
  showHeatMap = true,
}: CalendarAvailabilityVisualizationProps) {
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
  const [hoveredSlot, setHoveredSlot] = useState<AvailabilitySlot | null>(null);

  // Calculate date range based on view
  const dateRange = useMemo(() => {
    switch (view) {
      case "day":
        return {
          start: startOfDay(selectedDate),
          end: endOfDay(selectedDate),
        };
      case "week":
        return {
          start: startOfWeek(selectedDate, { weekStartsOn: 1 }), // Monday
          end: endOfWeek(selectedDate, { weekStartsOn: 1 }),
        };
      case "month":
        return {
          start: startOfWeek(
            startOfDay(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)),
          ),
          end: endOfWeek(
            endOfDay(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0)),
          ),
        };
    }
  }, [selectedDate, view]);

  useEffect(() => {
    if (professionalId && clinicId) {
      loadAvailabilityData();
    }
  }, [professionalId, clinicId, dateRange.start, dateRange.end, serviceTypeId]);

  const loadAvailabilityData = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        professional_id: professionalId,
        clinic_id: clinicId,
        start_date: dateRange.start.toISOString(),
        end_date: dateRange.end.toISOString(),
        ...(serviceTypeId && { service_type_id: serviceTypeId }),
      });

      const response = await fetch(`/api/appointments/availability-heatmap?${params}`);

      if (response.ok) {
        const data = await response.json();
        setAvailability(data.days || []);
      } else {
        console.error("Failed to load availability data");
      }
    } catch (error) {
      console.error("Error loading availability:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAvailabilityLevel = (slot: AvailabilitySlot): AvailabilityLevel => {
    if (!slot.available) return "blocked";

    const hasErrors = slot.conflicts.some((c) => c.severity === "error");
    if (hasErrors) return "blocked";

    const hasWarnings = slot.conflicts.some((c) => c.severity === "warning");
    if (hasWarnings) return "low";

    const capacityRatio = slot.capacity.used / slot.capacity.maximum;
    if (capacityRatio >= 0.8) return "low";
    if (capacityRatio >= 0.5) return "medium";
    return "high";
  };

  const getAvailabilityColor = (level: AvailabilityLevel): string => {
    switch (level) {
      case "high":
        return "bg-green-200 hover:bg-green-300 border-green-300";
      case "medium":
        return "bg-yellow-200 hover:bg-yellow-300 border-yellow-300";
      case "low":
        return "bg-orange-200 hover:bg-orange-300 border-orange-300";
      case "blocked":
        return "bg-red-200 hover:bg-red-300 border-red-300";
      case "none":
        return "bg-gray-100 hover:bg-gray-200 border-gray-200";
    }
  };

  const getAvailabilityIcon = (level: AvailabilityLevel) => {
    switch (level) {
      case "high":
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      case "medium":
        return <Clock className="h-3 w-3 text-yellow-600" />;
      case "low":
        return <AlertCircle className="h-3 w-3 text-orange-600" />;
      case "blocked":
        return <XCircle className="h-3 w-3 text-red-600" />;
      case "none":
        return <div className="h-3 w-3 bg-gray-400 rounded-full" />;
    }
  };

  const getSlotTooltipContent = (slot: AvailabilitySlot): string => {
    const level = getAvailabilityLevel(slot);
    const time = format(parseISO(slot.time), "HH:mm");

    let content = `${time}\n`;

    switch (level) {
      case "high":
        content += "Totalmente disponível";
        break;
      case "medium":
        content += `Parcialmente ocupado (${slot.capacity.used}/${slot.capacity.maximum})`;
        break;
      case "low":
        content += `Pouco disponível (${slot.capacity.used}/${slot.capacity.maximum})`;
        if (slot.conflicts.length > 0) {
          content += "\nAvisos: " + slot.conflicts.map((c) => c.message).join(", ");
        }
        break;
      case "blocked":
        content += "Indisponível";
        if (slot.conflicts.length > 0) {
          content += "\nMotivo: " + slot.conflicts.map((c) => c.message).join(", ");
        }
        break;
      case "none":
        content += "Sem horário configurado";
        break;
    }

    return content;
  };

  const getDaySummary = (day: DayAvailability): { percent: number; level: AvailabilityLevel } => {
    const availablePercent = Math.round(
      (day.summary.available_slots / day.summary.total_slots) * 100,
    );
    let level: AvailabilityLevel;

    if (availablePercent >= 80) level = "high";
    else if (availablePercent >= 50) level = "medium";
    else if (availablePercent >= 20) level = "low";
    else level = "blocked";

    return { percent: availablePercent, level };
  };

  const renderDayView = () => {
    const dayData = availability.find((d) => isSameDay(parseISO(d.date), selectedDate));
    if (!dayData) return null;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">
            {format(selectedDate, "EEEE, dd/MM/yyyy", { locale: ptBR })}
          </h3>
          <Badge variant="secondary">
            {dayData.summary.available_slots} de {dayData.summary.total_slots} disponíveis
          </Badge>
        </div>

        <div className="grid grid-cols-12 gap-1">
          {dayData.slots.map((slot, index) => {
            const level = getAvailabilityLevel(slot);
            return (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "h-8 rounded border cursor-pointer transition-all",
                        getAvailabilityColor(level),
                      )}
                      onClick={() => onSlotClick?.(slot)}
                      onMouseEnter={() => setHoveredSlot(slot)}
                      onMouseLeave={() => setHoveredSlot(null)}
                    >
                      <div className="flex items-center justify-center h-full">
                        {showDetails && getAvailabilityIcon(level)}
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-xs whitespace-pre-line">{getSlotTooltipContent(slot)}</div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>

        {/* Time labels */}
        <div className="grid grid-cols-12 gap-1 text-xs text-muted-foreground">
          {dayData.slots
            .filter((_, i) => i % 2 === 0)
            .map((slot, index) => (
              <div key={index} className="col-span-2 text-center">
                {format(parseISO(slot.time), "HH:mm")}
              </div>
            ))}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = addDays(dateRange.start, i);
      const dayData = availability.find((d) => isSameDay(parseISO(d.date), day));
      weekDays.push({ date: day, data: dayData });
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map(({ date, data }, dayIndex) => {
            const summary = data
              ? getDaySummary(data)
              : { percent: 0, level: "none" as AvailabilityLevel };

            return (
              <div key={dayIndex} className="space-y-2">
                <div className="text-center">
                  <div className="text-xs font-medium">{format(date, "EEE", { locale: ptBR })}</div>
                  <div className="text-xs text-muted-foreground">{format(date, "dd")}</div>
                  <Badge variant="secondary" className="text-xs mt-1">
                    {summary.percent}%
                  </Badge>
                </div>

                {showHeatMap && data && (
                  <div className="space-y-1">
                    {data.slots.map((slot, slotIndex) => {
                      const level = getAvailabilityLevel(slot);
                      return (
                        <TooltipProvider key={slotIndex}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className={cn(
                                  "h-4 rounded border cursor-pointer transition-all",
                                  getAvailabilityColor(level),
                                )}
                                onClick={() => onSlotClick?.(slot)}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-xs whitespace-pre-line">
                                {getSlotTooltipContent(slot)}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    // Group days by week
    const weeks = [];
    let currentWeek = [];

    for (let day = new Date(dateRange.start); day <= dateRange.end; day = addDays(day, 1)) {
      const dayData = availability.find((d) => isSameDay(parseISO(d.date), day));
      currentWeek.push({ date: new Date(day), data: dayData });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return (
      <div className="space-y-2">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-1">
            {week.map(({ date, data }, dayIndex) => {
              const summary = data
                ? getDaySummary(data)
                : { percent: 0, level: "none" as AvailabilityLevel };
              const isCurrentMonth = date.getMonth() === selectedDate.getMonth();

              return (
                <TooltipProvider key={dayIndex}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "h-12 rounded border flex flex-col items-center justify-center cursor-pointer transition-all",
                          getAvailabilityColor(summary.level),
                          !isCurrentMonth && "opacity-50",
                        )}
                      >
                        <div className="text-xs font-medium">{format(date, "d")}</div>
                        {showDetails && <div className="text-xs">{summary.percent}%</div>}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-xs">
                        {format(date, "dd/MM/yyyy", { locale: ptBR })}
                        <br />
                        {data
                          ? `${data.summary.available_slots}/${data.summary.total_slots} slots disponíveis`
                          : "Sem dados"}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  const renderLegend = () => (
    <div className="flex items-center gap-4 text-xs">
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 bg-green-200 rounded border" />
        <span>Alta disponibilidade</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 bg-yellow-200 rounded border" />
        <span>Média disponibilidade</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 bg-orange-200 rounded border" />
        <span>Baixa disponibilidade</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 bg-red-200 rounded border" />
        <span>Indisponível</span>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Carregando disponibilidade...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h3 className="font-medium">Mapa de Disponibilidade</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowDetails(!showDetails)}>
              {showDetails ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {view === "day" && renderDayView()}
          {view === "week" && renderWeekView()}
          {view === "month" && renderMonthView()}
        </div>

        {/* Legend */}
        {showHeatMap && <div className="border-t pt-4">{renderLegend()}</div>}

        {/* Current hover info */}
        {hoveredSlot && (
          <div className="border-t pt-4">
            <div className="text-sm">
              <strong>Horário selecionado:</strong> {format(parseISO(hoveredSlot.time), "HH:mm")}
              <br />
              <strong>Status:</strong> {hoveredSlot.available ? "Disponível" : "Indisponível"}
              <br />
              <strong>Capacidade:</strong> {hoveredSlot.capacity.used}/
              {hoveredSlot.capacity.maximum}
              {hoveredSlot.conflicts.length > 0 && (
                <>
                  <br />
                  <strong>Conflitos:</strong>{" "}
                  {hoveredSlot.conflicts.map((c) => c.message).join(", ")}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

"use client";

import React from "react";
import type { Button } from "@/components/ui/button";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { cn } from "@/lib/utils";
import type {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Grid3X3,
  LayoutGrid,
} from "lucide-react";
import type { format, addDays, addWeeks, addMonths, subDays, subWeeks, subMonths } from "date-fns";
import type { ptBR } from "date-fns/locale";

export type CalendarView = "day" | "week" | "month";

interface CalendarNavigationProps {
  currentDate: Date;
  view: CalendarView;
  onDateChange: (date: Date) => void;
  onViewChange: (view: CalendarView) => void;
  onToday: () => void;
  className?: string;
}
export function CalendarNavigation({
  currentDate,
  view,
  onDateChange,
  onViewChange,
  onToday,
  className,
}: CalendarNavigationProps) {
  const navigatePrevious = () => {
    switch (view) {
      case "day":
        onDateChange(subDays(currentDate, 1));
        break;
      case "week":
        onDateChange(subWeeks(currentDate, 1));
        break;
      case "month":
        onDateChange(subMonths(currentDate, 1));
        break;
    }
  };

  const navigateNext = () => {
    switch (view) {
      case "day":
        onDateChange(addDays(currentDate, 1));
        break;
      case "week":
        onDateChange(addWeeks(currentDate, 1));
        break;
      case "month":
        onDateChange(addMonths(currentDate, 1));
        break;
    }
  };

  const getDateRangeText = () => {
    switch (view) {
      case "day":
        return format(currentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
      case "week": {
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
          return `${format(startOfWeek, "d", { locale: ptBR })} - ${format(endOfWeek, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}`;
        } else {
          return `${format(startOfWeek, "d 'de' MMM", { locale: ptBR })} - ${format(endOfWeek, "d 'de' MMM 'de' yyyy", { locale: ptBR })}`;
        }
      }
      case "month":
        return format(currentDate, "MMMM 'de' yyyy", { locale: ptBR });
      default:
        return "";
    }
  };

  const viewIcons = {
    day: Clock,
    week: Grid3X3,
    month: LayoutGrid,
  };

  const viewLabels = {
    day: "Dia",
    week: "Semana",
    month: "Mês",
  };

  return (
    <div className={cn("flex items-center justify-between gap-4 p-4 border-b", className)}>
      {/* Left side - Date navigation */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={navigatePrevious} className="h-9 w-9 p-0">
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button variant="outline" size="sm" onClick={navigateNext} className="h-9 w-9 p-0">
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button variant="outline" size="sm" onClick={onToday} className="h-9 px-3">
          Hoje
        </Button>

        <div className="flex items-center gap-2 ml-4">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold text-lg min-w-0">{getDateRangeText()}</span>
        </div>
      </div>

      {/* Right side - View selection */}
      <div className="flex items-center gap-2">
        <Select value={view} onValueChange={(value: CalendarView) => onViewChange(value)}>
          <SelectTrigger className="h-9 w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(viewLabels).map(([key, label]) => {
              const IconComponent = viewIcons[key as CalendarView];
              return (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-4 w-4" />
                    <span>{label}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        {/* Quick view toggle buttons */}
        <div className="hidden md:flex items-center gap-1 border rounded-md p-1">
          {Object.entries(viewLabels).map(([key, label]) => {
            const IconComponent = viewIcons[key as CalendarView];
            return (
              <Button
                key={key}
                variant={view === key ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onViewChange(key as CalendarView)}
                className="h-7 px-2"
                title={label}
              >
                <IconComponent className="h-4 w-4" />
                <span className="ml-1 text-xs">{label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

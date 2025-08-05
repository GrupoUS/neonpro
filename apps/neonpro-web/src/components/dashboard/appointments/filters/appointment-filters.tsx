// components/dashboard/appointments/filters/appointment-filters.tsx
// Main appointment filters component
// Story 1.1 Task 6 - Appointment Filtering and Search

"use client";

import type {
  AppointmentFilters as AppointmentFiltersType,
  AppointmentStatus,
  FilterOptionsData,
} from "@/app/lib/types/appointments";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Calendar } from "@/components/ui/calendar";
import type { Card, CardContent } from "@/components/ui/card";
import type { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Separator } from "@/components/ui/separator";
import type { useAppointmentFilters } from "@/hooks/appointments/use-appointment-filters";
import type { cn } from "@/lib/utils";
import type { format } from "date-fns";
import type { ptBR } from "date-fns/locale";
import type { Briefcase, CalendarIcon, ChevronDown, RotateCcw, User, X } from "lucide-react";
import type { useEffect, useState } from "react";
import AppointmentSearch from "./appointment-search";

// Status options with colors
const statusOptions: Array<{
  value: AppointmentStatus;
  label: string;
  color: string;
}> = [
  { value: "scheduled", label: "Agendado", color: "bg-blue-500" },
  { value: "confirmed", label: "Confirmado", color: "bg-green-500" },
  { value: "in_progress", label: "Em Andamento", color: "bg-yellow-500" },
  { value: "completed", label: "Concluído", color: "bg-emerald-500" },
  { value: "cancelled", label: "Cancelado", color: "bg-red-500" },
  { value: "no_show", label: "Não Compareceu", color: "bg-gray-500" },
];

interface AppointmentFiltersProps {
  filters: AppointmentFiltersType;
  onFiltersChange: (newFilters: Partial<AppointmentFiltersType>) => void;
  onClearFilters: () => void;
}
export default function AppointmentFilters({
  filters,
  onFiltersChange,
  onClearFilters,
}: AppointmentFiltersProps) {
  const { hasActiveFilters, activeFilterCount, updateFilter } = useAppointmentFilters();

  const [filterOptionsData, setFilterOptionsData] = useState<FilterOptionsData>({
    professionals: [],
    services: [],
    statuses: [],
  });
  const [loading, setLoading] = useState(true);

  // Load filter options from API
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        setLoading(true);

        const [professionalsRes, servicesRes] = await Promise.all([
          fetch("/api/professionals"),
          fetch("/api/services"),
        ]);

        const professionals = professionalsRes.ok ? await professionalsRes.json() : [];
        const services = servicesRes.ok ? await servicesRes.json() : [];

        setFilterOptionsData({
          professionals: (professionals.data || []).map((p: any) => ({
            value: p.id,
            label: p.full_name,
          })),
          services: (services.data || []).map((s: any) => ({
            value: s.id,
            label: s.name,
          })),
          statuses: statusOptions.map((s) => ({
            value: s.value,
            label: s.label,
          })),
        });
      } catch (error) {
        console.error("Error loading filter options:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFilterOptions();
  }, []);

  // Notify parent when filters change
  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange(filters);
    }
  }, [filters, onFiltersChange]); // Handle status filter changes (multiple selection)
  const handleStatusChange = (status: AppointmentStatus) => {
    const currentStatus = filters.status;
    let newStatus: AppointmentStatus[] | undefined;

    if (Array.isArray(currentStatus)) {
      if (currentStatus.includes(status)) {
        newStatus = currentStatus.filter((s) => s !== status);
        if (newStatus.length === 0) newStatus = undefined;
      } else {
        newStatus = [...currentStatus, status];
      }
    } else if (currentStatus === status) {
      newStatus = undefined;
    } else if (currentStatus) {
      newStatus = [currentStatus, status];
    } else {
      newStatus = [status];
    }

    updateFilter("status", newStatus);
  };

  // Check if status is selected
  const isStatusSelected = (status: AppointmentStatus) => {
    if (Array.isArray(filters.status)) {
      return filters.status.includes(status);
    }
    return filters.status === status;
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Search Bar - Always visible */}
          <div className="w-full">
            <AppointmentSearch
              value={filters.search_query || ""}
              onSearch={(query) => updateFilter("search_query", query)}
              placeholder="Buscar por nome do paciente, serviço ou observações..."
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Professional Filter */}
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <Select
                value={filters.professional_id || ""}
                onValueChange={(value) => updateFilter("professional_id", value || undefined)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Profissional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os profissionais</SelectItem>
                  {filterOptionsData.professionals.map((professional) => (
                    <SelectItem key={professional.value} value={professional.value}>
                      {professional.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>{" "}
            {/* Service Filter */}
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <Select
                value={filters.service_type_id || ""}
                onValueChange={(value) => updateFilter("service_type_id", value || undefined)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Serviço" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os serviços</SelectItem>
                  {filterOptionsData.services.map((service) => (
                    <SelectItem key={service.value} value={service.value}>
                      {service.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Status Filter - Multi-select with Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-between min-w-[150px]">
                  <span>
                    {filters.status &&
                    (Array.isArray(filters.status) ? filters.status.length : 1) > 0
                      ? `Status (${Array.isArray(filters.status) ? filters.status.length : 1})`
                      : "Status"}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2">
                <div className="space-y-2">
                  {statusOptions.map((status) => (
                    <div
                      key={status.value}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-muted transition-colors",
                        isStatusSelected(status.value) && "bg-muted",
                      )}
                      onClick={() => handleStatusChange(status.value)}
                    >
                      <div className={cn("w-3 h-3 rounded-full", status.color)} />
                      <span className="text-sm">{status.label}</span>
                      {isStatusSelected(status.value) && <X className="h-3 w-3 ml-auto" />}
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>{" "}
            {/* Date Range Filter */}
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-between min-w-[200px]">
                    <span>
                      {filters.date_from || filters.date_to
                        ? `${
                            filters.date_from
                              ? format(filters.date_from, "dd/MM", {
                                  locale: ptBR,
                                })
                              : ""
                          } - ${
                            filters.date_to
                              ? format(filters.date_to, "dd/MM", {
                                  locale: ptBR,
                                })
                              : ""
                          }`
                        : "Período"}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4" align="start">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Data Inicial</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal mt-1"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {filters.date_from ? (
                                format(filters.date_from, "dd/MM/yyyy", {
                                  locale: ptBR,
                                })
                              ) : (
                                <span>Selecionar</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={filters.date_from}
                              onSelect={(date) => updateFilter("date_from", date)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Data Final</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal mt-1"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {filters.date_to ? (
                                format(filters.date_to, "dd/MM/yyyy", {
                                  locale: ptBR,
                                })
                              ) : (
                                <span>Selecionar</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={filters.date_to}
                              onSelect={(date) => updateFilter("date_to", date)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>{" "}
                    {/* Quick date range buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const today = new Date();
                          updateFilter("date_from", today);
                          updateFilter("date_to", today);
                        }}
                      >
                        Hoje
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const today = new Date();
                          const weekStart = new Date(
                            today.setDate(today.getDate() - today.getDay()),
                          );
                          const weekEnd = new Date(
                            today.setDate(today.getDate() - today.getDay() + 6),
                          );
                          updateFilter("date_from", weekStart);
                          updateFilter("date_to", weekEnd);
                        }}
                      >
                        Esta Semana
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            {/* Clear Filters */}
            {hasActiveFilters && (
              <>
                <Separator orientation="vertical" className="h-6" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearFilters}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Limpar ({activeFilterCount})
                </Button>
              </>
            )}
          </div>

          {/* Active Filter Badges */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              {filters.professional_id && (
                <Badge variant="secondary" className="gap-1">
                  Profissional:{" "}
                  {
                    filterOptionsData.professionals.find((p) => p.value === filters.professional_id)
                      ?.label
                  }
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => updateFilter("professional_id", undefined)}
                  />
                </Badge>
              )}
              {filters.service_type_id && (
                <Badge variant="secondary" className="gap-1">
                  Serviço:{" "}
                  {
                    filterOptionsData.services.find((s) => s.value === filters.service_type_id)
                      ?.label
                  }
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => updateFilter("service_type_id", undefined)}
                  />
                </Badge>
              )}{" "}
              {filters.status && (
                <>
                  {Array.isArray(filters.status) ? (
                    filters.status.map((status) => (
                      <Badge key={status} variant="secondary" className="gap-1">
                        Status: {statusOptions.find((s) => s.value === status)?.label}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => handleStatusChange(status)}
                        />
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      Status: {statusOptions.find((s) => s.value === filters.status)?.label}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => updateFilter("status", undefined)}
                      />
                    </Badge>
                  )}
                </>
              )}
              {filters.date_from && (
                <Badge variant="secondary" className="gap-1">
                  Início: {format(filters.date_from, "dd/MM/yyyy", { locale: ptBR })}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => updateFilter("date_from", undefined)}
                  />
                </Badge>
              )}
              {filters.date_to && (
                <Badge variant="secondary" className="gap-1">
                  Fim: {format(filters.date_to, "dd/MM/yyyy", { locale: ptBR })}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => updateFilter("date_to", undefined)}
                  />
                </Badge>
              )}
              {filters.search_query && (
                <Badge variant="secondary" className="gap-1">
                  Busca: "{filters.search_query}"
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => updateFilter("search_query", undefined)}
                  />
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import type {
  endOfMonth,
  endOfYear,
  format,
  startOfMonth,
  startOfYear,
  subDays,
  subMonths,
  subYears,
} from "date-fns";
import type { ptBR } from "date-fns/locale";
import type {
  BarChart3,
  Calendar as CalendarIcon,
  Clock,
  Filter,
  MapPin,
  PieChart,
  RotateCcw,
  Save,
  Settings,
  Stethoscope,
  Target,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Calendar } from "@/components/ui/calendar";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Checkbox } from "@/components/ui/checkbox";
import type { Input } from "@/components/ui/input";
import type { Label } from "@/components/ui/label";
import type { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { ScrollArea } from "@/components/ui/scroll-area";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Separator } from "@/components/ui/separator";
import type { Switch } from "@/components/ui/switch";
import type { cn } from "@/lib/utils";
import type { KPIFilter } from "./hooks/useFinancialKPIs";

interface FilterOption {
  id: string;
  label: string;
  value: string;
  count?: number;
  category?: string;
}

interface DatePreset {
  id: string;
  label: string;
  getValue: () => { start: Date; end: Date };
}

interface KPIFiltersProps {
  filters: KPIFilter;
  onFiltersChange: (filters: Partial<KPIFilter>) => void;
  isLoading?: boolean;
  className?: string;
  compact?: boolean;
  showAdvanced?: boolean;
  onSavePreset?: (name: string, filters: KPIFilter) => void;
  savedPresets?: Array<{ id: string; name: string; filters: KPIFilter }>;
}

// Date presets
const datePresets: DatePreset[] = [
  {
    id: "today",
    label: "Hoje",
    getValue: () => ({
      start: new Date(),
      end: new Date(),
    }),
  },
  {
    id: "yesterday",
    label: "Ontem",
    getValue: () => {
      const yesterday = subDays(new Date(), 1);
      return { start: yesterday, end: yesterday };
    },
  },
  {
    id: "last-7-days",
    label: "Últimos 7 dias",
    getValue: () => ({
      start: subDays(new Date(), 6),
      end: new Date(),
    }),
  },
  {
    id: "last-30-days",
    label: "Últimos 30 dias",
    getValue: () => ({
      start: subDays(new Date(), 29),
      end: new Date(),
    }),
  },
  {
    id: "current-month",
    label: "Mês atual",
    getValue: () => ({
      start: startOfMonth(new Date()),
      end: endOfMonth(new Date()),
    }),
  },
  {
    id: "last-month",
    label: "Mês passado",
    getValue: () => {
      const lastMonth = subMonths(new Date(), 1);
      return {
        start: startOfMonth(lastMonth),
        end: endOfMonth(lastMonth),
      };
    },
  },
  {
    id: "current-quarter",
    label: "Trimestre atual",
    getValue: () => {
      const now = new Date();
      const quarter = Math.floor(now.getMonth() / 3);
      const start = new Date(now.getFullYear(), quarter * 3, 1);
      const end = new Date(now.getFullYear(), quarter * 3 + 3, 0);
      return { start, end };
    },
  },
  {
    id: "current-year",
    label: "Ano atual",
    getValue: () => ({
      start: startOfYear(new Date()),
      end: endOfYear(new Date()),
    }),
  },
  {
    id: "last-year",
    label: "Ano passado",
    getValue: () => {
      const lastYear = subYears(new Date(), 1);
      return {
        start: startOfYear(lastYear),
        end: endOfYear(lastYear),
      };
    },
  },
];

// Mock data for filter options
const mockServices: FilterOption[] = [
  { id: "facial", label: "Tratamentos Faciais", value: "facial", count: 145, category: "Estética" },
  { id: "body", label: "Tratamentos Corporais", value: "body", count: 98, category: "Estética" },
  { id: "laser", label: "Laser e Luz", value: "laser", count: 76, category: "Tecnologia" },
  {
    id: "injectables",
    label: "Injetáveis",
    value: "injectables",
    count: 54,
    category: "Procedimentos",
  },
  {
    id: "skincare",
    label: "Cuidados da Pele",
    value: "skincare",
    count: 123,
    category: "Dermatologia",
  },
  { id: "wellness", label: "Bem-estar", value: "wellness", count: 67, category: "Wellness" },
];

const mockProviders: FilterOption[] = [
  { id: "dr-silva", label: "Dr. Marina Silva", value: "dr-silva", count: 89 },
  { id: "dr-santos", label: "Dr. Carlos Santos", value: "dr-santos", count: 76 },
  { id: "dr-oliveira", label: "Dra. Ana Oliveira", value: "dr-oliveira", count: 65 },
  { id: "dr-costa", label: "Dr. Pedro Costa", value: "dr-costa", count: 54 },
  { id: "dr-ferreira", label: "Dra. Julia Ferreira", value: "dr-ferreira", count: 43 },
];

const mockLocations: FilterOption[] = [
  { id: "unit-1", label: "Unidade Centro", value: "unit-1", count: 234 },
  { id: "unit-2", label: "Unidade Zona Sul", value: "unit-2", count: 187 },
  { id: "unit-3", label: "Unidade Barra", value: "unit-3", count: 156 },
];

const mockPatientSegments: FilterOption[] = [
  { id: "new", label: "Novos Pacientes", value: "new", count: 89 },
  { id: "returning", label: "Pacientes Recorrentes", value: "returning", count: 234 },
  { id: "vip", label: "Pacientes VIP", value: "vip", count: 45 },
  { id: "corporate", label: "Corporativo", value: "corporate", count: 67 },
];

export default function KPIFilters({
  filters,
  onFiltersChange,
  isLoading = false,
  className = "",
  compact = false,
  showAdvanced = true,
  onSavePreset,
  savedPresets = [],
}: KPIFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [showSavePreset, setShowSavePreset] = useState(false);

  // Handle date preset selection
  const handleDatePreset = (presetId: string) => {
    const preset = datePresets.find((p) => p.id === presetId);
    if (preset) {
      const { start, end } = preset.getValue();
      onFiltersChange({
        dateRange: {
          start,
          end,
          preset: presetId,
        },
      });
    }
  };

  // Handle custom date range
  const handleCustomDateRange = (start: Date, end: Date) => {
    onFiltersChange({
      dateRange: {
        start,
        end,
        preset: "custom",
      },
    });
  };

  // Handle filter selection
  const handleFilterSelection = (filterType: keyof KPIFilter, value: string, checked: boolean) => {
    const currentValues = filters[filterType] as string[];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter((v) => v !== value);

    onFiltersChange({ [filterType]: newValues });
  };

  // Clear all filters
  const clearAllFilters = () => {
    onFiltersChange({
      dateRange: {
        start: startOfMonth(new Date()),
        end: endOfMonth(new Date()),
        preset: "current-month",
      },
      services: [],
      providers: [],
      locations: [],
      patientSegments: [],
    });
  };

  // Save preset
  const handleSavePreset = () => {
    if (presetName.trim() && onSavePreset) {
      onSavePreset(presetName.trim(), filters);
      setPresetName("");
      setShowSavePreset(false);
    }
  };

  // Load preset
  const handleLoadPreset = (preset: { id: string; name: string; filters: KPIFilter }) => {
    onFiltersChange(preset.filters);
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    return (
      filters.services.length +
      filters.providers.length +
      filters.locations.length +
      filters.patientSegments.length
    );
  };

  // Render filter section
  const renderFilterSection = (
    title: string,
    icon: React.ReactNode,
    options: FilterOption[],
    selectedValues: string[],
    filterType: keyof KPIFilter,
  ) => (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        {icon}
        <Label className="font-medium">{title}</Label>
        {selectedValues.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {selectedValues.length}
          </Badge>
        )}
      </div>
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {options.map((option) => (
          <div key={option.id} className="flex items-center space-x-2">
            <Checkbox
              id={option.id}
              checked={selectedValues.includes(option.value)}
              onCheckedChange={(checked) =>
                handleFilterSelection(filterType, option.value, checked as boolean)
              }
            />
            <Label htmlFor={option.id} className="text-sm flex-1 cursor-pointer">
              {option.label}
              {option.count && <span className="text-muted-foreground ml-1">({option.count})</span>}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );

  if (compact && !isExpanded) {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(true)}
          className="flex items-center space-x-2"
        >
          <Filter className="h-4 w-4" />
          <span>Filtros</span>
          {getActiveFilterCount() > 0 && (
            <Badge variant="secondary" className="ml-1">
              {getActiveFilterCount()}
            </Badge>
          )}
        </Button>

        <Select value={filters.dateRange.preset} onValueChange={handleDatePreset}>
          <SelectTrigger className="w-48">
            <CalendarIcon className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {datePresets.map((preset) => (
              <SelectItem key={preset.id} value={preset.id}>
                {preset.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <CardTitle className="text-lg">Filtros Avançados</CardTitle>
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary">
                {getActiveFilterCount()} ativo{getActiveFilterCount() > 1 ? "s" : ""}
              </Badge>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {compact && (
              <Button variant="ghost" size="sm" onClick={() => setIsExpanded(false)}>
                <X className="h-4 w-4" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              disabled={isLoading || getActiveFilterCount() === 0}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Limpar
            </Button>

            {onSavePreset && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSavePreset(true)}
                disabled={isLoading}
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
            )}
          </div>
        </div>

        <CardDescription>
          Personalize a visualização dos KPIs financeiros aplicando filtros específicos
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Date Range Filter */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-4 w-4" />
            <Label className="font-medium">Período</Label>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {datePresets.slice(0, 8).map((preset) => (
              <Button
                key={preset.id}
                variant={filters.dateRange.preset === preset.id ? "default" : "outline"}
                size="sm"
                onClick={() => handleDatePreset(preset.id)}
                className="text-xs"
              >
                {preset.label}
              </Button>
            ))}
          </div>

          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>
              {format(filters.dateRange.start, "dd/MM/yyyy", { locale: ptBR })} -{" "}
              {format(filters.dateRange.end, "dd/MM/yyyy", { locale: ptBR })}
            </span>

            <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 px-2">
                  <Settings className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-4 space-y-4">
                  <div className="space-y-2">
                    <Label>Data de Início</Label>
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.start}
                      onSelect={(date) =>
                        date && handleCustomDateRange(date, filters.dateRange.end)
                      }
                      locale={ptBR}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Data de Fim</Label>
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.end}
                      onSelect={(date) =>
                        date && handleCustomDateRange(filters.dateRange.start, date)
                      }
                      locale={ptBR}
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Separator />

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Services Filter */}
            {renderFilterSection(
              "Serviços",
              <Stethoscope className="h-4 w-4" />,
              mockServices,
              filters.services,
              "services",
            )}

            {/* Providers Filter */}
            {renderFilterSection(
              "Profissionais",
              <Users className="h-4 w-4" />,
              mockProviders,
              filters.providers,
              "providers",
            )}

            {/* Locations Filter */}
            {renderFilterSection(
              "Unidades",
              <MapPin className="h-4 w-4" />,
              mockLocations,
              filters.locations,
              "locations",
            )}

            {/* Patient Segments Filter */}
            {renderFilterSection(
              "Segmentos",
              <Target className="h-4 w-4" />,
              mockPatientSegments,
              filters.patientSegments,
              "patientSegments",
            )}
          </div>
        )}

        {/* Comparison Period */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Switch id="comparison" checked={showComparison} onCheckedChange={setShowComparison} />
            <Label htmlFor="comparison" className="font-medium">
              Período de Comparação
            </Label>
          </div>

          {showComparison && (
            <div className="pl-6 space-y-2">
              <p className="text-sm text-muted-foreground">
                Compare com o período anterior de mesma duração
              </p>
              <div className="text-sm">
                Comparando com:{" "}
                {format(
                  new Date(
                    filters.dateRange.start.getTime() -
                      (filters.dateRange.end.getTime() - filters.dateRange.start.getTime()),
                  ),
                  "dd/MM/yyyy",
                  { locale: ptBR },
                )}{" "}
                -{" "}
                {format(new Date(filters.dateRange.start.getTime() - 1), "dd/MM/yyyy", {
                  locale: ptBR,
                })}
              </div>
            </div>
          )}
        </div>

        {/* Saved Presets */}
        {savedPresets.length > 0 && (
          <div className="space-y-3">
            <Label className="font-medium">Filtros Salvos</Label>
            <div className="flex flex-wrap gap-2">
              {savedPresets.map((preset) => (
                <Button
                  key={preset.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleLoadPreset(preset)}
                  className="text-xs"
                >
                  {preset.name}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      {/* Save Preset Modal */}
      {showSavePreset && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Salvar Filtros</CardTitle>
              <CardDescription>Dê um nome para este conjunto de filtros</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="preset-name">Nome do Preset</Label>
                <Input
                  id="preset-name"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  placeholder="Ex: Relatório Mensal"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowSavePreset(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSavePreset} disabled={!presetName.trim()}>
                  Salvar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Card>
  );
}

"use client";
var __spreadArray =
  (this && this.__spreadArray) ||
  ((to, from, pack) => {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = KPIFilters;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var label_1 = require("@/components/ui/label");
var input_1 = require("@/components/ui/input");
var select_1 = require("@/components/ui/select");
var checkbox_1 = require("@/components/ui/checkbox");
var switch_1 = require("@/components/ui/switch");
var separator_1 = require("@/components/ui/separator");
var popover_1 = require("@/components/ui/popover");
var calendar_1 = require("@/components/ui/calendar");
var lucide_react_1 = require("lucide-react");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var utils_1 = require("@/lib/utils");
// Date presets
var datePresets = [
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
      var yesterday = (0, date_fns_1.subDays)(new Date(), 1);
      return { start: yesterday, end: yesterday };
    },
  },
  {
    id: "last-7-days",
    label: "Últimos 7 dias",
    getValue: () => ({
      start: (0, date_fns_1.subDays)(new Date(), 6),
      end: new Date(),
    }),
  },
  {
    id: "last-30-days",
    label: "Últimos 30 dias",
    getValue: () => ({
      start: (0, date_fns_1.subDays)(new Date(), 29),
      end: new Date(),
    }),
  },
  {
    id: "current-month",
    label: "Mês atual",
    getValue: () => ({
      start: (0, date_fns_1.startOfMonth)(new Date()),
      end: (0, date_fns_1.endOfMonth)(new Date()),
    }),
  },
  {
    id: "last-month",
    label: "Mês passado",
    getValue: () => {
      var lastMonth = (0, date_fns_1.subMonths)(new Date(), 1);
      return {
        start: (0, date_fns_1.startOfMonth)(lastMonth),
        end: (0, date_fns_1.endOfMonth)(lastMonth),
      };
    },
  },
  {
    id: "current-quarter",
    label: "Trimestre atual",
    getValue: () => {
      var now = new Date();
      var quarter = Math.floor(now.getMonth() / 3);
      var start = new Date(now.getFullYear(), quarter * 3, 1);
      var end = new Date(now.getFullYear(), quarter * 3 + 3, 0);
      return { start: start, end: end };
    },
  },
  {
    id: "current-year",
    label: "Ano atual",
    getValue: () => ({
      start: (0, date_fns_1.startOfYear)(new Date()),
      end: (0, date_fns_1.endOfYear)(new Date()),
    }),
  },
  {
    id: "last-year",
    label: "Ano passado",
    getValue: () => {
      var lastYear = (0, date_fns_1.subYears)(new Date(), 1);
      return {
        start: (0, date_fns_1.startOfYear)(lastYear),
        end: (0, date_fns_1.endOfYear)(lastYear),
      };
    },
  },
];
// Mock data for filter options
var mockServices = [
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
var mockProviders = [
  { id: "dr-silva", label: "Dr. Marina Silva", value: "dr-silva", count: 89 },
  { id: "dr-santos", label: "Dr. Carlos Santos", value: "dr-santos", count: 76 },
  { id: "dr-oliveira", label: "Dra. Ana Oliveira", value: "dr-oliveira", count: 65 },
  { id: "dr-costa", label: "Dr. Pedro Costa", value: "dr-costa", count: 54 },
  { id: "dr-ferreira", label: "Dra. Julia Ferreira", value: "dr-ferreira", count: 43 },
];
var mockLocations = [
  { id: "unit-1", label: "Unidade Centro", value: "unit-1", count: 234 },
  { id: "unit-2", label: "Unidade Zona Sul", value: "unit-2", count: 187 },
  { id: "unit-3", label: "Unidade Barra", value: "unit-3", count: 156 },
];
var mockPatientSegments = [
  { id: "new", label: "Novos Pacientes", value: "new", count: 89 },
  { id: "returning", label: "Pacientes Recorrentes", value: "returning", count: 234 },
  { id: "vip", label: "Pacientes VIP", value: "vip", count: 45 },
  { id: "corporate", label: "Corporativo", value: "corporate", count: 67 },
];
function KPIFilters(_a) {
  var filters = _a.filters,
    onFiltersChange = _a.onFiltersChange,
    _b = _a.isLoading,
    isLoading = _b === void 0 ? false : _b,
    _c = _a.className,
    className = _c === void 0 ? "" : _c,
    _d = _a.compact,
    compact = _d === void 0 ? false : _d,
    _e = _a.showAdvanced,
    showAdvanced = _e === void 0 ? true : _e,
    onSavePreset = _a.onSavePreset,
    _f = _a.savedPresets,
    savedPresets = _f === void 0 ? [] : _f;
  var _g = (0, react_1.useState)(!compact),
    isExpanded = _g[0],
    setIsExpanded = _g[1];
  var _h = (0, react_1.useState)(false),
    showDatePicker = _h[0],
    setShowDatePicker = _h[1];
  var _j = (0, react_1.useState)(false),
    showComparison = _j[0],
    setShowComparison = _j[1];
  var _k = (0, react_1.useState)(""),
    presetName = _k[0],
    setPresetName = _k[1];
  var _l = (0, react_1.useState)(false),
    showSavePreset = _l[0],
    setShowSavePreset = _l[1];
  // Handle date preset selection
  var handleDatePreset = (presetId) => {
    var preset = datePresets.find((p) => p.id === presetId);
    if (preset) {
      var _a = preset.getValue(),
        start = _a.start,
        end = _a.end;
      onFiltersChange({
        dateRange: {
          start: start,
          end: end,
          preset: presetId,
        },
      });
    }
  };
  // Handle custom date range
  var handleCustomDateRange = (start, end) => {
    onFiltersChange({
      dateRange: {
        start: start,
        end: end,
        preset: "custom",
      },
    });
  };
  // Handle filter selection
  var handleFilterSelection = (filterType, value, checked) => {
    var _a;
    var currentValues = filters[filterType];
    var newValues = checked
      ? __spreadArray(__spreadArray([], currentValues, true), [value], false)
      : currentValues.filter((v) => v !== value);
    onFiltersChange(((_a = {}), (_a[filterType] = newValues), _a));
  };
  // Clear all filters
  var clearAllFilters = () => {
    onFiltersChange({
      dateRange: {
        start: (0, date_fns_1.startOfMonth)(new Date()),
        end: (0, date_fns_1.endOfMonth)(new Date()),
        preset: "current-month",
      },
      services: [],
      providers: [],
      locations: [],
      patientSegments: [],
    });
  };
  // Save preset
  var handleSavePreset = () => {
    if (presetName.trim() && onSavePreset) {
      onSavePreset(presetName.trim(), filters);
      setPresetName("");
      setShowSavePreset(false);
    }
  };
  // Load preset
  var handleLoadPreset = (preset) => {
    onFiltersChange(preset.filters);
  };
  // Get active filter count
  var getActiveFilterCount = () =>
    filters.services.length +
    filters.providers.length +
    filters.locations.length +
    filters.patientSegments.length;
  // Render filter section
  var renderFilterSection = (title, icon, options, selectedValues, filterType) => (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        {icon}
        <label_1.Label className="font-medium">{title}</label_1.Label>
        {selectedValues.length > 0 && (
          <badge_1.Badge variant="secondary" className="text-xs">
            {selectedValues.length}
          </badge_1.Badge>
        )}
      </div>
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {options.map((option) => (
          <div key={option.id} className="flex items-center space-x-2">
            <checkbox_1.Checkbox
              id={option.id}
              checked={selectedValues.includes(option.value)}
              onCheckedChange={(checked) =>
                handleFilterSelection(filterType, option.value, checked)
              }
            />
            <label_1.Label htmlFor={option.id} className="text-sm flex-1 cursor-pointer">
              {option.label}
              {option.count && <span className="text-muted-foreground ml-1">({option.count})</span>}
            </label_1.Label>
          </div>
        ))}
      </div>
    </div>
  );
  if (compact && !isExpanded) {
    return (
      <div className={(0, utils_1.cn)("flex items-center space-x-2", className)}>
        <button_1.Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(true)}
          className="flex items-center space-x-2"
        >
          <lucide_react_1.Filter className="h-4 w-4" />
          <span>Filtros</span>
          {getActiveFilterCount() > 0 && (
            <badge_1.Badge variant="secondary" className="ml-1">
              {getActiveFilterCount()}
            </badge_1.Badge>
          )}
        </button_1.Button>

        <select_1.Select value={filters.dateRange.preset} onValueChange={handleDatePreset}>
          <select_1.SelectTrigger className="w-48">
            <lucide_react_1.Calendar className="h-4 w-4 mr-2" />
            <select_1.SelectValue />
          </select_1.SelectTrigger>
          <select_1.SelectContent>
            {datePresets.map((preset) => (
              <select_1.SelectItem key={preset.id} value={preset.id}>
                {preset.label}
              </select_1.SelectItem>
            ))}
          </select_1.SelectContent>
        </select_1.Select>
      </div>
    );
  }
  return (
    <card_1.Card className={(0, utils_1.cn)("w-full", className)}>
      <card_1.CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <lucide_react_1.Filter className="h-5 w-5" />
            <card_1.CardTitle className="text-lg">Filtros Avançados</card_1.CardTitle>
            {getActiveFilterCount() > 0 && (
              <badge_1.Badge variant="secondary">
                {getActiveFilterCount()} ativo{getActiveFilterCount() > 1 ? "s" : ""}
              </badge_1.Badge>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {compact && (
              <button_1.Button variant="ghost" size="sm" onClick={() => setIsExpanded(false)}>
                <lucide_react_1.X className="h-4 w-4" />
              </button_1.Button>
            )}

            <button_1.Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              disabled={isLoading || getActiveFilterCount() === 0}
            >
              <lucide_react_1.RotateCcw className="h-4 w-4 mr-2" />
              Limpar
            </button_1.Button>

            {onSavePreset && (
              <button_1.Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSavePreset(true)}
                disabled={isLoading}
              >
                <lucide_react_1.Save className="h-4 w-4 mr-2" />
                Salvar
              </button_1.Button>
            )}
          </div>
        </div>

        <card_1.CardDescription>
          Personalize a visualização dos KPIs financeiros aplicando filtros específicos
        </card_1.CardDescription>
      </card_1.CardHeader>

      <card_1.CardContent className="space-y-6">
        {/* Date Range Filter */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <lucide_react_1.Calendar className="h-4 w-4" />
            <label_1.Label className="font-medium">Período</label_1.Label>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {datePresets.slice(0, 8).map((preset) => (
              <button_1.Button
                key={preset.id}
                variant={filters.dateRange.preset === preset.id ? "default" : "outline"}
                size="sm"
                onClick={() => handleDatePreset(preset.id)}
                className="text-xs"
              >
                {preset.label}
              </button_1.Button>
            ))}
          </div>

          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>
              {(0, date_fns_1.format)(filters.dateRange.start, "dd/MM/yyyy", {
                locale: locale_1.ptBR,
              })}{" "}
              -{" "}
              {(0, date_fns_1.format)(filters.dateRange.end, "dd/MM/yyyy", {
                locale: locale_1.ptBR,
              })}
            </span>

            <popover_1.Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
              <popover_1.PopoverTrigger asChild>
                <button_1.Button variant="ghost" size="sm" className="h-6 px-2">
                  <lucide_react_1.Settings className="h-3 w-3" />
                </button_1.Button>
              </popover_1.PopoverTrigger>
              <popover_1.PopoverContent className="w-auto p-0" align="start">
                <div className="p-4 space-y-4">
                  <div className="space-y-2">
                    <label_1.Label>Data de Início</label_1.Label>
                    <calendar_1.Calendar
                      mode="single"
                      selected={filters.dateRange.start}
                      onSelect={(date) =>
                        date && handleCustomDateRange(date, filters.dateRange.end)
                      }
                      locale={locale_1.ptBR}
                    />
                  </div>
                  <div className="space-y-2">
                    <label_1.Label>Data de Fim</label_1.Label>
                    <calendar_1.Calendar
                      mode="single"
                      selected={filters.dateRange.end}
                      onSelect={(date) =>
                        date && handleCustomDateRange(filters.dateRange.start, date)
                      }
                      locale={locale_1.ptBR}
                    />
                  </div>
                </div>
              </popover_1.PopoverContent>
            </popover_1.Popover>
          </div>
        </div>

        <separator_1.Separator />

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Services Filter */}
            {renderFilterSection(
              "Serviços",
              <lucide_react_1.Stethoscope className="h-4 w-4" />,
              mockServices,
              filters.services,
              "services",
            )}

            {/* Providers Filter */}
            {renderFilterSection(
              "Profissionais",
              <lucide_react_1.Users className="h-4 w-4" />,
              mockProviders,
              filters.providers,
              "providers",
            )}

            {/* Locations Filter */}
            {renderFilterSection(
              "Unidades",
              <lucide_react_1.MapPin className="h-4 w-4" />,
              mockLocations,
              filters.locations,
              "locations",
            )}

            {/* Patient Segments Filter */}
            {renderFilterSection(
              "Segmentos",
              <lucide_react_1.Target className="h-4 w-4" />,
              mockPatientSegments,
              filters.patientSegments,
              "patientSegments",
            )}
          </div>
        )}

        {/* Comparison Period */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <switch_1.Switch
              id="comparison"
              checked={showComparison}
              onCheckedChange={setShowComparison}
            />
            <label_1.Label htmlFor="comparison" className="font-medium">
              Período de Comparação
            </label_1.Label>
          </div>

          {showComparison && (
            <div className="pl-6 space-y-2">
              <p className="text-sm text-muted-foreground">
                Compare com o período anterior de mesma duração
              </p>
              <div className="text-sm">
                Comparando com:{" "}
                {(0, date_fns_1.format)(
                  new Date(
                    filters.dateRange.start.getTime() -
                      (filters.dateRange.end.getTime() - filters.dateRange.start.getTime()),
                  ),
                  "dd/MM/yyyy",
                  { locale: locale_1.ptBR },
                )}{" "}
                -{" "}
                {(0, date_fns_1.format)(
                  new Date(filters.dateRange.start.getTime() - 1),
                  "dd/MM/yyyy",
                  { locale: locale_1.ptBR },
                )}
              </div>
            </div>
          )}
        </div>

        {/* Saved Presets */}
        {savedPresets.length > 0 && (
          <div className="space-y-3">
            <label_1.Label className="font-medium">Filtros Salvos</label_1.Label>
            <div className="flex flex-wrap gap-2">
              {savedPresets.map((preset) => (
                <button_1.Button
                  key={preset.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleLoadPreset(preset)}
                  className="text-xs"
                >
                  {preset.name}
                </button_1.Button>
              ))}
            </div>
          </div>
        )}
      </card_1.CardContent>

      {/* Save Preset Modal */}
      {showSavePreset && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <card_1.Card className="w-96">
            <card_1.CardHeader>
              <card_1.CardTitle>Salvar Filtros</card_1.CardTitle>
              <card_1.CardDescription>
                Dê um nome para este conjunto de filtros
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              <div className="space-y-2">
                <label_1.Label htmlFor="preset-name">Nome do Preset</label_1.Label>
                <input_1.Input
                  id="preset-name"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  placeholder="Ex: Relatório Mensal"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button_1.Button variant="outline" onClick={() => setShowSavePreset(false)}>
                  Cancelar
                </button_1.Button>
                <button_1.Button onClick={handleSavePreset} disabled={!presetName.trim()}>
                  Salvar
                </button_1.Button>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </div>
      )}
    </card_1.Card>
  );
}

"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentFilters = AppointmentFilters;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var popover_1 = require("@/components/ui/popover");
var calendar_1 = require("@/components/ui/calendar");
var badge_1 = require("@/components/ui/badge");
var separator_1 = require("@/components/ui/separator");
var lucide_react_1 = require("lucide-react");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var utils_1 = require("@/lib/utils");
function AppointmentFilters(_a) {
  var _b, _c;
  var filters = _a.filters,
    onFiltersChange = _a.onFiltersChange,
    onClearFilters = _a.onClearFilters,
    _d = _a.professionals,
    professionals = _d === void 0 ? [] : _d,
    className = _a.className;
  var _e = (0, react_1.useState)(false),
    isOpen = _e[0],
    setIsOpen = _e[1];
  var _f = (0, react_1.useState)(false),
    startDateOpen = _f[0],
    setStartDateOpen = _f[1];
  var _g = (0, react_1.useState)(false),
    endDateOpen = _g[0],
    setEndDateOpen = _g[1];
  // Count active filters
  var activeFiltersCount = [
    filters.professionalId,
    filters.status,
    filters.patientName,
    filters.dateRange === "custom" && (filters.startDate || filters.endDate),
  ].filter(Boolean).length;
  var statusOptions = [
    { value: "pending", label: "Pendente" },
    { value: "confirmed", label: "Confirmado" },
    { value: "cancelled", label: "Cancelado" },
    { value: "completed", label: "Concluído" },
    { value: "no_show", label: "Não Compareceu" },
    { value: "rescheduled", label: "Reagendado" },
  ];
  var dateRangeOptions = [
    { value: "today", label: "Hoje" },
    { value: "week", label: "Esta Semana" },
    { value: "month", label: "Este Mês" },
    { value: "custom", label: "Período Personalizado" },
  ];
  return (
    <div className={(0, utils_1.cn)("", className)}>
      <popover_1.Popover open={isOpen} onOpenChange={setIsOpen}>
        <popover_1.PopoverTrigger asChild>
          <button_1.Button variant="outline" className="relative">
            <lucide_react_1.Filter className="h-4 w-4 mr-2" />
            Filtros
            {activeFiltersCount > 0 && (
              <badge_1.Badge
                variant="secondary"
                className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {activeFiltersCount}
              </badge_1.Badge>
            )}
          </button_1.Button>
        </popover_1.PopoverTrigger>

        <popover_1.PopoverContent className="w-96 p-0" align="start">
          <card_1.Card className="border-0 shadow-none">
            <card_1.CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <card_1.CardTitle className="text-lg">Filtros</card_1.CardTitle>
                  <card_1.CardDescription>Refine sua busca por agendamentos</card_1.CardDescription>
                </div>

                {activeFiltersCount > 0 && (
                  <button_1.Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearFilters}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <lucide_react_1.RotateCcw className="h-3 w-3 mr-1" />
                    Limpar
                  </button_1.Button>
                )}
              </div>
            </card_1.CardHeader>

            <card_1.CardContent className="space-y-6">
              {/* Date Range Filter */}
              <div className="space-y-3">
                <label_1.Label className="flex items-center gap-2">
                  <lucide_react_1.CalendarDays className="h-4 w-4" />
                  Período
                </label_1.Label>

                <select_1.Select
                  value={filters.dateRange}
                  onValueChange={function (value) {
                    return onFiltersChange({ dateRange: value });
                  }}
                >
                  <select_1.SelectTrigger>
                    <select_1.SelectValue placeholder="Selecione o período" />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    {dateRangeOptions.map(function (option) {
                      return (
                        <select_1.SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </select_1.SelectItem>
                      );
                    })}
                  </select_1.SelectContent>
                </select_1.Select>

                {/* Custom Date Range */}
                {filters.dateRange === "custom" && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <label_1.Label className="text-sm">Data Inicial</label_1.Label>
                      <popover_1.Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                        <popover_1.PopoverTrigger asChild>
                          <button_1.Button
                            variant="outline"
                            className={(0, utils_1.cn)(
                              "w-full justify-start text-left font-normal",
                              !filters.startDate && "text-muted-foreground",
                            )}
                          >
                            <lucide_react_1.CalendarDays className="mr-2 h-4 w-4" />
                            {filters.startDate
                              ? (0, date_fns_1.format)(filters.startDate, "dd/MM/yyyy", {
                                  locale: locale_1.pt,
                                })
                              : "Selecionar"}
                          </button_1.Button>
                        </popover_1.PopoverTrigger>
                        <popover_1.PopoverContent className="w-auto p-0" align="start">
                          <calendar_1.Calendar
                            mode="single"
                            selected={filters.startDate}
                            onSelect={function (date) {
                              onFiltersChange({ startDate: date });
                              setStartDateOpen(false);
                            }}
                            locale={locale_1.pt}
                          />
                        </popover_1.PopoverContent>
                      </popover_1.Popover>
                    </div>

                    <div className="space-y-2">
                      <label_1.Label className="text-sm">Data Final</label_1.Label>
                      <popover_1.Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                        <popover_1.PopoverTrigger asChild>
                          <button_1.Button
                            variant="outline"
                            className={(0, utils_1.cn)(
                              "w-full justify-start text-left font-normal",
                              !filters.endDate && "text-muted-foreground",
                            )}
                          >
                            <lucide_react_1.CalendarDays className="mr-2 h-4 w-4" />
                            {filters.endDate
                              ? (0, date_fns_1.format)(filters.endDate, "dd/MM/yyyy", {
                                  locale: locale_1.pt,
                                })
                              : "Selecionar"}
                          </button_1.Button>
                        </popover_1.PopoverTrigger>
                        <popover_1.PopoverContent className="w-auto p-0" align="start">
                          <calendar_1.Calendar
                            mode="single"
                            selected={filters.endDate}
                            onSelect={function (date) {
                              onFiltersChange({ endDate: date });
                              setEndDateOpen(false);
                            }}
                            disabled={function (date) {
                              return filters.startDate ? date < filters.startDate : false;
                            }}
                            locale={locale_1.pt}
                          />
                        </popover_1.PopoverContent>
                      </popover_1.Popover>
                    </div>
                  </div>
                )}
              </div>

              <separator_1.Separator />

              {/* Professional Filter */}
              {professionals.length > 0 && (
                <div className="space-y-3">
                  <label_1.Label className="flex items-center gap-2">
                    <lucide_react_1.Users className="h-4 w-4" />
                    Profissional
                  </label_1.Label>

                  <select_1.Select
                    value={filters.professionalId || ""}
                    onValueChange={function (value) {
                      return onFiltersChange({ professionalId: value || undefined });
                    }}
                  >
                    <select_1.SelectTrigger>
                      <select_1.SelectValue placeholder="Todos os profissionais" />
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="">Todos os profissionais</select_1.SelectItem>
                      {professionals.map(function (prof) {
                        return (
                          <select_1.SelectItem key={prof.id} value={prof.id}>
                            {prof.name}
                          </select_1.SelectItem>
                        );
                      })}
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>
              )}

              {/* Status Filter */}
              <div className="space-y-3">
                <label_1.Label className="flex items-center gap-2">
                  <lucide_react_1.Clock className="h-4 w-4" />
                  Status
                </label_1.Label>

                <select_1.Select
                  value={filters.status || ""}
                  onValueChange={function (value) {
                    return onFiltersChange({ status: value || undefined });
                  }}
                >
                  <select_1.SelectTrigger>
                    <select_1.SelectValue placeholder="Todos os status" />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="">Todos os status</select_1.SelectItem>
                    {statusOptions.map(function (option) {
                      return (
                        <select_1.SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </select_1.SelectItem>
                      );
                    })}
                  </select_1.SelectContent>
                </select_1.Select>
              </div>

              <separator_1.Separator />

              {/* Patient Search */}
              <div className="space-y-3">
                <label_1.Label className="flex items-center gap-2">
                  <lucide_react_1.Search className="h-4 w-4" />
                  Buscar Paciente
                </label_1.Label>

                <div className="relative">
                  <lucide_react_1.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input_1.Input
                    placeholder="Nome do paciente..."
                    value={filters.patientName || ""}
                    onChange={function (e) {
                      return onFiltersChange({ patientName: e.target.value || undefined });
                    }}
                    className="pl-10"
                  />
                  {filters.patientName && (
                    <button_1.Button
                      variant="ghost"
                      size="sm"
                      onClick={function () {
                        return onFiltersChange({ patientName: undefined });
                      }}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    >
                      <lucide_react_1.X className="h-3 w-3" />
                    </button_1.Button>
                  )}
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </popover_1.PopoverContent>
      </popover_1.Popover>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {filters.professionalId && (
            <badge_1.Badge variant="secondary" className="gap-1">
              Profissional:{" "}
              {((_b = professionals.find(function (p) {
                return p.id === filters.professionalId;
              })) === null || _b === void 0
                ? void 0
                : _b.name) || "Selecionado"}
              <lucide_react_1.X
                className="h-3 w-3 cursor-pointer"
                onClick={function () {
                  return onFiltersChange({ professionalId: undefined });
                }}
              />
            </badge_1.Badge>
          )}

          {filters.status && (
            <badge_1.Badge variant="secondary" className="gap-1">
              Status:{" "}
              {(_c = statusOptions.find(function (s) {
                return s.value === filters.status;
              })) === null || _c === void 0
                ? void 0
                : _c.label}
              <lucide_react_1.X
                className="h-3 w-3 cursor-pointer"
                onClick={function () {
                  return onFiltersChange({ status: undefined });
                }}
              />
            </badge_1.Badge>
          )}

          {filters.patientName && (
            <badge_1.Badge variant="secondary" className="gap-1">
              Paciente: {filters.patientName}
              <lucide_react_1.X
                className="h-3 w-3 cursor-pointer"
                onClick={function () {
                  return onFiltersChange({ patientName: undefined });
                }}
              />
            </badge_1.Badge>
          )}

          {filters.dateRange === "custom" && (filters.startDate || filters.endDate) && (
            <badge_1.Badge variant="secondary" className="gap-1">
              Período:{" "}
              {filters.startDate &&
                (0, date_fns_1.format)(filters.startDate, "dd/MM", { locale: locale_1.pt })}{" "}
              -{" "}
              {filters.endDate &&
                (0, date_fns_1.format)(filters.endDate, "dd/MM", { locale: locale_1.pt })}
              <lucide_react_1.X
                className="h-3 w-3 cursor-pointer"
                onClick={function () {
                  return onFiltersChange({
                    startDate: undefined,
                    endDate: undefined,
                    dateRange: "week",
                  });
                }}
              />
            </badge_1.Badge>
          )}
        </div>
      )}
    </div>
  );
}

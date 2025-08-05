"use client";
"use strict";
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarFilters = CalendarFilters;
var react_1 = require("react");
var dialog_1 = require("@/components/ui/dialog");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var checkbox_1 = require("@/components/ui/checkbox");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var separator_1 = require("@/components/ui/separator");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
var moment_1 = require("moment");
require("moment/locale/pt-br");
moment_1.default.locale("pt-br");
// Service type configurations
var serviceTypes = [
  {
    value: "consultation",
    label: "Consulta",
    color: "bg-blue-500",
    lightColor: "bg-blue-100 text-blue-800",
    count: 0, // This would be populated from actual data
  },
  {
    value: "botox",
    label: "Aplicação de Botox",
    color: "bg-violet-500",
    lightColor: "bg-violet-100 text-violet-800",
    count: 0,
  },
  {
    value: "fillers",
    label: "Preenchimento",
    color: "bg-emerald-500",
    lightColor: "bg-emerald-100 text-emerald-800",
    count: 0,
  },
  {
    value: "procedure",
    label: "Procedimento",
    color: "bg-amber-500",
    lightColor: "bg-amber-100 text-amber-800",
    count: 0,
  },
];
// Status configurations
var statusTypes = [
  {
    value: "scheduled",
    label: "Agendado",
    color: "bg-blue-500",
    lightColor: "bg-blue-100 text-blue-800",
    count: 0,
  },
  {
    value: "confirmed",
    label: "Confirmado",
    color: "bg-green-500",
    lightColor: "bg-green-100 text-green-800",
    count: 0,
  },
  {
    value: "in-progress",
    label: "Em Atendimento",
    color: "bg-orange-500",
    lightColor: "bg-orange-100 text-orange-800",
    count: 0,
  },
  {
    value: "completed",
    label: "Concluído",
    color: "bg-gray-500",
    lightColor: "bg-gray-100 text-gray-800",
    count: 0,
  },
  {
    value: "cancelled",
    label: "Cancelado",
    color: "bg-red-500",
    lightColor: "bg-red-100 text-red-800",
    count: 0,
  },
  {
    value: "no-show",
    label: "Faltou",
    color: "bg-gray-400",
    lightColor: "bg-gray-100 text-gray-600",
    count: 0,
  },
];
// Quick date range presets
var datePresets = [
  {
    label: "Hoje",
    getValue: function () {
      return {
        start: (0, moment_1.default)().startOf("day").toDate(),
        end: (0, moment_1.default)().endOf("day").toDate(),
      };
    },
  },
  {
    label: "Esta Semana",
    getValue: function () {
      return {
        start: (0, moment_1.default)().startOf("week").toDate(),
        end: (0, moment_1.default)().endOf("week").toDate(),
      };
    },
  },
  {
    label: "Este Mês",
    getValue: function () {
      return {
        start: (0, moment_1.default)().startOf("month").toDate(),
        end: (0, moment_1.default)().endOf("month").toDate(),
      };
    },
  },
  {
    label: "Próxima Semana",
    getValue: function () {
      return {
        start: (0, moment_1.default)().add(1, "week").startOf("week").toDate(),
        end: (0, moment_1.default)().add(1, "week").endOf("week").toDate(),
      };
    },
  },
  {
    label: "Próximo Mês",
    getValue: function () {
      return {
        start: (0, moment_1.default)().add(1, "month").startOf("month").toDate(),
        end: (0, moment_1.default)().add(1, "month").endOf("month").toDate(),
      };
    },
  },
];
function CalendarFilters(_a) {
  var isOpen = _a.isOpen,
    onClose = _a.onClose,
    filters = _a.filters,
    onFiltersChange = _a.onFiltersChange,
    professionals = _a.professionals;
  var _b = (0, react_1.useState)(filters),
    localFilters = _b[0],
    setLocalFilters = _b[1];
  var _c = (0, react_1.useState)(""),
    searchQuery = _c[0],
    setSearchQuery = _c[1];
  // Update local filters when props change
  react_1.default.useEffect(
    function () {
      setLocalFilters(filters);
    },
    [filters],
  );
  // Filter professionals based on search
  var filteredProfessionals = professionals.filter(function (prof) {
    return (
      prof.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prof.specialization.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });
  // Toggle service type filter
  var toggleServiceType = function (serviceType) {
    setLocalFilters(function (prev) {
      return __assign(__assign({}, prev), {
        serviceTypes: prev.serviceTypes.includes(serviceType)
          ? prev.serviceTypes.filter(function (s) {
              return s !== serviceType;
            })
          : __spreadArray(__spreadArray([], prev.serviceTypes, true), [serviceType], false),
      });
    });
  };
  // Toggle status filter
  var toggleStatus = function (status) {
    setLocalFilters(function (prev) {
      return __assign(__assign({}, prev), {
        statuses: prev.statuses.includes(status)
          ? prev.statuses.filter(function (s) {
              return s !== status;
            })
          : __spreadArray(__spreadArray([], prev.statuses, true), [status], false),
      });
    });
  };
  // Toggle professional filter
  var toggleProfessional = function (professionalId) {
    setLocalFilters(function (prev) {
      return __assign(__assign({}, prev), {
        professionals: prev.professionals.includes(professionalId)
          ? prev.professionals.filter(function (p) {
              return p !== professionalId;
            })
          : __spreadArray(__spreadArray([], prev.professionals, true), [professionalId], false),
      });
    });
  };
  // Set date range
  var setDateRange = function (range) {
    setLocalFilters(function (prev) {
      return __assign(__assign({}, prev), { dateRange: range });
    });
  };
  // Clear specific filter
  var clearServiceTypes = function () {
    setLocalFilters(function (prev) {
      return __assign(__assign({}, prev), { serviceTypes: [] });
    });
  };
  var clearStatuses = function () {
    setLocalFilters(function (prev) {
      return __assign(__assign({}, prev), { statuses: [] });
    });
  };
  var clearProfessionals = function () {
    setLocalFilters(function (prev) {
      return __assign(__assign({}, prev), { professionals: [] });
    });
  };
  var clearDateRange = function () {
    setLocalFilters(function (prev) {
      return __assign(__assign({}, prev), { dateRange: { start: null, end: null } });
    });
  };
  // Clear all filters
  var clearAllFilters = function () {
    var emptyFilters = {
      serviceTypes: [],
      statuses: [],
      professionals: [],
      dateRange: { start: null, end: null },
    };
    setLocalFilters(emptyFilters);
  };
  // Apply filters
  var applyFilters = function () {
    onFiltersChange(localFilters);
    onClose();
  };
  // Count active filters
  var activeFiltersCount =
    localFilters.serviceTypes.length +
    localFilters.statuses.length +
    localFilters.professionals.length +
    (localFilters.dateRange.start || localFilters.dateRange.end ? 1 : 0);
  return (
    <dialog_1.Dialog open={isOpen} onOpenChange={onClose}>
      <dialog_1.DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <lucide_react_1.Filter className="h-5 w-5" />
              <span>Filtros da Agenda</span>
              {activeFiltersCount > 0 && (
                <badge_1.Badge variant="secondary">
                  {activeFiltersCount} ativo{activeFiltersCount > 1 ? "s" : ""}
                </badge_1.Badge>
              )}
            </div>
            <button_1.Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <lucide_react_1.RotateCcw className="h-4 w-4 mr-1" />
              Limpar Tudo
            </button_1.Button>
          </dialog_1.DialogTitle>
          <dialog_1.DialogDescription>
            Filtre as consultas por tipo de serviço, status, profissional ou período
          </dialog_1.DialogDescription>
        </dialog_1.DialogHeader>

        <div className="space-y-6">
          {/* Service Types Filter */}
          <card_1.Card>
            <card_1.CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <card_1.CardTitle className="text-base flex items-center space-x-2">
                  <lucide_react_1.Briefcase className="h-4 w-4" />
                  <span>Tipos de Serviço</span>
                </card_1.CardTitle>
                {localFilters.serviceTypes.length > 0 && (
                  <button_1.Button
                    variant="ghost"
                    size="sm"
                    onClick={clearServiceTypes}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    <lucide_react_1.X className="h-3 w-3 mr-1" />
                    Limpar
                  </button_1.Button>
                )}
              </div>
            </card_1.CardHeader>
            <card_1.CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-3">
                {serviceTypes.map(function (service) {
                  return (
                    <div
                      key={service.value}
                      className={(0, utils_1.cn)(
                        "flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors",
                        localFilters.serviceTypes.includes(service.value)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/50",
                      )}
                      onClick={function () {
                        return toggleServiceType(service.value);
                      }}
                    >
                      <checkbox_1.Checkbox
                        checked={localFilters.serviceTypes.includes(service.value)}
                        readOnly
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <div className={(0, utils_1.cn)("w-3 h-3 rounded-full", service.color)} />
                          <span className="font-medium text-sm">{service.label}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </card_1.CardContent>
          </card_1.Card>

          {/* Status Filter */}
          <card_1.Card>
            <card_1.CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <card_1.CardTitle className="text-base flex items-center space-x-2">
                  <lucide_react_1.Clock className="h-4 w-4" />
                  <span>Status das Consultas</span>
                </card_1.CardTitle>
                {localFilters.statuses.length > 0 && (
                  <button_1.Button
                    variant="ghost"
                    size="sm"
                    onClick={clearStatuses}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    <lucide_react_1.X className="h-3 w-3 mr-1" />
                    Limpar
                  </button_1.Button>
                )}
              </div>
            </card_1.CardHeader>
            <card_1.CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-3">
                {statusTypes.map(function (status) {
                  return (
                    <div
                      key={status.value}
                      className={(0, utils_1.cn)(
                        "flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors",
                        localFilters.statuses.includes(status.value)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/50",
                      )}
                      onClick={function () {
                        return toggleStatus(status.value);
                      }}
                    >
                      <checkbox_1.Checkbox
                        checked={localFilters.statuses.includes(status.value)}
                        readOnly
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <div className={(0, utils_1.cn)("w-3 h-3 rounded-full", status.color)} />
                          <span className="font-medium text-sm">{status.label}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </card_1.CardContent>
          </card_1.Card>

          {/* Professionals Filter */}
          <card_1.Card>
            <card_1.CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <card_1.CardTitle className="text-base flex items-center space-x-2">
                  <lucide_react_1.User className="h-4 w-4" />
                  <span>Profissionais</span>
                </card_1.CardTitle>
                {localFilters.professionals.length > 0 && (
                  <button_1.Button
                    variant="ghost"
                    size="sm"
                    onClick={clearProfessionals}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    <lucide_react_1.X className="h-3 w-3 mr-1" />
                    Limpar
                  </button_1.Button>
                )}
              </div>
            </card_1.CardHeader>
            <card_1.CardContent className="pt-0 space-y-3">
              {/* Search */}
              <div className="relative">
                <lucide_react_1.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input_1.Input
                  placeholder="Buscar profissional..."
                  value={searchQuery}
                  onChange={function (e) {
                    return setSearchQuery(e.target.value);
                  }}
                  className="pl-10"
                />
              </div>

              {/* Professionals List */}
              <div className="max-h-40 overflow-y-auto space-y-2">
                {filteredProfessionals.map(function (professional) {
                  return (
                    <div
                      key={professional.id}
                      className={(0, utils_1.cn)(
                        "flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors",
                        localFilters.professionals.includes(professional.id)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/50",
                      )}
                      onClick={function () {
                        return toggleProfessional(professional.id);
                      }}
                    >
                      <checkbox_1.Checkbox
                        checked={localFilters.professionals.includes(professional.id)}
                        readOnly
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: professional.color }}
                          />
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{professional.name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {professional.specialization}
                            </p>
                          </div>
                        </div>
                      </div>
                      <badge_1.Badge
                        variant={professional.availability ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {professional.availability ? "Ativo" : "Inativo"}
                      </badge_1.Badge>
                    </div>
                  );
                })}
              </div>
            </card_1.CardContent>
          </card_1.Card>

          {/* Date Range Filter */}
          <card_1.Card>
            <card_1.CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <card_1.CardTitle className="text-base flex items-center space-x-2">
                  <lucide_react_1.Calendar className="h-4 w-4" />
                  <span>Período</span>
                </card_1.CardTitle>
                {(localFilters.dateRange.start || localFilters.dateRange.end) && (
                  <button_1.Button
                    variant="ghost"
                    size="sm"
                    onClick={clearDateRange}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    <lucide_react_1.X className="h-3 w-3 mr-1" />
                    Limpar
                  </button_1.Button>
                )}
              </div>
            </card_1.CardHeader>
            <card_1.CardContent className="pt-0 space-y-4">
              {/* Quick Presets */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                {datePresets.map(function (preset, index) {
                  return (
                    <button_1.Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={function () {
                        return setDateRange(preset.getValue());
                      }}
                      className="text-xs"
                    >
                      {preset.label}
                    </button_1.Button>
                  );
                })}
              </div>

              <separator_1.Separator />

              {/* Custom Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label_1.Label className="text-sm">Data Início</label_1.Label>
                  <input_1.Input
                    type="date"
                    value={
                      localFilters.dateRange.start
                        ? (0, moment_1.default)(localFilters.dateRange.start).format("YYYY-MM-DD")
                        : ""
                    }
                    onChange={function (e) {
                      var startDate = e.target.value ? new Date(e.target.value) : null;
                      setLocalFilters(function (prev) {
                        return __assign(__assign({}, prev), {
                          dateRange: __assign(__assign({}, prev.dateRange), { start: startDate }),
                        });
                      });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <label_1.Label className="text-sm">Data Fim</label_1.Label>
                  <input_1.Input
                    type="date"
                    value={
                      localFilters.dateRange.end
                        ? (0, moment_1.default)(localFilters.dateRange.end).format("YYYY-MM-DD")
                        : ""
                    }
                    onChange={function (e) {
                      var endDate = e.target.value ? new Date(e.target.value) : null;
                      setLocalFilters(function (prev) {
                        return __assign(__assign({}, prev), {
                          dateRange: __assign(__assign({}, prev.dateRange), { end: endDate }),
                        });
                      });
                    }}
                    min={
                      localFilters.dateRange.start
                        ? (0, moment_1.default)(localFilters.dateRange.start).format("YYYY-MM-DD")
                        : undefined
                    }
                  />
                </div>
              </div>

              {/* Selected Range Display */}
              {(localFilters.dateRange.start || localFilters.dateRange.end) && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Período selecionado:</p>
                  <p className="font-medium">
                    {localFilters.dateRange.start
                      ? (0, moment_1.default)(localFilters.dateRange.start).format("DD/MM/YYYY")
                      : "..."}{" "}
                    até{" "}
                    {localFilters.dateRange.end
                      ? (0, moment_1.default)(localFilters.dateRange.end).format("DD/MM/YYYY")
                      : "..."}
                  </p>
                </div>
              )}
            </card_1.CardContent>
          </card_1.Card>
        </div>

        <dialog_1.DialogFooter>
          <button_1.Button variant="outline" onClick={onClose}>
            Cancelar
          </button_1.Button>
          <button_1.Button onClick={applyFilters}>
            Aplicar Filtros
            {activeFiltersCount > 0 && (
              <badge_1.Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </badge_1.Badge>
            )}
          </button_1.Button>
        </dialog_1.DialogFooter>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>
  );
}

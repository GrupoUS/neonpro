// components/dashboard/appointments/filters/appointment-filters.tsx
// Main appointment filters component
// Story 1.1 Task 6 - Appointment Filtering and Search
"use client";
var __awaiter =
  (this && this.__awaiter) ||
  ((thisArg, _arguments, P, generator) => {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P((resolve) => {
            resolve(value);
          });
    }
    return new (P || (P = Promise))((resolve, reject) => {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  });
var __generator =
  (this && this.__generator) ||
  ((thisArg, body) => {
    var _ = {
        label: 0,
        sent: () => {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return (v) => step([n, v]);
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  });
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
exports.default = AppointmentFilters;
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var calendar_1 = require("@/components/ui/calendar");
var card_1 = require("@/components/ui/card");
var popover_1 = require("@/components/ui/popover");
var select_1 = require("@/components/ui/select");
var separator_1 = require("@/components/ui/separator");
var use_appointment_filters_1 = require("@/hooks/appointments/use-appointment-filters");
var utils_1 = require("@/lib/utils");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var appointment_search_1 = require("./appointment-search");
// Status options with colors
var statusOptions = [
  { value: "scheduled", label: "Agendado", color: "bg-blue-500" },
  { value: "confirmed", label: "Confirmado", color: "bg-green-500" },
  { value: "in_progress", label: "Em Andamento", color: "bg-yellow-500" },
  { value: "completed", label: "Concluído", color: "bg-emerald-500" },
  { value: "cancelled", label: "Cancelado", color: "bg-red-500" },
  { value: "no_show", label: "Não Compareceu", color: "bg-gray-500" },
];
function AppointmentFilters(_a) {
  var _b, _c, _d;
  var filters = _a.filters,
    onFiltersChange = _a.onFiltersChange,
    onClearFilters = _a.onClearFilters;
  var _e = (0, use_appointment_filters_1.useAppointmentFilters)(),
    hasActiveFilters = _e.hasActiveFilters,
    activeFilterCount = _e.activeFilterCount,
    updateFilter = _e.updateFilter;
  var _f = (0, react_1.useState)({
      professionals: [],
      services: [],
      statuses: [],
    }),
    filterOptionsData = _f[0],
    setFilterOptionsData = _f[1];
  var _g = (0, react_1.useState)(true),
    loading = _g[0],
    setLoading = _g[1];
  // Load filter options from API
  (0, react_1.useEffect)(() => {
    var loadFilterOptions = () =>
      __awaiter(this, void 0, void 0, function () {
        var _a, professionalsRes, servicesRes, professionals, _b, services, _c, error_1;
        return __generator(this, (_d) => {
          switch (_d.label) {
            case 0:
              _d.trys.push([0, 8, 9, 10]);
              setLoading(true);
              return [
                4 /*yield*/,
                Promise.all([fetch("/api/professionals"), fetch("/api/services")]),
              ];
            case 1:
              (_a = _d.sent()), (professionalsRes = _a[0]), (servicesRes = _a[1]);
              if (!professionalsRes.ok) return [3 /*break*/, 3];
              return [4 /*yield*/, professionalsRes.json()];
            case 2:
              _b = _d.sent();
              return [3 /*break*/, 4];
            case 3:
              _b = [];
              _d.label = 4;
            case 4:
              professionals = _b;
              if (!servicesRes.ok) return [3 /*break*/, 6];
              return [4 /*yield*/, servicesRes.json()];
            case 5:
              _c = _d.sent();
              return [3 /*break*/, 7];
            case 6:
              _c = [];
              _d.label = 7;
            case 7:
              services = _c;
              setFilterOptionsData({
                professionals: (professionals.data || []).map((p) => ({
                  value: p.id,
                  label: p.full_name,
                })),
                services: (services.data || []).map((s) => ({
                  value: s.id,
                  label: s.name,
                })),
                statuses: statusOptions.map((s) => ({
                  value: s.value,
                  label: s.label,
                })),
              });
              return [3 /*break*/, 10];
            case 8:
              error_1 = _d.sent();
              console.error("Error loading filter options:", error_1);
              return [3 /*break*/, 10];
            case 9:
              setLoading(false);
              return [7 /*endfinally*/];
            case 10:
              return [2 /*return*/];
          }
        });
      });
    loadFilterOptions();
  }, []);
  // Notify parent when filters change
  (0, react_1.useEffect)(() => {
    if (onFiltersChange) {
      onFiltersChange(filters);
    }
  }, [filters, onFiltersChange]); // Handle status filter changes (multiple selection)
  var handleStatusChange = (status) => {
    var currentStatus = filters.status;
    var newStatus;
    if (Array.isArray(currentStatus)) {
      if (currentStatus.includes(status)) {
        newStatus = currentStatus.filter((s) => s !== status);
        if (newStatus.length === 0) newStatus = undefined;
      } else {
        newStatus = __spreadArray(__spreadArray([], currentStatus, true), [status], false);
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
  var isStatusSelected = (status) => {
    if (Array.isArray(filters.status)) {
      return filters.status.includes(status);
    }
    return filters.status === status;
  };
  return (
    <card_1.Card className="mb-6">
      <card_1.CardContent className="p-4">
        <div className="space-y-4">
          {/* Search Bar - Always visible */}
          <div className="w-full">
            <appointment_search_1.default
              value={filters.search_query || ""}
              onSearch={(query) => updateFilter("search_query", query)}
              placeholder="Buscar por nome do paciente, serviço ou observações..."
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Professional Filter */}
            <div className="flex items-center gap-2">
              <lucide_react_1.User className="h-4 w-4 text-muted-foreground" />
              <select_1.Select
                value={filters.professional_id || ""}
                onValueChange={(value) => updateFilter("professional_id", value || undefined)}
              >
                <select_1.SelectTrigger className="w-[200px]">
                  <select_1.SelectValue placeholder="Profissional" />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="">Todos os profissionais</select_1.SelectItem>
                  {filterOptionsData.professionals.map((professional) => (
                    <select_1.SelectItem key={professional.value} value={professional.value}>
                      {professional.label}
                    </select_1.SelectItem>
                  ))}
                </select_1.SelectContent>
              </select_1.Select>
            </div>{" "}
            {/* Service Filter */}
            <div className="flex items-center gap-2">
              <lucide_react_1.Briefcase className="h-4 w-4 text-muted-foreground" />
              <select_1.Select
                value={filters.service_type_id || ""}
                onValueChange={(value) => updateFilter("service_type_id", value || undefined)}
              >
                <select_1.SelectTrigger className="w-[200px]">
                  <select_1.SelectValue placeholder="Serviço" />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="">Todos os serviços</select_1.SelectItem>
                  {filterOptionsData.services.map((service) => (
                    <select_1.SelectItem key={service.value} value={service.value}>
                      {service.label}
                    </select_1.SelectItem>
                  ))}
                </select_1.SelectContent>
              </select_1.Select>
            </div>
            {/* Status Filter - Multi-select with Popover */}
            <popover_1.Popover>
              <popover_1.PopoverTrigger asChild>
                <button_1.Button variant="outline" className="justify-between min-w-[150px]">
                  <span>
                    {filters.status &&
                    (Array.isArray(filters.status) ? filters.status.length : 1) > 0
                      ? "Status (".concat(
                          Array.isArray(filters.status) ? filters.status.length : 1,
                          ")",
                        )
                      : "Status"}
                  </span>
                  <lucide_react_1.ChevronDown className="h-4 w-4 opacity-50" />
                </button_1.Button>
              </popover_1.PopoverTrigger>
              <popover_1.PopoverContent className="w-56 p-2">
                <div className="space-y-2">
                  {statusOptions.map((status) => (
                    <div
                      key={status.value}
                      className={(0, utils_1.cn)(
                        "flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-muted transition-colors",
                        isStatusSelected(status.value) && "bg-muted",
                      )}
                      onClick={() => handleStatusChange(status.value)}
                    >
                      <div className={(0, utils_1.cn)("w-3 h-3 rounded-full", status.color)} />
                      <span className="text-sm">{status.label}</span>
                      {isStatusSelected(status.value) && (
                        <lucide_react_1.X className="h-3 w-3 ml-auto" />
                      )}
                    </div>
                  ))}
                </div>
              </popover_1.PopoverContent>
            </popover_1.Popover>{" "}
            {/* Date Range Filter */}
            <div className="flex items-center gap-2">
              <lucide_react_1.CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <popover_1.Popover>
                <popover_1.PopoverTrigger asChild>
                  <button_1.Button variant="outline" className="justify-between min-w-[200px]">
                    <span>
                      {filters.date_from || filters.date_to
                        ? ""
                            .concat(
                              filters.date_from
                                ? (0, date_fns_1.format)(filters.date_from, "dd/MM", {
                                    locale: locale_1.ptBR,
                                  })
                                : "",
                              " - ",
                            )
                            .concat(
                              filters.date_to
                                ? (0, date_fns_1.format)(filters.date_to, "dd/MM", {
                                    locale: locale_1.ptBR,
                                  })
                                : "",
                            )
                        : "Período"}
                    </span>
                    <lucide_react_1.ChevronDown className="h-4 w-4 opacity-50" />
                  </button_1.Button>
                </popover_1.PopoverTrigger>
                <popover_1.PopoverContent className="w-auto p-4" align="start">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Data Inicial</label>
                        <popover_1.Popover>
                          <popover_1.PopoverTrigger asChild>
                            <button_1.Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal mt-1"
                            >
                              <lucide_react_1.CalendarIcon className="mr-2 h-4 w-4" />
                              {filters.date_from
                                ? (0, date_fns_1.format)(filters.date_from, "dd/MM/yyyy", {
                                    locale: locale_1.ptBR,
                                  })
                                : <span>Selecionar</span>}
                            </button_1.Button>
                          </popover_1.PopoverTrigger>
                          <popover_1.PopoverContent className="w-auto p-0" align="start">
                            <calendar_1.Calendar
                              mode="single"
                              selected={filters.date_from}
                              onSelect={(date) => updateFilter("date_from", date)}
                              initialFocus
                            />
                          </popover_1.PopoverContent>
                        </popover_1.Popover>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Data Final</label>
                        <popover_1.Popover>
                          <popover_1.PopoverTrigger asChild>
                            <button_1.Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal mt-1"
                            >
                              <lucide_react_1.CalendarIcon className="mr-2 h-4 w-4" />
                              {filters.date_to
                                ? (0, date_fns_1.format)(filters.date_to, "dd/MM/yyyy", {
                                    locale: locale_1.ptBR,
                                  })
                                : <span>Selecionar</span>}
                            </button_1.Button>
                          </popover_1.PopoverTrigger>
                          <popover_1.PopoverContent className="w-auto p-0" align="start">
                            <calendar_1.Calendar
                              mode="single"
                              selected={filters.date_to}
                              onSelect={(date) => updateFilter("date_to", date)}
                              initialFocus
                            />
                          </popover_1.PopoverContent>
                        </popover_1.Popover>
                      </div>
                    </div>{" "}
                    {/* Quick date range buttons */}
                    <div className="flex gap-2">
                      <button_1.Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          var today = new Date();
                          updateFilter("date_from", today);
                          updateFilter("date_to", today);
                        }}
                      >
                        Hoje
                      </button_1.Button>
                      <button_1.Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          var today = new Date();
                          var weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
                          var weekEnd = new Date(
                            today.setDate(today.getDate() - today.getDay() + 6),
                          );
                          updateFilter("date_from", weekStart);
                          updateFilter("date_to", weekEnd);
                        }}
                      >
                        Esta Semana
                      </button_1.Button>
                    </div>
                  </div>
                </popover_1.PopoverContent>
              </popover_1.Popover>
            </div>
            {/* Clear Filters */}
            {hasActiveFilters && (
              <>
                <separator_1.Separator orientation="vertical" className="h-6" />
                <button_1.Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearFilters}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <lucide_react_1.RotateCcw className="h-4 w-4 mr-2" />
                  Limpar ({activeFilterCount})
                </button_1.Button>
              </>
            )}
          </div>

          {/* Active Filter Badges */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              {filters.professional_id && (
                <badge_1.Badge variant="secondary" className="gap-1">
                  Profissional:{" "}
                  {(_b = filterOptionsData.professionals.find(
                    (p) => p.value === filters.professional_id,
                  )) === null || _b === void 0
                    ? void 0
                    : _b.label}
                  <lucide_react_1.X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => updateFilter("professional_id", undefined)}
                  />
                </badge_1.Badge>
              )}
              {filters.service_type_id && (
                <badge_1.Badge variant="secondary" className="gap-1">
                  Serviço:{" "}
                  {(_c = filterOptionsData.services.find(
                    (s) => s.value === filters.service_type_id,
                  )) === null || _c === void 0
                    ? void 0
                    : _c.label}
                  <lucide_react_1.X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => updateFilter("service_type_id", undefined)}
                  />
                </badge_1.Badge>
              )}{" "}
              {filters.status && (
                <>
                  {Array.isArray(filters.status)
                    ? filters.status.map((status) => {
                        var _a;
                        return (
                          <badge_1.Badge key={status} variant="secondary" className="gap-1">
                            Status:{" "}
                            {(_a = statusOptions.find((s) => s.value === status)) === null ||
                            _a === void 0
                              ? void 0
                              : _a.label}
                            <lucide_react_1.X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => handleStatusChange(status)}
                            />
                          </badge_1.Badge>
                        );
                      })
                    : <badge_1.Badge variant="secondary" className="gap-1">
                        Status:{" "}
                        {(_d = statusOptions.find((s) => s.value === filters.status)) === null ||
                        _d === void 0
                          ? void 0
                          : _d.label}
                        <lucide_react_1.X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => updateFilter("status", undefined)}
                        />
                      </badge_1.Badge>}
                </>
              )}
              {filters.date_from && (
                <badge_1.Badge variant="secondary" className="gap-1">
                  Início:{" "}
                  {(0, date_fns_1.format)(filters.date_from, "dd/MM/yyyy", {
                    locale: locale_1.ptBR,
                  })}
                  <lucide_react_1.X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => updateFilter("date_from", undefined)}
                  />
                </badge_1.Badge>
              )}
              {filters.date_to && (
                <badge_1.Badge variant="secondary" className="gap-1">
                  Fim:{" "}
                  {(0, date_fns_1.format)(filters.date_to, "dd/MM/yyyy", { locale: locale_1.ptBR })}
                  <lucide_react_1.X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => updateFilter("date_to", undefined)}
                  />
                </badge_1.Badge>
              )}
              {filters.search_query && (
                <badge_1.Badge variant="secondary" className="gap-1">
                  Busca: "{filters.search_query}"
                  <lucide_react_1.X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => updateFilter("search_query", undefined)}
                  />
                </badge_1.Badge>
              )}
            </div>
          )}
        </div>
      </card_1.CardContent>
    </card_1.Card>
  );
}

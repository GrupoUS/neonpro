"use client";
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      ((t) => {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.hasOwn(s, p)) t[p] = s[p];
        }
        return t;
      });
    return __assign.apply(this, arguments);
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PatientFilters;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var checkbox_1 = require("@/components/ui/checkbox");
var badge_1 = require("@/components/ui/badge");
var separator_1 = require("@/components/ui/separator");
function PatientFilters(_a) {
  var filters = _a.filters,
    onFiltersChange = _a.onFiltersChange;
  var handleFilterChange = (key, value) => {
    var _a;
    onFiltersChange(__assign(__assign({}, filters), ((_a = {}), (_a[key] = value), _a)));
  };
  var clearAllFilters = () => {
    onFiltersChange({
      status: "all",
      riskLevel: "all",
      ageRange: "all",
      hasUpcomingAppointments: false,
    });
  };
  var getActiveFiltersCount = () => {
    var count = 0;
    if (filters.status !== "all") count++;
    if (filters.riskLevel !== "all") count++;
    if (filters.ageRange !== "all") count++;
    if (filters.hasUpcomingAppointments) count++;
    return count;
  };
  var getActiveFiltersList = () => {
    var activeFilters = [];
    if (filters.status !== "all") {
      var statusLabels = {
        active: "Ativo",
        inactive: "Inativo",
        vip: "VIP",
        new: "Novo",
      };
      activeFilters.push({
        key: "status",
        label: "Status: ".concat(statusLabels[filters.status]),
        value: filters.status,
      });
    }
    if (filters.riskLevel !== "all") {
      var riskLabels = {
        low: "Baixo",
        medium: "Médio",
        high: "Alto",
        critical: "Crítico",
      };
      activeFilters.push({
        key: "riskLevel",
        label: "Risco: ".concat(riskLabels[filters.riskLevel]),
        value: filters.riskLevel,
      });
    }
    if (filters.ageRange !== "all") {
      var ageLabels = {
        "0-18": "0-18 anos",
        "19-30": "19-30 anos",
        "31-50": "31-50 anos",
        "51-70": "51-70 anos",
        "70+": "70+ anos",
      };
      activeFilters.push({
        key: "ageRange",
        label: "Idade: ".concat(ageLabels[filters.ageRange]),
        value: filters.ageRange,
      });
    }
    if (filters.hasUpcomingAppointments) {
      activeFilters.push({
        key: "hasUpcomingAppointments",
        label: "Com consultas agendadas",
        value: true,
      });
    }
    return activeFilters;
  };
  var activeFiltersCount = getActiveFiltersCount();
  var activeFiltersList = getActiveFiltersList();
  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Status Filter */}
        <div className="space-y-2">
          <label_1.Label className="text-sm font-medium flex items-center">
            <lucide_react_1.UserCheck className="h-4 w-4 mr-1" />
            Status do Paciente
          </label_1.Label>
          <select_1.Select
            value={filters.status}
            onValueChange={(value) => handleFilterChange("status", value)}
          >
            <select_1.SelectTrigger className="w-full">
              <select_1.SelectValue placeholder="Todos os status" />
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="all">Todos os status</select_1.SelectItem>
              <select_1.SelectItem value="active">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  Ativo
                </div>
              </select_1.SelectItem>
              <select_1.SelectItem value="inactive">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-gray-500 rounded-full mr-2" />
                  Inativo
                </div>
              </select_1.SelectItem>
              <select_1.SelectItem value="vip">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2" />
                  VIP ⭐
                </div>
              </select_1.SelectItem>
              <select_1.SelectItem value="new">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                  Novo
                </div>
              </select_1.SelectItem>
            </select_1.SelectContent>
          </select_1.Select>
        </div>

        {/* Risk Level Filter */}
        <div className="space-y-2">
          <label_1.Label className="text-sm font-medium flex items-center">
            <lucide_react_1.AlertTriangle className="h-4 w-4 mr-1" />
            Nível de Risco
          </label_1.Label>
          <select_1.Select
            value={filters.riskLevel}
            onValueChange={(value) => handleFilterChange("riskLevel", value)}
          >
            <select_1.SelectTrigger className="w-full">
              <select_1.SelectValue placeholder="Todos os níveis" />
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="all">Todos os níveis</select_1.SelectItem>
              <select_1.SelectItem value="low">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  Baixo
                </div>
              </select_1.SelectItem>
              <select_1.SelectItem value="medium">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2" />
                  Médio
                </div>
              </select_1.SelectItem>
              <select_1.SelectItem value="high">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-2" />
                  Alto
                </div>
              </select_1.SelectItem>
              <select_1.SelectItem value="critical">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                  Crítico
                </div>
              </select_1.SelectItem>
            </select_1.SelectContent>
          </select_1.Select>
        </div>

        {/* Age Range Filter */}
        <div className="space-y-2">
          <label_1.Label className="text-sm font-medium flex items-center">
            <lucide_react_1.Calendar className="h-4 w-4 mr-1" />
            Faixa Etária
          </label_1.Label>
          <select_1.Select
            value={filters.ageRange}
            onValueChange={(value) => handleFilterChange("ageRange", value)}
          >
            <select_1.SelectTrigger className="w-full">
              <select_1.SelectValue placeholder="Todas as idades" />
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="all">Todas as idades</select_1.SelectItem>
              <select_1.SelectItem value="0-18">0-18 anos</select_1.SelectItem>
              <select_1.SelectItem value="19-30">19-30 anos</select_1.SelectItem>
              <select_1.SelectItem value="31-50">31-50 anos</select_1.SelectItem>
              <select_1.SelectItem value="51-70">51-70 anos</select_1.SelectItem>
              <select_1.SelectItem value="70+">70+ anos</select_1.SelectItem>
            </select_1.SelectContent>
          </select_1.Select>
        </div>

        {/* Upcoming Appointments Filter */}
        <div className="space-y-2">
          <label_1.Label className="text-sm font-medium flex items-center">
            <lucide_react_1.Clock className="h-4 w-4 mr-1" />
            Consultas Agendadas
          </label_1.Label>
          <div className="flex items-center space-x-2 h-10 px-3 border rounded-md">
            <checkbox_1.Checkbox
              id="upcoming-appointments"
              checked={filters.hasUpcomingAppointments}
              onCheckedChange={(checked) =>
                handleFilterChange("hasUpcomingAppointments", !!checked)
              }
            />
            <label_1.Label htmlFor="upcoming-appointments" className="text-sm cursor-pointer">
              Com consultas agendadas
            </label_1.Label>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <>
          <separator_1.Separator />
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <lucide_react_1.Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filtros ativos ({activeFiltersCount})</span>
              </div>
              <button_1.Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <lucide_react_1.X className="h-3 w-3 mr-1" />
                Limpar todos
              </button_1.Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {activeFiltersList.map((filter) => (
                <badge_1.Badge
                  key={filter.key}
                  variant="secondary"
                  className="flex items-center gap-1 pr-1"
                >
                  <span className="text-xs">{filter.label}</span>
                  <button_1.Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (filter.key === "hasUpcomingAppointments") {
                        handleFilterChange(filter.key, false);
                      } else {
                        handleFilterChange(filter.key, "all");
                      }
                    }}
                    className="h-4 w-4 p-0 hover:bg-muted-foreground/20 ml-1"
                  >
                    <lucide_react_1.X className="h-3 w-3" />
                  </button_1.Button>
                </badge_1.Badge>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Filter Instructions */}
      <div className="text-xs text-muted-foreground">
        <div>
          <strong>Dica:</strong> Combine múltiplos filtros para refinar sua busca. Os filtros
          trabalham em conjunto para mostrar apenas pacientes que atendem a todos os critérios
          selecionados.
        </div>
      </div>
    </div>
  );
}

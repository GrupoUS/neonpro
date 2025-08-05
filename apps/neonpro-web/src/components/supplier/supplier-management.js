// ============================================================================
// Supplier Management Component - Epic 6, Story 6.3
// ============================================================================
// Central component for supplier management with integrated list, forms,
// analytics, and performance tracking functionality
// ============================================================================
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
exports.SupplierManagement = SupplierManagement;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var select_1 = require("@/components/ui/select");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
var supplier_1 = require("@/lib/types/supplier");
var use_supplier_1 = require("@/lib/hooks/use-supplier");
var supplier_list_1 = require("./supplier-list");
var supplier_form_1 = require("./supplier-form");
var supplier_detail_1 = require("./supplier-detail");
var utils_1 = require("@/lib/utils");
// ============================================================================
// STATS CARD COMPONENT
// ============================================================================
var StatsCard = function (_a) {
  var title = _a.title,
    value = _a.value,
    subtitle = _a.subtitle,
    icon = _a.icon,
    trend = _a.trend,
    trendValue = _a.trendValue,
    _b = _a.color,
    color = _b === void 0 ? "default" : _b,
    onClick = _a.onClick;
  var colorClasses = {
    default: "border-gray-200 hover:border-gray-300",
    success: "border-green-200 bg-green-50 hover:border-green-300",
    warning: "border-yellow-200 bg-yellow-50 hover:border-yellow-300",
    danger: "border-red-200 bg-red-50 hover:border-red-300",
  };
  var trendIcon =
    trend === "up"
      ? <lucide_react_1.TrendingUp className="h-4 w-4 text-green-600" />
      : trend === "down"
        ? <lucide_react_1.TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
        : null;
  return (
    <card_1.Card
      className={(0, utils_1.cn)(
        "transition-all cursor-pointer",
        colorClasses[color],
        onClick && "hover:shadow-md",
      )}
      onClick={onClick}
    >
      <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <card_1.CardTitle className="text-sm font-medium text-gray-600">{title}</card_1.CardTitle>
        <div className="text-gray-400">{icon}</div>
      </card_1.CardHeader>
      <card_1.CardContent>
        <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        {trendValue && trendIcon && (
          <div className="flex items-center space-x-1 mt-2">
            {trendIcon}
            <span
              className={(0, utils_1.cn)(
                "text-xs font-medium",
                trend === "up" ? "text-green-600" : "text-red-600",
              )}
            >
              {trendValue}
            </span>
          </div>
        )}
      </card_1.CardContent>
    </card_1.Card>
  );
};
// ============================================================================
// MAIN COMPONENT
// ============================================================================
function SupplierManagement(_a) {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  var clinicId = _a.clinicId,
    initialStats = _a.initialStats;
  var _b = (0, react_1.useState)({
      search: "",
      status: "all",
      category: "all",
      riskLevel: "all",
      sortBy: "name",
      sortOrder: "asc",
    }),
    filters = _b[0],
    setFilters = _b[1];
  var _c = (0, react_1.useState)(null),
    selectedSupplier = _c[0],
    setSelectedSupplier = _c[1];
  var _d = (0, react_1.useState)(false),
    showCreateForm = _d[0],
    setShowCreateForm = _d[1];
  var _e = (0, react_1.useState)(false),
    showEditForm = _e[0],
    setShowEditForm = _e[1];
  var _f = (0, react_1.useState)(false),
    showDetailView = _f[0],
    setShowDetailView = _f[1];
  // Data hooks
  var _g = (0, use_supplier_1.useSuppliers)(clinicId),
    suppliers = _g.suppliers,
    isLoadingSuppliers = _g.isLoading,
    suppliersError = _g.error,
    refetchSuppliers = _g.refetch;
  var _h = (0, use_supplier_1.useSupplierStats)(clinicId),
    stats = _h.stats,
    isLoadingStats = _h.isLoading,
    statsError = _h.error;
  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================
  var displayStats = stats ||
    initialStats || {
      totalSuppliers: 0,
      activeSuppliers: 0,
      performanceIssues: 0,
      averagePerformance: 0,
    };
  var filteredSuppliers =
    (suppliers === null || suppliers === void 0
      ? void 0
      : suppliers.filter(function (supplier) {
          var _a, _b, _c, _d;
          // Search filter
          if (filters.search) {
            var searchLower = filters.search.toLowerCase();
            if (
              !supplier.name.toLowerCase().includes(searchLower) &&
              !((_a = supplier.legal_name) === null || _a === void 0
                ? void 0
                : _a.toLowerCase().includes(searchLower)) &&
              !((_b = supplier.cnpj) === null || _b === void 0
                ? void 0
                : _b.includes(filters.search)) &&
              !((_d =
                (_c = supplier.primary_contact) === null || _c === void 0 ? void 0 : _c.email) ===
                null || _d === void 0
                ? void 0
                : _d.toLowerCase().includes(searchLower))
            ) {
              return false;
            }
          }
          // Status filter
          if (filters.status !== "all" && supplier.status !== filters.status) {
            return false;
          }
          // Category filter
          if (filters.category !== "all" && supplier.category !== filters.category) {
            return false;
          }
          // Risk level filter
          if (filters.riskLevel !== "all" && supplier.risk_level !== filters.riskLevel) {
            return false;
          }
          return true;
        })) || [];
  var sortedSuppliers = __spreadArray([], filteredSuppliers, true).sort(function (a, b) {
    var order = filters.sortOrder === "asc" ? 1 : -1;
    switch (filters.sortBy) {
      case "name":
        return order * a.name.localeCompare(b.name);
      case "created_at":
        return order * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      case "performance_score":
        return order * ((a.performance_score || 0) - (b.performance_score || 0));
      default:
        return 0;
    }
  });
  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  var handleSearch = function (value) {
    setFilters(function (prev) {
      return __assign(__assign({}, prev), { search: value });
    });
  };
  var handleFilterChange = function (key, value) {
    setFilters(function (prev) {
      var _a;
      return __assign(__assign({}, prev), ((_a = {}), (_a[key] = value), _a));
    });
  };
  var handleCreateSupplier = function () {
    setSelectedSupplier(null);
    setShowCreateForm(true);
  };
  var handleEditSupplier = function (supplier) {
    setSelectedSupplier(supplier);
    setShowEditForm(true);
  };
  var handleViewSupplier = function (supplier) {
    setSelectedSupplier(supplier);
    setShowDetailView(true);
  };
  var handleDeleteSupplier = function (supplier) {
    // The actual deletion is handled by the SupplierDetail component
    setSelectedSupplier(supplier);
    setShowDetailView(true);
  };
  var handleSupplierSuccess = function () {
    setShowCreateForm(false);
    setShowEditForm(false);
    refetchSuppliers();
    sonner_1.toast.success("Operação realizada com sucesso!");
  };
  var handleRefresh = function () {
    refetchSuppliers();
    sonner_1.toast.success("Dados atualizados!");
  };
  var handleExport = function () {
    // Implementation for data export
    sonner_1.toast.info("Funcionalidade de exportação em desenvolvimento");
  };
  var handleImport = function () {
    // Implementation for data import
    sonner_1.toast.info("Funcionalidade de importação em desenvolvimento");
  };
  // ============================================================================
  // RENDER HELPERS
  // ============================================================================
  var renderStatsCards = function () {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total de Fornecedores"
          value={displayStats.totalSuppliers}
          icon={<lucide_react_1.Building2 className="h-4 w-4" />}
          subtitle="Todos os fornecedores cadastrados"
          onClick={function () {
            return handleFilterChange("status", "all");
          }}
        />

        <StatsCard
          title="Fornecedores Ativos"
          value={displayStats.activeSuppliers}
          icon={<lucide_react_1.Users className="h-4 w-4" />}
          subtitle={"".concat(
            (0, utils_1.formatPercentage)(
              displayStats.activeSuppliers / Math.max(displayStats.totalSuppliers, 1),
            ),
            " do total",
          )}
          color="success"
          onClick={function () {
            return handleFilterChange("status", supplier_1.SupplierStatus.ACTIVE);
          }}
        />

        <StatsCard
          title="Performance Média"
          value={"".concat(displayStats.averagePerformance, "%")}
          icon={<lucide_react_1.TrendingUp className="h-4 w-4" />}
          subtitle="Baseado em todos os fornecedores"
          color={
            displayStats.averagePerformance >= 80
              ? "success"
              : displayStats.averagePerformance >= 60
                ? "warning"
                : "danger"
          }
          onClick={function () {
            return handleFilterChange("sortBy", "performance_score");
          }}
        />

        <StatsCard
          title="Alertas de Performance"
          value={displayStats.performanceIssues}
          icon={<lucide_react_1.AlertTriangle className="h-4 w-4" />}
          subtitle="Fornecedores com problemas"
          color={displayStats.performanceIssues > 0 ? "warning" : "success"}
          onClick={function () {
            // Filter to show suppliers with performance < 70%
            sonner_1.toast.info("Filtro de performance aplicado");
          }}
        />
      </div>
    );
  };
  var renderFiltersAndActions = function () {
    return (
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <lucide_react_1.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input_1.Input
              placeholder="Buscar fornecedores..."
              value={filters.search}
              onChange={function (e) {
                return handleSearch(e.target.value);
              }}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <select_1.Select
            value={filters.status}
            onValueChange={function (value) {
              return handleFilterChange("status", value);
            }}
          >
            <select_1.SelectTrigger className="w-40">
              <select_1.SelectValue placeholder="Status" />
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="all">Todos os Status</select_1.SelectItem>
              {Object.values(supplier_1.SupplierStatus).map(function (status) {
                return (
                  <select_1.SelectItem key={status} value={status}>
                    {status.replace("_", " ")}
                  </select_1.SelectItem>
                );
              })}
            </select_1.SelectContent>
          </select_1.Select>

          <select_1.Select
            value={filters.category}
            onValueChange={function (value) {
              return handleFilterChange("category", value);
            }}
          >
            <select_1.SelectTrigger className="w-48">
              <select_1.SelectValue placeholder="Categoria" />
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="all">Todas as Categorias</select_1.SelectItem>
              {Object.values(supplier_1.SupplierCategory).map(function (category) {
                return (
                  <select_1.SelectItem key={category} value={category}>
                    {category.replace("_", " ").toLowerCase()}
                  </select_1.SelectItem>
                );
              })}
            </select_1.SelectContent>
          </select_1.Select>

          <select_1.Select
            value={filters.riskLevel}
            onValueChange={function (value) {
              return handleFilterChange("riskLevel", value);
            }}
          >
            <select_1.SelectTrigger className="w-32">
              <select_1.SelectValue placeholder="Risco" />
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="all">Todos</select_1.SelectItem>
              {Object.values(supplier_1.RiskLevel).map(function (level) {
                return (
                  <select_1.SelectItem key={level} value={level}>
                    {level}
                  </select_1.SelectItem>
                );
              })}
            </select_1.SelectContent>
          </select_1.Select>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button_1.Button variant="outline" onClick={handleRefresh}>
            <lucide_react_1.RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </button_1.Button>

          <dropdown_menu_1.DropdownMenu>
            <dropdown_menu_1.DropdownMenuTrigger asChild>
              <button_1.Button variant="outline">
                <lucide_react_1.MoreHorizontal className="h-4 w-4" />
              </button_1.Button>
            </dropdown_menu_1.DropdownMenuTrigger>
            <dropdown_menu_1.DropdownMenuContent align="end">
              <dropdown_menu_1.DropdownMenuLabel>Ações</dropdown_menu_1.DropdownMenuLabel>
              <dropdown_menu_1.DropdownMenuSeparator />
              <dropdown_menu_1.DropdownMenuItem onClick={handleExport}>
                <lucide_react_1.Download className="h-4 w-4 mr-2" />
                Exportar Dados
              </dropdown_menu_1.DropdownMenuItem>
              <dropdown_menu_1.DropdownMenuItem onClick={handleImport}>
                <lucide_react_1.Upload className="h-4 w-4 mr-2" />
                Importar Dados
              </dropdown_menu_1.DropdownMenuItem>
            </dropdown_menu_1.DropdownMenuContent>
          </dropdown_menu_1.DropdownMenu>

          <button_1.Button onClick={handleCreateSupplier}>
            <lucide_react_1.Plus className="h-4 w-4 mr-2" />
            Novo Fornecedor
          </button_1.Button>
        </div>
      </div>
    );
  };
  // ============================================================================
  // ERROR HANDLING
  // ============================================================================
  if (suppliersError || statsError) {
    return (
      <card_1.Card>
        <card_1.CardContent className="p-6">
          <div className="text-center">
            <lucide_react_1.AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar dados</h3>
            <p className="text-gray-600 mb-4">
              Ocorreu um erro ao carregar os dados dos fornecedores.
            </p>
            <button_1.Button onClick={handleRefresh}>
              <lucide_react_1.RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </button_1.Button>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {renderStatsCards()}

      {/* Filters and Actions */}
      {renderFiltersAndActions()}

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Mostrando {sortedSuppliers.length} de{" "}
          {(suppliers === null || suppliers === void 0 ? void 0 : suppliers.length) || 0}{" "}
          fornecedores
        </span>

        <div className="flex items-center space-x-4">
          <span>Ordenar por:</span>
          <select_1.Select
            value={filters.sortBy}
            onValueChange={function (value) {
              return handleFilterChange("sortBy", value);
            }}
          >
            <select_1.SelectTrigger className="w-40">
              <select_1.SelectValue />
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="name">Nome</select_1.SelectItem>
              <select_1.SelectItem value="created_at">Data de Criação</select_1.SelectItem>
              <select_1.SelectItem value="performance_score">Performance</select_1.SelectItem>
            </select_1.SelectContent>
          </select_1.Select>

          <button_1.Button
            variant="outline"
            size="sm"
            onClick={function () {
              return handleFilterChange("sortOrder", filters.sortOrder === "asc" ? "desc" : "asc");
            }}
          >
            {filters.sortOrder === "asc" ? "↑" : "↓"}
          </button_1.Button>
        </div>
      </div>

      {/* Supplier List */}
      <supplier_list_1.SupplierList
        suppliers={sortedSuppliers}
        isLoading={isLoadingSuppliers}
        onView={handleViewSupplier}
        onEdit={handleEditSupplier}
        onDelete={handleDeleteSupplier}
        clinicId={clinicId}
      />

      {/* Modals */}
      {showCreateForm && (
        <supplier_form_1.SupplierForm
          open={showCreateForm}
          onOpenChange={setShowCreateForm}
          clinicId={clinicId}
          mode="create"
          onSuccess={handleSupplierSuccess}
        />
      )}

      {showEditForm && selectedSupplier && (
        <supplier_form_1.SupplierForm
          open={showEditForm}
          onOpenChange={setShowEditForm}
          supplier={selectedSupplier}
          clinicId={clinicId}
          mode="edit"
          onSuccess={handleSupplierSuccess}
        />
      )}

      {showDetailView && selectedSupplier && (
        <supplier_detail_1.SupplierDetail
          open={showDetailView}
          onOpenChange={setShowDetailView}
          supplierId={selectedSupplier.id}
          clinicId={clinicId}
          onEdit={handleEditSupplier}
          onDelete={function () {
            setShowDetailView(false);
            refetchSuppliers();
          }}
        />
      )}
    </div>
  );
}

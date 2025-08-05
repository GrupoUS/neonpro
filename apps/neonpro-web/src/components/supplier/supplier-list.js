// ============================================================================
// Supplier List Component - Epic 6, Story 6.3
// ============================================================================
// Comprehensive supplier management interface with search, filtering,
// sorting, and bulk operations for NeonPro clinic management
// ============================================================================
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
exports.SupplierList = SupplierList;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var badge_1 = require("@/components/ui/badge");
var avatar_1 = require("@/components/ui/avatar");
var select_1 = require("@/components/ui/select");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var table_1 = require("@/components/ui/table");
var checkbox_1 = require("@/components/ui/checkbox");
var progress_1 = require("@/components/ui/progress");
var skeleton_1 = require("@/components/ui/skeleton");
var lucide_react_1 = require("lucide-react");
var supplier_1 = require("@/lib/types/supplier");
var use_supplier_1 = require("@/lib/hooks/use-supplier");
var utils_1 = require("@/lib/utils");
// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
var getStatusColor = (status) => {
  switch (status) {
    case supplier_1.SupplierStatus.ACTIVE:
      return "bg-green-100 text-green-800 border-green-200";
    case supplier_1.SupplierStatus.INACTIVE:
      return "bg-gray-100 text-gray-800 border-gray-200";
    case supplier_1.SupplierStatus.SUSPENDED:
      return "bg-red-100 text-red-800 border-red-200";
    case supplier_1.SupplierStatus.PENDING_VERIFICATION:
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case supplier_1.SupplierStatus.BLOCKED:
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};
var getStatusIcon = (status) => {
  switch (status) {
    case supplier_1.SupplierStatus.ACTIVE:
      return <lucide_react_1.CheckCircle className="h-3 w-3" />;
    case supplier_1.SupplierStatus.INACTIVE:
      return <lucide_react_1.Minus className="h-3 w-3" />;
    case supplier_1.SupplierStatus.SUSPENDED:
      return <lucide_react_1.XCircle className="h-3 w-3" />;
    case supplier_1.SupplierStatus.PENDING_VERIFICATION:
      return <lucide_react_1.Clock className="h-3 w-3" />;
    case supplier_1.SupplierStatus.BLOCKED:
      return <lucide_react_1.AlertTriangle className="h-3 w-3" />;
    default:
      return <lucide_react_1.Minus className="h-3 w-3" />;
  }
};
var getRiskColor = (riskLevel) => {
  switch (riskLevel) {
    case supplier_1.RiskLevel.LOW:
      return "bg-green-100 text-green-800";
    case supplier_1.RiskLevel.MEDIUM:
      return "bg-yellow-100 text-yellow-800";
    case supplier_1.RiskLevel.HIGH:
      return "bg-orange-100 text-orange-800";
    case supplier_1.RiskLevel.CRITICAL:
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};
var getCategoryIcon = (category) => {
  switch (category) {
    case supplier_1.SupplierCategory.MEDICAL_EQUIPMENT:
      return "🏥";
    case supplier_1.SupplierCategory.AESTHETIC_SUPPLIES:
      return "💄";
    case supplier_1.SupplierCategory.PHARMACEUTICALS:
      return "💊";
    case supplier_1.SupplierCategory.CONSUMABLES:
      return "📦";
    case supplier_1.SupplierCategory.TECHNOLOGY:
      return "💻";
    case supplier_1.SupplierCategory.SERVICES:
      return "🔧";
    case supplier_1.SupplierCategory.MAINTENANCE:
      return "⚙️";
    case supplier_1.SupplierCategory.OFFICE_SUPPLIES:
      return "📋";
    default:
      return "📦";
  }
};
var getPerformanceTrend = (score, previousScore) => {
  if (!previousScore)
    return { icon: <lucide_react_1.Minus className="h-3 w-3" />, color: "text-gray-500" };
  var difference = score - previousScore;
  if (difference > 5)
    return { icon: <lucide_react_1.TrendingUp className="h-3 w-3" />, color: "text-green-600" };
  if (difference < -5)
    return { icon: <lucide_react_1.TrendingDown className="h-3 w-3" />, color: "text-red-600" };
  return { icon: <lucide_react_1.Minus className="h-3 w-3" />, color: "text-gray-500" };
};
// ============================================================================
// MAIN COMPONENT
// ============================================================================
function SupplierList(_a) {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  var clinicId = _a.clinicId,
    onSupplierSelect = _a.onSupplierSelect,
    onSupplierCreate = _a.onSupplierCreate,
    onSupplierEdit = _a.onSupplierEdit,
    onSupplierDelete = _a.onSupplierDelete,
    _b = _a.selectable,
    selectable = _b === void 0 ? false : _b,
    _c = _a.compactView,
    compactView = _c === void 0 ? false : _c;
  var _d = (0, react_1.useState)([]),
    selectedSuppliers = _d[0],
    setSelectedSuppliers = _d[1];
  var _e = (0, react_1.useState)("name"),
    sortBy = _e[0],
    setSortBy = _e[1];
  var _f = (0, react_1.useState)("asc"),
    sortOrder = _f[0],
    setSortOrder = _f[1];
  var _g = (0, react_1.useState)("table"),
    viewMode = _g[0],
    setViewMode = _g[1];
  // Search and filtering
  var _h = (0, use_supplier_1.useSupplierSearch)(),
    searchTerm = _h.searchTerm,
    setSearchTerm = _h.setSearchTerm,
    selectedCategories = _h.selectedCategories,
    setSelectedCategories = _h.setSelectedCategories,
    selectedStatuses = _h.selectedStatuses,
    setSelectedStatuses = _h.setSelectedStatuses,
    selectedRiskLevels = _h.selectedRiskLevels,
    setSelectedRiskLevels = _h.setSelectedRiskLevels,
    filters = _h.filters,
    clearFilters = _h.clearFilters,
    hasActiveFilters = _h.hasActiveFilters;
  // Data fetching
  var _j = (0, use_supplier_1.useSuppliers)(clinicId, filters),
    suppliers = _j.suppliers,
    isLoading = _j.isLoading,
    error = _j.error,
    refetch = _j.refetch,
    createSupplier = _j.createSupplier,
    updateSupplier = _j.updateSupplier,
    deleteSupplier = _j.deleteSupplier,
    toggleSupplierStatus = _j.toggleSupplierStatus,
    isCreating = _j.isCreating,
    isUpdating = _j.isUpdating,
    isDeleting = _j.isDeleting,
    isTogglingStatus = _j.isTogglingStatus;
  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================
  // Sorted and filtered suppliers
  var sortedSuppliers = (0, react_1.useMemo)(() => {
    if (!(suppliers === null || suppliers === void 0 ? void 0 : suppliers.length)) return [];
    var sorted = __spreadArray([], suppliers, true).sort((a, b) => {
      var aValue, bValue;
      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "performance":
          aValue = a.performance_score || 0;
          bValue = b.performance_score || 0;
          break;
        case "category":
          aValue = a.category;
          bValue = b.category;
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "risk":
          aValue = a.risk_level;
          bValue = b.risk_level;
          break;
        default:
          return 0;
      }
      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [suppliers, sortBy, sortOrder]);
  // Statistics
  var statistics = (0, react_1.useMemo)(() => {
    if (!(suppliers === null || suppliers === void 0 ? void 0 : suppliers.length))
      return {
        total: 0,
        active: 0,
        averagePerformance: 0,
        highRisk: 0,
      };
    var total = suppliers.length;
    var active = suppliers.filter((s) => s.status === supplier_1.SupplierStatus.ACTIVE).length;
    var averagePerformance =
      suppliers.reduce((sum, s) => sum + (s.performance_score || 0), 0) / total;
    var highRisk = suppliers.filter(
      (s) =>
        s.risk_level === supplier_1.RiskLevel.HIGH ||
        s.risk_level === supplier_1.RiskLevel.CRITICAL,
    ).length;
    return {
      total: total,
      active: active,
      averagePerformance: averagePerformance,
      highRisk: highRisk,
    };
  }, [suppliers]);
  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  var handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };
  var handleSelectSupplier = (supplierId) => {
    if (!selectable) return;
    setSelectedSuppliers((prev) =>
      prev.includes(supplierId)
        ? prev.filter((id) => id !== supplierId)
        : __spreadArray(__spreadArray([], prev, true), [supplierId], false),
    );
  };
  var handleSelectAll = () => {
    if (!selectable) return;
    if (selectedSuppliers.length === sortedSuppliers.length) {
      setSelectedSuppliers([]);
    } else {
      setSelectedSuppliers(sortedSuppliers.map((s) => s.id));
    }
  };
  var handleBulkAction = (action) => {
    // Implementation for bulk actions
    console.log("Bulk ".concat(action, " for:"), selectedSuppliers);
  };
  // ============================================================================
  // RENDER HELPERS
  // ============================================================================
  var renderSupplierCard = (supplier) => {
    var _a;
    return (
      <card_1.Card
        key={supplier.id}
        className={(0, utils_1.cn)(
          "transition-all hover:shadow-md cursor-pointer",
          selectedSuppliers.includes(supplier.id) && "ring-2 ring-blue-500",
        )}
        onClick={() =>
          onSupplierSelect === null || onSupplierSelect === void 0
            ? void 0
            : onSupplierSelect(supplier)
        }
      >
        <card_1.CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <avatar_1.Avatar className="h-10 w-10">
                <avatar_1.AvatarFallback className="bg-blue-100 text-blue-600">
                  {supplier.name.substring(0, 2).toUpperCase()}
                </avatar_1.AvatarFallback>
              </avatar_1.Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-sm truncate">{supplier.name}</h3>
                  <span className="text-xs">{getCategoryIcon(supplier.category)}</span>
                </div>
                <p className="text-xs text-gray-500 truncate">{supplier.legal_name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <badge_1.Badge
                    variant="secondary"
                    className={(0, utils_1.cn)("text-xs", getStatusColor(supplier.status))}
                  >
                    {getStatusIcon(supplier.status)}
                    <span className="ml-1">{supplier.status}</span>
                  </badge_1.Badge>
                  <badge_1.Badge
                    variant="outline"
                    className={(0, utils_1.cn)("text-xs", getRiskColor(supplier.risk_level))}
                  >
                    {supplier.risk_level}
                  </badge_1.Badge>
                </div>
              </div>
            </div>
            <dropdown_menu_1.DropdownMenu>
              <dropdown_menu_1.DropdownMenuTrigger asChild>
                <button_1.Button variant="ghost" size="sm">
                  <lucide_react_1.MoreVertical className="h-4 w-4" />
                </button_1.Button>
              </dropdown_menu_1.DropdownMenuTrigger>
              <dropdown_menu_1.DropdownMenuContent align="end">
                <dropdown_menu_1.DropdownMenuItem
                  onClick={() =>
                    onSupplierSelect === null || onSupplierSelect === void 0
                      ? void 0
                      : onSupplierSelect(supplier)
                  }
                >
                  <lucide_react_1.Eye className="h-4 w-4 mr-2" />
                  Visualizar
                </dropdown_menu_1.DropdownMenuItem>
                <dropdown_menu_1.DropdownMenuItem
                  onClick={() =>
                    onSupplierEdit === null || onSupplierEdit === void 0
                      ? void 0
                      : onSupplierEdit(supplier)
                  }
                >
                  <lucide_react_1.Edit className="h-4 w-4 mr-2" />
                  Editar
                </dropdown_menu_1.DropdownMenuItem>
                <dropdown_menu_1.DropdownMenuSeparator />
                <dropdown_menu_1.DropdownMenuItem
                  onClick={() =>
                    onSupplierDelete === null || onSupplierDelete === void 0
                      ? void 0
                      : onSupplierDelete(supplier)
                  }
                  className="text-red-600"
                >
                  <lucide_react_1.Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </dropdown_menu_1.DropdownMenuItem>
              </dropdown_menu_1.DropdownMenuContent>
            </dropdown_menu_1.DropdownMenu>
          </div>

          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Performance</span>
              <div className="flex items-center gap-1">
                <span className="font-medium">{supplier.performance_score || 0}%</span>
                {getPerformanceTrend(supplier.performance_score || 0).icon}
              </div>
            </div>
            <progress_1.Progress value={supplier.performance_score || 0} className="h-1" />

            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <lucide_react_1.Star className="h-3 w-3 fill-current text-yellow-400" />
                <span>{supplier.quality_rating || 0}/5</span>
              </div>
              <div className="flex items-center gap-1">
                <lucide_react_1.Phone className="h-3 w-3" />
                <span>
                  {((_a = supplier.primary_contact) === null || _a === void 0
                    ? void 0
                    : _a.phone) || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    );
  };
  var renderSupplierRow = (supplier) => {
    var _a, _b;
    return (
      <table_1.TableRow
        key={supplier.id}
        className={(0, utils_1.cn)(
          "cursor-pointer hover:bg-gray-50",
          selectedSuppliers.includes(supplier.id) && "bg-blue-50",
        )}
        onClick={() =>
          onSupplierSelect === null || onSupplierSelect === void 0
            ? void 0
            : onSupplierSelect(supplier)
        }
      >
        {selectable && (
          <table_1.TableCell>
            <checkbox_1.Checkbox
              checked={selectedSuppliers.includes(supplier.id)}
              onCheckedChange={() => handleSelectSupplier(supplier.id)}
              onClick={(e) => e.stopPropagation()}
            />
          </table_1.TableCell>
        )}

        <table_1.TableCell>
          <div className="flex items-center space-x-3">
            <avatar_1.Avatar className="h-8 w-8">
              <avatar_1.AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                {supplier.name.substring(0, 2).toUpperCase()}
              </avatar_1.AvatarFallback>
            </avatar_1.Avatar>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm">{supplier.name}</p>
                <span className="text-xs">{getCategoryIcon(supplier.category)}</span>
              </div>
              <p className="text-xs text-gray-500">{supplier.legal_name}</p>
            </div>
          </div>
        </table_1.TableCell>

        <table_1.TableCell>
          <badge_1.Badge
            variant="secondary"
            className={(0, utils_1.cn)("text-xs", getStatusColor(supplier.status))}
          >
            {getStatusIcon(supplier.status)}
            <span className="ml-1">{supplier.status}</span>
          </badge_1.Badge>
        </table_1.TableCell>

        <table_1.TableCell>
          <badge_1.Badge
            variant="outline"
            className={(0, utils_1.cn)("text-xs", getRiskColor(supplier.risk_level))}
          >
            {supplier.risk_level}
          </badge_1.Badge>
        </table_1.TableCell>

        <table_1.TableCell>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <progress_1.Progress value={supplier.performance_score || 0} className="h-2" />
            </div>
            <span className="text-sm font-medium w-12 text-right">
              {supplier.performance_score || 0}%
            </span>
            {getPerformanceTrend(supplier.performance_score || 0).icon}
          </div>
        </table_1.TableCell>

        <table_1.TableCell>
          <div className="flex items-center gap-1">
            <lucide_react_1.Star className="h-3 w-3 fill-current text-yellow-400" />
            <span className="text-sm">{supplier.quality_rating || 0}/5</span>
          </div>
        </table_1.TableCell>

        <table_1.TableCell>
          <div className="text-sm space-y-1">
            <div className="flex items-center gap-1 text-gray-600">
              <lucide_react_1.Mail className="h-3 w-3" />
              <span className="truncate max-w-[120px]">
                {((_a = supplier.primary_contact) === null || _a === void 0 ? void 0 : _a.email) ||
                  "N/A"}
              </span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <lucide_react_1.Phone className="h-3 w-3" />
              <span>
                {((_b = supplier.primary_contact) === null || _b === void 0 ? void 0 : _b.phone) ||
                  "N/A"}
              </span>
            </div>
          </div>
        </table_1.TableCell>

        <table_1.TableCell>
          <dropdown_menu_1.DropdownMenu>
            <dropdown_menu_1.DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <button_1.Button variant="ghost" size="sm">
                <lucide_react_1.MoreVertical className="h-4 w-4" />
              </button_1.Button>
            </dropdown_menu_1.DropdownMenuTrigger>
            <dropdown_menu_1.DropdownMenuContent align="end">
              <dropdown_menu_1.DropdownMenuItem
                onClick={() =>
                  onSupplierSelect === null || onSupplierSelect === void 0
                    ? void 0
                    : onSupplierSelect(supplier)
                }
              >
                <lucide_react_1.Eye className="h-4 w-4 mr-2" />
                Visualizar
              </dropdown_menu_1.DropdownMenuItem>
              <dropdown_menu_1.DropdownMenuItem
                onClick={() =>
                  onSupplierEdit === null || onSupplierEdit === void 0
                    ? void 0
                    : onSupplierEdit(supplier)
                }
              >
                <lucide_react_1.Edit className="h-4 w-4 mr-2" />
                Editar
              </dropdown_menu_1.DropdownMenuItem>
              <dropdown_menu_1.DropdownMenuSeparator />
              <dropdown_menu_1.DropdownMenuItem
                onClick={() =>
                  onSupplierDelete === null || onSupplierDelete === void 0
                    ? void 0
                    : onSupplierDelete(supplier)
                }
                className="text-red-600"
              >
                <lucide_react_1.Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </dropdown_menu_1.DropdownMenuItem>
            </dropdown_menu_1.DropdownMenuContent>
          </dropdown_menu_1.DropdownMenu>
        </table_1.TableCell>
      </table_1.TableRow>
    );
  };
  // ============================================================================
  // LOADING STATE
  // ============================================================================
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <skeleton_1.Skeleton className="h-8 w-48" />
          <skeleton_1.Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <card_1.Card key={i}>
              <card_1.CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <skeleton_1.Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <skeleton_1.Skeleton className="h-4 w-32" />
                    <skeleton_1.Skeleton className="h-3 w-24" />
                    <div className="flex gap-2">
                      <skeleton_1.Skeleton className="h-5 w-16" />
                      <skeleton_1.Skeleton className="h-5 w-12" />
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  <skeleton_1.Skeleton className="h-2 w-full" />
                  <div className="flex justify-between">
                    <skeleton_1.Skeleton className="h-3 w-16" />
                    <skeleton_1.Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          ))}
        </div>
      </div>
    );
  }
  // ============================================================================
  // ERROR STATE
  // ============================================================================
  if (error) {
    return (
      <card_1.Card>
        <card_1.CardContent className="p-6 text-center">
          <lucide_react_1.AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar fornecedores</h3>
          <p className="text-gray-500 mb-4">
            Ocorreu um erro ao carregar a lista de fornecedores. Tente novamente.
          </p>
          <button_1.Button onClick={() => refetch()} variant="outline">
            <lucide_react_1.RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </button_1.Button>
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold">{statistics.total}</p>
              </div>
              <lucide_react_1.Users className="h-8 w-8 text-blue-500" />
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ativos</p>
                <p className="text-2xl font-bold text-green-600">{statistics.active}</p>
              </div>
              <lucide_react_1.CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Performance Média</p>
                <p className="text-2xl font-bold">{Math.round(statistics.averagePerformance)}%</p>
              </div>
              <lucide_react_1.TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Alto Risco</p>
                <p className="text-2xl font-bold text-red-600">{statistics.highRisk}</p>
              </div>
              <lucide_react_1.AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Filters and Actions */}
      <card_1.Card>
        <card_1.CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <lucide_react_1.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input_1.Input
                placeholder="Buscar fornecedores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <select_1.Select
                value={selectedCategories[0] || "all"}
                onValueChange={(value) => setSelectedCategories(value === "all" ? [] : [value])}
              >
                <select_1.SelectTrigger className="w-40">
                  <select_1.SelectValue placeholder="Categoria" />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="all">Todas</select_1.SelectItem>
                  {Object.values(supplier_1.SupplierCategory).map((category) => (
                    <select_1.SelectItem key={category} value={category}>
                      {getCategoryIcon(category)} {category}
                    </select_1.SelectItem>
                  ))}
                </select_1.SelectContent>
              </select_1.Select>

              <select_1.Select
                value={selectedStatuses[0] || "all"}
                onValueChange={(value) => setSelectedStatuses(value === "all" ? [] : [value])}
              >
                <select_1.SelectTrigger className="w-32">
                  <select_1.SelectValue placeholder="Status" />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="all">Todos</select_1.SelectItem>
                  {Object.values(supplier_1.SupplierStatus).map((status) => (
                    <select_1.SelectItem key={status} value={status}>
                      {getStatusIcon(status)} {status}
                    </select_1.SelectItem>
                  ))}
                </select_1.SelectContent>
              </select_1.Select>

              <select_1.Select
                value={selectedRiskLevels[0] || "all"}
                onValueChange={(value) => setSelectedRiskLevels(value === "all" ? [] : [value])}
              >
                <select_1.SelectTrigger className="w-32">
                  <select_1.SelectValue placeholder="Risco" />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="all">Todos</select_1.SelectItem>
                  {Object.values(supplier_1.RiskLevel).map((risk) => (
                    <select_1.SelectItem key={risk} value={risk}>
                      {risk}
                    </select_1.SelectItem>
                  ))}
                </select_1.SelectContent>
              </select_1.Select>

              {hasActiveFilters && (
                <button_1.Button variant="outline" onClick={clearFilters} size="sm">
                  Limpar
                </button_1.Button>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button_1.Button onClick={() => refetch()} variant="outline" size="sm">
                <lucide_react_1.RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </button_1.Button>

              {onSupplierCreate && (
                <button_1.Button onClick={onSupplierCreate} size="sm">
                  <lucide_react_1.Plus className="h-4 w-4 mr-2" />
                  Novo Fornecedor
                </button_1.Button>
              )}
            </div>
          </div>

          {/* Bulk Actions */}
          {selectable && selectedSuppliers.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">
                  {selectedSuppliers.length} fornecedor(es) selecionado(s)
                </span>
                <div className="flex gap-2">
                  <button_1.Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction("activate")}
                  >
                    Ativar
                  </button_1.Button>
                  <button_1.Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction("deactivate")}
                  >
                    Desativar
                  </button_1.Button>
                  <button_1.Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction("delete")}
                    className="text-red-600 hover:text-red-700"
                  >
                    Excluir
                  </button_1.Button>
                </div>
              </div>
            </div>
          )}
        </card_1.CardContent>
      </card_1.Card>

      {/* Suppliers List */}
      {viewMode === "cards"
        ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedSuppliers.map(renderSupplierCard)}
          </div>
        : <card_1.Card>
            <table_1.Table>
              <table_1.TableHeader>
                <table_1.TableRow>
                  {selectable && (
                    <table_1.TableHead className="w-12">
                      <checkbox_1.Checkbox
                        checked={
                          selectedSuppliers.length === sortedSuppliers.length &&
                          sortedSuppliers.length > 0
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </table_1.TableHead>
                  )}
                  <table_1.TableHead
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center gap-1">
                      Fornecedor
                      {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                    </div>
                  </table_1.TableHead>
                  <table_1.TableHead
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center gap-1">
                      Status
                      {sortBy === "status" && (sortOrder === "asc" ? "↑" : "↓")}
                    </div>
                  </table_1.TableHead>
                  <table_1.TableHead
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("risk")}
                  >
                    <div className="flex items-center gap-1">
                      Risco
                      {sortBy === "risk" && (sortOrder === "asc" ? "↑" : "↓")}
                    </div>
                  </table_1.TableHead>
                  <table_1.TableHead
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("performance")}
                  >
                    <div className="flex items-center gap-1">
                      Performance
                      {sortBy === "performance" && (sortOrder === "asc" ? "↑" : "↓")}
                    </div>
                  </table_1.TableHead>
                  <table_1.TableHead>Qualidade</table_1.TableHead>
                  <table_1.TableHead>Contato</table_1.TableHead>
                  <table_1.TableHead className="w-12"></table_1.TableHead>
                </table_1.TableRow>
              </table_1.TableHeader>
              <table_1.TableBody>{sortedSuppliers.map(renderSupplierRow)}</table_1.TableBody>
            </table_1.Table>
          </card_1.Card>}

      {/* Empty State */}
      {sortedSuppliers.length === 0 && !isLoading && (
        <card_1.Card>
          <card_1.CardContent className="p-12 text-center">
            <lucide_react_1.Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum fornecedor encontrado</h3>
            <p className="text-gray-500 mb-4">
              {hasActiveFilters
                ? "Tente ajustar os filtros para encontrar fornecedores."
                : "Comece criando seu primeiro fornecedor."}
            </p>
            {!hasActiveFilters && onSupplierCreate && (
              <button_1.Button onClick={onSupplierCreate}>
                <lucide_react_1.Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Fornecedor
              </button_1.Button>
            )}
          </card_1.CardContent>
        </card_1.Card>
      )}
    </div>
  );
}
